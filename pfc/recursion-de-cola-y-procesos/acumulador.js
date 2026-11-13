/* Acumulador: la traza de factIter como tabla, una fila por llamada. El
   estudiante llena la columna prod antes de ver la ejecución.
   Reproduce 02_factorial_iterativo.scala. */
(function () {
  var CODIGO = [
    { txt: "@tailrec", num: null },
    { txt: "def factIter(cont: Int, prod: Int, n: Int): Int =", num: null },
    { txt: "  if (cont > n) prod", num: 1 },
    { txt: "  else factIter(cont + 1, cont * prod, n)", num: 2 },
    { txt: "", num: null },
    { txt: "def fact(n: Int): Int = factIter(1, 1, n)", num: 3 }
  ];

  /* Una fila por llamada: (cont, prod, n). La última es la que devuelve. */
  function filas(n) {
    var F = [], cont = 1, prod = 1;
    while (cont <= n) {
      F.push({ cont: cont, prod: prod, n: n, devuelve: false });
      prod = cont * prod; cont = cont + 1;
    }
    F.push({ cont: cont, prod: prod, n: n, devuelve: true });
    return F;
  }

  function simular(n) {
    var pasos = [{ linea: 3, cont: null, prod: null, fila: -1 }];
    filas(n).forEach(function (f, i) {
      pasos.push({ linea: f.devuelve ? 1 : 2, cont: f.cont, prod: f.prod, fila: i });
    });
    return pasos;
  }

  var API = { filas: filas, simular: simular, CODIGO: CODIGO };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  var nActual = 4;

  function construirTabla(n) {
    var cuerpo = document.getElementById("cuerpo-tabla");
    cuerpo.innerHTML = "";
    filas(n).forEach(function (f, i) {
      var tr = document.createElement("tr");
      tr.id = "fila-" + i;
      var c1 = document.createElement("td"); c1.textContent = f.cont;
      var c2 = document.createElement("td");
      if (i === 0) {
        c2.textContent = f.prod;
        c2.className = "dada";
      } else {
        var ops = document.createElement("div");
        ops.className = "opciones"; ops.id = "opciones-prod-" + i;
        c2.appendChild(ops);
        var ver = document.createElement("div");
        ver.className = "veredicto"; ver.id = "veredicto-prod-" + i;
        c2.appendChild(ver);
        var real = document.createElement("span");
        real.className = "real"; real.id = "real-" + i;
        c2.appendChild(real);
      }
      var c3 = document.createElement("td"); c3.textContent = f.n;
      var c4 = document.createElement("td");
      c4.className = "que";
      c4.textContent = f.devuelve ? "cont > n: devuelve prod" : "cont * prod → siguiente";
      tr.appendChild(c1); tr.appendChild(c2); tr.appendChild(c3); tr.appendChild(c4);
      cuerpo.appendChild(tr);
    });
    document.getElementById("veredicto-tabla").className = "veredicto";
    document.getElementById("veredicto-tabla").textContent = "";
    cuerpo.onclick = revisarTabla;
  }

  function pintar(e) {
    var F = filas(e.params);
    F.forEach(function (f, i) {
      var tr = document.getElementById("fila-" + i);
      if (!tr) { return; }
      tr.classList.toggle("actual", e.actual && e.actual.fila === i);
      var real = document.getElementById("real-" + i);
      if (real) {
        real.textContent = (e.actual && e.actual.fila >= i) ? "= " + f.prod : "";
      }
    });
    var pie = document.getElementById("pie-tabla");
    if (!e.actual || e.actual.fila < 0) {
      pie.textContent = "fact(" + e.params + ") arranca con cont = 1 y prod = 1.";
    } else if (e.terminado) {
      pie.textContent = "cont pasó de n: se devuelve prod = " + e.actual.prod + ". Nunca hubo nada esperando.";
    } else {
      var f = F[e.actual.fila];
      pie.textContent = "Llamada con cont = " + f.cont + ", prod = " + f.prod
        + ". La siguiente recibe prod = " + f.cont + " * " + f.prod + " = " + (f.cont * f.prod) + ".";
    }
  }

  Motor.iniciar({
    codigo: CODIGO,
    paramsIniciales: nActual,
    chips: [
      { campo: "cont", rotulo: "cont" },
      { campo: "prod", rotulo: "prod", clase: "alerta" }
    ],
    simular: simular,
    alPintar: pintar
  });

  /* Una casilla por fila: el prod de la fila es cont * prod de la de arriba.
     Quien se equivoca copia el de arriba, suma, usa el cont de su propia
     fila o arranca el acumulador en cero. Un valor repetido se descarta. */
  function opcionesFila(i, n) {
    var F = filas(n), f = F[i], a = F[i - 1], lista = [];
    if (!f) { return lista; }
    lista.push({ valor: f.prod, clave: "correcta",
      razon: "Correcto: " + a.cont + " * " + a.prod + " = " + f.prod
        + ". El producto se calcula antes de llamar, con el cont y el prod de la fila de arriba." });
    lista.push({ valor: a.prod, clave: "copia",
      razon: "Eso copia el prod de la fila de arriba sin multiplicar. El acumulador crece en cada llamada: "
        + "recibe " + a.cont + " * " + a.prod + "." });
    lista.push({ valor: a.cont + a.prod, clave: "suma",
      razon: "Eso suma " + a.cont + " + " + a.prod + ". El factorial multiplica: la llamada pasa cont * prod." });
    lista.push({ valor: f.cont * a.prod, clave: "contpropio",
      razon: "Eso usa el cont de esta fila (" + f.cont + "). El producto lo calcula la llamada de arriba, "
        + "con su propio cont (" + a.cont + ")." });
    lista.push({ valor: 0, clave: "cero",
      razon: "Un acumulador que arranca en 0 se queda en 0 al multiplicar. Aquí arranca en 1, "
        + "el neutro del producto." });
    var vistos = {};
    return lista.filter(function (o) {
      var nuevo = !vistos[o.valor];
      vistos[o.valor] = true;
      return nuevo;
    }).slice(0, 4);
  }

  function revisarTabla() {
    var F = filas(nActual), i, bien = 0;
    for (i = 1; i < F.length; i = i + 1) {
      var v = document.getElementById("veredicto-prod-" + i);
      if (v && v.className.indexOf("bien") >= 0) { bien = bien + 1; }
    }
    var ver = document.getElementById("veredicto-tabla");
    if (bien === F.length - 1) {
      ver.className = "veredicto bien";
      ver.textContent = "Tabla completa. Cada fila multiplica el cont de la anterior por su prod: el resultado se va armando en el parámetro.";
    } else {
      ver.className = "veredicto";
      ver.textContent = "";
    }
  }

  construirTabla(nActual);
  Motor.repintar();

  var MAX_FILAS = 6, r;
  for (r = 1; r <= MAX_FILAS; r = r + 1) {
    (function (i) {
      Motor.opcionesNumericas("opciones-prod-" + i, "veredicto-prod-" + i, function (n) {
        return opcionesFila(i, n);
      });
    })(r);
  }

  document.querySelectorAll("[data-preset]").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll("[data-preset]").forEach(function (o) { o.className = ""; });
      b.className = "primario";
      nActual = parseInt(b.getAttribute("data-preset"), 10);
      construirTabla(nActual);
      Motor.reiniciar(nActual);
    });
  });
})();
