/* Ejercicio interactivo: factor de carga, lista más larga y peor caso. */
var EJERCICIO = (function () {
  var M = 10;
  var CLAVES = [13, 25, 33, 47, 53, 61, 73, 89];

  function largos(claves, m) {
    var l = [];
    var i = 0;
    while (i < m) { l.push(0); i = i + 1; }
    claves.forEach(function (k) { l[k % m] = l[k % m] + 1; });
    return l;
  }

  function resumen(claves, m) {
    var l = largos(claves, m);
    return {
      alfa: claves.length / m,
      mayor: Math.max.apply(null, l),
      vacias: l.filter(function (x) { return x === 0; }).length
    };
  }

  /* Peor caso: n claves en una sola lista; una búsqueda que falla las compara todas. */
  var N_PEOR = 40;
  var M_PEOR = 13;

  function spec() {
    var r = resumen(CLAVES, M);
    return {
      contenedor: "tarjetas",
      cierre: "α = n/m es el promedio de los largos, no el máximo: con las claves mal repartidas una lista puede medir n, y buscar cuesta Θ(n) como en la lista enlazada. Con hashing uniforme independiente buscar y eliminar cuestan Θ(1 + α) en promedio, y si m crece con n, con m ≥ n/2, 1 + α no pasa de 3. La tabla ocupa Θ(m + n).",
      cartas: [
        { tipo: "respuesta", titulo: "Ocho claves, diez casillas",
          html: "<p>Se insertan " + CLAVES.join(", ") + " en una tabla de m = " + M + " casillas con h(k) = k mod " + M + ". Escriba α con punto decimal, el largo de la lista más larga y el número de casillas vacías.</p>",
          campos: [
            { rotulo: "α =", esperado: String(r.alfa), ancho: "4rem" },
            { rotulo: "más larga:", esperado: String(r.mayor), ancho: "3rem" },
            { rotulo: "vacías:", esperado: String(r.vacias), ancho: "3rem" }
          ],
          bien: "Correcto: α = 8/10 = 0,8, pero 13, 33, 53 y 73 terminan en 3 y la lista de la casilla 3 mide 4. Las claves solo usan casillas impares: las cinco pares quedan vacías.",
          distractores: [
            { valores: ["0.8", "1", null], msg: "α es el promedio. La casilla 3 recibe a 13, 33, 53 y 73." },
            { valores: ["1.25", null, null], msg: "α = n/m = 8/10, claves entre casillas." }
          ],
          otro: "Con m = 10 la casilla es el último dígito. Anote cuántas claves terminan en cada dígito." },
        { tipo: "respuesta", titulo: "El peor caso",
          html: "<p>Una tabla de m = " + M_PEOR + " casillas tiene n = " + N_PEOR + " claves, y todas cayeron en la casilla 6. ¿Cuántas comparaciones hace buscar una clave que no está y cuyo valor hash es 6? ¿Y una que no está con valor hash 2?</p>",
          campos: [
            { rotulo: "hash 6:", esperado: String(N_PEOR), ancho: "3rem" },
            { rotulo: "hash 2:", esperado: "0", ancho: "3rem" }
          ],
          bien: "Correcto: la lista de la casilla 6 tiene las 40 claves y hay que verlas todas; la casilla 2 está vacía. El peor caso de buscar es Θ(n).",
          distractores: [
            { valores: ["3", null], msg: "α = 40/13 ≈ 3 es el promedio de las listas, pero esta lista tiene las 40 claves." }
          ],
          otro: "Una búsqueda que falla recorre la lista completa de su casilla." },
        { tipo: "respuesta", titulo: "La cota del promedio",
          html: "<p>Una tabla con n = 6000 claves tiene m = 3001 casillas, así que m ≥ n/2. ¿Qué cota da el teorema para 1 + α? Si la tabla tuviera m = 6000 casillas, ¿cuánto valdría 1 + α exactamente?</p>",
          campos: [
            { rotulo: "cota con m = 3001:", esperado: "3", ancho: "3rem" },
            { rotulo: "1 + α con m = 6000:", esperado: "2", ancho: "3rem" }
          ],
          bien: "Correcto: α = 6000/3001 < 2, así que 1 + α < 3. Con m = n, α = 1 y 1 + α = 2. En los dos casos el promedio no crece con n.",
          otro: "El teorema acota 1 + α por c = 3 cuando m ≥ n/2. Con m = n, α = 1." },
        { tipo: "opciones", titulo: "Con m fijo", columna: true, correcta: "lineal",
          html: "<p>Una tabla de m = 1000 casillas, que nunca crece, recibe un millón de claves bien repartidas. ¿Cuánto cuesta en promedio buscar una que no está?</p>",
          opciones: [
            { op: "lineal", texto: "Unas 1000 comparaciones: α = 1000 y Θ(1 + α) crece con n", msg: "Correcto. Con m fijo, α = n/m crece con n y la tabla es mil veces más rápida que la lista, pero sigue siendo lineal en n." },
            { op: "uno", texto: "Θ(1): las tablas hash buscan en tiempo constante", msg: "Θ(1 + α) es constante solo si m crece con n. Aquí α = 1000." },
            { op: "millon", texto: "Un millón: se recorren todas las claves", msg: "Eso pasa si todas caen en la misma casilla. Bien repartidas, cada lista mide unas 1000." }
          ] },
        { tipo: "opciones", titulo: "Espacio", columna: true, correcta: "mn",
          html: "<p>¿Cuánta memoria ocupa una tabla con encadenamiento de m casillas y n claves?</p>",
          opciones: [
            { op: "mn", texto: "Θ(m + n): las m cabezas y un nodo por clave", msg: "Correcto. Una casilla vacía también ocupa su puntero, y cada clave su nodo con la clave y el siguiente." },
            { op: "n", texto: "Θ(n): solo los nodos", msg: "El arreglo de m cabezas existe aunque esté vacío: con m mucho mayor que n domina m." },
            { op: "u", texto: "Θ(u), el tamaño del universo", msg: "Ese es el costo de la tabla directa. La tabla hash reserva m casillas, no una por clave posible." }
          ] }
      ]
    };
  }

  return { largos: largos, resumen: resumen, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
