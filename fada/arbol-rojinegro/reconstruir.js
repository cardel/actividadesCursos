/* Ejercicio interactivo: lo que cuesta un ABB que recibe claves en orden y
   lo que cuesta reconstruirlo balanceado despues de cada insercion. */
var EJERCICIO = (function () {
  var A = typeof module !== "undefined" ? require("./arbol-rn.js") : ArbolRN;
  var N = 400;

  /* Comparaciones al insertar 1..n en un ABB vacio, contadas sobre el
     arbol de verdad: la clave i baja por los i - 1 nodos anteriores. */
  function comparacionesCreciente(n) {
    var r = null;
    var total = 0;
    var i = 1;
    while (i <= n) {
      var x = r;
      while (x !== null) {
        total = total + 1;
        x = i < x.dato ? x.izq : x.der;
      }
      r = A.insertarABB(r, i);
      i = i + 1;
    }
    return total;
  }

  /* Nodos que se tocan al sacar el inorden y reconstruir despues de cada
     insercion: con i claves, i al recorrer y i al armar. */
  function tocadosReconstruyendo(n) {
    var total = 0;
    var i = 1;
    while (i <= n) {
      total = total + 2 * i;
      i = i + 1;
    }
    return total;
  }

  /* Altura minima con n claves: piso de log2 n. */
  function alturaMinima(n) {
    var h = 0;
    while (Math.pow(2, h + 1) <= n) { h = h + 1; }
    return h;
  }

  function spec() {
    var cmp = comparacionesCreciente(N);
    var cmpDoble = comparacionesCreciente(2 * N);
    var toc = tocadosReconstruyendo(N);
    var ejemplo = A.armarABB([101, 102, 103, 104, 105]);
    return {
      contenedor: "tarjetas",
      cierre: "<p>Con claves que llegan en orden, el ABB es una lista y armarlo cuesta Θ(n²). Reconstruirlo balanceado tras cada inserción deja buscar en Θ(log n), pero cada inserción mueve los n nodos, así que el total sigue en Θ(n²). Lo que hace falta es una reparación que toque solo el camino de la clave nueva: O(log n) por inserción y O(n log n) en total.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Radicados de una notaría",
          html: "<p>Una notaría numera sus radicados con un contador: 101, 102, 103, … Cada número se guarda en un ABB al llegar. Así quedan los cinco primeros:</p>" +
                A.svg(ejemplo, { escala: 0.8 }) +
                "<p>Si llegan " + N + " radicados seguidos, ¿cuántas comparaciones hacen en total las " + N + " inserciones? ¿Y si llegan el doble?</p>",
          campos: [
            { rotulo: N + " radicados:", esperado: String(cmp), ancho: "6rem" },
            { rotulo: (2 * N) + " radicados:", esperado: String(cmpDoble), ancho: "6rem" }
          ],
          bien: "Correcto. El radicado i compara con los i − 1 anteriores, y la suma 0 + 1 + … + (n − 1) es n(n − 1)/2. Al doblar n, el total se multiplica casi por 4: es el Θ(n²).",
          distractores: [
            { valores: [String(N * N), null], msg: "n² sobra el doble: el radicado i compara con i − 1 nodos, no con n. La suma es n(n − 1)/2." },
            { valores: [String(N * (N + 1) / 2), null], msg: "Así se cuenta una comparación de más por radicado. El primero entra al árbol vacío sin comparar." },
            { valores: [null, String(2 * cmp)], msg: "Doblar n no dobla la suma: cada radicado compara con el doble de nodos y además hay el doble de radicados." }
          ],
          otro: "Sume lo que compara cada radicado al entrar, sin separador de miles." },
        { tipo: "respuesta", titulo: "Reconstruir tras cada radicado",
          html: "<p>Se cambia de plan: después de cada inserción se saca el inorden a un arreglo y se arma el árbol de altura mínima con <code>construirBalanceado(a, ini, fin)</code>. Con i claves, el inorden visita i nodos y la reconstrucción enlaza otros i.</p><p>Con " + N + " radicados, ¿qué altura tiene el árbol al final? ¿Cuántos nodos se tocan en total entre inordenes y reconstrucciones?</p>",
          campos: [
            { rotulo: "altura:", esperado: String(alturaMinima(N)), ancho: "4rem" },
            { rotulo: "nodos tocados:", esperado: String(toc), ancho: "6rem" }
          ],
          bien: "Correcto. La altura queda en ⌊log₂ 400⌋ = 8 y buscar baja por 9 nodos, pero la suma de 2i para i de 1 a n es n(n + 1): sigue siendo Θ(n²). Se arregló la búsqueda y la inserción quedó igual de cara.",
          distractores: [
            { valores: [String(N - 1), null], msg: "399 es la altura de la lista sin reconstruir. Reconstruir deja siempre la altura mínima, ⌊log₂ n⌋." },
            { valores: [null, String(2 * N)], msg: "800 serían los nodos de una sola reconstrucción al final. Aquí se reconstruye después de cada uno de los 400 radicados." }
          ],
          otro: "La altura mínima con n claves es ⌊log₂ n⌋. Para el total, sume 2i con i de 1 a 400." },
        { tipo: "opciones", titulo: "Lo que se busca", columna: true, correcta: "local",
          html: "<p>¿Qué tendría que cumplir una estructura para que los radicados en orden dejen de ser un problema?</p>",
          opciones: [
            { op: "minima", texto: "Mantener siempre la altura mínima exacta, ⌊log₂ n⌋.", msg: "Eso es lo que hace la reconstrucción, y cuesta Θ(n) por inserción: la altura mínima exacta obliga a mover medio árbol por una sola clave." },
            { op: "local", texto: "Aceptar un margen en la altura y repararlo con cambios cerca de la clave que entró, en O(log n).", msg: "Correcto. Si ningún camino puede medir más del doble que otro, la altura queda en O(log n), y la reparación se hace sobre el camino que bajó la inserción." },
            { op: "ordenar", texto: "Desordenar los radicados antes de insertarlos, para que el ABB quede bajo.", msg: "Los radicados llegan de a uno y hay que responder por ellos al momento: no se pueden guardar para revolverlos después." },
            { op: "lista", texto: "Guardarlos en una lista enlazada, que agrega al final en Θ(1).", msg: "Agregar sí cuesta Θ(1), pero buscar un radicado recorre la lista: Θ(n) por pregunta." }
          ] }
      ]
    };
  }

  return { comparacionesCreciente: comparacionesCreciente, tocadosReconstruyendo: tocadosReconstruyendo, alturaMinima: alturaMinima, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
