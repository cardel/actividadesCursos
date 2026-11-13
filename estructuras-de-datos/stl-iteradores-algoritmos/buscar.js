/* Ejercicio interactivo: lower_bound, unique y accumulate. */
var EJERCICIO = (function () {
  var ORDENADO = [2, 4, 4, 4, 9, 11];
  var CONSULTAS = [4, 5, 11, 12];
  var CON_REPETIDOS = [7, 3, 7, 1, 3, 3, 9];

  /* Primera posicion cuyo valor no es menor que x, en un vector ordenado. */
  function lowerBound(v, x) {
    var lo = 0;
    var hi = v.length;
    while (lo < hi) {
      var m = Math.floor((lo + hi) / 2);
      if (v[m] < x) { lo = m + 1; } else { hi = m; }
    }
    return lo;
  }

  /* sort + unique + erase: el vector final y cuantos distintos dejo unique al frente. */
  function sinRepetidos(v) {
    var w = v.slice().sort(function (a, b) { return a - b; });
    var destino = 0;
    var p = 0;
    while (p < w.length) {
      if (p === 0 || w[p] !== w[p - 1]) {
        w[destino] = w[p];
        destino = destino + 1;
      }
      p = p + 1;
    }
    var tras_unique = w.slice();
    w.splice(destino, w.length - destino);
    return { ordenado: v.slice().sort(function (a, b) { return a - b; }), trasUnique: tras_unique, distintos: destino, final: w };
  }

  /* accumulate con int: suma modulo 2^32 con signo. */
  function acumularInt(v) {
    var s = 0;
    v.forEach(function (x) { s = (s + x) | 0; });
    return s;
  }

  return { ordenado: ORDENADO, consultas: CONSULTAS, conRepetidos: CON_REPETIDOS,
           lowerBound: lowerBound, sinRepetidos: sinRepetidos, acumularInt: acumularInt };
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
    var logradas = { lb: false, uniqueN: false, uniqueTxt: false, acc: false };
    function revisar() {
      if (logradas.lb && logradas.uniqueN && logradas.uniqueTxt && logradas.acc) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    pintarCodigo("codigo-lb", [
      ["vector<int> v = {2, 4, 4, 4, 9, 11};   // ya ordenado", ""],
      ["vector<int>::iterator it = lower_bound(v.begin(), v.end(), x);", "bloque-1"],
      ["printf(\"%d\\n\", (int) (it - v.begin()));", "bloque-2"]
    ]);
    opcionesLogro("opciones-lb", "veredicto-lb", function () {
      var o = EJERCICIO.ordenado;
      var q = EJERCICIO.consultas;
      var esperado = q.map(function (x) { return EJERCICIO.lowerBound(o, x); });
      var ultima = q.map(function (x) {
        var p = EJERCICIO.lowerBound(o, x);
        while (p + 1 < o.length && o[p] === x && o[p + 1] === x) { p = p + 1; }
        return p;
      });
      var sinFin = esperado.map(function (p) { return Math.min(p, o.length - 1); });
      var desdeUno = esperado.map(function (p) { return p + 1; });
      return unicas([
        { valor: esperado.join(" "), clave: "correcta",
          razon: "Correcto: " + esperado.join(" ") + ". Con 4, la primera de las tres apariciones; con 5, que no está, la posición donde iría (la del 9); con 11, la última casilla; con 12, mayor que todos, end(): índice 6, el tamaño. Por eso se comprueba it != v.end() antes de leer *it." },
        { valor: ultima.join(" "), clave: "ultima",
          razon: "lower_bound da la primera posición cuyo valor no es menor que x: con tres 4 seguidos, la primera, no la última." },
        { valor: sinFin.join(" "), clave: "sin-end",
          razon: "Con 12, ningún valor es mayor o igual: lower_bound devuelve end(), y end() - begin() es el tamaño del vector, " + o.length + ", no el último índice." },
        { valor: desdeUno.join(" "), clave: "desde-uno",
          razon: "Esa cuenta empieza en 1. it - v.begin() da índices desde 0." }
      ]);
    }, function () { logradas.lb = true; revisar(); });

    pintarCodigo("codigo-unique", [
      ["vector<int> v = {7, 3, 7, 1, 3, 3, 9};", ""],
      ["sort(v.begin(), v.end());", "bloque-1"],
      ["vector<int>::iterator fin = unique(v.begin(), v.end());", "bloque-2"],
      ["printf(\"%d\\n\", (int) (fin - v.begin()));", "bloque-2"],
      ["v.erase(fin, v.end());", "bloque-3"]
    ]);
    opcionesLogro("opciones-unique-n", "veredicto-unique-n", function () {
      var r = EJERCICIO.sinRepetidos(EJERCICIO.conRepetidos);
      var v = EJERCICIO.conRepetidos;
      // unique sin sort: solo junta repetidos consecutivos
      var sinOrden = v.filter(function (x, i) { return i === 0 || x !== v[i - 1]; }).length;
      return unicas([
        { valor: r.distintos, clave: "correcta",
          razon: "Correcto: " + r.distintos + ". Tras el sort los iguales quedan juntos, unique deja uno de cada y devuelve la posición donde termina lo válido." },
        { valor: v.length, clave: "tamano",
          razon: "Ese es el tamaño del vector. unique no borra nada: devuelve dónde termina lo válido, y eso es lo que imprime fin - v.begin()." },
        { valor: sinOrden, clave: "sin-sort",
          razon: "Ese sería el resultado sin el sort: unique solo junta repetidos consecutivos. Después del sort los iguales quedan juntos y salen " + r.distintos + " distintos." },
        { valor: r.distintos - 1, clave: "indice",
          razon: "Ese es el índice del último distinto. fin apunta a la casilla que sigue, así que fin - v.begin() cuenta los " + r.distintos + "." }
      ]);
    }, function () { logradas.uniqueN = true; revisar(); });
    opcionesLogro("opciones-unique", "veredicto-unique", function () {
      var v = EJERCICIO.conRepetidos;
      var r = EJERCICIO.sinRepetidos(v);
      var sinOrden = v.filter(function (x, i) { return i === 0 || x !== v[i - 1]; });
      var aparicion = v.filter(function (x, i) { return v.indexOf(x) === i; });
      return unicas([
        { valor: r.final.join(" "), clave: "correcta",
          razon: "Correcto: v queda < " + r.final.join(" ") + " >. Tras el sort, < " + r.ordenado.join(" ") + " >; unique copia al frente cada valor distinto del anterior y el erase recorta desde la posición donde termina lo válido." },
        { valor: aparicion.join(" "), clave: "aparicion",
          razon: "Primero va el sort: sin él los distintos no quedan en orden de aparición, quedan ordenados de menor a mayor." },
        { valor: sinOrden.join(" "), clave: "sin-sort",
          razon: "Sin el sort, unique solo junta repetidos consecutivos. Después del sort los iguales quedan juntos y en orden." },
        { valor: r.trasUnique.join(" "), clave: "sin-erase",
          razon: "Eso es el vector justo después de unique y antes del erase: de la posición " + r.distintos + " en adelante no significa nada. El erase lo recorta." }
      ]);
    }, function () {
      logradas.uniqueTxt = true; revisar();
      var r = EJERCICIO.sinRepetidos(EJERCICIO.conRepetidos);
      document.getElementById("nota-unique").style.display = "block";
      document.getElementById("nota-unique").textContent = "Con esta biblioteca, justo después de unique y antes del erase el vector quedó < " + r.trasUnique.join(" ") + " >: de la posición " + r.distintos + " en adelante no significa nada, y otra biblioteca puede dejar otra cosa.";
    });

    var MENSAJES_ACC = {
      negativo: null,
      grande: "En int no cabe: 4 000 000 000 supera 2 147 483 647. La suma se acumula en el tipo del valor inicial, 0, que es int, y da la vuelta.",
      error: "Compila sin avisos: sumar dos int es válido, aunque el resultado no quepa. El desbordamiento se ve en la salida, no en el compilador."
    };
    pintarCodigo("codigo-acc", [
      ["vector<int> v = {2000000000, 2000000000};", ""],
      ["int s = accumulate(v.begin(), v.end(), 0);", "bloque-1"],
      ["printf(\"%d\\n\", s);", "bloque-2"]
    ]);
    document.querySelectorAll("#opciones-acc button").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var ver = document.getElementById("veredicto-acc");
        var m = MENSAJES_ACC[boton.dataset.op];
        if (m === null) {
          ver.className = "veredicto bien";
          ver.textContent = "Correcto: imprime " + EJERCICIO.acumularInt([2000000000, 2000000000]) + ". El 0 inicial es int, la suma se acumula en int y 4 000 000 000 no cabe. Con 0LL la suma es long long y sale 4000000000.";
          logradas.acc = true; revisar();
        } else {
          ver.className = "veredicto mal";
          ver.textContent = m;
        }
      });
    });
  })();
}
