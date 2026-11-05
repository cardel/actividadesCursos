/* Lo que comparten las dos actividades de validación temporal: los pliegues
   de TimeSeriesSplit, calculados aquí con la misma regla de scikit-learn, y
   los formatos. Los meses de la tabla de búsqueda vienen de datos.js. */
var Cortes = (function () {
  "use strict";

  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
    "septiembre", "octubre", "noviembre", "diciembre"];
  function nombre(m) { return MESES[+m.slice(5) - 1] + " de " + m.slice(0, 4); }

  /* Cada pliegue como [primer índice de entrenamiento, último, primero de
     validación, último], o null si la combinación no cabe en n filas. */
  function pliegues(n, nSplits, testSize, gap) {
    if (nSplits + 1 > n || n - gap - testSize * nSplits <= 0) { return null; }
    var r = [];
    for (var i = 0; i < nSplits; i++) {
      var inicio = n - nSplits * testSize + i * testSize;
      r.push([0, inicio - gap - 1, inicio, inicio + testSize - 1]);
    }
    return r;
  }

  function miles(x) {
    return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function selector(id, alCambiar) {
    var botones = document.querySelectorAll("#" + id + " button");
    botones.forEach(function (b) {
      b.addEventListener("click", function () {
        botones.forEach(function (o) { o.classList.remove("elegido"); });
        b.classList.add("elegido");
        alCambiar(b.getAttribute("data-valor"));
      });
    });
  }

  function tabla(cabeza, filas) {
    return "<table><thead><tr>" + cabeza.map(function (c) { return "<th>" + c + "</th>"; }).join("") +
      "</tr></thead><tbody>" + filas.map(function (f) {
        return "<tr>" + f.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table>";
  }

  return { pliegues: pliegues, nombre: nombre, miles: miles, selector: selector, tabla: tabla };
})();

if (typeof module !== "undefined") { module.exports = Cortes; }
