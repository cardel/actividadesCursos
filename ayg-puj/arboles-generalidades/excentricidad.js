/* Ejercicio interactivo: la excentricidad de cada vertice con una
   amplitud, y de ahi el radio, el diametro y el centro. La traza
   reproduce excentricidad.py, lineas 22 a 33, y las cifras salen de las
   lineas 35 a 46. El nucleo vive en lib.js. */
var ARB = (typeof module !== "undefined") ? require("./lib.js") : ARB;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var NOM = "pqrstuvw";

  var GRAFOS = [
    { boton: "Con dos ciclos",
      texto: "Ocho vértices y nueve aristas: pq, qr, qs, rs, st, tu, tv, uw, vw. El triángulo qrs y el cuadrado tuwv dejan dos ciclos, de modo que entre varias parejas hay dos caminos y la distancia es la del más corto.",
      aristas: [[0, 1], [1, 2], [1, 3], [2, 3], [3, 4], [4, 5], [4, 6], [5, 7], [6, 7]],
      pos: [[40, 125], [140, 125], [215, 45], [215, 200], [320, 125], [420, 50], [420, 200], [515, 125]] },
    { boton: "Un árbol",
      texto: "Ocho vértices y siete aristas: un camino de p a v con w colgado de s. Al ser un árbol, cada pareja tiene un solo camino y no hay nada que comparar.",
      aristas: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [3, 7]],
      pos: [[40, 80], [120, 80], [200, 80], [280, 80], [360, 80], [440, 80], [520, 80], [280, 190]] },
    { boton: "En dos pedazos",
      texto: "El triángulo pqr por un lado y el camino stuvw por el otro, sin ninguna arista entre los dos grupos. La amplitud desde cualquier vértice deja en −1 a todo el otro pedazo.",
      aristas: [[0, 1], [1, 2], [0, 2], [3, 4], [4, 5], [5, 6], [6, 7]],
      pos: [[70, 70], [160, 130], [70, 190], [260, 130], [330, 130], [400, 130], [470, 130], [540, 130]] }
  ];
  GRAFOS.forEach(function (g) {
    g.n = 8;
    g.G = ARB.adyacencia(8, g.aristas);
    g.dibujo = g.aristas.map(function (e) { return [e[0], e[1], ""]; });
    g.DIST = g.G.map(function (_, v) { return ARB.amplitud(g.G, v); });
    g.comp = ARB.componentes(g.G).cuantas;
    g.conexo = g.comp === 1;
    var r = ARB.radioDiametroCentro(g.G);
    g.ecc = r.ecc; g.radio = r.radio; g.diametro = r.diametro; g.centro = r.centro;
  });

  function masLejanos(g, v) {
    var r = [];
    g.DIST[v].forEach(function (d, w) { if (d === g.ecc[v]) { r.push(NOM[w]); } });
    return r;
  }

  function fbEcc(g, v, valor) {
    var e = g.ecc[v], lej = masLejanos(g, v), d = g.DIST[v];
    if (valor === e) {
      return { ok: true, msg: NOM[v] + ": " + e + ", la distancia a " + lej.join(" y ") +
        ". Distancias desde " + NOM[v] + ": " + d.map(function (x, w) { return NOM[w] + "=" + (x < 0 ? "−1" : x); }).join(", ") + "." };
    }
    if (valor === e + 1 || valor === e - 1) {
      return { ok: false, msg: NOM[v] + ": es " + e + ". Las distancias desde " + NOM[v] + " son " +
        d.map(function (x, w) { return NOM[w] + "=" + (x < 0 ? "−1" : x); }).join(", ") +
        ", y la excentricidad es la mayor de ellas, no la cantidad de vértices del camino." };
    }
    return { ok: false, msg: NOM[v] + ": es " + e + ". El vértice más lejano es " + lej.join(" y ") +
      ", a " + e + " aristas, y hacia allá no hay atajo." };
  }

  function fbCentro(g, marcados) {
    var buenas = g.centro, faltan = [], sobran = [];
    buenas.forEach(function (v) { if (marcados.indexOf(v) < 0) { faltan.push(NOM[v]); } });
    marcados.forEach(function (v) { if (buenas.indexOf(v) < 0) { sobran.push(NOM[v]); } });
    var lista = buenas.map(function (v) { return NOM[v]; }).join(" y ");
    if (faltan.length === 0 && sobran.length === 0) {
      return { ok: true, msg: "El centro es " + lista + ", con excentricidad " + g.radio +
        (buenas.length === 1 ? ". Es el único vértice que alcanza a todos en " + g.radio + " pasos."
                             : ". Los dos alcanzan a todos en " + g.radio + " pasos y ninguno lo hace en menos.") };
    }
    var m = "El centro es " + lista + ".";
    if (sobran.length > 0) {
      m = m + " " + sobran.map(function (x) {
        var v = NOM.indexOf(x);
        return x + " tiene excentricidad " + g.ecc[v] + " y el radio es " + g.radio;
      }).join("; ") + ".";
    }
    if (faltan.length > 0) { m = m + " Faltó " + faltan.join(", ") + "."; }
    return { ok: false, msg: m };
  }

  function cota(g) {
    if (!g.conexo) {
      return "La cota r ≤ d ≤ 2r supone que el grafo es conexo: sin eso, las dos cifras no comparan nada.";
    }
    return "r ≤ d ≤ 2r: " + g.radio + " ≤ " + g.diametro + " ≤ " + (2 * g.radio) +
      (g.diametro === 2 * g.radio
        ? ". La segunda desigualdad se cumple con igualdad: los dos vértices más lejanos quedan justo a r pasos del centro, uno a cada lado."
        : ". La segunda queda holgada, porque los dos vértices más lejanos no están en lados opuestos del centro.");
  }

  /* El grafo en dos pedazos: lo que el codigo devuelve no es la
     excentricidad, porque las distancias que quedaron en -1 nunca
     superan al ans que arranca en 0. */
  var OPCIONES_ROTO = [
    { t: "1, porque dentro de su pedazo nadie queda a más de un paso.", ok: true,
      fb: "Correcto, y conviene ver por qué. La amplitud desde p llega a q y a r con distancia 1 y deja a los otros cinco en −1. Después la comparación de la línea 39 mira dist[w] > ans con ans arrancando en 0, y −1 nunca gana, así que los cinco vértices inalcanzables no aportan nada. El código devuelve 1, pero la excentricidad de p no es 1: la distancia de p a s no existe, y con eso ε(p) no está definida." },
    { t: "−1, porque hay vértices a los que no llega.", ok: false,
      fb: "El −1 está en el arreglo, pero no sale como respuesta: ans arranca en 0 y la línea 39 solo lo cambia cuando dist[w] es mayor, de modo que un −1 nunca lo mueve." },
    { t: "4, la mayor distancia que aparece en el grafo.", ok: false,
      fb: "El 4 es la distancia de s a w, que están en el otro pedazo. La amplitud desde p no sale de su componente, así que esa distancia no entra en su arreglo." },
    { t: "7, la cantidad de aristas.", ok: false,
      fb: "La excentricidad no cuenta aristas del grafo, cuenta aristas de un camino: la del más largo de los caminos más cortos que salen de p." },
    { t: "Nada: la amplitud se queda dando vueltas en el triángulo.", ok: false,
      fb: "El triángulo no la atrapa. La condición dist[w] == −1 de la línea 30 deja entrar cada vértice a la cola una sola vez, y al tercer paso la cola queda vacía y el ciclo termina." }
  ];

  function menosUno(g, s) {
    var c = 0;
    g.DIST[s].forEach(function (d) { if (d < 0) { c = c + 1; } });
    return c;
  }

  return { NOM: NOM, GRAFOS: GRAFOS, OPCIONES_ROTO: OPCIONES_ROTO,
           masLejanos: masLejanos, fbEcc: fbEcc, fbCentro: fbCentro, cota: cota, menosUno: menosUno };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, p = { g: 0, s: 0 }, marcados = [];
    function el(id) { return document.getElementById(id); }
    function grafo() { return E.GRAFOS[p.g]; }

    function dibujo(a) {
      var g = grafo(), d = a ? a.dist : null;
      el("panel-grafo").innerHTML = GRAFOSVG.dibujar({
        n: g.n, pos: g.pos, aristas: g.dibujo, dirigido: false,
        nombre: function (u) { return E.NOM[u]; },
        arista: function (t) {
          var e = g.aristas[t];
          return (a && (a.v === e[0] || a.v === e[1])) ? { color: "azul", grueso: 3 } : { color: "gris", grueso: 2 };
        },
        nodo: function (u) {
          var s = {};
          if (d && d[u] >= 0) { s.nota = String(d[u]); }
          if (d && d[u] < 0) { s.nota = "−1"; s.notaColor = "#b3261e"; }
          if (u === p.s) { s.relleno = "#fdf1dc"; s.borde = "#e8a13d"; s.grueso = 3.4; }
          else if (a && a.v === u) { s.relleno = "#e3edf8"; }
          if (a && a.w === u) { s.borde = "#1f5fa8"; s.grueso = 3.2; }
          return s;
        }
      });
    }

    function arreglo(a) {
      var g = grafo(), d = a ? a.dist : g.G.map(function () { return null; });
      el("panel-dist").innerHTML = d.map(function (x, u) {
        var cls = "caja";
        if (x === null) { cls = "caja"; }
        else if (x < 0) { cls = "caja negativo"; }
        else { cls = "caja visitada"; }
        if (a && a.v === u) { cls = cls + " actual"; }
        return "<div class='" + cls + "'><span class='indice'>" + E.NOM[u] + "</span>" +
          (x === null ? "·" : (x < 0 ? "−1" : x)) + "</div>";
      }).join("");
      el("ver-cola").innerHTML = a && a.cola.length > 0
        ? a.cola.map(function (u) { return "<span class='par'>" + E.NOM[u] + "</span>"; }).join(" ")
        : "<span class='par fuera'>vacía</span>";
    }

    function alPintar(e) {
      var a = e.actual;
      dibujo(a);
      arreglo(a);
      el("ver-cuerpo").textContent = a ? a.nota : "Sin arrancar: el arreglo todavía no existe.";
    }

    function camposEcc() {
      var g = grafo();
      el("campos-ecc").innerHTML = E.NOM.split("").map(function (nm, v) {
        return "<div class='fila-par'><span class='rotulo'>Excentricidad de " + nm +
          "</span><input type='number' class='corto' id='in-e" + v + "' placeholder='0'>" +
          "<span class='fb' id='fb-e" + v + "'></span></div>";
      }).join("");
      el("fb-ecc").className = "fb";
      el("fb-ecc").textContent = "";
    }

    function botonesCentro() {
      el("centro").innerHTML = E.NOM.split("").map(function (nm, v) {
        return "<button class='vert" + (marcados.indexOf(v) >= 0 ? " elegido" : "") + "' data-v='" + v + "'>" + nm + "</button>";
      }).join("");
      Array.prototype.forEach.call(el("centro").querySelectorAll("button"), function (b) {
        b.addEventListener("click", function () {
          var v = parseInt(b.getAttribute("data-v"), 10), k = marcados.indexOf(v);
          if (k >= 0) { marcados.splice(k, 1); } else { marcados.push(v); }
          botonesCentro();
        });
      });
    }

    function comprobarEcc() {
      var g = grafo(), buenas = 0;
      E.NOM.split("").forEach(function (nm, v) {
        var valor = parseInt(el("in-e" + v).value, 10), caja = el("fb-e" + v);
        if (isNaN(valor)) { caja.className = "fb mal"; caja.textContent = "Falta el número."; return; }
        var r = E.fbEcc(g, v, valor);
        caja.className = r.ok ? "fb bien" : "fb mal";
        caja.textContent = r.msg;
        if (r.ok) { buenas = buenas + 1; }
      });
      el("fb-ecc").className = buenas === 8 ? "fb bien" : "fb mal";
      el("fb-ecc").textContent = buenas === 8
        ? "Las ocho salen. Ocho amplitudes, cada una O(|V| + |E|), que es lo que cuesta este método: O(|V| · (|V| + |E|))."
        : buenas + " de 8 correctas.";
    }

    function comprobarRdc() {
      var g = grafo();
      var r = parseInt(el("in-radio").value, 10), d = parseInt(el("in-diametro").value, 10);
      el("fb-radio").className = r === g.radio ? "fb bien" : "fb mal";
      el("fb-radio").textContent = isNaN(r) ? "Falta el número."
        : (r === g.radio ? "El radio es " + g.radio + ", la menor de las ocho excentricidades."
                         : "Es " + g.radio + ": las excentricidades son " + g.ecc.join(", ") + " y la menor manda.");
      el("fb-diametro").className = d === g.diametro ? "fb bien" : "fb mal";
      el("fb-diametro").textContent = isNaN(d) ? "Falta el número."
        : (d === g.diametro ? "El diámetro es " + g.diametro + ", la mayor de las ocho, y también la distancia entre los dos vértices más separados."
                            : "Es " + g.diametro + ": la mayor de " + g.ecc.join(", ") + ".");
      var c = E.fbCentro(g, marcados);
      el("fb-centro").className = c.ok ? "fb bien" : "fb mal";
      el("fb-centro").textContent = c.msg;
      el("fb-cota").className = "fb bien";
      el("fb-cota").textContent = E.cota(g);
    }

    function opcionesRoto() {
      el("opciones-roto").innerHTML = "";
      E.OPCIONES_ROTO.forEach(function (o) {
        var b = document.createElement("button");
        b.className = "opcion";
        b.textContent = o.t;
        b.addEventListener("click", function () {
          Array.prototype.forEach.call(el("opciones-roto").querySelectorAll("button"), function (x) { x.classList.remove("elegida"); });
          b.classList.add("elegida");
          el("fb-roto").className = o.ok ? "fb bien" : "fb mal";
          el("fb-roto").textContent = o.fb;
        });
        el("opciones-roto").appendChild(b);
      });
    }

    function preparar() {
      var g = grafo();
      el("ver-texto").textContent = g.texto;
      marcados = [];
      camposEcc();
      botonesCentro();
      ["radio", "diametro"].forEach(function (c) {
        el("in-" + c).value = "";
        el("fb-" + c).className = "fb";
        el("fb-" + c).textContent = "";
      });
      el("fb-centro").className = "fb";
      el("fb-centro").textContent = "";
      el("fb-cota").className = "fb";
      el("fb-cota").textContent = "";
      el("carta-ecc").style.display = g.conexo ? "" : "none";
      el("carta-rdc").style.display = g.conexo ? "" : "none";
      el("carta-roto").style.display = g.conexo ? "none" : "";
      el("in-menos").value = "";
      el("fb-menos").className = "fb";
      el("fb-menos").textContent = "";
      el("fb-roto").className = "fb";
      el("fb-roto").textContent = "";
      fuentes();
    }

    function fuentes() {
      el("presets-fuente").innerHTML = "<span class='nota' style='margin-top:0'>Fuente:</span>" +
        E.NOM.split("").map(function (nm, v) {
          return "<button data-v='" + v + "' class='" + (v === p.s ? "primario" : "") + "'>" + nm + "</button>";
        }).join("");
      Array.prototype.forEach.call(el("presets-fuente").querySelectorAll("button"), function (b) {
        b.addEventListener("click", function () {
          p.s = parseInt(b.getAttribute("data-v"), 10);
          fuentes();
          Motor.reiniciar(p);
        });
      });
    }

    Motor.iniciar({
      codigo: ARB.CODIGO_AMPLITUD,
      simular: function (q) { return ARB.simAmplitud(E.GRAFOS[q.g].G, q.s); },
      chips: [{ campo: "v", rotulo: "v" }, { campo: "w", rotulo: "w" },
              { campo: "dw", rotulo: "dist[w]", clase: "cuenta" }],
      paramsIniciales: p, alPintar: alPintar
    });

    el("presets-grafo").innerHTML = "<span class='nota' style='margin-top:0'>Grafo:</span>" +
      E.GRAFOS.map(function (g, i) {
        return "<button data-i='" + i + "' class='" + (i === 0 ? "primario" : "") + "'>" + g.boton + "</button>";
      }).join("");
    Array.prototype.forEach.call(el("presets-grafo").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        p.g = parseInt(b.getAttribute("data-i"), 10);
        p.s = 0;
        Array.prototype.forEach.call(el("presets-grafo").querySelectorAll("button"), function (x) { x.classList.remove("primario"); });
        b.classList.add("primario");
        preparar();
        Motor.reiniciar(p);
      });
    });

    el("btn-ecc").addEventListener("click", comprobarEcc);
    el("btn-rdc").addEventListener("click", comprobarRdc);
    el("btn-menos").addEventListener("click", function () {
      var g = grafo(), v = parseInt(el("in-menos").value, 10), esperado = E.menosUno(g, 0);
      el("fb-menos").className = v === esperado ? "fb bien" : "fb mal";
      el("fb-menos").textContent = v === esperado
        ? "Correcto: " + esperado + ". Son los del otro pedazo, " + E.NOM.split("").filter(function (nm, u) { return g.DIST[0][u] < 0; }).join(", ") +
          ", y se quedan con el −1 con que arrancó el arreglo en la línea 23."
        : "Son " + esperado + ". La amplitud desde p solo visita su propia componente, que tiene " + (8 - esperado) + " vértices contando a p.";
    });
    opcionesRoto();
    preparar();
  })();
}
