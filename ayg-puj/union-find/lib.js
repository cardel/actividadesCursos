/* Piezas comunes de los ejercicios de conjuntos disjuntos.
   Reproducen union_find.py de la sesion linea por linea: los numeros que
   acompanan al codigo son los de ese archivo. find_set acorta el camino que
   recorrio, de modo que p cambia tambien cuando nadie hizo una union.
   Las dos variantes de la ultima tarjeta usan raiz(), que sube sin acortar,
   para que se vea que hace cada heuristica por separado. */
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var UF = (function () {
  var ELEMS = [1, 2, 3, 4, 5, 6, 7, 8];
  var SEC = [[3, 7], [3, 2], [1, 4], [5, 6], [1, 5], [8, 1], [7, 6]];

  function copia(o) {
    var r = {}, k;
    for (k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) { r[k] = o[k]; } }
    return r;
  }

  /* ---- union_find.py ---- */
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

  /* ---- medidas sobre el bosque ---- */
  function raiz(p, x) {
    var y = x;
    while (p[y] !== y) { y = p[y]; }
    return y;
  }

  function saltos(p, x) {
    var y = x, n = 0;
    while (p[y] !== y) { y = p[y]; n = n + 1; }
    return n;
  }

  function camino(p, x) {
    var y = x, c = [x];
    while (p[y] !== y) { y = p[y]; c.push(y); }
    return c;
  }

  /* El elemento que mas salta, y la suma de los saltos de todos. */
  function perfil(p, elems) {
    var s = {}, suma = 0, hondo = elems[0];
    elems.forEach(function (x) {
      s[x] = saltos(p, x);
      suma = suma + s[x];
      if (s[x] > s[hondo]) { hondo = x; }
    });
    return { saltos: s, suma: suma, hondo: hondo, altura: s[hondo] };
  }

  function raices(p, elems) {
    return elems.filter(function (x) { return p[x] === x; });
  }

  /* ---- el estado despues de cada operacion, con el codigo del curso ---- */
  function estadosCurso(elems, sec) {
    var p = {}, rango = {}, lista = [];
    elems.forEach(function (x) { makeSet(p, rango, x); });
    lista.push({ op: "make_set", p: copia(p), rango: copia(rango) });
    sec.forEach(function (par) {
      union(p, rango, par[0], par[1]);
      lista.push({ op: "union(" + par[0] + "," + par[1] + ")", p: copia(p), rango: copia(rango) });
    });
    return lista;
  }

  /* ---- el codigo en pantalla; num es la linea de union_find.py ---- */
  var CODIGO = [
    { num: 8, txt: "def make_set(p, rango, x):", bloque: 1 },
    { num: 9, txt: "    p[x] = x", bloque: 1 },
    { num: 10, txt: "    rango[x] = 0", bloque: 1 },
    { num: null, txt: "" },
    { num: 13, txt: "def find_set(p, x):", bloque: 2 },
    { num: 14, txt: "    if p[x] != x:", bloque: 2 },
    { num: 15, txt: "        p[x] = find_set(p, p[x])", bloque: 2 },
    { num: 16, txt: "    return p[x]", bloque: 2 },
    { num: null, txt: "" },
    { num: 19, txt: "def union(p, rango, x, y):", bloque: 3 },
    { num: 20, txt: "    rx = find_set(p, x)", bloque: 3 },
    { num: 21, txt: "    ry = find_set(p, y)", bloque: 3 },
    { num: 22, txt: "    if rx != ry:", bloque: 3 },
    { num: 23, txt: "        if rango[rx] < rango[ry]:", bloque: 3 },
    { num: 24, txt: "            p[rx] = ry", bloque: 3 },
    { num: 25, txt: "        elif rango[rx] > rango[ry]:", bloque: 3 },
    { num: 26, txt: "            p[ry] = rx", bloque: 3 },
    { num: 27, txt: "        else:", bloque: 3 },
    { num: 28, txt: "            p[ry] = rx", bloque: 3 },
    { num: 29, txt: "            rango[rx] = rango[rx] + 1", bloque: 3 }
  ];

  /* ---- la secuencia paso a paso ----
     Cada paso trae la linea que acaba de correr y el estado completo. En
     movido queda el elemento cuyo padre cambio en ese paso, que es lo que el
     dibujo resalta: la linea 15 lo mueve al acortar y las lineas 24, 26 y 28
     al colgar una raiz de la otra. */
  function simCurso(elems, sec) {
    var p = {}, rango = {}, pasos = [], pila = [];
    var op = "", x = null, y = null, rx = null, ry = null, caso = "";
    var fx = null, movido = null, nuevo = null;

    function foto(linea) {
      pasos.push({
        linea: linea, p: copia(p), rango: copia(rango), op: op,
        x: x, y: y, rx: rx, ry: ry, caso: caso, fx: fx,
        pila: pila.slice(), movido: movido, nuevo: nuevo
      });
      movido = null;
    }

    elems.forEach(function (e) {
      op = "make_set(" + e + ")";
      x = e; y = null;
      p[e] = e; movido = e; foto(9);
      rango[e] = 0; foto(10);
    });

    function buscar(arg) {
      var r;
      fx = arg;
      pila.push(arg);
      foto(14);
      if (p[arg] !== arg) {
        r = buscar(p[arg]);
        if (p[arg] !== r) { movido = arg; }
        p[arg] = r;
        fx = arg;
        foto(15);
      } else {
        r = arg;
      }
      fx = arg;
      foto(16);
      pila.pop();
      fx = pila.length > 0 ? pila[pila.length - 1] : null;
      return r;
    }

    sec.forEach(function (par) {
      op = "union(" + par[0] + "," + par[1] + ")";
      x = par[0]; y = par[1]; rx = null; ry = null; caso = ""; nuevo = null;
      rx = buscar(x); fx = null; foto(20);
      ry = buscar(y); fx = null; foto(21);
      caso = rx !== ry ? "raíces distintas" : "ya estaban juntos";
      foto(22);
      if (rx !== ry) {
        caso = rango[rx] < rango[ry] ? "rango menor" : (rango[rx] > rango[ry] ? "rango mayor" : "empate");
        foto(23);
        if (rango[rx] < rango[ry]) {
          p[rx] = ry; movido = rx; nuevo = rx; foto(24);
        } else {
          foto(25);
          if (rango[rx] > rango[ry]) {
            p[ry] = rx; movido = ry; nuevo = ry; foto(26);
          } else {
            foto(27);
            p[ry] = rx; movido = ry; nuevo = ry; foto(28);
            rango[rx] = rango[rx] + 1; foto(29);
          }
        }
      }
    });
    return pasos;
  }

  /* Cuantas veces sube el rango de la raiz que queda al final. */
  function subidasDeLaRaiz(elems, sec) {
    var p = {}, rango = {}, subidas = {}, fin;
    elems.forEach(function (e) { makeSet(p, rango, e); });
    sec.forEach(function (par) {
      var antes = copia(rango);
      union(p, rango, par[0], par[1]);
      elems.forEach(function (e) {
        if (rango[e] !== antes[e]) { subidas[e] = (subidas[e] || 0) + 1; }
      });
    });
    fin = raiz(p, elems[0]);
    return { raiz: fin, subidas: subidas[fin] || 0, todas: subidas,
             empates: Object.keys(subidas).reduce(function (s, k) { return s + subidas[k]; }, 0) };
  }

  /* ---- las dos variantes de la ultima tarjeta ----
     find_set sube sin acortar, de modo que la unica diferencia entre las dos
     columnas es la union por rango. */
  function unionVariante(p, rango, x, y, conRango) {
    var rx = raiz(p, x), ry = raiz(p, y);
    if (rx !== ry) {
      if (conRango && rango[rx] < rango[ry]) { p[rx] = ry; }
      else if (conRango && rango[rx] > rango[ry]) { p[ry] = rx; }
      else {
        p[ry] = rx;
        if (conRango) { rango[rx] = rango[rx] + 1; }
      }
    }
  }

  function correrVariante(elems, sec, conRango) {
    var p = {}, rango = {}, estados = [];
    elems.forEach(function (e) { makeSet(p, rango, e); });
    estados.push({ op: "make_set", p: copia(p), rango: copia(rango) });
    sec.forEach(function (par) {
      unionVariante(p, rango, par[0], par[1], conRango);
      estados.push({ op: "union(" + par[0] + "," + par[1] + ")",
                     p: copia(p), rango: copia(rango) });
    });
    return { estados: estados, perfil: perfil(p, elems) };
  }

  /* El find_set del curso aplicado a un elemento sobre un p dado. */
  function comprimir(p, x) {
    var c = camino(p, x), q = copia(p);
    findSet(q, x);
    return { p: q, camino: c };
  }

  /* ---- dibujo del bosque ----
     Un arbol por raiz, colgados hacia abajo y puestos uno al lado del otro.
     La flecha va del hijo al padre, que es lo que dice p. */
  function layoutBosque(p, o) {
    o = o || {};
    var ancho = o.ancho || 560, alto = o.alto || 210, hueco = o.hueco === undefined ? 0.75 : o.hueco;
    var elems = Object.keys(p).map(Number).sort(function (a, b) { return a - b; });
    var hijos = {}, col = {}, prof = {}, libre = 0, maxProf = 0, usadas;

    elems.forEach(function (x) { hijos[x] = []; });
    elems.forEach(function (x) { if (p[x] !== x) { hijos[p[x]].push(x); } });

    function bajar(v, d) {
      prof[v] = d;
      if (d > maxProf) { maxProf = d; }
      if (hijos[v].length === 0) {
        col[v] = libre;
        libre = libre + 1;
      } else {
        hijos[v].forEach(function (w) { bajar(w, d + 1); });
        col[v] = (col[hijos[v][0]] + col[hijos[v][hijos[v].length - 1]]) / 2;
      }
    }
    elems.forEach(function (x) {
      if (p[x] === x) { bajar(x, 0); libre = libre + hueco; }
    });

    usadas = libre - hueco;
    var pasoX = usadas > 1 ? (ancho - 70) / (usadas - 1) : 0;
    var pasoY = maxProf > 0 ? (alto - 60) / maxProf : 0;
    var pos = elems.map(function (x) {
      return [35 + col[x] * pasoX, 30 + prof[x] * pasoY];
    });
    return { elems: elems, pos: pos, prof: prof, hijos: hijos,
             altura: maxProf, ancho: ancho, alto: alto };
  }

  function dibujarBosque(o) {
    var L = layoutBosque(o.p, o), elems = L.elems, idx = {}, aristas = [];
    elems.forEach(function (x, i) { idx[x] = i; });
    elems.forEach(function (x) {
      if (o.p[x] !== x) { aristas.push([idx[x], idx[o.p[x]], ""]); }
    });
    return GRAFOSVG.dibujar({
      n: elems.length, pos: L.pos, aristas: aristas, alto: L.alto, ancho: L.ancho,
      maxAncho: o.maxAncho, nombre: function (i) { return elems[i]; },
      arista: function (j) {
        var hijo = elems[aristas[j][0]];
        return o.arista ? o.arista(hijo) : { color: "gris", grueso: 2 };
      },
      nodo: function (i) { return o.nodo ? o.nodo(elems[i]) : {}; }
    });
  }

  /* ---- los dos arreglos como tabla; cambios marca las casillas que acaban
     de moverse ---- */
  function tablaArreglos(p, rango, elems, cambios) {
    var enc = "<tr><th>x</th>", fp = "<tr><th>p[x]</th>", fr = "<tr><th>rango[x]</th>";
    cambios = cambios || [];
    elems.forEach(function (x) {
      var m = cambios.indexOf(x) >= 0 ? " class='cambio'" : "";
      enc = enc + "<th>" + x + "</th>";
      fp = fp + "<td" + m + ">" + (p[x] === undefined ? "–" : p[x]) + "</td>";
      fr = fr + "<td>" + (rango === null || rango[x] === undefined ? "–" : rango[x]) + "</td>";
    });
    return "<table class='arreglos'>" + enc + "</tr>" + fp + "</tr>" +
           (rango === null ? "" : fr + "</tr>") + "</table>";
  }

  function textoRango(rango, elems) {
    var s = elems.filter(function (x) { return rango[x] > 0; })
      .map(function (x) { return x + ":" + rango[x]; });
    return s.length === 0 ? "todos en 0" : s.join(", ");
  }

  return { ELEMS: ELEMS, SEC: SEC, copia: copia, makeSet: makeSet, findSet: findSet,
           union: union, raiz: raiz, saltos: saltos, camino: camino, perfil: perfil,
           raices: raices, estadosCurso: estadosCurso, CODIGO: CODIGO,
           simCurso: simCurso, subidasDeLaRaiz: subidasDeLaRaiz,
           correrVariante: correrVariante, comprimir: comprimir,
           layoutBosque: layoutBosque, dibujarBosque: dibujarBosque,
           tablaArreglos: tablaArreglos, textoRango: textoRango };
})();

if (typeof module !== "undefined") { module.exports = UF; }
