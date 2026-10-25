/* Dibujar la cadena de ambientes del intérprete con asignación. Cada ligadura
   guarda una referencia, no un valor: se escribe la referencia, y lo que hay
   en la celda se ve en el almacén. Para cada programa se señala un momento y
   hay que escribir los eslabones que existen en ese instante, del más nuevo
   al más viejo. La página los dibuja mientras se escriben, los compara con
   los del intérprete y, al pedir la cadena del intérprete, la muestra con el
   almacén debajo. */
var EJERCICIOS = [
  {
    id: "dibujar-celda-cambiada",
    titulo: "1. Una celda que ya cambió",
    enunciado:
      "Dos <code>let</code> anidados y un <code>set</code> sobre la variable " +
      "de afuera. El momento es la suma final, cuando el <code>set</code> ya " +
      "se ejecutó. Las celdas 0 a 5 son las del ambiente inicial, así que la " +
      "primera que reserva el programa es la 6.",
    programa: "let n = 3 in let m = *(n, 2) in begin set n = 0; +(n, m) end",
    momento: "+(n, m)",
    ejemplo: "[m=(a-ref 9)]&#10;[n=(a-ref 9)]",
    pista:
      "Dos eslabones, el de m y el de n, en ese orden. n se ligó primero, a la " +
      "celda 6; m después, a la 7. El set no cambia ninguna ligadura: cambia " +
      "lo que hay en la celda 6.",
    cierre:
      "La cadena tiene la misma forma que antes del <code>set</code>, y las " +
      "ligaduras son las mismas. Lo que cambió está en el almacén: la celda 6 " +
      "pasó de 3 a 0, y la 7 conserva el 6 que se calculó al crear el eslabón " +
      "de <code>m</code>."
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
    ejemplo: "[k=(a-ref 9)]&#10;[s=(a-ref 9)]",
    pista:
      "Dos eslabones: el del parámetro k y el de s. El de f no está: el proc " +
      "se evaluó como operando del let, en el eslabón de s, y la clausura " +
      "capturó ese. Las celdas van en el orden en que se reservaron: s, la " +
      "clausura de f, y k al llamar.",
    cierre:
      "El <code>set</code> encontró la referencia de <code>s</code> con " +
      "<code>apply-env</code>, recorriendo la cadena desde el eslabón de " +
      "<code>k</code>, y escribió 5 en la celda 6. La clausura está en la " +
      "celda 7 y el 4 del parámetro en la 8."
  },
  {
    id: "dibujar-segunda-llamada",
    titulo: "3. La celda de la primera llamada ya no está",
    enunciado:
      "<code>f</code> incrementa su parámetro y lo devuelve. La primera " +
      "llamada liga <code>r1</code>; el momento es la segunda llamada, justo " +
      "antes de que empiece a evaluarse.",
    programa: "let f = proc(k) begin set k = add1(k); k end in let r1 = (f 10) in (f r1)",
    momento: "(f r1)",
    ejemplo: "[r1=(a-ref 9)]&#10;[f=(a-ref 9)]",
    pista:
      "Dos eslabones: el de r1 y el de f. La primera llamada reservó la celda " +
      "7 para su k; después el let de r1 reservó la 8. El eslabón de esa k ya " +
      "no está en la cadena, pero su celda sigue en el almacén.",
    cierre:
      "La celda 7 guarda 11, lo que dejó el <code>set</code> de la primera " +
      "llamada, y nadie la vuelve a nombrar. La segunda llamada reservará la " +
      "celda 9 con una copia del 11 que hay en la 8, y la dejará en 12."
  },
  {
    id: "dibujar-contador-letrec",
    titulo: "4. Un contador y un marco recursivo",
    enunciado:
      "<code>bajar</code> cuenta sus vueltas en <code>cuenta</code>, que vive " +
      "afuera del <code>letrec</code>. El momento es el caso base, cuando " +
      "<code>n</code> llega a 0. El marco del <code>letrec</code> lleva sus " +
      "tres listas, como en el lenguaje sin asignación.",
    programa: "let cuenta = 0 in letrec bajar(n) = if ==(n, 0) then *(cuenta, 100) else begin set cuenta = add1(cuenta); (bajar sub1(n)) end in (bajar 2)",
    momento: "*(cuenta, 100)",
    ejemplo: "[n=(a-ref 9)]&#10;[procnames=(bajar), idss=((n)), cuerpos=cuerpo]&#10;[cuenta=(a-ref 9)]",
    pista:
      "Tres eslabones: el de la última llamada, el marco del letrec y el de " +
      "cuenta. Cada llamada hace dos reservas: primero la celda de la " +
      "clausura, al buscar bajar, y después la de n. Con tres llamadas, la n " +
      "de la última queda en la celda 12.",
    cierre:
      "Las celdas 7, 9 y 11 guardan clausuras: una por cada vez que se buscó " +
      "<code>bajar</code>. Las celdas 8, 10 y 12 son las de <code>n</code>, " +
      "con 2, 1 y 0. Todas las llamadas escribieron en la misma celda 6 de " +
      "<code>cuenta</code>, que ya tiene 2."
  }
];

if (typeof module !== "undefined") { module.exports = { EJERCICIOS: EJERCICIOS }; }

if (typeof document !== "undefined") {
  MotorDibujo.montar({ interprete: InterpreteAsignacion, ejercicios: EJERCICIOS,
                       destino: "ejercicios" });
}
