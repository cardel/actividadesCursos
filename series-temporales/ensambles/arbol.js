/* Un árbol o un bosque. Calca la primera interactiva del notebook de la
   sesión de ensambles: un árbol con max_depth y min_samples_leaf, o un
   Random Forest con esos frenos y n_estimators, sobre la diferencia con
   hace 12 meses. */
(function () {
  "use strict";

  var P = Pronostico, A = DATOS.arboles, B = DATOS.backtest;
  var PROF = A.profundidad.filter(function (p) { return p > 0; }), BOSQUES = A.arboles;
  function arbol(p, h) { return A.arbol[p + "_" + h].p; }
  function bosque(p, h, b) { return A.bosque[p + "_" + h + "_" + b].p; }
  function nombreProf(p) { return p === 0 ? "sin límite" : "profundidad " + p; }

  /* Los números que usan las preguntas. */
  var repite = function (p) { return P.pandemia(arbol(p, 1)); };
  var hasta = 0;
  while (hasta < PROF.length && !repite(PROF[hasta])) { hasta++; }
  var corte = PROF[hasta - 1];
  var hojaBasta = A.hoja.filter(function (h) { return !P.pandemia(arbol(0, h)); })[0];
  var b10 = P.mae(bosque(0, 1, 10)), b300 = P.mae(bosque(0, 1, 300));
  var b200 = P.mae(bosque(0, 1, 200));
  var baja = 100 * (b10 - b300) / b10;
  var bosqueRepite = BOSQUES.filter(function (b) { return P.pandemia(bosque(0, 1, b)); });

  function opcionesProf() {
    var o = [2, 5, corte, 10].filter(function (x, i, a) { return a.indexOf(x) === i; });
    return o.sort(function (a, b) { return a - b; });
  }
  var OPC = opcionesProf();

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover los controles",
    definicion: null,
    explicacion: "La tabla tiene " + DATOS.filas + " filas de entrenamiento. Prediga sin mirar la gráfica.",
    items: [
      { valor: "Un árbol sin límite y con <code>min_samples_leaf=1</code>, ¿cuántas filas deja en cada hoja?",
        opciones: ["Una", "Unas diez", "La mitad de la tabla"], correcta: 0,
        razon: "Una: pregunta hasta que cada hoja guarda un solo mes, así que pronostica copiando el mes de la tabla que más se parece, la pandemia incluida. En el backtest de la sesión ese árbol da " +
          P.miles(B.arbol_libre) + " de MAE, contra " + P.miles(B.estacional) + " del estacional ingenuo." },
      { valor: "Si se suman árboles al bosque, ¿el MAE de 2025 sube por sobreajuste?",
        opciones: ["Sí, sube como al subir la profundidad", "No, el MAE baja y se estabiliza"], correcta: 1,
        razon: "Se estabiliza: cada árbol nuevo entra al promedio con el mismo peso que los demás, y un promedio de más árboles cambia menos, no copia más." }
    ],
    cierre: "Los frenos deciden cuánto copia cada árbol, y el número de árboles, cuánto se promedia."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con los controles en la mano",
    definicion: null,
    explicacion: "Un pronóstico repite la pandemia cuando algún mes de 2025 queda por debajo de " +
      P.coma(P.umbral, 1) + " millones, el nivel de la serie entre " + P.tramo + ". Responda moviendo un control a la vez.",
    items: [
      { valor: "Con <code>min_samples_leaf=1</code>, ¿desde qué <code>max_depth</code> hacia abajo deja el árbol de repetir la pandemia en 2025?",
        opciones: OPC.map(String), correcta: OPC.indexOf(corte),
        razon: "Desde " + corte + ": con profundidad " + PROF[hasta] + " el mes más bajo del pronóstico es " +
          P.coma(P.minimo(arbol(PROF[hasta], 1))) + " millones y con " + corte + ", " + P.coma(P.minimo(arbol(corte, 1))) +
          ". Con profundidad " + PROF[hasta] + " el MAE es " + P.miles(P.mae(arbol(PROF[hasta], 1))) + ", casi el del árbol sin límite, " +
          P.miles(P.mae(arbol(0, 1))) + ": con tantas preguntas ya copia meses sueltos." },
      { valor: "Sin límite de profundidad, ¿qué <code>min_samples_leaf</code> basta para que deje de repetirla?",
        opciones: A.hoja.slice(1).map(String).concat(["Ninguno"]),
        correcta: hojaBasta === undefined ? A.hoja.length - 1 : A.hoja.indexOf(hojaBasta) - 1,
        razon: "Con " + hojaBasta + " filas por hoja el mes más bajo es " + P.coma(P.minimo(arbol(0, hojaBasta))) +
          " millones y el MAE " + P.miles(P.mae(arbol(0, hojaBasta))) + ": una hoja de dos meses ya promedia, y un mes de la pandemia no queda solo en su hoja." },
      { valor: "En el bosque sin límite y con hoja 1, ¿cuánto baja el MAE de 10 a 300 árboles?",
        opciones: ["Menos del 10 %", "Entre el 10 % y el 40 %", "Más del 40 %"], correcta: baja < 10 ? 0 : baja <= 40 ? 1 : 2,
        razon: "De " + P.miles(b10) + " a " + P.miles(b300) + " pasajeros, un " + Math.round(baja) +
          " % menos. De 200 a 300 árboles pasa de " + P.miles(b200) + " a " + P.miles(b300) + ": ahí ya casi no cambia." },
      { valor: "Ese bosque está hecho de árboles sin límite. ¿Repite la pandemia con algún número de árboles?",
        opciones: ["Sí", "No"], correcta: bosqueRepite.length ? 0 : 1,
        razon: bosqueRepite.length
          ? "Sí, con " + bosqueRepite.join(", ") + " árboles."
          : "No: cada árbol vio una muestra distinta de filas, y el que manda enero a una hoja de la pandemia queda en minoría dentro del promedio. Con 10 árboles el mes más bajo ya es " +
            P.coma(P.minimo(bosque(0, 1, 10))) + " millones." }
    ],
    cierre: "Con un freno, el árbol deja de copiar meses sueltos, y el bosque llega a lo mismo repartiendo el error entre muchos árboles."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES, corte: corte, hojaBasta: hojaBasta, baja: baja };
    return;
  }

  var estado = { p: 0, h: 1, bosque: false, b: 100 };
  var dp = document.getElementById("p");

  function dibujar() {
    document.getElementById("p-valor").textContent = estado.p === 0 ? "sin límite" : estado.p;
    var p = estado.bosque ? bosque(estado.p, estado.h, estado.b) : arbol(estado.p, estado.h);
    var titulo = (estado.bosque ? "Random Forest, " + estado.b + " árboles, " : "Un árbol, ") +
      nombreProf(estado.p) + ", hoja " + estado.h;
    document.getElementById("lectura").innerHTML = titulo + ": <b>MAE " + P.miles(P.mae(p)) +
      "</b> pasajeros en 2025; el mes más bajo del pronóstico, " + P.coma(P.minimo(p)) + " millones" +
      (P.pandemia(p) ? ", por debajo del nivel de la pandemia." : ".");
    P.figura("figura", p, titulo);
  }

  dp.addEventListener("input", function () { estado.p = Number(dp.value); dibujar(); });
  P.selector("hoja", function (v) { estado.h = Number(v); dibujar(); });
  P.selector("modelo", function (v) { estado.bosque = v === "bosque"; dibujar(); });
  P.selector("arboles", function (v) { estado.b = Number(v); dibujar(); });
  dibujar();

  document.getElementById("cierre-tabla").innerHTML = P.tabla(
    ["max_depth", "árbol, hoja 1", "¿repite la pandemia?", "bosque de 100, hoja 1"],
    [0].concat(PROF).map(function (p) {
      return [p === 0 ? "sin límite" : String(p), P.miles(P.mae(arbol(p, 1))),
        P.pandemia(arbol(p, 1)) ? "sí" : "no", P.miles(P.mae(bosque(p, 1, 100)))];
    }));
  document.getElementById("cierre-texto").textContent =
    "Un árbol sin freno termina con hojas de un solo mes y pronostica copiando el mes más parecido; si ese mes cae en la pandemia, 2025 se desploma. Basta un freno, una profundidad menor o dos filas por hoja, para que cada hoja promedie. " +
    "El bosque llega a lo mismo por otro camino: promedia árboles que vieron muestras distintas, y los errores de cada uno van en direcciones distintas. Por eso más árboles no lo sobreajustan: el MAE baja y se queda quieto. " +
    "En el backtest de la sesión, el Random Forest da " + P.miles(B.bosque) + " de MAE y el árbol sin límite, " + P.miles(B.arbol_libre) + ".";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
