/* esPrimo: el ejercicio de primalidad de colecciones, con las dos
   versiones de 09_es_primo.scala. La guarda y la busqueda van en lineas
   separadas para que cada una lleve su propio contador; es la misma expresion
   que el archivo escribe en una linea.

   La simulacion recorre los divisores en el mismo orden que el Range y se
   detiene donde se detienen exists y forall. Los seis valores de n son los
   del main (0 a 12), donde la corrida con Scala 2.13.11 da
   (0 to 12).filter(esPrimo) = Vector(2, 3, 5, 7, 11) y las dos columnas
   coinciden en los trece numeros. Los divisores de 9 en el rango salen de
   (2 until 9).filter(d => 9 % d == 0) = Vector(3), y que 7 no tenga ninguno,
   de (2 until 7).filter(d => 7 % d == 0) = Vector(). */
(function () {

  var CODIGO = [
    { num: null, txt: "def esPrimoExists(n: Int): Boolean =" },
    { num: 2, txt: "  n >= 2 &&", bloque: 1 },
    { num: 3, txt: "  !(2 until n).exists(d => n % d == 0)", bloque: 2 },
    { num: null, txt: "" },
    { num: null, txt: "def esPrimoForall(n: Int): Boolean =" },
    { num: 6, txt: "  n >= 2 &&", bloque: 1 },
    { num: 7, txt: "  (2 until n).forall(d => n % d != 0)", bloque: 3 }
  ];

  var VALORES_N = [0, 1, 2, 7, 9, 11];

  function paso(extra) {
    var p = {
      linea: null, version: null, fase: null, n: null, d: null,
      mod: null, dice: null, pruebas: null,
      resExists: null, resForall: null
    };
    Object.keys(extra).forEach(function (k) { p[k] = extra[k]; });
    return p;
  }

  /* Una mitad de la simulacion: la guarda, los divisores que alcanza a probar
     la busqueda y la respuesta. exists se detiene en el primer elemento que
     cumple su condicion; forall, en el primero que no la cumple. Los dos
     paran en el mismo divisor, porque las dos condiciones son contrarias. */
  function mitad(n, version, lineaGuarda, lineaBusqueda, buscaDivisor, pasos) {
    var guardaOk = n >= 2;
    var pruebas = 0;
    var d, mod, divide, pred, detiene, respuesta, resultado;
    var campoRes = version === "exists" ? "resExists" : "resForall";
    var extra;

    extra = {
      linea: lineaGuarda, version: version, fase: "guarda", n: n, pruebas: 0,
      dice: "n >= 2 es " + guardaOk
    };
    if (!guardaOk) {
      extra.dice = "n >= 2 es false, el && no evalúa lo de la derecha";
      extra[campoRes] = "false";
    }
    pasos.push(paso(extra));
    if (!guardaOk) { return false; }

    if (n === 2) {
      respuesta = buscaDivisor ? "false" : "true";
      resultado = "true";
      extra = {
        linea: lineaBusqueda, version: version, fase: "responde", n: n,
        pruebas: 0,
        dice: "2 until 2 no tiene elementos, así que "
          + (buscaDivisor ? "exists" : "forall") + " devuelve " + respuesta
      };
      extra[campoRes] = resultado;
      pasos.push(paso(extra));
      return true;
    }

    for (d = 2; d < n; d = d + 1) {
      mod = n % d;
      divide = mod === 0;
      pred = buscaDivisor ? divide : !divide;
      detiene = buscaDivisor ? pred : !pred;
      pruebas = pruebas + 1;
      extra = {
        linea: lineaBusqueda, version: version,
        fase: (detiene || d === n - 1) ? "responde" : "buscando",
        n: n, d: d, mod: mod, pruebas: pruebas,
        dice: buscaDivisor
          ? "n % d == 0 es " + divide
          : "n % d != 0 es " + !divide
      };
      if (detiene) {
        if (buscaDivisor) {
          extra.dice = "n % d == 0 es true, exists se detiene en d = " + d;
          extra.resExists = "false";
        } else {
          extra.dice = "n % d != 0 es false, forall se detiene en d = " + d;
          extra.resForall = "false";
        }
        pasos.push(paso(extra));
        return false;
      }
      if (d === n - 1) {
        if (buscaDivisor) {
          extra.dice = "ningún d divide a " + n + ", exists devuelve false";
          extra.resExists = "true";
        } else {
          extra.dice = "todos cumplen, forall devuelve true";
          extra.resForall = "true";
        }
      }
      pasos.push(paso(extra));
    }
    return true;
  }

  function simular(n) {
    var pasos = [];
    mitad(n, "exists", 2, 3, true, pasos);
    mitad(n, "forall", 6, 7, false, pasos);
    return pasos;
  }

  /* Cuantos divisores alcanza a probar la busqueda, y por que para ahi. */
  function cuenta(n) {
    var pasos = simular(n);
    var pruebas = 0;
    var corte = null;
    pasos.forEach(function (p) {
      if (p.version !== "exists") { return; }
      if (p.pruebas > pruebas) { pruebas = p.pruebas; }
      if (p.d !== null && p.mod === 0) { corte = p.d; }
    });
    return { pruebas: pruebas, corte: corte, guarda: n >= 2, vacio: n === 2 };
  }

  function porQue(n) {
    var c = cuenta(n);
    if (!c.guarda) {
      return "La guarda n >= 2 es falsa, así que el && no llega a evaluar la "
        + "búsqueda y no se prueba ningún divisor.";
    }
    if (c.vacio) {
      return "El rango 2 until 2 no tiene elementos: no hay ningún divisor "
        + "que probar.";
    }
    if (c.corte !== null) {
      return "La búsqueda se detiene en d = " + c.corte + ", el primer "
        + "divisor de " + n + " dentro del rango, y no prueba los que siguen.";
    }
    return "Ningún d entre 2 y " + (n - 1) + " divide a " + n + ", así que la "
      + "búsqueda recorre el rango completo.";
  }

  /* -- Las cinco preguntas sobre el rango sin elementos -- */

  var VACIO = [
    {
      expr: "(2 until 2).exists(d => 9 % d == 0)",
      pregunta: "Un rango que arranca donde termina.",
      cierre: "No hay ningún elemento que probar, así que exists no encuentra ninguno.",
      opciones: [
        { txt: "false", correcta: true },
        { txt: "true", fallo: "true diría que la búsqueda encontró un divisor. Sobre un rango sin elementos no se evalúa la condición ni una vez." },
        { txt: "no compila: el rango está vacío", fallo: "2 until 2 es un rango legítimo de cero elementos, y exists sobre cero elementos responde false.", larga: true }
      ]
    },
    {
      expr: "(2 until 2).forall(d => 9 % d != 0)",
      pregunta: "El mismo rango con la operación contraria.",
      cierre: "Ningún elemento falla la condición, porque no hay ningún elemento.",
      opciones: [
        { txt: "true", correcta: true },
        { txt: "false", fallo: "false pediría un elemento que no cumpla la condición, y el rango no tiene elementos." },
        { txt: "no compila: el rango está vacío", fallo: "El rango compila y queda con cero elementos. Lo que cambia es que forall no tiene nada contra lo que fallar.", larga: true }
      ]
    },
    {
      expr: "Vector[Int]().forall(_ > 3)",
      pregunta: "Lo mismo, con un Vector sin elementos.",
      cierre: "Vector[Int]().exists(_ > 3) da false y forall da true: el rango vacío no es un caso del Range, es el de cualquier colección sin elementos.",
      opciones: [
        { txt: "true", correcta: true },
        { txt: "false", fallo: "Con el Vector sin elementos pasa lo mismo que con 2 until 2: forall da true y exists da false." },
        { txt: "no compila: falta el tipo", fallo: "El tipo está escrito entre corchetes, Vector[Int](), que es como se construye un Vector sin elementos.", larga: true }
      ]
    },
    {
      expr: "sin la guarda, (2 until n).forall(d => n % d != 0) con n = 1",
      pregunta: "Qué contestaría la segunda versión si se le quitara el n >= 2.",
      cierre: "Con el rango sin elementos forall devuelve true, así que 1 pasaría por primo. La guarda es lo que lo descarta.",
      opciones: [
        { txt: "true", correcta: true },
        { txt: "false", fallo: "false pediría un d entre 2 y 0 que divida a 1, y ese rango no tiene ningún elemento, igual que (5 to 1).toList imprime List().", larga: true },
        { txt: "no compila: el rango va hacia atrás", fallo: "Un rango que arranca después de donde termina compila y queda sin elementos: (5 to 1).toList imprime List().", larga: true }
      ]
    },
    {
      expr: "esPrimoExists(n) y esPrimoForall(n), con n entre 0 y 12",
      pregunta: "En qué se diferencian las dos versiones sobre los trece números del main.",
      cierre: "Negar que exista un divisor es lo mismo que pedir que ninguno divida.",
      opciones: [
        { txt: "en nada: las dos columnas dan el mismo valor en los trece", correcta: true, larga: true },
        { txt: "difieren en n = 2, donde el rango queda sin elementos", fallo: "El rango sin elementos es justo donde se ve que son equivalentes: exists da false y la negación lo vuelve true, y forall da true directamente. Las dos dicen que 2 es primo.", larga: true },
        { txt: "difieren en los compuestos, donde exists se detiene antes", fallo: "Las dos se detienen en el mismo divisor: exists en el primero que divide y forall en el primero que falla su condición, que es ese mismo. Y las dos responden false.", larga: true }
      ]
    }
  ];

  var API = {
    CODIGO: CODIGO, VALORES_N: VALORES_N, VACIO: VACIO,
    simular: simular, cuenta: cuenta, porQue: porQue
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================= la pagina ================= */

  var nActual = VALORES_N[3];
  var resueltas = 0;
  var fallados = 0;

  function ultimo(pasos, k, campo) {
    var valor = "–";
    pasos.slice(0, k).forEach(function (p) {
      if (p[campo] !== null) { valor = p[campo]; }
    });
    return valor;
  }

  function pintarTabla(e) {
    var tabla = document.getElementById("tabla-divisores");
    var orden = [];
    var filas = {};
    tabla.innerHTML = "";
    var cab = document.createElement("tr");
    ["d", "n % d", "n % d == 0", "n % d != 0"].forEach(function (t) {
      var th = document.createElement("th");
      th.textContent = t;
      cab.appendChild(th);
    });
    tabla.appendChild(cab);

    e.pasos.slice(0, e.k).forEach(function (p) {
      if (p.d === null) { return; }
      if (filas[p.d] === undefined) {
        filas[p.d] = { d: p.d, mod: p.mod, ex: "–", fa: "–" };
        orden.push(p.d);
      }
      if (p.version === "exists") { filas[p.d].ex = String(p.mod === 0); }
      if (p.version === "forall") { filas[p.d].fa = String(p.mod !== 0); }
    });

    orden.forEach(function (d) {
      var f = filas[d];
      var tr = document.createElement("tr");
      [String(f.d), String(f.mod), f.ex, f.fa].forEach(function (c) {
        var td = document.createElement("td");
        td.textContent = c;
        tr.appendChild(td);
      });
      tabla.appendChild(tr);
    });

    if (orden.length === 0) {
      var vacia = document.createElement("tr");
      var td = document.createElement("td");
      td.colSpan = 4;
      td.className = "pend";
      td.textContent = nActual < 2
        ? "la guarda corta antes de la búsqueda, así que no hay divisores"
        : "aquí aparece un divisor por cada paso de la búsqueda";
      vacia.appendChild(td);
      tabla.appendChild(vacia);
    }
  }

  function alPintar(e) {
    document.getElementById("res-exists").textContent =
      ultimo(e.pasos, e.k, "resExists");
    document.getElementById("res-forall").textContent =
      ultimo(e.pasos, e.k, "resForall");
    pintarTabla(e);
    if (e.terminado && e.k > 0) {
      document.getElementById("carta-equivalencia").classList.remove("bloqueado");
    }
  }

  function bloquearBotones() {
    document.getElementById("botones").classList.add("bloqueado");
  }

  function construirPresets() {
    var caja = document.getElementById("presets");
    VALORES_N.forEach(function (n, i) {
      var b = document.createElement("button");
      b.textContent = "n = " + n;
      b.id = "preset-" + i;
      b.addEventListener("click", function () {
        document.querySelectorAll("#presets button").forEach(function (o) {
          o.className = "";
        });
        b.className = "primario";
        nActual = n;
        document.getElementById("prediccion").value = "";
        Motor.limpiarVeredicto();
        bloquearBotones();
        Motor.reiniciar(n);
      });
      caja.appendChild(b);
    });
  }

  /* -- Las preguntas del rango sin elementos -- */

  function fila(item) {
    var caja = document.createElement("div");
    var expr = document.createElement("div");
    var preg = document.createElement("div");
    var ops = document.createElement("div");
    var ver = document.createElement("div");
    caja.className = "item";
    expr.className = "expr";
    expr.textContent = item.expr;
    preg.className = "pregunta";
    preg.textContent = item.pregunta;
    ops.className = "opciones";
    ver.className = "veredicto";
    caja.appendChild(expr);
    caja.appendChild(preg);
    caja.appendChild(ops);
    caja.appendChild(ver);
    return { caja: caja, ops: ops, ver: ver };
  }

  function marcar() {
    document.getElementById("marcador-vacio").textContent =
      "resueltas: " + resueltas + " de " + VACIO.length +
      "    ·    opciones falladas: " + fallados;
    if (resueltas === VACIO.length) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  function construirVacio() {
    var caja = document.getElementById("vacio");
    VACIO.forEach(function (item, indice) {
      var f = fila(item);
      rotar(item.opciones, indice + 1).forEach(function (o) {
        var b = document.createElement("button");
        b.textContent = o.txt;
        if (o.larga) { b.className = "larga"; }
        b.addEventListener("click", function () {
          if (o.correcta) {
            b.className = b.className.replace(" errada", "") + " acertada";
            Array.prototype.forEach.call(f.ops.children, function (x) {
              x.disabled = true;
            });
            f.ver.className = "veredicto bien";
            f.ver.textContent = item.cierre;
            resueltas = resueltas + 1;
          } else {
            b.className = b.className + " errada";
            b.disabled = true;
            f.ver.className = "veredicto mal";
            f.ver.textContent = o.fallo;
            fallados = fallados + 1;
          }
          marcar();
        });
        f.ops.appendChild(b);
      });
      caja.appendChild(f.caja);
    });
  }

  construirPresets();
  document.getElementById("preset-3").className = "primario";
  construirVacio();
  marcar();
  bloquearBotones();

  Motor.iniciar({
    codigo: CODIGO,
    paramsIniciales: nActual,
    simular: simular,
    chips: [
      { campo: "version", rotulo: "versión" },
      { campo: "fase", rotulo: "fase" },
      { campo: "n", rotulo: "n" },
      { campo: "d", rotulo: "d" },
      { campo: "mod", rotulo: "n % d" },
      { campo: "pruebas", rotulo: "divisores probados", clase: "cuenta" }
    ],
    alPintar: alPintar
  });

  Motor.prediccionNumerica(function (valor, n) {
    var c = cuenta(n);
    document.getElementById("botones").classList.remove("bloqueado");
    if (valor === c.pruebas) {
      return {
        ok: true,
        msg: "Correcto: " + c.pruebas + ". " + porQue(n)
          + " Avance paso a paso y mírelo."
      };
    }
    return {
      ok: false,
      msg: "No. Son " + c.pruebas + ". " + porQue(n)
        + " Avance paso a paso y mírelo."
    };
  });
})();
