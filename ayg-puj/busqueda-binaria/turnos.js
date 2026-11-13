/* Bisección sobre la respuesta: repartir M textos entre k empleados. El codigo
   del panel es el de transcribir.py, y empleados y transcribir hacen lo mismo. */
var EJERCICIO = (function () {
  var PAGINAS = [100, 200, 300, 400, 500, 600, 700, 800, 900], K = 3, T_CONTEO = 2000;

  var CODIGO = [
    { txt: "def empleados_necesarios(paginas, t):",            num: null },
    { txt: "    empleados = 1",                                num: 1, bloque: 1 },
    { txt: "    turno = 0",                                    num: 2, bloque: 1 },
    { txt: "    for p in paginas:",                            num: 3, bloque: 1 },
    { txt: "        if turno + p <= t:",                       num: 4, bloque: 1 },
    { txt: "            turno = turno + p",                    num: 5, bloque: 1 },
    { txt: "        else:",                                    num: null, bloque: 1 },
    { txt: "            empleados = empleados + 1",            num: 6, bloque: 1 },
    { txt: "            turno = p",                            num: 7, bloque: 1 },
    { txt: "    return empleados",                             num: 8, bloque: 1 },
    { txt: "",                                                 num: null },
    { txt: "def transcribir(paginas, k):",                     num: null },
    { txt: "    lo = max(paginas)",                            num: 9, bloque: 2 },
    { txt: "    hi = sum(paginas)",                            num: 10, bloque: 2 },
    { txt: "    while lo < hi:",                               num: 11, bloque: 2 },
    { txt: "        medio = (lo + hi) // 2",                   num: 12, bloque: 2 },
    { txt: "        if empleados_necesarios(paginas, medio) <= k:", num: 13, bloque: 2 },
    { txt: "            hi = medio",                           num: 14, bloque: 2 },
    { txt: "        else:",                                    num: null, bloque: 2 },
    { txt: "            lo = medio + 1",                       num: 15, bloque: 2 },
    { txt: "    return lo",                                    num: 16, bloque: 2 }
  ];

  var CIERRES = [
    { nombre: "Ocho textos", paginas: [250, 400, 150, 300, 500, 100, 350, 450], k: 3 },
    { nombre: "Seis textos", paginas: [700, 200, 300, 100, 800, 250], k: 4 },
    { nombre: "Cinco textos", paginas: [120, 340, 560, 230, 410], k: 2 }
  ];

  function suma(p) { var s = 0, i = 0; while (i < p.length) { s = s + p[i]; i = i + 1; } return s; }
  function mayor(p) { var m = p[0], i = 1; while (i < p.length) { if (p[i] > m) { m = p[i]; } i = i + 1; } return m; }

  function empleados(p, t) {
    var e = 1, turno = 0, i = 0;
    while (i < p.length) {
      if (turno + p[i] <= t) { turno = turno + p[i]; } else { e = e + 1; turno = p[i]; }
      i = i + 1;
    }
    return e;
  }

  /* Los tramos no vacios que arma el mismo recorrido. */
  function tramos(p, t) {
    var res = [], ini = 0, turno = 0, i = 0;
    while (i < p.length) {
      if (turno + p[i] > t && i > ini) {
        res.push({ ini: ini, fin: i - 1, suma: turno });
        ini = i;
        turno = 0;
      }
      turno = turno + p[i];
      i = i + 1;
    }
    res.push({ ini: ini, fin: p.length - 1, suma: turno });
    return res;
  }

  /* La pasada de empleados_necesarios, texto por texto. */
  function pasosConteo(p, t) {
    var res = [], e = 1, turno = 0, i = 0, cabe;
    while (i < p.length) {
      cabe = turno + p[i] <= t;
      res.push({ i: i, p: p[i], turno: turno, empleados: e, cabe: cabe });
      if (cabe) { turno = turno + p[i]; } else { e = e + 1; turno = p[i]; }
      i = i + 1;
    }
    return { pasos: res, empleados: e };
  }

  function juzgarConteo(s, t, cabe) {
    var total = s.turno + s.p, ok = cabe === s.cabe, msg;
    if (s.cabe && ok) {
      msg = "turno + p = " + s.turno + " + " + s.p + " = " + total + ", que no pasa de " + t + ": el texto " + (s.i + 1) + " sigue con el mismo empleado.";
    } else if (!s.cabe && ok) {
      msg = "turno + p = " + s.turno + " + " + s.p + " = " + total + " pasa de " + t + ": se corta antes del texto " + (s.i + 1) + " y ese texto abre el turno del empleado siguiente.";
    } else if (s.cabe) {
      msg = "turno + p = " + s.turno + " + " + s.p + " = " + total + " todavía no pasa de " + t + ". Cortar aquí gastaría un empleado sin necesidad, y la cuenta tiene que dar los menos posibles.";
    } else {
      msg = "turno + p = " + s.turno + " + " + s.p + " = " + total + " pasa de " + t + ": ese empleado se saldría del tope.";
    }
    return { ok: ok, msg: msg };
  }

  /* Bisección con la regla que se pida. Cada vuelta es {lo, hi, medio, empleados, alcanza}. */
  function biseccion(p, k, lo0, hi0, regla) {
    var lo = lo0, hi = hi0, res = [], guarda = 0, medio, e, a;
    while (lo < hi && guarda < 200) {
      medio = Math.floor((lo + hi) / 2);
      e = empleados(p, medio);
      a = e <= k;
      res.push({ lo: lo, hi: hi, medio: medio, empleados: e, alcanza: a });
      if (regla === "lado") {
        if (a) { lo = medio + 1; } else { hi = medio; }
      } else if (regla === "hi-1") {
        if (a) { hi = medio - 1; } else { lo = medio + 1; }
      } else if (a) {
        hi = medio;
      } else {
        lo = medio + 1;
      }
      guarda = guarda + 1;
    }
    return { respuesta: lo, vueltas: res };
  }

  function transcribir(p, k) { return biseccion(p, k, mayor(p), suma(p), "bien").respuesta; }
  function vueltas(p, k) { return biseccion(p, k, mayor(p), suma(p), "bien").vueltas; }

  var MOVIMIENTOS = ["hi=medio", "hi=medio-1", "lo=medio", "lo=medio+1"];

  function juzgarMovimiento(v, k, mov) {
    var m = v.medio, e = v.empleados, ok, msg;
    var base = "Con t = " + m + " hacen falta " + e + " empleados y hay " + k + ": " + (v.alcanza ? "alcanza. " : "no alcanza. ");
    if (v.alcanza) {
      ok = mov === "hi=medio";
      if (ok) {
        msg = base + m + " puede ser el menor tope, así que hi baja hasta " + m + " sin sacarlo del intervalo.";
      } else if (mov === "hi=medio-1") {
        msg = base + "Con hi = medio - 1 el " + m + " sale del intervalo, y podría ser justo el menor. Con esa regla en todas las vueltas, el código termina en 1699, que pide 4 empleados.";
      } else {
        msg = base + "Subir lo es moverse al lado equivocado: descarta " + m + " y todo lo que está por debajo, y el menor tope que alcanza está ahí. Con la regla al revés, el código termina en 4500.";
      }
    } else {
      ok = mov === "lo=medio+1";
      if (ok) {
        msg = base + "Por la monotonía, ningún tope menor alcanza. Se descartan " + m + " y todo lo de abajo: lo pasa a " + (m + 1) + ".";
      } else if (mov === "lo=medio") {
        msg = base + m + " ya se sabe que no sirve, así que tiene que salir del intervalo. Además, cuando lo y hi quedan seguidos, medio vuelve a dar lo y el ciclo no termina.";
      } else {
        msg = base + "Bajar hi es moverse al lado equivocado: descarta los topes mayores, que son los que sí pueden alcanzar. Con la regla al revés, el código termina en 4500.";
      }
    }
    return { ok: ok, msg: msg };
  }

  function noAlcanza(p, k, valor) {
    return valor < mayor(p)
      ? "El texto de " + mayor(p) + " páginas no cabe en un tope de " + valor + "."
      : "Con t = " + valor + " hacen falta " + empleados(p, valor) + " empleados y hay " + k + ": no alcanza.";
  }

  function juzgarCierre(p, k, valor) {
    var r = transcribir(p, k), ok = valor === r, msg;
    if (ok) {
      msg = "Es " + r + ": con ese tope hacen falta " + empleados(p, r) + " empleados, y con " + (r - 1) + " ya no alcanzan " + k + ".";
    } else if (valor === r - 1) {
      msg = noAlcanza(p, k, valor) + " Es una por debajo del menor tope: el error de quedarse corto en uno al terminar. La respuesta es " + r + ".";
    } else if (valor === Math.ceil(suma(p) / k)) {
      msg = "Esa es la suma repartida en " + k + " partes iguales, y solo serviría si los textos se pudieran partir. Cada texto va entero con un empleado. " + noAlcanza(p, k, valor) + " La respuesta es " + r + ".";
    } else if (valor === mayor(p)) {
      msg = "Ese es el texto más largo, " + valor + " páginas: la cota de abajo, donde arranca lo. " + noAlcanza(p, k, valor) + " La respuesta es " + r + ".";
    } else if (valor === r + 1) {
      msg = "Con t = " + valor + " alcanza, pero no es el menor: con " + r + " ya alcanzan los " + k + " empleados. Es el error de pasarse en uno.";
    } else if (valor < mayor(p)) {
      msg = "El texto de " + mayor(p) + " páginas no cabe en un tope de " + valor + ": mire de dónde arranca lo.";
    } else if (empleados(p, valor) > k) {
      msg = "Con t = " + valor + " hacen falta " + empleados(p, valor) + " empleados y hay " + k + ": no alcanza. La respuesta está por encima.";
    } else {
      msg = "Con t = " + valor + " alcanza, con " + empleados(p, valor) + " empleados, pero hay un tope menor que también alcanza.";
    }
    return { ok: ok, msg: msg };
  }

  /* Las versiones con error. */
  var ERRORES = [
    { id: "lo0", nombre: "lo = 0", paginas: PAGINAS, k: 9,
      por: "Arranca por debajo del texto más grande. <code>empleados_necesarios</code> abre un empleado por cada texto que no entra, sin mirar si el texto cabe en <code>t</code>: con <code>t = 100</code> cuenta 9 y 9 &lt;= 9, así que dice que alcanza." },
    { id: "lo1", nombre: "lo = 1", paginas: PAGINAS, k: 9,
      por: "Es el mismo error con otro número: cualquier arranque por debajo de 900 deja en juego topes donde ese texto no cabe. Con <code>k = 12</code> este programa responde 1." },
    { id: "promedio", nombre: "lo = suma // k", paginas: [900, 100, 100], k: 3,
      por: "El promedio es una cota válida, pero olvida el texto más grande: aquí queda en 366 y el texto de 900 no cabe. Con los nueve textos y <code>k = 3</code> este programa responde 1700, así que el ejemplo no lo delata." },
    { id: "lado", nombre: "Moverse al lado equivocado", paginas: PAGINAS, k: 3,
      por: "Si alcanza sube <code>lo</code> y si no alcanza baja <code>hi</code>. Cada vuelta descarta justo la mitad donde estaba el borde, y el intervalo se va hasta la suma." },
    { id: "hi-1", nombre: "hi = medio - 1", paginas: PAGINAS, k: 3,
      por: "Saca del intervalo un tope que alcanza. Cuando ese tope era el menor, ya no vuelve: este programa responde uno menos, 1699, que pide 4 empleados." }
  ];

  function correrError(id, p, k) {
    var r;
    if (id === "lo0") { r = biseccion(p, k, 0, suma(p), "bien").respuesta; }
    else if (id === "lo1") { r = biseccion(p, k, 1, suma(p), "bien").respuesta; }
    else if (id === "promedio") { r = biseccion(p, k, Math.floor(suma(p) / k), suma(p), "bien").respuesta; }
    else if (id === "lado") { r = biseccion(p, k, mayor(p), suma(p), "lado").respuesta; }
    else { r = biseccion(p, k, mayor(p), suma(p), "hi-1").respuesta; }
    return r;
  }

  var PREGUNTAS = [
    { enun: "¿Qué se busca con la bisección?", opciones: [
      { t: "El tope t: el menor máximo de páginas por empleado con el que alcanzan k empleados.", ok: true,
        por: "La salida es un número, lo que lleva el empleado más cargado, y ese número se vuelve el candidato. En el ejemplo vale 1700." },
      { t: "El texto más largo.", ok: false,
        por: "El texto más largo es lo mínimo que alguien va a llevar, y en el ejemplo es 900. Con ese tope hacen falta 6 empleados, y hay 3." }
    ,
      { t: "La mejor lista de cortes, probando todos los repartos.", ok: false,
        por: "Repartir es escoger <i>k</i> - 1 cortes entre <i>M</i> - 1 huecos. Con 9 textos y 3 empleados son 28 repartos, pero con 60 textos y 20 empleados son 1 397 281 501 935 165. Los cortes salen al final, con una pasada, cuando ya se conoce el tope." },
      { t: "Cuántos empleados hacen falta.", ok: false,
        por: "<code>k</code> viene en la entrada. La cuenta de empleados aparece después, dentro de la comprobación de cada candidato." }] },
    { enun: "Ya hay un candidato t. ¿Qué pregunta se comprueba?", opciones: [
      { t: "¿La suma de las páginas dividida por k da t?", ok: false,
        por: "4500 / 3 = 1500, y con <code>t = 1500</code> hacen falta 4 empleados. Los textos no se parten, así que el promedio pocas veces se logra." },
      { t: "Si nadie pasa de t páginas, ¿alcanzan k empleados? Es decir, empleados_necesarios(paginas, t) <= k.", ok: true,
        por: "Se responde con una pasada: cada empleado toma textos mientras quepan. La bisección consulta esa función de sí o no en cada vuelta." }
    ,
      { t: "¿t es igual a la respuesta?", ok: false,
        por: "Solo se contesta conociendo la respuesta, y la respuesta es lo que se busca. Hace falta algo que se pueda calcular con <code>t</code> y los datos." },
      { t: "¿empleados_necesarios(paginas, t) == k?", ok: false,
        por: "Sobrar empleados no estorba. Con los nueve textos y <code>k = 9</code>, ningún tope desde 900 da 9: la cuenta llega a 6 como mucho, y con <code>==</code> la búsqueda no encuentra nada." }] },
    { enun: "¿Por qué la respuesta a esa pregunta es monótona en t?", opciones: [
      { t: "Porque cada página más en el tope quita un empleado.", ok: false,
        por: "Mueva la barra: de 1700 a 2100 la cuenta se queda en 3, y de 2400 a 3000 se queda en 2. Baja a saltos, o no baja." },
      { t: "No es monótona: a veces un tope mayor pide más empleados.", ok: false,
        por: "El reparto que servía con un tope sigue sirviendo con uno mayor, así que no puede hacer falta nadie más." },
      { t: "Porque el reparto que sirve con t también sirve con t + 1: si t alcanza, t + 1 alcanza.", ok: true,
        por: "Entonces la pregunta es falsa hasta un borde y cierta de ahí en adelante, y cambia una sola vez. En el ejemplo: 1699 no alcanza y 1700 sí. La bisección encuentra ese borde." }
    ,
      { t: "Porque los textos vienen ordenados de menor a mayor.", ok: false,
        por: "El orden del ejemplo no interviene. Con <code>[900, 100, 100]</code> pasa lo mismo: subir el tope nunca pide más empleados." }] },
    { enun: "¿Con qué valor arranca lo, el límite de abajo?", opciones: [
      { t: "0", ok: false,
        por: "Con <code>lo = 0</code> y <code>k = 9</code> el programa responde 100, y el texto de 900 no cabe en ese tope. Al abrir un empleado, el código no mira si el texto cabe: cuenta 9 &lt;= 9 y dice que alcanza." },
      { t: "1", ok: false,
        por: "Es igual que arrancar en 0: con <code>k = 9</code> también responde 100, y con <code>k = 12</code> responde 1." },
      { t: "4500 / 3 = 1500, el promedio", ok: false,
        por: "En este ejemplo sale bien, pero olvida el texto más grande. Con <code>[900, 100, 100]</code> y <code>k = 3</code>, el promedio da 366 y el programa responde 366." },
      { t: "900, el texto más largo", ok: true,
        por: "Cada texto queda entero con un empleado, así que nadie puede llevar menos que el más largo. Por debajo de 900 ese texto no cabe, y la cuenta de empleados deja de significar algo." }
    ] },
    { enun: "¿Con qué valor arranca hi, el límite de arriba?", opciones: [
      { t: "4500, la suma de las páginas", ok: true,
        por: "Con <code>t = 4500</code> un solo empleado lo hace todo, y 1 &lt;= k para cualquier <code>k</code>. La respuesta queda siempre entre 900 y 4500." },
      { t: "900, el texto más largo", ok: false,
        por: "Con <code>k = 1</code> un empleado lee los nueve textos y la respuesta es 4500, que quedaría por fuera del intervalo." },
      { t: "1700", ok: false,
        por: "1700 es la respuesta del ejemplo, y al arrancar todavía no se conoce." },
      { t: "2700, k veces el texto más largo", ok: false,
        por: "Con <code>k = 1</code> da 900, y la respuesta es 4500. Tiene que servir para cualquier <code>k</code>." }
    ] }
  ];

  return { PAGINAS: PAGINAS, K: K, T_CONTEO: T_CONTEO, codigo: CODIGO, CIERRES: CIERRES, ERRORES: ERRORES, PREGUNTAS: PREGUNTAS,
           MOVIMIENTOS: MOVIMIENTOS, suma: suma, mayor: mayor, empleados: empleados, tramos: tramos, pasosConteo: pasosConteo,
           juzgarConteo: juzgarConteo, biseccion: biseccion, transcribir: transcribir, vueltas: vueltas,
           juzgarMovimiento: juzgarMovimiento, juzgarCierre: juzgarCierre, correrError: correrError };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, P = E.PAGINAS, K = E.K;
    function el(id) { return document.getElementById(id); }
    var marcar = PLANTEO.codigo("panel-codigo", E.codigo);

    /* La fila de textos: hasta dice cuantos textos se han repartido; ahora, cual se esta mirando. */
    function filaHTML(p, t, hasta, ahora) {
      var M = p.length, h = "<div class='fila-textos' style='grid-template-columns:repeat(" + M + ",minmax(0,1fr))'>";
      var trs = E.tramos(p.slice(0, hasta), t), clases = [], i = 0, j;
      if (hasta === 0) { trs = []; }
      j = 0;
      while (j < trs.length) {
        i = trs[j].ini;
        while (i <= trs[j].fin) { clases[i] = j % 2 === 0 ? "t-a" : "t-b"; i = i + 1; }
        j = j + 1;
      }
      i = 0;
      while (i < M) {
        h = h + "<div class='ind' style='grid-row:1;grid-column:" + (i + 1) + "'>" + (i + 1) + "</div>";
        h = h + "<div class='txt-c " + (i < hasta ? (p[i] > t ? "t-mal" : clases[i]) : "") + (i === ahora ? " t-ahora" : "") +
            "' style='grid-row:2;grid-column:" + (i + 1) + "'>" + p[i] + "</div>";
        i = i + 1;
      }
      j = 0;
      while (j < trs.length) {
        h = h + "<div class='suma" + (trs[j].suma > t ? " mal" : "") + "' style='grid-row:3;grid-column:" + (trs[j].ini + 1) + " / " + (trs[j].fin + 2) + "'>" + trs[j].suma + "</div>";
        j = j + 1;
      }
      return h + "</div>";
    }

    /* La barra de t */
    function pintarBarra() {
      var t = parseInt(el("t-barra").value, 10), e = E.empleados(P, t), trs = E.tramos(P, t);
      el("t-valor").textContent = t;
      el("t-fila").innerHTML = filaHTML(P, t, P.length, -1);
      el("t-lectura").innerHTML = t < E.mayor(P) ?
        "Hacen falta <b>" + e + "</b> empleados y hay " + K + ", y el texto de " + E.mayor(P) + " no cabe en este tope." :
        "Hacen falta <b>" + e + "</b> empleados y hay " + K + ": <b>" + (e <= K ? "alcanza" : "no alcanza") + "</b>. El más cargado lleva " +
        Math.max.apply(null, trs.map(function (x) { return x.suma; })) + " páginas.";
    }
    el("t-barra").addEventListener("input", pintarBarra);
    pintarBarra();

    /* Comprobacion de un tope, texto por texto */
    var CONTEO = E.pasosConteo(P, E.T_CONTEO), c = 0;
    function pintarConteo() {
      var hecho = c >= CONTEO.pasos.length, s = hecho ? null : CONTEO.pasos[c];
      el("c-fila").innerHTML = filaHTML(P, E.T_CONTEO, c, hecho ? -1 : c);
      if (hecho) {
        el("c-instruccion").innerHTML = "<code>empleados = " + CONTEO.empleados + "</code>, y " + CONTEO.empleados + " &lt;= " + K + ": con <code>t = " + E.T_CONTEO + "</code> alcanza.";
        el("c-decision").classList.add("oculto");
        el("c-ayuda").classList.add("oculto");
        el("b-bloque").classList.remove("oculto");
        el("b-lugar").appendChild(el("panel-codigo"));
        marcar([12, 13]);
      } else {
        el("c-instruccion").innerHTML = "<code>t = " + E.T_CONTEO + "</code>, <code>empleados = " + s.empleados + "</code>, <code>turno = " + s.turno +
          "</code>. Llega el texto " + (s.i + 1) + ", con <code>p = " + s.p + "</code>. ¿Qué hace el código?";
        el("c-decision").classList.remove("oculto");
        el("c-ayuda").classList.remove("oculto");
        el("c-lugar").appendChild(el("panel-codigo"));
        marcar([4]);
      }
    }
    function decidirConteo(cabe) {
      var r = E.juzgarConteo(CONTEO.pasos[c], E.T_CONTEO, cabe);
      PLANTEO.decir("c-veredicto", r.ok, r.msg);
      if (r.ok) { c = c + 1; pintarConteo(); }
    }
    Array.prototype.forEach.call(el("c-decision").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { decidirConteo(b.getAttribute("data-cabe") === "1"); });
    });
    el("c-ayuda").addEventListener("click", function () { decidirConteo(CONTEO.pasos[c].cabe); });
    el("c-reinicio").addEventListener("click", function () {
      c = 0; PLANTEO.decir("c-veredicto", true, ""); el("b-bloque").classList.add("oculto"); pintarConteo();
    });

    /* La biseccion */
    var VUELTAS = E.vueltas(P, K), b = 0, MIN = E.mayor(P), MAX = E.suma(P);
    function pct(x) { return ((x - MIN) / (MAX - MIN) * 100).toFixed(2); }
    function rectaHTML(lo, hi, medio) {
      return "<div class='recta'><div class='no' style='left:0;width:" + pct(lo) + "%'></div>" +
        "<div class='si' style='left:" + pct(hi) + "%;right:0'></div>" +
        "<div class='vivo' style='left:" + pct(lo) + "%;width:" + Math.max(0.6, pct(hi) - pct(lo)) + "%'></div>" +
        (medio === null ? "" : "<div class='medio' style='left:" + pct(medio) + "%'></div><div class='rot-medio' style='left:" + Math.min(94, Math.max(6, pct(medio))) + "%'>" + medio + "</div>") +
        "</div><div class='pie-recta'><span>" + MIN + "</span><span>" + MAX + "</span></div>";
    }
    function pintarTabla() {
      var h = "<tr><th>#</th><th>lo</th><th>hi</th><th>medio</th><th>emp.</th><th>se mueve</th></tr>", i = 0, v;
      while (i < b) {
        v = VUELTAS[i];
        h = h + "<tr><td>" + (i + 1) + "</td><td>" + v.lo + "</td><td>" + v.hi + "</td><td>" + v.medio + "</td><td>" + v.empleados + "</td><td>" +
          (v.alcanza ? "hi = " + v.medio : "lo = " + (v.medio + 1)) + "</td></tr>";
        i = i + 1;
      }
      el("b-tabla").innerHTML = h;
    }
    function pintarBiseccion() {
      var hecho = b >= VUELTAS.length, v = hecho ? null : VUELTAS[b], ult;
      pintarTabla();
      if (hecho) {
        ult = VUELTAS[VUELTAS.length - 1];
        el("b-recta").innerHTML = rectaHTML(E.transcribir(P, K), E.transcribir(P, K), null);
        el("b-fila").innerHTML = filaHTML(P, E.transcribir(P, K), P.length, -1);
        el("b-instruccion").innerHTML = "<code>lo</code> y <code>hi</code> quedaron en " + E.transcribir(P, K) + ": el ciclo termina y <code>return lo</code>.";
        el("b-decision").classList.add("oculto");
        el("b-ayuda").classList.add("oculto");
        el("b-fin").classList.add("oculto");
        el("b-cierre").classList.add("visible");
        el("b-cierre").innerHTML = "La respuesta es <b>" + E.transcribir(P, K) + "</b>, con los cortes de la fila: 1500, 1300 y 1700. Fueron " + VUELTAS.length +
          " vueltas sobre " + P.length + " textos. Cada vuelta recorre los textos una vez y el intervalo se parte a la mitad, así que con <i>S</i> = suma - máximo, el ancho inicial, el costo es Θ(<i>M</i> lg <i>S</i>). En esta corrida, la vuelta " +
          VUELTAS.length + " probó <code>t = " + ult.medio + "</code>.";
        marcar([16]);
      } else {
        el("b-recta").innerHTML = rectaHTML(v.lo, v.hi, v.medio);
        el("b-fila").innerHTML = filaHTML(P, v.medio, P.length, -1);
        el("b-instruccion").innerHTML = "Vuelta " + (b + 1) + ": <code>lo = " + v.lo + "</code>, <code>hi = " + v.hi + "</code>, <code>medio = " + v.medio +
          "</code>. Los cortes de la fila son los de <code>t = medio</code>, y dan " + v.empleados + " empleados con <code>k = " + K + "</code>. ¿Cómo se mueve el intervalo?";
        el("b-decision").classList.remove("oculto");
        el("b-ayuda").classList.remove("oculto");
        el("b-fin").classList.remove("oculto");
        el("b-cierre").classList.remove("visible");
        marcar([12, 13]);
      }
    }
    function mover(mov) {
      var r = E.juzgarMovimiento(VUELTAS[b], K, mov);
      PLANTEO.decir("b-veredicto", r.ok, r.msg);
      if (r.ok) { b = b + 1; pintarBiseccion(); }
    }
    function movimientoBueno() { return VUELTAS[b].alcanza ? "hi=medio" : "lo=medio+1"; }
    Array.prototype.forEach.call(el("b-decision").querySelectorAll("button"), function (x) {
      x.addEventListener("click", function () { mover(x.getAttribute("data-mov")); });
    });
    el("b-ayuda").addEventListener("click", function () { mover(movimientoBueno()); });
    el("b-fin").addEventListener("click", function () {
      b = VUELTAS.length; PLANTEO.decir("b-veredicto", true, ""); pintarBiseccion();
    });
    el("b-reinicio").addEventListener("click", function () {
      b = 0; PLANTEO.decir("b-veredicto", true, ""); pintarBiseccion();
    });

    /* Los errores */
    PLANTEO.botones("errores", E.ERRORES.map(function (x) { return x.nombre; }), function (n) {
      var x = E.ERRORES[n], r = E.correrError(x.id, x.paginas, x.k), bien = E.transcribir(x.paginas, x.k), emp = E.empleados(x.paginas, r);
      el("error-panel").innerHTML = "<p>Con <code>[" + x.paginas.join(", ") + "]</code> y <code>k = " + x.k + "</code> responde <b>" + r + "</b>, y lo correcto es <b>" + bien +
        "</b>. Con <code>t = " + r + "</code> el código cuenta " + emp + " empleados.</p>" + filaHTML(x.paginas, r, x.paginas.length, -1) + "<p>" + x.por + "</p>";
    })(0);

    /* El ejemplo sin ayuda */
    var cierre = 0;
    function pintarCierre() {
      var x = E.CIERRES[cierre], p = x.paginas, k = x.k, caja = el("cierre-opciones");
      var r = E.transcribir(p, k), lista = [r];
      var candidatas = [r - 1, Math.ceil(E.suma(p) / k), E.mayor(p), r + 1];
      candidatas.forEach(function (v) {
        if (lista.indexOf(v) === -1 && v > 0 && lista.length < 4) { lista.push(v); }
      });
      var giro = (r + cierre) % lista.length;
      lista = lista.slice(giro).concat(lista.slice(0, giro));
      caja.innerHTML = "";
      lista.forEach(function (v) {
        var b = document.createElement("button");
        b.setAttribute("data-op", v === r ? "correcta" : "distractor");
        b.textContent = v;
        b.addEventListener("click", function () {
          var j = E.juzgarCierre(p, k, v);
          PLANTEO.decir("cierre-veredicto", j.ok, j.msg);
        });
        caja.appendChild(b);
      });
    }
    PLANTEO.botones("cierres", E.CIERRES.map(function (x) { return x.nombre; }), function (n) {
      var x = E.CIERRES[n];
      cierre = n;
      el("cierre-datos").innerHTML = "<code>paginas = [" + x.paginas.join(", ") + "]</code>, <code>k = " + x.k + "</code>";
      pintarCierre();
      PLANTEO.decir("cierre-veredicto", true, "");
      el("cierre-solucion-panel").innerHTML = "";
    })(0);
    el("cierre-solucion").addEventListener("click", function () {
      var x = E.CIERRES[cierre], r = E.transcribir(x.paginas, x.k), vs = E.vueltas(x.paginas, x.k), i = 0;
      var h = filaHTML(x.paginas, r, x.paginas.length, -1) + "<p class='lectura'>El menor tope es <b>" + r + "</b>.</p><div class='envoltura-tabla'><table class='corrida'><tr><th>lo</th><th>hi</th><th>medio</th><th>emp.</th><th>alcanza</th></tr>";
      while (i < vs.length) {
        h = h + "<tr><td>" + vs[i].lo + "</td><td>" + vs[i].hi + "</td><td>" + vs[i].medio + "</td><td>" + vs[i].empleados + "</td><td>" + (vs[i].alcanza ? "sí" : "no") + "</td></tr>";
        i = i + 1;
      }
      el("cierre-solucion-panel").innerHTML = h + "</table></div>";
    });

    /* Las partes */
    var abrir = PLANTEO.partes("abrir-partes", ["parte-2", "parte-3", "parte-4"]);
    PLANTEO.preguntas("preguntas", E.PREGUNTAS, abrir);
    pintarBiseccion();
    pintarConteo();
  })();
}
