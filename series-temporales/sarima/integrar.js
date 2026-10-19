/* Del pronóstico de w a pasajeros. Corte en febrero de 2025; el pronóstico
   de w a doce meses se integra aquí de vuelta a pasajeros y se compara con
   los datos reales y con el estacional ingenuo. */
(function () {
  "use strict";

  function fmt(v, d) {
    var t = v.toFixed(d === undefined ? 2 : d);
    if (Number(t) === 0) { t = t.replace("-", ""); }
    return t.replace(".", ",").replace("-", "−");
  }

  /* ARIMA(y[:"2025-02"], order=(0, 1, 0), seasonal_order=(0, 1, 1, 12)).fit()
     de statsmodels 0.15, con y en millones de pasajeros; ma.S.L12 = −0,994.
     W_SARIMA es el w implícito en get_forecast(12) y Y_STATSMODELS el
     pronóstico de pasajeros, para comparar. Guion:
     cursos/seriestemporales/tools/precalculo_actividades_arma_sarima.py. */
  var THETA_S = -0.994;
  var W_SARIMA = [-0.1821, -0.1725, -0.1342, -0.0278, -0.0289, -0.0294, 0.0494, 0.0985, 0.2088, -0.0719, 0.0362, 0.3989];
  var Y_STATSMODELS = [4.3099, 3.9703, 4.0656, 4.3016, 4.5543, 4.5365, 4.1712, 4.4756, 4.634, 4.9991, 4.9039, 4.342];

  var H = 12, CORTE = "2025-02";
  var v = SERIE.valores.map(function (x) { return x / 1e6; });
  var T = SERIE.meses.indexOf(CORTE) + 1;
  var historia = v.slice(0, T), real = v.slice(T, T + H), meses = SERIE.meses.slice(T, T + H);
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  function nombre(m) { return MESES[+m.slice(5) - 1] + " de " + m.slice(0, 4); }
  function corto(m) { return MESES[+m.slice(5) - 1].slice(0, 3) + " " + m.slice(0, 4); }

  var W = { sarima: W_SARIMA, cero: W_SARIMA.map(function () { return 0; }) };
  var Y = { sarima: Series.integrar(historia, W.sarima, 12), cero: Series.integrar(historia, W.cero, 12) };
  var ingenuo = Series.estacional_ingenuo(historia, H, 12);
  var difStatsmodels = Math.max.apply(null, Y.sarima.map(function (x, i) { return Math.abs(x - Y_STATSMODELS[i]); }));

  var metricas = [
    { nombre: "estacional ingenuo", f: ingenuo },
    { nombre: "ŵ = 0", f: Y.cero },
    { nombre: "SARIMA(0,1,0)(0,1,1)₁₂", f: Y.sarima }
  ].map(function (m) {
    return { nombre: m.nombre, mae: Series.mae(real, m.f), rmse: Series.rmse(real, m.f), mape: Series.mape(real, m.f) };
  });
  var ganador = 0;
  metricas.forEach(function (m, i) { if (m.mae < metricas[ganador].mae) { ganador = i; } });

  var yFeb = historia[T - 1], yMar24 = historia[T - 12], yFeb24 = historia[T - 13];

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover el horizonte",
    definicion: null,
    explicacion: "Suponga que el pronóstico de w es cero en los doce meses: ninguna sorpresa sobre lo que dicen las dos diferencias.",
    items: [
      { valor: "¿Cuánto vale entonces ŷ de marzo de 2025?",
        opciones: ["y(feb 2025)", "y(mar 2024)", "y(feb 2025) + y(mar 2024) − y(feb 2024)"], correcta: 2,
        razon: "w = 0 quiere decir que el cambio de febrero a marzo de 2025 repite el de febrero a marzo de 2024: " + fmt(yFeb, 3) + " + " + fmt(yMar24, 3) + " − " + fmt(yFeb24, 3) + " = " + fmt(Y.cero[0], 3) + " millones." },
      { valor: "Con ŵ = 0 en todos los meses, ¿a qué se parece el pronóstico?",
        opciones: ["Al ingenuo: repite febrero de 2025", "Al estacional ingenuo, más el crecimiento del último año", "A la media de la serie"], correcta: 1,
        razon: "Para h hasta 12, ŷ = y(mismo mes del año anterior) + [y(feb 2025) − y(feb 2024)]. El crecimiento interanual de febrero, " + fmt(yFeb - yFeb24, 3) + " millones, se suma a los doce meses del estacional ingenuo." }
    ],
    cierre: "ŵ = 0 no es un pronóstico de cero pasajeros: es el estacional ingenuo con el último crecimiento anual encima."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con el horizonte en la mano",
    definicion: null,
    explicacion: "Responda moviendo h y cambiando de ŵ.",
    items: [
      { valor: "Con h = 2, la fórmula de abril de 2025 pide y(marzo de 2025), que en el corte no se conoce. ¿Qué entra en su lugar?",
        opciones: ["El dato real de marzo", "Cero", "El pronóstico de marzo"], correcta: 2,
        razon: "Entra ŷ(mar 2025) = " + fmt(Y.sarima[0], 3) + " con el SARIMA. El dato real, " + fmt(real[0], 3) + ", todavía no existe en febrero de 2025: usarlo sería mirar el futuro." },
      { valor: "En los doce meses, ¿cuál tiene el menor MAE?",
        opciones: metricas.map(function (m) { return m.nombre; }), correcta: ganador,
        razon: "MAE en millones: " + metricas.map(function (m) { return m.nombre + ": " + fmt(m.mae, 3); }).join("; ") + ". En este corte el SARIMA pierde contra las dos líneas base." },
      { valor: "¿En qué meses el ŵ del SARIMA es más negativo?",
        opciones: ["Diciembre de 2025", "Marzo y abril de 2025", "Febrero de 2026"], correcta: 1,
        razon: "ŵ vale " + fmt(W.sarima[0], 3) + " en marzo y " + fmt(W.sarima[1], 3) + " en abril: el modelo espera que el cambio de un mes al siguiente sea menor que el del mismo mes un año antes, y sus pronósticos quedan " + fmt(real[0] - Y.sarima[0], 3) + " y " + fmt(real[1] - Y.sarima[1], 3) + " millones por debajo de lo que pasó. Lo que sale mal al principio se arrastra al resto del año." }
    ],
    cierre: "Integrar es mecánico; lo que decide la calidad del pronóstico es el ŵ que se integra."
  };

  /* --- Interfaz ----------------------------------------------------- */
  if (typeof document === "undefined") {
    module.exports = { Y: Y, real: real, metricas: metricas, difStatsmodels: difStatsmodels, ANTES: ANTES, DESPUES: DESPUES };
    return;
  }

  var estado = { h: 1, fuente: "sarima" };
  var deslizador = document.getElementById("h");

  function valor(t, f) {
    /* t es un índice de la serie completa; desde T, el valor es pronóstico. */
    if (t < T) { return fmt(v[t], 3); }
    return "<i>" + fmt(Y[f][t - T], 3) + "</i>";
  }

  function dibujar() {
    var h = estado.h, f = estado.fuente, yh = Y[f];
    document.getElementById("h-valor").textContent = h;
    var t = T + h - 1;
    document.getElementById("lectura").innerHTML = "ŷ(" + corto(meses[h - 1]) + ") = " + (h > 1 ? "<i>" : "") + fmt(h > 1 ? yh[h - 2] : v[t - 1], 3) +
      (h > 1 ? "</i>" : "") + " + " + fmt(v[t - 12], 3) + " − " + fmt(v[t - 13], 3) + " + (" + fmt(W[f][h - 1], 3) + ")" +
      " = <b>" + fmt(yh[h - 1], 3) + "</b> millones; el dato real fue " + fmt(real[h - 1], 3) + ". Diferencia máxima con statsmodels en los doce meses: " +
      fmt(difStatsmodels * 1e6, 0) + " pasajeros.";
    var filas = "";
    for (var i = 0; i < h; i++) {
      var ti = T + i;
      filas += "<tr><td>" + corto(meses[i]) + "</td><td>" + valor(ti - 1, f) + "</td><td>" + valor(ti - 12, f) + "</td><td>" +
        valor(ti - 13, f) + "</td><td>" + fmt(W[f][i], 3) + "</td><td><b>" + fmt(yh[i], 3) + "</b></td><td>" + fmt(real[i], 3) + "</td></tr>";
    }
    document.getElementById("tabla").innerHTML = "<table><thead><tr><th>mes</th><th>y(t−1)</th><th>y(t−12)</th><th>y(t−13)</th><th>ŵ(t)</th><th>ŷ(t)</th><th>real</th></tr></thead><tbody>" +
      filas + "</tbody></table>";
    var desde = T - 36, hist = v.slice(desde, T);
    var marcas = [];
    for (var j = desde; j < T + H; j++) { if (SERIE.meses[j].slice(5) === "01") { marcas.push(j - desde); } }
    document.getElementById("figura").innerHTML = Grafica.lineas({
      titulo: "Pasajeros por mes, en millones: historia, real y pronóstico", alto: 260,
      lineas: [
        { valores: hist },
        { valores: [hist[hist.length - 1]].concat(real), desde: hist.length - 1, color: "#6b7280" },
        { valores: [hist[hist.length - 1]].concat(yh.slice(0, h)), desde: hist.length - 1, color: Grafica.ROJO }
      ],
      marcasX: marcas, rotuloX: function (i) { return SERIE.meses[i + desde].slice(0, 4); }
    });
  }

  deslizador.addEventListener("input", function () { estado.h = Number(deslizador.value); dibujar(); });
  document.querySelectorAll("#fuente button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll("#fuente button").forEach(function (o) { o.classList.remove("elegido"); });
      b.classList.add("elegido");
      estado.fuente = b.getAttribute("data-fuente");
      dibujar();
    });
  });
  dibujar();

  document.getElementById("cierre-tabla").innerHTML =
    "<table><thead><tr><th>pronóstico, corte en " + nombre(CORTE) + "</th><th>MAE</th><th>RMSE</th><th>MAPE</th></tr></thead><tbody>" +
    metricas.map(function (m) {
      return "<tr><td>" + m.nombre + "</td><td>" + fmt(m.mae, 3) + "</td><td>" + fmt(m.rmse, 3) + "</td><td>" + fmt(m.mape, 1) + " %</td></tr>";
    }).join("") + "</tbody></table>" +
    '<p class="nota">MAE y RMSE en millones de pasajeros, sobre los doce meses de marzo de 2025 a febrero de 2026. Θ del SARIMA: ' + fmt(THETA_S, 3) + ".</p>";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
