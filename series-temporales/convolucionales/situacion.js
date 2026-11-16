/* Sobre qué modelo vale un híbrido: el residuo del estacional ingenuo, del
   SARIMA y de la regresión lineal sobre la diferencia, su autocorrelación y las
   decisiones que salen de ahí. La autocorrelación se calcula aquí. */
(function () {
  "use strict";

  var P = Pronostico, C = Convolucion, B = DATOS.backtest;
  var meses = SERIE.meses, v = SERIE.valores, fin = meses.indexOf("2024-12");
  var estacional = [], mesesEst = [];
  for (var i = 12; i <= fin; i++) { estacional.push((v[i] - v[i - 12]) / 1e6); mesesEst.push(meses[i]); }
  var BASES = {
    estacional: { nombre: "estacional ingenuo", residuo: estacional, meses: mesesEst },
    sarima: { nombre: "SARIMA", residuo: DATOS.hibrido.residuo, meses: DATOS.hibrido.meses },
    lineal: { nombre: "regresión lineal", residuo: DATOS.lineal.residuo, meses: DATOS.lineal.meses }
  };
  Object.keys(BASES).forEach(function (k) {
    var b = BASES[k];
    b.acf = Series.acf(b.residuo, 12);
    b.banda = Series.banda(b.residuo.length);
    b.fuera = b.acf.slice(1).filter(function (r) { return Math.abs(r) > b.banda; }).length;
  });
  var E = BASES.estacional, S = BASES.sarima, L = BASES.lineal;
  function r2(x) { return C.coma(Math.abs(x) < 0.005 ? 0 : x, 2); }
  var orden = ["estacional", "sarima", "lineal"];
  var mas = orden.reduce(function (m, k) { return Math.abs(BASES[k].acf[1]) > Math.abs(BASES[m].acf[1]) ? k : m; }, "lineal");

  var est = B["estacional ingenuo"].MAPE, mlp = B["MLP, promedio de 5 semillas, diferencia"].MAPE,
    lstm = B["LSTM, promedio de 5 semillas, diferencia"].MAPE, sar = B["SARIMA(0,1,0)(0,1,1)12"].MAPE,
    hib = B["Híbrido SARIMA + MLP (16,), promedio de 5 semillas"].MAPE, lin = B["Regresión lineal, diferencia"].MAPE;

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover los controles",
    definicion: null,
    explicacion: "Prediga, y compruébelo en la parte 2.",
    items: [
      { valor: "¿Cuál de los tres modelos deja el residuo con más patrón, es decir, con la autocorrelación más alta en el rezago 1?",
        opciones: ["El SARIMA", "La regresión lineal", "El estacional ingenuo"],
        correcta: { sarima: 0, lineal: 1, estacional: 2 }[mas],
        razon: "Rezago 1: estacional ingenuo " + r2(E.acf[1]) + ", SARIMA " + r2(S.acf[1]) + ", regresión lineal " + r2(L.acf[1]) +
          ". El estacional ingenuo repite el año anterior y su residuo es la diferencia con hace 12 meses entera, con la tendencia y los choques que duran varios meses." }
    ],
    cierre: "El residuo de un modelo simple guarda lo que ese modelo no explicó."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con los correlogramas a la vista",
    definicion: null,
    explicacion: "Cuente rezagos fuera de la banda en cada modelo.",
    items: [
      { valor: "¿Cuántos de los 12 rezagos salen de la banda en el residuo del estacional ingenuo?",
        opciones: [String(E.fuera), String(E.fuera - 3), "12"], correcta: 0,
        razon: E.fuera + " de 12. Con " + E.residuo.length + " meses la banda es ±" + C.coma(E.banda, 3) +
          ", y la autocorrelación baja de " + r2(E.acf[1]) + " en el rezago 1 a " + r2(E.acf[3]) + " en el 3: un mes dice mucho del siguiente." },
      { valor: "¿Y en el residuo del SARIMA y de la regresión lineal?",
        opciones: ["Más de seis en los dos", "Seis en el SARIMA y ninguno en la lineal", S.fuera + " en el SARIMA y " + L.fuera + " en la lineal"], correcta: 2,
        razon: "SARIMA: " + S.fuera + " de 12, con " + r2(S.acf[1]) + " en el rezago 1. Regresión lineal: " + L.fuera + " de 12, con " + r2(L.acf[1]) +
          ". Lo que esos dos modelos dejan se parece al ruido." }
    ],
    cierre: "Un residuo con patrón le da trabajo a la red; uno sin patrón, no."
  };

  var SITUACIONES = {
    id: "situaciones",
    titulo: "4. Tres decisiones",
    definicion: null,
    explicacion: "Cada una sale de una cifra de la página o de la tabla del curso.",
    items: [
      { valor: "El MLP y la LSTM del curso pronostican la diferencia con hace 12 meses y le suman el valor de hace 12 meses. Visto como híbrido, ¿cuál es su modelo base?",
        opciones: ["El SARIMA, que también diferencia con rezago 12", "El estacional ingenuo, que repite el valor de hace 12 meses", "La regresión lineal, que usa los mismos rezagos"],
        correcta: 1,
        razon: "Con un horizonte de 12 meses, y(t − 12) siempre es un dato: es el pronóstico del estacional ingenuo, y la red pronostica su residuo. " +
          "En el backtest esa red mejora a su base: " + P.coma(est) + " del estacional ingenuo contra " + P.coma(mlp) + " del MLP y " + P.coma(lstm) +
          " de la LSTM, con cinco semillas. Sobre el SARIMA, en cambio, el híbrido pasa de " + P.coma(sar) + " a " + P.coma(hib) + "." },
      { valor: "Un grupo trabaja con otra serie. El residuo de su SARIMA saca 5 de 12 rezagos de la banda, con 0,45 en el rezago 1. ¿Qué hace?",
        opciones: ["Quedarse con el SARIMA, porque en la serie del curso el híbrido no ayudó",
          "Usar la red sola, porque ya vio que el SARIMA deja patrón",
          "Probar el híbrido y medirlo contra el SARIMA en el mismo backtest"],
        correcta: 2,
        razon: "Esa autocorrelación se parece más a la del estacional ingenuo (" + r2(E.acf[1]) + ") que a la del SARIMA del curso (" + r2(S.acf[1]) +
          "): hay algo que la red puede aprender. Que ayude o no lo decide el backtest; lo que pasó con otra serie no sirve de prueba, y la red sola pierde lo que el SARIMA ya explica." },
      { valor: "La regresión lineal sobre la diferencia es la mejor fila de la tabla, con " + P.coma(lin) + ". ¿Qué espera de un híbrido con ella como base?",
        opciones: ["Poco: su residuo tiene " + L.fuera + " rezagos fuera de la banda", "Mucho: el mejor modelo deja el mejor residuo",
          "Lo mismo que con el estacional ingenuo, porque ambos usan y(t − 12)"],
        correcta: 0,
        razon: "Con " + r2(L.acf[1]) + " en el rezago 1 y " + L.fuera + " rezagos fuera, el residuo de la lineal se parece al del SARIMA, no al del estacional ingenuo. " +
          "Un modelo que explica bien la serie deja poco para corregir; el ejercicio abierto pide comprobarlo en el backtest." }
    ],
    cierre: "Un híbrido vale cuando el residuo de su base guarda patrón, y eso se ve antes de entrenar."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES, SITUACIONES: SITUACIONES, BASES: BASES };
    return;
  }

  function dibujar(k) {
    var b = BASES[k], n = b.residuo.length;
    document.getElementById("lectura").innerHTML = "Residuo del " + b.nombre + ": " + n + " meses, de " + b.meses[0] + " a " + b.meses[n - 1] +
      ". Autocorrelación en el rezago 1: <b>" + r2(b.acf[1]) + "</b>; rezagos fuera de la banda ±" + C.coma(b.banda, 3) + ": <b>" + b.fuera + " de 12</b>.";
    document.getElementById("residuo").innerHTML = Grafica.lineas({
      lineas: [{ valores: b.residuo, color: Grafica.AZUL }], ancho: 640, alto: 210, titulo: "Residuo del " + b.nombre + ", millones",
      etiquetaY: "millones", cero: true, marcasX: [0, Math.round(n / 3), Math.round(2 * n / 3), n - 1],
      rotuloX: function (j) { return b.meses[j]; }
    });
    document.getElementById("correlograma").innerHTML = Grafica.correlograma(b.acf, n, { titulo: "Autocorrelación del residuo, rezagos 1 a 12", desde: 1 });
  }
  P.selector("base", dibujar);
  dibujar("estacional");

  document.getElementById("cierre-texto").textContent =
    "El estacional ingenuo deja en su residuo " + E.fuera + " rezagos fuera de la banda, y una red sobre ese residuo baja el MAPE de " + P.coma(est) + " a " + P.coma(lstm) +
    ". El SARIMA y la regresión lineal dejan " + S.fuera + " y " + L.fuera + ": con el SARIMA el híbrido no mejoró, " + P.coma(sar) + " contra " + P.coma(hib) +
    ". El correlograma del residuo se mira antes de entrenar la red, y el backtest decide al final.";

  var pendientes = 3;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [SITUACIONES], destino: "situaciones", alTerminar: terminado });
})();
