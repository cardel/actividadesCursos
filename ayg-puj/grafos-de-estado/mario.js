/* Ejercicio interactivo: Super Mario como grafo de estado.
   La simulacion reproduce la rama de un caso de main() en 10269-super-mario.py,
   linea por linea; la cola se guarda ordenada por tupla (c, u, l, k), que es el orden en que heappop las saca. */
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var CODIGO = [
    { num: null, txt: "    # estado (u, l, k): lugar, carga que le" },
    { num: null, txt: "    # queda a la bota (0 sin bota) y usos" },
    { num: null, txt: "    # vis[estado]: menor tiempo conocido" },
    { num: 25, txt: "    queue, vis, flag = [], dict(), False" },
    { num: 26, txt: "    heappush(queue, (0, 1, 0, K))" },
    { num: 27, txt: "    vis[(1, 0, K)] = 0" },
    { num: 28, txt: "    while len(queue) > 0 and not flag:" },
    { num: 29, txt: "      (c, u, l, k) = heappop(queue)" },
    { num: null, txt: "      # al salir a + b, c es el mínimo" },
    { num: 32, txt: "      if u == a + b: flag = True" },
    { num: 33, txt: "      else:" },
    { num: null, txt: "        # tupla vieja: se descarta" },
    { num: 35, txt: "        if vis[(u, l, k)] == c:" },
    { num: null, txt: "          # se coloca los zapatos especiales" },
    { num: 37, txt: "          if l != L and k > 0:" },
    { num: 38, txt: "            if (u, L, k - 1) not in vis or vis[(u, L, k - 1)] > c:" },
    { num: 39, txt: "              heappush(queue, (c, u, L, k - 1))" },
    { num: 40, txt: "              vis[(u, L, k - 1)] = c" },
    { num: 41, txt: "          for (v, p) in G[u]:" },
    { num: 42, txt: "            if (v, 0, k) not in vis or vis[(v, 0, k)] > c + p:" },
    { num: null, txt: "              # se mueve sin usar los zapatos" },
    { num: 44, txt: "              heappush(queue, (c + p, v, 0, k))" },
    { num: 45, txt: "              vis[(v, 0, k)] = c + p" },
    { num: null, txt: "            # se mueve usando los zapatos" },
    { num: null, txt: "            # alcanza la carga y u es aldea" },
    { num: null, txt: "            # o la carrera empieza en u" },
    { num: 49, txt: "            if l >= p and (u <= a or l == L):" },
    { num: 50, txt: "              if (v, l - p, k) not in vis or vis[(v, l - p, k)] > c:" },
    { num: 51, txt: "                heappush(queue, (c, v, l - p, k))" },
    { num: 52, txt: "                vis[(v, l - p, k)] = c" },
    { num: 53, txt: "    print(c)" }
  ];

  /* El mapa: aldeas 1..a, castillos a+1..a+b, carga L de la bota y usos K. */
  var MAPA = {
    a: 2, b: 2, L: 5, K: 1,
    aristas: [[1, 2, 3], [2, 3, 4], [3, 4, 2], [1, 3, 7], [2, 4, 6]],
    pos: [[0, 0], [60, 170], [220, 60], [380, 170], [520, 60]]
  };

  function grafo(m) {
    var G = [], i = 0;
    while (i <= m.a + m.b) { G.push([]); i = i + 1; }
    m.aristas.forEach(function (e) { G[e[0]].push([e[1], e[2]]); G[e[1]].push([e[0], e[2]]); });
    return G;
  }

  function peso(m, u, v) {
    var r = null;
    m.aristas.forEach(function (e) { if ((e[0] === u && e[1] === v) || (e[0] === v && e[1] === u)) { r = e[2]; } });
    return r;
  }

  function cmp(x, y) {
    var i = 0;
    while (i < 3 && x[i] === y[i]) { i = i + 1; }
    return x[i] - y[i];
  }
  function meter(cola, t) { cola.push(t); cola.sort(cmp); }
  function clave(u, l, k) { return u + "," + l + "," + k; }

  /* Un caso de main(): devuelve los pasos y, al final, lo que imprime. */
  function sim(m) {
    var G = grafo(m), a = m.a, b = m.b, L = m.L, K = m.K, pasos = [], cola = [], vis = new Map(), flag = false, salida = [];
    var c = null, u = null, l = null, k = null, v = null, p = null;
    function paso(linea, extra) {
      var q = { linea: linea, c: c, u: u, l: l, k: k, v: v, p: p, cola: cola.map(function (t) { return t.slice(); }),
                vis: Array.from(vis.entries()), flag: flag, salida: salida.slice() }, f;
      for (f in extra) { q[f] = extra[f]; }
      pasos.push(q);
    }
    var t, j, ll;
    paso(25, {});
    meter(cola, [0, 1, 0, K]);
    paso(26, {});
    vis.set(clave(1, 0, K), 0);
    paso(27, {});
    while (cola.length > 0 && !flag) {
      paso(28, {});
      t = cola.shift(); c = t[0]; u = t[1]; l = t[2]; k = t[3]; v = null; p = null;
      paso(29, {});
      if (u === a + b) { flag = true; }
      paso(32, {});
      if (!(u === a + b)) {
        paso(35, {});
        if (vis.get(clave(u, l, k)) === c) {
          paso(37, {});
          if (l !== L && k > 0) {
            paso(38, {});
            if (!vis.has(clave(u, L, k - 1)) || vis.get(clave(u, L, k - 1)) > c) {
              meter(cola, [c, u, L, k - 1]);
              paso(39, {});
              vis.set(clave(u, L, k - 1), c);
              paso(40, {});
            }
          }
          j = 0;
          while (j < G[u].length) {
            v = G[u][j][0]; p = G[u][j][1];
            paso(41, {});
            paso(42, {});
            if (!vis.has(clave(v, 0, k)) || vis.get(clave(v, 0, k)) > c + p) {
              meter(cola, [c + p, v, 0, k]);
              paso(44, {});
              vis.set(clave(v, 0, k), c + p);
              paso(45, {});
            }
            paso(49, {});
            if (l >= p && (u <= a || l === L)) {
              paso(50, {});
              ll = l - p;
              if (!vis.has(clave(v, ll, k)) || vis.get(clave(v, ll, k)) > c) {
                meter(cola, [c, v, ll, k]);
                paso(51, {});
                vis.set(clave(v, ll, k), c);
                paso(52, {});
              }
            }
            j = j + 1;
          }
        }
      }
      v = null; p = null;
    }
    salida.push(String(c));
    paso(53, {});
    return pasos;
  }

  /* Un movimiento desde un estado: devuelve {ok, u, l, k, dc} o {ok: false, razon}. */
  function aplicar(m, e, acc) {
    var w, r;
    if (acc.tipo === "calzar") {
      if (e.l === m.L) { r = { ok: false, razon: "la bota ya está con la carga completa, " + m.L }; }
      else if (e.k === 0) { r = { ok: false, razon: "no quedan usos de la bota" }; }
      else { r = { ok: true, u: e.u, l: m.L, k: e.k - 1, dc: 0 }; }
    } else {
      w = peso(m, e.u, acc.v);
      if (w === null) { r = { ok: false, razon: "no hay vía entre " + e.u + " y " + acc.v }; }
      else if (acc.tipo === "caminar") { r = { ok: true, u: acc.v, l: 0, k: e.k, dc: w }; }
      else {
        var razones = [];
        if (e.l < w) { razones.push("la carga no alcanza: l = " + e.l + " y la vía pesa " + w); }
        if (!(e.u <= m.a || e.l === m.L)) { razones.push("en un castillo solo se corre si la carrera empieza ahí, con la bota recién calzada y la carga completa, " + m.L); }
        r = razones.length === 0 ? { ok: true, u: acc.v, l: e.l - w, k: e.k, dc: 0 } : { ok: false, razon: razones.join(", y además ") };
      }
    }
    return r;
  }

  var PREGUNTAS = [
    { estado: { u: 1, l: 0, k: 1, c: 0 }, acc: { tipo: "caminar", v: 2 }, texto: "Se camina por la vía 1–2, sin usar la bota." },
    { estado: { u: 2, l: 0, k: 1, c: 3 }, acc: { tipo: "calzar" }, texto: "Se calza la bota en la aldea 2." },
    { estado: { u: 2, l: 5, k: 0, c: 3 }, acc: { tipo: "correr", v: 3 }, texto: "Con la bota cargada se corre por la vía 2–3." },
    { estado: { u: 3, l: 1, k: 0, c: 3 }, acc: { tipo: "correr", v: 4 }, texto: "Con la bota que queda se intenta correr por la vía 3–4." },
    { estado: { u: 3, l: 1, k: 0, c: 3 }, acc: { tipo: "caminar", v: 4 }, texto: "Se camina por la vía 3–4, sin usar la bota." },
    { estado: { u: 3, l: 5, k: 1, c: 7 }, acc: { tipo: "correr", v: 4 }, texto: "La bota acaba de calzarse en el castillo 3 y se corre por la vía 3–4." }
  ];
  PREGUNTAS.forEach(function (q) { q.res = aplicar(MAPA, q.estado, q.acc); });

  /* dado: {imposible, u, l, k, dc} con numeros o null. */
  function evaluarPregunta(q, dado) {
    var r = q.res, tipo = q.acc.tipo, pistas = [];
    if (!r.ok) {
      return dado.imposible ? { ok: true, msg: "Correcto: no se puede, porque " + r.razon + "." } :
        { ok: false, msg: "Esa transición no existe: " + r.razon + "." };
    }
    if (dado.imposible) { return { ok: false, msg: "Sí se puede. El estado siguiente es (" + r.u + ", " + r.l + ", " + r.k + ") y cuesta " + r.dc + "." }; }
    if (dado.u === null || dado.l === null || dado.k === null || dado.dc === null) { return { ok: false, msg: "Complete el lugar, la carga, los usos y el costo, o marque que no se puede." }; }
    if (dado.u !== r.u) { pistas.push("el lugar al que se llega es " + r.u); }
    if (dado.l !== r.l) {
      pistas.push(tipo === "caminar" ? "al caminar la carga de la bota queda en 0, porque se pierde (l = 0)" :
                  tipo === "calzar" ? "al calzarse la bota queda con la carga completa, L = " + q.res.l :
                  "al correr se gasta el peso de la vía: l − p = " + q.estado.l + " − " + peso(MAPA, q.estado.u, q.acc.v) + " = " + r.l);
    }
    if (dado.k !== r.k) { pistas.push(tipo === "calzar" ? "calzarse gasta un uso: k − 1 = " + r.k : "los usos no cambian al moverse: k = " + r.k); }
    if (dado.dc !== r.dc) {
      pistas.push(tipo === "caminar" ? "caminar cuesta el peso de la vía, " + r.dc : "correr con la bota y calzarla no cuestan tiempo: el costo es 0");
    }
    return pistas.length === 0 ? { ok: true, msg: "Correcto: (" + r.u + ", " + r.l + ", " + r.k + ") con costo " + r.dc + ", y el tiempo acumulado pasa a " + (q.estado.c + r.dc) + "." } :
      { ok: false, msg: "No del todo: " + pistas.join("; ") + "." };
  }

  return { CODIGO: CODIGO, MAPA: MAPA, sim: sim, aplicar: aplicar, PREGUNTAS: PREGUNTAS, evaluarPregunta: evaluarPregunta, grafo: grafo, peso: peso };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, M = E.MAPA, el = function (id) { return document.getElementById(id); };

    function dibujo(a) {
      el("panel-grafo").innerHTML = GRAFOSVG.dibujar({
        n: M.a + M.b + 1, pos: M.pos, dirigido: false, aristas: M.aristas,
        arista: function (i) { return { color: a !== null && a.v !== null && ((M.aristas[i][0] === a.u && M.aristas[i][1] === a.v) || (M.aristas[i][1] === a.u && M.aristas[i][0] === a.v)) && a.linea >= 41 ? "azul" : "gris", grueso: 2.4 }; },
        nodo: function (u) {
          var s = u === 0 ? { relleno: "#ffffff", borde: "#ffffff", tinta: "#ffffff" } :
            (u <= M.a ? { relleno: "#e3edf8", borde: "#1f5fa8" } : { relleno: "#fdf1dc", borde: "#e8a13d", cuadrado: true });
          if (u > 0 && a !== null && a.u === u) { s.grueso = 4; s.borde = "#b3261e"; }
          return s;
        },
        nombre: function (u) { return u === 0 ? "" : u; }
      });
    }

    function colaHtml(a) {
      if (a === null || a.cola.length === 0) { return "<span class='nota' style='margin:0'>vacía</span>"; }
      return a.cola.map(function (t, i) {
        var vieja = a.vis.some(function (x) { return x[0] === t[1] + "," + t[2] + "," + t[3] && x[1] !== t[0]; });
        return "<span class='par" + (vieja ? " vieja" : "") + (i === 0 && !vieja ? " sale" : "") + "'>(" + t.join(", ") + ")</span>";
      }).join(" ");
    }

    function visHtml(a) {
      if (a === null || a.vis.length === 0) { return "<span class='nota' style='margin:0'>vacío</span>"; }
      return a.vis.map(function (x) { return "(" + x[0] + ") → " + x[1]; }).join("<br>");
    }

    function alPintar(e) {
      var a = e.actual;
      dibujo(a);
      el("ver-cola").innerHTML = colaHtml(a);
      el("ver-vis").innerHTML = visHtml(a);
      el("ver-salida").textContent = a === null ? "" : a.salida.join("\n");
    }

    /* Preguntas sobre transiciones */
    var caja = el("preguntas");
    E.PREGUNTAS.forEach(function (q, i) {
      var d = document.createElement("div"), e = q.estado;
      d.className = "fila-tr";
      d.style.gridTemplateColumns = "1fr";
      d.innerHTML = "<div><b>" + (i + 1) + ".</b> Estado <code class='exp'>(" + e.u + ", " + e.l + ", " + e.k + ")</code>, tiempo acumulado " + e.c + ". " + q.texto + "</div>" +
        "<div class='res'>Estado siguiente: (<input class='mini' type='number' data-c='u'>, <input class='mini' type='number' data-c='l'>, <input class='mini' type='number' data-c='k'>) " +
        "costo <input class='mini' type='number' data-c='dc'> <label><input type='checkbox' data-c='imp'> no se puede</label> <button>Comprobar</button></div><div class='fb'></div>";
      d.querySelector("button").addEventListener("click", function () {
        function num(c) { var x = parseInt(d.querySelector("[data-c=" + c + "]").value, 10); return isNaN(x) ? null : x; }
        var r = E.evaluarPregunta(q, { imposible: d.querySelector("[data-c=imp]").checked, u: num("u"), l: num("l"), k: num("k"), dc: num("dc") }), fb = d.querySelector(".fb");
        fb.className = "fb " + (r.ok ? "bien" : "mal");
        fb.textContent = r.msg;
      });
      caja.appendChild(d);
    });

    var tuplas = E.sim(M), imprime = parseInt(tuplas[tuplas.length - 1].salida[0], 10);
    el("btn-comprobar").addEventListener("click", function () {
      var valor = parseInt(el("prediccion").value, 10), v = el("veredicto");
      v.className = isNaN(valor) || valor !== imprime ? "veredicto mal" : "veredicto bien";
      v.textContent = isNaN(valor) ? "Escriba un número primero." : (valor === imprime ?
        "Correcto: el programa imprime " + imprime + "." : "No. El programa imprime " + imprime + ". Ejecute el código y mire en qué estado sale el castillo " + (M.a + M.b) + " de la cola.");
    });

    Motor.iniciar({
      codigo: E.CODIGO, simular: function () { return E.sim(M); },
      chips: [{ campo: "c", rotulo: "c" }, { campo: "u", rotulo: "u" }, { campo: "l", rotulo: "l" }, { campo: "k", rotulo: "k" }, { campo: "v", rotulo: "v" }, { campo: "p", rotulo: "p" }],
      paramsIniciales: 0, alPintar: alPintar
    });
  })();
}
