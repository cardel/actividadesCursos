/* Arbol rojinegro para las actividades de este tema.
   La insercion sigue a CLRS, seccion 13.3: se baja como en el ABB, el nodo
   nuevo z entra rojo y se repara subiendo con los casos 1, 2 y 3 (y sus
   reflejos). Cada nodo es {dato, color: "R" | "N", izq, der, padre}.
   Ademas: las rotaciones, la revision de las reglas 2, 4 y 5, la altura
   negra, el ABB sin balancear para comparar y un dibujo en SVG. */
var ArbolRN = (function () {
  function nodo(dato, color) {
    return { dato: dato, color: color || "R", izq: null, der: null, padre: null };
  }

  /* rotaciones (CLRS 13.2) */
  function rotarIzq(T, x) {
    var y = x.der;
    x.der = y.izq;
    if (y.izq !== null) { y.izq.padre = x; }
    y.padre = x.padre;
    if (x.padre === null) {
      T.raiz = y;
    } else if (x === x.padre.izq) {
      x.padre.izq = y;
    } else {
      x.padre.der = y;
    }
    y.izq = x;
    x.padre = y;
  }

  function rotarDer(T, x) {
    var y = x.izq;
    x.izq = y.der;
    if (y.der !== null) { y.der.padre = x; }
    y.padre = x.padre;
    if (x.padre === null) {
      T.raiz = y;
    } else if (x === x.padre.der) {
      x.padre.der = y;
    } else {
      x.padre.izq = y;
    }
    y.der = x;
    x.padre = y;
  }

  /* Copia sin punteros al padre, para guardar fotos del arbol. */
  function clonar(r) {
    var c = null;
    if (r !== null) {
      c = { dato: r.dato, color: r.color, izq: clonar(r.izq), der: clonar(r.der) };
    }
    return c;
  }

  /* Vuelve a poner los punteros al padre en un arbol armado a mano. */
  function enlazarPadres(r, p) {
    if (r !== null) {
      r.padre = p;
      enlazarPadres(r.izq, r);
      enlazarPadres(r.der, r);
    }
    return r;
  }

  function nombreColor(c) { return c === "R" ? "rojo" : "negro"; }
  function colorDe(n) { return n === null ? "N" : n.color; }
  function nombreNodo(n) { return n === null ? "NIL" : "el " + n.dato; }

  /* Inserta k en T = {raiz}. Si se da reg, deja ahi la traza:
       pasos  [{texto, arbol, z}]  una foto despues de cada accion
       casos  [1 | 2 | 3]          los casos de CLRS que se usaron
       rotaciones, recoloreos      cuantos hubo */
  function insertar(T, k, reg) {
    var y = null;
    var x = T.raiz;
    var foto = function (texto, zz) {
      if (reg) { reg.pasos.push({ texto: texto, arbol: clonar(T.raiz), z: zz === null ? null : zz.dato }); }
    };
    while (x !== null && x.dato !== k) {
      y = x;
      x = k < x.dato ? x.izq : x.der;
    }
    if (x === null) {
      var z = nodo(k, "R");
      z.padre = y;
      if (y === null) {
        T.raiz = z;
        foto("Entra el " + k + ", rojo, y es la raíz: se rompe la regla 2.", z);
      } else {
        if (k < y.dato) { y.izq = z; } else { y.der = z; }
        foto("Entra el " + k + ", rojo, como hijo " + (k < y.dato ? "izquierdo" : "derecho") + " del " + y.dato +
             ", que es " + nombreColor(y.color) + (y.color === "R" ? ": dos rojos seguidos, se rompe la regla 4." : ": no se rompe nada."), z);
      }
      while (z.padre !== null && z.padre.color === "R") {
        var p = z.padre;
        var g = p.padre;
        var izquierda = p === g.izq;
        var t = izquierda ? g.der : g.izq;
        if (colorDe(t) === "R") {
          p.color = "N";
          t.color = "N";
          g.color = "R";
          if (reg) { reg.casos.push(1); reg.recoloreos = reg.recoloreos + 3; }
          z = g;
          foto("Caso 1: el tío " + t.dato + " es rojo. El " + p.dato + " y el " + t.dato + " pasan a negro y el " + g.dato +
               " a rojo; z sube al " + g.dato + (g.padre === null ? ", que es la raíz." :
               (g.padre.color === "R" ? ", cuyo padre " + g.padre.dato + " es rojo: la regla 4 se rompe más arriba." :
                ", cuyo padre " + g.padre.dato + " es negro: termina.")), z);
        } else {
          var angulo = izquierda ? z === p.der : z === p.izq;
          if (angulo) {
            if (reg) { reg.casos.push(2); reg.rotaciones = reg.rotaciones + 1; }
            z = p;
            if (izquierda) { rotarIzq(T, z); } else { rotarDer(T, z); }
            foto("Caso 2: el tío (" + nombreNodo(t) + ") es negro y el " + z.padre.dato + " está en ángulo con su padre " + p.dato +
                 ". Se rota a la " + (izquierda ? "izquierda" : "derecha") + " en el " + p.dato + " y quedan en línea; z es ahora el " + z.dato + ".", z);
          }
          var p2 = z.padre;
          var g2 = p2.padre;
          p2.color = "N";
          g2.color = "R";
          if (izquierda) { rotarDer(T, g2); } else { rotarIzq(T, g2); }
          if (reg) { reg.casos.push(3); reg.rotaciones = reg.rotaciones + 1; reg.recoloreos = reg.recoloreos + 2; }
          foto("Caso 3: tío negro y en línea. El " + p2.dato + " pasa a negro, el " + g2.dato + " a rojo, y se rota a la " +
               (izquierda ? "derecha" : "izquierda") + " en el " + g2.dato + ". Termina.", z);
        }
      }
      if (T.raiz.color === "R") {
        T.raiz.color = "N";
        if (reg) { reg.recoloreos = reg.recoloreos + 1; }
        foto("La raíz " + T.raiz.dato + " quedó roja: se pinta de negro.", T.raiz);
      }
    } else if (reg) {
      foto("El " + k + " ya está: no entra.", null);
    }
    return T;
  }

  function nuevaTraza() { return { pasos: [], casos: [], rotaciones: 0, recoloreos: 0 }; }

  /* Arma un rojinegro insertando las claves en orden. Devuelve el arbol y,
     por cada clave, su traza. */
  function armar(claves) {
    var T = { raiz: null };
    var trazas = [];
    claves.forEach(function (k) {
      var reg = nuevaTraza();
      insertar(T, k, reg);
      trazas.push(reg);
    });
    return { T: T, raiz: T.raiz, trazas: trazas };
  }

  /* El primer caso que enfrenta la reparacion al insertar k en el arbol
     armado con base: 0 si no se rompe nada, "raiz" si z es la raiz. */
  function primerCaso(base, k) {
    var a = armar(base);
    var reg = nuevaTraza();
    insertar(a.T, k, reg);
    var res = 0;
    if (base.length === 0) {
      res = "raiz";
    } else if (reg.casos.length > 0) {
      res = reg.casos[0];
    }
    return { caso: res, traza: reg, raiz: a.T.raiz };
  }

  /* ABB sin balancear, para comparar */
  function insertarABB(r, k) {
    if (r === null) {
      r = { dato: k, izq: null, der: null };
    } else if (k < r.dato) {
      r.izq = insertarABB(r.izq, k);
    } else if (k > r.dato) {
      r.der = insertarABB(r.der, k);
    }
    return r;
  }
  function armarABB(claves) {
    var r = null;
    claves.forEach(function (k) { r = insertarABB(r, k); });
    return r;
  }

  /* Arbol coloreado a partir de su preorden: "50N 30R 20N". Como es un
     ABB, insertar en preorden lo reconstruye. */
  function dePreorden(texto) {
    var T = { raiz: null };
    texto.trim().split(/\s+/).forEach(function (t) {
      var k = parseInt(t, 10);
      var c = t.charAt(t.length - 1).toUpperCase();
      var n = nodo(k, c);
      var y = null;
      var x = T.raiz;
      while (x !== null) {
        y = x;
        x = k < x.dato ? x.izq : x.der;
      }
      n.padre = y;
      if (y === null) { T.raiz = n; } else if (k < y.dato) { y.izq = n; } else { y.der = n; }
    });
    return T.raiz;
  }

  /* recorridos y medidas */
  function preorden(r, acc) {
    acc = acc || [];
    if (r !== null) { acc.push(r.dato); preorden(r.izq, acc); preorden(r.der, acc); }
    return acc;
  }
  function inorden(r, acc) {
    acc = acc || [];
    if (r !== null) { inorden(r.izq, acc); acc.push(r.dato); inorden(r.der, acc); }
    return acc;
  }
  /* Preorden con el color pegado: "40N 20R ...". */
  function preordenColor(r, acc) {
    acc = acc || [];
    if (r !== null) { acc.push(r.dato + r.color); preordenColor(r.izq, acc); preordenColor(r.der, acc); }
    return acc;
  }
  function altura(r) { return r === null ? -1 : 1 + Math.max(altura(r.izq), altura(r.der)); }
  function tamano(r) { return r === null ? 0 : 1 + tamano(r.izq) + tamano(r.der); }
  function buscarNodo(r, k) {
    while (r !== null && r.dato !== k) { r = k < r.dato ? r.izq : r.der; }
    return r;
  }

  /* Negros de r hacia abajo, contando r si es negro y la hoja NIL.
     Devuelve -1 si algun nodo tiene caminos con distinta cuenta. */
  function negrosAbajo(r) {
    var res = 1;
    if (r !== null) {
      var a = negrosAbajo(r.izq);
      var b = negrosAbajo(r.der);
      if (a === -1 || b === -1 || a !== b) {
        res = -1;
      } else {
        res = a + (r.color === "N" ? 1 : 0);
      }
    }
    return res;
  }
  /* Altura negra de x (CLRS): negros desde x, sin contarlo, hasta un NIL. */
  function alturaNegra(x) { return negrosAbajo(x.izq); }

  /* Que reglas rompe el arbol: {r2, r4, r5} y la lista de las rotas. */
  function revisar(r) {
    var r4 = { v: false };
    function rojos(x) {
      if (x !== null) {
        if (x.color === "R" && (colorDe(x.izq) === "R" || colorDe(x.der) === "R")) { r4.v = true; }
        rojos(x.izq);
        rojos(x.der);
      }
    }
    rojos(r);
    var res = { r2: r !== null && r.color === "R", r4: r4.v, r5: negrosAbajo(r) === -1 };
    res.rotas = [];
    if (res.r2) { res.rotas.push(2); }
    if (res.r4) { res.rotas.push(4); }
    if (res.r5) { res.rotas.push(5); }
    return res;
  }

  /* El sucesor de k en el inorden, como lo calcula ++it: el minimo del
     subarbol derecho o el primer antepasado del que se viene por la
     izquierda. Devuelve {dato, como: "baja" | "sube" | "fin"}. */
  function sucesor(raiz, k) {
    var x = buscarNodo(raiz, k);
    var res;
    if (x.der !== null) {
      var y = x.der;
      while (y.izq !== null) { y = y.izq; }
      res = { dato: y.dato, como: "baja" };
    } else {
      var cand = null;
      var a = raiz;
      while (a !== x) {
        if (k < a.dato) {
          cand = a;
          a = a.izq;
        } else {
          a = a.der;
        }
      }
      res = cand === null ? { dato: null, como: "fin" } : { dato: cand.dato, como: "sube" };
    }
    return res;
  }

  /* dibujo */
  var DX = 42, DY = 56, RADIO = 16, MARGEN = 24;

  /* Dibuja r. op (opcional):
       z        clave que lleva el anillo naranja
       nil      true para dibujar las hojas NIL como cuadritos negros
       marcas   {clave: "resal" | "mal"}  borde de color
       aristas  {claveHijo: "camino" | "nueva"}
       rotulos  {clave: texto} bajo el nodo
       columnas numero fijo de columnas
       escala   factor del tamano con que se muestra
     Un nodo sin color (los del ABB) se dibuja en blanco. */
  function svg(r, op) {
    op = op || {};
    var marcas = op.marcas || {};
    var aristas = op.aristas || {};
    var rotulos = op.rotulos || {};
    var pos = {};
    var col = { v: 0 };
    var hondo = { v: 0 };
    function ubicar(x, d) {
      if (x !== null) {
        ubicar(x.izq, d + 1);
        pos[x.dato] = { x: MARGEN + RADIO + col.v * DX, y: MARGEN + RADIO + d * DY };
        col.v = col.v + 1;
        if (d > hondo.v) { hondo.v = d; }
        ubicar(x.der, d + 1);
      }
    }
    ubicar(r, 0);
    var columnas = Math.max(col.v, op.columnas || 0, 1);
    var filas = hondo.v + (op.nil ? 2 : 1);
    var ancho = 2 * MARGEN + 2 * RADIO + (columnas - 1) * DX;
    var alto = 2 * MARGEN + 2 * RADIO + (filas - 1) * DY + (Object.keys(rotulos).length > 0 ? 14 : 0);
    var lineas = [];
    var nodos = [];
    function nil(x, lado) {
      var p = pos[x.dato];
      var nx = p.x + (lado === "izq" ? -DX * 0.42 : DX * 0.42);
      var ny = p.y + DY * 0.72;
      lineas.push("<line class=\"arista\" x1=\"" + p.x + "\" y1=\"" + p.y + "\" x2=\"" + nx + "\" y2=\"" + ny + "\"/>");
      nodos.push("<rect class=\"nil\" x=\"" + (nx - 5) + "\" y=\"" + (ny - 5) + "\" width=\"10\" height=\"10\"/>");
    }
    function recorrer(x) {
      if (x !== null) {
        [x.izq, x.der].forEach(function (h, i) {
          if (h !== null) {
            var c = aristas[h.dato] ? " " + aristas[h.dato] : "";
            lineas.push("<line class=\"arista" + c + "\" x1=\"" + pos[x.dato].x + "\" y1=\"" + pos[x.dato].y +
              "\" x2=\"" + pos[h.dato].x + "\" y2=\"" + pos[h.dato].y + "\"/>");
          } else if (op.nil) {
            nil(x, i === 0 ? "izq" : "der");
          }
        });
        var clase = x.color === "R" ? " rojo" : (x.color === "N" ? " negro" : "");
        var m = marcas[x.dato] ? " " + marcas[x.dato] : "";
        var px = pos[x.dato].x, py = pos[x.dato].y;
        var t = "<g class=\"nodo" + clase + m + "\">";
        if (op.z !== undefined && op.z !== null && op.z === x.dato) {
          t = t + "<circle class=\"anillo\" cx=\"" + px + "\" cy=\"" + py + "\" r=\"" + (RADIO + 5) + "\"/>";
        }
        t = t + "<circle cx=\"" + px + "\" cy=\"" + py + "\" r=\"" + RADIO + "\"/>";
        if (x.color === "R") {
          t = t + "<circle class=\"doble\" cx=\"" + px + "\" cy=\"" + py + "\" r=\"" + (RADIO - 3) + "\"/>";
        }
        t = t + "<text x=\"" + px + "\" y=\"" + py + "\">" + x.dato + "</text>";
        if (rotulos[x.dato] !== undefined) {
          t = t + "<text class=\"rotulo\" x=\"" + px + "\" y=\"" + (py + RADIO + 10) + "\">" + rotulos[x.dato] + "</text>";
        }
        nodos.push(t + "</g>");
        recorrer(x.izq);
        recorrer(x.der);
      }
    }
    recorrer(r);
    var esc = op.escala || 1;
    return "<svg class=\"arbol\" viewBox=\"0 0 " + ancho + " " + alto + "\" width=\"" + Math.round(ancho * esc) + "\" height=\"" + Math.round(alto * esc) +
      "\" role=\"img\">" + lineas.join("") + nodos.join("") + "</svg>";
  }

  /* Varios dibujos en fila, cada uno con su pie. */
  function fila(figs) {
    return "<div class=\"fila-arboles\">" + figs.map(function (f) {
      return "<figure>" + f.svg + "<figcaption>" + f.pie + "</figcaption></figure>";
    }).join("") + "</div>";
  }

  function codigo(lineas) {
    var t = lineas.join("\n").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return "<pre class=\"fragmento\">" + t + "</pre>";
  }

  var LEYENDA = "<p class=\"nota\">Negro: relleno oscuro. Rojo: relleno rojo con borde doble. Los cuadritos son las hojas NIL. En el preorden, N es negro y R es rojo.</p>";

  return {
    nodo: nodo, rotarIzq: rotarIzq, rotarDer: rotarDer, clonar: clonar, enlazarPadres: enlazarPadres,
    insertar: insertar, armar: armar, primerCaso: primerCaso, nuevaTraza: nuevaTraza,
    insertarABB: insertarABB, armarABB: armarABB, dePreorden: dePreorden,
    preorden: preorden, inorden: inorden, preordenColor: preordenColor,
    altura: altura, tamano: tamano, buscarNodo: buscarNodo,
    negrosAbajo: negrosAbajo, alturaNegra: alturaNegra, revisar: revisar, sucesor: sucesor,
    svg: svg, fila: fila, codigo: codigo, LEYENDA: LEYENDA
  };
})();

if (typeof module !== "undefined") {
  module.exports = ArbolRN;
}
