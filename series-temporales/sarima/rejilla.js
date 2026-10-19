/* La rejilla SARIMA y sus residuos. Los AIC de 36 SARIMA y los residuos de
   cinco de ellos vienen de statsmodels; los correlogramas de w y de los
   residuos se calculan aquí. */
(function () {
  "use strict";

  function fmt(v, d) {
    var t = v.toFixed(d === undefined ? 2 : d);
    if (Number(t) === 0) { t = t.replace("-", ""); }
    return t.replace(".", ",").replace("-", "−");
  }

  /* ARIMA(y, order=(p, 1, q), seasonal_order=(P, 1, Q, 12)).fit() de
     statsmodels 0.15 con y en millones de pasajeros y los huecos de 2019
     interpolados. REJILLA: clave "p,q,P,Q" -> [AIC, convergió]. RESIDUOS:
     resid[13:] en millones, coeficientes y acorr_ljungbox(lags=[12, 24]).
     Guion: cursos/seriestemporales/tools/precalculo_actividades_arma_sarima.py. */
  var REJILLA = {
    "0,0,0,0": [142.47, true],
    "0,0,0,1": [95.05, true],
    "0,0,1,0": [120.23, true],
    "0,0,1,1": [97.03, true],
    "0,1,0,0": [142.56, true],
    "0,1,0,1": [95.21, true],
    "0,1,1,0": [119.38, true],
    "0,1,1,1": [97.19, true],
    "0,2,0,0": [144.56, true],
    "0,2,0,1": [96.92, true],
    "0,2,1,0": [120.97, true],
    "0,2,1,1": [98.89, true],
    "1,0,0,0": [142.48, true],
    "1,0,0,1": [95.34, true],
    "1,0,1,0": [119.66, true],
    "1,0,1,1": [97.33, true],
    "1,1,0,0": [142.86, true],
    "1,1,0,1": [96.86, true],
    "1,1,1,0": [121.27, true],
    "1,1,1,1": [98.86, true],
    "1,2,0,0": [144.76, true],
    "1,2,0,1": [98.83, true],
    "1,2,1,0": [123.06, true],
    "1,2,1,1": [100.83, true],
    "2,0,0,0": [144.31, true],
    "2,0,0,1": [97.32, true],
    "2,0,1,0": [121.6, true],
    "2,0,1,1": [99.31, true],
    "2,1,0,0": [144.81, true],
    "2,1,0,1": [98.09, true],
    "2,1,1,0": [121.45, true],
    "2,1,1,1": [100.07, true],
    "2,2,0,0": [142.47, true],
    "2,2,0,1": [99.78, true],
    "2,2,1,0": [124.05, true],
    "2,2,1,1": [102.03, false]
  };
  var RESIDUOS = {
    "0,0,0,0": { aic: 142.47, coef: {}, lb12: 0.0001, lb24: 0.0001,
      resid: [0.0642, 0.0385, -0.0284, 0.0165, -0.0125, 0.0608, 0.0015, -0.8971, 1.4966, -0.1334, -0.0413, 0.0553, -0.177, 0.0502, -0.0405, 0.1416, 0.0174, -0.1718, 0.1417, 1.2592, -1.5757, 0.1386, -0.1085, -0.1941, 0.3569, -1.6947, -1.8516, -0.1492, -0.1472, -0.1086, -0.1026, 0.4672, 0.6262, 0.1986, 0.438, 0.2055, 0.0423, 1.804, 1.618, 0.0784, 0.7428, 0.3695, 0.0438, -0.4068, -0.2655, 0.1503, -0.1287, -0.146, -0.364, 0.2003, 0.376, -0.1453, -0.5984, 0.0129, -0.2202, -0.2413, -0.0177, -0.6667, -0.1413, 0.0875, -0.0256, -0.4932, -0.3277, 0.377, 0.096, 0.0412, 0.1354, -0.0801, -0.126, 0.5068, 0.0987, -0.0872, 0.0164, 0.1633, 0.0941, -0.0896, 0.0123, -0.1357, 0.0531, -0.0148, 0.1277, -0.3884, 0.0211, 0.0139, -0.3352, 0.0377, 0.0573, -0.2199, 0.1328, 0.0652, -0.1142, -0.0103, 0.053, -0.0161, 0.106, 0.2483, 0.006] },
    "0,0,1,0": { aic: 120.23, coef: {"ar.S.L12": -0.471}, lb12: 0.2363, lb24: 0.0025,
      resid: [0.0642, 0.0385, -0.0284, 0.0165, -0.0125, 0.0608, 0.0015, -0.8971, 1.4966, -0.1334, -0.0413, 0.0553, -0.1468, 0.0683, -0.0539, 0.1493, 0.0116, -0.1432, 0.1425, 0.837, -0.8715, 0.0758, -0.1279, -0.1681, 0.2736, -1.6711, -1.8707, -0.0826, -0.139, -0.1894, -0.0359, 1.0598, -0.1153, 0.2638, 0.387, 0.1142, 0.2102, 1.0065, 0.7466, 0.0082, 0.6736, 0.3184, -0.0045, -0.1869, 0.0292, 0.2437, 0.0775, -0.0493, -0.3441, 1.0493, 1.1374, -0.1084, -0.2489, 0.1868, -0.1996, -0.4327, -0.1427, -0.596, -0.2018, 0.0187, -0.1969, -0.3989, -0.1507, 0.3086, -0.1856, 0.0473, 0.0318, -0.1937, -0.1344, 0.1931, 0.0323, -0.0461, 0.0044, -0.0687, -0.0601, 0.0878, 0.0575, -0.1163, 0.1168, -0.0525, 0.0684, -0.1499, 0.0676, -0.0272, -0.3275, 0.1146, 0.1016, -0.2621, 0.1386, 0.0013, -0.0892, -0.0173, 0.1131, -0.1989, 0.116, 0.2548, -0.1517] },
    "0,0,0,1": { aic: 95.05, coef: {"ma.S.L12": -0.994}, lb12: 0.6173, lb24: 0.2332,
      resid: [0.0642, 0.0385, -0.0284, 0.0165, -0.0125, 0.0608, 0.0015, -0.8971, 1.4966, -0.1334, -0.0413, 0.0553, -0.1449, 0.0695, -0.0547, 0.1498, 0.0112, -0.1414, 0.1425, 0.8106, -0.8275, 0.0719, -0.1291, -0.1664, 0.2603, -1.6484, -1.8881, -0.0493, -0.1397, -0.2029, -0.0076, 1.0076, 0.0746, 0.2466, 0.3519, 0.0946, 0.2375, 0.5678, 0.202, 0.0414, 0.638, 0.2173, 0.038, 0.3489, -0.2095, 0.3352, 0.1353, -0.0751, -0.174, 0.6545, 0.5376, -0.1122, -0.088, 0.1867, -0.1898, 0.0378, -0.1854, -0.3986, -0.033, 0.0274, -0.1707, 0.0522, 0.1203, 0.2835, 0.0227, 0.1968, -0.0227, -0.0486, -0.2805, 0.1747, 0.0712, -0.0644, -0.1298, 0.2081, 0.1972, 0.1534, 0.0317, 0.033, 0.0336, -0.0565, -0.1126, -0.2386, 0.0822, -0.0413, -0.4488, 0.2198, 0.2298, -0.0857, 0.1606, 0.0941, -0.0848, -0.0598, -0.0455, -0.2249, 0.1779, 0.2121, -0.3929] },
    "1,0,0,1": { aic: 95.34, coef: {"ar.L1": 0.132, "ma.S.L12": -0.997}, lb12: 0.7409, lb24: 0.1817,
      resid: [0.0642, 0.03, -0.0335, 0.0203, -0.0146, 0.0624, -0.0065, -0.8973, 1.6153, -0.3314, -0.0231, 0.0649, -0.1508, 0.0887, -0.0639, 0.1571, -0.0086, -0.1429, 0.1612, 0.7918, -0.9348, 0.1814, -0.1388, -0.1504, 0.2801, -1.6829, -1.6699, 0.2006, -0.1332, -0.1844, 0.0192, 1.0086, -0.0588, 0.2367, 0.3196, 0.0502, 0.2255, 0.5363, 0.1268, 0.0147, 0.6326, 0.1329, 0.0093, 0.3439, -0.2557, 0.363, 0.0913, -0.0899, -0.1649, 0.6775, 0.4509, -0.1833, -0.0732, 0.1984, -0.2145, 0.0629, -0.1904, -0.374, 0.02, 0.0335, -0.1744, 0.0748, 0.1134, 0.2676, -0.0148, 0.1938, -0.0488, -0.0456, -0.274, 0.2119, 0.0482, -0.0729, -0.1216, 0.2253, 0.1696, 0.1273, 0.0114, 0.0288, 0.0292, -0.0609, -0.1052, -0.2237, 0.1138, -0.0517, -0.4435, 0.2792, 0.2007, -0.1161, 0.1719, 0.0728, -0.0973, -0.0485, -0.0377, -0.2189, 0.2076, 0.1882, -0.4206] },
    "0,1,0,1": { aic: 95.21, coef: {"ma.L1": 0.147, "ma.S.L12": -0.998}, lb12: 0.7563, lb24: 0.1915,
      resid: [0.0642, 0.0293, -0.0327, 0.0213, -0.0156, 0.0631, -0.0077, -0.896, 1.6282, -0.3725, 0.0134, 0.0576, -0.1513, 0.0916, -0.0682, 0.1598, -0.0123, -0.1396, 0.163, 0.7867, -0.943, 0.2104, -0.1601, -0.1446, 0.2792, -1.6893, -1.6399, 0.1916, -0.1679, -0.1782, 0.0186, 1.0049, -0.0731, 0.2573, 0.3141, 0.0529, 0.2302, 0.534, 0.1235, 0.0233, 0.6346, 0.1241, 0.0198, 0.346, -0.2604, 0.3734, 0.0804, -0.0824, -0.1624, 0.6783, 0.4379, -0.1765, -0.0621, 0.1959, -0.2185, 0.0699, -0.1956, -0.3698, 0.0213, 0.0266, -0.1745, 0.0779, 0.1088, 0.2675, -0.0166, 0.1993, -0.052, -0.0409, -0.2745, 0.215, 0.0396, -0.0689, -0.1199, 0.2257, 0.164, 0.1293, 0.0127, 0.0312, 0.029, -0.0607, -0.1037, -0.2234, 0.115, -0.0575, -0.4405, 0.2845, 0.188, -0.1133, 0.1772, 0.0681, -0.0948, -0.0458, -0.0388, -0.2192, 0.2101, 0.1809, -0.4192] }
  };

  var NLAGS = 36, NLAGS_R = 24;
  var w = Series.diferenciar(SERIE.valores, 1, 1, 12);
  var N = w.length, BANDA = Series.banda(N);
  var acfW = Series.acf(w, NLAGS), pacfW = Series.pacf(w, NLAGS);
  var mesesR = SERIE.meses.slice(SERIE.meses.length - N);
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  function nombreMes(m) { return MESES[+m.slice(5) - 1] + " de " + m.slice(0, 4); }

  function fuera(v, hasta) {
    var f = [];
    for (var k = 1; k <= hasta; k++) { if (Math.abs(v[k]) > BANDA) { f.push(k); } }
    return f;
  }

  function nombre(clave) {
    var c = clave.split(",");
    return "(" + c[0] + ",1," + c[1] + ")(" + c[2] + ",1," + c[3] + ")₁₂";
  }
  var ORDEN = Object.keys(REJILLA).sort(function (a, b) { return REJILLA[a][0] - REJILLA[b][0]; });
  var MEJOR = ORDEN[0];

  var NOMBRES_COEF = { "ar.L1": "φ₁", "ar.L2": "φ₂", "ma.L1": "θ₁", "ma.L2": "θ₂", "ar.S.L12": "Φ", "ma.S.L12": "Θ" };
  Object.keys(RESIDUOS).forEach(function (k) {
    var r = RESIDUOS[k];
    r.clave = k;
    r.nombre = nombre(k);
    r.acf = Series.acf(r.resid, NLAGS_R);
    var iMax = 0;
    r.resid.forEach(function (x, i) { if (Math.abs(x) > Math.abs(r.resid[iMax])) { iMax = i; } });
    r.iMax = iMax;
    r.coefTexto = Object.keys(r.coef).map(function (c) { return NOMBRES_COEF[c] + " = " + fmt(r.coef[c], 3); }).join(", ") || "ninguno";
  });
  var VISTOS = ["0,0,0,0", "0,0,1,0", "0,0,0,1", "1,0,0,1", "0,1,0,1"];

  var sinEst = RESIDUOS["0,0,0,0"], conQ = RESIDUOS[MEJOR], conP = RESIDUOS["0,0,1,0"];
  var conQuno = ORDEN.filter(function (k) { return k.slice(-1) === "1"; });
  var primerSinQ = ORDEN.filter(function (k) { return k.slice(-1) === "0"; })[0];

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mirar la rejilla",
    definicion: null,
    explicacion: "La ACF de w sale de la banda ±" + fmt(BANDA, 3) + " en " + fuera(acfW, NLAGS).join(", ") + ", y la PACF en " + fuera(pacfW, NLAGS).join(", ") + ".",
    items: [
      { valor: "Mirando los rezagos 12, 24 y 36, ¿qué término estacional propone?",
        opciones: ["Un AR estacional, P = 1", "Un MA estacional, Q = 1", "Ninguno"], correcta: 1,
        razon: "En la ACF hay una barra estacional, la de k = 12 (" + fmt(acfW[12]) + "), y la de 24 ya está adentro (" + fmt(acfW[24]) + "). En la PACF salen 12 y 24 (" + fmt(pacfW[12]) + " y " + fmt(pacfW[24]) + "). Es la firma de un MA(1) con los rezagos contados de doce en doce: la ACF se corta y la PACF decae." },
      { valor: "Dos modelos quedan a menos de 2 puntos de AIC. ¿Cuál se escoge?",
        opciones: ["El de menor AIC, siempre", "El de más parámetros", "El de menos parámetros"], correcta: 2,
        razon: "Cada parámetro suma 2 al AIC, así que una diferencia menor que 2 no alcanza a pagar un parámetro. Entre modelos así de cerca se escoge el más simple, que se estima con menos incertidumbre." }
    ],
    cierre: "La firma propone Q = 1 y el AIC decide entre los vecinos."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con la rejilla y los residuos",
    definicion: null,
    explicacion: "Responda con la tabla y con los botones de los cinco modelos.",
    items: [
      { valor: "¿Cuál tiene el menor AIC de la rejilla?",
        opciones: [ORDEN[2], ORDEN[0], ORDEN[1]].map(nombre), correcta: 1,
        razon: "El " + nombre(MEJOR) + ", con " + fmt(REJILLA[MEJOR][0]) + ". Le siguen " + nombre(ORDEN[1]) + " con " + fmt(REJILLA[ORDEN[1]][0]) + " y " + nombre(ORDEN[2]) + " con " + fmt(REJILLA[ORDEN[2]][0]) + ": a menos de un punto, y el primero tiene un solo coeficiente." },
      { valor: "Ljung-Box con 24 rezagos: ¿cuál de los dos pasa, el modelo sin término estacional o el de menor AIC?",
        opciones: ["Los dos", "Solo el de menor AIC", "Ninguno"], correcta: (sinEst.lb24 < 0.05 && conQ.lb24 >= 0.05) ? 1 : (sinEst.lb24 >= 0.05 ? 0 : 2),
        razon: "Sin término estacional, p = " + fmt(sinEst.lb24, 4) + " y la barra de k = 12 de los residuos vale " + fmt(sinEst.acf[12]) + ". Con Θ, p = " + fmt(conQ.lb24, 3) + " y la barra baja a " + fmt(conQ.acf[12]) + ", dentro de la banda." },
      { valor: "Con un AR estacional, P = 1, en lugar del MA, ¿qué pasa?",
        opciones: ["Da lo mismo que con Q = 1", "El AIC baja", "El AIC sube y Ljung-Box rechaza con 24 rezagos"], correcta: (conP.aic > conQ.aic && conP.lb24 < 0.05) ? 2 : 0,
        razon: nombre("0,0,1,0") + ": AIC " + fmt(conP.aic) + ", " + fmt(conP.aic - conQ.aic, 1) + " puntos por encima, y Ljung-Box con 24 rezagos da p = " + fmt(conP.lb24, 4) + ". Con Φ = " + fmt(conP.coef["ar.S.L12"], 3) + " la barra de k = 24 de los residuos queda en " + fmt(conP.acf[24]) + ": un AR estacional deja memoria en 24, 36 y más, y w no la tiene: su ACF en k = 24 vale " + fmt(acfW[24]) + "." },
      { valor: "En el de menor AIC, Θ = " + fmt(conQ.coef["ma.S.L12"], 3) + ". ¿Qué dice un Θ tan cerca de −1?",
        opciones: ["Que falta otra diferencia", "Que el patrón de cada mes cambia muy poco de un año a otro", "Que el modelo no sirve"], correcta: 1,
        razon: "El modelo es (1 − B)(1 − B¹²) y = (1 " + (conQ.coef["ma.S.L12"] < 0 ? "−" : "+") + " " + fmt(Math.abs(conQ.coef["ma.S.L12"]), 3) + "B¹²) e: con Θ = −1 los factores en B¹² se cancelarían. La diferencia estacional quita un patrón que es casi fijo, y el MA estacional devuelve casi todo lo que ella quitó." },
      { valor: "¿Dónde está el residuo más grande del de menor AIC?",
        opciones: ["septiembre de 2018", nombreMes(mesesR[conQ.iMax]), "diciembre de 2024"], correcta: 1,
        razon: "En " + nombreMes(mesesR[conQ.iMax]) + ", con " + fmt(conQ.resid[conQ.iMax], 3) + " millones. Ningún SARIMA anticipa el cierre de los aeropuertos; septiembre de 2018 deja " + fmt(conQ.resid[mesesR.indexOf("2018-09")], 3) + "." }
    ],
    cierre: "El MA estacional absorbe la barra de k = 12 que ningún ARMA alcanzaba; lo que queda es la pandemia."
  };

  /* --- Interfaz ----------------------------------------------------- */
  if (typeof document === "undefined") {
    module.exports = { REJILLA: REJILLA, RESIDUOS: RESIDUOS, ORDEN: ORDEN, ANTES: ANTES, DESPUES: DESPUES, acfW: acfW, pacfW: pacfW };
    return;
  }

  document.getElementById("figura-acf-w").innerHTML = Grafica.correlograma(acfW, N,
    { titulo: "ACF de w", ancho: 380, alto: 220, marcasX: [0, 12, 24, 36] });
  document.getElementById("figura-pacf-w").innerHTML = Grafica.correlograma(pacfW, N,
    { titulo: "PACF de w", ancho: 380, alto: 220, desde: 1, marcasX: [1, 12, 24, 36] });

  function filas(claves, elegido) {
    return claves.map(function (k, i) {
      var vista = VISTOS.indexOf(k) >= 0;
      var estilo = k === elegido ? ' style="font-weight:700;color:var(--azul)"' : "";
      return "<tr" + estilo + "><td>" + (ORDEN.indexOf(k) + 1) + "</td><td>" + nombre(k) + "</td><td>" + fmt(REJILLA[k][0]) + "</td><td>" +
        fmt(REJILLA[k][0] - REJILLA[MEJOR][0]) + "</td><td>" + (REJILLA[k][1] ? "sí" : "no") + "</td><td>" + (vista ? "sí" : "") + "</td></tr>";
    }).join("");
  }
  var cabecera = "<table><thead><tr><th>#</th><th>modelo</th><th>AIC</th><th>sobre el mejor</th><th>convergió</th><th>con residuos</th></tr></thead><tbody>";

  var selector = document.getElementById("modelos");
  selector.innerHTML = VISTOS.map(function (k) {
    return '<button data-k="' + k + '"' + (k === "0,0,0,0" ? ' class="elegido"' : "") + ">" + nombre(k) + "</button>";
  }).join("");

  var eneros = [];
  mesesR.forEach(function (m, i) { if (m.slice(5) === "01") { eneros.push(i); } });

  function dibujar(k) {
    var r = RESIDUOS[k];
    document.getElementById("lectura").innerHTML = r.nombre + ": <b>AIC " + fmt(r.aic) + "</b>; coeficientes: " + r.coefTexto +
      ". ACF de los residuos en k = 1 <b>" + fmt(r.acf[1]) + "</b> y en k = 12 <b>" + fmt(r.acf[12]) + "</b>; fuera de la banda en " +
      (fuera(r.acf, NLAGS_R).join(", ") || "ninguno") + ". Ljung-Box: p = " + fmt(r.lb12, 4) + " con 12 rezagos y p = " + fmt(r.lb24, 4) +
      " con 24. Residuo más grande: " + fmt(r.resid[r.iMax], 3) + " millones, en " + nombreMes(mesesR[r.iMax]) + ".";
    document.getElementById("figura-resid").innerHTML = Grafica.lineas({
      titulo: "Residuos de " + r.nombre + ", millones de pasajeros", cero: true, alto: 200,
      lineas: [{ valores: r.resid }], marcasX: eneros, rotuloX: function (j) { return mesesR[j].slice(0, 4); }
    });
    document.getElementById("figura-acf-resid").innerHTML = Grafica.correlograma(r.acf, N,
      { titulo: "ACF de los residuos", alto: 220, marcasX: [0, 6, 12, 18, 24] });
    document.getElementById("tabla-rejilla").innerHTML = cabecera + filas(ORDEN.slice(0, 12), k) + "</tbody></table>";
    document.getElementById("tabla-completa").innerHTML = cabecera + filas(ORDEN, k) + "</tbody></table>";
  }

  selector.querySelectorAll("button").forEach(function (b) {
    b.addEventListener("click", function () {
      selector.querySelectorAll("button").forEach(function (o) { o.classList.remove("elegido"); });
      b.classList.add("elegido");
      dibujar(b.getAttribute("data-k"));
    });
  });
  dibujar("0,0,0,0");

  document.getElementById("cierre-tabla").innerHTML =
    "<table><thead><tr><th>modelo</th><th>AIC</th><th>ACF residuos k = 12</th><th>Ljung-Box p, 12</th><th>Ljung-Box p, 24</th></tr></thead><tbody>" +
    VISTOS.map(function (k) {
      var r = RESIDUOS[k];
      return "<tr><td>" + r.nombre + "</td><td>" + fmt(r.aic) + "</td><td>" + fmt(r.acf[12]) + "</td><td>" + fmt(r.lb12, 4) + "</td><td>" + fmt(r.lb24, 4) + "</td></tr>";
    }).join("") + "</tbody></table>" +
    '<p class="nota">De los treinta y seis, ' + conQuno.length + " tienen Q = 1, y el mejor sin MA estacional, " + nombre(primerSinQ) +
    ", queda " + fmt(REJILLA[primerSinQ][0] - REJILLA[MEJOR][0], 1) + " puntos por encima del primero.</p>";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
