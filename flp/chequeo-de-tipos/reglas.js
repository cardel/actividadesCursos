/* Las reglas de tipamiento de CHECKED (EOPL §7.1, Figura 7.4) y lo que el
   chequeador alcanza a decidir antes de correr el programa. Cada veredicto y
   cada valor de esta página se midieron con type-of-program y eval-program
   sobre interpretadores/Interpretes/Corte 2/3 ChequeoTipos. */
var BLOQUES = (function () {
  "use strict";

  function programa(texto) { return '<code class="programa">' + texto + "</code>"; }

  var REGLAS =
    "(if-exp (test then else)\n" +
    "  (let ((t (type-of-expression test tenv)))\n" +
    "    (begin\n" +
    "      (check-equal-type! t bool-type test)\n" +
    "      (let ((t1 (type-of-expression then tenv))\n" +
    "            (t2 (type-of-expression else tenv)))\n" +
    "        (begin (check-equal-type! t1 t2 exp) t1)))))";

  var APP =
    "(app-exp (rator rands)\n" +
    "  (let ((rator-type (type-of-expression rator tenv))\n" +
    "        (rand-types (types-of-expressions rands tenv)))\n" +
    "    (type-of-application rator-type rand-types rator rands exp)))";

  return [
    {
      id: "reglas-exige",
      titulo: "1. Lo que exige cada regla",
      definicion: REGLAS,
      explicacion:
        "La cláusula del <code>if</code> es el correlato estático de la regla " +
        "del curso: prueba booleana y las dos ramas del mismo tipo. Responda " +
        "sobre ella y sobre las demás formas.",
      items: [
        { valor: "La regla del <code>if</code> exige",
          opciones: ["prueba bool y las dos ramas del mismo tipo",
                     "prueba bool y nada más",
                     "que las dos ramas sean int"],
          correcta: 0,
          razon: "Son dos check-equal-type! distintos: uno compara el tipo de la prueba con bool y otro compara las dos ramas entre sí. El tipo del if es el de las ramas, que ya se sabe igual." },
        { valor: "El tipo que devuelve la regla del <code>if</code> es",
          opciones: ["el de las ramas", "bool", "el de la prueba"],
          correcta: 0,
          razon: "La prueba ya se consumió al comprobarla. Lo que vale la expresión es lo que vale la rama que se tome, y por eso las dos tienen que coincidir: el chequeador no sabe cuál se tomará." },
        { valor: "En " + programa("let x = 3 in add1(x)") + ", el cuerpo se chequea",
          opciones: ["en el tenv extendido con x : int",
                     "en el tenv vacío",
                     "después de evaluar x"],
          correcta: 0,
          razon: "La regla del let calcula el tipo de la ligadura, extiende el ambiente de tipos con extend-tenv y chequea el cuerpo ahí. Es la misma forma del ambiente de valores, con tipos en lugar de valores." },
        { valor: "En " + programa("letrec int fact(int n) = … in …") + ", al chequear el cuerpo de <code>fact</code> el ambiente de tipos ya tiene",
          opciones: ["fact : (int -&gt; int) y n : int",
                     "solo n : int",
                     "nada, porque fact todavía no existe"],
          correcta: 0,
          razon: "Para eso sirve la anotación del tipo de retorno: el chequeador arma el tipo de fact con lo declarado y lo mete al ambiente antes de mirar el cuerpo. Sin esa anotación habría que adivinarlo, que es lo que hará la inferencia." },
        { valor: "La regla de la aplicación comprueba",
          opciones: ["que el operador sea de tipo procedimiento, que la cantidad de argumentos coincida y que cada tipo case",
                     "solo que el operador sea de tipo procedimiento",
                     "solo que los argumentos sean del tipo correcto"],
          correcta: 0,
          razon: "Son las tres cosas, y están en type-of-application. El evaluador, en cambio, no cuenta los argumentos: por eso hay programas que el chequeador rechaza y la máquina correría." }
      ]
    },
    {
      id: "reglas-falla",
      titulo: "2. Qué regla falla",
      definicion: APP,
      explicacion:
        "Cada programa de abajo lo rechaza el chequeador. Diga por cuál de " +
        "las reglas.",
      items: [
        { valor: programa("if 1 then 2 else 3"),
          opciones: ["la prueba del if no es bool", "las ramas no coinciden", "falta una rama"],
          correcta: 0,
          razon: "El primer check-equal-type! compara int con bool y aborta ahí. El mensaje es Types didn't match: int != bool." },
        { valor: programa("if zero?(0) then 1 else true"),
          opciones: ["las dos ramas no son del mismo tipo", "la prueba no es bool", "true no tiene tipo"],
          correcta: 0,
          razon: "La prueba pasa, porque zero?(0) es bool. Lo que falla es el segundo check-equal-type!: una rama es int y la otra bool." },
        { valor: programa("sub1(zero?(0))"),
          opciones: ["sub1 recibe un bool y espera un int", "zero? no existe", "sub1 no existe"],
          correcta: 0,
          razon: "La regla de las primitivas compara el tipo de cada argumento con el que la primitiva declara. zero?(0) es bool y sub1 pide int." },
        { valor: programa("(5 3)"),
          opciones: ["el operador no es de tipo procedimiento", "faltan argumentos", "5 no tiene tipo"],
          correcta: 0,
          razon: "type-of-application mira primero el tipo del operador: 5 es int y no un proc-type, así que aborta con Rator not a proc type." },
        { valor: programa("(proc (int x) add1(x) 5 6)"),
          opciones: ["la cantidad de argumentos no coincide", "6 no es int", "el operador no es procedimiento"],
          correcta: 0,
          razon: "El procedimiento declara un parámetro y recibe dos. El mensaje es Wrong number of arguments." },
        { valor: programa("letrec int mal(int n) = true in (mal 1)"),
          opciones: ["el cuerpo no devuelve lo que la anotación declara", "n no se usa", "letrec pide dos declaraciones"],
          correcta: 0,
          razon: "La anotación dice int y el cuerpo es bool. El chequeador compara las dos y aborta: la anotación no es un comentario, es lo que se verifica." },
        { valor: programa("x") + " solo",
          opciones: ["x no está ligada en el ambiente de tipos", "x es int por omisión", "x queda sin tipo pero corre"],
          correcta: 0,
          razon: "apply-tenv aborta con Unbound variable x. El ambiente inicial de este interpretador está vacío, a diferencia de los del primer corte." }
      ]
    },
    {
      id: "reglas-conservador",
      titulo: "3. Lo que rechaza sin que fuera a fallar",
      explicacion:
        "El chequeador decide antes de correr, y para eso tiene que suponer " +
        "lo peor de cada rama. Diga qué haría la máquina con cada programa " +
        "rechazado si lo dejaran correr.",
      items: [
        { valor: programa("if zero?(0) then 1 else true") + " corriendo da",
          opciones: ["1", "un error en tiempo de ejecución", "true"],
          correcta: 0,
          razon: "La prueba es verdadera, así que nunca se toca la rama del true. El chequeador lo rechaza igual, porque no sabe qué rama se va a tomar y necesita un solo tipo para la expresión." },
        { valor: programa("and(1, true)") + " corriendo da",
          opciones: ["#t", "1", "un error en tiempo de ejecución"],
          correcta: 0,
          razon: "La primitiva no comprueba nada y el and de Racket acepta cualquier valor distinto de #f. El chequeador sí lo rechaza, porque and declara dos bool." },
        { valor: programa("(proc (int x) add1(x) 5 6)") + " corriendo da",
          opciones: ["6", "un error por sobrar un argumento", "5"],
          correcta: 0,
          razon: "El evaluador liga x a 5, descarta el 6 y entrega add1(5). Que el chequeador lo atrape y el evaluador no es justamente lo que se gana con el chequeo estático." },
        { valor: programa("if zero?(1) then proc (int x) x else 5") + " corriendo da",
          opciones: ["5", "una clausura", "un error en tiempo de ejecución"],
          correcta: 0,
          razon: "zero?(1) es falso y la rama del else entrega 5. El chequeador lo rechaza porque una rama es (int -&gt; int) y la otra int." },
        { valor: "De lo anterior se sigue que el chequeador",
          opciones: ["rechaza programas que no habrían fallado",
                     "acepta programas que fallan en ejecución",
                     "decide exactamente cuáles fallan"],
          correcta: 0,
          razon: "Es conservador: para garantizar que ningún programa aceptado falle por tipos, rechaza algunos que habrían corrido bien. Decidir exactamente cuáles fallan no se puede, y aceptar alguno que falle rompería la garantía." }
      ]
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
