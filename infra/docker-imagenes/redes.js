if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Quien alcanza a quien. La tabla es la de la sesion: db y api en la red
   red-app, creada a mano, y fuera en la bridge de fabrica. */

var IP_RED_APP = "172.19.0.2";

var ALCANCE = [
  { desde: "api", red: "red-app", orden: "ping -c 1 db", resultado: "responde",
    razon: "Los dos están en <code>red-app</code> y el DNS interno traduce el nombre." },
  { desde: "api", red: "red-app", orden: "ping -c 1 " + IP_RED_APP, resultado: "responde",
    razon: "Misma red, y con la dirección no hace falta traducir nada." },
  { desde: "db", red: "red-app", orden: "ping -c 1 api", resultado: "responde",
    razon: "El DNS de la red resuelve en las dos direcciones: cada contenedor encuentra al " +
      "otro por su nombre." },
  { desde: "db", red: "red-app", orden: "ping -c 1 " + IP_RED_APP, resultado: "responde",
    razon: "Misma red otra vez; la dirección está a un salto." },
  { desde: "fuera", red: "bridge", orden: "ping -c 1 db", resultado: "bad address",
    razon: "La bridge de fábrica no tiene DNS interno: nadie traduce <code>db</code>, así " +
      "que el <code>ping</code> ni sale. Falla la resolución del nombre, no la red." },
  { desde: "fuera", red: "bridge", orden: "ping -c 1 api", resultado: "bad address",
    razon: "El mismo fallo de resolución: el nombre de un contenedor solo existe dentro de " +
      "una red creada por el usuario." },
  { desde: "fuera", red: "bridge", orden: "ping -c 1 " + IP_RED_APP,
    resultado: "sin respuesta",
    razon: "Aquí no hay nombre que traducir, y el fallo es otro: el paquete sale y no llega, " +
      "porque este contenedor no tiene una pata en <code>red-app</code>." }
];

var RESULTADOS = ["responde", "bad address", "sin respuesta"];

/* Las cuatro clases de red de la sesion, con el caso que pide cada una. */
var CASOS = [
  { caso: "Tres servicios que se buscan por nombre", clave: "propia",
    razon: "Una bridge creada por el usuario: trae el DNS interno y aísla el grupo." },
  { caso: "Un agente que necesita ver los puertos del anfitrión", clave: "host",
    razon: "La red del anfitrión: sin aislamiento, el contenedor usa su pila de red." },
  { caso: "Un proceso que solo hace cuentas con lo que trae adentro", clave: "none",
    razon: "Sin red: queda solo el loopback, y nada entra ni sale." }
];

var CLASES = [
  { clave: "propia", rotulo: "bridge propia" },
  { clave: "host", rotulo: "host" },
  { clave: "none", rotulo: "none" }
];

/* ---------- las cuentas ---------- */

function cuantos(resultado) {
  return ALCANCE.filter(function (a) { return a.resultado === resultado; }).length;
}

function responden() { return cuantos("responde"); }

/* Los dos modos de fallar, que es lo que distingue el apartado. */
function modosDeFallar() {
  return RESULTADOS.filter(function (r) {
    return r !== "responde" && cuantos(r) > 0;
  });
}

function aciertosAlcance(respuestas) {
  return respuestas.filter(function (r, i) {
    return r !== undefined && r === ALCANCE[i].resultado;
  }).length;
}

function aciertosCasos(respuestas) {
  return respuestas.filter(function (r, i) {
    return r !== undefined && r === CASOS[i].clave;
  }).length;
}

/* ---------- veredictos y textos ---------- */

function razonAlcance(indice, elegida) {
  var a = ALCANCE[indice];
  if (elegida === a.resultado) { return a.razon; }
  return "Contesta <code>" + a.resultado + "</code>. " + a.razon;
}

function razonCaso(indice, elegida) {
  var c = CASOS[indice];
  if (elegida === c.clave) { return c.razon; }
  return "Va en otra: " + c.razon;
}

var RAZONES_DNS = {
  correcta: "Eso es. Al crear la red, Docker levanta un servidor de nombres para ella y lo " +
    "configura en cada contenedor que entra. Fuera de esa red el nombre no existe.",
  hosts: "El <code>/etc/hosts</code> de un contenedor no lleva a los demás: si fuera así, el " +
    "contenedor de la red de fábrica habría resuelto el nombre.",
  "dns-externo": "El DNS del anfitrión resuelve nombres de Internet, y es el que el " +
    "contenedor usa para lo de fuera. Los nombres de los contenedores los sirve Docker.",
  broadcast: "El <code>ping</code> necesita una dirección antes de enviar nada, y de ahí el " +
    "<code>bad address</code> cuando no hay quién traduzca."
};

var RAZONES_CADENA = {
  correcta: "Eso es. La dirección la reparte Docker en cada arranque y no está garantizada, " +
    "así que una cadena de conexión con dirección fija se rompe el día que el contenedor se " +
    "reinicia. El nombre lo resuelve el DNS de la red en ese momento.",
  rapido: "La resolución agrega una consulta; lo que se gana es que la cadena siga siendo " +
    "válida cuando la dirección cambie.",
  cifrado: "El nombre no cifra nada: resuelve a la misma dirección y el tráfico va igual.",
  igual: "No lo son. La dirección vale hasta el siguiente arranque; el nombre, mientras el " +
    "contenedor se llame así."
};

var RAZONES_CALIENTE = {
  correcta: "Eso es. Conectar una red es agregarle una interfaz al contenedor en marcha, con " +
    "su dirección y con el DNS de esa red. Ni se reinicia ni se recrea, y " +
    "<code>disconnect</code> lo deshace igual.",
  reinicio: "No hace falta reiniciar: la interfaz se agrega en caliente.",
  bad: "La red se puede conectar después de crear el contenedor, y el nombre empieza a " +
    "resolver en cuanto entra.",
  ip: "También por nombre: al entrar a la red queda configurado con su DNS interno."
};

/* ---------- pintado y conexiones ---------- */

function iniciar() {
  var respuestas = new Array(ALCANCE.length);
  var casos = new Array(CASOS.length);

  function pintarAlcance() {
    document.getElementById("cuerpo-alcance").innerHTML = ALCANCE.map(function (a, i) {
      var elegida = respuestas[i];
      var bien = elegida === a.resultado;
      var botones = RESULTADOS.map(function (r) {
        return "<button data-fila=\"" + i + "\" data-res=\"" + r + "\"" +
          (elegida === r ? " class=\"primario\"" : "") + ">" + r + "</button>";
      }).join("");
      var celda = elegida === undefined
        ? "<span class=\"pend\">sin responder</span>"
        : (bien ? "" : "<b>") + razonAlcance(i, elegida) + (bien ? "" : "</b>");
      return "<tr><td><code>" + a.desde + "</code><br><span class=\"pend\">" + a.red +
        "</span></td><td style=\"text-align:left\"><code>" + a.orden + "</code></td>" +
        "<td><div class=\"opciones\" style=\"justify-content:center\">" + botones +
        "</div></td><td style=\"text-align:left\">" + celda + "</td></tr>";
    }).join("");
    document.getElementById("progreso-alcance").textContent =
      aciertosAlcance(respuestas) + " de " + ALCANCE.length + " bien";
    Motor.pintarChips("chips-alcance", [
      { texto: "órdenes", valor: ALCANCE.length },
      { texto: "responden",
        valor: aciertosAlcance(respuestas) === ALCANCE.length ? responden() : "?",
        cuenta: true },
      { texto: "modos de fallar", valor: modosDeFallar().length }
    ]);
    document.getElementById("nota-alcance").hidden =
      aciertosAlcance(respuestas) < ALCANCE.length;
    document.querySelectorAll("#cuerpo-alcance button").forEach(function (b) {
      b.addEventListener("click", function () {
        respuestas[Number(b.dataset.fila)] = b.dataset.res;
        pintarAlcance();
      });
    });
  }

  function pintarCasos() {
    document.getElementById("cuerpo-casos").innerHTML = CASOS.map(function (c, i) {
      var elegida = casos[i];
      var bien = elegida === c.clave;
      var botones = CLASES.map(function (cl) {
        return "<button data-fila=\"" + i + "\" data-clave=\"" + cl.clave + "\"" +
          (elegida === cl.clave ? " class=\"primario\"" : "") + ">" + cl.rotulo + "</button>";
      }).join("");
      var celda = elegida === undefined
        ? "<span class=\"pend\">sin responder</span>"
        : (bien ? "" : "<b>") + razonCaso(i, elegida) + (bien ? "" : "</b>");
      return "<tr><td style=\"text-align:left\">" + c.caso + "</td>" +
        "<td><div class=\"opciones\" style=\"justify-content:center\">" + botones +
        "</div></td><td style=\"text-align:left\">" + celda + "</td></tr>";
    }).join("");
    document.getElementById("progreso-casos").textContent =
      aciertosCasos(casos) + " de " + CASOS.length + " bien";
    document.querySelectorAll("#cuerpo-casos button").forEach(function (b) {
      b.addEventListener("click", function () {
        casos[Number(b.dataset.fila)] = b.dataset.clave;
        pintarCasos();
      });
    });
  }

  pintarAlcance();
  pintarCasos();

  Motor.conectarOpciones("op-dns", "ver-dns", RAZONES_DNS);
  Motor.conectarOpciones("op-cadena", "ver-cadena", RAZONES_CADENA);
  Motor.conectarOpciones("op-caliente", "ver-caliente", RAZONES_CALIENTE);

  document.getElementById("btn-reiniciar-alcance").addEventListener("click", function () {
    respuestas = new Array(ALCANCE.length);
    pintarAlcance();
  });
  document.getElementById("btn-reiniciar-casos").addEventListener("click", function () {
    casos = new Array(CASOS.length);
    pintarCasos();
  });
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ALCANCE: ALCANCE, RESULTADOS: RESULTADOS, CASOS: CASOS, CLASES: CLASES,
    IP_RED_APP: IP_RED_APP,
    cuantos: cuantos, responden: responden, modosDeFallar: modosDeFallar,
    aciertosAlcance: aciertosAlcance, aciertosCasos: aciertosCasos,
    razonAlcance: razonAlcance, razonCaso: razonCaso,
    RAZONES_DNS: RAZONES_DNS, RAZONES_CADENA: RAZONES_CADENA,
    RAZONES_CALIENTE: RAZONES_CALIENTE
  };
}
