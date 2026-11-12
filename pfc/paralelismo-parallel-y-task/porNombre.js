/* porNombre: el contrato de parallel y por que sus parametros van por nombre.
   La firma, el contrato y el argumento del paso por nombre son los del deck
   de abstracciones para la concurrencia.
   Los distractores son las confusiones que ocurren de verdad: esperar que
   parallel devuelva tareas que hay que esperar, creer que el paso por nombre
   solo evita copiar el valor, y dar por hecho que dos nucleos parten el
   tiempo por la mitad aunque las tareas sean desiguales. */
(function () {

  var FIRMA = [
    "def parallel[A, B](tareaA: => A, tareaB: => B): (A, B)"
  ];

  var SIN_NOMBRE = [
    "def parallel[A, B](tareaA: A, tareaB: B): (A, B)"
  ];

  /* --- Carta 1: el contrato ------------------------------------------ */

  var CONTRATO = [
    {
      expr: "parallel(e1, e2)",
      pregunta: "¿Qué retorna?",
      cierre: "La misma pareja que (e1, e2). Lo único que cambia frente a la versión secuencial es el tiempo.",
      opciones: [
        { txt: "la misma pareja que (e1, e2)", correcta: true, larga: true },
        { txt: "una pareja cuyo orden depende de cuál de las dos tareas termine primero", fallo: "El primer componente es siempre el valor de e1. Terminar antes no da derecho a quedar de primero en la pareja.", larga: true },
        { txt: "una pareja de tareas lanzadas, que hay que esperar antes de poder usar sus valores", fallo: "Eso es lo que hace task. parallel espera por dentro y entrega los dos valores ya calculados.", larga: true }
      ]
    },
    {
      expr: "la misma llamada en una máquina de un solo núcleo",
      pregunta: "¿Qué pasa ahí?",
      cierre: "Sigue siendo correcta y entrega la misma pareja; lo que no hay es ganancia de tiempo.",
      opciones: [
        { txt: "se cae, porque no hay un segundo núcleo donde lanzar la segunda tarea", fallo: "Los hilos no piden un núcleo por cabeza: el sistema operativo los reparte por turnos sobre el que haya. El programa corre igual.", larga: true },
        { txt: "sigue siendo correcta y no acelera", correcta: true, larga: true },
        { txt: "evalúa solo la primera expresión, y la segunda queda sin calcular hasta que alguien la pida", fallo: "Las dos expresiones se evalúan siempre: parallel no retorna hasta tener los dos valores. Posponer el cálculo es otra cosa, la de LazyList.", larga: true }
      ]
    },
    {
      expr: "dos núcleos, dos tareas que cuestan 300 ms y 500 ms",
      pregunta: "¿En cuánto queda el tiempo de la llamada?",
      cierre: "Alrededor de 500 ms, el costo de la tarea más lenta, más lo que cueste lanzar el hilo y esperarlo. La tarea rápida termina y su núcleo queda libre.",
      opciones: [
        { txt: "en 400 ms, la mitad de la suma de las dos", fallo: "Partir el tiempo por la mitad supone que las dos tareas cuestan lo mismo. Con tareas desiguales el que manda es el más lento, porque parallel no retorna hasta tener los dos valores.", larga: true },
        { txt: "en 800 ms, porque al final las dos tareas hay que calcularlas", fallo: "Sumar los dos tiempos es la cuenta de la versión secuencial. Con dos núcleos las dos tareas avanzan a la vez y el tiempo lo pone la más lenta.", larga: true },
        { txt: "en unos 500 ms, lo que cuesta la tarea más lenta", correcta: true, larga: true }
      ]
    }
  ];

  /* --- Carta 2: el paso por nombre ----------------------------------- */

  var NOMBRE = [
    {
      expr: "tareaA: A      en lugar de      tareaA: => A",
      pregunta: "¿Qué cambia si los parámetros se pasan por valor?",
      cierre: "Las dos expresiones se evalúan antes de entrar a parallel, una después de la otra. Adentro llegan dos valores ya calculados y no queda nada que paralelizar.",
      opciones: [
        { txt: "las dos expresiones se evalúan antes de entrar, una después de la otra", correcta: true, larga: true },
        { txt: "nada en el fondo: el paso por nombre solo evita copiar el valor al entrar a la función", fallo: "El paso por nombre no se trata de copias. Decide cuándo se evalúa la expresión y en qué hilo, y eso es lo que habilita el paralelismo.", larga: true },
        { txt: "la función deja de compilar, porque un tipo como A no puede recibir una expresión sin evaluar", fallo: "Compila sin problema: el argumento se evalúa en el sitio de la llamada y adentro entra el valor. Lo que se pierde es la posibilidad de repartir el cálculo.", larga: true }
      ]
    },
    {
      expr: "tareaA: => A",
      pregunta: "¿Qué recibe parallel con ese tipo?",
      cierre: "Una descripción de cómo calcular el valor, que parallel evalúa en el hilo que decida y en el momento que decida.",
      opciones: [
        { txt: "el valor ya calculado, pero sin copiarlo, como una referencia a la expresión original", fallo: "Con => A no hay valor todavía. Lo que entra es la expresión sin evaluar, y la evaluación ocurre dentro de parallel.", larga: true },
        { txt: "una descripción de cómo calcular el valor, sin calcularlo", correcta: true, larga: true },
        { txt: "una función de cero argumentos, que adentro hay que invocar con paréntesis para obtener el valor", fallo: "Por debajo se comporta así, y en el código no se escriben paréntesis: mencionar tareaA ya evalúa la expresión. El tipo que se escribe es => A y no () => A.", larga: true }
      ]
    },
    {
      expr: "un cuerpo que menciona tareaA dos veces",
      pregunta: "¿Cuántas veces se evalúa la expresión que llegó por nombre?",
      cierre: "Dos. Cada mención evalúa la expresión de nuevo, así que lo que se va a usar más de una vez se guarda en un val.",
      opciones: [
        { txt: "una, y el valor se reutiliza en la segunda mención", fallo: "Guardar el valor es lo que hace un val, y hay que escribirlo: val va = tareaA. Un parámetro por nombre no guarda nada por su cuenta.", larga: true },
        { txt: "no compila, porque un parámetro por nombre solo se puede mencionar una vez por cuerpo", fallo: "Se puede mencionar tantas veces como haga falta. Lo que pasa es que cada mención vuelve a evaluar la expresión.", larga: true },
        { txt: "dos, una por mención", correcta: true, larga: true }
      ]
    }
  ];

  var API = { FIRMA: FIRMA, SIN_NOMBRE: SIN_NOMBRE, CONTRATO: CONTRATO, NOMBRE: NOMBRE };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================ la pagina ================ */

  var SECCIONES = [
    { caja: "contrato", items: CONTRATO },
    { caja: "nombre", items: NOMBRE }
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

  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  function construirSeccion(s) {
    var caja = document.getElementById(s.caja);
    s.items.forEach(function (item, indice) {
      var contenedor = document.createElement("div");
      var expr = document.createElement("div");
      var preg = document.createElement("div");
      var ops = document.createElement("div");
      var ver = document.createElement("div");
      contenedor.className = "item";
      expr.className = "expr";
      expr.textContent = item.expr;
      preg.className = "pregunta";
      preg.textContent = item.pregunta;
      ops.className = "opciones";
      ver.className = "veredicto";
      rotar(item.opciones, indice + 1).forEach(function (o) {
        var b = document.createElement("button");
        b.textContent = o.txt;
        if (o.larga) { b.className = "larga"; }
        b.addEventListener("click", function () {
          if (o.correcta) {
            b.className = b.className.replace(" errada", "") + " acertada";
            Array.prototype.forEach.call(ops.children, function (x) { x.disabled = true; });
            ver.className = "veredicto bien";
            ver.textContent = item.cierre;
            resueltos[s.caja] = (resueltos[s.caja] || 0) + 1;
          } else {
            b.className = b.className + " errada";
            b.disabled = true;
            ver.className = "veredicto mal";
            ver.textContent = o.fallo;
            fallados = fallados + 1;
          }
          marcar();
        });
        ops.appendChild(b);
      });
      contenedor.appendChild(expr);
      contenedor.appendChild(preg);
      contenedor.appendChild(ops);
      contenedor.appendChild(ver);
      caja.appendChild(contenedor);
    });
  }

  construirCodigo("codigo-firma", FIRMA);
  construirCodigo("codigo-valor", SIN_NOMBRE);
  SECCIONES.forEach(construirSeccion);
  marcar();
})();
