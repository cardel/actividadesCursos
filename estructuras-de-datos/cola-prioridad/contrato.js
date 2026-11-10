/* Ejercicio interactivo: el TAD cola de prioridad. La traza de operaciones
   la calcula el montículo de monti.js, que es la implementación de
   monticulo.h; el contrato no depende de ella. */
var EJERCICIO = (function () {
  var M = typeof module !== "undefined" ? require("../monticulo/monti.js") : Monti;

  /* Una secuencia de operaciones; las que devuelven algo van a la salida. */
  var OPERACIONES = [
    ["insertar", 30], ["insertar", 12], ["insertar", 45], ["extraerMax"],
    ["insertar", 28], ["maximo"], ["extraerMax"], ["insertar", 50],
    ["extraerMax"], ["tamano"]
  ];

  function correr(ops) {
    var a = [];
    var salida = [];
    ops.forEach(function (o) {
      if (o[0] === "insertar") {
        a = M.insertar(a, o[1]).a;
      } else if (o[0] === "extraerMax") {
        var r = M.extraer(a);
        salida.push(r.max);
        a = r.a;
      } else if (o[0] === "maximo") {
        salida.push(a[0]);
      } else {
        salida.push(a.length);
      }
    });
    return { salida: salida, queda: a };
  }

  function texto(ops) {
    return ops.map(function (o) { return o[0] + "(" + (o.length > 1 ? o[1] : "") + ")"; }).join("\n");
  }

  function spec() {
    var r = correr(OPERACIONES);
    return {
      contenedor: "tarjetas",
      cierre: "<p>La cola de prioridad es un TAD: promete insertar una clave, consultar la de mayor prioridad, extraerla, y decir si está vacía y cuántas tiene. No promete orden de llegada ni recorrido en orden. Extraer o consultar exige que la cola no esté vacía, y comprobarlo antes le toca a quien la usa. El montículo es la implementación que deja insertar y extraer en O(log n) y consultar en O(1); un arreglo sin orden o uno ordenado cumplen el mismo contrato, pero una de las dos operaciones les cuesta Θ(n).</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Una secuencia de operaciones",
          html: "<p>Sobre una cola de prioridad vacía, de máximos, se hace:</p><pre class=\"fragmento\">" + texto(OPERACIONES) + "</pre>" +
                "<p>Escriba, en orden y separado por espacios, lo que devuelven <code>extraerMax</code>, <code>maximo</code> y <code>tamano</code>.</p>",
          campos: [{ rotulo: "devuelven:", esperado: r.salida.join(" "), ancho: "12rem" }],
          bien: "Correcto. Sale el 45; quedan 30, 12 y 28, y el máximo es 30 sin sacarlo. Después sale el 30, entra el 50 y sale enseguida. Quedan el 12 y el 28: tamaño 2.",
          distractores: [
            { valores: ["45 30 28 50 2"], msg: "maximo() consulta sin quitar: después de él, el 30 sigue en la cola y es lo que devuelve el siguiente extraerMax." },
            { valores: ["30 30 28 50 2"], msg: "La cola no atiende por orden de llegada: el primer extraerMax devuelve el 45, que es el mayor, aunque haya entrado de tercero." },
            { valores: ["45 30 30 50 3"], msg: "Cuente lo que queda al final: entraron cinco claves y salieron tres. maximo() no saca ninguna." }
          ],
          otro: "Lleve el conjunto de claves que hay en la cola después de cada operación; el orden en que entraron no importa." },
        { tipo: "opciones", titulo: "Extraer de una cola vacía", columna: true, correcta: "cliente",
          html: "<p>El contrato de <code>extraerMax</code> dice: <em>precondición: la cola no está vacía</em>. En <code>monticulo.h</code> eso se revisa con <code>assert(!a.empty())</code>. Un programa llama <code>extraerMax()</code> sobre una cola vacía. ¿Qué dice el contrato de esa situación?</p>",
          opciones: [
            { op: "cliente", texto: "Que el error es de quien llamó: debía preguntar vacio() antes, y el TAD no promete nada.", msg: "Correcto. Una precondición la cumple el cliente. El assert la hace visible mientras se depura: el programa se detiene en la línea del error en vez de seguir con un dato inventado." },
            { op: "ignora", texto: "Que la operación no hace nada y el programa sigue.", msg: "Seguir como si nada esconde el error: el programa usaría un valor que nunca salió de la cola. El contrato no promete eso, y el assert de monticulo.h lo impide." }
          ,
            { op: "cero", texto: "Que extraerMax debe devolver 0 para avisar que no había nada.", msg: "El 0 puede ser una clave legítima de la cola: quien recibe un 0 no sabría si salió un 0 o si no había nada. Por eso el contrato no promete ningún valor en ese caso." }] },
        { tipo: "opciones", titulo: "Eventos que llegan desordenados", columna: true, correcta: "minimos",
          html: "<p>Un simulador de una red procesa eventos: cada uno tiene la hora en que ocurre, y al procesar uno se generan otros para más adelante, en cualquier orden. Siempre hay que procesar el evento de hora más temprana. ¿Qué TAD guarda los pendientes?</p>",
          opciones: [
            { op: "maximos", texto: "Una cola de prioridad de máximos sobre la hora.", msg: "Saldría primero el evento más lejano en el futuro. Aquí la clave menor es la más urgente: hace falta un montículo de mínimos." }
          ,
            { op: "cola", texto: "Una cola, porque los eventos se atienden en el orden en que se generan.", msg: "Un evento generado después puede ocurrir antes: uno que se programa para dentro de 1 ms le gana a otro que se programó antes para dentro de 10 ms. La cola los atendería al revés." },
            { op: "pila", texto: "Una pila, porque el último evento generado suele ser el más próximo.", msg: "Nada garantiza eso: los eventos se generan con horas en cualquier orden." },
            { op: "minimos", texto: "Una cola de prioridad en la que sale primero la menor hora.", msg: "Correcto. Es una cola de prioridad de mínimos: la prioridad es la hora, y la más temprana es la más urgente. Con un montículo, programar y sacar el siguiente evento cuestan O(log n)." }] },
        { tipo: "opciones", titulo: "Los cinco mayores de un millón", columna: true, correcta: "cinco",
          html: "<p>Un sensor envía un millón de lecturas, una por una, y al final hay que imprimir las cinco más altas. La memoria alcanza para unas pocas lecturas, no para el millón. ¿Qué se guarda mientras llegan?</p>",
          opciones: [
            { op: "cinco", texto: "Un montículo de mínimos con a lo sumo cinco lecturas: si llega una mayor que la raíz, la raíz sale y la nueva entra.", msg: "Correcto. La raíz es la menor de las cinco mejores hasta ahora, la única candidata a salir. Cada lectura cuesta O(log 5), y el millón cuesta O(n log k) con k = 5, guardando solo cinco claves." },
            { op: "maximos5", texto: "Un montículo de máximos con a lo sumo cinco lecturas.", msg: "La raíz sería la mayor de las cinco, y la que habría que sacar cuando llega una mejor es la menor, que está en alguna hoja. Encontrarla obliga a revisar todas." },
            { op: "set", texto: "Un set con a lo sumo cinco lecturas, quitando la menor cuando sobra una.", msg: "Casi: el set guarda las claves en orden y la menor está en begin(). Pero descarta repetidas, y si el sensor envía dos veces la misma lectura alta, una de las dos se pierde." }
          ,
            { op: "todas", texto: "Un montículo de máximos con todas las lecturas, y al final se extrae cinco veces.", msg: "Funciona si cabe, y aquí no cabe: el montículo tendría el millón de lecturas. Lo que se pide son cinco." }] }
      ]
    };
  }

  return { OPERACIONES: OPERACIONES, correr: correr, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
