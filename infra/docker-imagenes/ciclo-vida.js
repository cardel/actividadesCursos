if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* El ciclo de vida y la parada ordenada. La secuencia de ordenes con el STATUS
   que informa docker ps -a sale de la corrida de la sesion, y los tres tiempos
   de parada vienen de medirlos con time. */

var CICLO = [
  { orden: "docker create --name ciclo alpine:3.20 sleep 60", estado: "Created",
    disco: "sistema de archivos y configuración, sin proceso" },
  { orden: "docker start ciclo", estado: "Up Less than a second",
    disco: "el proceso corriendo, más su capa escribible" },
  { orden: "docker stop ciclo", estado: "Exited (137) Less than a second ago",
    disco: "capa escribible y registros, sin proceso" },
  { orden: "docker rm ciclo", estado: "(la tabla queda vacía)",
    disco: "nada: se borran la capa escribible y los registros" }
];

/* Las tres paradas medidas. El plazo por omision son diez segundos. */
var PLAZO = 10;

var PARADAS = [
  { nombre: "web", pid1: "nginx, atiende SIGTERM", segundos: 0.168, salida: 0 },
  { nombre: "sordo", pid1: "sleep 300, la ignora", segundos: 10.148, salida: 137 },
  { nombre: "sordo2", pid1: "sleep 300 con -t 3", segundos: 3.167, salida: 137 }
];

var SIGKILL = 9;
var BASE_SENAL = 128;

/* ---------- las cuentas ---------- */

function parada(nombre) {
  var fila = PARADAS.filter(function (p) { return p.nombre === nombre; })[0];
  return fila ? fila.segundos : NaN;
}

/* El codigo con que sale un proceso muerto por una senal. */
function codigoDeSenal(senal) { return BASE_SENAL + senal; }

function senalDeCodigo(codigo) { return codigo - BASE_SENAL; }

/* Cuantas veces mas tarda parar el que ignora la senal. */
function razonParadas() { return parada("sordo") / parada("web"); }

/* Lo que se pasa del plazo: el tiempo de mandar la segunda senal. */
function sobrepasoDelPlazo() { return parada("sordo") - PLAZO; }

function cuantosPorSigkill() {
  return PARADAS.filter(function (p) { return p.salida === codigoDeSenal(SIGKILL); }).length;
}

/* ---------- veredictos y textos ---------- */

function fmt(x, d) { return Motor.num(x, d); }

function explicarSordo(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Tarda " + fmt(real, 3) + " segundos: el plazo " +
    "completo de " + PLAZO + ", más los " + fmt(sobrepasoDelPlazo(), 3) + " que cuesta " +
    "mandar SIGKILL y recoger el proceso. Nadie atendió la primera señal, así que la espera " +
    "se agotó entera.";
}

function explicarWeb(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Tarda " + fmt(real, 3) + " segundos, " +
    fmt(razonParadas(), 0) + " veces menos que el sordo. nginx recibe SIGTERM, cierra sus " +
    "conexiones y termina por su cuenta, de modo que el plazo no se usa y el código de salida " +
    "es 0. El plazo no es un costo fijo: es un techo.";
}

var RAZONES_CODIGO = {
  correcta: "Es la cuenta: " + BASE_SENAL + " + " + SIGKILL + " = " + codigoDeSenal(SIGKILL) +
    ". Un proceso terminado por una señal sale con 128 más el número de la señal, y la 9 es " +
    "SIGKILL. Leer ese código dice quién lo mató, no qué hizo mal el programa.",
  error: "No es de Docker: es la convención del intérprete de órdenes de Unix para informar " +
    "que el proceso murió por una señal. El mismo 137 aparece fuera de los contenedores.",
  memoria: "Un contenedor que excede su límite de memoria también aparece con 137, y por la " +
    "misma razón: el núcleo lo mata con SIGKILL. El código dice cómo murió, no por qué, y aquí " +
    "fue el plazo de la parada.",
  azar: "Tiene criterio fijo: " + BASE_SENAL + " más el número de la señal. SIGKILL es la 9, " +
    "SIGTERM la 15, y un proceso terminado por SIGTERM saldría con " +
    codigoDeSenal(15) + "."
};

var RAZONES_SINTOMA = {
  correcta: "Es el diagnóstico, y el síntoma es engañoso porque no hay ningún error visible: " +
    "el contenedor para, solo que siempre al límite. Si el proceso número uno no recibe la " +
    "señal, lo que estaba atendiendo se corta en seco en cada despliegue.",
  lento: "Si tuviera mucho que guardar, el tiempo variaría con la carga. Diez segundos " +
    "exactos, siempre, es el plazo agotado: la marca de que nadie respondió.",
  red: "El plazo no espera conexiones: es un reloj fijo tras el SIGTERM. Un servicio que sí " +
    "atiende la señal cierra sus conexiones y termina antes, como nginx en " +
    fmt(parada("web"), 3) + " s.",
  normal: "No lo es. De las tres paradas medidas, una tardó " + fmt(parada("web"), 3) +
    " segundos. El plazo es un techo, y llegar a él siempre es la señal de que algo no se " +
    "está atendiendo."
};

var RAZONES_FORZAR = {
  correcta: "Es lo que hace, y por eso la orden sin bandera se niega: <code>-f</code> manda " +
    "SIGKILL y borra, sin plazo para cerrar conexiones ni vaciar buffers. Lo que el " +
    "contenedor tuviera a medias se pierde ahí mismo.",
  espera: "No espera: ese es <code>docker stop</code> seguido de <code>docker rm</code>. La " +
    "bandera <code>-f</code> se salta justamente el plazo.",
  igual: "No es lo mismo. Sin bandera, Docker se niega para no matar un proceso que está " +
    "trabajando; el mensaje es una protección, no un trámite.",
  volumen: "Los volúmenes sobreviven: para borrarlos hay que pasar <code>-v</code> o usar " +
    "<code>docker volume rm</code>. Es justamente lo que los hace servir para una base de datos."
};

/* ---------- pintado y conexiones ---------- */

function filasCiclo(hasta) {
  return CICLO.slice(0, hasta).map(function (c) { return [c.orden, c.estado, c.disco]; });
}

function filasParadas() {
  return PARADAS.map(function (p) {
    return [p.nombre, p.pid1, fmt(p.segundos, 3) + " s", String(p.salida)];
  });
}

function iniciar() {
  var paso = 0;
  var destapado = false;

  function pintarCiclo() {
    document.getElementById("cuerpo-ciclo").innerHTML = filasCiclo(paso).map(function (f) {
      return "<tr><td style=\"text-align:left\"><code>" + f[0] + "</code></td><td>" + f[1] +
        "</td><td style=\"text-align:left\">" + f[2] + "</td></tr>";
    }).join("");
    document.getElementById("progreso-ciclo").textContent =
      paso + " de " + CICLO.length + " órdenes";
    var estado = paso > 0 ? CICLO[paso - 1].estado.split(" ")[0] : "sin crear";
    document.getElementById("estado-actual").innerHTML = CICLO.map(function (c, i) {
      var nombre = c.estado.split(" ")[0];
      return "<span class=\"ficha" + (i < paso ? "" : " tachada") + "\">" + nombre + "</span>";
    }).join("<span class=\"flecha\">→</span>") +
      "<span class=\"chip\">estado actual <b>" + estado + "</b></span>";
    document.getElementById("nota-ciclo").hidden = paso < CICLO.length;
  }

  function pintarParadas() {
    document.getElementById("cuerpo-stop").innerHTML = filasParadas().map(function (f) {
      var resto = destapado
        ? "<td>" + f[2] + "</td><td>" + f[3] + "</td>"
        : "<td class=\"pend\">?</td><td class=\"pend\">?</td>";
      return "<tr><td><code>" + f[0] + "</code></td><td style=\"text-align:left\">" + f[1] +
        "</td>" + resto + "</tr>";
    }).join("");
    Motor.pintarChips("chips-stop", [
      { texto: "plazo por omisión", valor: PLAZO + " s" },
      { texto: "veces más lento el sordo",
        valor: destapado ? fmt(razonParadas(), 0) : "?", cuenta: true },
      { texto: "salieron por SIGKILL",
        valor: destapado ? cuantosPorSigkill() + " de " + PARADAS.length : "?" }
    ]);
  }

  pintarCiclo();
  pintarParadas();

  document.getElementById("btn-paso").addEventListener("click", function () {
    if (paso < CICLO.length) { paso += 1; pintarCiclo(); }
  });
  document.getElementById("btn-reiniciar").addEventListener("click", function () {
    paso = 0;
    pintarCiclo();
  });

  Motor.conectarPrediccion(
    { entrada: "pred-sordo", boton: "btn-sordo", veredicto: "ver-sordo" },
    function () { return parada("sordo"); }, explicarSordo);
  Motor.conectarPrediccion(
    { entrada: "pred-web", boton: "btn-web", veredicto: "ver-web" },
    function () { return parada("web"); }, explicarWeb);
  [["btn-sordo"], ["btn-web"]].forEach(function (par) {
    document.getElementById(par[0]).addEventListener("click", function () {
      destapado = true;
      pintarParadas();
    });
  });

  Motor.conectarOpciones("op-codigo", "ver-codigo", RAZONES_CODIGO);
  Motor.conectarOpciones("op-sintoma", "ver-sintoma", RAZONES_SINTOMA);
  Motor.conectarOpciones("op-forzar", "ver-forzar", RAZONES_FORZAR);
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CICLO: CICLO, PARADAS: PARADAS, PLAZO: PLAZO, SIGKILL: SIGKILL,
    parada: parada, codigoDeSenal: codigoDeSenal, senalDeCodigo: senalDeCodigo,
    razonParadas: razonParadas, sobrepasoDelPlazo: sobrepasoDelPlazo,
    cuantosPorSigkill: cuantosPorSigkill, filasCiclo: filasCiclo, filasParadas: filasParadas,
    explicarSordo: explicarSordo, explicarWeb: explicarWeb,
    RAZONES_CODIGO: RAZONES_CODIGO, RAZONES_SINTOMA: RAZONES_SINTOMA,
    RAZONES_FORZAR: RAZONES_FORZAR
  };
}
