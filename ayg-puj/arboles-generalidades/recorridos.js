/* Ejercicio interactivo: los cuatro recorridos de un arbol binario y la
   reconstruccion del arbol a partir de dos de ellos. Los recorridos
   salen de recorridos.py, lineas 19 a 48. */
var ARB = (typeof module !== "undefined") ? require("./lib.js") : ARB;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {

  var ARBOLES = [
    { boton: "Nueve nodos",
      texto: "Nueve nodos. El 17 tiene solo hijo izquierdo y el 42 también, así que el inorden no sale en orden creciente.",
      T: [23, [14, [39, [], []], [17, [15, [], []], []]], [42, [31, [26, [], []], [11, [], []]], []]] },
    { boton: "Seis nodos",
      texto: "Seis nodos, con el 55 sin hijo izquierdo. Cada nodo es mayor que todo su subárbol izquierdo y menor que todo el derecho.",
      T: [40, [12, [11, [], []], [29, [], []]], [55, [], [61, [], []]]] },
    { boton: "Ocho nodos",
      texto: "Ocho nodos y tres niveles por debajo de la raíz. El 41 cuelga de 48 por la izquierda y tiene un solo hijo.",
      T: [33, [19, [14, [], []], [22, [], []]], [48, [41, [36, [], []], []], [50, [], []]]] }
  ];
  ARBOLES.forEach(function (a) {
    a.n = ARB.contarNodos(a.T);
    a.h = ARB.altura(a.T);
    a.L = ARB.layoutBinario(a.T, { ancho: 540, alto: a.h > 2 ? 230 : 180 });
    a.pre = ARB.preorden(a.T, []);
    a.pos = ARB.posorden(a.T, []);
    a.ino = ARB.inorden(a.T, []);
    a.niv = ARB.niveles(a.T);
  });

  var CAMPOS = [
    { id: "pre", rotulo: "Preorden", de: function (a) { return a.pre; },
      regla: "El recorrido escribe la raíz, después el subárbol izquierdo completo y después el derecho.",
      pista: "El primero de un preorden es siempre la raíz, y después viene el subárbol izquierdo completo." },
    { id: "pos", rotulo: "Posorden", de: function (a) { return a.pos; },
      regla: "El recorrido escribe el subárbol izquierdo, después el derecho y de último la raíz.",
      pista: "El último de un posorden es siempre la raíz, y el primero es el nodo más a la izquierda y más abajo." },
    { id: "ino", rotulo: "Inorden", de: function (a) { return a.ino; },
      regla: "El recorrido escribe el subárbol izquierdo, después la raíz y después el derecho.",
      pista: "A la izquierda de la raíz, en el inorden, quedan exactamente los nodos de su subárbol izquierdo." },
    { id: "niv", rotulo: "Por niveles", de: function (a) { return a.niv; },
      regla: "El recorrido termina un nivel antes de bajar al siguiente, y de eso se encarga la cola y no la recursión.",
      pista: "Después de la raíz salen sus dos hijos, y después los cuatro nietos que existan, de izquierda a derecha." }
  ];

  function revisar(a, campo, escrito) {
    var esperado = campo.de(a), leido = ARB.leerSecuencia(escrito);
    if (leido.length === 0) { return { ok: false, msg: "Falta escribir la secuencia." }; }
    var k = ARB.divergeEn(leido, esperado);
    if (k === -1) {
      return { ok: true, msg: "Correcto: " + ARB.txt(esperado) + ". " + campo.regla };
    }
    if (leido.length !== a.n) {
      return { ok: false, msg: "El árbol tiene " + a.n + " nodos y la secuencia trae " + leido.length +
        ". Todo recorrido escribe cada nodo una sola vez." };
    }
    return { ok: false, msg: "Se desvía en la posición " + (k + 1) + ": escribió " +
      (leido[k] === undefined ? "nada" : leido[k]) + " y ahí va " + esperado[k] + ". " + campo.pista };
  }

  /* ---------- reconstruccion ---------- */

  var TIPOS = {
    pre: { rotulo: "Preorden", enEl: "el preorden",
           regla: "la raíz de un pedazo es el primero de ese pedazo en el preorden" },
    pos: { rotulo: "Posorden", enEl: "el posorden",
           regla: "la raíz de un pedazo es el último de ese pedazo en el posorden" },
    niv: { rotulo: "Por niveles", enEl: "el recorrido por niveles",
           regla: "la raíz de un pedazo es el primero de ese pedazo en el recorrido por niveles" }
  };

  var CASOS = [
    { boton: "Preorden e inorden", tipo: "pre",
      otro: [46, 19, 12, 23, 57, 51], ino: [12, 19, 23, 46, 51, 57] },
    { boton: "Posorden e inorden", tipo: "pos",
      otro: [24, 32, 18, 51, 73, 60, 45], ino: [18, 24, 32, 45, 51, 60, 73] },
    { boton: "Niveles e inorden", tipo: "niv",
      otro: [64, 28, 70, 13, 35, 88, 81], ino: [13, 28, 35, 64, 70, 81, 88] }
  ];
  CASOS.forEach(function (c) {
    c.T = ARB.reconstruir(c.otro, c.ino, c.tipo);
    c.pre = ARB.preorden(c.T, []);
    c.pos = ARB.posorden(c.T, []);
    c.niv = ARB.niveles(c.T);
    c.n = ARB.contarNodos(c.T);
  });

  function raizEsperada(c, seg) { return ARB.raizDe(seg.otro, seg.ino, c.tipo, seg.ino); }

  function partir(c, seg, v) {
    var k = seg.ino.indexOf(v);
    var izqIno = seg.ino.slice(0, k), derIno = seg.ino.slice(k + 1), izqOtro, derOtro;
    if (c.tipo === "pre") {
      izqOtro = seg.otro.slice(1, 1 + izqIno.length);
      derOtro = seg.otro.slice(1 + izqIno.length);
    } else if (c.tipo === "pos") {
      izqOtro = seg.otro.slice(0, izqIno.length);
      derOtro = seg.otro.slice(izqIno.length, seg.otro.length - 1);
    } else {
      izqOtro = seg.otro.filter(function (x) { return izqIno.indexOf(x) >= 0; });
      derOtro = seg.otro.filter(function (x) { return derIno.indexOf(x) >= 0; });
    }
    return { izq: { ino: izqIno, otro: izqOtro }, der: { ino: derIno, otro: derOtro } };
  }

  function fbRec(c, seg, v, intentos) {
    var correcta = raizEsperada(c, seg);
    if (v === correcta) {
      return { ok: true, msg: v + " es la raíz de ese pedazo. En el inorden deja " +
        (seg.ino.indexOf(v) === 0 ? "nada a su izquierda" : seg.ino.slice(0, seg.ino.indexOf(v)).join(" ") + " a su izquierda") +
        " y " + (seg.ino.indexOf(v) === seg.ino.length - 1 ? "nada a su derecha" : seg.ino.slice(seg.ino.indexOf(v) + 1).join(" ") + " a su derecha") + "." };
    }
    if (seg.ino.indexOf(v) < 0) {
      return { ok: false, msg: "El " + v + " no está en el pedazo que se está mirando, que en el inorden es " +
        seg.ino.join(" ") + ". Un nodo de otro pedazo ya tiene su lugar en el árbol." };
    }
    var m = "No: " + TIPOS[c.tipo].regla + ", y el " + v + " no lo es.";
    if (intentos >= 1) {
      m = m + " Ese pedazo, en " + TIPOS[c.tipo].enEl + ", es " + seg.otro.join(" ") + ".";
    }
    return { ok: false, msg: m };
  }

  return { ARBOLES: ARBOLES, CAMPOS: CAMPOS, CASOS: CASOS, TIPOS: TIPOS,
           revisar: revisar, raizEsperada: raizEsperada, partir: partir, fbRec: fbRec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, idx = 0, caso = 0, env, pendientes, intentos;
    function el(id) { return document.getElementById(id); }
    function arbol() { return E.ARBOLES[idx]; }

    /* ---------- tarjeta 1 ---------- */

    function dibujo() {
      var A = arbol();
      el("ver-texto").textContent = A.texto + " Tiene " + A.n + " nodos y altura " + A.h + ".";
      el("panel-arbol").innerHTML = GRAFOSVG.dibujar({
        n: A.L.n, pos: A.L.pos, aristas: A.L.aristas, dirigido: false,
        ancho: A.L.ancho, alto: A.L.alto, nombre: A.L.nombre,
        nodo: function (i) { return i === 0 ? { relleno: "#fdf1dc", borde: "#e8a13d", grueso: 3 } : {}; }
      });
    }

    function campos() {
      el("campos").innerHTML = E.CAMPOS.map(function (c) {
        return "<div class='fila-rec'><span class='rotulo'>" + c.rotulo +
          "</span><input type='text' class='larga' id='in-" + c.id + "' placeholder='valores separados por espacios'>" +
          "<span class='fb' id='fb-" + c.id + "'></span></div>";
      }).join("");
    }

    function limpiar() {
      E.CAMPOS.forEach(function (c) {
        el("in-" + c.id).value = "";
        el("fb-" + c.id).className = "fb";
        el("fb-" + c.id).textContent = "";
      });
      el("fb-general").className = "fb";
      el("fb-general").textContent = "";
    }

    function comprobar() {
      var A = arbol(), buenas = 0;
      E.CAMPOS.forEach(function (c) {
        var r = E.revisar(A, c, el("in-" + c.id).value), caja = el("fb-" + c.id);
        caja.className = r.ok ? "fb bien" : "fb mal";
        caja.textContent = r.msg;
        if (r.ok) { buenas = buenas + 1; }
      });
      el("fb-general").className = buenas === 4 ? "fb bien" : "fb mal";
      el("fb-general").textContent = buenas === 4
        ? "Los cuatro salen. Los tres de profundidad recorren los mismos nodos en el mismo descenso y solo mueven el renglón que escribe la raíz; el de amplitud es el único que no usa recursión."
        : buenas + " de 4 correctos.";
    }

    /* ---------- tarjeta 2 ---------- */

    function tira(id, lista, resaltar) {
      el(id).innerHTML = lista.map(function (v) {
        return "<span class='par" + (resaltar && resaltar.indexOf(v) < 0 ? " fuera" : "") + "'>" + v + "</span>";
      }).join(" ");
    }

    function nuevoCaso() {
      var c = E.CASOS[caso];
      env = [[]];
      pendientes = [{ ino: c.ino, otro: c.otro, cont: env, idx: 0, donde: "el árbol completo" }];
      intentos = 0;
      el("ver-caso").textContent = "Un árbol de " + c.n + " nodos del que se conocen dos recorridos. " +
        "En cada paso se marca un pedazo del inorden y se escoge su raíz: " + E.TIPOS[c.tipo].regla + ".";
      el("rot-otro").textContent = E.TIPOS[c.tipo].rotulo;
      el("fb-rec").className = "fb";
      el("fb-rec").textContent = "";
      pintarRec();
    }

    function pintarRec() {
      var c = E.CASOS[caso], seg = pendientes.length > 0 ? pendientes[pendientes.length - 1] : null;
      tira("ver-otro", c.otro, seg ? seg.otro : null);
      tira("ver-ino", c.ino, seg ? seg.ino : null);
      if (seg) {
        el("ver-pregunta").textContent = "¿Cuál de estos es la raíz de " + seg.donde + "?";
        el("candidatos").innerHTML = seg.ino.map(function (v) {
          return "<button class='vert' data-v='" + v + "'>" + v + "</button>";
        }).join("");
        Array.prototype.forEach.call(el("candidatos").querySelectorAll("button"), function (b) {
          b.addEventListener("click", function () { clic(parseInt(b.getAttribute("data-v"), 10), b); });
        });
      } else {
        el("ver-pregunta").textContent = "El árbol quedó armado.";
        el("candidatos").innerHTML = "";
      }
      var T = env[0];
      if (T.length === 0) {
        el("panel-rec").innerHTML = "";
        el("pie-rec").textContent = "El dibujo aparece con el primer nodo colocado.";
      } else {
        var L = ARB.layoutBinario(T, { ancho: 540, alto: ARB.altura(T) > 2 ? 230 : 170 });
        el("panel-rec").innerHTML = GRAFOSVG.dibujar({
          n: L.n, pos: L.pos, aristas: L.aristas, dirigido: false,
          ancho: L.ancho, alto: L.alto, nombre: L.nombre
        });
        el("pie-rec").innerHTML = pendientes.length > 0
          ? "Van " + ARB.contarNodos(T) + " nodos de " + c.n + "."
          : "Los " + c.n + " nodos. Preorden " + ARB.txt(c.pre) + "; posorden " + ARB.txt(c.pos) +
            "; por niveles " + ARB.txt(c.niv) + ". Con el inorden y uno de los otros tres el árbol queda determinado, y con el preorden y el posorden a secas no.";
      }
    }

    function clic(v, boton) {
      var c = E.CASOS[caso], seg = pendientes[pendientes.length - 1];
      var r = E.fbRec(c, seg, v, intentos);
      el("fb-rec").className = r.ok ? "fb bien" : "fb mal";
      el("fb-rec").textContent = r.msg;
      if (!r.ok) {
        intentos = intentos + 1;
        boton.classList.add("falla");
        return;
      }
      var nodo = [v, [], []];
      seg.cont[seg.idx] = nodo;
      var partes = E.partir(c, seg, v);
      pendientes.pop();
      if (partes.der.ino.length > 0) {
        pendientes.push({ ino: partes.der.ino, otro: partes.der.otro, cont: nodo, idx: 2,
                          donde: "el subárbol derecho de " + v });
      }
      if (partes.izq.ino.length > 0) {
        pendientes.push({ ino: partes.izq.ino, otro: partes.izq.otro, cont: nodo, idx: 1,
                          donde: "el subárbol izquierdo de " + v });
      }
      intentos = 0;
      pintarRec();
    }

    /* ---------- cableado ---------- */

    el("presets-arbol").innerHTML = "<span class='nota' style='margin-top:0'>Árbol:</span>" +
      E.ARBOLES.map(function (a, i) {
        return "<button data-i='" + i + "' class='" + (i === 0 ? "primario" : "") + "'>" + a.boton + "</button>";
      }).join("");
    Array.prototype.forEach.call(el("presets-arbol").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        idx = parseInt(b.getAttribute("data-i"), 10);
        Array.prototype.forEach.call(el("presets-arbol").querySelectorAll("button"), function (x) { x.classList.remove("primario"); });
        b.classList.add("primario");
        limpiar();
        dibujo();
      });
    });

    el("presets-caso").innerHTML = "<span class='nota' style='margin-top:0'>Los dos recorridos:</span>" +
      E.CASOS.map(function (c, i) {
        return "<button data-i='" + i + "' class='" + (i === 0 ? "primario" : "") + "'>" + c.boton + "</button>";
      }).join("");
    Array.prototype.forEach.call(el("presets-caso").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        caso = parseInt(b.getAttribute("data-i"), 10);
        Array.prototype.forEach.call(el("presets-caso").querySelectorAll("button"), function (x) { x.classList.remove("primario"); });
        b.classList.add("primario");
        nuevoCaso();
      });
    });

    el("btn-comprobar").addEventListener("click", comprobar);
    el("btn-limpiar").addEventListener("click", limpiar);
    el("btn-reiniciar-rec").addEventListener("click", nuevoCaso);
    campos();
    dibujo();
    nuevoCaso();
  })();
}
