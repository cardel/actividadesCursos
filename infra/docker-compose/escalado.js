if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* El archivo de la sesion visto desde el escalado: solo web se escala, y es el
   unico que publica un puerto del anfitrion. Las cifras salen del deck.      */

var PROYECTO = "proyecto";
var ESCALA = 3;

var SERVICIOS = [
  { nombre: "web", escalable: true, puertoHost: 8080, puertoContenedor: 5000 },
  { nombre: "db", escalable: false, puertoHost: null, puertoContenedor: 5432 },
  { nombre: "cache", escalable: false, puertoHost: null, puertoContenedor: 6379 }
];

/* ---------- las cuentas ---------- */

function servicio(nombre) {
  var hallado = null;
  SERVICIOS.forEach(function (s) { if (s.nombre === nombre) { hallado = s; } });
  return hallado;
}

/* --scale nombra un servicio: los demas siguen con su replica. */
function replicasDe(nombre, escala) {
  var s = servicio(nombre);
  return s && s.escalable ? escala : 1;
}

function totalContenedores(escala) {
  return SERVICIOS.reduce(function (suma, s) {
    return suma + replicasDe(s.nombre, escala);
  }, 0);
}

function nombresReplicas(nombre, escala) {
  var lista = [], i;
  for (i = 1; i <= replicasDe(nombre, escala); i = i + 1) {
    lista.push(PROYECTO + "-" + nombre + "-" + i);
  }
  return lista;
}

function publicaPuerto(nombre) {
  var s = servicio(nombre);
  return Boolean(s && s.puertoHost);
}

/* Dos replicas que piden el mismo puerto del anfitrion no caben. */
function choquePuerto(nombre, escala) {
  return publicaPuerto(nombre) && replicasDe(nombre, escala) > 1;
}

/* up -d recrea los contenedores del servicio cuyo bloque cambio, y solo esos. */
function recreadosTrasEditar(nombre, escala) {
  return replicasDe(nombre, escala);
}

function intactosTrasEditar(nombre, escala) {
  return totalContenedores(escala) - recreadosTrasEditar(nombre, escala);
}

/* ---------- veredictos y textos ---------- */

function opcionesTotal() {
  var real = totalContenedores(ESCALA);
  return [
    { valor: real, clave: "correcta",
      razon: "Eso es: tres réplicas de <code>web</code> más una de <code>db</code> y una de " +
        "<code>cache</code>. La bandera solo toca el servicio que nombra." },
    { valor: ESCALA, clave: "solo-web",
      razon: "Tres son las réplicas de <code>web</code>. <code>db</code> y <code>cache</code> " +
        "siguen levantadas, con su contenedor cada una." },
    { valor: ESCALA + 1 + (SERVICIOS.length - 1), clave: "suma",
      razon: "<code>web=3</code> es el total de réplicas de ese servicio, no tres más la que " +
        "ya estaba corriendo." },
    { valor: ESCALA * SERVICIOS.length, clave: "todos",
      razon: "El escalado se pide servicio por servicio. <code>--scale web=3</code> no dice " +
        "nada de <code>db</code> ni de <code>cache</code>, que se quedan con una." }
  ];
}

function opcionesRecreados() {
  var real = recreadosTrasEditar("web", ESCALA);
  return [
    { valor: real, clave: "correcta",
      razon: "Eso es. <code>up -d</code> compara lo que corre con lo que dice el archivo y " +
        "recrea solo los servicios cuyo bloque cambió. <code>web</code> tiene tres réplicas, " +
        "así que son tres contenedores nuevos." },
    { valor: totalContenedores(ESCALA), clave: "todo",
      razon: "Recrear los cinco sería bajar y levantar el sistema entero. La pasada deja en " +
        "marcha lo que ya coincide con el archivo." },
    { valor: 1, clave: "una",
      razon: "Las tres réplicas salen del mismo bloque: si ese bloque cambió, ninguna de las " +
        "tres sigue valiendo y las tres se reemplazan." },
    { valor: real + 1, clave: "arrastre",
      razon: "<code>depends_on</code> fija el orden de arranque, no obliga a recrear: " +
        "<code>db</code> no cambió y se queda como está." }
  ];
}

var RAZONES_NOMBRES = {
  correcta: "Eso es. El nombre se arma con el proyecto, el servicio y el número de réplica, " +
    "y por eso la tercera queda en <code>" + PROYECTO + "-web-3</code>. El servicio en la " +
    "columna <code>SERVICE</code> sigue siendo uno: <code>web</code>.",
  hash: "El identificador al azar es el que Docker pone cuando nadie da un nombre. Aquí lo " +
    "da Compose, y el número al final alcanza para que no se repitan.",
  uno: "El servicio es uno, cierto, pero cada contenedor necesita su propio nombre: de ahí el " +
    "número. Con las tres iguales no habría a quién mandarle un <code>exec</code>.",
  tarea: "Esa es la forma de los nombres de tarea en Swarm, con el punto y el número. En " +
    "Compose el nombre lleva el proyecto por delante y los tramos separados por guión."
};

var RAZONES_PUERTO_FIJO = {
  correcta: "Eso es. <code>ports: [\"8080:5000\"]</code> pide ese puerto del anfitrión para " +
    "cada réplica, y la segunda ya no lo encuentra libre. Escalar un servicio pide que no " +
    "fije un puerto del host.",
  turnos: "Compose no reparte tráfico entre réplicas, y el puerto no alcanza ni para " +
    "intentarlo: lo toma una sola.",
  rango: "El número sale del archivo, y ahí está escrito uno fijo para el servicio. Compose " +
    "no lo va corriendo réplica por réplica.",
  caidas: "No llegan a quedar reiniciando. El puerto se reserva al crear el contenedor, y es " +
    "ahí donde la orden se detiene."
};

var RAZONES_ARREGLO = {
  correcta: "Eso es. Sin <code>ports</code>, las réplicas quedan alcanzables dentro de la red " +
    "del proyecto y ninguna pelea por el 8080. Quien publica el puerto es el balanceador, y " +
    "él decide a qué réplica le manda cada petición.",
  restart: "<code>restart</code> trabaja sobre contenedores que ya existen, y el choque " +
    "aparece al crearlos. Levantarlas de una en una tampoco libera nada: la primera retiene " +
    "el puerto mientras viva.",
  host: "En la red del anfitrión no hay una dirección por contenedor: las réplicas usan la " +
    "pila de red de la máquina, así que el 8080 sigue siendo el mismo para las tres.",
  depends: "<code>depends_on</code> ordena el arranque entre servicios distintos, no entre " +
    "réplicas del mismo. Y el puerto no se suelta al terminar de arrancar: se queda tomado."
};

var RAZONES_LIMITE = {
  correcta: "Eso es. Compose levanta las réplicas y ahí se queda: no hay reparto de carga " +
    "entre ellas. Para tráfico real va NGINX o HAProxy delante, o se pasa a Swarm, que trae " +
    "el balanceo con el servicio.",
  volumen: "El volumen lo declara <code>db</code>, que sigue con una réplica. Las de " +
    "<code>web</code> no montan nada compartido.",
  dns: "Las réplicas quedan en la misma red del proyecto y se alcanzan por nombre como " +
    "cualquier otro servicio.",
  archivo: "El bloque del servicio es uno y la bandera dice cuántas copias correr de él. Lo " +
    "que falta no es declararlas."
};

var RAZONES_RESTO = {
  correcta: "Eso es. La pasada recrea lo que cambió y respeta el resto, así que la base y el " +
    "caché siguen atendiendo con sus datos en el sitio.",
  recreados: "La dependencia dice en qué orden arrancan los servicios, no que haya que " +
    "recrearlos cuando cambia el que depende de ellos.",
  parados: "No se paran: la pasada solo toca los contenedores del servicio que cambió.",
  volumen: "El volumen sí sobrevive a recrear <code>db</code>, pero aquí <code>db</code> no " +
    "se recrea: su bloque está igual que antes."
};

/* ---------- pintado y conexiones ---------- */

function iniciar() {
  var destapado = false;

  function pintarChips() {
    Motor.pintarChips("chips-escala", SERVICIOS.map(function (s) {
      return { texto: "réplicas de " + s.nombre, valor: replicasDe(s.nombre, ESCALA) };
    }).concat([
      { texto: "contenedores", valor: destapado ? totalContenedores(ESCALA) : "?",
        cuenta: true }
    ]));
  }

  pintarChips();

  Motor.opcionesNumericas("op-total", "ver-total", opcionesTotal);
  document.getElementById("op-total").addEventListener("click", function () {
    destapado = true;
    pintarChips();
  });
  Motor.opcionesNumericas("op-recreados", "ver-recreados", opcionesRecreados);

  Motor.conectarOpciones("op-nombres", "ver-nombres", RAZONES_NOMBRES);
  Motor.conectarOpciones("op-puerto-fijo", "ver-puerto-fijo", RAZONES_PUERTO_FIJO);
  Motor.conectarOpciones("op-arreglo", "ver-arreglo", RAZONES_ARREGLO);
  Motor.conectarOpciones("op-limite", "ver-limite", RAZONES_LIMITE);
  Motor.conectarOpciones("op-resto", "ver-resto", RAZONES_RESTO);
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PROYECTO: PROYECTO, ESCALA: ESCALA, SERVICIOS: SERVICIOS,
    servicio: servicio, replicasDe: replicasDe, totalContenedores: totalContenedores,
    nombresReplicas: nombresReplicas, publicaPuerto: publicaPuerto,
    choquePuerto: choquePuerto, recreadosTrasEditar: recreadosTrasEditar,
    intactosTrasEditar: intactosTrasEditar,
    opcionesTotal: opcionesTotal, opcionesRecreados: opcionesRecreados,
    RAZONES_NOMBRES: RAZONES_NOMBRES, RAZONES_PUERTO_FIJO: RAZONES_PUERTO_FIJO,
    RAZONES_ARREGLO: RAZONES_ARREGLO, RAZONES_LIMITE: RAZONES_LIMITE,
    RAZONES_RESTO: RAZONES_RESTO
  };
}
