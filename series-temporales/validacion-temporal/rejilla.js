/* Validación frente a backtest. Calca la segunda interactiva del notebook
   de la sesión de validación temporal: profundidad y tasa de XGBoost con
   100 árboles, con el MAE de validación y el del backtest. */
(function () {
  "use strict";

  var C = Cortes, R = DATOS.rejilla, M = DATOS.meses, N = M.length;
  var TASAS = R.tasas, PROF = R.profundidades, BASE = R.estacional;
  var NARANJA = "#d9822b", AZUL = "#1f5fa8";
  function par(d, t) { return R.mae[d + "_" + t]; }
  function tasaTexto(t) { return String(t).replace(".", ","); }
  function nombrePar(d, t) { return "profundidad " + d + " y tasa " + tasaTexto(t); }

  /* Los meses de cada medida. */
  var validacion = C.pliegues(N, 5, 6, 0);
  var v0 = M[validacion[0][2]], v1 = M[validacion[4][3]];
  var sm = SERIE.meses, sv = SERIE.valores;
  var b0 = sm[sm.length - DATOS.n_prueba], b1 = sm[sm.length - 1];
  var origenes = DATOS.n_prueba - DATOS.h + 1;
  /* El tamaño típico de la diferencia con hace 12 meses en cada tramo. */
  function cambioMedio(desde, hasta) {
    var s = 0, c = 0;
    for (var i = sm.indexOf(desde); i <= sm.indexOf(hasta); i++) { s += Math.abs(sv[i] - sv[i - 12]); c++; }
    return s / c;
  }
  var cambioVal = cambioMedio(v0, v1), cambioBt = cambioMedio(b0, b1);

  /* Los números que usan las preguntas. */
  var todas = [];
  PROF.forEach(function (d) { TASAS.forEach(function (t) { todas.push({ d: d, t: t, v: par(d, t).validacion, b: par(d, t).backtest }); }); });
  var mejorVal = todas.reduce(function (a, x) { return x.v < a.v ? x : a; });
  var mejorBt = todas.reduce(function (a, x) { return x.b < a.b ? x : a; });
  var defecto = todas.filter(function (x) { return x.d === 6 && x.t === 0.3; })[0];
  var mismo = mejorVal === mejorBt;
  var ganan = todas.filter(function (x) { return x.b < BASE; }).length;
  var masLarga = todas.filter(function (x) { return x.v > x.b; }).length;
  var maximo = Math.max.apply(null, todas.map(function (x) { return Math.max(x.v, x.b); })) * 1.05;
  function puestoBt(x) { return todas.filter(function (y) { return y.b < x.b; }).length + 1; }

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover los controles",
    definicion: null,
    explicacion: "Primero, dónde mide cada una.",
    items: [
      { valor: "¿Qué meses valida <code>TimeSeriesSplit(n_splits=5, test_size=6)</code> sobre la tabla de búsqueda?",
        opciones: [ "De " + C.nombre(b0) + " a " + C.nombre(b1),"De " + C.nombre(M[0]) + " a " + C.nombre(M[29]), "De " + C.nombre(v0) + " a " + C.nombre(v1)],
        correcta: 2,
        razon: "Los cinco pliegues validan los últimos 30 meses de la tabla, de " + C.nombre(v0) + " a " + C.nombre(v1) + ", un mes adelante cada vez." },
      { valor: "¿Y qué meses pronostica el backtest?",
        opciones: [ "De " + C.nombre(b0) + " a " + C.nombre(b1),"Los mismos meses que valida la búsqueda"], correcta: 0,
        razon: "Los últimos " + DATOS.n_prueba + " meses de la serie, de " + C.nombre(b0) + " a " + C.nombre(b1) + ": doce meses desde cada uno de " +
          origenes + " orígenes. Ninguno de esos meses está en la tabla de búsqueda." }
    ],
    cierre: "La validación y el backtest miden en tramos distintos de la serie."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con los controles en la mano",
    definicion: null,
    explicacion: "Recorra las " + todas.length + " parejas y responda.",
    items: [
      { valor: "¿Qué pareja da el menor MAE de validación?",
        opciones: [nombrePar(mejorBt.d, mejorBt.t), nombrePar(mejorVal.d, mejorVal.t), nombrePar(6, 0.3)], correcta: mismo ? 0 : 1,
        razon: nombrePar(mejorVal.d, mejorVal.t) + ", con " + C.miles(mejorVal.v) + " de validación. Es la que escogería la búsqueda." },
      { valor: "¿Es también la de menor MAE en el backtest?",
        opciones: ["Sí", "No"], correcta: mismo ? 0 : 1,
        razon: mismo ? "Sí." : "No. En el backtest da " + C.miles(mejorVal.b) + " y queda en el puesto " + puestoBt(mejorVal) + " de " + todas.length +
          "; la de menor backtest es " + nombrePar(mejorBt.d, mejorBt.t) + ", con " + C.miles(mejorBt.b) + (mejorVal.b < BASE ? ". Aun así, la escogida le gana al estacional ingenuo, " : ". La escogida ni siquiera le gana al estacional ingenuo, ") + C.miles(BASE) + "." },
      { valor: "¿Cuántas de las " + todas.length + " parejas le ganan al estacional ingenuo en el backtest?",
        opciones: ["Menos de una cuarta parte", "Entre una cuarta parte y la mitad", "Más de la mitad"],
        correcta: ganan < todas.length / 4 ? 0 : ganan <= todas.length / 2 ? 1 : 2,
        razon: ganan + " de " + todas.length + ". La pareja por defecto, profundidad 6 y tasa 0,3, da " + C.miles(defecto.b) + " y no está entre ellas." },
      { valor: "En " + masLarga + " de las " + todas.length + " parejas la barra de validación es más larga. ¿Por qué?",
        opciones: [
          "Valida la recuperación de 2021 y 2022, un mes adelante sobre la diferencia",
          "La validación entrena con más filas que cada origen del backtest",
          "El backtest promedia más meses, y un promedio más largo baja el MAE"],
        correcta: 0,
        razon: "La validación pronostica la diferencia con hace 12 meses entre " + C.nombre(v0) + " y " + C.nombre(v1) +
          ", un tramo que empieza en la recuperación, cuando cada mes se comparaba con el mismo mes de la pandemia. En esos meses la diferencia midió en promedio " +
          C.miles(cambioVal) + " pasajeros; en los meses del backtest, " + C.miles(cambioBt) + ". Con cambios unas " + Math.round(cambioVal / cambioBt) + " veces más grandes, el error de un mes adelante sale más grande que el de doce meses en un tramo tranquilo." }
    ],
    cierre: "La validación sirve para ordenar parejas sin mirar la prueba; la cifra que se reporta es la del backtest."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES, mejorVal: mejorVal, mejorBt: mejorBt, ganan: ganan, masLarga: masLarga, cambioVal: cambioVal, cambioBt: cambioBt };
    return;
  }

  var estado = { d: 6, t: 0.3 };
  var dd = document.getElementById("d");

  function dibujar() {
    document.getElementById("d-valor").textContent = estado.d;
    var x = par(estado.d, estado.t);
    document.getElementById("lectura").innerHTML = "XGBoost, " + nombrePar(estado.d, estado.t) + ": validación <b>" + C.miles(x.validacion) +
      "</b> y backtest <b>" + C.miles(x.backtest) + "</b>, " + (x.backtest < BASE ? "por delante" : "detrás") + " del estacional ingenuo.";
    document.getElementById("figura").innerHTML = Grafica.barras({
      titulo: "XGBoost, max_depth = " + estado.d + ", learning_rate = " + tasaTexto(estado.t) + ", 100 árboles",
      izquierda: 190, maximo: maximo,
      barras: [
        { rotulo: "validación (TimeSeriesSplit)", valor: x.validacion, color: NARANJA },
        { rotulo: "backtest (" + origenes + " orígenes, " + DATOS.h + " meses)", valor: x.backtest, color: AZUL }
      ],
      referencia: { valor: BASE, rotulo: "estacional ingenuo en el backtest, " + C.miles(BASE) },
      formato: C.miles,
      formatoEje: function (v) { return Math.round(v / 1000) + " mil"; }
    });
  }

  dd.addEventListener("input", function () { estado.d = Number(dd.value); dibujar(); });
  C.selector("tasa", function (v) { estado.t = Number(v); dibujar(); });
  dibujar();

  document.getElementById("cierre-tabla").innerHTML = C.tabla(
    ["max_depth"].concat(TASAS.map(function (t) { return "tasa " + tasaTexto(t); })),
    PROF.map(function (d) {
      return [String(d)].concat(TASAS.map(function (t) {
        var x = par(d, t);
        return C.miles(x.validacion) + " / " + C.miles(x.backtest);
      }));
    }));
  document.getElementById("cierre-texto").textContent =
    "Cada celda dice validación / backtest. La validación y el backtest no miden lo mismo: la primera pronostica un mes adelante la diferencia con hace 12 meses en " +
    C.nombre(v0) + " a " + C.nombre(v1) + ", con la recuperación de la pandemia adentro; el segundo pronostica doce meses en pasajeros sobre " +
    C.nombre(b0) + " a " + C.nombre(b1) + ". Por eso las cifras no se comparan entre sí y el orden de la validación no coincide con el del backtest. " +
    "Lo que la validación garantiza es que la elección se hizo sin mirar los meses de prueba, y así el MAE del backtest de la pareja escogida es una cifra honesta.";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
