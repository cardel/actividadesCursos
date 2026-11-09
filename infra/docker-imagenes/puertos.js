if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* El servicio en marcha. Las salidas son las de la corrida de la sesion sobre
   hola-mundo:clase, levantado con -p 8081:5000. */

var CORRIDA = {
  puertoAnfitrion: 8081,
  puertoContenedor: 5000,
  id: "a1dc782247fd987f5fdfd00b20c1f673cde47a6cce83ce4e80818eb8d92c74e9",
  nombre: "hola",
  ipContenedor: "172.17.0.2",
  ipPuerta: "172.17.0.1",
  version: "0.1.0"
};

/* El hostname que ve el proceso: los doce primeros caracteres del id. */
var LARGO_HOSTNAME = 12;

/* Donde aparece el mismo texto, que es lo que pide el tercer apartado. */
var APARICIONES = [
  { donde: "la salida de <code>docker run</code>",
    que: "el identificador completo, de 64 caracteres" },
  { donde: "la columna <code>CONTAINER ID</code> de <code>docker ps</code>",
    que: "sus doce primeros caracteres" },
  { donde: "el campo <code>host</code> del JSON",
    que: "lo que devolvió <code>socket.gethostname()</code> dentro del contenedor" },
  { donde: "el indicador del intérprete con <code>docker exec -it hola sh</code>",
    que: "el mismo nombre de máquina" }
];

/* ---------- las cuentas ---------- */

function hostname() { return CORRIDA.id.slice(0, LARGO_HOSTNAME); }

function puertoDeCurl() { return CORRIDA.puertoAnfitrion; }

function mapeo() {
  return CORRIDA.puertoContenedor + "/tcp -> 0.0.0.0:" + CORRIDA.puertoAnfitrion;
}

function mismaRed(a, b) {
  return a.split(".").slice(0, 3).join(".") === b.split(".").slice(0, 3).join(".");
}

/* ---------- veredictos y textos ---------- */

function explicarPuerto(bien, real, dicho) {
  var base = bien ? "Correcto. " : "No. ";
  if (!bien && dicho === CORRIDA.puertoContenedor) {
    base = "No, y ese es el número del otro lado: ";
  }
  return base + "Es el " + real + ". En <code>-p " + CORRIDA.puertoAnfitrion + ":" +
    CORRIDA.puertoContenedor + "</code> el primero es el del anfitrión y el segundo el del " +
    "contenedor, que es donde escucha el servicio. <code>docker port " + CORRIDA.nombre +
    "</code> lo dice en ese mismo orden: <code>" + mapeo() + "</code>.";
}

var RAZONES_CINCO_MIL = {
  correcta: "Eso es. El 5000 existe dentro del contenedor, en su propia interfaz. En el " +
    "anfitrión el único puerto publicado es el " + CORRIDA.puertoAnfitrion + ", y en el 5000 " +
    "no hay nada que atienda la conexión.",
  igual: "No llevan al mismo sitio: el mapeo publica un solo puerto del anfitrión. El 5000 " +
    "del anfitrión y el 5000 del contenedor son dos puertos de dos interfaces distintas.",
  lento: "No hay un camino alternativo más corto. Sin publicación no hay por dónde entrar, " +
    "y la traducción del mapeo cuesta lo que cuesta una regla de red.",
  otro: "Otro contenedor necesitaría su propio mapeo para ser alcanzable desde el anfitrión, " +
    "y sería a otro puerto, porque dos no pueden publicar el mismo."
};

var RAZONES_LOOPBACK = {
  correcta: "Eso es. Con <code>127.0.0.1</code> el servicio solo atiende a quien ya está " +
    "dentro del contenedor, y el mapeo llega por <code>" + CORRIDA.ipContenedor + "</code>. " +
    "Por eso <code>docker exec</code> y un <code>curl</code> interno funcionan mientras el " +
    "de fuera se corta.",
  mapeo: "El orden del mapeo es anfitrión y luego contenedor, y ese está bien escrito. Lo " +
    "que falla es en qué dirección escucha la aplicación.",
  firewall: "El cortafuegos no entra: la conexión llega al contenedor y se corta ahí, porque " +
    "nada escucha en la interfaz por donde entró.",
  arranque: "Si el contenedor se hubiera caído, <code>docker ps</code> no lo mostraría " +
    "<code>Up</code> y la respuesta sería <code>Connection refused</code>. Aquí el servicio " +
    "está arriba y atendiendo, solo que en la dirección equivocada."
};

var RAZONES_HOST = {
  correcta: "Eso es. Al crear el contenedor, Docker le pone como nombre de máquina los " +
    "primeros " + LARGO_HOSTNAME + " caracteres de su identificador, y ese nombre vive en su " +
    "namespace <code>uts</code>. De ahí que el mismo texto aparezca en cuatro sitios.",
  imagen: "La imagen tiene su propio identificador, y dos contenedores de la misma imagen " +
    "devolverían nombres distintos: es lo que se vio al levantar dos.",
  anfitrion: "El anfitrión conserva su nombre. Cambiarlo es justamente lo que hace el " +
    "namespace <code>uts</code> del contenedor.",
  nombre: "El nombre de <code>--name</code> es <code>" + CORRIDA.nombre + "</code>, y sirve " +
    "para las órdenes y para el DNS de una red propia. El nombre de máquina es el otro."
};

var RAZONES_GATEWAY = {
  correcta: "Eso es. El contenedor quedó en <code>" + CORRIDA.ipContenedor + "</code> y la " +
    "puerta de enlace de esa red es <code>" + CORRIDA.ipPuerta + "</code>, que es el " +
    "anfitrión visto desde dentro. La petición entró por el mapeo y llegó traducida.",
  contenedor: "La dirección del contenedor es <code>" + CORRIDA.ipContenedor + "</code>, la " +
    "otra de la pareja. Las dos están en la misma red, y la que termina en 1 es la puerta.",
  externa: "Es una dirección privada de la red interna de Docker, no alcanzable desde " +
    "Internet. El <code>curl</code> salió del anfitrión.",
  docker: "El demonio no reenvía el tráfico: la traducción la hace el núcleo con las reglas " +
    "que Docker instala. Lo que el servicio ve es la dirección de la puerta de enlace."
};

/* ---------- pintado y conexiones ---------- */

function filasApariciones() {
  return APARICIONES.map(function (a) { return [a.donde, a.que]; });
}

function iniciar() {
  var destapado = false;

  function pintarChips() {
    Motor.pintarChips("chips-puerto", [
      { texto: "puerto del anfitrión",
        valor: destapado ? CORRIDA.puertoAnfitrion : "?", cuenta: true },
      { texto: "puerto del contenedor", valor: CORRIDA.puertoContenedor },
      { texto: "nombre de máquina", valor: destapado ? hostname() : "?" }
    ]);
  }

  function pintarApariciones() {
    document.getElementById("cuerpo-numeros").innerHTML = filasApariciones()
      .map(function (f) {
        return "<tr><td style=\"text-align:left\">" + f[0] +
          "</td><td style=\"text-align:left\">" + f[1] + "</td></tr>";
      }).join("");
  }

  pintarChips();
  pintarApariciones();

  Motor.conectarPrediccion(
    { entrada: "pred-puerto", boton: "btn-puerto", veredicto: "ver-puerto" },
    puertoDeCurl, explicarPuerto);
  document.getElementById("btn-puerto").addEventListener("click", function () {
    destapado = true;
    pintarChips();
  });

  Motor.conectarOpciones("op-cinco-mil", "ver-cinco-mil", RAZONES_CINCO_MIL);
  Motor.conectarOpciones("op-loopback", "ver-loopback", RAZONES_LOOPBACK);
  Motor.conectarOpciones("op-host", "ver-host", RAZONES_HOST);
  Motor.conectarOpciones("op-gateway", "ver-gateway", RAZONES_GATEWAY);
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CORRIDA: CORRIDA, LARGO_HOSTNAME: LARGO_HOSTNAME, APARICIONES: APARICIONES,
    hostname: hostname, puertoDeCurl: puertoDeCurl, mapeo: mapeo, mismaRed: mismaRed,
    filasApariciones: filasApariciones, explicarPuerto: explicarPuerto,
    RAZONES_CINCO_MIL: RAZONES_CINCO_MIL, RAZONES_LOOPBACK: RAZONES_LOOPBACK,
    RAZONES_HOST: RAZONES_HOST, RAZONES_GATEWAY: RAZONES_GATEWAY
  };
}
