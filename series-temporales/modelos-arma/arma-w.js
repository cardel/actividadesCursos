/* Un ARMA para la serie diferenciada. w = diff(12).diff() de la serie del
   curso, su ACF y su PACF, y seis ARMA ajustados con statsmodels; los
   residuos y su ACF se calculan aquí con los coeficientes estimados. */
(function () {
  "use strict";

  function fmt(v, d) {
    var t = v.toFixed(d === undefined ? 2 : d);
    if (Number(t) === 0) { t = t.replace("-", ""); }
    return t.replace(".", ",").replace("-", "−");
  }

  /* ARIMA(w, order=(p, 0, q), trend="n").fit() de statsmodels 0.15, con la
     serie en millones de pasajeros y los huecos de 2019 interpolados;
     acorr_ljungbox(resid, lags=[12, 24]). Guion:
     cursos/seriestemporales/tools/precalculo_actividades_arma_sarima.py.
     acf12 es la ACF de los residuos de statsmodels en k = 12, para comparar. */
  var AJUSTES = [
    { p: 0, q: 0, aic: 142.47, phis: [], thetas: [], lb12: 0.0001, lb24: 0.0001, acf12: -0.464 },
    { p: 1, q: 0, aic: 142.48, phis: [0.142], thetas: [], lb12: 0.0005, lb24: 0.0002, acf12: -0.462 },
    { p: 0, q: 1, aic: 142.56, phis: [], thetas: [0.140], lb12: 0.0005, lb24: 0.0002, acf12: -0.464 },
    { p: 1, q: 1, aic: 142.86, phis: [0.729], thetas: [-0.597], lb12: 0.0013, lb24: 0.0005, acf12: -0.452 },
    { p: 2, q: 0, aic: 144.31, phis: [0.136, 0.041], thetas: [], lb12: 0.0006, lb24: 0.0002, acf12: -0.459 },
    { p: 0, q: 2, aic: 144.56, phis: [], thetas: [0.139, 0.004], lb12: 0.0005, lb24: 0.0002, acf12: -0.464 }
  ];

  var NLAGS = 24;
  var w = Series.diferenciar(SERIE.valores, 1, 1, 12).map(function (x) { return x / 1e6; });
  var mesesW = SERIE.meses.slice(SERIE.meses.length - w.length);
  var N = w.length, BANDA = Series.banda(N);
  var acfW = Series.acf(w, NLAGS), pacfW = Series.pacf(w, NLAGS);

  function fuera(v) {
    var f = [];
    for (var k = 1; k <= NLAGS; k++) { if (Math.abs(v[k]) > BANDA) { f.push(k); } }
    return f;
  }

  AJUSTES.forEach(function (a) {
    a.resid = Series.residuosArma(w, a.phis, a.thetas);
    a.acfResid = Series.acf(a.resid, NLAGS);
    a.nombre = "(" + a.p + ", " + a.q + ")";
  });

  function coeficientes(a) {
    var t = [];
    a.phis.forEach(function (v, i) { t.push("φ" + (i + 1) + " = " + fmt(v, 3)); });
    a.thetas.forEach(function (v, i) { t.push("θ" + (i + 1) + " = " + fmt(v, 3)); });
    return t.length ? t.join(", ") : "ninguno";
  }

  /* 6,7e-11 escrito como 6,7 · 10⁻¹¹. */
  function potencia(x) {
    var e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e);
    var sup = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
    return fmt(m, 1) + " · 10" + String(e).split("").map(function (c) { return sup[c]; }).join("");
  }
  function factorMA(t) { return "(1 " + (t < 0 ? "−" : "+") + " " + fmt(Math.abs(t)) + "B)"; }

  var mejor = AJUSTES.reduce(function (m, a) { return a.aic < m.aic ? a : m; });
  var peor = AJUSTES.reduce(function (m, a) { return a.aic > m.aic ? a : m; });
  var rango = peor.aic - mejor.aic;
  var a10 = AJUSTES[1], a11 = AJUSTES[3];
  var r12 = AJUSTES.map(function (a) { return a.acfResid[12]; });
  var r12min = Math.min.apply(null, r12), r12max = Math.max.apply(null, r12);
  var lbMax = Math.max.apply(null, AJUSTES.map(function (a) { return a.lb24; }));

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de ajustar",
    definicion: null,
    explicacion: "La ACF de w sale de la banda ±" + fmt(BANDA, 3) + " en los rezagos " + fuera(acfW).join(", ") + ", y la barra más grande es la de k = 12, con " + fmt(acfW[12]) + ".",
    items: [
      { valor: "Un AR(1) con φ = " + fmt(a10.phis[0]) + ", ¿cuánto de esa barra de k = 12 puede explicar?",
        opciones: ["Casi toda", "Casi nada", "La mitad"], correcta: 1,
        razon: "Casi nada: la ACF de un AR(1) en k = 12 vale φ¹², y " + fmt(a10.phis[0], 3) + "¹² ≈ " + potencia(Math.pow(a10.phis[0], 12)) + ". Un AR(1) recuerda el mes anterior; lo de hace un año ya lo olvidó." },
      { valor: "Entre los seis órdenes, con p y q hasta 2, ¿cuánto espera que separe el AIC del mejor y el del peor?",
        opciones: ["Entre 10 y 20 puntos", "Menos de 3 puntos", "Más de 50 puntos"], correcta: rango < 3 ? 1 : rango < 20 ? 0 : 2,
        razon: "Los separan " + fmt(rango) + " puntos: de " + fmt(mejor.aic) + " a " + fmt(peor.aic) + ". Si en los rezagos cortos queda poco que explicar, ningún orden bajo gana mucho." }
    ],
    cierre: "Los rezagos cortos de w tienen poco que dar, y lo grande está en k = 12."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con los seis ajustes",
    definicion: null,
    explicacion: "Responda pasando de un orden a otro.",
    items: [
      { valor: "¿Cuál orden tiene el menor AIC?",
        opciones: ["(1, 1)", "(0, 0): ningún término", "(1, 0)"], correcta: ["(1, 1)", "(0, 0)", "(1, 0)"].indexOf(mejor.nombre),
        razon: "El " + mejor.nombre + ", con " + fmt(mejor.aic) + ", frente a " + fmt(a10.aic) + " del (1, 0) y " + fmt(a11.aic) + " del (1, 1). El modelo sin ningún coeficiente empata con los demás: cada parámetro suma 2 al AIC, y los de estos ARMA no mejoran la verosimilitud lo suficiente para pagarlos." },
      { valor: "En el (1, 1), φ = " + fmt(a11.phis[0]) + " y θ = " + fmt(a11.thetas[0]) + ". ¿Qué pasa con dos coeficientes así?",
        opciones: ["Se suman, y la memoria se alarga", "Casi se cancelan, y el modelo se parece al ruido blanco", "El modelo deja de ser estacionario"], correcta: 1,
        razon: "El modelo es (1 − " + fmt(a11.phis[0]) + "B) w = " + factorMA(a11.thetas[0]) + " e, con dos factores casi iguales a cada lado. Lo que uno agrega el otro lo quita: por eso su AIC, " + fmt(a11.aic) + ", no mejora al del (0, 0)." },
      { valor: "Con cualquiera de los seis, ¿dónde queda la barra de k = 12 de los residuos?",
        opciones: ["Dentro de la banda", "Cambia de signo", "Fuera de la banda, casi igual que en w"], correcta: Math.abs(r12max) > BANDA ? 2 : 0,
        razon: "Va de " + fmt(r12min) + " a " + fmt(r12max) + " según el orden, con la banda en ±" + fmt(BANDA, 3) + "; en w era " + fmt(acfW[12]) + ". Ningún ARMA de orden bajo toca esa barra." },
      { valor: "Ljung-Box con 24 rezagos da p ≤ " + fmt(lbMax, 4) + " en los seis. ¿Qué dice?",
        opciones: ["Los residuos son ruido blanco", "Los residuos todavía tienen correlación", "El modelo no converge"], correcta: 1,
        razon: "Ljung-Box suma las autocorrelaciones de los residuos al cuadrado hasta el rezago 24 y prueba si todas son cero. Con p ≤ " + fmt(lbMax, 4) + " se rechaza: la barra de k = 12 sola basta para rechazar." }
    ],
    cierre: "El AIC no separa estos órdenes y Ljung-Box los rechaza a todos: el problema está a doce meses."
  };

  /* --- Interfaz ----------------------------------------------------- */
  if (typeof document === "undefined") {
    module.exports = { AJUSTES: AJUSTES, ANTES: ANTES, DESPUES: DESPUES, w: w, acfW: acfW, pacfW: pacfW };
    return;
  }

  var marcas = [0, 6, 12, 18, 24];
  document.getElementById("figura-acf-w").innerHTML = Grafica.correlograma(acfW, N,
    { titulo: "ACF de w", ancho: 380, alto: 220, marcasX: marcas });
  document.getElementById("figura-pacf-w").innerHTML = Grafica.correlograma(pacfW, N,
    { titulo: "PACF de w", ancho: 380, alto: 220, desde: 1, marcasX: [1, 6, 12, 18, 24] });

  var selector = document.getElementById("ordenes");
  selector.innerHTML = AJUSTES.map(function (a, i) {
    return '<button data-i="' + i + '"' + (i === 1 ? ' class="elegido"' : "") + ">" + a.nombre + "</button>";
  }).join("");

  var eneros = [];
  mesesW.forEach(function (m, i) { if (m.slice(5) === "01") { eneros.push(i); } });

  function dibujar(i) {
    var a = AJUSTES[i];
    document.getElementById("lectura").innerHTML = "ARMA" + a.nombre + ": <b>AIC " + fmt(a.aic) + "</b>; coeficientes: " +
      coeficientes(a) + ". Residuos: ACF en k = 1 <b>" + fmt(a.acfResid[1]) + "</b>, en k = 12 <b>" + fmt(a.acfResid[12]) +
      "</b> (statsmodels: " + fmt(a.acf12) + "). Ljung-Box: p = " + fmt(a.lb12, 4) + " con 12 rezagos y p = " + fmt(a.lb24, 4) + " con 24.";
    document.getElementById("figura-resid").innerHTML = Grafica.lineas({
      titulo: "Residuos del ARMA" + a.nombre + ", millones de pasajeros", cero: true, alto: 200,
      lineas: [{ valores: a.resid }], marcasX: eneros, rotuloX: function (j) { return mesesW[j].slice(0, 4); }
    });
    document.getElementById("figura-acf-resid").innerHTML = Grafica.correlograma(a.acfResid, N,
      { titulo: "ACF de los residuos", alto: 220, marcasX: marcas });
  }

  selector.querySelectorAll("button").forEach(function (b) {
    b.addEventListener("click", function () {
      selector.querySelectorAll("button").forEach(function (o) { o.classList.remove("elegido"); });
      b.classList.add("elegido");
      dibujar(Number(b.getAttribute("data-i")));
    });
  });
  dibujar(1);

  document.getElementById("cierre-tabla").innerHTML =
    "<table><thead><tr><th>(p, q)</th><th>AIC</th><th>coeficientes</th><th>ACF residuos k = 1</th><th>k = 12</th><th>Ljung-Box p, 24 rezagos</th></tr></thead><tbody>" +
    AJUSTES.map(function (a) {
      return "<tr><td>" + a.nombre + "</td><td>" + fmt(a.aic) + "</td><td>" + coeficientes(a) + "</td><td>" + fmt(a.acfResid[1]) +
        "</td><td>" + fmt(a.acfResid[12]) + "</td><td>" + fmt(a.lb24, 4) + "</td></tr>";
    }).join("") + "</tbody></table>";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
