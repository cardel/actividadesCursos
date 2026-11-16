/* Diciembre de 2025: el pronóstico a un mes de seis modelos, comparado con lo
   observado, y la elección con el backtest. Las medias ponderadas, los errores
   y el MAE se calculan aquí; el Transformer, la regresión lineal y el backtest
   vienen de datos.js. */
(function () {
  "use strict";

  var A = Atencion, D = DATOS.diciembre, PON = DATOS.ponderada;
  var c3 = function (x) { return A.coma(x, 3); };
  var MESES = ["dic", "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov"];
  var w = D.ventana, base = D.haceUnAnio;
  var PRON = {
    estacional: base,
    ultimo: base + w[11],
    tres: base + (w[9] + w[10] + w[11]) / 3,
    transformer: D.transformer,
    sinPosicion: D.sinPosicion,
    lineal: D.lineal
  };
  var NOMBRE = { estacional: "estacional ingenuo", ultimo: "a mano: último mes", tres: "a mano: tres últimos",
    transformer: "Transformer", sinPosicion: "Transformer sin posición", lineal: "regresión lineal" };
  var CLAVES = ["estacional", "ultimo", "tres", "transformer", "sinPosicion", "lineal"];
  function error(k) { return Math.abs(PRON[k] - D.observado) * 1e6; }
  function miles(x) { return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  var orden = CLAVES.slice().sort(function (a, b) { return error(a) - error(b); });

  var bt = {};
  DATOS.backtest.forEach(function (f) { bt[f.modelo] = f; });
  var FILA = { estacional: "estacional ingenuo", ultimo: "Media ponderada a mano, último mes", transformer: "Transformer, semilla 2026",
    sinPosicion: "Transformer sin posición, semilla 2026", lineal: "Regresión lineal, diferencia" };
  function mape(k) {
    if (k === "tres") { return PON["los tres últimos meses"]; }
    return bt[FILA[k]] ? bt[FILA[k]].MAPE : NaN;
  }
  function coma2(x) { return x.toFixed(2).replace(".", ","); }

  var ANTES = {
    id: "antes",
    titulo: "1. Prediga antes de mirar",
    definicion: null,
    explicacion: "Diciembre de 2024 tuvo " + c3(base) + " millones de pasajeros, y la diferencia con hace 12 meses de noviembre de 2025 fue " + c3(w[11]) + " millones.",
    items: [
      { valor: "¿Qué modelo cree que queda más cerca de diciembre de 2025?",
        opciones: ["La regresión lineal, la mejor de la tabla", "Uno de los dos Transformer", "El estacional ingenuo"], correcta: 1,
        razon: "El más cercano fue el " + NOMBRE[orden[0]] + ", con " + miles(error(orden[0])) + " pasajeros de error; la regresión lineal falló por " + miles(error("lineal")) +
          ". Un mes es un dato: la parte 3 dice cuánto vale." },
      { valor: "La diferencia de noviembre de 2025 es pequeña. ¿Qué pronostica la media ponderada con todo el peso en el último mes?",
        opciones: ["Casi lo mismo que el estacional ingenuo", "Mucho más que el estacional ingenuo", "La media de los doce meses de la ventana"], correcta: 0,
        razon: "Pronostica " + c3(PRON.ultimo) + " millones: diciembre de 2024 más " + c3(w[11]) + ". El estacional ingenuo pronostica " + c3(base) + ", la misma cifra sin la diferencia." }
    ],
    cierre: "La predicción queda escrita; ahora se comprueba."
  };

  var DESPUES = {
    id: "despues",
    titulo: "4. Decida",
    definicion: null,
    explicacion: "Use las partes 2 y 3.",
    items: [
      { valor: "El " + NOMBRE[orden[0]] + " acertó mejor diciembre de 2025. ¿Qué dice eso de su backtest?",
        opciones: ["Que es el mejor, porque diciembre es el mes más difícil", "Poco: en 156 pronósticos su MAPE es " + coma2(mape(orden[0])), "Que la atención aprendió la estacionalidad de diciembre"], correcta: 1,
        razon: "Un mes no decide: en el backtest común su MAPE es " + coma2(mape(orden[0])) + " y el de la regresión lineal, " + coma2(mape("lineal")) + "." },
      { valor: "¿Qué modelo usaría para programar los vuelos del año siguiente?",
        opciones: ["El Transformer, porque mira toda la ventana", "La media a mano del último mes, porque no se entrena", "La regresión lineal sobre la diferencia"], correcta: 2,
        razon: "La regresión lineal: MAPE " + coma2(mape("lineal")) + " en el backtest, con 15 parámetros. El Transformer tiene 2 273 y queda en " + coma2(mape("transformer")) + "; la media del último mes, en " + coma2(mape("ultimo")) + "." },
      { valor: "¿Qué tendría que pasar para preferir el Transformer?",
        opciones: ["Que gane en el backtest, con más años de datos", "Que vuelva a acertar diciembre de 2026", "Que se le agreguen más cabezales de atención"], correcta: 0,
        razon: "Que gane en el mismo backtest. Con 47 ventanas casi no aprende pesos; con muchas series o muchos más meses la comparación podría cambiar. Un mes más es otro dato suelto, y los cabezales no agregan datos." }
    ],
    cierre: "Se elige con el backtest, no con el mes que salió bien."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES };
    return;
  }

  var P = Pronostico, estado = { modelo: "estacional" }, pregunta = null;

  document.getElementById("ventana").innerHTML = P.tabla(MESES, [w.map(c3)]);

  function dibujar() {
    var k = estado.modelo, p = PRON[k];
    document.getElementById("lectura").innerHTML = NOMBRE[k] + ": pronostica <b>" + c3(p) + "</b> millones; se observaron " + c3(D.observado) +
      ". Error: " + miles(error(k)) + " pasajeros.";
    document.getElementById("barras").innerHTML = Grafica.barras({
      titulo: "Error de cada modelo en diciembre de 2025 (pasajeros)",
      barras: CLAVES.map(function (c) { return { rotulo: NOMBRE[c], valor: error(c), color: c === k ? "#d9822b" : "#9aa5b1" }; }),
      izquierda: 190, formato: miles, formatoEje: function (x) { return miles(x); } });
    if (pregunta) { pregunta.refrescar(); }
  }

  function preguntar() {
    if (typeof Motor.opcionesNumericas !== "function") { return; }
    pregunta = Motor.opcionesNumericas("op-error", "ver-error", function () {
      document.getElementById("pregunta-error").innerHTML = "¿Cuántos pasajeros de error tiene la media de los tres últimos meses? Calcúlelo con la ventana antes de elegirla.";
      return [
        { valor: miles(error("tres")), clave: "correcta", razon: c3(base) + " + (" + c3(w[9]) + " + " + c3(w[10]) + " + " + c3(w[11]) + ") / 3 = " + c3(PRON.tres) +
          "; contra " + c3(D.observado) + " son " + miles(error("tres")) + " pasajeros." },
        { valor: miles(Math.abs(base + w[9] + w[10] + w[11] - D.observado) * 1e6), clave: "sin-dividir", razon: "Es sumar las tres diferencias sin dividir por 3: los pesos tienen que sumar 1." },
        { valor: miles(error("estacional")), clave: "sin-diferencia", razon: "Es el error del estacional ingenuo: diciembre de 2024 sin sumarle la diferencia pronosticada." },
        { valor: miles(Math.abs(base + (w[0] + w[1] + w[2]) / 3 - D.observado) * 1e6), clave: "primeros", razon: "Es la media de los tres primeros pasos, diciembre de 2024 a febrero de 2025. Los tres últimos son septiembre a noviembre de 2025." }
      ];
    });
  }

  P.selector("modelo", function (v) { estado.modelo = v; dibujar(); });
  preguntar();
  dibujar();

  document.getElementById("tabla").innerHTML = P.tabla(["Modelo", "Error en diciembre de 2025", "MAPE del backtest", "Parámetros"],
    CLAVES.map(function (c) {
      var f = bt[FILA[c]];
      return [NOMBRE[c], miles(error(c)), coma2(mape(c)), f && f.parametros !== null ? P.miles(f.parametros) : "0"];
    }));

  document.getElementById("cierre-tabla").innerHTML = P.tabla(["", "Qué", "Lo que lo muestra"], [
    ["Un mes", "Lo ganó el " + NOMBRE[orden[0]], "Error de " + miles(error(orden[0])) + " pasajeros; la regresión lineal, " + miles(error("lineal")) + "."],
    ["El backtest", "Lo gana la regresión lineal", "MAPE " + coma2(mape("lineal")) + " contra " + coma2(mape("sinPosicion")) + " del Transformer sin posición y " + coma2(mape("transformer")) + " con ella."],
    ["El tamaño", "15 parámetros contra 2 273", "Con 110 meses, el modelo pequeño es el que generaliza."]
  ]);
  document.getElementById("cierre-texto").textContent =
    "Un pronóstico que acierta un mes puede ser suerte. Lo que justifica un modelo es el mismo backtest para todos: 13 orígenes, 12 meses cada uno.";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
