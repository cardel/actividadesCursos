/* Blancos directos e indirectos, eval-rand y el llamado por referencia (EOPL
   §4.3). Cuatro retos que levantan el paso por referencia desde el almacén:
   deref y setref! sobre blancos, eval-rand con su aplanado, y la cláusula de
   la aplicación que liga los parámetros a lo que devuelve eval-rand. El código
   del estudiante corre sobre mini-scheme.js. */
var REFERENCIA =
  ";; Una referencia es una posición dentro de un vector (EOPL §4.2).\n" +
  "(define-datatype referencia referencia?\n" +
  "  (a-ref (pos number?) (vec vector?)))\n" +
  "\n";

var EXPVAL_SIMPLE =
  "(define expval?\n" +
  "  (lambda (x) (or (number? x) (boolean? x))))\n" +
  "\n";

var EXPVAL_PROC =
  ";; Ahora una celda directa puede guardar también una clausura.\n" +
  "(define expval?\n" +
  "  (lambda (x) (or (number? x) (boolean? x) (procval? x))))\n" +
  "\n";

var TARGET =
  ";; Cada celda guarda un blanco: un valor propio o el alias de otra celda.\n" +
  "(define-datatype target target?\n" +
  "  (direct-target   (expval expval?))\n" +
  "  (indirect-target (ref ref-to-direct-target?)))\n" +
  "\n" +
  ";; El invariante se revisa una sola vez: al construir el indirect-target.\n" +
  "(define ref-to-direct-target?\n" +
  "  (lambda (x)\n" +
  "    (and (referencia? x)\n" +
  "         (cases referencia x\n" +
  "           (a-ref (pos vec)\n" +
  "             (cases target (vector-ref vec pos)\n" +
  "               (direct-target (v) #t)\n" +
  "               (indirect-target (v) #f)))))))\n" +
  "\n" +
  ";; Lectura y escritura crudas: devuelven o escriben el blanco tal cual.\n" +
  "(define primitiva-deref\n" +
  "  (lambda (ref)\n" +
  "    (cases referencia ref\n" +
  "      (a-ref (pos vec) (vector-ref vec pos)))))\n" +
  "\n" +
  "(define primitiva-setref!\n" +
  "  (lambda (ref val)\n" +
  "    (cases referencia ref\n" +
  "      (a-ref (pos vec) (vector-set! vec pos val)))))\n";

var DEREF =
  "\n;; deref, ya resuelto. En Racket el caso roto es un eopl:error.\n" +
  "(define deref\n" +
  "  (lambda (ref)\n" +
  "    (cases target (primitiva-deref ref)\n" +
  "      (direct-target (v) v)\n" +
  "      (indirect-target (ref1)\n" +
  "        (cases target (primitiva-deref ref1)\n" +
  "          (direct-target (v1) v1)\n" +
  "          (indirect-target (ref2) 'invariante-roto))))))\n";

var SETREF =
  "\n;; setref!, ya resuelto.\n" +
  "(define setref!\n" +
  "  (lambda (ref val)\n" +
  "    (let ((destino (cases target (primitiva-deref ref)\n" +
  "                     (direct-target (v) ref)\n" +
  "                     (indirect-target (ref1) ref1))))\n" +
  "      (primitiva-setref! destino (direct-target val)))))\n";

var ROTO =
  "\n;; Tres vectores de una celda. arriba se construye cuando medio todavía es\n" +
  ";; directa, así que el constructor lo acepta. Después una escritura cruda\n" +
  ";; convierte a medio en alias de abajo, y nadie vuelve a revisar a arriba.\n" +
  "(define abajo  (list->vector (list (direct-target 9))))\n" +
  "(define medio  (list->vector (list (direct-target 0))))\n" +
  "(define arriba (list->vector (list (indirect-target (a-ref 0 medio)))))\n" +
  "(primitiva-setref! (a-ref 0 medio) (indirect-target (a-ref 0 abajo)))\n";

var AMBIENTE =
  "\n;; El ambiente guarda en cada marco un vector de blancos.\n" +
  "(define-datatype ambiente ambiente?\n" +
  "  (ambiente-vacio)\n" +
  "  (ambiente-extendido-ref (lids (list-of symbol?)) (vec vector?) (viejo ambiente?)))\n" +
  "\n" +
  "(define ambiente-extendido\n" +
  "  (lambda (lids blancos viejo)\n" +
  "    (ambiente-extendido-ref lids (list->vector blancos) viejo)))\n" +
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
  "  (lambda (amb id) (deref (apply-env-ref amb id))))\n";

var PRIMITIVAS =
  "\n(define aplicar-primitiva\n" +
  "  (lambda (prim vals)\n" +
  "    (cond ((eq? prim '+) (+ (car vals) (cadr vals)))\n" +
  "          ((eq? prim '*) (* (car vals) (cadr vals)))\n" +
  "          ((eq? prim 'add1) (+ (car vals) 1))\n" +
  "          (else (error 'aplicar-primitiva \"primitiva desconocida\" prim)))))\n" +
  "\n" +
  "(define evaluar-args\n" +
  "  (lambda (args amb)\n" +
  "    (if (null? args)\n" +
  "        '()\n" +
  "        (cons (evaluar-expresion (car args) amb)\n" +
  "              (evaluar-args (cdr args) amb)))))\n";

var EXP_CHICA =
  "\n(define-datatype expresion expresion?\n" +
  "  (lit-exp  (dato number?))\n" +
  "  (var-exp  (id symbol?))\n" +
  "  (prim-exp (prim symbol?) (args (list-of expresion?))))\n" +
  "\n" +
  "(define evaluar-expresion\n" +
  "  (lambda (exp amb)\n" +
  "    (cases expresion exp\n" +
  "      (lit-exp (dato) dato)\n" +
  "      (var-exp (id) (apply-env amb id))\n" +
  "      (prim-exp (prim args) (aplicar-primitiva prim (evaluar-args args amb))))))\n";

var GRAMATICA_CHICA =
  "(define-datatype expresion expresion?\n" +
  "  (lit-exp  (dato number?))\n" +
  "  (var-exp  (id symbol?))\n" +
  "  (prim-exp (prim symbol?) (args (list-of expresion?))))";

var GRAMATICA_TARGET =
  "(define-datatype referencia referencia?\n" +
  "  (a-ref (pos number?) (vec vector?)))\n" +
  "(define-datatype target target?\n" +
  "  (direct-target   (expval expval?))\n" +
  "  (indirect-target (ref ref-to-direct-target?)))";

var EVAL_RAND =
  "\n;; eval-rand, ya resuelto.\n" +
  "(define eval-rand\n" +
  "  (lambda (exp amb)\n" +
  "    (cases expresion exp\n" +
  "      (var-exp (id)\n" +
  "        (indirect-target\n" +
  "          (let ((ref (apply-env-ref amb id)))\n" +
  "            (cases target (primitiva-deref ref)\n" +
  "              (direct-target (v) ref)\n" +
  "              (indirect-target (ref1) ref1)))))\n" +
  "      (else (direct-target (evaluar-expresion exp amb))))))\n";

var EXP_GRANDE =
  "\n(define-datatype expresion expresion?\n" +
  "  (lit-exp   (dato number?))\n" +
  "  (var-exp   (id symbol?))\n" +
  "  (prim-exp  (prim symbol?) (args (list-of expresion?)))\n" +
  "  (let-exp   (ids (list-of symbol?)) (rands (list-of expresion?)) (cuerpo expresion?))\n" +
  "  (proc-exp  (ids (list-of symbol?)) (cuerpo expresion?))\n" +
  "  (app-exp   (rator expresion?) (rands (list-of expresion?)))\n" +
  "  (begin-exp (primera expresion?) (resto (list-of expresion?)))\n" +
  "  (set-exp   (id symbol?) (rhs expresion?)))\n" +
  "\n" +
  "(define-datatype procval procval?\n" +
  "  (closure (ids (list-of symbol?)) (cuerpo expresion?) (amb ambiente?)))\n";

var GRAMATICA_GRANDE =
  "&lt;expresion&gt; ::= &lt;numero&gt;                                      lit-exp (dato)\n" +
  "            ::= &lt;identificador&gt;                               var-exp (id)\n" +
  "            ::= &lt;primitiva&gt; ( {&lt;expresion&gt;}*(,) )             prim-exp (prim args)\n" +
  "            ::= let {&lt;identificador&gt; = &lt;expresion&gt;}* in &lt;expresion&gt;   let-exp\n" +
  "            ::= proc ( {&lt;identificador&gt;}*(,) ) &lt;expresion&gt;    proc-exp (ids cuerpo)\n" +
  "            ::= ( &lt;expresion&gt; {&lt;expresion&gt;}* )                app-exp (rator rands)\n" +
  "            ::= begin &lt;expresion&gt; {; &lt;expresion&gt;}* end        begin-exp (primera resto)\n" +
  "            ::= set &lt;identificador&gt; = &lt;expresion&gt;             set-exp (id rhs)\n" +
  "&lt;primitiva&gt;  ::= + | * | add1";

var EVALUADOR_SIN_APP =
  "\n(define directos\n" +
  "  (lambda (rands amb)\n" +
  "    (if (null? rands)\n" +
  "        '()\n" +
  "        (cons (direct-target (evaluar-expresion (car rands) amb))\n" +
  "              (directos (cdr rands) amb)))))\n" +
  "\n" +
  "(define evaluar-secuencia\n" +
  "  (lambda (primera resto amb)\n" +
  "    (if (null? resto)\n" +
  "        (evaluar-expresion primera amb)\n" +
  "        (begin\n" +
  "          (evaluar-expresion primera amb)\n" +
  "          (evaluar-secuencia (car resto) (cdr resto) amb)))))\n";

var PROGRAMAS =
  "\n;; let g = proc(r, s) begin set r = *(r, 2); set s = +(s, 3); +(r, s) end\n" +
  ";;     u = 5\n" +
  ";; in (g u u)\n" +
  "(define proc-g\n" +
  "  (proc-exp '(r s)\n" +
  "    (begin-exp (set-exp 'r (prim-exp '* (list (var-exp 'r) (lit-exp 2))))\n" +
  "               (list (set-exp 's (prim-exp '+ (list (var-exp 's) (lit-exp 3))))\n" +
  "                     (prim-exp '+ (list (var-exp 'r) (var-exp 's)))))))\n" +
  "(define prog-alias\n" +
  "  (let-exp '(g u) (list proc-g (lit-exp 5))\n" +
  "    (app-exp (var-exp 'g) (list (var-exp 'u) (var-exp 'u)))))\n" +
  "\n" +
  ";; El mismo, pero al final se lee u: ... in begin (g u u); u end\n" +
  "(define prog-alias-u\n" +
  "  (let-exp '(g u) (list proc-g (lit-exp 5))\n" +
  "    (begin-exp (app-exp (var-exp 'g) (list (var-exp 'u) (var-exp 'u)))\n" +
  "               (list (var-exp 'u)))))\n" +
  "\n" +
  ";; let h = proc(r, s) begin set r = +(r, s); set s = add1(s); +(r, s) end\n" +
  ";;     t = 4\n" +
  ";;     e = 7\n" +
  ";; in (h t +(t, e))\n" +
  "(define proc-h\n" +
  "  (proc-exp '(r s)\n" +
  "    (begin-exp (set-exp 'r (prim-exp '+ (list (var-exp 'r) (var-exp 's))))\n" +
  "               (list (set-exp 's (prim-exp 'add1 (list (var-exp 's))))\n" +
  "                     (prim-exp '+ (list (var-exp 'r) (var-exp 's)))))))\n" +
  "(define llamada-h\n" +
  "  (app-exp (var-exp 'h)\n" +
  "           (list (var-exp 't) (prim-exp '+ (list (var-exp 't) (var-exp 'e))))))\n" +
  "(define prog-mixto\n" +
  "  (let-exp '(h t e) (list proc-h (lit-exp 4) (lit-exp 7)) llamada-h))\n" +
  "\n" +
  ";; ... in begin (h t +(t, e)); t end   y   ... in begin (h t +(t, e)); e end\n" +
  "(define prog-mixto-t\n" +
  "  (let-exp '(h t e) (list proc-h (lit-exp 4) (lit-exp 7))\n" +
  "    (begin-exp llamada-h (list (var-exp 't)))))\n" +
  "(define prog-mixto-e\n" +
  "  (let-exp '(h t e) (list proc-h (lit-exp 4) (lit-exp 7))\n" +
  "    (begin-exp llamada-h (list (var-exp 'e)))))\n" +
  "\n" +
  ";; let suma2 = proc(c) set c = +(c, 2)\n" +
  ";; in let pasa = proc(d) begin (suma2 d); d end\n" +
  ";;    in let v = 1\n" +
  ";;       in begin (pasa v); v end\n" +
  "(define prog-pasa\n" +
  "  (let-exp '(suma2)\n" +
  "           (list (proc-exp '(c) (set-exp 'c (prim-exp '+ (list (var-exp 'c) (lit-exp 2))))))\n" +
  "    (let-exp '(pasa)\n" +
  "             (list (proc-exp '(d)\n" +
  "                     (begin-exp (app-exp (var-exp 'suma2) (list (var-exp 'd)))\n" +
  "                                (list (var-exp 'd)))))\n" +
  "      (let-exp '(v) (list (lit-exp 1))\n" +
  "        (begin-exp (app-exp (var-exp 'pasa) (list (var-exp 'v)))\n" +
  "                   (list (var-exp 'v)))))))\n" +
  "\n" +
  ";; k se liga dos veces a propósito.\n" +
  ";; let k = 3\n" +
  ";; in let sumak = proc(r) set r = +(r, k)\n" +
  ";;    in let k = 100\n" +
  ";;       in let v = 1\n" +
  ";;          in begin (sumak v); v end\n" +
  "(define prog-alcance\n" +
  "  (let-exp '(k) (list (lit-exp 3))\n" +
  "    (let-exp '(sumak)\n" +
  "             (list (proc-exp '(r) (set-exp 'r (prim-exp '+ (list (var-exp 'r) (var-exp 'k))))))\n" +
  "      (let-exp '(k) (list (lit-exp 100))\n" +
  "        (let-exp '(v) (list (lit-exp 1))\n" +
  "          (begin-exp (app-exp (var-exp 'sumak) (list (var-exp 'v)))\n" +
  "                     (list (var-exp 'v))))))))\n";

var RETOS = (function () {
  "use strict";
  return [
    {
      id: "eval-rand-deref",
      titulo: "1. deref sobre blancos",
      enunciado:
        "Con paso por referencia, cada celda del vector guarda un blanco " +
        "(EOPL §4.3): <code>direct-target</code> con un valor propio, o " +
        "<code>indirect-target</code> con la referencia de otra celda. El " +
        "invariante pide que un indirecto apunte siempre a una celda directa, " +
        "y por eso <code>deref</code> sigue a lo sumo un paso. Escriba " +
        "<code>deref</code>: con un directo devuelve el valor; con un " +
        "indirecto lee la celda apuntada y devuelve su valor. Si allí aparece " +
        "otro indirecto, el invariante está roto: en Racket eso es un " +
        "<code>eopl:error</code> y aquí se devuelve el símbolo " +
        "<code>invariante-roto</code>. El esqueleto arma ese caso a " +
        "propósito, con una escritura cruda que el tipo no vigila.",
      gramatica: GRAMATICA_TARGET,
      esqueleto:
        REFERENCIA + EXPVAL_SIMPLE + TARGET + ROTO +
        "\n;; Un vector con dos celdas propias y un alias de abajo.\n" +
        "(define mixto\n" +
        "  (list->vector (list (direct-target 2)\n" +
        "                      (direct-target #f)\n" +
        "                      (indirect-target (a-ref 0 abajo)))))\n" +
        "\n" +
        "(define deref\n" +
        "  (lambda (ref)\n" +
        "    (cases target (primitiva-deref ref)\n" +
        "      (direct-target (v) ???)\n" +
        "      (indirect-target (ref1)\n" +
        "        (cases target ???\n" +
        "          (direct-target (v1) ???)\n" +
        "          (indirect-target (ref2) ???))))))\n",
      pruebas: [
        { llamada: "(deref (a-ref 0 mixto))", esperado: "2" },
        { llamada: "(deref (a-ref 1 mixto))", esperado: "#f" },
        { llamada: "(deref (a-ref 2 mixto))", esperado: "9" },
        { llamada: "(deref (a-ref 0 abajo))", esperado: "9" },
        { llamada: "(deref (a-ref 0 medio))", esperado: "9" },
        { llamada: "(deref (a-ref 0 arriba))", esperado: "invariante-roto" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (obtenido.indexOf("(direct-target") === 0) {
          return "Eso es el blanco entero. deref devuelve lo que el blanco " +
            "guarda: el campo que cases ya ligó.";
        }
        if (obtenido.indexOf("(a-ref") === 0) {
          return "Se devolvió la referencia apuntada, no lo que hay en ella. " +
            "La celda de ref1 se lee con primitiva-deref y se abre con un " +
            "segundo cases.";
        }
        if (llamada === "(deref (a-ref 0 arriba))" && obtenido === "9") {
          return "deref siguió dos alias hasta llegar a abajo. Sigue uno solo: " +
            "si la celda apuntada también es indirecta, la respuesta es el " +
            "símbolo invariante-roto.";
        }
        if (llamada === "(deref (a-ref 0 arriba))" && obtenido.indexOf("(indirect-target") === 0) {
          return "Encontrar un indirecto detrás de otro es el caso roto: se " +
            "devuelve 'invariante-roto, no el blanco encontrado.";
        }
        return "Dos niveles de cases: el primero sobre la celda de ref, el " +
          "segundo sobre la celda de ref1. Solo el segundo nivel puede " +
          "encontrar el invariante roto.";
      },
      cierre:
        "El caso roto se pudo armar porque ref-to-direct-target? se consulta " +
        "una sola vez, cuando se construye el indirect-target; " +
        "primitiva-setref! escribe sin preguntar. Al invariante lo sostienen " +
        "setref! y eval-rand con su manera de escribir. Un deref que siguiera " +
        "los alias hasta el fondo habría devuelto 9 sin avisar."
    },
    {
      id: "eval-rand-setref",
      titulo: "2. setref! sobre blancos",
      enunciado:
        "<code>setref!</code> siempre escribe un <code>direct-target</code> " +
        "(EOPL §4.3). Si la celda de la referencia es directa, escribe en " +
        "ella; si es un alias, sigue un paso y escribe en la celda apuntada. " +
        "Así el alias sigue siendo alias y quien comparte la celda ve el " +
        "cambio. Escriba <code>setref!</code> sobre el <code>deref</code> del " +
        "reto anterior. <code>vector-set!</code> no devuelve nada, por eso " +
        "las pruebas que escriben terminan en un <code>begin</code> que lee " +
        "algo. Las pruebas corren en orden sobre los mismos vectores: cada " +
        "una parte de lo que dejó la anterior.",
      gramatica: GRAMATICA_TARGET,
      esqueleto:
        REFERENCIA + EXPVAL_SIMPLE + TARGET + DEREF + ROTO +
        "\n;; dueno guarda dos valores propios; las dos celdas de alias apuntan a\n" +
        ";; la segunda celda de dueno.\n" +
        "(define dueno (list->vector (list (direct-target 3) (direct-target 8))))\n" +
        "(define alias (list->vector (list (indirect-target (a-ref 1 dueno))\n" +
        "                                  (indirect-target (a-ref 1 dueno)))))\n" +
        "\n" +
        "(define tipo-de-celda\n" +
        "  (lambda (ref)\n" +
        "    (cases target (primitiva-deref ref)\n" +
        "      (direct-target (v) 'directa)\n" +
        "      (indirect-target (r) 'indirecta))))\n" +
        "\n" +
        "(define setref!\n" +
        "  (lambda (ref val)\n" +
        "    (let ((destino (cases target (primitiva-deref ref)\n" +
        "                     (direct-target (v) ???)\n" +
        "                     (indirect-target (ref1) ???))))\n" +
        "      (primitiva-setref! destino ???))))\n",
      pruebas: [
        { llamada: "(begin (setref! (a-ref 0 dueno) 5) dueno)", esperado: "#((direct-target 5) (direct-target 8))" },
        { llamada: "(begin (setref! (a-ref 0 alias) 6) dueno)", esperado: "#((direct-target 5) (direct-target 6))" },
        { llamada: "(tipo-de-celda (a-ref 0 alias))", esperado: "indirecta" },
        { llamada: "(deref (a-ref 1 alias))", esperado: "6" },
        { llamada: "(begin (setref! (a-ref 1 alias) #t) (deref (a-ref 0 alias)))", esperado: "#t" },
        { llamada: "(begin (setref! (a-ref 0 arriba) 4) (list (deref (a-ref 0 arriba)) (deref (a-ref 0 abajo))))", esperado: "(4 9)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (/#\((\(direct-target \d\) )?\d/.test(obtenido)) {
          return "En la celda quedó un número suelto. setref! envuelve el " +
            "valor en direct-target antes de escribirlo.";
        }
        if (llamada === "(begin (setref! (a-ref 0 alias) 6) dueno)" &&
            obtenido === "#((direct-target 5) (direct-target 8))") {
          return "dueno no cambió: la escritura cayó en la celda del alias. " +
            "Cuando la celda es indirecta, el destino es la referencia que " +
            "ese indirecto guarda.";
        }
        if (llamada.indexOf("arriba") !== -1 && obtenido === "(invariante-roto 4)") {
          return "La escritura llegó hasta abajo, dos alias más allá, y arriba " +
            "sigue apuntando a un alias. setref! sigue un solo paso, igual " +
            "que deref, y escribe en medio.";
        }
        return "El let elige el destino: la propia ref si la celda es " +
          "directa, ref1 si es indirecta. Después se escribe ahí un " +
          "direct-target con val.";
      },
      cierre:
        "Las dos celdas de alias siguen siendo indirectas y ven 6 y luego #t, " +
        "porque toda escritura terminó en la celda de dueno. La última prueba " +
        "vuelve al caso roto: setref! sigue un paso desde arriba, escribe un " +
        "directo en medio y borra el alias que medio tenía. El invariante " +
        "vuelve a valer, pero abajo se queda en 9 y ya no comparte nada con " +
        "arriba."
    },
    {
      id: "eval-rand-aplanar",
      titulo: "3. eval-rand y el aplanado",
      enunciado:
        "<code>eval-rand</code> decide qué blanco recibe cada parámetro " +
        "(EOPL §4.3). Si el operando es una variable, pasa un " +
        "<code>indirect-target</code> con la referencia de su celda; " +
        "cualquier otro operando se evalúa y pasa en un " +
        "<code>direct-target</code>. Falta un caso: la celda de la variable " +
        "ya puede ser un alias, porque esa variable es a su vez un parámetro " +
        "recibido por referencia. Entonces se pasa la referencia que el alias " +
        "ya tenía, y no se forma una cadena. <code>base</code> es el ambiente " +
        "de quien llama y <code>llamada</code> es el marco que dejaría " +
        "<code>(f p)</code>, con <code>w</code> como alias de <code>p</code>. " +
        "Si para <code>w</code> se envuelve la referencia de su propia celda, " +
        "el constructor de <code>indirect-target</code> la rechaza y la prueba " +
        "se detiene con ese mensaje.",
      gramatica: GRAMATICA_CHICA,
      esqueleto:
        REFERENCIA + EXPVAL_SIMPLE + TARGET + DEREF + AMBIENTE + EXP_CHICA + PRIMITIVAS +
        "\n;; base: el ambiente de quien llama, con dos valores propios.\n" +
        "(define base\n" +
        "  (ambiente-extendido '(p q) (list (direct-target 6) (direct-target 9))\n" +
        "                      (ambiente-vacio)))\n" +
        "\n" +
        ";; llamada: el marco que deja (f p) con paso por referencia.\n" +
        "(define llamada\n" +
        "  (ambiente-extendido '(w) (list (indirect-target (apply-env-ref base 'p)))\n" +
        "                      base))\n" +
        "\n" +
        "(define eval-rand\n" +
        "  (lambda (exp amb)\n" +
        "    (cases expresion exp\n" +
        "      (var-exp (id)\n" +
        "        (indirect-target\n" +
        "          (let ((ref (apply-env-ref amb id)))\n" +
        "            (cases target (primitiva-deref ref)\n" +
        "              (direct-target (v) ???)\n" +
        "              (indirect-target (ref1) ???)))))\n" +
        "      (else ???))))\n",
      pruebas: [
        { llamada: "(eval-rand (lit-exp 7) base)", esperado: "(direct-target 7)" },
        { llamada: "(eval-rand (prim-exp '+ (list (var-exp 'p) (var-exp 'q))) base)", esperado: "(direct-target 15)" },
        { llamada: "(eval-rand (var-exp 'q) base)", esperado: "(indirect-target (a-ref 1 #((direct-target 6) (direct-target 9))))" },
        { llamada: "(eval-rand (var-exp 'w) llamada)", esperado: "(indirect-target (a-ref 0 #((direct-target 6) (direct-target 9))))" },
        { llamada: "(equal? (eval-rand (var-exp 'w) llamada) (eval-rand (var-exp 'p) llamada))", esperado: "#t" },
        { llamada: "(eval-rand (prim-exp 'add1 (list (var-exp 'w))) llamada)", esperado: "(direct-target 7)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (/^\d+$/.test(obtenido)) {
          return "eval-rand devuelve un blanco, no un valor: lo que no es " +
            "variable se evalúa y se envuelve en direct-target.";
        }
        if (llamada === "(eval-rand (var-exp 'q) base)" && obtenido.indexOf("(direct-target") === 0) {
          return "Una variable pasa por referencia: el resultado es un " +
            "indirect-target con la referencia que da apply-env-ref, no con " +
            "el valor de q.";
        }
        return "Con la celda directa, el indirecto apunta a ref; con la celda " +
          "indirecta, a ref1, la celda que el alias ya señalaba. El else " +
          "evalúa y envuelve en direct-target.";
      },
      cierre:
        "w y p entregan el mismo blanco: los dos apuntan a la celda 0 del " +
        "vector de base. Sin el aplanado no saldría un alias más largo sino un " +
        "error, porque ref-to-direct-target? sí se revisa al construir. Y " +
        "add1(w) pasa por valor aunque nombre una variable: decide la forma " +
        "del operando, no lo que contiene."
    },
    {
      id: "eval-rand-aplicar",
      titulo: "4. Aplicar un procedimiento por referencia",
      enunciado:
        "El evaluador de abajo ya trae <code>let</code>, <code>proc</code>, " +
        "<code>set</code> y <code>begin</code>, con <code>eval-rand</code> " +
        "resuelto. Falta la aplicación (EOPL §4.3). <code>eval-rands</code> " +
        "recorre los operandos y arma la lista de blancos; la cláusula de " +
        "<code>app-exp</code> evalúa el cuerpo de la clausura en el ambiente " +
        "que ella guardó, extendido con cada parámetro ligado a su blanco. Los " +
        "operandos se evalúan antes que el operador. Cada programa va escrito " +
        "en la sintaxis del lenguaje justo encima de su árbol. " +
        "<code>prog-alcance</code> liga <code>k</code> dos veces a propósito: " +
        "el cuerpo de <code>sumak</code> debe ver la <code>k</code> del " +
        "momento en que se creó la clausura. Es el reto más largo de los " +
        "cuatro.",
      gramatica: GRAMATICA_GRANDE,
      esqueleto:
        REFERENCIA + TARGET + DEREF + SETREF + AMBIENTE + EXP_GRANDE + EXPVAL_PROC +
        PRIMITIVAS + EVALUADOR_SIN_APP + EVAL_RAND +
        "\n(define eval-rands\n" +
        "  (lambda (rands amb)\n" +
        "    (if (null? rands)\n" +
        "        ???\n" +
        "        (cons ??? ???))))\n" +
        "\n" +
        "(define evaluar-expresion\n" +
        "  (lambda (exp amb)\n" +
        "    (cases expresion exp\n" +
        "      (lit-exp (dato) dato)\n" +
        "      (var-exp (id) (apply-env amb id))\n" +
        "      (prim-exp (prim args) (aplicar-primitiva prim (evaluar-args args amb)))\n" +
        "      (let-exp (ids rands cuerpo)\n" +
        "        (evaluar-expresion cuerpo (ambiente-extendido ids (directos rands amb) amb)))\n" +
        "      (proc-exp (ids cuerpo) (closure ids cuerpo amb))\n" +
        "      (app-exp (rator rands)\n" +
        "        (let ((blancos ???)\n" +
        "              (proc (evaluar-expresion rator amb)))\n" +
        "          (cases procval proc\n" +
        "            (closure (ids cuerpo amb-clausura)\n" +
        "              (evaluar-expresion ??? (ambiente-extendido ??? ??? ???))))))\n" +
        "      (begin-exp (primera resto) (evaluar-secuencia primera resto amb))\n" +
        "      (set-exp (id rhs)\n" +
        "        (begin\n" +
        "          (setref! (apply-env-ref amb id) (evaluar-expresion rhs amb))\n" +
        "          1)))))\n" +
        PROGRAMAS,
      pruebas: [
        { llamada: "(evaluar-expresion prog-alias (ambiente-vacio))", esperado: "26" },
        { llamada: "(evaluar-expresion prog-alias-u (ambiente-vacio))", esperado: "13" },
        { llamada: "(evaluar-expresion prog-mixto (ambiente-vacio))", esperado: "27" },
        { llamada: "(evaluar-expresion prog-mixto-t (ambiente-vacio))", esperado: "15" },
        { llamada: "(evaluar-expresion prog-mixto-e (ambiente-vacio))", esperado: "7" },
        { llamada: "(evaluar-expresion prog-pasa (ambiente-vacio))", esperado: "3" },
        { llamada: "(evaluar-expresion prog-alcance (ambiente-vacio))", esperado: "4" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (llamada.indexOf("prog-alias ") !== -1 && obtenido === "18") {
          return "18 es lo que da el paso por valor: r y s recibieron copias. " +
            "Los blancos salen de eval-rand, que con u pasa un indirecto, y " +
            "los dos parámetros terminan en la celda de u.";
        }
        if (llamada.indexOf("prog-alcance") !== -1 && obtenido === "101") {
          return "El cuerpo vio k = 100, la del punto de la llamada. Se " +
            "extiende amb-clausura, el ambiente que la clausura guardó, no " +
            "amb.";
        }
        return "eval-rands recorre con cons, aplicando eval-rand a cada " +
          "operando. En app-exp, el ambiente nuevo liga ids a los blancos " +
          "sobre amb-clausura, y ahí se evalúa cuerpo.";
      },
      cierre:
        "(g u u) vale 26 y deja u en 13; con paso por valor el mismo programa " +
        "da 18 y u sigue en 5. (h t +(t, e)) vale 27 con las dos políticas, y " +
        "la diferencia solo aparece al leer t: 15 por referencia, 4 por valor. " +
        "En prog-pasa la celda de v cambió dentro de suma2, dos llamadas más " +
        "abajo, porque eval-rand aplanó el alias de d antes de entregarlo."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = RETOS; }

/* --- Interfaz ----------------------------------------------------- */
if (typeof document !== "undefined") {
  MotorRetos.montar({ retos: RETOS, destino: "retos", cierre: "carta-cierre" });
  MotorRetos.montarConsola();
}
