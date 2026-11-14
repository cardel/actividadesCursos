/* UVa 11080, Place the Guards: el coloreo de place-the-guards.py sobre cinco casos.
   El panel muestra pintar y guardias tal como estan en la solucion, mas la linea
   de main que guarda la salida de cada caso. */
var EJERCICIO = (function () {
  var NOMBRE = { 0: "azul", 1: "naranja" };

  var CODIGO = [
    { txt: "def pintar(adj, color, u, c, cuenta):",                         num: null },
    { txt: "    # Pinta u con c, cuenta cuántos quedan de cada color y avisa si hubo choque.", num: null },
    { txt: "    color[u] = c",                                              num: 1, bloque: 1 },
    { txt: "    cuenta[c] = cuenta[c] + 1",                                 num: 2, bloque: 1 },
    { txt: "    sin_choque = True",                                         num: 3, bloque: 1 },
    { txt: "    for v in adj[u]:",                                          num: 4, bloque: 1 },
    { txt: "        if color[v] == -1:",                                    num: 5, bloque: 1 },
    { txt: "            if not pintar(adj, color, v, 1 - c, cuenta):",      num: 6, bloque: 1 },
    { txt: "                sin_choque = False",                            num: 7, bloque: 1 },
    { txt: "        elif color[v] == c:",                                   num: 8, bloque: 1 },
    { txt: "            sin_choque = False",                                num: 9, bloque: 1 },
    { txt: "    return sin_choque",                                         num: 10, bloque: 1 },
    { txt: "",                                                              num: null },
    { txt: "def guardias(adj):",                                            num: null },
    { txt: "    # Suma, pedazo por pedazo, el color menos usado; -1 si un pedazo choca.", num: null },
    { txt: "    color = [-1] * len(adj)",                                   num: 11, bloque: 2 },
    { txt: "    total = 0",                                                 num: 12, bloque: 2 },
    { txt: "    posible = True",                                            num: 13, bloque: 2 },
    { txt: "    for u in range(len(adj)):",                                 num: 14, bloque: 2 },
    { txt: "        if color[u] == -1:",                                    num: 15, bloque: 2 },
    { txt: "            cuenta = [0, 0]",                                   num: 16, bloque: 2 },
    { txt: "            if not pintar(adj, color, u, 0, cuenta):",          num: 17, bloque: 2 },
    { txt: "                posible = False",                               num: 18, bloque: 2 },
    { txt: "            elif cuenta[1] == 0:",                              num: 19, bloque: 2 },
    { txt: "                total = total + 1",                             num: 20, bloque: 2 },
    { txt: "            else:",                                             num: 21, bloque: 2 },
    { txt: "                total = total + min(cuenta[0], cuenta[1])",     num: 22, bloque: 2 },
    { txt: "    respuesta = -1",                                            num: 23, bloque: 2 },
    { txt: "    if posible:",                                               num: 24, bloque: 2 },
    { txt: "        respuesta = total",                                     num: 25, bloque: 2 },
    { txt: "    return respuesta",                                          num: 26, bloque: 2 },
    { txt: "",                                                              num: null },
    { txt: "# en main, por cada caso ya leído:",                            num: null },
    { txt: "        salida.append(str(guardias(adj)))",                     num: 27, bloque: 3 }
  ];

  function circulo(n, cx, cy, r) {
    var res = [], i = 0;
    while (i < n) {
      res.push([Math.round(cx + r * Math.sin(2 * Math.PI * i / n)), Math.round(cy - r * Math.cos(2 * Math.PI * i / n))]);
      i = i + 1;
    }
    return res;
  }
  var C4 = circulo(4, 180, 125, 95);

  /* Cada caso es la entrada tal como llega al juez: v, e y las calles en orden. */
  var CASOS = [
    { nombre: "Dos calles sueltas", n: 4, aristas: [[0, 1], [2, 3]], ancho: 340, alto: 180,
      pos: [[70, 40], [70, 140], [270, 40], [270, 140]] },
    { nombre: "Estrella", n: 5, aristas: [[0, 2], [1, 2], [2, 3], [2, 4]], ancho: 360, alto: 250,
      pos: [C4[0], C4[1], [180, 125], C4[2], C4[3]] },
    { nombre: "Un cruce aislado", n: 4, aristas: [[0, 1], [1, 2]], ancho: 380, alto: 190,
      pos: [[50, 60], [160, 60], [270, 60], [330, 150]] },
    { nombre: "Tres pedazos", n: 10, aristas: [[0, 1], [1, 2], [1, 3], [4, 5], [4, 6], [4, 7], [8, 9]], ancho: 450, alto: 240,
      pos: [[30, 40], [90, 120], [150, 40], [90, 205], [260, 120], [200, 40], [320, 40], [260, 205], [400, 60], [400, 175]] },
    { nombre: "Ciclo de 5", n: 5, aristas: [[0, 1], [1, 2], [2, 3], [0, 4], [3, 4]], ancho: 360, alto: 250,
      pos: circulo(5, 180, 125, 95) }
  ];

  /* La tarjeta de la limitacion: dos centros unidos, cada uno con tres puntas. */
  var DOBLE = { nombre: "Doble estrella", n: 8, aristas: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [1, 6], [1, 7]], ancho: 400, alto: 220,
    pos: [[140, 110], [260, 110], [50, 40], [40, 110], [50, 180], [350, 40], [360, 110], [350, 180]] };

  function adjDe(q) {
    var adj = [], i = 0;
    while (i < q.n) { adj.push([]); i = i + 1; }
    q.aristas.forEach(function (a) { adj[a[0]].push(a[1]); adj[a[1]].push(a[0]); });
    return adj;
  }
  function entradaDe(q) {
    return [q.n + " " + q.aristas.length].concat(q.aristas.map(function (a) { return a[0] + " " + a[1]; })).join("\n");
  }
  function vacio(n) { var c = [], i = 0; while (i < n) { c.push(-1); i = i + 1; } return c; }

  function pintar(adj, color, u, c, cuenta) {
    var sin = true;
    color[u] = c;
    cuenta[c] = cuenta[c] + 1;
    adj[u].forEach(function (v) {
      if (color[v] === -1) {
        if (!pintar(adj, color, v, 1 - c, cuenta)) { sin = false; }
      } else if (color[v] === c) {
        sin = false;
      }
    });
    return sin;
  }
  /* guardias de la solucion, con lo que cada pedazo deja: su arranque, su cuenta y su aporte. */
  function guardias(adj) {
    var color = vacio(adj.length), total = 0, posible = true, u = 0, pedazos = [], cuenta, ok, ap;
    while (u < adj.length) {
      if (color[u] === -1) {
        cuenta = [0, 0];
        ok = pintar(adj, color, u, 0, cuenta);
        ap = null;
        if (!ok) { posible = false; }
        else if (cuenta[1] === 0) { ap = 1; total = total + 1; }
        else { ap = Math.min(cuenta[0], cuenta[1]); total = total + ap; }
        pedazos.push({ u: u, cuenta: cuenta, ok: ok, aporte: ap });
      }
      u = u + 1;
    }
    return { respuesta: posible ? total : -1, color: color, pedazos: pedazos };
  }

  /* Los cruces que llevan guardia: en cada pedazo, el color menos usado. */
  function conGuardia(adj) {
    var g = guardias(adj), res = [];
    if (g.respuesta !== -1) {
      g.pedazos.forEach(function (p) {
        var elegido = p.cuenta[1] === 0 || p.cuenta[0] <= p.cuenta[1] ? 0 : 1, pedazo = vacio(adj.length);
        pintar(adj, pedazo, p.u, 0, [0, 0]);
        pedazo.forEach(function (c, v) { if (c === elegido) { res.push(v); } });
      });
    }
    return res.sort(function (a, b) { return a - b; });
  }

  function choquesDe(adj, color) {
    var res = [], u = 0;
    while (u < adj.length) {
      adj[u].forEach(function (v) { if (u < v && color[u] !== -1 && color[u] === color[v]) { res.push([u, v]); } });
      u = u + 1;
    }
    return res;
  }

  /* La corrida en eventos; los de decision esperan al estudiante. antes = {color, pila, choques, cuenta, total, posible}. */
  function eventos(adj) {
    var ev = [], color = vacio(adj.length), pila = [], choques = [], posible = true, vistas = 0, total = 0, cuenta = null;
    function foto() {
      return { color: color.slice(), pila: pila.map(function (m) { return { u: m.u, c: m.c, sin: m.sin }; }),
               choques: choques.map(function (x) { return x.slice(); }), vistas: vistas,
               cuenta: cuenta ? cuenta.slice() : null, total: total, posible: posible };
    }
    function anotar(o, ant) { o.antes = ant; ev.push(o); }
    function llamada(u, c) {
      var marco = { u: u, c: c, sin: true };
      color[u] = c;
      cuenta[c] = cuenta[c] + 1;
      pila.push(marco);
      adj[u].forEach(function (v) {
        var ant = foto(), sub;
        vistas = vistas + 1;
        if (color[v] === -1) {
          anotar({ tipo: "sinColor", u: u, v: v, c: c, lineas: [4, 5, 6] }, ant);
          sub = llamada(v, 1 - c);
          anotar({ tipo: "vuelve", u: u, v: v, res: sub, lineas: sub ? [6] : [6, 7] }, foto());
          if (!sub) { marco.sin = false; }
        } else {
          if (color[v] === c) {
            marco.sin = false;
            if (!choques.some(function (x) { return (x[0] === u && x[1] === v) || (x[0] === v && x[1] === u); })) { choques.push([u, v]); }
          }
          anotar({ tipo: "conColor", u: u, v: v, c: c, cv: color[v], lineas: [4, 5, 8] }, ant);
        }
      });
      pila.pop();
      return marco.sin;
    }
    var u = 0, saltados = [], r, ant;
    function soltar() {
      if (saltados.length > 0) { anotar({ tipo: "salta", nodos: saltados, lineas: [14, 15] }, foto()); }
      saltados = [];
    }
    while (u < adj.length) {
      if (color[u] === -1) {
        soltar();
        cuenta = null;
        ant = foto();
        if (u > 0) { anotar({ tipo: "afuera", u: u, lineas: [14, 15] }, ant); }
        cuenta = [0, 0];
        anotar({ tipo: "arranque", u: u, lineas: [16, 17] }, foto());
        r = llamada(u, 0);
        if (!r) {
          posible = false;
          anotar({ tipo: "choca", u: u, cuenta: cuenta.slice(), lineas: [17, 18] }, foto());
        } else {
          anotar({ tipo: "termina", u: u, cuenta: cuenta.slice(), lineas: cuenta[1] === 0 ? [17, 19, 20] : [17, 19, 21, 22] }, foto());
          total = total + (cuenta[1] === 0 ? 1 : Math.min(cuenta[0], cuenta[1]));
        }
      } else {
        saltados.push(u);
      }
      u = u + 1;
    }
    soltar();
    cuenta = null;
    anotar({ tipo: "fin", respuesta: posible ? total : -1, lineas: [23, 24, 25, 26, 27] }, foto());
    return ev;
  }

  /* Decisiones con botones fijos; termina y fin se deciden con opciones numericas. */
  function esDecision(e) { return e.tipo === "sinColor" || e.tipo === "conColor" || e.tipo === "arranque" || e.tipo === "afuera"; }
  function esNumerica(e) { return e.tipo === "termina" || e.tipo === "fin"; }

  function opcionesDe(e) {
    var res;
    if (e.tipo === "sinColor" || e.tipo === "arranque") {
      res = [{ id: "azul", t: "azul", clase: "color-azul" }, { id: "naranja", t: "naranja", clase: "color-naranja" }];
    } else if (e.tipo === "conColor") {
      res = [{ id: "cumple", t: "Colores distintos: la calle se cumple" }, { id: "choque", t: "Mismo color: la calle choca" }, { id: "repinta", t: "Se le cambia el color a " + e.v }];
    } else {
      res = [{ id: "arranca", t: "Arranca un pedazo nuevo desde el " + e.u }, { id: "termina", t: "Nada: el pedazo anterior ya cubrió la ciudad" }];
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
        "El cruce " + e.u + " queda azul: <code>guardias</code> llama a <code>pintar</code> con <code>c = 0</code> y una <code>cuenta</code> nueva en <code>[0, 0]</code>." :
        "Daría el mismo número de guardias: cambiar los dos colores en el pedazo cambia las dos cuentas de lugar y el menor sigue siendo el mismo. El código llama con <code>c = 0</code>, así que se sigue con azul.";
    } else if (e.tipo === "sinColor") {
      otro = NOMBRE[1 - e.c];
      msg = ok ?
        "El " + e.v + " queda " + otro + ": su vecino " + e.u + " es " + NOMBRE[e.c] + " y la línea 6 llama con <code>1 - c</code>. La línea 2 le suma uno a la cuenta de " + otro + "." :
        "Se miró el color equivocado: el " + e.u + " es " + NOMBRE[e.c] + " y la calle " + e.u + "-" + e.v + " necesita un extremo con guardia y otro sin él, así que el " + e.v + " solo puede ser " + otro + ".";
    } else if (e.tipo === "conColor") {
      if (e.c === e.cv) {
        if (ok) {
          msg = "Los dos extremos de " + e.u + "-" + e.v + " son " + NOMBRE[e.c] + ": esa calle quedaría con dos guardias o sin ninguno. La línea 9 deja <code>sin_choque = False</code> y el código sigue con los demás vecinos.";
        } else if (op === "cumple") {
          msg = "Se miró solo si el " + e.v + " estaba pintado. Lo está, y del mismo color que el " + e.u + ": " + NOMBRE[e.c] + ". La rama <code>elif color[v] == c</code> existe para este momento.";
        } else {
          msg = "El color del " + e.v + " quedó forzado por el vecino desde el que se pintó. Cambiarlo dañaría esa calle, y el choque pasaría a otra parte del ciclo.";
        }
      } else if (ok) {
        msg = "El " + e.v + " es " + NOMBRE[e.cv] + " y el " + e.u + " es " + NOMBRE[e.c] + ": la calle tiene un extremo de cada color y la línea 8 no hace nada.";
      } else if (op === "choque") {
        msg = "Se miró que el " + e.v + " ya tiene color, pero no cuál: es " + NOMBRE[e.cv] + " y el " + e.u + " es " + NOMBRE[e.c] + ". Solo choca un vecino del mismo color.";
      } else {
        msg = "El " + e.v + " ya tiene un color distinto del " + e.u + ": la calle se cumple tal como está, y cambiarlo la rompería.";
      }
    } else {
      msg = ok ?
        "El " + e.u + " sigue en −1, así que es el primer cruce de un pedazo nuevo: la línea 16 le abre su propia <code>cuenta</code>." :
        "Se miró solo el pedazo anterior. El " + e.u + " sigue sin color, porque ninguna calle lo une con lo ya pintado, y sus calles también tienen que quedar vigiladas.";
    }
    return { ok: ok, msg: msg };
  }

  function unicos(lista) {
    var vistos = {}, res = [];
    lista.forEach(function (o) { if (!vistos[o.valor]) { vistos[o.valor] = true; res.push(o); } });
    return res;
  }

  /* Cuantos guardias aporta un pedazo que termino sin choque. */
  function opcionesAporte(cuenta) {
    var a = cuenta[0], b = cuenta[1], m = Math.min(a, b), lista;
    if (b === 0) {
      lista = [
        { valor: 1, clave: "correcta", razon: "Aporta 1. El cruce no tiene calles, así que ningún vecino lo vigila: el guardia tiene que estar en él. Por eso la línea 19 pregunta si <code>cuenta[1] == 0</code> antes de tomar el menor." },
        { valor: 0, clave: "minimo", razon: "Es <code>min(1, 0)</code>, el menor de los dos colores, y deja el cruce sin vigilar. Un cruce sin calles no tiene vecino que lo cuide; la línea 19 lo atiende aparte y suma 1." },
        { valor: 2, clave: "dos", razon: "Contó un guardia por cada color, pero el pedazo tiene un solo cruce y en él cabe un guardia, que lo deja vigilado." }
      ];
    } else {
      lista = [
        { valor: m, clave: "correcta", razon: "Aporta " + m + ", el menor entre " + a + " azules y " + b + " naranjas. Los guardias van en todos los cruces de un color y en ninguno del otro: cada calle queda con un extremo vigilado y nunca con dos. De los dos repartos se toma el que pone menos." },
        { valor: a, clave: "azul", razon: "Sumó los azules, que es el color con que arrancó el pedazo. Los naranjas son el otro reparto válido, y aquí hay " + b + "; el arranque en azul es solo por dónde empezó el ciclo." },
        { valor: Math.max(a, b), clave: "mayor", razon: "Tomó el color más usado. Los dos repartos vigilan todo y cumplen la regla, así que se escoge el que pone menos guardias, " + m + "." },
        { valor: a + b, clave: "todos", razon: "Puso un guardia en cada cruce del pedazo. Entonces cada calle tiene guardias en sus dos extremos, que el enunciado prohíbe." },
        { valor: 0, clave: "cero", razon: "Sin guardias en el pedazo ninguna de sus calles queda vigilada: un guardia solo vigila las calles que tocan su cruce." }
      ];
    }
    return unicos(lista);
  }

  /* La salida del caso. */
  function opcionesSalida(q) {
    var g = guardias(adjDe(q)), lista, azul = 0, mayor = 0, minimo = 0, sinAislado = 0, aislados = 0;
    g.pedazos.forEach(function (p) {
      azul = azul + p.cuenta[0];
      mayor = mayor + Math.max(p.cuenta[0], p.cuenta[1]);
      minimo = minimo + Math.min(p.cuenta[0], p.cuenta[1]);
      if (p.cuenta[1] === 0) { aislados = aislados + 1; }
      sinAislado = sinAislado + Math.min(p.cuenta[0], p.cuenta[1]);
    });
    if (g.respuesta === -1) {
      lista = [
        { valor: -1, clave: "correcta", razon: "Imprime -1. Un pedazo chocó: una calle quedó con los dos extremos del mismo color, así que en cualquier reparto tendría dos guardias o ninguno. Un ciclo de largo impar no se puede alternar, y la línea 18 dejó <code>posible = False</code>." },
        { valor: minimo, clave: "minimo", razon: "Sumó el menor color sin mirar el choque. Con un choque ningún color sirve: la calle roja tendría dos guardias o ninguno, y el código responde -1 aunque <code>cuenta</code> tenga números." },
        { valor: azul, clave: "azul", razon: "Contó los azules como si fueran los guardias, pero la calle roja une dos azules: tendría guardias en los dos extremos." },
        { valor: q.n, clave: "todos", razon: "Un guardia en cada cruce deja todas las calles con dos guardias, que está prohibido. Tampoco hay otro reparto: el ciclo impar no deja ninguno." }
      ];
    } else {
      lista = [
        { valor: g.respuesta, clave: "correcta", razon: "Imprime " + g.respuesta + ": " + g.pedazos.map(function (p) { return p.aporte; }).join(" + ") + ", un sumando por pedazo, cada uno el menor de sus dos colores" + (aislados > 0 ? " y 1 por el cruce aislado." : ".") },
        { valor: azul, clave: "azul", razon: "Sumó los azules de cada pedazo. Cada pedazo escoge su color por separado, y en alguno los naranjas son menos." },
        { valor: mayor, clave: "mayor", razon: "Sumó el color más usado de cada pedazo. Los dos colores cumplen la regla, así que en cada pedazo se toma el que pone menos." },
        { valor: q.n, clave: "todos", razon: "Un guardia en cada cruce deja cada calle con guardias en los dos extremos, que el enunciado prohíbe." },
        { valor: sinAislado, clave: "sin-aislado", razon: "Contó 0 por el cruce aislado, que es el menor de sus dos colores. Ese cruce no tiene vecino que lo vigile y necesita su propio guardia." },
        { valor: -1, clave: "imposible", razon: "Ninguna calle quedó roja: en cada pedazo los colores alternan, así que hay reparto y el código suma." }
      ];
    }
    return unicos(lista);
  }

  /* La limitacion: sin la regla de los dos extremos, el minimo de la doble estrella. */
  function opcionesSinRegla(q) {
    var g = guardias(adjDe(q));
    return unicos([
      { valor: 2, clave: "correcta", razon: "Bastan 2, en los cruces 0 y 1: cada calle toca a uno de los dos y los seis cruces de las puntas tienen un vecino con guardia. La calle 0-1 queda con guardias en los dos extremos, que la regla prohíbe. Sin la regla un pedazo tiene más repartos que dos colores, y escoger el menor color ya no da el mínimo: aquí da " + g.respuesta + "." },
      { valor: g.respuesta, clave: "codigo", razon: "Es lo que imprime el código, " + g.respuesta + ", porque con la regla solo valen los dos colores. Sin la regla también vale poner guardia en los dos extremos de una calle, y aparece un reparto más chico." },
      { valor: 1, clave: "uno", razon: "Un guardia en el 0 vigila sus cuatro calles, pero las calles del 1 hacia el 5, el 6 y el 7 no tocan al 0 y quedan sin nadie." },
      { valor: q.n - 2, clave: "puntas", razon: "Puso guardias en las seis puntas. Así queda vigilado todo salvo la calle 0-1, y hace falta más: mover dos guardias a los centros cubre lo mismo con menos." }
    ]);
  }

  /* Lo que cuesta: vueltas de la linea 5 con el tope del enunciado. */
  function opcionesCosto(v, e) {
    return unicos([
      { valor: 2 * e, clave: "correcta", razon: "Son " + (2 * e) + ": cada cruce se pinta una vez y recorre toda su lista, y cada calle está en la lista de sus dos extremos. Probar todos los repartos de guardias serían 2<sup>" + v + "</sup> intentos." },
      { valor: e, clave: "por-calle", razon: "Contó cada calle una vez. La lista de adyacencia guarda la calle f-t en adj[f] y en adj[t], y las dos se recorren." },
      { valor: v, clave: "por-cruce", razon: "Contó una vez por cruce, que es lo que corre la línea 1. La línea 5 está dentro del <code>for v in adj[u]</code> y corre una vez por vecino." },
      { valor: v * v, clave: "matriz", razon: "Es lo que costaría con matriz de adyacencia, v por v. Con lista cada cruce recorre solo sus vecinos." }
    ]);
  }

  var PREGUNTAS = [
    { enun: "Una calle une los cruces f y t. ¿Cuántos guardias puede haber entre sus dos extremos?", opciones: [
      { t: "Al menos uno, para que la calle quede vigilada.", ok: false,
        por: "Al menos uno la deja vigilada, pero dos en los extremos de la misma calle están prohibidos. Con las dos condiciones juntas queda una sola cantidad." },
      { t: "Exactamente uno: uno la vigila y dos se prohíben.", ok: true,
        por: "Uno la vigila y la regla prohíbe dos. Cada calle tiene un extremo con guardia y otro sin él: es un coloreo con dos colores." },
      { t: "A lo sumo uno, para no romper la regla.", ok: false,
        por: "Con cero guardias en los extremos la calle no la vigila nadie: un guardia vigila solo las calles que tocan su cruce." }] },
    { enun: "En un pedazo con calles se decide si el cruce 0 lleva guardia. ¿Qué más queda decidido?", opciones: [
      { t: "Solo sus vecinos: si el 0 lleva, ellos no.", ok: false,
        por: "Los vecinos de los vecinos también quedan forzados: en cada calle se pasa de con guardia a sin guardia, así que la decisión corre por todo el pedazo." },
      { t: "Nada más: cada cruce del pedazo se decide aparte.", ok: false,
        por: "Cada calle obliga a que sus dos extremos sean distintos. Con el 0 fijado su vecino queda fijado, y así hasta el último cruce del pedazo." },
      { t: "Todo el pedazo: en cada calle se alterna.", ok: true,
        por: "Decidir el 0 fija a sus vecinos, que fijan a los suyos. Cada pedazo tiene solo dos repartos, los dos colores, y se escoge el que pone menos guardias." }] },
    { enun: "Un cruce no tiene ninguna calle. ¿Cuántos guardias necesita su pedazo?", opciones: [
      { t: "Uno: nadie más puede vigilar ese cruce.", ok: true,
        por: "Lo vigila un guardia en él o en un vecino, y no tiene vecinos. La línea 19 lo atiende aparte, porque el menor de sus colores daría 0." },
      { t: "Ninguno: no tiene calles que vigilar.", ok: false,
        por: "El enunciado pide vigilar también cada cruce, no solo las calles, y a este solo lo vigila un guardia propio." },
      { t: "Depende de los guardias de los otros pedazos.", ok: false,
        por: "Ningún guardia de otro pedazo llega a este cruce, porque no hay calle que los una. Su aporte es el mismo con cualquier resto." }] },
    { enun: "Si un pedazo choca, ¿qué guarda el programa como salida del caso?", opciones: [
      { t: "El total de los demás pedazos, sin contar ese.", ok: false,
        por: "Ese pedazo sigue en la ciudad y sus calles tienen que quedar vigiladas. Si en él no hay reparto, no lo hay para el caso entero." },
      { t: "-1, aunque los otros pedazos sí tengan reparto.", ok: true,
        por: "Una calle que choca queda sin vigilar o con dos guardias en cualquier reparto. La línea 18 deja <code>posible = False</code> y sale -1." },
      { t: "El menor color de ese pedazo, como en los demás.", ok: false,
        por: "Con choque, los dos colores dejan alguna calle con los extremos iguales, así que ninguno es un reparto válido." }] }
  ];

  return { NOMBRE: NOMBRE, codigo: CODIGO, CASOS: CASOS, DOBLE: DOBLE, PREGUNTAS: PREGUNTAS,
           adjDe: adjDe, entradaDe: entradaDe, vacio: vacio, pintar: pintar, guardias: guardias, conGuardia: conGuardia,
           choquesDe: choquesDe, eventos: eventos, esDecision: esDecision, esNumerica: esNumerica, opcionesDe: opcionesDe,
           opcionBuena: opcionBuena, juzgar: juzgar, opcionesAporte: opcionesAporte, opcionesSalida: opcionesSalida,
           opcionesSinRegla: opcionesSinRegla, opcionesCosto: opcionesCosto };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, RELLENO = { 0: "#8fb8df", 1: "#f4b37a" }, BORDE = { 0: "#1f5fa8", 1: "#c0691a" };
    function el(id) { return document.getElementById(id); }
    var marcar = PLANTEO.codigo("panel-codigo", E.codigo);

    function dibujo(q, o) {
      var A = q.aristas.map(function (a) { return [a[0], a[1], ""]; }), g = o.guardias || [];
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
          if (g.indexOf(u) >= 0) { s.nota = "guardia"; s.notaColor = "#24292f"; s.borde = "#24292f"; s.grueso = 4.5; s.cuadrado = true; }
          if (o.actual === u) { s.borde = "#24292f"; s.grueso = 4.5; }
          return s;
        }
      });
    }

    el("p-entrada").textContent = "2\n" + [0, 4].map(function (i) { return E.entradaDe(E.CASOS[i]); }).join("\n");

    /* La corrida */
    var g = 0, EV = [], k = 0, numericas = null;
    function estadoHTML(est) {
      var h = "<span class='rot'>Llamadas abiertas, la última arriba</span>", i = est.pila.length - 1, p = est.pila;
      if (p.length === 0) { h = h + "<span class='marco'>ninguna</span>"; }
      while (i >= 0) {
        h = h + "<span class='marco" + (i === p.length - 1 ? " tope" : "") + "'>pintar(" + p[i].u + ", " + E.NOMBRE[p[i].c] + ")" +
          (p[i].sin ? "" : " <span class='choque'>sin_choque = False</span>") + "</span>";
        i = i - 1;
      }
      h = h + "<span class='rot' style='margin-top:0.3rem'>Variables de <code>guardias</code></span><span class='marco'>" +
        (est.cuenta ? "cuenta = [" + est.cuenta[0] + ", " + est.cuenta[1] + "], " + est.cuenta[0] + " azul" + (est.cuenta[0] === 1 ? "" : "es") + " y " + est.cuenta[1] + " naranja" + (est.cuenta[1] === 1 ? "" : "s") + "; " : "") +
        "total = " + est.total + "; posible = " + (est.posible ? "True" : "<span class='choque'>False</span>") + "</span>";
      return h;
    }
    function textoEvento(e) {
      var res;
      if (e.tipo === "arranque") { res = "<code>guardias</code> abre <code>cuenta = [0, 0]</code> y llama a <code>pintar</code> con el cruce " + e.u + ". ¿De qué color queda?"; }
      else if (e.tipo === "afuera") { res = "El ciclo de afuera llega a <code>u = " + e.u + "</code>, que sigue con <code>color = -1</code>. ¿Qué hace?"; }
      else if (e.tipo === "sinColor") { res = "El " + e.u + ", " + E.NOMBRE[e.c] + ", mira a su vecino " + e.v + ", que no tiene color. ¿De qué color queda el " + e.v + "?"; }
      else if (e.tipo === "conColor") { res = "El " + e.u + ", " + E.NOMBRE[e.c] + ", mira a su vecino " + e.v + ", que ya está pintado. ¿Qué pasa con la calle " + e.u + "-" + e.v + "?"; }
      else if (e.tipo === "vuelve") { res = "<code>pintar(" + e.v + ")</code> devuelve <code>" + (e.res ? "True" : "False") + "</code>. La llamada del " + e.u + (e.res ? " sigue con sus vecinos." : " anota <code>sin_choque = False</code> y sigue con sus vecinos."); }
      else if (e.tipo === "choca") { res = "El pedazo que arrancó en el " + e.u + " devuelve <code>False</code>: hay una calle roja. La línea 18 deja <code>posible = False</code> y este pedazo no suma."; }
      else if (e.tipo === "termina") { res = "El pedazo que arrancó en el " + e.u + " terminó sin choque con <code>cuenta = [" + e.cuenta[0] + ", " + e.cuenta[1] + "]</code>. ¿Cuántos guardias le suma a <code>total</code>?"; }
      else if (e.tipo === "salta") { res = "El ciclo de afuera mira " + (e.nodos.length > 1 ? "los cruces " : "el cruce ") + e.nodos.join(", ") + ": ya " + (e.nodos.length > 1 ? "tienen" : "tiene") + " color, así que no arranca nada."; }
      else { res = "<code>guardias</code> terminó de recorrer los cruces. ¿Qué número guarda la línea 27 como salida del caso?"; }
      return res;
    }
    function pintarCorrida() {
      var e = EV[k], est = e.antes, q = E.CASOS[g], dec = el("r-decision"), mira = null, v, guardado,
          actual = est.pila.length > 0 ? est.pila[est.pila.length - 1].u : null;
      if (e.tipo === "sinColor" || e.tipo === "conColor") { mira = [e.u, e.v]; }
      el("r-grafo").innerHTML = dibujo(q, { color: est.color, actual: actual, mirando: mira, choques: est.choques });
      el("r-pila").innerHTML = estadoHTML(est);
      el("r-instruccion").innerHTML = textoEvento(e);
      marcar(e.lineas);
      el("r-opciones").classList.toggle("oculto", !E.esNumerica(e));
      if (E.esDecision(e)) {
        dec.innerHTML = E.opcionesDe(e).map(function (o) {
          return "<button type='button' data-op='" + o.id + "'" + (o.clase ? " class='" + o.clase + "'" : "") + ">" + o.t + "</button>";
        }).join("");
      } else if (E.esNumerica(e)) {
        dec.innerHTML = "";
        v = el("r-veredicto");
        guardado = [v.className, v.innerHTML];
        numericas.refrescar();
        v.className = guardado[0];
        v.innerHTML = guardado[1];
      } else {
        dec.innerHTML = "<button type='button' data-seguir='1' class='primario'>Seguir</button>";
      }
      el("r-ayuda").classList.toggle("oculto", !(E.esDecision(e) || (E.esNumerica(e) && !hecho)));
      el("r-fin").classList.toggle("oculto", e.tipo === "fin");
    }
    var hecho = false;
    function avanzar() { if (k < EV.length - 1) { k = k + 1; pintarCorrida(); } }
    function elegir(op) {
      var r = E.juzgar(EV[k], op);
      PLANTEO.decir("r-veredicto", r.ok, r.msg);
      if (r.ok) { avanzar(); }
    }
    function armarNumericas() {
      var e = EV[k], res = [];
      if (e && e.tipo === "termina") { res = E.opcionesAporte(e.cuenta); }
      else if (e && e.tipo === "fin") { res = E.opcionesSalida(E.CASOS[g]); }
      return res;
    }
    el("r-decision").addEventListener("click", function (ev) {
      var b = ev.target.closest ? ev.target.closest("button") : null;
      if (b && b.getAttribute("data-op")) { elegir(b.getAttribute("data-op")); }
      else if (b && b.getAttribute("data-seguir")) { PLANTEO.decir("r-veredicto", true, ""); avanzar(); }
    });
    /* El motor escribe la razon en r-veredicto; con la correcta la corrida sigue. */
    el("r-opciones").addEventListener("click", function (ev) {
      var b = ev.target.closest ? ev.target.closest("button") : null, q = E.CASOS[g];
      if (b && b.getAttribute("data-op") === "correcta") {
        if (EV[k].tipo === "termina") { avanzar(); }
        else if (EV[k].tipo === "fin" && !hecho) {
          hecho = true;
          el("r-grafo").innerHTML = dibujo(q, { color: EV[k].antes.color, choques: EV[k].antes.choques, guardias: E.conGuardia(E.adjDe(q)) });
          el("r-ayuda").classList.add("oculto");
        }
      }
    });
    function iniciarCaso(n) {
      g = n;
      EV = E.eventos(E.adjDe(E.CASOS[g]));
      k = 0;
      hecho = false;
      el("r-entrada").textContent = E.entradaDe(E.CASOS[g]);
      PLANTEO.decir("r-veredicto", true, "");
      pintarCorrida();
    }
    numericas = Motor.opcionesNumericas("r-opciones", "r-veredicto", armarNumericas);
    var elegirCaso = PLANTEO.botones("casos", E.CASOS.map(function (x) { return x.nombre; }), iniciarCaso);
    el("r-ayuda").addEventListener("click", function () {
      var b;
      if (E.esNumerica(EV[k])) {
        b = el("r-opciones").querySelector("button[data-op='correcta']");
        if (b) { b.click(); }
      } else { elegir(E.opcionBuena(EV[k])); }
    });
    el("r-fin").addEventListener("click", function () { k = EV.length - 1; hecho = false; PLANTEO.decir("r-veredicto", true, ""); pintarCorrida(); });
    el("r-reinicio").addEventListener("click", function () { iniciarCaso(g); });

    /* Lo que cuesta y la limitacion */
    Motor.opcionesNumericas("c-opciones", "c-veredicto", function () { return E.opcionesCosto(200, 10000); });
    var D = E.DOBLE;
    el("l-entrada").textContent = "1\n" + E.entradaDe(D);
    el("l-grafo").innerHTML = dibujo(D, { color: E.vacio(D.n) });
    Motor.opcionesNumericas("l-opciones", "l-veredicto", function () { return E.opcionesSinRegla(D); });
    el("l-ver").addEventListener("click", function () {
      var adj = E.adjDe(D);
      el("l-grafo").innerHTML = dibujo(D, { color: E.guardias(adj).color, guardias: E.conGuardia(adj) });
    });

    var abrir = PLANTEO.partes("abrir-partes", ["parte-2", "parte-3", "carta-cierre"]);
    PLANTEO.preguntas("preguntas", E.PREGUNTAS, abrir);
    elegirCaso(0);
  })();
}
