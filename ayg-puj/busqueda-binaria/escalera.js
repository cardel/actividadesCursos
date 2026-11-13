/* Ejercicio interactivo: UVa 12032, la escalera y el factor de fuerza.
   El codigo que se simula es el de la sesion: alcanza() es la funcion de
   decision y minimaFuerza() la bisecta. */
var EJERCICIO = (function () {
  var CODIGO = [
    { txt: "def alcanza(saltos, k):",                num: null },
    { txt: "    fuerza = k",                          num: 1 },
    { txt: "    puede = True",                        num: 2 },
    { txt: "    for s in saltos:",                    num: 3 },
    { txt: "        if s > fuerza:",                  num: 4 },
    { txt: "            puede = False",               num: 5 },
    { txt: "        elif s == fuerza:",               num: 6 },
    { txt: "            fuerza = fuerza - 1",         num: 7 },
    { txt: "    return puede",                        num: 8 },
    { txt: "",                                        num: null },
    { txt: "def minimaFuerza(saltos):",               num: null },
    { txt: "    lo = max(saltos)",                    num: 9 },
    { txt: "    hi = lo + len(saltos)",               num: 10 },
    { txt: "    while lo < hi:",                      num: 11 },
    { txt: "        medio = (lo + hi) // 2",          num: 12 },
    { txt: "        if alcanza(saltos, medio):",      num: 13 },
    { txt: "            hi = medio",                  num: 14 },
    { txt: "        else:",                           num: null },
    { txt: "            lo = medio + 1",              num: 15 },
    { txt: "    return lo",                           num: 16 }
  ];

  var PRESETS = [
    { nombre: "la del enunciado", alturas: [1, 6, 7, 11, 13] },
    { nombre: "el segundo caso", alturas: [3, 9, 10, 14] },
    { nombre: "escalones iguales", alturas: [2, 4, 6, 8, 10, 12] },
    { nombre: "un salto enorme", alturas: [1, 2, 3, 40] }
  ];

  function saltosDe(alturas) {
    var s = [alturas[0]], i = 1;
    while (i < alturas.length) { s.push(alturas[i] - alturas[i - 1]); i = i + 1; }
    return s;
  }

  function maximo(a) {
    var m = a[0], i = 1;
    while (i < a.length) { if (a[i] > m) { m = a[i]; } i = i + 1; }
    return m;
  }

  /* Reproduce el codigo de arriba paso a paso. */
  function simular(params) {
    var saltos = saltosDe(PRESETS[params.p].alturas);
    var pasos = [], lo, hi, medio = null, fuerza = null, s = null, puede = null;

    function foto(linea, extra) {
      var q = { linea: linea, lo: lo, hi: hi,
                medio: medio === null ? "–" : medio,
                fuerza: fuerza === null ? "–" : fuerza,
                s: s === null ? "–" : s,
                saltos: saltos.slice() };
      var c;
      for (c in extra) { if (Object.prototype.hasOwnProperty.call(extra, c)) { q[c] = extra[c]; } }
      pasos.push(q);
    }

    function alcanza(k) {
      fuerza = k;
      puede = true;
      foto(1, {});
      foto(2, {});
      var i = 0;
      while (i < saltos.length) {
        s = saltos[i];
        foto(4, {});
        if (s > fuerza) {
          puede = false;
          foto(5, {});
        } else if (s === fuerza) {
          fuerza = fuerza - 1;
          foto(7, {});
        }
        i = i + 1;
      }
      s = null;
      foto(8, { veredicto: puede });
      return puede;
    }

    lo = maximo(saltos);
    hi = lo + saltos.length;
    foto(9, {});
    foto(10, {});
    while (lo < hi) {
      foto(11, {});
      medio = Math.floor((lo + hi) / 2);
      foto(12, {});
      if (alcanza(medio)) {
        hi = medio;
        foto(14, {});
      } else {
        lo = medio + 1;
        foto(15, {});
      }
    }
    medio = null;
    fuerza = null;
    foto(16, { terminado: true });
    return pasos;
  }

  function respuesta(p) {
    var pasos = simular({ p: p });
    return pasos[pasos.length - 1].lo;
  }

  return { codigo: CODIGO, PRESETS: PRESETS, saltosDe: saltosDe,
           simular: simular, respuesta: respuesta };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, params = { p: 0 };

    function el(id) { return document.getElementById(id); }

    function alPintar(e) {
      var a = e.actual || {}, saltos = a.saltos || E.saltosDe(E.PRESETS[params.p].alturas);
      var alturas = E.PRESETS[params.p].alturas, h = "", i = 0;
      h = "<table class='tabla-escalera'><tr><th>peldaño</th>";
      while (i < alturas.length) { h = h + "<td>" + alturas[i] + "</td>"; i = i + 1; }
      h = h + "</tr><tr><th>salto</th>";
      i = 0;
      while (i < saltos.length) {
        var clase = (a.s !== "–" && a.s === saltos[i]) ? " class='ahora'" : "";
        h = h + "<td" + clase + ">" + saltos[i] + "</td>";
        i = i + 1;
      }
      el("panel-escalera").innerHTML = h + "</tr></table>";
      el("ver-intervalo").textContent = "[" + a.lo + ", " + a.hi + "]";
      if (a.veredicto === true) {
        el("ver-veredicto").innerHTML = "<span class='bien'>con esa fuerza sí se llega</span>";
      } else if (a.veredicto === false) {
        el("ver-veredicto").innerHTML = "<span class='mal'>con esa fuerza no se llega</span>";
      }
      if (e.terminado) {
        el("ver-final").textContent = "La respuesta es " + a.lo + ".";
      } else {
        el("ver-final").textContent = "";
      }
    }

    Motor.iniciar({
      codigo: E.codigo,
      simular: E.simular,
      chips: [{ campo: "lo", rotulo: "lo", clase: "cuenta" },
              { campo: "hi", rotulo: "hi", clase: "cuenta" },
              { campo: "medio", rotulo: "medio", clase: "cuenta" },
              { campo: "fuerza", rotulo: "fuerza", clase: "cuenta" },
              { campo: "s", rotulo: "salto" }],
      paramsIniciales: params,
      alPintar: alPintar
    });

    Motor.opcionesNumericas("opciones-fuerza", "veredicto", function (params) {
      var r = E.respuesta(params.p);
      var saltos = E.saltosDe(E.PRESETS[params.p].alturas);
      var mx = Math.max.apply(null, saltos);
      var total = 0, i = 0;
      while (i < saltos.length) { total = total + saltos[i]; i = i + 1; }
      var lista = [{ valor: r, clave: "correcta",
        razon: "Son " + r + ". Fíjese en qué saltos gastan fuerza: solo los que la igualan." }];
      var candidatas = [
        { valor: mx, clave: "mayor",
          razon: "Ese es el salto más grande, " + mx + ", que es la cota de abajo. No alcanza, porque los saltos que igualan la fuerza la van gastando. La respuesta es " + r + "." },
        { valor: r - 1, clave: "unaMenos",
          razon: r - 1 < mx
            ? "Con menos de " + mx + " no se pasa el salto más grande. La respuesta es " + r + "."
            : "Con " + (r - 1) + " se queda corto: algún salto que iguala la fuerza la gasta y un salto posterior ya no cabe. La respuesta es " + r + "." },
        { valor: mx + saltos.length, clave: "cotaAlta",
          razon: "Ese es hi, la cota de arriba. Siempre alcanza, pero la bisecta lo va bajando hasta el menor que alcanza, que es " + r + "." },
        { valor: total, clave: "total",
          razon: "Esa es la altura total, la suma de todos los saltos. Con esa fuerza se llega, pero no es la mínima: la respuesta es " + r + "." }
      ];
      candidatas.forEach(function (c) {
        var repetida = false;
        lista.forEach(function (o) { if (o.valor === c.valor) { repetida = true; } });
        if (!repetida && c.valor > 0 && lista.length < 4) { lista.push(c); }
      });
      return lista;
    });

    el("presets").innerHTML = E.PRESETS.map(function (c, i) {
      return "<button data-i='" + i + "' class='preset" + (i === 0 ? " activo" : "") + "'>" + c.nombre + "</button>";
    }).join("");
    Array.prototype.forEach.call(el("presets").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        params.p = parseInt(b.getAttribute("data-i"), 10);
        Array.prototype.forEach.call(el("presets").querySelectorAll("button"), function (x) { x.classList.remove("activo"); });
        b.classList.add("activo");
        el("ver-veredicto").textContent = "";
        Motor.reiniciar(params);
      });
    });
  })();
}
