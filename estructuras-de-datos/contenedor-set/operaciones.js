/* Ejercicio interactivo: predecir lo que imprime un programa con set<int>.
   La salida la calcula la simulacion del set con un arreglo ordenado, y
   coincide con la del programa compilado. */
var EJERCICIO = (function () {
  var C = typeof module !== "undefined" ? require("./conjunto.js") : Conjunto;
  var PASAN = [73, 18, 55, 18, 91, 40, 55, 26, 73, 64];

  var PROGRAMA = [
    "#include <cstdio>",
    "#include <set>",
    "using std::set;",
    "",
    "void imprimir(set<int> &s) {",
    "  set<int>::iterator it = s.begin();",
    "  while (it != s.end()) {",
    "    printf(\"%d \", *it);",
    "    ++it;",
    "  }",
    "  printf(\"(%d)\\n\", (int) s.size());",
    "}",
    "",
    "int main() {",
    "  int pasan[10] = {" + PASAN.join(", ") + "};",
    "  set<int> buses;",
    "  int repetidos = 0;",
    "  int i = 0;",
    "  while (i < 10) {",
    "    if (buses.count(pasan[i]) == 1) {",
    "      repetidos = repetidos + 1;",
    "    } else {",
    "      buses.insert(pasan[i]);",
    "    }",
    "    i = i + 1;",
    "  }",
    "  printf(\"distintos: %d, repetidos: %d\\n\", (int) buses.size(), repetidos);",
    "  set<int>::iterator it = buses.find(55);",
    "  ++it;",
    "  printf(\"despues del 55: %d\\n\", *it);",
    "  buses.erase(it);",
    "  printf(\"erase(40): %d\\n\", (int) buses.erase(40));",
    "  printf(\"erase(41): %d\\n\", (int) buses.erase(41));",
    "  it = buses.end();",
    "  --it;",
    "  printf(\"menor: %d, mayor: %d\\n\", *buses.begin(), *it);",
    "  imprimir(buses);",
    "  return 0;",
    "}"
  ];

  /* Corre el programa sobre el set simulado y devuelve sus lineas de
     salida y el estado despues de cada llegada. */
  function correr() {
    var s = C.nuevo();
    var rep = 0;
    var filas = [];
    PASAN.forEach(function (k) {
      var estaba = C.count(s, k) === 1;
      if (estaba) { rep = rep + 1; } else { C.insert(s, k); }
      filas.push([String(k), estaba ? "sí" : "no", C.texto(s), String(s.a.length)]);
    });
    var sal = [];
    sal.push("distintos: " + s.a.length + ", repetidos: " + rep);
    var it = C.find(s, 55) + 1;
    var despues = s.a[it];
    sal.push("despues del 55: " + despues);
    C.eraseEn(s, it);
    sal.push("erase(40): " + C.erase(s, 40));
    sal.push("erase(41): " + C.erase(s, 41));
    sal.push("menor: " + s.a[0] + ", mayor: " + s.a[s.a.length - 1]);
    sal.push(C.texto(s) + " (" + s.a.length + ")");
    return { salida: sal, filas: filas, despues: despues, rep: rep, final: s };
  }

  function spec() {
    var r = correr();
    var dist = r.filas[r.filas.length - 1][3];
    return {
      contenedor: "tarjetas",
      cierre: "<p>Un set guarda cada clave una vez y siempre en orden. count dice 0 o 1, find da un iterador a la clave, ++it va a la siguiente clave del set, y erase(k) dice cuántas quitó. erase(it) quita la clave a la que apunta el iterador sin volver a buscarla. end() queda después del mayor y hay que retrocederlo una vez para llegar al último.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Buses en un peaje",
          html: "<p>Un peaje anota el número de cada bus que pasa. El programa lleva los números distintos en un <code>set</code> y cuenta las pasadas repetidas.</p>" + C.codigo(PROGRAMA) +
                "<p>¿Qué imprime la primera línea?</p>",
          campos: [
            { rotulo: "distintos:", esperado: dist, ancho: "3rem" },
            { rotulo: "repetidos:", esperado: String(r.rep), ancho: "3rem" }
          ],
          bien: "Correcto. El 18, el 55 y el 73 pasan dos veces: la segunda vez count da 1 y se suman a repetidos. Quedan 7 números distintos.",
          distractores: [
            { valores: ["10", null], msg: "size() cuenta las claves del set, no las pasadas. Las repetidas no entran." },
            { valores: [null, "6"], msg: "Se cuentan las pasadas de más, no los buses: el 18 cuenta una sola vez, por su segunda pasada." }
          ],
          otro: "Siga el ciclo pasada por pasada y anote el contenido del set." },
        { tipo: "tabla", titulo: "Pasada por pasada", cabecera: ["pasa", "¿ya estaba?", "contenido del set", "size()"],
          filas: r.filas, boton: "Mostrar la pasada siguiente",
          nota: "Antes de mostrar cada fila, diga dónde queda el número nuevo dentro del set." },
        { tipo: "respuesta", titulo: "find, ++it y erase",
          html: "<p>Después del ciclo, ¿qué imprimen las tres líneas siguientes?</p>",
          campos: [
            { rotulo: "después del 55:", esperado: String(r.despues), ancho: "3rem" },
            { rotulo: "erase(40):", esperado: r.salida[2].split(": ")[1], ancho: "3rem" },
            { rotulo: "erase(41):", esperado: r.salida[3].split(": ")[1], ancho: "3rem" }
          ],
          bien: "Correcto. ++it va a la clave siguiente en orden, el 64, aunque el 64 fue el último en llegar. erase(it) lo quita. erase(40) quita una clave y devuelve 1; el 41 nunca estuvo y da 0.",
          distractores: [
            { valores: ["91", null, null], msg: "El 91 pasó justo después del primer 55, pero el set no recuerda el orden de llegada: ++it va a la siguiente clave en orden." },
            { valores: ["56", null, null], msg: "++it no suma 1: va a la siguiente clave que hay en el set." },
            { valores: [null, "40", null], msg: "erase(k) no devuelve la clave: devuelve cuántas quitó, 0 o 1." }
          ],
          otro: "Ordene las claves del set y busque la que sigue al 55." },
        { tipo: "respuesta", titulo: "Lo que queda",
          html: "<p>¿Qué imprimen las dos últimas líneas?</p>",
          campos: [
            { rotulo: "menor:", esperado: String(r.final.a[0]), ancho: "3rem" },
            { rotulo: "mayor:", esperado: String(r.final.a[r.final.a.length - 1]), ancho: "3rem" },
            { rotulo: "imprimir:", esperado: r.salida[5], ancho: "13rem", pista: "como sale, con el (size)" }
          ],
          bien: "Correcto. Se fueron el 64 y el 40. begin() da el menor; end() queda después del 91 y --it lo trae de vuelta.",
          distractores: [
            { valores: [null, "64", null], msg: "El 64 se borró con erase(it). El mayor que queda es el 91." },
            { valores: [null, null, "18 26 40 55 73 91 (6)"], msg: "El 40 también se fue, con erase(40), que devolvió 1." }
          ],
          otro: "Escriba la última línea tal como la imprime el programa, con el tamaño entre paréntesis." },
        { tipo: "opciones", titulo: "Sin el count", columna: true, correcta: "igual",
          html: "<p>Si el <code>if</code> se cambia por un <code>buses.insert(pasan[i]);</code> a secas, ¿qué pasa con el set?</p>",
          opciones: [
            { op: "igual", texto: "Queda igual: insert de una clave que ya está no hace nada. Lo que se pierde es la cuenta de repetidos.", msg: "Correcto. insert busca la clave y, si la encuentra, no la agrega. Para contar repetidos hace falta saber si estaba." },
            { op: "dobles", texto: "Quedan los repetidos dos veces y size() vale 10.", msg: "El set nunca guarda una clave dos veces. Para contar repeticiones se usa un map con la cuenta." },
            { op: "error", texto: "El programa falla al insertar el segundo 18.", msg: "Insertar una clave que ya está es válido; simplemente no cambia nada." }
          ] }
      ]
    };
  }

  return { PASAN: PASAN, PROGRAMA: PROGRAMA, correr: correr, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
