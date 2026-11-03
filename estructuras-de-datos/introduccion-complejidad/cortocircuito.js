/* Ejercicio interactivo: los operadores de cortocircuito. La simulación
   cuenta cuántas veces se evalúa cada lado de la condición, con && y con &;
   los conteos con && coinciden con el programa instrumentado. */
var EJERCICIO = (function () {
  var SIN_CERO = [7, 3, 8, 1, 5];
  var CON_CERO = [7, 3, 8, 0, 5];

  var HASTA_CERO = [
    "int hasta_cero(int datos[], int n) {",
    "    int i = 0;",
    "    while (i < n && datos[i] != 0) {",
    "        i = i + 1;",
    "    }",
    "    return i;",
    "}"
  ];

  var CASILLA = [
    "int casilla_vacia(int datos[], int n, int k) {",
    "    int vacia = 0;",
    "    if (k < 0 || k >= n || datos[k] == 0) {",
    "        vacia = 1;",
    "    }",
    "    return vacia;",
    "}"
  ];

  var AL_REVES = [
    "while (datos[i] != 0 && i < n) {",
    "    i = i + 1;",
    "}"
  ];

  /* Evaluaciones de cada lado de i < n ? datos[i] != 0 hasta salir.
     corta: true para &&, false para &. fuera cuenta las lecturas de una
     casilla que no existe. */
  function evaluaciones(d, corta) {
    var n = d.length;
    var izq = 0, der = 0, fuera = 0, i = 0;
    var sigue = true;
    while (sigue) {
      izq = izq + 1;
      var a = i < n;
      var b = false;
      if (a || !corta) {
        der = der + 1;
        if (i >= n) { fuera = fuera + 1; } else { b = d[i] !== 0; }
      }
      if (a && b) { i = i + 1; } else { sigue = false; }
    }
    return { izq: izq, der: der, fuera: fuera, i: i };
  }

  /* Cuántas de las tres condiciones de casilla_vacia se evalúan. */
  function condicionesO(d, k) {
    var n = d.length;
    var res = 1;
    if (!(k < 0)) {
      res = 2;
      if (!(k >= n)) { res = 3; }
    }
    return res;
  }

  function escapar(t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function codigo(lineas) { return "<pre class=\"fragmento\">" + escapar(lineas.join("\n")) + "</pre>"; }
  function arreglo(d) { return "<code>{" + d.join(", ") + "}</code>"; }

  function spec() {
    var s = evaluaciones(SIN_CERO, true);
    var c = evaluaciones(CON_CERO, true);
    var y = evaluaciones(SIN_CERO, false);
    return {
      contenedor: "tarjetas",
      cierre: "<p>Con <code>&amp;&amp;</code>, si el lado izquierdo es falso la conjunción ya es falsa y el derecho no se evalúa; con <code>||</code>, si el izquierdo es verdadero la disyunción ya es verdadera. Por eso la comprobación de rango va primero: <code>i &lt; n &amp;&amp; datos[i] != 0</code> nunca lee <code>datos[n]</code>. Con <code>&amp;</code> se evalúan siempre los dos lados, y en la vuelta que sale se lee una casilla que no existe. El orden de los lados importa tanto como el operador.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Un arreglo sin ceros",
          html: codigo(HASTA_CERO) + "<p>Se llama <code>hasta_cero(datos, 5)</code> con " + arreglo(SIN_CERO) + ". ¿Cuántas veces se evalúa <code>i &lt; n</code> y cuántas <code>datos[i] != 0</code>?</p>",
          campos: [
            { rotulo: "i &lt; n:", esperado: String(s.izq), ancho: "3rem" },
            { rotulo: "datos[i] != 0:", esperado: String(s.der), ancho: "3rem" }
          ],
          bien: "Correcto. Con i de 0 a 4 se evalúan los dos lados y los dos dan cierto. Con i = 5, i < n da falso y el && no mira el lado derecho: datos[5] nunca se lee.",
          distractores: [
            { valores: [String(s.izq), String(s.izq)], msg: "Con i = 5 el lado izquierdo da falso, y con && eso basta: el derecho no se evalúa. Si se evaluara, leería datos[5], que no existe." },
            { valores: [String(s.der), String(s.der)], msg: "Falta la evaluación con i = 5: i < n se pregunta una vez más que las vueltas del ciclo, porque la que da falso también se ejecuta." }
          ],
          otro: "Escriba los valores de i, del 0 en adelante, y marque en cada uno qué lados de la condición se evalúan." },
        { tipo: "respuesta", titulo: "Un arreglo con un cero",
          html: "<p>La misma función con " + arreglo(CON_CERO) + ". ¿Cuántas veces se evalúa cada lado y qué devuelve?</p>",
          campos: [
            { rotulo: "i &lt; n:", esperado: String(c.izq), ancho: "3rem" },
            { rotulo: "datos[i] != 0:", esperado: String(c.der), ancho: "3rem" },
            { rotulo: "devuelve:", esperado: String(c.i), ancho: "3rem" }
          ],
          bien: "Correcto. Con i = 3 los dos lados se evalúan: i < n es cierto y datos[3] != 0 es falso, así que el ciclo sale ahí. Las dos condiciones se evaluaron cuatro veces, y devuelve 3, la posición del cero.",
          distractores: [
            { valores: [String(c.izq), String(c.izq - 1), null], msg: "Esta vez lo que saca del ciclo es el lado derecho: con i = 3, i < n es cierto, así que el && sí evalúa datos[3] != 0." },
            { valores: ["6", "5", null], msg: "El ciclo no llega al final del arreglo: se detiene en el cero de la posición 3." }
          ],
          otro: "El ciclo sale en la primera vuelta en que alguno de los dos lados da falso. ¿En qué valor de i pasa?" },
        { tipo: "opciones", titulo: "Con & en lugar de &&", columna: true, correcta: "lee",
          html: "<p>Alguien escribe <code>while (i &lt; n &amp; datos[i] != 0)</code> y llama la función con " + arreglo(SIN_CERO) + ". ¿Qué pasa en la última evaluación, con i = 5?</p>",
          opciones: [
            { op: "igual", texto: "Nada distinto: el ciclo sale igual porque i &lt; n es falso.", msg: "El ciclo sí sale, porque falso & cualquier cosa da falso. Pero antes de saberlo, & evalúa los dos lados: el derecho se evalúa " + y.der + " veces, una más que con &&, y esa última lee datos[5]." },
            { op: "lee", texto: "Se evalúan los dos lados, y el derecho lee datos[5], una casilla que no es del arreglo.", msg: "Correcto. & no corta: evalúa " + y.der + " veces el lado derecho, y la última lectura cae fuera del arreglo. Lo que haya en esa dirección no se sabe, y el programa puede leer basura o detenerse." },
            { op: "error", texto: "El compilador lo rechaza, porque & es para bits.", msg: "Compila: & entre dos comparaciones es válido en C. gcc -Wall avisa con -Wparentheses y pide paréntesis justo en esa línea, que es la pista de la trampa, pero genera el ejecutable igual." }
          ] },
        { tipo: "opciones", titulo: "Tres condiciones con ||", columna: true, correcta: "dos",
          html: codigo(CASILLA) + "<p>Se llama <code>casilla_vacia(datos, 5, 7)</code>. ¿Cuántas de las tres condiciones del <code>if</code> se evalúan?</p>",
          opciones: [
            { op: "tres", texto: "Las tres: el if necesita saber si alguna es verdadera.", msg: "Con || basta una verdadera para decidir. k >= n ya es verdadera, y datos[7] no se mira: por suerte, porque la casilla 7 no existe." },
            { op: "dos", texto: "Dos: k &lt; 0 es falsa, k &gt;= n es verdadera y ahí se detiene.", msg: "Correcto. Se evaluaron " + condicionesO(SIN_CERO, 7) + ". Con k = 7 y n = 5, la segunda ya decide la disyunción, y datos[7] nunca se lee." },
            { op: "una", texto: "Una: k &lt; 0 es falsa y ahí se detiene.", msg: "Con || lo que corta es una condición verdadera, no una falsa. Tras k < 0, falsa, hay que seguir con la siguiente." }
          ] },
        { tipo: "opciones", titulo: "El orden de los lados", columna: true, correcta: "orden",
          html: "<p>Otra versión de <code>hasta_cero</code> pone las condiciones al revés:</p>" + codigo(AL_REVES) + "<p>¿Qué cambia con el arreglo " + arreglo(SIN_CERO) + "?</p>",
          opciones: [
            { op: "nada", texto: "Nada: && es conmutativo, el resultado es el mismo.", msg: "El valor lógico de la conjunción es el mismo, pero el cortocircuito corre de izquierda a derecha. Con i = 5, lo primero que se evalúa es datos[5]." },
            { op: "orden", texto: "Con i = 5 se lee datos[5] antes de comprobar el rango.", msg: "Correcto. && solo protege lo que está a su derecha. La comprobación de rango tiene que ir primero para que la lectura no ocurra cuando i llega a n." },
            { op: "mas", texto: "Hace más vueltas, porque el ciclo depende primero de los datos.", msg: "Las vueltas son las mismas cinco. Lo que cambia es la última evaluación, que lee datos[5] antes de preguntar si i < n." }
          ] }
      ]
    };
  }

  return { SIN_CERO: SIN_CERO, CON_CERO: CON_CERO, evaluaciones: evaluaciones,
    condicionesO: condicionesO, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
