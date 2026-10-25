/* El paso por referencia en código (EOPL §4.5.1). Tres retos sobre un
   intérprete pequeño con almacén: evaluar-operando, que entrega la
   referencia de una variable o una celda nueva; la aplicación que liga los
   parámetros a esas referencias; y un predicado que dice si dos nombres son
   alias. El almacén y el ambiente vienen escritos; el código del estudiante
   corre sobre mini-scheme.js. */
var BASE_OP =
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
  "(define-datatype ambiente ambiente?\n" +
  "  (ambiente-vacio)\n" +
  "  (extendido (ids (list-of symbol?)) (refs (list-of referencia?)) (old ambiente?)))\n" +
  "(define apply-env\n" +
  "  (lambda (env var)\n" +
  "    (cases ambiente env\n" +
  "      (ambiente-vacio () 'no-ligada)\n" +
  "      (extendido (ids refs old) (buscar ids refs var old)))))\n" +
  "(define buscar\n" +
  "  (lambda (ids refs var old)\n" +
  "    (cond [(null? ids) (apply-env old var)]\n" +
  "          [(eq? (car ids) var) (car refs)]\n" +
  "          [else (buscar (cdr ids) (cdr refs) var old)])))\n\n" +
  "(define-datatype expresion expresion?\n" +
  "  (lit-exp (n number?))\n" +
  "  (var-exp (id symbol?))\n" +
  "  (suma-exp (a expresion?) (b expresion?))\n" +
  "  (let-exp (id symbol?) (e expresion?) (cuerpo expresion?))\n" +
  "  (set-exp (id symbol?) (e expresion?))\n" +
  "  (begin-exp (primera expresion?) (resto (list-of expresion?)))\n" +
  "  (proc-exp (ids (list-of symbol?)) (cuerpo expresion?))\n" +
  "  (app-exp (rator expresion?) (rands (list-of expresion?))))\n" +
  "(define-datatype procval procval?\n" +
  "  (closure (ids (list-of symbol?)) (cuerpo expresion?) (env ambiente?)))\n\n";

var GRAMATICA_OP =
  "&lt;expresion&gt; ::= &lt;numero&gt; | &lt;identificador&gt; | +(&lt;expresion&gt;, &lt;expresion&gt;)\n" +
  "            ::= let &lt;identificador&gt; = &lt;expresion&gt; in &lt;expresion&gt;\n" +
  "            ::= set &lt;identificador&gt; = &lt;expresion&gt;\n" +
  "            ::= begin &lt;expresion&gt; {; &lt;expresion&gt;}* end\n" +
  "            ::= proc ( {&lt;identificador&gt;}*(,) ) &lt;expresion&gt;\n" +
  "            ::= ( &lt;expresion&gt; {&lt;expresion&gt;}* )";

function evaluadorOp(app) {
  return "(define evaluar\n" +
    "  (lambda (exp amb)\n" +
    "    (cases expresion exp\n" +
    "      (lit-exp (n) n)\n" +
    "      (var-exp (id) (deref (apply-env amb id)))\n" +
    "      (suma-exp (a b) (+ (evaluar a amb) (evaluar b amb)))\n" +
    "      (let-exp (id e cuerpo)\n" +
    "        (evaluar cuerpo (extendido (list id) (list (newref (evaluar e amb))) amb)))\n" +
    "      (set-exp (id e)\n" +
    "        (let* ((ref (apply-env amb id)) (val (evaluar e amb)))\n" +
    "          (begin (setref! ref val) 1)))\n" +
    "      (begin-exp (primera resto) (secuencia primera resto amb))\n" +
    "      (proc-exp (ids cuerpo) (closure ids cuerpo amb))\n" +
    "      (app-exp (rator rands)\n" +
    "        " + app + "))))\n" +
    "(define secuencia\n" +
    "  (lambda (primera resto amb)\n" +
    "    (if (null? resto) (evaluar primera amb)\n" +
    "        (begin (evaluar primera amb) (secuencia (car resto) (cdr resto) amb)))))\n";
}

var OPERANDO =
  "(define evaluar-operando\n" +
  "  (lambda (exp amb)\n" +
  "    (cases expresion exp\n" +
  "      (var-exp (id) (apply-env amb id))\n" +
  "      (else (newref (evaluar exp amb))))))\n";
var OPERANDOS =
  "(define operandos\n" +
  "  (lambda (rands amb)\n" +
  "    (if (null? rands) '()\n" +
  "        (let ((r (evaluar-operando (car rands) amb)))\n" +
  "          (cons r (operandos (cdr rands) amb))))))\n";
var APP =
  "(let ((refs (operandos rands amb)) (f (evaluar rator amb)))\n" +
  "          (cases procval f\n" +
  "            (closure (ids cuerpo env) (evaluar cuerpo (extendido ids refs env)))))";

/* let p = proc(w) set w = 4 in let m = 3 in begin (p m); m end */
var P_W = "(let-exp 'p (proc-exp '(w) (set-exp 'w (lit-exp 4))) (let-exp 'm (lit-exp 3) (begin-exp (app-exp (var-exp 'p) (list (var-exp 'm))) (list (var-exp 'm)))))";
/* el mismo, con el operando +(m, 0) */
var P_W2 = "(let-exp 'p (proc-exp '(w) (set-exp 'w (lit-exp 4))) (let-exp 'm (lit-exp 3) (begin-exp (app-exp (var-exp 'p) (list (suma-exp (var-exp 'm) (lit-exp 0)))) (list (var-exp 'm)))))";
/* let f = proc(u, v) begin set u = +(u, v); u end in let n = 5 in (f n n) */
var P_DOBLE = "(let-exp 'f (proc-exp '(u v) (begin-exp (set-exp 'u (suma-exp (var-exp 'u) (var-exp 'v))) (list (var-exp 'u)))) (let-exp 'n (lit-exp 5) (app-exp (var-exp 'f) (list (var-exp 'n) (var-exp 'n)))))";

var RETOS = (function () {
  "use strict";
  return [
    {
      id: "operando-regla",
      titulo: "1. evaluar-operando",
      enunciado:
        "Escriba <code>evaluar-operando</code>: si el operando es una " +
        "variable, devuelve la referencia que esa variable ya tiene; si es " +
        "cualquier otra expresión, la evalúa y le reserva una celda nueva con " +
        "el valor. Use <code>cases</code> con una cláusula <code>else</code>.",
      gramatica: GRAMATICA_OP,
      esqueleto: BASE_OP + evaluadorOp("'sin-implementar") + "\n" +
        ";; evaluar-operando : Expresion x Ambiente -> Ref\n" +
        "(define evaluar-operando\n" +
        "  (lambda (exp amb)\n" +
        "    (cases expresion exp\n" +
        "      (var-exp (id) ???)\n" +
        "      (else ???))))\n\n" +
        "(define e (begin (initialize-store!) (extendido '(m) (list (newref 3)) (ambiente-vacio))))\n",
      pruebas: [
        { llamada: "(evaluar-operando (var-exp 'm) e)", esperado: "(a-ref 0)" },
        { llamada: "(evaluar-operando (lit-exp 8) e)", esperado: "(a-ref 1)" },
        { llamada: "(evaluar-operando (suma-exp (var-exp 'm) (lit-exp 1)) e)", esperado: "(a-ref 2)" },
        { llamada: "el-almacen", esperado: "(3 8 4)" },
        { llamada: "(begin (evaluar-operando (var-exp 'm) e) (length el-almacen))", esperado: "3" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (llamada === "(evaluar-operando (var-exp 'm) e)" && obtenido === "3") {
          return "Salió el valor de m. Para una variable se entrega su referencia: " +
            "(apply-env amb id), sin deref.";
        }
        if (llamada === "(evaluar-operando (var-exp 'm) e)" && obtenido === "(a-ref 1)") {
          return "Se reservó una celda nueva para la variable. Eso es paso por valor; " +
            "aquí la variable presta la suya.";
        }
        if (/^[0-9]+$/.test(obtenido) && /a-ref/.test(esperado)) {
          return "Para una expresión que no es variable se reserva una celda: " +
            "(newref (evaluar exp amb)).";
        }
        return "var-exp: (apply-env amb id). else: (newref (evaluar exp amb)).";
      },
      cierre:
        "Una variable no gasta celda: presta la suya. +(m, 1) no es una " +
        "variable aunque mencione a m, y recibe una celda propia con 4."
    },
    {
      id: "operando-aplicacion",
      titulo: "2. La aplicación con paso por referencia",
      enunciado:
        "Con <code>evaluar-operando</code> escrito, escriba " +
        "<code>operandos</code>, que convierte la lista de operandos en la " +
        "lista de referencias, en orden, y la cláusula de " +
        "<code>app-exp</code>: primero los operandos, después el operador, y " +
        "el cuerpo se evalúa en el ambiente de la clausura extendido con los " +
        "parámetros ligados a esas referencias.",
      gramatica: GRAMATICA_OP,
      esqueleto: BASE_OP + OPERANDO + "\n" +
        "(define operandos\n" +
        "  (lambda (rands amb)\n" +
        "    (if (null? rands) '()\n" +
        "        (let ((r ???))\n" +
        "          ???))))\n\n" +
        evaluadorOp("(let ((refs (operandos rands amb)) (f (evaluar rator amb)))\n" +
                    "          (cases procval f\n" +
                    "            (closure (ids cuerpo env) ???)))"),
      pruebas: [
        { llamada: "(begin (initialize-store!) (evaluar " + P_W + " (ambiente-vacio)))", esperado: "4" },
        { llamada: "(begin (initialize-store!) (evaluar " + P_W2 + " (ambiente-vacio)))", esperado: "3" },
        { llamada: "(begin (initialize-store!) (evaluar " + P_W2 + " (ambiente-vacio)) el-almacen)", esperado: "((closure (w) (set-exp w (lit-exp 4)) (ambiente-vacio)) 3 4)" },
        { llamada: "(begin (initialize-store!) (evaluar " + P_DOBLE + " (ambiente-vacio)))", esperado: "10" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (esperado === "4" && obtenido === "3") {
          return "La asignación a w no llegó a m: el parámetro tiene que quedar " +
            "ligado a la referencia que entrega evaluar-operando, sin newref nuevo.";
        }
        if (esperado === "10" && obtenido !== "10") {
          return "Con (f n n), u y v reciben la misma referencia. El set escribe 10 " +
            "en la celda de n, y u la lee.";
        }
        return "operandos: r es (evaluar-operando (car rands) amb) y el resultado " +
          "(cons r (operandos (cdr rands) amb)). En la clausura: (evaluar cuerpo " +
          "(extendido ids refs env)).";
      },
      cierre:
        "Con +(m, 0) el parámetro recibe una celda propia, la 2, y el 4 queda " +
        "ahí: m sigue en 3. Con m, el parámetro comparte la celda 1 y el 4 se ve " +
        "afuera."
    },
    {
      id: "operando-alias",
      titulo: "3. ¿Son el mismo nombre?",
      enunciado:
        "Dos variables son <em>alias</em> si denotan la misma celda. Escriba " +
        "<code>alias?</code>, que recibe un ambiente y dos nombres y dice si " +
        "sus referencias apuntan a la misma posición. Compare posiciones, no " +
        "contenidos: dos celdas distintas pueden guardar el mismo número.",
      gramatica: null,
      esqueleto: BASE_OP + OPERANDO + OPERANDOS + evaluadorOp(APP) + "\n" +
        ";; posicion : Ref -> Int\n" +
        "(define posicion\n" +
        "  (lambda (r) (cases referencia r (a-ref (pos) pos))))\n\n" +
        ";; alias? : Ambiente x Símbolo x Símbolo -> Bool\n" +
        "(define alias?\n" +
        "  (lambda (amb a b)\n" +
        "    ???))\n\n" +
        ";; El ambiente de la llamada (f n n) y el de (f n k), armados a mano:\n" +
        "(define antes (begin (initialize-store!)\n" +
        "  (extendido '(n k) (list (newref 5) (newref 5)) (ambiente-vacio))))\n" +
        "(define llamada1 (extendido '(u v) (list (apply-env antes 'n) (apply-env antes 'n)) antes))\n" +
        "(define llamada2 (extendido '(u v) (list (apply-env antes 'n) (apply-env antes 'k)) antes))\n",
      pruebas: [
        { llamada: "(alias? llamada1 'u 'v)", esperado: "#t" },
        { llamada: "(alias? llamada1 'u 'n)", esperado: "#t" },
        { llamada: "(alias? llamada2 'u 'v)", esperado: "#f" },
        { llamada: "(alias? antes 'n 'k)", esperado: "#f" },
        { llamada: "(alias? llamada2 'v 'k)", esperado: "#t" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (esperado === "#f" && obtenido === "#t") {
          return "Comparó contenidos: n y k guardan 5 los dos, pero son dos celdas. " +
            "Compare (posicion (apply-env amb a)) con (posicion (apply-env amb b)).";
        }
        return "(= (posicion (apply-env amb a)) (posicion (apply-env amb b))).";
      },
      cierre:
        "n y k empiezan iguales y no son alias; u y v en (f n n) sí lo son, y " +
        "también de n. El aliasing es una pregunta sobre celdas, no sobre " +
        "valores: por eso no se ve leyendo el programa."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = RETOS; }

if (typeof document !== "undefined") {
  MotorRetos.montar({ retos: RETOS, destino: "retos", cierre: "carta-cierre" });
  MotorRetos.montarConsola();
}
