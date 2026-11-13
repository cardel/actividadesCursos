/* Ejercicio interactivo: insertion sort y sus corrimientos. */
var EJERCICIO = (function () {
  var ARREGLO = [6, 4, 8, 2, 9, 5];
  var DECRECIENTE = [9, 8, 6, 5, 4, 2];

  /* Insertion sort tal como esta en el codigo de la sesion, guardando una foto
     del arreglo al terminar cada vuelta del ciclo externo. */
  function ordenar(entrada) {
    var a = entrada.slice();
    var n = a.length;
    var vueltas = [];
    var total = 0;
    var j = 1;
    while (j < n) {
      var clave = a[j];
      var corrimientos = 0;
      var i = j - 1;
      while (i >= 0 && a[i] > clave) {
        a[i + 1] = a[i];
        i = i - 1;
        corrimientos = corrimientos + 1;
      }
      a[i + 1] = clave;
      total = total + corrimientos;
      vueltas.push({ j: j, clave: clave, corrimientos: corrimientos, arreglo: a.slice() });
      j = j + 1;
    }
    return { vueltas: vueltas, total: total, final: a };
  }

  /* Los corrimientos del peor caso para n elementos: n(n-1)/2. */
  function peorCaso(n) {
    return n * (n - 1) / 2;
  }

  return { arreglo: ARREGLO, decreciente: DECRECIENTE, ordenar: ordenar, peorCaso: peorCaso };
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
    function leerLista(texto) {
      return texto.trim().split(/[\s,]+/).filter(function (x) { return x !== ""; }).map(Number);
    }
    function iguales(a, b) {
      return a.length === b.length && a.every(function (x, i) { return x === b[i]; });
    }
    var logradas = { vueltas: false, cortes: false, peor: false };
    var vueltasParcial = { lista: false, total: false };
    function alAcertar(idCaja, fn) {
      document.getElementById(idCaja).addEventListener("click", function (ev) {
        var b = ev.target;
        if (b && b.getAttribute && b.getAttribute("data-op") === "correcta") { fn(); }
      });
    }
    function unicas(lista) {
      var vistos = {};
      return lista.filter(function (o) {
        var dup = vistos[o.valor] === true;
        vistos[o.valor] = true;
        return !dup;
      });
    }
    function revisar() {
      if (logradas.vueltas && logradas.cortes && logradas.peor) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    var R = EJERCICIO.ordenar(EJERCICIO.arreglo);
    var CORRIMIENTOS = R.vueltas.map(function (v) { return v.corrimientos; });

    pintarCodigo("codigo-insertion", [
      ["long insertionSort(Elemento a[], int n) {", "bloque-1"],
      ["  long corrimientos = 0;", ""],
      ["  int j = 1;", ""],
      ["  while (j < n) {", "bloque-1"],
      ["    Elemento clave = a[j];", "bloque-2"],
      ["    int i = j - 1;", "bloque-2"],
      ["    while (i >= 0 && a[i] > clave) {", "bloque-3"],
      ["      a[i + 1] = a[i];", "bloque-3"],
      ["      i = i - 1;", "bloque-3"],
      ["      corrimientos = corrimientos + 1;", "bloque-3"],
      ["    }", ""],
      ["    a[i + 1] = clave;", "bloque-2"],
      ["    j = j + 1;", ""],
      ["  }", ""],
      ["  return corrimientos;", ""],
      ["}", ""]
    ]);

    document.getElementById("btn-vueltas").addEventListener("click", function () {
      var ver = document.getElementById("veredicto-vueltas");
      var dada = leerLista(document.getElementById("pred-vueltas").value);
      if (iguales(dada, CORRIMIENTOS)) {
        ver.className = "veredicto bien";
        ver.textContent = "Correcto: 1, 0, 3, 0, 3. Las vueltas de j = 2 y j = 4 traen el 8 y el 9, que ya son mayores que todo lo que tienen a la izquierda: el ciclo interno no entra y esa vuelta cuesta una comparación.";
        vueltasParcial.lista = true;
        if (vueltasParcial.total) { logradas.vueltas = true; revisar(); }
      } else if (dada.length === 5 && dada[1] !== 0) {
        ver.className = "veredicto mal";
        ver.textContent = "En j = 2 la clave es 8 y a su izquierda quedaron 4 y 6: la condición a[i] > clave falla en la primera comparación y no se corre nada.";
      } else if (dada.length !== 5) {
        ver.className = "veredicto mal";
        ver.textContent = "Cinco números: el ciclo externo arranca en j = 1 y llega hasta j = 5.";
      } else {
        ver.className = "veredicto mal";
        ver.textContent = "Para cada vuelta, cuente cuántos elementos a la izquierda de la clave son mayores que ella: esos son los que se corren.";
      }
    });

    Motor.opcionesNumericas("opciones-total", "veredicto-total", function () {
      var n = EJERCICIO.arreglo.length;
      return unicas([
        { valor: R.total, clave: "correcta",
          razon: "Correcto: " + R.total + ", la suma de los corrimientos de cada vuelta: " + CORRIMIENTOS.join(" + ") + "." },
        { valor: n - 1, clave: "vueltas",
          razon: "Ese es el número de vueltas del ciclo externo, no de corrimientos: cada vuelta corre una cantidad distinta de elementos, y varias no corren ninguno." },
        { valor: R.total + (n - 1), clave: "comparacion",
          razon: "Sumó una comparación extra por vuelta. Comparar no es correr: el corrimiento es la asignación a[i + 1] = a[i], y esa es la que cuenta corrimientos." },
        { valor: EJERCICIO.peorCaso(n), clave: "peor",
          razon: "Esa es la cuenta del peor caso, con la entrada de mayor a menor. Este arreglo viene mezclado y varias vueltas se detienen antes." }
      ]);
    });
    alAcertar("opciones-total", function () {
      vueltasParcial.total = true;
      if (vueltasParcial.lista) { logradas.vueltas = true; revisar(); }
    });

    document.getElementById("btn-cortes").addEventListener("click", function () {
      var ver = document.getElementById("veredicto-cortes");
      var j3 = leerLista(document.getElementById("pred-j3").value);
      var j5 = leerLista(document.getElementById("pred-j5").value);
      var e3 = R.vueltas[2].arreglo;
      var e5 = R.vueltas[4].arreglo;
      if (iguales(j3, e3) && iguales(j5, e5)) {
        ver.className = "veredicto bien";
        ver.textContent = "Correcto: " + e3.join(" ") + " y " + e5.join(" ") + ". Al terminar la vuelta j, las primeras j + 1 casillas están ordenadas entre sí y el resto no se ha tocado: tras j = 3 lo ordenado es 2 4 6 8 y el 9 y el 5 siguen donde estaban.";
        logradas.cortes = true; revisar();
      } else if (iguales(j5, e5)) {
        ver.className = "veredicto mal";
        ver.textContent = "El arreglo final está bien. En j = 3 la clave es 2 y solo se mueve la parte de la izquierda: las casillas 4 y 5 quedan como en la entrada.";
      } else if (iguales(j3, [2, 4, 6, 8, 5, 9]) || iguales(j5, [2, 4, 6, 8, 5, 9])) {
        ver.className = "veredicto mal";
        ver.textContent = "El ciclo interno no ordena lo que está a la derecha de la clave: solo corre hacia allá los elementos mayores que ella y devuelve la clave al hueco.";
      } else {
        ver.className = "veredicto mal";
        ver.textContent = "Tome la clave de la vuelta, sáquela del arreglo y córrale encima los mayores que estén a su izquierda; el resto queda intacto.";
      }
    });

    var vista = { i: 0 };
    function pintarTabla() {
      var cuerpo = document.getElementById("tabla-traza");
      cuerpo.innerHTML = "";
      R.vueltas.forEach(function (v, k) {
        var fila = document.createElement("tr");
        var visible = k < vista.i;
        [String(v.j),
         visible ? String(v.clave) : "?",
         visible ? String(v.corrimientos) : "?",
         visible ? v.arreglo.join(" ") : "?"].forEach(function (texto, c) {
          var celda = document.createElement("td");
          if (!visible && c > 0) { celda.className = "pend"; }
          celda.textContent = texto;
          fila.appendChild(celda);
        });
        cuerpo.appendChild(fila);
      });
      var acumulado = 0;
      var k = 0;
      while (k < vista.i) { acumulado = acumulado + R.vueltas[k].corrimientos; k = k + 1; }
      document.getElementById("progreso-traza").textContent =
        vista.i + " de " + R.vueltas.length + " vueltas, " + acumulado + " corrimientos hasta aquí";
      document.getElementById("btn-vuelta").disabled = vista.i === R.vueltas.length;
    }
    document.getElementById("btn-vuelta").addEventListener("click", function () {
      if (vista.i < R.vueltas.length) { vista.i = vista.i + 1; pintarTabla(); }
    });
    document.getElementById("btn-reinicio").addEventListener("click", function () {
      vista.i = 0; pintarTabla();
    });
    pintarTabla();

    Motor.opcionesNumericas("opciones-peor", "veredicto-peor", function () {
      var n = EJERCICIO.decreciente.length;
      var esperado = EJERCICIO.ordenar(EJERCICIO.decreciente).total;
      return unicas([
        { valor: esperado, clave: "correcta",
          razon: "Correcto: " + esperado + ". Cada clave es menor que todas las de su izquierda, así que la vuelta j corre los j elementos anteriores: 1 + 2 + 3 + 4 + 5, que es 6·5/2. Ese es el peor caso y por eso insertion sort es Θ(n²) ahí." },
        { valor: EJERCICIO.peorCaso(n + 1), clave: "hastan",
          razon: "La suma va de 1 a n - 1, no a n: el primer elemento no tiene ninguna vuelta propia, el ciclo externo arranca en j = 1." },
        { valor: n * n, clave: "cuadrado",
          razon: "No son n² corrimientos: la vuelta j corre j elementos, no n, y las vueltas son n - 1." },
        { valor: R.total, clave: "mezclada",
          razon: "Ese es el conteo de la entrada mezclada. Aquí cada elemento que llega es menor que todos los anteriores, así que ninguna vuelta se detiene antes de tiempo." }
      ]);
    });
    alAcertar("opciones-peor", function () { logradas.peor = true; revisar(); });
  })();
}
