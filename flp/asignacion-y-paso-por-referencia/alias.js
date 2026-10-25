/* Paso por referencia: alias. Todas las tarjetas corren con el interpretador
   2 PasoPorReferencia. Se predice el valor y, en algunas, cuántos operandos
   viajan como indirect-target; al comprobar se abre la traza con la celda
   donde cae cada escritura. */
var REF = { referencia: true };

var PREDICCIONES = [
  {
    id: "alias-dos-nombres",
    titulo: "1. Dos parámetros, una celda",
    opciones: REF,
    enunciado:
      "<code>f</code> triplica <code>p</code> y suma <code>q</code>. Se llama " +
      "con la misma variable en los dos lugares. ¿Cuánto vale y cuántos " +
      "operandos viajan como indirect-target?",
    programa: "let f = proc(p, q) begin set p = *(p, 3); +(p, q) end in let k = 2 in (f k k)",
    campos: ["valor", "indirectos"],
    pista:
      "Las celdas de p y de q guardan indirect-targets a la misma celda, la " +
      "de k. El set escribe 6 ahí, y al leer q se lee ese 6."
  },
  {
    id: "alias-mezcla",
    titulo: "2. Un operando variable y uno calculado",
    opciones: REF,
    enunciado:
      "La lista del final muestra dos cosas: lo que devuelve la llamada y lo " +
      "que queda en <code>k</code>. Escriba la lista como la imprime el " +
      "interpretador, por ejemplo <code>(1 2)</code>.",
    programa: "let f = proc(p, q) begin set q = 0; +(p, q) end in let k = 5 in [(f k add1(k)), k]",
    campos: ["valor", "indirectos"],
    pista:
      "add1(k) no es una variable: q recibe un direct-target con 6 en su " +
      "propia celda, y el set solo cambia esa celda. p apunta a k, que nadie " +
      "modifica."
  },
  {
    id: "alias-capturada",
    titulo: "3. El alias de una variable que el cuerpo también ve",
    opciones: REF,
    enunciado:
      "El cuerpo de <code>f</code> asigna a <code>k</code>, que es libre en " +
      "él, y después devuelve su parámetro. Se llama con <code>k</code>. " +
      "¿Cuánto vale?",
    programa: "let k = 1 in let f = proc(p) begin set k = 10; p end in (f k)",
    campos: ["valor"],
    pista:
      "El set no toca a p: escribe en la celda de k, que la clausura alcanza " +
      "por su cadena. Pero p es un alias de esa misma celda, y al leerlo se " +
      "lee el 10. Por valor, p habría guardado su propio 1."
  },
  {
    id: "alias-dos-niveles",
    titulo: "4. El alias pasa de mano en mano",
    opciones: REF,
    enunciado:
      "<code>f</code> le pasa su parámetro a <code>g</code>, que le suma 100. " +
      "¿Qué lista queda?",
    programa: "let g = proc(r) set r = +(r, 100) in let f = proc(p) begin (g p); p end in let k = 1 in [(f k), k]",
    campos: ["valor", "indirectos"],
    pista:
      "Al llamar (g p), la celda de p ya guarda un indirect-target a k. " +
      "eval-rand lo aplana: r recibe ese mismo indirect-target y no uno que " +
      "apunte a p. El set de g escribe en la celda de k."
  },
  {
    id: "alias-ambiente-inicial",
    titulo: "5. Pasar una variable del ambiente inicial",
    opciones: REF,
    enunciado:
      "<code>f</code> suma <code>a</code> a su parámetro, y se llama dos veces " +
      "con <code>x</code>. En este interpretador el ambiente inicial liga " +
      "<code>x = 1</code> y <code>a = 4</code>. ¿Cuánto vale?",
    programa: "let f = proc(p) set p = +(p, a) in begin (f x); (f x); x end",
    campos: ["valor"],
    pista:
      "La celda de x está en el ambiente inicial, y cada llamada escribe ahí: " +
      "1 + 4 y después 5 + 4. El mismo programa en 1 Asignacion da 4, porque " +
      "allá x empieza en 4 y la llamada no la toca."
  },
  {
    id: "alias-lista",
    titulo: "6. Pasar una lista literal",
    opciones: REF,
    seDetiene: true,
    enunciado:
      "El intérprete admite listas literales, y <code>f</code> devuelve su " +
      "parámetro tal cual. ¿Da un valor o se detiene? Si se detiene, " +
      "escriba <code>error</code>.",
    programa: "let f = proc(p) p in (f [1, 2])",
    campos: ["valor"],
    pista:
      "El operando no es una variable, así que eval-rand lo envuelve en un " +
      "direct-target, y ese constructor exige un valor expresado: número, " +
      "booleano o procedimiento. Una lista no lo es. La lista sola, fuera de " +
      "una aplicación o un let, sí se evalúa."
  }
];

var EJEMPLOS = [
  { programa: "let f = proc(p, q) begin set p = *(p, 3); +(p, q) end in let k = 2 in (f k k)", opciones: REF },
  { programa: "let g = proc(r) set r = +(r, 100) in let f = proc(p) begin (g p); p end in let k = 1 in [(f k), k]", opciones: REF },
  { programa: "let k = 1 in let f = proc(p) begin set k = 10; p end in (f k)", opciones: REF }
];

if (typeof module !== "undefined") { module.exports = { PREDICCIONES: PREDICCIONES, EJEMPLOS: EJEMPLOS }; }

if (typeof document !== "undefined") {
  MotorClausuras.montar({ interprete: InterpreteAsignacion, predicciones: PREDICCIONES,
                          destino: "predicciones", libre: "libre",
                          ejemplos: EJEMPLOS.map(function (e) { return e.programa; }) });
}
