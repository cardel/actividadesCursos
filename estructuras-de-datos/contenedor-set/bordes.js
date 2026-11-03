/* Ejercicio interactivo: lower_bound, upper_bound, el anterior a una
   clave y contar las claves de un intervalo, sobre las salidas de un tren. */
var EJERCICIO = (function () {
  var C = typeof module !== "undefined" ? require("./conjunto.js") : Conjunto;
  var SALIDAS = [12, 27, 33, 48, 61, 75, 86];

  var PROGRAMA = [
    "#include <cstdio>",
    "#include <set>",
    "using std::set;",
    "",
    "int contar(set<int> &s, int a, int b) {",
    "  int n = 0;",
    "  set<int>::iterator it = s.lower_bound(a);",
    "  set<int>::iterator hasta = s.upper_bound(b);",
    "  while (it != hasta) {",
    "    n = n + 1;",
    "    ++it;",
    "  }",
    "  return n;",
    "}",
    "",
    "int main() {",
    "  int salidas[7] = {" + SALIDAS.join(", ") + "};",
    "  set<int> t;",
    "  int i = 0;",
    "  while (i < 7) {",
    "    t.insert(salidas[i]);",
    "    i = i + 1;",
    "  }",
    "  printf(\"lower_bound(33): %d\\n\", *t.lower_bound(33));",
    "  printf(\"upper_bound(33): %d\\n\", *t.upper_bound(33));",
    "  printf(\"lower_bound(52): %d\\n\", *t.lower_bound(52));",
    "  printf(\"upper_bound(86) == end(): %d\\n\", (int) (t.upper_bound(86) == t.end()));",
    "  set<int>::iterator it = t.lower_bound(52);",
    "  --it;",
    "  printf(\"antes del 52: %d\\n\", *it);",
    "  printf(\"en [27, 61]: %d\\n\", contar(t, 27, 61));",
    "  printf(\"en [62, 74]: %d\\n\", contar(t, 62, 74));",
    "  return 0;",
    "}"
  ];

  function contar(s, a, b) { return C.upperBound(s, b) - C.lowerBound(s, a); }

  /* Las lineas que imprime el programa, calculadas sobre el set simulado. */
  function correr() {
    var s = C.de(SALIDAS);
    var sal = [];
    sal.push("lower_bound(33): " + s.a[C.lowerBound(s, 33)]);
    sal.push("upper_bound(33): " + s.a[C.upperBound(s, 33)]);
    sal.push("lower_bound(52): " + s.a[C.lowerBound(s, 52)]);
    sal.push("upper_bound(86) == end(): " + (C.upperBound(s, 86) === C.fin(s) ? 1 : 0));
    sal.push("antes del 52: " + s.a[C.lowerBound(s, 52) - 1]);
    sal.push("en [27, 61]: " + contar(s, 27, 61));
    sal.push("en [62, 74]: " + contar(s, 62, 74));
    return sal;
  }

  function valor(linea) { return linea.split(": ")[1]; }

  function spec() {
    var sal = correr();
    var s = C.de(SALIDAS);
    return {
      contenedor: "tarjetas",
      cierre: "<p>lower_bound(x) da la primera clave mayor o igual que x y upper_bound(x), la primera estrictamente mayor; si no hay, end(). La clave anterior a x es la que está justo antes de lower_bound(x), siempre que lower_bound(x) no sea begin(). Entre lower_bound(a) y upper_bound(b) quedan las claves de [a, b], y contarlas cuesta O(log n + m): dos bajadas por el árbol y un avance por cada clave del intervalo.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "El próximo tren",
          html: "<p>Un tren sale a estos minutos después de las seis: " + SALIDAS.join(", ") + ". El programa los guarda en un <code>set</code> y responde preguntas sobre los horarios.</p>" + C.codigo(PROGRAMA) +
                "<p>¿Qué imprimen las cuatro primeras líneas?</p>",
          campos: [
            { rotulo: "lower_bound(33):", esperado: valor(sal[0]), ancho: "3rem" },
            { rotulo: "upper_bound(33):", esperado: valor(sal[1]), ancho: "3rem" },
            { rotulo: "lower_bound(52):", esperado: valor(sal[2]), ancho: "3rem" },
            { rotulo: "== end():", esperado: valor(sal[3]), ancho: "3rem" }
          ],
          bien: "Correcto. El 33 está, así que lower_bound lo devuelve a él y upper_bound salta al siguiente. El 52 no está: lower_bound da el primero que viene, el 61. Ninguna salida pasa del 86, y upper_bound(86) es end().",
          distractores: [
            { valores: ["48", null, null, null], msg: "lower_bound pide mayor o igual: si la clave está, la devuelve a ella." },
            { valores: [null, "33", null, null], msg: "upper_bound pide estrictamente mayor: se salta el 33." },
            { valores: [null, null, "48", null], msg: "El 48 es menor que 52. lower_bound nunca devuelve una clave menor que x." },
            { valores: [null, null, null, "0"], msg: "upper_bound(86) busca una clave mayor que 86 y no la hay: devuelve end(), y la comparación da 1." }
          ],
          otro: "Ubique cada x entre las salidas ordenadas y mire si pide ≥ o >." },
        { tipo: "respuesta", titulo: "El anterior y los intervalos",
          html: "<p>¿Qué imprimen las tres últimas líneas?</p>",
          campos: [
            { rotulo: "antes del 52:", esperado: valor(sal[4]), ancho: "3rem" },
            { rotulo: "en [27, 61]:", esperado: valor(sal[5]), ancho: "3rem" },
            { rotulo: "en [62, 74]:", esperado: valor(sal[6]), ancho: "3rem" }
          ],
          bien: "Correcto. Retroceder desde el 61 da el 48, el último tren antes del minuto 52. En [27, 61] están 27, 33, 48 y 61: los dos extremos cuentan porque uno se busca con lower_bound y el otro con upper_bound. En [62, 74] no sale ningún tren: los dos iteradores apuntan al 75 y el ciclo no da vueltas.",
          distractores: [
            { valores: [null, "3", null], msg: "Los extremos cuentan: el intervalo es cerrado. upper_bound(61) apunta al 75, así que el 61 queda adentro." },
            { valores: [null, "2", null], msg: "El 27 y el 61 están en el set y en el intervalo: cuentan los dos." },
            { valores: ["61", null, null], msg: "El 61 es lower_bound(52). El programa retrocede una vez desde ahí." }
          ],
          otro: "contar avanza desde lower_bound(a) hasta upper_bound(b) sin incluir este último." },
        { tipo: "opciones", titulo: "Antes del primero", columna: true, correcta: "begin",
          html: "<p>Alguien cambia el 52 por un 5 en las dos líneas del anterior: <code>it = t.lower_bound(5); --it;</code>. ¿Qué pasa?</p>",
          opciones: [
            { op: "begin", texto: "lower_bound(5) es begin(), el 12, y antes de begin() no hay nada: retroceder ahí es un error del programa.", msg: "Correcto. Antes de retroceder hay que preguntar si el iterador es begin(). Si lo es, no hay tren antes." },
            { op: "end", texto: "--it da end(), y la línea imprime basura sin más consecuencias.", msg: "end() queda después del mayor, no antes del menor. Retroceder desde begin() no tiene ningún lugar válido a donde ir." },
            { op: "ultimo", texto: "--it da la vuelta y llega al 86, el último.", msg: "El set no es circular: retroceder desde begin() no lleva al último." }
          ] },
        { tipo: "opciones", titulo: "El lower_bound de afuera", columna: true, correcta: "lineal",
          html: "<p>En lugar de <code>t.lower_bound(a)</code>, alguien escribe <code>lower_bound(t.begin(), t.end(), a)</code>, el de <code>&lt;algorithm&gt;</code>. Con n salidas, ¿qué cuesta?</p>",
          opciones: [
            { op: "lineal", texto: "Θ(n): compila y da lo mismo, pero sobre un set avanza el iterador de uno en uno.", msg: "Correcto. El de <algorithm> hace búsqueda binaria contando pasos de iterador, y en un set cada paso es un ++it. El del set baja por el árbol en O(log n)." },
            { op: "log", texto: "O(log n): es una búsqueda binaria.", msg: "Lo es en un vector, donde saltar a la mitad cuesta Θ(1). En un set no hay saltos: llegar a la mitad son n/2 avances." },
            { op: "error", texto: "No compila: el de &lt;algorithm&gt; solo sirve con vector.", msg: "Sí compila con los iteradores del set. Por eso la trampa pasa desapercibida." }
          ] }
      ]
    };
  }

  return { SALIDAS: SALIDAS, PROGRAMA: PROGRAMA, correr: correr, contar: contar, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
