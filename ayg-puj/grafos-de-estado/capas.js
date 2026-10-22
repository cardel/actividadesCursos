/* Ejercicio interactivo: predecir las capas del grafo de estados. */
var LIB = (typeof module !== "undefined") ? require("./lib.js") : VILLA;

var EJERCICIO = (function () {
  var VILLAS = [
    { nombre: "Dos puertas desde la 1", r: 3, puertas: [[1, 2], [1, 3]], interruptores: [[1, 2], [1, 3], [2, 3], [3, 2]] },
    { nombre: "Triángulo", r: 3, puertas: [[1, 2], [2, 3], [1, 3]], interruptores: [[1, 2], [2, 3], [3, 1], [2, 1]] },
    { nombre: "Cuatro habitaciones en fila", r: 4, puertas: [[1, 2], [2, 3], [3, 4]],
      interruptores: [[1, 2], [2, 3], [3, 4], [4, 3], [3, 2], [2, 1]] }
  ];
  VILLAS.forEach(function (v) { v.V = LIB.crear(v); v.G = LIB.capas(v.V); });

  /* Los estados de la capa k como claves (h, mascara). */
  function capa(v, k) {
    return k < v.G.porCapa.length ? v.G.porCapa[k].map(function (id) { return v.G.estados[id]; }) : [];
  }

  /* Compara lo marcado (lista de {pos, luz}) con la capa k. Devuelve faltan,
     sobran (cada uno con su razon) y ok. */
  function comprobar(v, k, marcados) {
    var real = capa(v, k), claveReal = {}, claveMarca = {}, faltan = [], sobran = [];
    real.forEach(function (e) { claveReal[LIB.clave(e.pos, e.luz)] = e; });
    marcados.forEach(function (m) { claveMarca[LIB.clave(m.pos, m.luz)] = true; });
    real.forEach(function (e) {
      if (!claveMarca[LIB.clave(e.pos, e.luz)]) {
        var padre = v.G.estados[e.padre];
        faltan.push({ pos: e.pos, luz: e.luz, razon: "sale de " + LIB.etiqueta(padre.pos, padre.luz, v.V.r) + ": " + LIB.textoEs(e.accion) });
      }
    });
    marcados.forEach(function (m) {
      var id = v.G.visto[LIB.clave(m.pos, m.luz)], razon;
      if (claveReal[LIB.clave(m.pos, m.luz)]) { return; }
      if (id === undefined) {
        razon = "ninguna secuencia de pasos desde (1, {1}) llega a él";
      } else if (v.G.estados[id].d < k) {
        razon = "ya estaba en la capa " + v.G.estados[id].d + ", y un estado se descubre una sola vez";
      } else {
        razon = "se alcanza, pero hasta la capa " + v.G.estados[id].d + ", no en " + k + " pasos";
      }
      sobran.push({ pos: m.pos, luz: m.luz, razon: razon });
    });
    return { ok: faltan.length === 0 && sobran.length === 0, faltan: faltan, sobran: sobran };
  }

  function total(v) { return v.G.estados.length; }

  return { villas: VILLAS, capa: capa, comprobar: comprobar, total: total };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var idx = 0, k = 1, marcas = {}, confirmadas = [];
    function el(id) { return document.getElementById(id); }
    function v() { return EJERCICIO.villas[idx]; }
    function etq(pos, luz) { return LIB.etiqueta(pos, luz, v().V.r); }

    function conjuntosOrdenados() {
      var r = v().V.r, a = [], m = 0;
      while (m < (1 << r)) { a.push(m); m = m + 1; }
      return a;
    }

    function pintarRejilla() {
      var r = v().V.r, h, html = "<tr><th>habitación \\ luces</th>", metaClave = LIB.clave(r, LIB.bit(r));
      var yaClaves = {};
      confirmadas.forEach(function (cap) { cap.forEach(function (e) { yaClaves[LIB.clave(e.pos, e.luz)] = true; }); });
      yaClaves[LIB.clave(1, 1)] = true;
      conjuntosOrdenados().forEach(function (m) {
        html += "<th title='" + LIB.bin(m, r) + "'>" + (LIB.conjunto(m, r).join("") || "∅") + "<br><small>" + m + "</small></th>";
      });
      html += "</tr>";
      for (h = 1; h <= r; h = h + 1) {
        html += "<tr><th>" + h + "</th>";
        conjuntosOrdenados().forEach(function (m) {
          var c = LIB.clave(h, m), cls = "";
          if (yaClaves[c]) { cls = "capa-ya"; } else if (marcas[c]) { cls = "marca"; }
          if (c === metaClave) { cls += " meta"; }
          html += "<td><button class='" + cls + "' data-h='" + h + "' data-m='" + m + "'" + (yaClaves[c] ? " disabled" : "") + ">" +
                  (yaClaves[c] ? "✓" : (marcas[c] ? "●" : "·")) + "</button></td>";
        });
        html += "</tr>";
      }
      el("rejilla").innerHTML = html;
      Array.prototype.forEach.call(el("rejilla").querySelectorAll("button:not([disabled])"), function (b) {
        b.addEventListener("click", function () {
          var c = LIB.clave(parseInt(b.getAttribute("data-h"), 10), parseInt(b.getAttribute("data-m"), 10));
          if (marcas[c]) { delete marcas[c]; } else { marcas[c] = true; }
          pintarRejilla();
        });
      });
    }

    function marcados() {
      var res = [];
      Object.keys(marcas).forEach(function (c) { res.push({ pos: Math.floor(parseInt(c, 10) / 4096), luz: parseInt(c, 10) % 4096 }); });
      return res;
    }

    function listaConfirmada() {
      var html = "";
      confirmadas.forEach(function (cap, n) {
        html += "<div class='capa-ok'><b>Capa " + (n + 1) + ":</b> " + cap.map(function (e) {
          var padre = v().G.estados[e.padre];
          return etq(e.pos, e.luz) + " <small>(desde " + etq(padre.pos, padre.luz) + ", " + LIB.textoEs(e.accion) + ")</small>";
        }).join("; ") + "</div>";
      });
      el("confirmadas").innerHTML = html === "" ? "Todavía ninguna. La capa 0 es solo (1, {1})." : html;
    }

    function prepararVilla() {
      var d = LIB.describir(v()), sel = "";
      EJERCICIO.villas.forEach(function (q, n) { sel += '<button data-k="' + n + '"' + (n === idx ? ' class="primario"' : "") + ">" + q.nombre + "</button>"; });
      el("selector").innerHTML = sel;
      Array.prototype.forEach.call(el("selector").querySelectorAll("button"), function (b) {
        b.addEventListener("click", function () { idx = parseInt(b.getAttribute("data-k"), 10); prepararVilla(); });
      });
      el("dibujo").innerHTML = LIB.dibujar(v().V, null, null);
      el("puertas").textContent = d.puertas;
      el("inter").textContent = d.inter;
      el("meta").textContent = etq(v().V.r, LIB.bit(v().V.r));
      k = 1; marcas = {}; confirmadas = [];
      el("capa").textContent = k;
      el("veredicto").className = "veredicto"; el("veredicto").textContent = "";
      el("cierre").className = "veredicto"; el("cierre").textContent = "";
      listaConfirmada(); pintarRejilla();
    }

    function avanzar() {
      confirmadas.push(EJERCICIO.capa(v(), k));
      k = k + 1; marcas = {};
      el("capa").textContent = k;
      listaConfirmada(); pintarRejilla();
    }

    el("btn-comprobar").addEventListener("click", function () {
      var r = EJERCICIO.comprobar(v(), k, marcados()), msg = [], ve = el("veredicto");
      if (r.ok) {
        if (EJERCICIO.capa(v(), k).length === 0) {
          ve.className = "veredicto bien";
          ve.textContent = "Correcto: la capa " + k + " está vacía, la búsqueda se agota.";
          var c = el("cierre"), mid = v().G.meta;
          c.className = "veredicto " + (mid >= 0 ? "bien" : "mal");
          c.textContent = "Se descubrieron " + EJERCICIO.total(v()) + " estados. " + (mid >= 0
            ? "La meta está en la capa " + v().G.estados[mid].d + ": la solución tiene " + v().G.estados[mid].d + " pasos."
            : "La meta no es uno de ellos: no tiene solución.");
        } else {
          ve.className = "veredicto bien";
          ve.textContent = "Correcto: la capa " + k + " tiene " + EJERCICIO.capa(v(), k).length + " estado" + (EJERCICIO.capa(v(), k).length === 1 ? "" : "s") + ". Siga con la capa " + (k + 1) + ".";
          avanzar();
        }
      } else {
        if (r.faltan.length > 0) { msg.push("Faltan: " + r.faltan.map(function (f) { return etq(f.pos, f.luz) + " (" + f.razon + ")"; }).join("; ") + "."); }
        if (r.sobran.length > 0) { msg.push("Sobran: " + r.sobran.map(function (f) { return etq(f.pos, f.luz) + " (" + f.razon + ")"; }).join("; ") + "."); }
        ve.className = "veredicto mal"; ve.textContent = msg.join(" ");
      }
    });
    el("btn-mostrar").addEventListener("click", function () {
      marcas = {};
      EJERCICIO.capa(v(), k).forEach(function (e) { marcas[LIB.clave(e.pos, e.luz)] = true; });
      pintarRejilla();
    });
    el("btn-vaciar").addEventListener("click", function () { marcas = {}; pintarRejilla(); });
    prepararVilla();
  })();
}
