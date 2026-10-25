/* El almacén (EOPL §4.2): qué hace cada operación sobre la lista de celdas,
   qué queda en el almacén después de una secuencia y qué se puede afirmar
   de una referencia. Lo que aquí se afirma se corrió en Racket contra
   src/almacen.rkt de los intérpretes de Corte 2. */
var BLOQUES = (function () {
  "use strict";

  function codigo(texto) { return '<code class="programa">' + texto + "</code>"; }

  var INTERFAZ =
    "(define-datatype referencia referencia?\n" +
    "  (a-ref (pos integer?)))\n\n" +
    "empty-store       : () -&gt; Almacén\n" +
    "initialize-store! : () -&gt; no especificado\n" +
    "newref            : ExpVal -&gt; Ref\n" +
    "deref             : Ref -&gt; ExpVal\n" +
    "setref!           : Ref x ExpVal -&gt; no especificado";

  return [
    {
      id: "almacen-operaciones",
      titulo: "1. Qué le hace cada operación al almacén",
      definicion: INTERFAZ,
      explicacion:
        "El almacén es la lista de celdas que guarda <code>el-almacen</code>. " +
        "Para cada línea, diga qué le pasa a esa lista.",
      opciones: ["agrega una celda al final", "cambia una celda que ya existe",
                 "no cambia el almacén", "lo deja vacío"],
      items: [
        { valor: codigo("(newref 3)"), correcta: 0,
          razon: "newref hace append de (list 3) y devuelve (a-ref k), donde k es el tamaño que tenía el almacén antes de crecer." },
        { valor: codigo("(setref! (a-ref 0) 9)") + " sobre un almacén con dos celdas", correcta: 1,
          razon: "setref! arma con reemplazar-celda una lista igual salvo en la posición 0 y la deja en lugar de la vieja. El tamaño no cambia." },
        { valor: codigo("(deref (a-ref 1))"), correcta: 2,
          razon: "deref solo lee: list-ref sobre el almacén. Es la única de las tres operaciones del TAD que no tiene set!." },
        { valor: codigo("(initialize-store!)"), correcta: 3,
          razon: "Pone (empty-store), la lista vacía, en el-almacen. evaluar-programa la llama antes de cada programa." },
        { valor: codigo("(newref (a-ref 0))"), correcta: 0,
          razon: "Una referencia es un valor como cualquier otro, así que se puede guardar en una celda nueva. La celda nueva guarda la referencia, no lo que hay en la celda 0." }
      ],
      cierre:
        "Tres operaciones tocan la lista y una la lee. Solo newref la alarga: " +
        "setref! cambia una posición y deja el tamaño igual."
    },
    {
      id: "almacen-secuencias",
      titulo: "2. Después de la secuencia",
      definicion: null,
      explicacion:
        "Cada secuencia empieza con <code>(initialize-store!)</code> y corre " +
        "las líneas en orden. Escoja lo que pide cada renglón.",
      items: [
        { valor: codigo("(newref 1) (newref 2) (setref! (a-ref 0) 5)") + ": ¿qué queda en el almacén?",
          opciones: ["(1 2)", "(5 2)", "(1 2 5)", "(5)"], correcta: 1,
          razon: "Las dos newref dejan (1 2). setref! cambia la posición 0: (5 2). (almacen->lista) lo muestra como ((0 5) (1 2))." },
        { valor: codigo("(newref 4) (newref (a-ref 0)) (setref! (a-ref 0) 6)") +
            " y luego " + codigo("(deref (deref (a-ref 1)))"),
          opciones: ["4", "6", "(a-ref 0)", "un error"], correcta: 1,
          razon: "La celda 1 guarda la referencia (a-ref 0). El primer deref la devuelve y el segundo lee la celda 0, que ya cambió a 6. La celda 1 nunca se tocó: sigue apuntando a la misma celda." },
        { valor: codigo("(newref 7) (setref! (a-ref 0) 8) (newref 9)") + ": ¿qué devuelve la última línea?",
          opciones: ["(a-ref 2)", "(a-ref 1)", "9", "(a-ref 0)"], correcta: 1,
          razon: "El setref! no agregó nada, así que antes de la segunda newref el almacén tiene una sola celda y la nueva queda en la posición 1. El almacén termina en (8 9)." },
        { valor: codigo("(newref 1) (setref! (a-ref 0) 3) (setref! (a-ref 0) 4) (newref 2)") + ": ¿cuántas celdas hay?",
          opciones: ["2", "4", "3", "1"], correcta: 0,
          razon: "Dos newref, dos celdas. Las dos escrituras cayeron en la misma celda y la dejaron en 4: el almacén es (4 2)." },
        { valor: codigo("(newref 1) (newref 2) (setref! (a-ref 3) 1)"),
          opciones: ["agrega una celda en la posición 3", "escribe en la última celda", "levanta un error"], correcta: 2,
          razon: "reemplazar-celda recorre la lista buscando la posición 3 y se queda sin celdas: eopl:error con «La referencia no apunta a ninguna celda del almacén». setref! no hace crecer el almacén." }
      ],
      cierre:
        "Para seguir el almacén basta con dos reglas: cada newref agrega una " +
        "celda al final, y cada setref! cambia el contenido de una que ya existe."
    },
    {
      id: "almacen-referencias",
      titulo: "3. Qué se puede afirmar de una referencia",
      definicion: null,
      explicacion: "¿Cierto o falso?",
      opciones: ["Cierto", "Falso"],
      items: [
        { valor: "Después de <code>(setref! r 9)</code>, la referencia <code>r</code> es otra.", correcta: 1,
          razon: "r es (a-ref k) y sigue siéndolo. Lo que cambió es lo que hay en la celda k. Por eso todos los que tengan r ven el 9." },
        { valor: "Dos <code>(newref 5)</code> seguidos devuelven la misma referencia, porque guardan lo mismo.", correcta: 1,
          razon: "Devuelven (a-ref 0) y (a-ref 1): cada newref es una celda nueva, aunque guarde el mismo valor. En Racket, (equal? (newref 5) (newref 5)) da #f." },
        { valor: "La posición de la celda nueva es la longitud que tenía el almacén antes de crecer.", correcta: 0,
          razon: "newref calcula (length el-almacen) antes del append, y esa es la posición de la celda que agrega." },
        { valor: "En el lenguaje con referencias explícitas, <code>deref(0)</code> lee la primera celda.", correcta: 1,
          razon: "0 es un número, no una referencia. deref-exp verifica con referencia? y se detiene: «Se esperaba una referencia y se obtuvo: 0». Para eso está el datatype a-ref en lugar del entero desnudo." },
        { valor: "<code>setref!</code> puede cambiar el tamaño del almacén.", correcta: 1,
          razon: "Nunca: reemplazar-celda devuelve una lista del mismo largo, o levanta un error si la posición no existe." }
      ],
      cierre:
        "Una referencia nombra una celda y no cambia nunca; lo que cambia es la " +
        "celda. Esa es toda la diferencia entre ligar y asignar."
    },
    {
      id: "almacen-representacion",
      titulo: "4. Por qué el almacén está hecho así",
      definicion:
        "(define setref!\n" +
        "  (lambda (ref val)\n" +
        "    (cases referencia ref\n" +
        "      (a-ref (pos)\n" +
        "        (set! el-almacen (reemplazar-celda el-almacen pos val))))))",
      explicacion: "Escoja la respuesta para cada pregunta sobre la implementación.",
      items: [
        { valor: "Si <code>setref!</code> devolviera <code>(reemplazar-celda el-almacen pos val)</code> sin el <code>set!</code>, ¿qué pasaría con <code>setref(c, 9)</code>?",
          opciones: ["nada: el almacén seguiría como estaba", "escribiría igual", "se detendría"], correcta: 0,
          razon: "reemplazar-celda construye una lista nueva y no modifica la vieja. Sin el set!, esa lista nueva se pierde y el-almacen queda igual. El efecto tiene que sobrevivir a la expresión, y para eso está el set!." },
        { valor: "¿Por qué el almacén es global y no un argumento más de <code>evaluar-expresion</code>?",
          opciones: ["porque así un efecto llega a todo lo que se evalúa después sin pasarlo de mano en mano",
                     "porque Racket no deja pasar listas como argumento",
                     "porque el ambiente ya lo guarda"], correcta: 0,
          razon: "EOPL §4.2 muestra las dos formas. Pasar el almacén obliga a cada cláusula a recibirlo y devolverlo; con uno global, evaluar-expresion conserva sus dos argumentos y el efecto viaja por el set!." },
        { valor: "¿Cuántos <code>set!</code> tiene el intérprete?",
          opciones: ["dos",
                     "tres, todos en almacen.rkt",
                     "uno por cada set del programa"], correcta: 1,
          razon: "initialize-store!, newref y setref!. El resto del intérprete es funcional: el set del lenguaje se implementa con setref!, no con un set! nuevo." },
        { valor: "¿Qué cuesta leer la celda k con esta representación?",
          opciones: ["recorrer k elementos de la lista, con list-ref",
                     "nada: es inmediato",
                     "recorrer todo el ambiente"], correcta: 0,
          razon: "Una lista se recorre desde el principio. El libro escoge esta representación por sencilla, no por rápida; con un vector, deref sería inmediato." }
      ],
      cierre:
        "El almacén es la única pieza del intérprete que no puede ser funcional. " +
        "Todo lo imperativo del lenguaje termina en tres set! de almacen.rkt."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
