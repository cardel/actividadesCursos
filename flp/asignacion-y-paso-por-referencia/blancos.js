/* Blancos directos e indirectos en el intérprete de paso por referencia:
   qué blanco recibe cada parámetro según su operando, el invariante que deja
   a deref y setref! en un solo nivel, qué leen y escriben en una
   configuración dada, y qué pasa si eval-rand no aplana. */
var BLOQUES = (function () {
  "use strict";

  function programa(texto) { return '<code class="programa">' + texto + "</code>"; }

  var EVAL_RAND =
    "(define eval-rand\n" +
    "  (lambda (exp amb)\n" +
    "    (cases expresion exp\n" +
    "      (var-exp (id)\n" +
    "        (indirect-target\n" +
    "          (let ((ref (apply-env-ref amb id)))\n" +
    "            (cases target (primitiva-deref ref)\n" +
    "              (direct-target   (expval) ref)\n" +
    "              (indirect-target (ref1)   ref1)))))\n" +
    "      (else\n" +
    "        (direct-target (evaluar-expresion exp amb))))))";

  var TARGET =
    "(define-datatype target target?\n" +
    "  (direct-target   (expval expval?))\n" +
    "  (indirect-target (ref    ref-to-direct-target?)))\n\n" +
    "(define setref!\n" +
    "  (lambda (ref val)\n" +
    "    (let ((ref1 (cases target (primitiva-deref ref)\n" +
    "                  (direct-target   (exp)  ref)\n" +
    "                  (indirect-target (ref2) ref2))))\n" +
    "      (primitiva-setref! ref1 (direct-target val)))))";

  var CONFIGURACION =
    "let f = proc(u, v) begin set v = 9; z end in (f 7 z)\n\n" +
    "Al entrar al cuerpo de f:\n" +
    "  eslabón de la llamada  (u v)    Vf = #((direct-target 7)\n" +
    "                                         (indirect-target (a-ref 2 V0)))\n" +
    "  ambiente inicial       (x y z)  V0 = #((direct-target 1) (direct-target 2) (direct-target 3))\n" +
    "                         (a b c)       #((direct-target 4) (direct-target 5) (direct-target 6))";

  var COPIA =
    "; eval-rand en la copia: no aplana\n" +
    "(var-exp (id)\n" +
    "  (indirect-target (apply-env-ref amb id)))\n\n" +
    "; segunda copia: además, el campo de indirect-target\n" +
    "; acepta cualquier referencia\n" +
    "(indirect-target (ref referencia?))";

  return [
    {
      id: "blancos-que-recibe",
      titulo: "1. Qué blanco recibe el parámetro",
      definicion: EVAL_RAND,
      explicacion:
        "En paso por referencia, la celda de un parámetro guarda un blanco " +
        "(EOPL §4.3): un <code>direct-target</code> con un valor propio o un " +
        "<code>indirect-target</code> que apunta a la celda de otra variable. " +
        "<code>eval-rand</code> decide cuál según la forma del operando. " +
        "Todo se midió en el intérprete de paso por referencia, donde el " +
        "ambiente inicial liga x = 1, y = 2, z = 3 sobre a = 4, b = 5, c = 6.",
      opciones: ["direct-target", "indirect-target"],
      items: [
        { valor: "k, en cada <code>(f c)</code> de " +
            programa("let f = proc(k) set k = add1(k) in begin (f c); (f c); c end"),
          correcta: 1,
          razon: "El operando es un var-exp, así que k recibe un indirect-target a la celda de c, la posición 2 del segundo eslabón del ambiente inicial. Cada set k escribe ahí: el programa vale 8. En el intérprete de asignación vale 6." },
        { valor: "k, en <code>(f 7)</code> de " +
            programa("let f = proc(k) begin set k = add1(k); k end in (f 7)"),
          correcta: 0,
          razon: "Un literal no tiene celda a la que apuntar: eval-rand lo evalúa y lo envuelve en direct-target 7. El set escribe en la celda propia de k y el programa vale 8." },
        { valor: "k, en <code>(f +(a, 0))</code> de " +
            programa("let f = proc(k) set k = 0 in begin (f +(a, 0)); a end"),
          correcta: 0,
          razon: "+(a, 0) vale lo mismo que a, pero es un prim-exp y no un var-exp, y eval-rand mira la variante del árbol, no el valor. k recibe direct-target 4, el set escribe en la celda de k, y el programa vale 4." },
        { valor: "k, en <code>(f begin a end)</code> de " +
            programa("let f = proc(k) set k = 0 in begin (f begin a end); a end"),
          correcta: 0,
          razon: "Un begin que solo contiene a sigue siendo un begin-exp, y cae en el else de eval-rand. k recibe direct-target 4 y a no cambia: el programa vale 4. Para pasar la celda, el operando tiene que ser el nombre a secas." },
        { valor: "m, en <code>(g k)</code>, cuando se evalúa <code>(f b)</code> en " +
            programa("let g = proc(m) set m = 0 in let f = proc(k) (g k) in begin (f b); b end"),
          correcta: 1,
          razon: "Es un indirect-target, pero no a la celda de k: la celda de k ya guarda un indirect-target a la de b, y eval-rand toma esa referencia. Así m apunta directo a la celda de b, el set de g escribe ahí, y el programa vale 0." },
        { valor: "k, en <code>(f h)</code> de " +
            programa("letrec h(n) = n in let f = proc(k) set k = proc(n) 99 in begin (f h); (h 1) end"),
          correcta: 1,
          razon: "h es un var-exp, y su celda, en el vector que arma el letrec, guarda un direct-target con la clausura. k recibe un indirect-target a esa celda, y el set k reemplaza el procedimiento: (h 1) vale 99. En el intérprete de asignación el mismo programa vale 1." }
      ],
      cierre:
        "eval-rand pregunta una sola cosa: si el operando es un var-exp. No " +
        "le importa qué tan obvio sea que otra expresión vale lo mismo que " +
        "una variable, ni qué guarde la celda, sea número o procedimiento. " +
        "Cuando la celda ya es un alias, pasa la celda a la que apunta."
    },
    {
      id: "blancos-invariante",
      titulo: "2. El invariante",
      definicion: TARGET,
      explicacion:
        "El invariante de EOPL §4.3: un <code>indirect-target</code> siempre " +
        "apunta a una celda que guarda un <code>direct-target</code>. Diga " +
        "si cada afirmación es verdadera.",
      opciones: ["Verdadero", "Falso"],
      items: [
        { valor: "<code>eval-rand</code> es el único lugar del intérprete que construye un <code>indirect-target</code>.",
          correcta: 0,
          razon: "Verdadero. let-exp, el ambiente inicial, el letrec y setref! construyen direct-target; el único indirect-target del código está en la rama var-exp de eval-rand. Basta con aplanar ahí para que el invariante se cumpla en todo el intérprete." },
        { valor: "<code>setref!</code> puede dejar un <code>indirect-target</code> guardado en una celda.",
          correcta: 1,
          razon: "Falso: siempre escribe (direct-target val). Si la celda guardaba un indirect-target, setref! escribe en la celda apuntada y deja el alias como estaba. Por eso en let f = proc(k) begin set k = 5; set k = add1(k); k end in let w = 0 in begin (f w); w end el segundo set también llega a w, y el programa vale 6." },
        { valor: "Una celda que empezó con un <code>direct-target</code> puede pasar a guardar un <code>indirect-target</code>.",
          correcta: 1,
          razon: "Falso. Un indirect-target solo entra a una celda cuando la celda se crea, al ligar un parámetro; después, la única escritura es la de setref!, que pone direct-target. Una celda nace directa o indirecta y así se queda." },
        { valor: "El invariante lo vigila el datatype: el campo de <code>indirect-target</code> exige <code>ref-to-direct-target?</code>.",
          correcta: 0,
          razon: "Verdadero. El predicado abre la referencia y mira que la celda guarde un direct-target. Si eval-rand no aplanara, el constructor se negaría con “indirect-target: bad value for ref field”, que es lo que responde una copia así modificada." },
        { valor: "Gracias al invariante, <code>deref</code> sigue a lo sumo una referencia además de la celda propia.",
          correcta: 0,
          razon: "Verdadero. Si la celda es directa, devuelve su valor; si es indirecta, lee la celda apuntada, que por el invariante es directa. El caso de un indirecto dentro de otro existe en deref solo para detenerse con “Invariante roto”." },
        { valor: "Si se permitieran cadenas de indirectos, bastaría con que <code>deref</code> siguiera un nivel más.",
          correcta: 1,
          razon: "Falso: cada procedimiento que reenvía la variable a otro alargaría la cadena un eslabón, sin límite. deref y setref! tendrían que recorrerla hasta el final, recursivamente. Aplanar una vez en eval-rand sale más barato que recorrer en cada lectura." }
      ],
      cierre:
        "El invariante se paga una vez, al construir el blanco, y rinde en " +
        "cada lectura y cada escritura. deref y setref! quedan con un solo " +
        "nivel porque eval-rand ya aplanó."
    },
    {
      id: "blancos-deref-setref",
      titulo: "3. Qué lee deref y qué celda escribe setref!",
      definicion: CONFIGURACION,
      explicacion:
        "La configuración de arriba es la del cuerpo de <code>f</code> en ese " +
        "programa, que vale 9. u recibió un literal y v recibió la variable " +
        "z. Diga qué hace cada operación sobre esa configuración.",
      items: [
        { valor: "<code>(deref (a-ref 0 Vf))</code>, la celda de u",
          opciones: ["<code>(direct-target 7)</code>", "7", "se detiene"],
          correcta: 1,
          razon: "La celda guarda direct-target 7, y deref le quita la envoltura: devuelve el valor expresado 7. Los blancos nunca salen como valor de una expresión." },
        { valor: "<code>(primitiva-deref (a-ref 1 Vf))</code>, la celda de v",
          opciones: ["3",
                     "<code>(direct-target 3)</code>",
                     "<code>(indirect-target (a-ref 2 V0))</code>"],
          correcta: 2,
          razon: "primitiva-deref es vector-ref y nada más: devuelve lo que hay en la celda, el blanco crudo. Es lo que deref y setref! miran para decidir si siguen la referencia." },
        { valor: "<code>(deref (a-ref 1 Vf))</code>",
          opciones: ["3", "<code>(a-ref 2 V0)</code>", "se detiene: hay dos niveles"],
          correcta: 0,
          razon: "La celda es indirecta, así que deref lee la posición 2 de V0, encuentra direct-target 3 y devuelve 3. Hay un solo salto, el que el invariante permite." },
        { valor: "<code>set v = 9</code> escribe",
          opciones: ["<code>(direct-target 9)</code> en la posición 1 de Vf",
                     "en las dos posiciones",
                     "<code>(direct-target 9)</code> en la posición 2 de V0"],
          correcta: 2,
          razon: "setref! ve un indirect-target en la celda de v, toma la referencia que guarda y escribe en la celda de z. La celda de v sigue guardando el mismo indirect-target." },
        { valor: "Después del set, la <code>z</code> del cuerpo vale",
          opciones: ["3", "9", "1"],
          correcta: 1,
          razon: "Vale 9, que es el valor del programa: z se busca en el ambiente inicial, y su celda es la que el set acaba de escribir. v y z son dos nombres para la misma celda." },
        { valor: "Con <code>set u = 0</code> en lugar del set v, el cuerpo <code>+(u, v, z)</code> vale",
          opciones: ["6", "3", "10"],
          correcta: 0,
          razon: "Vale 0 + 3 + 3 = 6. La celda de u es directa, así que setref! escribe en ella misma, la posición 0 de Vf. No hay ninguna otra celda conectada con u, porque recibió un literal." }
      ],
      cierre:
        "Las dos operaciones siguen la misma regla: mirar la celda; si es " +
        "indirecta, ir una vez a la celda apuntada. deref lee ahí y setref! " +
        "escribe ahí. La celda indirecta misma no cambia nunca."
    },
    {
      id: "blancos-sin-aplanar",
      titulo: "4. Si eval-rand no aplanara",
      definicion: COPIA,
      explicacion:
        "Este bloque se midió en dos copias modificadas del intérprete de " +
        "paso por referencia. En la primera, <code>eval-rand</code> construye " +
        "el indirect-target con la referencia de la variable, sin mirar qué " +
        "guarda su celda. La segunda, además, quita la comprobación del " +
        "invariante en el datatype. Diga qué pasa en cada caso.",
      items: [
        { valor: "Primera copia: " +
            programa("let f = proc(k) set k = 0 in begin (f b); b end"),
          opciones: ["se detiene", "0, igual que el original", "5"],
          correcta: 1,
          razon: "Vale 0, como en el original. La celda de b guarda un direct-target, así que aplanar o no da la misma referencia. La diferencia aparece solo cuando el operando es una variable que ya es un alias." },
        { valor: "Primera copia: " +
            programa("let g = proc(m) set m = 0 in let f = proc(k) (g k) in begin (f b); b end"),
          opciones: ["se detiene al construir el blanco de m", "0, igual que el original", "5"],
          correcta: 0,
          razon: "Se detiene con “indirect-target: bad value for ref field”. La celda de k guarda un indirect-target, y la copia intenta construir otro que apunte a ella; ref-to-direct-target? lo rechaza. El original aplana y vale 0." },
        { valor: "Primera copia: " +
            programa("let g = proc(m) set m = 0 in let f = proc(k) begin (g k); k end in (f 5)"),
          opciones: ["se detiene al construir el blanco de m", "5", "0, igual que el original"],
          correcta: 2,
          razon: "Vale 0. k recibió un literal, así que su celda es directa, y un indirect-target hacia ella cumple el invariante. Reenviar un parámetro solo se rompe si ese parámetro recibió una variable." },
        { valor: "Segunda copia: " +
            programa("let g = proc(m) set m = 0 in let f = proc(k) begin (g k); k end in begin (f b); b end"),
          opciones: ["0, igual que el original",
                     "5: el alias entre k y b se rompe",
                     "se detiene"],
          correcta: 1,
          razon: "Vale 5. m apunta a la celda de k, que apunta a la de b. setref! sigue un solo nivel, llega a la celda de k y escribe ahí direct-target 0: k deja de ser alias de b, y b se queda en 5. (f b) devuelve 0, pero el cambio no llegó a b. El original vale 0." },
        { valor: "Segunda copia: " +
            programa("let g = proc(m) m in let f = proc(k) (g k) in (f b)"),
          opciones: ["5, igual que el original",
                     "devuelve una referencia",
                     "se detiene en deref"],
          correcta: 2,
          razon: "Se detiene con “Invariante roto: indirect-target apunta a otro indirect-target”. Al leer m, deref sigue un nivel, encuentra la celda indirecta de k y no da un segundo salto. El original vale 5." }
      ],
      cierre:
        "Sin aplanar, el error aparece en un sitio distinto según lo que " +
        "quede vigilando. Con el datatype vigilando, el programa se detiene " +
        "al llamar. Sin esa vigilancia, la lectura se detiene en deref y la " +
        "escritura cae en la celda equivocada sin avisar. Esto último es lo " +
        "peor: el programa termina, y con un valor equivocado."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
