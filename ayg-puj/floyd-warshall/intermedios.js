/* Ejercicio interactivo: la recurrencia de Floyd-Warshall paso por paso.
   Dado el paso k se predice que parejas mejoran y con que valor.
   El nucleo del algoritmo vive en lib.js. */
var FW = (typeof module !== "undefined") ? require("./lib.js") : FW;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var INF = FW.INF, fmt = FW.fmt;

  var GRAFOS = [
    { boton: "Cuatro vértices, una arista negativa",
      texto: "Cuatro vértices y seis aristas. La arista 1→2 pesa −3 y es la que hace bajar varias parejas cuando se permite pasar por 1.",
      n: 4,
      aristas: [[0, 1, 6], [1, 2, -3], [2, 0, 4], [0, 3, 2], [3, 2, 5], [2, 1, 7]],
      pos: [[80, 60], [470, 60], [470, 190], [80, 190]] },
    { boton: "Cinco vértices, dos aristas negativas",
      texto: "Cinco vértices y nueve aristas, con 2→1 en −1 y 4→2 en −2. Hay un paso en el que la matriz no se mueve.",
      n: 5,
      aristas: [[0, 2, 7], [0, 4, 3], [1, 0, 2], [2, 1, -1], [2, 3, 6], [3, 0, 1], [3, 1, 8], [4, 2, -2], [4, 3, 9]],
      pos: [[70, 55], [490, 55], [280, 125], [490, 195], [70, 195]] },
    { boton: "Cinco vértices, uno sin aristas de entrada",
      texto: "Al vértice 2 no llega ninguna arista, así que su columna se queda en ∞ y ningún paso la toca.",
      n: 5,
      aristas: [[0, 1, 5], [1, 3, -2], [3, 4, 3], [4, 0, 4], [2, 1, 1], [2, 4, 8]],
      pos: [[180, 45], [450, 45], [50, 125], [450, 205], [180, 205]] }
  ];
  GRAFOS.forEach(function (g) {
    g.w = FW.pesos(g.n, g.aristas);
    g.T = FW.todas(g.w);
  });

  function mejorasDe(g, k) { return FW.mejoras(g.T.D, k); }

  /* La pareja cuyo valor se pregunta: la primera que baja de un valor finito
     y, si no hay ninguna, la primera que aparece. Con un paso que no mueve
     nada se pregunta por una pareja que no cambia. */
  function pareja(g, k) {
    var m = mejorasDe(g, k), r = null, t = 0;
    while (t < m.length) {
      if (r === null && m[t].antes !== INF) { r = { i: m[t].i, j: m[t].j }; }
      t = t + 1;
    }
    if (r === null && m.length > 0) { r = { i: m[0].i, j: m[0].j }; }
    if (r === null) {
      var i = (k + 1) % g.n, j = (k + 2) % g.n;
      r = { i: i, j: j };
    }
    return r;
  }

  function leer(texto) {
    var t = String(texto).trim().toLowerCase().replace("−", "-");
    var r = null;
    if (t === "inf" || t === "∞" || t === "infinito") { r = INF; }
    else if (/^-?\d+$/.test(t)) { r = parseInt(t, 10); }
    return r;
  }

  function cuenta(x, uno, varios) {
    return x === 0 ? "ninguna " + uno : (x === 1 ? "una " + uno : x + " " + varios);
  }

  /* El calculo de una celda en el paso k, escrito como lo hace la recurrencia. */
  function cuentaCelda(g, k, i, j) {
    var D = g.T.D[k];
    return "d[" + i + "][" + k + "] + d[" + k + "][" + j + "] = " + fmt(D[i][k]) + " + " + fmt(D[k][j]) +
           " = " + fmt(D[i][k] + D[k][j]) + ", contra el " + fmt(D[i][j]) + " que ya tenía";
  }

  /* marcas: lista de "i,j" que el estudiante señaló. */
  function evaluarMarcas(g, k, marcas) {
    var m = mejorasDe(g, k), esperadas = m.map(function (x) { return x.i + "," + x.j; });
    var faltan = [], sobran = [], t;
    esperadas.forEach(function (c) { if (marcas.indexOf(c) < 0) { faltan.push(c); } });
    marcas.forEach(function (c) { if (esperadas.indexOf(c) < 0) { sobran.push(c); } });
    if (faltan.length === 0 && sobran.length === 0) {
      if (m.length === 0) {
        return { ok: true, msg: "Correcto: en el paso k = " + k + " no mejora ninguna pareja. Pasar por " + k +
                 " nunca sale más barato que lo que la matriz ya traía, y D^(" + (k + 1) + ") es igual a D^(" + k + ")." };
      }
      var det = m.map(function (x) {
        return "d[" + x.i + "][" + x.j + "] = " + fmt(x.ik) + " + " + fmt(x.kj) + " = " + fmt(x.ahora) +
               " (antes " + fmt(x.antes) + ")";
      }).join("; ");
      return { ok: true, msg: "Correcto: mejoran " + cuenta(m.length, "pareja", "parejas") + ". " + det + "." };
    }
    var msg = "";
    if (faltan.length > 0) {
      msg = msg + "Faltan " + faltan.length + ": " + faltan.map(function (c) {
        var p = c.split(","); return "(" + c + "), donde " + cuentaCelda(g, k, +p[0], +p[1]);
      }).join("; ") + ". ";
    }
    if (sobran.length > 0) {
      msg = msg + "Sobran " + sobran.length + ": " + sobran.map(function (c) {
        var p = c.split(","), i = +p[0], j = +p[1];
        if (i === k || j === k) {
          return "(" + c + ") está en la fila o en la columna " + k + ", que no se mueven: " + cuentaCelda(g, k, i, j);
        }
        return "(" + c + "): " + cuentaCelda(g, k, i, j);
      }).join("; ") + ".";
    }
    return { ok: false, msg: msg };
  }

  function evaluarValor(g, k, texto) {
    var p = pareja(g, k), v = leer(texto), real = g.T.D[k + 1][p.i][p.j], antes = g.T.D[k][p.i][p.j];
    if (v === null) { return { ok: false, msg: "Escriba un entero, inf o ∞." }; }
    if (v === real) {
      if (real === antes) {
        return { ok: true, msg: "Correcto: d[" + p.i + "][" + p.j + "] se queda en " + fmt(real) + ". " +
                 cuentaCelda(g, k, p.i, p.j) + ", así que el mínimo deja la casilla como estaba." };
      }
      return { ok: true, msg: "Correcto: d[" + p.i + "][" + p.j + "] = " + fmt(real) + ", por el camino " +
               p.i + " → " + k + " → " + p.j + ". " + cuentaCelda(g, k, p.i, p.j) + "." };
    }
    return { ok: false, msg: "No. La recurrencia toma el mínimo de dos valores: " + cuentaCelda(g, k, p.i, p.j) +
             ". El menor es " + fmt(real) + "." };
  }

  return { GRAFOS: GRAFOS, mejorasDe: mejorasDe, pareja: pareja, leer: leer,
           evaluarMarcas: evaluarMarcas, evaluarValor: evaluarValor, cuentaCelda: cuentaCelda };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, idx = 0, k = 0, marcas = [], visto = false;
    function g() { return E.GRAFOS[idx]; }
    function el(id) { return document.getElementById(id); }

    function dibujo() {
      var G = g();
      el("panel-grafo").innerHTML = GRAFOSVG.dibujar({
        n: G.n, pos: G.pos, aristas: G.aristas,
        arista: function (i) {
          var a = G.aristas[i], r = { color: "gris", grueso: 2 };
          if (a[0] === k || a[1] === k) { r = { color: "azul", grueso: 3 }; }
          if (G.curvas && G.curvas[i]) { r.curva = G.curvas[i]; }
          return r;
        },
        nodo: function (u) {
          return u === k ? { relleno: "#fdf1dc", borde: "#e8a13d", grueso: 3.4 } : {};
        }
      });
    }

    function matrizActual() {
      var G = g();
      el("panel-matriz").innerHTML = FW.tabla(G.T.D[k], {
        esquina: "D<sup>(" + k + ")</sup>", filaK: k, colK: k,
        clase: function (i, j) { return (i === k || j === k) ? "ejek" : ""; }
      });
    }

    function rejilla() {
      var G = g(), s = "<table class='rejilla'><tr><th></th>", i = 0, j = 0;
      while (j < G.n) { s += "<th>" + j + "</th>"; j = j + 1; }
      s += "</tr>";
      while (i < G.n) {
        s += "<tr><th>" + i + "</th>";
        j = 0;
        while (j < G.n) {
          var c = i + "," + j;
          s += "<td><button data-celda='" + c + "' class='" + (marcas.indexOf(c) >= 0 ? "marca" : "") + "'>" +
               (i === j ? "·" : fmtCelda(i, j)) + "</button></td>";
          j = j + 1;
        }
        s += "</tr>";
        i = i + 1;
      }
      el("panel-rejilla").innerHTML = s + "</table>";
      Array.prototype.forEach.call(el("panel-rejilla").querySelectorAll("button"), function (b) {
        b.addEventListener("click", function () {
          var c = b.getAttribute("data-celda"), p = marcas.indexOf(c);
          if (p >= 0) { marcas.splice(p, 1); } else { marcas.push(c); }
          rejilla();
        });
      });
    }

    function fmtCelda(i, j) { return FW.fmt(g().T.D[k][i][j]); }

    function siguiente() {
      var G = g();
      el("panel-siguiente").innerHTML = visto
        ? FW.tabla(G.T.D[k + 1], {
            esquina: "D<sup>(" + (k + 1) + ")</sup>",
            clase: function (i, j) { return G.T.D[k + 1][i][j] !== G.T.D[k][i][j] ? "cambia" : ""; }
          })
        : "<p class='nota' style='margin:0'>Aparece al comprobar las parejas.</p>";
    }

    function botonesK() {
      var G = g(), s = "<span class='nota' style='margin-top:0'>Paso:</span>", t = 0;
      while (t < G.n) {
        s += "<button data-k='" + t + "' class='" + (t === k ? "primario" : "") + "'>k = " + t + "</button>";
        t = t + 1;
      }
      el("presets-k").innerHTML = s;
      Array.prototype.forEach.call(el("presets-k").querySelectorAll("button"), function (b) {
        b.addEventListener("click", function () { k = parseInt(b.getAttribute("data-k"), 10); preparar(); });
      });
    }

    function preparar() {
      var G = g(), p = E.pareja(G, k);
      marcas = []; visto = false;
      el("ver-texto").textContent = G.texto + " Aristas: " + FW.textoAristas(G.aristas) + ".";
      el("ver-paso").innerHTML = "Se permite pasar por el vértice <b>" + k + "</b>. Los intermedios permitidos son " +
        (k === 0 ? "ninguno todavía" : "{0, …, " + k + "}") + ".";
      el("pregunta-valor").innerHTML = "¿Cuánto vale <code>d[" + p.i + "][" + p.j + "]</code> después del paso?";
      el("valor").value = "";
      el("fb-marcas").className = "fb";
      el("fb-valor").className = "fb";
      botonesK();
      dibujo();
      matrizActual();
      rejilla();
      siguiente();
    }

    el("btn-marcas").addEventListener("click", function () {
      var r = E.evaluarMarcas(g(), k, marcas.slice());
      el("fb-marcas").className = "fb " + (r.ok ? "bien" : "mal");
      el("fb-marcas").textContent = r.msg;
      visto = true;
      siguiente();
    });
    el("btn-valor").addEventListener("click", function () {
      var r = E.evaluarValor(g(), k, el("valor").value);
      el("fb-valor").className = "fb " + (r.ok ? "bien" : "mal");
      el("fb-valor").textContent = r.msg;
    });

    var caja = "", t = 0;
    while (t < E.GRAFOS.length) {
      caja += "<button data-preset='" + t + "' class='" + (t === 0 ? "primario" : "") + "'>" + E.GRAFOS[t].boton + "</button>";
      t = t + 1;
    }
    el("presets-grafo").innerHTML = "<span class='nota' style='margin-top:0'>Grafo:</span>" + caja;
    Array.prototype.forEach.call(el("presets-grafo").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        idx = parseInt(b.getAttribute("data-preset"), 10);
        k = 0;
        Array.prototype.forEach.call(el("presets-grafo").querySelectorAll("button"), function (x) { x.classList.remove("primario"); });
        b.classList.add("primario");
        preparar();
      });
    });
    preparar();
  })();
}
