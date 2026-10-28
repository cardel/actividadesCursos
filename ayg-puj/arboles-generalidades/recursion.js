/* Ejercicio interactivo: contarNodos y altura, llamado por llamado.
   Reproducen arboles.py, lineas 22 a 32. Un paso por linea ejecutada:
   la linea del def marca la entrada del llamado, la del caso base el
   arbol vacio, la del caso recursivo el momento en que ans recibe su
   valor con los dos subarboles ya resueltos, y la del return la
   salida. El nucleo vive en lib.js. */
var ARB = (typeof module !== "undefined") ? require("./lib.js") : ARB;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {

  var ARBOLES = [
    { boton: "Siete nodos",
      texto: "Siete nodos y tres niveles por debajo de la raíz. El subárbol derecho de 34 es una fila de tres.",
      T: [26, [17, [13, [], []], [19, [], []]], [34, [], [29, [], [31, [], []]]]] },
    { boton: "En fila",
      texto: "Cinco nodos, cada uno con un solo hijo y siempre por el lado derecho. La pila llega tan abajo como el árbol.",
      T: [16, [], [23, [], [12, [], [37, [], [28, [], []]]]]] },
    { boton: "Lleno",
      texto: "Siete nodos en tres niveles completos. Todos los subárboles vacíos quedan a la misma profundidad.",
      T: [30, [14, [11, [], []], [21, [], []]], [45, [37, [], []], [52, [], []]]] }
  ];
  ARBOLES.forEach(function (a) {
    a.n = ARB.contarNodos(a.T);
    a.h = ARB.altura(a.T);
    a.L = ARB.layoutBinario(a.T, { ancho: 520, alto: a.h > 2 ? 230 : 180 });
    a.pasos = { contar: ARB.simRec(a.T, "contar"), altura: ARB.simRec(a.T, "altura") };
  });

  var FUNCIONES = {
    contar: { boton: "contarNodos", nombre: "contarNodos", def: 22, base: 23, rec: 25, ret: 26,
              valorBase: "0", linea: "la línea 23" },
    altura: { boton: "altura", nombre: "altura", def: 28, base: 29, rec: 31, ret: 32,
              valorBase: "−1", linea: "la línea 29" }
  };

  var CODIGO = ARB.CODIGO_CONTAR.concat([{ num: null, txt: "" }]).concat(ARB.CODIGO_ALTURA);

  function pasos(p) { return ARBOLES[p.t].pasos[p.f]; }

  /* El caso base corre una vez por subarbol vacio, y un arbol binario
     de n nodos tiene n + 1 huecos de hijo sin llenar. */
  function evaluar(valor, p) {
    var a = ARBOLES[p.t], F = FUNCIONES[p.f], n = a.n;
    if (valor === n + 1) {
      return { ok: true, msg: "Correcto: " + (n + 1) + " veces. Los " + n + " nodos dejan " + (2 * n) +
        " huecos de hijo y " + (n - 1) + " están ocupados por otro nodo, así que quedan " + (n + 1) +
        " subárboles vacíos, y " + F.linea + " corre una vez por cada uno." };
    }
    if (valor === n) {
      return { ok: false, msg: "Son " + (n + 1) + ", una más que los " + n +
        " nodos. Cada nodo llama a sus dos subárboles, incluidos los vacíos, y los huecos vacíos son siempre uno más que los nodos." };
    }
    if (valor === 2 * n + 1) {
      return { ok: false, msg: "Ese es el total de llamados, " + (2 * n + 1) + ": " + n +
        " sobre subárboles con nodo y " + (n + 1) + " sobre subárboles vacíos. " + F.linea +
        " solo corre en los segundos, " + (n + 1) + " veces." };
    }
    if (valor === a.h || valor === a.h + 1) {
      return { ok: false, msg: "Esa es la altura del árbol, que es hasta dónde llega la pila, no cuántas veces corre la línea. El caso base corre " + (n + 1) + " veces." };
    }
    return { ok: false, msg: "Son " + (n + 1) + ". Cuente los subárboles vacíos del dibujo: cada nodo sin hijo izquierdo aporta uno y cada nodo sin hijo derecho aporta otro." };
  }

  function cuentas(p) {
    var a = ARBOLES[p.t], F = FUNCIONES[p.f], n = a.n;
    return [
      { linea: F.def, que: "entra un llamado", fin: 2 * n + 1 },
      { linea: F.base, que: "el subárbol es vacío y ans queda en " + F.valorBase, fin: n + 1 },
      { linea: F.rec, que: "ans se arma con los dos subárboles", fin: n },
      { linea: F.ret, que: "el llamado devuelve", fin: 2 * n + 1 }
    ];
  }

  return { ARBOLES: ARBOLES, FUNCIONES: FUNCIONES, CODIGO: CODIGO,
           pasos: pasos, evaluar: evaluar, cuentas: cuentas };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, p = { t: 0, f: "contar" };
    function el(id) { return document.getElementById(id); }
    function arbol() { return E.ARBOLES[p.t]; }

    function dibujo(a) {
      var A = arbol(), L = A.L;
      var mirando = a ? a.mirando : [], listos = a ? a.listos : [];
      function valorListo(sub) {
        var r = null;
        listos.forEach(function (par) { if (par[0] === sub) { r = par[1]; } });
        return r;
      }
      el("panel-arbol").innerHTML = GRAFOSVG.dibujar({
        n: L.n, pos: L.pos, aristas: L.aristas, dirigido: false,
        ancho: L.ancho, alto: L.alto, nombre: L.nombre,
        nodo: function (i) {
          var sub = L.lista[i].sub, s = {}, listo = valorListo(sub);
          if (listo !== null) { s = { relleno: "#e7f2e8", borde: "#2e7d32", nota: String(listo), notaColor: "#2e7d32" }; }
          if (mirando.indexOf(sub) >= 0) {
            s.relleno = "#fdf1dc"; s.borde = "#e8a13d"; s.grueso = 3.2;
          }
          if (a && a.vacio && a.padre === sub) {
            s.borde = "#b3261e"; s.grueso = 3.2;
            s.nota = "A = []"; s.notaColor = "#b3261e";
          }
          return s;
        }
      });
    }

    function pila(a) {
      if (!a) { el("panel-pila").innerHTML = "<div class='nota' style='margin:0'>La pila está vacía: todavía no entró ningún llamado.</div>"; return; }
      el("panel-pila").innerHTML = a.pila.map(function (f, i) {
        return "<div class='marco" + (i === a.pila.length - 1 ? " cima" : "") + "'>" +
          "<span class='sangria'>" + new Array(f.prof + 1).join("· ") + "</span>" +
          E.FUNCIONES[p.f].nombre + "(A = " + f.et + ")" +
          "<span class='sangria'> &nbsp;ans = " + (f.ans === null ? "–" : f.ans) + "</span></div>";
      }).join("");
    }

    function tabla(e) {
      var A = arbol();
      el("cuentas").innerHTML = "<div class='envoltura-tabla'><table>" +
        "<tr><th>Línea</th><th>Qué pasa ahí</th><th>Veces hasta aquí</th><th>Al terminar</th></tr>" +
        E.cuentas(p).map(function (c) {
          return "<tr><td>" + c.linea + "</td><td class='izq'>" + c.que + "</td><td>" +
            (e.conteos[c.linea] || 0) + "</td><td>" + c.fin + "</td></tr>";
        }).join("") + "</table></div>" +
        "<p class='nota'>Con n = " + A.n + " nodos hay " + (2 * A.n + 1) + " llamados y cada uno hace trabajo constante: el costo es Θ(n). La pila llega a " +
        (A.h + 1) + " marcos, uno más que la altura " + A.h + ", porque el último llamado es sobre un subárbol vacío.</p>";
    }

    function alPintar(e) {
      var a = e.actual;
      dibujo(a);
      pila(a);
      tabla(e);
      el("ver-cuerpo").textContent = a ? a.nota : "Sin arrancar. El primer llamado recibe el árbol completo.";
    }

    function preparar() {
      var A = arbol(), F = E.FUNCIONES[p.f];
      el("ver-texto").textContent = A.texto + " Tiene " + A.n + " nodos y altura " + A.h + ".";
      el("rot-prediccion").textContent = "¿Cuántas veces se ejecuta " + F.linea +
        ", el caso base de " + F.nombre + ", en toda la corrida?";
      el("prediccion").value = "";
      Motor.limpiarVeredicto();
    }

    function barra(id, lista, campo) {
      el(id).innerHTML = lista.html;
      Array.prototype.forEach.call(el(id).querySelectorAll("button"), function (b) {
        b.addEventListener("click", function () {
          p[campo] = lista.leer(b.getAttribute("data-v"));
          Array.prototype.forEach.call(el(id).querySelectorAll("button"), function (x) { x.classList.remove("primario"); });
          b.classList.add("primario");
          preparar();
          Motor.reiniciar(p);
        });
      });
    }

    Motor.iniciar({
      codigo: E.CODIGO,
      simular: function (q) { return E.pasos(q); },
      chips: [{ campo: "A", rotulo: "A" }, { campo: "prof", rotulo: "profundidad" },
              { campo: "ans", rotulo: "ans", clase: "cuenta" }],
      paramsIniciales: p, alPintar: alPintar
    });
    Motor.prediccionNumerica(function (valor, q) { return E.evaluar(valor, q); });

    barra("presets-arbol", {
      html: "<span class='nota' style='margin-top:0'>Árbol:</span>" + E.ARBOLES.map(function (a, i) {
        return "<button data-v='" + i + "' class='" + (i === 0 ? "primario" : "") + "'>" + a.boton + "</button>";
      }).join(""),
      leer: function (v) { return parseInt(v, 10); }
    }, "t");

    barra("presets-func", {
      html: "<span class='nota' style='margin-top:0'>Función:</span>" +
        Object.keys(E.FUNCIONES).map(function (k, i) {
          return "<button data-v='" + k + "' class='" + (i === 0 ? "primario" : "") + "'>" + E.FUNCIONES[k].boton + "</button>";
        }).join(""),
      leer: function (v) { return v; }
    }, "f");

    preparar();
  })();
}
