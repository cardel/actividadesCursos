/* Asignación (EOPL §4.2). Cuatro retos de cierre sobre un intérprete pequeño
   con paso por valor y celdas en vectores: la cláusula de begin-exp, la de
   set-exp, una forma nueva (incr) con su producción, su variante y su
   cláusula, y un recorrido estático que cuenta los set escritos para
   compararlos con los que se ejecutan. El código del estudiante corre sobre
   mini-scheme.js. */
var GRAMATICA =
  "&lt;expresion&gt; ::= &lt;numero&gt;                                      lit-exp (dato)\n" +
  "            ::= &lt;identificador&gt;                               var-exp (id)\n" +
  "            ::= &lt;primitiva&gt; ( {&lt;expresion&gt;}*(,) )             prim-exp (prim args)\n" +
  "            ::= let {&lt;identificador&gt; = &lt;expresion&gt;}* in &lt;expresion&gt;   let-exp\n" +
  "            ::= proc ( {&lt;identificador&gt;}*(,) ) &lt;expresion&gt;    proc-exp (ids cuerpo)\n" +
  "            ::= ( &lt;expresion&gt; {&lt;expresion&gt;}* )                app-exp (rator rands)\n" +
  "            ::= begin &lt;expresion&gt; {; &lt;expresion&gt;}* end        begin-exp (primera resto)\n" +
  "            ::= set &lt;identificador&gt; = &lt;expresion&gt;             set-exp (id rhs)\n" +
  "&lt;primitiva&gt;  ::= + | - | * | add1 | sub1";

var VARIANTES =
  "  (lit-exp   (dato number?))\n" +
  "  (var-exp   (id symbol?))\n" +
  "  (prim-exp  (prim symbol?) (args (list-of expresion?)))\n" +
  "  (let-exp   (ids (list-of symbol?)) (rands (list-of expresion?)) (cuerpo expresion?))\n" +
  "  (proc-exp  (ids (list-of symbol?)) (cuerpo expresion?))\n" +
  "  (app-exp   (rator expresion?) (rands (list-of expresion?)))\n" +
  "  (begin-exp (primera expresion?) (resto (list-of expresion?)))\n" +
  "  (set-exp   (id symbol?) (rhs expresion?))";

var DATATYPE = "(define-datatype expresion expresion?\n" + VARIANTES + ")\n";

var DATATYPE_INCR =
  "(define-datatype expresion expresion?\n" + VARIANTES + "\n" +
  "  ;; La variante nueva va aquí.\n" +
  "  ???)\n";

var ALMACEN =
  "\n;; Paso por valor: cada celda del vector guarda el valor mismo (EOPL §4.2).\n" +
  "(define-datatype referencia referencia?\n" +
  "  (a-ref (pos number?) (vec vector?)))\n" +
  "\n" +
  "(define deref\n" +
  "  (lambda (ref)\n" +
  "    (cases referencia ref\n" +
  "      (a-ref (pos vec) (vector-ref vec pos)))))\n" +
  "\n" +
  "(define setref!\n" +
  "  (lambda (ref val)\n" +
  "    (cases referencia ref\n" +
  "      (a-ref (pos vec) (vector-set! vec pos val)))))\n" +
  "\n" +
  "(define-datatype ambiente ambiente?\n" +
  "  (ambiente-vacio)\n" +
  "  (ambiente-extendido-ref (lids (list-of symbol?)) (vec vector?) (viejo ambiente?)))\n" +
  "\n" +
  "(define ambiente-extendido\n" +
  "  (lambda (lids vals viejo)\n" +
  "    (ambiente-extendido-ref lids (list->vector vals) viejo)))\n" +
  "\n" +
  "(define apply-env-ref\n" +
  "  (lambda (amb id)\n" +
  "    (cases ambiente amb\n" +
  "      (ambiente-vacio () (error 'apply-env-ref \"sin ligadura para\" id))\n" +
  "      (ambiente-extendido-ref (lids vec viejo) (buscar-ref id lids vec 0 viejo)))))\n" +
  "\n" +
  "(define buscar-ref\n" +
  "  (lambda (id lids vec pos viejo)\n" +
  "    (cond ((null? lids) (apply-env-ref viejo id))\n" +
  "          ((eq? id (car lids)) (a-ref pos vec))\n" +
  "          (else (buscar-ref id (cdr lids) vec (+ pos 1) viejo)))))\n" +
  "\n" +
  "(define apply-env\n" +
  "  (lambda (amb id) (deref (apply-env-ref amb id))))\n" +
  "\n" +
  "(define-datatype procval procval?\n" +
  "  (closure (ids (list-of symbol?)) (cuerpo expresion?) (amb ambiente?)))\n" +
  "\n" +
  ";; x = 4, y = 2, z = 5 sobre a = 4, b = 5, c = 6. Se arma de nuevo en cada\n" +
  ";; corrida, para que un set de una prueba no pase a la siguiente.\n" +
  "(define ambiente-inicial\n" +
  "  (lambda ()\n" +
  "    (ambiente-extendido '(x y z) (list 4 2 5)\n" +
  "      (ambiente-extendido '(a b c) (list 4 5 6) (ambiente-vacio)))))\n" +
  "\n" +
  "(define evaluar-programa\n" +
  "  (lambda (exp) (evaluar-expresion exp (ambiente-inicial))))\n" +
  "\n" +
  "(define aplicar-primitiva\n" +
  "  (lambda (prim vals)\n" +
  "    (cond ((eq? prim '+) (+ (car vals) (cadr vals)))\n" +
  "          ((eq? prim '-) (- (car vals) (cadr vals)))\n" +
  "          ((eq? prim '*) (* (car vals) (cadr vals)))\n" +
  "          ((eq? prim 'add1) (+ (car vals) 1))\n" +
  "          ((eq? prim 'sub1) (- (car vals) 1))\n" +
  "          (else (error 'aplicar-primitiva \"primitiva desconocida\" prim)))))\n" +
  "\n" +
  "(define evaluar-rands\n" +
  "  (lambda (rands amb)\n" +
  "    (if (null? rands)\n" +
  "        '()\n" +
  "        (cons (evaluar-expresion (car rands) amb)\n" +
  "              (evaluar-rands (cdr rands) amb)))))\n";

var SECUENCIA =
  "\n(define evaluar-secuencia\n" +
  "  (lambda (primera resto amb)\n" +
  "    (if (null? resto)\n" +
  "        (evaluar-expresion primera amb)\n" +
  "        (begin\n" +
  "          (evaluar-expresion primera amb)\n" +
  "          (evaluar-secuencia (car resto) (cdr resto) amb)))))\n";

var SET_RESUELTO =
  "      (set-exp (id rhs)\n" +
  "        (begin\n" +
  "          (setref! (apply-env-ref amb id) (evaluar-expresion rhs amb))\n" +
  "          1))";

/* El evaluador entero, con la cláusula de set-exp y lo que va después de
   ella como piezas que cambian de un reto a otro. */
function evaluador(clausulaSet, extra) {
  return "\n(define evaluar-expresion\n" +
    "  (lambda (exp amb)\n" +
    "    (cases expresion exp\n" +
    "      (lit-exp (dato) dato)\n" +
    "      (var-exp (id) (apply-env amb id))\n" +
    "      (prim-exp (prim args) (aplicar-primitiva prim (evaluar-rands args amb)))\n" +
    "      (let-exp (ids rands cuerpo)\n" +
    "        (evaluar-expresion cuerpo (ambiente-extendido ids (evaluar-rands rands amb) amb)))\n" +
    "      (proc-exp (ids cuerpo) (closure ids cuerpo amb))\n" +
    "      (app-exp (rator rands)\n" +
    "        (let ((args (evaluar-rands rands amb))\n" +
    "              (proc (evaluar-expresion rator amb)))\n" +
    "          (cases procval proc\n" +
    "            (closure (ids cuerpo amb-clausura)\n" +
    "              (evaluar-expresion cuerpo (ambiente-extendido ids args amb-clausura))))))\n" +
    "      (begin-exp (primera resto) (evaluar-secuencia primera resto amb))\n" +
    clausulaSet + extra + ")))\n";
}

var PROG_SECUENCIA =
  "\n;; begin +(x, 1); *(y, 10) end\n" +
  "(define sec-suma\n" +
  "  (begin-exp (prim-exp '+ (list (var-exp 'x) (lit-exp 1)))\n" +
  "             (list (prim-exp '* (list (var-exp 'y) (lit-exp 10))))))\n" +
  "\n" +
  ";; begin z end\n" +
  "(define sec-una (begin-exp (var-exp 'z) '()))\n" +
  "\n" +
  ";; let w = 8 in begin set w = *(w, w); w end\n" +
  "(define sec-cuadrado\n" +
  "  (let-exp '(w) (list (lit-exp 8))\n" +
  "    (begin-exp (set-exp 'w (prim-exp '* (list (var-exp 'w) (var-exp 'w))))\n" +
  "               (list (var-exp 'w)))))\n" +
  "\n" +
  ";; let w = 8 in begin w; set w = 0 end\n" +
  "(define sec-termina-en-set\n" +
  "  (let-exp '(w) (list (lit-exp 8))\n" +
  "    (begin-exp (var-exp 'w) (list (set-exp 'w (lit-exp 0))))))\n" +
  "\n" +
  ";; let w = 8 in begin set w = add1(w); set w = *(w, 2); w end\n" +
  "(define sec-dos-sets\n" +
  "  (let-exp '(w) (list (lit-exp 8))\n" +
  "    (begin-exp (set-exp 'w (prim-exp 'add1 (list (var-exp 'w))))\n" +
  "               (list (set-exp 'w (prim-exp '* (list (var-exp 'w) (lit-exp 2))))\n" +
  "                     (var-exp 'w)))))\n";

var PROG_SET =
  "\n;; let w = 8 in set w = 0\n" +
  "(define asig-uno\n" +
  "  (let-exp '(w) (list (lit-exp 8)) (set-exp 'w (lit-exp 0))))\n" +
  "\n" +
  ";; let w = 8 in begin set w = -(w, 3); w end\n" +
  "(define asig-resta\n" +
  "  (let-exp '(w) (list (lit-exp 8))\n" +
  "    (begin-exp (set-exp 'w (prim-exp '- (list (var-exp 'w) (lit-exp 3))))\n" +
  "               (list (var-exp 'w)))))\n" +
  "\n" +
  ";; begin set x = +(x, y); x end\n" +
  "(define asig-inicial\n" +
  "  (begin-exp (set-exp 'x (prim-exp '+ (list (var-exp 'x) (var-exp 'y))))\n" +
  "             (list (var-exp 'x))))\n" +
  "\n" +
  ";; let w = 8 in +(set w = 2, w)\n" +
  "(define asig-en-suma\n" +
  "  (let-exp '(w) (list (lit-exp 8))\n" +
  "    (prim-exp '+ (list (set-exp 'w (lit-exp 2)) (var-exp 'w)))))\n" +
  "\n" +
  ";; let cuenta = 0\n" +
  ";; in let tick = proc() begin set cuenta = add1(cuenta); cuenta end\n" +
  ";;    in begin (tick); (tick); (tick) end\n" +
  "(define asig-contador\n" +
  "  (let-exp '(cuenta) (list (lit-exp 0))\n" +
  "    (let-exp '(tick)\n" +
  "             (list (proc-exp '()\n" +
  "                     (begin-exp (set-exp 'cuenta (prim-exp 'add1 (list (var-exp 'cuenta))))\n" +
  "                                (list (var-exp 'cuenta)))))\n" +
  "      (begin-exp (app-exp (var-exp 'tick) '())\n" +
  "                 (list (app-exp (var-exp 'tick) '())\n" +
  "                       (app-exp (var-exp 'tick) '()))))))\n" +
  "\n" +
  ";; let doblar = proc(k) begin set k = *(k, 2); k end\n" +
  ";; in let n = 7\n" +
  ";;    in +((doblar n), n)\n" +
  "(define asig-por-valor\n" +
  "  (let-exp '(doblar)\n" +
  "           (list (proc-exp '(k)\n" +
  "                   (begin-exp (set-exp 'k (prim-exp '* (list (var-exp 'k) (lit-exp 2))))\n" +
  "                              (list (var-exp 'k)))))\n" +
  "    (let-exp '(n) (list (lit-exp 7))\n" +
  "      (prim-exp '+ (list (app-exp (var-exp 'doblar) (list (var-exp 'n)))\n" +
  "                         (var-exp 'n))))))\n";

var PROG_INCR =
  "\n;; let v = 4 in incr v\n" +
  "(define incr-solo\n" +
  "  (let-exp '(v) (list (lit-exp 4)) (incr-exp 'v)))\n" +
  "\n" +
  ";; let v = 4 in begin incr v; v end\n" +
  "(define incr-luego-lee\n" +
  "  (let-exp '(v) (list (lit-exp 4))\n" +
  "    (begin-exp (incr-exp 'v) (list (var-exp 'v)))))\n" +
  "\n" +
  ";; let v = 4 in +(incr v, v)\n" +
  "(define incr-en-suma\n" +
  "  (let-exp '(v) (list (lit-exp 4))\n" +
  "    (prim-exp '+ (list (incr-exp 'v) (var-exp 'v)))))\n" +
  "\n" +
  ";; begin incr x; incr x; x end\n" +
  "(define incr-inicial\n" +
  "  (begin-exp (incr-exp 'x) (list (incr-exp 'x) (var-exp 'x))))\n" +
  "\n" +
  ";; let n = 0\n" +
  ";; in let siguiente = proc() incr n\n" +
  ";;    in begin (siguiente); (siguiente); (siguiente) end\n" +
  "(define incr-contador\n" +
  "  (let-exp '(n) (list (lit-exp 0))\n" +
  "    (let-exp '(siguiente) (list (proc-exp '() (incr-exp 'n)))\n" +
  "      (begin-exp (app-exp (var-exp 'siguiente) '())\n" +
  "                 (list (app-exp (var-exp 'siguiente) '())\n" +
  "                       (app-exp (var-exp 'siguiente) '()))))))\n" +
  "\n" +
  ";; let sube = proc(k) incr k\n" +
  ";; in let m = 10\n" +
  ";;    in begin (sube m); m end\n" +
  "(define incr-por-valor\n" +
  "  (let-exp '(sube) (list (proc-exp '(k) (incr-exp 'k)))\n" +
  "    (let-exp '(m) (list (lit-exp 10))\n" +
  "      (begin-exp (app-exp (var-exp 'sube) (list (var-exp 'm)))\n" +
  "                 (list (var-exp 'm))))))\n";

var PROG_CONTAR =
  "\n;; let w = 8 in begin set w = 1; set w = 2; w end\n" +
  "(define recta\n" +
  "  (let-exp '(w) (list (lit-exp 8))\n" +
  "    (begin-exp (set-exp 'w (lit-exp 1))\n" +
  "               (list (set-exp 'w (lit-exp 2)) (var-exp 'w)))))\n" +
  "\n" +
  ";; let w = 0 in let v = 0 in set w = begin set v = 4; add1(v) end\n" +
  "(define anidado\n" +
  "  (let-exp '(w) (list (lit-exp 0))\n" +
  "    (let-exp '(v) (list (lit-exp 0))\n" +
  "      (set-exp 'w (begin-exp (set-exp 'v (lit-exp 4))\n" +
  "                             (list (prim-exp 'add1 (list (var-exp 'v)))))))))\n" +
  "\n" +
  ";; let cuenta = 0\n" +
  ";; in let tick = proc() set cuenta = add1(cuenta)\n" +
  ";;    in begin (tick); (tick); (tick); cuenta end\n" +
  "(define tres-llamadas\n" +
  "  (let-exp '(cuenta) (list (lit-exp 0))\n" +
  "    (let-exp '(tick)\n" +
  "             (list (proc-exp '() (set-exp 'cuenta (prim-exp 'add1 (list (var-exp 'cuenta))))))\n" +
  "      (begin-exp (app-exp (var-exp 'tick) '())\n" +
  "                 (list (app-exp (var-exp 'tick) '())\n" +
  "                       (app-exp (var-exp 'tick) '())\n" +
  "                       (var-exp 'cuenta))))))\n" +
  "\n" +
  ";; let w = 1 in let borra = proc(k) set w = 0 in w\n" +
  "(define nunca-llamado\n" +
  "  (let-exp '(w) (list (lit-exp 1))\n" +
  "    (let-exp '(borra) (list (proc-exp '(k) (set-exp 'w (lit-exp 0))))\n" +
  "      (var-exp 'w))))\n" +
  "\n" +
  ";; let w = 0\n" +
  ";; in let doble = proc(k) begin set k = *(k, 2); set w = add1(w); k end\n" +
  ";;    in (doble (doble (doble 1)))\n" +
  "(define doble-tres\n" +
  "  (let-exp '(w) (list (lit-exp 0))\n" +
  "    (let-exp '(doble)\n" +
  "             (list (proc-exp '(k)\n" +
  "                     (begin-exp (set-exp 'k (prim-exp '* (list (var-exp 'k) (lit-exp 2))))\n" +
  "                                (list (set-exp 'w (prim-exp 'add1 (list (var-exp 'w))))\n" +
  "                                      (var-exp 'k)))))\n" +
  "      (app-exp (var-exp 'doble)\n" +
  "               (list (app-exp (var-exp 'doble)\n" +
  "                              (list (app-exp (var-exp 'doble) (list (lit-exp 1))))))))))\n";

var RETOS = (function () {
  "use strict";
  return [
    {
      id: "cierre-begin",
      titulo: "1. La secuencia de begin",
      enunciado:
        "<code>begin</code> evalúa sus expresiones de izquierda a derecha, " +
        "descarta los valores intermedios y devuelve el de la última (EOPL " +
        "§4.2). Los intermedios solo interesan por su efecto. Escriba " +
        "<code>evaluar-secuencia</code>, que recibe la primera expresión y la " +
        "lista de las que siguen, tal como las reparte la variante " +
        "<code>begin-exp</code>. El resto del intérprete ya está, incluido " +
        "<code>set</code>, que devuelve 1. Cada programa va escrito en la " +
        "sintaxis del lenguaje encima de su árbol.",
      gramatica: GRAMATICA,
      esqueleto:
        DATATYPE + ALMACEN + evaluador(SET_RESUELTO, "") +
        "\n(define evaluar-secuencia\n" +
        "  (lambda (primera resto amb)\n" +
        "    (if (null? resto)\n" +
        "        ???\n" +
        "        (begin\n" +
        "          ???\n" +
        "          ???))))\n" +
        PROG_SECUENCIA,
      pruebas: [
        { llamada: "(evaluar-programa sec-suma)", esperado: "20" },
        { llamada: "(evaluar-programa sec-una)", esperado: "5" },
        { llamada: "(evaluar-programa sec-cuadrado)", esperado: "64" },
        { llamada: "(evaluar-programa sec-termina-en-set)", esperado: "1" },
        { llamada: "(evaluar-programa sec-dos-sets)", esperado: "18" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (llamada === "(evaluar-programa sec-suma)" && obtenido === "5") {
          return "5 es el valor de +(x, 1), la primera expresión. El begin " +
            "devuelve el valor de la última.";
        }
        if (llamada === "(evaluar-programa sec-cuadrado)" && obtenido === "8") {
          return "w siguió en 8: el set no se ejecutó. Las expresiones que no " +
            "son la última también se evalúan, por su efecto, aunque su valor " +
            "se descarte.";
        }
        if (llamada === "(evaluar-programa sec-dos-sets)" && obtenido === "1") {
          return "Se evaluaron solo las dos primeras expresiones, y la segunda " +
            "era un set que vale 1. La recursión sigue hasta que el resto " +
            "quede vacío.";
        }
        return "Con resto vacío se evalúa primera y ese es el valor. Si no, " +
          "se evalúa primera por su efecto y se sigue con (car resto) y " +
          "(cdr resto).";
      },
      cierre:
        "begin z end vale 5 porque una sola expresión ya es la última. En " +
        "sec-termina-en-set el valor es 1 aunque w valga 0 al final: el begin " +
        "entrega lo que devolvió su última expresión, no el estado que deja. " +
        "Y los dos set de sec-dos-sets dan 18 y no 17 porque el orden es " +
        "parte del significado."
    },
    {
      id: "cierre-set",
      titulo: "2. La asignación",
      enunciado:
        "Para evaluar <code>set id = rhs</code> se obtiene la referencia de " +
        "<code>id</code> con <code>apply-env-ref</code>, después se evalúa " +
        "<code>rhs</code> en el mismo ambiente, se escribe el valor con " +
        "<code>setref!</code> y se devuelve 1 (EOPL §4.2). La expresión " +
        "interesa por su efecto. Complete la cláusula de " +
        "<code>set-exp</code>. Los parámetros pasan por valor: cada " +
        "aplicación crea celdas nuevas con copias de los argumentos.",
      gramatica: GRAMATICA,
      esqueleto:
        DATATYPE + ALMACEN + SECUENCIA +
        evaluador(
          "      (set-exp (id rhs)\n" +
          "        (begin\n" +
          "          (setref! ??? ???)\n" +
          "          ???))", "") +
        PROG_SET,
      pruebas: [
        { llamada: "(evaluar-programa asig-uno)", esperado: "1" },
        { llamada: "(evaluar-programa asig-resta)", esperado: "5" },
        { llamada: "(evaluar-programa asig-inicial)", esperado: "6" },
        { llamada: "(evaluar-programa asig-en-suma)", esperado: "3" },
        { llamada: "(evaluar-programa asig-contador)", esperado: "3" },
        { llamada: "(evaluar-programa asig-por-valor)", esperado: "21" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (llamada === "(evaluar-programa asig-uno)" && obtenido === "0") {
          return "Se devolvió el valor asignado. set devuelve 1, sin importar " +
            "lo que escriba.";
        }
        return "setref! recibe (apply-env-ref amb id) y el valor de rhs " +
          "evaluado en amb; después del setref! va el 1.";
      },
      cierre:
        "+(set w = 2, w) vale 3: el set aporta su 1 y la w de la derecha ya " +
        "lee 2, porque los argumentos se evalúan de izquierda a derecha. El " +
        "contador llega a 3 porque la clausura de tick guarda el ambiente con " +
        "la celda de cuenta. Y asig-por-valor da 21: doblar duplicó su copia, " +
        "n siguió en 7. Con paso por referencia el mismo programa da 28."
    },
    {
      id: "cierre-incr",
      titulo: "3. Una forma nueva: incr",
      enunciado:
        "Se extiende el lenguaje con <code>incr v</code>, que suma 1 a la " +
        "variable y devuelve el valor que tenía antes. En la especificación " +
        "de SLLGEN es una producción más: " +
        "<code>(expresion (\"incr\" identificador) incr-exp)</code>. De ahí " +
        "salen dos cambios a mano. El primero es la variante del datatype, con " +
        "el nombre que da la producción y un campo para el identificador. El " +
        "segundo es la cláusula del evaluador: obtener la referencia, leer el " +
        "valor anterior, escribir el siguiente y devolver el anterior. Los " +
        "árboles de las pruebas usan <code>(incr-exp 'v)</code>.",
      gramatica: GRAMATICA,
      esqueleto:
        DATATYPE_INCR + ALMACEN + SECUENCIA +
        evaluador(SET_RESUELTO,
          "\n      ;; La cláusula de incr-exp va aquí.\n" +
          "      ???") +
        PROG_INCR,
      pruebas: [
        { llamada: "(evaluar-programa incr-solo)", esperado: "4" },
        { llamada: "(evaluar-programa incr-luego-lee)", esperado: "5" },
        { llamada: "(evaluar-programa incr-en-suma)", esperado: "9" },
        { llamada: "(evaluar-programa incr-inicial)", esperado: "6" },
        { llamada: "(evaluar-programa incr-contador)", esperado: "2" },
        { llamada: "(evaluar-programa incr-por-valor)", esperado: "10" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (llamada === "(evaluar-programa incr-solo)" && obtenido === "5") {
          return "Se devolvió el valor nuevo. incr devuelve el que había antes " +
            "de escribir: hay que leerlo y guardarlo en un let.";
        }
        if (llamada === "(evaluar-programa incr-luego-lee)" && obtenido === "4") {
          return "v sigue en 4: falta escribir. El valor siguiente se guarda " +
            "con setref! sobre la misma referencia.";
        }
        return "La variante es (incr-exp (id symbol?)). La cláusula hace un " +
          "let con la referencia, otro con el valor anterior, un setref! con " +
          "ese valor más 1 y devuelve el anterior.";
      },
      cierre:
        "+(incr v, v) vale 9: el incr aporta 4 y la v de la derecha ya lee 5. " +
        "En incr-por-valor, m sigue en 10 porque sube incrementó su copia. La " +
        "producción tiene un costo que no se ve en el evaluador: SLLGEN " +
        "vuelve palabra reservada a incr, y let incr = 1 in incr, que antes " +
        "valía 1, deja de parsearse. let incrx = 1 in incrx sí se parsea."
    },
    {
      id: "cierre-contar",
      titulo: "4. Asignaciones escritas y asignaciones ejecutadas",
      enunciado:
        "Un set escrito una vez puede ejecutarse muchas veces, o ninguna. " +
        "Escriba <code>contar-sets</code>, que recorre el árbol sin evaluarlo " +
        "y cuenta los <code>set-exp</code> que aparecen, también los que " +
        "están dentro del cuerpo de un <code>proc</code> o en el lado derecho " +
        "de otro <code>set</code>. Para la otra cifra, el evaluador lleva un " +
        "contador en un vector de una celda: complete en la cláusula de " +
        "<code>set-exp</code> el valor que se escribe en él. " +
        "<code>sets-ejecutados</code> lo pone en cero, corre el programa y lo " +
        "lee. Es el reto más largo de los cuatro.",
      gramatica: GRAMATICA,
      esqueleto:
        DATATYPE + ALMACEN + SECUENCIA +
        "\n(define ejecutadas (make-vector 1 0))\n" +
        evaluador(
          "      (set-exp (id rhs)\n" +
          "        (begin\n" +
          "          (vector-set! ejecutadas 0 ???)\n" +
          "          (setref! (apply-env-ref amb id) (evaluar-expresion rhs amb))\n" +
          "          1))", "") +
        "\n(define sets-ejecutados\n" +
        "  (lambda (exp)\n" +
        "    (begin\n" +
        "      (vector-set! ejecutadas 0 0)\n" +
        "      (evaluar-programa exp)\n" +
        "      (vector-ref ejecutadas 0))))\n" +
        "\n" +
        "(define contar-sets\n" +
        "  (lambda (exp)\n" +
        "    (cases expresion exp\n" +
        "      (lit-exp (dato) ???)\n" +
        "      (var-exp (id) ???)\n" +
        "      (prim-exp (prim args) ???)\n" +
        "      (let-exp (ids rands cuerpo) (+ ??? ???))\n" +
        "      (proc-exp (ids cuerpo) ???)\n" +
        "      (app-exp (rator rands) (+ ??? ???))\n" +
        "      (begin-exp (primera resto) (+ ??? ???))\n" +
        "      (set-exp (id rhs) ???))))\n" +
        "\n" +
        "(define contar-sets-lista\n" +
        "  (lambda (exps)\n" +
        "    (if (null? exps) 0 (+ ??? ???))))\n" +
        PROG_CONTAR,
      pruebas: [
        { llamada: "(contar-sets (lit-exp 3))", esperado: "0" },
        { llamada: "(contar-sets recta)", esperado: "2" },
        { llamada: "(contar-sets anidado)", esperado: "2" },
        { llamada: "(contar-sets tres-llamadas)", esperado: "1" },
        { llamada: "(sets-ejecutados tres-llamadas)", esperado: "3" },
        { llamada: "(contar-sets nunca-llamado)", esperado: "1" },
        { llamada: "(sets-ejecutados nunca-llamado)", esperado: "0" },
        { llamada: "(contar-sets doble-tres)", esperado: "2" },
        { llamada: "(sets-ejecutados doble-tres)", esperado: "6" },
        { llamada: "(evaluar-programa doble-tres)", esperado: "8" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (llamada === "(contar-sets anidado)" && obtenido === "1") {
          return "Falta el set que está en el lado derecho del otro. La " +
            "cláusula de set-exp cuenta 1 y suma lo que haya en rhs.";
        }
        if (llamada === "(contar-sets tres-llamadas)" && obtenido === "0") {
          return "El set de tick quedó fuera porque está en el cuerpo de un " +
            "proc. El recorrido es estático: el cuerpo se lee aunque nadie " +
            "lo llame.";
        }
        if (llamada.indexOf("(sets-ejecutados") === 0 && obtenido === "1") {
          return "El contador se quedó en 1. Cada set ejecutado escribe en la " +
            "celda lo que ya había más 1.";
        }
        return "Las hojas cuentan 0. Los nodos suman lo de sus hijos, con " +
          "contar-sets-lista para las listas; set-exp suma 1 a lo de rhs. En " +
          "el evaluador, la celda pasa a (+ (vector-ref ejecutadas 0) 1).";
      },
      cierre:
        "tres-llamadas tiene un set escrito y tres ejecutados; nunca-llamado, " +
        "uno escrito y ninguno ejecutado; doble-tres, dos escritos y seis " +
        "ejecutados para un valor de 8. La cifra estática se lee en el árbol " +
        "sin correr nada. La otra depende de cuántas veces se aplique cada " +
        "proc, y para saberla hay que ejecutar el programa."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = RETOS; }

/* --- Interfaz ----------------------------------------------------- */
if (typeof document !== "undefined") {
  MotorRetos.montar({ retos: RETOS, destino: "retos", cierre: "carta-cierre" });
  MotorRetos.montarConsola();
}
