/* Parámetros contra 110 meses: la cuenta de parámetros del Transformer por
   pieza para cada variante, hecha aquí, al lado de los otros modelos de la
   tabla y del MAPE del backtest, que viene de datos.js. */
(function () {
  "use strict";

  var A = Atencion, V = DATOS.variantes, VENTANAS = 48;
  var OTROS = [["SARIMA", 2], ["regresión lineal", 15], ["Conv1D", 113], ["MLP (16,)", 257], ["LSTM 32", 4513]];
  function variante(d, c, a) {
    var hallada = null;
    V.forEach(function (x) { if (x.d === d && x.cabezas === c && x.ancho === a) { hallada = x; } });
    return hallada;
  }
  function mapeDe(d, c, a) { var x = variante(d, c, a); return x ? A.coma(x.mape, 2) : "sin medir"; }

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover los controles",
    definicion: "atención: 4 matrices de d × d y 4 sesgos de d",
    explicacion: "La red de la sesión tiene d_model = 16, nhead = 2 y dim_feedforward = 32.",
    items: [
      { valor: "Con los meses hasta diciembre de 2024 hay 96 meses. ¿Cuántas ventanas de 12 pasos sobre la diferencia con hace 12 meses entrenan la red?",
        opciones: ["72", "48", "84"], correcta: 1,
        razon: "48. La diferencia empieza en el mes 13 y deja 84 valores; la primera ventana completa pronostica el valor 13 de esos, y quedan 72 ventanas. Las 24 últimas son de validación. 84 olvida la ventana y 72 olvida la validación." },
      { valor: "Si se pasa de 2 a 4 cabezales sin tocar d_model, ¿qué pasa con los parámetros de la atención?",
        opciones: ["Se quedan igual", "Se duplican", "Bajan a la mitad"], correcta: 0,
        razon: "Se quedan igual: los cabezales reparten los mismos 16 números en grupos de 8 o de 4, con las mismas cuatro matrices. Duplicarlos sería darle a cada cabezal sus propias matrices de 16 × 16." }
    ],
    cierre: "El tamaño lo fijan d_model y dim_feedforward; los cabezales reparten."
  };

  var DESPUES = {
    id: "despues",
    titulo: "4. Con los controles en la mano",
    definicion: null,
    explicacion: "Use las partes 2 y 3.",
    items: [
      { valor: "De las seis variantes con MAPE, ¿cuál quedó mejor en el backtest?",
        opciones: ["d_model 32, la más grande", "dim_feedforward 64", "d_model 8, la más chica"], correcta: 2,
        razon: "d_model 8, con MAPE " + mapeDe(8, 2, 32) + " y " + A.total(8, 32) + " parámetros. La de la sesión queda en " + mapeDe(16, 2, 32) + " con " + A.total(16, 32) +
          ", y la de d_model 32 en " + mapeDe(32, 2, 32) + " con " + A.total(32, 32) + "." },
      { valor: "Con d_model 8, ¿la red tiene más o menos parámetros que ventanas de entrenamiento?",
        opciones: ["Más, unas 19 veces", "Menos, porque 8 es menor que 48", "Más o menos los mismos"], correcta: 0,
        razon: A.total(8, 32) + " parámetros para 48 ventanas: " + A.coma(A.total(8, 32) / VENTANAS, 1) + " por ventana. Aun la más chica tiene muchos más parámetros que datos." },
      { valor: "¿Qué modelo de la tabla del curso tiene el mejor MAPE?",
        opciones: ["La LSTM 32", "La regresión lineal sobre la diferencia", "El Transformer de d_model 8"], correcta: 1,
        razon: "La regresión lineal, con MAPE 2,48 y 15 parámetros: menos de uno por cada tres ventanas. La LSTM con cinco semillas queda en 3,61 con 4 513." }
    ],
    cierre: "Con 110 meses, cada parámetro de más es una forma más de aprenderse el entrenamiento."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES };
    return;
  }

  var P = Pronostico, estado = { d: 16, c: 2, a: 32 }, preguntas = [];

  function sinRepetir(lista) {
    var vistos = {};
    return lista.filter(function (o) { if (vistos[o.valor]) { return false; } vistos[o.valor] = true; return true; });
  }

  function dibujar() {
    var d = estado.d, a = estado.a, p = A.parametros(d, a), t = A.total(d, a);
    document.getElementById("piezas").innerHTML = P.tabla(["Pieza", "Cuenta", "Parámetros"], [
      ["Linear(1, d)", d + " pesos y " + d + " sesgos", p.entrada],
      ["atención", "4 × " + d + " × " + d + " + 4 × " + d, P.miles(p.atencion)],
      ["Linear(d, a) y Linear(a, d)", d + " × " + a + " + " + a + " + " + a + " × " + d + " + " + d, P.miles(p.dos)],
      ["dos LayerNorm", "2 × 2 × " + d, p.normas],
      ["Linear(d, 1)", d + " + 1", p.salida],
      ["<b>total</b>", "", "<b>" + P.miles(t) + "</b>"]
    ]);
    document.getElementById("lectura").innerHTML = "d_model " + d + ", nhead " + estado.c + ", dim_feedforward " + a + ": <b>" + P.miles(t) +
      "</b> parámetros, " + A.coma(t / VENTANAS, 1) + " por ventana de entrenamiento. MAPE del backtest con cinco semillas: " + mapeDe(d, estado.c, a) + ".";
    var barras = OTROS.slice(0, 4).map(function (o) { return { rotulo: o[0], valor: o[1], color: "#9aa5b1" }; });
    barras.push({ rotulo: "Transformer", valor: t, color: "#d9822b" });
    barras.push({ rotulo: OTROS[4][0], valor: OTROS[4][1], color: "#9aa5b1" });
    document.getElementById("barras").innerHTML = Grafica.barras({ barras: barras, maximo: 7000,
      referencia: { valor: 110, rotulo: "110 meses" }, formato: function (x) { return P.miles(x); } });
    document.getElementById("tabla").innerHTML = P.tabla(["d_model", "nhead", "dim_feedforward", "Parámetros", "Por ventana", "MAPE, 5 semillas"],
      V.map(function (x) { return [x.d, x.cabezas, x.ancho, P.miles(x.parametros), A.coma(x.parametros / VENTANAS, 1), A.coma(x.mape, 2)]; }));
    preguntas.forEach(function (q) { q.refrescar(); });
  }

  function preguntar() {
    if (typeof Motor.opcionesNumericas !== "function") { return; }
    preguntas.push(Motor.opcionesNumericas("op-atencion", "ver-atencion", function () {
      var d = estado.d, c = estado.c;
      document.getElementById("pregunta-atencion").innerHTML = "<b>a.</b> Con d_model " + d + " y nhead " + c + ", ¿cuántos parámetros tiene la atención?";
      return sinRepetir([
        { valor: P.miles(4 * d * d + 4 * d), clave: "correcta", razon: "4 × " + d + " × " + d + " + 4 × " + d + " = " + P.miles(4 * d * d + 4 * d) + ": consulta, clave, valor y la matriz que junta los cabezales, cada una con su sesgo." },
        { valor: P.miles(3 * d * d + 3 * d), clave: "sin-salida", razon: "Faltan la matriz que junta los cabezales y su sesgo: son cuatro matrices, no tres." },
        { valor: P.miles(4 * d * d), clave: "sin-sesgos", razon: "Faltan los cuatro sesgos de " + d + " números." },
        { valor: P.miles(c * (4 * d * d + 4 * d)), clave: "por-cabezal", razon: "Es contar unas matrices completas por cabezal. Los cabezales parten las mismas matrices en grupos." }
      ]);
    }));
    preguntas.push(Motor.opcionesNumericas("op-ventana", "ver-ventana", function () {
      var t = A.total(estado.d, estado.a);
      document.getElementById("pregunta-ventana").innerHTML = "<b>b.</b> ¿Cuántos parámetros hay por ventana de entrenamiento?";
      return sinRepetir([
        { valor: A.coma(t / VENTANAS, 1), clave: "correcta", razon: P.miles(t) + " / 48 = " + A.coma(t / VENTANAS, 1) + "." },
        { valor: A.coma(t / 110, 1), clave: "meses", razon: "Es dividir por los 110 meses de la serie. Lo que entrena la red son las 48 ventanas." },
        { valor: A.coma(t / 72, 1), clave: "con-validacion", razon: "Es contar también las 24 ventanas de validación, que no mueven los pesos." },
        { valor: A.coma(VENTANAS / t, 3), clave: "al-reves", razon: "Es ventanas por parámetro, la cuenta al revés." }
      ]);
    }));
  }

  P.selector("d", function (v) { estado.d = Number(v); dibujar(); });
  P.selector("cabezas", function (v) { estado.c = Number(v); dibujar(); });
  P.selector("ancho", function (v) { estado.a = Number(v); dibujar(); });
  preguntar();
  dibujar();

  document.getElementById("cierre-tabla").innerHTML = P.tabla(["", "Qué", "Lo que lo muestra"], [
    ["Ventaja", "Los cabezales no cuestan parámetros", "Con 1, 2 o 4 cabezales la red tiene " + P.miles(A.total(16, 32)) + " parámetros."],
    ["Ventaja", "El tamaño se ajusta con dos números", "De d_model 8 a 32 la red va de " + A.total(8, 32) + " a " + P.miles(A.total(32, 32)) + " parámetros."],
    ["Limitación", "Muchos más parámetros que datos", "La red de la sesión tiene " + A.coma(A.total(16, 32) / VENTANAS, 1) + " parámetros por ventana; la regresión lineal, 15 en total."],
    ["Limitación", "Más grande no es mejor aquí", "MAPE con cinco semillas: " + mapeDe(8, 2, 32) + " con d_model 8, " + mapeDe(16, 2, 32) + " con 16 y " + mapeDe(32, 2, 32) + " con 32."]
  ]);
  document.getElementById("cierre-texto").textContent =
    "La atención se pensó para secuencias largas y muchos ejemplos. Con una serie mensual de 110 meses, la red más chica es la que mejor queda, y aun así no alcanza a la regresión lineal.";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
