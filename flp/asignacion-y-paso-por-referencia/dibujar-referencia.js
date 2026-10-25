/* Dibujar la cadena con paso por referencia. Las celdas guardan blancos: un
   direct-target con su valor o un indirect-target que apunta a la celda de
   otra variable. En tres de los cuatro programas esa celda apuntada no está
   en la cadena del momento, y el dibujo tiene que mostrarlo. */
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
    pista:
      "Dos eslabones: el de p y el de k. El de f no está, porque la clausura " +
      "se creó en el eslabón de k. La celda de p no guarda un número sino un " +
      "indirect-target a la de k, y el set escribió en la de k.",
    cierre:
      "La celda de <code>p</code> sigue guardando lo mismo que al empezar la " +
      "llamada: el indirect-target. El 0 quedó en la celda de <code>k</code>, " +
      "porque <code>setref!</code> sigue la indirección antes de escribir."
  },
  {
    id: "dibujar-ref-fuera",
    titulo: "2. La celda apuntada no está en la cadena",
    opciones: REF,
    enunciado:
      "Ahora <code>k</code> se liga después de <code>f</code>, y la llamada " +
      "lleva un operando variable y uno calculado. El momento es el cuerpo " +
      "de <code>f</code>.",
    programa: "let f = proc(p, q) *(p, q) in let k = 3 in (f k add1(k))",
    momento: "*(p, q)",
    pista:
      "Un solo eslabón, el de la llamada con p y q. Cuelga del ambiente " +
      "inicial, que es donde se creó la clausura, así que ni el eslabón de f " +
      "ni el de k están en la cadena. Aun así p apunta a la celda de k.",
    cierre:
      "El eslabón de <code>k</code> no está en esta cadena, y sin embargo " +
      "<code>p</code> lee su celda: el indirect-target no pasa por la cadena, " +
      "va directo a la referencia. Por eso el alcance estático no protege a " +
      "una variable pasada por referencia."
  },
  {
    id: "dibujar-ref-aplanado",
    titulo: "3. Un alias que pasa por dos llamadas",
    opciones: REF,
    enunciado:
      "<code>f</code> le entrega su parámetro a <code>g</code>. El momento es " +
      "el cuerpo de <code>g</code>.",
    programa: "let g = proc(r) *(r, 2) in let f = proc(p) (g p) in let k = 5 in (f k)",
    momento: "*(r, 2)",
    pista:
      "Un solo eslabón, el de r, que cuelga del ambiente inicial. La pregunta " +
      "es a qué celda apunta r: eval-rand vio que la celda de p ya era un " +
      "indirect-target y le pasó ese mismo, el que apunta a k.",
    cierre:
      "r apunta a <code>k</code> y no a <code>p</code>: el invariante dice que " +
      "un indirect-target siempre apunta a una celda con un direct-target, y " +
      "<code>eval-rand</code> lo mantiene aplanando. Así " +
      "<code>deref</code> y <code>setref!</code> nunca siguen más de un nivel."
  },
  {
    id: "dibujar-ref-doble",
    titulo: "4. Dos alias de la misma celda",
    opciones: REF,
    enunciado:
      "<code>f</code> se llama con la misma variable en los dos lugares, " +
      "incrementa <code>p</code> y resta. El momento es la resta.",
    programa: "let f = proc(p, q) begin set p = add1(p); -(q, p) end in let k = 2 in (f k k)",
    momento: "-(q, p)",
    pista:
      "Un solo eslabón, el de la llamada, con p y q, colgado del ambiente " +
      "inicial. Las dos celdas guardan un indirect-target a la misma celda.",
    cierre:
      "La resta da 0 porque <code>q</code> y <code>p</code> leen la misma " +
      "celda, que el set dejó en 3. Por valor habría dado 2 - 3. El eslabón " +
      "de <code>k</code> no se dibuja, pero su celda es la única que cambió."
  }
];

if (typeof module !== "undefined") { module.exports = { EJERCICIOS: EJERCICIOS }; }

if (typeof document !== "undefined") {
  MotorDibujo.montar({ interprete: InterpreteAsignacion, ejercicios: EJERCICIOS,
                       destino: "ejercicios" });
}
