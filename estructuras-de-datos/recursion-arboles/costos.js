/* Ejercicio interactivo: cuántas llamadas hace una función recursiva sobre
   un árbol, cuántos marcos apila y cuándo se acaba la pila de llamadas. */
var EJERCICIO = (function () {
  /* Llamadas de tamano, altura o cualquier recorrido: una por nodo y una
     por vacío. */
  function llamadas(n) { return 2 * n + 1; }

  /* Altura de un árbol lleno de n = 2^(h+1) − 1 nodos y de uno degenerado. */
  function alturaLleno(n) { return Math.floor(Math.log2(n)); }
  function alturaDegenerado(n) { return n - 1; }

  /* Marcos de tamano a la vez: el camino de la raíz al nodo más hondo
     (h + 1 nodos) más el vacío donde termina. */
  function marcos(h) { return h + 2; }

  var PILA = 1024 * 1024;   /* ulimit -s 1024: 1 MB */
  var MARCO = 48;           /* bytes de un marco de altura, compilado con g++ -Wall -Wextra */
  var MEDIDO_TERMINA = 21000;
  var MEDIDO_CAE = 22000;

  /* 21592 se escribe 21 592. */
  function miles(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }

  function spec() {
    var LLENO = 63;
    var hL = alturaLleno(LLENO);
    var hD = alturaDegenerado(LLENO);
    var caben = Math.floor(PILA / MARCO);
    return {
      contenedor: "tarjetas",
      cierre: "Una función que visita cada nodo y cada vacío hace 2n + 1 llamadas: Θ(n) en tiempo, cualquiera que sea la forma. El espacio aparte sí depende de la forma: la pila guarda a lo sumo h + 2 marcos, unos log₂ n en un árbol lleno y n + 1 en uno degenerado. La pila de llamadas tiene tope, y lo que la llena es la altura, no el número de nodos.",
      cartas: [
        { tipo: "respuesta", titulo: "Llamadas",
          html: "<p><code>tamano</code> se llama una vez por nodo y una vez por vacío. ¿Cuántas llamadas hace sobre un árbol de 50 nodos? ¿Y sobre uno de 1000?</p>",
          campos: [
            { rotulo: "n = 50:", esperado: String(llamadas(50)), ancho: "4rem" },
            { rotulo: "n = 1000:", esperado: String(llamadas(1000)), ancho: "4rem" }
          ],
          bien: "Correcto: n nodos más n + 1 vacíos, 2n + 1 llamadas. Duplicar los nodos duplica, más o menos, las llamadas: Θ(n).",
          distractores: [
            { valores: ["50", "1000"], msg: "Faltan las llamadas sobre los vacíos, que son n + 1 y responden sin llamar a nadie." },
            { valores: ["100", "2000"], msg: "Hay un vacío más que nodos: n + 1, no n." }
          ],
          otro: "Sume los nodos y los vacíos: con n nodos hay n + 1 vacíos." },
        { tipo: "respuesta", titulo: "Dos formas con 63 nodos",
          html: "<p>Un árbol lleno de " + LLENO + " nodos tiene completos todos sus niveles. Otro de " + LLENO + " nodos es degenerado: cada nodo es hijo derecho del anterior. ¿Qué altura tiene cada uno?</p>",
          campos: [
            { rotulo: "lleno:", esperado: String(hL), ancho: "3.5rem" },
            { rotulo: "degenerado:", esperado: String(hD), ancho: "3.5rem" }
          ],
          bien: "Correcto. Los niveles 0 a 5 del lleno tienen 1 + 2 + 4 + 8 + 16 + 32 = 63 nodos, así que h = 5 = ⌊log₂ 63⌋. El degenerado tiene un nodo por nivel: h = n − 1 = 62.",
          distractores: [
            { valores: ["6", null], msg: "Seis son los niveles del lleno, del 0 al 5. La altura cuenta aristas: 5." },
            { valores: [null, "63"], msg: "Con 63 nodos en fila hay 62 aristas." }
          ],
          otro: "En un árbol lleno el nivel k tiene 2^k nodos. En el degenerado, un nodo por nivel." },
        { tipo: "respuesta", titulo: "Marcos a la vez",
          html: "<p>¿Cuántos marcos de <code>tamano</code> llega a tener la pila de llamadas a la vez sobre cada uno de esos dos árboles?</p>",
          campos: [
            { rotulo: "lleno:", esperado: String(marcos(hL)), ancho: "3.5rem" },
            { rotulo: "degenerado:", esperado: String(marcos(hD)), ancho: "3.5rem" }
          ],
          bien: "Correcto: h + 2 en los dos, el camino de la raíz al nodo más hondo (h + 1 marcos) y el vacío donde termina. Con los mismos 63 nodos, " + marcos(hL) + " marcos contra " + marcos(hD) + ".",
          distractores: [
            { valores: [String(LLENO), String(LLENO)], msg: "Los marcos de dos hermanos nunca conviven: solo está en la pila un camino que baja desde la raíz." },
            { valores: [String(hL + 1), String(hD + 1)], msg: "Ese es el camino de nodos. Falta el marco del vacío, la última llamada antes de que empiecen a volver." }
          ],
          otro: "Siga el camino más largo desde la raíz y sume el vacío del final." },
        { tipo: "respuesta", titulo: "Una pila de 1 MB",
          html: "<p>En algunos sistemas la pila de llamadas trae 1 MB, 1 048 576 bytes (en Linux se simula con <code>ulimit -s 1024</code>). Si cada marco de <code>altura</code> ocupa 48 bytes, ¿cuántos marcos caben, redondeando hacia abajo?</p>",
          campos: [{ rotulo: "marcos:", esperado: String(caben), ancho: "6rem" }],
          bien: "Correcto: 1 048 576 / 48 ≈ " + miles(caben) + ". Medido: con ulimit -s 1024, altura sobre un árbol degenerado termina con " + miles(MEDIDO_TERMINA) + " nodos y se cae con " + miles(MEDIDO_CAE) + ". El corte exacto anda por los 21 600 y se corre unas decenas de una corrida a otra: main, la biblioteca y las variables de entorno también ocupan la pila.",
          distractores: [
            { valores: ["21845.33"], msg: "Los marcos son enteros: redondee hacia abajo." },
            { valores: ["20833"], msg: "1 MB son 1 048 576 bytes, no un millón." }
          ],
          otro: "Divida el tamaño de la pila entre el de un marco." },
        { tipo: "opciones", titulo: "¿Quién se cae?", columna: true, correcta: "degenerado",
          html: "<p>Con esa pila de 1 MB se calcula <code>altura</code> recursiva sobre un árbol degenerado de 30 000 nodos y sobre un árbol balanceado de un millón de nodos. ¿Qué pasa?</p>",
          opciones: [
            { op: "degenerado", texto: "El degenerado se cae; el balanceado termina", msg: "Correcto. El degenerado necesita 30 001 marcos y caben unos 21 mil. El balanceado tiene altura 19 y apila 21 marcos. Corrido con ulimit -s 1024: el primero sale con Segmentation fault y el segundo imprime altura = 19." },
            { op: "ambos", texto: "Se caen los dos: un millón de nodos no cabe en 1 MB", msg: "Los nodos se piden con new y no viven en la pila de llamadas. La pila solo guarda los marcos del camino actual." },
            { op: "ninguno", texto: "Ninguno se cae: 30 000 marcos de 48 bytes son menos de 1 MB", msg: "30 000 · 48 = 1 440 000 bytes, más que 1 048 576." }
          ] }
      ]
    };
  }

  return { llamadas: llamadas, alturaLleno: alturaLleno, alturaDegenerado: alturaDegenerado, marcos: marcos,
           caben: Math.floor(PILA / MARCO), medido: [MEDIDO_TERMINA, MEDIDO_CAE], spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
