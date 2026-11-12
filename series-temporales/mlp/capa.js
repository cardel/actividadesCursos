/* Capa oculta y tasa de aprendizaje. Calca la primera interactiva del
   notebook del perceptrón multicapa: las curvas de pérdida de 300 épocas
   para cada tamaño de capa y cada tasa. */
(function () {
  "use strict";

  var R = Redes, C = DATOS.capa;
  var OCULTAS = C.ocultas, TASAS = C.tasas;
  function curva(o, t) { return C.curvas[o + "_" + String(t)]; }
  function minimo(o, t) { return R.minimo(curva(o, t).validacion); }

  /* Los números que usan las preguntas. */
  var epocas32 = TASAS.map(function (t) { return minimo(32, t).epoca; });
  var antes32 = TASAS[epocas32.indexOf(Math.min.apply(null, epocas32))];
  var val001 = OCULTAS.map(function (o) { return minimo(o, 0.001).valor; });
  var mejor001 = OCULTAS[val001.indexOf(Math.min.apply(null, val001))];
  var lineal = TASAS.map(function (t) { return minimo(0, t).epoca; });
  var linealAlFinal = lineal.every(function (e) { return e >= 290; });
  var c64 = curva(64, 0.03), fin = c64.entrenamiento.length - 1;
  var copia = c64.entrenamiento[fin] < 0.01 && c64.validacion[fin] > 10 * c64.entrenamiento[fin];
  var filas = 38;

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover los controles",
    definicion: null,
    explicacion: "Piense en lo que puede hacer cada red con las " + filas + " filas de entrenamiento.",
    items: [
      { valor: "La red de 16 neuronas tiene 257 parámetros y entrena con " + filas + " filas. Con tasa 0,001 y sin parada temprana, ¿qué hace su pérdida de entrenamiento en 300 épocas?",
        opciones: ["Baja casi sin pausa en las 300 épocas", "Sube después de unas cuantas épocas", "Se queda en el piso de la regresión lineal"],
        correcta: 0,
        razon: "Adam mueve los pesos contra el gradiente de esa misma pérdida, y con 257 parámetros para " + filas + " filas siempre queda algo por ajustar: baja de " +
          R.coma(curva(16, 0.001).entrenamiento[0], 3) + " a " + R.coma(curva(16, 0.001).entrenamiento[299], 3) + " sin subir una sola época." },
      { valor: "Con <code>ocultas = 0</code> la red es la regresión lineal. Con más épocas, ¿puede su pérdida de entrenamiento quedar por debajo de la de <code>LinearRegression</code> sobre las mismas filas?",
        opciones: ["Sí, si se entrena el doble de épocas", "No: LinearRegression ya da el mínimo", "Sí, si la tasa de aprendizaje es mayor"],
        correcta: 1,
        razon: "LinearRegression da los coeficientes de mínimos cuadrados: ninguna recta tiene menor error al cuadrado sobre esas filas. El descenso de gradiente solo puede acercarse a ese piso." }
    ],
    cierre: "Una red con más parámetros que filas puede seguir bajando su error de entrenamiento; una recta no."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con los controles en la mano",
    definicion: null,
    explicacion: "Responda moviendo un control a la vez.",
    items: [
      { valor: "Con 32 neuronas, ¿con qué tasa llega antes la validación a su mínimo?",
        opciones: TASAS.map(R.tasa), correcta: TASAS.indexOf(antes32),
        razon: "Con " + R.tasa(antes32) + ". Las épocas del mínimo son " + epocas32.join(", ") + " para las tasas " + TASAS.map(R.tasa).join(", ") +
          ": con pasos más grandes la red llega antes a copiar el entrenamiento, y desde ahí la validación sube." },
      { valor: "Con tasa 0,001, ¿qué tamaño de capa logra la menor validación?",
        opciones: OCULTAS.map(String), correcta: OCULTAS.indexOf(mejor001),
        razon: "Con " + mejor001 + ". Los mínimos son " + val001.map(function (x) { return R.coma(x, 3); }).join(", ") + " para " + OCULTAS.join(", ") +
          " neuronas. Con 16 el mínimo llega en la primera época: la red casi sin entrenar valida mejor que entrenada." },
      { valor: "Con <code>ocultas = 0</code>, ¿en qué época queda la validación mínima, con cualquiera de las cuatro tasas?",
        opciones: ["Antes de la época 20, y luego sube", "En la última de las 300 épocas", "Cerca de la época 60, y luego sube"],
        correcta: linealAlFinal ? 1 : 0,
        razon: "Las épocas del mínimo son " + lineal.join(", ") + ". Una recta no puede copiar las " + filas + " filas: su validación baja mientras la recta se acerca a la de mínimos cuadrados." },
      { valor: "Con 64 neuronas y tasa 0,03, la pérdida de entrenamiento termina en " + R.coma(c64.entrenamiento[fin], 5) +
          " y la de validación en " + R.coma(c64.validacion[fin], 3) + ". ¿Qué dice eso?",
        opciones: ["La red aprendió la serie mejor que la lineal", "La tasa es tan alta que la red no aprende", "La red copió sus filas y no generaliza"],
        correcta: copia ? 2 : 0,
        razon: "El error de entrenamiento es casi cero: con más de mil parámetros la red reproduce cada fila. En los meses que no vio falla por mucho más que la lineal, que es el sobreajuste." }
    ],
    cierre: "La validación es lo único que mide la red en meses que no vio, y por eso decide cuándo parar."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES };
    return;
  }

  var estado = { o: 16, t: 0.001 };

  function figura(id, valores, color, titulo, marca) {
    document.getElementById(id).innerHTML = Grafica.lineasMarcadas({
      lineas: [{ valores: valores, color: color }],
      verticales: marca ? [{ en: marca - 1 }] : [],
      ancho: 640, alto: 220, titulo: titulo, etiquetaX: "época", etiquetaY: "pérdida (MSE)",
      marcasX: [0, 49, 99, 149, 199, 249, 299], rotuloX: function (i) { return String(i + 1); }
    });
  }

  function dibujar() {
    var c = curva(estado.o, estado.t), m = R.minimo(c.validacion);
    var nombre = estado.o === 0 ? "Sin capa oculta" : estado.o + " neuronas ocultas";
    document.getElementById("lectura").innerHTML = nombre + ", tasa " + R.tasa(estado.t) +
      ": validación mínima <b>" + R.coma(m.valor, 4) + "</b> en la época " + m.epoca + "; entrenamiento al final, " +
      R.coma(c.entrenamiento[c.entrenamiento.length - 1], 4) + ".";
    figura("figura-entrena", c.entrenamiento, Grafica.AZUL, "Entrenamiento", 0);
    figura("figura-valida", c.validacion, "#d9822b", "Validación", m.epoca);
  }

  R.selector("ocultas", function (x) { estado.o = Number(x); dibujar(); });
  R.selector("tasa", function (x) { estado.t = Number(x); dibujar(); });
  dibujar();

  document.getElementById("cierre-tabla").innerHTML = R.tabla(
    ["ocultas"].concat(TASAS.map(function (t) { return "tasa " + R.tasa(t); })),
    OCULTAS.map(function (o) {
      return [String(o)].concat(TASAS.map(function (t) {
        var m = minimo(o, t);
        return R.coma(m.valor, 3) + " (" + m.epoca + ")";
      }));
    }));
  document.getElementById("cierre-texto").textContent =
    "Validación mínima de cada pareja y, entre paréntesis, la época en que se alcanza. Los 24 meses de validación son la recuperación después de la pandemia, y la red entrena con la caída: varias redes validan mejor en la primera época que entrenadas. " +
    "En el backtest de la sesión, la red de 16 neuronas con tasa 0,001 queda en " + R.coma(DATOS.tabla.mlp.MAPE) + " % de MAPE, y el promedio de cinco semillas en " +
    R.coma(DATOS.tabla.cinco.MAPE) + " %, frente a " + R.coma(DATOS.tabla.sarima.MAPE) + " % de SARIMA y " + R.coma(DATOS.tabla.lineal.MAPE) + " % de la regresión lineal.";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
