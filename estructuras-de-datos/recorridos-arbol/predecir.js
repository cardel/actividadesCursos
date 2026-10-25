/* Ejercicio interactivo: predecir el preorden, el inorden y el posorden de
   un árbol de nueve nodos antes de verlos numerados. */
var EJERCICIO = (function () {
  var A = (typeof Arbol !== "undefined") ? Arbol : require("../comun/arbol.js");
  var N = A.N;

  var CODIGO = [
    ["void preorden(Nodo *r) {", "  if (r != NULL) {", "    printf(\"%d \", r->dato);", "    preorden(r->izq);", "    preorden(r->der);", "  }", "}"],
    ["void inorden(Nodo *r) {", "  if (r != NULL) {", "    inorden(r->izq);", "    printf(\"%d \", r->dato);", "    inorden(r->der);", "  }", "}"],
    ["void posorden(Nodo *r) {", "  if (r != NULL) {", "    posorden(r->izq);", "    posorden(r->der);", "    printf(\"%d \", r->dato);", "  }", "}"]
  ].map(function (l) { return l.join("\n"); });

  function armar() {
    var cinco = N(5, N(11, null, null), null);
    var dos = N(2, N(6, null, null), cinco);
    var cuatro = N(4, N(3, null, null), N(8, null, null));
    var nueve = N(9, null, cuatro);
    return N(7, dos, nueve);
  }

  /* Los tres recorridos, cada uno con el printf en su lugar. */
  function preorden(r, sal) {
    if (r !== null) { sal.push(r.dato); preorden(r.izq, sal); preorden(r.der, sal); }
    return sal;
  }
  function inorden(r, sal) {
    if (r !== null) { inorden(r.izq, sal); sal.push(r.dato); inorden(r.der, sal); }
    return sal;
  }
  function posorden(r, sal) {
    if (r !== null) { posorden(r.izq, sal); posorden(r.der, sal); sal.push(r.dato); }
    return sal;
  }

  /* Por niveles, de arriba abajo y de izquierda a derecha: el error típico. */
  function porNiveles(r) {
    var res = [];
    var cola = [r];
    while (cola.length > 0) {
      var x = cola.shift();
      res.push(x.dato);
      if (x.izq !== null) { cola.push(x.izq); }
      if (x.der !== null) { cola.push(x.der); }
    }
    return res;
  }

  function numerar(orden) {
    var m = {};
    orden.forEach(function (d, i) { m[String(d)] = String(i + 1); });
    return m;
  }

  function spec() {
    var raiz = armar();
    var pre = preorden(raiz, []);
    var ino = inorden(raiz, []);
    var pos = posorden(raiz, []);
    var niveles = porNiveles(raiz);
    var preAlReves = pre.slice().reverse();
    return {
      contenedor: "tarjetas",
      cierre: "Los tres recorridos visitan los mismos nodos y cambian solo el momento de imprimir la raíz: antes de bajar, entre las dos bajadas o después de las dos. Preorden empieza por la raíz, posorden termina en ella e inorden la deja entre su subárbol izquierdo y el derecho. Un nodo sin hijo izquierdo sale en inorden apenas se llega a él, como el 9.",
      cartas: [
        { tipo: "respuesta", titulo: "Preorden",
          html: A.binario(raiz, { titulo: "árbol de nueve nodos con raíz 7" }) +
                "<div style=\"display:flex;flex-wrap:wrap;gap:0.5rem\">" + CODIGO.map(function (c) { return "<pre class=\"fragmento\" style=\"flex:1 1 200px\">" + A.escapar(c) + "</pre>"; }).join("") + "</div>" +
                "<p>¿Qué imprime <code>preorden(raiz)</code>? Escriba los números separados por espacios.</p>",
          campos: [{ rotulo: "preorden:", esperado: pre.join(" "), ancho: "16rem" }],
          bien: "Correcto: " + pre.join(" ") + ". Cada nodo sale antes que todo su subárbol, y el izquierdo completo antes que el derecho.",
          distractores: [
            { valores: [niveles.join(" ")], msg: "Ese es el orden por niveles. Preorden termina el subárbol izquierdo de 7 (2, 6, 5, 11) antes de pasar al 9." },
            { valores: [ino.join(" ")], msg: "Ese es el inorden: la raíz entre sus dos subárboles. En preorden la raíz va antes." }
          ],
          otro: "Imprima la raíz, recorra en preorden el subárbol izquierdo completo y después el derecho." },
        { tipo: "respuesta", titulo: "Inorden",
          html: "<p>¿Qué imprime <code>inorden(raiz)</code>?</p>",
          campos: [{ rotulo: "inorden:", esperado: ino.join(" "), ancho: "16rem" }],
          bien: "Correcto: " + ino.join(" ") + ". El 11 sale antes que el 5 porque es su hijo izquierdo, y el 9 sale antes que su subárbol porque no tiene izquierdo.",
          distractores: [
            { valores: ["6 2 5 11 7 9 3 4 8"], msg: "El 11 es hijo izquierdo de 5: en inorden sale antes que el 5." },
            { valores: ["6 2 11 5 7 3 4 8 9"], msg: "El 9 no tiene hijo izquierdo, así que se imprime en cuanto se llega a él, antes que su subárbol derecho." },
            { valores: [pre.join(" ")], msg: "Ese es el preorden." }
          ],
          otro: "Baje por la izquierda hasta un vacío antes de imprimir, imprima el nodo y siga por su derecha." },
        { tipo: "respuesta", titulo: "Posorden",
          html: "<p>¿Qué imprime <code>posorden(raiz)</code>?</p>",
          campos: [{ rotulo: "posorden:", esperado: pos.join(" "), ancho: "16rem" }],
          bien: "Correcto: " + pos.join(" ") + ". Cada nodo sale después de todo su subárbol, y la raíz de última.",
          distractores: [
            { valores: [preAlReves.join(" ")], msg: "Ese es el preorden al revés. Termina en la raíz, pero recorre el derecho antes que el izquierdo: es el posorden del espejo, no el de este árbol." },
            { valores: ["6 11 5 2 3 4 8 9 7"], msg: "El 4 tiene dos hijos, 3 y 8: sale después de los dos." }
          ],
          otro: "Recorra en posorden el subárbol izquierdo, después el derecho, y al final imprima la raíz." },
        { tipo: "pasos", titulo: "Los tres, numerados",
          html: "<p>El número rojo es el turno en que se imprime cada nodo.</p>",
          pasos: [
            { texto: "preorden: " + pre.join(" "), html: A.binario(raiz, { marcas: numerar(pre) }) },
            { texto: "inorden: " + ino.join(" "), html: A.binario(raiz, { marcas: numerar(ino) }) },
            { texto: "posorden: " + pos.join(" "), html: A.binario(raiz, { marcas: numerar(pos) }) }
          ] },
        { tipo: "opciones", titulo: "Mismo preorden, mismo inorden", columna: true, correcta: "derecha",
          html: "<p>Un árbol binario de varios nodos tiene el preorden igual a su inorden. ¿Qué se puede decir de él?</p>",
          opciones: [
            { op: "derecha", texto: "Ningún nodo tiene hijo izquierdo", msg: "Correcto. Si un nodo tuviera hijo izquierdo, en preorden saldría antes que ese hijo y en inorden después. Sin hijos izquierdos, los dos imprimen cada nodo al llegar a él: el árbol es una cadena que baja hacia la derecha." },
            { op: "lleno", texto: "Es un árbol lleno", msg: "En un árbol lleno la raíz sale primera en preorden y a la mitad en inorden." },
            { op: "uno", texto: "Tiene un solo nodo", msg: "Con un nodo pasa, pero también con 1, 2, 3 colgados cada uno a la derecha del anterior: los dos dan 1 2 3." }
          ] }
      ]
    };
  }

  return { codigo: CODIGO, armar: armar, preorden: preorden, inorden: inorden, posorden: posorden, porNiveles: porNiveles, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
