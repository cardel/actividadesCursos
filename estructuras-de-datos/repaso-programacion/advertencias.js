/* Ejercicio interactivo: por qué se compila con advertencias. Saldo.cpp
   asigna en la condición del if; el aviso es el que dio g++ -Wall -Wextra. */
var EJERCICIO = (function () {
  var P = typeof module !== "undefined" ? require("./programas.js") : Programas;

  function spec() {
    return {
      contenedor: "tarjetas",
      cierre: "<p><code>=</code> asigna y <code>==</code> compara. Una asignación en C vale lo que se asignó, así que <code>if (saldo = 0)</code> deja el saldo en 0 y la condición en falso, y <code>if (x = 5)</code> la deja en verdadero: en los dos casos el programa compila y hace otra cosa. Sin <code>-Wall -Wextra</code> el compilador calla; con ellas avisa en la línea exacta. Por eso todo programa del curso se compila con las dos opciones y no se entrega con avisos.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Lo que imprime",
          html: P.pre(P.codigo("Saldo")) + "<p>Se compila sin advertencias y se corre. ¿Qué imprime?</p>",
          campos: [
            { rotulo: "imprime:", esperado: "Saldo: 0", ancho: "9rem" }
          ],
          bien: "Correcto. saldo = 0 guarda un 0 en saldo, y la condición vale 0: falso. No se imprime Cuenta vacia, y el saldo, que era 40, quedó en 0.",
          distractores: [
            { valores: ["Cuenta vacia"], msg: "La condición vale lo que se asignó, y se asignó un 0, que es falso: no entra al if." },
            { valores: ["Saldo: 40"], msg: "El if no se toma, pero la asignación de la condición sí se ejecuta: saldo ya vale 0 cuando llega al printf." }
          ],
          otro: "Ejecute saldo = 0 como una asignación de verdad y use su valor como condición." },
        { tipo: "opciones", titulo: "Con las advertencias encendidas", columna: true, correcta: "linea",
          html: "<p>Con <code>g++ -o saldo Saldo.cpp -Wall -Wextra</code> el compilador escribe:</p>" + P.pre(P.AVISO_SALDO) + "<p>¿Qué dice ese aviso?</p>",
          opciones: [
            { op: "linea", texto: "Que en la línea 5 hay una asignación usada como condición, que casi siempre es un <code>==</code> mal escrito.", msg: "Correcto. 5:13 es la línea y la columna. El aviso no detiene la compilación: el ejecutable se genera igual, y por eso hay que leerlo." },
            { op: "error", texto: "Que el programa tiene un error y no se generó el ejecutable.", msg: "Es un warning, no un error: el ejecutable sí quedó. Justamente por eso es fácil ignorarlo." },
            { op: "parentesis", texto: "Que faltan paréntesis y basta agregarlos: <code>if ((saldo = 0))</code>.", msg: "Los paréntesis dobles callan el aviso, y el programa sigue asignando. Es la forma de decirle al compilador que la asignación era a propósito, y aquí no lo era." }
          ] },
        { tipo: "respuesta", titulo: "Corregido",
          html: "<p>Se cambia la línea 5 por <code>if (saldo == 0) {</code>. ¿Qué imprime ahora?</p>",
          campos: [{ rotulo: "imprime:", esperado: "Saldo: 40", ancho: "9rem" }],
          bien: "Correcto. 40 == 0 es falso, no entra al if, y saldo conserva su valor.",
          distractores: [
            { valores: ["Saldo: 0"], msg: "Con == ya no hay asignación: saldo sigue valiendo 40." },
            { valores: ["Cuenta vacia"], msg: "40 == 0 es falso: no entra al if." }
          ],
          otro: "Ahora la condición solo compara; saldo no cambia." },
        { tipo: "opciones", titulo: "Otra vez la asignación", columna: true, correcta: "siempre",
          html: "<p>Un ciclo debía repetir mientras <code>opcion</code> valiera 3:</p>" + P.pre(["while (opcion = 3) {", "  scanf(\"%d\", &opcion);", "}"]) + "<p>¿Qué hace?</p>",
          opciones: [
            { op: "nunca", texto: "No entra nunca, salvo que opcion ya valga 3.", msg: "La condición no compara: guarda un 3 y vale 3, que es verdadero, sea cual sea lo que haya leído." },
            { op: "siempre", texto: "No termina: cada vuelta vuelve a poner opcion en 3, y 3 es verdadero.", msg: "Correcto. El scanf lee un valor nuevo y la condición lo pisa con un 3. -Wall -Wextra avisa en esta línea igual que en el if." },
            { op: "bien", texto: "Funciona: repite mientras se escriba 3.", msg: "Eso haría while (opcion == 3). Con un solo signo igual, lo que se lee nunca llega a compararse." }
          ] }
      ]
    };
  }

  return { spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
