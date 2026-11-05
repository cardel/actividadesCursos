/* Ejercicio interactivo: predecir vueltas, centro, radio y diametro antes de
   pelar. La regla es vueltas = piso(diam/2), y el radio y el diametro se
   completan segun queden uno o dos centros. */
var ARB = (typeof module !== "undefined") ? require("../comun/arbol.js") : ARB;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var CASOS = [
    { nombre: "camino de seis", n: 6,
      aristas: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
      pos: [[50, 125], [150, 125], [250, 125], [350, 125], [450, 125], [540, 125]] },
    { nombre: "estrella de siete", n: 7,
      aristas: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]],
      pos: [[280, 125], [280, 30], [400, 60], [440, 160], [280, 225], [140, 190], [130, 60]] },
    { nombre: "oruga de diez", n: 10,
      aristas: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [2, 7], [4, 8], [6, 9]],
      pos: [[45, 90], [125, 90], [205, 90], [285, 90], [365, 90], [445, 90], [525, 90],
            [205, 215], [365, 215], [525, 215]] },
    { nombre: "binario de siete", n: 7,
      aristas: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]],
      pos: [[280, 30], [160, 125], [400, 125], [80, 225], [240, 225], [330, 225], [490, 225]] }
  ];

  function medidas(c) {
    var G = ARB.adyacencia(c.n, c.aristas);
    var real = ARB.radioDiametroCentro(G), p = ARB.pelarCapas(G);
    return { G: G, capas: p.capas, vueltas: p.vueltas, centro: p.centro,
             radio: real.radio, diametro: real.diametro };
  }

  function fbVueltas(c, valor) {
    var m = medidas(c);
    if (valor === m.vueltas) {
      return { ok: true, txt: "Son " + m.vueltas + ", que es el piso de " + m.diametro + " sobre dos." };
    }
    if (valor === m.radio) {
      return { ok: false, txt: "Ese es el radio, " + m.radio + ". Las vueltas son " + m.vueltas +
        ": el pelado para apenas quedan dos vértices, y con " + m.centro.length +
        (m.centro.length === 1 ? " centro se queda justo en el radio." : " centros se queda uno corto.") };
    }
    if (valor === m.diametro) {
      return { ok: false, txt: "Ese es el diámetro. Cada vuelta acerca el borde un paso por los dos lados, así que son " + m.vueltas + "." };
    }
    return { ok: false, txt: "Son " + m.vueltas + ", el piso de " + m.diametro + " sobre dos." };
  }

  function fbCentro(c, valor) {
    var m = medidas(c);
    if (valor === m.centro.length) {
      return { ok: true, txt: "Quedan " + m.centro.length + ": " + m.centro.join(" y ") +
        ". Con diámetro " + m.diametro + (m.diametro % 2 === 0 ? ", que es par, la mitad del camino más largo cae en un vértice." : ", que es impar, la mitad cae entre dos.") };
    }
    if (valor > 2) {
      return { ok: false, txt: "Nunca quedan más de dos. El pelado para en cuanto hay dos o menos, y aquí quedan " + m.centro.length + "." };
    }
    return { ok: false, txt: "Quedan " + m.centro.length + ", porque el diámetro " + m.diametro + " es " +
      (m.diametro % 2 === 0 ? "par" : "impar") + "." };
  }

  function fbRadio(c, valor) {
    var m = medidas(c);
    if (valor === m.radio) { return { ok: true, txt: "Radio " + m.radio + "." }; }
    if (valor === m.vueltas && m.centro.length === 2) {
      return { ok: false, txt: "Esas son las vueltas. Con dos centros hay que sumarle uno: el radio es " + m.radio + "." };
    }
    return { ok: false, txt: "Es " + m.radio + ": " + m.vueltas + " vueltas y " + m.centro.length +
      (m.centro.length === 1 ? " centro, así que el radio son las vueltas." : " centros, así que el radio es una más.") };
  }

  function fbDiam(c, valor) {
    var m = medidas(c);
    if (valor === m.diametro) { return { ok: true, txt: "Diámetro " + m.diametro + "." }; }
    if (valor === 2 * m.vueltas && m.centro.length === 2) {
      return { ok: false, txt: "Con dos centros el diámetro es impar: " + (2 * m.vueltas) + " más uno, o sea " + m.diametro + "." };
    }
    if (valor === 2 * m.radio && m.centro.length === 2) {
      return { ok: false, txt: "Esa cuenta vale con un solo centro. Aquí quedan dos, y el diámetro es " + m.diametro + "." };
    }
    return { ok: false, txt: "Es " + m.diametro + ", que son " + (2 * m.vueltas) +
      (m.centro.length === 1 ? "." : " más uno.") };
  }

  function filaTabla(i) {
    var c = CASOS[i], m = medidas(c);
    return "<tr><td>" + c.nombre + "</td><td>" + m.vueltas + "</td><td>" + m.centro.length +
           "</td><td>" + m.radio + "</td><td>" + m.diametro + "</td><td>" +
           (m.vueltas === m.radio ? "sí" : "no") + "</td></tr>";
  }

  return { CASOS: CASOS, medidas: medidas, fbVueltas: fbVueltas, fbCentro: fbCentro,
           fbRadio: fbRadio, fbDiam: fbDiam, filaTabla: filaTabla };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, actual = 0, resueltos = [];

    function pintar() {
      var c = E.CASOS[actual], m = E.medidas(c);
      document.getElementById("panel").innerHTML = GRAFOSVG.dibujar({
        n: c.n, pos: c.pos, dirigido: false,
        aristas: c.aristas.map(function (e) { return [e[0], e[1], ""]; }),
        arista: function () { return { color: "gris", grueso: 2 }; },
        nodo: function () { return { relleno: "#ffffff", borde: "#6b7280", grueso: 2, tinta: "#17202a" }; }
      });
      document.getElementById("pie").textContent = c.nombre + ", " + c.n + " vértices y " + c.aristas.length + " aristas.";
      document.getElementById("capas").innerHTML = "";
      ["vueltas", "cent", "radio", "diam"].forEach(function (k) {
        document.getElementById("in-" + k).value = "";
        var f = document.getElementById("fb-" + k);
        f.textContent = ""; f.className = "fb";
      });
    }

    function presets() {
      var h = "";
      E.CASOS.forEach(function (c, i) {
        h = h + "<button class='preset" + (i === actual ? " activo" : "") + "' data-i='" + i + "'>" + c.nombre + "</button>";
      });
      document.getElementById("presets").innerHTML = h;
      document.querySelectorAll("#presets .preset").forEach(function (b) {
        b.addEventListener("click", function () {
          actual = parseInt(b.getAttribute("data-i"), 10);
          presets(); pintar();
        });
      });
    }

    function tabla() {
      var cuerpo = "";
      resueltos.forEach(function (i) { cuerpo = cuerpo + E.filaTabla(i); });
      document.getElementById("tabla").innerHTML = cuerpo === "" ? "<p>Todavía no hay ninguno resuelto.</p>" :
        "<table class='tabla'><tr><th>árbol</th><th>vueltas</th><th>centros</th><th>radio</th><th>diámetro</th><th>¿vueltas = radio?</th></tr>" +
        cuerpo + "</table>";
    }

    presets(); pintar(); tabla();

    document.getElementById("btn-comprobar").addEventListener("click", function () {
      var c = E.CASOS[actual], todas = true;
      [["vueltas", E.fbVueltas], ["cent", E.fbCentro], ["radio", E.fbRadio], ["diam", E.fbDiam]]
        .forEach(function (par) {
          var val = parseInt(document.getElementById("in-" + par[0]).value, 10);
          var r = par[1](c, val), d = document.getElementById("fb-" + par[0]);
          d.textContent = r.txt;
          d.className = "fb " + (r.ok ? "bien" : "mal");
          if (!r.ok) { todas = false; }
        });
      if (todas && resueltos.indexOf(actual) < 0) { resueltos.push(actual); tabla(); }
    });
    document.getElementById("btn-capas").addEventListener("click", function () {
      var m = E.medidas(E.CASOS[actual]), h = "<p>Capas que se van:</p><ol>";
      m.capas.forEach(function (capa, i) {
        h = h + "<li>" + (i < m.capas.length - 1 ? "se va " : "queda ") + capa.join(", ") + "</li>";
      });
      document.getElementById("capas").innerHTML = h + "</ol>";
    });
  })();
}
