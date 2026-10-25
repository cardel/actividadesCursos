/* Ejercicio interactivo: buscar en un ABB bajando por un solo lado,
   contando comparaciones, y la misma busqueda con un ciclo. */
var EJERCICIO = (function () {
  var A = typeof module !== "undefined" ? require("./arbol.js") : ArbolBB;
  var CLAVES = [41, 20, 65, 11, 29, 50, 91, 26, 32, 72];

  var BUSCAR_ITERATIVA = [
    "Nodo *buscarIterativa(Nodo *r, int k) {",
    "  while (r != NULL && k != r->dato) {",
    "    if (k < r->dato) {",
    "      r = r->izq;",
    "    } else {",
    "      r = r->der;",
    "    }",
    "  }",
    "  return r;",
    "}"
  ];

  function arbol() {
    return A.armar(CLAVES);
  }

  /* Un dibujo por cada comparacion de buscar(raiz, k). */
  function pasosBusqueda(k) {
    var r = arbol();
    var c = A.camino(r, k);
    var pasos = [{ texto: "el árbol antes de buscar " + k, html: A.svg(r) }];
    var marcas = {};
    var aristas = {};
    c.claves.forEach(function (clave, i) {
      Object.keys(marcas).forEach(function (m) { marcas[m] = "visto"; });
      marcas[clave] = "resal";
      if (i > 0) { aristas[clave] = "camino"; }
      var texto;
      if (clave === k) {
        texto = "comparación " + (i + 1) + ": " + k + " = " + clave + ", se devuelve este nodo";
      } else if (k < clave) {
        texto = "comparación " + (i + 1) + ": " + k + " < " + clave + ", se baja a la izquierda";
      } else {
        texto = "comparación " + (i + 1) + ": " + k + " > " + clave + ", se baja a la derecha";
      }
      pasos.push({ texto: texto, html: A.svg(r, { marcas: JSON.parse(JSON.stringify(marcas)), aristas: JSON.parse(JSON.stringify(aristas)) }) });
    });
    return { pasos: pasos, camino: c };
  }

  /* Filas de la traza de buscarIterativa: momento, r y comparacion. */
  function trazaIterativa(k) {
    var c = A.camino(arbol(), k);
    return c.claves.map(function (clave, i) {
      var momento = i === 0 ? "antes del ciclo" : "después de la vuelta " + i;
      var comp;
      if (clave === k) {
        comp = "igual: el ciclo termina";
      } else if (k < clave) {
        comp = k + " < " + clave + ": r = r->izq";
      } else {
        comp = k + " > " + clave + ": r = r->der";
      }
      return [momento, String(clave), comp];
    });
  }

  function spec() {
    var r = arbol();
    var p32 = pasosBusqueda(32);
    var c70 = A.camino(r, 70);
    var c45 = A.camino(r, 45);
    var c26 = A.camino(r, 26);
    var h = A.altura(r);
    var minimo = A.minimo(r).dato;
    var maximo = A.maximo(r);
    return {
      contenedor: "tarjetas",
      cierre: "<p>Buscar compara la clave con un nodo por nivel y baja a un solo lado, así que nunca pasa de h + 1 comparaciones: en este árbol, de altura " + h + ", a lo sumo " + (h + 1) + " de los " + CLAVES.length + " nodos. La versión recursiva apila un marco por nivel, O(h) de espacio, y ningún marco toca lo que le devuelven; por eso la llamada se puede cambiar por <code>r = r->izq</code> o <code>r = r->der</code> dentro de un ciclo, con O(1) de espacio. El mínimo y el máximo están al fondo de la izquierda y de la derecha, y no tienen por qué ser hojas: el 91 tiene al 72 colgando a la izquierda.</p>",
      cartas: [
        { tipo: "pasos", titulo: "buscar(raiz, 32), comparación por comparación",
          html: "<p>El árbol sale de insertar " + CLAVES.join(" ") + " en un ABB vacío. En cada nodo se compara y se baja a un solo lado.</p>",
          pasos: p32.pasos },
        { tipo: "respuesta", titulo: "Buscar una clave que no está",
          html: A.svg(r) + "<p>Ahora <code>buscar(raiz, 70)</code>. ¿Con cuántas claves compara el 70, y en el hijo vacío de qué nodo se cae la búsqueda? ¿De qué lado?</p>",
          campos: [
            { rotulo: "comparaciones:", esperado: String(c70.claves.length), ancho: "3rem" },
            { rotulo: "se cae bajo el", esperado: String(c70.padre), ancho: "3.5rem" },
            { rotulo: "lado:", esperado: c70.lado, pista: "izq o der", ancho: "5.5rem" }
          ],
          bien: "Correcto: 70 > 41, 70 > 65, 70 < 91, 70 < 72, y el hijo izquierdo del 72 es NULL. Cuatro comparaciones, y el 70 no está.",
          distractores: [
            { valores: [null, "91", null], msg: "Al 91 no le falta el hijo izquierdo: ahí está el 72. 70 < 72 baja una vez más." },
            { valores: ["3", null, null], msg: "Cuente también la comparación con el 72: es la que manda la búsqueda a su hijo izquierdo vacío." },
            { valores: [null, "65", null], msg: "70 > 65 baja a la derecha del 65, al 91, y la búsqueda sigue." }
          ],
          otro: "Siga la búsqueda desde la raíz: si el 70 es menor que la clave, a la izquierda; si es mayor, a la derecha." },
        { tipo: "respuesta", titulo: "Los marcos de la búsqueda",
          html: "<p>La versión recursiva:</p>" + A.codigo([
            "Nodo *buscar(Nodo *r, int k) {",
            "  Nodo *res = r;",
            "  if (r != NULL && k != r->dato) {",
            "    if (k < r->dato) {",
            "      res = buscar(r->izq, k);",
            "    } else {",
            "      res = buscar(r->der, k);",
            "    }",
            "  }",
            "  return res;",
            "}"]) +
            "<p>En <code>buscar(raiz, 70)</code>, ¿cuántos marcos de <code>buscar</code> hay vivos en el momento más hondo? ¿Cuántos de ellos cambian lo que les devuelve su llamada antes de devolverlo? ¿Y con cuántas claves compara <code>buscar(raiz, 45)</code>?</p>",
          campos: [
            { rotulo: "marcos:", esperado: String(c70.claves.length + 1), ancho: "3rem" },
            { rotulo: "lo cambian:", esperado: "0", ancho: "3rem" },
            { rotulo: "comparaciones con 45:", esperado: String(c45.claves.length), ancho: "3rem" }
          ],
          bien: "Correcto: los marcos de 41, 65, 91 y 72, y encima el de buscar(NULL, 70), que es el caso base. Cada marco guarda lo que le llega en res y lo devuelve sin tocarlo. El 45 compara con 41, 65 y 50 y se cae a la izquierda del 50.",
          distractores: [
            { valores: ["4", null, null], msg: "Falta el marco de la llamada con r = NULL: también es un marco de buscar, el del caso base." },
            { valores: [null, "4", null], msg: "res = buscar(...) guarda el resultado, pero no lo cambia: lo que sube es el mismo NULL de abajo." }
          ],
          otro: "Un marco por cada nodo del camino, más el de la llamada que recibe NULL." },
        { tipo: "respuesta", titulo: "La misma búsqueda con un ciclo",
          html: A.codigo(BUSCAR_ITERATIVA) + "<p>¿Cuántas vueltas completas da el ciclo en <code>buscarIterativa(raiz, 26)</code>?</p>",
          campos: [{ rotulo: "vueltas:", esperado: String(c26.claves.length - 1), ancho: "3rem" }],
          bien: "Correcto: r pasa del 41 al 20, del 20 al 29 y del 29 al 26. Con r en el 26 la condición del while falla y el ciclo termina sin dar otra vuelta.",
          distractores: [
            { valores: ["4"], msg: "Son cuatro comparaciones, pero con r en el 26 la condición k != r->dato es falsa y no entra: las vueltas son tres." },
            { valores: ["2"], msg: "Cuente cada vez que r cambia: 41 → 20, 20 → 29, 29 → 26." }
          ],
          otro: "Cada vuelta baja r un nivel. Cuente los cambios de r hasta que r->dato sea 26." },
        { tipo: "tabla", titulo: "buscarIterativa(raiz, 26), vuelta por vuelta",
          cabecera: ["Momento", "r", "Comparación"],
          filas: trazaIterativa(26),
          nota: "La condición del while es la negación de los dos casos base de la versión recursiva: r == NULL o r->dato == k." },
        { tipo: "respuesta", titulo: "Mínimo y máximo",
          html: "<p><code>minimo</code> baja por <code>izq</code> mientras pueda y <code>maximo</code> por <code>der</code>. En el árbol de esta actividad, ¿qué devuelve cada una?</p>",
          campos: [
            { rotulo: "mínimo:", esperado: String(minimo), ancho: "3.5rem" },
            { rotulo: "máximo:", esperado: String(maximo.dato), ancho: "3.5rem" }
          ],
          bien: "Correcto: el mínimo pasa por 41, 20 y 11; el máximo por 41, 65 y 91. Ninguno mira el resto del árbol.",
          distractores: [
            { valores: [null, "72"], msg: "El 72 está a la izquierda del 91: es menor que él. El máximo es el último nodo bajando por der, aunque tenga hijo izquierdo." }
          ],
          otro: "Desde la raíz, siga solo el puntero izq hasta que sea NULL; para el máximo, solo der." },
        { tipo: "opciones", titulo: "¿El máximo es una hoja?", columna: true, correcta: "no",
          html: "<p>El nodo del máximo, ¿es siempre una hoja?</p>",
          opciones: [
            { op: "no", texto: "No: no tiene hijo derecho, pero puede tener izquierdo, como el 91 con el 72.", msg: "Correcto. Por eso, al borrar el máximo, a veces sube su hijo izquierdo." },
            { op: "si", texto: "Sí: si tuviera un hijo, ese hijo sería mayor.", msg: "Solo el hijo derecho sería mayor. El 91 tiene hijo izquierdo, el 72, y sigue siendo la mayor clave." }
          ] },
        { tipo: "respuesta", titulo: "La peor búsqueda de este árbol",
          html: "<p>¿Cuál es la altura del árbol y cuántas comparaciones hace, como mucho, una búsqueda en él?</p>",
          campos: [
            { rotulo: "altura:", esperado: String(h), ancho: "3rem" },
            { rotulo: "a lo sumo:", esperado: String(h + 1), ancho: "3rem" }
          ],
          bien: "Correcto: el camino más largo es 41, 20, 29, 26 (o 41, 20, 29, 32, o 41, 65, 91, 72), tres aristas y cuatro nodos. Buscar compara con un nodo por nivel: a lo sumo h + 1 = 4, con 10 claves.",
          distractores: [
            { valores: ["3", "3"], msg: "Una búsqueda que llega al fondo compara con todos los nodos del camino, que son h + 1." },
            { valores: ["4", null], msg: "La altura se cuenta en aristas: la raíz sola tiene altura 0. El camino 41, 20, 29, 26 tiene tres aristas." },
            { valores: [null, "10"], msg: "Eso sería revisar todos los nodos. Buscar baja por un solo lado: un nodo por nivel." }
          ],
          otro: "La altura es el número de aristas del camino más largo de la raíz a una hoja." },
        { tipo: "opciones", titulo: "Espacio aparte", columna: true, correcta: "hy1",
          html: "<p>¿Qué espacio aparte piden <code>buscar</code> y <code>buscarIterativa</code> en un árbol de altura h?</p>",
          opciones: [
            { op: "hy1", texto: "buscar: O(h), un marco por nivel. buscarIterativa: O(1), la variable r.", msg: "Correcto. El tiempo es O(h) en las dos; cambia lo que ocupa la pila de llamadas." },
            { op: "nyn", texto: "Las dos O(n): pueden visitar todo el árbol.", msg: "Ninguna visita todo el árbol: bajan por un solo lado. En el peor caso h llega a n − 1, pero eso es la forma del árbol, no la búsqueda." },
            { op: "igual", texto: "Las dos O(1): ninguna crea nodos.", msg: "buscar no crea nodos, pero cada llamada recursiva deja un marco esperando en la pila: h + 1 marcos en el peor caso." }
          ] }
      ]
    };
  }

  return { claves: CLAVES, arbol: arbol, pasosBusqueda: pasosBusqueda, trazaIterativa: trazaIterativa, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
