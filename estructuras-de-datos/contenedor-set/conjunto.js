/* Un set<int> simulado con un arreglo ordenado y sin repetidos, para
   calcular lo que imprime cada programa de las actividades. Los iteradores
   son posiciones del arreglo; fin() es la posicion despues del mayor. */
var Conjunto = (function () {
  function nuevo() { return { a: [] }; }

  /* Primera posicion con clave >= k. */
  function lowerBound(s, k) {
    var i = 0;
    while (i < s.a.length && s.a[i] < k) { i = i + 1; }
    return i;
  }
  /* Primera posicion con clave > k. */
  function upperBound(s, k) {
    var i = 0;
    while (i < s.a.length && s.a[i] <= k) { i = i + 1; }
    return i;
  }
  function fin(s) { return s.a.length; }
  function count(s, k) {
    var i = lowerBound(s, k);
    return i < s.a.length && s.a[i] === k ? 1 : 0;
  }
  function find(s, k) {
    var i = lowerBound(s, k);
    return i < s.a.length && s.a[i] === k ? i : fin(s);
  }
  /* insert: si ya esta, no hace nada. Devuelve 1 si entro. */
  function insert(s, k) {
    var res = 0;
    if (count(s, k) === 0) {
      s.a.splice(lowerBound(s, k), 0, k);
      res = 1;
    }
    return res;
  }
  /* erase(k): devuelve cuantas claves quito, 0 o 1. */
  function erase(s, k) {
    var res = count(s, k);
    if (res === 1) { s.a.splice(lowerBound(s, k), 1); }
    return res;
  }
  /* erase(it): quita la clave de esa posicion. */
  function eraseEn(s, i) { s.a.splice(i, 1); }
  /* erase(desde, hasta): quita las posiciones [desde, hasta). */
  function eraseRango(s, i, j) { s.a.splice(i, j - i); }
  function de(claves) {
    var s = nuevo();
    claves.forEach(function (k) { insert(s, k); });
    return s;
  }
  function texto(s) { return s.a.join(" "); }

  function codigo(lineas) {
    var t = lineas.join("\n").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return "<pre class=\"fragmento\">" + t + "</pre>";
  }

  return {
    nuevo: nuevo, de: de, lowerBound: lowerBound, upperBound: upperBound, fin: fin,
    count: count, find: find, insert: insert, erase: erase, eraseEn: eraseEn,
    eraseRango: eraseRango, texto: texto, codigo: codigo
  };
})();

if (typeof module !== "undefined") {
  module.exports = Conjunto;
}
