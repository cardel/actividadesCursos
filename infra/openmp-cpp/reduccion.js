if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Tres escrituras de la misma reduccion sobre dos vectores de 10^8 enteros
   llenos de 10, con cuatro hilos: la que reparte el ciclo, la que olvida el
   for y la que escribe la directiva mal. Las cifras son las medidas en un
   AMD Ryzen 5 3600 de 6 nucleos y 12 hilos de hardware, con g++ -O2. DOS_D
   trae la reduccion de la matriz de 10.000 x 10.000 enteros.               */

var N = 100000000;                  // 10^8 elementos por vector
var HILOS = 4;
var VALOR_CORRECTO = 10000000000;   // cada producto vale 10 * 10

/* Sin el for, la directiva solo abre la region paralela: cada hilo recorre el
   ciclo completo y la reduccion suma una copia entera por hilo.            */
function resultado(escritura, hilos, valorCorrecto) {
  if (escritura === "parallelSinFor") { return valorCorrecto * hilos; }
  return valorCorrecto;
}

var ESCRITURAS = [
  {
    id: "reduction",
    etiqueta: "A",
    pragma: "#pragma omp parallel for reduction(+ : suma)",
    resultado: resultado("reduction", HILOS, VALOR_CORRECTO),
    ms: 31,
    delata: null
  },
  {
    id: "parallelSinFor",
    etiqueta: "B",
    pragma: "#pragma omp parallel reduction(+ : suma)",
    resultado: resultado("parallelSinFor", HILOS, VALOR_CORRECTO),
    ms: 120,
    delata: "el número"
  },
  {
    id: "pragmaMala",
    etiqueta: "C",
    pragma: "#pragma parallel reduce(suma : +)",
    resultado: resultado("pragmaMala", HILOS, VALOR_CORRECTO),
    ms: 73,
    delata: "el reloj"
  }
];

/* Lo que se ve en la salida cuando ya se destapo la tabla. */
function senal(e) {
  if (e.id === "reduction") {
    return "nada: reparte el ciclo y cada producto entra una sola vez en la suma";
  }
  if (e.id === "parallelSinFor") {
    return "el número: sale multiplicado por los cuatro hilos";
  }
  return "el reloj: " + Motor.num(e.ms) + " ms contra los " +
    Motor.num(ESCRITURAS[0].ms) + " de A, con la misma suma impresa";
}

function porId(id) {
  return ESCRITURAS.filter(function (e) { return e.id === id; })[0];
}

/* Cuentas de la tabla, para el resumen en chips. */
function conteos() {
  var correctas = ESCRITURAS.filter(function (e) {
    return e.resultado === VALOR_CORRECTO;
  }).length;
  var reparten = ESCRITURAS.filter(function (e) { return e.delata === null; }).length;
  return [
    { texto: "escrituras que compilan", valor: ESCRITURAS.length + " de 3" },
    { texto: "que imprimen " + Motor.num(VALOR_CORRECTO), valor: correctas + " de 3", cuenta: true },
    { texto: "que reparten el ciclo", valor: reparten + " de 3" }
  ];
}

/* Reduccion de la matriz 2D: el mismo calculo con los dos ciclos al reves. */
var DOS_D = [
  { id: "sin", version: "Sin OpenMP", ms: 237.78 },
  { id: "filas", version: "Con OpenMP, por filas", ms: 47.72 },
  { id: "columnas", version: "Con OpenMP, por columnas", ms: 140.24 }
];

function aceleracion(fila) {
  return DOS_D[0].ms / fila.ms;
}

/* Opciones de lo que imprime la escritura B: la correcta sale de
   resultado(); cada distractor es una cuenta equivocada sobre el reparto. */
function opcionesSinFor() {
  var num = Motor.num;
  var a = porId("reduction"), c = porId("pragmaMala");
  var real = resultado("parallelSinFor", HILOS, VALOR_CORRECTO);
  var lista = [{ valor: num(real), clave: "correcta",
    razon: "Eso es. La segunda escritura imprime " + num(real) +
      ". La directiva sin el for abre la región paralela y nada más. Los cuatro hilos recorren " +
      "el ciclo entero, la reducción suma al final las cuatro copias y el total sale " +
      "multiplicado por el número de hilos: ese error se delata en el número. La tercera no. " +
      "Imprime " + num(VALOR_CORRECTO) + ", el valor correcto, y solo el reloj la delata: " +
      num(c.ms) + " ms contra " + num(a.ms) + ", porque la directiva mal escrita se " +
      "descarta y el ciclo queda corriendo en un hilo." }];
  var candidatas = [
    { v: VALOR_CORRECTO, razon: "Ese es el valor correcto, y lo imprime la tercera escritura, " +
      "no esta. Sin el for cada hilo recorre el ciclo completo, y la reducción suma las " +
      "cuatro copias." },
    { v: VALOR_CORRECTO / HILOS, razon: "Eso es lo que suma un hilo si el ciclo se repartiera en " +
      "cuatro partes. Sin el for no hay reparto: cada hilo suma las " + num(N) +
      " iteraciones." },
    { v: VALOR_CORRECTO * 2, razon: "Eso serían dos copias completas. El equipo trae " + HILOS +
      " hilos y cada uno aporta la suya a la reducción." },
    { v: N * HILOS, razon: "Eso cuenta las iteraciones de los cuatro hilos, no la suma de " +
      "productos. Cada iteración aporta un producto de 10 por 10, es decir 100." }
  ];
  var vistos = {};
  vistos[real] = true;
  candidatas.forEach(function (c) {
    if (lista.length < 4 && !vistos[c.v]) {
      vistos[c.v] = true;
      lista.push({ valor: num(c.v), clave: "d" + c.v, razon: c.razon });
    }
  });
  return lista;
}

var RAZONES_RECORRIDO = {
  correcta: "Esa es la razón. Por columnas, cada acceso trae una línea de caché de 64 " +
    "bytes, equivalente a 16 enteros, usa uno y salta 40.000 bytes a la fila siguiente: la " +
    "línea se descarta antes de aprovecharla. Repartir entre hilos no arregla un patrón de " +
    "acceso malo. Contra la versión sin OpenMP, por filas se gana " +
    Motor.num(aceleracion(DOS_D[1]), 2) + " veces y por columnas apenas " +
    Motor.num(aceleracion(DOS_D[2]), 2) + ".",
  carrera: "Las dos usan reduction(+:sum) y las dos imprimen la misma suma. Una carrera de " +
    "datos daría números distintos de una corrida a otra; aquí lo único que cambia es el tiempo.",
  hilos: "Es el mismo número de hilos en las dos. Lo único que cambia es el orden de los " +
    "dos ciclos: i por fuera y j por dentro, o al revés.",
  tamano: "Es la misma matriz de 10.000 × 10.000 enteros en las tres filas de la tabla, " +
    "incluida la de " + Motor.num(DOS_D[0].ms, 2) + " ms sin OpenMP."
};

var RAZONES_REVISION = {
  correcta: "El número impreso. Las tres compilan y dejan un ejecutable, así que la que " +
    "olvida el for imprime " + Motor.num(resultado("parallelSinFor", HILOS, VALOR_CORRECTO)) +
    " y queda descartada en el primer renglón de la salida, sin cronómetro de por medio.",
  tiempo: "Un programa que quedó en un hilo también da el número correcto: la tercera " +
    "escritura imprime " + Motor.num(VALOR_CORRECTO) + " en " + Motor.num(porId("pragmaMala").ms) +
    " ms. El reloj la delata solo si hay con qué comparar, y " +
    Motor.num(porId("pragmaMala").ms) + " ms a secas no se ven mal.",
  avisos: "El aviso de la tercera escritura aparece solo con -Wall, y aun con el aviso en " +
    "pantalla el ejecutable queda listo y corre en un hilo. Compilar sin avisos tampoco " +
    "descarta a la segunda, que no produce ninguno.",
  conteo: "El número de hilos puede estar bien y el resultado no. Pueden arrancar doce y " +
    "recorrer cada uno el ciclo completo: eso es lo que hace parallel sin for, que con " +
    "cuatro hilos imprime " + Motor.num(resultado("parallelSinFor", HILOS, VALOR_CORRECTO)) + "."
};

var AVISO_TAPADO = "El resultado y el tiempo de las tres quedan tapados hasta que la " +
  "predicción de arriba quede comprobada.";
var AVISO_ABIERTO = "Dos de las tres imprimen el mismo número y ninguna de las dos mal " +
  "escritas falla al compilar.";

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    N: N, HILOS: HILOS, VALOR_CORRECTO: VALOR_CORRECTO,
    ESCRITURAS: ESCRITURAS, DOS_D: DOS_D,
    resultado: resultado, aceleracion: aceleracion, senal: senal, porId: porId,
    conteos: conteos, opcionesSinFor: opcionesSinFor,
    RAZONES_RECORRIDO: RAZONES_RECORRIDO, RAZONES_REVISION: RAZONES_REVISION,
    AVISO_TAPADO: AVISO_TAPADO, AVISO_ABIERTO: AVISO_ABIERTO
  };
}

if (typeof document !== "undefined") (function () {
  var num = Motor.num;
  var abierta = false;          // la tabla de la carta 3 arranca tapada

  function pintarEscrituras() {
    var pend = "<td class=\"pend\">?</td>";
    document.getElementById("cuerpo-escrituras").innerHTML = ESCRITURAS.map(function (e) {
      var celdas = abierta
        ? "<td><b>" + num(e.resultado) + "</b></td><td>" + num(e.ms) + " ms</td>"
        : pend + pend;
      return "<tr><td style=\"text-align:left\"><b>" + e.etiqueta + "</b>&nbsp; <code>" +
        e.pragma + "</code></td>" + celdas + "<td style=\"text-align:left\">" +
        (abierta ? senal(e) : (e.delata || "nada")) + "</td></tr>";
    }).join("");
    document.getElementById("progreso-escrituras").textContent =
      abierta ? AVISO_ABIERTO : AVISO_TAPADO;
  }

  function pintarDosD() {
    document.getElementById("cuerpo-dosd").innerHTML = DOS_D.map(function (f) {
      var gan = f.id === "sin" ? "la referencia" : num(aceleracion(f), 2) + " veces";
      return "<tr><td style=\"text-align:left\">" + f.version + "</td><td>" +
        num(f.ms, 2) + " ms</td><td>" + gan + "</td></tr>";
    }).join("");
  }

  function destapar() {
    if (abierta) { return; }
    abierta = true;
    pintarEscrituras();
    Motor.pintarChips("chips-escrituras", conteos());
  }

  Motor.opcionesNumericas("opciones-sin-for", "veredicto-sin-for", opcionesSinFor);
  document.getElementById("opciones-sin-for").addEventListener("click", destapar);
  Motor.conectarOpciones("opciones-recorrido", "veredicto-recorrido", RAZONES_RECORRIDO);
  Motor.conectarOpciones("opciones-revision", "veredicto-revision", RAZONES_REVISION);

  pintarEscrituras();
  pintarDosD();
})();
