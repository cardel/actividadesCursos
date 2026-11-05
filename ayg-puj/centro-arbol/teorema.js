/* Ejercicio interactivo: el teorema del centro visto por dentro. Al quitar
   todas las hojas de golpe, la excentricidad de cada sobreviviente baja
   exactamente uno, porque el camino que la realizaba terminaba en una hoja.
   El minimo baja con todas, pero el argumento del minimo no se mueve. */
var ARB = (typeof module !== "undefined") ? require("../comun/arbol.js") : ARB;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var ARISTAS = [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [5, 6], [2, 7], [7, 8], [8, 9]];
  var POS = [[40, 160], [150, 120], [275, 120], [390, 55], [500, 25],
             [150, 230], [40, 240], [390, 185], [480, 150], [520, 235]];
  var G = ARB.adyacencia(10, ARISTAS);
  var ANTES = ARB.radioDiametroCentro(G);

  function sobrevivientes() {
    var grado = ARB.grados(10, ARISTAS), r = [], v = 0;
    while (v < 10) { if (grado[v] > 1) { r.push(v); } v = v + 1; }
    return r;
  }

  /* El arbol sin sus hojas, renumerado para poder recorrerlo igual. */
  function podado() {
    var vivos = sobrevivientes(), indice = {}, aristas = [], i = 0;
    while (i < vivos.length) { indice[vivos[i]] = i; i = i + 1; }
    ARISTAS.forEach(function (e) {
      if (indice[e[0]] !== undefined && indice[e[1]] !== undefined) {
        aristas.push([indice[e[0]], indice[e[1]]]);
      }
    });
    return { vivos: vivos, indice: indice, aristas: aristas,
             G: ARB.adyacencia(vivos.length, aristas) };
  }

  function despues() {
    var p = podado(), m = ARB.radioDiametroCentro(p.G), ecc = {};
    p.vivos.forEach(function (v, i) { ecc[v] = m.ecc[i]; });
    return { ecc: ecc, radio: m.radio, diametro: m.diametro,
             centro: m.centro.map(function (i) { return p.vivos[i]; }), podado: p };
  }

  function fbCelda(v, valor) {
    var d = despues(), esperado = d.ecc[v], antes = ANTES.ecc[v];
    if (valor === esperado) { return { ok: true, txt: "" }; }
    if (valor === antes) {
      return { ok: false, txt: "El " + v + " queda en " + esperado + ", no en " + antes +
        ": el camino que daba su excentricidad terminaba en una hoja, y esa hoja ya no está." };
    }
    if (valor === antes - 2) {
      return { ok: false, txt: "El " + v + " baja uno, no dos: se quitó una sola capa, así que el camino pierde un solo paso. Queda en " + esperado + "." };
    }
    return { ok: false, txt: "El " + v + " queda en " + esperado + ", que es " + antes + " menos uno." };
  }

  function fbFila(respuestas) {
    var d = despues(), malas = [], v;
    sobrevivientes().forEach(function (u) {
      if (respuestas[u] !== d.ecc[u]) { malas.push(u); }
    });
    if (malas.length === 0) {
      return { ok: true, txt: "Toda la fila bajó exactamente uno. El radio pasó de " + ANTES.radio +
        " a " + d.radio + ", y el centro sigue siendo " + d.centro.join(" y ") +
        ": el mínimo se movió, pero no el vértice donde se alcanza." };
    }
    v = malas[0];
    return { ok: false, txt: "Hay " + malas.length + (malas.length === 1 ? " celda" : " celdas") +
      " por corregir. " + fbCelda(v, respuestas[v]).txt };
  }

  function tablaAntes() {
    var f1 = "", f2 = "", v = 0;
    while (v < 10) {
      f1 = f1 + "<th>" + v + "</th>";
      f2 = f2 + "<td" + (ANTES.ecc[v] === ANTES.radio ? " class='destacado'" : "") + ">" + ANTES.ecc[v] + "</td>";
      v = v + 1;
    }
    return "<table class='tabla'><tr><th>vértice</th>" + f1 + "</tr><tr><th>ε</th>" + f2 + "</tr></table>" +
      "<p>Radio " + ANTES.radio + ", diámetro " + ANTES.diametro + ", centro " + ANTES.centro.join(" y ") + ".</p>";
  }

  function tablaDespues() {
    var d = despues(), f1 = "", f2 = "";
    sobrevivientes().forEach(function (v) {
      f1 = f1 + "<th>" + v + "</th>";
      f2 = f2 + "<td" + (d.ecc[v] === d.radio ? " class='destacado'" : "") + ">" + d.ecc[v] + "</td>";
    });
    return "<table class='tabla'><tr><th>vértice</th>" + f1 + "</tr><tr><th>ε</th>" + f2 + "</tr></table>" +
      "<p>Radio " + d.radio + ", diámetro " + d.diametro + ", centro " + d.centro.join(" y ") +
      ". El mismo centro de antes.</p>";
  }

  return { ARISTAS: ARISTAS, POS: POS, G: G, ANTES: ANTES, sobrevivientes: sobrevivientes,
           podado: podado, despues: despues, fbCelda: fbCelda, fbFila: fbFila,
           tablaAntes: tablaAntes, tablaDespues: tablaDespues };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, vivos = E.sobrevivientes(), pelado = false;

    function pintar() {
      var grado = {}, v;
      E.G.forEach(function (l, u) { grado[u] = l.length; });
      document.getElementById("panel").innerHTML = GRAFOSVG.dibujar({
        n: 10, pos: E.POS, dirigido: false,
        aristas: E.ARISTAS.map(function (e) { return [e[0], e[1], ""]; }),
        arista: function () { return { color: "gris", grueso: 2 }; },
        nodo: function (u) {
          var hoja = grado[u] === 1;
          return { relleno: hoja ? "#fdf1dc" : "#ffffff", borde: hoja ? "#e8a13d" : "#6b7280",
                   grueso: 2, tinta: "#17202a" };
        }
      });
      document.getElementById("tabla-antes").innerHTML = E.tablaAntes();
    }

    function pintarPodado() {
      var d = E.despues();
      document.getElementById("panel2").innerHTML = GRAFOSVG.dibujar({
        n: 10, pos: E.POS, dirigido: false,
        aristas: E.ARISTAS.map(function (e) { return [e[0], e[1], ""]; }),
        arista: function (i) {
          var e = E.ARISTAS[i], vive = vivos.indexOf(e[0]) >= 0 && vivos.indexOf(e[1]) >= 0;
          return { color: vive ? "#6b7280" : "claro", grueso: vive ? 2 : 1.5, trazo: vive ? null : "4 3" };
        },
        nodo: function (u) {
          var vive = vivos.indexOf(u) >= 0, centro = d.centro.indexOf(u) >= 0;
          return { relleno: centro ? "#e7f2e8" : (vive ? "#ffffff" : "#f1f2f4"),
                   borde: centro ? "#2e7d32" : (vive ? "#6b7280" : "#b9c0cb"),
                   grueso: centro ? 3 : 2, tinta: vive ? "#17202a" : "#9aa1ab" };
        }
      });
      document.getElementById("tabla-despues").innerHTML = E.tablaDespues();
    }

    function entradas() {
      var h = "";
      vivos.forEach(function (v) {
        h = h + "<span class='fila-par' style='display:inline-flex;margin-right:0.9rem'>" +
            "<span class='rotulo'>ε(" + v + ")</span>" +
            "<input type='number' class='corto' data-v='" + v + "' placeholder='" + E.ANTES.ecc[v] + "'></span>";
      });
      document.getElementById("entradas").innerHTML = h;
    }

    pintar();
    entradas();

    document.getElementById("btn-comprobar").addEventListener("click", function () {
      var r = {}, d;
      document.querySelectorAll("#entradas input").forEach(function (i) {
        r[parseInt(i.getAttribute("data-v"), 10)] = parseInt(i.value, 10);
      });
      d = E.fbFila(r);
      var c = document.getElementById("fb-fila");
      c.textContent = d.txt;
      c.className = "fb " + (d.ok ? "bien" : "mal");
    });
    document.getElementById("btn-pelar").addEventListener("click", function () {
      if (!pelado) { pintarPodado(); pelado = true; }
    });
  })();
}
