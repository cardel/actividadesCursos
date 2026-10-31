/* Un árbol o un bosque. Calca la tercera interactiva del notebook de la
   sesión 7: un árbol de profundidad 1 a 10 o sin límite, o un Random Forest
   de cien árboles, todos sobre la diferencia con hace 12 meses. */
(function () {
  "use strict";

  var P = Pronostico, A = DATOS.arbol;
  function mae(p) { return A[String(p)].mae; }
  var PROF = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  /* Los números que usan las preguntas. */
  var subidas = PROF.slice(1).filter(function (p) { return mae(p) > mae(p - 1); });
  var mejor = PROF.reduce(function (a, b) { return mae(b) < mae(a) ? b : a; });
  var peor = Math.max.apply(null, PROF.map(mae).concat([mae(0)]));
  var veces = mae(10) / mae(9);
  var cerca = A.bosque.mae - mae(mejor) < peor - A.bosque.mae;
  var c56 = mae(6) - mae(5);

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover el control",
    definicion: null,
    explicacion: "Prediga, sin mirar la gráfica, cómo cambia el MAE de 2025 con la profundidad del árbol.",
    items: [
      { valor: "Al subir la profundidad de 1 a 10, ¿el MAE de 2025 baja en cada paso?",
        opciones: ["Sí, siempre baja", "No, sube en algunos pasos"], correcta: subidas.length ? 1 : 0,
        razon: subidas.length
          ? "No: sube al pasar a profundidad " + subidas.join(", ") + ". Cada pregunta de más ajusta mejor el entrenamiento, pero puede mandar un mes de 2025 a una hoja equivocada."
          : "En estos datos baja en cada paso." },
      { valor: "¿Qué espera de un árbol sin límite de profundidad?",
        opciones: ["El mejor de todos", "Que memorice el entrenamiento"], correcta: 1,
        razon: "Que lo memorice: crece hasta dejar una fila por hoja. Su MAE de 2025 es " + P.miles(mae(0)) + " pasajeros." }
    ],
    cierre: "Más profundidad es más memoria, no necesariamente mejor pronóstico."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con el control en la mano",
    definicion: null,
    explicacion: "Responda moviendo la profundidad y probando el bosque.",
    items: [
      { valor: "Entre profundidad 5 y 6, ¿qué le pasa al MAE?",
        opciones: ["Baja", "Casi igual", "Sube"], correcta: c56 < -0.2 * mae(5) ? 0 : c56 > 0.2 * mae(5) ? 2 : 1,
        razon: "Pasa de " + P.miles(mae(5)) + " a " + P.miles(mae(6)) + " pasajeros con una sola pregunta más. El árbol cambia mucho con un cambio pequeño de su control." },
      { valor: "Entre profundidad 9 y 10, ¿cuántas veces se multiplica el MAE?",
        opciones: ["Menos del doble", "Entre 2 y 5 veces", "Más de 10 veces"], correcta: veces < 2 ? 0 : veces <= 5 ? 1 : 2,
        razon: "De " + P.miles(mae(9)) + " a " + P.miles(mae(10)) + ", unas " + Math.round(veces) + " veces. Profundidad 10 ya es casi el árbol sin límite." },
      { valor: "El Random Forest da " + P.miles(A.bosque.mae) + ". ¿Queda más cerca del mejor árbol o del peor?",
        opciones: ["Del mejor", "Del peor"], correcta: cerca ? 0 : 1,
        razon: "El mejor árbol, el de profundidad " + mejor + ", da " + P.miles(mae(mejor)) + " y el peor, " + P.miles(peor) +
          ". El bosque queda cerca del mejor sin haber tenido que encontrar la profundidad." }
    ],
    cierre: "El bosque cambia menos porque promedia cien árboles que vieron muestras distintas."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES };
    return;
  }

  var estado = { p: 4, bosque: false };
  var dp = document.getElementById("p");

  function dibujar() {
    document.getElementById("p-valor").textContent = estado.p === 0 ? "sin límite" : estado.p;
    var x = estado.bosque ? A.bosque : A[String(estado.p)];
    var titulo = estado.bosque ? "Random Forest, 100 árboles"
      : "Un árbol, " + (estado.p === 0 ? "sin límite" : "profundidad " + estado.p);
    document.getElementById("lectura").innerHTML = titulo + ": <b>MAE " + P.miles(x.mae) + "</b> pasajeros en 2025.";
    P.figura("figura", x, titulo, false);
  }

  dp.addEventListener("input", function () { estado.p = Number(dp.value); dibujar(); });
  P.selector("modelo", function (v) { estado.bosque = v === "bosque"; dibujar(); });
  dibujar();

  document.getElementById("cierre-tabla").innerHTML = P.tabla(
    ["modelo", "MAE 2025"],
    PROF.map(function (p) { return ["árbol, profundidad " + p, P.miles(mae(p))]; })
      .concat([["árbol sin límite", P.miles(mae(0))], ["Random Forest", P.miles(A.bosque.mae)]]));

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
