if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* El nombre de una imagen y de donde se baja. Los cuatro nombres son los que
   se usaron en la sesion, con el esquema registro/usuario/imagen:tag. */

var IMPLICITO = "Docker Hub, implícito";
var OFICIAL = "sin usuario: imagen oficial";

var NOMBRES = [
  { escrito: "nginx:1.27-alpine", registro: IMPLICITO, usuario: OFICIAL,
    imagen: "nginx", tag: "1.27-alpine" },
  { escrito: "postgres:16-alpine", registro: IMPLICITO, usuario: OFICIAL,
    imagen: "postgres", tag: "16-alpine" },
  { escrito: "cardel87/hola-mundo:0.1.0", registro: IMPLICITO, usuario: "cardel87",
    imagen: "hola-mundo", tag: "0.1.0" },
  { escrito: "registro.empresa.com/equipo/api:2.1.0", registro: "registro.empresa.com",
    usuario: "equipo", imagen: "api", tag: "2.1.0" }
];

/* ---------- las cuentas ---------- */

function partes(escrito) {
  return NOMBRES.filter(function (n) { return n.escrito === escrito; })[0];
}

function conRegistroEscrito() {
  return NOMBRES.filter(function (n) { return n.registro !== IMPLICITO; }).length;
}

function oficiales() {
  return NOMBRES.filter(function (n) { return n.usuario === OFICIAL; }).length;
}

/* El tag no se escribe y Docker completa con latest, que es justo el que no
   conviene en produccion. */
function tagPorOmision() { return "latest"; }

/* ---------- veredictos y textos ---------- */

var RAZONES_FALTA = {
  correcta: "Eso es. Al no escribirlo, Docker lo completa con Docker Hub, y por eso la misma " +
    "orden baja de otro sitio en cuanto el nombre lleva un registro delante.",
  tag: "El tag está: es <code>0.1.0</code>. Lo que ocurre si falta es que Docker completa " +
    "con <code>" + tagPorOmision() + "</code>, que es el tag que conviene evitar.",
  usuario: "El usuario es <code>cardel87</code> y la imagen es <code>hola-mundo</code>: la " +
    "barra separa una de la otra.",
  ninguna: "Falta una: el registro. Las imágenes oficiales de la sesión, como " +
    "<code>alpine</code> o <code>postgres</code>, omiten además el usuario."
};

var RAZONES_TAG = {
  correcta: "Eso es. El nombre es la dirección: <code>push</code> publica donde diga el " +
    "nombre, y una imagen llamada <code>hola-mundo</code> a secas no apunta a ninguna cuenta.",
  copia: "No se copia nada: <code>tag</code> agrega un nombre a la imagen que ya está, y las " +
    "dos formas de llamarla apuntan al mismo contenido.",
  comprime: "El empaquetado lo hace <code>push</code> al subir cada capa que el registro no " +
    "tenga. Lo que falta antes es el nombre.",
  version: "La versión la escribe quien pone el tag; la orden no incrementa nada por su cuenta."
};

var RAZONES_LATEST = {
  correcta: "Eso es, y no significa la última versión: significa el último que se publicó " +
    "con ese nombre. Dos despliegues separados por una hora pueden traer contenidos " +
    "distintos sin que nada cambie en la configuración.",
  cache: "La caché de capas es local y acelera construcciones; lo que cambia aquí es a qué " +
    "contenido apunta el nombre en el registro.",
  azar: "El registro sirve el contenido que el tag señale en ese momento, el mismo para " +
    "todos. Lo que cambia es a dónde señala.",
  nunca: "Un tag es un nombre que se puede mover, y <code>latest</code> se mueve en cada " +
    "publicación. El que no se mueve es el digest."
};

var RAZONES_FIJAR = {
  correcta: "Eso es. La versión semántica se lee y se compara, y el digest no admite " +
    "discusión: identifica un contenido exacto, de modo que dos máquinas que lo bajen " +
    "ejecutan lo mismo.",
  fecha: "La fecha ayuda a ordenar y sigue siendo un nombre que alguien puede volver a " +
    "publicar. Lo que ata el contenido es el digest.",
  pull: "Un <code>pull</code> antes de arrancar trae lo último que haya, que es exactamente " +
    "el problema.",
  local: "Construir en cada máquina multiplica las diferencias, y con una base " +
    "<code>latest</code> ni siquiera se parte del mismo punto."
};

/* ---------- pintado y conexiones ---------- */

function filasNombres(destapado) {
  return NOMBRES.map(function (n) {
    return destapado
      ? [n.escrito, n.registro, n.usuario, n.imagen, n.tag]
      : [n.escrito, "?", "?", "?", "?"];
  });
}

function iniciar() {
  var destapado = false;

  function pintarPartes() {
    document.getElementById("cuerpo-partes").innerHTML = filasNombres(destapado)
      .map(function (f) {
        var resto = f.slice(1).map(function (c) {
          return c === "?" ? "<td class=\"pend\">?</td>" : "<td>" + c + "</td>";
        }).join("");
        return "<tr><td style=\"text-align:left\"><code>" + f[0] + "</code></td>" + resto +
          "</tr>";
      }).join("");
  }

  pintarPartes();

  document.getElementById("btn-partes").addEventListener("click", function () {
    destapado = true;
    pintarPartes();
  });
  document.getElementById("btn-tapar").addEventListener("click", function () {
    destapado = false;
    pintarPartes();
  });

  Motor.conectarOpciones("op-falta", "ver-falta", RAZONES_FALTA);
  Motor.conectarOpciones("op-tag", "ver-tag", RAZONES_TAG);
  Motor.conectarOpciones("op-latest", "ver-latest", RAZONES_LATEST);
  Motor.conectarOpciones("op-fijar", "ver-fijar", RAZONES_FIJAR);
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    NOMBRES: NOMBRES, IMPLICITO: IMPLICITO, OFICIAL: OFICIAL,
    partes: partes, conRegistroEscrito: conRegistroEscrito, oficiales: oficiales,
    tagPorOmision: tagPorOmision, filasNombres: filasNombres,
    RAZONES_FALTA: RAZONES_FALTA, RAZONES_TAG: RAZONES_TAG,
    RAZONES_LATEST: RAZONES_LATEST, RAZONES_FIJAR: RAZONES_FIJAR
  };
}
