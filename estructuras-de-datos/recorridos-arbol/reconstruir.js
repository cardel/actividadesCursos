/* Ejercicio interactivo: reconstruir un árbol de ocho nodos a partir de su
   preorden y su inorden, y dar su posorden. */
var EJERCICIO = (function () {
  var A = (typeof Arbol !== "undefined") ? Arbol : require("../comun/arbol.js");
  var N = A.N;

  var PRE = [1, 2, 4, 7, 5, 3, 6, 8];
  var IN = [4, 7, 2, 5, 1, 6, 8, 3];

  /* Dos árboles de dos nodos con el mismo preorden y el mismo posorden. */
  var DOS = [N(5, N(8, null, null), null), N(5, null, N(8, null, null))];

  function rango(a, b) { return a > b ? "vacío" : "[" + a + ", " + b + "]"; }

  /* reconstruir(ini, fin) trabaja sobre el rango del inorden y toma la raíz
     del siguiente del preorden; arma el nodo para poder dibujarlo y anota el
     posorden al volver. */
  function reconstruir(pre, ino) {
    var sig = { v: 0 };
    var filas = [];
    var posorden = [];
    var orden = [];
    function rec(ini, fin) {
      var res = null;
      if (ini <= fin) {
        var raiz = pre[sig.v];
        sig.v = sig.v + 1;
        var m = ini;
        while (ino[m] !== raiz) { m = m + 1; }
        filas.push([rango(ini, fin), String(raiz), String(m), rango(ini, m - 1), rango(m + 1, fin)]);
        orden.push(raiz);
        var izq = rec(ini, m - 1);
        var der = rec(m + 1, fin);
        posorden.push(raiz);
        res = N(raiz, izq, der);
      }
      return res;
    }
    var arbol = rec(0, ino.length - 1);
    return { arbol: arbol, filas: filas, posorden: posorden, orden: orden };
  }

  function spec() {
    var r = reconstruir(PRE, IN);
    var arbol = r.arbol;
    var m = IN.indexOf(PRE[0]);
    var izquierdo = IN.slice(0, m);
    var derecho = IN.slice(m + 1);
    var pasos = r.orden.map(function (d, k) {
      var estilos = {};
      r.orden.forEach(function (x, j) {
        estilos[String(x)] = j < k ? "normal" : (j === k ? "activo" : "tenue");
      });
      return { texto: "rango " + r.filas[k][0] + " del inorden: la raíz es " + d + ", el siguiente del preorden; queda en la posición " + r.filas[k][2] +
                      ", con " + r.filas[k][3] + " a la izquierda y " + r.filas[k][4] + " a la derecha",
               html: A.binario(arbol, { estilos: estilos }) };
    });
    var dosArboles = A.binario(DOS[0], { titulo: "8 a la izquierda" }) + A.binario(DOS[1], { titulo: "8 a la derecha" });
    return {
      contenedor: "tarjetas",
      cierre: "El preorden da las raíces, una tras otra, y el inorden parte cada rango en lo que va a la izquierda y lo que va a la derecha de esa raíz. Con los dos, el árbol queda determinado cuando los datos son distintos. La función trabaja sobre índices del inorden, sin copiar subarreglos, y buscar cada raíz recorriendo el rango cuesta O(n²); un arreglo con la posición de cada dato lo baja a Θ(n).",
      cartas: [
        { tipo: "respuesta", titulo: "La raíz y sus dos lados",
          html: "<p>Un árbol binario de " + PRE.length + " nodos con datos distintos tiene estos recorridos:</p>" +
                "<pre class=\"fragmento\">preorden: " + PRE.join(" ") + "\ninorden:  " + IN.join(" ") + "</pre>" +
                "<p>¿Cuál es la raíz? ¿Qué nodos forman su subárbol izquierdo y cuáles el derecho? Escríbalos en el orden del inorden.</p>",
          campos: [
            { rotulo: "raíz:", esperado: String(PRE[0]), ancho: "3rem" },
            { rotulo: "izquierdo:", esperado: izquierdo.join(" "), ancho: "8rem" },
            { rotulo: "derecho:", esperado: derecho.join(" "), ancho: "8rem" }
          ],
          bien: "Correcto. El preorden empieza por la raíz, 1. En el inorden, lo que está antes de 1 es su subárbol izquierdo y lo que está después, el derecho.",
          distractores: [
            { valores: [null, "2 4 7 5", "3 6 8"], msg: "Esos son los mismos nodos, pero en el orden del preorden. Se pidió el del inorden." },
            { valores: [String(IN[0]), null, null], msg: "El inorden empieza por el nodo de más a la izquierda, no por la raíz. La raíz es lo primero del preorden." }
          ],
          otro: "Tome la raíz del preorden y búsquela en el inorden." },
        { tipo: "respuesta", titulo: "El posorden",
          html: "<p>¿Cuál es su posorden? Se puede sacar dibujando el árbol a mano; las dos tarjetas siguientes lo reconstruyen paso a paso.</p>",
          campos: [{ rotulo: "posorden:", esperado: r.posorden.join(" "), ancho: "12rem" }],
          bien: "Correcto: " + r.posorden.join(" ") + ". Se puede imprimir sin armar nodos: cada llamada imprime su raíz al volver de sus dos lados.",
          distractores: [
            { valores: [PRE.slice().reverse().join(" ")], msg: "El preorden al revés termina en la raíz, pero recorre el derecho antes que el izquierdo." },
            { valores: ["7 4 5 2 6 8 3 1"], msg: "El 8 es hijo derecho de 6: en posorden sale antes que el 6." }
          ],
          otro: "Para cada nodo: su subárbol izquierdo, después el derecho y al final el nodo." },
        { tipo: "tabla", titulo: "Un rango por llamada",
          html: "<p>Cada llamada trabaja sobre un rango de posiciones del inorden (desde 0) y toma su raíz del siguiente número del preorden. Primero resuelve el lado izquierdo y después el derecho.</p>",
          cabecera: ["Rango del inorden", "Raíz", "Posición", "Izquierdo", "Derecho"],
          filas: r.filas,
          nota: "Las raíces salen en el orden del preorden: " + r.orden.join(", ") + ". Las llamadas sobre rangos vacíos no aparecen: responden sin consumir nada." },
        { tipo: "pasos", titulo: "El árbol, nodo por nodo",
          html: "<p>En naranja, la raíz que se acaba de ubicar; en gris, los nodos que todavía no salen del preorden.</p>",
          pasos: pasos },
        { tipo: "opciones", titulo: "¿Y con preorden y posorden?", columna: true, correcta: "no",
          html: "<p>De otro árbol se sabe que su preorden es <code>5 8</code> y su posorden <code>8 5</code>. ¿Cuál de estos dos es?</p><div style=\"display:flex;flex-wrap:wrap;gap:2rem;justify-content:center\">" + dosArboles + "</div>",
          opciones: [
            { op: "izq", texto: "El de 8 a la izquierda", msg: "Da esos dos recorridos, pero el de 8 a la derecha también: 5 8 en preorden y 8 5 en posorden." },
            { op: "der", texto: "El de 8 a la derecha", msg: "Da esos dos recorridos, pero el de 8 a la izquierda también: 5 8 en preorden y 8 5 en posorden." },
            { op: "no", texto: "No se puede saber", msg: "Correcto. Los dos tienen preorden 5 8 y posorden 8 5. Con un hijo único, preorden y posorden no dicen de qué lado está; el inorden sí: 8 5 si es izquierdo, 5 8 si es derecho." }
          ] }
      ]
    };
  }

  return { pre: PRE, ino: IN, dos: DOS, reconstruir: reconstruir, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
