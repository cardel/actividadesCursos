if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* De tres docker run a un compose.yml. Las ordenes, el archivo y las salidas
   son las de la corrida de la sesion sobre 01-compose-basico. */

var ORDENES_A_MANO = 5;
var SERVICIOS = ["web", "db", "cache"];
var SECCIONES_RAIZ = ["services", "volumes", "networks"];
var VOLUMENES_DECLARADOS = ["pgdata"];

/* Cada pieza de las ordenes a mano y la clave que la recoge. */
var BANDERAS = [
  { pieza: "-p 8080:5000", servicio: "web", clave: "ports",
    razon: "La lista <code>ports</code> repite el mapeo tal cual, " +
      "<code>ports: [\"8080:5000\"]</code>, con el puerto del anfitrión primero." },
  { pieza: "-e POSTGRES_PASSWORD=ejemplo", servicio: "db", clave: "environment",
    razon: "<code>environment</code> lleva una entrada por variable: " +
      "<code>POSTGRES_PASSWORD: ejemplo</code> dentro de <code>db</code>." },
  { pieza: "--network app-net", servicio: "los tres", clave: "networks",
    razon: "Dentro del servicio, <code>networks: [app-net]</code> dice en qué redes entra. " +
      "La red se define aparte, en la raíz." },
  { pieza: "-v pgdata:/var/lib/postgresql/data", servicio: "db", clave: "volumes",
    razon: "La lista del servicio trae el volumen y su punto de montaje. El volumen nombrado " +
      "se declara en la raíz, y Compose lo crea al levantar." },
  { pieza: "postgres:16", servicio: "db", clave: "image",
    razon: "<code>image: postgres:16</code>. El último argumento del <code>docker run</code> " +
      "es la imagen, y esa clave la nombra igual." },
  { pieza: "mi-app:1.0, construida antes a mano", servicio: "web", clave: "build",
    razon: "<code>build: ./app</code> apunta a la carpeta con el <code>Dockerfile</code>, " +
      "así que la imagen se construye al levantar y no hace falta un <code>docker build</code> " +
      "aparte." },
  { pieza: "--name db", servicio: "db", clave: "ninguna",
    razon: "El nombre lo da la clave del servicio: lo que va bajo <code>services</code> ya se " +
      "llama <code>db</code>, y Compose arma el nombre del contenedor con el del proyecto y el " +
      "número de réplica, <code>proyecto-db-1</code>." }
];

var CLAVES = ["image", "build", "ports", "environment", "volumes", "networks", "ninguna"];

/* Las dos peticiones de la corrida y el valor tras recrear los contenedores. */
var PETICIONES = [
  { n: 1, visitas: 1, db_ok: true },
  { n: 2, visitas: 2, db_ok: true }
];
var VISITAS_TRAS_DOWN = 1;

/* Lo que demuestra cada dato de la respuesta y del log. */
var PRUEBAS = [
  { dato: "El contador sube de 1 a 2", clave: "cache",
    razon: "<code>cache.incr</code> encontró a Redis por el nombre <code>cache</code>, y el " +
      "valor nuevo siguió ahí en la segunda petición." },
  { dato: "<code>db_ok</code> en <code>true</code>", clave: "db",
    razon: "El <code>SELECT 1</code> salió de <code>web</code>, entró a PostgreSQL por " +
      "<code>db:5432</code> y volvió con un 1." },
  { dato: "<code>172.19.0.1</code> en la última línea del log", clave: "puerta",
    razon: "Esa es la puerta de enlace de <code>app-net</code>, por donde entra lo que viene " +
      "del anfitrión. La dirección del contenedor de <code>web</code> es la otra, " +
      "<code>172.19.0.4</code>." }
];

var QUE_DEMUESTRA = [
  { clave: "cache", rotulo: "el cache responde y guarda estado" },
  { clave: "db", rotulo: "la consulta llegó a la base" },
  { clave: "puerta", rotulo: "la petición entró desde el anfitrión" }
];

/* ---------- las cuentas ---------- */

function visitas(n) { return PETICIONES[n - 1].visitas; }

function clavesDistintas() {
  var vistas = {};
  BANDERAS.forEach(function (b) {
    if (b.clave !== "ninguna") { vistas[b.clave] = true; }
  });
  return Object.keys(vistas).length;
}

function serviciosSinVolumen() {
  return SERVICIOS.length - VOLUMENES_DECLARADOS.length;
}

function aciertosBanderas(respuestas) {
  return respuestas.filter(function (r, i) {
    return r !== undefined && r === BANDERAS[i].clave;
  }).length;
}

function aciertosPruebas(respuestas) {
  return respuestas.filter(function (r, i) {
    return r !== undefined && r === PRUEBAS[i].clave;
  }).length;
}

/* ---------- veredictos y textos ---------- */

function razonBandera(indice, elegida) {
  var b = BANDERAS[indice];
  if (elegida === b.clave) { return b.razon; }
  if (b.clave === "ninguna") { return "Ninguna clave hace falta. " + b.razon; }
  return "Va en <code>" + b.clave + "</code>. " + b.razon;
}

function razonPrueba(indice, elegida) {
  var p = PRUEBAS[indice];
  if (elegida === p.clave) { return p.razon; }
  return "Demuestra otra cosa: " + p.razon;
}

function opcionesSegunda() {
  return [
    { valor: visitas(2), clave: "correcta",
      razon: "Eso es. <code>incr</code> sube el contador que ya está en Redis y devuelve el " +
        "valor nuevo, así que la segunda petición trae 2 y <code>db_ok</code> sigue en " +
        "<code>true</code>." },
    { valor: 1, clave: "repite",
      razon: "Sería 1 si cada petición empezara un contador propio. La clave " +
        "<code>visitas</code> vive en Redis y las dos peticiones suben la misma." },
    { valor: 3, clave: "suma-arranque",
      razon: "Nadie pide el endpoint al levantar el sistema: el contador empieza a moverse en " +
        "la primera petición, y van dos." },
    { valor: 0, clave: "antes",
      razon: "<code>incr</code> devuelve el valor ya subido, no el anterior; de ahí que la " +
        "primera petición contestara 1 y no 0." }
  ];
}

function opcionesTrasDown() {
  return [
    { valor: VISITAS_TRAS_DOWN, clave: "correcta",
      razon: "Eso es. <code>cache</code> no declara volumen, así que el <code>down</code> se " +
        "lleva su contenedor y Redis arranca vacío. La primera petición sobre un Redis vacío " +
        "vuelve a contestar 1." },
    { valor: 2, clave: "sigue",
      razon: "El contador seguiría en 2 con un volumen para Redis. El único declarado es " +
        "<code>pgdata</code>, y ese lo monta la base." },
    { valor: 3, clave: "acumula",
      razon: "No hay nada a qué sumarle: el contenedor de Redis es otro y la clave " +
        "<code>visitas</code> no existe en él." },
    { valor: 0, clave: "vacio",
      razon: "La clave arranca en 0 dentro de Redis, pero <code>incr</code> contesta con el " +
        "valor ya subido, de modo que la respuesta nunca trae 0." }
  ];
}

var RAZONES_PUERTOS = {
  correcta: "Eso es. Sin dirección delante, el puerto solo existe dentro de " +
    "<code>app-net</code>: lo alcanzan los otros servicios y nadie más. " +
    "<code>web</code> sale con <code>0.0.0.0:8080-&gt;5000/tcp</code> porque su entrada " +
    "<code>ports</code> publica ese puerto en el anfitrión.",
  arranque: "Los tres llevan <code>Up 14 seconds</code> y el contador ya subió, así que los " +
    "procesos están atendiendo. La columna no habla del arranque sino de dónde se publicó el " +
    "puerto.",
  host: "Con la red del anfitrión no habría mapeo ni red propia, y la salida muestra una red " +
    "de Compose con direcciones <code>172.19.0.x</code>.",
  oculta: "No hay nada publicado que la columna esconda: la fila de <code>web</code> prueba " +
    "que cuando un puerto se publica, la dirección aparece ahí mismo."
};

var RAZONES_BASE = {
  correcta: "Eso es. La fila sin dirección dice que el puerto vive dentro de la red, y por ahí " +
    "entra el <code>SELECT 1</code> de <code>web</code>. Una entrada <code>ports</code> solo " +
    "haría falta para abrirlo al anfitrión, por ejemplo para un <code>psql</code> de fuera.",
  nadie: "Si estuviera cerrado para la red, el <code>SELECT 1</code> no habría llegado y " +
    "<code>db_ok</code> no saldría en <code>true</code>. <code>ports</code> abre el puerto en " +
    "el anfitrión, no en la red.",
  anfitrion: "La columna lista el puerto en que el contenedor escucha. Para entrar desde el " +
    "anfitrión hace falta la dirección delante, que es lo que distingue la fila de " +
    "<code>web</code>.",
  depends: "<code>depends_on</code> ordena el arranque y no abre ni cierra puertos. Cualquier " +
    "contenedor de la red se conecta a <code>db</code>, lo nombre o no en sus dependencias."
};

/* ---------- pintado y conexiones ---------- */

function iniciar() {
  var banderas = new Array(BANDERAS.length);
  var pruebas = new Array(PRUEBAS.length);

  function pintarBanderas() {
    document.getElementById("cuerpo-banderas").innerHTML = BANDERAS.map(function (b, i) {
      var elegida = banderas[i];
      var bien = elegida === b.clave;
      var botones = CLAVES.map(function (c) {
        return "<button data-fila=\"" + i + "\" data-clave=\"" + c + "\"" +
          (elegida === c ? " class=\"primario\"" : "") + ">" + c + "</button>";
      }).join("");
      var celda = elegida === undefined
        ? "<span class=\"pend\">sin responder</span>"
        : (bien ? "" : "<b>") + razonBandera(i, elegida) + (bien ? "" : "</b>");
      return "<tr><td style=\"text-align:left\"><code>" + b.pieza + "</code><br>" +
        "<span class=\"pend\">" + b.servicio + "</span></td>" +
        "<td><div class=\"opciones\" style=\"justify-content:center\">" + botones +
        "</div></td><td style=\"text-align:left\">" + celda + "</td></tr>";
    }).join("");
    document.getElementById("progreso-banderas").textContent =
      aciertosBanderas(banderas) + " de " + BANDERAS.length + " bien";
    document.querySelectorAll("#cuerpo-banderas button").forEach(function (b) {
      b.addEventListener("click", function () {
        banderas[Number(b.dataset.fila)] = b.dataset.clave;
        pintarBanderas();
      });
    });
  }

  function pintarPruebas() {
    document.getElementById("cuerpo-pruebas").innerHTML = PRUEBAS.map(function (p, i) {
      var elegida = pruebas[i];
      var bien = elegida === p.clave;
      var botones = QUE_DEMUESTRA.map(function (q) {
        return "<button data-fila=\"" + i + "\" data-clave=\"" + q.clave + "\"" +
          (elegida === q.clave ? " class=\"primario\"" : "") + ">" + q.rotulo + "</button>";
      }).join("");
      var celda = elegida === undefined
        ? "<span class=\"pend\">sin responder</span>"
        : (bien ? "" : "<b>") + razonPrueba(i, elegida) + (bien ? "" : "</b>");
      return "<tr><td style=\"text-align:left\">" + p.dato + "</td>" +
        "<td><div class=\"opciones\" style=\"justify-content:center\">" + botones +
        "</div></td><td style=\"text-align:left\">" + celda + "</td></tr>";
    }).join("");
    document.getElementById("progreso-pruebas").textContent =
      aciertosPruebas(pruebas) + " de " + PRUEBAS.length + " bien";
    document.getElementById("nota-pruebas").hidden =
      aciertosPruebas(pruebas) < PRUEBAS.length;
    document.querySelectorAll("#cuerpo-pruebas button").forEach(function (b) {
      b.addEventListener("click", function () {
        pruebas[Number(b.dataset.fila)] = b.dataset.clave;
        pintarPruebas();
      });
    });
  }

  pintarBanderas();
  pintarPruebas();

  Motor.pintarChips("chips-banderas", [
    { texto: "órdenes a mano", valor: ORDENES_A_MANO },
    { texto: "servicios en el archivo", valor: SERVICIOS.length, cuenta: true },
    { texto: "claves distintas", valor: clavesDistintas() },
    { texto: "secciones de raíz en el archivo", valor: SECCIONES_RAIZ.length }
  ]);

  Motor.pintarChips("chips-contador", [
    { texto: "peticiones", valor: PETICIONES.length },
    { texto: "volúmenes declarados", valor: VOLUMENES_DECLARADOS.length },
    { texto: "servicios sin volumen", valor: serviciosSinVolumen(), cuenta: true }
  ]);

  Motor.opcionesNumericas("op-segunda", "ver-segunda", opcionesSegunda);
  Motor.opcionesNumericas("op-tras-down", "ver-tras-down", opcionesTrasDown);

  Motor.conectarOpciones("op-puertos", "ver-puertos", RAZONES_PUERTOS);
  Motor.conectarOpciones("op-cinco-cuatro-tres-dos", "ver-cinco-cuatro-tres-dos", RAZONES_BASE);

  document.getElementById("btn-reiniciar-banderas").addEventListener("click", function () {
    banderas = new Array(BANDERAS.length);
    pintarBanderas();
  });
  document.getElementById("btn-reiniciar-pruebas").addEventListener("click", function () {
    pruebas = new Array(PRUEBAS.length);
    pintarPruebas();
  });
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ORDENES_A_MANO: ORDENES_A_MANO, SERVICIOS: SERVICIOS,
    SECCIONES_RAIZ: SECCIONES_RAIZ, VOLUMENES_DECLARADOS: VOLUMENES_DECLARADOS,
    BANDERAS: BANDERAS, CLAVES: CLAVES, PETICIONES: PETICIONES,
    VISITAS_TRAS_DOWN: VISITAS_TRAS_DOWN, PRUEBAS: PRUEBAS, QUE_DEMUESTRA: QUE_DEMUESTRA,
    visitas: visitas, clavesDistintas: clavesDistintas,
    serviciosSinVolumen: serviciosSinVolumen,
    aciertosBanderas: aciertosBanderas, aciertosPruebas: aciertosPruebas,
    razonBandera: razonBandera, razonPrueba: razonPrueba,
    opcionesSegunda: opcionesSegunda, opcionesTrasDown: opcionesTrasDown,
    RAZONES_PUERTOS: RAZONES_PUERTOS, RAZONES_BASE: RAZONES_BASE
  };
}
