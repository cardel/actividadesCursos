/* ternas: el ejemplo integrador de colecciones, con la version
   for de 08_ternas_pitagoricas.scala. Los tres generadores encadenados dan el
   orden en que la busqueda prueba las candidatas, y la simulacion lo sigue
   tal cual: primero c, dentro b hasta c, dentro a hasta b.

   De la corrida con Scala 2.13.11: con n = 5 se prueban 35 candidatas y
   sobrevive una, ternasPFor(5) imprime Set((3,4,5)); con n = 20 sobreviven
   seis, ternasPFor(20).size es 6, ternasPFor(20) imprime
   HashSet((5,12,13), (12,16,20), (8,15,17), (6,8,10), (9,12,15), (3,4,5)) y
   ordenadas quedan List((3,4,5), (5,12,13), (6,8,10), (8,15,17), (9,12,15),
   (12,16,20)). La version con flatMap da el mismo conjunto:
   ternasPHOF(20) == ternasPFor(20) imprime true. */
(function () {

  var CODIGO = [
    { num: null, txt: "def ternasPFor(n: Int): Set[(Int, Int, Int)] =" },
    { num: null, txt: "  (for {" },
    { num: 3, txt: "    c <- 1 to n", bloque: 1 },
    { num: 4, txt: "    b <- 1 to c", bloque: 1 },
    { num: 5, txt: "    a <- 1 to b", bloque: 1 },
    { num: 6, txt: "    if a * a + b * b == c * c", bloque: 2 },
    { num: 7, txt: "  } yield (a, b, c)).toSet", bloque: 3 }
  ];

  var CODIGO_HOF = [
    "def ternasPHOF(n: Int): Set[(Int, Int, Int)] =",
    "  (1 to n).flatMap(c =>",
    "    (1 to c).flatMap(b =>",
    "      (1 to b).map(a => (a, b, c))",
    "    )",
    "  ).filter { case (a, b, c) => a * a + b * b == c * c }.toSet"
  ];

  var VALORES_N = [5, 20];

  /* Lo que imprime println(ternasPFor(n)) en la corrida, literal. */
  var IMPRESO = {
    5: "Set((3,4,5))",
    20: "HashSet((5,12,13), (12,16,20), (8,15,17), (6,8,10), (9,12,15), (3,4,5))"
  };

  function terna(a, b, c) { return "(" + a + "," + b + "," + c + ")"; }

  function paso(extra) {
    var p = {
      linea: null, n: null, c: null, b: null, a: null,
      izq: null, der: null, dice: null, candidatas: null,
      terna: null, ternas: null, halladas: null
    };
    Object.keys(extra).forEach(function (k) { p[k] = extra[k]; });
    return p;
  }

  function simular(n) {
    var pasos = [];
    var halladas = [];
    var candidatas = 0;
    var c, b, a, izq, der, pasa;

    for (c = 1; c <= n; c = c + 1) {
      pasos.push(paso({
        linea: 3, n: n, c: c, candidatas: candidatas,
        ternas: halladas.length, halladas: halladas.slice(),
        dice: "c toma el valor " + c
      }));
      for (b = 1; b <= c; b = b + 1) {
        pasos.push(paso({
          linea: 4, n: n, c: c, b: b, candidatas: candidatas,
          ternas: halladas.length, halladas: halladas.slice(),
          dice: "b recorre 1 to " + c
        }));
        for (a = 1; a <= b; a = a + 1) {
          pasos.push(paso({
            linea: 5, n: n, c: c, b: b, a: a, candidatas: candidatas,
            ternas: halladas.length, halladas: halladas.slice(),
            dice: "a recorre 1 to " + b
          }));
          izq = a * a + b * b;
          der = c * c;
          pasa = izq === der;
          candidatas = candidatas + 1;
          pasos.push(paso({
            linea: 6, n: n, c: c, b: b, a: a, izq: izq, der: der,
            candidatas: candidatas, ternas: halladas.length,
            halladas: halladas.slice(),
            dice: izq + " == " + der + " es " + pasa
          }));
          if (pasa) {
            halladas.push(terna(a, b, c));
            pasos.push(paso({
              linea: 7, n: n, c: c, b: b, a: a, izq: izq, der: der,
              candidatas: candidatas, ternas: halladas.length,
              halladas: halladas.slice(), terna: terna(a, b, c),
              dice: "la terna entra al resultado"
            }));
          }
        }
      }
    }
    return pasos;
  }

  function resumen(n) {
    var pasos = simular(n);
    var ultimo = pasos[pasos.length - 1];
    return {
      candidatas: ultimo.candidatas,
      halladas: ultimo.halladas,
      pasos: pasos.length
    };
  }

  /* -- Las seis preguntas sobre las piezas de la expresion -- */

  var PIEZAS = [
    {
      expr: "(for { c <- 1 to 5; b <- 1 to c; a <- 1 to b\n       if a * a + b * b == c * c } yield (a, b, c))",
      pregunta: "La misma expresión sin el .toSet del final: qué clase de colección entrega.",
      cierre: "Una expresión for sobre rangos entrega un Vector, con los elementos en el orden en que se generaron.",
      opciones: [
        { txt: "Vector", correcta: true },
        { txt: "Set", fallo: "El conjunto lo pone el .toSet del final. El yield entrega una secuencia, que sí tiene orden y sí admite elementos repetidos." },
        { txt: "List", fallo: "Sobre rangos el yield entrega un Vector: el for del tema, for { i <- 2 until 7; j <- 1 until i; if esPrimo(i + j) } yield (i, j), imprime un Vector de parejas.", larga: true }
      ]
    },
    {
      expr: "println(ternasPFor(5))",
      pregunta: "Con n = 5 sobrevive una sola candidata.",
      cierre: "Un conjunto de un elemento se imprime con el nombre Set.",
      opciones: [
        { txt: "Set((3,4,5))", correcta: true },
        { txt: "Vector((3,4,5))", fallo: "El .toSet del final convierte la secuencia del yield en conjunto, así que lo que se imprime es un Set." },
        { txt: "Set((3,4,5), (4,3,5))", fallo: "Los rangos encadenados impiden generar (4,3,5): con a <- 1 to b, el valor de a nunca pasa de b. La terna se prueba una sola vez.", larga: true }
      ]
    },
    {
      expr: "c <- 1 to n;  b <- 1 to n;  a <- 1 to n",
      pregunta: "Qué cambia si los tres generadores recorrieran el rango completo.",
      cierre: "Los rangos encadenados son los que imponen a <= b <= c, y con eso cada triángulo se genera una sola vez.",
      opciones: [
        { txt: "aparecerían las dos ordenaciones del mismo triángulo, (3,4,5) y (4,3,5)", correcta: true, larga: true },
        { txt: "nada: el filtro descarta la repetida", fallo: "El filtro solo comprueba a * a + b * b == c * c, y 16 + 9 da 25 igual que 9 + 16: las dos ordenaciones pasarían el filtro.", larga: true },
        { txt: "no compilaría: b y a dejarían de usar a c", fallo: "Compilaría: los tres rangos serían independientes. Lo que se perdería es la restricción a <= b <= c, que no la pone ningún filtro sino el extremo de cada rango.", larga: true }
      ]
    },
    {
      expr: "ternasPHOF(20) == ternasPFor(20)",
      pregunta: "La versión con flatMap y filter contra la versión con for.",
      cierre: "Las dos generan las mismas combinaciones y aplican el mismo filtro, así que entregan el mismo conjunto.",
      opciones: [
        { txt: "true", correcta: true },
        { txt: "false", fallo: "false diría que los dos conjuntos tienen elementos distintos. La expresión for con varios generadores es otra forma de escribir los flatMap anidados con un map al final." },
        { txt: "no compila: una devuelve Set y la otra Vector", fallo: "Las dos terminan en .toSet, así que las dos devuelven Set[(Int, Int, Int)] y la comparación es entre dos conjuntos.", larga: true }
      ]
    },
    {
      expr: "println(ternasPFor(20))",
      pregunta: "Con n = 20 sobreviven seis ternas.",
      cierre: "Con seis elementos el conjunto se imprime con el nombre HashSet, y las ternas no salen ni en el orden en que se encontraron ni ordenadas.",
      opciones: [
        { txt: "HashSet((5,12,13), (12,16,20), (8,15,17), (6,8,10), (9,12,15), (3,4,5))", correcta: true, larga: true },
        { txt: "Set((3,4,5), (5,12,13), (6,8,10), (8,15,17), (9,12,15), (12,16,20))", fallo: "Las seis ternas son esas, y en ese orden quedan si se ordenan aparte. El conjunto las imprime con el nombre HashSet y en otro orden.", larga: true },
        { txt: "HashSet((3,4,5), (6,8,10), (5,12,13), (9,12,15), (8,15,17), (12,16,20))", fallo: "Ese es el orden en que la búsqueda las va encontrando, de c pequeño a c grande. El conjunto no guarda el orden en que entraron los elementos.", larga: true }
      ]
    },
    {
      expr: "ternasPFor(20).size",
      pregunta: "Cuántas ternas quedan con n = 20.",
      cierre: "Seis triángulos rectángulos de lados enteros caben con el lado mayor hasta 20.",
      opciones: [
        { txt: "6", correcta: true },
        { txt: "12", fallo: "12 contaría cada triángulo dos veces, una por cada orden de a y b. Los rangos encadenados generan cada uno una sola vez." },
        { txt: "35", fallo: "35 son las candidatas que se prueban con n = 5, no las ternas que sobreviven. size cuenta lo que queda después del filtro." }
      ]
    }
  ];

  var API = {
    CODIGO: CODIGO, CODIGO_HOF: CODIGO_HOF, VALORES_N: VALORES_N,
    IMPRESO: IMPRESO, PIEZAS: PIEZAS,
    simular: simular, resumen: resumen, terna: terna
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================= la pagina ================= */

  var nActual = VALORES_N[0];
  var resueltas = 0;
  var fallados = 0;
  var FILAS = 14;

  function construirHOF() {
    var panel = document.getElementById("panel-hof");
    CODIGO_HOF.forEach(function (texto, i) {
      var div = document.createElement("div");
      var num = document.createElement("span");
      var txt = document.createElement("span");
      div.className = "linea";
      num.className = "num";
      num.textContent = String(i + 1);
      txt.className = "txt";
      txt.textContent = texto;
      div.appendChild(num);
      div.appendChild(txt);
      panel.appendChild(div);
    });
  }

  function pintarTabla(e) {
    var tabla = document.getElementById("tabla-candidatas");
    var probadas = [];
    tabla.innerHTML = "";
    var cab = document.createElement("tr");
    ["a", "b", "c", "a * a + b * b", "c * c", "¿pasa?"].forEach(function (t) {
      var th = document.createElement("th");
      th.textContent = t;
      cab.appendChild(th);
    });
    tabla.appendChild(cab);

    e.pasos.slice(0, e.k).forEach(function (p) {
      if (p.linea === 6) { probadas.push(p); }
    });

    probadas.slice(-FILAS).forEach(function (p) {
      var pasa = p.izq === p.der;
      var tr = document.createElement("tr");
      [String(p.a), String(p.b), String(p.c), String(p.izq), String(p.der),
        pasa ? "sí" : "no"].forEach(function (celda, i) {
        var td = document.createElement("td");
        td.textContent = celda;
        if (i === 5) { td.className = pasa ? "si" : "no"; }
        tr.appendChild(td);
      });
      tabla.appendChild(tr);
    });

    if (probadas.length === 0) {
      var vacia = document.createElement("tr");
      var td = document.createElement("td");
      td.colSpan = 6;
      td.className = "pend";
      td.textContent = "aquí aparece una fila por cada candidata que se prueba";
      vacia.appendChild(td);
      tabla.appendChild(vacia);
    }
    document.getElementById("probadas").textContent = String(probadas.length);
  }

  function alPintar(e) {
    var halladas = e.actual === null ? [] : e.actual.halladas;
    document.getElementById("halladas").textContent =
      halladas.length === 0 ? "ninguna todavía" : halladas.join(", ");
    pintarTabla(e);
    if (e.terminado && e.k > 0) {
      document.getElementById("caja-impreso").style.display = "block";
      document.getElementById("impreso").textContent = IMPRESO[e.params];
      document.getElementById("carta-busqueda").classList.remove("bloqueado");
    } else {
      document.getElementById("caja-impreso").style.display = "none";
    }
  }

  function construirPresets() {
    var caja = document.getElementById("presets");
    VALORES_N.forEach(function (n, i) {
      var b = document.createElement("button");
      b.textContent = "ternasPFor(" + n + ")";
      b.id = "preset-" + i;
      b.addEventListener("click", function () {
        document.querySelectorAll("#presets button").forEach(function (o) {
          o.className = "";
        });
        b.className = "primario";
        nActual = n;
        document.getElementById("carta-busqueda").classList.add("bloqueado");
        Motor.reiniciar(n);
      });
      caja.appendChild(b);
    });
  }

  /* -- Las preguntas sobre las piezas -- */

  function fila(item) {
    var caja = document.createElement("div");
    var expr = document.createElement("div");
    var preg = document.createElement("div");
    var ops = document.createElement("div");
    var ver = document.createElement("div");
    caja.className = "item";
    expr.className = "expr";
    expr.textContent = item.expr;
    preg.className = "pregunta";
    preg.textContent = item.pregunta;
    ops.className = "opciones";
    ver.className = "veredicto";
    caja.appendChild(expr);
    caja.appendChild(preg);
    caja.appendChild(ops);
    caja.appendChild(ver);
    return { caja: caja, ops: ops, ver: ver };
  }

  function marcar() {
    document.getElementById("marcador-piezas").textContent =
      "resueltas: " + resueltas + " de " + PIEZAS.length +
      "    ·    opciones falladas: " + fallados;
    if (resueltas === PIEZAS.length) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  function construirPiezas() {
    var caja = document.getElementById("piezas");
    PIEZAS.forEach(function (item, indice) {
      var f = fila(item);
      rotar(item.opciones, indice + 1).forEach(function (o) {
        var b = document.createElement("button");
        b.textContent = o.txt;
        if (o.larga) { b.className = "larga"; }
        b.addEventListener("click", function () {
          if (o.correcta) {
            b.className = b.className.replace(" errada", "") + " acertada";
            Array.prototype.forEach.call(f.ops.children, function (x) {
              x.disabled = true;
            });
            f.ver.className = "veredicto bien";
            f.ver.textContent = item.cierre;
            resueltas = resueltas + 1;
          } else {
            b.className = b.className + " errada";
            b.disabled = true;
            f.ver.className = "veredicto mal";
            f.ver.textContent = o.fallo;
            fallados = fallados + 1;
          }
          marcar();
        });
        f.ops.appendChild(b);
      });
      caja.appendChild(f.caja);
    });
  }

  construirPresets();
  document.getElementById("preset-0").className = "primario";
  construirHOF();
  construirPiezas();
  marcar();

  Motor.iniciar({
    codigo: CODIGO,
    paramsIniciales: nActual,
    simular: simular,
    chips: [
      { campo: "c", rotulo: "c" },
      { campo: "b", rotulo: "b" },
      { campo: "a", rotulo: "a" },
      { campo: "izq", rotulo: "a * a + b * b" },
      { campo: "der", rotulo: "c * c" },
      { campo: "candidatas", rotulo: "candidatas", clase: "cuenta" },
      { campo: "ternas", rotulo: "ternas", clase: "cuenta" }
    ],
    alPintar: alPintar
  });

  /* La prediccion se hace sobre n = 5, que es el caso que la corrida mide:
     35 candidatas probadas. */
  Motor.prediccionNumerica(function (valor) {
    var r = resumen(5);
    if (valor === r.candidatas) {
      return {
        ok: true,
        msg: "Correcto: " + r.candidatas + " candidatas con n = 5, y sobrevive "
          + r.halladas.join(", ") + "."
      };
    }
    if (valor === 125) {
      return {
        ok: false,
        msg: "No. 125 es 5 por 5 por 5, las combinaciones que saldrían si los "
          + "tres generadores recorrieran 1 to 5 completo. Encadenados son "
          + r.candidatas + "."
      };
    }
    return {
      ok: false,
      msg: "No. Son " + r.candidatas + ". Cuente las parejas (b, c) con "
        + "b <= c, y para cada una los valores de a hasta b."
    };
  });
})();
