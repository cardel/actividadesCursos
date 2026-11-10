/* Lo que ve el scanner. Contar los tokens de un programa, decir de qué
   clase es cada lexema y ver hasta dónde llega el bocado más largo. Los
   conteos y las clases salen del interpretador de la sesión. */
var BLOQUES = (function () {
  "use strict";
  function c(t) { return "<code>" + t.replace(/</g, "&lt;") + "</code>"; }

  return [
    {
      id: "cuantos-tokens",
      titulo: "1. Cuántos tokens emite el scanner",
      definicion:
        "espacio-blanco (whitespace)                            skip\n" +
        "comentario     (\"%\" (arbno (not #\\newline)))           skip\n" +
        "identificador  (letter (arbno (or letter digit \"?\" \"$\")))  symbol\n" +
        "numero         (digit (arbno digit))                    number\n" +
        "numero         (\"-\" digit (arbno digit))                number",
      explicacion:
        "Esas son las reglas léxicas del lenguaje. Lo que la gramática " +
        "escribe entre comillas también deja token: los paréntesis, la coma, " +
        "los nombres de las primitivas y las palabras <code>let</code>, " +
        "<code>=</code> e <code>in</code>. Cuente cuántos tokens produce cada " +
        "programa.",
      items: [
        { valor: c("add1(b)"), opciones: ["2", "3", "4"], correcta: 2,
          razon: "Cuatro: add1, (, b y ). El nombre de la primitiva entra entero como un solo token y cada paréntesis cuenta aparte. Contar el par de paréntesis como una unidad da tres; leer add1(b) como la primitiva y su argumento da dos." },
        { valor: c("*(x, b)"), opciones: ["4", "5", "6"], correcta: 2,
          razon: "Seis: *, (, x, la coma, b y ). El espacio no deja nada. La coma sí es un token, porque la gramática la escribe en la producción de la primitiva, y descontarla es lo que lleva a cinco; descontar además los paréntesis, a cuatro." },
        { valor: c("sub1(add1(b))"), opciones: ["6", "7", "8"], correcta: 1,
          razon: "Siete: sub1, (, add1, (, b, ) y ). Los dos paréntesis de cierre llegan pegados y cada uno deja su token. Coma no hay ninguna: estas dos primitivas llevan un solo operando, y esperar una da ocho." },
        { valor: c("-(x,3)     % sin espacios"), opciones: ["6", "7", "9"], correcta: 0,
          razon: "Seis, los mismos que con espacios. El comentario arranca en el % y llega hasta el fin de la línea, y su regla léxica sale con skip igual que la de los espacios: ni el signo deja token ni lo dejan las dos palabras que lo siguen." },
        { valor: c("let y = 7 z = 2 in *(y, z)"), opciones: ["13", "14", "15"], correcta: 1,
          razon: "Catorce: let, y, =, 7, z, =, 2, in, *, (, y, la coma, z y ). La producción repite el par identificador = expresión, así que un solo let alcanza para las dos declaraciones; escribirlo delante de cada una da quince tokens y olvidar la coma, trece." },
        { valor: c("% nada más que esto"), opciones: ["0", "1", "4"], correcta: 0,
          razon: "Ninguno. El scanner lee la línea entera, la descarta y llega al final sin emitir nada: ni el signo ni las cuatro palabras dejan token. El parser se queda sin entrada y responde que un programa no puede empezar donde la entrada termina." }
      ],
      cierre:
        "Los espacios y los comentarios desaparecen; todo lo demás deja " +
        "token. Es la primera pérdida de información del proceso, y es " +
        "deliberada: cómo esté indentado el programa no cambia lo que hace."
    },
    {
      id: "clase-del-lexema",
      titulo: "2. De qué clase es cada lexema",
      definicion: null,
      explicacion:
        "El scanner etiqueta cada token con su clase. Las palabras que la " +
        "gramática escribe entre comillas —<code>let</code>, <code>in</code>, " +
        "los nombres de las primitivas, los signos— se reconocen como " +
        "literales suyos; lo demás cae en las reglas léxicas. Diga la clase " +
        "de cada lexema señalado.",
      opciones: ["Palabra reservada o literal de la gramática", "Identificador", "Número"],
      items: [
        { valor: "El " + c("x") + " de " + c("let x = 5 in x"), correcta: 1,
          razon: "Cae en la regla del identificador: una letra seguida de letras, dígitos, signos de interrogación o de dólar. Es el único de esa línea que el programador escogió libremente." },
        { valor: "El " + c("let") + " de " + c("let x = 5 in x"), correcta: 0,
          razon: "Está escrito en la producción, así que el scanner lo reconoce como literal y no como identificador. Esa es la razón de que no se pueda llamar let a una variable." },
        { valor: "El " + c("add1") + " de " + c("add1(b)"), correcta: 0,
          razon: "Aunque parezca un nombre cualquiera, la gramática lo escribe entre comillas en la producción de primitive. El scanner lo prefiere sobre la regla de identificador, y por eso let add1 = 5 in add1 es un error de sintaxis." },
        { valor: "El " + c("zero?") + " de " + c("let zero? = 4 in zero?"), correcta: 1,
          razon: "En el lenguaje de esta sesión zero? todavía no existe, así que ningún literal de la gramática lo reclama y queda como identificador. Por eso el programa es válido y devuelve 4. Cuando se agregue la primitiva, este mismo programa dejará de compilar." },
        { valor: "El " + c("-3") + " de " + c("-(x, -3)"), correcta: 2,
          razon: "La quinta regla léxica reconoce un menos pegado a un dígito como parte del número. El primer menos del programa no casa con ella porque lo que sigue es un paréntesis." },
        { valor: "El " + c("x5") + " de " + c("*(x5, 2)"), correcta: 1,
          razon: "La regla del identificador admite dígitos después de la primera letra. Es un solo token, y no una variable seguida de un número." }
      ],
      cierre:
        "Las palabras reservadas de un lenguaje no salen de una lista " +
        "aparte: son los literales que la gramática escribió en sus " +
        "producciones. Agregar una primitiva nueva le quita al programador " +
        "un nombre de variable, y eso es visible desde el scanner."
    },
    {
      id: "bocado-mas-largo",
      titulo: "3. El bocado más largo",
      definicion:
        "El scanner acumula caracteres y corta en la cadena más larga que\n" +
        "alguna regla reconozca. No mira hacia atrás ni pregunta al parser.",
      explicacion:
        "Esa regla decide sola dónde termina cada token. Diga en cuántos " +
        "tokens se parte cada cadena.",
      opciones: ["Uno", "Dos", "Tres"],
      items: [
        { valor: c("x5"), correcta: 0,
          razon: "Uno. La regla del identificador sigue comiendo mientras haya letras o dígitos, y como el bocado más largo es x5, no se detiene en la x." },
        { valor: c("5x"), correcta: 1,
          razon: "Dos: el número 5 y el identificador x. Ninguna regla empieza por dígito y sigue con letras, así que el número corta y el identificador arranca. El parser después rechaza la pareja." },
        { valor: c("add 1(b)") + " — las tres primeras", correcta: 2,
          razon: "Tres: add como identificador, 1 como número y el paréntesis. El espacio impidió que add1 fuera un solo bocado, y con eso el nombre de la primitiva se perdió." },
        { valor: c("adding"), correcta: 0,
          razon: "Uno solo, y es un identificador. Aunque empieza con las letras de add1, el bocado más largo es la palabra entera, así que el literal no se reclama." },
        { valor: c("-7"), correcta: 0,
          razon: "Uno: el número negativo. Las dos reglas de número compiten y gana la que reconoce la cadena más larga." },
        { valor: c("- 7"), correcta: 1,
          razon: "Dos, porque el espacio rompe el bocado: el menos queda como literal y el 7 como número. Un espacio cambia el resultado, y es el único lugar del proceso donde eso pasa." }
      ],
      cierre:
        "El scanner decide sin contexto: no sabe si el parser esperaba una " +
        "primitiva o un número. Por eso las dos reglas de número conviven " +
        "sin estorbarse, y por eso -(x, -3) tiene un menos de cada clase en " +
        "la misma línea."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
