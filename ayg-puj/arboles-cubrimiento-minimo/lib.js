/* Piezas comunes de los ejercicios de arboles de cubrimiento minimo.
   Reproducen, linea por linea, kruskal (kruskal.py) y prim con sus dos
   versiones (prim.py). Los numeros de linea son los de esos archivos.
   Los conjuntos disjuntos llevan union por rango y compresion de caminos,
   igual que union_find.py, de modo que p y rango se pueden mirar paso a paso.
   La cola de prioridad guarda parejas (clave, vertice) ordenadas: heappop
   saca la menor, asi que la sucesion de salidas es la del monticulo. */
var MST = (function () {
  var INF = Infinity;

  function fmt(x) { return x === INF ? "∞" : String(x); }
  function pad(x) { return x === null ? "–" : String(x); }

  function llenar(n, x) { var a = [], i = 0; while (i < n) { a.push(x); i = i + 1; } return a; }

  /* Listas de adyacencia: G[u] trae parejas [v, peso], en el orden en que las
     aristas llegan, que es el orden en que prim recorre los vecinos. */
  function adyacencia(n, aristas) {
    var G = [], i = 0;
    while (i < n) { G.push([]); i = i + 1; }
    aristas.forEach(function (a) { G[a[0]].push([a[1], a[2]]); G[a[1]].push([a[0], a[2]]); });
    return G;
  }

  /* ---- Conjuntos disjuntos (union_find.py) ---- */
  function makeSet(p, rango, x) { p[x] = x; rango[x] = 0; }

  function findSet(p, x) {
    if (p[x] !== x) { p[x] = findSet(p, p[x]); }
    return p[x];
  }

  function union(p, rango, x, y) {
    var rx = findSet(p, x), ry = findSet(p, y);
    if (rx !== ry) {
      if (rango[rx] < rango[ry]) { p[rx] = ry; }
      else if (rango[rx] > rango[ry]) { p[ry] = rx; }
      else { p[ry] = rx; rango[rx] = rango[rx] + 1; }
    }
  }

  /* Los pedazos que hay ahora, leidos de p sin tocarlo. */
  function pedazos(p) {
    var raiz = {}, lista = [], v = 0;
    function raizDe(x) { var y = x; while (p[y] !== y) { y = p[y]; } return y; }
    while (v < p.length) {
      if (p[v] !== null && p[v] !== undefined) {
        var r = raizDe(v);
        if (raiz[r] === undefined) { raiz[r] = lista.length; lista.push([]); }
        lista[raiz[r]].push(v);
      }
      v = v + 1;
    }
    lista.sort(function (a, b) { return a[0] - b[0]; });
    return lista;
  }

  function textoPedazos(p) {
    return pedazos(p).map(function (c) { return "{" + c.join(",") + "}"; }).join(" ");
  }

  function textoP(p) {
    var s = [], v = 0;
    while (v < p.length) { s.push(v + ":" + p[v]); v = v + 1; }
    return "{" + s.join(", ") + "}";
  }

  /* sorted(aristas, key=lambda e: e[2]): el orden entre pesos iguales es el de
     la lista, porque los dos ordenamientos son estables. */
  function ordenar(aristas) {
    return aristas.slice().sort(function (a, b) { return a[2] - b[2]; });
  }

  function textoAristas(aristas) {
    return aristas.map(function (a) { return "(" + a[0] + "," + a[1] + "," + a[2] + ")"; }).join(" ");
  }

  /* ---- Codigo mostrado: txt es la linea del archivo; num null = sin conteo ---- */
  var CODIGO_KRUSKAL = [
    { num: null, txt: "# find_set y union viven en union_find.py" },
    { num: null, txt: "# y dejan su rastro en p y en rango" },
    { num: 32, txt: "def kruskal(V, aristas):", bloque: 1 },
    { num: 33, txt: "  ordenadas = sorted(aristas, key=lambda e: e[2])", bloque: 1 },
    { num: 34, txt: "  p = {}", bloque: 1 },
    { num: 35, txt: "  rango = {}", bloque: 1 },
    { num: 36, txt: "  for v in V:", bloque: 1 },
    { num: 37, txt: "    make_set(p, rango, v)", bloque: 1 },
    { num: 38, txt: "  mst = []", bloque: 1 },
    { num: 39, txt: "  peso = 0", bloque: 1 },
    { num: 40, txt: "  i = 0", bloque: 1 },
    { num: 41, txt: "  while i < len(ordenadas) and len(mst) < len(V) - 1:", bloque: 2 },
    { num: 42, txt: "    u, v, w = ordenadas[i]", bloque: 2 },
    { num: 43, txt: "    if find_set(p, u) != find_set(p, v):", bloque: 2 },
    { num: 44, txt: "      union(p, rango, u, v)", bloque: 3 },
    { num: 45, txt: "      mst.append((u, v, w))", bloque: 3 },
    { num: 46, txt: "      peso = peso + w", bloque: 3 },
    { num: 47, txt: "    i = i + 1", bloque: 2 },
    { num: 48, txt: "  return mst, peso", bloque: 1 }
  ];

  var CODIGO_PRIM = [
    { num: 12, txt: "def extraer_minimo(clave, en_mst):", bloque: 1 },
    { num: 13, txt: "  minimo = None ; mejor = INFTY", bloque: 1 },
    { num: 14, txt: "  for v in clave:", bloque: 1 },
    { num: 15, txt: "    if not en_mst[v] and clave[v] < mejor:", bloque: 1 },
    { num: 16, txt: "      mejor = clave[v] ; minimo = v", bloque: 1 },
    { num: 17, txt: "  return minimo", bloque: 1 },
    { num: null, txt: "" },
    { num: 20, txt: "def prim(grafo, raiz):", bloque: 2 },
    { num: 21, txt: "  clave = {} ; padre = {} ; en_mst = {}", bloque: 2 },
    { num: 22, txt: "  for v in grafo:", bloque: 2 },
    { num: 23, txt: "    clave[v] = INFTY ; padre[v] = None ; en_mst[v] = False", bloque: 2 },
    { num: 24, txt: "  clave[raiz] = 0", bloque: 2 },
    { num: 25, txt: "  peso = 0", bloque: 2 },
    { num: 26, txt: "  restantes = len(grafo)", bloque: 2 },
    { num: 27, txt: "  while restantes > 0:", bloque: 3 },
    { num: 28, txt: "    u = extraer_minimo(clave, en_mst)", bloque: 3 },
    { num: 29, txt: "    if u is None:", bloque: 3 },
    { num: 30, txt: "      restantes = 0", bloque: 3 },
    { num: 32, txt: "      en_mst[u] = True", bloque: 4 },
    { num: 33, txt: "      if padre[u] is not None:", bloque: 4 },
    { num: 34, txt: "        peso = peso + clave[u]", bloque: 4 },
    { num: 35, txt: "      for (v, w) in grafo[u]:", bloque: 4 },
    { num: 36, txt: "        if not en_mst[v] and w < clave[v]:", bloque: 4 },
    { num: 37, txt: "          clave[v] = w ; padre[v] = u", bloque: 4 },
    { num: 38, txt: "      restantes = restantes - 1", bloque: 4 },
    { num: 39, txt: "  return padre, peso", bloque: 2 }
  ];

  /* ---- kruskal paso a paso ---- */
  function simKruskal(n, aristas) {
    var pasos = [], ordenadas = null, p = llenar(n, null), rango = llenar(n, null);
    var mst = null, peso = null, i = null, u = null, v = null, w = null;
    var fu = null, fv = null, decide = null;
    function paso(linea) {
      pasos.push({ linea: linea, p: p.slice(), rango: rango.slice(),
                   ordenadas: ordenadas === null ? null : ordenadas.slice(),
                   mst: mst === null ? null : mst.slice(), peso: peso, i: i,
                   u: u, v: v, w: w, fu: fu, fv: fv, decide: decide });
    }
    var k;
    ordenadas = ordenar(aristas);
    paso(33);
    paso(34);
    paso(35);
    k = 0;
    while (k < n) {
      paso(36);
      makeSet(p, rango, k);
      paso(37);
      k = k + 1;
    }
    mst = []; paso(38);
    peso = 0; paso(39);
    i = 0; paso(40);
    while (i < ordenadas.length && mst.length < n - 1) {
      u = null; v = null; w = null; fu = null; fv = null; decide = null;
      paso(41);
      u = ordenadas[i][0]; v = ordenadas[i][1]; w = ordenadas[i][2];
      paso(42);
      fu = findSet(p, u); fv = findSet(p, v);
      decide = fu !== fv ? "entra" : "descarta";
      paso(43);
      if (fu !== fv) {
        union(p, rango, u, v);
        paso(44);
        mst.push([u, v, w]);
        paso(45);
        peso = peso + w;
        paso(46);
      }
      i = i + 1;
      paso(47);
    }
    u = null; v = null; w = null; fu = null; fv = null; decide = null;
    paso(41);
    paso(48);
    return pasos;
  }

  /* kruskal sin pasos: lo que entra, lo que se descarta y donde para. */
  function resumenKruskal(n, aristas) {
    var ordenadas = ordenar(aristas), p = llenar(n, null), rango = llenar(n, null);
    var mst = [], peso = 0, i = 0, mirada = [], u, v, w, entra;
    var k = 0;
    while (k < n) { makeSet(p, rango, k); k = k + 1; }
    while (i < ordenadas.length && mst.length < n - 1) {
      u = ordenadas[i][0]; v = ordenadas[i][1]; w = ordenadas[i][2];
      entra = findSet(p, u) !== findSet(p, v);
      if (entra) { union(p, rango, u, v); mst.push([u, v, w]); peso = peso + w; }
      mirada.push({ arista: [u, v, w], entra: entra, puesto: i + 1 });
      i = i + 1;
    }
    return { ordenadas: ordenadas, mirada: mirada, mst: mst, peso: peso,
             miradas: mirada.length, p: p, rango: rango,
             descartadas: mirada.filter(function (m) { return !m.entra; }).length,
             cierra: mirada.length, completo: mst.length === n - 1 };
  }

  /* ---- prim con busqueda lineal, paso a paso ---- */
  function simPrim(G, raiz) {
    var n = G.length, pasos = [], clave = llenar(n, null), padre = llenar(n, null);
    var enMst = llenar(n, null), peso = null, restantes = null, orden = [];
    var u = null, vv = null, ww = null, minimo = null, mejor = null, baja = false;
    function paso(linea) {
      pasos.push({ linea: linea, clave: clave.slice(), padre: padre.slice(), enMst: enMst.slice(),
                   peso: peso, restantes: restantes, u: u, v: vv, w: ww,
                   minimo: minimo, mejor: mejor === INF ? "∞" : mejor,
                   baja: baja, orden: orden.slice() });
    }
    var k, j;
    paso(21);
    k = 0;
    while (k < n) {
      paso(22);
      clave[k] = INF; padre[k] = null; enMst[k] = false;
      paso(23);
      k = k + 1;
    }
    clave[raiz] = 0; paso(24);
    peso = 0; paso(25);
    restantes = n; paso(26);
    while (restantes > 0) {
      u = null; vv = null; ww = null; baja = false;
      paso(27);
      /* extraer_minimo */
      minimo = null; mejor = INF;
      paso(13);
      k = 0;
      while (k < n) {
        vv = k;
        paso(14);
        paso(15);
        if (!enMst[k] && clave[k] < mejor) {
          mejor = clave[k]; minimo = k;
          paso(16);
        }
        k = k + 1;
      }
      vv = null;
      paso(17);
      u = minimo;
      paso(28);
      paso(29);
      if (u === null) {
        restantes = 0;
        paso(30);
      } else {
        enMst[u] = true; orden.push(u);
        paso(32);
        paso(33);
        if (padre[u] !== null) {
          peso = peso + clave[u];
          paso(34);
        }
        j = 0;
        while (j < G[u].length) {
          vv = G[u][j][0]; ww = G[u][j][1]; baja = false;
          paso(35);
          paso(36);
          if (!enMst[vv] && ww < clave[vv]) {
            clave[vv] = ww; padre[vv] = u; baja = true;
            paso(37);
          }
          j = j + 1;
        }
        vv = null; ww = null; baja = false;
        restantes = restantes - 1;
        paso(38);
      }
    }
    u = null; minimo = null; mejor = null;
    paso(27);
    paso(39);
    return pasos;
  }

  /* prim sin pasos: orden de extraccion, aristas del arbol y peso. */
  function resumenPrim(G, raiz) {
    var n = G.length, clave = llenar(n, INF), padre = llenar(n, null), enMst = llenar(n, false);
    var peso = 0, restantes = n, orden = [], aristas = [], u, j, v, w, mejor, k;
    clave[raiz] = 0;
    while (restantes > 0) {
      u = null; mejor = INF; k = 0;
      while (k < n) { if (!enMst[k] && clave[k] < mejor) { mejor = clave[k]; u = k; } k = k + 1; }
      if (u === null) {
        restantes = 0;
      } else {
        enMst[u] = true; orden.push(u);
        if (padre[u] !== null) { peso = peso + clave[u]; aristas.push([padre[u], u, clave[u]]); }
        j = 0;
        while (j < G[u].length) {
          v = G[u][j][0]; w = G[u][j][1];
          if (!enMst[v] && w < clave[v]) { clave[v] = w; padre[v] = u; }
          j = j + 1;
        }
        restantes = restantes - 1;
      }
    }
    return { orden: orden, padre: padre, clave: clave, peso: peso, aristas: aristas,
             pasadas: orden.length * n };
  }

  /* ---- prim con cola de prioridad: lo que entra, lo que sale y lo viejo ---- */
  function cmp(a, b) { return a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]; }

  function primCola(G, raiz) {
    var n = G.length, clave = llenar(n, INF), padre = llenar(n, null), enMst = llenar(n, false);
    var cola = [], entran = [], salen = [], peso = 0, par, u, cu, j, v, w;
    clave[raiz] = 0;
    cola.push([0, raiz]); entran.push([0, raiz]);
    while (cola.length !== 0) {
      cola.sort(cmp);
      par = cola.shift(); cu = par[0]; u = par[1];
      salen.push({ par: [cu, u], vieja: enMst[u] });
      if (!enMst[u]) {
        enMst[u] = true;
        peso = peso + cu;
        j = 0;
        while (j < G[u].length) {
          v = G[u][j][0]; w = G[u][j][1];
          if (!enMst[v] && w < clave[v]) {
            clave[v] = w; padre[v] = u;
            cola.push([clave[v], v]); entran.push([clave[v], v]);
          }
          j = j + 1;
        }
      }
    }
    return { entran: entran, salen: salen, peso: peso, padre: padre,
             viejas: salen.filter(function (s) { return s.vieja; }).length };
  }

  /* ---- Cuantos arboles de cubrimiento tiene un grafo ----
     Teorema de Kirchhoff: el determinante de un cofactor del laplaciano.
     Se calcula con el metodo de Bareiss, que divide exacto y se queda en los
     enteros, asi que el resultado no arrastra error de redondeo. */
  function contarArboles(n, aristas) {
    var L = [], i = 0, j, k, r, piv, signo = 1, prev = 1, M = [];
    while (i < n) { L.push(llenar(n, 0)); i = i + 1; }
    aristas.forEach(function (a) {
      L[a[0]][a[0]] = L[a[0]][a[0]] + 1;
      L[a[1]][a[1]] = L[a[1]][a[1]] + 1;
      L[a[0]][a[1]] = L[a[0]][a[1]] - 1;
      L[a[1]][a[0]] = L[a[1]][a[0]] - 1;
    });
    i = 1;
    while (i < n) { M.push(L[i].slice(1)); i = i + 1; }
    var m = n - 1, cero = false;
    k = 0;
    while (k < m - 1 && !cero) {
      if (M[k][k] === 0) {
        piv = -1; r = k + 1;
        while (r < m) { if (M[r][k] !== 0 && piv < 0) { piv = r; } r = r + 1; }
        if (piv < 0) { cero = true; } else {
          var t = M[k]; M[k] = M[piv]; M[piv] = t; signo = -signo;
        }
      }
      if (!cero) {
        i = k + 1;
        while (i < m) {
          j = k + 1;
          while (j < m) {
            M[i][j] = (M[i][j] * M[k][k] - M[i][k] * M[k][j]) / prev;
            j = j + 1;
          }
          i = i + 1;
        }
        prev = M[k][k];
        k = k + 1;
      }
    }
    return cero ? 0 : signo * M[m - 1][m - 1];
  }

  /* Las aristas que cruzan el corte (S, V menos S) y las mas baratas de ellas. */
  function corte(aristas, S) {
    var dentroS = {}, cruzan = [], dentro = [], fuera = [], menor = INF;
    S.forEach(function (v) { dentroS[v] = true; });
    aristas.forEach(function (a, i) {
      var au = dentroS[a[0]] === true, av = dentroS[a[1]] === true;
      if (au !== av) { cruzan.push(i); if (a[2] < menor) { menor = a[2]; } }
      else if (au && av) { dentro.push(i); }
      else { fuera.push(i); }
    });
    return { cruzan: cruzan, dentro: dentro, fuera: fuera, menor: menor,
             ligeras: cruzan.filter(function (i) { return aristas[i][2] === menor; }) };
  }

  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  return { INF: INF, fmt: fmt, pad: pad, llenar: llenar, adyacencia: adyacencia,
           makeSet: makeSet, findSet: findSet, union: union, pedazos: pedazos,
           textoPedazos: textoPedazos, textoP: textoP, ordenar: ordenar, textoAristas: textoAristas,
           CODIGO_KRUSKAL: CODIGO_KRUSKAL, CODIGO_PRIM: CODIGO_PRIM,
           simKruskal: simKruskal, resumenKruskal: resumenKruskal,
           simPrim: simPrim, resumenPrim: resumenPrim, primCola: primCola,
           contarArboles: contarArboles, corte: corte, esc: esc };
})();

if (typeof module !== "undefined") { module.exports = MST; }
