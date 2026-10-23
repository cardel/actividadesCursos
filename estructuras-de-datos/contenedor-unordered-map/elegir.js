/* Ejercicio interactivo: escoger entre map y unordered_map. */
var EJERCICIO = (function () {
  function spec() {
    return {
      contenedor: "tarjetas",
      cierre: "El unordered_map busca, inserta y borra en O(1) en promedio, y cobra con el orden: su recorrido no sigue las claves. El map paga O(log n) por operación, también en el peor caso, y recorre de menor a mayor. Cuando la salida o la consulta dependen del orden de las claves, como en un rango, va el map; cuando cada operación tiene que quedar acotada una por una, también. Cuando solo se busca o se cuenta por clave, el unordered_map.",
      cartas: [
        { tipo: "opciones", titulo: "Viajes por estación", columna: true, correcta: "hash",
          html: "<p>Un sistema de bicicletas registra cada viaje con el código de la estación de salida. Durante el día, un operador pregunta cuántos viajes salieron de una estación cualquiera. Nunca se listan las estaciones.</p>",
          opciones: [
            { op: "map", texto: "<code>map&lt;int, int&gt;</code>", msg: "Da las mismas respuestas, pero cada viaje y cada consulta pagan O(log n) por un orden que nadie usa." },
            { op: "hash", texto: "<code>unordered_map&lt;int, int&gt;</code>", msg: "Correcto: sumar un viaje y responder una consulta cuestan O(1) en promedio, y el orden de las estaciones no aparece en ninguna salida." },
            { op: "arreglo", texto: "Un arreglo indexado por el código de estación", msg: "Solo si los códigos son pequeños y contiguos. Con códigos de siete dígitos la mayor parte del arreglo queda vacía." }
          ] },
        { tipo: "opciones", titulo: "Ventas entre dos fechas", columna: true, correcta: "map",
          html: "<p>Las ventas de una tienda se guardan por fecha, como un entero <code>AAAAMMDD</code>. La consulta típica es el total vendido entre el 1 y el 15 de marzo.</p>",
          opciones: [
            { op: "hash", texto: "<code>unordered_map&lt;int, int&gt;</code>", msg: "Las fechas del rango quedan repartidas por las cubetas sin orden. Hay que recorrer la tabla entera, Θ(m + n), y revisar cada fecha." },
            { op: "hash15", texto: "<code>unordered_map</code>, buscando las 15 fechas con <code>find</code>", msg: "Sirve para un rango de días, pero el costo crece con el largo del rango y no con las fechas que hay: un rango de diez años son más de 3600 búsquedas aunque haya pocas ventas." },
            { op: "map", texto: "<code>map&lt;int, int&gt;</code>", msg: "Correcto: las fechas quedan en orden, así que el recorrido suma las del rango y se detiene en la primera fecha posterior al 15 de marzo." }
          ] },
        { tipo: "opciones", titulo: "Cada operación con tiempo límite", columna: true, correcta: "map",
          html: "<p>Un controlador guarda medio millón de lecturas de sensores por su identificador. Cada inserción tiene que responder dentro de un plazo fijo, porque una respuesta tardía detiene la máquina. Las consultas se hacen por identificador.</p>",
          opciones: [
            { op: "map", texto: "<code>map</code>", msg: "Correcto: O(log n) en cada operación, una por una. Con medio millón de claves son unas 19 comparaciones, siempre." },
            { op: "hash", texto: "<code>unordered_map</code>, porque es O(1)", msg: "Es O(1) en promedio. La inserción que dispara un rehash vuelve a colgar todas las claves: con medio millón, esa sola inserción cuesta Θ(n) y se pasa del plazo." },
            { op: "hash2", texto: "<code>unordered_map</code> con una buena función hash", msg: "Una buena función hash evita las listas largas, pero no evita el rehash: la tabla crece igual cuando α pasaría de 1." }
          ] },
        { tipo: "opciones", titulo: "Direcciones web visitadas", columna: true, correcta: "hash",
          html: "<p>Un navegador guarda las direcciones ya visitadas, cadenas de hasta 2000 caracteres, y por cada enlace de una página pregunta si ya se visitó. No se muestra ninguna lista.</p>",
          opciones: [
            { op: "map", texto: "<code>map&lt;string, int&gt;</code>, porque comparar cadenas es barato", msg: "Comparar dos cadenas cuesta hasta O(L), y el map hace O(log n) comparaciones por búsqueda: O(L log n)." },
            { op: "hash", texto: "<code>unordered_map&lt;string, int&gt;</code>", msg: "Correcto: un hash de Θ(L) y, en promedio, O(1) comparaciones de O(L) cada una. El map haría O(log n) comparaciones de cadenas largas." },
            { op: "lista", texto: "Una lista enlazada con las direcciones", msg: "Cada pregunta recorre la lista: Θ(n) comparaciones de cadenas por enlace." }
          ] },
        { tipo: "opciones", titulo: "Un juez que pide orden", columna: true, correcta: "orden",
          html: "<p>Un problema pide imprimir, de menor a mayor, cada número distinto de la entrada con las veces que aparece. Un estudiante cuenta con <code>unordered_map</code> y recorre al final. En sus pruebas pasa, y el juez responde <em>Wrong Answer</em>. ¿Qué cambio arregla el programa?</p>",
          opciones: [
            { op: "cubetas", texto: "Recorrer la tabla de la cubeta 0 a la última", msg: "Por cubetas, el 14 cae en la cubeta 1 con el 1 y sale antes que el 2: el orden sigue siendo el de k mod m." },
            { op: "suerte", texto: "Leer toda la entrada, ordenarla e insertar de menor a mayor", msg: "Insertando 1, 2, 3 y 14 en ese orden, g++ recorre 3 2 14 1: cada cubeta nueva pasa al frente. El orden de llegada no controla el recorrido." },
            { op: "orden", texto: "Contar con <code>map</code>, que recorre de menor a mayor", msg: "Correcto: n inserciones de O(log n) y un recorrido de Θ(n) ya en orden." }
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
