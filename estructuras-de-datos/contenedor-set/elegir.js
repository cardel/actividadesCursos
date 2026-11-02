/* Ejercicio interactivo: escoger entre set, map, unordered_map y un vector
   ordenado segun lo que se guarda y lo que se pregunta. */
var EJERCICIO = (function () {
  function carta(titulo, situacion, correcta, msgs) {
    return {
      tipo: "opciones", titulo: titulo, columna: true, correcta: correcta,
      html: "<p>" + situacion + "</p>",
      opciones: [
        { op: "set", texto: "set", msg: msgs.set },
        { op: "map", texto: "map", msg: msgs.map },
        { op: "umap", texto: "unordered_map", msg: msgs.umap },
        { op: "vector", texto: "vector, ordenado con sort al final", msg: msgs.vector }
      ]
    };
  }

  function spec() {
    return {
      contenedor: "tarjetas",
      cierre: "<p>Las preguntas que deciden son tres. ¿Hay un valor al lado de cada clave? Entonces map o unordered_map; si no, set o un vector. ¿El orden aparece en la salida o se pregunta por la siguiente clave a partir de x? Entonces un árbol: set o map. ¿Llegan todos los datos antes de la primera pregunta? Entonces un vector ordenado una sola vez también alcanza.</p>",
      cartas: [
        carta("Placas de un parqueadero",
          "Un parqueadero anota la placa de cada carro que entra durante el día. Nadie consulta nada mientras el parqueadero está abierto. Al cerrar, hay que imprimir las placas distintas en orden alfabético.",
          "vector", {
            set: "Funciona y cuesta O(n log d), pero mantiene el orden durante todo el día sin que nadie lo pida. Como todo llega antes de la única pregunta, basta ordenar una vez.",
            map: "No hay ningún valor que guardar al lado de la placa.",
            umap: "No hay valor que guardar, y además la tabla hash no da el orden alfabético: habría que copiar y ordenar al final de todas formas.",
            vector: "Correcto. Todo llega antes de la única pregunta: se agregan al final en Θ(1), y al cerrar sort y unique dejan las distintas en orden, Θ(n log n), con un solo arreglo."
          }),
        carta("Próxima cita",
          "Un consultorio agenda citas por minuto del día. Durante la jornada se agregan y se cancelan citas, y en cualquier momento la recepcionista pregunta cuál es la primera cita a partir del minuto x.",
          "set", {
            set: "Correcto. Solo hay claves, cambian todo el día y la pregunta es lower_bound(x): O(log n) cada operación.",
            map: "Funciona si cada cita lleva un dato al lado, como el paciente. Con solo los minutos, el valor sobra.",
            umap: "La tabla hash no sabe cuál es la siguiente clave a partir de x: tendría que revisarlas todas.",
            vector: "Cada cita nueva o cancelada obliga a reordenar o a correr el arreglo: Θ(n) por cambio, y los cambios llegan todo el día."
          }),
        carta("Palabras de un libro",
          "Se cuenta cuántas veces aparece cada palabra de un libro. Después llegan miles de preguntas del tipo ¿cuántas veces aparece esta palabra? No se imprime ninguna lista.",
          "umap", {
            set: "El set dice si la palabra está, pero no cuántas veces: no guarda repetidos.",
            map: "Funciona en O(log n) por pregunta, pero el orden de las palabras no se usa en ningún momento.",
            umap: "Correcto. Cada palabra lleva su cuenta, solo se busca por palabra y el orden no importa: O(1) en promedio por consulta.",
            vector: "Guardar todas las apariciones y contarlas en cada pregunta cuesta Θ(n) por consulta, o hay que ordenar y buscar los extremos de cada racha."
          }),
        carta("Saldos por cuenta",
          "Un banco lleva el saldo de cada número de cuenta. Durante el día llegan depósitos y retiros, y a medianoche se imprime un reporte con todas las cuentas ordenadas por número.",
          "map", {
            set: "El set guarda el número de cuenta, pero no tiene dónde poner el saldo.",
            map: "Correcto. Cada cuenta lleva su saldo, se actualiza en O(log n), y el reporte es el recorrido en orden, Θ(n).",
            umap: "Actualizar sería O(1) en promedio, pero el reporte pide el orden: habría que copiar a un vector y ordenar cada noche. Puede convenir si los movimientos son muchísimos; el map lo da sin ese paso.",
            vector: "Cada depósito tiene que encontrar su cuenta: si el vector está ordenado, insertar una cuenta nueva corre medio arreglo."
          }),
        carta("Cupones por correo",
          "Una tienda regala un cupón por cliente. Antes de enviar uno revisa si ese correo ya recibió el suyo, y cada semana imprime en orden alfabético la lista de correos que ya tienen cupón.",
          "set", {
            set: "Correcto. Solo claves, la pregunta es si el correo está, count en O(log n), y la lista semanal es el recorrido en orden.",
            map: "No hay ningún valor al lado del correo; un map<string, bool> sería un set con un bool de más en cada nodo.",
            umap: "Para saber si está, la tabla hash sirve, pero también habría que inventarle un valor y ordenar cada semana para la lista.",
            vector: "Las preguntas llegan entre envío y envío: un vector desordenado se recorre entero cada vez, y uno ordenado se corre al insertar."
          })
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
