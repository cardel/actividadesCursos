/* Ejercicio interactivo: operaciones propias de list. */
var EJERCICIO = (function () {
  var INICIAL = [4, 4, 9, 4, 6, 6, 6, 1];
  var OTRA = [2, 6, 8, 10];

  /* Simulaciones de las operaciones sobre arreglos. */
  function unique(l) {
    var r = [];
    l.forEach(function (v) {
      if (r.length === 0 || r[r.length - 1] !== v) { r.push(v); }
    });
    return r;
  }
  function remove(l, x) {
    return l.filter(function (v) { return v !== x; });
  }
  function reverse(l) {
    return l.slice().reverse();
  }
  /* merge estable: con iguales, primero los de a */
  function merge(a, b) {
    var r = [];
    var i = 0;
    var j = 0;
    while (i < a.length || j < b.length) {
      if (j >= b.length || (i < a.length && a[i] <= b[j])) {
        r.push(a[i]);
        i = i + 1;
      } else {
        r.push(b[j]);
        j = j + 1;
      }
    }
    return r;
  }

  function correr() {
    var l0 = INICIAL.slice();
    var l1 = unique(l0);
    var l2 = remove(l1, 4);
    var l3 = reverse(l2);
    var a = merge(l3, OTRA);
    return { inicial: l0, unique: l1, remove: l2, reverse: l3, merge: a, b: [] };
  }

  function nodos(l) {
    var h = "<div class=\"lista-nodos\">";
    l.forEach(function (v) { h = h + "<span class=\"nodo\">" + v + "</span>"; });
    if (l.length === 0) { h = h + "<span>vacía</span>"; }
    return h + "</div>";
  }

  function texto(l) { return l.join(" "); }

  function spec() {
    var R = correr();
    var programa = "<pre class=\"fragmento\">list&lt;int&gt; l = {" + INICIAL.join(", ") + "};\nl.unique();\nl.remove(4);\nl.reverse();\nlist&lt;int&gt; b = {" + OTRA.join(", ") + "};\nl.merge(b);</pre>";
    return {
      contenedor: "tarjetas",
      cierre: "Las cuatro operaciones recorren la lista una vez: Θ(n), y Θ(n<sub>a</sub> + n<sub>b</sub>) la mezcla. Ninguna copia datos ni pide nodos; desenlazan, cambian el sentido de los enlaces o empalman nodos de otra lista. <code>unique</code> solo mira al vecino de atrás, así que deja un valor por cada grupo de repetidos seguidos, y <code>merge</code> supone las dos listas ordenadas.",
      cartas: [
        { tipo: "respuesta", titulo: "Después de <code>unique</code>",
          html: programa + "<p>¿Qué contiene <code>l</code> justo después de <code>l.unique()</code>?</p>",
          campos: [{ rotulo: "l =", esperado: texto(R.unique), pista: "4 ...", ancho: "11rem" }],
          bien: "Correcto: " + texto(R.unique) + ". De cada grupo de repetidos seguidos queda el primero; el 4 que está entre el 9 y los 6 no tiene un 4 al lado, así que se queda.",
          distractores: [
            { valores: ["4 9 6 1"], msg: "unique compara cada nodo con el anterior, no con toda la lista: el tercer 4 no está pegado a los dos primeros." },
            { valores: [texto(INICIAL)], msg: "Sí hay repetidos seguidos: los dos 4 del comienzo y los tres 6." }
          ],
          otro: "Recorra la lista y borre cada nodo igual al que tiene justo antes." },
        { tipo: "respuesta", titulo: "Después de <code>remove</code> y <code>reverse</code>",
          html: "<p>¿Qué contiene <code>l</code> después de <code>l.remove(4)</code>? ¿Y después de <code>l.reverse()</code>?</p>",
          campos: [{ rotulo: "remove:", esperado: texto(R.remove), ancho: "8rem" }, { rotulo: "reverse:", esperado: texto(R.reverse), ancho: "8rem" }],
          bien: "Correcto: " + texto(R.remove) + " y " + texto(R.reverse) + ". remove saca todos los 4 que quedaban, y reverse invierte los enlaces sin mover datos.",
          distractores: [
            { valores: ["4 9 6 1", null], msg: "remove(4) borra todos los nodos con 4, no solo los repetidos." },
            { valores: [null, texto(R.remove)], msg: "reverse cambia el sentido de la lista: el último pasa a ser el primero." }
          ],
          otro: "Parta de " + texto(R.unique) + "." },
        { tipo: "respuesta", titulo: "Después de <code>merge</code>",
          html: "<p>Con <code>l</code> como quedó y <code>b = &lt;" + OTRA.join(" ") + "&gt;</code>, ¿qué contiene <code>l</code> después de <code>l.merge(b)</code>, y cuánto vale <code>b.size()</code>?</p>",
          campos: [{ rotulo: "l =", esperado: texto(R.merge), ancho: "11rem" }, { rotulo: "b.size() =", esperado: String(R.b.length), ancho: "4rem" }],
          bien: "Correcto: " + texto(R.merge) + ", y b vacía. merge mezcla como en merge sort y se lleva los nodos de b; no copia ninguno.",
          distractores: [
            { valores: [texto(R.reverse.concat(OTRA)), null], msg: "merge no pega b al final: mezcla las dos en orden, como el paso de combinar de merge sort." },
            { valores: [null, String(OTRA.length)], msg: "Los nodos de b pasan a l; b no conserva copia y queda vacía." }
          ],
          otro: "Mezcle las dos listas ordenadas, tomando siempre el menor de los dos frentes." },
        { tipo: "opciones", titulo: "Nodos nuevos", columna: true, correcta: "cero",
          html: "<p>¿Cuántos nodos nuevos pide <code>l.merge(b)</code> cuando <code>l</code> tiene n<sub>a</sub> elementos y <code>b</code> tiene n<sub>b</sub>?</p>",
          opciones: [
            { op: "cero", texto: "Ninguno", msg: "Correcto. Los nodos de b se desenlazan de b y se enlazan en l: espacio aparte Θ(1)." },
            { op: "nb", texto: "n<sub>b</sub>, uno por cada elemento de <code>b</code>", msg: "Eso haría insert con cada elemento de b, que además deja b llena. merge empalma los mismos nodos." },
            { op: "suma", texto: "n<sub>a</sub> + n<sub>b</sub>, como el arreglo auxiliar de merge sort", msg: "En el arreglo hace falta un auxiliar porque los datos se copian. En la lista se reescriben enlaces." }
          ] },
        { tipo: "opciones", titulo: "Un <code>unique</code> que no borra", columna: true, correcta: "nada",
          html: "<p>¿Qué deja <code>l.unique()</code> en <code>l = &lt;3 1 3 1&gt;</code>?</p>",
          opciones: [
            { op: "dos", texto: "<code>3 1</code>", msg: "Para eso hace falta ordenar primero: después de l.sort(), la lista es 1 1 3 3 y unique deja 1 3." },
            { op: "nada", texto: "<code>3 1 3 1</code>, sin cambios", msg: "Correcto. Ningún nodo es igual al que tiene justo antes, así que no hay nada que borrar. El recorrido igual cuesta Θ(n)." },
            { op: "uno", texto: "<code>3</code>", msg: "unique no deja un solo valor: deja uno por cada grupo de iguales seguidos." }
          ] },
        { tipo: "pasos", titulo: "Paso a paso",
          pasos: [
            { texto: "list<int> l = {" + INICIAL.join(", ") + "};", html: nodos(R.inicial) },
            { texto: "l.unique(); desenlaza cada nodo igual al de atrás", html: nodos(R.unique) },
            { texto: "l.remove(4); desenlaza todos los 4", html: nodos(R.remove) },
            { texto: "l.reverse(); intercambia anterior y siguiente en cada nodo", html: nodos(R.reverse) },
            { texto: "l.merge(b); con b = <" + OTRA.join(" ") + ">, los nodos de b entran en orden", html: nodos(R.merge) + "<p>b:</p>" + nodos(R.b) }
          ] }
      ]
    };
  }

  return { inicial: INICIAL, otra: OTRA, unique: unique, remove: remove, reverse: reverse, merge: merge, correr: correr, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
