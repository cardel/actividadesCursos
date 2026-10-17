/* Ejercicio interactivo: de la frase a la formula.
   Cada frase trae su referencia (lo que la frase dice, escrito como funcion)
   y cuatro formulas; cada formula trae tambien su funcion, de modo que el
   contraejemplo que se muestra se evalua aqui mismo y no se escribe a mano. */
var EJERCICIO = (function () {

  /* Los cuantificadores sin rango recorren los enteros; para un arreglo de
     largo n basta mirar de -2 a n + 1, que incluye posiciones de los dos
     lados por fuera del arreglo. */
  function todos(n, f) {
    var ok = true;
    var i;
    for (i = -2; i <= n + 1; i = i + 1) { ok = ok && f(i); }
    return ok;
  }
  function alguno(n, f) {
    var ok = false;
    var i;
    for (i = -2; i <= n + 1; i = i + 1) { ok = ok || f(i); }
    return ok;
  }
  function dentro(i, ini, fin) { return ini <= i && i < fin; }

  /* Cuantificadores sobre un conjunto finito de indices 0..m-1. */
  function paraTodo(m, f) {
    var ok = true;
    var i;
    for (i = 0; i < m; i = i + 1) { ok = ok && f(i); }
    return ok;
  }
  function existe(m, f) {
    var ok = false;
    var i;
    for (i = 0; i < m; i = i + 1) { ok = ok || f(i); }
    return ok;
  }

  var ARREGLO = "A es un arreglo A[0..n − 1] de enteros; i, s y t recorren los enteros.";
  var MATERIAS = "e recorre los estudiantes y m las materias. Ap(e, m): e aprobó la materia m.";
  var EXAMEN = "e recorre los estudiantes. Es(e): e estudió para el examen. Pa(e): e pasó el examen.";

  var FRASES = [
    {
      frase: "Todos los elementos de A son menores que 10.",
      dominio: ARREGLO, tipo: "arreglo", prueba: { vals: [3, 9, 10, 12], minN: 0, maxN: 3 },
      ref: function (A) { return A.every(function (x) { return x < 10; }); },
      opciones: [
        { f: "∀i (0 ≤ i < n ∧ A[i] < 10)",
          ev: function (A) { var n = A.length; return todos(n, function (i) { return dentro(i, 0, n) && A[i] < 10; }); },
          por: "Con ∧ la fórmula exige que todo entero i esté entre 0 y n − 1. Con i = −1 eso falla, así que es falsa para cualquier arreglo.",
          contra: [3, 4] },
        { f: "∀i (0 ≤ i < n → A[i] < 10)", ok: true,
          ev: function (A) { var n = A.length; return todos(n, function (i) { return !dentro(i, 0, n) || A[i] < 10; }); },
          por: "El rango va como antecedente de la implicación. En las posiciones de A se exige A[i] < 10; en cualquier otro entero el antecedente es falso y la implicación se cumple sola." },
        { f: "∃i (0 ≤ i < n ∧ A[i] < 10)",
          ev: function (A) { var n = A.length; return alguno(n, function (i) { return dentro(i, 0, n) && A[i] < 10; }); },
          por: "Dice que al menos un elemento es menor que 10, no que todos lo sean.",
          contra: [3, 12] },
        { f: "∀i (0 ≤ i ≤ n → A[i] < 10)", fuera: true,
          ev: function (A) { var n = A.length; return todos(n, function (i) { return !(0 <= i && i <= n) || A[i] < 10; }); },
          por: "El rango llega hasta i = n, y A[n] no existe: la fórmula pregunta por una casilla que está por fuera del arreglo." }
      ]
    },
    {
      frase: "Algún elemento de A es negativo.",
      dominio: ARREGLO, tipo: "arreglo", prueba: { vals: [-3, 0, 2], minN: 0, maxN: 3 },
      ref: function (A) { return A.some(function (x) { return x < 0; }); },
      opciones: [
        { f: "∀i (0 ≤ i < n → A[i] < 0)",
          ev: function (A) { var n = A.length; return todos(n, function (i) { return !dentro(i, 0, n) || A[i] < 0; }); },
          por: "Pide que todos los elementos sean negativos, y la frase se conforma con uno.",
          contra: [-3, 4] },
        { f: "∃i (0 ≤ i < n → A[i] < 0)",
          ev: function (A) { var n = A.length; return alguno(n, function (i) { return !dentro(i, 0, n) || A[i] < 0; }); },
          por: "Con → basta un i por fuera del rango. Con i = −1 el antecedente es falso, la implicación es verdadera y la fórmula vale para cualquier arreglo.",
          contra: [1, 2] },
        { f: "∃i (1 ≤ i < n ∧ A[i] < 0)",
          ev: function (A) { var n = A.length; return alguno(n, function (i) { return dentro(i, 1, n) && A[i] < 0; }); },
          por: "El rango arranca en 1 y deja por fuera a A[0].",
          contra: [-3, 4] },
        { f: "∃i (0 ≤ i < n ∧ A[i] < 0)", ok: true,
          ev: function (A) { var n = A.length; return alguno(n, function (i) { return dentro(i, 0, n) && A[i] < 0; }); },
          por: "Pide un testigo i con A[i] < 0. Con ∃ el rango va unido por ∧, porque el testigo tiene que ser una posición del arreglo." }
      ]
    },
    {
      frase: "A tiene al menos un valor repetido.",
      dominio: ARREGLO, tipo: "arreglo", prueba: { vals: [4, 7, 9], minN: 0, maxN: 4 },
      ref: function (A) {
        var r = false;
        A.forEach(function (x, s) { A.forEach(function (y, t) { r = r || (s !== t && x === y); }); });
        return r;
      },
      opciones: [
        { f: "∃s ∃t (0 ≤ s < n ∧ 0 ≤ t < n ∧ A[s] = A[t])",
          ev: function (A) { var n = A.length; return alguno(n, function (s) { return alguno(n, function (t) { return dentro(s, 0, n) && dentro(t, 0, n) && A[s] === A[t]; }); }); },
          por: "No exige que s y t sean distintas. Con s = t la igualdad se cumple siempre, así que la fórmula vale en cualquier arreglo con al menos un elemento.",
          contra: [4, 7] },
        { f: "∃s ∃t (0 ≤ s < t < n ∧ A[s] = A[t])", ok: true,
          ev: function (A) { var n = A.length; return alguno(n, function (s) { return alguno(n, function (t) { return 0 <= s && s < t && t < n && A[s] === A[t]; }); }); },
          por: "Dos posiciones distintas, s antes que t, con el mismo valor. Pedir s < t descarta la pareja de una posición consigo misma y no pierde ningún par, porque todo par de posiciones distintas tiene una menor." },
        { f: "∃s (0 ≤ s < n − 1 ∧ A[s] = A[s + 1])",
          ev: function (A) { var n = A.length; return alguno(n, function (s) { return dentro(s, 0, n - 1) && A[s] === A[s + 1]; }); },
          por: "Solo compara vecinos. Un valor puede repetirse lejos de donde apareció la primera vez.",
          contra: [4, 7, 4] },
        { f: "∀s ∀t (0 ≤ s < t < n → A[s] = A[t])",
          ev: function (A) { var n = A.length; return todos(n, function (s) { return todos(n, function (t) { return !(0 <= s && s < t && t < n) || A[s] === A[t]; }); }); },
          por: "Dice que todos los valores del arreglo son iguales.",
          contra: [4, 7, 4] }
      ]
    },
    {
      frase: "A está ordenado de menor a mayor y no tiene valores repetidos.",
      dominio: ARREGLO, tipo: "arreglo", prueba: { vals: [1, 2, 5], minN: 0, maxN: 4 },
      ref: function (A) {
        var r = true;
        A.forEach(function (x, s) { A.forEach(function (y, t) { r = r && (s >= t || x < y); }); });
        return r;
      },
      opciones: [
        { f: "∀i (0 ≤ i < n − 1 → A[i] ≤ A[i + 1])",
          ev: function (A) { var n = A.length; return todos(n, function (i) { return !dentro(i, 0, n - 1) || A[i] <= A[i + 1]; }); },
          por: "Con ≤ admite dos vecinos iguales: describe un arreglo ordenado que puede tener repetidos.",
          contra: [2, 2, 5] },
        { f: "∃i (0 ≤ i < n − 1 ∧ A[i] < A[i + 1])",
          ev: function (A) { var n = A.length; return alguno(n, function (i) { return dentro(i, 0, n - 1) && A[i] < A[i + 1]; }); },
          por: "Se conforma con un solo par de vecinos en orden.",
          contra: [5, 1, 2] },
        { f: "∀i (0 ≤ i < n − 1 → A[i] < A[i + 1])", ok: true,
          ev: function (A) { var n = A.length; return todos(n, function (i) { return !dentro(i, 0, n - 1) || A[i] < A[i + 1]; }); },
          por: "Cada elemento es estrictamente menor que el siguiente. Como < es transitiva, eso deja el arreglo entero en orden y sin repetidos. El rango termina en n − 2 porque i + 1 también tiene que ser una posición." },
        { f: "∀i (0 ≤ i < n → A[i] < A[i + 1])", fuera: true,
          ev: function (A) { var n = A.length; return todos(n, function (i) { return !dentro(i, 0, n) || A[i] < A[i + 1]; }); },
          por: "Con i = n − 1 la fórmula compara A[n − 1] con A[n], y A[n] no existe. El rango tiene que parar una posición antes." }
      ]
    },
    {
      frase: "Ningún elemento de A es cero.",
      dominio: ARREGLO, tipo: "arreglo", prueba: { vals: [0, 3, 5], minN: 0, maxN: 3 },
      ref: function (A) { return !A.some(function (x) { return x === 0; }); },
      opciones: [
        { f: "∃i (0 ≤ i < n ∧ A[i] ≠ 0)",
          ev: function (A) { var n = A.length; return alguno(n, function (i) { return dentro(i, 0, n) && A[i] !== 0; }); },
          por: "Dice que hay un elemento distinto de cero; los demás pueden ser cero.",
          contra: [0, 5] },
        { f: "∀i (0 ≤ i < n → A[i] ≠ 0)", ok: true,
          ev: function (A) { var n = A.length; return todos(n, function (i) { return !dentro(i, 0, n) || A[i] !== 0; }); },
          por: "La frase es ¬∃i (0 ≤ i < n ∧ A[i] = 0). El ¬∃ pasa a ∀, y el ∧ del rango pasa a → porque ¬(p ∧ q) ≡ p → ¬q. El rango queda igual y lo único que se niega es A[i] = 0." },
        { f: "∀i (¬(0 ≤ i < n) → A[i] ≠ 0)", fuera: true,
          ev: function (A) { var n = A.length; return todos(n, function (i) { return dentro(i, 0, n) || A[i] !== 0; }); },
          por: "Niega el rango: habla de las posiciones por fuera del arreglo y no dice nada de las de adentro." },
        { f: "¬∃i (0 ≤ i < n → A[i] = 0)",
          ev: function (A) { var n = A.length; return !alguno(n, function (i) { return !dentro(i, 0, n) || A[i] === 0; }); },
          por: "Dentro del ∃ el rango quedó con →. Esa fórmula interior es verdadera con i = −1 en cualquier arreglo, así que su negación es falsa siempre.",
          contra: [3, 5] }
      ]
    },
    {
      frase: "No todos los elementos de A son pares.",
      dominio: ARREGLO, tipo: "arreglo", prueba: { vals: [2, 3, 4], minN: 0, maxN: 3 },
      ref: function (A) { return !A.every(function (x) { return x % 2 === 0; }); },
      opciones: [
        { f: "∀i (0 ≤ i < n → A[i] mod 2 ≠ 0)",
          ev: function (A) { var n = A.length; return todos(n, function (i) { return !dentro(i, 0, n) || A[i] % 2 !== 0; }); },
          por: "Dice que todos son impares, y eso es más fuerte que la frase. Para negar que todos son pares basta un elemento impar.",
          contra: [2, 3] },
        { f: "∃i (0 ≤ i < n → A[i] mod 2 ≠ 0)",
          ev: function (A) { var n = A.length; return alguno(n, function (i) { return !dentro(i, 0, n) || A[i] % 2 !== 0; }); },
          por: "Un ∃ con → se cumple con cualquier i por fuera del rango: con i = −1 la fórmula es verdadera para cualquier arreglo.",
          contra: [2, 4] },
        { f: "∃i (0 ≤ i < n ∧ A[i] mod 2 ≠ 0)", ok: true,
          ev: function (A) { var n = A.length; return alguno(n, function (i) { return dentro(i, 0, n) && A[i] % 2 !== 0; }); },
          por: "El ¬∀ pasa a ∃, y ¬(p → q) ≡ p ∧ ¬q convierte la implicación del rango en una conjunción. Se niega la propiedad, no el rango." },
        { f: "∃i (¬(0 ≤ i < n) ∧ A[i] mod 2 ≠ 0)", fuera: true,
          ev: function (A) { var n = A.length; return alguno(n, function (i) { return !dentro(i, 0, n) && A[i] % 2 !== 0; }); },
          por: "Niega también el rango y termina hablando de posiciones por fuera del arreglo." }
      ]
    },
    {
      frase: "Algún estudiante aprobó todas las materias.",
      dominio: MATERIAS, tipo: "materias",
      ref: function (w) { return w.E.some(function (_, e) { return w.M.every(function (__, m) { return w.ap[e][m]; }); }); },
      opciones: [
        { f: "∃e ∀m Ap(e, m)", ok: true,
          ev: function (w) { return existe(w.E.length, function (e) { return paraTodo(w.M.length, function (m) { return w.ap[e][m]; }); }); },
          por: "El estudiante se escoge primero y queda fijo; después se recorren todas las materias con ese mismo estudiante." },
        { f: "∀m ∃e Ap(e, m)",
          ev: function (w) { return paraTodo(w.M.length, function (m) { return existe(w.E.length, function (e) { return w.ap[e][m]; }); }); },
          por: "Con el ∃ adentro, cada materia puede tener su propio estudiante. La fórmula dice que toda materia la aprobó alguien.",
          contra: { E: ["Carla", "Dana"], M: ["Álgebra", "Programación"], ap: [[true, false], [false, true]] } },
        { f: "∃e ∃m Ap(e, m)",
          ev: function (w) { return existe(w.E.length, function (e) { return existe(w.M.length, function (m) { return w.ap[e][m]; }); }); },
          por: "Dice que algún estudiante aprobó alguna materia.",
          contra: { E: ["Carla"], M: ["Álgebra", "Programación"], ap: [[true, false]] } },
        { f: "∀e ∀m Ap(e, m)",
          ev: function (w) { return paraTodo(w.E.length, function (e) { return paraTodo(w.M.length, function (m) { return w.ap[e][m]; }); }); },
          por: "Exige que todos los estudiantes aprobaran todas las materias.",
          contra: { E: ["Carla", "Dana"], M: ["Álgebra", "Programación"], ap: [[true, true], [false, false]] } }
      ]
    },
    {
      frase: "Ninguna materia la perdieron todos los estudiantes.",
      dominio: MATERIAS, tipo: "materias",
      ref: function (w) { return !w.M.some(function (_, m) { return w.E.every(function (__, e) { return !w.ap[e][m]; }); }); },
      opciones: [
        { f: "∃e ∀m Ap(e, m)",
          ev: function (w) { return existe(w.E.length, function (e) { return paraTodo(w.M.length, function (m) { return w.ap[e][m]; }); }); },
          por: "Es más fuerte que la frase: pide un mismo estudiante que aprobó todas las materias.",
          contra: { E: ["Carla", "Dana"], M: ["Álgebra", "Programación"], ap: [[true, false], [false, true]] } },
        { f: "∀m ∃e ¬Ap(e, m)",
          ev: function (w) { return paraTodo(w.M.length, function (m) { return existe(w.E.length, function (e) { return !w.ap[e][m]; }); }); },
          por: "La negación quedó pegada a Ap: la fórmula dice que toda materia la perdió alguien.",
          contra: { E: ["Carla"], M: ["Álgebra", "Programación"], ap: [[true, true]] } },
        { f: "∀m ∃e Ap(e, m)", ok: true,
          ev: function (w) { return paraTodo(w.M.length, function (m) { return existe(w.E.length, function (e) { return w.ap[e][m]; }); }); },
          por: "La frase es ¬∃m ∀e ¬Ap(e, m). El ¬∃m pasa a ∀m, el ¬∀e pasa a ∃e y las dos negaciones sobre Ap se cancelan: toda materia la aprobó al menos un estudiante." },
        { f: "¬∀m ∀e ¬Ap(e, m)",
          ev: function (w) { return !paraTodo(w.M.length, function (m) { return paraTodo(w.E.length, function (e) { return !w.ap[e][m]; }); }); },
          por: "Dice que no todos perdieron todo, es decir, que alguien aprobó alguna materia. Una materia sin ningún aprobado no la hace falsa.",
          contra: { E: ["Carla"], M: ["Álgebra", "Programación"], ap: [[true, false]] } }
      ]
    },
    {
      frase: "Todo estudiante que estudió pasó el examen.",
      dominio: EXAMEN, tipo: "examen",
      ref: function (w) { return w.E.every(function (_, e) { return !w.es[e] || w.pa[e]; }); },
      opciones: [
        { f: "∀e (Es(e) ∧ Pa(e))",
          ev: function (w) { return paraTodo(w.E.length, function (e) { return w.es[e] && w.pa[e]; }); },
          por: "Exige que todos estudiaran y que todos pasaran. La frase no dice nada de quien no estudió.",
          contra: { E: ["Ana", "Beto"], es: [true, false], pa: [true, false] } },
        { f: "∀e (Pa(e) → Es(e))",
          ev: function (w) { return paraTodo(w.E.length, function (e) { return !w.pa[e] || w.es[e]; }); },
          por: "Es la recíproca: dice que todo el que pasó había estudiado.",
          contra: { E: ["Ana"], es: [true], pa: [false] } },
        { f: "∀e (Es(e) → Pa(e))", ok: true,
          ev: function (w) { return paraTodo(w.E.length, function (e) { return !w.es[e] || w.pa[e]; }); },
          por: "Haber estudiado es el antecedente. Para quien no estudió la implicación es verdadera, haya pasado o no." },
        { f: "∃e (Es(e) ∧ Pa(e))",
          ev: function (w) { return existe(w.E.length, function (e) { return w.es[e] && w.pa[e]; }); },
          por: "Solo dice que alguien estudió y pasó.",
          contra: { E: ["Ana", "Beto"], es: [true, true], pa: [true, false] } }
      ]
    },
    {
      frase: "No es cierto que todo estudiante que estudió pasó el examen.",
      dominio: EXAMEN, tipo: "examen",
      ref: function (w) { return !w.E.every(function (_, e) { return !w.es[e] || w.pa[e]; }); },
      opciones: [
        { f: "∃e (Es(e) ∧ ¬Pa(e))", ok: true,
          ev: function (w) { return existe(w.E.length, function (e) { return w.es[e] && !w.pa[e]; }); },
          por: "El ¬∀ pasa a ∃ y ¬(p → q) ≡ p ∧ ¬q: hay alguien que estudió y no pasó." },
        { f: "∀e (¬Es(e) → ¬Pa(e))",
          ev: function (w) { return paraTodo(w.E.length, function (e) { return w.es[e] || !w.pa[e]; }); },
          por: "Niega la implicación como si fuera la inversa. Dice que quien no estudió no pasó, y eso no contradice la frase original.",
          contra: { E: ["Ana", "Beto"], es: [true, false], pa: [false, true] } },
        { f: "∀e (Es(e) → ¬Pa(e))",
          ev: function (w) { return paraTodo(w.E.length, function (e) { return !w.es[e] || !w.pa[e]; }); },
          por: "Dice que todos los que estudiaron perdieron. Para negar la frase basta con uno.",
          contra: { E: ["Ana", "Beto"], es: [true, true], pa: [true, false] } },
        { f: "∃e (Es(e) → ¬Pa(e))",
          ev: function (w) { return existe(w.E.length, function (e) { return !w.es[e] || !w.pa[e]; }); },
          por: "Con → la hace verdadera cualquier estudiante que no estudió.",
          contra: { E: ["Ana", "Beto"], es: [true, false], pa: [true, false] } }
      ]
    },
    {
      frase: "Ningún elemento de A es menor que el primero (con n ≥ 1).",
      dominio: ARREGLO, tipo: "arreglo", prueba: { vals: [1, 2, 5], minN: 1, maxN: 4 },
      ref: function (A) { return !A.some(function (x) { return x < A[0]; }); },
      opciones: [
        { f: "∀i (1 ≤ i < n → A[0] < A[i])",
          ev: function (A) { var n = A.length; return todos(n, function (i) { return !dentro(i, 1, n) || A[0] < A[i]; }); },
          por: "Con < exige que el primero sea estrictamente menor que los demás, y un valor igual al primero la hace fallar.",
          contra: [2, 2] },
        { f: "∀i (0 ≤ i < n → A[i] ≤ A[0])",
          ev: function (A) { var n = A.length; return todos(n, function (i) { return !dentro(i, 0, n) || A[i] <= A[0]; }); },
          por: "Está al revés: dice que ningún elemento supera al primero.",
          contra: [1, 5] },
        { f: "∃i (0 ≤ i < n ∧ A[0] ≤ A[i])",
          ev: function (A) { var n = A.length; return alguno(n, function (i) { return dentro(i, 0, n) && A[0] <= A[i]; }); },
          por: "Con i = 0 se cumple en cualquier arreglo con al menos un elemento.",
          contra: [5, 1] },
        { f: "∀i (0 ≤ i < n → A[0] ≤ A[i])", ok: true,
          ev: function (A) { var n = A.length; return todos(n, function (i) { return !dentro(i, 0, n) || A[0] <= A[i]; }); },
          por: "La frase es ¬∃i (0 ≤ i < n ∧ A[i] < A[0]); al negar queda ∀ con →, y ¬(A[i] < A[0]) es A[0] ≤ A[i]. Con i = 0 la comparación A[0] ≤ A[0] se cumple sola." }
      ]
    },
    {
      frase: "f ∈ O(g): existen c > 0 y k ≥ 0 tales que f(n) ≤ c · g(n) para todo n ≥ k.",
      dominio: "n y k recorren los naturales; c recorre los reales.", tipo: "texto",
      opciones: [
        { f: "∀n ∃c (c > 0 ∧ f(n) ≤ c · g(n))",
          por: "El ∃c quedó dentro del ∀n, así que c puede cambiar con n. Con c = n² + 1 se tendría n³ ≤ (n² + 1) · n para todo n, y n³ quedaría en O(n)." },
        { f: "∃c ∃k (c > 0 ∧ k ≥ 0 ∧ ∃n (n ≥ k ∧ f(n) ≤ c · g(n)))",
          por: "Basta un solo n. Con c = 1, k = 1 y n = 1 queda 1² ≤ 1 · 1, y n² quedaría en O(n)." },
        { f: "∃c ∃k (c > 0 ∧ k ≥ 0 ∧ ∀n (n ≥ k ∧ f(n) ≤ c · g(n)))",
          por: "Con ∧, el ∀n exige n ≥ k para todo n, también para n = 0: solo deja k = 0, y la cota tendría que valer desde el comienzo. Con f(n) = n + 1 y g(n) = n, en n = 0 queda 1 ≤ c · 0, falso para todo c, y n + 1 quedaría fuera de O(n)." },
        { f: "∃c ∃k (c > 0 ∧ k ≥ 0 ∧ ∀n (n ≥ k → f(n) ≤ c · g(n)))", ok: true,
          por: "Los testigos c y k se escogen primero y quedan fijos; después, para todo n desde k en adelante, se pide la desigualdad. El rango de n va como antecedente de la implicación." }
      ]
    }
  ];

  function vf(b) { return b ? "verdadera" : "falsa"; }

  function lista(nombres) {
    var t = "";
    nombres.forEach(function (x, i) {
      if (i > 0) { t = t + (i === nombres.length - 1 ? " y " : ", "); }
      t = t + x;
    });
    return t;
  }

  /* Describe un caso en palabras. */
  function describir(tipo, w) {
    var t = "";
    if (tipo === "arreglo") {
      t = "A = [" + w.join(", ") + "], n = " + w.length + ".";
    } else if (tipo === "materias") {
      var partes = [];
      w.E.forEach(function (e, i) {
        var apr = [];
        w.M.forEach(function (m, j) { if (w.ap[i][j]) { apr.push(m); } });
        partes.push(e + (apr.length === 0 ? " no aprobó ninguna" : " aprobó " + lista(apr)));
      });
      t = (w.E.length === 1 ? "Estudiante " : "Estudiantes ") + lista(w.E) +
        "; materias " + lista(w.M) + ". " + partes.join("; ") + ".";
    } else if (tipo === "examen") {
      var p = [];
      w.E.forEach(function (e, i) {
        p.push(e + (w.es[i] ? " estudió" : " no estudió") + (w.pa[i] ? " y pasó" : " y no pasó"));
      });
      t = p.join("; ") + ".";
    }
    return t;
  }

  /* El texto del contraejemplo de una opcion, evaluado sobre el caso. */
  function contraejemplo(item, op) {
    var t = "";
    if (op.contra !== undefined && item.ref) {
      t = "Contraejemplo: " + describir(item.tipo, op.contra) + " La frase es " +
        vf(item.ref(op.contra)) + " y esta fórmula es " + vf(op.ev(op.contra)) + ".";
    }
    return t;
  }

  return { frases: FRASES, contraejemplo: contraejemplo, describir: describir };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var estado = { k: 0, aciertos: 0, intentado: false, resuelto: false, fallos: [] };

    function el(id) { return document.getElementById(id); }

    function pintar() {
      var item = EJERCICIO.frases[estado.k];
      el("progreso").textContent = "Frase " + (estado.k + 1) + " de " + EJERCICIO.frases.length;
      el("puntaje").textContent = estado.aciertos;
      el("frase").textContent = item.frase;
      el("dominio").textContent = item.dominio;
      var caja = el("opciones");
      caja.innerHTML = "";
      item.opciones.forEach(function (op, j) {
        var b = document.createElement("button");
        b.className = "formula";
        b.textContent = op.f;
        b.addEventListener("click", function () { elegir(j, b); });
        caja.appendChild(b);
      });
      var v = el("veredicto");
      v.className = "veredicto";
      v.innerHTML = "";
      el("btn-siguiente").disabled = true;
      el("btn-siguiente").textContent = estado.k === EJERCICIO.frases.length - 1 ? "Ver el resultado" : "Siguiente frase";
    }

    function elegir(j, boton) {
      var item = EJERCICIO.frases[estado.k];
      var op = item.opciones[j];
      if (!estado.resuelto) {
        if (!estado.intentado) {
          estado.intentado = true;
          if (op.ok) { estado.aciertos = estado.aciertos + 1; } else { estado.fallos.push(item.frase); }
          el("puntaje").textContent = estado.aciertos;
        }
        var v = el("veredicto");
        v.innerHTML = "";
        var p1 = document.createElement("div");
        p1.textContent = (op.ok ? "Correcta. " : "No es esta. ") + op.por;
        v.appendChild(p1);
        var c = EJERCICIO.contraejemplo(item, op);
        if (c !== "") {
          var p2 = document.createElement("div");
          p2.style.marginTop = "0.35rem";
          p2.textContent = c;
          v.appendChild(p2);
        }
        if (op.ok) {
          v.className = "veredicto bien";
          boton.classList.add("acierto");
          estado.resuelto = true;
          el("btn-siguiente").disabled = false;
          el("opciones").querySelectorAll("button").forEach(function (b) { b.disabled = b !== boton; });
        } else {
          v.className = "veredicto mal";
          boton.classList.add("error");
          boton.disabled = true;
          var otra = document.createElement("div");
          otra.style.marginTop = "0.35rem";
          otra.textContent = "Pruebe otra opción.";
          v.appendChild(otra);
        }
      }
    }

    function siguiente() {
      if (estado.k < EJERCICIO.frases.length - 1) {
        estado.k = estado.k + 1;
        estado.intentado = false;
        estado.resuelto = false;
        pintar();
      } else {
        el("carta-frase").style.display = "none";
        el("carta-cierre").style.display = "block";
        el("final").textContent = estado.aciertos + " de " + EJERCICIO.frases.length +
          " frases traducidas al primer intento.";
        var ul = el("fallos");
        ul.innerHTML = "";
        estado.fallos.forEach(function (f) {
          var li = document.createElement("li");
          li.textContent = f;
          ul.appendChild(li);
        });
        el("titulo-fallos").style.display = estado.fallos.length > 0 ? "block" : "none";
      }
    }

    function reiniciar() {
      estado = { k: 0, aciertos: 0, intentado: false, resuelto: false, fallos: [] };
      el("carta-frase").style.display = "block";
      el("carta-cierre").style.display = "none";
      pintar();
    }

    el("btn-siguiente").addEventListener("click", siguiente);
    el("btn-reinicio").addEventListener("click", reiniciar);
    pintar();
  })();
}
