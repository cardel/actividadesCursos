/* Ejercicio interactivo: el valor mas frecuente de un rango.
   UVa 11235. La secuencia llega ordenada, se parte en corridas de valores
   iguales y el arbol de maximos se levanta sobre los largos de esas corridas,
   no sobre la secuencia. Lo que el arbol no sabe contestar son los dos
   extremos del rango, que parten una corrida y se cuentan aparte.
   La compresion corre con el codigo de uva11235.py, linea por linea. */
var SEG = (typeof module !== "undefined") ? require("./lib.js") : SEG;

var EJERCICIO = (function () {
  var MENOS_INF = -Infinity;

  /* Doce posiciones, cinco corridas de largos 3, 1, 5, 2 y 1. */
  var A = [-4, -4, -4, 0, 2, 2, 2, 2, 2, 7, 7, 9];
  var N = A.length;

  /* La misma cantidad de cada valor, en otro orden: sirve para ver qué pasa
     cuando la entrada no llega ordenada. */
  var DESORDENADA = [2, -4, 7, 2, -4, 2, 9, 2, 7, -4, 2, 0];

  var CONSULTAS = [
    { i: 8, j: 9 },
    { i: 3, j: 5 },
    { i: 6, j: 11 },
    { i: 2, j: 11 }
  ];

  /* ---------------- comprimir ---------------- */

  function comprimir(a) {
    var n = a.length, id = SEG.ceros(n), ini = [], fin = [], len = [];
    var inicio = 0, i, k, corrida;
    for (i = 1; i <= n; i = i + 1) {
      if (i === n || a[i] !== a[inicio]) {
        corrida = len.length;
        ini.push(inicio);
        fin.push(i - 1);
        len.push(i - inicio);
        for (k = inicio; k < i; k = k + 1) { id[k] = corrida; }
        inicio = i;
      }
    }
    return { id: id, ini: ini, fin: fin, len: len };
  }

  var R = comprimir(A);
  var C = R.len.length;
  var MAYOR = Math.max.apply(null, R.len);

  var CODIGO_COMPRIMIR = [
    { num: 33, txt: "def comprimir(a, n):", bloque: 1 },
    { num: 37, txt: "    run_id = [0] * n", bloque: 1 },
    { num: 38, txt: "    run_ini = []", bloque: 1 },
    { num: 39, txt: "    run_fin = []", bloque: 1 },
    { num: 40, txt: "    run_len = []", bloque: 1 },
    { num: 41, txt: "    inicio = 0", bloque: 1 },
    { num: 42, txt: "    for i in range(1, n + 1):", bloque: 1 },
    { num: 43, txt: "        if i == n or a[i] != a[inicio]:", bloque: 1 },
    { num: 44, txt: "            corrida = len(run_len)", bloque: 1 },
    { num: 45, txt: "            run_ini.append(inicio)", bloque: 1 },
    { num: 46, txt: "            run_fin.append(i - 1)", bloque: 1 },
    { num: 47, txt: "            run_len.append(i - inicio)", bloque: 1 },
    { num: 48, txt: "            for k in range(inicio, i):", bloque: 1 },
    { num: 49, txt: "                run_id[k] = corrida", bloque: 1 },
    { num: 50, txt: "            inicio = i", bloque: 1 },
    { num: 51, txt: "    return run_id, run_ini, run_fin, run_len", bloque: 1 }
  ];

  /* Los pasos del panel: cada foto guarda la linea y el estado de las cuatro
     listas, con la marca de qué posiciones ya recibieron su corrida. */
  function simComprimir(a) {
    var n = a.length, id = SEG.ceros(n), escrito = [], ini = [], fin = [], len = [];
    var inicio = 0, corrida = null, pasos = [], i, k;
    for (i = 0; i < n; i = i + 1) { escrito.push(false); }

    function foto(linea, i) {
      pasos.push({
        linea: linea,
        i: i === undefined ? "–" : i,
        inicio: inicio,
        corrida: corrida === null ? "–" : corrida,
        largos: "[" + len.join(", ") + "]",
        id: id.slice(), escrito: escrito.slice(),
        ini: ini.slice(), fin: fin.slice(), len: len.slice()
      });
    }

    foto(37); foto(38); foto(39); foto(40); foto(41);
    for (i = 1; i <= n; i = i + 1) {
      foto(42, i);
      foto(43, i);
      if (i === n || a[i] !== a[inicio]) {
        corrida = len.length;
        foto(44, i);
        ini.push(inicio);
        foto(45, i);
        fin.push(i - 1);
        foto(46, i);
        len.push(i - inicio);
        foto(47, i);
        for (k = inicio; k < i; k = k + 1) {
          foto(48, i);
          id[k] = corrida;
          escrito[k] = true;
          foto(49, i);
        }
        foto(48, i);
        inicio = i;
        foto(50, i);
      }
    }
    foto(51);
    return pasos;
  }

  /* ---------------- el arbol de maximos ---------------- */

  function buildMaxRec(tree, largos, v, l, r) {
    var m;
    if (l === r) {
      tree[v] = largos[l];
    } else {
      m = Math.floor((l + r) / 2);
      buildMaxRec(tree, largos, 2 * v + 1, l, m);
      buildMaxRec(tree, largos, 2 * (v + 1), m + 1, r);
      tree[v] = Math.max(tree[2 * v + 1], tree[2 * (v + 1)]);
    }
  }

  function buildMax(largos) {
    var tree = [], i;
    for (i = 0; i < 4 * largos.length; i = i + 1) { tree.push(MENOS_INF); }
    buildMaxRec(tree, largos, 0, 0, largos.length - 1);
    return tree;
  }

  var TREE = buildMax(R.len);

  function queryMaxRec(v, l, r, ql, qr) {
    var res, m;
    if (qr < l || r < ql) {
      res = MENOS_INF;
    } else if (ql <= l && r <= qr) {
      res = TREE[v];
    } else {
      m = Math.floor((l + r) / 2);
      res = Math.max(queryMaxRec(2 * v + 1, l, m, ql, qr),
                     queryMaxRec(2 * (v + 1), m + 1, r, ql, qr));
    }
    return res;
  }

  function queryMax(ql, qr) { return queryMaxRec(0, 0, C - 1, ql, qr); }

  /* Los tres casos de cada vertice en una consulta al arbol de corridas, para
     pintarlo: azul el que se abre, verde el que devuelve su valor, ambar el
     que se descarta con el neutro. */
  function casosQuery(ql, qr) {
    var estados = {}, aportes = [];
    function rec(v, l, r) {
      var m;
      if (qr < l || r < ql) {
        estados[v] = "disjunto";
      } else if (ql <= l && r <= qr) {
        estados[v] = "contenido";
        aportes.push({ v: v, valor: TREE[v] });
      } else {
        estados[v] = "solapado";
        m = Math.floor((l + r) / 2);
        rec(2 * v + 1, l, m);
        rec(2 * (v + 1), m + 1, r);
      }
    }
    rec(0, 0, C - 1);
    return { estados: estados, aportes: aportes };
  }

  /* ---------------- resolver una consulta ---------------- */

  /* Cuántas posiciones de la corrida c entran en el rango [izq, der]. */
  function pedazoDe(c, izq, der) {
    var a = Math.max(R.ini[c], izq), b = Math.min(R.fin[c], der);
    return b < a ? 0 : b - a + 1;
  }

  function resolverUna(qi, qj) {
    var izq = qi - 1, der = qj - 1;
    var ri = R.id[izq], rd = R.id[der];
    var d = { qi: qi, qj: qj, izq: izq, der: der, ri: ri, rd: rd, misma: ri === rd };
    if (d.misma) {
      d.respuesta = der - izq + 1;
      d.parteIzq = d.respuesta;
      d.parteDer = d.respuesta;
      d.hayMedio = false;
      d.medio = MENOS_INF;
    } else {
      d.parteIzq = R.fin[ri] - izq + 1;
      d.parteDer = der - R.ini[rd] + 1;
      d.hayMedio = ri + 1 <= rd - 1;
      d.medio = d.hayMedio ? queryMax(ri + 1, rd - 1) : MENOS_INF;
      d.respuesta = Math.max(d.parteIzq, d.parteDer, d.medio);
    }
    /* lo que devolvería el árbol si se le preguntara por las corridas de los
       dos extremos, que es el error que el enunciado premia con WA */
    d.conExtremos = queryMax(ri, rd);
    d.pedazoMayor = pedazoDe(R.len.indexOf(MAYOR), izq, der);
    return d;
  }

  var PASOS = CONSULTAS.map(function (q) { return resolverUna(q.i, q.j); });

  function respuestas() {
    return PASOS.map(function (p) { return p.respuesta; });
  }

  function texto(q) { return q.i + " " + q.j; }

  /* La frecuencia de verdad, contando el rango posición por posición. Sirve
     para comprobar la respuesta y para ver qué pasa con la entrada sin
     ordenar, donde el método de corridas se equivoca. */
  function frecuenciaReal(a, izq, der) {
    var cuenta = {}, mejor = 0, i, v;
    for (i = izq; i <= der; i = i + 1) {
      v = String(a[i]);
      cuenta[v] = (cuenta[v] || 0) + 1;
      if (cuenta[v] > mejor) { mejor = cuenta[v]; }
    }
    return mejor;
  }

  /* ---------------- las opciones de cada consulta ---------------- */

  function opcionesRespuesta(k) {
    var p = PASOS[k], lista = [];
    var corridas = p.rd - p.ri + 1;

    lista.push({
      valor: p.respuesta, clave: "correcta",
      razon: p.misma
        ? "Correcto: las posiciones " + p.qi + " y " + p.qj + " caen en la misma corrida, la " +
          p.ri + ", así que todo el rango tiene un solo valor y la respuesta es su largo, " +
          p.qj + " − " + p.qi + " + 1."
        : "Correcto: de la corrida " + p.ri + " alcanzan " + p.parteIzq + " posiciones, de la " +
          p.rd + " entran " + p.parteDer + ", y el medio " +
          (p.hayMedio ? "aporta " + p.medio + ". Gana " + p.respuesta + "."
                      : "está vacío, así que se va con el neutro y pierde. Gana " + p.respuesta + ".")
    });

    lista.push({
      valor: p.conExtremos, clave: "con-extremos",
      razon: "Eso devuelve el árbol si se le pregunta por las corridas " + p.ri + " a " + p.rd +
        ", las de los dos extremos. El rango no toma esas dos completas: de la " + p.ri +
        " entran " + p.parteIzq + " de sus " + R.len[p.ri] + " posiciones y de la " + p.rd + ", " +
        p.parteDer + " de " + R.len[p.rd] + ". Al árbol solo van las corridas de en medio."
    });

    if (!p.misma) {
      lista.push({
        valor: Math.max(p.parteIzq, p.parteDer), clave: "sin-medio",
        razon: "Son los dos extremos sin mirar el medio. " +
          (p.hayMedio
            ? "Entre las corridas " + p.ri + " y " + p.rd + " queda la " + (p.ri + 1) +
              (p.rd - 1 > p.ri + 1 ? " hasta la " + (p.rd - 1) : "") +
              ", y es justo lo que el árbol contesta."
            : "Aquí el medio sí está vacío, pero el número no sale de ahí: revise cuántas " +
              "posiciones aporta cada extremo.")
      });
    }

    lista.push({
      valor: p.der - p.izq + 1, clave: "largo",
      razon: "Ese es el largo del rango, " + (p.der - p.izq + 1) +
        " posiciones. La consulta pide cuántas veces aparece el valor que más se repite, no " +
        "cuántas posiciones hay."
    });

    lista.push({
      valor: corridas, clave: "corridas",
      razon: "Esas son las corridas que el rango toca, de la " + p.ri + " a la " + p.rd +
        ". Cuántos valores distintos hay es otra pregunta."
    });

    lista.push({
      valor: MAYOR, clave: "mayor",
      razon: "La corrida más larga de la secuencia mide " + MAYOR + ", y de ella este rango toma " +
        p.pedazoMayor + " posicion" + (p.pedazoMayor === 1 ? "" : "es") +
        ". El árbol se consulta por un tramo de corridas, no por todo el arreglo."
    });

    return SEG.sinRepetidos(lista);
  }

  /* ---------------- contar lo que cuesta ---------------- */

  /* Un caso con N posiciones, Q consultas y corridas de este largo promedio.
     Recorrer el rango lee sus posiciones; el árbol comprime una vez, se
     construye una vez y después mira unos pocos vértices por consulta. */
  function conteos(e) {
    var n = Math.max(4, Math.min(1000000, Math.round(e.N) || 4));
    var q = Math.max(1, Math.min(200000, Math.round(e.Q) || 1));
    var largo = Math.max(1, Math.min(n, Math.round(e.largo) || 1));
    var c = Math.ceil(n / largo);
    var rango = Math.floor(n / 2);
    var ql = c >= 4 ? Math.floor(c / 4) : 0;
    var qr = c >= 4 ? Math.floor((3 * c) / 4) : c - 1;
    var porConsulta = SEG.vistaQuery(c, ql, qr);
    var recorrido = q * rango;
    var arbol = n + (2 * c - 1) + q * porConsulta;
    return { N: n, Q: q, largo: largo, C: c, rango: rango, porConsulta: porConsulta,
             recorrido: recorrido, arbol: arbol,
             veces: Math.round((recorrido / arbol) * 10) / 10 };
  }

  /* ---------------- las dos limitaciones con cifras ---------------- */

  /* La entrada sin ordenar: mismos valores, otro orden. Las corridas se
     parten, el árbol crece hasta una hoja por posición y la respuesta que da
     el método no es la de verdad. */
  function sinOrdenar() {
    var S = comprimir(DESORDENADA), n = DESORDENADA.length, peor = null, i;
    var tree = buildMax(S.len);
    function qMax(v, l, r, ql, qr) {
      var res, m;
      if (qr < l || r < ql) { res = MENOS_INF; }
      else if (ql <= l && r <= qr) { res = tree[v]; }
      else {
        m = Math.floor((l + r) / 2);
        res = Math.max(qMax(2 * v + 1, l, m, ql, qr), qMax(2 * (v + 1), m + 1, r, ql, qr));
      }
      return res;
    }
    function metodo(izq, der) {
      var ri = S.id[izq], rd = S.id[der], pi, pd, me;
      if (ri === rd) { return der - izq + 1; }
      pi = S.fin[ri] - izq + 1;
      pd = der - S.ini[rd] + 1;
      me = ri + 1 <= rd - 1 ? qMax(0, 0, S.len.length - 1, ri + 1, rd - 1) : MENOS_INF;
      return Math.max(pi, pd, me);
    }
    /* la consulta donde más se separa lo que contesta el método de la
       respuesta de verdad */
    for (i = 0; i < n; i = i + 1) {
      var j;
      for (j = i; j < n; j = j + 1) {
        var real = frecuenciaReal(DESORDENADA, i, j), dio = metodo(i, j);
        if (peor === null || real - dio > peor.real - peor.dio) {
          peor = { izq: i, der: j, real: real, dio: dio };
        }
      }
    }
    return { A: DESORDENADA, C: S.len.length, len: S.len, peor: peor,
             ordenadas: C, vertices: 2 * S.len.length - 1 };
  }

  /* Dos rangos de la secuencia ordenada con la misma suma de valores y
     distinta respuesta: por eso el vértice guarda un máximo y no una suma. */
  function sumaIgual() {
    var rangos = [], i, j, a, b, s, hallado = null;
    for (i = 0; i < N; i = i + 1) {
      s = 0;
      for (j = i; j < N; j = j + 1) {
        s = s + A[j];
        rangos.push({ i: i, j: j, suma: s, r: frecuenciaReal(A, i, j) });
      }
    }
    for (a = 0; a < rangos.length && hallado === null; a = a + 1) {
      for (b = a + 1; b < rangos.length && hallado === null; b = b + 1) {
        if (rangos[a].suma === rangos[b].suma && rangos[a].r !== rangos[b].r) {
          hallado = { uno: rangos[a], otro: rangos[b] };
        }
      }
    }
    return hallado;
  }

  /* ---------------- rondas de opciones ---------------- */

  var RONDAS = [
    {
      titulo: "Para qué sirve que la secuencia llegue ordenada",
      texto: "El enunciado promete que los valores vienen en orden no decreciente. Qué se gana con eso.",
      opciones: [
        { txt: "Que la búsqueda binaria encuentra los extremos del rango, y sin ella no se sabría dónde empieza cada consulta.",
          fb: "Los extremos llegan en la consulta, no hay que buscarlos. Lo que da el orden es que los valores iguales queden contiguos." },
        { txt: "Que el valor más frecuente es siempre el del medio del rango, y basta mirarlo ahí.",
          fb: "No: en el rango 1 a 4 el del medio es el −4 y la corrida más larga es la de los 2, que no lo toca." },
        { txt: "Que las posiciones de un mismo valor quedan pegadas, así que un valor es un tramo y basta su largo.", ok: true,
          fb: "Eso es. Sin esa promesa un valor puede aparecer en posiciones sueltas y un solo número por corrida ya no lo describe." },
        { txt: "Que el árbol queda balanceado, y con la secuencia desordenada quedaría torcido.",
          fb: "El árbol se parte siempre por la mitad del tramo de corridas, ordenado o no. El orden cambia cuántas corridas hay, no la forma del árbol." }
      ]
    },
    {
      titulo: "Qué guarda cada vértice",
      texto: "El árbol se levanta sobre el vector de largos. Qué tiene que guardar un vértice para que la consulta funcione.",
      opciones: [
        { txt: "El largo mayor de las corridas de su tramo.", ok: true,
          fb: "Eso es: la respuesta de un rango de corridas completas es la más larga de ellas. El neutro del máximo es −∞, así que un vértice disjunto pierde cualquier comparación." },
        { txt: "La suma de los largos de su tramo, que son las posiciones que abarca.",
          fb: "Esa suma dice cuántas posiciones hay, no cuántas veces se repite el más frecuente. La página muestra dos rangos con la misma suma y respuestas distintas." },
        { txt: "Cuántas corridas tiene su tramo, que es lo que decide si la consulta baja.",
          fb: "Contar corridas dice cuántos valores distintos hay. La pregunta es por el más repetido." },
        { txt: "El valor de la secuencia que más se repite en su tramo, no su largo.",
          fb: "Guardar el valor no alcanza: al unir dos vértices hay que comparar cuántas veces aparece cada uno, y eso es el largo." }
      ]
    },
    {
      titulo: "Por qué los extremos no van al árbol",
      texto: "La consulta 6 11 empieza dentro de la corrida de los 2 y termina dentro de la de los 7. Por qué esas dos corridas se cuentan aparte.",
      opciones: [
        { txt: "Porque son las corridas donde caen i y j, y el árbol no acepta consultas que empiecen en una hoja.",
          fb: "El árbol acepta cualquier tramo de corridas, hojas incluidas. El problema es que esas dos entran partidas." },
        { txt: "Porque las corridas de los extremos pueden ser las más largas y taparían a las del medio.",
          fb: "Ser la más larga no es el problema: si entrara completa, su largo sería la respuesta. El problema es que entra a medias." },
        { txt: "Porque hay que restarles uno, ya que las consultas llegan numeradas desde 1.",
          fb: "El uno se resta a las dos posiciones al entrar, y eso es aparte. Aun con los índices bien, las dos corridas de los bordes entran partidas." },
        { txt: "Porque el rango se queda con una parte de cada una, y el árbol sabe el largo completo.", ok: true,
          fb: "Eso es: el árbol diría 5 por la corrida de los 2, y de esas 5 posiciones el rango toma 4." }
      ]
    },
    {
      titulo: "Cuándo no se toca el árbol",
      texto: "Dos de las cuatro consultas de arriba se contestan sin preguntarle nada al árbol. Qué tienen en común.",
      opciones: [
        { txt: "Que el rango es corto, y con pocas posiciones el recorrido directo sale más barato.",
          fb: "6 11 tiene seis posiciones y 2 11 diez: la diferencia no es el largo del rango sino cuántas corridas completas quedan en el medio." },
        { txt: "Que entre la corrida de i y la de j no queda ninguna completa: o son la misma, o son vecinas.", ok: true,
          fb: "Eso es. En 8 9 las dos posiciones caen en la misma corrida y en 6 11 las corridas son vecinas, así que el medio está vacío." },
        { txt: "Que la respuesta es el largo de una corrida completa, y eso ya está en el vector de largos.",
          fb: "En 6 11 la respuesta es 4 y no es el largo de ninguna corrida: sale de contar el pedazo que entró." },
        { txt: "Que los dos extremos caen en corridas de largo 1.",
          fb: "La corrida de los 2 mide 5 y la de los 7 mide 2. Lo que decide es si queda algo entre las dos." }
      ]
    },
    {
      titulo: "Un caso con todos los valores distintos",
      texto: "Llega un caso de 200 000 posiciones estrictamente creciente, con 200 000 consultas. Qué conviene.",
      opciones: [
        { txt: "Armar el árbol igual, que con 200 000 corridas sigue costando logaritmo por consulta.",
          fb: "Funciona y cuesta lo de siempre, pero es el caso donde la estructura no compra nada: todas las corridas miden 1." },
        { txt: "Recorrer cada rango contando, que con todos los valores distintos el recorrido se corta temprano.",
          fb: "No se corta: contar un rango de 100 000 posiciones son 100 000 lecturas, y por 200 000 consultas son 2 × 10¹⁰." },
        { txt: "Contestar 1 a toda consulta: sin valores repetidos ninguna frecuencia pasa de 1.", ok: true,
          fb: "Eso es, y es lo que el método hace solo: hay 200 000 corridas de largo 1 y cualquier máximo de largos vale 1." },
        { txt: "No se puede responder: el método de corridas necesita que haya valores repetidos.",
          fb: "Una corrida de largo 1 es una corrida. El método responde bien, lo que pasa es que siempre responde 1." }
      ]
    }
  ];

  return { A: A, N: N, R: R, C: C, MAYOR: MAYOR, TREE: TREE, CONSULTAS: CONSULTAS,
           PASOS: PASOS, RONDAS: RONDAS, CODIGO_COMPRIMIR: CODIGO_COMPRIMIR,
           comprimir: comprimir, simComprimir: simComprimir, buildMax: buildMax,
           queryMax: queryMax, casosQuery: casosQuery, resolverUna: resolverUna,
           respuestas: respuestas, texto: texto, frecuenciaReal: frecuenciaReal,
           opcionesRespuesta: opcionesRespuesta, conteos: conteos,
           sinOrdenar: sinOrdenar, sumaIgual: sumaIgual, pedazoDe: pedazoDe };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO;
    var estado = { N: 200000, Q: 200000, largo: 20 };
    function el(id) { return document.getElementById(id); }

    /* ---------- la secuencia y sus corridas ---------- */

    function tiraCorridas(caja, marca) {
      var h = "<div class='arreglo fila-arreglo'>";
      E.A.forEach(function (x, i) {
        var cl = "caja";
        if (marca && marca.dentro && marca.dentro(i)) { cl = cl + " visitada"; }
        if (marca && marca.foco && marca.foco(i)) { cl = cl + " actual"; }
        h = h + "<div class='" + cl + "'><span class='indice'>" + (i + 1) + "</span>" + x + "</div>";
      });
      caja.innerHTML = h + "</div>";
    }

    function corridasEnPalabras() {
      var h = "";
      E.R.len.forEach(function (L, c) {
        h = h + "<span class='par'>corrida " + c + ": valor " + E.A[E.R.ini[c]] +
          ", posiciones " + (E.R.ini[c] + 1) + " a " + (E.R.fin[c] + 1) +
          ", largo <b>" + L + "</b></span> ";
      });
      el("ver-corridas").innerHTML = h;
      el("ver-largos").textContent = "[" + E.R.len.join(", ") + "]";
      el("ver-c").textContent = E.C;
    }

    /* ---------- el panel de comprimir ---------- */

    function pintarComprimir(e) {
      var p = e.actual;
      var escrito = p ? p.escrito : null;
      tiraCorridas(el("ver-arreglo-paso"), {
        dentro: function (i) { return escrito ? escrito[i] : false; },
        foco: function (i) { return p && p.i !== "–" && i === p.i; }
      });
      el("ver-ini").textContent = p ? "[" + p.ini.join(", ") + "]" : "[]";
      el("ver-fin").textContent = p ? "[" + p.fin.join(", ") + "]" : "[]";
      el("ver-len").textContent = p ? "[" + p.len.join(", ") + "]" : "[]";
      el("ver-id").textContent = p
        ? "[" + p.id.map(function (c, i) { return p.escrito[i] ? c : "·"; }).join(", ") + "]"
        : "";
      el("ver-cuantas").textContent = p ? p.len.length : 0;
    }

    /* ---------- el arbol de maximos ---------- */

    function arbolBase(caja, ql, qr) {
      var casos = (ql === undefined) ? null : E.casosQuery(ql, qr);
      var fuera = casos ? SEG.estadoDeVertices(E.C, casos.estados) : null;
      var dio = {};
      if (casos) { casos.aportes.forEach(function (x) { dio[x.v] = x.valor; }); }
      caja.innerHTML = SEG.dibujar({
        N: E.C, maxAncho: 620, conNotas: true,
        estado: function (v) { return fuera ? fuera[v] : "neutro"; },
        valor: function (v) { return E.TREE[v] === -Infinity ? "−∞" : E.TREE[v]; },
        nota: function (v) { return dio[v] === undefined ? "" : "aporta " + dio[v]; }
      });
    }

    /* ---------- una carta por consulta ---------- */

    function cartaConsulta(p, k) {
      var caja = el("consultas-cartas");
      var carta = document.createElement("div");
      carta.className = "carta";

      var h2 = document.createElement("h2");
      h2.textContent = (k + 5) + ". La consulta " + E.texto({ i: p.qi, j: p.qj });
      carta.appendChild(h2);

      var tira = document.createElement("div");
      tiraCorridas(tira, { dentro: function (i) { return p.izq <= i && i <= p.der; } });
      carta.appendChild(tira);

      var nota = document.createElement("p");
      nota.className = "nota";
      nota.innerHTML = "Las posiciones llegan numeradas desde 1, así que el código trabaja con " +
        p.izq + " y " + p.der + ". La " + p.qi + " cae en la corrida <b>" + p.ri +
        "</b> y la " + p.qj + " en la <b>" + p.rd + "</b>.";
      carta.appendChild(nota);

      var pr = document.createElement("p");
      pr.className = "pregunta";
      pr.textContent = "Cuántas veces aparece el valor más frecuente de ese rango.";
      carta.appendChild(pr);

      var ops = document.createElement("div");
      ops.className = "opciones";
      ops.id = "opciones-q" + k;
      carta.appendChild(ops);

      var ver = document.createElement("div");
      ver.className = "veredicto";
      ver.id = "veredicto-q" + k;
      carta.appendChild(ver);

      var dib = document.createElement("div");
      dib.className = "dibujo";

      var botones = document.createElement("div");
      botones.className = "botones";
      var b = document.createElement("button");
      b.textContent = "Ver las tres partes";
      b.addEventListener("click", function () {
        var tabla = "<table class='cuentas'><tr><th>parte</th><th>de dónde sale</th><th>vale</th></tr>";
        tabla = tabla + "<tr><td>corrida de i</td><td>" +
          (p.misma ? "las dos posiciones caen en la corrida " + p.ri
                   : "posiciones " + (p.izq + 1) + " a " + (E.R.fin[p.ri] + 1)) +
          "</td><td" + (p.respuesta === p.parteIzq ? " class='destaca'" : "") + ">" +
          p.parteIzq + "</td></tr>";
        if (!p.misma) {
          tabla = tabla + "<tr><td>corrida de j</td><td>posiciones " + (E.R.ini[p.rd] + 1) +
            " a " + (p.der + 1) + "</td><td" +
            (p.respuesta === p.parteDer && p.parteDer >= p.parteIzq ? " class='destaca'" : "") +
            ">" + p.parteDer + "</td></tr>";
          tabla = tabla + "<tr><td>el medio</td><td>" +
            (p.hayMedio ? "<code>query(tree, " + (p.ri + 1) + ", " + (p.rd - 1) + ")</code>"
                        : "no queda ninguna corrida entre la " + p.ri + " y la " + p.rd +
                          ", el árbol no se consulta") +
            "</td><td" + (p.hayMedio && p.respuesta === p.medio ? " class='destaca'" : " class='pierde'") +
            ">" + (p.hayMedio ? p.medio : "−∞") + "</td></tr>";
        }
        tabla = tabla + "</table>";
        var cuerpo = "<p class='nota'>La respuesta es el mayor de las tres, <b>" + p.respuesta +
          "</b>.</p>";
        el("partes-q" + k).innerHTML = tabla + cuerpo;
        if (p.hayMedio) { arbolBase(dib, p.ri + 1, p.rd - 1); } else { dib.innerHTML = ""; }
      });
      botones.appendChild(b);
      carta.appendChild(botones);

      var partes = document.createElement("div");
      partes.id = "partes-q" + k;
      carta.appendChild(partes);
      carta.appendChild(dib);

      caja.appendChild(carta);
      Motor.opcionesNumericas("opciones-q" + k, "veredicto-q" + k, function () {
        return E.opcionesRespuesta(k);
      });
    }

    /* ---------- la trampa de los extremos ---------- */

    function trampa() {
      var p = E.PASOS[2];
      el("ver-trampa").innerHTML =
        "Al árbol se le puede preguntar por las corridas " + p.ri + " a " + p.rd +
        ", que son las de los dos extremos, y devuelve <b>" + p.conExtremos +
        "</b>: el largo de la corrida de los " + E.A[E.R.ini[p.ri]] + ". La respuesta es <b>" +
        p.respuesta + "</b>, porque de esas " + E.R.len[p.ri] + " posiciones el rango toma " +
        p.parteIzq + ".";
      arbolBase(el("arbol-trampa"), p.ri, p.rd);
    }

    /* ---------- lo que cuesta ---------- */

    function cuentas() {
      var c = E.conteos(estado);
      el("ver-conteos").innerHTML = "Con <b>" + c.N + "</b> posiciones repartidas en corridas de " +
        c.largo + " en promedio quedan <b>" + c.C + "</b> corridas. Contestar " + c.Q +
        " consultas de " + c.rango + " posiciones recorriendo el rango lee <b>" + c.recorrido +
        "</b> casillas; con el árbol son <b>" + c.arbol + "</b>: " + c.N +
        " de comprimir, " + (2 * c.C - 1) + " de construirlo y " + c.porConsulta +
        " vértices por consulta. " + (c.recorrido >= c.arbol
          ? "El árbol lee <b>" + c.veces + "</b> veces menos."
          : "Aquí el árbol lee <b>" + (Math.round((c.arbol / c.recorrido) * 10) / 10) +
            "</b> veces más: con tan poco que consultar, comprimir y construir no se pagan.");
      el("ver-limite").innerHTML = c.largo === 1
        ? "Con corridas de 1 hay una hoja por posición, el árbol pesa " + (2 * c.C - 1) +
          " vértices y toda consulta responde 1: la estructura cuesta y no decide nada."
        : "Baje el largo promedio a 1, que es la secuencia con todos los valores distintos, y mire " +
          "cuántas corridas quedan.";
    }

    function leer() {
      estado = {
        N: parseInt(el("campo-n").value, 10),
        Q: parseInt(el("campo-q").value, 10),
        largo: parseInt(el("campo-largo").value, 10)
      };
      var c = E.conteos(estado);
      el("campo-n").value = c.N;
      el("campo-q").value = c.Q;
      el("campo-largo").value = c.largo;
      cuentas();
    }

    /* ---------- las dos limitaciones ---------- */

    function limitaciones() {
      var d = E.sinOrdenar(), s = E.sumaIgual();
      var h = "<div class='arreglo fila-arreglo'>";
      d.A.forEach(function (x, i) {
        h = h + "<div class='caja'><span class='indice'>" + (i + 1) + "</span>" + x + "</div>";
      });
      el("ver-desordenada").innerHTML = h + "</div>";
      el("ver-desorden").innerHTML = "Son los mismos doce valores en otro orden. Las corridas pasan de <b>" +
        d.ordenadas + "</b> a <b>" + d.C + "</b>, el vector de largos queda en [" + d.len.join(", ") +
        "] y el árbol pesa " + d.vertices + " vértices. En la consulta " + (d.peor.izq + 1) + " " +
        (d.peor.der + 1) + " el método contesta <b>" + d.peor.dio +
        "</b> y el valor más frecuente aparece <b>" + d.peor.real + "</b> veces.";
      if (s) {
        el("ver-suma").innerHTML = "Las posiciones " + (s.uno.i + 1) + " a " + (s.uno.j + 1) +
          " y las posiciones " + (s.otro.i + 1) + " a " + (s.otro.j + 1) + " suman lo mismo, " +
          s.uno.suma + ", y sus respuestas son <b>" + s.uno.r + "</b> y <b>" + s.otro.r +
          "</b>. Un árbol de sumas no las distingue; uno de máximos sobre los largos, sí.";
      }
    }

    /* ---------- rondas ---------- */

    function rondas() {
      var caja = el("rondas");
      E.RONDAS.forEach(function (r, i) {
        var carta = document.createElement("div");
        carta.className = "carta";
        var h2 = document.createElement("h2");
        h2.textContent = (i + 13) + ". " + r.titulo;
        var pr = document.createElement("p");
        pr.className = "pregunta";
        pr.innerHTML = r.texto;
        var ops = document.createElement("div");
        var ver = document.createElement("div");
        ver.className = "veredicto";
        carta.appendChild(h2);
        carta.appendChild(pr);
        carta.appendChild(ops);
        carta.appendChild(ver);
        caja.appendChild(carta);
        SEG.montarOpciones(ops, r.opciones, ver);
      });
    }

    /* ---------- arranque ---------- */

    tiraCorridas(el("ver-arreglo"), {});
    corridasEnPalabras();

    Motor.opcionesNumericas("opciones-cuantas", "veredicto-cuantas", function () {
      return SEG.sinRepetidos([
        { valor: E.C, clave: "correcta",
          razon: "Correcto: el valor cambia cuatro veces, y cada cambio cierra una corrida." },
        { valor: E.N, clave: "una-por-posicion",
          razon: "Esas son las posiciones. Una corrida junta todas las posiciones seguidas con el mismo valor." },
        { valor: E.MAYOR, clave: "mayor",
          razon: "Ese es el largo de la corrida más larga, la de los 2, no cuántas corridas hay." },
        { valor: E.C - 1, clave: "cambios",
          razon: "Esos son los cambios de valor que se ven recorriendo el arreglo. La primera corrida arranca sin que nada cambie." }
      ]);
    });

    Motor.opcionesNumericas("opciones-raiz", "veredicto-raiz", function () {
      return SEG.sinRepetidos([
        { valor: E.TREE[0], clave: "correcta",
          razon: "Correcto: la raíz cubre las " + E.C + " corridas y guarda el mayor de sus largos." },
        { valor: E.N, clave: "suma",
          razon: "Esa es la suma de los largos, las doce posiciones. El vértice guarda el máximo." },
        { valor: E.C, clave: "corridas",
          razon: "Esas son las corridas. El largo mayor es otro número." },
        { valor: E.R.len[0], clave: "primera",
          razon: "Ese es el largo de la primera corrida. La raíz compara las " + E.C + "." }
      ]);
    });

    Motor.iniciar({
      codigo: E.CODIGO_COMPRIMIR,
      simular: function () { return E.simComprimir(E.A); },
      chips: [
        { campo: "i", rotulo: "i" },
        { campo: "inicio", rotulo: "inicio" },
        { campo: "corrida", rotulo: "corrida" },
        { campo: "largos", rotulo: "run_len" }
      ],
      paramsIniciales: {},
      alPintar: pintarComprimir
    });

    arbolBase(el("arbol-largos"));
    el("ver-reserva").textContent = 4 * E.C;
    el("ver-vertices").textContent = 2 * E.C - 1;

    E.PASOS.forEach(cartaConsulta);
    trampa();
    rondas();
    limitaciones();

    el("campo-n").value = estado.N;
    el("campo-q").value = estado.Q;
    el("campo-largo").value = estado.largo;
    el("btn-conteos").addEventListener("click", leer);
    cuentas();

    el("btn-salida").addEventListener("click", function () {
      el("ver-salida").innerHTML = "<pre class='codigo-fijo'>" + E.respuestas().join("\n") + "</pre>";
    });
  })();
}
