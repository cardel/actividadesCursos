/* Ejercicio interactivo: imperativo, funcional y orientado a objetos. La
   traza de potencia sigue el ciclo de potencia.c; la sustitución de
   suma-cuadrados se arma aquí y su valor coincide con el del mismo cálculo
   corrido en python3. */
var EJERCICIO = (function () {
  var P = typeof module !== "undefined" ? require("./programas.js") : Programas;
  var T = typeof module !== "undefined" ? require("./texto.js") : Texto;

  var SCHEME = [
    "(define (suma-cuadrados n)",
    "  (if (= n 0)",
    "      0",
    "      (+ (* n n) (suma-cuadrados (- n 1)))))"
  ];

  /* El ciclo de potencia.c: una fila por evaluación de la condición. */
  function trazaPotencia(base, exp) {
    var filas = [];
    var resultado = 1;
    var i = 0;
    var sigue = true;
    while (sigue) {
      var cumple = i < exp;
      filas.push({ i: i, cumple: cumple, resultado: resultado });
      if (cumple) {
        resultado = resultado * base;
        i = i + 1;
      } else {
        sigue = false;
      }
    }
    return { filas: filas, resultado: resultado, evaluaciones: filas.length };
  }

  /* La sustitución de (suma-cuadrados n): cada paso abre una llamada más. */
  function pasosSuma(n) {
    var lista = [];
    var abiertas = 0;
    var cuerpo = "";
    function expr(cola) {
      var s = cuerpo + cola;
      var j = 0;
      while (j < abiertas) { s = s + ")"; j = j + 1; }
      return s;
    }
    lista.push("(suma-cuadrados " + n + ")");
    var k = n;
    while (k > 0) {
      cuerpo = cuerpo + "(+ (* " + k + " " + k + ") ";
      abiertas = abiertas + 1;
      lista.push(expr("(suma-cuadrados " + (k - 1) + ")"));
      k = k - 1;
    }
    lista.push(expr("0"));
    lista.push(String(valor(n)));
    return lista;
  }

  function valor(n) {
    var s = 0;
    var k = 1;
    while (k <= n) { s = s + k * k; k = k + 1; }
    return s;
  }

  function llamadas(n) { return n + 1; }

  function spec() {
    var t = trazaPotencia(3, 4);
    var pasos = pasosSuma(3).map(function (e, i) {
      return { html: "<pre class=\"fragmento\">" + T.escapar(e) + "</pre>",
        texto: i === 0 ? "la expresión de partida" : (i === pasosSuma(3).length - 1 ? "se resuelven las operaciones pendientes: no queda nada por sustituir" : "se sustituye la llamada más interna por el cuerpo de la función") };
    });
    return {
      contenedor: "tarjetas",
      cierre: "<p>El paradigma fija qué es una variable. En el imperativo es un espacio de memoria cuyo valor cambia, y el programa dice cómo ir construyendo el resultado paso a paso: por eso hay ciclos. En el declarativo es un nombre que se sustituye por un valor y nunca cambia: el programa dice qué se calcula, y la evaluación reescribe la expresión hasta dejar un número. La orientación a objetos sigue siendo imperativa: el ciclo es el mismo, y lo que cambia es que el estado vive en un atributo del objeto.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Una traza imperativa",
          html: T.codigo(P.potencia.codigo) + "<p>Para <code>potencia(3, 4)</code>, ¿cuántas veces se evalúa la condición <code>i &lt; exp</code> y qué valor devuelve la función?</p>",
          campos: [
            { rotulo: "evaluaciones:", esperado: String(t.evaluaciones), ancho: "3rem" },
            { rotulo: "devuelve:", esperado: String(t.resultado), ancho: "4rem" }
          ],
          bien: "Correcto. La condición se cumple con i = 0, 1, 2 y 3, y falla con i = 4: son " + t.evaluaciones + " evaluaciones para 4 vueltas. resultado pasa por 1, 3, 9, 27 y " + t.resultado + ", y el programa imprime " + P.potencia.salida + ". Dos casillas de memoria se sobrescriben en cada vuelta: eso es el estado.",
          distractores: [
            { valores: ["4", null], msg: "Hay 4 vueltas, pero la condición se evalúa una vez más: la que da falso con i = 4 y saca del ciclo." },
            { valores: [null, "64"], msg: "64 es 4³. Aquí la base es 3 y el exponente 4: 3 · 3 · 3 · 3." },
            { valores: [null, "12"], msg: "El ciclo multiplica, no suma: resultado = resultado * base." }
          ],
          otro: "Lleve una tabla con i, la condición y resultado en cada evaluación." },
        { tipo: "pasos", titulo: "Una evaluación por sustitución",
          html: "<p>En Scheme:</p>" + T.codigo(SCHEME) + "<p>Se evalúa <code>(suma-cuadrados 3)</code>. Ninguna variable cambia de valor: cada llamada tiene su propio n, y la expresión se reescribe.</p>",
          pasos: pasos },
        { tipo: "respuesta", titulo: "Con un número más",
          html: "<p>Con la misma definición se evalúa <code>(suma-cuadrados 4)</code>. ¿Qué valor da y cuántas veces se llama <code>suma-cuadrados</code>, contando la primera?</p>",
          campos: [
            { rotulo: "valor:", esperado: String(valor(4)), ancho: "4rem" },
            { rotulo: "llamadas:", esperado: String(llamadas(4)), ancho: "3rem" }
          ],
          bien: "Correcto. 16 + 9 + 4 + 1 + 0 = " + valor(4) + ", con las llamadas para n = 4, 3, 2, 1 y 0. La de n = 0 no abre otra: devuelve 0 y desde ahí se resuelven las sumas pendientes.",
          distractores: [
            { valores: [null, "4"], msg: "Falta la llamada con n = 0: es la que devuelve 0 y detiene la sustitución." },
            { valores: ["10", null], msg: "10 es 4 + 3 + 2 + 1. La función suma los cuadrados: (* n n)." }
          ],
          otro: "Escriba la sustitución como en la tarjeta anterior, ahora empezando en 4." },
        { tipo: "opciones", titulo: "La n de cada llamada", columna: true, correcta: "propia",
          html: "<p>Durante la evaluación de <code>(suma-cuadrados 3)</code>, ¿qué pasa con <code>n</code>?</p>",
          opciones: [
            { op: "global", texto: "Es una sola variable que comparten todas las llamadas.", msg: "Si fuera compartida, al volver de la llamada interna n valdría 0 y las sumas pendientes saldrían mal. Cada llamada tiene la suya." }
          ,
            { op: "cambia", texto: "Empieza en 3 y va bajando: 2, 1 y 0.", msg: "Eso describe una variable imperativa que se sobrescribe. Aquí ninguna n cambia: cada llamada tiene la suya." },
            { op: "propia", texto: "Cada llamada tiene su propia n, con 3, 2, 1 y 0, y ninguna cambia de valor.", msg: "Correcto. La n declarativa es un nombre que se sustituye por un valor, como en matemáticas. No hay casilla que se sobrescriba, y por eso tampoco hay ciclo: la repetición sale de la recursión." }] },
        { tipo: "opciones", titulo: "El estado se muda", columna: true, correcta: "atributo",
          html: T.codigo(P.potenciaOO.codigo) + "<p>Comparada con <code>potencia.c</code>, ¿qué cambió en esta versión?</p>",
          opciones: [
            { op: "atributo", texto: "Dónde vive el estado: resultado es un atributo del objeto y no una variable local.", msg: "Correcto. El cálculo es el mismo y también imprime " + P.potenciaOO.salida + ". La orientación a objetos es una variación del paradigma imperativo: los pasos y el estado viven dentro de un objeto." },
            { op: "calculo", texto: "El cálculo: la clase multiplica de otra forma.", msg: "El while es idéntico línea por línea. Lo único que se movió es resultado." }
          ,
            { op: "paradigma", texto: "El paradigma: ahora es declarativa, porque usa una clase.", msg: "El ciclo sigue diciendo cómo calcular, paso a paso, con variables que cambian. Sigue siendo imperativa." }] },
        { tipo: "opciones", titulo: "Cuando nada cambia", columna: true, correcta: "carrera",
          html: "<p>Haskell y Erlang, lenguajes funcionales, se usan en sistemas donde muchos procesos trabajan al mismo tiempo. ¿Qué tipo de error evita que las variables no cambien de valor?</p>",
          opciones: [
            { op: "sintaxis", texto: "Los errores de sintaxis.", msg: "La sintaxis la revisa el traductor antes de ejecutar, en cualquier paradigma." }
          ,
            { op: "carrera", texto: "Que dos procesos modifiquen la misma variable a la vez y el resultado dependa de cuál llegó primero.", msg: "Correcto. Es una condición de carrera: con los mismos datos, ejecuciones distintas dan respuestas distintas. Si ningún valor puede cambiar, ese error no existe." },
            { op: "desborde", texto: "Que un entero se desborde.", msg: "El desborde depende del tamaño de los enteros, no de si las variables cambian." }] }
      ]
    };
  }

  return { SCHEME: SCHEME, trazaPotencia: trazaPotencia, pasosSuma: pasosSuma, valor: valor, llamadas: llamadas, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
