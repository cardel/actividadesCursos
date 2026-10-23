/* Ejercicio interactivo: el método de la multiplicación, h(k) = piso(m * (k A mod 1)). */
var EJERCICIO = (function () {
  var A = 0.7071;
  var M = 32;
  var K1 = 57;
  var POTENCIAS = [32, 64, 96, 128];
  var MALA = 0.5;
  var MALAS = [57, 32, 64, 96];
  var K2 = 2026;
  var M2 = 1000;

  var CODIGO = [
    "const double A = 0.7071;",
    "",
    "int hashMult(int k, int m) {",
    "  double t = k * A;",
    "  double frac = t - (long long) t;   // parte fraccionaria de k * A",
    "  return (int) (m * frac);",
    "}"
  ].join("\n");

  /* La misma cuenta de hashMult, con la constante como parámetro. */
  function hashMult(k, m, a) {
    var t = k * a;
    var frac = t - Math.trunc(t);
    return Math.trunc(m * frac);
  }

  function partes(k, m, a) {
    var t = k * a;
    var frac = t - Math.trunc(t);
    return { t: t, entera: Math.trunc(t), frac: frac, mf: m * frac, h: Math.trunc(m * frac) };
  }

  function coma(x, d) {
    return x.toFixed(d).replace(".", ",");
  }

  function pasos() {
    var p = partes(K1, M, A);
    function caja(txt) { return "<pre class=\"fragmento\">" + txt + "</pre>"; }
    return [
      { texto: "la clave y las constantes", html: caja("k = " + K1 + ", A = " + coma(A, 4) + ", m = " + M) },
      { texto: "multiplicar k por A", html: caja("t = " + K1 + " · " + coma(A, 4) + " = " + coma(p.t, 4)) },
      { texto: "quitar la parte entera", html: caja("frac = " + coma(p.t, 4) + " − " + p.entera + " = " + coma(p.frac, 4)) },
      { texto: "multiplicar por m", html: caja("m · frac = " + M + " · " + coma(p.frac, 4) + " = " + coma(p.mf, 4)) },
      { texto: "quedarse con la parte entera", html: caja("h(" + K1 + ") = ⌊" + coma(p.mf, 4) + "⌋ = " + p.h) }
    ];
  }

  function spec() {
    var p1 = partes(K1, M, A);
    var div = POTENCIAS.map(function (k) { return k % M; });
    var mul = POTENCIAS.map(function (k) { return hashMult(k, M, A); });
    var mala = MALAS.map(function (k) { return hashMult(k, M, MALA); });
    var h2 = hashMult(K2, M2, A);
    return {
      contenedor: "tarjetas",
      cierre: "El método de la multiplicación (CLRS, §11.3) toma la parte fraccionaria de kA y la estira a [0, m): h(k) = ⌊m (kA mod 1)⌋. Como todos los dígitos de k mueven la parte fraccionaria, funciona también con m potencia de 2, donde la división solo mira los últimos bits. La constante sí importa: con A = 0,5 la parte fraccionaria solo puede ser 0 o 0,5. Cada cálculo es una multiplicación, una resta y otra multiplicación: Θ(1).",
      cartas: [
        { tipo: "respuesta", titulo: "Una clave, paso a paso",
          html: "<pre class=\"fragmento\">" + CODIGO.replace(/</g, "&lt;") + "</pre><p>Con k = " + K1 + " y m = " + M + ", ¿cuánto vale la parte entera de k·A y qué devuelve <code>hashMult</code>?</p>",
          campos: [
            { rotulo: "⌊kA⌋:", esperado: String(p1.entera), ancho: "4rem" },
            { rotulo: "h(" + K1 + "):", esperado: String(p1.h), ancho: "4rem" }
          ],
          bien: "Correcto: 57 · 0,7071 = 40,3047; la parte fraccionaria es 0,3047; 32 · 0,3047 = 9,7504, y el cast a int deja 9.",
          distractores: [
            { valores: [null, String(Math.round(p1.mf))], msg: "El cast a int trunca: 9,75 queda en 9, no se redondea a 10." },
            { valores: [null, String(K1 % M)], msg: "Ese es 57 mod 32, el método de la división. Aquí la cubeta sale de la parte fraccionaria de k·A." },
            { valores: [null, String(p1.entera % M)], msg: "Ese es la parte entera mod 32. El método usa la parte fraccionaria, la que queda después de quitar el 40." }
          ],
          otro: "Multiplique 57 por 0,7071, quite la parte entera, multiplique lo que queda por 32 y trunque." },
        { tipo: "pasos", titulo: "La cuenta de h(57)", pasos: pasos() },
        { tipo: "respuesta", titulo: "Múltiplos de 32 con m = 32",
          html: "<p>Las claves " + POTENCIAS.join(", ") + " van a una tabla de " + M + " cubetas. ¿Qué cubetas da el método de la división, k mod 32, y cuáles da <code>hashMult</code>?</p>",
          campos: [
            { rotulo: "división:", esperado: div.join(" "), pista: "a b c d", ancho: "7rem" },
            { rotulo: "multiplicación:", esperado: mul.join(" "), pista: "a b c d", ancho: "8rem" }
          ],
          bien: "Correcto. Con m = 32 = 2⁵ la división solo mira los cinco bits de abajo, que en los múltiplos de 32 son ceros: las cuatro claves chocan en la 0. La multiplicación las reparte en 20, 8, 28 y 16.",
          distractores: [
            { valores: ["1 2 3 4", null], msg: "Eso es k / 32. La división de la función hash se queda con el residuo." },
            { valores: [null, "22 45 67 90"], msg: "Esa es la parte entera de k·A. Lo que sirve es la parte fraccionaria, multiplicada por 32." }
          ],
          otro: "Para la multiplicación, haga con cada clave los mismos cuatro pasos que con el 57." },
        { tipo: "respuesta", titulo: "Una constante mala",
          html: "<p>Alguien cambia la constante a <code>A = 0.5</code>. Con m = " + M + ", ¿qué cubetas da para " + MALAS.join(", ") + "?</p>",
          campos: [{ rotulo: "cubetas:", esperado: mala.join(" "), pista: "a b c d", ancho: "8rem" }],
          bien: "Correcto. k · 0,5 tiene parte fraccionaria 0 si k es par y 0,5 si es impar: solo hay dos cubetas posibles, la 0 y la 16.",
          distractores: [
            { valores: ["28 16 32 48"], msg: "Esa es la parte entera de k · 0,5. La parte fraccionaria de un múltiplo de 0,5 es 0 o 0,5." },
            { valores: ["16 16 16 16"], msg: "Solo el 57 es impar. Para los pares, k · 0,5 es entero y la parte fraccionaria es 0." }
          ],
          otro: "Calcule k · 0,5 y fíjese que la parte fraccionaria solo puede ser 0 o 0,5." },
        { tipo: "opciones", titulo: "Por qué falla A = 0,5", columna: true, correcta: "pocos",
          html: "<p>¿Por qué la constante 0,5 reparte tan mal?</p>",
          opciones: [
            { op: "m", texto: "Porque m = 32 es potencia de 2", msg: "Con A = 0,7071 y el mismo m = 32 las claves se repartieron bien. La potencia de 2 le hace daño a la división, no a la multiplicación." },
            { op: "grande", texto: "Porque 0,5 es demasiado grande", msg: "No es cuestión de tamaño: 0,7071 es mayor y reparte bien. Lo que importa es cuántas partes fraccionarias distintas salen." },
            { op: "pocos", texto: "kA mod 1 solo toma dos valores, así que h solo toma dos", msg: "Correcto: la cubeta depende de la parte fraccionaria, y 0,5 deja solo 0 y 0,5. Una constante con muchas cifras, como 0,7071, hace que cada clave dé otra parte fraccionaria." }
          ] },
        { tipo: "respuesta", titulo: "Una tabla de mil cubetas",
          html: "<p>Con <code>A = 0.7071</code>, ¿qué devuelve <code>hashMult(" + K2 + ", " + M2 + ")</code>?</p>",
          campos: [{ rotulo: "h:", esperado: String(h2), ancho: "5rem" }],
          bien: "Correcto: 2026 · 0,7071 = 1432,5846; la parte fraccionaria es 0,5846 y 1000 · 0,5846 = 584,6, que se trunca a 584.",
          distractores: [
            { valores: [String(K2 % M2)], msg: "Ese es 2026 mod 1000, el método de la división." },
            { valores: ["585"], msg: "El cast a int trunca: 584,6 queda en 584." },
            { valores: ["432"], msg: "Esos son los tres últimos dígitos de la parte entera. La cubeta sale de la parte fraccionaria." }
          ],
          otro: "Los mismos pasos: k·A, parte fraccionaria, por 1000 y truncar." },
        { tipo: "opciones", titulo: "Lo que cuesta", columna: true, correcta: "uno",
          html: "<p>¿Qué cuesta <code>hashMult(k, m)</code>?</p>",
          opciones: [
            { op: "m", texto: "Θ(m), porque estira el resultado a m cubetas", msg: "Multiplicar por m es una sola operación, no un recorrido de las m cubetas." },
            { op: "uno", texto: "Θ(1)", msg: "Correcto: dos multiplicaciones y una resta, sin importar k ni m." },
            { op: "dig", texto: "Θ(número de dígitos de k)", msg: "k es un int: la máquina lo multiplica de una vez. El costo por carácter aparece con las cadenas y Horner." }
          ] }
      ]
    };
  }

  return { a: A, m: M, hashMult: hashMult, partes: partes, pasos: pasos, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
