/* Ejercicio interactivo: borrar mientras se recorre. */
var EJERCICIO = (function () {
  var V = [-2, 5, -1, -3, 7, 0, -4];

  /* it = v.erase(it) cuando es negativo, ++it si no. Devuelve el vector final y
     cuantos elementos se corrieron en total (cada erase en p corre n - p - 1). */
  function quitarNegativosErase(v) {
    var w = v.slice();
    var corridos = 0;
    var it = 0;
    while (it !== w.length) {
      if (w[it] < 0) {
        corridos = corridos + (w.length - it - 1);
        w.splice(it, 1);
      } else {
        it = it + 1;
      }
    }
    return { final: w, corridos: corridos };
  }

  /* Compactar: copia hacia el frente y recorta. Cuenta las copias hechas. */
  function quitarNegativosCompactar(v) {
    var w = v.slice();
    var destino = 0;
    var copias = 0;
    var p = 0;
    while (p < w.length) {
      if (w[p] >= 0) {
        w[destino] = w[p];
        copias = copias + 1;
        destino = destino + 1;
      }
      p = p + 1;
    }
    w.splice(destino, w.length - destino);
    return { final: w, copias: copias };
  }

  /* El error: v.erase(it) y luego ++it siempre. Que elementos revisa y cuales se salta. */
  function erroneo(v) {
    var w = v.slice();
    var revisados = [];
    var it = 0;
    while (it < w.length) {
      revisados.push(w[it]);
      if (w[it] < 0) {
        w.splice(it, 1);
      }
      it = it + 1;
    }
    var saltados = v.filter(function (x) { return revisados.indexOf(x) === -1; });
    return { final: w, revisados: revisados, saltados: saltados };
  }

  return { v: V, erase: quitarNegativosErase, compactar: quitarNegativosCompactar, erroneo: erroneo };
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
    var logradas = { erase: false, error: false, corridos: false, copias: false };
    function revisar() {
      if (logradas.erase && logradas.error && logradas.corridos && logradas.copias) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    pintarCodigo("codigo-erase", [
      ["vector<int> v = {-2, 5, -1, -3, 7, 0, -4};", ""],
      ["vector<int>::iterator it = v.begin();", ""],
      ["while (it != v.end()) {", "bloque-1"],
      ["  if (*it < 0) {", "bloque-2"],
      ["    it = v.erase(it);", "bloque-2"],
      ["  } else {", ""],
      ["    ++it;", "bloque-3"],
      ["  }", ""],
      ["}", ""]
    ]);
    opcionesLogro("opciones-erase", "veredicto-erase", function () {
      var v = EJERCICIO.v;
      var r = EJERCICIO.erase(v);
      var salta = EJERCICIO.erroneo(v);
      var soloNeg = v.filter(function (x) { return x < 0; });
      var sinCero = v.filter(function (x) { return x > 0; });
      return unicas([
        { valor: r.final.join(" "), clave: "correcta",
          razon: "Correcto: < " + r.final.join(" ") + " >. Cada erase devuelve la posición del que sigue, así que -3, que venía justo después de -1, también se revisa; el 0 no es negativo y se queda." },
        { valor: salta.final.join(" "), clave: "salta",
          razon: "Ese es el resultado del ciclo erróneo que salta un elemento tras cada erase. Aquí it = v.erase(it) ya deja a it sobre el -3, y no se avanza." },
        { valor: sinCero.join(" "), clave: "sin-cero",
          razon: "El 0 no es negativo: la condición es *it < 0." },
        { valor: soloNeg.join(" "), clave: "invertido",
          razon: "Esos son los que se borran. El vector conserva los que no cumplen *it < 0." }
      ]);
    }, function () { logradas.erase = true; revisar(); });

    var MENSAJES_ERROR = {
      salta: null,
      igual: "No es igual: tras v.erase(it), it ya señala al elemento siguiente, y el ++it lo salta sin revisarlo. Con dos negativos seguidos, el segundo sobrevive.",
      todos: "Peor que dejar uno: cuando el último elemento se borra, el ++it pasa más allá de end() y el ciclo lee memoria que no es del vector."
    };
    pintarCodigo("codigo-error", [
      ["vector<int> v = {-2, 5, -1, -3, 7, 0, -4};", ""],
      ["vector<int>::iterator it = v.begin();", ""],
      ["while (it != v.end()) {", "bloque-1"],
      ["  if (*it < 0) {", "bloque-2"],
      ["    v.erase(it);", "bloque-2"],
      ["  }", ""],
      ["  ++it;", "bloque-3"],
      ["}", ""]
    ]);
    document.querySelectorAll("#opciones-error button").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var ver = document.getElementById("veredicto-error");
        var m = MENSAJES_ERROR[boton.dataset.op];
        if (m === null) {
          ver.className = "veredicto bien";
          ver.textContent = "Correcto: el -3 nunca se revisa, porque tras borrar el -1 el ++it lo salta, y queda < 5 -3 7 0 >. Y al borrar el -4 final, it queda en end() y el ++it lo pasa de largo: el while ya no se detiene donde debe. Un iterador tras erase no vale; se usa el que erase devuelve.";
          logradas.error = true; revisar();
        } else {
          ver.className = "veredicto mal";
          ver.textContent = m;
        }
      });
    });

    function negativos(v) {
      return v.filter(function (x) { return x < 0; }).length;
    }
    opcionesLogro("opciones-corridos", "veredicto-corridos", function () {
      var e = EJERCICIO.erase(EJERCICIO.v);
      var n = EJERCICIO.v.length;
      var k = negativos(EJERCICIO.v);
      return unicas([
        { valor: e.corridos, clave: "correcta",
          razon: "Correcto: " + e.corridos + " corrimientos (6 al borrar -2, 4 al borrar -1, 3 al borrar -3, 0 al borrar -4). Con k borrados sobre n elementos, O(kn) frente a Θ(n) al compactar." },
        { valor: k * n, clave: "cota",
          razon: "Esa es la cota k · n, con k = " + k + " y n = " + n + ". Cada erase corre lo que sigue a la posición borrada, no el vector entero, y el vector se acorta con cada borrado." },
        { valor: k, clave: "uno-por-borrado",
          razon: "Eso supone que cada erase cuesta un solo corrimiento. En medio del vector, erase corre todo lo que viene después." },
        { valor: e.corridos + k, clave: "con-borrado",
          razon: "Ahí se cuenta también el elemento borrado en cada erase, que no se corre: desaparece. Se corren solo los que van después." }
      ]);
    }, function () { logradas.corridos = true; revisar(); });
    opcionesLogro("opciones-copias", "veredicto-copias", function () {
      var e = EJERCICIO.erase(EJERCICIO.v);
      var c = EJERCICIO.compactar(EJERCICIO.v);
      var n = EJERCICIO.v.length;
      var k = negativos(EJERCICIO.v);
      return unicas([
        { valor: c.copias, clave: "correcta",
          razon: "Correcto: " + c.copias + " copias, una por elemento que queda. Compactar toca cada elemento una sola vez." },
        { valor: n, clave: "todos",
          razon: "Eso copiaría todo el vector. Compactar copia solo los elementos que no son negativos, cada uno a su nueva posición." },
        { valor: k, clave: "borrados",
          razon: "Esos son los que se borran, y los borrados no se copian. Se copian los que se quedan: cuente cuántos son." },
        { valor: e.corridos, clave: "corrimientos",
          razon: "Ese es el costo de la otra versión, uno a uno con erase. Al compactar se copia una vez cada elemento que queda." }
      ]);
    }, function () { logradas.copias = true; revisar(); });
  })();
}
