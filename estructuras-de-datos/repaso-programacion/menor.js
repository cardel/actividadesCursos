/* Ejercicio interactivo: el menor de cuatro números. Se supone que el menor
   es el primero y se corrige cada vez que otro valor es más pequeño. */
var EJERCICIO = (function () {
  var P = typeof module !== "undefined" ? require("./programas.js") : Programas;
  var ENTRADA = [8, 3, 9, 1];
  var BIEN = [6, 9, 2, 4];
  var FALLA = [6, 9, 4, 2];

  function spec() {
    return {
      contenedor: "tarjetas",
      cierre: "<p>Para el menor, o el mayor, de varios valores: se supone que es el primero y se compara con cada uno de los demás, corrigiendo cada vez que alguno lo supera. Cada comparación es un <code>if</code> independiente, porque todas tienen que hacerse. Con <code>else if</code> la cadena se corta en la primera corrección, y el programa solo acierta cuando el menor está antes del primer valor que mejora al de partida.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Lo que imprime",
          html: P.pre(P.codigo("Menor")) + "<p>Se corre con la entrada <code>" + ENTRADA.join(" ") + "</code>. ¿Qué valor tiene <code>menor</code> después de cada <code>if</code>?</p>",
          campos: [
            { rotulo: "tras el if de b:", esperado: "3", ancho: "3rem" },
            { rotulo: "de c:", esperado: "3", ancho: "3rem" },
            { rotulo: "de d:", esperado: "1", ancho: "3rem" }
          ],
          bien: "Correcto. Empieza en 8; el 3 lo corrige, el 9 no, el 1 sí. Imprime El menor es " + P.menor(ENTRADA) + ".",
          distractores: [
            { valores: [null, "9", null], msg: "El if de c solo cambia menor si c es más pequeño. 9 < 3 es falso: menor sigue en 3." },
            { valores: ["8", null, null], msg: "3 < 8 es verdadero: el primer if ya corrige menor a 3." }
          ],
          otro: "Empiece con menor = 8 y, en cada if, cámbielo solo si el valor nuevo es más pequeño." },
        { tipo: "respuesta", titulo: "Con else if",
          html: "<p>Alguien encadena las comparaciones:</p>" + P.pre(P.codigo("MenorMal").slice(7, 14)) + "<p>Con la misma entrada <code>" + ENTRADA.join(" ") + "</code>, ¿qué imprime?</p>",
          campos: [{ rotulo: "El menor es", esperado: String(P.menorMal(ENTRADA)), ancho: "3rem" }],
          bien: "Correcto. El 3 corrige a menor, y como esa rama se tomó, las otras dos ni se miran. El 1 nunca se compara.",
          distractores: [
            { valores: [String(P.menor(ENTRADA))], msg: "Ese es el resultado correcto, y este programa no lo da. Con else if, después de tomar la primera rama ya no se revisan las demás." },
            { valores: ["8"], msg: "3 < 8 es verdadero: la primera rama sí se toma." }
          ],
          otro: "En una cadena if, else if, se ejecuta a lo sumo una rama: la primera cuya condición sea verdadera." },
        { tipo: "opciones", titulo: "Cuándo acierta el de else if", columna: true, correcta: "falla",
          html: "<p>Con el programa de <code>else if</code>, ¿cuál de estas entradas da un resultado equivocado?</p>",
          opciones: [
            { op: "bien", texto: "<code>" + BIEN.join(" ") + "</code>", msg: "Imprime " + P.menorMal(BIEN) + ", que es correcto. El 9 no corrige; el 2 sí, y es el menor: no hace falta mirar el 4." },
            { op: "falla", texto: "<code>" + FALLA.join(" ") + "</code>", msg: "Correcto. Imprime " + P.menorMal(FALLA) + ": el 4 corrige a menor y la cadena se corta, así que el 2 nunca se compara." },
            { op: "primero", texto: "<code>1 5 7 3</code>", msg: "Imprime " + P.menorMal([1, 5, 7, 3]) + ", que es correcto: ninguna rama se toma, porque nada es menor que 1." }
          ] },
        { tipo: "opciones", titulo: "Muchos números", columna: true, correcta: "ciclo",
          html: "<p>Ahora son cien números en un arreglo <code>v</code>. ¿Cómo se escribe el menor?</p>",
          opciones: [
            { op: "ifs", texto: "Con cien <code>if</code> seguidos, uno por casilla.", msg: "Funciona y no escala: cada tamaño pediría otro programa. La comparación es siempre la misma, y eso es lo que hace un ciclo." },
            { op: "ciclo", texto: "<code>menor = v[0];</code> y un ciclo de 1 a 99 con un solo <code>if (v[i] &lt; menor)</code>.", msg: "Correcto. Es la misma idea de los cuatro if, con el if dentro de un ciclo: cada vuelta compara una casilla y corrige si hace falta." },
            { op: "cero", texto: "<code>menor = 0;</code> y un ciclo de 0 a 99 que corrige cuando <code>v[i] &lt; menor</code>.", msg: "Si todos los números son positivos, ninguno es menor que 0 y el programa imprime 0, que no está en el arreglo. Hay que partir de un valor del arreglo." }
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
