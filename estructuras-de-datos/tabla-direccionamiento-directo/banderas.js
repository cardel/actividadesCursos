/* Ejercicio interactivo: hay un repetido? Comparar pares contra banderas. */
var EJERCICIO = (function () {
  var M = 100;                              // valores de 0 a 99
  var A = [42, 7, 93, 18, 7, 42];

  /* Versión que compara cada par, como repetidoDirecto. */
  function directo(a) {
    var comparaciones = 0;
    var hay = false;
    var valor = -1;
    var i = 0;
    while (i < a.length && !hay) {
      var j = i + 1;
      while (j < a.length && !hay) {
        comparaciones = comparaciones + 1;
        if (a[i] === a[j]) { hay = true; valor = a[i]; }
        j = j + 1;
      }
      i = i + 1;
    }
    return { hay: hay, valor: valor, comparaciones: comparaciones };
  }

  /* Versión con banderas, como repetidoTabla. Guarda una fila por vuelta. */
  function tabla(a) {
    var visto = [];
    var k = 0;
    while (k < M) { visto.push(false); k = k + 1; }
    var hay = false;
    var valor = -1;
    var indice = -1;
    var filas = [];
    var i = 0;
    while (i < a.length && !hay) {
      var antes = visto[a[i]];
      if (antes) { hay = true; valor = a[i]; indice = i; }
      visto[a[i]] = true;
      filas.push([String(i), String(a[i]), antes ? "true" : "false", antes ? "sí, se detiene" : "no; visto[" + a[i] + "] = true"]);
      i = i + 1;
    }
    return { hay: hay, valor: valor, indice: indice, vueltas: i, filas: filas };
  }

  function spec() {
    var D = directo(A);
    var T = tabla(A);
    return {
      contenedor: "tarjetas",
      cierre: "Las dos versiones responden lo mismo, que hay un repetido, pero no encuentran el mismo par: la directa fija un elemento y lo compara con todos los de su derecha, y la de banderas se detiene en el primer valor que ya había visto. La directa hace hasta n(n − 1)/2 comparaciones, Θ(n²) cuando no hay repetidos; la de banderas paga Θ(m) al iniciar y a lo sumo n vueltas, O(n + m), y solo sirve si los valores caben en un universo pequeño.",
      cartas: [
        { tipo: "tabla", titulo: "Banderas, vuelta por vuelta",
          html: "<p>Los valores van de 0 a 99 y el arreglo es</p><pre class=\"fragmento\">a = {" + A.join(", ") + "}</pre><p><code>visto</code> tiene " + M + " casillas en <code>false</code>. En cada vuelta se mira <code>visto[a[i]]</code> antes de marcarla.</p>",
          cabecera: ["i", "a[i]", "visto[a[i]] antes", "¿repetido?"],
          filas: T.filas,
          nota: "Cada vuelta lee y escribe una casilla de <code>visto</code>: Θ(1)." },
        { tipo: "respuesta", titulo: "Dónde se detiene cada una",
          html: "<p>¿En qué índice <code>i</code> se detiene la versión de banderas, y qué valor repetido encuentra? ¿Qué valor encuentra la versión que compara pares?</p>",
          campos: [{ rotulo: "banderas, i =", esperado: String(T.indice) }, { rotulo: "valor:", esperado: String(T.valor) }, { rotulo: "pares, valor:", esperado: String(D.valor) }],
          bien: "Correcto: banderas se detiene en i = " + T.indice + " con el " + T.valor + "; la de pares encuentra el " + D.valor + ", porque empieza comparando a[0] con todos los demás y el otro " + D.valor + " está al final.",
          distractores: [
            { valores: [null, null, String(T.valor)], msg: "La versión de pares fija i = 0 y recorre j hasta el final antes de pasar a i = 1. El " + D.valor + " de la casilla 0 tiene su pareja en la última casilla." },
            { valores: ["5", null, null], msg: "El 42 de la casilla 5 también se repite, pero el ciclo ya se detuvo antes, con el 7." }
          ],
          otro: "Siga la tabla de arriba para las banderas. Para los pares, empiece con a[0] = " + A[0] + "." },
        { tipo: "respuesta", titulo: "Comparaciones",
          html: "<p>¿Cuántas veces evalúa <code>a[i] == a[j]</code> la versión de pares antes de detenerse?</p>",
          campos: [{ rotulo: "comparaciones:", esperado: String(D.comparaciones) }],
          bien: "Correcto: " + D.comparaciones + ". a[0] se compara con a[1] hasta a[5], y la última comparación encuentra el par. Sin repetidos serían " + (A.length * (A.length - 1) / 2) + ", todos los pares.",
          distractores: [
            { valores: [String(A.length * (A.length - 1) / 2)], msg: "Ese es el total de pares. El ciclo se detiene apenas encuentra uno." }
          ],
          otro: "Con i = 0, j va de 1 a 5." },
        { tipo: "opciones", titulo: "Valores grandes", columna: true, correcta: "no",
          html: "<p>Ahora los valores van de 0 a 10<sup>9</sup> y el arreglo tiene 50 elementos. ¿Conviene la versión de banderas?</p>",
          opciones: [
            { op: "si", texto: "Sí: cada vuelta sigue siendo Θ(1)", msg: "Cada vuelta sí, pero iniciar visto pone 10<sup>9</sup> casillas en false, y el arreglo ocupa del orden de un gigabyte para revisar 50 valores." },
            { op: "no", texto: "No: iniciar la tabla cuesta Θ(m) con m = 10<sup>9</sup>", msg: "Correcto. Con 50 elementos, la directa hace a lo sumo 1225 comparaciones. La tabla gana cuando el universo es pequeño frente a n²." },
            { op: "igual", texto: "Da lo mismo: las dos son lineales", msg: "La directa es Θ(n²) en el peor caso y la de banderas Θ(n + m). Con m = 10<sup>9</sup>, el término m manda." }
          ] }
      ]
    };
  }

  return { m: M, a: A, directo: directo, tabla: tabla, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
