/* La RNN paso a paso: la cuenta de cada paso sobre la ventana de enero de 2025,
   la salida que vuelve a entrar, lo que queda del pasado en h_12 y el orden de
   lectura. Todo se calcula aquí con Celdas. */
(function () {
  "use strict";

  var C = Celdas, P = Pronostico, X = C.X, V = DATOS.ventana;
  var U = [0.3, 0.8, 0.95, 1.2];
  function c4(x) { return P.coma(x, 4); }

  /* Los números que usan las preguntas, con u = 0,8 salvo que se diga otro. */
  var p08 = C.rnn(X, 0.8), q08 = C.quedaRnn(p08, 0.8);
  var p12 = C.rnn(X, 1.2), q12 = C.quedaRnn(p12, 1.2);
  var rev08 = C.rnn(X.slice().reverse(), 0.8);
  var sube = q12[0] > q08[0];

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover los controles",
    definicion: "h<sub>t</sub> = tanh(w x<sub>t</sub> + u h<sub>t−1</sub> + b)",
    explicacion: "La fórmula de la celda, con h<sub>0</sub> = 0 antes del primer paso.",
    items: [
      { valor: "En el paso t, ¿qué recibe la celda además del mes x<sub>t</sub>?",
        opciones: ["El mes anterior, x<sub>t−1</sub>, como segunda columna", "Su salida del paso anterior, h<sub>t−1</sub>", "Nada más: cada paso lee solo su mes"],
        correcta: 1,
        razon: "Recibe h<sub>t−1</sub>, lo que ella misma calculó en el paso anterior. Ese lazo es lo que la hace recurrente: lo leído en los pasos 1 a t − 1 llega al paso t resumido en h<sub>t−1</sub>, no como meses sueltos." },
      { valor: "La celda de 32 neuronas tiene " + P.miles(C.pesos("RNN", 32)) + " pesos con una ventana de 12 pasos. ¿Cuántos tiene con 24 pasos?",
        opciones: ["El doble, " + P.miles(2 * C.pesos("RNN", 32)) + ": un juego por cada paso", "Doce más por paso, " + P.miles(C.pesos("RNN", 32) + 12 * 32), "Los mismos " + P.miles(C.pesos("RNN", 32))],
        correcta: 2,
        razon: "Los mismos. Los pesos son W (32 × 1), U (32 × 32) y dos sesgos de 32: 32 + 1024 + 64 = " + P.miles(C.pesos("RNN", 32)) +
          ". Esos mismos pesos se aplican en cada paso, así que alargar la ventana no agrega pesos: agrega pasos." }
    ],
    cierre: "Una RNN es una sola cuenta que se repite, y su salida entra de nuevo en ella."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con los controles en la mano",
    definicion: null,
    explicacion: "Mueva un control a la vez y lea la tabla.",
    items: [
      { valor: "Con <code>u = 0,8</code>, ¿cuánto de lo que el estado tenía en el paso 1 sigue en h<sub>12</sub>?",
        opciones: [C.pct(q08[0]), C.pct(Math.pow(0.8, 11)), C.pct(0.8)],
        correcta: 0,
        razon: "El " + C.pct(q08[0]) + ". Cada paso multiplica por u (1 − h²), que con u = 0,8 queda entre " +
          P.coma(Math.min.apply(null, p08.slice(1).map(function (p) { return 0.8 * (1 - p.h * p.h); })), 2) + " y " +
          P.coma(Math.max.apply(null, p08.slice(1).map(function (p) { return 0.8 * (1 - p.h * p.h); })), 2) +
          ", y once factores menores que 1 multiplicados dan casi nada. 0,8<sup>11</sup> = " + C.pct(Math.pow(0.8, 11)) + " sería lo que queda si la pendiente de tanh, 1 − h², valiera 1 en todos los pasos." },
      { valor: "Al subir <code>u</code> de 0,8 a 1,2, ¿qué pasa con lo que queda del paso 1 en h<sub>12</sub>?",
        opciones: ["Sube, porque el pasado pesa más en cada paso", "No cambia, porque solo depende de w", "Baja, porque h se acerca a 1 y tanh se aplana"],
        correcta: sube ? 0 : 2,
        razon: "Pasa de " + C.pct(q08[0]) + " a " + C.pct(q12[0]) + ". Con u = 1,2 la suma crece, h<sub>12</sub> llega a " + P.coma(p12[11].h, 2) +
          " y la pendiente de tanh, 1 − h², se acerca a cero. Subir u no le da a la RNN memoria larga: la satura." },
      { valor: "Con <code>u = 0,8</code>, marque <em>leer la ventana al revés</em>. ¿Qué pasa con h<sub>12</sub>?",
        opciones: ["Cambia: otro orden da otro estado", "Queda igual: son los mismos doce meses", "Queda igual salvo por el redondeo"],
        correcta: 0,
        razon: "Pasa de " + c4(p08[11].h) + " a " + c4(rev08[11].h) + ". La RNN lee la secuencia: el último mes leído pesa más que el primero. " +
          "Un MLP recibe las doce columnas a la vez, y barajarlas solo cambia qué peso multiplica a cada mes, lo que la actividad <em>Barajar</em> muestra." },
      { valor: "Para calcular h<sub>12</sub>, ¿cuántas cuentas de la celda tienen que hacerse una después de otra?",
        opciones: ["Una sola: las doce se calculan a la vez", "Doce, porque cada h<sub>t</sub> necesita h<sub>t−1</sub>", "Dos, una por la celda y otra por Linear"],
        correcta: 1,
        razon: "Doce. El paso 5 no puede empezar hasta que el paso 4 entregue h<sub>4</sub>. Con 24 pasos son 24 cuentas en fila, y esa es una de las razones por las que una RNN entrena más lento que un MLP, cuyas columnas entran todas a la vez." }
    ],
    cierre: "La RNN lee en orden con pocos pesos, pero lo que leyó al principio casi no llega al final."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES };
    return;
  }

  document.getElementById("media").textContent = P.coma(V.media, 4);
  document.getElementById("desv").textContent = P.coma(V.desviacion, 4);
  var estado = { u: 0.8, t: 1, reves: false };
  var control = document.getElementById("paso");

  function dibujar() {
    var x = estado.reves ? X.slice().reverse() : X;
    var pasos = C.rnn(x, estado.u), queda = C.quedaRnn(pasos, estado.u), t = estado.t, p = pasos[t - 1];
    document.getElementById("paso-valor").textContent = t;
    document.getElementById("lectura").innerHTML = "Paso " + t + ": h<sub>" + t + "</sub> = tanh(0,5 × " + P.coma(p.x, 4) +
      " + " + P.coma(estado.u, 2) + " × " + c4(p.hAntes) + " + 0,1) = tanh(" + c4(p.suma) + ") = <b>" + c4(p.h) + "</b>. " +
      (t < 12 ? "Este h<sub>" + t + "</sub> entra al paso " + (t + 1) + "." : "h<sub>12</sub> es lo que recibe la capa lineal.");
    document.getElementById("cadena").innerHTML = C.cadena(12, t, ["h"], "La misma celda, con los mismos w, u y b, en los doce pasos");
    document.getElementById("tabla").innerHTML = P.tabla(
      ["t", "x<sub>t</sub>", "w x<sub>t</sub>", "u h<sub>t−1</sub>", "suma + b", "h<sub>t</sub>", "queda en h<sub>12</sub>"],
      pasos.map(function (q, k) {
        var visto = k < t;
        return [k + 1, c4(q.x)].concat(visto ? [c4(q.wx), c4(q.uh), c4(q.suma), "<b>" + c4(q.h) + "</b>", C.pct(queda[k])] : ["", "", "", "", ""]);
      }));
    document.getElementById("figura").innerHTML = t < 2 ? '<p class="nota">La gráfica aparece desde el paso 2.</p>' : Grafica.lineas({
      lineas: [{ valores: pasos.slice(0, t).map(function (q) { return q.h; }), color: "#d9822b" }],
      ancho: 640, alto: 200, titulo: "h_t de los pasos 1 a " + t, etiquetaY: "h", cero: true,
      marcasX: [0, 3, 7, 11].filter(function (k) { return k < t; }), rotuloX: function (k) { return "paso " + (k + 1); }
    });
  }
  control.addEventListener("input", function () { estado.t = Number(control.value); dibujar(); });
  document.getElementById("reves").addEventListener("change", function (e) { estado.reves = e.target.checked; dibujar(); });
  P.selector("u", function (v) { estado.u = Number(v); dibujar(); });
  dibujar();

  var filas = [
    ["Ventaja", "Lee la ventana en orden", "Con u = 0,8, h<sub>12</sub> es " + c4(p08[11].h) + " en orden y " + c4(rev08[11].h) + " al revés."],
    ["Ventaja", "Los mismos pesos en cada paso", P.miles(C.pesos("RNN", 32)) + " pesos con 32 neuronas, sea la ventana de 3, 12 o 24 pasos."],
    ["Ventaja", "Resume lo leído en un estado de tamaño fijo", "h<sub>t</sub> tiene tantos números como neuronas, sin importar cuántos pasos lleve."],
    ["Limitación", "Lo del principio casi no llega al final", "Del paso 1 queda el " + C.pct(q08[0]) + " en h<sub>12</sub> con u = 0,8, y el gradiente vuelve por el mismo camino."],
    ["Limitación", "Subir u no lo arregla", "Con u = 1,2 queda el " + C.pct(q12[0]) + ": tanh se satura."],
    ["Limitación", "Los pasos van en fila", "12 cuentas una tras otra para una ventana de 12; no se reparten a la vez."]
  ];
  document.getElementById("cierre-tabla").innerHTML = P.tabla(["", "Qué", "Lo que lo muestra en esta página"], filas);
  var B = DATOS.backtest;
  document.getElementById("cierre-texto").innerHTML =
    "Que el pasado se apague no siempre estorba. En esta serie pesan los meses recientes, y en el backtest de la sesión, con 12 pasos y 32 neuronas, la RNN da un MAPE de " +
    P.coma(B["RNN 32, diferencia"].MAPE) + " frente a " + P.coma(B["LSTM 32, diferencia"].MAPE) + " de la LSTM. Cuando lo que importa está muchos pasos atrás, " +
    "esa limitación es la que ataca la LSTM: la actividad <em>La celda LSTM paso a paso</em> la muestra con las mismas cuentas.";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
