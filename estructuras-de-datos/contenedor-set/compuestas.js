/* Ejercicio interactivo: estrategia para UVa 10391, Compound Words, con un
   set<string>. Las salidas las calcula la simulacion de los cortes. */
var EJERCICIO = (function () {
  var ENUNCIADO = "https://onlinejudge.org/external/103/10391.pdf";
  var ENVIO = "https://onlinejudge.org/index.php?option=com_onlinejudge&Itemid=25&page=submit_problem&problemid=1332";
  var EJEMPLO = ["a", "alien", "born", "less", "lien", "never", "nevertheless", "new", "newborn", "the", "zebra"];
  var PROPIO = ["a", "ar", "bar", "barco", "co", "copa", "cos", "cosa", "gira", "girasol", "pa", "sa", "sol", "solar"];
  var MAX = 120000;

  /* Prueba los cortes 1 .. largo - 1 y para en el primero que sirve.
     Devuelve {compuesta, cortes}: cuantos cortes probo. */
  function revisar(dicc, w) {
    var corte = 1;
    var hallada = false;
    var probados = 0;
    while (corte < w.length && !hallada) {
      probados = probados + 1;
      if (dicc.indexOf(w.substring(0, corte)) !== -1 && dicc.indexOf(w.substring(corte)) !== -1) {
        hallada = true;
      }
      corte = corte + 1;
    }
    return { compuesta: hallada, cortes: probados };
  }

  function compuestas(dicc) {
    return dicc.filter(function (w) { return revisar(dicc, w).compuesta; });
  }

  function spec() {
    var salEj = compuestas(EJEMPLO);
    var salPr = compuestas(PROPIO);
    return {
      contenedor: "tarjetas",
      cierre: "<p>El diccionario entra a un set&lt;string&gt;, y cada palabra se parte en todos los cortes posibles, del primero al penúltimo carácter, preguntando si las dos partes están. Ninguna parte puede quedar vacía, la búsqueda para en el primer corte que sirve y la palabra se imprime una vez. Como la entrada ya llega en orden alfabético, recorrerla en ese orden da la salida en orden.</p>",
      cartas: [
        { tipo: "opciones", titulo: "UVa 10391, Compound Words", columna: true, correcta: "tres",
          html: "<p>Enunciado: <code>" + ENUNCIADO + "</code><br>Envío: <code>" + ENVIO.replace(/&/g, "&amp;") + "</code></p>" +
                "<p>Llegan hasta " + MAX + " palabras en minúscula, una por línea y en orden alfabético. Hay que imprimir, en orden, las que son la unión de exactamente dos palabras del diccionario.</p>" +
                "<p>En el ejemplo del enunciado el diccionario es <code>" + EJEMPLO.join(" ") + "</code> y la salida es <code>" + salEj.join(" ") + "</code>. ¿Por qué no sale <code>nevertheless</code>, si todas sus partes están?</p>",
          opciones: [
            { op: "tres", texto: "Porque se arma con tres palabras, never, the y less, y ningún corte la deja en dos que estén.", msg: "Correcto. neverthe y less no sirve porque neverthe no está; never y theless tampoco. Pide exactamente dos." },
            { op: "largo", texto: "Porque es la palabra más larga y el problema no la cuenta.", msg: "El largo no importa. Pruebe sus cortes: ninguno deja dos palabras del diccionario." },
            { op: "orden", texto: "Porque never aparece antes que nevertheless en la entrada.", msg: "newborn sale aunque new y born no aparecen después. El orden de la entrada no decide." }
          ] },
        { tipo: "opciones", titulo: "Cómo atacarlo", columna: true, correcta: "pares",
          html: "<p>Tres ideas para hallar las compuestas. ¿Cuál se descarta por tiempo?</p>",
          opciones: [
            { op: "pares", texto: "Probar todos los pares de palabras, concatenarlos y buscar el resultado en el diccionario.", msg: "Correcto, se descarta. Con " + MAX + " palabras son " + MAX + "² ≈ 1,4 × 10¹⁰ pares, demasiados aunque cada búsqueda cueste poco." },
            { op: "set", texto: "Guardar el diccionario en un set<string> y, para cada palabra, probar cada corte y preguntar con count si las dos partes están.", msg: "Esta sirve: una palabra de L letras tiene L − 1 cortes, y cada count cuesta O(L log W). Es la estrategia de esta actividad." },
            { op: "vector", texto: "Dejar las palabras en el vector, que ya viene ordenado, y buscar cada parte con búsqueda binaria.", msg: "También sirve y cuesta lo mismo: la entrada llega ordenada, así que el vector ya admite búsqueda binaria. El set no aprovecha ese orden, pero no hace falta pensar en él." }
          ] },
        { tipo: "respuesta", titulo: "Un diccionario propio",
          html: "<p>Con este diccionario, en el orden en que llega:</p><p><code>" + PROPIO.join(" ") + "</code></p><p>¿Qué palabras imprime el programa, en orden? ¿Cuántas son?</p>",
          campos: [
            { rotulo: "salida:", esperado: salPr.join(" "), ancho: "16rem" },
            { rotulo: "cuántas:", esperado: String(salPr.length), ancho: "3rem" }
          ],
          bien: "Correcto. cosa se arma de dos maneras, co y sa o cos y a, y sale una sola vez porque la búsqueda para en el primer corte que sirve. gira no tiene ningún corte con las dos partes adentro.",
          distractores: [
            { valores: [salPr.slice(0, 3).concat(["cosa"], salPr.slice(3)).join(" "), null], msg: "cosa se imprime una sola vez: en cuanto un corte sirve, se deja de probar." },
            { valores: [null, String(salPr.length + 1)], msg: "Una palabra que se arma de dos maneras se cuenta una sola vez." }
          ],
          otro: "Para cada palabra pruebe todos los cortes: la parte de la izquierda y la de la derecha tienen que estar las dos." },
        { tipo: "respuesta", titulo: "Cortes que se prueban",
          html: "<p>¿Cuántos cortes prueba el programa con <code>girasol</code> antes de parar? ¿Y con <code>gira</code>?</p>",
          campos: [
            { rotulo: "girasol:", esperado: String(revisar(PROPIO, "girasol").cortes), ancho: "3rem" },
            { rotulo: "gira:", esperado: String(revisar(PROPIO, "gira").cortes), ancho: "3rem" }
          ],
          bien: "Correcto. girasol prueba g, gi y gir antes de dar con gira y sol, en el cuarto corte. gira no es compuesta y prueba sus tres cortes: g y ira, gi y ra, gir y a.",
          distractores: [
            { valores: ["6", null], msg: "6 son todos los cortes de una palabra de 7 letras. La búsqueda para en el cuarto, el que funciona." },
            { valores: [null, "4"], msg: "Una palabra de 4 letras tiene 3 cortes con las dos partes no vacías." }
          ],
          otro: "Un corte deja al menos una letra a cada lado: una palabra de L letras tiene L − 1." },
        { tipo: "opciones", titulo: "El orden de la salida", columna: true, correcta: "no",
          html: "<p>El programa revisa las palabras en el orden en que llegaron y va imprimiendo las compuestas. ¿Hace falta ordenar algo antes de imprimir?</p>",
          opciones: [
            { op: "no", texto: "No: la entrada llega en orden alfabético, y las compuestas salen en ese mismo orden.", msg: "Correcto. El enunciado garantiza el orden de la entrada, y el recorrido lo conserva. El set se usa para preguntar, no para ordenar." },
            { op: "sort", texto: "Sí: hay que guardarlas en un vector y ordenarlo con sort al final.", msg: "Daría lo mismo, pagando un Θ(c log c) que sobra: las compuestas ya aparecen en orden." },
            { op: "set", texto: "Sí: hay que recorrer el set, porque el vector de entrada pierde el orden.", msg: "El vector guarda las palabras en el orden de llegada, que ya es alfabético; no pierde nada." }
          ] }
      ]
    };
  }

  return { ENUNCIADO: ENUNCIADO, ENVIO: ENVIO, EJEMPLO: EJEMPLO, PROPIO: PROPIO, revisar: revisar, compuestas: compuestas, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
