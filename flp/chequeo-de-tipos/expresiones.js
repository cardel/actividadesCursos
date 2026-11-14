/* El tipo de una expresión compuesta. Los seis tipos y los dos mensajes de
   rechazo de esta página se midieron con type-of-program sobre el
   interpretador de la sesión. */
var BLOQUES = (function () {
  "use strict";
  function programa(texto) { return '<code class="programa">' + texto + "</code>"; }
  return [
    {
      id: "que-tipo-tiene",
      titulo: "1. Qué tipo tiene la expresión",
      definicion: null,
      explicacion:
        "Para cada expresión, diga qué responde el chequeador. Una de las " +
        "opciones es que la rechace, y en varias lo hace. Conviene mirar " +
        "primero si la expresión está aplicada o solo declarada, y después si " +
        "las dos ramas de un condicional coinciden.",
      items: [
        { valor: programa(">(7, 6)"),
          opciones: ["bool", "int", "(int * int -&gt; bool)", "la rechaza"],
          correcta: 0,
          razon: "La primitiva ya está aplicada a sus dos argumentos, así que lo que queda es el resultado y no el procedimiento. El tipo de > es (int * int -> bool), y el de la aplicación es bool." },

        { valor: programa("let t = proc (int n) >(n, 3) x = 10<br>in if (t 4) then +(5, 4) else -(x, 6)"),
          opciones: ["(int -&gt; bool)", "bool", "int", "la rechaza"],
          correcta: 2,
          razon: "La prueba (t 4) aplica t a un entero y entrega bool, que es lo que la regla del condicional pide. Las dos ramas son sumas y restas de enteros, así que las dos son int y el if también." },

        { valor: programa("proc (int k, (bool -&gt; int) t)<br>&nbsp;&nbsp;if &gt;(k, 8) then t else proc (bool q) *(k, 2)"),
          opciones: ["(int * (bool -&gt; int) -&gt; (int -&gt; bool))",
                     "(int * (bool -&gt; int) -&gt; (bool -&gt; int))",
                     "((bool -&gt; int) * int -&gt; (bool -&gt; int))",
                     "la rechaza"],
          correcta: 1,
          razon: "Las dos ramas entregan un procedimiento de bool a int: la del then es t, que viene anotado así, y la del else construye uno que ignora su parámetro y devuelve un entero. El if vale entonces (bool -> int), y ese es el resultado del procedimiento de afuera. Las otras dos opciones invierten la flecha de adentro o intercambian los dos parámetros de afuera, y el orden en que se declaran es el orden en que aparecen en el tipo." },

        { valor: programa("proc (int a, int b)<br>&nbsp;&nbsp;if &gt;(a, b)<br>&nbsp;&nbsp;then (proc (int k) +(a, k) 7)<br>&nbsp;&nbsp;else +(b, 3)"),
          opciones: ["(int * int -&gt; (int -&gt; int))",
                     "(int * int -&gt; bool)",
                     "la rechaza",
                     "(int * int -&gt; int)"],
          correcta: 3,
          razon: "La rama del then no es un procedimiento: es una aplicación, porque el paréntesis de afuera encierra el proc y el 7. Aplicar (int -> int) a un entero entrega int, igual que la otra rama, así que las dos coinciden." },

        { valor: programa("proc (int a, int b)<br>&nbsp;&nbsp;if &gt;(a, b)<br>&nbsp;&nbsp;then proc (int k) +(a, k)<br>&nbsp;&nbsp;else +(b, 3)"),
          opciones: ["(int * int -&gt; int)",
                     "la rechaza",
                     "(int * int -&gt; (int -&gt; int))",
                     "(int -&gt; int)"],
          correcta: 1,
          razon: "Es la anterior sin el paréntesis que aplicaba el procedimiento. Ahora la rama del then vale (int -> int) y la del else vale int, y la segunda comparación de la regla del condicional falla con el mensaje (int -> int) != int. Un paréntesis decide entre las dos." },

        { valor: programa("proc (int x, int y)<br>&nbsp;&nbsp;proc (int k, bool t)<br>&nbsp;&nbsp;&nbsp;&nbsp;if t then y else t"),
          opciones: ["(int * int -&gt; (int * bool -&gt; bool))",
                     "(int * int -&gt; (int * bool -&gt; int))",
                     "la rechaza",
                     "(int * int -&gt; int)"],
          correcta: 2,
          razon: "La prueba sí es booleana, así que esa comparación pasa. Falla la otra: la rama del then es y, que vale int, y la del else es t, que vale bool, y el mensaje dice int != bool. Escribiendo k en lugar de t en el else, el procedimiento queda de tipo (int * int -> (int * bool -> int))." }
      ],
      cierre:
        "Dos cosas deciden casi todos estos casos. Una, si la expresión está " +
        "aplicada o solo declarada, que es la diferencia entre int y " +
        "(int -> int) y a veces depende de un paréntesis. Otra, si las dos " +
        "ramas del condicional coinciden, que es lo que rechaza las dos " +
        "últimas."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }
