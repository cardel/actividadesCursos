/* Lo que comparten las actividades de autoatención: la diferencia con hace 12
   meses de la serie del curso, en millones, los cuatro meses de agosto a
   noviembre de 2024 con su posición, la cuenta de un cabezal de atención, el
   mapa de calor de los pesos en SVG y la cuenta de parámetros del Transformer.
   Todo se calcula aquí con SERIE. */
var Atencion = (function () {
  "use strict";

  var meses = SERIE.meses, v = SERIE.valores;
  var NOMBRES = ["ago", "sep", "oct", "nov"];
  var POSICION = [0.25, 0.5, 0.75, 1];

  /* La diferencia con hace 12 meses, en millones, del mes m ("2024-08"), con 3 decimales. */
  function dif12(m) {
    var i = meses.indexOf(m);
    return Math.round((v[i] - v[i - 12]) / 1e3) / 1000;
  }
  var Z = ["2024-08", "2024-09", "2024-10", "2024-11"].map(dif12);

  /* Un cabezal: cada mes es (z, p); W_q = diag(valor, posicion), W_k la identidad
     y W_v = (1, 0), así que el valor de cada mes es su diferencia. Con orden se
     barajan los meses y la posición se queda en su lugar de la ventana. */
  function cabezal(valor, posicion, conPosicion, orden) {
    var z = (orden || [0, 1, 2, 3]).map(function (k) { return Z[k]; });
    var p = POSICION.map(function (x) { return conPosicion ? x : 0; });
    var Q = z.map(function (zi, i) { return [valor * zi, posicion * p[i]]; });
    var K = z.map(function (zi, i) { return [zi, p[i]]; });
    var puntajes = Q.map(function (q) {
      return K.map(function (k) { return (q[0] * k[0] + q[1] * k[1]) / Math.SQRT2; });
    });
    var pesos = puntajes.map(function (fila) {
      var tope = Math.max.apply(null, fila);
      var e = fila.map(function (s) { return Math.exp(s - tope); });
      var suma = e.reduce(function (a, b) { return a + b; }, 0);
      return e.map(function (x) { return x / suma; });
    });
    var salida = pesos.map(function (fila) {
      return fila.reduce(function (a, w, j) { return a + w * z[j]; }, 0);
    });
    return { z: z, p: p, Q: Q, K: K, puntajes: puntajes, pesos: pesos, salida: salida };
  }

  function coma(x, d) { return x.toFixed(d === undefined ? 3 : d).replace(".", ",").replace("-", "−"); }

  /* Mapa de calor: una celda por par (consulta, clave) con el peso escrito. */
  function mapa(pesos, rotulos, resaltar) {
    var c = 64, izq = 60, arr = 26, n = pesos.length, s = "";
    rotulos.forEach(function (r, j) {
      s += '<text x="' + (izq + j * c + c / 2) + '" y="18" text-anchor="middle" font-size="12" fill="#6b7280">' + r + "</text>";
      s += '<text x="' + (izq - 8) + '" y="' + (arr + j * 34 + 21) + '" text-anchor="end" font-size="12" fill="#6b7280">' + r + "</text>";
    });
    pesos.forEach(function (fila, i) {
      fila.forEach(function (w, j) {
        var tono = Math.round(255 - 150 * w), borde = i === resaltar ? "#b03a2e" : "#9aa5b1";
        s += '<rect x="' + (izq + j * c) + '" y="' + (arr + i * 34) + '" width="' + (c - 4) + '" height="30" fill="rgb(253,' +
          tono + "," + Math.round(tono * 0.8) + ')" stroke="' + borde + '" stroke-width="' + (i === resaltar ? 2 : 1) + '"/>';
        s += '<text x="' + (izq + j * c + (c - 4) / 2) + '" y="' + (arr + i * 34 + 20) + '" text-anchor="middle" font-size="12">' +
          coma(w, 2) + "</text>";
      });
    });
    var W = izq + n * c + 10, H = arr + n * 34 + 26;
    s += '<text x="' + (izq + n * c / 2) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="11" fill="#6b7280">clave: el mes que se mira; fila: el mes que consulta</text>';
    return '<svg class="grafica" viewBox="0 0 ' + W + " " + H + '" width="100%" style="max-width:' + W + 'px" role="img" xmlns="http://www.w3.org/2000/svg">' + s + "</svg>";
  }

  /* Parámetros del Transformer: Linear(1, d), atención (cuatro matrices d × d con sesgo),
     Linear(d, a) y Linear(a, d), dos LayerNorm de 2d y Linear(d, 1). Los cabezales
     reparten las mismas matrices: no cambian la cuenta. */
  function parametros(d, a) {
    return { entrada: 2 * d, atencion: 4 * d * d + 4 * d, dos: d * a + a + a * d + d, normas: 4 * d, salida: d + 1 };
  }
  function total(d, a) {
    var p = parametros(d, a);
    return p.entrada + p.atencion + p.dos + p.normas + p.salida;
  }

  return { NOMBRES: NOMBRES, POSICION: POSICION, Z: Z, cabezal: cabezal, coma: coma, mapa: mapa,
    parametros: parametros, total: total, dif12: dif12 };
})();

if (typeof module !== "undefined") { module.exports = Atencion; }
