/* Árboles para las actividades de Estructuras de Datos: construcción,
   los recorridos y el dibujo en SVG.

   Un árbol binario es null (el vacío) o un nodo {dato, izq, der}, igual que
   el Nodo de C++. Un árbol general es un nodo {dato, hijos: [...]}.
   Cada nodo se identifica por su id; si no tiene, por su dato. Los estilos y
   las marcas del dibujo se dan por id:
     estilos  {id: "activo" | "espera" | "hecho" | "marcado" | "tenue"}
     marcas   {id: texto}  número rojo arriba a la derecha (orden de visita)
     valores  {id: texto}  número verde abajo a la derecha (lo que devuelve)
     vacios   true         dibuja cada hijo que falta como un cuadro gris */
var Arbol = (function () {
  var DX = 40, DY = 58, R = 16, MARGEN = 26;

  /* crearNodo(dato, izq, der); etiqueta es lo que se dibuja si no es el dato. */
  function N(dato, izq, der, op) {
    var n = { dato: dato, izq: izq || null, der: der || null };
    if (op && op.id !== undefined) { n.id = op.id; }
    if (op && op.etiqueta !== undefined) { n.etiqueta = op.etiqueta; }
    return n;
  }

  function G(dato, hijos) {
    return { dato: dato, hijos: hijos || [] };
  }

  function id(n) { return n.id !== undefined ? String(n.id) : String(n.dato); }
  function etiqueta(n) { return n.etiqueta !== undefined ? String(n.etiqueta) : String(n.dato); }

  function preorden(r, sal) {
    sal = sal || [];
    if (r !== null) { sal.push(r.dato); preorden(r.izq, sal); preorden(r.der, sal); }
    return sal;
  }
  function inorden(r, sal) {
    sal = sal || [];
    if (r !== null) { inorden(r.izq, sal); sal.push(r.dato); inorden(r.der, sal); }
    return sal;
  }
  function posorden(r, sal) {
    sal = sal || [];
    if (r !== null) { posorden(r.izq, sal); posorden(r.der, sal); sal.push(r.dato); }
    return sal;
  }
  function tamano(r) { return r === null ? 0 : 1 + tamano(r.izq) + tamano(r.der); }
  function altura(r) { return r === null ? -1 : 1 + Math.max(altura(r.izq), altura(r.der)); }
  function nodos(r, sal) {
    sal = sal || [];
    if (r !== null) { sal.push(r); nodos(r.izq, sal); nodos(r.der, sal); }
    return sal;
  }

  function escapar(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  var COLORES = {
    normal: { fondo: "#ffffff", borde: "#1f5fa8", texto: "#24292f", ancho: 2 },
    activo: { fondo: "#e8a13d", borde: "#a86a12", texto: "#ffffff", ancho: 3 },
    espera: { fondo: "#fdf1dc", borde: "#e8a13d", texto: "#24292f", ancho: 2 },
    hecho: { fondo: "#e7f2e8", borde: "#2e7d32", texto: "#2e7d32", ancho: 2 },
    marcado: { fondo: "#e3edf8", borde: "#1f5fa8", texto: "#1f5fa8", ancho: 3 },
    tenue: { fondo: "#f4f6f9", borde: "#c5ccd6", texto: "#9aa3ae", ancho: 1.5 }
  };

  function pintarNodo(p, op, partes) {
    var k = id(p.n);
    var c = COLORES[(op.estilos || {})[k]] || COLORES.normal;
    var t = etiqueta(p.n);
    var ancho = Math.max(2 * R, t.length * 9 + 12);
    if (ancho === 2 * R) {
      partes.push('<circle cx="' + p.x + '" cy="' + p.y + '" r="' + R + '" fill="' + c.fondo +
                  '" stroke="' + c.borde + '" stroke-width="' + c.ancho + '"/>');
    } else {
      partes.push('<rect x="' + (p.x - ancho / 2) + '" y="' + (p.y - R) + '" width="' + ancho + '" height="' + (2 * R) +
                  '" rx="' + R + '" fill="' + c.fondo + '" stroke="' + c.borde + '" stroke-width="' + c.ancho + '"/>');
    }
    partes.push('<text x="' + p.x + '" y="' + (p.y + 5) + '" text-anchor="middle" font-size="14" font-weight="700" fill="' +
                c.texto + '" font-family="ui-monospace, monospace">' + escapar(t) + '</text>');
    var m = (op.marcas || {})[k];
    if (m !== undefined) {
      partes.push('<text x="' + (p.x + ancho / 2 + 2) + '" y="' + (p.y - R + 4) + '" font-size="12" font-weight="700" fill="#b3261e" font-family="system-ui, sans-serif">' + escapar(m) + '</text>');
    }
    var v = (op.valores || {})[k];
    if (v !== undefined) {
      partes.push('<text x="' + (p.x + ancho / 2 + 2) + '" y="' + (p.y + R + 2) + '" font-size="12" font-weight="700" fill="#2e7d32" font-family="system-ui, sans-serif">' + escapar(v) + '</text>');
    }
  }

  function envolver(partes, ancho, alto, titulo) {
    return '<svg viewBox="0 0 ' + ancho + ' ' + alto + '" width="' + ancho + '" height="' + alto +
           '" style="max-width:100%;height:auto;display:block;margin:0.4rem auto" role="img" aria-label="' +
           escapar(titulo || "árbol") + '">' + partes.join("") + '</svg>';
  }

  /* Dibujo de un árbol binario: cada nodo y cada vacío dibujado toma una
     columna en el orden de izquierda a derecha, de modo que el hijo izquierdo
     queda siempre a la izquierda del padre. */
  function binario(raiz, op) {
    op = op || {};
    var lugares = [];
    var columna = { v: 0 };
    var hondo = { v: 0 };
    function ubicar(r, nivel, padre) {
      var p = null;
      if (r === null) {
        if (op.vacios && padre !== null) {
          p = { n: null, x: MARGEN + columna.v * DX, y: MARGEN + nivel * DY, padre: padre };
          columna.v = columna.v + 1;
          lugares.push(p);
        }
      } else {
        p = { n: r, padre: padre, y: MARGEN + nivel * DY };
        if (nivel > hondo.v) { hondo.v = nivel; }
        ubicar(r.izq, nivel + 1, p);
        p.x = MARGEN + columna.v * DX;
        columna.v = columna.v + 1;
        ubicar(r.der, nivel + 1, p);
        lugares.push(p);
      }
      return p;
    }
    ubicar(raiz, 0, null);
    if (op.vacios) { hondo.v = hondo.v + 1; }
    var partes = [];
    lugares.forEach(function (p) {
      if (p.padre !== null) {
        var gris = p.n === null;
        partes.push('<line x1="' + p.padre.x + '" y1="' + p.padre.y + '" x2="' + p.x + '" y2="' + p.y +
                    '" stroke="' + (gris ? "#b8c0cb" : "#6b7280") + '" stroke-width="' + (gris ? 1.2 : 1.8) + '"/>');
      }
    });
    lugares.forEach(function (p) {
      if (p.n === null) {
        partes.push('<rect x="' + (p.x - 6) + '" y="' + (p.y - 6) + '" width="12" height="12" fill="#e2e6eb" stroke="#9aa3ae"/>');
      } else {
        pintarNodo(p, op, partes);
      }
    });
    var ancho = 2 * MARGEN + Math.max(columna.v - 1, 0) * DX + 20;
    var alto = 2 * MARGEN + hondo.v * DY;
    return envolver(partes, ancho, alto, op.titulo);
  }

  function anchoNodo(n) { return Math.max(2 * R, etiqueta(n).length * 9 + 12); }

  /* Dibujo de un árbol general: las hojas se ponen una tras otra, cada una
     con el ancho de su rótulo, y cada nodo interno queda centrado sobre sus
     hijos. */
  function general(raiz, op) {
    op = op || {};
    var lugares = [];
    var cursor = { v: 10 };
    var hondo = { v: 0 };
    function ubicar(n, nivel, padre) {
      var p = { n: n, padre: padre, y: MARGEN + nivel * DY };
      if (nivel > hondo.v) { hondo.v = nivel; }
      if (n.hijos.length === 0) {
        var w = anchoNodo(n);
        p.x = cursor.v + w / 2;
        cursor.v = cursor.v + w + 14;
      } else {
        var hs = n.hijos.map(function (h) { return ubicar(h, nivel + 1, p); });
        p.x = (hs[0].x + hs[hs.length - 1].x) / 2;
      }
      lugares.push(p);
      return p;
    }
    ubicar(raiz, 0, null);
    var partes = [];
    lugares.forEach(function (p) {
      if (p.padre !== null) {
        partes.push('<line x1="' + p.padre.x + '" y1="' + p.padre.y + '" x2="' + p.x + '" y2="' + p.y + '" stroke="#6b7280" stroke-width="1.8"/>');
      }
    });
    lugares.forEach(function (p) { pintarNodo(p, op, partes); });
    var ancho = cursor.v + 16;
    var alto = 2 * MARGEN + hondo.v * DY;
    return envolver(partes, ancho, alto, op.titulo);
  }

  return {
    N: N, G: G, id: id,
    preorden: preorden, inorden: inorden, posorden: posorden,
    tamano: tamano, altura: altura, nodos: nodos,
    binario: binario, general: general, escapar: escapar
  };
})();

if (typeof module !== "undefined") {
  module.exports = Arbol;
}
