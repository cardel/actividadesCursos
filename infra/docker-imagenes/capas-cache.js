if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Las capas y donde se rompe la cache. Dos juegos de cifras del tema, que no
   se mezclan: la traza de pasos cacheados corresponde al Dockerfile de seis
   lineas que ilustra el orden, y los tiempos medidos corresponden al ejemplo
   completo, que trae ademas ENV, EXPOSE y CMD. */

var PILA = [
  "∅",
  "python:3.12-slim",
  "COPY requirements.txt + pip install",
  "COPY app.py",
  "CMD [\"python\", \"app.py\"]"
];

/* Los dos ordenes, con lo que pasa en el segundo build tras editar app.py. */
var BUENA = [
  { paso: "FROM python:3.12-slim", cacheado: true },
  { paso: "WORKDIR /app", cacheado: true },
  { paso: "COPY requirements.txt .", cacheado: true },
  { paso: "RUN pip install", cacheado: true },
  { paso: "COPY app.py .", cacheado: false },
  { paso: "CMD", cacheado: false }
];

var MALA = [
  { paso: "FROM python:3.12-slim", cacheado: true },
  { paso: "WORKDIR /app", cacheado: true },
  { paso: "COPY . /app", cacheado: false },
  { paso: "RUN pip install", cacheado: false },
  { paso: "CMD", cacheado: false }
];

/* Tiempos medidos del ejemplo completo. */
var TIEMPOS = [
  { nombre: "Primera, con --no-cache", rehace: "las ocho instrucciones", segundos: 9.242 },
  { nombre: "Segunda, dependencias arriba", rehace: "copiar app.py y los metadatos", segundos: 2.374 },
  { nombre: "Segunda, con COPY . /app arriba", rehace: "copiar todo y reinstalar las dependencias", segundos: 7.274 }
];

/* ---------- las cuentas ---------- */

function cacheados(orden) {
  return orden.filter(function (p) { return p.cacheado; }).length;
}

/* En que paso arranca la cadena que hay que reconstruir, contando desde uno. */
function primerPasoQueSeEjecuta(orden) {
  var indice = -1;
  orden.forEach(function (p, i) { if (indice < 0 && !p.cacheado) { indice = i; } });
  return indice + 1;
}

function segundos(nombreParcial) {
  var fila = TIEMPOS.filter(function (t) { return t.nombre.indexOf(nombreParcial) >= 0; })[0];
  return fila ? fila.segundos : NaN;
}

function razonTiempos() {
  return segundos("COPY . /app arriba") / segundos("dependencias arriba");
}

function ahorroSobrePrimera() {
  return segundos("dependencias arriba") / segundos("--no-cache");
}

/* ---------- veredictos y textos ---------- */

function fmt(x, d) { return Motor.num(x, d); }

function explicarCacheados(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Salen " + real + " de " + BUENA.length +
    ": la base, el WORKDIR, la copia de requirements.txt y el pip install. La cadena que hay " +
    "que rehacer arranca en el paso " + primerPasoQueSeEjecuta(BUENA) + ", donde se copia el " +
    "código. Con el código arriba, en cambio, solo " + cacheados(MALA) + " de " + MALA.length +
    " sobreviven, porque la cadena arranca en el paso " + primerPasoQueSeEjecuta(MALA) + ".";
}

function explicarRazon(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Son " + fmt(real, 1) + " veces: " +
    fmt(segundos("COPY . /app arriba"), 3) + " s contra " +
    fmt(segundos("dependencias arriba"), 3) + " s, por la misma edición de una línea. La " +
    "diferencia es el pip install, que en un caso se salta y en el otro se repite. Mover dos " +
    "líneas de sitio cuesta eso cada vez que alguien construye.";
}

var RAZONES_CAPAS = {
  correcta: "Es la consecuencia que se nota en disco. Diez imágenes construidas sobre " +
    "python:3.12-slim comparten esa base: se guarda una vez y cada imagen agrega lo suyo. Por " +
    "eso un registro con muchas imágenes parecidas no ocupa la suma de sus tamaños.",
  editar: "No se puede. Una capa es inmutable y su identificador depende de su contenido: " +
    "cambiarla produce una capa distinta, y todas las que estaban encima dejan de " +
    "corresponder. Eso es exactamente lo que invalida la caché.",
  orden: "El resultado final puede ser el mismo y el costo no. El orden decide qué capas " +
    "sobreviven a un cambio, y de ahí salen los " + fmt(segundos("COPY . /app arriba"), 3) +
    " s contra " + fmt(segundos("dependencias arriba"), 3) + " s del tercer apartado.",
  union: "Cada capa guarda solo su diferencia con la anterior. Docker las combina al arrancar " +
    "con un sistema de archivos por unión, y eso es lo que permite compartirlas."
};

var RAZONES_INVALIDA = {
  correcta: "Es así. La caché se invalida hacia arriba, no hacia abajo: una instrucción nueva " +
    "al final deja intactas las anteriores y solo agrega su capa. Si el build volvió a tardar " +
    "lo mismo, lo que hay que mirar es si además se tocó algo más arriba.",
  todo: "No. Lo que se invalida es la capa que cambió y las que vienen después de ella. Una " +
    "instrucción agregada al final no tiene ninguna después.",
  apt: "El orden manda, no la instrucción: un <code>apt-get update</code> al final solo " +
    "ejecuta esa capa. Lo que sí pasa con <code>apt-get</code> es otra cosa, que su resultado " +
    "cambia con el tiempo mientras la caché lo da por bueno, y por eso se suele juntar con el " +
    "<code>install</code> en una sola instrucción.",
  azar: "No hay vencimiento por tiempo. La caché se decide por el contenido de cada capa y por " +
    "las instrucciones anteriores; mientras nada de eso cambie, se reutiliza."
};

/* ---------- pintado y conexiones ---------- */

function fichasDe(orden) {
  return orden.map(function (p) {
    return "<span class=\"ficha" + (p.cacheado ? "" : " tachada") + "\">" + p.paso + "</span>";
  }).join("<span class=\"flecha\">→</span>");
}

function filasTiempos() {
  return TIEMPOS.map(function (t) {
    return [t.nombre, t.rehace, fmt(t.segundos, 3) + " s"];
  });
}

function iniciar() {
  var destapado = false;

  function pintarPila() {
    document.getElementById("pila").innerHTML = PILA.map(function (c) {
      return "<span class=\"ficha\">" + c + "</span>";
    }).join("<span class=\"flecha\">↑</span>");
  }

  function pintarPasos() {
    document.getElementById("pasos-buena").innerHTML = destapado
      ? "<span class=\"rotulo\">Dependencias primero</span>" + fichasDe(BUENA) : "";
    document.getElementById("pasos-mala").innerHTML = destapado
      ? "<span class=\"rotulo\">Código primero</span>" + fichasDe(MALA) : "";
    Motor.pintarChips("chips-cache", [
      { texto: "cacheados con dependencias arriba",
        valor: destapado ? cacheados(BUENA) + " de " + BUENA.length : "?", cuenta: true },
      { texto: "cacheados con el código arriba",
        valor: destapado ? cacheados(MALA) + " de " + MALA.length : "?", cuenta: true },
      { texto: "la cadena arranca en el paso",
        valor: destapado ? primerPasoQueSeEjecuta(BUENA) + " y " + primerPasoQueSeEjecuta(MALA) : "?" }
    ]);
  }

  function pintarTiempos() {
    document.getElementById("cuerpo-tiempos").innerHTML = filasTiempos().map(function (f) {
      var resto = destapado
        ? "<td style=\"text-align:left\">" + f[1] + "</td><td>" + f[2] + "</td>"
        : "<td style=\"text-align:left\">" + f[1] + "</td><td class=\"pend\">?</td>";
      return "<tr><td style=\"text-align:left\">" + f[0] + "</td>" + resto + "</tr>";
    }).join("");
  }

  function destapar() {
    destapado = true;
    pintarPasos();
    pintarTiempos();
    document.getElementById("nota-tiempos").hidden = false;
  }

  pintarPila();
  pintarPasos();
  pintarTiempos();

  Motor.conectarPrediccion(
    { entrada: "pred-cacheados", boton: "btn-cacheados", veredicto: "ver-cacheados" },
    function () { return cacheados(BUENA); }, explicarCacheados);
  document.getElementById("btn-cacheados").addEventListener("click", destapar);

  Motor.conectarPrediccion(
    { entrada: "pred-razon", boton: "btn-razon", veredicto: "ver-razon" },
    razonTiempos, explicarRazon);
  document.getElementById("btn-razon").addEventListener("click", destapar);

  Motor.conectarOpciones("op-capas", "ver-capas", RAZONES_CAPAS);
  Motor.conectarOpciones("op-invalida", "ver-invalida", RAZONES_INVALIDA);
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PILA: PILA, BUENA: BUENA, MALA: MALA, TIEMPOS: TIEMPOS,
    cacheados: cacheados, primerPasoQueSeEjecuta: primerPasoQueSeEjecuta, segundos: segundos,
    razonTiempos: razonTiempos, ahorroSobrePrimera: ahorroSobrePrimera,
    filasTiempos: filasTiempos, fichasDe: fichasDe,
    explicarCacheados: explicarCacheados, explicarRazon: explicarRazon,
    RAZONES_CAPAS: RAZONES_CAPAS, RAZONES_INVALIDA: RAZONES_INVALIDA
  };
}
