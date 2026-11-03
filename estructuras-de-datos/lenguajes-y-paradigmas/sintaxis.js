/* Ejercicio interactivo: sintaxis y semántica. Los tokens se cuentan con
   la misma clasificación de la sesión; los mensajes de gcc y de python3
   son los de las corridas guardadas en programas.js. */
var EJERCICIO = (function () {
  var P = typeof module !== "undefined" ? require("./programas.js") : Programas;
  var T = typeof module !== "undefined" ? require("./texto.js") : Texto;

  var LINEA = "while (i < n) {";
  var TOKENS = [
    ["while", "palabra reservada"], ["(", "delimitador"], ["i", "identificador"],
    ["<", "operador"], ["n", "identificador"], [")", "delimitador"], ["{", "delimitador"]
  ];

  var BNF_ENTERO = [
    "         <entero> ::= <digito_sin_cero> <digito>*  |  \"0\"",
    "<digito_sin_cero> ::= \"1\" | ... | \"9\"",
    "         <digito> ::= \"0\" | \"1\" | ... | \"9\""
  ];
  var CANDIDATOS = ["0", "70", "007", "450", "05"];

  /* <entero>: "0" solo, o un dígito sin cero seguido de dígitos. */
  function esEntero(t) {
    var ok = t === "0";
    if (!ok && t.length > 0 && t[0] >= "1" && t[0] <= "9") {
      ok = true;
      var k = 1;
      while (k < t.length) {
        if (t[k] < "0" || t[k] > "9") { ok = false; }
        k = k + 1;
      }
    }
    return ok;
  }

  function cuenta(cat) {
    return TOKENS.filter(function (t) { return t[1] === cat; }).length;
  }

  function spec() {
    var validos = CANDIDATOS.filter(esEntero);
    return {
      contenedor: "tarjetas",
      cierre: "<p>La sintaxis dice cómo se escribe un programa y la semántica qué significa. La sintaxis se arma con tokens, que son identificadores, palabras reservadas, operadores, delimitadores y literales, y se especifica con una gramática en BNF: si una palabra no se deja derivar de las reglas, no es válida, y el compilador no necesita una lista de prohibidas. Las palabras reservadas cumplen la regla de identificador y están apartadas para el lenguaje. La semántica decide lo demás, como que la multiplicación se haga antes que la resta aunque esté escrita después. Y lo que delimita un bloque cambia de lenguaje a lenguaje: en C son las llaves, en Python la sangría.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Partir una línea en tokens",
          html: "<pre class=\"fragmento\">" + T.escapar(LINEA) + "</pre><p>¿Cuántos tokens tiene la línea y cuántos de ellos son identificadores?</p>",
          campos: [
            { rotulo: "tokens:", esperado: String(TOKENS.length), ancho: "3rem" },
            { rotulo: "identificadores:", esperado: String(cuenta("identificador")), ancho: "3rem" }
          ],
          bien: "Correcto. " + TOKENS.map(function (t) { return t[0] + " es " + t[1]; }).join("; ") + ". while cumple la forma de un identificador, pero es palabra reservada. Los espacios separan los tokens y no cuentan.",
          distractores: [
            { valores: [null, "3"], msg: "while tiene forma de identificador, pero es una palabra reservada del lenguaje. Los identificadores son los nombres que inventa el programador: i y n." },
            { valores: ["4", null], msg: "Los paréntesis y la llave también son tokens: son delimitadores." },
            { valores: ["11", null], msg: "Los espacios separan los tokens y después sobran: no se cuentan." }
          ],
          otro: "Escriba la línea token por token, sin espacios, y diga la categoría de cada uno." },
        { tipo: "opciones", titulo: "Cuál no es un identificador", columna: true, correcta: "3d",
          html: "<p>Con la gramática de identificador de la sesión, que empieza por letra o guion bajo y sigue con letras, dígitos o guiones bajos, ¿cuál de estos nombres no se puede derivar?</p>",
          opciones: [
            { op: "_total", texto: "<code>_total</code>", msg: "Se deriva: empieza por guion bajo, que es la segunda alternativa, y sigue con letras. gcc lo acepta." },
            { op: "x2y", texto: "<code>x2y</code>", msg: "Se deriva: letra, después identificador seguido de dígito, después identificador seguido de letra. gcc lo acepta." },
            { op: "3d", texto: "<code>3d</code>", msg: "Correcto. Ninguna alternativa empieza por un dígito. El analizador léxico lo lee como un número con una letra pegada, y gcc responde: " + P.id3d.error[1].replace(/^id_3d\.c:\d+:\d+: /, "") + "." },
            { op: "mi_var9", texto: "<code>mi_var9</code>", msg: "Se deriva: letras, guion bajo, letras y un dígito al final. gcc lo acepta." }
          ] },
        { tipo: "opciones", titulo: "Un nombre que cumple la regla", columna: true, correcta: "reservada",
          html: "<p>Alguien declara <code>int int;</code>. El nombre <code>int</code> se deriva de la gramática de identificador, y aun así gcc responde <code>" + T.escapar(P.idInt.error[1].replace(/^id_int\.c:\d+:\d+: /, "")) + "</code>. ¿Por qué?</p>",
          opciones: [
            { op: "reservada", texto: "Porque int es una palabra reservada: está apartada para el lenguaje y no sirve como nombre.", msg: "Correcto. Las palabras reservadas son una restricción por encima de la gramática de identificador. gcc ve dos veces un tipo de dato y se queja de eso." },
            { op: "corto", texto: "Porque los identificadores deben tener más de tres letras.", msg: "La regla no pone largo mínimo: x y n son identificadores válidos." },
            { op: "mayuscula", texto: "Porque los identificadores deben empezar en mayúscula.", msg: "La gramática acepta minúsculas, mayúsculas y guion bajo al comienzo." }
          ] },
        { tipo: "respuesta", titulo: "La regla del entero",
          html: "<p>Con estas producciones:</p>" + T.codigo(BNF_ENTERO) + "<p>¿Cuáles de <code>" + CANDIDATOS.join("  ") + "</code> son <code>&lt;entero&gt;</code>? Escríbalos en el orden de la lista, separados por espacios.</p>",
          campos: [{ rotulo: "enteros:", esperado: validos.join(" "), ancho: "10rem" }],
          bien: "Correcto. El 0 sale de la segunda alternativa; 70 y 450 empiezan por un dígito sin cero y siguen con cualquier cantidad de dígitos, que es lo que dice la estrella de Kleene. 007 y 05 empiezan por cero sin ser el 0 solo: ninguna alternativa los deriva.",
          distractores: [
            { valores: ["70 450"], msg: "El 0 solo sí es un entero: es la segunda alternativa de la regla." },
            { valores: ["0 70 007 450 05"], msg: "Fíjese en la primera alternativa: el primer dígito tiene que ser de 1 a 9. 007 y 05 empiezan por cero." }
          ],
          otro: "Pruebe cada uno contra las dos alternativas: el 0 solo, o un primer dígito de 1 a 9 seguido de dígitos." },
        { tipo: "respuesta", titulo: "Lo que decide la semántica",
          html: T.codigo(P.precedencia.codigo) + "<p>¿Qué imprime?</p>",
          campos: [{ rotulo: "imprime:", esperado: P.precedencia.salida, ancho: "4rem" }],
          bien: "Correcto. q * 4 queda abajo en el árbol: se calcula primero, 8, y después 10 − 8 + 1 = 3. La precedencia es parte de la semántica, no del orden en que se lee la línea.",
          distractores: [
            { valores: ["33"], msg: "Eso es (10 − 2) · 4 + 1, leyendo de izquierda a derecha. La multiplicación va antes, aunque esté escrita después de la resta." },
            { valores: ["1"], msg: "Eso es 10 − (8 + 1). La resta y la suma, que tienen la misma precedencia, se hacen de izquierda a derecha: (10 − 8) + 1." }
          ],
          otro: "Haga primero la multiplicación y después la resta y la suma, de izquierda a derecha." },
        { tipo: "opciones", titulo: "Dónde termina un bloque", columna: true, correcta: "sangria",
          html: T.codigo(P.sangria.codigo) + "<p>El mismo <code>if</code> en C, escrito todo en una sola línea, compila y corre. Este programa de Python no corre. ¿Por qué?</p>",
          opciones: [
            { op: "sangria", texto: "Porque en Python la sangría marca el bloque, y print quedó fuera del if.", msg: "Correcto. Python responde " + P.sangria.error[P.sangria.error.length - 1] + ". En C los bloques se delimitan con llaves y el espacio en blanco no significa nada; en Python la sangría es sintaxis." },
            { op: "dospuntos", texto: "Porque sobran los dos puntos al final del if.", msg: "En Python los dos puntos son obligatorios después de la condición: anuncian el bloque." },
            { op: "parentesis", texto: "Porque la condición del if debe ir entre paréntesis, como en C.", msg: "En Python los paréntesis de la condición son opcionales. El error está en la línea siguiente." }
          ] }
      ]
    };
  }

  return { TOKENS: TOKENS, CANDIDATOS: CANDIDATOS, esEntero: esEntero, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
