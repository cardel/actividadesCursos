/* Dos colores: decidir si un grafo es bipartito con un recorrido en profundidad.
   El codigo del panel es el de bipartito.py, y pintar hace lo mismo aqui. */
var EJERCICIO = (function () {
  var AZUL = 0, NARANJA = 1, NOMBRE = { 0: "azul", 1: "naranja" };

  var CODIGO = [
    { txt: "def pintar(adj, color, u, c):",                  num: null },
    { txt: "    color[u] = c",                               num: 1, bloque: 1 },
    { txt: "    sin_choque = True",                          num: 2, bloque: 1 },
    { txt: "    for v in adj[u]:",                           num: 3, bloque: 1 },
    { txt: "        if color[v] == -1:",                     num: 4, bloque: 1 },
    { txt: "            if not pintar(adj, color, v, 1 - c):", num: 5, bloque: 1 },
    { txt: "                sin_choque = False",             num: 6, bloque: 1 },
    { txt: "        elif color[v] == c:",                    num: 7, bloque: 1 },
    { txt: "            sin_choque = False",                 num: 8, bloque: 1 },
    { txt: "    return sin_choque",                          num: 9, bloque: 1 },
    { txt: "",                                               num: null },
    { txt: "def bipartito(adj):",                            num: null },
    { txt: "    color = [-1] * len(adj)",                    num: 10, bloque: 2 },
    { txt: "    resultado = True",                           num: 11, bloque: 2 },
    { txt: "    for u in range(len(adj)):",                  num: 12, bloque: 2 },
    { txt: "        if color[u] == -1:",                     num: 13, bloque: 2 },
    { txt: "            if not pintar(adj, color, u, 0):",   num: 14, bloque: 2 },
    { txt: "                resultado = False",              num: 15, bloque: 2 },
    { txt: "    return resultado",                           num: 16, bloque: 2 }
  ];

  function posiciones(lista, esc, mx, my, alto) {
    return lista.map(function (p) { return [p[0] * esc + mx, (alto - p[1]) * esc + my]; });
  }

  var GRAFOS = [
    { nombre: "Ciclo par y una hoja", adj: [[1, 3], [0, 2], [1, 3, 4], [0, 2], [2]], ancho: 340, alto: 225,
      pos: posiciones([[0, 2.6], [2, 2.6], [2, 0.2], [0, 0.2], [4, 0.2]], 65, 40, 35, 2.6) },
    { nombre: "Triángulo", adj: [[1, 2], [0, 2], [0, 1]], ancho: 340, alto: 225,
      pos: posiciones([[2, 2.6], [0.4, 0.2], [3.6, 0.2]], 65, 40, 35, 2.6) },
    { nombre: "Dos pedazos", adj: [[1], [0], [3, 4], [2, 4], [2, 3]], ancho: 360, alto: 180,
      pos: posiciones([[0.2, 2.1], [0.2, 0.1], [4, 2.1], [2.6, 0.1], [5.4, 0.1]], 58, 25, 35, 2.1) }
  ];

  var CIERRES = [
    { nombre: "Grafo 1", adj: [[1, 5], [0, 2, 4], [1, 3], [2, 4], [1, 3, 5], [0, 4]], ancho: 340, alto: 240,
      pos: [[60, 40], [170, 40], [280, 40], [280, 200], [170, 200], [60, 200]] },
    { nombre: "Grafo 2", adj: [[1], [0, 2], [1], [4, 7], [3, 5], [4, 6], [5, 7], [6, 3]], ancho: 360, alto: 240,
      pos: [[40, 40], [40, 120], [40, 200], [210, 40], [315, 95], [280, 205], [140, 205], [105, 95]] },
    { nombre: "Grafo 3", adj: [[1, 3], [0, 2], [1, 3], [0, 2], [5], [4], []], ancho: 360, alto: 220,
      pos: [[40, 40], [150, 40], [150, 170], [40, 170], [240, 40], [240, 170], [320, 105]] }
  ];

  function aristasDe(adj) {
    var res = [], u = 0;
    while (u < adj.length) {
      adj[u].forEach(function (v) { if (u < v) { res.push([u, v, ""]); } });
      u = u + 1;
    }
    return res;
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

  /* Variantes con error */
  function soloDesdeCero(adj) {
    var color = vacio(adj.length), res = true;
    if (adj.length > 0 && !pintar(adj, color, 0, 0)) { res = false; }
    return { resultado: res, color: color };
  }

  function aceptaIgual(adj) {
    var color = vacio(adj.length), u = 0;
    function p(x, c) {
      color[x] = c;
      adj[x].forEach(function (v) { if (color[v] === -1) { p(v, 1 - c); } });
    }
    while (u < adj.length) {
      if (color[u] === -1) { p(u, 0); }
      u = u + 1;
    }
    return { resultado: true, color: color };
  }

  function choquesDe(adj, color) {
    return aristasDe(adj).filter(function (a) { return color[a[0]] !== -1 && color[a[0]] === color[a[1]]; }).map(function (a) { return [a[0], a[1]]; });
  }

  /* La corrida, en eventos. Los de tipo decision esperan al estudiante; antes y
     despues son {color, pila, choques}. */
  function eventos(adj) {
    var ev = [], color = vacio(adj.length), pila = [], choques = [], resultado = true;
    function foto() {
      return { color: color.slice(), pila: pila.map(function (m) { return { u: m.u, c: m.c, sin: m.sin }; }), choques: choques.map(function (x) { return x.slice(); }) };
    }
    function anotar(o, ant) { o.antes = ant; ev.push(o); }
    function llamada(u, c) {
      var marco = { u: u, c: c, sin: true };
      color[u] = c;
      pila.push(marco);
      adj[u].forEach(function (v) {
        var ant = foto(), sub;
        if (color[v] === -1) {
          anotar({ tipo: "sinColor", u: u, v: v, c: c, lineas: [3, 4, 5] }, ant);
          sub = llamada(v, 1 - c);
          anotar({ tipo: "vuelve", u: u, v: v, res: sub, lineas: sub ? [5] : [5, 6] }, foto());
          if (!sub) { marco.sin = false; }
        } else if (color[v] === c) {
          marco.sin = false;
          if (!choques.some(function (x) { return (x[0] === u && x[1] === v) || (x[0] === v && x[1] === u); })) { choques.push([u, v]); }
          anotar({ tipo: "conColor", u: u, v: v, c: c, cv: color[v], lineas: [3, 4, 7] }, ant);
        } else {
          anotar({ tipo: "conColor", u: u, v: v, c: c, cv: color[v], lineas: [3, 4, 7] }, ant);
        }
      });
      pila.pop();
      return marco.sin;
    }
    /* Los nodos seguidos que ya tienen color se saltan en un solo evento. */
    var u = 0, saltados = [];
    function soltarSaltados() {
      if (saltados.length > 0) { anotar({ tipo: "salta", nodos: saltados, lineas: [12, 13] }, foto()); }
      saltados = [];
    }
    while (u < adj.length) {
      if (color[u] === -1) {
        soltarSaltados();
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
    soltarSaltados();
    anotar({ tipo: "fin", resultado: resultado, lineas: [16] }, foto());
    return ev;
  }

  function esDecision(e) { return e.tipo === "sinColor" || e.tipo === "conColor" || e.tipo === "arranque" || e.tipo === "afuera"; }

  function opcionesDe(e) {
    var res;
    if (e.tipo === "sinColor" || e.tipo === "arranque") {
      res = [{ id: "azul", t: "azul", clase: "color-azul" }, { id: "naranja", t: "naranja", clase: "color-naranja" }];
    } else if (e.tipo === "conColor") {
      res = [{ id: "cumple", t: "Colores distintos: la arista se cumple" }, { id: "choque", t: "Mismo color: se anota el choque" }, { id: "repinta", t: "Se le cambia el color a " + e.v }];
    } else {
      res = [{ id: "arranca", t: "Arranca pintar(adj, color, " + e.u + ", 0)" }, { id: "termina", t: "Termina: el nodo 0 ya recorrió lo suyo" }];
    }
    return res;
  }

  function juzgar(e, op) {
    var ok, msg, otro;
    if (e.tipo === "arranque") {
      ok = true;
      msg = op === "azul" ?
        "El nodo " + e.u + " queda azul: el código arranca cada pedazo con <code>c = 0</code>." :
        "Serviría igual, porque intercambiar los dos colores en todo el pedazo no rompe ninguna arista. El código arranca con <code>c = 0</code>, así que aquí se sigue con azul.";
    } else if (e.tipo === "sinColor") {
      otro = NOMBRE[1 - e.c];
      ok = op === otro;
      msg = ok ?
        "El nodo " + e.v + " queda " + otro + ": es vecino de " + e.u + ", que es " + NOMBRE[e.c] + ", así que el color no se escoge. Se abre <code>pintar(" + e.v + ", " + otro + ")</code>." :
        "El nodo " + e.u + " es " + NOMBRE[e.c] + " y la arista " + e.u + "-" + e.v + " obliga a colores distintos: el vecino solo puede ser " + otro + ".";
    } else if (e.tipo === "conColor") {
      if (e.c === e.cv) {
        ok = op === "choque";
        if (ok) {
          msg = "Los dos extremos de la arista " + e.u + "-" + e.v + " son " + NOMBRE[e.c] + ": <code>sin_choque = False</code>. El código no corta: anota y sigue con el resto de los vecinos.";
        } else if (op === "cumple") {
          msg = "Aceptar un color igual es el error de tratar el arreglo como un simple visitado. Los dos son " + NOMBRE[e.c] + ", y ninguna arista puede unir dos nodos del mismo color. Con esa línea de menos, el triángulo sale bipartito.";
        } else {
          msg = "Si " + e.v + " cambia de color, se dañan las aristas que ya se revisaron desde " + e.v + ". Además el color de cada nodo estaba forzado por el de su vecino: no hay otra opción por probar.";
        }
      } else {
        ok = op === "cumple";
        if (ok) {
          msg = "El nodo " + e.v + " ya es " + NOMBRE[e.cv] + " y " + e.u + " es " + NOMBRE[e.c] + ": la arista se cumple y no se hace nada.";
        } else if (op === "choque") {
          msg = "Son distintos: " + e.u + " es " + NOMBRE[e.c] + " y " + e.v + " es " + NOMBRE[e.cv] + ". Un nodo ya pintado solo es problema si tiene el mismo color.";
        } else {
          msg = "El nodo " + e.v + " ya tiene un color distinto: la arista se cumple tal como está, y cambiarlo la dañaría.";
        }
      }
    } else {
      ok = op === "arranca";
      msg = ok ?
        "El nodo " + e.u + " sigue en −1, así que está en otro pedazo, y el ciclo de afuera lo arranca. Por eso <code>bipartito</code> recorre todos los nodos." :
        "Arrancar solo del nodo 0 deja sin mirar lo que no se conecta con él. El nodo " + e.u + " sigue sin color, y en ese pedazo puede haber un choque.";
    }
    return { ok: ok, msg: msg };
  }

  function opcionBuena(e) {
    var res;
    if (e.tipo === "arranque") { res = "azul"; }
    else if (e.tipo === "sinColor") { res = NOMBRE[1 - e.c]; }
    else if (e.tipo === "conColor") { res = e.c === e.cv ? "choque" : "cumple"; }
    else { res = "arranca"; }
    return res;
  }

  var ERRORES = [
    { id: "cero", nombre: "Arrancar solo del nodo 0", grafo: 2, correr: soloDesdeCero,
      por: "El pedazo del nodo 0 se pinta bien, y nadie llega al triángulo: queda sin color y su choque no se ve. Con un grafo conexo este programa acierta, así que el error pasa cualquier ejemplo de un solo pedazo." },
    { id: "igual", nombre: "Aceptar un color igual", grafo: 1, correr: aceptaIgual,
      por: "Sin la rama <code>elif color[v] == c</code>, el recorrido trata el arreglo como un visitado y solo revisa si el vecino está pintado. Pinta todo y responde cierto, con la arista roja a la vista." }
  ];

  function juzgarCierre(q, propuesta, dice) {
    var bueno = bipartito(q.adj), choques = choquesDe(q.adj, propuesta), sinPintar = propuesta.filter(function (x) { return x === -1; }).length, ok, msg;
    if (dice === "nose") {
      ok = !bueno.resultado;
      msg = ok ? "No se puede: hay un ciclo de longitud impar, y al recorrerlo dos vecinos terminan con el mismo color." :
        "Sí se puede pintar. Arranque en un nodo y deje que el color de cada vecino quede forzado, sin olvidar los otros pedazos.";
    } else if (sinPintar > 0) {
      ok = false;
      msg = "Faltan " + sinPintar + " nodos por pintar. Un nodo suelto también lleva color, y un pedazo aparte también se recorre.";
    } else if (choques.length > 0) {
      ok = false;
      msg = "Hay aristas con los dos extremos iguales: " + choques.map(function (x) { return x[0] + "-" + x[1]; }).join(", ") + ". " +
        (bueno.resultado ? "Este grafo sí se puede pintar: revise desde ahí." : "Antes de seguir probando, mire si hay un ciclo de longitud impar.");
    } else {
      ok = true;
      msg = "El coloreo funciona: todas las aristas unen colores distintos, y el grafo es bipartito.";
    }
    return { ok: ok, msg: msg, choques: choques };
  }

  var PREGUNTAS = [
    { enun: "¿Qué significa cada color?", opciones: [
      { t: "El pedazo del grafo al que pertenece el nodo.", ok: false,
        por: "Un mismo pedazo lleva los dos colores, porque cada arista une uno con otro. Dos colores no alcanzarían para contar pedazos." },
      { t: "Uno de dos grupos: cada arista tiene que ir de un grupo al otro.", ok: true,
        por: "Pintar es repartir los nodos en dos grupos sin aristas por dentro, que es lo que significa bipartito. El arreglo <code>color</code> reemplaza al de visitados: −1 sin pintar, 0 azul, 1 naranja." }
    ,
      { t: "El orden de visita: primero azul, después naranja.", ok: false,
        por: "El orden lo da la pila de llamadas. En el grafo de arriba, el nodo 2 se visita tercero y queda azul, igual que el 0." }] },
    { enun: "El nodo 0 ya es azul y el nodo 1 es su vecino. ¿Hay que probar los dos colores para el 1?", opciones: [
      { t: "Depende de cuántos vecinos tenga el 1.", ok: false,
        por: "La arista 0-1 ya lo decide sola, con cualquier número de vecinos. Las demás aristas solo pueden confirmarlo o chocar." }
    ,
      { t: "Sí, y retroceder si algo falla más adelante.", ok: false,
        por: "Sería probar coloreos: hay 2ⁿ, y con 60 nodos son 1 152 921 504 606 846 976. Además no hay nada que probar, porque el vecino solo tiene una opción." },
      { t: "No: solo puede ser naranja, y de ahí sus vecinos quedan obligados.", ok: true,
        por: "Pintado el primer nodo, el resto de su pedazo no tiene opción, así que basta recorrerlo una vez: Θ(<i>V</i> + <i>E</i>)." }] },
    { enun: "¿Qué decide que un grafo no se pueda pintar?", opciones: [
      { t: "Que el recorrido llegue a un nodo ya pintado.", ok: false,
        por: "Pasa en cualquier ciclo, y también al mirar de vuelta al nodo de donde se vino. Si el color es distinto, la arista se cumple." }
    ,
      { t: "Que tenga un ciclo.", ok: false,
        por: "El ciclo 0-1-2-3 del grafo de arriba se pinta alternando. Solo un ciclo de longitud impar obliga a un choque, como el triángulo." },
      { t: "Que un nodo tenga muchos vecinos.", ok: false,
        por: "Una estrella se pinta con el centro de un color y todas las hojas del otro, con cualquier número de hojas." },
      { t: "Que al recorrerlo aparezca una arista con los dos extremos del mismo color.", ok: true,
        por: "Los colores estaban forzados, así que ese choque no se arregla con otro coloreo. Por eso basta una arista así para responder falso." }] },
    { enun: "Desde u, azul, se mira a v, que ya es azul. ¿Qué hace el código?", opciones: [
      { t: "Anota sin_choque = False y sigue con los demás vecinos.", ok: true,
        por: "La llamada termina de recorrer su lista y devuelve falso, y ese falso sube por las llamadas abiertas hasta <code>bipartito</code>." }
    ,
      { t: "Nada, porque v ya está visitado.", ok: false,
        por: "Es lo que hace un recorrido corriente, y aquí es el error: aceptar un color igual. Con esa regla el triángulo sale bipartito." },
      { t: "Le cambia el color a v.", ok: false,
        por: "Dañaría las aristas de v que ya se revisaron, y el color de v estaba forzado desde el suyo." }] },
    { enun: "El grafo puede venir en varios pedazos. ¿Desde dónde se arranca?", opciones: [
      { t: "Desde el nodo 0, porque de ahí se llega a todo.", ok: false,
        por: "Solo se llega a su pedazo. Con una arista 0-1 y un triángulo 2-3-4, ese programa responde cierto y lo correcto es falso." },
      { t: "Desde cada nodo que siga sin color, con un ciclo por fuera de pintar.", ok: true,
        por: "Cada pedazo se decide aparte y arranca con azul. Con que uno tenga choque, el grafo completo no es bipartito." },
      { t: "Desde el 0, y al final se pinta de azul todo lo que quedó sin color.", ok: false,
        por: "Tres nodos azules en un triángulo son tres aristas rotas, y el programa ni las miraría." }
    ] }
  ];

  return { AZUL: AZUL, NARANJA: NARANJA, NOMBRE: NOMBRE, codigo: CODIGO, GRAFOS: GRAFOS, CIERRES: CIERRES, ERRORES: ERRORES, PREGUNTAS: PREGUNTAS,
           aristasDe: aristasDe, pintar: pintar, bipartito: bipartito, soloDesdeCero: soloDesdeCero, aceptaIgual: aceptaIgual, choquesDe: choquesDe,
           eventos: eventos, esDecision: esDecision, opcionesDe: opcionesDe, juzgar: juzgar, opcionBuena: opcionBuena, juzgarCierre: juzgarCierre, vacio: vacio };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, RELLENO = { 0: "#8fb8df", 1: "#f4b37a" }, BORDE = { 0: "#1f5fa8", 1: "#c0691a" };
    function el(id) { return document.getElementById(id); }
    var marcar = PLANTEO.codigo("panel-codigo", E.codigo);

    /* Dibuja un grafo; o = {color, actual, mirando, choques, rojas}. */
    function dibujo(g, o) {
      var A = E.aristasDe(g.adj);
      function es(a, x) { return (a[0] === x[0] && a[1] === x[1]) || (a[0] === x[1] && a[1] === x[0]); }
      return GRAFOSVG.dibujar({
        n: g.adj.length, pos: g.pos, aristas: A, dirigido: false, ancho: g.ancho, alto: g.alto, maxAncho: g.ancho + 40,
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

    el("p-grafo").innerHTML = dibujo(E.GRAFOS[0], { color: E.vacio(5) });

    /* La corrida: un evento a la vez */
    var g = 0, EV = [], k = 0;
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
      if (e.tipo === "arranque") { res = "El ciclo de afuera llama a <code>pintar</code> con el nodo " + e.u + ". ¿De qué color queda?"; }
      else if (e.tipo === "afuera") { res = "La llamada terminó y el ciclo de afuera llega a <code>u = " + e.u + "</code>, que sigue con <code>color = -1</code>. ¿Qué hace?"; }
      else if (e.tipo === "sinColor") { res = "El nodo " + e.u + ", " + E.NOMBRE[e.c] + ", mira a su vecino " + e.v + ", que no tiene color. ¿De qué color queda el " + e.v + "?"; }
      else if (e.tipo === "conColor") { res = "El nodo " + e.u + ", " + E.NOMBRE[e.c] + ", mira a su vecino " + e.v + ", que ya está pintado. ¿Qué hace el código?"; }
      else if (e.tipo === "vuelve") { res = "<code>pintar(" + e.v + ")</code> termina y devuelve <code>" + (e.res ? "True" : "False") + "</code>. La llamada del nodo " + e.u + (e.res ? " sigue con sus vecinos." : " anota <code>sin_choque = False</code> y sigue con sus vecinos."); }
      else if (e.tipo === "termina") { res = "La llamada de arranque desde " + e.u + " devuelve <code>" + (e.res ? "True" : "False") + "</code>" + (e.res ? "." : ", y <code>resultado</code> pasa a <code>False</code>."); }
      else if (e.tipo === "salta") { res = "El ciclo de afuera mira " + (e.nodos.length > 1 ? "los nodos " : "el nodo ") + e.nodos.join(", ") + ": ya " + (e.nodos.length > 1 ? "tienen" : "tiene") + " color, así que no arranca nada."; }
      else { res = "El ciclo terminó: <code>return resultado</code>."; }
      return res;
    }
    function pintarCorrida() {
      var e = EV[k], est = e.antes, grafo = E.GRAFOS[g], dec = el("r-decision"), mira = null, actual = est.pila.length > 0 ? est.pila[est.pila.length - 1].u : null;
      if (e.tipo === "sinColor" || e.tipo === "conColor") { mira = [e.u, e.v]; }
      el("r-grafo").innerHTML = dibujo(grafo, { color: est.color, actual: actual, mirando: mira, choques: est.choques });
      el("r-pila").innerHTML = pilaHTML(est.pila);
      el("r-instruccion").innerHTML = textoEvento(e);
      marcar(e.lineas);
      if (E.esDecision(e)) {
        dec.innerHTML = E.opcionesDe(e).map(function (o) {
          return "<button type='button' data-op='" + o.id + "'" + (o.clase ? " class='" + o.clase + "'" : "") + ">" + o.t + "</button>";
        }).join("");
      } else if (e.tipo === "fin") {
        dec.innerHTML = "";
      } else {
        dec.innerHTML = "<button type='button' data-seguir='1' class='primario'>Seguir</button>";
      }
      el("r-ayuda").classList.toggle("oculto", !E.esDecision(e));
      el("r-fin").classList.toggle("oculto", e.tipo === "fin");
      if (e.tipo === "fin") {
        el("r-cierre").classList.add("visible");
        el("r-cierre").innerHTML = (e.resultado ? "Responde <b>cierto</b>: el grafo es bipartito, y cada arista une dos colores distintos." :
          "Responde <b>falso</b>: en rojo queda la arista con los dos extremos iguales. El falso subió por las llamadas abiertas y llegó a <code>resultado</code>.") +
          " Cada nodo se pintó una vez y cada arista se miró desde sus dos extremos: Θ(<i>V</i> + <i>E</i>)." +
          (g < E.GRAFOS.length - 1 ? " Siga con el botón " + E.GRAFOS[g + 1].nombre + ", arriba." : "");
      } else {
        el("r-cierre").classList.remove("visible");
      }
    }
    function avanzar() { if (k < EV.length - 1) { k = k + 1; pintarCorrida(); } }
    function elegir(op) {
      var r = E.juzgar(EV[k], op);
      PLANTEO.decir("r-veredicto", r.ok, r.msg);
      if (r.ok) { avanzar(); }
    }
    el("r-decision").addEventListener("click", function (ev) {
      var b = ev.target.closest ? ev.target.closest("button") : null;
      if (b && b.getAttribute("data-op")) { elegir(b.getAttribute("data-op")); }
      else if (b && b.getAttribute("data-seguir")) { PLANTEO.decir("r-veredicto", true, ""); avanzar(); }
    });
    function iniciarGrafo(n) {
      g = n;
      EV = E.eventos(E.GRAFOS[g].adj);
      k = 0;
      PLANTEO.decir("r-veredicto", true, "");
      pintarCorrida();
    }
    var elegirGrafo = PLANTEO.botones("grafos", E.GRAFOS.map(function (x) { return x.nombre; }), iniciarGrafo);
    el("r-ayuda").addEventListener("click", function () { elegir(E.opcionBuena(EV[k])); });
    el("r-fin").addEventListener("click", function () { k = EV.length - 1; PLANTEO.decir("r-veredicto", true, ""); pintarCorrida(); });
    el("r-reinicio").addEventListener("click", function () { iniciarGrafo(g); });

    /* Los errores */
    PLANTEO.botones("errores", E.ERRORES.map(function (x) { return x.nombre; }), function (i) {
      var x = E.ERRORES[i], grafo = E.GRAFOS[x.grafo], r = x.correr(grafo.adj), bien = E.bipartito(grafo.adj).resultado;
      el("error-grafo").innerHTML = dibujo(grafo, { color: r.color, choques: E.choquesDe(grafo.adj, r.color) });
      el("error-panel").innerHTML = "<p>Con el grafo " + grafo.nombre + " responde <b>" + (r.resultado ? "cierto" : "falso") + "</b>, y lo correcto es <b>" + (bien ? "cierto" : "falso") + "</b>.</p><p>" + x.por + "</p>";
    })(0);

    /* El grafo sin ayuda */
    var c = 0, propuesta = [], rojas = [];
    function pintarCierre() {
      var q = E.CIERRES[c], caja = el("cierre-grafo");
      caja.innerHTML = dibujo(q, { color: propuesta, choques: rojas });
      Array.prototype.forEach.call(caja.querySelectorAll("circle"), function (cir, i) {
        cir.addEventListener("click", function () {
          propuesta[i] = propuesta[i] === -1 ? 0 : (propuesta[i] === 0 ? 1 : -1);
          rojas = [];
          PLANTEO.decir("cierre-veredicto", true, "");
          pintarCierre();
        });
      });
    }
    PLANTEO.botones("cierres", E.CIERRES.map(function (x) { return x.nombre; }), function (i) {
      c = i;
      propuesta = E.vacio(E.CIERRES[c].adj.length);
      rojas = [];
      PLANTEO.decir("cierre-veredicto", true, "");
      pintarCierre();
    })(0);
    el("cierre-sirve").addEventListener("click", function () {
      var r = E.juzgarCierre(E.CIERRES[c], propuesta, "sirve");
      rojas = r.choques;
      pintarCierre();
      PLANTEO.decir("cierre-veredicto", r.ok, r.msg);
    });
    el("cierre-nose").addEventListener("click", function () {
      var r = E.juzgarCierre(E.CIERRES[c], propuesta, "nose");
      PLANTEO.decir("cierre-veredicto", r.ok, r.msg);
    });
    el("cierre-solucion").addEventListener("click", function () {
      var q = E.CIERRES[c], b = E.bipartito(q.adj);
      propuesta = b.color;
      rojas = E.choquesDe(q.adj, b.color);
      pintarCierre();
      PLANTEO.decir("cierre-veredicto", true, b.resultado ?
        "Es bipartito: este es el coloreo que deja el código, que arranca cada pedazo con azul." :
        "No es bipartito: este es el coloreo que deja el código, y en rojo queda la arista con los dos extremos iguales.");
    });

    /* Las partes */
    var abrir = PLANTEO.partes("abrir-partes", ["parte-2", "parte-3", "parte-4"]);
    PLANTEO.preguntas("preguntas", E.PREGUNTAS, abrir);
    elegirGrafo(0);
  })();
}
