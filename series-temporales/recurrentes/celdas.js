/* Las cuentas de una celda RNN y de una celda LSTM de una neurona, paso a paso,
   sobre la ventana de enero de 2025 en la escala de la red, y el diagrama de la
   celda desenrollada en los doce pasos. Los pesos son los del ejemplo a mano
   del deck, elegidos para la cuenta: no salen de un entrenamiento. */
var Celdas = (function () {
  "use strict";

  var X = DATOS.ventana.escalado;
  var NARANJA = "#d9822b", AZUL = "#1f6feb", GRIS = "#8c959f", TINTA = "#24292f";

  function sigmoide(s) { return 1 / (1 + Math.exp(-s)); }

  /* RNN: h_t = tanh(w x_t + u h_{t-1} + b), con h_0 = 0. */
  var RNN = { w: 0.5, b: 0.1 };
  function rnn(x, u) {
    var h = 0, pasos = [];
    x.forEach(function (v) {
      var wx = RNN.w * v, uh = u * h, suma = wx + uh + RNN.b;
      var nuevo = Math.tanh(suma);
      pasos.push({ x: v, hAntes: h, wx: wx, uh: uh, suma: suma, h: nuevo });
      h = nuevo;
    });
    return pasos;
  }

  /* Cuánto de lo que el estado tenía en el paso t sigue en el paso 12:
     el producto de u (1 − h_k²) para k = t + 1, …, 12. */
  function quedaRnn(pasos, u) {
    return pasos.map(function (p, t) {
      var f = 1;
      for (var k = t + 1; k < pasos.length; k++) { f *= u * (1 - pasos[k].h * pasos[k].h); }
      return f;
    });
  }

  /* LSTM: las tres compuertas con 0,5 x + 0,5 h + sesgo, y el candidato g con la
     misma cuenta de la RNN. Solo el sesgo de olvido se mueve. */
  var LSTM = { wc: 0.5, uc: 0.5, bi: 0, bo: 0 };
  function lstm(x, bf) {
    var h = 0, c = 0, pasos = [];
    x.forEach(function (v) {
      var base = LSTM.wc * v + LSTM.uc * h;
      var f = sigmoide(base + bf), i = sigmoide(base + LSTM.bi), o = sigmoide(base + LSTM.bo);
      var g = Math.tanh(RNN.w * v + 0.8 * h + RNN.b);
      var cNuevo = f * c + i * g, hNuevo = o * Math.tanh(cNuevo);
      pasos.push({ x: v, hAntes: h, cAntes: c, f: f, i: i, g: g, o: o, c: cNuevo, h: hNuevo });
      h = hNuevo; c = cNuevo;
    });
    return pasos;
  }

  /* Cuánto de lo que había en c en el paso t sigue en c_12 por el camino de la
     memoria: el producto de f_k para k = t + 1, …, 12. */
  function quedaLstm(pasos) {
    return pasos.map(function (p, t) {
      var f = 1;
      for (var k = t + 1; k < pasos.length; k++) { f *= pasos[k].f; }
      return f;
    });
  }

  /* Pesos de una celda con una variable de entrada y `oculta` neuronas, sin la capa de salida. */
  function pesos(red, oculta) {
    return (red === "LSTM" ? 4 : 1) * (oculta + oculta * oculta + 2 * oculta);
  }

  function pct(x) {
    if (x < 5e-7) { return "menos de 0,0001 %"; }
    var d = x >= 0.1 ? 0 : x >= 0.01 ? 1 : x >= 0.001 ? 2 : 4;
    return (100 * x).toFixed(Math.max(0, d)).replace(".", ",") + " %";
  }

  /* La celda desenrollada: una caja por paso, la entrada x por debajo y el estado
     que pasa a la caja siguiente. Con estados = ["c", "h"] dibuja dos carriles.
     El paso `actual` (1 a 12) y las flechas que llegan a él van en naranja. */
  function cadena(n, actual, estados, valores) {
    var W = 660, caja = 34, paso = 52, izq = 22, arriba = 34, H = 120;
    var s = '<svg class="grafica" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="La celda desenrollada en ' + n + ' pasos">';
    s += '<defs><marker id="punta" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">' +
      '<path d="M0,0 L8,4 L0,8 z" fill="context-stroke"/></marker></defs>';
    for (var k = 1; k <= n; k++) {
      var x0 = izq + (k - 1) * paso, hecho = k <= actual, este = k === actual;
      var color = este ? NARANJA : hecho ? AZUL : GRIS;
      s += '<rect x="' + x0 + '" y="' + arriba + '" width="' + caja + '" height="' + caja + '" rx="5" fill="' +
        (este ? "#fdf0e3" : "#fff") + '" stroke="' + color + '" stroke-width="' + (este ? 2.2 : 1.2) + '"/>';
      s += '<text x="' + (x0 + caja / 2) + '" y="' + (arriba + caja / 2 + 4) + '" text-anchor="middle" font-size="11" fill="' + TINTA + '">' + k + "</text>";
      /* la entrada x_k por debajo */
      s += '<line x1="' + (x0 + caja / 2) + '" x2="' + (x0 + caja / 2) + '" y1="' + (arriba + caja + 26) + '" y2="' + (arriba + caja + 3) +
        '" stroke="' + color + '" stroke-width="1.3" marker-end="url(#punta)"/>';
      s += '<text x="' + (x0 + caja / 2) + '" y="' + (arriba + caja + 40) + '" text-anchor="middle" font-size="11" fill="' + color + '">x' + k + "</text>";
      /* el estado que sale hacia la caja siguiente */
      if (k < n) {
        estados.forEach(function (e, j) {
          var y = arriba + (estados.length === 1 ? caja / 2 : 9 + j * 16);
          var llega = k + 1 === actual;
          s += '<line x1="' + (x0 + caja) + '" x2="' + (x0 + paso - 2) + '" y1="' + y + '" y2="' + y + '" stroke="' +
            (llega ? NARANJA : k < actual ? AZUL : GRIS) + '" stroke-width="' + (llega ? 2 : 1.2) + '" marker-end="url(#punta)"/>';
          if (k === 1 || llega) {
            s += '<text x="' + (x0 + caja + 3) + '" y="' + (y - 5) + '" font-size="10" fill="' + (llega ? NARANJA : GRIS) + '">' + e + "</text>";
          }
        });
      }
    }
    /* la salida del último paso */
    var xf = izq + (n - 1) * paso + caja;
    s += '<line x1="' + (izq + (n - 1) * paso + caja / 2) + '" x2="' + (izq + (n - 1) * paso + caja / 2) + '" y1="' + arriba + '" y2="' + (arriba - 18) +
      '" stroke="' + (actual === n ? NARANJA : GRIS) + '" stroke-width="1.3" marker-end="url(#punta)"/>';
    s += '<text x="' + (xf - 4) + '" y="' + (arriba - 22) + '" text-anchor="end" font-size="11" fill="' + TINTA + '">h12 → Linear → pronóstico</text>';
    s += '<text x="' + izq + '" y="14" font-size="11" fill="' + GRIS + '">' + valores + "</text>";
    return s + "</svg>";
  }

  return { X: X, rnn: rnn, lstm: lstm, quedaRnn: quedaRnn, quedaLstm: quedaLstm, pesos: pesos,
    sigmoide: sigmoide, pct: pct, cadena: cadena, RNN: RNN, LSTM: LSTM };
})();

if (typeof module !== "undefined") { module.exports = Celdas; }
