/* Ejercicio interactivo: la mayor diferencia de UVa 11078 (invariantes de ciclo). */
var EJERCICIO = (function () {
  var CODIGO = [
    { txt: "def mayorDiferencia(A):",            num: null },
    { txt: "    N = len(A)",                     num: 1 },
    { txt: "    maximo = A[0]",                  num: 2 },
    { txt: "    mejor = A[0] - A[1]",            num: 3 },
    { txt: "    j = 1",                          num: 4 },
    { txt: "    while j < N:",                   num: 5,  bloque: 1 },
    { txt: "        if maximo - A[j] > mejor:",  num: 6,  bloque: 1 },
    { txt: "            mejor = maximo - A[j]",  num: 7,  bloque: 1 },
    { txt: "        if A[j] > maximo:",          num: 8,  bloque: 1 },
    { txt: "            maximo = A[j]",          num: 9,  bloque: 1 },
    { txt: "        j = j + 1",                  num: 10, bloque: 1 },
    { txt: "    return mejor",                   num: 11 }
  ];

  function simular(params) {
    var A = params.A;
    var pasos = [];
    var N = null, j = null, maximo = null, mejor = null;
    function snap(linea, extra) {
      var p = { linea: linea, j: j, maximo: maximo, mejor: mejor };
      if (extra) { for (var c in extra) { p[c] = extra[c]; } }
      pasos.push(p);
    }
    N = A.length; snap(1);
    maximo = A[0]; snap(2);
    mejor = A[0] - A[1]; snap(3);
    j = 1; snap(4);
    var corriendo = true;
    while (corriendo) {
      snap(5, { chequeo: true });
      if (j < N) {
        snap(6);
        if (maximo - A[j] > mejor) {
          mejor = maximo - A[j]; snap(7);
        }
        snap(8);
        if (A[j] > maximo) {
          maximo = A[j]; snap(9);
        }
        j = j + 1; snap(10);
      } else {
        corriendo = false;
      }
    }
    snap(11);
    return pasos;
  }

  /* Los estados de los chequeos del while, en orden. */
  function chequeos(A) {
    var lista = [];
    simular({ A: A }).forEach(function (p) {
      if (p.chequeo) { lista.push({ j: p.j, maximo: p.maximo, mejor: p.mejor }); }
    });
    return lista;
  }

  /* La misma función con las líneas 6-7 y 8-9 en el orden contrario. */
  function intercambiado(A) {
    var maximo = A[0];
    var mejor = A[0] - A[1];
    var j = 1;
    while (j < A.length) {
      if (A[j] > maximo) { maximo = A[j]; }
      if (maximo - A[j] > mejor) { mejor = maximo - A[j]; }
      j = j + 1;
    }
    return mejor;
  }

  /* Máximo de A[a..b]; null si el rango está vacío. */
  function maxEntre(A, a, b) {
    var m = null;
    var t = a;
    while (t <= b) {
      if (m === null || A[t] > m) { m = A[t]; }
      t = t + 1;
    }
    return m;
  }

  /* Máximo de f(i, k) sobre 0 <= i < k <= kmax; null si no hay parejas. */
  function maxParejas(A, kmax, f) {
    var m = null;
    var k = 1;
    while (k <= kmax) {
      var i = 0;
      while (i < k) {
        var v = f(A[i], A[k]);
        if (m === null || v > m) { m = v; }
        i = i + 1;
      }
      k = k + 1;
    }
    return m;
  }

  function maxCon(a, b) {
    var r = a;
    if (r === null || (b !== null && b > r)) { r = b; }
    return r;
  }

  function resta(x, y) { return x - y; }
  function restaAlReves(x, y) { return y - x; }
  function vacio() { return "el conjunto está vacío y no tiene máximo"; }

  /* Cada candidato recibe el estado e = {j, maximo, mejor} de un chequeo y el
     arreglo, y devuelve {ok, pide}: si la fórmula se cumple y qué valor pide. */
  var CANDIDATOS = {
    cotas: {
      correcta: function (e, A) {
        return { ok: 1 <= e.j && e.j <= A.length, pide: "1 ≤ j ≤ " + A.length };
      },
      estricta: function (e, A) {
        return { ok: 1 <= e.j && e.j < A.length, pide: "1 ≤ j < " + A.length };
      },
      dos: function (e, A) {
        return { ok: 2 <= e.j && e.j <= A.length, pide: "2 ≤ j ≤ " + A.length };
      }
    },
    maximo: {
      correcta: function (e, A) {
        var m = maxEntre(A, 0, e.j - 1);
        return { ok: m === e.maximo, pide: "máx A[0.." + e.j + ") = " + m };
      },
      corrido: function (e, A) {
        if (e.j >= A.length) {
          return { ok: false, pide: "máx A[0.." + e.j + "], pero A[" + e.j +
            "] no existe" };
        }
        var m = maxEntre(A, 0, e.j);
        return { ok: m === e.maximo, pide: "máx A[0.." + e.j + "] = " + m };
      },
      estricto: function (e, A) {
        var t = 0;
        var ok = true;
        var testigo = -1;
        while (t < e.j && ok) {
          if (!(A[t] < e.maximo)) { ok = false; testigo = t; }
          t = t + 1;
        }
        return { ok: ok, pide: ok ? "todo A[t] < maximo" :
          "A[" + testigo + "] < maximo, pero A[" + testigo + "] = " + A[testigo] +
          " y maximo = " + e.maximo };
      },
      todos: function (e, A) {
        var t = 0;
        var ok = true;
        var testigo = -1;
        while (t < e.j && ok) {
          if (A[t] !== e.maximo) { ok = false; testigo = t; }
          t = t + 1;
        }
        return { ok: ok, pide: ok ? "todo A[t] = maximo" :
          "maximo = A[" + testigo + "] = " + A[testigo] };
      }
    },
    mejor: {
      correcta: function (e, A) {
        var m = maxCon(A[0] - A[1], maxParejas(A, e.j - 1, resta));
        return { ok: m === e.mejor, pide: "máx (D<sub>" + e.j + "</sub> ∪ {A[0] − A[1]}) = " + m };
      },
      sinpar: function (e, A) {
        var m = maxParejas(A, e.j - 1, resta);
        if (m === null) { return { ok: false, pide: "máx D<sub>" + e.j + "</sub>, pero " + vacio() }; }
        return { ok: m === e.mejor, pide: "máx D<sub>" + e.j + "</sub> = " + m };
      },
      corrido: function (e, A) {
        if (e.j >= A.length) {
          return { ok: false, pide: "parejas con k ≤ " + e.j + ", pero A[" + e.j +
            "] no existe" };
        }
        var m = maxCon(A[0] - A[1], maxParejas(A, e.j, resta));
        return { ok: m === e.mejor, pide: "máx con k ≤ " + e.j + " = " + m };
      },
      reves: function (e, A) {
        var m = maxCon(A[0] - A[1], maxParejas(A, e.j - 1, restaAlReves));
        return { ok: m === e.mejor, pide: "máx con A[k] − A[i] = " + m };
      }
    }
  };

  /* Índice del primer chequeo donde el candidato falla; -1 si no falla. */
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

  /* Dónde mostrar la falla: en el arreglo actual si falla ahí, o en el primer
     arreglo de la lista donde falle. */
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

  var PRESETS = [
    [7, 1, 9, 3, 8, 2, 10, 4],
    [100, 20],
    [4, 3, 2, 1],
    [1, 2, 3, 4]
  ];

  return {
    codigo: CODIGO, simular: simular, chequeos: chequeos,
    intercambiado: intercambiado, candidatos: CANDIDATOS,
    primerFallo: primerFallo, ubicarFallo: ubicarFallo,
    maxParejas: maxParejas, maxEntre: maxEntre, presets: PRESETS
  };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var PRESETS = EJERCICIO.presets;
    var actual = 0;
    var hallados = { cotas: false, maximo: false, mejor: false };
    var filaFalla = -1;

    function texto(A) { return "[" + A.join(", ") + "]"; }

    function pintarArreglo(A, j) {
      var panel = document.getElementById("panel-arreglo");
      panel.innerHTML = "";
      var caja = document.createElement("div");
      caja.className = "arreglo fila-arreglo";
      var t = 0;
      while (t < A.length) {
        var d = document.createElement("div");
        var clase = "caja";
        if (j !== null && t < j) { clase = clase + " leida"; }
        if (j !== null && t === j) { clase = clase + " actual"; }
        if (j !== null && t > j) { clase = clase + " pendiente"; }
        d.className = clase;
        d.innerHTML = "<span class='indice'>" + t + "</span>" + A[t];
        caja.appendChild(d);
        t = t + 1;
      }
      panel.appendChild(caja);
    }

    function todos() { return hallados.cotas && hallados.maximo && hallados.mejor; }

    function alPintar(e) {
      var A = e.params.A;
      pintarArreglo(A, e.actual ? e.actual.j : null);
      var cuerpo = document.getElementById("cuerpo-estados");
      cuerpo.innerHTML = "";
      var fila = 0;
      var m;
      for (m = 0; m < e.k; m = m + 1) {
        var p = e.pasos[m];
        if (p.chequeo) {
          var est = { j: p.j, maximo: p.maximo, mejor: p.mejor };
          var patron = "…";
          if (todos()) {
            patron = EJERCICIO.candidatos.maximo.correcta(est, A).pide + " ✓ · " +
              EJERCICIO.candidatos.mejor.correcta(est, A).pide + " ✓";
          }
          var tr = document.createElement("tr");
          if (fila === filaFalla) { tr.className = "falla"; }
          tr.innerHTML = "<td>" + (fila + 1) + "</td><td>" + p.j + "</td><td>" +
            p.maximo + "</td><td>" + p.mejor + "</td><td" +
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
        { campo: "j", rotulo: "j" },
        { campo: "maximo", rotulo: "maximo", clase: "cuenta" },
        { campo: "mejor", rotulo: "mejor", clase: "cuenta" }
      ],
      paramsIniciales: { A: PRESETS[0] },
      alPintar: alPintar
    });

    Motor.prediccionNumerica(function (valor, params) {
      var A = params.A;
      var esperado = EJERCICIO.maxParejas(A, A.length - 1, function (x, y) { return x - y; });
      var alReves = EJERCICIO.maxParejas(A, A.length - 1, function (x, y) { return y - x; });
      var r;
      if (valor === esperado) {
        r = { ok: true, msg: "Correcto: la mayor diferencia es " + esperado +
          ". Ahora ejecute y siga la terna (j, maximo, mejor) chequeo a chequeo." };
      } else if (valor === alReves) {
        r = { ok: false, msg: "Esa es la mayor diferencia con la resta al revés, " +
          "el nuevo menos el antiguo. Se pide A[i] − A[k] con i < k." };
      } else {
        r = { ok: false, msg: "No coincide. Para cada posición k, reste A[k] del " +
          "mayor de los que están antes, y quédese con la mejor resta." };
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

    /* Muestra en la traza el chequeo donde falla un candidato errado. */
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
      html = html + "en el chequeo " + (u.fila + 1) + ", con j = " + e.j +
        ", maximo = " + e.maximo + " y mejor = " + e.mejor + ", la fórmula pide " +
        dato + ". ";
      return html;
    }

    var EXPLICA = {
      cotas: {
        correcta: "Ese es I₀: el primer chequeo ocurre con j = 1, porque la línea 3 " +
          "ya usó A[0] y A[1], y el último con j = N, cuando la condición por fin falla.",
        estricta: "El último chequeo llega a j = N, y es justo ese el que termina " +
          "el ciclo; de él sale la poscondición.",
        dos: "El primer chequeo ocurre antes de la primera vuelta, con el j que dejó la línea 4."
      },
      maximo: {
        correcta: "Ese es I₁: en cada chequeo maximo es el mayor de lo ya leído, " +
          "A[0..j), y A[j] todavía no entra.",
        corrido: "El rango se corrió una casilla: A[j] es el elemento que la vuelta " +
          "va a leer, y la línea 6 lo compara con un maximo que todavía no lo incluye.",
        estricto: "Con &lt; ningún elemento puede ser el máximo, y maximo siempre " +
          "es uno de los leídos. Va ≤, y además hay que decir que se alcanza.",
        todos: "El cuantificador está cambiado: maximo es igual a <b>algún</b> " +
          "A[t] y mayor o igual que <b>todos</b>, no igual a todos."
      },
      mejor: {
        correcta: "Ese es I₂. El término A[0] − A[1] cubre el primer chequeo, cuando " +
          "D<sub>1</sub> está vacío; desde j = 2 la pareja (0, 1) ya está en D<sub>j</sub> y " +
          "el término no cambia nada.",
        sinpar: "Es la fórmula que sale a primera vista, y el primer chequeo la " +
          "tumba: con j = 1 no hay parejas i &lt; k &lt; 1, pero la línea 3 ya " +
          "dejó mejor = A[0] − A[1]. El valor inicial decide qué tiene que decir " +
          "el invariante en el primer chequeo.",
        corrido: "Con k ≤ j la fórmula ya cuenta las parejas que terminan en A[j], " +
          "y esas las agrega la vuelta, no están antes de ella.",
        reves: "La resta va en el otro sentido: el enunciado pide el antiguo menos " +
          "el nuevo, A[i] − A[k] con i &lt; k."
      }
    };

    function revisarDescubrimiento() {
      if (todos()) {
        document.getElementById("paso-1").classList.remove("bloqueado");
        document.getElementById("nota-pasos").innerHTML = "Invariantes, con " +
          "D<sub>j</sub> = {A[i] − A[k] : 0 ≤ i &lt; k &lt; j}: " +
          "<b>I₀: 1 ≤ j ≤ N</b>, <b>I₁: maximo = máx {A[t] : 0 ≤ t &lt; j}</b> e " +
          "<b>I₂: mejor = máx (D<sub>j</sub> ∪ {A[0] − A[1]})</b>. " +
          "El teorema a demostrar: <b>Teorema 1. Los invariantes I₀, I₁ e I₂ se cumplen.</b>";
      }
    }

    ["cotas", "maximo", "mejor"].forEach(function (grupo) {
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

    function responder(selector, atributo, correcta, mensajes, alAcertar) {
      Array.prototype.forEach.call(document.querySelectorAll(selector), function (btn) {
        btn.addEventListener("click", function () {
          var op = btn.getAttribute(atributo);
          var idV = selector.split(" ")[0].replace("#", "veredicto-");
          var m = typeof mensajes[op] === "function" ? mensajes[op]() : mensajes[op];
          veredicto(idV, op === correcta, m);
          if (op === correcta) { alAcertar(); }
        });
      });
    }

    responder("#paso-1 .opciones button", "data-p1", "uno", {
      uno: "Correcto: la línea 4 deja j = 1, la 2 deja maximo = A[0] y la 3 deja " +
        "mejor = A[0] − A[1].",
      cero: "Relea la línea 4: el ciclo arranca en j = 1, porque A[0] ya está en maximo.",
      dos: "Relea la línea 3: mejor arranca con la diferencia de la primera " +
        "pareja, no en 0. Con [1, 2, 3, 4] la respuesta es −1, y un 0 inicial la taparía."
    }, function () { completarPaso("paso-1", "paso-2a"); });

    responder("#paso-2a .opciones button", "data-p2a", "fila", {
      fila: "Correcto: D<sub>t+1</sub> es D<sub>t</sub> más las parejas que terminan " +
        "en t, una por cada i con 0 ≤ i &lt; t.",
      una: "Faltan parejas: A[t] se puede restar de cualquiera de los anteriores, " +
        "no solo del vecino. En [7, 1, 9, 3, 8, 2, 10, 4] la mejor pareja que " +
        "termina en 5 es (2, 5), con 9 − 2 = 7, y no (4, 5).",
      despues: "Las parejas (t, k) con k &gt; t terminan en una posición que la " +
        "vuelta todavía no leyó; entran en vueltas posteriores."
    }, function () { completarPaso("paso-2a", "paso-2b"); });

    responder("#paso-2b .opciones button", "data-p2b", "maximo", {
      maximo: "Correcto, y ahí entra I₁: el mayor A[i] con i &lt; t es maximo, así " +
        "que la mejor pareja nueva es maximo − A[t], y eso es lo que comparan las líneas 6 y 7.",
      vecino: "A[t − 1] es solo uno de los candidatos a restar. Hace falta el mayor " +
        "de A[0..t), y ese es el que I₁ garantiza en maximo.",
      reves: "Esa resta va al revés: la pareja (i, t) aporta A[i] − A[t]."
    }, function () { completarPaso("paso-2b", "paso-2c"); });

    responder("#paso-2c .opciones button", "data-p2c", "orden", {
      orden: function () {
        var A = PRESETS[3];
        return "Correcto. Con el orden cambiado, cuando A[t] supera al máximo la " +
          "línea 6 compara la pareja (t, t), que no existe y vale 0. Sobre " +
          texto(A) + " el código intercambiado devuelve " +
          EJERCICIO.intercambiado(A) + " y la respuesta es " +
          EJERCICIO.chequeos(A).pop().mejor + ".";
      },
      igual: function () {
        var A = PRESETS[3];
        return "No da igual. Corra a mano " + texto(A) + " con las líneas 8 y 9 " +
          "antes de la 6: devuelve " + EJERCICIO.intercambiado(A) + ", y la " +
          "respuesta es " + EJERCICIO.chequeos(A).pop().mejor + ".";
      },
      ahorro: "Las dos órdenes hacen las mismas comparaciones. La razón es lo que " +
        "I₁ dice de maximo en el momento en que la línea 6 lo usa."
    }, function () { completarPaso("paso-2c", "paso-3"); });

    responder("#paso-3 .opciones button", "data-p3", "n", {
      n: "Correcto: no se declara, se interseca. La condición rota da j ≥ N, I₀ " +
        "da j ≤ N, y juntas dejan j = N.",
      nm1: "Con j = N − 1 la condición j &lt; N todavía se cumple y el ciclo da una vuelta más.",
      n1: "Eso pasaría con la condición j ≤ N. Aquí es j &lt; N: mire el último chequeo de la tabla."
    }, function () {
      completarPaso("paso-3", null);
      document.getElementById("conclusion").style.display = "block";
    });
  })();
}
