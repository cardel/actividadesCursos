if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Quorums de lectura y escritura: cinco replicas del mismo dato, una
   escritura que llega a W de ellas y una lectura que consulta R. La lectura
   se queda con la version mas alta que vea. Despues, la misma regla con la
   red partida en dos lados. */

var N = 5;
var W = 3;
var R = 3;

var REPLICAS = ["r1", "r2", "r3", "r4", "r5"];

/* La traza: estado de cada replica como { valor, version }. */
var INICIAL = { valor: 3, version: 1 };
var ESCRITURA = { valor: 5, version: 2, llegaA: ["r1", "r2", "r3"] };
var LECTURA = { consulta: ["r3", "r4", "r5"] };

/* La particion del ultimo apartado. */
var LADOS = [["r1", "r2"], ["r3", "r4", "r5"]];

/* ---------- las cuentas ---------- */

/* Con R + W > N, todo grupo de lectura comparte al menos una replica con
   todo grupo de escritura. */
function seCruzan(n, w, r) { return r + w > n; }

/* Cuantas replicas comparten, como minimo, un grupo de w y uno de r. */
function minimoComun(n, w, r) { return Math.max(0, w + r - n); }

function rMinimo(n, w) { return n - w + 1; }

function estadoTrasEscritura() {
  var estado = {};
  REPLICAS.forEach(function (x) {
    estado[x] = ESCRITURA.llegaA.indexOf(x) >= 0
      ? { valor: ESCRITURA.valor, version: ESCRITURA.version }
      : { valor: INICIAL.valor, version: INICIAL.version };
  });
  return estado;
}

/* La lectura devuelve el valor de la version mas alta entre las consultadas. */
function leer(estado, consulta) {
  var mejor = null;
  consulta.forEach(function (x) {
    if (mejor === null || estado[x].version > mejor.version) { mejor = estado[x]; }
  });
  return mejor;
}

/* Un lado de la particion puede escribir si alcanza W replicas, y leer con
   garantia si alcanza R. */
function puedeEscribir(lado, w) { return lado.length >= w; }
function puedeLeer(lado, r) { return lado.length >= r; }

/* Las combinaciones de la tabla, con N = 5. */
function combinaciones() {
  var lista = [[1, 1], [1, 5], [5, 1], [2, 3], [3, 3], [2, 4]];
  return lista.map(function (c) {
    return { w: c[0], r: c[1], cruza: seCruzan(N, c[0], c[1]),
      comun: minimoComun(N, c[0], c[1]) };
  });
}

/* ---------- veredictos y textos ---------- */

function fmt(x, d) { return Motor.num(x, d); }

function explicarR(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Hacen falta " + real + ". Con W = 2, la escritura " +
    "pudo quedar solo en dos réplicas, y las otras " + (N - 2) + " siguen con el valor viejo. " +
    "Una lectura de " + (N - 2) + " podría caer justo en esas; con " + real + " es imposible " +
    "esquivar las dos que sí la tienen. La regla es R + W > N: " + real + " + 2 > " + N + ".";
}

var RAZONES_LECTURA = {
  correcta: "Es lo que devuelve. r4 y r5 contestan 3 con versión 1, r3 contesta 5 con versión " +
    "2, y la lectura se queda con la versión más alta. Basta una réplica en común entre los " +
    "que escribieron y los que se consultaron, y con R = 3 y W = 3 sobre cinco siempre hay al " +
    "menos " + minimoComun(N, W, R) + ".",
  mayoria: "Contar votos daría 3, que es justo el error. La lectura no elige por mayoría sino " +
    "por versión: dos réplicas atrasadas no le ganan a una al día.",
  error: "No hay conflicto que reportar. Las dos respuestas traen versión, y la 2 es posterior " +
    "a la 1: el valor viejo simplemente no se ha enterado.",
  esperar: "No hace falta esperar a nadie. Con tres respuestas se cumple R, y entre ellas ya " +
    "está la versión más reciente."
};

var RAZONES_PARTICION = {
  correcta: "Es lo que pasa. El lado de tres alcanza W = 3 y sigue aceptando escrituras; el de " +
    "dos no alcanza ni W ni R y contesta con error. Es la elección CP: el lado pequeño prefiere " +
    "no responder a responder con un dato que el otro lado ya pudo cambiar.",
  ambos: "Si los dos lados escribieran, cada uno tendría su propia versión 2 y al volver la red " +
    "habría dos historias distintas. El quórum existe para que eso no pase: dos grupos de tres " +
    "no caben en cinco réplicas sin compartir una.",
  ninguno: "El lado de tres sí puede: tiene las réplicas que pide W. Solo queda sin servicio " +
    "quien está del lado pequeño.",
  pequeno: "Es al revés: dos réplicas no alcanzan W = 3. El lado pequeño es el que se queda sin " +
    "escribir."
};

var RAZONES_RAPIDO = {
  correcta: "Es la consecuencia. Con W = 1 y R = 1, 1 + 1 no supera 5: la lectura puede caer en " +
    "una réplica que la escritura no tocó y devolver un dato viejo. A cambio, cualquier réplica " +
    "viva contesta sola, aun con la red partida. Es una elección AP, y Cassandra la ofrece como " +
    "nivel de consistencia ONE.",
  igual: "La velocidad sí mejora, y la garantía se pierde: sin réplica en común, nada obliga a " +
    "que la lectura vea la última escritura.",
  error: "Con W = 1 la escritura casi nunca falla: basta una réplica viva. Lo que se pierde es la " +
    "lectura al día, no la escritura.",
  durable: "Una sola copia confirmada es menos durable, no más: si esa réplica se daña antes de " +
    "propagar, la escritura se pierde."
};

/* ---------- pintado y conexiones ---------- */

var PASOS = [
  { texto: "Las cinco réplicas tienen x = 3, versión 1" },
  { texto: "Un cliente escribe x = 5; la escritura se confirma con r1, r2 y r3" },
  { texto: "Otro cliente lee consultando r3, r4 y r5" }
];

function filaReplicas(paso) {
  var estado = paso >= 2 ? estadoTrasEscritura() : null;
  return REPLICAS.map(function (x) {
    var e = estado ? estado[x] : INICIAL;
    var consultada = paso >= 3 && LECTURA.consulta.indexOf(x) >= 0;
    return { replica: x, texto: "x=" + e.valor + " v" + e.version, consultada: consultada };
  });
}

function filasCombinaciones() {
  return combinaciones().map(function (c) {
    return ["W = " + c.w + ", R = " + c.r, c.w + c.r, c.cruza ? "sí" : "no", c.comun];
  });
}

function iniciar() {
  var paso = 1;

  function pintar() {
    document.getElementById("fichas-replicas").innerHTML = filaReplicas(paso).map(function (f) {
      return "<span class=\"ficha\"" +
        (f.consultada ? " style=\"background:var(--ambar);color:#1f2328\"" : "") +
        ">" + f.replica + ": " + f.texto + "</span>";
    }).join("");
    document.getElementById("texto-paso").textContent = PASOS[paso - 1].texto;
    document.getElementById("progreso-quorum").textContent = paso + " de " + PASOS.length;
    document.getElementById("pregunta-lectura").hidden = paso < PASOS.length;
  }

  pintar();

  document.getElementById("btn-paso").addEventListener("click", function () {
    if (paso < PASOS.length) { paso += 1; pintar(); }
  });
  document.getElementById("btn-reiniciar").addEventListener("click", function () {
    paso = 1;
    pintar();
  });

  document.getElementById("cuerpo-combinaciones").innerHTML =
    filasCombinaciones().map(function (f) {
      return "<tr><td>" + f[0] + "</td><td>" + f[1] + "</td><td>" + f[2] + "</td><td>" +
        f[3] + "</td></tr>";
    }).join("");

  Motor.conectarPrediccion(
    { entrada: "pred-r", boton: "btn-r", veredicto: "ver-r" },
    function () { return rMinimo(N, 2); },
    explicarR);

  Motor.conectarOpciones("op-lectura", "ver-lectura", RAZONES_LECTURA);
  Motor.conectarOpciones("op-particion", "ver-particion", RAZONES_PARTICION);
  Motor.conectarOpciones("op-rapido", "ver-rapido", RAZONES_RAPIDO);
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    N: N, W: W, R: R, REPLICAS: REPLICAS, INICIAL: INICIAL, ESCRITURA: ESCRITURA,
    LECTURA: LECTURA, LADOS: LADOS, PASOS: PASOS,
    seCruzan: seCruzan, minimoComun: minimoComun, rMinimo: rMinimo,
    estadoTrasEscritura: estadoTrasEscritura, leer: leer,
    puedeEscribir: puedeEscribir, puedeLeer: puedeLeer, combinaciones: combinaciones,
    filaReplicas: filaReplicas, filasCombinaciones: filasCombinaciones, explicarR: explicarR,
    RAZONES_LECTURA: RAZONES_LECTURA, RAZONES_PARTICION: RAZONES_PARTICION,
    RAZONES_RAPIDO: RAZONES_RAPIDO
  };
}
