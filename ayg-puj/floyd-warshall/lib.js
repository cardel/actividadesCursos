/* Piezas comunes de los ejercicios de Floyd-Warshall.
   Reproducen, linea por linea, floydWarshallNoOpt y floydWarshall de
   250407-agra-floydwarshall.py. Los numeros de linea son los de ese archivo.
   La matriz de pesos lleva 0 en la diagonal, el peso de la arista en las
   parejas que la tienen e infinito en las demas. */
var FW = (function () {
  var INF = Infinity;

  function fmt(x) { return x === INF ? "∞" : String(x).replace("-", "−"); }

  function copiar(m) { return m.map(function (f) { return f.slice(); }); }

  function pesos(n, aristas) {
    var w = [], i = 0, j;
    while (i < n) {
      w.push([]); j = 0;
      while (j < n) { w[i].push(i === j ? 0 : INF); j = j + 1; }
      i = i + 1;
    }
    aristas.forEach(function (a) { if (a[2] < w[a[0]][a[1]]) { w[a[0]][a[1]] = a[2]; } });
    return w;
  }

  /* Lineas 41 a 46: la matriz de pesos con la diagonal en 0 y nex en j. */
  function inicial(w) {
    var n = w.length, d = copiar(w), nex = [], i = 0, j;
    while (i < n) {
      nex.push([]); j = 0;
      while (j < n) { nex[i].push(j); j = j + 1; }
      i = i + 1;
    }
    i = 0;
    while (i < n) { d[i][i] = 0; nex[i][i] = i; i = i + 1; }
    return { d: d, nex: nex };
  }

  /* floydWarshallNoOpt: guarda las n + 1 matrices. D[k] es la del paso k. */
  function todas(w) {
    var n = w.length, ini = inicial(w), D = [ini.d], N = [ini.nex], k = 0, i, j, dk, nk;
    while (k < n) {
      dk = copiar(D[k]); nk = copiar(N[k]);
      i = 0;
      while (i < n) {
        j = 0;
        while (j < n) {
          if (D[k][i][k] + D[k][k][j] < dk[i][j]) {
            dk[i][j] = D[k][i][k] + D[k][k][j];
            nk[i][j] = N[k][i][k];
          }
          j = j + 1;
        }
        i = i + 1;
      }
      D.push(dk); N.push(nk); k = k + 1;
    }
    return { D: D, NEX: N };
  }

  /* floydWarshall: una sola matriz, el resultado del juez. */
  function fw(w) {
    var n = w.length, ini = inicial(w), d = ini.d, nex = ini.nex, k = 0, i, j;
    while (k < n) {
      i = 0;
      while (i < n) {
        j = 0;
        while (j < n) {
          if (d[i][k] + d[k][j] < d[i][j]) { d[i][j] = d[i][k] + d[k][j]; nex[i][j] = nex[i][k]; }
          j = j + 1;
        }
        i = i + 1;
      }
      k = k + 1;
    }
    return { d: d, nex: nex };
  }

  /* Las parejas que mejoran en el paso k, con de donde sale el valor nuevo. */
  function mejoras(D, k) {
    var n = D[k].length, r = [], i = 0, j;
    while (i < n) {
      j = 0;
      while (j < n) {
        if (D[k + 1][i][j] !== D[k][i][j]) {
          r.push({ i: i, j: j, antes: D[k][i][j], ahora: D[k + 1][i][j], ik: D[k][i][k], kj: D[k][k][j] });
        }
        j = j + 1;
      }
      i = i + 1;
    }
    return r;
  }

  /* El triple ciclo en el orden que se pida. orden es una permutacion de
     "kij"; con copia, el cuerpo lee la matriz como estaba al empezar la
     pasada de k. */
  function correr(w, orden, copia) {
    var n = w.length, d = inicial(w).d, v = { i: 0, j: 0, k: 0 }, prev = null;
    var o0 = orden.charAt(0), o1 = orden.charAt(1), o2 = orden.charAt(2);
    v[o0] = 0;
    while (v[o0] < n) {
      if (copia) { prev = copiar(d); }
      v[o1] = 0;
      while (v[o1] < n) {
        v[o2] = 0;
        while (v[o2] < n) {
          var base = copia ? prev : d;
          if (base[v.i][v.k] + base[v.k][v.j] < d[v.i][v.j]) {
            d[v.i][v.j] = base[v.i][v.k] + base[v.k][v.j];
          }
          v[o2] = v[o2] + 1;
        }
        v[o1] = v[o1] + 1;
      }
      v[o0] = v[o0] + 1;
    }
    return d;
  }

  /* Las parejas donde una variante no da la distancia. */
  function discrepancias(w, orden, copia) {
    var n = w.length, a = correr(w, orden, copia), b = fw(w).d, r = [], i = 0, j;
    while (i < n) {
      j = 0;
      while (j < n) {
        if (a[i][j] !== b[i][j]) { r.push({ i: i, j: j, dio: a[i][j], debia: b[i][j] }); }
        j = j + 1;
      }
      i = i + 1;
    }
    return { d: a, correcta: b, fallas: r };
  }

  /* Sigue nex de i a j. Devuelve null cuando la pareja no tiene camino. */
  function caminoDe(d, nex, i, j) {
    var c = [i], v = i, tope = 0;
    if (d[i][j] === INF) { return null; }
    while (v !== j && tope <= d.length) { v = nex[v][j]; c.push(v); tope = tope + 1; }
    return c;
  }

  function pesoDe(w, c) {
    var s = 0, t = 0;
    while (t + 1 < c.length) { s = s + w[c[t]][c[t + 1]]; t = t + 1; }
    return s;
  }

  /* ---- Codigo mostrado: txt es la linea del archivo; num null = sin conteo ---- */
  var CODIGO_FW = [
    { num: null, txt: "def floydWarshall(w):" },
    { num: null, txt: "  # ya corrió el arranque: d = w, la diagonal en 0" },
    { num: null, txt: "  # y nex[i][j] = j para toda pareja" },
    { num: 53, txt: "  for k in range(0, n):", bloque: 1 },
    { num: 54, txt: "    for i in range(0, n):", bloque: 2 },
    { num: 55, txt: "      for j in range(0, n):", bloque: 3 },
    { num: 56, txt: "        if d[i][k] + d[k][j] < d[i][j]:", bloque: 3 },
    { num: 57, txt: "          d[i][j] = d[i][k] + d[k][j]", bloque: 3 },
    { num: 58, txt: "          nex[i][j] = nex[i][k]", bloque: 3 },
    { num: 62, txt: "  return d, nex", bloque: 1 }
  ];

  /* Un paso por linea ejecutada del triple ciclo. */
  function simFW(w) {
    var n = w.length, ini = inicial(w), d = ini.d, nex = ini.nex, pasos = [];
    var k = 0, i, j, dik, dkj, suma;
    function paso(linea, extra) {
      var p = { linea: linea, d: copiar(d), nex: copiar(nex), k: null, i: null, j: null,
                dik: null, dkj: null, suma: null, mejora: false };
      var c;
      for (c in extra) { p[c] = extra[c]; }
      pasos.push(p);
    }
    while (k < n) {
      paso(53, { k: k });
      i = 0;
      while (i < n) {
        paso(54, { k: k, i: i });
        j = 0;
        while (j < n) {
          paso(55, { k: k, i: i, j: j });
          dik = d[i][k]; dkj = d[k][j]; suma = dik + dkj;
          paso(56, { k: k, i: i, j: j, dik: fmt(dik), dkj: fmt(dkj), suma: fmt(suma) });
          if (suma < d[i][j]) {
            d[i][j] = suma;
            paso(57, { k: k, i: i, j: j, dik: fmt(dik), dkj: fmt(dkj), suma: fmt(suma), mejora: true });
            nex[i][j] = nex[i][k];
            paso(58, { k: k, i: i, j: j, dik: fmt(dik), dkj: fmt(dkj), suma: fmt(suma), mejora: true });
          }
          j = j + 1;
        }
        i = i + 1;
      }
      k = k + 1;
    }
    paso(62, {});
    return pasos;
  }

  /* Una matriz como tabla HTML. o.filaK y o.colK sombrean la fila y la
     columna que se leen; o.clase(i, j) y o.texto(i, j) mandan sobre la celda. */
  function tabla(m, o) {
    o = o || {};
    var n = m.length, s = "<table class='mat'><tr><th>" + (o.esquina || "") + "</th>", i = 0, j = 0, cls;
    while (j < n) { s += "<th" + (o.colK === j ? " class='ejek'" : "") + ">" + j + "</th>"; j = j + 1; }
    s += "</tr>";
    while (i < n) {
      s += "<tr><th" + (o.filaK === i ? " class='ejek'" : "") + ">" + i + "</th>";
      j = 0;
      while (j < n) {
        cls = o.clase ? o.clase(i, j) : "";
        s += "<td" + (cls ? " class='" + cls + "'" : "") + ">" + (o.texto ? o.texto(i, j) : fmt(m[i][j])) + "</td>";
        j = j + 1;
      }
      s += "</tr>";
      i = i + 1;
    }
    return s + "</table>";
  }

  function textoAristas(a) {
    return a.map(function (x) { return x[0] + "→" + x[1] + " (" + fmt(x[2]) + ")"; }).join(", ");
  }

  return { INF: INF, fmt: fmt, copiar: copiar, pesos: pesos, inicial: inicial, todas: todas,
           fw: fw, mejoras: mejoras, correr: correr, discrepancias: discrepancias,
           caminoDe: caminoDe, pesoDe: pesoDe, CODIGO_FW: CODIGO_FW, simFW: simFW,
           tabla: tabla, textoAristas: textoAristas };
})();

if (typeof module !== "undefined") { module.exports = FW; }
