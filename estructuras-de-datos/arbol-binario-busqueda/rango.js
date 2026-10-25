/* Ejercicio interactivo: esABB con el rango que hereda cada nodo, frente a
   la revision que solo mira a los hijos. */
var EJERCICIO = (function () {
  var A = typeof module !== "undefined" ? require("./arbol.js") : ArbolBB;
  var n = A.nodo;

  function arbol() {
    return n(44, n(26, n(13), n(37, n(30), n(47))), n(70, n(58), n(81)));
  }

  var CODIGO = [
    "bool esABBHijos(Nodo *r) {",
    "  bool res = true;",
    "  if (r != NULL) {",
    "    if (r->izq != NULL && r->izq->dato >= r->dato) {",
    "      res = false;",
    "    } else if (r->der != NULL && r->der->dato <= r->dato) {",
    "      res = false;",
    "    } else {",
    "      res = esABBHijos(r->izq) && esABBHijos(r->der);",
    "    }",
    "  }",
    "  return res;",
    "}",
    "",
    "bool esABB(Nodo *r, long long min, long long max) {",
    "  bool res = true;",
    "  if (r != NULL) {",
    "    res = min < r->dato && r->dato < max",
    "          && esABB(r->izq, min, r->dato) && esABB(r->der, r->dato, max);",
    "  }",
    "  return res;",
    "}"
  ];

  function rangoDe(rev, clave) {
    var res = null;
    rev.forEach(function (x) { if (x.dato === clave) { res = x; } });
    return res;
  }

  function spec() {
    var r = arbol();
    var rev = A.revisar(r);
    var orden = rev.revisados.map(function (x) { return x.dato; });
    var falla = orden[orden.length - 1];
    var r37 = rangoDe(rev.revisados, 37);
    var r47 = rangoDe(rev.revisados, 47);
    var nunca = A.preorden(r).filter(function (x) { return orden.indexOf(x) < 0; }).sort(function (a, b) { return a - b; });
    var rotulos = {};
    rev.revisados.forEach(function (x) {
      rotulos[x.dato] = "(" + (x.min === -Infinity ? "−∞" : x.min) + ", " + (x.max === Infinity ? "∞" : x.max) + ")";
    });
    var marcas = {};
    orden.forEach(function (x) { marcas[x] = "visto"; });
    marcas[falla] = "mal";
    nunca.forEach(function (x) { marcas[x] = "fuera"; });
    return {
      contenedor: "tarjetas",
      cierre: "<p>Cada nodo hereda un rango abierto: al bajar a la izquierda el dato del padre pasa a ser el máximo, y al bajar a la derecha, el mínimo. El 47 cumple con su padre, el 37, pero su rango es (37, 44) porque está dentro del subárbol izquierdo del 44. Así quedó la revisión, con el rango de cada nodo revisado:</p>" +
        A.svg(r, { rotulos: rotulos, marcas: marcas }) +
        "<p>El <code>&amp;&amp;</code> corta en la primera falla: el subárbol del 70 no se revisa. En el peor caso esABB visita cada nodo una vez, O(n), y pide O(h) de pila.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Las dos revisiones",
          html: A.svg(r) + A.codigo(CODIGO) + "<p>La primera llamada es <code>esABB(raiz, LLONG_MIN, LLONG_MAX)</code>. ¿Qué responde cada función con este árbol? Escriba si o no.</p>",
          campos: [
            { rotulo: "esABBHijos:", esperado: A.esABBHijos(r) ? "si" : "no", ancho: "3rem" },
            { rotulo: "esABB:", esperado: rev.esABB ? "si" : "no", ancho: "3rem" }
          ],
          bien: "Correcto: cada nodo cumple con sus hijos, así que esABBHijos responde si y se equivoca. El 47 está en el subárbol izquierdo del 44 y es mayor que 44.",
          distractores: [
            { valores: ["no", null], msg: "Revise nodo por nodo contra sus dos hijos: 44 con 26 y 70, 26 con 13 y 37, 37 con 30 y 47, 70 con 58 y 81. Todos cumplen." },
            { valores: [null, "si"], msg: "Busque una clave del subárbol izquierdo del 44 que no sea menor que 44." }
          ],
          otro: "Escriba si o no en cada casilla." },
        { tipo: "respuesta", titulo: "El rango de dos nodos",
          html: "<p>¿Con qué <code>min</code> y <code>max</code> llega la llamada al nodo del 37? ¿Y al del 47?</p>",
          campos: [
            { rotulo: "37: min", esperado: String(r37.min), ancho: "3rem" },
            { rotulo: "max", esperado: String(r37.max), ancho: "3rem" },
            { rotulo: "47: min", esperado: String(r47.min), ancho: "3rem" },
            { rotulo: "max", esperado: String(r47.max), ancho: "3rem" }
          ],
          bien: "Correcto: al 37 se llega bajando a la izquierda del 44 (max 44) y a la derecha del 26 (min 26). El 47 hereda el max 44 y toma como min a su padre, el 37: (37, 44), y 47 no cabe.",
          distractores: [
            { valores: [null, null, "37", "∞"], msg: "Al bajar a la derecha del 37 solo cambia el min. El max 44 viene de más arriba y se conserva." },
            { valores: [null, null, null, "70"], msg: "El 70 está en el otro subárbol. Lo que acota al 47 por arriba es el 44, porque el 47 cuelga a su izquierda." }
          ],
          otro: "Baje desde la raíz: a la izquierda, max pasa a ser el dato del padre; a la derecha, min pasa a ser el dato del padre." },
        { tipo: "respuesta", titulo: "Hasta dónde llega",
          html: "<p>Cuente las llamadas de <code>esABB</code> que reciben un nodo (r distinto de NULL) antes de que la primera llamada devuelva su respuesta. ¿Cuántas son y en qué nodo se descubre la falla?</p>",
          campos: [
            { rotulo: "nodos revisados:", esperado: String(orden.length), ancho: "3rem" },
            { rotulo: "falla en el", esperado: String(falla), ancho: "3.5rem" }
          ],
          bien: "Correcto: revisa " + orden.join(", ") + ". En el 47 la condición 47 < 44 es falsa, la llamada devuelve false y cada && de arriba corta sin llamar al subárbol derecho.",
          distractores: [
            { valores: ["9", null], msg: "El && no evalúa lo que sigue cuando ya tiene un false: después del 47 nadie llama al subárbol del 70." },
            { valores: [null, "37"], msg: "El 37 está en su rango, (26, 44). El que se sale es su hijo derecho." }
          ],
          otro: "Recorra en preorden y deténgase en el primer nodo fuera de su rango." },
        { tipo: "respuesta", titulo: "Una sola clave para arreglarlo",
          html: "<p>Se quiere cambiar solo la clave 47 por otro entero para que el árbol sea ABB. ¿Cuál es el menor valor posible y cuál el mayor?</p>",
          campos: [
            { rotulo: "desde", esperado: String(r47.min + 1), ancho: "3rem" },
            { rotulo: "hasta", esperado: String(r47.max - 1), ancho: "3rem" }
          ],
          bien: "Correcto: el rango abierto (37, 44) deja los enteros de 38 a 43.",
          distractores: [
            { valores: ["38", "69"], msg: "El tope no lo pone el 70: el nodo está en el subárbol izquierdo del 44." },
            { valores: ["37", "44"], msg: "El rango es abierto y las claves son distintas: ni 37 ni 44 pueden repetirse." }
          ],
          otro: "Es el rango que hereda ese nodo, sin los extremos." },
        { tipo: "opciones", titulo: "Lo que cuesta", columna: true, correcta: "nh",
          html: "<p>Con un árbol de n nodos y altura h que sí es ABB, ¿qué cuesta <code>esABB</code>?</p>",
          opciones: [
            { op: "nh", texto: "Tiempo Θ(n) y espacio aparte O(h).", msg: "Correcto. Si el árbol es ABB, ningún && corta y se revisa cada nodo una vez; la pila llega a un marco por nivel." },
            { op: "hh", texto: "Tiempo O(h), como buscar.", msg: "buscar baja por un solo lado. esABB tiene que mirar los dos subárboles de cada nodo." },
            { op: "nn", texto: "Tiempo Θ(n²): cada nodo se compara con todo su subárbol.", msg: "Eso haría una versión que recorra el subárbol entero en cada nodo. Con el rango, cada nodo se compara con dos números y basta." }
          ] }
      ]
    };
  }

  return { arbol: arbol, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
