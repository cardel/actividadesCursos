/* tuplas: los tres frames de la seccion de tuplas, con la pareja y el triple
   que alli se declaran. Cada valor correcto y cada mensaje del compilador
   salieron de correr y de compilar el codigo con Scala 2.13.11, la version que
   trae el proyecto del curso; ninguno esta escrito de memoria. Los distractores
   son las dos confusiones que de verdad ocurren: pedir el componente equivocado
   y responder con el tipo de la tupla entera donde se pidio uno de sus
   componentes. */
(function () {

  var CODIGO = [
    "val pareja = (\"hola\", 42)",
    "// pareja: (String, Int) = (hola,42)",
    "",
    "val triple = (3.14, \"pi\", true)",
    "// triple: (Double, String, Boolean) = (3.14,pi,true)"
  ];

  /* ── Seccion 2: que devuelve cada expresion ─────────────────────── */

  var VALORES = [
    {
      expr: "pareja._1",
      pregunta: "El primer componente de una pareja.",
      cierre: "La numeracion de los componentes empieza en _1.",
      opciones: [
        { txt: "hola", correcta: true },
        { txt: "42", fallo: "42 es pareja._2. La numeracion arranca en _1, que es el primer componente, no en _0 como un indice de arreglo." },
        { txt: "(hola,42)", fallo: "Esa es la pareja completa, que es lo que devuelve pareja a secas. Con _1 se saca un componente." }
      ]
    },
    {
      expr: "pareja._2 + 1",
      pregunta: "Sumar uno al segundo componente.",
      cierre: "El segundo componente es un Int, asi que el + suma.",
      opciones: [
        { txt: "43", correcta: true },
        { txt: "421", fallo: "421 saldria si _2 fuera un String: el + concatenaria en vez de sumar. El tipo declarado dice que el segundo componente es Int." },
        { txt: "no compila", fallo: "Compila: la tupla recuerda que en la segunda posicion hay un Int, y sobre un Int el + es la suma." }
      ]
    },
    {
      expr: "triple._3",
      pregunta: "El tercer componente del triple.",
      cierre: "Un Tuple3 tiene _1, _2 y _3.",
      opciones: [
        { txt: "true", correcta: true },
        { txt: "pi", fallo: "pi es triple._2. El tercero es el booleano." },
        { txt: "no compila: las tuplas llegan hasta _2", fallo: "Hay una clase por cada tamanio, de Tuple2 hasta Tuple22, y triple es un Tuple3: _3 existe.", larga: true }
      ]
    },
    {
      expr: "val (texto, valor) = pareja\ntexto",
      pregunta: "Se reparte la pareja con un patron y se pregunta por el primer nombre.",
      cierre: "El patron reparte por posicion: texto recibe el primero.",
      opciones: [
        { txt: "hola", correcta: true },
        { txt: "42", fallo: "42 queda en valor. El patron reparte en el orden en que estan los componentes." },
        { txt: "(hola,42)", fallo: "El patron no le asigna la tupla entera a cada nombre: la descompone, y a texto le toca el primer componente." }
      ]
    },
    {
      expr: "scala.Tuple2(1, \"hola\")",
      pregunta: "La forma larga de construir una pareja.",
      cierre: "(1, \"hola\") es azucar sintactica de esta llamada.",
      opciones: [
        { txt: "(1,hola)", correcta: true },
        { txt: "Tuple2(1,hola)", fallo: "Asi se construye, pero al mostrarse una tupla sale entre parentesis y sin el nombre de la clase." },
        { txt: "no compila: Tuple2 es interno", fallo: "Se puede llamar directo. Escribir (1, \"hola\") es exactamente esta llamada, y por eso las dos formas dan el mismo valor.", larga: true }
      ]
    },
    {
      expr: "pareja == scala.Tuple2(\"hola\", 42)",
      pregunta: "Comparar la pareja con otra construida igual.",
      cierre: "Las tuplas se comparan por contenido, componente por componente.",
      opciones: [
        { txt: "true", correcta: true },
        { txt: "false", fallo: "false saldria si se comparara la identidad de los dos objetos. Una tupla compara su contenido, como las clases que se declaran con case." },
        { txt: "no compila: tipos distintos", fallo: "Los dos lados son el mismo tipo, (String, Int): el de la derecha es la forma larga de escribir el de la izquierda.", larga: true }
      ]
    }
  ];

  /* ── Seccion 3: de que tipo es ──────────────────────────────────── */

  var TIPOS = [
    {
      expr: "pareja",
      pregunta: "El tipo de la tupla entera.",
      cierre: "Un tipo por posicion, en el orden en que se escribieron.",
      opciones: [
        { txt: "(String, Int)", correcta: true },
        { txt: "(Int, String)", fallo: "El orden del tipo sigue el orden de los componentes, y el texto va primero." },
        { txt: "Tuple2", fallo: "Tuple2 sin los tipos de sus componentes esta incompleto: el tipo es Tuple2[String, Int], que se abrevia (String, Int)." }
      ]
    },
    {
      expr: "pareja._2",
      pregunta: "El tipo de un componente, no el de la tupla.",
      cierre: "Pedir un componente devuelve el tipo de esa posicion.",
      opciones: [
        { txt: "Int", correcta: true },
        { txt: "(String, Int)", fallo: "Ese es el tipo de pareja. _2 entrega el segundo componente, que es un numero." },
        { txt: "Any", fallo: "Any seria el tipo si la tupla hubiera olvidado que hay en cada puesto. Lo recuerda por posicion, y por eso pareja._2 + 1 compila." }
      ]
    },
    {
      expr: "triple",
      pregunta: "Tres componentes de tres tipos distintos.",
      cierre: "El tamanio y los tres tipos quedan escritos en el tipo.",
      opciones: [
        { txt: "(Double, String, Boolean)", correcta: true },
        { txt: "List[Any]", fallo: "Una lista exige el mismo tipo para todos sus elementos, y aqui hay tres distintos. Forzarlos a Any perderia que el primero es un Double." },
        { txt: "(Double, String)", fallo: "Ese es el tipo de una pareja. El tamanio tambien forma parte del tipo de la tupla." }
      ]
    }
  ];

  /* ── Seccion 4: cuatro declaraciones ────────────────────────────── */

  var DECLS = [
    {
      expr: "val (a, b) = triple",
      pregunta: "Un patron de dos nombres sobre una tupla de tres componentes.",
      compila: false,
      mensaje: "constructor cannot be instantiated to expected type;\n found   : (T1, T2)\n required: (Double, String, Boolean)",
      cierre: "El patron de dos componentes no casa con un Tuple3: el tamanio es parte del tipo y el compilador lo revisa antes de correr.",
      fallo: "No compila. El patron (a, b) describe una pareja, y triple tiene tres componentes."
    },
    {
      expr: "pareja._3",
      pregunta: "El tercer componente de una pareja.",
      compila: false,
      mensaje: "value _3 is not a member of (String, Int)\ndid you mean _1 or _2?",
      cierre: "Cada tamanio es una clase distinta y la de dos componentes solo declara _1 y _2. El mensaje llega a ofrecer los dos que existen.",
      fallo: "No compila. Tuple2 no tiene un miembro _3; la sugerencia del compilador nombra los dos que si existen."
    },
    {
      expr: "pareja._1 = \"otro\"",
      pregunta: "Cambiarle el primer componente a la pareja.",
      compila: false,
      mensaje: "reassignment to val",
      cierre: "Los componentes son val, asi que una tupla no se modifica: para tener otra pareja se construye otra.",
      fallo: "No compila. Una tupla es inmutable y sus componentes son val."
    },
    {
      expr: "val (texto, valor): (String, Int) = pareja",
      pregunta: "El mismo patron de dos nombres, ahora con el tipo escrito.",
      compila: true,
      mensaje: "texto: String = hola\nvalor: Int = 42",
      cierre: "El tipo anotado coincide con el de pareja, asi que el patron casa y los dos nombres quedan con su componente.",
      fallo: "Si compila. El patron tiene dos nombres y pareja tiene dos componentes, de los tipos que dice la anotacion."
    }
  ];

  var API = { CODIGO: CODIGO, VALORES: VALORES, TIPOS: TIPOS, DECLS: DECLS };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ════════════════ la pagina ════════════════ */

  var resueltos = { valores: 0, tipos: 0, decl: 0 };
  var fallados = 0;

  function construirCodigo() {
    var panel = document.getElementById("panel-codigo");
    CODIGO.forEach(function (texto, i) {
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

  function marcar() {
    document.getElementById("marcador-valores").textContent =
      "resueltas: " + resueltos.valores + " de " + VALORES.length;
    document.getElementById("marcador-tipos").textContent =
      "resueltas: " + resueltos.tipos + " de " + TIPOS.length;
    document.getElementById("marcador-decl").textContent =
      "resueltas: " + resueltos.decl + " de " + DECLS.length +
      "    ·    opciones falladas en toda la página: " + fallados;
    if (resueltos.valores === VALORES.length && resueltos.tipos === TIPOS.length
        && resueltos.decl === DECLS.length) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
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

  /* El mismo giro que usan las otras actividades: la opcion correcta no cae
     siempre en el primer boton. */
  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  /* Las secciones 2 y 3 comparten forma: una opcion correcta y dos
     distractores, cada uno con su propia explicacion. */
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

  /* La seccion 4 responde si compila o no, y deja a la vista lo que
     contesto el compilador en la corrida. */
  function construirDeclaraciones() {
    var caja = document.getElementById("declaraciones");
    DECLS.forEach(function (item) {
      var f = fila(item);
      var msg = document.createElement("div");
      msg.className = item.compila ? "mensaje compila" : "mensaje";
      msg.textContent = item.mensaje;
      msg.style.display = "none";
      [true, false].forEach(function (eleccion) {
        var b = document.createElement("button");
        b.textContent = eleccion ? "compila" : "no compila";
        b.addEventListener("click", function () {
          if (eleccion === item.compila) {
            acertar(f, item, b, "decl");
            msg.style.display = "block";
          } else {
            errar(f, b, item.fallo);
          }
        });
        f.ops.appendChild(b);
      });
      f.caja.appendChild(msg);
      caja.appendChild(f.caja);
    });
  }

  construirCodigo();
  construirOpciones("valores", VALORES, "valores");
  construirOpciones("tipos", TIPOS, "tipos");
  construirDeclaraciones();
  marcar();
})();
