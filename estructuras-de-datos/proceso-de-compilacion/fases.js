/* Ejercicio interactivo: las seis fases del compilador y en cuál muere
   cada programa roto. Los mensajes son los de gcc 13 sobre cada archivo,
   guardados en programas.js. */
var EJERCICIO = (function () {
  var P = typeof module !== "undefined" ? require("./programas.js") : Etapas;
  var T = typeof module !== "undefined" ? require("../lenguajes-y-paradigmas/texto.js") : Texto;

  var OPCIONES_FASE = [
    { op: "lexico", texto: "Análisis léxico" },
    { op: "sintactico", texto: "Análisis sintáctico" },
    { op: "semantico", texto: "Análisis semántico" },
    { op: "enlace", texto: "Enlazado, en la cuarta etapa" }
  ];

  /* La primera línea de error del mensaje, sin el nombre del archivo. */
  function primerError(err) {
    var l = err.filter(function (x) { return x.indexOf("error:") >= 0; })[0];
    return l.replace(/^[^ ]+: error: /, "");
  }

  /* Una tarjeta de opciones para un programa roto: msgs por fase. */
  function carta(titulo, prog, correcta, msgs) {
    return {
      tipo: "opciones", titulo: titulo, correcta: correcta,
      html: T.codigo(prog.codigo) + "<p>Se compila con <code>gcc -Wall -Wextra -c</code>. ¿En qué fase se detiene?</p>",
      opciones: OPCIONES_FASE.map(function (o) {
        return { op: o.op, texto: o.texto, msg: msgs[o.op] };
      })
    };
  }

  function spec() {
    var lex = primerError(P.roto_lexico.error);
    var lex2 = P.roto_lexico.error.filter(function (x) { return x.indexOf("error:") >= 0; })[1].replace(/^[^ ]+: error: /, "");
    var sin = primerError(P.roto_sintactico.error);
    var uni = primerError(P.roto_unicidad.error);
    var flu = primerError(P.roto_flujo.error);
    var enl = P.enlace.error;
    return {
      contenedor: "tarjetas",
      cierre: "<p>Dentro de la etapa de compilación hay seis fases: tres que entienden el programa, el análisis léxico, el sintáctico y el semántico, y tres que lo producen, el código intermedio, la optimización y la generación de código. El léxico arma tokens y rechaza lo que no pertenece al alfabeto; el sintáctico acomoda los tokens en un árbol según la gramática; el semántico revisa tipos, flujo de control y unicidad de nombres. Lo que ninguna fase puede ver es lo que está en otro archivo: una función que falta o que aparece dos veces la descubre el enlazador, y el mensaje ya no viene de gcc sino de ld. Leer quién se queja dice dónde buscar.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Las seis fases en orden",
          html: T.tabla(["Fase", "Qué recibe", "Qué entrega"], [
                  ["1", "caracteres", "tokens"], ["2", "tokens", "árbol sintáctico"], ["3", "árbol", "?"],
                  ["4", "árbol decorado", "?"], ["5", "código intermedio", "código optimizado"], ["6", "código optimizado", "ensamblador"]]) +
                "<p>¿Qué fase entrega el árbol decorado, con los tipos ya revisados, y qué fase entrega las instrucciones de tres direcciones? Escriba el número de cada una.</p>",
          campos: [
            { rotulo: "árbol decorado:", esperado: "3", ancho: "3rem" },
            { rotulo: "tres direcciones:", esperado: "4", ancho: "3rem" }
          ],
          bien: "Correcto. La fase 3, el análisis semántico, decora el árbol con los tipos y lo que revisó. La 4 lo convierte en código intermedio de tres direcciones, que la 5 optimiza y la 6 traduce al ensamblador del procesador.",
          distractores: [
            { valores: ["2", null], msg: "La fase 2 arma el árbol, pero todavía sin tipos: decorarlo es trabajo del análisis semántico." },
            { valores: [null, "6"], msg: "La 6 entrega ensamblador, que ya depende del procesador. El código de tres direcciones es el intermedio, antes de optimizar." }
          ],
          otro: "Las tres primeras fases entienden el programa y las tres últimas lo producen." },
        carta("Un carácter suelto", P.roto_lexico, "lexico", {
          lexico: "Correcto. El acento grave no pertenece al alfabeto de C, y el escáner lo rechaza antes de pensar en estructura: " + lex + ". Después llega otro error, " + lex2 + ": el 2 quedó sin operador que lo una al 7.",
          sintactico: "El primer mensaje no habla de orden sino de un carácter: " + lex + ". Antes de acomodar tokens hay que tenerlos, y ese símbolo no es ninguno.",
          semantico: "No se llega a mirar tipos: el carácter ni siquiera forma un token.",
          enlace: "Con -c no se enlaza, y además la compilación falla antes de dejar un objeto." }),
        carta("Un paréntesis que no cierra", P.roto_sintactico, "sintactico", {
          lexico: "Todos los caracteres forman tokens legales: if, (, x, >, 3, {. Lo que falla es el orden.",
          sintactico: "Correcto. gcc responde " + sin + ". La gramática del if pide la condición entre paréntesis, y la llave llegó antes del que cierra.",
          semantico: "No hay nada que revisar de tipos: los tokens no se dejan acomodar en ningún árbol válido, y ahí se detiene.",
          enlace: "Con -c no se enlaza; la compilación falla antes de dejar un objeto." }),
        carta("Dos veces el mismo nombre", P.roto_unicidad, "semantico", {
          lexico: "int, n, =, 2 y ; son tokens legales.",
          sintactico: "Las dos declaraciones están bien escritas, cada una por separado: identificador, =, expresión y punto y coma.",
          semantico: "Correcto. gcc responde " + uni + ". Es un error de unicidad: dos variables distintas con el mismo nombre en el mismo alcance. Para verlo hay que recordar qué nombres ya existen, y eso no es gramática.",
          enlace: "El enlazador trabaja con funciones y variables de varios archivos. Esta n es local a main y el error sale antes de dejar el objeto." }),
        carta("Un break sin ciclo", P.roto_flujo, "semantico", {
          lexico: "break es una palabra reservada: el escáner lo reconoce sin problema.",
          sintactico: "break; es una sentencia bien formada, y puede ir dentro de un if. El problema es a dónde salta.",
          semantico: "Correcto. gcc responde " + flu + ". Es un error de control de flujo: break transfiere el control al final de un ciclo o de un switch, y aquí no hay ninguno que lo contenga.",
          enlace: "El error aparece al compilar, antes de que haya un objeto que enlazar." }),
        { tipo: "opciones", titulo: "Una función definida dos veces", columna: true, correcta: "enlace",
          html: "<p><code>total.c</code>:</p>" + T.codigo(P.enlace.total) + "<p><code>principal.c</code>:</p>" + T.codigo(P.enlace.principal) +
                "<p>Los dos se compilan por separado con <code>gcc -Wall -Wextra -c</code> sin un solo aviso. Después se pide el ejecutable con <code>gcc total.o principal.o -o suma</code>. ¿Qué pasa y quién se queja?</p>",
          opciones: [
            { op: "semantico", texto: "El análisis semántico, porque total está definida dos veces.", msg: "El análisis semántico mira un archivo a la vez, y en cada uno total aparece una sola vez. Por eso los dos objetos se produjeron sin quejas." },
            { op: "enlace", texto: "El enlazador, ld, porque encuentra dos definiciones de total al juntar los objetos.", msg: "Correcto. La salida es: " + enl.join(" ") + ". Quien se queja es ld, en la cuarta etapa: es el primero que ve los dos archivos juntos." },
            { op: "nada", texto: "Nada: el enlazador usa la última definición y el programa imprime 6.", msg: "El enlazador no escoge entre dos definiciones: se niega. ld termina con error y no hay ejecutable." }
          ] }
      ]
    };
  }

  return { primerError: primerError, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
