/* Dibujar la cadena de ambientes con celdas que cambian. Para cada programa
   se señala un momento y hay que escribir los eslabones que existen en ese
   instante con lo que guarda cada celda, del más nuevo al más viejo. La
   página los dibuja mientras se escriben y los compara con los del
   interpretador. */
var EJERCICIOS = [
  {
    id: "dibujar-celda-cambiada",
    titulo: "1. Una celda que ya cambió",
    enunciado:
      "Dos <code>let</code> anidados y un <code>set</code> sobre la variable " +
      "de afuera. El momento es la suma final, cuando el <code>set</code> ya " +
      "se ejecutó.",
    programa: "let n = 3 in let m = *(n, 2) in begin set n = 0; +(n, m) end",
    momento: "+(n, m)",
    pista:
      "Dos eslabones, el de m y el de n, en ese orden. La celda de n ya no " +
      "guarda 3: el set escribió en ella. m conserva lo que valía n * 2 " +
      "cuando se creó su eslabón.",
    cierre:
      "La asignación no creó ningún eslabón: cambió el contenido de una " +
      "celda que ya existía. La cadena tiene la misma forma que antes del " +
      "<code>set</code>; lo que cambió es lo que dice una de sus casillas."
  },
  {
    id: "dibujar-dentro-llamada",
    titulo: "2. Dentro de una llamada que asigna afuera",
    enunciado:
      "El cuerpo de <code>f</code> suma su parámetro a <code>s</code>, que " +
      "vive afuera, y después lo multiplica por 10. El momento es esa " +
      "multiplicación.",
    programa: "let s = 1 in let f = proc(k) begin set s = +(s, k); *(s, 10) end in (f 4)",
    momento: "*(s, 10)",
    pista:
      "Dos eslabones: el del parámetro k y el de s. El de f no está: el proc " +
      "se evaluó como operando del let, en el eslabón de s, y la clausura " +
      "capturó ese. La celda de s ya guarda el resultado del set.",
    cierre:
      "El eslabón de la llamada cuelga del ambiente que la clausura capturó, " +
      "y el de <code>f</code> se creó después de la clausura. El set encuentra " +
      "la celda de <code>s</code> con <code>apply-env-ref</code>, recorriendo " +
      "la cadena igual que <code>apply-env</code>; la diferencia está en lo " +
      "que devuelve: la referencia y no el contenido."
  },
  {
    id: "dibujar-segunda-llamada",
    titulo: "3. La celda de la primera llamada ya no está",
    enunciado:
      "<code>f</code> incrementa su parámetro y lo devuelve. La primera " +
      "llamada liga <code>r1</code>; el momento es la segunda llamada, justo " +
      "antes de que empiece a evaluarse. Una ligadura que guarde un " +
      "procedimiento se escribe con <code>closure</code> como valor.",
    programa: "let f = proc(k) begin set k = add1(k); k end in let r1 = (f 10) in (f r1)",
    momento: "(f r1)",
    pista:
      "Dos eslabones: el de r1 y el de f. El eslabón con la celda de k de la " +
      "primera llamada se creó, se modificó y quedó fuera de esta cadena.",
    cierre:
      "La primera llamada creó un eslabón para k, lo modificó y devolvió 11. " +
      "Ese eslabón colgaba del ambiente inicial, donde se creó la clausura, y " +
      "nadie lo vuelve a alcanzar. La segunda llamada creará otro, con su " +
      "propia celda, en la que pondrá 11 y después 12."
  },
  {
    id: "dibujar-contador-letrec",
    titulo: "4. Un contador y un marco recursivo",
    enunciado:
      "<code>bajar</code> cuenta sus vueltas en <code>cuenta</code>, que vive " +
      "afuera del <code>letrec</code>. El momento es el caso base, cuando " +
      "<code>n</code> llega a 0. En este interpretador el marco del " +
      "<code>letrec</code> guarda un vector con una clausura por nombre, así " +
      "que se escribe como cualquier eslabón: <code>bajar=closure</code>.",
    programa: "let cuenta = 0 in letrec bajar(n) = if ==(n, 0) then *(cuenta, 100) else begin set cuenta = add1(cuenta); (bajar sub1(n)) end in (bajar 2)",
    momento: "*(cuenta, 100)",
    pista:
      "Tres eslabones: el de la última llamada, el marco del letrec y el de " +
      "cuenta. Las llamadas anteriores no aparecen, porque cada una cuelga " +
      "del marco recursivo y no de la anterior.",
    cierre:
      "Las tres llamadas escribieron en la misma celda de <code>cuenta</code> " +
      "y cada una tuvo su propia celda para <code>n</code>. Aquí el marco del " +
      "<code>letrec</code> no guarda nombres, parámetros y cuerpos por " +
      "separado: reserva el vector, arma el eslabón sobre él y llena cada " +
      "celda con una clausura que captura ese mismo eslabón."
  }
];

if (typeof module !== "undefined") { module.exports = { EJERCICIOS: EJERCICIOS }; }

if (typeof document !== "undefined") {
  MotorDibujo.montar({ interprete: InterpreteAsignacion, ejercicios: EJERCICIOS,
                       destino: "ejercicios" });
}
