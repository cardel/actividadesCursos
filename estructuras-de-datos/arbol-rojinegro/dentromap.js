/* Ejercicio interactivo: un map<int, string> visto por dentro como el
   rojinegro que es; el recorrido es el inorden y ++it va al sucesor. */
var EJERCICIO = (function () {
  var A = typeof module !== "undefined" ? require("./arbol-rn.js") : ArbolRN;
  var CLAVES = [17, 42, 8, 63, 29, 51, 3, 36, 70, 24];
  var N = 300000;

  var RECORRIDO = [
    "map<int, string>::iterator it = lineas.begin();",
    "while (it != lineas.end()) {",
    "  printf(\"%d %s\\n\", it->first, it->second.c_str());",
    "  ++it;",
    "}"
  ];

  function arbol() { return A.armar(CLAVES).raiz; }

  /* La mayor altura que admite la cota: h < 2 log2(n + 1). */
  function alturaMaxima(n) {
    var c = 2 * Math.log(n + 1) / Math.LN2;
    var h = Math.floor(c);
    if (h === c) { h = h - 1; }
    return h;
  }

  function spec() {
    var r = arbol();
    var in0 = A.inorden(r);
    var s17 = A.sucesor(r, 17);
    var s36 = A.sucesor(r, 36);
    var hmax = alturaMaxima(N);
    return {
      contenedor: "tarjetas",
      cierre: "<p>Un map de la biblioteca de g++ es un rojinegro ordenado por la clave, con la pareja guardada en cada nodo. El recorrido con el iterador es el inorden, por eso sale en orden; begin() está a mano porque el encabezado guarda el nodo de más a la izquierda, y ++it va al sucesor, bajando o subiendo. Buscar, insertar y borrar cuestan O(log n) aunque las claves lleguen en orden, porque la altura nunca pasa de 2 log₂(n + 1).</p>",
      cartas: [
        { tipo: "opciones", titulo: "Por qué sale en orden", columna: true, correcta: "inorden",
          html: "<p>Un <code>map&lt;int, string&gt; lineas</code> guarda las rutas de un sistema de buses por número. Las rutas se insertaron en este orden: " + CLAVES.join(" ") + ". El recorrido imprime los números de menor a mayor:</p>" + A.codigo(RECORRIDO) + "<p>¿Por qué salen ordenados?</p>",
          opciones: [
            { op: "inorden", texto: "Porque el map es un ABB balanceado y avanzar el iterador sigue el inorden.", msg: "Correcto. El map no ordena nada al recorrer: el orden ya está en la forma del árbol, y el iterador lo lee de izquierda a derecha." },
            { op: "ordena", texto: "Porque begin() ordena las claves antes de entregar la primera.", msg: "Ordenar costaría Θ(n log n) en cada recorrido. begin() cuesta Θ(1): entrega el nodo de más a la izquierda, que el map tiene guardado." },
            { op: "lista", texto: "Porque el map guarda las parejas en una lista ordenada y cada insert busca su lugar.", msg: "En una lista ordenada, insertar cuesta Θ(n). El map inserta en O(log n) porque busca su lugar bajando por un árbol." },
            { op: "hash", texto: "Porque el map es una tabla hash y los enteros pequeños caen en cubetas ordenadas.", msg: "Esa sería una coincidencia de unordered_map con claves pequeñas, y no se puede contar con ella. El map es un árbol." }
          ] },
        { tipo: "respuesta", titulo: "El árbol del map",
          html: "<p>Por dentro, las diez rutas quedan en este rojinegro:</p>" + A.svg(r, { escala: 0.85 }) + A.LEYENDA +
                "<p>¿Qué número imprime la primera vuelta del ciclo? ¿Y la última? ¿En qué orden se visitan todos?</p>",
          campos: [
            { rotulo: "primera:", esperado: String(in0[0]), ancho: "3rem" },
            { rotulo: "última:", esperado: String(in0[in0.length - 1]), ancho: "3rem" },
            { rotulo: "orden:", esperado: in0.join(" "), ancho: "14rem" }
          ],
          bien: "Correcto. La primera es el nodo de más a la izquierda y la última, el de más a la derecha. El orden es el inorden, sin importar los colores ni el orden en que llegaron.",
          distractores: [
            { valores: [String(r.dato), null, null], msg: "El 17 es la raíz, pero el recorrido no empieza por la raíz: empieza por el menor, el de más a la izquierda." },
            { valores: [null, null, A.preorden(r).join(" ")], msg: "Ese es el preorden. El iterador del map sigue el inorden." },
            { valores: [null, null, CLAVES.join(" ")], msg: "Ese es el orden de llegada. El map no lo recuerda: solo guarda el orden de las claves." }
          ],
          otro: "Recorra el árbol izquierda, nodo, derecha." },
        { tipo: "respuesta", titulo: "A dónde va ++it",
          html: "<p>Si <code>it</code> está en la ruta 17, ¿a qué ruta lo lleva <code>++it</code>? ¿Y si está en la 36?</p>",
          campos: [
            { rotulo: "desde el 17:", esperado: String(s17.dato), ancho: "3rem" },
            { rotulo: "desde el 36:", esperado: String(s36.dato), ancho: "3rem" }
          ],
          bien: "Correcto. El 17 tiene subárbol derecho, así que ++it baja: va al 42 y de ahí a la izquierda hasta el 24, el mínimo de ese lado. El 36 no tiene hijo derecho, así que ++it sube hasta el primer antepasado del que se viene por la izquierda: el 42.",
          distractores: [
            { valores: ["42", null], msg: "El 42 es el hijo derecho del 17, pero en su subárbol izquierdo hay claves menores que él. El sucesor es el mínimo de ese lado." },
            { valores: [null, "29"], msg: "El 29 es el padre del 36, pero es menor: ya pasó. Se sigue subiendo hasta llegar a un antepasado por su izquierda." },
            { valores: [null, "37"], msg: "++it no suma 1 a la clave: va a la siguiente clave que está en el map." }
          ],
          otro: "Si hay hijo derecho, el sucesor es el mínimo de ese subárbol. Si no, se sube hasta venir por la izquierda de un antepasado." },
        { tipo: "opciones", titulo: "Rutas que llegan en orden", columna: true, correcta: "log",
          html: "<p>Una empresa crea sus rutas con números consecutivos 1, 2, 3, … y las guarda en un map. Ya van n. ¿Cuánto cuesta <code>lineas[k]</code> para una ruta que existe?</p>",
          opciones: [
            { op: "log", texto: "O(log n), también en el peor caso.", msg: "Correcto. Las claves en orden habrían hecho una lista con el ABB del curso. El rojinegro se repara en cada inserción y su altura queda en O(log n)." },
            { op: "n", texto: "Θ(n): con claves crecientes el árbol se vuelve una lista.", msg: "Eso le pasa al ABB sin balancear. El map rota y recolorea al insertar, y nunca degenera." },
            { op: "uno", texto: "O(1) en promedio, como en un unordered_map.", msg: "El map compara un nodo por nivel. El O(1) en promedio es de la tabla hash." }
          ] },
        { tipo: "respuesta", titulo: "Trescientas mil rutas",
          html: "<p>Un map guarda " + N + " claves. ¿Cuál es la mayor altura que permite la cota h &lt; 2 log₂(n + 1)? ¿Cuántas comparaciones hace, como mucho, una búsqueda? ¿Y en un ABB sin balancear, en el peor caso?</p>",
          campos: [
            { rotulo: "altura:", esperado: String(hmax), ancho: "3rem" },
            { rotulo: "búsqueda map:", esperado: String(hmax + 1), ancho: "3rem" },
            { rotulo: "búsqueda ABB:", esperado: String(N), ancho: "6rem" }
          ],
          bien: "Correcto. 2 log₂(300 001) ≈ 36,4, así que la altura es a lo sumo 36 y una búsqueda compara con 37 nodos como mucho. El ABB en lista compara con los 300 000.",
          distractores: [
            { valores: ["37", null, null], msg: "La altura es la parte entera de 36,4: el entero más grande por debajo de la cota es 36." },
            { valores: ["18", null, null], msg: "⌊log₂ 300 000⌋ = 18 sería la altura mínima. La cota del rojinegro admite el doble." },
            { valores: [null, null, String(N - 1)], msg: "299 999 es la altura de la lista. Buscar la última clave compara con los n nodos." }
          ],
          otro: "Calcule log₂(300 001) ≈ 18,19 y duplíquelo. Escriba los números sin separador de miles." }
      ]
    };
  }

  return { CLAVES: CLAVES, arbol: arbol, alturaMaxima: alturaMaxima, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
