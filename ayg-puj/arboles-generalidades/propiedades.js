/* Ejercicio interactivo: decidir si un grafo es un arbol y contar sus
   piezas. La decision sale de tres hechos: un arbol tiene n - 1
   aristas, un grafo conexo tiene al menos n - 1 y un grafo aciclico
   tiene a lo sumo n - 1. */
var ARB = (typeof module !== "undefined") ? require("./lib.js") : ARB;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {

  var OPCIONES = [
    { id: "A", t: "Es un árbol." },
    { id: "B", t: "No es un árbol: se parte en varias componentes." },
    { id: "C", t: "No es un árbol: tiene al menos un ciclo." },
    { id: "D", t: "Con lo que se da no se puede decidir." },
    { id: "E", t: "No existe ningún grafo con esos datos." }
  ];

  /* it = {n, m, conexo, aciclico} */
  function clasificar(it) {
    var r;
    if (it.conexo && it.m < it.n - 1) { r = "E"; }
    else if (it.aciclico && it.m > it.n - 1) { r = "E"; }
    else if (it.conexo && it.m === it.n - 1) { r = "A"; }
    else if (it.aciclico && it.m === it.n - 1) { r = "A"; }
    else if (it.conexo) { r = "C"; }
    else if (it.aciclico) { r = "B"; }
    else { r = "D"; }
    return r;
  }

  function pl(k, sing, plur) { return k === 1 ? sing : plur; }

  function ciclosIndep(it) { return it.m - it.n + 1; }
  function componentes(it) { return it.n - it.m; }

  function datos(it) {
    var p = [];
    if (it.conexo) { p.push("conexo"); }
    if (it.aciclico) { p.push("acíclico"); }
    return "n = " + it.n + ", |E| = " + it.m + (p.length > 0 ? ", " + p.join(" y ") : "");
  }

  /* Retroalimentacion de cada opcion, armada con los numeros del caso. */
  function fb(op, it) {
    var bien = clasificar(it), n = it.n, m = it.m, nm1 = n - 1;
    if (op === bien) {
      if (bien === "A") {
        return "Correcto. Tiene " + m + " aristas, que son n − 1 = " + nm1 + ", y además es " +
          (it.conexo ? "conexo" : "acíclico") + ". Con una de las dos propiedades y la cuenta de aristas alcanza, porque la otra se deduce.";
      }
      if (bien === "B") {
        return "Correcto. Acíclico con " + m + " aristas, menos que n − 1 = " + nm1 +
          ". Un bosque de k componentes tiene n − k aristas, así que aquí hay n − |E| = " + componentes(it) +
          " componentes, y para unirlas " + pl(nm1 - m, "falta una arista", "faltan " + (nm1 - m) + " aristas") + ".";
      }
      if (bien === "C") {
        return "Correcto. Conexo con " + m + " aristas, más que n − 1 = " + nm1 + ". " +
          pl(m - nm1, "La arista de sobra cierra un ciclo", "Las " + (m - nm1) + " aristas de sobra cierran " + ciclosIndep(it) + " ciclos independientes") +
          ", y las aristas de " + pl(ciclosIndep(it), "ese ciclo dejan", "esos ciclos dejan") + " de ser puentes.";
      }
      if (bien === "D") {
        return "Correcto. " + m + " aristas y n − 1 = " + nm1 +
          ": la cuenta cuadra, pero la cuenta sola no decide. Un ciclo de tres vértices más un camino con el resto también tiene " +
          m + " aristas, y ese ni es conexo ni es acíclico. Hace falta comprobar una de las dos.";
      }
      return "Correcto. " + (it.conexo
        ? "Un grafo conexo necesita al menos n − 1 = " + nm1 + " aristas, y aquí hay " + m + "."
        : "Un grafo acíclico tiene a lo sumo n − 1 = " + nm1 + " aristas, y aquí hay " + m + ".") +
        " Los datos se contradicen.";
    }
    if (op === "A") {
      if (bien === "E") { return "No hay grafo que cumpla esos datos, así que menos todavía un árbol. " + (it.conexo ? "Conexo pide al menos " + nm1 + " aristas." : "Acíclico admite a lo sumo " + nm1 + " aristas."); }
      if (bien === "B") { return "Un árbol tiene n − 1 = " + nm1 + " aristas y aquí hay " + m + ". Con menos aristas el grafo no puede ser conexo, y lo que queda es un bosque."; }
      if (bien === "C") { return "Un árbol tiene n − 1 = " + nm1 + " aristas y aquí hay " + m + ". Con más aristas hay ciclos, y un árbol no tiene ninguno."; }
      return "La cuenta de aristas cuadra con n − 1 = " + nm1 + ", pero eso solo no lo hace árbol: el mismo número de aristas lo tiene un grafo con un ciclo y una componente aparte.";
    }
    if (op === "B") {
      if (bien === "A") { return it.conexo
        ? "El enunciado lo da conexo, así que de partirse en componentes no hay nada que averiguar."
        : "Un bosque de k componentes tiene n − k aristas. Con " + m + " = n − 1 aristas la única k que cuadra es 1, de modo que el grafo es conexo."; }
      if (bien === "C") { return "El enunciado lo da conexo, así que no se parte. Lo que sobra son aristas, no faltan."; }
      if (bien === "D") { return "Puede ser, y también puede ser conexo. Con " + m + " aristas y n = " + n + " caben las dos cosas, y por eso el caso no se decide."; }
      return "Antes de contar componentes hay que ver si el grafo existe: " + (it.conexo ? "conexo con " + m + " aristas y n = " + n + " es imposible." : "acíclico con " + m + " aristas y n = " + n + " es imposible.");
    }
    if (op === "C") {
      if (bien === "A") { return "No hay ciclos: " + (it.aciclico ? "el enunciado lo da acíclico" : "un conexo con exactamente n − 1 = " + nm1 + " aristas no alcanza a cerrar ninguno, porque cada arista de sobra es la que cierra un ciclo") + "."; }
      if (bien === "B") { return "El enunciado lo da acíclico, así que ciclos no hay. Lo que pasa con " + m + " aristas frente a n − 1 = " + nm1 + " es que no alcanzan para conectarlo."; }
      if (bien === "D") { return "Puede tener un ciclo, y también puede no tenerlo. Con " + m + " aristas caben las dos cosas, y de ahí que el caso no se decida."; }
      return "Los datos no describen ningún grafo, así que la pregunta por sus ciclos no llega a plantearse.";
    }
    if (op === "D") {
      if (bien === "E") { return "Sí se puede decidir, y la respuesta es que no hay grafo así: las dos cifras se contradicen con la propiedad que se afirma."; }
      return "Sí alcanza. " + (it.conexo ? "Conexo" : "Acíclico") + " más la cuenta de aristas frente a n − 1 = " + nm1 +
        " decide el caso, y esa comparación cuesta leer dos números.";
    }
    return "El grafo existe. " + (it.conexo
      ? "Conexo con " + m + " aristas y n = " + n + " es posible mientras m sea al menos n − 1 = " + nm1 + "."
      : (it.aciclico
        ? "Acíclico con " + m + " aristas y n = " + n + " es posible mientras m sea a lo sumo n − 1 = " + nm1 + "."
        : "Con n = " + n + " y " + m + " aristas hay varios grafos, y justamente por eso el caso no se decide."));
  }

  var CASOS = [
    { n: 14, m: 13, conexo: true, aciclico: false },
    { n: 8, m: 6, conexo: false, aciclico: true },
    { n: 11, m: 15, conexo: true, aciclico: false },
    { n: 7, m: 6, conexo: false, aciclico: true },
    { n: 12, m: 11, conexo: false, aciclico: false },
    { n: 13, m: 13, conexo: true, aciclico: false },
    { n: 5, m: 7, conexo: false, aciclico: true },
    { n: 12, m: 9, conexo: true, aciclico: false }
  ];

  /* ---------- los tres grafos dibujados ---------- */

  var NOM = "pqrstuvw";

  var GRAFOS = [
    { boton: "Siete aristas",
      texto: "Ocho vértices y las aristas pq, pr, qs, qt, ru, uv, uw.",
      n: 8, aristas: [[0, 1, ""], [0, 2, ""], [1, 3, ""], [1, 4, ""], [2, 5, ""], [5, 6, ""], [5, 7, ""]],
      pos: [[250, 35], [120, 115], [380, 115], [50, 205], [190, 205], [470, 105], [395, 215], [525, 205]] },
    { boton: "Una arista más",
      texto: "El mismo de antes con la arista rt agregada: ocho aristas.",
      n: 8, aristas: [[0, 1, ""], [0, 2, ""], [1, 3, ""], [1, 4, ""], [2, 5, ""], [5, 6, ""], [5, 7, ""], [2, 4, ""]],
      pos: [[250, 35], [120, 115], [380, 115], [50, 205], [190, 205], [470, 105], [395, 215], [525, 205]] },
    { boton: "Seis aristas",
      texto: "Ocho vértices y las aristas pq, pr, qs, tu, uv, uw.",
      n: 8, aristas: [[0, 1, ""], [0, 2, ""], [1, 3, ""], [4, 5, ""], [5, 6, ""], [5, 7, ""]],
      pos: [[110, 60], [110, 185], [230, 60], [230, 185], [370, 55], [450, 140], [375, 220], [525, 210]] }
  ];
  GRAFOS.forEach(function (g) {
    var ar = g.aristas.map(function (e) { return [e[0], e[1]]; });
    g.G = ARB.adyacencia(g.n, ar);
    g.grado = ARB.grados(g.n, ar);
    g.m = ar.length;
    g.comp = ARB.componentes(g.G).cuantas;
    g.hojas = [];
    g.grado.forEach(function (d, v) { if (d === 1) { g.hojas.push(NOM[v]); } });
    g.ciclos = g.m - g.n + g.comp;
  });

  var PREGUNTAS = [
    { campo: "aristas", rotulo: "¿Cuántas aristas tiene?",
      valor: function (g) { return g.m; },
      fb: function (g, v) {
        return v > g.m
          ? "Son " + g.m + ". Cada línea del dibujo es una sola arista, y una arista que toca un vértice de grado 3 no cuenta tres veces."
          : "Son " + g.m + ". La suma de los grados es " + (2 * g.m) + ", que es dos veces la cantidad de aristas: cada arista aporta uno a cada punta.";
      } },
    { campo: "hojas", rotulo: "¿Cuántas hojas, es decir vértices de grado 1?",
      valor: function (g) { return g.hojas.length; },
      fb: function (g) {
        return "Son " + g.hojas.length + ": " + g.hojas.join(", ") + ". Los grados son " +
          g.grado.map(function (d, v) { return NOM[v] + ":" + d; }).join(", ") +
          ". Sin raíz escogida, hoja quiere decir grado 1 y nada más.";
      } },
    { campo: "ciclos", rotulo: "¿Cuántos ciclos independientes tiene?",
      valor: function (g) { return g.ciclos; },
      fb: function (g) {
        return "Son " + g.ciclos + ". La cuenta es |E| − n + c con c componentes: " + g.m + " − " + g.n +
          " + " + g.comp + " = " + g.ciclos + ". Este grafo tiene " + g.comp + " componente" + (g.comp === 1 ? "" : "s") +
          " y " + (g.ciclos === 0 ? "ninguna arista de sobra, así que toda arista es puente." : g.ciclos + " arista" + (g.ciclos === 1 ? "" : "s") + " de sobra, y las del ciclo dejan de ser puentes.");
      } }
  ];

  return { OPCIONES: OPCIONES, CASOS: CASOS, GRAFOS: GRAFOS, PREGUNTAS: PREGUNTAS, NOM: NOM,
           clasificar: clasificar, datos: datos, fb: fb,
           ciclosIndep: ciclosIndep, componentes: componentes };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, resueltos = 0, idx = 0;
    function el(id) { return document.getElementById(id); }

    function carta(it, i) {
      var c = document.createElement("div"), st = { listo: false, op: null };
      c.className = "carta interno";
      c.innerHTML = "<div class='rotulo'>Caso " + (i + 1) + " · " + E.datos(it) + "</div>" +
        "<div class='opciones col'></div><div class='fb'></div>";
      var caja = c.querySelector(".opciones"), fb = c.querySelector(".fb");
      E.OPCIONES.forEach(function (o) {
        var b = document.createElement("button");
        b.className = "opcion";
        b.textContent = o.t;
        b.addEventListener("click", function () {
          st.op = o.id;
          Array.prototype.forEach.call(caja.querySelectorAll("button"), function (x) { x.classList.remove("elegida"); });
          b.classList.add("elegida");
          var ok = o.id === E.clasificar(it);
          fb.className = ok ? "fb bien" : "fb mal";
          fb.textContent = E.fb(o.id, it);
          if (ok && !st.listo) {
            st.listo = true;
            resueltos = resueltos + 1;
            el("resueltos").textContent = resueltos;
          }
        });
        caja.appendChild(b);
      });
      return c;
    }

    function dibujar() {
      var g = E.GRAFOS[idx];
      el("ver-texto").textContent = g.texto;
      el("panel-grafo").innerHTML = GRAFOSVG.dibujar({
        n: g.n, pos: g.pos, aristas: g.aristas, dirigido: false,
        nombre: function (u) { return E.NOM[u]; },
        nodo: function (u) { return g.grado[u] === 1 ? { relleno: "#e7f2e8", borde: "#2e7d32" } : {}; }
      });
      el("cuentas").innerHTML = E.PREGUNTAS.map(function (p) {
        return "<div class='fila-par'><span class='rotulo'>" + p.rotulo +
          "</span><input type='number' class='corto' id='in-" + p.campo + "' placeholder='0'>" +
          "<span class='fb' id='fb-" + p.campo + "'></span></div>";
      }).join("");
      el("fb-cuentas").className = "";
      el("fb-cuentas").textContent = "";
    }

    function comprobar() {
      var g = E.GRAFOS[idx], buenas = 0;
      E.PREGUNTAS.forEach(function (p) {
        var v = parseInt(el("in-" + p.campo).value, 10), caja = el("fb-" + p.campo), esperado = p.valor(g);
        if (isNaN(v)) { caja.className = "fb mal"; caja.textContent = "Falta el número."; return; }
        if (v === esperado) {
          caja.className = "fb bien";
          caja.textContent = "Correcto. " + p.fb(g, v);
          buenas = buenas + 1;
        } else {
          caja.className = "fb mal";
          caja.textContent = p.fb(g, v);
        }
      });
      el("fb-cuentas").className = buenas === E.PREGUNTAS.length ? "fb bien" : "fb mal";
      el("fb-cuentas").textContent = buenas === E.PREGUNTAS.length
        ? "Las tres cuentas salen. Con " + g.m + " aristas frente a n − 1 = " + (g.n - 1) + ", este grafo " +
          (g.ciclos === 0 && g.comp === 1 ? "es un árbol." : (g.comp > 1 ? "es un bosque de " + g.comp + " árboles." : "tiene " + g.ciclos + " ciclo" + (g.ciclos === 1 ? "" : "s") + " y no es árbol."))
        : buenas + " de " + E.PREGUNTAS.length + " cuentas correctas.";
    }

    var caja = el("casos");
    el("total").textContent = E.CASOS.length;
    E.CASOS.forEach(function (it, i) { caja.appendChild(carta(it, i)); });

    el("presets").innerHTML = "<span class='nota' style='margin-top:0'>Grafo:</span>" +
      E.GRAFOS.map(function (g, t) {
        return "<button data-i='" + t + "' class='" + (t === 0 ? "primario" : "") + "'>" + g.boton + "</button>";
      }).join("");
    Array.prototype.forEach.call(el("presets").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        idx = parseInt(b.getAttribute("data-i"), 10);
        Array.prototype.forEach.call(el("presets").querySelectorAll("button"), function (x) { x.classList.remove("primario"); });
        b.classList.add("primario");
        dibujar();
      });
    });
    el("btn-cuentas").addEventListener("click", comprobar);
    dibujar();
  })();
}
