/* Ejercicio interactivo: el costo de la tabla directa y cuándo sirve. */
var EJERCICIO = (function () {
  var PUNTERO = 8;   // bytes de un puntero en la máquina de 64 bits del curso

  function miles(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }

  /* Universo de las placas de carro: tres letras y tres dígitos. */
  function universoPlacas() { return 26 * 26 * 26 * 1000; }

  function spec() {
    var placas = universoPlacas();
    var bytesPlacas = placas * PUNTERO;
    return {
      contenedor: "tarjetas",
      cierre: "Insertar, buscar y eliminar cuestan Θ(1) porque la clave es la dirección. Lo que crece con el universo es lo demás: crear la tabla, recorrerla y la memoria, todo Θ(m) aunque se guarden pocas claves. Por eso la tabla directa sirve cuando el universo es pequeño, o se vuelve pequeño restando un desfase, y deja de servir cuando el universo es mucho más grande que lo que se guarda.",
      cartas: [
        { tipo: "opciones", titulo: "Buscar con pocos registros", columna: true, correcta: "uno",
          html: "<p>Una tabla de m = 1000 casillas guarda n = 3 registros. ¿Cuánto cuesta <code>buscar(k)</code>?</p>",
          opciones: [
            { op: "uno", texto: "Θ(1)", msg: "Correcto. Se lee T[k] y nada más, con 3 registros o con 1000." },
            { op: "n", texto: "Θ(n)", msg: "Ese es el costo de buscar en una lista: recorrer los registros. La tabla no recorre." },
            { op: "m", texto: "Θ(m)", msg: "Recorrer las m casillas cuesta eso, pero buscar no recorre: va directo a la casilla k." }
          ] },
        { tipo: "opciones", titulo: "Crear la tabla", columna: true, correcta: "m",
          html: "<p>¿Cuánto cuesta el constructor <code>TablaDirecta(m)</code>?</p>",
          opciones: [
            { op: "uno", texto: "Θ(1): un solo <code>new</code>", msg: "El new reserva las m casillas, pero el ciclo después pone cada una en NULL: m asignaciones." },
            { op: "m", texto: "Θ(m)", msg: "Correcto. Cada casilla empieza en NULL, y son m." },
            { op: "n", texto: "Θ(n), por los registros que se van a guardar", msg: "Al crear la tabla todavía no hay registros. Lo que se recorre son las casillas." }
          ] },
        { tipo: "opciones", titulo: "La clave más pequeña", columna: true, correcta: "m",
          html: "<p>Una tabla de m casillas guarda n registros. ¿Cuánto cuesta, en el peor caso, encontrar el registro de clave más pequeña recorriendo desde la casilla 0?</p>",
          opciones: [
            { op: "uno", texto: "Θ(1): está en la casilla 0", msg: "Solo si la clave 0 está guardada. Si el único registro tiene clave m − 1, hay que mirar todas las casillas." },
            { op: "n", texto: "Θ(n)", msg: "Las casillas vacías también se miran: el recorrido no sabe cuáles están llenas." },
            { op: "m", texto: "Θ(m), aunque n sea 1", msg: "Correcto. La tabla no guarda orden entre los registros: el recorrido pasa por todas las casillas hasta la primera llena." }
          ] },
        { tipo: "opciones", titulo: "Edades de pacientes", columna: true, correcta: "si",
          html: "<p>Un consultorio cuenta cuántos pacientes atendió de cada edad, de 0 a 120 años. ¿Sirve una tabla directa?</p>",
          opciones: [
            { op: "si", texto: "Sí: 121 casillas, una por edad", msg: "Correcto. Con contadores de 4 bytes son 484 bytes, y cada paciente cuenta en Θ(1)." },
            { op: "no", texto: "No: hay que guardar cada paciente", msg: "Para contar no hace falta guardarlos: la casilla de la edad guarda cuántos van." },
            { op: "lista", texto: "Mejor una lista de pares edad y cuenta", msg: "La lista funciona, pero cada paciente tendría que buscar su par: hasta 121 pasos en vez de uno." }
          ] },
        { tipo: "opciones", titulo: "Habitaciones de un hotel", columna: true, correcta: "desfase",
          html: "<p>Las habitaciones de un hotel van de la 100 a la 599, y cada una guarda el nombre del huésped. ¿Cómo se usa una tabla directa?</p>",
          opciones: [
            { op: "seiscientas", texto: "Con 600 casillas, de la 0 a la 599", msg: "Funciona, pero las casillas 0 a 99 nunca se usan." },
            { op: "desfase", texto: "Con 500 casillas: la habitación h va en la casilla h − 100", msg: "Correcto. Restar 100 lleva el universo a {0, …, 499}: ninguna casilla sobra y cada operación sigue en Θ(1)." },
            { op: "no", texto: "No sirve: las claves no empiezan en 0", msg: "Basta una resta para que empiecen en 0. La cuenta es Θ(1)." }
          ] },
        { tipo: "opciones", titulo: "Placas de carro", columna: true, correcta: "no",
          html: "<p>Un parqueadero con 200 puestos registra cada carro por su placa: tres letras y tres dígitos, como ABC123. Hay " + miles(placas) + " placas posibles. ¿Sirve una tabla directa de punteros?</p>",
          opciones: [
            { op: "si", texto: "Sí: buscar es Θ(1)", msg: "Buscar sí, pero la tabla ocupa " + miles(bytesPlacas) + " bytes en punteros, unos " + Math.round(bytesPlacas / 1000000) + " MB, para guardar 200 carros, y crearla cuesta " + miles(placas) + " asignaciones." },
            { op: "no", texto: "No: el universo es muchísimo más grande que lo que se guarda", msg: "Correcto. " + miles(placas) + " casillas de " + PUNTERO + " bytes son " + miles(bytesPlacas) + " bytes para 200 registros. Hace falta una tabla del tamaño de lo que se guarda." },
            { op: "lista", texto: "Sí, si se guardan solo los dígitos", msg: "Con solo los dígitos, ABC123 y XYZ123 caen en la misma casilla, y la tabla directa supone claves distintas." }
          ] }
      ]
    };
  }

  return { puntero: PUNTERO, universoPlacas: universoPlacas, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
