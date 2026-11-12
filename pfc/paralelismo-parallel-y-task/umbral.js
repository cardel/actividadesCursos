/* umbral: el arbol de llamadas de segmentRec y lo que decide el umbral.
   El codigo es el del deck de abstracciones para la concurrencia, con la
   condicion estricta t - s < UMBRAL y la particion en m = s + (t - s) / 2 con
   division entera. El recorrido no esta escrito a mano: se genera corriendo
   esa misma recursion sobre los parametros de cada preset, de modo que las
   hojas y las llamadas a parallel que muestra la pagina son las que produce
   el codigo.
   La trampa del umbral estricto es real: un segmento que mide exactamente el
   umbral todavia se parte, y con UMBRAL = 1 la recursion no llega a un
   segmento mas pequeno y no termina. */
(function () {

  var CODIGO = [
    { txt: "def segmentRec(a: Array[Int], p: Double,", num: null },
    { txt: "               s: Int, t: Int): Double =", num: null },
    { txt: "  if (t - s < UMBRAL)", num: 1 },
    { txt: "    sumSegment(a, p, s, t)", num: 2 },
    { txt: "  else {", num: null },
    { txt: "    val m = s + (t - s) / 2", num: 3 },
    { txt: "    val (s1, s2) = parallel(", num: 4 },
    { txt: "      segmentRec(a, p, s, m),", num: null },
    { txt: "      segmentRec(a, p, m, t)", num: null },
    { txt: "    )", num: null },
    { txt: "    s1 + s2", num: null },
    { txt: "  }", num: null }
  ];

  var TOPE = 6000;

  /* Un paso por linea que se ejecuta, en el orden en que la recursion las
     visita. Si el recorrido pasa del tope, la recursion no esta terminando. */
  function recorrer(n, umbral) {
    var pasos = [];
    var desborda = false;

    function visitar(s, t) {
      if (desborda) { return; }
      if (pasos.length > TOPE) { desborda = true; return; }
      var tam = t - s;
      pasos.push({ linea: 1, s: s, t: t, tam: tam, umbral: umbral,
                   accion: "¿" + tam + " < " + umbral + "?" });
      if (tam < umbral) {
        pasos.push({ linea: 2, s: s, t: t, tam: tam, umbral: umbral,
                     accion: "suma secuencial de " + tam + " elementos" });
        return;
      }
      var m = s + Math.floor(tam / 2);
      pasos.push({ linea: 3, s: s, t: t, tam: tam, umbral: umbral,
                   accion: "parte en m = " + m });
      pasos.push({ linea: 4, s: s, t: t, tam: tam, umbral: umbral,
                   accion: "lanza [" + s + ", " + m + ") y [" + m + ", " + t + ")" });
      visitar(s, m);
      visitar(m, t);
    }

    visitar(0, n);
    return { pasos: pasos, desborda: desborda };
  }

  function contar(n, umbral) {
    var r = recorrer(n, umbral);
    var hojas = 0;
    var parciones = 0;
    r.pasos.forEach(function (p) {
      if (p.linea === 2) { hojas = hojas + 1; }
      if (p.linea === 4) { parciones = parciones + 1; }
    });
    return { hojas: hojas, parciones: parciones, pasos: r.pasos.length, desborda: r.desborda };
  }

  function simular(params) {
    return recorrer(params.n, params.umbral).pasos;
  }

  var PRESETS = [
    { n: 40000, umbral: 10000 },
    { n: 40000, umbral: 20000 },
    { n: 30000, umbral: 10000 },
    { n: 10000, umbral: 10000 }
  ];

  var INICIAL = PRESETS[0];
  var OBJETIVO = contar(INICIAL.n, INICIAL.umbral).hojas;

  /* --- Carta 3: lo que decide el umbral ------------------------------ */

  var DECISIONES = [
    {
      expr: "n = 10000 y UMBRAL = 10000",
      pregunta: "¿Cuántas sumas secuenciales hace segmentRec?",
      cierre: "Dos. La condición es t - s < UMBRAL, estricta, así que un segmento que mide exactamente el umbral todavía se parte: quedan dos mitades de 5000 y cada una sí cumple la condición.",
      opciones: [
        { txt: "una, porque el segmento mide exactamente el umbral y se calcula de una vez", fallo: "La condición es estricta: 10000 < 10000 es falso, así que ese segmento no se calcula de una vez, se parte.", larga: true },
        { txt: "dos, porque 10000 no es menor que 10000 y el segmento se parte una vez", correcta: true, larga: true },
        { txt: "ninguna, porque el umbral iguala el tamaño y el caso base nunca se alcanza", fallo: "El caso base se alcanza en la partición siguiente: las dos mitades de 5000 sí son menores que el umbral.", larga: true }
      ]
    },
    {
      expr: "UMBRAL = 1",
      pregunta: "¿Qué hace este código con ese umbral?",
      cierre: "No termina. Un segmento de un elemento no cumple 1 < 1, y al partirlo m queda igual a s: la primera mitad es vacía y la segunda es el mismo segmento otra vez.",
      opciones: [
        { txt: "es el umbral más rápido, porque reparte el trabajo entre todos los núcleos disponibles", fallo: "Con un umbral así de pequeño el costo de lanzar tareas se come la ganancia, y en este código pasa algo peor: la recursión no termina.", larga: true },
        { txt: "se parte hasta segmentos de un elemento y ahí hace la suma secuencial", fallo: "Un segmento de un elemento no cumple 1 < 1, así que no llega a la suma secuencial: se parte otra vez.", larga: true },
        { txt: "no compila, porque el umbral tiene que ser mayor que el tamaño del paso de la partición", fallo: "El umbral es un entero cualquiera y el código compila. El problema aparece al correrlo.", larga: true },
        { txt: "no termina: el segmento de un elemento se parte en uno vacío y en sí mismo", correcta: true, larga: true }
      ]
    },
    {
      expr: "UMBRAL mayor que la longitud del arreglo",
      pregunta: "¿Qué queda del paralelismo?",
      cierre: "Nada: la primera llamada cumple la condición y hace la suma secuencial completa. No se llega a ningún parallel.",
      opciones: [
        { txt: "nada: la primera llamada ya cumple la condición y suma todo de forma secuencial", correcta: true, larga: true },
        { txt: "el arreglo se parte una vez y quedan dos sumas secuenciales, una por mitad", fallo: "Para que se parta una vez, el umbral tendría que ser menor o igual que la longitud. Si es mayor, la condición se cumple de entrada.", larga: true },
        { txt: "se reparte igual, porque parallel se invoca antes de comparar con el umbral", fallo: "La comparación es lo primero que hace la función, y el parallel está en la rama else. Con el umbral grande esa rama no se visita.", larga: true }
      ]
    },
    {
      expr: "¿con qué criterio se escoge el umbral?",
      pregunta: "Escoja el que sirve.",
      cierre: "Midiendo en la máquina donde va a correr. El óptimo depende del número de núcleos y del costo de cada operación, y la curva de tiempo contra umbral tiene su mínimo en un punto que no se adivina.",
      opciones: [
        { txt: "dividiendo la longitud del arreglo entre el número de núcleos de la máquina", fallo: "La cuenta da un punto de partida razonable y no el mínimo. Dos máquinas con el mismo número de núcleos dan curvas distintas, porque el costo por operación y la memoria no son iguales.", larga: true },
        { txt: "el más pequeño que la máquina soporte, para que ningún núcleo quede ocioso", fallo: "Con un umbral muy pequeño se lanzan tantas tareas que el costo de coordinarlas domina el tiempo. La curva sube por ese lado igual que por el otro.", larga: true },
        { txt: "midiendo el tiempo con varios umbrales en la máquina donde va a correr", correcta: true, larga: true }
      ]
    }
  ];

  function verificar() {
    return {
      presets: PRESETS.map(function (p) {
        var c = contar(p.n, p.umbral);
        return "n=" + p.n + " umbral=" + p.umbral + " -> hojas=" + c.hojas +
               " parallel=" + c.parciones + " pasos=" + c.pasos;
      }),
      umbralUno: contar(8, 1).desborda,
      umbralDos: contar(8, 2),
      mayorQueN: contar(40000, 50000)
    };
  }

  var API = {
    CODIGO: CODIGO, PRESETS: PRESETS, OBJETIVO: OBJETIVO,
    DECISIONES: DECISIONES, contar: contar, simular: simular, verificar: verificar
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================ la pagina ================ */

  var resueltos = { decisiones: 0 };
  var fallados = 0;
  var acerto = false;

  function marcar() {
    document.getElementById("marcador-decisiones").textContent =
      "resueltas: " + resueltos.decisiones + " de " + DECISIONES.length +
      "    ·    opciones falladas: " + fallados;
    if (acerto && resueltos.decisiones === DECISIONES.length) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  function cablearPrediccion() {
    document.getElementById("btn-comprobar").addEventListener("click", function () {
      var v = document.getElementById("veredicto");
      var valor = parseInt(document.getElementById("prediccion").value, 10);
      if (isNaN(valor)) {
        v.className = "veredicto mal";
        v.textContent = "Escriba un número primero.";
        return;
      }
      if (valor === OBJETIVO) {
        v.className = "veredicto bien";
        v.textContent = OBJETIVO + " sumas secuenciales, de 5000 elementos cada una. " +
          "Los segmentos de 10000 no se quedan quietos: 10000 < 10000 es falso y se parten una vez más.";
        acerto = true;
        marcar();
      } else {
        v.className = "veredicto mal";
        v.textContent = valor === OBJETIVO / 2
          ? "La cuenta sería esa si un segmento de 10000 elementos se calculara de una vez. Mire la condición: es estricta."
          : "Siga la partición desde 40000 y pare cuando el tamaño sea menor que el umbral, no cuando lo iguale.";
      }
    });
  }

  function construirPresets() {
    var caja = document.getElementById("presets");
    PRESETS.forEach(function (p) {
      var b = document.createElement("button");
      b.textContent = "n = " + p.n + ", UMBRAL = " + p.umbral;
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(caja.children, function (x) {
          x.className = x.className.replace(" primario", "");
        });
        b.className = b.className + " primario";
        Motor.reiniciar({ n: p.n, umbral: p.umbral });
      });
      caja.appendChild(b);
    });
    caja.children[0].className = caja.children[0].className + " primario";
  }

  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  function construirDecisiones() {
    var caja = document.getElementById("decisiones");
    DECISIONES.forEach(function (item, indice) {
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
            resueltos.decisiones = resueltos.decisiones + 1;
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

  function pintarCuentas(e) {
    var hojas = e.conteos[2] || 0;
    var parciones = e.conteos[4] || 0;
    document.getElementById("cuenta-hojas").textContent = hojas;
    document.getElementById("cuenta-parallel").textContent = parciones;
    var pie = document.getElementById("pie-arbol");
    if (e.k === 0) {
      pie.textContent = "La primera llamada recibe el arreglo completo.";
    } else if (e.terminado) {
      pie.textContent = "Recorrido completo: " + parciones + " llamadas a parallel y " +
        hojas + " sumas secuenciales. Las hojas son " + (hojas > 0 ? e.actual.tam : 0) +
        " elementos cada una.";
    } else {
      pie.textContent = e.actual.accion;
    }
  }

  cablearPrediccion();
  construirPresets();
  construirDecisiones();
  Motor.iniciar({
    codigo: CODIGO,
    simular: simular,
    chips: [
      { campo: "s", rotulo: "s" },
      { campo: "t", rotulo: "t" },
      { campo: "tam", rotulo: "t - s", clase: "cuenta" },
      { campo: "umbral", rotulo: "UMBRAL" }
    ],
    paramsIniciales: { n: INICIAL.n, umbral: INICIAL.umbral },
    alPintar: pintarCuentas
  });
  marcar();
})();
