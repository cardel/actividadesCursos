/* Programas de las actividades y lo que devolvieron al compilarlos y
   correrlos con gcc -Wall -Wextra (gcc 13.3, x86-64) y python3: las
   salidas y los mensajes son los de esas corridas. */
var Etapas = {
  "cuadrados": {
    "codigo": [
      "#include <stdio.h>",
      "",
      "#define TOPE 5",
      "",
      "int cuadrado(int x) {",
      "    return x * x;",
      "}",
      "",
      "int main(void) {",
      "    int k;",
      "",
      "    k = 1;",
      "    while (k <= TOPE) {",
      "        printf(\"%d al cuadrado es %d\\n\", k, cuadrado(k));",
      "        k = k + 1;",
      "    }",
      "    return 0;",
      "}"
    ],
    "lineasC": 18,
    "lineasI": 831,
    "lineasS": 80,
    "whileI": "while (k <= 5) {",
    "nm": [
      "0000000000000000 T cuadrado",
      "0000000000000013 T main",
      "                 U printf"
    ],
    "file": "Cuadrados.o: ELF 64-bit LSB relocatable, x86-64, version 1 (SYSV), not stripped",
    "salida": [
      "1 al cuadrado es 1",
      "2 al cuadrado es 4",
      "3 al cuadrado es 9",
      "4 al cuadrado es 16",
      "5 al cuadrado es 25"
    ]
  },
  "soloListo": {
    "codigo": [
      "#include <stdio.h>",
      "",
      "int main(void) {",
      "    printf(\"listo\\n\");",
      "    return 0;",
      "}"
    ],
    "nm": [
      "0000000000000000 T main",
      "                 U puts"
    ]
  },
  "listo": {
    "codigo": [
      "#include <stdio.h>",
      "",
      "int main(void) {",
      "    printf(\"listo\\n\");",
      "    printf(\"%d listos\\n\", 3);",
      "    return 0;",
      "}"
    ],
    "nm": [
      "0000000000000000 T main",
      "                 U printf",
      "                 U puts"
    ]
  },
  "macro": {
    "codigo": [
      "#include <stdio.h>",
      "",
      "#define CUPO 10;",
      "",
      "int main(void) {",
      "    int sillas[CUPO];",
      "",
      "    sillas[0] = 1;",
      "    printf(\"%d\\n\", sillas[0]);",
      "    return 0;",
      "}"
    ],
    "error": [
      "macro.c: In function ‘main’:",
      "macro.c:3:16: error: expected ‘]’ before ‘;’ token",
      "    3 | #define CUPO 10;",
      "      |                ^",
      "macro.c:6:16: note: in expansion of macro ‘CUPO’",
      "    6 |     int sillas[CUPO];",
      "      |                ^~~~",
      "macro.c:8:5: error: ‘sillas’ undeclared (first use in this function)",
      "    8 |     sillas[0] = 1;",
      "      |     ^~~~~~",
      "macro.c:8:5: note: each undeclared identifier is reported only once for each function it appears in"
    ]
  },
  "roto_lexico": {
    "codigo": [
      "#include <stdio.h>",
      "",
      "int main(void) {",
      "    int y = 7 ` 2;",
      "    printf(\"%d\\n\", y);",
      "    return 0;",
      "}"
    ],
    "error": [
      "roto_lexico.c: In function ‘main’:",
      "roto_lexico.c:4:15: error: stray ‘`’ in program",
      "    4 |     int y = 7 ` 2;",
      "      |               ^",
      "roto_lexico.c:4:17: error: expected ‘,’ or ‘;’ before numeric constant",
      "    4 |     int y = 7 ` 2;",
      "      |                 ^"
    ]
  },
  "roto_sintactico": {
    "codigo": [
      "#include <stdio.h>",
      "",
      "int main(void) {",
      "    int x = 4;",
      "    if (x > 3 {",
      "        printf(\"mayor\\n\");",
      "    }",
      "    return 0;",
      "}"
    ],
    "error": [
      "roto_sintactico.c: In function ‘main’:",
      "roto_sintactico.c:5:14: error: expected ‘)’ before ‘{’ token",
      "    5 |     if (x > 3 {",
      "      |        ~     ^~",
      "      |              )",
      "roto_sintactico.c:9:1: error: expected expression before ‘}’ token",
      "    9 | }",
      "      | ^"
    ]
  },
  "roto_unicidad": {
    "codigo": [
      "#include <stdio.h>",
      "",
      "int main(void) {",
      "    int n = 1;",
      "    int n = 2;",
      "    printf(\"%d\\n\", n);",
      "    return 0;",
      "}"
    ],
    "error": [
      "roto_unicidad.c: In function ‘main’:",
      "roto_unicidad.c:5:9: error: redefinition of ‘n’",
      "    5 |     int n = 2;",
      "      |         ^",
      "roto_unicidad.c:4:9: note: previous definition of ‘n’ with type ‘int’",
      "    4 |     int n = 1;",
      "      |         ^"
    ]
  },
  "roto_flujo": {
    "codigo": [
      "#include <stdio.h>",
      "",
      "int main(void) {",
      "    int x = 4;",
      "    if (x > 3) {",
      "        break;",
      "    }",
      "    printf(\"%d\\n\", x);",
      "    return 0;",
      "}"
    ],
    "error": [
      "roto_flujo.c: In function ‘main’:",
      "roto_flujo.c:6:9: error: break statement not within loop or switch",
      "    6 |         break;",
      "      |         ^~~~~"
    ]
  },
  "enlace": {
    "total": [
      "int total(int a, int b) {",
      "    return a + b;",
      "}"
    ],
    "principal": [
      "#include <stdio.h>",
      "",
      "int total(int a, int b) {",
      "    return a + b + 1;",
      "}",
      "",
      "int main(void) {",
      "    printf(\"%d\\n\", total(2, 3));",
      "    return 0;",
      "}"
    ],
    "compila": [
      0,
      0
    ],
    "error": [
      "/usr/bin/ld: principal.o: in function `total':",
      "principal.c:(.text+0x0): multiple definition of `total'; total.o:total.c:(.text+0x0): first defined here",
      "collect2: error: ld returned 1 exit status"
    ]
  }
};

if (typeof module !== "undefined") {
  module.exports = Etapas;
}
