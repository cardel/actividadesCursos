/* Los programas de las actividades de repaso, con la salida que dieron al
   compilarlos con g++ -Wall -Wextra y correrlos. Las simulaciones de abajo
   reproducen el código y las pruebas las comparan con esas salidas. */
var Programas = (function () {
  var CODIGO = {
    "Menor": [
      "#include <stdio.h>",
      "",
      "int main() {",
      "  int menor, a, b, c, d;",
      "  scanf(\"%d %d %d %d\", &a, &b, &c, &d);",
      "  menor = a;",
      "",
      "  if (b < menor) {",
      "    menor = b;",
      "  }",
      "",
      "  if (c < menor) {",
      "    menor = c;",
      "  }",
      "",
      "  if (d < menor) {",
      "    menor = d;",
      "  }",
      "",
      "  printf(\"El menor es %d\\n\", menor);",
      "  return 0;",
      "}"
    ],
    "MenorMal": [
      "#include <stdio.h>",
      "",
      "int main() {",
      "  int menor, a, b, c, d;",
      "  scanf(\"%d %d %d %d\", &a, &b, &c, &d);",
      "  menor = a;",
      "",
      "  if (b < menor) {",
      "    menor = b;",
      "  } else if (c < menor) {",
      "    menor = c;",
      "  } else if (d < menor) {",
      "    menor = d;",
      "  }",
      "",
      "  printf(\"El menor es %d\\n\", menor);",
      "  return 0;",
      "}"
    ],
    "Saldo": [
      "#include <stdio.h>",
      "",
      "int main() {",
      "  int saldo = 40;",
      "  if (saldo = 0) {",
      "    printf(\"Cuenta vacia\\n\");",
      "  }",
      "  printf(\"Saldo: %d\\n\", saldo);",
      "  return 0;",
      "}"
    ],
    "SaldoBien": [
      "#include <stdio.h>",
      "",
      "int main() {",
      "  int saldo = 40;",
      "  if (saldo == 0) {",
      "    printf(\"Cuenta vacia\\n\");",
      "  }",
      "  printf(\"Saldo: %d\\n\", saldo);",
      "  return 0;",
      "}"
    ],
    "Notas": [
      "#include <stdio.h>",
      "",
      "int main() {",
      "  int notas[6];",
      "",
      "  for (int i = 0; i < 6; i++) {",
      "    scanf(\"%d\", &notas[i]);",
      "  }",
      "",
      "  // Minimo y suma",
      "  int minimo = notas[0];",
      "  int suma = notas[0];",
      "  for (int i = 1; i < 6; i++) {",
      "    suma += notas[i];",
      "    if (notas[i] < minimo) {",
      "      minimo = notas[i];",
      "    }",
      "  }",
      "  double promedio = suma / 6;",
      "  printf(\"Minimo %d, suma %d, promedio %0.2f\\n\", minimo, suma, promedio);",
      "  return 0;",
      "}"
    ],
    "NotasBien": [
      "#include <stdio.h>",
      "",
      "int main() {",
      "  int notas[6];",
      "",
      "  for (int i = 0; i < 6; i++) {",
      "    scanf(\"%d\", &notas[i]);",
      "  }",
      "",
      "  // Minimo y suma",
      "  int minimo = notas[0];",
      "  int suma = notas[0];",
      "  for (int i = 1; i < 6; i++) {",
      "    suma += notas[i];",
      "    if (notas[i] < minimo) {",
      "      minimo = notas[i];",
      "    }",
      "  }",
      "  double promedio = suma / 6.0;",
      "  printf(\"Minimo %d, suma %d, promedio %0.2f\\n\", minimo, suma, promedio);",
      "  return 0;",
      "}"
    ],
    "posicionBreak": [
      "// Con break: la primera posicion de x, o -1.",
      "int posicionBreak(int a[], int n, int x) {",
      "  int pos = -1;",
      "  for (int i = 0; i < n; i++) {",
      "    if (a[i] == x) {",
      "      pos = i;",
      "      break;",
      "    }",
      "  }",
      "  return pos;",
      "}"
    ],
    "posicionA": [
      "// A: la condicion del ciclo dice cuando parar.",
      "int posicionA(int a[], int n, int x) {",
      "  int pos = -1;",
      "  int i = 0;",
      "  while (i < n && pos == -1) {",
      "    if (a[i] == x) {",
      "      pos = i;",
      "    }",
      "    i = i + 1;",
      "  }",
      "  return pos;",
      "}"
    ],
    "posicionB": [
      "// B: se quita el break y nada mas.",
      "int posicionB(int a[], int n, int x) {",
      "  int pos = -1;",
      "  for (int i = 0; i < n; i++) {",
      "    if (a[i] == x) {",
      "      pos = i;",
      "    }",
      "  }",
      "  return pos;",
      "}"
    ]
  };

  /* El aviso que dio g++ -Wall -Wextra con Saldo.cpp. */
  var AVISO_SALDO = ["Saldo.cpp: In function 'int main()':", "Saldo.cpp:5:13: warning: suggest parentheses around assignment used as truth value [-Wparentheses]", "    5 |   if (saldo = 0) {", "      |       ~~~~~~^~~"];

  /* Menor.cpp: el menor de cuatro, con un if por cada valor. */
  function menor(v) {
    var m = v[0];
    if (v[1] < m) { m = v[1]; }
    if (v[2] < m) { m = v[2]; }
    if (v[3] < m) { m = v[3]; }
    return m;
  }

  /* MenorMal.cpp: la misma idea encadenada con else if. */
  function menorMal(v) {
    var m = v[0];
    if (v[1] < m) {
      m = v[1];
    } else if (v[2] < m) {
      m = v[2];
    } else if (v[3] < m) {
      m = v[3];
    }
    return m;
  }

  /* Notas.cpp: la traza del ciclo y la salida, con división entera o no. */
  function notas(v, real) {
    var minimo = v[0];
    var suma = v[0];
    var filas = [["inicio", "", String(suma), String(minimo)]];
    var i = 1;
    while (i < v.length) {
      suma = suma + v[i];
      if (v[i] < minimo) { minimo = v[i]; }
      filas.push([String(i), String(v[i]), String(suma), String(minimo)]);
      i = i + 1;
    }
    var prom = real ? suma / v.length : Math.trunc(suma / v.length);
    return { minimo: minimo, suma: suma, promedio: prom, filas: filas,
      salida: "Minimo " + minimo + ", suma " + suma + ", promedio " + prom.toFixed(2) };
  }

  /* Las tres versiones de posicion de Posicion.cpp. */
  function posicionBreak(a, x) {
    var pos = -1;
    var i = 0;
    while (i < a.length && pos === -1) {
      if (a[i] === x) { pos = i; }
      i = i + 1;
    }
    return pos;
  }
  function posicionB(a, x) {
    var pos = -1;
    a.forEach(function (y, i) { if (y === x) { pos = i; } });
    return pos;
  }

  function codigo(n) { return CODIGO[n]; }

  /* Un bloque de código o de terminal, con los signos escapados. */
  function pre(lineas) {
    var t = lineas.join("\n").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return "<pre class=\"fragmento\">" + t + "</pre>";
  }

  return { CODIGO: CODIGO, AVISO_SALDO: AVISO_SALDO, codigo: codigo, pre: pre, menor: menor,
    menorMal: menorMal, notas: notas, posicionBreak: posicionBreak, posicionB: posicionB };
})();

if (typeof module !== "undefined") {
  module.exports = Programas;
}
