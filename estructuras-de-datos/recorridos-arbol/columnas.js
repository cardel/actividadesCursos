/* Ejercicio interactivo: un árbol que llega en preorden con −1 en cada
   vacío, leído con una función recursiva, y la suma de cada columna. */
var EJERCICIO = (function () {
  var A = (typeof Arbol !== "undefined") ? Arbol : require("../comun/arbol.js");
  var N = A.N;

  var ENTRADA = "4 9 -1 1 -1 -1 3 2 6 -1 -1 -1 5 -1 -1 -1";

  /* La lectura recursiva: v es el número ya leído; si es −1 el árbol es
     vacío, y si no se leen el subárbol izquierdo y después el derecho.
     Cada número leído deja una anotación para la traza. */
  function leer(fichas) {
    var k = { v: 0 };
    var traza = [];
    function sig() { var x = Number(fichas[k.v]); k.v = k.v + 1; return x; }
    function leerArbol(v, col, lado, padre) {
      var res = null;
      if (v === -1) {
        traza.push({ ficha: v, texto: padre === null ? "lee −1: el árbol es vacío" : "lee −1: el subárbol " + lado + " de " + padre + " es vacío" });
      } else {
        traza.push({ ficha: v, dato: v, col: col, texto: "lee " + v + ": " + (padre === null ? "es la raíz" : "es el hijo " + lado + " de " + padre) + ", columna " + texCol(col) });
        var izq = leerArbol(sig(), col - 1, "izquierdo", v);
        var der = leerArbol(sig(), col + 1, "derecho", v);
        res = N(v, izq, der);
      }
      return res;
    }
    var arboles = [];
    var v = sig();
    while (v !== -1) {
      arboles.push(leerArbol(v, 0, "", null));
      v = sig();
    }
    return { arboles: arboles, traza: traza };
  }

  function texCol(c) { return c > 0 ? "+" + c : (c < 0 ? "−" + (-c) : "0"); }

  /* sumarColumnas: la raíz en la columna 0, el izquierdo en c − 1 y el
     derecho en c + 1. Devuelve las sumas de izquierda a derecha. */
  function sumas(r) {
    var suma = {};
    function sumar(x, c) {
      if (x !== null) {
        suma[c] = (suma[c] || 0) + x.dato;
        sumar(x.izq, c - 1);
        sumar(x.der, c + 1);
      }
    }
    sumar(r, 0);
    var cols = Object.keys(suma).map(Number).sort(function (a, b) { return a - b; });
    return { cols: cols, valores: cols.map(function (c) { return suma[c]; }) };
  }

  function columnaDe(traza, dato) {
    return traza.filter(function (t) { return t.dato === dato; })[0].col;
  }

  function spec() {
    var fichas = ENTRADA.split(" ");
    var l = leer(fichas);
    var raiz = l.arboles[0];
    var n = A.tamano(raiz);
    var vaciosLeidos = l.traza.filter(function (t) { return t.ficha === -1; }).length;
    var s = sumas(raiz);
    var pasos = l.traza.map(function (t, i) {
      var estilos = {};
      var valores = {};
      l.traza.forEach(function (u, j) {
        if (u.dato !== undefined) {
          estilos[String(u.dato)] = j < i ? "normal" : (j === i ? "activo" : "tenue");
          if (j <= i) { valores[String(u.dato)] = "c " + texCol(u.col); }
        }
      });
      var leidas = fichas.slice(0, i + 1).join(" ");
      return { texto: t.texto, html: "<pre class=\"fragmento\">leído: " + leidas + "</pre>" + A.binario(raiz, { estilos: estilos, valores: valores }) };
    });
    return {
      contenedor: "tarjetas",
      cierre: "Un árbol escrito en preorden con una marca en cada vacío se lee con la misma recursión que lo recorre: leer un número es visitar un nodo, y las dos llamadas piden el subárbol izquierdo y después el derecho. El −1 es el caso base. Un árbol de n nodos trae n + 1 marcas de vacío, y la columna de cada nodo se hereda del padre, una menos a la izquierda y una más a la derecha.",
      cartas: [
        { tipo: "respuesta", titulo: "Lo que trae la entrada",
          html: "<p>Cada árbol llega en preorden: el dato de la raíz, el subárbol izquierdo y el derecho, con −1 en lugar de cada vacío. Un −1 solo, en el lugar de un árbol nuevo, termina la entrada.</p>" +
                "<pre class=\"fragmento\">" + ENTRADA + "</pre><p>¿Cuántos nodos tiene el árbol? ¿Cuántos de los −1 marcan un vacío del árbol?</p>",
          campos: [
            { rotulo: "nodos:", esperado: String(n), ancho: "3rem" },
            { rotulo: "vacíos:", esperado: String(vaciosLeidos), ancho: "3rem" }
          ],
          bien: "Correcto: " + n + " nodos y " + vaciosLeidos + " vacíos, uno más que los nodos, como en todo árbol binario. El último −1 es el que termina la entrada.",
          distractores: [
            { valores: [null, String(vaciosLeidos + 1)], msg: "El último −1 no es un vacío: llega donde empezaría otro árbol y termina la entrada." }
          ],
          otro: "Los números distintos de −1 son nodos. Un árbol de n nodos tiene n + 1 vacíos." },
        { tipo: "respuesta", titulo: "Columnas",
          html: "<p>¿En qué columna cae cada uno de estos nodos? Las columnas a la izquierda de la raíz van con signo menos, como -1.</p>",
          campos: [
            { rotulo: "6:", esperado: String(columnaDe(l.traza, 6)), ancho: "3rem" },
            { rotulo: "2:", esperado: String(columnaDe(l.traza, 2)), ancho: "3rem" },
            { rotulo: "5:", esperado: String(columnaDe(l.traza, 5)), ancho: "3rem" }
          ],
          bien: "Correcto. 6 es hijo izquierdo de 2, que es hijo izquierdo de 3, que es hijo derecho de 4: 0 + 1 − 1 − 1 = −1. 2 vuelve a la columna 0, y 5 queda dos a la derecha.",
          distractores: [
            { valores: ["1", null, null], msg: "6 es hijo izquierdo: resta uno a la columna de su padre, 2, que está en la 0." }
          ],
          otro: "Sume +1 por cada bajada a la derecha y −1 por cada bajada a la izquierda, desde la raíz." },
        { tipo: "respuesta", titulo: "La salida",
          html: "<p>Se imprime la suma de los datos de cada columna, de la más a la izquierda a la más a la derecha. ¿Qué línea sale?</p>",
          campos: [{ rotulo: "sumas:", esperado: s.valores.join(" "), ancho: "9rem" }],
          bien: "Correcto: columna −1, 9 + 6 = 15; columna 0, 4 + 1 + 2 = 7; columna +1, 3; columna +2, 5.",
          distractores: [
            { valores: ["9 7 3 5"], msg: "El 6 también cae en la columna −1, bajo el 2." },
            { valores: ["4 9 1 3 2 6 5"], msg: "Esos son los datos en preorden. Se piden las sumas de cada columna." }
          ],
          otro: "Agrupe los nodos por columna y sume cada grupo." },
        { tipo: "pasos", titulo: "La lectura, número por número",
          html: "<p>Esta lectura sirve para comprobar las tres respuestas anteriores. En verde, la columna c de cada nodo ya leído: la raíz en 0, el hijo izquierdo una a la izquierda de su padre y el derecho una a la derecha. En gris, lo que falta por leer. El dibujo no respeta las columnas: 1 y 2 caen en la misma, a la misma profundidad.</p>",
          pasos: pasos },
        { tipo: "opciones", titulo: "Columnas negativas", columna: true, correcta: "centro",
          html: "<p>Las sumas se guardan en un arreglo <code>suma</code>. ¿Por qué el nodo de la columna c se suma en <code>suma[CENTRO + c]</code> y no en <code>suma[c]</code>?</p>",
          opciones: [
            { op: "centro", texto: "Porque las columnas a la izquierda de la raíz son negativas", msg: "Correcto. Con suma[c], el 9 y el 6 escribirían en suma[−1], fuera del arreglo. Desplazar todo en CENTRO deja espacio a los dos lados." },
            { op: "orden", texto: "Para que las sumas salgan ordenadas de mayor a menor", msg: "El arreglo se recorre de izquierda a derecha por índice, y el desplazamiento no cambia el orden entre columnas." },
            { op: "raiz", texto: "Porque la raíz no puede ir en la casilla 0", msg: "La casilla 0 sirve igual que cualquiera; el problema son los índices negativos." }
          ] }
      ]
    };
  }

  return { entrada: ENTRADA, leer: leer, sumas: sumas, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
