/* Ejercicio interactivo: atender siempre al paciente más urgente, con lo
   que cuesta cada idea antes del montículo. Las salidas y las cuentas las
   calcula la simulación. */
var EJERCICIO = (function () {
  /* Cada número es la prioridad de un paciente que llega; 0 es atender. */
  var ORDENES = [6, 2, 9, 4, 9, 0, 0, 7, 0, 0];
  var N = 5000;

  function posMayor(p) {
    var m = 0;
    var i = 1;
    while (i < p.length) {
      if (p[i] > p[m]) { m = i; }
      i = i + 1;
    }
    return m;
  }

  /* Pendientes en orden de llegada; atender saca el mayor. Con sinRepetidos
     se comporta como un set: una prioridad que ya está no entra. */
  function correr(sinRepetidos) {
    var p = [];
    var imprime = [];
    var filas = [];
    ORDENES.forEach(function (o) {
      var sale = "";
      if (o === 0) {
        var m = posMayor(p);
        sale = String(p[m]);
        imprime.push(p[m]);
        p.splice(m, 1);
      } else if (!sinRepetidos || p.indexOf(o) === -1) {
        p.push(o);
      }
      filas.push([o === 0 ? "atender" : "llega " + o, p.join(" "), sale]);
    });
    var quedan = p.slice().sort(function (x, y) { return x - y; });
    return { imprime: imprime, quedan: quedan, filas: filas };
  }

  /* Comparaciones del arreglo sin orden al atender n pendientes seguidos:
     buscar el mayor entre k cuesta k - 1. */
  function compSinOrden(n) {
    var t = 0;
    var k = n;
    while (k >= 1) { t = t + (k - 1); k = k - 1; }
    return t;
  }

  /* Casillas que se corren al meter n claves en un arreglo ordenado de
     menor a mayor, si llegan crecientes o decrecientes. */
  function corrimientos(n, creciente) {
    var a = [];
    var t = 0;
    var k = 1;
    while (k <= n) {
      var x = creciente ? k : n + 1 - k;
      var pos = a.length;
      while (pos > 0 && a[pos - 1] > x) { pos = pos - 1; }
      t = t + (a.length - pos);
      a.splice(pos, 0, x);
      k = k + 1;
    }
    return t;
  }

  function spec() {
    var r = correr(false);
    var s = correr(true);
    var comp = compSinOrden(N);
    var crec = corrimientos(N, true);
    var dec = corrimientos(N, false);
    var lista = ORDENES.map(function (o) { return o === 0 ? "atender" : "llega " + o; }).join(", ");
    return {
      contenedor: "tarjetas",
      cierre: "<p>Atender al más urgente solo pregunta por el mayor, no por el orden completo. El arreglo sin orden paga Θ(n) al atender y el ordenado paga Θ(n) al llegar; el set da O(log n) en las dos pero no guarda prioridades repetidas. Un árbol completo donde cada nodo es mayor o igual que sus hijos deja el mayor en la raíz y cabe en un arreglo: es el montículo.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "La sala de urgencias",
          html: "<p>En una sala de urgencias cada paciente llega con una prioridad: entre más alta, más urgente. Cuando un médico queda libre, atiende al pendiente de prioridad más alta. Dos pacientes pueden tener la misma prioridad.</p><p>Órdenes: " + lista + ".</p><p>¿Qué prioridades se atienden, en orden? ¿Cuáles quedan pendientes, de menor a mayor?</p>",
          campos: [
            { rotulo: "se atienden:", esperado: r.imprime.join(" "), ancho: "8rem" },
            { rotulo: "quedan:", esperado: r.quedan.join(" "), ancho: "5rem" }
          ],
          bien: "Correcto. Los dos 9 son dos pacientes y se atienden los dos. El 7 llega después y pasa delante del 6. Quedan el 2 y el 4.",
          distractores: [
            { valores: [s.imprime.join(" "), null], msg: "Así atendería un set: el segundo 9 no entra porque ya hay un 9, y ese paciente nunca se atiende." },
            { valores: ["6 2 9 4", null], msg: "Eso es atender por orden de llegada, como una cola. Aquí manda la prioridad." },
            { valores: [null, "6 2"], msg: "El 6 se atiende en la última orden: después del 7 es el mayor que queda." }
          ],
          otro: "Lleve la lista de pendientes orden por orden y saque el mayor en cada atender." },
        { tipo: "tabla", titulo: "Orden por orden", cabecera: ["orden", "pendientes después", "se atiende"],
          filas: r.filas, boton: "Mostrar la orden siguiente",
          nota: "Antes de mostrar cada fila, diga cuál es el mayor de los pendientes." },
        { tipo: "respuesta", titulo: "Arreglo sin orden",
          html: "<p>Con un arreglo sin orden, llegar es agregar al final, Θ(1). Atender recorre los k pendientes buscando el mayor, con k − 1 comparaciones, y lo quita.</p><p>Si hay " + N + " pendientes y se atienden todos, uno tras otro, ¿cuántas comparaciones se hacen en total? Escriba el número sin separadores de miles.</p>",
          campos: [{ rotulo: "comparaciones:", esperado: String(comp), ancho: "8rem" }],
          bien: "Correcto. Son 4999 + 4998 + ... + 1 + 0 = 5000 · 4999 / 2. Atender todos cuesta Θ(n²).",
          distractores: [
            { valores: [String(N * N)], msg: "Cada atender recorre los que quedan, no los " + N + " del principio: la cuenta baja de uno en uno." },
            { valores: [String(N - 1)], msg: "Esas son las comparaciones del primer atender. Faltan las de los demás." }
          ],
          otro: "Sume k − 1 para k desde " + N + " hasta 1." },
        { tipo: "respuesta", titulo: "Arreglo ordenado",
          html: "<p>Con un arreglo ordenado de menor a mayor, el más urgente es el último y atender cuesta Θ(1). Al llegar, la clave nueva se pone en su lugar y los mayores que ella se corren una casilla a la derecha.</p><p>Llegan " + N + " pacientes. ¿Cuántas casillas se corren en total si llegan con prioridades 1, 2, 3, …, " + N + "? ¿Y si llegan con " + N + ", " + (N - 1) + ", …, 1?</p>",
          campos: [
            { rotulo: "crecientes:", esperado: String(crec), ancho: "8rem" },
            { rotulo: "decrecientes:", esperado: String(dec), ancho: "8rem" }
          ],
          bien: "Correcto. Si llegan crecientes, cada una es la mayor y va al final sin correr a nadie. Si llegan decrecientes, cada una es la menor y corre a todas las que ya están: el mismo total que atender con el arreglo sin orden.",
          distractores: [
            { valores: [String(dec), null], msg: "Cuando cada clave nueva es la mayor de todas, su lugar es el final: no se corre nada." },
            { valores: [null, "0"], msg: "Cada clave nueva es la menor y va en la casilla 0: todas las que ya estaban se corren." }
          ],
          otro: "Piense dónde queda cada clave nueva y cuántas hay a su derecha." },
        { tipo: "opciones", titulo: "Lo que se busca", columna: true, correcta: "arbol",
          html: "<p>Se quiere que llegar y atender cuesten O(log n) y que dos pacientes con la misma prioridad sean dos pendientes. ¿Qué cumple las dos cosas?</p>",
          opciones: [
            { op: "set", texto: "Un set&lt;int&gt;: el mayor es el anterior a end().", msg: "Llegar y atender cuestan O(log n), pero el set no guarda una prioridad repetida: el segundo 9 se pierde." },
            { op: "ordenado", texto: "El arreglo ordenado, porque atender es Θ(1).", msg: "Atender sí, pero llegar corre hasta n casillas: Θ(n)." },
            { op: "sinorden", texto: "El arreglo sin orden, porque llegar es Θ(1).", msg: "Llegar sí, pero atender recorre todos los pendientes: Θ(n)." },
            { op: "arbol", texto: "Un árbol completo en el que cada nodo es mayor o igual que sus hijos.", msg: "Correcto. El mayor queda en la raíz, los repetidos caben y, por ser completo, la altura es ⌊log₂ n⌋: es el montículo de máximos." }
          ] }
      ]
    };
  }

  return { ORDENES: ORDENES, correr: correr, compSinOrden: compSinOrden, corrimientos: corrimientos, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
