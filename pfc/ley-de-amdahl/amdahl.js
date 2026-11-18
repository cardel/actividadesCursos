/* amdahl: el techo que pone la parte que no se reparte.
   La tabla no esta copiada: sale de S = 1 / (f + (1 - f)/P) para las cuatro
   fracciones y las cinco cantidades de nucleos, y verificar() la imprime para
   contrastarla con la de la sesion. La decision final tampoco trae cifras a
   mano: la f del programa se despeja de los 42 ms y los 15 ms medidos con
   cuatro nucleos, f = (P/S - 1)/(P - 1), y de ahi salen el techo y los dos
   escenarios que se comparan.
   Los distractores son confusiones que ocurren de verdad: dar el tiempo en
   lugar de su inverso, confundir el techo 1/f con el speedup de P nucleos,
   leer la eficiencia S/P como la fraccion serial y esperar que algun numero
   de nucleos cruce el techo. */
(function () {

  var CODIGO = [
    { txt: "val tiempo1 = 1.0", num: 1 },
    { txt: "val serie = f * tiempo1", num: 2 },
    { txt: "val paralelo = (1.0 - f) * tiempo1 / P", num: 3 },
    { txt: "val tiempoP = serie + paralelo", num: 4 },
    { txt: "val speedup = tiempo1 / tiempoP", num: 5 }
  ];

  function amdahl(f, p) {
    return 1 / (f + (1 - f) / p);
  }

  function techo(f) {
    return 1 / f;
  }

  function fraccionSerial(s, p) {
    return (p / s - 1) / (p - 1);
  }

  function num(x) {
    return (Math.round(x * 100) / 100).toFixed(2).replace(".", ",");
  }

  function num3(x) {
    return (Math.round(x * 1000) / 1000).toFixed(3).replace(".", ",");
  }

  /* --- el recorrido de la cuenta ------------------------------------- */

  function recorrer(f, p) {
    var serie = f;
    var paralelo = (1 - f) / p;
    var total = serie + paralelo;
    var s = 1 / total;
    var pasos = [];
    pasos.push({ linea: 1, f: num(f), p: p,
                 accion: "el tiempo de la versión secuencial se toma como unidad" });
    pasos.push({ linea: 2, f: num(f), p: p, serie: num3(serie),
                 accion: "la parte que no se reparte se queda como está: " +
                   num3(serie) });
    pasos.push({ linea: 3, f: num(f), p: p, serie: num3(serie),
                 paralelo: num3(paralelo),
                 accion: "la parte que se reparte, " + num3(1 - f) + ", se divide " +
                   "entre " + p + " y queda en " + num3(paralelo) });
    pasos.push({ linea: 4, f: num(f), p: p, serie: num3(serie),
                 paralelo: num3(paralelo), tiempoP: num3(total),
                 accion: "el tiempo con " + p + " núcleos: " + num3(serie) + " + " +
                   num3(paralelo) + " = " + num3(total) });
    pasos.push({ linea: 5, f: num(f), p: p, serie: num3(serie),
                 paralelo: num3(paralelo), tiempoP: num3(total), speedup: num(s),
                 accion: "el speedup es el inverso de ese tiempo: 1 / " +
                   num3(total) + " = " + num(s) });
    return pasos;
  }

  function simular(params) {
    return recorrer(params.f, params.p);
  }

  var EFES = [0.05, 0.10, 0.20, 0.40];
  var PES = [2, 4, 8, 16, 32];
  var CURVA_P = [1, 2, 4, 8, 16, 32, 64, 128];

  var PRESETS = [
    { f: 0.40, p: 2 },
    { f: 0.40, p: 8 },
    { f: 0.20, p: 8 },
    { f: 0.10, p: 4 },
    { f: 0.05, p: 16 },
    { f: 0.40, p: 32 }
  ];

  var INICIAL = PRESETS[0];

  function tabla() {
    return EFES.map(function (f) {
      return {
        f: f,
        celdas: PES.map(function (p) { return { p: p, valor: amdahl(f, p) }; }),
        techo: techo(f)
      };
    });
  }

  /* --- opciones del speedup, recalculadas con el preset -------------- */

  function sinRepetidos(lista) {
    var vistos = [];
    return lista.filter(function (o) {
      var nuevo = vistos.indexOf(o.valor) < 0;
      if (nuevo) { vistos.push(o.valor); }
      return nuevo;
    });
  }

  function opcionesSpeedup(params) {
    var f = params.f;
    var p = params.p;
    var tiempo = f + (1 - f) / p;
    return sinRepetidos([
      { valor: num(amdahl(f, p)), clave: "correcta",
        razon: "S = 1 / (" + num(f) + " + " + num(1 - f) + "/" + p + ") = 1 / " +
          num3(tiempo) + " = " + num(amdahl(f, p)) + "." },
      { valor: num(tiempo), clave: "tiempo",
        razon: "Ese es el tiempo con " + p + " núcleos, medido en unidades del " +
          "tiempo secuencial. El speedup es su inverso, así que queda en " +
          num(amdahl(f, p)) + "." },
      { valor: num(techo(f)), clave: "techo",
        razon: "Ese es 1/f, el techo con todos los núcleos que se quieran. Con " +
          p + " núcleos el término (1 - f)/P todavía aporta " + num3((1 - f) / p) +
          ", y la cuenta da " + num(amdahl(f, p)) + "." },
      { valor: num(p), clave: "ideal",
        razon: "Ese es el speedup lineal, el ideal cuando no hay parte serial. Con " +
          "f = " + num(f) + " la parte que no se reparte se queda en el tiempo y la " +
          "cuenta da " + num(amdahl(f, p)) + "." }
    ]);
  }

  /* --- el techo, con la cifra de la sesion --------------------------- */

  var FT = 0.40;

  var TECHO = [
    {
      expr: "f = " + num(FT),
      pregunta: "¿Cuántos núcleos hacen falta para pasar de un speedup de " +
        num(techo(FT)) + "?",
      cierre: "Ninguno. Con " + num(FT) + " de parte serial, la cuenta da " +
        num(amdahl(FT, 32)) + " con 32 núcleos, " + num(amdahl(FT, 128)) +
        " con 128 y " + num(amdahl(FT, 1024)) + " con 1024, siempre por debajo de " +
        "1/f = " + num(techo(FT)) + ".",
      opciones: [
        { txt: "64, porque con 32 la tabla da " + num(amdahl(FT, 32)) + " y el salto " +
            "siguiente pasa de " + num(techo(FT)),
          fallo: "Con 64 la cuenta da " + num(amdahl(FT, 64)) + " y con 128, " +
            num(amdahl(FT, 128)) + ". Cada vez que P se dobla, lo que falta hasta " +
            num(techo(FT)) + " se parte en dos, así que la suma de todos los saltos " +
            "que quedan no alcanza a cruzarlo.", larga: true },
        { txt: "ninguno: 1/f = " + num(techo(FT)) + " es el techo y la cuenta se le " +
            "acerca sin alcanzarlo",
          correcta: true, larga: true },
        { txt: "cualquier P mayor que 1/f, porque ahí el término (1 - f)/P se vuelve " +
            "despreciable",
          fallo: "Que ese término se vuelva despreciable es justo lo que pone el " +
            "techo: cuando desaparece queda S = 1/f = " + num(techo(FT)) +
            ". Con P = 100 la cuenta da " + num(amdahl(FT, 100)) + ".", larga: true }
      ]
    }
  ];

  /* --- la ventaja de bajar f ----------------------------------------- */

  var FV = 0.40;
  var PV = 8;

  var VENTAJA = [
    {
      expr: "f = " + num(FV) + " y P = " + PV + " dan S = " + num(amdahl(FV, PV)),
      pregunta: "¿Qué sube más el speedup, bajar f a " + num(FV / 2) +
        " con los mismos " + PV + " núcleos o dejar f y doblar los núcleos a " +
        (PV * 2) + "?",
      cierre: "Bajar f, que lleva S de " + num(amdahl(FV, PV)) + " a " +
        num(amdahl(FV / 2, PV)) + ", mientras doblar los núcleos lo lleva a " +
        num(amdahl(FV, PV * 2)) + ". El trabajo que se reparte ya está casi tan " +
        "repartido como puede estar; lo que queda sin tocar es la parte serial.",
      opciones: [
        { txt: "doblar los núcleos a " + (PV * 2) + ", porque cada uno recibe la " +
            "mitad del trabajo de antes",
          fallo: "La mitad de lo que se reparte, que es 1 - f. Con f = " + num(FV) +
            " ese término pasa de " + num3((1 - FV) / PV) + " a " +
            num3((1 - FV) / (PV * 2)) + ", y S solo llega a " +
            num(amdahl(FV, PV * 2)) + "; bajar f lo lleva a " +
            num(amdahl(FV / 2, PV)) + ".", larga: true },
        { txt: "los dos lo mismo, porque las dos cosas parten en dos un término de " +
            "la fórmula",
          fallo: "Bajar f mueve los dos términos a la vez: el que no se reparte cae " +
            "a " + num(FV / 2) + " y el que se reparte sube a " + num(1 - FV / 2) +
            ". Las dos cuentas dan " + num(amdahl(FV / 2, PV)) + " y " +
            num(amdahl(FV, PV * 2)) + ".", larga: true },
        { txt: "bajar f a " + num(FV / 2) + ", que lleva S de " +
            num(amdahl(FV, PV)) + " a " + num(amdahl(FV / 2, PV)) + ", contra " +
            num(amdahl(FV, PV * 2)) + " de doblar los núcleos",
          correcta: true, larga: true }
      ]
    }
  ];

  /* --- la decision sobre segmentRec ---------------------------------- */

  var MEDIDO = { t1: 42, tp: 15, p: 4 };
  var SM = MEDIDO.t1 / MEDIDO.tp;
  var FM = fraccionSerial(SM, MEDIDO.p);
  var PGRANDE = 16;

  var FILAS_DECISION = [
    { rotulo: "medido, versión secuencial", valor: MEDIDO.t1 + " ms", oculto: false },
    { rotulo: "medido, " + MEDIDO.p + " hilos", valor: MEDIDO.tp + " ms", oculto: false },
    { rotulo: "speedup medido", valor: num(SM), oculto: false },
    { rotulo: "f que reproduce esa medida", valor: num(FM), oculto: true },
    { rotulo: "techo 1/f", valor: num(techo(FM)), oculto: true },
    { rotulo: "S con " + PGRANDE + " núcleos y la misma f",
      valor: num(amdahl(FM, PGRANDE)), oculto: true },
    { rotulo: "S con " + MEDIDO.p + " núcleos y f = " + num(FM / 2),
      valor: num(amdahl(FM / 2, MEDIDO.p)), oculto: true },
    { rotulo: "S con " + PGRANDE + " núcleos y f = " + num(FM / 2),
      valor: num(amdahl(FM / 2, PGRANDE)), oculto: true }
  ];

  var DECISION = [
    {
      expr: MEDIDO.t1 + " ms contra " + MEDIDO.tp + " ms con " + MEDIDO.p +
        " núcleos, es decir S = " + num(SM),
      pregunta: "Despejando f de la ley con P = " + MEDIDO.p + ", ¿cuánto resulta la " +
        "parte que no se reparte?",
      cierre: "f = (P/S - 1)/(P - 1) = (" + MEDIDO.p + "/" + num(SM) + " - 1)/" +
        (MEDIDO.p - 1) + " = " + num(FM) + ". El techo de ese programa queda en " +
        "1/f = " + num(techo(FM)) + " por muchos núcleos que se agreguen.",
      revela: true,
      opciones: [
        { txt: num(1 - SM / MEDIDO.p),
          fallo: "Esa es la parte del ideal que se quedó sin ganar, 1 - S/P. Puesta " +
            "en la ley daría S = " + num(amdahl(1 - SM / MEDIDO.p, MEDIDO.p)) +
            " con " + MEDIDO.p + " núcleos, y lo medido fue " + num(SM) + "." },
        { txt: num(SM / MEDIDO.p),
          fallo: "Esa es la eficiencia, S/P, que dice cuánto del ideal se aprovechó. " +
            "La fracción serial que reproduce S = " + num(SM) + " con " + MEDIDO.p +
            " núcleos es " + num(FM) + "." },
        { txt: num(1 / SM),
          fallo: "El inverso del speedup medido no es f. Lo que vale 1/f es el techo " +
            "con núcleos de sobra; con f = " + num(1 / SM) + " la ley daría S = " +
            num(amdahl(1 / SM, MEDIDO.p)) + " con " + MEDIDO.p + " núcleos." },
        { txt: num(FM), correcta: true }
      ]
    },
    {
      expr: "cuatro núcleos, f = " + num(FM) + ", S = " + num(SM),
      pregunta: "¿Qué da más speedup: una máquina de " + PGRANDE + " núcleos o " +
        "reescribir la parte serial a la mitad y quedarse con los cuatro?",
      cierre: "Los " + PGRANDE + " núcleos, que llevan S a " +
        num(amdahl(FM, PGRANDE)) + " contra " + num(amdahl(FM / 2, MEDIDO.p)) +
        " de reescribir con cuatro. Con f = " + num(FM) + " el techo está en " +
        num(techo(FM)) + " y queda camino que los núcleos todavía recorren.",
      opciones: [
        { txt: "reescribir la parte serial, porque bajar f sube el techo y comprar " +
            "núcleos no",
          fallo: "Sube el techo a " + num(techo(FM / 2)) + ", y con cuatro núcleos la " +
            "cuenta solo llega a " + num(amdahl(FM / 2, MEDIDO.p)) + ", por debajo de " +
            "los " + num(amdahl(FM, PGRANDE)) + " de la máquina grande. Con f pequeño " +
            "y pocos núcleos, lo que falta son núcleos.", larga: true },
        { txt: "la máquina de " + PGRANDE + " núcleos, que lleva S a " +
            num(amdahl(FM, PGRANDE)) + " contra " + num(amdahl(FM / 2, MEDIDO.p)) +
            " de reescribir",
          correcta: true, larga: true },
        { txt: "las dos cosas lo mismo, porque doblar P y partir f en dos son el mismo " +
            "cambio en la fórmula",
          fallo: "No lo son: P divide solo a 1 - f, y f entra sin dividir. Las dos " +
            "cuentas dan " + num(amdahl(FM, PGRANDE)) + " y " +
            num(amdahl(FM / 2, MEDIDO.p)) + ".", larga: true }
      ]
    },
    {
      expr: "ya con " + PGRANDE + " núcleos, S = " + num(amdahl(FM, PGRANDE)),
      pregunta: "¿Qué da más desde ahí: seguir comprando núcleos o reescribir la " +
        "parte serial a la mitad?",
      cierre: "Reescribir. Ningún número de núcleos pasa de 1/f = " +
        num(techo(FM)) + ", y con f = " + num(FM / 2) + " los mismos " + PGRANDE +
        " núcleos dan " + num(amdahl(FM / 2, PGRANDE)) + ". Pasado cierto punto el " +
        "hardware deja de comprar speedup y el código sí.",
      opciones: [
        { txt: "reescribir: ningún número de núcleos pasa de " + num(techo(FM)) +
            ", y con f = " + num(FM / 2) + " los mismos " + PGRANDE + " dan " +
            num(amdahl(FM / 2, PGRANDE)),
          correcta: true, larga: true },
        { txt: "seguir comprando núcleos, porque la cuenta todavía sube con cada " +
            "máquina más grande: con 64 núcleos da " + num(amdahl(FM, 64)),
          fallo: "Sube hasta " + num(amdahl(FM, 64)) + " con 64 y " +
            num(amdahl(FM, 128)) + " con 128, y se detiene en " + num(techo(FM)) +
            ". Reescribir f a la mitad da " + num(amdahl(FM / 2, PGRANDE)) +
            " con los " + PGRANDE + " que ya hay.", larga: true },
        { txt: "ninguna de las dos: con " + PGRANDE + " núcleos el programa ya llegó " +
            "a su techo y lo que falte es ruido de la medida",
          fallo: "Con " + PGRANDE + " núcleos da " + num(amdahl(FM, PGRANDE)) +
            " y el techo es " + num(techo(FM)) + ", así que falta camino. Lo que no " +
            "alcanza para recorrerlo del todo son los núcleos.", larga: true }
      ]
    }
  ];

  function verificar() {
    return {
      tabla: tabla().map(function (fila) {
        return "f=" + num(fila.f) + "  " +
          fila.celdas.map(function (c) { return "P=" + c.p + ":" + num(c.valor); }).join("  ") +
          "  Sinf=" + num(fila.techo);
      }),
      presets: PRESETS.map(function (q) {
        return "f=" + num(q.f) + " P=" + q.p + " -> tiempo=" +
          num3(q.f + (1 - q.f) / q.p) + " S=" + num(amdahl(q.f, q.p)) +
          " techo=" + num(techo(q.f));
      }),
      ventaja: "f=" + num(FV) + " P=" + PV + ": " + num(amdahl(FV, PV)) +
        "; f=" + num(FV / 2) + " P=" + PV + ": " + num(amdahl(FV / 2, PV)) +
        "; f=" + num(FV) + " P=" + (PV * 2) + ": " + num(amdahl(FV, PV * 2)),
      techoPlano: CURVA_P.map(function (p) {
        return "P=" + p + ":" + num(amdahl(FT, p));
      }).join("  ") + "  techo=" + num(techo(FT)),
      decision: "S medido=" + num(SM) + " f=" + num(FM) + " techo=" + num(techo(FM)) +
        " S(16,f)=" + num(amdahl(FM, PGRANDE)) +
        " S(4,f/2)=" + num(amdahl(FM / 2, MEDIDO.p)) +
        " S(16,f/2)=" + num(amdahl(FM / 2, PGRANDE))
    };
  }

  var API = {
    CODIGO: CODIGO, PRESETS: PRESETS, EFES: EFES, PES: PES, CURVA_P: CURVA_P,
    TECHO: TECHO, VENTAJA: VENTAJA, DECISION: DECISION,
    FILAS_DECISION: FILAS_DECISION,
    amdahl: amdahl, techo: techo, fraccionSerial: fraccionSerial,
    tabla: tabla, recorrer: recorrer, simular: simular,
    opcionesSpeedup: opcionesSpeedup, verificar: verificar
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================ la pagina ================ */

  var resueltos = { techo: 0, ventaja: 0, decision: 0 };
  var fallados = 0;
  var acertoSpeedup = false;
  var reveladas = false;
  var respondidas = {};

  function marcar() {
    document.getElementById("marcador-techo").textContent =
      "resueltas: " + resueltos.techo + " de " + TECHO.length;
    document.getElementById("marcador-ventaja").textContent =
      "resueltas: " + resueltos.ventaja + " de " + VENTAJA.length;
    document.getElementById("marcador-decision").textContent =
      "resueltas: " + resueltos.decision + " de " + DECISION.length +
      "    ·    opciones falladas: " + fallados;
    if (acertoSpeedup && resueltos.techo === TECHO.length &&
        resueltos.ventaja === VENTAJA.length &&
        resueltos.decision === DECISION.length) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  function clave(params) {
    return num(params.f) + ":" + params.p;
  }

  function construirPresets() {
    var caja = document.getElementById("presets");
    PRESETS.forEach(function (q) {
      var b = document.createElement("button");
      b.textContent = "f = " + num(q.f) + ", P = " + q.p;
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(caja.children, function (x) {
          x.className = x.className.replace(" primario", "");
        });
        b.className = b.className + " primario";
        Motor.reiniciar({ f: q.f, p: q.p });
      });
      caja.appendChild(b);
    });
    caja.children[0].className = caja.children[0].className + " primario";
  }

  function pintarTabla(params) {
    var caja = document.getElementById("tabla-amdahl");
    caja.innerHTML = "";
    var t = document.createElement("table");
    var cab = document.createElement("tr");
    var titulos = ["f"].concat(PES.map(function (p) { return "P = " + p; }));
    titulos.push("S con P → ∞");
    titulos.forEach(function (x) {
      var th = document.createElement("th");
      th.textContent = x;
      cab.appendChild(th);
    });
    t.appendChild(cab);
    tabla().forEach(function (fila) {
      var tr = document.createElement("tr");
      var primera = document.createElement("td");
      primera.textContent = num(fila.f);
      tr.appendChild(primera);
      fila.celdas.forEach(function (c) {
        var td = document.createElement("td");
        var esta = num(fila.f) === num(params.f) && c.p === params.p;
        if (esta && !respondidas[clave(params)]) {
          td.textContent = "?";
          td.className = "pend";
        } else {
          td.textContent = num(c.valor);
          if (esta) { td.className = "resaltada"; }
        }
        tr.appendChild(td);
      });
      var ultima = document.createElement("td");
      ultima.textContent = num(fila.techo);
      tr.appendChild(ultima);
      t.appendChild(tr);
    });
    caja.appendChild(t);
  }

  function filaBarra(caja, rotulo, largo, tope, valor, clase) {
    var fila = document.createElement("div");
    var rot = document.createElement("span");
    var pista = document.createElement("div");
    var barra = document.createElement("div");
    var val = document.createElement("span");
    fila.className = "barra-fila";
    rot.className = "rotulo";
    rot.textContent = rotulo;
    pista.className = "pista-barra";
    barra.className = "barra " + clase;
    barra.style.width = (100 * largo / tope) + "%";
    val.className = "valor";
    val.textContent = valor;
    pista.appendChild(barra);
    fila.appendChild(rot);
    fila.appendChild(pista);
    fila.appendChild(val);
    caja.appendChild(fila);
  }

  function pintarCurva(params) {
    var f = params.f;
    var tope = techo(f);
    var caja = document.getElementById("curva");
    caja.innerHTML = "";
    CURVA_P.forEach(function (p) {
      filaBarra(caja, "P = " + p, amdahl(f, p), tope, num(amdahl(f, p)), "b1");
    });
    filaBarra(caja, "techo 1/f", tope, tope, num(tope), "b3");
    document.getElementById("pie-curva").textContent =
      "Con f = " + num(f) + " el techo es 1/f = " + num(tope) + ". Doblar los " +
      "núcleos de 4 a 8 sube el speedup en " +
      num(amdahl(f, 8) - amdahl(f, 4)) + " y doblarlos de 64 a 128 lo sube en " +
      num(amdahl(f, 128) - amdahl(f, 64)) + ": lo que falta hasta el techo se " +
      "parte en dos cada vez y nunca se agota.";
  }

  function pintarCuenta(e) {
    var p = e.params;
    document.getElementById("pie-cuenta").textContent = e.k === 0
      ? "Con f = " + num(p.f) + " y P = " + p.p + ", el paso a paso reparte el " +
        "tiempo secuencial en la parte que se queda y la que se divide."
      : e.actual.accion;
    if (e.terminado) {
      document.getElementById("pie-cuenta").textContent =
        "Con f = " + num(p.f) + " y P = " + p.p + ": la parte serial aporta " +
        num3(p.f) + " del tiempo original y la paralela " + num3((1 - p.f) / p.p) +
        ", así que el tiempo queda en " + num3(p.f + (1 - p.f) / p.p) +
        " del secuencial y el speedup es su inverso, " + num(amdahl(p.f, p.p)) + ".";
    }
    pintarTabla(p);
    pintarCurva(p);
  }

  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  function revelarDecision() {
    reveladas = true;
    construirTablaDecision();
  }

  function construirItems(idCaja, lista, grupo, giroBase) {
    var caja = document.getElementById(idCaja);
    caja.innerHTML = "";
    lista.forEach(function (item, indice) {
      var contenedor = document.createElement("div");
      var expr = document.createElement("div");
      var preg = document.createElement("div");
      var ops = document.createElement("div");
      var ver = document.createElement("div");
      contenedor.className = "item";
      expr.className = "expr";
      expr.textContent = item.expr;
      preg.className = "pregunta";
      preg.textContent = item.pregunta;
      ops.className = "opciones";
      ver.className = "veredicto";
      rotar(item.opciones, indice + giroBase).forEach(function (o) {
        var b = document.createElement("button");
        b.textContent = o.txt;
        if (o.larga) { b.className = "larga"; }
        b.addEventListener("click", function () {
          if (o.correcta) {
            b.className = b.className.replace(" errada", "") + " acertada";
            Array.prototype.forEach.call(ops.children, function (x) { x.disabled = true; });
            ver.className = "veredicto bien";
            ver.textContent = item.cierre;
            resueltos[grupo] = resueltos[grupo] + 1;
            if (item.revela) { revelarDecision(); }
          } else {
            b.className = b.className + " errada";
            b.disabled = true;
            ver.className = "veredicto mal";
            ver.textContent = o.fallo;
            fallados = fallados + 1;
          }
          marcar();
        });
        ops.appendChild(b);
      });
      contenedor.appendChild(expr);
      contenedor.appendChild(preg);
      contenedor.appendChild(ops);
      contenedor.appendChild(ver);
      caja.appendChild(contenedor);
    });
  }

  function construirTablaDecision() {
    var caja = document.getElementById("tabla-decision");
    caja.innerHTML = "";
    var t = document.createElement("table");
    var cab = document.createElement("tr");
    ["Magnitud", "Valor"].forEach(function (x) {
      var th = document.createElement("th");
      th.textContent = x;
      cab.appendChild(th);
    });
    t.appendChild(cab);
    FILAS_DECISION.forEach(function (fila) {
      var tr = document.createElement("tr");
      var a = document.createElement("td");
      var b = document.createElement("td");
      a.textContent = fila.rotulo;
      a.style.textAlign = "left";
      if (fila.oculto && !reveladas) {
        b.textContent = "?";
        b.className = "pend";
      } else {
        b.textContent = fila.valor;
      }
      tr.appendChild(a);
      tr.appendChild(b);
      t.appendChild(tr);
    });
    caja.appendChild(t);
  }

  /* el preset vigente lo trae la ultima llamada a armar, que el motor hace al
     pintar las opciones; de ahi sale la celda de la tabla que se destapa */
  var vigente = { f: INICIAL.f, p: INICIAL.p };

  function armarSpeedup(params) {
    vigente = params;
    return opcionesSpeedup(params);
  }

  function vigilarSpeedup() {
    document.getElementById("opciones-speedup").addEventListener("click", function () {
      var v = document.getElementById("veredicto-speedup");
      if (v.className.indexOf("bien") >= 0) {
        acertoSpeedup = true;
        respondidas[clave(vigente)] = true;
        pintarTabla(vigente);
        marcar();
      }
    });
  }

  construirPresets();
  construirItems("techo", TECHO, "techo", 0);
  construirItems("ventaja", VENTAJA, "ventaja", 0);
  construirItems("decision", DECISION, "decision", 0);
  construirTablaDecision();
  Motor.iniciar({
    codigo: CODIGO,
    simular: simular,
    chips: [
      { campo: "f", rotulo: "f" },
      { campo: "p", rotulo: "P" },
      { campo: "serie", rotulo: "serie" },
      { campo: "paralelo", rotulo: "paralelo" },
      { campo: "tiempoP", rotulo: "tiempo", clase: "cuenta" },
      { campo: "speedup", rotulo: "S", clase: "cuenta" }
    ],
    paramsIniciales: { f: INICIAL.f, p: INICIAL.p },
    alPintar: pintarCuenta
  });
  Motor.opcionesNumericas("opciones-speedup", "veredicto-speedup", armarSpeedup);
  vigilarSpeedup();
  marcar();
})();
