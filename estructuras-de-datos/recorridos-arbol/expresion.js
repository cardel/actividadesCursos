/* Ejercicio interactivo: el árbol de (9 − 4) * 2 − 12 / (1 + 3), sus tres
   notaciones y su evaluación en posorden. */
var EJERCICIO = (function () {
  var A = (typeof Arbol !== "undefined") ? Arbol : require("../comun/arbol.js");
  var N = A.N;

  var EVALUAR = [
    "// Posorden: se evaluan los dos operandos y despues se opera. Exige r != NULL.",
    "int evaluar(Nodo *r) {",
    "  int res = r->dato;",
    "  if (!esHoja(r)) {",
    "    int a = evaluar(r->izq);",
    "    int b = evaluar(r->der);",
    "    if (r->dato == '+') {",
    "      res = a + b;",
    "    } else if (r->dato == '-') {",
    "      res = a - b;",
    "    } else if (r->dato == '*') {",
    "      res = a * b;",
    "    } else {",
    "      res = a / b;",
    "    }",
    "  }",
    "  return res;",
    "}"
  ].join("\n");

  /* En un nodo interno, dato es el código del carácter del operador, como
     en el int dato del Nodo de C++; el id distingue los dos '-'. */
  function op(c, izq, der, id) { return N(c.charCodeAt(0), izq, der, { id: id, etiqueta: c }); }
  function hoja(v) { return N(v, null, null); }

  function armar() {
    var resta = op("-", hoja(9), hoja(4), "resta");
    var por = op("*", resta, hoja(2), "por");
    var suma = op("+", hoja(1), hoja(3), "suma");
    var entre = op("/", hoja(12), suma, "entre");
    return op("-", por, entre, "raiz");
  }

  function esHoja(r) { return r.izq === null && r.der === null; }
  function texto(r) { return esHoja(r) ? String(r.dato) : String.fromCharCode(r.dato); }

  function prefija(r, sal) {
    if (r !== null) { sal.push(texto(r)); prefija(r.izq, sal); prefija(r.der, sal); }
    return sal;
  }
  function postfija(r, sal) {
    if (r !== null) { postfija(r.izq, sal); postfija(r.der, sal); sal.push(texto(r)); }
    return sal;
  }
  /* Un paréntesis alrededor de cada operación, como infija. */
  function infija(r) {
    return esHoja(r) ? String(r.dato) : "(" + infija(r.izq) + " " + texto(r) + " " + infija(r.der) + ")";
  }
  /* El inorden sin paréntesis. */
  function plana(r) {
    return esHoja(r) ? String(r.dato) : plana(r.izq) + " " + texto(r) + " " + plana(r.der);
  }

  function operar(c, a, b) {
    var res;
    if (c === "+") { res = a + b; } else if (c === "-") { res = a - b; } else if (c === "*") { res = a * b; } else { res = Math.trunc(a / b); }
    return res;
  }

  /* evaluar, y lo que devuelve cada nodo interno, por id. */
  function evaluar(r, valores) {
    var res = r.dato;
    if (!esHoja(r)) {
      var a = evaluar(r.izq, valores);
      var b = evaluar(r.der, valores);
      res = operar(texto(r), a, b);
      if (valores) { valores[A.id(r)] = res; }
    }
    return res;
  }

  /* La postfija con una pila de operandos: un número se apila; un operador
     saca dos, opera y apila el resultado. La pila se muestra con el tope a
     la derecha. */
  function pilaPostfija(fichas) {
    var pila = [];
    var pasos = [];
    fichas.forEach(function (f, i) {
      var t;
      if (/^[0-9]+$/.test(f)) {
        pila.push(Number(f));
        t = "lee " + f + ": se apila";
      } else {
        var b = pila.pop();
        var a = pila.pop();
        var v = operar(f, a, b);
        pila.push(v);
        t = "lee " + f + ": saca " + b + " y " + a + ", calcula " + a + " " + f + " " + b + " = " + v + " y lo apila";
      }
      pasos.push({ texto: t, pila: pila.slice(), leidas: i + 1 });
    });
    return pasos;
  }

  /* El inorden sin paréntesis, con la precedencia usual de C++. */
  function conPrecedencia(cadena) {
    var f = cadena.split(" ");
    var sumandos = [];
    var signos = [];
    var actual = Number(f[0]);
    var i = 1;
    while (i < f.length) {
      var o = f[i];
      var v = Number(f[i + 1]);
      if (o === "*" || o === "/") {
        actual = operar(o, actual, v);
      } else {
        sumandos.push(actual);
        signos.push(o);
        actual = v;
      }
      i = i + 2;
    }
    sumandos.push(actual);
    var res = sumandos[0];
    signos.forEach(function (s, k) { res = operar(s, res, sumandos[k + 1]); });
    return res;
  }

  function spec() {
    var raiz = armar();
    var pre = prefija(raiz, []);
    var pos = postfija(raiz, []);
    var valores = {};
    var valor = evaluar(raiz, valores);
    var sinPar = plana(raiz);
    var pasos = pilaPostfija(pos);
    return {
      contenedor: "tarjetas",
      cierre: "El preorden del árbol de una expresión es la notación prefija, el posorden la postfija y el inorden la infija, que es la única que necesita paréntesis. evaluar es un posorden: un operador se calcula después de sus dos operandos, y por eso la postfija se evalúa leyéndola de izquierda a derecha con una pila.",
      cartas: [
        { tipo: "respuesta", titulo: "Prefija",
          html: A.binario(raiz, { titulo: "árbol de la expresión" }) +
                "<p>Este es el árbol de <code>(9 - 4) * 2 - 12 / (1 + 3)</code>. Las hojas son números y cada nodo interno es un operador. ¿Qué imprime el preorden, es decir, la notación prefija?</p>",
          campos: [{ rotulo: "prefija:", esperado: pre.join(" "), ancho: "16rem" }],
          bien: "Correcto: " + pre.join(" ") + ". El operador de la raíz va primero y cada operador antecede a sus dos operandos.",
          distractores: [
            { valores: [pos.join(" ")], msg: "Esa es la postfija, el posorden." },
            { valores: [sinPar], msg: "Ese es el inorden: los operadores quedan entre sus operandos." }
          ],
          otro: "Imprima el operador antes de bajar a sus dos operandos, el izquierdo completo primero." },
        { tipo: "respuesta", titulo: "Postfija",
          html: "<p>¿Qué imprime el posorden, la notación postfija?</p>",
          campos: [{ rotulo: "postfija:", esperado: pos.join(" "), ancho: "16rem" }],
          bien: "Correcto: " + pos.join(" ") + ". Cada operador sale justo después de sus dos operandos; la resta de la raíz, de última.",
          distractores: [
            { valores: [pre.slice().reverse().join(" ")], msg: "Esa es la prefija al revés: recorre el operando derecho antes que el izquierdo, y en una resta o una división el orden importa." }
          ],
          otro: "Recorra el operando izquierdo, después el derecho, y al final imprima el operador." },
        { tipo: "respuesta", titulo: "Lo que devuelve cada operador",
          html: "<pre class=\"fragmento\">" + A.escapar(EVALUAR) + "</pre><p>¿Qué devuelve <code>evaluar</code> en cada nodo interno? La división es entera.</p>",
          campos: [
            { rotulo: "9 − 4:", esperado: String(valores.resta), ancho: "3rem" },
            { rotulo: "*:", esperado: String(valores.por), ancho: "3rem" },
            { rotulo: "+:", esperado: String(valores.suma), ancho: "3rem" },
            { rotulo: "/:", esperado: String(valores.entre), ancho: "3rem" },
            { rotulo: "raíz:", esperado: String(valor), ancho: "3rem" }
          ],
          bien: "Correcto: 9 − 4 = 5, 5 · 2 = 10, 1 + 3 = 4, 12 / 4 = 3 y la raíz 10 − 3 = 7.",
          distractores: [
            { valores: [null, null, null, null, "-7"], msg: "La resta de la raíz es a − b con a el operando izquierdo, 10, y b el derecho, 3." }
          ],
          otro: "Calcule de abajo hacia arriba: cada operador espera los valores de sus dos hijos." },
        { tipo: "pasos", titulo: "La postfija con una pila",
          html: "<p>La postfija se evalúa de izquierda a derecha: un número se apila; un operador saca dos números, opera y apila el resultado. El primero que sale es el operando derecho.</p>",
          pasos: [{ texto: "la pila empieza vacía", html: dibujarPila([], pos, 0) }].concat(pasos.map(function (p) {
            return { texto: p.texto, html: dibujarPila(p.pila, pos, p.leidas) };
          })) },
        { tipo: "respuesta", titulo: "Sin paréntesis",
          html: "<p>Si la infija se imprimiera sin paréntesis saldría <code>" + sinPar + "</code>. Calculada con la precedencia de C++, la de * y / antes que la de + y −, ¿cuánto da?</p>",
          campos: [{ rotulo: "resultado:", esperado: String(conPrecedencia(sinPar)), ancho: "4rem" }],
          bien: "Correcto: 9 − 8 − 12 + 3 = −8, no 7. La cadena se agrupa de otra manera que el árbol; por eso la infija pone un paréntesis alrededor de cada operación: " + infija(raiz) + ".",
          distractores: [
            { valores: [String(valor)], msg: "7 es lo que vale el árbol. La cadena sin paréntesis multiplica 4 · 2 y divide 12 / 1 primero." }
          ],
          otro: "Primero 4 * 2 y 12 / 1; después las sumas y restas de izquierda a derecha." }
      ]
    };
  }

  /* La postfija, con las fichas ya leídas en azul, y la pila de operandos. */
  function dibujarPila(pila, fichas, leidas) {
    var fs = fichas.map(function (f, i) {
      return '<span class="ficha"' + (i < leidas ? "" : ' style="background:#e2e6eb;color:#6b7280"') + '>' + A.escapar(f) + '</span>';
    }).join("");
    var cajas = pila.length === 0 ? '<span class="nota">vacía</span>' : pila.map(function (v, i) {
      return '<div class="caja fija' + (i === pila.length - 1 ? ' actual' : '') + '">' + v + '</div>';
    }).join("");
    return '<div class="secuencia">' + fs + '</div><p class="nota">pila de operandos, tope a la derecha:</p><div class="arreglo">' + cajas + '</div>';
  }

  return { armar: armar, prefija: prefija, postfija: postfija, infija: infija, plana: plana, evaluar: evaluar,
           pilaPostfija: pilaPostfija, conPrecedencia: conPrecedencia, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
