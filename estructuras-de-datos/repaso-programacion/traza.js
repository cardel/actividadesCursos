/* Ejercicio interactivo: recorrer un arreglo con un ciclo, el mínimo y la
   suma en la misma pasada, y la división entera que se come los decimales.
   La traza la calcula programas.js, verificado contra Notas.cpp. */
var EJERCICIO = (function () {
  var P = typeof module !== "undefined" ? require("./programas.js") : Programas;
  var NOTAS = [38, 45, 29, 50, 33, 47];
  var OTRAS = [21, 30, 18, 26, 30, 24];

  function spec() {
    var r = P.notas(NOTAS, false);
    var bien = P.notas(NOTAS, true);
    var o = P.notas(OTRAS, false);
    var ob = P.notas(OTRAS, true);
    return {
      contenedor: "tarjetas",
      cierre: "<p>Un solo recorrido puede llevar varias cuentas a la vez: aquí la suma acumulada y el mínimo, que arranca en la primera casilla y se corrige cuando aparece uno menor. La traza en tabla, una fila por vuelta, es la forma de comprobar que el ciclo hace lo que se cree. Y al dividir, el tipo de los operandos decide: entre dos enteros C descarta los decimales antes de guardar el resultado, aunque la variable sea <code>double</code>. Basta que uno de los dos sea real, como <code>6.0</code>.</p>",
      cartas: [
        { tipo: "tabla", titulo: "La traza del ciclo",
          html: P.pre(P.codigo("Notas")) + "<p>Con la entrada <code>" + NOTAS.join(" ") + "</code>, la traza del segundo ciclo, una vuelta por fila:</p>",
          cabecera: ["i", "notas[i]", "suma", "minimo"],
          filas: r.filas,
          boton: "Mostrar la vuelta siguiente" },
        { tipo: "respuesta", titulo: "La línea que imprime",
          html: "<p>Al salir del ciclo, <code>suma</code> vale " + r.suma + ". ¿Qué escribe el último <code>printf</code>?</p>",
          campos: [
            { rotulo: "mínimo:", esperado: String(r.minimo), ancho: "3rem" },
            { rotulo: "promedio:", esperado: r.promedio.toFixed(2), ancho: "5rem" }
          ],
          bien: "Correcto. suma / 6 es una división entre enteros: " + r.suma + " / 6 da 40 y se descartan los decimales antes de guardar en promedio. Imprime " + r.salida + ".",
          distractores: [
            { valores: [null, bien.promedio.toFixed(2)], msg: "Ese sería el promedio real, y no es lo que imprime. suma y 6 son enteros, así que la división se hace entre enteros: el resultado ya es 40 cuando llega a promedio." },
            { valores: [null, "40.333"], msg: "%0.2f imprime dos decimales, y además la división entera dejó 40." },
            { valores: ["38", null], msg: "38 es el primer valor. El ciclo lo corrige cuando llega el 29." }
          ],
          otro: "Para el mínimo, mire la columna de la traza. Para el promedio, divida " + r.suma + " entre 6 como enteros." },
        { tipo: "opciones", titulo: "Que salgan los decimales", columna: true, correcta: "real",
          html: "<p>¿Qué cambio hace que imprima el promedio con sus decimales?</p>",
          opciones: [
            { op: "formato", texto: "Cambiar <code>%0.2f</code> por <code>%0.4f</code>.", msg: "El formato solo decide cuántos decimales mostrar. Si el valor ya es 40, muestra 40.0000." }
          ,
            { op: "double", texto: "Nada más: <code>promedio</code> ya es <code>double</code>, y eso basta.", msg: "promedio ya es double, y aun así imprime 40.00. La división se hace antes de guardar, con los tipos de suma y de 6." },
            { op: "real", texto: "Escribir <code>suma / 6.0</code>.", msg: "Correcto. Con un operando real la división es real: imprime " + bien.salida + "." }] },
        { tipo: "respuesta", titulo: "Otra entrada",
          html: "<p>El mismo programa con <code>" + OTRAS.join(" ") + "</code>. ¿Qué imprime el último <code>printf</code>, y qué imprimiría con <code>suma / 6.0</code>?</p>",
          campos: [
            { rotulo: "con / 6:", esperado: o.salida, ancho: "20rem" },
            { rotulo: "con / 6.0:", esperado: ob.salida, ancho: "20rem" }
          ],
          bien: "Correcto. El mínimo es el 18 de la tercera casilla. " + o.suma + " / 6 da 24 entre enteros y " + ob.promedio.toFixed(2) + " con 6.0.",
          distractores: [
            { valores: [ob.salida, null], msg: "En la primera casilla va la versión con / 6, la división entre enteros." },
            { valores: [null, o.salida], msg: "Con 6.0 la división conserva los decimales: " + o.suma + " / 6.0 no es un entero." }
          ],
          otro: "Haga la traza: suma " + o.suma + ", mínimo 18. Después divida de las dos formas." }
      ]
    };
  }

  return { NOTAS: NOTAS, OTRAS: OTRAS, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
