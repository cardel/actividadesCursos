/* Lo que comparten las dos actividades de ensambles: la figura de 2022 a
   2025 con el pronóstico de 2025 encima y el techo del entrenamiento, el MAE
   calculado aquí contra lo observado, los formatos y los botones de un
   selector. Los pronósticos vienen de datos.js. */
var Pronostico = (function () {
  "use strict";

  var NARANJA = "#d9822b", GRIS = "#6b7280", UMBRAL = 2.5;
  var meses = SERIE.meses, v = SERIE.valores;
  var desde = meses.indexOf("2022-01"), enero25 = meses.indexOf("2025-01");
  var observado = v.slice(desde, desde + 48).map(function (x) { return x / 1e6; });
  var real2025 = v.slice(enero25, enero25 + 12).map(function (x) { return x / 1e6; });
  var maximo = Math.max.apply(null, v.slice(0, enero25)) / 1e6;

  /* El MAE de los doce meses de 2025, en pasajeros. */
  function mae(p) {
    var s = 0;
    for (var i = 0; i < 12; i++) { s += Math.abs(p[i] - real2025[i]); }
    return s / 12 * 1e6;
  }
  /* Repite la pandemia si algún mes de 2025 queda por debajo de 2,5 millones. */
  function pandemia(p) { return Math.min.apply(null, p) < UMBRAL; }
  function minimo(p) { return Math.min.apply(null, p); }

  /* Los meses de 2020 y 2021 por debajo del umbral, para el texto. */
  var bajos = meses.filter(function (m, i) { return m >= "2020" && m < "2022" && v[i] / 1e6 < UMBRAL; });
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
    "septiembre", "octubre", "noviembre", "diciembre"];
  function nombre(m) { return MESES[+m.slice(5) - 1] + " de " + m.slice(0, 4); }
  var tramo = nombre(bajos[0]) + " y " + nombre(bajos[bajos.length - 1]);

  function miles(x) {
    return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
  function coma(x, d) { return x.toFixed(d === undefined ? 2 : d).replace(".", ",").replace("-", "−"); }

  function figura(id, p, titulo) {
    document.getElementById(id).innerHTML = Grafica.lineas({
      lineas: [
        { valores: observado, color: Grafica.AZUL },
        { valores: observado.map(function () { return maximo; }), color: GRIS },
        { valores: p, color: NARANJA, desde: 36 }
      ],
      ancho: 640, alto: 260,
      titulo: titulo + ": MAE 2025 = " + miles(mae(p)) + " pasajeros",
      etiquetaY: "millones", marcasX: [0, 12, 24, 36],
      rotuloX: function (i) { return String(2022 + i / 12); }
    }) + '<p class="nota">Azul: observado. Naranja: pronóstico de 2025 desde diciembre de 2024. ' +
      "Gris: el mes más alto del entrenamiento, " + coma(maximo) + " millones.</p>";
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
    pandemia: pandemia, minimo: minimo, maximo: maximo, umbral: UMBRAL, tramo: tramo, nombre: nombre };
})();

if (typeof module !== "undefined") { module.exports = Pronostico; }
