/* ¿Cuánto vale este dato? Un mismo valor de Racket leído bajo distintas
   representaciones del TAD natural. Tres de ellas las vio la sesión; las
   otras dos no, y se definen aquí mismo. */
var BLOQUES = (function () {
  "use strict";
  return [
    {
      id: "leer",
      titulo: "1. Leer el número que hay detrás del dato",
      definicion:
        "unaria      ⌈0⌉ = ()        ⌈n+1⌉ = (cons #t ⌈n⌉)\n" +
        "bignum N    ⌈0⌉ = ()        ⌈n⌉ = (cons r ⌈q⌉) con n = q·N + r, 0 ≤ r < N\n" +
        "anidada     ⌈0⌉ = ()        ⌈n+1⌉ = (list ⌈n⌉)",
      explicacion:
        "En bignum el primer elemento es el dígito <b>menos</b> significativo. " +
        "La representación anidada no aparece en la sesión: un natural es una " +
        "lista vacía envuelta tantas veces como diga el número. Para cada " +
        "dato, escoja el valor.",
      items: [
        { valor: "unaria: <code>()</code>",
          opciones: ["0: la lista vacía es el dato de cero",
                     "1: la lista vacía es el primer dato",
                     "Ninguno: ⌈n⌉ necesita al menos un #t"], correcta: 0,
          razon: "La lista vacía es ⌈0⌉ en las tres representaciones con listas, y es el único dato que las tres comparten." },
        { valor: "unaria: <code>(#t #t #t #t)</code>", opciones: ["3", "4", "5"], correcta: 1,
          razon: "Cuatro elementos, cuatro aplicaciones de succ sobre la lista vacía." },
        { valor: "bignum base 10: <code>(1 2)</code>",
          opciones: ["12, leyendo la lista como en papel",
                     "3, sumando los dos dígitos",
                     "21, con el 1 en las unidades"], correcta: 2,
          razon: "El 1 es el dígito de las unidades y el 2 el de las decenas: 1 + 2·10 = 21. Quien lee la lista de izquierda a derecha, como se escribe un número en papel, obtiene 12." },
        { valor: "bignum base 16: <code>(1 2)</code>", opciones: ["33", "18", "21"], correcta: 0,
          razon: "La misma lista (1 2) vale 33 en base 16: 1 + 2·16. El valor depende de la base tanto como del dato." },
        { valor: "bignum base 2: <code>(1 0 1)</code>",
          opciones: ["101, el dato leído como un decimal",
                     "5, con el bit de las unidades primero",
                     "2, contando los unos como en la unaria"], correcta: 1,
          razon: "1 + 0·2 + 1·4 = 5. En base 2 el dato es el número en binario, con el bit menos significativo adelante. Contar cuántos elementos hay funciona en la unaria y no en bignum." },
        { valor: "bignum base 10: <code>(0 0 1)</code>",
          opciones: ["100, con el 1 en las centenas",
                     "1, el único dígito distinto de cero",
                     "001, el dato escrito como un número"], correcta: 0,
          razon: "0 + 0·10 + 1·100 = 100. Los ceros de adelante son las unidades y las decenas: valen cero y ocupan su posición." },
        { valor: "bignum base 16: <code>(15 15)</code>",
          opciones: ["30, sumando los dos dígitos del dato",
                     "255, el mayor número de dos dígitos",
                     "1515, pegando los dígitos como texto"], correcta: 1,
          razon: "15 + 15·16 = 255, el tope de dos dígitos en base 16 como 99 lo es en base 10. Cada dígito de esta base llega hasta 15, así que (15 15) está bien formado." },
        { valor: "anidada: <code>(((())))</code>", opciones: ["4", "1", "3"], correcta: 2,
          razon: "La lista vacía es cero y cada par de paréntesis que la envuelve es un succ. Alrededor de () hay tres envolturas." }
      ],
      cierre:
        "Un mismo dato es un número distinto según la representación, y la " +
        "representación no viene escrita en el dato. Por eso el cliente no " +
        "puede leerlo por su cuenta: solo la interfaz sabe qué significa."
    },
    {
      id: "ambiguo",
      titulo: "2. Lo que el dato solo no puede decir",
      explicacion:
        "Ahora sin decir la representación, o con un dato que no encaja en " +
        "ella. La pregunta cambia: ya no es cuánto vale, sino si se puede " +
        "saber.",
      items: [
        { valor: "<code>(#t #t)</code> leído como bignum base 10",
          opciones: ["2, contando los dos #t de la lista",
                     "11, con un uno en cada posición",
                     "No es un dato: #t no es un dígito"], correcta: 2,
          razon: "Los elementos de un ⌈n⌉ en base 10 son dígitos de 0 a 9, y #t no lo es. La misma lista está bien formada en la unaria, donde vale 2." },
        { valor: "<code>(10)</code> leído como bignum base 10",
          opciones: ["No es un dato: 10 pasa de la base",
                     "10, el dato tiene un solo dígito",
                     "1, leyendo 10 como los dígitos 1 y 0"], correcta: 0,
          razon: "Un dígito en base 10 va de 0 a 9, y ⌈10⌉ se escribe (0 1). Que Racket acepte la lista no la vuelve un ⌈n⌉." },
        { valor: "<code>(1 2)</code>, sin saber la representación. ¿Qué número es?",
          opciones: ["21, que es lo que vale en base 10",
                     "No se puede saber sin la representación",
                     "12, que es como se lee la lista escrita"], correcta: 1,
          razon: "Vale 21 en base 10 y 33 en base 16. En base 2 el dígito 2 no existe, y en la unaria y en la anidada la lista no es un natural. Sin la representación, el dato no dice nada." },
        { valor: "<code>(3 0)</code> leído como bignum base 10",
          opciones: ["3, que es lo que suman sus dígitos",
                     "30, leyendo la lista como se escribe",
                     "No es un dato: ⌈3⌉ es (3) y nada más"], correcta: 2,
          razon: "La suma da 3 y la definición no produce esa lista: ⌈0⌉ es la lista vacía, así que ⌈3⌉ es (3). Un cero al final solo aparece si alguien arma el dato a mano." },
        { valor: "¿<code>(equal? '(3 0) '(3))</code>?", opciones: ["#t", "#f"], correcta: 1,
          razon: "Son listas distintas. Un cliente que armó (3 0) a mano creyendo que vale 3 recibe #f al compararlo con el ⌈3⌉ legítimo. Los datos se construyen con los constructores y se comparan por la interfaz." },
        { valor: "En bignum, ¿<code>(zero? '(0))</code>?", opciones: ["#t", "#f"], correcta: 1,
          razon: "zero? es null? y (0) no es la lista vacía, así que responde #f aunque el número valga cero. Es el precio de una representación con varias formas para el mismo número, y la razón para que succ y pred nunca produzcan (0)." }
      ],
      cierre:
        "La representación es un contrato entre el constructor y el " +
        "observador. Un dato que llega por fuera de ese contrato, armado a " +
        "mano o con una forma que los constructores nunca producen, puede " +
        "ser aceptado por Racket y aun así no significar nada."
    },
    {
      id: "operar",
      titulo: "3. Operar sin salirse de la representación",
      explicacion:
        "Los constructores tienen que producir datos bien formados, y en " +
        "bignum eso significa manejar el acarreo y el préstamo. Prediga cada " +
        "resultado.",
      items: [
        { valor: "unaria: <code>(pred '(#t #t #t))</code>",
          opciones: ["<code>(#t #t)</code>, un #t menos",
                     "<code>(#t #t #f)</code>, el #t se marca",
                     "<code>2</code>, el número que representa"], correcta: 0,
          razon: "pred es cdr: quita un #t y devuelve otro dato de la representación unaria. Lo que sale no es un número de Racket." },
        { valor: "bignum base 10: <code>(succ '(9))</code>",
          opciones: ["<code>(10)</code>", "<code>(0 1)</code>", "<code>(9 1)</code>"], correcta: 1,
          razon: "9 + 1 = 10, que no cabe en un dígito: queda 0 y se lleva 1 a la posición siguiente, que no existía y se crea." },
        { valor: "bignum base 16: <code>(succ '(15))</code>",
          opciones: ["<code>(0 1)</code>", "<code>(16)</code>", "<code>(15 1)</code>"], correcta: 0,
          razon: "En base 16 el dígito máximo es 15. Un paso más lo lleva a 0 con acarreo, y 16 se escribe (0 1)." },
        { valor: "bignum base 10: <code>(succ '(9 9))</code>",
          opciones: ["<code>(10 9)</code>", "<code>(0 10)</code>", "<code>(0 0 1)</code>"], correcta: 2,
          razon: "El acarreo se propaga: el primer 9 pasa a 0 y lleva, el segundo también, y el 1 final abre una posición nueva. 99 + 1 = 100." },
        { valor: "bignum base 10: <code>(pred '(0 1))</code>",
          opciones: ["<code>(-1 1)</code>, sin pedir prestado",
                     "<code>(9 0)</code>, con la decena en cero",
                     "<code>(9)</code>, con la decena quitada"], correcta: 2,
          razon: "10 − 1 = 9. Las unidades piden prestado a la decena, que baja a cero, y ese cero al final se quita: el resultado es (9) y no (9 0)." },
        { valor: "anidada: <code>(succ '(()))</code>",
          opciones: ["<code>(() ())</code>", "<code>((()))</code>", "<code>(#t ())</code>"], correcta: 1,
          razon: "succ envuelve una vez más: (list ⌈1⌉) = ((())). Dos listas vacías una al lado de la otra pertenecen a otra representación." }
      ],
      cierre:
        "El acarreo y el préstamo mantienen el dato dentro de la " +
        "representación, y por eso un succ que devolviera (10) rompería a " +
        "todos los demás procedimientos aunque el número fuera el correcto."
    }
  ];
})();

if (typeof module !== "undefined") { module.exports = BLOQUES; }

/* --- Interfaz ----------------------------------------------------- */
if (typeof document !== "undefined") {
  MotorDecisiones.montar({ bloques: BLOQUES, destino: "bloques", cierre: "carta-cierre" });
}
