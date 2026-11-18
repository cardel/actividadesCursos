/* Ejercicio interactivo: la construccion, vertice por vertice.
   Corre build_rec de segmentos.py sobre tres arreglos, un paso por linea. El
   arbol se llena de abajo hacia arriba y la reserva de 4N casillas queda a la
   vista, con los huecos que la numeracion deja sin usar. */
var SEG = (typeof module !== "undefined") ? require("./lib.js") : SEG;

var EJERCICIO = (function () {
  var PRESETS = [
    { rotulo: "4 posiciones", A: [6, 2, 9, 4] },
    { rotulo: "6 posiciones", A: [6, 2, 9, 4, 7, 1] },
    { rotulo: "8 posiciones", A: [6, 2, 9, 4, 7, 1, 3, 5] }
  ];

  function datos(p) {
    var A = PRESETS[p].A, N = A.length;
    return { A: A, N: N, S: SEG.build(A), mem: SEG.memoria(N),
             vs: SEG.vertices(N), seg: SEG.segmentos(N) };
  }

  /* Suma de A entre dos posiciones, para armar los numeros equivocados. */
  function suma(A, desde, hasta) {
    var s = 0, i;
    for (i = desde; i <= hasta; i = i + 1) { s = s + A[i]; }
    return s;
  }

  /* Cuantas casillas de tree reciben un valor. */
  function opcionesEscritas(p) {
    var d = datos(p), N = d.N;
    return SEG.sinRepetidos([
      { valor: d.mem.escritas, clave: "correcta",
        razon: "Son " + d.mem.escritas + ": una por vértice, " + N + " hojas y " +
          (d.mem.escritas - N) + " internos. La línea 7 escribe las hojas y la 12 los internos." },
      { valor: 4 * N, clave: "reserva",
        razon: "Ahí está la reserva completa de <code>build</code>. Reservar no es escribir: " +
          d.mem.sobran + " se quedan en el 0 con que nacieron." },
      { valor: N, clave: "hojas",
        razon: "Faltan los vértices internos: cada uno guarda también la suma de su segmento." },
      { valor: N - 1, clave: "internos",
        razon: "Los internos son " + (N - 1) + ", y las " + N + " hojas también reciben su valor, en la línea 7." }
    ]);
  }

  /* El valor que queda en el hijo derecho de la raiz. */
  function opcionesHijoDerecho(p) {
    var d = datos(p), A = d.A, N = d.N, m = Math.floor((N - 1) / 2);
    return SEG.sinRepetidos([
      { valor: d.S.tree[2], clave: "correcta",
        razon: "Correcto: el vértice 2 cubre " + SEG.rotulo(m + 1, N - 1) + " y suma " +
          d.S.tree[2] + "." },
      { valor: d.S.tree[1], clave: "izquierdo",
        razon: "El hijo izquierdo es el vértice 1 y cubre " + SEG.rotulo(0, m) + "." },
      { valor: suma(A, m, N - 1), clave: "m-dos-veces",
        razon: "Ahí la posición " + m + " quedó contada dos veces. La mitad izquierda termina en m y la " +
          "derecha arranca en m + 1." },
      { valor: d.S.tree[0], clave: "raiz",
        razon: "En la raíz queda la suma del arreglo entero." },
      { valor: A[m + 1], clave: "una-sola",
        razon: "<code>A[" + (m + 1) + "]</code> es una sola posición. El vértice guarda la suma de todo su segmento." }
    ]);
  }

  /* Cuantas casillas de la reserva quedan en 0. */
  function opcionesSobran(p) {
    var d = datos(p), N = d.N;
    return SEG.sinRepetidos([
      { valor: d.mem.sobran, clave: "correcta",
        razon: "Son " + d.mem.sobran + ": " + (4 * N) + " reservadas menos " + d.mem.escritas +
          " escritas. " + (d.mem.alcanza < 4 * N
            ? "Las últimas " + (4 * N - d.mem.alcanza) + " están después de la casilla " + d.mem.mayor +
              ", que es la mayor que se toca."
            : "") },
      { valor: 4 * N, clave: "todas",
        razon: "<code>build</code> pide esa cantidad, y " + d.mem.escritas + " de esas casillas sí reciben un valor." },
      { valor: d.mem.escritas, clave: "escritas",
        razon: "Las que se escriben son " + d.mem.escritas + ". La pregunta es por las otras." },
      { valor: 4 * N - N, clave: "solo-hojas",
        razon: "Ahí se restaron solo las " + N + " hojas, y los vértices internos también ocupan casilla." },
      { valor: 4 * N - d.mem.alcanza, clave: "cola",
        razon: "Después de la casilla " + d.mem.mayor + " quedan esas. " +
          (d.mem.alcanza - d.mem.escritas > 0
            ? "Faltan " + (d.mem.alcanza - d.mem.escritas) + " huecos que la numeración deja en el medio."
            : "Con este N la numeración no deja huecos en el medio.") }
    ]);
  }

  /* Las casillas por debajo de la mayor que se toca y que nadie usa. */
  function huecos(N) {
    var vs = SEG.vertices(N), mayor = vs[vs.length - 1], fuera = [], i;
    for (i = 0; i <= mayor; i = i + 1) {
      if (vs.indexOf(i) < 0) { fuera.push(i); }
    }
    return fuera;
  }

  /* Cuatro preguntas sobre el orden en que se escribe y sobre las mitades.
     Van sobre [6,2,9,4,7,1,3,5], se lean con el preset que se lea. */
  var RONDAS = [
    {
      titulo: "El primero que recibe su valor",
      texto: "Sobre <code>[6,2,9,4,7,1,3,5]</code>, <code>build_rec</code> arranca en el vértice 0. " +
        "Qué vértice es el primero que deja un valor escrito.",
      opciones: [
        { txt: "El vértice 0, la raíz, porque es donde entra la primera llamada.",
          fb: "La raíz es la primera en entrar y la última en escribir: su línea 12 necesita a sus dos hijos ya hechos." },
        { txt: "El vértice 7, la hoja del segmento [0].", ok: true,
          fb: "Eso es. Las llamadas bajan por el hijo izquierdo hasta que l == r, y ahí la línea 7 escribe A[0] = 6." },
        { txt: "El vértice 1, que cubre el segmento [0,3].",
          fb: "El vértice 1 entra segundo, pero su valor sale de sumar a 3 y a 4, que todavía no existen." },
        { txt: "El vértice 14, la hoja del segmento [7].",
          fb: "La hoja [7] es la última que se escribe: la recursión agota el lado izquierdo antes de pasar al derecho." }
      ]
    },
    {
      titulo: "Una mitad con tres posiciones",
      texto: "En el arreglo de 6, el vértice 1 cubre [0,2] y la línea 9 calcula m = 1. " +
        "Cómo quedan repartidos sus dos hijos.",
      opciones: [
        { txt: "[0,1] a la izquierda y [2] a la derecha.", ok: true,
          fb: "Eso es. La llamada izquierda recibe (l, m) y la derecha (m + 1, r), así que el 1 se queda a la izquierda." },
        { txt: "[0] a la izquierda y [1,2] a la derecha.",
          fb: "Esa partición saldría de m = 0. Con l = 0 y r = 2 la división entera da (0 + 2) // 2 = 1." },
        { txt: "[0,1] a la izquierda y [1,2] a la derecha.",
          fb: "La posición 1 quedaría contada dos veces, y la raíz sumaría A[1] dos veces." },
        { txt: "Un segmento de tres posiciones no se parte en mitades iguales, así que se reparte [0] y [2] y el 1 sube.",
          fb: "El código no sube ninguna posición: toda posición del segmento vive en una hoja y en una sola." }
      ]
    },
    {
      titulo: "Por qué la reserva es 4N y no 2N",
      texto: "El arreglo de 6 deja un árbol de 11 vértices, y el índice mayor que <code>build_rec</code> " +
        "toca es el 12. Qué pasa si <code>build</code> reserva 2N = 12 casillas.",
      opciones: [
        { txt: "Alcanzan: los vértices son 11 y las casillas 12.",
          fb: "Caben de a uno, pero no en estos índices: la casilla 12 es la que hay que escribir y un arreglo de 12 llega hasta la 11." },
        { txt: "Alcanzan, porque los índices se van reacomodando solos mientras build_rec construye.",
          fb: "El índice no se elige: sale de 2v + 1 y 2(v + 1) desde la raíz en 0. El de [4] es el 12 y no hay otro." },
        { txt: "No alcanzan: hay que escribir la casilla 12 y el arreglo llega hasta la 11.", ok: true,
          fb: "Eso es. Los índices dejan huecos, aquí el 9 y el 10 no se usan, así que se estiran más que la cantidad de vértices." },
        { txt: "No alcanzan porque el árbol tiene más de 2N vértices.",
          fb: "Los vértices son 11 y 2N es 12, así que la cuenta de vértices no es el problema. Lo que se sale son los índices." }
      ]
    },
    {
      titulo: "El orden de escritura de una mitad",
      texto: "En el arreglo de 8, en qué orden reciben su valor los siete vértices que cuelgan del 1, " +
        "el que cubre [0,3].",
      opciones: [
        { txt: "[0,3], [0,1], [2,3], [0], [1], [2], [3]: primero los segmentos grandes, después las hojas.",
          fb: "Por niveles de arriba hacia abajo sería así, y la línea 12 no podría correr: sumaría hijos vacíos." },
        { txt: "[0], [1], [2], [3], [0,1], [2,3], [0,3]: las cuatro hojas y después los internos.",
          fb: "Las hojas no se escriben de corrido: entre A[1] y A[2] la recursión vuelve a [0,1] y escribe su suma." },
        { txt: "[0,3], [0,1], [0], [1], [2,3], [2], [3]: el orden en que entran las llamadas.",
          fb: "Entrar sí es en ese orden. Escribir es otra cosa: cada vértice interno escribe al volver, cuando sus hijos ya están." },
        { txt: "[0], [1], [0,1], [2], [3], [2,3], [0,3]: cada interno justo después de sus dos hijos.", ok: true,
          fb: "Eso es. La línea 12 corre al volver de las dos llamadas, así que un padre escribe inmediatamente después de su hijo derecho." }
      ]
    }
  ];

  return { PRESETS: PRESETS, RONDAS: RONDAS, datos: datos, huecos: huecos,
           opcionesEscritas: opcionesEscritas, opcionesHijoDerecho: opcionesHijoDerecho,
           opcionesSobran: opcionesSobran };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, p = 0;
    function el(id) { return document.getElementById(id); }

    function cabecera() {
      var d = E.datos(p);
      el("ver-arreglo").innerHTML = SEG.tiraArreglo(d.A, {});
      el("ver-n").textContent = d.N;
      el("ver-reserva-n").textContent = 4 * d.N;
      el("ver-vertices").textContent = d.mem.escritas;
      el("ver-mayor").textContent = d.mem.mayor;
      el("ver-sobran").textContent = d.mem.sobran;
      el("ver-alcanza").textContent = d.mem.alcanza;
      el("ver-huecos").textContent = E.huecos(d.N).length === 0
        ? "ninguno" : E.huecos(d.N).join(", ");
      el("ver-dosn").innerHTML = d.mem.cabeEnDosN
        ? "Con este arreglo la casilla mayor es la " + d.mem.mayor + " y una reserva de 2N = " +
          2 * d.N + " habría alcanzado."
        : "Con este arreglo la casilla mayor es la " + d.mem.mayor + ", así que una reserva de 2N = " +
          2 * d.N + " <b>no alcanza</b>: la escritura se saldría del arreglo.";
    }

    function arbol(a) {
      var d = E.datos(p);
      var escrito = a === null ? {} : a.escrito;
      var pila = a === null ? [] : a.pila;
      var tree = a === null ? SEG.ceros(4 * d.N) : a.tree;
      el("panel-arbol").innerHTML = SEG.dibujar({
        N: d.N, maxAncho: 880, conNotas: true,
        estado: function (v) {
          var e = "pendiente";
          if (escrito[v]) { e = "contenido"; }
          if (pila.indexOf(v) >= 0 && !escrito[v]) { e = "solapado"; }
          return e;
        },
        valor: function (v) { return escrito[v] ? tree[v] : ""; },
        nota: function (v) { return a !== null && a.ultimo === v ? "acaba de escribirse" : ""; },
        gruesa: function (v) { return a !== null && a.v === v; }
      });
    }

    function reserva(a) {
      var d = E.datos(p), hue = E.huecos(d.N), h = "", i;
      var escrito = a === null ? {} : a.escrito, tree = a === null ? [] : a.tree;
      for (i = 0; i < 4 * d.N; i = i + 1) {
        var cl = "ranura";
        if (escrito[i]) { cl = cl + (a !== null && a.ultimo === i ? " nueva" : " llena"); }
        else if (hue.indexOf(i) >= 0) { cl = cl + " hueco"; }
        h = h + "<div class='" + cl + "'>" + (escrito[i] ? tree[i] : "") + "</div>";
      }
      el("panel-reserva").innerHTML = h;
    }

    function alPintar(e) {
      var a = e.actual, d = E.datos(p);
      arbol(a);
      reserva(a);
      el("ver-escritas").textContent = a === null ? 0 : Object.keys(a.escrito).length;
      el("ver-total-escritas").textContent = d.mem.escritas;
      el("ver-raiz").textContent = e.terminado && a !== null ? a.tree[0] : "–";
      el("ver-pila").textContent = (a === null || a.pila.length === 0) ? "vacía"
        : a.pila.map(function (v) { return "v=" + v; }).join(" → ");
    }

    function presets() {
      var caja = el("presets");
      E.PRESETS.forEach(function (pr, i) {
        var b = document.createElement("button");
        b.textContent = pr.rotulo;
        b.addEventListener("click", function () {
          p = i;
          cabecera();
          Motor.reiniciar(i);
        });
        caja.appendChild(b);
      });
    }

    function rondas() {
      var caja = el("rondas");
      E.RONDAS.forEach(function (r, i) {
        var carta = document.createElement("div");
        carta.className = "carta";
        var h2 = document.createElement("h2");
        h2.textContent = (i + 1 + 4) + ". " + r.titulo;
        var pr = document.createElement("p");
        pr.className = "pregunta";
        pr.innerHTML = r.texto;
        var ops = document.createElement("div");
        var ver = document.createElement("div");
        ver.className = "veredicto";
        carta.appendChild(h2);
        carta.appendChild(pr);
        carta.appendChild(ops);
        carta.appendChild(ver);
        caja.appendChild(carta);
        SEG.montarOpciones(ops, r.opciones, ver);
      });
    }

    presets();
    rondas();
    cabecera();

    Motor.iniciar({
      codigo: SEG.CODIGO_BUILD,
      simular: function (params) { return SEG.simBuild(E.PRESETS[params].A); },
      chips: [{ campo: "v", rotulo: "v" }, { campo: "rotulo", rotulo: "segmento" },
              { campo: "m", rotulo: "m" }],
      paramsIniciales: p, alPintar: alPintar
    });

    Motor.opcionesNumericas("opciones-escritas", "veredicto-escritas", function (params) {
      return E.opcionesEscritas(params);
    });
    Motor.opcionesNumericas("opciones-derecho", "veredicto-derecho", function (params) {
      return E.opcionesHijoDerecho(params);
    });
    Motor.opcionesNumericas("opciones-sobran", "veredicto-sobran", function (params) {
      return E.opcionesSobran(params);
    });
  })();
}
