/* tiempoP: la estimacion del tiempo de ejecucion con P nucleos.
   El codigo del panel es la suma en arbol de un arreglo, el mismo patron de
   segmentRec con un elemento por hoja. El recorrido no esta escrito a mano:
   se genera corriendo esa recursion, asi que W(e) sale de contar las sumas
   que combinan dos resultados y D(e) de la profundidad del arbol de llamadas.
   Para diez millones de elementos la pagina usa las formas cerradas
   W = n - 1 y D = ceil(log2 n); verificar() las contrasta contra el recorrido
   en las potencias de dos, de modo que las dos vias dan la misma cifra.
   Los distractores son los errores que ocurren de verdad: repartir tambien el
   camino critico entre los nucleos, quedarse con el termino del trabajo,
   escribir n donde va W = n - 1 y creer que con nucleos de sobra el tiempo
   tiende a cero. */
(function () {

  var CODIGO = [
    { txt: "def sumaArbol(a: Array[Int], s: Int, t: Int): Int =", num: null },
    { txt: "  if (t - s == 1)", num: 1 },
    { txt: "    a(s)", num: 2 },
    { txt: "  else {", num: null },
    { txt: "    val m = s + (t - s) / 2", num: 3 },
    { txt: "    val (izq, der) = parallel(", num: 4 },
    { txt: "      sumaArbol(a, s, m),", num: null },
    { txt: "      sumaArbol(a, m, t))", num: null },
    { txt: "    izq + der", num: 5 },
    { txt: "  }", num: null }
  ];

  /* --- el recorrido, del que salen W y D ----------------------------- */

  function recorrer(n) {
    var pasos = [];

    function visitar(s, t, nivel) {
      var tam = t - s;
      pasos.push({ linea: 1, s: s, t: t, tam: tam, nivel: nivel,
                   accion: "compara " + tam + " con 1" });
      if (tam === 1) {
        pasos.push({ linea: 2, s: s, t: t, tam: tam, nivel: nivel,
                     accion: "hoja en el nivel " + nivel + ": devuelve a(" + s + ")" });
        return nivel;
      }
      var m = s + Math.floor(tam / 2);
      pasos.push({ linea: 3, s: s, t: t, tam: tam, nivel: nivel,
                   accion: "parte en m = " + m });
      pasos.push({ linea: 4, s: s, t: t, tam: tam, nivel: nivel,
                   accion: "lanza [" + s + ", " + m + ") y [" + m + ", " + t + ")" });
      var izq = visitar(s, m, nivel + 1);
      var der = visitar(m, t, nivel + 1);
      pasos.push({ linea: 5, s: s, t: t, tam: tam, nivel: nivel,
                   accion: "suma los dos resultados de [" + s + ", " + t +
                     "), que esperó a las dos operaciones de abajo" });
      return Math.max(izq, der);
    }

    var prof = visitar(0, n, 0);
    return { pasos: pasos, prof: prof };
  }

  var cache = {};

  function medir(n) {
    if (cache[n]) { return cache[n]; }
    var r = recorrer(n);
    var sumas = 0;
    var hojas = 0;
    var lanzadas = 0;
    r.pasos.forEach(function (p) {
      if (p.linea === 5) { sumas = sumas + 1; }
      if (p.linea === 2) { hojas = hojas + 1; }
      if (p.linea === 4) { lanzadas = lanzadas + 1; }
    });
    cache[n] = { sumas: sumas, hojas: hojas, lanzadas: lanzadas,
                 prof: r.prof, pasos: r.pasos.length };
    return cache[n];
  }

  /* --- las formas cerradas, para los tamanos que no se recorren ------ */

  function trabajo(n) {
    return n - 1;
  }

  function profundidad(n) {
    var d = 0;
    var m = 1;
    while (m < n) {
      m = m * 2;
      d = d + 1;
    }
    return d;
  }

  function estimacion(n, p) {
    return profundidad(n) + trabajo(n) / p;
  }

  function simular(params) {
    return recorrer(params.n).pasos;
  }

  /* --- formato ------------------------------------------------------- */

  function num(x) {
    return (Math.round(x * 100) / 100).toFixed(2).replace(".", ",");
  }

  function entero(x) {
    var s = String(Math.round(x));
    var out = "";
    var i;
    for (i = 0; i < s.length; i = i + 1) {
      if (i > 0 && (s.length - i) % 3 === 0) { out = out + " "; }
      out = out + s.charAt(i);
    }
    return out;
  }

  var PRESETS = [
    { n: 4, p: 2 },
    { n: 8, p: 2 },
    { n: 16, p: 2 },
    { n: 16, p: 4 },
    { n: 16, p: 16 }
  ];

  var INICIAL = PRESETS[0];
  var ESCALA_P = [1, 2, 4, 8, 16, 32, 64];

  function brechaMinima() {
    var menor = -1;
    PRESETS.forEach(function (q) {
      var d = Math.abs(profundidad(q.n) - trabajo(q.n) / q.p);
      if (menor < 0 || d < menor) { menor = d; }
    });
    return menor;
  }

  /* --- opciones de la cota que manda --------------------------------- */

  function opcionesCota(params) {
    var W = trabajo(params.n);
    var D = profundidad(params.n);
    var wp = W / params.p;
    var mandaD = D >= wp;
    return [
      { valor: "D(e)", clave: mandaD ? "correcta" : "camino",
        razon: mandaD
          ? "Con n = " + params.n + " y P = " + params.p + " el camino crítico vale " +
            num(D) + " y el trabajo repartido " + num(wp) + ". Las dos cotas se " +
            "cumplen a la vez, así que decide la mayor."
          : "El camino crítico vale " + num(D) + " y el trabajo repartido " + num(wp) +
            ". Las dos cotas se cumplen a la vez, así que decide la mayor, y aquí la " +
            "mayor es W(e)/P." },
      { valor: "W(e)/P", clave: mandaD ? "trabajo" : "correcta",
        razon: mandaD
          ? "W(e)/P vale " + num(wp) + " y queda por debajo de D(e) = " + num(D) +
            ". Cumplir esa cota no alcanza: el tiempo también tiene que llegar a " +
            num(D) + ", que es la cadena de sumas que se esperan una a otra."
          : "Con n = " + params.n + " y P = " + params.p + " el trabajo repartido vale " +
            num(wp) + " contra " + num(D) + " del camino crítico. Faltan núcleos para " +
            "que el trabajo deje de ser lo que pesa." },
      { valor: "las dos pesan igual", clave: "empate",
        razon: "Pesarían igual si D(e) y W(e)/P dieran lo mismo, y aquí dan " + num(D) +
          " y " + num(wp) + ". Entre los presets de esta página la distancia más corta " +
          "entre las dos cotas es " + num(brechaMinima()) + "." }
    ];
  }

  /* --- opciones de la estimacion ------------------------------------- */

  function sinRepetidos(lista) {
    var vistos = [];
    return lista.filter(function (o) {
      var nuevo = vistos.indexOf(o.valor) < 0;
      if (nuevo) { vistos.push(o.valor); }
      return nuevo;
    });
  }

  function opcionesEstimacion(params) {
    var n = params.n;
    var p = params.p;
    var W = trabajo(n);
    var D = profundidad(n);
    return sinRepetidos([
      { valor: num(D + W / p), clave: "correcta",
        razon: "D(e) + W(e)/P = " + D + " + " + W + "/" + p + " = " + num(D + W / p) +
          ". El camino crítico entra completo y el trabajo entra repartido." },
      { valor: num(W / p), clave: "solo-trabajo",
        razon: "Ese es W(e)/P, una de las dos cotas. La estimación suma además el " +
          "camino crítico, " + D + " niveles que ningún núcleo adicional acorta." },
      { valor: num((W + D) / p), clave: "todo-repartido",
        razon: "Esa cuenta reparte también el camino crítico entre los " + p +
          " núcleos. Las " + D + " sumas de un camino de la raíz a una hoja dependen " +
          "una de otra: la de arriba espera el resultado de la de abajo, y esperar no " +
          "se reparte." },
      { valor: num(D + n / p), clave: "n-por-w",
        razon: "Ahí va n en el lugar de W(e). El trabajo son las sumas que combinan " +
          "resultados, " + W + " para " + n + " elementos y no " + n + ": las hojas " +
          "solo leen el arreglo." }
    ]);
  }

  /* --- opciones del piso --------------------------------------------- */

  function opcionesPiso(params) {
    var n = params.n;
    var p = params.p;
    var W = trabajo(n);
    var D = profundidad(n);
    return sinRepetidos([
      { valor: num(D), clave: "correcta",
        razon: "El piso es D(e) = " + D + ". El término W(e)/P se encoge con cada " +
          "núcleo nuevo y la estimación se le acerca sin bajar de ahí: con n = " + n +
          " da " + num(estimacion(n, 64)) + " con 64 núcleos y " +
          num(estimacion(n, 1024)) + " con 1024." },
      { valor: "0,00", clave: "cero",
        razon: "Eso pasaría si el tiempo fuera solo W(e)/P, que sí tiende a cero. Las " +
          D + " sumas del camino más largo siguen ahí por muchos núcleos que sobren, " +
          "porque cada una espera el resultado de la anterior." },
      { valor: "1,00", clave: "una",
        razon: "Esa es la cuenta de repartir " + W + " sumas entre " + W + " núcleos, " +
          "una por núcleo. La suma de la raíz necesita los dos resultados de abajo, " +
          "así que las operaciones del camino crítico van en fila." },
      { valor: num(W / p), clave: "trabajo-actual",
        razon: "Ese es W(e)/P con los " + p + " núcleos del preset, y baja cada vez " +
          "que P sube. El piso es el término que no depende de P." }
    ]);
  }

  /* --- la ventaja de cada nucleo nuevo, con n = 16 ------------------- */

  var NV = 16;
  var WV = trabajo(NV);
  var DV = profundidad(NV);

  var VENTAJA = [
    {
      expr: "n = " + NV + ", de P = 4 a P = 8",
      pregunta: "La estimación con P = 4 es " + num(estimacion(NV, 4)) +
        ". ¿Qué cambia al doblar los núcleos?",
      cierre: "W(e)/P se parte en dos, de " + num(WV / 4) + " a " + num(WV / 8) +
        ", y la estimación baja de " + num(estimacion(NV, 4)) + " a " +
        num(estimacion(NV, 8)) + ". D(e) no se mueve: sigue valiendo " + DV + ".",
      opciones: [
        { txt: "W(e)/P se parte en dos y la estimación pasa de " +
            num(estimacion(NV, 4)) + " a " + num(estimacion(NV, 8)),
          correcta: true, larga: true },
        { txt: "la estimación se parte en dos, de " + num(estimacion(NV, 4)) + " a " +
            num(estimacion(NV, 4) / 2),
          fallo: "Lo que se parte en dos es W(e)/P. El otro término, D(e) = " + DV +
            ", entra completo en las dos cuentas, así que la estimación baja menos que " +
            "a la mitad.", larga: true },
        { txt: "D(e) se parte en dos, porque con el doble de núcleos el árbol tiene la " +
            "mitad de niveles",
          fallo: "Los niveles los pone el tamaño de la entrada: con " + NV +
            " elementos el árbol tiene " + DV + " niveles con dos núcleos y con " +
            "doscientos. P solo aparece en el otro término.", larga: true }
      ]
    },
    {
      expr: "n = " + NV + ", doblar los núcleos dos veces",
      pregunta: "¿Qué ahorra más, pasar de P = 2 a P = 4 o pasar de P = 32 a P = 64?",
      cierre: "El primer salto ahorra " +
        num(estimacion(NV, 2) - estimacion(NV, 4)) + " y el segundo " +
        num(estimacion(NV, 32) - estimacion(NV, 64)) + ". Cada núcleo nuevo recibe un " +
        "trozo más pequeño de W(e), así que doblar vale menos cada vez que se dobla.",
      opciones: [
        { txt: "pasar de 2 a 4, que ahorra " +
            num(estimacion(NV, 2) - estimacion(NV, 4)) + " contra " +
            num(estimacion(NV, 32) - estimacion(NV, 64)) + " del otro salto",
          correcta: true, larga: true },
        { txt: "pasar de 32 a 64, porque entran 32 núcleos nuevos y en el otro salto " +
            "solo entran 2",
          fallo: "Son más núcleos y cada uno recibe menos trabajo. La estimación pasa " +
            "de " + num(estimacion(NV, 32)) + " a " + num(estimacion(NV, 64)) +
            ", es decir " + num(estimacion(NV, 32) - estimacion(NV, 64)) +
            " de ahorro, contra " + num(estimacion(NV, 2) - estimacion(NV, 4)) +
            " del primer salto.", larga: true },
        { txt: "los dos lo mismo, porque en los dos casos el número de núcleos se " +
            "duplica",
          fallo: "Duplicar P parte en dos el término W(e)/P, y ese término ya no vale " +
            "lo mismo en los dos sitios: " + num(WV / 2) + " con dos núcleos y " +
            num(WV / 32) + " con treinta y dos.", larga: true }
      ]
    }
  ];

  /* --- la situacion: segmentRec con diez millones y cuatro nucleos --- */

  var N7 = 10000000;
  var P7 = 4;
  var W7 = trabajo(N7);
  var D7 = profundidad(N7);
  var WP7 = W7 / P7;
  var RAZON7 = WP7 / D7;
  var MEDIDO = { t1: 42, tp: 15, p: 4 };
  var S7 = MEDIDO.t1 / MEDIDO.tp;

  var SITUACION = [
    {
      expr: "segmentRec con n = " + entero(N7) + " y P = " + P7,
      pregunta: "¿Cuál de los dos términos manda en D(e) + W(e)/P?",
      cierre: "W(e)/P, que vale " + entero(WP7) + " contra " + D7 +
        " del camino crítico, unas " + entero(RAZON7) + " veces más. El tiempo lo pone " +
        "el trabajo repartido, y de ahí que el tope del speedup con cuatro núcleos " +
        "quede del orden de " + P7 + ".",
      opciones: [
        { txt: "W(e)/P, que son " + entero(WP7) + " contra " + D7 + " de D(e)",
          correcta: true, larga: true },
        { txt: "D(e), porque es la cota que no se puede cruzar por muchos núcleos que " +
            "se agreguen",
          fallo: "D(e) no se cruza, y con esta entrada vale " + D7 + " niveles frente " +
            "a " + entero(WP7) + " del otro término. Una cota que queda tan abajo no " +
            "es la que decide el tiempo.", larga: true },
        { txt: "los dos por igual, porque la estimación los suma",
          fallo: "Sumarlos no los hace pesar igual. Uno aporta " + entero(WP7) +
            " y el otro " + D7 + ", así que el segundo cambia la suma en menos de una " +
            "milésima.", larga: true },
        { txt: "D(e), porque la profundidad crece con n igual que el trabajo",
          fallo: "Las dos crecen con n, a ritmos distintos: el trabajo es del orden de " +
            "n y la profundidad del orden de log2 n, que con " + entero(N7) +
            " elementos da " + D7 + ".", larga: true }
      ]
    },
    {
      expr: "la estimación admite un speedup de " + P7 + " y la medida dio " + num(S7),
      pregunta: "¿Qué dice esa diferencia de la estimación?",
      cierre: "Que marca el mejor caso. D(e) + W(e)/P cuenta operaciones y supone que " +
        "los " + P7 + " núcleos reparten el trabajo sin pagar nada por coordinarse, " +
        "así que los " + MEDIDO.t1 + " ms contra " + MEDIDO.tp + " ms medidos quedan " +
        "por debajo de ese mejor caso y nunca por encima.",
      opciones: [
        { txt: "que la estimación marca el mejor caso y la medida queda por debajo",
          correcta: true, larga: true },
        { txt: "que la estimación está mal planteada y el tope real de este programa " +
            "es " + num(S7) + " para cualquier P",
          fallo: "Con ocho o con dieciséis núcleos la medida da otra cifra, así que " +
            num(S7) + " no es un tope del programa: es lo que dieron " + P7 +
            " núcleos en una máquina.", larga: true },
        { txt: "que W(e) quedó corto y el algoritmo hace más de " + entero(W7) +
            " operaciones",
          fallo: "Las sumas que combinan resultados son " + entero(W7) + " para " +
            entero(N7) + " elementos, y esa cuenta sale del código. Lo que la " +
            "estimación deja fuera no son operaciones del algoritmo.", larga: true },
        { txt: "que la máquina no le entregó los " + P7 + " núcleos al programa",
          fallo: "Con los cuatro núcleos dedicados la medida se queda corta igual, " +
            "porque la estimación no cobra nada por repartir ni por esperar y " +
            "ejecutarlo sí lo cobra.", larga: true }
      ]
    }
  ];

  function verificar() {
    var filas = [4, 8, 16, 32].map(function (n) {
      var m = medir(n);
      return "n=" + n + " -> sumas=" + m.sumas + " W(n-1)=" + trabajo(n) +
        " prof=" + m.prof + " D(log2)=" + profundidad(n) +
        " hojas=" + m.hojas + " parallel=" + m.lanzadas + " pasos=" + m.pasos;
    });
    return {
      filas: filas,
      cerradasCoinciden: [4, 8, 16, 32].every(function (n) {
        var m = medir(n);
        return m.sumas === trabajo(n) && m.prof === profundidad(n);
      }),
      presets: PRESETS.map(function (p) {
        return "n=" + p.n + " P=" + p.p + " -> D=" + profundidad(p.n) +
          " W/P=" + num(trabajo(p.n) / p.p) + " D+W/P=" + num(estimacion(p.n, p.p)) +
          " manda=" + (profundidad(p.n) >= trabajo(p.n) / p.p ? "D" : "W/P");
      }),
      escala16: ESCALA_P.map(function (p) {
        return "P=" + p + " -> " + num(estimacion(NV, p));
      }),
      ventaja: "de 2 a 4 ahorra " + num(estimacion(NV, 2) - estimacion(NV, 4)) +
        ", de 32 a 64 ahorra " + num(estimacion(NV, 32) - estimacion(NV, 64)),
      segmentRec: "W=" + entero(W7) + " D=" + D7 + " W/P=" + entero(WP7) +
        " razon=" + entero(RAZON7) + " speedup medido=" + num(S7)
    };
  }

  var API = {
    CODIGO: CODIGO, PRESETS: PRESETS, VENTAJA: VENTAJA, SITUACION: SITUACION,
    recorrer: recorrer, medir: medir, trabajo: trabajo, profundidad: profundidad,
    estimacion: estimacion, simular: simular, verificar: verificar,
    opcionesEstimacion: opcionesEstimacion, opcionesPiso: opcionesPiso,
    opcionesCota: opcionesCota
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================ la pagina ================ */

  var resueltos = { ventaja: 0, situacion: 0 };
  var fallados = 0;
  var numericas = { cota: false, estimacion: false, piso: false };

  function todasNumericas() {
    return numericas.cota && numericas.estimacion && numericas.piso;
  }

  function marcar() {
    document.getElementById("marcador-ventaja").textContent =
      "resueltas: " + resueltos.ventaja + " de " + VENTAJA.length;
    document.getElementById("marcador-situacion").textContent =
      "resueltas: " + resueltos.situacion + " de " + SITUACION.length +
      "    ·    opciones falladas: " + fallados;
    if (todasNumericas() && resueltos.ventaja === VENTAJA.length &&
        resueltos.situacion === SITUACION.length) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  function vigilar(idOpciones, idVeredicto, campo) {
    document.getElementById(idOpciones).addEventListener("click", function () {
      if (document.getElementById(idVeredicto).className.indexOf("bien") >= 0) {
        numericas[campo] = true;
        marcar();
      }
    });
  }

  function construirPresets() {
    var caja = document.getElementById("presets");
    PRESETS.forEach(function (p) {
      var b = document.createElement("button");
      b.textContent = "n = " + p.n + ", P = " + p.p;
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(caja.children, function (x) {
          x.className = x.className.replace(" primario", "");
        });
        b.className = b.className + " primario";
        Motor.reiniciar({ n: p.n, p: p.p });
      });
      caja.appendChild(b);
    });
    caja.children[0].className = caja.children[0].className + " primario";
  }

  function filaBarra(caja, rotulo, trozos, valor, tope) {
    var fila = document.createElement("div");
    var rot = document.createElement("span");
    var pista = document.createElement("div");
    var val = document.createElement("span");
    fila.className = "barra-fila";
    rot.className = "rotulo";
    rot.textContent = rotulo;
    pista.className = "pista-barra";
    trozos.forEach(function (t) {
      var barra = document.createElement("div");
      barra.className = "barra " + t.clase;
      barra.style.width = (100 * t.largo / tope) + "%";
      pista.appendChild(barra);
    });
    val.className = "valor";
    val.textContent = valor;
    fila.appendChild(rot);
    fila.appendChild(pista);
    fila.appendChild(val);
    caja.appendChild(fila);
  }

  function pintarCotas(params) {
    var W = trabajo(params.n);
    var D = profundidad(params.n);
    var wp = W / params.p;
    var tope = Math.max(D, wp);
    var caja = document.getElementById("cotas");
    caja.innerHTML = "";
    filaBarra(caja, "D(e)", [{ largo: D, clase: "b1" }], num(D), tope);
    filaBarra(caja, "W(e)/P", [{ largo: wp, clase: "b2" }], num(wp), tope);
    document.getElementById("pie-cotas").textContent =
      "Con n = " + params.n + " el recorrido deja W(e) = " + W + " sumas y D(e) = " +
      D + " niveles. Repartidas entre P = " + params.p + " núcleos, las sumas dan " +
      num(wp) + ".";
  }

  function pintarEscala(params) {
    var W = trabajo(params.n);
    var D = profundidad(params.n);
    var tope = estimacion(params.n, 1);
    var caja = document.getElementById("escala");
    caja.innerHTML = "";
    ESCALA_P.forEach(function (p) {
      filaBarra(caja, "P = " + p,
        [{ largo: D, clase: "b1" }, { largo: W / p, clase: "b2" }],
        num(estimacion(params.n, p)), tope);
    });
    document.getElementById("pie-escala").textContent =
      "Con n = " + params.n + " el trozo azul mide siempre D(e) = " + D +
      " y el ámbar es W(e)/P: " + num(W) + " con un núcleo, " + num(W / 8) +
      " con ocho y " + num(W / 64) + " con sesenta y cuatro. Al agregar núcleos se " +
      "encoge el ámbar y nada más.";
  }

  function pintarPiso(params) {
    var D = profundidad(params.n);
    document.getElementById("pie-piso").textContent =
      "Con n = " + params.n + " la estimación da " +
      num(estimacion(params.n, params.p)) + " con " + params.p + " núcleos, " +
      num(estimacion(params.n, 64)) + " con 64, " +
      num(estimacion(params.n, 1024)) + " con 1024 y " +
      num(estimacion(params.n, 1000000)) + " con un millón. Lo que sobra por encima " +
      "de D(e) = " + num(D) + " es W(e)/P, que se encoge sin llegar a cero.";
  }

  function construirTablaSegment() {
    var filas = [
      ["elementos (n)", entero(N7)],
      ["W(e), las sumas que combinan resultados", entero(W7)],
      ["D(e), niveles del árbol", String(D7)],
      ["W(e)/P con P = " + P7, entero(WP7)],
      ["cuántas veces W(e)/P supera a D(e)", entero(RAZON7)],
      ["medido, versión secuencial", MEDIDO.t1 + " ms"],
      ["medido, " + MEDIDO.p + " hilos", MEDIDO.tp + " ms"],
      ["speedup medido", num(S7)]
    ];
    var tabla = document.createElement("table");
    var cab = document.createElement("tr");
    ["Magnitud", "Valor"].forEach(function (t) {
      var th = document.createElement("th");
      th.textContent = t;
      cab.appendChild(th);
    });
    tabla.appendChild(cab);
    filas.forEach(function (f) {
      var tr = document.createElement("tr");
      var a = document.createElement("td");
      var b = document.createElement("td");
      a.textContent = f[0];
      a.style.textAlign = "left";
      b.textContent = f[1];
      tr.appendChild(a);
      tr.appendChild(b);
      tabla.appendChild(tr);
    });
    document.getElementById("tabla-segment").appendChild(tabla);
  }

  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  function construirItems(idCaja, lista, grupo, giroBase) {
    var caja = document.getElementById(idCaja);
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

  function pintarRecorrido(e) {
    var sumas = e.conteos[5] || 0;
    var hojas = e.conteos[2] || 0;
    var nivel = 0;
    var i;
    for (i = 0; i < e.k; i = i + 1) {
      if (e.pasos[i].nivel > nivel) { nivel = e.pasos[i].nivel; }
    }
    document.getElementById("cuenta-sumas").textContent = sumas;
    document.getElementById("cuenta-hojas").textContent = hojas;
    document.getElementById("cuenta-nivel").textContent = nivel;
    var pie = document.getElementById("pie-arbol");
    if (e.k === 0) {
      pie.textContent = "La primera llamada recibe el arreglo completo, [0, " +
        e.params.n + ").";
    } else if (e.terminado) {
      pie.textContent = "Recorrido completo: " + sumas + " sumas que combinan dos " +
        "resultados y " + hojas + " hojas, con el nivel más profundo en " + nivel +
        ". De ahí salen W(e) = " + sumas + " y D(e) = " + nivel + ".";
    } else {
      pie.textContent = e.actual.accion;
    }
    pintarCotas(e.params);
    pintarEscala(e.params);
    pintarPiso(e.params);
  }

  construirPresets();
  construirTablaSegment();
  construirItems("ventaja", VENTAJA, "ventaja", 1);
  construirItems("situacion", SITUACION, "situacion", 2);
  Motor.iniciar({
    codigo: CODIGO,
    simular: simular,
    chips: [
      { campo: "s", rotulo: "s" },
      { campo: "t", rotulo: "t" },
      { campo: "tam", rotulo: "t - s" },
      { campo: "nivel", rotulo: "nivel", clase: "cuenta" }
    ],
    paramsIniciales: { n: INICIAL.n, p: INICIAL.p },
    alPintar: pintarRecorrido
  });
  Motor.opcionesNumericas("opciones-cota", "veredicto-cota", opcionesCota);
  Motor.opcionesNumericas("opciones-estimacion", "veredicto-estimacion", opcionesEstimacion);
  Motor.opcionesNumericas("opciones-piso", "veredicto-piso", opcionesPiso);
  vigilar("opciones-cota", "veredicto-cota", "cota");
  vigilar("opciones-estimacion", "veredicto-estimacion", "estimacion");
  vigilar("opciones-piso", "veredicto-piso", "piso");
  marcar();
})();
