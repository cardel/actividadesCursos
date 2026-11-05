/* Ejercicio interactivo: descartar vertices del centro sin calcular
   excentricidades. La cuenta que lo permite es eps(hoja) = 1 + eps(vecino),
   de modo que una hoja nunca gana el minimo si el arbol tiene tres o mas
   vertices. */
var ARB = (typeof module !== "undefined") ? require("../comun/arbol.js") : ARB;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var NOM = "abcdefghi";
  var ARISTAS = [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5], [5, 6], [2, 7], [7, 8]];
  var POS = [[40, 125], [150, 125], [255, 55], [255, 195], [370, 240], [370, 150],
             [490, 110], [370, 40], [490, 20]];
  var G = ARB.adyacencia(9, ARISTAS);
  var GRADO = ARB.grados(9, ARISTAS);
  var ECC = G.map(function (_, v) { return ARB.excentricidad(G, v); });
  var MED = ARB.radioDiametroCentro(G);

  function hojas() {
    var r = [], v = 0;
    while (v < 9) { if (GRADO[v] === 1) { r.push(v); } v = v + 1; }
    return r;
  }

  function vecino(v) { return G[v][0]; }

  function fbDescartar(marcados) {
    var h = hojas(), faltan = [], sobran = [], i = 0;
    while (i < h.length) {
      if (marcados.indexOf(h[i]) < 0) { faltan.push(NOM[h[i]]); }
      i = i + 1;
    }
    i = 0;
    while (i < marcados.length) {
      if (GRADO[marcados[i]] !== 1) { sobran.push(NOM[marcados[i]]); }
      i = i + 1;
    }
    if (faltan.length === 0 && sobran.length === 0) {
      return { ok: true, txt: "Las cuatro hojas son " + h.map(function (v) { return NOM[v]; }).join(", ") +
        ". Cada una tiene excentricidad uno más que su vecino, así que ninguna puede dar el mínimo." };
    }
    var t = "";
    if (sobran.length > 0) {
      t = t + "Sobran " + sobran.join(", ") + ": tienen dos vecinos o más, así que la cuenta de la hoja no les aplica y hay que mirarlos. ";
    }
    if (faltan.length > 0) {
      t = t + "Faltan " + faltan.join(", ") + ": son hojas, con un solo vecino, y toda hoja queda descartada.";
    }
    return { ok: false, txt: t };
  }

  function fbHoja(h, valor) {
    var p = vecino(h), e = ECC[h], ep = ECC[p];
    if (valor === e) {
      return { ok: true, txt: "Bien: " + NOM[h] + " está a " + e + " del más lejano. Y su vecino " +
        NOM[p] + " está a " + ep + ", uno menos, que es justo lo que dice la cuenta." };
    }
    if (valor === ep) {
      return { ok: false, txt: "Esa es la de " + NOM[p] + ", el vecino. La hoja siempre paga un paso más para salir, así que la suya es " + e + "." };
    }
    if (valor === e - 1 || valor === e + 1) {
      return { ok: false, txt: "Cerca. Es " + e + ": desde " + NOM[h] + " todo camino arranca pasando por " +
        NOM[p] + ", y desde ahí lo más lejano queda a " + ep + "." };
    }
    return { ok: false, txt: "Es " + e + ". Desde " + NOM[h] + " se sale por " + NOM[p] + ", y como la excentricidad de " +
      NOM[p] + " es " + ep + ", la de la hoja es " + (ep + 1) + "." };
  }

  function tabla() {
    var f1 = "", f2 = "", v = 0;
    while (v < 9) {
      f1 = f1 + "<th>" + NOM[v] + "</th>";
      f2 = f2 + "<td" + (ECC[v] === MED.radio ? " class='destacado'" : "") + ">" + ECC[v] + "</td>";
      v = v + 1;
    }
    return "<table class='tabla'><tr><th>vértice</th>" + f1 + "</tr>" +
           "<tr><th>ε</th>" + f2 + "</tr></table>" +
           "<p>Radio " + MED.radio + ", diámetro " + MED.diametro + ", centro " +
           MED.centro.map(function (v) { return NOM[v]; }).join(" y ") +
           ". Las cuatro hojas tienen " + hojas().map(function (v) { return ECC[v]; }).join(", ") +
           ", todas por encima del radio.</p>";
  }

  return { NOM: NOM, G: G, GRADO: GRADO, ECC: ECC, MED: MED, POS: POS, ARISTAS: ARISTAS,
           hojas: hojas, vecino: vecino, fbDescartar: fbDescartar, fbHoja: fbHoja, tabla: tabla };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, marcados = [], hojaActual = E.hojas()[0], idxHoja = 0;

    function pintar() {
      document.getElementById("panel").innerHTML = GRAFOSVG.dibujar({
        n: 9, pos: E.POS, dirigido: false,
        nombre: function (i) { return E.NOM[i]; },
        aristas: E.ARISTAS.map(function (e) { return [e[0], e[1], ""]; }),
        arista: function () { return { color: "gris", grueso: 2 }; },
        nodo: function (u) {
          return { relleno: marcados.indexOf(u) >= 0 ? "#fdf1dc" : "#ffffff",
                   borde: marcados.indexOf(u) >= 0 ? "#e8a13d" : "#6b7280",
                   grueso: 2, tinta: "#17202a" };
        }
      });
    }

    function casillas() {
      var c = document.getElementById("descartar"), v = 0, h = "";
      while (v < 9) {
        h = h + "<label class='chip-sel'><input type='checkbox' value='" + v + "'> " + E.NOM[v] + "</label>";
        v = v + 1;
      }
      c.innerHTML = h;
      c.querySelectorAll("input").forEach(function (i) {
        i.addEventListener("change", function () {
          var val = parseInt(i.value, 10), p = marcados.indexOf(val);
          if (i.checked && p < 0) { marcados.push(val); }
          if (!i.checked && p >= 0) { marcados.splice(p, 1); }
          pintar();
        });
      });
    }

    function pedirHoja() {
      var p = E.vecino(hojaActual);
      document.getElementById("pregunta-hoja").innerHTML =
        "La excentricidad de <b>" + E.NOM[p] + "</b> es <b>" + E.ECC[p] +
        "</b>. Sin volver a recorrer el árbol, diga la de su hoja vecina.";
      document.getElementById("rot-hoja").textContent = "ε(" + E.NOM[hojaActual] + ")";
      document.getElementById("in-hoja").value = "";
      document.getElementById("fb-hoja").textContent = "";
      document.getElementById("fb-hoja").className = "fb";
    }

    casillas();
    pintar();
    pedirHoja();

    document.getElementById("btn-descartar").addEventListener("click", function () {
      var r = E.fbDescartar(marcados), d = document.getElementById("fb-descartar");
      d.textContent = r.txt;
      d.className = "fb " + (r.ok ? "bien" : "mal");
    });
    document.getElementById("btn-hoja").addEventListener("click", function () {
      var val = parseInt(document.getElementById("in-hoja").value, 10);
      var r = E.fbHoja(hojaActual, val), d = document.getElementById("fb-hoja");
      d.textContent = r.txt;
      d.className = "fb " + (r.ok ? "bien" : "mal");
    });
    document.getElementById("btn-otra").addEventListener("click", function () {
      idxHoja = (idxHoja + 1) % E.hojas().length;
      hojaActual = E.hojas()[idxHoja];
      pedirHoja();
    });
    document.getElementById("btn-ver").addEventListener("click", function () {
      document.getElementById("tabla-ecc").innerHTML = E.tabla();
    });
  })();
}
