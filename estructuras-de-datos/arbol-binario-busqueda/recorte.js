/* Ejercicio interactivo: contarRango y kEsimo recortan el recorrido; que
   nodos tocan y cuales se saltan. */
var EJERCICIO = (function () {
  var A = typeof module !== "undefined" ? require("./arbol.js") : ArbolBB;
  var CLAVES = [41, 20, 65, 11, 29, 50, 91, 26, 32, 72];

  var CONTAR = [
    "int contarRango(Nodo *r, int a, int b) {",
    "  int res = 0;",
    "  if (r != NULL) {",
    "    if (r->dato < a) {",
    "      res = contarRango(r->der, a, b);",
    "    } else if (r->dato > b) {",
    "      res = contarRango(r->izq, a, b);",
    "    } else {",
    "      res = 1 + contarRango(r->izq, a, b) + contarRango(r->der, a, b);",
    "    }",
    "  }",
    "  return res;",
    "}"
  ];

  var KESIMO = [
    "Nodo *kEsimo(Nodo *r, int k, int &vistos) {",
    "  Nodo *res = NULL;",
    "  if (r != NULL) {",
    "    res = kEsimo(r->izq, k, vistos);",
    "    if (res == NULL) {",
    "      vistos = vistos + 1;",
    "      if (vistos == k) {",
    "        res = r;",
    "      } else {",
    "        res = kEsimo(r->der, k, vistos);",
    "      }",
    "    }",
    "  }",
    "  return res;",
    "}"
  ];

  var KESIMO_PILA = [
    "Nodo *kEsimoPila(Nodo *r, int k) {",
    "  Pila p;",
    "  Nodo *res = NULL;",
    "  Nodo *actual = r;",
    "  int vistos = 0;",
    "  while (res == NULL && (actual != NULL || !p.vacia())) {",
    "    if (actual != NULL) {",
    "      p.apilar(actual);",
    "      actual = actual->izq;",
    "    } else {",
    "      actual = p.tope();",
    "      p.desapilar();",
    "      vistos = vistos + 1;",
    "      if (vistos == k) {",
    "        res = actual;",
    "      }",
    "      actual = actual->der;",
    "    }",
    "  }",
    "  return res;",
    "}"
  ];

  function arbol() {
    return A.armar(CLAVES);
  }

  /* kEsimoPila vuelta por vuelta: lo que hace, la pila (tope a la derecha) y vistos. */
  function kesimoPila(k) {
    var pila = [];
    var res = null;
    var actual = arbol();
    var vistos = 0;
    var filas = [];
    function nombre(x) { return x === null ? "NULL" : String(x.dato); }
    while (res === null && (actual !== null || pila.length > 0)) {
      var hace;
      if (actual !== null) {
        pila.push(actual);
        hace = "apila " + actual.dato + ", baja a " + nombre(actual.izq);
        actual = actual.izq;
      } else {
        actual = pila.pop();
        vistos = vistos + 1;
        if (vistos === k) {
          res = actual;
          hace = "saca " + actual.dato + ": vistos llega a " + k + ", res es el " + actual.dato;
        } else {
          hace = "saca " + actual.dato + ", sigue por su derecho (" + nombre(actual.der) + ")";
        }
        actual = actual.der;
      }
      filas.push([String(filas.length + 1), hace, pila.map(function (x) { return x.dato; }).join(" "), String(vistos)]);
    }
    return {
      clave: res === null ? null : res.dato, vueltas: filas.length, filas: filas,
      queda: pila.map(function (x) { return x.dato; }).reverse()
    };
  }

  function contar(a, b) {
    var toca = [];
    var c = A.contarRango(arbol(), a, b, toca);
    return { cuenta: c, toca: toca };
  }

  function kesimo(k) {
    var estado = { vistos: 0, toca: [] };
    var x = A.kEsimo(arbol(), k, estado);
    return { clave: x === null ? null : x.dato, toca: estado.toca };
  }

  /* Un dibujo por cada nodo al que entra kEsimo, con el turno de los contados. */
  function pasosK(k) {
    var r = arbol();
    var pasos = [];
    var marcas = {};
    var rotulos = {};
    var vistos = { v: 0 };
    function rec(x) {
      var res = null;
      if (x !== null) {
        marcas[x.dato] = "resal";
        pasos.push({ texto: "entra al " + x.dato + " y baja primero a su izquierda", html: A.svg(r, { marcas: copia(marcas), rotulos: copia(rotulos) }) });
        marcas[x.dato] = "visto";
        res = rec(x.izq);
        if (res === null) {
          vistos.v = vistos.v + 1;
          rotulos[x.dato] = "vistos = " + vistos.v;
          if (vistos.v === k) {
            res = x;
            marcas[x.dato] = "mal";
            pasos.push({ texto: "cuenta el " + x.dato + ": vistos llega a " + k + " y res deja de ser NULL; nadie más baja", html: A.svg(r, { marcas: copia(marcas), rotulos: copia(rotulos) }) });
          } else {
            marcas[x.dato] = "resal";
            pasos.push({ texto: "cuenta el " + x.dato + " (vistos = " + vistos.v + ") y sigue por su derecha", html: A.svg(r, { marcas: copia(marcas), rotulos: copia(rotulos) }) });
            marcas[x.dato] = "visto";
            res = rec(x.der);
          }
        }
      }
      return res;
    }
    rec(r);
    return pasos;
  }

  function copia(o) {
    return JSON.parse(JSON.stringify(o));
  }

  function spec() {
    var r = arbol();
    var c1 = contar(27, 55);
    var c2 = contar(92, 99);
    var nunca = A.inorden(r).filter(function (x) { return c1.toca.indexOf(x) < 0; });
    var k3 = kesimo(3);
    var k7 = kesimo(7);
    var p3 = kesimoPila(3);
    var p7 = kesimoPila(7);
    return {
      contenedor: "tarjetas",
      cierre: "<p>Las dos funciones son recorridos que se recortan con la regla del ABB. <code>contarRango</code> no baja a la izquierda de un dato menor que a ni a la derecha de uno mayor que b: visita las m claves del rango y los nodos de los caminos que buscan a y b, O(h + m). <code>kEsimo</code> es el inorden con un contador por referencia; en cuanto res deja de ser NULL, ningún marco vuelve a contar ni a bajar: O(h + k). <code>kEsimoPila</code> hace el mismo recorrido con la pila explícita y para con la misma condición. Todas piden O(h) de pila, de llamadas o explícita.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Contar entre 27 y 55",
          html: "<p>El árbol sale de insertar " + CLAVES.join(" ") + " en un ABB vacío.</p>" + A.svg(r) + A.codigo(CONTAR) + "<p>¿Qué devuelve <code>contarRango(raiz, 27, 55)</code> y en cuántos nodos entra (llamadas con r distinto de NULL)?</p>",
          campos: [
            { rotulo: "devuelve:", esperado: String(c1.cuenta), ancho: "3rem" },
            { rotulo: "entra en:", esperado: String(c1.toca.length), ancho: "3rem" }
          ],
          bien: "Correcto: cuenta 29, 32, 41 y 50, y entra en " + c1.toca.join(", ") + ". El 26 se visita sin contar: es menor que 27 y solo se baja a su derecha, que es NULL.",
          distractores: [
            { valores: ["5", null], msg: "El 26 se visita pero no entra en [27, 55]." },
            { valores: [null, "10"], msg: "Cuando el dato está fuera del rango solo se baja a un lado. En el 65 (mayor que 55) no se baja al 91." },
            { valores: [null, "4"], msg: "Además de las cuatro claves que cuentan, se entra en nodos que no cuentan pero están en el camino, como el 20 y el 65." }
          ],
          otro: "Recorra desde la raíz: si el dato es menor que 27, solo a la derecha; si es mayor que 55, solo a la izquierda; si está en el rango, a los dos lados." },
        { tipo: "respuesta", titulo: "Lo que se salta",
          html: "<p>En esa misma llamada, ¿qué claves no se visitan nunca? Escríbalas de menor a mayor.</p>",
          campos: [{ rotulo: "nunca:", esperado: nunca.join(" "), pista: "a b c", ancho: "8rem" }],
          bien: "Correcto: el 11 queda a la izquierda del 20, que es menor que 27; el 91 y el 72 quedan a la derecha del 65, que es mayor que 55.",
          distractores: [
            { valores: ["11 26 72 91"], msg: "El 26 sí se visita: es hijo izquierdo del 29, que está en el rango, y se baja a los dos lados del 29." }
          ],
          otro: "Un subárbol se salta entero cuando cuelga del lado equivocado de un dato fuera del rango." },
        { tipo: "respuesta", titulo: "Un rango vacío",
          html: "<p>¿Qué devuelve <code>contarRango(raiz, 92, 99)</code> y en cuántos nodos entra?</p>",
          campos: [
            { rotulo: "devuelve:", esperado: String(c2.cuenta), ancho: "3rem" },
            { rotulo: "entra en:", esperado: String(c2.toca.length), ancho: "3rem" }
          ],
          bien: "Correcto: 41, 65 y 91 son menores que 92 y en los tres solo se baja a la derecha. Con m = 0 claves en el rango, el costo es un solo camino: O(h).",
          distractores: [
            { valores: [null, "4"], msg: "El 72 está a la izquierda del 91, y el 91 es menor que 92: solo se baja a su derecha, que es NULL." }
          ],
          otro: "Siga el camino: cada dato es menor que 92." },
        { tipo: "respuesta", titulo: "La k-ésima menor",
          html: A.codigo(KESIMO) + "<p>Con <code>vistos = 0</code> antes de cada llamada: ¿qué clave devuelve <code>kEsimo(raiz, 3, vistos)</code> y en cuántos nodos entra? ¿Y con k = 7?</p>",
          campos: [
            { rotulo: "k = 3:", esperado: String(k3.clave), ancho: "3rem" },
            { rotulo: "entra en:", esperado: String(k3.toca.length), ancho: "3rem" },
            { rotulo: "k = 7:", esperado: String(k7.clave), ancho: "3rem" },
            { rotulo: "entra en:", esperado: String(k7.toca.length), ancho: "3rem" }
          ],
          bien: "Correcto: el inorden es " + A.inorden(r).join(" ") + ". Con k = 3 entra en " + k3.toca.join(", ") + "; con k = 7, en " + k7.toca.join(", ") + ". El 41 se visita en los dos casos (se baja por él), pero con k = 3 nunca se cuenta.",
          distractores: [
            { valores: ["20", null, null, null], msg: "El 20 es la segunda: antes va el 11. La tercera es el 26." },
            { valores: [null, "3", null, null], msg: "Para contar la tercera hay que bajar por el 41 y el 20 hasta el 11, y después pasar por el 29 para llegar al 26." },
            { valores: [null, null, "41", null], msg: "El 41 es la sexta: 11, 20, 26, 29, 32, 41. La séptima es el 50." }
          ],
          otro: "Escriba el inorden y cuente. Para los nodos, siga el recorrido: cada nodo se visita al bajar, antes de contarlo." },
        { tipo: "pasos", titulo: "kEsimo(raiz, 7), nodo por nodo",
          html: "<p>Naranja: el nodo al que acaba de entrar o que acaba de contar. Celeste: visitado. Rojo: el séptimo. Debajo, el valor de vistos cuando se contó.</p>",
          pasos: [{ texto: "vistos = 0", html: A.svg(r) }].concat(pasosK(7)) },
        { tipo: "respuesta", titulo: "La k-ésima con pila explícita",
          html: A.codigo(KESIMO_PILA) + "<p>La misma búsqueda con la pila del inorden iterativo. ¿Cuántas vueltas da el ciclo de <code>kEsimoPila(raiz, 3)</code> y qué nodos quedan en la pila al terminar, del tope al fondo? ¿Y qué queda en la pila con k = 7?</p>",
          campos: [
            { rotulo: "vueltas:", esperado: String(p3.vueltas), ancho: "3rem" },
            { rotulo: "quedan:", esperado: p3.queda.join(" "), pista: "tope … fondo", ancho: "6rem" },
            { rotulo: "con k = 7:", esperado: p7.queda.join(" "), pista: "tope … fondo", ancho: "6rem" }
          ],
          bien: "Correcto: cinco vueltas apilan (41, 20, 11, 29 y 26) y tres sacan (11, 20 y 26). Al sacar el 26 vistos llega a 3 y el ciclo para con el 41 y el 29 todavía en la pila; el destructor de Pila libera esos nodos de la pila. Con k = 7 solo queda el 65.",
          distractores: [
            { valores: [null, "41 29", null], msg: "Ese es el orden del fondo al tope. El tope es el último que se apiló, el 29." },
            { valores: ["9", null, null], msg: "Al sacar el 26 res deja de ser NULL y la condición del while falla: no hay novena vuelta." },
            { valores: [null, "", null], msg: "El ciclo no vacía la pila: termina en cuanto aparece la k-ésima." }
          ],
          otro: "Lleve la pila a mano: si actual no es NULL se apila y se baja a la izquierda; si es NULL se saca el tope, se cuenta y se sigue por su derecho." },
        { tipo: "tabla", titulo: "kEsimoPila(raiz, 3), vuelta por vuelta",
          cabecera: ["Vuelta", "Hace", "Pila (tope a la derecha)", "vistos"],
          filas: p3.filas,
          nota: "Cada nodo se cuenta al sacarlo de la pila, en el mismo orden en que la versión recursiva lo cuenta al volver de su subárbol izquierdo." },
        { tipo: "opciones", titulo: "Lo que cuesta", columna: true, correcta: "hk",
          html: "<p>En un ABB de altura h, ¿qué cuesta <code>kEsimo(raiz, k, vistos)</code>?</p>",
          opciones: [
            { op: "hk", texto: "O(h + k): el camino de bajada hasta la menor clave y después k claves del inorden.", msg: "Correcto. Con k = 1 es el costo de minimo; con k = n, un inorden completo." },
            { op: "n", texto: "Θ(n): es un inorden.", msg: "Es un inorden que se detiene: con k = 3 entró en 5 de los 10 nodos." },
            { op: "h", texto: "O(h): baja por un solo lado, como buscar.", msg: "Baja por un lado hasta el mínimo, pero después tiene que contar k claves, que pueden estar en ramas distintas." }
          ] }
      ]
    };
  }

  return { claves: CLAVES, contar: contar, kesimo: kesimo, kesimoPila: kesimoPila, pasosK: pasosK, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
