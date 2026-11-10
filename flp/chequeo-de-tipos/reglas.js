/* Las reglas de tipamiento de CHECKED (EOPL §7.1, Figura 7.4) y lo que el
   chequeador alcanza a decidir antes de correr el programa. Cada veredicto y
   cada valor de esta página se midieron con type-of-program y eval-program
   sobre interpretadores/Interpretes/Corte 2/3 ChequeoTipos. */
var BLOQUES = (function () {
  "use strict";

  function programa(texto) { return '<code class="programa">' + texto + "</code>"; }

  var REGLAS =
    "(if-exp (test-exp true-exp false-exp)\n" +
    "        (let ((test-type  (type-of-expression test-exp  tenv))\n" +
    "              (false-type (type-of-expression false-exp tenv))\n" +
    "              (true-type  (type-of-expression true-exp  tenv)))\n" +
    "          (check-equal-type! test-type bool-type test-exp)\n" +
    "          (check-equal-type! true-type false-type exp)\n" +
    "          true-type))";

  var APP =
    "(app-exp (rator rands)\n" +
    "         (type-of-application\n" +
    "          (type-of-expression rator tenv)\n" +
    "          (types-of-expressions rands tenv)\n" +
    "          rator rands exp))";

  return [
    {
      id: "reglas-exige",
      titulo: "1. Lo que exige cada regla",
      definicion: REGLAS,
      explicacion:
        "La cláusula del <code>if</code> calcula los tres tipos y después hace " +
        "dos comparaciones: la prueba contra <code>bool</code> y las ramas " +
        "entre sí. Responda sobre ella y sobre las demás formas.",
      items: [
        { valor: "La regla del <code>if</code> exige",
          opciones: ["que la prueba tenga tipo bool y que las dos ramas sean de tipo int",
                     "que la prueba tenga tipo bool y que las dos ramas coincidan entre sí",
                     "que la prueba tenga tipo bool y que las ramas coincidan con ella"],
          correcta: 1,
          razon: "Son dos comparaciones distintas. La primera mide el tipo de la prueba contra bool; la segunda mide las dos ramas una contra otra, y acepta cualquier tipo mientras sea el mismo en las dos: int, bool o un tipo de procedimiento." },
        { valor: "El tipo que devuelve la regla del <code>if</code> es",
          opciones: ["el de las ramas, que la regla ya comprobó iguales",
                     "bool, como el de la prueba que la regla comprueba",
                     "un tipo que combina los de las dos ramas"],
          correcta: 0,
          razon: "La prueba solo sirve para la primera comparación y no aporta el tipo del resultado. El chequeador devuelve el tipo de la rama del then, que vale para las dos porque la segunda comparación ya las igualó. Tipos combinados no existen aquí: solo int, bool y los de procedimiento." },
        { valor: "En " + programa("let x = 3 in add1(x)") + ", el cuerpo se chequea",
          opciones: ["en el ambiente de tipos de afuera, sin x ligada",
                     "con x ligada al valor 3, que el let ya evaluó",
                     "en el ambiente de tipos extendido con x : int"],
          correcta: 2,
          razon: "type-of-let-exp calcula el tipo de la ligadura, agrega un eslabón con extend-tenv y chequea el cuerpo ahí. Del 3 solo queda el tipo: el chequeador no evalúa nada, así que nunca sabe que x vale 3." },
        { valor: "La regla de la aplicación comprueba",
          opciones: ["que el operador sea un tipo de procedimiento y que cada argumento case, sin contar cuántos llegan",
                     "que el operador sea un tipo de procedimiento, que la cantidad de argumentos coincida y que cada tipo case",
                     "que la cantidad coincida y que cada tipo case, dando por procedimiento lo que esté en la posición del operador"],
          correcta: 1,
          razon: "Las tres cosas, y en ese orden, dentro de type-of-application. Quien no cuenta los argumentos es el evaluador: con (proc (int x) add1(x) 5 6) liga x a 5, descarta el 6 y entrega 6, mientras el chequeador aborta con Wrong number of arguments." },
        { valor: "En " + programa("letrec int fact(int n) = … in …") + ", al chequear el cuerpo de <code>fact</code> el ambiente de tipos ya tiene",
          opciones: ["fact : (int -&gt; int) y también n : int",
                     "solo n : int, porque fact todavía no se chequeó",
                     "fact : int y n : int, tomando el int anotado"],
          correcta: 0,
          razon: "La anotación da el tipo de fact antes de mirar su cuerpo: type-of-letrec-exp arma (int -> int) con los tipos de los parámetros y el del resultado, y lo liga en el ambiente. Por eso letrec int f(int n) = (f n) in 1 pasa el chequeo y da int." }
      ]
    },
    {
      id: "reglas-falla",
      titulo: "2. Qué regla falla",
      definicion: APP,
      explicacion:
        "Cada programa de abajo lo rechaza el chequeador, y van del más corto " +
        "al más largo. Diga qué comparación de qué regla aborta.",
      items: [
        { valor: programa("x") + " como programa completo",
          opciones: ["la regla de la variable, que exige anotar el tipo de cada x",
                     "la regla de la variable, que solo acepta los nombres x, y, z del ambiente inicial",
                     "la regla de la variable, que busca x en el ambiente de tipos"],
          correcta: 2,
          razon: "apply-tenv llega al ambiente vacío y aborta con Unbound variable x. El ambiente inicial de este interpretador no liga nada, y una variable de let o de proc no lleva anotación: let x = 3 in x pasa el chequeo y da int." },
        { valor: programa("sub1(zero?(0))"),
          opciones: ["la regla de la primitiva: sub1 pide int y recibe un bool",
                     "la regla de la primitiva: zero? pide bool y recibe un int",
                     "la regla de la aplicación: sub1 no es un tipo de procedimiento"],
          correcta: 0,
          razon: "zero? va de int a bool, así que su aplicación entrega bool. A sub1 el chequeador le da el tipo (int -> int) y trata la expresión como una aplicación cualquiera: compara bool con int y aborta." },
        { valor: programa("if 1 then 2 else 3"),
          opciones: ["la comparación de las dos ramas, que exige bool en ambas",
                     "la comparación de la prueba con bool, que ve un int",
                     "la comparación de la prueba con las ramas, int contra int"],
          correcta: 1,
          razon: "La cláusula calcula los tres tipos y después compara. La primera comparación mide int contra bool y aborta ahí; las ramas, que son int las dos, nunca llegan a compararse." },
        { valor: programa("if zero?(0) then 1 else true"),
          opciones: ["la comparación de la prueba con bool: zero?(0) entrega int",
                     "la regla de true, que este lenguaje no reconoce como literal",
                     "la comparación de las dos ramas: una es int y la otra bool"],
          correcta: 2,
          razon: "zero?(0) sí es bool, así que la prueba pasa. true también tiene tipo, bool, porque la gramática lo trae como expresión propia. Lo que no cuadra son las ramas: int contra bool." },
        { valor: programa("(5 3)"),
          opciones: ["la de la aplicación, que pide un tipo de procedimiento en el operador",
                     "la de la aplicación, que cuenta los argumentos y encuentra uno de más",
                     "la del literal, que no le asigna tipo a un número en esa posición"],
          correcta: 0,
          razon: "type-of-application mira primero el tipo del operador. El 5 tiene tipo int, que no es un tipo de procedimiento, y el mensaje es Rator not a proc type. Nunca llega a contar argumentos." },
        { valor: programa("(proc (int x) add1(x) 5 6)"),
          opciones: ["la de la aplicación, al comparar el tipo del 6 con el de x, que es int",
                     "la de la aplicación, al contar un parámetro declarado y dos argumentos",
                     "la de la aplicación, al ver que add1(x) devuelve int y no un proc"],
          correcta: 1,
          razon: "El operador sí es un tipo de procedimiento, (int -> int). La aridad no cuadra y el chequeador aborta con Wrong number of arguments, expected (int), got (int int). La comparación de cada argumento ni se intenta." },
        { valor: programa("letrec int mal(int n) = true in (mal 1)"),
          opciones: ["la del letrec, al comparar el argumento 1 con el int de n",
                     "la de la aplicación, al ver que mal devuelve bool y se pide int",
                     "la del letrec, al comparar el cuerpo de mal con el int anotado"],
          correcta: 2,
          razon: "El ambiente de tipos recibe mal : (int -> int) desde la anotación, así que (mal 1) cuadra y el argumento también. Lo que falla es el cuerpo: true tiene tipo bool y la anotación prometió int." }
      ]
    },
    {
      id: "reglas-conservador",
      titulo: "3. Lo que rechaza sin que fuera a fallar",
      explicacion:
        "El chequeador decide antes de correr, y para eso tiene que suponer " +
        "lo peor de cada rama. Diga qué haría la máquina con cada programa " +
        "rechazado si lo dejaran correr.",
      items: [
        { valor: programa("and(1, true)") + " corriendo da",
          opciones: ["#t, el segundo operando, porque el 1 no es #f",
                     "1, el primer operando, que es el que no es booleano",
                     "un error, porque la primitiva compara los dos tipos"],
          correcta: 0,
          razon: "apply-primitive despacha and-prim sobre los valores ya evaluados y no mira tipos. El and de Racket devuelve el último operando cuando ninguno es #f, y aquí ese último es #t. El chequeador, en cambio, le exige dos bool y aborta." },
        { valor: programa("if zero?(0) then 1 else true") + " corriendo da",
          opciones: ["#t, porque las dos ramas se evalúan y queda la última",
                     "1, porque la prueba da #t y la rama del else no se evalúa",
                     "un error, porque el evaluador también compara los tipos de las ramas"],
          correcta: 1,
          razon: "eval-expression evalúa la prueba, comprueba que sea booleana y de ahí sigue por una sola rama. El else con el true queda sin tocar, de modo que el programa entrega 1 aunque el chequeador lo haya rechazado." },
        { valor: programa("(proc (int x) add1(x) 5 6)") + " corriendo da",
          opciones: ["7, porque el evaluador suma 1 al último argumento",
                     "un error, porque el evaluador también cuenta los argumentos",
                     "6, porque x queda ligada a 5 y el 6 se descarta"],
          correcta: 2,
          razon: "extend-env guarda los dos valores, pero apply-env busca x por posición y encuentra el 5, que es el primero. add1(5) da 6. El argumento que sobraba no se usa, y que esto corra es lo que el chequeo estático atrapa antes." },
        { valor: programa("if zero?(1) then proc (int x) x else 5") + " corriendo da",
          opciones: ["5, porque zero?(1) da #f y la rama que corre es el else",
                     "una clausura, porque el evaluador prefiere la rama del then",
                     "un error, porque las dos ramas no tienen el mismo tipo"],
          correcta: 0,
          razon: "zero?(1) es #f y el evaluador entra al else. El chequeador rechaza el programa porque una rama tiene tipo (int -> int) y la otra int, pero esa diferencia nunca molesta a la máquina: solo una de las dos se evalúa." },
        { valor: "De los cuatro casos anteriores se sigue que el chequeador",
          opciones: ["acepta todo programa que no fallaría al correr",
                     "rechaza programas que no habrían fallado al correr",
                     "decide exactamente cuáles programas fallan al correr"],
          correcta: 1,
          razon: "Es conservador. Para garantizar que ningún programa aceptado falle por tipos, rechaza algunos que habrían corrido: los cuatro de arriba entregan un valor. Decidir exactamente cuáles fallan no se puede." }
      ]
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
