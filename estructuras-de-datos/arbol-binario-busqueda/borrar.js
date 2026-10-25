/* Ejercicio interactivo: los tres casos de borrar, con el sucesor, y
   borrar marco por marco. */
var EJERCICIO = (function () {
  var A = typeof module !== "undefined" ? require("./arbol.js") : ArbolBB;
  var CLAVES = [47, 23, 76, 12, 35, 61, 88, 29, 41, 68, 38];

  function arbol() {
    return A.armar(CLAVES);
  }

  function hijos(r, k) {
    var x = r;
    while (x !== null && x.dato !== k) { x = k < x.dato ? x.izq : x.der; }
    return (x.izq !== null ? 1 : 0) + (x.der !== null ? 1 : 0);
  }

  function trasBorrar(k) {
    return A.preorden(A.borrar(arbol(), k));
  }

  function trasBorrarPred(k) {
    return A.preorden(A.borrarPred(arbol(), k));
  }

  function sucesor(k) {
    var x = arbol();
    while (x.dato !== k) { x = k < x.dato ? x.izq : x.der; }
    return A.minimo(x.der).dato;
  }

  /* borrar(raiz, k) marco por marco: lo que hace cada marco y lo que devuelve. */
  function marcos(k) {
    var filas = [];
    function borrarT(r, clave) {
      var res = r;
      var fila = null;
      if (r !== null) {
        fila = [String(filas.length + 1), String(r.dato), "", ""];
        filas.push(fila);
        if (clave < r.dato) {
          fila[2] = clave + " < " + r.dato + ": r->izq = borrar(r->izq, " + clave + ")";
          r.izq = borrarT(r.izq, clave);
        } else if (clave > r.dato) {
          fila[2] = clave + " > " + r.dato + ": r->der = borrar(r->der, " + clave + ")";
          r.der = borrarT(r.der, clave);
        } else if (r.izq === null) {
          res = r.der;
          fila[2] = "la tiene y r->izq es NULL: res = r->der, delete r";
        } else if (r.der === null) {
          res = r.izq;
          fila[2] = "la tiene y r->der es NULL: res = r->izq, delete r";
        } else {
          var suc = A.minimo(r.der).dato;
          fila[2] = "la tiene y hay dos hijos: suc es el " + suc + ", r->dato = " + suc + ", r->der = borrar(r->der, " + suc + ")";
          r.dato = suc;
          r.der = borrarT(r.der, suc);
        }
        fila[3] = res === null ? "NULL" : (res === r && r.dato !== Number(fila[1]) ? "el mismo nodo, ya con " + r.dato : "el nodo del " + res.dato);
      }
      return res;
    }
    var raiz = borrarT(arbol(), k);
    return { filas: filas, preorden: A.preorden(raiz) };
  }

  function spec() {
    var r = arbol();
    var pre12 = trasBorrar(12);
    var pre41 = trasBorrar(41);
    var pre23 = trasBorrar(23);
    var pre47 = trasBorrar(47);
    var tras47 = A.borrar(arbol(), 47);
    var pre47y61 = A.preorden(A.borrar(A.borrar(arbol(), 47), 61));
    var antes = A.svg(r, { marcas: { 47: "mal", 61: "resal", 68: "visto" } });
    var despues = A.svg(tras47, { marcas: { 61: "resal", 68: "visto" }, aristas: { 68: "nueva" } });
    return {
      contenedor: "tarjetas",
      cierre: "<p>Borrar baja como buscar y, al llegar al nodo, hay tres casos. Una hoja se quita y su padre queda con <code>NULL</code>. Con un solo hijo, ese hijo sube al lugar del nodo con todo lo que cuelga de él. Con dos hijos, el nodo se queda en su sitio, recibe la clave del sucesor (el mínimo de su subárbol derecho) y el sucesor se borra abajo; como el sucesor no tiene hijo izquierdo, ese segundo borrado es el caso 1 o el 2. Así quedó el borrado del 47:</p><div class=\"fila-arboles\"><figure>" + antes + "<figcaption>antes</figcaption></figure><figure>" + despues + "<figcaption>después: el 61 sube y el 68 toma su lugar</figcaption></figure></div><p>Todo cuesta O(h): del nodo al sucesor se sigue bajando por el mismo camino. Y como la raíz puede cambiar, la llamada se escribe siempre <code>raiz = borrar(raiz, k)</code>.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "El árbol y sus casos",
          html: "<p>El árbol sale de insertar " + CLAVES.join(" ") + " en un ABB vacío. Todas las preguntas, salvo la última, borran sobre este árbol original.</p>" + A.svg(r) +
            "<p>¿Cuántos hijos tiene cada uno de los nodos que se van a borrar?</p>",
          campos: [12, 41, 23, 47].map(function (k) { return { rotulo: "el " + k + ":", esperado: String(hijos(r, k)), ancho: "2.5rem" }; }),
          bien: "Correcto: el 12 es hoja (caso 1), el 41 tiene un hijo, el 38 (caso 2), y el 23 y el 47 tienen dos (caso 3).",
          distractores: [
            { valores: [null, "2", null, null], msg: "El 41 solo tiene hijo izquierdo, el 38. A su derecha hay NULL." }
          ],
          otro: "Cuente los punteros izq y der que no son NULL en cada nodo." },
        { tipo: "respuesta", titulo: "Caso 1: borrar 12",
          html: "<p><code>raiz = borrar(raiz, 12)</code>. ¿Qué preorden imprime el árbol después?</p>",
          campos: [{ rotulo: "preorden:", esperado: pre12.join(" "), pista: "a b c …", ancho: "17rem" }],
          bien: "Correcto: el hijo izquierdo del 23 pasa a NULL y nadie más se mueve.",
          distractores: [
            { valores: ["47 35 29 41 38 76 61 68 88"], msg: "El 23 no se borra: solo pierde su hijo izquierdo. Sigue en el preorden después del 47." }
          ],
          otro: "Quite el 12 del dibujo y recorra: raíz, subárbol izquierdo, subárbol derecho." },
        { tipo: "respuesta", titulo: "Caso 2: borrar 41",
          html: "<p>Sobre el árbol original, <code>raiz = borrar(raiz, 41)</code>. ¿Qué preorden queda?</p>",
          campos: [{ rotulo: "preorden:", esperado: pre41.join(" "), pista: "a b c …", ancho: "17rem" }],
          bien: "Correcto: el 38 sube al lugar del 41 y el 35 pasa a apuntarlo con su der. Todo lo que colgaba del 41 era mayor que 35, así que sigue siendo ABB.",
          distractores: [
            { valores: ["47 23 12 35 29 76 61 68 88"], msg: "Al borrar el 41 no se va el 38: es el único hijo y sube a su lugar." },
            { valores: ["47 23 12 35 29 41 76 61 68 88"], msg: "Ese árbol perdió el 38 y conservó el 41. Lo que se libera es el nodo del 41; su hijo ocupa su lugar." }
          ],
          otro: "Con un solo hijo, borrar devuelve ese hijo y el padre del 41 lo guarda en el puntero por el que bajó." },
        { tipo: "respuesta", titulo: "Caso 3: borrar 23",
          html: "<p>Sobre el árbol original, <code>raiz = borrar(raiz, 23)</code>. El 23 tiene dos hijos. ¿Qué clave sube a su lugar y qué preorden queda?</p>",
          campos: [
            { rotulo: "sube:", esperado: String(sucesor(23)), ancho: "3rem" },
            { rotulo: "preorden:", esperado: pre23.join(" "), pista: "a b c …", ancho: "17rem" }
          ],
          bien: "Correcto: el sucesor del 23 es el mínimo de su subárbol derecho: desde el 35 se baja por izq hasta el 29. El 29 era hoja, así que abajo es el caso 1.",
          distractores: [
            { valores: ["35", null], msg: "El 35 es el hijo derecho, pero no la menor clave de ese lado: el 29 cuelga a su izquierda." },
            { valores: ["12", null], msg: "El 12 es el predecesor, el máximo del subárbol izquierdo. borrar usa el sucesor, el mínimo del derecho." },
            { valores: [null, trasBorrarPred(23).join(" ")], msg: "Ese preorden sale con el predecesor. Con el sucesor, el 29 queda en el lugar del 23." }
          ],
          otro: "El sucesor es la clave que sigue al 23 en el inorden: el mínimo de su subárbol derecho." },
        { tipo: "respuesta", titulo: "Caso 3 en la raíz: borrar 47",
          html: "<p>Sobre el árbol original, <code>raiz = borrar(raiz, 47)</code>. ¿Qué clave queda en la raíz y qué preorden imprime?</p>",
          campos: [
            { rotulo: "raíz:", esperado: String(sucesor(47)), ancho: "3rem" },
            { rotulo: "preorden:", esperado: pre47.join(" "), pista: "a b c …", ancho: "17rem" }
          ],
          bien: "Correcto: el sucesor es el 61 y sube a la raíz. El 61 no era hoja: tenía al 68 a la derecha, así que al borrarlo abajo es el caso 2 y el 68 queda como hijo izquierdo del 76.",
          distractores: [
            { valores: ["76", null], msg: "El 76 es el hijo derecho; el sucesor es el mínimo de ese subárbol: desde el 76 se baja por izq hasta el 61." },
            { valores: ["41", null], msg: "El 41 es el predecesor, el máximo del subárbol izquierdo. borrar usa el sucesor." },
            { valores: [null, "61 23 12 35 29 41 38 76 88"], msg: "Se perdió el 68. Cuando el 61 se borra de abajo, su hijo derecho sube a su lugar." },
            { valores: [null, trasBorrarPred(47).join(" ")], msg: "Ese preorden es el que deja el predecesor. Con el sucesor la raíz es 61." }
          ],
          otro: "Busque el mínimo del subárbol derecho del 47 y fíjese en si tiene hijos." },
        { tipo: "tabla", titulo: "borrar(raiz, 47), marco por marco",
          cabecera: ["Marco", "r->dato", "Qué hace", "Devuelve"],
          filas: marcos(47).filas,
          nota: "Al subir, el 76 guarda el 68 en su izq: es el único puntero que cambia, además de la clave copiada en la raíz." },
        { tipo: "respuesta", titulo: "Dos borrados seguidos",
          html: "<p>Ahora sí en secuencia: después de borrar el 47 se borra el 61, que quedó en la raíz. ¿Qué preorden queda?</p>",
          campos: [{ rotulo: "preorden:", esperado: pre47y61.join(" "), pista: "a b c …", ancho: "17rem" }],
          bien: "Correcto: el 61 tiene dos hijos; su sucesor es el 68, que ahora es hoja bajo el 76. El 68 sube a la raíz.",
          distractores: [
            { valores: ["76 23 12 35 29 41 38 68 88"], msg: "El 76 es el hijo derecho, no el mínimo de su lado: a su izquierda está el 68." }
          ],
          otro: "Parta del árbol que dejó borrar el 47 y busque el sucesor del 61." },
        { tipo: "opciones", titulo: "Sin raiz =", columna: true, correcta: "unhijo",
          html: "<p>Alguien llama <code>borrar(raiz, k);</code> sin guardar lo que devuelve. ¿En cuál de estos casos <code>raiz</code> queda apuntando a memoria liberada?</p>",
          opciones: [
            { op: "47", texto: "Borrar el 47 en el árbol de esta actividad.", msg: "Con dos hijos el nodo de la raíz no se libera: recibe la clave 61 y sigue siendo la raíz. Aquí el olvido no se nota, y por eso es peligroso." },
            { op: "12", texto: "Borrar el 12 en el árbol de esta actividad.", msg: "El 12 está abajo; la asignación que lo desengancha es r->izq = ... en el marco del 23, que sí está escrita." },
            { op: "unhijo", texto: "Borrar el 50 en un árbol cuya raíz es el 50 y solo tiene hijo derecho, el 90.", msg: "Correcto. borrar libera el nodo del 50 y devuelve el del 90; si nadie lo guarda, raiz sigue apuntando al nodo liberado." }
          ] },
        { tipo: "opciones", titulo: "Lo que cuesta el caso 3", columna: true, correcta: "h",
          html: "<p>Con dos hijos, borrar busca el nodo, después el sucesor y después borra el sucesor abajo. En un árbol de altura h, ¿cuánto cuesta?</p>",
          opciones: [
            { op: "h", texto: "O(h): del nodo al sucesor se sigue bajando, así que todo cabe en un camino desde la raíz.", msg: "Correcto. minimo baja por un solo lado y el segundo borrado recorre ese mismo tramo." },
            { op: "n", texto: "Θ(n): para hallar el sucesor hay que revisar todo el subárbol derecho.", msg: "El mínimo de un ABB está al fondo de la izquierda: minimo baja por izq sin mirar nada más." },
            { op: "h2", texto: "O(h²): hace una búsqueda completa por cada nivel.", msg: "Son tres tramos de un mismo camino, no una búsqueda por nivel. Suman a lo sumo h + 1 nodos." }
          ] }
      ]
    };
  }

  return { claves: CLAVES, arbol: arbol, hijos: hijos, trasBorrar: trasBorrar, trasBorrarPred: trasBorrarPred, sucesor: sucesor, marcos: marcos, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
