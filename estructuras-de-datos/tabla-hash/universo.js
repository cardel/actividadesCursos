/* Ejercicio interactivo: pocas claves en un universo enorme.
   Cuánto ocupa una tabla directa, qué parte se usa y qué cuesta la lista. */
var EJERCICIO = (function () {
  var DIGITOS = 7;          // teléfonos fijos de 7 dígitos
  var BYTES_CASILLA = 4;    // cada casilla guarda un int
  var CLAVES = 300;         // números que de verdad se guardan
  var CONSULTAS = 2000;     // consultas que fallan

  function potencia(b, e) {
    var r = 1;
    var i = 0;
    while (i < e) { r = r * b; i = i + 1; }
    return r;
  }

  /* Tamaño de la tabla directa en MB (10^6 bytes). */
  function megas() {
    return potencia(10, DIGITOS) * BYTES_CASILLA / potencia(10, 6);
  }

  /* Porcentaje de casillas usadas. */
  function porcentajeUsado() {
    return CLAVES * 100 / potencia(10, DIGITOS);
  }

  /* Comparaciones de la lista enlazada si ninguna consulta está. */
  function comparacionesLista() {
    return CONSULTAS * CLAVES;
  }

  function spec() {
    var mb = megas();
    var comp = comparacionesLista();
    return {
      contenedor: "tarjetas",
      cierre: "La tabla directa paga una casilla por cada clave posible: con 7 dígitos son 10<sup>7</sup> casillas aunque se guarden 300 números, y casi todas quedan vacías. La lista enlazada ocupa solo lo que guarda, pero cada consulta que falla recorre todos los nodos. La tabla hash busca el punto medio: una tabla del orden de n casillas y listas cortas.",
      cartas: [
        { tipo: "respuesta", titulo: "Cuánto ocupa la tabla directa",
          html: "<p>Una empresa guarda teléfonos fijos de " + DIGITOS + " dígitos en una tabla de direccionamiento directo: una casilla <code>int</code> de " + BYTES_CASILLA + " bytes por cada número posible, de 0000000 a 9999999. ¿Cuántos megabytes (10<sup>6</sup> bytes) ocupa la tabla?</p>",
          campos: [{ rotulo: "MB:", esperado: String(mb), pista: "?" }],
          bien: "Correcto: 10^7 casillas por 4 bytes son 4 · 10^7 bytes, " + mb + " MB, sin importar cuántos números se guarden.",
          distractores: [
            { valores: ["10"], msg: "Son 10^7 casillas, 10 millones, pero cada una ocupa 4 bytes." },
            { valores: ["4"], msg: "Revise la potencia: 7 dígitos dan 10^7 números posibles, no 10^6." },
            { valores: ["0.0012"], msg: "Eso sería guardar solo los 300 números. La tabla directa reserva una casilla por número posible." }
          ],
          otro: "Cuente cuántos números de 7 dígitos hay y multiplique por los bytes de cada casilla." },
        { tipo: "opciones", titulo: "Qué parte se usa", columna: true, correcta: "poco",
          html: "<p>En esa tabla se guardan " + CLAVES + " teléfonos. ¿Qué porcentaje de las casillas tiene un número guardado?</p>",
          opciones: [
            { op: "poco", texto: porcentajeUsado().toFixed(3).replace(".", ",") + " %", msg: "Correcto: 300 de 10 millones. El resto de los " + mb + " MB está reservado y vacío." },
            { op: "tres", texto: "3 %", msg: "300 de 10^7 es 3 · 10^-5, que en porcentaje es 0,003 %, mil veces menos." },
            { op: "todo", texto: "100 %: cada casilla guarda algo", msg: "Cada casilla guarda algo, pero solo 300 guardan un teléfono; las demás marcan que el número no está." }
          ] },
        { tipo: "respuesta", titulo: "La lista enlazada",
          html: "<p>Los " + CLAVES + " teléfonos se guardan en una lista enlazada. Llegan " + CONSULTAS + " consultas y ninguno de los números consultados está. ¿Cuántas comparaciones hace el programa en total?</p>",
          campos: [{ rotulo: "comparaciones:", esperado: String(comp), pista: "?", ancho: "9rem" }],
          bien: "Correcto: cada consulta que falla recorre los 300 nodos, Θ(n), y son 2000 consultas: " + comp + ".",
          distractores: [
            { valores: ["2000"], msg: "Eso sería una comparación por consulta, lo que haría la tabla directa. La lista compara con cada nodo." },
            { valores: ["300"], msg: "Eso es una sola consulta. Son 2000." }
          ],
          otro: "Una consulta que falla compara con todos los nodos; multiplique por el número de consultas." },
        { tipo: "opciones", titulo: "Cuándo sí sirve la tabla directa", columna: true, correcta: "pisos",
          html: "<p>¿En cuál de estos programas la tabla de direccionamiento directo es una buena elección?</p>",
          opciones: [
            { op: "pisos", texto: "Un edificio de 40 pisos guarda cuántas personas hay en cada piso, numerados de 0 a 39", msg: "Correcto. El universo tiene 40 claves y casi todas se usan: 40 casillas, buscar en Θ(1)." },
            { op: "cedulas", texto: "Una tienda guarda los 500 clientes frecuentes por número de cédula", msg: "Las cédulas tienen hasta 10 dígitos: la tabla tendría 10^10 casillas para 500 clientes." },
            { op: "palabras", texto: "Un corrector guarda 20 000 palabras del español", msg: "Una palabra no es un índice de arreglo. Habría que convertirla en número, y el universo de cadenas es enorme." }
          ] }
      ]
    };
  }

  return { megas: megas, porcentajeUsado: porcentajeUsado, comparacionesLista: comparacionesLista, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
