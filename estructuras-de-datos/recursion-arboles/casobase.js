/* Ejercicio interactivo: cuatro versiones de producto que solo difieren en
   el caso base, y una altura con el vacío en 0. */
var EJERCICIO = (function () {
  var A = (typeof Arbol !== "undefined") ? Arbol : require("../comun/arbol.js");
  var N = A.N;

  var VERSIONES = {
    A: ["int productoA(Nodo *r) {",
        "  int res = 0;",
        "  if (r != NULL) {",
        "    res = r->dato * productoA(r->izq) * productoA(r->der);",
        "  }",
        "  return res;",
        "}"],
    B: ["int productoB(Nodo *r) {",
        "  int res = 1;",
        "  if (r != NULL) {",
        "    res = r->dato * productoB(r->izq) * productoB(r->der);",
        "  }",
        "  return res;",
        "}"],
    C: ["// Caso base en la hoja. Exige r != NULL.",
        "int productoC(Nodo *r) {",
        "  int res = r->dato;",
        "  if (r->izq != NULL || r->der != NULL) {",
        "    res = r->dato * productoC(r->izq) * productoC(r->der);",
        "  }",
        "  return res;",
        "}"],
    D: ["int productoD(Nodo *r) {",
        "  return r->dato * productoD(r->izq) * productoD(r->der);",
        "}"],
    H: ["int alturaCero(Nodo *r) {",
        "  int res = 0;",
        "  if (r != NULL) {",
        "    int hi = alturaCero(r->izq);",
        "    int hd = alturaCero(r->der);",
        "    if (hi > hd) {",
        "      res = 1 + hi;",
        "    } else {",
        "      res = 1 + hd;",
        "    }",
        "  }",
        "  return res;",
        "}"]
  };

  function armar() {
    var dos = N(2, N(5, null, null), null);
    var cuatro = N(4, N(1, null, null), N(6, null, null));
    return N(3, dos, cuatro);
  }

  /* Cada versión tal como está escrita. Leer un campo de NULL se marca
     lanzando "segfault", que es como termina el programa compilado. */
  function campo(r, nombre) {
    if (r === null) { throw new Error("segfault"); }
    return r[nombre];
  }
  function productoA(r) {
    var res = 0;
    if (r !== null) { res = r.dato * productoA(r.izq) * productoA(r.der); }
    return res;
  }
  function productoB(r) {
    var res = 1;
    if (r !== null) { res = r.dato * productoB(r.izq) * productoB(r.der); }
    return res;
  }
  function productoC(r) {
    var res = campo(r, "dato");
    if (campo(r, "izq") !== null || campo(r, "der") !== null) {
      res = r.dato * productoC(r.izq) * productoC(r.der);
    }
    return res;
  }
  function productoD(r) {
    return campo(r, "dato") * productoD(campo(r, "izq")) * productoD(campo(r, "der"));
  }
  function alturaCero(r) {
    var res = 0;
    if (r !== null) {
      var hi = alturaCero(r.izq);
      var hd = alturaCero(r.der);
      if (hi > hd) { res = 1 + hi; } else { res = 1 + hd; }
    }
    return res;
  }

  /* Lo que imprime el programa: el número, o "segfault" si se cae. */
  function correr(f, r) {
    var res;
    try { res = String(f(r)); } catch (e) { res = e.message; }
    return res;
  }

  function codigo(v) { return "<pre class=\"fragmento\">" + A.escapar(VERSIONES[v].join("\n")) + "</pre>"; }

  function spec() {
    var raiz = armar();
    var cuatro = raiz.der;
    var pA = correr(productoA, raiz);
    var pB = correr(productoB, raiz);
    var pB4 = correr(productoB, cuatro);
    var hHoja = alturaCero(N(9, null, null));
    var hArbol = alturaCero(raiz);
    return {
      contenedor: "tarjetas",
      cierre: "El caso base de una función sobre árboles binarios es el vacío, y su valor sale de pedir que la regla del caso recursivo dé bien en una hoja: 0 para contar y sumar, 1 para multiplicar, −1 para la altura en aristas. Si el caso base se pone en la hoja, la función se cae en el primer nodo con un solo hijo; si no hay caso base, se cae en la primera hoja.",
      cartas: [
        { tipo: "respuesta", titulo: "Un producto que siempre da lo mismo",
          html: A.binario(raiz, { titulo: "árbol de seis nodos con raíz 3" }) +
                "<p>Se quiere el producto de todos los datos del árbol. La primera versión:</p>" + codigo("A") +
                "<p>¿Qué devuelve <code>productoA</code> sobre este árbol?</p>",
          campos: [{ rotulo: "productoA(raiz):", esperado: pA, ancho: "4rem" }],
          bien: "Correcto: 0. Toda hoja multiplica su dato por productoA de dos vacíos, que valen 0, y ese 0 sube hasta la raíz. El vacío no aporta nada a una suma, pero a un producto le aporta un factor.",
          distractores: [
            { valores: [pB], msg: "Ese sería el producto de los seis datos. Siga una hoja: 5 · productoA(NULL) · productoA(NULL)." }
          ],
          otro: "Calcule primero lo que devuelve una hoja, por ejemplo la de 5." },
        { tipo: "respuesta", titulo: "El vacío en 1",
          html: "<p>La segunda versión solo cambia el valor inicial:</p>" + codigo("B") +
                "<p>¿Qué devuelve sobre el árbol completo? ¿Y sobre el subárbol de 4?</p>",
          campos: [
            { rotulo: "productoB(raiz):", esperado: pB, ancho: "5rem" },
            { rotulo: "productoB(4):", esperado: pB4, ancho: "5rem" }
          ],
          bien: "Correcto: 3 · 2 · 5 · 4 · 1 · 6 = 720, y bajo 4 queda 4 · 1 · 6 = 24. Con el vacío en 1, una hoja devuelve dato · 1 · 1, que es su dato.",
          distractores: [
            { valores: ["0", null], msg: "Esa es la versión anterior. Aquí el vacío devuelve 1, el neutro de la multiplicación." }
          ],
          otro: "Multiplique los datos de cada subárbol." },
        { tipo: "opciones", titulo: "El caso base en la hoja", columna: true, correcta: "cae",
          html: "<p>La tercera versión se detiene en la hoja, que no tiene hijos:</p>" + codigo("C") +
                "<p>¿Qué pasa con <code>productoC(raiz)</code>?</p>",
          opciones: [
            { op: "bien", texto: "Devuelve 720", msg: "Lo haría si todos los nodos tuvieran cero o dos hijos. Mire el 2: tiene hijo izquierdo y no derecho." },
            { op: "cae", texto: "El programa termina con Segmentation fault", msg: "Correcto. En el 2 el if entra porque tiene hijo izquierdo, y la llamada productoC(r->der) recibe NULL y lee NULL->dato. Compilado y corrido, el programa sale con código 139." },
            { op: "cero", texto: "Devuelve 0, porque el 2 tiene un hijo NULL", msg: "Nadie devuelve 0 aquí: la llamada sobre NULL no devuelve nada, porque se cae al leer r->dato." }
          ] },
        { tipo: "opciones", titulo: "¿Por qué acierta en el subárbol de 4?", columna: true, correcta: "lleno",
          html: "<p>Sobre el subárbol de 4, <code>productoC</code> devuelve " + correr(productoC, cuatro) + ", que es correcto. ¿Por qué ahí no se cae?</p>",
          opciones: [
            { op: "lleno", texto: "Porque cada nodo de ese subárbol tiene cero o dos hijos", msg: "Correcto. Con dos hijos, las dos llamadas reciben nodos; con cero, el if no entra. El fallo aparece solo en un nodo con un hijo." },
            { op: "par", texto: "Porque 4 es par", msg: "El dato no interviene en la condición del if: solo los punteros izq y der." },
            { op: "chico", texto: "Porque tiene pocos nodos", msg: "Un árbol de dos nodos, una raíz con un hijo, ya basta para que se caiga." }
          ] },
        { tipo: "opciones", titulo: "Sin caso base", columna: true, correcta: "hoja",
          html: "<p>La cuarta versión no tiene <code>if</code>:</p>" + codigo("D") +
                "<p>¿Qué pasa con <code>productoD(raiz)</code>?</p>",
          opciones: [
            { op: "hoja", texto: "Se cae en la primera llamada que recibe un vacío", msg: "Correcto. productoD(NULL) lee NULL->dato. Ni siquiera hace falta correrlo: al compilar, g++ -Wall -Wextra avisa infinite recursion detected, porque ningún camino del código termina sin volver a llamar." },
            { op: "720", texto: "Devuelve 720", msg: "Para multiplicar, cada llamada necesita dos llamadas más, también sobre los vacíos. Nada detiene la bajada." },
            { op: "lento", texto: "Se queda corriendo para siempre", msg: "Antes de eso, la bajada llega a un hijo NULL, la llamada lee un campo de NULL y el programa se cae." }
          ] },
        { tipo: "respuesta", titulo: "La altura con el vacío en 0",
          html: codigo("H") + "<p>Esta altura usa 0 para el vacío en lugar de −1. ¿Qué devuelve sobre una hoja? ¿Y sobre el árbol de seis nodos?</p>",
          campos: [
            { rotulo: "una hoja:", esperado: String(hHoja), ancho: "3rem" },
            { rotulo: "el árbol:", esperado: String(hArbol), ancho: "3rem" }
          ],
          bien: "Correcto: 1 en la hoja y " + hArbol + " en el árbol, cuya altura en aristas es " + A.altura(raiz) + ". Con el vacío en 0 la función cuenta los nodos del camino más largo, no sus aristas. No se cae: el caso base sigue siendo el vacío, pero el valor no es el de la definición.",
          distractores: [
            { valores: ["0", String(A.altura(raiz))], msg: "Esas son las alturas en aristas. Con el vacío en 0 la hoja da 1 + max(0, 0)." }
          ],
          otro: "Calcule primero la hoja: 1 + el mayor de dos vacíos." }
      ]
    };
  }

  return { versiones: VERSIONES, armar: armar, productoA: productoA, productoB: productoB, productoC: productoC,
           productoD: productoD, alturaCero: alturaCero, correr: correr, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
