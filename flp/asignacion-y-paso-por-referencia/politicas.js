/* Paso por valor y paso por referencia sobre el mismo programa. Por valor,
   cada aplicación crea celdas nuevas con los valores de los operandos; por
   referencia, un operando que es una variable pasa su celda. Se predicen los
   dos resultados y después se abren las dos trazas. */
var MODOS = [
  { rotulo: "Por valor", opciones: {},
    titulo: "Por valor, con el interpretador 1 Asignacion" },
  { rotulo: "Por referencia", opciones: { referencia: true },
    titulo: "Por referencia, con el interpretador 2 PasoPorReferencia" }
];

var PREDICCIONES = [
  {
    id: "politicas-subir",
    titulo: "1. Incrementar el parámetro",
    modos: MODOS,
    enunciado:
      "<code>subir</code> suma 1 a su parámetro. Se llama dos veces con " +
      "<code>m</code> y al final se lee <code>m</code>.",
    programa: "let subir = proc(v) set v = add1(v) in let m = 5 in begin (subir m); (subir m); m end",
    pista:
      "Por valor, v es una celda nueva en cada llamada y m no se entera. Por " +
      "referencia, la celda de v guarda un indirect-target a la de m, y cada " +
      "set sigue esa indirección y escribe en m."
  },
  {
    id: "politicas-no-variable",
    titulo: "2. El operando no es una variable",
    modos: MODOS,
    enunciado:
      "El mismo <code>subir</code>, ahora llamado con <code>+(m, 0)</code>, " +
      "que vale lo mismo que <code>m</code>.",
    programa: "let subir = proc(v) set v = add1(v) in let m = 5 in begin (subir +(m, 0)); m end",
    razonIguales:
      "+(m, 0) no es una variable, así que eval-rand lo evalúa y lo envuelve " +
      "en un direct-target: v recibe su propia celda, como por valor. Lo que " +
      "decide es la forma del operando, no lo que vale.",
    pista: "Mire qué forma tiene el operando: ¿es una var-exp?"
  },
  {
    id: "politicas-tomar",
    titulo: "3. Dos llamadas en la misma multiplicación",
    modos: MODOS,
    enunciado:
      "<code>tomar</code> resta 1 a su parámetro y lo devuelve. Se " +
      "multiplican dos llamadas con <code>n</code>.",
    programa: "let n = 10 in let tomar = proc(k) begin set k = -(k, 1); k end in *((tomar n), (tomar n))",
    pista:
      "Por referencia, la primera llamada deja 9 en la celda de n y la " +
      "segunda parte de ahí: 9 por 8. Por valor, las dos parten de 10."
  },
  {
    id: "politicas-intercambiar",
    titulo: "4. Intercambiar dos variables",
    modos: MODOS,
    enunciado:
      "<code>cambiar</code> intercambia sus dos parámetros con una " +
      "temporal. Después se resta <code>u</code> menos <code>w</code>.",
    programa: "let cambiar = proc(p, q) let t = p in begin set p = q; set q = t end in let u = 1 w = 2 in begin (cambiar u w); -(u, w) end",
    pista:
      "El let de adentro es por valor en los dos interpretadores: t guarda " +
      "una copia de p. Lo que cambia es dónde escriben los dos set: en celdas " +
      "propias de la llamada o en las de u y w."
  },
  {
    id: "politicas-dos-saltos",
    titulo: "5. La referencia atraviesa dos llamadas",
    modos: MODOS,
    enunciado:
      "<code>pasar</code> no asigna nada: le entrega su parámetro a " +
      "<code>fijar</code>, que sí asigna.",
    programa: "let fijar = proc(v) set v = 0 in let pasar = proc(w) (fijar w) in let m = 8 in begin (pasar m); m end",
    pista:
      "Por referencia, w guarda un indirect-target a m. Al llamar (fijar w), " +
      "eval-rand ve que la celda de w ya es indirecta y le pasa a v esa misma " +
      "referencia, la de m, en vez de crear un indirecto a un indirecto."
  },
  {
    id: "politicas-procedimiento",
    titulo: "6. El operando es un procedimiento",
    modos: MODOS,
    enunciado:
      "<code>anular</code> asigna 0 a su parámetro. Se llama con " +
      "<code>doble</code>, que es un procedimiento, y al final se lee " +
      "<code>doble</code>. Si cree que el valor es una clausura, escriba " +
      "<code>clausura</code>.",
    programa: "let anular = proc(h) set h = 0 in let doble = proc(n) *(n, 2) in begin (anular doble); doble end",
    pista:
      "doble es una variable como cualquier otra, y su celda guarda una " +
      "clausura. Por referencia, h apunta a esa celda y el set la cambia por " +
      "un 0."
  }
];

var EJEMPLOS = [
  "let subir = proc(v) set v = add1(v) in let m = 5 in begin (subir m); (subir m); m end",
  "let cambiar = proc(p, q) let t = p in begin set p = q; set q = t end in let u = 1 w = 2 in begin (cambiar u w); -(u, w) end",
  "let fijar = proc(v) set v = 0 in let pasar = proc(w) (fijar w) in let m = 8 in begin (pasar m); m end"
];

if (typeof module !== "undefined") { module.exports = { PREDICCIONES: PREDICCIONES, EJEMPLOS: EJEMPLOS }; }

if (typeof document !== "undefined") {
  MotorClausuras.montar({ interprete: InterpreteAsignacion, predicciones: PREDICCIONES,
                          destino: "predicciones", libre: "libre", ejemplos: EJEMPLOS });
}
