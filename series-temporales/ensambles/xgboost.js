/* Tasa, árboles y profundidad de XGBoost. Calca la segunda interactiva del
   notebook de la sesión de ensambles: learning_rate, n_estimators y
   max_depth, uno a la vez, sobre la diferencia con hace 12 meses. */
(function () {
  "use strict";

  var P = Pronostico, X = DATOS.xgb, B = DATOS.backtest;
  var TASAS = X.tasa, CUANTOS = X.arboles;
  function clave(t) { return String(t); }
  function xgb(t, n, d) { return X.xgb[clave(t) + "_" + n + "_" + d].p; }
  function mae(t, n, d) { return P.mae(xgb(t, n, d)); }
  function tasaTexto(t) { return String(t).replace(".", ","); }

  /* El punto de partida de XGBoost: el promedio de la diferencia con hace
     12 meses en las filas de entrenamiento, de 2019 a 2024. */
  var v = SERIE.valores, m = SERIE.meses;
  var i0 = m.indexOf("2019-01"), i1 = m.indexOf("2024-12"), suma = 0;
  for (var i = i0; i <= i1; i++) { suma += (v[i] - v[i - 12]) / 1e6; }
  var partida = suma / (i1 - i0 + 1);

  /* Los números que usan las preguntas. */
  var queda100 = Math.pow(1 - 0.01, 100);
  var bastan = Math.ceil(Math.log(0.01) / Math.log(1 - 0.3));
  var lentos = CUANTOS.map(function (n) { return mae(0.01, n, 6); });
  var mejorN = CUANTOS[lentos.indexOf(Math.min.apply(null, lentos))];
  var p25 = xgb(0.01, 25, 6), obs25 = SERIE.valores.slice(m.indexOf("2025-01"), m.indexOf("2025-01") + 12);
  var encima = p25.filter(function (x, k) { return x * 1e6 > obs25[k]; }).length;
  var defecto = mae(0.3, 100, 6), d300 = mae(0.3, 300, 6);
  var origenes = B.n_prueba - B.h + 1;

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover los controles",
    definicion: null,
    explicacion: "Suponga que cada árbol acertara exactamente lo que falta. Entonces cada uno corrige la fracción η de lo que queda, y después de M árboles queda sin corregir (1 − η)<sup>M</sup>.",
    items: [
      { valor: "Con <code>learning_rate</code> 0,01, ¿qué fracción de lo que faltaba queda sin corregir después de 100 árboles?",
        opciones: ["Casi nada", "Cerca de un tercio", "Más de la mitad"], correcta: queda100 < 0.1 ? 0 : queda100 <= 0.5 ? 1 : 2,
        razon: "(1 − 0,01)¹⁰⁰ = " + P.coma(queda100) + ": después de cien árboles falta todavía más de la tercera parte." },
      { valor: "Con <code>learning_rate</code> 0,3, ¿cuántos árboles bastan para que quede menos del 1 %?",
        opciones: [ "Unos 100", "Unos 300","Unos " + bastan], correcta: 2,
        razon: "(1 − 0,3)ᴹ < 0,01 desde M = " + bastan + ". Los otros " + (100 - bastan) + " árboles del valor por defecto corrigen casi nada en el entrenamiento." }
    ],
    cierre: "Una tasa pequeña pide muchos más árboles para llegar al mismo sitio."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con los controles en la mano",
    definicion: null,
    explicacion: "Responda moviendo un control a la vez desde los valores por defecto.",
    items: [
      { valor: "Con <code>learning_rate</code> 0,01 y profundidad 6, ¿con cuántos árboles alcanza el pronóstico la serie, es decir, el MAE de 2025 llega a su mínimo?",
        opciones: CUANTOS.map(String), correcta: CUANTOS.indexOf(mejorN),
        razon: "Con " + mejorN + ": el MAE pasa por " + lentos.map(P.miles).join(", ") + " con " + CUANTOS.join(", ") +
          " árboles. Antes le falta corregir; después cada árbol de profundidad 6 copia más meses del entrenamiento." },
      { valor: "Con tasa 0,01 y solo 25 árboles, ¿en cuántos meses de 2025 queda el pronóstico por encima de lo observado?",
        opciones: ["En casi todos", "En la mitad", "En casi ninguno"], correcta: encima >= 9 ? 0 : encima >= 4 ? 1 : 2,
        razon: "En " + encima + " de 12. XGBoost parte del promedio de la diferencia con hace 12 meses en el entrenamiento, " +
          P.coma(partida, 3) + " millones, y 25 pasos de 0,01 apenas lo mueven: pronostica casi el mismo mes de 2024 más ese crecimiento promedio." },
      { valor: "Con tasa 0,3 y profundidad 6, ¿qué le pasa al MAE de 2025 de 100 a 300 árboles?",
        opciones: ["Baja", "No cambia", "Sube"], correcta: Math.abs(d300 - defecto) < 0.01 * defecto ? 1 : d300 < defecto ? 0 : 2,
        razon: "Pasa de " + P.miles(defecto) + " a " + P.miles(d300) + ". Con tasa 0,3, a los " + bastan + " árboles ya le falta casi nada en el entrenamiento: los árboles que siguen se entrenan con residuos casi nulos y no mueven el pronóstico." },
      { valor: "Por defecto, el MAE de 2025 es " + P.miles(defecto) + ". En el backtest de la sesión, XGBoost por defecto da " +
          P.miles(B.xgb_defecto) + " y el estacional ingenuo, " + P.miles(B.estacional) + ". ¿Por qué el backtest lo deja detrás?",
        opciones: [
          "Copia la pandemia con " + DATOS.filas + " filas y 2025 es uno de " + origenes + " orígenes",
          "El backtest pronostica un mes adelante y 2025 pronostica doce meses",
          "Con más árboles el backtest le ganaría al estacional ingenuo"],
        correcta: 0,
        razon: "Con " + DATOS.filas + " filas, cien árboles de seis preguntas terminan copiando meses sueltos, y en algunos orígenes uno de esos meses es de la pandemia. 2025 es un origen donde la copia salió bien; el backtest pronostica doce meses desde cada uno de " +
          origenes + " orígenes y promedia. Por eso un MAE bajo en un año no basta para escoger el modelo." }
    ],
    cierre: "La tasa y los árboles van juntos, y un solo año no decide cuál modelo es mejor."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES, partida: partida, mejorN: mejorN, encima: encima };
    return;
  }

  var estado = { t: 0.3, n: 100, d: 6 };
  var dd = document.getElementById("d");

  function dibujar() {
    document.getElementById("d-valor").textContent = estado.d;
    var p = xgb(estado.t, estado.n, estado.d);
    var titulo = "XGBoost, η " + tasaTexto(estado.t) + ", " + estado.n + " árboles, profundidad " + estado.d;
    document.getElementById("lectura").innerHTML = titulo + ": <b>MAE " + P.miles(P.mae(p)) + "</b> pasajeros en 2025.";
    P.figura("figura", p, titulo);
  }

  dd.addEventListener("input", function () { estado.d = Number(dd.value); dibujar(); });
  P.selector("tasa", function (x) { estado.t = Number(x); dibujar(); });
  P.selector("arboles", function (x) { estado.n = Number(x); dibujar(); });
  dibujar();

  document.getElementById("cierre-tabla").innerHTML = P.tabla(
    ["learning_rate"].concat(CUANTOS.map(function (n) { return n + " árboles"; })),
    TASAS.map(function (t) {
      return [tasaTexto(t)].concat(CUANTOS.map(function (n) { return P.miles(mae(t, n, 6)); }));
    }));
  document.getElementById("cierre-texto").textContent =
    "MAE de 2025 con profundidad 6. Con tasa pequeña el modelo avanza despacio desde su punto de partida y hacen falta cientos de árboles; con tasa grande llega en pocos y los demás sobran. " +
    "Un MAE bajo en 2025 con los valores por defecto solo dice que, desde diciembre de 2024, la copia de meses salió bien. " +
    "El backtest pronostica desde " + origenes + " orígenes y ahí XGBoost por defecto queda en " + P.miles(B.xgb_defecto) + ", detrás del estacional ingenuo. Escoger la tasa, los árboles y la profundidad sin mirar los meses de prueba es el tema de la validación temporal.";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
