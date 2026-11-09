/* El lenguaje de tipos de CHECKED (EOPL §7.1). Qué tipo tiene cada expresión
   y cómo se escribe el tipo de un procedimiento. Todos los tipos de esta
   página se midieron con type-of-program sobre
   interpretadores/Interpretes/Corte 2/3 ChequeoTipos. */
var BLOQUES = (function () {
  "use strict";

  function programa(texto) { return '<code class="programa">' + texto + "</code>"; }

  var TIPOS =
    "<type-exp> ::= int                        int-type-exp\n" +
    "           ::= bool                       bool-type-exp\n" +
    "           ::= ( {<type-exp>}*(*) -> <type-exp> )   proc-type-exp";

  var ANOTADAS =
    "proc ( {<type-exp> <identificador>}*(,) ) <expresion>\n\n" +
    "letrec { <type-exp> <identificador>\n" +
    "         ( {<type-exp> <identificador>}*(,) ) = <expresion> }*\n" +
    "in <expresion>";

  return [
    {
      id: "tipos-cual",
      titulo: "1. Qué tipo tiene cada expresión",
      definicion: TIPOS,
      explicacion:
        "El ambiente inicial de este interpretador está vacío, así que toda " +
        "variable se liga con <code>let</code>, <code>letrec</code> o " +
        "<code>proc</code>. Escoja el tipo de cada programa.",
      items: [
        { valor: programa("add1(3)"),
          opciones: ["int", "bool", "(int -&gt; int)"], correcta: 0,
          razon: "add1 recibe un int y entrega un int. El tipo de la aplicación de una primitiva es el tipo de su resultado, no el de la primitiva." },
        { valor: programa("zero?(0)"),
          opciones: ["int", "bool", "(int -&gt; bool)"], correcta: 1,
          razon: "zero? es la única primitiva de este lenguaje que entrega bool a partir de un int. Aquí ya está aplicada, así que el tipo es bool." },
        { valor: programa("&lt;(1, 2)"),
          opciones: ["bool", "int", "(int * int -&gt; bool)"], correcta: 0,
          razon: "Las comparaciones entregan bool. Note que este lenguaje no tiene ==: las primitivas son + - * add1 sub1 &lt; &gt; and zero?." },
        { valor: programa("and(zero?(0), true)"),
          opciones: ["bool", "int", "no tiene tipo"], correcta: 0,
          razon: "and pide dos bool y entrega bool. Sus dos argumentos lo son: zero?(0) y la constante true." },
        { valor: programa("proc (int x) add1(x)"),
          opciones: ["(int -&gt; int)", "int", "(int * int -&gt; int)"], correcta: 0,
          razon: "Un proc sin aplicar tiene tipo de procedimiento: los tipos de los parámetros, la flecha y el tipo del cuerpo." },
        { valor: programa("proc (int x, bool b) if b then x else 0"),
          opciones: ["(int * bool -&gt; int)", "(int * bool -&gt; bool)", "(bool * int -&gt; int)"], correcta: 0,
          razon: "Los parámetros van en su orden, separados por *, y el resultado es el tipo del cuerpo. Las dos ramas del if son int, así que el cuerpo es int." },
        { valor: programa("proc () 5"),
          opciones: ["(-&gt; int)", "int", "no tiene tipo"], correcta: 0,
          razon: "Un procedimiento sin parámetros tiene la lista de argumentos vacía, de modo que su tipo empieza con la flecha. Sigue siendo un procedimiento y no un int." },
        { valor: programa("proc (int x) proc (bool b) if b then x else 0"),
          opciones: ["(int -&gt; (bool -&gt; int))", "(int * bool -&gt; int)", "(bool -&gt; (int -&gt; int))"], correcta: 0,
          razon: "El cuerpo del primer proc es otro proc, así que el resultado es un tipo de procedimiento. No es lo mismo que recibir los dos parámetros a la vez." },
        { valor: programa("letrec int fact(int n) = if zero?(n) then 1 else *(n, (fact sub1(n))) in fact"),
          opciones: ["(int -&gt; int)", "int", "(int -&gt; bool)"], correcta: 0,
          razon: "El cuerpo del letrec es fact sin aplicar, así que el tipo del programa es el del procedimiento. Con (fact 5) en el cuerpo sería int." },
        { valor: programa("let x = 3 in let x = zero?(0) in x"),
          opciones: ["bool", "int", "no tiene tipo"], correcta: 0,
          razon: "El let interno liga x otra vez, y el ambiente de tipos funciona como el de valores: apply-tenv encuentra primero el eslabón más nuevo." }
      ]
    },
    {
      id: "tipos-escribir",
      titulo: "2. Cómo se escribe un tipo",
      definicion: ANOTADAS,
      explicacion:
        "En CHECKED el programador anota los tipos: cada parámetro lleva el " +
        "suyo delante del nombre, y cada declaración de <code>letrec</code> " +
        "lleva además el tipo que devuelve.",
      items: [
        { valor: "El tipo de un parámetro se escribe",
          opciones: ["antes del nombre: <code>proc (int x) …</code>",
                     "después del nombre: <code>proc (x int) …</code>",
                     "al final, después del cuerpo"],
          correcta: 0,
          razon: "La producción es (separated-list type-exp identifier \",\"): primero el tipo y luego el nombre, como en C o en Java." },
        { valor: "En el tipo de un procedimiento, los parámetros se separan con",
          opciones: ["<code>*</code>", "<code>,</code>", "<code>-&gt;</code>"],
          correcta: 0,
          razon: "La coma separa los parámetros cuando se declaran; el asterisco los separa cuando se escribe el tipo. La flecha va una sola vez, antes del resultado." },
        { valor: "El tipo de " + programa("proc ((int -&gt; int) f, int x) (f x)") + " es",
          opciones: ["((int -&gt; int) * int -&gt; int)", "(int -&gt; int * int -&gt; int)", "(int * int -&gt; int)"],
          correcta: 0,
          razon: "El primer parámetro es un procedimiento, así que su tipo va entre paréntesis dentro de la lista. Sin ellos no se sabría dónde termina un tipo y empieza el otro." },
        { valor: "En " + programa("letrec int fact(int n) = … in …") + ", el primer <code>int</code> es",
          opciones: ["el tipo que devuelve fact", "el tipo de n", "el tipo del cuerpo del letrec"],
          correcta: 0,
          razon: "Primero va el tipo del resultado, luego el nombre, y los tipos de los parámetros van dentro del paréntesis. Esa anotación es la que permite chequear el cuerpo recursivo sin haberlo chequeado todavía." },
        { valor: "El tipo de " + programa("(proc ((int -&gt; int) g, int n) (g n) proc (int m) add1(m) 7)") + " es",
          opciones: ["int", "(int -&gt; int)", "((int -&gt; int) * int -&gt; int)"],
          correcta: 0,
          razon: "El procedimiento está aplicado a sus dos argumentos, así que el tipo del programa es el del resultado. Corriéndolo da 8." }
      ]
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
