/* La cola de prioridad para las actividades: una priority_queue modelada
   por su comparador, con el código exacto de los tres programas de las
   actividades. En los tres el orden es total, así que la salida no depende
   de cómo desempata la biblioteca. */
var Cola = (function () {
  /* menor(a, b) dice si a sale después de b; top es la que ninguna supera. */
  function nueva(menor) {
    var datos = [];
    function top() {
      var mejor = datos[0];
      datos.forEach(function (x) { if (menor(mejor, x)) { mejor = x; } });
      return mejor;
    }
    return {
      push: function (x) { datos.push(x); },
      top: top,
      pop: function () {
        var t = top();
        datos.splice(datos.indexOf(t), 1);
      },
      empty: function () { return datos.length === 0; },
      size: function () { return datos.length; }
    };
  }

  function mayorPrimero(a, b) { return a < b; }
  function menorPrimero(a, b) { return a > b; }

  function vaciar(pq, ver) {
    var salida = [];
    while (!pq.empty()) {
      salida.push(ver ? ver(pq.top()) : pq.top());
      pq.pop();
    }
    return salida;
  }

  /* enteros.cpp, línea por línea. */
  function enteros() {
    var pq = nueva(mayorPrimero);
    var lineas = [];
    pq.push(23);
    pq.push(8);
    pq.push(41);
    lineas.push(String(pq.top()));
    pq.pop();
    pq.push(17);
    pq.push(35);
    pq.pop();
    lineas.push(pq.top() + " " + pq.size());
    lineas.push(" " + vaciar(pq).join(" "));
    return lineas;
  }

  var DATOS_MENOR = [52, 19, 74, 6, 33, 19];

  /* menor.cpp, y la misma entrada con el comparador al revés. */
  function conComparador(menor, datos) {
    var pq = nueva(menor);
    datos.forEach(function (x) { pq.push(x); });
    return vaciar(pq);
  }

  var PRIORIDADES = [2, 5, 2, 3, 5, 1];

  /* llamadas.cpp: operator< con desempate por turno. */
  function llamadaMenor(a, b) {
    var menor;
    if (a.prioridad !== b.prioridad) {
      menor = a.prioridad < b.prioridad;
    } else {
      menor = a.turno > b.turno;
    }
    return menor;
  }

  function llamadas(menor) {
    var pq = nueva(menor || llamadaMenor);
    PRIORIDADES.forEach(function (p, t) { pq.push({ turno: t + 1, prioridad: p }); });
    return vaciar(pq, function (l) { return l.turno; });
  }

  var CODIGO = {
    "enteros": [
      "#include <cstdio>",
      "#include <queue>",
      "using std::priority_queue;",
      "",
      "int main() {",
      "  priority_queue<int> pq;",
      "  pq.push(23);",
      "  pq.push(8);",
      "  pq.push(41);",
      "  printf(\"%d\\n\", pq.top());",
      "  pq.pop();",
      "  pq.push(17);",
      "  pq.push(35);",
      "  pq.pop();",
      "  printf(\"%d %d\\n\", pq.top(), (int) pq.size());",
      "  while (!pq.empty()) {",
      "    printf(\" %d\", pq.top());",
      "    pq.pop();",
      "  }",
      "  printf(\"\\n\");",
      "  return 0;",
      "}"
    ],
    "menor": [
      "#include <cstdio>",
      "#include <queue>",
      "#include <vector>",
      "using std::priority_queue;",
      "using std::vector;",
      "",
      "// Para la priority_queue, a va detrás de b si a es mayor.",
      "struct Menor {",
      "  bool operator()(int a, int b) const {",
      "    return a > b;",
      "  }",
      "};",
      "",
      "int main() {",
      "  priority_queue<int, vector<int>, Menor> pq;",
      "  int datos[6] = {52, 19, 74, 6, 33, 19};",
      "  int i = 0;",
      "  while (i < 6) {",
      "    pq.push(datos[i]);",
      "    i = i + 1;",
      "  }",
      "  while (!pq.empty()) {",
      "    printf(\" %d\", pq.top());",
      "    pq.pop();",
      "  }",
      "  printf(\"\\n\");",
      "  return 0;",
      "}"
    ],
    "llamadas": [
      "#include <cstdio>",
      "#include <queue>",
      "using std::priority_queue;",
      "",
      "// Una llamada a la línea de soporte: más prioridad se atiende antes y, con",
      "// la misma prioridad, la que llegó primero.",
      "struct Llamada {",
      "  int turno;",
      "  int prioridad;",
      "",
      "  bool operator<(const Llamada &o) const {",
      "    bool menor;",
      "    if (prioridad != o.prioridad) {",
      "      menor = prioridad < o.prioridad;",
      "    } else {",
      "      menor = turno > o.turno;",
      "    }",
      "    return menor;",
      "  }",
      "};",
      "",
      "int main() {",
      "  priority_queue<Llamada> pq;",
      "  int prioridades[6] = {2, 5, 2, 3, 5, 1};",
      "  int t = 0;",
      "  while (t < 6) {",
      "    Llamada l;",
      "    l.turno = t + 1;",
      "    l.prioridad = prioridades[t];",
      "    pq.push(l);",
      "    t = t + 1;",
      "  }",
      "  while (!pq.empty()) {",
      "    printf(\" %d\", pq.top().turno);",
      "    pq.pop();",
      "  }",
      "  printf(\"\\n\");",
      "  return 0;",
      "}"
    ]
  };

  function codigo(nombre) { return CODIGO[nombre]; }

  return {
    nueva: nueva, mayorPrimero: mayorPrimero, menorPrimero: menorPrimero, vaciar: vaciar,
    enteros: enteros, DATOS_MENOR: DATOS_MENOR, conComparador: conComparador,
    PRIORIDADES: PRIORIDADES, llamadaMenor: llamadaMenor, llamadas: llamadas,
    CODIGO: CODIGO, codigo: codigo
  };
})();

if (typeof module !== "undefined") {
  module.exports = Cola;
}
