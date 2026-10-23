/* Ejercicio interactivo: en qué cubeta cae cada clave de un unordered_map y en qué orden lo recorre g++. */
var EJERCICIO = (function () {
  /* Medido con g++ 15: con pocas claves la tabla tiene 13 cubetas. */
  var M = 13;
  var CLAVES = [27, 64, 40, 99, 12, 53, 77];
  var PRUEBA = [3, 2, 1];
  var PRUEBA_MAS = [3, 2, 1, 14];

  var CODIGO = [
    "#include <cstdio>",
    "#include <unordered_map>",
    "using std::unordered_map;",
    "",
    "int main() {",
    "  int claves[7] = {27, 64, 40, 99, 12, 53, 77};",
    "  unordered_map<int, int> u;",
    "  int i = 0;",
    "  while (i < 7) {",
    "    u[claves[i]] = i;",
    "    i = i + 1;",
    "  }",
    "  i = 0;",
    "  while (i < 7) {",
    "    printf(\"bucket(%d) = %d\\n\", claves[i], (int) u.bucket(claves[i]));",
    "    i = i + 1;",
    "  }",
    "  unordered_map<int, int>::iterator it = u.begin();",
    "  while (it != u.end()) {",
    "    printf(\" %d\", it->first);",
    "    ++it;",
    "  }",
    "  printf(\"\\n\");",
    "  return 0;",
    "}"
  ].join("\n");

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* std::hash<int> es la identidad y la cubeta es k mod m. */
  function cubeta(k, m) {
    return k % m;
  }

  /* libstdc++ guarda todos los nodos en una sola lista. Una clave cuya cubeta
     estaba vacía entra al frente de la lista; si la cubeta ya tenía nodos,
     entra justo antes del primero de ellos. */
  function insertar(lista, k, m) {
    var b = cubeta(k, m);
    var pos = -1;
    var i = 0;
    while (pos === -1 && i < lista.length) {
      if (cubeta(lista[i], m) === b) { pos = i; }
      i = i + 1;
    }
    if (pos === -1) {
      lista.unshift(k);
    } else {
      lista.splice(pos, 0, k);
    }
    return pos;
  }

  function recorrido(claves, m) {
    var lista = [];
    claves.forEach(function (k) { insertar(lista, k, m); });
    return lista;
  }

  function enOrden(claves) {
    return claves.slice().sort(function (a, b) { return a - b; });
  }

  function pasos() {
    var lista = [];
    var res = [{ texto: "la lista vacía", html: "<pre class=\"fragmento\">(vacía)</pre>" }];
    CLAVES.forEach(function (k) {
      var pos = insertar(lista, k, M);
      var porque = pos === -1
        ? "la cubeta " + cubeta(k, M) + " estaba vacía: entra al frente"
        : "la cubeta " + cubeta(k, M) + " ya tenía nodos: entra antes del primero de ellos";
      var fila = lista.map(function (x) { return x + "(" + cubeta(x, M) + ")"; }).join(" → ");
      res.push({ texto: "entra " + k + "; " + porque, html: "<pre class=\"fragmento\">" + fila + "</pre>" });
    });
    return res;
  }

  function spec() {
    var cub = CLAVES.map(function (k) { return cubeta(k, M); });
    var r = recorrido(CLAVES, M);
    var o = enOrden(CLAVES);
    var p1 = recorrido(PRUEBA, M);
    var p2 = recorrido(PRUEBA_MAS, M);
    return {
      contenedor: "tarjetas",
      cierre: "En g++, std::hash&lt;int&gt; devuelve el mismo entero y la cubeta es k mod bucket_count(). El recorrido no va de la cubeta 0 a la última: sigue una sola lista con todos los nodos, donde cada cubeta nueva entra al frente y cada clave repetida de cubeta entra antes de sus compañeras. Por eso unas pocas claves pueden salir en orden por casualidad y una más lo desarma. Calcular bucket(k) cuesta Θ(1).",
      cartas: [
        { tipo: "respuesta", titulo: "La cubeta de cada clave",
          html: "<pre class=\"fragmento\">" + esc(CODIGO) + "</pre><p>Con estas siete claves la tabla tiene <code>bucket_count() = " + M + "</code>. ¿Qué imprime <code>bucket</code> para cada una, en el orden del arreglo?</p>",
          campos: [{ rotulo: "cubetas:", esperado: cub.join(" "), pista: "a b c d e f g", ancho: "13rem" }],
          bien: "Correcto: 27, 40 y 53 van a la cubeta 1; 64, 12 y 77 a la 12; 99 queda solo en la 8.",
          distractores: [
            { valores: [CLAVES.map(function (k) { return k % 10; }).join(" ")], msg: "Ese es el último dígito, k mod 10. La tabla tiene 13 cubetas: es k mod 13." },
            { valores: [CLAVES.map(function (k, i) { return i; }).join(" ")], msg: "Esos son los valores guardados, no las cubetas. La cubeta sale de la clave." }
          ],
          otro: "Divida cada clave entre 13 y quédese con el residuo." },
        { tipo: "respuesta", titulo: "El recorrido",
          html: "<p>libstdc++ guarda todos los nodos en una sola lista enlazada. Si la cubeta de la clave nueva estaba vacía, el nodo entra al frente de la lista; si ya tenía nodos, entra justo antes del primero de ellos. El iterador recorre esa lista desde el frente. ¿Qué imprime la última línea del programa?</p>",
          campos: [{ rotulo: "recorrido:", esperado: r.join(" "), pista: "a b c d e f g", ancho: "13rem" }],
          bien: "Correcto. Es lo que imprime g++: la cubeta 8 quedó al frente porque fue la última en estrenarse, y dentro de cada cubeta la clave más reciente va primero.",
          distractores: [
            { valores: [o.join(" ")], msg: "Ese es el orden de las claves, el del map. El unordered_map no las ordena." },
            { valores: [CLAVES.join(" ")], msg: "Ese es el orden de llegada. Cada cubeta que se estrena pasa al frente de la lista." },
            { valores: ["27 40 53 99 64 12 77"], msg: "Ese sería recorrer de la cubeta 0 a la 12 con las claves en orden de llegada. La lista de g++ no sigue el número de la cubeta." },
            { valores: ["53 40 27 99 77 12 64"], msg: "Ese sería recorrer de la cubeta 0 a la 12. La lista de g++ no sigue el número de la cubeta: la última cubeta estrenada queda al frente." }
          ],
          otro: "Inserte de una en una y lleve la lista completa. Cuando la cubeta ya tiene nodos, la clave nueva entra antes del primero de ellos." },
        { tipo: "pasos", titulo: "Cómo quedó la lista",
          html: "<p>Cada nodo lleva su cubeta entre paréntesis.</p>",
          pasos: pasos() },
        { tipo: "respuesta", titulo: "Las mismas claves en un map",
          html: "<p>Si <code>u</code> fuera un <code>map&lt;int, int&gt;</code>, ¿qué imprimiría el recorrido?</p>",
          campos: [{ rotulo: "recorrido:", esperado: o.join(" "), pista: "a b c d e f g", ancho: "13rem" }],
          bien: "Correcto: el map entrega las claves de menor a mayor.",
          distractores: [
            { valores: [r.join(" ")], msg: "Ese es el recorrido del unordered_map. El map no usa cubetas." }
          ],
          otro: "Ordene las siete claves de menor a mayor." },
        { tipo: "respuesta", titulo: "Una prueba que engaña",
          html: "<p>Un programa debe imprimir las claves de menor a mayor y usa un <code>unordered_map&lt;int, int&gt;</code>. Su autor lo prueba insertando " + PRUEBA.join(", ") + ". Después el juez le manda " + PRUEBA_MAS.join(", ") + ". ¿Qué imprime el recorrido en cada caso?</p>",
          campos: [
            { rotulo: PRUEBA.join(", ") + ":", esperado: p1.join(" "), pista: "a b c", ancho: "7rem" },
            { rotulo: PRUEBA_MAS.join(", ") + ":", esperado: p2.join(" "), pista: "a b c d", ancho: "8rem" }
          ],
          bien: "Correcto. Con 3, 2 y 1 cada clave estrena cubeta y pasa al frente, así que salen en orden por casualidad. El 14 cae en la cubeta 1, la del 1, y entra antes que él: el juez recibe 14 1 2 3.",
          distractores: [
            { valores: ["3 2 1", null], msg: "Cada clave que estrena cubeta entra al frente: la última en entrar sale primero." },
            { valores: [null, "1 2 3 14"], msg: "Ese es el orden que pedía el problema. 14 mod 13 = 1: comparte cubeta con el 1 y entra antes que él." },
            { valores: [null, "14 3 2 1"], msg: "Con 3, 2 y 1 la lista quedó 1 2 3. El 14 no estrena cubeta: entra antes del 1, no al frente de todo." }
          ],
          otro: "Lleve la lista de g++ clave por clave. Calcule 14 mod 13 antes de colocar el 14." },
        { tipo: "opciones", titulo: "Lo que cuesta bucket(k)", columna: true, correcta: "uno",
          html: "<p>¿Qué cuesta <code>u.bucket(k)</code> para una clave entera?</p>",
          opciones: [
            { op: "lista", texto: "Θ(n): recorre la lista hasta encontrar k", msg: "bucket(k) no busca la clave: solo calcula a qué cubeta iría. Funciona incluso si k no está." },
            { op: "uno", texto: "Θ(1): un hash y un residuo", msg: "Correcto: std::hash&lt;int&gt; devuelve k y la cubeta es k mod m, sin recorrer nada." },
            { op: "log", texto: "O(log n), como en el map", msg: "El unordered_map no tiene un árbol que recorrer. La cubeta sale de una cuenta." }
          ] }
      ]
    };
  }

  return { m: M, claves: CLAVES, cubeta: cubeta, insertar: insertar, recorrido: recorrido, enOrden: enOrden, pasos: pasos, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
