/* Ejercicio interactivo: el mejor tramo de UVa 507 (dos invariantes que se sostienen). */
var EJERCICIO = (function () {
  var CODIGO = [
    { txt: "def mejorTramo(A):",           num: null },
    { txt: "    N = len(A)",               num: 1 },
    { txt: "    suma = 0",                 num: 2 },
    { txt: "    mejor = 0",                num: 3 },
    { txt: "    i = 0",                    num: 4 },
    { txt: "    while i < N:",             num: 5,  bloque: 1 },
    { txt: "        suma = suma + A[i]",   num: 6,  bloque: 1 },
    { txt: "        if suma > mejor:",     num: 7,  bloque: 1 },
    { txt: "            mejor = suma",     num: 8,  bloque: 1 },
    { txt: "        if suma < 0:",         num: 9,  bloque: 1 },
    { txt: "            suma = 0",         num: 10, bloque: 1 },
    { txt: "        i = i + 1",            num: 11, bloque: 1 },
    { txt: "    return mejor",             num: 12 }
  ];

  function simular(params) {
    var A = params.A;
    var pasos = [];
    var N = null, i = null, suma = null, mejor = null;
    function snap(linea, extra) {
      var p = { linea: linea, i: i, suma: suma, mejor: mejor };
      if (extra) { for (var c in extra) { p[c] = extra[c]; } }
      pasos.push(p);
    }
    N = A.length; snap(1);
    suma = 0; snap(2);
    mejor = 0; snap(3);
    i = 0; snap(4);
    var corriendo = true;
    while (corriendo) {
      snap(5, { chequeo: true });
      if (i < N) {
        suma = suma + A[i]; snap(6);
        snap(7);
        if (suma > mejor) {
          mejor = suma; snap(8);
        }
        snap(9);
        if (suma < 0) {
          suma = 0; snap(10);
        }
        i = i + 1; snap(11);
      } else {
        corriendo = false;
      }
    }
    snap(12);
    return pasos;
  }

  function chequeos(A) {
    var lista = [];
    simular({ A: A }).forEach(function (p) {
      if (p.chequeo) { lista.push({ i: p.i, suma: p.suma, mejor: p.mejor }); }
    });
    return lista;
  }

  /* S(s, e) = A[s] + ... + A[e - 1]; vale 0 si s = e. */
  function S(A, s, e) {
    var r = 0;
    var t = s;
    while (t < e) {
      r = r + A[t];
      t = t + 1;
    }
    return r;
  }

  /* Máximo de S(s, e) con e fijo y 0 <= s <= smax; null si no hay s. */
  function maxTerminanEn(A, e, smax) {
    var m = null;
    var s = 0;
    while (s <= smax) {
      var v = S(A, s, e);
      if (m === null || v > m) { m = v; }
      s = s + 1;
    }
    return m;
  }

  /* Máximo de S(s, e) con 0 <= s <= e <= emax; vacio decide si cuenta s = e. */
  function maxTramos(A, emax, vacio) {
    var m = null;
    var e = 0;
    while (e <= emax) {
      var s = 0;
      while (s <= e) {
        if (vacio || s < e) {
          var v = S(A, s, e);
          if (m === null || v > m) { m = v; }
        }
        s = s + 1;
      }
      e = e + 1;
    }
    return m;
  }

  function noExiste(i) { return ", pero A[" + i + "] no existe"; }

  var CANDIDATOS = {
    cotas: {
      correcta: function (e, A) {
        return { ok: 0 <= e.i && e.i <= A.length, pide: "0 ≤ i ≤ " + A.length };
      },
      estricta: function (e, A) {
        return { ok: 0 <= e.i && e.i < A.length, pide: "0 ≤ i < " + A.length };
      },
      uno: function (e, A) {
        return { ok: 1 <= e.i && e.i <= A.length, pide: "1 ≤ i ≤ " + A.length };
      }
    },
    suma: {
      correcta: function (e, A) {
        var m = maxTerminanEn(A, e.i, e.i);
        return { ok: m === e.suma, pide: "suma = " + m };
      },
      corrido: function (e, A) {
        if (e.i >= A.length) { return { ok: false, pide: "S(s, " + (e.i + 1) + ")" + noExiste(e.i) }; }
        var m = maxTerminanEn(A, e.i + 1, e.i);
        return { ok: m === e.suma, pide: "suma = " + m };
      },
      sinvacio: function (e, A) {
        if (e.i < 1) { return { ok: true, pide: "nada, porque i = 0" }; }
        var m = maxTerminanEn(A, e.i, e.i - 1);
        return { ok: m === e.suma, pide: "suma = " + m };
      },
      prefijo: function (e, A) {
        var m = S(A, 0, e.i);
        return { ok: m === e.suma, pide: "suma = S(0, " + e.i + ") = " + m };
      }
    },
    mejor: {
      correcta: function (e, A) {
        var m = maxTramos(A, e.i, true);
        return { ok: m === e.mejor, pide: "mejor = " + m };
      },
      corrido: function (e, A) {
        if (e.i >= A.length) { return { ok: false, pide: "tramos hasta e = " + (e.i + 1) + noExiste(e.i) }; }
        var m = maxTramos(A, e.i + 1, true);
        return { ok: m === e.mejor, pide: "mejor = " + m };
      },
      sinvacio: function (e, A) {
        if (e.i < 1) { return { ok: true, pide: "nada, porque i = 0" }; }
        var m = maxTramos(A, e.i, false);
        return { ok: m === e.mejor, pide: "mejor = " + m };
      },
      fijo: function (e, A) {
        var m = maxTerminanEn(A, e.i, e.i);
        return { ok: m === e.mejor, pide: "mejor = " + m };
      }
    }
  };

  function primerFallo(A, grupo, op) {
    var estados = chequeos(A);
    var r = -1;
    var n = 0;
    while (n < estados.length && r === -1) {
      if (!CANDIDATOS[grupo][op](estados[n], A).ok) { r = n; }
      n = n + 1;
    }
    return r;
  }

  function ubicarFallo(arreglos, actual, grupo, op) {
    var r = { arreglo: -1, fila: -1 };
    var f = primerFallo(arreglos[actual], grupo, op);
    if (f >= 0) {
      r = { arreglo: actual, fila: f };
    } else {
      var t = 0;
      while (t < arreglos.length && r.arreglo === -1) {
        f = primerFallo(arreglos[t], grupo, op);
        if (f >= 0) { r = { arreglo: t, fila: f }; }
        t = t + 1;
      }
    }
    return r;
  }

  /* Pasos de la estabilidad que no sirven para obtener el mejor tramo que
     termina en t: cada uno devuelve el valor que propone en el chequeo e. */
  var ATAJOS = {
    mejor: function (e, A) { return e.mejor + A[e.i]; },
    solo: function (e, A) { return A[e.i]; }
  };

  /* Primer chequeo con i < N donde el atajo no da el mejor tramo no vacío que
     termina en i: {arreglo, fila, propone, real} o arreglo -1. */
  function falloAtajo(arreglos, actual, atajo) {
    function buscar(A) {
      var estados = chequeos(A);
      var r = -1;
      var n = 0;
      while (n < estados.length - 1 && r === -1) {
        var real = maxTerminanEn(A, estados[n].i + 1, estados[n].i);
        if (ATAJOS[atajo](estados[n], A) !== real) { r = n; }
        n = n + 1;
      }
      return r;
    }
    var res = { arreglo: -1, fila: -1 };
    var orden = [actual];
    var t = 0;
    while (t < arreglos.length) {
      if (t !== actual) { orden.push(t); }
      t = t + 1;
    }
    var q = 0;
    while (q < orden.length && res.arreglo === -1) {
      var f = buscar(arreglos[orden[q]]);
      if (f >= 0) {
        var A = arreglos[orden[q]];
        var e = chequeos(A)[f];
        res = { arreglo: orden[q], fila: f, i: e.i, suma: e.suma, mejor: e.mejor,
          propone: ATAJOS[atajo](e, A), real: maxTerminanEn(A, e.i + 1, e.i) };
      }
      q = q + 1;
    }
    return res;
  }

  var PRESETS = [
    [2, -3, 4, -1, 2, -6, 3],
    [-1, 6],
    [4, -5, 4, -3, 4, 4, -4, 4, -5],
    [-2, -3, -4]
  ];

  return {
    codigo: CODIGO, simular: simular, chequeos: chequeos, S: S,
    maxTerminanEn: maxTerminanEn, maxTramos: maxTramos,
    candidatos: CANDIDATOS, primerFallo: primerFallo, ubicarFallo: ubicarFallo,
    falloAtajo: falloAtajo, presets: PRESETS
  };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var PRESETS = EJERCICIO.presets;
    var actual = 0;
    var hallados = { cotas: false, suma: false, mejor: false };
    var filaFalla = -1;

    function texto(A) { return "[" + A.join(", ") + "]"; }

    function pintarArreglo(A, i) {
      var panel = document.getElementById("panel-arreglo");
      panel.innerHTML = "";
      var caja = document.createElement("div");
      caja.className = "arreglo fila-arreglo";
      var t = 0;
      while (t < A.length) {
        var d = document.createElement("div");
        var clase = "caja";
        if (i !== null && t < i) { clase = clase + " leida"; }
        if (i !== null && t === i) { clase = clase + " actual"; }
        if (i !== null && t > i) { clase = clase + " pendiente"; }
        d.className = clase;
        d.innerHTML = "<span class='indice'>" + t + "</span>" + A[t];
        caja.appendChild(d);
        t = t + 1;
      }
      panel.appendChild(caja);
    }

    function todos() { return hallados.cotas && hallados.suma && hallados.mejor; }

    function alPintar(e) {
      var A = e.params.A;
      pintarArreglo(A, e.actual ? e.actual.i : null);
      var cuerpo = document.getElementById("cuerpo-estados");
      cuerpo.innerHTML = "";
      var fila = 0;
      var m;
      for (m = 0; m < e.k; m = m + 1) {
        var p = e.pasos[m];
        if (p.chequeo) {
          var patron = "…";
          if (todos()) {
            patron = "termina en i − 1: " + EJERCICIO.maxTerminanEn(A, p.i, p.i) +
              " ✓ · en A[0.." + p.i + "): " + EJERCICIO.maxTramos(A, p.i, true) + " ✓";
          }
          var tr = document.createElement("tr");
          if (fila === filaFalla) { tr.className = "falla"; }
          tr.innerHTML = "<td>" + (fila + 1) + "</td><td>" + p.i + "</td><td>" +
            p.suma + "</td><td>" + p.mejor + "</td><td" +
            (todos() ? "" : " class='pend'") + ">" + patron + "</td>";
          cuerpo.appendChild(tr);
          fila = fila + 1;
        }
      }
      if (fila === 0) {
        var trv = document.createElement("tr");
        trv.innerHTML = "<td colspan='5' class='pend'>Ejecute: cada chequeo del while agrega una fila.</td>";
        cuerpo.appendChild(trv);
      }
      document.getElementById("col-patron").textContent = todos()
        ? "I₁ e I₂ en este chequeo" : "¿Qué se repite?";
    }

    Motor.iniciar({
      codigo: EJERCICIO.codigo,
      simular: EJERCICIO.simular,
      chips: [
        { campo: "i", rotulo: "i" },
        { campo: "suma", rotulo: "suma", clase: "cuenta" },
        { campo: "mejor", rotulo: "mejor", clase: "cuenta" }
      ],
      paramsIniciales: { A: PRESETS[0] },
      alPintar: alPintar
    });

    Motor.prediccionNumerica(function (valor, params) {
      var A = params.A;
      var esperado = EJERCICIO.maxTramos(A, A.length, true);
      var total = EJERCICIO.S(A, 0, A.length);
      var r;
      if (valor === esperado) {
        r = { ok: true, msg: "Correcto: el mejor tramo suma " + esperado +
          ". Ahora ejecute y siga la terna (i, suma, mejor) chequeo a chequeo." };
      } else if (valor === total) {
        r = { ok: false, msg: "Esa es la suma de todo el arreglo. El tramo puede " +
          "empezar y terminar donde convenga." };
      } else {
        r = { ok: false, msg: "No coincide. Pruebe en el papel cada inicio y " +
          "cada fin, y quédese con la suma mayor; el tramo vacío vale 0." };
      }
      return r;
    });

    function cargar(n) {
      actual = n;
      filaFalla = -1;
      Array.prototype.forEach.call(document.querySelectorAll(".presets button"), function (b) {
        b.classList.toggle("primario", parseInt(b.getAttribute("data-preset"), 10) === n);
      });
      Motor.limpiarVeredicto();
      Motor.reiniciar({ A: PRESETS[n] });
    }

    Array.prototype.forEach.call(document.querySelectorAll(".presets button"), function (btn) {
      btn.addEventListener("click", function () {
        cargar(parseInt(btn.getAttribute("data-preset"), 10));
      });
    });

    function veredicto(id, ok, html) {
      var v = document.getElementById(id);
      v.className = ok ? "veredicto bien" : "veredicto mal";
      v.innerHTML = html;
    }

    function mostrarFallo(grupo, op) {
      var u = EJERCICIO.ubicarFallo(PRESETS, actual, grupo, op);
      var A = PRESETS[u.arreglo];
      var e = EJERCICIO.chequeos(A)[u.fila];
      var dato = EJERCICIO.candidatos[grupo][op](e, A).pide;
      var html = "";
      if (u.arreglo !== actual) {
        html = "En el arreglo " + texto(PRESETS[actual]) + " se sostiene en todas " +
          "las filas, y aun así no es el invariante. Se cargó " + texto(A) + ": ";
        cargar(u.arreglo);
      } else {
        html = "Mire la fila marcada en la traza: ";
      }
      filaFalla = u.fila;
      document.getElementById("btn-fin").click();
      html = html + "en el chequeo " + (u.fila + 1) + ", con i = " + e.i +
        ", suma = " + e.suma + " y mejor = " + e.mejor + ", la fórmula pide " +
        dato + ". ";
      return html;
    }

    var EXPLICA = {
      cotas: {
        correcta: "Ese es I₀: el primer chequeo ocurre con i = 0, antes de leer " +
          "nada, y el último con i = N, cuando la condición por fin falla.",
        estricta: "El último chequeo llega a i = N, y es justo ese el que termina " +
          "el ciclo; de él sale la poscondición.",
        uno: "El primer chequeo ocurre antes de la primera vuelta, con el i que dejó la línea 4."
      },
      suma: {
        correcta: "Ese es I₁: suma es el mejor tramo que termina en i − 1, y el " +
          "caso s = i es el tramo vacío, que vale 0.",
        corrido: "El rango se corrió una casilla: A[i] es lo que la vuelta va a " +
          "sumar en la línea 6; antes de ella todavía no está.",
        sinvacio: "Sin el tramo vacío la fórmula no explica los ceros que deja la " +
          "línea 10: cuando todo tramo no vacío que termina en i − 1 es negativo, suma " +
          "vale 0, y el único tramo que suma 0 ahí es el vacío.",
        prefijo: "Le falta el máximo sobre el inicio s: suma no es la suma desde " +
          "A[0], porque la línea 10 descarta los prefijos negativos."
      },
      mejor: {
        correcta: "Ese es I₂: mejor es el mejor tramo que cabe en A[0..i), con el " +
          "vacío incluido, y por eso nunca baja de 0.",
        corrido: "Con e ≤ i + 1 la fórmula ya cuenta los tramos que usan A[i], " +
          "y esos los agrega la vuelta.",
        sinvacio: "Sin el tramo vacío, cuando todo es negativo la fórmula pide un " +
          "número negativo, y la línea 3 dejó mejor = 0. UVa 507 imprime que no " +
          "hay tramo bueno justo cuando mejor = 0.",
        fijo: "Esa fórmula deja el fin del tramo amarrado en i: es lo que dice I₁ " +
          "de suma. mejor recuerda un tramo que pudo terminar antes."
      }
    };

    function revisarDescubrimiento() {
      if (todos()) {
        document.getElementById("paso-1").classList.remove("bloqueado");
        document.getElementById("nota-pasos").innerHTML = "Invariantes, con " +
          "S(s, e) = A[s] + … + A[e − 1] y S(s, s) = 0: " +
          "<b>I₀: 0 ≤ i ≤ N</b>, <b>I₁: suma = máx {S(s, i) : 0 ≤ s ≤ i}</b> e " +
          "<b>I₂: mejor = máx {S(s, e) : 0 ≤ s ≤ e ≤ i}</b>. " +
          "El teorema a demostrar: <b>Teorema 1. Los invariantes I₀, I₁ e I₂ se cumplen.</b>";
      }
    }

    ["cotas", "suma", "mejor"].forEach(function (grupo) {
      Array.prototype.forEach.call(document.querySelectorAll("#opciones-" + grupo + " button"), function (btn) {
        btn.addEventListener("click", function () {
          var op = btn.getAttribute("data-op");
          if (op === "correcta") {
            hallados[grupo] = true;
            filaFalla = -1;
            veredicto("veredicto-" + grupo, true, EXPLICA[grupo][op]);
            Motor.repintar();
            revisarDescubrimiento();
          } else {
            veredicto("veredicto-" + grupo, false, mostrarFallo(grupo, op) +
              EXPLICA[grupo][op]);
          }
        });
      });
    });

    /* ---- tarjeta 5: la demostración ---- */
    function completarPaso(idPaso, idSiguiente) {
      document.getElementById(idPaso).classList.add("hecho");
      if (idSiguiente) {
        document.getElementById(idSiguiente).classList.remove("bloqueado");
      }
    }

    function responder(idPaso, atributo, correcta, mensajes, alAcertar) {
      Array.prototype.forEach.call(document.querySelectorAll("#" + idPaso + " .opciones button"), function (btn) {
        btn.addEventListener("click", function () {
          var op = btn.getAttribute(atributo);
          var m = typeof mensajes[op] === "function" ? mensajes[op]() : mensajes[op];
          veredicto("veredicto-" + idPaso, op === correcta, m);
          if (op === correcta) { alAcertar(); }
        });
      });
    }

    function contraejemplo(atajo, formula) {
      var f = EJERCICIO.falloAtajo(PRESETS, actual, atajo);
      var A = PRESETS[f.arreglo];
      return "En " + texto(A) + ", en el chequeo " + (f.fila + 1) + " (i = " + f.i +
        ", suma = " + f.suma + ", mejor = " + f.mejor + "), " + formula + " da " +
        f.propone + ", pero el mejor tramo no vacío que termina en " + f.i +
        " suma " + f.real + ".";
    }

    responder("paso-1", "data-p1", "ceros", {
      ceros: "Correcto: las líneas 2 a 4 dejan los tres en 0.",
      primero: "Relea la línea 2: suma arranca en 0; A[0] entra en la primera vuelta.",
      uno: "Relea la línea 4: el recorrido arranca en i = 0, sin nada leído."
    }, function () { completarPaso("paso-1", "paso-2a"); });

    responder("paso-2a", "data-p2a", "suma", {
      suma: "Correcto, y ahí entra I₁: todo tramo no vacío que termina en t es " +
        "un tramo que termina en t − 1 más A[t], y el mejor de esos lo guarda suma.",
      mejor: function () {
        return contraejemplo("mejor", "mejor + A[t]") + " El tramo de mejor puede " +
          "haber terminado antes de t − 1, y pegarle A[t] deja un hueco.";
      },
      solo: function () {
        return contraejemplo("solo", "A[t]") + " A[t] solo es uno de los tramos " +
          "que terminan en t, no el mejor.";
      }
    }, function () { completarPaso("paso-2a", "paso-2b"); });

    responder("paso-2b", "data-p2b", "vacio", {
      vacio: "Correcto: el 0 es S(t + 1, t + 1), el tramo vacío que en I₁ " +
        "evaluado en t + 1 es el caso s = t + 1. Si todo tramo que termina en t " +
        "es negativo, el vacío gana.",
      desborde: "La línea 10 no depende del tamaño de los números: con valores " +
        "pequeños hace falta igual, porque I₁ en t + 1 incluye el tramo vacío.",
      mejor: "La línea 10 cambia suma, no mejor. Lo que pone en suma es el valor " +
        "de un tramo concreto."
    }, function () { completarPaso("paso-2b", "paso-3"); });

    responder("paso-3", "data-p3", "n", {
      n: "Correcto: no se declara, se interseca. La condición rota da i ≥ N, I₀ " +
        "da i ≤ N, y juntas dejan i = N.",
      nm1: "Con i = N − 1 la condición i &lt; N todavía se cumple y el ciclo da una vuelta más.",
      n1: "Eso pasaría con la condición i ≤ N. Aquí es i &lt; N: mire el último chequeo de la tabla."
    }, function () {
      completarPaso("paso-3", null);
      document.getElementById("conclusion").style.display = "block";
    });
  })();
}
