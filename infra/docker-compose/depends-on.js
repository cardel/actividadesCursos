if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* depends_on y healthchecks. Las condiciones, el healthcheck de pg_isready y
   la cadena de tres servicios son los de 02-compose-healthchecks. */

/* El healthcheck tal como esta escrito en el archivo. */
var SALUD = {
  test: "pg_isready -U postgres -d demo",
  interval: 3,
  timeout: 2,
  retries: 10,
  startPeriod: 5
};

var CONDICIONES = [
  { caso: "Al servicio le basta que el contenedor del otro esté arrancado, porque reintenta " +
      "la conexión por su cuenta",
    clave: "started",
    razon: "<code>service_started</code> es lo que hace <code>depends_on</code> por omisión: " +
      "espera a que el contenedor arranque y suelta al que depende." },
  { caso: "La base tiene que estar aceptando conexiones antes de que <code>web</code> haga la " +
      "primera consulta",
    clave: "healthy",
    razon: "<code>service_healthy</code> espera a que el healthcheck del otro reporte " +
      "healthy, y para eso el otro tiene que declarar uno." },
  { caso: "Una migración que crea la tabla, termina y no vuelve a correr",
    clave: "completed",
    razon: "<code>service_completed_successfully</code> espera a que el contenedor termine con " +
      "código 0, que es justo lo que hace una migración." }
];

var NOMBRES_CONDICION = [
  { clave: "started", rotulo: "service_started" },
  { clave: "healthy", rotulo: "service_healthy" },
  { clave: "completed", rotulo: "service_completed_successfully" }
];

/* Las claves del healthcheck y lo que fija cada una. */
var CLAVES_SALUD = [
  { que: "La orden con que el contenedor se sondea a sí mismo", clave: "test",
    razon: "<code>test</code> lleva la orden, y corre dentro del contenedor del servicio: " +
      "<code>" + SALUD.test + "</code> pregunta a PostgreSQL si ya acepta conexiones." },
  { que: "Cada cuánto se repite el sondeo", clave: "interval",
    razon: "<code>interval: " + SALUD.interval + "s</code>. Es lo que marca el ritmo, y con él " +
      "lo que tarda el estado en cambiar." },
  { que: "Lo que se espera a que un sondeo responda antes de darlo por fallido", clave: "timeout",
    razon: "<code>timeout: " + SALUD.timeout + "s</code>. Un sondeo que no contesta en ese " +
      "plazo cuenta como fallido, aunque el proceso siga pensando." },
  { que: "Cuántos sondeos fallidos seguidos hacen falta para marcar el servicio como caído",
    clave: "retries",
    razon: "<code>retries: " + SALUD.retries + "</code>. Son sondeos, no segundos: los " +
      "segundos salen de multiplicarlos por el intervalo." },
  { que: "La ventana inicial en la que un sondeo fallido no cuenta", clave: "start_period",
    razon: "<code>start_period: " + SALUD.startPeriod + "s</code>. Da margen al arranque: lo " +
      "que falle ahí no suma reintentos ni marca el servicio." }
];

var NOMBRES_CLAVE = ["test", "interval", "timeout", "retries", "start_period"];

/* La cadena del archivo: quien espera a quien y que espera. */
var CADENA = [
  { quien: "<code>migrate</code> espera a <code>db</code>", clave: "healthy",
    razon: "<code>service_healthy</code>: el <code>psql</code> de la migración necesita una " +
      "base que ya acepte conexiones, o falla y el proyecto queda sin la tabla." },
  { quien: "<code>web</code> espera a <code>db</code>", clave: "healthy",
    razon: "<code>service_healthy</code> otra vez: <code>web</code> atiende peticiones desde " +
      "que arranca y la base tiene que estar lista." },
  { quien: "<code>web</code> espera a <code>migrate</code>", clave: "completed",
    razon: "<code>service_completed_successfully</code>: la migración corre una vez y sale, " +
      "así que lo que se espera es su código de salida en 0." }
];

var QUE_ESPERA = [
  { clave: "started", rotulo: "que arranque" },
  { clave: "healthy", rotulo: "que esté healthy" },
  { clave: "completed", rotulo: "que termine con código 0" }
];

/* ---------- las cuentas ---------- */

/* Segundos de sondeos fallidos seguidos, contados desde que acaba la ventana
   inicial, hasta que el servicio queda marcado como caido. */
function segundosHastaCaido(s) {
  return s.interval * s.retries;
}

function condicionesUsadas() {
  var vistas = {};
  CADENA.forEach(function (c) { vistas[c.clave] = true; });
  return Object.keys(vistas).length;
}

function serviciosEnCadena() {
  var vistas = {};
  CADENA.forEach(function (c) {
    c.quien.replace(/<code>([a-z_]+)<\/code>/g, function (todo, nombre) {
      vistas[nombre] = true;
      return todo;
    });
  });
  return Object.keys(vistas).length;
}

function aciertosCondiciones(respuestas) {
  return respuestas.filter(function (r, i) {
    return r !== undefined && r === CONDICIONES[i].clave;
  }).length;
}

function aciertosClaves(respuestas) {
  return respuestas.filter(function (r, i) {
    return r !== undefined && r === CLAVES_SALUD[i].clave;
  }).length;
}

function aciertosCadena(respuestas) {
  return respuestas.filter(function (r, i) {
    return r !== undefined && r === CADENA[i].clave;
  }).length;
}

/* ---------- veredictos y textos ---------- */

function razonCondicion(indice, elegida) {
  var c = CONDICIONES[indice];
  if (elegida === c.clave) { return c.razon; }
  return "Pide otra: " + c.razon;
}

function razonClave(indice, elegida) {
  var c = CLAVES_SALUD[indice];
  if (elegida === c.clave) { return c.razon; }
  return "Eso lo fija <code>" + c.clave + "</code>. " + c.razon;
}

function razonCadena(indice, elegida) {
  var c = CADENA[indice];
  if (elegida === c.clave) { return c.razon; }
  if (c.clave === "completed" && elegida === "healthy") {
    return "Un contenedor que corre su orden y sale nunca se reporta healthy: con esa " +
      "condición el proyecto espera para siempre. " + c.razon;
  }
  return "Espera otra cosa: " + c.razon;
}

function opcionesCaido() {
  var real = segundosHastaCaido(SALUD);
  return [
    { valor: real, clave: "correcta",
      razon: "Eso es. Un sondeo cada " + SALUD.interval + " segundos y " + SALUD.retries +
        " fallos seguidos antes de darlo por caído: " + SALUD.interval + " por " +
        SALUD.retries + ". Medio minuto en que quien pidió " +
        "<code>service_healthy</code> sigue esperando." },
    { valor: SALUD.interval + SALUD.retries, clave: "suma",
      razon: "Ahí se suman dos cosas de distinta clase: " + SALUD.interval + " son segundos y " +
        SALUD.retries + " es una cuenta de sondeos. Lo que las junta es el producto." },
    { valor: SALUD.interval * SALUD.retries + SALUD.startPeriod, clave: "con-ventana",
      razon: "Los " + SALUD.startPeriod + " segundos de <code>start_period</code> van antes y " +
        "no cuentan: en esa ventana un sondeo fallido no suma reintentos, y la pregunta " +
        "arranca donde la ventana acaba." },
    { valor: SALUD.retries, clave: "reintentos",
      razon: "Los " + SALUD.retries + " son sondeos, no segundos. Cada uno se separa del " +
        "siguiente por el intervalo, y de ahí sale el total." }
  ];
}

var RAZONES_GARANTIZA = {
  correcta: "Eso es. Ordena la creación y nada más: la base arranca antes, pero " +
    "<code>web</code> no espera a que esté lista. De ahí que el primer <code>curl</code> pueda " +
    "llegar demasiado pronto.",
  atiende: "Eso es lo que hace <code>condition: service_healthy</code>, y pide un " +
    "<code>healthcheck</code> en el servicio del que se depende. La lista a secas no mira si " +
    "el puerto atiende.",
  reintento: "Reintentar es trabajo de la aplicación o del guion que la lanza. Compose no " +
    "reintenta nada por ella.",
  reinicio: "Eso sería una política de reinicio, que se declara con <code>restart</code>. " +
    "<code>depends_on</code> solo interviene al crear los contenedores."
};

var RAZONES_PRIMER_CURL = {
  correcta: "Eso es. El contenedor de la base existe desde antes, pero el proceso de " +
    "PostgreSQL necesita unos segundos para atender el puerto. <code>depends_on</code> ya " +
    "cumplió lo suyo y el <code>SELECT 1</code> llega demasiado pronto.",
  "no-creado": "Si el servicio no existiera, Compose no levantaría el proyecto. La base está " +
    "creada y arrancando, y eso es exactamente el problema.",
  dns: "La red la crea Compose antes de los contenedores y el nombre resuelve desde el primer " +
    "momento. Lo que falla es que al otro lado todavía no hay quién atienda.",
  volumen: "La imagen de PostgreSQL inicializa la base ella sola en el primer arranque, y eso " +
    "es parte de lo que tarda. Nadie la prepara a mano."
};

var RAZONES_SALIDAS = {
  correcta: "Eso es. La orden del <code>test</code> corre dentro del contenedor del servicio, " +
    "así que tiene que existir en esa imagen. Donde no existe, el que espera es el otro lado, " +
    "con un guion que sondea el puerto antes de lanzar el proceso.",
  muchos: "El número de servicios no cambia nada: la cadena del archivo tiene tres y se " +
    "resuelve entera con condiciones en el YAML.",
  puerto: "El healthcheck no pasa por el anfitrión: la orden corre dentro del contenedor, y el " +
    "guion de espera sondea el puerto por la red interna. Publicar no hace falta ni en un caso " +
    "ni en el otro.",
  siempre: "<code>condition: service_healthy</code> sí espera, y suelta al que depende cuando " +
    "el healthcheck reporta healthy. El que no espera es <code>depends_on</code> a secas."
};

/* ---------- pintado y conexiones ---------- */

function tabla(idCuerpo, filas, opciones, elegidas, textoFila, razonar, repintar) {
  document.getElementById(idCuerpo).innerHTML = filas.map(function (f, i) {
    var elegida = elegidas[i];
    var bien = elegida === f.clave;
    var botones = opciones.map(function (o) {
      return "<button data-fila=\"" + i + "\" data-clave=\"" + o.clave + "\"" +
        (elegida === o.clave ? " class=\"primario\"" : "") + ">" + o.rotulo + "</button>";
    }).join("");
    var celda = elegida === undefined
      ? "<span class=\"pend\">sin responder</span>"
      : (bien ? "" : "<b>") + razonar(i, elegida) + (bien ? "" : "</b>");
    return "<tr><td style=\"text-align:left\">" + textoFila(f) + "</td>" +
      "<td><div class=\"opciones\" style=\"justify-content:center\">" + botones +
      "</div></td><td style=\"text-align:left\">" + celda + "</td></tr>";
  }).join("");
  document.querySelectorAll("#" + idCuerpo + " button").forEach(function (b) {
    b.addEventListener("click", function () {
      elegidas[Number(b.dataset.fila)] = b.dataset.clave;
      repintar();
    });
  });
}

function iniciar() {
  var condiciones = new Array(CONDICIONES.length);
  var claves = new Array(CLAVES_SALUD.length);
  var cadena = new Array(CADENA.length);

  function pintarCondiciones() {
    tabla("cuerpo-condiciones", CONDICIONES, NOMBRES_CONDICION, condiciones,
      function (f) { return f.caso; }, razonCondicion, pintarCondiciones);
    document.getElementById("progreso-condiciones").textContent =
      aciertosCondiciones(condiciones) + " de " + CONDICIONES.length + " bien";
  }

  function pintarClaves() {
    tabla("cuerpo-claves", CLAVES_SALUD,
      NOMBRES_CLAVE.map(function (n) { return { clave: n, rotulo: n }; }), claves,
      function (f) { return f.que; }, razonClave, pintarClaves);
    document.getElementById("progreso-claves").textContent =
      aciertosClaves(claves) + " de " + CLAVES_SALUD.length + " bien";
  }

  function pintarCadena() {
    tabla("cuerpo-cadena", CADENA, QUE_ESPERA, cadena,
      function (f) { return f.quien; }, razonCadena, pintarCadena);
    document.getElementById("progreso-cadena").textContent =
      aciertosCadena(cadena) + " de " + CADENA.length + " bien";
    document.getElementById("nota-cadena").hidden = aciertosCadena(cadena) < CADENA.length;
  }

  pintarCondiciones();
  pintarClaves();
  pintarCadena();

  Motor.pintarChips("chips-condiciones", [
    { texto: "condiciones", valor: NOMBRES_CONDICION.length },
    { texto: "la de por omisión", valor: "service_started", cuenta: true }
  ]);

  Motor.pintarChips("chips-unhealthy", [
    { texto: "intervalo", valor: SALUD.interval + " s" },
    { texto: "reintentos", valor: SALUD.retries },
    { texto: "ventana inicial", valor: SALUD.startPeriod + " s" },
    { texto: "servicios en la cadena", valor: serviciosEnCadena() }
  ]);

  Motor.opcionesNumericas("op-unhealthy", "ver-unhealthy", opcionesCaido);

  Motor.conectarOpciones("op-garantiza", "ver-garantiza", RAZONES_GARANTIZA);
  Motor.conectarOpciones("op-primer-curl", "ver-primer-curl", RAZONES_PRIMER_CURL);
  Motor.conectarOpciones("op-salidas", "ver-salidas", RAZONES_SALIDAS);

  document.getElementById("btn-reiniciar-condiciones").addEventListener("click", function () {
    condiciones = new Array(CONDICIONES.length);
    pintarCondiciones();
  });
  document.getElementById("btn-reiniciar-claves").addEventListener("click", function () {
    claves = new Array(CLAVES_SALUD.length);
    pintarClaves();
  });
  document.getElementById("btn-reiniciar-cadena").addEventListener("click", function () {
    cadena = new Array(CADENA.length);
    pintarCadena();
  });
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SALUD: SALUD, CONDICIONES: CONDICIONES, NOMBRES_CONDICION: NOMBRES_CONDICION,
    CLAVES_SALUD: CLAVES_SALUD, NOMBRES_CLAVE: NOMBRES_CLAVE,
    CADENA: CADENA, QUE_ESPERA: QUE_ESPERA,
    segundosHastaCaido: segundosHastaCaido, condicionesUsadas: condicionesUsadas,
    serviciosEnCadena: serviciosEnCadena,
    aciertosCondiciones: aciertosCondiciones, aciertosClaves: aciertosClaves,
    aciertosCadena: aciertosCadena,
    razonCondicion: razonCondicion, razonClave: razonClave, razonCadena: razonCadena,
    opcionesCaido: opcionesCaido,
    RAZONES_GARANTIZA: RAZONES_GARANTIZA, RAZONES_PRIMER_CURL: RAZONES_PRIMER_CURL,
    RAZONES_SALIDAS: RAZONES_SALIDAS
  };
}
