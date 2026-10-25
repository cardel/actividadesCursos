/* Ejercicio interactivo: la pila de llamadas de contarPares sobre un árbol
   de cinco nodos, marco por marco. */
var EJERCICIO = (function () {
  var A = (typeof Arbol !== "undefined") ? Arbol : require("../comun/arbol.js");
  var N = A.N;

  var CODIGO = [
    "// Cuantos datos pares hay en el arbol. El vacio no tiene ninguno.",
    "int contarPares(Nodo *r) {",
    "  int res = 0;",
    "  if (r != NULL) {",
    "    int propio = 0;",
    "    if (r->dato % 2 == 0) {",
    "      propio = 1;",
    "    }",
    "    res = propio + contarPares(r->izq) + contarPares(r->der);",
    "  }",
    "  return res;",
    "}"
  ].join("\n");

  function armar() {
    var siete = N(7, null, N(4, null, null));
    var dieciocho = N(18, N(9, null, null), null);
    return N(12, siete, dieciocho);
  }

  function contarPares(r) {
    var res = 0;
    if (r !== null) {
      var propio = 0;
      if (r.dato % 2 === 0) { propio = 1; }
      res = propio + contarPares(r.izq) + contarPares(r.der);
    }
    return res;
  }

  function textoMarco(m) {
    var t;
    if (m.r === null) {
      t = "contarPares(r = NULL): devuelve 0";
    } else {
      t = "contarPares(r = " + m.r.dato + "): " + m.propio + " + " +
          (m.izq === null ? "?" : m.izq) + " + " + (m.der === null ? "?" : m.der);
      if (m.res !== null) { t = t + ", devuelve " + m.res; }
    }
    return t;
  }

  function dibujarPila(pila, raizDato) {
    var cajas = ['<div style="font-family:ui-monospace,monospace;font-size:0.82rem;border:1px solid #d8dee6;border-radius:6px;padding:0.25rem 0.5rem;background:#eceff3;color:#6b7280">main: espera contarPares(' + raizDato + ')</div>'];
    pila.forEach(function (m, i) {
      var arriba = i === pila.length - 1;
      cajas.push('<div style="font-family:ui-monospace,monospace;font-size:0.82rem;border:' + (arriba ? "2px solid #e8a13d" : "1px solid #d8dee6") +
                 ';border-radius:6px;padding:0.25rem 0.5rem;background:' + (arriba ? "#fdf1dc" : "#ffffff") + '">' + textoMarco(m) + '</div>');
    });
    cajas.push('<div style="font-size:0.78rem;color:#6b7280">pila de llamadas: arriba, el marco que se ejecuta</div>');
    return '<div style="display:flex;flex-direction:column-reverse;gap:4px;flex:1 1 280px">' + cajas.join("") + '</div>';
  }

  /* La simulación sigue el código: cada llamada abre un marco; el vacío
     responde 0 sin llamar a nadie; un nodo suma propio con lo que devuelven
     sus dos hijos, primero el izquierdo. */
  function simular(raiz) {
    var pasos = [];
    var pila = [];
    var devuelto = {};
    var cuenta = { llamadas: 0, maxMarcos: 0 };
    function foto(texto) {
      var estilos = {};
      Object.keys(devuelto).forEach(function (k) { estilos[k] = "hecho"; });
      pila.forEach(function (m, i) {
        if (m.r !== null) { estilos[A.id(m.r)] = i === pila.length - 1 ? "activo" : "espera"; }
      });
      var html = '<div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:flex-start">' +
                 '<div style="flex:1 1 240px">' + A.binario(raiz, { estilos: estilos, valores: Object.assign({}, devuelto), vacios: true }) + '</div>' +
                 dibujarPila(pila, raiz.dato) + '</div>';
      pasos.push({ texto: texto, html: html, marcos: pila.length });
    }
    function llamar(r) {
      cuenta.llamadas = cuenta.llamadas + 1;
      var m = { r: r, propio: 0, izq: null, der: null, res: null };
      pila.push(m);
      if (pila.length > cuenta.maxMarcos) { cuenta.maxMarcos = pila.length; }
      var res = 0;
      if (r === null) {
        m.res = 0;
        foto("r es NULL: caso base. Devuelve 0 sin llamar a nadie y su marco sale de la pila");
      } else {
        if (r.dato % 2 === 0) { m.propio = 1; }
        foto("entra contarPares(" + r.dato + "): " + r.dato + (m.propio === 1 ? " es par, propio = 1" : " es impar, propio = 0") + "; para sumar necesita primero a su hijo izquierdo");
        m.izq = llamar(r.izq);
        m.der = llamar(r.der);
        res = m.propio + m.izq + m.der;
        m.res = res;
        devuelto[A.id(r)] = String(res);
        foto("contarPares(" + r.dato + ") tiene sus dos respuestas: " + m.propio + " + " + m.izq + " + " + m.der + " = " + res + ". Lo devuelve y su marco sale");
      }
      pila.pop();
      return res;
    }
    var total = llamar(raiz);
    return { pasos: pasos, total: total, llamadas: cuenta.llamadas, maxMarcos: cuenta.maxMarcos, devuelto: devuelto };
  }

  function spec() {
    var raiz = armar();
    var s = simular(raiz);
    var n = A.tamano(raiz);
    var DEGENERADO = 5;
    var codigo = "<pre class=\"fragmento\">" + A.escapar(CODIGO) + "</pre>";
    return {
      contenedor: "tarjetas",
      cierre: "Cada nodo y cada vacío reciben exactamente una llamada: con n nodos son 2n + 1 llamadas, cada una con trabajo Θ(1) fuera de las que hace, y contarPares cuesta Θ(n). En la pila solo conviven los marcos de un camino que baja desde la raíz, más el del vacío donde termina: a lo sumo h + 2 marcos, O(h) de espacio aparte.",
      cartas: [
        { tipo: "respuesta", titulo: "Antes de seguir la pila",
          html: codigo + A.binario(raiz, { titulo: "árbol de cinco nodos con raíz 12" }) +
                "<p>¿Qué devuelve <code>contarPares</code> sobre el subárbol de 7, sobre el de 18 y sobre el árbol completo?</p>",
          campos: [
            { rotulo: "contarPares(7):", esperado: s.devuelto["7"], ancho: "3rem" },
            { rotulo: "contarPares(18):", esperado: s.devuelto["18"], ancho: "3rem" },
            { rotulo: "contarPares(12):", esperado: String(s.total), ancho: "3rem" }
          ],
          bien: "Correcto. 7 es impar pero su hijo 4 es par: 0 + 0 + 1. 18 es par y su hijo 9 no: 1 + 0 + 0. La raíz suma 1 + 1 + 1 = 3.",
          distractores: [
            { valores: ["0", null, null], msg: "El 7 es impar, pero contarPares(7) cuenta todo su subárbol, y ahí está el 4." },
            { valores: [null, null, "2"], msg: "La raíz 12 también es par: su propio vale 1." }
          ],
          otro: "Cada llamada devuelve los pares de todo su subárbol: propio, más lo del izquierdo, más lo del derecho." },
        { tipo: "pasos", titulo: "La pila de llamadas, marco por marco",
          html: "<p>En naranja, el nodo del marco que se ejecuta; en naranja claro, los que esperan; en verde, los que ya devolvieron, con lo que devolvieron al lado. Los cuadros grises son los vacíos.</p>",
          pasos: s.pasos.map(function (p) { return { texto: p.texto, html: p.html }; }) },
        { tipo: "respuesta", titulo: "Llamadas y marcos",
          html: "<p>Sobre el árbol completo, ¿cuántas veces se llama <code>contarPares</code> en total, contando la de <code>main</code>? ¿Cuántos marcos de <code>contarPares</code> llega a tener la pila a la vez?</p>",
          campos: [
            { rotulo: "llamadas:", esperado: String(s.llamadas), ancho: "3.5rem" },
            { rotulo: "marcos a la vez:", esperado: String(s.maxMarcos), ancho: "3.5rem" }
          ],
          bien: "Correcto: " + n + " llamadas sobre nodos y " + (n + 1) + " sobre vacíos, " + s.llamadas + " en total. La pila llega a " + s.maxMarcos + " marcos: 12, 7, 4 y el vacío izquierdo de 4.",
          distractores: [
            { valores: [String(n), null], msg: "También se llama sobre cada vacío: son " + (n + 1) + " llamadas más, que responden 0 de inmediato." },
            { valores: [null, String(n)], msg: "Los cinco marcos nunca están a la vez: el de 7 sale antes de que entre el de 18." },
            { valores: [null, "3"], msg: "Falta el marco del vacío: la llamada más honda cae en un hijo NULL del nodo más profundo." }
          ],
          otro: "Cuente una llamada por nodo y una por vacío. Para los marcos, busque el camino más largo desde la raíz y sume el vacío del final." },
        { tipo: "opciones", titulo: "Los cuatro marcos", columna: true, correcta: "camino",
          html: "<p>¿Qué marcos están en la pila en el momento en que hay cuatro de <code>contarPares</code>?</p>",
          opciones: [
            { op: "camino", texto: "Los de 12, 7, 4 y un vacío hijo de 4", msg: "Correcto. Es el camino de la raíz al nodo más profundo, más el vacío donde la bajada se detiene." },
            { op: "hermanos", texto: "Los de 12, 7, 18 y 4", msg: "7 y 18 son hermanos: el marco de 7 termina y sale antes de que se llame contarPares(18). Nunca conviven." },
            { op: "pares", texto: "Los de los tres nodos pares, 12, 4 y 18, y el de main", msg: "Todo nodo abre un marco, sea par o no, y main no se cuenta entre los de contarPares." }
          ] },
        { tipo: "respuesta", titulo: "Un árbol que es una lista",
          html: "<p>Ahora el árbol tiene " + DEGENERADO + " nodos, cada uno hijo derecho del anterior. ¿Cuántas llamadas hace <code>contarPares</code>? ¿Cuántos marcos llega a tener la pila a la vez?</p>",
          campos: [
            { rotulo: "llamadas:", esperado: String(2 * DEGENERADO + 1), ancho: "3.5rem" },
            { rotulo: "marcos a la vez:", esperado: String(DEGENERADO + 1), ancho: "3.5rem" }
          ],
          bien: "Correcto. Las llamadas siguen siendo 2n + 1 = " + (2 * DEGENERADO + 1) + ", pero ahora la altura es n − 1 = " + (DEGENERADO - 1) + " y la pila apila los " + DEGENERADO + " nodos más el vacío del final: h + 2 = " + (DEGENERADO + 1) + ". En una lista de n nodos el espacio aparte es Θ(n).",
          distractores: [
            { valores: [null, "4"], msg: "Con cinco nodos encadenados ninguno responde antes de que llegue el último; además va el vacío del final." },
            { valores: [String(DEGENERADO), null], msg: "Cada nodo deja además un vacío a la izquierda y el último uno a la derecha: n + 1 vacíos." }
          ],
          otro: "La cuenta de llamadas no depende de la forma. Los marcos sí: siguen el camino más largo." }
      ]
    };
  }

  return { codigo: CODIGO, armar: armar, contarPares: contarPares, simular: simular, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
