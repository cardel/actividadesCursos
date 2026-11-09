if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* El Dockerfile de la sesion, instruccion por instruccion. El orden, los ocho
   pasos del build y los tiempos son los del ejemplo 01-hola-mundo. */

var ORDEN = [
  { texto: "FROM python:3.12-slim", que: "la imagen base, con el intérprete ya instalado",
    temprano: "Nada puede ir antes: hasta que no hay una imagen base no hay sistema de " +
      "archivos donde copiar, instalar ni fijar un directorio." },
  { texto: "WORKDIR /app", que: "el directorio donde caen las órdenes siguientes",
    temprano: "Fija un directorio dentro de la imagen, así que necesita la base antes." },
  { texto: "COPY requirements.txt .", que: "la lista de dependencias, que cambia poco",
    temprano: "Copia del contexto al directorio de trabajo: hacen falta la base y el " +
      "WORKDIR." },
  { texto: "RUN pip install --no-cache-dir -r requirements.txt",
    que: "la instalación, el paso más caro de la construcción",
    temprano: "Instala lo que dice requirements.txt, y ese archivo todavía no está dentro " +
      "de la imagen." },
  { texto: "COPY app.py .", que: "el código, que cambia varias veces al día",
    temprano: "La imagen funcionaría igual, pero el código quedaría antes de la " +
      "instalación: cada edición invalidaría el pip install y lo repetiría entero. Las " +
      "dependencias van arriba justamente por eso." },
  { texto: "ENV APP_VERSION=0.1.0", que: "el valor por defecto que la aplicación lee",
    temprano: "Cambiar el valor invalida todas las capas posteriores, así que la variable " +
      "va abajo, donde arrastra poco." },
  { texto: "EXPOSE 5000", que: "el puerto en que atiende, como documentación",
    temprano: "No aporta nada a la construcción: va al final, junto con el arranque." },
  { texto: "CMD [\"python\", \"app.py\"]", que: "qué se ejecuta al arrancar el contenedor",
    temprano: "Es lo último del archivo: describe el arranque, no la construcción." }
];

/* El orden en que se ofrecen los botones, distinto del correcto. */
var PRESENTACION = [4, 0, 6, 3, 1, 7, 2, 5];

/* La construccion completa del ejemplo, medida con --no-cache. */
var BUILD = { pasos: ORDEN.length, segundos: 9.242 };

/* Lo que ejecuta cada forma de fijar el arranque. */
var ARRANQUE = [
  { dockerfile: "CMD [\"python\", \"app.py\"]",
    sinArgumentos: "python app.py",
    conArgumentos: "--puerto 8080, que reemplaza el CMD completo" },
  { dockerfile: "ENTRYPOINT [\"python\", \"app.py\"] + CMD [\"--puerto\", \"5000\"]",
    sinArgumentos: "python app.py --puerto 5000",
    conArgumentos: "python app.py --puerto 8080" }
];

/* ---------- las cuentas ---------- */

function instruccionEsperada(paso) { return ORDEN[paso]; }

function verificar(paso, elegida) {
  if (elegida === paso) {
    return { bien: true, mensaje: "Va aquí: " + ORDEN[paso].que + "." };
  }
  return { bien: false, mensaje: ORDEN[elegida].temprano };
}

function capasDelBuild() { return BUILD.pasos; }

function pendientes(colocadas) { return ORDEN.length - colocadas; }

function completo(colocadas) { return colocadas === ORDEN.length; }

/* ---------- veredictos y textos ---------- */

function fmt(x, d) { return Motor.num(x, d); }

function explicarPasos(bien, real, dicho) {
  var base = bien ? "Correcto. " : "No. ";
  if (!bien && dicho === real - 1) {
    base = "Casi: ";
  }
  return base + "Son " + real + ", una por instrucción. El identificador que sigue a " +
    "<code>---&gt;</code> es la capa que quedó, y la última es la de la imagen: " +
    "<code>Successfully built c9afeb8b4c6e</code>. Las ocho tardaron " +
    fmt(BUILD.segundos, 3) + " s sin caché.";
}

var RAZONES_INTERMEDIO = {
  correcta: "Eso es. La instrucción no se ejecuta sobre la imagen final: Docker levanta un " +
    "contenedor sobre la capa anterior, corre la orden ahí y guarda el sistema de archivos " +
    "resultante como capa nueva. El contenedor se descarta y por eso aparece el " +
    "<code>Removed</code>.",
  error: "No hubo fallo: esas dos líneas salen en todos los pasos que ejecutan algo, y la " +
    "construcción terminó con <code>Successfully built</code>.",
  limpieza: "El identificador de las dos líneas es el mismo, y es de esta construcción: se " +
    "crea en la primera y se descarta en la segunda.",
  capa: "La capa es el otro identificador, el que viene solo tras <code>---&gt;</code>. El " +
    "del contenedor temporal desaparece con él."
};

var RAZONES_EXPOSE = {
  correcta: "Así es. El puerto 5000 queda escrito en la imagen para quien la lea, y nada " +
    "más. Sin <code>-p</code> el contenedor atiende en su propia interfaz y el anfitrión no " +
    "tiene por dónde llegar.",
  si: "No lo abre. Si lo hiciera, dos contenedores de la misma imagen chocarían en el mismo " +
    "puerto del anfitrión, y en la sesión se levantaron dos sin problema.",
  root: "El usuario no cambia nada aquí: sin publicación no hay puerto del anfitrión que " +
    "atender, con permisos o sin ellos.",
  firewall: "No llega al cortafuegos: no hay nada escuchando en el 5000 del anfitrión. El " +
    "servicio escucha en el 5000 del contenedor, que es otra interfaz."
};

var RAZONES_ENTRYPOINT = {
  correcta: "Eso es. Con <code>ENTRYPOINT</code> el ejecutable queda fijo y el " +
    "<code>CMD</code> pasa a ser la lista de argumentos por defecto, que es lo que la orden " +
    "reemplaza. Esa es la forma de hacer una imagen que se comporta como un programa con " +
    "banderas.",
  defecto: "El <code>CMD</code> da el valor por defecto, y por defecto significa cuando no " +
    "llega nada en la orden. Aquí llegó <code>--puerto 8080</code>.",
  ambos: "No se concatenan: el argumento de la orden sustituye la lista entera del " +
    "<code>CMD</code>.",
  solo: "El <code>ENTRYPOINT</code> no se reemplaza desde <code>docker run</code> sin la " +
    "bandera <code>--entrypoint</code>. Lo que se reemplaza es el <code>CMD</code>."
};

var RAZONES_CMD = {
  correcta: "Eso es, y ahí está la diferencia con el <strong>B</strong>: sin " +
    "<code>ENTRYPOINT</code>, lo que llega en la orden es el comando entero, no sus " +
    "argumentos. Docker busca un ejecutable llamado <code>--puerto</code> y no lo encuentra.",
  suma: "Sumar argumentos es lo que hace el <strong>B</strong>, gracias al " +
    "<code>ENTRYPOINT</code>. Aquí no hay ejecutable fijo que los reciba.",
  ignora: "No se ignora: el <code>CMD</code> es el comando por defecto y cualquier cosa que " +
    "llegue en la orden lo sustituye.",
  igual: "No son sinónimas. Con <code>CMD</code> se sustituye todo; con " +
    "<code>ENTRYPOINT</code> el ejecutable se queda y solo cambian los argumentos."
};

var RAZONES_FORMA = {
  correcta: "Eso es. En la forma con corchetes el programa queda como proceso número uno y " +
    "recibe SIGTERM, así que cierra por su cuenta en milésimas. En la otra, el intérprete de " +
    "órdenes es el número uno, no reenvía la señal, y la parada agota el plazo de diez " +
    "segundos.",
  ninguna: "Al arrancar hacen lo mismo; al parar, no. La diferencia está en qué proceso " +
    "queda con el número uno y, por tanto, en quién recibe la señal.",
  velocidad: "El intérprete cuesta milisegundos al arrancar. Lo que cuesta de verdad son los " +
    "diez segundos de cada parada, y las peticiones que se cortan en ellos.",
  argumentos: "Las dos admiten argumentos en la orden, y en las dos el argumento reemplaza " +
    "el <code>CMD</code>. El problema es la señal."
};

/* ---------- pintado y conexiones ---------- */

function filasArranque() {
  return ARRANQUE.map(function (a) {
    return [a.dockerfile, a.sinArgumentos, a.conArgumentos];
  });
}

function iniciar() {
  var paso = 0;

  function pintarOrden() {
    document.getElementById("op-orden").innerHTML = PRESENTACION.map(function (i) {
      var colocada = i < paso;
      return "<button data-op=\"" + i + "\" style=\"text-align:left\"" +
        (colocada ? " disabled" : "") + "><code>" + ORDEN[i].texto + "</code></button>";
    }).join("");
    document.getElementById("codigo-orden").innerHTML = ORDEN.slice(0, paso)
      .map(function (o, i) {
        return "<div class=\"linea\"><span class=\"num\">" + (i + 1) + "</span>" +
          "<span class=\"txt\">" + o.texto.replace(/</g, "&lt;") + "</span></div>";
      }).join("") || "<div class=\"linea\"><span class=\"num\"></span>" +
      "<span class=\"txt\">(el archivo está vacío)</span></div>";
    document.getElementById("progreso-orden").textContent =
      paso + " de " + ORDEN.length + " instrucciones; faltan " + pendientes(paso);
    document.getElementById("nota-orden").hidden = !completo(paso);
    document.querySelectorAll("#op-orden button").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = verificar(paso, Number(b.dataset.op));
        var caja = document.getElementById("ver-orden");
        caja.className = "veredicto " + (v.bien ? "bien" : "mal");
        caja.innerHTML = v.mensaje;
        if (v.bien) { paso += 1; pintarOrden(); }
      });
    });
  }

  function pintarArranque() {
    document.getElementById("cuerpo-arranque").innerHTML = filasArranque()
      .map(function (f) {
        return "<tr><td style=\"text-align:left\"><code>" + f[0].replace(/</g, "&lt;") +
          "</code></td><td style=\"text-align:left\"><code>" + f[1] + "</code></td>" +
          "<td style=\"text-align:left\">" + f[2] + "</td></tr>";
      }).join("");
  }

  pintarOrden();
  pintarArranque();

  Motor.conectarPrediccion(
    { entrada: "pred-pasos", boton: "btn-pasos", veredicto: "ver-pasos" },
    capasDelBuild, explicarPasos);

  Motor.conectarOpciones("op-intermedio", "ver-intermedio", RAZONES_INTERMEDIO);
  Motor.conectarOpciones("op-expose", "ver-expose", RAZONES_EXPOSE);
  Motor.conectarOpciones("op-entrypoint", "ver-entrypoint", RAZONES_ENTRYPOINT);
  Motor.conectarOpciones("op-cmd", "ver-cmd", RAZONES_CMD);
  Motor.conectarOpciones("op-forma", "ver-forma", RAZONES_FORMA);

  document.getElementById("btn-reiniciar-orden").addEventListener("click", function () {
    paso = 0;
    document.getElementById("ver-orden").className = "veredicto";
    pintarOrden();
  });
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ORDEN: ORDEN, PRESENTACION: PRESENTACION, BUILD: BUILD, ARRANQUE: ARRANQUE,
    instruccionEsperada: instruccionEsperada, verificar: verificar,
    capasDelBuild: capasDelBuild, pendientes: pendientes, completo: completo,
    filasArranque: filasArranque, explicarPasos: explicarPasos,
    RAZONES_INTERMEDIO: RAZONES_INTERMEDIO, RAZONES_EXPOSE: RAZONES_EXPOSE,
    RAZONES_ENTRYPOINT: RAZONES_ENTRYPOINT, RAZONES_CMD: RAZONES_CMD,
    RAZONES_FORMA: RAZONES_FORMA
  };
}
