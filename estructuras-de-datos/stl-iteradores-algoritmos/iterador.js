/* Ejercicio interactivo: el iterador como puntero. */
var EJERCICIO = (function () {
  var V = [4, 8, 1, 6, 3];

  /* it = v.begin() + k: que hay ahi y que indice es. */
  function posicion(v, k) {
    return { valor: v[k], indice: k };
  }

  /* Recorrido con iterador que imprime los pares; devuelve lo impreso y cuantas veces se leyo *it. */
  function pares(v) {
    var salida = [];
    var lecturas = 0;
    var it = 0;
    while (it !== v.length) {
      lecturas = lecturas + 1;
      if (v[it] % 2 === 0) { salida.push(v[it]); }
      it = it + 1;
    }
    return { salida: salida, lecturas: lecturas };
  }

  /* Tras k avances desde begin, ¿ya es end? */
  function esEnd(v, k) {
    return k === v.length;
  }

  return { v: V, posicion: posicion, pares: pares, esEnd: esEnd };
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
    var logradas = { posValor: false, posIndice: false, paresTxt: false, paresN: false, end: false };
    function revisar() {
      if (logradas.posValor && logradas.posIndice && logradas.paresTxt && logradas.paresN && logradas.end) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    pintarCodigo("codigo-pos", [
      ["vector<int> v = {4, 8, 1, 6, 3};", ""],
      ["vector<int>::iterator it = v.begin() + 3;", "bloque-1"],
      ["printf(\"%d %d\\n\", *it, (int) (it - v.begin()));", "bloque-2"]
    ]);
    opcionesLogro("opciones-pos-valor", "veredicto-pos-valor", function () {
      var r = EJERCICIO.posicion(EJERCICIO.v, 3);
      return unicas([
        { valor: r.valor, clave: "correcta",
          razon: "Correcto: " + r.valor + ". v.begin() + 3 señala la casilla 3 y *it lee lo que hay ahí." },
        { valor: 3, clave: "indice",
          razon: "*it no es el índice: es el contenido de la casilla 3. Cuente desde 0." },
        { valor: EJERCICIO.v[2], clave: "tercero",
          razon: "begin() + 3 avanza tres casillas desde la 0: la 0 es el " + EJERCICIO.v[0] + ", la 1 el " + EJERCICIO.v[1] + ", la 2 el " + EJERCICIO.v[2] + " y la 3 el " + EJERCICIO.v[3] + "." },
        { valor: EJERCICIO.v[0], clave: "begin",
          razon: "Ese es *v.begin(), sin avanzar. Aquí it ya se desplazó tres casillas." }
      ]);
    }, function () { logradas.posValor = true; revisar(); });
    opcionesLogro("opciones-pos-indice", "veredicto-pos-indice", function () {
      var r = EJERCICIO.posicion(EJERCICIO.v, 3);
      return unicas([
        { valor: r.indice, clave: "correcta",
          razon: "Correcto: " + r.indice + ". it - v.begin() devuelve cuántas casillas hay desde el principio hasta it." },
        { valor: r.indice + 1, clave: "desde-uno",
          razon: "Esa cuenta empieza en 1. Las casillas se numeran desde 0, y begin() + 3 es la casilla 3." },
        { valor: r.valor, clave: "contenido",
          razon: "Eso es lo que hay en la casilla, *it. La resta de iteradores da una distancia, no un contenido." },
        { valor: EJERCICIO.v.length, clave: "tamano",
          razon: "Ese es el tamaño del vector, que sería it - v.begin() solo si it estuviera en end()." }
      ]);
    }, function () { logradas.posIndice = true; revisar(); });

    pintarCodigo("codigo-pares", [
      ["vector<int> v = {4, 8, 1, 6, 3};", ""],
      ["vector<int>::iterator it = v.begin();", "bloque-1"],
      ["while (it != v.end()) {", "bloque-1"],
      ["  if (*it % 2 == 0) {", "bloque-2"],
      ["    printf(\" %d\", *it);", "bloque-2"],
      ["  }", ""],
      ["  ++it;", "bloque-3"],
      ["}", ""]
    ]);
    opcionesLogro("opciones-pares", "veredicto-pares", function () {
      var v = EJERCICIO.v;
      var r = EJERCICIO.pares(v);
      var impares = v.filter(function (x) { return x % 2 !== 0; });
      var indicesPares = v.filter(function (x, i) { return i % 2 === 0; });
      return unicas([
        { valor: r.salida.join(" "), clave: "correcta",
          razon: "Correcto: " + r.salida.join(" ") + ". El recorrido con iterador es el de índice con otros nombres: it != v.end() es p < size(), *it es v[p], ++it es p = p + 1." },
        { valor: v.join(" "), clave: "todos",
          razon: "Solo se imprimen los que pasan el if: los pares." },
        { valor: impares.join(" "), clave: "impares",
          razon: "Esos son los que el if rechaza. Se imprimen los que cumplen *it % 2 == 0, los pares." },
        { valor: indicesPares.join(" "), clave: "posicion",
          razon: "Esos son los elementos en posiciones pares. El if mira el valor *it, no la posición." }
      ]);
    }, function () { logradas.paresTxt = true; revisar(); });
    opcionesLogro("opciones-pares-n", "veredicto-pares-n", function () {
      var r = EJERCICIO.pares(EJERCICIO.v);
      var n = EJERCICIO.v.length;
      return unicas([
        { valor: r.lecturas, clave: "correcta",
          razon: "Correcto: " + r.lecturas + ", una por casilla. El if lee *it en cada vuelta, sea par o no, y hay una vuelta por elemento." },
        { valor: r.salida.length, clave: "impresos",
          razon: "Esas son las veces que se imprime, no las que se lee. El if lee *it en cada vuelta, también cuando el elemento es impar." },
        { valor: n - r.salida.length, clave: "impares",
          razon: "Esos son los que el if rechaza. Pero para rechazarlos hay que leerlos: se lee *it en cada casilla." },
        { valor: n + 1, clave: "end",
          razon: "*it nunca se lee en end(): el while se detiene antes. Se lee solo en las " + n + " casillas del vector." }
      ]);
    }, function () { logradas.paresN = true; revisar(); });

    var MENSAJES_END = {
      si: null,
      no: "Cinco avances desde begin() sobre cinco elementos dejan a it justo después del último: eso es exactamente end().",
      ultimo: "end() no es el último elemento: es la casilla que sigue al último y no se lee. Tras cinco ++it desde begin(), it ya está ahí."
    };
    pintarCodigo("codigo-end", [
      ["vector<int> v = {4, 8, 1, 6, 3};", ""],
      ["vector<int>::iterator it = v.begin();", ""],
      ["++it; ++it; ++it; ++it; ++it;", "bloque-1"],
      ["printf(\"%d\\n\", it == v.end());", "bloque-2"]
    ]);
    document.querySelectorAll("#opciones-end button").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var ver = document.getElementById("veredicto-end");
        var m = MENSAJES_END[boton.dataset.op];
        if (m === null) {
          ver.className = "veredicto bien";
          ver.textContent = "Correcto: imprime 1. Con cinco elementos, cinco avances llevan a it a end(), la casilla que sigue a la última. Leer *it ahí sería el mismo error que v[5].";
          logradas.end = true; revisar();
        } else {
          ver.className = "veredicto mal";
          ver.textContent = m;
        }
      });
    });
  })();
}
