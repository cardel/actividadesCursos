/* Épocas y escala. Calca la segunda interactiva del notebook del perceptrón
   multicapa: el pronóstico de 2025 según cuántas épocas entrena la red, con
   y sin invertir el escalado. */
(function () {
  "use strict";

  var R = Redes, E = DATOS.epocas, EPOCAS = E.epocas;
  function pron(n) { return E.pronosticos[String(n)]; }
  function mae(n, invertir) { return R.mae(invertir ? pron(n).millones : pron(n).salida); }

  /* Los números que usan las preguntas. */
  var maes = EPOCAS.map(function (n) { return mae(n, true); });
  var mejor = EPOCAS[maes.indexOf(Math.min.apply(null, maes))];
  var m50 = mae(50, true), m500 = mae(500, true), m5 = mae(5, true), crudo = mae(500, false);
  var medio = R.real2025.reduce(function (a, b) { return a + b; }, 0) / 12 * 1e6;
  var salida5 = pron(5).salida, mayor5 = Math.max.apply(null, salida5.map(Math.abs));
  var techo = Math.max.apply(null, EPOCAS.map(function (n) {
    return Math.max.apply(null, pron(n).salida.map(Math.abs));
  }));

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover los controles",
    definicion: null,
    explicacion: "La salida de la red está en la escala del entrenamiento: 0 es la diferencia media con hace 12 meses, y 1 es una desviación por encima.",
    items: [
      { valor: "Si para enero de 2025 la red devuelve exactamente 0, ¿qué pronostica en pasajeros?",
        opciones: ["Cero pasajeros en enero de 2025", "Enero de 2024 tal cual, sin ningún cambio", "Enero de 2024 más la diferencia media"],
        correcta: 2,
        razon: "Invertir el escalado lleva el 0 a la media de la diferencia en el entrenamiento, y a_nivel le suma enero de 2024." },
      { valor: "Sin invertir el escalado, la salida de la red no pasa de " + R.coma(techo, 1) + " en valor absoluto. Tomada como pasajeros, ¿cuánto da su MAE en 2025?",
        opciones: ["Cerca de cero, porque la salida es pequeña", "Cerca del promedio de pasajeros de 2025", "Lo mismo que con el escalado invertido"],
        correcta: 1,
        razon: "Restar un número cercano a 0 de cada mes deja el mes completo: el MAE queda cerca de " + R.miles(medio) + ", el promedio mensual de 2025." }
    ],
    cierre: "La salida de la red no son pasajeros hasta deshacer el escalado y la diferencia."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con los controles en la mano",
    definicion: null,
    explicacion: "Responda con la casilla marcada, salvo donde la pregunta diga otra cosa.",
    items: [
      { valor: "¿Con cuántas épocas es menor el MAE de 2025?",
        opciones: EPOCAS.map(String), correcta: EPOCAS.indexOf(mejor),
        razon: "Con " + mejor + ". El MAE pasa por " + maes.map(R.miles).join(", ") + " con " + EPOCAS.join(", ") + " épocas." },
      { valor: "¿Qué le pasa al MAE de 2025 de 50 a 500 épocas?",
        opciones: ["Baja, porque la red aprende más de la serie", "Sube, porque la red copia el entrenamiento", "No cambia, porque la red ya convergió"],
        correcta: m500 > m50 * 1.1 ? 1 : m500 < m50 * 0.9 ? 0 : 2,
        razon: "Pasa de " + R.miles(m50) + " a " + R.miles(m500) + ". Sin parada temprana la red sigue ajustando sus filas de entrenamiento, pandemia incluida, y el pronóstico se aleja de 2025." },
      { valor: "Con 5 épocas la red casi no ha aprendido y su MAE de 2025 es " + R.miles(m5) + ". ¿Por qué tan bajo?",
        opciones: ["Su salida casi no se mueve de la diferencia media", "La parada temprana la detuvo en su mejor punto", "Cinco épocas bastan para aprender la serie entera"],
        correcta: 0,
        razon: "Ninguna salida pasa de " + R.coma(mayor5, 2) + " en valor absoluto: la red pronostica 2024 más un crecimiento parecido al promedio. Esta red no tiene parada temprana." },
      { valor: "Desmarque la casilla con 500 épocas: el MAE pasa a " + R.miles(crudo) + ". ¿Qué se está comparando?",
        opciones: ["Diferencias en su escala contra pasajeros", "Pasajeros contra pasajeros, con una red distinta", "Millones de pasajeros contra pasajeros"],
        correcta: 0,
        razon: "La salida es la diferencia con hace 12 meses estandarizada, un número cerca de 0. Contra los pasajeros observados, el error es casi el mes entero." }
    ],
    cierre: "Entrenar más no mejora el pronóstico, y una métrica sin invertir la escala no dice nada."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES, mejor: mejor };
    return;
  }

  var meses = SERIE.meses, v = SERIE.valores, desde = meses.indexOf("2022-01");
  var observado = v.slice(desde, desde + 48).map(function (x) { return x / 1e6; });
  var estado = { n: 500, invertir: true };
  var casilla = document.getElementById("invertir");

  function dibujar() {
    var p = estado.invertir ? pron(estado.n).millones : pron(estado.n).salida;
    var titulo = estado.n + " épocas" + (estado.invertir ? "" : ", sin invertir el escalado");
    document.getElementById("lectura").innerHTML = titulo + ": <b>MAE " + R.miles(R.mae(p)) + "</b> pasajeros en 2025.";
    document.getElementById("figura").innerHTML = Grafica.lineas({
      lineas: [{ valores: observado, color: Grafica.AZUL }, { valores: p, color: estado.invertir ? "#d9822b" : Grafica.ROJO, desde: 36 }],
      ancho: 640, alto: 260, titulo: titulo, etiquetaY: "millones", marcasX: [0, 12, 24, 36],
      rotuloX: function (i) { return String(2022 + i / 12); }
    }) + '<p class="nota">Azul: observado. ' + (estado.invertir ? "Naranja: pronóstico de 2025 en millones de pasajeros." :
      "Rojo: la salida de la red para cada mes de 2025, en su escala.") + "</p>";
  }

  R.selector("epocas", function (x) { estado.n = Number(x); dibujar(); });
  casilla.addEventListener("change", function () { estado.invertir = casilla.checked; dibujar(); });
  dibujar();

  document.getElementById("cierre-tabla").innerHTML = R.tabla(
    ["épocas", "MAE de 2025", "MAE sin invertir"],
    EPOCAS.map(function (n) { return [String(n), R.miles(mae(n, true)), R.miles(mae(n, false))]; }));
  document.getElementById("cierre-texto").textContent =
    "Con pocas épocas la red pronostica casi lo mismo que el año anterior más el crecimiento medio, y en 2025 eso basta. Con muchas, copia su entrenamiento. " +
    "La parada temprana escoge las épocas con meses de validación, sin mirar 2025. En el backtest de la sesión, con esa parada, la red queda en " +
    R.miles(DATOS.tabla.mlp.MAE) + " de MAE y el estacional ingenuo en " + R.miles(DATOS.tabla.estacional.MAE) + ".";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
