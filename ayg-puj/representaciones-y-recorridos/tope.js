/* Ejercicio interactivo: UVa 336, recorrido en amplitud con tope de pasos.
   El codigo que se simula es el de la sesion, con el mismo orden de la cola:
   los indices salen de la primera aparicion de cada numero en la entrada. */
var EJERCICIO = (function () {
  var CODIGO = [
    { txt: "def bfs(adj, inicio, ttl):",                       num: null },
    { txt: "    dist = [-1] * len(adj)",                       num: 1 },
    { txt: "    cola = deque()",                               num: 2 },
    { txt: "    dist[inicio] = 0",                             num: 3 },
    { txt: "    cola.append(inicio)",                          num: 4 },
    { txt: "    alcanzados = 1",                               num: 5 },
    { txt: "    while len(cola) > 0:",                         num: 6,  bloque: 1 },
    { txt: "        u = cola.popleft()",                       num: 7,  bloque: 1 },
    { txt: "        if dist[u] < ttl:",                        num: 8,  bloque: 1 },
    { txt: "            for v in adj[u]:",                     num: 9,  bloque: 1 },
    { txt: "                if dist[v] == -1:",                num: 10, bloque: 1 },
    { txt: "                    dist[v] = dist[u] + 1",        num: 11, bloque: 1 },
    { txt: "                    alcanzados = alcanzados + 1",  num: 12, bloque: 1 },
    { txt: "                    cola.append(v)",               num: 13, bloque: 1 },
    { txt: "    return alcanzados",                            num: 14 },
    { txt: "",                                                 num: null },
    { txt: "alcanzados = 0",                                   num: 15, bloque: 2 },
    { txt: "if nodo in indice:",                               num: 16, bloque: 2 },
    { txt: "    alcanzados = bfs(adj, indice[nodo], ttl)",     num: 17, bloque: 2 },
    { txt: "salida.append('Case ' + str(caso) + ': ' + str(len(adj) - alcanzados)", num: 18, bloque: 2 },
    { txt: "              + ' nodes not reachable from node ' + str(nodo)",         num: null, bloque: 2 },
    { txt: "              + ' with TTL = ' + str(ttl) + '.')",                      num: null, bloque: 2 }
  ];

  var X = [50, 140, 230, 320, 410, 500];

  var REDES = [
    { pares: [[10, 15], [15, 20], [20, 25], [10, 30], [30, 47], [47, 50], [25, 45], [45, 65],
              [15, 35], [35, 55], [20, 40], [50, 55], [35, 40], [55, 60], [40, 60], [60, 65]],
      pos: { 10: [X[0], 35], 15: [X[1], 35], 20: [X[2], 35], 25: [X[3], 35], 45: [X[4], 35], 65: [X[5], 35],
             30: [X[0], 125], 35: [X[1], 125], 40: [X[2], 125],
             47: [X[0], 215], 50: [X[1], 215], 55: [X[2], 215], 60: [X[3], 215] } },
    { pares: [[1, 2], [2, 7], [1, 3], [3, 4], [3, 5], [5, 10], [5, 11],
              [4, 6], [7, 6], [7, 8], [7, 9], [8, 9], [8, 6], [6, 11]],
      pos: { 1: [X[0], 30], 2: [X[1], 30], 7: [X[2], 30], 9: [X[4], 30],
             3: [X[0], 105], 4: [X[1], 105], 6: [X[2], 105], 8: [X[3], 105],
             5: [X[0], 175], 11: [X[2], 175], 10: [X[1], 225] } }
  ];

  var PRESETS = [
    { nombre: "35 con TTL 2", red: 0, nodo: 35, ttl: 2 },
    { nombre: "35 con TTL 3", red: 0, nodo: 35, ttl: 3 },
    { nombre: "1 con TTL 1", red: 1, nodo: 1, ttl: 1 },
    { nombre: "1 con TTL 2", red: 1, nodo: 1, ttl: 2 },
    { nombre: "3 con TTL 2", red: 1, nodo: 3, ttl: 2 },
    { nombre: "3 con TTL 3", red: 1, nodo: 3, ttl: 3 },
    { nombre: "35 con TTL 0", red: 0, nodo: 35, ttl: 0 },
    { nombre: "99, que no está", red: 1, nodo: 99, ttl: 2 }
  ];

  /* El diccionario de numero a indice y la lista de adyacencia, como indiceDe. */
  function construir(pares) {
    var indice = {}, numeros = [], adj = [], i = 0;
    function indiceDe(nodo) {
      if (!Object.prototype.hasOwnProperty.call(indice, nodo)) {
        indice[nodo] = numeros.length;
        numeros.push(nodo);
        adj.push([]);
      }
      return indice[nodo];
    }
    while (i < pares.length) {
      var ia = indiceDe(pares[i][0]), ib = indiceDe(pares[i][1]);
      adj[ia].push(ib);
      adj[ib].push(ia);
      i = i + 1;
    }
    return { indice: indice, numeros: numeros, adj: adj };
  }

  function esta(g, nodo) { return Object.prototype.hasOwnProperty.call(g.indice, nodo); }

  function simular(params) {
    var q = PRESETS[params.p], g = construir(REDES[q.red].pares), adj = g.adj, ttl = q.ttl;
    var pasos = [], dist = null, cola = [], u = null, v = null, alcanzados = null;
    var expandidos = [], sinExpandir = [];

    function foto(linea, extra) {
      var s = { linea: linea, dist: dist === null ? null : dist.slice(), cola: cola.slice(),
                u: u === null ? "–" : g.numeros[u], v: v === null ? "–" : g.numeros[v],
                actual: u, mirando: v,
                ttl: ttl, alcanzados: alcanzados === null ? "–" : alcanzados,
                expandidos: expandidos.slice(), sinExpandir: sinExpandir.slice() };
      var c;
      for (c in extra) { if (Object.prototype.hasOwnProperty.call(extra, c)) { s[c] = extra[c]; } }
      pasos.push(s);
    }

    alcanzados = 0; foto(15, {});
    foto(16, { aviso: esta(g, q.nodo) ? "" : "El nodo " + q.nodo + " no aparece en ninguna conexión: no hay recorrido y ningún nodo es alcanzable." });
    if (esta(g, q.nodo)) {
      alcanzados = null;
      dist = [];
      var t = 0;
      while (t < adj.length) { dist.push(-1); t = t + 1; }
      foto(1, {});
      foto(2, {});
      dist[g.indice[q.nodo]] = 0; foto(3, {});
      cola.push(g.indice[q.nodo]); foto(4, {});
      alcanzados = 1; foto(5, {});
      foto(6, {});
      while (cola.length > 0) {
        u = cola.shift(); v = null; foto(7, {});
        if (dist[u] < ttl) {
          expandidos.push(u);
          foto(8, { aviso: "dist[u] = " + dist[u] + " es menor que el TTL: se revisan sus vecinos." });
          var i = 0;
          while (i < adj[u].length) {
            v = adj[u][i];
            foto(9, {});
            if (dist[v] === -1) {
              foto(10, {});
              dist[v] = dist[u] + 1; foto(11, {});
              alcanzados = alcanzados + 1; foto(12, {});
              cola.push(v); foto(13, {});
            } else {
              foto(10, { aviso: "El nodo " + g.numeros[v] + " ya tiene distancia: la primera vez que se le tocó fue por el camino más corto." });
            }
            i = i + 1;
          }
          v = null;
        } else {
          sinExpandir.push(u);
          foto(8, { aviso: "dist[u] = " + dist[u] + " ya es el TTL: el nodo cuenta como alcanzado, pero el mensaje no sale de él." });
        }
        foto(6, {});
      }
      u = null;
      foto(14, {});
      foto(17, {});
    }
    foto(18, { respuesta: adj.length - alcanzados });
    return pasos;
  }

  function respuesta(p) {
    var ps = simular({ p: p });
    return ps[ps.length - 1].respuesta;
  }

  function alcanzadosDe(p) {
    var g = construir(REDES[PRESETS[p].red].pares);
    return g.adj.length - respuesta(p);
  }

  function totalDe(p) { return construir(REDES[PRESETS[p].red].pares).adj.length; }

  /* Expande tambien los nodos a distancia TTL: dist[u] <= ttl. */
  function conMenorIgual(pares, nodo, ttl) {
    var g = construir(pares), dist = [], filas = [], t = 0;
    if (!esta(g, nodo)) { return { respuesta: g.adj.length, filas: [] }; }
    while (t < g.adj.length) { dist.push(-1); t = t + 1; }
    var cola = [g.indice[nodo]], alcanzados = 1;
    dist[g.indice[nodo]] = 0;
    while (cola.length > 0) {
      var u = cola.shift(), entran = [], fuera = dist[u] >= ttl;
      if (dist[u] <= ttl) {
        var i = 0;
        while (i < g.adj[u].length) {
          var w = g.adj[u][i];
          if (dist[w] === -1) {
            dist[w] = dist[u] + 1;
            alcanzados = alcanzados + 1;
            cola.push(w);
            entran.push(g.numeros[w]);
          }
          i = i + 1;
        }
      }
      filas.push({ sale: g.numeros[u], dist: dist[u], entran: entran, mal: fuera && entran.length > 0 });
    }
    return { respuesta: g.adj.length - alcanzados, filas: filas };
  }

  /* Marca y cuenta al sacar de la cola: un nodo con dos vecinos ya en la cola
     entra dos veces y se cuenta dos veces. */
  function marcandoTarde(pares, nodo, ttl) {
    var g = construir(pares), dist = [], filas = [], t = 0, visto = {};
    if (!esta(g, nodo)) { return { respuesta: g.adj.length, filas: [] }; }
    while (t < g.adj.length) { dist.push(-1); t = t + 1; }
    var cola = [[g.indice[nodo], 0]], alcanzados = 0;
    while (cola.length > 0) {
      var par = cola.shift(), u = par[0], d = par[1], entran = [];
      dist[u] = d;
      alcanzados = alcanzados + 1;
      if (d < ttl) {
        var i = 0;
        while (i < g.adj[u].length) {
          var w = g.adj[u][i];
          if (dist[w] === -1) {
            cola.push([w, d + 1]);
            entran.push(g.numeros[w]);
          }
          i = i + 1;
        }
      }
      filas.push({ sale: g.numeros[u], dist: d, entran: entran, mal: visto[u] === true });
      visto[u] = true;
    }
    return { respuesta: g.adj.length - alcanzados, filas: filas };
  }

  return { codigo: CODIGO, REDES: REDES, PRESETS: PRESETS, construir: construir, simular: simular,
           respuesta: respuesta, alcanzadosDe: alcanzadosDe, totalDe: totalDe,
           conMenorIgual: conMenorIgual, marcandoTarde: marcandoTarde };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, params = { p: 0 }, errorActivo = "";
    function el(id) { return document.getElementById(id); }
    function consulta() { return E.PRESETS[params.p]; }

    function dibujar(a) {
      var q = consulta(), red = E.REDES[q.red], g = E.construir(red.pares);
      var pos = g.numeros.map(function (x) { return red.pos[x]; });
      var aristas = red.pares.map(function (p) { return [g.indice[p[0]], g.indice[p[1]], ""]; });
      el("panel-grafo").innerHTML = GRAFOSVG.dibujar({
        n: g.numeros.length, pos: pos, aristas: aristas, dirigido: false, maxAncho: 620,
        nombre: function (i) { return g.numeros[i]; },
        arista: function (i) {
          var r = aristas[i], ve = a.actual !== null && a.mirando !== null && a.mirando !== undefined &&
            ((r[0] === a.actual && r[1] === a.mirando) || (r[1] === a.actual && r[0] === a.mirando));
          return ve ? { color: "ambar", grueso: 3.5 } : { color: "claro", grueso: 2 };
        },
        nodo: function (i) {
          var d = a.dist ? a.dist[i] : -1, s = {};
          if (d >= 0) { s.nota = "d=" + d; }
          if (a.expandidos && a.expandidos.indexOf(i) >= 0) { s.relleno = "#e3edf8"; s.borde = "#1f5fa8"; }
          else if (a.sinExpandir && a.sinExpandir.indexOf(i) >= 0) { s.relleno = "#e7f2e8"; s.borde = "#2e7d32"; }
          else if (a.cola && a.cola.indexOf(i) >= 0) { s.relleno = "#fdf1dc"; s.borde = "#c77c0e"; }
          if (a.actual === i) { s.grueso = 4.5; s.borde = "#24292f"; }
          return s;
        }
      });
    }

    function alPintar(e) {
      var a = e.actual || { dist: null, cola: [], actual: null, mirando: null };
      var g = E.construir(E.REDES[consulta().red].pares);
      dibujar(a);
      el("ver-cola").innerHTML = (a.cola && a.cola.length > 0) ?
        a.cola.map(function (i) { return "<span class='ficha'>" + g.numeros[i] + "</span>"; }).join("") :
        "<span class='nota' style='margin:0'>vacía</span>";
      el("ver-aviso").textContent = a.aviso || "";
      if (e.terminado) {
        el("ver-final").textContent = "Respuesta: " + E.respuesta(params.p) + " nodes not reachable from node " +
          consulta().nodo + " with TTL = " + consulta().ttl + ".";
      } else {
        el("ver-final").textContent = "";
      }
    }

    function pintarError() {
      var q = consulta(), pares = E.REDES[q.red].pares, caja = el("panel-error"), r, h, nombre;
      if (errorActivo === "") { caja.innerHTML = ""; return; }
      if (errorActivo === "ausente") {
        caja.innerHTML = "<p>Sin la línea <code>if nodo in indice</code>, Python corta con <code>KeyError</code> en " +
          "<code>indice[nodo]</code>. C++ no corta: <code>indice[nodo]</code> crea la clave y el recorrido lee fuera de " +
          "<code>adj</code>, sin ningún aviso. Con la red de una sola conexión 7 3 y el nodo 99, ese programa imprimió 0 con " +
          "TTL 5 y 1 con TTL 0, y lo correcto es 2 en los dos. El nodo ausente no alcanza a nadie, así que la respuesta es el " +
          "total de la red: aquí, " + E.totalDe(params.p) + ". Mírelo con la consulta <b>99, que no está</b>.</p>";
        return;
      }
      r = errorActivo === "menor" ? E.conMenorIgual(pares, q.nodo, q.ttl) : E.marcandoTarde(pares, q.nodo, q.ttl);
      nombre = errorActivo === "menor" ?
        "Con <code>dist[u] &lt;= ttl</code> se expanden también los nodos que ya llegaron a distancia TTL, y el mensaje da un salto de más." :
        "Se marca <code>dist</code> y se cuenta al sacar de la cola, no al meter. Mientras un nodo espera, sigue con distancia −1, otro vecino lo mete de nuevo y sale contado dos veces.";
      h = "<p>" + nombre + (r.respuesta === E.respuesta(params.p) ?
        " En esta consulta la respuesta coincide, <b>" + r.respuesta + "</b>, así que el error pasaría los casos que solo traigan consultas como esta." :
        " En esta consulta responde <b>" + r.respuesta + "</b>, y lo correcto es <b>" + E.respuesta(params.p) + "</b>.") + "</p>";
      h = h + "<table class='tabla-corrida'><tr><th>sale</th><th>distancia</th><th>entran a la cola</th></tr>";
      r.filas.forEach(function (f) {
        h = h + "<tr" + (f.mal ? " class='fila-mal'" : "") + "><td>" + f.sale + "</td><td>" + f.dist + "</td><td>" +
          (f.entran.length > 0 ? f.entran.join(", ") : "ninguno") + "</td></tr>";
      });
      caja.innerHTML = h + "</table>" + (r.filas.length === 0 ? "<p>El nodo no está en la red, así que no hay recorrido que mirar: elija otra consulta.</p>" : "");
    }

    Motor.iniciar({
      codigo: E.codigo,
      simular: E.simular,
      chips: [{ campo: "u", rotulo: "u" }, { campo: "v", rotulo: "v" },
              { campo: "ttl", rotulo: "ttl", clase: "cuenta" },
              { campo: "alcanzados", rotulo: "alcanzados", clase: "cuenta" }],
      paramsIniciales: params,
      alPintar: alPintar
    });

    Motor.prediccionNumerica(function (valor) {
      var q = consulta(), r = E.respuesta(params.p), total = E.totalDe(params.p), alc = total - r;
      var pares = E.REDES[q.red].pares, menor = E.conMenorIgual(pares, q.nodo, q.ttl).respuesta;
      if (valor === r) {
        return { ok: true, msg: "Son " + r + ": de los " + total + " nodos, el mensaje llega a " + alc + "." };
      }
      if (valor === alc) {
        return { ok: false, msg: "Esos son los alcanzados. La salida pide los que quedan por fuera." };
      }
      if (valor === menor) {
        return { ok: false, msg: "Ese número sale al dar un salto de más desde los nodos a distancia TTL. Un mensaje que llega con TTL agotado ya no se reenvía." };
      }
      if (valor === r + 1) {
        return { ok: false, msg: "Le sobra uno: el nodo de partida cuenta como alcanzado, incluso con TTL 0." };
      }
      return { ok: false, msg: "No es ese. Cuente los nodos a distancia menor o igual a " + q.ttl + " desde " + q.nodo + " y réstelos de " + total + "." };
    });

    el("presets").innerHTML = E.PRESETS.map(function (x, i) {
      return "<button data-i='" + i + "'" + (i === 0 ? " class='primario'" : "") + ">" + x.nombre + "</button>";
    }).join("");
    Array.prototype.forEach.call(el("presets").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        params.p = parseInt(b.getAttribute("data-i"), 10);
        Array.prototype.forEach.call(el("presets").querySelectorAll("button"), function (x) { x.classList.remove("primario"); });
        b.classList.add("primario");
        el("prediccion").value = "";
        Motor.limpiarVeredicto();
        Motor.reiniciar(params);
        pintarError();
      });
    });
    Array.prototype.forEach.call(el("errores").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        errorActivo = b.getAttribute("data-error");
        Array.prototype.forEach.call(el("errores").querySelectorAll("button"), function (x) { x.classList.remove("primario"); });
        b.classList.add("primario");
        pintarError();
      });
    });
  })();
}
