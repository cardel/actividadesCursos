/* Una rejilla con zonas prohibidas: se marca y despues se recorre en amplitud.
   El codigo del panel es el de bosque.py; marcar y entrar hacen lo mismo aqui. */
var EJERCICIO = (function () {
  var TABLERO = [".#.....", "..#.#..", ".......", ".......", "......."];
  var TRIPLETAS = [[4, 0, 2], [3, 4, 1]];

  var CODIGO = [
    { txt: "def marcar(tablero, tripletas):",                  num: null },
    { txt: "    for (ri, ci, radio) in tripletas:",                num: 1, bloque: 1 },
    { txt: "        for r in range(max(0, ri - radio), min(R, ri + radio + 1)):", num: 2, bloque: 1 },
    { txt: "            for c in range(max(0, ci - radio), min(C, ci + radio + 1)):", num: 3, bloque: 1 },
    { txt: "                if (r - ri) * (r - ri) + (c - ci) * (c - ci) <= radio * radio:", num: 4, bloque: 1 },
    { txt: "                    prohibida[r][c] = True",   num: 5, bloque: 1 },
    { txt: "",                                             num: null },
    { txt: "def entrar(prohibida, dist, cola, r, c, d):",  num: null },
    { txt: "    if 0 <= r < len(dist) and 0 <= c < len(dist[0]):", num: 6, bloque: 2 },
    { txt: "        if not prohibida[r][c] and dist[r][c] == -1:", num: 7, bloque: 2 },
    { txt: "            dist[r][c] = d",                   num: 8, bloque: 2 },
    { txt: "            cola.append((r, c))",              num: 9, bloque: 2 },
    { txt: "",                                             num: null },
    { txt: "def bosque(tablero, tripletas):",              num: null },
    { txt: "    prohibida = marcar(tablero, tripletas)",   num: 10, bloque: 3 },
    { txt: "    entrar(prohibida, dist, cola, 0, 0, 0)",   num: 11, bloque: 3 },
    { txt: "    while len(cola) > 0:",                     num: 12, bloque: 3 },
    { txt: "        (r, c) = cola.popleft()",              num: 13, bloque: 3 },
    { txt: "        d = dist[r][c] + 1",                   num: 14, bloque: 3 },
    { txt: "        entrar(prohibida, dist, cola, r - 1, c, d)", num: 15, bloque: 3 },
    { txt: "        entrar(prohibida, dist, cola, r + 1, c, d)", num: 16, bloque: 3 },
    { txt: "        entrar(prohibida, dist, cola, r, c - 1, d)", num: 17, bloque: 3 },
    { txt: "        entrar(prohibida, dist, cola, r, c + 1, d)", num: 18, bloque: 3 },
    { txt: "    return dist[R - 1][C - 1]",                num: 19, bloque: 3 }
  ];

  var CIERRES = [
    { nombre: "Tablero 1", tablero: ["......#.", "#.......", ".....#.#", ".##....#", "........", "....#..."], tripletas: [[0, 5, 3], [2, 7, 2]] },
    { nombre: "Tablero 2", tablero: ["......#.", "..#.....", "........", "........", "...#....", "........"], tripletas: [[1, 6, 3], [4, 1, 1]] },
    { nombre: "Tablero 3", tablero: [".....", ".#...", "...#.", "....."], tripletas: [[0, 1, 1]] }
  ];

  function adentro(medida, dr, dc, l) {
    var res;
    if (medida === "rombo") { res = Math.abs(dr) + Math.abs(dc) <= l; }
    else if (medida === "cuadrado") { res = Math.abs(dr) <= l && Math.abs(dc) <= l; }
    else if (medida === "sinCuadrado") { res = dr * dr + dc * dc <= l; }
    else { res = dr * dr + dc * dc <= l * l; }
    return res;
  }

  /* Las casillas de una zona, por el mismo doble ciclo de marcar. */
  function zona(R, C, t, medida) {
    var res = [], r = Math.max(0, t[0] - t[2]), c;
    while (r < Math.min(R, t[0] + t[2] + 1)) {
      c = Math.max(0, t[1] - t[2]);
      while (c < Math.min(C, t[1] + t[2] + 1)) {
        if (adentro(medida, r - t[0], c - t[1], t[2])) { res.push([r, c]); }
        c = c + 1;
      }
      r = r + 1;
    }
    return res;
  }

  function marcar(tablero, tripletas, medida) {
    var R = tablero.length, C = tablero[0].length, p = [], r = 0, c, i = 0;
    while (r < R) {
      p.push([]);
      c = 0;
      while (c < C) { p[r].push(tablero[r].charAt(c) === "#"); c = c + 1; }
      r = r + 1;
    }
    while (i < tripletas.length) {
      zona(R, C, tripletas[i], medida).forEach(function (x) { p[x[0]][x[1]] = true; });
      i = i + 1;
    }
    return p;
  }

  function copiar(m) { return m.map(function (f) { return f.slice(); }); }
  function matriz(R, C, v) {
    var m = [], r = 0, c;
    while (r < R) { m.push([]); c = 0; while (c < C) { m[r].push(v); c = c + 1; } r = r + 1; }
    return m;
  }

  /* El recorrido, una entrada por cada casilla que sale de la cola. Cada vecina
     va con su estado: fuera, prohibida, vista o entra. */
  function recorrido(tablero, tripletas, medida) {
    var p = marcar(tablero, tripletas, medida), R = p.length, C = p[0].length, dist = matriz(R, C, -1), cola = [], salidas = [], DIR = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    if (!p[0][0]) { dist[0][0] = 0; cola.push([0, 0]); }
    while (cola.length > 0) {
      var ant = { dist: copiar(dist), cola: cola.slice() }, u = cola.shift(), d = dist[u[0]][u[1]] + 1, vec = [], entran = [];
      DIR.forEach(function (x) {
        var nr = u[0] + x[0], nc = u[1] + x[1], est;
        if (nr < 0 || nr >= R || nc < 0 || nc >= C) { est = "fuera"; }
        else if (p[nr][nc]) { est = "prohibida"; }
        else if (dist[nr][nc] !== -1) { est = "vista"; }
        else { est = "entra"; dist[nr][nc] = d; cola.push([nr, nc]); entran.push([nr, nc]); }
        vec.push({ r: nr, c: nc, estado: est, dist: est === "vista" ? dist[nr][nc] : (est === "entra" ? d : null) });
      });
      salidas.push({ r: u[0], c: u[1], d: d - 1, vecinas: vec, entran: entran, antes: ant, despues: { dist: copiar(dist), cola: cola.slice() } });
    }
    return { prohibida: p, salidas: salidas, dist: dist, respuesta: dist[R - 1][C - 1] };
  }

  function bosque(tablero, tripletas) { return recorrido(tablero, tripletas, "circulo").respuesta; }

  /* Un camino de pasos minimos, desde la salida hacia atras. */
  function camino(dist) {
    var R = dist.length, C = dist[0].length, r = R - 1, c = C - 1, res = [], DIR = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    if (dist[r][c] !== -1) {
      res.push([r, c]);
      while (dist[r][c] > 0) {
        var i = 0, hallado = false;
        while (i < 4 && !hallado) {
          var a = r + DIR[i][0], b = c + DIR[i][1];
          if (a >= 0 && a < R && b >= 0 && b < C && dist[a][b] === dist[r][c] - 1) { r = a; c = b; hallado = true; res.push([r, c]); }
          i = i + 1;
        }
      }
    }
    return res;
  }

  function cuentaCasilla(t, r, c) {
    var dr = r - t[0], dc = c - t[1], s = dr * dr + dc * dc, ll = t[2] * t[2];
    return "(" + r + ", " + c + ") con (" + t[0] + ", " + t[1] + ", " + t[2] + "): " + (dr * dr) + " + " + (dc * dc) + " = " + s + (s <= ll ? " <= " : " > ") + ll + (s <= ll ? ", adentro" : ", afuera");
  }

  function nombre(x) { return "(" + x[0] + ", " + x[1] + ")"; }

  /* Lo prohibido antes de marcar la tripleta n, con la casilla de su criatura. */
  function yaProhibidas(tablero, tripletas, n) {
    var ya = marcar(tablero, tripletas.slice(0, n), "circulo");
    ya[tripletas[n][0]][tripletas[n][1]] = true;
    return ya;
  }

  /* Las casillas elegidas para una tripleta: se comparan con su zona, sin contar
     lo que ya estaba prohibido. */
  function juzgarZona(tablero, tripletas, n, elegidas) {
    var R = tablero.length, C = tablero[0].length, t = tripletas[n], ya = yaProhibidas(tablero, tripletas, n);
    var z = zona(R, C, t, "circulo"), esta = {}, pide = {}, faltan = [], sobran = [];
    elegidas.forEach(function (x) { esta[nombre(x)] = true; });
    z.forEach(function (x) { pide[nombre(x)] = true; if (!ya[x[0]][x[1]] && !esta[nombre(x)]) { faltan.push(x); } });
    elegidas.forEach(function (x) { if (!pide[nombre(x)]) { sobran.push(x); } });
    var ok = faltan.length === 0 && sobran.length === 0, msg, partes = [];
    function libres(lista) { return lista.filter(function (x) { return !ya[x[0]][x[1]]; }); }
    var esquinas = libres(zona(R, C, t, "cuadrado")).length - libres(z).length;
    if (ok) {
      msg = "La zona de (" + t.join(", ") + ") tiene " + z.length + " casillas, con la cuenta en línea recta.";
    } else {
      if (sobran.length > 0) {
        partes.push("Sobra " + sobran.map(function (x) { return cuentaCasilla(t, x[0], x[1]); }).join("; ") + ".");
        if (sobran.length === esquinas && faltan.length === 0) {
          partes.push("Así se mide en cuadrado: las esquinas quedan a más de " + t[2] + " en línea recta.");
        }
      }
      if (faltan.length > 0) {
        partes.push("Falta " + faltan.map(function (x) { return cuentaCasilla(t, x[0], x[1]); }).join("; ") + ".");
      }
      msg = partes.join(" ");
    }
    return { ok: ok, msg: msg, faltan: faltan, sobran: sobran };
  }

  function juzgarEntradas(s, elegidas) {
    var pide = {}, esta = {}, partes = [], ok = true, ve = {};
    s.vecinas.forEach(function (v) { ve[nombre([v.r, v.c])] = v; if (v.estado === "entra") { pide[nombre([v.r, v.c])] = true; } });
    elegidas.forEach(function (x) {
      var k = nombre(x), v = ve[k];
      esta[k] = true;
      if (!v) {
        ok = false;
        partes.push(k + " no es vecina de " + nombre([s.r, s.c]) + ": un paso va arriba, abajo o a los lados.");
      } else if (v.estado === "prohibida") {
        ok = false;
        partes.push(k + " está prohibida, y <code>entrar</code> la rechaza.");
      } else if (v.estado === "vista") {
        ok = false;
        partes.push(k + " ya tiene distancia " + v.dist + ". Entró antes, por un camino que no es más largo: si entrara de nuevo, se recorrería dos veces.");
      }
    });
    s.entran.forEach(function (x) {
      if (!esta[nombre(x)]) {
        ok = false;
        partes.push(nombre(x) + " es vecina, se puede pisar y sigue con distancia −1: entra con distancia " + (s.d + 1) + ".");
      }
    });
    if (ok) {
      partes.push(s.entran.length === 0 ?
        "Ninguna vecina entra: todas se salen del tablero, están prohibidas o ya tienen distancia." :
        "Entra" + (s.entran.length > 1 ? "n " : " ") + s.entran.map(nombre).join(" y ") + " con distancia " + (s.d + 1) + ", y queda" + (s.entran.length > 1 ? "n" : "") + " al final de la cola.");
    }
    return { ok: ok, msg: partes.join(" ") };
  }

  /* Variantes con error */
  function arrancarSinRevisar(tablero, tripletas) {
    var p = marcar(tablero, tripletas, "circulo"), R = p.length, C = p[0].length, dist = matriz(R, C, -1), cola = [[0, 0]], DIR = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    dist[0][0] = 0;
    while (cola.length > 0) {
      var u = cola.shift(), i = 0;
      while (i < 4) {
        var a = u[0] + DIR[i][0], b = u[1] + DIR[i][1];
        if (a >= 0 && a < R && b >= 0 && b < C && !p[a][b] && dist[a][b] === -1) { dist[a][b] = dist[u[0]][u[1]] + 1; cola.push([a, b]); }
        i = i + 1;
      }
    }
    return dist[R - 1][C - 1];
  }

  /* Escribe la distancia al sacar: mientras espera, una casilla sigue en -1. */
  function marcandoTarde(tablero, tripletas) {
    var p = marcar(tablero, tripletas, "circulo"), R = p.length, C = p[0].length, dist = matriz(R, C, -1), cola = [], ini = 0, salen = 0, DIR = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    if (!p[0][0]) { cola.push([0, 0, 0]); }
    while (ini < cola.length) {
      var u = cola[ini], i = 0;
      ini = ini + 1;
      dist[u[0]][u[1]] = u[2];
      salen = salen + 1;
      while (i < 4) {
        var a = u[0] + DIR[i][0], b = u[1] + DIR[i][1];
        if (a >= 0 && a < R && b >= 0 && b < C && !p[a][b] && dist[a][b] === -1) { cola.push([a, b, u[2] + 1]); }
        i = i + 1;
      }
    }
    return { respuesta: dist[R - 1][C - 1], salen: salen };
  }

  function vacio(R, C) {
    var t = [], r = 0, f, c;
    while (r < R) { f = ""; c = 0; while (c < C) { f = f + "."; c = c + 1; } t.push(f); r = r + 1; }
    return t;
  }

  var ERRORES = [
    { id: "cuadrado", nombre: "Medir en cuadrado", tablero: TABLERO, tripletas: TRIPLETAS, medida: "cuadrado",
      por: "Toma |dr| &lt;= radio y |dc| &lt;= radio, como si la diagonal contara un paso. Una esquina a (2, 2) queda a más de 2 en línea recta y aun así se marca. Aquí eso cierra el paso." },
    { id: "rombo", nombre: "Medir en rombo", tablero: CIERRES[0].tablero, tripletas: CIERRES[0].tripletas, medida: "rombo",
      por: "Toma |dr| + |dc| &lt;= radio, los pasos en cuatro direcciones. Con radio 1 y radio 2 el rombo y el círculo pintan lo mismo, así que el ejemplo de la corrida da 14 con las dos y no delata el error. Con radio 3 deja libres casillas como (dr, dc) = (2, 2), y este tablero lo muestra." },
    { id: "entrada", nombre: "Empezar sin revisar la entrada", tablero: TABLERO, tripletas: TRIPLETAS.concat([[0, 0, 0]]),
      por: "Escribe <code>dist[0][0] = 0</code> y mete la casilla a la cola sin preguntar. Aquí una tripleta más, <code>(0, 0, 0)</code>, prohíbe la entrada: nadie puede arrancar desde ella y lo correcto es −1. Pasar por <code>entrar</code> deja la cola vacía y la salida en −1." },
    { id: "tarde", nombre: "Marcar tarde en la cola", tablero: TABLERO, tripletas: TRIPLETAS,
      por: "Escribe la distancia al sacar de la cola. Mientras una casilla espera sigue en −1, otra vecina la vuelve a meter, y cada copia mete otras tantas. La respuesta sale igual, pero el trabajo se dispara." }
  ];

  function correrError(x) {
    var r;
    if (x.id === "entrada") { r = { respuesta: arrancarSinRevisar(x.tablero, x.tripletas) }; }
    else if (x.id === "tarde") { r = marcandoTarde(x.tablero, x.tripletas); }
    else { r = { respuesta: recorrido(x.tablero, x.tripletas, x.medida).respuesta }; }
    return r;
  }

  function opcionesCierre(q) {
    var r = bosque(q.tablero, q.tripletas), rombo = recorrido(q.tablero, q.tripletas, "rombo").respuesta, cuad = recorrido(q.tablero, q.tripletas, "cuadrado").respuesta;
    var sinRev = arrancarSinRevisar(q.tablero, q.tripletas), vistos = {}, lista = [], sal = [];
    lista.push({ valor: r, clave: "correcta", razon: r === -1 ? "Es −1: las zonas dejan sin camino a la salida." : "Son " + r + " pasos." });
    lista.push({ valor: rombo, clave: "rombo", razon: "Sale al medir en rombo. Revise las casillas a (2, 2) de una criatura con radio 3: 4 + 4 = 8 <= 9." });
    if (r === -1) {
      lista.push({ valor: sinRev, clave: "entrada", razon: "Sale al arrancar desde la entrada sin revisarla, y aquí la entrada está prohibida." });
    }
    lista.push({ valor: cuad, clave: "cuadrado", razon: "Sale al medir en cuadrado: una casilla a (3, 3) de una criatura con radio 3 queda afuera, porque 9 + 9 = 18 > 9." });
    if (r !== -1) {
      lista.push({ valor: -1, clave: "sinCamino", razon: "Hay camino: las zonas dejan libres la entrada y la salida. Marque cada zona con la cuenta y avance por capas desde E." });
      lista.push({ valor: r + 1, clave: "celdas", razon: "Eso cuenta las casillas del camino, incluida E, en vez de los pasos." });
    } else {
      lista.push({ valor: 0, clave: "cero", razon: "Cero pasos sería si E fuera la misma casilla que S. Aquí hay algo que cierra el paso: marque cada zona con la cuenta y mire si la entrada o la salida quedaron libres." });
    }
    lista.forEach(function (o) {
      if (vistos[o.valor] !== true) { vistos[o.valor] = true; sal.push(o); }
    });
    return sal.slice(0, 4);
  }

  function miniZona(medida, nombreZ) {
    var h = "<div><div class='zona-mini'>", r = 0, c, n = 0;
    while (r < 7) {
      c = 0;
      while (c < 7) {
        if (r === 3 && c === 3) { h = h + "<i class='c'></i>"; n = n + 1; }
        else if (adentro(medida, r - 3, c - 3, 3)) { h = h + "<i class='z'></i>"; n = n + 1; }
        else { h = h + "<i></i>"; }
        c = c + 1;
      }
      r = r + 1;
    }
    return h + "</div><div class='pie-mini'>" + nombreZ + ": " + n + "</div></div>";
  }

  var LLEGAN = recorrido(TABLERO, TRIPLETAS, "circulo").salidas.length, TARDE = marcandoTarde(TABLERO, TRIPLETAS), TARDE_VACIO = marcandoTarde(vacio(10, 10), []);

  var PREGUNTAS = [
    { enun: "Para plantearlo como un grafo, ¿qué son los nodos?", opciones: [
      { t: "Todas las casillas del tablero, también las bloqueadas y las peligrosas.", ok: false,
        por: "Si una casilla prohibida fuera nodo, el recorrido podría pasar por ella. En el ejemplo quedan fuera 14 de las 35 casillas." },
      { t: "Cada casilla que se puede pisar.", ok: true,
        por: "En el ejemplo son 21 nodos. El grafo no se guarda en una lista: los vecinos de una casilla se calculan cuando hacen falta." },
      { t: "Las filas y las columnas.", ok: false,
        por: "Un paso va de una casilla a otra, así que ahí está el nodo. Una fila entera no dice dónde está el caminante." }
    ,
      { t: "Las criaturas.", ok: false,
        por: "Por una criatura nunca se pasa: es un dato para calcular qué casillas quedan prohibidas. Lo que se visita son casillas." }] },
    { enun: "¿Y qué son las aristas?", opciones: [
      { t: "Une dos casillas libres vecinas arriba, abajo o a los lados, y cada una vale un paso.", ok: true,
        por: "Cada casilla tiene hasta cuatro vecinas. Se asume que se camina en esas cuatro direcciones y que todos los pasos valen lo mismo." },
      { t: "Une una criatura con cada casilla de su zona.", ok: false,
        por: "La relación con la criatura sirve para marcar y termina antes de caminar. Una arista representa un paso del caminante." },
      { t: "Une cualquier par de casillas libres.", ok: false,
        por: "Con eso se saltaría de la entrada a la salida en un paso, y un paso solo llega a una casilla vecina." }
    ] },
    { enun: "Todos los pasos valen uno. ¿Qué recorrido da la menor cantidad de pasos?", opciones: [
      { t: "En profundidad, porque llega rápido al otro extremo.", ok: false,
        por: "La profundidad se va por el primer camino que encuentra, y la primera vez que toca una casilla puede ser por una ruta larga." },
      { t: "En amplitud, porque visita por capas: primero todo lo que está a 1 paso, después a 2.", ok: true,
        por: "La primera vez que el recorrido toca una casilla lo hace con el menor número de pasos posible, y esa es la distancia que se escribe." },
      { t: "Cualquiera de los dos, porque ambos visitan las mismas casillas.", ok: false,
        por: "Visitan las mismas casillas en otro orden, y la distancia que se escribe depende del orden. Solo la amplitud llega primero por el camino más corto." }
    ] },
    { enun: "¿Por qué las casillas se marcan antes de recorrer?", opciones: [
      { t: "Porque el peligro va cambiando mientras se camina.", ok: false,
        por: "Es al revés: el peligro depende solo de las tripletas, nunca del camino. Por eso se puede calcular una vez y dejarlo escrito." },
      { t: "Porque preguntar dentro del recorrido da otra respuesta.", ok: false,
        por: "Da la misma respuesta, con más trabajo. Con R = C = 1000, N = 1000 tripletas y radio 5, preguntar al pisar hace hasta 10⁹ consultas, y marcar antes, a lo sumo 121 000." },
      { t: "Porque el peligro no depende del camino, y después saber si una casilla se puede pisar es leer una posición.", ok: true,
        por: "Una casilla peligrosa equivale a una bloqueada. Tras marcar queda un tablero con paredes, y el recorrido es el de siempre. Con R = C = 1000, N = 1000 y radio 5, marcar hace a lo sumo 121 000 consultas y preguntar al pisar llegaría a 10⁹." }
    ] },
    { enun: "La frase <i>en cualquier dirección</i> admite varias lecturas, y aquí se mide en línea recta. ¿Cuál es la condición?",
      apoyo: "<div class='tres-zonas'>" + miniZona("rombo", "rombo") + miniZona("circulo", "línea recta") + miniZona("cuadrado", "cuadrado") + "</div><p class='pie-mini'>Las tres zonas de una criatura con radio 3, con su número de casillas.</p>",
      opciones: [
      { t: "|r - ri| <= radio y |c - ci| <= radio", ok: false,
        por: "Es el cuadrado: da 49 casillas con radio 3. En el ejemplo cierra el paso, y el programa respondería −1 en lugar de 14." },
      { t: "(r - ri)² + (c - ci)² <= radio", ok: false,
        por: "Le falta elevar <code>radio</code>. Con radio 2 dejaría libre la casilla a (2, 0), que está justo a distancia 2: 4 > 2." },
      { t: "(r - ri)² + (c - ci)² <= radio²", ok: true,
        por: "Es la distancia euclidiana, sin raíz y sin decimales porque se comparan los cuadrados. Con radio 3 da 29 casillas." }
    ,
      { t: "|r - ri| + |c - ci| <= radio", ok: false,
        por: "Es el rombo: cuenta pasos en cuatro direcciones, y da 25 casillas con radio 3 contra 29. Con radio 1 y radio 2 pinta lo mismo que la línea recta, así que el ejemplo no delata el error." }] },
    { enun: "Una tripleta deja prohibida la casilla de entrada. ¿Qué tiene que responder el programa?", opciones: [
      { t: "−1: entrar la rechaza, la cola arranca vacía y la salida se queda en −1.", ok: true,
        por: "No hace falta un caso aparte: como <code>dist</code> arranca en −1, el ciclo no corre y se devuelve ese valor." }
    ,
      { t: "Lo mismo que si estuviera libre: la entrada es por donde se arranca.", ok: false,
        por: "Con <code>(0, 0, 0)</code> en el ejemplo, ese programa responde 14 y lo correcto es −1. Por eso el arranque pasa por <code>entrar</code>, igual que cualquier otra casilla." },
      { t: "0, porque la distancia de la entrada es 0.", ok: false,
        por: "El 0 solo se escribe si la casilla se puede pisar. Y lo que se devuelve es la distancia de la salida." }] },
    { enun: "¿En qué momento se escribe la distancia de una casilla?", opciones: [
      { t: "Al sacarla de la cola, cuando le toca su turno.", ok: false,
        por: "Mientras espera sigue en −1, y otra vecina la mete otra vez. En el ejemplo salen " + TARDE.salen + " casillas de la cola en lugar de " + LLEGAN + ", y en un tablero vacío de 10 × 10 salen " + TARDE_VACIO.salen + " en lugar de 100." },
      { t: "Al meterla a la cola.", ok: true,
        por: "Desde ese momento ya no vale −1, así que nadie más la mete, y cada casilla entra una sola vez. De ahí sale el costo Θ(R · C) del recorrido." },
      { t: "Al final, cuando la cola se vacía.", ok: false,
        por: "El recorrido necesita <code>dist</code> mientras avanza: de ahí sale la distancia de cada vecina y la señal de quién ya entró." }
    ] }
  ];

  return { TABLERO: TABLERO, TRIPLETAS: TRIPLETAS, codigo: CODIGO, CIERRES: CIERRES, ERRORES: ERRORES, PREGUNTAS: PREGUNTAS,
           zona: zona, marcar: marcar, recorrido: recorrido, bosque: bosque, camino: camino, cuentaCasilla: cuentaCasilla,
           yaProhibidas: yaProhibidas, juzgarZona: juzgarZona, juzgarEntradas: juzgarEntradas, arrancarSinRevisar: arrancarSinRevisar, marcandoTarde: marcandoTarde,
           vacio: vacio, correrError: correrError, opcionesCierre: opcionesCierre, nombre: nombre };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, T = E.TABLERO, TR = E.TRIPLETAS;
    function el(id) { return document.getElementById(id); }
    var marcarLineas = PLANTEO.codigo("panel-codigo", E.codigo);

    /* El tablero; celda(r, c) devuelve {clase, texto}. */
    function tableroHTML(tablero, celda) {
      var R = tablero.length, C = tablero[0].length, h = "<div class='tablero' style='grid-template-columns:1.1rem repeat(" + C + ",minmax(0,1fr))'><div></div>", r = 0, c;
      c = 0;
      while (c < C) { h = h + "<div class='rot'>" + c + "</div>"; c = c + 1; }
      while (r < R) {
        h = h + "<div class='rot'>" + r + "</div>";
        c = 0;
        while (c < C) {
          var s = celda(r, c);
          h = h + "<button type='button' class='cas " + (s.clase || "") + "' data-r='" + r + "' data-c='" + c + "' aria-label='casilla " + r + ", " + c + "'>" + (s.texto === undefined ? "" : s.texto) + "</button>";
          c = c + 1;
        }
        r = r + 1;
      }
      return h + "</div>";
    }
    function criaturaEn(tris, r, c) {
      var i = 0, l = null;
      while (i < tris.length) { if (tris[i][0] === r && tris[i][1] === c) { l = tris[i][2]; } i = i + 1; }
      return l;
    }
    /* Lo que se ve en crudo: bloqueadas, criaturas, entrada y salida. */
    function base(tablero, tris, r, c) {
      var R = tablero.length, C = tablero[0].length, l = criaturaEn(tris, r, c), s = {};
      if (tablero[r].charAt(c) === "#") { s.clase = "roca"; }
      else if (l !== null) { s.clase = "criatura"; s.texto = l; }
      else if (r === 0 && c === 0) { s.clase = "extremo"; s.texto = "E"; }
      else if (r === R - 1 && c === C - 1) { s.clase = "extremo"; s.texto = "S"; }
      return s;
    }
    function alTocar(id, fn) {
      el(id).addEventListener("click", function (ev) {
        var b = ev.target.closest ? ev.target.closest(".cas") : null;
        if (b) { fn(parseInt(b.getAttribute("data-r"), 10), parseInt(b.getAttribute("data-c"), 10)); }
      });
    }

    el("p-tablero").innerHTML = tableroHTML(T, function (r, c) { var s = base(T, TR, r, c); s.clase = (s.clase || "") + " quieta"; return s; });

    /* Marcar: una tripleta a la vez */
    var n = 0, elegidas = [];
    function tiene(lista, r, c) { return lista.some(function (x) { return x[0] === r && x[1] === c; }); }
    function pintarMarcar() {
      var hecho = n >= TR.length, ya = hecho ? E.marcar(T, TR, "circulo") : E.yaProhibidas(T, TR, n);
      el("m-tablero").innerHTML = tableroHTML(T, function (r, c) {
        var s = base(T, TR, r, c);
        if (s.clase !== "roca" && (ya[r][c] || tiene(elegidas, r, c))) {
          s.clase = s.clase === "criatura" ? "criatura" : "prohibida";
          if (s.clase === "prohibida") { s.texto = ""; }
        }
        if (hecho) { s.clase = (s.clase || "") + " quieta"; }
        return s;
      });
      if (hecho) {
        el("m-instruccion").innerHTML = "Tablero marcado. Quedan 14 casillas prohibidas contando las bloqueadas, y 21 que se pueden pisar.";
        el("m-comprobar").classList.add("oculto");
        el("m-ayuda").classList.add("oculto");
        el("m-calculo").classList.add("oculto");
        el("r-bloque").classList.remove("oculto");
        el("r-lugar").appendChild(el("panel-codigo"));
        pintarRecorrido();
      } else {
        el("m-instruccion").innerHTML = "Tripleta <code>(" + TR[n].join(", ") + ")</code>. Toque las casillas con <code>(r - " + TR[n][0] + ")² + (c - " + TR[n][1] + ")² &lt;= " + (TR[n][2] * TR[n][2]) +
          "</code>. La casilla de la criatura ya cuenta, y tocar otra vez quita la marca.";
        el("m-comprobar").classList.remove("oculto");
        el("m-ayuda").classList.remove("oculto");
        el("m-calculo").classList.remove("oculto");
        el("m-lugar").appendChild(el("panel-codigo"));
        marcarLineas([1, 2, 3, 4, 5]);
      }
    }
    alTocar("m-tablero", function (r, c) {
      if (n < TR.length) {
        var ya = E.yaProhibidas(T, TR, n);
        if (ya[r][c]) {
          el("m-calculo").textContent = "(" + r + ", " + c + ") ya estaba prohibida.";
        } else {
          if (tiene(elegidas, r, c)) { elegidas = elegidas.filter(function (x) { return !(x[0] === r && x[1] === c); }); } else { elegidas.push([r, c]); }
          el("m-calculo").textContent = E.cuentaCasilla(TR[n], r, c);
          pintarMarcar();
        }
      }
    });
    function comprobarZona() {
      var res = E.juzgarZona(T, TR, n, elegidas);
      PLANTEO.decir("m-veredicto", res.ok, res.msg);
      if (res.ok) {
        n = n + 1;
        elegidas = [];
        el("m-calculo").textContent = "Toque una casilla y aquí aparece su cuenta.";
        pintarMarcar();
      }
    }
    el("m-comprobar").addEventListener("click", comprobarZona);
    el("m-ayuda").addEventListener("click", function () {
      var ya = E.yaProhibidas(T, TR, n);
      elegidas = E.zona(T.length, T[0].length, TR[n], "circulo").filter(function (x) { return !ya[x[0]][x[1]]; });
      comprobarZona();
    });
    el("m-reinicio").addEventListener("click", function () {
      n = 0; elegidas = []; PLANTEO.decir("m-veredicto", true, ""); el("r-bloque").classList.add("oculto"); pintarMarcar();
    });

    /* El recorrido */
    var REC = E.recorrido(T, TR, "circulo"), SAL = REC.salidas, k = 0, sel = [];
    function pintarRecorrido() {
      var hecho = k >= SAL.length, s = hecho ? null : SAL[k], est = hecho ? { dist: REC.dist, cola: [] } : s.antes, cam = hecho ? E.camino(REC.dist) : [];
      el("r-tablero").innerHTML = tableroHTML(T, function (r, c) {
        var o = base(T, TR, r, c), d = est.dist[r][c];
        if (REC.prohibida[r][c] && o.clase !== "roca" && o.clase !== "criatura") { o.clase = "prohibida"; o.texto = ""; }
        if (d !== -1) {
          o.texto = d;
          o.clase = est.cola.some(function (x) { return x[0] === r && x[1] === c; }) ? "en-cola" : "vista";
        }
        if (s && s.r === r && s.c === c) { o.clase = "frente"; }
        if (tiene(sel, r, c)) { o.clase = "elegida"; o.texto = ""; }
        if (tiene(cam, r, c)) { o.clase = "camino"; }
        if (hecho) { o.clase = (o.clase || "") + " quieta"; }
        return o;
      });
      el("r-cola").innerHTML = est.cola.length === 0 ? "<span class='nota' style='margin:0'>vacía</span>" :
        est.cola.map(function (x) { return "<span class='ficha'>" + x[0] + "," + x[1] + "</span>"; }).join("");
      if (hecho) {
        el("r-instruccion").innerHTML = "La cola quedó vacía: <code>return dist[R - 1][C - 1]</code>.";
        el("r-decision").classList.add("oculto");
        el("r-ayuda").classList.add("oculto");
        el("r-fin").classList.add("oculto");
        el("r-cierre").classList.add("visible");
        el("r-cierre").innerHTML = "La respuesta es <b>" + REC.respuesta + "</b> pasos, y en verde queda uno de los caminos de esa longitud. Salieron " + SAL.length +
          " casillas de la cola: la (4, 3) se puede pisar, pero nadie llega a ella. Cada casilla entró una vez y miró cuatro vecinas: Θ(<i>R</i> · <i>C</i>) para recorrer, además de <i>O</i>(<i>N</i> · <i>R</i> · <i>C</i>) para marcar.";
        marcarLineas([19]);
      } else {
        el("r-instruccion").innerHTML = "Sale <code>" + E.nombre([s.r, s.c]) + "</code>, con distancia " + s.d + ". Toque las vecinas que entran a la cola y confirme; si no entra ninguna, confirme sin tocar nada.";
        el("r-decision").classList.remove("oculto");
        el("r-ayuda").classList.remove("oculto");
        el("r-fin").classList.remove("oculto");
        el("r-cierre").classList.remove("visible");
        el("r-confirmar").textContent = sel.length === 0 ? "Confirmar: no entra ninguna" : "Confirmar: entran " + sel.length;
        marcarLineas([13, 14, 15, 16, 17, 18]);
      }
    }
    alTocar("r-tablero", function (r, c) {
      if (k < SAL.length) {
        if (tiene(sel, r, c)) { sel = sel.filter(function (x) { return !(x[0] === r && x[1] === c); }); }
        else if (!(SAL[k].r === r && SAL[k].c === c)) { sel.push([r, c]); }
        pintarRecorrido();
      }
    });
    function confirmar() {
      var res = E.juzgarEntradas(SAL[k], sel);
      PLANTEO.decir("r-veredicto", res.ok, res.msg);
      if (res.ok) { k = k + 1; sel = []; }
      pintarRecorrido();
    }
    el("r-confirmar").addEventListener("click", confirmar);
    el("r-ayuda").addEventListener("click", function () { sel = SAL[k].entran.slice(); confirmar(); });
    el("r-fin").addEventListener("click", function () { k = SAL.length; sel = []; PLANTEO.decir("r-veredicto", true, ""); pintarRecorrido(); });
    el("r-reinicio").addEventListener("click", function () { k = 0; sel = []; PLANTEO.decir("r-veredicto", true, ""); pintarRecorrido(); });

    /* Los errores */
    PLANTEO.botones("errores", E.ERRORES.map(function (x) { return x.nombre; }), function (i) {
      var x = E.ERRORES[i], r = E.correrError(x), bien = E.recorrido(x.tablero, x.tripletas, "circulo"), med = x.medida || "circulo", p = E.marcar(x.tablero, x.tripletas, med);
      var pie = x.id === "tarde" ?
        "<p>Responde <b>" + r.respuesta + "</b>, igual que lo correcto, pero salen <b>" + r.salen + "</b> casillas de la cola en lugar de " + bien.salidas.length + ". En un tablero vacío de 10 × 10 salen " + E.marcandoTarde(E.vacio(10, 10), []).salen + " en lugar de 100.</p>" :
        "<p>Responde <b>" + r.respuesta + "</b>, y lo correcto es <b>" + bien.respuesta + "</b>.</p>";
      el("error-panel").innerHTML = pie + tableroHTML(x.tablero, function (a, b) {
        var o = base(x.tablero, x.tripletas, a, b);
        if (p[a][b] && o.clase !== "roca" && o.clase !== "criatura") { o.clase = "prohibida"; o.texto = ""; }
        o.clase = (o.clase || "") + " quieta";
        return o;
      }) + "<p>" + x.por + "</p>";
    })(0);

    /* El tablero sin ayuda */
    var cierre = 0, propias = [], verSol = false, opcionesDeCierre = null;
    function pintarCierre() {
      var q = E.CIERRES[cierre], rec = E.recorrido(q.tablero, q.tripletas, "circulo"), cam = E.camino(rec.dist);
      el("cierre-datos").innerHTML = "Tripletas: <code>" + q.tripletas.map(function (x) { return "(" + x.join(", ") + ")"; }).join(", ") + "</code>";
      el("cierre-tablero").innerHTML = tableroHTML(q.tablero, function (r, c) {
        var o = base(q.tablero, q.tripletas, r, c);
        if (verSol) {
          if (rec.prohibida[r][c] && o.clase !== "roca" && o.clase !== "criatura") { o.clase = "prohibida"; o.texto = ""; }
          if (rec.dist[r][c] !== -1) { o.clase = tiene(cam, r, c) ? "camino" : "vista"; o.texto = rec.dist[r][c]; }
          o.clase = (o.clase || "") + " quieta";
        } else if (tiene(propias, r, c) && o.clase !== "roca" && o.clase !== "criatura") {
          o.clase = "prohibida"; o.texto = "";
        }
        return o;
      });
    }
    PLANTEO.botones("cierres", E.CIERRES.map(function (x) { return x.nombre; }), function (i) {
      cierre = i; propias = []; verSol = false;
      PLANTEO.decir("cierre-veredicto", true, "");
      pintarCierre();
      if (opcionesDeCierre !== null) { opcionesDeCierre.refrescar(); }
    })(0);
    opcionesDeCierre = Motor.opcionesNumericas("opciones-cierre", "cierre-veredicto", function () {
      return E.opcionesCierre(E.CIERRES[cierre]);
    });
    alTocar("cierre-tablero", function (r, c) {
      if (!verSol) {
        if (tiene(propias, r, c)) { propias = propias.filter(function (x) { return !(x[0] === r && x[1] === c); }); } else { propias.push([r, c]); }
        pintarCierre();
      }
    });
    el("cierre-solucion").addEventListener("click", function () {
      var q = E.CIERRES[cierre];
      verSol = true;
      pintarCierre();
      var r = E.bosque(q.tablero, q.tripletas);
      PLANTEO.decir("cierre-veredicto", true, r === -1 ?
        "La respuesta es −1: ningún camino llega a S. Si E quedó libre, los números muestran hasta dónde se alcanza a llegar." :
        "La respuesta es " + r + ". Cada número es la distancia desde E, y en verde va uno de los caminos de esa longitud.");
    });

    /* Las partes */
    var abrir = PLANTEO.partes("abrir-partes", ["parte-2", "parte-3", "parte-4"]);
    PLANTEO.preguntas("preguntas", E.PREGUNTAS, abrir);
    pintarRecorrido();
    pintarMarcar();
  })();
}
