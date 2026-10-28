/* Ejercicio interactivo: el mismo arbol libre colgado de cada una de
   sus ocho raices. La altura del arbol colgado de v es la mayor
   distancia desde v, de modo que las distancias del grafo deciden lo
   que se ve en cada dibujo. */
var ARB = (typeof module !== "undefined") ? require("./lib.js") : ARB;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var NOM = "pqrstuvw";
  var ARISTAS = [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [3, 6], [6, 7]];
  var POS_LIBRE = [[45, 55], [165, 125], [60, 210], [300, 70], [430, 120], [530, 190], [300, 195], [400, 238]];
  var G = ARB.adyacencia(8, ARISTAS);
  var GRADO = ARB.grados(8, ARISTAS);
  var DIST = G.map(function (_, v) { return ARB.amplitud(G, v); });

  /* A cada raiz se le pregunta por la profundidad de un vertice
     distinto, para que la respuesta no se pueda copiar de la anterior. */
  var OBJETIVO = [4, 7, 5, 0, 2, 6, 4, 1];

  function altura(raiz) { return ARB.excentricidad(G, raiz); }

  function hojas(raiz) {
    var r = [], v = 0;
    while (v < 8) {
      if (GRADO[v] === 1 && v !== raiz) { r.push(v); }
      v = v + 1;
    }
    return r;
  }

  function masLejanos(raiz) {
    var h = altura(raiz), r = [];
    DIST[raiz].forEach(function (d, v) { if (d === h) { r.push(NOM[v]); } });
    return r;
  }

  function fbAltura(raiz, valor) {
    var h = altura(raiz), lej = masLejanos(raiz);
    if (valor === h) {
      return "La altura es " + h + ". El nodo más profundo es " + lej.join(" y ") + ", a " + h +
        " aristas de " + NOM[raiz] + ", y la altura es justamente la mayor de esas distancias.";
    }
    if (valor === h + 1 || valor === h - 1) {
      return "Es " + h + ". La altura se cuenta en aristas y no en niveles: con " + (h + 1) +
        " niveles de nodos hay " + h + " aristas desde la raíz hasta el más profundo, que aquí es " + lej.join(" y ") + ".";
    }
    if (valor === 7) {
      return "Es " + h + ". Siete son las aristas del árbol, no la altura: la altura mide un solo camino, el más largo que sale de la raíz.";
    }
    return "Es " + h + ", la distancia de " + NOM[raiz] + " al vértice más lejano, que es " + lej.join(" y ") + ".";
  }

  function fbProfundidad(raiz, valor) {
    var o = OBJETIVO[raiz], d = DIST[raiz][o];
    if (valor === d) {
      return "La profundidad de " + NOM[o] + " es " + d + ": hay " + d + " aristas de " + NOM[raiz] +
        " a " + NOM[o] + ", y en un árbol ese camino es el único que los une.";
    }
    if (valor === d + 1) {
      return "Es " + d + ". Contar nodos da uno más que contar aristas, y la raíz tiene profundidad 0.";
    }
    return "Es " + d + ", la cantidad de aristas del camino de " + NOM[raiz] + " a " + NOM[o] +
      ". Ese camino no cambia al escoger la raíz; lo que cambia es que ahora se recorre hacia abajo.";
  }

  function fbHojas(raiz, marcados) {
    var buenas = hojas(raiz), faltan = [], sobran = [], grado1 = [];
    GRADO.forEach(function (d, v) { if (d === 1) { grado1.push(NOM[v]); } });
    buenas.forEach(function (v) { if (marcados.indexOf(v) < 0) { faltan.push(NOM[v]); } });
    marcados.forEach(function (v) { if (buenas.indexOf(v) < 0) { sobran.push(NOM[v]); } });
    var ok = faltan.length === 0 && sobran.length === 0;
    var base = "Las hojas son " + buenas.map(function (v) { return NOM[v]; }).join(", ") + ". ";
    var extra = GRADO[raiz] === 1
      ? "Los vértices de grado 1 son " + grado1.join(", ") + ", y " + NOM[raiz] +
        " es uno de ellos, pero al ser la raíz no es hoja: una hoja es un nodo sin hijos, y la raíz no tiene padre que le ocupe su única arista."
      : "Son los cuatro vértices de grado 1, " + grado1.join(", ") +
        ": ninguno es la raíz, así que su única arista los une a su padre y no les queda ningún hijo.";
    if (ok) { return { ok: true, msg: base + extra }; }
    var m = base + extra;
    if (sobran.length > 0) {
      var otros = marcados.filter(function (v) { return buenas.indexOf(v) < 0 && v !== raiz; });
      m = m + " Marcó de más " + sobran.join(", ") + ".";
      if (marcados.indexOf(raiz) >= 0) {
        m = m + " " + NOM[raiz] + " es la raíz y tiene " + G[raiz].length + " hijo" +
          (G[raiz].length === 1 ? "" : "s") + ", así que no es hoja.";
      }
      if (otros.length > 0) {
        m = m + " " + otros.map(function (v) {
          var h = GRADO[v] - 1;
          return NOM[v] + " tiene grado " + GRADO[v] + ", de modo que le " + (h === 1 ? "queda un hijo" : "quedan " + h + " hijos");
        }).join("; ") + ".";
      }
    }
    if (faltan.length > 0) { m = m + " Faltó " + faltan.join(", ") + "."; }
    return { ok: false, msg: m };
  }

  function invariantes() {
    return {
      aristas: ARISTAS.map(function (e) { return NOM[e[0]] + NOM[e[1]]; }),
      grado1: GRADO.map(function (d, v) { return d === 1 ? NOM[v] : null; }).filter(function (x) { return x; }),
      distPU: DIST[0][5]
    };
  }

  return { NOM: NOM, ARISTAS: ARISTAS, POS_LIBRE: POS_LIBRE, G: G, GRADO: GRADO, DIST: DIST,
           OBJETIVO: OBJETIVO, altura: altura, hojas: hojas, masLejanos: masLejanos,
           fbAltura: fbAltura, fbProfundidad: fbProfundidad, fbHojas: fbHojas, invariantes: invariantes };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, raiz = 0, marcados = [], hechas = {};
    function el(id) { return document.getElementById(id); }

    function libre() {
      el("panel-libre").innerHTML = GRAFOSVG.dibujar({
        n: 8, pos: E.POS_LIBRE, dirigido: false,
        aristas: E.ARISTAS.map(function (e) { return [e[0], e[1], ""]; }),
        nombre: function (u) { return E.NOM[u]; }
      });
    }

    function colgado(conDatos) {
      var L = ARB.layoutColgado(E.G, raiz, { ancho: 540, alto: 250 }), hoj = E.hojas(raiz);
      el("panel-colgado").innerHTML = GRAFOSVG.dibujar({
        n: 8, pos: L.pos, aristas: L.aristas, dirigido: false, ancho: 540, alto: 250,
        nombre: function (u) { return E.NOM[u]; },
        nodo: function (u) {
          if (u === raiz) { return { relleno: "#fdf1dc", borde: "#e8a13d", grueso: 3.4, nota: conDatos ? "raíz" : "" }; }
          if (conDatos && hoj.indexOf(u) >= 0) { return { relleno: "#e7f2e8", borde: "#2e7d32", nota: "d = " + L.prof[u], notaColor: "#2e7d32" }; }
          return conDatos ? { nota: "d = " + L.prof[u] } : {};
        }
      });
      el("pie-colgado").innerHTML = "Colgado de <i>" + E.NOM[raiz] + "</i>: altura " + L.altura +
        ", hojas " + hoj.map(function (v) { return E.NOM[v]; }).join(", ") +
        (conDatos ? ". En cada nodo, su profundidad." : ". Las profundidades aparecen al comprobar.");
    }

    function botonesHojas() {
      el("hojas").innerHTML = "";
      var v = 0;
      while (v < 8) {
        (function (w) {
          var b = document.createElement("button");
          b.className = "vert" + (marcados.indexOf(w) >= 0 ? " elegido" : "");
          b.textContent = E.NOM[w];
          b.addEventListener("click", function () {
            var k = marcados.indexOf(w);
            if (k >= 0) { marcados.splice(k, 1); } else { marcados.push(w); }
            botonesHojas();
          });
          el("hojas").appendChild(b);
        })(v);
        v = v + 1;
      }
    }

    function limpiar() {
      ["altura", "prof", "hojas"].forEach(function (c) {
        el("fb-" + c).className = "fb";
        el("fb-" + c).textContent = "";
      });
      el("in-altura").value = "";
      el("in-prof").value = "";
      marcados = [];
      el("rot-altura").innerHTML = "Altura del árbol colgado de <i>" + E.NOM[raiz] + "</i>";
      el("rot-prof").innerHTML = "Profundidad de <i>" + E.NOM[E.OBJETIVO[raiz]] + "</i> con esa raíz";
      botonesHojas();
      colgado(false);
    }

    function tabla() {
      var filas = Object.keys(hechas).map(function (k) { return parseInt(k, 10); })
        .sort(function (a, b) { return a - b; });
      if (filas.length === 0) {
        el("tabla-raices").innerHTML = "<p class='nota' style='margin-top:0'>La tabla se llena con cada raíz que se comprueba.</p>";
      } else {
        el("tabla-raices").innerHTML = "<div class='envoltura-tabla'><table class='corta'>" +
          "<tr><th>Raíz</th><th>Altura</th><th>Hojas</th><th>Padre de " + E.NOM[1] + "</th></tr>" +
          filas.map(function (r) {
            var L = ARB.layoutColgado(E.G, r, {});
            return "<tr><td>" + E.NOM[r] + "</td><td>" + E.altura(r) + "</td><td>" +
              E.hojas(r).map(function (v) { return E.NOM[v]; }).join(" ") + "</td><td>" +
              (L.padre[1] >= 0 ? E.NOM[L.padre[1]] : "ninguno") + "</td></tr>";
          }).join("") + "</table></div>";
      }
      var inv = E.invariantes();
      el("invariantes").innerHTML = "<div class='alerta'>Lo mismo en las ocho: las siete aristas, " +
        inv.aristas.join(", ") + "; los vértices de grado 1, " + inv.grado1.join(", ") +
        "; y la distancia entre dos vértices, por ejemplo " + inv.distPU + " aristas de <i>p</i> a <i>u</i>." +
        " Lo que cambia es la altura, la profundidad de cada nodo y quién es padre de quién.</div>";
    }

    function comprobar() {
      var a = parseInt(el("in-altura").value, 10), p = parseInt(el("in-prof").value, 10);
      var okA = a === E.altura(raiz), okP = p === E.DIST[raiz][E.OBJETIVO[raiz]];
      el("fb-altura").className = okA ? "fb bien" : "fb mal";
      el("fb-altura").textContent = isNaN(a) ? "Falta el número." : E.fbAltura(raiz, a);
      if (isNaN(a)) { el("fb-altura").className = "fb mal"; }
      el("fb-prof").className = okP ? "fb bien" : "fb mal";
      el("fb-prof").textContent = isNaN(p) ? "Falta el número." : E.fbProfundidad(raiz, p);
      if (isNaN(p)) { el("fb-prof").className = "fb mal"; }
      var h = E.fbHojas(raiz, marcados);
      el("fb-hojas").className = h.ok ? "fb bien" : "fb mal";
      el("fb-hojas").textContent = h.msg;
      hechas[raiz] = true;
      colgado(true);
      tabla();
    }

    el("presets").innerHTML = "<span class='nota' style='margin-top:0'>Raíz:</span>" +
      E.NOM.split("").map(function (nm, i) {
        return "<button data-i='" + i + "' class='" + (i === 0 ? "primario" : "") + "'>" + nm + "</button>";
      }).join("");
    Array.prototype.forEach.call(el("presets").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        raiz = parseInt(b.getAttribute("data-i"), 10);
        Array.prototype.forEach.call(el("presets").querySelectorAll("button"), function (x) { x.classList.remove("primario"); });
        b.classList.add("primario");
        limpiar();
      });
    });
    el("btn-comprobar").addEventListener("click", comprobar);
    el("btn-ver").addEventListener("click", function () { colgado(true); });
    libre();
    limpiar();
    tabla();
  })();
}
