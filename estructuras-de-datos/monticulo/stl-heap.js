/* Ejercicio interactivo: el montículo de la STL. make_heap, push_heap,
   pop_heap, sort_heap e is_heap sobre un vector, simulados con el mismo
   bajar y subir de heapsort/orden.js y monti.js. Con claves distintas,
   g++ deja los mismos arreglos; las salidas se compararon con un programa
   compilado con g++ -Wall -Wextra. */
var EJERCICIO = (function () {
  var M = typeof module !== "undefined" ? require("./monti.js") : Monti;
  var O = typeof module !== "undefined" ? require("../heapsort/orden.js") : Orden;
  var A = [26, 73, 19, 87, 41, 62, 54];
  var NUEVA = 80;
  var B = [48, 74, 29, 65, 17, 32];

  function makeHeap(a) {
    return O.construir(a).a;
  }

  /* push_heap: la última casilla del rango sube. */
  function pushHeap(a) {
    var b = a.slice();
    M.subir(b, b.length - 1, []);
    return b;
  }

  /* pop_heap: la raíz se cambia con la última casilla y la nueva raíz baja
     en el rango una casilla más corto. El vector no cambia de tamaño. */
  function popHeap(a) {
    var b = a.slice();
    var fin = b.length - 1;
    var aux = b[0];
    b[0] = b[fin];
    b[fin] = aux;
    O.bajar(b, fin, 0, [], { v: 0 });
    return b;
  }

  /* make_heap con greater<int>(): el de mínimos, bajando hacia el menor. */
  function makeHeapMin(a0) {
    var a = a0.slice();
    var n = a.length;
    var i = Math.floor(n / 2) - 1;
    while (i >= 0) {
      var k = i;
      var sigue = true;
      while (sigue) {
        var izq = 2 * k + 1;
        var der = 2 * k + 2;
        var menor = k;
        if (izq < n && a[izq] < a[menor]) { menor = izq; }
        if (der < n && a[der] < a[menor]) { menor = der; }
        if (menor !== k) {
          var t = a[k]; a[k] = a[menor]; a[menor] = t;
          k = menor;
        } else {
          sigue = false;
        }
      }
      i = i - 1;
    }
    return a;
  }

  var CODIGO_SACAR = [
    "pop_heap(v.begin(), v.end());",
    "int x = v.back();",
    "v.pop_back();"
  ];

  function spec() {
    var h = makeHeap(A);
    var conNueva = h.concat([NUEVA]);
    var tras = pushHeap(conNueva);
    var pop = popHeap(tras);
    var minimo = makeHeapMin(B);
    return {
      contenedor: "tarjetas",
      cierre: "<p>Las funciones de montículo de <code>&lt;algorithm&gt;</code> no guardan nada aparte: reordenan las casillas de un rango. <code>make_heap</code> hace lo de <code>construir</code> en Θ(n), <code>push_heap</code> sube la última casilla en O(log n) y <code>pop_heap</code> hace una ronda de heapsort en O(log n). El tamaño lo cambian <code>push_back</code> y <code>pop_back</code>, en ese orden: <code>push_back</code> antes de <code>push_heap</code>, y <code>pop_heap</code> antes de <code>pop_back</code>. <code>sort_heap</code> pide un rango que ya sea montículo, y <code>greater&lt;int&gt;()</code> deja el menor arriba si todas las llamadas lo llevan.</p>",
      cartas: [
        { tipo: "pasos", titulo: "make_heap, paso a paso",
          html: "<p><code>make_heap(v.begin(), v.end())</code> sobre <code>" + A.join(" ") + "</code> baja cada casilla con hijos, de la última a la raíz, igual que <code>construir</code>.</p>",
          pasos: O.pasosConstruir(A) },
        { tipo: "respuesta", titulo: "Agregar una clave",
          html: "<p>Sobre el montículo</p>" + M.cajas(h, {}) +
                "<p>se hace <code>v.push_back(" + NUEVA + ");</code> y después <code>push_heap(v.begin(), v.end());</code>. ¿Cómo queda el vector?</p>",
          campos: [{ rotulo: "vector:", esperado: M.texto(tras), ancho: "16rem" }],
          bien: "Correcto. El " + NUEVA + " entra en v[" + h.length + "] y sube mientras su padre sea menor, igual que con subir.",
          distractores: [
            { valores: [M.texto(conNueva)], msg: "Así queda después del push_back. Falta push_heap, que sube la clave que quedó al final." },
            { valores: ["87 73 62 80 41 19 54 26"], msg: "El 80 subió un nivel y se detuvo antes de tiempo: su nuevo padre, el 73, también es menor, así que sigue subiendo." }
          ],
          otro: "El padre de la casilla i está en (i − 1) / 2. Compare el " + NUEVA + " con su padre y suba mientras sea mayor." },
        { tipo: "opciones", titulo: "Sacar el máximo", columna: true, correcta: "bien",
          html: "<p>¿Cuál de estos fragmentos saca el máximo de un vector <code>v</code> que es montículo y lo guarda en <code>x</code>?</p>",
          opciones: [
            { op: "bien", texto: "<code>" + CODIGO_SACAR.join(" ") + "</code>", msg: "Correcto. pop_heap deja el máximo en la última casilla y reordena las demás como montículo; back() lo lee y pop_back() quita la casilla." },
            { op: "alreves", texto: "<code>int x = v.back(); v.pop_back(); pop_heap(v.begin(), v.end());</code>", msg: "back() lee la última casilla, que es una hoja y no el máximo. Además, pop_heap al final saca de su sitio el máximo que se quedó." },
            { op: "front", texto: "<code>int x = v.front(); v.pop_back();</code>", msg: "x sí es el máximo, pero pop_back quita la última casilla, no la raíz: el máximo sigue en v[0] y una hoja desaparece." },
            { op: "sinpop", texto: "<code>pop_heap(v.begin(), v.end()); int x = v.back();</code>", msg: "x es el máximo, pero el vector conserva su tamaño: la próxima llamada sobre v.begin() y v.end() vuelve a meter el máximo en el montículo." }
          ] },
        { tipo: "respuesta", titulo: "Lo que deja pop_heap",
          html: "<p>Sobre el vector</p>" + M.cajas(tras, {}) +
                "<p>se llama <code>pop_heap(v.begin(), v.end());</code>, todavía sin <code>pop_back</code>. ¿Cómo queda el vector y qué devuelve <code>v.back()</code>?</p>",
          campos: [
            { rotulo: "vector:", esperado: M.texto(pop), ancho: "16rem" },
            { rotulo: "back():", esperado: String(tras[0]), ancho: "3rem" }
          ],
          bien: "Correcto. El " + tras[0] + " se cambia con el " + tras[tras.length - 1] + " y el " + tras[tras.length - 1] + " baja en las primeras " + (tras.length - 1) + " casillas. El vector sigue con " + tras.length + " casillas.",
          distractores: [
            { valores: [M.texto(pop.slice(0, pop.length - 1)), null], msg: "pop_heap no cambia el tamaño: el máximo sigue en la última casilla hasta el pop_back." },
            { valores: [null, String(tras[tras.length - 1])], msg: "Ese era el valor de la última casilla antes de pop_heap. Después de la llamada, ahí está el máximo." }
          ],
          otro: "Cambie v[0] con la última casilla y baje la nueva raíz sin mirar la última casilla, como en una ronda de heapsort." },
        { tipo: "opciones", titulo: "Ordenar con las funciones", columna: true, correcta: "makesort",
          html: "<p>Se quiere ordenar de menor a mayor un vector cualquiera con estas funciones, sin arreglo auxiliar. ¿Qué llamadas?</p>",
          opciones: [
            { op: "solosort", texto: "Solo <code>sort_heap(v.begin(), v.end())</code>.", msg: "sort_heap exige que el rango ya sea un montículo. Sobre un vector cualquiera no garantiza nada." },
            { op: "makesort", texto: "<code>make_heap</code> y después <code>sort_heap</code>.", msg: "Correcto. Es heapsort: make_heap es construir, Θ(n), y sort_heap son las n − 1 rondas, O(n log n), dentro del mismo vector." },
            { op: "sortmake", texto: "<code>sort_heap</code> y después <code>make_heap</code>.", msg: "Al revés: make_heap al final deja un montículo de máximos, que no está ordenado." },
            { op: "ishaep", texto: "<code>make_heap</code> y después <code>is_heap</code>.", msg: "is_heap solo pregunta si el rango es montículo; no mueve ninguna casilla." }
          ] },
        { tipo: "respuesta", titulo: "El de mínimos",
          html: "<p>Se llama <code>make_heap(w.begin(), w.end(), greater&lt;int&gt;())</code> sobre:</p>" + M.cajas(B, {}) +
                "<p>¿Cómo queda el vector?</p>",
          campos: [{ rotulo: "vector:", esperado: M.texto(minimo), ancho: "14rem" }],
          bien: "Correcto. Con greater<int>() cada casilla baja hacia el menor de sus hijos, y el " + Math.min.apply(null, B) + " queda en w[0].",
          distractores: [
            { valores: [M.texto(makeHeap(B))], msg: "Ese es el montículo de máximos. Con greater<int>() arriba queda el menor." },
            { valores: [M.texto(B.slice().sort(function (x, y) { return x - y; }))], msg: "Un arreglo ordenado de menor a mayor es un montículo de mínimos, pero make_heap no ordena: solo baja las casillas con hijos." }
          ],
          otro: "Empiece en la casilla 2 y baje cada casilla hacia el menor de sus hijos, hasta la raíz." }
      ]
    };
  }

  return { A: A, B: B, NUEVA: NUEVA, makeHeap: makeHeap, pushHeap: pushHeap, popHeap: popHeap, makeHeapMin: makeHeapMin, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
