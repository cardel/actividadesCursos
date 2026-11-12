/* Ventana y memoria. Calca la segunda interactiva del notebook de la sesión de
   redes recurrentes: RNN o LSTM, pasos y neuronas, con el pronóstico de 2025 y
   la validación mínima. */
(function () {
  "use strict";

  var P = Pronostico, M = DATOS.memoria, B = DATOS.backtest;
  var PASOS = M.pasos, OCULTA = M.oculta;
  function red(r, p, h) { return M.redes[r + "_" + p + "_" + h]; }
  function mae(r, p, h) { return P.mae(red(r, p, h).p); }

  /* Cuántos números ajusta cada red de una capa con una variable de entrada y la salida lineal. */
  function parametros(r, h) {
    var compuertas = r === "LSTM" ? 4 : 1;
    return compuertas * (h + h * h + 2 * h) + h + 1;
  }

  /* Con 32 neuronas, los pasos en que la RNN queda detrás de la LSTM en 2025. */
  var detras = PASOS.filter(function (p) { return mae("RNN", p, 32) > mae("LSTM", p, 32); });
  var delante = PASOS.filter(function (p) { return detras.indexOf(p) < 0; });
  function lista(ps) { return ps.length ? "Con " + ps.join(" y ") : "Con ninguno"; }
  var opcionesDetras = [lista(delante), lista(detras), detras.length && delante.length ? "Con ninguno" : "Con todos"];

  /* LSTM de 12 pasos, de 32 a 8 neuronas. */
  var v32 = red("LSTM", 12, 32).val, v8 = red("LSTM", 12, 8).val;
  var m32 = mae("LSTM", 12, 32), m8 = mae("LSTM", 12, 8);
  var OCHO = ["Bajan la validación y el MAE de 2025", "Suben la validación y el MAE de 2025",
    "Sube la validación y baja el MAE de 2025"];
  var ocho = v8 < v32 && m8 < m32 ? 0 : v8 > v32 && m8 > m32 ? 1 : v8 > v32 ? 2 : -1;

  /* Con 12 y 24 pasos, en cuántas de las ocho posiciones la RNN valida mejor. */
  var gana = 0;
  [12, 24].forEach(function (p) {
    OCULTA.forEach(function (h) { if (red("RNN", p, h).val < red("LSTM", p, h).val) { gana++; } });
  });

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover los controles",
    definicion: null,
    explicacion: "La serie da una ventana por mes desde que hay doce diferencias anteriores.",
    items: [
      { valor: "Con <code>pasos</code> = 24, ¿cuántas ventanas de entrenamiento se pierden frente a <code>pasos</code> = 12?",
        opciones: ["Ninguna", "12", "24"], correcta: 1,
        razon: "Cada ventana necesita sus 24 meses anteriores: la primera llega doce meses más tarde, y esas doce ventanas ya no existen." },
      { valor: "Con <code>oculta</code> = 32, ¿cuál de las dos redes ajusta más números?",
        opciones: ["Las dos igual", "La RNN", "La LSTM"], correcta: 2,
        razon: "La LSTM repite las cuentas de la RNN cuatro veces, tres compuertas y la memoria: " + P.miles(parametros("LSTM", 32)) +
          " números frente a " + P.miles(parametros("RNN", 32)) + "." }
    ],
    cierre: "Más pasos cuestan ventanas; la LSTM cuesta cuatro veces los pesos de la RNN."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con los controles en la mano",
    definicion: null,
    explicacion: "Compare las dos redes con los mismos pasos y neuronas.",
    items: [
      { valor: "Con 32 neuronas, ¿con cuántos pasos queda la RNN detrás de la LSTM en el MAE de 2025?",
        opciones: opcionesDetras, correcta: 1,
        razon: "Con 32 neuronas, el MAE de la RNN y de la LSTM es " + PASOS.map(function (p) {
          return P.miles(mae("RNN", p, 32)) + " y " + P.miles(mae("LSTM", p, 32)) + " con " + p + " pasos";
        }).join("; ") + "." },
      { valor: "LSTM de 12 pasos: al bajar de 32 a 8 neuronas, ¿qué pasa?",
        opciones: OCHO, correcta: ocho,
        razon: "La validación mínima pasa de " + P.coma(v32, 4) + " a " + P.coma(v8, 4) + " y el MAE de 2025, de " +
          P.miles(m32) + " a " + P.miles(m8) + ". La validación mira 24 ventanas de un mes adelante; 2025 son doce meses recursivos desde un solo origen." },
      { valor: "Con 12 y 24 pasos, en las ocho posiciones de neuronas, ¿cuál red llega a la validación mínima más baja?",
        opciones: ["La RNN, en casi todas", "Cada una en la mitad", "La LSTM, en casi todas"],
        correcta: gana >= 6 ? 0 : gana <= 2 ? 2 : 1,
        razon: "La RNN valida mejor en " + gana + " de las 8. En esta serie lo que pesa son los meses recientes, y la memoria larga de la LSTM no le saca ventaja." }
    ],
    cierre: "Con esta serie, la memoria larga no gana sola: la RNN pequeña compite."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES, detras: detras, ocho: ocho, gana: gana };
    return;
  }

  var estado = { r: "LSTM", p: 12, h: 32 };
  function dibujar() {
    var x = red(estado.r, estado.p, estado.h);
    var titulo = estado.r + " " + estado.h + ", " + estado.p + " pasos";
    document.getElementById("lectura").innerHTML = titulo + ": <b>MAE " + P.miles(P.mae(x.p)) +
      "</b> pasajeros en 2025; validación mínima " + P.coma(x.val, 4) + "; " + P.miles(parametros(estado.r, estado.h)) + " números.";
    P.figura("figura", x.p, titulo);
  }
  P.selector("red", function (x) { estado.r = x; dibujar(); });
  P.selector("pasos", function (x) { estado.p = Number(x); dibujar(); });
  P.selector("oculta", function (x) { estado.h = Number(x); dibujar(); });
  dibujar();

  document.getElementById("cierre-tabla").innerHTML = P.tabla(
    ["Red, neuronas"].concat(PASOS.map(function (p) { return p + " pasos"; })),
    ["RNN", "LSTM"].reduce(function (filas, r) {
      return filas.concat(OCULTA.map(function (h) {
        return [r + " " + h].concat(PASOS.map(function (p) { return P.miles(mae(r, p, h)); }));
      }));
    }, []));
  var rnn = B["RNN 32, diferencia"], lstm = B["LSTM 32, diferencia"], cinco = B["LSTM, promedio de 5 semillas, diferencia"];
  document.getElementById("cierre-texto").textContent =
    "MAE de 2025 de cada posición. Los números saltan de una casilla a la vecina sin un patrón limpio: cada red se entrenó con una semilla y se mide en un solo año. " +
    "En el backtest de 13 orígenes, con 12 pasos y 32 neuronas, la RNN da un MAPE de " + P.coma(rnn.MAPE) + " y la LSTM, " + P.coma(lstm.MAPE) +
    "; promediando cinco semillas, la LSTM baja a " + P.coma(cinco.MAPE) + ". Para comparar redes se promedian varias semillas y se usa el backtest, no un año.";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
