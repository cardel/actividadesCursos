/* Del chequeo a la inferencia: qué cambia cuando la anotación de tipo deja de
   ser obligatoria y se escribe ?. Los tipos, los veredictos y los mensajes de
   error de esta página se midieron con type-of-program sobre
   interpretadores/Interpretes/Corte 2/4 InferenciaTipos, y los del lenguaje
   anotado sobre Corte 2/3 ChequeoTipos. */
var BLOQUES = (function () {
  "use strict";

  function programa(texto) { return '<code class="programa">' + texto + "</code>"; }

  var OPCIONAL =
    "<optional-type-exp> ::= <type-exp>      a-type-exp (texp)\n" +
    "                    ::= ?              no-type-exp ()\n\n" +
    "proc ( {<optional-type-exp> <identificador>}*(,) ) <expresion>\n\n" +
    "letrec { <optional-type-exp> <identificador>\n" +
    "         ( {<optional-type-exp> <identificador>}*(,) ) = <expresion> }*\n" +
    "in <expresion>";

  var PAR =
    "anotado                                      con huecos\n" +
    "letrec                                       letrec\n" +
    "  bool even (int x) =                          ? even (? x) =\n" +
    "    if zero?(x) then true  else (odd sub1(x))      if zero?(x) then true  else (odd sub1(x))\n" +
    "  bool odd  (int x) =                          ? odd  (? x) =\n" +
    "    if zero?(x) then false else (even sub1(x))     if zero?(x) then false else (even sub1(x))\n" +
    "in (odd 13)                                  in (odd 13)";

  return [
    {
      id: "hueco",
      titulo: "1. El hueco y lo que el interpretador pone en su lugar",
      definicion: OPCIONAL,
      explicacion:
        "La gramática de este lenguaje cambia en dos producciones: donde antes " +
        "iba un tipo, ahora va un <code>optional-type-exp</code>, que admite el " +
        "tipo concreto o el símbolo <code>?</code>. Responda sobre esa categoría " +
        "nueva y sobre lo que el interpretador hace con ella.",
      items: [
        { valor: "En lugar del tipo de un parámetro, el programador escribe",
          opciones: ["el símbolo <code>?</code>",
                     "<code>int</code> o <code>bool</code>, uno de los dos",
                     "nada, y el parámetro queda como <code>proc (x) …</code>"],
          correcta: 0,
          razon: "Las dos producciones de optional-type-exp son el tipo concreto y el signo de pregunta, y no hay una tercera. Dejar el hueco en blanco no parsea: proc (x) add1(x) muere en el analizador con nonterminal <seplist56> can't begin with identifier x." },
        { valor: "Cada <code>?</code> del programa se convierte en",
          opciones: ["el tipo <code>int</code>, que es el más frecuente",
                     "una variable de tipo nueva, con su número",
                     "el tipo del primer uso que aparezca"],
          correcta: 1,
          razon: "expand-optional-type-expression responde al caso no-type-exp con una llamada a fresh-tvar, que entrega una variable distinta cada vez. El uso no entra todavía: el hueco se llena con una incógnita y los usos la van restringiendo después." },
        { valor: "El <code>?</code> puede aparecer",
          opciones: ["en el <code>let</code>, que es donde se ligan los valores",
                     "en los parámetros de <code>proc</code> y en los tipos del <code>letrec</code>",
                     "en cualquier sitio donde la gramática pida una expresión"],
          correcta: 1,
          razon: "Son los dos sitios que la gramática cambió, y los únicos donde antes el programador tenía que escribir un tipo. El let nunca llevó anotación en ninguna de las dos versiones del lenguaje: su tipo sale de la expresión que se liga. Y el ? no es una expresión: es una de las dos formas de un optional-type-exp." },
        { valor: "El tipo de " + programa("proc (int x) add1(x)") + " aquí es",
          opciones: ["ninguno: con la anotación puesta el programa ya no parsea",
                     "<code>(int -&gt; int)</code>, el mismo que en el lenguaje anotado",
                     "<code>(? -&gt; int)</code>, porque el parámetro quedó sin deducir"],
          correcta: 1,
          razon: "La anotación pasó a ser opcional, no prohibida: a-type-exp sigue en la gramática. Los dos interpretadores dan (int -> int) para este programa, el del chequeo y el de la inferencia." },
        { valor: "El tipo de " + programa("proc (? x) add1(x)") + " es",
          opciones: ["una variable de tipo libre, porque <code>x</code> no se anotó",
                     "<code>(tvar1 -&gt; int)</code>, con el parámetro sin resolver",
                     "<code>(int -&gt; int)</code>, el mismo de la versión anotada"],
          correcta: 2,
          razon: "La variable fresca que entró por el hueco no se queda libre: add1 pide un int y la unificación la llena con int. Escribir la anotación o escribir el hueco da el mismo tipo, y en eso consiste la sesión." },
        { valor: "Con " + programa("proc (bool x) add1(x)") + ", el interpretador",
          opciones: ["falla, porque <code>add1</code> pide un <code>int</code>",
                     "deduce <code>int</code> e ignora la anotación equivocada",
                     "avisa y sigue, porque anotar ya es opcional"],
          correcta: 0,
          razon: "Aborta con Type mismatch: int doesn't match bool. Una anotación escrita es una ecuación más del sistema, no una sugerencia: si contradice al cuerpo, el programa no tipa. Quien escribe el tipo sigue respondiendo por él." },
        { valor: "Con " + programa("proc (? x) if x then 1 else true") + ", el interpretador",
          opciones: ["deduce <code>(bool -&gt; int)</code> y toma la rama del <code>then</code>",
                     "falla: las dos ramas del <code>if</code> tienen que coincidir",
                     "deduce una variable de tipo para el resultado, que queda libre"],
          correcta: 1,
          razon: "Aborta con Type mismatch: int doesn't match bool. La regla del condicional sigue exigiendo que las dos ramas tengan el mismo tipo, y aquí una es int y la otra bool. Escribir ? en todas partes no cambia qué programas tipan." }
      ],
      cierre: "El ? marca un hueco y el interpretador lo llena con una incógnita. Las reglas no se relajaron: siguen exigiendo lo mismo."
    },
    {
      id: "mismo-programa",
      titulo: "2. El mismo programa en las dos versiones",
      definicion: PAR,
      explicacion:
        "A la izquierda, el par mutuamente recursivo tal como había que " +
        "escribirlo cuando la anotación era obligatoria; a la derecha, el mismo " +
        "programa con huecos. Responda sobre los dos y sobre lo que cambió de " +
        "mano.",
      items: [
        { valor: "La versión con huecos, en el interpretador que exige anotaciones,",
          opciones: ["tipa a <code>bool</code>, porque el <code>?</code> se ignora",
                     "tipa, y deja los dos parámetros sin resolver",
                     "no llega a chequearse: su gramática pide un tipo ahí"],
          correcta: 2,
          razon: "Falla en el analizador, con nonterminal <type-exp57> can't begin with end-marker #f. El lenguaje anotado no tiene la categoría optional-type-exp: donde esta versión admite dos cosas, aquella admite una." },
        { valor: "La versión anotada, en el interpretador que deduce,",
          opciones: ["tipa a <code>bool</code>, igual que antes",
                     "no tipa: con huecos disponibles la anotación sobra",
                     "tipa, pero a una variable de tipo"],
          correcta: 0,
          razon: "Los dos interpretadores devuelven bool para la versión anotada. La inferencia agrega una posibilidad y no quita ninguna: todo lo que se escribía antes se sigue escribiendo igual." },
        { valor: "La versión con huecos lleva",
          opciones: ["dos <code>?</code>, uno por declaración",
                     "cuatro <code>?</code>, dos por declaración",
                     "seis <code>?</code>, contando el cuerpo del <code>letrec</code>"],
          correcta: 1,
          razon: "Cada declaración lleva dos: el tipo del resultado, antes del nombre, y el del parámetro. Con dos declaraciones son cuatro huecos y cuatro variables de tipo frescas. El cuerpo del letrec no se anota en ninguna de las dos versiones." },
        { valor: "El tipo de " + programa("letrec ? fact (int n) = if zero?(n) then 1 else *(n, (fact sub1(n))) in fact") + " es",
          opciones: ["ninguno: mezclar un hueco y una anotación no parsea",
                     "<code>(int -&gt; tvar1)</code>, con el resultado sin deducir",
                     "<code>(int -&gt; int)</code>: el hueco del resultado se deduce"],
          correcta: 2,
          razon: "Los huecos y los tipos escritos conviven en la misma declaración, porque optional-type-exp se decide hueco por hueco. Aquí el parámetro viene anotado y el resultado sale de las dos ramas del condicional, que son int." },
        { valor: "Lo que pasó a ser del interpretador es",
          opciones: ["deducir el tipo de cada parámetro y de cada resultado",
                     "decidir qué tipo conviene cuando las ramas no coinciden",
                     "aceptar el programa cuando no puede deducir un tipo"],
          correcta: 0,
          razon: "Eso, y nada más: los huecos que el programador dejó. Las comprobaciones siguen donde estaban, y cuando no hay un tipo que satisfaga las ecuaciones el programa se rechaza, igual que antes." },
        { valor: "Con " + programa("let f = proc (? x) zero?(x) in (f true)") + ", el interpretador",
          opciones: ["deduce <code>bool</code>, porque <code>zero?</code> entrega <code>bool</code>",
                     "deduce el tipo de <code>x</code> a partir de la llamada, y queda <code>bool</code>",
                     "falla: <code>zero?</code> fija <code>x</code> en <code>int</code> y la llamada pasa un <code>bool</code>"],
          correcta: 2,
          razon: "Aborta con Type mismatch: int doesn't match bool. El cuerpo del proc y la llamada aportan ecuaciones sobre la misma incógnita, y las dos tienen que valer a la vez. El hueco no elige la que convenga." },
        { valor: "El tipo de " + programa("let f = proc (? x) x in let y = (f 5) in f") + " es",
          opciones: ["<code>(tvar1 -&gt; tvar1)</code>, el de la identidad",
                     "<code>int</code>, el tipo de la llamada que aparece en medio",
                     "<code>(int -&gt; int)</code>: el uso fijó el hueco"],
          correcta: 2,
          razon: "Sin la ligadura de y, el mismo programa da (tvar -> tvar). La llamada (f 5) agrega la ecuación que vuelve int a la incógnita del parámetro, y el tipo del programa lo refleja aunque el valor de y nunca se use." }
      ],
      cierre: "Un programa se escribe sin tipos y queda tipado igual. Lo que cambió es quién escribe el tipo, no qué programas se aceptan."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
