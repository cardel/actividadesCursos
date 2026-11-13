/* Ejercicio interactivo: de quien cuelga.
   Seis rondas con dos arboles a la vista. La respuesta de cada una se
   recalcula con union() de lib.js, que es el union_find.py de la sesion. */
var UF = (typeof module !== "undefined") ? require("./lib.js") : UF;

var EJERCICIO = (function () {
  var RONDAS = [
    {
      titulo: "Rangos distintos",
      p: { 2: 2, 6: 2, 9: 9 },
      rango: { 2: 1, 6: 0, 9: 0 },
      llamada: [6, 9],
      texto: "El árbol de 2 tiene rango 1 y 9 está solo con rango 0.",
      resp: { cuelga: 9, arriba: 2, rango: 1 },
      opciones: [
        { txt: "2 cuelga de 9, y el rango de 9 queda en 2.",
          fb: "Eso alarga el resultado: el árbol de 2 ya tiene altura 1 y colgarlo de 9 lo deja en altura 2." },
        { txt: "9 cuelga de 2, y el rango de 2 sigue en 1.", ok: true,
          fb: "Eso es. 9 entra en un nivel que ya existía, así que la altura del árbol no se movió." },
        { txt: "9 cuelga de 2, y el rango de 2 queda en 2.",
          fb: "El rango registra la altura, y aquí la altura es la misma de antes: 9 quedó al lado de 6." },
        { txt: "9 cuelga de 6, que es la punta que se nombra en la llamada.",
          fb: "union no cuelga elementos sino raíces: find_set(6) sube hasta 2, y es 2 la que recibe a 9." }
      ]
    },
    {
      titulo: "Más elementos, menos rango",
      p: { 4: 4, 5: 4, 7: 4, 8: 4, 10: 4, 3: 3, 2: 3, 6: 3, 9: 2 },
      rango: { 4: 1, 5: 0, 7: 0, 8: 0, 10: 0, 3: 2, 2: 1, 6: 0, 9: 0 },
      llamada: [7, 6],
      texto: "El árbol de 4 tiene cinco elementos y rango 1. El de 3 tiene cuatro y rango 2.",
      resp: { cuelga: 4, arriba: 3, rango: 2 },
      opciones: [
        { txt: "3 cuelga de 4, porque el árbol de 4 tiene más elementos.",
          fb: "La comparación es entre rangos. Una raíz con cinco hijos en un solo nivel sigue teniendo rango 1." },
        { txt: "4 cuelga de 3, y el rango de 4 baja a 0 porque dejó de ser raíz.",
          fb: "El código no toca el rango del que queda colgando. El 1 se queda ahí, sin que nadie lo mire, hasta que 4 vuelva a ser raíz." },
        { txt: "4 cuelga de 3, y el rango de 3 queda en 3.",
          fb: "La línea que suma uno al rango está en otra rama del if, la del empate, y aquí no se ejecuta." },
        { txt: "4 cuelga de 3, y el rango de 3 sigue en 2.", ok: true,
          fb: "Eso es. El árbol de rango 1 cabe debajo de la raíz de rango 2 sin estirar nada." }
      ]
    },
    {
      titulo: "El solitario va primero",
      p: { 5: 5, 8: 8, 2: 8, 4: 8, 6: 2 },
      rango: { 5: 0, 8: 2, 2: 1, 4: 0, 6: 0 },
      llamada: [5, 4],
      texto: "5 está solo con rango 0. El árbol de 8 tiene rango 2.",
      resp: { cuelga: 5, arriba: 8, rango: 2 },
      opciones: [
        { txt: "5 cuelga de 8, y el rango de 8 sigue en 2.", ok: true,
          fb: "Eso es. Con rangos distintos manda el rango, y el primer argumento no cambia nada." },
        { txt: "8 cuelga de 5, porque 5 es el primer argumento.",
          fb: "El orden de los argumentos solo decide cuando los dos rangos son iguales." },
        { txt: "5 cuelga de 8, y el rango de 8 queda en 3.",
          fb: "El rango de 8 ya valía 2 porque abajo hay dos niveles. 5 entra en el primero y no agrega ninguno." },
        { txt: "5 cuelga de 4, que es la otra punta de la llamada.",
          fb: "4 no es raíz. find_set(4) devuelve 8, y es la raíz la que recibe a 5." }
      ]
    },
    {
      titulo: "Dos solitarios",
      p: { 7: 7, 1: 1 },
      rango: { 7: 0, 1: 0 },
      llamada: [7, 1],
      texto: "7 y 1 están solos, los dos con rango 0.",
      resp: { cuelga: 1, arriba: 7, rango: 1 },
      opciones: [
        { txt: "7 cuelga de 1, y el rango de 1 queda en 1.",
          fb: "Con el empate el código escribe p[ry] = rx, y rx es la raíz del primer argumento, que aquí es 7." },
        { txt: "1 cuelga de 7, y los dos rangos siguen en 0.",
          fb: "Si el rango no subiera aquí no subiría nunca, y la comparación encontraría un empate en cada unión." },
        { txt: "1 cuelga de 7, y el rango de 7 queda en 1.", ok: true,
          fb: "Eso es. Dos árboles de altura 0 dejan uno de altura 1." },
        { txt: "1 cuelga de 7, y el rango de 7 queda en 2.",
          fb: "La línea suma uno: de 0 pasa a 1, que es la altura que acaba de quedar." }
      ]
    },
    {
      titulo: "Empate con las raíces escondidas",
      p: { 2: 2, 5: 2, 9: 9, 3: 9 },
      rango: { 2: 1, 5: 0, 9: 1, 3: 0 },
      llamada: [3, 5],
      texto: "Dos árboles de dos elementos, los dos con rango 1.",
      resp: { cuelga: 2, arriba: 9, rango: 2 },
      opciones: [
        { txt: "9 cuelga de 2, y el rango de 2 queda en 2.",
          fb: "Las dos raíces están cambiadas de lado: el primer argumento es 3 y su raíz es 9." },
        { txt: "2 cuelga de 9, y el rango de 9 sigue en 1.",
          fb: "Dos árboles de altura 1 dejan uno de altura 2, y el rango de la raíz que queda lo registra." },
        { txt: "3 cuelga de 2, y el rango de 2 queda en 2.",
          fb: "3 no es raíz, así que no es 3 lo que se mueve: la comparación es entre 9 y 2." },
        { txt: "2 cuelga de 9, y el rango de 9 queda en 2.", ok: true,
          fb: "Eso es. find_set(3) da 9, find_set(5) da 2, y con el empate la segunda cuelga de la primera." }
      ]
    },
    {
      titulo: "Empate de rango 2",
      p: { 4: 4, 1: 4, 6: 4, 8: 1, 7: 7, 3: 7, 9: 7, 2: 3 },
      rango: { 4: 2, 1: 1, 6: 0, 8: 0, 7: 2, 3: 1, 9: 0, 2: 0 },
      llamada: [2, 8],
      texto: "Dos árboles de cuatro elementos, los dos con rango 2.",
      resp: { cuelga: 4, arriba: 7, rango: 3 },
      opciones: [
        { txt: "7 cuelga de 4, y el rango de 4 queda en 3.",
          fb: "El primer argumento es 2 y su raíz es 7, de modo que 7 es la que queda arriba." },
        { txt: "4 cuelga de 7, y el rango de 7 queda en 3.", ok: true,
          fb: "Eso es. Y find_set reengancha a 2 y a 8 con su raíz al subir, así que p cambia en tres casillas." },
        { txt: "4 cuelga de 7, y el rango de 7 sigue en 2.",
          fb: "El árbol de 4 quedó un nivel más abajo, así que ahora hay tres niveles bajo 7." },
        { txt: "2 queda colgando de 7 y 8 de 4, sin que ningún rango cambie.",
          fb: "Eso pasó, al subir find_set. Falta la unión: 4 cuelga de 7 y el rango de 7 sube a 3." }
      ]
    }
  ];

  /* El texto de la llamada y lo que el codigo deja, para la tarjeta de cierre
     de cada ronda. */
  function resultado(r) {
    var p = UF.copia(r.p), rango = UF.copia(r.rango);
    UF.union(p, rango, r.llamada[0], r.llamada[1]);
    return { p: p, rango: rango };
  }

  return { RONDAS: RONDAS, resultado: resultado };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, cont = document.getElementById("rondas"), h = "", resueltas = {};
    document.getElementById("total").textContent = E.RONDAS.length;

    E.RONDAS.forEach(function (r, i) {
      h = h + "<div class='carta'><h2>" + (i + 1) + ". " + r.titulo + "</h2>" +
        "<div class='dibujo' id='dib-" + i + "'></div>" +
        "<p class='pregunta'>" + r.texto + " Se llama <code>union(" +
        r.llamada[0] + ", " + r.llamada[1] + ")</code>.</p>" +
        "<div class='opciones' data-q='" + i + "'>";
      r.opciones.forEach(function (o, j) {
        h = h + "<button class='opcion' data-q='" + i + "' data-o='" + j + "'>" + o.txt + "</button>";
      });
      h = h + "</div><div class='fb' id='fb-" + i + "'></div>" +
        "<div class='dibujo despues' id='des-" + i + "'></div></div>";
    });
    cont.innerHTML = h;

    function pintar(i) {
      var r = E.RONDAS[i];
      document.getElementById("dib-" + i).innerHTML = UF.dibujarBosque({
        p: r.p, alto: 30 + 70 * (1 + UF.layoutBosque(r.p).altura), maxAncho: 560,
        nodo: function (x) {
          var tocado = r.llamada.indexOf(x) >= 0;
          return { relleno: tocado ? "#fdf1dc" : "#ffffff",
                   borde: tocado ? "#e8a13d" : "#6b7280", grueso: tocado ? 3 : 2,
                   nota: r.p[x] === x ? "rango " + r.rango[x] : "" };
        }
      });
    }

    function pintarDespues(i) {
      var r = E.RONDAS[i], d = E.resultado(r), caja = document.getElementById("des-" + i);
      caja.innerHTML = UF.dibujarBosque({
        p: d.p, alto: 30 + 70 * (1 + UF.layoutBosque(d.p).altura), maxAncho: 560,
        arista: function (hijo) {
          var movido = hijo === r.resp.cuelga;
          return { color: movido ? "verde" : "gris", grueso: movido ? 3.5 : 2 };
        },
        nodo: function (x) {
          var raiz = d.p[x] === x;
          return { relleno: raiz ? "#e7f2e8" : "#ffffff", borde: raiz ? "#2e7d32" : "#6b7280",
                   nota: raiz ? "rango " + d.rango[x] : "" };
        }
      });
      caja.className = "dibujo despues visible";
    }

    E.RONDAS.forEach(function (r, i) { pintar(i); });

    Array.prototype.forEach.call(cont.querySelectorAll(".opcion"), function (b) {
      b.addEventListener("click", function () {
        var i = parseInt(b.getAttribute("data-q"), 10), j = parseInt(b.getAttribute("data-o"), 10);
        var o = E.RONDAS[i].opciones[j], d = document.getElementById("fb-" + i);
        d.textContent = o.fb;
        d.className = "fb " + (o.ok ? "bien" : "mal");
        Array.prototype.forEach.call(cont.querySelectorAll(".opcion[data-q='" + i + "']"), function (x) {
          x.classList.remove("elegida");
        });
        b.classList.add("elegida");
        if (o.ok) {
          resueltas[i] = true;
          pintarDespues(i);
        }
        document.getElementById("resueltas").textContent = Object.keys(resueltas).length;
      });
    });
  })();
}
