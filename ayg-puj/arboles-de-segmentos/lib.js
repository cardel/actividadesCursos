/* Piezas comunes de los ejercicios de arboles de segmentos.
   Reproducen segmentos.py de la sesion linea por linea, con la indexacion de
   la clase: la raiz es 0 y los hijos de v son 2v+1 y 2(v+1). Los numeros que
   acompanan al codigo en pantalla son los de ese archivo.

   El dibujo es propio del tema porque cada vertice lleva dos textos --su
   intervalo y su valor, como los escribe la nota: [0,5],26-- y el color dice
   en que caso del query quedo. grafo-svg.js dibuja circulos de una etiqueta
   para grafos con pesos; de ahi se reusa la paleta, que es la del curso. */
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var SEG = (function () {
  var COL = GRAFOSVG.COL;

  function copiaArr(a) { return a.slice(); }

  function copiaObj(o) {
    var r = {}, k;
    for (k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) { r[k] = o[k]; } }
    return r;
  }

  function ceros(n) {
    var a = [], i;
    for (i = 0; i < n; i = i + 1) { a.push(0); }
    return a;
  }

  /* ---------------- segmentos.py ---------------- */

  function buildRec(tree, A, v, l, r) {
    var m;
    if (l === r) {
      tree[v] = A[l];
    } else {
      m = Math.floor((l + r) / 2);
      buildRec(tree, A, 2 * v + 1, l, m);
      buildRec(tree, A, 2 * (v + 1), m + 1, r);
      tree[v] = tree[2 * v + 1] + tree[2 * (v + 1)];
    }
  }

  function build(A) {
    var N = A.length, tree = ceros(4 * N);
    buildRec(tree, A, 0, 0, N - 1);
    return { tree: tree, N: N };
  }

  function queryRec(S, v, l, r, ql, qr) {
    var resultado = 0, m;
    if (!(qr < l || r < ql)) {
      if (ql <= l && r <= qr) {
        resultado = S.tree[v];
      } else {
        m = Math.floor((l + r) / 2);
        resultado = queryRec(S, 2 * v + 1, l, m, ql, qr)
                  + queryRec(S, 2 * (v + 1), m + 1, r, ql, qr);
      }
    }
    return resultado;
  }

  function query(S, ql, qr) { return queryRec(S, 0, 0, S.N - 1, ql, qr); }

  function updateRec(S, v, l, r, i, valor) {
    var m;
    if (l === r) {
      S.tree[v] = valor;
    } else {
      m = Math.floor((l + r) / 2);
      if (i <= m) {
        updateRec(S, 2 * v + 1, l, m, i, valor);
      } else {
        updateRec(S, 2 * (v + 1), m + 1, r, i, valor);
      }
      S.tree[v] = S.tree[2 * v + 1] + S.tree[2 * (v + 1)];
    }
  }

  function update(S, i, valor) { updateRec(S, 0, 0, S.N - 1, i, valor); }

  /* ---------------- la forma del arbol ----------------
     Los vertices que build_rec visita, con el intervalo de cada uno. */

  function segmentos(N) {
    var seg = {};
    function bajar(v, l, r) {
      var m;
      seg[v] = [l, r];
      if (l !== r) {
        m = Math.floor((l + r) / 2);
        bajar(2 * v + 1, l, m);
        bajar(2 * (v + 1), m + 1, r);
      }
    }
    bajar(0, 0, N - 1);
    return seg;
  }

  function vertices(N) {
    return Object.keys(segmentos(N)).map(Number).sort(function (a, b) { return a - b; });
  }

  function padreDe(v) { return v === 0 ? -1 : Math.floor((v - 1) / 2); }

  function rotulo(l, r) { return l === r ? "[" + l + "]" : "[" + l + "," + r + "]"; }

  /* Lo que la reserva de 4N deja medir: casillas pedidas, casillas escritas,
     el indice mas grande que se toca y la reserva mas chica que alcanzaria. */
  function memoria(N) {
    var vs = vertices(N), mayor = vs[vs.length - 1];
    return { N: N, reservadas: 4 * N, escritas: vs.length, mayor: mayor,
             alcanza: mayor + 1, sobran: 4 * N - vs.length,
             dosN: 2 * N, cabeEnDosN: mayor < 2 * N };
  }

  function alturaDe(N) {
    var seg = segmentos(N), prof = 0, v;
    for (v in seg) {
      if (Object.prototype.hasOwnProperty.call(seg, v)) {
        var d = 0, w = Number(v);
        while (w > 0) { w = padreDe(w); d = d + 1; }
        if (d > prof) { prof = d; }
      }
    }
    return prof;
  }

  /* ---------------- build_rec paso a paso ----------------
     Un paso por linea ejecutada, con el arbol completo y los vertices que ya
     tienen valor escrito. */
  function simBuild(A) {
    var N = A.length, tree = ceros(4 * N), escrito = {}, pasos = [], pila = [];
    var m = null, ultimo = null;

    function foto(linea, v, l, r) {
      pasos.push({ linea: linea, v: v, l: l, r: r, m: m, tree: copiaArr(tree),
                   escrito: copiaObj(escrito), pila: pila.slice(), ultimo: ultimo,
                   rotulo: rotulo(l, r) });
      ultimo = null;
    }

    function rec(v, l, r) {
      var mi;
      pila.push(v);
      m = null;
      foto(6, v, l, r);
      if (l === r) {
        tree[v] = A[l];
        escrito[v] = true;
        ultimo = v;
        foto(7, v, l, r);
      } else {
        mi = Math.floor((l + r) / 2);
        m = mi;
        foto(9, v, l, r);
        foto(10, v, l, r);
        rec(2 * v + 1, l, mi);
        m = mi;
        foto(11, v, l, r);
        rec(2 * (v + 1), mi + 1, r);
        m = mi;
        tree[v] = tree[2 * v + 1] + tree[2 * (v + 1)];
        escrito[v] = true;
        ultimo = v;
        foto(12, v, l, r);
      }
      pila.pop();
    }

    rec(0, 0, N - 1);
    return pasos;
  }

  /* ---------------- query_rec paso a paso ----------------
     estados guarda en que caso quedo cada vertice visitado y aportes la lista
     de lo que cada vertice devolvio sin bajar mas. */
  function simQuery(S, ql, qr) {
    var pasos = [], pila = [], estados = {}, aportes = [], acumulado = 0;

    function foto(linea, d) {
      var p = { linea: linea, ql: ql, qr: qr, pila: pila.slice(),
                estados: copiaObj(estados), aportes: aportes.slice(),
                acumulado: acumulado }, k;
      for (k in d) { if (Object.prototype.hasOwnProperty.call(d, k)) { p[k] = d[k]; } }
      p.rotulo = rotulo(d.l, d.r);
      pasos.push(p);
    }

    function rec(v, l, r) {
      var resultado = 0, m, izq, der, base = { v: v, l: l, r: r, m: null };
      pila.push(v);
      foto(23, { v: v, l: l, r: r, m: null, caso: "", resultado: 0 });
      if (qr < l || r < ql) {
        estados[v] = "disjunto";
        aportes.push({ v: v, caso: "disjunto", valor: 0, l: l, r: r });
        foto(24, { v: v, l: l, r: r, m: null, caso: "disjunto", resultado: 0 });
      } else {
        foto(24, { v: v, l: l, r: r, m: null, caso: "se cruza", resultado: 0 });
        if (ql <= l && r <= qr) {
          estados[v] = "contenido";
          foto(25, { v: v, l: l, r: r, m: null, caso: "contenido", resultado: 0 });
          resultado = S.tree[v];
          acumulado = acumulado + resultado;
          aportes.push({ v: v, caso: "contenido", valor: resultado, l: l, r: r });
          foto(26, { v: v, l: l, r: r, m: null, caso: "contenido", resultado: resultado });
        } else {
          estados[v] = "solapado";
          foto(25, { v: v, l: l, r: r, m: null, caso: "solapado", resultado: 0 });
          m = Math.floor((l + r) / 2);
          foto(28, { v: v, l: l, r: r, m: m, caso: "solapado", resultado: 0 });
          foto(29, { v: v, l: l, r: r, m: m, caso: "solapado", resultado: 0 });
          izq = rec(2 * v + 1, l, m);
          foto(30, { v: v, l: l, r: r, m: m, caso: "solapado", resultado: izq });
          der = rec(2 * (v + 1), m + 1, r);
          resultado = izq + der;
          foto(30, { v: v, l: l, r: r, m: m, caso: "solapado", resultado: resultado });
        }
      }
      foto(31, { v: v, l: l, r: r, m: null, caso: estados[v], resultado: resultado });
      pila.pop();
      return resultado;
    }

    var total = rec(0, 0, S.N - 1);
    return { pasos: pasos, total: total, aportes: aportes, estados: estados,
             visitados: Object.keys(estados).length };
  }

  /* Como queda cada vertice del arbol para el dibujo: el caso en que quedo si
     se visito, apagado si un antecesor se resolvio sin bajar, y neutro si el
     recorrido todavia no llego. */
  function estadoDeVertices(N, estados) {
    var seg = segmentos(N), fuera = {}, v, w, p, cortado;
    for (v in seg) {
      if (Object.prototype.hasOwnProperty.call(seg, v)) {
        w = Number(v);
        if (estados[w] === undefined) {
          cortado = false;
          p = padreDe(w);
          while (p >= 0) {
            if (estados[p] === "contenido" || estados[p] === "disjunto") { cortado = true; }
            p = padreDe(p);
          }
          fuera[w] = cortado ? "apagado" : "neutro";
        } else {
          fuera[w] = estados[w];
        }
      }
    }
    return fuera;
  }

  /* ---------------- update_rec paso a paso ---------------- */
  function simUpdate(S, i, valor) {
    var tree = copiaArr(S.tree), pasos = [], pila = [], cambios = {}, camino = [];
    var m = null, rama = "";

    function foto(linea, v, l, r) {
      pasos.push({ linea: linea, v: v, l: l, r: r, m: m, i: i, valor: valor,
                   tree: copiaArr(tree), cambios: copiaObj(cambios),
                   pila: pila.slice(), camino: camino.slice(), rama: rama,
                   rotulo: rotulo(l, r) });
    }

    function rec(v, l, r) {
      var mi, antes;
      pila.push(v);
      camino.push(v);
      m = null;
      rama = "";
      foto(39, v, l, r);
      if (l === r) {
        antes = tree[v];
        tree[v] = valor;
        cambios[v] = { antes: antes, despues: valor };
        foto(40, v, l, r);
      } else {
        mi = Math.floor((l + r) / 2);
        m = mi;
        foto(42, v, l, r);
        rama = i <= mi ? "izquierdo" : "derecho";
        foto(43, v, l, r);
        if (i <= mi) {
          foto(44, v, l, r);
          rec(2 * v + 1, l, mi);
        } else {
          foto(46, v, l, r);
          rec(2 * (v + 1), mi + 1, r);
        }
        m = mi;
        rama = "";
        antes = tree[v];
        tree[v] = tree[2 * v + 1] + tree[2 * (v + 1)];
        cambios[v] = { antes: antes, despues: tree[v] };
        foto(47, v, l, r);
      }
      pila.pop();
    }

    rec(0, 0, S.N - 1);
    return { pasos: pasos, tree: tree, cambios: cambios, camino: camino.slice() };
  }

  /* ---------------- lo que cuesta cada forma de contestar ----------------
     Tres maneras de responder las mismas acciones sobre un arreglo de N:

       recorrido   la consulta lee una casilla por posicion del rango y el
                   cambio escribe una sola
       prefijos    la consulta es una resta, dos lecturas, y el cambio obliga a
                   rehacer el prefijo desde la posicion que cambio
       arbol       la consulta mira los vertices que visita query_rec y el
                   cambio escribe los ancestros de la hoja

     Las dos cuentas del arbol salen de recorrer la recursion, no de una
     formula: contar sin construir el arbol permite mover N hasta donde el
     dibujo ya no cabe. */

  function vistaQuery(N, ql, qr) {
    var vistos = 0;
    function rec(l, r) {
      var m;
      vistos = vistos + 1;
      if (!(qr < l || r < ql) && !(ql <= l && r <= qr)) {
        m = Math.floor((l + r) / 2);
        rec(l, m);
        rec(m + 1, r);
      }
    }
    rec(0, N - 1);
    return vistos;
  }

  function vistaUpdate(N, i) {
    var vistos = 0;
    function rec(l, r) {
      var m;
      vistos = vistos + 1;
      if (l !== r) {
        m = Math.floor((l + r) / 2);
        if (i <= m) { rec(l, m); } else { rec(m + 1, r); }
      }
    }
    rec(0, N - 1);
    return vistos;
  }

  /* El rango de la consulta y la posicion del cambio con que se compara. Los
     bordes no caen en una potencia de dos a proposito: un rango alineado con
     las mitades del arbol se contesta con dos o tres vertices y haria ver la
     consulta mas barata de lo que es en general. */
  function faena(N) {
    return { ql: Math.floor(N / 3), qr: Math.floor((4 * N) / 5), i: Math.floor(N / 3) };
  }

  function costos(N, consultas, cambios) {
    var f = faena(N), largo = f.qr - f.ql + 1;
    var vq = vistaQuery(N, f.ql, f.qr), vu = vistaUpdate(N, f.i);
    var rehacer = N - f.i;
    return {
      N: N, consultas: consultas, cambios: cambios, rango: [f.ql, f.qr],
      posicion: f.i, largo: largo, vistosQuery: vq, vistosUpdate: vu,
      rehacer: rehacer,
      recorrido: { arme: 0, consulta: largo, cambio: 1,
                   total: consultas * largo + cambios },
      prefijos: { arme: N, consulta: 2, cambio: rehacer,
                  total: N + consultas * 2 + cambios * rehacer },
      arbol: { arme: 2 * N - 1, consulta: vq, cambio: vu,
               total: (2 * N - 1) + consultas * vq + cambios * vu },
      memoria: { arreglo: N, prefijos: N + 1, arbol: 4 * N }
    };
  }

  function gana(c) {
    var mejor = "arbol";
    if (c.recorrido.total <= c.prefijos.total && c.recorrido.total <= c.arbol.total) { mejor = "recorrido"; }
    else if (c.prefijos.total <= c.arbol.total) { mejor = "prefijos"; }
    return mejor;
  }

  /* Cuantos cambios hacen falta, con las consultas fijas, para que el arbol
     deje de perder contra los prefijos. Devuelve -1 si no cruza. */
  function cruceContraPrefijos(N, consultas) {
    var u = 0, tope = 4 * N + 10, r = -1;
    while (u <= tope && r < 0) {
      var c = costos(N, consultas, u);
      if (c.arbol.total < c.prefijos.total) { r = u; }
      u = u + 1;
    }
    return r;
  }

  /* Y cuantas consultas, con los cambios fijos, para que le gane al recorrido. */
  function cruceContraRecorrido(N, cambios) {
    var q = 0, tope = 4 * N + 10, r = -1;
    while (q <= tope && r < 0) {
      var c = costos(N, q, cambios);
      if (c.arbol.total < c.recorrido.total) { r = q; }
      q = q + 1;
    }
    return r;
  }

  /* ---------------- el codigo en pantalla ----------------
     num es la linea de segmentos.py. */

  var CODIGO_BUILD = [
    { num: 5, txt: "def build_rec(tree, A, v, l, r):", bloque: 1 },
    { num: 6, txt: "    if l == r:", bloque: 1 },
    { num: 7, txt: "        tree[v] = A[l]", bloque: 1 },
    { num: null, txt: "    else:" },
    { num: 9, txt: "        m = (l + r) // 2", bloque: 1 },
    { num: 10, txt: "        build_rec(tree, A, 2 * v + 1, l, m)", bloque: 1 },
    { num: 11, txt: "        build_rec(tree, A, 2 * (v + 1), m + 1, r)", bloque: 1 },
    { num: 12, txt: "        tree[v] = tree[2 * v + 1] + tree[2 * (v + 1)]", bloque: 1 },
    { num: null, txt: "" },
    { num: null, txt: "def build(A):" },
    { num: null, txt: "    N = len(A)" },
    { num: null, txt: "    tree = [0] * (4 * N)" },
    { num: null, txt: "    build_rec(tree, A, 0, 0, N - 1)" }
  ];

  var CODIGO_QUERY = [
    { num: 22, txt: "def query_rec(S, v, l, r, ql, qr):", bloque: 2 },
    { num: 23, txt: "    resultado = 0", bloque: 2 },
    { num: 24, txt: "    if not (qr < l or r < ql):", bloque: 2 },
    { num: 25, txt: "        if ql <= l and r <= qr:", bloque: 2 },
    { num: 26, txt: "            resultado = S[\"tree\"][v]", bloque: 2 },
    { num: null, txt: "        else:" },
    { num: 28, txt: "            m = (l + r) // 2", bloque: 2 },
    { num: 29, txt: "            resultado = (query_rec(S, 2 * v + 1, l, m, ql, qr)", bloque: 2 },
    { num: 30, txt: "                 + query_rec(S, 2 * (v + 1), m + 1, r, ql, qr))", bloque: 2 },
    { num: 31, txt: "    return resultado", bloque: 2 }
  ];

  var CODIGO_UPDATE = [
    { num: 38, txt: "def update_rec(S, v, l, r, i, valor):", bloque: 3 },
    { num: 39, txt: "    if l == r:", bloque: 3 },
    { num: 40, txt: "        S[\"tree\"][v] = valor", bloque: 3 },
    { num: null, txt: "    else:" },
    { num: 42, txt: "        m = (l + r) // 2", bloque: 3 },
    { num: 43, txt: "        if i <= m:", bloque: 3 },
    { num: 44, txt: "            update_rec(S, 2 * v + 1, l, m, i, valor)", bloque: 3 },
    { num: null, txt: "        else:" },
    { num: 46, txt: "            update_rec(S, 2 * (v + 1), m + 1, r, i, valor)", bloque: 3 },
    { num: 47, txt: "        S[\"tree\"][v] = S[\"tree\"][2*v+1] + S[\"tree\"][2*(v+1)]", bloque: 3 }
  ];

  /* ---------------- dibujo del arbol ----------------
     Una caja por vertice, el intervalo arriba y el valor abajo. El color de la
     caja y de la arista que llega a ella es el estado que le pase la pagina:

       neutro     todavia sin visitar
       solapado   se abre y baja a los dos hijos
       contenido  devuelve su valor sin bajar mas
       disjunto   devuelve el neutro de la operacion
       apagado    quedo debajo de un vertice que se resolvio, nadie lo mira
       camino     la rama de ancestros que un update reescribe
       escrito    el valor que build acaba de calcular
  */
  var TONO = {
    neutro:    { relleno: "#ffffff", borde: COL.gris,   tinta: "#24292f", rango: "#6b7280" },
    solapado:  { relleno: "#e3edf8", borde: COL.azul,   tinta: "#13406f", rango: "#1f5fa8" },
    contenido: { relleno: "#d7ecd9", borde: COL.verde,  tinta: "#17521a", rango: "#2e7d32" },
    disjunto:  { relleno: "#fdf1dc", borde: COL.ambar,  tinta: "#7a4e05", rango: "#8a5a06" },
    apagado:   { relleno: "#f6f7f9", borde: "#ccd3dc",  tinta: "#aeb6c0", rango: "#aeb6c0", trazo: "4 3" },
    camino:    { relleno: "#f1e7f8", borde: COL.morado, tinta: "#4f2370", rango: "#7b3fa0" },
    escrito:   { relleno: "#d7ecd9", borde: COL.verde,  tinta: "#17521a", rango: "#2e7d32" },
    pendiente: { relleno: "#ffffff", borde: "#ccd3dc",  tinta: "#aeb6c0", rango: "#aeb6c0", trazo: "4 3" }
  };

  function layout(N, o) {
    o = o || {};
    var seg = segmentos(N), vs = vertices(N);
    var cajaW = o.cajaW || 56, cajaH = o.cajaH || 36, gapX = o.gapX || 7, gapY = o.gapY || 26;
    var col = {}, prof = {}, libre = 0, maxProf = 0, pos = {};
    function bajar(v, d) {
      var l = seg[v][0], r = seg[v][1], a, b;
      prof[v] = d;
      if (d > maxProf) { maxProf = d; }
      if (l === r) {
        col[v] = libre;
        libre = libre + 1;
      } else {
        a = 2 * v + 1;
        b = 2 * (v + 1);
        bajar(a, d + 1);
        bajar(b, d + 1);
        col[v] = (col[a] + col[b]) / 2;
      }
    }
    bajar(0, 0);
    var ancho = Math.round(libre * (cajaW + gapX) + 16);
    var alto = Math.round((maxProf + 1) * cajaH + maxProf * gapY + 20);
    vs.forEach(function (v) {
      pos[v] = [Math.round(8 + col[v] * (cajaW + gapX) + cajaW / 2),
                Math.round(10 + prof[v] * (cajaH + gapY) + cajaH / 2)];
    });
    return { seg: seg, vs: vs, pos: pos, prof: prof, ancho: ancho, alto: alto,
             cajaW: cajaW, cajaH: cajaH, hojas: libre, altura: maxProf };
  }

  function esc(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* o.N        tamano del arreglo
     o.estado(v)  clave de TONO
     o.valor(v)   texto del valor, "" para dejarlo vacio
     o.nota(v)    texto chico sobre la caja
     o.gruesa(v)  true para el vertice en curso           */
  function dibujar(o) {
    var L = layout(o.N, o), svg = "", notas = "";
    var ancho = L.ancho, alto = L.alto + (o.conNotas ? 28 : 0);
    var corre = o.conNotas ? 12 : 0;

    L.vs.forEach(function (v) {
      var p = padreDe(v), e, t, x1, y1, x2, y2;
      if (p >= 0) {
        e = o.estado ? o.estado(v) : "neutro";
        t = TONO[e] || TONO.neutro;
        x1 = L.pos[p][0];
        y1 = L.pos[p][1] + L.cajaH / 2 + corre;
        x2 = L.pos[v][0];
        y2 = L.pos[v][1] - L.cajaH / 2 + corre;
        svg = svg + "<path d='M" + x1 + "," + y1 + " L" + x2 + "," + y2 +
          "' fill='none' stroke='" + t.borde + "' stroke-width='" +
          (e === "apagado" ? 1.4 : 2.2) + "'" +
          (t.trazo ? " stroke-dasharray='" + t.trazo + "'" : "") + "/>";
      }
    });

    L.vs.forEach(function (v) {
      var e = o.estado ? o.estado(v) : "neutro", t = TONO[e] || TONO.neutro;
      var x = L.pos[v][0], y = L.pos[v][1] + corre, w = L.cajaW, h = L.cajaH;
      var val = o.valor ? String(o.valor(v)) : "";
      var gruesa = o.gruesa ? o.gruesa(v) : false;
      var nota = o.nota ? o.nota(v) : "";
      var tam = val.length > 6 ? 10 : (val.length > 4 ? 11.5 : 13.5);
      if (gruesa) {
        svg = svg + "<rect x='" + (x - w / 2 - 3) + "' y='" + (y - h / 2 - 3) + "' width='" +
          (w + 6) + "' height='" + (h + 6) + "' rx='8' fill='none' stroke='" + t.borde +
          "' stroke-width='1.4' opacity='0.45'/>";
      }
      svg = svg + "<rect x='" + (x - w / 2) + "' y='" + (y - h / 2) + "' width='" + w +
        "' height='" + h + "' rx='6' fill='" + t.relleno + "' stroke='" + t.borde +
        "' stroke-width='" + (gruesa ? 3 : 1.8) + "'" +
        (t.trazo ? " stroke-dasharray='" + t.trazo + "'" : "") + "/>";
      svg = svg + "<text x='" + x + "' y='" + (y - 4) + "' text-anchor='middle' font-size='9.5' " +
        "font-family='ui-monospace, monospace' fill='" + t.rango + "'>" +
        esc(rotulo(L.seg[v][0], L.seg[v][1])) + "</text>";
      if (val !== "") {
        svg = svg + "<text x='" + x + "' y='" + (y + 12) + "' text-anchor='middle' font-size='" +
          tam + "' font-weight='700' font-family='ui-monospace, monospace' fill='" +
          t.tinta + "'>" + esc(val) + "</text>";
      }
      if (nota) {
        // en una hoja la nota va debajo: arriba se cruzaria con la arista que llega
        var hoja = L.seg[v][0] === L.seg[v][1];
        var ny = hoja ? y + h / 2 + 13 : y - h / 2 - 7;
        notas = notas + "<text x='" + x + "' y='" + ny + "' text-anchor='middle' " +
          "font-size='10' font-weight='700' fill='" + t.borde +
          "' stroke='#ffffff' stroke-width='4' paint-order='stroke'>" + esc(nota) + "</text>";
      }
    });

    return "<svg viewBox='0 0 " + ancho + " " + alto + "' width='100%' style='max-width:" +
      (o.maxAncho || Math.min(900, ancho * 1.25)) + "px' role='img' aria-label='" +
      (o.titulo || "Árbol de segmentos") + "'>" + svg + notas + "</svg>";
  }

  /* El arreglo como tira de cajas, con el rango de la consulta marcado. */
  function tiraArreglo(A, o) {
    o = o || {};
    var h = "<div class='arreglo fila-arreglo'>";
    A.forEach(function (x, i) {
      var cl = "caja";
      if (o.dentro && o.dentro(i)) { cl = cl + " visitada"; }
      if (o.foco && o.foco(i)) { cl = cl + " actual"; }
      h = h + "<div class='" + cl + "'><span class='indice'>" + i + "</span>" + x + "</div>";
    });
    return h + "</div>";
  }

  /* Una tanda de opciones de texto con su explicacion por opcion; la correcta
     lleva ok. Los botones se arman uno por uno, sin pasar por innerHTML, de
     modo que la pagina se puede recorrer y pulsar fuera del navegador. */
  function montarOpciones(caja, opciones, veredicto, alAcertar) {
    caja.innerHTML = "";
    opciones.forEach(function (o) {
      var b = document.createElement("button");
      b.className = "opcion";
      b.innerHTML = o.txt;
      b.addEventListener("click", function () {
        veredicto.className = "veredicto " + (o.ok ? "bien" : "mal");
        veredicto.innerHTML = o.fb;
        if (o.ok && alAcertar) { alAcertar(); }
      });
      caja.appendChild(b);
    });
  }

  /* Quita de una lista de opciones numericas las que repiten un valor ya
     usado: dos errores distintos caen a veces en el mismo numero. */
  function sinRepetidos(lista) {
    var vistos = [];
    return lista.filter(function (o) {
      var nuevo = vistos.indexOf(o.valor) < 0;
      vistos.push(o.valor);
      return nuevo;
    });
  }

  return { COL: COL, TONO: TONO, copiaArr: copiaArr, copiaObj: copiaObj, ceros: ceros,
           buildRec: buildRec, build: build, queryRec: queryRec, query: query,
           updateRec: updateRec, update: update,
           segmentos: segmentos, vertices: vertices, padreDe: padreDe,
           rotulo: rotulo, memoria: memoria, alturaDe: alturaDe,
           simBuild: simBuild, simQuery: simQuery, simUpdate: simUpdate,
           estadoDeVertices: estadoDeVertices,
           vistaQuery: vistaQuery, vistaUpdate: vistaUpdate, faena: faena,
           costos: costos, gana: gana,
           cruceContraPrefijos: cruceContraPrefijos,
           cruceContraRecorrido: cruceContraRecorrido,
           CODIGO_BUILD: CODIGO_BUILD, CODIGO_QUERY: CODIGO_QUERY,
           CODIGO_UPDATE: CODIGO_UPDATE,
           layout: layout, dibujar: dibujar, tiraArreglo: tiraArreglo,
           montarOpciones: montarOpciones, sinRepetidos: sinRepetidos };
})();

if (typeof module !== "undefined") { module.exports = SEG; }
