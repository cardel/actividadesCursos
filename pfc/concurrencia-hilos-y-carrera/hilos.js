/* hilos: un proceso, varios hilos, y lo que cada uno puede tocar.
   El codigo y las salidas son los del deck de principios de concurrencia:
   log imprime el nombre del hilo que corre el cuerpo, y la salida de ejemplo
   del deck nombra el hilo nuevo como Thread-0.
   Los distractores son las confusiones que ocurren de verdad: dar por
   simultaneo lo que avanza por turnos, creer que la pila se comparte,
   suponer que start espera o que join relanza, y pedirle a volatile la
   garantia que ya trae join. */
(function () {

  var CODIGO_LOG = [
    "def log(msg: String): Unit =",
    "  println(s\"${Thread.currentThread.getName}: $msg\")",
    "",
    "def thread(cuerpo: => Unit): Thread = {",
    "  val t = new Thread {",
    "    override def run(): Unit = cuerpo",
    "  }",
    "  t.start()",
    "  t",
    "}"
  ];

  /* --- Carta 1: los dos conceptos ------------------------------------ */

  var CONCEPTOS = [
    {
      expr: "todo programa paralelo es concurrente",
      pregunta: "La implicación vale en un sentido. ¿Qué pasa en el otro?",
      cierre: "Hay programas concurrentes que no son paralelos. La concurrencia está en cómo se estructuró el programa; el paralelismo, en el hardware que lo corre.",
      opciones: [
        { txt: "hay concurrentes que no son paralelos: con un núcleo el sistema operativo reparte turnos", correcta: true, larga: true },
        { txt: "todo programa concurrente es paralelo, porque sus actividades avanzan al mismo tiempo en el reloj de pared", fallo: "Avanzar por turnos no es avanzar al mismo tiempo. Con un núcleo el sistema operativo intercala las actividades y en cada instante corre una sola.", larga: true },
        { txt: "las dos palabras nombran lo mismo y la diferencia es de jerga", fallo: "Separarlas tiene consecuencias. Un programa concurrente se escribe para que varias actividades progresen sin bloquearse; correrlo en cuatro núcleos es lo que lo vuelve paralelo.", larga: true }
      ]
    },
    {
      expr: "un servidor de un solo núcleo atiende cuatro conexiones por turnos",
      pregunta: "Ninguna conexión bloquea a las otras. ¿Qué tiene este servidor?",
      cierre: "Concurrencia sin paralelismo. Las cuatro actividades progresan de forma independiente sobre una sola unidad de cómputo.",
      opciones: [
        { txt: "paralelismo, porque las cuatro conexiones avanzan dentro de la misma ventana de tiempo", fallo: "El paralelismo pide varias unidades de cómputo trabajando a la vez, y aquí hay una. Las conexiones avanzan intercaladas.", larga: true },
        { txt: "concurrencia sin paralelismo", correcta: true, larga: true },
        { txt: "nada de lo uno ni de lo otro mientras la máquina tenga un solo núcleo", fallo: "La concurrencia no depende del número de núcleos: está en que el programa tenga actividades que progresan por separado. Lo que falta aquí es el paralelismo.", larga: true }
      ]
    },
    {
      expr: "¿cuánto se acelera?        ¿responde sin colgarse?",
      pregunta: "Cada concepto tiene su pregunta central. ¿Cuál es de cuál?",
      cierre: "La primera es del paralelismo, que se mide en tiempo. La segunda es de la concurrencia, que se juzga por la estructura del programa.",
      opciones: [
        { txt: "la primera es de la concurrencia y la segunda del paralelismo", fallo: "Al revés. Acelerar es lo que se busca al usar varios núcleos; responder sin colgarse es lo que se busca al partir el programa en actividades.", larga: true },
        { txt: "las dos son del paralelismo, y la concurrencia solo describe cómo se escribe el código", fallo: "La concurrencia tiene su propio criterio de éxito, y no es el tiempo: un programa concurrente bien hecho responde y se razona por partes aunque corra en un núcleo.", larga: true },
        { txt: "la primera es del paralelismo y la segunda de la concurrencia", correcta: true, larga: true }
      ]
    }
  ];

  /* --- Carta 2: la memoria y los dos mensajes del hilo ---------------- */

  var MEMORIA = [
    {
      expr: "dos hilos del mismo proceso",
      pregunta: "¿Qué parte de la memoria comparten?",
      cierre: "El heap, donde viven los objetos. Cada hilo nace con su propia pila y ningún hilo puede leer la de otro.",
      opciones: [
        { txt: "el heap: los objetos creados con new", correcta: true, larga: true },
        { txt: "la pila: las variables locales y el rastro de las llamadas", fallo: "La pila es lo único que no se comparte. Cada hilo tiene la suya, con sus locales y sus llamadas pendientes.", larga: true },
        { txt: "todo, porque están en el mismo proceso y el proceso es un solo espacio de memoria", fallo: "El proceso aporta un espacio común y aun así cada hilo nace con su propia pila. De ahí que un objeto del heap se pueda pisar desde otro hilo y una variable local no.", larga: true }
      ]
    },
    {
      expr: "thread { log(\"hola\") }",
      pregunta: "Fuera de todo hilo, log(\"hola\") imprime main: hola. ¿Qué imprime esta línea?",
      cierre: "Thread-0: hola, que es como la salida del deck nombra al primer hilo creado. getName lo evalúa el hilo que está corriendo el cuerpo.",
      opciones: [
        { txt: "main: hola", fallo: "Thread.currentThread lo evalúa el hilo que corre el cuerpo, y el cuerpo corre en el hilo nuevo. El principal ya siguió con la línea siguiente." },
        { txt: "Thread-0: hola", correcta: true },
        { txt: "hola, sin nombre al frente, porque el hilo nuevo todavía no tiene nombre", fallo: "La JVM le pone nombre a cada hilo al crearlo, y el primero sale como Thread-0.", larga: true }
      ]
    },
    {
      expr: "t.start()        t.join()",
      pregunta: "¿Qué hace cada uno?",
      cierre: "start lanza el cuerpo en un hilo nuevo y devuelve el control de inmediato; join bloquea al hilo que lo invoca hasta que t termine.",
      opciones: [
        { txt: "start lanza el cuerpo y espera a que termine; join lo vuelve a lanzar", fallo: "Si start esperara, nunca habría dos cuerpos corriendo a la vez y el hilo nuevo no serviría para nada.", larga: true },
        { txt: "start reserva el hilo y join lo pone a correr", fallo: "El cuerpo arranca con start. Un hilo al que nadie le hace join corre igual, y el programa principal puede terminar antes que él.", larga: true },
        { txt: "los dos esperan a que el hilo nuevo termine, y la diferencia está en que join además recoge el valor que el cuerpo produjo", fallo: "join no devuelve nada: espera. Y start no espera, que es justamente lo que permite que el hilo actual siga en la línea siguiente.", larga: true },
        { txt: "start lanza el cuerpo en un hilo nuevo y el actual sigue; join bloquea al actual hasta que el otro termine", correcta: true, larga: true }
      ]
    },
    {
      expr: "A escribe en un objeto compartido y termina; el principal hizo A.join()",
      pregunta: "Cuando join retorna, ¿qué tiene garantizado ver el hilo principal?",
      cierre: "Todas las escrituras que A hizo antes de terminar. Es la regla del modelo de memoria que hace usable el resultado de un hilo.",
      opciones: [
        { txt: "solo lo que esté marcado como volatile", fallo: "volatile resuelve otros casos. join trae una garantía más amplia y no pide marcar nada en el objeto.", larga: true },
        { txt: "lo que haya alcanzado a salir de la caché, sin garantía ninguna", fallo: "Sin join el riesgo es justo ese. Con join, el modelo de memoria de la JVM obliga a que las escrituras previas del hilo que terminó se vean.", larga: true },
        { txt: "todas las escrituras que A hizo antes de terminar", correcta: true, larga: true }
      ]
    }
  ];

  var API = { CODIGO_LOG: CODIGO_LOG, CONCEPTOS: CONCEPTOS, MEMORIA: MEMORIA };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================ la pagina ================ */

  var SECCIONES = [
    { caja: "conceptos", items: CONCEPTOS },
    { caja: "memoria", items: MEMORIA }
  ];
  var resueltos = {};
  var fallados = 0;

  function marcar() {
    var listo = true;
    SECCIONES.forEach(function (s, i) {
      var n = resueltos[s.caja] || 0;
      var texto = "resueltas: " + n + " de " + s.items.length;
      if (i === SECCIONES.length - 1) {
        texto = texto + "    ·    opciones falladas: " + fallados;
      }
      document.getElementById("marcador-" + s.caja).textContent = texto;
      if (n < s.items.length) { listo = false; }
    });
    if (listo) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  function construirCodigo(id, lineas) {
    var panel = document.getElementById(id);
    lineas.forEach(function (texto, i) {
      var div = document.createElement("div");
      var num = document.createElement("span");
      var txt = document.createElement("span");
      div.className = "linea";
      num.className = "num";
      num.textContent = texto === "" ? "" : String(i + 1);
      txt.className = "txt";
      txt.textContent = texto;
      div.appendChild(num);
      div.appendChild(txt);
      panel.appendChild(div);
    });
  }

  function fila(item) {
    var caja = document.createElement("div");
    var expr = document.createElement("div");
    var preg = document.createElement("div");
    var ops = document.createElement("div");
    var ver = document.createElement("div");
    caja.className = "item";
    expr.className = "expr";
    expr.textContent = item.expr;
    preg.className = "pregunta";
    preg.textContent = item.pregunta;
    ops.className = "opciones";
    ver.className = "veredicto";
    caja.appendChild(expr);
    caja.appendChild(preg);
    caja.appendChild(ops);
    caja.appendChild(ver);
    return { caja: caja, ops: ops, ver: ver };
  }

  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  function opciones(f, item, giro, alAcertar) {
    rotar(item.opciones, giro).forEach(function (o) {
      var b = document.createElement("button");
      b.textContent = o.txt;
      if (o.larga) { b.className = "larga"; }
      b.addEventListener("click", function () {
        if (o.correcta) {
          b.className = b.className.replace(" errada", "") + " acertada";
          Array.prototype.forEach.call(f.ops.children, function (x) { x.disabled = true; });
          f.ver.className = "veredicto bien";
          f.ver.textContent = item.cierre;
          alAcertar();
        } else {
          b.className = b.className + " errada";
          b.disabled = true;
          f.ver.className = "veredicto mal";
          f.ver.textContent = o.fallo;
          fallados = fallados + 1;
          marcar();
        }
      });
      f.ops.appendChild(b);
    });
  }

  function construirSeccion(s) {
    var caja = document.getElementById(s.caja);
    s.items.forEach(function (item, indice) {
      var f = fila(item);
      opciones(f, item, indice + 1, function () {
        resueltos[s.caja] = (resueltos[s.caja] || 0) + 1;
        marcar();
      });
      caja.appendChild(f.caja);
    });
  }

  construirCodigo("codigo-log", CODIGO_LOG);
  SECCIONES.forEach(construirSeccion);
  marcar();
})();
