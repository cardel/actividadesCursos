if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Del Compose de una maquina al cluster de Swarm: limites de Compose plano,
   reparto de responsabilidades entre manager y worker, y lo que queda tras
   un docker swarm init en una sola maquina. */

var ROLES = [
  { clave: "manager", rotulo: "manager" },
  { clave: "worker", rotulo: "worker" },
  { clave: "ambos", rotulo: "los dos" }
];

var PAPELES = [
  { responsabilidad: "Guardar el estado del clúster y votar en el quórum de Raft",
    clave: "manager",
    razon: "Del manager. El estado replicado y el quórum son del plano de control, y un " +
      "worker no participa en esa votación." },
  { responsabilidad: "Recibir del líder la tarea <code>web.2</code> y mantenerla corriendo",
    clave: "ambos",
    razon: "De los dos. Ejecutar tareas es lo propio del worker, y un manager con el rol " +
      "<em>both</em> también las recibe." },
  { responsabilidad: "Atender <code>docker service create</code> y decidir en qué nodo cae " +
      "cada tarea",
    clave: "manager",
    razon: "Del manager. Aceptar la orden y programar las tareas es trabajo del líder; el " +
      "worker se entera cuando le llega la suya." },
  { responsabilidad: "Aparecer en <code>docker node ls</code> sin nada en la columna " +
      "<code>MANAGER STATUS</code>",
    clave: "worker",
    razon: "Del worker. Un manager se delata ahí con <code>Leader</code> o " +
      "<code>Reachable</code>; el worker deja la casilla vacía." },
  { responsabilidad: "Unirse al clúster con el token que entrega <code>docker swarm " +
      "join-token</code>",
    clave: "ambos",
    razon: "De los dos. Hay un token por rol, y con el de manager el nodo entra al plano de " +
      "control en vez de quedarse ejecutando tareas." }
];

/* ---------- las cuentas ---------- */

function cuantosConRol(clave) {
  return PAPELES.filter(function (p) { return p.clave === clave; }).length;
}

function aciertosPapeles(respuestas) {
  return respuestas.filter(function (r, i) {
    return r !== undefined && r === PAPELES[i].clave;
  }).length;
}

function completo(respuestas) {
  return aciertosPapeles(respuestas) === PAPELES.length;
}

function razonPapel(indice, elegida) {
  var p = PAPELES[indice];
  if (elegida === p.clave) { return p.razon; }
  return "Es de otro. " + p.razon;
}

/* ---------- razones de cada bloque ---------- */

var RAZONES_LIMITE = {
  correcta: "Eso es. Compose plano no trae actualización progresiva ni rollback: " +
    "<code>up -d</code> recrea el servicio afectado y, si la imagen nueva no sirve, hay que " +
    "editar el archivo y volver a subirlo a mano.",
  varios: "Eso sí lo hace, y es su razón de ser: un archivo describe los tres servicios, su " +
    "red y su orden de arranque.",
  depende: "Eso sí lo hace, con <code>depends_on</code> y " +
    "<code>condition: service_healthy</code>, que es justo lo que espera el healthcheck.",
  volumen: "Eso sí lo hace. El volumen con nombre se declara en el mismo archivo y sobrevive " +
    "a <code>down</code> mientras no se pase <code>-v</code>."
};

var RAZONES_CAIDA = {
  correcta: "Eso es. El líder ve que faltan réplicas para llegar a las pedidas y reprograma " +
    "la tarea en un nodo que siga vivo. Eso es lo que Compose no tiene: no hay a dónde mover " +
    "nada cuando solo existe una máquina.",
  espera: "Esperar a que el nodo vuelva es lo que haría una máquina sola. El clúster tiene " +
    "otros nodos y el líder usa uno de ellos sin que nadie lo pida.",
  mano: "Escalar a mano no hace falta: las réplicas pedidas siguen siendo tres y el líder " +
    "trabaja para que se cumplan.",
  igual: "No es lo mismo. <code>restart: always</code> vuelve a levantar el contenedor en la " +
    "misma máquina, y si esa máquina está apagada no hay nada que reiniciar."
};

var RAZONES_ARCHIVO = {
  correcta: "Eso es. El stack usa el mismo archivo con una sección <code>deploy</code> para " +
    "réplicas, recursos, política de reinicio y restricciones de ubicación.",
  otro: "No hay que cambiar de formato: Swarm lee el archivo de Compose y solo mira además " +
    "lo que haya bajo <code>deploy</code>.",
  ordenes: "<code>docker service create</code> sirve para una prueba rápida, pero el " +
    "despliegue del clúster sigue siendo declarativo con <code>docker stack deploy</code>.",
  local: "Al contrario: <code>deploy</code> es la parte que solo tiene efecto en el clúster, " +
    "y Compose plano la ignora."
};

var RAZONES_LIDER = {
  correcta: "Eso es. El estado se replica por Raft entre los managers, y con un solo manager " +
    "la mayoría es él mismo, así que la elección la gana sin competencia.",
  primero: "El papel no se hereda al llegar otro nodo. El asterisco marca desde qué nodo se " +
    "corrió la orden, y eso es otra cosa que ser líder.",
  tareas: "Ejecutar tareas no lo decide ese papel: cualquier worker las ejecuta, y un manager " +
    "también puede hacerlo.",
  provisional: "Con tres managers hay una elección de verdad, pero el líder de ahora no es un " +
    "interino: ya manda sobre el clúster y acepta órdenes."
};

var RAZONES_DIRECCION = {
  correcta: "Eso es. Sin <code>--advertise-addr</code> el motor escoge la dirección de la " +
    "interfaz por la que sale el tráfico y la escribe en el comando de unión.",
  token: "El token autentica al que se une; la dirección y el puerto van aparte, al final de " +
    "la misma línea.",
  docker0: "El puente de los contenedores no sirve para esto: la dirección tiene que ser " +
    "alcanzable desde las otras máquinas, no desde dentro de esta.",
  reservada: "Swarm no reserva direcciones de la red local. La escogió entre las que ya tenía " +
    "la máquina, y por eso conviene fijarla cuando hay varias interfaces."
};

var RAZONES_IP = {
  correcta: "Eso es. <code>--advertise-addr</code> es la dirección por la que los demás " +
    "managers van a buscar a este nodo, y queda guardada. Si cambia, siguen llamando a la " +
    "vieja y el motor puede estar perfectamente vivo del otro lado.",
  solo: "El token vale para unirse, no para avisar de una mudanza. Nadie reparte la dirección " +
    "nueva entre los pares.",
  para: "El clúster no se detiene: con tres managers, dos siguen formando mayoría y el plano " +
    "de control sigue en pie.",
  worker: "El rol no cambia por quedar incomunicado. El nodo sigue siendo manager, solo que " +
    "sus pares no lo alcanzan."
};

/* ---------- pintado y conexiones ---------- */

function iniciar() {
  var papeles = new Array(PAPELES.length);

  function pintarPapeles() {
    document.getElementById("cuerpo-papeles").innerHTML = PAPELES.map(function (p, i) {
      var elegida = papeles[i];
      var bien = elegida === p.clave;
      var botones = ROLES.map(function (r) {
        return "<button data-fila=\"" + i + "\" data-rol=\"" + r.clave + "\"" +
          (elegida === r.clave ? " class=\"primario\"" : "") + ">" + r.rotulo + "</button>";
      }).join("");
      var celda = elegida === undefined
        ? "<span class=\"pend\">sin responder</span>"
        : (bien ? "" : "<b>") + razonPapel(i, elegida) + (bien ? "" : "</b>");
      return "<tr><td style=\"text-align:left\">" + p.responsabilidad + "</td>" +
        "<td><div class=\"opciones\" style=\"justify-content:center\">" + botones +
        "</div></td><td style=\"text-align:left\">" + celda + "</td></tr>";
    }).join("");
    document.getElementById("progreso-papeles").textContent =
      aciertosPapeles(papeles) + " de " + PAPELES.length + " bien";
    Motor.pintarChips("chips-papeles", [
      { texto: "responsabilidades", valor: PAPELES.length },
      { texto: "solo del manager",
        valor: completo(papeles) ? cuantosConRol("manager") : "?", cuenta: true },
      { texto: "de los dos",
        valor: completo(papeles) ? cuantosConRol("ambos") : "?", cuenta: true }
    ]);
    document.getElementById("nota-papeles").hidden = !completo(papeles);
    document.querySelectorAll("#cuerpo-papeles button").forEach(function (b) {
      b.addEventListener("click", function () {
        papeles[Number(b.dataset.fila)] = b.dataset.rol;
        pintarPapeles();
      });
    });
  }

  pintarPapeles();

  Motor.conectarOpciones("op-limite", "ver-limite", RAZONES_LIMITE);
  Motor.conectarOpciones("op-caida", "ver-caida", RAZONES_CAIDA);
  Motor.conectarOpciones("op-archivo", "ver-archivo", RAZONES_ARCHIVO);
  Motor.conectarOpciones("op-lider", "ver-lider", RAZONES_LIDER);
  Motor.conectarOpciones("op-direccion", "ver-direccion", RAZONES_DIRECCION);
  Motor.conectarOpciones("op-ip", "ver-ip", RAZONES_IP);

  document.getElementById("btn-reiniciar-papeles").addEventListener("click", function () {
    papeles = new Array(PAPELES.length);
    pintarPapeles();
  });
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ROLES: ROLES, PAPELES: PAPELES,
    cuantosConRol: cuantosConRol, aciertosPapeles: aciertosPapeles,
    completo: completo, razonPapel: razonPapel,
    RAZONES_LIMITE: RAZONES_LIMITE, RAZONES_CAIDA: RAZONES_CAIDA,
    RAZONES_ARCHIVO: RAZONES_ARCHIVO, RAZONES_LIDER: RAZONES_LIDER,
    RAZONES_DIRECCION: RAZONES_DIRECCION, RAZONES_IP: RAZONES_IP
  };
}
