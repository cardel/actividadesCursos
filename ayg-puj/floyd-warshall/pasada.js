/* Ejercicio interactivo: la traza del triple ciclo sobre la matriz.
   Reproduce floydWarshall (250407-agra-floydwarshall.py, lineas 53 a 62)
   con un paso por linea ejecutada. El nucleo vive en lib.js. */
var FW = (typeof module !== "undefined") ? require("./lib.js") : FW;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var fmt = FW.fmt;

  var GRAFOS = [
    { boton: "Tres vértices en ciclo",
      texto: "Tres vértices y un ciclo 0 → 1 → 2 → 0 con una arista negativa. Cada paso mejora una sola pareja.",
      n: 3, aristas: [[0, 1, 4], [1, 2, -1], [2, 0, 2]],
      pos: [[280, 50], [470, 195], [90, 195]] },
    { boton: "Cuatro vértices, dos caminos",
      texto: "Cuatro vértices y seis aristas, con 1 → 2 en −4. Hay dos maneras de ir de 0 a 3 y la matriz se mueve en los cuatro pasos.",
      n: 4, aristas: [[0, 1, 3], [1, 2, -4], [2, 0, 6], [0, 3, 8], [3, 1, 5], [2, 3, 1]],
      pos: [[80, 55], [470, 55], [470, 195], [80, 195]], curvas: { 2: 45, 4: 45 } },
    { boton: "Cuatro vértices, uno al que nadie llega",
      texto: "Al vértice 3 no llega ninguna arista y de él salen dos. Su columna se queda en ∞ y los pasos k = 2 y k = 3 no mueven nada.",
      n: 4, aristas: [[0, 1, 2], [1, 2, 5], [2, 1, -3], [3, 0, 4], [3, 2, 9]],
      pos: [[200, 60], [430, 125], [200, 195], [60, 125]] }
  ];
  GRAFOS.forEach(function (g) {
    g.w = FW.pesos(g.n, g.aristas);
    g.T = FW.todas(g.w);
    g.pasos = FW.simFW(g.w);
    g.mejoras = g.pasos.filter(function (p) { return p.linea === 57; }).length;
    g.comparaciones = g.pasos.filter(function (p) { return p.linea === 56; }).length;
  });

  function evaluar(valor, i) {
    var g = GRAFOS[i], m = g.mejoras, n = g.n;
    if (valor === m) {
      return { ok: true, msg: "Correcto: la línea 57 corre " + m + " veces. La línea 56 compara las " +
               g.comparaciones + " parejas de los " + n + " pasos, que son n³ = " + (n * n * n) +
               ", y solo en " + m + " de ellas pasar por k sale más barato." };
    }
    if (valor === n * n * n) {
      return { ok: false, msg: "Ese es el número de veces que corre la línea 56, n³ = " + (n * n * n) +
               ": la comparación se hace para toda pareja en todo paso. La línea 57 solo se ejecuta cuando la comparación es cierta, y aquí eso pasa " + m + " veces." };
    }
    if (valor > m) {
      return { ok: false, msg: "Son menos: " + m + ". Cuente por pasos: " +
               g.T.D.slice(0, n).map(function (_, k) { return "k = " + k + " mejora " + FW.mejoras(g.T.D, k).length; }).join(", ") + "." };
    }
    return { ok: false, msg: "Son más: " + m + ". Una pareja puede mejorar en varios pasos distintos, y las que arrancan en ∞ también cuentan. Por pasos: " +
             g.T.D.slice(0, n).map(function (_, k) { return "k = " + k + " mejora " + FW.mejoras(g.T.D, k).length; }).join(", ") + "." };
  }

  return { GRAFOS: GRAFOS, evaluar: evaluar };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, idx = 0;
    function g() { return E.GRAFOS[idx]; }
    function el(id) { return document.getElementById(id); }

    function dibujo(a) {
      var G = g(), k = a === null ? -1 : a.k;
      el("panel-grafo").innerHTML = GRAFOSVG.dibujar({
        n: G.n, pos: G.pos, aristas: G.aristas,
        arista: function (t) {
          var e = G.aristas[t], r = (e[0] === k || e[1] === k) ? { color: "azul", grueso: 3 } : { color: "gris", grueso: 2 };
          if (G.curvas && G.curvas[t]) { r.curva = G.curvas[t]; }
          return r;
        },
        nodo: function (u) {
          var s = {};
          if (u === k) { s = { relleno: "#fdf1dc", borde: "#e8a13d", grueso: 3.4 }; }
          if (a !== null && a.i === u && u !== k) { s.relleno = "#e3edf8"; }
          return s;
        }
      });
    }

    function matriz(a) {
      var G = g(), d = a === null ? G.T.D[0] : a.d, k = a === null ? -1 : a.k;
      el("panel-matriz").innerHTML = FW.tabla(d, {
        esquina: a === null ? "d" : "d",
        filaK: k, colK: k,
        clase: function (i, j) {
          var c = [];
          if (i === k || j === k) { c.push("ejek"); }
          if (a !== null && a.i === i && a.j === j) { c.push("ahora"); }
          if (a !== null && a.mejora && a.i === i && a.j === j) { c.push("cambia"); }
          return c.join(" ");
        }
      });
    }

    function tiras(a) {
      var G = g(), s = "", t = 0;
      while (t < G.n) {
        var cl = a === null ? "" : (t < a.k ? "hecho" : (t === a.k ? "ahora" : ""));
        s += "<span class='par " + cl + "'>k = " + t + "</span> ";
        t = t + 1;
      }
      el("ver-pasadas").innerHTML = s;
    }

    function cuentas(e) {
      var G = g(), c56 = e.conteos[56] || 0, c57 = e.conteos[57] || 0;
      el("cuentas").innerHTML =
        "<table><tr><th>Línea</th><th>Qué hace</th><th>Veces hasta aquí</th><th>Al terminar</th></tr>" +
        "<tr><td>55</td><td>recorre las parejas</td><td>" + (e.conteos[55] || 0) + "</td><td>" + (G.n * G.n * G.n) + "</td></tr>" +
        "<tr><td>56</td><td>compara el camino por k</td><td>" + c56 + "</td><td>" + G.comparaciones + "</td></tr>" +
        "<tr><td>57</td><td>baja la distancia</td><td>" + c57 + "</td><td>" + G.mejoras + "</td></tr></table>" +
        "<p class='nota'>La línea 55 corre n³ = " + (G.n * G.n * G.n) + " veces en todo grafo de " + G.n +
        " vértices, tenga las aristas que tenga. Lo que cambia de un grafo a otro es cuántas de esas comparaciones resultan ciertas.</p>";
    }

    function alPintar(e) {
      var a = e.actual;
      dibujo(a);
      matriz(a);
      tiras(a);
      cuentas(e);
      el("ver-cuerpo").innerHTML = a === null || a.suma === null
        ? "<span class='nota' style='margin:0'>Todavía no se ha evaluado ninguna pareja.</span>"
        : "d[" + a.i + "][" + a.k + "] + d[" + a.k + "][" + a.j + "] = " + a.dik + " + " + a.dkj + " = " + a.suma +
          "&nbsp; contra &nbsp;d[" + a.i + "][" + a.j + "] = " + FW.fmt(a.d[a.i][a.j]);
    }

    function preparar() {
      var G = g();
      el("ver-texto").textContent = G.texto + " Aristas: " + FW.textoAristas(G.aristas) + ".";
      el("prediccion").value = "";
      Motor.limpiarVeredicto();
    }

    Motor.iniciar({
      codigo: FW.CODIGO_FW,
      simular: function (i) { return E.GRAFOS[i].pasos; },
      chips: [{ campo: "k", rotulo: "k" }, { campo: "i", rotulo: "i" }, { campo: "j", rotulo: "j" },
              { campo: "dik", rotulo: "d[i][k]" }, { campo: "dkj", rotulo: "d[k][j]" },
              { campo: "suma", rotulo: "suma", clase: "cuenta" }],
      paramsIniciales: 0, alPintar: alPintar
    });
    Motor.prediccionNumerica(function (valor, i) { return E.evaluar(valor, i); });

    var caja = "", t = 0;
    while (t < E.GRAFOS.length) {
      caja += "<button data-preset='" + t + "' class='" + (t === 0 ? "primario" : "") + "'>" + E.GRAFOS[t].boton + "</button>";
      t = t + 1;
    }
    el("presets-grafo").innerHTML = "<span class='nota' style='margin-top:0'>Grafo:</span>" + caja;
    Array.prototype.forEach.call(el("presets-grafo").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        idx = parseInt(b.getAttribute("data-preset"), 10);
        Array.prototype.forEach.call(el("presets-grafo").querySelectorAll("button"), function (x) { x.classList.remove("primario"); });
        b.classList.add("primario");
        preparar();
        Motor.reiniciar(idx);
      });
    });
    preparar();
  })();
}
