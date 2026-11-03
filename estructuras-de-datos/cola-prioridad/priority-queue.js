/* Ejercicio interactivo: el contenedor priority_queue. Las salidas las
   calcula cola.js, que reproduce los tres programas; cada uno se compiló con
   g++ -Wall -Wextra y la salida coincide. */
var EJERCICIO = (function () {
  var M = typeof module !== "undefined" ? require("../monticulo/monti.js") : Monti;
  var C = typeof module !== "undefined" ? require("./cola.js") : Cola;

  function spec() {
    var e = C.enteros();
    var menor = C.conComparador(C.menorPrimero, C.DATOS_MENOR);
    var mayor = C.conComparador(C.mayorPrimero, C.DATOS_MENOR);
    var ll = C.llamadas();
    var llAlReves = C.llamadas(function (a, b) {
      return a.prioridad !== b.prioridad ? a.prioridad < b.prioridad : a.turno < b.turno;
    });
    var llMenor = C.llamadas(function (a, b) {
      return a.prioridad !== b.prioridad ? a.prioridad > b.prioridad : a.turno > b.turno;
    });
    return {
      contenedor: "tarjetas",
      cierre: "<p><code>priority_queue</code> es un montículo sobre un <code>vector</code>: <code>push</code> y <code>pop</code> cuestan O(log n), <code>top</code> O(1). Por omisión sale el mayor según <code>&lt;</code>; para otro orden se le da un comparador, que dice cuándo una clave va <em>detrás</em> de otra, y por eso <code>a &gt; b</code> deja el menor arriba. Con registros, el <code>operator&lt;</code> decide la prioridad, y si deja empates el orden en que salen los iguales lo decide la biblioteca, no el programa. <code>pop</code> no devuelve nada, y no hay forma de recorrer la cola sin vaciarla.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Lo que imprime",
          html: M.codigo(C.codigo("enteros")) + "<p>Escriba las tres líneas que imprime el programa.</p>",
          campos: [
            { rotulo: "línea 1:", esperado: e[0], ancho: "4rem" },
            { rotulo: "línea 2:", esperado: e[1], ancho: "5rem" },
            { rotulo: "línea 3:", esperado: e[2], ancho: "9rem" }
          ],
          bien: "Correcto. top() es el 41 y el primer pop lo saca. Entran el 17 y el 35, y el segundo pop saca el 35, que es el mayor en ese momento: quedan 23, 17 y 8.",
          distractores: [
            { valores: [null, "35 4", null], msg: "Hay un segundo pop() justo después de los dos push: el 35 sale antes de imprimir la línea 2." },
            { valores: [null, "23 4", null], msg: "El primer elemento está bien; revise el tamaño. Entraron cinco y salieron dos." },
            { valores: [null, "17 3", null], msg: "pop() no saca el último que entró: saca el mayor, que en ese momento era el 35." },
            { valores: [null, null, "8 17 23"], msg: "La cola entrega de mayor a menor: top() es siempre el mayor de los que quedan." }
          ],
          otro: "Lleve el conjunto de claves después de cada instrucción. top() es el mayor; pop() lo quita y no devuelve nada." },
        { tipo: "opciones", titulo: "Un comparador al revés", columna: true, correcta: "menor",
          html: M.codigo(C.codigo("menor")) + "<p>¿Qué imprime?</p>",
          opciones: [
            { op: "menor", texto: "<code>" + menor.join(" ") + "</code>", msg: "Correcto. El comparador dice cuándo a va detrás de b. Con a > b, el mayor va detrás y arriba queda el menor: es un montículo de mínimos. El 19 sale dos veces, porque la cola guarda repetidos." },
            { op: "mayor", texto: "<code>" + mayor.join(" ") + "</code>", msg: "Ese es el orden de una priority_queue<int> sin comparador. Por omisión se usa a < b, y aquí se invirtió: sale primero el menor." },
            { op: "sin", texto: "<code>" + menor.filter(function (x, i) { return menor.indexOf(x) === i; }).join(" ") + "</code>", msg: "Así quedaría en un set. La priority_queue no descarta repetidos: el 19 entró dos veces y sale dos veces." },
            { op: "llegada", texto: "<code>" + C.DATOS_MENOR.join(" ") + "</code>", msg: "Ese es el orden de llegada. Una priority_queue no lo guarda; entrega según el comparador." }
          ] },
        { tipo: "respuesta", titulo: "Llamadas con la misma prioridad",
          html: M.codigo(C.codigo("llamadas")) + "<p>¿En qué orden se atienden los turnos?</p>",
          campos: [{ rotulo: "turnos:", esperado: ll.join(" "), ancho: "10rem" }],
          bien: "Correcto. Primero las de prioridad 5, los turnos 2 y 5; después la de prioridad 3, el turno 4; luego las de 2, el 1 y el 3, y al final el 6. Entre iguales sale primero el turno menor, porque para operator< el turno mayor es el menos urgente.",
          distractores: [
            { valores: [llAlReves.join(" ")], msg: "Las prioridades están bien, y los empates al revés. Con turno > o.turno, la llamada de turno mayor es la menor de las dos, y la menor sale después." },
            { valores: [llMenor.join(" ")], msg: "La priority_queue entrega primero la mayor según operator<, y aquí la mayor es la de prioridad más alta." },
            { valores: ["1 2 3 4 5 6"], msg: "Ese es el orden de llegada. La cola atiende por prioridad: el turno 2, con prioridad 5, va primero." }
          ],
          otro: "Agrupe por prioridad, de la 5 a la 1, y dentro de cada grupo ordene los turnos de menor a mayor." },
        { tipo: "opciones", titulo: "Lo que no se puede", columna: true, correcta: "recorrer",
          html: "<p>De estas cuatro tareas, ¿cuál no se puede hacer con una <code>priority_queue</code> sin vaciarla ni copiarla?</p>",
          opciones: [
            { op: "tamano", texto: "Saber cuántas claves tiene.", msg: "Eso sí: size() lo da en O(1)." },
            { op: "consultar", texto: "Ver la clave de mayor prioridad sin quitarla.", msg: "Eso sí: top() la devuelve sin sacarla." },
            { op: "recorrer", texto: "Imprimir todas las claves en orden.", msg: "Correcto. priority_queue no tiene iteradores: solo deja ver top(). Para imprimir todo en orden hay que sacar las claves con pop() o trabajar sobre una copia. Si hace falta recorrer en orden y las claves no se repiten, el contenedor es un set." },
            { op: "repetidas", texto: "Guardar dos veces la misma clave.", msg: "Eso sí: la priority_queue guarda repetidos, como mostró el 19 de la tarjeta anterior." }
          ] },
        { tipo: "opciones", titulo: "Sacar y quedarse con la clave", columna: true, correcta: "dos",
          html: "<p>Alguien escribe:</p>" + M.codigo(["int x = pq.pop();", "printf(\"%d\\n\", x);"]) + "<p>¿Qué pasa?</p>",
          opciones: [
            { op: "imprime", texto: "Imprime la clave que salió.", msg: "pop() no devuelve la clave: su tipo de retorno es void. El compilador rechaza la primera línea." },
            { op: "dos", texto: "No compila: pop() no devuelve nada. Se lee con top() y después se saca con pop().", msg: "Correcto. Son dos pasos: int x = pq.top(); y luego pq.pop();. Separarlos deja consultar sin sacar, y no cuesta nada de más." },
            { op: "cero", texto: "Compila y x queda en 0.", msg: "No llega a compilar: no se puede asignar a un int lo que devuelve una función void." }
          ] }
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
