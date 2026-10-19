/* Ejercicio interactivo: cuantos cuadrados hay en una cuadricula de N x N
   (UVa 12149, Feynman) y cuanto cuesta contarlos con tres ciclos. */
var EJERCICIO = (function () {
  var N_MAX = 8;

  /* El codigo que se cuenta. num null = linea sin conteo. */
  var CODIGO = [
    { txt: "int cuadrados(int N) {", num: null },
    { txt: "  int m, f, c, cuenta;", num: 1 },
    { txt: "  cuenta = 0;", num: 2 },
    { txt: "  for (m = 1; m <= N; m++) {", num: 3, bloque: 1 },
    { txt: "    for (f = 0; f + m <= N; f++) {", num: 4, bloque: 2 },
    { txt: "      for (c = 0; c + m <= N; c++) {", num: 5, bloque: 3 },
    { txt: "        cuenta = cuenta + 1;", num: 6, bloque: 3 },
    { txt: "      }", num: null, bloque: 3 },
    { txt: "    }", num: null, bloque: 2 },
    { txt: "  }", num: null, bloque: 1 },
    { txt: "  return cuenta;", num: 7 },
    { txt: "}", num: null }
  ];

  /* Esquinas superiores izquierdas (fila, columna) donde cabe un cuadrado
     de lado m dentro de la cuadricula de N x N. */
  function esquinas(N, m) {
    var lista = [];
    var f, c;
    for (f = 0; f + m <= N; f = f + 1) {
      for (c = 0; c + m <= N; c = c + 1) {
        lista.push([f, c]);
      }
    }
    return lista;
  }

  function posiciones(N, m) {
    return (N - m + 1) * (N - m + 1);
  }

  function sumaCuadrados(N) {
    return N * (N + 1) * (2 * N + 1) / 6;
  }

  /* Filas de la tabla lado / posiciones / acumulado. */
  function tabla(N) {
    var filas = [];
    var acumulado = 0;
    var m;
    for (m = 1; m <= N; m = m + 1) {
      acumulado = acumulado + posiciones(N, m);
      filas.push({ m: m, posiciones: posiciones(N, m), acumulado: acumulado });
    }
    return filas;
  }

  /* Veces que corre cada linea, por formula cerrada. La cabecera de un for
     cuenta como su condicion, evaluada cada vez, tambien la que da falso. */
  function conteoLineas(N) {
    var sk = N * (N + 1) / 2;
    var sk2 = sumaCuadrados(N);
    return { 1: 1, 2: 1, 3: N + 1, 4: sk + N, 5: sk2 + sk, 6: sk2, 7: 1 };
  }

  function total(N) {
    return N * (N + 1) * (2 * N + 1) / 3 + N * N + 3 * N + 4;
  }

  /* Formulas en palabras, para la tabla de conteo. */
  var FORMULAS = {
    1: "1",
    2: "1",
    3: "N + 1",
    4: "Σ (N − m + 2) = N(N + 1)/2 + N",
    5: "Σ k(k + 1) = N(N + 1)(2N + 1)/6 + N(N + 1)/2",
    6: "Σ k² = N(N + 1)(2N + 1)/6",
    7: "1"
  };

  var PISTAS = {
    1: "Una declaración se ejecuta una vez.",
    2: "La asignación inicial corre una sola vez.",
    3: "La condición m <= N da verdadero con m = 1, 2, …, N y una vez más da falso.",
    4: "Congele m: la condición de f da verdadero N − m + 1 veces y falso una vez. Sume eso para m = 1, …, N.",
    5: "Congele m y f: la condición de c da verdadero N − m + 1 veces y falso una. Hay N − m + 1 filas f para cada m.",
    6: "El cuerpo corre una vez por cada cuadrado: es la suma de la columna de posiciones.",
    7: "El return corre una vez."
  };

  /* Ejecucion paso a paso del codigo, con la convencion de conteo. Cada paso
     es {linea, m, f, c, cuenta, cuadro}; cuadro marca el cuadrado contado. */
  function simular(N) {
    var pasos = [];
    var cuenta = 0;
    var m, f, c;
    pasos.push({ linea: 1, m: null, f: null, c: null, cuenta: null, cuadro: null });
    pasos.push({ linea: 2, m: null, f: null, c: null, cuenta: 0, cuadro: null });
    m = 1;
    pasos.push({ linea: 3, m: m, f: null, c: null, cuenta: cuenta, cuadro: null });
    while (m <= N) {
      f = 0;
      pasos.push({ linea: 4, m: m, f: f, c: null, cuenta: cuenta, cuadro: null });
      while (f + m <= N) {
        c = 0;
        pasos.push({ linea: 5, m: m, f: f, c: c, cuenta: cuenta, cuadro: null });
        while (c + m <= N) {
          cuenta = cuenta + 1;
          pasos.push({ linea: 6, m: m, f: f, c: c, cuenta: cuenta, cuadro: [f, c, m] });
          c = c + 1;
          pasos.push({ linea: 5, m: m, f: f, c: c, cuenta: cuenta, cuadro: null });
        }
        f = f + 1;
        pasos.push({ linea: 4, m: m, f: f, c: null, cuenta: cuenta, cuadro: null });
      }
      m = m + 1;
      pasos.push({ linea: 3, m: m, f: null, c: null, cuenta: cuenta, cuadro: null });
    }
    pasos.push({ linea: 7, m: m, f: null, c: null, cuenta: cuenta, cuadro: null });
    return pasos;
  }

  /* Pista para una respuesta equivocada en la tabla de posiciones. */
  function diagnostico(N, m, valor) {
    var lado = N - m + 1;
    var texto;
    if (valor === lado * lado) {
      texto = null;
    } else if (valor === lado) {
      texto = "Eso cuenta una sola fila de esquinas. Hay " + lado +
        " filas posibles y en cada una " + lado + " columnas.";
    } else if (valor === (N - m) * (N - m)) {
      texto = "Un cuadrado de lado " + m + " empieza en la columna 0, 1, …, " +
        (N - m) + ": son " + lado + " columnas, no " + (N - m) + ".";
    } else if (valor === N * N) {
      texto = "No toda casilla sirve de esquina: un cuadrado de lado " + m +
        " que empieza cerca del borde se sale de la cuadrícula.";
    } else {
      texto = "Cuente las esquinas resaltadas: cuántas columnas por cuántas filas.";
    }
    return texto;
  }

  return { nMax: N_MAX, codigo: CODIGO, esquinas: esquinas, posiciones: posiciones,
           sumaCuadrados: sumaCuadrados, tabla: tabla, conteoLineas: conteoLineas,
           total: total, formulas: FORMULAS, pistas: PISTAS, simular: simular,
           diagnostico: diagnostico };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var estado = {
      N: 4, m: 1, respondidas: {}, hover: null,
      pasos: [], k: 0, temporizador: null, lineasBien: {}
    };

    function el(id) { return document.getElementById(id); }

    /* Dibuja una cuadricula de N x N en la caja indicada.
       marcas: {esquinas: [[f,c]], cuadro: [f, c, m] o null} */
    function dibujarRejilla(id, N, marcas, alPasar) {
      var caja = el(id);
      caja.innerHTML = "";
      caja.style.gridTemplateColumns = "repeat(" + N + ", var(--lado-celda))";
      var esq = {};
      marcas.esquinas.forEach(function (p) { esq[p[0] + "," + p[1]] = true; });
      var f, c;
      for (f = 0; f < N; f = f + 1) {
        for (c = 0; c < N; c = c + 1) {
          var d = document.createElement("div");
          d.className = "celda-rej";
          if (esq[f + "," + c]) { d.classList.add("esquina"); }
          if (marcas.cuadro !== null) {
            var q = marcas.cuadro;
            if (f >= q[0] && f < q[0] + q[2] && c >= q[1] && c < q[1] + q[2]) {
              d.classList.add("dentro");
            }
            if (f === q[0] && c === q[1]) { d.classList.add("origen"); }
          }
          if (alPasar && esq[f + "," + c]) {
            d.dataset.f = f;
            d.dataset.c = c;
            d.addEventListener("mouseenter", alPasar);
          }
          caja.appendChild(d);
        }
      }
    }

    /* ---------- Parte 1: la cuadricula y la tabla ---------- */

    function pintarLados() {
      var caja = el("lados");
      caja.innerHTML = "";
      var m;
      for (m = 1; m <= estado.N; m = m + 1) {
        var b = document.createElement("button");
        b.textContent = "m = " + m + (estado.respondidas[m] ? " ✓" : "");
        if (m === estado.m) { b.className = "primario"; }
        b.dataset.m = m;
        b.addEventListener("click", function (ev) {
          estado.m = parseInt(ev.currentTarget.dataset.m, 10);
          estado.hover = null;
          el("pred-pos").value = "";
          el("veredicto-pos").className = "veredicto";
          pintarParte1();
        });
        caja.appendChild(b);
      }
    }

    function alPasarEsquina(ev) {
      estado.hover = [parseInt(ev.currentTarget.dataset.f, 10),
                      parseInt(ev.currentTarget.dataset.c, 10)];
      pintarRejilla1();
    }

    function pintarRejilla1() {
      var cuadro = estado.hover === null ? [0, 0, estado.m]
        : [estado.hover[0], estado.hover[1], estado.m];
      dibujarRejilla("rejilla", estado.N,
        { esquinas: EJERCICIO.esquinas(estado.N, estado.m), cuadro: cuadro },
        alPasarEsquina);
    }

    function pintarTabla() {
      var cuerpo = el("tabla-lados");
      cuerpo.innerHTML = "";
      var filas = EJERCICIO.tabla(estado.N);
      var acumuladoVisible = true;
      filas.forEach(function (r) {
        var tr = document.createElement("tr");
        var visto = estado.respondidas[r.m] === true;
        acumuladoVisible = acumuladoVisible && visto;
        [r.m, visto ? r.posiciones : "?", acumuladoVisible ? r.acumulado : "?"]
          .forEach(function (x) {
            var td = document.createElement("td");
            td.textContent = x;
            if (x === "?") { td.className = "pend"; }
            tr.appendChild(td);
          });
        cuerpo.appendChild(tr);
      });
      var todas = filas.every(function (r) { return estado.respondidas[r.m] === true; });
      var cierre = el("cierre-tabla");
      if (todas) {
        cierre.className = "alerta";
        cierre.innerHTML = "Con N = " + estado.N + " hay <b>" +
          EJERCICIO.sumaCuadrados(estado.N) + "</b> cuadrados. La columna de " +
          "posiciones baja por los cuadrados " + filas.map(function (r) {
            return r.posiciones; }).join(", ") + ": es 1² + 2² + … + " +
          estado.N + "² leída al revés.";
      } else {
        cierre.className = "nota";
        cierre.textContent = "La última celda del acumulado es la respuesta del problema.";
      }
    }

    function pintarParte1() {
      pintarLados();
      pintarRejilla1();
      el("pregunta-pos").innerHTML = "Lado <b>m = " + estado.m + "</b>. ¿Cuántas " +
        "esquinas posibles hay, es decir, cuántos cuadrados de " + estado.m +
        " × " + estado.m + " caben?";
      pintarTabla();
    }

    function comprobarPos() {
      var v = el("veredicto-pos");
      var x = parseInt(el("pred-pos").value, 10);
      var pista = isNaN(x) ? "Escriba un número." : EJERCICIO.diagnostico(estado.N, estado.m, x);
      if (pista === null) {
        v.className = "veredicto bien";
        v.textContent = "Correcto: (N − m + 1)² = (" + estado.N + " − " + estado.m +
          " + 1)² = " + x + ".";
        estado.respondidas[estado.m] = true;
        pintarParte1();
      } else {
        v.className = "veredicto mal";
        v.textContent = pista;
      }
    }

    function revelarPos() {
      var v = el("veredicto-pos");
      v.className = "veredicto mal";
      v.textContent = "Son " + (estado.N - estado.m + 1) + " filas por " +
        (estado.N - estado.m + 1) + " columnas: " +
        EJERCICIO.posiciones(estado.N, estado.m) + " posiciones.";
      estado.respondidas[estado.m] = true;
      pintarParte1();
    }

    /* ---------- Parte 2: el triple ciclo paso a paso ---------- */

    function construirCodigo() {
      var panel = el("panel-codigo");
      panel.innerHTML = "";
      EJERCICIO.codigo.forEach(function (l, idx) {
        var div = document.createElement("div");
        div.className = "linea" + (l.bloque ? " bloque-" + l.bloque : "");
        div.id = "linea-" + idx;
        var num = document.createElement("span");
        num.className = "num";
        num.textContent = l.num === null ? "" : l.num;
        var txt = document.createElement("span");
        txt.className = "txt";
        txt.textContent = l.txt;
        div.appendChild(num);
        div.appendChild(txt);
        if (l.num !== null) {
          var cont = document.createElement("span");
          cont.className = "cont";
          cont.id = "cont-" + l.num;
          cont.textContent = "× 0";
          div.appendChild(cont);
        }
        panel.appendChild(div);
      });
    }

    function pintarEjecucion() {
      var conteos = {};
      var j;
      for (j = 0; j < estado.k; j = j + 1) {
        var ln = estado.pasos[j].linea;
        conteos[ln] = (conteos[ln] || 0) + 1;
      }
      var actual = estado.k > 0 ? estado.pasos[estado.k - 1] : null;
      EJERCICIO.codigo.forEach(function (l, idx) {
        var div = el("linea-" + idx);
        div.classList.toggle("actual", actual !== null && l.num === actual.linea);
        if (l.num !== null) {
          var badge = el("cont-" + l.num);
          var veces = conteos[l.num] || 0;
          badge.textContent = "× " + veces;
          badge.className = veces > 0 ? "cont activo" : "cont";
        }
      });
      ["m", "f", "c", "cuenta"].forEach(function (campo) {
        var x = actual === null ? null : actual[campo];
        el("chip-" + campo).textContent = x === null ? "–" : x;
      });
      el("ver-paso").textContent = estado.k;
      el("ver-total").textContent = estado.pasos.length;
      var ultimoCuadro = null;
      for (j = 0; j < estado.k; j = j + 1) {
        if (estado.pasos[j].cuadro !== null) { ultimoCuadro = estado.pasos[j].cuadro; }
      }
      dibujarRejilla("rejilla-ciclo", estado.N, { esquinas: [], cuadro: ultimoCuadro }, null);
      var terminado = estado.k === estado.pasos.length;
      el("btn-paso").disabled = terminado;
      el("btn-fin").disabled = terminado;
      el("btn-auto").disabled = terminado;
      if (terminado) { detenerAuto(); }
    }

    function detenerAuto() {
      if (estado.temporizador !== null) {
        clearInterval(estado.temporizador);
        estado.temporizador = null;
        el("btn-auto").textContent = "Auto";
      }
    }

    function reiniciarEjecucion() {
      detenerAuto();
      estado.pasos = EJERCICIO.simular(estado.N);
      estado.k = 0;
      pintarEjecucion();
    }

    /* ---------- Parte 3: el conteo linea a linea ---------- */

    function pintarConteo() {
      var cuerpo = el("tabla-conteo");
      cuerpo.innerHTML = "";
      var conteo = EJERCICIO.conteoLineas(estado.N);
      var ln;
      for (ln = 1; ln <= 7; ln = ln + 1) {
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.textContent = ln;
        var td2 = document.createElement("td");
        var bien = estado.lineasBien[ln] === true;
        if (bien) {
          td2.textContent = conteo[ln];
        } else {
          var inp = document.createElement("input");
          inp.type = "number";
          inp.id = "veces-" + ln;
          inp.style.width = "5.5rem";
          td2.appendChild(inp);
        }
        var td3 = document.createElement("td");
        td3.textContent = bien ? EJERCICIO.formulas[ln] : "?";
        if (!bien) { td3.className = "pend"; }
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        cuerpo.appendChild(tr);
      }
      var todas = [1, 2, 3, 4, 5, 6, 7].every(function (x) { return estado.lineasBien[x] === true; });
      el("total-conteo").style.display = todas ? "block" : "none";
      el("t-n").textContent = estado.N;
      el("t-valor").textContent = EJERCICIO.total(estado.N);
    }

    function comprobarConteo() {
      var conteo = EJERCICIO.conteoLineas(estado.N);
      var v = el("veredicto-conteo");
      var primeraMal = null;
      var ln;
      for (ln = 1; ln <= 7; ln = ln + 1) {
        if (estado.lineasBien[ln] !== true) {
          var x = parseInt(el("veces-" + ln).value, 10);
          if (x === conteo[ln]) {
            estado.lineasBien[ln] = true;
          } else if (primeraMal === null) {
            primeraMal = ln;
          }
        }
      }
      if (primeraMal === null) {
        v.className = "veredicto bien";
        v.textContent = "Las siete líneas cuadran con la ejecución.";
      } else {
        v.className = "veredicto mal";
        v.textContent = "Línea " + primeraMal + ": " + EJERCICIO.pistas[primeraMal];
      }
      pintarConteo();
    }

    function revelarConteo() {
      var ln;
      for (ln = 1; ln <= 7; ln = ln + 1) { estado.lineasBien[ln] = true; }
      el("veredicto-conteo").className = "veredicto";
      pintarConteo();
    }

    /* ---------- Cambio de N ---------- */

    function cambiarN(N) {
      estado.N = N;
      estado.m = 1;
      estado.respondidas = {};
      estado.hover = null;
      estado.lineasBien = {};
      el("ver-n").textContent = N;
      el("pred-pos").value = "";
      el("veredicto-pos").className = "veredicto";
      el("veredicto-conteo").className = "veredicto";
      pintarParte1();
      reiniciarEjecucion();
      pintarConteo();
    }

    construirCodigo();
    el("rango-n").max = EJERCICIO.nMax;
    el("rango-n").addEventListener("input", function (ev) {
      cambiarN(parseInt(ev.target.value, 10));
    });
    el("btn-pos").addEventListener("click", comprobarPos);
    el("btn-revelar-pos").addEventListener("click", revelarPos);
    el("pred-pos").addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { comprobarPos(); }
    });
    el("rejilla").addEventListener("mouseleave", function () {
      estado.hover = null;
      pintarRejilla1();
    });
    el("btn-paso").addEventListener("click", function () {
      if (estado.k < estado.pasos.length) { estado.k = estado.k + 1; }
      pintarEjecucion();
    });
    el("btn-fin").addEventListener("click", function () {
      estado.k = estado.pasos.length;
      pintarEjecucion();
    });
    el("btn-auto").addEventListener("click", function () {
      if (estado.temporizador === null) {
        el("btn-auto").textContent = "Pausa";
        estado.temporizador = setInterval(function () {
          if (estado.k < estado.pasos.length) { estado.k = estado.k + 1; }
          pintarEjecucion();
        }, 90);
      } else {
        detenerAuto();
      }
    });
    el("btn-reiniciar").addEventListener("click", reiniciarEjecucion);
    el("btn-conteo").addEventListener("click", comprobarConteo);
    el("btn-revelar-conteo").addEventListener("click", revelarConteo);

    cambiarN(4);
  })();
}
