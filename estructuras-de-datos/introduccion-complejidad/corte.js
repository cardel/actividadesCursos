/* Ejercicio interactivo: el mismo código, dos comportamientos. Una búsqueda
   desde el final que se detiene en el primer cero que encuentra. Los
   conteos coinciden con el programa instrumentado. */
var EJERCICIO = (function () {
  var ULTIMO_CERO = [
    "int ultimo_cero(int datos[], int n) {",
    "    int pos = -1;",
    "    int i = n - 1;",
    "    while (i >= 0 && pos == -1) {",
    "        if (datos[i] == 0) {",
    "            pos = i;",
    "        }",
    "        i = i - 1;",
    "    }",
    "    return pos;",
    "}"
  ];

  var DOS_CEROS = [4, 0, 7, 0, 2];
  var AL_FINAL = [4, 6, 7, 3, 0];
  var SIN_CEROS = [4, 6, 7, 3, 2];

  /* Conteo por línea: 1 y 2 inicializan, 3 es la condición, 4 el if,
     5 la asignación, 6 el decremento y 7 el return. */
  function contar(d) {
    var L = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    var n = d.length;
    L[1] += 1; var pos = -1;
    L[2] += 1; var i = n - 1;
    var sigue = true;
    while (sigue) {
      L[3] += 1;
      if (i >= 0 && pos === -1) {
        L[4] += 1;
        if (d[i] === 0) { L[5] += 1; pos = i; }
        L[6] += 1; i = i - 1;
      } else {
        sigue = false;
      }
    }
    L[7] += 1;
    var T = 0;
    Object.keys(L).forEach(function (k) { T = T + L[k]; });
    return { L: L, T: T, pos: pos };
  }

  function escapar(x) { return x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function codigo(lineas) { return "<pre class=\"fragmento\">" + escapar(lineas.join("\n")) + "</pre>"; }
  function arreglo(d) { return "<code>{" + d.join(", ") + "}</code>"; }

  function spec() {
    var dos = contar(DOS_CEROS);
    var fin = contar(AL_FINAL);
    var sin = contar(SIN_CEROS);
    return {
      contenedor: "tarjetas",
      cierre: "<p>Con la condición compuesta, el ciclo se detiene en cuanto encuentra lo que busca. Si el cero está en la última casilla, T = 8 sin importar n: el mejor caso es constante. Si no hay ceros, recorre todo y T(n) = 3n + 4: el peor caso es lineal. Lo que decide no es el tamaño del arreglo sino dónde está el cero. Si no se dice otra cosa, se reporta el peor caso, porque es la cota que se cumple con cualquier entrada.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Dos ceros",
          html: codigo(ULTIMO_CERO) + "<p>Se llama <code>ultimo_cero(datos, 5)</code> con " + arreglo(DOS_CEROS) + ". ¿Qué devuelve y cuántas instrucciones ejecuta?</p>",
          campos: [
            { rotulo: "devuelve:", esperado: String(dos.pos), ancho: "3rem" },
            { rotulo: "instrucciones:", esperado: String(dos.T), ancho: "3rem" }
          ],
          bien: "Correcto. Empieza en i = 4, con el 2; sigue con i = 3, encuentra el cero y pos pasa a 3. En la tercera evaluación pos == -1 ya es falso y sale. T = 2 + 3 + 2 + 1 + 2 + 1 = 11.",
          distractores: [
            { valores: ["1", null], msg: "El recorrido va desde el final: el primer cero que encuentra es el de la posición 3. El de la posición 1 nunca se visita." },
            { valores: [null, String(sin.T)], msg: "Ese sería el recorrido completo. Al encontrar el cero, pos cambia y la condición del while corta el ciclo." },
            { valores: [null, "10"], msg: "Falta la evaluación que saca del ciclo: con i = 2, i >= 0 es cierto y pos == -1 es falso. Esa tercera evaluación también cuenta." }
          ],
          otro: "Haga la traza desde i = 4 hacia atrás y anote en cada vuelta qué líneas se ejecutan." },
        { tipo: "respuesta", titulo: "Los dos extremos",
          html: "<p>Con n = 5, el mejor caso es " + arreglo(AL_FINAL) + ", con el cero en la última casilla, y el peor es " + arreglo(SIN_CEROS) + ", sin ceros. ¿Cuántas instrucciones ejecuta cada uno?</p>",
          campos: [
            { rotulo: "mejor:", esperado: String(fin.T), ancho: "3rem" },
            { rotulo: "peor:", esperado: String(sin.T), ancho: "3rem" }
          ],
          bien: "Correcto. En el mejor caso: dos inicializaciones, dos evaluaciones, un if, una asignación, un decremento y el return, 8. En el peor, la condición se evalúa 6 veces y el if y el decremento 5 cada uno: 19, que es 3 · 5 + 4.",
          distractores: [
            { valores: ["7", null], msg: "Falta la segunda evaluación de la condición, la que da falso porque pos ya no es -1." },
            { valores: [null, "18"], msg: "Falta la evaluación con i = -1, la que da falso: la condición se evalúa n + 1 = 6 veces." },
            { valores: [null, "24"], msg: "Sin ceros, la asignación pos = i nunca se ejecuta: el if se pregunta 5 veces y nunca entra." }
          ],
          otro: "Cuente por línea en cada caso: condición del while, if, asignación y decremento." },
        { tipo: "opciones", titulo: "En términos de n", columna: true, correcta: "lineal",
          html: "<p>Para un arreglo de n casillas, ¿cuánto vale T en el mejor y en el peor caso?</p>",
          opciones: [
            { op: "cuatro", texto: "8 en el mejor caso y 4n + 4 en el peor.", msg: "En el peor caso no hay ceros, así que pos = i nunca se ejecuta. Quedan la condición, el if y el decremento: 3n + 4." },
            { op: "mitad", texto: "8 en el mejor caso y 3n/2 + 4 en el peor, porque en promedio el cero está a la mitad.", msg: "Eso mezcla el caso promedio con el peor. El peor caso es la entrada que obliga a más trabajo, y es la que no tiene ceros." }
          ,
            { op: "lineal", texto: "8 en el mejor caso y 3n + 4 en el peor.", msg: "Correcto. El mejor caso no depende de n: con un millón de casillas, si el cero está al final, son las mismas 8 instrucciones. El peor es lineal." },
            { op: "ambos", texto: "3n + 4 en los dos casos, porque el ciclo depende de n.", msg: "El ciclo puede salir antes de recorrer todo: con el cero al final da una sola vuelta, tenga el arreglo 5 casillas o un millón." }] },
        { tipo: "opciones", titulo: "Cuál se reporta", columna: true, correcta: "peor",
          html: "<p>Hay que decir cuánto cuesta <code>ultimo_cero</code> sin saber qué arreglos va a recibir. ¿Cuál de los dos casos se reporta?</p>",
          opciones: [
            { op: "ninguno", texto: "Ninguno: el costo no se puede decir sin conocer los datos.", msg: "Sí se puede dar una garantía: el peor caso acota el costo para cualquier entrada de tamaño n." }
          ,
            { op: "mejor", texto: "El mejor caso, porque es lo que pasa cuando el programa funciona bien.", msg: "El mejor caso no promete nada sobre las demás entradas: basta un arreglo sin ceros para que el costo sea lineal." },
            { op: "peor", texto: "El peor caso, porque es una cota que se cumple con cualquier entrada.", msg: "Correcto. Sea cual sea el arreglo, ultimo_cero no ejecuta más de 3n + 4 instrucciones. El caso promedio exige suponer cómo vienen los datos, y el peor no necesita suponer nada." }] }
      ]
    };
  }

  return { DOS_CEROS: DOS_CEROS, AL_FINAL: AL_FINAL, SIN_CEROS: SIN_CEROS, contar: contar, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
