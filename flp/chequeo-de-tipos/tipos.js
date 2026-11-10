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
          opciones: ["int, el tipo del resultado de la primitiva",
                     "(int -&gt; int), porque el tipo de add1 pasa a la aplicación",
                     "ninguno, porque el 3 no lleva anotación de tipo"],
          correcta: 0,
          razon: "type-of-primitive le da a add1 el tipo (int -> int), y el tipo de una aplicación es el del resultado. Los literales no se anotan: las anotaciones son para los parámetros de proc y para el resultado de cada declaración de letrec." },
        { valor: programa("zero?(0)"),
          opciones: ["int, porque su argumento es un número",
                     "bool: la primitiva ya está aplicada",
                     "(int -&gt; bool), porque la aplicación hereda el tipo de zero?"],
          correcta: 1,
          razon: "zero? es la única primitiva de este lenguaje que va de int a bool. Ese es el tipo de la primitiva; el de zero?(0), que ya está aplicada, es el del resultado." },
        { valor: programa("&lt;(1, 2)"),
          opciones: ["int, porque la comparación es de números",
                     "(int * int -&gt; bool), que es el tipo de la aplicación",
                     "bool, el resultado de la comparación"],
          correcta: 2,
          razon: "Las dos comparaciones del lenguaje, < y >, van de dos int a bool. Aquí la primitiva está aplicada, así que el tipo es bool. Este lenguaje no trae ==: las primitivas son + - * add1 sub1 < > and zero?." },
        { valor: programa("and(zero?(0), true)"),
          opciones: ["bool, y sus dos argumentos también son bool",
                     "int, porque and devuelve 0 o 1 como en C",
                     "no tiene tipo, porque mezcla una primitiva y un literal"],
          correcta: 0,
          razon: "and pide dos bool y entrega bool. Sus argumentos lo son: zero?(0) por la primitiva y true por la gramática, que lo trae como expresión propia. Corriéndolo da #t." },
        { valor: programa("let x = 3 in let x = zero?(0) in x"),
          opciones: ["int, porque apply-tenv llega hasta el eslabón más viejo",
                     "bool, del eslabón más nuevo del ambiente",
                     "no tiene tipo, porque x se liga dos veces"],
          correcta: 1,
          razon: "El let interno agrega otro eslabón con x. apply-tenv recorre desde el más nuevo y para en el primero que tenga x, así que el x del cuerpo es el del zero?(0): bool." },
        { valor: programa("proc (int x) add1(x)"),
          opciones: ["int, porque un proc vale lo que vale su cuerpo",
                     "ninguno hasta aplicarlo, y ahí sería int",
                     "(int -&gt; int): parámetro, flecha y cuerpo"],
          correcta: 2,
          razon: "Un proc sin aplicar ya tiene tipo, y es un tipo de procedimiento: los tipos de los parámetros, la flecha y el tipo del cuerpo. int es el tipo de (proc (int x) add1(x) 5), que sí está aplicado y da 6." },
        { valor: programa("proc () 5"),
          opciones: ["(-&gt; int): la lista de parámetros queda vacía",
                     "int, porque sin parámetros no hay nada que recibir",
                     "(int): un procedimiento que solo tiene resultado"],
          correcta: 0,
          razon: "type-to-external-form escribe los parámetros, luego la flecha y luego el resultado. Sin parámetros no escribe nada antes de la flecha, de modo que el tipo arranca con ella. Sigue siendo un procedimiento: hay que aplicarlo para llegar al 5." },
        { valor: programa("proc (int x, bool b) if b then x else 0"),
          opciones: ["(int * bool -&gt; bool)",
                     "(int * bool -&gt; int)",
                     "(bool * int -&gt; int)"],
          correcta: 1,
          razon: "Los parámetros van en el orden en que se declaran, separados por asterisco. El resultado es el tipo del cuerpo, y el cuerpo es un if cuyas dos ramas son int. Que la prueba sea bool no vuelve bool al if." },
        { valor: programa("proc (int x) proc (bool b) if b then x else 0"),
          opciones: ["(int * bool -&gt; int)",
                     "(bool -&gt; (int -&gt; int))",
                     "(int -&gt; (bool -&gt; int))"],
          correcta: 2,
          razon: "El cuerpo del proc de afuera es otro proc, así que el resultado del primero es un tipo de procedimiento. Recibir los dos parámetros a la vez sería (int * bool -> int), que es otro procedimiento y otro tipo." },
        { valor: programa("letrec int fact(int n) = if zero?(n) then 1 else *(n, (fact sub1(n))) in fact"),
          opciones: ["(int -&gt; int), porque el cuerpo es fact sin aplicar",
                     "int: el letrec entrega lo que anotó para fact",
                     "(int -&gt; int) solo dentro del letrec; afuera es int"],
          correcta: 0,
          razon: "El tipo de un letrec es el de su cuerpo, y el cuerpo es fact a secas. La anotación int es el resultado de fact, no el del programa: con (fact 5) en el cuerpo el programa daría int, y corriéndolo, 120." }
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
          opciones: ["después del nombre, como en <code>proc (x int) …</code>",
                     "antes del nombre, como en <code>proc (int x) …</code>",
                     "antes del cuerpo y después de todos los nombres"],
          correcta: 1,
          razon: "La producción del proc es una lista separada por comas de type-exp seguido de identifier: primero el tipo y después el nombre, como en C o en Java." },
        { valor: "En el tipo de un procedimiento, los parámetros se separan con",
          opciones: ["una coma en los dos sitios, para no cambiar de signo",
                     "una flecha por parámetro, que es lo que separa los tipos",
                     "un asterisco en el tipo, y una coma al declararlos"],
          correcta: 2,
          razon: "arg-types-to-external-form mete un asterisco entre tipo y tipo. La coma es de la declaración. Una flecha por parámetro dice otra cosa: (int -> (bool -> int)) describe un proc que devuelve otro proc, no uno que recibe dos." },
        { valor: "En " + programa("letrec int fact(int n) = … in …") + ", el primer <code>int</code> es",
          opciones: ["el tipo que devuelve fact",
                     "el tipo del parámetro n",
                     "el tipo del cuerpo del letrec"],
          correcta: 0,
          razon: "El orden de la declaración es tipo del resultado, nombre, y después los parámetros con el suyo. Con esa anotación el chequeador arma (int -> int) y lo liga a fact antes de mirar el cuerpo, que es lo que permite chequear la llamada recursiva." },
        { valor: "El tipo de " + programa("proc ((int -&gt; int) f, int x) (f x)") + " es",
          opciones: ["(int -&gt; int * int -&gt; int)",
                     "((int -&gt; int) * int -&gt; int)",
                     "(int * int -&gt; int)"],
          correcta: 1,
          razon: "El primer parámetro es un procedimiento, así que su tipo va entre paréntesis dentro de la lista. Sin ellos no se sabe dónde termina un tipo y empieza el otro. (int * int -> int) describe algo distinto: un procedimiento que recibe dos números." },
        { valor: "El tipo de " + programa("(proc ((int -&gt; int) g, int n) (g n) proc (int m) add1(m) 7)") + " es",
          opciones: ["((int -&gt; int) * int -&gt; int), porque el tipo lo fija el operador",
                     "(int -&gt; int), porque (g n) devuelve lo mismo que g",
                     "int, porque el procedimiento está aplicado"],
          correcta: 2,
          razon: "El operador tiene tipo ((int -> int) * int -> int) y recibe sus dos argumentos: un proc de (int -> int) y un int. La aplicación entrega el resultado, int. Corriéndolo da 8." }
      ]
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
