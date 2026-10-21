/* Ejercicio interactivo: lo que cuesta el map frente a la tabla hash, y cuál escoger. */
var EJERCICIO = (function () {
  var TAMANOS = [1000, 1000000000];

  /* Comparaciones que hace, mas o menos, una busqueda que parte el resto por la mitad. */
  function mitades(n) {
    var c = 0;
    var resto = n;
    while (resto > 1) {
      resto = Math.ceil(resto / 2);
      c = c + 1;
    }
    return c;
  }

  function spec() {
    var c = TAMANOS.map(mitades);
    return {
      contenedor: "tarjetas",
      cierre: "El map paga O(log n) por operación, también en el peor caso, y a cambio guarda las claves en orden. La tabla hash paga Θ(1 + α) en promedio pero recorre por casillas. Se escoge el map cuando el orden de las claves está en la salida o cuando el peor caso tiene que quedar acotado; si solo se pregunta si una clave está, la tabla hash.",
      cartas: [
        { tipo: "respuesta", titulo: "Mitades",
          html: "<p>Cada comparación de una búsqueda en el map deja, más o menos, la mitad de las claves que quedaban. ¿Cuántas comparaciones hacen falta para quedar con una sola clave?</p>",
          campos: [
            { rotulo: "n = 1000:", esperado: String(c[0]), ancho: "3rem" },
            { rotulo: "n = 10<sup>9</sup>:", esperado: String(c[1]), ancho: "3rem" }
          ],
          bien: "Correcto: log₂ 1000 ≈ 10 y log₂ 10⁹ ≈ 30. Multiplicar las claves por un millón solo agrega unas veinte comparaciones.",
          distractores: [
            { valores: ["500", null], msg: "Eso es una sola mitad. Hay que seguir partiendo: 500, 250, 125, ... hasta 1." },
            { valores: ["3", "9"], msg: "Ese es el logaritmo en base 10. Cada paso parte en dos, así que la base es 2." }
          ],
          otro: "Cuente cuántas veces se divide n entre 2 hasta llegar a 1." },
        { tipo: "opciones", titulo: "Un parqueadero", columna: true, correcta: "hash",
          html: "<p>Un parqueadero registra la placa de cada carro que entra y la borra cuando sale. En la puerta solo se pregunta si una placa está adentro, miles de veces al día.</p>",
          opciones: [
            { op: "hash", texto: "Tabla hash", msg: "Correcto: insertar, buscar y eliminar en Θ(1 + α) en promedio, y la salida nunca pide las placas en orden." },
            { op: "map", texto: "map", msg: "Funciona, pero paga O(log n) por consulta por un orden que nadie usa." }
          ] },
        { tipo: "opciones", titulo: "Un ranking de productos", columna: true, correcta: "map",
          html: "<p>Tras cada venta, una pantalla muestra todos los códigos de producto vendidos, de menor a mayor, con su total.</p>",
          opciones: [
            { op: "map", texto: "map", msg: "Correcto: cada venta cuesta O(log n) y cada pantalla es un recorrido de Θ(n), ya en orden." },
            { op: "hash", texto: "Tabla hash", msg: "Cada pantalla tendría que copiar las claves y ordenarlas: Θ(m + n) más Θ(n log n) por venta." }
          ] },
        { tipo: "opciones", titulo: "Claves que escoge otro", columna: true, correcta: "map",
          html: "<p>Un servidor guarda claves enteras que mandan los usuarios, y alguien podría mandar a propósito claves que caigan todas en la misma casilla. El tiempo por operación tiene que quedar acotado.</p>",
          opciones: [
            { op: "map", texto: "map", msg: "Correcto: O(log n) en el peor caso, sin importar qué claves lleguen." },
            { op: "hash", texto: "Tabla hash con m primo", msg: "Un primo protege contra patrones comunes, no contra claves hechas a la medida de m: con todas en una casilla, buscar cuesta Θ(n)." }
          ] },
        { tipo: "opciones", titulo: "Códigos repetidos", columna: true, correcta: "hash",
          html: "<p>Una lista trae un millón de códigos de estudiante y hay que decir cuántos aparecen más de una vez. No se imprime ningún código.</p>",
          opciones: [
            { op: "hash", texto: "Tabla hash", msg: "Correcto: por cada código se busca y, si no estaba, se inserta; Θ(n) en promedio, y el orden no aparece en la salida." },
            { op: "map", texto: "map, porque los repetidos quedan juntos", msg: "En el map los iguales no quedan juntos: una clave aparece una sola vez. Contar con él cuesta O(n log n) por un orden que no se usa." }
          ] }
      ]
    };
  }

  return { tamanos: TAMANOS, mitades: mitades, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
