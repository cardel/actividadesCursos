/* Ejercicio interactivo: cuadrados. El ciclo arranca en 1 y compara con <=,
   y la condición se evalúa una vez más que el cuerpo. La simulación da los
   mismos conteos que el programa instrumentado. */
var EJERCICIO = (function () {
  var CODIGO = [
    { txt: "int cuadrados(int m) {",        num: null },
    { txt: "    int i = 1;",                num: 1 },
    { txt: "    int suma = 0;",             num: 2 },
    { txt: "    while (i <= m) {",          num: 3 },
    { txt: "        int c = i * i;",        num: 4 },
    { txt: "        suma = suma + c;",      num: 5 },
    { txt: "        i = i + 1;",            num: 6 },
    { txt: "    }",                         num: null },
    { txt: "    return suma;",              num: 7 },
    { txt: "}",                             num: null }
  ];

  function simular(params) {
    var m = params.m;
    var pasos = [];
    var i = null, suma = null, c = null;
    function snap(linea) { pasos.push({ linea: linea, i: i, suma: suma, c: c }); }
    i = 1; snap(1);
    suma = 0; snap(2);
    var sigue = true;
    while (sigue) {
      snap(3);
      if (i <= m) {
        c = i * i; snap(4);
        suma = suma + c; snap(5);
        i = i + 1; snap(6);
      } else {
        sigue = false;
      }
    }
    snap(7);
    return pasos;
  }

  /* Conteo por línea a partir de la simulación. */
  function conteos(m) {
    var res = {};
    simular({ m: m }).forEach(function (p) { res[p.linea] = (res[p.linea] || 0) + 1; });
    return res;
  }

  function T(m) { return 4 * m + 4; }

  var FORMULAS = [
    { linea: 1, txt: "1", f: function () { return 1; } },
    { linea: 2, txt: "1", f: function () { return 1; } },
    { linea: 3, txt: "m + 1", f: function (m) { return m + 1; } },
    { linea: 4, txt: "m", f: function (m) { return m; } },
    { linea: 5, txt: "m", f: function (m) { return m; } },
    { linea: 6, txt: "m", f: function (m) { return m; } },
    { linea: 7, txt: "1", f: function () { return 1; } }
  ];

  /* Veredicto de la predicción: cuántas veces se evalúa la condición. */
  function evaluar(valor, m) {
    var res;
    if (valor === m + 1) {
      res = { ok: true, msg: "Correcto: " + (m + 1) + " evaluaciones. i toma los valores 1, 2, …, " + m + ", que dan cierto, y " + (m + 1) + ", que da falso y saca del ciclo." };
    } else if (valor === m) {
      res = { ok: false, msg: "Faltó una: la evaluación con i = " + (m + 1) + " da falso, pero también se ejecuta. Sin ella el programa no sabría que tiene que salir." };
    } else if (valor === m + 2) {
      res = { ok: false, msg: "Sobra una. El índice arranca en 1 y la condición es <=: los valores que dan cierto son exactamente m, del 1 al " + m + "." };
    } else if (valor === m - 1) {
      res = { ok: false, msg: "Con <= la vuelta de i = " + m + " también entra. Son " + m + " vueltas y una evaluación más." };
    } else {
      res = { ok: false, msg: "No coincide. Escriba los valores que toma i y marque cuáles dan cierto en i <= " + m + "." };
    }
    return res;
  }

  var RAZONES = {
    correcta: "Correcto: T(m) = 1 + 1 + (m + 1) + m + m + m + 1 = 4m + 4. El cuerpo tiene tres instrucciones y aporta 3m; la condición aporta m + 1. Es lineal, con constante 4.",
    sinuno: "Le falta la evaluación que falla. Con m = 5 la línea 3 marca 6, no 5, y el total simulado es 24, no 23.",
    tres: "Ese es el conteo de un ciclo con dos instrucciones en el cuerpo. Aquí son tres: la declaración de c también es una instrucción y se repite m veces.",
    cinco: "Sobra una unidad. Sume la columna simulada con m = 5: da 24, que es 4 · 5 + 4."
  };

  return { codigo: CODIGO, simular: simular, conteos: conteos, T: T, FORMULAS: FORMULAS,
    evaluar: evaluar, RAZONES: RAZONES };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var resuelta = false;

    function alPintar(e) {
      var m = e.params.m;
      var cuerpo = document.getElementById("cuerpo-conteo");
      cuerpo.innerHTML = "";
      var total = 0;
      EJERCICIO.FORMULAS.forEach(function (f) {
        var veces = e.conteos[f.linea] || 0;
        total = total + veces;
        var tr = document.createElement("tr");
        tr.innerHTML = "<td>" + f.linea + "</td><td>" + veces + "</td>" +
          (resuelta ? "<td>" + f.txt + "</td><td>" + f.f(m) + "</td>"
                    : "<td class='pend'>…</td><td class='pend'>…</td>");
        cuerpo.appendChild(tr);
      });
      var nota = document.getElementById("total-t");
      if (resuelta && e.terminado) {
        nota.innerHTML = "Suma de la columna simulada: <b>" + total + "</b>. T(m) = 4m + 4 con m = " + m + " da <b>" + EJERCICIO.T(m) + "</b>.";
      } else if (resuelta) {
        nota.textContent = "Termine la ejecución para comparar la fórmula con lo simulado.";
      } else {
        nota.textContent = "Las fórmulas aparecen cuando encuentre T(m) en la tarjeta 4.";
      }
      document.getElementById("m-formula").textContent = m;
    }

    Motor.iniciar({
      codigo: EJERCICIO.codigo,
      simular: EJERCICIO.simular,
      chips: [
        { campo: "i", rotulo: "i" },
        { campo: "c", rotulo: "c" },
        { campo: "suma", rotulo: "suma", clase: "cuenta" }
      ],
      paramsIniciales: { m: 5 },
      alPintar: alPintar
    });

    Motor.prediccionNumerica(function (valor, params) { return EJERCICIO.evaluar(valor, params.m); });

    Array.prototype.forEach.call(document.querySelectorAll("#opciones-analisis button"), function (b) {
      b.addEventListener("click", function () {
        var v = document.getElementById("veredicto-analisis");
        var op = b.getAttribute("data-op");
        v.className = op === "correcta" ? "veredicto bien" : "veredicto mal";
        v.textContent = EJERCICIO.RAZONES[op];
        if (op === "correcta") { resuelta = true; Motor.repintar(); }
      });
    });

    function cambiarM(m) {
      document.getElementById("rango-m").value = m;
      document.getElementById("ver-m").textContent = m;
      Motor.limpiarVeredicto();
      Motor.reiniciar({ m: m });
    }
    document.getElementById("rango-m").addEventListener("input", function (ev) {
      cambiarM(parseInt(ev.target.value, 10));
    });
    Array.prototype.forEach.call(document.querySelectorAll(".presets button"), function (b) {
      b.addEventListener("click", function () { cambiarM(parseInt(b.getAttribute("data-m"), 10)); });
    });
  })();
}
