/* forExpr: la seccion de expresiones For. Las cuatro expresiones salen de
   06_for_expressions.scala y las cadenas de funciones de alto orden son las
   que ese mismo archivo y el frame de equivalencia escriben al lado. Cada
   valor correcto salio de correr el archivo con Scala 2.13.11, incluido el
   hecho de que la version con for y la version con flatMap de las parejas
   primas devuelven el mismo vector. La cadena E no le corresponde a ninguna
   expresion: usa map donde hacen falta dos generadores, y deja el resultado
   anidado. */
(function () {

  var CODIGO_PERSONAS = [
    "def esPrimo(n: Int): Boolean =",
    "  n >= 2 && (2 until n).forall(d => n % d != 0)",
    "",
    "case class Persona(nombre: String, edad: Int)",
    "",
    "val personas = Vector(",
    "  Persona(\"Ana\", 19),",
    "  Persona(\"Luis\", 22),",
    "  Persona(\"Maria\", 25)",
    ")"
  ];

  var FOR_PRIMAS = "for {\n  i <- 2 until 7\n  j <- 1 until i\n  if esPrimo(i + j)\n} yield (i, j)";
  var PRIMAS = "Vector((2,1), (3,2), (4,1), (4,3), (5,2), (6,1), (6,5))";

  /* ── Seccion 1: que devuelve cada expresion for ─────────────────── */

  var VALORES = [
    {
      expr: "for (x <- Vector(1, 2, 3)) yield x * 2",
      pregunta: "Un generador, un yield y ningún filtro.",
      cierre: "El yield evalúa x * 2 con cada valor del generador y los tres resultados quedan en un Vector nuevo.",
      opciones: [
        { txt: "Vector(2, 4, 6)", correcta: true },
        { txt: "Vector(1, 2, 3)", fallo: "Ese es el vector del generador, intacto. Lo que entra al resultado es el valor del yield, que aquí es x * 2." },
        { txt: "6", fallo: "6 es el último valor que produce el yield. Un for con yield no se queda con el último: junta los tres en una colección." }
      ]
    },
    {
      expr: "for (x <- Vector(1, 2, 3, 4) if x % 2 == 0) yield x * x",
      pregunta: "Ahora hay un filtro entre el generador y el yield.",
      cierre: "El if deja pasar el 2 y el 4, y el yield eleva al cuadrado los que pasaron: quedan dos elementos.",
      opciones: [
        { txt: "Vector(4, 16)", correcta: true },
        { txt: "los cuadrados de los cuatro elementos", fallo: "Eso quedaría sin el if. El filtro corre antes del yield y descarta el 1 y el 3, así que al cuadrado solo llegan dos elementos.", larga: true },
        { txt: "el 2 y el 4, los que pasan el filtro", fallo: "Esos son los elementos que deja el if, todavía sin transformar. El yield los eleva al cuadrado, y lo que entra al resultado es x * x.", larga: true }
      ]
    },
    {
      expr: FOR_PRIMAS,
      pregunta: "Dos generadores y un filtro, con el segundo generador dependiente del primero.",
      cierre: "Los dos generadores arman las parejas con j menor que i, el if conserva las que suman un primo y el yield pone la pareja en el resultado.",
      opciones: [
        { txt: PRIMAS, correcta: true, larga: true },
        { txt: "todas las parejas (i, j) con 1 <= j < i < 7", fallo: "Esas son las que producen los dos generadores. El if las filtra y solo quedan aquellas en que esPrimo(i + j) da true.", larga: true },
        { txt: "Vector(2, 3, 5, 7, 11)", fallo: "Esos son los primos que deja (0 to 12).filter(esPrimo). Lo primo aquí es la suma i + j, y el yield devuelve la pareja, no la suma.", larga: true }
      ]
    },
    {
      expr: "for (p <- personas if p.edad > 20) yield p.nombre",
      pregunta: "El generador recorre un Vector de Persona y el yield pide un campo.",
      cierre: "El if deja fuera a Ana, que tiene 19 años, y el yield cambia cada persona que pasó por su nombre.",
      opciones: [
        { txt: "Vector(Luis, Maria)", correcta: true },
        { txt: "Vector(Ana, Luis, Maria)", fallo: "Esos son los tres nombres, que es lo que quedaría sin el if. El filtro pide una edad mayor que 20 y la de Ana es 19." },
        { txt: "las dos personas que pasan el filtro, completas", fallo: "Esas son las que deja el if, todavía como Persona. El yield entrega p.nombre, así que en el resultado quedan los nombres y no las personas.", larga: true }
      ]
    }
  ];

  /* ── Seccion 2: emparejar cada for con su cadena ────────────────── */

  var CADENAS = [
    {
      id: "A",
      txt: "Vector(1, 2, 3).map(x => x * 2)",
      que: "aplica una función a cada uno de los tres elementos y devuelve un resultado por elemento, sin descartar ninguno"
    },
    {
      id: "B",
      txt: "Vector(1, 2, 3, 4).filter(x => x % 2 == 0).map(x => x * x)",
      que: "descarta primero los elementos que no cumplen la condición y después transforma los que quedaron"
    },
    {
      id: "C",
      txt: "(2 until 7).flatMap(i => (1 until i).map(j => (i, j))).filter(par => esPrimo(par._1 + par._2))",
      que: "arma las parejas con dos recorridos, uno dentro del otro, las deja en una sola secuencia plana y después descarta las que no cumplen la condición"
    },
    {
      id: "D",
      txt: "personas.filter(p => p.edad > 20).map(p => p.nombre)",
      que: "se queda con las personas que cumplen la condición de edad y de cada una devuelve un campo"
    },
    {
      id: "E",
      txt: "(2 until 7).map(i => (1 until i).map(j => (i, j)))",
      que: "arma las parejas con dos recorridos, uno dentro del otro, y deja el resultado anidado, un vector por cada i, porque usa map donde hace falta flatMap"
    }
  ];

  var FILAS = [
    {
      expr: "for (x <- Vector(1, 2, 3)) yield x * 2",
      resultado: "Vector(2, 4, 6)",
      cadena: "A",
      pista: "Esta expresión tiene un generador y ningún if, así que no hay nada que descartar ni ninguna secuencia que aplanar.",
      cierre: "Un generador y un yield se traducen a un map sobre la colección del generador, y el cuerpo del yield es la función que recibe."
    },
    {
      expr: "for (x <- Vector(1, 2, 3, 4) if x % 2 == 0) yield x * x",
      resultado: "Vector(4, 16)",
      cadena: "B",
      pista: "Esta expresión tiene un solo generador y un if, de modo que hace falta descartar antes de transformar.",
      cierre: "El if se traduce al filter y el yield al map, en ese orden: primero se descarta y después se transforma lo que quedó."
    },
    {
      expr: FOR_PRIMAS,
      resultado: PRIMAS,
      cadena: "C",
      pista: "Esta expresión tiene dos generadores y un if, y su resultado es una secuencia plana de parejas.",
      cierre: "Dos generadores se traducen a un flatMap con un map dentro: el de afuera recorre i y el de adentro arma la pareja con cada j. El if se vuelve un filter sobre las parejas ya armadas."
    },
    {
      expr: "for (p <- personas if p.edad > 20) yield p.nombre",
      resultado: "Vector(Luis, Maria)",
      cadena: "D",
      pista: "Esta expresión tiene un generador sobre personas y un if sobre la edad, y el yield pide un campo de cada una.",
      cierre: "La forma es la misma del segundo caso, filter y después map, con la condición y la transformación escritas sobre un campo del case class."
    }
  ];

  /* ── Seccion 3: yield construye una coleccion nueva ─────────────── */

  var CONSTRUYE = [
    {
      expr: "val dobles = for (x <- Vector(1, 2, 3)) yield x * 2",
      pregunta: "¿Qué queda en dobles?",
      cierre: "La expresión vale Vector(2, 4, 6), y por eso se le puede asignar a un val: el for con yield es una expresión que devuelve una colección.",
      opciones: [
        { txt: "Vector(2, 4, 6)", correcta: true },
        { txt: "nada: el for recorre los tres elementos y no deja valor", fallo: "Eso describe un for sin yield, que recorre y no construye nada. Con yield cada resultado entra en una colección nueva, y la expresión completa vale Vector(2, 4, 6).", larga: true },
        { txt: "el mismo Vector(1, 2, 3), con sus elementos cambiados", fallo: "Las colecciones de Scala no se modifican. La expresión construye otra y la de partida queda como estaba, que es lo que permite seguir usándola después.", larga: true }
      ]
    },
    {
      expr: "las parejas primas escritas con for y escritas con flatMap y filter",
      pregunta: "Las dos escrituras se corrieron por separado.",
      cierre: "Las dos devuelven Vector((2,1), (3,2), (4,1), (4,3), (5,2), (6,1), (6,5)). La forma con for es la misma cadena de funciones, escrita de otro modo.",
      opciones: [
        { txt: "devuelven el mismo vector", correcta: true },
        { txt: "el orden cambia, porque el for recorre al revés", fallo: "Las dos recorren los generadores en el mismo orden, el de adentro primero, y las dos entregan las siete parejas en la misma secuencia.", larga: true },
        { txt: "la del for devuelve un Vector y la otra una List", fallo: "Las dos parten de 2 until 7 y las dos devuelven un Vector. El tipo del resultado lo decide la colección por la que se recorre, no la forma en que se escribe la expresión.", larga: true }
      ]
    }
  ];

  var API = {
    CODIGO_PERSONAS: CODIGO_PERSONAS, FOR_PRIMAS: FOR_PRIMAS, PRIMAS: PRIMAS,
    VALORES: VALORES, CADENAS: CADENAS, FILAS: FILAS, CONSTRUYE: CONSTRUYE
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ════════════════ la pagina ════════════════ */

  var resueltos = { valores: 0, empareja: 0, construye: 0 };
  var fallados = 0;

  function marcar() {
    document.getElementById("marcador-valores").textContent =
      "resueltas: " + resueltos.valores + " de " + VALORES.length;
    document.getElementById("marcador-empareja").textContent =
      "emparejadas: " + resueltos.empareja + " de " + FILAS.length;
    document.getElementById("marcador-construye").textContent =
      "resueltas: " + resueltos.construye + " de " + CONSTRUYE.length +
      "    ·    opciones falladas en toda la página: " + fallados;
    if (resueltos.valores === VALORES.length
        && resueltos.empareja === FILAS.length
        && resueltos.construye === CONSTRUYE.length) {
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

  function acertar(f, cierre, boton, llave) {
    boton.className = boton.className.replace(" errada", "") + " acertada";
    bloquear(f.ops);
    f.ver.className = "veredicto bien";
    f.ver.textContent = cierre;
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
            acertar(f, item.cierre, b, llave);
          } else {
            errar(f, b, o.fallo);
          }
        });
        f.ops.appendChild(b);
      });
      caja.appendChild(f.caja);
    });
  }

  /* El emparejamiento: las cinco cadenas quedan a la vista y cada expresion
     for tiene los cinco botones. La explicacion de un fallo junta lo que hace
     la cadena escogida con lo que pide la expresion. */
  function construirPool() {
    var caja = document.getElementById("pool");
    CADENAS.forEach(function (c) {
      var div = document.createElement("div");
      var et = document.createElement("span");
      var tx = document.createElement("span");
      div.className = "cadena";
      et.className = "etiqueta";
      et.textContent = c.id;
      tx.className = "cuerpo";
      tx.textContent = c.txt;
      div.appendChild(et);
      div.appendChild(tx);
      caja.appendChild(div);
    });
  }

  function construirEmparejamiento() {
    var caja = document.getElementById("empareja");
    FILAS.forEach(function (item) {
      var f = fila({ expr: item.expr, pregunta: "devuelve " + item.resultado });
      CADENAS.forEach(function (c) {
        var b = document.createElement("button");
        b.textContent = c.id;
        b.className = "etiqueta-boton";
        b.addEventListener("click", function () {
          if (c.id === item.cadena) {
            acertar(f, item.cierre, b, "empareja");
          } else {
            errar(f, b, "La cadena " + c.id + " " + c.que + ". " + item.pista);
          }
        });
        f.ops.appendChild(b);
      });
      caja.appendChild(f.caja);
    });
  }

  construirCodigo("codigo-personas", CODIGO_PERSONAS);
  construirOpciones("valores", VALORES, "valores");
  construirPool();
  construirEmparejamiento();
  construirOpciones("construye", CONSTRUYE, "construye");
  marcar();
})();
