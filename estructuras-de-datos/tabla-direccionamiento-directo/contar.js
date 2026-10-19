/* Ejercicio interactivo: una tabla de contadores y lo que ocupa una tabla. */
var EJERCICIO = (function () {
  var M = 21;                                   // puntajes de 0 a 20
  var PUNTAJES = [12, 7, 20, 12, 0, 7, 12, 15];
  var ENTERO = 4;                               // bytes de un int
  var PUNTERO = 8;                              // bytes de un puntero

  function contar(puntajes) {
    var cuenta = [];
    var k = 0;
    while (k < M) { cuenta.push(0); k = k + 1; }
    puntajes.forEach(function (p) { cuenta[p] = cuenta[p] + 1; });
    return cuenta;
  }

  /* Lo que imprime el recorrido: puntaje y cuenta de las casillas con algo. */
  function impresos(cuenta) {
    var r = [];
    cuenta.forEach(function (c, k) { if (c > 0) { r.push(k + ": " + c); } });
    return r;
  }

  function miles(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }

  function spec() {
    var cuenta = contar(PUNTAJES);
    var filas = [];
    var parcial = [];
    var k = 0;
    while (k < M) { parcial.push(0); k = k + 1; }
    PUNTAJES.forEach(function (p, i) {
      parcial[p] = parcial[p] + 1;
      filas.push([String(i), String(p), "cuenta[" + p + "] = " + parcial[p]]);
    });
    var edades = 121 * ENTERO;
    var cedulas = 1000000 * PUNTERO;
    return {
      contenedor: "tarjetas",
      cierre: "Cuando el elemento es solo su clave, la casilla guarda cuántas veces apareció: contar cuesta Θ(1) por dato y Θ(n) los n. Iniciar y recorrer la tabla cuestan Θ(m), las casillas que haya, llenas o no; el total es Θ(n + m). Lo que ocupa la tabla depende del universo y del tamaño de cada casilla, no de cuántos datos llegan.",
      cartas: [
        { tipo: "respuesta", titulo: "Tres casillas",
          html: "<p>Los puntajes de un quiz van de 0 a 20 y se cuentan con <code>int cuenta[21]</code>, todo en 0 al comenzar. Llegan:</p><pre class=\"fragmento\">" + PUNTAJES.join(" ") + "</pre><p>Al terminar, ¿cuánto valen <code>cuenta[12]</code>, <code>cuenta[7]</code> y <code>cuenta[3]</code>?</p>",
          campos: [{ rotulo: "cuenta[12] =", esperado: String(cuenta[12]) }, { rotulo: "cuenta[7] =", esperado: String(cuenta[7]) }, { rotulo: "cuenta[3] =", esperado: String(cuenta[3]) }],
          bien: "Correcto: " + cuenta[12] + ", " + cuenta[7] + " y " + cuenta[3] + ". Nadie sacó 3, y su casilla se quedó en el 0 con que empezó.",
          distractores: [
            { valores: [null, null, "1"], msg: "La casilla 3 cuenta los puntajes iguales a 3, no la posición 3 de la entrada." }
          ],
          otro: "Cada puntaje p suma uno en la casilla p." },
        { tipo: "tabla", titulo: "Paso a paso",
          cabecera: ["i", "puntaje", "después"],
          filas: filas,
          nota: "Cada fila lee y escribe una casilla: Θ(1). Las demás no se tocan." },
        { tipo: "respuesta", titulo: "El recorrido",
          html: "<p>Para imprimir, un ciclo pasa por las casillas de la 0 a la 20 y escribe las que no están en 0. ¿Cuántas casillas mira el ciclo, y cuántas líneas imprime?</p>",
          campos: [{ rotulo: "mira:", esperado: String(M) }, { rotulo: "imprime:", esperado: String(impresos(cuenta).length) }],
          bien: "Correcto: mira las " + M + " e imprime " + impresos(cuenta).length + ": " + impresos(cuenta).join(", ") + ". El recorrido cuesta Θ(m) aunque solo haya " + impresos(cuenta).length + " puntajes distintos.",
          distractores: [
            { valores: [String(PUNTAJES.length), null], msg: "El ciclo recorre la tabla, no la entrada: pasa por las " + M + " casillas." },
            { valores: [null, String(PUNTAJES.length)], msg: "Se imprime una línea por puntaje distinto, con su cuenta." }
          ],
          otro: "El ciclo va de 0 a 20. Las líneas son los puntajes que aparecieron al menos una vez." },
        { tipo: "respuesta", titulo: "Lo que ocupa una tabla de contadores",
          html: "<p>Un consultorio cuenta pacientes por edad, de 0 a 120 años, con un arreglo de <code>int</code> de " + ENTERO + " bytes. ¿Cuántos bytes ocupa la tabla?</p>",
          campos: [{ rotulo: "bytes:", esperado: String(edades) }],
          bien: "Correcto: 121 casillas de " + ENTERO + " bytes, " + edades + " bytes, con diez pacientes o con diez mil.",
          distractores: [
            { valores: ["480"], msg: "De 0 a 120 hay 121 edades, no 120." }
          ],
          otro: "Cuente las edades posibles y multiplique por el tamaño de una casilla." },
        { tipo: "respuesta", titulo: "Lo que ocupa una tabla de punteros",
          html: "<p>Una tabla de punteros de " + PUNTERO + " bytes tiene una casilla por cada número de 0 a 999 999. ¿Cuántos bytes ocupan solo los punteros?</p>",
          campos: [{ rotulo: "bytes:", esperado: String(cedulas), ancho: "9rem" }],
          bien: "Correcto: " + miles(cedulas) + " bytes, unos 8 MB, antes de guardar el primer registro.",
          distractores: [
            { valores: ["7999992"], msg: "De 0 a 999 999 hay un millón de números." },
            { valores: ["1000000"], msg: "Ese es el número de casillas. Cada una ocupa " + PUNTERO + " bytes." }
          ],
          otro: "Un millón de casillas, cada una un puntero." }
      ]
    };
  }

  return { m: M, puntajes: PUNTAJES, contar: contar, impresos: impresos, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
