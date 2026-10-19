/* Funciones de series de tiempo para las actividades del curso. Cada una
   recibe y devuelve arreglos de números y sigue la definición que usan
   pandas y statsmodels en los notebooks, para que los valores coincidan. */
var Series = (function () {
  "use strict";

  function media(x) {
    var s = 0;
    for (var i = 0; i < x.length; i++) { s += x[i]; }
    return s / x.length;
  }

  /* Diferencia con rezago k: x(t) - x(t-k). Pierde los k primeros datos,
     igual que serie.diff(k).dropna(). */
  function diff(x, k) {
    k = k || 1;
    var y = [];
    for (var t = k; t < x.length; t++) { y.push(x[t] - x[t - k]); }
    return y;
  }

  /* D diferencias estacionales (rezago m) y después d regulares, como
     diferenciar() de la sesión 3. */
  function diferenciar(x, d, D, m) {
    m = m || 12;
    var y = x.slice();
    for (var i = 0; i < D; i++) { y = diff(y, m); }
    for (var j = 0; j < d; j++) { y = diff(y, 1); }
    return y;
  }

  /* Los pares (x(t-k), x(t)) que existen: lo que hace serie.shift(k) antes
     de descartar los NaN. */
  function shift(x, k) {
    return { previo: x.slice(0, x.length - k), actual: x.slice(k) };
  }

  /* Correlación de Pearson entre dos arreglos del mismo largo, cada uno con
     su propia media: la de x.corr(x.shift(k)) en pandas. */
  function corr(a, b) {
    var ma = media(a), mb = media(b), sab = 0, saa = 0, sbb = 0;
    for (var i = 0; i < a.length; i++) {
      var da = a[i] - ma, db = b[i] - mb;
      sab += da * db; saa += da * da; sbb += db * db;
    }
    return sab / Math.sqrt(saa * sbb);
  }

  /* Autocorrelación de los rezagos 0 a nlags con la media de toda la serie
     y el denominador de la varianza completa, como statsmodels.acf. */
  function acf(x, nlags) {
    var n = x.length, m = media(x), c0 = 0, r = [];
    for (var i = 0; i < n; i++) { c0 += (x[i] - m) * (x[i] - m); }
    for (var k = 0; k <= nlags; k++) {
      var c = 0;
      for (var t = k; t < n; t++) { c += (x[t] - m) * (x[t - k] - m); }
      r.push(c / c0);
    }
    return r;
  }

  /* Autocorrelación parcial por la recursión de Durbin-Levinson sobre la
     ACF anterior; coincide con pacf(method="ywm") de statsmodels. */
  function pacf(x, nlags) {
    var r = acf(x, nlags), p = [1], phi = [], v = 1;
    for (var k = 1; k <= nlags; k++) {
      var num = r[k];
      for (var j = 1; j < k; j++) { num -= phi[j] * r[k - j]; }
      var pkk = num / v, nuevo = [];
      for (var i = 1; i < k; i++) { nuevo[i] = phi[i] - pkk * phi[k - i]; }
      nuevo[k] = pkk;
      phi = nuevo;
      v = v * (1 - pkk * pkk);
      p.push(pkk);
    }
    return p;
  }

  /* Media banda de los correlogramas para ruido blanco: 1,96 / raíz de n. */
  function banda(n) { return 1.96 / Math.sqrt(n); }

  /* Media banda de Bartlett en el rezago k, la que dibuja plot_acf de
     statsmodels: 1,96 por raíz de (1 + 2 suma de r_j^2 para j < k) / n.
     Se ensancha cuando los rezagos anteriores no son cero. */
  function bandaBartlett(r, k, n) {
    var s = 1;
    for (var j = 1; j < k; j++) { s += 2 * r[j] * r[j]; }
    return 1.96 * Math.sqrt(s / n);
  }

  /* Generador pseudoaleatorio con semilla (mulberry32) y normales por
     Box-Muller. La misma semilla da la misma secuencia en cualquier
     navegador. */
  function generador(semilla) {
    var a = semilla >>> 0;
    function uniforme() {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    function normal() {
      var u = 0, v = 0;
      while (u === 0) { u = uniforme(); }
      v = uniforme();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
    return { uniforme: uniforme, normal: normal };
  }

  /* y(t) = phi * y(t-1) + e(t), con el mismo ruido para todo phi. */
  function ar1(phi, n, semilla) {
    n = n || 110;
    var g = generador(semilla === undefined ? 2026 : semilla);
    var ruido = [];
    for (var i = 0; i < n; i++) { ruido.push(g.normal()); }
    var y = [0];
    for (var t = 1; t < n; t++) { y.push(phi * y[t - 1] + ruido[t]); }
    return y;
  }

  /* ARMA(p, q): y(t) = suma de phi_i y(t-i) + e(t) + suma de theta_j e(t-j),
     con el signo de statsmodels para theta. El ruido sale de la semilla y es
     el mismo para cualquier valor de los coeficientes. Se simulan `quemado`
     datos de más y se descartan, para que el arranque en cero no se note. */
  function arma(phis, thetas, n, semilla, quemado) {
    n = n || 110;
    quemado = quemado === undefined ? 50 : quemado;
    var g = generador(semilla === undefined ? 2026 : semilla);
    var total = n + quemado, e = [], y = [];
    for (var i = 0; i < total; i++) { e.push(g.normal()); }
    for (var t = 0; t < total; t++) {
      var v = e[t];
      for (var a = 0; a < phis.length; a++) { if (t - a - 1 >= 0) { v += phis[a] * y[t - a - 1]; } }
      for (var b = 0; b < thetas.length; b++) { if (t - b - 1 >= 0) { v += thetas[b] * e[t - b - 1]; } }
      y.push(v);
    }
    return y.slice(quemado);
  }

  /* ACF teórica de un ARMA por los pesos psi de su forma MA infinita:
     rho(k) = suma de psi_j psi_(j+k) entre la suma de psi_j^2. */
  function acfTeorica(phis, thetas, nlags, terminos) {
    terminos = terminos || 600;
    var psi = [1];
    for (var j = 1; j < terminos + nlags; j++) {
      var v = j <= thetas.length ? thetas[j - 1] : 0;
      for (var a = 0; a < phis.length; a++) { if (j - a - 1 >= 0) { v += phis[a] * psi[j - a - 1]; } }
      psi.push(v);
    }
    var c0 = 0, r = [];
    for (var i = 0; i < terminos; i++) { c0 += psi[i] * psi[i]; }
    for (var k = 0; k <= nlags; k++) {
      var c = 0;
      for (var m = 0; m < terminos; m++) { c += psi[m] * psi[m + k]; }
      r.push(c / c0);
    }
    return r;
  }

  /* Un AR(2) es estacionario dentro del triángulo
     phi1 + phi2 < 1, phi2 - phi1 < 1, |phi2| < 1. */
  function estacionarioAR2(phi1, phi2) {
    return phi1 + phi2 < 1 && phi2 - phi1 < 1 && Math.abs(phi2) < 1;
  }

  /* Residuos condicionales de un ARMA con coeficientes dados: los valores
     y los errores anteriores al primer dato se toman como cero.
     e(t) = x(t) - suma de phi_i x(t-i) - suma de theta_j e(t-j). */
  function residuosArma(x, phis, thetas) {
    var e = [];
    for (var t = 0; t < x.length; t++) {
      var v = x[t];
      for (var a = 0; a < phis.length; a++) { if (t - a - 1 >= 0) { v -= phis[a] * x[t - a - 1]; } }
      for (var b = 0; b < thetas.length; b++) { if (t - b - 1 >= 0) { v -= thetas[b] * e[t - b - 1]; } }
      e.push(v);
    }
    return e;
  }

  /* Deshace d = 1 y D = 1 con periodo m. Si w(t) = y(t) - y(t-1) - y(t-m)
     + y(t-m-1), cada pronóstico es y(t) = y(t-1) + y(t-m) - y(t-m-1) + w(t);
     cuando un y anterior cae en el futuro, entra su pronóstico. */
  function integrar(historia, wHat, m) {
    m = m || 12;
    var y = historia.slice(), T = historia.length, salida = [];
    for (var h = 0; h < wHat.length; h++) {
      var t = T + h;
      var v = y[t - 1] + y[t - m] - y[t - m - 1] + wHat[h];
      y.push(v);
      salida.push(v);
    }
    return salida;
  }


  function mae(y, yh) {
    var s = 0;
    for (var i = 0; i < y.length; i++) { s += Math.abs(y[i] - yh[i]); }
    return s / y.length;
  }

  function rmse(y, yh) {
    var s = 0;
    for (var i = 0; i < y.length; i++) { s += (y[i] - yh[i]) * (y[i] - yh[i]); }
    return Math.sqrt(s / y.length);
  }

  function mape(y, yh) {
    var s = 0;
    for (var i = 0; i < y.length; i++) { s += Math.abs((y[i] - yh[i]) / y[i]); }
    return 100 * s / y.length;
  }

  /* Repite el último valor observado durante h meses. */
  function ingenuo(entrenamiento, h) {
    var u = entrenamiento[entrenamiento.length - 1], y = [];
    for (var i = 0; i < h; i++) { y.push(u); }
    return y;
  }

  /* Repite el mismo mes del último año observado. */
  function estacional_ingenuo(entrenamiento, h, m) {
    m = m || 12;
    var ultimo = entrenamiento.slice(entrenamiento.length - m), y = [];
    for (var i = 0; i < h; i++) { y.push(ultimo[i % m]); }
    return y;
  }

  return {
    media: media, diff: diff, diferenciar: diferenciar, shift: shift,
    corr: corr, acf: acf, pacf: pacf, banda: banda, bandaBartlett: bandaBartlett, generador: generador,
    ar1: ar1, arma: arma, acfTeorica: acfTeorica, estacionarioAR2: estacionarioAR2,
    residuosArma: residuosArma, integrar: integrar, mae: mae, rmse: rmse, mape: mape, ingenuo: ingenuo,
    estacional_ingenuo: estacional_ingenuo
  };
})();

if (typeof module !== "undefined") { module.exports = Series; }
