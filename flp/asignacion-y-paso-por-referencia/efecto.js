/* Valor y efecto: distinguir ligadura de asignación, decidir cuándo una
   subexpresión se puede cambiar por su valor, medir si el orden de
   evaluación cambia el resultado y sopesar lo que el lenguaje gana y pierde
   con set. */
var BLOQUES = (function () {
  "use strict";

  function programa(texto) { return '<code class="programa">' + texto + "</code>"; }

  var SIG = "let c = 0 in let sig = proc() begin set c = add1(c); c end in ";

  return [
    {
      id: "efecto-ligadura-o-asignacion",
      titulo: "1. Ligadura o asignación",
      definicion: null,
      explicacion:
        "Una ligadura crea una asociación nueva en un ambiente extendido y " +
        "deja intacto el ambiente anterior; una asignación sobrescribe una " +
        "celda que ya existía (EOPL §4.1). Diga qué es la operación " +
        "señalada en cada programa.",
      opciones: ["Ligadura: celda nueva en un ambiente extendido",
                 "Asignación: sobrescribe una celda existente"],
      items: [
        { valor: "El <code>w = add1(w)</code> de adentro en " +
            programa("let w = 7 in +(let w = add1(w) in w, w)"),
          correcta: 0,
          razon: "Es una ligadura: el let de adentro arma un eslabón nuevo con una celda que guarda 8, y la celda de afuera sigue en 7. Por eso el programa vale 15 y no 16. Las dos variables se llaman igual, y justo por eso se nota que son dos celdas." },
        { valor: "El <code>set w = add1(w)</code> en " +
            programa("let w = 7 in +(begin set w = add1(w); w end, w)"),
          correcta: 1,
          razon: "Es una asignación: no hay eslabón nuevo, set escribe 8 en la misma celda que creó el let. La segunda w del + lee esa celda ya cambiada, y el programa vale 16." },
        { valor: "El <code>set x = 9</code> en " +
            programa("begin set x = 9; +(x, a) end") +
            ", en el intérprete de asignación",
          correcta: 1,
          razon: "Sobrescribe la celda de x en el primer eslabón del ambiente inicial, la posición 0 del vector #(4 2 5), que pasa a #(9 2 5). El programa vale 13. Ningún let la creó: la celda existía desde antes de empezar." },
        { valor: "Ligar el parámetro <code>k</code> al aplicar <code>(p m)</code> en " +
            programa("let p = proc(k) begin set k = 0; k end in let m = 5 in +((p m), m)") +
            ", en el intérprete de asignación",
          correcta: 0,
          razon: "Es una ligadura: la aplicación extiende el ambiente de la clausura con una celda nueva para k, que empieza con una copia del 5. El set de adentro escribe en esa celda y no en la de m, así que el programa vale 0 + 5 = 5. En el intérprete de paso por referencia el mismo programa vale 0." },
        { valor: "El <code>set h = 5</code> en " +
            programa("letrec h(n) = n in begin set h = 5; h end"),
          correcta: 1,
          razon: "El letrec ligó h a una celda que guarda la clausura, y set escribe 5 en esa misma celda. El programa vale 5. Un nombre declarado con letrec se puede asignar igual que cualquier otro." },
        { valor: "El <code>y = 100</code> en " +
            programa("let leer = proc() y in let y = 100 in begin set y = 7; (leer) end"),
          correcta: 0,
          razon: "Es una ligadura, y eso decide el resultado: crea una celda nueva para y, y el set y = 7 escribe en ella. leer capturó el ambiente inicial, donde y vale 2, y esa celda nadie la tocó. El programa vale 2." }
      ],
      cierre:
        "La pregunta que separa las dos operaciones es si aparece un eslabón " +
        "nuevo. let, letrec y la aplicación de un procedimiento los crean; set " +
        "nunca crea uno: busca la celda más cercana con ese nombre y la cambia."
    },
    {
      id: "efecto-transparencia",
      titulo: "2. ¿Se puede cambiar la subexpresión por su valor?",
      definicion: null,
      explicacion:
        "Una expresión es referencialmente transparente si cambiarla por su " +
        "valor no altera el resultado del programa. Cada renglón señala una " +
        "subexpresión y el valor que tuvo al correr. Diga si el reemplazo " +
        "deja el resultado igual.",
      opciones: ["Sí: el resultado no cambia", "No: el resultado cambia"],
      items: [
        { valor: "En " + programa(SIG + "+((sig), (sig))") +
            ", que vale 3, cambiar el primer <code>(sig)</code> por 1",
          correcta: 1,
          razon: "Con el cambio el programa vale 2. La primera llamada a sig, además de devolver 1, deja la celda de c en 1; si se quita esa llamada, la segunda encuentra c en 0 y devuelve 1 en vez de 2." },
        { valor: "En " + programa("let w = 3 in +(*(w, 2), *(w, 2))") +
            ", que vale 12, cambiar el primer <code>*(w, 2)</code> por 6",
          correcta: 0,
          razon: "Sigue valiendo 12. La multiplicación lee w y no escribe nada, y nadie asigna w en este programa. Que el lenguaje tenga set no vuelve opaca cada expresión: lo pierden las que asignan o leen celdas que alguien asigna." },
        { valor: "En " + programa("let c = 10 in begin set c = 0; c end") +
            ", que vale 0, cambiar la última <code>c</code> por 10, el valor con que la ligó el let",
          correcta: 1,
          razon: "Con el cambio vale 10. Una variable ya no tiene un valor fijo: denota una celda, y lo que se lee depende de cuándo se lee. Antes del set la celda guardaba 10; después guarda 0." },
        { valor: "En " + programa("let doble = proc(n) *(n, 2) in +((doble 3), (doble 3))") +
            ", que vale 12, cambiar el primer <code>(doble 3)</code> por 6",
          correcta: 0,
          razon: "Sigue en 12. doble solo lee su parámetro, que vive en una celda nueva en cada llamada, y no toca ninguna otra. Dos llamadas iguales dan lo mismo y no dejan rastro." },
        { valor: "En " + programa("let t = 1 in let leer = proc() t in +((leer), begin set t = 5; (leer) end)") +
            ", que vale 6, cambiar el segundo <code>(leer)</code> por 1, lo que dio el primero",
          correcta: 1,
          razon: "Con el cambio vale 2. leer no asigna nada, pero lee una celda que otra parte del programa asigna, y entre las dos llamadas el set la llevó de 1 a 5. Basta con eso para que dos llamadas idénticas den valores distintos." },
        { valor: "En " + programa("let p = proc(k) begin set k = 0; k end in let m = 5 in +((p m), m)") +
            ", que vale 5 en el intérprete de asignación, cambiar la última <code>m</code> por 5",
          correcta: 0,
          razon: "En el intérprete de asignación sigue valiendo 5: p asigna su propia celda k y la de m queda en 5. En el de paso por referencia la respuesta cambia: el programa vale 0, porque k comparte la celda de m, y con el reemplazo valdría 5." }
      ],
      cierre:
        "Una subexpresión deja de ser transparente cuando escribe una celda " +
        "o cuando lee una celda que algo escribe. Lo primero se ve en el texto " +
        "de la subexpresión; lo segundo solo se descubre mirando el resto del " +
        "programa."
    },
    {
      id: "efecto-orden",
      titulo: "3. ¿El orden de evaluación cambia el resultado?",
      definicion: null,
      explicacion:
        "El intérprete evalúa los argumentos de una primitiva y las partes " +
        "derechas de un <code>let</code> de izquierda a derecha. Para cada " +
        "programa, diga si evaluarlos de derecha a izquierda daría otro valor. " +
        "Cada valor de la razón se midió, y el de derecha a izquierda con el " +
        "programa reescrito en ese orden.",
      opciones: ["Sí: en otro orden daría otro valor", "No: cualquier orden da lo mismo"],
      items: [
        { valor: programa(SIG + "-((sig), (sig))"),
          correcta: 0,
          razon: "Vale -1: el primer argumento recibe 1 y el segundo 2. En el otro orden el segundo argumento recibiría 1 y el primero 2, y daría 1; eso vale let q = (sig) in let p = (sig) in -(p, q), que fuerza ese orden." },
        { valor: programa("let w = 2 in *(w, begin set w = 5; w end)"),
          correcta: 0,
          razon: "Vale 10: la primera w lee 2 antes de que el begin asigne. De derecha a izquierda el begin asignaría primero y la w leería 5: daría 25, lo que vale let d = begin set w = 5; w end in let i = w in *(i, d)." },
        { valor: programa("let u = 1 v = 2 in +(begin set u = 10; u end, begin set v = 20; v end)"),
          correcta: 1,
          razon: "Vale 30 en cualquier orden. Cada argumento asigna una celda y lee solo esa, y ninguno toca la del otro. El orden importa cuando una parte escribe una celda que otra parte lee." },
        { valor: programa("let w = 3 in -(let w = *(w, w) in w, w)"),
          correcta: 1,
          razon: "Vale 6 en cualquier orden. El let de adentro liga una w nueva con 9 y no toca la de afuera, que sigue en 3. Sin set no hay celda que cambie entre un argumento y otro." },
        { valor: programa(SIG + "let p = (sig) q = (sig) in -(p, q)"),
          correcta: 0,
          razon: "Vale -1: el let evalúa sus partes derechas de izquierda a derecha, así que p recibe 1 y q recibe 2. En el otro orden q recibiría 1, p recibiría 2 y daría 1. El orden de las ligaduras de un let pasa a ser parte del significado." }
      ],
      cierre:
        "Sin set, el orden entre argumentos es un detalle de implementación. " +
        "Con set pasa a ser parte del significado, y por eso el intérprete " +
        "lo fija: izquierda a derecha en las primitivas y en las ligaduras " +
        "del let."
    },
    {
      id: "efecto-gana-y-cuesta",
      titulo: "4. Qué gana y qué cuesta el lenguaje",
      definicion: null,
      explicacion:
        "Diga si cada afirmación es verdadera. Los programas se midieron en " +
        "el intérprete que indica cada renglón.",
      opciones: ["Verdadero", "Falso"],
      items: [
        { valor: "Un procedimiento puede llevar la cuenta de cuántas veces lo han llamado: " +
            programa("let n = 0 in let tic = proc() begin set n = add1(n); n end in begin (tic); (tic); (tic) end"),
          correcta: 0,
          razon: "Verdadero: vale 3. La celda de n vive en el ambiente que tic capturó, así que sobrevive de una llamada a la siguiente. Sin set, cada llamada solo podría leer el 0 con que se ligó n." },
        { valor: "Dos procedimientos pueden compartir un estado que ninguno recibe como argumento: " +
            programa("let saldo = 100 in let dep = proc(m) set saldo = +(saldo, m) ver = proc() saldo in begin (dep 20); (dep 5); (ver) end"),
          correcta: 0,
          razon: "Verdadero: vale 125. Las dos clausuras capturan el mismo eslabón, donde está la celda de saldo; lo que dep escribe, ver lo lee." },
        { valor: "Para saber cuánto devuelve <code>(ver)</code> en el programa anterior basta con leer el cuerpo de ver.",
          correcta: 1,
          razon: "Falso: el cuerpo dice saldo y nada más. Con (dep 20); (dep 5) antes, (ver) devuelve 125; con solo (dep 20), devuelve 120. Para razonar sobre (ver) hay que reconstruir la historia de las llamadas que escribieron la celda." },
        { valor: "Con set, el lenguaje gana una forma de repetir sin recursión.",
          correcta: 1,
          razon: "Falso: la gramática no tiene ninguna forma de ciclo. La repetición sigue saliendo de letrec; set solo deja acumular en una celda mientras se recurre. let s = 0 in letrec sumar(n) = if ==(n, 0) then s else begin set s = +(s, n); (sumar sub1(n)) end in (sumar 4) vale 10." },
        { valor: "En " + programa("let u = c in begin set u = 0; c end") +
            ", u y c comparten celda, en cualquiera de los dos intérpretes.",
          correcta: 1,
          razon: "Falso: vale 6 en los dos. let evalúa c, obtiene 6 y lo guarda en una celda nueva para u; set u = 0 cambia esa celda. Un let copia el valor, y eso no cambia ni siquiera en paso por referencia." },
        { valor: "En el intérprete de paso por referencia, " +
            programa("let f = proc(r, s) begin set r = 10; s end in let w = 1 in (f w w)") +
            " devuelve 10 aunque el cuerpo nunca asigna s.",
          correcta: 0,
          razon: "Verdadero: r y s son dos nombres para la celda de w, y lo que se escribe por uno se lee por el otro. Es aliasing, y lo que lo hace difícil de ver es que el cuerpo de f no lo delata. En el intérprete de asignación el mismo programa vale 1." }
      ],
      cierre:
        "Lo que se gana sale de una sola cosa: una celda puede sobrevivir y " +
        "estar al alcance de varios procedimientos. Lo que cuesta sale de lo " +
        "mismo, porque para saber qué hay en esa celda hay que conocer a todos " +
        "los que la escriben."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
