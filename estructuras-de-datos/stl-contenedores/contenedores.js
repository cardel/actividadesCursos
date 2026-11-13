/* Ejercicio interactivo: stack y queue. */
var EJERCICIO = (function () {
  var PROGRAMA = [["push", 4], ["push", 7], ["pop"], ["push", 2]];
  var CORRESPONDENCIA = { apilar: "push", desapilar: "pop", tope: "top", frente: "front", vacia: "empty" };

  function simularStack(ops) {
    var s = [];
    ops.forEach(function (op) {
      if (op[0] === "push") { s.push(op[1]); } else { s.pop(); }
    });
    return { top: s[s.length - 1], size: s.length };
  }

  return { programa: PROGRAMA, correspondencia: CORRESPONDENCIA, simularStack: simularStack };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    function pintarCodigo(id, lineas) {
      var caja = document.getElementById(id);
      lineas.forEach(function (par, i) {
        var linea = document.createElement("div");
        linea.className = "linea" + (par[1] ? " " + par[1] : "");
        var num = document.createElement("span");
        num.className = "num";
        num.textContent = i + 1;
        var txt = document.createElement("span");
        txt.className = "txt";
        txt.textContent = par[0];
        linea.appendChild(num);
        linea.appendChild(txt);
        caja.appendChild(linea);
      });
    }
    pintarCodigo("codigo-stack", [
      ["stack<int> s;", ""],
      ["s.push(4);", "bloque-1"],
      ["s.push(7);", "bloque-1"],
      ["s.pop();", "bloque-2"],
      ["s.push(2);", "bloque-1"],
      ["printf(\"%d %d\\n\", s.top(), (int) s.size());", "bloque-3"]
    ]);

    var logradas = { stack: false, nombres: false };
    function sinRepetir(lista) {
      var vistos = {};
      return lista.filter(function (o) {
        var nuevo = !vistos[String(o.valor)];
        vistos[String(o.valor)] = true;
        return nuevo;
      });
    }
    function alAcertar(id, f) {
      document.getElementById(id).addEventListener("click", function (e) {
        if (e.target && e.target.getAttribute && e.target.getAttribute("data-op") === "correcta") { f(); }
      });
    }
    function revisar() {
      if (logradas.stack && logradas.nombres) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    Motor.opcionesNumericas("opciones-stack", "veredicto-stack", function () {
      var r = EJERCICIO.simularStack(EJERCICIO.programa);
      var apilados = EJERCICIO.programa.filter(function (op) { return op[0] === "push"; });
      var sacado = apilados[1][1];
      var fondo = apilados[0][1];
      return sinRepetir([
        { valor: r.top + " " + r.size, clave: "correcta",
          razon: "Correcto: " + r.top + " " + r.size + ". El pop quitó al 7 sin devolverlo; el 4 sigue abajo y el 2 quedó en el tope." },
        { valor: sacado + " " + r.size, clave: "popdevuelve",
          razon: "El 7 fue el que salió con pop. pop no devuelve nada: solo quita el tope." },
        { valor: r.top + " " + apilados.length, clave: "sinpop",
          razon: "Entraron tres y salió uno: quedan dos." },
        { valor: fondo + " " + r.size, clave: "fondo",
          razon: "El 4 es el primero que entró, el que está abajo. top mira el último que entró, que es el 2." }
      ]);
    });
    alAcertar("opciones-stack", function () { logradas.stack = true; revisar(); });

    var selects = document.querySelectorAll("#nombres select");
    document.getElementById("btn-nombres").addEventListener("click", function () {
      var v = document.getElementById("veredicto-nombres");
      var malas = [];
      selects.forEach(function (sel) {
        if (sel.value !== EJERCICIO.correspondencia[sel.dataset.op]) { malas.push(sel.dataset.op); }
      });
      if (malas.length === 0) {
        v.className = "veredicto bien";
        v.textContent = "Correcto. Fíjese en que push y pop se llaman igual en stack y en queue: solo cambian top por front, y el contrato decide por dónde sale.";
        logradas.nombres = true;
        revisar();
      } else {
        v.className = "veredicto mal";
        v.textContent = "Revise: " + malas.join(", ") + ". Piense en qué hace cada una, no en cómo suena.";
      }
    });
  })();
}
