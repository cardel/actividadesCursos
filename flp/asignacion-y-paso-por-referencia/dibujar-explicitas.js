/* Dibujar la cadena con referencias explícitas. El ambiente liga nombres a
   valores, y algunos de esos valores son referencias. Para cada programa se
   señala un momento y se escriben los eslabones de ese instante; al pedir la
   cadena del intérprete, la página la dibuja con el almacén debajo y una
   flecha de cada referencia a su celda. */
var EXP = { modo: "explicitas" };

var EJERCICIOS = [
  {
    id: "dibujar-exp-cadena",
    titulo: "1. Una referencia que lleva a otra",
    opciones: EXP,
    enunciado:
      "<code>b</code> nombra una celda que guarda la referencia de " +
      "<code>a</code>, y <code>c</code> recibe lo que hay en la celda de " +
      "<code>b</code>.",
    programa: "let a = newref(2) in let b = newref(a) in let c = deref(b) in deref(c)",
    momento: "deref(c)",
    ejemplo: "[c=(a-ref 9)]&#10;[b=(a-ref 9)]",
    pista:
      "Hay tres let y tres eslabones. a y c guardan la misma referencia, la " +
      "de la celda 0; b guarda la de la celda 1, que a su vez contiene " +
      "(a-ref 0).",
    cierre:
      "c no es una celda nueva: deref(b) devolvió el valor guardado en la " +
      "celda 1, que es la referencia de a. Por eso deref(c) vale 2."
  },
  {
    id: "dibujar-exp-llamada",
    titulo: "2. Dentro de la llamada",
    opciones: EXP,
    enunciado:
      "<code>f</code> escribe <code>v</code> en la celda de <code>r</code> y " +
      "la lee. Se pide la cadena cuando empieza <code>deref(r)</code>.",
    programa: "let k = newref(1) in let f = proc(r, v) begin setref(r, v); deref(r) end in (f k 8)",
    momento: "deref(r)",
    ejemplo: "[r=(a-ref 9), v=1]&#10;[k=(a-ref 9)]",
    pista:
      "La clausura de f capturó el eslabón de k, no el de f: el let de f " +
      "evalúa su proc en el ambiente de afuera. El eslabón de la llamada " +
      "cuelga de ese.",
    cierre:
      "r recibió una copia del valor de k, y ese valor es (a-ref 0). Las dos " +
      "ligaduras nombran la celda 0, que en este momento ya guarda 8."
  },
  {
    id: "dibujar-exp-letrec",
    titulo: "3. Un letrec que escribe una celda de afuera",
    opciones: EXP,
    enunciado:
      "<code>bajar</code> escribe su <code>n</code> en la celda de " +
      "<code>total</code> antes de llamarse con <code>n</code> menos uno. Se " +
      "pide la cadena cuando empieza <code>deref(total)</code>, en la última " +
      "llamada.",
    programa: "let total = newref(0) in letrec bajar(n) = if ==(n, 0) then deref(total) else begin setref(total, n); (bajar sub1(n)) end in (bajar 2)",
    momento: "deref(total)",
    ejemplo: "[n=0]&#10;[procnames=(bajar), idss=((n)), cuerpos=cuerpo]&#10;[total=(a-ref 9)]",
    pista:
      "La cadena de la última llamada tiene su eslabón con n = 0, el marco del " +
      "letrec con sus tres listas y el eslabón de total. Los eslabones de las " +
      "llamadas anteriores no están: cada uno cuelga del marco recursivo.",
    cierre:
      "La celda 0 pasó por 2 y por 1. El programa vale 1, lo último que se " +
      "escribió."
  },
  {
    id: "dibujar-exp-compartida",
    titulo: "4. La celda que comparten dos procedimientos",
    opciones: EXP,
    enunciado:
      "<code>sumar</code> suma <code>k</code> a la celda de <code>c</code>. " +
      "Se pide la cadena cuando empieza el <code>setref</code> del cuerpo.",
    programa: "let c = newref(0) in let sumar = proc(k) begin setref(c, +(deref(c), k)); k end in (sumar 5)",
    momento: "setref(c, +(deref(c), k))",
    ejemplo: "[k=1]&#10;[c=(a-ref 9)]",
    pista:
      "La llamada crea un eslabón con k sobre el ambiente que capturó la " +
      "clausura, el de c. El eslabón de sumar no está en esta cadena.",
    cierre:
      "La celda 0 todavía guarda 0: el setref apenas empieza. En este " +
      "lenguaje k es un número en el ambiente, sin celda propia."
  }
];

if (typeof module !== "undefined") { module.exports = { EJERCICIOS: EJERCICIOS }; }

if (typeof document !== "undefined") {
  MotorDibujo.montar({ interprete: InterpreteAsignacion, ejercicios: EJERCICIOS,
                       destino: "ejercicios" });
}
