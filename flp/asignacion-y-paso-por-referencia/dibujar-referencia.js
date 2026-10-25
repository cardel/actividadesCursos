/* Dibujar la cadena con paso por referencia (EOPL §4.5.1). Cada ligadura
   guarda una referencia; un parámetro cuyo operando fue una variable guarda
   la misma referencia de esa variable. En tres de los cuatro programas esa
   variable no está en la cadena del momento, y su celda sí: el almacén
   dibujado lo muestra. */
var REF = { referencia: true };

var EJERCICIOS = [
  {
    id: "dibujar-ref-uno",
    titulo: "1. Un parámetro que es alias",
    opciones: REF,
    enunciado:
      "<code>f</code> asigna 0 a su parámetro y le suma 1. Se llama con " +
      "<code>k</code>. El momento es la suma, después del <code>set</code>.",
    programa: "let k = 7 in let f = proc(p) begin set p = 0; +(p, 1) end in (f k)",
    momento: "+(p, 1)",
    ejemplo: "[p=(a-ref 9)]&#10;[k=(a-ref 9)]",
    pista:
      "Dos eslabones: el de la llamada y el de k, que es el que capturó la " +
      "clausura. El operando k es una variable, así que p no estrena celda: " +
      "recibe la referencia de k.",
    cierre:
      "p y k guardan la misma referencia, la de la celda 6. El 0 del " +
      "<code>set p</code> quedó ahí, y por eso <code>k</code> también vale 0. " +
      "El programa vale 1."
  },
  {
    id: "dibujar-ref-fuera",
    titulo: "2. La variable no está en la cadena",
    opciones: REF,
    enunciado:
      "<code>f</code> multiplica sus parámetros. Se llama con <code>k</code> " +
      "y con <code>add1(k)</code>. El momento es la multiplicación.",
    programa: "let f = proc(p, q) *(p, q) in let k = 3 in (f k add1(k))",
    momento: "*(p, q)",
    ejemplo: "[p=(a-ref 9), q=(a-ref 9)]",
    pista:
      "Un solo eslabón sobre el ambiente inicial: el de la llamada. La " +
      "clausura de f se creó en el ambiente inicial, así que el eslabón de k " +
      "no está en esta cadena. p comparte la celda de k; q, que vino de una " +
      "expresión, tiene una celda nueva.",
    cierre:
      "La celda 7 es la de <code>k</code>, y <code>p</code> la nombra aunque " +
      "el eslabón de <code>k</code> no esté a la vista: una referencia no pasa " +
      "por la cadena. La celda 8 se reservó para <code>q</code> con 4."
  },
  {
    id: "dibujar-ref-dos-llamadas",
    titulo: "3. Un alias que pasa por dos llamadas",
    opciones: REF,
    enunciado:
      "<code>f</code> le pasa su parámetro a <code>g</code>, que lo duplica. " +
      "El momento es la multiplicación de <code>g</code>.",
    programa: "let g = proc(r) *(r, 2) in let f = proc(p) (g p) in let k = 5 in (f k)",
    momento: "*(r, 2)",
    ejemplo: "[r=(a-ref 9)]",
    pista:
      "Un eslabón: el de la llamada a g, que cuelga del ambiente inicial, " +
      "donde se creó la clausura de g. p recibió la referencia de k, y al " +
      "llamar (g p), p es una variable: r recibe esa misma referencia.",
    cierre:
      "<code>r</code>, <code>p</code> y <code>k</code> nombran la celda 8. " +
      "Ninguna llamada reservó celdas: todos los operandos fueron variables."
  },
  {
    id: "dibujar-ref-doble",
    titulo: "4. Dos alias de la misma celda",
    opciones: REF,
    enunciado:
      "<code>f</code> incrementa <code>p</code> y resta <code>q</code> menos " +
      "<code>p</code>. Se llama con <code>k</code> dos veces. El momento es la " +
      "resta.",
    programa: "let f = proc(p, q) begin set p = add1(p); -(q, p) end in let k = 2 in (f k k)",
    momento: "-(q, p)",
    ejemplo: "[p=(a-ref 9), q=(a-ref 9)]",
    pista:
      "Un eslabón sobre el ambiente inicial, con dos ligaduras que guardan la " +
      "misma referencia, la de k.",
    cierre:
      "La celda 7 ya pasó de 2 a 3. <code>q</code> y <code>p</code> la leen " +
      "las dos, y la resta da 0. Por valor, <code>q</code> conservaría su " +
      "propio 2 y daría -1."
  }
];

if (typeof module !== "undefined") { module.exports = { EJERCICIOS: EJERCICIOS }; }

if (typeof document !== "undefined") {
  MotorDibujo.montar({ interprete: InterpreteAsignacion, ejercicios: EJERCICIOS,
                       destino: "ejercicios" });
}
