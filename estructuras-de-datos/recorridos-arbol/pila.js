/* Ejercicio interactivo: preordenPila, inordenPila y posordenPila vuelta
   por vuelta sobre un árbol de siete nodos. */
var EJERCICIO = (function () {
  var A = (typeof Arbol !== "undefined") ? Arbol : require("../comun/arbol.js");
  var N = A.N;

  var PREORDEN = [
    "void preordenPila(Nodo *r) {",
    "  Pila p;",
    "  if (r != NULL) {",
    "    p.apilar(r);",
    "  }",
    "  while (!p.vacia()) {",
    "    Nodo *x = p.tope();",
    "    p.desapilar();",
    "    printf(\"%d \", x->dato);",
    "    if (x->der != NULL) {",
    "      p.apilar(x->der);",
    "    }",
    "    if (x->izq != NULL) {",
    "      p.apilar(x->izq);",
    "    }",
    "  }",
    "}"].join("\n");

  var INORDEN = [
    "void inordenPila(Nodo *r) {",
    "  Pila p;",
    "  Nodo *actual = r;",
    "  while (actual != NULL || !p.vacia()) {",
    "    if (actual != NULL) {",
    "      p.apilar(actual);",
    "      actual = actual->izq;",
    "    } else {",
    "      actual = p.tope();",
    "      p.desapilar();",
    "      printf(\"%d \", actual->dato);",
    "      actual = actual->der;",
    "    }",
    "  }",
    "}"].join("\n");

  var POSORDEN = [
    "void posordenPila(Nodo *r) {",
    "  Pila p1;",
    "  Pila p2;",
    "  if (r != NULL) {",
    "    p1.apilar(r);",
    "  }",
    "  while (!p1.vacia()) {",
    "    Nodo *x = p1.tope();",
    "    p1.desapilar();",
    "    p2.apilar(x);",
    "    if (x->izq != NULL) {",
    "      p1.apilar(x->izq);",
    "    }",
    "    if (x->der != NULL) {",
    "      p1.apilar(x->der);",
    "    }",
    "  }",
    "  while (!p2.vacia()) {",
    "    printf(\"%d \", p2.tope()->dato);",
    "    p2.desapilar();",
    "  }",
    "}"].join("\n");

  function armar() {
    var tres = N(3, N(9, null, null), N(13, null, null));
    var ocho = N(8, null, tres);
    var veintiuno = N(21, N(17, null, null), null);
    return N(15, ocho, veintiuno);
  }

  /* La pila se guarda en un arreglo con el tope al final y se muestra con
     el tope a la izquierda. */
  function verPila(p) { return p.length === 0 ? "vacía" : p.map(function (x) { return x.dato; }).reverse().join(" "); }

  /* primeroIzq = false es el código de arriba; true apila el izquierdo
     antes que el derecho. */
  function preordenPila(r, primeroIzq) {
    var p = [];
    var salida = [];
    var filas = [];
    var maxi = 0;
    if (r !== null) { p.push(r); }
    filas.push({ vuelta: "inicio", saca: "", apila: r !== null ? String(r.dato) : "", pila: verPila(p), salida: "" });
    var vuelta = 0;
    while (p.length > 0) {
      vuelta = vuelta + 1;
      var x = p.pop();
      salida.push(x.dato);
      var apila = [];
      var orden = primeroIzq ? [x.izq, x.der] : [x.der, x.izq];
      orden.forEach(function (h) {
        if (h !== null) { p.push(h); apila.push(h.dato); }
      });
      if (p.length > maxi) { maxi = p.length; }
      filas.push({ vuelta: String(vuelta), saca: String(x.dato), apila: apila.join(", "), pila: verPila(p), salida: salida.join(" ") });
    }
    return { salida: salida, filas: filas, vueltas: vuelta, maxi: maxi };
  }

  function inordenPila(r) {
    var p = [];
    var salida = [];
    var filas = [];
    var maxi = 0;
    var actual = r;
    var vuelta = 0;
    while (actual !== null || p.length > 0) {
      vuelta = vuelta + 1;
      var fila = { vuelta: String(vuelta), actual: actual === null ? "NULL" : String(actual.dato) };
      if (actual !== null) {
        p.push(actual);
        actual = actual.izq;
        fila.hace = "apila, baja a " + (actual === null ? "NULL" : actual.dato);
        fila.imprime = "";
      } else {
        actual = p.pop();
        salida.push(actual.dato);
        fila.imprime = String(actual.dato);
        actual = actual.der;
        fila.hace = "saca " + fila.imprime + ", va a " + (actual === null ? "NULL" : actual.dato);
      }
      if (p.length > maxi) { maxi = p.length; }
      fila.pila = verPila(p);
      filas.push(fila);
    }
    return { salida: salida, filas: filas, vueltas: vuelta, maxi: maxi };
  }

  function posordenPila(r) {
    var p1 = [];
    var p2 = [];
    var filas = [];
    var entran = [];
    if (r !== null) { p1.push(r); }
    filas.push({ vuelta: "inicio", saca: "", apila: r !== null ? String(r.dato) : "", p1: verPila(p1), p2: verPila(p2) });
    var vuelta = 0;
    while (p1.length > 0) {
      vuelta = vuelta + 1;
      var x = p1.pop();
      p2.push(x);
      entran.push(x.dato);
      var apila = [];
      [x.izq, x.der].forEach(function (h) {
        if (h !== null) { p1.push(h); apila.push(h.dato); }
      });
      filas.push({ vuelta: String(vuelta), saca: String(x.dato), apila: apila.join(", "), p1: verPila(p1), p2: verPila(p2) });
    }
    var maxP2 = p2.length;
    var salida = [];
    while (p2.length > 0) { salida.push(p2.pop().dato); }
    return { salida: salida, filas: filas, entran: entran, maxP2: maxP2 };
  }

  function pre(c) { return "<pre class=\"fragmento\">" + A.escapar(c) + "</pre>"; }

  function spec() {
    var raiz = armar();
    var n = A.tamano(raiz);
    var pr = preordenPila(raiz, false);
    var al = preordenPila(raiz, true);
    var ino = inordenPila(raiz);
    var po = posordenPila(raiz);
    var tras3 = pr.filas[3];
    return {
      contenedor: "tarjetas",
      cierre: "Las versiones con pila imprimen lo mismo que las recursivas y guardan en una pila propia, hecha con new, lo que la recursión guardaba en la pila de llamadas. preordenPila e inordenPila guardan a lo sumo un camino del árbol, O(h); posordenPila llena p2 con los n nodos antes de imprimir el primero, Θ(n). Las tres hacen Θ(n) vueltas.",
      cartas: [
        { tipo: "respuesta", titulo: "preordenPila hasta la vuelta 3",
          html: A.binario(raiz, { titulo: "árbol de siete nodos con raíz 15" }) + pre(PREORDEN) +
                "<p>Cada vuelta del <code>while</code> saca un nodo, lo imprime y apila sus hijos. Después de la vuelta 3, ¿qué hay en la pila, con el tope a la izquierda? ¿Qué se ha impreso?</p>",
          campos: [
            { rotulo: "pila:", esperado: tras3.pila, ancho: "8rem", pista: "tope ..." },
            { rotulo: "salida:", esperado: tras3.salida, ancho: "8rem" }
          ],
          bien: "Correcto. La vuelta 1 saca 15 y apila 21 y después 8; la 2 saca 8, que solo tiene derecho, y apila 3; la 3 saca 3 y apila 13 y después 9. El 21 espera en el fondo desde la primera vuelta.",
          distractores: [
            { valores: ["13 9 21", null], msg: "El derecho entra primero y el izquierdo después, así que el izquierdo queda en el tope: 9 antes que 13." },
            { valores: [null, "15 8 21"], msg: "Tras sacar 15, el tope es 8, no 21: el izquierdo entró de último." }
          ],
          otro: "Siga el código: en cada vuelta se saca el tope, se imprime y se apilan primero el derecho y luego el izquierdo." },
        { tipo: "tabla", titulo: "preordenPila completo",
          cabecera: ["Vuelta", "Saca e imprime", "Apila", "Pila después", "Salida"],
          filas: pr.filas.map(function (f) { return [f.vuelta, f.saca, f.apila, f.pila, f.salida]; }),
          nota: "Siete vueltas, una por nodo, y la pila nunca pasa de " + pr.maxi + " nodos. La salida es el preorden." },
        { tipo: "respuesta", titulo: "inordenPila: vueltas y tamaño",
          html: pre(INORDEN) + "<p>Cada vuelta hace una de dos cosas: apila <code>actual</code> y baja a la izquierda, o saca el tope, lo imprime y sigue por su derecha. Sobre el mismo árbol, ¿cuántas vueltas da el <code>while</code>? ¿Cuántos nodos llega a tener la pila a la vez? ¿Qué imprime?</p>",
          campos: [
            { rotulo: "vueltas:", esperado: String(ino.vueltas), ancho: "3.5rem" },
            { rotulo: "pila máxima:", esperado: String(ino.maxi), ancho: "3.5rem" },
            { rotulo: "salida:", esperado: ino.salida.join(" "), ancho: "11rem" }
          ],
          bien: "Correcto. Cada nodo entra una vez y sale una vez: 2n = " + ino.vueltas + " vueltas. La pila llega a 3 con 15, 3 y 9, el camino hacia el 9. La salida es el inorden.",
          distractores: [
            { valores: [String(n), null, null], msg: "En una vuelta un nodo entra a la pila o sale de ella, no las dos cosas: son dos vueltas por nodo." },
            { valores: [null, "4", null], msg: "Cuando se baja de 3 a 9, el 8 ya salió: se sacó para seguir por su derecho." }
          ],
          otro: "Cuente las vueltas que apilan y las que sacan: cada nodo hace una de cada una." },
        { tipo: "tabla", titulo: "inordenPila, vuelta por vuelta",
          cabecera: ["Vuelta", "actual", "Hace", "Pila después", "Imprime"],
          filas: ino.filas.map(function (f) { return [f.vuelta, f.actual, f.hace, f.pila, f.imprime]; }),
          nota: "En la vuelta 10 la pila queda vacía y actual es 21: por eso la condición del while lleva un ||." },
        { tipo: "respuesta", titulo: "posordenPila: lo que entra a p2",
          html: pre(POSORDEN) + "<p>¿En qué orden entran los nodos a <code>p2</code>? ¿Cuántos nodos tiene <code>p2</code> antes de imprimir el primero?</p>",
          campos: [
            { rotulo: "entran a p2:", esperado: po.entran.join(" "), ancho: "11rem" },
            { rotulo: "nodos en p2:", esperado: String(po.maxP2), ancho: "3.5rem" }
          ],
          bien: "Correcto: " + po.entran.join(" ") + ", raíz, derecho, izquierdo. Al vaciar p2 sale al revés, " + po.salida.join(" ") + ", que es el posorden. p2 guarda los " + n + " nodos: espacio aparte Θ(n).",
          distractores: [
            { valores: [po.salida.join(" "), null], msg: "Ese es el orden en que salen de p2, que es el posorden. Entran al revés." },
            { valores: [null, "3"], msg: "Esa es p1 en su momento más lleno. p2 no saca nada hasta que p1 se vacía." }
          ],
          otro: "En cada vuelta el nodo que sale de p1 pasa a p2, y p1 recibe primero el izquierdo y luego el derecho, así que el derecho sale antes." },
        { tipo: "tabla", titulo: "posordenPila, vuelta por vuelta",
          cabecera: ["Vuelta", "Saca de p1", "Apila en p1", "p1 después", "p2 después"],
          filas: po.filas.map(function (f) { return [f.vuelta, f.saca, f.apila, f.p1, f.p2]; }),
          nota: "Al final p2 tiene, del tope al fondo, " + po.salida.join(" ") + "." },
        { tipo: "respuesta", titulo: "preordenPila con los hijos cruzados",
          html: "<p>En <code>preordenPila</code> se cambian de lugar los dos <code>if</code>: ahora se apila primero el izquierdo y después el derecho. ¿Qué imprime?</p>",
          campos: [{ rotulo: "salida:", esperado: al.salida.join(" "), ancho: "11rem" }],
          bien: "Correcto: " + al.salida.join(" ") + ", raíz, derecho, izquierdo. Es el orden en que entran los nodos a p2, y al revés es el posorden: lo que hace posordenPila es justo este recorrido seguido de una inversión.",
          distractores: [
            { valores: [pr.salida.join(" ")], msg: "Ese es el preorden. Con el izquierdo apilado primero, el derecho queda en el tope y sale antes." },
            { valores: [po.salida.join(" ")], msg: "Ese es el posorden. Este recorrido imprime cada nodo al sacarlo, antes que sus hijos: la raíz sale primera." }
          ],
          otro: "Siga la pila: tras sacar 15 quedan 8 abajo y 21 en el tope." },
        { tipo: "opciones", titulo: "Espacio aparte", columna: true, correcta: "pos",
          html: "<p>Sobre un árbol lleno de un millón de nodos, ¿cuál de las tres versiones necesita una pila con espacio para todos los nodos?</p>",
          opciones: [
            { op: "pre", texto: "preordenPila", msg: "Guarda a lo sumo un hijo derecho pendiente por nivel más el nodo actual: O(h), unos 20 nodos en un árbol lleno de un millón." },
            { op: "in", texto: "inordenPila", msg: "Guarda el camino de nodos que esperan su turno, O(h)." },
            { op: "pos", texto: "posordenPila", msg: "Correcto. p2 recibe los n nodos antes de imprimir el primero: Θ(n) de espacio aparte, contra O(h) de la recursiva." }
          ] }
      ]
    };
  }

  return { armar: armar, preordenPila: preordenPila, inordenPila: inordenPila, posordenPila: posordenPila, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
