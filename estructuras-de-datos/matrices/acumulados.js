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
    var estado = { a: [], s: [], llenas: {}, esquina: null, rect: null };

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
            var inp = document.createElement("input");
            inp.type = "number";
            inp.className = "entrada-s";
            inp.dataset.i = i;
            inp.dataset.j = j;
            inp.addEventListener("focus", enfocar);
            inp.addEventListener("change", revisarCelda);
            inp.addEventListener("keydown", function (ev) {
              if (ev.key === "Enter") { revisarCelda.call(this); }
            });
            td.appendChild(inp);
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

    function enfocar() {
      mostrarFormulaCelda(parseInt(this.dataset.i, 10), parseInt(this.dataset.j, 10));
    }

    function revisarCelda() {
      var i = parseInt(this.dataset.i, 10);
      var j = parseInt(this.dataset.j, 10);
      var v = parseInt(this.value, 10);
      var ver = document.getElementById("veredicto-tabla");
      if (isNaN(v)) { return; }
      if (v === estado.s[i][j]) {
        fijarCelda(i, j);
        ver.className = "veredicto bien";
        ver.textContent = "S[" + i + "][" + j + "] = " + v + ". Van " + cuantasLlenas() +
          " de " + totalPorLlenar() + ".";
        revisarCompleta();
      } else {
        this.classList.add("errada");
        ver.className = "veredicto mal";
        ver.textContent = "S[" + i + "][" + j + "] no es " + v + ". Sume la celda de A con el " +
          "acumulado de arriba y el de la izquierda; la esquina de arriba a la izquierda " +
          "quedó contada dos veces.";
      }
    }

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
      document.getElementById("pred-suma").value = "";
      document.getElementById("zona-consulta").style.display = "flex";
      document.getElementById("veredicto-consulta").className = "veredicto";
    }

    function comprobarConsulta() {
      var ver = document.getElementById("veredicto-consulta");
      var v = parseInt(document.getElementById("pred-suma").value, 10);
      if (estado.rect === null) { return; }
      var f1 = estado.rect[0], c1 = estado.rect[1], f2 = estado.rect[2], c2 = estado.rect[3];
      var s = estado.s;
      var total = EJERCICIO.sumaRect(s, f1, c1, f2, c2);
      var celdas = (f2 - f1 + 1) * (c2 - c1 + 1);
      var numerica = s[f2 + 1][c2 + 1] + " - (" + s[f1][c2 + 1] + ") - (" + s[f2 + 1][c1] +
        ") + (" + s[f1][c1] + ") = " + total;
      if (isNaN(v)) {
        ver.className = "veredicto mal";
        ver.textContent = "Escriba la suma que dan los cuatro términos.";
      } else if (v === total) {
        ver.className = "veredicto bien";
        ver.textContent = "Correcto: " + numerica + ". Sumando celda por celda serían " +
          celdas + " lecturas de A, y da " + EJERCICIO.sumaDirecta(estado.a, f1, c1, f2, c2) +
          "; con la tabla son cuatro, sea cual sea el tamaño del rectángulo.";
      } else {
        ver.className = "veredicto mal";
        ver.textContent = "No es " + v + ". Lea los cuatro valores resaltados en S: el verde " +
          "grande es todo lo que queda arriba y a la izquierda de la esquina inferior; los dos " +
          "rojos quitan la franja de arriba y la de la izquierda, y el verde pequeño devuelve " +
          "lo que se quitó dos veces.";
      }
    }

    function buscarMejor() {
      var r = EJERCICIO.mejorRect(estado.a);
      var n = estado.a.length;
      estado.rect = null;
      estado.esquina = null;
      mostrarRect(r.f1, r.c1, r.f2, r.c2);
      estado.rect = [r.f1, r.c1, r.f2, r.c2];
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
      construirA();
      construirS();
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
    document.getElementById("btn-consulta").addEventListener("click", comprobarConsulta);
    document.getElementById("btn-mejor").addEventListener("click", function () {
      if (cuantasLlenas() === totalPorLlenar()) { buscarMejor(); }
    });

    cargar(EJERCICIO.matriz108);
  })();
}
