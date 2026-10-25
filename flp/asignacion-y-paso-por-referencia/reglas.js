/* Las cláusulas de set y begin en el evaluador de 1 Asignacion: qué usa
   set-exp y por qué, qué devuelven set y begin, cómo let-exp arma su eslabón
   con list->vector, y por qué cada aplicación crea celdas nuevas. */
var BLOQUES = (function () {
  "use strict";

  function programa(texto) { return '<code class="programa">' + texto + "</code>"; }

  var SET_EXP =
    "(set-exp (id exp)\n" +
    "  (begin\n" +
    "    (setref! (apply-env-ref amb id)\n" +
    "             (evaluar-expresion exp amb))\n" +
    "    1))\n\n" +
    "(define apply-env\n" +
    "  (lambda (env var)\n" +
    "    (deref (apply-env-ref env var))))";

  var BEGIN_EXP =
    "(begin-exp (exp lexp)\n" +
    "  (letrec\n" +
    "      ((evaluar-secuencia\n" +
    "        (lambda (primera resto)\n" +
    "          (if (null? resto)\n" +
    "              (evaluar-expresion primera amb)\n" +
    "              (begin\n" +
    "                (evaluar-expresion primera amb)\n" +
    "                (evaluar-secuencia (car resto) (cdr resto)))))))\n" +
    "    (evaluar-secuencia exp lexp)))";

  var LET_EXP =
    "(let-exp (ids rands body)\n" +
    "  (let ((lvalues (map (lambda (x) (evaluar-expresion x amb)) rands)))\n" +
    "    (evaluar-expresion body (ambiente-extendido ids lvalues amb))))\n\n" +
    "(define ambiente-extendido\n" +
    "  (lambda (lids lvalue old-env)\n" +
    "    (ambiente-extendido-ref lids (list-&gt;vector lvalue) old-env)))";

  var APP_EXP =
    "(closure (lid body old-env)\n" +
    "  (if (= (length lid) (length lrands))\n" +
    "      (evaluar-expresion body\n" +
    "                         (ambiente-extendido lid lrands old-env))\n" +
    "      ...))";

  var MK = "let mk = proc(n) proc() begin set n = add1(n); n end in ";

  return [
    {
      id: "reglas-set-exp",
      titulo: "1. Qué usa set-exp y por qué",
      definicion: SET_EXP,
      explicacion:
        "La cláusula de <code>set</code> en <code>interprete.rkt</code> " +
        "(EOPL §4.2). <code>apply-env-ref</code> devuelve la celda de un " +
        "nombre y <code>apply-env</code> devuelve lo que hay en ella. Todo " +
        "se midió en el intérprete de asignación, donde el ambiente inicial " +
        "liga x = 4, y = 2, z = 5 sobre a = 4, b = 5, c = 6.",
      items: [
        { valor: "<code>(apply-env-ref ambiente-inicial 'y)</code> devuelve",
          opciones: ["<code>2</code>",
                     "<code>(a-ref 1 #(4 2 5))</code>",
                     "<code>(a-ref 0 #(2))</code>"],
          correcta: 1,
          razon: "Una referencia: la posición 1 del vector del primer eslabón, que guarda x, y, z en ese orden. El vector es el mismo objeto que tiene el ambiente, no una copia, y por eso escribir en esa referencia cambia lo que verán las búsquedas siguientes. El 2 es lo que devuelve apply-env." },
        { valor: "Si set-exp llamara <code>apply-env</code> en vez de <code>apply-env-ref</code>, " +
            programa("begin set x = 7; +(x, a) end"),
          opciones: ["vale 11, igual que ahora",
                     "vale 8: el set no cambia nada",
                     "se detiene: setref! recibe el número 4"],
          correcta: 2,
          razon: "Se detiene. apply-env devuelve 4, el contenido de la celda de x, y setref! hace cases referencia sobre ese 4. Una copia del intérprete con ese cambio responde “cases: not a referencia: 4”. Con el número no hay dónde escribir; set necesita la celda. El original vale 11." },
        { valor: "Con esa misma copia, un programa sin ningún set, como " + programa("let x = 10 w = add1(x) in w"),
          opciones: ["corre igual: vale 5", "se detiene en la primera variable", "vale 11"],
          correcta: 0,
          razon: "Corre igual y vale 5. El cambio solo toca la cláusula set-exp; var-exp sigue usando apply-env, que por dentro sigue llamando apply-env-ref y luego deref. Lo que se rompe es la asignación, no la lectura." },
        { valor: "En " + programa("+(let y = 1 in begin set y = 9; y end, y)") + ", el set y = 9 escribe en",
          opciones: ["la celda de y del ambiente inicial",
                     "las dos celdas",
                     "la celda del let, en el vector #(1)"],
          correcta: 2,
          razon: "apply-env-ref devuelve la primera celda con ese nombre empezando por el eslabón más nuevo, que es el del let. El programa vale 9 + 2 = 11: el segundo argumento del + se evalúa fuera del let y lee la y del ambiente inicial, intacta." },
        { valor: programa("set w = (y 3)") + " se detiene con",
          opciones: ["“El operador no evaluó a un procedimiento: 2”",
                     "“No se encuentra la variable: w”",
                     "no se detiene: vale 1"],
          correcta: 1,
          razon: "La búsqueda de la celda va primero: apply-env-ref es el primer argumento de setref! y se evalúa antes que la parte derecha. Como w no está ligada, el programa se detiene sin llegar a aplicar y, que vale 2. La escritura sí ocurre al final, cuando ya se tienen la celda y el valor. Los dos intérpretes dan el mismo mensaje." }
      ],
      cierre:
        "set necesita la celda y no su contenido, y apply-env-ref existe para " +
        "dársela. apply-env es apply-env-ref seguido de deref: la misma " +
        "búsqueda, con un paso más al final que set no puede dar."
    },
    {
      id: "reglas-valores-de-set-y-begin",
      titulo: "2. Qué devuelve set y qué hace begin con lo de en medio",
      definicion: BEGIN_EXP,
      explicacion:
        "set devuelve 1 después de escribir, y la cláusula de " +
        "<code>begin</code> evalúa cada expresión y solo devuelve el valor de " +
        "la última. Diga cuánto vale cada programa en el intérprete de " +
        "asignación.",
      items: [
        { valor: programa("+(set x = 5, x)"),
          opciones: ["6", "10", "5"],
          correcta: 0,
          razon: "El primer argumento vale 1, el de set, y deja la celda de x en 5. El segundo se evalúa después y lee ese 5. 1 + 5 = 6." },
        { valor: programa("let w = 0 in begin +(w, 100); w end"),
          opciones: ["100", "0", "1"],
          correcta: 1,
          razon: "La suma da 100 y evaluar-secuencia lo descarta: lo calcula y no lo guarda en ningún lado. Una expresión intermedia de un begin solo deja rastro si escribe una celda, y +(w, 100) no escribe nada." },
        { valor: programa("let w = 3 in begin w; set w = 4 end"),
          opciones: ["1", "4", "3"],
          correcta: 0,
          razon: "La última expresión es el set, y set vale 1. El 4 queda en la celda de w, pero nadie la lee después. La w del principio se evalúa a 3 y se descarta." },
        { valor: programa("if set x = 1 then 2 else 3"),
          opciones: ["2", "3", "se detiene: la condición vale 1, que no es booleano"],
          correcta: 2,
          razon: "Se detiene con “La condición de un if debe evaluarse a un booleano, se obtuvo: 1”. La celda de x sí quedó en 1, pero eso no importa: el if mira el valor de la condición, y el de set es 1." },
        { valor: programa("let w = set x = 9 in +(w, x)"),
          opciones: ["18", "10", "9"],
          correcta: 1,
          razon: "La parte derecha del let escribe 9 en la celda de x y devuelve 1, y ese 1 queda en la celda nueva de w. El cuerpo suma 1 + 9." },
        { valor: programa("*(set y = 10, set z = 10)"),
          opciones: ["100", "20", "1"],
          correcta: 2,
          razon: "Cada set escribe 10 en su celda y devuelve 1, así que la primitiva recibe 1 y 1. Las celdas de y y z cambiaron, pero el producto solo ve los valores de las dos expresiones." }
      ],
      cierre:
        "set y begin separan lo que se calcula de lo que queda. set deja su " +
        "efecto en la celda y devuelve un 1 que no dice nada; begin descarta " +
        "todos los valores menos el último. Lo único que pasa de una " +
        "expresión intermedia a la siguiente es lo que se escribió en las celdas."
    },
    {
      id: "reglas-let-exp",
      titulo: "3. let-exp y el eslabón con vector",
      definicion: LET_EXP,
      explicacion:
        "<code>let-exp</code> sigue entregando una lista de valores, y " +
        "<code>ambiente-extendido</code> la convierte en el vector del " +
        "eslabón: cada posición de ese vector es una celda. Elija la " +
        "respuesta para cada renglón.",
      items: [
        { valor: "<code>let-exp</code> le entrega a <code>ambiente-extendido</code>",
          opciones: ["una lista de valores", "un vector de valores", "una lista de referencias"],
          correcta: 0,
          razon: "Una lista, la que arma map sobre las partes derechas. El paso a vector lo hace ambiente-extendido por dentro con list->vector, y por eso let-exp quedó igual que antes de agregar set." },
        { valor: "<code>let u = 1 v = 2 w = 3 in ...</code> crea",
          opciones: ["tres eslabones de una celda cada uno",
                     "tres referencias sueltas, sin eslabón",
                     "un eslabón con un vector de tres celdas"],
          correcta: 2,
          razon: "Un solo eslabón: los tres nombres en la lista lids y los tres valores en el vector #(1 2 3). Las referencias no se guardan en ninguna parte: apply-env-ref las arma cuando alguien busca un nombre." },
        { valor: "En ese eslabón, <code>apply-env-ref</code> de v devuelve",
          opciones: ["<code>(a-ref 2 #(1 2 3))</code>",
                     "<code>(a-ref 1 #(1 2 3))</code>",
                     "<code>2</code>"],
          correcta: 1,
          razon: "La posición de v en la lista de nombres, que cuenta desde 0, y el vector del eslabón. Por esa referencia escribe el set de let u = 1 v = 2 w = 3 in begin set v = +(u, w); v end, que vale 4." },
        { valor: programa("let x = 10 w = add1(x) in w") + " vale, en el intérprete de asignación",
          opciones: ["5", "11", "se detiene"],
          correcta: 0,
          razon: "Vale 5: map evalúa todas las partes derechas en amb, el ambiente de afuera, antes de crear el eslabón. Ahí x es la del ambiente inicial, que vale 4. En el intérprete de paso por referencia el mismo programa vale 2, porque allí x empieza en 1." },
        { valor: "Si <code>ambiente-extendido</code> pasara la lista sin <code>list-&gt;vector</code>",
          opciones: ["los let funcionan y set falla",
                     "el intérprete no llega a cargar",
                     "nada cambia"],
          correcta: 1,
          razon: "El campo lvalue de ambiente-extendido-ref exige vector?, y el ambiente inicial se arma con ambiente-extendido. Una copia con ese cambio se detiene al cargar ambiente.rkt con “ambiente-extendido-ref: bad value for lvalue field: '(4 5 6)”, antes de leer ningún programa." }
      ],
      cierre:
        "El vector es lo que vuelve celdas a las ligaduras: vector-set! puede " +
        "cambiar una posición sin crear otro eslabón. let-exp no se enteró " +
        "del cambio, porque la conversión vive en el constructor."
    },
    {
      id: "reglas-celdas-por-aplicacion",
      titulo: "4. Cada aplicación crea celdas nuevas",
      definicion: APP_EXP,
      explicacion:
        "Al aplicar una clausura, la cláusula <code>app-exp</code> extiende " +
        "el ambiente que la clausura capturó con un eslabón nuevo para sus " +
        "parámetros, armado con <code>ambiente-extendido</code> y por tanto " +
        "con celdas nuevas. Los programas se midieron en el intérprete de " +
        "asignación.",
      items: [
        { valor: programa(MK + "let c1 = (mk 0) c2 = (mk 0) in begin (c1); (c1); (c2) end"),
          opciones: ["1", "3", "2"],
          correcta: 0,
          razon: "Vale 1. Cada (mk 0) crea su propia celda para n, y la clausura que devuelve captura esa celda. c1 incrementa la suya dos veces; c2 tiene otra, que pasa de 0 a 1." },
        { valor: programa(MK + "let c1 = (mk 0) in let c2 = c1 in begin (c1); (c1); (c2) end"),
          opciones: ["1", "2", "3"],
          correcta: 2,
          razon: "Vale 3. Hubo una sola aplicación de mk, así que hay una sola celda para n. let c2 = c1 copia la clausura, y la clausura copiada sigue apuntando al mismo eslabón." },
        { valor: "En el primer programa, la evaluación completa crea, para n,",
          opciones: ["una celda", "dos celdas", "cuatro celdas"],
          correcta: 1,
          razon: "Dos, una por cada aplicación de mk. Las tres llamadas a c1 y c2 también crean eslabones, pero vacíos, porque proc() no tiene parámetros; el set de adentro escribe en la celda de n que la clausura capturó." },
        { valor: programa("let n = 5 in let borra = proc(n) set n = 0 in begin (borra n); n end"),
          opciones: ["0", "1", "5"],
          correcta: 2,
          razon: "Vale 5. El parámetro se llama n a propósito, igual que la variable de afuera: al aplicar borra, la n del parámetro es una celda nueva con una copia del 5, y el set escribe ahí. En el intérprete de paso por referencia el mismo programa vale 0." },
        { valor: programa("let w = 5 in let borra = proc() set w = 0 in begin (borra); w end"),
          opciones: ["0", "5", "1"],
          correcta: 0,
          razon: "Vale 0. borra no tiene parámetros, así que su eslabón de llamada está vacío y el set busca w más arriba, en el ambiente que capturó la clausura: la celda del let. Lo que protege a una variable es tener un parámetro con su propia celda, y aquí no lo hay." },
        { valor: programa("let s = 1 in let f = proc(t) begin set t = 50; s end in (f s)"),
          opciones: ["50", "51", "1"],
          correcta: 2,
          razon: "Vale 1. El operando s se evalúa a 1 y ese 1 entra en una celda nueva para t; el set escribe 50 en esa celda y el cuerpo devuelve s, intacta. En paso por referencia t compartiría la celda de s y el programa valdría 50." }
      ],
      cierre:
        "Que cada aplicación cree celdas nuevas es lo que hace de este " +
        "intérprete uno de paso por valor: el parámetro arranca con una " +
        "copia. Las asignaciones que sí salen del procedimiento son las que " +
        "caen en celdas que la clausura capturó, no en las de sus parámetros."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
