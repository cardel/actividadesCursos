/* Ejercicio interactivo: la actualizacion sube por los ancestros.
   Corre update_rec de segmentos.py sobre cuatro cambios del mismo arreglo. La
   rama que se reescribe queda en morado, con el valor de antes y el de
   despues en cada vertice que cambia. */
var SEG = (typeof module !== "undefined") ? require("./lib.js") : SEG;

var EJERCICIO = (function () {
  var A = [5, 1, 7, 3, 9, 2, 6, 4];
  var N = A.length;

  var CAMBIOS = [
    { i: 0, valor: 12, rotulo: "A[0] = 12" },
    { i: 2, valor: 10, rotulo: "A[2] = 10" },
    { i: 5, valor: 5, rotulo: "A[5] = 5" },
    { i: 6, valor: 1, rotulo: "A[6] = 1" }
  ];

  function base() { return SEG.build(A); }

  function corrida(p) {
    var c = CAMBIOS[p];
    return SEG.simUpdate(base(), c.i, c.valor);
  }

  function delta(p) { return CAMBIOS[p].valor - A[CAMBIOS[p].i]; }

  function opcionesRaiz(p) {
    var c = CAMBIOS[p], S = base(), antes = S.tree[0], r = corrida(p), d = delta(p);
    return SEG.sinRepetidos([
      { valor: r.tree[0], clave: "correcta",
        razon: "Correcto: la raíz pasa de " + antes + " a " + r.tree[0] + ", que es " + antes +
          (d >= 0 ? " + " + d : " − " + (-d)) + ". Cada ancestro se corre lo mismo." },
      { valor: antes + c.valor, clave: "sin-quitar",
        razon: "Ahí el valor nuevo se sumó encima del viejo. La línea 47 no suma el valor nuevo: vuelve a leer " +
          "los dos hijos, y el viejo ya no está en ninguno." },
      { valor: antes, clave: "igual",
        razon: "La raíz valía eso antes del cambio. Si <code>update</code> escribiera solo la hoja, quedaría " +
          "mintiendo y la consulta devolvería la suma vieja." },
      { valor: antes + 2 * d, clave: "doble",
        razon: "Ahí la diferencia entró dos veces. La hoja cambia una vez y cada ancestro se recalcula una vez." },
      { valor: c.valor, clave: "el-valor",
        razon: "En la posición " + c.i + " se escribió ese valor. La raíz guarda la suma de las " +
          N + " posiciones." }
    ]);
  }

  function opcionesCuantos(p) {
    var r = corrida(p);
    return SEG.sinRepetidos([
      { valor: r.camino.length, clave: "correcta",
        razon: "Son " + r.camino.length + ": la hoja y sus " + (r.camino.length - 1) +
          " ancestros, los vértices " + r.camino.join(", ") + "." },
      { valor: r.camino.length - 1, clave: "sin-hoja",
        razon: "Los ancestros son " + (r.camino.length - 1) + ". La hoja también se escribe, en la línea 40." },
      { valor: 1, clave: "solo-hoja",
        razon: "Ahí se escribe solo la hoja. Los vértices que contienen la posición guardan sumas que acaban de cambiar." },
      { valor: N, clave: "ene",
        razon: "El tamaño del arreglo es lo que cuesta rehacer un arreglo de prefijos." },
      { valor: SEG.vertices(N).length, clave: "todo",
        razon: "El árbol completo tiene esa cantidad de vértices. Un cambio en una posición no toca a los que no la contienen." }
    ]);
  }

  /* Cuatro rondas sobre la rama que sube. */
  var RONDAS = [
    {
      titulo: "Qué se reescribe",
      texto: "Sobre <code>[5,1,7,3,9,2,6,4]</code> se hace <code>A[0] = 12</code>. Qué vértices quedan " +
        "con un valor distinto.",
      opciones: [
        { txt: "Los 15, porque la suma del arreglo cambió.",
          fb: "La suma del arreglo vive en la raíz. El vértice [4,7] no contiene la posición 0 y su suma sigue valiendo 21." },
        { txt: "Solo la hoja [0], donde vive A[0].",
          fb: "Entonces [0,1] seguiría diciendo 6 cuando sus hojas suman 13, y una consulta por [0,1] devolvería el número viejo." },
        { txt: "La hoja [0] y los tres vértices que la contienen: [0,1], [0,3] y [0,7].", ok: true,
          fb: "Eso es. Son los ancestros de la hoja, uno por nivel, y por eso el cambio cuesta del orden de log N." },
        { txt: "La hoja [0], sus ancestros y además el hermano de cada ancestro, que entra en la misma suma.",
          fb: "Los hermanos no se tocan: [1], [2,3] y [4,7] guardan sumas de segmentos donde la posición 0 no aparece." }
      ]
    },
    {
      titulo: "Por qué rama baja",
      texto: "Al hacer <code>A[6] = 1</code>, la llamada llega al vértice 2, que cubre [4,7], y la " +
        "línea 42 calcula m = 5. A qué hijo baja.",
      opciones: [
        { txt: "Al derecho, [6,7], porque 6 > 5.", ok: true,
          fb: "Eso es. La línea 43 compara i con m y una sola de las dos llamadas se ejecuta." },
        { txt: "Al izquierdo, [4,5], porque la posición 6 está en la primera mitad de ese segmento.",
          fb: "La primera mitad de [4,7] es [4,5]. La posición 6 no está ahí: los índices del segmento son 4, 5, 6 y 7." },
        { txt: "A los dos, y después se queda con el que trajo un cambio.",
          fb: "Eso costaría el árbol entero. La posición está en un solo hijo y el código escoge con un <code>if</code>." },
        { txt: "A ninguno: el vértice 2 escribe el valor y la recursión termina ahí.",
          fb: "El valor va a la hoja. Un vértice interno guarda una suma, no una posición del arreglo." }
      ]
    },
    {
      titulo: "Lo que cambia en cada ancestro",
      texto: "Con <code>A[6] = 1</code> la raíz baja de 37 a 32. Cuánto cambia cada uno de los otros " +
        "vértices de la rama.",
      opciones: [
        { txt: "Cada uno baja la mitad de lo que bajó el de abajo, porque cada nivel cubre la mitad.",
          fb: "Lo que se reparte en mitades son los segmentos, no la diferencia. [6,7] baja 5 y [4,7] también." },
        { txt: "Los cuatro bajan 5, que es 1 − 6, el valor nuevo menos el viejo.", ok: true,
          fb: "Eso es. La posición aparece una sola vez en cada ancestro, así que la diferencia se traslada igual hasta arriba." },
        { txt: "El de arriba baja 5 y los de abajo bajan la parte que les toca de su segmento.",
          fb: "La posición 6 está entera en cada uno de esos segmentos, no partida: baja 5 en todos." },
        { txt: "Baja 5 solo el que tiene la posición 6 en su mitad derecha.",
          fb: "La posición 6 cae a la derecha en [4,7] y a la izquierda en [6,7], y los dos bajan 5 igual." }
      ]
    },
    {
      titulo: "Por qué se vuelven a leer los dos hijos",
      texto: "La línea 47 escribe la suma de los dos hijos. Sumarle al valor viejo la diferencia daría lo " +
        "mismo y leería una casilla menos. Por qué el código no lo hace.",
      opciones: [
        { txt: "Porque el valor viejo del vértice ya se perdió cuando la recursión bajó.",
          fb: "No se perdió: la línea 47 lo tiene en <code>S[\"tree\"][v]</code> hasta que lo sobrescribe." },
        { txt: "Porque la diferencia puede ser negativa y la resta no cabe en la operación.",
          fb: "Restar no es problema: <code>A[6] = 1</code> baja 5 y el árbol queda bien con cualquiera de las dos cuentas." },
        { txt: "Porque leer las dos casillas de los hijos cuesta lo mismo que leer una sola, al estar las dos en memoria.",
          fb: "Son dos lecturas contra una, y la de arriba además compara. La razón no es el costo." },
        { txt: "Porque leer los dos hijos sirve para cualquier operación asociativa, no solo para la suma.", ok: true,
          fb: "Eso es. El mismo <code>update</code> vale para mínimo, máximo o producto cambiando la combinación de la línea 47." }
      ]
    }
  ];

  return { A: A, N: N, CAMBIOS: CAMBIOS, RONDAS: RONDAS, base: base, corrida: corrida,
           delta: delta, opcionesRaiz: opcionesRaiz, opcionesCuantos: opcionesCuantos };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, p = 0;
    function el(id) { return document.getElementById(id); }

    function cabecera() {
      var c = E.CAMBIOS[p], d = E.delta(p);
      el("ver-arreglo").innerHTML = SEG.tiraArreglo(E.A, {
        foco: function (i) { return i === c.i; }
      });
      el("ver-cambio").textContent = c.rotulo;
      el("ver-viejo").textContent = E.A[c.i];
      el("ver-delta").textContent = (d >= 0 ? "+" : "−") + Math.abs(d);
    }

    function arbol(a) {
      var cambios = a === null ? {} : a.cambios;
      var camino = a === null ? [] : a.camino;
      var tree = a === null ? E.base().tree : a.tree;
      var c = E.CAMBIOS[p];
      el("panel-arbol").innerHTML = SEG.dibujar({
        N: E.N, maxAncho: 880, conNotas: true,
        estado: function (v) {
          var e = "neutro";
          if (cambios[v] !== undefined) { e = "camino"; }
          else if (camino.indexOf(v) >= 0) { e = "solapado"; }
          return e;
        },
        valor: function (v) {
          return cambios[v] === undefined ? tree[v]
            : cambios[v].antes + " → " + cambios[v].despues;
        },
        nota: function (v) {
          return a !== null && cambios[v] !== undefined && a.l === a.r && a.v === v
            ? c.rotulo : "";
        },
        gruesa: function (v) { return a !== null && a.v === v; }
      });
    }

    function tablaCamino(a) {
      var r = E.corrida(p), seg = SEG.segmentos(E.N), d = E.delta(p);
      var hechos = a === null ? {} : a.cambios;
      var enc = "<tr><th>vértice</th><th>segmento</th><th>antes</th><th>después</th><th>diferencia</th></tr>";
      var filas = "";
      r.camino.forEach(function (v) {
        var hecho = hechos[v] !== undefined;
        filas = filas + "<tr><td>" + v + "</td><td>" + SEG.rotulo(seg[v][0], seg[v][1]) + "</td>" +
          "<td>" + r.cambios[v].antes + "</td>" +
          (hecho
            ? "<td class='destaca'>" + r.cambios[v].despues + "</td><td class='destaca'>" +
              (d >= 0 ? "+" : "−") + Math.abs(d) + "</td>"
            : "<td class='pend'>–</td><td class='pend'>–</td>") + "</tr>";
      });
      el("tabla-camino").innerHTML = "<table class='cuentas'>" + enc + filas + "</table>";
    }

    function alPintar(e) {
      var a = e.actual, r = E.corrida(p);
      arbol(a);
      tablaCamino(a);
      el("ver-pila").textContent = (a === null || a.pila.length === 0) ? "vacía"
        : a.pila.map(function (v) { return "v=" + v; }).join(" → ");
      el("ver-rama").textContent = (a === null || !a.rama) ? "–" : "hijo " + a.rama;
      el("ver-escritos").textContent = a === null ? 0 : Object.keys(a.cambios).length;
      el("ver-del-camino").textContent = r.camino.length;
      el("ver-raiz").textContent = e.terminado && a !== null ? a.tree[0] : "–";
    }

    function presets() {
      var caja = el("presets");
      E.CAMBIOS.forEach(function (c, i) {
        var b = document.createElement("button");
        b.textContent = c.rotulo;
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
      codigo: SEG.CODIGO_UPDATE,
      simular: function (params) {
        return SEG.simUpdate(E.base(), E.CAMBIOS[params].i, E.CAMBIOS[params].valor).pasos;
      },
      chips: [{ campo: "v", rotulo: "v" }, { campo: "rotulo", rotulo: "segmento" },
              { campo: "m", rotulo: "m" }, { campo: "rama", rotulo: "baja por", clase: "cuenta" }],
      paramsIniciales: p, alPintar: alPintar
    });

    Motor.opcionesNumericas("opciones-raiz", "veredicto-raiz", function (params) {
      return E.opcionesRaiz(params);
    });
    Motor.opcionesNumericas("opciones-cuantos", "veredicto-cuantos", function (params) {
      return E.opcionesCuantos(params);
    });
  })();
}
