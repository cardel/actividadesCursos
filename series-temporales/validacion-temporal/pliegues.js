/* Los pliegues de TimeSeriesSplit. Calca la primera interactiva del
   notebook de la sesión de validación temporal: n_splits, test_size y gap
   sobre los meses de la tabla de búsqueda. */
(function () {
  "use strict";

  var C = Cortes, M = DATOS.meses, N = M.length;
  var AZUL = "#1f5fa8", NARANJA = "#d9822b", GRIS = "#dcdfe4";
  function pl(n, t, g) { return C.pliegues(N, n, t, g); }
  function filas(n, t, g) { var p = pl(n, t, g); return p ? p[0][1] + 1 : null; }

  /* Los números que usan las preguntas. */
  var porDefecto = filas(5, 6, 0);
  var siete = [2, 3, 4, 5, 6, 7, 8].filter(function (n) { return filas(n, 6, 0) !== null && filas(n, 6, 0) < 24; })[0];
  var gap24 = [0, 1, 2, 3, 4, 5, 6].filter(function (g) { return filas(3, 12, g) === 24; })[0];
  var p2 = pl(3, 12, 2), p0 = pl(3, 12, 0);
  var sinUsar = [M[p2[0][1] + 1], M[p2[0][2] - 1]];
  var igual = p2.every(function (f, i) { return f[2] === p0[i][2] && f[3] === p0[i][3]; });
  var totalSerie = SERIE.valores.length;
  function mesCorto(m) { return C.nombre(m).replace(" de ", " "); }
  function duo(a, b) {
    var x = C.nombre(a), y = C.nombre(b);
    return x.slice(-4) === y.slice(-4) ? x.slice(0, -8) + " y " + y : x + " y " + y;
  }

  var INTRO = "La búsqueda de hiperparámetros solo ve la tabla de búsqueda: " + N +
    " filas, de " + C.nombre(M[0]) + " a " + C.nombre(M[N - 1]) + ", con la diferencia con hace 12 meses y sus rezagos. " +
    "<code>TimeSeriesSplit</code> la parte en pliegues: cada uno entrena con los meses anteriores y valida los <code>test_size</code> meses siguientes, " +
    "y <code>gap</code> salta meses entre el último de entrenamiento y el primero de validación. Los pliegues validan, uno tras otro, el final de la tabla.";

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover los controles",
    definicion: null,
    explicacion: "Prediga sin mirar la figura.",
    items: [
      { valor: "La serie llega a " + C.nombre(SERIE.meses[totalSerie - 1]) + ", pero la tabla de búsqueda termina en " + C.nombre(M[N - 1]) + ". ¿Por qué?",
        opciones: [ "La fuente de Aerocivil todavía no publica esos meses","Los meses de prueba del backtest quedan fuera de la búsqueda", "Los últimos meses de la serie no tienen sus doce rezagos"],
        correcta: 1,
        razon: "Los últimos " + DATOS.n_prueba + " meses son los del backtest. Si la búsqueda los viera, el backtest dejaría de medir meses que el modelo no conoce." },
      { valor: "Con <code>n_splits=5</code>, <code>test_size=6</code> y <code>gap=0</code>, ¿con cuántas filas entrena el primer pliegue?",
        opciones: [ String(N - 6), String(Math.floor(N / 6)),String(porDefecto)], correcta: 2,
        razon: N + " − 5 × 6 = " + porDefecto + ": los cinco pliegues validan los últimos 30 meses y el primero entrena con todo lo anterior." }
    ],
    cierre: "Los pliegues se reparten el final de la tabla, y el primero se queda con lo que sobra."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con los controles en la mano",
    definicion: null,
    explicacion: "Responda moviendo un control a la vez.",
    items: [
      { valor: "¿Qué cuenta da las filas con que entrena el primer pliegue?",
        opciones: [N + " − n_splits × test_size − gap", N + " ÷ (n_splits + 1)", N + " − test_size − gap"], correcta: 0,
        razon: "Los pliegues validan los últimos n_splits × test_size meses y el primero entrena con lo anterior, menos los gap meses que se saltan. Con 4, 6 y 1: " +
          N + " − 24 − 1 = " + filas(4, 6, 1) + "." },
      { valor: "Con <code>test_size=6</code> y <code>gap=0</code>, ¿desde cuántos pliegues entrena el primero con menos de 24 filas?",
        opciones: ["5", "6", "7", "8"], correcta: ["5", "6", "7", "8"].indexOf(String(siete)),
        razon: "Desde " + siete + ": " + N + " − " + siete + " × 6 = " + filas(siete, 6, 0) + ". Con " + (siete - 1) + " pliegues son " +
          filas(siete - 1, 6, 0) + ". Dos años de filas es lo mínimo para ver dos veces cada mes del año." },
      { valor: "Con <code>n_splits=3</code> y <code>test_size=12</code>, ¿qué <code>gap</code> deja el primer pliegue con 24 filas justas?",
        opciones: ["0", "1", "2", "3"], correcta: gap24,
        razon: "gap = " + gap24 + ": " + N + " − 36 − " + gap24 + " = 24. Con un mes más de gap ya baja a " + filas(3, 12, gap24 + 1) + "." },
      { valor: "Con <code>n_splits=3</code>, <code>test_size=12</code> y <code>gap=2</code>, ¿qué meses quedan sin usar en el primer pliegue antes de su validación?",
        opciones: [duo(M[0], M[1]), duo(sinUsar[0], sinUsar[1]), duo(M[N - 2], M[N - 1])], correcta: 1,
        razon: "Entrena hasta " + C.nombre(M[p2[0][1]]) + " y valida desde " + C.nombre(M[p2[0][2]]) + ": " + duo(sinUsar[0], sinUsar[1]) +
          " quedan en medio. Los meses después de su validación también quedan en gris: son el futuro de ese pliegue." },
      { valor: "Al pasar de <code>gap=0</code> a <code>gap=2</code>, ¿qué le pasa a la validación?",
        opciones: ["Queda igual; el entrenamiento termina dos meses antes", "Empieza dos meses después y termina dos meses después", "Pierde un pliegue y valida dos meses menos"], correcta: igual ? 0 : 1,
        razon: igual
          ? "Queda igual: con 3 y 12 cada pliegue valida los mismos meses, y el entrenamiento pierde los dos meses anteriores a la validación. El primer pliegue pasa de " +
            filas(3, 12, 0) + " a " + filas(3, 12, 2) + " filas."
          : "La validación se mueve." }
    ],
    cierre: "El tamaño de la validación y el gap se pagan con filas de entrenamiento del primer pliegue."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES, siete: siete, gap24: gap24, sinUsar: sinUsar, igual: igual };
    return;
  }

  document.getElementById("intro").innerHTML = INTRO;
  var estado = { n: 5, t: 6, g: 0 };
  var enero = [];
  M.forEach(function (m, j) { if (m.slice(5) === "01") { enero.push(j); } });

  function dibujar() {
    ["n", "t", "g"].forEach(function (c) { document.getElementById(c + "-valor").textContent = estado[c]; });
    var p = pl(estado.n, estado.t, estado.g);
    var lectura = document.getElementById("lectura"), figura = document.getElementById("figura");
    if (!p) {
      lectura.innerHTML = "<b>No cabe.</b> La validación pide " + estado.n + " × " + estado.t + " = " + estado.n * estado.t +
        " meses y el gap " + estado.g + " más, y la tabla tiene " + N + ": no queda ninguna fila para entrenar el primer pliegue. scikit-learn responde con un <code>ValueError</code>.";
      figura.innerHTML = "";
      return;
    }
    var primero = p[0][1] + 1;
    lectura.innerHTML = "n_splits = " + estado.n + ", test_size = " + estado.t + ", gap = " + estado.g +
      ": el primer pliegue entrena con <b>" + primero + " filas</b>" + (primero < 24 ? ", menos de dos años" : "") +
      " y valida de " + mesCorto(M[p[0][2]]) + " a " + mesCorto(M[p[0][3]]) + ".";
    figura.innerHTML = Grafica.franjas({
      titulo: "Pliegues de TimeSeriesSplit sobre las " + N + " filas de la tabla de búsqueda",
      filas: p.map(function (f, i) {
        var colores = [];
        for (var j = 0; j < N; j++) {
          colores.push(j <= f[1] ? AZUL : j >= f[2] && j <= f[3] ? NARANJA : GRIS);
        }
        return { rotulo: "pliegue " + (i + 1), colores: colores };
      }),
      titulos: function (i, j) { return M[j]; },
      marcasX: enero, rotuloX: function (j) { return M[j].slice(0, 4); }
    });
  }

  ["n", "t", "g"].forEach(function (c) {
    var control = document.getElementById(c);
    control.addEventListener("input", function () { estado[c] = Number(control.value); dibujar(); });
  });
  dibujar();

  document.getElementById("cierre-texto").textContent =
    "Cada pliegue hace lo mismo que un origen del backtest: entrena con lo anterior y mide lo que sigue, sin mirar el futuro. " +
    "Por eso el entrenamiento crece de un pliegue al siguiente y la validación nunca va antes que él. " +
    "Más pliegues o pliegues más largos dan una validación más estable, pero el primero entrena con menos filas; el gap imita el tiempo que pasa entre tener los datos y usar el pronóstico, y también se paga con filas. " +
    "Con " + N + " filas, cinco pliegues de seis meses dejan " + porDefecto + " para el primero.";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
