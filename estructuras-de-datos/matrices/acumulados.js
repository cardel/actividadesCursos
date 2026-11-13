/* Ejercicio interactivo: la tabla de acumulados de una matriz y la suma de
   un rectangulo con cuatro terminos. */
var EJERCICIO = (function () {
  var MATRIZ_108 = [
    [0, -2, -7, 0],
    [9, 2, -6, 2],
    [-4, 1, -4, 1],
    [-1, 8, 0, -2]
  ];

  /* S tiene una fila y una columna de mas, en ceros: S[i][j] es la suma de
     A[0..i-1][0..j-1]. */
  function acumulados(a) {
    var n = a.length;
    var m = a[0].length;
    var s = [];
    var i, j;
    for (i = 0; i <= n; i = i + 1) {
      s.push([]);
      for (j = 0; j <= m; j = j + 1) {
        var v = 0;
        if (i > 0 && j > 0) {
          v = a[i - 1][j - 1] + s[i - 1][j] + s[i][j - 1] - s[i - 1][j - 1];
        }
        s[i].push(v);
      }
    }
    return s;
  }

  /* Suma de A[f1..f2][c1..c2] con los cuatro terminos. */
  function sumaRect(s, f1, c1, f2, c2) {
    return s[f2 + 1][c2 + 1] - s[f1][c2 + 1] - s[f2 + 1][c1] + s[f1][c1];
  }

  function sumaDirecta(a, f1, c1, f2, c2) {
    var t = 0;
    var i, j;
    for (i = f1; i <= f2; i = i + 1) {
      for (j = c1; j <= c2; j = j + 1) {
        t = t + a[i][j];
      }
    }
    return t;
  }

  /* Todos los rectangulos, cada uno con sus cuatro terminos. */
  function mejorRect(a) {
    var s = acumulados(a);
    var n = a.length;
    var m = a[0].length;
    var r = { suma: a[0][0], f1: 0, c1: 0, f2: 0, c2: 0, revisados: 0 };
    var f1, c1, f2, c2;
    for (f1 = 0; f1 < n; f1 = f1 + 1) {
      for (f2 = f1; f2 < n; f2 = f2 + 1) {
        for (c1 = 0; c1 < m; c1 = c1 + 1) {
          for (c2 = c1; c2 < m; c2 = c2 + 1) {
            var t = sumaRect(s, f1, c1, f2, c2);
            r.revisados = r.revisados + 1;
            if (t > r.suma) {
              r.suma = t;
              r.f1 = f1; r.c1 = c1; r.f2 = f2; r.c2 = c2;
            }
          }
        }
      }
    }
    return r;
  }

  /* Lo mismo sumando celda por celda; solo para comprobar. */
  function mejorBruto(a) {
    var n = a.length;
    var m = a[0].length;
    var mejor = a[0][0];
    var celdas = 0;
    var f1, c1, f2, c2;
    for (f1 = 0; f1 < n; f1 = f1 + 1) {
      for (f2 = f1; f2 < n; f2 = f2 + 1) {
        for (c1 = 0; c1 < m; c1 = c1 + 1) {
          for (c2 = c1; c2 < m; c2 = c2 + 1) {
            var t = sumaDirecta(a, f1, c1, f2, c2);
            celdas = celdas + (f2 - f1 + 1) * (c2 - c1 + 1);
            if (t > mejor) { mejor = t; }
          }
        }
      }
    }
    return { suma: mejor, celdas: celdas };
  }

  /* azar() devuelve un numero en [0, 1), como Math.random. */
  function aleatoria(n, azar) {
    var a = [];
    var i, j;
    for (i = 0; i < n; i = i + 1) {
      a.push([]);
      for (j = 0; j < n; j = j + 1) {
        a[i].push(Math.floor(azar() * 19) - 9);
      }
    }
    return a;
  }

  return { matriz108: MATRIZ_108, acumulados: acumulados, sumaRect: sumaRect,
           sumaDirecta: sumaDirecta, mejorRect: mejorRect, mejorBruto: mejorBruto,
           aleatoria: aleatoria };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var estado = { a: [], s: [], llenas: {}, esquina: null, rect: null, celda: null };

    function clave(i, j) { return i + "," + j; }

    function totalPorLlenar() {
      return estado.a.length * estado.a[0].length;
    }

    function cuantasLlenas() {
      return Object.keys(estado.llenas).length;
    }

    function limpiarMarcas() {
      document.querySelectorAll(".marca-mas, .marca-menos, .marca-a, .marca-rect, .marca-esquina")
        .forEach(function (el) {
          el.classList.remove("marca-mas", "marca-menos", "marca-a", "marca-rect", "marca-esquina");
        });
    }

    function celdaA(i, j) { return document.getElementById("a-" + i + "-" + j); }
    function celdaS(i, j) { return document.getElementById("s-" + i + "-" + j); }

    function construirA() {
      var t = document.getElementById("tabla-a");
      t.innerHTML = "";
      var n = estado.a.length;
      var m = estado.a[0].length;
      var cab = document.createElement("tr");
      cab.appendChild(document.createElement("th"));
      var i, j;
      for (j = 0; j < m; j = j + 1) {
        var th = document.createElement("th");
        th.textContent = j;
        cab.appendChild(th);
      }
      t.appendChild(cab);
      for (i = 0; i < n; i = i + 1) {
        var fila = document.createElement("tr");
        var thf = document.createElement("th");
        thf.textContent = i;
        fila.appendChild(thf);
        for (j = 0; j < m; j = j + 1) {
          var td = document.createElement("td");
          td.id = "a-" + i + "-" + j;
          td.textContent = estado.a[i][j];
          td.className = "celda-a";
          td.dataset.i = i;
          td.dataset.j = j;
          td.addEventListener("click", clicEnA);
          fila.appendChild(td);
        }
        t.appendChild(fila);
      }
    }

    function construirS() {
      var t = document.getElementById("tabla-s");
      t.innerHTML = "";
      var n = estado.a.length;
      var m = estado.a[0].length;
      var cab = document.createElement("tr");
      cab.appendChild(document.createElement("th"));
      var i, j;
      for (j = 0; j <= m; j = j + 1) {
        var th = document.createElement("th");
        th.textContent = j;
        cab.appendChild(th);
      }
      t.appendChild(cab);
      for (i = 0; i <= n; i = i + 1) {
        var fila = document.createElement("tr");
        var thf = document.createElement("th");
        thf.textContent = i;
        fila.appendChild(thf);
        for (j = 0; j <= m; j = j + 1) {
          var td = document.createElement("td");
          td.id = "s-" + i + "-" + j;
          if (i === 0 || j === 0) {
            td.textContent = "0";
            td.className = "borde-cero";
          } else {
            td.textContent = "?";
            td.className = "casilla-s";
            td.dataset.i = i;
            td.dataset.j = j;
            td.addEventListener("click", elegirCelda);
          }
          fila.appendChild(td);
        }
        t.appendChild(fila);
      }
    }

    function fijarCelda(i, j) {
      var td = celdaS(i, j);
      td.innerHTML = "";
      td.textContent = estado.s[i][j];
      td.classList.add("llena");
      estado.llenas[clave(i, j)] = true;
    }

    function mostrarFormulaCelda(i, j) {
      limpiarMarcas();
      celdaA(i - 1, j - 1).classList.add("marca-a");
      celdaS(i - 1, j).classList.add("marca-mas");
      celdaS(i, j - 1).classList.add("marca-mas");
      celdaS(i - 1, j - 1).classList.add("marca-menos");
      document.getElementById("formula-celda").innerHTML =
        "S[" + i + "][" + j + "] = <span class='t-a'>A[" + (i - 1) + "][" + (j - 1) + "]</span>" +
        " + <span class='t-mas'>S[" + (i - 1) + "][" + j + "]</span>" +
        " + <span class='t-mas'>S[" + i + "][" + (j - 1) + "]</span>" +
        " - <span class='t-menos'>S[" + (i - 1) + "][" + (j - 1) + "]</span>";
    }

    function elegirCelda() {
      var i = parseInt(this.dataset.i, 10);
      var j = parseInt(this.dataset.j, 10);
      if (estado.llenas[clave(i, j)]) { return; }
      estado.celda = [i, j];
      mostrarFormulaCelda(i, j);
      celdaS(i, j).classList.add("marca-esquina");
      document.getElementById("pregunta-celda").textContent = "S[" + i + "][" + j +
        "] vale:";
      document.getElementById("zona-celda").style.display = "flex";
      opcionesCelda.refrescar();
    }

    function opcionesTabla() {
      var lista = [];
      if (estado.celda === null) { return lista; }
      var i = estado.celda[0], j = estado.celda[1];
      var s = estado.s;
      var a = estado.a[i - 1][j - 1];
      var arriba = s[i - 1][j], izq = s[i][j - 1], diag = s[i - 1][j - 1];
      var nombre = "S[" + i + "][" + j + "]";
      var aSig = estado.a[Math.min(i, estado.a.length - 1)][Math.min(j, estado.a[0].length - 1)];
      lista.push({ valor: s[i][j], clave: "correcta",
        razon: "Correcto: " + nombre + " = " + a + " + (" + arriba + ") + (" + izq + ") - (" +
          diag + ") = " + s[i][j] + ". Van " + (cuantasLlenas() + 1) + " de " +
          totalPorLlenar() + "." });
      var candidatas = [
        { valor: a + arriba + izq, clave: "sin-resta",
          razon: "Falta restar S[" + (i - 1) + "][" + (j - 1) + "]: la esquina de arriba a la " +
            "izquierda está dentro del acumulado de arriba y también dentro del de la " +
            "izquierda, y quedó contada dos veces." },
        { valor: a + arriba + izq + diag, clave: "suma-diagonal",
          razon: "S[" + (i - 1) + "][" + (j - 1) + "] se resta, no se suma: ya viene " +
            "incluida en los otros dos acumulados." },
        { valor: arriba + izq - diag, clave: "sin-celda",
          razon: "Falta la celda A[" + (i - 1) + "][" + (j - 1) + "]: los acumulados de arriba " +
            "y de la izquierda no la incluyen." },
        { valor: a, clave: "solo-celda",
          razon: "Eso es el valor de la celda de A, no el acumulado; S suma todo lo que " +
            "queda arriba y a la izquierda." },
        { valor: a + arriba, clave: "solo-arriba",
          razon: "Solo se tomó el acumulado de arriba; falta el de la izquierda y quitar " +
            "la esquina que los dos comparten." },
        { valor: a + izq, clave: "solo-izquierda",
          razon: "Solo se tomó el acumulado de la izquierda; falta el de arriba y quitar " +
            "la esquina que los dos comparten." },
        { valor: aSig + arriba + izq - diag, clave: "indice-a",
          razon: "La celda de A que entra en " + nombre + " es A[" + (i - 1) + "][" + (j - 1) +
            "], no A[" + Math.min(i, estado.a.length - 1) + "][" +
            Math.min(j, estado.a[0].length - 1) + "]: la tabla S va corrida una fila y " +
            "una columna." },
        { valor: i * j, clave: "cuenta-celdas",
          razon: "Eso es cuántas celdas de A caen arriba y a la izquierda, no lo que suman." },
        { valor: diag, clave: "esquina-vieja",
          razon: "Ese es el acumulado anterior en la diagonal, S[" + (i - 1) + "][" + (j - 1) +
            "]; falta sumar la celda nueva y los dos acumulados vecinos, y descontar la esquina." }
      ];
      candidatas.forEach(function (o) {
        var repetida = lista.some(function (p) { return p.valor === o.valor; });
        if (!repetida && lista.length < 4) { lista.push(o); }
      });
      return lista;
    }

    var opcionesCelda = Motor.opcionesNumericas("opciones-celda", "veredicto-tabla",
      opcionesTabla);

    document.getElementById("opciones-celda").addEventListener("click", function (ev) {
      var b = ev.target;
      if (estado.celda !== null && b && b.getAttribute && b.getAttribute("data-op") === "correcta") {
        fijarCelda(estado.celda[0], estado.celda[1]);
        estado.celda = null;
        limpiarMarcas();
        document.getElementById("zona-celda").style.display = "none";
        revisarCompleta();
      }
    });

    function revisarCompleta() {
      if (cuantasLlenas() === totalPorLlenar()) {
        limpiarMarcas();
        document.getElementById("formula-celda").textContent =
          "La tabla está completa. Pase a la consulta.";
        document.getElementById("carta-consulta").classList.remove("apagada");
        document.getElementById("estado-consulta").textContent =
          "Haga clic en una esquina del rectángulo dentro de la matriz A.";
      }
    }

    function llenarResto() {
      var n = estado.a.length;
      var m = estado.a[0].length;
      var i, j;
      for (i = 1; i <= n; i = i + 1) {
        for (j = 1; j <= m; j = j + 1) {
          if (!estado.llenas[clave(i, j)]) { fijarCelda(i, j); }
        }
      }
      estado.celda = null;
      document.getElementById("zona-celda").style.display = "none";
      document.getElementById("veredicto-tabla").className = "veredicto";
      revisarCompleta();
    }

    function clicEnA() {
      if (cuantasLlenas() < totalPorLlenar()) {
        var ver = document.getElementById("veredicto-tabla");
        ver.className = "veredicto mal";
        ver.textContent = "Primero llene la tabla de acumulados.";
        return;
      }
      var i = parseInt(this.dataset.i, 10);
      var j = parseInt(this.dataset.j, 10);
      if (estado.esquina === null) {
        limpiarMarcas();
        estado.esquina = [i, j];
        estado.rect = null;
        this.classList.add("marca-esquina");
        document.getElementById("formula-rect").innerHTML = "";
        document.getElementById("zona-consulta").style.display = "none";
        document.getElementById("veredicto-consulta").className = "veredicto";
        document.getElementById("estado-consulta").textContent =
          "Esquina A[" + i + "][" + j + "]. Haga clic en la esquina opuesta.";
      } else {
        var f1 = Math.min(estado.esquina[0], i);
        var f2 = Math.max(estado.esquina[0], i);
        var c1 = Math.min(estado.esquina[1], j);
        var c2 = Math.max(estado.esquina[1], j);
        estado.esquina = null;
        estado.rect = [f1, c1, f2, c2];
        mostrarRect(f1, c1, f2, c2);
        opcionesConsulta.refrescar();
      }
    }

    function mostrarRect(f1, c1, f2, c2) {
      limpiarMarcas();
      var i, j;
      for (i = f1; i <= f2; i = i + 1) {
        for (j = c1; j <= c2; j = j + 1) {
          celdaA(i, j).classList.add("marca-rect");
        }
      }
      celdaS(f2 + 1, c2 + 1).classList.add("marca-mas");
      celdaS(f1, c1).classList.add("marca-mas");
      celdaS(f1, c2 + 1).classList.add("marca-menos");
      celdaS(f2 + 1, c1).classList.add("marca-menos");
      document.getElementById("estado-consulta").textContent =
        "Rectángulo A[" + f1 + ".." + f2 + "][" + c1 + ".." + c2 + "]. Haga clic de nuevo " +
        "para escoger otro.";
      document.getElementById("formula-rect").innerHTML =
        "suma = <span class='t-mas'>S[" + (f2 + 1) + "][" + (c2 + 1) + "]</span>" +
        " - <span class='t-menos'>S[" + f1 + "][" + (c2 + 1) + "]</span>" +
        " - <span class='t-menos'>S[" + (f2 + 1) + "][" + c1 + "]</span>" +
        " + <span class='t-mas'>S[" + f1 + "][" + c1 + "]</span>";
      document.getElementById("zona-consulta").style.display = "flex";
      document.getElementById("veredicto-consulta").className = "veredicto";
    }

    function opcionesSuma() {
      var lista = [];
      if (estado.rect === null) { return lista; }
      var f1 = estado.rect[0], c1 = estado.rect[1], f2 = estado.rect[2], c2 = estado.rect[3];
      var s = estado.s;
      var total = EJERCICIO.sumaRect(s, f1, c1, f2, c2);
      var celdas = (f2 - f1 + 1) * (c2 - c1 + 1);
      var numerica = s[f2 + 1][c2 + 1] + " - (" + s[f1][c2 + 1] + ") - (" + s[f2 + 1][c1] +
        ") + (" + s[f1][c1] + ") = " + total;
      lista.push({ valor: total, clave: "correcta",
        razon: "Correcto: " + numerica + ". Sumando celda por celda serían " +
          celdas + " lecturas de A, y da " + EJERCICIO.sumaDirecta(estado.a, f1, c1, f2, c2) +
          "; con la tabla son cuatro, sea cual sea el tamaño del rectángulo." });
      var candidatas = [
        { valor: s[f2 + 1][c2 + 1] - s[f1][c2 + 1] - s[f2 + 1][c1], clave: "sin-esquina",
          razon: "Falta el término verde pequeño, S[" + f1 + "][" + c1 + "]: las dos restas " +
            "quitaron esa esquina dos veces y hay que devolverla una." },
        { valor: s[f2 + 1][c2 + 1] - s[f1][c2 + 1] - s[f2 + 1][c1] - s[f1][c1], clave: "esquina-resta",
          razon: "La esquina S[" + f1 + "][" + c1 + "] se suma, no se resta: está dentro de " +
            "las dos franjas que ya se quitaron." },
        { valor: s[f2 + 1][c2 + 1] + s[f1][c2 + 1] + s[f2 + 1][c1] + s[f1][c1], clave: "todo-suma",
          razon: "Los dos términos en rojo restan: son la franja de arriba y la de " +
            "la izquierda, que no pertenecen al rectángulo." },
        { valor: s[f2 + 1][c2 + 1], clave: "solo-grande",
          razon: "Ese es todo lo que queda arriba y a la izquierda de la esquina inferior; " +
            "incluye las franjas que el rectángulo no cubre." },
        { valor: s[f2][c2] - s[f1][c2] - s[f2][c1] + s[f1][c1], clave: "sin-mas-uno",
          razon: "Los índices de la esquina inferior van con +1: S[i][j] suma hasta la " +
            "fila i-1 y la columna j-1, así que el rectángulo termina en S[" + (f2 + 1) +
            "][" + (c2 + 1) + "]." },
        { valor: s[f2 + 1][c2 + 1] - s[f1][c2 + 1], clave: "una-resta",
          razon: "Solo se quitó la franja de arriba; falta la de la izquierda, y después " +
            "devolver la esquina que las dos quitaron." },
        { valor: s[f2 + 1][c2 + 1] - s[f2 + 1][c1], clave: "una-resta-izq",
          razon: "Solo se quitó la franja de la izquierda; falta la de arriba, y después " +
            "devolver la esquina que las dos quitaron." },
        { valor: estado.a[f1][c1] + estado.a[f2][c2], clave: "esquinas",
          razon: "Eso suma solo las dos esquinas de A. El rectángulo tiene " + celdas +
            " celdas y la tabla las resume todas." },
        { valor: total + estado.a[f1][c1], clave: "esquina-doble",
          razon: "La celda A[" + f1 + "][" + c1 + "] quedó contada dos veces: ya está dentro " +
            "de S[" + (f2 + 1) + "][" + (c2 + 1) + "]." },
        { valor: celdas, clave: "cuenta-celdas",
          razon: "Eso es cuántas celdas tiene el rectángulo, no lo que suman." },
        { valor: 4, clave: "cuenta-terminos",
          razon: "Cuatro son las lecturas de S que hace la consulta, no el valor de la suma." }
      ];
      candidatas.forEach(function (o) {
        var repetida = lista.some(function (p) { return p.valor === o.valor; });
        if (!repetida && lista.length < 4) { lista.push(o); }
      });
      return lista;
    }

    var opcionesConsulta = Motor.opcionesNumericas("opciones-suma", "veredicto-consulta",
      opcionesSuma);

    function buscarMejor() {
      var r = EJERCICIO.mejorRect(estado.a);
      var n = estado.a.length;
      estado.rect = null;
      estado.esquina = null;
      mostrarRect(r.f1, r.c1, r.f2, r.c2);
      estado.rect = [r.f1, r.c1, r.f2, r.c2];
      opcionesConsulta.refrescar();
      document.getElementById("dato-mejor").innerHTML = "El mejor rectángulo es A[" + r.f1 +
        ".." + r.f2 + "][" + r.c1 + ".." + r.c2 + "], con suma <b>" + r.suma + "</b>. Se " +
        "revisaron " + r.revisados + " rectángulos con cuatro términos cada uno; sumando " +
        "celda por celda habrían sido " + EJERCICIO.mejorBruto(estado.a).celdas +
        " lecturas de A para esta matriz de " + n + " por " + n + ".";
      document.getElementById("carta-cierre").style.display = "block";
    }

    function cargar(a) {
      estado.a = a;
      estado.s = EJERCICIO.acumulados(a);
      estado.llenas = {};
      estado.esquina = null;
      estado.rect = null;
      estado.celda = null;
      construirA();
      construirS();
      document.getElementById("zona-celda").style.display = "none";
      opcionesCelda.refrescar();
      opcionesConsulta.refrescar();
      document.getElementById("carta-consulta").classList.add("apagada");
      document.getElementById("zona-consulta").style.display = "none";
      document.getElementById("formula-rect").innerHTML = "";
      document.getElementById("estado-consulta").textContent =
        "Se abre cuando la tabla esté completa.";
      document.getElementById("formula-celda").textContent =
        "Haga clic en una casilla vacía de S para ver de qué se forma.";
      ["veredicto-tabla", "veredicto-consulta"].forEach(function (id) {
        document.getElementById(id).className = "veredicto";
      });
      document.getElementById("dato-mejor").textContent = "";
      document.getElementById("carta-cierre").style.display = "none";
    }

    document.getElementById("btn-108").addEventListener("click", function () {
      cargar(EJERCICIO.matriz108);
    });
    document.getElementById("btn-otra").addEventListener("click", function () {
      cargar(EJERCICIO.aleatoria(4, Math.random));
    });
    document.getElementById("btn-llenar").addEventListener("click", llenarResto);
    document.getElementById("btn-mejor").addEventListener("click", function () {
      if (cuantasLlenas() === totalPorLlenar()) { buscarMejor(); }
    });

    cargar(EJERCICIO.matriz108);
  })();
}
