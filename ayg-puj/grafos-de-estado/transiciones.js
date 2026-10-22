/* Ejercicio interactivo: decidir que transiciones salen de un estado. */
var LIB = (typeof module !== "undefined") ? require("./lib.js") : VILLA;

var EJERCICIO = (function () {
  var PROBLEMAS = [
    { r: 3, puertas: [[1, 2], [1, 3]], interruptores: [[1, 2], [1, 3], [2, 3], [3, 2]], h: 1, luz: 5 },
    { r: 3, puertas: [[1, 2], [2, 3], [1, 3]], interruptores: [[1, 3], [3, 2], [2, 1], [1, 2], [3, 3]], h: 3, luz: 6 },
    { r: 3, puertas: [[1, 2], [2, 3], [1, 3]], interruptores: [[1, 2], [2, 3], [3, 1], [2, 1]], h: 2, luz: 3 },
    { r: 4, puertas: [[1, 2], [2, 3], [3, 4]], interruptores: [[1, 2], [2, 3], [3, 4], [4, 3], [3, 2], [2, 1]], h: 3, luz: 14 },
    { r: 4, puertas: [[1, 2], [1, 3], [2, 4]], interruptores: [[1, 3], [3, 2], [2, 4], [4, 1], [3, 4]], h: 2, luz: 10 }
  ];
  PROBLEMAS.forEach(function (p) { p.V = LIB.crear(p); });

  /* Todas las filas: moverse a cada habitacion distinta de h y cambiar cada luz. */
  function candidatas(p) {
    var c = [], i = 1;
    while (i <= p.r) { if (i !== p.h) { c.push({ tipo: "move", i: i }); } i = i + 1; }
    i = 1;
    while (i <= p.r) { c.push({ tipo: "luz", i: i }); i = i + 1; }
    return c;
  }

  /* Decide la transicion: {valida, pos, luz, razon}. La razon dice la condicion
     que falla, o por que si se puede. */
  function decidir(p, c) {
    var V = p.V, h = p.h, L = p.luz, i = c.i, res;
    if (c.tipo === "move") {
      if (!V.puerta[h][i]) {
        res = { valida: false, razon: "No hay puerta entre la " + h + " y la " + i + ": roomAdj[" + h + "][" + i + "] es falso." };
      } else if (!LIB.prendida(L, i)) {
        res = { valida: false, razon: "Hay puerta, pero la habitación " + i + " está a oscuras: el bit " + (i - 1) + " de la máscara " + L + " es 0, y no se entra a una habitación sin luz." };
      } else {
        res = { valida: true, pos: i, luz: L, razon: "Hay puerta y la luz " + i + " está prendida. Se llega a la " + i + " con las mismas luces, máscara " + L + "." };
      }
    } else if (i === h) {
      if (V.inter[h][i]) {
        res = { valida: false, razon: "Hay un interruptor, pero cambiaría la luz de la habitación donde se está, y el código lo descarta con i != curr.pos." };
      } else {
        res = { valida: false, razon: "No hay interruptor en la " + h + " que controle la luz " + i + ", y además es la habitación donde se está." };
      }
    } else if (!V.inter[h][i]) {
      res = { valida: false, razon: "En la habitación " + h + " no hay interruptor para la luz " + i + ": lightAdj[" + h + "][" + i + "] es falso." };
    } else {
      var n = L ^ LIB.bit(i);
      res = { valida: true, pos: h, luz: n, razon: "Hay interruptor en la " + h + " para la luz " + i + ". " + L + " ^ " + LIB.bit(i) + " = " + n +
              ": la luz " + i + (n > L ? " se prende." : " se apaga.") };
    }
    return res;
  }

  /* Evalua una fila. marca: el estudiante la dio por valida; pos, luz: lo que escribio. */
  function evaluarFila(p, c, marca, pos, luz) {
    var d = decidir(p, c), ok, msg;
    if (!d.valida) {
      ok = !marca;
      msg = ok ? "Bien. " + d.razon : "No es válida. " + d.razon;
    } else if (!marca) {
      ok = false;
      msg = "Sí es válida. " + d.razon;
    } else if (pos === d.pos && luz === d.luz) {
      ok = true;
      msg = "Bien. " + d.razon;
    } else {
      ok = false;
      msg = "Es válida, pero el estado no es ese: es " + LIB.etiqueta(d.pos, d.luz, p.r) + " con máscara " + d.luz + " (" + LIB.bin(d.luz, p.r) + "). " + d.razon;
    }
    return { ok: ok, msg: msg };
  }

  function nombre(c) { return c.tipo === "move" ? "Moverse a la habitación " + c.i : "Cambiar la luz de la habitación " + c.i; }

  return { problemas: PROBLEMAS, candidatas: candidatas, decidir: decidir, evaluarFila: evaluarFila, nombre: nombre };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var idx = 0;
    function el(id) { return document.getElementById(id); }
    function mostrar() {
      var p = EJERCICIO.problemas[idx], d = LIB.describir(p), html = "", cands = EJERCICIO.candidatas(p);
      el("num").textContent = idx + 1;
      el("total").textContent = EJERCICIO.problemas.length;
      el("dibujo").innerHTML = LIB.dibujar(p.V, p.luz, p.h);
      el("puertas").textContent = d.puertas;
      el("inter").textContent = d.inter;
      el("estado").textContent = LIB.etiqueta(p.h, p.luz, p.r);
      el("mascara").textContent = p.luz;
      el("binario").textContent = LIB.bin(p.luz, p.r);
      cands.forEach(function (c, k) {
        html += '<div class="fila-tr" id="fila-' + k + '"><div>' + EJERCICIO.nombre(c) + '</div>' +
                '<label><input type="checkbox" id="m-' + k + '"> válida</label>' +
                '<div class="res">hab. <input class="mini" type="number" id="p-' + k + '" disabled> máscara <input class="mini" type="number" id="l-' + k + '" disabled></div>' +
                '<div class="fb" id="fb-' + k + '"></div></div>';
      });
      el("filas").innerHTML = html;
      cands.forEach(function (c, k) {
        el("m-" + k).addEventListener("change", function () {
          el("p-" + k).disabled = !el("m-" + k).checked;
          el("l-" + k).disabled = !el("m-" + k).checked;
        });
      });
      el("veredicto").className = "veredicto"; el("veredicto").textContent = "";
      var sel = "";
      EJERCICIO.problemas.forEach(function (q, k) { sel += '<button data-k="' + k + '"' + (k === idx ? ' class="primario"' : "") + ">Problema " + (k + 1) + "</button>"; });
      el("selector").innerHTML = sel;
      Array.prototype.forEach.call(el("selector").querySelectorAll("button"), function (b) {
        b.addEventListener("click", function () { idx = parseInt(b.getAttribute("data-k"), 10); mostrar(); });
      });
    }
    el("btn-comprobar").addEventListener("click", function () {
      var p = EJERCICIO.problemas[idx], cands = EJERCICIO.candidatas(p), bien = 0;
      cands.forEach(function (c, k) {
        var r = EJERCICIO.evaluarFila(p, c, el("m-" + k).checked, parseInt(el("p-" + k).value, 10), parseInt(el("l-" + k).value, 10));
        el("fb-" + k).className = "fb " + (r.ok ? "bien" : "mal");
        el("fb-" + k).textContent = r.msg;
        if (r.ok) { bien = bien + 1; }
      });
      el("veredicto").className = "veredicto " + (bien === cands.length ? "bien" : "mal");
      el("veredicto").textContent = bien === cands.length ? "Todas las filas están bien." : bien + " de " + cands.length + " filas bien. Revise las marcadas en rojo.";
    });
    el("btn-limpiar").addEventListener("click", mostrar);
    mostrar();
  })();
}
