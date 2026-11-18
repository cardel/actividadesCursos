/* Ejercicio interactivo: la consulta y sus tres casos.
   Corre query_rec de segmentos.py sobre cinco rangos del mismo arreglo. El
   color de cada vertice dice en que caso quedo: se abre, se devuelve o se
   descarta. Los aportes de abajo son la suma final, vertice por vertice. */
var SEG = (typeof module !== "undefined") ? require("./lib.js") : SEG;

var EJERCICIO = (function () {
  var A = [3, 8, 1, 6, 4, 2, 7, 5];
  var S = SEG.build(A);
  var N = A.length;

  var RANGOS = [
    { ql: 0, qr: 7, rotulo: "q(0,7)" },
    { ql: 4, qr: 7, rotulo: "q(4,7)" },
    { ql: 3, qr: 3, rotulo: "q(3,3)" },
    { ql: 2, qr: 5, rotulo: "q(2,5)" },
    { ql: 1, qr: 6, rotulo: "q(1,6)" }
  ];

  function corrida(p) {
    var q = RANGOS[p];
    return SEG.simQuery(S, q.ql, q.qr);
  }

  /* El vertice mas chico cuyo segmento contiene el rango entero. */
  function contenedor(ql, qr) {
    var seg = SEG.segmentos(N), v = 0;
    function bajar(w) {
      var l = seg[w][0], r = seg[w][1], m;
      if (l <= ql && qr <= r) {
        v = w;
        if (l !== r) {
          m = Math.floor((l + r) / 2);
          bajar(2 * w + 1);
          bajar(2 * (w + 1));
        }
      }
    }
    bajar(0);
    return v;
  }

  /* Lo que devolveria sumar el segmento completo de los vertices descartados. */
  function conDisjuntos(r) {
    var suma = r.total;
    r.aportes.forEach(function (a) {
      if (a.caso === "disjunto") { suma = suma + S.tree[a.v]; }
    });
    return suma;
  }

  function opcionesResultado(p) {
    var q = RANGOS[p], r = corrida(p), c = contenedor(q.ql, q.qr);
    return SEG.sinRepetidos([
      { valor: r.total, clave: "correcta",
        razon: "Correcto: " + r.aportes.filter(function (a) { return a.caso === "contenido"; })
          .map(function (a) { return SEG.rotulo(a.l, a.r) + " = " + a.valor; }).join(" + ") +
          (r.aportes.some(function (a) { return a.caso === "disjunto"; }) ? ", y los descartados aportan 0" : "") + "." },
      { valor: SEG.query(S, q.ql + 1, q.qr + 1), clave: "corrido",
        razon: "El rango quedó corrido una posición a la derecha. Pasa cuando el enunciado numera desde 1 " +
          "y nadie resta uno antes de llamar a <code>query</code>." },
      { valor: S.tree[c], clave: "contenedor",
        razon: "Ese valor está guardado en el vértice " + c + ", que cubre " +
          SEG.rotulo(SEG.segmentos(N)[c][0], SEG.segmentos(N)[c][1]) +
          ". Un vértice se devuelve entero solo cuando cabe dentro del rango, no cuando lo contiene." },
      { valor: conDisjuntos(r), clave: "disjuntos",
        razon: "Ahí los vértices descartados aportaron su valor. El caso disjunto devuelve el neutro de la " +
          "operación, que en la suma es 0." },
      { valor: r.visitados, clave: "visitados",
        razon: "La consulta visita esa cantidad de vértices, y lo que devuelve es otra cosa." }
    ]);
  }

  function opcionesVisitados(p) {
    var q = RANGOS[p], r = corrida(p), largo = q.qr - q.ql + 1;
    return SEG.sinRepetidos([
      { valor: r.visitados, clave: "correcta",
        razon: "Son " + r.visitados + " de los " + SEG.vertices(N).length + " del árbol: " +
          r.aportes.length + " se resuelven sin bajar y el resto se abren." },
      { valor: SEG.vertices(N).length, clave: "todos",
        razon: "El árbol completo son " + SEG.vertices(N).length + " vértices. Ninguno por debajo de uno que se devolvió o se descartó llega a visitarse." },
      { valor: largo, clave: "largo",
        razon: "El rango tiene esas posiciones, y es justo lo que el recorrido lee una por una." },
      { valor: r.aportes.length, clave: "aportes",
        razon: "Los que devuelven algo son " + r.aportes.length + ". Los que se abren también se visitan." },
      { valor: SEG.alturaDe(N) + 1, clave: "altura",
        razon: "La altura del árbol más uno da el largo de un camino. La consulta abre dos caminos, no uno." }
    ]);
  }

  /* Cinco rondas sobre los tres casos, de lo mínimo a lo que abre casi todo. */
  var RONDAS = [
    {
      titulo: "El rango entero",
      texto: "Con <code>q(0,7)</code>, qué le pasa a la raíz, que cubre [0,7] y guarda 36.",
      opciones: [
        { txt: "Es un caso solapado: baja a sus dos hijos y suma 18 + 18.",
          fb: "Daría el mismo 36, pero por el camino largo. La línea 25 corta antes: [0,7] cabe dentro de [0,7]." },
        { txt: "Es un caso contenido: devuelve los 36 que ya tiene y no baja.", ok: true,
          fb: "Eso es. Una consulta por el arreglo completo mira un solo vértice." },
        { txt: "Es un caso contenido, y baja igual a comprobar que las hojas suman 36.",
          fb: "Comprobar costaría los 15 vértices. La línea 26 devuelve y la recursión no sigue." },
        { txt: "Es un caso disjunto, porque el rango no es más chico que el segmento.",
          fb: "Disjunto es no cruzarse: <code>qr &lt; l or r &lt; ql</code>. Aquí los dos intervalos son el mismo." }
      ]
    },
    {
      titulo: "Un vértice que queda afuera",
      texto: "Con <code>q(2,5)</code>, qué devuelve el vértice 3, el de [0,1], que guarda 11.",
      opciones: [
        { txt: "Devuelve 0, porque [0,1] y [2,5] no se cruzan.", ok: true,
          fb: "Eso es. La condición de la línea 24 falla, <code>resultado</code> se queda en el 0 de la línea 23 y eso es lo que sube." },
        { txt: "Devuelve 11, el valor que tiene guardado.",
          fb: "El caso contenido pide que el segmento quepa dentro del rango, y [0,1] está afuera del todo." },
        { txt: "Devuelve 11 con signo negativo, para descontar lo que no va.",
          fb: "No hay nada que descontar: lo que está fuera del rango nunca se suma. Eso es lo que hace el arreglo de prefijos, no el árbol." },
        { txt: "No devuelve nada, porque la recursión no llega hasta él.",
          fb: "Sí llega: su padre [0,3] se solapa con el rango y la línea 29 lo llama. Lo que no se visitan son sus hijos." }
      ]
    },
    {
      titulo: "Lo que sube de un vértice que se abre",
      texto: "Con <code>q(2,5)</code>, qué devuelve el vértice 1, el de [0,3], que guarda 18.",
      opciones: [
        { txt: "Devuelve 18, su valor guardado, y el padre le resta lo que sobra.",
          fb: "El padre no resta nada: suma lo que le entregan sus dos hijos. Por eso [0,3] no puede devolver su valor completo." },
        { txt: "Devuelve 7: 0 del hijo [0,1] más 7 del hijo [2,3].", ok: true,
          fb: "Eso es. Es el único caso en que un vértice no mira su propio valor: lo arma con lo que le suben sus hijos." },
        { txt: "Devuelve 13, el resultado de toda la consulta.",
          fb: "13 es lo que sale de la raíz. Al vértice [0,3] le toca solo la parte del rango que cae en su segmento." },
        { txt: "Devuelve 0, porque el rango no está contenido en [0,3].",
          fb: "0 es lo que devuelve un vértice disjunto, y [0,3] sí se cruza con [2,5] en las posiciones 2 y 3." }
      ]
    },
    {
      titulo: "Una sola posición",
      texto: "Con <code>q(3,3)</code> la consulta visita 7 vértices para devolver un número que está en una hoja. " +
        "Qué hace que no sea uno solo.",
      opciones: [
        { txt: "Que el árbol no guarda las posiciones del arreglo, solo sumas de segmentos.",
          fb: "Las hojas sí guardan cada posición: la hoja [3] vale 6. El asunto es llegar hasta ella." },
        { txt: "Que query_rec siempre recorre el árbol completo antes de responder.",
          fb: "Con <code>q(0,7)</code> mira un solo vértice. Lo que recorre depende del rango." },
        { txt: "Que hay que bajar desde la raíz y en cada nivel se descarta al hermano, y descartar cuesta una visita.", ok: true,
          fb: "Eso es: tres vértices del camino, tres hermanos descartados y la hoja. Es un camino, y por eso cuesta del orden de log N." },
        { txt: "Que la hoja [3] es el hijo derecho de [2,3], y los hijos derechos se visitan dos veces: al bajar y al subir.",
          fb: "Ningún vértice se visita dos veces: cada llamada entra una vez por cada padre, y el padre es uno." }
      ]
    },
    {
      titulo: "El rango que abre casi todo",
      texto: "Con <code>q(1,6)</code> se visitan 11 de los 15 vértices. Cuáles devuelven su valor guardado.",
      opciones: [
        { txt: "[0,3] y [4,7], los dos hijos de la raíz.",
          fb: "Ninguno de los dos cabe dentro de [1,6]: a [0,3] le sobra la posición 0 y a [4,7] la 7." },
        { txt: "Las hojas [1], [2], [3], [4], [5] y [6], una por cada posición que el rango pide.",
          fb: "Eso sería leer el arreglo. [2,3] y [4,5] caben enteros dentro del rango, así que la recursión se detiene ahí." },
        { txt: "[0,1], [2,3], [4,5] y [6,7], las cuatro parejas del rango.",
          fb: "[0,1] y [6,7] se asoman fuera del rango: devolverlos enteros sumaría A[0] y A[7]. De cada uno baja solo la mitad que sirve." },
        { txt: "[1], [2,3], [4,5] y [6]: dos hojas en los bordes y dos parejas en el medio.", ok: true,
          fb: "Eso es: 8 + 7 + 6 + 7 = 28. Los bordes de un rango bajan hasta las hojas y el medio se corta arriba." }
      ]
    }
  ];

  return { A: A, N: N, S: S, RANGOS: RANGOS, RONDAS: RONDAS, corrida: corrida,
           contenedor: contenedor, conDisjuntos: conDisjuntos,
           opcionesResultado: opcionesResultado, opcionesVisitados: opcionesVisitados };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, p = 0;
    function el(id) { return document.getElementById(id); }

    function cabecera() {
      var q = E.RANGOS[p];
      el("ver-arreglo").innerHTML = SEG.tiraArreglo(E.A, {
        dentro: function (i) { return q.ql <= i && i <= q.qr; }
      });
      el("ver-rango").textContent = "ql = " + q.ql + ", qr = " + q.qr;
      el("ver-suma-mano").textContent = E.A.slice(q.ql, q.qr + 1).join(" + ") +
        " = " + E.corrida(p).total;
    }

    function arbol(a) {
      var estados = a === null ? {} : a.estados;
      var fuera = SEG.estadoDeVertices(E.N, estados);
      var aportes = a === null ? [] : a.aportes;
      var dio = {};
      aportes.forEach(function (x) { dio[x.v] = x.valor; });
      el("panel-arbol").innerHTML = SEG.dibujar({
        N: E.N, maxAncho: 880, conNotas: true,
        estado: function (v) { return fuera[v]; },
        valor: function (v) { return E.S.tree[v]; },
        nota: function (v) {
          return dio[v] === undefined ? "" : (dio[v] === 0 ? "aporta 0" : "aporta " + dio[v]);
        },
        gruesa: function (v) { return a !== null && a.v === v; }
      });
    }

    function tablaAportes(a) {
      var aportes = a === null ? [] : a.aportes;
      if (aportes.length === 0) {
        el("tabla-aportes").innerHTML = "";
        el("ver-acumulado").textContent = "0";
        return;
      }
      var enc = "<tr><th>vértice</th>", fc = "<tr><td>caso</td>", fv = "<tr><td>aporta</td>";
      aportes.forEach(function (x) {
        var cl = x.caso === "disjunto" ? " class='cero'" : "";
        enc = enc + "<th>" + x.v + " " + SEG.rotulo(x.l, x.r) + "</th>";
        fc = fc + "<td" + cl + ">" + x.caso + "</td>";
        fv = fv + "<td" + cl + ">" + x.valor + "</td>";
      });
      enc = enc + "<th>suma</th>";
      fc = fc + "<td class='suma'>resultado</td>";
      fv = fv + "<td class='suma'>" + a.acumulado + "</td>";
      el("tabla-aportes").innerHTML = "<table class='aportes'>" + enc + "</tr>" +
        fc + "</tr>" + fv + "</tr></table>";
      el("ver-acumulado").textContent = a.acumulado;
    }

    function cuenta(a) {
      var r = E.corrida(p), q = E.RANGOS[p];
      var vistos = a === null ? 0 : Object.keys(a.estados).length;
      el("ver-visitados").textContent = vistos;
      el("ver-del-arbol").textContent = SEG.vertices(E.N).length;
      el("ver-largo").textContent = q.qr - q.ql + 1;
      el("ver-abiertos").textContent = a === null ? 0 :
        Object.keys(a.estados).filter(function (v) { return a.estados[v] === "solapado"; }).length;
    }

    function alPintar(e) {
      var a = e.actual;
      arbol(a);
      tablaAportes(a);
      cuenta(a);
      el("ver-pila").textContent = (a === null || a.pila.length === 0) ? "vacía"
        : a.pila.map(function (v) { return "v=" + v; }).join(" → ");
      el("ver-total-query").textContent = e.terminado && a !== null ? a.resultado : "–";
    }

    function presets() {
      var caja = el("presets");
      E.RANGOS.forEach(function (q, i) {
        var b = document.createElement("button");
        b.textContent = q.rotulo;
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
        h2.textContent = (i + 1 + 5) + ". " + r.titulo;
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
      codigo: SEG.CODIGO_QUERY,
      simular: function (params) {
        return SEG.simQuery(E.S, E.RANGOS[params].ql, E.RANGOS[params].qr).pasos;
      },
      chips: [{ campo: "v", rotulo: "v" }, { campo: "rotulo", rotulo: "segmento" },
              { campo: "caso", rotulo: "caso", clase: "cuenta" },
              { campo: "resultado", rotulo: "resultado" }],
      paramsIniciales: p, alPintar: alPintar
    });

    Motor.opcionesNumericas("opciones-resultado", "veredicto-resultado", function (params) {
      return E.opcionesResultado(params);
    });
    Motor.opcionesNumericas("opciones-visitados", "veredicto-visitados", function (params) {
      return E.opcionesVisitados(params);
    });
  })();
}
