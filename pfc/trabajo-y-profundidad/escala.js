/* escala: el mismo trabajo con distinta profundidad a medida que n crece.
   El cuadro no esta escrito a mano. Para cada n la pagina reduce de verdad la
   lista 1..n sumando por parejas, cuenta las sumas que hizo y los niveles que
   necesito, y de ahi salen W, D y el speedup tope W/D. La cadena secuencial
   hace una suma por paso, asi que su profundidad es la misma cuenta de sumas.
   El tiempo con P nucleos se obtiene sumando, nivel por nivel, cuantas rondas
   de P sumas hacen falta: un nivel no empieza hasta que el anterior termina.
   Para segmentRec con umbral, la profundidad es la altura del arbol de
   particiones, log2(n / limite), mas las sumas que una hoja hace en secuencia,
   que son limite - 1. Con limite = 1 la cuenta devuelve el arbol puro y con
   limite = n devuelve la cadena secuencial, de modo que los dos extremos del
   cuadro anterior siguen saliendo.
   Los distractores son las confusiones que ocurren de verdad: tomar la
   profundidad por el speedup, usar n en lugar de W = n - 1, creer que el tope
   lo fija la maquina y olvidar lo que la hoja aporta a la profundidad. */
(function () {

  var PRESETS_N = [4, 8, 16, 32, 1024];
  var NUCLEOS = [1, 2, 4, 8, 64, 1024];
  var N_UMBRAL = 1024;
  var LIMITES = [1, 4, 16, 64, 256, 1024];

  function coma(x, cifras) {
    return x.toFixed(cifras).replace(".", ",");
  }

  function plural(n, uno, varios) {
    return n === 1 ? uno : varios;
  }

  function log2Entero(n) {
    var k = 0;
    var v = 1;
    for (k = 0; v < n; k = k + 1) { v = v * 2; }
    return k;
  }

  /* Reduce 1..n sumando por parejas y cuenta lo que hizo. */
  function nivelesDe(n) {
    var actuales = [];
    var niveles = [];
    var w = 0;
    var i;
    for (i = 1; i <= n; i = i + 1) { actuales.push(i); }
    while (actuales.length > 1) {
      var siguientes = [];
      var enNivel = 0;
      var j;
      for (j = 0; j + 1 < actuales.length; j = j + 2) {
        siguientes.push(actuales[j] + actuales[j + 1]);
        w = w + 1;
        enNivel = enNivel + 1;
      }
      if (actuales.length % 2 === 1) {
        siguientes.push(actuales[actuales.length - 1]);
      }
      niveles.push(enNivel);
      actuales = siguientes;
    }
    return { niveles: niveles, w: w, d: niveles.length, total: actuales[0] };
  }

  function filaDe(n) {
    var r = nivelesDe(n);
    return {
      n: n, w: r.w, dSec: r.w, dArbol: r.d, niveles: r.niveles,
      total: r.total, tope: r.w / r.d, texto: coma(r.w / r.d, 2)
    };
  }

  var FILAS = PRESETS_N.map(filaDe);

  function tiempoCon(niveles, p) {
    var t = 0;
    niveles.forEach(function (enNivel) { t = t + Math.ceil(enNivel / p); });
    return t;
  }

  function conNucleos(n, p) {
    var f = filaDe(n);
    var t = tiempoCon(f.niveles, p);
    return {
      n: n, p: p, tiempo: t, speedup: f.w / t, texto: coma(f.w / t, 2),
      tope: f.tope, textoTope: f.texto, primerNivel: f.niveles[0], d: f.dArbol
    };
  }

  /* segmentRec con umbral: altura del arbol de particiones mas lo que la hoja
     suma en secuencia. */
  function filaUmbral(n, limite) {
    var hojas = n / limite;
    var altura = log2Entero(hojas);
    var hoja = limite - 1;
    var w = n - 1;
    var d = altura + hoja;
    return {
      limite: limite, hojas: hojas, altura: altura, hoja: hoja,
      w: w, d: d, tope: w / d, texto: coma(w / d, 2)
    };
  }

  var FILAS_UMBRAL = LIMITES.map(function (l) { return filaUmbral(N_UMBRAL, l); });

  /* --- Carta 2: el speedup tope, que cambia con n -------------------- */

  function opcionesTope(n) {
    var f = filaDe(n);
    var lista = [
      { valor: f.texto, clave: "correcta",
        razon: "W / D = " + f.w + " / " + f.dArbol + " = " + f.texto +
          ". Es el tope: con núcleos de sobra el árbol no baja de " + f.dArbol +
          " y el trabajo sigue siendo " + f.w + "." },
      { valor: coma(n / f.dArbol, 2), clave: "con-n",
        razon: "Esa es la lectura asintótica, n / log2 n. El cuadro usa el " +
          "trabajo exacto, que es n - 1 = " + f.w + " sumas, porque la última " +
          "operación deja un solo valor." },
      { valor: coma(f.dArbol, 2), clave: "profundidad",
        razon: "Esa es la profundidad del árbol, no el speedup. El speedup " +
          "compara dos tiempos: " + f.w + " unidades de la cadena contra " +
          f.dArbol + " del árbol." },
      { valor: coma(f.dSec - f.dArbol, 2), clave: "diferencia",
        razon: "Esa es la diferencia entre las dos profundidades. El speedup " +
          "es el cociente, porque responde cuántas veces más rápido, no " +
          "cuántas unidades menos." }
    ];
    var vistos = {};
    return lista.filter(function (o) {
      var nuevo = !vistos[o.valor];
      vistos[o.valor] = true;
      return nuevo;
    });
  }

  /* --- Carta 3: la ventaja de que n crezca --------------------------- */

  var CRECIMIENTO = [
    {
      expr: "pasar de n = 16 a n = 32",
      pregunta: "¿Qué le pasa al speedup tope?",
      cierre: "Crece, de 3,75 a 6,20. El trabajo se duplica, de 15 a 31 sumas, y la profundidad sube un solo nivel, de 4 a 5. Por eso los problemas grandes se reparten mejor que los pequeños.",
      opciones: [
        { txt: "no cambia: el tope lo fija el número de núcleos de la máquina", fallo: "El tope sale de la expresión y no de la máquina: es W/D con paralelismo ilimitado. El cuadro lo calcula desde n y pasa de 3,75 a 6,20.", larga: true },
        { txt: "crece: el trabajo se duplica y la profundidad sube un solo nivel", correcta: true, larga: true },
        { txt: "se duplica exacto: el trabajo se duplica y la profundidad se mantiene", fallo: "La profundidad sube de 4 a 5, un nivel por cada vez que n se duplica. Por eso el tope pasa de 3,75 a 6,20 y no a 7,50.", larga: true },
        { txt: "baja: al crecer n el árbol tiene más niveles que hay que esperar", fallo: "Gana un nivel por duplicación mientras el trabajo se duplica, así que el cociente sube. El cuadro lo muestra hasta n = 1024, con tope 102,30.", larga: true }
      ]
    },
    {
      expr: "n = 256, que no está en el cuadro",
      pregunta: "¿Cuánto vale el speedup tope?",
      cierre: "W = 255 y D = 8, así que el tope es 31,88. Con n una potencia de dos, la profundidad del árbol es log2 n y el trabajo n - 1.",
      opciones: [
        { txt: "255,00", fallo: "Ese es el trabajo, que es también el tiempo de la cadena secuencial. El tope es el cociente del trabajo entre la profundidad." },
        { txt: "32,00", fallo: "Esa es la lectura asintótica, 256 / 8. El trabajo exacto es 255 sumas, de modo que el tope queda en 31,88." },
        { txt: "8,00", fallo: "Esa es la profundidad del árbol, log2 256. Es el denominador del tope, no el tope." },
        { txt: "31,88", correcta: true }
      ]
    }
  ];

  /* --- Carta 4: con P nucleos el tope no se alcanza ------------------- */

  var LIMITACIONES = [
    {
      expr: "n = 1024 en una máquina de cuatro núcleos",
      pregunta: "¿Qué speedup sale de ahí?",
      cierre: "3,98. El nivel 0 tiene 512 sumas listas y solo cuatro avanzan por ronda, así que ese nivel toma 128 rondas y el total queda en 257 unidades: 1023 / 257 = 3,98.",
      opciones: [
        { txt: "10,00", fallo: "Esa es la profundidad del árbol, que es el tiempo con núcleos de sobra. Con cuatro, el nivel 0 ya necesita 128 rondas." },
        { txt: "3,98", correcta: true },
        { txt: "102,30", fallo: "Ese es el tope, y supone tantos núcleos como sumas listas. La máquina tiene cuatro, de modo que el speedup no pasa de cuatro." },
        { txt: "25,58", fallo: "Esa cuenta reparte el tope entre los cuatro núcleos, 102,30 / 4. El tope ya es un límite y dividirlo no mide nada: el tiempo se calcula nivel por nivel." }
      ]
    },
    {
      expr: "el nivel 0 del árbol con n = 1024 tiene 512 sumas listas",
      pregunta: "¿Qué significa eso en una máquina de cuatro núcleos?",
      cierre: "Que ese nivel se hace en 128 rondas de cuatro sumas. El paralelismo que la expresión ofrece es mucho mayor que el de la máquina, y el tiempo se aleja de D.",
      opciones: [
        { txt: "que la profundidad sube de 10 a 128, porque cada nivel cuesta más con pocos núcleos", fallo: "La profundidad se define con paralelismo ilimitado y no cambia con la máquina: sigue siendo 10. Lo que cambia es el tiempo medido, que da 257 unidades.", larga: true },
        { txt: "que el nivel 0 no se puede repartir y hay que sumarlo de forma secuencial", fallo: "Se reparte, y es el nivel que mejor se reparte: sus 512 sumas no dependen entre sí. Lo que falta son núcleos, no independencia.", larga: true },
        { txt: "que sobra paralelismo: 512 sumas independientes alcanzan para los cuatro núcleos", fallo: "Alcanzan de sobra, y eso es justo el problema: hay 512 sumas listas y solo cuatro avanzan por ronda, así que el nivel toma 128 rondas.", larga: true },
        { txt: "que ese nivel se hace en 128 rondas de cuatro sumas, y el tiempo se aleja de D", correcta: true, larga: true }
      ]
    }
  ];

  /* --- Carta 5: segmentRec con umbral -------------------------------- */

  var CODIGO_SEGMENT = [
    "def segmentRecPar(a: Array[Int], p: Double, s: Int, t: Int): Double =",
    "  if (t - s < limite) sumSegment(a, p, s, t)",
    "  else {",
    "    val m = s + (t - s) / 2",
    "    val (sum1, sum2) = parallel(segmentRecPar(a, p, s, m),",
    "                                segmentRecPar(a, p, m, t))",
    "    sum1 + sum2",
    "  }"
  ].join("\n");

  var UMBRAL_ITEMS = [
    {
      expr: "n = 1024 y limite = 16",
      pregunta: "¿Cuánto vale D de segmentRecPar?",
      cierre: "D = 6 + 15 = 21. La recursión parte seis veces hasta llegar a segmentos de 16, y cada hoja suma sus 16 elementos en secuencia: quince sumas encadenadas.",
      opciones: [
        { txt: "21", correcta: true },
        { txt: "64", fallo: "Esas son las hojas, que es cuántas sumas secuenciales se lanzan. La profundidad es la cadena más larga, no cuántas tareas hay." },
        { txt: "6", fallo: "Esa es la altura del árbol de particiones, log2(1024/16). Falta lo que la hoja hace en secuencia, que también está en la cadena." },
        { txt: "15", fallo: "Esas son las sumas de una hoja. Antes de llegar a la hoja hay seis particiones, y cada una suma su par de resultados al volver." }
      ]
    },
    {
      expr: "subir el umbral de 16 a 256, con n = 1024",
      pregunta: "¿Qué pasa con la profundidad?",
      cierre: "Pasa de 21 a 257, y el tope cae de 48,71 a 3,98. La altura baja de 6 a 2, pero cada hoja suma 256 elementos en secuencia y esas 255 sumas entran enteras en la cadena.",
      opciones: [
        { txt: "sube de 21 a 257, porque cada hoja suma 256 elementos en secuencia", correcta: true, larga: true },
        { txt: "no cambia nada: el trabajo sigue siendo 1023 sumas con cualquier umbral", fallo: "El trabajo no cambia, y de eso se trata: lo que cambia es la profundidad, que pasa de 21 a 257. El mismo trabajo con otra forma tarda otra cosa.", larga: true },
        { txt: "baja, porque el árbol de particiones pasa de seis niveles a dos", fallo: "La altura sí baja de 6 a 2, y la hoja crece de 15 sumas a 255. La suma de las dos pasa de 21 a 257, así que la profundidad sube.", larga: true },
        { txt: "sube igual que el trabajo, porque las hojas más grandes hacen más sumas en total", fallo: "El total de sumas es 1023 con cualquier umbral: cada elemento entra una vez. Lo que cambia es dónde quedan encadenadas.", larga: true }
      ]
    },
    {
      expr: "escoger el umbral para un arreglo de 1024 elementos",
      pregunta: "¿Con qué criterio se escoge?",
      cierre: "Pequeño frente a n, y el punto exacto se mide. Las dos constantes de parallel, c1 y c2, no aparecen en este cuadro, de modo que por profundidad siempre gana el umbral más pequeño, y en la máquina no: lanzar 1024 tareas cuesta.",
      opciones: [
        { txt: "limite = 1, porque la profundidad mínima se consigue partiendo hasta un elemento", fallo: "En este cuadro sí, 10 contra 11 con limite = 4, casi lo mismo. Y esas cuatro veces menos tareas se notan en la máquina, que es lo que el cuadro no cobra.", larga: true },
        { txt: "el más grande que quepa, para lanzar la menor cantidad de tareas posible", fallo: "Con limite = 1024 la profundidad es 1023 y el tope 1,00: el programa volvió a ser secuencial. El umbral grande quita tareas y quita la ganancia.", larga: true },
        { txt: "pequeño frente a n, y el punto exacto midiendo tiempos en la máquina", correcta: true, larga: true },
        { txt: "igual a la longitud dividida entre los núcleos, que es el reparto perfecto", fallo: "Da un punto de partida y no el mínimo. Con cuatro núcleos serían hojas de 256 elementos, cuya profundidad es 257 contra 21 de las hojas de 16.", larga: true }
      ]
    }
  ];

  function verificar() {
    return {
      cuadro: FILAS.map(function (f) {
        return "n=" + f.n + ": W=" + f.w + ", D sec=" + f.dSec +
          ", D árbol=" + f.dArbol + ", tope=" + f.texto +
          ", niveles=[" + f.niveles.join(" ") + "], suma 1..n=" + f.total;
      }),
      nucleos: NUCLEOS.map(function (p) {
        var c = conNucleos(1024, p);
        return "n=1024, P=" + p + ": tiempo=" + c.tiempo + ", speedup=" + c.texto;
      }),
      umbral: FILAS_UMBRAL.map(function (u) {
        return "limite=" + u.limite + ": hojas=" + u.hojas + ", altura=" +
          u.altura + ", hoja=" + u.hoja + ", D=" + u.d + ", tope=" + u.texto;
      }),
      items: CRECIMIENTO.length + LIMITACIONES.length + UMBRAL_ITEMS.length
    };
  }

  var API = {
    PRESETS_N: PRESETS_N, NUCLEOS: NUCLEOS, LIMITES: LIMITES,
    N_UMBRAL: N_UMBRAL, FILAS: FILAS, FILAS_UMBRAL: FILAS_UMBRAL,
    CODIGO_SEGMENT: CODIGO_SEGMENT,
    CRECIMIENTO: CRECIMIENTO, LIMITACIONES: LIMITACIONES,
    UMBRAL_ITEMS: UMBRAL_ITEMS,
    nivelesDe: nivelesDe, filaDe: filaDe, tiempoCon: tiempoCon,
    conNucleos: conNucleos, filaUmbral: filaUmbral,
    opcionesTope: opcionesTope, log2Entero: log2Entero, verificar: verificar
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================ la pagina ================ */

  var estado = { n: PRESETS_N[1], p: NUCLEOS[2], limite: LIMITES[2] };
  var respondidas = {};
  var resueltos = { crecimiento: 0, limitaciones: 0, umbral: 0 };
  var fallados = 0;
  var cajaTope = null;

  function cuantasRespondidas() {
    var n = 0;
    PRESETS_N.forEach(function (v) { if (respondidas[v]) { n = n + 1; } });
    return n;
  }

  function marcar() {
    document.getElementById("marcador-topes").textContent =
      "topes calculados: " + cuantasRespondidas() + " de " + PRESETS_N.length +
      "    ·    opciones falladas: " + fallados;
    document.getElementById("marcador-crecimiento").textContent =
      "resueltas: " + resueltos.crecimiento + " de " + CRECIMIENTO.length;
    document.getElementById("marcador-limitaciones").textContent =
      "resueltas: " + resueltos.limitaciones + " de " + LIMITACIONES.length;
    document.getElementById("marcador-umbral").textContent =
      "resueltas: " + resueltos.umbral + " de " + UMBRAL_ITEMS.length;
    if (cuantasRespondidas() === PRESETS_N.length &&
        resueltos.crecimiento === CRECIMIENTO.length &&
        resueltos.limitaciones === LIMITACIONES.length &&
        resueltos.umbral === UMBRAL_ITEMS.length) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  function celda(texto, etiqueta) {
    var td = document.createElement(etiqueta || "td");
    td.textContent = texto;
    return td;
  }

  function pintarNiveles() {
    var f = filaDe(estado.n);
    var caja = document.getElementById("niveles");
    var mayor = f.niveles[0];
    caja.innerHTML = "";
    f.niveles.forEach(function (enNivel, i) {
      var fila = document.createElement("div");
      var rot = document.createElement("span");
      var pista = document.createElement("div");
      var barra = document.createElement("div");
      var valor = document.createElement("span");
      fila.className = "barra-fila";
      rot.className = "rotulo";
      rot.textContent = "nivel " + i;
      pista.className = "pista-barra";
      barra.className = "barra b" + (i % 3 + 1);
      barra.style.width = Math.max(1, Math.round(100 * enNivel / mayor)) + "%";
      valor.className = "valor";
      valor.textContent = enNivel + (enNivel === 1 ? " suma" : " sumas");
      pista.appendChild(barra);
      fila.appendChild(rot);
      fila.appendChild(pista);
      fila.appendChild(valor);
      caja.appendChild(fila);
    });
    document.getElementById("lectura-niveles").innerHTML =
      "Con n = " + f.n + " la reducción hace <b>" + f.w + "</b> sumas repartidas en <b>" +
      f.dArbol + "</b> niveles, y devuelve " + f.total + ". El nivel 0 pide <b>" +
      f.niveles[0] + "</b> sumas al mismo tiempo. La cadena secuencial hace las " +
      "mismas " + f.w + " sumas, una tras otra, de modo que su profundidad es <b>" +
      f.dSec + "</b>.";
  }

  function pintarCuadro() {
    var caja = document.getElementById("cuadro");
    var tabla = document.createElement("table");
    var cab = document.createElement("tr");
    ["n", "W", "D secuencial", "D árbol", "Speedup tope"].forEach(function (t) {
      cab.appendChild(celda(t, "th"));
    });
    tabla.appendChild(cab);
    FILAS.forEach(function (f) {
      var tr = document.createElement("tr");
      if (f.n === estado.n) { tr.className = "fila-sel"; }
      tr.appendChild(celda(String(f.n)));
      tr.appendChild(celda(String(f.w)));
      tr.appendChild(celda(String(f.dSec)));
      tr.appendChild(celda(String(f.dArbol)));
      var td = celda(respondidas[f.n] ? f.texto : "?");
      if (!respondidas[f.n]) { td.className = "pend"; }
      tr.appendChild(td);
      tabla.appendChild(tr);
    });
    var pie = document.createElement("tr");
    ["n", "n - 1", "n - 1", "log2 n", "n / log2 n"].forEach(function (t) {
      var td = celda(t);
      td.className = "pend";
      pie.appendChild(td);
    });
    tabla.appendChild(pie);
    caja.innerHTML = "";
    caja.appendChild(tabla);
    document.getElementById("pregunta-tope").textContent =
      "¿Cuál es el speedup tope con n = " + estado.n + "?";
  }

  function pintarNucleos() {
    var c = conNucleos(estado.n, estado.p);
    document.getElementById("lectura-nucleos").innerHTML =
      "Con n = " + c.n + " y " + c.p + (c.p === 1 ? " núcleo" : " núcleos") +
      ", el árbol tarda <b>" + c.tiempo + "</b> unidades y el speedup frente a la " +
      "cadena es <b>" + c.texto + "</b>. El tope con paralelismo ilimitado era " +
      c.textoTope + ", con una profundidad de " + c.d + ".";
    var rondas = Math.ceil(c.primerNivel / c.p);
    document.getElementById("nota-nucleos").textContent = rondas === 1
      ? "El nivel 0 pide " + c.primerNivel + " sumas al mismo tiempo y los " +
        c.p + " núcleos las atienden en una sola ronda, de modo que el tiempo " +
        "llega a la profundidad."
      : "El nivel 0 pide " + c.primerNivel + " sumas al mismo tiempo y solo " +
        c.p + (c.p === 1 ? " avanza" : " avanzan") + " por ronda, así que ese " +
        "nivel se lleva " + rondas + " rondas de las " + c.tiempo + " unidades.";
  }

  function pintarUmbral() {
    var caja = document.getElementById("cuadro-umbral");
    var tabla = document.createElement("table");
    var cab = document.createElement("tr");
    ["limite", "hojas", "altura", "sumas de una hoja", "D", "Speedup tope"].forEach(function (t) {
      cab.appendChild(celda(t, "th"));
    });
    tabla.appendChild(cab);
    FILAS_UMBRAL.forEach(function (u) {
      var tr = document.createElement("tr");
      if (u.limite === estado.limite) { tr.className = "fila-sel"; }
      tr.appendChild(celda(String(u.limite)));
      tr.appendChild(celda(String(u.hojas)));
      tr.appendChild(celda(String(u.altura)));
      tr.appendChild(celda(String(u.hoja)));
      tr.appendChild(celda(String(u.d)));
      tr.appendChild(celda(u.texto));
      tabla.appendChild(tr);
    });
    caja.innerHTML = "";
    caja.appendChild(tabla);
    var u = filaUmbral(N_UMBRAL, estado.limite);
    var parte = u.altura === 0
      ? "la recursión no parte nada y queda <b>1</b> segmento de " + u.limite + " elementos"
      : "la recursión parte <b>" + u.altura + "</b> veces y deja <b>" + u.hojas +
        "</b> " + plural(u.hojas, "hoja", "hojas") + " de " + u.limite + " " +
        plural(u.limite, "elemento", "elementos");
    var suma = u.hoja === 0
      ? "Un solo elemento no necesita ninguna suma"
      : (u.hojas === 1 ? "Ese segmento" : "Cada hoja") +
        " suma sus elementos en secuencia, que son " + u.hoja + " " +
        plural(u.hoja, "suma", "sumas");
    document.getElementById("lectura-umbral").innerHTML =
      "Con limite = " + u.limite + " " + parte + ". " + suma +
      ", de modo que D = " + u.altura + " + " + u.hoja + " = <b>" + u.d +
      "</b> y el tope queda en <b>" + u.texto + "</b>.";
  }

  function construirPresets(idCaja, valores, rotulo, alEscoger, inicial) {
    var caja = document.getElementById(idCaja);
    valores.forEach(function (v) {
      var b = document.createElement("button");
      b.textContent = rotulo(v);
      if (v === inicial) { b.className = "primario"; }
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(caja.children, function (x) {
          x.className = x.className.replace(" primario", "").replace("primario", "");
        });
        b.className = (b.className + " primario").replace(/^ /, "");
        alEscoger(v);
      });
      caja.appendChild(b);
    });
  }

  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  function construirItems(lista, idCaja, cuenta) {
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
      rotar(item.opciones, indice + 1).forEach(function (o) {
        var b = document.createElement("button");
        b.textContent = o.txt;
        if (o.larga) { b.className = "larga"; }
        b.addEventListener("click", function () {
          if (o.correcta) {
            b.className = b.className.replace(" errada", "") + " acertada";
            Array.prototype.forEach.call(ops.children, function (x) { x.disabled = true; });
            ver.className = "veredicto bien";
            ver.textContent = item.cierre;
            resueltos[cuenta] = resueltos[cuenta] + 1;
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

  construirPresets("presets-n", PRESETS_N, function (v) { return "n = " + v; },
    function (v) {
      estado.n = v;
      pintarNiveles();
      pintarCuadro();
      pintarNucleos();
      if (cajaTope) { cajaTope.refrescar(); }
      marcar();
    }, estado.n);
  construirPresets("presets-p", NUCLEOS,
    function (v) { return v + (v === 1 ? " núcleo" : " núcleos"); },
    function (v) {
      estado.p = v;
      pintarNucleos();
    }, estado.p);
  construirPresets("presets-limite", LIMITES,
    function (v) { return "limite = " + v; },
    function (v) {
      estado.limite = v;
      pintarUmbral();
    }, estado.limite);

  document.getElementById("codigo-segment").textContent = CODIGO_SEGMENT;

  pintarNiveles();
  pintarCuadro();
  pintarNucleos();
  pintarUmbral();
  construirItems(CRECIMIENTO, "crecimiento", "crecimiento");
  construirItems(LIMITACIONES, "limitaciones", "limitaciones");
  construirItems(UMBRAL_ITEMS, "umbral", "umbral");

  cajaTope = Motor.opcionesNumericas("opciones-tope-n", "veredicto-tope",
    function () { return opcionesTope(estado.n); });
  document.getElementById("opciones-tope-n").addEventListener("click", function () {
    if (document.getElementById("veredicto-tope").className.indexOf("bien") >= 0) {
      respondidas[estado.n] = true;
      pintarCuadro();
      marcar();
    }
  });
  marcar();
})();
