/* Ejercicio interactivo: la excentricidad de cada vertice con una
   amplitud, y de ahi el radio, el diametro y el centro. La traza
   reproduce excentricidad.py, lineas 22 a 33, y las cifras salen de las
   lineas 35 a 46. El nucleo vive en comun/arbol.js. */
var ARB = (typeof module !== "undefined") ? require("../comun/arbol.js") : ARB;
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

  /* Nunca dos botones con el mismo valor: gana la primera de la lista. */
  function unicas(lista) {
    var vistos = {};
    return lista.filter(function (o) {
      var nuevo = !vistos[o.valor] && o.valor >= 0;
      vistos[o.valor] = true;
      return nuevo;
    });
  }

  function opcionesRadio(g) {
    return unicas([
      { valor: g.radio, clave: "correcta",
        razon: "El radio es " + g.radio + ", la menor de las ocho excentricidades: " + g.ecc.join(", ") + "." },
      { valor: g.diametro, clave: "mayor",
        razon: "Ese es el diámetro, " + g.diametro + ", la mayor de las excentricidades. El radio es la menor: " +
          g.ecc.join(", ") + " y manda " + g.radio + "." },
      { valor: g.ecc[0], clave: "primero",
        razon: "Esa es la excentricidad de p, el primer vértice, y no la menor de las ocho: " +
          g.ecc.join(", ") + ". El radio es " + g.radio + "." },
      { valor: g.radio + 1, clave: "nodos",
        razon: "Es " + g.radio + ". Con " + (g.radio + 1) + " se cuentan los vértices del camino hasta el más lejano del centro, y la excentricidad cuenta aristas." }
    ]);
  }

  function opcionesDiametro(g) {
    return unicas([
      { valor: g.diametro, clave: "correcta",
        razon: "El diámetro es " + g.diametro + ", la mayor de las ocho excentricidades (" + g.ecc.join(", ") +
          "), y también la distancia entre los dos vértices más separados." },
      { valor: g.radio, clave: "menor",
        razon: "Ese es el radio, " + g.radio + ", la menor de las excentricidades. El diámetro es la mayor: " +
          g.ecc.join(", ") + " y manda " + g.diametro + "." },
      { valor: 2 * g.radio, clave: "doble",
        razon: "El doble del radio, " + (2 * g.radio) + ", es solo la cota superior r ≤ d ≤ 2r. El diámetro real sale de las excentricidades (" +
          g.ecc.join(", ") + ") y es " + g.diametro + "." },
      { valor: g.diametro + 1, clave: "nodos",
        razon: "Es " + g.diametro + ". Con " + (g.diametro + 1) + " se cuentan los vértices del camino más largo, y el diámetro cuenta aristas." }
    ]);
  }

  function opcionesEcc(g, v) {
    var e = g.ecc[v], d = g.DIST[v], lej = masLejanos(g, v);
    var rotulo = d.map(function (x, w) { return NOM[w] + "=" + (x < 0 ? "−1" : x); }).join(", ");
    return unicas([
      { valor: e, clave: "correcta", razon: fbEcc(g, v, e).msg },
      { valor: e + 1, clave: "nodos",
        razon: "Es " + e + ". Con " + (e + 1) + " se cuentan los vértices del camino hasta " + lej.join(" y ") +
          ", y la excentricidad cuenta aristas. Las distancias desde " + NOM[v] + " son " + rotulo + "." },
      { valor: v === 7 ? -1 : g.DIST[v][7], clave: "ultimo",
        razon: "Es " + e + ". Ese " + g.DIST[v][7] + " es la distancia de " + NOM[v] + " a w, el último vértice del arreglo, y no la mayor: " +
          rotulo + "." },
      { valor: g.G[v].length, clave: "grado",
        razon: "Es " + e + ". Ese " + g.G[v].length + " es el grado de " + NOM[v] + ", cuántos vecinos tiene, y no dice hasta dónde llega el camino más largo: " +
          rotulo + "." },
      { valor: e - 1, clave: "antes",
        razon: "Es " + e + ". Con " + (e - 1) + " el recorrido se detiene una arista antes de " + lej.join(" y ") +
          ", el más lejano de " + NOM[v] + "." }
    ]).slice(0, 4);
  }

  function menosUno(g, s) {
    var c = 0;
    g.DIST[s].forEach(function (d) { if (d < 0) { c = c + 1; } });
    return c;
  }

  return { NOM: NOM, GRAFOS: GRAFOS, OPCIONES_ROTO: OPCIONES_ROTO,
           masLejanos: masLejanos, fbEcc: fbEcc, opcionesRadio: opcionesRadio, opcionesDiametro: opcionesDiametro, opcionesEcc: opcionesEcc, fbCentro: fbCentro, cota: cota, menosUno: menosUno };
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

    function comprobarRdc() {
      var g = grafo();
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
      botonesCentro();
      el("fb-centro").className = "fb";
      el("fb-centro").textContent = "";
      el("fb-cota").className = "fb";
      el("fb-cota").textContent = "";
      el("carta-ecc").style.display = g.conexo ? "" : "none";
      el("carta-rdc").style.display = g.conexo ? "" : "none";
      el("carta-roto").style.display = g.conexo ? "none" : "";
      el("veredicto-menos").className = "veredicto";
      el("veredicto-menos").textContent = "";
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

    Motor.opcionesNumericas("opciones-radio", "veredicto-radio", function (q) {
      return E.opcionesRadio(E.GRAFOS[q.g]);
    });
    Motor.opcionesNumericas("opciones-diametro", "veredicto-diametro", function (q) {
      return E.opcionesDiametro(E.GRAFOS[q.g]);
    });
    E.NOM.split("").forEach(function (nm, v) {
      Motor.opcionesNumericas("opciones-e" + v, "veredicto-e" + v, function (q) {
        return E.opcionesEcc(E.GRAFOS[q.g], v);
      });
    });
    el("btn-rdc").addEventListener("click", comprobarRdc);
    var RAZONES_MENOS = {
      correcta: "Cinco: s, t, u, v y w, los del otro pedazo. Se quedan con el −1 con que arrancó el arreglo en la línea 23, porque la amplitud desde p nunca los alcanza.",
      portriangulo: "Tres es el tamaño del pedazo de p, el triángulo pqr, y esos vértices sí se alcanzan: q y r quedan a distancia 1 y p a 0. Los que se quedan en −1 son los del otro pedazo, no los de este.",
      todosmenosp: "Siete cuenta a q y r como inalcanzables, pero la arista pq y la arista pr los alcanzan desde p. Solo quedan en −1 los cinco del otro pedazo."
    };
    Motor.conectarOpciones("opciones-menos", "veredicto-menos", RAZONES_MENOS);
    opcionesRoto();
    preparar();
  })();
}
