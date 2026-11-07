/* Ejercicio interactivo: cuántas veces cambia de arreglo una list que crece
   con append. La capacidad sale de list_resize de CPython 3.14 (py.js), y el
   programa, con capacidad() medida con sys.getsizeof, se corrió con python3
   para varios m: el número de cambios coincide. */
var EJERCICIO = (function () {
  var P = typeof module !== "undefined" ? require("./py.js") : Py;

  var CODIGO = [
    { txt: "def capacidad(l):", num: null },
    { txt: "    return (sys.getsizeof(l) - sys.getsizeof([])) // 8", num: null },
    { txt: "", num: null },
    { txt: "l = []", num: 1 },
    { txt: "cambios = 0", num: 2 },
    { txt: "anterior = 0", num: 3 },
    { txt: "i = 0", num: 4 },
    { txt: "while i < m:", num: 5 },
    { txt: "    l.append(i)", num: 6, bloque: 1 },
    { txt: "    cap = capacidad(l)", num: 7, bloque: 1 },
    { txt: "    if cap != anterior:", num: 8, bloque: 1 },
    { txt: "        cambios = cambios + 1", num: 9, bloque: 2 },
    { txt: "        anterior = cap", num: 10, bloque: 2 },
    { txt: "    i = i + 1", num: 11, bloque: 1 },
    { txt: "print(cap, cambios)", num: 12 }
  ];

  function simular(params) {
    var m = params.m;
    var pasos = [];
    var len = 0, capa = 0, cap = null, cambios = null, anterior = null, i = null;
    function snap(linea) {
      pasos.push({ linea: linea, i: i, len: len, cap: cap, cambios: cambios, capa: capa });
    }
    len = 0; capa = 0; snap(1);
    cambios = 0; snap(2);
    anterior = 0; snap(3);
    i = 0; snap(4);
    var sigue = true;
    while (sigue) {
      snap(5);
      if (i < m) {
        capa = P.nuevaCapacidad(capa, len);
        len = len + 1;
        snap(6);
        cap = capa; snap(7);
        snap(8);
        if (cap !== anterior) {
          cambios = cambios + 1; snap(9);
          anterior = cap; snap(10);
        }
        i = i + 1; snap(11);
      } else {
        sigue = false;
      }
    }
    snap(12);
    return pasos;
  }

  function cambios(m) {
    return P.crecer(m).filter(function (r) { return r.cambia; }).length;
  }

  function evaluar(valor, m) {
    var c = cambios(m);
    var res;
    if (valor === c) {
      res = { ok: true, msg: "Correcto: " + c + " cambios en " + m + " append. Las capacidades van 4, 8, 16, 24, 32, 40, 52, 64, 76…: cada una es la anterior más un octavo, redondeada a múltiplo de 4." };
    } else if (valor === m) {
      res = { ok: false, msg: "La línea 9 no corre en cada vuelta: solo cuando la capacidad cambió, y casi todos los append caben." };
    } else if (valor === c - 1) {
      res = { ok: false, msg: "Falta uno: el primer append también cambia la capacidad, de 0 a 4." };
    } else {
      res = { ok: false, msg: "Escriba la sucesión 0, 4, 8, 16, 24, 32, 40, 52, 64, 76, 92, 108, 128… y cuente cuántas capacidades hacen falta para llegar a " + m + " o más." };
    }
    return res;
  }

  var RAZONES = {
    log: "Correcto. Cada capacidad es más o menos 9/8 de la anterior, así que los cambios crecen como el logaritmo de m: Θ(log m). Y las referencias copiadas suman O(m), que es por qué append cuesta O(1) amortizado.",
    lineal: "Si cambiara en cada append serían m. Pruebe m = 200: la línea 9 corre muchas menos veces.",
    cuarto: "Eso pasaría si la capacidad creciera siempre de 4 en 4. Crece en proporción a su tamaño, así que los saltos son cada vez más largos.",
    constante: "Pruebe m = 40 y m = 200: los cambios aumentan, aunque despacio."
  };

  return { codigo: CODIGO, simular: simular, cambios: cambios, evaluar: evaluar, RAZONES: RAZONES };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    function alPintar(e) {
      var caja = document.getElementById("dibujo-lista");
      var a = e.actual;
      if (a === null || a.len === undefined) {
        caja.innerHTML = Py.dibujoLista([], 0, {}, "l");
      } else if (a.capa <= 40) {
        var vals = [];
        var k = 0;
        while (k < a.len) { vals.push(k); k = k + 1; }
        var marcas = {};
        if (a.len > 0 && a.linea === 6) { marcas[a.len - 1] = "nueva"; }
        caja.innerHTML = Py.dibujoLista(vals, a.capa, marcas, "l");
      } else {
        caja.innerHTML = "<p class=\"nota\">len = " + a.len + ", capacidad = " + a.capa + ": el dibujo se muestra hasta 40 casillas.</p>";
      }
    }

    Motor.iniciar({
      codigo: EJERCICIO.codigo,
      simular: EJERCICIO.simular,
      chips: [
        { campo: "i", rotulo: "i" },
        { campo: "cap", rotulo: "cap" },
        { campo: "cambios", rotulo: "cambios", clase: "cuenta" }
      ],
      paramsIniciales: { m: 10 },
      alPintar: alPintar
    });

    Motor.prediccionNumerica(function (valor, params) { return EJERCICIO.evaluar(valor, params.m); });

    Array.prototype.forEach.call(document.querySelectorAll("#opciones-analisis button"), function (b) {
      b.addEventListener("click", function () {
        var v = document.getElementById("veredicto-analisis");
        var op = b.getAttribute("data-op");
        v.className = op === "log" ? "veredicto bien" : "veredicto mal";
        v.textContent = EJERCICIO.RAZONES[op];
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
