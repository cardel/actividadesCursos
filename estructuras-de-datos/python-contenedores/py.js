/* Contenedores de Python para las actividades: lo que hace CPython 3.14 por
   dentro, reproducido paso a paso, y los dibujos en SVG del estado.
     crecer       list_resize de Objects/listobject.c
     Heapq        heappush, heappop y heapify de Lib/heapq.py
     casillaSet   la casilla donde un set de 8 casillas guarda un entero
                  (Objects/setobject.c; con 8 casillas no hay sondeo lineal)
   Cada programa de las actividades se corrió con python3 y la salida
   coincide con la que calcula este archivo (prueba en node). */
var Py = (function () {
  /* list_resize: la capacidad que queda al pasar de n a n + 1 elementos. */
  function nuevaCapacidad(cap, n) {
    var nuevo = n + 1;
    var res = cap;
    if (nuevo > cap) {
      res = (nuevo + (nuevo >> 3) + 6) & ~3;
      if (nuevo - n > res - nuevo) { res = (nuevo + 3) & ~3; }
    }
    return res;
  }

  /* n llamadas a append sobre una lista vacía: un registro por llamada. */
  function crecer(n) {
    var cap = 0;
    var reg = [];
    var i = 0;
    while (i < n) {
      var antes = cap;
      cap = nuevaCapacidad(cap, i);
      reg.push({ len: i + 1, cap: cap, cambia: cap !== antes, copia: cap !== antes ? i : 0 });
      i = i + 1;
    }
    return reg;
  }

  /* heapq de Lib/heapq.py, con la misma comparación <. */
  function menor(a, b) {
    var res;
    if (Array.isArray(a)) {
      var k = 0;
      res = null;
      while (res === null && k < a.length && k < b.length) {
        if (a[k] < b[k]) { res = true; } else if (b[k] < a[k]) { res = false; }
        k = k + 1;
      }
      if (res === null) { res = a.length < b.length; }
    } else {
      res = a < b;
    }
    return res;
  }

  function siftdown(h, inicio, pos, reg) {
    var nuevo = h[pos];
    var sigue = true;
    while (sigue && pos > inicio) {
      var padre = (pos - 1) >> 1;
      if (menor(nuevo, h[padre])) {
        if (reg) { reg.push({ tipo: "sube", pos: pos, padre: padre, clave: nuevo, otra: h[padre] }); }
        h[pos] = h[padre];
        pos = padre;
      } else {
        if (reg) { reg.push({ tipo: "queda", pos: pos, padre: padre, clave: nuevo, otra: h[padre] }); }
        sigue = false;
      }
    }
    h[pos] = nuevo;
    return pos;
  }

  function siftup(h, pos) {
    var fin = h.length;
    var inicio = pos;
    var nuevo = h[pos];
    var hijo = 2 * pos + 1;
    while (hijo < fin) {
      var der = hijo + 1;
      if (der < fin && !menor(h[hijo], h[der])) { hijo = der; }
      h[pos] = h[hijo];
      pos = hijo;
      hijo = 2 * pos + 1;
    }
    h[pos] = nuevo;
    siftdown(h, inicio, pos);
  }

  var Heapq = {
    heappush: function (h, x, reg) {
      h.push(x);
      return siftdown(h, 0, h.length - 1, reg);
    },
    heappop: function (h) {
      var ultimo = h.pop();
      var res = ultimo;
      if (h.length > 0) {
        res = h[0];
        h[0] = ultimo;
        siftup(h, 0);
      }
      return res;
    },
    heapify: function (x) {
      var i = Math.floor(x.length / 2) - 1;
      while (i >= 0) {
        siftup(x, i);
        i = i - 1;
      }
    }
  };

  /* set de enteros pequeños (hash(k) = k) con 8 casillas: la casilla de cada
     clave, en orden de llegada. Para cuatro claves o menos la tabla no crece. */
  function casillasSet(claves) {
    var tabla = [null, null, null, null, null, null, null, null];
    var reg = [];
    claves.forEach(function (k) {
      var i = k & 7;
      var perturb = k;
      var probadas = [i];
      var ya = false;
      while (!ya && tabla[i] !== null && tabla[i] !== k) {
        perturb = perturb >> 5;
        i = (i * 5 + 1 + perturb) & 7;
        probadas.push(i);
      }
      if (tabla[i] === k) { ya = true; }
      tabla[i] = k;
      reg.push({ clave: k, casilla: i, probadas: probadas, repetida: ya, tabla: tabla.slice() });
    });
    return reg;
  }

  /* El orden en que un set de 8 casillas entrega sus claves. */
  function ordenSet(claves) {
    var reg = casillasSet(claves);
    var tabla = reg.length > 0 ? reg[reg.length - 1].tabla : [];
    return tabla.filter(function (x) { return x !== null; });
  }

  function texto(x) {
    var res;
    if (typeof x === "string") { res = "'" + x + "'"; } else if (Array.isArray(x)) {
      res = "(" + x.map(texto).join(", ") + ")";
    } else { res = String(x); }
    return res;
  }

  /* Como imprime print una list: [1, 2, 3]. */
  function lista(a) { return "[" + a.map(texto).join(", ") + "]"; }

  function escapar(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function codigo(lineas) {
    return "<pre class=\"fragmento\">" + escapar(lineas.join("\n")) + "</pre>";
  }

  var COLOR = {
    nueva: "#fdf1dc", borde_nueva: "#e8a13d",
    sale: "#fbe9e7", borde_sale: "#b3261e",
    ok: "#e7f2e8", borde_ok: "#2e7d32",
    mira: "#e3edf8", borde_mira: "#1f5fa8"
  };

  function caja(x, y, w, h, contenido, marca, punteada) {
    var relleno = "#fff";
    var borde = "#24292f";
    if (marca && COLOR[marca]) { relleno = COLOR[marca]; borde = COLOR["borde_" + marca]; }
    var guion = punteada ? " stroke-dasharray=\"4 3\"" : "";
    var color = punteada ? "#9aa4b2" : borde;
    return "<rect x=\"" + x + "\" y=\"" + y + "\" width=\"" + w + "\" height=\"" + h +
      "\" rx=\"4\" fill=\"" + relleno + "\" stroke=\"" + color + "\" stroke-width=\"2\"" + guion + "/>" +
      (contenido === "" ? "" : "<text x=\"" + (x + w / 2) + "\" y=\"" + (y + h / 2 + 5) +
      "\" text-anchor=\"middle\" font-family=\"ui-monospace, monospace\" font-size=\"14\" font-weight=\"700\" fill=\"#24292f\">" +
      escapar(contenido) + "</text>");
  }

  function rotulo(x, y, t, color, ancla) {
    return "<text x=\"" + x + "\" y=\"" + y + "\" text-anchor=\"" + (ancla || "middle") +
      "\" font-family=\"ui-monospace, monospace\" font-size=\"12\" fill=\"" + (color || "#6b7280") + "\">" +
      escapar(t) + "</text>";
  }

  function flecha(x1, y1, x2, y2, color) {
    var c = color || "#24292f";
    var ang = Math.atan2(y2 - y1, x2 - x1);
    var a1 = ang + 2.7, a2 = ang - 2.7;
    return "<line x1=\"" + x1 + "\" y1=\"" + y1 + "\" x2=\"" + x2 + "\" y2=\"" + y2 +
      "\" stroke=\"" + c + "\" stroke-width=\"2\"/>" +
      "<polygon points=\"" + x2 + "," + y2 + " " + (x2 + 8 * Math.cos(a1)) + "," + (y2 + 8 * Math.sin(a1)) +
      " " + (x2 + 8 * Math.cos(a2)) + "," + (y2 + 8 * Math.sin(a2)) + "\" fill=\"" + c + "\"/>";
  }

  function svg(ancho, alto, partes, titulo) {
    return "<svg class=\"dibujo-py\" viewBox=\"0 0 " + ancho + " " + alto + "\" width=\"" + ancho +
      "\" style=\"display:block;margin:0.5rem auto;max-width:100%;height:auto\" role=\"img\" aria-label=\"" +
      escapar(titulo || "estado") + "\">" + partes + "</svg>";
  }

  /* Una list: casillas ocupadas, las libres de la capacidad en punteado.
     marcas {i: "nueva" | "sale" | "ok" | "mira"}. */
  function dibujoLista(vals, cap, marcas, nombre) {
    marcas = marcas || {};
    var W = 44, H = 34, x0 = 20, y0 = 40;
    var total = Math.max(cap, vals.length);
    var partes = rotulo(x0, 18, (nombre || "l") + ": len = " + vals.length + ", capacidad = " + cap, "#1f5fa8", "start");
    var i = 0;
    while (i < total) {
      var x = x0 + i * (W + 4);
      partes = partes + rotulo(x + W / 2, y0 - 4, String(i));
      if (i < vals.length) {
        partes = partes + caja(x, y0, W, H, String(vals[i]), marcas[i]);
      } else {
        partes = partes + caja(x, y0, W, H, "", null, true);
      }
      i = i + 1;
    }
    return svg(Math.max(x0 * 2 + total * (W + 4), 300), y0 + H + 12, partes, "lista");
  }

  /* Un deque: las claves de izquierda a derecha. */
  function dibujoDeque(vals, marcas) {
    marcas = marcas || {};
    var W = 70, H = 34, x0 = 30, y0 = 14;
    var partes = "";
    vals.forEach(function (v, i) {
      partes = partes + caja(x0 + i * (W + 4), y0, W, H, String(v), marcas[i]);
    });
    var fin = x0 + Math.max(vals.length, 1) * (W + 4);
    partes = partes + rotulo(x0, y0 + H + 18, "izquierda", "#1f5fa8", "start");
    partes = partes + rotulo(fin - 4, y0 + H + 18, "derecha", "#1f5fa8", "end");
    if (vals.length === 0) { partes = partes + rotulo(x0 + 35, y0 + 22, "vacío"); }
    return svg(fin + 30, y0 + H + 28, partes, "deque");
  }

  /* Las 8 casillas de un set de enteros; marcas {casilla: color}. */
  function dibujoSet(tabla, marcas) {
    marcas = marcas || {};
    var W = 48, H = 34, x0 = 20, y0 = 26;
    var partes = "";
    tabla.forEach(function (v, i) {
      var x = x0 + i * (W + 4);
      partes = partes + rotulo(x + W / 2, y0 - 6, String(i));
      partes = partes + caja(x, y0, W, H, v === null ? "" : String(v), marcas[i], v === null && !marcas[i]);
    });
    partes = partes + rotulo(x0, y0 + H + 18, "casillas de la tabla, de la 0 a la 7", "#1f5fa8", "start");
    return svg(x0 * 2 + 8 * (W + 4), y0 + H + 26, partes, "set");
  }

  return {
    nuevaCapacidad: nuevaCapacidad, crecer: crecer, Heapq: Heapq, menor: menor,
    casillasSet: casillasSet, ordenSet: ordenSet, lista: lista, texto: texto,
    escapar: escapar, codigo: codigo, caja: caja, rotulo: rotulo, flecha: flecha, svg: svg,
    dibujoLista: dibujoLista, dibujoDeque: dibujoDeque, dibujoSet: dibujoSet
  };
})();

if (typeof module !== "undefined") {
  module.exports = Py;
}
