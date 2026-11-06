/* Ejercicio interactivo: UVa 10810, contar las parejas fuera de orden
   mientras se mezcla. El codigo que se simula es el de la sesion. */
var EJERCICIO = (function () {
  var CODIGO = [
    { txt: "def mezclar(a, aux, ini, medio, fin):",                      num: null },
    { txt: "    i = ini",                                                 num: 1 },
    { txt: "    j = medio",                                               num: 2 },
    { txt: "    k = ini",                                                 num: 3 },
    { txt: "    cruzadas = 0",                                            num: 4 },
    { txt: "    while k < fin:",                                          num: 5 },
    { txt: "        if i < medio and (j >= fin or a[i] <= a[j]):",        num: 6 },
    { txt: "            aux[k] = a[i]",                                   num: 7 },
    { txt: "            i = i + 1",                                       num: 8 },
    { txt: "        else:",                                               num: null },
    { txt: "            aux[k] = a[j]",                                   num: 9 },
    { txt: "            j = j + 1",                                       num: 10 },
    { txt: "            cruzadas = cruzadas + (medio - i)",               num: 11 },
    { txt: "        k = k + 1",                                           num: 12 },
    { txt: "    a[ini:fin] = aux[ini:fin]",                               num: 13 },
    { txt: "    return cruzadas",                                         num: 14 },
    { txt: "",                                                            num: null },
    { txt: "def contar(a, aux, ini, fin):",                               num: null },
    { txt: "    total = 0",                                               num: 15 },
    { txt: "    if fin - ini > 1:",                                       num: 16 },
    { txt: "        medio = (ini + fin) // 2",                            num: 17 },
    { txt: "        total = contar(a, aux, ini, medio)",                  num: 18 },
    { txt: "        total = total + contar(a, aux, medio, fin)",          num: 19 },
    { txt: "        total = total + mezclar(a, aux, ini, medio, fin)",    num: 20 },
    { txt: "    return total",                                            num: 21 }
  ];

  var PRESETS = [
    { nombre: "la del enunciado", a: [9, 1, 0, 5, 4] },
    { nombre: "ya ordenada", a: [1, 2, 3, 4, 5, 6] },
    { nombre: "al revés", a: [6, 5, 4, 3, 2, 1] },
    { nombre: "ocho valores", a: [3, 8, 1, 7, 2, 6, 4, 5] }
  ];

  function simular(params) {
    var a = PRESETS[params.p].a.slice(), aux = a.slice(), pasos = [];
    var tramo = "", cruzadas = null, i = null, j = null, k = null, total = null;

    function foto(linea, extra) {
      var q = { linea: linea, a: a.slice(), tramo: tramo,
                i: i === null ? "–" : i, j: j === null ? "–" : j,
                k: k === null ? "–" : k,
                cruzadas: cruzadas === null ? "–" : cruzadas,
                total: total === null ? "–" : total };
      var c;
      for (c in extra) { if (Object.prototype.hasOwnProperty.call(extra, c)) { q[c] = extra[c]; } }
      pasos.push(q);
    }

    function mezclar(ini, medio, fin) {
      tramo = "[" + ini + ", " + fin + ")";
      i = ini; foto(1, {});
      j = medio; foto(2, {});
      k = ini; foto(3, {});
      cruzadas = 0; foto(4, {});
      while (k < fin) {
        foto(5, {});
        if (i < medio && (j >= fin || a[i] <= a[j])) {
          aux[k] = a[i]; foto(7, {});
          i = i + 1; foto(8, {});
        } else {
          aux[k] = a[j]; foto(9, {});
          j = j + 1; foto(10, {});
          cruzadas = cruzadas + (medio - i); foto(11, { aporte: medio - i });
        }
        k = k + 1; foto(12, {});
      }
      var p = ini;
      while (p < fin) { a[p] = aux[p]; p = p + 1; }
      foto(13, {});
      var r = cruzadas;
      foto(14, {});
      i = null; j = null; k = null; cruzadas = null;
      return r;
    }

    function contar(ini, fin) {
      tramo = "[" + ini + ", " + fin + ")";
      var t = 0;
      foto(15, {});
      foto(16, {});
      if (fin - ini > 1) {
        var medio = Math.floor((ini + fin) / 2);
        foto(17, {});
        t = contar(ini, medio);
        tramo = "[" + ini + ", " + fin + ")";
        foto(18, {});
        t = t + contar(medio, fin);
        tramo = "[" + ini + ", " + fin + ")";
        foto(19, {});
        t = t + mezclar(ini, medio, fin);
        tramo = "[" + ini + ", " + fin + ")";
        total = t;
        foto(20, {});
      }
      total = t;
      foto(21, {});
      return t;
    }

    contar(0, a.length);
    return pasos;
  }

  function respuesta(p) {
    var a = PRESETS[p].a, n = 0, x = 0;
    while (x < a.length) {
      var y = x + 1;
      while (y < a.length) { if (a[x] > a[y]) { n = n + 1; } y = y + 1; }
      x = x + 1;
    }
    return n;
  }

  return { codigo: CODIGO, PRESETS: PRESETS, simular: simular, respuesta: respuesta };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, params = { p: 0 };
    function el(id) { return document.getElementById(id); }

    function alPintar(e) {
      var a = e.actual || {}, arr = a.a || E.PRESETS[params.p].a;
      var h = "<table class='tabla-arreglo'><tr><th>posición</th>", x = 0;
      while (x < arr.length) { h = h + "<td>" + x + "</td>"; x = x + 1; }
      h = h + "</tr><tr><th>valor</th>";
      x = 0;
      while (x < arr.length) {
        var clase = "";
        if (a.i !== "–" && x === a.i) { clase = " class='izq'"; }
        if (a.j !== "–" && x === a.j) { clase = " class='der'"; }
        h = h + "<td" + clase + ">" + arr[x] + "</td>";
        x = x + 1;
      }
      el("panel-arreglo").innerHTML = h + "</tr></table>";
      el("ver-tramo").textContent = a.tramo || "";
      el("ver-aporte").textContent = a.aporte === undefined ? "" :
        "sale el de la derecha y faltan " + a.aporte + " a la izquierda";
      if (e.terminado) {
        el("ver-final").textContent = "Parejas fuera de orden: " + E.respuesta(params.p) + ".";
      } else {
        el("ver-final").textContent = "";
      }
    }

    Motor.iniciar({
      codigo: E.codigo,
      simular: E.simular,
      chips: [{ campo: "i", rotulo: "i" }, { campo: "j", rotulo: "j" },
              { campo: "k", rotulo: "k" },
              { campo: "cruzadas", rotulo: "cruzadas", clase: "cuenta" },
              { campo: "total", rotulo: "total", clase: "cuenta" }],
      paramsIniciales: params,
      alPintar: alPintar
    });

    Motor.prediccionNumerica(function (valor) {
      var r = E.respuesta(params.p), a = E.PRESETS[params.p].a;
      var n = a.length, maximo = n * (n - 1) / 2;
      if (valor === r) {
        return { ok: true, msg: "Son " + r + ". Cada intercambio de vecinos arregla exactamente una, así que ese es también el número de intercambios." };
      }
      if (valor === maximo) {
        return { ok: false, msg: "Ese es el máximo posible, con el arreglo al revés del todo. Aquí son " + r + "." };
      }
      if (valor === 0) {
        return { ok: false, msg: "Cero sería un arreglo ya ordenado. Busque una pareja con el mayor a la izquierda: hay " + r + "." };
      }
      return { ok: false, msg: "Son " + r + ". Cuéntelas a mano en este arreglo chico y después siga la mezcla para ver dónde las suma el código." };
    });

    el("presets").innerHTML = E.PRESETS.map(function (x, i) {
      return "<button data-i='" + i + "' class='preset" + (i === 0 ? " activo" : "") + "'>" + x.nombre + "</button>";
    }).join("");
    Array.prototype.forEach.call(el("presets").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        params.p = parseInt(b.getAttribute("data-i"), 10);
        Array.prototype.forEach.call(el("presets").querySelectorAll("button"), function (x) { x.classList.remove("activo"); });
        b.classList.add("activo");
        Motor.reiniciar(params);
      });
    });
  })();
}
