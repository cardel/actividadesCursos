/* Ejercicio interactivo: insertar una secuencia en un ABB vacio, predecir
   la forma, y la version iterativa con padre y actual. */
var EJERCICIO = (function () {
  var A = typeof module !== "undefined" ? require("./arbol.js") : ArbolBB;
  var CLAVES = [36, 17, 58, 25, 9, 30, 21, 44, 71, 28];
  var NUEVA = 23;

  var INSERTAR_ITERATIVA = [
    "Nodo *insertarIterativa(Nodo *r, int k) {",
    "  Nodo *padre = NULL;",
    "  Nodo *actual = r;",
    "  while (actual != NULL && k != actual->dato) {",
    "    padre = actual;",
    "    if (k < actual->dato) {",
    "      actual = actual->izq;",
    "    } else {",
    "      actual = actual->der;",
    "    }",
    "  }",
    "  if (actual == NULL) {",
    "    Nodo *nuevo = crearNodo(k, NULL, NULL);",
    "    if (padre == NULL) {",
    "      r = nuevo;",
    "    } else if (k < padre->dato) {",
    "      padre->izq = nuevo;",
    "    } else {",
    "      padre->der = nuevo;",
    "    }",
    "  }",
    "  return r;",
    "}"
  ];

  /* Un dibujo por insercion; las columnas fijas evitan que el dibujo salte. */
  function pasosInsercion(claves) {
    var r = null;
    var pasos = [];
    claves.forEach(function (k) {
      var c = A.camino(r, k);
      r = A.insertar(r, k);
      var marcas = {};
      c.claves.forEach(function (x) { marcas[x] = "visto"; });
      marcas[k] = "resal";
      var aristas = {};
      aristas[k] = "nueva";
      var texto = c.padre === null ? k + " entra en el árbol vacío y es la raíz" :
        "insertar " + k + ": compara con " + c.claves.join(", ") + " y queda como hijo " +
        (c.lado === "izq" ? "izquierdo" : "derecho") + " del " + c.padre;
      pasos.push({ texto: texto, html: A.svg(r, { marcas: marcas, aristas: aristas, columnas: claves.length }) });
    });
    return pasos;
  }

  /* Filas de la traza de insertarIterativa(raiz, k): momento, padre, actual, comparacion. */
  function trazaIterativa(k) {
    var c = A.camino(A.armar(CLAVES), k);
    var filas = [];
    var padre = "NULL";
    c.claves.forEach(function (clave, i) {
      var momento = i === 0 ? "antes del ciclo" : "después de la vuelta " + i;
      var comp = k < clave ? k + " < " + clave + ": a la izquierda" : k + " > " + clave + ": a la derecha";
      filas.push([momento, padre, String(clave), comp]);
      padre = String(clave);
    });
    filas.push(["después de la vuelta " + c.claves.length, padre, "NULL",
      "el ciclo termina; " + k + (c.lado === "izq" ? " < " : " > ") + padre + ": padre->" + c.lado + " = nuevo"]);
    return filas;
  }

  /* Cuatro secuencias candidatas: ¿cual arma el mismo arbol? */
  var CANDIDATAS = {
    inorden: [9, 17, 21, 25, 28, 30, 36, 44, 58, 71],
    misma: [36, 58, 71, 44, 17, 25, 30, 28, 21, 9],
    adelanta: [36, 17, 58, 28, 25, 9, 30, 21, 44, 71],
    otraRaiz: [17, 36, 58, 25, 9, 30, 21, 44, 71, 28]
  };

  function spec() {
    var r = A.armar(CLAVES);
    var pre = A.preorden(r);
    var h = A.altura(r);
    var c28 = A.camino(A.armar(CLAVES.slice(0, 9)), 28);
    var conRepetida = A.insertar(A.armar(CLAVES), 25);
    var cNueva = A.camino(r, NUEVA);
    return {
      contenedor: "tarjetas",
      cierre: "<p>Insertar es buscar: la clave baja por el mismo camino que su búsqueda y se cuelga en el <code>NULL</code> donde esa búsqueda se cae, sin mover a nadie. Por eso la primera clave queda en la raíz y cada clave entra después de todos sus antepasados. Cualquier orden que respete eso arma el mismo árbol; el orden creciente, en cambio, arma una lista. Una clave repetida no cambia nada. La versión iterativa recuerda al <code>padre</code> porque, sin recursión, no hay un marco de arriba que reenganche al nodo nuevo: O(h) de tiempo y O(1) de espacio aparte.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Diez claves en un árbol vacío",
          html: "<p>Se insertan, en este orden y con <code>raiz = insertar(raiz, k)</code>, las claves <b>" + CLAVES.join(" ") + "</b> en un ABB vacío. Dibuje el árbol en papel. ¿Cuál es su preorden y cuál su altura?</p>",
          campos: [
            { rotulo: "preorden:", esperado: pre.join(" "), pista: "a b c …", ancho: "15rem" },
            { rotulo: "altura:", esperado: String(h), ancho: "3rem" }
          ],
          bien: "Correcto: " + pre.join(" ") + ", y altura " + h + " por el camino 36, 17, 25, 30, 28.",
          distractores: [
            { valores: [CLAVES.join(" "), null], msg: "Esa es la secuencia de llegada. El preorden visita la raíz, luego todo el subárbol izquierdo y luego el derecho: después del 36 vienen las claves menores." },
            { valores: [A.inorden(r).join(" "), null], msg: "Ese es el inorden, que en un ABB siempre sale ordenado. El preorden empieza por la raíz, el 36." },
            { valores: [null, "3"], msg: "El 28 cuelga más abajo: 28 < 36, 28 > 17, 28 > 25, 28 < 30. El camino 36, 17, 25, 30, 28 tiene cuatro aristas." },
            { valores: [null, "5"], msg: "La altura cuenta aristas, no nodos: el camino más largo tiene cinco nodos y cuatro aristas." }
          ],
          otro: "Inserte una clave a la vez siguiendo su búsqueda desde la raíz. Para el preorden: raíz, subárbol izquierdo, subárbol derecho." },
        { tipo: "respuesta", titulo: "La última clave",
          html: "<p>Con las nueve primeras ya puestas llega el 28. ¿Con cuántas claves se compara, de qué nodo queda colgando y de qué lado?</p>",
          campos: [
            { rotulo: "comparaciones:", esperado: String(c28.claves.length), ancho: "3rem" },
            { rotulo: "cuelga del", esperado: String(c28.padre), ancho: "3.5rem" },
            { rotulo: "lado:", esperado: c28.lado, pista: "izq o der", ancho: "5.5rem" }
          ],
          bien: "Correcto: 28 < 36, 28 > 17, 28 > 25 y 28 < 30. El 30 no tenía hijo izquierdo y ahí entra el 28.",
          distractores: [
            { valores: [null, "25", null], msg: "El 25 ya tiene hijo derecho, el 30. 28 > 25 baja al 30 y sigue." },
            { valores: [null, "21", null], msg: "28 > 25 manda la búsqueda a la derecha del 25; el 21 está a su izquierda." }
          ],
          otro: "Siga el camino del 28 desde la raíz con las nueve claves anteriores." },
        { tipo: "pasos", titulo: "Clave por clave",
          html: "<p>Para revisar el dibujo: en celeste, las claves con las que se compara la que entra; en naranja, la que entra.</p>",
          pasos: pasosInsercion(CLAVES) },
        { tipo: "respuesta", titulo: "Una clave repetida",
          html: "<p>Después de las diez, el programa hace <code>raiz = insertar(raiz, 25)</code>. ¿Cuántos nodos tiene el árbol después?</p>",
          campos: [{ rotulo: "nodos:", esperado: String(A.tamano(conRepetida)), ancho: "3rem" }],
          bien: "Correcto: en el nodo del 25 no se cumple ni k < r->dato ni k > r->dato, ninguna rama se ejecuta y se devuelve r sin cambios.",
          distractores: [
            { valores: ["11"], msg: "insertar solo crea un nodo cuando llega a NULL. Con el 25 se detiene en el nodo que ya lo tiene." }
          ],
          otro: "Mire qué rama de insertar se ejecuta cuando k es igual a r->dato." },
        { tipo: "respuesta", titulo: "La versión con un ciclo",
          html: A.codigo(INSERTAR_ITERATIVA) + "<p>Sobre el árbol de las diez claves se llama <code>raiz = insertarIterativa(raiz, " + NUEVA + ")</code>. ¿Cuántas vueltas da el ciclo, qué clave tiene <code>padre</code> al salir y por cuál de sus punteros se cuelga el nodo nuevo?</p>",
          campos: [
            { rotulo: "vueltas:", esperado: String(cNueva.claves.length), ancho: "3rem" },
            { rotulo: "padre:", esperado: String(cNueva.padre), ancho: "3.5rem" },
            { rotulo: "puntero:", esperado: cNueva.lado, pista: "izq o der", ancho: "5.5rem" }
          ],
          bien: "Correcto: actual recorre 36, 17, 25 y 21, y en la cuarta vuelta pasa a NULL. padre se queda en el 21 y, como 23 > 21, el nodo nuevo va en padre->der.",
          distractores: [
            { valores: [null, "25", null], msg: "En cada vuelta padre toma el valor de actual antes de que actual baje. Cuando actual llega a NULL, padre es el último nodo visitado, el 21." },
            { valores: ["3", null, null], msg: "La cuarta vuelta es la que lleva actual del 21 a su hijo derecho, NULL. Después la condición falla." }
          ],
          otro: "Lleve dos columnas, padre y actual, y actualícelas en cada vuelta." },
        { tipo: "tabla", titulo: "insertarIterativa(raiz, " + NUEVA + "), vuelta por vuelta",
          cabecera: ["Momento", "padre", "actual", "Comparación"],
          filas: trazaIterativa(NUEVA),
          nota: "Si el árbol estuviera vacío, el ciclo no daría ninguna vuelta, padre seguiría en NULL y el nodo nuevo sería la raíz." },
        { tipo: "opciones", titulo: "Otro orden, el mismo árbol", columna: true, correcta: "misma",
          html: "<p>¿Cuál de estas secuencias, insertada en un ABB vacío, arma el mismo árbol de las diez claves?</p>",
          opciones: [
            { op: "inorden", texto: CANDIDATAS.inorden.join(" "), msg: "En orden creciente cada clave baja siempre por la derecha: sale una lista de altura 9." },
            { op: "misma", texto: CANDIDATAS.misma.join(" "), msg: "Correcto. Cada clave llega después de todos sus antepasados: el 71 después del 58, el 28 después del 30, el 21 después del 25. Cuando entra, su búsqueda pasa por ellos y la deja en el mismo lugar." },
            { op: "adelanta", texto: CANDIDATAS.adelanta.join(" "), msg: "El 28 llega antes que el 25 y el 30, sus antepasados. Entra como hijo derecho del 17 y el árbol cambia." },
            { op: "otraRaiz", texto: CANDIDATAS.otraRaiz.join(" "), msg: "La primera clave es la raíz: este árbol tiene al 17 arriba." }
          ] }
      ]
    };
  }

  return { claves: CLAVES, nueva: NUEVA, candidatas: CANDIDATAS, pasosInsercion: pasosInsercion, trazaIterativa: trazaIterativa, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
