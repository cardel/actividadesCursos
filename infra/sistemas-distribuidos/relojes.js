if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* El orden de los eventos sin un reloj comun: tres procesos que se mandan
   tres mensajes, con el reloj logico de Lamport de cada uno. Las dos reglas:
   antes de cada evento el reloj suma uno, y al recibir toma el maximo entre
   el propio y la marca del mensaje antes de sumar. */

var PROCESOS = ["P1", "P2", "P3"];

/* tipo: "local", "envia" (con mensaje y destino) o "recibe" (con mensaje). */
var EVENTOS = [
  { proc: "P1", tipo: "local", nombre: "a", texto: "P1 guarda un registro" },
  { proc: "P1", tipo: "envia", nombre: "e1", mensaje: "m1", destino: "P2",
    texto: "P1 envía m1 a P2" },
  { proc: "P3", tipo: "local", nombre: "b", texto: "P3 actualiza su caché" },
  { proc: "P3", tipo: "envia", nombre: "e2", mensaje: "m2", destino: "P2",
    texto: "P3 envía m2 a P2" },
  { proc: "P2", tipo: "local", nombre: "c", texto: "P2 atiende a un cliente" },
  { proc: "P2", tipo: "recibe", nombre: "r1", mensaje: "m1", texto: "P2 recibe m1" },
  { proc: "P2", tipo: "recibe", nombre: "r2", mensaje: "m2", texto: "P2 recibe m2" },
  { proc: "P2", tipo: "envia", nombre: "e3", mensaje: "m3", destino: "P1",
    texto: "P2 envía m3 a P1" },
  { proc: "P1", tipo: "local", nombre: "d", texto: "P1 escribe en disco" },
  { proc: "P1", tipo: "recibe", nombre: "r3", mensaje: "m3", texto: "P1 recibe m3" }
];

/* El paso en que se pide la prediccion: la ultima recepcion. */
var PASO_PREDICCION = EVENTOS.length - 1;

/* ---------- las cuentas ---------- */

/* Recorre los eventos y devuelve, para cada uno, el reloj del proceso despues
   del evento y el estado de los tres relojes en ese momento. */
function lamport(eventos) {
  var reloj = {};
  var marcas = {};
  PROCESOS.forEach(function (p) { reloj[p] = 0; });
  return eventos.map(function (e) {
    if (e.tipo === "recibe") {
      reloj[e.proc] = Math.max(reloj[e.proc], marcas[e.mensaje]) + 1;
    } else {
      reloj[e.proc] += 1;
    }
    if (e.tipo === "envia") { marcas[e.mensaje] = reloj[e.proc]; }
    var foto = {};
    PROCESOS.forEach(function (p) { foto[p] = reloj[p]; });
    return { valor: reloj[e.proc], relojes: foto,
      marca: e.tipo === "recibe" ? marcas[e.mensaje] : null };
  });
}

function valorDe(nombre) {
  var t = lamport(EVENTOS);
  var i = EVENTOS.findIndex(function (e) { return e.nombre === nombre; });
  return t[i].valor;
}

/* Relacion "ocurre antes" de Lamport: mismo proceso en orden, o envio antes
   de su recepcion, cerrado por transitividad. */
function ocurreAntes(x, y) {
  var n = EVENTOS.length;
  var idx = {};
  EVENTOS.forEach(function (e, i) { idx[e.nombre] = i; });
  var ady = [];
  for (var i = 0; i < n; i++) { ady.push([]); }
  EVENTOS.forEach(function (e, i) {
    for (var j = i + 1; j < n; j++) {
      if (EVENTOS[j].proc === e.proc) { ady[i].push(j); break; }
    }
    if (e.tipo === "envia") {
      EVENTOS.forEach(function (r, j) {
        if (r.tipo === "recibe" && r.mensaje === e.mensaje) { ady[i].push(j); }
      });
    }
  });
  var visto = {};
  var pila = [idx[x]];
  while (pila.length) {
    var k = pila.pop();
    ady[k].forEach(function (s) {
      if (!visto[s]) { visto[s] = true; pila.push(s); }
    });
  }
  return visto[idx[y]] === true;
}

/* ---------- veredictos y textos ---------- */

function fmt(x, d) { return Motor.num(x, d); }

function explicarRecepcion(bien, real) {
  var t = lamport(EVENTOS);
  var antes = t[PASO_PREDICCION - 1].relojes.P1;
  var marca = t[PASO_PREDICCION].marca;
  return (bien ? "Correcto. " : "No. ") + "Queda en " + real + ". El reloj de P1 iba en " +
    antes + " y m3 llega con la marca " + marca + ": se toma el mayor, " +
    Math.max(antes, marca) + ", y se suma uno. P1 salta de " + antes + " a " + real +
    " sin haber hecho nada en medio, porque el mensaje trae la cuenta de todo lo que pasó en " +
    "P2 y en P3 antes de enviarlo.";
}

var RAZONES_ORDEN = {
  correcta: "Es la respuesta. Ningún mensaje lleva de c hasta d: m3 sale de P2 después de c, " +
    "pero llega a P1 después de d. Los dos eventos son concurrentes, y aun así " +
    "C(c) = " + valorDe("c") + " es menor que C(d) = " + valorDe("d") + ". Lamport garantiza " +
    "una sola dirección: si x ocurre antes que y, entonces C(x) < C(y). La recíproca es falsa.",
  antes: "Los números lo sugieren, y es la trampa. Para que c ocurra antes que d tendría que " +
    "haber una cadena de mensajes de P2 a P1 que llegue antes de d, y m3 llega después. Un " +
    "reloj menor no prueba nada sobre el orden.",
  despues: "Tampoco. Para que d ocurra antes que c, algo tendría que viajar de P1 a P2 entre " +
    "d y c, y P1 no envía nada después de d.",
  mismo: "Están en procesos distintos, así que no comparten reloj. Los relojes lógicos solo " +
    "ordenan lo que está unido por una cadena de eventos y mensajes."
};

var RAZONES_NTP = {
  correcta: "Es la razón. NTP deja los relojes a unos milisegundos entre sí, y dos escrituras " +
    "separadas por menos que ese margen quedan en un orden que nadie puede afirmar. El reloj " +
    "lógico no mide tiempo: solo registra qué pudo influir en qué, y eso es lo que hace falta " +
    "para decidir cuál escritura gana.",
  caro: "Sincronizar no es caro: NTP corre en casi todas las máquinas. El problema es que, aun " +
    "sincronizados, los relojes difieren en milisegundos, y en ese margen el orden queda sin " +
    "decidir.",
  exacto: "Ningún protocolo deja dos relojes físicos idénticos. Los servicios que más se " +
    "acercan, como TrueTime de Google, no prometen la hora exacta sino un intervalo, y esperan " +
    "a que el intervalo pase antes de confirmar una escritura.",
  red: "La red sí transporta la hora; lo que no puede es entregarla sin demora. El mensaje de " +
    "NTP tarda en llegar, y esa demora variable es justo el error que queda."
};

/* ---------- pintado y conexiones ---------- */

function filasTraza(hasta) {
  var t = lamport(EVENTOS);
  return EVENTOS.slice(0, hasta).map(function (e, i) {
    var regla = e.tipo === "recibe"
      ? "max(" + (i > 0 ? relojPrevio(t, i, e.proc) : 0) + ", " + t[i].marca + ") + 1"
      : relojPrevio(t, i, e.proc) + " + 1";
    return [e.nombre, e.texto, regla, t[i].relojes.P1, t[i].relojes.P2, t[i].relojes.P3];
  });
}

function relojPrevio(t, i, proc) { return i === 0 ? 0 : t[i - 1].relojes[proc]; }

function iniciar() {
  var paso = 0;
  var predicho = false;

  function pintar() {
    var filas = filasTraza(paso);
    document.getElementById("cuerpo-relojes").innerHTML = filas.map(function (f, i) {
      var oculta = i === PASO_PREDICCION && !predicho;
      var celdas = oculta
        ? "<td class=\"pend\">?</td><td class=\"pend\">?</td><td class=\"pend\">?</td><td class=\"pend\">?</td>"
        : "<td><code>" + f[2] + "</code></td><td>" + f[3] + "</td><td>" + f[4] + "</td><td>" +
          f[5] + "</td>";
      return "<tr><td><b>" + f[0] + "</b></td><td style=\"text-align:left\">" + f[1] +
        "</td>" + celdas + "</tr>";
    }).join("");
    document.getElementById("progreso-relojes").textContent =
      paso + " de " + EVENTOS.length + " eventos";
    document.getElementById("caja-prediccion").hidden = paso <= PASO_PREDICCION;
    document.getElementById("btn-paso").disabled =
      paso >= EVENTOS.length || (paso > PASO_PREDICCION && !predicho);
  }

  pintar();

  document.getElementById("btn-paso").addEventListener("click", function () {
    if (paso < EVENTOS.length) { paso += 1; pintar(); }
  });
  document.getElementById("btn-reiniciar").addEventListener("click", function () {
    paso = 0;
    predicho = false;
    document.getElementById("ver-recepcion").className = "veredicto";
    document.getElementById("ver-recepcion").textContent = "";
    pintar();
  });

  Motor.conectarPrediccion(
    { entrada: "pred-recepcion", boton: "btn-recepcion", veredicto: "ver-recepcion" },
    function () { return lamport(EVENTOS)[PASO_PREDICCION].valor; },
    explicarRecepcion);
  document.getElementById("btn-recepcion").addEventListener("click", function () {
    predicho = true;
    pintar();
  });

  Motor.conectarOpciones("op-orden", "ver-orden", RAZONES_ORDEN);
  Motor.conectarOpciones("op-ntp", "ver-ntp", RAZONES_NTP);
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PROCESOS: PROCESOS, EVENTOS: EVENTOS, PASO_PREDICCION: PASO_PREDICCION,
    lamport: lamport, valorDe: valorDe, ocurreAntes: ocurreAntes, filasTraza: filasTraza,
    explicarRecepcion: explicarRecepcion, RAZONES_ORDEN: RAZONES_ORDEN, RAZONES_NTP: RAZONES_NTP
  };
}
