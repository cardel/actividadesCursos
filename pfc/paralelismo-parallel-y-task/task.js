/* task: lanzar un calculo como valor y recoger el resultado al final.
   La API, el contrato, la norma-p con cuatro tareas y las tres variantes de
   parallel son las del deck de abstracciones para la concurrencia.
   Los tiempos de esta pagina no son medidas: salen del modelo que la propia
   sesion usa para razonar, con el costo de lanzar y esperar tomado como
   despreciable, y la pagina los calcula a partir de los costos que enuncia
   cada pregunta.
   Los distractores son las confusiones que ocurren de verdad: creer que task
   evalua antes de retornar, esperar que el calculo no empiece hasta el join,
   y pegar cada join a su task por miedo a perder el resultado. */
(function () {

  var API_TASK = [
    "def task[A](c: => A): Task[A]",
    "",
    "trait Task[A] {",
    "  def join(): A",
    "}"
  ];

  var CODIGO_NORMA = [
    "def pNormCuatro(a: Array[Int], p: Double): Double = {",
    "  val n  = a.length",
    "  val m1 = n / 4;  val m2 = n / 2;  val m3 = 3 * n / 4",
    "",
    "  val t1 = task(sumSegment(a, p, 0,  m1))",
    "  val t2 = task(sumSegment(a, p, m1, m2))",
    "  val t3 = task(sumSegment(a, p, m2, m3))",
    "  val t4 = task(sumSegment(a, p, m3, n))",
    "",
    "  val suma = t1.join() + t2.join() + t3.join() + t4.join()",
    "  power(suma, 1 / p)",
    "}"
  ];

  /* El modelo de la sesion: lanzar y esperar no cuesta, y hay un nucleo por
     tarea. Lo que corre a la vez se cobra por el mayor; lo que corre en fila,
     por la suma. */
  var COSTO_CUARTO = 100;
  var TAREAS = 4;
  var EN_PARALELO = COSTO_CUARTO;
  var EN_FILA = COSTO_CUARTO * TAREAS;

  var T_A = 300;
  var T_B = 500;

  function mayor(x, y) { return x > y ? x : y; }

  /* --- Carta 1: el contrato ------------------------------------------ */

  var CONTRATO = [
    {
      expr: "task(e)",
      pregunta: "¿Qué hace y qué retorna?",
      cierre: "Lanza la evaluación de e en un hilo nuevo y retorna de inmediato un Task[A], que representa el cálculo en curso.",
      opciones: [
        { txt: "lanza la evaluación de e y retorna de inmediato un Task[A]", correcta: true, larga: true },
        { txt: "evalúa e y retorna su valor envuelto en un Task[A], listo para usarse", fallo: "Si evaluara antes de retornar, el hilo que llamó quedaría esperando y no habría nada corriendo en paralelo. Lo que retorna representa un cálculo que ya arrancó.", larga: true },
        { txt: "retorna una descripción de e, que no empieza a calcularse hasta el primer join", fallo: "Posponer el cálculo hasta que alguien lo pida es lo que hace un LazyList. task arranca de una, y por eso el hilo que llama puede seguir con otra cosa.", larga: true }
      ]
    },
    {
      expr: "t.join() dos veces sobre la misma tarea",
      pregunta: "¿Qué pasa en la segunda llamada?",
      cierre: "Retorna el resultado ya calculado, sin volver a calcularlo ni volver a esperar.",
      opciones: [
        { txt: "vuelve a lanzar el cálculo, porque join consume la tarea al recogerla", fallo: "La tarea guarda su resultado. Un segundo join lo entrega tal cual, y ningún hilo nuevo se crea por eso.", larga: true },
        { txt: "retorna el resultado ya calculado, sin recomputar", correcta: true, larga: true },
        { txt: "lanza una excepción, porque la tarea ya terminó y su resultado se liberó", fallo: "Nada se libera al hacer el primer join. El resultado queda disponible y se puede pedir las veces que haga falta.", larga: true }
      ]
    },
    {
      expr: "task(e).join()",
      pregunta: "¿Qué valor es ese?",
      cierre: "El mismo que e. La identidad task(e).join() == e es lo que permite cambiar una expresión por su versión con tareas sin cambiar lo que el programa calcula.",
      opciones: [
        { txt: "el valor de e, pero solo si el cálculo alcanzó a terminar antes del join", fallo: "El join espera lo que haga falta. Si el cálculo no ha terminado, el hilo que pregunta se bloquea hasta que termine.", larga: true },
        { txt: "una pareja con el valor de e y el tiempo que tardó en calcularse", fallo: "join retorna el valor y nada más. Medir el tiempo es trabajo de quien cronometra alrededor.", larga: true },
        { txt: "el mismo valor que e", correcta: true, larga: true }
      ]
    }
  ];

  /* --- Carta 3: las tres variantes de parallel ----------------------- */

  var VARIANTES = [
    {
      nombre: "p1",
      codigo: [
        "def p1[A, B](a: => A, b: => B): (A, B) = {",
        "  val tb = task(b)",
        "  val va = a",
        "  (va, tb.join())",
        "}"
      ],
      paraleliza: true,
      tiempo: mayor(T_A, T_B),
      razon: "La tarea de b se lanza y el hilo que llamó se pone a evaluar a. Cuando llega al join, b puede estar listo o faltarle poco. El tiempo es el mayor de los dos."
    },
    {
      nombre: "p2",
      codigo: [
        "def p2[A, B](a: => A, b: => B): (A, B) = {",
        "  val va = a",
        "  val tb = task(b)",
        "  (va, tb.join())",
        "}"
      ],
      paraleliza: false,
      tiempo: T_A + T_B,
      razon: "La evaluación de a ocurre antes de lanzar la tarea de b, así que las dos no se solapan en ningún momento. El tiempo es la suma."
    },
    {
      nombre: "p3",
      codigo: [
        "def p3[A, B](a: => A, b: => B): (A, B) = {",
        "  val ta = task(a)",
        "  val tb = task(b)",
        "  (ta.join(), tb.join())",
        "}"
      ],
      paraleliza: true,
      tiempo: mayor(T_A, T_B),
      razon: "Las dos tareas se lanzan antes del primer join, así que las dos evaluaciones se solapan. El hilo que llamó no calcula nada: se queda esperando, y por eso esta versión ocupa un hilo más que p1."
    }
  ];

  /* --- Carta 4: donde van los join ----------------------------------- */

  var MORALEJA = [
    {
      expr: "cuatro tareas y cuatro join",
      pregunta: "¿Dónde van los join?",
      cierre: "Al final, cuando las cuatro tareas ya se lanzaron. Lanzar es barato; lo que cuesta es esperar, y un join temprano bloquea al hilo que todavía tenía tareas por lanzar.",
      opciones: [
        { txt: "pegados a su task, para recoger el resultado antes de que se pierda", fallo: "El resultado no se pierde: la tarea lo guarda hasta que alguien lo pida. Pegar el join al task serializa el código, porque la tarea siguiente no se lanza hasta que la anterior termine.", larga: true },
        { txt: "al final, cuando ya se lanzaron todas", correcta: true, larga: true },
        { txt: "dentro de la última tarea, que recoge las otras tres y devuelve la suma", fallo: "Nada lo impide, y el hilo que llamó termina esperando lo mismo. Lo que decide el tiempo es que las cuatro tareas se lancen antes del primer join, no quién hace la suma.", larga: true }
      ]
    },
    {
      expr: "parallel frente a task",
      pregunta: "¿En qué se diferencian para quien los usa?",
      cierre: "parallel espera por dentro y entrega la pareja de valores; task entrega un objeto que representa el cálculo y deja la espera en manos de quien llama. Con task se pueden lanzar más de dos.",
      opciones: [
        { txt: "parallel entrega los valores y task entrega objetos que hay que esperar", correcta: true, larga: true },
        { txt: "parallel usa hilos de la JVM y task usa un mecanismo distinto que no crea hilos", fallo: "Las dos abstracciones terminan en los hilos de la JVM. La diferencia está en lo que entregan y en cuántas tareas admiten.", larga: true },
        { txt: "task paraleliza de verdad y parallel solo ordena las dos expresiones para que se evalúen en fila", fallo: "parallel evalúa sus dos expresiones en paralelo, y de hecho se puede construir con task. Lo que cambia es quién decide cuándo esperar.", larga: true }
      ]
    }
  ];

  function verificar() {
    return {
      enParalelo: EN_PARALELO,
      enFila: EN_FILA,
      variantes: VARIANTES.map(function (v) {
        return v.nombre + ": " + (v.paraleliza ? "paraleliza" : "no paraleliza") +
               ", " + v.tiempo + " ms";
      }),
      paralelizan: VARIANTES.filter(function (v) { return v.paraleliza; }).length,
      noParalelizan: VARIANTES.filter(function (v) { return !v.paraleliza; }).length
    };
  }

  var API = {
    API_TASK: API_TASK, CODIGO_NORMA: CODIGO_NORMA, CONTRATO: CONTRATO,
    VARIANTES: VARIANTES, MORALEJA: MORALEJA, T_A: T_A, T_B: T_B,
    EN_PARALELO: EN_PARALELO, EN_FILA: EN_FILA, verificar: verificar
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================ la pagina ================ */

  var SECCIONES = [
    { caja: "contrato", items: CONTRATO },
    { caja: "moraleja", items: MORALEJA }
  ];
  var resueltos = { contrato: 0, moraleja: 0, variantes: 0 };
  var fallados = 0;
  var aciertos = { paralelo: false, fila: false };

  function marcar() {
    document.getElementById("marcador-contrato").textContent =
      "resueltas: " + resueltos.contrato + " de " + CONTRATO.length;
    document.getElementById("marcador-variantes").textContent =
      "decididas: " + resueltos.variantes + " de " + VARIANTES.length;
    document.getElementById("marcador-moraleja").textContent =
      "resueltas: " + resueltos.moraleja + " de " + MORALEJA.length +
      "    ·    opciones falladas: " + fallados;
    if (aciertos.paralelo && aciertos.fila &&
        resueltos.contrato === CONTRATO.length &&
        resueltos.variantes === VARIANTES.length &&
        resueltos.moraleja === MORALEJA.length) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  function construirCodigo(destino, lineas, numerar) {
    var panel = typeof destino === "string"
      ? document.getElementById(destino) : destino;
    lineas.forEach(function (texto, i) {
      var div = document.createElement("div");
      var num = document.createElement("span");
      var txt = document.createElement("span");
      div.className = "linea";
      num.className = "num";
      num.textContent = (numerar === false || texto === "") ? "" : String(i + 1);
      txt.className = "txt";
      txt.textContent = texto;
      div.appendChild(num);
      div.appendChild(txt);
      panel.appendChild(div);
    });
  }

  function prediccion(idCampo, idBoton, idVeredicto, esperado, bien, pista, alAcertar) {
    document.getElementById(idBoton).addEventListener("click", function () {
      var v = document.getElementById(idVeredicto);
      var valor = parseInt(document.getElementById(idCampo).value, 10);
      if (isNaN(valor)) {
        v.className = "veredicto mal";
        v.textContent = "Escriba un número primero.";
        return;
      }
      if (valor === esperado) {
        v.className = "veredicto bien";
        v.textContent = bien;
        alAcertar();
      } else {
        v.className = "veredicto mal";
        v.textContent = pista;
      }
    });
  }

  function construirVariantes() {
    var caja = document.getElementById("variantes");
    VARIANTES.forEach(function (v) {
      var item = document.createElement("div");
      var titulo = document.createElement("div");
      var bloque = document.createElement("div");
      var ops = document.createElement("div");
      var ver = document.createElement("div");
      item.className = "item";
      titulo.className = "expr";
      titulo.textContent = v.nombre;
      bloque.className = "codigo";
      construirCodigo(bloque, v.codigo, false);
      ops.className = "opciones";
      ver.className = "veredicto";
      [["Paraleliza", true], ["No paraleliza", false]].forEach(function (par) {
        var b = document.createElement("button");
        b.textContent = par[0];
        b.addEventListener("click", function () {
          if (par[1] === v.paraleliza) {
            b.className = b.className.replace(" errada", "") + " acertada";
            Array.prototype.forEach.call(ops.children, function (x) { x.disabled = true; });
            ver.className = "veredicto bien";
            ver.textContent = v.razon + " Con T(a) = " + T_A + " ms y T(b) = " +
              T_B + " ms, el tiempo total es " + v.tiempo + " ms.";
            resueltos.variantes = resueltos.variantes + 1;
          } else {
            b.className = b.className + " errada";
            b.disabled = true;
            ver.className = "veredicto mal";
            ver.textContent = v.paraleliza
              ? "Mire si las dos evaluaciones alcanzan a solaparse: busque qué hay entre el task y el join que lo espera."
              : "Mire qué se evalúa antes de lanzar la tarea. Si la primera expresión ya se calculó, la segunda no tiene con quién solaparse.";
            fallados = fallados + 1;
          }
          marcar();
        });
        ops.appendChild(b);
      });
      item.appendChild(titulo);
      item.appendChild(bloque);
      item.appendChild(ops);
      item.appendChild(ver);
      caja.appendChild(item);
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
            resueltos[s.caja] = resueltos[s.caja] + 1;
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

  construirCodigo("codigo-api", API_TASK);
  construirCodigo("codigo-norma", CODIGO_NORMA);
  prediccion("pred-paralelo", "btn-paralelo", "ver-paralelo", EN_PARALELO,
    EN_PARALELO + " ms. Las cuatro tareas se lanzan antes del primer join, " +
      "así que los cuatro cuartos se calculan a la vez y el tiempo lo pone el más lento.",
    "Las cuatro tareas ya están lanzadas cuando se hace el primer join, y cada una tiene su núcleo. " +
      "Lo que se cobra no es la suma de los cuatro cuartos.",
    function () { aciertos.paralelo = true; marcar(); });
  prediccion("pred-fila", "btn-fila", "ver-fila", EN_FILA,
    EN_FILA + " ms, el mismo tiempo de la versión secuencial. Cada join bloquea " +
      "al hilo que todavía no ha lanzado las tareas que faltan, así que los cuatro cuartos se calculan en fila.",
    "Si el join va pegado a su task, la tarea siguiente no se lanza hasta que la anterior termine. " +
      "Cuente qué se solapa con qué en ese orden.",
    function () { aciertos.fila = true; marcar(); });
  construirVariantes();
  SECCIONES.forEach(construirSeccion);
  marcar();
})();
