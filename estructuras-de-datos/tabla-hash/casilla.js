/* Ejercicio interactivo: la casilla de cada clave con el método de la división. */
var EJERCICIO = (function () {
  var M = 17;
  var CLAVES = [38, 71, 20, 104, 55, 9];

  function h(k, m) {
    return k % m;
  }

  function casillas() {
    return CLAVES.map(function (k) { return h(k, M); });
  }

  /* Pares de claves que comparten casilla, de la casilla más baja a la más alta. */
  function choques() {
    var pares = [];
    var i = 0;
    while (i < CLAVES.length) {
      var j = i + 1;
      while (j < CLAVES.length) {
        if (h(CLAVES[i], M) === h(CLAVES[j], M)) { pares.push([CLAVES[i], CLAVES[j]]); }
        j = j + 1;
      }
      i = i + 1;
    }
    pares.sort(function (a, b) { return h(a[0], M) - h(b[0], M); });
    return pares;
  }

  function spec() {
    var c = casillas();
    var p = choques();
    return {
      contenedor: "tarjetas",
      cierre: "Con el método de la división, h(k) = k mod m: una división por clave, Θ(1). Dos claves chocan cuando su diferencia es múltiplo de m. Con m = 1000 la casilla son los tres últimos dígitos, y todo lo que esté antes no cuenta. Si el universo tiene más claves que la tabla casillas, ninguna función evita los choques.",
      cartas: [
        { tipo: "respuesta", titulo: "Cuatro casillas con m = " + M,
          html: "<p>La tabla tiene m = " + M + " casillas y h(k) = k mod " + M + ". Calcule la casilla de las primeras cuatro claves.</p>",
          campos: CLAVES.slice(0, 4).map(function (k, i) {
            return { rotulo: "h(" + k + ") =", esperado: String(c[i]), ancho: "3.5rem" };
          }),
          bien: "Correcto: " + CLAVES.slice(0, 4).map(function (k, i) { return k + " → " + c[i]; }).join(", ") + ". Por ejemplo, 104 = 6 · 17 + 2.",
          distractores: [
            { valores: ["2", null, null, null], msg: "38 = 2 · 17 + 4: el residuo es 4, no el cociente 2." },
            { valores: [null, "4", null, null], msg: "71 = 4 · 17 + 3: el residuo es 3, no el cociente." }
          ],
          otro: "Escriba cada clave como q · 17 + r con 0 ≤ r < 17; la casilla es r." },
        { tipo: "respuesta", titulo: "Los choques",
          html: "<p>Ahora con las seis claves: " + CLAVES.join(", ") + ". Hay dos pares que chocan. Escriba primero el par de la casilla más baja, cada par de menor a mayor.</p>",
          campos: [
            { rotulo: "par 1:", esperado: p[0].slice().sort(function (a, b) { return a - b; }).join(" "), pista: "a b", ancho: "6rem" },
            { rotulo: "par 2:", esperado: p[1].slice().sort(function (a, b) { return a - b; }).join(" "), pista: "a b", ancho: "6rem" }
          ],
          bien: "Correcto: 20 y 71 van a la casilla 3, y 38 y 55 a la 4. En los dos pares la diferencia es 51 o 17, múltiplos de 17. El 9 queda solo en la casilla 9.",
          distractores: [
            { valores: ["38 55", "20 71"], msg: "Son esos dos pares, pero el de 20 y 71 está en la casilla 3, más baja que la 4." }
          ],
          otro: "Calcule h de las seis claves y busque casillas repetidas." },
        { tipo: "opciones", titulo: "Mil casillas", columna: true, correcta: "ultimos",
          html: "<p>Una tabla de m = 1000 casillas guarda códigos de 8 dígitos. Los códigos 20261547 y 20251547 van a la misma casilla. ¿Por qué?</p>",
          opciones: [
            { op: "ultimos", texto: "k mod 1000 son los tres últimos dígitos, y los dos terminan en 547", msg: "Correcto. Con una potencia de 10, el residuo ignora todo lo que está antes de los últimos dígitos, y los dos códigos solo difieren en el año." },
            { op: "primo", texto: "Porque 1000 es par", msg: "Que sea par no basta para explicarlo: lo que pasa es que 1000 es potencia de 10 y el residuo son los tres últimos dígitos." },
            { op: "azar", texto: "Es mala suerte: dos claves cualesquiera chocan con probabilidad 1/1000", msg: "Aquí no hay azar. Todo código que termine en 547 cae en la casilla 547." }
          ] },
        { tipo: "opciones", titulo: "Sin choques", columna: true, correcta: "no",
          html: "<p>¿Existe una función h que lleve todos los códigos de 8 dígitos a una tabla de 1000 casillas sin que dos códigos distintos choquen?</p>",
          opciones: [
            { op: "no", texto: "No: hay 10<sup>8</sup> códigos y 1000 casillas", msg: "Correcto. Al menos una casilla recibe 10^8 / 1000 = 10^5 códigos posibles. Lo que se puede lograr es que los códigos que de verdad llegan se repartan bien." },
            { op: "primo", texto: "Sí, si m es primo", msg: "Un primo reparte mejor los patrones comunes, pero no hace caber 10^8 códigos en 1000 casillas sin compartir." },
            { op: "buena", texto: "Sí, con una función suficientemente buena", msg: "Ninguna función lo logra: con más claves posibles que casillas, alguna casilla recibe dos." }
          ] }
      ]
    };
  }

  return { m: M, claves: CLAVES, h: h, casillas: casillas, choques: choques, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
