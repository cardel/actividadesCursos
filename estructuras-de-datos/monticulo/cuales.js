/* Ejercicio interactivo: decidir si un arreglo es un montículo de máximos,
   revisando la forma y el orden de cada pareja padre e hijo. */
var EJERCICIO = (function () {
  var M = typeof module !== "undefined" ? require("./monti.js") : Monti;

  /* null marca un lugar vacío del árbol. */
  var CASOS = {
    a: [72, 41, 69, 38, 45, 60, 11],
    b: [90, 88, 30, 87, 86, 29, 28],
    c: [80, 50, 60, null, 20],
    d: [72, 64, 70, 35, 64, 15, 70],
    e: [4, 18, 9, 30, 25, 12]
  };

  /* "si", "forma" o "orden". */
  function veredicto(a) {
    var res = "si";
    if (!M.esCompleto(a)) {
      res = "forma";
    } else if (M.primeraRota(a) !== -1) {
      res = "orden";
    }
    return res;
  }

  function carta(k, titulo, msgs) {
    var a = CASOS[k];
    var marcas = {};
    return {
      tipo: "opciones", titulo: titulo, columna: true, correcta: veredicto(a),
      html: "<p>¿Es un montículo de máximos?</p>" + M.vista(a, marcas, { titulo: "árbol " + k }),
      opciones: [
        { op: "si", texto: "Sí: es completo y cada nodo es mayor o igual que sus hijos.", msg: msgs.si },
        { op: "forma", texto: "No: la forma no es la de un árbol completo.", msg: msgs.forma },
        { op: "orden", texto: "No: hay un hijo mayor que su padre.", msg: msgs.orden }
      ]
    };
  }

  function spec() {
    var ra = M.primeraRota(CASOS.a);
    var re = M.primeraRota(CASOS.e);
    return {
      contenedor: "tarjetas",
      cierre: "<p>Un arreglo es un montículo de máximos si no tiene huecos y cada casilla i ≥ 1 cumple a[(i − 1) / 2] ≥ a[i]. Basta comparar cada casilla con su padre, una vez: Θ(n). No importa que una clave sea menor que la raíz ni que un nivel tenga claves mayores que otro: entre ramas distintas no se pide ningún orden.</p>",
      cartas: [
        carta("a", "Arreglo a", {
          si: "Mire la casilla 4: el 45 cuelga del 41.",
          forma: "La forma está bien: siete claves sin huecos llenan tres niveles.",
          orden: "Correcto. El 45 está en la casilla 4 y su padre es la casilla 1, el 41. Que el 45 sea menor que el 72 de la raíz no basta: se compara con su padre."
        }),
        { tipo: "respuesta", titulo: "La casilla que falla",
          html: "<p>En el arreglo a, ¿cuál es la primera casilla i ≥ 1 cuya clave es mayor que la de su padre? ¿En qué casilla está ese padre?</p>",
          campos: [
            { rotulo: "casilla:", esperado: String(ra), ancho: "3rem" },
            { rotulo: "su padre:", esperado: String(M.padre(ra)), ancho: "3rem" }
          ],
          bien: "Correcto. Las casillas 1, 2 y 3 cumplen; la 4 no, porque 45 > 41.",
          distractores: [
            { valores: ["5", null], msg: "El 60 de la casilla 5 cuelga del 69 de la casilla 2, y 60 ≤ 69: esa pareja cumple." },
            { valores: [null, "2"], msg: "Con índices desde 0, el padre de 4 es (4 − 1) / 2 = 1." }
          ],
          otro: "Recorra desde la casilla 1 y compare cada clave con la de (i − 1) / 2." },
        carta("b", "Arreglo b", {
          si: "Correcto. El 30 es menor que el 87 y el 86, pero no es su padre: está en la otra rama. Cada clave se compara solo con su padre.",
          forma: "Siete claves sin huecos: la forma está bien.",
          orden: "El 87 y el 86 son hijos del 88, no del 30, y 88 ≥ 87 y 88 ≥ 86. Entre una rama y otra no se pide ningún orden."
        }),
        carta("c", "Arreglo c", {
          si: "Las claves cumplen el orden, pero el árbol tiene un hueco en la casilla 3 y una clave en la 4.",
          forma: "Correcto. Falta el hijo izquierdo del 50 y está el derecho: el último nivel no se llenó de izquierda a derecha. Como arreglo, quedaría una casilla vacía en medio.",
          orden: "Revise las parejas: 80 ≥ 50, 80 ≥ 60 y 50 ≥ 20. Lo que falla es otra cosa."
        }),
        carta("d", "Arreglo d", {
          si: "Correcto. Con claves iguales, mayor o igual se cumple: el 64 bajo el 64 y el 70 bajo el 70 están bien.",
          forma: "Siete claves sin huecos: la forma está bien.",
          orden: "Un hijo igual a su padre no rompe nada: la condición es mayor o igual."
        }),
        carta("e", "Arreglo e", {
          si: "Mire la raíz: un montículo de máximos tiene el mayor en a[0].",
          forma: "Seis claves sin huecos: la forma está bien.",
          orden: "Correcto. Es un montículo de mínimos: cada nodo es menor o igual que sus hijos. Como montículo de máximos falla desde la casilla 1, porque 18 > 4."
        }),
        { tipo: "respuesta", titulo: "Mínimos",
          html: "<p>En el arreglo e, ¿cuál es la primera casilla que falla como montículo de máximos? ¿Cuántas parejas padre e hijo se revisan, en total, para decidir que el arreglo d sí es un montículo?</p>",
          campos: [
            { rotulo: "casilla:", esperado: String(re), ancho: "3rem" },
            { rotulo: "parejas en d:", esperado: String(CASOS.d.length - 1), ancho: "3rem" }
          ],
          bien: "Correcto. En e falla la casilla 1. Para d se revisan las casillas 1 a 6, una pareja por casilla: n − 1 comparaciones.",
          distractores: [
            { valores: [null, "21"], msg: "No hace falta comparar cada clave con todas: si cada una cumple con su padre, el orden sigue hacia arriba. Son n − 1 parejas." },
            { valores: [null, "3"], msg: "Hay tres padres, pero cada pareja padre e hijo es una comparación: cuente una por casilla desde la 1." }
          ],
          otro: "Cada casilla desde la 1 se compara una vez con su padre." }
      ]
    };
  }

  return { CASOS: CASOS, veredicto: veredicto, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
