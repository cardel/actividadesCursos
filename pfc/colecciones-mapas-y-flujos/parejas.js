/* parejas: un Map es tambien un Iterable de parejas, y de ahi que acepte
   toList, map, filter y expresiones for con la misma escritura de cualquier
   coleccion. Los cinco valores que la pagina da por correctos salieron de
   correr el codigo con Scala 2.13.11: List((USA,Washington),
   (COLOMBIA,Bogota)), Map(Washington -> USA, Bogota -> COLOMBIA), Set(USA,
   COLOMBIA), Iterable(Washington, Bogota) y HashMap(s -> 2, m -> 2, l -> 1).
   Los dos puntos de confusion que la actividad trabaja son que keys y values
   se imprimen con nombres distintos, Set y Iterable, y que map sobre un mapa
   vuelve a dar un mapa cuando la funcion entrega parejas. */
(function () {

  var CODIGO = [
    "val capital = Map(\"USA\" -> \"Washington\", \"COLOMBIA\" -> \"Bogota\")",
    "",
    "println(capital.toList)",
    "println(capital.map { case (k, v) => (v, k) })",
    "println(capital.keys)",
    "println(capital.values)",
    "",
    "val palabras = List(\"sol\", \"sal\", \"mar\", \"luna\", \"mes\")",
    "println(palabras.groupBy(_.head).map { case (c, ps) => (c, ps.length) })"
  ];

  var A_LISTA = "List((USA,Washington), (COLOMBIA,Bogota))";
  var INVERTIDO = "Map(Washington -> USA, Bogota -> COLOMBIA)";
  var LLAVES = "Set(USA, COLOMBIA)";
  var VALORES = "Iterable(Washington, Bogota)";
  var CUENTAS = "HashMap(s -> 2, m -> 2, l -> 1)";
  var CAPITAL = "Map(USA -> Washington, COLOMBIA -> Bogota)";

  /* ── Seccion 2: predecir las cuatro lineas del mapa ─────────────── */

  var DEMOS = [
    { expr: "capital.toList", sale: A_LISTA, modo: "coleccion", pista: "List(...)" },
    { expr: "capital.map { case (k, v) => (v, k) }", sale: INVERTIDO, modo: "coleccion", pista: "lo que sale" },
    { expr: "capital.keys", sale: LLAVES, modo: "coleccion", pista: "lo que sale" },
    { expr: "capital.values", sale: VALORES, modo: "coleccion", pista: "lo que sale" }
  ];

  var PISTAS = [
    {
      "list(usa->washington,colombia->bogota)": "toList no conserva la flecha. " +
        "Cada entrada se escribe como una pareja, con los dos componentes " +
        "entre paréntesis y separados por coma.",
      "map(usa->washington,colombia->bogota)": "Eso es capital impreso tal " +
        "cual. toList devuelve una lista, y cada elemento de esa lista es la " +
        "pareja de una entrada.",
      "list(usa,washington,colombia,bogota)": "Los cuatro textos no quedan " +
        "sueltos en la lista: cada entrada aporta un elemento, y ese elemento " +
        "es la pareja de su llave con su valor.",
      general: "Una lista de dos elementos, cada uno la pareja de una entrada."
    },
    {
      "list((washington,usa),(bogota,colombia))": "La función devuelve una " +
        "pareja por cada entrada, y con parejas el resultado se vuelve a armar " +
        "como mapa: lo que sale empieza con Map.",
      "map(usa->washington,colombia->bogota)": "La función entrega (v, k), con " +
        "el valor primero, de modo que cada entrada queda al revés.",
      "map(washington->colombia,bogota->usa)": "Cada pareja se invierte dentro " +
        "de su propia entrada. Washington estaba con USA y sigue con USA.",
      general: "Las dos entradas invertidas, en la colección que las sostiene."
    },
    {
      "iterable(usa,colombia)": "Iterable es lo que imprime capital.values. " +
        "Las llaves de un mapa no se repiten, y al pedirlas sale la colección " +
        "que tampoco admite repetidos.",
      "list(usa,colombia)": "Lo corrido imprimió otra colección. Dos llaves " +
        "iguales no pueden convivir en un mapa, y eso se refleja en lo que sale.",
      "set(washington,bogota)": "Washington y Bogota son los valores. Las " +
        "llaves de este mapa son los dos países.",
      general: "Las dos llaves, con el nombre de la colección que las trae."
    },
    {
      "set(washington,bogota)": "Set es lo que imprime capital.keys. Dos " +
        "entradas distintas pueden compartir el valor, así que los valores no " +
        "llegan como conjunto.",
      "list(washington,bogota)": "Lo corrido imprimió otra colección, la más " +
        "general de todas: la que solo promete que se puede recorrer.",
      "iterable(usa,colombia)": "USA y COLOMBIA son las llaves. Los valores de " +
        "este mapa son las dos capitales.",
      general: "Los dos valores, con el nombre de la colección que los trae."
    }
  ];

  /* Una sola forma de comparar: los espacios, las mayusculas y las comillas
     que se escriban de mas no cambian la respuesta, porque lo que se pregunta
     es que sale y con que nombre, no como se teclea. */
  function normalizar(entrada) {
    var s = String(entrada === null || entrada === undefined ? "" : entrada);
    s = s.replace(/\s+/g, "").replace(/"/g, "").toLowerCase();
    return s === "" ? null : s;
  }

  function esperado(i) {
    return normalizar(DEMOS[i].sale);
  }

  function revisar(i, entrada) {
    var dado = normalizar(entrada);
    if (dado === null) { return { estado: "vacio", msg: "" }; }
    if (dado === esperado(i)) { return { estado: "bien", msg: "" }; }
    var tabla = PISTAS[i] || {};
    return { estado: "mal", msg: tabla[dado] || tabla.general || "" };
  }

  /* ── Seccion 3: cada elemento es una pareja ─────────────────────── */

  var PAREJA = [
    {
      expr: "capital.map { case (k, v) => (v, k) }",
      pregunta: "¿Qué recibe la función que va dentro de map?",
      cierre: "Un elemento por vez, y en un mapa cada elemento es la pareja de una entrada. El case (k, v) desarma esa pareja y le pone nombre a sus dos partes.",
      opciones: [
        { txt: "un solo elemento, que es la pareja de llave y valor", correcta: true, larga: true },
        { txt: "dos elementos, la llave y el valor", fallo: "map entrega un elemento por vez. Lo que llega es una sola cosa, la pareja, y escribir case (k, v) es lo que permite nombrar sus dos partes; una función de dos parámetros no es lo que map va a llamar.", larga: true },
        { txt: "el mapa completo, para que la función decida qué hacer con él", fallo: "map recorre y aplica la función a cada elemento, de modo que el resultado tiene tantas entradas como el mapa de partida. La función nunca ve el mapa entero.", larga: true }
      ]
    },
    {
      expr: "capital.map { case (k, v) => (v, k) }   imprime   " + INVERTIDO,
      pregunta: "¿Por qué el resultado es un mapa y no una lista de parejas?",
      cierre: "Porque la función devuelve una pareja por cada entrada, y con parejas hay con qué armar entradas. La escritura es la misma de cualquier map; la forma de lo que devuelve la función es lo que decide en qué colección cae el resultado.",
      opciones: [
        { txt: "porque la función devuelve una pareja por cada entrada", correcta: true, larga: true },
        { txt: "porque map sobre un mapa siempre devuelve un mapa", fallo: "Lo que decide es la forma de lo que devuelve la función. Si entregara una sola cosa por entrada, en lugar de una pareja, no habría con qué formar entradas y el resultado no podría ser un mapa.", larga: true },
        { txt: "porque las llaves y los valores son del mismo tipo, y se pueden intercambiar", fallo: "Que los dos sean textos permite invertir las parejas, pero no es lo que hace del resultado un mapa. Eso lo decide que la función entregue parejas.", larga: true }
      ]
    },
    {
      expr: "capital.keys da " + LLAVES + " y capital.values da " + VALORES,
      pregunta: "Las dos consultas son simétricas y se imprimen con nombres distintos. ¿Por qué?",
      cierre: "Dos llaves iguales no pueden convivir en un mapa, así que las llaves forman un conjunto. Dos entradas distintas sí pueden compartir el valor, de modo que los valores llegan en la colección más general, la que solo promete que se puede recorrer.",
      opciones: [
        { txt: "porque las llaves de un mapa no se repiten y los valores sí pueden repetirse", correcta: true, larga: true },
        { txt: "porque keys ordena las llaves y values deja los valores como estaban", fallo: "Ninguna de las dos promete orden. La diferencia está en los repetidos: el mapa impide dos llaves iguales y no impide dos valores iguales.", larga: true },
        { txt: "porque values no es una colección, sino los valores sueltos", fallo: "Lo que sale al pedir los valores es una colección, y se imprime con su nombre, " + VALORES + ". Lo que no es es un conjunto.", larga: true }
      ]
    }
  ];

  /* ── Seccion 4: agrupar y contar ────────────────────────────────── */

  var AGRUPAR = [
    {
      expr: "List(\"sol\", \"sal\", \"mar\", \"luna\", \"mes\").groupBy(_.head)",
      pregunta: "La función que recibe groupBy toma la primera letra de cada palabra. ¿Qué forma tiene el resultado?",
      cierre: "Un mapa, con cada inicial como llave y como valor las palabras que empiezan con ella. La función dice cómo se calcula la llave de cada elemento, y los elementos que comparten llave quedan juntos.",
      opciones: [
        { txt: "un mapa de cada inicial a la lista de palabras que empiezan con ella", correcta: true, larga: true },
        { txt: "una lista con las cinco palabras ordenadas por su inicial", fallo: "groupBy no ordena, reparte. Lo que entrega es un mapa: la inicial es la llave y las palabras que la comparten quedan juntas en el valor.", larga: true },
        { txt: "un mapa de cada inicial a cuántas palabras empiezan con ella", fallo: "La cuenta es el paso siguiente, y sale de aplicar length a cada grupo. groupBy entrega las palabras agrupadas, no cuántas son.", larga: true }
      ]
    },
    {
      expr: "palabras.groupBy(_.head).map { case (c, ps) => (c, ps.length) }",
      pregunta: "Las cinco palabras son sol, sal, mar, luna y mes. ¿Qué imprime?",
      cierre: CUENTAS + ". El map recorre el mapa agrupado como recorrería cualquier colección de parejas, y cambia cada grupo por su largo. Tres entradas: sol y sal con s, mar y mes con m, luna con l.",
      opciones: [
        { txt: CUENTAS, correcta: true, larga: true },
        { txt: "HashMap(s -> 3, m -> 1, l -> 1)", fallo: "mes empieza con m, no con s. Los grupos quedan sol y sal con s, mar y mes con m, luna con l, de modo que lo impreso es " + CUENTAS + ".", larga: true },
        { txt: "Map(s -> 2, m -> 2, l -> 1)", fallo: "Las tres cuentas son esas, y el nombre impreso es HashMap. Lo que sale al imprimir incluye la implementación que sostiene el mapa.", larga: true },
        { txt: "HashMap(l -> 1, m -> 2, s -> 2)", fallo: "Las tres entradas y sus cuentas son esas, y el orden no es el que salió: lo corrido imprimió " + CUENTAS + ". Un mapa no promete orden, de modo que el de la salida se lee, no se deduce.", larga: true }
      ]
    },
    {
      expr: CAPITAL + "   ·   " + CUENTAS,
      pregunta: "Los dos son mapas y se imprimen con nombres distintos. ¿Qué se puede afirmar de los dos?",
      cierre: "Que cada llave lleva a un valor y que los dos se recorren como colecciones de parejas. El nombre impreso es la implementación que los sostiene, y el orden de las entradas no es parte de lo que un mapa promete.",
      opciones: [
        { txt: "que cada llave lleva a un valor, y nada sobre el orden ni sobre el nombre impreso", correcta: true, larga: true },
        { txt: "que el segundo no es un mapa, porque se imprime con otro nombre", fallo: "Los dos aceptan las mismas operaciones: aplicar una llave, get, keys, values, map. HashMap es la implementación que sostiene al segundo.", larga: true },
        { txt: "que el segundo perdió el orden al pasar por groupBy y map", fallo: "El orden no se pierde en el camino, porque el mapa nunca lo prometió. Lo que los dos garantizan es la asociación entre cada llave y su valor.", larga: true }
      ]
    }
  ];

  var API = {
    CODIGO: CODIGO, A_LISTA: A_LISTA, INVERTIDO: INVERTIDO, LLAVES: LLAVES,
    VALORES: VALORES, CUENTAS: CUENTAS, CAPITAL: CAPITAL,
    DEMOS: DEMOS, PISTAS: PISTAS, PAREJA: PAREJA, AGRUPAR: AGRUPAR,
    normalizar: normalizar, esperado: esperado, revisar: revisar
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ════════════════ la pagina ════════════════ */

  var resueltos = { pareja: 0, agrupar: 0 };
  var fallados = 0;
  var prediccionesListas = false;

  function construirCodigo() {
    var panel = document.getElementById("panel-codigo");
    CODIGO.forEach(function (texto, i) {
      var div = document.createElement("div");
      var num = document.createElement("span");
      var txt = document.createElement("span");
      div.className = "linea";
      num.className = "num";
      num.textContent = texto === "" ? "" : String(i + 1);
      txt.className = "txt";
      txt.textContent = texto;
      div.appendChild(num);
      div.appendChild(txt);
      panel.appendChild(div);
    });
  }

  function construirTabla() {
    var cuerpo = document.getElementById("cuerpo-predicciones");
    cuerpo.innerHTML = "";
    DEMOS.forEach(function (d, i) {
      var tr = document.createElement("tr");

      var expr = document.createElement("td");
      expr.className = "expr-celda";
      expr.textContent = "println(" + d.expr + ")";
      tr.appendChild(expr);

      var celda = document.createElement("td");
      var inp = document.createElement("input");
      inp.type = "text";
      inp.id = "pred-" + i;
      inp.placeholder = d.pista;
      celda.appendChild(inp);
      tr.appendChild(celda);

      var real = document.createElement("td");
      real.className = "real";
      real.id = "real-" + i;
      tr.appendChild(real);

      var nota = document.createElement("td");
      nota.className = "pista";
      nota.id = "pista-" + i;
      tr.appendChild(nota);

      cuerpo.appendChild(tr);
    });
  }

  function comprobar() {
    var malas = 0;
    var vacias = 0;
    DEMOS.forEach(function (d, i) {
      var inp = document.getElementById("pred-" + i);
      var nota = document.getElementById("pista-" + i);
      var real = document.getElementById("real-" + i);
      var r = revisar(i, inp.value);
      if (r.estado === "vacio") {
        inp.className = "";
        nota.textContent = "";
        real.textContent = "";
        vacias = vacias + 1;
      } else if (r.estado === "bien") {
        inp.className = "bien";
        nota.textContent = "";
        real.textContent = d.sale;
      } else {
        inp.className = "mal";
        nota.textContent = r.msg;
        real.textContent = "";
        malas = malas + 1;
      }
    });
    var v = document.getElementById("veredicto");
    if (vacias > 0) {
      v.className = "veredicto mal";
      v.textContent = "Faltan " + vacias + " de las cuatro.";
    } else if (malas === 0) {
      v.className = "veredicto bien";
      v.textContent = "Las cuatro. Dos de ellas se imprimen con nombres " +
        "distintos, y esa diferencia es la de más abajo.";
      prediccionesListas = true;
      marcar();
    } else {
      v.className = "veredicto mal";
      v.textContent = malas + " en rojo, con la nota al lado de cada una.";
    }
  }

  function marcar() {
    document.getElementById("marcador-pareja").textContent =
      "resueltas: " + resueltos.pareja + " de " + PAREJA.length;
    document.getElementById("marcador-agrupar").textContent =
      "resueltas: " + resueltos.agrupar + " de " + AGRUPAR.length +
      "    ·    opciones falladas en toda la página: " + fallados;
    if (prediccionesListas && resueltos.pareja === PAREJA.length
        && resueltos.agrupar === AGRUPAR.length) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

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

  function bloquear(ops) {
    Array.prototype.forEach.call(ops.children, function (b) { b.disabled = true; });
  }

  function acertar(f, item, boton, llave) {
    boton.className = boton.className.replace(" errada", "") + " acertada";
    bloquear(f.ops);
    f.ver.className = "veredicto bien";
    f.ver.textContent = item.cierre;
    resueltos[llave] = resueltos[llave] + 1;
    marcar();
  }

  function errar(f, boton, texto) {
    boton.className = boton.className + " errada";
    boton.disabled = true;
    f.ver.className = "veredicto mal";
    f.ver.textContent = texto;
    fallados = fallados + 1;
    marcar();
  }

  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  function construirOpciones(cajaId, items, llave) {
    var caja = document.getElementById(cajaId);
    items.forEach(function (item, indice) {
      var f = fila(item);
      rotar(item.opciones, indice + 1).forEach(function (o) {
        var b = document.createElement("button");
        b.textContent = o.txt;
        if (o.larga) { b.className = "larga"; }
        b.addEventListener("click", function () {
          if (o.correcta) {
            acertar(f, item, b, llave);
          } else {
            errar(f, b, o.fallo);
          }
        });
        f.ops.appendChild(b);
      });
      caja.appendChild(f.caja);
    });
  }

  construirCodigo();
  construirTabla();
  document.getElementById("btn-comprobar").addEventListener("click", comprobar);
  construirOpciones("pareja", PAREJA, "pareja");
  construirOpciones("agrupar", AGRUPAR, "agrupar");
  marcar();
})();
