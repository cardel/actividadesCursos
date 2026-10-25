/* Las cláusulas de 1 Asignacion (EOPL §4.3) leídas línea por línea: qué
   devuelve apply-env y por qué set la necesita así, dónde se reservan celdas
   y qué pasaría si una cláusula se escribiera de otra forma. Todo se midió
   en Racket con los intérpretes de Corte 2. */
var BLOQUES = (function () {
  "use strict";

  function programa(texto) { return '<code class="programa">' + texto + "</code>"; }

  var SET_EXP =
    "(var-exp (id) (deref (apply-env amb id)))\n\n" +
    "(set-exp (id e)\n" +
    "  (let* ((ref (apply-env amb id))\n" +
    "         (val (evaluar-expresion e amb)))\n" +
    "    (begin\n" +
    "      (setref! ref val)\n" +
    "      1)))";

  var LIGAR =
    "(let-exp (ids rands body)\n" +
    "  (let ((lvalues (map (lambda (x) (evaluar-expresion x amb)) rands)))\n" +
    "    (evaluar-expresion body\n" +
    "      (ambiente-extendido ids (map newref lvalues) amb))))\n\n" +
    "(app-exp (rator rands)\n" +
    "  (let ((lvalues (map (lambda (x) (evaluar-expresion x amb)) rands))\n" +
    "        (procV (evaluar-expresion rator amb)))\n" +
    "    (aplicar-procedimiento procV (map newref lvalues))))";

  return [
    {
      id: "reglas-set",
      titulo: "1. Leer y escribir una variable",
      definicion: SET_EXP,
      explicacion:
        "apply-env devuelve la referencia de la celda, no su contenido. Elija " +
        "la respuesta para cada renglón.",
      items: [
        { valor: "En <code>set-exp</code>, <code>(apply-env amb id)</code> devuelve",
          opciones: ["la referencia de la celda de id", "el valor de id", "el eslabón donde está id"],
          correcta: 0,
          razon: "Una referencia, (a-ref k). Es lo que setref! necesita para saber en qué celda escribir." },
        { valor: "¿Por qué <code>set-exp</code> no obtiene la celda con <code>(evaluar-expresion (var-exp id) amb)</code>?",
          opciones: ["porque eso da el contenido de la celda, y setref! necesita la referencia",
                     "porque var-exp no se puede construir dentro de set",
                     "porque daría el mismo resultado más lento"],
          correcta: 0,
          razon: "var-exp hace deref de lo que devuelve apply-env: su resultado es el valor guardado. Con un número en la mano no hay celda donde escribir." },
        { valor: programa("set x = 9") + " vale",
          opciones: ["9", "1", "4"], correcta: 1,
          razon: "La cláusula termina en 1: la expresión se usa por su efecto. El 9 queda en la celda 0, la de x." },
        { valor: programa("let n = 1 in begin set n = begin set n = 5; +(n, 1) end; n end") + " vale",
          opciones: ["6", "5", "1"], correcta: 0,
          razon: "El set de afuera busca primero la referencia de n, la celda 6, y después evalúa su derecha: el set de adentro deja 5 en esa misma celda y la suma da 6. Luego el de afuera escribe 6 encima, y n lo lee." },
        { valor: "Si <code>var-exp</code> fuera <code>(apply-env amb id)</code>, sin <code>deref</code>, el programa " + programa("x") + " valdría",
          opciones: ["4", "una referencia, #(struct:a-ref 0)", "un error"], correcta: 1,
          razon: "Saldría la referencia de la celda 0. Las referencias no son valores expresados en este lenguaje: ninguna expresión debería poder devolver una, y +(x, 1) se detendría." }
      ],
      cierre:
        "Leer y escribir una variable empiezan igual, con apply-env. La " +
        "lectura termina en deref y la escritura en setref!, y las dos usan " +
        "la misma referencia."
    },
    {
      id: "reglas-celdas",
      titulo: "2. ¿Cuántas celdas reserva el programa?",
      definicion: LIGAR,
      explicacion:
        "Sin contar las seis del ambiente inicial. Cada <code>newref</code> es " +
        "una celda nueva.",
      opciones: ["0", "1", "2", "3", "4"],
      items: [
        { valor: programa("let a = 1 b = 2 in +(a, b)"), correcta: 2,
          razon: "Un newref por cada variable del let: las celdas 6 y 7." },
        { valor: programa("let f = proc(u, v) +(u, v) in (f 1 2)"), correcta: 3,
          razon: "La de f, con la clausura, y una por cada parámetro al aplicar: tres." },
        { valor: programa("begin set x = 3; x end"), correcta: 0,
          razon: "Ningún let ni ninguna llamada: set escribe en la celda 0, que ya existía." },
        { valor: programa("let f = proc() 7 in (f)"), correcta: 1,
          razon: "Solo la de f. La aplicación sin argumentos crea un eslabón, pero no tiene parámetros a los que reservarles celda." },
        { valor: programa("letrec g(n) = n in (g (g 1))"), correcta: 4,
          razon: "Cada búsqueda de g reserva una celda para la clausura, y cada llamada una para n: dos búsquedas y dos llamadas." }
      ],
      cierre:
        "Las celdas nacen en tres sitios: al ligar con let, al aplicar un " +
        "procedimiento y al buscar un nombre de letrec. set no reserva nada."
    },
    {
      id: "reglas-variantes",
      titulo: "3. Si la cláusula fuera de otra forma",
      definicion: null,
      explicacion: "Cada renglón cambia una sola cosa del intérprete. ¿Qué pasa?",
      items: [
        { valor: "<code>let-exp</code> con <code>(ambiente-extendido ids lvalues amb)</code>, sin <code>(map newref …)</code>",
          opciones: ["el datatype rechaza el eslabón: lrefs pide referencias",
                     "funciona igual, más rápido",
                     "funciona, pero los set dejan de verse"],
          correcta: 0,
          razon: "El campo lrefs se declaró con (list-of referencia?), así que construir el eslabón con números falla: «ambiente-extendido: bad value for lrefs field: (5)»." },
        { valor: "<code>app-exp</code> que, cuando el operando es una variable, liga el parámetro a la referencia de esa variable",
          opciones: ["es el paso por referencia", "es el paso por valor", "no compila"],
          correcta: 0,
          razon: "Es exactamente lo que hace evaluar-operando en 2 PasoPorReferencia (EOPL §4.5.1). La gramática y el let no cambian." },
        { valor: "<code>evaluar-programa</code> sin <code>initialize-store!</code>",
          opciones: ["cada programa encontraría las celdas del anterior y las suyas empezarían más arriba",
                     "no cambia nada",
                     "el primer programa fallaría"],
          correcta: 0,
          razon: "El almacén seguiría creciendo de un programa a otro. El ambiente inicial reserva celdas nuevas en cada programa, así que x seguiría valiendo 4, pero sus celdas ya no serían la 0 a la 5." },
        { valor: "<code>set-exp</code> que devuelve <code>val</code> en vez de 1",
          opciones: ["solo cambia el valor de la expresión set",
                     "las asignaciones dejan de hacerse",
                     "cambia la gramática"],
          correcta: 0,
          razon: "La escritura la hace setref!, antes. Lo último de la cláusula solo decide qué vale la expresión: set x = 9 valdría 9." }
      ],
      cierre:
        "Cada pieza tiene una sola tarea: el let y la aplicación reservan, " +
        "apply-env encuentra, deref lee y setref! escribe. Cambiar a quién se " +
        "le entrega una referencia es cambiar la política de paso de parámetros."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
