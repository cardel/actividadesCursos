/* Ejercicio interactivo: armar un arbol de cubrimiento escogiendo aristas a mano.
   El rechazo de un ciclo y la comparacion con el optimo salen de los conjuntos
   disjuntos y de kruskal, que viven en lib.js. */
var MST = (typeof module !== "undefined") ? require("./lib.js") : MST;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var GRAFOS = [
    { boton: "Cinco barrios, siete tendidos",
      texto: "Cinco barrios. Hay siete tendidos posibles y cada uno cuesta lo que dice su número.",
      n: 5, alto: 250,
      aristas: [[0, 1, 4], [0, 2, 2], [1, 2, 6], [1, 3, 3], [2, 3, 8], [2, 4, 9], [3, 4, 5]],
      pos: [[55, 120], [210, 45], [210, 200], [390, 55], [390, 205]] },
    { boton: "Ocho barrios, doce tendidos",
      texto: "Ocho barrios y doce tendidos posibles. El barrio 7 solo se alcanza por dos de ellos.",
      n: 8, alto: 265,
      aristas: [[0, 1, 6], [0, 2, 3], [1, 2, 7], [1, 3, 9], [2, 4, 4], [3, 4, 8], [3, 5, 2],
                [4, 5, 11], [4, 6, 5], [5, 6, 10], [5, 7, 12], [6, 7, 1]],
      pos: [[50, 120], [150, 50], [150, 200], [270, 50], [270, 200], [390, 120], [390, 230], [510, 170]] }
  ];
  GRAFOS.forEach(function (g) {
    g.res = MST.resumenKruskal(g.n, g.aristas);
    g.arboles = MST.contarArboles(g.n, g.aristas);
    g.suma = 0;
    g.aristas.forEach(function (a) { g.suma = g.suma + a[2]; });
  });

  /* Un tablero nuevo: cada barrio en su propio pedazo y nada escogido. */
  function nuevo(g) {
    var est = { p: MST.llenar(g.n, null), rango: MST.llenar(g.n, null), puestas: [], peso: 0, rechazos: 0 };
    var v = 0;
    while (v < g.n) { MST.makeSet(est.p, est.rango, v); v = v + 1; }
    return est;
  }

  function pedazoDe(est, x) {
    var r = MST.findSet(est.p, x), c = [], v = 0;
    while (v < est.p.length) { if (MST.findSet(est.p, v) === r) { c.push(v); } v = v + 1; }
    return c;
  }

  /* Intenta poner la arista i. Devuelve que paso y el texto que lo explica. */
  function tomar(g, est, i) {
    var a = g.aristas[i], u = a[0], v = a[1], w = a[2];
    if (est.puestas.indexOf(i) >= 0) {
      return { tipo: "puesta", msg: "El tendido " + u + "–" + v + " ya está puesto." };
    }
    if (est.puestas.length >= g.n - 1) {
      return { tipo: "lleno", msg: "Ya hay " + (g.n - 1) + " tendidos y los barrios están conectados. Reinicie para intentar otra selección." };
    }
    if (MST.findSet(est.p, u) === MST.findSet(est.p, v)) {
      est.rechazos = est.rechazos + 1;
      var c = pedazoDe(est, u);
      return { tipo: "ciclo",
               msg: "El tendido " + u + "–" + v + " cierra un ciclo: " + u + " y " + v +
                    " ya se alcanzaban dentro de {" + c.join(",") + "}. Quitarlo deja todo igual de conectado y más barato." };
    }
    MST.union(est.p, est.rango, u, v);
    est.puestas.push(i);
    est.peso = est.peso + w;
    if (est.puestas.length === g.n - 1) {
      return { tipo: "completo", msg: cierre(g, est) };
    }
    return { tipo: "entra",
             msg: "Entra " + u + "–" + v + " por " + w + ". Ahora " + u + " y " + v +
                  " están en el mismo pedazo: " + MST.textoPedazos(est.p) + "." };
  }

  function cierre(g, est) {
    var d = est.peso - g.res.peso;
    if (d === 0) {
      return "Los " + g.n + " barrios quedaron conectados con " + (g.n - 1) + " tendidos y peso " +
             est.peso + ", que es el mínimo de este grafo.";
    }
    return "Los " + g.n + " barrios quedaron conectados con " + (g.n - 1) + " tendidos y peso " +
           est.peso + ". El mínimo es " + g.res.peso + ", así que esta selección se pasó por " + d + ".";
  }

  /* Escoger siempre la más barata que no cierre ciclo da el árbol de kruskal. */
  function voraz(g) {
    var est = nuevo(g), orden = MST.ordenar(g.aristas), j = 0, rechazos = 0;
    while (j < orden.length) {
      var i = g.aristas.indexOf(orden[j]), r = tomar(g, est, i);
      if (r.tipo === "ciclo") { rechazos = rechazos + 1; }
      j = j + 1;
    }
    return { peso: est.peso, puestas: est.puestas.map(function (i) { return g.aristas[i]; }), rechazos: rechazos };
  }

  return { GRAFOS: GRAFOS, nuevo: nuevo, tomar: tomar, cierre: cierre, pedazoDe: pedazoDe, voraz: voraz };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, idx = 0, est = null, rota = -1;
    var RELLENOS = ["#e3edf8", "#e7f2e8", "#fdf1dc", "#f3e8f7", "#e6f4f6"];
    function g() { return E.GRAFOS[idx]; }
    function el(id) { return document.getElementById(id); }

    function colorDe(u) {
      var lista = MST.pedazos(est.p), c = null, k = 0;
      while (k < lista.length) {
        if (lista[k].indexOf(u) >= 0 && lista[k].length > 1) { c = RELLENOS[k % RELLENOS.length]; }
        k = k + 1;
      }
      return c === null ? "#ffffff" : c;
    }

    function dibujo() {
      var G = g();
      el("panel-grafo").innerHTML = GRAFOSVG.dibujar({
        n: G.n, pos: G.pos, aristas: G.aristas, dirigido: false, alto: G.alto,
        arista: function (i) {
          if (est.puestas.indexOf(i) >= 0) { return { color: "verde", grueso: 4 }; }
          if (i === rota) { return { color: "rojo", grueso: 3, trazo: "5 4" }; }
          return { color: "claro", grueso: 2 };
        },
        nodo: function (u) { return { relleno: colorDe(u), borde: "#6b7280" }; }
      });
    }

    function botones() {
      var G = g(), h = "", i = 0;
      while (i < G.aristas.length) {
        var a = G.aristas[i], clase = est.puestas.indexOf(i) >= 0 ? " puesta" : (i === rota ? " rota" : "");
        h = h + "<button class='" + clase.trim() + "' data-i='" + i + "'>" + a[0] + "–" + a[1] + " · " + a[2] + "</button>";
        i = i + 1;
      }
      el("aristas").innerHTML = h;
      Array.prototype.forEach.call(el("aristas").querySelectorAll("button"), function (b) {
        b.addEventListener("click", function () { clic(parseInt(b.getAttribute("data-i"), 10)); });
      });
    }

    function marcador() {
      var G = g();
      el("ver-puestas").textContent = est.puestas.length + " de " + (G.n - 1);
      el("ver-peso").textContent = est.peso;
      el("ver-pedazos").textContent = MST.pedazos(est.p).length;
    }

    function resultado() {
      var G = g();
      if (est.puestas.length < G.n - 1) {
        el("resultado").innerHTML = "<p class='nota' style='margin-top:0'>Faltan " +
          (G.n - 1 - est.puestas.length) + " tendidos para conectar los " + G.n + " barrios.</p>";
      } else {
        el("resultado").innerHTML = "<p style='margin-top:0'>" + E.cierre(G, est) + "</p>" +
          "<p>Su selección es una de las <b>" + G.arboles + "</b> que conectan este grafo. Tender todo cuesta " +
          G.suma + "; el árbol mínimo, " + G.res.peso + ".</p>" +
          "<p class='nota'>Con veinte barrios y todos los tendidos posibles habría 20<sup>18</sup> selecciones.</p>";
      }
    }

    function clic(i) {
      var r = E.tomar(g(), est, i), m = el("mensaje");
      rota = r.tipo === "ciclo" ? i : -1;
      m.className = r.tipo === "ciclo" || r.tipo === "lleno" || r.tipo === "puesta" ? "veredicto mal" : "veredicto bien";
      m.textContent = r.msg;
      botones();
      dibujo();
      marcador();
      resultado();
    }

    function preparar() {
      var G = g();
      est = E.nuevo(G);
      rota = -1;
      el("ver-texto").textContent = G.texto;
      el("pregunta-pred").textContent = "¿Cuántos tendidos va a tener su selección en este grafo de " + G.n + " barrios?";
      el("prediccion").value = "";
      el("veredicto").className = "veredicto";
      el("veredicto").textContent = "";
      el("mensaje").className = "veredicto";
      el("mensaje").textContent = "";
      botones();
      dibujo();
      marcador();
      resultado();
    }

    el("btn-comprobar").addEventListener("click", function () {
      var G = g(), x = parseInt(el("prediccion").value, 10), v = el("veredicto"), msg;
      if (isNaN(x)) {
        msg = "Escriba un número primero."; v.className = "veredicto mal";
      } else if (x === G.n - 1) {
        msg = "Correcto: " + (G.n - 1) + ". Con menos queda un barrio sin alcanzar y con más se repite un camino, que es un ciclo.";
        v.className = "veredicto bien";
      } else if (x > G.n - 1) {
        msg = "Con " + x + " tendidos sobra alguno: entre dos barrios habría dos caminos, y se puede quitar una arista de ese ciclo sin desconectar nada.";
        v.className = "veredicto mal";
      } else {
        msg = "Con " + x + " tendidos los " + G.n + " barrios no alcanzan a quedar conectados: cada tendido junta a lo sumo dos pedazos en uno.";
        v.className = "veredicto mal";
      }
      v.textContent = msg;
    });

    el("btn-reiniciar").addEventListener("click", preparar);
    Array.prototype.forEach.call(document.querySelectorAll("#presets-grafo button"), function (b) {
      b.addEventListener("click", function () {
        idx = parseInt(b.getAttribute("data-preset"), 10);
        Array.prototype.forEach.call(document.querySelectorAll("#presets-grafo button"), function (x) { x.classList.remove("primario"); });
        b.classList.add("primario");
        preparar();
      });
    });
    preparar();
  })();
}
