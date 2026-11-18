/* calentamiento: por que las primeras mediciones estan desfasadas y que hace
   un warmer.

   Las dos corridas son las que reporta la sesion al sumar un arreglo de 10^8
   enteros con measure, diez repeticiones cada una, en milisegundos: la primera
   sin calentamiento y la segunda envuelta en withWarmer(new Warmer.Default).
   Todo lo que la pagina muestra sale de esas dos listas: las medias, las
   medianas, los rangos, la media del bloque estable, la media tras descartar
   el peor diez por ciento y la diferencia entre las dos corridas.

   Los distractores son los errores que ocurren de verdad: tomar la mediana por
   la media, promediar solo el bloque estable cuando la pregunta pide las diez,
   confundir el punto medio entre el mejor y el peor con el promedio, restar las
   primeras mediciones en vez de las medias, creer que el warmer descarta
   atipicos despues de medir y pedir new donde hay un object. */
(function () {

  var SIN_WARMER = [
    59.766833, 54.464319, 25.126186, 26.241147, 25.830602,
    26.647554, 26.470388, 24.866799, 26.190944, 26.411821
  ];

  var CON_WARMER = [
    24.930053, 26.143745, 26.050548, 26.195989, 25.544506,
    25.203183, 27.134956, 25.314685, 25.641507, 25.922970
  ];

  /* Las dos primeras mediciones de la corrida sin calentamiento son las que
     quedan fuera del bloque estable. */
  var DESFASADAS = 2;

  /* Tiempos de segmentRec en la maquina de cuatro nucleos de la sesion, con
     n = 10^7: secuencial, dos hilos y cuatro hilos. */
  var SEGMENTREC = [42, 24, 15];

  function suma(xs) {
    return xs.reduce(function (a, b) { return a + b; }, 0);
  }

  function media(xs) {
    return suma(xs) / xs.length;
  }

  function ordenados(xs) {
    return xs.slice().sort(function (a, b) { return a - b; });
  }

  function mediana(xs) {
    var s = ordenados(xs);
    var m = Math.floor(s.length / 2);
    return s.length % 2 === 1 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  function minimo(xs) {
    return ordenados(xs)[0];
  }

  function maximo(xs) {
    var s = ordenados(xs);
    return s[s.length - 1];
  }

  function rango(xs) {
    return maximo(xs) - minimo(xs);
  }

  function puntoMedio(xs) {
    return (minimo(xs) + maximo(xs)) / 2;
  }

  /* El descarte de la sesion: ordenar, quitar el peor diez por ciento con
     dropRight y promediar el resto. */
  function sinElPeor(xs) {
    var s = ordenados(xs);
    return s.slice(0, s.length - Math.floor(xs.length / 10));
  }

  function estable(xs) {
    return xs.slice(DESFASADAS);
  }

  function resumen(xs) {
    return {
      media: media(xs),
      mediana: mediana(xs),
      primera: xs[0],
      mejor: minimo(xs),
      peor: maximo(xs),
      rango: rango(xs),
      puntoMedio: puntoMedio(xs),
      mediaEstable: media(estable(xs)),
      medianaEstable: mediana(estable(xs)),
      recortada: media(sinElPeor(xs))
    };
  }

  var CORRIDAS = [
    { clave: "sin", rotulo: "Warmer.Zero (sin calentar)",
      codigo: "measure { sumarArray(arr) }", datos: SIN_WARMER },
    { clave: "con", rotulo: "new Warmer.Default()",
      codigo: "withWarmer(new Warmer.Default) measure { sumarArray(arr) }",
      datos: CON_WARMER }
  ];

  var R = {
    sin: resumen(SIN_WARMER),
    con: resumen(CON_WARMER)
  };

  var GANANCIA = R.sin.media - R.con.media;
  var FRIO_ESCONDIDO = R.sin.primera - R.con.primera;
  var FACTOR_PRIMERA = R.sin.primera / R.sin.medianaEstable;
  var RESTO_TRAS_DESCARTE = R.sin.recortada - R.sin.mediaEstable;
  var MUEVE_DESCARTE = R.con.media - R.con.recortada;
  var RUIDO_EN_MICRO = R.sin.rango * 1000;
  var SPEEDUP_CUATRO = SEGMENTREC[0] / SEGMENTREC[2];

  function fmt(x, d) {
    return x.toFixed(d).replace(".", ",");
  }

  /* ---- las cuatro etapas --------------------------------------------- */

  var ETAPAS = [
    { etapa: "Ejecución interpretada",
      jvm: "la JVM lee el bytecode y lo ejecuta instrucción por instrucción",
      tiempo: "el más lento de los cuatro" },
    { etapa: "Compilación JIT",
      jvm: "HotSpot detecta los métodos calientes y los compila a código nativo",
      tiempo: "cae de golpe cuando el método compilado entra en servicio" },
    { etapa: "Optimizaciones especulativas",
      jvm: "incorpora llamadas, quita comprobaciones que nunca fallaron y reordena",
      tiempo: "sigue bajando, ya por tramos pequeños" },
    { etapa: "Estado estable",
      jvm: "no quedan métodos por compilar y el recolector trabaja a ritmo parejo",
      tiempo: "varía poco entre repeticiones consecutivas" }
  ];

  /* ---- los tres warmers ---------------------------------------------- */

  var WARMERS = [
    { clave: "default", txt: "new Warmer.Default()",
      comportamiento: "calentamiento adaptativo: ejecuta el bloque hasta que la varianza entre tiempos consecutivos cae bajo un umbral",
      cuando: "caso general, rendimiento sostenido" },
    { clave: "zero", txt: "Warmer.Zero",
      comportamiento: "no calienta: la primera repetición es ya la primera medición",
      cuando: "arranque en frío, latencia de la primera invocación" },
    { clave: "jvm", txt: "new Warmer.JvmHeating()",
      comportamiento: "número fijo de iteraciones, suficiente para que HotSpot compile sin esperar convergencia",
      cuando: "suites grandes donde el adaptativo resulta muy lento" }
  ];

  function trio(correcta, cierre, fallos) {
    return WARMERS.map(function (w) {
      return {
        txt: w.txt,
        correcta: w.clave === correcta,
        fallo: fallos[w.clave],
        cierre: cierre
      };
    });
  }

  /* ---- items de opcion ----------------------------------------------- */

  var DESFASE = [
    {
      expr: "El bloque medido es el mismo en las diez repeticiones. ¿Por qué la primera da " +
        fmt(R.sin.primera, 2) + " ms y la tercera " + fmt(SIN_WARMER[2], 2) + " ms?",
      cierre: "La primera corrió interpretada y para la tercera el método ya estaba compilado a código nativo. Ahí entran también la primera carga del recolector sobre el arreglo de cien millones de enteros y la asignación inicial de hilos.",
      opciones: [
        { txt: "la primera repetición incluye el tiempo de construir el arreglo de cien millones de enteros y las nueve siguientes lo reutilizan tal como quedó", fallo: "El arreglo se construye una sola vez, antes de llamar a measure, y el bloque medido solo lo recorre. Lo que cambia entre la primera y la tercera está dentro de la JVM.", larga: true },
        { txt: "la JVM interpretó el bytecode en la primera y lo compiló a código nativo antes de la tercera", correcta: true, larga: true },
        { txt: "el sistema operativo le dio menos tiempo de procesador a la primera, porque había otro proceso compitiendo en ese momento", fallo: "El experimento corre sin nadie más usando la máquina, y con ruido externo el valor alto caería en cualquier posición. Aquí los dos altos son siempre los dos primeros.", larga: true }
      ]
    }
  ];

  var QUE_HACE = [
    {
      expr: "¿Qué hace new Warmer.Default() para que la primera medición reportada ya salga estabilizada?",
      cierre: "Ejecuta el bloque repetidamente, descarta cada medición y observa la varianza entre tiempos consecutivos. Solo cuando esa varianza cae bajo un umbral interno reporta la primera medición real.",
      opciones: [
        { txt: "mide las diez repeticiones igual que antes y descarta las dos más altas antes de promediar lo que queda", fallo: "Ese es el descarte de atípicos, que es otra cosa y se hace después de medir. El warmer actúa antes, y los dos valores altos nunca llegan a reportarse.", larga: true },
        { txt: "pide a la JVM que compile el método a código nativo antes de la primera repetición, sin llegar a ejecutarlo", fallo: "No hay forma de pedir la compilación sin ejecutar: HotSpot compila lo que ve correr. El warmer lo hace correr, y por eso el calentamiento cuesta tiempo de reloj.", larga: true },
        { txt: "ejecuta y descarta hasta que la varianza entre tiempos consecutivos cae bajo un umbral", correcta: true, larga: true }
      ]
    }
  ];

  var SINTAXIS = [
    {
      expr: "De las tres líneas, ¿cuál compila?",
      cierre: "Warmer.Zero es un object y se usa tal cual. Default y JvmHeating son case class y piden new.",
      opciones: [
        { txt: "withWarmer(Warmer.Zero) measure { sumarArray(arr) }", correcta: true, larga: true },
        { txt: "withWarmer(new Warmer.Zero()) measure { sumarArray(arr) }", fallo: "Zero es un object, no una clase: ya es el único valor que hay y no se instancia con new.", larga: true },
        { txt: "withWarmer(Warmer.Default) measure { sumarArray(arr) }", fallo: "Default es una case class, así que el nombre solo no es un valor del tipo que withWarmer espera: hay que escribir new Warmer.Default.", larga: true }
      ]
    }
  ];

  var ESCOGER = [
    {
      expr: "Medir el rendimiento sostenido de sumarArray sobre cien millones de enteros, como el que va a tener el cálculo dentro de un servicio que corre todo el día.",
      opciones: trio("default",
        "Es el caso general: interesa el tiempo con la JVM ya estabilizada, y el adaptativo espera hasta que lo esté.",
        {
          zero: "Sin calentar, las dos primeras mediciones quedan desfasadas y la media de las diez sube " + fmt(GANANCIA, 2) + " ms. Eso describe el arranque, no el rendimiento sostenido.",
          jvm: "Un número fijo de iteraciones sirve cuando esperar la convergencia cuesta demasiado. Para un solo bloque y un número que va a reportarse, conviene esperarla."
        })
    },
    {
      expr: "Medir cuánto tarda la primera invocación tal como la vive quien abre la aplicación, con la JVM recién lanzada.",
      opciones: trio("zero",
        "El arranque en frío es justo lo que el calentamiento borra. Para medirlo, la primera repetición tiene que ser ya la primera medición.",
        {
          default: "Con el adaptativo esa primera invocación se gasta durante el calentamiento y no se reporta: la corrida con warmer arranca en " + fmt(R.con.primera, 2) + " ms, cuando la medición en frío fue " + fmt(R.sin.primera, 2) + ".",
          jvm: "Un número fijo de iteraciones también calienta, solo que sin esperar convergencia. Cualquier calentamiento borra lo que se quiere medir aquí."
        })
    },
    {
      expr: "Una suite con sesenta bloques, donde esperar la convergencia de cada uno vuelve impracticable la corrida completa.",
      opciones: trio("jvm",
        "Un número fijo de iteraciones basta para que HotSpot compile, y al no esperar convergencia el costo por bloque queda acotado.",
        {
          default: "Es lo más fiel por bloque y lo que vuelve impracticable la suite: el adaptativo no tiene cota de tiempo, porque repite hasta que la varianza baje.",
          zero: "Quitar el calentamiento sí acorta la suite, y entonces los sesenta números quedan medidos sobre una JVM en frío, que es un estado que el servicio no vive."
        })
    }
  ];

  var DECIDIR = [
    {
      expr: "Un equipo quiere paralelizar una normalización cuyo secuencial, ya medido, toma microsegundos.",
      cierre: "Se deja secuencial. El sobrecosto de repartir y esperar es el mismo con una entrada corta que con una larga, y aquí no hay tiempo de cálculo que lo pague.",
      opciones: [
        { txt: "repartirlo en cuatro tareas, porque con cuatro núcleos el speedup ideal es 4 y conviene acercarse a él", fallo: "El ideal es el techo, no lo que se obtiene. Con un cálculo de microsegundos, lanzar y esperar las tareas es casi todo el tiempo y el resultado queda por debajo de 1.", larga: true },
        { txt: "repartirlo y medir con Warmer.Zero, que es el warmer que deja ver el costo real de crear las tareas", fallo: "Warmer.Zero mide el arranque en frío de la JVM, no el sobrecosto de repartir. Y la decisión ya está tomada por la medida del secuencial: no hay tiempo que ahorrar.", larga: true },
        { txt: "subir el umbral de la recursión hasta que cada hoja alcance a pagar el reparto", fallo: "Subir el umbral hasta que el reparto se pague deja un solo pedazo, que es la versión secuencial escrita con más código alrededor.", larga: true },
        { txt: "dejarlo secuencial", correcta: true }
      ]
    },
    {
      expr: "Otro cálculo del mismo taller sí es grande, y nueve décimas partes de su tiempo se van en una fase que no se puede repartir.",
      cierre: "La fracción serial fija el tope: con nueve décimas sin repartir, el resto no alcanza para una ganancia que valga el trabajo, por muchos núcleos que haya.",
      opciones: [
        { txt: "conviene medir con dos, cuatro y ocho núcleos, porque la ganancia aparece cuando hay núcleos suficientes para la parte repartible", fallo: "Esa curva se aplana contra el tope que fija la fracción serial. Medirla confirma el tope y no lo mueve, y el tope se puede calcular antes de medir.", larga: true },
        { txt: "el tope de la ganancia lo fija la parte que no se reparte, y aquí deja muy poco margen", correcta: true, larga: true },
        { txt: "la décima parte repartible se puede llevar a cuatro núcleos y el cálculo completo termina en la cuarta parte del tiempo", fallo: "Solo esa décima parte se acorta, y las nueve restantes siguen costando lo mismo. El tiempo total baja muy poco.", larga: true }
      ]
    }
  ];

  var NUMERICAS = ["media", "estable", "ganancia", "descarte"];
  var TOTAL = NUMERICAS.length + DESFASE.length + QUE_HACE.length +
    SINTAXIS.length + ESCOGER.length + DECIDIR.length;

  function verificar() {
    return {
      sinWarmer: {
        media: fmt(R.sin.media, 2),
        mediana: fmt(R.sin.mediana, 2),
        primera: fmt(R.sin.primera, 2),
        rango: fmt(R.sin.rango, 2),
        mediaEstable: fmt(R.sin.mediaEstable, 2),
        medianaEstable: fmt(R.sin.medianaEstable, 2),
        puntoMedio: fmt(R.sin.puntoMedio, 2),
        recortada: fmt(R.sin.recortada, 2)
      },
      conWarmer: {
        media: fmt(R.con.media, 2),
        mediana: fmt(R.con.mediana, 2),
        primera: fmt(R.con.primera, 2),
        rango: fmt(R.con.rango, 2),
        mediaEstable: fmt(R.con.mediaEstable, 2),
        puntoMedio: fmt(R.con.puntoMedio, 2),
        recortada: fmt(R.con.recortada, 2)
      },
      ganancia: fmt(GANANCIA, 2),
      frioEscondido: fmt(FRIO_ESCONDIDO, 2),
      factorPrimera: fmt(FACTOR_PRIMERA, 2),
      restoTrasDescarte: fmt(RESTO_TRAS_DESCARTE, 2),
      mueveDescarte: fmt(MUEVE_DESCARTE, 2),
      ruidoEnMicrosegundos: Math.round(RUIDO_EN_MICRO),
      speedupCuatroHilos: fmt(SPEEDUP_CUATRO, 2),
      items: TOTAL
    };
  }

  var API = {
    SIN_WARMER: SIN_WARMER, CON_WARMER: CON_WARMER, CORRIDAS: CORRIDAS,
    R: R, ETAPAS: ETAPAS, WARMERS: WARMERS,
    GANANCIA: GANANCIA, FRIO_ESCONDIDO: FRIO_ESCONDIDO,
    DESFASE: DESFASE, QUE_HACE: QUE_HACE, SINTAXIS: SINTAXIS,
    ESCOGER: ESCOGER, DECIDIR: DECIDIR, TOTAL: TOTAL,
    media: media, mediana: mediana, sinElPeor: sinElPeor, estable: estable,
    verificar: verificar
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================ la pagina ================ */

  var corrida = CORRIDAS[0];
  var hechos = {};
  var mediaVista = {};
  var opcionesMedia = null;

  function datos() {
    return corrida.datos;
  }

  function ficha() {
    return R[corrida.clave];
  }

  function cuantos() {
    return Object.keys(hechos).length;
  }

  function marcar() {
    document.getElementById("marcador").textContent =
      "resueltos: " + cuantos() + " de " + TOTAL;
    if (cuantos() >= TOTAL) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  function resolver(clave) {
    hechos[clave] = true;
    marcar();
  }

  function tablaCon(encabezados) {
    var tabla = document.createElement("table");
    var cab = document.createElement("tr");
    encabezados.forEach(function (t) {
      var th = document.createElement("th");
      th.textContent = t;
      cab.appendChild(th);
    });
    tabla.appendChild(cab);
    return tabla;
  }

  function filaDe(textos, izquierda) {
    var tr = document.createElement("tr");
    textos.forEach(function (t, i) {
      var td = document.createElement("td");
      if (typeof t === "object") {
        td.textContent = t.txt;
        if (t.clase) { td.className = t.clase; }
      } else {
        td.textContent = t;
      }
      if (izquierda && i === 0) { td.style.textAlign = "left"; }
      tr.appendChild(td);
    });
    return tr;
  }

  /* ---- carta 1: las diez mediciones de la corrida escogida ----------- */

  function construirPresets() {
    var caja = document.getElementById("presets");
    caja.innerHTML = "";
    CORRIDAS.forEach(function (c) {
      var b = document.createElement("button");
      b.textContent = c.rotulo;
      if (c.clave === corrida.clave) { b.className = "primario"; }
      b.addEventListener("click", function () {
        corrida = c;
        construirPresets();
        construirBarras();
        construirResumen();
        if (opcionesMedia) { opcionesMedia.refrescar(); }
      });
      caja.appendChild(b);
    });
  }

  function construirBarras() {
    var caja = document.getElementById("barras");
    var tope = Math.max(maximo(SIN_WARMER), maximo(CON_WARMER));
    caja.innerHTML = "";
    document.getElementById("linea-codigo").textContent = corrida.codigo;
    datos().forEach(function (t, i) {
      var fila = document.createElement("div");
      var rot = document.createElement("span");
      var pista = document.createElement("div");
      var barra = document.createElement("div");
      var valor = document.createElement("span");
      fila.className = "barra-fila";
      rot.className = "rotulo";
      rot.textContent = "repetición " + (i + 1);
      pista.className = "pista-barra";
      barra.className = "barra b" + (i < DESFASADAS ? 2 : 1);
      barra.style.width = Math.round(100 * t / tope) + "%";
      valor.className = "valor";
      valor.textContent = fmt(t, 2) + " ms";
      pista.appendChild(barra);
      fila.appendChild(rot);
      fila.appendChild(pista);
      fila.appendChild(valor);
      caja.appendChild(fila);
    });
  }

  function construirResumen() {
    var f = ficha();
    var caja = document.getElementById("resumen");
    var tabla = tablaCon(["Qué se reporta", "Valor"]);
    var vista = mediaVista[corrida.clave];
    tabla.appendChild(filaDe([
      { txt: "media de las diez" },
      { txt: vista ? fmt(f.media, 2) + " ms" : "?",
        clase: vista ? "" : "pend" }
    ], true));
    [
      ["mediana de las diez", f.mediana],
      ["primera repetición", f.primera],
      ["mejor tiempo", f.mejor],
      ["peor tiempo", f.peor],
      ["rango entre el peor y el mejor", f.rango]
    ].forEach(function (par) {
      tabla.appendChild(filaDe([par[0], fmt(par[1], 2) + " ms"], true));
    });
    caja.innerHTML = "";
    caja.appendChild(tabla);
  }

  function armarMedia() {
    var f = ficha();
    return [
      { valor: fmt(f.media, 2), clave: "correcta",
        razon: "Es la suma de los diez valores entre diez: " + fmt(f.media, 2) +
          " ms." },
      { valor: fmt(f.mediana, 2), clave: "mediana",
        razon: "Esa es la mediana, el valor del medio al ordenar. Coincide con la " +
          "media solo cuando la muestra es pareja, y aquí la media de las diez da " +
          fmt(f.media, 2) + "." },
      { valor: fmt(f.mediaEstable, 2), clave: "estable",
        razon: "Ese es el promedio de la tercera repetición en adelante. La pregunta " +
          "pide las diez, que promedian " + fmt(f.media, 2) + "." },
      { valor: fmt(f.puntoMedio, 2), clave: "punto-medio",
        razon: "Ese es el punto medio entre el mejor y el peor tiempo, que solo mira " +
          "dos valores. La media pesa los diez, y ocho de ellos están cerca de " +
          fmt(f.mediana, 2) + ": el promedio queda en " + fmt(f.media, 2) + "." }
    ];
  }

  /* ---- carta 2: las cuatro etapas ------------------------------------ */

  function construirEtapas() {
    var caja = document.getElementById("etapas");
    var tabla = tablaCon(["Etapa", "Qué hace la JVM", "Qué le pasa al tiempo"]);
    ETAPAS.forEach(function (e) {
      tabla.appendChild(filaDe([e.etapa, e.jvm, e.tiempo], true));
    });
    caja.innerHTML = "";
    caja.appendChild(tabla);
    document.getElementById("factor-primera").textContent =
      "La primera medición sin calentamiento es " + fmt(FACTOR_PRIMERA, 2) +
      " veces la mediana del bloque estable, " + fmt(R.sin.medianaEstable, 2) +
      " ms, y el rango de esa corrida llega a " + fmt(R.sin.rango, 2) + " ms.";
  }

  function armarEstable() {
    return [
      { valor: fmt(R.sin.mediaEstable, 2), clave: "correcta",
        razon: "Las ocho de la tercera en adelante promedian " +
          fmt(R.sin.mediaEstable, 2) + " ms, y ese es el tiempo que el programa " +
          "sostiene cuando la JVM deja de estar en transición." },
      { valor: fmt(R.sin.media, 2), clave: "las-diez",
        razon: "Esa es la media de las diez, con las dos desfasadas dentro. La " +
          "pregunta pide el bloque estable, que promedia " +
          fmt(R.sin.mediaEstable, 2) + "." },
      { valor: fmt(R.sin.medianaEstable, 2), clave: "mediana-estable",
        razon: "Esa es la mediana de esas ocho mediciones, no su promedio. Las dos " +
          "cifras quedan cerca justamente porque el bloque es parejo: el promedio es " +
          fmt(R.sin.mediaEstable, 2) + "." },
      { valor: fmt(R.con.media, 2), clave: "otra-corrida",
        razon: "Ese es el promedio de las diez de la corrida con warmer, que es otra " +
          "corrida. El bloque estable de la corrida sin calentar promedia " +
          fmt(R.sin.mediaEstable, 2) + "." }
    ];
  }

  /* ---- carta 3: lo que gana el calentamiento ------------------------- */

  function construirComparacion() {
    var caja = document.getElementById("comparacion");
    var tabla = tablaCon(["", CORRIDAS[0].rotulo, CORRIDAS[1].rotulo]);
    [
      ["primera repetición", R.sin.primera, R.con.primera],
      ["media de las diez", R.sin.media, R.con.media],
      ["rango entre el peor y el mejor", R.sin.rango, R.con.rango]
    ].forEach(function (f) {
      tabla.appendChild(filaDe([f[0], fmt(f[1], 2) + " ms", fmt(f[2], 2) + " ms"], true));
    });
    caja.innerHTML = "";
    caja.appendChild(tabla);
    document.getElementById("nota-frio").textContent =
      "La corrida con warmer empieza en " + fmt(R.con.primera, 2) +
      " ms, dentro de su propio bloque, y los " + fmt(R.sin.primera, 2) +
      " ms de la JVM en frío no aparecen en ninguna de sus diez cifras: el " +
      "calentamiento los absorbió. Son " + fmt(FRIO_ESCONDIDO, 2) +
      " ms que el informe deja de mencionar, y es lo que vive quien abre la " +
      "aplicación una sola vez.";
  }

  function armarGanancia() {
    return [
      { valor: fmt(GANANCIA, 2), clave: "correcta",
        razon: fmt(R.sin.media, 2) + " menos " + fmt(R.con.media, 2) + " da " +
          fmt(GANANCIA, 2) + " ms, y ese es el peso de las dos mediciones " +
          "desfasadas repartido entre las diez." },
      { valor: fmt(R.sin.media - R.sin.mediaEstable, 2), clave: "contra-estable",
        razon: "Esa es la distancia entre la media de las diez sin calentar y su " +
          "propio bloque estable. La pregunta compara las dos corridas: " +
          fmt(R.sin.media, 2) + " contra " + fmt(R.con.media, 2) + "." },
      { valor: fmt(FRIO_ESCONDIDO, 2), clave: "primeras",
        razon: "Esa es la diferencia entre las primeras mediciones de las dos " +
          "corridas. Entre las medias de las diez la diferencia es " +
          fmt(GANANCIA, 2) + "." },
      { valor: fmt(R.sin.mediaEstable - R.con.media, 2), clave: "estables",
        razon: "Esa es la distancia entre el bloque estable de una corrida y la media " +
          "de la otra, y su tamaño dice algo: con el warmer la JVM llega al mismo " +
          "estado. Lo que la pregunta compara son las medias de las diez." }
    ];
  }

  /* ---- carta 4: el descarte del peor diez por ciento ----------------- */

  function construirDescarte() {
    document.getElementById("nota-descarte").textContent =
      "Sobre la corrida sin calentar el descarte quita una medición de diez y " +
      "la media queda todavía " + fmt(RESTO_TRAS_DESCARTE, 2) +
      " ms por encima del bloque estable, porque las desfasadas eran dos y el " +
      "descarte quitó una. Sobre la corrida con warmer la misma cuenta mueve la " +
      "media " + fmt(MUEVE_DESCARTE, 2) + " ms, de " + fmt(R.con.media, 2) +
      " a " + fmt(R.con.recortada, 2) + ": ahí no quedan atípicos que quitar.";
  }

  function armarDescarte() {
    return [
      { valor: fmt(R.sin.recortada, 2), clave: "correcta",
        razon: "Diez mediciones descartan una, la peor, y las nueve que quedan " +
          "promedian " + fmt(R.sin.recortada, 2) + " ms." },
      { valor: fmt(R.sin.media, 2), clave: "sin-descartar",
        razon: "Esa es la media de las diez, sin descartar nada. Con el descarte queda " +
          fmt(R.sin.recortada, 2) + "." },
      { valor: fmt(R.sin.mediaEstable, 2), clave: "estable",
        razon: "Ese es el promedio del bloque estable, que son ocho mediciones. El " +
          "descarte del diez por ciento quita una sola y deja " +
          fmt(R.sin.recortada, 2) + ", que es la señal de que un atípico sigue dentro." },
      { valor: fmt(R.con.recortada, 2), clave: "otra-corrida",
        razon: "Esa es la misma cuenta sobre la corrida con warmer. Sobre la corrida " +
          "sin calentar el descarte deja " + fmt(R.sin.recortada, 2) + "." }
    ];
  }

  /* ---- carta 5: los tres warmers ------------------------------------- */

  function construirWarmers() {
    var caja = document.getElementById("warmers");
    var tabla = tablaCon(["Modificador", "Comportamiento", "Cuándo usarlo"]);
    WARMERS.forEach(function (w) {
      tabla.appendChild(filaDe([w.txt, w.comportamiento, w.cuando], true));
    });
    caja.innerHTML = "";
    caja.appendChild(tabla);
  }

  /* ---- carta 6: la situacion ----------------------------------------- */

  function construirSituacion() {
    document.getElementById("nota-situacion").textContent =
      "El ruido de la corrida sin calentar abarca " + fmt(R.sin.rango, 2) +
      " ms, es decir " + Math.round(RUIDO_EN_MICRO) +
      " microsegundos: un cálculo cuyo secuencial toma microsegundos cabe entero " +
      "dentro de ese ruido. Donde sí había tiempo que ahorrar fue en segmentRec " +
      "con diez millones de elementos, que pasó de " + SEGMENTREC[0] + " ms a " +
      SEGMENTREC[2] + " ms con cuatro hilos, un speedup de " +
      fmt(SPEEDUP_CUATRO, 2) + ".";
  }

  /* ---- items de opcion ----------------------------------------------- */

  /* El sitio de la correcta esta repartido en el arreglo de cada item, asi que
     las opciones se pintan en el orden en que estan escritas. */
  function construirItems(idCaja, lista, prefijo) {
    var caja = document.getElementById(idCaja);
    lista.forEach(function (item, indice) {
      var contenedor = document.createElement("div");
      var expr = document.createElement("div");
      var ops = document.createElement("div");
      var ver = document.createElement("div");
      contenedor.className = "item";
      expr.className = "expr";
      expr.textContent = item.expr;
      ops.className = "opciones";
      ver.className = "veredicto";
      item.opciones.forEach(function (o) {
        var b = document.createElement("button");
        b.textContent = o.txt;
        if (o.larga) { b.className = "larga"; }
        b.addEventListener("click", function () {
          if (o.correcta) {
            b.className = b.className.replace(" errada", "") + " acertada";
            Array.prototype.forEach.call(ops.children, function (x) { x.disabled = true; });
            ver.className = "veredicto bien";
            ver.textContent = o.cierre || item.cierre;
            resolver(prefijo + indice);
          } else {
            b.className = b.className + " errada";
            b.disabled = true;
            ver.className = "veredicto mal";
            ver.textContent = o.fallo;
          }
        });
        ops.appendChild(b);
      });
      contenedor.appendChild(expr);
      contenedor.appendChild(ops);
      contenedor.appendChild(ver);
      caja.appendChild(contenedor);
    });
  }

  /* Los botones que pinta el motor llevan data-op y el clic sube hasta la caja,
     asi que el acierto se oye ahi sin volver a cablear cada boton. */
  function seguir(idOpciones, clave, alAcertar) {
    document.getElementById(idOpciones).addEventListener("click", function (ev) {
      var b = ev.target;
      if (!b || b.tagName !== "BUTTON") { return; }
      if (b.getAttribute("data-op") !== "correcta") { return; }
      resolver(clave);
      if (alAcertar) { alAcertar(); }
    });
  }

  construirPresets();
  construirBarras();
  construirResumen();
  construirEtapas();
  construirComparacion();
  construirDescarte();
  construirWarmers();
  construirSituacion();
  construirItems("desfase", DESFASE, "desfase-");
  construirItems("que-hace", QUE_HACE, "que-hace-");
  construirItems("sintaxis", SINTAXIS, "sintaxis-");
  construirItems("escoger", ESCOGER, "escoger-");
  construirItems("decidir", DECIDIR, "decidir-");

  opcionesMedia = Motor.opcionesNumericas("opciones-media", "veredicto-media", armarMedia);
  Motor.opcionesNumericas("opciones-estable", "veredicto-estable", armarEstable);
  Motor.opcionesNumericas("opciones-ganancia", "veredicto-ganancia", armarGanancia);
  Motor.opcionesNumericas("opciones-descarte", "veredicto-descarte", armarDescarte);

  seguir("opciones-media", "media", function () {
    mediaVista[corrida.clave] = true;
    construirResumen();
  });
  seguir("opciones-estable", "estable", null);
  seguir("opciones-ganancia", "ganancia", null);
  seguir("opciones-descarte", "descarte", null);

  marcar();
})();
