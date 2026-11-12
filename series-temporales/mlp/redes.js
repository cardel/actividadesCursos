/* Lo que comparten las dos actividades del perceptrón multicapa: formatos,
   los botones de un selector, una tabla y el MAE de 2025 contra lo observado.
   Las curvas y los pronósticos vienen de datos.js. */
var Redes = (function () {
  "use strict";

  var meses = SERIE.meses, v = SERIE.valores;
  var enero25 = meses.indexOf("2025-01");
  var real2025 = v.slice(enero25, enero25 + 12).map(function (x) { return x / 1e6; });

  /* El MAE de los doce meses de 2025, en pasajeros, de un pronóstico en millones. */
  function mae(p) {
    var s = 0;
    for (var i = 0; i < 12; i++) { s += Math.abs(p[i] - real2025[i]); }
    return s / 12 * 1e6;
  }
  function miles(x) {
    var t = Math.round(Math.abs(x)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return (x < 0 ? "−" : "") + t;
  }
  function coma(x, d) { return x.toFixed(d === undefined ? 2 : d).replace(".", ",").replace("-", "−"); }
  function tasa(t) { return String(t).replace(".", ","); }

  /* Botones de un selector: marca el elegido y avisa con su data-valor. */
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

  /* La época (desde 1) de menor valor de una curva. */
  function minimo(curva) {
    var k = 0;
    for (var i = 1; i < curva.length; i++) { if (curva[i] < curva[k]) { k = i; } }
    return { epoca: k + 1, valor: curva[k] };
  }

  return { mae: mae, miles: miles, coma: coma, tasa: tasa, selector: selector, tabla: tabla,
    minimo: minimo, real2025: real2025 };
})();

if (typeof module !== "undefined") { module.exports = Redes; }
