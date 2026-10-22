/* Piezas comunes de los ejercicios de caminos mas cortos en un DAG y con Dijkstra.
   Reproducen, linea por linea, topoSort y ssspDAG (250325-agra-sssp-dag.py)
   y dijkstra y dijkstraST (250331-agra-dijkstra.py). Los numeros de linea son
   los de esos archivos. La cola de prioridad se guarda ordenada por pareja
   (distancia, vertice): heappop saca siempre la pareja menor, asi que la
   sucesion de salidas es la misma que la del monticulo de Python. */
var CDD = (function () {
  var INF = Infinity;

  function fmt(x) { return x === INF ? "∞" : String(x).replace("-", "−"); }
  function pred(p) { return p < 0 ? "-" : String(p); }

  function construir(n, aristas) {
    var G = [], i = 0;
    while (i < n) { G.push([]); i = i + 1; }
    aristas.forEach(function (a) { G[a[0]].push([a[1], a[2]]); });
    return G;
  }

  function llenar(n, x) { var a = [], i = 0; while (i < n) { a.push(x); i = i + 1; } return a; }

  /* ---- Codigo mostrado: txt es la linea del archivo; num null = sin conteo ---- */
  var CODIGO_DAG = [
    { num: null, txt: "# Kahn: G[u] tiene pares (v, peso)" },
    { num: 13, txt: "def topoSort(G):", bloque: 1 },
    { num: 14, txt: "  q, topo, inc = deque(), [], [0 for _ in range(len(G))]", bloque: 1 },
    { num: null, txt: "  # inc[v]: cuántas aristas llegan a v" },
    { num: 16, txt: "  for u in range(len(G)):", bloque: 1 },
    { num: 17, txt: "    for (v, _) in G[u]:", bloque: 1 },
    { num: 18, txt: "      inc[v] += 1", bloque: 1 },
    { num: null, txt: "  # sin aristas de entrada: van primero" },
    { num: 21, txt: "  for u in range(len(G)):", bloque: 1 },
    { num: 22, txt: "    if inc[u] == 0:", bloque: 1 },
    { num: 23, txt: "      q.append(u)", bloque: 1 },
    { num: 25, txt: "  while len(q) != 0:", bloque: 1 },
    { num: 26, txt: "    u = q.popleft()", bloque: 1 },
    { num: 27, txt: "    topo.append(u)", bloque: 1 },
    { num: null, txt: "    # quitar las aristas de u" },
    { num: 30, txt: "    for (v, _) in G[u]:", bloque: 1 },
    { num: 31, txt: "      inc[v] -= 1", bloque: 1 },
    { num: 32, txt: "      if inc[v] == 0:", bloque: 1 },
    { num: 33, txt: "        q.append(v)", bloque: 1 },
    { num: 34, txt: "  return topo", bloque: 1 },
    { num: null, txt: "" },
    { num: 37, txt: "def ssspDAG(G, s):", bloque: 2 },
    { num: 38, txt: "  dist, pred = [INF for _ in range(len(G))], [-1 for _ in range(len(G))]", bloque: 2 },
    { num: 39, txt: "  dist[s] = 0", bloque: 2 },
    { num: 41, txt: "  topo = topoSort(G)", bloque: 2 },
    { num: null, txt: "  # una pasada, en orden topológico" },
    { num: 43, txt: "  for u in topo:", bloque: 2 },
    { num: 44, txt: "    for (v, duv) in G[u]:", bloque: 2 },
    { num: null, txt: "      # relajar la arista (u, v)" },
    { num: 46, txt: "      if dist[u] + duv < dist[v]:", bloque: 2 },
    { num: 47, txt: "        dist[v] = dist[u] + duv", bloque: 2 },
    { num: 48, txt: "        pred[v] = u", bloque: 2 },
    { num: 49, txt: "  return dist, pred", bloque: 2 }
  ];

  var CODIGO_DIJKSTRA = [
    { num: 34, txt: "def dijkstra(G, s):", bloque: 1 },
    { num: 35, txt: "  dist = [INF for _ in range(len(G))] ; dist[s] = 0", bloque: 1 },
    { num: 36, txt: "  pred = [-1 for _ in range(len(G))]", bloque: 1 },
    { num: 37, txt: "  pqueue = list()", bloque: 1 },
    { num: null, txt: "  #for u in range(len(G)): heappush(pqueue, (dist[u], u))" },
    { num: 39, txt: "  heappush(pqueue, (dist[s], s))", bloque: 1 },
    { num: 41, txt: "  while len(pqueue)!=0:", bloque: 2 },
    { num: null, txt: "    # la pareja de menor distancia" },
    { num: 43, txt: "    du,u = heappop(pqueue)", bloque: 2 },
    { num: null, txt: "    # si no coincide, la pareja es vieja" },
    { num: 45, txt: "    if dist[u] == du:", bloque: 2 },
    { num: 46, txt: "      for v,duv in G[u]:", bloque: 3 },
    { num: null, txt: "        # si mejora, v entra otra vez" },
    { num: 48, txt: "        if du+duv<dist[v]:", bloque: 3 },
    { num: 49, txt: "          dist[v] = du+duv", bloque: 3 },
    { num: 50, txt: "          pred[v] = u", bloque: 3 },
    { num: 51, txt: "          heappush(pqueue, (dist[v], v))", bloque: 3 },
    { num: 52, txt: "  return dist", bloque: 1 }
  ];

  /* ---- topoSort + ssspDAG ---- */
  function simDAG(G, s) {
    var n = G.length, pasos = [], dist = null, pr = null, inc = null, q = [], topo = [], hechos = [];
    function paso(linea, extra) {
      var p = { linea: linea, dist: dist === null ? null : dist.slice(), pred: pr === null ? null : pr.slice(),
                inc: inc === null ? null : inc.slice(), q: q.slice(), topo: topo.slice(), hechos: hechos.slice(),
                u: null, v: null, w: null, suma: null, mejora: false, fase: linea <= 34 ? "topo" : "sssp" };
      var k;
      for (k in extra) { p[k] = extra[k]; }
      pasos.push(p);
    }
    var u, v, w, j, i, t;
    dist = llenar(n, INF); pr = llenar(n, -1);
    paso(38, {});
    dist[s] = 0;
    paso(39, {});
    paso(41, {});
    /* topoSort */
    inc = llenar(n, 0);
    paso(14, {});
    u = 0;
    while (u < n) {
      paso(16, { u: u });
      j = 0;
      while (j < G[u].length) {
        v = G[u][j][0];
        paso(17, { u: u, v: v, w: G[u][j][1] });
        inc[v] = inc[v] + 1;
        paso(18, { u: u, v: v, w: G[u][j][1] });
        j = j + 1;
      }
      u = u + 1;
    }
    u = 0;
    while (u < n) {
      paso(21, { u: u });
      paso(22, { u: u });
      if (inc[u] === 0) { q.push(u); paso(23, { u: u }); }
      u = u + 1;
    }
    while (q.length !== 0) {
      paso(25, {});
      u = q.shift();
      paso(26, { u: u });
      topo.push(u);
      paso(27, { u: u });
      j = 0;
      while (j < G[u].length) {
        v = G[u][j][0];
        paso(30, { u: u, v: v, w: G[u][j][1] });
        inc[v] = inc[v] - 1;
        paso(31, { u: u, v: v, w: G[u][j][1] });
        paso(32, { u: u, v: v, w: G[u][j][1] });
        if (inc[v] === 0) { q.push(v); paso(33, { u: u, v: v, w: G[u][j][1] }); }
        j = j + 1;
      }
    }
    paso(34, {});
    /* ssspDAG */
    i = 0;
    while (i < topo.length) {
      u = topo[i];
      paso(43, { u: u });
      j = 0;
      while (j < G[u].length) {
        v = G[u][j][0]; w = G[u][j][1];
        paso(44, { u: u, v: v, w: w });
        t = dist[u] + w;
        paso(46, { u: u, v: v, w: w, suma: t });
        if (t < dist[v]) {
          dist[v] = t;
          paso(47, { u: u, v: v, w: w, suma: t, mejora: true });
          pr[v] = u;
          paso(48, { u: u, v: v, w: w, suma: t, mejora: true });
        }
        j = j + 1;
      }
      hechos.push(u);
      i = i + 1;
    }
    paso(49, {});
    return pasos;
  }

  function resumenDAG(G, s) {
    var pasos = simDAG(G, s), ult = pasos[pasos.length - 1], ex = 0, me = 0;
    pasos.forEach(function (p) { if (p.linea === 46) { ex = ex + 1; } if (p.linea === 47) { me = me + 1; } });
    return { dist: ult.dist, pred: ult.pred, topo: ult.topo, examinadas: ex, mejoras: me };
  }

  /* Bellman-Ford con parada: se repite la ronda hasta que una no cambia nada. */
  function bf(G, s) {
    var n = G.length, dist = llenar(n, INF), cambio = true, rondas = 0, ex = 0, me = 0, u, j, v, w;
    dist[s] = 0;
    while (cambio) {
      cambio = false; rondas = rondas + 1; u = 0;
      while (u < n) {
        j = 0;
        while (j < G[u].length) {
          v = G[u][j][0]; w = G[u][j][1]; ex = ex + 1;
          if (dist[u] !== INF && dist[u] + w < dist[v]) { dist[v] = dist[u] + w; me = me + 1; cambio = true; }
          j = j + 1;
        }
        u = u + 1;
      }
    }
    return { dist: dist, rondas: rondas, examinadas: ex, mejoras: me };
  }

  /* ---- Cola de prioridad: parejas [distancia, vertice] ---- */
  function cmp(a, b) { return a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]; }
  function meter(cola, par) { cola.push(par); cola.sort(cmp); }

  /* dijkstra, uno a todos, con un paso por linea ejecutada. */
  function simDijkstra(G, s) {
    var n = G.length, pasos = [], dist = null, pr = null, cola = [], orden = [], du = null, u = null, v = null, w = null, vieja = false;
    function paso(linea, extra) {
      var p = { linea: linea, dist: dist === null ? null : dist.slice(), pred: pr === null ? null : pr.slice(),
                cola: cola.map(function (x) { return x.slice(); }), orden: orden.slice(), du: du, u: u, v: v, w: w, vieja: vieja, acepta: false };
      var k;
      for (k in extra) { p[k] = extra[k]; }
      pasos.push(p);
    }
    var j, par, suma;
    dist = llenar(n, INF); dist[s] = 0;
    paso(35, {});
    pr = llenar(n, -1);
    paso(36, {});
    paso(37, {});
    meter(cola, [dist[s], s]);
    paso(39, {});
    while (cola.length !== 0) {
      paso(41, {});
      par = cola.shift(); du = par[0]; u = par[1]; v = null; w = null; vieja = false;
      paso(43, {});
      vieja = dist[u] !== du;
      if (!vieja) { orden.push(u); }
      paso(45, { acepta: !vieja });
      if (!vieja) {
        j = 0;
        while (j < G[u].length) {
          v = G[u][j][0]; w = G[u][j][1];
          paso(46, { acepta: true });
          suma = du + w;
          paso(48, { acepta: true, suma: suma });
          if (suma < dist[v]) {
            dist[v] = suma;
            paso(49, { acepta: true, suma: suma, mejora: true });
            pr[v] = u;
            paso(50, { acepta: true, suma: suma, mejora: true });
            meter(cola, [dist[v], v]);
            paso(51, { acepta: true, suma: suma, mejora: true });
          }
          j = j + 1;
        }
      }
      v = null; w = null; u = null; du = null;
    }
    paso(52, { u: null, du: null });
    return pasos;
  }

  /* dijkstra y dijkstraST sin pasos: devuelven resultado, extracciones y registro de la cola. */
  function dijkstraTodos(G, s) {
    var n = G.length, dist = llenar(n, INF), pr = llenar(n, -1), cola = [], veces = llenar(n, 0), ext = [], push = [], pop = [], par, j, v, suma;
    dist[s] = 0; meter(cola, [0, s]); push.push([0, s]);
    while (cola.length !== 0) {
      par = cola.shift(); pop.push(par.slice());
      var acepta = dist[par[1]] === par[0];
      ext.push({ u: par[1], du: par[0], acepta: acepta });
      if (acepta) {
        veces[par[1]] = veces[par[1]] + 1; j = 0;
        while (j < G[par[1]].length) {
          v = G[par[1]][j][0]; suma = par[0] + G[par[1]][j][1];
          if (suma < dist[v]) { dist[v] = suma; pr[v] = par[1]; meter(cola, [suma, v]); push.push([suma, v]); }
          j = j + 1;
        }
      }
    }
    return { dist: dist, pred: pr, veces: veces, ext: ext, push: push, pop: pop };
  }

  function dijkstraST(G, s, t) {
    var n = G.length, dist = llenar(n, INF), cola = [], encontrado = false, ext = [], push = [], pop = [], par, j, v, suma;
    dist[s] = 0; meter(cola, [0, s]); push.push([0, s]);
    while (cola.length !== 0 && !encontrado) {
      par = cola.shift(); pop.push(par.slice());
      if (par[1] === t) {
        encontrado = true; ext.push({ u: par[1], du: par[0], acepta: true, esT: true });
      } else {
        var acepta = dist[par[1]] === par[0];
        ext.push({ u: par[1], du: par[0], acepta: acepta, esT: false });
        if (acepta) {
          j = 0;
          while (j < G[par[1]].length) {
            v = G[par[1]][j][0]; suma = par[0] + G[par[1]][j][1];
            if (suma < dist[v]) { dist[v] = suma; meter(cola, [suma, v]); push.push([suma, v]); }
            j = j + 1;
          }
        }
      }
    }
    return { valor: dist[t], ext: ext, push: push, pop: pop };
  }

  /* Lista de aristas en texto: "u→v (w)". */
  function textoAristas(aristas) {
    return aristas.map(function (a) { return a[0] + "→" + a[1] + " (" + fmt(a[2]) + ")"; }).join(", ");
  }

  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  return { INF: INF, fmt: fmt, pred: pred, construir: construir, llenar: llenar, CODIGO_DAG: CODIGO_DAG, CODIGO_DIJKSTRA: CODIGO_DIJKSTRA,
           simDAG: simDAG, resumenDAG: resumenDAG, bf: bf, simDijkstra: simDijkstra, dijkstraTodos: dijkstraTodos,
           dijkstraST: dijkstraST, textoAristas: textoAristas, esc: esc };
})();

if (typeof module !== "undefined") { module.exports = CDD; }
