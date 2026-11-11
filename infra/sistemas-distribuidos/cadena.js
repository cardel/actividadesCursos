if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Disponibilidad de una cadena de servicios: tres piezas de tres nueves en
   serie, lo que cambia al duplicar una, y las dos decisiones que deja un
   nodo que no contesta. Las fallas se suponen independientes. */

var DIAS_ANO = 365;
var HORAS_ANO = DIAS_ANO * 24;

var PIEZAS = [
  { nombre: "Balanceador", uptime: 99.9 },
  { nombre: "Servidor de aplicación", uptime: 99.9 },
  { nombre: "Base de datos", uptime: 99.9 }
];

/* La pieza que se duplica en el segundo apartado. */
var DUPLICADA = 2;

/* ---------- las cuentas ---------- */

function fraccion(uptime) { return uptime / 100; }

/* En serie el servicio responde solo si responden todas. */
function enSerie(fracciones) {
  return fracciones.reduce(function (acc, f) { return acc * f; }, 1);
}

/* En paralelo el servicio cae solo si caen todas las copias. */
function enParalelo(f, copias) { return 1 - Math.pow(1 - f, copias); }

function cadenaSimple() {
  return enSerie(PIEZAS.map(function (p) { return fraccion(p.uptime); }));
}

/* La cadena con la pieza indicada en dos copias. */
function cadenaConCopia(indice) {
  return enSerie(PIEZAS.map(function (p, i) {
    var f = fraccion(p.uptime);
    return i === indice ? enParalelo(f, 2) : f;
  }));
}

/* Todas las piezas duplicadas. */
function cadenaTodoDoble() {
  return enSerie(PIEZAS.map(function (p) { return enParalelo(fraccion(p.uptime), 2); }));
}

function horasCaidas(f) { return HORAS_ANO * (1 - f); }

/* ---------- veredictos y textos ---------- */

function fmt(x, d) { return Motor.num(x, d); }

/* Las predicciones se piden en horas caidas al ano: con porcentajes tan
   cerca de 100, el margen del 2 % del motor aceptaria 99,9 por 99,7. */
function explicarSerie(bien, horas) {
  var f = cadenaSimple();
  return (bien ? "Correcto. " : "No. ") + "Son " + fmt(horas, 1) + " horas. La cadena " +
    "responde solo si responden las tres piezas: 0,999 × 0,999 × 0,999 = " + fmt(f, 6) +
    ", un " + fmt(f * 100, 2) + " %. Tres piezas de tres nueves no suman tres nueves: el " +
    "servicio queda caído casi el triple de las " +
    fmt(horasCaidas(0.999), 2) + " que deja cada pieza sola. Cada eslabón que se agrega a la " +
    "cadena resta.";
}

function explicarCopia(bien, horas) {
  return (bien ? "Correcto. " : "No. ") + "Son " + fmt(horas, 1) + " horas. Las dos copias de " +
    "la base caen juntas con probabilidad 0,001 × 0,001, una vez en un millón, así que esa " +
    "pieza pasa a seis nueves y la cadena sube a " +
    fmt(cadenaConCopia(DUPLICADA) * 100, 2) + " %. No baja más porque el balanceador y la " +
    "aplicación siguen solos, y cada uno aporta sus 8,76 horas. Duplicando las tres " +
    "piezas se llega a " + fmt(cadenaTodoDoble() * 100, 4) + " %.";
}

var RAZONES_SILENCIO = {
  correcta: "Es lo único que se sabe. La base puede estar caída, puede estar lenta, o puede " +
    "haber contestado y perderse la respuesta en el camino: los tres casos se ven igual desde " +
    "afuera, porque ninguno llega antes del límite. El tiempo de espera no detecta caídas, " +
    "solo decide cuánto se está dispuesto a esperar, y por eso un límite corto declara muerto " +
    "a un nodo que estaba vivo y ocupado.",
  caido: "No se puede afirmar. Puede estar vivo con la CPU saturada, o haber contestado y que " +
    "la respuesta se perdiera en la red. Desde el otro lado, los tres casos se ven iguales.",
  red: "Puede ser la red, y puede no serlo. El silencio no dice dónde está la falla.",
  reintentar: "Reintentar es una opción, no una conclusión. Y si el primer intento sí se " +
    "ejecutó, reintentar lo ejecuta dos veces, que es lo que plantea el apartado que sigue."
};

var RAZONES_REINTENTO = {
  correcta: "Es la solución que se usa. La solicitud lleva un identificador que el cliente " +
    "genera una sola vez, y el servidor guarda cuáles ya procesó: el reintento con el mismo " +
    "identificador recibe la respuesta guardada en lugar de cobrar otra vez. A eso se le llama " +
    "una operación idempotente.",
  nunca: "Sin reintentos, un paquete perdido es un pago perdido, y en una red real se pierden " +
    "paquetes todo el tiempo. Reintentar es necesario; lo que hay que evitar es que el " +
    "reintento se ejecute dos veces.",
  esperar: "No hay límite de espera que resuelva esto. La respuesta pudo haberse perdido para " +
    "siempre, y esperar más solo retrasa la misma duda.",
  revisar: "El saldo no basta: otro cargo legítimo pudo entrar entre los dos intentos, y la " +
    "cuenta no dice cuál de los dos es el repetido."
};

/* ---------- pintado y conexiones ---------- */

function filasPiezas() {
  return PIEZAS.map(function (p) {
    return [p.nombre, fmt(p.uptime, 1) + " %", fmt(horasCaidas(fraccion(p.uptime)), 2) + " h"];
  });
}

function iniciar() {
  var vistaSerie = false, vistaCopia = false;

  function pintar() {
    document.getElementById("cuerpo-piezas").innerHTML = filasPiezas().map(function (f) {
      return "<tr><td style=\"text-align:left\">" + f[0] + "</td><td>" + f[1] + "</td><td>" +
        f[2] + "</td></tr>";
    }).join("");
    Motor.pintarChips("chips-cadena", [
      { texto: "cadena simple",
        valor: vistaSerie ? fmt(cadenaSimple() * 100, 2) + " %" : "?", cuenta: true },
      { texto: "horas caídas al año",
        valor: vistaSerie ? fmt(horasCaidas(cadenaSimple()), 1) : "?" },
      { texto: "con la base duplicada",
        valor: vistaCopia ? fmt(cadenaConCopia(DUPLICADA) * 100, 2) + " %" : "?", cuenta: true },
      { texto: "horas caídas al año",
        valor: vistaCopia ? fmt(horasCaidas(cadenaConCopia(DUPLICADA)), 1) : "?" }
    ]);
  }

  pintar();

  Motor.conectarPrediccion(
    { entrada: "pred-serie", boton: "btn-serie", veredicto: "ver-serie" },
    function () { return horasCaidas(cadenaSimple()); },
    explicarSerie);
  document.getElementById("btn-serie").addEventListener("click", function () {
    vistaSerie = true;
    pintar();
  });

  Motor.conectarPrediccion(
    { entrada: "pred-copia", boton: "btn-copia", veredicto: "ver-copia" },
    function () { return horasCaidas(cadenaConCopia(DUPLICADA)); },
    explicarCopia);
  document.getElementById("btn-copia").addEventListener("click", function () {
    vistaCopia = true;
    pintar();
  });

  Motor.conectarOpciones("op-silencio", "ver-silencio", RAZONES_SILENCIO);
  Motor.conectarOpciones("op-reintento", "ver-reintento", RAZONES_REINTENTO);
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PIEZAS: PIEZAS, DUPLICADA: DUPLICADA, HORAS_ANO: HORAS_ANO,
    enSerie: enSerie, enParalelo: enParalelo, cadenaSimple: cadenaSimple,
    cadenaConCopia: cadenaConCopia, cadenaTodoDoble: cadenaTodoDoble, horasCaidas: horasCaidas,
    filasPiezas: filasPiezas, explicarSerie: explicarSerie, explicarCopia: explicarCopia,
    RAZONES_SILENCIO: RAZONES_SILENCIO, RAZONES_REINTENTO: RAZONES_REINTENTO
  };
}
