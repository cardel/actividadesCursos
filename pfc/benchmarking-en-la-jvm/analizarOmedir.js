/* analizarOmedir: dos preguntas distintas y dos herramientas distintas.

   Lo que entrega el analisis se calcula aqui contando los niveles de la suma
   en arbol: el trabajo W es la suma de la columna de sumas y la profundidad D
   es el numero de niveles, de modo que ninguna de las dos cifras esta escrita
   a mano. Lo que entrega la medicion son los diez tiempos del experimento
   mental de la sesion, en milisegundos, y de ellos salen la media, la mediana,
   el rango, la media tras descartar el peor diez por ciento y los dos speedup
   extremos que daria medir una sola vez cada version.

   Los distractores son las confusiones que ocurren de verdad: contar una suma
   por elemento, tomar los nodos del arbol por las sumas, confundir el ancho
   del primer nivel con el paralelismo disponible, restar en vez de dividir,
   reportar la media de una muestra que trae un atipico dentro y quedarse con
   el mejor tiempo creyendo que eso es descartar el peor. */
(function () {

  /* ---- lo que responde el analisis: la suma en arbol ------------------ */

  var PRESETS = [1024, 16384, 262144, 1048576];

  /* Un nivel toma los valores que le entran, suma las parejas que alcanza a
     formar y deja pasar el impar si sobra. El arbol termina cuando queda un
     solo valor, asi que los niveles se cuentan hasta ahi. */
  function niveles(n) {
    var filas = [];
    var entran = n;
    var sumas;
    while (entran > 1) {
      sumas = Math.floor(entran / 2);
      filas.push({
        nivel: filas.length + 1,
        entran: entran,
        sumas: sumas,
        salen: entran - sumas
      });
      entran = entran - sumas;
    }
    return filas;
  }

  function trabajo(n) {
    return niveles(n).reduce(function (a, f) { return a + f.sumas; }, 0);
  }

  function profundidad(n) {
    return niveles(n).length;
  }

  /* Cuantas sumas quedan por nivel en promedio, que es tambien por cuanto se
     diferencian los pasos en secuencia del ciclo y del arbol. */
  function razon(n) {
    return trabajo(n) / profundidad(n);
  }

  /* ---- lo que entrega la medicion: diez corridas del mismo programa --- */

  var ACTIVACION = [40.1, 9.4, 8.1, 9.7, 10.1, 9.4, 9.3, 10.4, 10.9, 9.7];

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

  /* El descarte de la sesion: ordenar, quitar el peor diez por ciento con
     dropRight y promediar el resto. */
  function sinElPeor(xs) {
    var s = ordenados(xs);
    return s.slice(0, s.length - Math.floor(xs.length / 10));
  }

  var MED = {
    media: media(ACTIVACION),
    mediana: mediana(ACTIVACION),
    minimo: minimo(ACTIVACION),
    maximo: maximo(ACTIVACION),
    rango: maximo(ACTIVACION) - minimo(ACTIVACION),
    recortada: media(sinElPeor(ACTIVACION)),
    factorPrimera: ACTIVACION[0] / mediana(ACTIVACION),
    speedupAlto: maximo(ACTIVACION) / minimo(ACTIVACION),
    speedupBajo: minimo(ACTIVACION) / maximo(ACTIVACION)
  };

  function fmt(x, d) {
    return x.toFixed(d).replace(".", ",");
  }

  /* ---- clasificar seis preguntas ------------------------------------- */

  var ANALISIS = "Análisis asintótico";
  var MEDICION = "Medición";

  function par(cualEsCorrecta, cierre, falloAnalisis, falloMedicion) {
    return [
      {
        txt: ANALISIS,
        correcta: cualEsCorrecta === "analisis",
        fallo: falloAnalisis,
        cierre: cierre
      },
      {
        txt: MEDICION,
        correcta: cualEsCorrecta === "medicion",
        fallo: falloMedicion,
        cierre: cierre
      }
    ];
  }

  var CLASIFICAR = [
    {
      expr: "¿Cuántas sumas hace la suma en árbol sobre un arreglo de n elementos?",
      opciones: par("analisis",
        "El conteo sale de la forma del algoritmo y vale para cualquier n y cualquier máquina.",
        null,
        "Se puede medir cuánto tarda, y el número de sumas no se lee de ningún reloj: dos máquinas que tardan tiempos muy distintos hacen exactamente las mismas sumas.")
    },
    {
      expr: "¿Cuántos milisegundos tarda sumarArray sobre un arreglo de cien millones de enteros en este portátil, con esta JVM?",
      opciones: par("medicion",
        "La pregunta nombra la máquina, la JVM y la entrada, y la respuesta es un número con ruido que hay que estimar corriendo el bloque varias veces.",
        "El análisis no entrega milisegundos. De una cota de crecimiento no sale un tiempo concreto: faltan la velocidad del procesador, la memoria y el estado en que está la JVM.",
        null)
    },
    {
      expr: "El mismo bloque, medido diez veces en la misma máquina, dio diez valores distintos. ¿Cuál se reporta como el tiempo del programa?",
      opciones: par("medicion",
        "Es una pregunta sobre la muestra: qué valor resiste el atípico. Se responde con los diez números en la mano.",
        "La predicción del análisis es una sola y los diez valores salen del mismo código, así que la dispersión entre corridas queda por completo fuera de su alcance.",
        null)
    },
    {
      expr: "Al pasar la entrada de diez millones a cien millones de elementos, ¿el tiempo crece por diez o por cien?",
      opciones: par("analisis",
        "El factor lo fija el orden de crecimiento: lineal crece por diez y cuadrático por cien. La respuesta llega antes de tener la máquina.",
        null,
        "Medir las dos entradas confirma el factor, y para saber cuál esperar basta el orden de crecimiento del algoritmo, que es lo que permite anticiparlo con una entrada que todavía no se puede correr.")
    },
    {
      expr: "La versión de segmentRec con cuatro hilos, ¿termina antes que la secuencial en esta máquina?",
      opciones: par("medicion",
        "El análisis dice que hay paralelismo disponible; si la ganancia paga el sobrecosto lo dice el reloj. En la sesión fueron 42 ms contra 15 ms.",
        "De W y D sale el speedup ideal, no el que se obtiene. El sobrecosto de lanzar y esperar, la parte que no se reparte y la contención de memoria aparecen al medir.",
        null)
    },
    {
      expr: "¿Hay un tope a la ganancia que ningún número de núcleos puede pasar en este programa?",
      opciones: par("analisis",
        "El tope lo fija el algoritmo: la fracción que no se reparte y la profundidad D. Se calcula antes de conseguir un solo núcleo más.",
        null,
        "Se puede medir con dos, cuatro y ocho núcleos y ver la curva aplanarse, y el tope ya estaba en el algoritmo antes de la primera corrida: lo ponen la parte serial y D.")
    }
  ];

  /* ---- decidir con las dos ------------------------------------------- */

  var DECIDIR = [
    {
      expr: "Dos integrantes implementaron la suma del arreglo, uno en un ciclo de cola y el otro en árbol con parallel. ¿Qué parte de la discusión resuelve el análisis que ya hicieron?",
      cierre: "Que la versión en árbol tiene paralelismo disponible y el ciclo no, y que esa diferencia crece con n. El análisis dice que hay algo que ganar, no cuánto se gana aquí.",
      opciones: [
        { txt: "que la versión en árbol va a terminar antes que el ciclo en la máquina del equipo", fallo: "El análisis no habla de esta máquina. Dice que hay paralelismo disponible, y que la implementación lo aproveche depende del sobrecosto de parallel, del umbral y de los núcleos que haya.", larga: true },
        { txt: "que la versión en árbol reparte el mismo trabajo en muchos menos pasos en secuencia, y que esa ventaja crece con n", correcta: true, larga: true },
        { txt: "que las dos versiones son equivalentes, porque las dos hacen las mismas sumas y quedan en el mismo orden de crecimiento", fallo: "Las dos tienen el mismo trabajo y el mismo orden de crecimiento, y ahí se queda corto el análisis secuencial: no distingue cuáles de esas sumas pueden ocurrir al mismo tiempo.", larga: true }
      ]
    },
    {
      expr: "Midieron una vez la secuencial y una vez la paralela, el speedup salió 0,8 y hay que decidir qué hacer con la versión paralela.",
      cierre: "Volver a medir las dos, con calentamiento y varias repeticiones, y comparar valores que resistan el atípico. Con los diez tiempos de arriba, dos corridas del mismo programa dan speedup entre 0,20 y 4,95, así que un 0,8 de una sola pareja de medidas no decide nada.",
      opciones: [
        { txt: "descartar la versión paralela, porque un speedup por debajo de 1 significa que repartir salió más caro que no repartir", fallo: "Eso es lo que significaría si el 0,8 fuera confiable. Con una sola medición de cada lado, el mismo programa comparado consigo mismo habría dado entre 0,20 y 4,95 en estos diez tiempos.", larga: true },
        { txt: "quedarse con la paralela y dejar la medición de lado, porque el análisis no depende de la máquina y ya dijo que hay paralelismo", fallo: "El análisis dice que hay paralelismo disponible, no que esta implementación lo aproveche. Para eso está la medición, que es la que confirma o desmiente la predicción.", larga: true },
        { txt: "repetir las dos medidas con calentamiento y varias repeticiones antes de decidir", correcta: true, larga: true },
        { txt: "repetir solo la medición de la paralela, que es la sospechosa", fallo: "El speedup es un cociente y los dos tiempos son variables aleatorias. Medir bien un lado y mal el otro deja el resultado igual de incierto.", larga: true }
      ]
    }
  ];

  var NUMERICAS = ["trabajo", "razon", "descarte"];
  var TOTAL = NUMERICAS.length + CLASIFICAR.length + DECIDIR.length;

  function verificar() {
    return {
      analisis: PRESETS.map(function (n) {
        return "n = " + n + ": W = " + trabajo(n) + ", D = " + profundidad(n) +
          ", W/D = " + fmt(razon(n), 2) + ", niveles contados = " + niveles(n).length;
      }),
      medicion: {
        media: fmt(MED.media, 2),
        mediana: fmt(MED.mediana, 2),
        rango: fmt(MED.rango, 2),
        recortada: fmt(MED.recortada, 2),
        factorPrimera: fmt(MED.factorPrimera, 2),
        speedupAlto: fmt(MED.speedupAlto, 2),
        speedupBajo: fmt(MED.speedupBajo, 2)
      },
      items: TOTAL
    };
  }

  var API = {
    PRESETS: PRESETS, niveles: niveles, trabajo: trabajo,
    profundidad: profundidad, razon: razon,
    ACTIVACION: ACTIVACION, MED: MED, sinElPeor: sinElPeor,
    CLASIFICAR: CLASIFICAR, DECIDIR: DECIDIR, TOTAL: TOTAL,
    verificar: verificar
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================ la pagina ================ */

  var elegido = PRESETS[0];
  var hechos = {};
  var opcionesTrabajo = null;
  var opcionesRazon = null;

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

  function celdas(fila, textos, izquierda) {
    textos.forEach(function (t, i) {
      var td = document.createElement("td");
      if (typeof t === "object") {
        td.textContent = t.txt;
        td.className = t.clase || "";
        if (t.id) { td.id = t.id; }
      } else {
        td.textContent = t;
      }
      if (izquierda && i === 0) { td.style.textAlign = "left"; }
      fila.appendChild(td);
    });
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

  /* ---- carta 1: los niveles del arbol -------------------------------- */

  function construirPresets() {
    var caja = document.getElementById("presets");
    caja.innerHTML = "";
    PRESETS.forEach(function (n) {
      var b = document.createElement("button");
      b.textContent = "n = " + n;
      if (n === elegido) { b.className = "primario"; }
      b.addEventListener("click", function () {
        elegido = n;
        construirPresets();
        construirNiveles();
        construirRazones();
        if (opcionesTrabajo) { opcionesTrabajo.refrescar(); }
        if (opcionesRazon) { opcionesRazon.refrescar(); }
      });
      caja.appendChild(b);
    });
  }

  function construirNiveles() {
    var caja = document.getElementById("tabla-niveles");
    var filas = niveles(elegido);
    var tabla = tablaCon(["Nivel", "Valores que entran", "Sumas del nivel", "Valores que salen"]);
    filas.forEach(function (f) {
      var tr = document.createElement("tr");
      celdas(tr, [f.nivel, f.entran, f.sumas, f.salen]);
      tabla.appendChild(tr);
    });
    var total = document.createElement("tr");
    celdas(total, [
      { txt: "total" },
      { txt: "" },
      { txt: hechos.trabajo ? String(trabajo(elegido)) : "?",
        clase: hechos.trabajo ? "" : "pend", id: "celda-trabajo" },
      { txt: "1" }
    ]);
    tabla.appendChild(total);
    caja.innerHTML = "";
    caja.appendChild(tabla);
    document.getElementById("cuenta-niveles").textContent =
      "La tabla tiene " + filas.length + " niveles con n = " + elegido +
      ", y el último deja un solo valor.";
  }

  function armarTrabajo() {
    var n = elegido;
    var lista = [
      { valor: trabajo(n), clave: "correcta",
        razon: "Son " + trabajo(n) + " sumas, la suma de la columna del medio. " +
          "Cada suma consume dos valores y devuelve uno, así que para pasar de " +
          n + " valores a uno hacen falta " + trabajo(n) + "." },
      { valor: n, clave: "una-por-elemento",
        razon: "Una suma por elemento cuenta de más: el primer valor no se suma a nada, " +
          "entra al árbol tal como está. El conteo correcto es " + trabajo(n) + "." },
      { valor: 2 * n - 1, clave: "nodos",
        razon: "Ese es el número de nodos del árbol con las hojas incluidas, y las hojas " +
          "no suman: son los elementos del arreglo. Las sumas son los nodos internos, " +
          trabajo(n) + "." },
      { valor: Math.floor(n / 2), clave: "primer-nivel",
        razon: "Esas son las sumas del primer nivel, la primera fila de la tabla. El " +
          "trabajo cuenta todas las filas, y el total es " + trabajo(n) + "." }
    ];
    return lista;
  }

  function armarRazon() {
    var n = elegido;
    var w = trabajo(n);
    var d = profundidad(n);
    var lista = [
      { valor: fmt(razon(n), 2), clave: "correcta",
        razon: w + " / " + d + " = " + fmt(razon(n), 2) + ". El ciclo gasta en secuencia " +
          "las " + w + " sumas y el árbol las reparte en " + d + " niveles, de modo que " +
          "el árbol llega al resultado en " + fmt(razon(n), 2) + " veces menos pasos." },
      { valor: String(Math.floor(n / 2)), clave: "primer-nivel",
        razon: "Ese es el ancho del primer nivel, el máximo de sumas que pueden ocurrir " +
          "a la vez. La razón entre las dos profundidades promedia sobre los " + d +
          " niveles, y los últimos tienen muy pocas sumas: " + fmt(razon(n), 2) + "." },
      { valor: String(d), clave: "profundidad",
        razon: "Esa es la profundidad del árbol. La pregunta compara las dos " +
          "profundidades, " + w + " contra " + d + ", y el cociente es " +
          fmt(razon(n), 2) + "." },
      { valor: String(w - d), clave: "resta",
        razon: "Esa es la diferencia, no el factor. Un factor es un cociente: " +
          w + " / " + d + " = " + fmt(razon(n), 2) + "." }
    ];
    return lista;
  }

  /* ---- carta 3: la razon para cada n --------------------------------- */

  function construirRazones() {
    var caja = document.getElementById("tabla-razones");
    var tabla = tablaCon(["n", "Trabajo W", "Profundidad D", "W / D"]);
    PRESETS.forEach(function (n) {
      var tr = document.createElement("tr");
      var oculta = n === elegido && !hechos.razon;
      celdas(tr, [
        n,
        trabajo(n),
        profundidad(n),
        { txt: oculta ? "?" : fmt(razon(n), 2), clase: oculta ? "pend" : "" }
      ]);
      tabla.appendChild(tr);
    });
    caja.innerHTML = "";
    caja.appendChild(tabla);
  }

  /* ---- carta 4: las diez mediciones ---------------------------------- */

  function construirBarras() {
    var caja = document.getElementById("barras");
    var tope = MED.maximo;
    ACTIVACION.forEach(function (t, i) {
      var fila = document.createElement("div");
      var rot = document.createElement("span");
      var pista = document.createElement("div");
      var barra = document.createElement("div");
      var valor = document.createElement("span");
      fila.className = "barra-fila";
      rot.className = "rotulo";
      rot.textContent = "medición " + (i + 1);
      pista.className = "pista-barra";
      barra.className = "barra b" + (i === 0 ? 2 : 1);
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
    var caja = document.getElementById("resumen");
    var tabla = tablaCon(["Qué se reporta", "Valor"]);
    var filas = [
      ["media de las diez", fmt(MED.media, 2) + " ms"],
      ["mediana de las diez", fmt(MED.mediana, 2) + " ms"],
      ["mejor tiempo", fmt(MED.minimo, 2) + " ms"],
      ["peor tiempo", fmt(MED.maximo, 2) + " ms"],
      ["rango entre el peor y el mejor", fmt(MED.rango, 2) + " ms"]
    ];
    filas.forEach(function (f) {
      var tr = document.createElement("tr");
      celdas(tr, f, true);
      tabla.appendChild(tr);
    });
    var tr = document.createElement("tr");
    celdas(tr, [
      { txt: "media tras descartar el peor diez por ciento" },
      { txt: hechos.descarte ? fmt(MED.recortada, 2) + " ms" : "?",
        clase: hechos.descarte ? "" : "pend", id: "celda-descarte" }
    ], true);
    tabla.appendChild(tr);
    caja.innerHTML = "";
    caja.appendChild(tabla);
    document.getElementById("factor-primera").textContent =
      "La primera medición es " + fmt(MED.factorPrimera, 2) +
      " veces la mediana, y el rango de las diez llega a " + fmt(MED.rango, 2) +
      " ms sobre una mediana de " + fmt(MED.mediana, 2) +
      " ms. Una sola corrida puede caer en cualquier punto de ese tramo.";
  }

  function armarDescarte() {
    return [
      { valor: fmt(MED.recortada, 2), clave: "correcta",
        razon: "Diez mediciones descartan una, la peor, y quedan nueve que promedian " +
          fmt(MED.recortada, 2) + " ms. Es el promedio del bloque que se repite." },
      { valor: fmt(MED.media, 2), clave: "sin-descartar",
        razon: "Esa es la media de los diez, sin descartar nada, y el " +
          fmt(MED.maximo, 2) + " de la primera la levanta casi tres milisegundos por " +
          "encima del resto. Con el descarte queda " + fmt(MED.recortada, 2) + "." },
      { valor: fmt(MED.mediana, 2), clave: "mediana",
        razon: "Esa es la mediana de los diez. También resiste el atípico, y es otra " +
          "cuenta: aquí se ordena, se quita el peor valor y se promedian los nueve " +
          "que quedan, lo que da " + fmt(MED.recortada, 2) + "." },
      { valor: fmt(MED.minimo, 2), clave: "mejor",
        razon: "Ese es el mejor de los diez. Descartar el peor no es quedarse con el " +
          "mejor, que tampoco se repite cuando el programa vuelve a correr." }
    ];
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

  /* El acierto de una opcion numerica se oye en el contenedor: los botones que
     pinta el motor llevan data-op y el clic sube hasta la caja. */
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
  construirNiveles();
  construirRazones();
  construirBarras();
  construirResumen();
  construirItems("clasificar", CLASIFICAR, "clasificar-");
  construirItems("decidir", DECIDIR, "decidir-");

  opcionesTrabajo = Motor.opcionesNumericas("opciones-trabajo", "veredicto-trabajo", armarTrabajo);
  opcionesRazon = Motor.opcionesNumericas("opciones-razon", "veredicto-razon", armarRazon);
  Motor.opcionesNumericas("opciones-descarte", "veredicto-descarte", armarDescarte);

  seguir("opciones-trabajo", "trabajo", construirNiveles);
  seguir("opciones-razon", "razon", construirRazones);
  seguir("opciones-descarte", "descarte", construirResumen);

  marcar();
})();
