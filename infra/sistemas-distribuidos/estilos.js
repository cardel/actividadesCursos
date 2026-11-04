if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Siete estilos, casos reales. ESTILOS trae la tabla de las tres preguntas
   (donde vive el estado, cuanto acopla, que cuesta) y CASOS el banco de diez
   sistemas que se clasifican en uno de los siete, cada uno con razon escrita
   para las siete opciones. Las cuentas son razonesPara(), contarAciertos(),
   repartoPorEstilo() y validar().                                           */

var CLAVES = ["cliente-servidor", "capas", "microservicios", "p2p", "datos",
  "soa", "eventos"];

var NOMBRES = {
  "cliente-servidor": "Cliente-servidor",
  capas: "En capas",
  microservicios: "Microservicios",
  p2p: "Entre pares (P2P)",
  datos: "Centrada en datos",
  soa: "Orientada a servicios (SOA)",
  eventos: "Basada en eventos"
};

var ESTILOS = [
  {
    clave: "cliente-servidor",
    estado: "en el servidor",
    acople: "medio: el cliente apunta a un servidor conocido",
    cuesta: "un solo punto que concentra la carga y falla solo",
    nota: "Dos papeles fijos y el estado detrás del servidor. Toda la carga de " +
      "todos los clientes cae en la misma máquina, y cuando esa máquina se cae " +
      "no queda nada funcionando."
  },
  {
    clave: "capas",
    estado: "en la capa de datos, al fondo",
    acople: "alto hacia abajo, ninguno hacia arriba",
    cuesta: "cada petición atraviesa todas las capas",
    nota: "El orden de las llamadas define el estilo: cada capa conoce la de " +
      "abajo y nunca la de arriba, así que una capa se reemplaza sin tocar las " +
      "demás. El precio es que toda petición las recorre completas."
  },
  {
    clave: "microservicios",
    estado: "uno propio por servicio",
    acople: "bajo en el código, alto en la red",
    cuesta: "despliegues, trazas y consistencia entre servicios",
    nota: "Cada servicio es dueño de sus datos y se despliega solo. Lo que se " +
      "gana en independencia se paga en red: una operación que antes era una " +
      "llamada de función ahora cruza varias máquinas."
  },
  {
    clave: "p2p",
    estado: "repartido entre los pares",
    acople: "ninguno fijo: los pares entran y salen",
    cuesta: "encontrar quién tiene el dato que falta",
    nota: "Todos los nodos cumplen el mismo papel y la capacidad crece con " +
      "quien se conecta. Lo que queda por resolver es la búsqueda: nadie tiene " +
      "la lista de quién guarda qué."
  },
  {
    clave: "datos",
    estado: "en el repositorio compartido",
    acople: "alto: todos contra el mismo esquema",
    cuesta: "cambiar el esquema toca a todos a la vez",
    nota: "Los componentes no se conocen entre ellos, solo conocen el " +
      "almacenamiento común. Funciona bien hasta que una tabla cambia, porque " +
      "entonces cambia para todos el mismo día."
  },
  {
    clave: "soa",
    estado: "dentro de cada servicio",
    acople: "por contrato publicado",
    cuesta: "el bus del medio y el gobierno de los contratos",
    nota: "La pieza es el servicio con contrato publicado, pensado para que " +
      "otros sistemas lo reutilicen. El bus concentra el enrutamiento y pasa a " +
      "ser una pieza más que hay que mantener y vigilar."
  },
  {
    clave: "eventos",
    estado: "en el registro de eventos y en cada consumidor",
    acople: "bajo: el productor no conoce al consumidor",
    cuesta: "el orden, los duplicados y seguir una operación completa",
    nota: "El productor publica lo que pasó y sigue; se suscribe quien le " +
      "interese. Nadie espera a nadie, y a cambio el orden de llegada y los " +
      "mensajes repetidos pasan a ser problema del consumidor."
  }
];

var CASOS = [
  {
    id: "mensajeria",
    rotulo: "Mensajería con servidores centrales",
    texto: "Una aplicación de mensajería donde cada teléfono abre una conexión " +
      "con los servidores de la empresa, que guardan los mensajes pendientes y " +
      "los entregan cuando el destinatario vuelve a conectarse.",
    correcta: "cliente-servidor",
    razones: {
      "cliente-servidor": "Sí. Los teléfonos piden y el servidor responde: el " +
        "estado de la conversación y la decisión de cuándo entregar están los " +
        "dos del lado del servidor.",
      capas: "El servidor por dentro puede estar en capas, y lo que el caso " +
        "describe es quién pide y quién responde, no cómo está organizado el " +
        "código del servidor.",
      microservicios: "Nada dice que el servidor esté partido en piezas con su " +
        "propia base y su propio despliegue; con un servidor alcanza para lo " +
        "que se cuenta.",
      p2p: "No hay pares que sirvan lo que otros piden: sin los servidores de " +
        "la empresa, dos teléfonos en la misma red no se hablan.",
      datos: "El estado vive en el servidor, y los clientes no se coordinan " +
        "leyendo y escribiendo un repositorio común: le piden al servidor y él " +
        "decide qué entrega.",
      soa: "Falta el contrato publicado para que otros sistemas consuman el " +
        "servicio; aquí el único consumidor es la aplicación de la misma " +
        "empresa.",
      eventos: "La entrega al reconectarse se parece a una notificación, y la " +
        "pide el teléfono: nadie publica un hecho para que terceros " +
        "desconocidos reaccionen."
    }
  },
  {
    id: "bittorrent",
    rotulo: "Reparto de archivos de BitTorrent",
    texto: "El reparto de un archivo grande donde cada computador que ya bajó " +
      "un pedazo lo sirve a los demás, y ninguna máquina guarda la copia " +
      "completa de forma permanente.",
    correcta: "p2p",
    razones: {
      p2p: "Sí. Cada computador es cliente y servidor a la vez: pide los " +
        "pedazos que le faltan y sirve los que ya tiene, y mientras más " +
        "conectados haya, más capacidad de reparto hay.",
      "cliente-servidor": "No hay un servidor que guarde el archivo. El " +
        "rastreador solo ayuda a que los pares se encuentren, y los datos no " +
        "pasan por él.",
      capas: "Las capas ordenan llamadas dentro de un programa. Aquí lo que se " +
        "describe es el reparto entre máquinas, todas con el mismo papel.",
      microservicios: "Los pares no son servicios con funciones distintas: " +
        "todos corren el mismo programa y hacen exactamente lo mismo.",
      datos: "No hay un repositorio común donde cada uno deje su parte; los " +
        "pedazos viajan directo de un par al siguiente.",
      soa: "No hay contratos publicados ni servicios que otros inviten a " +
        "invocar, solo un protocolo que todos los pares hablan de igual a igual.",
      eventos: "Que entre un par nuevo no es un evento que se publique para " +
        "que otros reaccionen: el par pregunta quién tiene qué y se le responde."
    }
  },
  {
    id: "tienda",
    rotulo: "Tienda con pago, inventario y envíos aparte",
    texto: "Una tienda en línea donde el pago, el inventario y los envíos son " +
      "tres programas con su propia base de datos, se despliegan por separado y " +
      "cada equipo sube el suyo cuando lo tiene listo.",
    correcta: "microservicios",
    razones: {
      microservicios: "Sí. Tres piezas, cada una dueña de sus datos, de su " +
        "despliegue y de su ritmo de cambio: el inventario se puede escalar en " +
        "temporada alta sin tocar el pago.",
      "cliente-servidor": "Desde el navegador la tienda se ve como cliente y " +
        "servidor, y eso no explica por qué el pago y el inventario se " +
        "despliegan por separado, que es lo que el caso resalta.",
      capas: "Si fueran capas del mismo despliegue, subir el pago obligaría a " +
        "subir todo. El caso dice que cada equipo sube el suyo cuando quiere.",
      p2p: "Los tres programas no son intercambiables: cada uno hace algo " +
        "distinto y ninguno sirve lo que otro guarda.",
      datos: "Cada servicio tiene su propia base, que es lo contrario de " +
        "coordinarse a través de un repositorio compartido.",
      soa: "Se parece, y la diferencia está en el tamaño y en el medio: SOA " +
        "publica servicios gruesos con contrato y suele poner un bus, mientras " +
        "aquí hay piezas chicas, con base propia y despliegue independiente.",
      eventos: "El caso no dice cómo se enteran unos de otros, así que lo que " +
        "lo define es cómo está partido y desplegado."
    }
  },
  {
    id: "informe",
    rotulo: "Informe que varias áreas arman sobre la misma base",
    texto: "Tres áreas de una empresa arman su informe mensual leyendo y " +
      "escribiendo la misma base de datos corporativa. Ninguna llama a la otra: " +
      "lo que una deja en las tablas es lo que la siguiente encuentra.",
    correcta: "datos",
    razones: {
      datos: "Sí. La coordinación ocurre dentro del repositorio: el esquema de " +
        "la base es el contrato entre las tres áreas, y nadie invoca a nadie.",
      "cliente-servidor": "Todas hablan con el motor de base de datos, y eso " +
        "describe el transporte; lo que caracteriza el caso es que el acuerdo " +
        "entre las áreas está en las tablas.",
      capas: "No hay un orden de llamadas de arriba hacia abajo: las tres áreas " +
        "están al mismo nivel, alrededor del mismo almacenamiento.",
      microservicios: "Compartir la base es justo lo que microservicios evita. " +
        "Aquí nadie es dueño exclusivo de sus datos.",
      p2p: "Los programas no se piden nada unos a otros; todo lo que viaja " +
        "entre ellos pasa por el repositorio del medio.",
      soa: "No hay servicios con contrato que unos invoquen a otros. El " +
        "acuerdo son los nombres y los tipos de las columnas.",
      eventos: "Escribir una fila no avisa a nadie: la otra área se entera " +
        "cuando le toca consultar."
    }
  },
  {
    id: "tablero",
    rotulo: "Tablero de una aerolínea",
    texto: "El tablero de una aerolínea: cada cambio de puerta o de hora se " +
      "publica una sola vez, y las pantallas del aeropuerto, la aplicación " +
      "móvil y el correo de aviso reaccionan sin que quien publicó sepa " +
      "quiénes son.",
    correcta: "eventos",
    razones: {
      eventos: "Sí. El cambio se publica y se suscribe quien quiera reaccionar. " +
        "Agregar mañana un cuarto consumidor, como una pantalla en la sala de " +
        "abordaje, no obliga a tocar al que publica.",
      "cliente-servidor": "Si cada pantalla preguntara cada tanto si algo " +
        "cambió, sería cliente y servidor. El caso dice que el cambio se " +
        "publica y las pantallas reaccionan.",
      capas: "Las capas dicen quién llama a quién dentro de un programa. Aquí " +
        "nadie llama a nadie: se publica y se consume.",
      microservicios: "Las pantallas y la aplicación móvil bien pueden ser " +
        "servicios separados, y lo que el caso resalta es la forma de " +
        "enterarse, no el despliegue.",
      p2p: "Los consumidores no se sirven entre ellos; los tres leen lo que se " +
        "publicó en el mismo lugar.",
      datos: "Si cada consumidor consultara una tabla con el estado de los " +
        "vuelos, el estilo sería otro. Un evento lleva lo que cambió, no la " +
        "foto completa.",
      soa: "En SOA el consumidor invoca el servicio y espera la respuesta. " +
        "Aquí el que publica no espera nada y no conoce a quien escucha."
    }
  },
  {
    id: "intranet",
    rotulo: "Intranet que expone servicios con contrato",
    texto: "Una intranet publica el servicio de consulta de empleados con su " +
      "contrato descrito, y las dependencias de nómina, bienestar y seguridad " +
      "lo invocan a través del bus de la entidad sin saber cómo está hecho por " +
      "dentro.",
    correcta: "soa",
    razones: {
      soa: "Sí. Un servicio publicado con contrato, reutilizado por varias " +
        "dependencias y alcanzado por el bus: el consumidor programa contra el " +
        "contrato y no contra la implementación.",
      microservicios: "Un servicio grueso que varias dependencias reutilizan " +
        "por contrato no es lo mismo que partir una aplicación en piezas chicas " +
        "con despliegue y base propios.",
      "cliente-servidor": "Las dependencias invocan algo remoto, cierto, y lo " +
        "que distingue el caso es el contrato publicado y el bus en el medio, " +
        "que permiten cambiar el proveedor sin avisarle a los consumidores.",
      capas: "El servicio puede estar hecho en capas por dentro. Lo que el caso " +
        "describe es cómo lo consumen otros sistemas.",
      p2p: "Hay un proveedor y varios consumidores con papeles fijos, no pares " +
        "que se sirvan entre sí.",
      datos: "Las dependencias no entran a las tablas de personal: piden por la " +
        "interfaz, y eso es lo que permite cambiar el almacenamiento sin " +
        "romperles nada.",
      eventos: "La invocación es una pregunta con respuesta. Nadie publica un " +
        "hecho para que otros reaccionen cuando puedan."
    }
  },
  {
    id: "escritorio",
    rotulo: "Escritorio contra un servidor de base de datos",
    texto: "Una aplicación de escritorio instalada en cada puesto de trabajo " +
      "abre una conexión con el servidor de base de datos de la oficina y le " +
      "manda sus consultas.",
    correcta: "cliente-servidor",
    razones: {
      "cliente-servidor": "Sí. Dos partes y nada más: el programa instalado es " +
        "el cliente, el motor de base de datos es el servidor, y el estado " +
        "queda del lado del servidor.",
      datos: "Sería centrada en datos si varios programas distintos se " +
        "coordinaran por esas tablas. Aquí la base la usa una sola aplicación, " +
        "que le manda consultas.",
      capas: "La interfaz y las consultas están mezcladas en el mismo " +
        "programa. Para hablar de capas habría que ver un bloque intermedio con " +
        "las reglas.",
      microservicios: "Un ejecutable y un motor de base de datos no son " +
        "servicios desplegados por separado, cada uno con su propio " +
        "almacenamiento.",
      p2p: "Los puestos de trabajo no se hablan entre ellos; cada uno va por su " +
        "cuenta al mismo servidor.",
      soa: "El motor de base de datos no publica un contrato de negocio: recibe " +
        "consultas escritas contra su esquema, que es lo que un contrato " +
        "justamente esconde.",
      eventos: "La aplicación pregunta y se queda esperando la respuesta. No " +
        "hay nada publicado para que otros reaccionen."
    }
  },
  {
    id: "matriculas",
    rotulo: "Portal de matrículas en tres bloques",
    texto: "Un portal de matrículas con la interfaz, las reglas de validación y " +
      "el acceso a datos en tres bloques del mismo despliegue: la interfaz solo " +
      "llama a las reglas, y las reglas solo al acceso a datos.",
    correcta: "capas",
    razones: {
      capas: "Sí. Tres bloques en un orden fijo, cada uno llamando solo al de " +
        "abajo: cambiar el acceso a datos no obliga a tocar la interfaz, y la " +
        "interfaz nunca consulta la base directo.",
      microservicios: "Los tres bloques viven en el mismo despliegue y suben " +
        "juntos. Son capas de una aplicación, no servicios independientes.",
      "cliente-servidor": "El navegador y el portal son cliente y servidor, y " +
        "eso no dice nada de los tres bloques en los que el portal está " +
        "organizado por dentro, que es lo que el caso describe.",
      datos: "La base la usa solo la capa de acceso a datos. Ningún otro " +
        "programa se coordina escribiendo en esas tablas.",
      p2p: "Los bloques tienen papeles distintos y un orden de llamadas; no son " +
        "iguales entre sí ni intercambiables.",
      soa: "No hay un contrato publicado para que otros sistemas invoquen las " +
        "reglas de validación: las usa la interfaz del mismo portal.",
      eventos: "Cada llamada espera la respuesta de la capa de abajo. No se " +
        "publica nada en ningún registro."
    }
  },
  {
    id: "videollamada",
    rotulo: "Videollamada directa entre tres equipos",
    texto: "Una videollamada de tres personas donde el audio y el video viajan " +
      "directo entre los equipos, y el servidor solo sirvió al principio para " +
      "que se encontraran.",
    correcta: "p2p",
    razones: {
      p2p: "Sí. Una vez los equipos se encontraron, los datos van de uno a otro " +
        "y los tres cumplen el mismo papel: el servidor de encuentro no ve el " +
        "audio ni el video.",
      "cliente-servidor": "El servidor del principio solo los presenta y ahí " +
        "termina su trabajo. Si el video pasara por él, el estilo sí sería este, " +
        "y la latencia y el costo serían otros.",
      capas: "Las capas organizan un programa por dentro. Lo que el caso " +
        "describe es por dónde viajan los datos entre máquinas.",
      microservicios: "No hay servicios con funciones distintas desplegados por " +
        "separado: hay tres equipos haciendo lo mismo.",
      datos: "No hay repositorio compartido. El audio pasa directo y no queda " +
        "guardado en ningún lugar del medio.",
      soa: "No hay contrato publicado ni servicio que se invoque, solo un " +
        "protocolo que los tres equipos hablan de igual a igual.",
      eventos: "El aviso inicial para encontrarse se le parece, y el caso se " +
        "define por el tramo largo, en el que los equipos se envían datos " +
        "directo."
    }
  },
  {
    id: "lote-nocturno",
    rotulo: "Lote nocturno por carpeta compartida",
    texto: "Un banco procesa un lote de noche: el programa de cartera deja un " +
      "archivo en la carpeta compartida y el de contabilidad lo lee de ahí a la " +
      "hora siguiente y escribe otro archivo.",
    correcta: "datos",
    razones: {
      datos: "Sí. La carpeta compartida es el repositorio del medio: cartera " +
        "deja su resultado escrito y contabilidad lo recoge, sin que ninguno " +
        "llame al otro ni sepa si el otro está corriendo.",
      "cliente-servidor": "Ninguno de los dos programas atiende peticiones del " +
        "otro. Se dejan el trabajo escrito y terminan.",
      capas: "Los dos programas están al mismo nivel y corren en momentos " +
        "distintos. No hay una pila de llamadas que los una.",
      microservicios: "Son dos programas de lote que comparten el " +
        "almacenamiento, no servicios con su propio dato y su propio despliegue.",
      p2p: "No se buscan entre ellos ni se sirven pedazos: el archivo del medio " +
        "es el único punto de contacto.",
      soa: "No hay servicio publicado ni invocación, sino una convención sobre " +
        "el nombre y el formato del archivo.",
      eventos: "Dejar el archivo no avisa a nadie: contabilidad arranca por " +
        "horario y asume que ya está escrito. Con un aviso de archivo listo en " +
        "lugar del horario, el otro estilo sí entraría."
    }
  }
];

var RAZONES_MIXTO_A = {
  correcta: "Es la lectura. Microservicios explica cómo está partido y " +
    "desplegado, con una base por servicio; basada en eventos explica cómo se " +
    "enteran unos de otros, sin llamarse ni esperarse. Son dos decisiones " +
    "distintas y cada estilo nombra una.",
  "solo-micro": "Falta la mitad. La forma de comunicarse cambia lo que el " +
    "sistema garantiza: con eventos nadie espera respuesta, el orden de llegada " +
    "deja de estar dado y el reparto puede recibir dos veces el mismo aviso.",
  "solo-eventos": "Falta la otra mitad. El registro explica cómo hablan, no por " +
    "qué cada pieza tiene su propia base y se despliega sola, que es lo que " +
    "permite subir el cobro sin tocar el reparto.",
  ninguno: "No. Los estilos no son cajones excluyentes: describen decisiones " +
    "distintas sobre el mismo sistema, y un diseño real combina varias."
};

var RAZONES_MIXTO_B = {
  correcta: "Es la lectura. Por dentro la nómina respeta el orden de llamadas " +
    "entre sus tres bloques, y por fuera la base compartida es lo que la amarra " +
    "con personal y pensiones: un cambio de esquema los rompe a los tres el " +
    "mismo día.",
  "solo-capas": "El diagrama de la nómina es en capas, y lo que decide si un " +
    "cambio de columna rompe algo está afuera: otros dos sistemas escriben en " +
    "esas mismas tablas y la capa de acceso a datos no se enteraría.",
  "cliente-servidor": "Eso describe el transporte. En cliente-servidor el " +
    "servidor expone un servicio y guarda el estado detrás de él; aquí los tres " +
    "sistemas escriben las tablas directo y ninguno media por los otros.",
  microservicios: "Microservicios pide que cada pieza sea dueña de su " +
    "almacenamiento. Compartir la base es exactamente lo contrario, y es lo que " +
    "hace que los tres queden acoplados."
};

/* Generador congruencial lineal: la misma semilla da la misma secuencia. */
function lcg(semilla) {
  var x = semilla >>> 0;
  return function () {
    x = (Math.imul(1664525, x) + 1013904223) >>> 0;
    return x / 4294967296;
  };
}

function barajar(lista, semilla) {
  var r = lcg(semilla);
  var copia = lista.slice();
  for (var i = copia.length - 1; i > 0; i--) {
    var j = Math.floor(r() * (i + 1));
    var t = copia[i]; copia[i] = copia[j]; copia[j] = t;
  }
  return copia;
}

function buscar(casos, id) {
  for (var i = 0; i < casos.length; i++) {
    if (casos[i].id === id) { return casos[i]; }
  }
  return null;
}

function buscarEstilo(clave) {
  for (var i = 0; i < ESTILOS.length; i++) {
    if (ESTILOS[i].clave === clave) { return ESTILOS[i]; }
  }
  return null;
}

/* El motor espera la clave "correcta" en la opcion que resuelve. */
function razonesPara(caso) {
  var salida = {};
  CLAVES.forEach(function (c) {
    salida[c === caso.correcta ? "correcta" : c] = caso.razones[c];
  });
  return salida;
}

function contarAciertos(respuestas, casos) {
  return respuestas.filter(function (r) {
    var c = buscar(casos, r.id);
    return c !== null && c.correcta === r.primera;
  }).length;
}

/* Cuantos casos del banco caen en cada estilo. */
function repartoPorEstilo(casos) {
  var cuenta = {};
  CLAVES.forEach(function (c) { cuenta[c] = 0; });
  casos.forEach(function (caso) { cuenta[caso.correcta] += 1; });
  return cuenta;
}

function faltan(respuestas, casos) { return casos.length - respuestas.length; }

/* Cada caso trae razon escrita para los siete estilos, no solo para el que
   resuelve, y la correcta es una de las siete claves.                       */
function validar(casos) {
  for (var i = 0; i < casos.length; i++) {
    var caso = casos[i];
    if (CLAVES.indexOf(caso.correcta) < 0) { return false; }
    for (var j = 0; j < CLAVES.length; j++) {
      var r = caso.razones[CLAVES[j]];
      if (typeof r !== "string" || !r.trim()) { return false; }
    }
    if (Object.keys(caso.razones).length !== CLAVES.length) { return false; }
  }
  return true;
}

/* La tabla de la primera carta: una fila por estilo y tres celdas en cada una. */
function validarTabla(estilos) {
  if (estilos.length !== CLAVES.length) { return false; }
  for (var i = 0; i < estilos.length; i++) {
    var e = estilos[i];
    if (CLAVES.indexOf(e.clave) < 0) { return false; }
    if (!e.estado || !e.acople || !e.cuesta || !e.nota) { return false; }
  }
  return true;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CLAVES: CLAVES, NOMBRES: NOMBRES, ESTILOS: ESTILOS, CASOS: CASOS,
    RAZONES_MIXTO_A: RAZONES_MIXTO_A, RAZONES_MIXTO_B: RAZONES_MIXTO_B,
    lcg: lcg, barajar: barajar, buscar: buscar, buscarEstilo: buscarEstilo,
    razonesPara: razonesPara, contarAciertos: contarAciertos,
    repartoPorEstilo: repartoPorEstilo, faltan: faltan,
    validar: validar, validarTabla: validarTabla
  };
}

if (typeof document !== "undefined") (function () {
  var num = Motor.num;

  /* ---- Carta 1: destapar la tabla de los siete estilos ---- */
  var destapados = [];
  var botonesDestapar = document.querySelectorAll("#op-destapar button");
  var cajaDestapar = document.getElementById("ver-destapar");

  function pintarTablaEstilos() {
    document.getElementById("cuerpo-estilos").innerHTML =
      ESTILOS.map(function (e) {
        var visible = destapados.indexOf(e.clave) >= 0;
        var celdas = visible
          ? "<td class=\"izq\">" + e.estado + "</td><td class=\"izq\">" +
            e.acople + "</td><td class=\"izq\">" + e.cuesta + "</td>"
          : "<td class=\"pend\">?</td><td class=\"pend\">?</td>" +
            "<td class=\"pend\">?</td>";
        return "<tr><td class=\"izq\"><b>" + NOMBRES[e.clave] + "</b></td>" +
          celdas + "</tr>";
      }).join("");
    document.getElementById("progreso-estilos").textContent =
      destapados.length === ESTILOS.length
        ? "Los siete estilos destapados"
        : "Destapados " + num(destapados.length) + " de " +
          num(ESTILOS.length);
  }

  function refrescarBotonesDestapar() {
    botonesDestapar.forEach(function (b) {
      b.disabled = destapados.indexOf(b.dataset.clave) >= 0;
    });
  }

  botonesDestapar.forEach(function (b) {
    b.addEventListener("click", function () {
      var clave = b.dataset.clave;
      if (destapados.indexOf(clave) < 0) { destapados.push(clave); }
      cajaDestapar.className = "veredicto bien";
      cajaDestapar.textContent = buscarEstilo(clave).nota;
      if (destapados.length === ESTILOS.length) {
        document.getElementById("nota-estilos").hidden = false;
      }
      refrescarBotonesDestapar();
      pintarTablaEstilos();
    });
  });

  document.getElementById("btn-reiniciar-estilos")
    .addEventListener("click", function () {
      destapados = [];
      cajaDestapar.className = "veredicto";
      cajaDestapar.textContent = "";
      document.getElementById("nota-estilos").hidden = true;
      refrescarBotonesDestapar();
      pintarTablaEstilos();
    });

  /* ---- Carta 2: un estilo por caso ---- */
  var orden = CASOS.slice();
  var semilla = 1;
  var indice = 0;
  var respuestas = [];
  var razones = {};

  var botones = document.querySelectorAll("#op-casos button");
  var caja = document.getElementById("ver-casos");
  var btnSiguiente = document.getElementById("btn-siguiente");
  var btnOtra = document.getElementById("btn-otra");
  var resumen = document.getElementById("resumen");

  function actual() { return orden[indice]; }

  function respondido() {
    return respuestas.length > 0 &&
      respuestas[respuestas.length - 1].id === actual().id;
  }

  function mostrarCaso() {
    var c = actual();
    document.getElementById("progreso-casos").textContent =
      "Caso " + num(indice + 1) + " de " + num(orden.length) + ", faltan " +
      num(faltan(respuestas, orden));
    document.getElementById("texto-caso").textContent = c.texto;
    var nuevas = razonesPara(c);
    Object.keys(razones).forEach(function (k) { delete razones[k]; });
    Object.keys(nuevas).forEach(function (k) { razones[k] = nuevas[k]; });
    botones.forEach(function (b) {
      b.dataset.op = b.dataset.clave === c.correcta ? "correcta" : b.dataset.clave;
      b.classList.remove("elegida");
    });
    caja.className = "veredicto";
    caja.textContent = "";
    btnSiguiente.hidden = true;
    btnSiguiente.textContent = indice + 1 < orden.length
      ? "Siguiente caso" : "Ver el marcador";
  }

  function pintarMarcador() {
    Motor.pintarChips("panel-marcador", [
      { texto: "a la primera",
        valor: num(contarAciertos(respuestas, CASOS)), cuenta: true },
      { texto: "respondidos",
        valor: num(respuestas.length) + " de " + num(orden.length) }
    ]);
  }

  function agregarFila(c, primera) {
    var color = primera === c.correcta ? "var(--verde)" : "var(--rojo)";
    document.getElementById("cuerpo-marcador").innerHTML +=
      "<tr><td class=\"izq\">" + c.rotulo + "</td><td style=\"color:" + color +
      "\">" + NOMBRES[primera] + "</td><td>" + NOMBRES[c.correcta] +
      "</td></tr>";
  }

  function terminar() {
    var aciertos = contarAciertos(respuestas, CASOS);
    document.getElementById("progreso-casos").textContent =
      "Los " + num(orden.length) + " casos respondidos";
    resumen.textContent = num(aciertos) + " de " + num(orden.length) +
      " a la primera. " + (aciertos === orden.length
        ? "Diez sistemas distintos y el reparto no es uniforme: tres estilos " +
          "aparecen dos veces, porque lo que los separa es una sola decisión de " +
          "diseño."
        : "La tabla señala en cuáles la primera elección fue otra. Vuelva a " +
          "esos casos y lea la razón del estilo que sí los describe, que dice " +
          "cuál es el dato del enunciado que decide.");
    resumen.hidden = false;
    btnOtra.hidden = false;
    btnSiguiente.hidden = true;
  }

  function reiniciar() {
    orden = barajar(CASOS, semilla);
    semilla += 1;
    indice = 0;
    respuestas = [];
    document.getElementById("cuerpo-marcador").innerHTML = "";
    resumen.hidden = true;
    btnOtra.hidden = true;
    mostrarCaso();
    pintarMarcador();
  }

  Motor.conectarOpciones("op-casos", "ver-casos", razones);

  botones.forEach(function (b) {
    b.addEventListener("click", function () {
      botones.forEach(function (o) { o.classList.remove("elegida"); });
      b.classList.add("elegida");
      if (!respondido()) {
        respuestas.push({ id: actual().id, primera: b.dataset.clave });
        agregarFila(actual(), b.dataset.clave);
        pintarMarcador();
      }
      btnSiguiente.hidden = false;
    });
  });

  btnSiguiente.addEventListener("click", function () {
    if (indice + 1 < orden.length) { indice += 1; mostrarCaso(); }
    else { terminar(); }
  });

  btnOtra.addEventListener("click", reiniciar);

  /* ---- Carta 3: los dos casos mezclados ---- */
  Motor.conectarOpciones("op-mixto-a", "ver-mixto-a", RAZONES_MIXTO_A);
  Motor.conectarOpciones("op-mixto-b", "ver-mixto-b", RAZONES_MIXTO_B);

  Motor.pintarChips("datos-banco", [
    { texto: "casos", valor: num(CASOS.length) },
    { texto: "estilos", valor: num(CLAVES.length) }
  ]);

  pintarTablaEstilos();
  mostrarCaso();
  pintarMarcador();
})();
