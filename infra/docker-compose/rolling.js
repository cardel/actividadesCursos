if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Actualizacion progresiva de seis replicas con parallelism 2, delay 5s,
   order start-first y failure_action rollback, y la vuelta atras con su
   propio rollback_config. */

var CFG = {
  replicas: 6,
  parallelism: 2,
  delay: 5,
  orden: "start-first",
  monitor: 10,
  maxFailureRatio: 0.34,
  rollbackParallelism: 2,
  rollbackDelay: 3,
  imagenVieja: "nginx:1.25-alpine",
  imagenNueva: "nginx:1.27-alpine"
};

/* ---------- las cuentas ---------- */

function lotes(replicas, parallelism) {
  return Math.ceil(replicas / parallelism);
}

/* El delay va entre un lote y el siguiente: con n lotes hay n-1 huecos. */
function esperaTotal(cuantosLotes, delay) {
  return (cuantosLotes - 1) * delay;
}

function lotesActualizacion() { return lotes(CFG.replicas, CFG.parallelism); }

function esperaActualizacion() {
  return esperaTotal(lotesActualizacion(), CFG.delay);
}

function lotesRollback() { return lotes(CFG.replicas, CFG.rollbackParallelism); }

function esperaRollback() {
  return esperaTotal(lotesRollback(), CFG.rollbackDelay);
}

/* start-first suma la pareja nueva a las que ya estaban; stop-first la resta
   antes de subirla. */
function activasEnArranque(orden) {
  return orden === "start-first"
    ? CFG.replicas + CFG.parallelism
    : CFG.replicas - CFG.parallelism;
}

/* La traza de la sesion, momento por momento. */
function traza() {
  var filas = [{ momento: "antes de <code>stack deploy</code>", activas: CFG.replicas,
    razon: "Las seis réplicas de <code>" + CFG.imagenVieja + "</code> atendiendo." }];
  var i;
  for (i = 1; i <= lotesActualizacion(); i = i + 1) {
    filas.push({ momento: "lote " + i + ", arranca la pareja nueva",
      activas: activasEnArranque(CFG.orden),
      razon: "Con <code>start-first</code> la pareja nueva entra sin que salga la vieja: seis " +
        "más dos." });
    filas.push({ momento: "lote " + i + ", se detiene la pareja vieja", activas: CFG.replicas,
      razon: "Una vez la nueva responde, la vieja se detiene y la cuenta vuelve a seis." });
    if (i < lotesActualizacion()) {
      filas.push({ momento: "espera de " + CFG.delay + " s", activas: CFG.replicas,
        razon: "El <code>delay</code> no para réplicas: son los mismos seis atendiendo " +
          "mientras Swarm aguarda." });
    }
  }
  return filas;
}

var TRAZA = traza();

var ACTIVAS_POSIBLES = [4, 6, 8];

function pico() {
  return TRAZA.reduce(function (m, f) { return Math.max(m, f.activas); }, 0);
}

function minimo() {
  return TRAZA.reduce(function (m, f) { return Math.min(m, f.activas); }, Infinity);
}

function aciertosTraza(respuestas) {
  return respuestas.filter(function (r, i) {
    return r !== undefined && r === TRAZA[i].activas;
  }).length;
}

function trazaCompleta(respuestas) {
  return aciertosTraza(respuestas) === TRAZA.length;
}

function razonTraza(indice, elegida) {
  var f = TRAZA[indice];
  if (elegida === f.activas) { return f.razon; }
  return "Son " + f.activas + ". " + f.razon;
}

/* ---------- opciones de los numeros ---------- */

function opcionesLotes() {
  return [
    { valor: lotesActualizacion(), clave: "correcta",
      razon: "Eso es. Seis réplicas de dos en dos son tres lotes: el " +
        "<code>parallelism</code> dice el tamaño del lote, no cuántos lotes hay." },
    { valor: CFG.replicas, clave: "una-por-replica",
      razon: "Eso sería un lote por réplica, que es justo lo que evita el " +
        "<code>parallelism: 2</code>: las empareja." },
    { valor: CFG.parallelism, clave: "parallelism",
      razon: "Dos es el tamaño del lote. Los lotes salen de repartir las seis réplicas en " +
        "parejas." },
    { valor: activasEnArranque("start-first") / CFG.parallelism, clave: "pico",
      razon: "Esa cuenta usa el ocho del pico, que son las réplicas activas durante un " +
        "arranque con <code>start-first</code>. Las que hay que cambiar siguen siendo seis." }
  ];
}

function opcionesEspera() {
  return [
    { valor: esperaActualizacion(), clave: "correcta",
      razon: "Eso es. El <code>delay: 5s</code> va entre un lote y el siguiente, y entre tres " +
        "lotes hay dos huecos." },
    { valor: lotesActualizacion() * CFG.delay, clave: "una-mas",
      razon: "Eso cuenta una espera después del último lote. Cuando el tercero termina ya no " +
        "queda nada que esperar." },
    { valor: CFG.delay, clave: "una-sola",
      razon: "Una sola espera sería para dos lotes. Con tres hay dos huecos." },
    { valor: CFG.replicas * CFG.delay, clave: "por-replica",
      razon: "Cinco segundos por réplica es otra cuenta: el <code>delay</code> se aplica una " +
        "vez por lote." }
  ];
}

function opcionesStopFirst() {
  return [
    { valor: activasEnArranque("stop-first"), clave: "correcta",
      razon: "Eso es. Con <code>stop-first</code> bajan dos antes de subir las nuevas, así que " +
        "durante el arranque quedan cuatro atendiendo, y esas dos que faltan son peticiones que " +
        "alguien no recibe." },
    { valor: CFG.replicas, clave: "igual",
      razon: "Seis es lo que mantiene <code>start-first</code>. El orden no es un detalle " +
        "interno: cambia cuántas réplicas atienden mientras entra el lote." },
    { valor: activasEnArranque("start-first"), clave: "pico",
      razon: "Ocho es el pico del otro orden, que suma la pareja nueva a las seis viejas." },
    { valor: CFG.parallelism, clave: "solo-lote",
      razon: "Dos son las que entran, no las que atienden: las otras cuatro siguen en pie con " +
        "la versión vieja." }
  ];
}

function opcionesEsperaRollback() {
  return [
    { valor: esperaRollback(), clave: "correcta",
      razon: "Eso es. El <code>rollback_config</code> tiene su propio ritmo: parejas otra vez, " +
        "pero con <code>delay: 3s</code>, y entre tres lotes hay dos esperas." },
    { valor: lotesRollback() * CFG.rollbackDelay, clave: "una-mas",
      razon: "Eso cuenta una espera por lote, incluida la del último, que no existe." },
    { valor: CFG.rollbackDelay, clave: "una-sola",
      razon: "Una sola espera sería para dos lotes; la vuelta atrás también va de dos en dos " +
        "sobre seis réplicas." },
    { valor: esperaActualizacion(), clave: "delay-update",
      razon: "Diez son los de la ida, con su <code>delay: 5s</code>. La vuelta usa el " +
        "<code>delay</code> del <code>rollback_config</code>." }
  ];
}

/* ---------- razones de los bloques de texto ---------- */

var RAZONES_COSTO = {
  correcta: "Eso es. Mientras entra un lote hay ocho réplicas en pie, las seis de siempre más " +
    "la pareja nueva, y el clúster tiene que poder sostenerlas.",
  tiempo: "El tiempo es el mismo: los lotes son tres y las esperas dos, con cualquiera de los " +
    "dos órdenes.",
  nada: "Algo cuesta, y además no es el orden por omisión: hay que pedirlo. Lo que paga es " +
    "capacidad para la pareja de más.",
  hueco: "Al contrario: el hueco es lo que <code>start-first</code> evita. Las seis réplicas " +
    "siguen atendiendo durante todo el cambio."
};

var RAZONES_FALLO = {
  correcta: "Eso es. <code>failure_action: rollback</code> dispara la vuelta atrás sin que " +
    "nadie la pida, y la vuelta usa el <code>rollback_config</code>: parejas y " +
    "<code>delay: 3s</code>.",
  reintenta: "Reintentar el mismo lote no está en esta configuración. Lo que está declarado " +
    "para el fallo es volver atrás.",
  pausa: "Detenerse y dejar las dos versiones conviviendo es lo que haría " +
    "<code>failure_action: pause</code>. Aquí dice <code>rollback</code>.",
  entero: "El servicio no se baja: la vuelta atrás va por lotes, igual que la ida, y así " +
    "siguen quedando réplicas atendiendo."
};

var RAZONES_MONITOR = {
  correcta: "Eso es. El <code>monitor</code> mide si la réplica nueva queda healthy, y sin " +
    "<code>HEALTHCHECK</code> no hay con qué decidirlo: cualquier réplica que arranque pasa, " +
    "aunque la versión nueva conteste errores.",
  vivo: "Que el proceso siga vivo no dice que el servicio sirva: una versión que arranca y " +
    "responde 500 a todo pasa esa prueba.",
  puerto: "Esa comprobación es la que haría un <code>HEALTHCHECK</code>, y hay que escribirla. " +
    "Swarm no la inventa por su cuenta.",
  rollback: "El rollback automático no se dispara: sin healthcheck las réplicas se dan por " +
    "buenas y la actualización termina como si todo estuviera bien."
};

/* ---------- pintado y conexiones ---------- */

function iniciar() {
  var activas = new Array(TRAZA.length);

  Motor.pintarChips("chips-lotes", [
    { texto: "réplicas", valor: CFG.replicas },
    { texto: "por lote", valor: CFG.parallelism },
    { texto: "delay", valor: CFG.delay + " s" }
  ]);

  function pintarTraza() {
    document.getElementById("cuerpo-traza").innerHTML = TRAZA.map(function (f, i) {
      var elegida = activas[i];
      var bien = elegida === f.activas;
      var botones = ACTIVAS_POSIBLES.map(function (n) {
        return "<button data-fila=\"" + i + "\" data-activas=\"" + n + "\"" +
          (elegida === n ? " class=\"primario\"" : "") + ">" + n + "</button>";
      }).join("");
      var celda = elegida === undefined
        ? "<span class=\"pend\">sin responder</span>"
        : (bien ? "" : "<b>") + razonTraza(i, elegida) + (bien ? "" : "</b>");
      return "<tr><td style=\"text-align:left\">" + f.momento + "</td>" +
        "<td><div class=\"opciones\" style=\"justify-content:center\">" + botones +
        "</div></td><td style=\"text-align:left\">" + celda + "</td></tr>";
    }).join("");
    document.getElementById("progreso-traza").textContent =
      aciertosTraza(activas) + " de " + TRAZA.length + " bien";
    Motor.pintarChips("chips-traza", [
      { texto: "momentos", valor: TRAZA.length },
      { texto: "pico", valor: trazaCompleta(activas) ? pico() : "?", cuenta: true },
      { texto: "mínimo", valor: trazaCompleta(activas) ? minimo() : "?", cuenta: true }
    ]);
    document.getElementById("nota-traza").hidden = !trazaCompleta(activas);
    document.querySelectorAll("#cuerpo-traza button").forEach(function (b) {
      b.addEventListener("click", function () {
        activas[Number(b.dataset.fila)] = Number(b.dataset.activas);
        pintarTraza();
      });
    });
  }

  pintarTraza();

  Motor.opcionesNumericas("op-lotes", "ver-lotes", opcionesLotes);
  Motor.opcionesNumericas("op-espera", "ver-espera", opcionesEspera);
  Motor.opcionesNumericas("op-stop-first", "ver-stop-first", opcionesStopFirst);
  Motor.opcionesNumericas("op-espera-rollback", "ver-espera-rollback", opcionesEsperaRollback);

  Motor.conectarOpciones("op-costo", "ver-costo", RAZONES_COSTO);
  Motor.conectarOpciones("op-fallo", "ver-fallo", RAZONES_FALLO);
  Motor.conectarOpciones("op-monitor", "ver-monitor", RAZONES_MONITOR);

  document.getElementById("btn-reiniciar-traza").addEventListener("click", function () {
    activas = new Array(TRAZA.length);
    pintarTraza();
  });
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CFG: CFG, TRAZA: TRAZA, ACTIVAS_POSIBLES: ACTIVAS_POSIBLES,
    lotes: lotes, esperaTotal: esperaTotal,
    lotesActualizacion: lotesActualizacion, esperaActualizacion: esperaActualizacion,
    lotesRollback: lotesRollback, esperaRollback: esperaRollback,
    activasEnArranque: activasEnArranque, traza: traza,
    pico: pico, minimo: minimo,
    aciertosTraza: aciertosTraza, trazaCompleta: trazaCompleta, razonTraza: razonTraza,
    opcionesLotes: opcionesLotes, opcionesEspera: opcionesEspera,
    opcionesStopFirst: opcionesStopFirst, opcionesEsperaRollback: opcionesEsperaRollback,
    RAZONES_COSTO: RAZONES_COSTO, RAZONES_FALLO: RAZONES_FALLO,
    RAZONES_MONITOR: RAZONES_MONITOR
  };
}
