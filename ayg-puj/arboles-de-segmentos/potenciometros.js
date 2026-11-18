/* Ejercicio interactivo: el problema de los potenciometros.
   UVa 12086: un arreglo de resistencias, la accion S pone una y la accion M
   mide la suma de un tramo. Es el arbol de la sesion sin nada encima, con una
   trampa: el enunciado numera las resistencias desde 1. La sesion de acciones
   corre con el codigo de segmentos.py. */
var SEG = (typeof module !== "undefined") ? require("./lib.js") : SEG;

var EJERCICIO = (function () {
  var A0 = [4, 1, 7, 2, 5, 3];
  var N = A0.length;

  var ACCIONES = [
    { tipo: "M", x: 2, y: 5 },
    { tipo: "S", x: 3, y: 10 },
    { tipo: "M", x: 2, y: 5 },
    { tipo: "M", x: 1, y: 6 },
    { tipo: "S", x: 6, y: 1 },
    { tipo: "M", x: 4, y: 6 }
  ];

  function texto(ac) { return ac.tipo + " " + ac.x + " " + ac.y; }

  /* La sesion completa: el estado antes de cada accion y lo que deja. */
  function sesion() {
    var A = A0.slice(), S = SEG.build(A0), pasos = [], ultimoS = -1;
    ACCIONES.forEach(function (ac, k) {
      var antes = S.tree.slice();
      if (ac.tipo === "M") {
        var r = SEG.simQuery(S, ac.x - 1, ac.y - 1);
        pasos.push({ k: k, ac: ac, tipo: "M", A: A.slice(), tree: antes, r: r,
                     valor: r.total, ultimoS: ultimoS });
      } else {
        var sim = SEG.simUpdate(S, ac.x - 1, ac.y);
        pasos.push({ k: k, ac: ac, tipo: "S", viejo: A[ac.x - 1], A: null,
                     treeAntes: antes, tree: sim.tree.slice(), sim: sim, ultimoS: ultimoS });
        A[ac.x - 1] = ac.y;
        pasos[pasos.length - 1].A = A.slice();
        S = { tree: sim.tree.slice(), N: N };
        ultimoS = k;
      }
    });
    return pasos;
  }

  var PASOS = sesion();

  function salida() {
    return PASOS.filter(function (p) { return p.tipo === "M"; })
      .map(function (p) { return p.valor; });
  }

  /* Las opciones de una medida. Los numeros equivocados son los tres que de
     verdad se dan: no restar uno, restarlo solo al primero, y medir sobre el
     arbol de antes del ultimo cambio. */
  function opcionesMedida(k) {
    var p = PASOS[k], ac = p.ac, S = { tree: p.tree, N: N };
    var viejo = p.ultimoS >= 0
      ? SEG.query({ tree: PASOS[p.ultimoS].treeAntes, N: N }, ac.x - 1, ac.y - 1)
      : SEG.query(S, 0, N - 1);
    return SEG.sinRepetidos([
      { valor: p.valor, clave: "correcta",
        razon: "Correcto: <code>" + texto(ac) + "</code> pide el tramo de la resistencia " + ac.x +
          " a la " + ac.y + ", que en el arreglo es " + SEG.rotulo(ac.x - 1, ac.y - 1) + ", y suma " +
          p.valor + "." },
      { valor: SEG.query(S, ac.x, ac.y), clave: "sin-restar",
        razon: "El tramo quedó en " + SEG.rotulo(ac.x, ac.y) + ", corrido una posición. El enunciado " +
          "numera las resistencias desde 1 y el arreglo desde 0, así que a los dos extremos hay que restarles uno." },
      { valor: SEG.query(S, ac.x - 1, ac.y), clave: "medio-restar",
        razon: "Ahí el uno se restó solo al primer extremo. La llamada es <code>query(S, x - 1, y - 1)</code>." },
      { valor: viejo, clave: p.ultimoS >= 0 ? "arbol-viejo" : "todo",
        razon: p.ultimoS >= 0
          ? "Así medía antes de <code>" + texto(PASOS[p.ultimoS].ac) + "</code>. El cambio ya " +
            "subió por los ancestros, así que este tramo vale otra cosa."
          : "La suma de las " + N + " resistencias es esa. La medida es de un tramo, no del arreglo entero." }
    ]);
  }

  /* Lo que costaria el mismo caso de las tres formas. */
  function costosCaso(e) {
    var n = Math.max(2, Math.min(1000000, Math.round(e.N) || 2));
    var acciones = Math.max(2, Math.min(200000, Math.round(e.acciones) || 2));
    var mitad = Math.floor(acciones / 2);
    return SEG.costos(n, acciones - mitad, mitad);
  }

  var RONDAS = [
    {
      titulo: "La acción que pone una resistencia",
      texto: "La entrada trae <code>S 3 10</code>: la resistencia 3 pasa a 10 ohmios. Qué llamada le corresponde.",
      opciones: [
        { txt: "<code>update(S, 2, 10)</code>", ok: true,
          fb: "Eso es. La resistencia 3 del enunciado es la posición 2 del arreglo, y el valor entra tal cual." },
        { txt: "<code>update(S, 3, 10)</code>",
          fb: "La posición 3 es la cuarta resistencia. El enunciado numera desde 1 y el arreglo desde 0." },
        { txt: "<code>update(S, 10, 3)</code>",
          fb: "Los dos argumentos quedaron al revés: primero la posición y después el valor." },
        { txt: "<code>update(S, 2, 3)</code>, la diferencia con los 7 ohmios que tenía.",
          fb: "<code>update</code> recibe el valor nuevo y la línea 40 lo escribe encima. La diferencia la calcula el árbol solo, al recombinar." }
      ]
    },
    {
      titulo: "La acción que mide un tramo",
      texto: "Y para <code>M 2 5</code>, que pide la suma de la resistencia 2 a la 5.",
      opciones: [
        { txt: "<code>query(S, 2, 5)</code>",
          fb: "Ese tramo tiene las resistencias 3 a 6: se corre una posición y además se sale por el extremo derecho." },
        { txt: "<code>query(S, 1, 5)</code>",
          fb: "Ahí solo se restó uno al primer extremo, y el tramo quedó con una resistencia de más." },
        { txt: "<code>query(S, 1, 4)</code>", ok: true,
          fb: "Eso es: cuatro resistencias, de la posición 1 a la 4. Los dos extremos van cerrados, y el código del curso los trata así." },
        { txt: "<code>query(S, 2, 4)</code>, restándole uno solo al extremo derecho.",
          fb: "Ahí el tramo arranca una resistencia más adelante. Los dos extremos llegan numerados desde 1 y a los dos hay que restarles uno." }
      ]
    },
    {
      titulo: "Por qué no un arreglo de prefijos",
      texto: "Las dos acciones llegan mezcladas hasta que aparece END. Qué pasa si el caso se resuelve " +
        "con un arreglo de prefijos.",
      opciones: [
        { txt: "Sirve, porque cada medida es una resta de dos casillas.",
          fb: "La medida sí, y es más rápida que el árbol. El problema son las S: después de cada una el prefijo queda mal desde esa posición." },
        { txt: "Sirve, rehaciendo el prefijo desde la posición que cambió cada vez que llega una S y dejando quietas las de antes.",
          fb: "Eso es lo que habría que hacer, y es justo lo que cuesta: una S en la mitad de 200 000 resistencias obliga a rehacer unas 100 000 casillas, contra 19 del árbol." },
        { txt: "No sirve, porque el prefijo no puede medir un tramo que empiece en la primera resistencia.",
          fb: "Ese tramo se mide bien: <code>P[qr + 1] - P[0]</code>, y <code>P[0]</code> vale 0." },
        { txt: "No sirve: el prefijo no admite que una resistencia cambie, y habría que rehacerlo entre medidas.", ok: true,
          fb: "Eso es. Con las dos acciones mezcladas, lo que decide es el costo del cambio, y ahí el árbol gana." }
      ]
    },
    {
      titulo: "Qué parte del costo crece con el tamaño",
      texto: "Un caso puede traer muchas más resistencias que este. Qué parte del trabajo del árbol crece " +
        "en proporción a la cantidad de resistencias.",
      opciones: [
        { txt: "El cambio, porque la hoja queda más abajo cuando el arreglo crece.",
          fb: "Crece, pero como el logaritmo: de 7 casillas con 64 resistencias a 18 con 100 000. En proporción al tamaño crece otra cosa." },
        { txt: "La construcción, que escribe una casilla por vértice; medir y cambiar crecen como el logaritmo.", ok: true,
          fb: "Eso es. Por eso el árbol se arma una vez por caso de prueba y de ahí en adelante cada acción es barata." },
        { txt: "La medida, porque para un tramo largo hay que bajar hasta las hojas de los dos extremos y volver a subir.",
          fb: "Se baja hasta las hojas de los bordes, y eso son dos caminos: 55 vértices con 100 000 resistencias, no 100 000." },
        { txt: "Ninguna: el árbol cuesta lo mismo para cualquier cantidad de resistencias.",
          fb: "Construirlo recorre el arreglo entero, y eso sí crece con el tamaño. Lo que casi no se mueve es el costo de cada acción." }
      ]
    }
  ];

  return { A0: A0, N: N, ACCIONES: ACCIONES, PASOS: PASOS, RONDAS: RONDAS,
           texto: texto, sesion: sesion, salida: salida,
           opcionesMedida: opcionesMedida, costosCaso: costosCaso };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO;
    var estado = { N: 200000, acciones: 100000 };
    function el(id) { return document.getElementById(id); }

    function listaAcciones() {
      var h = "";
      E.ACCIONES.forEach(function (ac) {
        h = h + "<span class='par" + (ac.tipo === "S" ? " cero" : "") + "'>" + E.texto(ac) + "</span> ";
      });
      el("ver-acciones").innerHTML = h + "<span class='par'>END</span>";
    }

    function arbolMedida(p, caja) {
      var r = p.r, fuera = SEG.estadoDeVertices(E.N, r.estados), dio = {};
      r.aportes.forEach(function (x) { dio[x.v] = x.valor; });
      caja.innerHTML = SEG.dibujar({
        N: E.N, maxAncho: 720, conNotas: true,
        estado: function (v) { return fuera[v]; },
        valor: function (v) { return p.tree[v]; },
        nota: function (v) { return dio[v] === undefined ? "" : "aporta " + dio[v]; }
      });
    }

    function arbolCambio(p, caja) {
      var cambios = p.sim.cambios;
      caja.innerHTML = SEG.dibujar({
        N: E.N, maxAncho: 720, conNotas: true,
        estado: function (v) { return cambios[v] === undefined ? "neutro" : "camino"; },
        valor: function (v) {
          return cambios[v] === undefined ? p.tree[v]
            : cambios[v].antes + " → " + cambios[v].despues;
        },
        nota: function (v) { return cambios[v] !== undefined && v === p.sim.camino[p.sim.camino.length - 1]
          ? "S " + p.ac.x + " " + p.ac.y : ""; }
      });
    }

    function cartaAccion(p) {
      var caja = el("acciones-cartas");
      var carta = document.createElement("div");
      carta.className = "carta";
      var h2 = document.createElement("h2");
      h2.textContent = (p.k + 3) + ". " + E.texto(p.ac) +
        (p.tipo === "M" ? ", medir un tramo" : ", poner una resistencia");
      carta.appendChild(h2);
      var tira = document.createElement("div");
      tira.innerHTML = SEG.tiraArreglo(p.A, {
        dentro: function (i) { return p.tipo === "M" && p.ac.x - 1 <= i && i <= p.ac.y - 1; },
        foco: function (i) { return p.tipo === "S" && i === p.ac.x - 1; }
      });
      carta.appendChild(tira);
      var dib = document.createElement("div");
      dib.className = "dibujo";
      if (p.tipo === "M") {
        var pr = document.createElement("p");
        pr.className = "pregunta";
        pr.innerHTML = "Qué número sale por pantalla.";
        carta.appendChild(pr);
        var ops = document.createElement("div");
        ops.className = "opciones";
        ops.id = "opciones-" + p.k;
        carta.appendChild(ops);
        var ver = document.createElement("div");
        ver.className = "veredicto";
        ver.id = "veredicto-" + p.k;
        carta.appendChild(ver);
        var botones = document.createElement("div");
        botones.className = "botones";
        var b = document.createElement("button");
        b.textContent = "Ver cómo se recorre";
        b.addEventListener("click", function () { arbolMedida(p, dib); });
        botones.appendChild(b);
        carta.appendChild(botones);
        carta.appendChild(dib);
        caja.appendChild(carta);
        Motor.opcionesNumericas("opciones-" + p.k, "veredicto-" + p.k, function () {
          return E.opcionesMedida(p.k);
        });
      } else {
        var nota = document.createElement("p");
        nota.className = "nota";
        nota.innerHTML = "La resistencia " + p.ac.x + " pasa de " + p.viejo + " a " + p.ac.y +
          " ohmios. En morado, los vértices que se reescriben al volver.";
        carta.appendChild(nota);
        carta.appendChild(dib);
        caja.appendChild(carta);
        arbolCambio(p, dib);
      }
    }

    function cuentas() {
      var c = E.costosCaso(estado);
      el("ver-costos").innerHTML = "Con <b>" + c.N + "</b> resistencias y " + (c.consultas + c.cambios) +
        " acciones, de las que " + c.consultas + " miden un tramo de " + c.largo +
        " posiciones y " + c.cambios + " cambian una resistencia, medir recorriendo el arreglo lee <b>" +
        c.recorrido.total +
        "</b> casillas, el arreglo de prefijos <b>" + c.prefijos.total + "</b> y el árbol <b>" +
        c.arbol.total + "</b>.";
    }

    function leer() {
      estado = { N: parseInt(el("campo-n").value, 10), acciones: parseInt(el("campo-acciones").value, 10) };
      var c = E.costosCaso(estado);
      el("campo-n").value = c.N;
      el("campo-acciones").value = c.consultas + c.cambios;
      cuentas();
    }

    function rondas() {
      var caja = el("rondas");
      E.RONDAS.forEach(function (r, i) {
        var carta = document.createElement("div");
        carta.className = "carta";
        var h2 = document.createElement("h2");
        h2.textContent = (i + 11) + ". " + r.titulo;
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

    listaAcciones();
    E.PASOS.forEach(cartaAccion);
    rondas();
    el("campo-n").value = estado.N;
    el("campo-acciones").value = estado.acciones;
    el("btn-costos").addEventListener("click", leer);
    cuentas();

    el("btn-salida").addEventListener("click", function () {
      el("ver-salida").innerHTML = "<pre class='codigo-fijo'>Case 1:\n" +
        E.salida().join("\n") + "</pre>";
    });
  })();
}
