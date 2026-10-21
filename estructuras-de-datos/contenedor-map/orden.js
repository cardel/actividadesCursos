/* Ejercicio interactivo: las mismas claves en una tabla hash y en un map. */
var EJERCICIO = (function () {
  var M = 5;
  var CLAVES = [23, 9, 41, 16, 30];

  /* Tabla con encadenamiento: cada clave se cuelga al frente de la lista de k mod M. */
  function construir() {
    var t = [];
    var i = 0;
    while (i < M) { t.push([]); i = i + 1; }
    CLAVES.forEach(function (k) { t[k % M].unshift(k); });
    return t;
  }

  /* Orden de imprimir(): casilla por casilla, cada lista desde la cabeza. */
  function recorridoHash() {
    var r = [];
    construir().forEach(function (l) { l.forEach(function (k) { r.push(k); }); });
    return r;
  }

  /* Orden del iterador de un map: claves de menor a mayor. */
  function recorridoMap() {
    return CLAVES.slice().sort(function (a, b) { return a - b; });
  }

  function dibujar(t) {
    return t.map(function (l, i) {
      return i + ": " + (l.length === 0 ? "NULL" : l.join(" → ") + " → NULL");
    }).join("\n");
  }

  function spec() {
    var t = construir();
    var h = recorridoHash();
    var m = recorridoMap();
    return {
      contenedor: "tarjetas",
      cierre: "La tabla hash recorre en el orden de las casillas, y dentro de cada casilla en el orden de su lista: nada de eso sigue el orden de las claves. El map guarda las claves ordenadas desde que entran, así que su iterador las entrega de menor a mayor sin ordenar al final.",
      cartas: [
        { tipo: "respuesta", titulo: "La tabla hash, casilla por casilla",
          html: "<p>Con m = " + M + " se insertan, colgando al frente, " + CLAVES.join(", ") + ".</p><pre class=\"fragmento\">" + dibujar(t) + "</pre><p>¿En qué orden imprime las claves un recorrido que va de la casilla 0 a la 4?</p>",
          campos: [{ rotulo: "recorrido:", esperado: h.join(" "), pista: "a b c d e", ancho: "11rem" }],
          bien: "Correcto. La casilla 0 da 30, la 1 da 16 y 41 (16 entró después y quedó al frente), la 3 da 23 y la 4 da 9.",
          distractores: [
            { valores: [m.join(" ")], msg: "Ese es el orden de las claves, no el de la tabla: el recorrido sigue las casillas." },
            { valores: ["30 41 16 23 9"], msg: "En la casilla 1, 16 entró después de 41 y se colgó al frente: la lista es 16 → 41." },
            { valores: [CLAVES.join(" ")], msg: "Ese es el orden de llegada. La tabla no lo guarda: cada clave va a la casilla k mod 5." }
          ],
          otro: "Recorra las casillas de la 0 a la 4 y, en cada una, la lista desde la cabeza." },
        { tipo: "respuesta", titulo: "El map, con su iterador",
          html: "<p>Las mismas cinco claves entran a un <code>map&lt;int, int&gt;</code> con <code>m[k] = 1</code>. ¿En qué orden las imprime un recorrido de <code>begin()</code> a <code>end()</code>?</p>",
          campos: [{ rotulo: "recorrido:", esperado: m.join(" "), pista: "a b c d e", ancho: "11rem" }],
          bien: "Correcto: el map entrega las claves de menor a mayor, sin importar el orden en que llegaron.",
          distractores: [
            { valores: [CLAVES.join(" ")], msg: "El map no recuerda el orden de llegada: cada clave queda en su lugar según su valor." },
            { valores: [h.join(" ")], msg: "Ese es el recorrido de la tabla hash. El map no usa casillas." }
          ],
          otro: "Ordene las cinco claves de menor a mayor." },
        { tipo: "opciones", titulo: "Ordenar al final", columna: true, correcta: "orden",
          html: "<p>Para imprimir en orden con la tabla hash se copian las n claves a un arreglo y se ordena. ¿Qué cuesta eso, con m casillas?</p>",
          opciones: [
            { op: "orden", texto: "Θ(m + n) para recorrer y Θ(n log n) para ordenar", msg: "Correcto. El recorrido visita las m casillas y los n nodos; el ordenamiento domina cuando n es grande." },
            { op: "lineal", texto: "Θ(n): la tabla ya agrupa las claves", msg: "Agrupa por casilla, no por valor: 16 y 41 comparten casilla y 23 está entre ellas en orden." },
            { op: "uno", texto: "Θ(1) por clave, como buscar", msg: "Buscar una clave es Θ(1 + α) en promedio, pero ordenar n claves por comparaciones no baja de n log n." }
          ] }
      ]
    };
  }

  return { m: M, claves: CLAVES, construir: construir, recorridoHash: recorridoHash, recorridoMap: recorridoMap, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
