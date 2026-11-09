/* El TAD tipo y el ambiente de tipos de CHECKED (EOPL §7.1). Tres retos sobre
   src/tipos.rkt y src/chequeador.rkt del interpretador con chequeo: escribir
   un tipo de vuelta en la notación del lenguaje, intercalar los asteriscos y
   buscar un nombre en el ambiente de tipos. El código del estudiante corre
   sobre mini-scheme.js. */
var RETOS = (function () {
  "use strict";

  var TIPO =
    "(define-datatype type type?\n" +
    "  (atomic-type (name symbol?))\n" +
    "  (proc-type (arg-types (list-of type?)) (result-type type?)))\n" +
    "(define int-type (atomic-type 'int))\n" +
    "(define bool-type (atomic-type 'bool))\n";

  var TENV =
    "(define-datatype type-environment type-environment?\n" +
    "  (empty-tenv-record)\n" +
    "  (extended-tenv-record\n" +
    "   (syms (list-of symbol?)) (vals (list-of type?))\n" +
    "   (tenv type-environment?)))\n" +
    "(define empty-tenv empty-tenv-record)\n" +
    "(define extend-tenv extended-tenv-record)\n";

  var ARGS_HECHA =
    ";; Ya escrita: intercala los asteriscos entre los argumentos.\n" +
    "(define arg-types-to-external-form\n" +
    "  (lambda (types)\n" +
    "    (if (null? types)\n" +
    "        '()\n" +
    "        (if (null? (cdr types))\n" +
    "            (list (type-to-external-form (car types)))\n" +
    "            (cons (type-to-external-form (car types))\n" +
    "                  (cons '* (arg-types-to-external-form (cdr types))))))))\n";

  var EXTERNA_HECHA =
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
      id: "tipos-externa",
      titulo: "1. Del tipo a su escritura",
      enunciado:
        "El chequeador guarda los tipos como valores del datatype, pero los " +
        "mensajes y el REPL los muestran escritos. Escriba " +
        "<code>type-to-external-form</code>, que recibe un tipo y devuelve la " +
        "lista de símbolos con que se escribe: <code>int</code> para los " +
        "atómicos y <code>(int * bool -&gt; int)</code> para los de " +
        "procedimiento. El ayudante que intercala los asteriscos ya está " +
        "escrito.",
      gramatica: null,
      esqueleto:
        TIPO + "\n" + ARGS_HECHA + "\n" +
        ";; type-to-external-form : type -> lista de símbolos\n" +
        "(define type-to-external-form\n" +
        "  (lambda (ty)\n" +
        "    (cases type ty\n" +
        "      (atomic-type (name) ???)\n" +
        "      (proc-type (arg-types result-type)\n" +
        "                 (append ???\n" +
        "                         '(->)\n" +
        "                         ???)))))\n",
      pruebas: [
        { llamada: "(type-to-external-form int-type)", esperado: "int" },
        { llamada: "(type-to-external-form (proc-type (list int-type) int-type))", esperado: "(int -> int)" },
        { llamada: "(type-to-external-form (proc-type (list int-type bool-type) int-type))", esperado: "(int * bool -> int)" },
        { llamada: "(type-to-external-form (proc-type '() int-type))", esperado: "(-> int)" },
        { llamada: "(type-to-external-form (proc-type (list int-type) (proc-type (list bool-type) int-type)))", esperado: "(int -> (bool -> int))" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (obtenido === "(int)" || /^\(\(/.test(obtenido)) {
          return "El resultado es una lista plana de símbolos, no una lista de listas. " +
            "append pega las tres partes; list envuelve una sola.";
        }
        if (esperado === "int" && obtenido !== "int") {
          return "En el caso atómico no hay nada que construir: el campo name ya es el símbolo.";
        }
        return "El caso de proc-type pega tres cosas: los argumentos ya escritos, " +
          "la flecha y el resultado escrito, que es una llamada recursiva envuelta en list.";
      },
      cierre:
        "Esta función es la que convierte un valor del datatype en lo que el " +
        "estudiante lee en un mensaje de error. Que el tipo del resultado se " +
        "escriba con una llamada recursiva es lo que permite que " +
        "(int -> (bool -> int)) salga con sus paréntesis."
    },
    {
      id: "tipos-asteriscos",
      titulo: "2. Los asteriscos van entre los argumentos",
      enunciado:
        "Ahora al revés: con <code>type-to-external-form</code> ya escrita, " +
        "escriba <code>arg-types-to-external-form</code>, que recibe la lista " +
        "de tipos de los parámetros y los devuelve escritos con un " +
        "<code>*</code> entre cada dos. Con cero parámetros la lista es " +
        "vacía y con uno no hay asterisco.",
      gramatica: null,
      esqueleto:
        TIPO + "\n" +
        ";; Ya escrita: usa el ayudante que usted va a escribir.\n" +
        "(define type-to-external-form\n" +
        "  (lambda (ty)\n" +
        "    (cases type ty\n" +
        "      (atomic-type (name) name)\n" +
        "      (proc-type (arg-types result-type)\n" +
        "                 (append (arg-types-to-external-form arg-types)\n" +
        "                         '(->)\n" +
        "                         (list (type-to-external-form result-type)))))))\n\n" +
        ";; arg-types-to-external-form : lista de type -> lista de símbolos\n" +
        "(define arg-types-to-external-form\n" +
        "  (lambda (types)\n" +
        "    (if (null? types)\n" +
        "        ???\n" +
        "        (if (null? (cdr types))\n" +
        "            ???\n" +
        "            ???))))\n",
      pruebas: [
        { llamada: "(arg-types-to-external-form '())", esperado: "()" },
        { llamada: "(arg-types-to-external-form (list int-type))", esperado: "(int)" },
        { llamada: "(arg-types-to-external-form (list int-type bool-type))", esperado: "(int * bool)" },
        { llamada: "(arg-types-to-external-form (list int-type bool-type int-type))", esperado: "(int * bool * int)" },
        { llamada: "(type-to-external-form (proc-type (list int-type bool-type) bool-type))", esperado: "(int * bool -> bool)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (/\* *\)$/.test(obtenido)) {
          return "Quedó un asterisco al final. El caso de un solo elemento tiene que " +
            "ir antes: cuando (cdr types) es vacío no se agrega separador.";
        }
        if (obtenido === "(int bool)") {
          return "Faltó intercalar el símbolo. Entre el primero escrito y el resto va " +
            "un (cons '* …).";
        }
        return "Son tres casos: lista vacía, un solo tipo y dos o más. En el último " +
          "van dos cons seguidos, uno con el tipo escrito y otro con el asterisco.";
      },
      cierre:
        "Separar con un símbolo entre elementos, y no después de cada uno, es " +
        "el mismo problema de la coma en una lista escrita. El caso de un solo " +
        "elemento es el que lo resuelve."
    },
    {
      id: "tipos-tenv",
      titulo: "3. Buscar un nombre en el ambiente de tipos",
      enunciado:
        "El ambiente de tipos tiene la misma forma que el de valores, con " +
        "tipos en lugar de valores: cada eslabón guarda listas paralelas de " +
        "nombres y tipos. Escriba <code>apply-tenv</code>, que devuelve el " +
        "tipo del nombre en el eslabón más cercano que lo tenga y " +
        "<code>'libre</code> cuando no está en ninguno.",
      gramatica: null,
      esqueleto:
        TIPO + "\n" + TENV + "\n" + EXTERNA_HECHA + "\n" +
        ";; apply-tenv : type-environment símbolo -> type o 'libre\n" +
        "(define apply-tenv\n" +
        "  (lambda (tenv sym)\n" +
        "    (cases type-environment tenv\n" +
        "      (empty-tenv-record () ???)\n" +
        "      (extended-tenv-record (syms vals viejo)\n" +
        "        (buscar syms vals viejo sym)))))\n\n" +
        ";; buscar : listas paralelas, el eslabón de atrás y el nombre\n" +
        "(define buscar\n" +
        "  (lambda (syms vals viejo sym)\n" +
        "    (cond\n" +
        "      ((null? syms) ???)\n" +
        "      ((equal? (car syms) sym) ???)\n" +
        "      (else ???))))\n\n" +
        "(define t1\n" +
        "  (extend-tenv '(x b) (list int-type bool-type)\n" +
        "    (extend-tenv '(f x) (list (proc-type (list int-type) bool-type) bool-type)\n" +
        "      (empty-tenv))))\n",
      pruebas: [
        { llamada: "(type-to-external-form (apply-tenv t1 'x))", esperado: "int" },
        { llamada: "(type-to-external-form (apply-tenv t1 'b))", esperado: "bool" },
        { llamada: "(type-to-external-form (apply-tenv t1 'f))", esperado: "(int -> bool)" },
        { llamada: "(apply-tenv t1 'w)", esperado: "libre" },
        { llamada: "(apply-tenv (empty-tenv) 'x)", esperado: "libre" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (esperado === "int" && obtenido === "bool") {
          return "Encontró la x del eslabón de atrás. Cuando el nombre no está en este " +
            "marco se sigue con el eslabón viejo, pero solo después de recorrer el actual entero.";
        }
        if (obtenido === "libre" && esperado !== "libre") {
          return "La comparación de nombres va con equal? sobre (car syms), y los " +
            "dos recorridos avanzan parejos: (cdr syms) con (cdr vals).";
        }
        return "Tres casos: el marco se agotó y se sigue en el viejo con apply-tenv, " +
          "el nombre casa y se devuelve (car vals), o se avanza en las dos listas.";
      },
      cierre:
        "Es apply-env con tipos adentro, y esa es la idea de toda la sesión: " +
        "el chequeo recorre el programa con la misma forma del evaluador, " +
        "pero llevando tipos donde el otro lleva valores."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = RETOS; }

if (typeof document !== "undefined") {
  MotorRetos.montar({ retos: RETOS, destino: "retos", cierre: "carta-cierre" });
  MotorRetos.montarConsola();
}
