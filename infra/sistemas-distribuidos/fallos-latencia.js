if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Disponibilidad, demora y throughput: los nueves convertidos a tiempo caido,
   los cuatro campos del resumen de ping y la conversion de la velocidad que
   informa curl. Las cifras son las de la sesion. */

var DIAS_ANO = 365;
var HORAS_DIA = 24;

var NUEVES = [
  { uptime: 99.9, nombre: "tres nueves" },
  { uptime: 99.99, nombre: "cuatro nueves" },
  { uptime: 99.999, nombre: "cinco nueves" },
  { uptime: 99.9999, nombre: "seis nueves" }
];

/* El resumen de la corrida de veinte paquetes contra google.com. */
var PING = { min: 11.394, avg: 23.377, max: 172.228, mdev: 37.439, paquetes: 20, perdida: 0 };

var ENLACES = [
  { nombre: "Gigabit cableado", throughput: "900 a 940 Mbit/s", demora: "bajo 1 ms" },
  { nombre: "Wifi de 5 GHz, buena señal", throughput: "200 a 400 Mbit/s", demora: "2 a 10 ms, con mdev alto" },
  { nombre: "Salida a internet", throughput: "lo contratado con el proveedor", demora: "10 a 60 ms a la región" },
  { nombre: "Loopback", throughput: "decenas de Gbit/s", demora: "0,03 ms" }
];

/* La descarga medida con curl. */
var CURL = { bytesPorSegundo: 34661538, segundos: 1.512595, megabytes: 50 };

/* Las dos medidas del mismo camino, en Gbit/s. */
var LOOPBACK = { iperf: 27.9, http: 10.5 };

/* ---------- las cuentas ---------- */

function segundosDelAno() { return DIAS_ANO * HORAS_DIA * 3600; }

/* Tiempo caido al ano, en segundos, para un uptime dado en por ciento. */
function caidoSegundos(uptime) { return segundosDelAno() * (100 - uptime) / 100; }

function caidoHoras(uptime) { return caidoSegundos(uptime) / 3600; }

function caidoMinutos(uptime) { return caidoSegundos(uptime) / 60; }

/* El texto de la columna: la unidad cambia segun el orden de magnitud. */
function caidoTexto(uptime) {
  var s = caidoSegundos(uptime);
  if (s >= 3600) { return Motor.num(s / 3600, 2) + " horas"; }
  /* El deck escribe 52,6 y 5,26: un decimal arriba de diez minutos y dos
     debajo, que es donde el segundo decimal todavia dice algo. */
  if (s >= 600) { return Motor.num(s / 60, 1) + " minutos"; }
  if (s >= 60) { return Motor.num(s / 60, 2) + " minutos"; }
  return Motor.num(s, 1) + " segundos";
}

function razonPico() { return PING.max / PING.min; }

/* B/s a Mbit/s: ocho bits por byte y un millon de bits por megabit. */
function mbitPorSegundo(bytesPorSegundo) { return bytesPorSegundo * 8 / 1e6; }

function megabytesPorSegundo(bytesPorSegundo) { return bytesPorSegundo / 1e6; }

function razonLoopback() { return LOOPBACK.iperf / LOOPBACK.http; }

/* ---------- veredictos y textos ---------- */

function fmt(x, d) { return Motor.num(x, d); }

function explicarNueves(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Son " + fmt(real, 2) + " horas: el 0,1 % de " +
    DIAS_ANO + " días. Cada nueve que se agrega divide eso entre diez, así que cuatro nueves " +
    "dejan " + fmt(caidoMinutos(99.99), 1) + " minutos al año y cinco nueves, " +
    fmt(caidoMinutos(99.999), 2) + ". La caída de Facebook de 2021 duró seis horas: por sí " +
    "sola se come el presupuesto de un año con tres nueves.";
}

function explicarPico(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Son " + fmt(real, 1) + " veces: " +
    fmt(PING.max, 3) + " ms contra " + fmt(PING.min, 3) + ". El mínimo es el camino sin cola " +
    "y el máximo trae una espera que no viene de la distancia. Con esa dispersión, mdev (" +
    fmt(PING.mdev, 3) + " ms) supera al promedio (" + fmt(PING.avg, 3) + " ms), y eso dice " +
    "que el promedio solo no describe el enlace.";
}

function explicarMbit(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Son " + fmt(real, 0) + " Mbit/s: " +
    fmt(CURL.bytesPorSegundo) + " bytes por segundo son " +
    fmt(megabytesPorSegundo(CURL.bytesPorSegundo), 1) + " MB/s, y cada byte son ocho bits. " +
    "La confusión entre MB/s y Mbit/s es un factor de ocho, que es justo el margen con que se " +
    "discute si un proveedor cumple lo que vendió.";
}

var RAZONES_PISO = {
  correcta: "Es el piso. El mínimo es el paquete que no esperó en ninguna cola: lo que queda " +
    "es el tiempo de ir y volver por el camino, y eso lo fija la distancia. Ninguna mejora de " +
    "software baja ese número; solo acortar la ruta o quitar saltos.",
  avg: "El promedio mezcla los paquetes que encontraron cola con los que no, así que se mueve " +
    "con la carga de la red. Aquí está al doble del mínimo sin que la distancia haya cambiado.",
  max: "El máximo es el peor caso de la corrida, " + fmt(PING.max / PING.min, 1) + " veces el " +
    "mínimo. Delata una espera puntual, no el costo del camino.",
  mdev: "mdev dice cuánto se apartan los tiempos entre sí, que es una medida de inestabilidad. " +
    "Un enlace puede tener mdev alto y un piso bajísimo, y al revés."
};

var RAZONES_PERDIDA = {
  correcta: "Es así. Un promedio bonito con 5 % de pérdida es peor noticia que un promedio " +
    "alto sin pérdida: cada paquete que falta lo retransmite TCP, y esa espera se cuenta en " +
    "segundos, no en milisegundos. El promedio de los que sí llegaron no la ve.",
  mejor: "La cifra es menor y la conclusión no se sigue. Lo que decide es qué pasa con el 5 % " +
    "que no llegó: TCP lo detecta por tiempo de espera y lo reenvía, y ahí se van segundos " +
    "enteros que no aparecen en el promedio.",
  igual: "No lo incluye. El resumen de ping promedia los paquetes que volvieron; los perdidos " +
    "se informan aparte, en la línea de packet loss. Son dos cifras que hay que leer juntas.",
  depende: "Importa en los dos casos, y de formas distintas: con UDP el dato simplemente no " +
    "llega, y con TCP llega tarde porque hubo que reenviarlo. En ninguno de los dos es una " +
    "buena noticia."
};

var RAZONES_ENLACE = {
  correcta: "Es la elección. Una conversación con medio segundo de demora en cada dirección " +
    "se vuelve un intercambio de turnos: quien habla pisa al otro. Y 5 Mbit/s alcanzan de " +
    "sobra para el video de una llamada. La demora es lo que no se puede compensar.",
  satelital: "El ancho de banda sobra en los dos casos, y es la demora la que decide. Medio " +
    "segundo de ida es un segundo de ida y vuelta: el interlocutor contesta sobre lo que uno " +
    "dijo un segundo antes.",
  ninguno: "Sí hay uno que sirve. Una videollamada pide demora baja y un ancho de banda " +
    "modesto; los 5 Mbit/s del ADSL cubren lo segundo y sus 15 ms cubren lo primero.",
  promedio: "Promediar las dos cifras no tiene sentido: miden cosas distintas y se expresan en " +
    "unidades distintas. Para cada aplicación una de las dos manda, y aquí manda la demora."
};

var RAZONES_BRECHA = {
  correcta: "Son las tres causas. iperf3 con cuatro flujos reparte el riesgo de que uno se " +
    "frene; la descarga HTTP va por un solo flujo TCP, cifra con TLS y escribe en el disco del " +
    "destino. Mismo camino, " + fmt(razonLoopback(), 1) + " veces menos.",
  miente: "Las dos informan lo que midieron, y lo que cambia es qué midieron: una mueve bytes " +
    "entre búferes y la otra sirve un archivo por HTTP sobre TLS. La comparación válida es " +
    "entre dos corridas de la misma herramienta.",
  loopback: "El loopback admite cualquier protocolo sobre IP, HTTP incluido: la medida de " +
    "10,5 Gbit/s se tomó justo así. Lo que el loopback no es, es una red: el núcleo copia de " +
    "un búfer a otro y por eso salen decenas de Gbit/s.",
  tamano: "El archivo de esa medida era de 300 MB, suficiente para que TCP abriera su ventana. " +
    "Un archivo pequeño sí deja la medición dominada por el arranque, y no es el caso aquí."
};

/* ---------- pintado y conexiones ---------- */

function filasNueves() {
  return NUEVES.map(function (n) {
    return [fmt(n.uptime, 4) + " %", n.nombre, caidoTexto(n.uptime)];
  });
}

function filasPing() {
  return [
    ["min", fmt(PING.min, 3) + " ms", "el camino sin cola: el piso que impone la distancia"],
    ["avg", fmt(PING.avg, 3) + " ms", "el promedio de los " + PING.paquetes + " paquetes"],
    ["max", fmt(PING.max, 3) + " ms", "el peor paquete, " + fmt(razonPico(), 0) + " veces el mínimo"],
    ["mdev", fmt(PING.mdev, 3) + " ms", "cuánto se apartan los tiempos entre sí"]
  ];
}

function filasEnlaces() {
  return ENLACES.map(function (e) { return [e.nombre, e.throughput, e.demora]; });
}

function iniciar() {
  var destapado = false;

  function pintarNueves() {
    document.getElementById("cuerpo-nueves").innerHTML = filasNueves().map(function (f) {
      var ultima = destapado ? "<td>" + f[2] + "</td>" : "<td class=\"pend\">?</td>";
      return "<tr><td>" + f[0] + "</td><td style=\"text-align:left\">" + f[1] + "</td>" +
        ultima + "</tr>";
    }).join("");
  }

  function pintarPing() {
    document.getElementById("cuerpo-ping").innerHTML = filasPing().map(function (f) {
      return "<tr><td><code>" + f[0] + "</code></td><td>" + f[1] +
        "</td><td style=\"text-align:left\">" + f[2] + "</td></tr>";
    }).join("");
  }

  function pintarEnlaces() {
    document.getElementById("cuerpo-enlaces").innerHTML = filasEnlaces().map(function (f) {
      return "<tr><td style=\"text-align:left\">" + f[0] + "</td><td>" + f[1] + "</td><td>" +
        f[2] + "</td></tr>";
    }).join("");
  }

  pintarNueves();
  pintarPing();
  pintarEnlaces();

  /* Dos opciones que se vean igual no pueden convivir: se descartan las
     que repitan el valor de otra antes de devolver la lista. */
  function sinRepetidos(lista) {
    var vistos = {};
    return lista.filter(function (o) {
      var ya = vistos[o.valor];
      vistos[o.valor] = true;
      return !ya;
    });
  }

  Motor.opcionesNumericas("op-nueves", "ver-nueves", function () {
    var real = caidoHoras(99.9);
    return sinRepetidos([
      { valor: fmt(real, 2), clave: "correcta", razon: explicarNueves(true, real) },
      { valor: fmt(caidoHoras(99), 2), clave: "dos-nueves",
        razon: "Eso es lo que deja un 99 %, con dos nueves. Con tres nueves el tiempo caído es " +
          "el 0,1 % del año, diez veces menos." },
      { valor: fmt(caidoHoras(99.99), 2), clave: "cuatro-nueves",
        razon: "Eso es lo que deja un 99,99 %, con cuatro nueves: " +
          fmt(caidoMinutos(99.99), 1) + " minutos. Aquí son tres nueves, diez veces más." },
      { valor: fmt(DIAS_ANO * 0.001, 3), clave: "dias",
        razon: "Eso es el 0,1 % de " + DIAS_ANO + ", y son días. Para dar horas se multiplica " +
          "por 24." }
    ]);
  });
  document.getElementById("op-nueves").addEventListener("click", function () {
    destapado = true;
    pintarNueves();
    document.getElementById("nota-nueves").hidden = false;
  });

  Motor.opcionesNumericas("op-pico", "ver-pico", function () {
    var real = razonPico();
    return sinRepetidos([
      { valor: fmt(real, 1), clave: "correcta", razon: explicarPico(true, real) },
      { valor: fmt(PING.max / PING.avg, 1), clave: "contra-avg",
        razon: "Eso compara el máximo con el promedio. La pregunta es contra el mínimo, el " +
          "camino sin cola." },
      { valor: fmt(PING.avg / PING.min, 1), clave: "avg-min",
        razon: "Eso es el promedio contra el mínimo. El peor paquete es el máximo, " +
          fmt(PING.max, 3) + " ms." },
      { valor: fmt(PING.max / PING.mdev, 1), clave: "contra-mdev",
        razon: "Eso divide entre mdev, que mide dispersión, no un tiempo de paquete. El piso " +
          "con el que se compara es el mínimo." }
    ]);
  });

  Motor.opcionesNumericas("op-mbit", "ver-mbit", function () {
    var real = mbitPorSegundo(CURL.bytesPorSegundo);
    return sinRepetidos([
      { valor: fmt(real, 0), clave: "correcta", razon: explicarMbit(true, real) },
      { valor: fmt(megabytesPorSegundo(CURL.bytesPorSegundo), 0), clave: "bytes",
        razon: "Eso son los megabytes por segundo, sin pasar a bits. Cada byte son ocho bits, " +
          "así que la cifra en Mbit/s es ocho veces mayor." },
      { valor: fmt(megabytesPorSegundo(CURL.bytesPorSegundo) / 8, 0), clave: "al-reves",
        razon: "Eso divide entre ocho, que es pasar de bits a bytes. Aquí se va de bytes a " +
          "bits, y se multiplica." },
      { valor: fmt(CURL.bytesPorSegundo * 8 / 1048576, 0), clave: "mebi",
        razon: "Eso divide entre 1.048.576, que son mebibits. Un megabit son un millón de " +
          "bits, y los proveedores venden en esas unidades." }
    ]);
  });

  Motor.conectarOpciones("op-piso", "ver-piso", RAZONES_PISO);
  Motor.conectarOpciones("op-perdida", "ver-perdida", RAZONES_PERDIDA);
  Motor.conectarOpciones("op-enlace", "ver-enlace", RAZONES_ENLACE);
  Motor.conectarOpciones("op-brecha", "ver-brecha", RAZONES_BRECHA);
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    NUEVES: NUEVES, PING: PING, ENLACES: ENLACES, CURL: CURL, LOOPBACK: LOOPBACK,
    caidoSegundos: caidoSegundos, caidoHoras: caidoHoras, caidoMinutos: caidoMinutos,
    caidoTexto: caidoTexto, razonPico: razonPico, mbitPorSegundo: mbitPorSegundo,
    megabytesPorSegundo: megabytesPorSegundo, razonLoopback: razonLoopback,
    filasNueves: filasNueves, filasPing: filasPing, filasEnlaces: filasEnlaces,
    explicarNueves: explicarNueves, explicarPico: explicarPico, explicarMbit: explicarMbit,
    RAZONES_PISO: RAZONES_PISO, RAZONES_PERDIDA: RAZONES_PERDIDA,
    RAZONES_ENLACE: RAZONES_ENLACE, RAZONES_BRECHA: RAZONES_BRECHA
  };
}
