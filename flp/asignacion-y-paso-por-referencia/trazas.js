/* Trazas completas con asignación. Se predice el valor y los conteos, y al
   comprobar la página abre la traza con cada asignación marcada en su lugar,
   la cadena de ambientes y lo que guarda cada celda al terminar. */
var PREDICCIONES = [
  {
    id: "trazas-acumulado",
    titulo: "1. Un acumulador fuera de la recursión",
    enunciado:
      "<code>sumar</code> baja de 4 a 0 y en cada vuelta suma <code>n</code> " +
      "a <code>total</code>, que vive afuera del <code>letrec</code>. ¿Cuánto " +
      "vale, cuántas asignaciones se ejecutan y cuántos ambientes se crean?",
    programa: "let total = 0 in letrec sumar(n) = if ==(n, 0) then total else begin set total = +(total, n); (sumar sub1(n)) end in (sumar 4)",
    campos: ["valor", "asignaciones", "ambientes"],
    pista:
      "Hay una asignación por cada vuelta con n distinto de 0: cuatro. Los " +
      "ambientes son el del let, el marco del letrec y uno por llamada, y las " +
      "llamadas son cinco porque la última recibe 0. Todas las llamadas " +
      "escriben en la misma celda de total."
  },
  {
    id: "trazas-parametro",
    titulo: "2. Doblar el parámetro dos veces",
    enunciado:
      "<code>doblar</code> asigna a su parámetro el doble y lo devuelve. Se " +
      "llama dos veces con <code>v</code> y al final se lee <code>v</code>. " +
      "¿Cuánto vale, cuántas celdas se crean y cuántas asignaciones se " +
      "ejecutan?",
    programa: "let v = 3 in let doblar = proc(w) begin set w = *(w, 2); w end in begin (doblar v); (doblar v); v end",
    campos: ["valor", "celdas", "asignaciones"],
    pista:
      "Cada llamada crea una celda nueva para w con una copia del valor de v. " +
      "Las dos asignaciones caen en esas celdas, una en cada una, y la de v " +
      "sigue con 3. Celdas: v, doblar y una w por llamada."
  },
  {
    id: "trazas-pila",
    titulo: "3. Tres llamadas que escriben en la misma celda",
    enunciado:
      "<code>meter</code> corre las cifras de <code>pila</code> un lugar y " +
      "pone <code>k</code> al final. ¿Cuánto vale, cuántos procedimientos se " +
      "aplican y cuántas asignaciones se ejecutan?",
    programa: "let pila = 0 in let meter = proc(k) set pila = +(*(pila, 10), k) in begin (meter 4); (meter 2); (meter 7); pila end",
    campos: ["valor", "applyProc", "asignaciones"],
    pista:
      "La celda de pila pasa por 4, 42 y 427. El cuerpo de meter es un set, " +
      "así que cada llamada devuelve 1 y el begin lo descarta; lo que se " +
      "lee al final es la celda."
  },
  {
    id: "trazas-reasignar-letrec",
    titulo: "4. Reasignar un procedimiento recursivo",
    enunciado:
      "<code>g</code> se liga a lo que vale <code>f</code> en ese momento. " +
      "Después se asigna a <code>f</code> un procedimiento nuevo. ¿Cuánto " +
      "vale la suma y cuántas clausuras se crean?",
    programa: "letrec f(n) = *(n, 2) in let g = f in begin set f = proc(n) +(n, 1); +((f 10), (g 10)) end",
    campos: ["valor", "clausuras"],
    pista:
      "El let copió en la celda de g la clausura que había en la celda de f. " +
      "El set cambia solo la celda de f: (f 10) da 11 con la clausura nueva, " +
      "(g 10) da 20 con la vieja."
  },
  {
    id: "trazas-ambiente-inicial",
    titulo: "5. Asignar al ambiente inicial",
    enunciado:
      "Este programa no crea ninguna ligadura: asigna directamente a " +
      "<code>y</code> y a <code>x</code>, que están en el ambiente inicial. " +
      "¿Cuánto vale, cuántos ambientes se crean y cuántas asignaciones se " +
      "ejecutan?",
    programa: "begin set y = +(x, y); set x = -(y, x); x end",
    campos: ["valor", "ambientes", "asignaciones"],
    pista:
      "Con x = 4 e y = 2, el primer set deja 6 en la celda de y y el segundo " +
      "deja 6 - 4 en la de x. Ninguna construcción del programa extiende el " +
      "ambiente: begin y set trabajan sobre el que hay."
  }
];

var EJEMPLOS = [
  "let total = 0 in letrec sumar(n) = if ==(n, 0) then total else begin set total = +(total, n); (sumar sub1(n)) end in (sumar 4)",
  "letrec f(n) = *(n, 2) in let g = f in begin set f = proc(n) +(n, 1); +((f 10), (g 10)) end",
  "begin set y = +(x, y); set x = -(y, x); x end"
];

if (typeof module !== "undefined") { module.exports = { PREDICCIONES: PREDICCIONES, EJEMPLOS: EJEMPLOS }; }

if (typeof document !== "undefined") {
  MotorClausuras.montar({ interprete: InterpreteAsignacion, predicciones: PREDICCIONES,
                          destino: "predicciones", libre: "libre", ejemplos: EJEMPLOS });
}
