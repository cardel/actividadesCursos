if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* El teorema CAP: la traza de la particion entre dos nodos, momento por
   momento, y los seis sistemas del ejercicio de clase con su clasificacion.
   Los textos de justificacion son los de la sesion. */

var PROPIEDADES = [
  { letra: "C", nombre: "Consistencia",
    texto: "toda lectura devuelve la escritura más reciente o un error; nunca un valor viejo presentado como bueno" },
  { letra: "A", nombre: "Disponibilidad",
    texto: "toda solicitud recibe respuesta, aunque no sea la más reciente" },
  { letra: "P", nombre: "Tolerancia a particiones",
    texto: "el sistema sigue operando si la red se parte" }
];

/* La traza del escenario: dos nodos con x=3 y una escritura durante el corte. */
var TRAZA = [
  { momento: "Antes de la partición", a: "x=3", b: "x=3", cp: "3", ap: "3" },
  { momento: "Se corta la red", a: "x=3", b: "x=3", cp: "3", ap: "3" },
  { momento: "Escritura x=5 en A", a: "x=5", b: "x=3", cp: "error", ap: "3" },
  { momento: "Se restablece la red", a: "x=5", b: "x=5", cp: "5", ap: "5" }
];

/* Los seis sistemas del ejercicio en clase, con la justificacion del tema. */
var CASOS = [
  { id: "matricula", titulo: "Matrícula universitaria, con cupos limitados por curso",
    respuesta: "CP",
    razon: "CP. Si fuera AP, dos estudiantes podrían inscribirse al último cupo en nodos " +
      "distintos durante una partición. Se prefiere rechazar la inscripción y reintentar.",
    contra: "AP dejaría pasar las dos inscripciones al mismo cupo, y después hay que decirle " +
      "a alguien que su matrícula no valía." },
  { id: "feed", titulo: "Feed de noticias de una red social", respuesta: "AP",
    razon: "AP. Ver publicaciones con segundos de retraso es aceptable.",
    contra: "CP mostraría 'error, vuelva luego' en lugar del feed, y eso arruina el servicio " +
      "para evitar un daño que no existe." },
  { id: "vuelos", titulo: "Reservas de vuelos", respuesta: "CP",
    razon: "CP. Un asiento vendido dos veces genera demandas y mala prensa: mejor negar la " +
      "reserva hasta confirmar con la autoridad central.",
    contra: "AP vendería el mismo asiento dos veces durante la partición." },
  { id: "chat", titulo: "Chat de un servidor de Discord", respuesta: "AP",
    razon: "AP. Un mensaje que aparece dos segundos tarde no daña nada.",
    contra: "CP cortaría la conversación entera mientras la red se arregla." },
  { id: "registro", titulo: "Registro civil de nacimientos", respuesta: "CP",
    razon: "CP. Certificados duplicados o inconsistentes tienen valor legal, y eso es " +
      "inaceptable.",
    contra: "AP podría emitir dos registros del mismo nacimiento, cada uno con su número." },
  { id: "carrito", titulo: "Carrito de compras de una tienda en línea", respuesta: "AP",
    razon: "AP. Es el caso de Dynamo en Amazon: si dos réplicas del carrito discrepan, se " +
      "fusionan después.",
    contra: "CP impediría agregar productos cuando la red falla, y una compra que no se puede " +
      "hacer es una venta perdida." }
];

var ACID = [
  { sigla: "ACID", promete: "atomicidad, consistencia, aislamiento y durabilidad: la " +
      "transacción ocurre completa o no ocurre, y lo confirmado persiste",
    donde: "PostgreSQL, MySQL con InnoDB, Oracle, SQL Server" },
  { sigla: "BASE", promete: "disponibilidad básica, estado blando y consistencia eventual: " +
      "responde aunque algunos nodos fallen y las copias convergen con el tiempo",
    donde: "Cassandra, DynamoDB, Riak, CouchDB" }
];

/* ---------- las cuentas ---------- */

/* El momento en que las dos decisiones dejan de coincidir. */
function momentoQueSepara() {
  var indice = -1;
  TRAZA.forEach(function (t, i) { if (indice < 0 && t.cp !== t.ap) { indice = i; } });
  return indice;
}

/* Cuantos de los seis casos piden sacrificar disponibilidad. */
function cuantosCP() {
  return CASOS.filter(function (c) { return c.respuesta === "CP"; }).length;
}

/* ---------- veredictos y textos ---------- */

var RAZONES_CLAUSULA = {
  correcta: "Es lo que permite. Responder 'no disponible' es una respuesta honesta: no afirma " +
    "nada falso sobre el dato, así que la consistencia queda intacta y lo que se pierde es la " +
    "disponibilidad. Por eso un sistema CP puede negarse a contestar sin dejar de ser correcto.",
  viejo: "Es justo lo contrario. Un valor viejo presentado como bueno es lo que la " +
    "consistencia prohíbe; esa es la opción que toma un sistema AP, y por eso sacrifica la C.",
  ignora: "No. La escritura no se descarta: queda en el nodo que la recibió y se propaga " +
    "cuando la red vuelva. Lo que la cláusula permite es no contestar mientras tanto.",
  nada: "Dice bastante. Sin esa cláusula, un sistema consistente tendría que contestar " +
    "siempre con el último valor, y durante una partición eso es imposible. La cláusula es lo " +
    "que hace que CP sea realizable."
};

var RAZONES_CP = {
  correcta: "Es la respuesta de CP. B no puede saber si alguien escribió al otro lado, así " +
    "que contestar 3 sería afirmar algo que ya no es cierto. Dice 'no disponible' y sacrifica " +
    "disponibilidad para no mentir. Bancos, reservas y HBase trabajan así.",
  tres: "Eso es lo que contesta AP. Para CP, devolver 3 cuando ya existe un 5 es presentar un " +
    "valor viejo como bueno, que es exactamente lo que la consistencia prohíbe.",
  cinco: "No puede. B está al otro lado de la partición y nunca recibió la escritura: no tiene " +
    "el 5 para devolverlo. Si pudiera consultarlo, la red no estaría partida.",
  espera: "Esperar sin límite tampoco es responder, y deja al cliente colgado. Un sistema CP " +
    "contesta con un error acotado en el tiempo, que es algo que el cliente puede manejar."
};

var RAZONES_AP = {
  correcta: "Es la respuesta de AP. B contesta con lo que tiene y acepta que puede estar " +
    "desactualizado; cuando la red vuelve, las réplicas convergen. DNS, Cassandra y los feeds " +
    "de redes sociales eligen esto.",
  cinco: "No hay otro camino. La partición es precisamente que A y B no se hablan; si " +
    "existiera una ruta alterna, no habría partición que resolver.",
  error: "Entonces sería CP. Lo que define a AP es que toda solicitud recibe respuesta, " +
    "aunque no sea la más reciente.",
  ambos: "Devolver las dos versiones es una técnica real para resolver conflictos de " +
    "escritura, y aquí no aplica: B solo conoce el 3. No sabe que existe un 5."
};

var RAZONES_EVENTUAL = {
  correcta: "Es la garantía, y lo que no dice es tan importante como lo que dice: no promete " +
    "cuándo. Mientras lleguen escrituras, las copias pueden ir detrás; si paran, se igualan.",
  rapido: "No hay plazo en la definición. En la práctica suelen ser milisegundos, y la " +
    "garantía no lo exige: durante una partición pueden pasar minutos.",
  siempre: "Eso es consistencia fuerte, la C del teorema. La eventual es más débil justamente " +
    "ahí: una lectura puede devolver un valor anterior.",
  nunca: "Discrepan por diseño: el estado blando admite que una copia cambie sin que llegue " +
    "una entrada nueva, porque está sincronizándose con las demás."
};

/* ---------- pintado y conexiones ---------- */

function filasPropiedades() {
  return PROPIEDADES.map(function (p) {
    return [p.letra + " · " + p.nombre, p.texto];
  });
}

function filasTraza(hasta) {
  return TRAZA.slice(0, hasta).map(function (t) {
    return [t.momento, t.a, t.b, t.cp, t.ap];
  });
}

function filasAcid() {
  return ACID.map(function (a) { return [a.sigla, a.promete, a.donde]; });
}

function iniciar() {
  var paso = 0;

  function pintarPropiedades() {
    document.getElementById("cuerpo-propiedades").innerHTML =
      filasPropiedades().map(function (f) {
        return "<tr><td><b>" + f[0] + "</b></td><td style=\"text-align:left\">" + f[1] +
          "</td></tr>";
      }).join("");
  }

  function pintarTraza() {
    document.getElementById("cuerpo-traza").innerHTML = filasTraza(paso).map(function (f, i) {
      var separa = i === momentoQueSepara();
      /* La fila donde CP y AP dejan de coincidir va resaltada: es la unica
         del escenario en que la decision se nota. El resalte va en linea
         porque bloque-2 solo tiñe el borde de una linea de codigo. */
      return "<tr" + (separa ? " style=\"background:var(--ambar-suave)\"" : "") +
        "><td style=\"text-align:left\">" + f[0] + "</td><td><code>" + f[1] +
        "</code></td><td><code>" + f[2] + "</code></td><td>" + f[3] + "</td><td>" + f[4] +
        "</td></tr>";
    }).join("");
    document.getElementById("progreso-cap").textContent =
      paso + " de " + TRAZA.length + " momentos";
    document.getElementById("fichas-nodos").innerHTML = (function () {
      var fila = paso > 0 ? TRAZA[paso - 1] : { a: "x=3", b: "x=3" };
      var partida = paso >= 2 && paso <= 3;
      return "<span class=\"ficha\">A: " + fila.a + "</span>" +
        "<span class=\"flecha\">" + (partida ? "✕ red partida ✕" : "↔") + "</span>" +
        "<span class=\"ficha\">B: " + fila.b + "</span>";
    })();
    document.getElementById("nota-traza").hidden = paso < TRAZA.length;
  }

  function pintarCasos() {
    document.getElementById("casos").innerHTML = CASOS.map(function (c) {
      return "<p style=\"margin-bottom:0.3rem;margin-top:1rem\">" + c.titulo + "</p>" +
        "<div class=\"opciones\" id=\"op-" + c.id + "\">" +
        "<button data-op=\"" + (c.respuesta === "CP" ? "correcta" : "otra") + "\">CP: " +
        "antes un error que un dato equivocado</button>" +
        "<button data-op=\"" + (c.respuesta === "AP" ? "correcta" : "otra") + "\">AP: " +
        "antes un dato viejo que un error</button></div>" +
        "<div id=\"ver-" + c.id + "\" class=\"veredicto\"></div>";
    }).join("");
    CASOS.forEach(function (c) {
      Motor.conectarOpciones("op-" + c.id, "ver-" + c.id, {
        correcta: c.razon,
        otra: "No es lo que conviene. " + c.contra + " Lo que corresponde es " +
          c.respuesta + ": " + c.razon.replace(/^[A-Z]+\. /, "")
      });
    });
  }

  function pintarAcid() {
    document.getElementById("cuerpo-acid").innerHTML = filasAcid().map(function (f) {
      return "<tr><td><b>" + f[0] + "</b></td><td style=\"text-align:left\">" + f[1] +
        "</td><td style=\"text-align:left\">" + f[2] + "</td></tr>";
    }).join("");
  }

  pintarPropiedades();
  pintarTraza();
  pintarCasos();
  pintarAcid();

  document.getElementById("btn-paso").addEventListener("click", function () {
    if (paso < TRAZA.length) { paso += 1; pintarTraza(); }
  });
  document.getElementById("btn-reiniciar").addEventListener("click", function () {
    paso = 0;
    pintarTraza();
  });

  Motor.conectarOpciones("op-clausula", "ver-clausula", RAZONES_CLAUSULA);
  Motor.conectarOpciones("op-cp", "ver-cp", RAZONES_CP);
  Motor.conectarOpciones("op-ap", "ver-ap", RAZONES_AP);
  Motor.conectarOpciones("op-eventual", "ver-eventual", RAZONES_EVENTUAL);
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PROPIEDADES: PROPIEDADES, TRAZA: TRAZA, CASOS: CASOS, ACID: ACID,
    momentoQueSepara: momentoQueSepara, cuantosCP: cuantosCP,
    filasPropiedades: filasPropiedades, filasTraza: filasTraza, filasAcid: filasAcid,
    RAZONES_CLAUSULA: RAZONES_CLAUSULA, RAZONES_CP: RAZONES_CP, RAZONES_AP: RAZONES_AP,
    RAZONES_EVENTUAL: RAZONES_EVENTUAL
  };
}
