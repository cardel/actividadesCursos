if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Anatomia del compose.yml: las cuatro secciones de raiz, la diferencia entre
   referenciar y definir, y los contenedores que salen de tres servicios. El
   archivo y la salida de ps son los de 01-compose-basico. */

var SERVICIOS = ["web", "db", "cache"];
var REPLICAS_POR_OMISION = 1;

/* Lo que va en cada seccion de raiz, con una fila que no corresponde a ninguna. */
var SECCIONES = [
  { que: "Cada grupo de contenedores con la misma imagen y la misma configuración",
    clave: "services",
    razon: "<code>services</code> es el cuerpo del archivo: una entrada por servicio, y el " +
      "nombre de la entrada es el nombre con que los demás lo encuentran." },
  { que: "Los volúmenes nombrados que gestiona Docker", clave: "volumes",
    razon: "La entrada de <code>volumes</code> en la raíz es la que hace que Docker cree el " +
      "volumen al levantar y lo conserve tras un <code>down</code>." },
  { que: "Las redes que Docker crea al levantar el proyecto", clave: "networks",
    razon: "<code>networks</code> en la raíz declara cada red; ahí se le fija el driver y sus " +
      "opciones si hacen falta." },
  { que: "Los archivos de configuración y los secretos que reciben los servicios",
    clave: "configs",
    razon: "<code>configs</code> y <code>secrets</code> son las otras dos secciones de raíz: " +
      "declaran de dónde sale cada archivo, y el servicio dice cuáles monta." },
  { que: "El mapeo del puerto 8080 del anfitrión al 5000 del contenedor", clave: "ninguna",
    razon: "El mapeo es una clave del servicio, <code>ports</code>, y no una sección de raíz. " +
      "Solo tiene sentido dentro del servicio que publica el puerto." }
];

var NOMBRES_SECCION = [
  { clave: "services", rotulo: "services" },
  { clave: "networks", rotulo: "networks" },
  { clave: "volumes", rotulo: "volumes" },
  { clave: "configs", rotulo: "configs y secrets" },
  { clave: "ninguna", rotulo: "ninguna de las cuatro" }
];

/* Las cuatro lineas que hablan de la misma red y del mismo volumen. */
var PAPELES = [
  { linea: 5, texto: "networks: [app-net]", donde: "dentro de web", clave: "referencia",
    razon: "Es una lista de referencias: dice en qué redes entra el servicio, y nada más." },
  { linea: 11, texto: "networks: { app-net: {} }", donde: "en la raíz", clave: "definicion",
    razon: "Aquí se define la red. Es la entrada que Compose usa para crearla al levantar el " +
      "proyecto." },
  { linea: 8, texto: "volumes: [pgdata:/var/lib/postgresql/data]", donde: "dentro de db",
    clave: "referencia",
    razon: "Referencia el volumen y añade dónde se monta dentro del contenedor. El volumen en " +
      "sí no se crea aquí." },
  { linea: 10, texto: "volumes: { pgdata: {} }", donde: "en la raíz", clave: "definicion",
    razon: "Esta es la definición del volumen nombrado, y es la que falta cuando Compose se " +
      "queja de un volumen que no conoce." }
];

var PAPEL = [
  { clave: "referencia", rotulo: "referencia" },
  { clave: "definicion", rotulo: "definición" }
];

/* ---------- las cuentas ---------- */

function contenedores(servicios, replicas) {
  return servicios * replicas;
}

function contenedoresDelArchivo() {
  return contenedores(SERVICIOS.length, REPLICAS_POR_OMISION);
}

function seccionesDeRaiz() {
  return NOMBRES_SECCION.filter(function (s) { return s.clave !== "ninguna"; }).length;
}

function cuantas(clave) {
  return PAPELES.filter(function (p) { return p.clave === clave; }).length;
}

function nombreDeContenedor(proyecto, servicio, replica) {
  return proyecto + "-" + servicio + "-" + replica;
}

function aciertosSecciones(respuestas) {
  return respuestas.filter(function (r, i) {
    return r !== undefined && r === SECCIONES[i].clave;
  }).length;
}

function aciertosPapeles(respuestas) {
  return respuestas.filter(function (r, i) {
    return r !== undefined && r === PAPELES[i].clave;
  }).length;
}

/* ---------- veredictos y textos ---------- */

function razonSeccion(indice, elegida) {
  var s = SECCIONES[indice];
  if (elegida === s.clave) { return s.razon; }
  if (s.clave === "ninguna") { return "No es una sección de raíz. " + s.razon; }
  return "Va en <code>" + s.clave + "</code>. " + s.razon;
}

function razonPapel(indice, elegida) {
  var p = PAPELES[indice];
  if (elegida === p.clave) { return p.razon; }
  var otro = p.clave === "referencia" ? "una referencia" : "la definición";
  return "Es " + otro + ". " + p.razon;
}

function opcionesContenedores() {
  var real = contenedoresDelArchivo();
  return [
    { valor: real, clave: "correcta",
      razon: "Eso es. Cada servicio es una imagen con N réplicas y N es 1 mientras nadie " +
        "declare otra cosa, así que de tres servicios salen tres contenedores: " +
        "<code>" + nombreDeContenedor("proyecto", "cache", 1) + "</code>, " +
        "<code>" + nombreDeContenedor("proyecto", "db", 1) + "</code> y " +
        "<code>" + nombreDeContenedor("proyecto", "web", 1) + "</code>." },
    { valor: 1, clave: "uno",
      razon: "Un contenedor sería si el archivo declarara un solo servicio. El archivo no se " +
        "levanta como una pieza: cada servicio arranca el suyo." },
    { valor: 4, clave: "con-red",
      razon: "La red y el volumen también los crea Compose, pero no son contenedores y no " +
        "salen en <code>docker compose ps</code>. Se ven con <code>docker network ls</code> y " +
        "<code>docker volume ls</code>." },
    { valor: 6, clave: "imagen-y-contenedor",
      razon: "La imagen no se cuenta aparte: de cada una sale el contenedor que corre, y de " +
        "tres servicios salen tres." }
  ];
}

var RAZONES_FALTA_RAIZ = {
  correcta: "Eso es. Las listas del servicio son referencias, y sin la entrada de la raíz no " +
    "hay nada a qué referirse: Compose para antes de crear el primer contenedor. Es el error " +
    "más común al escribir el archivo a mano.",
  crea: "La lista del servicio no crea nada; solo dice a qué red entra y qué volumen monta. " +
    "Quien lo crea es la entrada de la raíz.",
  anonimo: "Un volumen anónimo es el que se escribe solo con la ruta de dentro, sin nombre. " +
    "Aquí el nombre está escrito, y Compose no encuentra su definición.",
  "sin-red": "Compose no se salta la red que el servicio pide: una referencia sin definición " +
    "es un archivo que no se puede levantar, no un archivo con una parte de menos."
};

var RAZONES_SUFIJO = {
  correcta: "Eso es. El nombre lo arma Compose con el del proyecto, el del servicio y el " +
    "número de réplica, y un servicio sin réplicas declaradas corre una sola, de ahí el 1 en " +
    "los tres.",
  orden: "El orden de arranque sí lo influye <code>depends_on</code>, pero no va en el " +
    "nombre: si fuera el orden, <code>db</code> y <code>cache</code> no terminarían los dos " +
    "en 1.",
  version: "El nombre no dice nada del archivo. Editar el <code>compose.yml</code> y volver a " +
    "levantar recrea el contenedor con el mismo nombre.",
  recreado: "Recrear no mueve el número: tras un <code>down</code> y un <code>up -d</code> el " +
    "contenedor vuelve a llamarse <code>proyecto-cache-1</code>."
};

var RAZONES_MISMA_IMAGEN = {
  correcta: "Eso es. Al servicio lo define su entrada bajo <code>services</code>, no su " +
    "imagen: <code>migrate</code> corre un <code>psql</code> y termina, y <code>db</code> se " +
    "queda sirviendo. Comparten la imagen y nada más.",
  junta: "Un servicio es una imagen más la configuración con que se corre. La misma imagen " +
    "con dos configuraciones son dos servicios, y Compose les da dos contenedores.",
  replica: "Las réplicas de un servicio corren la misma orden y la misma configuración. Estas " +
    "dos no: una sirve y la otra migra y termina con código 0.",
  retag: "Nada impide que dos servicios declaren la misma imagen. Docker la baja una vez y la " +
    "usa para los dos contenedores."
};

/* ---------- pintado y conexiones ---------- */

function iniciar() {
  var secciones = new Array(SECCIONES.length);
  var papeles = new Array(PAPELES.length);

  function pintarSecciones() {
    document.getElementById("cuerpo-secciones").innerHTML = SECCIONES.map(function (s, i) {
      var elegida = secciones[i];
      var bien = elegida === s.clave;
      var botones = NOMBRES_SECCION.map(function (n) {
        return "<button data-fila=\"" + i + "\" data-clave=\"" + n.clave + "\"" +
          (elegida === n.clave ? " class=\"primario\"" : "") + ">" + n.rotulo + "</button>";
      }).join("");
      var celda = elegida === undefined
        ? "<span class=\"pend\">sin responder</span>"
        : (bien ? "" : "<b>") + razonSeccion(i, elegida) + (bien ? "" : "</b>");
      return "<tr><td style=\"text-align:left\">" + s.que + "</td>" +
        "<td><div class=\"opciones\" style=\"justify-content:center\">" + botones +
        "</div></td><td style=\"text-align:left\">" + celda + "</td></tr>";
    }).join("");
    document.getElementById("progreso-secciones").textContent =
      aciertosSecciones(secciones) + " de " + SECCIONES.length + " bien";
    document.querySelectorAll("#cuerpo-secciones button").forEach(function (b) {
      b.addEventListener("click", function () {
        secciones[Number(b.dataset.fila)] = b.dataset.clave;
        pintarSecciones();
      });
    });
  }

  function pintarPapeles() {
    document.getElementById("cuerpo-papeles").innerHTML = PAPELES.map(function (p, i) {
      var elegida = papeles[i];
      var bien = elegida === p.clave;
      var botones = PAPEL.map(function (o) {
        return "<button data-fila=\"" + i + "\" data-clave=\"" + o.clave + "\"" +
          (elegida === o.clave ? " class=\"primario\"" : "") + ">" + o.rotulo + "</button>";
      }).join("");
      var celda = elegida === undefined
        ? "<span class=\"pend\">sin responder</span>"
        : (bien ? "" : "<b>") + razonPapel(i, elegida) + (bien ? "" : "</b>");
      return "<tr><td style=\"text-align:left\"><code>" + p.texto + "</code><br>" +
        "<span class=\"pend\">línea " + p.linea + ", " + p.donde + "</span></td>" +
        "<td><div class=\"opciones\" style=\"justify-content:center\">" + botones +
        "</div></td><td style=\"text-align:left\">" + celda + "</td></tr>";
    }).join("");
    document.getElementById("progreso-papeles").textContent =
      aciertosPapeles(papeles) + " de " + PAPELES.length + " bien";
    document.querySelectorAll("#cuerpo-papeles button").forEach(function (b) {
      b.addEventListener("click", function () {
        papeles[Number(b.dataset.fila)] = b.dataset.clave;
        pintarPapeles();
      });
    });
  }

  pintarSecciones();
  pintarPapeles();

  Motor.pintarChips("chips-secciones", [
    { texto: "secciones de raíz", valor: seccionesDeRaiz() },
    { texto: "referencias en el archivo", valor: cuantas("referencia") },
    { texto: "definiciones", valor: cuantas("definicion") }
  ]);

  Motor.pintarChips("chips-replicas", [
    { texto: "servicios", valor: SERVICIOS.length },
    { texto: "réplicas por omisión", valor: REPLICAS_POR_OMISION },
    { texto: "contenedores", valor: contenedoresDelArchivo(), cuenta: true }
  ]);

  Motor.opcionesNumericas("op-contenedores", "ver-contenedores", opcionesContenedores);

  Motor.conectarOpciones("op-falta-raiz", "ver-falta-raiz", RAZONES_FALTA_RAIZ);
  Motor.conectarOpciones("op-sufijo", "ver-sufijo", RAZONES_SUFIJO);
  Motor.conectarOpciones("op-misma-imagen", "ver-misma-imagen", RAZONES_MISMA_IMAGEN);

  document.getElementById("btn-reiniciar-secciones").addEventListener("click", function () {
    secciones = new Array(SECCIONES.length);
    pintarSecciones();
  });
  document.getElementById("btn-reiniciar-papeles").addEventListener("click", function () {
    papeles = new Array(PAPELES.length);
    pintarPapeles();
  });
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SERVICIOS: SERVICIOS, REPLICAS_POR_OMISION: REPLICAS_POR_OMISION,
    SECCIONES: SECCIONES, NOMBRES_SECCION: NOMBRES_SECCION,
    PAPELES: PAPELES, PAPEL: PAPEL,
    contenedores: contenedores, contenedoresDelArchivo: contenedoresDelArchivo,
    seccionesDeRaiz: seccionesDeRaiz, cuantas: cuantas,
    nombreDeContenedor: nombreDeContenedor,
    aciertosSecciones: aciertosSecciones, aciertosPapeles: aciertosPapeles,
    razonSeccion: razonSeccion, razonPapel: razonPapel,
    opcionesContenedores: opcionesContenedores,
    RAZONES_FALTA_RAIZ: RAZONES_FALTA_RAIZ, RAZONES_SUFIJO: RAZONES_SUFIJO,
    RAZONES_MISMA_IMAGEN: RAZONES_MISMA_IMAGEN
  };
}
