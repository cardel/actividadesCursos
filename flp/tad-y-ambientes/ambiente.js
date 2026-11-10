/* Predecir apply-env. Una cadena de ambientes nueva y preguntas sobre qué
   devuelve la búsqueda, en qué orden se construyó y cómo se escribe la misma
   cadena con let. */
var BLOQUES = (function () {
  "use strict";
  var CADENA =
    "(define e\n" +
    "  (extend-env 'a 7\n" +
    "    (extend-env 'b 4\n" +
    "      (extend-env 'a 2\n" +
    "        (extend-env 'c 9\n" +
    "          (empty-env))))))";
  return [
    {
      id: "buscar",
      titulo: "1. Qué devuelve la búsqueda",
      definicion: CADENA,
      explicacion:
        "<code>apply-env</code> avanza del eslabón más nuevo al más viejo y " +
        "se detiene en la primera coincidencia; si llega al vacío, es un " +
        "error. Prediga cada resultado.",
      items: [
        { valor: "<code>(apply-env e 'b)</code>",
          opciones: ["4, la única ligadura de b",
                     "error, b no aparece en la cadena",
                     "7, el valor del eslabón de afuera"], correcta: 0,
          razon: "b aparece una sola vez, en el segundo eslabón, y la búsqueda la encuentra ahí." },
        { valor: "<code>(apply-env e 'c)</code>",
          opciones: ["error, la cadena se acaba antes",
                     "2, el valor del eslabón de en medio",
                     "9, el valor del eslabón más viejo"], correcta: 2,
          razon: "c está en el eslabón que envuelve a (empty-env). La búsqueda pasa por a, b y a antes de llegar, y la encuentra." },
        { valor: "<code>(apply-env e 'a)</code>",
          opciones: ["7, la ligadura de a más nueva",
                     "2, la ligadura de a más vieja",
                     "error, a está ligada dos veces"], correcta: 0,
          razon: "Hay dos ligaduras de a y gana la más nueva, que es la primera que la búsqueda ve. La de valor 2 sigue en su eslabón, oculta." },
        { valor: "<code>(apply-env e 'd)</code>",
          opciones: ["0, el valor por omisión del ambiente",
                     "error, al llegar a <code>(empty-env)</code>",
                     "#f, que es lo que responde el vacío"], correcta: 1,
          razon: "Ningún eslabón liga d, y (empty-env) no puede responder: apply-env levanta el error del símbolo que no se encuentra en el ambiente. No hay valor por omisión." },
        { valor: "<code>(apply-env (extend-env->env e) 'a)</code>",
          opciones: ["7, la a que estaba al frente",
                     "2, la a que estaba oculta",
                     "error, ya no queda ninguna a"], correcta: 1,
          razon: "extend-env->env entrega el ambiente que el eslabón de afuera extendía, y en lo que queda la primera a es la de valor 2: dejó de estar oculta." },
        { valor: "<code>(apply-env (extend-env 'c 1 e) 'c)</code>",
          opciones: ["9, porque e ya tenía una c",
                     "error, c queda ligada dos veces",
                     "1, la c del eslabón nuevo"], correcta: 2,
          razon: "Extender no modifica a e: construye un ambiente nuevo con c = 1 al frente, y la búsqueda en ese ambiente encuentra el 1 primero." },
        { valor: "<code>(apply-env e 'c)</code>, después de la anterior",
          opciones: ["1, porque extender cambió a e",
                     "9, porque e no cambió",
                     "error, e ya fue consumido"], correcta: 1,
          razon: "e sigue como estaba. El ambiente extendido es otro valor, con su propia c; en e la única c es la de valor 9." }
      ],
      cierre:
        "Extender un ambiente produce uno nuevo y deja el viejo intacto. Eso " +
        "es lo que permite que una ligadura oculte a otra sin borrarla: al " +
        "salir del ámbito interior, el ambiente anterior sigue existiendo tal " +
        "como estaba."
    },
    {
      id: "orden",
      titulo: "2. El orden en que se construyó",
      definicion: CADENA,
      explicacion:
        "La expresión se lee de adentro hacia afuera: lo que está más " +
        "anidado se construyó primero.",
      items: [
        { valor: "¿Cuántos eslabones tiene e, sin contar el vacío?", opciones: ["3", "4", "5"], correcta: 1,
          razon: "Cuatro extend-env, cuatro eslabones. Que dos de ellos liguen el mismo nombre no los funde." },
        { valor: "¿Cuál es la ligadura más antigua?", opciones: ["a = 7", "b = 4", "c = 9"], correcta: 2,
          razon: "c = 9 es la que envuelve directamente a (empty-env). Todo lo demás se agregó encima de ella." },
        { valor: "Si se construye <code>(extend-env 'b 5 e)</code>, ¿qué pasa con b = 4?",
          opciones: ["Queda oculta tras b = 5",
                     "Se borra de la cadena vieja",
                     "Se reemplaza en el eslabón viejo"], correcta: 0,
          razon: "Sigue en su eslabón. La búsqueda desde el ambiente nuevo encuentra b = 5 antes de llegar a ella, y desde e sigue encontrando b = 4." },
        { valor: "¿Cuál de estas expresiones produce exactamente la cadena e?",
          opciones: ["(let ([c 9]) (let ([a 2]) (let ([b 4]) (let ([a 7]) …))))",
                     "(let ([a 7]) (let ([b 4]) (let ([a 2]) (let ([c 9]) …))))"],
          correcta: 0,
          razon: "El let más externo corresponde al eslabón más viejo, así que c = 9 va por fuera y a = 7 queda en el let más interno. La versión que empieza con a = 7 arma la cadena al revés." }
      ],
      cierre:
        "Una cadena de ambientes es la historia de los let anidados que la " +
        "produjeron, leída de adentro hacia afuera. El diagrama con la flecha " +
        "hacia el más viejo y la expresión con let dicen lo mismo."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

/* --- Interfaz ----------------------------------------------------- */
if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
