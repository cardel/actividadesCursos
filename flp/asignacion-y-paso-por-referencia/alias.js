/* Paso por referencia: alias (EOPL §4.5.1). Todas las tarjetas corren con el
   intérprete 2 PasoPorReferencia. Se predice el valor y, en algunas, cuántos
   operandos entregan su propia celda; al comprobar se abre la traza con cada
   reserva y cada escritura, y el ambiente con el almacén dibujado, donde un
   alias se ve como dos flechas que llegan a la misma celda. */
var REF = { referencia: true };

var PREDICCIONES = [
  {
    id: "alias-dos-nombres",
    titulo: "1. Dos parámetros, una celda",
    opciones: REF,
    enunciado:
      "<code>f</code> triplica <code>p</code> y suma <code>q</code>. Se llama " +
      "con la misma variable en los dos lugares. ¿Cuánto vale y cuántos " +
      "operandos entregan su propia celda?",
    programa: "let f = proc(p, q) begin set p = *(p, 3); +(p, q) end in let k = 2 in (f k k)",
    campos: ["valor", "compartidas"],
    pista:
      "Los dos operandos son la variable k, así que p y q reciben la misma " +
      "referencia. El set escribe 6 en la celda de k, y al leer q se lee ese " +
      "6: 6 + 6."
  },
  {
    id: "alias-mezcla",
    titulo: "2. Un operando variable y uno calculado",
    opciones: REF,
    enunciado:
      "<code>f</code> pone 0 en <code>q</code> y suma sus parámetros. Al " +
      "final se suma lo que devuelve la llamada con diez veces " +
      "<code>k</code>. ¿Cuánto vale y cuántas celdas reserva el programa?",
    programa: "let f = proc(p, q) begin set q = 0; +(p, q) end in let k = 5 in +((f k add1(k)), *(k, 10))",
    campos: ["valor", "celdas"],
    pista:
      "add1(k) no es una variable: q recibe una celda nueva con 6, y el set " +
      "solo cambia esa. p comparte la celda de k, que nadie modifica. Celdas: " +
      "f, k y la de q."
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
      "por su cadena. Pero p nombra esa misma celda, y al leerlo se lee el 10. " +
      "Por valor, p habría guardado su propio 1."
  },
  {
    id: "alias-dos-niveles",
    titulo: "4. El alias pasa de mano en mano",
    opciones: REF,
    enunciado:
      "<code>f</code> le pasa su parámetro a <code>g</code>, que le suma 100. " +
      "Al final se suma lo que devuelve <code>(f k)</code> con mil veces " +
      "<code>k</code>. ¿Cuánto vale y cuántos operandos entregan su propia " +
      "celda?",
    programa: "let g = proc(r) set r = +(r, 100) in let f = proc(p) begin (g p); p end in let k = 1 in +((f k), *(k, 1000))",
    campos: ["valor", "compartidas"],
    pista:
      "p recibe la referencia de k, y al llamar (g p), p es una variable: r " +
      "recibe esa misma referencia. El set de g escribe 101 en la celda de k. " +
      "(f k) devuelve 101 y k vale 101."
  },
  {
    id: "alias-ambiente-inicial",
    titulo: "5. Pasar una variable del ambiente inicial",
    opciones: REF,
    enunciado:
      "<code>f</code> suma <code>a</code> a su parámetro, y se llama dos veces " +
      "con <code>x</code>. El ambiente inicial liga <code>x = 4</code> y " +
      "<code>a = 4</code>. ¿Cuánto vale?",
    programa: "let f = proc(p) set p = +(p, a) in begin (f x); (f x); x end",
    campos: ["valor"],
    pista:
      "La celda de x es la 0, del ambiente inicial, y cada llamada escribe " +
      "ahí: 4 + 4 y después 8 + 4. El mismo programa en 1 Asignacion da 4, " +
      "porque cada llamada escribe en una celda propia."
  },
  {
    id: "alias-letrec",
    titulo: "6. Pasar un nombre de letrec",
    opciones: REF,
    enunciado:
      "<code>anular</code> pone 0 en su parámetro. Se le pasa " +
      "<code>g</code>, declarado en un <code>letrec</code>, y después se " +
      "aplica <code>g</code>. ¿Cuánto vale?",
    programa: "letrec g(n) = n in let anular = proc(h) set h = 0 in begin (anular g); (g 5) end",
    campos: ["valor", "celdas"],
    pista:
      "g es una variable, así que h recibe la referencia que devuelve " +
      "apply-env. Pero buscar un nombre de letrec reserva una celda nueva con " +
      "una clausura recién hecha: el 0 cae en esa celda. (g 5) vuelve a " +
      "buscar g y encuentra otra clausura."
  }
];

var EJEMPLOS = [
  { programa: "let f = proc(p, q) begin set p = *(p, 3); +(p, q) end in let k = 2 in (f k k)", opciones: REF },
  { programa: "let g = proc(r) set r = +(r, 100) in let f = proc(p) begin (g p); p end in let k = 1 in +((f k), *(k, 1000))", opciones: REF },
  { programa: "let k = 1 in let f = proc(p) begin set k = 10; p end in (f k)", opciones: REF }
];

if (typeof module !== "undefined") { module.exports = { PREDICCIONES: PREDICCIONES, EJEMPLOS: EJEMPLOS }; }

if (typeof document !== "undefined") {
  MotorClausuras.montar({ interprete: InterpreteAsignacion, predicciones: PREDICCIONES,
                          destino: "predicciones", libre: "libre",
                          ejemplos: EJEMPLOS.map(function (e) { return e.programa; }) });
}
