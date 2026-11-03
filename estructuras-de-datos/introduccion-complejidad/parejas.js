/* Ejercicio interactivo: parejas. Un ciclo adentro de otro, con dos tamaños
   que no dependen el uno del otro. La simulación da los mismos conteos que
   el programa instrumentado. */
var EJERCICIO = (function () {
  var CODIGO = [
    { txt: "int parejas(int n, int m) {",       num: null },
    { txt: "    int cuenta = 0;",               num: 1 },
    { txt: "    int i = 0;",                    num: 2 },
    { txt: "    while (i < n) {",               num: 3 },
    { txt: "        int j = 0;",                num: 4, bloque: 2 },
    { txt: "        while (j < m) {",           num: 5, bloque: 2 },
    { txt: "            cuenta = cuenta + 1;",  num: 6, bloque: 2 },
    { txt: "            j = j + 1;",            num: 7, bloque: 2 },
    { txt: "        }",                         num: null },
    { txt: "        i = i + 1;",                num: 8 },
    { txt: "    }",                             num: null },
    { txt: "    return cuenta;",                num: 9 },
    { txt: "}",                                 num: null }
  ];

  function simular(params) {
    var n = params.n, m = params.m;
    var pasos = [];
    var cuenta = null, i = null, j = null;
    function snap(linea) { pasos.push({ linea: linea, i: i, j: j, cuenta: cuenta }); }
    cuenta = 0; snap(1);
    i = 0; snap(2);
    var sigue = true;
    while (sigue) {
      snap(3);
      if (i < n) {
        j = 0; snap(4);
        var dentro = true;
        while (dentro) {
          snap(5);
          if (j < m) {
            cuenta = cuenta + 1; snap(6);
            j = j + 1; snap(7);
          } else {
            dentro = false;
          }
        }
        i = i + 1; snap(8);
      } else {
        sigue = false;
      }
    }
    snap(9);
    return pasos;
  }

  function conteos(n, m) {
    var res = {};
    simular({ n: n, m: m }).forEach(function (p) { res[p.linea] = (res[p.linea] || 0) + 1; });
    return res;
  }

  function T(n, m) { return 3 * n * m + 4 * n + 4; }

  var FORMULAS = [
    { linea: 1, txt: "1", f: function () { return 1; } },
    { linea: 2, txt: "1", f: function () { return 1; } },
    { linea: 3, txt: "n + 1", f: function (n) { return n + 1; } },
    { linea: 4, txt: "n", f: function (n) { return n; } },
    { linea: 5, txt: "n(m + 1)", f: function (n, m) { return n * (m + 1); } },
    { linea: 6, txt: "nm", f: function (n, m) { return n * m; } },
    { linea: 7, txt: "nm", f: function (n, m) { return n * m; } },
    { linea: 8, txt: "n", f: function (n) { return n; } },
    { linea: 9, txt: "1", f: function () { return 1; } }
  ];

  function evaluar(valor, n, m) {
    var esperado = n * (m + 1);
    var res;
    if (valor === esperado) {
      res = { ok: true, msg: "Correcto: " + esperado + " evaluaciones. Cada una de las " + n + " vueltas de afuera evalúa j < m " + (m + 1) + " veces: " + m + " ciertas y la que sale." };
    } else if (valor === n * m) {
      res = { ok: false, msg: "Faltan " + n + ": en cada vuelta de afuera el ciclo de adentro también tiene su evaluación que falla, y hay " + n + " vueltas." };
    } else if (valor === n * m + 1) {
      res = { ok: false, msg: "La evaluación que falla no ocurre una sola vez: j vuelve a 0 en cada vuelta de afuera, y el ciclo de adentro sale " + n + " veces." };
    } else if (valor === (n + 1) * (m + 1)) {
      res = { ok: false, msg: "En la última evaluación de i < n, que da falso, no se entra al ciclo: el de adentro corre " + n + " veces, no " + (n + 1) + "." };
    } else if (valor === m + 1) {
      res = { ok: false, msg: "Eso es una sola pasada del ciclo de adentro. Se repite una vez por cada valor de i." };
    } else {
      res = { ok: false, msg: "No coincide. ¿Cuántas veces se evalúa j < m en una vuelta de afuera? ¿Cuántas vueltas de afuera hay?" };
    }
    return res;
  }

  var RAZONES = {
    correcta: "Correcto: T(n, m) = 1 + 1 + (n + 1) + n + n(m + 1) + nm + nm + n + 1 = 3nm + 4n + 4. Con m = n queda 3n² + 4n + 4, cuadrático.",
    suma: "Sumar n y m sería poner un ciclo después del otro. Aquí el de adentro se repite completo en cada vuelta del de afuera: los tamaños se multiplican.",
    sinuno: "Falta contar las n evaluaciones que fallan en el ciclo de adentro: la línea 5 es n(m + 1), no nm.",
    cuadrado: "Eso supone m = n. Con n = 4 y m = 3 el total simulado es 56, y 3 · 16 + 4 · 4 + 4 da 68."
  };

  var RAZONES_FIJO = {
    correcta: "Correcto. Con m = 3, T(n) = 3 · 3n + 4n + 4 = 13n + 4: una recta. El ciclo anidado da costo cuadrático solo cuando los dos tamaños crecen con la entrada.",
    cuad: "Hay dos ciclos anidados, pero el de adentro siempre da tres vueltas. Duplicar n duplica el trabajo, no lo cuadruplica.",
    constante: "El de adentro es fijo, el de afuera no: con n más grande hay más vueltas de afuera, y cada una cuesta lo mismo."
  };

  return { codigo: CODIGO, simular: simular, conteos: conteos, T: T, FORMULAS: FORMULAS,
    evaluar: evaluar, RAZONES: RAZONES, RAZONES_FIJO: RAZONES_FIJO };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var resuelta = false;
    var p = { n: 4, m: 3 };

    function alPintar(e) {
      var n = e.params.n, m = e.params.m;
      var cuerpo = document.getElementById("cuerpo-conteo");
      cuerpo.innerHTML = "";
      var total = 0;
      EJERCICIO.FORMULAS.forEach(function (f) {
        var veces = e.conteos[f.linea] || 0;
        total = total + veces;
        var tr = document.createElement("tr");
        tr.innerHTML = "<td>" + f.linea + "</td><td>" + veces + "</td>" +
          (resuelta ? "<td>" + f.txt + "</td><td>" + f.f(n, m) + "</td>"
                    : "<td class='pend'>…</td><td class='pend'>…</td>");
        cuerpo.appendChild(tr);
      });
      var nota = document.getElementById("total-t");
      if (resuelta && e.terminado) {
        nota.innerHTML = "Suma de la columna simulada: <b>" + total + "</b>. T(n, m) = 3nm + 4n + 4 con n = " + n + " y m = " + m + " da <b>" + EJERCICIO.T(n, m) + "</b>.";
      } else if (resuelta) {
        nota.textContent = "Termine la ejecución para comparar la fórmula con lo simulado.";
      } else {
        nota.textContent = "Las fórmulas aparecen cuando encuentre T(n, m) en la tarjeta 4.";
      }
      document.getElementById("nm-formula").textContent = "n = " + n + ", m = " + m;
    }

    Motor.iniciar({
      codigo: EJERCICIO.codigo,
      simular: EJERCICIO.simular,
      chips: [
        { campo: "i", rotulo: "i" },
        { campo: "j", rotulo: "j" },
        { campo: "cuenta", rotulo: "cuenta", clase: "cuenta" }
      ],
      paramsIniciales: { n: 4, m: 3 },
      alPintar: alPintar
    });

    Motor.prediccionNumerica(function (valor, params) { return EJERCICIO.evaluar(valor, params.n, params.m); });

    function conectar(id, ver, razones, alAcertar) {
      Array.prototype.forEach.call(document.querySelectorAll("#" + id + " button"), function (b) {
        b.addEventListener("click", function () {
          var v = document.getElementById(ver);
          var op = b.getAttribute("data-op");
          v.className = op === "correcta" ? "veredicto bien" : "veredicto mal";
          v.textContent = razones[op];
          if (op === "correcta" && alAcertar) { alAcertar(); }
        });
      });
    }
    conectar("opciones-analisis", "veredicto-analisis", EJERCICIO.RAZONES, function () { resuelta = true; Motor.repintar(); });
    conectar("opciones-fijo", "veredicto-fijo", EJERCICIO.RAZONES_FIJO);

    function cambiar() {
      document.getElementById("ver-n").textContent = p.n;
      document.getElementById("ver-m").textContent = p.m;
      Motor.limpiarVeredicto();
      Motor.reiniciar({ n: p.n, m: p.m });
    }
    document.getElementById("rango-n").addEventListener("input", function (ev) { p.n = parseInt(ev.target.value, 10); cambiar(); });
    document.getElementById("rango-m").addEventListener("input", function (ev) { p.m = parseInt(ev.target.value, 10); cambiar(); });
  })();
}
