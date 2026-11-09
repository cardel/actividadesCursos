if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Lo que sobrevive al contenedor. La secuencia del archivo efimero y el caso
   de la base de datos son los de la sesion. */

var PASOS = [
  { paso: "Escribir <code>/archivo.txt</code> dentro del contenedor",
    resultado: "dato", donde: "la capa escribible de <code>efimero</code>",
    ficha: "escrito" },
  { paso: "<code>docker rm efimero</code>",
    resultado: "se borra la capa escribible", donde: "en ninguna parte",
    ficha: "borrado" },
  { paso: "Leer <code>/archivo.txt</code> en un contenedor nuevo",
    resultado: "No such file or directory", donde: "en ninguna parte",
    ficha: "no está" },
  { paso: "Repetir montando <code>-v datos:/var/datos</code>",
    resultado: "el archivo sigue ahí", donde: "el volumen <code>datos</code>",
    ficha: "persiste" }
];

/* El caso de la base de datos, con volumen y sin el. */
var POSTGRES = [
  { montaje: "-v pgdata:/var/lib/postgresql/data", select: "persiste" },
  { montaje: "sin -v", select: "relation \"nota\" does not exist" }
];

/* ---------- las cuentas ---------- */

function pasoDonde(indice) { return PASOS[indice].donde; }

/* Los pasos en que el dato ya no esta en ninguna parte. */
function pasosSinDato() {
  return PASOS.filter(function (p) { return p.donde === "en ninguna parte"; }).length;
}

function resultadoConVolumen() { return POSTGRES[0].select; }

function resultadoSinVolumen() { return POSTGRES[1].select; }

function sobrevive(montaje) {
  var fila = POSTGRES.filter(function (p) { return p.montaje === montaje; })[0];
  return fila ? fila.select === "persiste" : false;
}

/* ---------- veredictos y textos ---------- */

var RAZONES_PG = {
  correcta: "Eso es. El directorio de datos de Postgres quedó montado en el volumen, así " +
    "que la tabla y su fila están fuera del contenedor. El contenedor nuevo encuentra un " +
    "directorio ya inicializado y sigue donde el otro lo dejó.",
  vacia: "La tabla no se vuelve a crear: el <code>CREATE TABLE</code> se ejecutó una vez y " +
    "quedó escrito en el volumen, con su fila.",
  error: "Eso es lo que devuelve la misma secuencia sin <code>-v</code>. Con el volumen " +
    "montado, el directorio de datos no se borró con el contenedor.",
  conexion: "La espera del arranque se nota en los primeros segundos y se resuelve " +
    "repitiendo la orden. Aquí lo que se está probando es si el dato sigue ahí."
};

var RAZONES_SIN_VOLUMEN = {
  correcta: "Eso es. Sin montaje, el directorio de datos vive en la capa escribible y se va " +
    "con <code>docker rm -f</code>. La imagen de Postgres encuentra el directorio vacío y lo " +
    "inicializa de nuevo, con su base recién creada.",
  persiste: "Lo que guarda la imagen es el programa; los datos los escribe el contenedor en " +
    "su capa escribible, que es lo que se borra.",
  niega: "El contenedor escribe sin problema en su capa escribible. Lo que no hace es " +
    "conservarla.",
  arranca: "Arranca igual: el volumen no es un requisito para levantar el contenedor, solo " +
    "para que lo escrito sobreviva."
};

var RAZONES_COMPARTIDO = {
  correcta: "Eso es. El volumen es uno y los dos contenedores lo montan en la misma ruta, de " +
    "modo que el segundo lee lo que el primero está escribiendo. Es lo que permite separar " +
    "quien guarda el dato de quien lo consulta.",
  vacio: "El archivo no está en la capa escribible: la ruta <code>/var/datos</code> está " +
    "montada sobre el volumen, y lo que se escribe ahí sale del contenedor.",
  noexiste: "Existe para los dos: el montaje es el mismo volumen. Si el segundo montara otro " +
    "nombre, ahí sí vería un directorio vacío.",
  copia: "No se copia nada: el montaje enlaza la misma carpeta, y el segundo contenedor ve " +
    "las fechas que se van agregando."
};

var RAZONES_PRUNE = {
  correcta: "Eso es, y de ahí que convenga mirar <code>docker volume ls</code> antes: el " +
    "volumen de un contenedor que ya se borró cuenta como libre, aunque guarde la base de " +
    "datos de la semana pasada.",
  todos: "Los que están montados en un contenedor se quedan: la orden solo recoge los que " +
    "nadie usa.",
  contenido: "No los vacía: los elimina. Para dejar uno vacío habría que borrar su contenido " +
    "desde un contenedor que lo monte.",
  imagenes: "Eso es <code>docker image prune</code>. Cada orden recoge lo suyo, y los " +
    "volúmenes son la parte que guarda datos."
};

/* ---------- pintado y conexiones ---------- */

function filasPasos(hasta) {
  return PASOS.slice(0, hasta).map(function (p) {
    return [p.paso, p.resultado, p.donde];
  });
}

function iniciar() {
  var paso = 0;

  function pintarPasos() {
    document.getElementById("cuerpo-pasos").innerHTML = filasPasos(paso).map(function (f) {
      return "<tr><td style=\"text-align:left\">" + f[0] + "</td><td><code>" + f[1] +
        "</code></td><td style=\"text-align:left\">" + f[2] + "</td></tr>";
    }).join("");
    document.getElementById("estado-volumen").innerHTML = PASOS.map(function (p, i) {
      return "<span class=\"ficha" + (i < paso ? "" : " tachada") + "\">" + p.ficha +
        "</span>";
    }).join("<span class=\"flecha\">→</span>");
    document.getElementById("progreso-pasos").textContent =
      paso + " de " + PASOS.length + " pasos";
    document.getElementById("nota-pasos").hidden = paso < PASOS.length;
  }

  pintarPasos();

  document.getElementById("btn-paso").addEventListener("click", function () {
    if (paso < PASOS.length) { paso += 1; pintarPasos(); }
  });
  document.getElementById("btn-reiniciar").addEventListener("click", function () {
    paso = 0;
    pintarPasos();
  });

  Motor.conectarOpciones("op-pg", "ver-pg", RAZONES_PG);
  Motor.conectarOpciones("op-sin-volumen", "ver-sin-volumen", RAZONES_SIN_VOLUMEN);
  Motor.conectarOpciones("op-compartido", "ver-compartido", RAZONES_COMPARTIDO);
  Motor.conectarOpciones("op-prune", "ver-prune", RAZONES_PRUNE);
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PASOS: PASOS, POSTGRES: POSTGRES,
    pasoDonde: pasoDonde, pasosSinDato: pasosSinDato,
    resultadoConVolumen: resultadoConVolumen, resultadoSinVolumen: resultadoSinVolumen,
    sobrevive: sobrevive, filasPasos: filasPasos,
    RAZONES_PG: RAZONES_PG, RAZONES_SIN_VOLUMEN: RAZONES_SIN_VOLUMEN,
    RAZONES_COMPARTIDO: RAZONES_COMPARTIDO, RAZONES_PRUNE: RAZONES_PRUNE
  };
}
