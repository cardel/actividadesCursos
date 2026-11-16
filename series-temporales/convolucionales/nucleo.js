/* Núcleo y filtros. Calca la segunda interactiva del notebook de la sesión de
   redes convolucionales: el pronóstico de 2025 de cada Conv1d, su validación
   mínima, sus parámetros y el MAPE del backtest con cinco semillas. */
(function () {
  "use strict";

  var P = Pronostico, C = Convolucion, N = DATOS.nucleo;
  function red(k, f) { return N.redes[k + "_" + f]; }
  function mae(k, f) { return P.mae(red(k, f).p); }
  function mape(k, f) { return N.mape[k + "_" + f]; }

  var p3_8 = C.parametrosConv(8, 3), p12_8 = C.parametrosConv(8, 12), p3_16 = C.parametrosConv(16, 3);
  var mejorMae = N.nucleos.reduce(function (m, k) { return mae(k, 8) < mae(m, 8) ? k : m; }, 3);
  var celdas = [];
  N.nucleos.forEach(function (k) { N.filtros.forEach(function (f) { celdas.push([k, f]); }); });
  function menor(fn) {
    var m = [3, 8];
    celdas.forEach(function (c) { if (fn(c[0], c[1]) < fn(m[0], m[1])) { m = c; } });
    return m;
  }
  var mVal = menor(function (k, f) { return red(k, f).val; }), mMape = menor(mape), mMae = menor(mae);
  function nombre(c) { return "núcleo " + c[0] + " con " + c[1] + (c[1] === 1 ? " filtro" : " filtros"); }
  var coincide = mVal[0] === mMape[0] && mVal[1] === mMape[1];

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover los controles",
    definicion: "parámetros = f · (k + 1) + f · (12 − k + 1) + 1",
    explicacion: "f filtros de k pesos y un sesgo, y la capa lineal con un peso por casilla del mapa más su sesgo.",
    items: [
      { valor: "¿Cuántos parámetros tiene la <code>Conv1d</code> con núcleo 12 y 8 filtros?",
        opciones: [String(8 * 12), String(p12_8), String(8 * 13 + 8 * 10 + 1)], correcta: 1,
        razon: "8 · 13 = 104 en los filtros, y con núcleo 12 el mapa tiene una casilla por filtro: 8 + 1 = 9 en la capa lineal, " + p12_8 + " en total. " +
          "96 olvida los sesgos y la capa lineal; 185 usa el mapa de 10 casillas, que es el del núcleo 3." },
      { valor: "Con núcleo 3, ¿cuántos parámetros se agregan al pasar de 8 a 16 filtros?",
        opciones: ["32", "80", String(p3_16 - p3_8)], correcta: 2,
        razon: p3_8 + " a " + p3_16 + ": " + (p3_16 - p3_8) + " más. Ocho filtros nuevos traen 8 · 4 = 32 pesos y 80 casillas nuevas en el mapa, cada una con su peso en la capa lineal. " +
          "32 cuenta solo los filtros; 80 cuenta solo la capa lineal." }
    ],
    cierre: "Más filtros pagan dos veces: en la convolución y en la capa lineal."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con los controles en la mano",
    definicion: null,
    explicacion: "Mueva un control a la vez.",
    items: [
      { valor: "Con 8 filtros, ¿con cuál núcleo es menor el MAE de 2025?",
        opciones: ["6", "3", "12"], correcta: { 6: 0, 3: 1, 12: 2 }[mejorMae],
        razon: "Con 8 filtros, el MAE de 2025 es " + N.nucleos.map(function (k) { return P.miles(mae(k, 8)) + " con núcleo " + k; }).join(", ") + "." },
      { valor: "¿La posición con la validación mínima más baja es también la de menor MAPE en el backtest?",
        opciones: ["Sí, es la misma posición", "No, son posiciones distintas", "No se puede saber sin correr más semillas"],
        correcta: coincide ? 0 : 1,
        razon: "La validación más baja es la de " + nombre(mVal) + " (" + P.coma(red(mVal[0], mVal[1]).val, 4) + "); el menor MAPE del backtest, " +
          P.coma(mape(mMape[0], mMape[1])) + ", es el de " + nombre(mMape) + ". La validación mira 24 meses dentro del entrenamiento con una semilla; el backtest, 13 orígenes con cinco." },
      { valor: "La tabla de la sesión usa núcleo 3 con 8 filtros, aunque " + nombre(mMape) + " da un MAPE más bajo. ¿Por qué no se cambia?",
        opciones: ["Porque elegir con el backtest es dejar que la prueba elija el modelo", "Porque una red con menos parámetros siempre pronostica mejor",
          "Porque la casilla de menor MAPE tarda más en entrenar"],
        correcta: 0,
        razon: "El backtest es la prueba: escoger la casilla después de ver su MAPE es usar el futuro para decidir. Además las vecinas saltan de " +
          P.coma(Math.min.apply(null, celdas.map(function (c) { return mape(c[0], c[1]); }))) + " a " +
          P.coma(Math.max.apply(null, celdas.map(function (c) { return mape(c[0], c[1]); }))) + " sin un orden claro, del tamaño de lo que mueve una semilla." }
    ],
    cierre: "El núcleo y los filtros se eligen con validación; el backtest solo informa."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES };
    return;
  }

  var estado = { k: 3, f: 8 };
  function dibujar() {
    var x = red(estado.k, estado.f), titulo = "Conv1d, núcleo " + estado.k + ", " + estado.f + (estado.f === 1 ? " filtro" : " filtros");
    document.getElementById("lectura").innerHTML = titulo + ": mapa de " + (12 - estado.k + 1) + " casillas por filtro, " +
      C.parametrosConv(estado.f, estado.k) + " parámetros. <b>MAE 2025: " + P.miles(P.mae(x.p)) + "</b> pasajeros; validación mínima " +
      P.coma(x.val, 4) + "; MAPE del backtest con cinco semillas " + P.coma(mape(estado.k, estado.f)) + ".";
    P.figura("figura", x.p, titulo);
  }
  P.selector("nucleo", function (v) { estado.k = Number(v); dibujar(); });
  P.selector("filtros", function (v) { estado.f = Number(v); dibujar(); });
  dibujar();

  document.getElementById("cierre-tabla").innerHTML = P.tabla(
    ["Núcleo"].concat(N.filtros.map(function (f) { return f + (f === 1 ? " filtro" : " filtros"); })),
    N.nucleos.map(function (k) {
      return [String(k)].concat(N.filtros.map(function (f) { return P.miles(mae(k, f)) + " · " + P.coma(mape(k, f)); }));
    }));
  document.getElementById("cierre-texto").textContent =
    "En cada casilla, el MAE de 2025 con la semilla 2026 y el MAPE del backtest con cinco semillas. La menor de 2025 es la de " + nombre(mMae) +
    "; la menor del backtest, la de " + nombre(mMape) + ". Que no coincidan dice cuánto pesa un solo año y una sola semilla al comparar redes pequeñas.";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
