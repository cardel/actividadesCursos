/* El ambiente con vectores (EOPL §4.2). Cinco retos sobre el datatype de
   ambiente.rkt del intérprete con asignación: el constructor de conveniencia,
   apply-env-ref, apply-env con una asignación, el ambiente recursivo que
   llena sus celdas con clausuras y un cliente que recorre la cadena. El
   código del estudiante corre sobre mini-scheme.js. */
var DATATYPE_AMB =
  "(define-datatype ambiente ambiente?\n" +
  "  (ambiente-vacio)\n" +
  "  (ambiente-extendido-ref\n" +
  "   (lids (list-of symbol?))\n" +
  "   (lvalue vector?)\n" +
  "   (old-env ambiente?)))\n";

var REFERENCIA =
  ";; El TAD referencia y sus dos primitivas.\n" +
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
  ";; El ambiente: cada eslabón guarda sus nombres y un vector con los valores.\n" +
  DATATYPE_AMB;

var CONVENIENCIA =
  "\n(define ambiente-extendido\n" +
  "  (lambda (lids lvalue old-env)\n" +
  "    (ambiente-extendido-ref lids (list->vector lvalue) old-env)))\n";

var TALLER =
  "\n;; m está dos veces en la cadena, a propósito: la búsqueda se queda con la\n" +
  ";; más cercana.\n" +
  "(define amb-taller\n" +
  "  (ambiente-extendido '(m n) '(30 11)\n" +
  "    (ambiente-extendido '(k m r) '(2 64 9)\n" +
  "      (ambiente-vacio))))\n";

var APLICA_REF =
  "\n;; apply-env-ref, ya escrita. En el ambiente vacío devuelve el símbolo\n" +
  ";; no-ligada; en ambiente.rkt va un eopl:error.\n" +
  "(define apply-env-ref\n" +
  "  (lambda (env var)\n" +
  "    (cases ambiente env\n" +
  "      (ambiente-vacio () 'no-ligada)\n" +
  "      (ambiente-extendido-ref (lid vec old-env)\n" +
  "        (letrec\n" +
  "            ((buscar-variable\n" +
  "              (lambda (lid vec pos)\n" +
  "                (cond\n" +
  "                  [(null? lid) (apply-env-ref old-env var)]\n" +
  "                  [(equal? (car lid) var) (a-ref pos vec)]\n" +
  "                  [else (buscar-variable (cdr lid) vec (+ pos 1))]))))\n" +
  "          (buscar-variable lid vec 0))))))\n";

var NUEVO_TALLER =
  "\n;; Cada llamada arma la misma cadena con vectores nuevos, para que lo que\n" +
  ";; escribe una prueba no le llegue a la siguiente.\n" +
  "(define nuevo-taller\n" +
  "  (lambda ()\n" +
  "    (ambiente-extendido '(m n) '(30 11)\n" +
  "      (ambiente-extendido '(k m r) '(2 64 9)\n" +
  "        (ambiente-vacio)))))\n";

var APLICA =
  "\n(define apply-env\n" +
  "  (lambda (env var)\n" +
  "    (deref (apply-env-ref env var))))\n" +
  "\n" +
  "(define asignar!\n" +
  "  (lambda (env var val)\n" +
  "    (begin\n" +
  "      (setref! (apply-env-ref env var) val)\n" +
  "      1)))\n";

var CLAUSURAS =
  "\n;; Las clausuras. Los cuerpos van como símbolos marcadores, porque lo que\n" +
  ";; se mide es el ambiente; el último campo acepta cualquier valor, como en\n" +
  ";; valores.rkt.\n" +
  "(define-datatype procval procval?\n" +
  "  (closure (lid (list-of symbol?))\n" +
  "           (body symbol?)\n" +
  "           (amb-creation (lambda (amb) #t))))\n" +
  "\n" +
  "(define closure->body\n" +
  "  (lambda (c) (cases procval c (closure (lid body amb) body))))\n" +
  "(define closure->amb\n" +
  "  (lambda (c) (cases procval c (closure (lid body amb) amb))))\n";

var BASE_REC =
  "\n;; sube y baja se declaran sobre un eslabón que liga tope.\n" +
  "(define base-rec (ambiente-extendido '(tope) '(6) (ambiente-vacio)))\n";

var RECURSIVO =
  "\n(define ambiente-extendido-recursivo\n" +
  "  (lambda (procnames lidss cuerpos old-env)\n" +
  "    (let ((vec-clausuras (make-vector (length procnames))))\n" +
  "      (letrec\n" +
  "          ((amb (ambiente-extendido-ref procnames vec-clausuras old-env))\n" +
  "           (obtener-clausuras\n" +
  "            (lambda (lidss cuerpos pos)\n" +
  "              (cond\n" +
  "                [(null? lidss) amb]\n" +
  "                [else\n" +
  "                 (vector-set! vec-clausuras pos\n" +
  "                              (closure (car lidss) (car cuerpos) amb))\n" +
  "                 (obtener-clausuras (cdr lidss) (cdr cuerpos) (+ pos 1))]))))\n" +
  "        (obtener-clausuras lidss cuerpos 0)))))\n";

var NUEVO_REC =
  "\n(define nuevo-rec\n" +
  "  (lambda ()\n" +
  "    (ambiente-extendido-recursivo '(sube baja) '((n) (n paso))\n" +
  "                                  '(cuerpo-sube cuerpo-baja) base-rec)))\n";

var RETOS = (function () {
  "use strict";
  return [
    {
      id: "ambiente-conveniencia",
      titulo: "1. El constructor de conveniencia",
      enunciado:
        "En el intérprete con asignación cada eslabón del ambiente guarda sus " +
        "nombres en una lista y sus valores en un vector, y la celda " +
        "<em>i</em> del vector es la ubicación del nombre <em>i</em> (EOPL " +
        "§4.2). Quien extiende el ambiente tiene una lista de valores, así " +
        "que <code>ambiente-extendido</code> la convierte con " +
        "<code>list-&gt;vector</code> y arma el eslabón. Si se le pasa la " +
        "lista tal cual, el constructor la rechaza, porque el campo pide " +
        "<code>vector?</code>. La última prueba arma dos eslabones con la " +
        "misma lista de valores y escribe en el primero.",
      gramatica: DATATYPE_AMB,
      esqueleto:
        REFERENCIA + "\n" +
        "(define ambiente-extendido\n" +
        "  (lambda (lids lvalue old-env)\n" +
        "    (ambiente-extendido-ref ??? ??? ???)))\n",
      pruebas: [
        { llamada: "(ambiente-extendido '(p q) '(3 8) (ambiente-vacio))", esperado: "(ambiente-extendido-ref (p q) #(3 8) (ambiente-vacio))" },
        { llamada: "(ambiente-extendido '() '() (ambiente-vacio))", esperado: "(ambiente-extendido-ref () #() (ambiente-vacio))" },
        { llamada: "(ambiente-extendido '(s) '(1) (ambiente-extendido '(p q) '(3 8) (ambiente-vacio)))", esperado: "(ambiente-extendido-ref (s) #(1) (ambiente-extendido-ref (p q) #(3 8) (ambiente-vacio)))" },
        { llamada: "(let ((vals '(3 8))) (let ((e1 (ambiente-extendido '(p q) vals (ambiente-vacio))) (e2 (ambiente-extendido '(p q) vals (ambiente-vacio)))) (cases ambiente e1 (ambiente-vacio () 'vacio) (ambiente-extendido-ref (lids vec old-env) (begin (vector-set! vec 0 50) (list e1 e2))))))", esperado: "((ambiente-extendido-ref (p q) #(50 8) (ambiente-vacio)) (ambiente-extendido-ref (p q) #(3 8) (ambiente-vacio)))" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (obtenido.indexOf("(ambiente-extendido-ref (p q) (") !== -1 ||
            obtenido.indexOf("(ambiente-extendido-ref (3 8)") !== -1) {
          return "Los campos van en el orden del datatype: primero los " +
            "nombres, después el vector y al final el ambiente viejo.";
        }
        return "El primer campo es lids tal cual; el segundo, " +
          "(list->vector lvalue); el tercero, old-env.";
      },
      cierre:
        "list->vector arma un vector nuevo en cada llamada, aunque reciba la " +
        "misma lista. Por eso escribir 50 en el primer eslabón no toca el " +
        "segundo: cada extensión del ambiente estrena sus celdas."
    },
    {
      id: "ambiente-apply-env-ref",
      titulo: "2. Del nombre a la celda: apply-env-ref",
      enunciado:
        "<code>apply-env-ref</code> recibe un nombre y devuelve su " +
        "referencia, <code>(a-ref pos vec)</code>, en vez de su valor. Dentro " +
        "de cada eslabón, <code>buscar-variable</code> avanza por los nombres " +
        "llevando la posición desde 0; si se le acaban, sigue con el ambiente " +
        "viejo. En <code>ambiente.rkt</code> el ambiente vacío detiene todo " +
        "con <code>eopl:error</code>. Aquí devuelve el símbolo " +
        "<code>no-ligada</code>, porque una prueba no puede esperar un " +
        "error. En <code>amb-taller</code> el nombre <code>m</code> está dos " +
        "veces: 30 en el eslabón nuevo y 64 en el viejo.",
      gramatica: DATATYPE_AMB,
      esqueleto:
        REFERENCIA + CONVENIENCIA + TALLER + "\n" +
        "(define apply-env-ref\n" +
        "  (lambda (env var)\n" +
        "    (cases ambiente env\n" +
        "      (ambiente-vacio () ???)\n" +
        "      (ambiente-extendido-ref (lid vec old-env)\n" +
        "        (letrec\n" +
        "            ((buscar-variable\n" +
        "              (lambda (lid vec pos)\n" +
        "                (cond\n" +
        "                  [(null? lid) ???]\n" +
        "                  [(equal? (car lid) var) ???]\n" +
        "                  [else ???]))))\n" +
        "          (buscar-variable lid vec 0))))))\n",
      pruebas: [
        { llamada: "(apply-env-ref amb-taller 'n)", esperado: "(a-ref 1 #(30 11))" },
        { llamada: "(apply-env-ref amb-taller 'r)", esperado: "(a-ref 2 #(2 64 9))" },
        { llamada: "(apply-env-ref amb-taller 'm)", esperado: "(a-ref 0 #(30 11))" },
        { llamada: "(apply-env-ref amb-taller 'w)", esperado: "no-ligada" },
        { llamada: "(apply-env-ref (ambiente-vacio) 'k)", esperado: "no-ligada" },
        { llamada: "(eq? (apply-env-ref amb-taller 'n) (apply-env-ref amb-taller 'n))", esperado: "#f" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (/^\d+$/.test(obtenido)) {
          return "Salió el valor guardado en la celda. apply-env-ref " +
            "devuelve la referencia: (a-ref pos vec).";
        }
        if (llamada === "(apply-env-ref amb-taller 'n)" && obtenido === "(a-ref 2 #(30 11))") {
          return "La posición quedó corrida en uno. El primer nombre del " +
            "eslabón está en la celda 0, y pos avanza de uno en uno.";
        }
        if (llamada === "(apply-env-ref amb-taller 'n)" && obtenido === "(a-ref 0 #(30 11))") {
          return "La posición no avanza: en el else, buscar-variable sigue " +
            "con (cdr lid) y (+ pos 1).";
        }
        if (llamada === "(apply-env-ref amb-taller 'r)" && obtenido === "no-ligada") {
          return "r está en el eslabón viejo. Cuando se acaban los nombres " +
            "del eslabón, la búsqueda sigue con (apply-env-ref old-env var).";
        }
        if (llamada === "(apply-env-ref amb-taller 'm)" && obtenido === "(a-ref 1 #(2 64 9))") {
          return "Se encontró la m del eslabón viejo. La búsqueda empieza " +
            "por el eslabón más nuevo y para en la primera que encuentra.";
        }
        return "El vacío devuelve 'no-ligada; con la lista agotada se sigue " +
          "por old-env; al encontrar el nombre se arma (a-ref pos vec); si " +
          "no, se avanza con (cdr lid) y (+ pos 1).";
      },
      cierre:
        "La m del eslabón viejo, con 64, sigue en su vector, pero ninguna " +
        "consulta por m llega hasta ella. La última prueba da #f porque " +
        "cada consulta arma una a-ref nueva: dos valores distintos que " +
        "denotan la misma celda."
    },
    {
      id: "ambiente-asignar",
      titulo: "3. apply-env y una asignación",
      enunciado:
        "<code>apply-env</code> es <code>deref</code> aplicado a lo que " +
        "devuelve <code>apply-env-ref</code>. <code>asignar!</code> escribe " +
        "un valor en la celda del nombre con <code>setref!</code> y devuelve " +
        "1, igual que <code>set</code> en el intérprete. Con un nombre que no " +
        "está, <code>deref</code> y <code>setref!</code> reciben el símbolo " +
        "<code>no-ligada</code> y su <code>cases</code> falla; por eso " +
        "ninguna prueba lo intenta. La cuarta prueba asigna a <code>m</code>, " +
        "que está dos veces en la cadena, y muestra en cuál de las dos celdas " +
        "cayó la escritura. La última extiende la cadena con otro " +
        "<code>n</code> a propósito.",
      gramatica: DATATYPE_AMB,
      esqueleto:
        REFERENCIA + CONVENIENCIA + APLICA_REF + NUEVO_TALLER + "\n" +
        "(define apply-env\n" +
        "  (lambda (env var)\n" +
        "    ???))\n" +
        "\n" +
        "(define asignar!\n" +
        "  (lambda (env var val)\n" +
        "    (begin\n" +
        "      ???\n" +
        "      1)))\n",
      pruebas: [
        { llamada: "(apply-env (nuevo-taller) 'r)", esperado: "9" },
        { llamada: "(apply-env (nuevo-taller) 'm)", esperado: "30" },
        { llamada: "(let ((e (nuevo-taller))) (list (asignar! e 'r 40) (apply-env e 'r)))", esperado: "(1 40)" },
        { llamada: "(let ((e (nuevo-taller))) (begin (asignar! e 'm 0) e))", esperado: "(ambiente-extendido-ref (m n) #(0 11) (ambiente-extendido-ref (k m r) #(2 64 9) (ambiente-vacio)))" },
        { llamada: "(let ((base (ambiente-extendido '(k) '(2) (ambiente-vacio)))) (let ((e1 (ambiente-extendido '(u) '(1) base)) (e2 (ambiente-extendido '(t) '(5) base))) (begin (asignar! e1 'k 70) (apply-env e2 'k))))", esperado: "70" },
        { llamada: "(let ((e (nuevo-taller))) (let ((e2 (ambiente-extendido '(n) '(4) e))) (begin (asignar! e2 'n 7) (list (apply-env e2 'n) (apply-env e 'n)))))", esperado: "(7 11)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (obtenido.indexOf("(a-ref") === 0) {
          return "apply-env devolvió la referencia. Falta leerla: " +
            "(deref (apply-env-ref env var)).";
        }
        if (llamada.indexOf("(asignar! e 'r 40)") !== -1 && obtenido === "(1 9)") {
          return "La celda no cambió. asignar! escribe con setref! sobre la " +
            "referencia que da apply-env-ref.";
        }
        if (llamada.indexOf("(asignar! e1 'k 70)") !== -1 && obtenido === "2") {
          return "e1 y e2 extienden el mismo eslabón base, así que la k de " +
            "los dos es una sola celda. Si e2 no ve el 70, la escritura no " +
            "llegó a esa celda.";
        }
        return "apply-env compone deref con apply-env-ref; asignar! hace " +
          "(setref! (apply-env-ref env var) val) antes de devolver 1.";
      },
      cierre:
        "La escritura en m cayó en el eslabón nuevo: #(30 11) pasó a " +
        "#(0 11) y el 64 quedó intacto. e1 y e2 comparten el eslabón de k, " +
        "y el 70 escrito por e1 se lee por e2. En cambio, el n de e2 tapa al " +
        "de abajo: asignarle 7 deja el otro n en 11."
    },
    {
      id: "ambiente-recursivo",
      titulo: "4. El ambiente recursivo: un vector y sus clausuras",
      enunciado:
        "Con vectores, <code>letrec</code> no necesita una variante propia. " +
        "<code>ambiente-extendido-recursivo</code> reserva un vector con " +
        "<code>make-vector</code>, arma sobre él un " +
        "<code>ambiente-extendido-ref</code> y llena cada celda con una " +
        "clausura que captura ese mismo eslabón. Complete los huecos: el " +
        "tamaño del vector, el vector del eslabón, lo que devuelve el " +
        "recorrido al terminar, el ambiente que captura cada clausura y la " +
        "posición siguiente. El resultado es cíclico (el eslabón guarda " +
        "clausuras que guardan el eslabón) y no se puede imprimir: las " +
        "pruebas preguntan con <code>eq?</code> y devuelven booleanos, " +
        "símbolos o números.",
      gramatica:
        DATATYPE_AMB + "\n" +
        "(define-datatype procval procval?\n" +
        "  (closure (lid (list-of symbol?))\n" +
        "           (body symbol?)\n" +
        "           (amb-creation (lambda (amb) #t))))\n",
      esqueleto:
        REFERENCIA + CONVENIENCIA + APLICA_REF + APLICA + CLAUSURAS + BASE_REC + "\n" +
        "(define ambiente-extendido-recursivo\n" +
        "  (lambda (procnames lidss cuerpos old-env)\n" +
        "    (let ((vec-clausuras (make-vector ???)))\n" +
        "      (letrec\n" +
        "          ((amb (ambiente-extendido-ref procnames ??? old-env))\n" +
        "           (obtener-clausuras\n" +
        "            (lambda (lidss cuerpos pos)\n" +
        "              (cond\n" +
        "                [(null? lidss) ???]\n" +
        "                [else\n" +
        "                 (vector-set! vec-clausuras pos\n" +
        "                              (closure (car lidss) (car cuerpos) ???))\n" +
        "                 (obtener-clausuras (cdr lidss) (cdr cuerpos) ???)]))))\n" +
        "        (obtener-clausuras lidss cuerpos 0)))))\n" +
        NUEVO_REC,
      pruebas: [
        { llamada: "(procval? (apply-env (nuevo-rec) 'baja))", esperado: "#t" },
        { llamada: "(closure->body (apply-env (nuevo-rec) 'baja))", esperado: "cuerpo-baja" },
        { llamada: "(let ((r (nuevo-rec))) (eq? (closure->amb (apply-env r 'sube)) r))", esperado: "#t" },
        { llamada: "(let ((r (nuevo-rec))) (eq? (closure->amb (apply-env r 'baja)) (closure->amb (apply-env r 'sube))))", esperado: "#t" },
        { llamada: "(let ((r (nuevo-rec))) (eq? (apply-env r 'sube) (apply-env r 'sube)))", esperado: "#t" },
        { llamada: "(let ((r (nuevo-rec))) (closure->body (apply-env (closure->amb (apply-env r 'sube)) 'baja)))", esperado: "cuerpo-baja" },
        { llamada: "(let ((r (nuevo-rec))) (apply-env (closure->amb (apply-env r 'baja)) 'tope))", esperado: "6" },
        { llamada: "(apply-env (ambiente-extendido-recursivo '() '() '() base-rec) 'tope)", esperado: "6" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (llamada === "(procval? (apply-env (nuevo-rec) 'baja))" && obtenido === "#f") {
          return "La celda de baja no tiene una clausura: quedó con el 0 con " +
            "que make-vector llena. Revise que pos avance con (+ pos 1).";
        }
        if (llamada.indexOf("(eq? (closure->amb (apply-env r 'sube)) r)") !== -1 && obtenido === "#f") {
          return "La clausura capturó otro ambiente, probablemente old-env. " +
            "Tiene que capturar amb, el eslabón que la guarda; si no, desde " +
            "el cuerpo de sube no se alcanza a baja ni a sube.";
        }
        if (llamada === "(closure->body (apply-env (nuevo-rec) 'baja))" && obtenido === "cuerpo-sube") {
          return "La celda de baja quedó con la clausura de sube. Cada " +
            "clausura va en la posición pos y la siguiente en (+ pos 1).";
        }
        return "El vector mide (length procnames); el eslabón se arma con " +
          "vec-clausuras; al acabar la lista se devuelve amb; cada clausura " +
          "captura amb; y pos avanza con (+ pos 1).";
      },
      cierre:
        "Las dos clausuras capturan el mismo eslabón, y desde el ambiente de " +
        "sube se encuentra baja. Cada nombre tiene una sola clausura, hecha " +
        "al evaluar el letrec: dos consultas por sube devuelven el mismo " +
        "objeto, mientras que el marco recursivo de EOPL §3.4 fabricaba una " +
        "nueva en cada consulta. Que el eslabón exista antes que las " +
        "clausuras es lo que vector-set! hace posible."
    },
    {
      id: "ambiente-recorrer",
      titulo: "5. Un cliente que recorre la cadena",
      enunciado:
        "Dos recorridos de la cadena, del eslabón más nuevo al más viejo. " +
        "<code>contar-celdas</code> suma el largo del vector de cada " +
        "eslabón. <code>ligaduras</code> devuelve la lista de " +
        "<code>(nombre valor)</code>, apoyada en " +
        "<code>ligaduras-eslabon</code>, que avanza a la vez por los nombres " +
        "y por las posiciones del vector. Un nombre repetido aparece tantas " +
        "veces como esté en la cadena. Sobre el ambiente recursivo las " +
        "pruebas cuentan o sacan una sola ligadura, porque la lista completa " +
        "incluye clausuras cíclicas.",
      gramatica: DATATYPE_AMB,
      esqueleto:
        REFERENCIA + CONVENIENCIA + APLICA_REF + APLICA + NUEVO_TALLER +
        CLAUSURAS + BASE_REC + RECURSIVO + NUEVO_REC + "\n" +
        "(define contar-celdas\n" +
        "  (lambda (env)\n" +
        "    (cases ambiente env\n" +
        "      (ambiente-vacio () ???)\n" +
        "      (ambiente-extendido-ref (lids vec old-env) ???))))\n" +
        "\n" +
        "(define ligaduras\n" +
        "  (lambda (env)\n" +
        "    (cases ambiente env\n" +
        "      (ambiente-vacio () '())\n" +
        "      (ambiente-extendido-ref (lids vec old-env)\n" +
        "        (append ??? ???)))))\n" +
        "\n" +
        "(define ligaduras-eslabon\n" +
        "  (lambda (lids vec pos)\n" +
        "    (if (null? lids)\n" +
        "        '()\n" +
        "        (cons ??? ???))))\n",
      pruebas: [
        { llamada: "(contar-celdas (ambiente-vacio))", esperado: "0" },
        { llamada: "(contar-celdas (nuevo-taller))", esperado: "5" },
        { llamada: "(ligaduras (nuevo-taller))", esperado: "((m 30) (n 11) (k 2) (m 64) (r 9))" },
        { llamada: "(let ((e (nuevo-taller))) (begin (asignar! e 'm 0) (ligaduras e)))", esperado: "((m 0) (n 11) (k 2) (m 64) (r 9))" },
        { llamada: "(contar-celdas (nuevo-rec))", esperado: "3" },
        { llamada: "(length (ligaduras (nuevo-rec)))", esperado: "3" },
        { llamada: "(list-ref (ligaduras (nuevo-rec)) 2)", esperado: "(tope 6)" },
        { llamada: "(car (car (ligaduras (nuevo-rec))))", esperado: "sube" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (llamada === "(contar-celdas (nuevo-taller))" && obtenido === "2") {
          return "Se contaron eslabones, no celdas. Cada eslabón aporta " +
            "(vector-length vec).";
        }
        if (llamada === "(contar-celdas (nuevo-taller))" && obtenido === "3") {
          return "Solo se contó el primer eslabón. Hay que sumarle " +
            "(contar-celdas old-env).";
        }
        if (llamada === "(ligaduras (nuevo-taller))" && obtenido === "((m 30) (n 11))") {
          return "Falta seguir la cadena: append junta las ligaduras del " +
            "eslabón con (ligaduras old-env).";
        }
        if (llamada === "(ligaduras (nuevo-taller))" && obtenido.indexOf("((k 2)") === 0) {
          return "El orden quedó al revés: primero van las del eslabón más " +
            "nuevo y después las de old-env.";
        }
        if (llamada === "(ligaduras (nuevo-taller))" && obtenido.indexOf("(m 11)") !== -1) {
          return "Los valores quedaron corridos. ligaduras-eslabon empieza " +
            "en la posición 0 y avanza con (+ pos 1) junto con (cdr lids).";
        }
        return "contar-celdas suma (vector-length vec) y lo de old-env. " +
          "ligaduras junta (ligaduras-eslabon lids vec 0) con " +
          "(ligaduras old-env); cada paso arma (list (car lids) " +
          "(vector-ref vec pos)).";
      },
      cierre:
        "Las cinco celdas de amb-taller aparecen todas, incluida la m con " +
        "64 que ninguna consulta alcanza. Después de asignar 0 a m, la lista " +
        "cambia en la primera ligadura y no en la cuarta. El ambiente " +
        "recursivo tiene 3 celdas: las clausuras de sube y baja y el tope " +
        "de abajo."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = RETOS; }

/* --- Interfaz ----------------------------------------------------- */
if (typeof document !== "undefined") {
  MotorRetos.montar({ retos: RETOS, destino: "retos", cierre: "carta-cierre" });
  MotorRetos.montarConsola();
}
