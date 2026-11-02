if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Donde esta el peso de una imagen. Todas las cifras salen de docker images y
   docker history de la sesion. Los tamanos van en megabytes decimales, que es
   la unidad con que Docker los imprime. */

var IMAGEN = { total: 197, base: 179, contenido: 48.3 };

/* Lo que agrega cada instruccion propia, en megabytes. */
var CAPAS = [
  { instruccion: "WORKDIR /app", mb: 0.00819 },
  { instruccion: "COPY requirements.txt .", mb: 0.0123 },
  { instruccion: "RUN pip install --no-cache-dir -r requirements.txt", mb: 15.2 },
  { instruccion: "COPY app.py .", mb: 0.0123 },
  { instruccion: "ENV APP_VERSION=0.1.0", mb: 0 },
  { instruccion: "EXPOSE 5000", mb: 0 },
  { instruccion: "CMD [\"python\", \"app.py\"]", mb: 0 }
];

/* La capa mas pesada que llega heredada de la base. */
var CAPA_DEBIAN = 87.4;

/* El mismo programa en Go, cuatro empaques. */
var GO = [
  { variante: "scratch", mb: 2.06, trae: "solo el binario" },
  { variante: "alpine", mb: 15.6, trae: "busybox y musl" },
  { variante: "distroless", mb: 36.5, trae: "glibc y certificados" },
  { variante: "debian", mb: 1270, trae: "el compilador de Go entero" }
];

/* Bases medidas con docker images en la maquina del curso. */
var BASES = [
  { nombre: "alpine:3.20", mb: 12.2 },
  { nombre: "debian:bookworm-slim", mb: 116 },
  { nombre: "ubuntu:24.04", mb: 119 },
  { nombre: "python:3.12-slim", mb: 179 },
  { nombre: "gcr.io/distroless/base-debian12", mb: 33 },
  { nombre: "python:3.12", mb: 1620 },
  { nombre: "golang:1.23", mb: 1240 }
];

/* ---------- las cuentas ---------- */

function porcentajeBase() { return IMAGEN.base / IMAGEN.total * 100; }

function propio() { return IMAGEN.total - IMAGEN.base; }

function sumaCapasPropias() {
  return CAPAS.reduce(function (t, c) { return t + c.mb; }, 0);
}

/* Cuantas capas propias no agregan un solo byte. */
function capasVacias() {
  return CAPAS.filter(function (c) { return c.mb === 0; }).length;
}

function masPequena() {
  return GO.reduce(function (m, g) { return g.mb < m.mb ? g : m; }, GO[0]);
}

function masGrande() {
  return GO.reduce(function (m, g) { return g.mb > m.mb ? g : m; }, GO[0]);
}

function vecesLaPequena(mb) { return mb / masPequena().mb; }

function diferenciaGo() { return masGrande().mb - masPequena().mb; }

function base(nombre) {
  var fila = BASES.filter(function (b) { return b.nombre === nombre; })[0];
  return fila ? fila.mb : NaN;
}

function razonSlim() { return base("python:3.12") / base("python:3.12-slim"); }

/* ---------- veredictos y textos ---------- */

function fmt(x, d) { return Motor.num(x, d); }

function explicarBase(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Es el " + fmt(real, 0) + " %: " + IMAGEN.base +
    " de " + IMAGEN.total + " MB. Lo propio son " + fmt(propio(), 0) + " MB, y de esos " +
    fmt(CAPAS[2].mb, 1) + " MB los pone el pip install. El código del programa son " +
    fmt(CAPAS[3].mb * 1000, 1) + " kB.";
}

function explicarFactor(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Cabe " + fmt(real, 0) + " veces: " +
    fmt(masGrande().mb) + " MB contra " + fmt(masPequena().mb, 2) + " MB, " +
    "para el mismo programa y la misma salida. La diferencia, " + fmt(diferenciaGo()) +
    " MB, es el compilador de Go y el árbol de fuentes que la variante grande se lleva " +
    "dentro.";
}

function explicarSlim(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Son " + fmt(real, 0) + " veces: " +
    fmt(base("python:3.12")) + " MB contra " + fmt(base("python:3.12-slim")) + " MB, con el " +
    "mismo intérprete. La variante slim deja fuera compiladores y documentación.";
}

var RAZONES_DESCARGA = {
  correcta: "Es así, y es la razón práctica para ordenar bien el Dockerfile. Las capas se " +
    "identifican por su contenido: quien ya tiene la base y la capa del pip install solo " +
    "descarga lo que cambió, los " + fmt(CAPAS[3].mb * 1000, 1) + " kB del código y los " +
    "metadatos de arriba, que pesan 0 B.",
  todo: "No. La imagen nueva comparte con la anterior todas las capas que no cambiaron, y el " +
    "registro solo entrega las que faltan. Por eso publicar una versión corregida es casi " +
    "gratis en ancho de banda.",
  base: "La base no se vuelve a descargar: su capa es la misma, con el mismo identificador. " +
    "Nada la revalida, porque su contenido no cambió.",
  pip: "Está antes del código, y eso es justamente lo que la salva: las capas anteriores a la " +
    "que cambió siguen siendo válidas. Si el pip install estuviera después del COPY, sí " +
    "entraría en la descarga."
};

var RAZONES_MULTISTAGE = {
  correcta: "Es la técnica. Una etapa compila con la imagen de Go completa y la etapa final " +
    "parte de scratch y copia solo el binario con <code>COPY --from</code>. El compilador se " +
    "queda en la etapa intermedia, que no se publica.",
  comprimir: "Las capas ya viajan comprimidas, y eso no cambia lo que la imagen contiene. El " +
    "compilador seguiría dentro, ocupando espacio en disco al desempacar.",
  borrar: "No funciona: una capa posterior que borra archivos no reduce las anteriores, que " +
    "siguen en la imagen con su contenido. El archivo deja de verse y el peso se queda.",
  flags: "Las banderas de compilación recortan el binario, y aquí ya están puestas. Son " +
    "kilobytes contra el gigabyte que pesa traer el compilador adentro."
};

/* ---------- pintado y conexiones ---------- */

function textoTamano(mb) {
  if (mb === 0) { return "0 B"; }
  if (mb < 0.01) { return fmt(mb * 1000 * 1000 / 1000, 2) + " kB"; }
  if (mb < 1) { return fmt(mb * 1000, 1) + " kB"; }
  if (mb >= 1000) { return fmt(mb / 1000, 2) + " GB"; }
  /* Debajo de diez megabytes el segundo decimal todavia distingue: la imagen
     mas pequena del tema mide 2,06 MB y redondeada a 2,1 deja de coincidir
     con la salida de docker images. */
  if (mb < 10) { return fmt(mb, 2) + " MB"; }
  return fmt(mb, 1) + " MB";
}

function filasCapas() {
  return CAPAS.map(function (c) { return [c.instruccion, textoTamano(c.mb)]; });
}

function filasGo() {
  return GO.map(function (g) {
    var veces = vecesLaPequena(g.mb);
    return [g.variante, textoTamano(g.mb), fmt(veces, veces >= 100 ? 0 : 1), g.trae];
  });
}

function filasBases() {
  return BASES.slice().sort(function (a, b) { return a.mb - b.mb; }).map(function (b) {
    return [b.nombre, textoTamano(b.mb)];
  });
}

function iniciar() {
  var destapado = false;

  function pintarCapas() {
    document.getElementById("cuerpo-capas").innerHTML = filasCapas().map(function (f) {
      var celda = destapado ? "<td>" + f[1] + "</td>" : "<td class=\"pend\">?</td>";
      return "<tr><td style=\"text-align:left\"><code>" + f[0] + "</code></td>" + celda +
        "</tr>";
    }).join("");
    Motor.pintarChips("chips-peso", [
      { texto: "la base", valor: textoTamano(IMAGEN.base) },
      { texto: "lo propio", valor: destapado ? textoTamano(propio()) : "?", cuenta: true },
      { texto: "capas propias de 0 B", valor: destapado ? capasVacias() : "?" },
      { texto: "la capa más pesada, heredada", valor: destapado ? textoTamano(CAPA_DEBIAN) : "?" }
    ]);
  }

  function pintarGo() {
    document.getElementById("cuerpo-go").innerHTML = filasGo().map(function (f) {
      var resto = destapado
        ? "<td>" + f[1] + "</td><td>" + f[2] + "</td>"
        : "<td class=\"pend\">?</td><td class=\"pend\">?</td>";
      return "<tr><td style=\"text-align:left\"><code>" + f[0] + "</code></td>" + resto +
        "<td style=\"text-align:left\">" + f[3] + "</td></tr>";
    }).join("");
  }

  function pintarBases() {
    document.getElementById("cuerpo-bases").innerHTML = filasBases().map(function (f) {
      return "<tr><td style=\"text-align:left\"><code>" + f[0] + "</code></td><td>" + f[1] +
        "</td></tr>";
    }).join("");
  }

  function destapar() {
    destapado = true;
    pintarCapas();
    pintarGo();
    document.getElementById("nota-capas").hidden = false;
  }

  pintarCapas();
  pintarGo();
  pintarBases();

  Motor.conectarPrediccion(
    { entrada: "pred-base", boton: "btn-base", veredicto: "ver-base" },
    porcentajeBase, explicarBase);
  document.getElementById("btn-base").addEventListener("click", destapar);

  Motor.conectarPrediccion(
    { entrada: "pred-factor", boton: "btn-factor", veredicto: "ver-factor" },
    function () { return vecesLaPequena(masGrande().mb); }, explicarFactor);
  document.getElementById("btn-factor").addEventListener("click", destapar);

  Motor.conectarPrediccion(
    { entrada: "pred-slim", boton: "btn-slim", veredicto: "ver-slim" },
    razonSlim, explicarSlim);

  Motor.conectarOpciones("op-descarga", "ver-descarga", RAZONES_DESCARGA);
  Motor.conectarOpciones("op-multistage", "ver-multistage", RAZONES_MULTISTAGE);
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    IMAGEN: IMAGEN, CAPAS: CAPAS, CAPA_DEBIAN: CAPA_DEBIAN, GO: GO, BASES: BASES,
    porcentajeBase: porcentajeBase, propio: propio, sumaCapasPropias: sumaCapasPropias,
    capasVacias: capasVacias, masPequena: masPequena, masGrande: masGrande,
    vecesLaPequena: vecesLaPequena, diferenciaGo: diferenciaGo, base: base,
    razonSlim: razonSlim, textoTamano: textoTamano, filasCapas: filasCapas, filasGo: filasGo,
    filasBases: filasBases, explicarBase: explicarBase, explicarFactor: explicarFactor,
    explicarSlim: explicarSlim,
    RAZONES_DESCARGA: RAZONES_DESCARGA, RAZONES_MULTISTAGE: RAZONES_MULTISTAGE
  };
}
