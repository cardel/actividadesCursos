/* Ejercicio interactivo: los problemas de juez con ABB. Del preorden al
   posorden reinsertando, y el borrado que el juez compara por preorden. */
var EJERCICIO = (function () {
  var A = typeof module !== "undefined" ? require("./arbol.js") : ArbolBB;
  var PREORDEN = [63, 38, 21, 9, 30, 52, 45, 57, 80, 71, 94];
  var ORDENADO = [12, 24, 36, 48, 60, 72];
  var INSERCIONES = [30, 14, 52, 9, 21, 40, 67, 18];

  function desdePreorden(pre) {
    var r = A.armar(pre);
    return { posorden: A.posorden(r), altura: A.altura(r), mismo: A.preorden(r).join(" ") === pre.join(" ") };
  }

  function borrarRaiz(conPred) {
    var r = A.armar(INSERCIONES);
    r = conPred ? A.borrarPred(r, INSERCIONES[0]) : A.borrar(r, INSERCIONES[0]);
    return { preorden: A.preorden(r), inorden: A.inorden(r) };
  }

  function spec() {
    var d1 = desdePreorden(PREORDEN);
    var d2 = desdePreorden(ORDENADO);
    var suc = borrarRaiz(false);
    var pred = borrarRaiz(true);
    var antes = A.armar(INSERCIONES);
    return {
      contenedor: "tarjetas",
      cierre: "<p>En un preorden cada clave aparece después de todos sus antepasados. Al insertarla, su búsqueda pasa por ellos y la deja en el mismo lugar, así que insertar el preorden en el orden en que llega reconstruye el árbol, y el posorden sale con un recorrido. Si el preorden viene ordenado, el árbol es una lista y la reconstrucción cuesta Θ(n²). Al borrar con dos hijos, el sucesor y el predecesor dejan árboles válidos con el mismo inorden y distinto preorden; un juez que compara el preorden acepta solo el que pide su enunciado. Y si la salida pide un espacio antes de cada clave, se imprime con <code>printf(\" %d\", r->dato)</code>.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Del preorden al posorden",
          html: "<p>Llega el preorden de un ABB, una clave por línea: <b>" + PREORDEN.join(" ") + "</b>. Se pide el posorden. Reconstruya el árbol insertando las claves en el orden en que llegan. ¿Cuál es el posorden y cuál la altura?</p>",
          campos: [
            { rotulo: "posorden:", esperado: d1.posorden.join(" "), pista: "a b c …", ancho: "16rem" },
            { rotulo: "altura:", esperado: String(d1.altura), ancho: "3rem" }
          ],
          bien: "Correcto: los hijos antes que el padre, de izquierda a derecha, y la raíz, el 63, al final.",
          distractores: [
            { valores: [PREORDEN.slice().reverse().join(" "), null], msg: "Invertir el preorden da raíz al final, pero recorre el derecho antes que el izquierdo. El posorden visita izquierdo, derecho, raíz." },
            { valores: [PREORDEN.slice().sort(function (a, b) { return a - b; }).join(" "), null], msg: "Esas son las claves ordenadas: el inorden. El posorden deja cada padre después de sus dos subárboles." }
          ],
          otro: "Dibuje el árbol: el 63 es la raíz; el 38 y todo lo menor que 63 va a la izquierda. Luego recorra izquierdo, derecho, raíz." },
        { tipo: "opciones", titulo: "¿Por qué funciona reinsertar?", columna: true, correcta: "antepasados",
          html: "<p>Insertar las claves del preorden en el orden en que llegan reconstruye el mismo árbol. ¿Por qué?</p>",
          opciones: [
            { op: "antepasados", texto: "Porque en el preorden cada clave llega después de todos sus antepasados, y su búsqueda la deja en el mismo lugar.", msg: "Correcto. El 45, por ejemplo, llega después del 63, el 38 y el 52, y bajando por ellos cae como hijo izquierdo del 52." },
            { op: "raiz", texto: "Porque la primera clave del preorden es la raíz; el resto se acomoda solo.", msg: "Que la primera sea la raíz es necesario, pero no basta: el orden de las demás también importa. Si el 45 llegara antes que el 52, el árbol cambiaría." },
            { op: "cualquiera", texto: "Porque cualquier orden de las mismas claves arma el mismo ABB.", msg: "Las mismas claves en orden creciente arman una lista. La forma depende del orden de llegada." }
          ] },
        { tipo: "respuesta", titulo: "Un preorden ordenado",
          html: "<p>Ahora el preorden llega ordenado: <b>" + ORDENADO.join(" ") + "</b>. ¿Qué posorden se imprime y qué altura tiene el árbol?</p>",
          campos: [
            { rotulo: "posorden:", esperado: d2.posorden.join(" "), pista: "a b c …", ancho: "12rem" },
            { rotulo: "altura:", esperado: String(d2.altura), ancho: "3rem" }
          ],
          bien: "Correcto: cada clave es hija derecha de la anterior. El posorden sale al revés y la altura es n − 1. Con 10 000 claves así, la reconstrucción hace unos 5 · 10⁷ comparaciones.",
          distractores: [
            { valores: [ORDENADO.join(" "), null], msg: "En una lista hacia la derecha, el posorden termina en la raíz, el 12: primero sale el 72, que es la hoja." }
          ],
          otro: "Cada clave nueva es mayor que todas: cuelga a la derecha de la anterior." },
        { tipo: "respuesta", titulo: "Borrar la raíz que tiene dos hijos",
          html: "<p>Se insertan " + INSERCIONES.join(", ") + " y después se borra el " + INSERCIONES[0] + " con <code>borrar</code>, que sube el sucesor.</p>" + A.svg(antes) +
            "<p>¿Qué preorden y qué inorden imprime el árbol después?</p>",
          campos: [
            { rotulo: "preorden:", esperado: suc.preorden.join(" "), pista: "a b c …", ancho: "12rem" },
            { rotulo: "inorden:", esperado: suc.inorden.join(" "), pista: "a b c …", ancho: "12rem" }
          ],
          bien: "Correcto: el sucesor del 30 es el 40, hoja a la izquierda del 52. Sube a la raíz y el 52 se queda sin hijo izquierdo.",
          distractores: [
            { valores: [pred.preorden.join(" "), null], msg: "Ese preorden sale con el predecesor, el 21. El inorden coincide con el correcto, pero un juez que compara el preorden lo marca como respuesta incorrecta." },
            { valores: ["52 14 9 21 18 40 67", null], msg: "El hijo derecho no sube entero: sube la clave del sucesor, el mínimo del subárbol derecho, y el 52 se queda donde está." }
          ],
          otro: "Busque el mínimo del subárbol derecho del 30, copie su clave en la raíz y bórrelo de abajo." },
        { tipo: "opciones", titulo: "El formato de la salida", columna: true, correcta: "antes",
          html: "<p>El juez pide cada clave precedida de un espacio y ninguno al final de la línea, como <code>&nbsp;9 14 18</code>. ¿Qué instrucción va dentro del recorrido?</p>",
          opciones: [
            { op: "antes", texto: "<code>printf(\" %d\", r->dato);</code>", msg: "Correcto: el espacio va delante de cada clave, así que la línea empieza con espacio y termina en la última clave." },
            { op: "despues", texto: "<code>printf(\"%d \", r->dato);</code>", msg: "Así la línea termina en espacio y le falta el del comienzo." },
            { op: "nada", texto: "<code>printf(\"%d\", r->dato);</code>", msg: "Las claves quedan pegadas: 91418." }
          ] }
      ]
    };
  }

  return { preorden: PREORDEN, ordenado: ORDENADO, inserciones: INSERCIONES, desdePreorden: desdePreorden, borrarRaiz: borrarRaiz, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
