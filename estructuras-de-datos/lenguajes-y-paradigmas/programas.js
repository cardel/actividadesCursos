/* Programas de las actividades y lo que devolvieron al compilarlos y
   correrlos con gcc -Wall -Wextra (gcc 13.3, x86-64) y python3: las
   salidas y los mensajes son los de esas corridas. */
var Programas = {
  "bordes": {
    "codigo": [
      "#include <stdio.h>",
      "",
      "int main(void) {",
      "    unsigned int u;",
      "    int a;",
      "    int b;",
      "",
      "    u = 0;",
      "    u = u - 1;",
      "    printf(\"%u\\n\", u);",
      "    a = 2147483000;",
      "    a = a + 1000;",
      "    printf(\"%d\\n\", a);",
      "    b = 2147483647;",
      "    printf(\"%d\\n\", b++);",
      "    printf(\"%d\\n\", b);",
      "    return 0;",
      "}"
    ],
    "salida": [
      "4294967295",
      "-2147483296",
      "2147483647",
      "-2147483648"
    ]
  },
  "formato": {
    "codigo": [
      "#include <stdio.h>",
      "",
      "int main(void) {",
      "    long total;",
      "",
      "    total = 3000000000;",
      "    printf(\"%d\\n\", total);",
      "    return 0;",
      "}"
    ],
    "aviso": [
      "formato.c: In function 'main':",
      "formato.c:7:14: warning: format '%d' expects argument of type 'int', but argument 2 has type 'long int' [-Wformat=]",
      "    7 |     printf(\"%d\\n\", total);",
      "      |             ~^     ~~~~~",
      "      |              |     |",
      "      |              int   long int",
      "      |             %ld"
    ]
  },
  "grande": {
    "codigo": [
      "a = 4294967295",
      "b = a + 1",
      "print(b, b * b)",
      "print(type(b))"
    ],
    "salida": [
      "4294967296 18446744073709551616",
      "<class 'int'>"
    ]
  },
  "ramaPy": {
    "codigo": [
      "saldo = int(input())",
      "if saldo >= 0:",
      "    print(\"saldo al dia:\", saldo)",
      "else:",
      "    print(\"deuda de\", -sald0)"
    ],
    "con150": [
      "saldo al dia: 150"
    ],
    "con20": [
      "Traceback (most recent call last):",
      "  File \"rama.py\", line 5, in <module>",
      "    print(\"deuda de\", -sald0)",
      "                       ^^^^^",
      "NameError: name 'sald0' is not defined. Did you mean: 'saldo'?"
    ]
  },
  "ramaC": {
    "codigo": [
      "#include <stdio.h>",
      "",
      "int main(void) {",
      "    int saldo;",
      "",
      "    scanf(\"%d\", &saldo);",
      "    if (saldo >= 0) {",
      "        printf(\"saldo al dia: %d\\n\", saldo);",
      "    } else {",
      "        printf(\"deuda de %d\\n\", -sald0);",
      "    }",
      "    return 0;",
      "}"
    ],
    "error": [
      "rama.c: In function 'main':",
      "rama.c:10:34: error: 'sald0' undeclared (first use in this function); did you mean 'saldo'?",
      "   10 |         printf(\"deuda de %d\\n\", -sald0);",
      "      |                                  ^~~~~",
      "      |                                  saldo",
      "rama.c:10:34: note: each undeclared identifier is reported only once for each function it appears in"
    ]
  },
  "multiplosC": {
    "codigo": [
      "#include <stdio.h>",
      "",
      "int main(void) {",
      "    long cuenta;",
      "    long i;",
      "",
      "    cuenta = 0;",
      "    i = 0;",
      "    while (i < 40000000) {",
      "        if (i % 7 == 0) {",
      "            cuenta = cuenta + 1;",
      "        }",
      "        i = i + 1;",
      "    }",
      "    printf(\"%ld\\n\", cuenta);",
      "    return 0;",
      "}"
    ],
    "salida": "5714286"
  },
  "multiplosPy": {
    "codigo": [
      "cuenta = 0",
      "i = 0",
      "while i < 40000000:",
      "    if i % 7 == 0:",
      "        cuenta = cuenta + 1",
      "    i = i + 1",
      "print(cuenta)"
    ]
  },
  "tiempos": {
    "c": 0.107,
    "py": 4.59,
    "corridasC": [
      0.107,
      0.123,
      0.119
    ],
    "corridasPy": [
      4.59,
      4.853
    ]
  },
  "potencia": {
    "codigo": [
      "#include <stdio.h>",
      "",
      "/* Calcula base elevado a exp multiplicando exp veces */",
      "long potencia(int base, int exp) {",
      "    long resultado;",
      "    int i;",
      "",
      "    resultado = 1;",
      "    i = 0;",
      "    while (i < exp) {",
      "        resultado = resultado * base;",
      "        i = i + 1;",
      "    }",
      "    return resultado;",
      "}",
      "",
      "int main(void) {",
      "    printf(\"%ld\\n\", potencia(3, 4));",
      "    return 0;",
      "}"
    ],
    "salida": "81"
  },
  "potenciaOO": {
    "codigo": [
      "#include <cstdio>",
      "",
      "class Potencia {",
      "  private:",
      "    long resultado;",
      "",
      "  public:",
      "    Potencia() {",
      "        resultado = 1;",
      "    }",
      "",
      "    long calcular(int base, int exp) {",
      "        int i;",
      "",
      "        resultado = 1;",
      "        i = 0;",
      "        while (i < exp) {",
      "            resultado = resultado * base;",
      "            i = i + 1;",
      "        }",
      "        return resultado;",
      "    }",
      "};",
      "",
      "int main() {",
      "    Potencia p;",
      "    printf(\"%ld\\n\", p.calcular(3, 4));",
      "    return 0;",
      "}"
    ],
    "salida": "81"
  },
  "precedencia": {
    "codigo": [
      "#include <stdio.h>",
      "",
      "int main(void) {",
      "    int p;",
      "    int q;",
      "    int s;",
      "    int r;",
      "",
      "    p = 10;",
      "    q = 2;",
      "    s = 1;",
      "    r = p - q * 4 + s;",
      "    printf(\"%d\\n\", r);",
      "    return 0;",
      "}"
    ],
    "salida": "3"
  },
  "id3d": {
    "error": [
      "id_3d.c: In function ‘main’:",
      "id_3d.c:2:9: error: invalid suffix \"d\" on integer constant",
      "    2 |     int 3d;",
      "      |         ^~",
      "id_3d.c:2:9: error: expected identifier or ‘(’ before numeric constant",
      "id_3d.c:3:5: error: invalid suffix \"d\" on integer constant",
      "    3 |     3d = 1;",
      "      |     ^~",
      "id_3d.c:4:12: error: invalid suffix \"d\" on integer constant",
      "    4 |     return 3d;",
      "      |            ^~"
    ]
  },
  "idInt": {
    "error": [
      "id_int.c: In function ‘main’:",
      "id_int.c:2:9: error: two or more data types in declaration specifiers",
      "    2 |     int int;",
      "      |         ^~~",
      "id_int.c:2:5: warning: useless type name in empty declaration",
      "    2 |     int int;",
      "      |     ^~~",
      "id_int.c:3:9: error: expected identifier or ‘(’ before ‘=’ token",
      "    3 |     int = 1;",
      "      |         ^",
      "id_int.c:4:12: error: expected expression before ‘int’",
      "    4 |     return int;",
      "      |            ^~~"
    ]
  },
  "sangria": {
    "codigo": [
      "x = 4",
      "if x > 3:",
      "print(\"mayor\")"
    ],
    "error": [
      "  File \"sangria.py\", line 3",
      "    print(\"mayor\")",
      "    ^^^^^",
      "IndentationError: expected an indented block after 'if' statement on line 2"
    ]
  }
};

if (typeof module !== "undefined") {
  module.exports = Programas;
}
