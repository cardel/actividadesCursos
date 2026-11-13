/* Ejercicio interactivo: string. */
var EJERCICIO = (function () {
  var CASOS = [
    { id: "reves", texto: "alReves(\"anilina\") == \"anilina\"", tipo: "bool" },
    { id: "menor", texto: "string(\"mapa\") < string(\"mano\")", tipo: "bool" },
    { id: "prefijo", texto: "string(\"cola\") < string(\"colar\")", tipo: "bool" },
    { id: "size", texto: "(string(\"pila\") + \" y cola\").size()", tipo: "int" }
  ];

  function alReves(s) {
    var r = "";
    var i = s.length - 1;
    while (i >= 0) { r = r + s[i]; i = i - 1; }
    return r;
  }

  /* Comparacion de cadenas como la hace string: letra a letra, y el prefijo va antes. */
  function menor(a, b) {
    var i = 0;
    var r = null;
    while (r === null && i < a.length && i < b.length) {
      if (a[i] < b[i]) { r = true; }
      else if (a[i] > b[i]) { r = false; }
      i = i + 1;
    }
    if (r === null) { r = a.length < b.length; }
    return r;
  }

  function respuesta(id) {
    var r = null;
    if (id === "reves") { r = alReves("anilina") === "anilina" ? 1 : 0; }
    else if (id === "menor") { r = menor("mapa", "mano") ? 1 : 0; }
    else if (id === "prefijo") { r = menor("cola", "colar") ? 1 : 0; }
    else { r = ("pila" + " y cola").length; }
    return r;
  }

  return { casos: CASOS, alReves: alReves, menor: menor, respuesta: respuesta };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var PISTAS = {
      reves: { bien: "anilina se lee igual al revés: la comparación con == da 1.", mal: "Escriba anilina de atrás hacia adelante y compare letra a letra: anilina. Es igual, no distinta." },
      menor: { bien: "m = m, a = a, y en la tercera letra p > n: mapa no es menor que mano. Da 0.", mal: "string compara letra a letra desde la primera. Las dos primeras empatan y en la tercera p va después de n: mapa no va antes de mano." },
      prefijo: { bien: "cola es prefijo de colar y el prefijo va antes: da 1.", mal: "Cuando una cadena se acaba y la otra no, la corta va antes: como en el diccionario. cola va antes de colar." },
      size: { bien: "pila tiene 4, y  y cola tiene 7 contando el espacio inicial: 11." }
    };
    var logradas = {};
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
    function opcionesDe(id) {
      var ok = EJERCICIO.respuesta(id);
      var lista = [];
      if (id === "size") {
        lista = [
          { valor: ok, clave: "correcta", razon: "Correcto. " + PISTAS.size.bien },
          { valor: ok - 1, clave: "sinespacio", razon: "Cuente también los espacios: \" y cola\" empieza con uno, y son 7 caracteres, no 6." },
          { valor: " y cola".length, clave: "soloCola", razon: "Eso es solo lo que se concatena. size() cuenta la cadena completa, también los 4 caracteres de pila." },
          { valor: "pila".length, clave: "soloPila", razon: "Eso es solo pila. El + construye una cadena nueva con las dos partes, y size() cuenta todo." }
        ];
      } else {
        var otro = 1 - ok;
        lista = [
          { valor: ok, clave: "correcta", razon: "Correcto. " + PISTAS[id].bien },
          { valor: otro, clave: "contrario", razon: PISTAS[id].mal }
        ];
      }
      return sinRepetir(lista);
    }
    EJERCICIO.casos.forEach(function (c) {
      logradas[c.id] = false;
      Motor.opcionesNumericas("opciones-" + c.id, "veredicto-" + c.id, function () { return opcionesDe(c.id); });
      alAcertar("opciones-" + c.id, function () {
        logradas[c.id] = true;
        if (EJERCICIO.casos.every(function (k) { return logradas[k.id]; })) {
          document.getElementById("carta-cierre").style.display = "block";
        }
      });
    });
  })();
}
