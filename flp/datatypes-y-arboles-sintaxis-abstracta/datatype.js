/* ¿Compila este datatype? Declaraciones con define-datatype, unas bien y
   otras con el error que aparece en cada semestre, y después lo que los
   constructores aceptan y lo que rechazan. Lo que se juzga es lo que DrRacket
   responde. */
var BLOQUES = (function () {
  "use strict";
  return [
    {
      id: "compila",
      titulo: "1. ¿DrRacket acepta la declaración?",
      definicion:
        "(define-datatype tipo tipo?\n" +
        "  (variante (campo predicado) ...)\n" +
        "  ...)",
      explicacion:
        "La forma general está arriba. Para cada declaración, decida si " +
        "DrRacket la compila o la rechaza. Cuando la rechaza, la razón dice " +
        "qué mensaje sale.",
      opciones: ["Compila", "No compila"],
      items: [
        { valor: "<code>(define-datatype punto punto?<br>&nbsp;&nbsp;(un-punto (x number?) (y number?)))</code>", correcta: 0,
          razon: "Un tipo, su predicado, una variante con dos campos y sus predicados. Es la forma completa y no le falta nada." },
        { valor: "<code>(define-datatype cmd cmd?<br>&nbsp;&nbsp;(avanza (n number?))<br>&nbsp;&nbsp;(cmd (dir symbol?)))</code>", correcta: 1,
          razon: "La segunda variante se llama igual que el tipo, y define-datatype define las dos como identificadores: DrRacket responde identifier already defined. Es el mismo problema del taller con termino." },
        { valor: "<code>(define-datatype cmd cmd?<br>&nbsp;&nbsp;(avanza-cmd (n)))</code>", correcta: 1,
          razon: "El campo n no tiene predicado. Cada campo va como (nombre predicado), y DrRacket lo dice con esas palabras: expected a field name followed by a predicate expression." },
        { valor: "<code>(define-datatype cmd cmd<br>&nbsp;&nbsp;(avanza-cmd (n number?)))</code>", correcta: 1,
          razon: "El predicado se llama igual que el tipo. Los dos nombres se definen, y DrRacket responde identifier already defined: el signo de interrogación es lo que los separa." },
        { valor: "<code>(define-datatype cmd cmd?<br>&nbsp;&nbsp;(avanza-cmd (n number?) (n number?)))</code>", correcta: 1,
          razon: "Dos campos con el mismo nombre. El constructor es una lambda con esos nombres como parámetros, y una lambda no admite dos iguales: duplicate argument name." },
        { valor: "<code>(define-datatype cmd cmd?<br>&nbsp;&nbsp;(avanza-cmd n number?))</code>", correcta: 1,
          razon: "Faltan los paréntesis del campo. n y number? quedaron como dos cosas sueltas y define-datatype espera pares (nombre predicado)." },
        { valor: "<code>(define-datatype lista-int lista-int?<br>&nbsp;&nbsp;(vacia)<br>&nbsp;&nbsp;(no-vacia (primero number?) (resto lista-int?)))</code>", correcta: 0,
          razon: "Una variante sin campos es válida, y un campo cuyo predicado es el del propio tipo también: así se declara un tipo recursivo, igual que la gramática nombra al no terminal dentro de su producción." },
        { valor: "<code>(define-datatype cmd cmd?<br>&nbsp;&nbsp;(avanza-cmd (n number?))<br>&nbsp;&nbsp;(avanza-cmd (m number?)))</code>", correcta: 1,
          razon: "Dos variantes con el mismo nombre serían dos constructores con el mismo nombre: duplicate binding name." },
        { valor: "<code>(define-datatype cmd cmd?<br>&nbsp;&nbsp;(avanza-cmd (n number?))<br>&nbsp;&nbsp;(repite-cmd (n number?) (cmds cmd?)))</code>", correcta: 0,
          razon: "Compila sin objeción. El problema aparece después: cmds está pensado para guardar una lista de comandos y el predicado cmd? acepta un comando, no una lista. El siguiente bloque muestra qué pasa al construir." }
      ],
      cierre:
        "define-datatype define nombres: el tipo, el predicado y un " +
        "constructor por variante. Casi todo lo que no compila es un nombre " +
        "repetido o un campo mal escrito, y el mensaje de DrRacket lo dice " +
        "con esas palabras. Lo que sí compila y está mal se descubre al " +
        "construir."
    },
    {
      id: "construir",
      titulo: "2. Lo que el constructor acepta y lo que rechaza",
      definicion:
        "(define-datatype cmd cmd?\n" +
        "  (avanza-cmd (n number?))\n" +
        "  (gira-cmd   (dir symbol?))\n" +
        "  (repite-cmd (n number?) (cmds (list-of cmd?))))",
      explicacion:
        "Con esta declaración cargada en DrRacket, prediga qué produce cada " +
        "expresión.",
      items: [
        { valor: "<code>(avanza-cmd 3)</code>",
          opciones: ["un valor del tipo <code>cmd</code> con 3 en el campo <code>n</code>",
                     "la lista de dos elementos <code>(avanza-cmd 3)</code>",
                     "un error: el constructor espera la lista <code>(3)</code>"],
          correcta: 0,
          razon: "Un número cumple number?, el constructor arma el valor y cmd? lo reconoce. Los argumentos van como valores de Scheme: el 3 entra directo, sin lista que lo envuelva. Lo que DrRacket imprime se parece a una lista, y no lo es." },
        { valor: "<code>(avanza-cmd 'tres)</code>",
          opciones: ["un <code>cmd</code> con el símbolo <code>tres</code> en el campo <code>n</code>",
                     "un error del constructor: <code>n</code> pide <code>number?</code>",
                     "un <code>cmd</code> que aborta cuando alguien lea el campo <code>n</code>"],
          correcta: 1,
          razon: "El símbolo tres no cumple number? y el constructor corta ahí mismo: avanza-cmd: bad value for n field: 'tres. El valor mal formado nunca llega a existir, así que tampoco hay nada que pueda fallar después." },
        { valor: "<code>(cmd? (gira-cmd 'izq))</code>",
          opciones: ["<code>#t</code>: el valor salió de un constructor del tipo",
                     "<code>#f</code>: <code>cmd?</code> solo reconoce la primera variante",
                     "un error: hay que preguntar con el predicado de la variante"],
          correcta: 0,
          razon: "gira-cmd es uno de los tres constructores del tipo, y el predicado del tipo responde por los tres sin mirar de cuál variante se trata. Para distinguir la variante está cases." },
        { valor: "<code>(cmd? '(avanza-cmd 1))</code>",
          opciones: ["<code>#t</code>: la lista empieza con el nombre de la variante",
                     "<code>#f</code>: esa lista no salió de ningún constructor",
                     "un error: <code>cmd?</code> no sabe qué hacer con una lista"],
          correcta: 1,
          razon: "Con la comilla eso es una lista de dos elementos. cmd? responde #f y no se queja: del tipo solo son los valores que salieron de avanza-cmd, gira-cmd o repite-cmd, y la forma impresa de uno se parece de lejos." },
        { valor: "<code>(repite-cmd 2 (avanza-cmd 1))</code>",
          opciones: ["un error del constructor: <code>cmds</code> pide una lista",
                     "un <code>repite</code> con el comando suelto en <code>cmds</code>",
                     "un error más tarde, cuando alguien recorra <code>cmds</code>"],
          correcta: 0,
          razon: "El campo cmds pide (list-of cmd?) y llegó un comando suelto: repite-cmd: bad value for cmds field: (avanza-cmd 1). Envolverlo arregla la llamada, (list (avanza-cmd 1)). El predicado del campo corre al construir, de modo que nadie alcanza a recorrer nada." },
        { valor: "<code>(repite-cmd 0 '())</code>",
          opciones: ["un error: <code>(list-of cmd?)</code> pide al menos un comando",
                     "un <code>cmd</code> con la lista vacía en el campo <code>cmds</code>",
                     "un error más tarde, porque no hay nada que repetir"],
          correcta: 1,
          razon: "La lista vacía cumple (list-of cmd?): cero elementos y todos comandos. El valor queda construido y es legal, aunque repetir cero veces una lista vacía no haga nada." },
        { valor: "<code>(gira-cmd 'arriba)</code>",
          opciones: ["un error del constructor: <code>arriba</code> no es una dirección",
                     "un <code>cmd</code> que aborta cuando alguien lea la dirección",
                     "un <code>cmd</code>, porque <code>arriba</code> cumple <code>symbol?</code>"],
          correcta: 2,
          razon: "El predicado del campo es symbol? y arriba es un símbolo, así que el constructor lo acepta y el valor existe con una dirección que el lenguaje no tiene. Declarar las direcciones como un tipo aparte, con una variante por cada una, devuelve el rechazo al momento de construir." }
      ],
      cierre:
        "El predicado de cada campo es lo único que el constructor verifica. " +
        "Un símbolo cualquiera pasa por symbol?, y por eso los conjuntos " +
        "finitos como las direcciones se declaran mejor como un tipo con una " +
        "variante por valor: así el constructor sí rechaza lo que no existe."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

/* --- Interfaz ----------------------------------------------------- */
if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
