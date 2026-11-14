if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* El ciclo del dia a dia sobre el sistema de la sesion: web, db y cache, con
   un solo volumen nombrado, el de db. Las salidas y las cifras son las de la
   corrida del deck.                                                          */

var PROYECTO = "proyecto";
var SERVICIOS = ["web", "db", "cache"];
var VOLUMEN = "pgdata";        /* lo declara solo db */
var FILAS_MARCADAS = 2;        /* los dos INSERT antes de bajar el sistema */
var VISITAS_ANTES = 2;         /* el contador de Redis cuando se baja */
var VISITAS_DESPUES = 1;       /* y con lo que contesta al volver a levantar */

var EFECTOS = [
  { clave: "mira", rotulo: "solo mira" },
  { clave: "crea", rotulo: "crea y arranca" },
  { clave: "para", rotulo: "para o reinicia" },
  { clave: "borra", rotulo: "borra" }
];

var ORDENES = [
  { orden: "docker compose ps", efecto: "mira",
    razon: "Lista los servicios con su estado y sus puertos, y nada más." },
  { orden: "docker compose logs -f web", efecto: "mira",
    razon: "Sigue el registro de <code>web</code> en vivo. Se sale con Ctrl-C y el servicio " +
      "queda como estaba." },
  { orden: "docker compose exec web sh", efecto: "mira",
    razon: "Abre un intérprete dentro del contenedor que ya está en marcha; el servicio " +
      "sigue atendiendo mientras se mira desde dentro." },
  { orden: "docker compose up -d", efecto: "crea",
    razon: "Crea y arranca en segundo plano lo que falte, y deja en paz lo que ya coincide " +
      "con el archivo." },
  { orden: "docker compose up -d --build", efecto: "crea",
    razon: "Lo mismo, reconstruyendo antes las imágenes que salen de un " +
      "<code>Dockerfile</code>, como la de <code>web</code>." },
  { orden: "docker compose restart web", efecto: "para",
    razon: "Para y vuelve a arrancar ese contenedor. Es el mismo contenedor, así que lo que " +
      "tenga escrito en su capa sigue ahí." },
  { orden: "docker compose stop && docker compose start", efecto: "para",
    razon: "Paran y arrancan los mismos contenedores, sin recrear ninguno." },
  { orden: "docker compose down", efecto: "borra",
    razon: "Borra los contenedores y la red del proyecto. Los volúmenes nombrados no se " +
      "tocan." },
  { orden: "docker compose down -v", efecto: "borra",
    razon: "Borra lo mismo que <code>down</code> y además los volúmenes del proyecto, con " +
      "los datos que tengan dentro." }
];

/* Los tres datos del sistema y si la bandera -v cambia su suerte. */
var DATOS = [
  { dato: "contador <code>visitas</code>", donde: "Redis, sin volumen declarado",
    trasDown: "vuelve a 1", cambia: false,
    razon: "Sin volumen no hay nada que <code>-v</code> pueda borrar: el contador ya " +
      "empezaba de cero con el <code>down</code> a secas." },
  { dato: "filas de <code>visitas_log</code>", donde: "volumen <code>proyecto_pgdata</code>",
    trasDown: "siguen las 2", cambia: true,
    razon: "Aquí sí. La bandera elimina el volumen y con él las dos filas; sobre el proyecto " +
      "de una base en producción borra los datos sin preguntar." },
  { dato: "red <code>app-net</code>", donde: "la crea Compose al levantar",
    trasDown: "se rehace igual", cambia: false,
    razon: "La red se la lleva el <code>down</code> y la vuelve a crear el <code>up</code>, " +
      "con la bandera o sin ella." }
];

var RESPUESTAS_V = [
  { clave: "igual", rotulo: "igual que con down" },
  { clave: "cambia", rotulo: "-v lo cambia" }
];

/* ---------- las cuentas ---------- */

function efectoDe(orden) {
  var hallada = null;
  ORDENES.forEach(function (o) { if (o.orden === orden) { hallada = o.efecto; } });
  return hallada;
}

function cuantosEfecto(clave) {
  return ORDENES.filter(function (o) { return o.efecto === clave; }).length;
}

/* Las que se llevan los volumenes: una sola de las nueve. */
function conVolumenes() {
  return ORDENES.filter(function (o) { return o.orden.indexOf("-v") >= 0; }).length;
}

function aciertosOrdenes(respuestas) {
  return respuestas.filter(function (r, i) {
    return r !== undefined && r === ORDENES[i].efecto;
  }).length;
}

function cambiaConV(indice) { return DATOS[indice].cambia; }

function cuantosCambiaV() {
  return DATOS.filter(function (d) { return d.cambia; }).length;
}

function aciertosDatos(respuestas) {
  return respuestas.filter(function (r, i) {
    return r !== undefined && r === (DATOS[i].cambia ? "cambia" : "igual");
  }).length;
}

function nombreVolumen(proyecto) { return proyecto + "_" + VOLUMEN; }

/* Un volumen por proyecto, porque el nombre lleva el del proyecto delante. */
function volumenesDe(proyectos) {
  return proyectos.map(nombreVolumen).length;
}

function filasTrasDownUp() { return FILAS_MARCADAS; }

function contadorTrasDownUp() { return VISITAS_DESPUES; }

/* ---------- veredictos y textos ---------- */

function razonOrden(indice, elegida) {
  var o = ORDENES[indice];
  if (elegida === o.efecto) { return o.razon; }
  var rotulo = "";
  EFECTOS.forEach(function (e) { if (e.clave === o.efecto) { rotulo = e.rotulo; } });
  return "Es de las de <b>" + rotulo + "</b>. " + o.razon;
}

function razonDato(indice, elegida) {
  var d = DATOS[indice];
  if (elegida === (d.cambia ? "cambia" : "igual")) { return d.razon; }
  return (d.cambia ? "Con la bandera cambia. " : "Da lo mismo. ") + d.razon;
}

function opcionesFilas() {
  var real = filasTrasDownUp();
  return [
    { valor: real, clave: "correcta",
      razon: "Eso es. Las dos filas están en <code>" + nombreVolumen(PROYECTO) + "</code>, " +
        "que <code>docker volume ls</code> muestra intacto después del <code>down</code>. El " +
        "contenedor nuevo de <code>db</code> monta ese mismo volumen y encuentra la tabla " +
        "con sus dos filas." },
    { valor: 0, clave: "borradas",
      razon: "Cero es lo que deja un <code>down -v</code>, que elimina el volumen. El " +
        "<code>down</code> a secas se lleva contenedores y red." },
    { valor: VISITAS_DESPUES, clave: "contador",
      razon: "Uno es lo que marca el contador de visitas, que vive en Redis y no tiene " +
        "volumen. Las filas de la tabla van por otro camino." },
    { valor: real * 2, clave: "duplicadas",
      razon: "Levantar otra vez no repite los <code>INSERT</code>: esas órdenes se corrieron " +
        "una sola vez y lo que queda guardado es su resultado." }
  ];
}

function opcionesContador() {
  return [
    { valor: contadorTrasDownUp(), clave: "correcta",
      razon: "Eso es. <code>cache</code> no declara volumen, así que al recrear el " +
        "contenedor Redis arranca vacío y la petición de ahora es la primera que cuenta." },
    { valor: VISITAS_ANTES, clave: "persiste",
      razon: "Dos es donde quedó el contador antes de bajar el sistema. Para reencontrarlo " +
        "haría falta un volumen en <code>cache</code>, y el archivo no se lo declara." },
    { valor: VISITAS_ANTES + 1, clave: "sigue",
      razon: "Tres sería sumar esta petición a las dos de antes, y eso pide que Redis las " +
        "hubiera guardado en algún sitio que sobreviviera al contenedor." },
    { valor: 0, clave: "cero",
      razon: "El servicio suma la visita antes de contestar, así que la primera petición ya " +
        "devuelve uno." }
  ];
}

function opcionesVolumenes() {
  return [
    { valor: volumenesDe([PROYECTO, "staging"]), clave: "correcta",
      razon: "Eso es: <code>" + nombreVolumen(PROYECTO) + "</code> y <code>" +
        nombreVolumen("staging") + "</code>. El volumen se nombra con el proyecto por " +
        "delante, así que las dos copias guardan sus datos aparte." },
    { valor: 1, clave: "compartido",
      razon: "Uno sería si el nombre saliera del archivo a secas. Lleva el del proyecto " +
        "delante, y por eso <code>-p</code> alcanza para dos copias que no se pisan." },
    { valor: 0, clave: "efimero",
      razon: "El volumen se crea con el contenedor que lo monta y se queda en la máquina " +
        "aunque el contenedor ya no esté. De eso vive la marca que sobrevivió al " +
        "<code>down</code>." },
    { valor: SERVICIOS.length, clave: "porservicio",
      razon: "Tres sería un volumen por servicio del archivo. Solo <code>db</code> declara " +
        "uno; <code>web</code> y <code>cache</code> escriben en la capa del contenedor." }
  ];
}

var RAZONES_POR_QUE = {
  correcta: "Eso es. El volumen lo declara <code>db</code> con <code>volumes: [" + VOLUMEN +
    ":/var/lib/postgresql/data]</code>, y Compose lo crea aparte de los contenedores. " +
    "Borrarlo cuesta un <code>down -v</code> escrito a propósito.",
  imagen: "La capa de la imagen es de solo lectura, y lo que el contenedor escribe encima se " +
    "va con el contenedor. Si los datos vivieran ahí, el <code>down</code> se los habría " +
    "llevado.",
  contenedor: "<code>down</code> sí los borra: después de bajarlo, <code>docker compose " +
    "ps</code> no muestra ninguno y el <code>up</code> siguiente crea otros. Lo que se " +
    "reencuentra es el volumen.",
  red: "La red se rehace, cierto, pero vacía: solo sirve para que los servicios se vuelvan a " +
    "ver por nombre. Los datos no pasan por ahí."
};

var RAZONES_REDIS = {
  correcta: "Eso es. Con el volumen montado en <code>/data</code>, lo que Redis escriba queda " +
    "fuera del contenedor y el contador sigue donde iba, igual que las filas de la base.",
  depends: "<code>depends_on</code> ordena el arranque de los servicios y no mueve datos de " +
    "uno a otro. Cada servicio guarda lo suyo donde se lo declare.",
  stop: "Eso evita bajar el sistema, que no es lo mismo que sobrevivir a bajarlo: en cuanto " +
    "el contenedor se recree, con un <code>down</code> o con un cambio en el archivo, Redis " +
    "arranca vacío.",
  imagen: "La imagen sirve como está. Lo que falta es un sitio donde el archivo sobreviva al " +
    "contenedor, y ese sitio es el volumen."
};

var RAZONES_PREFIJO = {
  correcta: "Eso es. Compose usa el nombre de la carpeta como nombre del proyecto, y lo pone " +
    "delante de cada contenedor, de la red y de los volúmenes. Cambiar la carpeta de nombre " +
    "cambia el prefijo.",
  servicio: "El nombre del servicio está, pero en el medio: <code>proyecto-web-1</code> es " +
    "proyecto, servicio y número de réplica. El prefijo viene de otro sitio.",
  imagen: "La imagen de <code>web</code> también se llama con el proyecto por delante, y por " +
    "la misma razón. <code>db</code> y <code>cache</code> no construyen imagen y llevan " +
    "igual el prefijo.",
  red: "La red del archivo se llama <code>app-net</code> y en la máquina aparece como " +
    "<code>proyecto_app-net</code>: también la nombra el proyecto, no al revés."
};

var RAZONES_DOS_COPIAS = {
  correcta: "Eso es. Con otro nombre de proyecto, Compose levanta el archivo entero otra vez: " +
    "contenedores propios, red propia y volúmenes propios. Es la forma de tener dos copias en " +
    "la misma máquina.",
  mismos: "No los renombra: los contenedores de un proyecto pertenecen a ese proyecto y " +
    "siguen ahí. La segunda orden crea otros.",
  rama: "<code>-p</code> no mira el repositorio. El archivo que se levanta es el de la " +
    "carpeta donde se corre la orden.",
  perfil: "Escoger servicios es trabajo de <code>--profile</code>, otra bandera. " +
    "<code>-p</code> fija el nombre del proyecto y con él el prefijo y el aislamiento."
};

/* ---------- pintado y conexiones ---------- */

function iniciar() {
  var respuestas = new Array(ORDENES.length);
  var datos = new Array(DATOS.length);

  function pintarOrdenes() {
    document.getElementById("cuerpo-ordenes").innerHTML = ORDENES.map(function (o, i) {
      var elegida = respuestas[i];
      var bien = elegida === o.efecto;
      var botones = EFECTOS.map(function (e) {
        return "<button data-fila=\"" + i + "\" data-efecto=\"" + e.clave + "\"" +
          (elegida === e.clave ? " class=\"primario\"" : "") + ">" + e.rotulo + "</button>";
      }).join("");
      var celda = elegida === undefined
        ? "<span class=\"pend\">sin responder</span>"
        : (bien ? "" : "<b>") + razonOrden(i, elegida) + (bien ? "" : "</b>");
      return "<tr><td style=\"text-align:left\"><code>" + o.orden + "</code></td>" +
        "<td><div class=\"opciones\" style=\"justify-content:center\">" + botones +
        "</div></td><td style=\"text-align:left\">" + celda + "</td></tr>";
    }).join("");
    document.getElementById("progreso-ordenes").textContent =
      aciertosOrdenes(respuestas) + " de " + ORDENES.length + " bien";
    var todas = aciertosOrdenes(respuestas) === ORDENES.length;
    Motor.pintarChips("chips-ordenes", [
      { texto: "órdenes", valor: ORDENES.length },
      { texto: "solo miran", valor: todas ? cuantosEfecto("mira") : "?" },
      { texto: "borran contenedores", valor: todas ? cuantosEfecto("borra") : "?",
        cuenta: true },
      { texto: "se llevan el volumen", valor: todas ? conVolumenes() : "?", cuenta: true }
    ]);
    document.getElementById("nota-ordenes").hidden = !todas;
    document.querySelectorAll("#cuerpo-ordenes button").forEach(function (b) {
      b.addEventListener("click", function () {
        respuestas[Number(b.dataset.fila)] = b.dataset.efecto;
        pintarOrdenes();
      });
    });
  }

  function pintarDatos() {
    document.getElementById("cuerpo-datos").innerHTML = DATOS.map(function (d, i) {
      var elegida = datos[i];
      var bien = elegida === (d.cambia ? "cambia" : "igual");
      var botones = RESPUESTAS_V.map(function (r) {
        return "<button data-fila=\"" + i + "\" data-v=\"" + r.clave + "\"" +
          (elegida === r.clave ? " class=\"primario\"" : "") + ">" + r.rotulo + "</button>";
      }).join("");
      var celda = elegida === undefined
        ? "<span class=\"pend\">sin responder</span>"
        : (bien ? "" : "<b>") + razonDato(i, elegida) + (bien ? "" : "</b>");
      return "<tr><td style=\"text-align:left\">" + d.dato + "</td>" +
        "<td style=\"text-align:left\">" + d.donde + "</td><td>" + d.trasDown + "</td>" +
        "<td><div class=\"opciones\" style=\"justify-content:center\">" + botones +
        "</div></td><td style=\"text-align:left\">" + celda + "</td></tr>";
    }).join("");
    document.getElementById("progreso-datos").textContent =
      aciertosDatos(datos) + " de " + DATOS.length + " bien";
    document.querySelectorAll("#cuerpo-datos button").forEach(function (b) {
      b.addEventListener("click", function () {
        datos[Number(b.dataset.fila)] = b.dataset.v;
        pintarDatos();
      });
    });
  }

  pintarOrdenes();
  pintarDatos();

  Motor.opcionesNumericas("op-filas", "ver-filas", opcionesFilas);
  Motor.opcionesNumericas("op-contador", "ver-contador", opcionesContador);
  Motor.opcionesNumericas("op-volumenes", "ver-volumenes", opcionesVolumenes);

  Motor.conectarOpciones("op-por-que", "ver-por-que", RAZONES_POR_QUE);
  Motor.conectarOpciones("op-redis", "ver-redis", RAZONES_REDIS);
  Motor.conectarOpciones("op-prefijo", "ver-prefijo", RAZONES_PREFIJO);
  Motor.conectarOpciones("op-dos-copias", "ver-dos-copias", RAZONES_DOS_COPIAS);

  document.getElementById("btn-reiniciar-ordenes").addEventListener("click", function () {
    respuestas = new Array(ORDENES.length);
    pintarOrdenes();
  });
  document.getElementById("btn-reiniciar-datos").addEventListener("click", function () {
    datos = new Array(DATOS.length);
    pintarDatos();
  });
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PROYECTO: PROYECTO, SERVICIOS: SERVICIOS, VOLUMEN: VOLUMEN,
    FILAS_MARCADAS: FILAS_MARCADAS, VISITAS_ANTES: VISITAS_ANTES,
    VISITAS_DESPUES: VISITAS_DESPUES,
    EFECTOS: EFECTOS, ORDENES: ORDENES, DATOS: DATOS, RESPUESTAS_V: RESPUESTAS_V,
    efectoDe: efectoDe, cuantosEfecto: cuantosEfecto, conVolumenes: conVolumenes,
    aciertosOrdenes: aciertosOrdenes, cambiaConV: cambiaConV, cuantosCambiaV: cuantosCambiaV,
    aciertosDatos: aciertosDatos, nombreVolumen: nombreVolumen, volumenesDe: volumenesDe,
    filasTrasDownUp: filasTrasDownUp, contadorTrasDownUp: contadorTrasDownUp,
    razonOrden: razonOrden, razonDato: razonDato,
    opcionesFilas: opcionesFilas, opcionesContador: opcionesContador,
    opcionesVolumenes: opcionesVolumenes,
    RAZONES_POR_QUE: RAZONES_POR_QUE, RAZONES_REDIS: RAZONES_REDIS,
    RAZONES_PREFIJO: RAZONES_PREFIJO, RAZONES_DOS_COPIAS: RAZONES_DOS_COPIAS
  };
}
