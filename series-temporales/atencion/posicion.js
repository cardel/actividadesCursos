/* La posición y los pesos que aprende la red: la tabla de senos y cosenos
   calculada aquí, los pesos de atención del Transformer entrenado hasta
   noviembre de 2024 con y sin posición, y la prueba de barajar la ventana. Los
   pesos y los pronósticos vienen de datos.js. */
(function () {
  "use strict";

  var A = Atencion, D = DATOS.pesos, B = DATOS.barajar;
  var c3 = function (x) { return A.coma(x, 3); };
  var MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  var ULTIMO = D.meses.length - 1;

  /* La fila del paso (1 a 12) de la tabla de 16 columnas. */
  function filaPosicion(paso) {
    var fila = [];
    for (var c = 0; c < 16; c += 2) {
      var w = Math.pow(10000, -c / 16);
      fila.push(Math.sin((paso - 1) * w), Math.cos((paso - 1) * w));
    }
    return fila;
  }
  function rango(w) { return [Math.min.apply(null, w), Math.max.apply(null, w)]; }
  var dic = rango(D.con[ULTIMO]);
  var mediaVentana = ["2023-12", "2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06", "2024-07",
    "2024-08", "2024-09", "2024-10", "2024-11"].map(A.dif12).reduce(function (a, b) { return a + b; }, 0) / 12;

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover los controles",
    definicion: "entrada de cada mes = Linear(z) + fila de su paso en la tabla de posición",
    explicacion: "La tabla tiene 12 filas, una por paso de la ventana, y 16 columnas, una por número del mes.",
    items: [
      { valor: "La tabla de posición tiene 12 × 16 = 192 números. ¿Cuántos parámetros entrenables le agrega a la red?",
        opciones: ["192, uno por casilla", "16, uno por columna", "Ninguno"], correcta: 2,
        razon: "Ninguno: la tabla se calcula con senos y cosenos y se guarda con register_buffer, que la mueve con la red sin entrenarla. 192 sería si cada casilla se aprendiera, como en otras redes que sí lo hacen." },
      { valor: "Sin la tabla, se barajan los once primeros meses de la ventana y el último se deja en su sitio. ¿Qué le pasa al pronóstico?",
        opciones: ["Cambia un poco, porque los pesos cambian", "Queda igual", "Cambia mucho, porque la red pierde la estacionalidad"], correcta: 1,
        razon: "Queda igual: la red lee el estado del último mes, y la atención de ese mes reparte sus pesos sobre los otros once sin saber en qué orden están. Barajarlos mueve los pesos con ellos y la suma no cambia." }
    ],
    cierre: "La tabla es fija y es lo único que le dice a la red el orden de la ventana."
  };

  var DESPUES = {
    id: "despues",
    titulo: "5. Con los controles en la mano",
    definicion: null,
    explicacion: "Use las partes 2, 3 y 4.",
    items: [
      { valor: "En la parte 2, ¿qué columnas cambian más de un paso al siguiente?",
        opciones: ["Las de la derecha, con las frecuencias más lentas", "Todas por igual", "Las de la izquierda, con la frecuencia más rápida"], correcta: 2,
        razon: "Las columnas 0 y 1 dan una vuelta cada 6,3 pasos; las 14 y 15, cada 19 869. En 12 pasos, de la columna 8 en adelante los números casi no se mueven: la posición la cargan unas pocas columnas." },
      { valor: "En la parte 3, con posición, ¿entre qué valores quedan los pesos de diciembre de 2024?",
        opciones: ["Entre " + c3(dic[0]) + " y " + c3(dic[1]), "Entre 0 y 1, con casi todo en noviembre", "Entre 0,250 y 0,500"], correcta: 0,
        razon: "Entre " + c3(dic[0]) + " y " + c3(dic[1]) + ", alrededor de 1/12 = 0,083: la red casi promedia la ventana. Pasa igual en los doce meses de 2024, y en los doce el peso más alto cae en el paso 12." },
      { valor: "Si la red casi promedia la ventana, ¿por qué su pronóstico de diciembre de 2024 no es la media de los doce meses?",
        opciones: ["Porque el estado del último mes entra también por la suma de su entrada", "Porque la red aprendió a no usar la atención", "Porque softmax devuelve pesos que no suman 1"], correcta: 0,
        razon: "La capa suma su entrada a la salida de la atención antes de normalizar, y la red lee el estado del último mes: noviembre llega a la salida por los dos caminos. La red pronostica " + c3(D.salidaCon[ULTIMO]) + "; la media de los doce meses de la ventana es " + c3(mediaVentana) + " y noviembre, el último, " + c3(A.dif12("2024-11")) + "." },
      { valor: "En la parte 4, ¿cuánto se mueve el pronóstico de la red sin posición al barajar la ventana?",
        opciones: ["Más que el de la red con posición", "Nada", "Lo mismo que el de la red con posición"], correcta: 1,
        razon: "Nada: " + c3(B.sin[0]) + " en orden y " + c3(B.sin[1]) + " barajada. La red con posición pasa de " + c3(B.con[0]) + " a " + c3(B.con[1]) + ": nota el orden, aunque poco." }
    ],
    cierre: "La posición le da el orden a la red; con 47 ventanas, la red apenas lo usa."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES };
    return;
  }

  var P = Pronostico, estado = { paso: 2, mes: ULTIMO, red: "con" };
  var cPaso = document.getElementById("paso"), cMes = document.getElementById("mes");

  function color(v) {
    var t = Math.round(255 - 150 * Math.abs(v));
    return v >= 0 ? "rgb(255," + t + "," + t + ")" : "rgb(" + t + "," + t + ",255)";
  }

  var pregunta = null;
  function dibujarTabla() {
    var filas = [];
    for (var p = 1; p <= 12; p++) {
      filas.push({ rotulo: (p === estado.paso ? "▶ " : "") + "paso " + p, colores: filaPosicion(p).map(color) });
    }
    document.getElementById("paso-n").textContent = estado.paso;
    document.getElementById("tabla-pos").innerHTML = Grafica.franjas({ filas: filas, marcasX: [0, 4, 8, 12],
      rotuloX: function (j) { return "col " + j; } });
    var f = filaPosicion(estado.paso);
    document.getElementById("fila").innerHTML = P.tabla(["Columna", "0", "1", "2", "3", "4", "5", "14", "15"],
      [["paso " + estado.paso].concat([0, 1, 2, 3, 4, 5, 14, 15].map(function (c) { return c3(f[c]); }))]);
    if (pregunta) { pregunta.refrescar(); }
  }

  function preguntar() {
    if (typeof Motor.opcionesNumericas !== "function") { return; }
    pregunta = Motor.opcionesNumericas("op-seno", "ver-seno", function () {
      var p = estado.paso, q = p === 12 ? 11 : p + 1;
      document.getElementById("pregunta-seno").innerHTML = "¿Cuánto vale la columna 0 en el paso " + q + "? Calcúlela antes de mover el control.";
      var lista = [
        { valor: c3(Math.sin(q - 1)), clave: "correcta", razon: "sen(" + (q - 1) + ") = " + c3(Math.sin(q - 1)) + ": el paso " + q + " tiene p = " + (q - 1) + " y la columna 0 tiene ω = 1." },
        { valor: c3(Math.sin(q)), clave: "desde-uno", razon: "Es sen(" + q + "): contar p desde 1. El paso 1 tiene p = 0, y por eso su columna 0 vale 0." },
        { valor: c3(Math.cos(q - 1)), clave: "coseno", razon: "Es cos(" + (q - 1) + "), la columna 1. Las pares llevan el seno." },
        { valor: c3(Math.sin((q - 1) * Math.pow(10000, -2 / 16))), clave: "otra-frecuencia", razon: "Es la columna 2, con ω = 10 000<sup>−2/16</sup> ≈ 0,316. La columna 0 tiene ω = 1." }
      ];
      var vistos = {};
      return lista.filter(function (o) { if (vistos[o.valor]) { return false; } vistos[o.valor] = true; return true; });
    });
  }

  function dibujarPesos() {
    var w = D[estado.red][estado.mes], m = D.meses[estado.mes];
    // el paso 1 es el mismo mes del año anterior al que se pronostica
    var mesesVentana = MESES.slice(+m.slice(5) - 1).concat(MESES.slice(0, +m.slice(5) - 1));
    var salida = D[estado.red === "con" ? "salidaCon" : "salidaSin"][estado.mes], r = rango(w);
    document.getElementById("mes-n").textContent = P.nombre(m);
    document.getElementById("barras").innerHTML = Grafica.barras({
      barras: w.map(function (x, k) { return { rotulo: "paso " + (k + 1) + " (" + mesesVentana[k] + ")", valor: x, color: estado.red === "con" ? "#d9822b" : Grafica.AZUL }; }),
      maximo: 0.15, referencia: { valor: 1 / 12, rotulo: "1/12" }, izquierda: 120,
      formato: function (x) { return c3(x); }, formatoEje: function (x) { return A.coma(x, 2); } });
    document.getElementById("lectura").innerHTML = P.nombre(m) + ", red " + estado.red + " posición: pesos entre " + c3(r[0]) + " y " + c3(r[1]) +
      ". La red " + (estado.mes === ULTIMO ? "pronostica" : "ajusta") + " una diferencia de <b>" + c3(salida) + "</b> millones; la observada fue " + c3(D.observado[estado.mes]) + ".";
  }

  function barajar(k) {
    document.getElementById("lectura-barajar").innerHTML = (k ? "Orden de los pasos: " + B.orden.join(", ") + ". " : "") +
      "Pronóstico de diciembre de 2024: con posición <b>" + c3(B.con[k]) + "</b>, sin posición <b>" + c3(B.sin[k]) + "</b>.";
  }

  cPaso.addEventListener("input", function () { estado.paso = Number(cPaso.value); dibujarTabla(); });
  cMes.addEventListener("input", function () { estado.mes = Number(cMes.value); dibujarPesos(); });
  P.selector("red", function (v) { estado.red = v; dibujarPesos(); });
  P.selector("orden", function (v) { barajar(Number(v)); });
  preguntar();
  dibujarTabla();
  dibujarPesos();
  barajar(0);

  var conAncho = 0, sinAncho = 0;
  D.con.forEach(function (w) { var r = rango(w); conAncho = Math.max(conAncho, r[1] - r[0]); });
  D.sin.forEach(function (w) { var r = rango(w); sinAncho = Math.max(sinAncho, r[1] - r[0]); });
  var bt = {};
  DATOS.backtest.forEach(function (f) { bt[f.modelo] = f; });
  function mape(nombre) { return bt[nombre] ? P.coma(bt[nombre].MAPE) : ""; }
  document.getElementById("cierre-tabla").innerHTML = P.tabla(["", "Qué", "Lo que lo muestra"], [
    ["Ventaja", "La red puede distinguir el orden", "Con posición, barajar la ventana mueve el pronóstico de " + c3(B.con[0]) + " a " + c3(B.con[1]) + "; sin ella se queda en " + c3(B.sin[0]) + "."],
    ["Ventaja", "No agrega parámetros", "La tabla de 12 × 16 se calcula; la red sigue con " + P.miles(A.total(16, 32)) + " parámetros."],
    ["Limitación", "Con pocos datos los pesos casi no se mueven", "En los doce meses de 2024 los pesos con posición se separan a lo más " + c3(conAncho) + " entre el paso más alto y el más bajo; sin posición, " + c3(sinAncho) + "."],
    ["Limitación", "En esta serie no ayuda", "MAPE del backtest con la semilla 2026: " + mape("Transformer, semilla 2026") + " con posición y " +
      mape("Transformer sin posición, semilla 2026") + " sin ella."]
  ]);
  document.getElementById("cierre-texto").textContent =
    "La tabla de posición le da el orden a la atención sin parámetros nuevos. En la diferencia con hace 12 meses, con 47 ventanas, la red aprende pesos casi planos y la posición le agrega más ruido que información.";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
