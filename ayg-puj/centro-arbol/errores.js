/* Ejercicio interactivo: cuatro cambios al pelado de hojas, cada uno con su
   forma de fallar. Las respuestas se comprueban corriendo el algoritmo
   cambiado sobre el arbol que acompana cada pregunta. */
var ARB = (typeof module !== "undefined") ? require("../comun/arbol.js") : ARB;

var EJERCICIO = (function () {
  var PREGUNTAS = [
    {
      titulo: "La condición de parada",
      cambio: "while vivos > 1:   en vez de   while vivos > 2:",
      arbol: "el camino de cuatro vértices, 0−1−2−3",
      opciones: [
        { txt: "Devuelve el centro igual, solo que da una vuelta de más.",
          fb: "No: la vuelta de más se lleva a los dos centros. Con el camino de cuatro quedan 1 y 2, y la vuelta extra los pela a los dos y deja capa vacía." },
        { txt: "Se queda sin vértices cuando el centro tiene dos, y devuelve una lista vacía.",
          ok: true,
          fb: "Eso es. Con dos centros vivos la condición sigue siendo cierta, se pelan los dos a la vez y no queda nada que devolver." },
        { txt: "Se cuelga en un ciclo infinito.",
          fb: "No se cuelga: vivos baja en cada vuelta hasta llegar a cero, y ahí la condición se rompe. Lo que pasa es que el centro se perdió en el camino." },
        { txt: "Devuelve una hoja del árbol original.",
          fb: "No. Las hojas originales se van en la primera capa; lo que queda vacío es la última." }
      ]
    },
    {
      titulo: "La capa a medio recorrer",
      cambio: "capa.append(u)   en vez de   siguiente.append(u),  recorriendo capa con un índice",
      arbol: "el camino de cinco vértices, 0−1−2−3−4",
      opciones: [
        { txt: "Da lo mismo, porque igual se recorre toda la lista.",
          fb: "No da lo mismo: los vértices nuevos entran a la lista que se está recorriendo, así que se pelan en la misma vuelta en vez de esperar la siguiente." },
        { txt: "El árbol se consume de un lado y el centro sale corrido.",
          ok: true,
          fb: "Eso es. En el camino de cinco, al pelar 0 entra 1 a la misma lista, al pelar 1 entra 2, y la primera vuelta se lleva media rama." },
        { txt: "Deja de contar bien las vueltas, pero el centro sigue bien.",
          fb: "Al revés: las vueltas quedan en una, y es el centro el que se mueve, porque los vértices no se pelan por capas sino en cadena." },
        { txt: "Solo falla en árboles con más de dos centros.",
          fb: "Nunca hay más de dos centros. El problema no es cuántos hay, es que se pelan vértices antes de tiempo." }
      ]
    },
    {
      titulo: "Un grafo que no es árbol",
      cambio: "el mismo algoritmo, sobre un grafo con un ciclo",
      arbol: "un triángulo 0−1−2−0 con una cola 2−3",
      opciones: [
        { txt: "Devuelve el centro del grafo, que para eso sirve el grado.",
          fb: "No. El grado uno identifica hojas, y en un grafo con ciclos el centro no tiene nada que ver con las hojas." },
        { txt: "Pela la cola y después se queda quieto con el triángulo, devolviendo algo que no es el centro.",
          ok: true,
          fb: "Eso es. El triángulo no tiene ningún vértice de grado uno, así que la capa siguiente queda vacía, vivos nunca baja de tres y lo que se devuelva no es el centro." },
        { txt: "Se cae con un error de índice.",
          fb: "No se cae: el código no hace nada ilegal, simplemente deja de encontrar hojas." },
        { txt: "Funciona igual, porque el teorema del centro vale para cualquier grafo conexo.",
          fb: "El teorema es de árboles. Lo que usa es que quitar las hojas baja todas las excentricidades en uno, y eso se cae apenas hay un ciclo." }
      ]
    },
    {
      titulo: "Las vueltas como radio",
      cambio: "return capa, vueltas   leído como   return centro, radio",
      arbol: "el camino de seis vértices, 0−1−2−3−4−5",
      opciones: [
        { txt: "Está bien: el radio es siempre el número de vueltas.",
          fb: "Solo cuando queda un centro. En el camino de seis quedan dos, las vueltas son 2 y el radio es 3." },
        { txt: "Está mal siempre: el radio es las vueltas más uno.",
          fb: "Tampoco siempre. Con un solo centro, como en el camino de cinco, las vueltas y el radio coinciden en 2." },
        { txt: "Está bien cuando queda un centro y se queda corto por uno cuando quedan dos.",
          ok: true,
          fb: "Eso es. Las vueltas son el piso del diámetro sobre dos, y el radio es el techo: coinciden si el diámetro es par." },
        { txt: "Está mal, y la corrección es multiplicar las vueltas por dos.",
          fb: "Eso da el diámetro cuando hay un solo centro, no el radio." }
      ]
    }
  ];

  function correcta(i) {
    var r = -1;
    PREGUNTAS[i].opciones.forEach(function (o, j) { if (o.ok) { r = j; } });
    return r;
  }

  /* Las dos afirmaciones numericas del enunciado se comprueban corriendo. */
  function comprobaciones() {
    function medidas(n, aristas) {
      var G = ARB.adyacencia(n, aristas);
      var real = ARB.radioDiametroCentro(G), p = ARB.pelarCapas(G);
      return { vueltas: p.vueltas, centro: p.centro, radio: real.radio, diametro: real.diametro };
    }
    var cuatro = medidas(4, [[0, 1], [1, 2], [2, 3]]);
    var cinco = medidas(5, [[0, 1], [1, 2], [2, 3], [3, 4]]);
    var seis = medidas(6, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]]);
    return { cuatro: cuatro, cinco: cinco, seis: seis };
  }

  return { PREGUNTAS: PREGUNTAS, correcta: correcta, comprobaciones: comprobaciones };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, cont = document.getElementById("preguntas"), h = "";
    E.PREGUNTAS.forEach(function (q, i) {
      h = h + "<div class='carta'><h2>" + (i + 1) + ". " + q.titulo + "</h2>" +
        "<p class='cambio'><code>" + q.cambio + "</code></p>" +
        "<p class='leyenda'>Pruébelo sobre " + q.arbol + ".</p>" +
        "<div class='opciones' data-q='" + i + "'>";
      q.opciones.forEach(function (o, j) {
        h = h + "<button class='opcion' data-q='" + i + "' data-o='" + j + "'>" + o.txt + "</button>";
      });
      h = h + "</div><div class='fb' id='fb-" + i + "'></div></div>";
    });
    cont.innerHTML = h;
    Array.prototype.forEach.call(cont.querySelectorAll(".opcion"), function (b) {
      b.addEventListener("click", function () {
        var i = parseInt(b.getAttribute("data-q"), 10), j = parseInt(b.getAttribute("data-o"), 10);
        var o = E.PREGUNTAS[i].opciones[j], d = document.getElementById("fb-" + i);
        d.textContent = o.fb;
        d.className = "fb " + (o.ok ? "bien" : "mal");
        Array.prototype.forEach.call(cont.querySelectorAll(".opcion[data-q='" + i + "']"), function (x) {
          x.classList.remove("elegida");
        });
        b.classList.add("elegida");
      });
    });
  })();
}
