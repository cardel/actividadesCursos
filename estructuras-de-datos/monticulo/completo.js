/* Ejercicio interactivo: árboles completos, padre e hijos con índices
   desde 0, y el paso del árbol al arreglo y del arreglo al árbol. */
var EJERCICIO = (function () {
  var M = typeof module !== "undefined" ? require("./monti.js") : Monti;
  var A = typeof module !== "undefined" ? require("../comun/arbol.js") : Arbol;

  /* Árboles por niveles; null es un lugar vacío. */
  var ARBOLES = {
    P: [31, 17, 26, 8, 14, 20],
    Q: [31, 17, null, 8, 14],
    R: [31, 17, 26, 8, 14, null, 19],
    S: [31, 17, 26, 8]
  };
  var X = [86, 74, 81, 40, 69, 57, 78, 12, 35, 66, 21, 50];
  var Y = [64, 59, 33, 27, 48, 30, 11, 5];
  var Z = [91, 54, 88, 47, 50, 20, 63, 9, 41, 2];

  function completos() {
    return Object.keys(ARBOLES).filter(function (k) { return M.esCompleto(ARBOLES[k]); });
  }

  function hijos(n, i) {
    return [2 * i + 1, 2 * i + 2].filter(function (j) { return j < n; });
  }

  function hojas(n) {
    var c = 0;
    var i = 0;
    while (i < n) {
      if (hijos(n, i).length === 0) { c = c + 1; }
      i = i + 1;
    }
    return c;
  }

  function spec() {
    var comp = completos().join(" y ");
    var dibujos = Object.keys(ARBOLES).map(function (k) {
      return "<p><b>" + k + "</b></p>" + M.dibujo(ARBOLES[k], {}, { titulo: "árbol " + k });
    }).join("");
    var arbY = M.arbolDe(Y);
    var iz = Z.indexOf(54);
    var i63 = Z.indexOf(63);
    var i50 = Z.indexOf(50);
    var h50 = hijos(Z.length, i50).map(function (j) { return Z[j]; });
    return {
      contenedor: "tarjetas",
      cierre: "<p>En un árbol completo todos los niveles están llenos menos quizá el último, que se llena de izquierda a derecha. Por eso la forma depende solo de n y los nodos se numeran por niveles: con la raíz en la casilla 0, el padre de i está en (i − 1) / 2 y los hijos en 2i + 1 y 2i + 2. Leer el arreglo es recorrer el árbol por niveles, no en preorden ni en inorden.</p>",
      cartas: [
        { tipo: "opciones", titulo: "¿Cuáles son completos?", columna: true, correcta: "PS",
          html: "<p>¿Cuáles de estos cuatro árboles son completos?</p>" + dibujos,
          opciones: [
            { op: "PS", texto: "P y S", msg: "Correcto. P tiene lleno el nivel 1 y el último pegado a la izquierda; S tiene un solo nodo en el último nivel, en el primer lugar. Q deja vacío el lugar del hijo derecho de la raíz y R deja un hueco antes del 19." },
            { op: "PRS", texto: "P, R y S", msg: "R tiene el último nivel con un hueco: falta el primer hijo del 26 y está el segundo. El último nivel se llena sin huecos." },
            { op: "P", texto: "Solo P", msg: "S también es completo: un último nivel con un solo nodo vale si ese nodo está en el primer lugar de la izquierda." },
            { op: "PQS", texto: "P, Q y S", msg: "En Q el nivel 1 no está lleno, falta el hijo derecho de la raíz, y aun así el 17 tiene hijos. Solo el último nivel puede estar incompleto." }
          ] },
        { tipo: "respuesta", titulo: "Padre e hijos",
          html: "<p>Un montículo de " + X.length + " claves:</p>" + M.vista(X, {}) +
                "<p>¿En qué casillas están los hijos de la casilla 4? ¿En qué casilla está el padre de la casilla 10? ¿Y el de la casilla 11?</p>",
          campos: [
            { rotulo: "hijos de 4:", esperado: hijos(X.length, 4).join(" "), ancho: "4rem" },
            { rotulo: "padre de 10:", esperado: String(M.padre(10)), ancho: "3rem" },
            { rotulo: "padre de 11:", esperado: String(M.padre(11)), ancho: "3rem" }
          ],
          bien: "Correcto. Los hijos de 4 son 2·4 + 1 = 9 y 2·4 + 2 = 10, el 66 y el 21. El padre de 10 es (10 − 1) / 2 = 4 y el de 11 es (11 − 1) / 2 = 5: la división entera redondea hacia abajo.",
          distractores: [
            { valores: ["8 9", null, null], msg: "2i y 2i + 1 son las fórmulas con la raíz en la casilla 1. Con la raíz en la casilla 0, los hijos son 2i + 1 y 2i + 2." },
            { valores: [null, "5", null], msg: "10 / 2 = 5 es la fórmula con la raíz en la casilla 1. Aquí el padre es (i − 1) / 2: el 21 cuelga del 69." }
          ],
          otro: "Aplique 2i + 1, 2i + 2 y (i − 1) / 2 con división entera, y compruébelo en el dibujo." },
        { tipo: "respuesta", titulo: "La clave siguiente y las hojas",
          html: "<p>En el mismo montículo entra una clave más. ¿En qué casilla queda antes de subir? ¿Qué clave tiene su padre? ¿Cuántas hojas tiene el árbol de " + X.length + " claves, antes de que entre?</p>",
          campos: [
            { rotulo: "casilla:", esperado: String(X.length), ancho: "3rem" },
            { rotulo: "clave del padre:", esperado: String(X[M.padre(X.length)]), ancho: "3rem" },
            { rotulo: "hojas:", esperado: String(hojas(X.length)), ancho: "3rem" }
          ],
          bien: "Correcto. La primera casilla libre es la 12 y su padre es la casilla 5, el 57, que hasta ahora tenía un solo hijo. Las hojas son las casillas 6 a 11: desde la casilla 6, el hijo izquierdo ya cae fuera del arreglo.",
          distractores: [
            { valores: [null, "78", null], msg: "El 78 está en la casilla 6, que no tiene hijos todavía. Pero antes se llena la casilla 5: su segundo hijo va en la 12." },
            { valores: [null, null, "5"], msg: "Cuente también el 50: está en la casilla 11 y no tiene hijos. Una hoja es toda casilla i con 2i + 1 fuera del arreglo." }
          ],
          otro: "La clave nueva va en la casilla n. Una casilla es hoja si 2i + 1 ≥ n." },
        { tipo: "respuesta", titulo: "Del árbol al arreglo",
          html: "<p>¿Cómo queda guardado este montículo en el arreglo, de la casilla 0 a la última?</p>" + M.dibujo(Y, {}),
          campos: [{ rotulo: "arreglo:", esperado: M.texto(Y), ancho: "16rem", pista: "las claves separadas por espacios" }],
          bien: "Correcto. Se lee por niveles, de izquierda a derecha: la raíz, luego sus dos hijos, luego los cuatro nietos y el 5, que es el primero del nivel 3.",
          distractores: [
            { valores: [A.preorden(arbY).join(" ")], msg: "Ese es el preorden. El arreglo guarda el árbol por niveles, no en el orden de una búsqueda en profundidad." },
            { valores: [A.inorden(arbY).join(" ")], msg: "Ese es el inorden. En un montículo no sale ordenado, y el arreglo guarda los nodos por niveles." }
          ],
          otro: "Escriba la raíz, después el nivel 1 de izquierda a derecha, después el nivel 2, y así." },
        { tipo: "respuesta", titulo: "Del arreglo al árbol",
          html: "<p>Un montículo guardado así:</p>" + M.cajas(Z, {}) +
                "<p>Sin dibujar el árbol completo: ¿cuál es el hijo derecho del 54? ¿De qué clave es hijo el 63? El 50 tiene un solo hijo: ¿cuál?</p>",
          campos: [
            { rotulo: "hijo derecho del 54:", esperado: String(Z[2 * iz + 2]), ancho: "3rem" },
            { rotulo: "padre del 63:", esperado: String(Z[M.padre(i63)]), ancho: "3rem" },
            { rotulo: "hijo del 50:", esperado: h50.join(" "), ancho: "3rem" }
          ],
          bien: "Correcto. El 54 está en la casilla 1, y su hijo derecho, en la 4. El 63 está en la 6 y su padre en la 2, el 88. El 50 está en la 4: su hijo izquierdo es la casilla 9 y la 10 ya no existe.",
          distractores: [
            { valores: ["47", null, null], msg: "El 47 está en la casilla 3, que es el hijo izquierdo del 54. El derecho es la casilla 4." },
            { valores: [null, "54", null], msg: "El 54 está en la casilla 1 y sus hijos son las casillas 3 y 4. El 63 está en la 6: su padre es la casilla 2." }
          ],
          otro: "Ubique la casilla de cada clave y aplique las fórmulas con índices desde 0." }
      ]
    };
  }

  return { ARBOLES: ARBOLES, X: X, Y: Y, Z: Z, completos: completos, hojas: hojas, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
