/* Ejercicio interactivo: los ejercicios con la biblioteca. */
var EJERCICIO = (function () {
  var A = [1, 2, 5, 8, 9, 12];
  var B = [2, 3, 5, 9, 10];
  var PALABRAS = ["set", "map", "set", "list", "map", "set", "deque"];
  var IMPAR = [6, 1, 9, 4, 2];
  var PAR = [6, 1, 9, 4];

  /* Interseccion con dos iteradores; cuenta las vueltas del while. */
  function interseccion(a, b) {
    var r = [];
    var vueltas = 0;
    var i = 0;
    var j = 0;
    while (i < a.length && j < b.length) {
      vueltas = vueltas + 1;
      if (a[i] < b[j]) { i = i + 1; }
      else if (b[j] < a[i]) { j = j + 1; }
      else { r.push(a[i]); i = i + 1; j = j + 1; }
    }
    return { resultado: r, vueltas: vueltas };
  }

  /* Frecuencias: sort y un recorrido con dos ciclos anidados. */
  function frecuencias(p) {
    var w = p.slice().sort();
    var lineas = [];
    var it = 0;
    while (it < w.length) {
      var actual = w[it];
      var cuenta = 0;
      while (it < w.length && w[it] === actual) { cuenta = cuenta + 1; it = it + 1; }
      lineas.push(actual + " " + cuenta);
    }
    return lineas;
  }

  /* Mediana sobre una copia ordenada. */
  function mediana(v) {
    var w = v.slice().sort(function (a, b) { return a - b; });
    var n = w.length;
    return n % 2 === 1 ? w[Math.floor(n / 2)] : (w[n / 2 - 1] + w[n / 2]) / 2;
  }

  return { a: A, b: B, palabras: PALABRAS, impar: IMPAR, par: PAR,
           interseccion: interseccion, frecuencias: frecuencias, mediana: mediana };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    function pintarCodigo(id, lineas) {
      var caja = document.getElementById(id);
      lineas.forEach(function (par, i) {
        var linea = document.createElement("div");
        linea.className = "linea" + (par[1] ? " " + par[1] : "");
        var num = document.createElement("span");
        num.className = "num";
        num.textContent = i + 1;
        var txt = document.createElement("span");
        txt.className = "txt";
        txt.textContent = par[0];
        linea.appendChild(num);
        linea.appendChild(txt);
        caja.appendChild(linea);
      });
    }
    /* Opciones numericas con el motor comun; avisa cuando se pulsa la correcta. */
    function opcionesLogro(idOpciones, idVeredicto, armar, alAcertar) {
      Motor.opcionesNumericas(idOpciones, idVeredicto, armar);
      document.getElementById(idOpciones).addEventListener("click", function (e) {
        var b = e.target;
        if (b && b.getAttribute && b.getAttribute("data-op") === "correcta") { alAcertar(); }
      });
    }
    /* Descarta las opciones cuyo valor ya salio: nunca dos botones iguales. */
    function unicas(lista) {
      var vistos = [];
      return lista.filter(function (o) {
        var nuevo = vistos.indexOf(o.valor) === -1;
        if (nuevo) { vistos.push(o.valor); }
        return nuevo;
      });
    }
    var logradas = { interTxt: false, interN: false, frec: false, medImpar: false, medPar: false };
    function revisar() {
      if (logradas.interTxt && logradas.interN && logradas.frec && logradas.medImpar && logradas.medPar) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    pintarCodigo("codigo-inter", [
      ["vector<int> a = {1, 2, 5, 8, 9, 12};", ""],
      ["vector<int> b = {2, 3, 5, 9, 10};", ""],
      ["vector<int>::iterator i = a.begin();", ""],
      ["vector<int>::iterator j = b.begin();", ""],
      ["while (i != a.end() && j != b.end()) {", "bloque-1"],
      ["  if (*i < *j) { ++i; }", "bloque-2"],
      ["  else if (*j < *i) { ++j; }", "bloque-2"],
      ["  else { r.push_back(*i); ++i; ++j; }", "bloque-3"],
      ["}", ""]
    ]);
    opcionesLogro("opciones-inter", "veredicto-inter", function () {
      var a = EJERCICIO.a;
      var b = EJERCICIO.b;
      var r = EJERCICIO.interseccion(a, b);
      var union = a.concat(b.filter(function (x) { return a.indexOf(x) === -1; })).sort(function (x, y) { return x - y; });
      var soloA = a.filter(function (x) { return b.indexOf(x) === -1; });
      var sinFinal = r.resultado.slice(0, r.resultado.length - 1);
      return unicas([
        { valor: r.resultado.join(" "), clave: "correcta",
          razon: "Correcto: < " + r.resultado.join(" ") + " >. Cuando los dos son iguales se guarda y avanzan los dos; si no, avanza el menor." },
        { valor: union.join(" "), clave: "union",
          razon: "Esa es la unión. Solo se guarda cuando *i y *j son iguales; si no, avanza el menor y no se guarda nada." },
        { valor: soloA.join(" "), clave: "diferencia",
          razon: "Esos están en a y no en b. r guarda los que están en los dos." },
        { valor: sinFinal.join(" "), clave: "sin-ultimo",
          razon: "Falta el " + r.resultado[r.resultado.length - 1] + ": 9 está en a y en b, y el ciclo llega a compararlos antes de que b se agote." }
      ]);
    }, function () { logradas.interTxt = true; revisar(); });
    opcionesLogro("opciones-inter-n", "veredicto-inter-n", function () {
      var r = EJERCICIO.interseccion(EJERCICIO.a, EJERCICIO.b);
      var na = EJERCICIO.a.length;
      var nb = EJERCICIO.b.length;
      return unicas([
        { valor: r.vueltas, clave: "correcta",
          razon: "Correcto: " + r.vueltas + " vueltas. Cada vuelta avanza al menos un iterador, y el ciclo para cuando b se agota tras el 10, con el 12 de a sin mirar: por eso el costo es Θ(n_a + n_b) y no n_a · n_b." },
        { valor: na + nb, clave: "suma",
          razon: "Esa es la cota n_a + n_b. Las vueltas son menos: cuando coinciden dos elementos, una sola vuelta avanza los dos iteradores, y el ciclo termina apenas uno llega a end()." },
        { valor: na, clave: "una-por-a",
          razon: "Eso supone una vuelta por elemento de a. Pero el ciclo para cuando b se agota, y varias vueltas avanzan j y no i." },
        { valor: r.resultado.length, clave: "coincidencias",
          razon: "Esas son las coincidencias, las vueltas que guardan. También hay vueltas donde solo avanza el menor de los dos." }
      ]);
    }, function () { logradas.interN = true; revisar(); });

    pintarCodigo("codigo-frec", [
      ["vector<string> p = {\"set\", \"map\", \"set\", \"list\", \"map\", \"set\", \"deque\"};", ""],
      ["sort(p.begin(), p.end());", "bloque-1"],
      ["vector<string>::iterator it = p.begin();", ""],
      ["while (it != p.end()) {", "bloque-2"],
      ["  string actual = *it;", ""],
      ["  int cuenta = 0;", ""],
      ["  while (it != p.end() && *it == actual) { cuenta = cuenta + 1; ++it; }", "bloque-3"],
      ["  printf(\"%s %d\\n\", actual.c_str(), cuenta);", ""],
      ["}", ""]
    ]);
    opcionesLogro("opciones-frec", "veredicto-frec", function () {
      var p = EJERCICIO.palabras;
      var esperado = EJERCICIO.frecuencias(p);
      var aparicion = [];
      p.forEach(function (x) { if (aparicion.indexOf(x) === -1) { aparicion.push(x); } });
      var porAparicion = aparicion.map(function (x) {
        return x + " " + p.filter(function (y) { return y === x; }).length;
      });
      var sinSort = [];
      p.forEach(function (x, i) {
        if (i > 0 && p[i - 1] === x) {
          var ult = sinSort.length - 1;
          sinSort[ult] = x + " " + (Number(sinSort[ult].split(" ")[1]) + 1);
        } else { sinSort.push(x + " 1"); }
      });
      var desdeCero = esperado.map(function (l) {
        var t = l.split(" ");
        return t[0] + " " + (Number(t[1]) - 1);
      });
      return unicas([
        { valor: esperado.join(", "), clave: "correcta",
          razon: "Correcto: " + esperado.join(", ") + ", en orden alfabético porque el sort los dejó así. El ciclo de adentro consume cada grupo de iguales y el de afuera toma el siguiente distinto: cada palabra se visita una vez." },
        { valor: porAparicion.join(", "), clave: "aparicion",
          razon: "El orden de salida es el del sort, alfabético, no el de aparición." },
        { valor: sinSort.join(", "), clave: "sin-sort",
          razon: "Sin el sort los iguales no quedan juntos, y el ciclo de adentro solo agrupa los consecutivos: cada palabra saldría varias veces." },
        { valor: desdeCero.join(", "), clave: "desde-cero",
          razon: "cuenta suma 1 por cada elemento del grupo, incluido el primero: un grupo de un elemento da 1, no 0." }
      ]);
    }, function () { logradas.frec = true; revisar(); });

    opcionesLogro("opciones-med-impar", "veredicto-med-impar", function () {
      var v = EJERCICIO.impar;
      var e = EJERCICIO.mediana(v);
      var suma = v.reduce(function (s, x) { return s + x; }, 0);
      return unicas([
        { valor: e, clave: "correcta",
          razon: "Correcto: " + e + ". Ordenado queda {" + v.slice().sort(function (a, b) { return a - b; }).join(", ") + "}, y con n impar es el del medio, v[n / 2]. Los vectores de main siguen desordenados, porque mediana recibió una copia." },
        { valor: v[Math.floor(v.length / 2)], clave: "sin-ordenar",
          razon: "Primero se ordena la copia; la posición del medio se toma sobre el vector ordenado, no sobre el original." },
        { valor: Math.floor(v.length / 2), clave: "indice",
          razon: "Ese es el índice del medio, no lo que hay ahí. La mediana es el valor v[n / 2] del vector ordenado." },
        { valor: suma / v.length, clave: "promedio",
          razon: "Ese es el promedio. La mediana es el del medio del vector ordenado, y no usa los demás valores." }
      ]);
    }, function () { logradas.medImpar = true; revisar(); });
    opcionesLogro("opciones-med-par", "veredicto-med-par", function () {
      var v = EJERCICIO.par;
      var e = EJERCICIO.mediana(v);
      var w = v.slice().sort(function (a, b) { return a - b; });
      var n = w.length;
      return unicas([
        { valor: e, clave: "correcta",
          razon: "Correcto: " + e + ". Ordenado queda {" + w.join(", ") + "}, y con n par es el promedio de los dos del medio, " + w[n / 2 - 1] + " y " + w[n / 2] + "." },
        { valor: w[n / 2 - 1], clave: "izquierdo",
          razon: "Ese es solo el del medio de la izquierda. Con n par hay dos del medio y la mediana es su promedio." },
        { valor: w[n / 2], clave: "derecho",
          razon: "Ese es solo el del medio de la derecha. Con n par hay dos del medio y la mediana es su promedio." },
        { valor: n / 2, clave: "indice",
          razon: "Ese es el índice n / 2, no lo que hay ahí. Hay que mirar los dos valores del medio del vector ordenado." }
      ]);
    }, function () { logradas.medPar = true; revisar(); });
  })();
}
