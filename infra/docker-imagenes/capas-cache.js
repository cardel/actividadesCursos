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

/* Las opciones de los pasos cacheados: cada distractor es una cuenta que alguien hace. */
function opcionesCacheados() {
  var real = cacheados(BUENA);
  return sinRepetidas([
    { valor: real, clave: "correcta", razon: explicarCacheados(true, real) },
    { valor: cacheados(MALA), clave: "orden",
      razon: "Esa es la cuenta del orden contrario: con el código arriba solo sobreviven " +
        cacheados(MALA) + " de " + MALA.length + ". Con las dependencias primero, editar " +
        "app.py deja intactos los pasos de la instalación." },
    { valor: BUENA.length - 1, clave: "cmd",
      razon: "Falta descontar el CMD. Va después de COPY app.py, y una capa que viene tras la " +
        "que cambió también se reconstruye: la cadena no se corta en el código, sigue hasta " +
        "el final." },
    { valor: BUENA.length, clave: "todos",
      razon: "Con " + BUENA.length + " de " + BUENA.length + " no habría nada que reconstruir, " +
        "y la edición de app.py cambia el contenido de COPY app.py. Esa capa y todas las " +
        "siguientes se rehacen." }
  ]);
}

/* Las opciones de la razon entre los dos tiempos. */
function opcionesRazon() {
  var real = razonTiempos();
  var mala = segundos("COPY . /app arriba");
  var buena = segundos("dependencias arriba");
  var primera = segundos("--no-cache");
  return sinRepetidas([
    { valor: fmt(real, 1), clave: "correcta", razon: explicarRazon(true, real) },
    { valor: fmt(primera / buena, 1), clave: "primera",
      razon: "Esa es la razón contra la construcción sin caché (" + fmt(primera, 3) + " s " +
        "entre " + fmt(buena, 3) + " s). La pregunta compara las dos segundas construcciones, " +
        "tras la misma edición, no contra la primera." },
    { valor: fmt(buena / mala, 1), clave: "inversa",
      razon: "Está dividida al revés: " + fmt(buena, 3) + " s entre " + fmt(mala, 3) + " s. " +
        "La que tarda más va arriba, porque se pregunta cuántas veces más tarda." },
    { valor: fmt(mala - buena, 1), clave: "resta",
      razon: "Eso es la diferencia en segundos, no cuántas veces más. Una razón es un " +
        "cociente, " + fmt(mala, 3) + " entre " + fmt(buena, 3) + "." }
  ]);
}

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

  Motor.opcionesNumericas("op-cacheados", "ver-cacheados", opcionesCacheados);
  document.getElementById("op-cacheados").addEventListener("click", destapar);

  Motor.opcionesNumericas("op-razon", "ver-razon", opcionesRazon);
  document.getElementById("op-razon").addEventListener("click", destapar);

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
