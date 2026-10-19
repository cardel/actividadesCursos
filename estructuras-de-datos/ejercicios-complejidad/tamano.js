/* Ejercicio interactivo: ¿de qué depende? Complejidad a alto nivel sobre
   soluciones de problemas de juez. */
var EJERCICIO = (function () {
  var OPS_POR_SEGUNDO = 1e8;

  function azar(semilla) {
    var x = semilla;
    return function () {
      x = (x * 1103515245 + 12345) % 2147483648;
      return x / 2147483648;
    };
  }

  function entero(r, a, b) {
    return a + Math.floor(r() * (b - a + 1));
  }

  function fichas(texto) {
    return texto.split(/\s+/).filter(function (s) { return s.length > 0; });
  }

  function contador() {
    var c = {};
    return {
      inc: function (linea) { c[linea] = (c[linea] || 0) + 1; },
      valor: function () { return c; }
    };
  }

  var PROBLEMAS = [
    {
      id: "11078",
      titulo: "Open Credit System",
      url: "https://onlinejudge.org/external/110/11078.pdf",
      archivo: "open-credit-system.py",
      codigo: [
        "# UVa 11078 - Open Credit System",
        "import sys",
        "",
        "",
        "def mayor_diferencia(a):",
        "    mayor = a[0]",
        "    mejor = a[0] - a[1]",
        "    for j in range(1, len(a)):",
        "        if mayor - a[j] > mejor:",
        "            mejor = mayor - a[j]",
        "        if a[j] > mayor:",
        "            mayor = a[j]",
        "    return mejor",
        "",
        "",
        "def main():",
        "    datos = sys.stdin.read().split()",
        "    t = int(datos[0])",
        "    pos = 1",
        "    for caso in range(t):",
        "        n = int(datos[pos])",
        "        a = []",
        "        for k in range(n):",
        "            a.append(int(datos[pos + 1 + k]))",
        "        pos = pos + 1 + n",
        "        print(mayor_diferencia(a))",
        "",
        "",
        "main()"
      ],
      variable: [
        { t: "El valor de los puntajes, que llega a 150000", ok: false,
          r: "Un puntaje grande cuesta lo mismo que uno pequeño: se resta y se compara una vez. " +
            "Lo que hace crecer el trabajo es cuántos puntajes hay, no cuánto vale cada uno." },
        { t: "n, la cantidad de estudiantes del caso", ok: true,
          r: "Cada caso es una lista de n puntajes y el código la recorre; n llega a 100000." },
        { t: "T, la cantidad de casos", ok: false,
          r: "T multiplica, pero el análisis se hace caso por caso: dentro de un caso, lo que crece es la lista." }
      ],
      nombre: "n",
      puntos: [
        { linea: 20, txt: "for caso in range(t):", lineas: [21],
          opciones: [
            { t: "n veces", ok: false, r: "Este ciclo recorre casos, no estudiantes: corre lo mismo con 2 puntajes que con 100000." },
            { t: "T veces, una por caso", ok: true, r: "Una vuelta por caso. T es menor que 20 y queda por fuera del análisis por caso." },
            { t: "n · T veces", ok: false, r: "Ese es el trabajo de todo el archivo, no las vueltas de este ciclo: él solo corre una vez por caso." }
          ], orden: function () { return 1; } },
        { linea: 23, txt: "for k in range(n):", lineas: [24],
          opciones: [
            { t: "Una vez: solo lee", ok: false, r: "Leer también son vueltas: cada uno de los n puntajes se convierte y se agrega a la lista." },
            { t: "n veces", ok: true, r: "Una vuelta por puntaje leído." },
            { t: "n² veces", ok: false, r: "No hay otro ciclo adentro: cada vuelta lee un solo número." }
          ], orden: function (t) { return t.n; } },
        { linea: 26, txt: "mayor_diferencia(a)", lineas: [6],
          opciones: [
            { t: "n veces, una por estudiante", ok: false, r: "La llamada está en el ciclo de los casos, no en el de lectura: se hace una vez con la lista completa." },
            { t: "Una vez por caso", ok: true, r: "Una llamada que recibe la lista entera." }
          ], orden: function () { return 1; } },
        { linea: 8, txt: "for j in range(1, len(a)):", lineas: [9],
          opciones: [
            { t: "n² veces: compara cada pareja", ok: false, r: "Comparar cada pareja i < j sería la forma directa. Aquí el mayor puntaje anterior se guarda en mayor, así que cada j se compara una sola vez." },
            { t: "n − 1 veces", ok: true, r: "Una vuelta por cada estudiante desde el segundo; con el mayor anterior a mano no hace falta mirar atrás." },
            { t: "n/2 veces", ok: false, r: "El rango va de 1 a len(a) − 1 sin saltos: son n − 1 vueltas." }
          ], orden: function (t) { return t.n; } }
      ],
      total: [
        { t: "O(n²)", ok: false, r: "Ese es el costo de probar todas las parejas. En el código no hay un ciclo dentro de otro sobre los puntajes." },
        { t: "O(n log n)", ok: false, r: "No se ordena nada: es un recorrido de ida." },
        { t: "O(n)", ok: true, r: "Leer cuesta n y recorrer cuesta n − 1; en secuencia suman un lineal." }
      ],
      limites: "T < 20 casos; n entre 2 y 100000 estudiantes por caso; |puntaje| < 150000.",
      cuenta: "20 casos × 10⁵ vueltas ≈ 2 × 10⁶ vueltas en todo el archivo.",
      alcanza: [
        { t: "No alcanza: 10⁵ estudiantes son demasiados", ok: false, r: "Un recorrido de 10⁵ son 10⁵ vueltas, mil veces menos de lo que se hace en un segundo. Lo que no alcanzaría es O(n²): 10¹⁰ vueltas por caso." },
        { t: "Alcanza: unas 2 × 10⁶ vueltas contra 10⁸ por segundo", ok: true, r: "Sobra margen: aun con 20 casos de 10⁵ estudiantes se queda en milésimas de lo disponible." },
        { t: "Alcanza porque los puntajes son menores que 150000", ok: false, r: "El tope de los puntajes no entra en la cuenta: lo que se compara contra los segundos es cuántas vueltas da el código." }
      ],
      tabla: { tamano: "n ≤ 10⁵, T < 20", O: "O(n) por caso", peor: "≈ 2 × 10⁶" },
      entrada: function (t) {
        var r = azar(11078);
        var s = "1\n" + t.n + "\n";
        var k;
        for (k = 0; k < t.n; k = k + 1) { s = s + entero(r, -149999, 149999) + "\n"; }
        return s;
      },
      medir: function (texto) {
        var d = fichas(texto), c = contador();
        var T = parseInt(d[0], 10), pos = 1, caso, k, j;
        for (caso = 0; caso < T; caso = caso + 1) {
          c.inc(21);
          var n = parseInt(d[pos], 10), a = [];
          for (k = 0; k < n; k = k + 1) { c.inc(24); a.push(parseInt(d[pos + 1 + k], 10)); }
          pos = pos + 1 + n;
          c.inc(6);
          for (j = 1; j < a.length; j = j + 1) { c.inc(9); }
        }
        return c.valor();
      },
      tamanos: [{ n: 1000, etiqueta: "n = 1000" }, { n: 2000, etiqueta: "n = 2000" }]
    },

    {
      id: "507",
      titulo: "Jill Rides Again",
      url: "https://onlinejudge.org/external/5/507.pdf",
      archivo: "jill-rides-again.py",
      codigo: [
        "# UVa 507 - Jill Rides Again",
        "import sys",
        "",
        "",
        "def mejor_tramo(v):",
        "    # v[k] es la calle entre las paradas k + 1 y k + 2",
        "    suma = 0",
        "    inicio = 0",
        "    mejor = 0",
        "    mi = 0",
        "    mj = -1",
        "    for k in range(len(v)):",
        "        suma = suma + v[k]",
        "        if suma > mejor or (suma == mejor and k - inicio > mj - mi):",
        "            mejor = suma",
        "            mi = inicio",
        "            mj = k",
        "        if suma < 0:",
        "            suma = 0",
        "            inicio = k + 1",
        "    return mejor, mi, mj",
        "",
        "",
        "def main():",
        "    datos = sys.stdin.read().split()",
        "    b = int(datos[0])",
        "    pos = 1",
        "    for r in range(1, b + 1):",
        "        s = int(datos[pos])",
        "        v = []",
        "        for k in range(s - 1):",
        "            v.append(int(datos[pos + 1 + k]))",
        "        pos = pos + s",
        "        mejor, mi, mj = mejor_tramo(v)",
        "        if mejor > 0:",
        "            print(\"The nicest part of route %d is between stops %d and %d\"",
        "                  % (r, mi + 1, mj + 2))",
        "        else:",
        "            print(\"Route %d has no nice parts\" % r)",
        "",
        "",
        "main()"
      ],
      variable: [
        { t: "b, la cantidad de rutas", ok: false,
          r: "Las rutas se procesan una por una; b multiplica, pero el trabajo de cada ruta lo fija su número de paradas." },
        { t: "El valor de la calificación de cada calle", ok: false,
          r: "Una calificación de 1000 se suma igual que una de 1: cuesta una vuelta, valga lo que valga." },
        { t: "s, la cantidad de paradas de la ruta", ok: true,
          r: "La ruta trae s − 1 calles y el código las recorre; s llega a 20000." }
      ],
      nombre: "s",
      puntos: [
        { linea: 28, txt: "for r in range(1, b + 1):", lineas: [29],
          opciones: [
            { t: "b veces, una por ruta", ok: true, r: "Una vuelta por ruta; el análisis sigue dentro de cada una." },
            { t: "s veces", ok: false, r: "Este ciclo recorre rutas, no paradas." }
          ], orden: function () { return 1; } },
        { linea: 31, txt: "for k in range(s - 1):", lineas: [32],
          opciones: [
            { t: "s − 1 veces", ok: true, r: "Una vuelta por calle leída." },
            { t: "Una vez", ok: false, r: "Cada calle se lee en su propia vuelta: son s − 1 lecturas." },
            { t: "s² veces", ok: false, r: "Adentro no hay otro ciclo: cada vuelta lee un número." }
          ], orden: function (t) { return t.s; } },
        { linea: 34, txt: "mejor_tramo(v)", lineas: [7],
          opciones: [
            { t: "s veces", ok: false, r: "La llamada está fuera del ciclo de lectura: se hace una vez, con la lista completa." },
            { t: "Una vez por ruta", ok: true, r: "Una llamada con las s − 1 calles." }
          ], orden: function () { return 1; } },
        { linea: 12, txt: "for k in range(len(v)):", lineas: [13],
          opciones: [
            { t: "s²/2 veces: un tramo por cada par de paradas", ok: false, r: "Probar todos los tramos (i, j) sería la forma directa. Aquí la suma del tramo que va se arrastra y se reinicia cuando baja de cero; nunca se vuelve atrás." },
            { t: "s − 1 veces", ok: true, r: "Una vuelta por calle, con la suma del tramo actual en una variable." },
            { t: "log s veces", ok: false, r: "El índice k sube de uno en uno hasta len(v); no hay mitades." }
          ], orden: function (t) { return t.s; } }
      ],
      total: [
        { t: "O(s)", ok: true, r: "Leer y recorrer, cada uno lineal en las paradas." },
        { t: "O(s²)", ok: false, r: "Ese es el costo de sumar todos los tramos. El código hace una sola pasada." },
        { t: "O(b · s²)", ok: false, r: "Por ruta no hay nada cuadrático, y b queda fuera del análisis por ruta." }
      ],
      limites: "s entre 2 y 20000 paradas por ruta; el enunciado no fija cuántas rutas trae el archivo.",
      cuenta: "2 × 10⁴ vueltas por ruta.",
      alcanza: [
        { t: "No se sabe: el enunciado no fija b", ok: false, r: "Sin tope en b, la medida útil es el costo por ruta, y ese es lineal: procesar una ruta cuesta lo mismo que leerla. Si el archivo se puede leer en el tiempo, se puede resolver." },
        { t: "Alcanza: 2 × 10⁴ vueltas por ruta, lo mismo que leerla", ok: true, r: "Con 10⁸ vueltas por segundo caben unas 5000 rutas del tamaño máximo en un segundo." },
        { t: "No alcanza: hay que mirar cada par de paradas", ok: false, r: "Eso valdría para la forma directa, con 2 × 10⁸ pares por ruta. Esta solución no mira pares." }
      ],
      tabla: { tamano: "s ≤ 2 × 10⁴", O: "O(s) por ruta", peor: "≈ 2 × 10⁴ por ruta" },
      entrada: function (t) {
        var r = azar(507);
        var s = "1\n" + t.s + "\n";
        var k;
        for (k = 0; k < t.s - 1; k = k + 1) { s = s + entero(r, -10, 10) + "\n"; }
        return s;
      },
      medir: function (texto) {
        var d = fichas(texto), c = contador();
        var b = parseInt(d[0], 10), pos = 1, rr, k;
        for (rr = 1; rr <= b; rr = rr + 1) {
          c.inc(29);
          var s = parseInt(d[pos], 10), v = [];
          for (k = 0; k < s - 1; k = k + 1) { c.inc(32); v.push(parseInt(d[pos + 1 + k], 10)); }
          pos = pos + s;
          c.inc(7);
          for (k = 0; k < v.length; k = k + 1) { c.inc(13); }
        }
        return c.valor();
      },
      tamanos: [{ s: 1000, etiqueta: "s = 1000" }, { s: 2000, etiqueta: "s = 2000" }]
    },

    {
      id: "108",
      titulo: "Maximum Sum",
      url: "https://onlinejudge.org/external/1/108.pdf",
      archivo: "maximum-sum.py",
      codigo: [
        "# UVa 108 - Maximum Sum",
        "import sys",
        "",
        "",
        "def mejor_tramo(v):",
        "    mejor = v[0]",
        "    suma = 0",
        "    for x in v:",
        "        suma = suma + x",
        "        if suma > mejor:",
        "            mejor = suma",
        "        if suma < 0:",
        "            suma = 0",
        "    return mejor",
        "",
        "",
        "def mayor_rectangulo(m):",
        "    n = len(m)",
        "    mejor = m[0][0]",
        "    for arriba in range(n):",
        "        col = [0] * n",
        "        for abajo in range(arriba, n):",
        "            for c in range(n):",
        "                col[c] = col[c] + m[abajo][c]",
        "            s = mejor_tramo(col)",
        "            if s > mejor:",
        "                mejor = s",
        "    return mejor",
        "",
        "",
        "def main():",
        "    datos = sys.stdin.read().split()",
        "    n = int(datos[0])",
        "    m = []",
        "    for i in range(n):",
        "        fila = []",
        "        for j in range(n):",
        "            fila.append(int(datos[1 + i * n + j]))",
        "        m.append(fila)",
        "    print(mayor_rectangulo(m))",
        "",
        "",
        "main()"
      ],
      variable: [
        { t: "c = N², la cantidad de casillas que se leen", ok: false,
          r: "Es lo que trae la entrada, pero los ciclos corren sobre filas y columnas. En casillas el total quedaría c^(3/2), que dice lo mismo con una raíz de por medio: el lado N es la variable que se lee en el código." },
        { t: "N, el lado de la matriz", ok: true,
          r: "Los ciclos van sobre filas (arriba, abajo) y columnas (c), y los tres llegan hasta N ≤ 100." },
        { t: "El rango de los valores, de −127 a 127", ok: false,
          r: "Los valores se suman; un 127 cuesta lo mismo que un 1." }
      ],
      nombre: "N",
      puntos: [
        { linea: 35, txt: "for i in range(n):", lineas: [36],
          opciones: [
            { t: "N veces", ok: true, r: "Una vuelta por fila." },
            { t: "N² veces", ok: false, r: "Las N² casillas las cuenta el ciclo de adentro; este da una vuelta por fila." }
          ], orden: function (t) { return t.N; } },
        { linea: 37, txt: "for j in range(n):", lineas: [38],
          opciones: [
            { t: "N veces", ok: false, r: "Son N por fila, y hay N filas: en total el cuerpo corre una vez por casilla." },
            { t: "N² veces en total", ok: true, r: "Una vuelta por casilla leída." },
            { t: "N³ veces", ok: false, r: "Solo hay dos ciclos anidados en la lectura." }
          ], orden: function (t) { return t.N * t.N; } },
        { linea: 20, txt: "for arriba in range(n):", lineas: [21],
          opciones: [
            { t: "N veces", ok: true, r: "Una vuelta por cada fila donde puede empezar el rectángulo." },
            { t: "N²/2 veces", ok: false, r: "Las parejas de filas las forma el ciclo de adentro; este fija solo la de arriba." }
          ], orden: function (t) { return t.N; } },
        { linea: 22, txt: "for abajo in range(arriba, n):", lineas: [25],
          opciones: [
            { t: "N veces en total", ok: false, r: "Corre N − arriba veces por cada arriba; sumado sobre todos los arriba da N(N + 1)/2." },
            { t: "≈ N²/2 veces en total, una por pareja arriba ≤ abajo", ok: true, r: "N + (N − 1) + … + 1 = N(N + 1)/2 parejas de filas." },
            { t: "N³ veces en total", ok: false, r: "Las columnas entran en el ciclo siguiente; este recorre parejas de filas." }
          ], orden: function (t) { return t.N * (t.N + 1) / 2; } },
        { linea: 23, txt: "for c in range(n):", lineas: [24],
          opciones: [
            { t: "≈ N³/2 veces en total", ok: true, r: "N columnas por cada una de las N(N + 1)/2 parejas de filas." },
            { t: "N² veces en total", ok: false, r: "Corre N veces por pareja de filas, y hay N(N + 1)/2 parejas." },
            { t: "N⁴ veces en total", ok: false, r: "Son tres ciclos anidados (arriba, abajo, c), no cuatro." }
          ], orden: function (t) { return t.N * t.N * (t.N + 1) / 2; } },
        { linea: 25, txt: "mejor_tramo(col)", lineas: [6],
          opciones: [
            { t: "Una vez", ok: false, r: "Está dentro del ciclo de abajo: se llama una vez por pareja de filas." },
            { t: "≈ N²/2 veces, una por pareja de filas", ok: true, r: "Cada pareja deja en col las sumas de sus columnas y la llamada busca el mejor tramo." }
          ], orden: function (t) { return t.N * (t.N + 1) / 2; } },
        { linea: 8, txt: "for x in v:", lineas: [9],
          opciones: [
            { t: "N veces por llamada, ≈ N³/2 en total", ok: true, r: "Recorre las N columnas de col en cada una de las N(N + 1)/2 llamadas." },
            { t: "N² veces por llamada", ok: false, r: "v es col, un arreglo de N sumas: una vuelta por columna." }
          ], orden: function (t) { return t.N * t.N * (t.N + 1) / 2; } }
      ],
      total: [
        { t: "O(N²), lo que cuesta leer la matriz", ok: false, r: "Leer cuesta N², pero después vienen tres ciclos anidados sobre N." },
        { t: "O(N³)", ok: true, r: "Dos bloques de ≈ N³/2 (sumar columnas y buscar el tramo) en secuencia con la lectura de N²: manda el N³." },
        { t: "O(N⁶)", ok: false, r: "Ese sería el costo de probar los N⁴ rectángulos y sumar cada uno casilla por casilla. Aquí las columnas se acumulan y ningún rectángulo se recorre." }
      ],
      limites: "N ≤ 100; valores entre −127 y 127; un solo caso.",
      cuenta: "N³ = 10⁶ vueltas.",
      alcanza: [
        { t: "Alcanza: unas 10⁶ vueltas", ok: true, r: "Cien veces menos de lo que cabe en un segundo." },
        { t: "No alcanza: N³ es cúbico", ok: false, r: "La clase sola no decide: con N = 100, N³ son 10⁶ vueltas. Lo que no alcanzaría es N⁶ = 10¹², la forma directa." },
        { t: "No alcanza: hay 10⁴ casillas y cada una se mira muchas veces", ok: false, r: "Se miran unas N veces cada una: 10⁴ × 100 = 10⁶ vueltas, que caben de sobra." }
      ],
      tabla: { tamano: "N ≤ 100 (N² casillas)", O: "O(N³)", peor: "≈ 10⁶" },
      entrada: function (t) {
        var r = azar(108);
        var s = t.N + "\n", i, j;
        for (i = 0; i < t.N; i = i + 1) {
          for (j = 0; j < t.N; j = j + 1) { s = s + entero(r, -127, 127) + " "; }
          s = s + "\n";
        }
        return s;
      },
      medir: function (texto) {
        var d = fichas(texto), c = contador();
        var n = parseInt(d[0], 10), m = [], i, j, arriba, abajo, cc;
        for (i = 0; i < n; i = i + 1) {
          c.inc(36);
          var fila = [];
          for (j = 0; j < n; j = j + 1) { c.inc(38); fila.push(parseInt(d[1 + i * n + j], 10)); }
          m.push(fila);
        }
        for (arriba = 0; arriba < n; arriba = arriba + 1) {
          c.inc(21);
          var col = [];
          for (cc = 0; cc < n; cc = cc + 1) { col.push(0); }
          for (abajo = arriba; abajo < n; abajo = abajo + 1) {
            for (cc = 0; cc < n; cc = cc + 1) { c.inc(24); col[cc] = col[cc] + m[abajo][cc]; }
            c.inc(25);
            c.inc(6);
            for (cc = 0; cc < col.length; cc = cc + 1) { c.inc(9); }
          }
        }
        return c.valor();
      },
      tamanos: [{ N: 20, etiqueta: "N = 20" }, { N: 40, etiqueta: "N = 40" }]
    },

    {
      id: "100",
      titulo: "The 3n + 1 problem",
      url: "https://onlinejudge.org/external/1/100.pdf",
      archivo: "3n-plus-1.py",
      codigo: [
        "import sys",
        "",
        "",
        "def longitud_ciclo(n):",
        "    cuenta = 1",
        "    while n != 1:",
        "        if n % 2 == 1:",
        "            n = 3 * n + 1",
        "        else:",
        "            n = n // 2",
        "        cuenta = cuenta + 1",
        "    return cuenta",
        "",
        "",
        "def maximo_ciclo(a, b):",
        "    mejor = 0",
        "    k = a",
        "    while k <= b:",
        "        c = longitud_ciclo(k)",
        "        if c > mejor:",
        "            mejor = c",
        "        k = k + 1",
        "    return mejor",
        "",
        "",
        "def main():",
        "    datos = sys.stdin.read().split()",
        "    t = 0",
        "    while t + 1 < len(datos):",
        "        i = int(datos[t])",
        "        j = int(datos[t + 1])",
        "        if i <= j:",
        "            m = maximo_ciclo(i, j)",
        "        else:",
        "            m = maximo_ciclo(j, i)",
        "        print(\"%d %d %d\" % (i, j, m))",
        "        t = t + 2",
        "",
        "",
        "main()"
      ],
      variable: [
        { t: "La cantidad de números de la línea: dos", ok: false,
          r: "La línea trae dos números, pero el código recorre todos los enteros entre i y j. El trabajo sale del valor de los números, no de cuántos son." },
        { t: "m = j − i + 1, el ancho del intervalo, y L, la longitud de ciclo de cada número", ok: true,
          r: "El ciclo de afuera visita los m números del intervalo y el de adentro da L − 1 pasos por número. El enunciado acota los dos: m < 10⁴ y, medido sobre 1 a 9999, L ≤ 262." },
        { t: "Solo m, el ancho del intervalo", ok: false,
          r: "Falta la sucesión de cada número: 27 tiene ciclo de longitud 112 y 6171 de 262, y esas vueltas no dependen de m." }
      ],
      nombre: "m y L",
      puntos: [
        { linea: 29, txt: "while t + 1 < len(datos):", lineas: [30],
          opciones: [
            { t: "m veces", ok: false, r: "Este ciclo recorre los pares de la entrada, de dos en dos fichas; no ve el intervalo." },
            { t: "Una vez por par de la entrada", ok: true, r: "Cada vuelta lee un par i, j; el análisis sigue por par." }
          ], orden: function () { return 1; } },
        { linea: 33, txt: "maximo_ciclo(i, j)  (líneas 33 y 35)", lineas: [16],
          opciones: [
            { t: "Una vez por par", ok: true, r: "El if elige el orden de i y j; se llama una sola de las dos." },
            { t: "Dos veces por par", ok: false, r: "Las dos llamadas están en ramas distintas de un if: corre una." }
          ], orden: function () { return 1; } },
        { linea: 18, txt: "while k <= b:", lineas: [19],
          opciones: [
            { t: "m veces", ok: true, r: "k sube de uno en uno desde a hasta b: j − i + 1 vueltas." },
            { t: "Dos veces, una por cada extremo", ok: false, r: "El ciclo no mira solo i y j: pasa por cada entero entre ellos." },
            { t: "log m veces", ok: false, r: "k avanza de a uno; no hay mitades." }
          ], orden: function (t) { return t.b - t.a + 1; } },
        { linea: 6, txt: "while n != 1:", lineas: [7],
          opciones: [
            { t: "log₂ k veces: n se parte en dos", ok: false, r: "Cuando n es impar sube a 3n + 1. Con k = 27 la sucesión pasa de 9000 antes de bajar y da 111 pasos." },
            { t: "L − 1 veces por número; hasta m(L − 1) por par", ok: true, r: "Un paso por término de la sucesión, y una sucesión por cada número del intervalo." },
            { t: "m veces por número", ok: false, r: "La sucesión de k no sabe nada del intervalo: su largo lo fija k." }
          ], orden: function (t) { return t.b - t.a + 1; }, holgura: 0.3,
          nota: "L crece despacio con k, así que al duplicar m las vueltas crecen algo más que el doble." }
      ],
      total: [
        { t: "O(1): la entrada son dos números", ok: false, r: "Pocos números no es poco trabajo: el par 1 9999 da 849.637 pasos de sucesión." },
        { t: "O(m)", ok: false, r: "Cuenta el ciclo de afuera y olvida el de adentro: cada número corre su sucesión entera." },
        { t: "O(m · L)", ok: true, r: "m números, cada uno con a lo sumo L − 1 pasos." },
        { t: "O(m²)", ok: false, r: "El ciclo de adentro no recorre el intervalo; recorre la sucesión de un número." }
      ],
      limites: "Todos los enteros son mayores que 0 y menores que 10000; el enunciado no fija cuántos pares trae el archivo.",
      cuenta: "Peor par, 1 9999: 849.637 pasos de sucesión (medido), por debajo de m · L ≈ 10⁴ × 262 ≈ 2,6 × 10⁶.",
      alcanza: [
        { t: "Alcanza porque cada línea trae solo dos números", ok: false, r: "La razón está mal aunque el veredicto acierte: la cuenta sale del valor de los números, y el par 1 9999 cuesta 849.637 pasos." },
        { t: "No alcanza: cada número tiene una sucesión que no se sabe cuándo termina", ok: false, r: "El enunciado dice que para n < 10⁶ termina, y con k < 10⁴ el ciclo más largo mide 262." },
        { t: "Alcanza: menos de 10⁶ pasos por par contra 10⁸ por segundo", ok: true, r: "Caben más de cien pares del peor tipo en un segundo." }
      ],
      tabla: { tamano: "m < 10⁴, L ≤ 262", O: "O(m · L) por par", peor: "≈ 8,5 × 10⁵ por par" },
      entrada: function (t) { return t.a + " " + t.b + "\n"; },
      medir: function (texto) {
        var d = fichas(texto), c = contador();
        function longitud(n) {
          c.inc(5);
          var cuenta = 1;
          while (n !== 1) {
            c.inc(7);
            if (n % 2 === 1) { n = 3 * n + 1; } else { n = n / 2; }
            cuenta = cuenta + 1;
          }
          return cuenta;
        }
        function maximo(a, b) {
          c.inc(16);
          var mejor = 0, k = a;
          while (k <= b) {
            c.inc(19);
            var l = longitud(k);
            if (l > mejor) { mejor = l; }
            k = k + 1;
          }
          return mejor;
        }
        var t = 0;
        while (t + 1 < d.length) {
          c.inc(30);
          var i = parseInt(d[t], 10), j = parseInt(d[t + 1], 10);
          if (i <= j) { maximo(i, j); } else { maximo(j, i); }
          t = t + 2;
        }
        return c.valor();
      },
      tamanos: [{ a: 1, b: 2000, etiqueta: "el par 1 2000" }, { a: 1, b: 4000, etiqueta: "el par 1 4000" }]
    },

    {
      id: "10189",
      titulo: "Minesweeper",
      url: "https://onlinejudge.org/external/101/10189.pdf",
      archivo: "minesweeper.py",
      codigo: [
        "import sys",
        "",
        "",
        "def contar(campo, n, m, f, c):",
        "    total = 0",
        "    df = -1",
        "    while df <= 1:",
        "        dc = -1",
        "        while dc <= 1:",
        "            g = f + df",
        "            h = c + dc",
        "            if (df != 0 or dc != 0) and g >= 0 and g < n and h >= 0 and h < m:",
        "                if campo[g][h] == \"*\":",
        "                    total = total + 1",
        "            dc = dc + 1",
        "        df = df + 1",
        "    return total",
        "",
        "",
        "def main():",
        "    datos = sys.stdin.read().split()",
        "    pos = 0",
        "    numero = 0",
        "    n = int(datos[pos])",
        "    m = int(datos[pos + 1])",
        "    pos = pos + 2",
        "    while n != 0 or m != 0:",
        "        campo = datos[pos:pos + n]",
        "        pos = pos + n",
        "        numero = numero + 1",
        "        if numero > 1:",
        "            print(\"\")",
        "        print(\"Field #%d:\" % numero)",
        "        f = 0",
        "        while f < n:",
        "            fila = \"\"",
        "            c = 0",
        "            while c < m:",
        "                if campo[f][c] == \"*\":",
        "                    fila = fila + \"*\"",
        "                else:",
        "                    fila = fila + str(contar(campo, n, m, f, c))",
        "                c = c + 1",
        "            print(fila)",
        "            f = f + 1",
        "        n = int(datos[pos])",
        "        m = int(datos[pos + 1])",
        "        pos = pos + 2",
        "",
        "",
        "main()"
      ],
      variable: [
        { t: "La cantidad de minas del campo", ok: false,
          r: "Una casilla con mina se copia y una sin mina mira sus vecinas: con o sin minas, cada casilla se visita. Las minas no fijan el trabajo." },
        { t: "n y m, las filas y columnas del campo", ok: true,
          r: "El código visita cada una de las n · m casillas; los dos llegan a 100." },
        { t: "Las 8 casillas vecinas", ok: false,
          r: "Son 8 para cualquier campo: es una constante, no una variable que crezca." }
      ],
      nombre: "n y m",
      puntos: [
        { linea: 27, txt: "while n != 0 or m != 0:", lineas: [28],
          opciones: [
            { t: "Una vez por campo", ok: true, r: "Cada vuelta procesa un campo completo; el análisis sigue por campo." },
            { t: "n · m veces", ok: false, r: "Las casillas las recorren los dos ciclos de adentro; este recorre campos." }
          ], orden: function () { return 1; } },
        { linea: 35, txt: "while f < n:", lineas: [36],
          opciones: [
            { t: "n veces", ok: true, r: "Una vuelta por fila." },
            { t: "n · m veces", ok: false, r: "Una vuelta por fila; las columnas son del ciclo de adentro." }
          ], orden: function (t) { return t.n; } },
        { linea: 38, txt: "while c < m:", lineas: [39],
          opciones: [
            { t: "m veces en total", ok: false, r: "Son m por fila, y hay n filas." },
            { t: "n · m veces en total", ok: true, r: "Una vuelta por casilla." },
            { t: "(n · m)² veces", ok: false, r: "Cada casilla se visita una vez; nadie recorre el campo entero por cada casilla." }
          ], orden: function (t) { return t.n * t.m; } },
        { linea: 42, txt: "contar(campo, n, m, f, c)", lineas: [5],
          opciones: [
            { t: "Una vez por casilla sin mina: a lo sumo n · m", ok: true, r: "Las casillas con mina se copian sin llamar." },
            { t: "Una vez por mina", ok: false, r: "Al contrario: se llama en las casillas que no tienen mina." }
          ], orden: function (t) { return t.n * t.m; } },
        { linea: 7, txt: "while df <= 1:", lineas: [8],
          opciones: [
            { t: "3 veces por llamada", ok: true, r: "df toma tres valores, −1, 0 y 1, sea cual sea el tamaño del campo." },
            { t: "n veces por llamada", ok: false, r: "df no recorre el campo: va de −1 a 1." }
          ], orden: function (t) { return t.n * t.m; } },
        { linea: 9, txt: "while dc <= 1:", lineas: [10],
          opciones: [
            { t: "n · m veces por llamada", ok: false, r: "Cada llamada mira el cuadrado de 3 × 3 alrededor de la casilla, no el campo." },
            { t: "9 veces por llamada, una constante", ok: true, r: "3 valores de dc por cada uno de los 3 de df. Las vecinas no crecen con el campo." }
          ], orden: function (t) { return t.n * t.m; } }
      ],
      total: [
        { t: "O(n · m · minas)", ok: false, r: "Ninguna casilla recorre la lista de minas: mira sus 8 vecinas." },
        { t: "O((n · m)²)", ok: false, r: "Eso pasaría si cada casilla recorriera el campo entero. Aquí cada una mira 9 posiciones." },
        { t: "O(n · m)", ok: true, r: "n · m casillas por a lo sumo 9 vueltas cada una: la constante 9 no cambia la clase." }
      ],
      limites: "0 < n, m ≤ 100; el enunciado no fija cuántos campos trae el archivo.",
      cuenta: "10⁴ casillas × 9 ≈ 9 × 10⁴ vueltas por campo.",
      alcanza: [
        { t: "Alcanza: menos de 10⁵ vueltas por campo", ok: true, r: "Del orden de leer el campo; caben unos mil campos del tamaño máximo en un segundo." },
        { t: "No alcanza: cada casilla mira 8 vecinas", ok: false, r: "8 por casilla es una constante: 10⁴ casillas dan menos de 10⁵ vueltas." },
        { t: "Depende de cuántas minas haya", ok: false, r: "Con o sin minas el recorrido es el mismo; las minas solo cambian qué se escribe." }
      ],
      tabla: { tamano: "n, m ≤ 100", O: "O(n · m) por campo", peor: "≈ 9 × 10⁴ por campo" },
      entrada: function (t) {
        var s = t.n + " " + t.m + "\n", f, cc;
        for (f = 0; f < t.n; f = f + 1) {
          for (cc = 0; cc < t.m; cc = cc + 1) { s = s + ((f * 7 + cc * 3) % 10 === 0 ? "*" : "."); }
          s = s + "\n";
        }
        return s + "0 0\n";
      },
      medir: function (texto) {
        var d = fichas(texto), c = contador();
        function contar(campo, n, m, f, col) {
          c.inc(5);
          var df = -1;
          while (df <= 1) {
            c.inc(8);
            var dc = -1;
            while (dc <= 1) { c.inc(10); dc = dc + 1; }
            df = df + 1;
          }
        }
        var pos = 0;
        var n = parseInt(d[pos], 10), m = parseInt(d[pos + 1], 10);
        pos = pos + 2;
        while (n !== 0 || m !== 0) {
          c.inc(28);
          var campo = d.slice(pos, pos + n);
          pos = pos + n;
          var f = 0;
          while (f < n) {
            c.inc(36);
            var cc = 0;
            while (cc < m) {
              c.inc(39);
              if (campo[f][cc] !== "*") { contar(campo, n, m, f, cc); }
              cc = cc + 1;
            }
            f = f + 1;
          }
          n = parseInt(d[pos], 10); m = parseInt(d[pos + 1], 10);
          pos = pos + 2;
        }
        return c.valor();
      },
      tamanos: [{ n: 20, m: 20, etiqueta: "un campo de 20 × 20" }, { n: 40, m: 40, etiqueta: "uno de 40 × 40" }]
    },

    {
      id: "10920",
      titulo: "Spiral Tap",
      url: "https://onlinejudge.org/external/109/10920.pdf",
      archivo: "spiral-tap.py",
      codigo: [
        "import sys",
        "",
        "",
        "def anillo(p):",
        "    r = 0",
        "    while (2 * r + 1) * (2 * r + 1) < p:",
        "        r = r + 1",
        "    return r",
        "",
        "",
        "def coordenadas(sz, p):",
        "    c = (sz + 1) // 2",
        "    r = anillo(p)",
        "    if r == 0:",
        "        linea = c",
        "        col = c",
        "    else:",
        "        d = p - (2 * r - 1) * (2 * r - 1) - 1",
        "        if d < 2 * r:",
        "            linea = c + r",
        "            col = c + r - 1 - d",
        "        elif d < 4 * r:",
        "            linea = c + r - (d - 2 * r + 1)",
        "            col = c - r",
        "        elif d < 6 * r:",
        "            linea = c - r",
        "            col = c - r + (d - 4 * r + 1)",
        "        else:",
        "            linea = c - r + (d - 6 * r + 1)",
        "            col = c + r",
        "    return (linea, col)",
        "",
        "",
        "def main():",
        "    datos = sys.stdin.read().split()",
        "    t = 0",
        "    sz = int(datos[t])",
        "    p = int(datos[t + 1])",
        "    while sz != 0 or p != 0:",
        "        res = coordenadas(sz, p)",
        "        print(\"Line = %d, column = %d.\" % (res[0], res[1]))",
        "        t = t + 2",
        "        sz = int(datos[t])",
        "        p = int(datos[t + 1])",
        "",
        "",
        "main()"
      ],
      variable: [
        { t: "Las SZ² casillas de la grilla", ok: false,
          r: "La grilla nunca se construye: el código no tiene ningún arreglo de SZ × SZ. Contar casillas mide una solución que llenara la espiral, no esta." },
        { t: "La cantidad de números de la línea: dos", ok: false,
          r: "El ciclo de anillo corre según cuánto vale P, no según cuántos números se leen." },
        { t: "El valor de P, con SZ como tope porque P ≤ SZ²", ok: true,
          r: "anillo sube r hasta que el cuadrado (2r + 1)² alcanza a P, así que sus vueltas dependen de P; como P ≤ SZ², r no pasa de (SZ − 1)/2." }
      ],
      nombre: "P",
      puntos: [
        { linea: 39, txt: "while sz != 0 or p != 0:", lineas: [40],
          opciones: [
            { t: "SZ veces", ok: false, r: "Este ciclo recorre las líneas de la entrada; SZ no lo mueve." },
            { t: "Una vez por línea de la entrada", ok: true, r: "Cada vuelta resuelve una consulta SZ, P." }
          ], orden: function () { return 1; } },
        { linea: 13, txt: "anillo(p)", lineas: [5],
          opciones: [
            { t: "Una vez por consulta", ok: true, r: "coordenadas la llama una vez y el resto es aritmética." },
            { t: "P veces", ok: false, r: "La llamada no está dentro de ningún ciclo de coordenadas." }
          ], orden: function () { return 1; } },
        { linea: 6, txt: "while (2 * r + 1) * (2 * r + 1) < p:", lineas: [7],
          opciones: [
            { t: "P veces", ok: false, r: "r sube de uno en uno, pero la condición mira (2r + 1)², que crece al cuadrado. Con P = 10⁶ el ciclo da 500 vueltas, no un millón." },
            { t: "≈ √P / 2 veces", ok: true, r: "Termina en el primer r con (2r + 1)² ≥ P, es decir r ≈ (√P − 1)/2. Con P ≤ SZ², r ≤ (SZ − 1)/2." },
            { t: "SZ² veces, una por casilla", ok: false, r: "La grilla no se recorre; el ciclo solo busca en qué anillo cae P." },
            { t: "log₂ P veces", ok: false, r: "r no se duplica: sube de a uno." }
          ], orden: function (t) { return Math.sqrt(t.p); } }
      ],
      total: [
        { t: "O(SZ²) por consulta", ok: false, r: "Eso costaría llenar la espiral casilla por casilla hasta llegar a P. Este código salta directo al anillo." },
        { t: "O(√P) por consulta, que es O(SZ)", ok: true, r: "Las vueltas de anillo más una cantidad fija de cuentas." },
        { t: "O(1) por consulta", ok: false, r: "anillo tiene un ciclo que depende de P. Con una raíz cuadrada en vez del ciclo sí sería O(1)." },
        { t: "O(P) por consulta", ok: false, r: "El ciclo avanza por anillos, no por posiciones: hay unos √P / 2 anillos antes de P." }
      ],
      limites: "SZ impar y no mayor que 100000; P es una posición de la grilla, así que P ≤ SZ²; el enunciado no fija cuántas líneas trae el archivo.",
      cuenta: "r ≤ (SZ − 1)/2 ≈ 5 × 10⁴ vueltas por línea.",
      alcanza: [
        { t: "No alcanza: la grilla tiene 10¹⁰ casillas", ok: false, r: "Esa cuenta vale para quien construya la grilla. Esta solución no la construye: recorre anillos." },
        { t: "Alcanza: a lo sumo 5 × 10⁴ vueltas por línea", ok: true, r: "Caben unas 2000 líneas del peor tipo en un segundo." },
        { t: "Alcanza porque P es un solo número", ok: false, r: "El veredicto acierta por la razón equivocada: lo que cuenta es el valor de P, que fija cuántos anillos se recorren." }
      ],
      tabla: { tamano: "SZ ≤ 10⁵, P ≤ SZ²", O: "O(√P) = O(SZ) por línea", peor: "≈ 5 × 10⁴ por línea" },
      entrada: function (t) { return "99999 " + t.p + "\n0 0\n"; },
      medir: function (texto) {
        var d = fichas(texto), c = contador();
        function anillo(p) {
          c.inc(5);
          var r = 0;
          while ((2 * r + 1) * (2 * r + 1) < p) { c.inc(7); r = r + 1; }
          return r;
        }
        var t = 0;
        var sz = parseInt(d[t], 10), p = parseInt(d[t + 1], 10);
        while (sz !== 0 || p !== 0) {
          c.inc(40);
          c.inc(12);
          anillo(p);
          t = t + 2;
          sz = parseInt(d[t], 10); p = parseInt(d[t + 1], 10);
        }
        return c.valor();
      },
      tamanos: [{ p: 1000000, etiqueta: "P = 10⁶" }, { p: 4000000, etiqueta: "P = 4 × 10⁶" }]
    },

    {
      id: "839",
      titulo: "Not so Mobile",
      url: "https://onlinejudge.org/external/8/839.pdf",
      archivo: "not-so-mobile.py",
      codigo: [
        "# UVa 839 - Not so Mobile",
        "import sys",
        "",
        "",
        "def movil(datos, pos):",
        "    # lee la barra que empieza en datos[pos] y todo lo que cuelga de ella;",
        "    # devuelve el peso, si está en equilibrio y dónde sigue la entrada",
        "    wl = int(datos[pos])",
        "    dl = int(datos[pos + 1])",
        "    wr = int(datos[pos + 2])",
        "    dr = int(datos[pos + 3])",
        "    pos = pos + 4",
        "    equilibrio = True",
        "    if wl == 0:",
        "        wl, eq_izq, pos = movil(datos, pos)",
        "        equilibrio = equilibrio and eq_izq",
        "    if wr == 0:",
        "        wr, eq_der, pos = movil(datos, pos)",
        "        equilibrio = equilibrio and eq_der",
        "    if wl * dl != wr * dr:",
        "        equilibrio = False",
        "    return wl + wr, equilibrio, pos",
        "",
        "",
        "def main():",
        "    sys.setrecursionlimit(10000)",
        "    datos = sys.stdin.read().split()",
        "    casos = int(datos[0])",
        "    pos = 1",
        "    for c in range(casos):",
        "        peso, equilibrio, pos = movil(datos, pos)",
        "        if c > 0:",
        "            print(\"\")",
        "        if equilibrio:",
        "            print(\"YES\")",
        "        else:",
        "            print(\"NO\")",
        "",
        "",
        "main()"
      ],
      variable: [
        { t: "La profundidad del móvil", ok: false,
          r: "La profundidad mide cuántas llamadas hay abiertas a la vez en la pila, no cuántas se hacen. Un móvil bajo y ancho tiene muchas barras." },
        { t: "k, las barras del caso: cada línea del caso es un nodo del árbol", ok: true,
          r: "Cada línea describe una barra y cada barra es una llamada a movil." },
        { t: "Los valores de W y D", ok: false,
          r: "Los pesos y distancias se multiplican una vez por barra: un peso de 1000 no cuesta más vueltas que uno de 1." },
        { t: "Las líneas de todo el archivo, contando los otros casos", ok: false,
          r: "Cada caso se analiza por su cuenta. Dentro de un caso, una línea es una barra." }
      ],
      nombre: "k",
      puntos: [
        { linea: 30, txt: "for c in range(casos):", lineas: [31],
          opciones: [
            { t: "k veces", ok: false, r: "Este ciclo recorre casos; las barras las recorre la recursión." },
            { t: "Una vez por caso", ok: true, r: "Cada vuelta lee un móvil completo con una llamada." }
          ], orden: function () { return 1; } },
        { linea: 15, txt: "movil(datos, pos)  (líneas 15 y 18)", lineas: [15, 18],
          opciones: [
            { t: "2^p, con p la profundidad: cada llamada abre dos", ok: false, r: "Una llamada abre dos solo si las dos puntas son submóviles, y cada submóvil es una barra distinta que se lee una vez. Las llamadas no pasan del número de barras." },
            { t: "k − 1 en total: una por cada barra que cuelga de otra", ok: true, r: "Toda barra salvo la de arriba se visita desde su padre, y cada llamada consume su línea y avanza pos." },
            { t: "k² en total", ok: false, r: "Ninguna barra se vuelve a leer: pos solo avanza." }
          ], orden: function (t) { return t.k; } },
        { linea: 5, txt: "def movil(datos, pos):  (cuerpo de cada llamada)", lineas: [8],
          opciones: [
            { t: "Una vez por barra: k por caso", ok: true, r: "La de main más las k − 1 recursivas. Sin ciclos adentro, cada llamada hace un trabajo fijo." },
            { t: "Una vez por caso", ok: false, r: "La primera llamada viene de main, pero desde ahí se llama una vez por submóvil." }
          ], orden: function (t) { return t.k; } }
      ],
      total: [
        { t: "O(2^p)", ok: false, r: "El árbol tiene k nodos y cada uno se visita una vez; nunca hay más llamadas que barras." },
        { t: "O(k log k)", ok: false, r: "No hay nada que ordenar ni partir: una visita por barra." },
        { t: "O(k)", ok: true, r: "k llamadas con trabajo fijo cada una: lo mismo que leer el caso." },
        { t: "O(k²)", ok: false, r: "Cada línea se lee una sola vez porque pos avanza." }
      ],
      limites: "El enunciado no da tope para el número de barras ni para los valores.",
      cuenta: "k llamadas por caso, del mismo orden que las líneas que se leen.",
      alcanza: [
        { t: "No alcanza: con un móvil profundo la recursión explota", ok: false, r: "La profundidad no multiplica el trabajo; pesa en la pila de llamadas, y por eso el código sube el límite de recursión." },
        { t: "No se puede decir nada sin un tope", ok: false, r: "Sin tope, la comparación útil es contra la lectura: resolver cuesta lo mismo que leer, y el archivo se lee." },
        { t: "Alcanza: es lineal en las barras, cuesta lo mismo que leer el caso", ok: true, r: "Sin tope en el enunciado, un costo del orden de la entrada es lo mejor posible." }
      ],
      tabla: { tamano: "k barras, sin tope", O: "O(k) por caso", peor: "del orden de la entrada" },
      entrada: function (t) {
        var r = azar(839);
        var lineas = [];
        function barra(k) {
          var resto = k - 1;
          var izq = entero(r, 0, resto);
          var der = resto - izq;
          var linea = [izq > 0 ? 0 : entero(r, 1, 9), entero(r, 1, 9), der > 0 ? 0 : entero(r, 1, 9), entero(r, 1, 9)];
          lineas.push(linea.join(" "));
          if (izq > 0) { barra(izq); }
          if (der > 0) { barra(der); }
        }
        barra(t.k);
        return "1\n\n" + lineas.join("\n") + "\n";
      },
      medir: function (texto) {
        var d = fichas(texto), c = contador();
        function movil(pos) {
          c.inc(8);
          var wl = parseInt(d[pos], 10), wr = parseInt(d[pos + 2], 10);
          pos = pos + 4;
          if (wl === 0) { c.inc(15); pos = movil(pos); }
          if (wr === 0) { c.inc(18); pos = movil(pos); }
          return pos;
        }
        var casos = parseInt(d[0], 10), pos = 1, k;
        for (k = 0; k < casos; k = k + 1) { c.inc(31); pos = movil(pos); }
        return c.valor();
      },
      tamanos: [{ k: 200, etiqueta: "k = 200" }, { k: 400, etiqueta: "k = 400" }]
    },

    {
      id: "620",
      titulo: "Cellular Structure",
      url: "https://onlinejudge.org/external/6/620.pdf",
      archivo: "cellular-structure.py",
      codigo: [
        "import sys",
        "",
        "sys.setrecursionlimit(100000)",
        "",
        "",
        "# 0 mutante, 1 simple, 2 crecido, 3 mutagenico; s[ini..fin] inclusive",
        "def clasificar(s, ini, fin):",
        "    r = 0",
        "    n = fin - ini + 1",
        "    if n == 1 and s[ini] == \"A\":",
        "        r = 1",
        "    elif n >= 3 and s[fin - 1] == \"A\" and s[fin] == \"B\" and clasificar(s, ini, fin - 2) != 0:",
        "        r = 2",
        "    elif n >= 3 and s[ini] == \"B\" and s[fin] == \"A\" and clasificar(s, ini + 1, fin - 1) != 0:",
        "        r = 3",
        "    return r",
        "",
        "",
        "def main():",
        "    datos = sys.stdin.read().split()",
        "    nombres = [\"MUTANT\", \"SIMPLE\", \"FULLY-GROWN\", \"MUTAGENIC\"]",
        "    casos = int(datos[0])",
        "    t = 1",
        "    while t <= casos and t < len(datos):",
        "        s = datos[t]",
        "        print(nombres[clasificar(s, 0, len(s) - 1)])",
        "        t = t + 1",
        "",
        "",
        "main()"
      ],
      variable: [
        { t: "n, la cantidad de cadenas", ok: false,
          r: "Las cadenas se clasifican una por una; n multiplica, pero el trabajo de cada una lo fija su largo." },
        { t: "L, la longitud de la cadena", ok: true,
          r: "Cada llamada quita letras de los extremos hasta llegar a una sola: el trabajo depende de cuántas hay." },
        { t: "Cuántas letras A trae la cadena", ok: false,
          r: "Las A y las B se comparan igual; lo que cuenta es el largo total, que es el que se va recortando." }
      ],
      nombre: "L",
      puntos: [
        { linea: 24, txt: "while t <= casos and t < len(datos):", lineas: [25],
          opciones: [
            { t: "Una vez por cadena", ok: true, r: "Cada vuelta clasifica una cadena." },
            { t: "L veces", ok: false, r: "Este ciclo recorre cadenas, no letras." }
          ], orden: function () { return 1; } },
        { linea: 26, txt: "clasificar(s, 0, len(s) - 1)", lineas: [8],
          opciones: [
            { t: "2^L llamadas: hay dos ramas recursivas", ok: false, r: "La rama de la línea 12 pide que la última letra sea B y la de la línea 14 que sea A: en cada llamada corre a lo sumo una. Además, cada llamada quita dos letras." },
            { t: "≈ L/2 llamadas por cadena", ok: true, r: "Cada llamada recursiva recibe la cadena con dos letras menos y hace a lo sumo una llamada." },
            { t: "L² llamadas por cadena", ok: false, r: "Ninguna llamada recorre la cadena; compara letras en los extremos y baja una vez." }
          ], orden: function (t) { return t.k; } }
      ],
      total: [
        { t: "O(2^L)", ok: false, r: "Las dos ramas se excluyen por la última letra, así que el árbol de llamadas es una cadena, no un árbol binario." },
        { t: "O(L)", ok: true, r: "≈ L/2 llamadas con trabajo fijo: comparar letras en posiciones conocidas." },
        { t: "O(L²)", ok: false, r: "Cada llamada trabaja con índices ini y fin y no copia la cadena: su trabajo no depende de L." }
      ],
      limites: "El enunciado no da tope para el número de cadenas ni para su largo.",
      cuenta: "≈ L/2 llamadas por cadena, menos que las letras que se leen.",
      alcanza: [
        { t: "Alcanza: lineal en el largo, menos que leer la cadena", ok: true, r: "Sin tope en el enunciado, un costo del orden de la entrada es lo mejor posible. La pila sí crece con L/2, y por eso el código sube el límite de recursión." },
        { t: "No alcanza: la recursión con dos ramas es exponencial", ok: false, r: "Las dos ramas nunca corren en la misma llamada: piden última letra distinta." },
        { t: "No alcanza si hay muchas cadenas", ok: false, r: "Muchas cadenas son mucha entrada, y cada una se resuelve en menos de lo que cuesta leerla." }
      ],
      tabla: { tamano: "L letras, sin tope", O: "O(L) por cadena", peor: "del orden de la entrada" },
      entrada: function (t) {
        var r = azar(620);
        var s = "A", k;
        for (k = 0; k < t.k; k = k + 1) {
          if (r() < 0.5) { s = s + "AB"; } else { s = "B" + s + "A"; }
        }
        return "1\n" + s + "\n";
      },
      medir: function (texto) {
        var d = fichas(texto), c = contador();
        function clasificar(s, ini, fin) {
          c.inc(8);
          var r = 0, n = fin - ini + 1;
          if (n === 1 && s[ini] === "A") {
            r = 1;
          } else if (n >= 3 && s[fin - 1] === "A" && s[fin] === "B" && clasificar(s, ini, fin - 2) !== 0) {
            r = 2;
          } else if (n >= 3 && s[ini] === "B" && s[fin] === "A" && clasificar(s, ini + 1, fin - 1) !== 0) {
            r = 3;
          }
          return r;
        }
        var casos = parseInt(d[0], 10), t = 1;
        while (t <= casos && t < d.length) {
          c.inc(25);
          clasificar(d[t], 0, d[t].length - 1);
          t = t + 1;
        }
        return c.valor();
      },
      tamanos: [{ k: 200, etiqueta: "L = 401" }, { k: 400, etiqueta: "L = 801" }]
    }
  ];

  /* Vueltas de un punto a partir del conteo por línea. */
  function vueltasPunto(punto, conteo) {
    var total = 0;
    punto.lineas.forEach(function (l) { total = total + (conteo[l] || 0); });
    return total;
  }

  function medirPunto(problema, k, tam) {
    return vueltasPunto(problema.puntos[k], problema.medir(problema.entrada(tam)));
  }

  /* Consistencia de los datos de un problema: devuelve la lista de fallas. */
  function revisar(p) {
    var fallas = [];
    function unaCorrecta(lista, donde) {
      var n = lista.filter(function (o) { return o.ok; }).length;
      if (n !== 1) { fallas.push(p.id + " " + donde + ": " + n + " opciones correctas"); }
      lista.forEach(function (o, i) {
        if (!o.r || o.r.length < 20) { fallas.push(p.id + " " + donde + " opción " + i + " sin razón"); }
      });
    }
    unaCorrecta(p.variable, "variable");
    unaCorrecta(p.total, "total");
    unaCorrecta(p.alcanza, "alcanza");
    p.puntos.forEach(function (q, i) {
      unaCorrecta(q.opciones, "punto " + i);
      if (q.linea < 1 || q.linea > p.codigo.length) { fallas.push(p.id + " punto " + i + " fuera del código"); }
      q.lineas.forEach(function (l) {
        if (l < 1 || l > p.codigo.length || p.codigo[l - 1].trim() === "") {
          fallas.push(p.id + " punto " + i + " cuenta una línea vacía o inexistente: " + l);
        }
      });
      var cabeza = q.txt.split("  (")[0].replace(/^def /, "def ");
      if (p.codigo[q.linea - 1].indexOf(cabeza.split("(")[0].trim()) === -1) {
        fallas.push(p.id + " punto " + i + " no coincide con la línea " + q.linea + ": " + p.codigo[q.linea - 1]);
      }
    });
    if (p.tamanos.length !== 2) { fallas.push(p.id + " sin dos tamaños"); }
    return fallas;
  }

  return {
    problemas: PROBLEMAS,
    opsPorSegundo: OPS_POR_SEGUNDO,
    vueltasPunto: vueltasPunto,
    medirPunto: medirPunto,
    revisar: revisar
  };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var estado = {};
    var actual = 0;

    EJERCICIO.problemas.forEach(function (p) {
      estado[p.id] = { variable: false, puntos: {}, total: false, alcanza: false };
    });

    function el(etiqueta, clase, texto) {
      var e = document.createElement(etiqueta);
      if (clase) { e.className = clase; }
      if (texto !== undefined) { e.textContent = texto; }
      return e;
    }

    function terminado(p) {
      var s = estado[p.id];
      return s.variable && s.total && s.alcanza &&
        Object.keys(s.puntos).length === p.puntos.length;
    }

    function resaltar(linea) {
      Array.prototype.forEach.call(document.querySelectorAll("#panel-codigo .linea"), function (d) {
        d.classList.toggle("actual", parseInt(d.getAttribute("data-l"), 10) === linea);
      });
      var objetivo = document.querySelector("#panel-codigo .linea.actual");
      if (objetivo) {
        var panel = document.getElementById("panel-codigo");
        panel.scrollTop = objetivo.offsetTop - panel.offsetTop - panel.clientHeight / 3;
      }
    }

    /* Botonera de opciones con su veredicto; alAcertar se llama una vez. */
    function preguntas(contenedor, opciones, resuelta, alAcertar) {
      var caja = el("div", "opciones");
      var ver = el("div", "veredicto");
      opciones.forEach(function (o) {
        var b = el("button", "", o.t);
        if (resuelta) { b.disabled = !o.ok; }
        b.addEventListener("click", function () {
          if (o.ok) {
            ver.className = "veredicto bien";
            ver.textContent = o.r;
            Array.prototype.forEach.call(caja.querySelectorAll("button"), function (x) { x.disabled = x !== b; });
            alAcertar(ver);
          } else {
            ver.className = "veredicto mal";
            ver.textContent = o.r;
          }
        });
        caja.appendChild(b);
      });
      if (resuelta) {
        var buena = opciones.filter(function (o) { return o.ok; })[0];
        ver.className = "veredicto bien";
        ver.textContent = buena.r;
      }
      contenedor.appendChild(caja);
      contenedor.appendChild(ver);
      return ver;
    }

    function textoMedido(p, k) {
      var partes = p.tamanos.map(function (t) {
        return EJERCICIO.medirPunto(p, k, t).toLocaleString("es-CO") + " con " + t.etiqueta;
      });
      return "Medido al correr el código: " + partes.join(" y ") + "." +
        (p.puntos[k].nota ? " " + p.puntos[k].nota : "");
    }

    function pintarSelector() {
      var caja = document.getElementById("selector");
      caja.innerHTML = "";
      EJERCICIO.problemas.forEach(function (p, i) {
        var b = el("button", i === actual ? "primario" : "", (terminado(p) ? "✓ " : "") + "UVa " + p.id);
        b.addEventListener("click", function () { actual = i; pintar(); });
        caja.appendChild(b);
      });
    }

    function pintarCodigo(p) {
      var panel = document.getElementById("panel-codigo");
      panel.innerHTML = "";
      p.codigo.forEach(function (txt, i) {
        var d = el("div", "linea");
        d.setAttribute("data-l", i + 1);
        d.appendChild(el("span", "num", String(i + 1)));
        d.appendChild(el("span", "txt", txt === "" ? " " : txt));
        panel.appendChild(d);
      });
      panel.scrollTop = 0;
    }

    function pintarPasos(p) {
      var s = estado[p.id];
      var pasos = document.getElementById("pasos");
      pasos.innerHTML = "";

      var c1 = el("div", "carta");
      c1.appendChild(el("h2", "", "1. ¿De qué depende el tamaño de la entrada?"));
      pasos.appendChild(c1);
      preguntas(c1, p.variable, s.variable, function () {
        if (!s.variable) { s.variable = true; pintarPasos(p); pintarSelector(); }
      });
      if (!s.variable) { return; }

      var c2 = el("div", "carta");
      c2.appendChild(el("h2", "", "2. ¿Cuántas veces corre cada ciclo o llamada, en términos de " + p.nombre + "?"));
      c2.appendChild(el("div", "nota", "Toque el rótulo de cada fila para ubicarla en el código."));
      p.puntos.forEach(function (q, k) {
        var fila = el("div", "punto");
        var rot = el("div", "rotulo-punto");
        rot.appendChild(el("span", "num-linea", "línea " + q.linea));
        rot.appendChild(el("code", "", q.txt));
        rot.addEventListener("click", function () { resaltar(q.linea); });
        fila.appendChild(rot);
        var ver = preguntas(fila, q.opciones, !!s.puntos[k], function (v) {
          resaltar(q.linea);
          v.textContent = q.opciones.filter(function (o) { return o.ok; })[0].r + " " + textoMedido(p, k);
          if (!s.puntos[k]) {
            s.puntos[k] = true;
            if (Object.keys(s.puntos).length === p.puntos.length) { pintarPasos(p); pintarSelector(); }
          }
        });
        if (s.puntos[k]) { ver.textContent = ver.textContent + " " + textoMedido(p, k); }
        c2.appendChild(fila);
      });
      pasos.appendChild(c2);
      if (Object.keys(s.puntos).length < p.puntos.length) { return; }

      var c3 = el("div", "carta");
      c3.appendChild(el("h2", "", "3. El total en O"));
      pasos.appendChild(c3);
      preguntas(c3, p.total, s.total, function () {
        if (!s.total) { s.total = true; pintarPasos(p); pintarSelector(); }
      });
      if (!s.total) { return; }

      var c4 = el("div", "carta");
      c4.appendChild(el("h2", "", "4. ¿Alcanza el tiempo?"));
      var lim = el("div", "alerta");
      lim.appendChild(el("b", "", "Límites del enunciado: "));
      lim.appendChild(document.createTextNode(p.limites));
      c4.appendChild(lim);
      c4.appendChild(el("p", "", "Suponga unas 10⁸ operaciones por segundo. " + p.cuenta));
      pasos.appendChild(c4);
      preguntas(c4, p.alcanza, s.alcanza, function () {
        if (!s.alcanza) {
          s.alcanza = true;
          pintarSelector();
          pintarTabla();
          pintarPasos(p);
        }
      });
      if (s.alcanza) {
        var siguiente = EJERCICIO.problemas.filter(function (x) { return !terminado(x); })[0];
        if (siguiente) {
          var b = el("button", "primario", "Siguiente: UVa " + siguiente.id);
          b.style.marginTop = "0.7rem";
          b.addEventListener("click", function () {
            actual = EJERCICIO.problemas.indexOf(siguiente);
            pintar();
          });
          c4.appendChild(b);
        }
      }
    }

    function pintarTabla() {
      var cuerpo = document.getElementById("cuerpo-cierre");
      cuerpo.innerHTML = "";
      var hechos = 0;
      EJERCICIO.problemas.forEach(function (p) {
        var tr = document.createElement("tr");
        var listo = terminado(p);
        if (listo) { hechos = hechos + 1; }
        [["UVa " + p.id + " · " + p.titulo, true],
         [p.nombre, listo], [p.tabla.tamano, listo], [p.tabla.O, listo], [p.tabla.peor, listo]].forEach(function (c) {
          var td = el("td", c[1] ? "" : "pend", c[1] ? c[0] : "?");
          tr.appendChild(td);
        });
        cuerpo.appendChild(tr);
      });
      var nota = document.getElementById("nota-cierre");
      if (hechos === EJERCICIO.problemas.length) {
        nota.className = "veredicto bien";
        nota.textContent = "Los ocho resueltos. En todos, la variable salió de lo que recorre el código: " +
          "el valor de P y de j − i en 10920 y 100, las barras y no las líneas del archivo en 839, " +
          "el lado N y no las N² casillas en 108. Con la variable correcta, el total y el veredicto " +
          "contra los límites salen de multiplicar las vueltas de los ciclos anidados.";
      } else {
        nota.className = "nota";
        nota.textContent = "Van " + hechos + " de " + EJERCICIO.problemas.length + ".";
      }
    }

    function pintar() {
      var p = EJERCICIO.problemas[actual];
      document.getElementById("titulo-problema").textContent = "UVa " + p.id + " · " + p.titulo;
      document.getElementById("url-problema").textContent = p.url;
      document.getElementById("archivo-problema").textContent = p.archivo;
      pintarSelector();
      pintarCodigo(p);
      pintarPasos(p);
    }

    pintar();
    pintarTabla();
  })();
}
