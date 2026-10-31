/* Lo que comparten las tres actividades de la serie como tabla: la figura de
   2022 a 2025 con el pronóstico de 2025 encima, los formatos y los botones de
   un selector. Los pronósticos vienen de datos.js. */
var Pronostico = (function () {
  "use strict";

  var NARANJA = "#d9822b", GRIS = "#6b7280";
  var desde = SERIE.meses.indexOf("2022-01");
  var observado = SERIE.valores.slice(desde, desde + 48).map(function (v) { return v / 1e6; });
  var real2025 = observado.slice(36);

  function miles(v) {
    return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
  function coma(v, d) { return v.toFixed(d === undefined ? 2 : d).replace(".", ",").replace("-", "−"); }

  /* r = { p: los doce meses de 2025, mae }; con techo dibuja el máximo del
     entrenamiento como una línea gris. */
  function figura(id, r, titulo, techo) {
    var lineas = [{ valores: observado, color: Grafica.AZUL }];
    if (techo) {
      lineas.push({ valores: observado.map(function () { return DATOS.maximo; }), color: GRIS });
    }
    lineas.push({ valores: r.p, color: NARANJA, desde: 36 });
    document.getElementById(id).innerHTML = Grafica.lineas({
      lineas: lineas, ancho: 640, alto: 260,
      titulo: titulo + ": MAE 2025 = " + miles(r.mae) + " pasajeros",
      etiquetaY: "millones", marcasX: [0, 12, 24, 36],
      rotuloX: function (i) { return String(2022 + i / 12); }
    }) + '<p class="nota">Azul: observado. Naranja: pronóstico de 2025 desde diciembre de 2024' +
      (techo ? ". Gris: el mes más alto del entrenamiento." : ".") + "</p>";
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

  return { figura: figura, selector: selector, tabla: tabla, miles: miles, coma: coma, real2025: real2025 };
})();
