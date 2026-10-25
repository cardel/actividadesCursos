/* letrec con referencias (EOPL §4.3). El marco recursivo guarda nombres,
   parámetros y cuerpos, como en el lenguaje sin asignación; lo nuevo es que
   buscar uno de esos nombres reserva una celda con la clausura recién hecha.
   Se predicen el valor y cuántas celdas y clausuras aparecen; al comprobar
   se abre la traza con cada reserva y el almacén dibujado. */
var PREDICCIONES = [
  {
    id: "letrec-dos-llamadas",
    titulo: "1. Dos llamadas, dos búsquedas",
    enunciado:
      "<code>doble</code> se aplica dos veces. ¿Cuánto vale, cuántas celdas " +
      "reserva el programa y cuántas clausuras se crean?",
    programa: "letrec doble(n) = *(n, 2) in +((doble 1), (doble 2))",
    campos: ["valor", "celdas", "clausuras"],
    pista:
      "Cada aplicación busca doble, y cada búsqueda fabrica una clausura y le " +
      "reserva una celda. Además cada llamada reserva la celda de su n: dos " +
      "más dos."
  },
  {
    id: "letrec-sin-nombrar",
    titulo: "2. Un procedimiento que nadie nombra",
    enunciado:
      "El cuerpo del <code>letrec</code> no menciona a <code>f</code>. " +
      "¿Cuánto vale y cuántas celdas reserva?",
    programa: "letrec f(n) = n in 7",
    campos: ["valor", "celdas"],
    pista:
      "El marco recursivo se crea sin reservar nada: guarda las tres listas. " +
      "Las celdas aparecen al buscar el nombre, y aquí nadie lo busca."
  },
  {
    id: "letrec-nombrar",
    titulo: "3. Nombrar sin aplicar",
    enunciado:
      "El cuerpo es solo el nombre. ¿Cuánto vale y cuántas celdas reserva? " +
      "Si el valor es una clausura, basta con escribir <code>clausura</code>.",
    programa: "letrec f(n) = n in f",
    campos: ["valor", "celdas"],
    pista:
      "var-exp hace deref de lo que devuelve apply-env, y apply-env acaba de " +
      "reservar una celda con la clausura. El valor es la clausura, y la celda " +
      "6 queda con ella."
  },
  {
    id: "letrec-recursion",
    titulo: "4. Una recursión de tres llamadas",
    enunciado:
      "<code>cuenta</code> baja de 2 a 0. ¿Cuánto vale y cuántas celdas " +
      "reserva el programa?",
    programa: "letrec cuenta(n) = if ==(n, 0) then 0 else add1((cuenta sub1(n))) in (cuenta 2)",
    campos: ["valor", "celdas"],
    pista:
      "Tres llamadas, con 2, 1 y 0. Cada una cuesta dos celdas: la de la " +
      "clausura, al buscar cuenta, y la de n."
  },
  {
    id: "letrec-copia-en-let",
    titulo: "5. Asignar a una copia",
    enunciado:
      "<code>h</code> se liga con <code>let</code> a lo que vale " +
      "<code>g</code>, y después se le asigna 5. ¿Cuánto vale y cuántas " +
      "celdas reserva?",
    programa: "letrec g(n) = 1 in let h = g in begin set h = 5; h end",
    campos: ["valor", "celdas"],
    pista:
      "h tiene su propia celda, la que reservó el let, y el set escribe ahí. " +
      "La búsqueda de g reservó otra, la 6, con la clausura."
  },
  {
    id: "letrec-asignar-nombre",
    titulo: "6. Asignar al nombre del letrec",
    enunciado:
      "Ahora el <code>set</code> va sobre <code>g</code> mismo, y después se " +
      "lee <code>g</code>. ¿Qué vale? Si es una clausura, escriba " +
      "<code>clausura</code>.",
    programa: "letrec g(n) = 1 in begin set g = 5; g end",
    campos: ["valor", "celdas"],
    pista:
      "set g busca g, y la búsqueda reserva una celda nueva con una clausura; " +
      "el 5 se escribe ahí. La lectura de g vuelve a buscar y reserva otra " +
      "celda con otra clausura. La asignación no se ve."
  },
  {
    id: "letrec-mutua",
    titulo: "7. Dos procedimientos en el mismo marco",
    enunciado:
      "<code>par</code> e <code>impar</code> se llaman entre sí. ¿Cuánto " +
      "vale <code>(par 2)</code> y cuántas celdas reserva el programa?",
    programa: "letrec par(n) = if ==(n, 0) then 1 else (impar sub1(n)) impar(n) = if ==(n, 0) then 0 else (par sub1(n)) in (par 2)",
    campos: ["valor", "celdas"],
    pista:
      "Hay tres llamadas: par con 2, impar con 1 y par con 0. Cada una busca " +
      "un nombre del marco, que reserva la celda de la clausura, y reserva la " +
      "de su n."
  }
];

var EJEMPLOS = [
  "letrec doble(n) = *(n, 2) in +((doble 1), (doble 2))",
  "letrec g(n) = 1 in begin set g = 5; g end",
  "letrec cuenta(n) = if ==(n, 0) then 0 else add1((cuenta sub1(n))) in (cuenta 2)"
];

if (typeof module !== "undefined") { module.exports = { PREDICCIONES: PREDICCIONES, EJEMPLOS: EJEMPLOS }; }

if (typeof document !== "undefined") {
  MotorClausuras.montar({ interprete: InterpreteAsignacion, predicciones: PREDICCIONES,
                          destino: "predicciones", libre: "libre", ejemplos: EJEMPLOS });
}
