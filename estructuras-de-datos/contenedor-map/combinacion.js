/* Ejercicio interactivo: una combinacion ordenada como clave de un map, y el empate en el maximo. */
var EJERCICIO = (function () {
  /* Cada estudiante escoge tres cursos, numerados de 10 a 99. */
  var ESTUDIANTES = [[42, 17, 88], [88, 42, 17], [17, 55, 88], [55, 17, 88], [30, 42, 61]];

  /* Ordena los tres cursos y los pega, dos cifras por curso. */
  function clave(c) {
    var o = c.slice().sort(function (a, b) { return a - b; });
    var k = 0;
    o.forEach(function (x) { k = k * 100 + x; });
    return k;
  }

  /* Cuenta por clave y suma los estudiantes de las combinaciones con la popularidad mayor. */
  function total() {
    var veces = {};
    ESTUDIANTES.forEach(function (c) {
      var k = clave(c);
      veces[k] = (veces[k] || 0) + 1;
    });
    var mayor = 0;
    var t = 0;
    Object.keys(veces).forEach(function (k) {
      if (veces[k] > mayor) { mayor = veces[k]; t = veces[k]; } else if (veces[k] === mayor) { t = t + veces[k]; }
    });
    return { mayor: mayor, total: t, combinaciones: Object.keys(veces).length };
  }

  function spec() {
    var r = total();
    var lista = ESTUDIANTES.map(function (c, i) { return "estudiante " + (i + 1) + ": " + c.join(" "); }).join("\n");
    return {
      contenedor: "tarjetas",
      cierre: "Ordenar antes de formar la clave hace que el orden en que se escribieron los cursos no importe. Con dos cifras por curso, la clave es un entero; el map cuenta, y un recorrido halla la popularidad mayor y suma a todos los que la alcanzan, también en un empate.",
      cartas: [
        { tipo: "respuesta", titulo: "La clave de cada estudiante",
          html: "<p>Cada estudiante escoge tres cursos distintos, numerados de 10 a 99:</p><pre class=\"fragmento\">" + lista + "</pre><p>La clave se forma ordenando los tres cursos y pegándolos, dos cifras por curso. ¿Cuál es la clave del estudiante 2 y la del estudiante 4?</p>",
          campos: [
            { rotulo: "estudiante 2:", esperado: String(clave(ESTUDIANTES[1])), ancho: "6rem" },
            { rotulo: "estudiante 4:", esperado: String(clave(ESTUDIANTES[3])), ancho: "6rem" }
          ],
          bien: "Correcto: 17 42 88 da 174288, la misma clave del estudiante 1, y 17 55 88 da 175588, la del estudiante 3.",
          distractores: [
            { valores: ["884217", null], msg: "Sin ordenar, el estudiante 2 tendría una clave distinta a la del 1 aunque escogió los mismos cursos." },
            { valores: [null, "551788"], msg: "Primero se ordenan los cursos: 17, 55, 88." }
          ],
          otro: "Ordene los tres números de menor a mayor y escríbalos seguidos." },
        { tipo: "respuesta", titulo: "Cuántos ganan",
          html: "<p>Con las claves contadas en un <code>map&lt;int, int&gt;</code>, ¿cuál es la popularidad mayor y cuántos estudiantes tienen una combinación con esa popularidad?</p>",
          campos: [
            { rotulo: "popularidad mayor:", esperado: String(r.mayor), ancho: "3rem" },
            { rotulo: "estudiantes:", esperado: String(r.total), ancho: "3rem" }
          ],
          bien: "Correcto. 174288 y 175588 tienen popularidad 2 cada una: empatan en el máximo, y suman 4 estudiantes.",
          distractores: [
            { valores: [null, "2"], msg: "Dos son las combinaciones empatadas, pero se piden los estudiantes: cada combinación aporta 2." },
            { valores: [null, "5"], msg: "El estudiante 5 tiene una combinación de popularidad 1, que no es la mayor." }
          ],
          otro: "Cuente cuántos estudiantes tiene cada clave." },
        { tipo: "opciones", titulo: "Por qué cabe en un int", columna: true, correcta: "cifras",
          html: "<p>Aquí la clave cabe en un <code>int</code>. ¿Por qué con cinco cursos de tres cifras, como en UVa 11286, ya no?</p>",
          opciones: [
            { op: "cifras", texto: "Son 15 cifras, y un int llega hasta 2 147 483 647, que tiene 10", msg: "Correcto: hace falta long long, que llega a unas 19 cifras." },
            { op: "orden", texto: "Porque al ordenar los cursos la clave crece", msg: "Ordenar no cambia cuántas cifras tiene la clave, solo en qué orden van." },
            { op: "map", texto: "Porque un map no acepta claves int tan grandes", msg: "El map acepta cualquier tipo que se compare con &lt;. El límite es del int." }
          ] }
      ]
    };
  }

  return { estudiantes: ESTUDIANTES, clave: clave, total: total, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
