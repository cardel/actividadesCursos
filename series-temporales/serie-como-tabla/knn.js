/* Los vecinos de KNN. Calca la primera interactiva del notebook de la sesión
   7: k de 1 a 15, el nivel o la diferencia con hace 12 meses, el pronóstico
   de 2025 y los meses que KNN eligió como vecinos de enero. */
(function () {
  "use strict";

  var P = Pronostico;
  function r(que, k) { return DATOS.knn[que + "_" + k]; }
  function pandemia(m) { return /^202[01]/.test(m); }
  function dePandemia(que, k) { return r(que, k).vecinos.filter(pandemia).length; }
  var K = [];
  for (var k = 1; k <= 15; k++) { K.push(k); }

  /* Los números que usan las preguntas. */
  var primero = r("dif12", 1).vecinos[0];
  var techoNivel = Math.max.apply(null, K.map(function (k) { return Math.max.apply(null, r("nivel", k).p); }));
  var nuncaPasa = techoNivel <= DATOS.maximo + 1e-9;
  var kMinoria = K.filter(function (k) { return 2 * dePandemia("dif12", k) < k; })[0];
  var kMejor = K.reduce(function (a, b) { return r("dif12", b).mae < r("dif12", a).mae ? b : a; });
  function opciones(bien, malas) {
    var o = [bien].concat(malas.filter(function (m) { return m !== bien; })).slice(0, 3);
    o.sort(function (a, b) { return a - b; });
    return { opciones: o.map(String), correcta: o.indexOf(bien) };
  }
  var oMinoria = opciones(kMinoria, [2, 4, 12]);
  var oMejor = opciones(kMejor, [1, 3, 15]);

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover el control",
    definicion: null,
    explicacion: "Prediga, sin mirar la gráfica, qué hace KNN con k = 1.",
    items: [
      { valor: "Sobre la diferencia con hace 12 meses, ¿de qué año es el mes que más se parece a enero de 2025?",
        opciones: ["2019", "2020 o 2021", "2023 o 2024"], correcta: pandemia(primero) ? 1 : primero < "2023" ? 0 : 2,
        razon: "Es " + primero + ". La fila de enero de 2025 trae los cambios de 2024 frente a 2023, y en el espacio de los rezagos queda más cerca de un mes de la pandemia que de los años tranquilos." },
      { valor: "Sobre el nivel, ¿puede KNN pronosticar más pasajeros que el mes más alto del entrenamiento?",
        opciones: ["Sí, si la tendencia sube", "No, nunca"], correcta: nuncaPasa ? 1 : 0,
        razon: nuncaPasa
          ? "No. El pronóstico es un promedio de valores que ya vio, y un promedio no supera al más grande de ellos."
          : "En estos datos lo pasa: revise la gráfica." }
    ],
    cierre: "KNN responde con la memoria: el promedio de los meses más parecidos."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con el control en la mano",
    definicion: null,
    explicacion: "Responda moviendo k y cambiando de objetivo.",
    items: [
      { valor: "Sobre la diferencia, ¿desde qué k los vecinos de 2020 y 2021 dejan de ser la mayoría?",
        opciones: oMinoria.opciones, correcta: oMinoria.correcta,
        razon: "Desde k = " + kMinoria + ", con " + dePandemia("dif12", kMinoria) + " de " + kMinoria +
          " vecinos de la pandemia. Los primeros vecinos son siempre de 2020 y 2021; al subir k entran meses tranquilos que les quitan peso en el promedio." },
      { valor: "Sobre la diferencia, ¿qué k da el menor MAE de 2025?",
        opciones: oMejor.opciones, correcta: oMejor.correcta,
        razon: "k = " + kMejor + ", con " + P.miles(r("dif12", kMejor).mae) + " pasajeros. Con k = 1 el MAE es " +
          P.miles(r("dif12", 1).mae) + ": un solo vecino de la pandemia arrastra todo el año." },
      { valor: "Sobre el nivel, con cualquier k, ¿dónde queda el pronóstico frente a la línea gris?",
        opciones: ["Siempre por debajo o en ella", "Por encima en algún k"], correcta: nuncaPasa ? 0 : 1,
        razon: "El más alto de todos es " + P.coma(techoNivel) + " millones y la línea está en " + P.coma(DATOS.maximo) +
          ". Los árboles tienen el mismo techo; por eso el curso pronostica la diferencia." }
    ],
    cierre: "Con la diferencia KNN puede seguir la tendencia, pero hay que darle suficientes vecinos."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES };
    return;
  }

  var estado = { k: 5, que: "dif12" };
  var deslizador = document.getElementById("k");

  function dibujar() {
    var x = r(estado.que, estado.k);
    var nombre = estado.que === "nivel" ? "nivel" : "diferencia";
    var sobre = estado.que === "nivel" ? "sobre el nivel" : "sobre la diferencia";
    document.getElementById("k-valor").textContent = estado.k;
    var vecinos = x.vecinos.map(function (m) {
      return pandemia(m) ? '<b style="color:' + Grafica.ROJO + '">' + m + "</b>" : m;
    }).join(", ");
    document.getElementById("lectura").innerHTML = "KNN con k = " + estado.k + " " + sobre +
      ": <b>MAE " + P.miles(x.mae) + "</b>. Vecinos de enero de 2025: " + vecinos +
      " (" + dePandemia(estado.que, estado.k) + " de 2020 o 2021).";
    P.figura("figura", x, "KNN, k = " + estado.k + ", " + nombre, estado.que === "nivel");
  }

  deslizador.addEventListener("input", function () { estado.k = Number(deslizador.value); dibujar(); });
  P.selector("objetivo", function (v) { estado.que = v; dibujar(); });
  dibujar();

  document.getElementById("cierre-tabla").innerHTML = P.tabla(
    ["k", "MAE sobre el nivel", "MAE sobre la diferencia", "vecinos de 2020 o 2021"],
    [1, 3, kMinoria, kMejor, 15].filter(function (v, i, a) { return a.indexOf(v) === i; }).map(function (k) {
      return [k, P.miles(r("nivel", k).mae), P.miles(r("dif12", k).mae), dePandemia("dif12", k) + " de " + k];
    }));

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
