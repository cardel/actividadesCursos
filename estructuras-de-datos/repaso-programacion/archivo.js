/* Ejercicio interactivo: entrada y salida por archivo con < y >. La salida
   es la de Menor.cpp corrido con pruebas.in. */
var EJERCICIO = (function () {
  var P = typeof module !== "undefined" ? require("./programas.js") : Programas;
  var PRUEBA = [8, 3, 9, 1];

  function spec() {
    var sale = "El menor es " + P.menor(PRUEBA);
    return {
      contenedor: "tarjetas",
      cierre: "<p><code>&lt;</code> conecta la entrada del programa a un archivo y <code>&gt;</code> manda la salida a otro. El programa no cambia: sigue llamando a <code>scanf</code> y a <code>printf</code>. Con <code>&gt;</code> nada aparece en pantalla, ni siquiera los mensajes que piden datos, y si la entrada sigue en el teclado el programa parece trabado mientras espera. Es como califica el juez: entrada desde un archivo, salida a otro, y la comparación carácter por carácter con la esperada.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Lo que queda en el archivo",
          html: "<p><code>pruebas.in</code> tiene una sola línea, <code>" + PRUEBA.join(" ") + "</code>. Con el ejecutable de <code>Menor.cpp</code> se escribe:</p>" + P.pre(["./menor < pruebas.in > res.out"]) +
                "<p>¿Qué aparece en pantalla y qué queda escrito en <code>res.out</code>? Si en pantalla no aparece nada, escriba <code>nada</code>.</p>",
          campos: [
            { rotulo: "pantalla:", esperado: "nada", ancho: "7rem" },
            { rotulo: "res.out:", esperado: sale, ancho: "10rem" }
          ],
          bien: "Correcto. Los cuatro números llegan del archivo y la línea del printf va a res.out. La pantalla queda en blanco.",
          distractores: [
            { valores: [sale, null], msg: "Con > la salida no llega a la pantalla: va completa al archivo." },
            { valores: [null, PRUEBA.join(" ")], msg: "res.out guarda lo que imprime el programa, no lo que lee." }
          ],
          otro: "< pruebas.in decide de dónde lee scanf; > res.out decide a dónde escribe printf." },
        { tipo: "opciones", titulo: "Un programa que parece trabado", columna: true, correcta: "espera",
          html: "<p>Se escribe <code>./menor &gt; res.out</code> y la terminal se queda quieta, sin prompt. ¿Qué pasa?</p>",
          opciones: [
            { op: "ciclo", texto: "El programa entró en un ciclo infinito.", msg: "Menor.cpp no tiene ciclos. Está detenido en el scanf." },
            { op: "espera", texto: "Está esperando los cuatro números por el teclado; lo que imprima va al archivo y por eso no se ve nada.", msg: "Correcto. Sin <, la entrada sigue siendo el teclado. Se pueden escribir los números, o cancelar con Ctrl+C." },
            { op: "archivo", texto: "Falta crear <code>res.out</code> antes de correrlo.", msg: "> crea el archivo si no existe, y si existe lo reemplaza." }
          ] },
        { tipo: "opciones", titulo: "Lo que compara el juez", columna: true, correcta: "salto",
          html: "<p>La salida esperada del juez es <code>" + sale + "</code> seguida de un salto de línea. Un programa imprime con <code>printf(\"El menor es %d\", menor);</code>, sin <code>\\n</code>. ¿Qué pasa?</p>",
          opciones: [
            { op: "igual", texto: "Da igual: el número es el mismo.", msg: "El juez no lee números, compara archivos. Un carácter de menos ya es una diferencia." },
            { op: "pantalla", texto: "Solo se nota en pantalla, porque el prompt queda pegado a la salida.", msg: "En pantalla se ve feo, y además el archivo que el juez compara queda distinto del esperado." }
          ,
            { op: "salto", texto: "Puede quedar rechazado: el archivo de salida no termina igual que el esperado.", msg: "Correcto. La comparación es carácter por carácter, y el salto de línea es un carácter. Algunos jueces perdonan los espacios del final y otros no: el \\n se pone siempre." }] }
      ]
    };
  }

  return { PRUEBA: PRUEBA, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
