/* Ejercicio interactivo: UVa 11695, quitar un vuelo y poner otro para que el
   mayor numero de trasbordos quede lo mas pequeno posible. La estrategia es
   la de la sesion: al partir el arbol, los dos pedazos se vuelven a unir por
   sus centros. */
var ARB = (typeof module !== "undefined") ? require("../comun/arbol.js") : ARB;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var CASOS = [
    { nombre: "el del enunciado", n: 4,
      aristas: [[0, 1], [1, 2], [2, 3]],
      pos: [[90, 125], [230, 125], [370, 125], [500, 125]] },
    { nombre: "nueve en fila", n: 9,
      aristas: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]],
      pos: [[40, 70], [170, 40], [300, 70], [430, 40], [520, 130],
            [430, 215], [300, 185], [170, 215], [40, 185]] },
    { nombre: "doce ciudades", n: 12,
      aristas: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
                [2, 7], [7, 8], [4, 9], [9, 10], [10, 11]],
      pos: [[40, 125], [140, 125], [240, 125], [340, 125], [440, 125], [530, 70],
            [530, 180], [240, 30], [160, 30], [440, 225], [350, 225], [260, 225]] }
  ];

  function medidas(n, aristas) {
    return ARB.radioDiametroCentro(ARB.adyacencia(n, aristas));
  }

  /* Al quitar la arista i quedan dos pedazos; de cada uno interesan su
     diámetro y un centro, que es por donde conviene volver a unirlos. */
  function pedazos(caso, i) {
    var resto = caso.aristas.filter(function (_, j) { return j !== i; });
    var G = ARB.adyacencia(caso.n, resto);
    var comp = ARB.componentes(G).comp, grupos = {};
    comp.forEach(function (c, v) {
      if (grupos[c] === undefined) { grupos[c] = []; }
      grupos[c].push(v);
    });
    return Object.keys(grupos).map(function (k) {
      var vs = grupos[k], indice = {};
      vs.forEach(function (v, t) { indice[v] = t; });
      var ar = resto.filter(function (e) {
        return indice[e[0]] !== undefined && indice[e[1]] !== undefined;
      }).map(function (e) { return [indice[e[0]], indice[e[1]]]; });
      var m = medidas(vs.length, ar);
      return { vs: vs, diam: m.diametro,
               centro: m.centro.map(function (t) { return vs[t]; }) };
    });
  }

  function alQuitar(caso, i) {
    var p = pedazos(caso, i), d1 = p[0].diam, d2 = p[1].diam;
    var nuevo = Math.max(d1, d2, Math.ceil(d1 / 2) + Math.ceil(d2 / 2) + 1);
    return { p1: p[0], p2: p[1], d1: d1, d2: d2, nuevo: nuevo,
             une: [p[0].centro[0], p[1].centro[0]] };
  }

  function todas(caso) {
    return caso.aristas.map(function (_, i) { return alQuitar(caso, i); });
  }

  function mejor(caso) {
    var t = todas(caso), m = t[0].nuevo, i = 1;
    while (i < t.length) { if (t[i].nuevo < m) { m = t[i].nuevo; } i = i + 1; }
    return m;
  }

  /* Opciones para el menor diametro posible: la correcta y los valores de
     quien se equivoca de una manera concreta. */
  function opcionesMejor(caso) {
    var m = mejor(caso), t = todas(caso);
    var original = medidas(caso.n, caso.aristas).diametro;
    var peor = 0, ip = 0, i = 0;
    while (i < t.length) { if (t[i].nuevo > peor) { peor = t[i].nuevo; ip = i; } i = i + 1; }
    var lista = [
      { valor: m, clave: "correcta",
        razon: "Sí: el mejor es " + m + ", contra " + original + " del árbol original." },
      { valor: original, clave: "original",
        razon: "Ese es el diámetro de ahora, " + original + ". Cambiando un vuelo se baja a " + m + "." },
      { valor: peor, clave: "peor",
        razon: "Ese es lo que queda al quitar el vuelo " + caso.aristas[ip][0] + "–" + caso.aristas[ip][1] +
          ", un mal corte. Quitando otro, pegado a la mitad del camino más largo, se llega a " + m + "." },
      { valor: Math.ceil(original / 2), clave: "mitad",
        razon: "Esa es la mitad del diámetro, pero al volver a unir se suman los radios de los dos pedazos y el vuelo nuevo. Lo mejor es " + m + "." },
      { valor: m - 1, clave: "sinvuelo",
        razon: "Olvidó contar el vuelo nuevo entre los dos centros. Con una sola arista cambiada, lo mejor es " + m + "." }
    ];
    var vistos = [], r = [], k = 0;
    while (k < lista.length) {
      if (lista[k].valor >= 0 && vistos.indexOf(lista[k].valor) < 0) {
        vistos.push(lista[k].valor);
        r.push(lista[k]);
      }
      k = k + 1;
    }
    return r.slice(0, 4);
  }

  return { CASOS: CASOS, medidas: medidas, pedazos: pedazos, alQuitar: alQuitar,
           todas: todas, mejor: mejor, opcionesMejor: opcionesMejor };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, actual = 0, quitada = -1, resueltos = [], opciones = null;
    function el(id) { return document.getElementById(id); }

    function pintar() {
      var caso = E.CASOS[actual];
      var r = quitada >= 0 ? E.alQuitar(caso, quitada) : null;
      el("panel").innerHTML = GRAFOSVG.dibujar({
        n: caso.n, pos: caso.pos, dirigido: false,
        aristas: caso.aristas.map(function (e) { return [e[0], e[1], ""]; }),
        arista: function (i) {
          if (i === quitada) { return { color: "rojo", grueso: 2, trazo: "5 3" }; }
          return { color: "gris", grueso: 2 };
        },
        nodo: function (u) {
          var s = { relleno: "#ffffff", borde: "#6b7280", grueso: 2, tinta: "#17202a" };
          if (r !== null) {
            if (r.une.indexOf(u) >= 0) { s.relleno = "#e7f2e8"; s.borde = "#2e7d32"; s.grueso = 3; }
            else if (r.p2.vs.indexOf(u) >= 0) { s.relleno = "#eef2f8"; }
          }
          return s;
        }
      });
      if (r === null) {
        el("ver-corte").textContent = "Todavía no se ha quitado ninguna.";
      } else {
        el("ver-corte").innerHTML =
          "Quedan dos pedazos, de diámetros <b>" + r.d1 + "</b> y <b>" + r.d2 +
          "</b>. Uniendo sus centros, " + r.une[0] + " y " + r.une[1] +
          ", el diámetro nuevo es <b>" + r.nuevo + "</b> = máx(" + r.d1 + ", " + r.d2 +
          ", " + Math.ceil(r.d1 / 2) + " + " + Math.ceil(r.d2 / 2) + " + 1).";
      }
    }

    function botonesAristas() {
      var caso = E.CASOS[actual];
      el("aristas").innerHTML = caso.aristas.map(function (e, i) {
        return "<button class='preset" + (i === quitada ? " activo" : "") +
               "' data-i='" + i + "'>" + e[0] + "–" + e[1] + "</button>";
      }).join("");
      Array.prototype.forEach.call(el("aristas").querySelectorAll("button"), function (b) {
        b.addEventListener("click", function () {
          quitada = parseInt(b.getAttribute("data-i"), 10);
          botonesAristas();
          pintar();
        });
      });
    }

    function presets() {
      el("presets").innerHTML = E.CASOS.map(function (c, i) {
        return "<button class='preset" + (i === actual ? " activo" : "") +
               "' data-i='" + i + "'>" + c.nombre + "</button>";
      }).join("");
      Array.prototype.forEach.call(el("presets").querySelectorAll("button"), function (b) {
        b.addEventListener("click", function () {
          actual = parseInt(b.getAttribute("data-i"), 10);
          quitada = -1;
          presets(); botonesAristas(); pintar();
          opciones.refrescar();
          el("tabla").innerHTML = "";
          var m = E.medidas(E.CASOS[actual].n, E.CASOS[actual].aristas);
          el("ver-diametro").textContent = m.diametro;
        });
      });
    }

    presets(); botonesAristas(); pintar();
    el("ver-diametro").textContent = E.medidas(E.CASOS[0].n, E.CASOS[0].aristas).diametro;

    opciones = Motor.opcionesNumericas("opciones-mejor", "veredicto-mejor",
      function () { return E.opcionesMejor(E.CASOS[actual]); });
    el("opciones-mejor").addEventListener("click", function () {
      if (el("veredicto-mejor").className.indexOf("bien") >= 0) {
        if (resueltos.indexOf(actual) < 0) { resueltos.push(actual); }
        tabla();
      }
    });

    function tabla() {
      var caso = E.CASOS[actual], t = E.todas(caso), m = E.mejor(caso);
      var h = "<table class='tabla'><tr><th>se quita</th><th>d₁</th><th>d₂</th><th>se une</th><th>nuevo</th></tr>";
      t.forEach(function (r, i) {
        h = h + "<tr" + (r.nuevo === m ? " class='optima'" : "") + "><td>" +
            caso.aristas[i][0] + "–" + caso.aristas[i][1] + "</td><td>" + r.d1 +
            "</td><td>" + r.d2 + "</td><td>" + r.une[0] + "–" + r.une[1] +
            "</td><td>" + r.nuevo + "</td></tr>";
      });
      el("tabla").innerHTML = h + "</table>";
    }
  })();
}
