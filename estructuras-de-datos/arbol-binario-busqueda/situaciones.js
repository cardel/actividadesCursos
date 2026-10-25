/* Ejercicio interactivo: lo que cobra el ABB segun el orden en que llegan
   las claves, y cuando conviene otra estructura. */
var EJERCICIO = (function () {
  var A = typeof module !== "undefined" ? require("./arbol.js") : ArbolBB;

  /* Comparaciones de la peor busqueda: los nodos del camino mas largo. */
  function peorBusqueda(n, forma) {
    var h;
    if (forma === "lista") {
      h = n - 1;
    } else {
      h = 0;
      while (Math.pow(2, h + 1) <= n) { h = h + 1; }
    }
    return h + 1;
  }

  /* Comprobacion pequena con el arbol de verdad: claves crecientes dan una lista. */
  function alturaCreciente(n) {
    var claves = [];
    var i = 1;
    while (i <= n) { claves.push(i); i = i + 1; }
    return A.altura(A.armar(claves));
  }

  function spec() {
    var millon = 1000000;
    return {
      contenedor: "tarjetas",
      cierre: "<p>El ABB cobra O(h) por buscar, insertar y borrar, y h depende del orden de llegada. Las claves crecientes (turnos, fechas, consecutivos) son las más comunes y son justo las que arman la lista: Θ(n) por operación y Θ(n²) por armar el árbol. Con claves revueltas, h queda cerca de log₂ n. Listar en orden es un inorden, Θ(n), con cualquier forma. Cuando el árbol puede degenerar, la recursión apila un marco por nivel y la versión iterativa se ahorra ese espacio.</p>",
      cartas: [
        { tipo: "opciones", titulo: "Turnos de un banco", columna: true, correcta: "n",
          html: "<p>Un banco guarda en un ABB los números de turno 1, 2, 3, … a medida que los entrega. Ya van n turnos. ¿Cuánto cuesta insertar el siguiente?</p>",
          opciones: [
            { op: "log", texto: "Θ(log n): el ABB baja por un solo lado.", msg: "Baja por un solo lado, pero aquí ese lado mide n − 1: cada turno es mayor que todos los anteriores y el árbol es una lista hacia la derecha." },
            { op: "n", texto: "Θ(n): el árbol es una lista y el turno nuevo compara con todos los anteriores.", msg: "Correcto. Con turnos crecientes, h = n − 1." },
            { op: "uno", texto: "Θ(1): el turno nuevo siempre va al final.", msg: "Va al final, pero para llegar ahí insertar baja desde la raíz por todos los nodos." }
          ] },
        { tipo: "opciones", titulo: "Códigos revueltos", columna: true, correcta: "log",
          html: "<p>Una bodega guarda en un ABB códigos de producto que llegan sin ningún orden. ¿Qué cuesta, en la práctica, buscar un código entre n?</p>",
          opciones: [
            { op: "log", texto: "O(h), con h unas pocas veces log₂ n: crece como log n.", msg: "Correcto. Con claves en desorden la altura queda entre dos y tres veces ⌊log₂ n⌋, y eso es Θ(log n)." },
            { op: "n", texto: "Θ(n): un ABB sin balancear siempre degenera.", msg: "Degenera con órdenes particulares, como el creciente. Con claves revueltas la altura se queda cerca del mínimo." },
            { op: "uno", texto: "Θ(1) en promedio, como una tabla hash.", msg: "El ABB compara un nodo por nivel; no salta directo a una casilla como la tabla hash." }
          ] },
        { tipo: "respuesta", titulo: "Un millón de claves",
          html: "<p>Un ABB guarda un millón de claves. ¿Cuántas comparaciones hace, como mucho, una búsqueda si el árbol tiene la altura mínima? ¿Y si es una lista?</p>",
          campos: [
            { rotulo: "altura mínima:", esperado: String(peorBusqueda(millon, "minima")), ancho: "4rem" },
            { rotulo: "lista:", esperado: String(peorBusqueda(millon, "lista")), ancho: "6rem" }
          ],
          bien: "Correcto: ⌊log₂ 10⁶⌋ = 19, así que el camino más largo tiene 20 nodos. En la lista, buscar la última clave compara con el millón.",
          distractores: [
            { valores: ["19", null], msg: "19 es la altura, en aristas. La búsqueda compara con los nodos del camino: h + 1 = 20." },
            { valores: [null, "999999"], msg: "999 999 es la altura de la lista. La búsqueda de la última clave compara con los n nodos." }
          ],
          otro: "La peor búsqueda compara h + 1 veces. Calcule h en cada forma; escriba los números sin separador de miles." },
        { tipo: "opciones", titulo: "Listar en orden", columna: true, correcta: "n",
          html: "<p>¿Cuánto cuesta imprimir las n claves de menor a mayor, si el ABB es una lista y si tiene la altura mínima?</p>",
          opciones: [
            { op: "n", texto: "Θ(n) en los dos casos.", msg: "Correcto: es el inorden, que visita cada nodo una vez. La forma solo cambia el espacio de la pila, O(h)." },
            { op: "nlog", texto: "Θ(n log n) balanceado y Θ(n²) en la lista: una búsqueda por clave.", msg: "No hace falta buscar cada clave: el inorden las recorre todas en orden en una pasada." },
            { op: "dist", texto: "Θ(log n) balanceado y Θ(n) en la lista.", msg: "Imprimir n claves cuesta al menos n, sea cual sea la forma." }
          ] },
        { tipo: "respuesta", titulo: "Marcos en una lista",
          html: "<p>Un ABB armado con las claves 1 a 300 000 en orden creciente. Se llama <code>raiz = insertar(raiz, 300001)</code> con la versión recursiva. ¿Cuántos marcos de <code>insertar</code> llegan a estar en la pila a la vez? ¿Cuánto espacio aparte pide <code>insertarIterativa</code>?</p>",
          campos: [
            { rotulo: "marcos:", esperado: "300001", ancho: "6rem" },
            { rotulo: "iterativa:", esperado: "O(1)", pista: "O(…)", ancho: "4rem" }
          ],
          bien: "Correcto: un marco por cada nodo de la lista más el del caso base, insertar(NULL, 300001). Cada marco espera para reenganchar. La iterativa recorre el mismo camino con padre y actual y no apila nada; con un árbol así, la recursiva puede desbordar la pila de llamadas.",
          distractores: [
            { valores: ["300000", null], msg: "Además de un marco por nodo está el del caso base, el que recibe NULL y crea el nodo." },
            { valores: ["19", null], msg: "log₂ 300 000 ≈ 18 sería la altura de un árbol balanceado. Este es una lista: la recursión baja por los 300 000 nodos." },
            { valores: [null, "O(n)"], msg: "La iterativa usa dos punteros, padre y actual, sea cual sea la altura." }
          ],
          otro: "Escriba el número sin separador de miles y el espacio como O(1), O(log n) u O(n)." },
        { tipo: "opciones", titulo: "Armar el árbol completo", columna: true, correcta: "dos",
          html: "<p>Se insertan n claves en un ABB vacío. ¿Cuánto cuesta en total si llegan en orden creciente y si llegan revueltas?</p>",
          opciones: [
            { op: "dos", texto: "Θ(n²) en orden creciente y Θ(n log n) revueltas.", msg: "Correcto. En la lista, la clave i compara con i − 1 nodos: la suma es Θ(n²). Revueltas, cada inserción paga O(log n)." },
            { op: "igual", texto: "Θ(n log n) en los dos casos: son las mismas claves.", msg: "Las claves son las mismas, pero el árbol no: en orden creciente cada inserción recorre la lista entera." },
            { op: "lineal", texto: "Θ(n) en los dos casos: cada inserción enlaza un solo nodo.", msg: "Enlazar cuesta Θ(1), pero antes hay que bajar hasta el NULL, y eso cuesta O(h)." }
          ] },
        { tipo: "opciones", titulo: "Consecutivos que llegan en orden", columna: true, correcta: "arreglo",
          html: "<p>Un sistema recibe códigos consecutivos de una base de datos, siempre crecientes, y solo necesita agregarlos y preguntar si un código está. Nunca borra. ¿Qué conviene?</p>",
          opciones: [
            { op: "abb", texto: "Un ABB: buscar e insertar en O(h).", msg: "Con códigos crecientes h = n − 1: cada operación cuesta Θ(n)." },
            { op: "arreglo", texto: "Un arreglo ordenado: agregar es escribir al final y buscar es búsqueda binaria.", msg: "Correcto. Como cada código es mayor que todos los anteriores, no hay nada que correr: agregar cuesta Θ(1) y buscar Θ(log n). Lo caro del arreglo era insertar en medio, y aquí no pasa." },
            { op: "lista", texto: "Una lista enlazada ordenada: agregar al final es Θ(1) con un puntero al último.", msg: "Agregar sí, pero buscar en una lista recorre nodo por nodo: Θ(n)." }
          ] }
      ]
    };
  }

  return { peorBusqueda: peorBusqueda, alturaCreciente: alturaCreciente, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
