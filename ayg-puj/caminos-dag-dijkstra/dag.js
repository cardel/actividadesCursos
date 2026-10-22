/* Ejercicio interactivo: caminos mas cortos en un DAG.
   La simulacion de topoSort y ssspDAG vive en lib.js y reproduce 250325-agra-sssp-dag.py linea por linea. */
var CDD = (typeof module !== "undefined") ? require("./lib.js") : CDD;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var INF = CDD.INF, fmt = CDD.fmt;

  var GRAFOS = [
    { boton: "Siete vértices, uno antes de la fuente",
      texto: "Siete vértices y fuente 3. El vértice 2 llega a la fuente, así que en el orden topológico va antes que ella y su distancia se queda en ∞.",
      n: 7, s: 3, t: 6,
      aristas: [[3, 1, 2], [3, 5, 4], [1, 0, 6], [1, 4, 1], [5, 4, 2], [5, 6, 3], [4, 0, 2], [4, 6, 5], [2, 3, 1], [0, 6, 1]],
      pos: [[430, 70], [230, 55], [40, 125], [130, 125], [330, 125], [230, 195], [520, 125]] },
    { boton: "Seis vértices, dos caminos hasta el mismo vértice",
      texto: "Seis vértices y fuente 4. Al vértice 1 llegan dos caminos, y el vértice 3 hereda el mejor de ellos.",
      n: 6, s: 4, t: 3,
      aristas: [[4, 0, 6], [4, 2, 3], [2, 0, 2], [2, 5, 5], [0, 1, 4], [5, 1, 3], [1, 3, 2], [5, 3, 6]],
      pos: [[270, 55], [380, 125], [150, 125], [500, 125], [40, 125], [270, 195]] },
    { boton: "Siete vértices con pesos negativos",
      texto: "Siete vértices y fuente 0. Hay dos aristas negativas y dos vértices, el 3 y el 6, que la fuente no alcanza.",
      n: 7, s: 0, t: 5,
      aristas: [[0, 1, 5], [0, 2, -1], [2, 1, -3], [1, 4, 2], [2, 4, 6], [4, 5, -5], [6, 3, 2], [3, 5, 1]],
      pos: [[40, 110], [160, 175], [160, 45], [370, 215], [290, 110], [440, 110], [250, 215]] }
  ];
  GRAFOS.forEach(function (g) { g.G = CDD.construir(g.n, g.aristas); });

  /* Interpreta lo que escribe el estudiante: un entero, inf o ∞. */
  function leer(texto) {
    var t = String(texto).trim().toLowerCase().replace("−", "-");
    var r = null;
    if (t === "inf" || t === "∞" || t === "infinito" || t === "+inf") { r = INF; }
    else if (/^-?\d+$/.test(t)) { r = parseInt(t, 10); }
    return r;
  }

  /* Candidatos a dist[t]: lo que aporta cada arista que llega a t. */
  function candidatos(g, d) {
    var res = [];
    g.aristas.forEach(function (a) {
      if (a[1] === g.t) { res.push(a[0] + "→" + g.t + ": dist[" + a[0] + "] + " + fmt(a[2]) + " = " + fmt(d[a[0]] + a[2])); }
    });
    return res;
  }

  function camino(pr, s, t) {
    var c = [t], v = t;
    while (v !== s && pr[v] >= 0) { v = pr[v]; c.unshift(v); }
    return c.join(" → ");
  }

  function evaluar(texto, g) {
    var r = CDD.resumenDAG(g.G, g.s), val = leer(texto), real = r.dist[g.t];
    var cand = candidatos(g, r.dist).join("; ");
    if (val === null) { return { ok: false, msg: "Escriba un entero, inf o ∞." }; }
    if (val === real) {
      return { ok: true, msg: "Correcto: dist[" + g.t + "] = " + fmt(real) + ". El camino es " + camino(r.pred, g.s, g.t) + ". Cada arista que llega a " + g.t + " propone un valor y gana el menor: " + cand + "." };
    }
    if (real === INF) {
      return { ok: false, msg: "No: el vértice " + g.t + " no es alcanzable desde " + g.s + ". Ninguna de las aristas que le llegan sale de un vértice con distancia finita: " + cand + "." };
    }
    if (val === INF) {
      return { ok: false, msg: "Sí es alcanzable. Cada arista que llega a " + g.t + " propone un valor: " + cand + ". La distancia es " + fmt(real) + "." };
    }
    return { ok: false, msg: "No. Cada arista que llega a " + g.t + " propone un valor: " + cand + ". Gana el menor, " + fmt(real) + ", y el camino es " + camino(r.pred, g.s, g.t) + "." };
  }

  /* Filas de la comparacion con Bellman-Ford. */
  function comparar(g) {
    var a = CDD.resumenDAG(g.G, g.s), b = CDD.bf(g.G, g.s);
    return { dag: a, bf: b, m: g.aristas.length, igual: a.dist.join() === b.dist.join() };
  }

  return { GRAFOS: GRAFOS, leer: leer, evaluar: evaluar, comparar: comparar, candidatos: candidatos, camino: camino };
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
      var G = g(), sssp = a !== null && a.fase === "sssp" && a.linea >= 43, vivo = a === null ? -1 : indiceArista(a.u, a.v);
      el("panel-grafo").innerHTML = GRAFOSVG.dibujar({
        n: G.n, pos: G.pos, aristas: G.aristas,
        arista: function (i) {
          var r = { color: "gris", grueso: 2 }, u = G.aristas[i][0], v = G.aristas[i][1];
          if (sssp && a.pred[v] === u) { r = { color: "morado", grueso: 3.2 }; }
          if (i === vivo && [17, 18, 30, 31, 32, 33, 44, 46, 47, 48].indexOf(a.linea) >= 0) {
            r = { color: a.mejora ? "verde" : "azul", grueso: 4 };
          }
          return r;
        },
        nodo: function (u) {
          var s = { relleno: "#ffffff", borde: "#6b7280" };
          if (a !== null) {
            if (a.fase === "topo" && a.topo.indexOf(u) >= 0) { s.relleno = "#e7f2e8"; }
            if (sssp && a.hechos.indexOf(u) >= 0) { s.relleno = "#e7f2e8"; }
            if (a.u === u) { s.relleno = "#fdf1dc"; s.borde = "#e8a13d"; s.grueso = 3.4; }
            if (a.linea >= 38 && a.linea !== 41 && a.dist !== null && a.fase === "sssp") { s.nota = F(a.dist[u]) + "/" + CDD.pred(a.pred[u]); }
            if (a.fase === "topo" && a.inc !== null) { s.nota = "inc " + a.inc[u]; s.notaColor = "#6b7280"; }
          }
          return s;
        }
      });
    }

    function tags(lista, clase) {
      var s = "";
      lista.forEach(function (x) { s += "<span class='par " + (clase || "") + "'>" + x + "</span> "; });
      return lista.length === 0 ? "<span class='nota' style='margin:0'>vacía</span>" : s;
    }

    function tabla(a) {
      var G = g(), s = "<tr><th>v</th><th>inc</th><th>dist</th><th>pred</th><th>lugar en topo</th></tr>", v = 0, prev = null;
      if (a !== null && a.fase === "sssp" && a.linea >= 46) { prev = a; }
      while (v < G.n) {
        var lugar = a === null ? -1 : a.topo.indexOf(v);
        var d = a === null || a.dist === null ? "·" : F(a.dist[v]);
        var cambio = a !== null && a.mejora && a.v === v ? " class='mejora'" : "";
        s += "<tr" + (a !== null && a.u === v ? " class='fila-u'" : "") + "><td>" + v + "</td><td>" + (a === null || a.inc === null ? "·" : a.inc[v]) + "</td><td" + cambio + ">" + d + "</td><td" + cambio + ">" +
             (a === null || a.pred === null ? "·" : CDD.pred(a.pred[v])) + "</td><td>" + (lugar >= 0 ? lugar : "·") + "</td></tr>";
        v = v + 1;
      }
      el("tabla").innerHTML = s;
    }

    function comparacion() {
      var c = E.comparar(g());
      el("comparacion").innerHTML =
        "<table><tr><th></th><th>ssspDAG</th><th>Bellman-Ford con parada</th></tr>" +
        "<tr><td>Recorridos de las aristas</td><td>1, en orden topológico</td><td>" + c.bf.rondas + " rondas, de 0 a n − 1</td></tr>" +
        "<tr><td>Aristas examinadas</td><td>" + c.dag.examinadas + "</td><td>" + c.bf.examinadas + "</td></tr>" +
        "<tr><td>Aristas que bajan una distancia</td><td>" + c.dag.mejoras + "</td><td>" + c.bf.mejoras + "</td></tr>" +
        "<tr><td>Orden previo</td><td>topoSort: " + c.dag.topo.join(", ") + "</td><td>ninguno</td></tr></table>" +
        "<p class='nota'>El grafo tiene " + c.m + " aristas. ssspDAG examina cada una una sola vez; Bellman-Ford hace " + c.bf.rondas +
        " rondas porque la última confirma que ya nada baja. Las distancias finales " + (c.igual ? "coinciden" : "no coinciden") +
        ". Bellman-Ford recorre las aristas por vértice de origen de 0 a n − 1, no en orden topológico, y por eso algunas de sus mejoras son provisionales.</p>";
    }

    function alPintar(e) {
      var a = e.actual;
      dibujo(a);
      tabla(a);
      el("ver-cola").innerHTML = a === null ? tags([]) : tags(a.q);
      el("ver-topo").innerHTML = a === null ? tags([]) : tags(a.topo, "hecho");
    }

    function preparar() {
      var G = g();
      el("ver-texto").textContent = G.texto + " Aristas: " + CDD.textoAristas(G.aristas) + ".";
      el("pregunta-pred").innerHTML = "¿Cuánto vale <code>dist[" + G.t + "]</code> al terminar?";
      el("prediccion").value = "";
      Motor.limpiarVeredicto();
      comparacion();
    }

    Motor.iniciar({
      codigo: CDD.CODIGO_DAG,
      simular: function (i) { return CDD.simDAG(E.GRAFOS[i].G, E.GRAFOS[i].s); },
      chips: [{ campo: "u", rotulo: "u" }, { campo: "v", rotulo: "v" }, { campo: "w", rotulo: "duv" }, { campo: "suma", rotulo: "dist[u] + duv" }],
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
