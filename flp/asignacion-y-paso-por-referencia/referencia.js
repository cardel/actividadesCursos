/* El TAD referencia (EOPL §4.2). Cinco retos sobre la pareja (posición,
   vector): las dos primitivas del almacén, cuándo dos referencias denotan la
   misma celda, un cliente que intercambia contenidos, un recorrido que
   incrementa y la copia de una celda frente a compartirla. El código del
   estudiante corre sobre mini-scheme.js. */
var DATATYPE_REF =
  "(define-datatype referencia referencia?\n" +
  "  (a-ref (pos number?)\n" +
  "         (vec vector?)))\n";

var PRIMITIVAS =
  "\n;; Las dos primitivas del almacén, ya escritas.\n" +
  "(define deref\n" +
  "  (lambda (ref)\n" +
  "    (cases referencia ref\n" +
  "      (a-ref (pos vec) (vector-ref vec pos)))))\n" +
  "\n" +
  "(define setref!\n" +
  "  (lambda (ref val)\n" +
  "    (cases referencia ref\n" +
  "      (a-ref (pos vec) (vector-set! vec pos val)))))\n";

var MISMA_CELDA =
  "\n;; Dos referencias denotan la misma celda si comparten vector y posición.\n" +
  "(define misma-celda?\n" +
  "  (lambda (r1 r2)\n" +
  "    (cases referencia r1\n" +
  "      (a-ref (pos1 vec1)\n" +
  "        (cases referencia r2\n" +
  "          (a-ref (pos2 vec2)\n" +
  "            (and (eq? vec1 vec2) (= pos1 pos2))))))))\n";

var RETOS = (function () {
  "use strict";
  return [
    {
      id: "referencia-deref",
      titulo: "1. Leer y escribir una celda",
      enunciado:
        "Una referencia es la pareja (posición, vector) de EOPL §4.2: " +
        "<code>(a-ref 1 v)</code> denota la celda 1 del vector <code>v</code>. " +
        "Escriba <code>deref</code>, que lee esa celda con " +
        "<code>vector-ref</code>, y <code>setref!</code>, que la escribe con " +
        "<code>vector-set!</code>; las dos abren la referencia con " +
        "<code>cases</code>. En <code>almacen.rkt</code> cada una delega en " +
        "<code>primitiva-deref</code> y <code>primitiva-setref!</code>, y aquí " +
        "van en una sola pieza. Los vectores de las pruebas se arman con " +
        "<code>list-&gt;vector</code> porque en Racket un literal " +
        "<code>#(8 3 6)</code> no se deja modificar. Como " +
        "<code>vector-set!</code> no devuelve nada que imprimir, las pruebas " +
        "que escriben terminan con una lectura o con el vector.",
      gramatica: DATATYPE_REF,
      esqueleto:
        DATATYPE_REF + "\n" +
        ";; deref : referencia -> valor\n" +
        "(define deref\n" +
        "  (lambda (ref)\n" +
        "    (cases referencia ref\n" +
        "      (a-ref (pos vec) ???))))\n" +
        "\n" +
        ";; setref! : referencia x valor -> nada (escribe en la celda)\n" +
        "(define setref!\n" +
        "  (lambda (ref val)\n" +
        "    (cases referencia ref\n" +
        "      (a-ref (pos vec) ???))))\n",
      pruebas: [
        { llamada: "(deref (a-ref 1 (list->vector '(8 3 6))))", esperado: "3" },
        { llamada: "(deref (a-ref 2 (list->vector '(8 3 6))))", esperado: "6" },
        { llamada: "(let ((v (list->vector '(8 3 6)))) (begin (setref! (a-ref 0 v) 15) v))", esperado: "#(15 3 6)" },
        { llamada: "(let ((v (list->vector '(8 3 6)))) (let ((r (a-ref 2 v))) (begin (setref! r 1) r)))", esperado: "(a-ref 2 #(8 3 1))" },
        { llamada: "(let ((v (list->vector '(8 3 6)))) (let ((r1 (a-ref 1 v)) (r2 (a-ref 1 v))) (begin (setref! r1 11) (deref r2))))", esperado: "11" },
        { llamada: "(let ((v (list->vector '(8 3 6)))) (let ((r1 (a-ref 1 v)) (r2 (a-ref 0 v))) (begin (setref! r1 11) (deref r2))))", esperado: "8" },
        { llamada: "(let ((v (list->vector '(8 3 6)))) (let ((r1 (a-ref 1 v)) (r2 (a-ref 1 v))) (list (eq? r1 r2) (begin (setref! r1 11) (deref r2)))))", esperado: "(#f 11)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (llamada === "(deref (a-ref 1 (list->vector '(8 3 6))))" && obtenido === "1") {
          return "Salió la posición, no el contenido. deref lee la celda: " +
            "vector-ref con el vector y la posición.";
        }
        if (llamada === "(deref (a-ref 1 (list->vector '(8 3 6))))" && obtenido === "#(8 3 6)") {
          return "Salió el vector entero. La referencia apunta a una sola " +
            "celda, la de la posición pos.";
        }
        if (obtenido === "#(8 3 6)" || obtenido === "(a-ref 2 #(8 3 6))" || obtenido === "3") {
          return "La celda no cambió: setref! tiene que escribir con " +
            "vector-set! sobre vec, en la posición pos, el valor val.";
        }
        return "deref devuelve (vector-ref vec pos); setref! hace " +
          "(vector-set! vec pos val). Las dos trabajan sobre el vector que " +
          "guarda la referencia, no sobre una copia.";
      },
      cierre:
        "r1 y r2 son dos valores distintos (eq? da #f) y aun así lo que se " +
        "escribe por r1 se lee por r2, porque comparten vector y posición. Lo " +
        "mismo ocurre en el intérprete: cada consulta de apply-env-ref arma " +
        "una a-ref nueva para la misma variable, y todas llevan a la misma celda."
    },
    {
      id: "referencia-misma-celda",
      titulo: "2. Cuándo dos referencias son la misma celda",
      enunciado:
        "Dos referencias denotan la misma ubicación cuando apuntan al mismo " +
        "vector y a la misma posición. “El mismo vector” quiere decir el mismo " +
        "objeto, y eso lo responde <code>eq?</code>. <code>equal?</code> " +
        "compara contenidos: dos vectores armados por separado con " +
        "<code>'(1 9 4)</code> le parecen iguales, aunque escribir en uno no " +
        "toque al otro. Escriba <code>misma-celda?</code>. Una de las pruebas " +
        "usa tres celdas que guardan el mismo número, para descartar que se " +
        "comparen los contenidos.",
      gramatica: DATATYPE_REF,
      esqueleto:
        DATATYPE_REF + PRIMITIVAS + "\n" +
        "(define misma-celda?\n" +
        "  (lambda (r1 r2)\n" +
        "    (cases referencia r1\n" +
        "      (a-ref (pos1 vec1)\n" +
        "        (cases referencia r2\n" +
        "          (a-ref (pos2 vec2)\n" +
        "            (and ??? ???)))))))\n",
      pruebas: [
        { llamada: "(let ((v (list->vector '(1 9 4)))) (misma-celda? (a-ref 2 v) (a-ref 2 v)))", esperado: "#t" },
        { llamada: "(let ((v (list->vector '(1 9 4)))) (misma-celda? (a-ref 0 v) (a-ref 2 v)))", esperado: "#f" },
        { llamada: "(let ((v (list->vector '(1 9 4))) (w (list->vector '(1 9 4)))) (misma-celda? (a-ref 1 v) (a-ref 1 w)))", esperado: "#f" },
        { llamada: "(let ((v (list->vector '(1 9 4))) (w (list->vector '(1 9 4)))) (begin (setref! (a-ref 1 v) 0) (list (deref (a-ref 1 w)) (misma-celda? (a-ref 1 v) (a-ref 1 w)))))", esperado: "(9 #f)" },
        { llamada: "(let ((v (list->vector '(5 5 5)))) (misma-celda? (a-ref 0 v) (a-ref 1 v)))", esperado: "#f" },
        { llamada: "(let ((v (list->vector '(1 9 4)))) (let ((r (a-ref 1 v))) (begin (setref! r 30) (misma-celda? r (a-ref 1 v)))))", esperado: "#t" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (llamada.indexOf("(w (list->vector") !== -1 && obtenido.indexOf("#t") !== -1) {
          return "v y w tienen los mismos números pero son dos vectores. " +
            "Comparar los contenidos, o los vectores con equal?, los da por " +
            "iguales; eq? pregunta si son el mismo objeto.";
        }
        if (llamada.indexOf("'(5 5 5)") !== -1 && obtenido === "#t") {
          return "Se compararon contenidos: las tres celdas guardan 5. Lo que " +
            "distingue una celda de otra es su posición en el vector.";
        }
        if (llamada.indexOf("(a-ref 2 v) (a-ref 2 v)") !== -1 && obtenido === "#f") {
          return "Las dos referencias son valores distintos, así que eq? " +
            "sobre r1 y r2 da #f. Se comparan sus campos: el vector con eq? " +
            "y la posición con =.";
        }
        return "Hacen falta las dos condiciones: (eq? vec1 vec2) y " +
          "(= pos1 pos2).";
      },
      cierre:
        "Con equal? sobre los vectores, la tercera prueba habría dado #t, y " +
        "la cuarta muestra por qué está mal: se escribió 0 por v y w sigue " +
        "guardando 9. Una ubicación es un lugar, no un contenido; dos lugares " +
        "con el mismo número siguen siendo dos lugares."
    },
    {
      id: "referencia-intercambiar",
      titulo: "3. Intercambiar dos celdas sin tocar vectores",
      enunciado:
        "Un cliente del TAD solo usa <code>deref</code> y " +
        "<code>setref!</code>. Escriba <code>intercambiar!</code>, que pone en " +
        "<code>r1</code> lo que tenía <code>r2</code> y al revés, guardando " +
        "antes una lectura con <code>let</code>. Complete también " +
        "<code>intercambiar-suma!</code>, que lo hace sin guardar nada, con " +
        "tres escrituras: r1 recibe r1 + r2, r2 recibe r1 − r2 y r1 recibe " +
        "r1 − r2. Con dos celdas distintas las dos versiones dan lo mismo. Las " +
        "dos últimas pruebas le pasan a cada versión la misma celda dos veces: " +
        "es el aliasing que aparece con el paso por referencia (EOPL §4.3), " +
        "cuando dos nombres denotan una sola ubicación.",
      gramatica: DATATYPE_REF,
      esqueleto:
        DATATYPE_REF + PRIMITIVAS + "\n" +
        "(define intercambiar!\n" +
        "  (lambda (r1 r2)\n" +
        "    (let ((guardado ???))\n" +
        "      (begin\n" +
        "        (setref! r1 ???)\n" +
        "        (setref! r2 ???)))))\n" +
        "\n" +
        "(define intercambiar-suma!\n" +
        "  (lambda (r1 r2)\n" +
        "    (begin\n" +
        "      (setref! r1 (+ (deref r1) (deref r2)))\n" +
        "      (setref! r2 ???)\n" +
        "      (setref! r1 ???))))\n",
      pruebas: [
        { llamada: "(let ((v (list->vector '(5 0 12)))) (begin (intercambiar! (a-ref 0 v) (a-ref 2 v)) v))", esperado: "#(12 0 5)" },
        { llamada: "(let ((v (list->vector '(5 0 12))) (w (list->vector '(7 3)))) (begin (intercambiar! (a-ref 1 v) (a-ref 0 w)) (list v w)))", esperado: "(#(5 7 12) #(0 3))" },
        { llamada: "(let ((v (list->vector '(5 0 12)))) (begin (intercambiar-suma! (a-ref 0 v) (a-ref 2 v)) v))", esperado: "#(12 0 5)" },
        { llamada: "(let ((v (list->vector '(5 0 12)))) (let ((r (a-ref 2 v))) (begin (intercambiar! r r) (deref r))))", esperado: "12" },
        { llamada: "(let ((v (list->vector '(5 0 12)))) (begin (intercambiar-suma! (a-ref 2 v) (a-ref 2 v)) v))", esperado: "#(5 0 0)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (obtenido === "#(12 0 12)" || obtenido === "(#(5 7 12) #(7 3))") {
          return "La segunda escritura leyó r1 cuando ya tenía el valor " +
            "nuevo. Lo que va a r2 es lo guardado antes de escribir.";
        }
        if (obtenido === "#(5 0 5)" || obtenido === "(#(5 0 12) #(0 3))") {
          return "La primera escritura puso en r1 lo mismo que ya tenía. Lo " +
            "guardado es el valor de r1; r1 recibe lo que hay en r2.";
        }
        if (llamada.indexOf("intercambiar-suma!") !== -1 && obtenido === "#(5 0 12)") {
          return "intercambiar-suma! tiene que hacer las tres escrituras de " +
            "sumas y restas, sin guardar nada. Esta prueba mide justo qué " +
            "pasa con ellas cuando r1 y r2 son la misma celda.";
        }
        if (llamada.indexOf("intercambiar-suma!") !== -1) {
          return "Después de la primera escritura r1 tiene la suma. r2 " +
            "recibe esa suma menos r2, que es el r1 viejo, y r1 recibe la " +
            "suma menos el r2 nuevo.";
        }
        return "Se guarda (deref r1), r1 recibe (deref r2) y r2 recibe lo " +
          "guardado.";
      },
      cierre:
        "Con la misma celda dos veces, intercambiar! la deja en 12 y " +
        "intercambiar-suma! la deja en 0: la primera escritura la sube a 24 " +
        "y la segunda resta la celda de sí misma. Las dos a-ref de la última " +
        "prueba son valores distintos y el aliasing aparece igual, porque lo " +
        "que cuenta es la celda que denotan."
    },
    {
      id: "referencia-incrementar",
      titulo: "4. Incrementar las celdas de una lista",
      enunciado:
        "<code>incrementar!</code> suma uno al contenido de una referencia. " +
        "<code>incrementar-todas!</code> recorre una lista de referencias, " +
        "incrementa cada una y lee su contenido justo después, y devuelve la " +
        "lista de esas lecturas. <code>contenidos</code> lee una lista de " +
        "referencias sin cambiar nada. Cuando una celda aparece dos veces en " +
        "la lista se incrementa dos veces, y la lectura de la primera " +
        "aparición ya no coincide con lo que la celda guarda al final.",
      gramatica: DATATYPE_REF,
      esqueleto:
        DATATYPE_REF + PRIMITIVAS + "\n" +
        "(define incrementar!\n" +
        "  (lambda (r)\n" +
        "    (setref! r ???)))\n" +
        "\n" +
        "(define incrementar-todas!\n" +
        "  (lambda (refs)\n" +
        "    (if (null? refs)\n" +
        "        '()\n" +
        "        (begin\n" +
        "          (incrementar! (car refs))\n" +
        "          (cons ??? ???)))))\n" +
        "\n" +
        "(define contenidos\n" +
        "  (lambda (refs)\n" +
        "    (if (null? refs)\n" +
        "        '()\n" +
        "        (cons ??? ???))))\n",
      pruebas: [
        { llamada: "(let ((v (list->vector '(2 7 0)))) (begin (incrementar! (a-ref 1 v)) v))", esperado: "#(2 8 0)" },
        { llamada: "(let ((v (list->vector '(2 7 0)))) (contenidos (list (a-ref 2 v) (a-ref 0 v))))", esperado: "(0 2)" },
        { llamada: "(incrementar-todas! '())", esperado: "()" },
        { llamada: "(let ((v (list->vector '(2 7 0)))) (incrementar-todas! (list (a-ref 0 v) (a-ref 1 v))))", esperado: "(3 8)" },
        { llamada: "(let ((v (list->vector '(2 7 0)))) (let ((a (a-ref 0 v)) (c (a-ref 2 v))) (incrementar-todas! (list a c a))))", esperado: "(3 1 4)" },
        { llamada: "(let ((v (list->vector '(2 7 0)))) (let ((a (a-ref 0 v)) (c (a-ref 2 v))) (begin (incrementar-todas! (list a c a)) (contenidos (list a c a)))))", esperado: "(4 1 4)" },
        { llamada: "(let ((v (list->vector '(2 7 0)))) (begin (incrementar-todas! (list (a-ref 0 v) (a-ref 2 v) (a-ref 0 v))) v))", esperado: "#(4 7 1)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (llamada.indexOf("(incrementar! (a-ref 1 v))") !== -1 && obtenido === "#(2 7 0)") {
          return "La celda no cambió. incrementar! escribe en r su " +
            "contenido más uno: (+ (deref r) 1).";
        }
        if (obtenido === "(4 9)" || obtenido === "(4 2 5)") {
          return "Se sumó uno dos veces. Cuando se lee, incrementar! ya " +
            "escribió: basta con (deref (car refs)).";
        }
        if (obtenido === "(2 7)" || obtenido === "(2 0 3)") {
          return "Esa lectura es la de antes de incrementar. El begin ya " +
            "incrementó la celda, así que deref ve el valor nuevo.";
        }
        if (llamada.indexOf("(contenidos (list a c a))") !== -1) {
          return "contenidos solo lee: (deref (car refs)) delante de lo que " +
            "devuelva el resto de la lista.";
        }
        return "Las dos funciones recorren la lista con cons: la lectura de " +
          "la primera referencia delante de la llamada sobre el cdr.";
      },
      cierre:
        "En (list a c a) la misma referencia aparece dos veces y deja dos lecturas " +
        "distintas, 3 y 4, porque la segunda vez la celda ya había cambiado. " +
        "Leídas al final, las dos dicen 4. La última prueba usa dos a-ref " +
        "distintas para la celda 0 y el resultado no cambia: el vector " +
        "termina en #(4 7 1)."
    },
    {
      id: "referencia-copiar",
      titulo: "5. Copiar una celda o compartirla",
      enunciado:
        "<code>compartir</code> devuelve una referencia nueva a la misma " +
        "celda; <code>copiar</code> devuelve una referencia a la celda 0 de un " +
        "vector nuevo de una sola celda, con el mismo contenido. " +
        "<code>poner-99!</code> escribe 99 en la referencia que recibe, como " +
        "un procedimiento que hace <code>set</code> sobre su parámetro, y " +
        "<code>llamar</code> se la entrega pasada por <code>copiar</code> o " +
        "por <code>compartir</code> y después lee la referencia original. En " +
        "miniatura, son las dos maneras de pasar un argumento: por valor y " +
        "por referencia (EOPL §4.3).",
      gramatica: DATATYPE_REF,
      esqueleto:
        DATATYPE_REF + PRIMITIVAS + MISMA_CELDA + "\n" +
        "(define compartir\n" +
        "  (lambda (r)\n" +
        "    (cases referencia r\n" +
        "      (a-ref (pos vec) ???))))\n" +
        "\n" +
        "(define copiar\n" +
        "  (lambda (r)\n" +
        "    (a-ref 0 (list->vector (list ???)))))\n" +
        "\n" +
        "(define poner-99!\n" +
        "  (lambda (r) (setref! r 99)))\n" +
        "\n" +
        "(define llamar\n" +
        "  (lambda (pasar r)\n" +
        "    (begin\n" +
        "      (poner-99! (pasar r))\n" +
        "      (deref r))))\n",
      pruebas: [
        { llamada: "(copiar (a-ref 1 (list->vector '(6 13 1))))", esperado: "(a-ref 0 #(13))" },
        { llamada: "(compartir (a-ref 1 (list->vector '(6 13 1))))", esperado: "(a-ref 1 #(6 13 1))" },
        { llamada: "(let ((r (a-ref 1 (list->vector '(6 13 1))))) (misma-celda? (compartir r) r))", esperado: "#t" },
        { llamada: "(let ((r (a-ref 1 (list->vector '(6 13 1))))) (misma-celda? (copiar r) r))", esperado: "#f" },
        { llamada: "(let ((r (a-ref 1 (list->vector '(6 13 1))))) (llamar copiar r))", esperado: "13" },
        { llamada: "(let ((r (a-ref 1 (list->vector '(6 13 1))))) (llamar compartir r))", esperado: "99" },
        { llamada: "(let ((v (list->vector '(6 13 1)))) (begin (llamar copiar (a-ref 0 v)) (llamar compartir (a-ref 2 v)) v))", esperado: "#(6 13 99)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (llamada.indexOf("(copiar (a-ref 1") === 0 && obtenido === "(a-ref 0 #(6))") {
          return "Se copió la celda 0 del vector original. Lo que se copia " +
            "es el contenido de r, (deref r), que está en la posición 1.";
        }
        if (llamada.indexOf("(copiar (a-ref 1") === 0 && obtenido.indexOf("#((a-ref") !== -1) {
          return "En el vector nuevo quedó la referencia misma. Lo que va en " +
            "la celda es el número que r guarda: (deref r).";
        }
        if ((llamada.indexOf("(compartir (a-ref 1") === 0 && obtenido.indexOf("#(6 13 1)") === -1) ||
            (llamada.indexOf("(misma-celda? (compartir r) r)") !== -1 && obtenido === "#f")) {
          return "compartir armó otro vector. Tiene que reusar vec y pos: " +
            "(a-ref pos vec).";
        }
        if (llamada.indexOf("(misma-celda? (copiar r) r)") !== -1 && obtenido === "#t") {
          return "copiar devolvió la misma celda. Su referencia apunta a un " +
            "vector recién armado con list->vector.";
        }
        if (obtenido === "99" || obtenido === "#(6 13 1)" || obtenido === "#(99 13 99)") {
          return "Revise cuál de las dos arma un vector nuevo: la escritura de " +
            "poner-99! solo llega a la celda original a través de compartir.";
        }
        return "compartir devuelve (a-ref pos vec); copiar pone (deref r) " +
          "en un vector de una celda.";
      },
      cierre:
        "Con copiar, poner-99! escribe en un vector que nadie más ve y la " +
        "celda original sigue en 13. Es lo que hace el intérprete con " +
        "asignación al aplicar una clausura, porque ambiente-extendido arma un " +
        "vector nuevo para los argumentos: let p = proc(u) set u = 99 in let " +
        "w = 13 in begin (p w); w end vale 13 allí y 99 en el intérprete con " +
        "paso por referencia, donde el parámetro recibe la celda de w."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = RETOS; }

/* --- Interfaz ----------------------------------------------------- */
if (typeof document !== "undefined") {
  MotorRetos.montar({ retos: RETOS, destino: "retos", cierre: "carta-cierre" });
  MotorRetos.montarConsola();
}
