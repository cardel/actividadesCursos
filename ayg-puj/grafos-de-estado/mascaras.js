/* Ejercicio interactivo: operaciones con bits sobre la mascara de luces.
   Cuatro luces; la luz de la habitacion i es el bit i - 1. */
var EJERCICIO = (function () {
  var R = 4;
  var ESCENARIOS = [
    { op: "shift", luz: 0, i: 3 },
    { op: "shift", luz: 0, i: 4 },
    { op: "and", luz: 10, i: 2 },
    { op: "and", luz: 10, i: 3 },
    { op: "and", luz: 7, i: 4 },
    { op: "and", luz: 13, i: 4 },
    { op: "xor", luz: 6, i: 1 },
    { op: "xor", luz: 11, i: 2 },
    { op: "xor", luz: 1, i: 4 },
    { op: "xor", luz: 15, i: 3 }
  ];

  function bit(i) { return 1 << (i - 1); }
  function bin(n) {
    var s = "", k = R - 1;
    while (k >= 0) { s = s + (((n >> k) & 1) === 1 ? "1" : "0"); k = k - 1; }
    return s;
  }
  function conjunto(L) {
    var a = [], i = 1;
    while (i <= R) { if ((L & bit(i)) !== 0) { a.push(i); } i = i + 1; }
    return "{" + a.join(",") + "}";
  }

  function resultado(e) {
    var res;
    if (e.op === "shift") { res = bit(e.i); }
    else if (e.op === "and") { res = e.luz & bit(e.i); }
    else { res = e.luz ^ bit(e.i); }
    return res;
  }

  function expresion(e) {
    var res;
    if (e.op === "shift") { res = "1 << " + e.i + " - 1"; }
    else if (e.op === "and") { res = "luz & (1 << " + e.i + " - 1)"; }
    else { res = "luz ^ (1 << " + e.i + " - 1)"; }
    return res;
  }

  function enunciado(e) {
    var res;
    if (e.op === "shift") {
      res = "Se quiere la máscara que tiene prendida solo la luz de la habitación " + e.i + ". ¿Cuánto vale?";
    } else if (e.op === "and") {
      res = "Las luces prendidas son " + conjunto(e.luz) + ", la máscara " + e.luz + ". Se pregunta si la luz de la habitación " +
            e.i + " está prendida. ¿Cuánto vale la expresión?";
    } else {
      res = "Las luces prendidas son " + conjunto(e.luz) + ", la máscara " + e.luz + ". Se cambia la luz de la habitación " +
            e.i + " con un interruptor. ¿Cuál es la máscara nueva?";
    }
    return res;
  }

  /* Retroalimentacion: reconoce los errores tipicos comparando con lo que
     habria dado la confusion. Devuelve {ok, msg}. */
  function evaluar(e, dec, bits) {
    var esperado = resultado(e), msgs = [], ok = true;
    var txtBits = String(bits).replace(/^\s+|\s+$/g, "");
    var okDec = (dec === esperado);
    var okBin = /^[01]{1,4}$/.test(txtBits) && parseInt(txtBits, 2) === esperado;
    if (!okDec) {
      ok = false;
      if (e.op === "shift" && dec === (1 << e.i)) {
        msgs.push("Ese es el valor de 1 << " + e.i + ". La luz de la habitación " + e.i + " es el bit " + (e.i - 1) + ", así que el desplazamiento es " + (e.i - 1) + ".");
      } else if (e.op === "and" && dec === (e.luz ^ bit(e.i))) {
        msgs.push("Eso es lo que da ^, que cambia la luz. El & solo conserva el bit que se pregunta y apaga todos los demás.");
      } else if (e.op === "and" && dec === 1 && esperado !== 0) {
        msgs.push("El & no da 1 sino el valor del bit que se preguntó: " + bit(e.i) + ". Solo es distinto de cero si la luz está prendida.");
      } else if (e.op === "xor" && dec === (e.luz & bit(e.i))) {
        msgs.push("Eso es lo que da &. El ^ deja intactos los demás bits y voltea solo el de la habitación " + e.i + ".");
      } else if (e.op === "xor" && dec === (e.luz | bit(e.i)) && dec !== esperado) {
        msgs.push("Con ^ la luz cambia: si estaba prendida se apaga. Un OR la dejaría prendida.");
      } else if (e.op === "xor" && dec === (e.luz ^ (1 << e.i))) {
        msgs.push("Se volteó el bit " + e.i + " y no el " + (e.i - 1) + ". La luz de la habitación " + e.i + " es el bit " + (e.i - 1) + ".");
      } else if (e.op === "and" && dec === (e.luz & (1 << e.i))) {
        msgs.push("Se preguntó por el bit " + e.i + " y no por el " + (e.i - 1) + ". La luz de la habitación " + e.i + " es el bit " + (e.i - 1) + ".");
      } else {
        msgs.push("El decimal no coincide. Escriba la máscara en binario, alinee " + (e.op === "shift" ? "el 1 en el bit " + (e.i - 1) : "el bit " + (e.i - 1) + " con la máscara") + " y opere bit a bit.");
      }
    }
    if (!okBin) {
      ok = false;
      if (!/^[01]{1,4}$/.test(txtBits)) { msgs.push("El binario son hasta cuatro cifras, 0 o 1."); }
      else if (okDec) { msgs.push("El binario no corresponde al decimal " + esperado + ": se lee " + parseInt(txtBits, 2) + ". Con cuatro cifras, la habitación 4 queda a la izquierda."); }
      else { msgs.push("El binario tampoco coincide."); }
    }
    if (ok) {
      var det;
      if (e.op === "shift") { det = "Solo el bit " + (e.i - 1) + " vale 1: " + esperado + " = " + bin(esperado) + ", la luz " + e.i + " sola."; }
      else if (e.op === "and") {
        det = bin(e.luz) + " & " + bin(bit(e.i)) + " = " + bin(esperado) + ". " +
              (esperado !== 0 ? "Distinto de cero: la luz " + e.i + " está prendida." : "Cero: la luz " + e.i + " está apagada.");
      } else {
        det = bin(e.luz) + " ^ " + bin(bit(e.i)) + " = " + bin(esperado) + ". La luz " + e.i + " " +
              (esperado > e.luz ? "se prende" : "se apaga") + "; quedan " + conjunto(esperado) + ".";
      }
      msgs.push("Correcto. " + det);
    }
    return { ok: ok, msg: msgs.join(" ") };
  }

  /* Opciones de un escenario: la correcta y los valores que da cada confusion
     tipica, sin repetir ninguno. */
  function opciones(e) {
    var esperado = resultado(e), lista = [], cand = [], det;
    if (e.op === "shift") { det = "Solo el bit " + (e.i - 1) + " vale 1: " + bin(esperado) + ", la luz " + e.i + " sola."; }
    else if (e.op === "and") {
      det = bin(e.luz) + " & " + bin(bit(e.i)) + " = " + bin(esperado) + ". " +
            (esperado !== 0 ? "Distinto de cero: la luz " + e.i + " está prendida." : "Cero: la luz " + e.i + " está apagada.");
    } else {
      det = bin(e.luz) + " ^ " + bin(bit(e.i)) + " = " + bin(esperado) + ". La luz " + e.i + " " +
            (esperado > e.luz ? "se prende" : "se apaga") + "; quedan " + conjunto(esperado) + ".";
    }
    lista.push({ valor: esperado, clave: "correcta", razon: "Correcto: " + esperado + " = " + bin(esperado) + " en binario. " + det });
    if (e.op === "shift") {
      cand.push({ valor: 1 << e.i, clave: "uno-mas",
        razon: "Ese es el valor de 1 << " + e.i + ". La luz de la habitación " + e.i + " es el bit " + (e.i - 1) + ", así que el desplazamiento es " + (e.i - 1) + "." });
      cand.push({ valor: e.i, clave: "numero-de-habitacion",
        razon: "Ese es el número de la habitación, no la máscara. La máscara tiene un 1 en el bit " + (e.i - 1) + " y ceros en los demás." });
      cand.push({ valor: bit(e.i) - 1, clave: "todas-las-anteriores",
        razon: "Eso prende todos los bits por debajo del " + (e.i - 1) + ". La máscara pedida tiene prendida solo la luz " + e.i + "." });
    } else if (e.op === "and") {
      cand.push({ valor: e.luz ^ bit(e.i), clave: "xor",
        razon: "Eso es lo que da ^, que cambia la luz. El & solo conserva el bit que se pregunta y apaga todos los demás." });
      cand.push({ valor: 1, clave: "uno",
        razon: esperado !== 0 ? "El & no da 1 sino el valor del bit que se preguntó: " + bit(e.i) + ". Solo es distinto de cero si la luz está prendida."
                             : "La luz " + e.i + " está apagada, así que el & da 0. Un 1 solo sale cuando se pregunta por la habitación 1 y está prendida." });
      cand.push({ valor: e.luz & (1 << e.i), clave: "bit-corrido",
        razon: "Se preguntó por el bit " + e.i + " y no por el " + (e.i - 1) + ". La luz de la habitación " + e.i + " es el bit " + (e.i - 1) + "." });
      cand.push({ valor: e.luz | bit(e.i), clave: "or",
        razon: "Eso es lo que da |, que prende la luz sin preguntar. El & conserva solo el bit de la habitación " + e.i + "." });
    } else {
      cand.push({ valor: e.luz & bit(e.i), clave: "and",
        razon: "Eso es lo que da &. El ^ deja intactos los demás bits y voltea solo el de la habitación " + e.i + "." });
      cand.push({ valor: e.luz | bit(e.i), clave: "or",
        razon: "Con ^ la luz cambia: si estaba prendida se apaga. Un OR la dejaría prendida." });
      cand.push({ valor: e.luz ^ (1 << e.i), clave: "bit-corrido",
        razon: "Se volteó el bit " + e.i + " y no el " + (e.i - 1) + ". La luz de la habitación " + e.i + " es el bit " + (e.i - 1) + "." });
      cand.push({ valor: e.luz, clave: "sin-cambio",
        razon: "Esa es la máscara de antes. El interruptor sí cambia la luz de la habitación " + e.i + ": el ^ voltea ese bit." });
    }
    cand.forEach(function (c) {
      var repetida = lista.some(function (o) { return o.valor === c.valor; });
      if (!repetida && lista.length < 4) { lista.push(c); }
    });
    return lista;
  }

  return { R: R, escenarios: ESCENARIOS, resultado: resultado, opciones: opciones, evaluar: evaluar, expresion: expresion, enunciado: enunciado, bin: bin, bit: bit };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var idx = 0, aciertos = 0, hechos = 0, resuelto = false, ctl = null;
    function el(id) { return document.getElementById(id); }
    function mostrar() {
      var e = EJERCICIO.escenarios[idx], html = "", i = 1;
      el("num").textContent = idx + 1;
      el("total").textContent = EJERCICIO.escenarios.length;
      if (e.op !== "shift") {
        while (i <= EJERCICIO.R) {
          html += '<div class="bombilla' + ((e.luz & EJERCICIO.bit(i)) !== 0 ? " on" : "") + '"><i></i>' + i + '<br>bit ' + (i - 1) + '</div>';
          i = i + 1;
        }
      }
      el("bombillas").innerHTML = html;
      el("enunciado").textContent = EJERCICIO.enunciado(e);
      el("expresion").textContent = EJERCICIO.expresion(e);
      resuelto = false;
      if (ctl) { ctl.refrescar(); }
      el("btn-sig").disabled = idx >= EJERCICIO.escenarios.length - 1;
    }
    ctl = Motor.opcionesNumericas("opciones-mascara", "veredicto", function () {
      return EJERCICIO.opciones(EJERCICIO.escenarios[idx]);
    });
    var caja = el("opciones-mascara");
    caja.addEventListener("click", function (ev) {
      var op = ev.target && ev.target.getAttribute ? ev.target.getAttribute("data-op") : null;
      if (op !== null && !resuelto) {
        resuelto = true; hechos = hechos + 1;
        if (op === "correcta") { aciertos = aciertos + 1; }
        el("aciertos").textContent = aciertos; el("hechos").textContent = hechos;
      }
    });
    el("btn-sig").addEventListener("click", function () {
      if (idx < EJERCICIO.escenarios.length - 1) { idx = idx + 1; mostrar(); }
    });
    mostrar();
  })();
}
