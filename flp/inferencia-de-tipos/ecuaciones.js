/* Reglas de generación de ecuaciones de INFERRED (EOPL §7.4). Cada sistema y
   cada tipo de esta página se midieron con type-of-program sobre
   interpretadores/Interpretes/Corte 2/4 InferenciaTipos, instrumentando
   check-equal-type! para registrar las ecuaciones que cada programa escribe. */
var BLOQUES = (function () {
  "use strict";

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function cod(s) { return "<code>" + esc(s) + "</code>"; }
  function prog(s) { return '<code class="programa">' + esc(s) + "</code>"; }

  var P1 =
    "proc (? x) add1(x)\n\n" +
    "t1   el ? de x\n" +
    "t2   la variable fresca del resultado de add1(x)";

  var P2 =
    "proc (? x) if x then 1 else 2\n\n" +
    "t1   el ? de x";

  var P3 =
    "proc (? f, ? x) (f x)\n\n" +
    "t1   el ? de f\n" +
    "t2   el ? de x\n" +
    "t3   la variable fresca del resultado de (f x)";

  var P4 =
    "proc (? f, ? x) if zero?(x) then (f x) else add1(x)\n\n" +
    "t1   el ? de f\n" +
    "t2   el ? de x\n" +
    "t3   la variable fresca del resultado de zero?(x)\n" +
    "t4   la variable fresca del resultado de add1(x)\n" +
    "t5   la variable fresca del resultado de (f x)";

  return [
    {
      id: "ecuaciones-una",
      titulo: "1. Una primitiva, una ecuación",
      definicion: esc(P1),
      explicacion:
        "El programa más corto que aporta algo al sistema: un parámetro sin " +
        "anotar y una primitiva aplicada a él. Una sola aplicación, una sola " +
        "ecuación.",
      items: [
        { valor: "La ecuación que escribe la regla de la aplicación al tipar " + cod("add1(x)"),
          opciones: [cod("(int -> int) = (t1 -> t2)"),
                     cod("(int -> int) = (t1 -> int)") + ", con int en el resultado",
                     cod("t1 = (int -> int)")],
          correcta: 0,
          razon: "La regla compara el tipo del operador contra un tipo de procedimiento armado con los tipos de los operandos y una variable fresca para el resultado. El operador es add1, de tipo (int -> int); el operando es x, de tipo t1; y t2 es la fresca. Poner int donde va t2 se salta el paso: la regla siempre emite la variable fresca y deja que la unificación la llene. Y t1 es el tipo de x, no el de add1." },
        { valor: "Esa ecuación, descompuesta componente a componente, da",
          opciones: ["solo " + cod("t1 = int") + "; el resultado de la aplicación no entra al sistema",
                     cod("t1 = int") + " junto con " + cod("t2 = (int -> int)"),
                     cod("t1 = int") + " junto con " + cod("t2 = int")],
          correcta: 2,
          razon: "Dos tipos de procedimiento se unifican por partes: primero los argumentos, int contra t1, y después los resultados, int contra t2. Las dos partes entran. Sin la segunda, t2 se quedaría vacía y el tipo del procedimiento tendría un hueco. Y lo que t2 recibe es int, el tipo del resultado de add1, no el tipo completo de add1." },
        { valor: "El tipo que resulta para " + prog("proc (? x) add1(x)"),
          opciones: [cod("(t1 -> t2)") + ", que es lo que la regla del proc arma",
                     cod("(int -> int)"),
                     cod("int") + ", el tipo del cuerpo"],
          correcta: 1,
          razon: "La regla del proc arma (t1 -> t2) con la variable del parámetro y el tipo del cuerpo, y la unificación ya llenó las dos. Al imprimir, type-to-external-form sigue el contenido de cada variable llena, así que sale (int -> int). El tipo del cuerpo es solo la mitad: lo que se está tipando es un procedimiento." },
        { valor: "Con " + prog("proc (? x) zero?(x)") + ", la ecuación y el tipo son",
          opciones: [cod("(int -> bool) = (t1 -> t2)") + ", y el tipo " + cod("(bool -> bool)"),
                     cod("(bool -> bool) = (t1 -> t2)") + ", y el tipo " + cod("(bool -> bool)"),
                     cod("(int -> bool) = (t1 -> t2)") + ", y el tipo " + cod("(int -> bool)")],
          correcta: 2,
          razon: "zero? es la única primitiva unaria que devuelve booleano, y su tipo es (int -> bool): t1 recibe int y t2 recibe bool. El procedimiento recibe el entero que zero? exige y devuelve el booleano que zero? produce. Cambiar de lado los dos tipos de la flecha es el error frecuente aquí." },
        { valor: "Con " + prog("proc (? x, ? y) +(x, y)") + ", la ecuación es",
          opciones: [cod("(int * int -> int) = (t1 * t2 -> t3)"),
                     cod("(int * int -> int) = (t1 -> t2)") + ", con los dos parámetros en una flecha",
                     "dos ecuaciones, " + cod("t1 = int") + " y " + cod("t2 = int") + ", una por argumento"],
          correcta: 0,
          razon: "La regla escribe una sola ecuación por aplicación, con todos los operandos a la izquierda de la flecha y la variable fresca a la derecha. Los operandos son x y y, de tipos t1 y t2, y t3 es la fresca. Las igualdades t1 = int, t2 = int y t3 = int salen después, al descomponer los dos tipos de procedimiento, y no son lo que la regla escribe." }
      ],
      cierre: "En un programa sin if, el sistema es una ecuación por aplicación, y cada una se descompone en tantas igualdades como partes tenga el tipo del operador."
    },
    {
      id: "ecuaciones-if",
      titulo: "2. El condicional y sus dos ecuaciones",
      definicion: esc(P2),
      explicacion:
        "Aquí no hay ninguna aplicación: todas las ecuaciones vienen de la " +
        "regla del " + cod("if") + ", que es la otra que escribe ecuaciones.",
      items: [
        { valor: "Cuántas ecuaciones escribe este programa",
          opciones: ["una, la del if",
                     "dos, las dos del if",
                     "tres: una por la prueba y una por cada rama"],
          correcta: 1,
          razon: "La regla del if escribe dos y el programa no tiene aplicaciones, así que no hay más. Una compara la prueba contra bool; la otra compara las dos ramas entre sí. Las ramas aportan una ecuación entre las dos, no una cada una: lo que se mide es el tipo de la del then contra el de la del else." },
        { valor: "La ecuación que viene de la prueba es",
          opciones: [cod("t1 = int") + ", la prueba contra el tipo de las ramas",
                     cod("t1 = t1") + ", porque la prueba es la variable misma",
                     cod("t1 = bool")],
          correcta: 2,
          razon: "La prueba es x, de tipo t1, y la regla la compara contra bool-type. Esa comparación es la que fija t1. Sin ella el if de Racket decidiría la rama con cualquier valor que llegara y el error saldría al correr. Las ramas no participan en esta ecuación: entran en la otra." },
        { valor: "La ecuación que viene de las ramas es",
          opciones: [cod("int = int"),
                     cod("t1 = int") + ", la prueba contra el tipo de las ramas",
                     "ninguna: las dos ramas ya son del mismo tipo y no hace falta compararlas"],
          correcta: 0,
          razon: "Las ramas son 1 y 2, las dos de tipo int, así que la ecuación es int = int. Se escribe igual: la regla compara los dos tipos sin mirar si coinciden de antemano, y el unificador la resuelve de inmediato porque los dos lados son el mismo valor en Scheme. Una ecuación que se satisface sola sigue siendo parte del sistema." },
        { valor: "El tipo que resulta es",
          opciones: [cod("(int -> int)") + ", con int de las ramas en los dos lados",
                     cod("(bool -> int)"),
                     cod("(bool -> bool)") + ", con bool de la prueba en los dos lados"],
          correcta: 1,
          razon: "El parámetro recibe bool, que es lo que la primera ecuación impuso a t1, y el resultado es int, el tipo de las ramas, que es el que la regla del if devuelve. Las dos mitades del tipo vienen de ecuaciones distintas, y de ahí que aparezcan los dos tipos atómicos del lenguaje." }
      ],
      cierre: "El if aporta dos ecuaciones: una fija el tipo de la prueba y la otra iguala las ramas entre sí. El tipo que el if devuelve es el de las ramas, no el de la prueba."
    },
    {
      id: "ecuaciones-variables",
      titulo: "3. Una ecuación entre dos variables de tipo",
      definicion: esc(P3),
      explicacion:
        "Un programa donde ninguna primitiva aparece, así que ninguna ecuación " +
        "menciona " + cod("int") + " ni " + cod("bool") + ". Aquí se ve qué " +
        "hace una ecuación cuando los dos lados traen variables.",
      items: [
        { valor: "Cuando el interpretador tipa " + cod("(f x)") + ", la ecuación que escribe es",
          opciones: [cod("t1 = (int -> t3)") + ", porque un operando sin anotar se toma entero",
                     cod("t1 = t2") + ", el operador contra el operando",
                     cod("t1 = (t2 -> t3)")],
          correcta: 2,
          razon: "El operador es f, de tipo t1, y la regla lo compara contra un tipo de procedimiento armado con el tipo del operando y la variable fresca del resultado. Nada en el programa dice que x sea entero, y la regla no supone tipos: para eso está t2. El operador tampoco se compara con el operando, sino con un procedimiento que lo recibe." },
        { valor: "Esa ecuación dice de " + cod("f"),
          opciones: ["que es un procedimiento de un argumento, sin fijar de qué tipo",
                     "que es un procedimiento de un argumento entero que devuelve entero",
                     "que tiene el mismo tipo que x, porque la ecuación los relaciona"],
          correcta: 0,
          razon: "Liga t1 a un tipo de procedimiento cuyas dos partes siguen siendo variables. Es una ecuación entre variables, no entre una variable y un tipo concreto: fija la forma de t1 y deja abierto qué entra y qué sale. Leerla como t1 = (int -> int) es el error más común del tema, y pasa porque int es el tipo que aparece en casi todos los demás ejemplos." },
        { valor: "El tipo que resulta es",
          opciones: [cod("(t1 * t2 -> t3)") + ", con las tres variables sin resolver",
                     cod("((t2 -> t3) * t2 -> t3)"),
                     cod("(int * int -> int)") + ", el único tipo que cierra el sistema"],
          correcta: 1,
          razon: "La regla del proc arma (t1 * t2 -> t3), y la ecuación ya llenó t1 con (t2 -> t3), así que al imprimir sale ((t2 -> t3) * t2 -> t3). t2 y t3 siguen vacías y se imprimen con su número de variable, que cambia entre corridas. Un tipo con variables describe un procedimiento que sirve para cualquier f de un argumento." },
        { valor: "Que " + cod("t2") + " y " + cod("t3") + " queden sin resolver significa que",
          opciones: ["el programa tiene un error de tipo que la inferencia no alcanzó a detectar",
                     "faltó una ecuación que el interpretador debió escribir y no escribió",
                     "ninguna parte del programa las obliga a ser un tipo concreto"],
          correcta: 2,
          razon: "El cuerpo solo aplica f a x, y de ahí sale una ecuación que relaciona las tres variables sin tocar int ni bool. Sin ecuación que las fije, quedan libres. Un error de tipo es otra cosa: una ecuación sin solución, que aborta el chequeo. Este sistema tiene solución, y tiene muchas." }
      ],
      cierre: "Una ecuación puede relacionar dos variables de tipo entre sí sin fijar ninguna a int ni a bool. El tipo que resulta se imprime con las variables que quedaron libres."
    },
    {
      id: "ecuaciones-sistema",
      titulo: "4. El sistema completo",
      definicion: esc(P4),
      explicacion:
        "Tres aplicaciones y un condicional. El interpretador tipa la prueba, " +
        "después la rama del else y después la del then, así que una ecuación " +
        "puede llegar con un lado ya resuelto por otra anterior.",
      items: [
        { valor: "Cuántas ecuaciones escribe el programa completo",
          opciones: ["cinco: tres de las aplicaciones y dos del if",
                     "cuatro: una por cada aplicación y una del if",
                     "seis: tres de las aplicaciones, dos del if y una del proc"],
          correcta: 0,
          razon: "Las aplicaciones son zero?(x), (f x) y add1(x), y cada una escribe una ecuación; el if escribe dos. Son cinco. La regla del proc no escribe ninguna: arma el tipo con la variable del parámetro y el tipo del cuerpo, usando lo que las demás dejaron resuelto. Por eso el número de variables y el de ecuaciones no tienen por qué coincidir." },
        { valor: "La ecuación de " + cod("zero?(x)") + " es",
          opciones: [cod("(int -> bool) = (t2 -> bool)") + ", porque el if ya exige bool en la prueba",
                     cod("(int -> bool) = (t2 -> t3)"),
                     cod("(int -> bool) = (t1 -> t3)") + ", con la variable del parámetro aplicado"],
          correcta: 1,
          razon: "El operando es x, de tipo t2, y t3 es la variable fresca del resultado. Que el if vaya a exigir bool más adelante no cambia lo que esta regla escribe: cada regla emite su variable fresca y la unificación junta las restricciones después. t1 es la variable de f, que no aparece en esta aplicación." },
        { valor: "Cuando el interpretador llega a " + cod("(f x)") + ", la ecuación que muestra es",
          opciones: [cod("t1 = (t2 -> t5)") + ", con t2 todavía vacía en ese momento",
                     cod("t5 = (t2 -> t1)") + ", el resultado contra el procedimiento",
                     cod("t1 = (int -> t5)")],
          correcta: 2,
          razon: "La regla compara el tipo del operador contra (tipo del operando -> variable fresca), que de entrada es t1 = (t2 -> t5). Pero la ecuación de zero?(x) ya llenó t2 con int, y prune-type sigue el contenido de las variables llenas antes de comparar, así que lo que llega al unificador es t1 = (int -> t5). Las dos escrituras imponen lo mismo; cambia cuánto se había resuelto ya. Y el resultado nunca va del lado del operador." },
        { valor: "De las dos ecuaciones del " + cod("if") + ", la de la prueba es",
          opciones: [cod("bool = bool"),
                     cod("t3 = bool") + ", con t3 todavía vacía en ese momento",
                     cod("t2 = bool") + ", la variable del identificador de la prueba"],
          correcta: 0,
          razon: "La prueba es zero?(x), cuyo tipo es t3, y la regla la compara contra bool. La ecuación de zero?(x) ya había llenado t3 con bool, así que los dos lados llegan como bool y la ecuación se satisface sola. t2 es la variable de x, que vale int: la prueba no es x sino la aplicación que la envuelve." },
        { valor: "La otra ecuación del " + cod("if") + ", la de las ramas, es",
          opciones: [cod("t4 = t5") + ", con las dos variables de resultado todavía vacías",
                     cod("t5 = int"),
                     cod("t4 = int") + " y " + cod("t5 = int") + ", una por rama"],
          correcta: 1,
          razon: "La regla compara el tipo de la rama del then con el de la del else, que son t5 y t4. La ecuación de add1(x) ya había llenado t4 con int, así que la comparación llega como t5 = int. Es una sola ecuación entre las dos ramas, no una por rama. Y es la que resuelve t5, que hasta ese momento no tenía nada." },
        { valor: "Si se omitiera la ecuación de las ramas, el tipo quedaría",
          opciones: [cod("((int -> int) * int -> int)") + ", el mismo, porque t5 ya estaba resuelta",
                     "un error de tipo, porque el sistema quedaría sin solución",
                     cod("((int -> t5) * int -> t5)")],
          correcta: 2,
          razon: "t5 es el resultado de (f x) y también el que el if devuelve, así que aparece en dos lugares del tipo del procedimiento. Sin la ecuación de las ramas nada la llena y las dos salen impresas como variable. Se comprueba corriendo proc (? f, ? x) if zero?(x) then (f x) else (f x), donde las dos ramas son la misma aplicación y la ecuación de las ramas no aporta nada: su tipo es exactamente ese. Olvidar la ecuación que conecta el resultado con el tipo buscado es lo que deja estos huecos." },
        { valor: "El tipo que resulta del sistema completo es",
          opciones: [cod("((int -> int) * int -> int)"),
                     cod("((int -> bool) * int -> int)") + ", con bool del resultado de la prueba",
                     cod("((int -> int) * int -> bool)") + ", con bool de la rama que lo produce"],
          correcta: 0,
          razon: "t1 queda en (int -> int): x fuerza int en el argumento y la ecuación de las ramas fuerza int en el resultado de (f x). t2 queda en int, y el if devuelve int. El bool del programa está en el tipo de zero?, que es lo que el if consume, y no sobrevive en el tipo del procedimiento." }
      ],
      cierre: "Tres aplicaciones y un if dan cinco ecuaciones. El orden en que se recogen cambia cómo se ve cada una, porque llega con los lados que las anteriores ya resolvieron, pero el conjunto y su solución son los mismos."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
