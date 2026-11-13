/* Ejercicio interactivo: el algoritmo de Kruskal, linea por linea.
   La simulacion vive en lib.js y reproduce kruskal.py con los conjuntos
   disjuntos de union_find.py, compresion de caminos incluida. */
var MST = (typeof module !== "undefined") ? require("./lib.js") : MST;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var GRAFOS = [
    { boton: "Seis vértices, ocho aristas",
      texto: "Seis vértices y ocho aristas. El vértice 5 cuelga de 3 y de 4.",
      n: 6, alto: 260,
      aristas: [[0, 1, 5], [0, 2, 1], [1, 2, 4], [1, 3, 9], [2, 3, 3], [2, 4, 7], [3, 5, 6], [4, 5, 8]],
      pos: [[60, 70], [200, 45], [170, 200], [340, 80], [330, 225], [480, 150]] },
    { boton: "Ocho vértices, trece aristas",
      texto: "Ocho vértices y trece aristas, con tres triángulos encadenados y el vértice 7 al final.",
      n: 8, alto: 275,
      aristas: [[0, 1, 2], [0, 2, 7], [1, 2, 3], [1, 3, 9], [2, 3, 5], [3, 4, 4], [2, 4, 8],
                [4, 5, 1], [3, 5, 11], [5, 6, 6], [4, 6, 12], [6, 7, 10], [5, 7, 13]],
      pos: [[50, 60], [165, 95], [60, 215], [280, 70], [270, 210], [400, 140], [420, 245], [520, 80]] }
  ];
  GRAFOS.forEach(function (g) {
    g.res = MST.resumenKruskal(g.n, g.aristas);
    g.sinMirar = g.aristas.length - g.res.miradas;
  });

  function clave(a) { return a[0] + "-" + a[1] + "-" + a[2]; }

  /* Que paso con la arista que ocupa el puesto j de la lista ordenada, visto
     desde un paso de la simulacion. */
  function estado(paso, g, j) {
    var orden = g.res.ordenadas;
    if (paso === null || paso.i === null) { return "por mirar"; }
    if (j === paso.i && paso.u !== null) { return "en turno"; }
    if (j >= paso.i) { return "por mirar"; }
    var dentro = false;
    (paso.mst || []).forEach(function (a) { if (clave(a) === clave(orden[j])) { dentro = true; } });
    return dentro ? "entra" : "descarta";
  }

  /* Evalua las dos predicciones: cuantas se descartan y en que puesto cierra. */
  function evaluar(descartadas, cierra, g) {
    var r = g.res, bien = [], mal = [];
    if (descartadas === r.descartadas) {
      bien.push("Se descartan " + r.descartadas + ".");
    } else {
      mal.push("Se descartan " + r.descartadas + ", no " + descartadas + ": " +
               r.mirada.filter(function (m) { return !m.entra; })
                 .map(function (m) { return "(" + m.arista.join(",") + ")"; }).join(" ") +
               ". Una arista se descarta cuando sus dos puntas ya están en el mismo pedazo.");
    }
    if (cierra === r.cierra) {
      bien.push("El árbol se completa en el puesto " + r.cierra + ".");
    } else {
      mal.push("El árbol se completa en el puesto " + r.cierra + ", con (" +
               r.mirada[r.cierra - 1].arista.join(",") + "): ahí ya hay " + (g.n - 1) +
               " aristas y el ciclo no vuelve a entrar. Las " + g.sinMirar + " últimas de la lista no se alcanzan a mirar.");
    }
    return { ok: mal.length === 0, msg: mal.length === 0 ? bien.join(" ") : mal.join(" ") };
  }

  return { GRAFOS: GRAFOS, estado: estado, evaluar: evaluar, clave: clave };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, idx = 0;
    function g() { return E.GRAFOS[idx]; }
    function el(id) { return document.getElementById(id); }

    function indiceArista(u, v) {
      var i = 0, r = -1;
      while (i < g().aristas.length) {
        var a = g().aristas[i];
        if ((a[0] === u && a[1] === v) || (a[0] === v && a[1] === u)) { r = i; }
        i = i + 1;
      }
      return r;
    }

    function dibujo(a) {
      var G = g(), enMst = {}, turno = -1;
      if (a !== null && a.mst !== null) {
        a.mst.forEach(function (x) { enMst[indiceArista(x[0], x[1])] = true; });
      }
      if (a !== null && a.u !== null) { turno = indiceArista(a.u, a.v); }
      el("panel-grafo").innerHTML = GRAFOSVG.dibujar({
        n: G.n, pos: G.pos, aristas: G.aristas, dirigido: false, alto: G.alto,
        arista: function (i) {
          if (enMst[i] === true) { return { color: "verde", grueso: 4 }; }
          if (i === turno) { return { color: "ambar", grueso: 4 }; }
          var puesto = -1, j = 0;
          while (j < G.res.ordenadas.length) {
            if (E.clave(G.res.ordenadas[j]) === E.clave(G.aristas[i])) { puesto = j; }
            j = j + 1;
          }
          if (E.estado(a, G, puesto) === "descarta") { return { color: "gris", grueso: 2, trazo: "5 4" }; }
          return { color: "claro", grueso: 2 };
        },
        nodo: function (u) {
          var pedazo = null;
          if (a !== null && a.p !== null && a.p[u] !== null) { pedazo = MST.pedazos(a.p); }
          var relleno = "#ffffff", k = 0;
          if (pedazo !== null) {
            while (k < pedazo.length) {
              if (pedazo[k].indexOf(u) >= 0 && pedazo[k].length > 1) { relleno = "#e7f2e8"; }
              k = k + 1;
            }
          }
          return { relleno: relleno, borde: "#6b7280" };
        }
      });
    }

    function lista(a) {
      var G = g(), s = "", j = 0;
      while (j < G.res.ordenadas.length) {
        var o = G.res.ordenadas[j], e = E.estado(a, G, j), cl = "par";
        if (e === "entra") { cl = "par hecho"; }
        if (e === "descarta") { cl = "par vieja"; }
        if (e === "en turno") { cl = "par ahora"; }
        s = s + "<span class='" + cl + "'>(" + o[0] + "," + o[1] + "," + o[2] + ")</span> ";
        j = j + 1;
      }
      el("ver-lista").innerHTML = s;
    }

    function conjuntos(a) {
      if (a === null || a.p === null) { return; }
      var G = g(), fp = [], fr = [], v = 0;
      while (v < G.n) {
        fp.push(v + ": " + (a.p[v] === null ? "–" : a.p[v]));
        fr.push(v + ": " + (a.rango[v] === null ? "–" : a.rango[v]));
        v = v + 1;
      }
      el("caja-p").innerHTML = "<div>p = {" + fp.join(", ") + "}</div><div>rango = {" + fr.join(", ") + "}</div>";
      el("ver-pedazos").textContent = MST.pedazos(a.p).length === 0 ? "ninguno" : MST.textoPedazos(a.p);
      el("ver-mst").textContent = a.mst === null ? "–" :
        (a.mst.length === 0 ? "vacío" : a.mst.map(function (x) { return "(" + x.join(",") + ")"; }).join(" "));
      el("ver-decide").textContent = a.decide === null ? "–" :
        (a.decide === "entra" ? "los pedazos son distintos: entra" : "el mismo pedazo: se descarta");
    }

    function resumen() {
      var G = g(), r = G.res;
      el("resumen").innerHTML = "<table><tr><th>aristas del árbol</th><th>peso</th><th>descartadas</th>" +
        "<th>miradas</th><th>sin mirar</th></tr><tr><td>" + r.mst.length + "</td><td>" + r.peso +
        "</td><td>" + r.descartadas + "</td><td>" + r.miradas + " de " + G.aristas.length + "</td><td>" +
        G.sinMirar + "</td></tr></table>" +
        "<p class='nota'>El árbol pesa " + r.peso + " de los " +
        G.aristas.reduce(function (s, a) { return s + a[2]; }, 0) + " que suman las " + G.aristas.length +
        " aristas. Ordenar la lista cuesta más que recorrerla.</p>";
    }

    function alPintar(e) {
      var a = e.actual;
      dibujo(a);
      lista(a);
      conjuntos(a);
    }

    function preparar() {
      var G = g();
      el("ver-texto").textContent = G.texto + " Aristas: " + MST.textoAristas(G.aristas) + ".";
      el("pregunta-pred").textContent = "La lista ordenada tiene " + G.aristas.length + " aristas.";
      el("ver-ordenada").textContent = MST.textoAristas(G.res.ordenadas);
      resumen();
    }

    Motor.iniciar({
      codigo: MST.CODIGO_KRUSKAL,
      simular: function (i) { return MST.simKruskal(E.GRAFOS[i].n, E.GRAFOS[i].aristas); },
      chips: [{ campo: "i", rotulo: "i" }, { campo: "fu", rotulo: "find_set(u)" },
              { campo: "fv", rotulo: "find_set(v)" }, { campo: "peso", rotulo: "peso" }],
      paramsIniciales: 0, alPintar: alPintar
    });
    preparar();

    function sinRepetir(lista) {
      var vistos = {}, salida = [];
      lista.forEach(function (o) {
        if (vistos[o.valor] !== true && o.valor >= 0) { vistos[o.valor] = true; salida.push(o); }
      });
      return salida;
    }

    Motor.opcionesNumericas("opciones-descartadas", "veredicto-descartadas", function (indice) {
      var G = E.GRAFOS[indice], r = G.res, m = G.aristas.length;
      return sinRepetir([
        { valor: r.descartadas, clave: "correcta",
          razon: "Correcto: se descartan " + r.descartadas + ". " +
            r.mirada.filter(function (x) { return !x.entra; })
              .map(function (x) { return "(" + x.arista.join(",") + ")"; }).join(" ") +
            " llegan cuando sus dos puntas ya están en el mismo pedazo." },
        { valor: m - (G.n - 1), clave: "todas",
          razon: "Eso cuenta también las " + G.sinMirar + " aristas del final de la lista, que el " +
            "algoritmo nunca llega a mirar porque el árbol ya está completo. Solo se descarta " +
            "lo que se mira y cierra ciclo." },
        { valor: G.n - 1, clave: "arbol",
          razon: "Ese es el número de aristas que entran al árbol, " + (G.n - 1) + ", no las que se rechazan." },
        { valor: G.sinMirar, clave: "sinmirar",
          razon: "Esas son las aristas que quedan sin mirar al final. Una arista descartada sí se mira: " +
            "se compara y se rechaza porque cierra ciclo." }
      ]);
    });

    Motor.opcionesNumericas("opciones-cierra", "veredicto-cierra", function (indice) {
      var G = E.GRAFOS[indice], r = G.res, m = G.aristas.length;
      return sinRepetir([
        { valor: r.cierra, clave: "correcta",
          razon: "Correcto: el árbol se completa en el puesto " + r.cierra + ", con (" +
            r.mirada[r.cierra - 1].arista.join(",") + "): ahí ya hay " + (G.n - 1) +
            " aristas y el ciclo no vuelve a entrar. Las " + G.sinMirar + " últimas no se alcanzan a mirar." },
        { valor: G.n - 1, clave: "sindescartes",
          razon: "Eso sería si ninguna arista cerrara ciclo. Aquí se descartan " + r.descartadas +
            " antes de completar el árbol, y cada una ocupa un puesto." },
        { valor: m, clave: "ultima",
          razon: "Eso sería recorrer toda la lista. El algoritmo para al tener " + (G.n - 1) +
            " aristas, y las " + G.sinMirar + " últimas no se miran." },
        { valor: r.cierra - 1, clave: "desdecero",
          razon: "Ese es el índice si se cuenta desde cero. El puesto cuenta desde uno: la primera arista de la lista es el puesto 1." }
      ]);
    });
    Array.prototype.forEach.call(document.querySelectorAll("#presets-grafo button"), function (b) {
      b.addEventListener("click", function () {
        idx = parseInt(b.getAttribute("data-preset"), 10);
        Array.prototype.forEach.call(document.querySelectorAll("#presets-grafo button"), function (x) { x.classList.remove("primario"); });
        b.classList.add("primario");
        preparar();
        Motor.reiniciar(idx);
      });
    });
  })();
}
