/* Ejercicio interactivo: en qué orden borra liberar y qué falla cuando el
   delete va antes de bajar a los hijos. */
var EJERCICIO = (function () {
  var A = (typeof Arbol !== "undefined") ? Arbol : require("../comun/arbol.js");
  var N = A.N;

  var LIBERAR = [
    "// Libera en posorden: los hijos antes que el padre.",
    "void liberar(Nodo *r) {",
    "  if (r != NULL) {",
    "    liberar(r->izq);",
    "    liberar(r->der);",
    "    delete r;",
    "  }",
    "}"].join("\n");

  var ANTES = [
    "void liberarAntes(Nodo *r) {",
    "  if (r != NULL) {",
    "    delete r;",
    "    liberarAntes(r->izq);",
    "    liberarAntes(r->der);",
    "  }",
    "}"].join("\n");

  var ENMEDIO = [
    "void liberarEnMedio(Nodo *r) {",
    "  if (r != NULL) {",
    "    liberarEnMedio(r->izq);",
    "    delete r;",
    "    liberarEnMedio(r->der);",
    "  }",
    "}"].join("\n");

  var GUARDANDO = [
    "void liberarGuardando(Nodo *r) {",
    "  if (r != NULL) {",
    "    Nodo *i = r->izq;",
    "    Nodo *d = r->der;",
    "    delete r;",
    "    liberarGuardando(i);",
    "    liberarGuardando(d);",
    "  }",
    "}"].join("\n");

  function armar() {
    var veintidos = N(22, N(18, null, null), null);
    var treintaCinco = N(35, N(11, null, null), N(27, null, null));
    return N(40, veintidos, treintaCinco);
  }

  /* liberar tal como está escrita: el delete de cada nodo se anota en el
     orden en que ocurre, y se cuentan las llamadas. */
  function liberar(r, borrados, cuenta) {
    cuenta.llamadas = cuenta.llamadas + 1;
    if (r !== null) {
      liberar(r.izq, borrados, cuenta);
      liberar(r.der, borrados, cuenta);
      borrados.push(r.dato);
    }
  }

  function liberarGuardando(r, borrados) {
    if (r !== null) {
      var i = r.izq;
      var d = r.der;
      borrados.push(r.dato);
      liberarGuardando(i, borrados);
      liberarGuardando(d, borrados);
    }
  }

  function pre(c) { return "<pre class=\"fragmento\">" + A.escapar(c) + "</pre>"; }

  function spec() {
    var raiz = armar();
    var n = A.tamano(raiz);
    var borrados = [];
    var cuenta = { llamadas: 0 };
    liberar(raiz, borrados, cuenta);
    var guardando = [];
    liberarGuardando(armar(), guardando);
    return {
      contenedor: "tarjetas",
      cierre: "liberar borra en posorden porque un nodo es el único camino hacia sus hijos: si se borra antes de bajar, la bajada lee memoria que ya se devolvió. Es Θ(n) en tiempo, un delete por nodo y 2n + 1 llamadas, y O(h) de pila. Borrar primero también se puede, siempre que los dos hijos se guarden en variables antes del delete.",
      cartas: [
        { tipo: "respuesta", titulo: "El orden de los delete",
          html: A.binario(raiz, { titulo: "árbol de seis nodos con raíz 40" }) + pre(LIBERAR) +
                "<p>¿En qué orden se borran los nodos al llamar <code>liberar(raiz)</code>?</p>",
          campos: [{ rotulo: "orden:", esperado: borrados.join(" "), ancho: "11rem" }],
          bien: "Correcto: " + borrados.join(" ") + ", el posorden. Cada nodo se borra cuando sus dos subárboles ya no existen, y la raíz de última.",
          distractores: [
            { valores: [A.preorden(raiz).join(" ")], msg: "Ese es el preorden. El delete va después de las dos llamadas." },
            { valores: ["18 11 27 22 35 40"], msg: "liberar no va por niveles: termina todo el subárbol de 22 antes de entrar al de 35." }
          ],
          otro: "Baje al subárbol izquierdo completo, después al derecho, y borre la raíz al final." },
        { tipo: "respuesta", titulo: "Llamadas y delete",
          html: "<p>¿Cuántas veces se llama <code>liberar</code>, contando la primera? ¿Cuántos <code>delete</code> se ejecutan?</p>",
          campos: [
            { rotulo: "llamadas:", esperado: String(cuenta.llamadas), ancho: "3.5rem" },
            { rotulo: "delete:", esperado: String(borrados.length), ancho: "3.5rem" }
          ],
          bien: "Correcto: " + n + " llamadas sobre nodos y " + (n + 1) + " sobre vacíos, y un delete por nodo.",
          distractores: [
            { valores: [String(n), null], msg: "También se llama sobre cada vacío, " + (n + 1) + " veces, aunque esas llamadas no hacen nada." }
          ],
          otro: "Una llamada por nodo y una por vacío; un delete por nodo." },
        { tipo: "opciones", titulo: "Borrar antes de bajar", columna: true, correcta: "lee",
          html: pre(ANTES) + "<p>¿Qué pasa con esta versión?</p>",
          opciones: [
            { op: "igual", texto: "Nada: borra los mismos seis nodos, en preorden", msg: "Después de delete r el nodo ya no es del programa, y la línea siguiente lee r->izq de él. Puede salir bien en una prueba y fallar en la siguiente." },
            { op: "lee", texto: "Lee r->izq y r->der de un nodo ya devuelto: el resultado no está definido", msg: "Correcto. La memoria devuelta puede reutilizarse o sobrescribirse en cualquier momento. Compilado y corrido sobre este árbol, el programa aborta con free(): invalid pointer, y valgrind marca Invalid read en r->izq." },
            { op: "compila", texto: "No compila", msg: "Compila sin advertencias: el compilador no sigue qué punteros ya se borraron." }
          ] },
        { tipo: "opciones", titulo: "Borrar entre las dos bajadas", columna: true, correcta: "der",
          html: pre(ENMEDIO) + "<p>¿Dónde está el problema de esta versión?</p>",
          opciones: [
            { op: "izq", texto: "En liberarEnMedio(r->izq): el hijo izquierdo ya no existe", msg: "Esa llamada va antes del delete, cuando r todavía es válido." },
            { op: "der", texto: "En liberarEnMedio(r->der): lee r->der después de delete r", msg: "Correcto. El izquierdo se recorre bien, pero el derecho se busca en un nodo que ya se devolvió. Corrido sobre este árbol el programa termina sin quejarse, y valgrind marca Invalid read: que una prueba pase no quiere decir que funcione." },
            { op: "nada", texto: "No tiene problema: es un inorden", msg: "Un inorden imprime bien, pero aquí la visita borra el nodo, y la bajada a la derecha lo necesita después." }
          ] },
        { tipo: "opciones", titulo: "Guardar los hijos primero", columna: true, correcta: "sirve",
          html: pre(GUARDANDO) + "<p>¿Sirve esta versión?</p>",
          opciones: [
            { op: "sirve", texto: "Sí: borra en preorden, " + guardando.join(" ") + ", sin leer memoria devuelta", msg: "Correcto. Los dos punteros se copian antes del delete, y las llamadas usan las copias. Es la idea de liberarPila: apilar los hijos antes de borrar." },
            { op: "pos", texto: "No: un árbol solo se puede liberar en posorden", msg: "El posorden es lo más directo, pero lo que importa es no leer un nodo borrado. Aquí nadie lo lee." },
            { op: "pierde", texto: "No: se pierden los hijos al borrar el padre", msg: "Los hijos no se borran con el padre; lo que se pierde es el camino hacia ellos, y i y d lo guardan." }
          ] }
      ]
    };
  }

  return { armar: armar, liberar: liberar, liberarGuardando: liberarGuardando, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
