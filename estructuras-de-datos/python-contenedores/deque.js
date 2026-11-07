/* Ejercicio interactivo: collections.deque como cola. La simulación hace lo
   mismo que el deque de Python en cada extremo; el programa de la tarjeta 2
   se corrió con python3 y la salida coincide. */
var EJERCICIO = (function () {
  var P = typeof module !== "undefined" ? require("./py.js") : Py;

  /* La cola de impresión de la tarjeta 1, operación por operación. */
  var IMPRESION = [
    { op: "append", arg: "tesis" },
    { op: "append", arg: "foto" },
    { op: "appendleft", arg: "urgente" },
    { op: "append", arg: "acta" },
    { op: "popleft" },
    { op: "pop" },
    { op: "popleft" }
  ];

  function aplicar(d, paso) {
    var sale = null;
    if (paso.op === "append") { d.push(paso.arg); }
    if (paso.op === "appendleft") { d.unshift(paso.arg); }
    if (paso.op === "pop") { sale = d.pop(); }
    if (paso.op === "popleft") { sale = d.shift(); }
    return sale;
  }

  function pasosImpresion() {
    var d = [];
    var pasos = [{ html: P.dibujoDeque([]), texto: "cola = deque(): vacía" }];
    IMPRESION.forEach(function (paso) {
      var antes = d.slice();
      var sale = aplicar(d, paso);
      var marcas = {};
      var t;
      if (paso.op === "append") {
        marcas[d.length - 1] = "nueva";
        t = "cola.append(\"" + paso.arg + "\"): entra por la derecha";
        pasos.push({ html: P.dibujoDeque(d, marcas), texto: t });
      } else if (paso.op === "appendleft") {
        marcas[0] = "nueva";
        t = "cola.appendleft(\"" + paso.arg + "\"): entra por la izquierda, adelante de todos";
        pasos.push({ html: P.dibujoDeque(d, marcas), texto: t });
      } else {
        var m0 = {};
        m0[paso.op === "popleft" ? 0 : antes.length - 1] = "sale";
        t = "cola." + paso.op + "() devuelve \"" + sale + "\": sale por la " + (paso.op === "popleft" ? "izquierda" : "derecha");
        pasos.push({ html: P.dibujoDeque(antes, m0), texto: t });
        pasos.push({ html: P.dibujoDeque(d), texto: "quedan " + d.length + "; ninguna se corrió de lugar" });
      }
    });
    return pasos;
  }

  var CODIGO_SALIDA = [
    "from collections import deque",
    "",
    "d = deque([4, 8])",
    "d.appendleft(1)",
    "d.append(9)",
    "x = d.popleft()",
    "d.appendleft(x + 5)",
    "y = d.pop()",
    "d.append(y * 2)",
    "print(list(d), x, y)"
  ];

  function salida() {
    var d = [4, 8];
    d.unshift(1);
    d.push(9);
    var x = d.shift();
    d.unshift(x + 5);
    var y = d.pop();
    d.push(y * 2);
    return P.lista(d) + " " + x + " " + y;
  }

  function movimientosLista(n) {
    var total = 0;
    var quedan = n;
    while (quedan > 0) {
      total = total + (quedan - 1);
      quedan = quedan - 1;
    }
    return total;
  }

  function spec() {
    var s = salida();
    var mov = movimientosLista(1000);
    return {
      contenedor: "tarjetas",
      cierre: "<p>Un <code>deque</code> entra y saca por los dos extremos en Θ(1): <code>append</code> y <code>pop</code> por la derecha, <code>appendleft</code> y <code>popleft</code> por la izquierda. Con <code>append</code> y <code>popleft</code> es una cola. Una <code>list</code> con <code>pop(0)</code> hace lo mismo corriendo todo lo que queda, y n atenciones le cuestan Θ(n²). Lo que el <code>deque</code> no da barato es la posición del medio: <code>d[i]</code> es O(n).</p>",
      cartas: [
        { tipo: "pasos", titulo: "Una cola de impresión",
          html: P.codigo(["from collections import deque", "", "cola = deque()", "cola.append(\"tesis\")", "cola.append(\"foto\")", "cola.appendleft(\"urgente\")", "cola.append(\"acta\")", "cola.popleft()", "cola.pop()", "cola.popleft()"]) +
            "<p>Siga el estado después de cada operación.</p>",
          pasos: pasosImpresion() },
        { tipo: "respuesta", titulo: "Lo que imprime",
          html: P.codigo(CODIGO_SALIDA),
          campos: [{ rotulo: "imprime:", esperado: s, ancho: "14rem" }],
          bien: "Correcto. Después de appendleft(1) y append(9) quedan 1 4 8 9; popleft saca el 1 y entra el 6 por la izquierda; pop saca el 9 y entra el 18 por la derecha.",
          distractores: [
            { valores: ["[4, 8, 18] 1 9"], msg: "Falta el appendleft(x + 5): con x = 1 entra un 6 por la izquierda." },
            { valores: ["[6, 4, 8, 9, 18] 1 9"], msg: "pop() saca el 9 antes de que entre el 18." },
            { valores: ["[1, 4, 8, 18] 9 1"], msg: "popleft saca por la izquierda, donde estaba el 1, y pop por la derecha, donde estaba el 9." }
          ],
          otro: "Dibuje el deque de izquierda a derecha y actualícelo línea por línea." },
        { tipo: "respuesta", titulo: "Mil personas con pop(0)",
          html: P.codigo(["fila = list(range(1000))", "while len(fila) > 0:", "    persona = fila.pop(0)"]) +
            "<p>Cada <code>pop(0)</code> corre una casilla a la izquierda todas las que quedan detrás. ¿Cuántos movimientos hace el ciclo en total?</p>",
          campos: [{ rotulo: "movimientos:", esperado: String(mov), ancho: "7rem" }],
          bien: "Correcto. 999 + 998 + ⋯ + 1 + 0 = 999 · 1000 / 2 = 499500. Con deque y popleft son 0: nada se corre.",
          distractores: [
            { valores: ["500500"], msg: "Ese es 1 + 2 + ⋯ + 1000. El primer pop(0) corre 999, no 1000: la que sale no se mueve." },
            { valores: ["1000000"], msg: "Es del orden de n², pero la cuenta exacta es la mitad: cada vez quedan menos." },
            { valores: ["1000"], msg: "Ese sería el número de llamadas. Cada llamada corre lo que queda detrás." },
            { valores: ["0"], msg: "Eso vale para deque.popleft. Una list corre las casillas." }
          ],
          otro: "La primera llamada corre 999 casillas, la segunda 998, y así hasta la última. Sume." },
        { tipo: "opciones", titulo: "Una cola en Θ(1)", columna: true, correcta: "deque",
          html: "<p>¿Qué par de operaciones hace una cola, con el primero que entra como el primero que sale, en Θ(1) cada una?</p>",
          opciones: [
            { op: "listcero", texto: "<code>list</code>: <code>append</code> para entrar, <code>pop(0)</code> para salir", msg: "Es una cola, pero pop(0) corre todo lo que queda: Θ(n) por salida." },
            { op: "listpila", texto: "<code>list</code>: <code>append</code> para entrar, <code>pop()</code> para salir", msg: "Θ(1), pero sale el último que entró: eso es una pila." },
            { op: "deque", texto: "<code>deque</code>: <code>append</code> para entrar, <code>popleft</code> para salir", msg: "Correcto. Entra por la derecha y sale por la izquierda, y ninguna de las dos corre casillas." },
            { op: "dequepila", texto: "<code>deque</code>: <code>appendleft</code> para entrar, <code>popleft</code> para salir", msg: "Θ(1), pero entra y sale por el mismo extremo: otra pila." }
          ] },
        { tipo: "opciones", titulo: "La del medio", columna: true, correcta: "lista",
          html: "<p>Un programa guarda 100 000 lecturas y consulta muchas veces la de una posición cualquiera, <code>datos[i]</code>, sin agregar ni quitar. ¿Qué contenedor conviene?</p>",
          opciones: [
            { op: "deque", texto: "<code>deque</code>", msg: "En el deque, d[i] es Θ(1) cerca de los extremos y O(n) en el medio: recorre los bloques hasta llegar." },
            { op: "lista", texto: "<code>list</code>", msg: "Correcto. La dirección de l[i] se calcula: Θ(1) para cualquier i." },
            { op: "igual", texto: "Da lo mismo", msg: "No da lo mismo: la documentación de collections avisa que el acceso por índice del deque se vuelve O(n) en el medio." }
          ] }
      ]
    };
  }

  return { spec: spec, salida: salida, movimientosLista: movimientosLista, CODIGO_SALIDA: CODIGO_SALIDA };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
