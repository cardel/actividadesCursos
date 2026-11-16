/* El filtro paso a paso: la cuenta de cada posición sobre la ventana de enero o
   de marzo de 2025, el mapa que deja, el paso con que salta y los pesos que
   aprende un filtro entrenado. Todo se calcula aquí con Convolucion. */
(function () {
  "use strict";

  var C = Convolucion, P = Pronostico, B = DATOS.backtest, A = DATOS.aprende;
  var PESOS = { media: [1 / 3, 1 / 3, 1 / 3], cambio: [-1, 0, 1], ultimo: [0, 0, 1] };
  var x1 = C.ventana("2025-01"), x3 = C.ventana("2025-03");
  function c3(x) { return C.coma(x, 3); }

  var media1 = C.deslizar(x1, PESOS.media), cambio1 = C.deslizar(x1, PESOS.cambio), cambio3 = C.deslizar(x3, PESOS.cambio);
  function minimo(mapa) {
    var k = 0;
    mapa.forEach(function (p, i) { if (p.valor < mapa[k].valor) { k = i; } });
    return k;
  }
  var min1 = minimo(cambio1), min3 = minimo(cambio3);
  var suma1 = x1[0] + x1[1] + x1[2];

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover los controles",
    definicion: "mapa(p) = w<sub>1</sub> x<sub>p</sub> + w<sub>2</sub> x<sub>p+1</sub> + w<sub>3</sub> x<sub>p+2</sub>",
    explicacion: "La cuenta del filtro de tres pesos en la posición p. La ventana de enero de 2025 empieza con " +
      c3(x1[0]) + ", " + c3(x1[1]) + " y " + c3(x1[2]) + ".",
    items: [
      { valor: "La ventana tiene 12 pasos y el filtro, 3. Con paso 1, ¿cuántas casillas tiene el mapa?",
        opciones: ["12", "4", "10"], correcta: 2,
        razon: "10. El filtro tiene que caber entero: la última posición empieza en el paso 10 y cubre los pasos 10, 11 y 12. " +
          "12 sería contar una casilla por paso, como si el filtro pudiera salirse de la ventana; 4 es partir la ventana en trozos de 3 sin que se toquen." },
      { valor: "Con los pesos de ⅓, ¿cuánto vale el mapa en la posición 1 de la ventana de enero de 2025?",
        opciones: [c3(suma1), c3(media1[0].valor), c3(media1[9].valor)], correcta: 1,
        razon: "(" + c3(x1[0]) + " + " + c3(x1[1]) + " + " + c3(x1[2]) + ") / 3 = " + c3(media1[0].valor) + ". " + c3(suma1) +
          " es la suma sin multiplicar por los pesos de ⅓, y " + c3(media1[9].valor) + " es la posición 10, la de los tres últimos pasos." }
    ],
    cierre: "Un filtro son unos pocos pesos; la misma cuenta se repite en cada posición."
  };

  var final = A.pesos[A.pesos.length - 1];
  var DESPUES = {
    id: "despues",
    titulo: "4. Con los controles en la mano",
    definicion: null,
    explicacion: "Use la parte 2 y la parte 3 para responder.",
    items: [
      { valor: "Con el filtro de cambio (−1, 0, 1) en la ventana de enero de 2025, ¿en qué posición queda el valor más negativo?",
        opciones: [String(min1 + 1), String(min1 + 2), String(min1)], correcta: 0,
        razon: "En la " + (min1 + 1) + ", con " + c3(cambio1[min1].valor) + ": cubre los pasos " + (min1 + 1) + " a " + (min1 + 3) +
          " y resta " + c3(x1[min1]) + " a " + c3(x1[min1 + 2]) + ": la caída que empieza en octubre de 2024, medida en dos meses." },
      { valor: "Cambie a la ventana de marzo de 2025 con el mismo filtro. ¿Qué pasa con ese valor?",
        opciones: ["Aparece otro valor en la misma posición", "El mismo valor, dos posiciones antes", "Cambia de valor, porque marzo es otro mes"],
        correcta: 1,
        razon: "En marzo el mínimo es " + c3(cambio3[min3].valor) + " en la posición " + (min3 + 1) + ", frente a " + c3(cambio1[min1].valor) +
          " en la " + (min1 + 1) + " de enero. La ventana se corrió dos meses y los mismos tres pesos encuentran la caída donde quede. Un MLP la leería con otras columnas y otros pesos." },
      { valor: "Ponga el paso en 2. ¿Cuántas casillas tiene el mapa?",
        opciones: ["6", "4", "5"], correcta: 2,
        razon: "5: el filtro empieza en los pasos 1, 3, 5, 7 y 9. La cuenta es (12 − 3) / 2 + 1 sin decimales. 6 sería dividir 12 entre 2, como si el filtro tuviera un solo peso." },
      { valor: "Con los pesos (0, 0, 1), ¿qué es el mapa?",
        opciones: ["Los pasos 3 a 12 de la ventana, tal cual", "Los pasos 1 a 10 de la ventana, tal cual", "El paso 12 repetido en las diez casillas"],
        correcta: 0,
        razon: "Cada posición p deja solo x<sub>p+2</sub>: la posición 1 copia el paso 3 y la 10 copia el paso 12. Un filtro también puede elegir un mes, no solo promediar." },
      { valor: "En la parte 3, ¿a qué pesos llega el filtro en la época " + (A.cada * (A.pesos.length - 1)) + "?",
        opciones: ["Cerca de (0, 0, 1), el último mes", "Cerca de (−1, 0, 1), el cambio", "Cerca de (⅓, ⅓, ⅓), la media"],
        correcta: 2,
        razon: "Llega a (" + final.map(function (w) { return c3(w); }).join("; ") + "). Nadie le dio los pesos: los encontró el gradiente del error, igual que en un nn.Linear. Arrancó en (" +
          A.pesos[0].map(function (w) { return c3(w); }).join("; ") + ")." }
    ],
    cierre: "Los mismos pesos leen todas las posiciones, y el entrenamiento elige esos pesos."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES };
    return;
  }

  var estado = { pesos: "media", mes: "2025-01", paso: 1, p: 1 };
  var control = document.getElementById("posicion");
  function dibujar() {
    var x = C.ventana(estado.mes), w = PESOS[estado.pesos], mapa = C.deslizar(x, w, estado.paso);
    control.max = mapa.length;
    if (estado.p > mapa.length) { estado.p = mapa.length; control.value = estado.p; }
    var q = mapa[estado.p - 1], meses = C.mesesDe(estado.mes);
    document.getElementById("posicion-valor").textContent = estado.p + " de " + mapa.length;
    document.getElementById("lectura").innerHTML = "Posición " + estado.p + ", pasos " + (q.inicio + 1) + " a " + (q.inicio + 3) +
      " (" + meses[q.inicio] + " a " + meses[q.inicio + 2] + "): " +
      w.map(function (wi, j) { return C.coma(wi, 2) + " × " + c3(x[q.inicio + j]); }).join(" + ") + " = <b>" + c3(q.valor) + "</b>.";
    document.getElementById("dibujo").innerHTML = C.dibujo(x, w, mapa, estado.p - 1, estado.paso);
    document.getElementById("tabla").innerHTML = P.tabla(["Posición", "Pasos", "Meses", "Mapa"], mapa.map(function (m, i) {
      var visto = i < estado.p;
      return [i + 1, (m.inicio + 1) + " a " + (m.inicio + 3), meses[m.inicio] + " a " + meses[m.inicio + 2], visto ? c3(m.valor) : ""];
    }));
  }
  control.addEventListener("input", function () { estado.p = Number(control.value); dibujar(); });
  P.selector("pesos", function (v) { estado.pesos = v; dibujar(); });
  P.selector("mes", function (v) { estado.mes = v; dibujar(); });
  P.selector("paso", function (v) { estado.paso = Number(v); dibujar(); });
  dibujar();

  var controlEpoca = document.getElementById("epoca");
  controlEpoca.max = A.pesos.length - 1;
  function dibujarAprende() {
    var k = Number(controlEpoca.value), w = A.pesos[k], mapa = C.deslizar(x1, w);
    var error = 0;
    mapa.forEach(function (m, i) { error += Math.pow(m.valor - media1[i].valor, 2); });
    document.getElementById("epoca-valor").textContent = k * A.cada;
    document.getElementById("lectura-aprende").innerHTML = "Época " + k * A.cada + ": pesos (" + w.map(function (wi) { return c3(wi); }).join("; ") +
      "). Error cuadrático medio contra la media de tres meses en esta ventana: <b>" + C.coma(error / mapa.length, 5) + "</b>.";
    document.getElementById("dibujo-aprende").innerHTML = C.dibujo(x1, w, mapa, mapa.length - 1, 1);
  }
  controlEpoca.addEventListener("input", dibujarAprende);
  dibujarAprende();

  var conv = B["Conv1D 8 filtros, núcleo 3, promedio de 5 semillas"], lstm = B["LSTM, promedio de 5 semillas, diferencia"];
  var lineal = B["Regresión lineal, diferencia"];
  document.getElementById("cierre-tabla").innerHTML = P.tabla(["", "Qué", "Lo que lo muestra"], [
    ["Ventaja", "La misma cuenta en todas las posiciones", "El filtro de cambio da " + c3(cambio1[min1].valor) + " en la posición " + (min1 + 1) +
      " de enero y " + c3(cambio3[min3].valor) + " en la " + (min3 + 1) + " de marzo."],
    ["Ventaja", "Pocos pesos", "Ocho filtros de 3 y la capa lineal suman " + C.parametrosConv(8, 3) + " números; el MLP de la sesión 11 tiene " +
      C.MLP + " y la LSTM, " + P.miles(C.LSTM) + "."],
    ["Limitación", "Cada casilla ve pocos meses", "Con núcleo 3, una casilla del mapa ve 3 de los 12 pasos; lo demás lo junta la capa lineal."],
    ["Limitación", "En esta serie no gana", "MAPE del backtest con cinco semillas: Conv1D " + P.coma(conv.MAPE) + ", LSTM " + P.coma(lstm.MAPE) +
      ", regresión lineal " + P.coma(lineal.MAPE) + "."]
  ]);
  document.getElementById("cierre-texto").textContent =
    "Un filtro sirve cuando el mismo patrón puede caer en cualquier parte de la ventana. En la diferencia con hace 12 meses la estacionalidad ya se quitó, " +
    "y lo que pesa son los meses recientes: por eso la ventaja de leer igual todas las posiciones no se nota en la tabla.";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
