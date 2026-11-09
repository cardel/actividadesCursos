if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Seis problemas en un Dockerfile. El archivo malo reune los errores comunes
   de la sesion y el corregido es el ejemplo 02-buenas-practicas. */

/* Cada linea del archivo con el problema que trae, si trae alguno. Las dos
   ordenes de apt comparten problema: lo que se arregla es juntarlas. */
var MALO = [
  { texto: "FROM python:latest", problema: "tag",
    razon: "El tag móvil: <code>latest</code> apunta a lo último que se haya publicado, así " +
      "que la misma construcción deja de reproducirse de un día para otro. Va una versión " +
      "fija, como <code>python:3.12-slim</code>." },
  { texto: "WORKDIR /app", problema: null,
    razon: "Esta línea está bien: fija el directorio donde caen las órdenes siguientes y no " +
      "cuesta nada." },
  { texto: "COPY . /app", problema: "contexto",
    razon: "El contexto entero antes de instalar: cualquier edición de cualquier archivo " +
      "invalida la capa y arrastra el <code>pip install</code>. Primero va " +
      "<code>requirements.txt</code>, que cambia poco." },
  { texto: "RUN apt-get update", problema: "apt",
    razon: "El <code>update</code> en una orden aparte queda cacheado, y meses después el " +
      "<code>install</code> baja paquetes de un índice viejo o falla. Las dos órdenes van " +
      "en un solo <code>RUN</code>, unidas por <code>&amp;&amp;</code>." },
  { texto: "RUN apt-get install -y curl", problema: "apt",
    razon: "Esta es la otra mitad del mismo problema: separado del <code>update</code>, el " +
      "<code>install</code> depende de un índice que la caché congeló. Las dos van en un " +
      "solo <code>RUN</code>." },
  { texto: "RUN pip install -r requirements.txt", problema: "cachepip",
    razon: "Sin <code>--no-cache-dir</code>, la caché de <code>pip</code> se queda dentro de " +
      "la capa y la imagen carga decenas de megabytes que nadie va a usar." },
  { texto: "ENV DB_PASSWORD=clave123", problema: "secreto",
    razon: "La contraseña queda escrita en la imagen y en su historial, de modo que la lee " +
      "cualquiera que descargue la imagen. Los secretos llegan al arrancar, con " +
      "<code>-e</code> o desde el gestor que los guarde." },
  { texto: "CMD python app.py", problema: "forma",
    razon: "La forma sin corchetes lanza la aplicación como hija de <code>/bin/sh -c</code>, " +
      "que se queda con el proceso número uno y no le reenvía SIGTERM: cada parada agota el " +
      "plazo de diez segundos." }
];

/* El corregido, con los tres cambios marcados. */
var BUENO = [
  { texto: "FROM python:3.12-slim", cambio: true },
  { texto: "WORKDIR /app", cambio: false },
  { texto: "", cambio: false },
  { texto: "COPY requirements.txt .", cambio: false },
  { texto: "RUN pip install --no-cache-dir -r requirements.txt", cambio: true },
  { texto: "", cambio: false },
  { texto: "COPY app.py .", cambio: false },
  { texto: "", cambio: false },
  { texto: "RUN useradd --create-home --shell /usr/sbin/nologin appuser", cambio: true },
  { texto: "USER appuser", cambio: true },
  { texto: "", cambio: false },
  { texto: "EXPOSE 5000", cambio: false },
  { texto: "CMD [\"python\", \"app.py\"]", cambio: true }
];

/* ---------- las cuentas ---------- */

function problemas() {
  var vistos = [];
  MALO.forEach(function (l) {
    if (l.problema && vistos.indexOf(l.problema) < 0) { vistos.push(l.problema); }
  });
  return vistos;
}

function cuantosProblemas() { return problemas().length; }

function lineasSanas() {
  return MALO.filter(function (l) { return !l.problema; }).length;
}

/* Las claves que el estudiante ya encontro, a partir de las lineas marcadas. */
function encontrados(marcadas) {
  var claves = [];
  marcadas.forEach(function (i) {
    var p = MALO[i].problema;
    if (p && claves.indexOf(p) < 0) { claves.push(p); }
  });
  return claves;
}

function faltanPorEncontrar(marcadas) {
  return cuantosProblemas() - encontrados(marcadas).length;
}

function cambiosDelCorregido() {
  return BUENO.filter(function (l) { return l.cambio; }).length;
}

/* ---------- veredictos y textos ---------- */

var RAZONES_FALTA = {
  correcta: "Eso es. Sin <code>USER</code> el proceso corre como <code>root</code>, y ese " +
    "<code>root</code> es el de la máquina, porque el namespace de usuario es el mismo a los " +
    "dos lados. Se crea un usuario con <code>useradd</code> y se cambia antes del arranque.",
  healthcheck: "Sirve para saber si el servicio responde, y no es lo que falta aquí: el " +
    "problema del archivo es con qué permisos corre la aplicación.",
  expose: "El <code>EXPOSE</code> no abre nada: documenta. Su ausencia no cambia lo que el " +
    "contenedor puede hacer.",
  volume: "La aplicación de este ejemplo no guarda datos. Lo que falta es el usuario sin " +
    "privilegios."
};

var RAZONES_ID = {
  correcta: "Eso es, y es la comprobación entera: si <code>id</code> devuelve 0, el " +
    "<code>USER</code> no quedó donde debía o algo más abajo lo deshizo.",
  cero: "Es lo que devuelve el archivo sin corregir. Con <code>USER appuser</code> el " +
    "contenedor arranca con ese usuario.",
  anfitrion: "El contenedor no hereda el usuario de quien lanzó la orden: corre con el que " +
    "diga la imagen, o con <code>root</code> si no lo dice.",
  vacio: "Funciona: <code>id</code> viene en la imagen base y responde con el usuario del " +
    "proceso."
};

var RAZONES_CACHE = {
  correcta: "Eso es. La bandera le dice a <code>pip</code> que no guarde lo que descarga, " +
    "así que la capa solo lleva los paquetes instalados.",
  version: "La versión fija hace reproducible la construcción, y no cambia el peso de la capa.",
  user: "El usuario cambia con qué permisos corre la aplicación, no lo que quedó escrito en " +
    "la capa.",
  orden: "El orden decide qué se reutiliza entre construcciones. El tamaño de la capa " +
    "depende de lo que la orden deje escrito dentro."
};

function razonLinea(indice, marcadas) {
  var l = MALO[indice];
  if (!l.problema) { return l.razon; }
  var repetida = encontrados(marcadas).indexOf(l.problema) >= 0;
  return (repetida ? "Esta línea ya estaba marcada. " : "") + l.razon;
}

/* ---------- pintado y conexiones ---------- */

function iniciar() {
  var marcadas = [];

  function pintarMalo() {
    document.getElementById("codigo-malo").innerHTML = MALO.map(function (l, i) {
      var marcada = marcadas.indexOf(i) >= 0;
      var clase = "linea" + (marcada ? (l.problema ? " bloque-3" : " actual") : "");
      return "<div class=\"" + clase + "\" data-linea=\"" + i + "\" style=\"cursor:pointer\">" +
        "<span class=\"num\">" + (i + 1) + "</span><span class=\"txt\">" + l.texto +
        "</span><span class=\"cont" + (marcada && l.problema ? " activo" : "") + "\">" +
        (marcada ? (l.problema ? "problema" : "está bien") : "revisar") + "</span></div>";
    }).join("");
    document.getElementById("progreso-malo").textContent =
      encontrados(marcadas).length + " de " + cuantosProblemas() +
      " problemas; faltan " + faltanPorEncontrar(marcadas);
    Motor.pintarChips("chips-malo", [
      { texto: "líneas del archivo", valor: MALO.length },
      { texto: "problemas encontrados",
        valor: encontrados(marcadas).length + " de " + cuantosProblemas(), cuenta: true },
      { texto: "líneas sin nada que cambiar", valor: lineasSanas() }
    ]);
    document.getElementById("nota-malo").hidden = faltanPorEncontrar(marcadas) > 0;
    document.querySelectorAll("#codigo-malo div").forEach(function (d) {
      d.addEventListener("click", function () {
        var i = Number(d.dataset.linea);
        var caja = document.getElementById("ver-linea");
        caja.className = "veredicto " + (MALO[i].problema ? "bien" : "mal");
        caja.innerHTML = razonLinea(i, marcadas);
        if (marcadas.indexOf(i) < 0) { marcadas.push(i); }
        pintarMalo();
      });
    });
  }

  function pintarBueno() {
    document.getElementById("codigo-bueno").innerHTML = BUENO.map(function (l) {
      return "<div class=\"linea" + (l.cambio ? " bloque-1" : "") + "\">" +
        "<span class=\"num\"></span><span class=\"txt\">" +
        (l.texto === "" ? " " : l.texto) + "</span></div>";
    }).join("");
  }

  pintarMalo();
  pintarBueno();

  Motor.conectarOpciones("op-falta", "ver-falta", RAZONES_FALTA);
  Motor.conectarOpciones("op-id", "ver-id", RAZONES_ID);
  Motor.conectarOpciones("op-cache", "ver-cache", RAZONES_CACHE);

  document.getElementById("btn-reiniciar-malo").addEventListener("click", function () {
    marcadas = [];
    document.getElementById("ver-linea").className = "veredicto";
    pintarMalo();
  });
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    MALO: MALO, BUENO: BUENO,
    problemas: problemas, cuantosProblemas: cuantosProblemas, lineasSanas: lineasSanas,
    encontrados: encontrados, faltanPorEncontrar: faltanPorEncontrar,
    cambiosDelCorregido: cambiosDelCorregido, razonLinea: razonLinea,
    RAZONES_FALTA: RAZONES_FALTA, RAZONES_ID: RAZONES_ID, RAZONES_CACHE: RAZONES_CACHE
  };
}
