/* Ejercicio interactivo: el nivel de un lenguaje y los bordes de los
   enteros. Salidas y avisos salen de programas.js, que guarda las
   corridas reales. */
var EJERCICIO = (function () {
  var P = typeof module !== "undefined" ? require("./programas.js") : Programas;
  var T = typeof module !== "undefined" ? require("./texto.js") : Texto;

  function spec() {
    var s = P.bordes.salida;
    return {
      contenedor: "tarjetas",
      cierre: "<p>Entre más alto el nivel de un lenguaje, menos hay que saber de la máquina para escribirlo; C queda cerca y obliga a pensar en tamaños. Una variable de C es un espacio de tamaño fijo: un <code>int</code> de 32 bits va de −2 147 483 648 a 2 147 483 647 y un <code>unsigned int</code> de 0 a 4 294 967 295. Pasarse no da error ni aviso: el valor da la vuelta. En <code>unsigned</code> esa vuelta la garantiza el estándar; en un entero con signo es comportamiento indefinido. En Python el entero es un objeto que pide más memoria cuando la necesita, y no se desborda.</p>",
      cartas: [
        { tipo: "opciones", titulo: "Un peldaño más abajo", columna: true, correcta: "registros",
          html: "<p>Un programa que suma dos números se escribe en C y después en ensamblador. ¿Qué hay que saber para la segunda versión que en C no hacía falta?</p>",
          opciones: [
            { op: "tipos", texto: "Qué tipos tienen los datos y cuánto miden.", msg: "Eso ya lo exige C: hay que escoger entre int y long sabiendo cuánto cabe en cada uno." },
            { op: "registros", texto: "En qué registros y direcciones viven los datos, y qué instrucciones tiene el procesador.", msg: "Correcto. En ensamblador no hay variables con nombre: hay registros y desplazamientos en la pila, y cada procesador tiene su propio juego de instrucciones." },
            { op: "objetos", texto: "Cómo se agrupan los datos en objetos.", msg: "Los objetos son de C++ o Java, más arriba en la escala. El ensamblador está por debajo de C." },
            { op: "nada", texto: "Nada nuevo: el ensamblador es C con otras palabras.", msg: "Cada peldaño hacia abajo exige más conocimiento de la máquina. El ensamblador depende del procesador; C no." }
          ] },
        { tipo: "respuesta", titulo: "Tres vueltas del contador",
          html: T.codigo(P.bordes.codigo) + "<p>Escriba las cuatro líneas que imprime.</p>",
          campos: [
            { rotulo: "línea 1:", esperado: s[0], ancho: "8rem" },
            { rotulo: "línea 2:", esperado: s[1], ancho: "8rem" },
            { rotulo: "línea 3:", esperado: s[2], ancho: "8rem" },
            { rotulo: "línea 4:", esperado: s[3], ancho: "8rem" }
          ],
          bien: "Correcto. Un unsigned int no tiene negativos: 0 − 1 da la vuelta al máximo, 4 294 967 295. 2 147 483 000 + 1000 se pasa del máximo del int por 353 y cae en el mínimo más 352. Y b++ entrega el valor viejo a printf antes de aumentarlo: se ve 2 147 483 647 y la vuelta aparece en la línea siguiente.",
          distractores: [
            { valores: ["-1", null, null, null], msg: "u es unsigned: no puede guardar −1. Restarle uno a 0 da la vuelta al otro extremo, que es 2³² − 1." },
            { valores: [null, "2147484000", null, null], msg: "2 147 484 000 no cabe en un int: el máximo es 2 147 483 647. La suma da la vuelta y queda negativa." },
            { valores: [null, null, "-2147483648", null], msg: "Con b++ el incremento ocurre después de que printf recibe el valor. La línea 3 muestra el valor viejo; la vuelta se ve en la 4." },
            { valores: [null, null, null, "2147483648"], msg: "Ese número no cabe en un int. Al pasar del máximo, b da la vuelta al mínimo." }
          ],
          otro: "Recuerde los rangos: unsigned int de 0 a 4 294 967 295 e int de −2 147 483 648 a 2 147 483 647. Al pasarse por k, el valor reaparece k − 1 pasos después del otro extremo." },
        { tipo: "opciones", titulo: "Lo que vio -Wall", columna: true, correcta: "formato",
          html: T.codigo(P.formato.codigo) + "<p>Al compilar con <code>gcc -Wall -Wextra</code> aparece un aviso. ¿De qué se queja?</p>",
          opciones: [
            { op: "formato", texto: "De que %d espera un int y recibe un long.", msg: "Correcto. El aviso dice: " + P.formato.aviso[1].replace(/^formato\.c:\d+:\d+: /, "") + ". printf no sabe qué le llegó; lee el formato y saca de la pila los bytes que el formato dice. El compilador sí puede comparar, y sugiere %ld." },
            { op: "cabe", texto: "De que 3000000000 no cabe en un long.", msg: "Un long de 64 bits llega hasta 9 223 372 036 854 775 807: tres mil millones caben de sobra. No cabrían en un int." },
            { op: "nada", texto: "De nada: el programa es correcto y el aviso es por estilo.", msg: "El aviso señala un error real: con %d, printf lee 4 bytes donde hay 8 y lo que imprime no tiene por qué ser el valor guardado." }
          ] },
        { tipo: "respuesta", titulo: "El mismo borde en Python",
          html: T.codigo(P.grande.codigo) + "<p>¿Qué imprime la primera línea?</p>",
          campos: [{ rotulo: "línea 1:", esperado: P.grande.salida[0], ancho: "22rem" }],
          bien: "Correcto. 4 294 967 295 es el máximo de un unsigned int, y en Python sumarle uno da 4 294 967 296, sin vuelta. Su cuadrado, 2⁶⁴, tampoco se desborda: el entero es un objeto de la clase int que crece lo que haga falta, y por eso la segunda línea dice " + P.grande.salida[1] + ".",
          distractores: [
            { valores: ["0 0"], msg: "Esa es la vuelta de un unsigned int de C. En Python el entero no tiene tamaño fijo." },
            { valores: ["4294967296 0"], msg: "La suma está bien. El cuadrado tampoco da la vuelta: Python guarda los 20 dígitos de 2⁶⁴." }
          ],
          otro: "En Python nada da la vuelta: calcule a + 1 y su cuadrado como en papel." },
        { tipo: "opciones", titulo: "Lo que garantiza el estándar", columna: true, correcta: "unsigned",
          html: "<p>De las vueltas que dio el programa de la tarjeta 2, ¿cuál está garantizada por el estándar de C en cualquier máquina?</p>",
          opciones: [
            { op: "unsigned", texto: "La de u, el unsigned int.", msg: "Correcto. Para los enteros sin signo el estándar define la aritmética módulo 2ⁿ: siempre dan la vuelta. Las de a y b, enteros con signo, son comportamiento indefinido: gcc en x86-64 da la vuelta, y otro compilador puede hacer otra cosa." },
            { op: "todas", texto: "Las tres: todos los enteros de C dan la vuelta.", msg: "Es lo que se ve en esta máquina con gcc, y no es una garantía. Desbordar un entero con signo es comportamiento indefinido." },
            { op: "ninguna", texto: "Ninguna: el estándar prohíbe desbordar cualquier entero.", msg: "No lo prohíbe: con unsigned define el resultado, la vuelta. Lo que deja sin definir es el desborde con signo." }
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
