/* Ejercicio interactivo: contar palabras con map<string, int> y recorrerlas en orden. */
var EJERCICIO = (function () {
  var ENTRADA = ["rio", "cerro", "rio", "valle", "cerro", "rio"];

  /* veces[clave] = veces[clave] + 1 sobre un map simulado, ordenado por la clave. */
  function sumar(m, k) {
    var i = 0;
    while (i < m.length && m[i][0] < k) { i = i + 1; }
    if (i === m.length || m[i][0] !== k) { m.splice(i, 0, [k, 0]); }
    m[i][1] = m[i][1] + 1;
  }

  function texto(m) {
    return m.map(function (p) { return "(" + p[0] + ", " + p[1] + ")"; }).join(" ");
  }

  /* Estado del map tras cada palabra leida. */
  function estados() {
    var m = [];
    return ENTRADA.map(function (w) { sumar(m, w); return texto(m); });
  }

  /* Lo que imprime el recorrido final: palabra y cuenta, de menor a mayor. */
  function salida() {
    var m = [];
    ENTRADA.forEach(function (w) { sumar(m, w); });
    return m.map(function (p) { return p[0] + " " + p[1]; });
  }

  /* Con map<char *, int> todas las palabras son la misma clave: la direccion del arreglo. */
  function salidaPunteros() {
    return ENTRADA[ENTRADA.length - 1] + " " + ENTRADA.length;
  }

  function spec() {
    var e = estados();
    var s = salida();
    return {
      contenedor: "tarjetas",
      cierre: "El map de palabras compara con el orden alfabético de string, así que el recorrido sale ordenado sin llamar a sort. La clave tiene que ser un string: un char * se compara por dirección, y todas las palabras leídas en el mismo arreglo serían la misma clave.",
      cartas: [
        { tipo: "tabla", titulo: "Palabra por palabra",
          html: "<p>Se lee <code>" + ENTRADA.join(" ") + "</code> con <code>scanf(\"%s\", pal)</code>, se copia a <code>string clave = pal;</code> y se hace <code>veces[clave] = veces[clave] + 1</code>. Antes de mostrar cada fila, diga cómo queda el map.</p>",
          cabecera: ["Palabra leída", "El map, en orden"],
          filas: ENTRADA.map(function (w, i) { return [w, e[i]]; }),
          nota: "Cerro entra delante de rio aunque llegó después: c va antes que r." },
        { tipo: "respuesta", titulo: "El recorrido final",
          html: "<p>Un iterador recorre el map e imprime <code>it-&gt;first</code> y <code>it-&gt;second</code>. Escriba las tres líneas, separadas por punto y coma.</p>",
          campos: [{ rotulo: "salida:", esperado: s.join("; "), pista: "palabra n; ...", ancho: "16rem" }],
          bien: "Correcto: orden alfabético, con la cuenta de cada palabra.",
          distractores: [
            { valores: ["rio 3; cerro 2; valle 1"], msg: "Ese es el orden de primera aparición. El map ordena por la clave: cerro, rio, valle." },
            { valores: ["valle 1; rio 3; cerro 2"], msg: "El iterador va de la menor clave a la mayor, no al revés." }
          ],
          otro: "Ordene las tres palabras alfabéticamente y ponga a cada una su cuenta." },
        { tipo: "opciones", titulo: "Si la clave fuera char *", columna: true, correcta: "una",
          html: "<p>Alguien declara <code>map&lt;char *, int&gt; veces;</code> y usa <code>veces[pal]</code> con el arreglo <code>char pal[101]</code> donde lee cada palabra. ¿Qué imprime el recorrido?</p>",
          opciones: [
            { op: "una", texto: "Una sola línea: <code>" + salidaPunteros() + "</code>", msg: "Correcto. Las seis palabras se leen en el mismo arreglo: la clave es siempre la misma dirección, que cuenta 6, y al imprimirla se ve la última palabra leída." },
            { op: "igual", texto: "Lo mismo que con string", msg: "Dos char * se comparan por la dirección que guardan, no por las letras. Todas las palabras tienen la misma dirección: la de pal." },
            { op: "seis", texto: "Seis líneas, una por palabra leída, cada una con 1", msg: "Para eso cada palabra tendría que tener su propia dirección. Aquí todas se leen en el mismo arreglo." }
          ] }
      ]
    };
  }

  return { entrada: ENTRADA, estados: estados, salida: salida, salidaPunteros: salidaPunteros, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
