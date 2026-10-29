/* traducir: derivar la cadena de funciones de alto orden a partir de la
   expresion for, una reescritura por vez. Las cuatro expresiones salen de la
   seccion de expresiones for y todo lo que se afirma salio de correrlas con
   Scala 2.13.11: el Vector(2, 4, 6) de la primera y su comparacion con la
   cadena (true); el Vector(4, 16) que devuelven el for, la cadena con
   withFilter y la cadena con filter; las siete parejas primas y la cadena con
   flatMap, withFilter y map que devuelve el mismo vector; los trozos internos
   con i = 2, i = 4 e i = 5; los cinco vectores que deja la misma cadena con
   map en lugar de flatMap; y el () de tipo Unit que vale un for sin yield.
   Los distractores son las confusiones que ocurren de verdad: creer que
   withFilter cambia el resultado, poner el filtro sobre las parejas ya
   armadas y esperar que un for sin yield devuelva una coleccion. */
(function () {

  var CODIGO_PRIMAS = [
    "def esPrimo(n: Int): Boolean =",
    "  n >= 2 && (2 until n).forall(d => n % d != 0)",
    "",
    "val parejasPrimas =",
    "  for {",
    "    i <- 2 until 7",
    "    j <- 1 until i",
    "    if esPrimo(i + j)",
    "  } yield (i, j)"
  ];

  var DOBLES = "Vector(2, 4, 6)";
  var CUADRADOS = "Vector(4, 16)";
  var PRIMAS = "Vector((2,1), (3,2), (4,1), (4,3), (5,2), (6,1), (6,5))";
  var CADENA_PRIMAS = "(2 until 7).flatMap(i => (1 until i).withFilter(j => esPrimo(i + j)).map(j => (i, j)))";
  var ANIDADO = "Vector(Vector((2,1)), Vector((3,2)), Vector((4,1), (4,3)), Vector((5,2)), Vector((6,1), (6,5)))";

  /* ── Seccion 1: un generador y un yield ─────────────────────────── */

  var UNO = [
    {
      expr: "Vector(1, 2, 3).???(x => x * 2)",
      pregunta: "La reescritura de for (x <- Vector(1, 2, 3)) yield x * 2 tiene esta forma. ¿Qué función va en el hueco?",
      cierre: "map. El generador aporta la colección que recibe la llamada y el cuerpo del yield aporta la función: un generador con yield y sin if se reescribe con map.",
      opciones: [
        { txt: "map", correcta: true },
        { txt: "flatMap", fallo: "flatMap concatena lo que devuelve la función, de modo que pide que cada resultado sea una colección; x * 2 es un número y no hay nada que concatenar. El flatMap entra cuando aparece un segundo generador." },
        { txt: "filter", fallo: "filter es la reescritura del if y pide una condición, mientras x * 2 es un número. Esta expresión no tiene if." }
      ]
    },
    {
      expr: "for (x <- Vector(1, 2, 3)) yield x * 2   ==   Vector(1, 2, 3).map(x => x * 2)",
      pregunta: "La comparación se corrió y dio true. ¿Por qué coinciden?",
      cierre: "Las dos devolvieron " + DOBLES + " porque no son dos caminos parecidos: la expresión for se reescribe como esa cadena, y la cadena es lo que corre.",
      opciones: [
        { txt: "porque la cadena es en lo que el compilador convierte el for antes de ejecutarlo", correcta: true, larga: true },
        { txt: "porque las dos recorren el Vector en el mismo orden, aunque sean dos mecanismos distintos", fallo: "No hay dos mecanismos. La expresión for no se ejecuta como está escrita: el compilador la reescribe con funciones de alto orden, y esa reescritura es la cadena de la derecha.", larga: true },
        { txt: "porque yield y map son dos nombres de la misma función", fallo: "yield no es una función: es parte de la expresión for y señala qué valor entra al resultado. La función de la cadena es la que se escribe con =>, y su cuerpo es justo lo que está después del yield.", larga: true }
      ]
    }
  ];

  /* ── Seccion 2: el if se reescribe con withFilter ────────────────── */

  var FILTRO = [
    {
      expr: "Vector(1, 2, 3, 4).withFilter(x => x % 2 == 0).map(x => x * x)",
      pregunta: "Esta es la reescritura de for (x <- Vector(1, 2, 3, 4) if x % 2 == 0) yield x * x. Las tres se corrieron: el for, esta cadena y la misma cadena con filter en lugar de withFilter.",
      cierre: "Las tres devolvieron " + CUADRADOS + ". Cambiar filter por withFilter no cambia el resultado.",
      opciones: [
        { txt: "las tres devuelven " + CUADRADOS, correcta: true, larga: true },
        { txt: "el for y la cadena con filter dan " + CUADRADOS + ", y la de withFilter da otra cosa", fallo: "Las tres dieron " + CUADRADOS + ". withFilter se diferencia en cómo llega al resultado, no en el resultado.", larga: true },
        { txt: "el for da " + CUADRADOS + " y las dos cadenas dan los cuatro cuadrados", fallo: "Las dos cadenas también descartan antes de transformar: el filtro deja pasar el 2 y el 4, así que al map llegan dos elementos. Las tres dieron " + CUADRADOS + ".", larga: true }
      ]
    },
    {
      expr: "withFilter en lugar de filter",
      pregunta: "Si el resultado es el mismo, ¿qué cambia?",
      cierre: "filter deja una colección con los elementos que pasaron, y el map recorre esa colección. withFilter no la construye: el filtro queda anotado y el map lo aplica al pasar. Con cuatro elementos la diferencia no se mide; con una colección grande es una colección entera que no se arma.",
      opciones: [
        { txt: "que no se construye la colección intermedia entre el filtro y el map", correcta: true, larga: true },
        { txt: "que withFilter admite condiciones que filter no admite", fallo: "La condición es la misma, x % 2 == 0, y las dos la evalúan igual sobre los mismos cuatro elementos. Lo que cambia es que filter deja una colección con lo que pasó el filtro y withFilter no la construye.", larga: true },
        { txt: "que withFilter descarta después del map y filter antes", fallo: "Las dos descartan antes. El if está escrito antes del yield y la reescritura conserva ese orden, de modo que al map solo llegan los elementos que pasaron.", larga: true }
      ]
    }
  ];

  /* ── Seccion 3: dos generadores y un if ─────────────────────────── */

  var DOS = [
    {
      expr: "(2 until 7).flatMap(i => ...)",
      pregunta: "El flatMap de afuera recorre i. ¿Dónde queda el if en la reescritura?",
      cierre: "La reescritura es " + CADENA_PRIMAS + ", y se corrió: devuelve las mismas siete parejas que la expresión for. El filtro queda donde el if está escrito, después del segundo generador, y ahí la condición todavía se lee sobre i y sobre j.",
      opciones: [
        { txt: "dentro, sobre j, antes del map que arma la pareja", correcta: true, larga: true },
        { txt: "afuera, sobre lo que devuelve el flatMap, cuando las parejas ya están armadas", fallo: "El if está escrito dentro de las llaves, después del segundo generador, y la reescritura lo pone en ese lugar. Movido al final, la condición tendría que leer las dos componentes de cada pareja en vez de i y j.", larga: true },
        { txt: "en el generador de afuera, sobre i", fallo: "La condición es esPrimo(i + j) y necesita las dos variables. Mientras j no tenga valor no se puede evaluar, de modo que el filtro no puede subir al generador de afuera.", larga: true }
      ]
    },
    {
      expr: "los trozos del map interno: Vector((2,1)) con i = 2, Vector((4,1), (4,3)) con i = 4, Vector((5,2)) con i = 5",
      pregunta: "¿Qué queda cuando el flatMap de afuera junta los cinco trozos?",
      cierre: "Los concatena en el orden en que salieron y queda una sola secuencia de siete parejas: " + PRIMAS + ".",
      opciones: [
        { txt: PRIMAS, correcta: true, larga: true },
        { txt: "los cinco trozos, con las parejas repartidas en uno por cada i", fallo: "Eso es lo que deja map. flatMap hace el mismo recorrido y además concatena los trozos, así que entrega una sola secuencia plana.", larga: true },
        { txt: "las siete parejas, ordenadas por la suma i + j", fallo: "El orden del resultado lo fija el recorrido de los generadores: primero las del i más pequeño. La suma decide si la pareja entra, no en qué puesto queda.", larga: true }
      ]
    },
    {
      expr: "(2 until 7).map(i => (1 until i).withFilter(j => esPrimo(i + j)).map(j => (i, j)))",
      pregunta: "La misma cadena con map por fuera, corrida aparte.",
      cierre: "Cinco elementos, uno por cada valor de i, y cada uno es el trozo entero. Las parejas son las mismas siete, repartidas: lo que falta es la concatenación que hace flatMap.",
      opciones: [
        { txt: ANIDADO, correcta: true, larga: true },
        { txt: "las mismas siete parejas, porque el filtro deja una sola por cada i", fallo: "Hay valores de i que aportan dos parejas: con i = 4 el trozo es Vector((4,1), (4,3)). Y aun con una sola pareja por trozo, map entrega los trozos tal como llegaron, sin abrirlos.", larga: true },
        { txt: "un error de compilación, porque la función que recibe map devuelve una colección", fallo: "map devuelve lo que devuelva su función, sea un número o una colección. Lo corrido dejó cinco vectores, uno por cada i.", larga: true }
      ]
    }
  ];

  /* ── Seccion 4: el for sin yield ────────────────────────────────── */

  var SIN_YIELD = [
    {
      expr: "for (x <- Vector(1, 2, 3)) println(x)",
      pregunta: "Sin yield. Lo corrido imprime 1, luego 2, luego 3. ¿Qué vale la expresión?",
      cierre: "Vale (), de tipo Unit. Sin yield no hay nada que entre en un resultado, y de la expresión solo queda lo que imprimió.",
      opciones: [
        { txt: "()", correcta: true },
        { txt: "Vector(1, 2, 3)", fallo: "Ese es el vector del generador, y la expresión no lo devuelve. Lo corrido vale ()." },
        { txt: "Vector((), (), ())", fallo: "Eso supone que cada paso aporta un elemento al resultado, que es lo que hace el yield. Sin yield no se construye ninguna colección: la expresión vale ()." }
      ]
    },
    {
      expr: "val recorrido = for (x <- Vector(1, 2, 3)) println(x)",
      pregunta: "¿Qué queda en recorrido?",
      cierre: "Queda (), de tipo Unit. Un for sin yield se escribe por lo que ocurre mientras recorre, no por el valor que deja; el for con yield se escribe por el valor, y ese valor es una colección.",
      opciones: [
        { txt: "(), de tipo Unit", correcta: true },
        { txt: "los tres números que se imprimieron", fallo: "Lo impreso sale por la salida del programa y no vuelve a la expresión. El valor de un for sin yield es ()." },
        { txt: "nada, porque la asignación no compila", fallo: "La asignación se escribe y queda con (), que es un valor de tipo Unit. Lo que no hay es una colección para seguir usando." }
      ]
    }
  ];

  var API = {
    CODIGO_PRIMAS: CODIGO_PRIMAS, DOBLES: DOBLES, CUADRADOS: CUADRADOS,
    PRIMAS: PRIMAS, CADENA_PRIMAS: CADENA_PRIMAS, ANIDADO: ANIDADO,
    UNO: UNO, FILTRO: FILTRO, DOS: DOS, SIN_YIELD: SIN_YIELD
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ════════════════ la pagina ════════════════ */

  var SECCIONES = [
    { llave: "uno", caja: "uno", marcador: "marcador-uno", items: UNO },
    { llave: "filtro", caja: "filtro", marcador: "marcador-filtro", items: FILTRO },
    { llave: "dos", caja: "dos", marcador: "marcador-dos", items: DOS },
    { llave: "sinYield", caja: "sin-yield", marcador: "marcador-sin-yield", items: SIN_YIELD }
  ];

  var resueltos = { uno: 0, filtro: 0, dos: 0, sinYield: 0 };
  var fallados = 0;

  function marcar() {
    var listo = true;
    SECCIONES.forEach(function (s) {
      document.getElementById(s.marcador).textContent =
        "resueltas: " + resueltos[s.llave] + " de " + s.items.length;
      if (resueltos[s.llave] < s.items.length) { listo = false; }
    });
    document.getElementById("marcador-sin-yield").textContent =
      "resueltas: " + resueltos.sinYield + " de " + SIN_YIELD.length +
      "    ·    opciones falladas en toda la página: " + fallados;
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

  function bloquear(ops) {
    Array.prototype.forEach.call(ops.children, function (b) { b.disabled = true; });
  }

  function acertar(f, item, boton, llave) {
    boton.className = boton.className.replace(" errada", "") + " acertada";
    bloquear(f.ops);
    f.ver.className = "veredicto bien";
    f.ver.textContent = item.cierre;
    resueltos[llave] = resueltos[llave] + 1;
    marcar();
  }

  function errar(f, boton, texto) {
    boton.className = boton.className + " errada";
    boton.disabled = true;
    f.ver.className = "veredicto mal";
    f.ver.textContent = texto;
    fallados = fallados + 1;
    marcar();
  }

  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  function construirOpciones(cajaId, items, llave) {
    var caja = document.getElementById(cajaId);
    items.forEach(function (item, indice) {
      var f = fila(item);
      rotar(item.opciones, indice + 1).forEach(function (o) {
        var b = document.createElement("button");
        b.textContent = o.txt;
        if (o.larga) { b.className = "larga"; }
        b.addEventListener("click", function () {
          if (o.correcta) {
            acertar(f, item, b, llave);
          } else {
            errar(f, b, o.fallo);
          }
        });
        f.ops.appendChild(b);
      });
      caja.appendChild(f.caja);
    });
  }

  construirCodigo("codigo-primas", CODIGO_PRIMAS);
  SECCIONES.forEach(function (s) {
    construirOpciones(s.caja, s.items, s.llave);
  });
  marcar();
})();
