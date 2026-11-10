/* Ejercicio interactivo: rotar a la derecha en la raiz y a la izquierda en
   un nodo interno; que enlaces cambian y que se conserva. */
var EJERCICIO = (function () {
  var A = typeof module !== "undefined" ? require("./arbol-rn.js") : ArbolRN;
  var CLAVES_1 = [64, 32, 80, 16, 8, 48];
  var CLAVES_2 = [45, 20, 70, 60, 80, 75, 90];

  /* Arma el ABB, rota en la clave dada y devuelve antes y despues. */
  function rotar(claves, k, lado) {
    var T = { raiz: A.enlazarPadres(A.armarABB(claves), null) };
    var antes = A.clonar(T.raiz);
    var x = A.buscarNodo(T.raiz, k);
    var sube = lado === "der" ? x.izq : x.der;
    var beta = lado === "der" ? sube.der : sube.izq;
    if (lado === "der") { A.rotarDer(T, x); } else { A.rotarIzq(T, x); }
    return {
      antes: antes, despues: A.clonar(T.raiz), sube: sube.dato,
      beta: beta === null ? null : beta.dato,
      padreBeta: beta === null ? null : beta.padre.dato,
      padreSube: sube.padre === null ? null : sube.padre.dato
    };
  }

  function spec() {
    var r1 = rotar(CLAVES_1, 64, "der");
    var r2 = rotar(CLAVES_2, 70, "izq");
    var pre1 = A.preorden(r1.despues).join(" ");
    var pre2 = A.preorden(r2.despues).join(" ");
    var in1 = A.inorden(r1.despues).join(" ");
    return {
      contenedor: "tarjetas",
      cierre: "<p>Rotar sube un hijo y baja a su padre cambiando tres enlaces: el hijo que se lleva el nodo que baja, el hijo del que sube y el enlace que llegaba desde arriba, sea el padre o la raíz. El subárbol del medio cambia de padre y no de lugar en el orden. Por eso el inorden se conserva y la rotación cuesta O(1), sin importar cuántos nodos cuelguen de ella.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Rotar a la derecha en la raíz",
          html: "<p>El ABB que dejan las claves " + CLAVES_1.join(" ") + ":</p>" + A.svg(r1.antes, { escala: 0.85 }) +
                "<p>Se rota a la derecha en el 64. ¿Quién queda en la raíz? ¿De quién es hijo el 48 al final? ¿Cuál es el preorden del árbol que queda?</p>",
          campos: [
            { rotulo: "raíz:", esperado: String(r1.sube), ancho: "3rem" },
            { rotulo: "padre del 48:", esperado: String(r1.padreBeta), ancho: "3rem" },
            { rotulo: "preorden:", esperado: pre1, ancho: "12rem" }
          ],
          bien: "Correcto. El 32 sube y el 64 baja a su derecha. El 48 era el hijo derecho del 32, y como el 32 ahora ocupa ese lugar con el 64, el 48 pasa a ser hijo izquierdo del 64: es mayor que 32 y menor que 64.",
          distractores: [
            { valores: [null, "32", null], msg: "El 32 ya no tiene dónde guardar al 48: su hijo derecho pasa a ser el 64. El 48 se va con el 64, a su izquierda." },
            { valores: [null, null, "32 16 8 64 80 48"], msg: "El 48 no puede ir a la derecha del 64: es menor. Va a su izquierda, y el 80 se queda a la derecha." },
            { valores: [null, null, "32 16 8 48 64 80"], msg: "Ese preorden deja al 48 colgando del 32, pero el hijo derecho del 32 ahora es el 64." }
          ],
          otro: "Haga la rotación en papel: el 32 sube, el 64 baja a su derecha y el 48 cambia de padre." },
        { tipo: "opciones", titulo: "Los enlaces que cambian", columna: true, correcta: "tres",
          html: "<p>En esa rotación, ¿qué enlaces cambian?</p>",
          opciones: [
            { op: "todos", texto: "Todos los enlaces del lado izquierdo, porque el 16 y el 8 suben un nivel.", msg: "El 16 y el 8 suben de nivel, pero siguen colgando del mismo padre: sus enlaces no se tocan." },
            { op: "cuatro", texto: "Los tres anteriores y el hijo derecho del 64, que deja de ser el 80.", msg: "El 80 se queda donde estaba: sigue siendo el hijo derecho del 64." }
          ,
            { op: "tres", texto: "El hijo izquierdo del 64 pasa a ser el 48, el hijo derecho del 32 pasa a ser el 64 y la raíz apunta al 32.", msg: "Correcto. Son tres enlaces; el 16, el 8 y el 80 siguen colgando de quien colgaban." },
            { op: "dos", texto: "El hijo derecho del 32 pasa a ser el 64 y la raíz apunta al 32.", msg: "Falta uno: si el 64 sigue apuntando al 32 como hijo izquierdo, queda un ciclo y el 48 se pierde. El hijo izquierdo del 64 pasa a ser el 48." }] },
        { tipo: "respuesta", titulo: "Lo que se conserva",
          html: "<p>¿Cuál es el inorden del árbol después de rotar? ¿Qué altura tenía antes y qué altura tiene después?</p>",
          campos: [
            { rotulo: "inorden:", esperado: in1, ancho: "12rem" },
            { rotulo: "altura antes:", esperado: String(A.altura(r1.antes)), ancho: "3rem" },
            { rotulo: "después:", esperado: String(A.altura(r1.despues)), ancho: "3rem" }
          ],
          bien: "Correcto. El inorden es el mismo de antes, 8 16 32 48 64 80: la rotación nunca cambia el orden. El lado del 8 subió un nivel y la altura bajó de 3 a 2.",
          distractores: [
            { valores: [pre1, null, null], msg: "Ese es el preorden. El inorden sale ordenado en cualquier ABB, y la rotación deja un ABB." }
          ],
          otro: "Recorra izquierda, nodo, derecha. La altura cuenta aristas del camino más largo." },
        { tipo: "respuesta", titulo: "Rotar a la izquierda en un nodo interno",
          html: "<p>Ahora el ABB de " + CLAVES_2.join(" ") + ":</p>" + A.svg(r2.antes, { escala: 0.85 }) +
                "<p>Se rota a la izquierda en el 70, que no es la raíz. ¿Quién queda como hijo derecho del 45? ¿De quién es hijo el 75 al final? ¿Qué preorden queda?</p>",
          campos: [
            { rotulo: "hijo derecho del 45:", esperado: String(r2.padreSube), ancho: "3rem" },
            { rotulo: "padre del 75:", esperado: String(r2.padreBeta), ancho: "3rem" },
            { rotulo: "preorden:", esperado: pre2, ancho: "12rem" }
          ],
          bien: "Correcto. El 80 sube al lugar del 70, así que el enlace que cambia arriba es el hijo derecho del 45, no la raíz. El 75 era el hijo izquierdo del 80 y pasa a ser hijo derecho del 70.",
          distractores: [
            { valores: ["70", null, null], msg: "Si el 45 siguiera apuntando al 70, el 80 quedaría fuera del árbol. El tercer enlace es el del padre del 70." },
            { valores: [null, "80", null], msg: "El hijo izquierdo del 80 ahora es el 70. El 75 se va con el 70, a su derecha." }
          ],
          otro: "La rotación es la misma de la raíz; cambia que el tercer enlace es el del padre, el 45." },
        { tipo: "pasos", titulo: "Antes y después",
          pasos: [
            { texto: "rotar a la derecha en el 64", html: A.fila([{ svg: A.svg(r1.antes, { marcas: { 64: "resal", 32: "resal" }, escala: 0.8 }), pie: "antes" }, { svg: A.svg(r1.despues, { marcas: { 64: "resal", 32: "resal" }, aristas: { 48: "nueva" }, escala: 0.8 }), pie: "después" }]) },
            { texto: "rotar a la izquierda en el 70", html: A.fila([{ svg: A.svg(r2.antes, { marcas: { 70: "resal", 80: "resal" }, escala: 0.8 }), pie: "antes" }, { svg: A.svg(r2.despues, { marcas: { 70: "resal", 80: "resal" }, aristas: { 75: "nueva" }, escala: 0.8 }), pie: "después" }]) }
          ] },
        { tipo: "opciones", titulo: "Lo que cuesta", columna: true, correcta: "uno",
          html: "<p>Si debajo del 75 colgaran cien mil nodos, ¿cuánto costaría la misma rotación a la izquierda en el 70?</p>",
          opciones: [
            { op: "n", texto: "Θ(n): hay que mover los cien mil nodos al otro lado.", msg: "Los nodos no se copian ni se recorren: el subárbol entero cambia de padre con un puntero." },
            { op: "log", texto: "O(log n): los nodos del subárbol cambian de nivel.", msg: "Cambian de nivel, pero el nivel no se guarda en ningún lado. Nada dentro del subárbol se toca." }
          ,
            { op: "uno", texto: "O(1): siguen siendo tres enlaces.", msg: "Correcto. El subárbol del 75 se mueve entero cambiando un solo puntero, el que lo cuelga." }] }
      ]
    };
  }

  return { rotar: rotar, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
