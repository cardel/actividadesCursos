/* Arbol binario de busqueda para las actividades de este tema: las mismas
   operaciones de abb.h (insertar, buscar, borrar con el sucesor) sobre
   objetos {dato, izq, der}, los recorridos y un dibujo en SVG.
   El dibujo pone cada nodo en la columna de su turno en el inorden y en la
   fila de su profundidad; asi un hijo izquierdo siempre queda a la
   izquierda de su padre, aunque falte el otro hijo. */
var ArbolBB = (function () {
  function nodo(dato, izq, der) {
    return { dato: dato, izq: izq || null, der: der || null };
  }

  function insertar(r, k) {
    if (r === null) {
      r = nodo(k, null, null);
    } else if (k < r.dato) {
      r.izq = insertar(r.izq, k);
    } else if (k > r.dato) {
      r.der = insertar(r.der, k);
    }
    return r;
  }

  function armar(claves) {
    var r = null;
    claves.forEach(function (k) { r = insertar(r, k); });
    return r;
  }

  function minimo(r) {
    while (r.izq !== null) { r = r.izq; }
    return r;
  }

  function maximo(r) {
    while (r.der !== null) { r = r.der; }
    return r;
  }

  /* borrar de abb.h: con dos hijos sube la clave del sucesor. */
  function borrar(r, k) {
    var res = r;
    if (r !== null) {
      if (k < r.dato) {
        r.izq = borrar(r.izq, k);
      } else if (k > r.dato) {
        r.der = borrar(r.der, k);
      } else if (r.izq === null) {
        res = r.der;
      } else if (r.der === null) {
        res = r.izq;
      } else {
        var suc = minimo(r.der);
        r.dato = suc.dato;
        r.der = borrar(r.der, suc.dato);
      }
    }
    return res;
  }

  /* La variante con el predecesor, el maximo del subarbol izquierdo. */
  function borrarPred(r, k) {
    var res = r;
    if (r !== null) {
      if (k < r.dato) {
        r.izq = borrarPred(r.izq, k);
      } else if (k > r.dato) {
        r.der = borrarPred(r.der, k);
      } else if (r.izq === null) {
        res = r.der;
      } else if (r.der === null) {
        res = r.izq;
      } else {
        var pred = maximo(r.izq);
        r.dato = pred.dato;
        r.izq = borrarPred(r.izq, pred.dato);
      }
    }
    return res;
  }

  /* Claves que compara buscar, en orden, y si encontro la clave. */
  function camino(r, k) {
    var visitados = [];
    var ultimo = null;
    while (r !== null && k !== r.dato) {
      visitados.push(r.dato);
      ultimo = r;
      r = k < r.dato ? r.izq : r.der;
    }
    var esta = r !== null;
    if (esta) { visitados.push(r.dato); }
    return {
      claves: visitados, esta: esta,
      padre: esta ? null : (ultimo === null ? null : ultimo.dato),
      lado: esta || ultimo === null ? null : (k < ultimo.dato ? "izq" : "der")
    };
  }

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

  function posorden(r, acc) {
    acc = acc || [];
    if (r !== null) { posorden(r.izq, acc); posorden(r.der, acc); acc.push(r.dato); }
    return acc;
  }

  function altura(r) {
    return r === null ? -1 : 1 + Math.max(altura(r.izq), altura(r.der));
  }

  function tamano(r) {
    return r === null ? 0 : 1 + tamano(r.izq) + tamano(r.der);
  }

  function clonar(r) {
    return r === null ? null : nodo(r.dato, clonar(r.izq), clonar(r.der));
  }

  /* Comparaciones que hace insertar con cada clave de la secuencia. */
  function comparacionesAlArmar(claves) {
    var r = null;
    var total = 0;
    claves.forEach(function (k) {
      total = total + camino(r, k).claves.length;
      r = insertar(r, k);
    });
    return total;
  }

  /* La revision que solo mira a los hijos inmediatos. */
  function esABBHijos(r) {
    var res = true;
    if (r !== null) {
      if (r.izq !== null && r.izq.dato >= r.dato) {
        res = false;
      } else if (r.der !== null && r.der.dato <= r.dato) {
        res = false;
      } else {
        res = esABBHijos(r.izq) && esABBHijos(r.der);
      }
    }
    return res;
  }

  /* esABB con el rango permitido; anota los nodos que revisa y el rango
     que hereda cada uno. */
  function esABB(r, min, max, revisados) {
    var res = true;
    if (r !== null) {
      revisados.push({ dato: r.dato, min: min, max: max });
      res = min < r.dato && r.dato < max &&
        esABB(r.izq, min, r.dato, revisados) && esABB(r.der, r.dato, max, revisados);
    }
    return res;
  }

  function revisar(r) {
    var revisados = [];
    var ok = esABB(r, -Infinity, Infinity, revisados);
    return { esABB: ok, revisados: revisados };
  }

  /* kEsimo del deck, anotando cada nodo al que entra. */
  function kEsimo(r, k, estado) {
    var res = null;
    if (r !== null) {
      estado.toca.push(r.dato);
      res = kEsimo(r.izq, k, estado);
      if (res === null) {
        estado.vistos = estado.vistos + 1;
        if (estado.vistos === k) {
          res = r;
        } else {
          res = kEsimo(r.der, k, estado);
        }
      }
    }
    return res;
  }

  function contarRango(r, a, b, toca) {
    var res = 0;
    if (r !== null) {
      toca.push(r.dato);
      if (r.dato < a) {
        res = contarRango(r.der, a, b, toca);
      } else if (r.dato > b) {
        res = contarRango(r.izq, a, b, toca);
      } else {
        res = 1 + contarRango(r.izq, a, b, toca) + contarRango(r.der, a, b, toca);
      }
    }
    return res;
  }

  /* ---------- dibujo ---------- */
  var DX = 42, DY = 54, RADIO = 16, MARGEN = 24;

  /* Dibuja r. op (opcional):
       marcas   {clave: "visto" | "resal" | "mal" | "fuera"}
       aristas  {claveHijo: "camino" | "nueva" | "fuera"}, la arista que llega a ese hijo
       nulo     {padre, lado: "izq" | "der", texto?}, un hijo vacio dibujado con trazo
       rotulos  {clave: texto}, un texto pequeño bajo el nodo
       textos   {clave: texto}, lo que se escribe dentro del nodo en vez de la clave
       columnas numero fijo de columnas, para que varios dibujos midan lo mismo
       escala   factor para el ancho y el alto con que se muestra (1 si no se da) */
  function svg(r, op) {
    op = op || {};
    var marcas = op.marcas || {};
    var aristas = op.aristas || {};
    var rotulos = op.rotulos || {};
    var textos = op.textos || {};
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
    var filas = hondo.v + (op.nulo ? 2 : 1);
    var ancho = 2 * MARGEN + 2 * RADIO + (columnas - 1) * DX;
    var alto = 2 * MARGEN + 2 * RADIO + (filas - 1) * DY + (Object.keys(rotulos).length > 0 ? 14 : 0);
    var lineas = [];
    var nodos = [];
    function recorrer(x) {
      if (x !== null) {
        [x.izq, x.der].forEach(function (h) {
          if (h !== null) {
            var c = aristas[h.dato] ? " " + aristas[h.dato] : "";
            lineas.push("<line class=\"arista" + c + "\" x1=\"" + pos[x.dato].x + "\" y1=\"" + pos[x.dato].y +
              "\" x2=\"" + pos[h.dato].x + "\" y2=\"" + pos[h.dato].y + "\"/>");
          }
        });
        var m = marcas[x.dato] ? " " + marcas[x.dato] : "";
        var t = "<g class=\"nodo" + m + "\"><circle cx=\"" + pos[x.dato].x + "\" cy=\"" + pos[x.dato].y +
          "\" r=\"" + RADIO + "\"/><text x=\"" + pos[x.dato].x + "\" y=\"" + pos[x.dato].y + "\">" + (textos[x.dato] !== undefined ? textos[x.dato] : x.dato) + "</text>";
        if (rotulos[x.dato] !== undefined) {
          t = t + "<text class=\"rotulo\" x=\"" + pos[x.dato].x + "\" y=\"" + (pos[x.dato].y + RADIO + 10) + "\">" +
            rotulos[x.dato] + "</text>";
        }
        nodos.push(t + "</g>");
        recorrer(x.izq);
        recorrer(x.der);
      }
    }
    recorrer(r);
    if (op.nulo && pos[op.nulo.padre]) {
      var p = pos[op.nulo.padre];
      var nx = p.x + (op.nulo.lado === "izq" ? -DX * 0.6 : DX * 0.6);
      var ny = p.y + DY * 0.85;
      lineas.push("<line class=\"arista camino nula\" x1=\"" + p.x + "\" y1=\"" + p.y + "\" x2=\"" + nx + "\" y2=\"" + (ny - 8) + "\"/>");
      nodos.push("<text class=\"nulo\" x=\"" + nx + "\" y=\"" + ny + "\">" + (op.nulo.texto || "NULL") + "</text>");
    }
    var esc = op.escala || 1;
    return "<svg class=\"arbol\" viewBox=\"0 0 " + ancho + " " + alto + "\" width=\"" + Math.round(ancho * esc) + "\" height=\"" + Math.round(alto * esc) +
      "\" role=\"img\">" + lineas.join("") + nodos.join("") + "</svg>";
  }

  /* Un fragmento de codigo listo para meter en el HTML de una tarjeta. */
  function codigo(lineas) {
    var t = lineas.join("\n").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return "<pre class=\"fragmento\">" + t + "</pre>";
  }

  return {
    codigo: codigo,
    nodo: nodo, insertar: insertar, armar: armar, minimo: minimo, maximo: maximo,
    borrar: borrar, borrarPred: borrarPred, camino: camino,
    preorden: preorden, inorden: inorden, posorden: posorden,
    altura: altura, tamano: tamano, clonar: clonar,
    comparacionesAlArmar: comparacionesAlArmar,
    esABBHijos: esABBHijos, revisar: revisar, kEsimo: kEsimo, contarRango: contarRango,
    svg: svg
  };
})();

if (typeof module !== "undefined") {
  module.exports = ArbolBB;
}
