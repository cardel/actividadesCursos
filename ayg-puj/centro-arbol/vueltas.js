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

  /* Nunca dos botones con el mismo valor: queda la primera que lo trae.
     Se devuelven a lo sumo cuatro. */
  function unicas(lista) {
    var vistos = [], r = [], i = 0;
    while (i < lista.length) {
      if (lista[i].valor >= 0 && vistos.indexOf(lista[i].valor) < 0) {
        vistos.push(lista[i].valor);
        r.push(lista[i]);
      }
      i = i + 1;
    }
    return r.slice(0, 4);
  }

  function opcionesVueltas(c) {
    var m = medidas(c);
    return unicas([
      { valor: m.vueltas, clave: "correcta",
        razon: "Son " + m.vueltas + ", que es el piso de " + m.diametro + " sobre dos." },
      { valor: m.radio, clave: "radio",
        razon: "Ese es el radio, " + m.radio + ". Las vueltas son " + m.vueltas +
          ": el pelado para apenas quedan dos vértices, y con " + m.centro.length +
          (m.centro.length === 1 ? " centro se queda justo en el radio." : " centros se queda uno corto.") },
      { valor: m.diametro, clave: "diametro",
        razon: "Ese es el diámetro. Cada vuelta acerca el borde un paso por los dos lados, así que son " + m.vueltas + "." },
      { valor: m.capas.length, clave: "capas",
        razon: "Esa es la cantidad de capas que se listan, contando la que queda al final. Vueltas del ciclo hay " + m.vueltas + "." },
      { valor: m.capas[0].length, clave: "hojas",
        razon: "Esas son las hojas que se van en la primera vuelta. Se pregunta cuántas vueltas hay, y son " + m.vueltas + "." },
      { valor: c.n - 1, clave: "aristas",
        razon: "Esa es la cantidad de aristas del árbol. Cada vuelta quita una capa entera, no una arista: son " + m.vueltas + " vueltas." }
    ]);
  }

  function opcionesCentro(c) {
    var m = medidas(c), par = (m.diametro % 2 === 0);
    var otro = (m.centro.length === 1) ? 2 : 1;
    return unicas([
      { valor: m.centro.length, clave: "correcta",
        razon: "Quedan " + m.centro.length + ": " + m.centro.join(" y ") +
          ". Con diámetro " + m.diametro + (par ? ", que es par, la mitad del camino más largo cae en un vértice." : ", que es impar, la mitad cae entre dos.") },
      { valor: otro, clave: "paridad",
        razon: "Quedan " + m.centro.length + ", porque el diámetro " + m.diametro + " es " +
          (par ? "par" : "impar") + "." },
      { valor: 3, clave: "tres",
        razon: "Nunca quedan más de dos. El pelado para en cuanto hay dos o menos, y aquí quedan " + m.centro.length + "." },
      { valor: 0, clave: "ninguno",
        razon: "Siempre queda al menos uno: el ciclo para cuando hay dos vértices o menos, no cuando se acaban. Aquí quedan " + m.centro.length + "." }
    ]);
  }

  function opcionesRadio(c) {
    var m = medidas(c), uno = (m.centro.length === 1);
    return unicas([
      { valor: m.radio, clave: "correcta", razon: "Radio " + m.radio + "." },
      { valor: m.vueltas, clave: "vueltas",
        razon: "Esas son las vueltas. Con dos centros hay que sumarle uno: el radio es " + m.radio + "." },
      { valor: m.vueltas + 1, clave: "sumauno",
        razon: "Sumar uno vale con dos centros. Aquí queda uno solo y el radio son las vueltas, " + m.radio + "." },
      { valor: m.diametro, clave: "diametro",
        razon: "Ese es el diámetro. El radio es la excentricidad del centro: " + m.vueltas + " vueltas y " + m.centro.length +
          (uno ? " centro, así que son las vueltas." : " centros, así que es una más.") },
      { valor: m.radio + 1, clave: "demas",
        razon: "Se pasó por uno: son " + m.vueltas + " vueltas y " + m.centro.length +
          (uno ? " centro, así que el radio son las vueltas." : " centros, así que el radio es una más.") },
      { valor: m.radio - 1, clave: "menos",
        razon: "Se quedó corto por uno: son " + m.vueltas + " vueltas y " + m.centro.length +
          (uno ? " centro, así que el radio son las vueltas." : " centros, así que el radio es una más.") }
    ]);
  }

  function opcionesDiam(c) {
    var m = medidas(c), uno = (m.centro.length === 1);
    return unicas([
      { valor: m.diametro, clave: "correcta", razon: "Diámetro " + m.diametro + "." },
      { valor: 2 * m.vueltas, clave: "dosvueltas",
        razon: "Con dos centros el diámetro es impar: " + (2 * m.vueltas) + " más uno, o sea " + m.diametro + "." },
      { valor: 2 * m.radio, clave: "dosradio",
        razon: "Esa cuenta vale con un solo centro. Aquí quedan dos, y el diámetro es " + m.diametro + "." },
      { valor: 2 * m.vueltas + 1, clave: "masuno",
        razon: "Sumar uno vale con dos centros. Aquí queda uno solo y el diámetro es el doble de las vueltas, " + m.diametro + "." },
      { valor: m.radio, clave: "radio",
        razon: "Ese es el radio. El diámetro es el camino más largo, que pasa por el centro y llega a ambos lados: " +
          m.diametro + ", que son " + (2 * m.vueltas) + (uno ? "." : " más uno.") },
      { valor: m.vueltas, clave: "vueltas",
        razon: "Esas son las vueltas, la mitad del camino. El diámetro son " + (2 * m.vueltas) + (uno ? "" : " más uno") +
          ", o sea " + m.diametro + "." },
      { valor: c.n - 1, clave: "aristas",
        razon: "Esa es la cantidad de aristas del árbol, que solo coincide con el diámetro si el árbol es un camino. Aquí es " + m.diametro + "." }
    ]);
  }

  function filaTabla(i) {
    var c = CASOS[i], m = medidas(c);
    return "<tr><td>" + c.nombre + "</td><td>" + m.vueltas + "</td><td>" + m.centro.length +
           "</td><td>" + m.radio + "</td><td>" + m.diametro + "</td><td>" +
           (m.vueltas === m.radio ? "sí" : "no") + "</td></tr>";
  }

  return { CASOS: CASOS, medidas: medidas, opcionesVueltas: opcionesVueltas,
           opcionesCentro: opcionesCentro, opcionesRadio: opcionesRadio,
           opcionesDiam: opcionesDiam, filaTabla: filaTabla };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, actual = 0, resueltos = [], refrescos = [];

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
      refrescos.forEach(function (o) { o.refrescar(); });
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

    var PREGUNTAS = [["vueltas", E.opcionesVueltas], ["cent", E.opcionesCentro],
                     ["radio", E.opcionesRadio], ["diam", E.opcionesDiam]];

    PREGUNTAS.forEach(function (par) {
      refrescos.push(Motor.opcionesNumericas("opciones-" + par[0], "veredicto-" + par[0],
        function () { return par[1](E.CASOS[actual]); }));
      /* el clic llega aqui despues de que el boton pinto su veredicto */
      document.getElementById("opciones-" + par[0]).addEventListener("click", function () {
        var todas = true;
        PREGUNTAS.forEach(function (q) {
          if (document.getElementById("veredicto-" + q[0]).className.indexOf("bien") < 0) { todas = false; }
        });
        if (todas && resueltos.indexOf(actual) < 0) { resueltos.push(actual); tabla(); }
      });
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
