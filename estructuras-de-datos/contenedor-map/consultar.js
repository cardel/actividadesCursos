/* Ejercicio interactivo: find, count y erase sobre un map<int, int>. */
var EJERCICIO = (function () {
  var INICIAL = [[14, 2], [27, 9], [63, 4]];

  function copia() { return INICIAL.map(function (p) { return [p[0], p[1]]; }); }
  function indice(m, k) {
    var i = 0;
    var r = -1;
    while (i < m.length && r < 0) {
      if (m[i][0] === k) { r = i; }
      i = i + 1;
    }
    return r;
  }
  function count(m, k) { return indice(m, k) >= 0 ? 1 : 0; }
  /* find: indice de la pareja, o m.length, que hace las veces de end(). */
  function find(m, k) { var i = indice(m, k); return i >= 0 ? i : m.length; }
  function erase(m, k) {
    var i = indice(m, k);
    var r = 0;
    if (i >= 0) { m.splice(i, 1); r = 1; }
    return r;
  }

  /* count(27), count(30), erase(63), erase(63) sobre el map inicial. */
  function respuestas() {
    var m = copia();
    var a = count(m, 27);
    var b = count(m, 30);
    var c = erase(m, 63);
    var d = erase(m, 63);
    return [a, b, c, d];
  }

  /* find(30); count(41); erase(99); m[14] = 0; y el tamano que queda. */
  function tamanoFinal() {
    var m = copia();
    find(m, 30);
    count(m, 41);
    erase(m, 99);
    m[indice(m, 14)][1] = 0;
    return m.length;
  }

  function spec() {
    var r = respuestas();
    var inicial = INICIAL.map(function (p) { return "(" + p[0] + ", " + p[1] + ")"; }).join(" ");
    return {
      contenedor: "tarjetas",
      cierre: "count dice si la clave está, con 1 o 0; find devuelve un iterador a su pareja o end() si no está, y end() no se desreferencia; erase saca la pareja y devuelve cuántas sacó. Ninguna de las tres inserta. El valor de una pareja se cambia por el iterador; la clave no.",
      cartas: [
        { tipo: "respuesta", titulo: "Lo que devuelve cada una",
          html: "<p>El map tiene " + inicial + ". Se ejecuta, en este orden:</p><pre class=\"fragmento\">m.count(27)\nm.count(30)\nm.erase(63)\nm.erase(63)</pre><p>¿Qué devuelve cada llamada?</p>",
          campos: [
            { rotulo: "count(27):", esperado: String(r[0]), ancho: "3rem" },
            { rotulo: "count(30):", esperado: String(r[1]), ancho: "3rem" },
            { rotulo: "erase(63):", esperado: String(r[2]), ancho: "3rem" },
            { rotulo: "erase(63):", esperado: String(r[3]), ancho: "3rem" }
          ],
          bien: "Correcto. 27 está y 30 no; el primer erase saca a 63 y devuelve 1, y el segundo ya no lo encuentra y devuelve 0.",
          distractores: [
            { valores: [null, null, null, "1"], msg: "Después del primer erase, 63 ya no está: el segundo devuelve 0 y no cambia nada." },
            { valores: ["9", null, null, null], msg: "count no devuelve el valor de la pareja sino cuántas veces está la clave: 1 o 0." },
            { valores: [null, null, "4", null], msg: "erase devuelve cuántas parejas sacó, no el valor que tenía." }
          ],
          otro: "count da 1 o 0; erase devuelve cuántas parejas sacó." },
        { tipo: "opciones", titulo: "Buscar una clave que no está", columna: true, correcta: "end",
          html: "<p>Con el map " + inicial + ":</p><pre class=\"fragmento\">map&lt;int, int&gt;::iterator f = m.find(30);</pre><p>¿Qué es <code>f</code>?</p>",
          opciones: [
            { op: "end", texto: "<code>m.end()</code>: la posición después de la mayor clave", msg: "Correcto. Antes de leer f-&gt;second hay que comparar f con m.end(): end() no apunta a ninguna pareja." },
            { op: "cero", texto: "Un iterador a una pareja nueva (30, 0)", msg: "Eso haría m[30]. find no inserta nada." },
            { op: "vecina", texto: "Un iterador a la pareja de 27, la clave más cercana", msg: "find busca la clave exacta. Si no está, devuelve end()." }
          ] },
        { tipo: "opciones", titulo: "Cambiar por el iterador", columna: true, correcta: "valor",
          html: "<pre class=\"fragmento\">map&lt;int, int&gt;::iterator it = m.find(27);</pre><p>¿Cuál de estas líneas es válida?</p>",
          opciones: [
            { op: "valor", texto: "<code>it-&gt;second = it-&gt;second + 1;</code>", msg: "Correcto: el valor se puede cambiar, y la pareja de 27 pasa a (27, 10)." },
            { op: "clave", texto: "<code>it-&gt;first = 28;</code>", msg: "No compila: la clave es constante. Cambiarla en su sitio rompería el orden; se saca la pareja y se inserta otra." },
            { op: "ambas", texto: "Las dos", msg: "Solo el valor se cambia por el iterador. La clave no." }
          ] },
        { tipo: "respuesta", titulo: "Nada de esto inserta",
          html: "<p>Sobre el map inicial " + inicial + " se ejecuta:</p><pre class=\"fragmento\">m.find(30);\nm.count(41);\nm.erase(99);\nm[14] = 0;</pre><p>¿Cuánto vale <code>m.size()</code>?</p>",
          campos: [{ rotulo: "size:", esperado: String(tamanoFinal()), ancho: "3rem" }],
          bien: "Correcto. find, count y erase de claves ausentes no cambian el map, y poner el valor de 14 en 0 no lo saca.",
          distractores: [
            { valores: ["2"], msg: "m[14] = 0 cambia el valor, pero 14 sigue en el map. Solo erase saca una pareja." },
            { valores: ["5"], msg: "find y count no insertan. Solo m[k] inserta cuando k no está." },
            { valores: ["4"], msg: "Ninguna de las cuatro líneas inserta: 14 ya estaba cuando se usó m[14]." }
          ],
          otro: "Revise cuál de las cuatro operaciones cambia el número de parejas." }
      ]
    };
  }

  return { inicial: INICIAL, count: count, find: find, erase: erase, respuestas: respuestas, tamanoFinal: tamanoFinal, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
