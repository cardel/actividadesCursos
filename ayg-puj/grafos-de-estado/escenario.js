/* Ejercicio interactivo: plantear un escenario nuevo como grafo de estado.
   Un carro electrico con bateria de capacidad C recorre una ciudad y en
   algunos cruces hay estacion de carga. Las ocho preguntas son las que se
   responden de cualquier problema de este tipo, y la ultima se comprueba
   corriendo Dijkstra sobre los estados. */
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var CIUDAD = {
    n: 5,
    C: 8,
    t: 5,
    estaciones: [1, 3],
    s: 0,
    f: 4,
    vias: [[0, 1, 3], [0, 3, 6], [1, 2, 5], [1, 3, 2], [2, 4, 4], [3, 4, 7]],
    pos: [[60, 130], [210, 55], [370, 55], [210, 205], [440, 150]]
  };
  CIUDAD.estados = CIUDAD.n * (CIUDAD.C + 1);

  function hayEstacion(a) { return CIUDAD.estaciones.indexOf(a) >= 0; }

  function vecinos(a) {
    var r = [];
    CIUDAD.vias.forEach(function (v) {
      if (v[0] === a) { r.push([v[1], v[2]]); }
      if (v[1] === a) { r.push([v[0], v[2]]); }
    });
    return r;
  }

  /* Dijkstra sobre los estados (cruce, bateria). La clave es a * 100 + b. */
  function resolver() {
    var dist = {}, prev = {}, cola = [[0, CIUDAD.s, CIUDAD.C]], vistos = {}, mejor = null, cuantos = 0;
    dist[CIUDAD.s * 100 + CIUDAD.C] = 0;
    while (cola.length > 0) {
      cola.sort(function (x, y) { return x[0] - y[0]; });
      var cur = cola.shift(), c = cur[0], a = cur[1], b = cur[2], cl = a * 100 + b;
      if (dist[cl] === c && !vistos[cl]) {
        vistos[cl] = true;
        cuantos = cuantos + 1;
        if (a === CIUDAD.f && mejor === null) { mejor = cl; }
        if (hayEstacion(a) && b < CIUDAD.C) {
          var k1 = a * 100 + CIUDAD.C;
          if (dist[k1] === undefined || c + CIUDAD.t < dist[k1]) {
            dist[k1] = c + CIUDAD.t;
            prev[k1] = { de: cl, accion: "cargar en " + a, costo: CIUDAD.t };
            cola.push([dist[k1], a, CIUDAD.C]);
          }
        }
        vecinos(a).forEach(function (v) {
          if (b >= v[1]) {
            var k2 = v[0] * 100 + (b - v[1]);
            if (dist[k2] === undefined || c + v[1] < dist[k2]) {
              dist[k2] = c + v[1];
              prev[k2] = { de: cl, accion: "recorrer " + a + "–" + v[0], costo: v[1] };
              cola.push([dist[k2], v[0], b - v[1]]);
            }
          }
        });
      }
    }
    var fin = null, b = 0;
    while (b <= CIUDAD.C) {
      var k = CIUDAD.f * 100 + b;
      if (dist[k] !== undefined && (fin === null || dist[k] < dist[fin])) { fin = k; }
      b = b + 1;
    }
    var ruta = [], cl2 = fin;
    while (cl2 !== undefined && prev[cl2] !== undefined) {
      ruta.unshift({ a: Math.floor(cl2 / 100), b: cl2 % 100, accion: prev[cl2].accion, costo: prev[cl2].costo });
      cl2 = prev[cl2].de;
    }
    ruta.unshift({ a: CIUDAD.s, b: CIUDAD.C, accion: "salida", costo: 0 });
    return { tiempo: fin === null ? null : dist[fin], ruta: ruta, alcanzados: cuantos, dist: dist };
  }

  var SOL = resolver();

  /* Distancias en el grafo de cruces, sin mirar la bateria. */
  function soloDistancias() {
    var d = [], i = 0, j, k;
    while (i < CIUDAD.n) {
      d.push([]); j = 0;
      while (j < CIUDAD.n) { d[i].push(i === j ? 0 : Infinity); j = j + 1; }
      i = i + 1;
    }
    CIUDAD.vias.forEach(function (v) { d[v[0]][v[1]] = v[2]; d[v[1]][v[0]] = v[2]; });
    for (k = 0; k < CIUDAD.n; k++) {
      for (i = 0; i < CIUDAD.n; i++) {
        for (j = 0; j < CIUDAD.n; j++) { if (d[i][k] + d[k][j] < d[i][j]) { d[i][j] = d[i][k] + d[k][j]; } }
      }
    }
    return d;
  }
  var DIST = soloDistancias();

  /* mk(posicion de la correcta, [correcta, falsa1, falsa2, falsa3], [fb1, fb2, fb3]) */
  function mk(pos, textos, fbs) {
    var op = [], t = 0, f = 0;
    while (t < 4) {
      if (t === pos) { op.push({ txt: textos[0], ok: true, fb: "" }); }
      else { op.push({ txt: textos[1 + f], ok: false, fb: fbs[f] }); f = f + 1; }
      t = t + 1;
    }
    return op;
  }

  var PREGUNTAS = [
    { titulo: "Uno: por qué el grafo de cruces no basta",
      texto: "Sobre el grafo de cruces, el camino más corto de 0 a 4 mide " + DIST[0][4] + " minutos. ¿Por qué esa respuesta no sirve?",
      op: mk(2,
        ["Ese camino pide recorrer un tramo con más batería de la que el carro lleva encima cuando llega, y el grafo de cruces no sabe cuánta le queda.",
         "Porque las vías son de doble sentido y el camino más corto de un grafo no dirigido no está definido.",
         "Porque el tiempo de carga hay que sumarlo al final, una vez por cada estación de la ciudad.",
         "Porque el grafo tiene ciclos y el camino más corto podría dar vueltas para recargar."],
        ["Las vías de doble sentido son un grafo no dirigido corriente y el camino más corto está perfectamente definido. El problema es otro: el costo de una vía depende de con cuánta batería se llega.",
         "La carga no se suma al final ni es una por estación: el carro decide si carga y dónde, y cada decisión cambia lo que puede recorrer después.",
         "Dar vueltas para recargar es justamente lo que puede convenir, y eso ya dice que el grafo de cruces se queda corto. Lo que lo deja corto es que una llegada a un cruce no vale lo mismo según la batería que traiga."]) },
    { titulo: "Dos: el estado y sus rangos",
      texto: "¿Qué información tiene que llevar un estado?",
      op: mk(1,
        ["El cruce donde está el carro, 0 ≤ a < n, y la batería que le queda, 0 ≤ b ≤ C.",
         "Solo el cruce, 0 ≤ a < n, porque el tiempo acumulado ya lo lleva Dijkstra.",
         "El cruce, la batería y el tiempo acumulado, porque los tres cambian en cada transición.",
         "El cruce, la batería y cuántas veces se ha cargado, para no cargar dos veces en la misma estación."],
        ["El tiempo lo lleva Dijkstra, sí, pero la batería no: sin ella, dos llegadas distintas al mismo cruce se confunden en un solo vértice y el algoritmo se queda con la más rápida, que puede ser la que no puede seguir.",
         "El tiempo acumulado no va en el estado: es lo que se minimiza. Si entrara, cada valor distinto de tiempo daría un vértice nuevo y el grafo dejaría de ser finito en la práctica.",
         "Cargar dos veces en la misma estación no está prohibido ni sirve de nada: una carga deja la batería llena, así que la segunda no cambia nada y nunca entra en la ruta más rápida."]) },
    { titulo: "Dos: cuántos estados caben",
      texto: "Con n = " + CIUDAD.n + " cruces y capacidad C = " + CIUDAD.C + ", ¿cuántos estados caben?",
      op: mk(0,
        ["n · (C + 1) = " + CIUDAD.estados + ", porque la batería va de 0 a C y esos son C + 1 valores.",
         "n · C = " + (CIUDAD.n * CIUDAD.C) + ", un estado por cruce y por unidad de batería.",
         "2ⁿ · (C + 1) = " + (Math.pow(2, CIUDAD.n) * (CIUDAD.C + 1)) + ", porque hay que recordar qué cruces ya se visitaron.",
         "n + C + 1 = " + (CIUDAD.n + CIUDAD.C + 1) + ", la suma de los dos rangos."],
        ["Falta la batería en 0, que es un estado posible: el carro llega sin carga y ahí se queda si el cruce no tiene estación. Los valores son 0, 1, …, C, que son C + 1.",
         "Los cruces visitados no van en el estado. Pasar dos veces por el mismo cruce es legítimo, y el camino más rápido puede hacerlo para ir a cargar.",
         "Los dos elementos del estado se combinan, no se suman: para cada cruce hay C + 1 niveles de batería posibles."]) },
    { titulo: "Tres: la condición de recorrer una vía",
      texto: "Desde el estado (a, b), ¿qué pide la transición que recorre la vía (a, a′) de longitud ℓ y a qué estado lleva?",
      op: mk(3,
        ["Pide b ≥ ℓ, lleva a (a′, b − ℓ) y cuesta ℓ minutos.",
         "Pide b ≥ ℓ, lleva a (a′, b) y cuesta ℓ minutos, porque la batería se descuenta al llegar a la estación.",
         "No pide nada, lleva a (a′, máx(b − ℓ, 0)) y cuesta ℓ minutos, porque el carro siempre puede avanzar.",
         "Pide b > ℓ, lleva a (a′, b − ℓ) y cuesta ℓ minutos, porque con b = ℓ el carro se quedaría sin batería en el camino."],
        ["La batería se gasta recorriendo, no al llegar. Si no se descuenta, el carro recorrería la ciudad entera con la carga inicial.",
         "Sí pide: con b < ℓ el carro no alcanza a recorrer la vía, y recortar en 0 lo que falta inventa energía que no tiene.",
         "Con b = ℓ la batería alcanza exacto y el carro llega con 0. Es un estado válido, y a veces el único camino pasa por él."]) },
    { titulo: "Tres: la condición de cargar",
      texto: "¿Qué pide la transición que carga la batería y a qué estado lleva?",
      op: mk(2,
        ["Pide que a tenga estación y que b < C; lleva a (a, C) y cuesta t minutos.",
         "Pide que a tenga estación y que b = 0; lleva a (a, C) y cuesta t minutos.",
         "Pide que a tenga estación; lleva a (a, b + 1) y cuesta t minutos por unidad de batería.",
         "Pide que a tenga estación; lleva a (a, C) y cuesta t · (C − b) minutos, proporcional a lo que falta."],
        ["Esperar a quedarse en 0 para cargar no es obligatorio ni conviene: el carro puede llegar a una estación con batería de sobra y cargar igual, y a veces esa es la única manera de alcanzar el tramo siguiente.",
         "Cargar de a una unidad partiría el problema en C transiciones donde hay una sola, y multiplicaría los estados sin cambiar la respuesta. El enunciado dice que una carga deja la batería llena y cuesta t.",
         "El enunciado fija el costo en t minutos, llegue el carro con la batería que llegue. Hacerlo proporcional cambia el problema."]) },
    { titulo: "Cuatro: inicial y finales",
      texto: "¿Cuál es el estado inicial y cuáles son los finales?",
      op: mk(1,
        ["Inicial (" + CIUDAD.s + ", " + CIUDAD.C + ") con tiempo 0; finales todos los (" + CIUDAD.f + ", b) con 0 ≤ b ≤ C.",
         "Inicial (" + CIUDAD.s + ", 0) con tiempo 0; finales todos los (" + CIUDAD.f + ", b).",
         "Inicial (" + CIUDAD.s + ", " + CIUDAD.C + ") con tiempo 0; final solo (" + CIUDAD.f + ", " + CIUDAD.C + "), para poder seguir después.",
         "Inicial (" + CIUDAD.s + ", " + CIUDAD.C + ") con tiempo 0; final solo (" + CIUDAD.f + ", 0), porque conviene llegar gastando todo."],
        ["El carro sale con la batería llena, así que el estado inicial es (" + CIUDAD.s + ", " + CIUDAD.C + "). Con 0 no podría recorrer ninguna vía.",
         "El problema termina al llegar a " + CIUDAD.f + " y no pide nada sobre la batería. Exigir que llegue llena descarta rutas más rápidas y puede dejar el problema sin respuesta.",
         "Nada obliga a gastar la batería. Llegar a " + CIUDAD.f + " con carga de sobra es tan válido como llegar con 0, y lo que se minimiza es el tiempo."]) },
    { titulo: "Tres: una transición concreta",
      texto: "El carro está en el estado (1, 5): en el cruce 1, con 5 de batería. ¿Qué transiciones puede dar?",
      op: mk(0,
        ["Recorrer 1–0 hasta (0, 2), recorrer 1–2 hasta (2, 0), recorrer 1–3 hasta (3, 3) y cargar hasta (1, 8).",
         "Recorrer 1–0, 1–2 y 1–3, y nada más: con 5 de batería no se puede cargar.",
         "Recorrer 1–0 hasta (0, 2) y recorrer 1–3 hasta (3, 3), y cargar hasta (1, 8): la vía 1–2 pide más batería de la que hay.",
         "Solo cargar hasta (1, 8), porque conviene llenar la batería antes de moverse."],
        ["El cruce 1 tiene estación y la batería está en 5, que es menos que la capacidad 8, así que cargar sí se puede.",
         "La vía 1–2 mide 5 y la batería es 5: alcanza exacto, y el carro llega al cruce 2 con 0. Es una transición válida.",
         "Cargar se puede, pero no es la única opción. El algoritmo explora las cuatro y se queda con la que lleve al menor tiempo."]) },
    { titulo: "Seis: el algoritmo y lo que cuesta",
      texto: "¿Con qué algoritmo se resuelve y cuánto cuesta?",
      op: mk(3,
        ["Dijkstra sobre los estados, O((N + M) log N) con N = n(C + 1) estados y M acotado por N por el grado máximo más uno.",
         "Búsqueda en amplitud sobre los estados, O(N + M), porque las transiciones son discretas.",
         "Floyd-Warshall sobre los cruces, Θ(n³), y después se descuenta la batería del resultado.",
         "Bellman-Ford-Moore sobre los estados, Θ(N · M), porque el tiempo de carga puede verse como un costo negativo."],
        ["La amplitud sirve cuando todas las aristas pesan lo mismo, y aquí no: recorrer una vía cuesta su longitud y cargar cuesta t.",
         "Floyd-Warshall responde por todas las parejas de cruces, pero sigue sin saber con cuánta batería se llega. La batería no se descuenta después: decide qué transiciones existen.",
         "Ningún costo es negativo: las longitudes y el tiempo de carga son positivos. Con pesos no negativos, Bellman-Ford-Moore da la misma respuesta haciendo más trabajo."]) }
  ];

  function evaluarTiempo(v) {
    if (v === SOL.tiempo) {
      return { ok: true, msg: "Correcto: " + SOL.tiempo + " minutos. La ruta es " +
               SOL.ruta.slice(1).map(function (p) { return p.accion + " (" + p.costo + ")"; }).join(", ") + "." };
    }
    if (v === DIST[CIUDAD.s][CIUDAD.f]) {
      return { ok: false, msg: "Ese es el camino más corto del grafo de cruces, " + DIST[CIUDAD.s][CIUDAD.f] +
               " minutos, y el carro no lo puede recorrer con la batería que lleva. Con las cargas, el menor tiempo es " + SOL.tiempo + "." };
    }
    return { ok: false, msg: "No. El menor tiempo es " + SOL.tiempo + " minutos, y la ruta pasa por una estación: " +
             SOL.ruta.slice(1).map(function (p) { return p.accion + " (" + p.costo + ")"; }).join(", ") + "." };
  }

  return { CIUDAD: CIUDAD, PREGUNTAS: PREGUNTAS, SOL: SOL, DIST: DIST, resolver: resolver,
           vecinos: vecinos, hayEstacion: hayEstacion, evaluarTiempo: evaluarTiempo };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, C = E.CIUDAD, resueltas = 0;
    function el(id) { return document.getElementById(id); }

    el("panel-grafo").innerHTML = GRAFOSVG.dibujar({
      n: C.n, pos: C.pos, aristas: C.vias, dirigido: false,
      nodo: function (u) {
        var s = { cuadrado: E.hayEstacion(u) };
        if (E.hayEstacion(u)) { s.relleno = "#fdf1dc"; s.borde = "#e8a13d"; }
        if (u === C.s) { s.relleno = "#e7f2e8"; s.borde = "#2e7d32"; s.grueso = 3; }
        if (u === C.f) { s.relleno = "#e3edf8"; s.borde = "#1f5fa8"; s.grueso = 3; }
        return s;
      }
    });
    el("ver-datos").innerHTML = "Capacidad <code>C = " + C.C + "</code>, una carga completa cuesta <code>t = " +
      C.t + "</code> minutos, estaciones en los cruces " + C.estaciones.join(" y ") + ". El carro sale del cruce " +
      C.s + " con la batería llena y va al cruce " + C.f + ". Vías: " +
      C.vias.map(function (v) { return v[0] + "–" + v[1] + " (" + v[2] + ")"; }).join(", ") + ".";
    el("total").textContent = E.PREGUNTAS.length;

    function carta(q) {
      var c = document.createElement("div"), st = { sel: null, listo: false };
      c.className = "carta";
      c.innerHTML = "<h2>" + q.titulo + "</h2><p style='margin-top:0'>" + q.texto + "</p>" +
        "<div class='opciones-v'></div>" +
        "<div class='botones' style='margin-top:0.6rem'><button class='primario comprobar'>Comprobar</button></div><div class='fb'></div>";
      var caja = c.querySelector(".opciones-v"), fb = c.querySelector(".fb");
      function pintar() {
        caja.innerHTML = "";
        q.op.forEach(function (o, t) {
          var b = document.createElement("button");
          b.className = "opcion" + (st.sel === t ? " elegida" : "");
          b.textContent = o.txt;
          b.addEventListener("click", function () { st.sel = t; pintar(); });
          caja.appendChild(b);
        });
      }
      c.querySelector(".comprobar").addEventListener("click", function () {
        if (st.sel === null) { fb.className = "fb mal"; fb.textContent = "Escoja una opción."; return; }
        var o = q.op[st.sel];
        fb.className = "fb " + (o.ok ? "bien" : "mal");
        fb.textContent = o.ok ? "Correcto. " + q.op.filter(function (x) { return x.ok; })[0].txt : o.fb;
        if (o.ok && !st.listo) { st.listo = true; resueltas = resueltas + 1; el("resueltas").textContent = resueltas; }
      });
      pintar();
      return c;
    }

    var caja = el("preguntas");
    E.PREGUNTAS.forEach(function (q) { caja.appendChild(carta(q)); });

    el("btn-tiempo").addEventListener("click", function () {
      var v = parseInt(el("tiempo").value, 10), r, ver = el("veredicto");
      r = isNaN(v) ? { ok: false, msg: "Escriba un número primero." } : E.evaluarTiempo(v);
      ver.className = "veredicto " + (r.ok ? "bien" : "mal");
      ver.textContent = r.msg;
      if (r.ok) {
        el("panel-ruta").innerHTML = "<table><tr><th>Estado</th><th>Qué se hace</th><th>Minutos</th><th>Acumulado</th></tr>" +
          (function () {
            var s = "", acc = 0;
            E.SOL.ruta.forEach(function (p) {
              acc = acc + p.costo;
              s += "<tr><td>(" + p.a + ", " + p.b + ")</td><td>" + p.accion + "</td><td>" + p.costo + "</td><td>" + acc + "</td></tr>";
            });
            return s;
          })() + "</table>" +
          "<p class='nota'>De los " + C.estados + " estados que caben, la búsqueda saca de la cola " + E.SOL.alcanzados +
          ". Los demás no se alcanzan desde (" + C.s + ", " + C.C + ").</p>";
      }
    });
  })();
}
