/* La celda LSTM paso a paso: las tres compuertas, la memoria c y la salida h
   sobre la ventana de enero de 2025, lo que queda del paso 1 en c_12 según el
   sesgo de olvido, y la comparación con la RNN. Todo se calcula aquí con Celdas. */
(function () {
  "use strict";

  var C = Celdas, P = Pronostico, X = C.X, B = DATOS.backtest;
  function c3(x) { return P.coma(x, 3); }
  function c2(x) { return P.coma(x, 2); }

  function celda(bf) { var p = C.lstm(X, bf); return { p: p, q: C.quedaLstm(p) }; }
  var L3 = celda(3), L0 = celda(0), Lm3 = celda(-3);
  var r08 = C.rnn(X, 0.8), qr08 = C.quedaRnn(r08, 0.8);
  function rango(p, k) {
    var v = p.map(function (q) { return q[k]; });
    return c2(Math.min.apply(null, v)) + " y " + c2(Math.max.apply(null, v));
  }
  var mapeRnn = B["RNN 32, diferencia"].MAPE, mapeLstm = B["LSTM 32, diferencia"].MAPE;
  var mapeCinco = B["LSTM, promedio de 5 semillas, diferencia"].MAPE;

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover los controles",
    definicion: "c<sub>t</sub> = f<sub>t</sub> c<sub>t−1</sub> + i<sub>t</sub> g<sub>t</sub> &nbsp;&nbsp; h<sub>t</sub> = o<sub>t</sub> tanh(c<sub>t</sub>)",
    explicacion: "Las dos cuentas de la celda, con c<sub>0</sub> = h<sub>0</sub> = 0 antes del primer paso.",
    items: [
      { valor: "Si en un paso f<sub>t</sub> = 1 e i<sub>t</sub> = 0, ¿cuánto vale c<sub>t</sub>?",
        opciones: ["0: la memoria se borra", "g<sub>t</sub>, el candidato de ese paso", "c<sub>t−1</sub>, sin cambio"],
        correcta: 2,
        razon: "c<sub>t</sub> = 1 × c<sub>t−1</sub> + 0 × g<sub>t</sub> = c<sub>t−1</sub>. La memoria pasa intacta: ni se olvida nada ni se escribe nada nuevo. En la RNN no hay forma de pasar el estado sin reescribirlo, porque h<sub>t</sub> siempre vuelve a pasar por tanh." },
      { valor: "Las compuertas f, i y o pasan su suma por una sigmoide. ¿Para qué?",
        opciones: ["Para dar una fracción entre 0 y 1 de lo que pasa", "Para dar un valor entre −1 y 1 que suma o resta", "Para que la cuenta salga más barata que tanh"],
        correcta: 0,
        razon: "La sigmoide lleva cualquier suma a (0, 1): sigmoide(−3) = " + c2(C.sigmoide(-3)) + ", sigmoide(0) = 0,5 y sigmoide(3) = " + c2(C.sigmoide(3)) +
          ". Multiplicar por ese número es dejar pasar una fracción, de casi nada a casi todo. El valor entre −1 y 1 es el de g<sub>t</sub>, con tanh." }
    ],
    cierre: "La LSTM le agrega a la RNN una memoria que las compuertas dejan pasar, completan o leen."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con los controles en la mano",
    definicion: null,
    explicacion: "Mueva b<sub>f</sub> y lea la columna f<sub>t</sub> y la última columna de la tabla.",
    items: [
      { valor: "Con b<sub>f</sub> = 3, ¿cuánto de lo que la memoria tenía en el paso 1 sigue en c<sub>12</sub>?",
        opciones: [C.pct(L0.q[0]), C.pct(L3.q[0]), C.pct(qr08[0])],
        correcta: 1,
        razon: "El " + C.pct(L3.q[0]) + ". Con b<sub>f</sub> = 3, f<sub>t</sub> queda entre " + rango(L3.p.slice(1), "f") +
          ", y once factores así se comen poco. En la RNN con u = 0,8 queda el " + C.pct(qr08[0]) + ", porque su factor por paso, u (1 − h²), es mucho menor que 1." },
      { valor: "Con b<sub>f</sub> = −3, ¿qué hace la celda con su memoria?",
        opciones: ["La conserva casi entera, como con b<sub>f</sub> = 3", "La pasa igual que una RNN con u = 0,8", "La borra casi entera en cada paso"],
        correcta: 2,
        razon: "f<sub>t</sub> queda entre " + rango(Lm3.p, "f") + ": cada paso conserva esa fracción de c<sub>t−1</sub>, y c<sub>t</sub> es casi solo i<sub>t</sub> g<sub>t</sub>, lo del mes en curso. Del paso 1 queda " +
          C.pct(Lm3.q[0]) + ". La memoria larga no es automática: depende de que la red aprenda una f cercana a 1." },
      { valor: "Con 32 neuronas, ¿cuántos pesos tiene la celda LSTM?",
        opciones: [P.miles(C.pesos("LSTM", 32)) + ": cuatro cuentas como la de la RNN", P.miles(C.pesos("RNN", 32)) + ": los mismos de la RNN", P.miles(2 * C.pesos("RNN", 32)) + ": unos para c y otros para h"],
        correcta: 0,
        razon: "f, i, o y g tienen cada una su W, su U y sus sesgos, como la RNN: 4 × " + P.miles(C.pesos("RNN", 32)) + " = " + P.miles(C.pesos("LSTM", 32)) +
          ". Cuatro veces los pesos piden más datos para ajustarse y cuatro cuentas por paso en vez de una." },
      { valor: "En el backtest de la sesión, con una semilla, 12 pasos y 32 neuronas, ¿cuál de las dos da menor MAPE?",
        opciones: ["La LSTM", "La RNN", "Empatan"],
        correcta: mapeRnn < mapeLstm ? 1 : mapeLstm < mapeRnn ? 0 : 2,
        razon: "La RNN da " + P.coma(mapeRnn) + " y la LSTM, " + P.coma(mapeLstm) + ". En esta serie pesan los meses recientes, y la memoria larga no le saca ventaja. " +
          "Con cinco semillas promediadas la LSTM baja a " + P.coma(mapeCinco) + ": con una sola semilla, el resultado depende mucho de dónde empezaron los pesos." },
      { valor: "¿Deja la LSTM de calcular los pasos uno después de otro?",
        opciones: ["Sí: las cuatro compuertas se calculan a la vez", "No: c<sub>t</sub> necesita c<sub>t−1</sub> y h<sub>t−1</sub>", "Sí, cuando b<sub>f</sub> es alto"],
        correcta: 1,
        razon: "No. Las cuatro cuentas de un paso sí van a la vez, pero el paso t no empieza sin c<sub>t−1</sub> y h<sub>t−1</sub>. Sigue habiendo 12 pasos en fila para una ventana de 12, como en la RNN." }
    ],
    cierre: "La LSTM conserva la memoria cuando f se acerca a 1, y lo paga con cuatro veces los pesos."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES };
    return;
  }

  var estado = { bf: 3, t: 1 };
  var control = document.getElementById("paso");

  function dibujar() {
    var x = celda(estado.bf), t = estado.t, p = x.p[t - 1];
    document.getElementById("paso-valor").textContent = t;
    document.getElementById("lectura").innerHTML = "Paso " + t + ": f = " + c3(p.f) + ", i = " + c3(p.i) + ", g = " + c3(p.g) + ", o = " + c3(p.o) +
      ". c<sub>" + t + "</sub> = " + c3(p.f) + " × " + c3(p.cAntes) + " + " + c3(p.i) + " × " + c3(p.g) + " = <b>" + c3(p.c) +
      "</b>; h<sub>" + t + "</sub> = " + c3(p.o) + " × tanh(" + c3(p.c) + ") = <b>" + c3(p.h) + "</b>.";
    document.getElementById("cadena").innerHTML = C.cadena(12, t, ["c", "h"], "La misma celda en los doce pasos: c y h pasan cada uno por su carril");
    document.getElementById("tabla").innerHTML = P.tabla(
      ["t", "x<sub>t</sub>", "f<sub>t</sub>", "i<sub>t</sub>", "g<sub>t</sub>", "o<sub>t</sub>", "c<sub>t</sub>", "h<sub>t</sub>", "queda en c<sub>12</sub>"],
      x.p.map(function (q, k) {
        var visto = k < t;
        return [k + 1, P.coma(q.x, 4)].concat(visto ? [c3(q.f), c3(q.i), c3(q.g), c3(q.o), "<b>" + c3(q.c) + "</b>", c3(q.h), C.pct(x.q[k])] :
          ["", "", "", "", "", "", ""]);
      }));
    document.getElementById("figura").innerHTML = t < 2 ? '<p class="nota">La gráfica aparece desde el paso 2.</p>' : Grafica.lineas({
      lineas: [{ valores: x.p.slice(0, t).map(function (q) { return q.c; }), color: "#1f6feb" },
        { valores: x.p.slice(0, t).map(function (q) { return q.h; }), color: "#d9822b" }],
      ancho: 640, alto: 200, titulo: "c_t (azul) y h_t (naranja) de los pasos 1 a " + t, etiquetaY: "valor", cero: true,
      marcasX: [0, 3, 7, 11].filter(function (k) { return k < t; }), rotuloX: function (k) { return "paso " + (k + 1); }
    });
  }
  control.addEventListener("input", function () { estado.t = Number(control.value); dibujar(); });
  P.selector("bf", function (v) { estado.bf = Number(v); dibujar(); });
  dibujar();

  var filas = [
    ["Dónde lleva lo leído", "En h<sub>t</sub>, que se reescribe con tanh en cada paso", "En c<sub>t</sub>, que f deja pasar e i completa"],
    ["Qué queda del paso 1 en el paso 12", C.pct(qr08[0]) + " con u = 0,8", C.pct(L3.q[0]) + " con b<sub>f</sub> = 3; " + C.pct(L0.q[0]) + " con b<sub>f</sub> = 0"],
    ["Pesos de la celda con 32 neuronas", P.miles(C.pesos("RNN", 32)), P.miles(C.pesos("LSTM", 32))],
    ["Cuentas por paso", "1", "4: f, i, o y g"],
    ["Pasos en fila con una ventana de 12", "12", "12"],
    ["MAPE del backtest, una semilla", P.coma(mapeRnn), P.coma(mapeLstm) + " (" + P.coma(mapeCinco) + " con cinco semillas)"]
  ];
  document.getElementById("cierre-tabla").innerHTML = P.tabla(["", "RNN", "LSTM"], filas);
  document.getElementById("cierre-texto").innerHTML =
    "<b>Ventajas de la LSTM.</b> Conserva lo leído muchos pasos atrás cuando f<sub>t</sub> se acerca a 1, y el gradiente llega a esos pasos por el mismo camino. Además decide en cada paso cuánto olvidar, porque f<sub>t</sub> depende de x<sub>t</sub> y h<sub>t−1</sub>. " +
    "<b>Limitaciones.</b> Tiene cuatro veces los pesos y las cuentas de la RNN, una sola semilla no basta para juzgarla y sigue leyendo en fila. Su memoria larga solo sirve si la serie la necesita, y la de pasajeros depende sobre todo de los meses recientes. " +
    "Con pocos datos y dependencias cortas, la RNN pequeña compite; con dependencias largas, la LSTM tiene con qué ganar.";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
