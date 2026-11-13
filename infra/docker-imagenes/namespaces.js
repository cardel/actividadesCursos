if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Namespaces y cgroups. Los identificadores son los que se leyeron en la
   sesion sobre el contenedor web y sobre el interprete del anfitrion, y los
   limites del cgroup son los del contenedor levantado con --cpus=1.5
   --memory=256m --pids-limit=64. */

var NS = [
  { nombre: "pid",  que: "el árbol de procesos",         anfitrion: 4026531836, contenedor: 4026533408 },
  { nombre: "net",  que: "interfaces, rutas y puertos",  anfitrion: 4026531833, contenedor: 4026533410 },
  { nombre: "mnt",  que: "los puntos de montaje",        anfitrion: 4026531832, contenedor: 4026533405 },
  { nombre: "uts",  que: "el nombre de la máquina",      anfitrion: 4026531838, contenedor: 4026533406 },
  { nombre: "user", que: "la correspondencia de UID",    anfitrion: 4026531837, contenedor: 4026531837 }
];

/* Las seis preguntas del cuarto apartado, con el mecanismo que las responde y
   donde se lee la respuesta. */
var MECANISMOS = [
  { pregunta: "Qué procesos aparecen en <code>ps</code>", clave: "namespace", donde: "namespace pid" },
  { pregunta: "Cuántos núcleos alcanza a usar", clave: "cgroup", donde: "cpu.max" },
  { pregunta: "Qué interfaces de red tiene", clave: "namespace", donde: "namespace net" },
  { pregunta: "Cuánta memoria reserva antes de que el núcleo lo mate", clave: "cgroup", donde: "memory.max" },
  { pregunta: "Qué devuelve <code>hostname</code>", clave: "namespace", donde: "namespace uts" },
  { pregunta: "Cuántos procesos llega a crear", clave: "cgroup", donde: "pids.max" }
];

/* ---------- las cuentas ---------- */

function esDistinto(fila) { return fila.anfitrion !== fila.contenedor; }

function cuantosDistintos() { return NS.filter(esDistinto).length; }

function compartidos() {
  return NS.filter(function (f) { return !esDistinto(f); })
    .map(function (f) { return f.nombre; });
}

/* Con --network host el contenedor usa la pila del anfitrion: ese namespace
   deja de ser propio y el resto sigue igual. */
function distintosConRedDelAnfitrion() {
  return NS.filter(function (f) {
    return esDistinto(f) && f.nombre !== "net";
  }).length;
}

function clavesDe(clave) {
  return MECANISMOS.filter(function (m) { return m.clave === clave; }).length;
}

function esCorrecta(indice, elegida) { return MECANISMOS[indice].clave === elegida; }

function aciertos(respuestas) {
  return respuestas.filter(function (r, i) {
    return r !== undefined && esCorrecta(i, r);
  }).length;
}

function resueltas(respuestas) {
  return respuestas.filter(function (r) { return r !== undefined; }).length;
}

/* ---------- veredictos y textos ---------- */

function explicarDistintos(bien, real, dicho) {
  var base = bien ? "Correcto. " : "No. ";
  if (!bien && dicho === NS.length) {
    base = "No, y es el error que vale la pena ver: ";
  }
  return base + "Son " + real + " de " + NS.length + ". El que se repite es " +
    compartidos().join(" y ") + ": " + NS[4].anfitrion + " a los dos lados. Los otros " +
    "cuatro traen números del rango alto, que es el que el núcleo reparte a los namespaces " +
    "creados después del arranque.";
}

/* Quita las opciones que repiten el valor de otra, la correcta primero. */
function sinRepetidas(lista) {
  var vistas = {};
  return lista.filter(function (o) {
    var k = String(o.valor);
    var nueva = !vistas[k];
    vistas[k] = true;
    return nueva;
  });
}

/* Las opciones de cuantos identificadores cambian dentro del contenedor. */
function opcionesDistintos() {
  var real = cuantosDistintos();
  return sinRepetidas([
    { valor: real, clave: "correcta", razon: explicarDistintos(true, real, real) },
    { valor: NS.length, clave: "todos",
      razon: "No, y es el error que vale la pena ver: el de usuario trae el mismo número a " +
        "los dos lados (" + NS[4].anfitrion + "). Docker crea un namespace nuevo de pid, " +
        "net, mnt y uts, y deja el de usuario como estaba." },
    { valor: distintosConRedDelAnfitrion(), clave: "red",
      razon: "Son " + distintosConRedDelAnfitrion() + " solo si el contenedor corre con " +
        "<code>--network host</code>, que comparte la pila de red. Aquí la red es propia y " +
        "también cambia su número." },
    { valor: 1, clave: "uno",
      razon: "Cada namespace se pide aparte y Docker pide cuatro de los cinco. No es solo el " +
        "de procesos: net, mnt y uts también traen número propio." }
  ]);
}

var RAZONES_USER = {
  correcta: "Eso es. El aislamiento por omisión no es una frontera de seguridad: el UID 0 de " +
    "dentro es el UID 0 de fuera, y lo único que lo separa del sistema de archivos del " +
    "anfitrión es el namespace de montaje. El modo sin privilegios es el que corrige esa fila.",
  suerte: "No es coincidencia. Docker crea un namespace nuevo de pid, net, mnt y uts, y deja " +
    "el de usuario tal como estaba, así que el número es por fuerza el mismo.",
  root: "Al contrario: dentro hay <code>root</code>, y es el mismo <code>root</code> de la " +
    "máquina. Por eso un proceso que se escape del montaje se escapa con todos los permisos.",
  bug: "Es el comportamiento por omisión de cualquier instalación. Cambiarlo es lo que hace " +
    "el modo sin privilegios, donde el <code>root</code> de dentro corresponde a un usuario " +
    "sin permisos fuera."
};

var RAZONES_HOST = {
  correcta: "Así es: la bandera quita ese namespace y deja los demás. El contenedor comparte " +
    "interfaces y puertos con la máquina, de modo que <code>-p</code> deja de tener sentido, " +
    "y sigue teniendo su propio árbol de procesos, su montaje y su nombre. Quedan " +
    distintosConRedDelAnfitrion() + " identificadores distintos de " + NS.length + ".",
  todos: "Solo uno. Cada namespace se pide aparte, y la bandera pide el de red. Para " +
    "compartir el árbol de procesos hace falta <code>--pid=host</code>, que es otra bandera.",
  ninguno: "Sí cambia, y de raíz: con la pila del anfitrión no hay nada que mapear. El " +
    "servicio queda escuchando en el puerto de la máquina, sin traducción de por medio.",
  pid: "Son independientes. Un contenedor puede compartir la red y mantener su árbol de " +
    "procesos, y al revés. El núcleo numera cada namespace por separado."
};

function razonMecanismo(indice, elegida) {
  var m = MECANISMOS[indice];
  if (esCorrecta(indice, elegida)) {
    return "Sí: " + m.donde + ".";
  }
  if (m.clave === "cgroup") {
    return "Es cgroup: se lee en " + m.donde + ". El namespace cambiaría lo que el proceso " +
      "ve, no cuánto le toca.";
  }
  return "Es namespace: " + m.donde + ". El cgroup limitaría el consumo, no lo que el " +
    "proceso alcanza a mirar.";
}

/* ---------- pintado y conexiones ---------- */

function filasNs(destapado) {
  return NS.map(function (f) {
    return [f.nombre, f.que, String(f.anfitrion), String(f.contenedor),
      destapado ? (esDistinto(f) ? "distinto" : "el mismo") : "?"];
  });
}

function iniciar() {
  var destapado = false;
  var respuestas = new Array(MECANISMOS.length);

  function pintarNs() {
    document.getElementById("cuerpo-ns").innerHTML = filasNs(destapado).map(function (f) {
      var ultima = destapado
        ? (f[4] === "distinto" ? f[4] : "<b>" + f[4] + "</b>")
        : "<span class=\"pend\">?</span>";
      return "<tr><td><code>" + f[0] + "</code></td><td style=\"text-align:left\">" + f[1] +
        "</td><td><code>" + f[2] + "</code></td><td><code>" + f[3] + "</code></td><td>" +
        ultima + "</td></tr>";
    }).join("");
    Motor.pintarChips("chips-ns", [
      { texto: "namespaces leídos", valor: NS.length },
      { texto: "distintos en el contenedor", valor: destapado ? cuantosDistintos() : "?",
        cuenta: true },
      { texto: "compartidos con el anfitrión",
        valor: destapado ? compartidos().join(", ") : "?" }
    ]);
  }

  function pintarMec() {
    document.getElementById("cuerpo-mec").innerHTML = MECANISMOS.map(function (m, i) {
      var elegida = respuestas[i];
      var celda = elegida === undefined
        ? "<span class=\"pend\">sin clasificar</span>"
        : (esCorrecta(i, elegida) ? "" : "<b>") + razonMecanismo(i, elegida) +
          (esCorrecta(i, elegida) ? "" : "</b>");
      return "<tr><td style=\"text-align:left\">" + m.pregunta + "</td>" +
        "<td><div class=\"opciones\" style=\"justify-content:center\">" +
        "<button data-fila=\"" + i + "\" data-clave=\"namespace\"" +
        (elegida === "namespace" ? " class=\"primario\"" : "") + ">namespace</button>" +
        "<button data-fila=\"" + i + "\" data-clave=\"cgroup\"" +
        (elegida === "cgroup" ? " class=\"primario\"" : "") + ">cgroup</button></div></td>" +
        "<td style=\"text-align:left\">" + celda + "</td></tr>";
    }).join("");
    document.getElementById("progreso-mec").textContent =
      aciertos(respuestas) + " de " + MECANISMOS.length + " bien clasificadas";
    document.getElementById("nota-mec").hidden =
      aciertos(respuestas) < MECANISMOS.length;
    document.querySelectorAll("#cuerpo-mec button").forEach(function (b) {
      b.addEventListener("click", function () {
        respuestas[Number(b.dataset.fila)] = b.dataset.clave;
        pintarMec();
      });
    });
  }

  pintarNs();
  pintarMec();

  Motor.opcionesNumericas("op-distintos", "ver-distintos", opcionesDistintos);
  document.getElementById("op-distintos").addEventListener("click", function () {
    destapado = true;
    pintarNs();
  });

  Motor.conectarOpciones("op-user", "ver-user", RAZONES_USER);
  Motor.conectarOpciones("op-host", "ver-host", RAZONES_HOST);

  document.getElementById("btn-reiniciar-mec").addEventListener("click", function () {
    respuestas = new Array(MECANISMOS.length);
    pintarMec();
  });
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    NS: NS, MECANISMOS: MECANISMOS,
    esDistinto: esDistinto, cuantosDistintos: cuantosDistintos, compartidos: compartidos,
    distintosConRedDelAnfitrion: distintosConRedDelAnfitrion, clavesDe: clavesDe,
    esCorrecta: esCorrecta, aciertos: aciertos, resueltas: resueltas,
    filasNs: filasNs, razonMecanismo: razonMecanismo,
    explicarDistintos: explicarDistintos,
    RAZONES_USER: RAZONES_USER, RAZONES_HOST: RAZONES_HOST
  };
}
