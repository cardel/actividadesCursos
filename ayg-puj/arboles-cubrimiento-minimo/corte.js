/* Ejercicio interactivo: la arista ligera de un corte.
   Cuatro rondas sobre el mismo grafo, cambiando S. Las aristas que cruzan y la
   mas barata de ellas las calcula MST.corte, de modo que el dibujo que aparece
   al contestar sale de los datos y no de una lista escrita a mano. */
var MST = (typeof module !== "undefined") ? require("./lib.js") : MST;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var GRAFO = {
    n: 8, alto: 270,
    aristas: [[0, 1, 4], [0, 2, 7], [1, 2, 3], [1, 3, 5], [2, 3, 5], [2, 4, 11], [3, 4, 6],
              [3, 5, 13], [4, 5, 2], [4, 6, 8], [5, 6, 10], [5, 7, 12], [6, 7, 1]],
    pos: [[50, 120], [160, 50], [160, 195], [290, 60], [290, 200], [410, 110], [420, 235], [525, 170]]
  };

  var RONDAS = [
    {
      S: [0, 1],
      pregunta: "¿Cuál es la arista ligera de este corte?",
      opciones: [
        { txt: "0–1 · peso 4", ar: 0,
          fb: "0 y 1 están los dos en S, así que 0–1 no cruza el corte. Una arista con las dos puntas del mismo lado no es candidata, por barata que sea." },
        { txt: "1–3 · peso 5", ar: 3,
          fb: "1–3 sí cruza, pero no es la más barata de las que cruzan: 1–2 pasa el corte por 3." },
        { txt: "1–2 · peso 3", ar: 2, ok: true,
          fb: "Eso es. Cruzan 0–2 con 7, 1–2 con 3 y 1–3 con 5, y la más barata de las tres es 1–2." },
        { txt: "6–7 · peso 1", ar: 12,
          fb: "1 es el peso más bajo del grafo y aun así 6–7 tiene las dos puntas fuera de S. Ligera es la más barata del corte, no la del grafo." }
      ]
    },
    {
      S: [0, 1, 2, 3],
      pregunta: "S creció. ¿Cuál es ahora la arista ligera?",
      opciones: [
        { txt: "3–4 · peso 6", ar: 6, ok: true,
          fb: "Eso es. Del corte salen 3–4 con 6, 2–4 con 11 y 3–5 con 13, y la de 6 es la más barata." },
        { txt: "1–2 · peso 3", ar: 2,
          fb: "1 y 2 quedaron los dos en S. Era la ligera cuando S era {0,1}, y con este S ya no cruza." },
        { txt: "2–4 · peso 11", ar: 5,
          fb: "2–4 cruza, pero paga 11 donde 3–4 paga 6." },
        { txt: "6–7 · peso 1", ar: 12,
          fb: "6 y 7 siguen los dos fuera de S. Que sea la más barata del grafo no la pone en el corte." }
      ]
    },
    {
      S: [0, 1, 2, 3, 4, 5],
      pregunta: "Ahora al otro lado solo quedan dos vértices. ¿Cuál es la arista ligera?",
      opciones: [
        { txt: "4–5 · peso 2", ar: 8,
          fb: "4 y 5 están los dos en S. Es la segunda más barata del grafo y no toca el corte." },
        { txt: "5–6 · peso 10", ar: 10,
          fb: "5–6 cruza, pero cuesta 10 y 4–6 cuesta 8." },
        { txt: "6–7 · peso 1", ar: 12,
          fb: "6 y 7 son el otro lado del corte, así que 6–7 queda dentro de ese lado: ninguna punta está en S." },
        { txt: "4–6 · peso 8", ar: 9, ok: true,
          fb: "Eso es. Cruzan 4–6 con 8, 5–6 con 10 y 5–7 con 12, y la más barata es 4–6." }
      ]
    },
    {
      S: [0, 1, 2],
      pregunta: "Con este S hay un empate. ¿Cuántas aristas ligeras tiene el corte?",
      opciones: [
        { txt: "Una sola, porque la ligera de un corte es la más barata y no puede haber dos.",
          fb: "Ligera quiere decir de peso mínimo entre las que cruzan, y el mínimo lo pueden alcanzar varias. Aquí lo alcanzan dos." },
        { txt: "Dos, 1–3 y 2–3, las dos de peso 5, y cualquiera de las dos es segura.", ok: true,
          fb: "Eso es. El teorema 23.1 pide peso mínimo entre las que cruzan, y las dos lo tienen: cada una cabe en algún árbol de cubrimiento mínimo." },
        { txt: "Dos, pero solo es segura la que lleva al vértice de menor número.",
          fb: "El número del vértice no aparece en el teorema. El empate se rompe por el orden en que el código mire las aristas, y las dos salidas son árboles mínimos." },
        { txt: "Ninguna: con un empate el corte se queda sin arista ligera.",
          fb: "El mínimo existe mientras algo cruce, y aquí es 5. Lo que el empate quita es la unicidad del árbol, no la arista ligera." }
      ]
    }
  ];

  RONDAS.forEach(function (r) {
    r.datos = MST.corte(GRAFO.aristas, r.S);
    r.correcta = -1;
    r.opciones.forEach(function (o, j) { if (o.ok) { r.correcta = j; } });
  });

  return { GRAFO: GRAFO, RONDAS: RONDAS };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, G = E.GRAFO, revelado = [];

    function dibujo(r) {
      var R = E.RONDAS[r], d = R.datos, ver = revelado[r] === true, enS = {};
      R.S.forEach(function (v) { enS[v] = true; });
      return GRAFOSVG.dibujar({
        n: G.n, pos: G.pos, aristas: G.aristas, dirigido: false, alto: G.alto,
        arista: function (i) {
          if (!ver) { return { color: "claro", grueso: 2 }; }
          if (d.ligeras.indexOf(i) >= 0) { return { color: "verde", grueso: 4 }; }
          if (d.cruzan.indexOf(i) >= 0) { return { color: "azul", grueso: 3 }; }
          return { color: "claro", grueso: 2 };
        },
        nodo: function (u) {
          return enS[u] === true
            ? { cuadrado: true, relleno: "#e3edf8", borde: "#1f5fa8", grueso: 3 }
            : { relleno: "#ffffff", borde: "#6b7280" };
        }
      });
    }

    var cont = document.getElementById("rondas"), h = "";
    E.RONDAS.forEach(function (R, i) {
      h = h + "<div class='carta'><h2>" + (i + 1) + ". El corte con S = {" + R.S.join(",") + "}</h2>" +
        "<p class='pregunta'>" + R.pregunta + "</p>" +
        "<div class='dibujo' id='g-" + i + "'></div>" +
        "<div class='leyenda'>Los cuadrados azules son los vértices de S.</div>" +
        "<div class='opciones' data-q='" + i + "'>";
      R.opciones.forEach(function (o, j) {
        h = h + "<button class='opcion' data-q='" + i + "' data-o='" + j + "'>" + o.txt + "</button>";
      });
      h = h + "</div><div class='fb' id='fb-" + i + "'></div></div>";
    });
    cont.innerHTML = h;
    E.RONDAS.forEach(function (R, i) { document.getElementById("g-" + i).innerHTML = dibujo(i); });

    Array.prototype.forEach.call(cont.querySelectorAll(".opcion"), function (b) {
      b.addEventListener("click", function () {
        var i = parseInt(b.getAttribute("data-q"), 10), j = parseInt(b.getAttribute("data-o"), 10);
        var o = E.RONDAS[i].opciones[j], d = document.getElementById("fb-" + i);
        d.textContent = o.fb;
        d.className = "fb " + (o.ok ? "bien" : "mal");
        revelado[i] = true;
        document.getElementById("g-" + i).innerHTML = dibujo(i);
        Array.prototype.forEach.call(cont.querySelectorAll(".opcion[data-q='" + i + "']"), function (x) {
          x.classList.remove("elegida");
        });
        b.classList.add("elegida");
      });
    });
  })();
}
