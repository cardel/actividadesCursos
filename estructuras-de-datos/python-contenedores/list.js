/* Ejercicio interactivo: la list de Python por dentro. Las capacidades salen
   de list_resize de CPython 3.14 (py.js); cada programa se corrió con
   python3 y su salida coincide con la que se calcula aquí. */
var EJERCICIO = (function () {
  var P = typeof module !== "undefined" ? require("./py.js") : Py;

  var DIEZ = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];

  /* Diez append sobre una lista vacía, con el arreglo en cada paso. */
  function pasosDiez() {
    var reg = P.crecer(DIEZ.length);
    var pasos = [{ html: P.dibujoLista([], 0, {}, "l"), texto: "l = []: sin casillas, capacidad 0" }];
    reg.forEach(function (r, i) {
      var vals = DIEZ.slice(0, i + 1);
      var marcas = {};
      var t;
      if (r.cambia) {
        var k = 0;
        while (k < i) { marcas[k] = "mira"; k = k + 1; }
        marcas[i] = "nueva";
        if (r.copia === 0) {
          t = "append(" + DIEZ[i] + "): la lista vacía pide su primer arreglo, de " + r.cap + " casillas";
        } else {
          t = "append(" + DIEZ[i] + "): no cabe; arreglo nuevo de " + r.cap + " casillas y se copian las " +
            r.copia + " referencias";
        }
      } else {
        marcas[i] = "nueva";
        t = "append(" + DIEZ[i] + "): cabe en la casilla " + i + ", nada se copia";
      }
      pasos.push({ html: P.dibujoLista(vals, r.cap, marcas, "l"), texto: t });
    });
    return pasos;
  }

  /* El programa de la tarjeta 2: capacidad y cambios tras m append. */
  var CODIGO_CUARENTA = [
    "import sys",
    "",
    "l = []",
    "cambios = 0",
    "anterior = 0",
    "i = 0",
    "while i < 40:",
    "    l.append(i)",
    "    cap = (sys.getsizeof(l) - sys.getsizeof([])) // 8",
    "    if cap != anterior:",
    "        cambios = cambios + 1",
    "        anterior = cap",
    "    i = i + 1",
    "print(cap, cambios)"
  ];

  function cuarenta(m) {
    var reg = P.crecer(m);
    var cambios = reg.filter(function (r) { return r.cambia; }).length;
    var copiadas = reg.reduce(function (s, r) { return s + r.copia; }, 0);
    return { cap: reg[reg.length - 1].cap, cambios: cambios, copiadas: copiadas };
  }

  /* Duplicar en cada cambio, como lo haría un vector que dobla: el distractor. */
  function doblando(m) {
    var cap = 1, cambios = 1;
    while (cap < m) { cap = cap * 2; cambios = cambios + 1; }
    return { cap: cap, cambios: cambios };
  }

  /* El programa de la tarjeta 3, con los movimientos de cada operación. */
  var CODIGO_MOVER = [
    "l = [10, 20, 30, 40, 50, 60]",
    "l.insert(2, 25)",
    "l.pop(0)",
    "l.pop()",
    "l.insert(len(l), 70)",
    "print(l)"
  ];

  function mover() {
    var l = [10, 20, 30, 40, 50, 60];
    var mov = 0;
    mov = mov + (l.length - 2); l.splice(2, 0, 25);
    mov = mov + (l.length - 1); l.splice(0, 1);
    l.pop();
    mov = mov + 0; l.push(70);
    return { lista: P.lista(l), mov: mov };
  }

  function spec() {
    var c40 = cuarenta(40);
    var d40 = doblando(40);
    var mv = mover();
    return {
      contenedor: "tarjetas",
      cierre: "<p>Una <code>list</code> es un arreglo de referencias con capacidad de sobra. <code>append</code> casi siempre cabe; cuando no, el arreglo crece en proporción a su tamaño y las copias se reparten: O(1) amortizado. Lo que cuesta es correr casillas: <code>insert(k, x)</code> y <code>pop(k)</code> mueven las n − k de la derecha, y <code>x in l</code> compara de una en una.</p>",
      cartas: [
        { tipo: "pasos", titulo: "Diez append sobre una lista vacía",
          html: "<p>Se agregan " + DIEZ.join(", ") + ", uno por uno. Las casillas en punteado son capacidad sin usar; las azules, las referencias que se copian al arreglo nuevo.</p>",
          pasos: pasosDiez() },
        { tipo: "respuesta", titulo: "Cuarenta append",
          html: P.codigo(CODIGO_CUARENTA) + "<p>La capacidad crece como en la tarjeta anterior: 4, 8, 16, 24, y de ahí en adelante en un octavo del tamaño, redondeado a múltiplo de 4. ¿Qué imprime?</p>",
          campos: [
            { rotulo: "capacidad:", esperado: String(c40.cap), ancho: "4rem" },
            { rotulo: "cambios:", esperado: String(c40.cambios), ancho: "4rem" }
          ],
          bien: "Correcto. La capacidad pasa por 4, 8, 16, 24, 32 y 40: seis arreglos distintos, y con 40 elementos el último está lleno. Si cada cambio copia lo que había, son 0 + 4 + 8 + 16 + 24 + 32 = " + c40.copiadas + " referencias para 40 append: menos de tres por llamada.",
          distractores: [
            { valores: [String(d40.cap), null], msg: "Así crecería un arreglo que duplica su tamaño. CPython agrega un octavo más unas casillas: después de 16 viene 24, no 32." },
            { valores: ["40", "5"], msg: "La capacidad está bien. Cuente también el primer cambio: de 0 a 4 casillas con el primer append." },
            { valores: ["40", "40"], msg: "No cambia en cada append: casi todas caben en la capacidad de sobra." }
          ],
          otro: "Escriba la sucesión de capacidades desde 0 hasta llegar a 40 o más, y cuente cuántas hay después del 0." },
        { tipo: "respuesta", titulo: "Lo que se corre",
          html: P.codigo(CODIGO_MOVER) + "<p>Escriba lo que imprime y cuántas referencias se movieron de casilla en total, sin contar las que se escriben nuevas.</p>",
          campos: [
            { rotulo: "imprime:", esperado: mv.lista, ancho: "13rem" },
            { rotulo: "movidas:", esperado: String(mv.mov), ancho: "4rem" }
          ],
          bien: "Correcto. insert(2, 25) corre las 4 de la derecha; pop(0) corre las 6 que quedan detrás; pop() y el insert al final no corren nada. Son 10 movimientos.",
          distractores: [
            { valores: [null, "4"], msg: "pop(0) también corre: las 6 casillas que quedan detrás de la primera bajan un lugar." },
            { valores: [null, "11"], msg: "Insertar en la posición len(l) es lo mismo que append: no hay nada a la derecha que correr." },
            { valores: [null, "17"], msg: "pop() quita la última casilla y no mueve las demás." },
            { valores: ["[10, 20, 25, 30, 40, 50, 70]", null], msg: "pop(0) quitó el 10 y pop() el 60 antes de agregar el 70." }
          ],
          otro: "Lleve la lista después de cada línea y, en cada operación, cuente cuántas casillas quedan a la derecha de donde se inserta o se quita." },
        { tipo: "opciones", titulo: "Armar una lista de n números", columna: true, correcta: "append",
          html: "<p>Tres maneras de guardar los números del 0 al n − 1 en orden. ¿Cuál cuesta Θ(n) en total?</p>" +
            P.codigo(["# A", "l = []", "for x in range(n):", "    l.append(x)", "", "# B", "l = []", "for x in range(n - 1, -1, -1):", "    l.insert(0, x)", "", "# C", "l = []", "for x in range(n):", "    l = l + [x]"]),
          opciones: [
            { op: "append", texto: "A", msg: "Correcto. Cada append es O(1) amortizado: n llamadas cuestan Θ(n)." },
            { op: "insert", texto: "B", msg: "insert(0, x) corre todo lo que ya está: 0 + 1 + ⋯ + (n − 1) = n(n − 1)/2 movimientos, Θ(n²)." },
            { op: "suma", texto: "C", msg: "l + [x] arma una lista nueva y copia las que ya había en cada vuelta: Θ(n²) en total." },
            { op: "todas", texto: "Las tres", msg: "Las tres dan la misma lista, pero solo A evita mover o copiar lo que ya estaba." }
          ] },
        { tipo: "opciones", titulo: "Buscar muchas veces", columna: true, correcta: "nm",
          html: "<p><code>datos</code> es una <code>list</code> de n números y <code>consultas</code>, una de m.</p>" +
            P.codigo(["encontrados = 0", "for x in consultas:", "    if x in datos:", "        encontrados = encontrados + 1"]) + "<p>¿Cuánto cuesta en el peor caso?</p>",
          opciones: [
            { op: "m", texto: "O(m)", msg: "Eso valdría si x in datos costara O(1). En una list compara de una en una: O(n) cada vez." },
            { op: "nm", texto: "O(n · m)", msg: "Correcto. Cada consulta recorre la lista en el peor caso. Con un set de los datos, armado una vez en O(n), cada consulta costaría O(1) en promedio: O(n + m)." },
            { op: "nlogm", texto: "O(m log n)", msg: "Eso sería con búsqueda binaria sobre una lista ordenada. x in l no ordena ni parte por la mitad." }
          ] }
      ]
    };
  }

  return { spec: spec, pasosDiez: pasosDiez, cuarenta: cuarenta, mover: mover,
    CODIGO_CUARENTA: CODIGO_CUARENTA, CODIGO_MOVER: CODIGO_MOVER };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
