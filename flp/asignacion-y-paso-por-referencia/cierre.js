/* Cierre de la asignación (EOPL §4.3). Cuatro retos sobre un intérprete
   pequeño con almacén: las cláusulas de var-exp y let-exp, la de set-exp, la
   de begin-exp, y una forma nueva, incr, con su variante y su cláusula. El
   almacén y el ambiente vienen escritos; el código del estudiante corre
   sobre mini-scheme.js. */
var BASE =
  ";; El almacén\n" +
  "(define-datatype referencia referencia? (a-ref (pos number?)))\n" +
  "(define el-almacen '())\n" +
  "(define initialize-store! (lambda () (set! el-almacen '())))\n" +
  "(define newref\n" +
  "  (lambda (val)\n" +
  "    (let ((k (length el-almacen)))\n" +
  "      (begin (set! el-almacen (append el-almacen (list val))) (a-ref k)))))\n" +
  "(define deref\n" +
  "  (lambda (ref) (cases referencia ref (a-ref (pos) (list-ref el-almacen pos)))))\n" +
  "(define reemplazar-celda\n" +
  "  (lambda (celdas pos val)\n" +
  "    (if (= pos 0) (cons val (cdr celdas))\n" +
  "        (cons (car celdas) (reemplazar-celda (cdr celdas) (- pos 1) val)))))\n" +
  "(define setref!\n" +
  "  (lambda (ref val)\n" +
  "    (cases referencia ref\n" +
  "      (a-ref (pos) (set! el-almacen (reemplazar-celda el-almacen pos val))))))\n\n" +
  ";; El ambiente: un nombre por eslabón, ligado a una referencia\n" +
  "(define-datatype ambiente ambiente?\n" +
  "  (ambiente-vacio)\n" +
  "  (extendido (id symbol?) (ref referencia?) (old ambiente?)))\n" +
  "(define apply-env\n" +
  "  (lambda (env var)\n" +
  "    (cases ambiente env\n" +
  "      (ambiente-vacio () 'no-ligada)\n" +
  "      (extendido (id ref old) (if (eq? id var) ref (apply-env old var))))))\n\n";

var GRAMATICA =
  "&lt;expresion&gt; ::= &lt;numero&gt;                      lit-exp (n)\n" +
  "            ::= &lt;identificador&gt;               var-exp (id)\n" +
  "            ::= +(&lt;expresion&gt;, &lt;expresion&gt;)    suma-exp (a b)\n" +
  "            ::= let &lt;identificador&gt; = &lt;expresion&gt; in &lt;expresion&gt;\n" +
  "                                              let-exp (id e cuerpo)\n" +
  "            ::= set &lt;identificador&gt; = &lt;expresion&gt;\n" +
  "                                              set-exp (id e)\n" +
  "            ::= begin &lt;expresion&gt; {; &lt;expresion&gt;}* end\n" +
  "                                              begin-exp (primera resto)";

var DATATYPE_EXP =
  "(define-datatype expresion expresion?\n" +
  "  (lit-exp (n number?))\n" +
  "  (var-exp (id symbol?))\n" +
  "  (suma-exp (a expresion?) (b expresion?))\n" +
  "  (let-exp (id symbol?) (e expresion?) (cuerpo expresion?))\n" +
  "  (set-exp (id symbol?) (e expresion?))\n" +
  "  (begin-exp (primera expresion?) (resto (list-of expresion?))))\n\n";

function evaluador(huecos) {
  return "(define evaluar\n" +
    "  (lambda (exp amb)\n" +
    "    (cases expresion exp\n" +
    "      (lit-exp (n) n)\n" +
    "      (var-exp (id) " + huecos.var + ")\n" +
    "      (suma-exp (a b) (+ (evaluar a amb) (evaluar b amb)))\n" +
    "      (let-exp (id e cuerpo)\n" +
    "        " + huecos.let + ")\n" +
    "      (set-exp (id e)\n" +
    "        " + huecos.set + ")\n" +
    "      (begin-exp (primera resto)\n" +
    "        " + huecos.begin + ")" + (huecos.incr ? "\n      (incr-exp (id)\n        " + huecos.incr + ")" : "") + ")))\n";
}

var VAR = "(deref (apply-env amb id))";
var LET = "(evaluar cuerpo (extendido id (newref (evaluar e amb)) amb))";
var SET = "(let* ((ref (apply-env amb id)) (val (evaluar e amb))) (begin (setref! ref val) 1))";
var BEGIN = "(evaluar-secuencia primera resto amb)";
var SECUENCIA =
  "(define evaluar-secuencia\n" +
  "  (lambda (primera resto amb)\n" +
  "    (if (null? resto)\n" +
  "        (evaluar primera amb)\n" +
  "        (begin (evaluar primera amb)\n" +
  "               (evaluar-secuencia (car resto) (cdr resto) amb)))))\n";

/* Un programa de cada prueba, escrito como árbol. */
var P_LET = "(let-exp 'm (lit-exp 3) (suma-exp (var-exp 'm) (var-exp 'm)))";
var P_LET2 = "(let-exp 'm (lit-exp 3) (let-exp 'n (suma-exp (var-exp 'm) (lit-exp 1)) (suma-exp (var-exp 'm) (var-exp 'n))))";
var P_SET = "(let-exp 'm (lit-exp 3) (begin-exp (set-exp 'm (lit-exp 10)) (list (var-exp 'm))))";
var P_SOMBRA = "(let-exp 'm (lit-exp 1) (suma-exp (let-exp 'm (lit-exp 5) (begin-exp (set-exp 'm (lit-exp 0)) (list (var-exp 'm)))) (var-exp 'm)))";

var RETOS = (function () {
  "use strict";
  return [
    {
      id: "cierre-var-let",
      titulo: "1. Leer una variable y ligar con let",
      enunciado:
        "El ambiente liga cada nombre a una referencia. Escriba la cláusula de " +
        "<code>var-exp</code>, que lee la celda, y la de <code>let-exp</code>, " +
        "que reserva una celda nueva con el valor de <code>e</code> y evalúa el " +
        "cuerpo en el ambiente extendido. Las de <code>set-exp</code> y " +
        "<code>begin-exp</code> vienen escritas.",
      gramatica: GRAMATICA,
      esqueleto: BASE + DATATYPE_EXP + SECUENCIA +
        evaluador({ var: "???", let: "???", set: SET, begin: BEGIN }),
      pruebas: [
        { llamada: "(begin (initialize-store!) (evaluar (lit-exp 7) (ambiente-vacio)))", esperado: "7" },
        { llamada: "(begin (initialize-store!) (evaluar " + P_LET + " (ambiente-vacio)))", esperado: "6" },
        { llamada: "(begin (initialize-store!) (evaluar " + P_LET2 + " (ambiente-vacio)))", esperado: "7" },
        { llamada: "(begin (initialize-store!) (evaluar " + P_LET2 + " (ambiente-vacio)) el-almacen)", esperado: "(3 4)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (/a-ref/.test(obtenido)) {
          return "Salió una referencia. var-exp lee la celda: (deref (apply-env amb id)).";
        }
        if (esperado === "(3 4)" && obtenido === "()") {
          return "No se reservó ninguna celda: let-exp liga id a (newref (evaluar e amb)).";
        }
        return "var-exp: (deref (apply-env amb id)). let-exp: (evaluar cuerpo " +
          "(extendido id (newref (evaluar e amb)) amb)).";
      },
      cierre:
        "Dos let, dos celdas: la de m con 3 y la de n con 4. El almacén queda " +
        "con lo que el programa ligó, en el orden en que lo ligó."
    },
    {
      id: "cierre-set",
      titulo: "2. La cláusula de set",
      enunciado:
        "Escriba la cláusula de <code>set-exp</code>: busca la referencia de " +
        "<code>id</code>, evalúa <code>e</code>, escribe con " +
        "<code>setref!</code> y devuelve 1.",
      gramatica: GRAMATICA,
      esqueleto: BASE + DATATYPE_EXP + SECUENCIA +
        evaluador({ var: VAR, let: LET, set: "???", begin: BEGIN }),
      pruebas: [
        { llamada: "(begin (initialize-store!) (evaluar " + P_SET + " (ambiente-vacio)))", esperado: "10" },
        { llamada: "(begin (initialize-store!) (evaluar (let-exp 'm (lit-exp 3) (set-exp 'm (lit-exp 10))) (ambiente-vacio)))", esperado: "1" },
        { llamada: "(begin (initialize-store!) (evaluar " + P_SOMBRA + " (ambiente-vacio)))", esperado: "1" },
        { llamada: "(begin (initialize-store!) (evaluar " + P_SOMBRA + " (ambiente-vacio)) el-almacen)", esperado: "(1 0)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (esperado === "1" && obtenido === "10") {
          return "set devolvió el valor asignado. La cláusula termina en 1.";
        }
        if (esperado === "(1 0)" && obtenido === "(0 5)") {
          return "Escribió en la m de afuera. apply-env encuentra primero la m del " +
            "eslabón más nuevo, la del let de adentro.";
        }
        return "(let* ((ref (apply-env amb id)) (val (evaluar e amb))) (begin " +
          "(setref! ref val) 1)).";
      },
      cierre:
        "En el tercer programa hay dos m. El set escribe en la de adentro, la " +
        "celda 1, y la de afuera sigue en 1: la suma da 0 + 1."
    },
    {
      id: "cierre-begin",
      titulo: "3. La cláusula de begin",
      enunciado:
        "Escriba <code>evaluar-secuencia</code>: evalúa las expresiones en orden " +
        "y devuelve el valor de la última. Las anteriores se evalúan solo por " +
        "su efecto.",
      gramatica: GRAMATICA,
      esqueleto: BASE + DATATYPE_EXP +
        "(define evaluar-secuencia\n" +
        "  (lambda (primera resto amb)\n" +
        "    (if (null? resto)\n" +
        "        ???\n" +
        "        (begin ???\n" +
        "               ???))))\n" +
        evaluador({ var: VAR, let: LET, set: SET, begin: BEGIN }),
      pruebas: [
        { llamada: "(begin (initialize-store!) (evaluar (begin-exp (lit-exp 4) '()) (ambiente-vacio)))", esperado: "4" },
        { llamada: "(begin (initialize-store!) (evaluar (let-exp 'm (lit-exp 1) (begin-exp (set-exp 'm (suma-exp (var-exp 'm) (var-exp 'm))) (list (set-exp 'm (suma-exp (var-exp 'm) (var-exp 'm))) (var-exp 'm)))) (ambiente-vacio)))", esperado: "4" },
        { llamada: "(begin (initialize-store!) (evaluar (let-exp 'm (lit-exp 1) (begin-exp (var-exp 'm) (list (set-exp 'm (lit-exp 9))))) (ambiente-vacio)))", esperado: "1" },
        { llamada: "(begin (initialize-store!) (evaluar (let-exp 'm (lit-exp 1) (begin-exp (set-exp 'm (lit-exp 2)) (list (set-exp 'm (suma-exp (var-exp 'm) (lit-exp 5)))))) (ambiente-vacio)) el-almacen)", esperado: "(7)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (esperado === "4" && obtenido === "2") {
          return "Se evaluó una expresión de menos. Con resto no vacío se evalúa " +
            "primera y se sigue con (car resto) y (cdr resto).";
        }
        if (esperado === "(7)" && obtenido === "(5)") {
          return "El segundo set no vio lo que escribió el primero: las expresiones " +
            "van en orden, y todas sobre el mismo amb.";
        }
        return "Si resto es vacío: (evaluar primera amb). Si no: (evaluar primera " +
          "amb) y luego (evaluar-secuencia (car resto) (cdr resto) amb).";
      },
      cierre:
        "Un begin que termina en set vale 1, aunque haya escrito algo en el " +
        "almacén. El valor y el efecto se separan: el valor es el de la última " +
        "expresión y el efecto se queda en las celdas."
    },
    {
      id: "cierre-incr",
      titulo: "4. Una forma nueva: incr",
      enunciado:
        "Se quiere agregar <code>incr x</code>, que suma 1 a la celda de " +
        "<code>x</code> y devuelve el valor nuevo. La producción sería " +
        "<code>&lt;expresion&gt; ::= incr &lt;identificador&gt;</code>. Agregue " +
        "la variante <code>(incr-exp (id symbol?))</code> al datatype y escriba " +
        "su cláusula. A diferencia de <code>set</code>, devuelve el valor " +
        "escrito.",
      gramatica: GRAMATICA + "\n            ::= incr &lt;identificador&gt;                incr-exp (id)",
      esqueleto: BASE +
        "(define-datatype expresion expresion?\n" +
        "  (lit-exp (n number?))\n" +
        "  (var-exp (id symbol?))\n" +
        "  (suma-exp (a expresion?) (b expresion?))\n" +
        "  (let-exp (id symbol?) (e expresion?) (cuerpo expresion?))\n" +
        "  (set-exp (id symbol?) (e expresion?))\n" +
        "  (begin-exp (primera expresion?) (resto (list-of expresion?)))\n" +
        "  ???)\n\n" + SECUENCIA +
        evaluador({ var: VAR, let: LET, set: SET, begin: BEGIN, incr: "???" }),
      pruebas: [
        { llamada: "(begin (initialize-store!) (evaluar (let-exp 'k (lit-exp 5) (incr-exp 'k)) (ambiente-vacio)))", esperado: "6" },
        { llamada: "(begin (initialize-store!) (evaluar (let-exp 'k (lit-exp 5) (begin-exp (incr-exp 'k) (list (incr-exp 'k) (var-exp 'k)))) (ambiente-vacio)))", esperado: "7" },
        { llamada: "(begin (initialize-store!) (evaluar (let-exp 'k (lit-exp 0) (suma-exp (incr-exp 'k) (incr-exp 'k))) (ambiente-vacio)))", esperado: "3" },
        { llamada: "(begin (initialize-store!) (evaluar (let-exp 'k (lit-exp 0) (suma-exp (incr-exp 'k) (incr-exp 'k))) (ambiente-vacio)) el-almacen)", esperado: "(2)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (esperado === "6" && obtenido === "1") {
          return "Devolvió 1, como set. incr devuelve el valor nuevo: lea la celda " +
            "después de escribir.";
        }
        if (esperado === "6" && obtenido === "5") {
          return "Devolvió el valor de antes de sumar. Escriba primero y lea después.";
        }
        return "La variante es (incr-exp (id symbol?)). La cláusula: (let ((ref " +
          "(apply-env amb id))) (begin (setref! ref (+ (deref ref) 1)) (deref ref))).";
      },
      cierre:
        "La suma de dos incr da 1 + 2: el segundo operando ya ve lo que escribió " +
        "el primero. Una forma nueva toca tres sitios: la producción, la " +
        "variante y la cláusula; el almacén no cambia."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = RETOS; }

if (typeof document !== "undefined") {
  MotorRetos.montar({ retos: RETOS, destino: "retos", cierre: "carta-cierre" });
  MotorRetos.montarConsola();
}
