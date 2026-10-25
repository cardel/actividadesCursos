/* Ejercicio interactivo: las mismas quince claves en cuatro ordenes de
   insercion; la altura y las comparaciones dependen del orden. */
var EJERCICIO = (function () {
  var A = typeof module !== "undefined" ? require("./arbol.js") : ArbolBB;

  function decreciente() {
    var r = [];
    var k = 75;
    while (k >= 5) { r.push(k); k = k - 5; }
    return r;
  }

  var ORDENES = {
    dec: decreciente(),
    zig: [5, 75, 10, 70, 15, 65, 20, 60, 25, 55, 30, 50, 35, 45, 40],
    niv: [40, 20, 60, 10, 30, 50, 70, 5, 15, 25, 35, 45, 55, 65, 75],
    mez: [35, 60, 15, 70, 25, 45, 5, 75, 50, 10, 65, 20, 40, 55, 30]
  };

  function medir(nombre) {
    var r = A.armar(ORDENES[nombre]);
    return { altura: A.altura(r), comparaciones: A.comparacionesAlArmar(ORDENES[nombre]), arbol: r };
  }

  function piso2(n) {
    var h = 0;
    while (Math.pow(2, h + 1) <= n) { h = h + 1; }
    return h;
  }

  function spec() {
    var dec = medir("dec"), zig = medir("zig"), niv = medir("niv"), mez = medir("mez");
    return {
      contenedor: "tarjetas",
      cierre: "<p>Las quince claves son las mismas y el inorden también; la forma la decide el orden de llegada. En orden decreciente o en zigzag, cada clave nueva queda por debajo de todas las anteriores y el árbol es una lista de altura n − 1: las n inserciones cuestan 0 + 1 + ⋯ + (n − 1) = Θ(n²) comparaciones. Por niveles, cada mitad queda a un lado y la altura es ⌊log₂ n⌋, la mínima. Un orden revuelto quedó a un nivel del mínimo. Como ⌊log₂ n⌋ ≤ h ≤ n − 1, el mismo O(h) de buscar, insertar y borrar va de Θ(log n) a Θ(n).</p>",
      cartas: [
        { tipo: "respuesta", titulo: "En orden decreciente",
          html: "<p>Se insertan en un ABB vacío las claves <b>" + ORDENES.dec.join(" ") + "</b>. ¿Qué altura tiene el árbol?</p>",
          campos: [{ rotulo: "altura:", esperado: String(dec.altura), ancho: "3rem" }],
          bien: "Correcto: cada clave es menor que todas las anteriores y baja siempre por la izquierda. Quince nodos en una sola fila: altura 14.",
          distractores: [
            { valores: ["3"], msg: "Esa sería la altura con las mitades bien repartidas. Aquí cada clave nueva es la menor hasta ese momento: siempre a la izquierda." },
            { valores: ["15"], msg: "Son 15 nodos en fila, pero la altura cuenta aristas: 14." }
          ],
          otro: "Inserte las tres primeras y mire hacia dónde crece el árbol." },
        { tipo: "respuesta", titulo: "En zigzag",
          html: "<p>Ahora las mismas claves en este orden: <b>" + ORDENES.zig.join(" ") + "</b>. No están ordenadas. ¿Qué altura tiene el árbol?</p>",
          campos: [{ rotulo: "altura:", esperado: String(zig.altura), ancho: "3rem" }],
          bien: "Correcto: cada clave cae entre las dos anteriores y queda debajo de la última. El árbol zigzaguea: 5, 75, 10, 70, ... y vuelve a ser una lista de altura 14.",
          distractores: [
            { valores: ["7"], msg: "No es la mitad: el 10 cuelga del 75, el 70 del 10, el 15 del 70... Cada clave nueva baja por todo el camino anterior." },
            { valores: ["3"], msg: "Que no estén ordenadas no basta. Dibuje las cinco primeras: 5, luego 75 a su derecha, luego 10 a la izquierda del 75, luego 70 a la derecha del 10." }
          ],
          otro: "Dibuje las cinco primeras inserciones y mire debajo de quién queda cada clave." },
        { tipo: "respuesta", titulo: "Por niveles",
          html: "<p>Ahora: <b>" + ORDENES.niv.join(" ") + "</b>. ¿Qué altura tiene? ¿Cuál es la menor altura posible de un árbol binario con 15 nodos?</p>",
          campos: [
            { rotulo: "altura:", esperado: String(niv.altura), ancho: "3rem" },
            { rotulo: "mínima posible:", esperado: String(piso2(15)), ancho: "3rem" }
          ],
          bien: "Correcto: el 40 deja siete claves a cada lado, el 20 y el 60 tres a cada lado, y así hasta las hojas. Altura 3 = ⌊log₂ 15⌋, la mínima: en los niveles 0 a 3 caben 1 + 2 + 4 + 8 = 15 nodos.",
          distractores: [
            { valores: ["4", null], msg: "La altura cuenta aristas: el camino 40, 20, 10, 5 tiene cuatro nodos y tres aristas." },
            { valores: [null, "4"], msg: "En los niveles 0 a 3 caben 1 + 2 + 4 + 8 = 15 nodos, así que con altura 3 alcanza." }
          ],
          otro: "La menor altura sale de llenar cada nivel antes de empezar el siguiente." },
        { tipo: "respuesta", titulo: "Lo que cuesta armar cada árbol",
          html: "<p>Cuente las comparaciones de todas las inserciones: la clave número i compara con cada nodo del camino hasta su lugar. ¿Cuántas en total para el orden decreciente y cuántas para el orden por niveles?</p>",
          campos: [
            { rotulo: "decreciente:", esperado: String(dec.comparaciones), ancho: "4rem" },
            { rotulo: "por niveles:", esperado: String(niv.comparaciones), ancho: "4rem" }
          ],
          bien: "Correcto: en la lista, la clave i compara con las i − 1 anteriores: 0 + 1 + ⋯ + 14 = 105. Por niveles: 0 para la raíz, 1 para cada una de las 2 del nivel 1, 2 para las 4 del nivel 2 y 3 para las 8 del nivel 3: 2 + 8 + 24 = 34.",
          distractores: [
            { valores: ["120", null], msg: "La primera clave no compara con nadie y la última con 14: 0 + 1 + ⋯ + 14 = 105. 120 sería sumar hasta 15." },
            { valores: [null, "45"], msg: "Cada clave compara con su profundidad, no con 3: las del nivel 1 hacen 1 comparación, las del nivel 2 hacen 2." }
          ],
          otro: "Cada clave compara con tantos nodos como su profundidad final. Sume las profundidades." },
        { tipo: "respuesta", titulo: "Un orden revuelto",
          html: "<p>Un último orden, sin patrón a la vista: <b>" + ORDENES.mez.join(" ") + "</b>. ¿Qué altura tiene y cuántas comparaciones cuesta armarlo?</p>",
          campos: [
            { rotulo: "altura:", esperado: String(mez.altura), ancho: "3rem" },
            { rotulo: "comparaciones:", esperado: String(mez.comparaciones), ancho: "4rem" }
          ],
          bien: "Correcto: altura " + mez.altura + " y " + mez.comparaciones + " comparaciones, una más que el árbol por niveles. Con claves en desorden la altura queda cerca de la mínima.",
          distractores: [
            { valores: ["3", null], msg: "Revise dónde cae el 55: 55 > 35, 55 < 60, 55 > 45 y 55 > 50. Queda debajo del 50, en el nivel 4." }
          ],
          otro: "Dibújelo clave por clave y sume la profundidad de cada una." },
        { tipo: "pasos", titulo: "Los cuatro árboles",
          html: "<p>Para revisar: el árbol que deja cada orden.</p>",
          boton: "Siguiente árbol",
          pasos: [
            { texto: "decreciente: altura " + dec.altura, html: A.svg(dec.arbol, { escala: 0.55 }) },
            { texto: "zigzag: altura " + zig.altura, html: A.svg(zig.arbol, { escala: 0.55 }) },
            { texto: "por niveles: altura " + niv.altura, html: A.svg(niv.arbol) },
            { texto: "revuelto: altura " + mez.altura, html: A.svg(mez.arbol) }
          ] },
        { tipo: "respuesta", titulo: "Entre qué valores queda h",
          html: "<p>Todo árbol binario con n nodos cumple ⌊log₂ n⌋ ≤ h ≤ n − 1. Escriba las dos cotas para n = 100 y para n = 50 000.</p>",
          campos: [
            { rotulo: "n = 100: de", esperado: String(piso2(100)), ancho: "3.5rem" },
            { rotulo: "a", esperado: "99", ancho: "4rem" },
            { rotulo: "n = 50 000: de", esperado: String(piso2(50000)), ancho: "3.5rem" },
            { rotulo: "a", esperado: "49999", ancho: "5rem" }
          ],
          bien: "Correcto: 2⁶ = 64 ≤ 100 < 128 = 2⁷ y 2¹⁵ = 32 768 ≤ 50 000 < 65 536 = 2¹⁶. Con 50 000 claves, buscar compara a lo sumo 16 veces en el mejor árbol y 50 000 en el peor.",
          distractores: [
            { valores: ["7", null, null, null], msg: "log₂ 100 ≈ 6,64; el piso es 6. Con 7 niveles completos (0 a 6) caben 127 nodos, y 100 ya caben ahí." },
            { valores: [null, "100", null, null], msg: "Una lista de 100 nodos tiene 99 aristas: h = n − 1." }
          ],
          otro: "Busque la mayor potencia de 2 que no pasa de n; su exponente es ⌊log₂ n⌋. Escriba los números sin separador de miles." }
      ]
    };
  }

  return { ordenes: ORDENES, medir: medir, piso2: piso2, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
