/* Ejercicio interactivo: reconstruir un camino con la matriz nex.
   nex e i se siguen hacia adelante hasta llegar a j, y antes de dar el primer
   salto hay que mirar que la pareja tenga camino. El nucleo vive en lib.js. */
var FW = (typeof module !== "undefined") ? require("./lib.js") : FW;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var INF = FW.INF, fmt = FW.fmt;

  var GRAFO = {
    n: 6,
    aristas: [[0, 1, 4], [1, 2, -2], [2, 3, 3], [3, 1, 5], [0, 4, 9], [4, 2, 1], [3, 5, 2], [5, 4, 6]],
    pos: [[50, 135], [185, 70], [310, 70], [440, 70], [185, 210], [440, 210]],
    curvas: { 3: 70 }
  };
  GRAFO.w = FW.pesos(GRAFO.n, GRAFO.aristas);
  var R = FW.fw(GRAFO.w);
  GRAFO.d = R.d;
  GRAFO.nex = R.nex;

  var PAREJAS = [[0, 4], [4, 3], [0, 5], [1, 4], [3, 0], [5, 1]];

  function existeArista(u, v) {
    var hay = false;
    GRAFO.aristas.forEach(function (a) { if (a[0] === u && a[1] === v) { hay = true; } });
    return hay;
  }

  function camino(i, j) { return FW.caminoDe(GRAFO.d, GRAFO.nex, i, j); }

  function escribir(c) { return c.join(" → "); }

  /* Lee lo que escribe el estudiante: una lista de vertices o que no hay camino. */
  function leer(texto) {
    var t = String(texto).trim().toLowerCase(), v;
    if (t === "") { return null; }
    if (/^(no|ninguno|no hay|no hay camino|nada|vacía|vacia|\[\])$/.test(t)) { return { tipo: "ninguno" }; }
    if (!/^[0-9\s,→>-]+$/.test(t)) { return null; }
    v = t.split(/[^0-9]+/).filter(function (x) { return x !== ""; }).map(function (x) { return parseInt(x, 10); });
    return v.length === 0 ? null : { tipo: "lista", v: v };
  }

  function evaluar(i, j, texto) {
    var leido = leer(texto), real = camino(i, j), d = GRAFO.d[i][j], t, u, v, peso;
    if (leido === null) {
      return { ok: false, msg: "Escriba los vértices del camino separados por espacios, o la palabra ninguno si no hay." };
    }
    if (leido.tipo === "ninguno") {
      if (real === null) {
        return { ok: true, msg: "Correcto: d[" + i + "][" + j + "] = ∞, así que la pareja no tiene camino. " +
                 "nex[" + i + "][" + j + "] quedó en " + GRAFO.nex[i][j] + " desde el arranque, y seguirlo imprimiría la arista " +
                 i + " → " + GRAFO.nex[i][j] + ", que no está en el grafo. Por eso se mira la distancia antes de dar el primer salto." };
      }
      return { ok: false, msg: "Sí hay camino: d[" + i + "][" + j + "] = " + fmt(d) + ". Siguiendo nex sale " + escribir(real) + "." };
    }
    if (real === null) {
      var entran = 0;
      GRAFO.aristas.forEach(function (a) { if (a[1] === j) { entran = entran + 1; } });
      return { ok: false, msg: "No hay camino de " + i + " a " + j + ": d[" + i + "][" + j + "] = ∞. " +
               (entran === 0 ? "Al vértice " + j + " no llega ninguna arista, así que no hay manera de entrar en él. "
                             : "Ninguna de las aristas que llegan a " + j + " sale de un vértice alcanzable desde " + i + ". ") +
               "nex[" + i + "][" + j + "] = " + GRAFO.nex[i][j] + " es el valor del arranque, no un camino." };
    }
    v = leido.v;
    if (v[0] !== i || v[v.length - 1] !== j) {
      return { ok: false, msg: "El camino tiene que empezar en " + i + " y terminar en " + j + ". El suyo va de " +
               v[0] + " a " + v[v.length - 1] + "." };
    }
    t = 0; peso = 0;
    while (t + 1 < v.length) {
      u = v[t]; var z = v[t + 1];
      if (!existeArista(u, z)) {
        return { ok: false, msg: "La arista " + u + " → " + z + " no está en el grafo. Los saltos salen de nex: desde " +
                 u + " el camino hacia " + j + " sigue por nex[" + u + "][" + j + "] = " + GRAFO.nex[u][j] + "." };
      }
      peso = peso + GRAFO.w[u][z];
      t = t + 1;
    }
    if (peso !== d) {
      return { ok: false, msg: "Ese camino existe y pesa " + fmt(peso) + ", pero la distancia es " + fmt(d) +
               ". El que deja nex es " + escribir(real) + "." };
    }
    var lecturas = real.slice(0, -1).map(function (u) { return "nex[" + u + "][" + j + "] = " + GRAFO.nex[u][j]; });
    return { ok: true, msg: "Correcto: " + escribir(real) + " pesa " + fmt(d) + ", que es lo que dice d[" + i + "][" + j + "]. " +
             "Los saltos salen de " + lecturas.join(", ") + "." };
  }

  /* Un salto del seguimiento, con lo que se lee en cada paso. */
  function saltos(i, j) {
    var c = camino(i, j), r = [], t = 0;
    if (c === null) { return null; }
    while (t + 1 < c.length) {
      r.push({ de: c[t], a: c[t + 1], peso: GRAFO.w[c[t]][c[t + 1]] });
      t = t + 1;
    }
    return r;
  }

  return { GRAFO: GRAFO, PAREJAS: PAREJAS, camino: camino, saltos: saltos, leer: leer,
           evaluar: evaluar, escribir: escribir, existeArista: existeArista };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, G = E.GRAFO, resueltas = 0, sel = 0, paso = 0;
    function el(id) { return document.getElementById(id); }

    function dibujo() {
      var c = E.camino(E.PAREJAS[sel][0], E.PAREJAS[sel][1]), hasta = c === null ? [] : c.slice(0, paso + 1);
      el("panel-grafo").innerHTML = GRAFOSVG.dibujar({
        n: G.n, pos: G.pos, aristas: G.aristas,
        arista: function (t) {
          var a = G.aristas[t], r = { color: "gris", grueso: 2 }, s = 0, usada = false;
          while (s + 1 < hasta.length) { if (hasta[s] === a[0] && hasta[s + 1] === a[1]) { usada = true; } s = s + 1; }
          if (usada) { r = { color: "morado", grueso: 3.6 }; }
          if (G.curvas[t]) { r.curva = G.curvas[t]; }
          return r;
        },
        nodo: function (u) {
          var s = {};
          if (u === E.PAREJAS[sel][0]) { s = { relleno: "#e7f2e8", borde: "#2e7d32", grueso: 3 }; }
          if (u === E.PAREJAS[sel][1]) { s = { relleno: "#fdf1dc", borde: "#e8a13d", grueso: 3 }; }
          if (hasta.length > 1 && u === hasta[hasta.length - 1]) { s.borde = "#1f5fa8"; s.grueso = 3.6; }
          return s;
        }
      });
    }

    function matrices() {
      var i = E.PAREJAS[sel][0], j = E.PAREJAS[sel][1];
      el("panel-d").innerHTML = FW.tabla(G.d, {
        esquina: "d", clase: function (a, b) { return a === i && b === j ? "ahora" : ""; }
      });
      el("panel-nex").innerHTML = FW.tabla(G.nex, {
        esquina: "nex", texto: function (a, b) { return String(G.nex[a][b]); },
        clase: function (a, b) { return b === j ? "ejek" : ""; }
      });
    }

    function filas() {
      var caja = el("parejas");
      caja.innerHTML = "";
      E.PAREJAS.forEach(function (p, t) {
        var f = document.createElement("div"), st = { listo: false };
        f.className = "fila-par";
        f.innerHTML = "<span class='rotulo'>de " + p[0] + " a " + p[1] + "</span>" +
          "<input type='text' class='camino' placeholder='" + p[0] + " … " + p[1] + ", o ninguno'>" +
          "<button class='primario'>Comprobar</button><div class='fb'></div>";
        var inp = f.querySelector("input"), fb = f.querySelector(".fb");
        f.querySelector("button").addEventListener("click", function () {
          var r = E.evaluar(p[0], p[1], inp.value);
          fb.className = "fb " + (r.ok ? "bien" : "mal");
          fb.textContent = r.msg;
          if (r.ok && !st.listo) { st.listo = true; resueltas = resueltas + 1; el("resueltas").textContent = resueltas; }
        });
        inp.addEventListener("focus", function () { sel = t; paso = 0; pintarSeguimiento(); });
        caja.appendChild(f);
      });
    }

    function pintarSeguimiento() {
      var i = E.PAREJAS[sel][0], j = E.PAREJAS[sel][1], s = E.saltos(i, j), txt;
      dibujo();
      matrices();
      el("ver-pareja").innerHTML = "Se sigue la pareja <b>(" + i + ", " + j + ")</b>. " +
        "Primero la guarda: <code>d[" + i + "][" + j + "] = " + FW.fmt(G.d[i][j]) + "</code>" +
        (s === null ? ", que es ∞, así que el camino no existe y no se da ningún salto."
                    : ", que es finito, así que el camino existe.");
      if (s === null) {
        el("ver-saltos").innerHTML = "<span class='par'>" + i + "</span>";
        el("ver-cuenta").textContent = "Sin la guarda, el seguimiento daría el salto a nex[" + i + "][" + j + "] = " +
          G.nex[i][j] + " e imprimiría una arista que no está en el grafo.";
        return;
      }
      txt = "<span class='par " + (paso === 0 ? "ahora" : "hecho") + "'>" + i + "</span>";
      var t = 0;
      while (t < paso) {
        txt += "<span class='flecha'>→</span><span class='par " + (t === paso - 1 ? "ahora" : "hecho") + "'>" + s[t].a + "</span>";
        t = t + 1;
      }
      el("ver-saltos").innerHTML = txt;
      el("ver-cuenta").textContent = paso === 0
        ? "Haga clic en el salto siguiente. El primero lee nex[" + i + "][" + j + "] = " + G.nex[i][j] + "."
        : (paso < s.length
            ? "nex[" + s[paso - 1].de + "][" + j + "] = " + s[paso - 1].a + ", y la arista pesa " + FW.fmt(s[paso - 1].peso) +
              ". Lo que lleva acumulado: " + FW.fmt(s.slice(0, paso).reduce(function (x, y) { return x + y.peso; }, 0)) + "."
            : "Llegó a " + j + ". El camino pesa " + FW.fmt(G.d[i][j]) + ", que es lo que dice d[" + i + "][" + j + "].");
    }

    el("btn-salto").addEventListener("click", function () {
      var s = E.saltos(E.PAREJAS[sel][0], E.PAREJAS[sel][1]);
      if (s !== null && paso < s.length) { paso = paso + 1; }
      pintarSeguimiento();
    });
    el("btn-reiniciar").addEventListener("click", function () { paso = 0; pintarSeguimiento(); });

    var bot = "", t = 0;
    while (t < E.PAREJAS.length) {
      bot += "<button data-par='" + t + "' class='" + (t === 0 ? "primario" : "") + "'>(" +
             E.PAREJAS[t][0] + ", " + E.PAREJAS[t][1] + ")</button>";
      t = t + 1;
    }
    el("presets-par").innerHTML = "<span class='nota' style='margin-top:0'>Pareja:</span>" + bot;
    Array.prototype.forEach.call(el("presets-par").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        sel = parseInt(b.getAttribute("data-par"), 10);
        paso = 0;
        Array.prototype.forEach.call(el("presets-par").querySelectorAll("button"), function (x) { x.classList.remove("primario"); });
        b.classList.add("primario");
        pintarSeguimiento();
      });
    });

    el("ver-aristas").textContent = "Aristas: " + FW.textoAristas(G.aristas) + ".";
    el("total").textContent = E.PAREJAS.length;
    filas();
    pintarSeguimiento();
  })();
}
