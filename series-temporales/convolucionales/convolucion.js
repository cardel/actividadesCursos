/* Lo que comparten las actividades de redes convolucionales: la diferencia con
   hace 12 meses de la serie del curso, en millones, la ventana de doce pasos de
   un mes, el filtro que recorre la ventana y su dibujo en SVG, y la cuenta de
   parámetros de cada red. Todo se calcula aquí con SERIE. */
var Convolucion = (function () {
  "use strict";

  var meses = SERIE.meses, v = SERIE.valores;

  /* La diferencia con hace 12 meses, en millones, del mes i. */
  function dif12(i) { return (v[i] - v[i - 12]) / 1e6; }

  /* Los doce pasos de la ventana que pronostica el mes m ("2025-01"), redondeados a 3 decimales. */
  function ventana(m) {
    var k = meses.indexOf(m), x = [];
    for (var i = k - 12; i < k; i++) { x.push(Math.round(dif12(i) * 1000) / 1000); }
    return x;
  }
  function mesesDe(m) { var k = meses.indexOf(m); return meses.slice(k - 12, k); }

  /* El mapa: en cada posición, producto número a número y suma. */
  function deslizar(x, pesos, paso) {
    var k = pesos.length, mapa = [];
    for (var i = 0; i + k <= x.length; i += (paso || 1)) {
      var s = 0;
      for (var j = 0; j < k; j++) { s += pesos[j] * x[i + j]; }
      mapa.push({ inicio: i, valor: s });
    }
    return mapa;
  }

  function coma(x, d) { return x.toFixed(d === undefined ? 3 : d).replace(".", ",").replace("-", "−"); }

  /* Parámetros: Conv1d(1, f, k) con nn.Linear(f · (12 − k + 1), 1). */
  function parametrosConv(f, k) { return f * (k + 1) + f * (12 - k + 1) + 1; }
  var MLP = 14 * 16 + 16 + 16 + 1, LSTM = 4 * (32 + 32 * 32 + 64) + 33;

  /* La ventana en una fila de casillas, el filtro en la posición elegida con
     sus pesos debajo, y el mapa con las casillas ya calculadas. */
  function dibujo(x, pesos, mapa, actual, paso) {
    var c = 52, alto = 26, izq = 70, W = izq + 12 * c + 10, s = "";
    function caja(xx, yy, t, color, negrita) {
      return '<rect x="' + xx + '" y="' + yy + '" width="' + (c - 4) + '" height="' + alto + '" fill="' + (color || "#fff") +
        '" stroke="#9aa5b1"/><text x="' + (xx + (c - 4) / 2) + '" y="' + (yy + 17) + '" text-anchor="middle" font-size="12"' +
        (negrita ? ' font-weight="700"' : "") + ">" + t + "</text>";
    }
    var p = mapa[actual], k = pesos.length;
    s += '<text x="4" y="' + (40 + 17) + '" font-size="12" fill="#24292f">ventana</text>';
    for (var i = 0; i < x.length; i++) {
      var dentro = i >= p.inicio && i < p.inicio + k;
      s += '<text x="' + (izq + i * c + (c - 4) / 2) + '" y="34" text-anchor="middle" font-size="10" fill="#7f7f7f">' + (i + 1) + "</text>";
      s += caja(izq + i * c, 40, coma(x[i]), dentro ? "#fde3c4" : "#fff");
    }
    s += '<rect x="' + (izq + p.inicio * c - 3) + '" y="37" width="' + (k * c + 2) + '" height="' + (alto + 6) +
      '" fill="none" stroke="#b03a2e" stroke-width="2.5" rx="3"/>';
    for (var j = 0; j < k; j++) {
      s += '<text x="' + (izq + (p.inicio + j) * c + (c - 4) / 2) + '" y="86" text-anchor="middle" font-size="11" fill="#b03a2e">× ' +
        coma(pesos[j], 2) + "</text>";
    }
    var y2 = 120, centro = izq + (p.inicio + (k - 1) / 2) * c + (c - 4) / 2;
    s += '<line x1="' + centro + '" y1="92" x2="' + centro + '" y2="' + (y2 - 4) + '" stroke="#b03a2e" stroke-width="2" marker-end="url(#punta)"/>';
    s += '<defs><marker id="punta" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#b03a2e"/></marker></defs>';
    s += '<text x="4" y="' + (y2 + 17) + '" font-size="12" fill="#24292f">mapa</text>';
    for (var m = 0; m < mapa.length; m++) {
      var xx = izq + (mapa[m].inicio + (k - 1) / 2) * c;
      var visto = m <= actual;
      s += caja(xx, y2, visto ? coma(mapa[m].valor) : "", m === actual ? "#d5f0d5" : visto ? "#fff" : "#f3f4f6", m === actual);
      s += '<text x="' + (xx + (c - 4) / 2) + '" y="' + (y2 + alto + 13) + '" text-anchor="middle" font-size="10" fill="#7f7f7f">' + (m + 1) + "</text>";
    }
    return '<svg class="grafica" viewBox="0 0 ' + W + ' 170" width="100%" role="img" xmlns="http://www.w3.org/2000/svg">' + s + "</svg>";
  }

  return { ventana: ventana, mesesDe: mesesDe, deslizar: deslizar, dibujo: dibujo, coma: coma,
    parametrosConv: parametrosConv, MLP: MLP, LSTM: LSTM };
})();

if (typeof module !== "undefined") { module.exports = Convolucion; }
