/* Ejercicio interactivo: el algoritmo de Prim, linea por linea.
   La simulacion vive en lib.js y reproduce prim y prim_cola (prim.py), con
   extraer_minimo recorrido vertice por vertice: el contador de la linea 15 es
   la pasada que deja esta version en |V| al cuadrado. */
var MST = (typeof module !== "undefined") ? require("./lib.js") : MST;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var GRAFOS = [
    { boton: "Seis vértices en anillo",
      texto: "Seis vértices en anillo, con 1–5 y 2–4 cruzando por dentro.",
      n: 6, raices: [0, 2, 4], alto: 290,
      aristas: [[0, 1, 7], [1, 2, 4], [2, 3, 9], [3, 4, 2], [4, 5, 6], [0, 5, 3], [1, 5, 5], [2, 4, 8]],
      pos: [[280, 40], [420, 100], [420, 205], [280, 255], [140, 205], [140, 100]] },
    { boton: "Ocho vértices, trece aristas",
      texto: "Ocho vértices y trece aristas. El vértice 7 cuelga de 5 y de 6.",
      n: 8, raices: [0, 2, 5], alto: 290,
      aristas: [[0, 1, 6], [0, 3, 4], [1, 2, 10], [1, 3, 7], [1, 4, 11], [2, 4, 5], [2, 5, 13],
                [3, 4, 8], [3, 6, 3], [4, 5, 9], [4, 6, 12], [5, 7, 2], [6, 7, 14]],
      pos: [[50, 70], [170, 45], [300, 40], [120, 185], [270, 145], [410, 95], [250, 240], [500, 200]] }
  ];
  GRAFOS.forEach(function (g) {
    g.G = MST.adyacencia(g.n, g.aristas);
    g.corridas = {};
    g.raices.forEach(function (r) {
      g.corridas[r] = { prim: MST.resumenPrim(g.G, r), cola: MST.primCola(g.G, r) };
    });
  });

  /* Evalua el orden que escribe el estudiante contra el de extraer_minimo. */
  function evaluar(texto, g, raiz) {
    var real = g.corridas[raiz].prim.orden, partes = String(texto).trim().split(/[\s,]+/);
    var dado = [], malo = false, i;
    partes.forEach(function (p) {
      if (/^\d+$/.test(p)) { dado.push(parseInt(p, 10)); } else if (p !== "") { malo = true; }
    });
    if (malo || dado.length === 0) {
      return { ok: false, msg: "Escriba los vértices como números separados por espacios." };
    }
    if (dado.join() === real.join()) {
      return { ok: true, msg: "Correcto: " + real.join(", ") + ". El árbol pesa " +
               g.corridas[raiz].prim.peso + ", el mismo desde cualquier raíz." };
    }
    i = 0;
    while (i < dado.length && i < real.length && dado[i] === real[i]) { i = i + 1; }
    if (i < real.length && i < dado.length) {
      return { ok: false, msg: (i === 0 ? "" : "Hasta el puesto " + i + " coincide. ") +
               "En el puesto " + (i + 1) + " entra el vértice " + real[i] +
               ", que es el de menor clave entre los que están afuera, y no el " + dado[i] + "." };
    }
    if (dado.length < real.length) {
      return { ok: false, msg: "Faltan vértices: después de " + dado[dado.length - 1] + " todavía entran " +
               real.slice(dado.length).join(", ") + ". Entran los " + g.n + ", porque el grafo es conexo." };
    }
    return { ok: false, msg: "Sobran vértices: el grafo tiene " + g.n + " y el orden correcto es " +
             real.join(", ") + "." };
  }

  /* Las aristas que cruzan el borde del arbol en un paso dado. */
  function borde(g, enMst) {
    var fuera = [];
    g.aristas.forEach(function (a, i) {
      if (enMst !== null && enMst[a[0]] !== null && (enMst[a[0]] === true) !== (enMst[a[1]] === true)) { fuera.push(i); }
    });
    return fuera;
  }

  return { GRAFOS: GRAFOS, evaluar: evaluar, borde: borde };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, idx = 0, raiz = 0;
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
      var G = g(), arbol = {}, cruza = {}, viva = -1;
      if (a !== null && a.padre !== null) {
        var v = 0;
        while (v < G.n) {
          if (a.padre[v] !== null && a.enMst[v] === true && a.enMst[a.padre[v]] === true) {
            arbol[indiceArista(a.padre[v], v)] = true;
          }
          v = v + 1;
        }
        E.borde(G, a.enMst).forEach(function (i) { cruza[i] = true; });
      }
      if (a !== null && a.u !== null && a.v !== null && a.linea >= 35 && a.linea <= 37) {
        viva = indiceArista(a.u, a.v);
      }
      el("panel-grafo").innerHTML = GRAFOSVG.dibujar({
        n: G.n, pos: G.pos, aristas: G.aristas, dirigido: false, alto: G.alto,
        arista: function (i) {
          if (arbol[i] === true) { return { color: "verde", grueso: 4 }; }
          if (i === viva) { return { color: "ambar", grueso: 4 }; }
          if (cruza[i] === true) { return { color: "azul", grueso: 2.6 }; }
          return { color: "claro", grueso: 2 };
        },
        nodo: function (u) {
          var s = { relleno: "#ffffff", borde: "#6b7280" };
          if (a !== null && a.clave !== null && a.clave[u] !== null) {
            s.nota = MST.fmt(a.clave[u]) + "/" + MST.pad(a.padre[u]);
            if (a.enMst[u] === true) { s.relleno = "#e7f2e8"; }
            if (a.u === u) { s.relleno = "#fdf1dc"; s.borde = "#e8a13d"; s.grueso = 3.4; }
          }
          return s;
        }
      });
    }

    function tabla(a) {
      var G = g(), s = "<tr><th>v</th><th>clave</th><th>padre</th><th>en el árbol</th><th>puesto</th></tr>", v = 0;
      while (v < G.n) {
        var dentro = a !== null && a.enMst !== null && a.enMst[v] === true;
        var puesto = a === null ? -1 : a.orden.indexOf(v);
        var baja = a !== null && a.baja && a.v === v ? " class='mejora'" : "";
        s = s + "<tr" + (a !== null && a.u === v ? " class='fila-u'" : (dentro ? " class='dentro'" : "")) +
            "><td>" + v + "</td><td" + baja + ">" +
            (a === null || a.clave === null || a.clave[v] === null ? "·" : MST.fmt(a.clave[v])) + "</td><td" + baja + ">" +
            (a === null || a.padre === null ? "·" : MST.pad(a.padre[v])) + "</td><td>" + (dentro ? "sí" : "no") +
            "</td><td>" + (puesto >= 0 ? puesto + 1 : "·") + "</td></tr>";
        v = v + 1;
      }
      el("tabla").innerHTML = s;
    }

    function cola() {
      var G = g(), c = G.corridas[raiz].cola, s = "", i = 0;
      while (i < c.salen.length) {
        var p = c.salen[i];
        s = s + "<span class='par" + (p.vieja ? " vieja" : " hecho") + "'>(" + p.par[0] + ", " + p.par[1] + ")</span> ";
        i = i + 1;
      }
      el("ver-salen").innerHTML = s;
      el("ver-entran").innerHTML = c.entran.map(function (p) {
        return "<span class='par'>(" + p[0] + ", " + p[1] + ")</span>";
      }).join(" ");
      el("cuentas-cola").innerHTML = "<table><tr><th>parejas que entran</th><th>parejas que salen</th>" +
        "<th>se descartan por viejas</th><th>peso del árbol</th></tr><tr><td>" + c.entran.length +
        "</td><td>" + c.salen.length + "</td><td>" + c.viejas + "</td><td>" + c.peso + "</td></tr></table>" +
        "<p class='nota'>Una pareja es vieja cuando su vértice ya entró al árbol con una clave más baja. " +
        "La línea 52 las descarta, y son " + c.viejas + " de las " + c.salen.length + " que salen.</p>" +
        "<p class='nota'>La búsqueda lineal recorre los " + G.n + " vértices en cada vuelta: " +
        G.corridas[raiz].prim.pasadas + " pasadas por la línea 15. La cola mueve " + c.entran.length + " parejas.</p>";
    }

    function botonesRaiz() {
      var G = g(), h = "<span class='nota' style='margin-top:0'>Raíz:</span>";
      G.raices.forEach(function (r) {
        h = h + "<button data-raiz='" + r + "'" + (r === raiz ? " class='primario'" : "") + ">" + r + "</button>";
      });
      el("presets-raiz").innerHTML = h;
      Array.prototype.forEach.call(el("presets-raiz").querySelectorAll("button"), function (b) {
        b.addEventListener("click", function () {
          raiz = parseInt(b.getAttribute("data-raiz"), 10);
          botonesRaiz();
          preparar();
          Motor.reiniciar({ g: idx, r: raiz });
        });
      });
    }

    function alPintar(e) {
      var a = e.actual;
      dibujo(a);
      tabla(a);
    }

    function preparar() {
      var G = g();
      el("ver-texto").textContent = G.texto + " Aristas: " + MST.textoAristas(G.aristas) + ".";
      el("pregunta-pred").textContent = "Escriba el orden en que los " + G.n +
        " vértices entran al árbol desde la raíz " + raiz + ", separados por espacios:";
      el("prediccion").value = "";
      Motor.limpiarVeredicto();
      cola();
    }

    Motor.iniciar({
      codigo: MST.CODIGO_PRIM,
      simular: function (p) { return MST.simPrim(E.GRAFOS[p.g].G, p.r); },
      chips: [{ campo: "u", rotulo: "u" }, { campo: "restantes", rotulo: "restantes" },
              { campo: "mejor", rotulo: "mejor" }, { campo: "v", rotulo: "v" }, { campo: "w", rotulo: "w" }],
      paramsIniciales: { g: 0, r: 0 }, alPintar: alPintar
    });
    botonesRaiz();
    preparar();

    el("btn-comprobar").addEventListener("click", function () {
      var r = E.evaluar(el("prediccion").value, g(), raiz), v = el("veredicto");
      v.className = r.ok ? "veredicto bien" : "veredicto mal";
      v.textContent = r.msg;
    });
    Array.prototype.forEach.call(document.querySelectorAll("#presets-grafo button"), function (b) {
      b.addEventListener("click", function () {
        idx = parseInt(b.getAttribute("data-preset"), 10);
        raiz = g().raices[0];
        Array.prototype.forEach.call(document.querySelectorAll("#presets-grafo button"), function (x) { x.classList.remove("primario"); });
        b.classList.add("primario");
        botonesRaiz();
        preparar();
        Motor.reiniciar({ g: idx, r: raiz });
      });
    });
  })();
}
