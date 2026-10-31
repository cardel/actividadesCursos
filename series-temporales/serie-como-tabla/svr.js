/* C, epsilon y el escalador de SVR. Calca la segunda interactiva del
   notebook de la sesión 7 sobre la rejilla de datos.js: diecisiete C, trece
   epsilon y el escalador puesto o quitado. */
(function () {
  "use strict";

  var P = Pronostico, C = DATOS.C, E = DATOS.epsilon;
  function clave(v) { return String(Number(v.toPrecision(12))); }
  function r(c, e, escalar) { return DATOS.svr[clave(c) + "_" + clave(e) + "_" + (escalar ? 1 : 0)]; }
  function nombre(v) { return P.coma(v, v < 0.1 ? 4 : 2).replace(/,?0+$/, ""); }

  /* Los números que usan las preguntas. */
  var cMejor = C.reduce(function (a, b) { return r(b, 0.1, true).mae < r(a, 0.1, true).mae ? b : a; });
  var conEsc = r(1, 0.1, true).mae, sinEsc = r(1, 0.1, false).mae;
  var eAncho = r(1, 0.6, true).mae;
  function cambio(antes, despues) { return despues > antes * 1.2 ? 2 : despues < antes / 1.2 ? 0 : 1; }
  var CAMBIOS = ["Baja", "Casi igual", "Sube"];
  var oC = [0.01, cMejor, 100];

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover los controles",
    definicion: null,
    explicacion: "Sin escalador, la columna mes va de 1 a 12 y los rezagos de la diferencia casi siempre andan entre −1 y 1 millones. Prediga qué pasa con la distancia del kernel.",
    items: [
      { valor: "Sin escalador, ¿qué columna decide cuánto se parecen dos filas?",
        opciones: ["Los rezagos", "El mes", "Todas por igual"], correcta: 1,
        razon: "El mes. Dos filas de meses distintos quedan a una distancia de varias unidades por esa sola columna, mientras los rezagos aportan décimas. El kernel ve casi solo el calendario." },
      { valor: "Con C = 0,01, salirse del tubo casi no cuesta y la diferencia pronosticada queda casi igual todo el año. ¿A qué se parece entonces el pronóstico de 2025?",
        opciones: ["A 2024 corrido hacia arriba", "A una recta", "A 2020"], correcta: 0,
        razon: "A 2024 corrido hacia arriba: cada mes es el mismo mes del año anterior más una diferencia casi constante, así que conserva la forma del año. El MAE con C = 0,01 es " + P.miles(r(0.01, 0.1, true).mae) + "." }
    ],
    cierre: "C, epsilon y el escalador cambian qué errores le importan a la máquina."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con los controles en la mano",
    definicion: null,
    explicacion: "Responda moviendo un control a la vez desde C = 1, epsilon = 0,1 y con escalador.",
    items: [
      { valor: "Con epsilon = 0,1 y escalador, ¿qué C da el menor MAE de 2025?",
        opciones: oC.map(nombre), correcta: 1,
        razon: "C = " + nombre(cMejor) + ", con " + P.miles(r(cMejor, 0.1, true).mae) + " pasajeros. Con C = 100 el MAE sube a " +
          P.miles(r(100, 0.1, true).mae) + ": la máquina aprendió hasta los saltos de la pandemia." },
      { valor: "Con C = 1 y epsilon = 0,1, ¿qué le pasa al MAE al quitar el escalador?",
        opciones: CAMBIOS, correcta: cambio(conEsc, sinEsc),
        razon: "Pasa de " + P.miles(conEsc) + " a " + P.miles(sinEsc) + " pasajeros. Sin escalador el kernel mide casi solo la distancia entre meses del calendario." },
      { valor: "Con C = 1 y escalador, ¿qué le pasa al MAE al llevar epsilon de 0,1 a 0,6?",
        opciones: CAMBIOS, correcta: cambio(conEsc, eAncho),
        razon: "Pasa de " + P.miles(conEsc) + " a " + P.miles(eAncho) + ". Un tubo de 0,6 millones es más ancho que la diferencia de ocho de cada diez meses fuera de la pandemia: esos errores quedan gratis y solo cuentan los de 2020 y 2021, que tiran el pronóstico hacia abajo." }
    ],
    cierre: "Se mueve un control a la vez y se juzga con el MAE, no con la forma de la curva."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES };
    return;
  }

  var estado = { c: 8, e: 2, escalar: true };
  var dc = document.getElementById("c"), de = document.getElementById("e");

  function dibujar() {
    var c = C[estado.c], e = E[estado.e], x = r(c, e, estado.escalar);
    document.getElementById("c-valor").textContent = nombre(c);
    document.getElementById("e-valor").textContent = nombre(e);
    var titulo = "SVR, C = " + nombre(c) + ", epsilon = " + nombre(e) + (estado.escalar ? "" : ", sin escalar");
    document.getElementById("lectura").innerHTML = titulo + ": <b>MAE " + P.miles(x.mae) + "</b> pasajeros en 2025.";
    P.figura("figura", x, titulo, false);
  }

  dc.addEventListener("input", function () { estado.c = Number(dc.value); dibujar(); });
  de.addEventListener("input", function () { estado.e = Number(de.value); dibujar(); });
  P.selector("escalar", function (v) { estado.escalar = v === "1"; dibujar(); });
  dibujar();

  document.getElementById("cierre-tabla").innerHTML = P.tabla(
    ["C", "epsilon", "escalador", "MAE 2025"],
    [[0.01, 0.1, true], [1, 0.1, true], [cMejor, 0.1, true], [100, 0.1, true], [1, 0.1, false], [1, 0.6, true]].map(function (f) {
      return [nombre(f[0]), nombre(f[1]), f[2] ? "sí" : "no", P.miles(r(f[0], f[1], f[2]).mae)];
    }));

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
