/* Ejercicio interactivo: dos clases de pedido, una fila contra dos colas.
   B nombre: llega un bloqueo; C nombre: llega una consulta; A: se atiende. */
var EJERCICIO = (function () {
  var ORDENES = ["C Sol", "B Tom", "C Ivan", "A", "B Uma", "A", "A", "C Rita", "A", "A", "A"];
  var LARGO = 30000;   // consultas esperando antes del bloqueo

  /* Una sola fila: atender busca el primer bloqueo; cuenta las revisiones del ciclo. */
  function unaFila(ordenes) {
    var fila = [];
    var salida = [];
    var revisados = 0;
    ordenes.forEach(function (o) {
      var p = o.split(" ");
      if (p[0] !== "A") {
        fila.push({ tipo: p[0], nombre: p[1] });
      } else if (fila.length === 0) {
        salida.push("nadie");
      } else {
        var k = 0;
        var parar = false;
        while (k < fila.length && !parar) {
          revisados = revisados + 1;
          if (fila[k].tipo === "B") { parar = true; } else { k = k + 1; }
        }
        if (k === fila.length) { k = 0; }
        salida.push(fila[k].nombre);
        fila.splice(k, 1);
      }
    });
    return { salida: salida, revisados: revisados };
  }

  /* Dos colas: cada orden en O(1). Guarda el estado tras cada orden. */
  function dosColas(ordenes) {
    var bloqueos = [];
    var consultas = [];
    var filas = [];
    var salida = [];
    ordenes.forEach(function (o) {
      var p = o.split(" ");
      var imprime = "";
      if (p[0] === "B") {
        bloqueos.push(p[1]);
      } else if (p[0] === "C") {
        consultas.push(p[1]);
      } else if (bloqueos.length > 0) {
        imprime = bloqueos.shift();
      } else if (consultas.length > 0) {
        imprime = consultas.shift();
      } else {
        imprime = "nadie";
      }
      if (imprime !== "") { salida.push(imprime); }
      filas.push([o, bloqueos.join(", "), consultas.join(", "), imprime === "" ? "" : (imprime === "nadie" ? "nadie" : "atiende " + imprime)]);
    });
    return { salida: salida, filas: filas };
  }

  /* LARGO consultas, un bloqueo y un A. */
  function ordenesLargas() {
    var o = [];
    var i = 0;
    while (i < LARGO) { o.push("C c" + i); i = i + 1; }
    o.push("B ultimo");
    o.push("A");
    return o;
  }

  function miles(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }

  function spec() {
    var D = dosColas(ORDENES);
    var U = unaFila(ORDENES);
    var L = unaFila(ordenesLargas());
    var esperada = D.salida.join(" ").toLowerCase();
    return {
      contenedor: "tarjetas",
      cierre: "Entre clases manda la clase, y dentro de cada una el orden de llegada. La fila única guarda un orden que el problema no usa, el de todos juntos, y lo paga buscando: hasta n revisiones por atención. Con una cola por clase el que sigue está siempre en un frente, y cada orden cuesta O(1). La memoria es la misma, Θ(n), repartida en dos colas.",
      cartas: [
        { tipo: "respuesta", titulo: "Lo que se imprime",
          html: "<pre class=\"fragmento\">" + ORDENES.join("\n") + "</pre><p>Escriba los seis nombres que se imprimen, en orden, separados por espacios. Si en una atención no hay nadie, escriba <code>nadie</code>.</p>",
          campos: [{ rotulo: "", esperado: esperada, pista: "tom ...", ancho: "18rem" }],
          bien: "Correcto: " + D.salida.join(", ") + ". Uma llega después que Sol e Ivan, pero es un bloqueo y pasa delante de las dos consultas.",
          distractores: [
            { valores: ["tom sol ivan uma rita nadie"], msg: "Cuando se atiende por segunda vez ya llegó Uma, que es un bloqueo: va antes que Sol." },
            { valores: ["sol tom ivan uma rita nadie"], msg: "Ese es el orden de llegada. Los bloqueos pasan primero." }
          ],
          otro: "Lleve dos filas a mano, una por clase, y en cada A mire primero la de bloqueos." },
        { tipo: "tabla", titulo: "Paso a paso con dos colas",
          cabecera: ["Orden", "bloqueos", "consultas", "Imprime"],
          filas: D.filas,
          nota: "Cada fila es una orden de O(1): un <code>push</code> a la cola de su clase, o un <code>front</code> y un <code>pop</code>." },
        { tipo: "respuesta", titulo: "Lo que revisa la fila única",
          html: "<p>Con una sola fila, atender recorre desde el frente hasta el primer bloqueo:</p><pre class=\"fragmento\">while (it != fila.end() &amp;&amp; it-&gt;tipo != 'B') {\n  ++it;\n}</pre><p>En la fila esperan " + miles(LARGO) + " consultas y, detrás de todas, un bloqueo. Llega una <code>A</code>. ¿Cuántas veces se evalúa <code>it-&gt;tipo != 'B'</code>?</p>",
          campos: [{ rotulo: "veces:", esperado: String(L.revisados), ancho: "8rem" }],
          bien: "Correcto: " + L.revisados + ". Una por cada consulta y una más, la del bloqueo, que es la que detiene el ciclo. Con dos colas, la misma atención mira un solo frente.",
          distractores: [
            { valores: [String(LARGO)], msg: "Falta la evaluación que encuentra el bloqueo y detiene el ciclo." },
            { valores: ["1"], msg: "Eso pasa con dos colas. En la fila única el bloqueo está al final y hay que llegar hasta él." }
          ],
          otro: "Cuente las consultas que el ciclo deja atrás y la evaluación que lo detiene." },
        { tipo: "opciones", titulo: "q órdenes", columna: true, correcta: "lineal",
          html: "<p>Llegan q órdenes. ¿Cuánto cuesta procesarlas todas con dos colas?</p>",
          opciones: [
            { op: "lineal", texto: "Θ(q)", msg: "Correcto. Cada orden es un push, o un front y un pop: O(1), y q de ellas suman Θ(q)." },
            { op: "cuad", texto: "O(q²)", msg: "Esa es la cota de la fila única, donde cada atención puede recorrer todo lo que espera." },
            { op: "log", texto: "Θ(q log q)", msg: "Nada se ordena: cada pedido entra a su cola en el orden en que llega, que es el orden en que sale." }
          ] },
        { tipo: "opciones", titulo: "Tres clases", columna: true, correcta: "tres",
          html: "<p>Se agregan las caídas del servicio, que pasan delante de los bloqueos. ¿Qué cambia?</p>",
          opciones: [
            { op: "tres", texto: "Una tercera cola, revisada primero; atender sigue en O(1)", msg: "Correcto. Con un número fijo de clases, atender mira a lo sumo tres frentes." },
            { op: "ordenar", texto: "Hay que ordenar la fila por clase cada vez que llega un pedido", msg: "Ordenar cuesta mucho más que repartir: cada pedido ya sabe su clase al llegar." },
            { op: "una", texto: "Se vuelve a la fila única, porque tres colas son demasiadas", msg: "La fila única paga O(n) por atención con dos clases o con tres. Las colas cuestan lo mismo en memoria." }
          ] }
      ]
    };
  }

  return { ordenes: ORDENES, largo: LARGO, unaFila: unaFila, dosColas: dosColas, ordenesLargas: ordenesLargas, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
