/* Dos reglas de tipamiento escritas como código (EOPL §7.1, Figura 7.4): la
   del condicional y la de la aplicación. En el interpretador abortan con
   check-equal-type!; aquí devuelven 'error, porque una prueba no puede
   esperar un error como resultado. El código del estudiante corre sobre
   mini-scheme.js. */
var RETOS = (function () {
  "use strict";

  var TIPO =
    "(define-datatype type type?\n" +
    "  (atomic-type (name symbol?))\n" +
    "  (proc-type (arg-types (list-of type?)) (result-type type?)))\n" +
    "(define int-type (atomic-type 'int))\n" +
    "(define bool-type (atomic-type 'bool))\n";

  var EXTERNA =
    ";; Ya escrita: de un tipo a la notación del lenguaje.\n" +
    "(define type-to-external-form\n" +
    "  (lambda (ty)\n" +
    "    (cases type ty\n" +
    "      (atomic-type (name) name)\n" +
    "      (proc-type (arg-types result-type)\n" +
    "                 (append (arg-types-to-external-form arg-types)\n" +
    "                         '(->)\n" +
    "                         (list (type-to-external-form result-type)))))))\n" +
    "(define arg-types-to-external-form\n" +
    "  (lambda (types)\n" +
    "    (if (null? types) '()\n" +
    "        (if (null? (cdr types)) (list (type-to-external-form (car types)))\n" +
    "            (cons (type-to-external-form (car types))\n" +
    "                  (cons '* (arg-types-to-external-form (cdr types))))))))\n";

  return [
    {
      id: "chequeador-if",
      titulo: "1. La regla del condicional",
      enunciado:
        "La cláusula del <code>if</code> comprueba dos cosas antes de " +
        "entregar un tipo: que la prueba sea <code>bool</code> y que las dos " +
        "ramas tengan el mismo tipo. Escriba <code>tipo-del-if</code>, que " +
        "recibe los tres tipos ya calculados y devuelve el tipo de la " +
        "expresión, o <code>'error</code> cuando alguna comprobación falla.",
      gramatica:
        "tipo(prueba) = bool    tipo(then) = tipo(else) = t\n" +
        "-------------------------------------------------\n" +
        "        tipo(if prueba then then else else) = t",
      esqueleto:
        TIPO + "\n" + EXTERNA + "\n" +
        ";; tipo-del-if : type type type -> type o 'error\n" +
        "(define tipo-del-if\n" +
        "  (lambda (t-prueba t-then t-else)\n" +
        "    (cond\n" +
        "      (??? 'error)\n" +
        "      (??? 'error)\n" +
        "      (else ???))))\n",
      pruebas: [
        { llamada: "(type-to-external-form (tipo-del-if bool-type int-type int-type))", esperado: "int" },
        { llamada: "(type-to-external-form (tipo-del-if bool-type bool-type bool-type))", esperado: "bool" },
        { llamada: "(tipo-del-if int-type int-type int-type)", esperado: "error" },
        { llamada: "(tipo-del-if bool-type int-type bool-type)", esperado: "error" },
        { llamada: "(type-to-external-form (tipo-del-if bool-type (proc-type (list int-type) int-type) (proc-type (list int-type) int-type)))", esperado: "(int -> int)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (esperado === "error" && obtenido === "int") {
          return "Falta una de las dos comprobaciones. Son dos condiciones distintas: " +
            "la prueba contra bool-type y las dos ramas entre sí.";
        }
        if (esperado === "(int -> int)") {
          return "La comparación con equal? sirve igual para un tipo de procedimiento: " +
            "compara la estructura completa, no solo el nombre.";
        }
        return "Las dos primeras ramas del cond devuelven 'error y la última devuelve " +
          "el tipo de las ramas, que a esa altura ya se sabe igual en las dos.";
      },
      cierre:
        "Devolver el tipo de una rama y no el de la prueba es lo que hace " +
        "útil la regla: el valor del if va a ser el de una de las dos ramas, " +
        "y el chequeador no sabe cuál. Por eso exige que coincidan."
    },
    {
      id: "chequeador-aplicacion",
      titulo: "2. La regla de la aplicación",
      enunciado:
        "La aplicación comprueba tres cosas: que el operador sea de tipo " +
        "procedimiento, que reciba tantos argumentos como parámetros declara " +
        "y que cada tipo case con el suyo. Escriba " +
        "<code>tipo-de-aplicacion</code>, que recibe el tipo del operador y " +
        "la lista de los tipos de los argumentos, y devuelve el tipo del " +
        "resultado o <code>'error</code>.",
      gramatica:
        "tipo(rator) = (t1 * … * tn -> t)    tipo(randi) = ti\n" +
        "---------------------------------------------------\n" +
        "          tipo((rator rand1 … randn)) = t",
      esqueleto:
        TIPO + "\n" + EXTERNA + "\n" +
        ";; mismos? : dos listas de type -> booleano\n" +
        ";; Es verdadero cuando tienen el mismo largo y casan una a una.\n" +
        "(define mismos?\n" +
        "  (lambda (as bs)\n" +
        "    (cond\n" +
        "      ((and (null? as) (null? bs)) #t)\n" +
        "      ((or (null? as) (null? bs)) ???)\n" +
        "      ((equal? (car as) (car bs)) ???)\n" +
        "      (else #f))))\n\n" +
        ";; tipo-de-aplicacion : type lista de type -> type o 'error\n" +
        "(define tipo-de-aplicacion\n" +
        "  (lambda (t-rator t-rands)\n" +
        "    (cases type t-rator\n" +
        "      (atomic-type (name) ???)\n" +
        "      (proc-type (arg-types result-type)\n" +
        "                 (if ??? ??? 'error)))))\n",
      pruebas: [
        { llamada: "(type-to-external-form (tipo-de-aplicacion (proc-type (list int-type) int-type) (list int-type)))", esperado: "int" },
        { llamada: "(tipo-de-aplicacion (proc-type (list int-type) int-type) (list bool-type))", esperado: "error" },
        { llamada: "(tipo-de-aplicacion (proc-type (list int-type) int-type) (list int-type int-type))", esperado: "error" },
        { llamada: "(tipo-de-aplicacion int-type (list int-type))", esperado: "error" },
        { llamada: "(type-to-external-form (tipo-de-aplicacion (proc-type '() bool-type) '()))", esperado: "bool" },
        { llamada: "(type-to-external-form (tipo-de-aplicacion (proc-type (list (proc-type (list int-type) int-type) int-type) bool-type) (list (proc-type (list int-type) int-type) int-type)))", esperado: "bool" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (llamada.indexOf("int-type (list int-type)") > 0 && obtenido !== "error") {
          return "Un tipo atómico no es un procedimiento: esa variante del cases " +
            "devuelve 'error sin mirar los argumentos.";
        }
        if (esperado === "error" && obtenido === "int") {
          return "mismos? tiene que fallar por dos razones distintas: porque un tipo " +
            "no casa y porque las listas no tienen el mismo largo.";
        }
        return "El caso de proc-type pregunta si los tipos de los argumentos son los " +
          "mismos que los declarados, y en ese caso entrega result-type.";
      },
      cierre:
        "Con el largo adentro de mismos? no hace falta contar aparte: cuando " +
        "una lista se acaba antes que la otra, el segundo caso lo decide. El " +
        "evaluador de este lenguaje no hace esa comprobación, y por eso " +
        "(proc (int x) add1(x) 5 6) corre y entrega 6 aunque el chequeador lo rechace."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = RETOS; }

if (typeof document !== "undefined") {
  MotorRetos.montar({ retos: RETOS, destino: "retos", cierre: "carta-cierre" });
  MotorRetos.montarConsola();
}
