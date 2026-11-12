/* Lo que comparten las actividades de redes recurrentes: la figura de 2022 a
   2025 con el pronóstico de 2025 encima, el MAE calculado aquí contra lo
   observado, los formatos, los botones de un selector y las tablas. Los
   pronósticos vienen de datos.js. */
var Pronostico = (function () {
  "use strict";

  var NARANJA = "#d9822b";
  var meses = SERIE.meses, v = SERIE.valores;
  var desde = meses.indexOf("2022-01"), enero25 = meses.indexOf("2025-01");
  var observado = v.slice(desde, desde + 48).map(function (x) { return x / 1e6; });
  var real2025 = v.slice(enero25, enero25 + 12).map(function (x) { return x / 1e6; });

  /* El MAE de los doce meses de 2025, en pasajeros. */
  function mae(p) {
    var s = 0;
    for (var i = 0; i < 12; i++) { s += Math.abs(p[i] - real2025[i]); }
    return s / 12 * 1e6;
  }

  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
    "septiembre", "octubre", "noviembre", "diciembre"];
  function nombre(m) { return MESES[+m.slice(5) - 1] + " de " + m.slice(0, 4); }

  function miles(x) {
    return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
  function coma(x, d) { return x.toFixed(d === undefined ? 2 : d).replace(".", ",").replace("-", "−"); }

  function figura(id, p, titulo) {
    document.getElementById(id).innerHTML = Grafica.lineas({
      lineas: [
        { valores: observado, color: Grafica.AZUL },
        { valores: p, color: NARANJA, desde: 36 }
      ],
      ancho: 640, alto: 260,
      titulo: titulo + ": MAE 2025 = " + miles(mae(p)) + " pasajeros",
      etiquetaY: "millones", marcasX: [0, 12, 24, 36],
      rotuloX: function (i) { return String(2022 + i / 12); }
    }) + '<p class="nota">Azul: observado. Naranja: pronóstico de 2025 desde diciembre de 2024.</p>';
  }

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

  return { figura: figura, selector: selector, tabla: tabla, miles: miles, coma: coma, mae: mae,
    nombre: nombre };
})();

if (typeof module !== "undefined") { module.exports = Pronostico; }
