/* Referencias explícitas (EOPL §4.2). Todas las tarjetas corren con el
   intérprete 0 ReferenciasExplicitas: el programa reserva, lee y escribe
   celdas con newref, deref y setref. Se predice el valor y alguna cuenta del
   almacén; al comprobar se abre la traza con cada reserva y cada escritura,
   y la cadena con el almacén dibujado debajo. */
var EXP = { modo: "explicitas" };

var PREDICCIONES = [
  {
    id: "explicitas-dos-nombres",
    titulo: "1. Escribir por un nombre, leer por otro",
    opciones: EXP,
    enunciado:
      "<code>b</code> se liga a lo que vale <code>a</code>. Después se escribe " +
      "a través de <code>b</code> y se lee a través de <code>a</code>. ¿Cuánto " +
      "vale y cuántas celdas reserva el programa?",
    programa: "let a = newref(3) in let b = a in begin setref(b, *(deref(a), 5)); deref(a) end",
    campos: ["valor", "celdas"],
    pista:
      "let b = a copia el valor de a, y ese valor es una referencia: la celda " +
      "es la misma. Hay un solo newref, así que hay una sola celda, y pasa de 3 " +
      "a 15."
  },
  {
    id: "explicitas-intercambio",
    titulo: "2. Intercambiar dos celdas",
    opciones: EXP,
    enunciado:
      "<code>t</code> guarda lo que había en la celda de <code>p</code>; luego " +
      "se escriben las dos celdas. ¿Cuánto vale y cuántas escrituras hay?",
    programa: "let p = newref(1) q = newref(2) in let t = deref(p) in begin setref(p, deref(q)); setref(q, t); -(deref(p), deref(q)) end",
    campos: ["valor", "asignaciones"],
    pista:
      "t no es una referencia: deref(p) devolvió el número 1. Las dos " +
      "escrituras dejan 2 en la celda 0 y 1 en la celda 1, y 2 - 1 = 1."
  },
  {
    id: "explicitas-referencia-guardada",
    titulo: "3. Una referencia dentro de una celda",
    opciones: EXP,
    enunciado:
      "La celda de <code>r</code> guarda otra referencia. ¿Cuánto vale y " +
      "cuántas celdas hay?",
    programa: "let r = newref(newref(4)) in begin setref(deref(r), 10); deref(deref(r)) end",
    campos: ["valor", "celdas"],
    pista:
      "El newref de adentro se evalúa primero y reserva la celda 0 con 4; el " +
      "de afuera reserva la celda 1 con (a-ref 0). deref(r) devuelve (a-ref 0), " +
      "y sobre esa se escribe el 10."
  },
  {
    id: "explicitas-procedimiento",
    titulo: "4. Un procedimiento que recibe una referencia",
    opciones: EXP,
    enunciado:
      "<code>inc</code> suma 1 a la celda que recibe. Se llama tres veces con " +
      "<code>k</code>. ¿Cuánto vale, cuántas escrituras hay y cuántas celdas " +
      "reserva el programa?",
    programa: "let inc = proc(c) setref(c, add1(deref(c))) in let k = newref(0) in begin (inc k); (inc k); (inc k); deref(k) end",
    campos: ["valor", "asignaciones", "celdas"],
    pista:
      "Este intérprete pasa los argumentos por valor, y el valor de k es una " +
      "referencia. c recibe una copia de esa referencia, que apunta a la misma " +
      "celda: las tres escrituras caen en la celda 0."
  },
  {
    id: "explicitas-celdas-nuevas",
    titulo: "5. Dos llamadas, dos celdas",
    opciones: EXP,
    enunciado:
      "<code>nueva</code> reserva una celda con su argumento y devuelve la " +
      "referencia. ¿Qué devuelve <code>deref(b)</code> después de escribir 0 " +
      "en la celda de <code>a</code>?",
    programa: "let nueva = proc(v) newref(v) in let a = (nueva 5) b = (nueva 5) in begin setref(a, 0); deref(b) end",
    campos: ["valor", "celdas"],
    pista:
      "Cada llamada evalúa newref otra vez y cada newref es una celda nueva, " +
      "aunque las dos guarden 5. a y b apuntan a celdas distintas."
  },
  {
    id: "explicitas-numero",
    titulo: "6. setref sobre un número",
    opciones: EXP,
    seDetiene: true,
    enunciado:
      "<code>c</code> se liga a 7. ¿Qué hace el programa? Si se detiene, " +
      "escriba <code>error</code>.",
    programa: "let c = 7 in setref(c, 1)",
    campos: ["valor"],
    pista:
      "setref-exp verifica con referencia? lo que da su primera expresión. 7 " +
      "es un número: «setref: Se esperaba una referencia y se obtuvo: 7»."
  },
  {
    id: "explicitas-sin-nombre",
    titulo: "7. Celdas que nadie nombra",
    opciones: EXP,
    enunciado:
      "Cada vuelta de <code>contar</code> reserva una celda y no la liga a " +
      "nada. ¿Cuánto vale y cuántas celdas quedan en el almacén?",
    programa: "letrec contar(n) = if ==(n, 0) then 0 else begin newref(n); add1((contar sub1(n))) end in (contar 3)",
    campos: ["valor", "celdas"],
    pista:
      "El begin descarta la referencia que devuelve newref, pero la celda ya " +
      "quedó en el almacén. Hay tres vueltas con n distinto de 0: tres celdas, " +
      "con 3, 2 y 1. Ninguna parte del programa puede volver a leerlas."
  },
  {
    id: "explicitas-valor-setref",
    titulo: "8. El valor de setref",
    opciones: EXP,
    enunciado:
      "La suma usa el valor de un <code>setref</code> como primer operando. " +
      "¿Cuánto vale?",
    programa: "let c = newref(5) in +(setref(c, 9), deref(c))",
    campos: ["valor"],
    pista:
      "setref devuelve 1, y la primitiva evalúa sus operandos de izquierda a " +
      "derecha: cuando llega a deref(c), la celda ya tiene 9. 1 + 9 = 10."
  }
];

var EJEMPLOS = [
  { programa: "let saldo = newref(100) in let retirar = proc(m) setref(saldo, -(deref(saldo), m)) in begin (retirar 30); (retirar 20); deref(saldo) end", opciones: EXP },
  { programa: "let inc = proc(c) setref(c, add1(deref(c))) in let k = newref(0) in begin (inc k); (inc k); deref(k) end", opciones: EXP },
  { programa: "let r = newref(newref(4)) in begin setref(deref(r), 10); deref(deref(r)) end", opciones: EXP }
];

if (typeof module !== "undefined") { module.exports = { PREDICCIONES: PREDICCIONES, EJEMPLOS: EJEMPLOS }; }

if (typeof document !== "undefined") {
  MotorClausuras.montar({ interprete: InterpreteAsignacion, predicciones: PREDICCIONES,
                          destino: "predicciones", libre: "libre",
                          ejemplos: EJEMPLOS.map(function (e) { return e.programa; }),
                          opcionesLibre: EXP });
}
