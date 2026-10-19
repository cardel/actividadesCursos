/* Ejercicio interactivo: el residuo de C++ con claves negativas. */
var EJERCICIO = (function () {
  var M = 6;

  /* El operador % de C++ trunca hacia cero, igual que el de JavaScript. */
  function residuoC(k, m) {
    return k % m;
  }

  function casilla(k, m) {
    return ((k % m) + m) % m;
  }

  var CLAVES = [-13, -18, 13, 0];

  function spec() {
    var crudos = CLAVES.map(function (k) { return residuoC(k, M); });
    var buenas = CLAVES.map(function (k) { return casilla(k, M); });
    return {
      contenedor: "tarjetas",
      cierre: "En C++, k % m conserva el signo de k: con k negativo el resultado está entre −(m − 1) y 0, y usarlo como índice escribe fuera del arreglo. ((k % m) + m) % m lo corre al rango 0 a m − 1. El segundo % hace falta para los k que ya daban 0 o un residuo positivo, que sin él quedarían en m o más.",
      cartas: [
        { tipo: "respuesta", titulo: "Lo que da <code>k % " + M + "</code>",
          html: "<p>¿Qué imprime <code>printf(\"%d\", k % " + M + ")</code> para cada k?</p>",
          campos: CLAVES.map(function (k, i) { return { rotulo: "k = " + k + ":", esperado: String(crudos[i]), ancho: "3.5rem" }; }),
          bien: "Correcto: " + CLAVES.map(function (k, i) { return k + " % 6 = " + crudos[i]; }).join(", ") + ". La división trunca hacia cero: −13 / 6 = −2 y −13 − (−2 · 6) = −1.",
          distractores: [
            { valores: ["5", null, null, null], msg: "En matemáticas −13 mod 6 = 5, pero el % de C++ conserva el signo del dividendo: da −1." }
          ],
          otro: "En C++, k % m = k − (k / m) · m, y k / m trunca hacia cero." },
        { tipo: "respuesta", titulo: "La casilla corregida",
          html: "<p>Con <code>((k % " + M + ") + " + M + ") % " + M + "</code>, ¿qué casilla recibe cada k?</p>",
          campos: CLAVES.map(function (k, i) { return { rotulo: "k = " + k + ":", esperado: String(buenas[i]), ancho: "3.5rem" }; }),
          bien: "Correcto: " + CLAVES.map(function (k, i) { return k + " → " + buenas[i]; }).join(", ") + ". Todas quedan entre 0 y 5.",
          distractores: [
            { valores: [null, "6", null, null], msg: "−18 % 6 = 0; 0 + 6 = 6, y el segundo % 6 lo deja en 0." },
            { valores: [null, null, "7", null], msg: "13 % 6 = 1; 1 + 6 = 7, y 7 % 6 = 1. El segundo % es el que lo devuelve al rango." }
          ],
          otro: "Calcule primero k % 6, súmele 6 y tome otra vez el residuo." },
        { tipo: "opciones", titulo: "Sin el segundo <code>%</code>", columna: true, correcta: "fuera",
          html: "<p>Un estudiante escribe la casilla como <code>(k % m) + m</code>, sin el segundo <code>%</code>. ¿Qué pasa con k = 13 y m = 6?</p>",
          opciones: [
            { op: "fuera", texto: "Da 7: una casilla que no existe en un arreglo de 6", msg: "Correcto. Sumar m solo sirve para los negativos; para los demás hay que volver a reducir." },
            { op: "bien", texto: "Da 1, la casilla correcta", msg: "13 % 6 = 1, y 1 + 6 = 7. Sin el segundo % el resultado se sale." },
            { op: "neg", texto: "Da −5", msg: "13 es positivo: 13 % 6 = 1, y 1 + 6 = 7." }
          ] },
        { tipo: "opciones", titulo: "Claves que no chocan", columna: true, correcta: "comparar",
          html: "<p>Con m = 6, las claves −18, 0 y 18 caen en la casilla 0. ¿Cómo distingue la tabla cuál es cuál?</p>",
          opciones: [
            { op: "comparar", texto: "Cada nodo guarda su clave, y la búsqueda la compara", msg: "Correcto. Compartir casilla no las hace iguales: la lista de la casilla 0 tiene tres nodos distintos, y buscar compara la clave de cada uno." },
            { op: "una", texto: "No las distingue: la casilla guarda solo una", msg: "Con encadenamiento la casilla guarda una lista entera; las tres caben." },
            { op: "signo", texto: "Por el signo de k % m", msg: "Después de corregir, las tres dan 0. Lo que las distingue es la clave guardada en el nodo." }
          ] }
      ]
    };
  }

  return { residuoC: residuoC, casilla: casilla, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
