/* El almacén en código (EOPL §4.2). Cinco retos que levantan el almacén de
   src/almacen.rkt: la lista que cambia en una posición, newref sobre un
   almacén global, deref con su verificación de rango, el almacén numerado
   para mirarlo, y dos clientes que solo usan la interfaz. El código del
   estudiante corre sobre mini-scheme.js. */
var DATATYPE_REF =
  "(define-datatype referencia referencia?\n" +
  "  (a-ref (pos number?)))\n";

var ALMACEN_DADO =
  "(define el-almacen '())\n" +
  "(define initialize-store! (lambda () (set! el-almacen '())))\n" +
  "(define newref\n" +
  "  (lambda (val)\n" +
  "    (let ((siguiente (length el-almacen)))\n" +
  "      (begin\n" +
  "        (set! el-almacen (append el-almacen (list val)))\n" +
  "        (a-ref siguiente)))))\n" +
  "(define deref\n" +
  "  (lambda (ref)\n" +
  "    (cases referencia ref\n" +
  "      (a-ref (pos) (list-ref el-almacen pos)))))\n" +
  "(define reemplazar-celda\n" +
  "  (lambda (celdas pos val)\n" +
  "    (if (= pos 0)\n" +
  "        (cons val (cdr celdas))\n" +
  "        (cons (car celdas) (reemplazar-celda (cdr celdas) (- pos 1) val)))))\n" +
  "(define setref!\n" +
  "  (lambda (ref val)\n" +
  "    (cases referencia ref\n" +
  "      (a-ref (pos) (set! el-almacen (reemplazar-celda el-almacen pos val))))))\n";

var RETOS = (function () {
  "use strict";
  return [
    {
      id: "almacen-reemplazar",
      titulo: "1. Una lista igual salvo en una posición",
      enunciado:
        "<code>setref!</code> no modifica la lista del almacén: arma otra igual " +
        "salvo en la posición <code>pos</code> y la pone en su lugar. Escriba " +
        "esa función, <code>reemplazar-celda</code>, con recursión sobre la " +
        "lista. Si la posición no existe, devuelva el símbolo " +
        "<code>sin-celda</code> (en <code>almacen.rkt</code> es un " +
        "<code>eopl:error</code>).",
      gramatica: null,
      esqueleto:
        ";; reemplazar-celda : Lista x Int x Valor -> Lista\n" +
        "(define reemplazar-celda\n" +
        "  (lambda (celdas pos val)\n" +
        "    (cond\n" +
        "      [(null? celdas) ???]\n" +
        "      [(= pos 0) ???]\n" +
        "      [else ???])))\n",
      pruebas: [
        { llamada: "(reemplazar-celda '(4 2 5) 0 9)", esperado: "(9 2 5)" },
        { llamada: "(reemplazar-celda '(4 2 5) 2 9)", esperado: "(4 2 9)" },
        { llamada: "(reemplazar-celda '(4 2 5) 1 7)", esperado: "(4 7 5)" },
        { llamada: "(reemplazar-celda '(4 2 5) 3 9)", esperado: "sin-celda" },
        { llamada: "(reemplazar-celda '() 0 1)", esperado: "sin-celda" },
        { llamada: "(let ((viejo '(1 2))) (begin (reemplazar-celda viejo 0 8) viejo))", esperado: "(1 2)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (esperado === "(4 2 9)" && obtenido === "(9 2 5)") {
          return "Escribió siempre en la primera posición. En el caso recursivo " +
            "la posición baja en uno y la lista avanza: (- pos 1) con (cdr celdas).";
        }
        if (/^\(9 2 5|\(4 9|\(4 7/.test(obtenido) && obtenido.length < esperado.length) {
          return "Se perdió una parte de la lista: en el caso recursivo se " +
            "conserva (car celdas) con cons delante de lo que devuelve la llamada.";
        }
        if (esperado === "sin-celda") {
          return "Con la lista vacía ya no hay posición donde escribir: ese caso " +
            "devuelve 'sin-celda, y el cond lo revisa antes que (= pos 0).";
        }
        return "Tres casos: lista vacía, sin-celda; posición 0, (cons val (cdr " +
          "celdas)); si no, (cons (car celdas) (reemplazar-celda (cdr celdas) " +
          "(- pos 1) val)).";
      },
      cierre:
        "La última prueba es la que importa: la lista vieja sigue intacta. Por " +
        "eso setref! necesita el set! que deja la lista nueva en el-almacen; sin " +
        "él, la escritura se perdería."
    },
    {
      id: "almacen-newref",
      titulo: "2. newref sobre un almacén global",
      enunciado:
        "El almacén es la variable global <code>el-almacen</code>, una lista que " +
        "empieza vacía. Escriba <code>newref</code>: agrega el valor al final y " +
        "devuelve la referencia a esa celda nueva. La posición es el largo que " +
        "tenía la lista antes de crecer. El evaluador de esta página tiene " +
        "<code>set!</code>, como Racket.",
      gramatica: DATATYPE_REF,
      esqueleto:
        DATATYPE_REF + "\n" +
        "(define el-almacen '())\n" +
        "(define initialize-store! (lambda () (set! el-almacen '())))\n\n" +
        ";; newref : Valor -> Ref\n" +
        "(define newref\n" +
        "  (lambda (val)\n" +
        "    (let ((siguiente ???))\n" +
        "      (begin\n" +
        "        (set! el-almacen ???)\n" +
        "        ???))))\n",
      pruebas: [
        { llamada: "(begin (initialize-store!) (newref 5))", esperado: "(a-ref 0)" },
        { llamada: "(begin (initialize-store!) (newref 5) (newref 7))", esperado: "(a-ref 1)" },
        { llamada: "(begin (initialize-store!) (newref 5) (newref 7) el-almacen)", esperado: "(5 7)" },
        { llamada: "(begin (initialize-store!) (newref 5) (newref 5) el-almacen)", esperado: "(5 5)" },
        { llamada: "(begin (initialize-store!) (newref 3) (newref (a-ref 0)) el-almacen)", esperado: "(3 (a-ref 0))" },
        { llamada: "(begin (initialize-store!) (newref 1) (newref 2) (newref 3))", esperado: "(a-ref 2)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (esperado === "(a-ref 1)" && obtenido === "(a-ref 2)") {
          return "La posición salió del largo después de crecer. siguiente se " +
            "calcula con (length el-almacen) antes del set!.";
        }
        if (esperado === "(5 7)" && obtenido === "(7 5)") {
          return "La celda nueva quedó adelante. Va al final: (append el-almacen " +
            "(list val)), no (cons val el-almacen).";
        }
        if (/^\(5/.test(esperado) && /^\(5\)$|^\(\)$/.test(obtenido)) {
          return "El almacén no creció: el set! tiene que dejar en el-almacen " +
            "la lista con la celda nueva.";
        }
        return "siguiente es (length el-almacen); el set! deja (append el-almacen " +
          "(list val)); lo último es (a-ref siguiente).";
      },
      cierre:
        "Dos newref con el mismo 5 dan dos celdas: el almacén guarda (5 5) y las " +
        "referencias son (a-ref 0) y (a-ref 1). Una celda nueva por cada newref, " +
        "guarde lo que guarde."
    },
    {
      id: "almacen-deref",
      titulo: "3. deref con su verificación",
      enunciado:
        "Escriba <code>deref</code>: abre la referencia con <code>cases</code> " +
        "y lee la celda. Si la posición no existe en el almacén, devuelva " +
        "<code>sin-celda</code> en vez de llamar a <code>list-ref</code>, que " +
        "fallaría (en <code>almacen.rkt</code> es un <code>eopl:error</code>).",
      gramatica: DATATYPE_REF,
      esqueleto:
        DATATYPE_REF + "\n" +
        "(define el-almacen '(4 2 5))\n\n" +
        ";; deref : Ref -> Valor\n" +
        "(define deref\n" +
        "  (lambda (ref)\n" +
        "    (cases referencia ref\n" +
        "      (a-ref (pos)\n" +
        "        (if ???\n" +
        "            ???\n" +
        "            'sin-celda)))))\n",
      pruebas: [
        { llamada: "(deref (a-ref 0))", esperado: "4" },
        { llamada: "(deref (a-ref 2))", esperado: "5" },
        { llamada: "(deref (a-ref 3))", esperado: "sin-celda" },
        { llamada: "(deref (a-ref 9))", esperado: "sin-celda" },
        { llamada: "(list (deref (a-ref 1)) (deref (a-ref 1)))", esperado: "(2 2)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (llamada === "(deref (a-ref 2))" && obtenido === "sin-celda") {
          return "La última celda se declaró inexistente. Una posición existe si " +
            "es menor que el largo: (< pos (length el-almacen)).";
        }
        if (/^\(a-ref/.test(obtenido) || obtenido === "0") {
          return "Salió la referencia o la posición. deref devuelve el contenido: " +
            "(list-ref el-almacen pos).";
        }
        return "La prueba es (< pos (length el-almacen)); si se cumple, " +
          "(list-ref el-almacen pos).";
      },
      cierre:
        "Leer dos veces la misma celda da lo mismo mientras nadie escriba en " +
        "medio. Con setref! entre las dos lecturas ya no: ahí empieza el estado."
    },
    {
      id: "almacen-lista",
      titulo: "4. El almacén numerado",
      enunciado:
        "Para mirar el almacén desde el REPL, los intérpretes traen " +
        "<code>almacen-&gt;lista</code>: cada celda con su posición, " +
        "<code>((0 4) (1 2) …)</code>. Escriba el auxiliar " +
        "<code>numerar</code>, que recibe las celdas y la posición de la " +
        "primera.",
      gramatica: null,
      esqueleto:
        "(define el-almacen '(4 2 5))\n\n" +
        ";; numerar : Lista x Int -> Lista de (posición valor)\n" +
        "(define numerar\n" +
        "  (lambda (celdas pos)\n" +
        "    (if (null? celdas)\n" +
        "        ???\n" +
        "        ???)))\n\n" +
        "(define almacen->lista (lambda () (numerar el-almacen 0)))\n",
      pruebas: [
        { llamada: "(almacen->lista)", esperado: "((0 4) (1 2) (2 5))" },
        { llamada: "(numerar '() 0)", esperado: "()" },
        { llamada: "(numerar '(9) 6)", esperado: "((6 9))" },
        { llamada: "(numerar '(7 (a b)) 3)", esperado: "((3 7) (4 (a b)))" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (obtenido === "((0 4) (0 2) (0 5))" || obtenido === "((6 9))" && esperado !== obtenido) {
          return "La posición no avanza: la llamada recursiva recibe (+ pos 1).";
        }
        if (/^\(0 4 1 2/.test(obtenido)) {
          return "Cada celda va como una lista de dos elementos: (list pos (car celdas)).";
        }
        return "(cons (list pos (car celdas)) (numerar (cdr celdas) (+ pos 1))).";
      },
      cierre:
        "(almacen->lista) es la ventana al almacén desde DrRacket: después de " +
        "correr un programa, muestra las celdas que dejó, las seis del ambiente " +
        "inicial primero."
    },
    {
      id: "almacen-clientes",
      titulo: "5. Dos clientes del almacén",
      enunciado:
        "El almacén ya está escrito arriba. Usando solo <code>newref</code>, " +
        "<code>deref</code> y <code>setref!</code>, escriba " +
        "<code>incrementar!</code>, que suma 1 a la celda de una referencia, e " +
        "<code>intercambiar!</code>, que intercambia los contenidos de dos " +
        "celdas. Las dos terminan devolviendo lo que quedó en la celda de su " +
        "primer argumento. El caso que más cuesta es pasar la misma referencia " +
        "dos veces.",
      gramatica: DATATYPE_REF,
      esqueleto:
        DATATYPE_REF + "\n" + ALMACEN_DADO + "\n" +
        ";; incrementar! : Ref -> Valor\n" +
        "(define incrementar!\n" +
        "  (lambda (r)\n" +
        "    (begin\n" +
        "      ???\n" +
        "      (deref r))))\n\n" +
        ";; intercambiar! : Ref x Ref -> Valor\n" +
        "(define intercambiar!\n" +
        "  (lambda (r1 r2)\n" +
        "    (let ((guardado ???))\n" +
        "      (begin\n" +
        "        ???\n" +
        "        ???\n" +
        "        (deref r1)))))\n",
      pruebas: [
        { llamada: "(begin (initialize-store!) (let ((r (newref 4))) (begin (incrementar! r) (incrementar! r))))", esperado: "6" },
        { llamada: "(begin (initialize-store!) (let ((r (newref 4)) (s (newref 9))) (begin (incrementar! s) el-almacen)))", esperado: "(4 10)" },
        { llamada: "(begin (initialize-store!) (let ((p (newref 1)) (q (newref 8))) (begin (intercambiar! p q) el-almacen)))", esperado: "(8 1)" },
        { llamada: "(begin (initialize-store!) (let ((p (newref 1)) (q (newref 8))) (intercambiar! p q)))", esperado: "8" },
        { llamada: "(begin (initialize-store!) (let ((p (newref 3))) (begin (intercambiar! p p) el-almacen)))", esperado: "(3)" },
        { llamada: "(begin (initialize-store!) (let ((p (newref 3)) (q (newref 5))) (begin (intercambiar! p q) (intercambiar! p q) el-almacen)))", esperado: "(3 5)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (esperado === "(8 1)" && obtenido === "(8 8)") {
          return "El contenido de p se perdió antes de copiarlo a q. Guárdelo " +
            "primero: guardado es (deref r1), y la segunda escritura usa guardado.";
        }
        if (esperado === "6" && obtenido === "4") {
          return "La celda no cambió: (setref! r (+ (deref r) 1)).";
        }
        return "incrementar!: (setref! r (+ (deref r) 1)). intercambiar!: guardado " +
          "es (deref r1); después (setref! r1 (deref r2)) y (setref! r2 guardado).";
      },
      cierre:
        "Con la misma referencia dos veces, intercambiar! deja la celda como " +
        "estaba: guarda 3, escribe 3 y vuelve a escribir 3. Es el aliasing del " +
        "paso por referencia visto desde el almacén: dos nombres, una celda."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = RETOS; }

if (typeof document !== "undefined") {
  MotorRetos.montar({ retos: RETOS, destino: "retos", cierre: "carta-cierre" });
  MotorRetos.montarConsola();
}
