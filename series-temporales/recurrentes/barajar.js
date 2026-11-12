/* Barajar. Calca la tercera interactiva del notebook de la sesión de redes
   recurrentes: el MLP y la LSTM con la entrada en orden y barajada. */
(function () {
  "use strict";

  var P = Pronostico, X = DATOS.barajar, BB = DATOS.backtest_barajar;
  var POSICIONES = ["MLP en orden", "MLP barajado", "LSTM en orden", "LSTM barajada"];
  function mae(pos) { return P.mae(X[pos]); }
  var mlpSube = mae("MLP barajado") > mae("MLP en orden");
  var lstmSube = mae("LSTM barajada") > mae("LSTM en orden");
  var CAMBIO = ["Solo empeora la LSTM", "Empeoran los dos", "Solo empeora el MLP"];
  var cambio = mlpSube && lstmSube ? 1 : lstmSube ? 0 : mlpSube ? 2 : -1;

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover el control",
    definicion: null,
    explicacion: "La primera capa del MLP multiplica cada columna por su peso y suma. La LSTM aplica los mismos pesos a cada paso, uno tras otro.",
    items: [
      { valor: "Si se barajan las columnas del MLP y cada peso inicial se mueve con su columna, ¿qué pasa con el pronóstico?",
        opciones: ["Cambia un poco", "Sale idéntico", "Cambia mucho"], correcta: 1,
        razon: "La suma no depende del orden de los sumandos: cada columna llega con el mismo peso inicial y el entrenamiento hace las mismas cuentas. En el backtest de la sesión, los dos MAE coinciden en sus seis cifras enteras." },
      { valor: "¿Hay pesos con los que la LSTM lea la ventana barajada igual que la ordenada?",
        opciones: ["Sí, moviendo las filas de weight_ih", "Sí, con más neuronas en el estado", "No, el estado depende del orden"], correcta: 2,
        razon: "Los mismos pesos leen el paso 1 y el paso 12; lo único que los distingue es cuándo entran. El estado después de leer 7, 2, 10… no es el de leer 1, 2, 3…, y no hay columna que mover." }
    ],
    cierre: "Al MLP el orden no le dice nada; a la LSTM sí."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con el control en la mano",
    definicion: null,
    explicacion: "Compare cada red en orden con su versión barajada.",
    items: [
      { valor: "Con estas cinco semillas, ¿qué les pasa en 2025 a los dos modelos al barajar?",
        opciones: CAMBIO, correcta: cambio,
        razon: "El MAE del MLP pasa de " + P.miles(mae("MLP en orden")) + " a " + P.miles(mae("MLP barajado")) +
          " y el de la LSTM, de " + P.miles(mae("LSTM en orden")) + " a " + P.miles(mae("LSTM barajada")) + "." },
      { valor: "El MLP no puede usar el orden y aun así su pronóstico cambia. ¿De dónde sale el cambio?",
        opciones: ["De qué peso inicial le toca a cada columna", "De que el MLP distingue rezago_1 de rezago_12", "De que barajar cambia los meses de entrenamiento"],
        correcta: 0,
        razon: "Con la misma semilla, el peso inicial que antes iba a rezago_1 ahora va a rezago_7. Es como cambiar de semilla: la red arranca en otro sitio y termina en otra solución. Las filas de entrenamiento son las mismas." },
      { valor: "En el backtest de 13 orígenes, con las mismas cinco semillas, el MAPE del MLP pasa de " + P.coma(BB.mlp.orden) + " a " + P.coma(BB.mlp.barajado) +
          " y el de la LSTM, de " + P.coma(BB.lstm.orden) + " a " + P.coma(BB.lstm.barajado) + ". ¿Cuál de los dos cambios se deshace moviendo pesos?",
        opciones: ["El de la LSTM", "Ninguno de los dos", "El del MLP"], correcta: 2,
        razon: "El del MLP: con los pesos iniciales movidos junto con sus columnas, el MLP barajado da el mismo pronóstico que el ordenado. En la LSTM no hay movimiento de pesos que devuelva el orden de los pasos." }
    ],
    cierre: "Los dos empeoran aquí, pero solo la LSTM lee el orden."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES, cambio: cambio };
    return;
  }

  var actual = POSICIONES[0];
  function dibujar() {
    document.getElementById("lectura").innerHTML = actual + ", promedio de 5 semillas: <b>MAE " +
      P.miles(mae(actual)) + "</b> pasajeros en 2025.";
    P.figura("figura", X[actual], actual);
  }
  P.selector("posicion", function (x) { actual = x; dibujar(); });
  dibujar();

  document.getElementById("cierre-tabla").innerHTML = P.tabla(
    ["Red", "MAE 2025 en orden", "MAE 2025 barajado", "MAPE backtest en orden", "MAPE backtest barajado"],
    [["MLP (16,)", P.miles(mae("MLP en orden")), P.miles(mae("MLP barajado")), P.coma(BB.mlp.orden), P.coma(BB.mlp.barajado)],
     ["LSTM 32", P.miles(mae("LSTM en orden")), P.miles(mae("LSTM barajada")), P.coma(BB.lstm.orden), P.coma(BB.lstm.barajado)]]);
  document.getElementById("cierre-texto").textContent =
    "Las cifras solas no separan a las dos redes: con estas semillas, las dos empeoran al barajar. Lo que las separa es la prueba de mover los pesos. " +
    "El MLP trata los doce rezagos como columnas sin orden, y su cambio viene del arranque. La LSTM lee la ventana como una secuencia, " +
    "y para ella la ventana barajada es otra serie.";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
