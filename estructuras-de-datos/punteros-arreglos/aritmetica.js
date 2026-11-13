/* Ejercicio interactivo: aritmetica de punteros. */
var EJERCICIO = (function () {
  var BASE = 2000;
  var VALORES = [2, 4, 6, 8, 10];

  function direccion(i) {
    return BASE + 4 * i;
  }

  /* p = A + 1; se pide *p + *(p + 2) = A[1] + A[3]. */
  function evaluar() {
    return VALORES[1] + VALORES[3];
  }

  return { base: BASE, valores: VALORES, direccion: direccion, evaluar: evaluar };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {

    /* --- Tarjeta 1: p + 1 ---------------------------------------- */
    Motor.opcionesNumericas("opciones-mas-uno", "veredicto-mas-uno",
      function () {
        return [
          { valor: EJERCICIO.base + 4, clave: "correcta",
            razon: "Correcto: sumar 1 a un int * avanza una casilla completa, " +
              "4 bytes. El compilador multiplica por sizeof(int) por nosotros." },
          { valor: EJERCICIO.base + 1, clave: "byte",
            razon: "Avanzó un byte. Un int ocupa 4: la casilla siguiente no " +
              "empieza en 2001." },
          { valor: EJERCICIO.base + 8, clave: "dos",
            razon: "Eso es p + 2: dos casillas. Se pide una sola." }
        ];
      });

    /* --- Tarjeta 2: el arreglo y el puntero ----------------------- */
    var caja = document.getElementById("arreglo-cajas");
    EJERCICIO.valores.forEach(function (val, i) {
      var c = document.createElement("div");
      c.className = "caja";
      c.style.cursor = "default";
      c.style.width = "5.6rem";
      c.id = "caja-" + i;
      var ind = document.createElement("span");
      ind.className = "indice";
      ind.style.whiteSpace = "nowrap";
      ind.textContent = "A[" + i + "] · " + EJERCICIO.direccion(i);
      c.appendChild(ind);
      c.appendChild(document.createTextNode(val));
      caja.appendChild(c);
    });

    function resaltar(indices) {
      EJERCICIO.valores.forEach(function (ignorado, i) {
        var c = document.getElementById("caja-" + i);
        if (indices.indexOf(i) >= 0) {
          c.classList.add("visitada");
        } else {
          c.classList.remove("visitada");
        }
      });
    }

    var V = EJERCICIO.valores;
    Motor.opcionesNumericas("opciones-expresion", "veredicto-expresion",
      function () {
        var esperado = EJERCICIO.evaluar();
        var candidatas = [
          { valor: esperado, clave: "correcta",
            razon: "Correcto: p apunta a A[1] = " + V[1] + " y p + 2 apunta a " +
              "A[3] = " + V[3] + "; la suma da " + esperado + ". Las casillas " +
              "usadas quedan iluminadas." },
          { valor: V[0] + V[2], clave: "desdeA0",
            razon: "A[0] + A[2] = " + (V[0] + V[2]) + ": arrancó p en A[0], " +
              "pero p es A + 1, una casilla adentro." },
          { valor: V[2] + V[4], clave: "desdeA2",
            razon: "A[2] + A[4] = " + (V[2] + V[4]) + ": corrió p una casilla " +
              "de más. p es A + 1, no A + 2." },
          { valor: V[1] + V[2], clave: "unaCasilla",
            razon: "Sumó *p con *(p + 1) = " + (V[1] + V[2]) + ". El segundo " +
              "sumando salta dos casillas desde p, no una." }
        ];
        var lista = [];
        candidatas.forEach(function (o) {
          var repetida = lista.some(function (x) { return x.valor === o.valor; });
          if (!repetida) { lista.push(o); }
        });
        return lista;
      });

    document.getElementById("opciones-expresion").addEventListener("click", function (e) {
      var t = e && e.target;
      if (t && t.getAttribute && t.getAttribute("data-op") === "correcta") {
        resaltar([1, 3]);
        document.getElementById("tabla-expresion").style.display = "block";
      }
    });

    /* --- Tarjeta 3: la resta ------------------------------------- */
    Array.prototype.forEach.call(document.querySelectorAll("#opciones-resta button"), function (btn) {
      btn.addEventListener("click", function () {
        var v = document.getElementById("veredicto-resta");
        var op = btn.getAttribute("data-op");
        if (op === "correcta") {
          v.className = "veredicto bien";
          v.textContent = "Exacto: entre dos punteros al mismo arreglo, q − p " +
            "cuenta casillas. De 2016 a 2004 hay 12 bytes, pero la resta da 3: " +
            "el compilador divide entre sizeof(int).";
        } else if (op === "bytes") {
          v.className = "veredicto mal";
          v.textContent = "Los bytes son 12, pero la resta de punteros no los " +
            "reporta: el compilador ya dividió entre el tamaño de la casilla.";
        } else {
          v.className = "veredicto mal";
          v.textContent = "Los valores no entran en esta cuenta: q − p opera " +
            "sobre direcciones. Para restar valores se escribe *q − *p.";
        }
      });
    });
  })();
}
