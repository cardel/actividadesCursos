/* Ejercicio interactivo: el arbol de recursion de tres recurrencias.
   Todo el trabajo se mide en unidades de c, y T(1) = c en las tres. */
var EJERCICIO = (function () {
  var TAMANOS = [2, 4, 8, 16, 32, 64];

  var RECURRENCIAS = {
    resta: {
      rotulo: "T(n) = T(n − 1) + c",
      llamadas: 1,
      clase: "n",
      descripcion: "una llamada sobre n − 1 y trabajo c fuera de ella"
    },
    mitad: {
      rotulo: "T(n) = T(n/2) + c",
      llamadas: 1,
      clase: "log n",
      descripcion: "una llamada sobre la mitad y trabajo c fuera de ella"
    },
    mezcla: {
      rotulo: "T(n) = 2T(n/2) + cn",
      llamadas: 2,
      clase: "n log n",
      descripcion: "dos llamadas sobre las mitades y trabajo cn fuera de ellas"
    }
  };

  function log2(n) {
    var k = 0;
    var x = n;
    while (x > 1) {
      x = x / 2;
      k = k + 1;
    }
    return k;
  }

  /* Tamano del problema de un nodo del nivel i. */
  function tamano(tipo, n, i) {
    return tipo === "resta" ? n - i : n / Math.pow(2, i);
  }

  /* Trabajo de un nodo de tamano m, fuera de sus llamadas, en unidades de c. */
  function trabajoNodo(tipo, m) {
    return tipo === "mezcla" ? m : 1;
  }

  function niveles(tipo, n) {
    return tipo === "resta" ? n : log2(n) + 1;
  }

  /* Filas del arbol por formula: nivel, tamano, nodos, trabajo, costo. */
  function nivelesArbol(tipo, n) {
    var filas = [];
    var L = niveles(tipo, n);
    var i;
    for (i = 0; i < L; i = i + 1) {
      var m = tamano(tipo, n, i);
      var nodos = tipo === "mezcla" ? Math.pow(2, i) : 1;
      var w = trabajoNodo(tipo, m);
      filas.push({ nivel: i, tamano: m, nodos: nodos, trabajo: w, costo: nodos * w });
    }
    return filas;
  }

  function totalFormula(tipo, n) {
    var t;
    if (tipo === "resta") {
      t = n;
    } else if (tipo === "mitad") {
      t = log2(n) + 1;
    } else {
      t = n * (log2(n) + 1);
    }
    return t;
  }

  /* El valor de la recurrencia calculado llamandola, en unidades de c. */
  function evaluar(tipo, n) {
    var v;
    if (n === 1) {
      v = 1;
    } else if (tipo === "resta") {
      v = evaluar(tipo, n - 1) + 1;
    } else if (tipo === "mitad") {
      v = evaluar(tipo, n / 2) + 1;
    } else {
      v = 2 * evaluar(tipo, n / 2) + n;
    }
    return v;
  }

  /* Desarrollo por sustitucion, como lista de renglones. */
  function desarrollo(tipo, n) {
    var lg = log2(n);
    var r;
    if (tipo === "resta") {
      r = ["T(n) = T(n − 1) + c",
           "     = T(n − 2) + 2c",
           "     = T(n − k) + kc",
           "con k = n − 1:  T(n) = T(1) + (n − 1)c = nc",
           "con n = " + n + ":  T(" + n + ") = " + n + "c"];
    } else if (tipo === "mitad") {
      r = ["T(n) = T(n/2) + c",
           "     = T(n/4) + 2c",
           "     = T(n/2^k) + kc",
           "con k = log₂ n:  T(n) = T(1) + c log₂ n = c(log₂ n + 1)",
           "con n = " + n + ":  T(" + n + ") = (" + lg + " + 1)c = " + (lg + 1) + "c"];
    } else {
      r = ["T(n) = 2T(n/2) + cn",
           "     = 4T(n/4) + 2cn",
           "     = 2^k T(n/2^k) + kcn",
           "con k = log₂ n:  T(n) = n T(1) + cn log₂ n = cn(log₂ n + 1)",
           "con n = " + n + ":  T(" + n + ") = " + n + " · (" + lg + " + 1)c = " +
             (n * (lg + 1)) + "c"];
    }
    return r;
  }

  /* Pista para un renglon del arbol. campo: nodos, trabajo o costo. */
  function pistaNivel(tipo, n, i, campo, valor) {
    var fila = nivelesArbol(tipo, n)[i];
    var texto = null;
    if (campo === "nodos" && valor !== fila.nodos) {
      texto = tipo === "mezcla"
        ? "Cada nodo llama dos veces: el nivel " + i + " tiene el doble de nodos que el anterior."
        : "Cada nodo hace una sola llamada, así que cada nivel tiene un solo nodo.";
    } else if (campo === "trabajo" && valor !== fila.trabajo) {
      if (tipo === "mezcla" && valor === n && i > 0) {
        texto = "El trabajo de un nodo depende de su tamaño, no del n de arriba. " +
          "Aquí cada nodo resuelve T(" + fila.tamano + ").";
      } else if (tipo === "mezcla") {
        texto = "Un nodo de tamaño m trabaja cm fuera de sus llamadas; en este nivel m = " +
          fila.tamano + ".";
      } else {
        texto = "Fuera de su llamada cada nodo hace c, y la hoja T(1) también vale c: es 1 en unidades de c.";
      }
    } else if (campo === "costo" && valor !== fila.costo) {
      texto = "El costo del nivel es nodos por trabajo de cada nodo.";
    }
    return texto;
  }

  function pistaNiveles(tipo, n, valor) {
    var L = niveles(tipo, n);
    var texto = null;
    if (valor !== L) {
      if (valor === L - 1) {
        texto = tipo === "resta"
          ? "De n hasta 1 hay n − 1 restas y n niveles: falta contar el de las hojas."
          : "De n hasta 1 hay log₂ n divisiones y log₂ n + 1 niveles: falta contar el de las hojas.";
      } else if (tipo !== "resta" && valor === n) {
        texto = "Partir a la mitad no baja de uno en uno: cuente cuántas veces se divide " + n + " entre 2 hasta llegar a 1.";
      } else {
        texto = "Cuente las filas de la tabla, de la raíz T(" + n + ") a las hojas T(1).";
      }
    }
    return texto;
  }

  function pistaTotal(tipo, n, valor) {
    var filas = nivelesArbol(tipo, n);
    var t = totalFormula(tipo, n);
    var texto = null;
    if (valor !== t) {
      if (valor === t - filas[filas.length - 1].costo) {
        texto = "Falta el nivel de las hojas: también trabajan.";
      } else {
        texto = "Sume la columna del costo de cada nivel.";
      }
    }
    return texto;
  }

  function pistaClase(tipo, eleccion) {
    var correcta = RECURRENCIAS[tipo].clase;
    var texto = null;
    if (eleccion !== correcta) {
      if (tipo === "mezcla" && eleccion === "n") {
        texto = "Cada nivel cuesta n, pero hay log₂ n + 1 niveles: no es uno solo.";
      } else if (tipo === "mezcla" && eleccion === "n²") {
        texto = "Los niveles no crecen: todos cuestan n. Lo que se multiplica es por el número de niveles.";
      } else if (tipo === "mitad" && eleccion === "n") {
        texto = "Hay un nodo por nivel, pero los niveles no son n: el tamaño se parte a la mitad cada vez.";
      } else if (tipo === "resta" && eleccion === "log n") {
        texto = "El tamaño baja de uno en uno, no a la mitad: hay n niveles.";
      } else {
        texto = "Mire el total en función de n: cuántos niveles hay y cuánto cuesta cada uno.";
      }
    }
    return texto;
  }

  return { tamanos: TAMANOS, recurrencias: RECURRENCIAS, log2: log2,
           niveles: niveles, nivelesArbol: nivelesArbol, totalFormula: totalFormula,
           evaluar: evaluar, desarrollo: desarrollo, pistaNivel: pistaNivel,
           pistaNiveles: pistaNiveles, pistaTotal: pistaTotal, pistaClase: pistaClase };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var CLASES = ["1", "log n", "n", "n log n", "n²"];
    var estado = { tipo: "mezcla", n: 8, hechos: 0, revelados: {}, fase: "niveles" };

    function el(id) { return document.getElementById(id); }

    function filas() { return EJERCICIO.nivelesArbol(estado.tipo, estado.n); }

    function pintarSelectores() {
      var caja = el("selector-rec");
      caja.innerHTML = "";
      Object.keys(EJERCICIO.recurrencias).forEach(function (t) {
        var b = document.createElement("button");
        b.textContent = EJERCICIO.recurrencias[t].rotulo;
        if (t === estado.tipo) { b.className = "primario"; }
        b.addEventListener("click", function () { cargar(t, estado.n); });
        caja.appendChild(b);
      });
      var cajaN = el("selector-n");
      cajaN.innerHTML = "";
      EJERCICIO.tamanos.forEach(function (n) {
        var b = document.createElement("button");
        b.textContent = "n = " + n;
        if (n === estado.n) { b.className = "primario"; }
        b.addEventListener("click", function () { cargar(estado.tipo, n); });
        cajaN.appendChild(b);
      });
      el("descripcion").textContent = "Cada llamada sobre un problema de tamaño n > 1 hace " +
        EJERCICIO.recurrencias[estado.tipo].descripcion + "; T(1) = c.";
    }

    /* Una fila del dibujo: los nodos del nivel, recortados si son muchos. */
    function filaDibujo(f) {
      var div = document.createElement("div");
      div.className = "nivel-arbol";
      var rot = document.createElement("span");
      rot.className = "rotulo-nivel";
      rot.textContent = "nivel " + f.nivel;
      div.appendChild(rot);
      var cuantos = f.nodos > 8 ? 4 : f.nodos;
      var j;
      for (j = 0; j < cuantos; j = j + 1) {
        div.appendChild(nodo(f.tamano));
      }
      if (f.nodos > 8) {
        var mas = document.createElement("span");
        mas.className = "puntos";
        mas.textContent = "… " + (f.nodos - 8) + " nodos más …";
        div.appendChild(mas);
        for (j = 0; j < 4; j = j + 1) { div.appendChild(nodo(f.tamano)); }
      }
      return div;
    }

    function nodo(m) {
      var s = document.createElement("span");
      s.className = "nodo-arbol" + (m === 1 ? " hoja" : "");
      s.textContent = "T(" + m + ")";
      return s;
    }

    function pintarDibujo() {
      var caja = el("dibujo");
      caja.innerHTML = "";
      var fs = filas();
      var visibles = fs.slice(0, estado.hechos);
      if (estado.hechos < fs.length) {
        visibles.push(fs[estado.hechos]);
      }
      visibles.forEach(function (f, idx) {
        var mostrar = visibles.length <= 9 || idx < 3 || idx >= visibles.length - 3;
        if (mostrar) {
          caja.appendChild(filaDibujo(f));
        } else if (idx === 3) {
          var d = document.createElement("div");
          d.className = "nivel-arbol";
          d.innerHTML = "<span class=\"rotulo-nivel\">⋮</span><span class=\"puntos\">niveles 3 a " +
            (visibles.length - 4) + ", un nodo cada uno</span>";
          caja.appendChild(d);
        }
      });
    }

    function pintarTabla() {
      var cuerpo = el("tabla-niveles");
      cuerpo.innerHTML = "";
      var fs = filas();
      fs.forEach(function (f, i) {
        var tr = document.createElement("tr");
        var largo = estado.hechos > 9;
        var oculta = largo && i >= 3 && i < estado.hechos - 3;
        if (oculta && i === 3) {
          var td0 = document.createElement("td");
          td0.colSpan = 5;
          td0.className = "pend";
          td0.textContent = "⋮ niveles 3 a " + (estado.hechos - 4) + ", cada uno con " +
            fs[3].nodos + " nodo de trabajo " + fs[3].trabajo + "c y costo " + fs[3].costo + "c";
          tr.appendChild(td0);
          cuerpo.appendChild(tr);
        } else if (oculta) {
          tr = null;
        } else if (i < estado.hechos) {
          [f.nivel, "T(" + f.tamano + ")", f.nodos, f.trabajo + "c", f.costo + "c"]
            .forEach(function (x) {
              var td = document.createElement("td");
              td.textContent = x;
              tr.appendChild(td);
            });
          if (estado.revelados[i]) { tr.className = "revelada"; }
          cuerpo.appendChild(tr);
        } else if (i === estado.hechos) {
          var tds = [f.nivel, "T(" + f.tamano + ")"];
          tds.forEach(function (x) {
            var td = document.createElement("td");
            td.textContent = x;
            tr.appendChild(td);
          });
          ["nodos", "trabajo", "costo"].forEach(function (campo) {
            var td = document.createElement("td");
            var inp = document.createElement("input");
            inp.type = "number";
            inp.id = "in-" + campo;
            inp.className = "celda-num";
            td.appendChild(inp);
            if (campo !== "nodos") { td.appendChild(document.createTextNode(" c")); }
            tr.appendChild(td);
          });
          tr.className = "actual-fila";
          cuerpo.appendChild(tr);
        }
      });
      var faltan = fs.length - estado.hechos;
      el("zona-nivel").style.display = faltan > 0 ? "flex" : "none";
      el("btn-medio").style.display = estado.hechos >= 3 && faltan > 2 ? "inline-block" : "none";
      el("carta-total").style.display = faltan === 0 ? "block" : "none";
    }

    function pintar() {
      pintarSelectores();
      pintarDibujo();
      pintarTabla();
    }

    function comprobarNivel() {
      var i = estado.hechos;
      var v = el("veredicto-nivel");
      var valores = {};
      var pista = null;
      ["nodos", "trabajo", "costo"].forEach(function (campo) {
        valores[campo] = parseInt(el("in-" + campo).value, 10);
        if (pista === null && isNaN(valores[campo])) {
          pista = "Escriba los tres números del nivel.";
        }
        if (pista === null) {
          pista = EJERCICIO.pistaNivel(estado.tipo, estado.n, i, campo, valores[campo]);
        }
      });
      if (pista === null) {
        v.className = "veredicto bien";
        v.textContent = "Nivel " + i + " correcto.";
        estado.hechos = estado.hechos + 1;
        pintar();
      } else {
        v.className = "veredicto mal";
        v.textContent = pista;
      }
    }

    function revelarNivel() {
      var f = filas()[estado.hechos];
      var v = el("veredicto-nivel");
      v.className = "veredicto mal";
      v.textContent = "Nivel " + f.nivel + ": " + f.nodos + " nodos de T(" + f.tamano +
        "), cada uno trabaja " + f.trabajo + "c, el nivel cuesta " + f.costo + "c.";
      estado.revelados[estado.hechos] = true;
      estado.hechos = estado.hechos + 1;
      pintar();
    }

    function llenarMedio() {
      var fs = filas();
      while (estado.hechos < fs.length - 1) {
        estado.revelados[estado.hechos] = true;
        estado.hechos = estado.hechos + 1;
      }
      el("veredicto-nivel").className = "veredicto";
      pintar();
    }

    function comprobarTotal() {
      var v = el("veredicto-total");
      var L = parseInt(el("in-niveles").value, 10);
      var t = parseInt(el("in-total").value, 10);
      var pista = null;
      if (isNaN(L) || isNaN(t)) {
        pista = "Escriba los dos números.";
      } else {
        pista = EJERCICIO.pistaNiveles(estado.tipo, estado.n, L);
        if (pista === null) { pista = EJERCICIO.pistaTotal(estado.tipo, estado.n, t); }
      }
      if (pista === null) {
        v.className = "veredicto bien";
        v.textContent = "Correcto: " + L + " niveles y " + t + "c en total.";
        mostrarDesarrollo();
      } else {
        v.className = "veredicto mal";
        v.textContent = pista;
      }
    }

    function revelarTotal() {
      var v = el("veredicto-total");
      v.className = "veredicto mal";
      v.textContent = EJERCICIO.niveles(estado.tipo, estado.n) + " niveles y " +
        EJERCICIO.totalFormula(estado.tipo, estado.n) + "c en total.";
      mostrarDesarrollo();
    }

    function mostrarDesarrollo() {
      var caja = el("desarrollo");
      caja.textContent = EJERCICIO.desarrollo(estado.tipo, estado.n).join("\n");
      el("comparacion").innerHTML = "Árbol: <b>" + EJERCICIO.totalFormula(estado.tipo, estado.n) +
        "c</b>. Recurrencia calculada llamándola con n = " + estado.n + ": <b>" +
        EJERCICIO.evaluar(estado.tipo, estado.n) + "c</b>.";
      el("bloque-desarrollo").style.display = "block";
      el("carta-clase").style.display = "block";
    }

    function pintarClases() {
      var caja = el("opciones-clase");
      caja.innerHTML = "";
      CLASES.forEach(function (c) {
        var b = document.createElement("button");
        b.textContent = "Θ(" + c + ")";
        b.addEventListener("click", function () {
          var v = el("veredicto-clase");
          var pista = EJERCICIO.pistaClase(estado.tipo, c);
          if (pista === null) {
            v.className = "veredicto bien";
            v.textContent = cierre();
          } else {
            v.className = "veredicto mal";
            v.textContent = pista;
          }
        });
        caja.appendChild(b);
      });
    }

    function cierre() {
      var texto;
      if (estado.tipo === "resta") {
        texto = "Θ(n): n niveles de un nodo, cada uno con trabajo c.";
      } else if (estado.tipo === "mitad") {
        texto = "Θ(log n): log₂ n + 1 niveles de un nodo, cada uno con trabajo c.";
      } else {
        texto = "Θ(n log n): log₂ n + 1 niveles y cada uno cuesta cn, aunque los nodos se dupliquen y se achiquen.";
      }
      return texto;
    }

    function cargar(tipo, n) {
      estado.tipo = tipo;
      estado.n = n;
      estado.hechos = 0;
      estado.revelados = {};
      ["veredicto-nivel", "veredicto-total", "veredicto-clase"].forEach(function (id) {
        el(id).className = "veredicto";
      });
      el("in-niveles").value = "";
      el("in-total").value = "";
      el("bloque-desarrollo").style.display = "none";
      el("carta-clase").style.display = "none";
      pintar();
    }

    el("btn-nivel").addEventListener("click", comprobarNivel);
    el("btn-revelar-nivel").addEventListener("click", revelarNivel);
    el("btn-medio").addEventListener("click", llenarMedio);
    el("btn-total").addEventListener("click", comprobarTotal);
    el("btn-revelar-total").addEventListener("click", revelarTotal);
    pintarClases();
    cargar("mezcla", 8);
  })();
}
