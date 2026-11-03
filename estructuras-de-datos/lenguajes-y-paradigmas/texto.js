/* Presentación compartida por las actividades de lenguajes y de
   compilación: código y consola como bloques de texto, y tablas sencillas. */
var Texto = (function () {
  function escapar(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function codigo(lineas) {
    return "<pre class=\"fragmento\">" + escapar(lineas.join("\n")) + "</pre>";
  }

  /* Una orden y lo que respondió, como en la terminal. */
  function consola(orden, lineas) {
    var t = "$ " + orden + (lineas && lineas.length ? "\n" + lineas.join("\n") : "");
    return "<pre class=\"fragmento\">" + escapar(t) + "</pre>";
  }

  function tabla(cabecera, filas) {
    return "<div class=\"envoltura-tabla\"><table><thead><tr>" +
      cabecera.map(function (c) { return "<th>" + c + "</th>"; }).join("") +
      "</tr></thead><tbody>" + filas.map(function (f) {
        return "<tr>" + f.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table></div>";
  }

  /* 1234.5 -> "1234,5" con los decimales que se pidan. */
  function num(x, d) { return x.toFixed(d).replace(".", ","); }

  return { escapar: escapar, codigo: codigo, consola: consola, tabla: tabla, num: num };
})();

if (typeof module !== "undefined") {
  module.exports = Texto;
}
