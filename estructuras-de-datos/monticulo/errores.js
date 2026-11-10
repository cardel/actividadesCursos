/* Ejercicio interactivo: tres versiones con error de bajar, subir y
   extraer. Los arreglos que dejan los calcula la simulación, y los
   fragmentos de C++ se compilan en las pruebas contra ella. */
var EJERCICIO = (function () {
  var M = typeof module !== "undefined" ? require("./monti.js") : Monti;

  var PRIMERO = [
    "// Baja la clave de i con el primer hijo que sea mayor que ella.",
    "void bajarPrimero(vector<int> &a, int i) {",
    "  int n = (int) a.size();",
    "  bool sigue = true;",
    "  while (sigue) {",
    "    int izq = 2 * i + 1;",
    "    int der = 2 * i + 2;",
    "    if (izq < n && a[izq] > a[i]) {",
    "      int aux = a[i];",
    "      a[i] = a[izq];",
    "      a[izq] = aux;",
    "      i = izq;",
    "    } else if (der < n && a[der] > a[i]) {",
    "      int aux = a[i];",
    "      a[i] = a[der];",
    "      a[der] = aux;",
    "      i = der;",
    "    } else {",
    "      sigue = false;",
    "    }",
    "  }",
    "}"
  ];

  var MITAD = [
    "// Sube la clave de i, con el padre en i / 2.",
    "void subirMitad(vector<int> &a, int i) {",
    "  while (i > 0 && a[i / 2] < a[i]) {",
    "    int aux = a[i];",
    "    a[i] = a[i / 2];",
    "    a[i / 2] = aux;",
    "    i = i / 2;",
    "  }",
    "}"
  ];

  var P = [90, 70, 85, 40, 65, 80, 20, 10];
  var W = [60, 48, 55, 31, 40, 20, 52, 12];
  var K = 50;
  var HUECO = [88, 61, 79, 50, 57, 72, 66, 23];

  /* La última clave a la raíz y bajarPrimero(a, 0). */
  function conPrimero(a) {
    var b = a.slice();
    b[0] = b[b.length - 1];
    b.pop();
    return M.bajarPrimero(b, 0);
  }

  /* La clave en la casilla n y subirMitad(a, n). */
  function conMitad(a, k) {
    var b = a.concat([k]);
    return M.subirMitad(b, b.length - 1);
  }

  /* Extraer subiendo hijos: el mayor hijo ocupa el lugar vacío, y así
     hasta una hoja, que queda vacía. */
  function extraerSubiendo(a) {
    var b = a.slice();
    var n = b.length;
    var i = 0;
    while (2 * i + 1 < n) {
      var j = 2 * i + 1;
      if (j + 1 < n && b[j + 1] > b[j]) { j = j + 1; }
      b[i] = b[j];
      i = j;
    }
    b[i] = null;
    return b;
  }

  function spec() {
    var r1 = conPrimero(P);
    var bien1 = M.extraer(P).a;
    var r2 = conMitad(W, K);
    var bien2 = M.insertar(W, K).a;
    var r3 = extraerSubiendo(HUECO);
    var m3 = {};
    m3[r3.indexOf(null)] = "roto";
    return {
      contenedor: "tarjetas",
      cierre: "<p>Al bajar, la clave se cambia con el mayor de sus dos hijos, porque el que sube queda como padre del otro. Al subir, el padre de i es (i − 1) / 2 con la raíz en 0; i / 2 es la fórmula con la raíz en 1 y solo coincide cuando i es impar. Y al extraer, la casilla que desaparece tiene que ser la última: cualquier otra deja un hueco y el árbol deja de ser completo.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "El primer hijo mayor",
          html: "<p>Esta versión de <code>bajar</code> se intercambia con el primer hijo que encuentra mayor que la clave, no con el mayor de los dos:</p>" + M.codigo(PRIMERO) +
                "<p>Se extrae el máximo de este montículo: el " + P[P.length - 1] + " pasa a la raíz y se llama <code>bajarPrimero(a, 0)</code>.</p>" + M.vista(P, {}) +
                "<p>¿Cómo queda el arreglo? ¿Cuál es la primera casilla con una clave mayor que la de su padre?</p>",
          campos: [
            { rotulo: "arreglo:", esperado: M.texto(r1), ancho: "14rem" },
            { rotulo: "casilla:", esperado: String(M.primeraRota(r1)), ancho: "3rem" }
          ],
          bien: "Correcto. En la raíz el 70 es mayor que el 10 y sube sin que nadie mire al 85. El 85 queda como hijo del 70.",
          distractores: [
            { valores: [M.texto(bien1), null], msg: "Ese es el resultado correcto, con el 85 arriba. El código revisa primero el izquierdo y, si es mayor que la clave, ya no mira el derecho." },
            { valores: [null, "1"], msg: "El 40 de la casilla 1 es menor que el 70 de la raíz: esa pareja cumple." }
          ],
          otro: "Siga el código: en cada nivel, ¿el izquierdo es mayor que la clave? Si lo es, se intercambia con él." },
        { tipo: "opciones", titulo: "Cuándo acierta", columna: true, correcta: "mayor",
          html: "<p>Hay montículos donde <code>bajarPrimero</code> deja el mismo arreglo que <code>bajar</code>. ¿En qué caso da lo mismo en un nivel?</p>",
          opciones: [
            { op: "hoja", texto: "Solo cuando la clave ya está en una hoja.", msg: "En una hoja las dos se detienen, pero también coinciden en cualquier nivel donde el izquierdo sea el mayor." }
          ,
            { op: "mayor", texto: "Cuando el izquierdo es mayor o igual que el derecho, o cuando el izquierdo no es mayor que la clave.", msg: "Correcto. En el primer caso el primero mayor es también el mayor; en el segundo, el código pasa al derecho, que es lo que haría bajar." },
            { op: "nunca", texto: "Nunca: siempre deja un arreglo distinto.", msg: "Si el izquierdo es el mayor de los dos, las dos versiones hacen lo mismo. El error aparece solo cuando el derecho es más grande." }] },
        { tipo: "respuesta", titulo: "El padre en i / 2",
          html: "<p>Esta versión de <code>subir</code> usa la fórmula del padre con la raíz en la casilla 1:</p>" + M.codigo(MITAD) +
                "<p>Al montículo</p>" + M.cajas(W, {}) + "<p>llega el " + K + ": se pone en a[" + W.length + "] y se llama <code>subirMitad(a, " + W.length + ")</code>. ¿Cómo queda el arreglo? ¿Cuál es la primera casilla con una clave mayor que la de su padre?</p>",
          campos: [
            { rotulo: "arreglo:", esperado: M.texto(r2), ancho: "16rem" },
            { rotulo: "casilla:", esperado: String(M.primeraRota(r2)), ancho: "3rem" }
          ],
          bien: "Correcto. 8 / 2 = 4, así que el 50 se compara con el 40 de a[4], que no es su padre, y se cambia con él. Desde a[4] mira a[2], el 55, y se detiene. El 50 queda bajo el 48 y el 40 bajo el 31.",
          distractores: [
            { valores: [M.texto(bien2), null], msg: "Ese es el resultado con (i − 1) / 2: el 50 sube por su padre de verdad, el 31 de a[3]. Con i / 2 el primer padre es a[4]." },
            { valores: [null, "8"], msg: "La casilla 8 también falla, porque el 40 quedó bajo el 31, pero antes está la 4: el 50 bajo el 48." }
          ],
          otro: "Calcule i / 2 en cada vuelta: 8, luego 4, luego 2." },
        { tipo: "opciones", titulo: "Por qué a veces pasa", columna: true, correcta: "impar",
          html: "<p>Si la clave nueva hubiera entrado en a[7], <code>subirMitad</code> habría empezado bien. ¿Por qué?</p>",
          opciones: [
            { op: "arriba", texto: "Porque la casilla 7 está más arriba en el árbol.", msg: "La casilla 7 está en el mismo nivel que la 8. Lo que cambia es la paridad del índice." },
            { op: "suerte", texto: "Por las claves: con otras claves fallaría.", msg: "No depende de las claves sino del índice: para i = 7 las dos fórmulas dan la casilla 3." }
          ,
            { op: "impar", texto: "Para i impar, i / 2 y (i − 1) / 2 dan lo mismo con división entera.", msg: "Correcto. 7 / 2 = 3 y 6 / 2 = 3. Para i par difieren en uno: 8 / 2 = 4 pero (8 − 1) / 2 = 3. Una prueba con pocas claves puede no notarlo." }] },
        { tipo: "opciones", titulo: "Extraer subiendo hijos", columna: true, correcta: "forma",
          html: "<p>Otra idea para extraer: se quita la raíz, el mayor de sus hijos sube a ocupar el lugar vacío, después el mayor de los hijos de ese lugar, y así hasta una hoja, que queda vacía. Con</p>" + M.cajas(HUECO, {}) +
                "<p>queda esto:</p>" + M.vista(r3, m3) + "<p>¿Qué se rompe?</p>",
          opciones: [
            { op: "forma", texto: "La forma: queda un hueco en medio y el árbol deja de ser completo.", msg: "Correcto. El hueco quedó en a[5] y siguen ocupadas a[6] y a[7]. Por eso se quita la última casilla y es su clave la que baja desde la raíz." },
            { op: "orden", texto: "El orden: algún hijo queda mayor que su padre.", msg: "Cada clave que sube era la mayor de sus hermanas y menor que la que se fue: el orden se mantiene. Lo que falla es otra cosa." },
            { op: "nada", texto: "Nada: es otra forma correcta de extraer.", msg: "Mire el arreglo: la casilla vacía no es la última. Un arreglo con huecos ya no se recorre con 2i + 1 y 2i + 2 como un árbol completo." }
          ] }
      ]
    };
  }

  return { PRIMERO: PRIMERO, MITAD: MITAD, P: P, W: W, K: K, HUECO: HUECO, conPrimero: conPrimero, conMitad: conMitad, extraerSubiendo: extraerSubiendo, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
