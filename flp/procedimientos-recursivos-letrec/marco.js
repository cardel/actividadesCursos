/* El ambiente extendido recursivo: qué guarda, qué no, y por qué la clausura
   que apply-env fabrica captura el marco y no el ambiente que el marco
   extiende. */
var BLOQUES = (function () {
  "use strict";

  function programa(texto) { return '<code class="programa">' + texto + "</code>"; }

  var VARIANTE =
    "(ambiente-extendido-recursivo\n" +
    "  (nombre-procedimientos (list-of symbol?))\n" +
    "  (argumentos-proc       (list-of (list-of symbol?)))\n" +
    "  (cuerpos-proc          (list-of expresion?))\n" +
    "  (old-env               ambiente?))";

  var APPLY_ENV =
    "[(equal? (car procnames) var)\n" +
    "  (closure (car lidss)\n" +
    "           (car cuerpos)\n" +
    "           env)]        ; aquí se decide todo";

  return [
    {
      id: "marco-que-guarda",
      titulo: "1. Qué guarda el marco y qué no",
      definicion: VARIANTE,
      explicacion:
        "La variante nueva del tipo <code>ambiente</code> (EOPL §3.4). Diga " +
        "si cada afirmación es verdadera.",
      opciones: ["Verdadero", "Falso"],
      items: [
        { valor: "El marco guarda una clausura por cada procedimiento declarado.",
          correcta: 1,
          razon: "Falso: guarda los nombres, las listas de parámetros y los cuerpos. Si guardara clausuras habría que construirlas al declarar, y en ese momento el ambiente que capturarían todavía no existe." },
        { valor: "Los cuerpos se guardan sin evaluar.",
          correcta: 0,
          razon: "Verdadero: son árboles de sintaxis abstracta, del tipo expresion. El campo lo dice: (list-of expresion?). Evaluarlos al declarar no tendría sentido, porque los parámetros no están ligados a nada." },
        { valor: "Un <code>letrec</code> con tres declaraciones crea tres marcos recursivos.",
          correcta: 1,
          razon: "Falso: crea uno solo, con tres nombres, tres listas de parámetros y tres cuerpos en sus listas paralelas. Es lo que permite que los tres cuerpos se vean entre sí: están todos en el mismo marco." },
        { valor: "El marco también guarda el ambiente que extiende.",
          correcta: 0,
          razon: "Verdadero: el cuarto campo, old-env. Sin él la cadena se cortaría ahí y las variables de afuera dejarían de alcanzarse." },
        { valor: "Un <code>letrec</code> sin declaraciones no crea marco.",
          correcta: 1,
          razon: "Falso: lo crea con las tres listas vacías. El programa letrec in +(x,1) vale 5: el marco está, la búsqueda de x no encuentra nada en él y pasa a old-env." }
      ],
      cierre:
        "El marco guarda ingredientes, no productos. Esa decisión es la que " +
        "deja la construcción de la clausura para después, y ese después " +
        "resulta ser el momento en que ya existe el ambiente que la clausura " +
        "necesita capturar."
    },
    {
      id: "marco-env-o-old-env",
      titulo: "2. env o old-env",
      definicion: APPLY_ENV,
      explicacion:
        "<code>apply-env</code> recorre el marco y, cuando el nombre " +
        "coincide con una declaración, fabrica una clausura de tres campos " +
        "cuyo tercero es un ambiente. Escoja lo que ocurre en cada renglón.",
      items: [
        { valor: "Cuando el nombre buscado no está en el marco, <code>apply-env</code>",
          opciones: ["sigue la búsqueda en <code>old-env</code>, el cuarto campo",
                     "devuelve #f y deja que el evaluador decida qué hacer",
                     "se detiene: el nombre no era de los procedimientos declarados"],
          correcta: 0,
          razon: "Sigue por la cadena. El marco recursivo es un eslabón más: si el nombre no está entre sus declaraciones, la búsqueda continúa en el ambiente que extiende, hasta el vacío. Ninguna cláusula de apply-env devuelve #f, y detenerse es lo que hace el caso del ambiente vacío." },
        { valor: "El tercer campo de la clausura es",
          opciones: ["<code>old-env</code>, el ambiente que el marco extiende",
                     "<code>env</code>, el marco recursivo donde está la declaración",
                     "<code>ambiente-inicial</code>, el de las seis ligaduras de prueba"],
          correcta: 1,
          razon: "El marco recursivo. La clausura queda apuntando al marco que la contiene, y por eso cuando su cuerpo nombra al procedimiento lo encuentra: la búsqueda empieza en el mismo marco donde está la declaración." },
        { valor: "Una consulta del nombre fabrica",
          opciones: ["tantas clausuras como declaraciones tenga el marco",
                     "ninguna: el marco la tenía guardada y la devuelve",
                     "una clausura, armada ahí mismo con el cuerpo y <code>env</code>"],
          correcta: 2,
          razon: "Una. El predicado recorre procnames hasta la posición del nombre y con ese número indexa idss y cuerpos; con esos dos campos y env arma una sola clausura. El marco guarda las tres listas y ninguna clausura hecha." },
        { valor: "Dos consultas del mismo nombre devuelven",
          opciones: ["dos clausuras que difieren en el ambiente que cada una capturó",
                     "dos clausuras iguales campo por campo, construidas aparte",
                     "la misma clausura, que el marco guardó la primera vez"],
          correcta: 1,
          razon: "Iguales: mismos parámetros, mismo cuerpo, mismo ambiente, porque los tres salen del mismo marco. Son dos objetos construidos en momentos distintos que describen el mismo procedimiento, y el marco no se queda con el primero." },
        { valor: "Si ahí fuera <code>old-env</code>, el programa " +
            programa("letrec g(n) = if ==(n,0) then 0 else (g sub1(n)) in (g 3)") + " daría",
          opciones: ["0, igual que ahora: ese campo no cambia la búsqueda",
                     "un error al buscar g, que no está ligada ahí",
                     "nunca terminaría: cada llamada volvería a buscar g desde arriba"],
          correcta: 1,
          razon: "Se detendría al buscar g. Con old-env la clausura capturaría el ambiente de antes del letrec, donde g no está ligada, y la búsqueda llegaría al ambiente vacío: no se encuentra la variable g. Escribir ese mismo cuerpo con let y proc da ese error y no un ciclo." }
      ],
      cierre:
        "Todo el mecanismo de la recursión está en ese tercer campo. Con " +
        "env la clausura se ve a sí misma; con old-env el lenguaje queda " +
        "igual que con let y proc."
    },
    {
      id: "marco-en-la-cadena",
      titulo: "3. El marco en la cadena de ambientes",
      explicacion:
        "Sobre " +
        programa("letrec g(n) = if ==(n,0) then 0 else (g sub1(n)) in (g 3)") +
        ", que crea cinco ambientes y vale 0.",
      items: [
        { valor: "Buscar <code>n</code> dentro del cuerpo recorre",
          opciones: ["un eslabón: el parámetro está en el marco más nuevo",
                     "dos eslabones: el de la llamada y el marco recursivo",
                     "los cuatro, hasta llegar al ambiente vacío"],
          correcta: 0,
          razon: "Uno: el parámetro está en el eslabón más nuevo, que es donde empieza la búsqueda. Buscar g sí recorre dos, porque el primero liga n y la declaración está en el siguiente." },
        { valor: "El ambiente del parámetro de una llamada recursiva cuelga",
          opciones: ["del ambiente de la llamada anterior, que sigue abierto",
                     "del ambiente inicial, donde empieza toda búsqueda",
                     "del marco recursivo, que es lo que la clausura capturó"],
          correcta: 2,
          razon: "Del marco recursivo, porque la aplicación extiende el ambiente que la clausura capturó. Los marcos de llamada quedan hermanos entre sí, no uno dentro del otro, y ninguno se engancha al ambiente inicial." },
        { valor: "En el punto más hondo, la cadena tiene",
          opciones: ["cuatro eslabones sobre el ambiente vacío",
                     "seis eslabones, porque los marcos de llamada se encadenan",
                     "tantos eslabones como llamadas haya"],
          correcta: 0,
          razon: "Cuatro: el del parámetro con n = 0, el marco recursivo, y los dos del ambiente inicial. Las cuatro llamadas crean cuatro marcos y ninguno cuelga del anterior." },
        { valor: "Con <code>(g 10)</code> en vez de <code>(g 3)</code>, la cadena más honda tiene",
          opciones: ["once eslabones, uno por cada llamada que se hizo",
                     "catorce: los once de las llamadas y los tres de antes",
                     "los mismos cuatro, porque la hondura no cambia"],
          correcta: 2,
          razon: "Los mismos cuatro. Suben los ambientes creados, de cinco a doce, porque las llamadas pasan de cuatro a once; la hondura se queda igual, porque cada marco de llamada cuelga del marco recursivo y desaparece al terminar su llamada." },
        { valor: "Una variable que no esté en ninguna parte",
          opciones: ["devuelve 0, el valor por omisión de una variable libre",
                     "se detiene en el ambiente vacío, con error",
                     "devuelve #f, y el error aparece al usar ese valor"],
          correcta: 1,
          razon: "El caso base de apply-env sobre el ambiente vacío es un error, y ahí se detiene la evaluación. La cadena termina en el vacío, de modo que llegar al final significa que la variable está libre." }
      ],
      cierre:
        "Que la hondura no crezca con la recursión es consecuencia de dónde " +
        "cuelga cada marco de llamada. Lo que crece con la recursión es otra " +
        "cosa: las operaciones que quedan pendientes encima de cada llamada, " +
        "y eso se ve en la traza, no en la cadena."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
