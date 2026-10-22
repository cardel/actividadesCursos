/* Ejercicio interactivo: Dijkstra con pesos negativos.
   Usa dijkstraST y dijkstra de lib.js, que reproducen 250331-agra-dijkstra.py, y Bellman-Ford como referencia. */
var CDD = (typeof module !== "undefined") ? require("./lib.js") : CDD;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var fmt = CDD.fmt;

  var GRAFOS = [
    { boton: "Cinco vértices, un atajo hacia t",
      texto: "Cinco vértices. Desde s hay una arista a t y un camino más largo que llega a t por una arista negativa.",
      n: 5, s: 0, t: 1,
      aristas: [[0, 1, 4], [0, 2, 5], [2, 1, -3], [1, 3, 2], [2, 3, 6], [3, 4, 1]],
      pos: [[50, 125], [250, 55], [250, 195], [400, 125], [520, 125]] },
    { boton: "Cinco vértices, la negativa sale de s",
      texto: "Cinco vértices. La única arista negativa sale de la fuente.",
      n: 5, s: 0, t: 4,
      aristas: [[0, 1, -2], [0, 2, 3], [1, 3, 5], [2, 3, 1], [3, 4, 2]],
      pos: [[50, 125], [190, 55], [190, 195], [350, 125], [500, 125]] },
    { boton: "Seis vértices, la negativa va casi al final",
      texto: "Seis vértices. La arista negativa está en el tramo final, cerca de t.",
      n: 6, s: 0, t: 5,
      aristas: [[0, 1, 2], [0, 2, 1], [1, 3, 3], [2, 3, 5], [3, 4, -2], [4, 5, 3], [3, 5, 4]],
      pos: [[40, 125], [160, 55], [160, 195], [300, 125], [420, 55], [520, 125]] },
    { boton: "Seis vértices, una negativa que rebaja un vértice ya visto",
      texto: "Seis vértices. Un camino largo llega al vértice 2, y una arista negativa de 2 a 3 rebaja el vértice 3, por el que se alcanza t.",
      n: 6, s: 0, t: 4,
      aristas: [[0, 1, 3], [0, 2, 6], [1, 3, 2], [3, 4, 1], [2, 3, -5], [2, 5, 1]],
      pos: [[40, 125], [160, 55], [160, 195], [320, 125], [460, 125], [320, 215]] },
    { boton: "Seis vértices, t con una arista directa",
      texto: "Seis vértices. Hay una arista directa de s a t y un camino más barato que usa una arista negativa.",
      n: 6, s: 0, t: 5,
      aristas: [[0, 5, 6], [0, 1, 2], [1, 2, 5], [2, 5, -4], [0, 3, 1], [3, 4, 3], [4, 5, 1]],
      pos: [[40, 125], [160, 55], [300, 55], [160, 195], [300, 195], [460, 125]] },
    { boton: "Cinco vértices, la negativa llega a un vértice intermedio",
      texto: "Cinco vértices en cadena. La arista negativa llega al vértice 1, que está en el camino hacia t.",
      n: 5, s: 0, t: 4,
      aristas: [[0, 1, 3], [0, 2, 5], [2, 1, -4], [1, 3, 1], [3, 4, 1]],
      pos: [[40, 125], [200, 55], [200, 195], [350, 100], [500, 100]] }
  ];
  GRAFOS.forEach(function (g) { g.G = CDD.construir(g.n, g.aristas); });

  /* Verdad sobre un grafo: lo que devuelve dijkstraST, el primer vertice que sale mal y la categoria A, B o C. */
  function analizar(g) {
    var st = CDD.dijkstraST(g.G, g.s, g.t), ref = CDD.bf(g.G, g.s).dist, todos = CDD.dijkstraTodos(g.G, g.s), falla = null, i = 0;
    while (i < st.ext.length && falla === null) {
      var e = st.ext[i];
      if ((e.acepta || e.esT) && e.du !== ref[e.u]) { falla = e; }
      i = i + 1;
    }
    var ok = st.valor === ref[g.t], cat = !ok ? "C" : (falla !== null ? "B" : "A");
    var repetidos = [];
    todos.veces.forEach(function (c, v) { if (c > 1) { repetidos.push(v); } });
    return { st: st, ref: ref, todos: todos, falla: falla, ok: ok, cat: cat, repetidos: repetidos };
  }

  var OPCIONES = [
    { id: "A", texto: "dijkstraST devuelve la distancia correcta y ningún vértice sale de la cola con una distancia que todavía pueda bajar." },
    { id: "B", texto: "dijkstraST devuelve la distancia correcta, pero algún vértice sale de la cola con una distancia que todavía puede bajar." },
    { id: "C", texto: "dijkstraST devuelve un valor mayor que la distancia mínima de s a t." },
    { id: "D", texto: "dijkstra, la versión de uno a todos, termina con alguna distancia distinta de la de Bellman-Ford." }
  ];

  function evaluar1(id, g) {
    var a = analizar(g), t = g.t, real = fmt(a.ref[t]), dev = fmt(a.st.valor), f = a.falla;
    var fallaTxt = f === null ? "" : "El vértice " + f.u + " sale de la cola con " + fmt(f.du) + " y su distancia mínima es " + fmt(a.ref[f.u]) + ".";
    if (id === a.cat) {
      var m = { A: "Correcto: dijkstraST devuelve " + dev + ", la distancia mínima, y todos los vértices que salen antes de t salen con su valor final. La arista negativa no llegó a estorbar.",
                B: "Correcto: dijkstraST devuelve " + dev + ", que es la distancia mínima, aunque la propiedad ya se había roto. " + fallaTxt + " Una pareja nueva de ese vértice lo corrige antes de que salga t.",
                C: "Correcto: dijkstraST devuelve " + dev + " y la distancia mínima es " + real + ". " + fallaTxt + " La pareja que sale primero gana y el algoritmo se detiene sin ver el camino mejor." }[id];
      return { ok: true, msg: m };
    }
    if (id === "D") {
      return { ok: false, msg: "No: dijkstra acepta una pareja solo si dist[u] == du, pero cada vez que una arista mejora un vértice lo vuelve a meter. Sin ciclos negativos eso lo lleva al valor correcto, como Bellman-Ford. Lo que paga es procesar algunos vértices más de una vez" +
        (a.repetidos.length > 0 ? ": aquí se repiten los vértices " + a.repetidos.join(", ") + "." : ": en este grafo no se repite ninguno.") };
    }
    if (id === "A") {
      return { ok: false, msg: a.cat === "C" ? "No: dijkstraST devuelve " + dev + " y la distancia mínima es " + real + ". " + fallaTxt : "El valor es el correcto, pero la propiedad sí se rompe. " + fallaTxt };
    }
    if (id === "B") {
      return { ok: false, msg: a.cat === "A" ? "Ningún vértice sale de la cola con una distancia que baje después: la negativa no se usa antes de que t salga, o no cambia nada. Todos salen con su valor final." :
        "No: el valor que devuelve dijkstraST no es el correcto. Devuelve " + dev + " y la distancia mínima es " + real + ". " + fallaTxt };
    }
    return { ok: false, msg: a.cat === "A" ? "El valor devuelto es " + dev + ", que es la distancia mínima." : "El valor devuelto es " + dev + ", que es la distancia mínima " + real + ", aunque la propiedad se rompe en otro vértice. " + fallaTxt };
  }

  function evaluar2(x, g) {
    var a = analizar(g), f = a.falla, ent = null;
    a.st.ext.forEach(function (e) { if (e.u === x && (e.acepta || e.esT) && ent === null) { ent = e; } });
    if (x === "ninguno") {
      return f === null ? { ok: true, msg: "Correcto: todos los vértices que salen antes de que el algoritmo se detenga salen con su distancia mínima." } :
        { ok: false, msg: "Sí hay uno. El vértice " + f.u + " sale de la cola con " + fmt(f.du) + " y su distancia mínima es " + fmt(a.ref[f.u]) + "." };
    }
    if (f !== null && x === f.u) {
      return { ok: true, msg: "Correcto: el vértice " + x + " sale con " + fmt(f.du) + " y su distancia mínima es " + fmt(a.ref[x]) + ". Llega después otra pareja más barata por la arista negativa, pero ya salió." };
    }
    if (ent === null) { return { ok: false, msg: "El vértice " + x + " no sale de la cola antes de que el algoritmo se detenga" + (f === null ? "." : ", así que no puede ser el primero que sale mal. Es el " + f.u + ".") }; }
    if (ent.du === a.ref[x]) {
      return { ok: false, msg: "El vértice " + x + " sale con " + fmt(ent.du) + " y esa es su distancia mínima: sale bien." + (f === null ? " Ningún vértice sale mal en este grafo." : " El primero que sale mal es el " + f.u + ".") };
    }
    return { ok: false, msg: "El vértice " + x + " también sale con " + fmt(ent.du) + " cuando su distancia mínima es " + fmt(a.ref[x]) + ", pero no es el primero. El primero es el " + f.u + "." };
  }

  /* Tabla lado a lado: una fila por vertice. */
  function filas(g) {
    var a = analizar(g), r = [];
    a.ref.forEach(function (d, v) {
      var ext = null;
      a.st.ext.forEach(function (e) { if (e.u === v && (e.acepta || e.esT) && ext === null) { ext = e; } });
      r.push({ v: v, bf: d, dij: a.todos.dist[v], veces: a.todos.veces[v], st: ext === null ? null : ext.du });
    });
    return { filas: r, analisis: a };
  }

  return { GRAFOS: GRAFOS, OPCIONES: OPCIONES, analizar: analizar, evaluar1: evaluar1, evaluar2: evaluar2, filas: filas };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, idx = 0, elegida1 = null, elegida2 = null, F = CDD.fmt;
    function g() { return E.GRAFOS[idx]; }
    function el(id) { return document.getElementById(id); }

    function dibujo() {
      var G = g();
      el("panel-grafo").innerHTML = GRAFOSVG.dibujar({
        n: G.n, pos: G.pos, aristas: G.aristas,
        arista: function (i) { return G.aristas[i][2] < 0 ? { color: "rojo", grueso: 3 } : { color: "gris", grueso: 2 }; },
        nodo: function (u) {
          var s = { relleno: "#ffffff", borde: "#6b7280" };
          if (u === G.s) { s.relleno = "#e3edf8"; s.borde = "#1f5fa8"; s.nota = "s"; }
          if (u === G.t) { s.relleno = "#fdf1dc"; s.borde = "#e8a13d"; s.nota = "t"; s.notaColor = "#a86a12"; }
          return s;
        }
      });
    }

    function pintarOpciones() {
      var c1 = el("opciones-1"), c2 = el("opciones-2"), G = g();
      c1.innerHTML = ""; c2.innerHTML = "";
      E.OPCIONES.forEach(function (o) {
        var b = document.createElement("button");
        b.className = "opcion" + (elegida1 === o.id ? " elegida" : "");
        b.textContent = o.texto;
        b.addEventListener("click", function () { elegida1 = o.id; pintarOpciones(); });
        c1.appendChild(b);
      });
      var v = 0, lista = [];
      while (v < G.n) { lista.push(v); v = v + 1; }
      lista.push("ninguno");
      lista.forEach(function (x) {
        var b = document.createElement("button");
        b.className = elegida2 === x ? "primario" : "";
        b.textContent = x === "ninguno" ? "ninguno" : "vértice " + x;
        b.addEventListener("click", function () { elegida2 = x; pintarOpciones(); });
        c2.appendChild(b);
      });
    }

    function mostrar(id, r) {
      var f = el(id);
      f.className = "fb " + (r.ok ? "bien" : "mal");
      f.textContent = r.msg;
    }

    function limpiar() {
      el("fb-1").className = "fb"; el("fb-2").className = "fb"; el("lado").innerHTML = "";
      elegida1 = null; elegida2 = null;
      el("ver-texto").textContent = g().texto + " Fuente " + g().s + ", destino " + g().t + ". Aristas: " + CDD.textoAristas(g().aristas) + ".";
      dibujo(); pintarOpciones();
    }

    function lado() {
      var r = E.filas(g()), a = r.analisis, G = g();
      var s = "<table><tr><th>v</th><th>Bellman-Ford</th><th>dijkstra</th><th>veces que se procesa</th><th>sale en dijkstraST con</th></tr>";
      r.filas.forEach(function (f) {
        s += "<tr><td>" + f.v + "</td><td>" + F(f.bf) + "</td><td>" + F(f.dij) + "</td><td" + (f.veces > 1 ? " class='mejora'" : "") + ">" + f.veces + "</td><td" +
             (f.st !== null && f.st !== f.bf ? " style='background:var(--rojo-suave);font-weight:700'" : "") + ">" + (f.st === null ? "no sale" : F(f.st)) + "</td></tr>";
      });
      s += "</table><p class='nota'>dijkstraST(G, " + G.s + ", " + G.t + ") devuelve " + F(a.st.valor) + "; la distancia mínima es " + F(a.ref[G.t]) +
           ". Verde: un vértice que dijkstra procesa más de una vez. Rojo: un vértice que sale de la cola en dijkstraST con una distancia mayor que la mínima.</p>";
      el("lado").innerHTML = s;
    }

    el("comprobar-1").addEventListener("click", function () {
      mostrar("fb-1", elegida1 === null ? { ok: false, msg: "Escoja una opción primero." } : E.evaluar1(elegida1, g()));
    });
    el("comprobar-2").addEventListener("click", function () {
      mostrar("fb-2", elegida2 === null ? { ok: false, msg: "Escoja un vértice o la opción ninguno." } : E.evaluar2(elegida2, g()));
    });
    el("btn-correr").addEventListener("click", lado);

    var caja = el("presets-grafo");
    caja.innerHTML = '<span class="nota" style="margin-top:0">Grafo:</span>';
    E.GRAFOS.forEach(function (gr, i) {
      var b = document.createElement("button");
      b.textContent = (i + 1) + ". " + gr.boton;
      b.className = i === 0 ? "primario" : "";
      b.addEventListener("click", function () {
        idx = i;
        Array.prototype.forEach.call(caja.querySelectorAll("button"), function (x) { x.classList.remove("primario"); });
        b.classList.add("primario");
        limpiar();
      });
      caja.appendChild(b);
    });
    limpiar();
  })();
}
