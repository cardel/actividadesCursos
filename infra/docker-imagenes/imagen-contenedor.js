if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Imagen, contenedor y lo que el proceso cree: las cifras de la imagen de
   nginx que se levanto dos veces y los limites del cgroup medidos contra lo
   que informan nproc y free dentro del contenedor. */

var IMAGEN = { nombre: "nginx:1.27-alpine", discoMb: 74.5, contenidoMb: 21.9, contenedores: 2 };

/* El contenedor del tercer apartado, creado con --cpus=1.5 --memory=256m
   --pids-limit=64. cpu.max trae cuota y periodo en microsegundos. */
var CGROUP = { cuota: 150000, periodo: 100000, memoriaBytes: 268435456, pids: 64 };

/* Lo que el contenedor informa cuando le preguntan: son cifras del anfitrion. */
var ANFITRION = { nproc: 12, memoriaMb: 31993 };

var STATS = { uso: "388KiB", limite: "256MiB", porcentaje: 0.15, pids: 1 };

var BYTES_MIB = 1024 * 1024;

/* ---------- las cuentas ---------- */

/* Los nucleos que impone el cgroup: cuota entre periodo. */
function nucleosDelCgroup() { return CGROUP.cuota / CGROUP.periodo; }

function memoriaMib() { return CGROUP.memoriaBytes / BYTES_MIB; }

/* Cuanto disco agrega un contenedor mas de la misma imagen: las capas ya
   estan, y lo unico nuevo es su capa escribible, vacia al arrancar. */
function discoDelSiguienteContenedor() { return 0; }

/* Lo que costaria si cada contenedor copiara la imagen. */
function discoSiCopiara(contenedores) { return IMAGEN.discoMb * contenedores; }

/* Cuantas veces se equivoca quien dimensiona con nproc. */
function razonHilos() { return ANFITRION.nproc / nucleosDelCgroup(); }

function razonMemoria() { return ANFITRION.memoriaMb / memoriaMib(); }

/* ---------- veredictos y textos ---------- */

function fmt(x, d) { return Motor.num(x, d); }

function explicarTercero(bien, real, dicho) {
  var base = bien ? "Correcto. " : "No. ";
  if (!bien && dicho === IMAGEN.discoMb) {
    base = "No, y es el error que vale la pena ver: ";
  }
  return base + "No cuesta nada, " + fmt(real) + " MB. Los " + fmt(IMAGEN.discoMb, 1) +
    " MB se descargaron una vez y las capas se comparten en modo lectura; cada contenedor " +
    "agrega su capa escribible, vacía al arrancar. Si cada uno copiara la imagen, tres " +
    "contenedores costarían " + fmt(discoSiCopiara(3), 1) + " MB en vez de " +
    fmt(IMAGEN.discoMb, 1) + ".";
}

function explicarCpu(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Son " + fmt(real, 1) + " núcleos: " +
    fmt(CGROUP.cuota) + " microsegundos de cuota por cada " + fmt(CGROUP.periodo) +
    " de periodo. Así se lee <code>cpu.max</code>, y es la única cifra que corresponde al " +
    "contenedor: <code>nproc</code> adentro responde " + ANFITRION.nproc + ", que son los " +
    "núcleos del anfitrión.";
}

function explicarMem(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Son " + fmt(real) + " MiB: " +
    fmt(CGROUP.memoriaBytes) + " bytes entre 1024 dos veces. Dentro del contenedor " +
    "<code>free -m</code> informa " + fmt(ANFITRION.memoriaMb) + " MB, " +
    fmt(razonMemoria(), 0) + " veces más de lo que el cgroup le deja usar.";
}

var RAZONES_ARRANQUE = {
  correcta: "Es la razón. La máquina virtual arranca un núcleo completo encima del hipervisor, " +
    "con su detección de hardware y sus servicios; el contenedor es un proceso que el núcleo " +
    "del anfitrión pone a correr con otra vista del sistema de archivos, de la red y de los " +
    "PID. Lo que se evita es el arranque entero de un sistema operativo.",
  liviano: "El tamaño ayuda a descargar y no explica el arranque. Una imagen de contenedor de " +
    "1,27 GB también arranca en milisegundos, porque lo que se inicia es un proceso.",
  cache: "No hay nada precalentado: `docker run` crea el contenedor en ese momento. Lo que " +
    "existe de antes son las capas de la imagen, ya en disco, y eso ahorra la descarga.",
  red: "Sí la configura: le arma su propio namespace de red con su interfaz y su dirección. " +
    "Eso toma milisegundos, no segundos."
};

var RAZONES_ANALOGIA = {
  correcta: "Es lo que dice la analogía, y tiene consecuencia práctica: la imagen es inmutable " +
    "y compartida, y cada contenedor escribe en su propia capa. Dos contenedores de la misma " +
    "imagen pueden terminar con contenidos distintos sin que la imagen cambie.",
  copia: "No. Las capas de la imagen se comparten en modo lectura entre todos los contenedores " +
    "que la usen; por eso el segundo contenedor no vuelve a costar " +
    fmt(IMAGEN.discoMb, 1) + " MB.",
  muta: "Al contrario: la imagen es inmutable. Lo que el contenedor escribe vive en su capa " +
    "escribible y se pierde cuando se lo borra, salvo que se haya montado un volumen.",
  uno: "De una imagen salen tantos contenedores a la vez como se quiera, y es justo lo que " +
    "hace posible replicar un servicio: la misma imagen corriendo en varias copias."
};

var RAZONES_DIAGNOSTICO = {
  correcta: "Es el diagnóstico. El cgroup impone " + fmt(memoriaMib()) + " MiB y el programa " +
    "pregunta al sistema cuánta memoria hay: <code>free</code> le responde con los " +
    fmt(ANFITRION.memoriaMb) + " MB del anfitrión, porque lee <code>/proc</code>, que no está " +
    "aislado. Dimensiona para una máquina " + fmt(razonMemoria(), 0) + " veces más grande que " +
    "la que tiene.",
  docker: "Docker informa bien: <code>docker stats</code> muestra " + STATS.uso + " / " +
    STATS.limite + ". Lo que no está aislado es <code>/proc</code>, que es donde mira el " +
    "programa cuando pregunta por su cuenta.",
  kernel: "El límite sí se aplica, y de la forma más visible: el proceso que lo pasa muere por " +
    "falta de memoria. El problema es que el programa nunca supo cuál era el límite.",
  imagen: "La imagen base influye en el tamaño y en lo que trae instalado, no en lo que " +
    "<code>free</code> informa. Con cualquier base, ese comando seguiría contando la memoria " +
    "del anfitrión."
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

/* Las opciones del disco del tercer contenedor, en megabytes. */
function opcionesTercero() {
  var real = discoDelSiguienteContenedor();
  return sinRepetidas([
    { valor: fmt(real) + " MB", clave: "correcta", razon: explicarTercero(true, real) },
    { valor: fmt(IMAGEN.discoMb, 1) + " MB", clave: "copia",
      razon: "Eso es lo que costaría si cada contenedor copiara la imagen. Las capas se " +
        "comparten en modo lectura: los " + fmt(IMAGEN.discoMb, 1) + " MB se descargaron " +
        "una vez y el tercero solo agrega su capa escribible, vacía al arrancar." },
    { valor: fmt(IMAGEN.contenidoMb, 1) + " MB", clave: "comprimida",
      razon: "Son los " + fmt(IMAGEN.contenidoMb, 1) + " MB del contenido comprimido, que " +
        "viajan una vez al descargar. Un contenedor nuevo no vuelve a bajarlos ni a " +
        "desempacarlos." },
    { valor: fmt(discoSiCopiara(3), 1) + " MB", clave: "triple",
      razon: "Es lo que ocuparían tres contenedores si cada uno trajera su copia de la " +
        "imagen. Con capas compartidas, el tercero no suma nada a lo que ya había." }
  ]);
}

/* Las opciones de los nucleos que dice cpu.max. */
function opcionesCpu() {
  var real = nucleosDelCgroup();
  return sinRepetidas([
    { valor: fmt(real, 1) + " núcleos", clave: "correcta", razon: explicarCpu(true, real) },
    { valor: fmt(CGROUP.periodo / CGROUP.cuota, 1) + " núcleos", clave: "inversa",
      razon: "Está dividido al revés: " + fmt(CGROUP.periodo) + " entre " + fmt(CGROUP.cuota) +
        ". Los núcleos son la cuota entre el periodo, y una cuota mayor que el periodo " +
        "significa más de un núcleo." },
    { valor: fmt(ANFITRION.nproc) + " núcleos", clave: "nproc",
      razon: "Esos son los núcleos del anfitrión, lo que responde <code>nproc</code> dentro " +
        "del contenedor porque lee <code>/proc</code>. El límite del cgroup es otro número." },
    { valor: fmt(CGROUP.cuota / 1000) + " núcleos", clave: "cuota",
      razon: "Solo dividió la cuota entre mil y no la comparó con el periodo. " +
        "<code>cpu.max</code> trae dos números: " + fmt(CGROUP.cuota) + " microsegundos de " +
        "cuota por cada " + fmt(CGROUP.periodo) + " de periodo." }
  ]);
}

/* Las opciones de memory.max en mebibytes. */
function opcionesMem() {
  var real = memoriaMib();
  return sinRepetidas([
    { valor: fmt(real) + " MiB", clave: "correcta", razon: explicarMem(true, real) },
    { valor: fmt(CGROUP.memoriaBytes) + " MiB", clave: "bytes",
      razon: "Ese es el número en bytes, sin convertir. Un mebibyte son 1024 por 1024 bytes." },
    { valor: fmt(CGROUP.memoriaBytes / 1024) + " MiB", clave: "kib",
      razon: "Dividió entre 1024 una sola vez: eso da kibibytes, no mebibytes. Falta la " +
        "segunda división." },
    { valor: fmt(CGROUP.memoriaBytes / 1000000) + " MiB", clave: "decimal",
      razon: "Dividió entre un millón, que da megabytes decimales (" +
        fmt(CGROUP.memoriaBytes / 1000000) + " MB). El mebibyte es 1024 por 1024 bytes, y " +
        "por eso la cifra exacta es " + fmt(real) + "." }
  ]);
}

/* ---------- pintado y conexiones ---------- */

function filasLimites() {
  return [
    ["CPU", fmt(CGROUP.cuota) + " / " + fmt(CGROUP.periodo) + " = " +
      fmt(nucleosDelCgroup(), 1) + " núcleos", "<code>nproc</code> dice " + ANFITRION.nproc],
    ["Memoria", fmt(CGROUP.memoriaBytes) + " = " + fmt(memoriaMib()) + " MiB",
      "<code>free -m</code> dice " + fmt(ANFITRION.memoriaMb) + " MB"],
    ["Procesos", fmt(CGROUP.pids), "sin herramienta que lo muestre"]
  ];
}

function iniciar() {
  var destapado = false;

  function pintarChips() {
    Motor.pintarChips("chips-imagen", [
      { texto: "en disco, una sola vez", valor: fmt(IMAGEN.discoMb, 1) + " MB" },
      { texto: "contenido de la imagen", valor: fmt(IMAGEN.contenidoMb, 1) + " MB" },
      { texto: "contenedores levantados", valor: fmt(IMAGEN.contenedores) },
      { texto: "disco del tercero",
        valor: destapado ? fmt(discoDelSiguienteContenedor()) + " MB" : "?", cuenta: true }
    ]);
  }

  function pintarLimites() {
    document.getElementById("cuerpo-limites").innerHTML = filasLimites().map(function (f) {
      var resto = destapado
        ? "<td>" + f[1] + "</td><td>" + f[2] + "</td>"
        : "<td class=\"pend\">?</td><td>" + f[2] + "</td>";
      return "<tr><td style=\"text-align:left\">" + f[0] + "</td>" + resto + "</tr>";
    }).join("");
  }

  function destapar() {
    destapado = true;
    pintarChips();
    pintarLimites();
    document.getElementById("nota-limites").hidden = false;
  }

  pintarChips();
  pintarLimites();

  Motor.opcionesNumericas("op-tercero", "ver-tercero", opcionesTercero);
  document.getElementById("op-tercero").addEventListener("click", destapar);

  Motor.opcionesNumericas("op-cpu", "ver-cpu", opcionesCpu);
  document.getElementById("op-cpu").addEventListener("click", destapar);

  Motor.opcionesNumericas("op-mem", "ver-mem", opcionesMem);
  document.getElementById("op-mem").addEventListener("click", destapar);

  Motor.conectarOpciones("op-arranque", "ver-arranque", RAZONES_ARRANQUE);
  Motor.conectarOpciones("op-analogia", "ver-analogia", RAZONES_ANALOGIA);
  Motor.conectarOpciones("op-diagnostico", "ver-diagnostico", RAZONES_DIAGNOSTICO);
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    IMAGEN: IMAGEN, CGROUP: CGROUP, ANFITRION: ANFITRION, STATS: STATS,
    nucleosDelCgroup: nucleosDelCgroup, memoriaMib: memoriaMib,
    discoDelSiguienteContenedor: discoDelSiguienteContenedor, discoSiCopiara: discoSiCopiara,
    razonHilos: razonHilos, razonMemoria: razonMemoria, filasLimites: filasLimites,
    explicarTercero: explicarTercero, explicarCpu: explicarCpu, explicarMem: explicarMem,
    RAZONES_ARRANQUE: RAZONES_ARRANQUE, RAZONES_ANALOGIA: RAZONES_ANALOGIA,
    RAZONES_DIAGNOSTICO: RAZONES_DIAGNOSTICO
  };
}
