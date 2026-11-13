/* Ejercicio interactivo: Bellman-Ford-Moore con cola (bfm5.cpp).
   La simulacion vive en bfm-lib.js y reproduce bellmanFordOpt linea por linea. */
var LIB = (typeof module !== "undefined") ? require("./bfm-lib.js") : { BFM: BFM, DIB: DIB };

var EJERCICIO = (function () {
  var B = LIB.BFM;
  var CODIGO = B.armarCodigo("bfm5");

  var GRAFOS = [
    { boton: "Seis vértices, un vértice sale cuatro veces",
      texto: "Seis vértices, fuente 0. El vértice 5 se alcanza por dos caminos de distinto peso y su d baja cada vez que llega un camino mejor.",
      n: 6, s: 0,
      aristas: [[4, 2, -1], [0, 2, 7], [2, 5, 6], [0, 1, 3], [1, 4, -3], [2, 3, 1], [3, 5, 4], [4, 1, 5]],
      pos: [[0.0, 1.5], [1.9, 2.9], [1.9, 0.1], [3.6, 0.1], [3.6, 2.9], [5.3, 1.5]] },
    { boton: "Seis vértices, un triángulo",
      texto: "Seis vértices, fuente 0. Los vértices 1, 2 y 3 forman un ciclo de peso positivo, y 2 y 3 salen de la cola más de una vez.",
      n: 6, s: 0,
      aristas: [[0, 2, 8], [0, 4, -1], [4, 2, 8], [2, 3, 6], [1, 2, -1], [4, 1, 1], [1, 5, 6], [3, 1, 2]],
      pos: [[0.0, 1.5], [3.4, 0.1], [3.4, 2.9], [5.2, 2.9], [1.6, 2.9], [5.2, 0.1]] },
    { boton: "Seis vértices, uno aislado",
      texto: "Seis vértices, fuente 0. El vértice 5 no tiene aristas: no entra nunca a la cola y su d se queda en INT_MAX.",
      n: 6, s: 0,
      aristas: [[3, 4, 5], [0, 4, 7], [2, 1, 7], [2, 4, 5], [0, 3, -2], [3, 2, -3]],
      pos: [[0.0, 1.5], [5.1, 0.1], [3.4, 0.1], [1.7, 1.5], [3.4, 2.9], [5.1, 2.9]] }
  ];
  GRAFOS.forEach(function (g) { g.G = B.construir(g.n, g.aristas); });

  function simular(params) { return B.simular("bfm5", params.G, params.s); }

  /* dado: arreglo con lo que escribio el estudiante (null si falta). */
  function evaluar(dado, g) {
    var r = B.resumen("bfm5", g.G, g.s), bien = [], mal = [], falta = false, v = 0, res;
    while (v < g.n) {
      if (dado[v] === null) { falta = true; }
      else if (dado[v] === r.salen[v]) { bien.push(v); }
      else { mal.push(v); }
      v = v + 1;
    }
    if (falta) {
      res = { ok: false, msg: "Escoja una opción para cada vértice. Si cree que uno nunca sale, es un 0." };
    } else if (mal.length === 0) {
      res = { ok: true, msg: "Correcto. El orden de salida es " + r.extraidos.join(", ") + ": " + r.extraidos.length + " salidas en total. Un vértice sale una vez por cada vez que entró a la cola, y entra cuando su d baja y no está esperando; la fuente entra además al principio." };
    } else {
      var algunoBajo = false, algunoAlto = false;
      mal.forEach(function (x) { if (dado[x] < r.salen[x]) { algunoBajo = true; } else { algunoAlto = true; } });
      res = { ok: false, msg: "No coinciden los vértices " + mal.join(", ") + ". " +
        (algunoBajo ? "Un vértice vuelve a entrar a la cola cada vez que su d baja y ya no está esperando; revise si a alguno le llega un camino mejor después de haber salido. " : "") +
        (algunoAlto ? "Si un vértice ya está en la cola cuando su d baja, enCola evita que entre otra vez: no hay una salida por cada mejora." : "") };
    }
    return res;
  }

  return { codigo: CODIGO, grafos: GRAFOS, simular: simular, evaluar: evaluar, resumen: B.resumen };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var B = LIB.BFM, F = B.fmt, presetActual = 0;
    function g() { return EJERCICIO.grafos[presetActual]; }
    function paramsActuales() { return { G: g().G, s: g().s }; }
    function par(p, a, b) { return p && p[0] === a && p[1] === b; }
    function pesoDe(u, v) {
      var k = 0, w = null;
      while (k < g().aristas.length) { if (g().aristas[k][0] === u && g().aristas[k][1] === v) { w = g().aristas[k][2]; } k = k + 1; }
      return w;
    }

    function dibujar(a) {
      var p = g(), nom = [], i = 0;
      while (i < p.n) { nom.push(String(i)); i = i + 1; }
      var listo = a && a.linea >= 39;
      document.getElementById("panel-grafo").innerHTML = LIB.DIB.dibujar({
        pos: p.pos, G: p.G.map(function (l) { return l.map(function (e) { return e[0]; }); }),
        nombres: nom, peso: pesoDe,
        nodo: function (k) {
          var s = { relleno: k === p.s ? "#e7f2e8" : "#ffffff", borde: k === p.s ? "#2e7d32" : "#6b7280", tinta: "#24292f", grueso: 2.2, nota: "" };
          if (listo) {
            s.nota = F(a.d[k]) + "/" + (a.p[k] === -1 ? "–" : a.p[k]);
            if (a.d[k] !== B.INT_MAX) { s.relleno = k === p.s ? "#e7f2e8" : "#e3edf8"; s.borde = k === p.s ? "#2e7d32" : "#1f5fa8"; }
            if (a.enCola[k]) { s.relleno = "#ffe9a8"; s.borde = "#e8a13d"; }
            if (a.linea >= 44 && a.u === k) { s.grueso = 4.4; s.borde = "#24292f"; }
          }
          return s;
        },
        arista: function (u, v) {
          var e = { color: "gris", grueso: 1.6 };
          if (listo && a.p[v] === u && a.d[v] !== B.INT_MAX) { e = { color: "morado", grueso: 2.6 }; }
          if (a && par(a.cambia, u, v)) { e = { color: "verde", grueso: 3.2 }; }
          else if (a && par(a.mira, u, v)) { e = { color: "azul", grueso: 3.0 }; }
          return e;
        }
      });
    }

    function alPintar(e) {
      var a = e.actual, p = g(), n = p.n;
      dibujar(a);
      document.getElementById("ver-cola").textContent = a && a.cola.length > 0 ? "[" + a.cola.join(", ") + "]" : "[ ]";
      document.getElementById("ver-salida").textContent = a && a.hecho ? a.resultado.salida : "";
      var filas = "", i = 0, salidas = [];
      if (a) {
        salidas = ceros(n);
        e.pasos.slice(0, e.k).forEach(function (q) { if (q.linea === 44) { salidas[q.u] = salidas[q.u] + 1; } });
      }
      while (i < n) {
        var enCola = a && a.linea >= 35 ? (a.enCola[i] ? "true" : "false") : "–";
        filas += "<tr><td>" + i + "</td><td>" + (a && a.linea >= 34 ? F(a.d[i]) : "–") + "</td><td>" + (a && a.linea >= 33 ? a.p[i] : "–") + "</td><td>" + enCola + "</td><td>" +
                 (a && a.linea >= 36 ? a.conteo[i] : "–") + "</td><td>" + (a ? salidas[i] : "–") + "</td></tr>";
        i = i + 1;
      }
      document.getElementById("cuerpo-tabla").innerHTML = filas;
      var obs = document.getElementById("observacion");
      if (a && a.hecho) {
        obs.className = "veredicto bien";
        obs.textContent = "La cola se vació con ans en true. Hubo " + a.resultado.extraidos.length + " salidas de la cola, en este orden: " + a.resultado.extraidos.join(", ") + ".";
      } else { obs.className = "veredicto"; obs.textContent = ""; }
    }
    function ceros(n) { var r = [], i = 0; while (i < n) { r.push(0); i = i + 1; } return r; }

    var dado = [], manejadores = [];

    function entrantes(G, v) {
      var c = 0;
      G.forEach(function (l) { l.forEach(function (e) { if (e[0] === v) { c = c + 1; } }); });
      return c;
    }

    function opcionesDe(v, params) {
      var r = B.resumen("bfm5", params.G, params.s), s = r.salen[v];
      var ent = entrantes(params.G, v), lista = [], vistos = {};
      function agregar(valor, clave, razon) {
        if (valor >= 0 && !vistos[valor]) { vistos[valor] = true; lista.push({ valor: valor, clave: clave, razon: razon }); }
      }
      agregar(s, "correcta", "Correcto: el vértice " + v + " sale " + s + (s === 1 ? " vez" : " veces") +
        ". Sale una vez por cada vez que entró a la cola, y entra cuando su d baja y no está esperando; la fuente entra además al principio.");
      agregar(1, "una", "Una sola salida supone que cada vértice entra a la cola una vez, como en BFS. Aquí d puede bajar después de que el vértice salió, y entonces vuelve a entrar.");
      agregar(ent, "entrantes", "Ese es el número de aristas que llegan al vértice " + v + ". Una arista que llega no siempre baja d, y si el vértice ya está en la cola, enCola evita que entre otra vez.");
      agregar(s - 1, "menos", params.s === v
        ? "Falta la salida inicial de la fuente: entra a la cola antes del ciclo, y además puede reentrar si algún camino le baja d."
        : "Se escapó una reentrada: revise si llega un camino mejor después de que el vértice ya salió de la cola.");
      agregar(r.extraidos.length, "total", "Ese es el total de salidas de todos los vértices juntos, no las del vértice " + v + ".");
      agregar(s + 1, "mas", "Es una salida de más: una mejora de d con el vértice ya esperando en la cola no produce otra salida, porque enCola lo impide.");
      return lista.slice(0, 4);
    }

    function armarPredicciones() {
      var html = "", i = 0;
      while (i < g().n) {
        html += "<div class='celda-pred' data-v='" + i + "'><label>vértice " + i + "</label>" +
                "<div class='opciones' id='opciones-sale-" + i + "'></div>" +
                "<div class='veredicto' id='veredicto-sale-" + i + "'></div></div>";
        i = i + 1;
      }
      document.getElementById("preds").innerHTML = html;
      i = 0;
      while (i < g().n) {
        if (manejadores[i]) { manejadores[i].refrescar(); }
        else { manejadores[i] = cablear(i); }
        i = i + 1;
      }
    }

    function cablear(v) {
      return Motor.opcionesNumericas("opciones-sale-" + v, "veredicto-sale-" + v, function (params) {
        dado[v] = null;
        return opcionesDe(v, params);
      });
    }

    function preparar() {
      document.getElementById("ver-texto").textContent = g().texto;
      armarPredicciones();
      Motor.limpiarVeredicto();
    }

    Motor.iniciar({
      codigo: EJERCICIO.codigo, simular: EJERCICIO.simular,
      chips: [{ campo: "u", rotulo: "u" }, { campo: "v", rotulo: "v" }, { campo: "peso", rotulo: "peso" }, { campo: "ans", rotulo: "ans" }],
      paramsIniciales: paramsActuales(), alPintar: alPintar
    });
    document.getElementById("preds").addEventListener("click", function (ev) {
      var b = ev.target, celda = b.closest ? b.closest(".celda-pred") : null;
      if (celda && b.getAttribute("data-op") !== null) { dado[parseInt(celda.getAttribute("data-v"), 10)] = parseInt(b.textContent, 10); }
    });
    preparar();

    document.getElementById("btn-comprobar").addEventListener("click", function () {
      var v = document.getElementById("veredicto"), dados = [], i = 0;
      while (i < g().n) { dados.push(dado[i] === undefined ? null : dado[i]); i = i + 1; }
      var r = EJERCICIO.evaluar(dados, g());
      v.className = r.ok ? "veredicto bien" : "veredicto mal";
      v.textContent = r.msg;
    });

    Array.prototype.forEach.call(document.querySelectorAll("#presets-grafo button"), function (btn) {
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(document.querySelectorAll("#presets-grafo button"), function (b) { b.classList.remove("primario"); });
        btn.classList.add("primario");
        presetActual = parseInt(btn.getAttribute("data-preset"), 10);
        preparar();
        Motor.reiniciar(paramsActuales());
      });
    });
  })();
}
