/* Ejercicio interactivo: qué estructura elegir según las operaciones que pide
   el problema, en C++ y en Python. Los costos son los de la documentación de
   Python (Time complexity of operations on built-in types, collections y
   heapq) y los de CLRS, 4.ª ed. */
var EJERCICIO = (function () {
  function spec() {
    return {
      contenedor: "tarjetas",
      cierre: "<p>Se elige por las operaciones que el problema repite. Por posición, <code>list</code> o <code>vector</code>. El último que entró, una pila: <code>list</code> con <code>append</code> y <code>pop</code>. El primero que entró, una cola: <code>deque</code>. Buscar por clave, <code>dict</code> o <code>set</code>, y si además hace falta el orden de clave a cada rato, <code>map</code> o <code>set</code> de C++. Siempre el mayor o el menor, un montículo: <code>heapq</code> o <code>priority_queue</code>.</p>",
      cartas: [
        { tipo: "opciones", titulo: "Las últimas diez lecturas", columna: true, correcta: "deque",
          html: "<p>Un sensor manda una temperatura por segundo, y el programa guarda solo las diez más recientes: cuando llega una nueva, sale la más vieja.</p>",
          opciones: [
            { op: "listcero", texto: "<code>list</code>, con <code>append</code> y <code>pop(0)</code>", msg: "Funciona, pero pop(0) corre las nueve que quedan. Con diez casillas no es grave; la estructura que hace las dos cosas sin correr nada es otra." },
            { op: "deque", texto: "<code>deque</code>, con <code>append</code> y <code>popleft</code>", msg: "Correcto. Entra por la derecha y sale la más vieja por la izquierda, las dos en Θ(1): es una cola." },
            { op: "heap", texto: "<code>heapq</code>", msg: "El montículo saca la menor temperatura, no la más vieja." },
            { op: "set", texto: "<code>set</code>", msg: "Un set pierde el orden de llegada y descarta dos lecturas iguales." }
          ] },
        { tipo: "opciones", titulo: "Urgencias", columna: true, correcta: "heap",
          html: "<p>En urgencias llegan pacientes con una gravedad de 1 a 5, y siempre se atiende al más grave; entre dos igual de graves, al que llegó primero.</p>",
          opciones: [
            { op: "deque", texto: "<code>deque</code> en orden de llegada", msg: "La cola atiende por llegada, no por gravedad: un paciente grave esperaría detrás de todos." },
            { op: "heap", texto: "<code>heapq</code> con tuplas <code>(-gravedad, llegada, nombre)</code>", msg: "Correcto. Sale la tupla menor: la gravedad negada más pequeña es la más grave, y el número de llegada desempata. Cada operación cuesta O(log n)." },
            { op: "sort", texto: "Una <code>list</code> que se ordena con <code>sort</code> cada vez que llega alguien", msg: "Da el orden correcto, pero cada llegada cuesta O(n log n) en lugar de O(log n)." },
            { op: "dict", texto: "Un <code>dict</code> de gravedad a nombre", msg: "Dos pacientes con la misma gravedad se pisarían: el dict guarda un solo valor por clave." }
          ] },
        { tipo: "opciones", titulo: "¿Ya está inscrito?", columna: true, correcta: "set",
          html: "<p>Una universidad tiene 50 000 códigos de estudiantes inscritos, y una aplicación pregunta millones de veces si un código está entre ellos.</p>",
          opciones: [
            { op: "list", texto: "<code>list</code> con <code>codigo in inscritos</code>", msg: "Cada pregunta compara de uno en uno: O(n) por consulta, 50 000 comparaciones en el peor caso." },
            { op: "set", texto: "<code>set</code> con <code>codigo in inscritos</code>", msg: "Correcto. Cada pregunta cuesta O(1) en promedio: calcula la casilla y prueba pocas." },
            { op: "heap", texto: "<code>heapq</code>", msg: "El montículo solo responde rápido por el menor. Para buscar cualquier código hay que recorrerlo." }
          ] },
        { tipo: "opciones", titulo: "Paréntesis que cierran", columna: true, correcta: "pila",
          html: "<p>Un programa revisa si en <code>{[()()]}</code> cada símbolo que cierra corresponde al último que quedó abierto.</p>",
          opciones: [
            { op: "pila", texto: "<code>list</code> como pila: <code>append</code> al abrir, <code>pop()</code> al cerrar", msg: "Correcto. El que cierra se compara con el último que abrió: el tope. Las dos operaciones cuestan Θ(1), amortizado al apilar." },
            { op: "cola", texto: "<code>deque</code> como cola: <code>append</code> al abrir, <code>popleft</code> al cerrar", msg: "La cola entrega el primero que abrió. En {[( el paréntesis que cierra corresponde al (, el último." },
            { op: "set", texto: "<code>set</code> de los que están abiertos", msg: "El set pierde el orden y no guarda dos ( abiertos a la vez." }
          ] },
        { tipo: "opciones", titulo: "Un traductor", columna: true, correcta: "dict",
          html: "<p>Un traductor guarda unas 20 000 palabras con su traducción. Se consulta todo el tiempo, y una vez al final del día se imprime la lista completa en orden alfabético.</p>",
          opciones: [
            { op: "dict", texto: "<code>dict</code>, y <code>sorted</code> una vez al imprimir", msg: "Correcto. Cada consulta cuesta O(1) en promedio, y el orden se paga una sola vez: Θ(n log n) al final del día." },
            { op: "lista", texto: "<code>list</code> de parejas ordenada por palabra", msg: "Ordenada permite búsqueda binaria en O(log n), pero cada palabra nueva corre casillas: O(n) por inserción." },
            { op: "deque", texto: "<code>deque</code> de parejas", msg: "Buscar una palabra recorre el deque: O(n) por consulta." }
          ] },
        { tipo: "opciones", titulo: "La nota del puesto i", columna: true, correcta: "list",
          html: "<p>Las notas de un curso se guardan en el orden de la lista de clase, y el programa consulta y corrige muchas veces la nota del estudiante en la posición i.</p>",
          opciones: [
            { op: "nodos", texto: "Una lista sobre nodos", msg: "obtener(i) camina i nodos desde la cabeza: O(i) por consulta." },
            { op: "list", texto: "<code>list</code>", msg: "Correcto. notas[i] y notas[i] = x calculan la dirección de la casilla: Θ(1)." },
            { op: "deque", texto: "<code>deque</code>", msg: "El deque es Θ(1) solo en los extremos; en el medio, O(n)." }
          ] },
        { tipo: "tabla", titulo: "Lo que pide el problema",
          html: "<p>Piense la estructura de cada fila antes de mostrarla.</p>",
          cabecera: ["El problema repite", "C++", "Python", "Costo"],
          filas: [
            ["acceso por posición", "vector", "list", "Θ(1)"],
            ["sacar el último que entró", "stack", "list: append y pop", "Θ(1), amortizado al entrar"],
            ["sacar el primero que entró", "queue, deque", "deque: append y popleft", "Θ(1)"],
            ["buscar por clave", "unordered_map", "dict, set", "O(1) en promedio"],
            ["buscar por clave y recorrer en orden", "map, set", "dict y sorted al recorrer", "O(log n) en C++; Θ(n log n) por cada orden en Python"],
            ["sacar siempre el mayor o el menor", "priority_queue", "heapq", "O(log n)"]
          ],
          nota: "La biblioteca estándar de Python no trae un árbol binario de búsqueda balanceado: el orden de clave sale de sorted." }
      ]
    };
  }

  return { spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
