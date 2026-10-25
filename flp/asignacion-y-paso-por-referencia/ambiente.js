/* El ambiente que liga nombres a referencias (EOPL §4.3). Cinco retos sobre
   src/ambiente.rkt del intérprete con asignación: reservar una celda por
   valor, apply-env que devuelve la referencia, leer y asignar una variable,
   el marco de letrec que reserva una celda en cada búsqueda y el ambiente
   inicial que se construye de nuevo en cada programa. El código del
   estudiante corre sobre mini-scheme.js. */
var ALMACEN =
  "(define-datatype referencia referencia?\n" +
  "  (a-ref (pos number?)))\n" +
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
  "      (a-ref (pos) (set! el-almacen (reemplazar-celda el-almacen pos val))))))\n";

var DATATYPES =
  ";; La clausura guarda el cuerpo como un símbolo, para no cargar el árbol.\n" +
  "(define-datatype procval procval?\n" +
  "  (closure (ids (list-of symbol?)) (cuerpo symbol?) (env (lambda (v) #t))))\n" +
  "(define-datatype ambiente ambiente?\n" +
  "  (ambiente-vacio)\n" +
  "  (ambiente-extendido\n" +
  "   (lids (list-of symbol?)) (lrefs (list-of referencia?)) (old-env ambiente?))\n" +
  "  (ambiente-extendido-recursivo\n" +
  "   (procnames (list-of symbol?)) (idss (list-of (list-of symbol?)))\n" +
  "   (cuerpos (list-of symbol?)) (old-env ambiente?)))\n";

var RESERVAR =
  "(define reservar\n" +
  "  (lambda (vals)\n" +
  "    (if (null? vals) '()\n" +
  "        (let ((r (newref (car vals)))) (cons r (reservar (cdr vals)))))))\n" +
  "(define ligar\n" +
  "  (lambda (ids vals env) (ambiente-extendido ids (reservar vals) env)))\n";

var APPLY_ENV =
  "(define apply-env\n" +
  "  (lambda (env var)\n" +
  "    (cases ambiente env\n" +
  "      (ambiente-vacio () 'no-ligada)\n" +
  "      (ambiente-extendido (lids lrefs old-env)\n" +
  "        (buscar lids lrefs var old-env))\n" +
  "      (ambiente-extendido-recursivo (procnames idss cuerpos old-env)\n" +
  "        (buscar-rec procnames idss cuerpos var env old-env)))))\n" +
  "(define buscar\n" +
  "  (lambda (lids lrefs var old-env)\n" +
  "    (cond [(null? lids) (apply-env old-env var)]\n" +
  "          [(eq? (car lids) var) (car lrefs)]\n" +
  "          [else (buscar (cdr lids) (cdr lrefs) var old-env)])))\n" +
  "(define buscar-rec\n" +
  "  (lambda (procnames idss cuerpos var env old-env)\n" +
  "    (cond [(null? procnames) (apply-env old-env var)]\n" +
  "          [(eq? (car procnames) var) (newref (closure (car idss) (car cuerpos) env))]\n" +
  "          [else (buscar-rec (cdr procnames) (cdr idss) (cdr cuerpos) var env old-env)])))\n";

var RETOS = (function () {
  "use strict";
  return [
    {
      id: "ambiente-reservar",
      titulo: "1. Una celda por cada valor",
      enunciado:
        "<code>let-exp</code> liga sus variables con " +
        "<code>(ambiente-extendido ids (map newref lvalues) amb)</code>. Este " +
        "evaluador no tiene <code>map</code>: escriba <code>reservar</code>, " +
        "que recibe la lista de valores y devuelve la lista de referencias, una " +
        "<code>newref</code> por valor y en el mismo orden. Con ella, " +
        "<code>ligar</code> arma el eslabón.",
      gramatica: null,
      esqueleto:
        ALMACEN + "\n" + DATATYPES + "\n" +
        ";; reservar : Lista de valores -> Lista de referencias\n" +
        "(define reservar\n" +
        "  (lambda (vals)\n" +
        "    (if (null? vals)\n" +
        "        ???\n" +
        "        (let ((r ???))\n" +
        "          ???))))\n\n" +
        "(define ligar\n" +
        "  (lambda (ids vals env) (ambiente-extendido ids (reservar vals) env)))\n",
      pruebas: [
        { llamada: "(begin (initialize-store!) (reservar '(4 2 5)))", esperado: "((a-ref 0) (a-ref 1) (a-ref 2))" },
        { llamada: "(begin (initialize-store!) (reservar '(4 2 5)) el-almacen)", esperado: "(4 2 5)" },
        { llamada: "(begin (initialize-store!) (reservar '()))", esperado: "()" },
        { llamada: "(begin (initialize-store!) (reservar '(7)) (reservar '(8 9)))", esperado: "((a-ref 1) (a-ref 2))" },
        { llamada: "(begin (initialize-store!) (ligar '(m n) '(10 20) (ambiente-vacio)))", esperado: "(ambiente-extendido (m n) ((a-ref 0) (a-ref 1)) (ambiente-vacio))" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (esperado === "(4 2 5)" && obtenido === "(5 2 4)") {
          return "Las celdas quedaron al revés. La newref de (car vals) tiene que " +
            "ocurrir antes de la llamada recursiva: por eso va en el let.";
        }
        if (/^\(\(a-ref 0\)/.test(obtenido) && esperado === "((a-ref 1) (a-ref 2))") {
          return "Las celdas no siguen después de las que ya había: newref ya lo " +
            "resuelve, así que no hay que contar nada a mano.";
        }
        return "El caso base devuelve '(); si no, r es (newref (car vals)) y el " +
          "resultado es (cons r (reservar (cdr vals))).";
      },
      cierre:
        "El orden importa porque newref tiene efecto: la primera variable del " +
        "let recibe la primera celda. Es el orden que muestra (almacen->lista) " +
        "en DrRacket."
    },
    {
      id: "ambiente-apply-env",
      titulo: "2. apply-env devuelve la referencia",
      enunciado:
        "Escriba el caso <code>ambiente-extendido</code> de " +
        "<code>apply-env</code> con su auxiliar <code>buscar</code>: recorre " +
        "las dos listas parejas y devuelve la <strong>referencia</strong> del " +
        "nombre, no lo que hay en su celda. Si el nombre no está en el " +
        "eslabón, sigue por <code>old-env</code>. En el ambiente vacío devuelve " +
        "<code>no-ligada</code> (en Racket es un <code>eopl:error</code>).",
      gramatica: null,
      esqueleto:
        ALMACEN + "\n" + DATATYPES + "\n" + RESERVAR + "\n" +
        "(define apply-env\n" +
        "  (lambda (env var)\n" +
        "    (cases ambiente env\n" +
        "      (ambiente-vacio () 'no-ligada)\n" +
        "      (ambiente-extendido (lids lrefs old-env)\n" +
        "        (buscar lids lrefs var old-env))\n" +
        "      (ambiente-extendido-recursivo (procnames idss cuerpos old-env)\n" +
        "        'sin-implementar))))\n\n" +
        "(define buscar\n" +
        "  (lambda (lids lrefs var old-env)\n" +
        "    (cond [(null? lids) ???]\n" +
        "          [(eq? (car lids) var) ???]\n" +
        "          [else ???])))\n\n" +
        "(define e (begin (initialize-store!)\n" +
        "                 (ligar '(m) '(1) (ligar '(n m) '(2 3) (ambiente-vacio)))))\n",
      pruebas: [
        { llamada: "(apply-env e 'n)", esperado: "(a-ref 0)" },
        { llamada: "(apply-env e 'm)", esperado: "(a-ref 2)" },
        { llamada: "(deref (apply-env e 'm))", esperado: "1" },
        { llamada: "(apply-env e 'k)", esperado: "no-ligada" },
        { llamada: "el-almacen", esperado: "(2 3 1)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (llamada === "(apply-env e 'm)" && obtenido === "(a-ref 1)") {
          return "Encontró la m de abajo. La búsqueda empieza en el eslabón más " +
            "nuevo, que se armó al final con la celda 2.";
        }
        if (/^[0-9]+$/.test(obtenido) && /a-ref/.test(esperado)) {
          return "Salió el contenido de la celda. apply-env devuelve (car lrefs), " +
            "la referencia; el deref lo hace quien lee.";
        }
        if (esperado === "no-ligada") {
          return "Cuando el eslabón se acaba sin encontrar el nombre, sigue con " +
            "(apply-env old-env var), y el ambiente vacío responde no-ligada.";
        }
        return "Lista vacía: (apply-env old-env var). Nombre igual: (car lrefs). Si " +
          "no: (buscar (cdr lids) (cdr lrefs) var old-env).";
      },
      cierre:
        "Hay dos m en la cadena con dos celdas distintas: la de arriba, la 2, " +
        "tapa a la 1. Un set m escribiría en la celda 2 y dejaría la 1 con 3, " +
        "que ninguna búsqueda vuelve a alcanzar."
    },
    {
      id: "ambiente-leer-asignar",
      titulo: "3. Leer y asignar una variable",
      enunciado:
        "Con <code>apply-env</code> ya escrito, escriba <code>leer</code>, que " +
        "es lo que hace <code>var-exp</code>, y <code>asignar!</code>, que es " +
        "lo que hace <code>set-exp</code>: busca la referencia, escribe y " +
        "devuelve 1.",
      gramatica: null,
      esqueleto:
        ALMACEN + "\n" + DATATYPES + "\n" + RESERVAR + "\n" + APPLY_ENV + "\n" +
        ";; leer : Ambiente x Símbolo -> Valor\n" +
        "(define leer\n" +
        "  (lambda (env var) ???))\n\n" +
        ";; asignar! : Ambiente x Símbolo x Valor -> 1\n" +
        "(define asignar!\n" +
        "  (lambda (env var val)\n" +
        "    (begin ??? 1)))\n\n" +
        "(define e (begin (initialize-store!)\n" +
        "                 (ligar '(m) '(1) (ligar '(n m) '(2 3) (ambiente-vacio)))))\n",
      pruebas: [
        { llamada: "(leer e 'n)", esperado: "2" },
        { llamada: "(leer e 'm)", esperado: "1" },
        { llamada: "(asignar! e 'n 40)", esperado: "1" },
        { llamada: "(list (leer e 'n) el-almacen)", esperado: "(40 (40 3 1))" },
        { llamada: "(begin (asignar! e 'm 0) el-almacen)", esperado: "(40 3 0)" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (/a-ref/.test(obtenido)) {
          return "leer tiene que devolver el contenido: (deref (apply-env env var)).";
        }
        if (esperado === "(40 3 0)" && obtenido === "(40 0 1)") {
          return "Escribió en la m de abajo. asignar! usa la misma referencia que " +
            "encuentra apply-env, la del eslabón más nuevo.";
        }
        return "leer: (deref (apply-env env var)). asignar!: (setref! (apply-env " +
          "env var) val) y después 1.";
      },
      cierre:
        "Las dos operaciones empiezan con la misma búsqueda. Una termina " +
        "leyendo y la otra escribiendo, y por eso una asignación se ve en toda " +
        "lectura posterior que llegue a la misma referencia."
    },
    {
      id: "ambiente-recursivo",
      titulo: "4. El marco de letrec reserva al buscar",
      enunciado:
        "Escriba <code>buscar-rec</code>, el caso del marco recursivo: si el " +
        "nombre está entre <code>procnames</code>, fabrica la clausura con sus " +
        "parámetros, su cuerpo y el marco mismo (<code>env</code>, no " +
        "<code>old-env</code>), le reserva una celda y devuelve la referencia. " +
        "Si no está, sigue por <code>old-env</code>.",
      gramatica: null,
      esqueleto:
        ALMACEN + "\n" + DATATYPES + "\n" + RESERVAR + "\n" +
        "(define apply-env\n" +
        "  (lambda (env var)\n" +
        "    (cases ambiente env\n" +
        "      (ambiente-vacio () 'no-ligada)\n" +
        "      (ambiente-extendido (lids lrefs old-env)\n" +
        "        (buscar lids lrefs var old-env))\n" +
        "      (ambiente-extendido-recursivo (procnames idss cuerpos old-env)\n" +
        "        (buscar-rec procnames idss cuerpos var env old-env)))))\n" +
        "(define buscar\n" +
        "  (lambda (lids lrefs var old-env)\n" +
        "    (cond [(null? lids) (apply-env old-env var)]\n" +
        "          [(eq? (car lids) var) (car lrefs)]\n" +
        "          [else (buscar (cdr lids) (cdr lrefs) var old-env)])))\n\n" +
        "(define buscar-rec\n" +
        "  (lambda (procnames idss cuerpos var env old-env)\n" +
        "    (cond [(null? procnames) ???]\n" +
        "          [(eq? (car procnames) var) ???]\n" +
        "          [else ???])))\n\n" +
        "(define marco (begin (initialize-store!)\n" +
        "  (ambiente-extendido-recursivo '(par impar) '((n) (n)) '(cuerpo-par cuerpo-impar)\n" +
        "    (ligar '(k) '(7) (ambiente-vacio)))))\n",
      pruebas: [
        { llamada: "(apply-env marco 'impar)", esperado: "(a-ref 1)" },
        { llamada: "(deref (apply-env marco 'par))", esperado: "(closure (n) cuerpo-par " +
            "(ambiente-extendido-recursivo (par impar) ((n) (n)) (cuerpo-par cuerpo-impar) " +
            "(ambiente-extendido (k) ((a-ref 0)) (ambiente-vacio))))" },
        { llamada: "(cases procval (deref (apply-env marco 'impar)) (closure (ids c amb) (eq? amb marco)))", esperado: "#t" },
        { llamada: "(deref (apply-env marco 'k))", esperado: "7" },
        { llamada: "(length el-almacen)", esperado: "4" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (esperado === "#t" && obtenido === "#f") {
          return "La clausura capturó old-env. Tiene que capturar el marco mismo, " +
            "env, para que el cuerpo vuelva a encontrar par e impar.";
        }
        if (llamada === "(apply-env marco 'impar)" && /closure/.test(obtenido)) {
          return "Salió la clausura. apply-env devuelve una referencia: la clausura " +
            "va dentro de un newref.";
        }
        if (esperado === "4") {
          return "Cada búsqueda de un nombre del marco reserva una celda. k ya " +
            "tenía la 0, y hubo tres búsquedas de par o impar: cuatro celdas. La " +
            "búsqueda de k no reserva nada.";
        }
        return "Lista vacía: (apply-env old-env var). Nombre igual: (newref " +
          "(closure (car idss) (car cuerpos) env)). Si no: seguir con las tres " +
          "colas.";
      },
      cierre:
        "Cada búsqueda deja una celda con una clausura recién hecha. Por eso " +
        "un set sobre un nombre de letrec no se ve: escribe en la celda de esa " +
        "búsqueda, y la siguiente búsqueda reserva otra."
    },
    {
      id: "ambiente-inicial",
      titulo: "5. El ambiente inicial, de nuevo en cada programa",
      enunciado:
        "Escriba <code>ambiente-inicial</code> como un procedimiento sin " +
        "argumentos: <code>[x=4, y=2, z=5]</code> sobre " +
        "<code>[a=4, b=5, c=6]</code>, con las celdas de x, y, z primero, en " +
        "las posiciones 0 a 2, y las de a, b, c después. Tiene " +
        "<code>reservar</code> y <code>ligar</code>. Ojo con el orden: " +
        "<code>ligar</code> reserva dentro de su cuerpo, después de evaluar " +
        "sus tres argumentos.",
      gramatica: null,
      esqueleto:
        ALMACEN + "\n" + DATATYPES + "\n" + RESERVAR + "\n" + APPLY_ENV + "\n" +
        "(define leer (lambda (env var) (deref (apply-env env var))))\n\n" +
        "(define ambiente-inicial\n" +
        "  (lambda ()\n" +
        "    ???))\n",
      pruebas: [
        { llamada: "(begin (initialize-store!) (ambiente-inicial) el-almacen)", esperado: "(4 2 5 4 5 6)" },
        { llamada: "(begin (initialize-store!) (apply-env (ambiente-inicial) 'a))", esperado: "(a-ref 3)" },
        { llamada: "(begin (initialize-store!) (leer (ambiente-inicial) 'z))", esperado: "5" },
        { llamada: "(begin (initialize-store!) (ambiente-inicial) (ambiente-inicial) (length el-almacen))", esperado: "12" }
      ],
      pistas: function (llamada, esperado, obtenido) {
        if (esperado === "(4 2 5 4 5 6)" && obtenido === "(4 5 6 4 2 5)") {
          return "Las celdas de a, b y c quedaron primero. En (ligar '(x y z) " +
            "'(4 2 5) (ligar '(a b c) …)), el ligar de adentro es un argumento " +
            "y corre antes de que el de afuera reserve. Reserve x, y, z primero " +
            "con reservar en un let, y arme el eslabón con ambiente-extendido.";
        }
        return "(let ((refs (reservar '(4 2 5)))) (ambiente-extendido '(x y z) " +
          "refs (ligar '(a b c) '(4 5 6) (ambiente-vacio)))).";
      },
      cierre:
        "Cada llamada reserva seis celdas nuevas. evaluar-programa vacía el " +
        "almacén y llama a ambiente-inicial, así que todo programa encuentra " +
        "x, y, z, a, b y c en las celdas 0 a 5, sin rastro del anterior."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = RETOS; }

if (typeof document !== "undefined") {
  MotorRetos.montar({ retos: RETOS, destino: "retos", cierre: "carta-cierre" });
  MotorRetos.montarConsola();
}
