/* Ejercicio interactivo: decidir si un arbol binario es ABB mirando cada
   subarbol completo, y lo que dice su inorden. */
var EJERCICIO = (function () {
  var A = typeof module !== "undefined" ? require("./arbol.js") : ArbolBB;
  var n = A.nodo;

  /* Los cuatro arboles, armados a mano porque no todos son ABB. */
  function arboles() {
    return {
      t1: n(20, n(12, n(6), n(15)), n(30, n(18), n(35))),
      t2: n(50, n(40, n(35), n(45, n(42), n(48))), n(65, null, n(70))),
      t3: n(10, null, n(40, n(20, null, n(30)), null)),
      t4: n(27, n(14, n(8), n(19)), n(35, n(40), n(52)))
    };
  }

  /* El arbol con dos huecos: A y B son nodos cuya clave se pregunta. */
  var HUECO_A = 1000, HUECO_B = 1001;
  function conHuecos() {
    return n(40, n(25, n(10), n(HUECO_A)), n(60, n(HUECO_B), n(75)));
  }

  /* El rango que hereda un nodo: se baja desde la raiz por el camino que lo
     contiene y en cada paso se ajusta min o max. */
  function rango(raiz, objetivo) {
    var res = null;
    function bajar(x, min, max) {
      if (x !== null && res === null) {
        if (x === objetivo) {
          res = { min: min, max: max };
        } else {
          bajar(x.izq, min, x.dato);
          bajar(x.der, x.dato, max);
        }
      }
    }
    bajar(raiz, -Infinity, Infinity);
    return res;
  }

  function spec() {
    var t = arboles();
    var ino1 = A.inorden(t.t1);
    var fuera = [];
    ino1.forEach(function (x, i) { if (i > 0 && ino1[i - 1] > x) { fuera = [ino1[i - 1], x]; } });
    var h = conHuecos();
    var rA = rango(h, h.izq.der);
    var rB = rango(h, h.der.izq);
    var dibujoHuecos = A.svg(h, { textos: { 1000: "A", 1001: "B" }, marcas: { 1000: "resal", 1001: "resal" } });
    return {
      contenedor: "tarjetas",
      cierre: "<p>Un árbol binario es ABB cuando en cada nodo todo su subárbol izquierdo es menor y todo su subárbol derecho es mayor. Revisar cada nodo contra sus dos hijos deja pasar árboles como el primero, donde el 18 cumple con su padre 30 pero no con su abuelo 20. La forma no cuenta: el camino en zigzag 10, 40, 20, 30 es un ABB, y al 65 le puede faltar un hijo.</p><p>Cada nodo hereda un rango abierto: al bajar a la izquierda, el padre pasa a ser el máximo; a la derecha, el mínimo. Por eso el hueco A admite de 26 a 39 y no cualquier clave mayor que 25. El inorden lo resume: el árbol es ABB exactamente cuando su inorden sale estrictamente creciente.</p>",
      cartas: [
        { tipo: "opciones", titulo: "Primer árbol", columna: true, correcta: "no18",
          html: A.svg(t.t1) + "<p>¿Es un árbol binario de búsqueda?</p>",
          opciones: [
            { op: "si", texto: "Sí: cada nodo es mayor que su hijo izquierdo y menor que su hijo derecho.", msg: "Eso solo revisa a los hijos. El 18 está en el subárbol derecho del 20 y es menor que 20; a la derecha del 20 todo debe ser mayor." },
            { op: "no18", texto: "No: el 18 está en el subárbol derecho del 20 y es menor que 20.", msg: "Correcto. El 18 cumple con su padre, el 30, pero la regla habla de todo el subárbol del 20." },
            { op: "no15", texto: "No: el 15 es mayor que el 12, así que debería estar a la derecha del 20.", msg: "El 15 es mayor que 12 y menor que 20: le corresponde estar a la derecha del 12 y dentro del subárbol izquierdo del 20, que es donde está." }
          ] },
        { tipo: "opciones", titulo: "Segundo árbol", columna: true, correcta: "si",
          html: A.svg(t.t2) + "<p>¿Es un árbol binario de búsqueda?</p>",
          opciones: [
            { op: "si", texto: "Sí.", msg: "Correcto: a la izquierda del 50 están 35, 40, 42, 45 y 48, todos menores; a la derecha, 65 y 70. Debajo del 45, el 42 y el 48 quedan entre 40 y 50." },
            { op: "no65", texto: "No: al 65 le falta el hijo izquierdo.", msg: "La definición no pide que cada nodo tenga dos hijos. Un subárbol vacío no tiene claves que rompan la regla." },
            { op: "no42", texto: "No: el 42 es menor que el 45 y está en el subárbol derecho del 40.", msg: "En el subárbol derecho del 40 hay que ser mayor que 40, y 42 lo es. Ser menor que 45 es lo que pide su lugar a la izquierda del 45." }
          ] },
        { tipo: "opciones", titulo: "Tercer árbol", columna: true, correcta: "si",
          html: A.svg(t.t3) + "<p>¿Es un árbol binario de búsqueda?</p>",
          opciones: [
            { op: "zig", texto: "No: un ABB no puede tener un camino que va y vuelve en zigzag.", msg: "La forma no está en la definición. 40 > 10 va a la derecha del 10; 20 queda entre 10 y 40; 30 queda entre 20 y 40. Cada clave está en su rango." },
            { op: "si", texto: "Sí.", msg: "Correcto. Tiene la altura de una lista, pero cumple la regla en cada nodo. Es el árbol que deja insertar 10, 40, 20 y 30 en ese orden." },
            { op: "no30", texto: "No: el 30 es menor que el 40 y está debajo de él.", msg: "El 30 está en el subárbol izquierdo del 40, donde todo debe ser menor que 40. Y 30 < 40." }
          ] },
        { tipo: "opciones", titulo: "Cuarto árbol", columna: true, correcta: "no40",
          html: A.svg(t.t4) + "<p>¿Es un árbol binario de búsqueda?</p>",
          opciones: [
            { op: "si", texto: "Sí: todo el subárbol derecho de la raíz es mayor que 27.", msg: "Eso se cumple en la raíz, pero la regla vale en cada nodo. En el 35, su hijo izquierdo es el 40, que es mayor." },
            { op: "no40", texto: "No: el 40 es hijo izquierdo del 35 y es mayor que 35.", msg: "Correcto. Aquí basta con mirar a los hijos para verlo; en el primer árbol no bastaba." },
            { op: "no52", texto: "No: el 52 debería ser hijo del 40.", msg: "52 > 35 lo manda a la derecha del 35, que es donde está. El que sobra es el 40, a la izquierda del 35." }
          ] },
        { tipo: "respuesta", titulo: "Lo que dice el inorden",
          html: "<p>Escriba el inorden del primer árbol y la pareja de claves vecinas en ese inorden que queda en el orden equivocado.</p>",
          campos: [
            { rotulo: "inorden:", esperado: ino1.join(" "), pista: "a b c …", ancho: "13rem" },
            { rotulo: "pareja:", esperado: fuera.join(" "), pista: "x y", ancho: "5rem" }
          ],
          bien: "Correcto: " + ino1.join(" ") + ". El 20 sale antes que el 18 porque el 18 está a su derecha. En un ABB el inorden sale creciente; aquí no, y por eso no es ABB.",
          distractores: [
            { valores: ["6 12 15 18 20 30 35", null], msg: "Esas son las claves ordenadas, no el recorrido. El inorden visita el 20 y después todo su subárbol derecho, donde está el 18." },
            { valores: ["20 12 6 15 30 18 35", null], msg: "Ese es el preorden: raíz primero. El inorden visita el subárbol izquierdo, después la raíz y después el derecho." }
          ],
          otro: "Recorra el subárbol izquierdo del 20, después el 20, después su subárbol derecho, y dentro de cada uno igual." },
        { tipo: "respuesta", titulo: "Dos huecos",
          html: dibujoHuecos + "<p>El árbol es ABB, con claves enteras distintas, y le faltan dos claves, A y B. ¿Cuál es la menor y cuál la mayor que puede ir en cada hueco?</p>",
          campos: [
            { rotulo: "A desde", esperado: String(rA.min + 1), ancho: "3rem" },
            { rotulo: "hasta", esperado: String(rA.max - 1), ancho: "3rem" },
            { rotulo: "B desde", esperado: String(rB.min + 1), ancho: "3rem" },
            { rotulo: "hasta", esperado: String(rB.max - 1), ancho: "3rem" }
          ],
          bien: "Correcto: A está a la derecha del 25 y dentro del subárbol izquierdo del 40, así que va de 26 a 39. B está a la izquierda del 60 y dentro del subárbol derecho del 40: de 41 a 59.",
          distractores: [
            { valores: ["26", "59", null, null], msg: "A tiene que ser mayor que 25, pero además está en el subárbol izquierdo del 40: no puede pasar de 39." },
            { valores: ["11", null, null, null], msg: "A es hijo derecho del 25, no del 10. Tiene que ser mayor que 25." },
            { valores: [null, null, "26", null], msg: "B está en el subárbol derecho del 40: tiene que ser mayor que 40." }
          ],
          otro: "Baje desde la raíz hasta cada hueco. Cada vez que baja a la izquierda, el nodo de arriba es un tope por encima; cada vez que baja a la derecha, un tope por debajo." },
        { tipo: "opciones", titulo: "Una revisión que no falla", columna: true, correcta: "inorden",
          html: "<p>¿Cuál de estas revisiones decide bien, para cualquier árbol binario con claves distintas, si es ABB?</p>",
          opciones: [
            { op: "hijos", texto: "En cada nodo, el hijo izquierdo es menor y el derecho es mayor.", msg: "El primer árbol pasa esa revisión y no es ABB." },
            { op: "inorden", texto: "El inorden sale estrictamente creciente.", msg: "Correcto. Si es ABB, el inorden sale ordenado; y si alguna clave está fuera de su rango, aparece fuera de lugar en el inorden, como el 18." },
            { op: "raiz", texto: "La raíz es mayor que todo su subárbol izquierdo y menor que todo el derecho.", msg: "Eso revisa solo la raíz. El cuarto árbol lo cumple y falla en el 35." }
          ] }
      ]
    };
  }

  return { arboles: arboles, conHuecos: conHuecos, rango: rango, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
