/* Unificación de INFERRED (EOPL §7.4.2, Figura 7.9). Cada par de esta página
   se midió llamando a check-equal-type! sobre los tipos construidos con
   fresh-tvar, proc-type, int-type y bool-type en
   interpretadores/Interpretes/Corte 2/4 InferenciaTipos, y leyendo el
   contenedor de cada variable después de la llamada. */
var BLOQUES = (function () {
  "use strict";

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function cod(s) { return "<code>" + esc(s) + "</code>"; }
  function prog(s) { return '<code class="programa">' + esc(s) + "</code>"; }
  function par(a, b) { return cod(a) + " con " + cod(b); }

  var CASOS =
    "(check-equal-type! t1 t2 exp)\n" +
    "  prune-type en los dos lados, y después:\n" +
    "  1. el mismo valor en Scheme     -> éxito\n" +
    "  2. t1 es variable               -> check-tvar-equal-type!\n" +
    "  3. t2 es variable               -> el simétrico del anterior\n" +
    "  4. los dos atómicos             -> los nombres deben coincidir\n" +
    "  5. los dos de procedimiento     -> aridad y componente a componente\n" +
    "  6. cualquier otro par           -> Type mismatch";

  var PROCS =
    "((and (proc-type? t1) (proc-type? t2))\n" +
    " (if (not (= (length arg-types1) (length arg-types2)))\n" +
    "   (raise-wrong-number-of-arguments t1 t2 exp)\n" +
    "   (begin\n" +
    "     (for-each\n" +
    "       (lambda (a1 a2) (check-equal-type! a1 a2 exp))\n" +
    "       arg-types1 arg-types2)\n" +
    "     (check-equal-type! result-type1 result-type2 exp))))";

  var TVAR =
    "(define check-tvar-equal-type!\n" +
    "  (lambda (tvar ty exp)\n" +
    "    (if (tvar-non-empty? tvar)\n" +
    "      (check-equal-type! (tvar->contents tvar) ty exp)\n" +
    "      (begin\n" +
    "        (check-no-occurrence! tvar ty exp)\n" +
    "        (tvar-set-contents! tvar ty)))))";

  return [
    {
      id: "unificacion-basicos",
      titulo: "1. Dos tipos atómicos, y una variable contra un tipo",
      definicion: esc(CASOS),
      explicacion:
        "Los casos se prueban en ese orden, y el primero que aplica decide. " +
        "Empiece por los pares donde no hay nada que recorrer.",
      items: [
        { valor: par("int", "int"),
          opciones: ["éxito, y queda anotado que int se unificó con int",
                     "éxito, sin asignar nada",
                     "falla: la unificación exige que al menos un lado sea variable"],
          correcta: 1,
          razon: "El primer caso compara los dos tipos con eqv?, e int-type es una sola constante del módulo de tipos, así que los dos lados son el mismo valor en Scheme y la función devuelve éxito ahí mismo. La unificación solo escribe en contenedores de variables, y aquí no hay ninguna: no queda nada anotado en ninguna parte." },
        { valor: par("t1", "int"),
          opciones: ["éxito, y t1 queda con int",
                     "éxito, y int queda con t1",
                     "falla: t1 está vacía y no hay con qué comparar"],
          correcta: 0,
          razon: "El segundo caso ve que el lado izquierdo es una variable y pasa a check-tvar-equal-type!, que al encontrarla vacía supera el chequeo de ocurrencia y escribe int en su contenedor. La asignación va siempre en ese sentido: la variable guarda el tipo. Un tipo atómico no tiene contenedor donde guardar nada." },
        { valor: par("bool", "t1"),
          opciones: ["falla: la variable tiene que estar del lado izquierdo",
                     "éxito, y los dos lados quedan como estaban",
                     "éxito, y t1 queda con bool"],
          correcta: 2,
          razon: "El tercer caso es el simétrico del segundo: cuando el que es variable resulta ser el lado derecho, check-equal-type! invierte los argumentos y llama a check-tvar-equal-type! con la variable primero. El orden en que se escriba el par no cambia el resultado." },
        { valor: par("int", "bool"),
          opciones: ["éxito: los dos son tipos atómicos del lenguaje",
                     "falla con Type mismatch",
                     "falla con Can't unify, por el chequeo de ocurrencia"],
          correcta: 1,
          razon: "Los dos son atómicos, así que entra el cuarto caso, que compara los nombres. int contra bool no coinciden y raise-type-error aborta. Medido: Type mismatch: int doesn't match bool. El chequeo de ocurrencia no interviene: solo corre cuando hay una variable vacía que se va a llenar." },
        { valor: par("int", "(int -> int)"),
          opciones: ["éxito: el int de la izquierda casa con el int del argumento",
                     "falla con Different numbers of arguments",
                     "falla con Type mismatch"],
          correcta: 2,
          razon: "Un atómico contra un tipo de procedimiento no cae en ninguno de los casos anteriores: no son el mismo valor, ninguno es variable, no son los dos atómicos y no son los dos de procedimiento. Cae en el último y aborta. Medido: Type mismatch: int doesn't match (int -> int). La aridad solo se cuenta cuando los dos lados son de procedimiento." }
      ],
      cierre: "Con dos tipos sin variables, la unificación solo comprueba. La asignación aparece cuando uno de los lados es una variable vacía, y siempre escribe en su contenedor."
    },
    {
      id: "unificacion-procs",
      titulo: "2. Dos tipos de procedimiento, componente a componente",
      definicion: esc(PROCS),
      explicacion:
        "Primero se cuenta la aridad y después se unifica por posición: el " +
        "argumento k de un lado con el argumento k del otro, y al final los " +
        "resultados.",
      items: [
        { valor: par("(int -> t1)", "(int -> bool)"),
          opciones: ["éxito, y t1 queda con bool",
                     "éxito, y t1 queda con int, el argumento que los dos comparten",
                     "falla: un lado trae variable y el otro no"],
          correcta: 0,
          razon: "Misma aridad, así que se unifica por partes. Los argumentos, int contra int, pasan sin escribir nada; los resultados, t1 contra bool, llenan t1 con bool. El argumento no interviene en el resultado: son dos comparaciones separadas sobre dos posiciones distintas." },
        { valor: par("(t1 * t2 -> int)", "(bool * bool -> t3)"),
          opciones: [cod("t1 = bool") + ", " + cod("t2 = bool") + ", y t3 sigue vacía",
                     cod("t1 = bool") + ", " + cod("t2 = int") + ", " + cod("t3 = int"),
                     cod("t1 = bool") + ", " + cod("t2 = bool") + ", " + cod("t3 = int")],
          correcta: 2,
          razon: "Dos argumentos a cada lado, así que for-each empareja t1 con bool y t2 con bool; después se unifican los resultados, int contra t3. Las tres variables quedan llenas en la misma pasada. El emparejamiento es por posición: el segundo argumento de un lado va con el segundo del otro, nunca con el resultado." },
        { valor: par("(t1 * int -> t2)", "(bool * t3 -> t1)"),
          opciones: [cod("t1 = bool") + ", " + cod("t3 = int") + ", y t2 vacía porque el otro resultado también es variable",
                     cod("t1 = bool") + ", " + cod("t2 = bool") + ", " + cod("t3 = int"),
                     "falla: t1 aparece a los dos lados de la comparación"],
          correcta: 1,
          razon: "Primer par de argumentos: t1 contra bool, y t1 queda con bool. Segundo par: int contra t3, y t3 queda con int. Resultados: t2 contra t1, y como t1 ya está llena, prune-type la reemplaza por bool antes de comparar, así que t2 termina con bool. Una variable llena deja de comportarse como variable, y por eso t2 recibe un tipo concreto que no estaba escrito en su lado. La misma variable puede aparecer a los dos lados mientras no quede dentro del tipo que se le asigna." },
        { valor: par("(int -> int)", "(int * int -> t1)"),
          opciones: ["falla con Different numbers of arguments, y t1 sigue vacía",
                     "falla con Type mismatch, y t1 queda con int",
                     "éxito, y t1 queda con int, porque los resultados sí casan"],
          correcta: 0,
          razon: "La aridad se cuenta antes de unificar cualquier componente: un argumento contra dos, y raise-wrong-number-of-arguments aborta sin tocar nada. Medido: Different numbers of arguments (int -> int) and (int * int -> tvar1), y al leer el contenedor de t1 después del aborto sigue vacío. Los resultados nunca se comparan." },
        { valor: par("(t1 -> int)", "(bool -> bool)"),
          opciones: ["éxito, y t1 queda con bool",
                     "falla, y t1 se queda vacía porque aborta antes de escribir",
                     "falla, y t1 ya quedó con bool cuando aborta"],
          correcta: 2,
          razon: "Los argumentos se unifican primero: t1 contra bool, y t1 queda con bool. Después se comparan los resultados, int contra bool, y ahí aborta con Type mismatch: int doesn't match bool. Medido: tras el aborto el contenedor de t1 tiene bool. El unificador escribe a medida que avanza y no deshace lo que ya escribió." },
        { valor: par("(t1 -> t1)", "(int -> bool)"),
          opciones: ["éxito, y t1 queda con int en el argumento y con bool en el resultado",
                     "falla: t1 queda con int al unificar los argumentos y después int no casa con bool",
                     "falla por el chequeo de ocurrencia, porque t1 aparece dos veces"],
          correcta: 1,
          razon: "Una variable es de asignación única: el mismo t1 no puede valer int en una posición y bool en otra. Los argumentos van primero y llenan t1 con int; al llegar a los resultados, prune-type convierte t1 en int y la comparación int contra bool aborta. Medido: Type mismatch: int doesn't match bool, con t1 en int. El chequeo de ocurrencia no entra: t1 no está dentro de ningún tipo que se le quiera asignar." }
      ],
      cierre: "Dos tipos de procedimiento se unifican contando primero la aridad y después por posición. Las asignaciones se escriben sobre la marcha, así que una variable puede quedar llena aunque la unificación aborte después por otro componente."
    },
    {
      id: "unificacion-ocurrencia",
      titulo: "3. El chequeo de ocurrencia",
      definicion: esc(TVAR),
      explicacion:
        "Antes de llenar una variable vacía corre " +
        cod("check-no-occurrence!") + ", que recorre el tipo que se le va a " +
        "asignar buscando esa misma variable. Los cuatro primeros pares se " +
        "distinguen solo en dónde aparece cada variable.",
      items: [
        { valor: par("t1", "(t2 -> t3)"),
          opciones: ["falla por ocurrencia: el tipo que se le asigna tiene variables dentro",
                     "éxito, y t1 queda vacía hasta que t2 y t3 se resuelvan",
                     "éxito, y t1 queda con " + cod("(t2 -> t3)")],
          correcta: 2,
          razon: "El recorrido busca esa variable en particular, no cualquier variable. t1 no está dentro de (t2 -> t3), así que pasa y el contenedor de t1 se llena con el tipo completo. Medido: t1 queda con (t2 -> t3), y t2 y t3 siguen vacías. Un tipo con variables sin resolver se puede asignar: queda guardado tal cual, y lo de dentro se llena después si algo lo fija." },
        { valor: par("t1", "(t2 -> t2)"),
          opciones: ["éxito, y t1 queda con " + cod("(t2 -> t2)"),
                     "falla por ocurrencia, porque t2 aparece dos veces en el tipo",
                     "éxito, y t2 queda con t1, la variable que se estaba unificando"],
          correcta: 0,
          razon: "Que una variable se repita dentro del tipo no es lo que el chequeo busca: busca la que está a punto de llenarse, y esa es t1. t2 repetida solo significa que el argumento y el resultado serán el mismo tipo, cualquiera que resulte. Medido: t1 queda con (t2 -> t2) y t2 sigue vacía." },
        { valor: par("t1", "(t1 -> t2)"),
          opciones: ["éxito, y t1 queda con " + cod("(t1 -> t2)") + ", que se lee a sí misma",
                     "falla por ocurrencia",
                     "falla con Type mismatch: una variable no casa con un procedimiento"],
          correcta: 1,
          razon: "El recorrido entra en (t1 -> t2), encuentra t1 y aborta antes de escribir. Si escribiera, t1 valdría (t1 -> t2), que contiene a t1, que contiene a (t1 -> t2): un tipo infinito, y type-to-external-form entraría en un ciclo al imprimirlo. Medido: Can't unify: tvar12 occurs in type (tvar12 -> tvar13), con los números de esa corrida." },
        { valor: par("t1", "(int -> (t1 * int -> bool))"),
          opciones: ["éxito: t1 está en un tipo anidado y no en el nivel de arriba",
                     "falla con Different numbers of arguments",
                     "falla por ocurrencia"],
          correcta: 2,
          razon: "El recorrido entra en los argumentos y en el resultado de cada tipo de procedimiento, tan hondo como haga falta, y aquí t1 está en los argumentos del tipo que es resultado del de arriba. Medido: Can't unify: tvar14 occurs in type (int -> (tvar14 * int -> bool)). Qué tan anidada esté la variable no cambia el veredicto." },
        { valor: "El programa " + prog("proc (? x) (x x)") + " escribe una sola ecuación, que es",
          opciones: [cod("t1 = (t1 -> t2)") + ", y falla por ocurrencia",
                     cod("t1 = (t2 -> t2)") + ", y falla por ocurrencia",
                     cod("t1 = (int -> t2)") + ", y falla con Type mismatch"],
          correcta: 0,
          razon: "El operador es x, de tipo t1, y el operando también es x, de tipo t1, así que la regla de la aplicación escribe t1 = (t1 -> t2) con t2 fresca para el resultado. La misma variable queda a la izquierda y dentro del tipo de la derecha, y el chequeo aborta. Medido: Can't unify: tvar19 occurs in type (tvar19 -> tvar20). Aplicar un argumento a sí mismo no tiene tipo en este sistema, y no por falta de información: el tipo que haría falta sería infinito." }
      ],
      cierre: "El chequeo de ocurrencia corre justo antes de llenar una variable y busca esa variable dentro del tipo que se le va a asignar, a cualquier profundidad. Lo que impide es un tipo que se contenga a sí mismo."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
