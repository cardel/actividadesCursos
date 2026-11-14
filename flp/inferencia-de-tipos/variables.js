/* Variables de tipo: qué son, cuándo dos partes de un programa llevan la misma
   y cuándo pueden llevar distintas. Los tipos de esta página se midieron con
   type-of-program sobre interpretadores/Interpretes/Corte 2/4 InferenciaTipos.
   Los números seriales que imprime el interpretador cambian entre corridas, de
   modo que aquí las variables se escriben t1, t2 y t3 respetando qué posiciones
   comparten variable en la salida medida. */
var BLOQUES = (function () {
  "use strict";

  function programa(texto) { return '<code class="programa">' + texto + "</code>"; }

  var TAD =
    "(define-datatype type type?\n" +
    "  (atomic-type (name symbol?))\n" +
    "  (proc-type   (arg-types (list-of type?)) (result-type type?))\n" +
    "  (tvar-type   (serial-number integer?) (container vector?)))\n\n" +
    "(define fresh-tvar\n" +
    "  (let ((serial-number 0))\n" +
    "    (lambda ()\n" +
    "      (set! serial-number (+ 1 serial-number))\n" +
    "      (tvar-type serial-number (vector '())))))";

  var APLICACION =
    "tipo del operador  =  (tipo del arg1 * … * tipo del argN  ->  tipo de la aplicación)";

  return [
    {
      id: "tad-tvar",
      titulo: "1. El TAD variable de tipo",
      definicion: TAD,
      explicacion:
        "Una variable de tipo lleva un número serial que la identifica y un " +
        "contenedor que empieza vacío. <code>fresh-tvar</code> entrega una " +
        "nueva cada vez que el interpretador encuentra un hueco. Responda sobre " +
        "el TAD.",
      items: [
        { valor: "Una variable de tipo representa",
          opciones: ["un valor del programa que todavía no se calculó",
                     "un tipo que todavía no se conoce",
                     "un identificador del programa que quedó sin ligadura"],
          correcta: 1,
          razon: "Vive en el chequeador, no en la evaluación: el interpretador no corre el programa para deducir tipos. Es una incógnita del sistema de ecuaciones, del mismo rango que int, bool o un tipo de procedimiento." },
        { valor: "El contenedor de una variable de tipo se llena",
          opciones: ["a lo sumo una vez, y de ahí en adelante no cambia",
                     "cada vez que la unificación pasa por ella",
                     "al final, cuando el sistema ya está resuelto"],
          correcta: 0,
          razon: "De ahí el nombre de variable de asignación única. Esa restricción es la que rechaza los programas con dos usos incompatibles: no hay forma de que una variable valga int en un sitio y bool en otro." },
        { valor: "Lo que garantiza <code>fresh-tvar</code> es que",
          opciones: ["el contenedor arranque con <code>int</code>, que es el tipo más común",
                     "la variable esté llena antes de que alguien la lea",
                     "ninguna variable repita número"],
          correcta: 2,
          razon: "El set! sobre serial-number, dentro del let que envuelve al lambda, es la fuente de la unicidad. El contenedor arranca vacío, y leerlo vacío es legítimo: significa que todavía no se sabe nada de ese tipo." },
        { valor: "El número que imprime el interpretador, como el 10 de <code>tvar10</code>,",
          opciones: ["identifica el parámetro: el 10 es el décimo hueco del programa",
                     "depende del orden de las llamadas a <code>fresh-tvar</code>",
                     "cuenta cuántas ecuaciones hubo que resolver para llenarla"],
          correcta: 1,
          razon: "El contador es uno solo y no se reinicia entre programas, así que el mismo programa medido dos veces en la misma sesión imprime números distintos. Lo que importa es cuáles posiciones comparten variable, no qué número le tocó a cada una." },
        { valor: "Dos <code>?</code> escritos en el mismo <code>proc</code> arrancan como",
          opciones: ["dos variables distintas, y la unificación decide",
                     "la misma variable, por estar en el mismo <code>proc</code>",
                     "una variable y una copia suya, que se mueven juntas"],
          correcta: 0,
          razon: "expand-optional-type-expression llama a fresh-tvar una vez por hueco, sin mirar los demás. Que acaben siendo el mismo tipo o tipos distintos lo deciden las ecuaciones que salen del cuerpo." }
      ],
      cierre: "Una variable de tipo es una incógnita con número propio y un contenedor que se llena una sola vez."
    },
    {
      id: "misma-o-distinta",
      titulo: "2. La misma variable o variables distintas",
      definicion: APLICACION,
      explicacion:
        "La ecuación de la aplicación es la que obliga a compartir variables: el " +
        "tipo del operador tiene que ser el procedimiento que recibe exactamente " +
        "esos argumentos y entrega el resultado. Escoja el tipo de cada " +
        "programa, con <code>t1</code>, <code>t2</code> y <code>t3</code> por " +
        "las variables que queden libres.",
      items: [
        { valor: "El tipo de " + programa("proc (? x) x") + " es",
          opciones: ["<code>(int -&gt; int)</code>, porque <code>int</code> es el tipo por defecto de un hueco",
                     "<code>(t1 -&gt; t2)</code>, con el parámetro y el resultado sueltos",
                     "<code>(t1 -&gt; t1)</code>"],
          correcta: 2,
          razon: "El cuerpo entrega el parámetro, de modo que el tipo del resultado y el del parámetro son el mismo, y ninguna ecuación dice cuál. Esta es la identidad: tipa para cualquier t1." },
        { valor: "El tipo de " + programa("proc (? x, ? y) x") + " es",
          opciones: ["<code>(t1 * t2 -&gt; t1)</code>",
                     "<code>(t1 * t1 -&gt; t1)</code>, porque los dos huecos quedan sin resolver",
                     "<code>(t1 * t2 -&gt; t3)</code>, con las tres variables sueltas"],
          correcta: 0,
          razon: "El cuerpo ata el resultado al primer parámetro y nunca menciona al segundo, así que y se queda con su propia variable. Dos huecos sin resolver no son el mismo tipo: son dos incógnitas que nadie igualó." },
        { valor: "El tipo de " + programa("proc (? x, ? y) if zero?(x) then y else y") + " es",
          opciones: ["<code>(int * t1 -&gt; int)</code>, porque <code>zero?</code> fija los dos parámetros",
                     "<code>(int * t1 -&gt; t1)</code>",
                     "<code>(bool * t1 -&gt; t1)</code>, porque la prueba del <code>if</code> es <code>bool</code>"],
          correcta: 1,
          razon: "zero? pide int y solo alcanza a x. Las dos ramas son y, de modo que coinciden sin que nadie tenga que decidir su tipo, y el resultado es esa misma variable. La prueba aporta bool al if, no al parámetro." },
        { valor: "El tipo de " + programa("proc (? f) (f 1)") + " es",
          opciones: ["<code>((int -&gt; int) -&gt; int)</code>, porque el argumento es un entero",
                     "<code>(t1 -&gt; t2)</code>, porque de <code>f</code> solo se sabe que se aplica",
                     "<code>((int -&gt; t1) -&gt; t1)</code>"],
          correcta: 2,
          razon: "La aplicación pide que f sea un procedimiento de un argumento, y el argumento es 1, así que su parámetro es int. De su resultado no se sabe nada, y ese mismo resultado es el del cuerpo: una variable libre que aparece dos veces." },
        { valor: "El tipo de " + programa("proc (? f, ? x) (f x)") + " es",
          opciones: ["<code>((t1 -&gt; t2) * t3 -&gt; t2)</code>, con el argumento aparte",
                     "<code>((t1 -&gt; t2) * t1 -&gt; t2)</code>",
                     "<code>((t1 -&gt; t2) * t1 -&gt; t1)</code>, porque el resultado sale del argumento"],
          correcta: 1,
          razon: "Aquí están las dos cosas a la vez. El parámetro de f y el tipo de x tienen que ser la misma variable, porque x es justamente lo que se le pasa; y el resultado de la aplicación es otra, que ninguna ecuación ata a la primera." },
        { valor: "El tipo de " + programa("proc (? x, ? y) (x y)") + " es",
          opciones: ["<code>((t1 -&gt; t2) * t1 -&gt; t2)</code>",
                     "<code>(t1 * t2 -&gt; t3)</code>, porque los nombres no dicen que <code>x</code> sea un procedimiento",
                     "<code>((t1 -&gt; t2) * t2 -&gt; t1)</code>, invirtiendo el orden de los parámetros"],
          correcta: 0,
          razon: "El mismo tipo del programa anterior: lo que decide es la posición en la aplicación, no cómo se llame cada parámetro. Quien está en la posición del operador es un procedimiento, se llame f o se llame x." },
        { valor: "El tipo de " + programa("proc (? f, ? x) (f (f x))") + " es",
          opciones: ["<code>((t1 -&gt; t2) * t1 -&gt; t2)</code>, igual que aplicarla una vez",
                     "<code>((t1 -&gt; t2) * t2 -&gt; t1)</code>, porque la salida vuelve a entrar",
                     "<code>((t1 -&gt; t1) * t1 -&gt; t1)</code>"],
          correcta: 2,
          razon: "La aplicación de adentro entrega lo que la de afuera recibe, así que el resultado de f y su parámetro quedan igualados: una sola variable para los dos. Por eso aplicar dos veces pide un procedimiento cuya entrada y salida son del mismo tipo." },
        { valor: "El tipo de " + programa("proc (? f) proc (? x) (f (f x))") + " es",
          opciones: ["<code>((t1 -&gt; t1) * t1 -&gt; t1)</code>, con los dos parámetros juntos",
                     "<code>((t1 -&gt; t1) -&gt; (t1 -&gt; t1))</code>",
                     "<code>((t1 -&gt; t2) -&gt; (t1 -&gt; t2))</code>, con entrada y salida sueltas"],
          correcta: 1,
          razon: "Mismo cuerpo que el anterior y mismas ecuaciones, pero los parámetros están en dos proc anidados: el de afuera recibe uno solo y entrega un procedimiento. Dos proc anidados y un proc de dos parámetros no tienen el mismo tipo." },
        { valor: "El tipo de " + programa("proc (? f, ? g) proc (? x) (f (g x))") + " es",
          opciones: ["<code>((t2 -&gt; t3) * (t1 -&gt; t2) -&gt; (t1 -&gt; t3))</code>",
                     "<code>((t1 -&gt; t2) * (t2 -&gt; t3) -&gt; (t1 -&gt; t3))</code>, en el orden en que se aplican",
                     "<code>((t1 -&gt; t1) * (t1 -&gt; t1) -&gt; (t1 -&gt; t1))</code>, porque se encadenan"],
          correcta: 0,
          razon: "g recibe x y entrega lo que f recibe, de modo que el resultado de g y el parámetro de f son la misma variable. f es el primer parámetro aunque se aplique de último, y el procedimiento que sale va del tipo de x al resultado de f." }
      ],
      cierre: "Dos posiciones llevan la misma variable cuando una ecuación las iguala, y la ecuación la pone la aplicación, no el nombre del parámetro."
    },
    {
      id: "una-sola-vez",
      titulo: "3. Una variable, un tipo",
      definicion: null,
      explicacion:
        "El contenedor se llena una sola vez, de modo que dos usos del mismo " +
        "procedimiento no pueden pedirle tipos distintos. Responda sobre tres " +
        "programas que se diferencian en eso.",
      items: [
        { valor: "El tipo de " + programa("let f = proc (? x) x in f") + " es",
          opciones: ["<code>int</code>, el tipo que el interpretador escoge al no haber usos",
                     "ninguno: sin un uso que lo fije, el hueco queda sin resolver",
                     "<code>(t1 -&gt; t1)</code>"],
          correcta: 2,
          razon: "El programa tipa y su tipo se lleva la variable adentro: nada obliga a que x sea de un tipo concreto, así que la incógnita queda en el resultado. El interpretador la imprime con su número serial, que cambia de una corrida a otra." },
        { valor: "El tipo de " + programa("let f = proc (? x) x in let y = (f 5) in f") + " es",
          opciones: ["<code>(t1 -&gt; t1)</code>, porque la llamada de en medio no cambia a <code>f</code>",
                     "<code>(int -&gt; int)</code>",
                     "<code>int</code>, el tipo de la llamada <code>(f 5)</code>"],
          correcta: 1,
          razon: "La llamada agrega la ecuación que llena la variable con int, y una vez llena ya no cambia. El tipo del programa es el de su cuerpo, que es f y no la llamada." },
        { valor: "Con " + programa("let f = proc (? x) x in let y = (f 5) in let z = (f true) in f") + ", el interpretador",
          opciones: ["falla: la variable ya quedó en <code>int</code> y la segunda llamada pide <code>bool</code>",
                     "deduce <code>(int -&gt; int)</code> y descarta la llamada con <code>true</code>",
                     "deduce dos tipos para <code>f</code>, uno por cada llamada"],
          correcta: 0,
          razon: "Aborta con Type mismatch: int doesn't match bool. La identidad serviría para los dos usos, y el sistema no lo admite: cada ligadura de let tiene un tipo y uno solo. Es lo que se llama no tener let-polimorfismo." }
      ],
      cierre: "Un procedimiento con hueco no se adapta a cada uso: el primero que lo restringe lo deja fijo."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
