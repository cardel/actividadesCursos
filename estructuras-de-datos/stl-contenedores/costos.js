/* Ejercicio interactivo: lo que cobra cada operacion. */
var EJERCICIO = (function () {
  var CASOS = { insert: { n: 6, p: 2 }, revertir: { n: 5 } };

  /* insert en la posicion p de un vector de n elementos corre n - p. */
  function corridosInsert(n, p) { return n - p; }

  /* revertir con insert al frente: la k-esima insercion corre k elementos. */
  function corridosRevertir(n) {
    var total = 0;
    var k = 0;
    while (k < n) { total = total + k; k = k + 1; }
    return total;
  }

  /* Pasos de binary_search en el peor caso: log2(n) redondeado hacia arriba. */
  function pasosBinaria(n) { var p = 0; var m = 1; while (m < n) { m = m * 2; p = p + 1; } return p; }
  return { casos: CASOS, corridosInsert: corridosInsert, corridosRevertir: corridosRevertir, pasosBinaria: pasosBinaria };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    function sinRepetir(lista) {
      var vistos = {};
      return lista.filter(function (o) {
        var nuevo = !vistos[String(o.valor)];
        vistos[String(o.valor)] = true;
        return nuevo;
      });
    }
    function alAcertar(id, f) {
      document.getElementById(id).addEventListener("click", function (e) {
        if (e.target && e.target.getAttribute && e.target.getAttribute("data-op") === "correcta") { f(); }
      });
    }
    var logradas = { insert: false, revertir: false, binaria: false, espacio: false };
    function revisar() {
      if (logradas.insert && logradas.revertir && logradas.binaria && logradas.espacio) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }
    Motor.opcionesNumericas("opciones-insert", "veredicto-insert", function () {
      var c = EJERCICIO.casos.insert;
      var ok = EJERCICIO.corridosInsert(c.n, c.p);
      return sinRepetir([
        { valor: ok, clave: "correcta",
          razon: "Correcto: " + ok + ". Las posiciones 2, 3, 4 y 5 se corren una casilla a la derecha para abrir campo; las posiciones 0 y 1 no se tocan." },
        { valor: c.n, clave: "todo",
          razon: "No se corre todo el vector: lo que está antes de la posición " + c.p + " se queda quieto." },
        { valor: c.p, clave: "antes",
          razon: "Eso cuenta lo que queda antes de la posición, que es justo lo que no se mueve. Se corre lo que está desde la posición " + c.p + " hasta el final." },
        { valor: ok - 1, clave: "sinp",
          razon: "Se corre lo que está desde la posición p hasta el final, incluida la posición p." }
      ]);
    });
    alAcertar("opciones-insert", function () { logradas.insert = true; revisar(); });
    Motor.opcionesNumericas("opciones-revertir", "veredicto-revertir", function () {
      var c = EJERCICIO.casos.revertir;
      var ok = EJERCICIO.corridosRevertir(c.n);
      return sinRepetir([
        { valor: ok, clave: "correcta",
          razon: "Correcto: 0 + 1 + 2 + 3 + 4 = " + ok + ". Cada insert al frente corre todo lo que ya estaba. Con push_back desde el final no se corre nada: el contrato es el mismo y el costo no." },
        { valor: c.n, clave: "inserciones",
          razon: "Cinco son las inserciones. La pregunta es cuántos elementos se corren en total: la primera corre 0, la segunda 1, la tercera 2..." },
        { valor: ok + c.n, clave: "desdeuno",
          razon: "Casi: la primera inserción corre 0 elementos, no 1, porque el vector está vacío." },
        { valor: c.n * (c.n - 1), clave: "sinmitad",
          razon: "Eso es n(n − 1), el doble. Cada inserción corre k elementos y la suma 0 + 1 + … + (n − 1) es n(n − 1)/2." }
      ]);
    });
    alAcertar("opciones-revertir", function () { logradas.revertir = true; revisar(); });
    var MENSAJES_BIN = {
      veinte: null,
      mil: "Mil sería la raíz cuadrada; la búsqueda binaria parte por la mitad, no por la raíz: log2(1 000 000) es un poco menos de 20.",
      millon: "Un millón de pasos es find, que recorre. binary_search descarta la mitad en cada paso."
    };
    document.querySelectorAll("#opciones-bin button").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var v = document.getElementById("veredicto-bin");
        var m = MENSAJES_BIN[boton.dataset.op];
        if (m === null) { v.className = "veredicto bien"; v.textContent = "Correcto: unos 20 (2 elevado a la 20 pasa del millón). O(log n) contra los Θ(n) de find; a cambio, exige el vector ordenado."; logradas.binaria = true; revisar(); }
        else { v.className = "veredicto mal"; v.textContent = m; }
      });
    });
    var MENSAJES_ESP = {
      constante: "sort no ordena con espacio constante: la recursión de partir por la mitad guarda del orden de log n niveles.",
      log: null,
      lineal: "No copia el vector entero: ordena en sitio, y lo que guarda aparte es la pila de la recursión, O(log n)."
    };
    document.querySelectorAll("#opciones-esp button").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var v = document.getElementById("veredicto-esp");
        var m = MENSAJES_ESP[boton.dataset.op];
        if (m === null) { v.className = "veredicto bien"; v.textContent = "Correcto: O(n log n) en tiempo y O(log n) de espacio aparte del vector. find, count, reverse y min_element van en Θ(n) y O(1)."; logradas.espacio = true; revisar(); }
        else { v.className = "veredicto mal"; v.textContent = m; }
      });
    });
  })();
}
