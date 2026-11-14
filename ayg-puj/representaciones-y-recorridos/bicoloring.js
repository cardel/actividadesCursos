/* UVa 10004, Bicoloring: el coloreo de bipartito.py sobre los casos del juez.
   El panel muestra pintar y bipartito tal como estan en el deck, mas la linea
   que imprime la salida de cada caso. */
var EJERCICIO = (function () {
  var NOMBRE = { 0: "azul", 1: "naranja" };

  var CODIGO = [
    { txt: "def pintar(adj, color, u, c):",                    num: null },
    { txt: "    color[u] = c",                                 num: 1, bloque: 1 },
    { txt: "    sin_choque = True",                            num: 2, bloque: 1 },
    { txt: "    for v in adj[u]:",                             num: 3, bloque: 1 },
    { txt: "        if color[v] == -1:",                       num: 4, bloque: 1 },
    { txt: "            if not pintar(adj, color, v, 1 - c):", num: 5, bloque: 1 },
    { txt: "                sin_choque = False",               num: 6, bloque: 1 },
    { txt: "        elif color[v] == c:",                      num: 7, bloque: 1 },
    { txt: "            sin_choque = False",                   num: 8, bloque: 1 },
    { txt: "    return sin_choque",                            num: 9, bloque: 1 },
    { txt: "",                                                 num: null },
    { txt: "def bipartito(adj):",                              num: null },
    { txt: "    color = [-1] * len(adj)",                      num: 10, bloque: 2 },
    { txt: "    resultado = True",                             num: 11, bloque: 2 },
    { txt: "    for u in range(len(adj)):",                    num: 12, bloque: 2 },
    { txt: "        if color[u] == -1:",                       num: 13, bloque: 2 },
    { txt: "            if not pintar(adj, color, u, 0):",     num: 14, bloque: 2 },
    { txt: "                resultado = False",                num: 15, bloque: 2 },
    { txt: "    return resultado",                             num: 16, bloque: 2 },
    { txt: "",                                                 num: null },
    { txt: "# por cada caso, con adj ya leida:",               num: null },
    { txt: "print(\"BICOLORABLE.\" if bipartito(adj) else \"NOT BICOLORABLE.\")", num: 17, bloque: 3 }
  ];

  function circulo(n, cx, cy, r) {
    var res = [], i = 0;
    while (i < n) {
      res.push([Math.round(cx + r * Math.sin(2 * Math.PI * i / n)), Math.round(cy - r * Math.cos(2 * Math.PI * i / n))]);
      i = i + 1;
    }
    return res;
  }
  function estrella(hojas) { return [[180, 125]].concat(circulo(hojas, 180, 125, 95)); }

  /* Cada caso es la entrada tal como llega al juez: n y las aristas en orden. */
  var CASOS = [
    { nombre: "Camino de 3", n: 3, aristas: [[0, 1], [1, 2]], ancho: 340, alto: 110,
      pos: [[50, 55], [170, 55], [290, 55]] },
    { nombre: "Estrella de 9", n: 9, aristas: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8]], ancho: 360, alto: 250,
      pos: estrella(8) },
    { nombre: "Triángulo", n: 3, aristas: [[0, 1], [1, 2], [2, 0]], ancho: 340, alto: 220,
      pos: [[170, 40], [60, 185], [280, 185]] },
    { nombre: "Ciclo de 6", n: 6, aristas: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]], ancho: 360, alto: 250,
      pos: circulo(6, 180, 125, 95) },
    { nombre: "Camino con un ciclo al final", n: 6, aristas: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 3]], ancho: 400, alto: 210,
      pos: [[40, 55], [130, 55], [220, 55], [310, 55], [370, 170], [250, 170]] }
  ];

  /* El caso de la tarjeta de la limitacion: dos pedazos, el segundo con un ciclo impar. */
  var PEDAZOS = { nombre: "Dos pedazos", n: 5, aristas: [[0, 1], [2, 3], [3, 4], [4, 2]], ancho: 360, alto: 190,
    pos: [[50, 40], [50, 150], [210, 40], [320, 150], [190, 150]] };

  function adjDe(q) {
    var adj = [], i = 0;
    while (i < q.n) { adj.push([]); i = i + 1; }
    q.aristas.forEach(function (a) { adj[a[0]].push(a[1]); adj[a[1]].push(a[0]); });
    return adj;
  }
  function entradaDe(q) {
    return [String(q.n), String(q.aristas.length)].concat(q.aristas.map(function (a) { return a[0] + " " + a[1]; })).join("\n");
  }
  function vacio(n) { var c = [], i = 0; while (i < n) { c.push(-1); i = i + 1; } return c; }

  function pintar(adj, color, u, c) {
    var sin = true;
    color[u] = c;
    adj[u].forEach(function (v) {
      if (color[v] === -1) {
        if (!pintar(adj, color, v, 1 - c)) { sin = false; }
      } else if (color[v] === c) {
        sin = false;
      }
    });
    return sin;
  }
  function bipartito(adj) {
    var color = vacio(adj.length), res = true, u = 0;
    while (u < adj.length) {
      if (color[u] === -1) {
        if (!pintar(adj, color, u, 0)) { res = false; }
      }
      u = u + 1;
    }
    return { resultado: res, color: color };
  }
  function soloDesdeCero(adj) {
    var color = vacio(adj.length), res = pintar(adj, color, 0, 0);
    return { resultado: res, color: color };
  }
  function salida(r) { return r ? "BICOLORABLE." : "NOT BICOLORABLE."; }

  function choquesDe(adj, color) {
    var res = [], u = 0;
    while (u < adj.length) {
      adj[u].forEach(function (v) { if (u < v && color[u] !== -1 && color[u] === color[v]) { res.push([u, v]); } });
      u = u + 1;
    }
    return res;
  }

  /* La corrida en eventos; los de decision esperan al estudiante. antes = {color, pila, choques}. */
  function eventos(adj) {
    var ev = [], color = vacio(adj.length), pila = [], choques = [], resultado = true, vistas = 0;
    function foto() {
      return { color: color.slice(), pila: pila.map(function (m) { return { u: m.u, c: m.c, sin: m.sin }; }), choques: choques.map(function (x) { return x.slice(); }), vistas: vistas };
    }
    function anotar(o, ant) { o.antes = ant; ev.push(o); }
    function llamada(u, c) {
      var marco = { u: u, c: c, sin: true };
      color[u] = c;
      pila.push(marco);
      adj[u].forEach(function (v) {
        var ant = foto(), sub;
        vistas = vistas + 1;
        if (color[v] === -1) {
          anotar({ tipo: "sinColor", u: u, v: v, c: c, lineas: [3, 4, 5] }, ant);
          sub = llamada(v, 1 - c);
          anotar({ tipo: "vuelve", u: u, v: v, res: sub, lineas: sub ? [5] : [5, 6] }, foto());
          if (!sub) { marco.sin = false; }
        } else {
          if (color[v] === c) {
            marco.sin = false;
            if (!choques.some(function (x) { return (x[0] === u && x[1] === v) || (x[0] === v && x[1] === u); })) { choques.push([u, v]); }
          }
          anotar({ tipo: "conColor", u: u, v: v, c: c, cv: color[v], lineas: [3, 4, 7] }, ant);
        }
      });
      pila.pop();
      return marco.sin;
    }
    var u = 0, saltados = [];
    function soltar() {
      if (saltados.length > 0) { anotar({ tipo: "salta", nodos: saltados, lineas: [12, 13] }, foto()); }
      saltados = [];
    }
    while (u < adj.length) {
      if (color[u] === -1) {
        soltar();
        var ant = foto();
        if (u > 0) { anotar({ tipo: "afuera", u: u, lineas: [12, 13] }, ant); }
        anotar({ tipo: "arranque", u: u, lineas: [14] }, ant);
        var r = llamada(u, 0);
        if (!r) { resultado = false; }
        anotar({ tipo: "termina", u: u, res: r, lineas: r ? [14] : [14, 15] }, foto());
      } else {
        saltados.push(u);
      }
      u = u + 1;
    }
    soltar();
    anotar({ tipo: "fin", resultado: resultado, lineas: [16, 17] }, foto());
    return ev;
  }

  function esDecision(e) { return e.tipo === "sinColor" || e.tipo === "conColor" || e.tipo === "arranque" || e.tipo === "afuera"; }

  function opcionesDe(e) {
    var res;
    if (e.tipo === "sinColor" || e.tipo === "arranque") {
      res = [{ id: "azul", t: "azul", clase: "color-azul" }, { id: "naranja", t: "naranja", clase: "color-naranja" }];
    } else if (e.tipo === "conColor") {
      res = [{ id: "cumple", t: "Colores distintos: la arista se cumple" }, { id: "choque", t: "Mismo color: la arista choca" }, { id: "repinta", t: "Se le cambia el color a " + e.v }];
    } else {
      res = [{ id: "arranca", t: "Arranca pintar(adj, color, " + e.u + ", 0)" }, { id: "termina", t: "Termina: el 0 ya recorrió lo suyo" }];
    }
    return res;
  }

  function opcionBuena(e) {
    var res;
    if (e.tipo === "arranque") { res = "azul"; }
    else if (e.tipo === "sinColor") { res = NOMBRE[1 - e.c]; }
    else if (e.tipo === "conColor") { res = e.c === e.cv ? "choque" : "cumple"; }
    else { res = "arranca"; }
    return res;
  }

  function juzgar(e, op) {
    var ok = op === opcionBuena(e), msg, otro;
    if (e.tipo === "arranque") {
      ok = true;
      msg = op === "azul" ?
        "El nodo " + e.u + " queda azul: <code>bipartito</code> llama a <code>pintar</code> con <code>c = 0</code>." :
        "Daría la misma salida, porque cambiar los dos colores en todo el grafo no rompe ninguna arista. El código llama con <code>c = 0</code>, así que se sigue con azul.";
    } else if (e.tipo === "sinColor") {
      otro = NOMBRE[1 - e.c];
      msg = ok ?
        "El " + e.v + " queda " + otro + ": su vecino " + e.u + " es " + NOMBRE[e.c] + " y la línea 5 llama con <code>1 - c</code>. Se abre <code>pintar(" + e.v + ", " + otro + ")</code>." :
        "Se miró el color equivocado: el " + e.u + " es " + NOMBRE[e.c] + " y la arista " + e.u + "-" + e.v + " pide colores distintos, así que el " + e.v + " solo puede ser " + otro + ".";
    } else if (e.tipo === "conColor") {
      if (e.c === e.cv) {
        if (ok) {
          msg = "Los dos extremos de " + e.u + "-" + e.v + " son " + NOMBRE[e.c] + ": la línea 8 deja <code>sin_choque = False</code>. El código no corta; sigue con los demás vecinos.";
        } else if (op === "cumple") {
          msg = "Se miró solo si el " + e.v + " estaba pintado. Lo está, y del mismo color que el " + e.u + ": " + NOMBRE[e.c] + ". La rama <code>elif color[v] == c</code> existe para este momento.";
        } else {
          msg = "El color del " + e.v + " quedó forzado por el vecino desde el que se pintó. Cambiarlo dañaría esa arista, y el choque seguiría en otra parte del ciclo.";
        }
      } else if (ok) {
        msg = "El " + e.v + " es " + NOMBRE[e.cv] + " y el " + e.u + " es " + NOMBRE[e.c] + ": la arista se cumple y la línea 7 no hace nada.";
      } else if (op === "choque") {
        msg = "Se miró que el " + e.v + " ya tiene color, pero no cuál: es " + NOMBRE[e.cv] + " y el " + e.u + " es " + NOMBRE[e.c] + ". Solo choca un vecino del mismo color.";
      } else {
        msg = "El " + e.v + " ya tiene un color distinto del " + e.u + ": la arista se cumple tal como está, y cambiarlo la rompería.";
      }
    } else {
      msg = ok ?
        "El " + e.u + " sigue en −1, así que el ciclo de afuera lo arranca." :
        "Se miró solo el pedazo del 0. El " + e.u + " sigue sin color, y en su pedazo puede haber un choque.";
    }
    return { ok: ok, msg: msg };
  }

  /* La salida que se predice al final de cada caso. */
  function juzgarSalida(q, dice) {
    var adj = adjDe(q), b = bipartito(adj), ok = dice === salida(b.resultado), ch = choquesDe(adj, b.color), msg;
    if (ok) {
      msg = b.resultado ?
        "El juez espera <code>BICOLORABLE.</code>: ninguna arista quedó con los dos extremos iguales." :
        "El juez espera <code>NOT BICOLORABLE.</code>: la arista " + ch[0][0] + "-" + ch[0][1] + " quedó con los dos extremos " + NOMBRE[b.color[ch[0][0]]] + ", y ese False subió por las llamadas hasta <code>resultado</code>.";
    } else if (b.resultado) {
      msg = "Ninguna arista quedó roja. " + (q.aristas.length >= q.n ?
        "El grafo tiene un ciclo, pero de longitud par: alternando, el último nodo cae del color contrario al primero." :
        "Sin ciclos no hay forma de que dos vecinos terminen del mismo color.");
    } else {
      msg = "Se miró que todos los nodos quedaron pintados, pero no las aristas: la " + ch[0][0] + "-" + ch[0][1] + " une dos nodos " + NOMBRE[b.color[ch[0][0]]] + ". Que todo tenga color no dice que el coloreo sirva.";
    }
    return { ok: ok, msg: msg };
  }

  /* Cuantas veces corre la linea 4: una por cada vecino de cada nodo pintado. */
  function opcionesVistas(q) {
    var n = q.n, l = q.aristas.length, lista = [
      { valor: 2 * l, clave: "correcta", razon: "Son " + (2 * l) + ": cada nodo se pinta una vez y recorre toda su lista, y cada arista está en la lista de sus dos extremos. Con n = 199 y todas las aristas posibles, 19 701, serían 39 402 vueltas: el juez no las nota. Probar los 2<sup>n</sup> coloreos no terminaría." },
      { valor: l, clave: "una-vez", razon: "Contó cada arista una vez. La lista de adyacencia guarda la arista " + q.aristas[0][0] + "-" + q.aristas[0][1] + " en adj[" + q.aristas[0][0] + "] y en adj[" + q.aristas[0][1] + "], y las dos se recorren." },
      { valor: n, clave: "por-nodo", razon: "Contó una vez por nodo, que es lo que corre la línea 1. La línea 4 está dentro del <code>for v in adj[u]</code> y corre una vez por vecino." },
      { valor: n - 1, clave: "arbol", razon: "Contó solo las llamadas que pintan un nodo nuevo. Las miradas a un vecino ya pintado, incluida la de vuelta al nodo de donde se vino, también pasan por la línea 4." },
      { valor: n * n, clave: "matriz", razon: "Es lo que costaría con matriz de adyacencia, n por n. Con lista, cada nodo recorre solo sus vecinos." }
    ], vistos = {}, res = [];
    lista.forEach(function (o) { if (!vistos[o.valor]) { vistos[o.valor] = true; res.push(o); } });
    return res;
  }

  /* Cuantos nodos quedan en -1 si solo se llama pintar desde el 0. */
  function opcionesSinColor(q) {
    var adj = adjDe(q), r = soloDesdeCero(adj), sin = r.color.filter(function (x) { return x === -1; }).length, lista = [
      { valor: sin, clave: "correcta", razon: "Quedan " + sin + ": el recorrido desde el 0 solo llega a su pedazo, el 0 y el 1. El triángulo 2-3-4 nunca se mira, su choque no se ve y la salida es <code>BICOLORABLE.</code> cuando no lo es. En UVa 10004 el enunciado promete un grafo conexo y por eso basta arrancar en el 0." },
      { valor: 0, clave: "todos", razon: "Supuso que el recorrido llega a todos los nodos. Solo llega a los que tienen camino desde el 0, y del 1 no sale ninguna arista hacia el 2, el 3 o el 4." },
      { valor: q.n - sin, clave: "pintados", razon: "Ese es el número de nodos que sí quedan pintados, el 0 y el 1. La pregunta es por los que siguen en −1." },
      { valor: q.n, clave: "ninguno", razon: "El 0 y el 1 sí se pintan: <code>pintar</code> arranca en el 0 y la arista 0-1 lleva al 1." }
    ], vistos = {}, res = [];
    lista.forEach(function (o) { if (!vistos[o.valor]) { vistos[o.valor] = true; res.push(o); } });
    return res;
  }

  var PREGUNTAS = [
    { enun: "La entrada trae varios casos seguidos. ¿Cuándo se deja de leer?", opciones: [
      { t: "Cuando se acaba el archivo de entrada.", ok: false,
        por: "La entrada termina con una línea que dice 0. Leer hasta el final del archivo trata ese 0 como un caso más e intenta leer después su número de aristas." },
      { t: "Cuando la línea de n trae un 0.", ok: true,
        por: "El 0 marca el final y no lleva aristas detrás. El ciclo de lectura pregunta por n antes de leer l." },
      { t: "Cuando un caso trae l igual a 0.", ok: false,
        por: "Con n mayor que 1 y el grafo conexo, cada caso trae al menos una arista. El 0 que cierra la entrada está en la línea de n." }] },
    { enun: "El enunciado promete que cada grafo es conexo. ¿Qué parte de bipartito deja de hacer falta?", opciones: [
      { t: "El ciclo de afuera: basta con una llamada pintar(adj, color, 0, 0).", ok: true,
        por: "Desde el 0 se llega a todos los nodos, así que el ciclo de afuera solo encuentra nodos pintados. La tarjeta 3 muestra qué pasa sin esa promesa." },
      { t: "La rama elif color[v] == c, porque no hay pedazos aparte.", ok: false,
        por: "Esa rama es la que encuentra el choque, y no tiene que ver con los pedazos. Sin ella el triángulo de la muestra sale BICOLORABLE." },
      { t: "El arreglo color, porque cada nodo se visita una sola vez.", ok: false,
        por: "Cada nodo se visita una vez justamente porque color hace de marca de visitado. Sin él, el recorrido daría vueltas en el triángulo." }] },
    { enun: "¿Hace falta probar también el nodo 0 de color naranja?", opciones: [
      { t: "Sí: con el 0 naranja un caso NOT podría salir BICOLORABLE.", ok: false,
        por: "Cambiar el color del 0 cambia el de todos los demás, porque cada uno quedó forzado por su vecino. Las aristas que chocaban siguen chocando." },
      { t: "Depende de cuántos vecinos tenga el nodo 0.", ok: false,
        por: "El número de vecinos del 0 no decide nada. Con uno o con ocho, como en la estrella de la muestra, cambiar todos los colores deja las aristas igual." },
      { t: "No: cambiar los dos colores en todo el grafo no rompe ninguna arista.", ok: true,
        por: "Un coloreo y su intercambio dan las mismas aristas cumplidas y los mismos choques, así que con un arranque basta." }] }
  ];

  return { NOMBRE: NOMBRE, codigo: CODIGO, CASOS: CASOS, PEDAZOS: PEDAZOS, PREGUNTAS: PREGUNTAS,
           adjDe: adjDe, entradaDe: entradaDe, vacio: vacio, pintar: pintar, bipartito: bipartito, soloDesdeCero: soloDesdeCero,
           salida: salida, choquesDe: choquesDe, eventos: eventos, esDecision: esDecision, opcionesDe: opcionesDe,
           opcionBuena: opcionBuena, juzgar: juzgar, juzgarSalida: juzgarSalida, opcionesVistas: opcionesVistas, opcionesSinColor: opcionesSinColor };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, RELLENO = { 0: "#8fb8df", 1: "#f4b37a" }, BORDE = { 0: "#1f5fa8", 1: "#c0691a" };
    function el(id) { return document.getElementById(id); }
    var marcar = PLANTEO.codigo("panel-codigo", E.codigo);

    function dibujo(q, o) {
      var A = q.aristas.map(function (a) { return [a[0], a[1], ""]; });
      function es(a, x) { return (a[0] === x[0] && a[1] === x[1]) || (a[0] === x[1] && a[1] === x[0]); }
      return GRAFOSVG.dibujar({
        n: q.n, pos: q.pos, aristas: A, dirigido: false, ancho: q.ancho, alto: q.alto, maxAncho: q.ancho + 40,
        arista: function (i) {
          var res = { color: "claro", grueso: 2.5 };
          if ((o.choques || []).some(function (x) { return es(A[i], x); })) { res = { color: "rojo", grueso: 4.5 }; }
          else if (o.mirando && es(A[i], o.mirando)) { res = { color: "ambar", grueso: 4.5 }; }
          return res;
        },
        nodo: function (u) {
          var c = o.color[u], s = {};
          if (c !== -1) { s.relleno = RELLENO[c]; s.borde = BORDE[c]; s.nota = E.NOMBRE[c]; s.notaColor = BORDE[c]; }
          if (o.actual === u) { s.borde = "#24292f"; s.grueso = 4.5; }
          return s;
        }
      });
    }

    el("p-entrada").textContent = [2, 0, 1].map(function (i) { return E.entradaDe(E.CASOS[i]); }).join("\n") + "\n0";

    /* La corrida */
    var g = 0, EV = [], k = 0, cuenta = null;
    function pilaHTML(pila) {
      var h = "<span class='rot'>Llamadas abiertas, la última arriba</span>", i = pila.length - 1;
      if (pila.length === 0) { h = h + "<span class='marco'>ninguna</span>"; }
      while (i >= 0) {
        h = h + "<span class='marco" + (i === pila.length - 1 ? " tope" : "") + "'>pintar(" + pila[i].u + ", " + E.NOMBRE[pila[i].c] + ")" +
          (pila[i].sin ? "" : " <span class='choque'>sin_choque = False</span>") + "</span>";
        i = i - 1;
      }
      return h;
    }
    function textoEvento(e) {
      var res;
      if (e.tipo === "arranque") { res = "<code>bipartito</code> llama a <code>pintar</code> con el nodo " + e.u + ". ¿De qué color queda?"; }
      else if (e.tipo === "afuera") { res = "El ciclo de afuera llega a <code>u = " + e.u + "</code>, que sigue con <code>color = -1</code>. ¿Qué hace?"; }
      else if (e.tipo === "sinColor") { res = "El " + e.u + ", " + E.NOMBRE[e.c] + ", mira a su vecino " + e.v + ", que no tiene color. ¿De qué color queda el " + e.v + "?"; }
      else if (e.tipo === "conColor") { res = "El " + e.u + ", " + E.NOMBRE[e.c] + ", mira a su vecino " + e.v + ", que ya está pintado. ¿Qué pasa con la arista " + e.u + "-" + e.v + "?"; }
      else if (e.tipo === "vuelve") { res = "<code>pintar(" + e.v + ")</code> devuelve <code>" + (e.res ? "True" : "False") + "</code>. La llamada del " + e.u + (e.res ? " sigue con sus vecinos." : " anota <code>sin_choque = False</code> y sigue con sus vecinos."); }
      else if (e.tipo === "termina") { res = "La llamada desde el " + e.u + " devuelve <code>" + (e.res ? "True" : "False") + "</code>" + (e.res ? "." : ", y <code>resultado</code> pasa a <code>False</code>."); }
      else if (e.tipo === "salta") { res = "El ciclo de afuera mira " + (e.nodos.length > 1 ? "los nodos " : "el nodo ") + e.nodos.join(", ") + ": ya " + (e.nodos.length > 1 ? "tienen" : "tiene") + " color, así que no arranca nada."; }
      else { res = "<code>bipartito</code> terminó. ¿Qué imprime la línea 17 para este caso?"; }
      return res;
    }
    function pintarCorrida() {
      var e = EV[k], est = e.antes, q = E.CASOS[g], dec = el("r-decision"), mira = null, actual = est.pila.length > 0 ? est.pila[est.pila.length - 1].u : null;
      if (e.tipo === "sinColor" || e.tipo === "conColor") { mira = [e.u, e.v]; }
      el("r-grafo").innerHTML = dibujo(q, { color: est.color, actual: actual, mirando: mira, choques: est.choques });
      el("r-pila").innerHTML = pilaHTML(est.pila);
      el("r-instruccion").innerHTML = textoEvento(e);
      marcar(e.lineas);
      if (E.esDecision(e)) {
        dec.innerHTML = E.opcionesDe(e).map(function (o) {
          return "<button type='button' data-op='" + o.id + "'" + (o.clase ? " class='" + o.clase + "'" : "") + ">" + o.t + "</button>";
        }).join("");
      } else if (e.tipo === "fin") {
        dec.innerHTML = "<button type='button' data-salida='BICOLORABLE.'><code>BICOLORABLE.</code></button>" +
                        "<button type='button' data-salida='NOT BICOLORABLE.'><code>NOT BICOLORABLE.</code></button>";
      } else {
        dec.innerHTML = "<button type='button' data-seguir='1' class='primario'>Seguir</button>";
      }
      el("r-ayuda").classList.toggle("oculto", !E.esDecision(e));
      el("r-fin").classList.toggle("oculto", e.tipo === "fin");
      el("r-cuenta").classList.add("oculto");
    }
    function avanzar() { if (k < EV.length - 1) { k = k + 1; pintarCorrida(); } }
    function elegir(op) {
      var r = E.juzgar(EV[k], op);
      PLANTEO.decir("r-veredicto", r.ok, r.msg);
      if (r.ok) { avanzar(); }
    }
    el("r-decision").addEventListener("click", function (ev) {
      var b = ev.target.closest ? ev.target.closest("button") : null, r;
      if (b && b.getAttribute("data-op")) { elegir(b.getAttribute("data-op")); }
      else if (b && b.getAttribute("data-seguir")) { PLANTEO.decir("r-veredicto", true, ""); avanzar(); }
      else if (b && b.getAttribute("data-salida")) {
        r = E.juzgarSalida(E.CASOS[g], b.getAttribute("data-salida"));
        PLANTEO.decir("r-veredicto", r.ok, r.msg);
        if (r.ok) {
          el("r-cuenta").classList.remove("oculto");
          cuenta.refrescar();
        }
      }
    });
    function iniciarCaso(n) {
      g = n;
      EV = E.eventos(E.adjDe(E.CASOS[g]));
      k = 0;
      el("r-entrada").textContent = E.entradaDe(E.CASOS[g]);
      PLANTEO.decir("r-veredicto", true, "");
      pintarCorrida();
    }
    cuenta = Motor.opcionesNumericas("r-opciones", "r-cuenta-veredicto", function () { return E.opcionesVistas(E.CASOS[g]); });
    var elegirCaso = PLANTEO.botones("casos", E.CASOS.map(function (x) { return x.nombre; }), iniciarCaso);
    el("r-ayuda").addEventListener("click", function () { elegir(E.opcionBuena(EV[k])); });
    el("r-fin").addEventListener("click", function () { k = EV.length - 1; PLANTEO.decir("r-veredicto", true, ""); pintarCorrida(); });
    el("r-reinicio").addEventListener("click", function () { iniciarCaso(g); });

    /* Sin la promesa de conexo */
    var P = E.PEDAZOS;
    el("l-entrada").textContent = E.entradaDe(P);
    el("l-grafo").innerHTML = dibujo(P, { color: E.vacio(P.n) });
    Motor.opcionesNumericas("l-opciones", "l-veredicto", function () { return E.opcionesSinColor(P); });
    el("l-ver").addEventListener("click", function () {
      var r = E.soloDesdeCero(E.adjDe(P));
      el("l-grafo").innerHTML = dibujo(P, { color: r.color });
    });

    var abrir = PLANTEO.partes("abrir-partes", ["parte-2", "parte-3", "carta-cierre"]);
    PLANTEO.preguntas("preguntas", E.PREGUNTAS, abrir);
    elegirCaso(0);
  })();
}
