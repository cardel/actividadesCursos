/* La ventana de un mes. Calca la primera interactiva del notebook de la
   sesión de redes recurrentes: los doce meses anteriores resaltados en la
   serie y el tensor (12, 1) de la diferencia con hace 12 meses. */
(function () {
  "use strict";

  var P = Pronostico, m = SERIE.meses, v = SERIE.valores, n = v.length;
  var PASOS = 12;
  /* La diferencia con hace 12 meses, en millones; los 12 primeros meses no la tienen. */
  var dif = v.map(function (x, i) { return i < 12 ? null : (x - v[i - 12]) / 1e6; });
  var primero = 12 + PASOS;              // el primer mes con ventana completa
  var cuantas = n - primero;

  /* La caída más fuerte de la diferencia y la ventana que la tiene en el paso 12. */
  var iMin = 12;
  for (var i = 12; i < n; i++) { if (dif[i] < dif[iMin]) { iMin = i; } }

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover el control",
    definicion: null,
    explicacion: "La ventana del mes t son las diferencias de los meses t − 12 a t − 1, en ese orden.",
    items: [
      { valor: "Para pronosticar marzo de 2025 con 12 pasos, ¿qué mes trae el paso 1?",
        opciones: ["febrero de 2024", "marzo de 2024", "abril de 2024"], correcta: 1,
        razon: "El paso 1 es el mes más viejo, doce meses antes: marzo de 2024. El paso 12 es febrero de 2025, el mes anterior al que se pronostica." },
      { valor: "La serie tiene " + n + " meses. ¿Qué forma tiene el tensor con todas sus ventanas de 12 pasos?",
        opciones: ["(" + cuantas + ", 12, 1)", "(" + (n - 12) + ", 12, 1)", "(" + cuantas + ", 1, 12)"], correcta: 0,
        razon: "La diferencia pierde los 12 primeros meses y la ventana pide otros 12 antes del objetivo: quedan " + n + " − 24 = " +
          cuantas + " ventanas. Los pasos van en el segundo eje y las variables en el tercero." }
    ],
    cierre: "Cada ventana es un trozo de la serie en orden, no una fila de columnas sueltas."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con el control en la mano",
    definicion: null,
    explicacion: "Mueva el mes y mire la gráfica y la tabla.",
    items: [
      { valor: "¿Cuántos valores comparten las ventanas de dos meses seguidos?",
        opciones: ["Ninguno", "6 de 12", "11 de 12"], correcta: 2,
        razon: "Al avanzar un mes, la ventana suelta su paso 1 y suma como paso 12 el mes que antes era el objetivo: los otros 11 se repiten, un paso más atrás." },
      { valor: "Busque la ventana con la diferencia más baja en el paso 12. ¿Qué mes pronostica?",
        opciones: [P.nombre(m[iMin]), P.nombre(m[iMin + 1]), P.nombre(m[iMin + 12])], correcta: 1,
        razon: "La diferencia más baja es la de " + P.nombre(m[iMin]) + ", " + P.coma(dif[iMin], 3) +
          " millones. Está en el paso 12 de la ventana del mes siguiente, " + P.nombre(m[iMin + 1]) + "." },
      { valor: "¿En cuántas ventanas aparece esa misma caída como paso de entrada?",
        opciones: ["En 12", "En 1", "En 24"], correcta: 0,
        razon: "Entra como paso 12 en la ventana de " + P.nombre(m[iMin + 1]) + ", como paso 11 en la siguiente, y así hasta el paso 1 en la de " +
          P.nombre(m[iMin + 12]) + ": doce ventanas la llevan, cada vez un paso más atrás." }
    ],
    cierre: "Un mes atípico no se queda en una fila: viaja por doce ventanas."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES, cuantas: cuantas, iMin: iMin };
    return;
  }

  var control = document.getElementById("mes");
  control.min = primero;
  control.max = n - 1;
  control.value = m.indexOf("2025-01");
  var millones = v.map(function (x) { return x / 1e6; });
  var eneros = [];
  m.forEach(function (x, k) { if (x.slice(5) === "01") { eneros.push(k); } });

  function dibujar() {
    var t = Number(control.value);
    document.getElementById("mes-valor").textContent = m[t];
    document.getElementById("figura").innerHTML = Grafica.lineas({
      lineas: [
        { valores: millones, color: "#c3c7cf" },
        { valores: millones.slice(t - PASOS, t), color: "#d9822b", desde: t - PASOS },
        { valores: millones.slice(t - 1, t + 1), color: Grafica.ROJO, desde: t - 1 }
      ],
      ancho: 640, alto: 240, titulo: "Ventana de " + P.nombre(m[t]) + ": forma (12, 1)",
      etiquetaY: "millones", marcasX: eneros,
      rotuloX: function (k) { return m[k].slice(0, 4); }
    }) + '<p class="nota">Gris: la serie. Naranja: los doce meses de la ventana. Rojo: el paso al mes que se pronostica.</p>';
    var filas = [];
    for (var p = 1; p <= PASOS; p++) {
      var k = t - PASOS + p - 1;
      filas.push([String(p), m[k], P.coma(dif[k], 3)]);
    }
    filas.push(["objetivo", m[t], "<b>" + P.coma(dif[t], 3) + "</b>"]);
    document.getElementById("tabla").innerHTML = P.tabla(["Paso", "Mes", "Diferencia (millones)"], filas);
    document.getElementById("lectura").innerHTML = "Ventana " + (t - primero + 1) + " de " + cuantas +
      ": del paso 1, " + m[t - PASOS] + ", al paso 12, " + m[t - 1] + ".";
  }
  control.addEventListener("input", dibujar);
  dibujar();

  document.getElementById("cierre-texto").textContent =
    "La serie tiene " + n + " meses y da " + cuantas + " ventanas de 12 pasos. Las ventanas se solapan: dos meses seguidos comparten 11 valores, " +
    "y un mes atípico como " + P.nombre(m[iMin]) + " entra en doce de ellas. Antes de llegar a la red, cada ventana se escala con la media y la " +
    "desviación de los meses de entrenamiento, y las 24 últimas se apartan para validar.";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
