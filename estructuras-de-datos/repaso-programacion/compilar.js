/* Ejercicio interactivo: compilar y ejecutar desde la terminal. */
var EJERCICIO = (function () {
  var P = typeof module !== "undefined" ? require("./programas.js") : Programas;

  function spec() {
    return {
      contenedor: "tarjetas",
      cierre: "<p>Compilar y ejecutar son dos pasos. <code>g++ -o nombre archivo.cpp -Wall -Wextra</code> traduce el fuente y deja un ejecutable con el nombre que sigue a <code>-o</code>; sin esa opción se llama <code>a.out</code>. Compilar no corre nada. El ejecutable se corre con <code>./nombre</code>, porque la terminal solo busca programas en las carpetas del PATH, y la carpeta actual no está entre ellas. Cuando se cambia el fuente, hay que volver a compilar: el ejecutable viejo sigue haciendo lo de antes.</p>",
      cartas: [
        { tipo: "opciones", titulo: "Lo que deja la orden", columna: true, correcta: "archivo",
          html: "<p>En una carpeta con <code>Menor.cpp</code> se escribe:</p>" + P.pre(["g++ -o menor Menor.cpp -Wall -Wextra"]) + "<p>El compilador termina sin mensajes. ¿Qué pasó?</p>",
          opciones: [
            { op: "corrio", texto: "El programa corrió y está esperando los cuatro números.", msg: "Compilar no ejecuta nada. Si el programa estuviera corriendo, la terminal no habría devuelto el prompt." },
            { op: "archivo", texto: "Apareció un archivo nuevo, <code>menor</code>, con el programa traducido; todavía no se ha ejecutado.", msg: "Correcto. El nombre lo da lo que sigue a -o. Menor.cpp sigue igual, y para correr el programa falta otra orden." },
            { op: "aout", texto: "Apareció un archivo <code>a.out</code>.", msg: "a.out es el nombre cuando no se pone -o. Aquí la orden dice -o menor." },
            { op: "cambia", texto: "<code>Menor.cpp</code> quedó convertido en ejecutable.", msg: "El fuente no cambia. El compilador lo lee y escribe el resultado en un archivo aparte." }
          ] },
        { tipo: "opciones", titulo: "command not found", columna: true, correcta: "path",
          html: "<p>Después de compilar se escribe <code>menor</code> y la terminal responde:</p>" + P.pre(["menor: command not found"]) + "<p>El archivo <code>menor</code> está en la carpeta. ¿Por qué no lo encuentra?</p>",
          opciones: [
            { op: "compilar", texto: "Porque hay que compilar otra vez.", msg: "El ejecutable ya existe. El problema es dónde lo busca la terminal." },
            { op: "path", texto: "Porque la terminal busca los programas en las carpetas del PATH, y la carpeta actual no es una de ellas. Hay que escribir <code>./menor</code>.", msg: "Correcto. El ./ dice el ejecutable que está justo aquí. Con eso la terminal no tiene que buscarlo." },
            { op: "extension", texto: "Porque falta la extensión: hay que escribir <code>menor.cpp</code>.", msg: "menor.cpp no existe: el fuente se llama Menor.cpp, y un fuente no se ejecuta. Lo que se corre es el archivo que dejó el compilador." },
            { op: "gpp", texto: "Porque hay que correrlo con <code>g++ menor</code>.", msg: "g++ traduce programas, no los ejecuta: con g++ menor no se corre nada, y el compilador termina con un error." }
          ] },
        { tipo: "respuesta", titulo: "Tres órdenes seguidas",
          html: "<p>Se escribe, en este orden:</p>" + P.pre(["g++ Menor.cpp -Wall -Wextra", "g++ -o prueba Menor.cpp -Wall -Wextra", "./prueba"]) +
                "<p>Al final, ¿cuántos ejecutables nuevos hay en la carpeta, y cómo se llama el que no se usó?</p>",
          campos: [
            { rotulo: "ejecutables:", esperado: "2", ancho: "3rem" },
            { rotulo: "el que no se usó:", esperado: "a.out", ancho: "6rem" }
          ],
          bien: "Correcto. La primera orden no lleva -o y deja a.out; la segunda deja prueba, que es el que se corre.",
          distractores: [
            { valores: ["1", null], msg: "Cada compilación escribe su propio ejecutable. La primera no lleva -o, y eso también deja un archivo." },
            { valores: [null, "Menor"], msg: "Menor.cpp es el fuente, no un ejecutable. Sin -o, g++ escribe el resultado en a.out." }
          ],
          otro: "Mire cuál de las dos compilaciones lleva -o. La que no lo lleva deja su ejecutable con el nombre por omisión." },
        { tipo: "opciones", titulo: "Un cambio que no aparece", columna: true, correcta: "recompilar",
          html: "<p>Se corrige un mensaje en <code>Menor.cpp</code>, se guarda el archivo y se corre <code>./menor</code>. Sale el mensaje viejo. ¿Qué falta?</p>",
          opciones: [
            { op: "guardar", texto: "Guardar otra vez el archivo.", msg: "El archivo ya está guardado. El ejecutable es otro archivo, y no se enteró del cambio." },
            { op: "recompilar", texto: "Volver a compilar: <code>menor</code> es la traducción del fuente de antes.", msg: "Correcto. Cada cambio en el fuente pide una compilación nueva antes de correr." },
            { op: "reiniciar", texto: "Cerrar y abrir la terminal.", msg: "La terminal no guarda el programa. El que quedó viejo es el archivo menor." }
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
