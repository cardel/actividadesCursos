/* Ejercicio interactivo: el pelado de capas de hojas, linea por linea.
   El codigo que se simula es centro.py de la sesion, con las tres
   funciones puestas seguidas y numeradas para la pantalla. */
var ARB = (typeof module !== "undefined") ? require("../comun/arbol.js") : ARB;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var CODIGO = [
    { num: 1,  txt: "def capaDeHojas(arbol, grado):" },
    { num: 2,  txt: "    capa = []" },
    { num: 3,  txt: "    for v in arbol:" },
    { num: 4,  txt: "        if grado[v] <= 1:" },
    { num: 5,  txt: "            capa.append(v)" },
    { num: 6,  txt: "    return capa" },
    { num: null, txt: "" },
    { num: 7,  txt: "def pelarCapa(arbol, grado, capa):" },
    { num: 8,  txt: "    siguiente = []" },
    { num: 9,  txt: "    for v in capa:" },
    { num: 10, txt: "        for u in arbol[v]:" },
    { num: 11, txt: "            if grado[u] > 0:" },
    { num: 12, txt: "                grado[u] = grado[u] - 1" },
    { num: 13, txt: "                if grado[u] == 1:" },
    { num: 14, txt: "                    siguiente.append(u)" },
    { num: 15, txt: "        grado[v] = 0" },
    { num: 16, txt: "    return siguiente" },
    { num: null, txt: "" },
    { num: 17, txt: "def centroArbol(arbol):" },
    { num: 18, txt: "    grado = {}" },
    { num: 19, txt: "    for v in arbol:" },
    { num: 20, txt: "        grado[v] = len(arbol[v])" },
    { num: 21, txt: "    capa = capaDeHojas(arbol, grado)" },
    { num: 22, txt: "    vivos = len(arbol)" },
    { num: 23, txt: "    vueltas = 0" },
    { num: 24, txt: "    while vivos > 2:" },
    { num: 25, txt: "        vivos = vivos - len(capa)" },
    { num: 26, txt: "        capa = pelarCapa(arbol, grado, capa)" },
    { num: 27, txt: "        vueltas = vueltas + 1" },
    { num: 28, txt: "    return capa, vueltas" }
  ];

  var CASOS = [
    { nombre: "doce vértices", n: 12,
      aristas: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [5, 6], [5, 7],
                [4, 8], [8, 9], [6, 10], [10, 11]],
      pos: [[255, 120], [155, 60], [355, 60], [60, 20], [95, 150], [455, 120],
            [420, 215], [530, 60], [60, 235], [160, 235], [300, 235], [255, 20]] },
    { nombre: "ocho vértices", n: 8,
      aristas: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [3, 6], [6, 7]],
      pos: [[50, 60], [160, 115], [60, 200], [290, 115], [400, 55], [510, 20],
            [400, 190], [510, 230]] }
  ];

  /* Reproduce centro.py paso a paso. Cada paso trae la linea que se ejecuta
     y el estado que el panel necesita para pintarse. */
  function simular(caso) {
    var G = ARB.adyacencia(caso.n, caso.aristas);
    var grado = G.map(function (l) { return l.length; });
    var pasos = [], capa = [], siguiente = [], vivos, vueltas, muertos = [];

    function foto(linea, extra) {
      var p = { linea: linea, capa: capa.slice(), siguiente: siguiente.slice(),
                grado: grado.slice(), muertos: muertos.slice() };
      var k;
      for (k in extra) { if (Object.prototype.hasOwnProperty.call(extra, k)) { p[k] = extra[k]; } }
      pasos.push(p);
    }

    foto(18, { v: "", u: "", gu: "", vivos: "", vueltas: "" });
    var v = 0;
    while (v < caso.n) { foto(20, { v: v, u: "", gu: grado[v], vivos: "", vueltas: "" }); v = v + 1; }

    v = 0;
    while (v < caso.n) {
      foto(4, { v: v, u: "", gu: grado[v], vivos: "", vueltas: "" });
      if (grado[v] <= 1) { capa.push(v); foto(5, { v: v, u: "", gu: grado[v], vivos: "", vueltas: "" }); }
      v = v + 1;
    }
    vivos = caso.n;
    vueltas = 0;
    foto(22, { v: "", u: "", gu: "", vivos: vivos, vueltas: vueltas });

    while (vivos > 2) {
      foto(24, { v: "", u: "", gu: "", vivos: vivos, vueltas: vueltas });
      vivos = vivos - capa.length;
      foto(25, { v: "", u: "", gu: "", vivos: vivos, vueltas: vueltas });
      siguiente = [];
      var i = 0;
      while (i < capa.length) {
        var w = capa[i];
        foto(9, { v: w, u: "", gu: "", vivos: vivos, vueltas: vueltas });
        var j = 0;
        while (j < G[w].length) {
          var u = G[w][j];
          foto(11, { v: w, u: u, gu: grado[u], vivos: vivos, vueltas: vueltas });
          if (grado[u] > 0) {
            grado[u] = grado[u] - 1;
            foto(12, { v: w, u: u, gu: grado[u], vivos: vivos, vueltas: vueltas });
            if (grado[u] === 1) {
              siguiente.push(u);
              foto(14, { v: w, u: u, gu: grado[u], vivos: vivos, vueltas: vueltas });
            }
          }
          j = j + 1;
        }
        grado[w] = 0;
        muertos.push(w);
        foto(15, { v: w, u: "", gu: 0, vivos: vivos, vueltas: vueltas });
        i = i + 1;
      }
      capa = siguiente.slice().sort(function (a, b) { return a - b; });
      siguiente = [];
      vueltas = vueltas + 1;
      foto(27, { v: "", u: "", gu: "", vivos: vivos, vueltas: vueltas });
    }
    foto(28, { v: "", u: "", gu: "", vivos: vivos, vueltas: vueltas });
    return pasos;
  }

  function medidas(caso) {
    var G = ARB.adyacencia(caso.n, caso.aristas);
    var real = ARB.radioDiametroCentro(G), p = ARB.pelarCapas(G);
    return { centro: p.centro, vueltas: p.vueltas, radio: real.radio,
             diametro: real.diametro, capas: p.capas };
  }

  return { CODIGO: CODIGO, CASOS: CASOS, simular: simular, medidas: medidas };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, p = { c: 0 };

    function el(id) { return document.getElementById(id); }

    function alPintar(e) {
      var caso = E.CASOS[p.c], a = e.actual || {}, m = E.medidas(caso);
      var capa = a.capa || [], muertos = a.muertos || [];
      /* Antes del primer paso todavia no hay foto: se muestran los grados
         del arbol tal como llega. */
      var grado = a.grado || ARB.adyacencia(caso.n, caso.aristas).map(function (l) { return l.length; });
      el("panel-grafo").innerHTML = GRAFOSVG.dibujar({
        n: caso.n, pos: caso.pos, dirigido: false,
        aristas: caso.aristas.map(function (x) { return [x[0], x[1], ""]; }),
        arista: function (i) {
          var x = caso.aristas[i];
          var vivo = muertos.indexOf(x[0]) < 0 && muertos.indexOf(x[1]) < 0;
          return { color: vivo ? "#6b7280" : "claro", grueso: vivo ? 2 : 1.5, trazo: vivo ? null : "4 3" };
        },
        nodo: function (u) {
          var muerto = muertos.indexOf(u) >= 0, enCapa = capa.indexOf(u) >= 0;
          var fin = e.terminado && m.centro.indexOf(u) >= 0;
          var relleno = "#ffffff", borde = "#6b7280", tinta = "#17202a";
          if (muerto) { relleno = "#f1f2f4"; borde = "#b9c0cb"; tinta = "#9aa1ab"; }
          if (enCapa && !muerto) { relleno = "#fdf1dc"; borde = "#e8a13d"; }
          if (fin) { relleno = "#e7f2e8"; borde = "#2e7d32"; }
          if (u === a.u && a.u !== "") { borde = "#1f5fa8"; }
          return { relleno: relleno, borde: borde, grueso: (fin || u === a.u) ? 3 : 2,
                   tinta: tinta, nota: muerto ? "" : String(grado[u]) };
        }
      });
      el("ver-capa").textContent = capa.length ? capa.join(", ") : "vacía";
      el("ver-siguiente").textContent = (a.siguiente && a.siguiente.length) ? a.siguiente.join(", ") : "vacía";
      if (e.terminado) {
        el("ver-final").innerHTML = "Centro <b>" + m.centro.join(" y ") + "</b>, en <b>" + m.vueltas +
          "</b> vueltas. Con " + m.centro.length + (m.centro.length === 1 ? " centro" : " centros") +
          ", el radio es " + m.radio + " y el diámetro " + m.diametro + ".";
      } else {
        el("ver-final").textContent = "";
      }
    }

    Motor.iniciar({
      codigo: E.CODIGO,
      simular: function (q) { return E.simular(E.CASOS[q.c]); },
      chips: [{ campo: "v", rotulo: "v" }, { campo: "u", rotulo: "u" },
              { campo: "gu", rotulo: "grado[u]", clase: "cuenta" },
              { campo: "vivos", rotulo: "vivos", clase: "cuenta" },
              { campo: "vueltas", rotulo: "vueltas", clase: "cuenta" }],
      paramsIniciales: p, alPintar: alPintar
    });

    Motor.prediccionNumerica(function (valor) {
      var m = E.medidas(E.CASOS[p.c]);
      if (valor === m.vueltas) {
        return { ok: true, txt: "Son " + m.vueltas + ". Quedan " + m.centro.length +
          (m.centro.length === 1 ? " centro, así que el radio también es " : " centros, así que el radio es uno más: ") + m.radio + "." };
      }
      if (valor === m.radio) {
        return { ok: false, txt: "Ese es el radio. Las vueltas son " + m.vueltas +
          ", que es el piso de " + m.diametro + " sobre dos." };
      }
      if (valor === m.capas.length) {
        return { ok: false, txt: "Esa es la cantidad de capas que se listan, contando la que queda al final. Vueltas del ciclo hay " + m.vueltas + "." };
      }
      return { ok: false, txt: "Son " + m.vueltas + ". Cada vuelta quita una capa entera y el ciclo para apenas quedan dos vértices o menos." };
    });

    el("presets").innerHTML = E.CASOS.map(function (c, i) {
      return "<button data-i='" + i + "' class='preset" + (i === 0 ? " activo" : "") + "'>" + c.nombre + "</button>";
    }).join("");
    Array.prototype.forEach.call(el("presets").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        p.c = parseInt(b.getAttribute("data-i"), 10);
        Array.prototype.forEach.call(el("presets").querySelectorAll("button"), function (x) { x.classList.remove("activo"); });
        b.classList.add("activo");
        Motor.reiniciar(p);
      });
    });
  })();
}
