/* Ejercicio interactivo: insertar con [] paso a paso, y la insercion que hace [] al consultar. */
var EJERCICIO = (function () {
  /* Un map<int, int> simulado: arreglo de parejas [clave, valor] ordenado por clave. */
  function posicion(m, k) {
    var i = 0;
    while (i < m.length && m[i][0] < k) { i = i + 1; }
    return i;
  }
  /* m[k]: si k no esta, entra (k, 0) en su lugar. Devuelve la pareja. */
  function corchete(m, k) {
    var i = posicion(m, k);
    if (i === m.length || m[i][0] !== k) { m.splice(i, 0, [k, 0]); }
    return m[i];
  }
  function borrar(m, k) {
    var i = posicion(m, k);
    var r = 0;
    if (i < m.length && m[i][0] === k) { m.splice(i, 1); r = 1; }
    return r;
  }

  var LINEAS = [
    { codigo: "m[50] = 7;", hacer: function (m) { corchete(m, 50)[1] = 7; } },
    { codigo: "m[20] = m[20] + 3;", hacer: function (m) { var p = corchete(m, 20); p[1] = p[1] + 3; } },
    { codigo: "m[50] = m[50] * 2;", hacer: function (m) { var p = corchete(m, 50); p[1] = p[1] * 2; } },
    { codigo: "if (m[35] > 0) { m[35] = 1; }", hacer: function (m) { var p = corchete(m, 35); if (p[1] > 0) { p[1] = 1; } } },
    { codigo: "m.erase(20);", hacer: function (m) { borrar(m, 20); } },
    { codigo: "m[20] = m[20] + 1;", hacer: function (m) { var p = corchete(m, 20); p[1] = p[1] + 1; } }
  ];

  function texto(m) {
    return m.length === 0 ? "(vacío)" : m.map(function (p) { return "(" + p[0] + ", " + p[1] + ")"; }).join(" ");
  }

  /* Estado del map tras cada linea. */
  function estados() {
    var m = [];
    return LINEAS.map(function (l) {
      l.hacer(m);
      return { contenido: texto(m), size: m.length };
    });
  }

  function spec() {
    var e = estados();
    var pasos = [{ html: "<pre class=\"fragmento\">map&lt;int, int&gt; m;\n\n(vacío)   size = 0</pre>", texto: "el map recién declarado" }];
    LINEAS.forEach(function (l, i) {
      pasos.push({ html: "<pre class=\"fragmento\">" + l.codigo.replace(/</g, "&lt;") + "\n\n" + e[i].contenido + "   size = " + e[i].size + "</pre>", texto: "después de la línea " + (i + 1) });
    });
    var programa = LINEAS.map(function (l) { return l.codigo; }).join("\n");
    return {
      contenedor: "tarjetas",
      cierre: "m[k] busca k y, si no está, lo inserta con valor 0 antes de devolverlo. Por eso m[k] = m[k] + 1 cuenta bien desde cero, y por eso preguntar con m[k] deja en el map claves que nadie asignó. Para preguntar se usa count o find.",
      cartas: [
        { tipo: "pasos", titulo: "Línea por línea", html: "<p>Siga el contenido del map, en el orden en que lo recorre un iterador, tras cada línea.</p>", pasos: pasos },
        { tipo: "respuesta", titulo: "El tamaño tras el if",
          html: "<pre class=\"fragmento\">" + programa.replace(/</g, "&lt;") + "</pre><p>¿Cuánto vale <code>m.size()</code> justo después de la línea del <code>if</code>, y cuánto vale <code>m[35]</code>?</p>",
          campos: [
            { rotulo: "size:", esperado: String(e[3].size), ancho: "3rem" },
            { rotulo: "valor de 35:", esperado: "0", ancho: "3rem" }
          ],
          bien: "Correcto. La condición m[35] > 0 inserta (35, 0) para poder comparar; como 0 no es mayor que 0, la asignación no corre y 35 se queda con 0.",
          distractores: [
            { valores: ["2", null], msg: "La condición del if también usa []: 35 no estaba, así que entra con 0 y el map pasa a tener tres parejas." },
            { valores: [null, "1"], msg: "m[35] vale 0 al evaluar la condición, 0 > 0 es falso y la línea m[35] = 1 no se ejecuta." }
          ],
          otro: "Mire qué hace m[35] cuando 35 no está." },
        { tipo: "respuesta", titulo: "Al final",
          html: "<p>¿Qué parejas quedan al final del programa, en el orden del iterador?</p>",
          campos: [{ rotulo: "contenido:", esperado: e[5].contenido, pista: "(a, b) (c, d) ...", ancho: "16rem" }],
          bien: "Correcto. erase(20) saca la pareja (20, 3); la última línea vuelve a insertar 20 con 0 y le suma 1.",
          distractores: [
            { valores: ["(20, 4) (35, 0) (50, 14)"], msg: "erase(20) sacó la pareja entera: cuando 20 vuelve a entrar, empieza en 0, no en 3." },
            { valores: ["(20, 1) (50, 14)"], msg: "Falta 35: la condición del if lo insertó con 0 y nadie lo sacó." }
          ],
          otro: "Repase el paso a paso de arriba, línea por línea." },
        { tipo: "opciones", titulo: "Preguntar sin insertar", columna: true, correcta: "count",
          html: "<p>¿Cómo se escribe la condición para que 35 no entre al map si no estaba?</p>",
          opciones: [
            { op: "count", texto: "<code>if (m.count(35) == 1 &amp;&amp; m[35] &gt; 0)</code>", msg: "Correcto. count no inserta, y si da 0 la segunda parte ni se evalúa, así que m[35] solo se usa cuando 35 ya está." },
            { op: "cero", texto: "<code>if (m[35] != 0)</code>", msg: "Sigue usando []: si 35 no está, lo inserta con 0 igual que antes." },
            { op: "size", texto: "<code>if (m.size() &gt; 0)</code>", msg: "size dice cuántas parejas hay, no si 35 está entre ellas." }
          ] }
      ]
    };
  }

  return { lineas: LINEAS, estados: estados, corchete: corchete, borrar: borrar, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
