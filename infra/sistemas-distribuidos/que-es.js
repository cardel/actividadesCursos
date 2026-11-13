if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Que cuesta cruzar la red: los cuatro tiempos de la tabla del tema y los
   factores que salen de dividirlos por la lectura de RAM. Los tiempos estan
   en nanosegundos para que el factor se calcule sin convertir unidades. */

var RAM = 100;                  /* 100 ns */
var SSD = 100 * 1000;           /* 100 us */
var RACK = 0.5 * 1000 * 1000;   /* 0,5 ms */
var LEJOS = 50 * 1000 * 1000;   /* 50 ms  */

var OPERACIONES = [
  { nombre: "Lectura de RAM local", tiempo: "100 ns", ns: RAM },
  { nombre: "Lectura de SSD local", tiempo: "100 µs", ns: SSD },
  { nombre: "Ida y vuelta dentro del rack", tiempo: "0,5 ms", ns: RACK },
  { nombre: "Ping entre centros de datos lejanos", tiempo: "50 ms", ns: LEJOS }
];

/* Las dos sumas que compara el tema. */
var SUMAS = {
  openmp: { elementos: 1000000, hilos: 8, maquinas: 1 },
  mapreduce: { elementos: 1000000000, maquinas: 100 }
};

/* Cuanta vuelta al mundo da la luz por fibra, en milisegundos. */
var VUELTA_MUNDO_MS = 130;

/* ---------- las cuentas ---------- */

function factor(ns) { return ns / RAM; }

/* Cuantos elementos mas maneja la segunda forma de sumar. */
function razonElementos() {
  return SUMAS.mapreduce.elementos / SUMAS.openmp.elementos;
}

/* Diez llamadas seriales entre continentes, en segundos. */
function segundosDiezLlamadas() { return 10 * LEJOS / 1e9; }

/* ---------- veredictos y textos ---------- */

function fmt(x, d) { return Motor.num(x, d); }

function explicarFactor(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Son " + fmt(real) + " veces: 50 ms contra 100 ns. " +
    "Entre la RAM y el SSD hay un factor de mil, y entre el SSD y la red otro factor de mil, " +
    "así que cruzar el planeta cuesta medio millón de veces lo que leer un dato propio. " +
    "Diez llamadas seriales de esas son " + fmt(segundosDiezLlamadas(), 1) + " segundos.";
}

var RAZONES_SUMAR = {
  correcta: "Es la razón. Mil millones de elementos no entran en la memoria de una máquina, " +
    "así que la comparación no es entre rápido y lento sino entre posible e imposible. " +
    "Son " + fmt(razonElementos()) + " veces más datos, repartidos entre " +
    SUMAS.mapreduce.maquinas + " máquinas que suman su parte y después juntan los resultados.",
  rapida: "No, y conviene desconfiar de esa idea. Por elemento la versión distribuida es más " +
    "lenta: cada ida a la red cuesta " + fmt(factor(LEJOS)) + " veces una lectura de RAM. " +
    "Con el millón de elementos del primer caso, cien máquinas tardarían más que ocho hilos.",
  barata: "El costo cuenta cuando se elige entre escalar a lo alto o a lo ancho, y no es lo " +
    "que decide aquí. Aunque una sola máquina fuera gratis, en esa no caben mil millones de " +
    "elementos.",
  tolerante: "La tolerancia a fallos es una de las razones para distribuir, y no la de este " +
    "caso: lo que obliga es el volumen. Un cálculo que cabe en una máquina se paraleliza ahí " +
    "con hilos, aunque se quiera redundancia."
};

var RAZONES_DEFINICION = {
  correcta: "Eso es lo que no se sigue, y es el primero de los problemas que solo aparecen " +
    "distribuidos: cada nodo tiene su propio reloj. Sin un tiempo común no se puede decir " +
    "cuál de dos escrituras ocurrió primero, y de ahí los relojes lógicos y los servicios de " +
    "tiempo con margen acotado.",
  estado: "Eso sí se sigue: los nodos comparten estado, y mantenerlo coherente entre todos es " +
    "la mitad del trabajo de un sistema distribuido.",
  concurrente: "Eso sí se sigue: los nodos operan a la vez, y por eso dos solicitudes pueden " +
    "tocar el mismo dato desde máquinas distintas.",
  falla: "Eso sí se sigue, y es lo que distingue un sistema distribuido de una máquina grande: " +
    "un nodo puede caer y el servicio sigue respondiendo con los demás."
};

var RAZONES_REGIONES = {
  correcta: "Es la razón. El catálogo y el video se pueden copiar cuantas veces se quiera, " +
    "porque dos copias iguales no se contradicen. Un pago no: si dos regiones aceptan el " +
    "mismo cargo durante una partición de la red, hay que deshacer uno. Lo replicable se " +
    "acerca al usuario; lo que exige una sola decisión se queda en una región.",
  ancho: "No. El HTML son kilobytes y el video son megabytes, y es el video el que sí se sirve " +
    "cerca. El pago mueve muy pocos datos: lo que pesa no es el tamaño.",
  caro: "No es la razón. Las regiones tienen precios distintos y eso no decide dónde vive una " +
    "transacción; decide dónde conviene poner capacidad de cómputo.",
  cdn: "Hay plataformas que ejecutan código en el borde, como Cloudflare Workers o " +
    "Lambda@Edge, así que eso ya no es cierto. Y aun pudiendo ejecutarlo ahí, el pago seguiría " +
    "necesitando una sola fuente de verdad."
};

/* ---------- pintado y conexiones ---------- */

function filasLatencias() {
  return OPERACIONES.map(function (o) {
    return [o.nombre, o.tiempo, fmt(factor(o.ns)) + "×"];
  });
}

function iniciar() {
  var destapado = false;

  function pintar() {
    document.getElementById("cuerpo-latencias").innerHTML = filasLatencias().map(function (f) {
      var ultima = destapado ? "<td>" + f[2] + "</td>" : "<td class=\"pend\">?</td>";
      return "<tr><td style=\"text-align:left\">" + f[0] + "</td><td>" + f[1] + "</td>" +
        ultima + "</tr>";
    }).join("");
    Motor.pintarChips("chips-latencias", [
      { texto: "RAM a SSD", valor: destapado ? fmt(factor(SSD)) + "×" : "?", cuenta: true },
      { texto: "SSD a red del rack", valor: destapado ? fmt(RACK / SSD) + "×" : "?", cuenta: true },
      { texto: "diez llamadas entre continentes",
        valor: destapado ? fmt(segundosDiezLlamadas(), 1) + " s" : "?" },
      { texto: "vuelta al mundo por fibra", valor: VUELTA_MUNDO_MS + " ms" }
    ]);
  }

  pintar();

  Motor.opcionesNumericas("op-factor", "ver-factor", function () {
    var real = factor(LEJOS);
    var lista = [
      { valor: fmt(real), clave: "correcta", razon: explicarFactor(true, real) },
      { valor: fmt(real / 1000), clave: "us",
        razon: "Eso sale de tomar el milisegundo como si fuera un microsegundo: la red queda mil " +
          "veces más cerca de lo que está. Pasar de 50 ms a nanosegundos son seis ceros, no tres." },
      { valor: fmt(real / 10), clave: "cero-menos",
        razon: "Falta un cero: toma 50 ms como 5.000.000 ns. " +
          "50 ms son 50.000.000 ns, y entre 100 ns da " + fmt(real) + "." },
      { valor: fmt(real * 10), clave: "cero-mas",
        razon: "Sobra un cero. 50 ms son 50.000.000 ns, y entre 100 ns da " + fmt(real) +
          "; esa cuenta toma 50 ms como 500.000.000 ns." }
    ];
    return lista;
  });
  document.getElementById("op-factor").addEventListener("click", function () {
    destapado = true;
    pintar();
    document.getElementById("nota-latencias").hidden = false;
  });

  Motor.conectarOpciones("op-sumar", "ver-sumar", RAZONES_SUMAR);
  Motor.conectarOpciones("op-definicion", "ver-definicion", RAZONES_DEFINICION);
  Motor.conectarOpciones("op-regiones", "ver-regiones", RAZONES_REGIONES);
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    RAM: RAM, SSD: SSD, RACK: RACK, LEJOS: LEJOS, OPERACIONES: OPERACIONES, SUMAS: SUMAS,
    factor: factor, razonElementos: razonElementos, segundosDiezLlamadas: segundosDiezLlamadas,
    explicarFactor: explicarFactor, filasLatencias: filasLatencias,
    RAZONES_SUMAR: RAZONES_SUMAR, RAZONES_DEFINICION: RAZONES_DEFINICION,
    RAZONES_REGIONES: RAZONES_REGIONES
  };
}
