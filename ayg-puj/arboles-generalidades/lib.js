/* Piezas comunes de las actividades de generalidades de los arboles.
   Las funciones sobre el arbol como lista anidada reproducen, linea por
   linea, arboles.py y recorridos.py; la amplitud reproduce
   excentricidad.py. Los numeros de linea son los de esos archivos.

   Un arbol es [] o [valor, izquierdo, derecho], igual que la gramatica
   <arbol> ::= [] | [n <arbol> <arbol>]. */
var ARB = (function () {

  /* ---------- arboles.py, lineas 22 a 32 ---------- */

  function contarNodos(A) {
    var ans;
    if (A.length === 0) { ans = 0; }
    else { ans = 1 + contarNodos(A[1]) + contarNodos(A[2]); }
    return ans;
  }

  function altura(A) {
    var ans;
    if (A.length === 0) { ans = -1; }
    else { ans = 1 + Math.max(altura(A[1]), altura(A[2])); }
    return ans;
  }

  /* ---------- recorridos.py, lineas 19 a 48 ---------- */

  function preorden(A, ans) {
    if (A.length > 0) {
      ans.push(A[0]);
      preorden(A[1], ans);
      preorden(A[2], ans);
    }
    return ans;
  }

  function posorden(A, ans) {
    if (A.length > 0) {
      posorden(A[1], ans);
      posorden(A[2], ans);
      ans.push(A[0]);
    }
    return ans;
  }

  function inorden(A, ans) {
    if (A.length > 0) {
      inorden(A[1], ans);
      ans.push(A[0]);
      inorden(A[2], ans);
    }
    return ans;
  }

  function niveles(A) {
    var ans = [], queue = [], B;
    if (A.length > 0) { queue.push(A); }
    while (queue.length > 0) {
      B = queue.shift();
      ans.push(B[0]);
      if (B[1].length > 0) { queue.push(B[1]); }
      if (B[2].length > 0) { queue.push(B[2]); }
    }
    return ans;
  }

  function hojas(A) {
    var r = [];
    function ver(T) {
      if (T.length > 0) {
        if (T[1].length === 0 && T[2].length === 0) { r.push(T[0]); }
        ver(T[1]); ver(T[2]);
      }
    }
    ver(A);
    return r;
  }

  /* ---------- reconstruir un arbol con dos recorridos ---------- */
  /* tipo: "pre", "pos" o "niv". El inorden parte en dos; el otro
     recorrido dice cual es la raiz de cada pedazo. */
  function reconstruir(otro, inord, tipo) {
    function armar(ot, ino) {
      var raiz, k, izqIno, derIno, izqOt, derOt;
      if (ino.length === 0) { return []; }
      raiz = tipo === "pos" ? ot[ot.length - 1] : ot[0];
      k = ino.indexOf(raiz);
      izqIno = ino.slice(0, k);
      derIno = ino.slice(k + 1);
      if (tipo === "pre") {
        izqOt = ot.slice(1, 1 + izqIno.length);
        derOt = ot.slice(1 + izqIno.length);
      } else if (tipo === "pos") {
        izqOt = ot.slice(0, izqIno.length);
        derOt = ot.slice(izqIno.length, ot.length - 1);
      } else {
        izqOt = ot.filter(function (v) { return izqIno.indexOf(v) >= 0; });
        derOt = ot.filter(function (v) { return derIno.indexOf(v) >= 0; });
      }
      return [raiz, armar(izqOt, izqIno), armar(derOt, derIno)];
    }
    return armar(otro, inord);
  }

  /* La raiz de un pedazo del inorden, segun el recorrido que acompana. */
  function raizDe(otro, inord, tipo, pedazo) {
    var cand = otro.filter(function (v) { return pedazo.indexOf(v) >= 0; });
    return tipo === "pos" ? cand[cand.length - 1] : cand[0];
  }

  /* ---------- traza de contarNodos y de altura ---------- */
  /* Un paso por linea ejecutada. La linea del caso recursivo se emite
     cuando los dos llamados ya devolvieron y ans recibe su valor, de
     modo que el contador de cada linea cuenta llamados y no entradas. */
  function simRec(A, cual) {
    var L = cual === "contar" ? { def: 22, base: 23, rec: 25, ret: 26 }
                              : { def: 28, base: 29, rec: 31, ret: 32 };
    var pasos = [], pila = [], listos = [], id = 0;

    function emitir(linea, m, texto) {
      pasos.push({
        linea: linea, A: m.et, prof: m.prof, ans: m.ans,
        pila: pila.map(function (f) { return { et: f.et, ans: f.ans, prof: f.prof }; }),
        mirando: m.nodos.slice(), listos: listos.slice(),
        padre: m.padre, lado: m.lado, vacio: m.nodos.length === 0, nota: texto
      });
    }

    function nodosDe(T, lista) {
      if (T.length > 0) { lista.push(T); nodosDe(T[1], lista); nodosDe(T[2], lista); }
      return lista;
    }

    function f(T, prof, padre, lado) {
      var m = { id: id, et: etiqueta(T), prof: prof, ans: null, nodos: nodosDe(T, []),
                padre: padre, lado: lado }, a, b;
      id = id + 1;
      pila.push(m);
      emitir(L.def, m, "entra el llamado con A = " + m.et +
        (padre ? ", el subárbol " + lado + " de " + padre[0] : ", el árbol completo"));
      if (T.length === 0) {
        m.ans = cual === "contar" ? 0 : -1;
        emitir(L.base, m, "el árbol vacío vale " + m.ans);
      } else {
        a = f(T[1], prof + 1, T, "izquierdo");
        b = f(T[2], prof + 1, T, "derecho");
        m.ans = cual === "contar" ? 1 + a + b : 1 + Math.max(a, b);
        emitir(L.rec, m, cual === "contar"
          ? "1 + " + a + " + " + b + " = " + m.ans
          : "1 + max(" + a + ", " + b + ") = " + m.ans);
        listos.push([T, m.ans]);
      }
      emitir(L.ret, m, "devuelve " + m.ans);
      pila.pop();
      return m.ans;
    }

    f(A, 0, null, null);
    return pasos;
  }

  function etiqueta(T) { return T.length === 0 ? "[]" : "[" + T[0] + " … ]"; }

  var CODIGO_CONTAR = [
    { num: 22, txt: "def contarNodos(A):" },
    { num: 23, txt: "  if len(A) == 0: ans = 0" },
    { num: null, txt: "  else:" },
    { num: 25, txt: "    ans = 1 + contarNodos(A[1]) + contarNodos(A[2])" },
    { num: 26, txt: "  return ans" }
  ];

  var CODIGO_ALTURA = [
    { num: 28, txt: "def altura(A):" },
    { num: 29, txt: "  if len(A) == 0: ans = -1" },
    { num: null, txt: "  else:" },
    { num: 31, txt: "    ans = 1 + max(altura(A[1]), altura(A[2]))" },
    { num: 32, txt: "  return ans" }
  ];

  /* ---------- el arbol como grafo ---------- */

  function adyacencia(n, aristas) {
    var g = [], i = 0;
    while (i < n) { g.push([]); i = i + 1; }
    aristas.forEach(function (e) { g[e[0]].push(e[1]); g[e[1]].push(e[0]); });
    g.forEach(function (l) { l.sort(function (a, b) { return a - b; }); });
    return g;
  }

  function grados(n, aristas) {
    var d = [], i = 0;
    while (i < n) { d.push(0); i = i + 1; }
    aristas.forEach(function (e) { d[e[0]] = d[e[0]] + 1; d[e[1]] = d[e[1]] + 1; });
    return d;
  }

  /* excentricidad.py, lineas 22 a 33: una amplitud desde s. */
  function amplitud(G, s) {
    var dist = [], queue = [], v, i = 0;
    while (i < G.length) { dist.push(-1); i = i + 1; }
    dist[s] = 0;
    queue.push(s);
    while (queue.length > 0) {
      v = queue.shift();
      G[v].forEach(function (w) {
        if (dist[w] === -1) { dist[w] = dist[v] + 1; queue.push(w); }
      });
    }
    return dist;
  }

  /* excentricidad.py, lineas 35 a 40: la mayor de las distancias. */
  function excentricidad(G, v) {
    var dist = amplitud(G, v), ans = 0, w = 0;
    while (w < G.length) {
      if (dist[w] > ans) { ans = dist[w]; }
      w = w + 1;
    }
    return ans;
  }

  /* excentricidad.py, lineas 42 a 46. */
  function radioDiametroCentro(G) {
    var ecc = G.map(function (_, v) { return excentricidad(G, v); });
    var radio = Math.min.apply(null, ecc), diametro = Math.max.apply(null, ecc);
    var centro = [];
    ecc.forEach(function (e, v) { if (e === radio) { centro.push(v); } });
    return { ecc: ecc, radio: radio, diametro: diametro, centro: centro };
  }

  function componentes(G) {
    var comp = G.map(function () { return -1; }), c = 0, v = 0;
    while (v < G.length) {
      if (comp[v] === -1) {
        amplitud(G, v).forEach(function (d, w) { if (d >= 0) { comp[w] = c; } });
        c = c + 1;
      }
      v = v + 1;
    }
    return { comp: comp, cuantas: c };
  }

  /* Traza de la amplitud, un paso por linea ejecutada. */
  function simAmplitud(G, s) {
    var pasos = [], dist = [], queue = [], i = 0, v;

    function emitir(linea, extra) {
      var p = { linea: linea, dist: dist.slice(), cola: queue.slice(),
                v: null, w: null, dw: null };
      Object.keys(extra || {}).forEach(function (k) { p[k] = extra[k]; });
      pasos.push(p);
    }

    while (i < G.length) { dist.push(-1); i = i + 1; }
    emitir(23, { nota: "todas las distancias arrancan en −1" });
    dist[s] = 0;
    emitir(24, { nota: "la fuente queda en 0" });
    emitir(25, { nota: "la cola arranca vacía" });
    queue.push(s);
    emitir(26, { nota: "entra la fuente" });
    while (true) {
      emitir(27, { nota: queue.length > 0 ? "la cola tiene " + queue.length : "la cola quedó vacía" });
      if (queue.length === 0) { break; }
      v = queue.shift();
      emitir(28, { v: v, nota: "sale el primero que entró" });
      G[v].forEach(function (w) {
        emitir(29, { v: v, w: w, nota: "vecino de " + v });
        emitir(30, { v: v, w: w, dw: dist[w],
                     nota: dist[w] === -1 ? "sin visitar" : "ya tenía distancia " + dist[w] });
        if (dist[w] === -1) {
          dist[w] = dist[v] + 1;
          emitir(31, { v: v, w: w, dw: dist[w], nota: dist[v] + " + 1 = " + dist[w] });
          queue.push(w);
          emitir(32, { v: v, w: w, dw: dist[w], nota: "entra a la cola" });
        }
      });
    }
    emitir(33, { nota: "devuelve las distancias" });
    return pasos;
  }

  var CODIGO_AMPLITUD = [
    { num: null, txt: "def amplitud(s):" },
    { num: 23, txt: "  dist = [-1 for _ in range(len(G))]" },
    { num: 24, txt: "  dist[s] = 0" },
    { num: 25, txt: "  queue = deque()" },
    { num: 26, txt: "  queue.append(s)" },
    { num: 27, txt: "  while len(queue) > 0:" },
    { num: 28, txt: "    v = queue.popleft()" },
    { num: 29, txt: "    for w in G[v]:" },
    { num: 30, txt: "      if dist[w] == -1:" },
    { num: 31, txt: "        dist[w] = dist[v] + 1" },
    { num: 32, txt: "        queue.append(w)" },
    { num: 33, txt: "  return dist" }
  ];

  /* ---------- dibujo ---------- */

  /* Posiciones de un arbol binario: x por el orden del inorden,
     y por la profundidad. Devuelve el grafo listo para GRAFOSVG. */
  function layoutBinario(T, o) {
    o = o || {};
    var ancho = o.ancho || 560, alto = o.alto || 240;
    var lista = [], aristas = [], col = 0, maxProf = 0;

    function recorrer(A, prof, padre) {
      var yo;
      if (A.length === 0) { return -1; }
      yo = lista.length;
      lista.push({ v: A[0], prof: prof, col: 0, sub: A });
      if (prof > maxProf) { maxProf = prof; }
      var izq = recorrer(A[1], prof + 1, yo);
      lista[yo].col = col; col = col + 1;
      var der = recorrer(A[2], prof + 1, yo);
      lista[yo].izq = izq; lista[yo].der = der;
      if (izq >= 0) { aristas.push([yo, izq, ""]); }
      if (der >= 0) { aristas.push([yo, der, ""]); }
      return yo;
    }
    recorrer(T, 0, -1);

    var pasoX = lista.length > 1 ? (ancho - 70) / (lista.length - 1) : 0;
    var pasoY = maxProf > 0 ? (alto - 60) / maxProf : 0;
    var pos = lista.map(function (nd) {
      return [35 + nd.col * pasoX, 30 + nd.prof * pasoY];
    });
    return { n: lista.length, pos: pos, aristas: aristas, lista: lista,
             ancho: ancho, alto: alto,
             nombre: function (i) { return String(lista[i].v); },
             indiceDe: function (valor) {
               var r = -1;
               lista.forEach(function (nd, i) { if (nd.v === valor) { r = i; } });
               return r;
             } };
  }

  /* Posiciones del mismo arbol libre colgado de una raiz: las hojas
     ocupan columnas seguidas y cada padre queda sobre sus hijos. */
  function layoutColgado(G, raiz, o) {
    o = o || {};
    var ancho = o.ancho || 560, alto = o.alto || 250;
    var n = G.length, padre = [], prof = [], hijos = [], col = [], libre = 0, maxProf = 0;

    function bajar(v) {
      hijos[v] = G[v].filter(function (w) { return w !== padre[v]; });
      if (prof[v] > maxProf) { maxProf = prof[v]; }
      if (hijos[v].length === 0) { col[v] = libre; libre = libre + 1; }
      else {
        hijos[v].forEach(function (w) { padre[w] = v; prof[w] = prof[v] + 1; bajar(w); });
        col[v] = (col[hijos[v][0]] + col[hijos[v][hijos[v].length - 1]]) / 2;
      }
    }
    padre[raiz] = -1; prof[raiz] = 0;
    bajar(raiz);

    var pasoX = libre > 1 ? (ancho - 70) / (libre - 1) : 0;
    var pasoY = maxProf > 0 ? (alto - 60) / maxProf : 0;
    var pos = [], aristas = [], v = 0;
    while (v < n) {
      pos.push([35 + col[v] * pasoX, 30 + prof[v] * pasoY]);
      if (padre[v] >= 0) { aristas.push([padre[v], v, ""]); }
      v = v + 1;
    }
    return { pos: pos, aristas: aristas, padre: padre, prof: prof, hijos: hijos,
             altura: maxProf, ancho: ancho, alto: alto };
  }

  /* ---------- comparar lo que escribe el estudiante ---------- */

  function leerSecuencia(texto) {
    return String(texto).split(/[^0-9-]+/)
      .filter(function (p) { return p.length > 0; })
      .map(function (p) { return parseInt(p, 10); });
  }

  /* Primera posicion en que dos secuencias difieren, o -1. */
  function divergeEn(a, b) {
    var i = 0, r = -1;
    while (i < Math.max(a.length, b.length)) {
      if (r === -1 && a[i] !== b[i]) { r = i; }
      i = i + 1;
    }
    return r;
  }

  function txt(a) { return a.join(" "); }

  return {
    contarNodos: contarNodos, altura: altura, hojas: hojas,
    preorden: preorden, posorden: posorden, inorden: inorden, niveles: niveles,
    reconstruir: reconstruir, raizDe: raizDe,
    simRec: simRec, etiqueta: etiqueta,
    CODIGO_CONTAR: CODIGO_CONTAR, CODIGO_ALTURA: CODIGO_ALTURA,
    adyacencia: adyacencia, grados: grados,
    amplitud: amplitud, excentricidad: excentricidad,
    radioDiametroCentro: radioDiametroCentro, componentes: componentes,
    simAmplitud: simAmplitud, CODIGO_AMPLITUD: CODIGO_AMPLITUD,
    layoutBinario: layoutBinario, layoutColgado: layoutColgado,
    leerSecuencia: leerSecuencia, divergeEn: divergeEn, txt: txt
  };
})();

if (typeof module !== "undefined") { module.exports = ARB; }
