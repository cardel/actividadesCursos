/* El orden de evaluación. Sin asignación, el orden en que el interpretador
   evalúa las partes de una expresión no se nota; con set, cambia el valor y
   hasta decide si el programa se detiene. Cada tarjeta pide predecir y
   después abre la traza, con cada asignación marcada en su lugar. */
var PREDICCIONES = [
  {
    id: "orden-izquierda",
    titulo: "1. La asignación en el primer operando",
    enunciado:
      "El primer operando de la suma asigna a <code>k</code> y devuelve su " +
      "valor nuevo; el segundo lee <code>k</code>. ¿Cuánto vale?",
    programa: "let k = 1 in +(begin set k = *(k, 10); k end, k)",
    campos: ["valor", "asignaciones"],
    pista:
      "prim-exp evalúa sus operandos con map, de izquierda a derecha. Cuando " +
      "llega al segundo, la celda de k ya tiene 10."
  },
  {
    id: "orden-derecha",
    titulo: "2. La misma asignación, en el segundo operando",
    enunciado:
      "Los mismos dos operandos, en el otro orden. ¿Cuánto vale ahora?",
    programa: "let k = 1 in +(k, begin set k = *(k, 10); k end)",
    campos: ["valor"],
    pista:
      "La k de la izquierda se lee antes de la asignación y vale 1. La suma " +
      "es la misma operación con los mismos textos, y el resultado cambia " +
      "solo por el orden: eso es perder la transparencia referencial."
  },
  {
    id: "orden-let",
    titulo: "3. Dos ligaduras del mismo let",
    enunciado:
      "La primera ligadura asigna a <code>n</code>; la segunda lo usa. Las " +
      "dos se evalúan en el ambiente de afuera, antes de crear el eslabón " +
      "nuevo. ¿Cuánto vale y cuántas celdas se crean?",
    programa: "let n = 2 in let p = begin set n = add1(n); n end q = *(n, n) in -(q, p)",
    campos: ["valor", "celdas"],
    pista:
      "let-exp evalúa los operandos de izquierda a derecha y solo después " +
      "crea el eslabón con p y q. Cuando se evalúa *(n, n), la celda de n " +
      "ya tiene 3: q vale 9 y p vale 3."
  },
  {
    id: "orden-operador-despues",
    titulo: "4. El operando cambia al operador",
    enunciado:
      "El operando asigna un procedimiento nuevo a <code>g</code>, el " +
      "mismo nombre que está en la posición del operador. ¿Cuánto vale y " +
      "cuántas clausuras se crean?",
    programa: "let g = proc(v) +(v, 1) in (g begin set g = proc(v) *(v, 100); 2 end)",
    campos: ["valor", "clausuras"],
    pista:
      "app-exp evalúa primero los operandos y después el operador. Cuando " +
      "busca g, el set ya escribió en su celda la clausura que multiplica " +
      "por 100."
  },
  {
    id: "orden-se-salva",
    titulo: "5. Un operador que no era procedimiento",
    enunciado:
      "<code>f</code> empieza ligado a 5, que no es un procedimiento. ¿El " +
      "programa se detiene o da un valor? Si se detiene, escriba " +
      "<code>error</code>.",
    programa: "let f = 5 in (f begin set f = proc(v) add1(v); 9 end)",
    campos: ["valor"],
    pista:
      "La verificación procval? se hace sobre el valor del operador, y el " +
      "operador se evalúa después del operando. Para entonces f ya guarda " +
      "una clausura. Con el orden contrario el programa se detendría."
  },
  {
    id: "orden-begin-set",
    titulo: "6. Un begin que termina en set",
    enunciado:
      "Las dos expresiones del <code>begin</code> son asignaciones. ¿Cuánto " +
      "vale el programa y cuántas asignaciones se ejecutan?",
    programa: "let r = 4 in begin set r = +(r, r); set r = +(r, r) end",
    campos: ["valor", "asignaciones"],
    pista:
      "El valor de un begin es el de su última expresión, y set devuelve 1. " +
      "El 16 queda en la celda de r, pero nadie lo lee."
  },
  {
    id: "orden-prueba-if",
    titulo: "7. La prueba del if asigna",
    enunciado:
      "La prueba del <code>if</code> es un <code>begin</code> que asigna y " +
      "después compara. ¿Cuánto vale?",
    programa: "let t = 0 in if begin set t = 3; >(t, 2) end then *(t, 2) else 0",
    campos: ["valor"],
    pista:
      "La prueba se evalúa completa antes de escoger la rama, y el begin " +
      "devuelve el valor de la comparación, un booleano: la verificación " +
      "con boolean? pasa. La rama escogida ya ve t = 3."
  }
];

var EJEMPLOS = [
  "let k = 1 in +(begin set k = *(k, 10); k end, k)",
  "let g = proc(v) +(v, 1) in (g begin set g = proc(v) *(v, 100); 2 end)",
  "let f = 5 in (f begin set f = proc(v) add1(v); 9 end)"
];

if (typeof module !== "undefined") { module.exports = { PREDICCIONES: PREDICCIONES, EJEMPLOS: EJEMPLOS }; }

if (typeof document !== "undefined") {
  MotorClausuras.montar({ interprete: InterpreteAsignacion, predicciones: PREDICCIONES,
                          destino: "predicciones", libre: "libre", ejemplos: EJEMPLOS });
}
