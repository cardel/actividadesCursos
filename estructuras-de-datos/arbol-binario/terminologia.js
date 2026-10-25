/* Ejercicio interactivo: el vocabulario del árbol con raíz sobre un árbol
   de once nodos, y su representación con primer hijo y hermano siguiente. */
var EJERCICIO = (function () {
  var A = (typeof Arbol !== "undefined") ? Arbol : require("../comun/arbol.js");
  var G = A.G;

  var RAIZ = G("R", [
    G("K", [G("P"), G("Q")]),
    G("L"),
    G("M", [G("S", [G("T"), G("U", [G("V")])])]),
    G("N")
  ]);

  /* Una fila por nodo, en el orden de lectura de arriba abajo. */
  function filas() {
    var res = [];
    function altura(n) {
      var h = 0;
      n.hijos.forEach(function (c) { h = Math.max(h, 1 + altura(c)); });
      return h;
    }
    function visitar(n, padre, prof) {
      res.push({
        nodo: n.dato,
        padre: padre === null ? "ninguno" : padre.dato,
        hijos: n.hijos.map(function (h) { return h.dato; }),
        hermanos: padre === null ? [] : padre.hijos.filter(function (h) { return h !== n; }).map(function (h) { return h.dato; }),
        grado: n.hijos.length,
        profundidad: prof,
        altura: altura(n),
        tipo: padre === null ? "raíz" : (n.hijos.length === 0 ? "hoja" : "interno")
      });
      n.hijos.forEach(function (h) { visitar(h, n, prof + 1); });
    }
    visitar(RAIZ, null, 0);
    return res;
  }

  function de(nombre) {
    return filas().filter(function (f) { return f.nodo === nombre; })[0];
  }

  /* Con primer hijo y hermano siguiente cada nodo tiene dos punteros.
     Se cuentan los que quedan en NULL. */
  function punterosNulos() {
    var res = 0;
    function visitar(n, siguiente) {
      if (n.hijos.length === 0) { res = res + 1; }
      if (siguiente === null) { res = res + 1; }
      n.hijos.forEach(function (h, i) { visitar(h, i + 1 < n.hijos.length ? n.hijos[i + 1] : null); });
    }
    visitar(RAIZ, null);
    return res;
  }

  function spec() {
    var fs = filas();
    var n = fs.length;
    var alturaArbol = de("R").altura;
    var nivel2 = fs.filter(function (f) { return f.profundidad === 2; }).map(function (f) { return f.nodo; });
    var hojas = fs.filter(function (f) { return f.tipo === "hoja"; }).length;
    var dibujo = A.general(RAIZ, { titulo: "árbol de once nodos con raíz R" });
    var nulos = punterosNulos();
    return {
      contenedor: "tarjetas",
      cierre: "La profundidad se cuenta desde la raíz hacia abajo y la altura desde las hojas hacia arriba, las dos en aristas: M tiene profundidad 1 y altura 3. El grado cuenta hijos, no descendientes. Con un puntero al primer hijo y otro al hermano siguiente, cualquier árbol con raíz se guarda con dos punteros por nodo, y listar los hijos de un nodo cuesta su grado.",
      cartas: [
        { tipo: "respuesta", titulo: "Parentesco",
          html: dibujo + "<p>¿Quién es el padre de U? ¿Quiénes son los hermanos de L, de izquierda a derecha? ¿Cuál es el grado de R?</p>",
          campos: [
            { rotulo: "padre de U:", esperado: de("U").padre, ancho: "3rem" },
            { rotulo: "hermanos de L:", esperado: de("L").hermanos.join(" "), ancho: "6rem", pista: "X Y" },
            { rotulo: "grado de R:", esperado: String(de("R").grado), ancho: "3rem" }
          ],
          bien: "Correcto: U cuelga de S; L comparte padre con K, M y N; R tiene cuatro hijos.",
          distractores: [
            { valores: [null, "K L M N", null], msg: "Un nodo no es hermano de sí mismo: los hermanos de L son los otros hijos de R." },
            { valores: [null, null, String(n - 1)], msg: "Eso cuenta todos los descendientes de R. El grado cuenta solo sus hijos." },
            { valores: ["M", null, null], msg: "M es el abuelo de U, no su padre: entre los dos está S." }
          ],
          otro: "El padre es el nodo inmediatamente encima; los hermanos, los demás hijos del mismo padre; el grado, cuántos hijos tiene." },
        { tipo: "respuesta", titulo: "Profundidad y altura",
          html: "<p>Las dos medidas cuentan aristas. ¿Qué profundidad tiene V? ¿Qué altura y qué profundidad tiene M?</p>",
          campos: [
            { rotulo: "profundidad de V:", esperado: String(de("V").profundidad), ancho: "3rem" },
            { rotulo: "altura de M:", esperado: String(de("M").altura), ancho: "3rem" },
            { rotulo: "profundidad de M:", esperado: String(de("M").profundidad), ancho: "3rem" }
          ],
          bien: "Correcto. De R a V hay cuatro aristas (R, M, S, U, V). Bajo M el camino más largo es M, S, U, V, de tres aristas, y M está a una arista de la raíz.",
          distractores: [
            { valores: ["5", null, null], msg: "Ese número cuenta los nodos del camino R, M, S, U, V. La profundidad cuenta aristas: una menos." },
            { valores: [null, "4", null], msg: "Contó los nodos de M, S, U, V. La altura cuenta aristas." },
            { valores: [null, "1", "3"], msg: "Están intercambiadas: la profundidad mide desde la raíz hacia abajo y la altura desde M hasta su hoja más lejana." }
          ],
          otro: "Profundidad: aristas de la raíz al nodo. Altura: aristas del camino más largo que baja del nodo hasta una hoja." },
        { tipo: "respuesta", titulo: "Niveles y el árbol completo",
          html: "<p>¿Qué nodos forman el nivel 2, de izquierda a derecha? ¿Cuál es la altura del árbol y cuántas hojas tiene?</p>",
          campos: [
            { rotulo: "nivel 2:", esperado: nivel2.join(" "), ancho: "6rem", pista: "X Y Z" },
            { rotulo: "altura del árbol:", esperado: String(alturaArbol), ancho: "3rem" },
            { rotulo: "hojas:", esperado: String(hojas), ancho: "3rem" }
          ],
          bien: "Correcto. El nivel 2 son los nietos de R: P, Q y S. La altura del árbol es la de R, " + alturaArbol + ". Las hojas son L, N, P, Q, T y V.",
          distractores: [
            { valores: ["K L M N", null, null], msg: "Ese es el nivel 1: los nodos a una arista de la raíz." },
            { valores: [null, null, "4"], msg: "L y N también son hojas: no tienen hijos aunque estén en el nivel 1." }
          ],
          otro: "El nivel k son los nodos de profundidad k. Una hoja es un nodo sin hijos, esté en el nivel que esté." },
        { tipo: "tabla", titulo: "La tabla completa",
          html: "<p>Una fila por nodo. Revele las filas para comparar con lo que respondió.</p>",
          cabecera: ["Nodo", "Padre", "Hijos", "Grado", "Profundidad", "Altura", "Tipo"],
          filas: fs.map(function (f) {
            return [f.nodo, f.padre, f.hijos.length === 0 ? "ninguno" : f.hijos.join(", "), String(f.grado), String(f.profundidad), String(f.altura), f.tipo];
          }) },
        { tipo: "respuesta", titulo: "Primer hijo y hermano siguiente",
          html: "<p>El árbol se guarda con dos punteros por nodo: uno a su primer hijo y otro a su hermano siguiente. ¿A qué apunta el primer hijo de S? ¿Y el hermano siguiente de T? ¿Cuántos de los " + (2 * n) + " punteros quedan en NULL?</p>",
          campos: [
            { rotulo: "primer hijo de S:", esperado: "T", ancho: "3rem" },
            { rotulo: "hermano siguiente de T:", esperado: "U", ancho: "3rem" },
            { rotulo: "punteros en NULL:", esperado: String(nulos), ancho: "3.5rem" }
          ],
          bien: "Correcto. Cada nodo distinto de R recibe un solo puntero, de su padre si es primer hijo o de su hermano anterior si no. Son " + (n - 1) + " punteros usados, y quedan " + (2 * n) + " − " + (n - 1) + " = " + nulos + " en NULL: los " + hojas + " primeros hijos que no existen y los " + (nulos - hojas) + " hermanos siguientes que no hay.",
          distractores: [
            { valores: [null, null, String(hojas)], msg: "Esos son solo los primeros hijos en NULL, uno por hoja. Falta el hermano siguiente del último hijo de cada nodo, y el de R." },
            { valores: ["U", null, null], msg: "U es el segundo hijo de S. El primero, el de más a la izquierda, es T." }
          ],
          otro: "Cuente los punteros que sí apuntan a un nodo: cada nodo menos la raíz recibe exactamente uno." },
        { tipo: "opciones", titulo: "Aristas o nodos", columna: true, correcta: "cinco",
          html: "<p>Un enunciado define la altura contando <b>nodos</b>: una hoja tiene altura 1. Con esa definición, ¿cuál es la altura de este árbol?</p>",
          opciones: [
            { op: "cuatro", texto: String(alturaArbol), msg: "Esa es la altura contando aristas. Contando nodos, el camino R, M, S, U, V tiene cinco." },
            { op: "cinco", texto: String(alturaArbol + 1), msg: "Correcto. Contando nodos todo sube en uno. Antes de programar se lee cuál de las dos definiciones usa el enunciado." },
            { op: "once", texto: String(n), msg: n + " es el número de nodos del árbol, no los de su camino más largo." }
          ] }
      ]
    };
  }

  return { raiz: RAIZ, filas: filas, de: de, punterosNulos: punterosNulos, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
