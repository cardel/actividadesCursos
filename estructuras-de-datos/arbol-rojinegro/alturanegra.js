/* Ejercicio interactivo: la altura negra de varios nodos, el camino mas
   largo frente al mas corto y la cota de la altura de un rojinegro. */
var EJERCICIO = (function () {
  var A = typeof module !== "undefined" ? require("./arbol-rn.js") : ArbolRN;
  var CLAVES = [71, 18, 90, 34, 52, 9, 63, 27, 84, 45, 3, 58, 13];
  var N = 4095;

  function arbol() { return A.armar(CLAVES).raiz; }

  /* Nodos internos del camino mas corto de la raiz a un NIL. */
  function caminoCorto(r) {
    var res = 0;
    if (r !== null) { res = 1 + Math.min(caminoCorto(r.izq), caminoCorto(r.der)); }
    return res;
  }

  function log2(x) { return Math.log(x) / Math.LN2; }
  function cota(n) { return 2 * log2(n + 1); }
  function pisoLog(n) {
    var h = 0;
    while (Math.pow(2, h + 1) <= n) { h = h + 1; }
    return h;
  }

  function spec() {
    var r = arbol();
    var bh = function (k) { return A.alturaNegra(A.buscarNodo(r, k)); };
    var largo = A.altura(r) + 1;
    var corto = caminoCorto(r);
    var c = cota(N);
    var textoCota = Number.isInteger(c) ? String(c) : c.toFixed(1).replace(".", ",");
    return {
      contenedor: "tarjetas",
      cierre: "<p>La altura negra de un nodo cuenta los negros que hay debajo de él hasta un NIL, sin contarlo a él y contando el NIL; por la regla 5 da lo mismo por cualquier camino. Como dos rojos no pueden ir seguidos, el camino más largo tiene a lo sumo el doble de nodos que el más corto, y de ahí sale h ≤ 2 log₂(n + 1). Con unas cuatro mil claves el rojinegro baja a lo sumo 24 niveles; el ABB, en el peor caso, más de cuatro mil.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Contar negros",
          html: "<p>Este rojinegro salió de insertar " + CLAVES.join(" ") + " en un árbol vacío.</p>" +
                A.svg(r, { nil: true, escala: 0.85 }) + A.LEYENDA +
                "<p>¿Cuál es la altura negra del 34, del 52 y del 13?</p>",
          campos: [
            { rotulo: "bh(34):", esperado: String(bh(34)), ancho: "3rem" },
            { rotulo: "bh(52):", esperado: String(bh(52)), ancho: "3rem" },
            { rotulo: "bh(13):", esperado: String(bh(13)), ancho: "3rem" }
          ],
          bien: "Correcto. Del 34 hacia abajo, por ejemplo 18, 9, 3, NIL: negros el 18, el 9 y el NIL, porque el 3 es rojo. Del 52, por 63, 58, NIL: el 63 y el NIL. Del 13 solo queda su NIL. El color del nodo mismo no se cuenta.",
          distractores: [
            { valores: [String(bh(34) + 1), null, null], msg: "Así se cuenta el 34. La altura negra no cuenta el nodo del que se parte." },
            { valores: [null, String(bh(52) + 1), null], msg: "El 52 es rojo y no suma nunca; además, la altura negra no cuenta el nodo del que se parte. Por 63, 58, NIL hay dos negros." },
            { valores: [null, null, "0"], msg: "La hoja NIL es negra y sí se cuenta: un nodo cuyos hijos son NIL tiene altura negra 1." }
          ],
          otro: "Escoja cualquier camino del nodo hasta un NIL y cuente los negros, sin el nodo de partida y con el NIL." },
        { tipo: "respuesta", titulo: "El largo y el corto",
          html: "<p>En el mismo árbol, ¿cuántos nodos internos tiene el camino más largo de la raíz a un NIL? ¿Y el más corto?</p>",
          campos: [
            { rotulo: "más largo:", esperado: String(largo), ancho: "3rem" },
            { rotulo: "más corto:", esperado: String(corto), ancho: "3rem" }
          ],
          bien: "Correcto: 34, 71, 52, 63, 58 contra 34, 18, 27. El largo intercala dos rojos, el 52 y el 58, entre negros; el corto es todo negro. 5 no llega a 2 × 3 = 6: el doble es el tope.",
          distractores: [
            { valores: [String(largo - 1), null], msg: "4 es la altura, que cuenta aristas. Aquí se piden los nodos del camino." },
            { valores: [null, "2"], msg: "Ningún NIL cuelga a dos niveles de la raíz: el 18 y el 71 tienen sus dos hijos. Los primeros NIL aparecen debajo del 27 y del 90." }
          ],
          otro: "Recorra las ramas hasta el primer cuadrito negro y cuente los círculos." },
        { tipo: "respuesta", titulo: "Cuatro mil claves",
          html: "<p>Un árbol guarda " + N + " claves. ¿Cuánto vale la altura mínima posible ⌊log₂ n⌋? ¿Cuánto vale la cota 2 log₂(n + 1) de un rojinegro? ¿Qué altura tiene el ABB en el peor caso?</p>",
          campos: [
            { rotulo: "mínima:", esperado: String(pisoLog(N)), ancho: "3rem" },
            { rotulo: "cota:", esperado: textoCota, ancho: "3rem" },
            { rotulo: "ABB peor:", esperado: String(N - 1), ancho: "5rem" }
          ],
          bien: "Correcto. n + 1 = 4096 = 2¹², así que la cota da exacto 24. El rojinegro puede quedar hasta el doble de la altura mínima, pero nunca cerca de las 4094 de la lista.",
          distractores: [
            { valores: [null, "12", null], msg: "12 es log₂ 4096. La cota es el doble: el camino largo puede intercalar un rojo después de cada negro." },
            { valores: [null, null, String(N)], msg: "La lista de 4095 nodos tiene 4094 aristas: la altura es n − 1." }
          ],
          otro: "4096 es 2¹². Escriba los números sin separador de miles." },
        { tipo: "opciones", titulo: "Lo que garantiza la cota", columna: true, correcta: "orden",
          html: "<p>¿Qué cambia con la cota h ≤ 2 log₂(n + 1) frente al ABB sin balancear?</p>",
          opciones: [
            { op: "orden", texto: "Buscar cuesta O(log n) sin importar el orden en que llegaron las claves.", msg: "Correcto. La cota depende solo de n. En el ABB, la altura la decide el orden de llegada." },
            { op: "minima", texto: "El rojinegro siempre tiene la altura mínima, ⌊log₂ n⌋.", msg: "No: el árbol de la primera tarjeta tiene 13 claves y altura 4, y la mínima con 13 es 3. El rojinegro admite hasta el doble." },
            { op: "rapido", texto: "Buscar en un rojinegro siempre compara menos que en cualquier ABB con las mismas claves.", msg: "Un ABB armado con suerte puede tener la altura mínima y comparar menos. La ventaja del rojinegro es el peor caso, no cada caso." }
          ] }
      ]
    };
  }

  return { CLAVES: CLAVES, arbol: arbol, caminoCorto: caminoCorto, cota: cota, pisoLog: pisoLog, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
