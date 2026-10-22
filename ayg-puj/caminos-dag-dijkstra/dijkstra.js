/* Ejercicio interactivo: algoritmo de Dijkstra.
   La simulacion de dijkstra vive en lib.js y reproduce 250331-agra-dijkstra.py linea por linea. */
var CDD = (typeof module !== "undefined") ? require("./lib.js") : CDD;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var fmt = CDD.fmt;

  var GRAFOS = [
    { boton: "Seis vértices, un ciclo hacia la fuente",
      texto: "Seis vértices y fuente 1. El vértice 5 tiene una arista de regreso a la fuente, y el 0 y el 4 se alcanzan por más de un camino.",
      n: 6, s: 1,
      aristas: [[1, 0, 5], [1, 2, 2], [2, 0, 2], [2, 4, 7], [0, 4, 3], [0, 3, 6], [4, 3, 1], [3, 5, 2], [4, 5, 6], [5, 1, 4]],
      pos: [[190, 215], [50, 150], [170, 125], [350, 215], [330, 125], [500, 150]], curva: { "5-1": 150 } },
    { boton: "Siete vértices, aristas en los dos sentidos",
      texto: "Siete vértices y fuente 4. Los vértices 2 y 5 se unen con una arista en cada sentido y pesos distintos.",
      n: 7, s: 4,
      aristas: [[4, 5, 1], [4, 2, 6], [5, 2, 3], [2, 5, 2], [5, 6, 4], [2, 0, 2], [6, 0, 1], [0, 1, 3], [1, 6, 2], [6, 3, 5], [3, 2, 1]],
      pos: [[390, 205], [500, 125], [150, 200], [290, 125], [40, 125], [150, 50], [300, 45]] },
    { boton: "Siete vértices, un empate y un vértice aislado",
      texto: "Siete vértices y fuente 0. Los vértices 1 y 3 quedan a la misma distancia de la fuente, y el 6 solo tiene una arista de salida: nadie llega a él.",
      n: 7, s: 0,
      aristas: [[0, 1, 2], [0, 3, 2], [1, 2, 3], [3, 2, 1], [2, 4, 2], [1, 5, 6], [4, 5, 1], [5, 1, 1], [6, 0, 1]],
      pos: [[40, 125], [170, 55], [310, 125], [170, 195], [430, 195], [430, 55], [40, 225]] }
  ];
  GRAFOS.forEach(function (g) { g.G = CDD.construir(g.n, g.aristas); g.corrida = CDD.dijkstraTodos(g.G, g.s); });

  function orden(g) {
    var o = [];
    g.corrida.ext.forEach(function (e) { if (e.acepta) { o.push(e.u); } });
    return o;
  }

  /* Evalua lo que escribe el estudiante: vertices separados por espacios o comas. */
  function evaluar(texto, g) {
    var partes = String(texto).trim().split(/[\s,]+/), dado = [], malo = false, real = orden(g), i;
    partes.forEach(function (p) { if (/^\d+$/.test(p)) { dado.push(parseInt(p, 10)); } else if (p !== "") { malo = true; } });
    if (malo || dado.length === 0) { return { ok: false, msg: "Escriba los vértices como números separados por espacios." }; }
    var viejas = g.corrida.ext.length - real.length;
    if (dado.join() === real.join()) {
      return { ok: true, msg: "Correcto: " + real.join(", ") + ". Salen " + g.corrida.ext.length + " parejas de la cola y " + viejas + (viejas === 1 ? " se descarta por vieja" : " se descartan por viejas") + ", así que cada vértice alcanzable se procesa una sola vez." };
    }
    i = 0;
    while (i < dado.length && i < real.length && dado[i] === real[i]) { i = i + 1; }
    if (i < real.length && i < dado.length) {
      var d = g.corrida.ext.filter(function (e) { return e.acepta; })[i];
      return { ok: false, msg: (i === 0 ? "" : "Hasta el puesto " + i + " coincide. ") + "En el puesto " + (i + 1) + " sale el vértice " + real[i] + ", cuya pareja (" + d.du + ", " + d.u + ") es la menor de la cola en ese momento, y no el " + dado[i] + "." };
    }
    if (dado.length < real.length) {
      return { ok: false, msg: "Faltan vértices: después de " + dado[dado.length - 1] + " todavía salen " + real.slice(dado.length).join(", ") + ". Salen todos los que la fuente alcanza." };
    }
    var sobra = dado.slice(real.length);
    return { ok: false, msg: "Sobran " + sobra.join(", ") + ": " + (sobra.length === 1 ? "ese vértice no se procesa" : "esos vértices no se procesan") + " porque ninguna arista los alcanza desde la fuente. El orden correcto es " + real.join(", ") + "." };
  }

  function cuentas(g) {
    var c = g.corrida, acept = orden(g).length;
    return { entran: c.push.length, salen: c.pop.length, aceptadas: acept, viejas: c.pop.length - acept };
  }

  return { GRAFOS: GRAFOS, orden: orden, evaluar: evaluar, cuentas: cuentas };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, idx = 0, F = CDD.fmt;
    function g() { return E.GRAFOS[idx]; }
    function el(id) { return document.getElementById(id); }

    function indiceArista(u, v) {
      var i = 0, r = -1;
      while (i < g().aristas.length) { if (g().aristas[i][0] === u && g().aristas[i][1] === v) { r = i; } i = i + 1; }
      return r;
    }

    function dibujo(a) {
      var G = g(), vivo = a === null || a.v === null ? -1 : indiceArista(a.u, a.v);
      el("panel-grafo").innerHTML = GRAFOSVG.dibujar({
        n: G.n, pos: G.pos, aristas: G.aristas,
        arista: function (i) {
          var r = { color: "gris", grueso: 2 };
          var cv = (G.curva || {})[G.aristas[i][0] + "-" + G.aristas[i][1]];
          if (a !== null && a.pred !== null && a.pred[G.aristas[i][1]] === G.aristas[i][0]) { r = { color: "morado", grueso: 3.2 }; }
          if (i === vivo && [46, 48, 49, 50, 51].indexOf(a.linea) >= 0) { r = { color: a.mejora ? "verde" : "azul", grueso: 4 }; }
          if (cv) { r.curva = cv; }
          return r;
        },
        nodo: function (u) {
          var s = { relleno: "#ffffff", borde: "#6b7280" };
          if (a !== null && a.dist !== null) {
            s.nota = F(a.dist[u]) + "/" + CDD.pred(a.pred === null ? -1 : a.pred[u]);
            if (a.orden.indexOf(u) >= 0) { s.relleno = "#e7f2e8"; }
            if (a.u === u && a.linea >= 43) { s.relleno = "#fdf1dc"; s.borde = "#e8a13d"; s.grueso = 3.4; }
          }
          return s;
        }
      });
    }

    function colaHtml(a) {
      var s = "";
      if (a === null || a.dist === null) { return "<span class='nota' style='margin:0'>vacía</span>"; }
      a.cola.forEach(function (p, i) {
        var vieja = a.dist[p[1]] !== p[0];
        s += "<span class='par" + (vieja ? " vieja" : "") + (i === 0 && !vieja ? " sale" : "") + "'>(" + F(p[0]) + ", " + p[1] + ")</span> ";
      });
      return a.cola.length === 0 ? "<span class='nota' style='margin:0'>vacía</span>" : s;
    }

    function tabla(a) {
      var G = g(), s = "<tr><th>v</th><th>dist</th><th>pred</th><th>puesto de salida</th></tr>", v = 0;
      while (v < G.n) {
        var cambio = a !== null && a.mejora && a.v === v ? " class='mejora'" : "";
        var puesto = a === null ? -1 : a.orden.indexOf(v);
        s += "<tr" + (a !== null && a.u === v && a.linea >= 43 ? " class='fila-u'" : "") + "><td>" + v + "</td><td" + cambio + ">" + (a === null || a.dist === null ? "·" : F(a.dist[v])) + "</td><td" + cambio + ">" +
             (a === null || a.pred === null ? "·" : CDD.pred(a.pred[v])) + "</td><td>" + (puesto >= 0 ? puesto + 1 : "·") + "</td></tr>";
        v = v + 1;
      }
      el("tabla").innerHTML = s;
    }

    function cuentas() {
      var c = E.cuentas(g());
      el("cuentas").innerHTML = "<table><tr><th>Parejas que entran a la cola</th><th>Parejas que salen</th><th>Se procesan</th><th>Se descartan por viejas</th></tr>" +
        "<tr><td>" + c.entran + "</td><td>" + c.salen + "</td><td>" + c.aceptadas + "</td><td>" + c.viejas + "</td></tr></table>" +
        "<p class='nota'>Cada mejora de <code>dist</code> mete una pareja nueva y deja vieja la anterior de ese vértice. Con " + g().aristas.length +
        " aristas, entran a lo sumo " + g().aristas.length + " parejas más la inicial.</p>";
    }

    function alPintar(e) {
      var a = e.actual;
      dibujo(a);
      tabla(a);
      el("ver-cola").innerHTML = colaHtml(a);
      el("ver-orden").innerHTML = a === null || a.orden.length === 0 ? "<span class='nota' style='margin:0'>ninguno</span>" :
        a.orden.map(function (x) { return "<span class='par hecho'>" + x + "</span>"; }).join(" ");
    }

    function preparar() {
      var G = g();
      el("ver-texto").textContent = G.texto + " Aristas: " + CDD.textoAristas(G.aristas) + ".";
      el("prediccion").value = "";
      Motor.limpiarVeredicto();
      cuentas();
    }

    Motor.iniciar({
      codigo: CDD.CODIGO_DIJKSTRA,
      simular: function (i) { return CDD.simDijkstra(E.GRAFOS[i].G, E.GRAFOS[i].s); },
      chips: [{ campo: "u", rotulo: "u" }, { campo: "du", rotulo: "du" }, { campo: "v", rotulo: "v" }, { campo: "w", rotulo: "duv" }, { campo: "suma", rotulo: "du + duv" }],
      paramsIniciales: 0, alPintar: alPintar
    });
    preparar();

    el("btn-comprobar").addEventListener("click", function () {
      var r = E.evaluar(el("prediccion").value, g()), v = el("veredicto");
      v.className = r.ok ? "veredicto bien" : "veredicto mal";
      v.textContent = r.msg;
    });
    Array.prototype.forEach.call(document.querySelectorAll("#presets-grafo button"), function (b) {
      b.addEventListener("click", function () {
        idx = parseInt(b.getAttribute("data-preset"), 10);
        Array.prototype.forEach.call(document.querySelectorAll("#presets-grafo button"), function (x) { x.classList.remove("primario"); });
        b.classList.add("primario");
        preparar();
        Motor.reiniciar(idx);
      });
    });
  })();
}
