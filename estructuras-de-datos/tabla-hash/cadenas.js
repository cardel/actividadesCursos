/* Ejercicio interactivo: el valor hash de una cadena.
   Suma de códigos y polinomio en base 31 reduciendo en cada paso (Horner). */
var EJERCICIO = (function () {
  var M = 19;
  var B = 31;

  function hashSuma(s, m) {
    var suma = 0;
    var i = 0;
    while (i < s.length) { suma = suma + s.charCodeAt(i); i = i + 1; }
    return suma % m;
  }

  /* Valores de h después de cada carácter. */
  function pasosPolinomio(s, m) {
    var h = 0;
    var pasos = [];
    var i = 0;
    while (i < s.length) {
      var c = s.charCodeAt(i);
      var antes = h;
      h = (h * B + c) % m;
      pasos.push({ caracter: s[i], codigo: c, antes: antes, bruto: antes * B + c, h: h });
      i = i + 1;
    }
    return pasos;
  }

  function hashPolinomio(s, m) {
    var p = pasosPolinomio(s, m);
    return p[p.length - 1].h;
  }

  function spec() {
    var p = pasosPolinomio("mar", M);
    return {
      contenedor: "tarjetas",
      cierre: "La suma de los códigos no ve el orden: toda palabra choca con sus anagramas. El polinomio en base 31 pesa cada carácter según su posición, y reducir módulo m en cada paso deja h siempre menor que m, así que la cuenta cabe en un int y el residuo final es el mismo. Calcular el valor hash de una cadena de L caracteres cuesta Θ(L).",
      cartas: [
        { tipo: "respuesta", titulo: "El polinomio de <code>mar</code>",
          html: "<p>Con b = 31 y m = " + M + ", h empieza en 0 y por cada carácter c se hace h ← (h · 31 + c) mod " + M + ". Los códigos son <code>'m'</code> = 109, <code>'a'</code> = 97 y <code>'r'</code> = 114. ¿Cuánto vale h después de cada carácter?</p>",
          campos: p.map(function (x) { return { rotulo: "tras '" + x.caracter + "':", esperado: String(x.h), ancho: "3.5rem" }; }),
          bien: "Correcto: " + p.map(function (x) { return "(" + x.antes + " · 31 + " + x.codigo + ") mod 19 = " + x.bruto + " mod 19 = " + x.h; }).join("; ") + ".",
          distractores: [
            { valores: ["14", "18", "17"], msg: "El último paso parte de h = 18: 18 · 31 + 114 = 672, y 672 = 35 · 19 + 7." },
            { valores: ["14", null, null], msg: "El primer paso está bien. En el segundo se multiplica el 14 por 31 antes de sumar 97." }
          ],
          otro: "En el primer paso h = (0 · 31 + 109) mod 19. Use ese resultado en el segundo." },
        { tipo: "tabla", titulo: "La traza de <code>mar</code>",
          cabecera: ["Carácter", "Código", "h · 31 + c", "mod 19"],
          filas: p.map(function (x) { return [x.caracter, String(x.codigo), String(x.bruto), String(x.h)]; }),
          nota: "Cada fila parte del h de la anterior. El número sin reducir nunca pasa de 18 · 31 + 127." },
        { tipo: "respuesta", titulo: "Sumar los códigos",
          html: "<p>Otra función suma los códigos y toma el residuo módulo " + M + ". Calcule la casilla de <code>mar</code> y la de <code>ram</code>.</p>",
          campos: [
            { rotulo: "mar:", esperado: String(hashSuma("mar", M)), ancho: "3.5rem" },
            { rotulo: "ram:", esperado: String(hashSuma("ram", M)), ancho: "3.5rem" }
          ],
          bien: "Correcto: 109 + 97 + 114 = 320 y 320 = 16 · 19 + 16. Las dos dan 16: tienen los mismos caracteres y la suma no ve el orden.",
          otro: "Sume 109, 97 y 114 y tome el residuo módulo 19. ram tiene los mismos caracteres." },
        { tipo: "respuesta", titulo: "El polinomio de <code>ram</code>",
          html: "<p>¿Y con el polinomio en base 31 y m = " + M + "? Calcule h de <code>ram</code>.</p>",
          campos: [{ rotulo: "h(ram) =", esperado: String(hashPolinomio("ram", M)), ancho: "3.5rem" }],
          bien: "Correcto: 114 mod 19 = 0; (0 · 31 + 97) mod 19 = 2; (2 · 31 + 109) mod 19 = 171 mod 19 = 0. Con el polinomio, ram va a la casilla 0 y mar a la 7: los anagramas se separan.",
          distractores: [
            { valores: ["7"], msg: "Ese es el valor de mar. En ram el primer carácter es 'r', y el orden cambia los productos." },
            { valores: ["16"], msg: "Ese es el valor de la suma. El polinomio multiplica por 31 antes de sumar cada carácter." }
          ],
          otro: "Empiece con 'r' = 114 y siga con 'a' y 'm', multiplicando por 31 en cada paso." },
        { tipo: "opciones", titulo: "Lo que cuesta", columna: true, correcta: "largo",
          html: "<p>Una tabla de palabras con n palabras guardadas calcula el valor hash de una palabra de L letras. ¿Cuánto cuesta ese cálculo?</p>",
          opciones: [
            { op: "largo", texto: "Θ(L): una vuelta por carácter", msg: "Correcto. El cálculo no depende de cuántas palabras tenga la tabla, solo del largo de la que llega." },
            { op: "uno", texto: "Θ(1), como con una clave entera", msg: "Con un entero es una división. Con una cadena hay que leer cada carácter: L vueltas." },
            { op: "n", texto: "Θ(n): hay que mirar las palabras guardadas", msg: "El valor hash sale de la palabra sola. Las guardadas se miran después, al recorrer la lista de la casilla." }
          ] }
      ]
    };
  }

  return { m: M, hashSuma: hashSuma, hashPolinomio: hashPolinomio, pasosPolinomio: pasosPolinomio, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
