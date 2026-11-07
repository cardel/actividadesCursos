/* Ejercicio interactivo: el módulo heapq. heappush, heappop y heapify son los
   de Lib/heapq.py de CPython 3.14 (py.js); el dibujo del árbol y del arreglo
   es el de las actividades del montículo. Cada programa se corrió con
   python3 y la salida coincide con la que se calcula aquí. */
var EJERCICIO = (function () {
  var P = typeof module !== "undefined" ? require("./py.js") : Py;
  var M = typeof module !== "undefined" ? require("../monticulo/monti.js") : Monti;
  var H = P.Heapq;

  var LLEGAN = [50, 20, 35, 10, 40, 5];

  /* Un estado por comparación de cada heappush, con el árbol y el arreglo. */
  function pasosPush() {
    var h = [];
    var pasos = [{ html: M.vista([], {}), texto: "h = []" }];
    LLEGAN.forEach(function (k) {
      var reg = [];
      var antes = h.slice();
      H.heappush(h, k, reg);
      var actual = antes.concat([k]);
      var m0 = {};
      m0[actual.length - 1] = "sube";
      pasos.push({ html: M.vista(actual, m0), texto: "heappush(h, " + k + "): el " + k + " entra en h[" + (actual.length - 1) + "]" });
      reg.forEach(function (f) {
        var m = {};
        m[f.pos] = "sube";
        m[f.padre] = "compara";
        if (f.tipo === "sube") {
          pasos.push({ html: M.vista(actual, m), texto: k + " < " + f.otra + ", su padre en h[" + f.padre + "]: se intercambian" });
          var sig = actual.slice();
          sig[f.pos] = actual[f.padre];
          sig[f.padre] = k;
          actual = sig;
        } else {
          pasos.push({ html: M.vista(actual, m), texto: k + " ≥ " + f.otra + ", su padre en h[" + f.padre + "]: se queda" });
        }
      });
      if (reg.length > 0 && reg[reg.length - 1].tipo === "sube" && actual[0] === k) {
        pasos.push({ html: M.vista(actual, { 0: "hecho" }), texto: "el " + k + " llegó a la raíz: es el menor" });
      }
    });
    return pasos;
  }

  var CODIGO_POP = [
    "import heapq",
    "",
    "h = []",
    "for k in [" + LLEGAN.join(", ") + "]:",
    "    heapq.heappush(h, k)",
    "a = heapq.heappop(h)",
    "b = heapq.heappop(h)",
    "print(a, b, h)"
  ];

  function dosPop() {
    var h = [];
    LLEGAN.forEach(function (k) { H.heappush(h, k); });
    var a = H.heappop(h);
    var b = H.heappop(h);
    return a + " " + b + " " + P.lista(h);
  }

  var DATOS_HEAPIFY = [8, 3, 9, 1, 6, 2, 7];
  var CODIGO_HEAPIFY = [
    "import heapq",
    "",
    "datos = [" + DATOS_HEAPIFY.join(", ") + "]",
    "heapq.heapify(datos)",
    "print(datos)"
  ];

  function heapify() {
    var d = DATOS_HEAPIFY.slice();
    H.heapify(d);
    return P.lista(d);
  }

  var TAREAS = [[2, "lucia"], [1, "zoe"], [2, "ana"], [1, "mario"]];
  var CODIGO_TAREAS = [
    "import heapq",
    "",
    "t = []",
    "heapq.heappush(t, (2, \"lucia\"))",
    "heapq.heappush(t, (1, \"zoe\"))",
    "heapq.heappush(t, (2, \"ana\"))",
    "heapq.heappush(t, (1, \"mario\"))",
    "while len(t) > 0:",
    "    p, nombre = heapq.heappop(t)",
    "    print(nombre)"
  ];

  function tareas() {
    var t = [];
    TAREAS.forEach(function (x) { H.heappush(t, x); });
    var sal = [];
    while (t.length > 0) { sal.push(H.heappop(t)[1]); }
    return sal;
  }

  var MAYORES = [15, 4, 22, 9];
  var CODIGO_MAYORES = [
    "import heapq",
    "",
    "m = []",
    "for k in [" + MAYORES.join(", ") + "]:",
    "    heapq.heappush(m, -k)",
    "print(-heapq.heappop(m), -heapq.heappop(m))"
  ];

  function mayores() {
    var m = [];
    MAYORES.forEach(function (k) { H.heappush(m, -k); });
    var a = -H.heappop(m);
    var b = -H.heappop(m);
    return a + " " + b;
  }

  function spec() {
    var dp = dosPop();
    var hf = heapify();
    var ta = tareas();
    var my = mayores();
    var final = [];
    LLEGAN.forEach(function (k) { H.heappush(final, k); });
    return {
      contenedor: "tarjetas",
      cierre: "<p><code>heapq</code> guarda un montículo de mínimos en una <code>list</code>: el menor está en <code>h[0]</code>. <code>heappush</code> pone la clave al final y la sube, <code>heappop</code> pasa la última a la raíz y la baja hacia el menor de sus hijos, las dos en O(log n), y <code>heapify</code> arma el montículo en Θ(n). Para sacar el mayor se guardan las claves negadas, y con tuplas manda el primer campo y, si empata, el siguiente.</p>",
      cartas: [
        { tipo: "pasos", titulo: "Seis heappush",
          html: "<p>Sobre <code>h = []</code> entran " + LLEGAN.join(", ") + ", en ese orden. En naranja la clave que sube; en azul su padre.</p>",
          pasos: pasosPush() },
        { tipo: "respuesta", titulo: "Dos heappop",
          html: M.vista(final, {}) + P.codigo(CODIGO_POP) + "<p>El árbol es <code>h</code> después de los seis <code>heappush</code>. ¿Qué imprime?</p>",
          campos: [{ rotulo: "imprime:", esperado: dp, ancho: "14rem" }],
          bien: "Correcto. Sale el 5; el 35, la última clave, pasa a la raíz y baja hacia el 10, el menor de sus hijos. Sale el 10; ahora la última es el 40: pasa a la raíz y baja hacia el 20, y en h[1] su único hijo es el 50, mayor, así que se queda.",
          distractores: [
            { valores: ["5 10 [20, 50, 35, 40]"], msg: "En h[1] el 40 se compara con su único hijo, el 50. Como 40 < 50, no baja." },
            { valores: ["5 10 [20, 35, 50, 40]"], msg: "En el segundo heappop la última clave ya no es el 35, que quedó en h[2], sino el 40." },
            { valores: ["5 20 [10, 35, 40, 50]"], msg: "heappop siempre saca el menor de lo que queda. Después del 5, el menor es el 10." },
            { valores: ["50 40 [5, 10, 35, 20]"], msg: "heapq es de mínimos: sale el menor, no el mayor." }
          ],
          otro: "En cada heappop: guarde h[0], pase la última clave a la raíz y bájela cambiándola por el menor de sus hijos mientras sea mayor que él." },
        { tipo: "respuesta", titulo: "heapify",
          html: P.codigo(CODIGO_HEAPIFY) + "<p>heapify baja cada casilla con hijos, de h[2] a h[0], hacia el menor de sus hijos. ¿Qué imprime?</p>",
          campos: [{ rotulo: "imprime:", esperado: hf, ancho: "14rem" }],
          bien: "Correcto. h[2] = 9 baja hacia el 2; h[1] = 3 baja hacia el 1; h[0] = 8 baja hacia el 1 y luego hacia el 3.",
          distractores: [
            { valores: ["[1, 2, 3, 6, 7, 8, 9]"], msg: "Eso es la lista ordenada. Un montículo solo pide que cada padre sea menor o igual que sus hijos." },
            { valores: ["[9, 6, 8, 1, 3, 2, 7]"], msg: "Ese es un montículo de máximos. heapq arma uno de mínimos." }
          ],
          otro: "Dibuje el árbol de [8, 3, 9, 1, 6, 2, 7] y baje h[2], después h[1] y al final h[0], cada vez hacia el menor de los hijos." },
        { tipo: "opciones", titulo: "Tuplas con la misma prioridad", columna: true, correcta: "bien",
          html: P.codigo(CODIGO_TAREAS) + "<p>¿En qué orden imprime los nombres?</p>",
          opciones: [
            { op: "bien", texto: ta.join(", "), msg: "Correcto. Las tuplas se comparan campo por campo: primero la prioridad, y entre las de prioridad 1, el nombre en orden alfabético. Lo mismo entre las de 2." },
            { op: "llegada", texto: "zoe, mario, lucia, ana", msg: "Las prioridades están bien, pero el empate no lo decide el orden de llegada: lo decide el segundo campo de la tupla, el nombre." },
            { op: "mayor", texto: "ana, lucia, mario, zoe", msg: "heapq saca primero la tupla menor, y (1, ...) es menor que (2, ...)." },
            { op: "insercion", texto: "lucia, zoe, ana, mario", msg: "Ese es el orden en que entraron. heappop entrega por comparación de tuplas." }
          ] },
        { tipo: "respuesta", titulo: "El mayor primero",
          html: P.codigo(CODIGO_MAYORES) + "<p>¿Qué imprime?</p>",
          campos: [{ rotulo: "imprime:", esperado: my, ancho: "6rem" }],
          bien: "Correcto. En m quedan −22, −15, −9 y −4; los dos menores son −22 y −15, y al negarlos de nuevo salen 22 y 15.",
          distractores: [
            { valores: ["4 9"], msg: "Eso saldría sin negar. Aquí se guardó −k, así que el menor de m es el mayor de los originales." },
            { valores: ["-22 -15"], msg: "El print vuelve a negar lo que sale: −(−22) = 22." }
          ],
          otro: "Escriba las claves negadas, saque las dos menores y cámbieles el signo." },
        { tipo: "opciones", titulo: "¿Y el segundo menor?", columna: true, correcta: "dos",
          html: M.vista(final, {}) + "<p>En el montículo de las tarjetas anteriores, ¿dónde está el segundo menor?</p>",
          opciones: [
            { op: "uno", texto: "Siempre en h[1]", msg: "Aquí h[1] es 20 y h[2] es 10. El montículo solo ordena padres con hijos, no hermanos entre sí." },
            { op: "dos", texto: "En h[1] o en h[2]: es el menor de los dos hijos de la raíz", msg: "Correcto. Aquí es el 10, en h[2]. Cualquier otra clave tiene como ancestro a h[1] o a h[2], que es menor o igual." },
            { op: "fin", texto: "En la última casilla", msg: "La última casilla es una hoja, y las hojas suelen tener las claves grandes." }
          ] }
      ]
    };
  }

  return { spec: spec, dosPop: dosPop, heapify: heapify, tareas: tareas, mayores: mayores,
    CODIGO_POP: CODIGO_POP, CODIGO_HEAPIFY: CODIGO_HEAPIFY, CODIGO_TAREAS: CODIGO_TAREAS,
    CODIGO_MAYORES: CODIGO_MAYORES, pasosPush: pasosPush };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
