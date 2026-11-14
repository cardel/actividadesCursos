if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Tres replicas de nginx:alpine en un swarm de tres nodos: la columna de
   replicas, la frontera entre el servicio y la tarea, el reparto que hizo el
   planificador y el puerto que responde en los tres nodos. */

var SERVICIO = {
  nombre: "web",
  replicas: 3,
  imagen: "nginx:alpine",
  puertoPublicado: 8080,
  puertoContenedor: 80
};

/* La salida de docker service ps de la sesion. */
var TAREAS = [
  { tarea: "web.1", nodo: "nodo3", papel: "worker" },
  { tarea: "web.2", nodo: "cardel-desktop", papel: "manager" },
  { tarea: "web.3", nodo: "nodo2", papel: "worker" }
];

var VISTAS = [
  { clave: "ls", rotulo: "service ls" },
  { clave: "ps", rotulo: "service ps" }
];

var ORDENES = [
  { dato: "Cuántas réplicas están activas sobre las pedidas", clave: "ls",
    razon: "En <code>service ls</code>: la columna <code>REPLICAS</code> resume el servicio " +
      "en un solo par de números." },
  { dato: "En qué nodo quedó <code>web.2</code>", clave: "ps",
    razon: "En <code>service ps</code>: el nodo es un dato de la tarea, y el servicio no " +
      "tiene uno solo que dar." },
  { dato: "El puerto publicado, <code>*:8080-&gt;80/tcp</code>", clave: "ls",
    razon: "En <code>service ls</code>: el puerto es del servicio, así que aparece una vez " +
      "aunque haya tres réplicas." },
  { dato: "Hace cuánto está corriendo cada réplica", clave: "ps",
    razon: "En <code>service ps</code>: cada tarea arrancó en su momento, y ahí se ve que " +
      "una lo hizo dos segundos después." },
  { dato: "El modo <code>replicated</code> y la imagen del servicio", clave: "ls",
    razon: "En <code>service ls</code>: son parte de la definición del servicio, igual para " +
      "todas sus tareas." }
];

/* ---------- las cuentas ---------- */

function nodosConTarea() {
  return TAREAS.map(function (t) { return t.nodo; }).filter(function (n, i, lista) {
    return lista.indexOf(n) === i;
  }).length;
}

function tareasEnManager() {
  return TAREAS.filter(function (t) { return t.papel === "manager"; }).length;
}

function lectura(activas) {
  return activas + "/" + SERVICIO.replicas;
}

function convergido(activas) {
  return activas === SERVICIO.replicas;
}

function aciertosOrdenes(respuestas) {
  return respuestas.filter(function (r, i) {
    return r !== undefined && r === ORDENES[i].clave;
  }).length;
}

function razonOrden(indice, elegida) {
  var o = ORDENES[indice];
  if (elegida === o.clave) { return o.razon; }
  return "En la otra. " + o.razon;
}

/* ---------- razones de cada bloque ---------- */

var RAZONES_REPLICAS = {
  correcta: "Eso es. El primero son las tareas que ya corren y el segundo las que se pidieron " +
    "con <code>--replicas 3</code>. Iguales, el servicio convergió.",
  nodos: "Los nodos del clúster no entran en esa columna. Con tres réplicas en un clúster de " +
    "diez nodos la columna seguiría diciendo <code>3/3</code>.",
  cupo: "Swarm no publica ahí ningún cupo por nodo. Lo que limita el reparto son los recursos " +
    "y las restricciones de ubicación, y eso no se lee en esta columna.",
  stack: "El stack no cuenta aquí: la línea es de un servicio, y las réplicas que se comparan " +
    "son las de ese servicio."
};

var RAZONES_ARRANQUE = {
  correcta: "Eso es. Mientras una tarea arranca hay dos activas de tres pedidas, y la orden de " +
    "creación todavía no imprime <code>converged</code>.",
  pedidas: "El segundo número es el de las pedidas; el primero no, y es justo el que se mueve " +
    "mientras las tareas arrancan.",
  aviso: "<code>service ps</code> dice en qué nodo y en qué estado quedó cada tarea, pero la " +
    "cuenta de las que faltan ya sale en <code>service ls</code>.",
  vacia: "La columna no se vacía: va mostrando el avance, y eso es lo que permite ver si el " +
    "servicio se quedó a medias."
};

var RAZONES_REPARTO = {
  correcta: "Eso es. El planificador del líder escoge nodo para cada tarea y busca " +
    "repartirlas, de modo que la caída de una máquina no se lleve el servicio entero.",
  alfabetico: "Por nombre no es: <code>web.1</code> cayó en <code>nodo3</code> y " +
    "<code>web.3</code> en <code>nodo2</code>.",
  bandera: "La bandera dice cuántas, no dónde. Con tres réplicas y dos nodos quedarían dos en " +
    "uno y una en el otro, y nadie cambia la bandera.",
  local: "El nodo donde se corre la orden no tiene prioridad: aquí se corrió en " +
    "<code>cardel-desktop</code> y la primera tarea se fue a <code>nodo3</code>."
};

var RAZONES_MANAGER = {
  correcta: "Eso es. Un manager con el rol <em>both</em> ejecuta tareas como cualquier worker, " +
    "y por eso un swarm de una sola máquina puede servir un servicio. Para reservarlo al plano " +
    "de control se pide <code>node.role == worker</code> en la ubicación.",
  prohibido: "Sí que las ejecuta, y la salida lo muestra: <code>web.2</code> está " +
    "<code>Running</code> en el manager.",
  azar: "No hay descuido. El planificador cuenta al manager entre los nodos disponibles " +
    "mientras nadie le diga lo contrario.",
  lider: "No hay nada que ate la segunda réplica al líder. El reparto de esta corrida pudo " +
    "haber salido en otro orden."
};

var RAZONES_PUERTO_SERVICIO = {
  correcta: "Eso es. El <code>*</code> del puerto publicado es eso: el 8080 responde en " +
    "cualquier nodo del clúster y la petición se enruta hacia alguna réplica, esté donde esté.",
  manager: "El puerto no se publica en el manager, se publica en el servicio. Los tres nodos " +
    "atienden el 8080.",
  refused: "Publicar nodo por nodo es lo que habría que hacer con contenedores sueltos. El " +
    "servicio lo publica una vez para todo el clúster.",
  local: "No queda atado a la réplica del nodo: la petición que entra por " +
    "<code>nodo2</code> puede terminar en la réplica de <code>nodo3</code>."
};

var RAZONES_SCALE = {
  correcta: "Eso es. Las tres querrían el 8080 del anfitrión y solo una lo consigue; de ahí " +
    "que <code>--scale</code> sirva únicamente cuando el servicio no fija un puerto del " +
    "anfitrión.",
  turnos: "Compose puede correr varias réplicas, pero no reparte nada entre ellas: no hay " +
    "quién haga los turnos.",
  auto: "Compose no inventa puertos. Si se quiere un puerto por réplica hay que escribirlos, " +
    "y entonces cada réplica queda con su dirección propia.",
  comparten: "Dos procesos no comparten el mismo puerto del anfitrión: el segundo recibe un " +
    "error al pedirlo y el contenedor no arranca."
};

var RAZONES_BALANCEO = {
  correcta: "Eso es. Compose levanta las réplicas y ahí termina; delante va NGINX o HAProxy " +
    "con las tres como destino, que es el trabajo que Swarm ya trae hecho.",
  rango: "Con un rango cada réplica queda en su propio puerto, y el que llama sigue teniendo " +
    "que escoger uno. El reparto no aparece por eso.",
  overlay: "La red resuelve nombres y conecta contenedores; repartir peticiones entre réplicas " +
    "es otra cosa, y además <code>overlay</code> es del clúster.",
  nada: "Compose no reparte: corre las réplicas y deja el tráfico donde lo pongan. Es el " +
    "límite que obliga a poner algo delante o a pasar al clúster."
};

/* ---------- pintado y conexiones ---------- */

function iniciar() {
  var ordenes = new Array(ORDENES.length);

  function pintarOrdenes() {
    document.getElementById("cuerpo-ordenes").innerHTML = ORDENES.map(function (o, i) {
      var elegida = ordenes[i];
      var bien = elegida === o.clave;
      var botones = VISTAS.map(function (v) {
        return "<button data-fila=\"" + i + "\" data-vista=\"" + v.clave + "\"" +
          (elegida === v.clave ? " class=\"primario\"" : "") + ">" + v.rotulo + "</button>";
      }).join("");
      var celda = elegida === undefined
        ? "<span class=\"pend\">sin responder</span>"
        : (bien ? "" : "<b>") + razonOrden(i, elegida) + (bien ? "" : "</b>");
      return "<tr><td style=\"text-align:left\">" + o.dato + "</td>" +
        "<td><div class=\"opciones\" style=\"justify-content:center\">" + botones +
        "</div></td><td style=\"text-align:left\">" + celda + "</td></tr>";
    }).join("");
    document.getElementById("progreso-ordenes").textContent =
      aciertosOrdenes(ordenes) + " de " + ORDENES.length + " bien";
    document.querySelectorAll("#cuerpo-ordenes button").forEach(function (b) {
      b.addEventListener("click", function () {
        ordenes[Number(b.dataset.fila)] = b.dataset.vista;
        pintarOrdenes();
      });
    });
  }

  pintarOrdenes();

  Motor.conectarOpciones("op-replicas", "ver-replicas", RAZONES_REPLICAS);
  Motor.conectarOpciones("op-arranque", "ver-arranque", RAZONES_ARRANQUE);
  Motor.conectarOpciones("op-reparto", "ver-reparto", RAZONES_REPARTO);
  Motor.conectarOpciones("op-manager", "ver-manager", RAZONES_MANAGER);
  Motor.conectarOpciones("op-puerto-servicio", "ver-puerto-servicio", RAZONES_PUERTO_SERVICIO);
  Motor.conectarOpciones("op-scale", "ver-scale", RAZONES_SCALE);
  Motor.conectarOpciones("op-balanceo", "ver-balanceo", RAZONES_BALANCEO);

  document.getElementById("btn-reiniciar-ordenes").addEventListener("click", function () {
    ordenes = new Array(ORDENES.length);
    pintarOrdenes();
  });
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SERVICIO: SERVICIO, TAREAS: TAREAS, VISTAS: VISTAS, ORDENES: ORDENES,
    nodosConTarea: nodosConTarea, tareasEnManager: tareasEnManager,
    lectura: lectura, convergido: convergido,
    aciertosOrdenes: aciertosOrdenes, razonOrden: razonOrden,
    RAZONES_REPLICAS: RAZONES_REPLICAS, RAZONES_ARRANQUE: RAZONES_ARRANQUE,
    RAZONES_REPARTO: RAZONES_REPARTO, RAZONES_MANAGER: RAZONES_MANAGER,
    RAZONES_PUERTO_SERVICIO: RAZONES_PUERTO_SERVICIO, RAZONES_SCALE: RAZONES_SCALE,
    RAZONES_BALANCEO: RAZONES_BALANCEO
  };
}
