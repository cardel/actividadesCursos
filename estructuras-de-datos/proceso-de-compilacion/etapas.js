/* Ejercicio interactivo: las cuatro etapas de la compilación. Los conteos
   de líneas, lo que reporta nm y los mensajes son los de las corridas
   guardadas en programas.js. */
var EJERCICIO = (function () {
  var P = typeof module !== "undefined" ? require("./programas.js") : Etapas;
  var T = typeof module !== "undefined" ? require("../lenguajes-y-paradigmas/texto.js") : Texto;

  /* Los símbolos de nm con una letra dada, en el orden en que aparecen. */
  function simbolos(nm, letra) {
    return nm.map(function (l) { return l.trim().split(/\s+/); })
      .filter(function (p) { return p[p.length - 2] === letra; })
      .map(function (p) { return p[p.length - 1]; });
  }

  function spec() {
    var c = P.cuadrados;
    var agregadas = c.lineasI - c.lineasC;
    var errMacro = P.macro.error.filter(function (l) { return l.indexOf("error:") >= 0; });
    return {
      contenedor: "tarjetas",
      cierre: "<p>gcc hace cuatro etapas, y cada una se puede detener: <code>-E</code> deja el fuente preprocesado, con los <code>#include</code> pegados y las macros reemplazadas; <code>-S</code> deja el ensamblador; <code>-c</code> deja el código objeto, binario y todavía sin direcciones fijas; y sin opciones se enlaza con las bibliotecas y sale el ejecutable. El preprocesador pega texto sin entender C, y por eso un error en una macro lo reporta el compilador en la línea donde quedó pegada. El objeto sabe qué define, con T, y qué usa sin tener, con U; el enlazador resuelve las U.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Detenerse en cada frontera",
          html: "<p>Escriba la opción de gcc que detiene la traducción después de cada etapa:</p>" +
                T.tabla(["Etapa", "Qué deja"], [["Preprocesamiento", "texto, <code>.i</code>"], ["Compilación", "ensamblador, <code>.s</code>"], ["Ensamblado", "código objeto, <code>.o</code>"]]),
          campos: [
            { rotulo: "preprocesar:", esperado: "-E", ancho: "3rem" },
            { rotulo: "compilar:", esperado: "-S", ancho: "3rem" },
            { rotulo: "ensamblar:", esperado: "-c", ancho: "3rem" }
          ],
          bien: "Correcto. gcc -E, gcc -S y gcc -c, en ese orden. Sin ninguna de las tres, gcc hace las cuatro etapas y entrega el ejecutable.",
          distractores: [
            { valores: [null, "-c", "-S"], msg: "Están cruzadas: -S deja el ensamblador, que es texto que se puede leer, y -c deja el objeto, que ya es binario." },
            { valores: ["-o", null, null], msg: "-o solo pone el nombre del archivo de salida. La que detiene después del preprocesamiento es -E." }
          ],
          otro: "Son tres letras, cada una después de un guion; las dos primeras van en mayúscula." },
        { tipo: "respuesta", titulo: "Lo que agrega el preprocesador",
          html: T.codigo(c.codigo) + T.consola("gcc -E Cuadrados.c -o Cuadrados.i", []) +
                T.consola("wc -l Cuadrados.c Cuadrados.i", ["   " + c.lineasC + " Cuadrados.c", "  " + c.lineasI + " Cuadrados.i"]) +
                "<p>¿Cuántas líneas agregó el preprocesamiento, y cómo quedó en <code>Cuadrados.i</code> la línea del <code>while</code>?</p>",
          campos: [
            { rotulo: "líneas:", esperado: String(agregadas), ancho: "4rem" },
            { rotulo: "while:", esperado: c.whileI, ancho: "12rem" }
          ],
          bien: "Correcto. " + c.lineasI + " − " + c.lineasC + " = " + agregadas + ": es stdio.h pegado donde estaba el #include. Y TOPE desapareció: el preprocesador lo cambió por 5 en el texto, y el compilador nunca ve la palabra TOPE.",
          distractores: [
            { valores: [String(c.lineasI), null], msg: "Ese es el total del archivo preprocesado. Réstele las " + c.lineasC + " que ya tenía el fuente." },
            { valores: [null, "while (k <= TOPE) {"], msg: "El preprocesador reemplaza cada TOPE por lo que dice el #define, así que en el .i ya no aparece." }
          ],
          otro: "Reste las líneas del fuente a las del preprocesado, y reemplace la macro por su valor." },
        { tipo: "respuesta", titulo: "Lo que sabe el objeto",
          html: T.consola("gcc -c Cuadrados.s -o Cuadrados.o", []) + T.consola("nm Cuadrados.o", c.nm) +
                "<p>¿Qué símbolos están definidos en el objeto y cuáles usa sin tenerlos? Escríbalos en el orden en que aparecen.</p>",
          campos: [
            { rotulo: "definidos:", esperado: simbolos(c.nm, "T").join(" "), ancho: "10rem" },
            { rotulo: "sin definir:", esperado: simbolos(c.nm, "U").join(" "), ancho: "8rem" }
          ],
          bien: "Correcto. La T marca lo que está en la sección de texto del objeto: cuadrado y main, las dos funciones del archivo. La U marca printf: el objeto la llama pero no tiene su código. El enlazador la busca en la biblioteca estándar de C, y por eso el ejecutable final corre e imprime desde 1 al cuadrado es 1 hasta 5 al cuadrado es 25.",
          distractores: [
            { valores: ["main", null], msg: "cuadrado también está definida en Cuadrados.c, y nm la marca con T." },
            { valores: [null, "printf cuadrado"], msg: "cuadrado tiene su código en este mismo archivo: no queda pendiente. Solo printf viene de afuera." }
          ],
          otro: "T es definido aquí; U es undefined, usado sin tenerlo." },
        { tipo: "opciones", titulo: "La llamada que cambió", columna: true, correcta: "cambio",
          html: T.codigo(P.soloListo.codigo) + T.consola("nm solo_listo.o", P.soloListo.nm) + "<p>El programa llama <code>printf</code>, y <code>nm</code> no lo menciona. ¿Por qué?</p>",
          opciones: [
            { op: "cambio", texto: "Porque la cadena no tiene formatos que resolver y gcc cambió la llamada por puts, que solo escribe una línea.", msg: "Correcto. Si el programa agrega printf(\"%d listos\\n\", 3), el objeto pide las dos: nm muestra " + simbolos(P.listo.nm, "U").join(" y ") + ". Con un %d hay que formatear de verdad. El compilador no traduce palabra por palabra: entiende y después decide." },
            { op: "pre", texto: "Porque el preprocesador reemplazó printf por puts al pegar stdio.h.", msg: "El preprocesador pega la declaración de printf y no toca las llamadas. El cambio lo decide el compilador, en sus últimas fases." },
            { op: "enlace", texto: "Porque el enlazador ya resolvió printf.", msg: "nm sobre el .o muestra el estado antes de enlazar: lo que aparece con U todavía no se ha resuelto." }
          ] },
        { tipo: "opciones", titulo: "Un punto y coma en la macro", columna: true, correcta: "compilador",
          html: T.codigo(P.macro.codigo) + "<p>Al compilar sale:</p><pre class=\"fragmento\">" + T.escapar(errMacro[0]) + "</pre><p>¿Quién se queja, y por qué en esa línea?</p>",
          opciones: [
            { op: "pre", texto: "El preprocesador, porque un #define no puede terminar en punto y coma.", msg: "El preprocesador no entiende C: pegó 10; donde decía CUPO sin preguntarse si tenía sentido. Él no se queja de nada." },
            { op: "compilador", texto: "El compilador, al leer int sillas[10;]; que es lo que quedó después de pegar la macro.", msg: "Correcto. El punto y coma viajó con la macro hasta el corchete, y ahí la gramática esperaba un ]. gcc señala la línea del #define y agrega una nota: in expansion of macro CUPO. Después vienen más errores en cadena, porque sillas nunca quedó declarado." },
            { op: "enlazador", texto: "El enlazador, porque no encuentra CUPO.", msg: "CUPO nunca llega al enlazador: desaparece en el preprocesamiento. Y el error sale antes de que exista un objeto." }
          ] }
      ]
    };
  }

  return { simbolos: simbolos, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
