/* Ejemplos de inferencia: qué tipo sale de cada programa. Todos los tipos y
   todos los mensajes de error de esta página se midieron con
   (type-to-external-form (type-of-program (scan&parse …))) sobre
   interpretadores/Interpretes/Corte 2/4 InferenciaTipos. Las variables libres
   se escriben t1 porque el número serial que imprime el interpretador cambia
   entre corridas. */
var BLOQUES = (function () {
  "use strict";

  function programa(texto) { return '<code class="programa">' + texto + "</code>"; }

  var PAR =
    "letrec\n" +
    "  ? even (? x) = if zero?(x) then true  else (odd sub1(x))\n" +
    "  ? odd  (? x) = if zero?(x) then false else (even sub1(x))\n" +
    "in …";

  return [
    {
      id: "sin-variables",
      titulo: "1. Programas cuyo tipo queda cerrado",
      definicion: null,
      explicacion:
        "En estos las primitivas y el condicional alcanzan para llenar todos " +
        "los huecos, de modo que el tipo no lleva ninguna variable. Escoja el " +
        "tipo de cada programa.",
      items: [
        { valor: "El tipo de " + programa("add1(3)") + " es",
          opciones: ["<code>int</code>",
                     "<code>(int -&gt; int)</code>, el tipo de <code>add1</code>",
                     "una variable, porque el 3 no lleva anotación"],
          correcta: 0,
          razon: "La primitiva ya está aplicada, así que el tipo es el del resultado. Los literales nunca se anotaron ni en el lenguaje con tipos obligatorios: las anotaciones, y por tanto los huecos, son para los parámetros y los resultados declarados." },
        { valor: "El tipo de " + programa("zero?(0)") + " es",
          opciones: ["<code>int</code>, porque su argumento es un número",
                     "<code>bool</code>",
                     "<code>(int -&gt; bool)</code>, que es el de la primitiva"],
          correcta: 1,
          razon: "zero? es la única primitiva de este lenguaje que va de int a bool. Aplicada a 0 entrega el resultado, bool. Este lenguaje no trae and ni ==: las primitivas son + - * add1 sub1 < > y zero?." },
        { valor: "El tipo de " + programa("let x = 3 in zero?(x)") + " es",
          opciones: ["<code>int</code>, el tipo de lo que el <code>let</code> liga",
                     "<code>(int -&gt; bool)</code>, con el <code>let</code> como procedimiento",
                     "<code>bool</code>"],
          correcta: 2,
          razon: "El tipo de un let es el de su cuerpo. La ligadura solo sirve para extender el ambiente de tipos con x : int, que es lo que después deja pasar el zero?(x). El let no lleva anotación ni hueco: su tipo sale de la expresión ligada." },
        { valor: "El tipo de " + programa("proc (? x) sub1(x)") + " es",
          opciones: ["<code>(int -&gt; int)</code>",
                     "<code>(t1 -&gt; int)</code>, porque el parámetro no se anotó",
                     "<code>int</code>, el tipo del cuerpo"],
          correcta: 0,
          razon: "La variable que entró por el hueco se encuentra con la ecuación de sub1, que pide int, y queda llena. Un proc sin aplicar ya tiene tipo, y es un tipo de procedimiento: int es el de (proc (? x) sub1(x) 5)." },
        { valor: "El tipo de " + programa("proc (? x, ? y) -(x, y)") + " es",
          opciones: ["<code>(int -&gt; int)</code>, porque la resta es de enteros",
                     "<code>(int * int -&gt; int)</code>",
                     "<code>(t1 * t2 -&gt; int)</code>, con los parámetros sin resolver"],
          correcta: 1,
          razon: "La resta aporta una ecuación que iguala los tipos de sus dos argumentos con int y el del resultado con int, de modo que los dos huecos quedan llenos. Los parámetros se separan con asterisco cuando se escribe el tipo." },
        { valor: "El tipo de " + programa("proc (? x, ? y) &gt;(x, y)") + " es",
          opciones: ["<code>(int * int -&gt; int)</code>, porque compara enteros",
                     "<code>(bool * bool -&gt; bool)</code>, porque el resultado es una comparación",
                     "<code>(int * int -&gt; bool)</code>"],
          correcta: 2,
          razon: "Las dos comparaciones del lenguaje, < y >, reciben dos int y entregan bool. Los parámetros los fija el lado izquierdo de la ecuación y el resultado el derecho; una comparación no vuelve bool a lo que compara." },
        { valor: "El tipo de " + programa("proc (? x) if x then 1 else 2") + " es",
          opciones: ["<code>(bool -&gt; int)</code>",
                     "<code>(int -&gt; int)</code>, porque las dos ramas son números",
                     "<code>(t1 -&gt; int)</code>, porque nada aplica <code>x</code>"],
          correcta: 0,
          razon: "La prueba del condicional aporta la ecuación que llena la variable de x con bool, y las dos ramas, que son int, dan el tipo del resultado. El parámetro queda deducido sin que se le aplique ninguna primitiva." },
        { valor: "El tipo de " + programa("proc (? x) if zero?(x) then true else false") + " es",
          opciones: ["<code>(bool -&gt; bool)</code>, porque la prueba es <code>bool</code>",
                     "<code>(int -&gt; bool)</code>",
                     "<code>(int -&gt; int)</code>, porque <code>zero?</code> mira un entero"],
          correcta: 1,
          razon: "El que llena el hueco es zero?, que pide int; lo bool es el resultado de la primitiva, no su argumento. Las dos ramas son true y false, que la gramática trae como expresiones propias, así que el resultado es bool." },
        { valor: "El tipo de " + programa("(proc (? x) add1(x) 5)") + " es",
          opciones: ["<code>(int -&gt; int)</code>, el del procedimiento que está en el operador",
                     "ninguno: el operador tendría que ser un nombre y no un <code>proc</code>",
                     "<code>int</code>"],
          correcta: 2,
          razon: "El operador de una aplicación es cualquier expresión, y aquí es el proc escrito en el sitio. La ecuación de la aplicación iguala su tipo con (int -> t1), de donde el resultado es int. Corriéndolo da 6." },
        { valor: "El tipo de " + programa("proc (? x) proc (? y) +(x, y)") + " es",
          opciones: ["<code>(int -&gt; (int -&gt; int))</code>",
                     "<code>(int * int -&gt; int)</code>, porque recibe dos enteros",
                     "<code>(int -&gt; int)</code>, el del <code>proc</code> de adentro"],
          correcta: 0,
          razon: "Son dos proc anidados, cada uno de un parámetro: el de afuera recibe x y entrega un procedimiento. (int * int -> int) es el tipo de proc (? x, ? y) +(x, y), que es otro programa: ese recibe los dos de una vez." }
      ],
      cierre: "Cuando las primitivas y el condicional alcanzan a restringir todos los huecos, el tipo sale sin ninguna variable."
    },
    {
      id: "con-variables",
      titulo: "2. Variables libres, letrec y los que no tipan",
      definicion: PAR,
      explicacion:
        "Aquí el sistema de ecuaciones deja variables sin llenar, o se " +
        "contradice. Las variables libres se escriben <code>t1</code>, porque " +
        "el número que imprime el interpretador cambia de una corrida a otra.",
      items: [
        { valor: "El tipo de " + programa("let d = proc (? n) *(n, 2) in d") + " es",
          opciones: ["<code>int</code>, el tipo del cuerpo del procedimiento",
                     "<code>(int -&gt; int)</code>",
                     "<code>(t1 -&gt; int)</code>, porque <code>d</code> no se aplica"],
          correcta: 1,
          razon: "La multiplicación llena el hueco con int antes de que el let ligue nada. El cuerpo del let es d, no una llamada, así que el tipo del programa es el del procedimiento. Cambiarlo por (d 7) deja el programa en int, y corriéndolo da 14." },
        { valor: "El tipo de " + programa("let f = proc (? x) x in (f 3)") + " es",
          opciones: ["<code>(t1 -&gt; t1)</code>, el de la identidad que se ligó",
                     "<code>(int -&gt; int)</code>, el de la identidad ya especializada",
                     "<code>int</code>"],
          correcta: 2,
          razon: "La llamada llena la variable con int y entrega el resultado, que es esa misma variable: int. (int -> int) es el tipo de f después de la llamada, y es lo que se obtiene si el cuerpo del let es f en vez de (f 3)." },
        { valor: "El tipo de " + programa("proc (? g) proc (? n) if zero?(n) then 0 else (g n)") + " es",
          opciones: ["<code>((int -&gt; int) -&gt; (int -&gt; int))</code>",
                     "<code>((int -&gt; t1) -&gt; (int -&gt; t1))</code>, con el resultado suelto",
                     "<code>((t1 -&gt; t1) * int -&gt; int)</code>, con los dos parámetros juntos"],
          correcta: 0,
          razon: "zero?(n) fija n en int, y la rama del else obliga a que g reciba un int. Su resultado no queda libre: la otra rama es 0, y las dos ramas tienen que coincidir, de modo que g entrega int." },
        { valor: "El tipo de " + programa("proc (? x, ? y) +(x, (y x))") + " es",
          opciones: ["<code>(int * int -&gt; int)</code>, porque la suma es de enteros",
                     "<code>(int * (int -&gt; int) -&gt; int)</code>",
                     "<code>(t1 * (t1 -&gt; int) -&gt; int)</code>, con la entrada sin fijar"],
          correcta: 1,
          razon: "La suma pide que sus dos argumentos sean int, de donde x es int y (y x) es int. La aplicación obliga a que y sea un procedimiento que recibe el tipo de x y entrega ese int, así que la variable de x queda llena por la suma y reaparece dentro del tipo de y." },
        { valor: "El tipo de " + programa("letrec ? fact (? n) = if zero?(n) then 1 else *(n, (fact sub1(n))) in (fact 5)") + " es",
          opciones: ["<code>(int -&gt; int)</code>, el del procedimiento declarado",
                     "ninguno: el tipo de <code>fact</code> se necesita antes de deducirlo",
                     "<code>int</code>"],
          correcta: 2,
          razon: "El chequeador liga fact a un tipo con huecos frescos antes de mirar su cuerpo, y la llamada recursiva aporta ecuaciones sobre esos mismos huecos: por eso no hace falta la anotación. El cuerpo del letrec es la llamada, de modo que el tipo del programa es int." },
        { valor: "Con el cuerpo " + programa("(odd 13)") + ", el tipo del par de arriba es",
          opciones: ["<code>bool</code>",
                     "<code>(int -&gt; bool)</code>, el tipo de <code>odd</code>",
                     "ninguno: los dos nombres se necesitan antes de estar declarados"],
          correcta: 0,
          razon: "Las dos declaraciones entran al ambiente de tipos antes de que se chequee cualquiera de los dos cuerpos, y por eso la recursión mutua funciona. sub1 fija el parámetro en int y las ramas true y false fijan el resultado en bool; la llamada entrega ese resultado." },
        { valor: "Con el cuerpo " + programa("even") + ", el tipo del par de arriba es",
          opciones: ["<code>bool</code>, el tipo que las dos declaraciones comparten",
                     "<code>(int -&gt; bool)</code>",
                     "<code>(int -&gt; int)</code>, porque <code>sub1</code> fija las dos puntas"],
          correcta: 1,
          razon: "El cuerpo entrega el procedimiento en vez de aplicarlo, así que el tipo del programa es el de even: recibe el int que pide sub1 y entrega el bool de sus ramas. Los dos huecos de la declaración quedaron llenos sin que nadie escribiera un tipo." },
        { valor: "El tipo de " + programa("proc (? f, ? x) (f +(1,x) zero?(x))") + " es",
          opciones: ["<code>((int * bool -&gt; int) * int -&gt; int)</code>, con todo cerrado",
                     "<code>((int * bool -&gt; t1) * int -&gt; t2)</code>, con dos variables sueltas",
                     "<code>((int * bool -&gt; t1) * int -&gt; t1)</code>"],
          correcta: 2,
          razon: "Las dos primitivas fijan los argumentos de f en int y bool, y de paso x en int. Del resultado de f no se sabe nada, y ese resultado es el del cuerpo del proc: una sola variable que aparece dos veces. El programa tipa para cualquier t1." },
        { valor: "Con " + programa("proc (? x) (x x)") + ", el interpretador",
          opciones: ["falla: el tipo de <code>x</code> tendría que estar dentro de sí mismo",
                     "deduce <code>(t1 -&gt; t1)</code>, aplicando <code>x</code> a su propio tipo",
                     "deduce <code>((t1 -&gt; t2) * t1 -&gt; t2)</code>, como cualquier aplicación"],
          correcta: 0,
          razon: "Aborta con Can't unify: tvar11 occurs in type (tvar11 -> tvar12). La aplicación pide que x sea un procedimiento que recibe el tipo de x, y check-no-occurrence rechaza llenar una variable con un tipo que la contiene. El número que imprime cambia entre corridas." },
        { valor: "Con " + programa("proc (? f, ? x) (f (x 1) zero?(x))") + ", el interpretador",
          opciones: ["deduce <code>((t1 * bool -&gt; t2) * (int -&gt; t1) -&gt; t2)</code>",
                     "falla, y es el chequeo de ocurrencia el que lo rechaza",
                     "falla: <code>x</code> tendría que ser un procedimiento y un <code>int</code> a la vez"],
          correcta: 2,
          razon: "Aborta con Type mismatch: int doesn't match (int -> tvar61). (x 1) pide que x reciba un entero y zero?(x) pide que x sea uno, y el contenedor se llena una sola vez. El chequeo de ocurrencia es otra cosa: ahí la variable aparece dentro de su propio tipo." }
      ],
      cierre: "Un tipo con variables libres vale para cualquier sustitución de esas variables, y el programa tipa igual. Lo que el interpretador rechaza es un sistema sin solución."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
