/* rangos: las nueve lineas que imprime 03_range_array_string.scala, mas lo que
   un Range muestra cuando se imprime sin pedirle los elementos. Todo valor que
   la pagina da por correcto salio de correr el codigo con Scala 2.13.11, la
   version del proyecto del curso, incluidos los tres que sorprenden: el texto
   Range 1 to 5, la palabra inexact de (6 to 1 by -2) y la lista vacia de
   (5 to 1).toList. */
(function () {

  var CODIGO = [
    { num: 1, txt: "println((1 to 5).toList)" },
    { num: 2, txt: "println((1 until 5).toList)" },
    { num: 3, txt: "println((1 to 10 by 3).toList)" },
    { num: 4, txt: "println((6 to 1 by -2).toList)" },
    { num: 5, txt: "demoArray()" },
    { num: 6, txt: "demoString()" },
    { num: null, txt: "" },
    { num: 7, txt: "def demoArray(): Unit = {" },
    { num: 8, txt: "  val xs = Array(1, 2, 3)" },
    { num: 9, txt: "  println(xs.map(x => 2 * x).toList)" },
    { num: 10, txt: "  println(xs.filter(_ > 1).toList)" },
    { num: null, txt: "}" },
    { num: null, txt: "" },
    { num: 11, txt: "def demoString(): Unit = {" },
    { num: 12, txt: "  val s = \"Hola mundo\"" },
    { num: 13, txt: "  println(s.filter(_.isUpper))" },
    { num: 14, txt: "  println(s.map(_.toUpper))" },
    { num: 15, txt: "  println(s.length)" },
    { num: null, txt: "}" }
  ];

  /* ── Seccion 2: predecir las nueve lineas que imprimen ──────────── */

  var DEMOS = [
    { expr: "(1 to 5).toList", sale: "List(1, 2, 3, 4, 5)", modo: "coleccion", pista: "List(...)" },
    { expr: "(1 until 5).toList", sale: "List(1, 2, 3, 4)", modo: "coleccion", pista: "List(...)" },
    { expr: "(1 to 10 by 3).toList", sale: "List(1, 4, 7, 10)", modo: "coleccion", pista: "List(...)" },
    { expr: "(6 to 1 by -2).toList", sale: "List(6, 4, 2)", modo: "coleccion", pista: "List(...)" },
    { expr: "xs.map(x => 2 * x).toList", sale: "List(2, 4, 6)", modo: "coleccion", pista: "List(...)" },
    { expr: "xs.filter(_ > 1).toList", sale: "List(2, 3)", modo: "coleccion", pista: "List(...)" },
    { expr: "s.filter(_.isUpper)", sale: "H", modo: "texto", pista: "el texto que sale" },
    { expr: "s.map(_.toUpper)", sale: "HOLA MUNDO", modo: "texto", pista: "el texto que sale" },
    { expr: "s.length", sale: "10", modo: "numero", pista: "un número" }
  ];

  var PISTAS = [
    {
      "list(1,2,3,4)": "List(1, 2, 3, 4) es (1 until 5).toList. Con to el " +
        "número del fin entra en el rango; con until queda fuera.",
      "list(0,1,2,3,4)": "El rango empieza en el primer número escrito, que " +
        "es 1. No hay un 0 implícito como en los índices de un arreglo.",
      general: "Cinco números dentro de List(...)."
    },
    {
      "list(1,2,3,4,5)": "List(1, 2, 3, 4, 5) es (1 to 5).toList. until corta " +
        "antes del 5.",
      "list(2,3,4,5)": "Lo que until deja fuera es el fin del rango, no el " +
        "inicio: el 1 entra.",
      general: "Cuatro números dentro de List(...)."
    },
    {
      "list(1,4,7)": "El 10 también entra: el rango va con to, y desde el 1 " +
        "tres pasos de 3 caen justo en 10.",
      "list(3,6,9)": "El paso dice cada cuánto se avanza, no por dónde " +
        "empezar: el primer elemento es el inicio del rango, el 1.",
      "list(1,2,3,4,5,6,7,8,9,10)": "by cambia el paso. De 1 en 1 saldrían " +
        "los diez enteros; de 3 en 3 salen cuatro.",
      general: "Los enteros de 1 a 10 avanzando de tres en tres."
    },
    {
      "list(2,4,6)": "El rango entrega los elementos en el orden en que los " +
        "recorre, que aquí es de 6 hacia abajo. Nada los acomoda de menor a mayor.",
      "list(6,4,2,0)": "El recorrido se detiene en el 1, el fin del " +
        "rango. El 0 ya queda por debajo.",
      "list()": "Vacío queda (5 to 1).toList, que no lleva by. Con by -2 " +
        "escrito el recorrido baja y entrega tres elementos.",
      general: "Tres números, de 6 hacia abajo."
    },
    {
      "list(2,3)": "List(2, 3) es lo que da xs.filter(_ > 1).toList. Aquí la " +
        "función 2 * x se aplica a los tres elementos.",
      "list(1,4,9)": "Multiplicar cada elemento por sí mismo daría ese " +
        "resultado. La función escrita es 2 * x, con el 2 fijo.",
      general: "Tres números, cada uno el doble del que ocupa su lugar en xs."
    },
    {
      "list(1,2,3)": "La comparación es estricta: el 1 no cumple _ > 1.",
      "list(2,4,6)": "List(2, 4, 6) es el map con 2 * x. filter no transforma " +
        "los elementos, decide cuáles pasan.",
      general: "Los elementos de xs mayores que 1."
    },
    {
      "h": "La letra sale en mayúscula. isUpper no cambia los caracteres: " +
        "decide cuáles pasan, y el que pasó ya venía en mayúscula.",
      "HM": "La m de mundo está en minúscula en \"Hola mundo\", así que no " +
        "pasa el filtro. La única mayúscula es la H del principio.",
      "10": "10 es s.length, cuántos caracteres tiene el texto. filter no " +
        "cuenta: devuelve lo que pasó la condición.",
      general: "Lo que queda del texto al dejar pasar solo las mayúsculas."
    },
    {
      "hola mundo": "toUpper se aplica a cada uno de los diez caracteres, no " +
        "a ninguno: el resultado está todo en mayúscula.",
      "Hola Mundo": "toUpper no distingue la inicial de una palabra del resto: " +
        "sube los diez caracteres.",
      "H": "H es s.filter(_.isUpper), el texto con las mayúsculas que ya " +
        "estaban. map transforma los diez caracteres.",
      general: "El texto completo, con cada carácter cambiado por su mayúscula."
    },
    {
      "9": "El espacio entre las dos palabras también es un carácter del texto.",
      "2": "2 es cuántas palabras tiene el texto. length cuenta caracteres.",
      general: "Cuántos caracteres tiene \"Hola mundo\"."
    }
  ];

  /* Tres formas de comparar, porque no todo lo que imprime este archivo se
     lee igual. Una coleccion admite espacios y mayusculas distintas:
     list(2,3) cuenta igual que List(2, 3). Un texto no, porque la mayuscula
     y el espacio son justo lo que se pregunta en las dos lineas de demoString. */
  function normalizar(entrada, modo) {
    var s = String(entrada === null || entrada === undefined ? "" : entrada);
    if (modo === "texto") {
      s = s.replace(/^\s+|\s+$/g, "");
      return s === "" ? null : s;
    }
    s = s.replace(/\s+/g, "");
    if (modo === "numero") { return s === "" ? null : s; }
    s = s.toLowerCase();
    return s === "" ? null : s;
  }

  function esperado(i) {
    return normalizar(DEMOS[i].sale, DEMOS[i].modo);
  }

  function revisar(i, entrada) {
    var dado = normalizar(entrada, DEMOS[i].modo);
    if (dado === null) { return { estado: "vacio", msg: "" }; }
    if (dado === esperado(i)) { return { estado: "bien", msg: "" }; }
    var tabla = PISTAS[i] || {};
    return { estado: "mal", msg: tabla[dado] || tabla.general || "" };
  }

  /* ── Seccion 3: lo que muestra un rango y cuanto trae ───────────── */

  var RANGOS = [
    {
      expr: "println(1 to 5)",
      pregunta: "El rango se imprime sin pedirle los elementos con toList.",
      cierre: "Un rango se guarda con tres valores, el inicio, el fin y el paso, y es eso lo que muestra. Los elementos se piden aparte: (1 to 5).toList da List(1, 2, 3, 4, 5).",
      opciones: [
        { txt: "Range 1 to 5", correcta: true },
        { txt: "List(1, 2, 3, 4, 5)", fallo: "Esos son los elementos, y salen con (1 to 5).toList. El rango no los almacena, así que al imprimirse no los muestra." },
        { txt: "Range(1, 2, 3, 4, 5)", fallo: "Lo que sale no lleva elementos entre paréntesis: es el texto Range 1 to 5, con los dos números tal como se escribieron." }
      ]
    },
    {
      expr: "println(1 until 5)",
      pregunta: "El mismo rango, ahora con el fin excluido.",
      cierre: "El rango conserva la palabra con que se escribió y los dos números que recibió.",
      opciones: [
        { txt: "Range 1 until 5", correcta: true },
        { txt: "Range 1 to 4", fallo: "El rango guarda el 5 que se le dio y la palabra until. No lo reescribe como un fin inclusivo, aunque su último elemento sea el 4." },
        { txt: "List(1, 2, 3, 4)", fallo: "Esos son los elementos, y salen con (1 until 5).toList." }
      ]
    },
    {
      expr: "println(6 to 1 by -2)",
      pregunta: "Un rango descendente, impreso tal cual.",
      cierre: "Bajando de 6 en pasos de 2 no se cae exactamente en el 1: el recorrido termina en el 2, y de ahí la palabra inexact. (6 to 1 by -2).toList da List(6, 4, 2).",
      opciones: [
        { txt: "inexact Range 6 to 1 by -2", correcta: true, ancha: true },
        { txt: "Range 6 to 1 by -2", fallo: "Falta la palabra inexact delante. Aparece cuando el fin del rango no se alcanza exacto con el paso dado. Aquí, bajando de dos en dos desde el 6, se llega al 2 y el 1 queda sin tocar.", ancha: true },
        { txt: "List(6, 4, 2)", fallo: "Esos son los elementos, y salen con .toList. El rango por sí mismo muestra los tres números que recibió.", ancha: true }
      ]
    },
    {
      expr: "(5 to 1).toList",
      pregunta: "Un inicio mayor que el fin, y sin by.",
      cierre: "Sin by el paso es 1 y el recorrido sube. Empezando en 5, el primer valor ya pasó el fin, así que el rango no entrega ningún elemento.",
      opciones: [
        { txt: "List()", correcta: true },
        { txt: "List(5, 4, 3, 2, 1)", fallo: "Para bajar hay que escribir el paso: (6 to 1 by -2).toList da List(6, 4, 2). Sin by el paso es 1 y va hacia arriba.", ancha: true },
        { txt: "List(1, 2, 3, 4, 5)", fallo: "El rango no se da vuelta para que el menor quede de inicio. El primer número es el inicio y el segundo es el fin.", ancha: true }
      ]
    },
    {
      expr: "(1 to 10 by 3).length",
      pregunta: "Cuántos elementos trae el rango del paso 3.",
      cierre: "(1 to 10 by 3).toList da List(1, 4, 7, 10), cuatro elementos. Sin paso escrito el conteo coincide con los enteros: (1 to 5).length da 5.",
      opciones: [
        { txt: "4", correcta: true },
        { txt: "10", fallo: "10 es el fin del rango, no cuántos elementos tiene. Con paso 3 el rango entrega List(1, 4, 7, 10)." },
        { txt: "3", fallo: "3 es el paso. El paso cambia el conteo, y para saber el conteo hay que ver cuántos elementos quedan: son cuatro." }
      ]
    }
  ];

  /* ── Seccion 4: Array y String con las mismas operaciones ───────── */

  var REUSO = [
    {
      expr: "la clase de s.filter(_.isUpper)",
      pregunta: "Se imprime H. ¿De qué clase es ese resultado?",
      cierre: "Filtrar un texto devuelve un texto, aunque quede un solo carácter: lo que se imprime es un String de largo 1.",
      opciones: [
        { txt: "java.lang.String", correcta: true },
        { txt: "List[Char]", fallo: "Un texto no se convierte en colección de caracteres al filtrarse. Lo que vuelve es otro texto." },
        { txt: "Char", fallo: "Un carácter suelto sería un Char. filter devuelve el texto con los caracteres que pasaron la condición, y aquí pasó uno." }
      ]
    },
    {
      expr: "s.map(_.toUpper) y s.filter(_.isUpper)",
      pregunta: "Las dos recorren los diez caracteres de \"Hola mundo\".",
      cierre: "map cambia cada carácter y devuelve el texto completo; filter decide cuáles pasan y devuelve el texto que queda.",
      opciones: [
        { txt: "map da HOLA MUNDO y filter da H", correcta: true, larga: true },
        { txt: "map da HOLA MUNDO y filter da HM", fallo: "La m de mundo está en minúscula en \"Hola mundo\", así que no pasa isUpper. La única mayúscula del texto es la H del principio.", larga: true },
        { txt: "map da 10 y filter da H", fallo: "10 es s.length. map devuelve el texto con cada carácter en mayúscula, no una cuenta.", larga: true }
      ]
    },
    {
      expr: "Array y String",
      pregunta: "¿Qué comparten con Vector y con List?",
      cierre: "Array(1, 2, 3).map(x => 2 * x).toList da List(2, 4, 6), Array(1, 2, 3).filter(_ > 1).toList da List(2, 3) y \"Hola mundo\".map(_.toUpper) da HOLA MUNDO: la misma escritura sobre tres colecciones distintas.",
      opciones: [
        { txt: "aceptan map y filter con la misma escritura", correcta: true, larga: true },
        { txt: "al aplicar map las dos devuelven una List", fallo: "La lista aparece porque las dos líneas del arreglo terminan en .toList, el que convierte. Sobre el texto no hay conversión: \"Hola mundo\".filter(_.isUpper) es de clase java.lang.String.", larga: true },
        { txt: "ninguna de las dos acepta filter", fallo: "Las dos lo aceptan: Array(1, 2, 3).filter(_ > 1).toList da List(2, 3) y \"Hola mundo\".filter(_.isUpper) da H.", larga: true }
      ]
    }
  ];

  var API = {
    CODIGO: CODIGO, DEMOS: DEMOS, PISTAS: PISTAS,
    RANGOS: RANGOS, REUSO: REUSO,
    normalizar: normalizar, esperado: esperado, revisar: revisar
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ════════════════ la pagina ════════════════ */

  var resueltos = { rangos: 0, reuso: 0 };
  var fallados = 0;
  var prediccionesListas = false;

  function construirCodigo() {
    var panel = document.getElementById("panel-codigo");
    CODIGO.forEach(function (l, i) {
      var div = document.createElement("div");
      var num = document.createElement("span");
      var txt = document.createElement("span");
      div.className = "linea";
      div.id = "linea-" + i;
      num.className = "num";
      num.textContent = l.num === null ? "" : String(l.num);
      txt.className = "txt";
      txt.textContent = l.txt;
      div.appendChild(num);
      div.appendChild(txt);
      panel.appendChild(div);
    });
  }

  function construirTabla() {
    var cuerpo = document.getElementById("cuerpo-predicciones");
    cuerpo.innerHTML = "";
    DEMOS.forEach(function (d, i) {
      var tr = document.createElement("tr");

      var expr = document.createElement("td");
      expr.className = "expr-celda";
      expr.textContent = "println(" + d.expr + ")";
      tr.appendChild(expr);

      var celda = document.createElement("td");
      var inp = document.createElement("input");
      inp.type = "text";
      inp.id = "pred-" + i;
      inp.placeholder = d.pista;
      celda.appendChild(inp);
      tr.appendChild(celda);

      var real = document.createElement("td");
      real.className = "real";
      real.id = "real-" + i;
      tr.appendChild(real);

      var nota = document.createElement("td");
      nota.className = "pista";
      nota.id = "pista-" + i;
      tr.appendChild(nota);

      cuerpo.appendChild(tr);
    });
  }

  function comprobar() {
    var malas = 0;
    var vacias = 0;
    DEMOS.forEach(function (d, i) {
      var inp = document.getElementById("pred-" + i);
      var nota = document.getElementById("pista-" + i);
      var real = document.getElementById("real-" + i);
      var r = revisar(i, inp.value);
      if (r.estado === "vacio") {
        inp.className = "";
        nota.textContent = "";
        real.textContent = "";
        vacias = vacias + 1;
      } else if (r.estado === "bien") {
        inp.className = "bien";
        nota.textContent = "";
        real.textContent = d.sale;
      } else {
        inp.className = "mal";
        nota.textContent = r.msg;
        real.textContent = "";
        malas = malas + 1;
      }
    });
    var v = document.getElementById("veredicto");
    if (vacias > 0) {
      v.className = "veredicto mal";
      v.textContent = "Faltan " + vacias + " de las nueve.";
    } else if (malas === 0) {
      v.className = "veredicto bien";
      v.textContent = "Las nueve. Falta lo que estas líneas no muestran: qué " +
        "imprime un rango al que no se le piden los elementos.";
      prediccionesListas = true;
      marcar();
    } else {
      v.className = "veredicto mal";
      v.textContent = malas + " en rojo, con la nota al lado de cada una.";
    }
  }

  function marcar() {
    document.getElementById("marcador-rangos").textContent =
      "resueltas: " + resueltos.rangos + " de " + RANGOS.length;
    document.getElementById("marcador-reuso").textContent =
      "resueltas: " + resueltos.reuso + " de " + REUSO.length +
      "    ·    opciones falladas en toda la página: " + fallados;
    if (prediccionesListas && resueltos.rangos === RANGOS.length
        && resueltos.reuso === REUSO.length) {
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
        if (o.larga) {
          b.className = "larga";
        } else if (o.ancha) {
          b.className = "ancha";
        }
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

  construirCodigo();
  construirTabla();
  document.getElementById("btn-comprobar").addEventListener("click", comprobar);
  construirOpciones("rangos", RANGOS, "rangos");
  construirOpciones("reuso", REUSO, "reuso");
  marcar();
})();
