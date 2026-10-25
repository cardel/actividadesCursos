/* Las producciones de set y begin, trabajadas en los dos sentidos: de la
   gramática a los programas que genera, del programa a los campos de las
   variantes, del árbol que no se genera a lo que habría que cambiar, y de la
   sintaxis a los valores expresados y denotados. */
var BLOQUES = (function () {
  "use strict";

  function programa(texto) { return '<code class="programa">' + texto + "</code>"; }

  var PRODUCCIONES =
    "&lt;expresion&gt; ::= set &lt;identificador&gt; = &lt;expresion&gt;\n" +
    "                set-exp (id exp)\n" +
    "&lt;expresion&gt; ::= begin &lt;expresion&gt; { ; &lt;expresion&gt; }* end\n" +
    "                begin-exp (exp lexp)";

  return [
    {
      id: "gramatica-set-begin-genera",
      titulo: "1. De la gramática a los programas",
      definicion: PRODUCCIONES,
      explicacion:
        "Las dos producciones nuevas (EOPL §4.3). El lado izquierdo de " +
        "<code>set</code> es un identificador y el derecho es cualquier " +
        "expresión; en <code>begin</code>, la primera expresión va fuera de " +
        "la estrella y cada una de las siguientes va precedida de su punto y " +
        "coma. Para cada programa, diga si la gramática lo genera.",
      opciones: ["Sí lo genera", "No lo genera"],
      items: [
        { valor: programa("begin set x = set y = 7; +(x, y) end"),
          correcta: 0,
          razon: "Lo genera: el lado derecho de set es una expresión, y set y = 7 es una expresión. Vale 8 en el intérprete de asignación, porque x recibe el valor del set de adentro, que es 1, e y queda en 7." },
        { valor: programa("begin x; end"),
          correcta: 1,
          razon: "No lo genera: cada punto y coma va seguido de una expresión, y end no lo es. El parser se detiene con “nonterminal <expresion> can't begin with ... end”. El punto y coma separa expresiones; no las termina." },
        { valor: programa("set add1 = 3"),
          correcta: 1,
          razon: "No lo genera, aunque add1 parezca un nombre. add1 es una cadena literal de la gramática, la de la primitiva, y el analizador léxico nunca lo entrega como identificador. El parser responde “looking for identificador, found ... add1”." },
        { valor: programa("(set y = 0)"),
          correcta: 0,
          razon: "Lo genera: es una aplicación cuyo operador es la expresión set y = 0, sin operandos. Se detiene al evaluar, con “El operador no evaluó a un procedimiento: 1”, porque set vale 1. La gramática no sabe qué expresiones valen procedimientos." },
        { valor: programa("set x = 5; x"),
          correcta: 1,
          razon: "No lo genera: el punto y coma solo existe dentro de un begin. El parser lee set x = 5 completo, encuentra el punto y coma sobrante y responde “symbols left over”. Para secuenciar hay que escribir begin set x = 5; x end." },
        { valor: programa("let set = 3 in add1(set)"),
          correcta: 1,
          razon: "No lo genera: set es una palabra de la gramática, igual que let o begin, y no puede usarse como nombre de variable. El parser no encuentra un identificador después de let." }
      ],
      cierre:
        "Las sorpresas van en las dos direcciones. Programas raros como " +
        "set x = set y = 7 o (set y = 0) se generan, porque la gramática solo " +
        "mira la forma; y nombres que parecen identificadores, como add1 o " +
        "set, no lo son, porque la gramática los reservó."
    },
    {
      id: "gramatica-set-begin-campos",
      titulo: "2. Del programa a los campos de las variantes",
      definicion:
        "begin set y = *(y, 3); y; add1(y) end\n\n" +
        "begin-exp (exp lexp)\n" +
        "set-exp   (id exp)",
      explicacion:
        "La primera expresión del <code>begin</code> va a un campo propio y " +
        "las que repite la estrella llegan juntas en otro, como lista. Para " +
        "el programa de arriba, que vale 7 en el intérprete de asignación, " +
        "diga qué tiene cada campo.",
      items: [
        { valor: "<code>exp</code> de <code>begin-exp</code>",
          opciones: ["la lista con los tres árboles",
                     "el árbol de <code>set y = *(y, 3)</code>",
                     "el árbol de <code>add1(y)</code>, el último"],
          correcta: 1,
          razon: "La primera expresión, que en la producción está fuera de la estrella. El árbol es (set-exp y (prim-exp (mult-prim) ((var-exp y) (lit-exp 3))))." },
        { valor: "<code>lexp</code> de <code>begin-exp</code>",
          opciones: ["el árbol de <code>add1(y)</code>",
                     "la lista con los tres árboles",
                     "la lista con los árboles de <code>y</code> y de <code>add1(y)</code>"],
          correcta: 2,
          razon: "Una lista con las expresiones que siguen a cada punto y coma: ((var-exp y) (prim-exp (add-prim) ((var-exp y)))). Los puntos y comas no llegan al árbol." },
        { valor: "<code>id</code> de <code>set-exp</code>",
          opciones: ["el símbolo <code>y</code>",
                     "el árbol <code>(var-exp y)</code>",
                     "la referencia de y en el ambiente"],
          correcta: 0,
          razon: "El símbolo y, sin envoltura. No es un var-exp porque el lado izquierdo de set no es una expresión: nunca se evalúa para sacarle un valor. Tampoco es una referencia, porque el árbol se arma antes de que exista un ambiente." },
        { valor: "<code>exp</code> de <code>set-exp</code>",
          opciones: ["el número 6",
                     "el número 1, lo que devuelve set",
                     "el árbol de <code>*(y, 3)</code>, sin evaluar"],
          correcta: 2,
          razon: "Un árbol: (prim-exp (mult-prim) ((var-exp y) (lit-exp 3))). El 6 aparece al evaluarlo con y en 2, y el 1 es lo que devuelve la cláusula del evaluador. Ninguno de los dos está en el árbol." },
        { valor: "<code>lexp</code> en el árbol de <code>begin 9 end</code>",
          opciones: ["la lista con el árbol de 9", "la lista vacía", "no hay campo lexp"],
          correcta: 1,
          razon: "La estrella repitió cero veces, así que lexp llega como (): el árbol es (begin-exp (lit-exp 9) ()). El campo siempre está; lo que varía es el largo de la lista. El programa vale 9." },
        { valor: "<code>exp</code> del set de afuera en <code>set x = set y = 7</code>",
          opciones: ["otro <code>set-exp</code>, el de y", "el árbol de 7", "el símbolo y"],
          correcta: 0,
          razon: "El árbol es (set-exp x (set-exp y (lit-exp 7))): un set-exp dentro del campo exp de otro. Al evaluar, el de adentro escribe 7 en y y devuelve 1, y ese 1 es lo que el de afuera escribe en x." }
      ],
      cierre:
        "begin-exp reparte su secuencia en dos campos porque la producción " +
        "pide al menos una expresión: la primera va sola y las demás van " +
        "en una lista que puede quedar vacía. set-exp tiene un símbolo y un " +
        "árbol, y esa asimetría dice que de un lado hay un nombre y del otro " +
        "una expresión."
    },
    {
      id: "gramatica-set-begin-falta",
      titulo: "3. Del árbol que no se genera a lo que falta",
      explicacion:
        "Cada renglón describe algo que se quisiera escribir. Diga qué " +
        "habría que cambiar para admitirlo, o si ya se admite.",
      items: [
        { valor: "Intercambiar dos variables en una sola asignación: <code>set x, y = y, x</code>",
          opciones: ["nada: <code>begin set x = y; set y = x end</code> hace lo mismo",
                     "una producción con dos listas separadas por comas y una variante con dos campos lista",
                     "permitir una coma después de set"],
          correcta: 1,
          razon: "Haría falta algo como set {identificador}*(,) = {expresion}*(,), con una variante de campos (ids exps), y una cláusula que evalúe todas las partes derechas antes de escribir. Dos set seguidos no intercambian: begin set x = y; set y = x; +(*(x, 10), y) end vale 22 en el intérprete de asignación, porque las dos quedan en 2. El intercambio, hecho con una variable auxiliar, da 24." },
        { valor: "Un begin sin end: <code>begin set x = 1; x</code>",
          opciones: ["quitar el terminal end; la variante begin-exp queda igual",
                     "una variante nueva en el datatype",
                     "nada: ya se genera"],
          correcta: 0,
          razon: "El end no llega al árbol, así que begin-exp (exp lexp) no cambia; cambia la producción. El costo es que la gramática pierde su marca de cierre: en begin 1; begin 2; 3 no se sabría de cuál begin es el 3. Con la producción actual, el programa se rechaza porque el parser llega al final sin encontrar end." },
        { valor: "Un set cuyo lado izquierdo no es un identificador: <code>set (f 1) = 3</code>",
          opciones: ["solo cambiar identificador por expresion en la producción",
                     "nada: ya se genera",
                     "cambiar identificador por expresion en la producción, y además darle al evaluador una celda para (f 1), que no tiene"],
          correcta: 2,
          razon: "Con expresion en la producción el árbol se armaría, pero la cláusula set-exp necesita una referencia para pasársela a setref!, y la única forma de conseguirla es apply-env con un nombre. (f 1) produce un valor expresado, no una referencia. Con la producción actual, el parser lo rechaza con “looking for identificador, found ... (”." },
        { valor: "Un begin con una sola expresión: <code>begin 4 end</code>",
          opciones: ["una producción aparte para un solo elemento",
                     "nada: ya se genera",
                     "quitar la estrella"],
          correcta: 1,
          razon: "La estrella admite cero repeticiones, así que una sola expresión ya está cubierta y lexp llega vacía. Vale 4." },
        { valor: "Rechazar la asignación a una variable que no está ligada: <code>set w = 1</code>",
          opciones: ["una producción que solo acepte variables declaradas",
                     "cambiar identificador por expresion",
                     "nada en la gramática: ya se genera, y lo rechaza el evaluador"],
          correcta: 2,
          razon: "La gramática no sabe qué nombres están ligados: solo ve un identificador. El programa se parsea y se detiene al evaluar, cuando apply-env llega al ambiente vacío: “No se encuentra la variable w”." },
        { valor: "Que set devuelva el valor asignado en vez de 1",
          opciones: ["cambiar la cláusula set-exp del evaluador; la producción y la variante quedan igual",
                     "agregar un campo a set-exp",
                     "cambiar la producción"],
          correcta: 0,
          razon: "El 1 no está en la gramática ni en el árbol: lo pone la cláusula del evaluador, después de setref!. Cambiarlo es asunto de la semántica, y entonces set x = set y = 7 dejaría a x en 7 en vez de 1." }
      ],
      cierre:
        "Tres preguntas distintas se mezclan aquí: qué acepta la producción, " +
        "qué guarda la variante y qué hace la cláusula del evaluador. El end " +
        "pertenece solo a la producción y el 1 solo al evaluador. Un set " +
        "sobre (f 1), en cambio, obliga a tocar las tres."
    },
    {
      id: "gramatica-set-begin-denotados",
      titulo: "4. Valores expresados y denotados",
      definicion:
        "Valor expresado = Número + Booleano + ProcVal\n" +
        "Valor denotado  = Ref(Valor expresado)",
      explicacion:
        "Con asignación, un identificador ya no denota un valor sino una " +
        "referencia a una celda que guarda el valor (EOPL §4.3). Los valores " +
        "expresados, los que produce una expresión, siguen siendo los mismos. " +
        "Elija la respuesta para cada renglón.",
      items: [
        { valor: "En " + programa("let w = 5 in w") + ", el identificador w denota",
          opciones: ["el número 5",
                     "el árbol (lit-exp 5)",
                     "una referencia a una celda que guarda 5"],
          correcta: 2,
          razon: "Una referencia: el let reserva la celda 6 con newref y liga w a (a-ref 6). El 5 es lo que hay en la celda; las celdas 0 a 5 son las del ambiente inicial." },
        { valor: "En el mismo programa, la expresión <code>w</code> del cuerpo vale",
          opciones: ["la referencia (a-ref 6)", "5, un valor expresado", "1"],
          correcta: 1,
          razon: "Vale 5. La cláusula var-exp es (deref (apply-env amb id)): apply-env devuelve la referencia, que se usa por dentro, y lo que sale es su contenido." },
        { valor: "En " + programa("let y = 1 in let leer = proc() y in begin set y = 7; (leer) end") +
            ", el set y = 7",
          opciones: ["cambia lo que guarda la celda; y sigue denotando la misma referencia",
                     "hace que y denote una referencia nueva",
                     "cambia la y de la clausura y no la del let"],
          correcta: 0,
          razon: "La referencia no cambia, cambia su contenido. Por eso el programa vale 7: leer capturó el eslabón donde está la celda de y, y al leerla encuentra lo que el set escribió." },
        { valor: "En " + programa("let f = proc(n) n in begin set f = proc(n) add1(n); (f 1) end") +
            ", la celda de f",
          opciones: ["solo puede guardar números",
                     "acepta la clausura nueva: un ProcVal es un valor expresado",
                     "no se puede asignar porque f es un procedimiento"],
          correcta: 1,
          razon: "Ref(Valor expresado) admite cualquier valor expresado, y una clausura lo es. El programa vale 2: la aplicación lee la celda de f y encuentra el procedimiento nuevo." },
        { valor: programa("let w = 5 in begin set w = true; w end") + " vale",
          opciones: ["#t", "5", "se detiene: w guardaba un número"],
          correcta: 0,
          razon: "Vale #t. La celda no tiene tipo: setref! escribe cualquier valor expresado sin mirar lo que había. Que w haya empezado con un número no restringe lo que se le asigne después." },
        { valor: "Alguna expresión del lenguaje tiene por valor una referencia",
          opciones: ["sí: una variable",
                     "sí: un set",
                     "no: ninguna expresión vale una referencia"],
          correcta: 2,
          razon: "Ninguna. Ref no está entre los valores expresados: una variable vale el contenido de su celda y un set vale 1. Las referencias solo viven dentro del ambiente, como lo que denota cada identificador." }
      ],
      cierre:
        "Expresado y denotado se separaron, y la separación explica todo lo " +
        "que hace set: escribe en lo que el nombre denota y no cambia la " +
        "denotación. En este lenguaje, las referencias no se pueden escribir ni " +
        "devolver; solo se llega a ellas a través de un nombre."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
