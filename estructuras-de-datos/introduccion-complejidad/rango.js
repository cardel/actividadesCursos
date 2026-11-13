/* Ejercicio interactivo: rango. Dos if dentro del ciclo: cuántas
   asignaciones se hacen depende de cómo vienen los datos, no de cuántos son.
   La simulación da los mismos conteos que el programa instrumentado. */
var EJERCICIO = (function () {
  var CODIGO = [
    { txt: "int rango(int datos[], int n) {",   num: null },
    { txt: "    int mayor = datos[0];",         num: 1 },
    { txt: "    int menor = datos[0];",         num: 2 },
    { txt: "    int i = 1;",                    num: 3 },
    { txt: "    while (i < n) {",               num: 4 },
    { txt: "        if (datos[i] > mayor) {",   num: 5 },
    { txt: "            mayor = datos[i];",     num: 6 },
    { txt: "        }",                         num: null },
    { txt: "        if (datos[i] < menor) {",   num: 7 },
    { txt: "            menor = datos[i];",     num: 8 },
    { txt: "        }",                         num: null },
    { txt: "        i = i + 1;",                num: 9 },
    { txt: "    }",                             num: null },
    { txt: "    return mayor - menor;",         num: 10 },
    { txt: "}",                                 num: null }
  ];

  var ENTRADAS = {
    mezclado: [9, 4, 12, 4, 15, 1],
    iguales: [5, 5, 5, 5, 5, 5],
    creciente: [1, 3, 6, 8, 11, 20],
    decreciente: [20, 11, 8, 6, 3, 1]
  };

  function simular(params) {
    var d = params.datos;
    var n = d.length;
    var pasos = [];
    var mayor = null, menor = null, i = null;
    function snap(linea) {
      pasos.push({ linea: linea, i: i, actual: i !== null && i < n ? d[i] : null, mayor: mayor, menor: menor });
    }
    mayor = d[0]; snap(1);
    menor = d[0]; snap(2);
    i = 1; snap(3);
    var sigue = true;
    while (sigue) {
      snap(4);
      if (i < n) {
        snap(5);
        if (d[i] > mayor) { mayor = d[i]; snap(6); }
        snap(7);
        if (d[i] < menor) { menor = d[i]; snap(8); }
        i = i + 1; snap(9);
      } else {
        sigue = false;
      }
    }
    snap(10);
    return pasos;
  }

  function conteos(d) {
    var res = {};
    simular({ datos: d }).forEach(function (p) { res[p.linea] = (res[p.linea] || 0) + 1; });
    return res;
  }

  /* k: asignaciones de las líneas 6 y 8. */
  function k(d) {
    var c = conteos(d);
    return (c[6] || 0) + (c[8] || 0);
  }

  function T(d) { return 4 * d.length + 1 + k(d); }

  /* Una opción cuyo valor repite el de otra ya puesta se descarta. */
  function sinRepetidos(lista, tope) {
    var vistos = {};
    var sal = [];
    lista.forEach(function (o) {
      if (!vistos[o.valor] && o.valor >= 0 && sal.length < tope) { vistos[o.valor] = true; sal.push(o); }
    });
    return sal;
  }

  /* Opciones de la predicción: asignaciones de las líneas 6 y 8. */
  function opciones(params) {
    var d = params.datos;
    var n = d.length;
    var c = conteos(d);
    var kk = k(d);
    return sinRepetidos([
      { valor: kk, clave: "correcta", razon: "Correcto: " + kk + " asignaciones, " + (c[6] || 0) + " en la línea 6 y " + (c[8] || 0) + " en la 8. Con " + n + " datos, el total es T = 4n + 1 + k = " + T(d) + "." },
      { valor: n - 1, clave: "todasLasVueltas", razon: "Eso sería entrar en algún if en todas las vueltas. Revise cada dato: entra en la línea 6 solo si supera al mayor visto, y en la 8 solo si queda por debajo del menor." },
      { valor: 2 * (n - 1), clave: "ambosIf", razon: "Los dos if no pueden ser ciertos en la misma vuelta: un dato no puede ser mayor que el mayor y menor que el menor a la vez." },
      { valor: kk + 2, clave: "inicializaciones", razon: "Las líneas 1 y 2 también asignan, pero la pregunta es solo por las de los if, las líneas 6 y 8: sin esas dos, la cuenta queda en " + kk + "." },
      { valor: c[6] || 0, clave: "soloMayor", razon: "Esa es solo la línea 6. Falta sumar las veces que un dato queda por debajo del menor visto, en la línea 8." },
      { valor: c[8] || 0, clave: "soloMenor", razon: "Esa es solo la línea 8. Falta sumar las veces que un dato supera al mayor visto, en la línea 6." }
    ], 4);
  }

  var RAZONES = {
    correcta: "Correcto. Sin asignaciones, T = 1 + 1 + 1 + n + (n − 1) + (n − 1) + (n − 1) + 1 = 4n + 1. Como en cada vuelta entra a lo sumo uno de los dos if, k llega a n − 1 y el peor caso es 5n. Los dos son lineales.",
    nk: "k no llega a 2(n − 1): en una misma vuelta el dato no puede superar al mayor y quedar debajo del menor, porque menor ≤ mayor. Pruebe la entrada creciente: k = 5 con n = 6, no 10.",
    cuad: "No hay ciclos anidados. El ciclo hace n − 1 vueltas, y en cada una se ejecutan a lo sumo cuatro instrucciones: el costo crece como una recta.",
    igual: "Las entradas iguales y la creciente tienen el mismo n y no dan el mismo total: 25 contra 30. El conteo depende de cómo vienen los datos."
  };

  var RAZONES_MEJOR = {
    correcta: "Correcto. Si todos son iguales, ningún dato supera a datos[0] ni queda por debajo: k = 0 y T = 4n + 1, que con n = 6 da 25. Es la única entrada sin asignaciones.",
    creciente: "En la creciente cada dato supera al mayor: entra en la línea 6 en todas las vueltas. Es uno de los peores casos.",
    mezclado: "En la mezclada hay cuatro asignaciones. El mejor caso es el que no hace ninguna.",
    decreciente: "En la decreciente cada dato queda por debajo del menor: entra en la línea 8 en todas las vueltas. Es el otro peor caso."
  };

  return { codigo: CODIGO, ENTRADAS: ENTRADAS, simular: simular, conteos: conteos, k: k, T: T,
    opciones: opciones, RAZONES: RAZONES, RAZONES_MEJOR: RAZONES_MEJOR };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var actual = "mezclado";

    function alPintar(e) {
      var d = e.params.datos;
      document.getElementById("ver-datos").textContent = "{" + d.join(", ") + "}";
      var asign = (e.conteos[6] || 0) + (e.conteos[8] || 0);
      var total = 0;
      Object.keys(e.conteos).forEach(function (l) { total = total + e.conteos[l]; });
      document.getElementById("total-t").innerHTML = e.terminado
        ? "Total simulado: <b>" + total + "</b> instrucciones, con k = " + asign + " asignaciones en las líneas 6 y 8."
        : "Termine la ejecución para ver el total.";
    }

    Motor.iniciar({
      codigo: EJERCICIO.codigo,
      simular: EJERCICIO.simular,
      chips: [
        { campo: "i", rotulo: "i" },
        { campo: "actual", rotulo: "datos[i]" },
        { campo: "mayor", rotulo: "mayor", clase: "cuenta" },
        { campo: "menor", rotulo: "menor", clase: "cuenta" }
      ],
      paramsIniciales: { datos: EJERCICIO.ENTRADAS.mezclado },
      alPintar: alPintar
    });

    Motor.opcionesNumericas("opciones-prediccion", "veredicto", EJERCICIO.opciones);

    Array.prototype.forEach.call(document.querySelectorAll(".presets button"), function (b) {
      b.addEventListener("click", function () {
        actual = b.getAttribute("data-entrada");
        Motor.limpiarVeredicto();
        Motor.reiniciar({ datos: EJERCICIO.ENTRADAS[actual] });
      });
    });

    function conectar(id, ver, razones) {
      Array.prototype.forEach.call(document.querySelectorAll("#" + id + " button"), function (b) {
        b.addEventListener("click", function () {
          var v = document.getElementById(ver);
          var op = b.getAttribute("data-op");
          v.className = op === "correcta" ? "veredicto bien" : "veredicto mal";
          v.textContent = razones[op];
        });
      });
    }
    conectar("opciones-mejor", "veredicto-mejor", EJERCICIO.RAZONES_MEJOR);
    conectar("opciones-analisis", "veredicto-analisis", EJERCICIO.RAZONES);
  })();
}
