/* Ejercicio interactivo: buscar y eliminar en una tabla con encadenamiento. */
var EJERCICIO = (function () {
  var M = 9;
  var CLAVES = [27, 14, 5, 36, 23, 18, 41];

  function construir() {
    var t = [];
    var i = 0;
    while (i < M) { t.push([]); i = i + 1; }
    CLAVES.forEach(function (k) { t[k % M].unshift(k); });
    return t;
  }

  /* Comparaciones de buscar(k): nodos visitados hasta hallar k o llegar a NULL. */
  function comparaciones(t, k) {
    var l = t[k % M];
    var c = 0;
    var hallada = false;
    while (c < l.length && !hallada) {
      if (l[c] === k) { hallada = true; }
      c = c + 1;
    }
    return { comparaciones: c, esta: hallada };
  }

  function eliminar(t, k) {
    var l = t[k % M];
    var p = l.indexOf(k);
    if (p >= 0) { l.splice(p, 1); }
    return p;
  }

  function dibujar(t) {
    return t.map(function (l, i) {
      return i + ": " + (l.length === 0 ? "NULL" : l.join(" → ") + " → NULL");
    }).join("\n");
  }

  var CONSULTAS = [23, 14, 50, 3];

  function spec() {
    var t = construir();
    var res = CONSULTAS.map(function (k) { return comparaciones(t, k); });
    var t2 = construir();
    eliminar(t2, 41);
    var tras41 = t2[5].join(" ");
    eliminar(t2, 5);
    var tras5 = t2[5].join(" ");
    return {
      contenedor: "tarjetas",
      cierre: "Buscar recorre una sola lista, la de h(k): se detiene al hallar la clave o al llegar a NULL. Una búsqueda que falla recorre la lista entera, y una casilla vacía responde sin comparar. Eliminar es la misma búsqueda con un puntero al anterior; si la clave está en la cabeza no hay anterior, y la que cambia es la casilla.",
      cartas: [
        { tipo: "respuesta", titulo: "Cuántas comparaciones",
          html: "<p>Con m = " + M + " se insertaron, colgando al frente, " + CLAVES.join(", ") + ". La tabla quedó así:</p><pre class=\"fragmento\">" + dibujar(t) + "</pre><p>¿Cuántas claves compara cada búsqueda?</p>",
          campos: CONSULTAS.map(function (k, i) { return { rotulo: "buscar " + k + ":", esperado: String(res[i].comparaciones), ancho: "3rem" }; }),
          bien: "Correcto. 23 está en el segundo nodo de la casilla 5; 14 en el último; 50 cae en la casilla 5 y no está, así que se recorren los cuatro nodos; 3 cae en una casilla vacía y no compara con nadie.",
          distractores: [
            { valores: [null, null, "0", null], msg: "50 mod 9 = 5: la casilla 5 tiene cuatro nodos y hay que verlos todos para saber que 50 no está." },
            { valores: [null, null, null, "1"], msg: "La casilla 3 guarda NULL: el ciclo no entra y no se compara ninguna clave." }
          ],
          otro: "Calcule h(k) = k mod 9 y cuente los nodos que se visitan en esa lista." },
        { tipo: "respuesta", titulo: "Eliminar",
          html: "<p>Sobre la tabla de arriba se elimina 41 y después 5. ¿Cómo queda la lista de la casilla 5 tras cada eliminación?</p>",
          campos: [
            { rotulo: "tras eliminar 41:", esperado: tras41, pista: "a b c", ancho: "7rem" },
            { rotulo: "tras eliminar 5:", esperado: tras5, pista: "a b", ancho: "7rem" }
          ],
          bien: "Correcto: sin 41 la cabeza pasa a ser 23; sin 5, el siguiente de 23 pasa a ser 14.",
          otro: "Quite el nodo y una a su anterior con su siguiente." },
        { tipo: "opciones", titulo: "Qué puntero cambia", columna: true, correcta: "casilla",
          html: "<p>Al eliminar 41, el ciclo de búsqueda termina con <code>anterior == NULL</code> y <code>actual</code> en el 41. ¿Qué asignación lo desenlaza?</p>",
          opciones: [
            { op: "casilla", texto: "<code>casillas[5] = actual-&gt;siguiente;</code>", msg: "Correcto. 41 era la cabeza: no hay nodo anterior que reescribir, así que la casilla apunta al 23." },
            { op: "anterior", texto: "<code>anterior-&gt;siguiente = actual-&gt;siguiente;</code>", msg: "anterior vale NULL: esa línea desreferencia un puntero nulo y el programa termina con violación de segmento." },
            { op: "delete", texto: "Basta con <code>delete actual;</code>", msg: "La casilla seguiría apuntando a la memoria liberada, y la siguiente búsqueda en la casilla 5 leería un nodo que ya no existe." }
          ] },
        { tipo: "opciones", titulo: "Lo que cuesta eliminar", columna: true, correcta: "busqueda",
          html: "<p>En una tabla con n claves y m casillas, con las claves bien repartidas, ¿cuánto cuesta eliminar?</p>",
          opciones: [
            { op: "busqueda", texto: "Θ(1 + α) en promedio: se busca en una lista y desenlazar es Θ(1)", msg: "Correcto. La búsqueda con anterior recorre una sola lista; reescribir un puntero y liberar el nodo no depende de n." },
            { op: "uno", texto: "Θ(1): solo se reescribe un puntero", msg: "Reescribir es Θ(1), pero antes hay que encontrar el nodo y su anterior en la lista." },
            { op: "n", texto: "Θ(n) siempre: hay que recorrer la tabla", msg: "Solo se recorre la lista de h(k). Θ(n) es el peor caso, cuando todas las claves cayeron en esa lista." }
          ] }
      ]
    };
  }

  return { m: M, construir: construir, comparaciones: comparaciones, eliminar: eliminar, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
