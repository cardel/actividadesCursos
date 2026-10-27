/* Clausuras y estado compartido. Con el ambiente de referencias, una clausura
   comparte las celdas del ambiente que capturó y ve lo que se asigne después.
   Las cuatro primeras tarjetas contrastan esa regla con la otra posible: que
   la clausura se quedara con una copia de los valores al crearse. Las dos
   últimas corren solo con la regla del interpretador. */
var MODOS = [
  { rotulo: "Con celdas compartidas", opciones: {},
    titulo: "Con celdas compartidas, como el interpretador" },
  { rotulo: "Si la clausura copiara los valores", opciones: { copia: true },
    titulo: "Si la clausura copiara los valores al crearse, para comparar" }
];

var PREDICCIONES = [
  {
    id: "compartir-tasa",
    titulo: "1. La tarifa cambia después de crear el procedimiento",
    modos: MODOS,
    enunciado:
      "<code>cobrar</code> multiplica por <code>tasa</code>, que no es " +
      "parámetro suyo. Entre la creación de la clausura y la llamada, " +
      "<code>tasa</code> pasa de 10 a 20. Diga qué da con cada regla.",
    programa: "let tasa = 10 in let cobrar = proc(m) *(m, tasa) in begin set tasa = 20; (cobrar 3) end",
    pista:
      "La clausura guarda el ambiente donde se creó. Si ese ambiente guarda " +
      "referencias, el cuerpo lee la celda de tasa cuando se ejecuta, y para " +
      "entonces la celda ya tiene 20. Una copia se habría quedado con el 10."
  },
  {
    id: "compartir-despues",
    titulo: "2. La clausura nace después de la asignación",
    modos: MODOS,
    enunciado:
      "Ahora el <code>set</code> va primero y el procedimiento se crea " +
      "después, ya dentro del <code>begin</code>.",
    programa: "let t = 1 in begin set t = 5; let leer = proc() t in (leer) end",
    razonIguales:
      "cuando se crea la clausura, la celda de t ya guarda 5, y la copia " +
      "también se habría hecho con 5. Las dos reglas solo se separan si la " +
      "asignación ocurre entre la creación de la clausura y su llamada.",
    pista: "Mire en qué orden ocurren la asignación y la creación de la clausura."
  },
  {
    id: "compartir-saldo",
    titulo: "3. Un procedimiento escribe y otro lee",
    modos: MODOS,
    enunciado:
      "<code>retirar</code> asigna a <code>saldo</code> y <code>ver</code> " +
      "lo lee. Las dos clausuras se crean antes de las dos llamadas a " +
      "<code>retirar</code>.",
    programa: "let saldo = 100 in let retirar = proc(m) set saldo = -(saldo, m) in let ver = proc() saldo in begin (retirar 30); (retirar 20); (ver) end",
    pista:
      "Con referencias, cada clausura capturó el eslabón que había cuando se " +
      "creó, y las dos cadenas pasan por el de saldo: llegan a la misma " +
      "celda, así que lo que escribe retirar lo lee ver. " +
      "Con copias, cada clausura tendría su propio saldo y ver seguiría " +
      "viendo el 100 con que se creó."
  },
  {
    id: "compartir-parametro",
    titulo: "4. La asignación al parámetro",
    modos: MODOS,
    enunciado:
      "<code>f</code> asigna 0 a su parámetro y lo devuelve. Al final se " +
      "suma lo que devolvió con <code>n</code>.",
    programa: "let n = 7 in let f = proc(m) begin set m = 0; m end in +((f n), n)",
    razonIguales:
      "el set escribe en la celda de m, que la aplicación crea para esa " +
      "llamada y que no es la de n. Ni compartir ni copiar el ambiente " +
      "cambia eso: la celda de n no la toca nadie.",
    pista: "Pregúntese en qué celda escribe el set: la de m o la de n."
  },
  {
    id: "compartir-contadores",
    titulo: "5. Dos contadores, cada uno con su celda",
    enunciado:
      "<code>crear</code> abre un <code>let c = 0</code> en cada llamada y " +
      "devuelve un procedimiento que incrementa ese <code>c</code>. Se crean " +
      "dos contadores, <code>p</code> y <code>q</code>. ¿Cuánto vale el " +
      "programa, cuántas asignaciones se ejecutan y cuántas celdas se crean?",
    programa: "let crear = proc() let c = 0 in proc() begin set c = add1(c); c end in let p = (crear) q = (crear) in begin (p); (p); (q); +((p), (q)) end",
    campos: ["valor", "asignaciones", "celdas"],
    pista:
      "Cada llamada a crear evalúa el let de su cuerpo, y cada let crea una " +
      "celda nueva para c. p cuenta 1, 2 y 3; q cuenta 1 y 2. Las celdas son " +
      "la de crear, las de p y q, y una c por contador; las llamadas sin " +
      "argumentos crean un eslabón sin celdas."
  },
  {
    id: "compartir-un-contador",
    titulo: "6. Dos contadores que comparten la celda",
    enunciado:
      "El mismo programa con el <code>let c = 0</code> afuera de " +
      "<code>crear</code>. ¿Cuánto vale y cuántas celdas se crean?",
    programa: "let c = 0 in let crear = proc() proc() begin set c = add1(c); c end in let p = (crear) q = (crear) in begin (p); (p); (q); +((p), (q)) end",
    campos: ["valor", "celdas"],
    pista:
      "Ahora hay una sola celda para c, en el eslabón de más afuera, y las " +
      "dos clausuras la alcanzan por su cadena. Cada llamada a p o a q la " +
      "incrementa: 1, 2, 3, y después 4 y 5."
  }
];

var EJEMPLOS = [
  "let tasa = 10 in let cobrar = proc(m) *(m, tasa) in begin set tasa = 20; (cobrar 3) end",
  "let saldo = 100 in let retirar = proc(m) set saldo = -(saldo, m) in let ver = proc() saldo in begin (retirar 30); (retirar 20); (ver) end",
  "let crear = proc() let c = 0 in proc() begin set c = add1(c); c end in let p = (crear) q = (crear) in begin (p); (p); (q); +((p), (q)) end"
];

if (typeof module !== "undefined") { module.exports = { PREDICCIONES: PREDICCIONES, EJEMPLOS: EJEMPLOS }; }

if (typeof document !== "undefined") {
  MotorClausuras.montar({ interprete: InterpreteAsignacion, predicciones: PREDICCIONES,
                          destino: "predicciones", libre: "libre", ejemplos: EJEMPLOS });
}
