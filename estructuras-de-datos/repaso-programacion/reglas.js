/* Ejercicio interactivo: sin break y con un solo return. Las tres versiones
   de posicion son las de Posicion.cpp, y sus resultados los de la corrida. */
var EJERCICIO = (function () {
  var P = typeof module !== "undefined" ? require("./programas.js") : Programas;
  var A = [12, 7, 30, 7, 5];

  function spec() {
    return {
      contenedor: "tarjetas",
      cierre: "<p>Sin <code>break</code>, sin <code>continue</code> y con un solo <code>return</code> al final, la condición del ciclo cuenta la historia entera: el ciclo sigue mientras quede arreglo y no se haya encontrado lo que se busca. Quitar el <code>break</code> sin pasar su razón a la condición cambia el programa, porque el ciclo sigue y la última coincidencia pisa a la primera. Y una función con una sola salida se traza de arriba abajo sin buscar por dónde se fue.</p>",
      cartas: [
        { tipo: "opciones", titulo: "Quitar el break", columna: true, correcta: "a",
          html: "<p>Esta función devuelve la primera posición de <code>x</code> en el arreglo, o −1:</p>" + P.pre(P.codigo("posicionBreak")) +
                "<p>¿Cuál de estas dos hace lo mismo sin <code>break</code>?</p><p>A:</p>" + P.pre(P.codigo("posicionA")) + "<p>B:</p>" + P.pre(P.codigo("posicionB")),
          opciones: [
            { op: "a", texto: "A, porque la condición del ciclo para en cuanto pos deja de valer −1.", msg: "Correcto. La razón del break pasa a la condición: pos == -1. Con el arreglo " + A.join(" ") + " y x = 7, las dos devuelven " + P.posicionBreak(A, 7) + "." },
            { op: "b", texto: "B, porque solo se quitó el break y lo demás es igual.", msg: "Sin el break, el ciclo sigue hasta el final y cada coincidencia pisa la anterior: B devuelve la última posición, no la primera. Con " + A.join(" ") + " y x = 7, B devuelve " + P.posicionB(A, 7) + "." },
            { op: "ambas", texto: "Las dos, porque devuelven lo mismo para cualquier arreglo.", msg: "Solo cuando x aparece una vez o ninguna. Con un valor repetido, B se queda con la última posición." }
          ] },
        { tipo: "respuesta", titulo: "Lo que devuelve cada una",
          html: "<p>Con el arreglo <code>" + A.join(" ") + "</code>, ¿qué devuelven A y B para x = 7 y para x = 9?</p>",
          campos: [
            { rotulo: "A con 7:", esperado: String(P.posicionBreak(A, 7)), ancho: "3rem" },
            { rotulo: "B con 7:", esperado: String(P.posicionB(A, 7)), ancho: "3rem" },
            { rotulo: "A con 9:", esperado: String(P.posicionBreak(A, 9)), ancho: "3rem" },
            { rotulo: "B con 9:", esperado: String(P.posicionB(A, 9)), ancho: "3rem" }
          ],
          bien: "Correcto. El 7 está en las casillas 1 y 3: A para en la 1, B sigue y termina en la 3. El 9 no está, y las dos devuelven −1.",
          distractores: [
            { valores: ["1", "1", null, null], msg: "B no para: después de la casilla 1 sigue mirando, y en la casilla 3 hay otro 7." },
            { valores: ["2", "4", null, null], msg: "Las casillas se cuentan desde 0: el primer 7 está en la casilla 1." },
            { valores: [null, null, "5", "5"], msg: "Si x no aparece, pos nunca cambia y queda en −1." }
          ],
          otro: "Recorra el arreglo desde la casilla 0. A se detiene en la primera coincidencia; B llega siempre al final." },
        { tipo: "opciones", titulo: "Dos return", columna: true, correcta: "condicion",
          html: "<p>Otra forma de evitar el <code>break</code>:</p>" + P.pre(["int posicion(int a[], int n, int x) {", "  for (int i = 0; i < n; i++) {", "    if (a[i] == x) {", "      return i;", "    }", "  }", "  return -1;", "}"]) + "<p>Devuelve lo mismo que A. ¿Qué tiene de distinto?</p>",
          opciones: [
            { op: "nada", texto: "Nada: es la misma función, más corta.", msg: "Devuelve lo mismo, y tiene dos salidas. Para saber qué devuelve hay que mirar dos lugares, y la condición del for ya no dice cuándo termina el ciclo." },
            { op: "condicion", texto: "Tiene dos return: el ciclo puede terminar por la condición o desde adentro, y la condición del for ya no lo cuenta todo.", msg: "Correcto. En A el ciclo termina solo por su condición, y la función tiene una única salida al final." },
            { op: "error", texto: "No compila, porque una función no puede tener dos return.", msg: "Compila sin avisos. Lo que pierde es que se pueda leer de arriba abajo: el ciclo se puede cortar desde adentro." }
          ] }
      ]
    };
  }

  return { A: A, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
