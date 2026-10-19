/* Ejercicio interactivo: escoger el número de casillas m. */
var EJERCICIO = (function () {
  var PASO = 10;
  var N = 500;
  var TAMANOS = [100, 128, 97];

  function claves(paso, n) {
    var c = [];
    var i = 1;
    while (i <= n) { c.push(paso * i); i = i + 1; }
    return c;
  }

  /* Casillas usadas y lista más larga al insertar las claves con h(k) = k mod m. */
  function reparto(ks, m) {
    var l = [];
    var i = 0;
    while (i < m) { l.push(0); i = i + 1; }
    ks.forEach(function (k) { l[k % m] = l[k % m] + 1; });
    return {
      usadas: l.filter(function (x) { return x > 0; }).length,
      mayor: Math.max.apply(null, l)
    };
  }

  function spec() {
    var ks = claves(PASO, N);
    var r = TAMANOS.map(function (m) { return reparto(ks, m); });
    return {
      contenedor: "tarjetas",
      cierre: "Con el método de la división, una potencia de 10 se queda con los últimos dígitos y una potencia de 2 con los últimos bits: si las claves comparten un factor con m, solo usan una parte de la tabla y las listas crecen en la misma proporción. Un primo lejos de una potencia de 2 no comparte factores con los patrones comunes. Ninguna m resiste un patrón hecho a su medida, como claves que van de m en m.",
      cartas: [
        { tipo: "respuesta", titulo: "Casillas que se usan",
          html: "<p>Se insertan las " + N + " claves " + PASO + ", " + 2 * PASO + ", " + 3 * PASO + ", …, " + PASO * N + ". ¿Cuántas casillas distintas reciben alguna clave con cada m?</p>",
          campos: TAMANOS.map(function (m, i) { return { rotulo: "m = " + m + ":", esperado: String(r[i].usadas), ancho: "3.5rem" }; }),
          bien: "Correcto. Con 100, k mod 100 de un múltiplo de 10 termina en 0: solo las casillas 0, 10, …, 90. Con 128 = 2^7, un múltiplo de 10 es par y solo caen en las 64 casillas pares. Con el primo 97, los múltiplos de 10 recorren todos los residuos.",
          distractores: [
            { valores: [null, "128", null], msg: "Todo múltiplo de 10 es par, y k mod 128 de un número par es par: las casillas impares nunca se usan." },
            { valores: ["100", null, null], msg: "Los dos últimos dígitos de un múltiplo de 10 terminan en 0." }
          ],
          otro: "Piense en qué residuos puede dejar un múltiplo de 10 al dividirlo entre cada m." },
        { tipo: "respuesta", titulo: "La lista más larga",
          html: "<p>Con las mismas " + N + " claves, ¿cuánto mide la lista más larga con m = 100 y con m = 97?</p>",
          campos: [
            { rotulo: "m = 100:", esperado: String(r[0].mayor), ancho: "3.5rem" },
            { rotulo: "m = 97:", esperado: String(r[2].mayor), ancho: "3.5rem" }
          ],
          bien: "Correcto: con 100 las 500 claves se reparten en 10 casillas, " + r[0].mayor + " por casilla; con 97 caben " + r[2].mayor + " a lo sumo, cerca de α = 500/97 ≈ 5,2.",
          otro: "Divida las 500 claves entre las casillas que se usan." },
        { tipo: "opciones", titulo: "Precios", columna: true, correcta: "primo",
          html: "<p>Una tienda guarda unos 2000 productos por precio en pesos, y casi todos los precios son múltiplos de 50. ¿Qué m conviene?</p>",
          opciones: [
            { op: "primo", texto: "m = 2003, un primo", msg: "Correcto. 2003 no comparte factores con 50, así que los múltiplos de 50 se reparten por toda la tabla, y α queda cerca de 1." },
            { op: "dos", texto: "m = 2048, potencia de 2 cercana a 2000", msg: "Todo múltiplo de 50 es par, y k mod 2048 conserva los últimos 11 bits: solo se usarían las 1024 casillas pares y las listas medirían el doble." },
            { op: "diez", texto: "m = 2000, uno por producto", msg: "2000 y 50 comparten el factor 50: k mod 2000 de un múltiplo de 50 es múltiplo de 50, y solo se usan 40 casillas." }
          ] },
        { tipo: "opciones", titulo: "¿Un primo basta?", columna: true, correcta: "patron",
          html: "<p>Con m = 97, ¿qué pasa si las claves son 97, 194, 291, …?</p>",
          opciones: [
            { op: "patron", texto: "Todas caen en la casilla 0", msg: "Correcto. Todas son múltiplos de 97. El primo protege contra los patrones comunes, no contra uno hecho a la medida de m." },
            { op: "bien", texto: "Se reparten bien porque 97 es primo", msg: "Calcule 194 mod 97: es 0, igual que 97 y 291." },
            { op: "vacia", texto: "La tabla las rechaza", msg: "La tabla las guarda todas, en la lista de la casilla 0, que mide n." }
          ] }
      ]
    };
  }

  return { claves: claves, reparto: reparto, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
