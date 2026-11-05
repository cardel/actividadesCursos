/* mapas: el tipo Map como asociacion de llaves a valores y como funcion que se
   aplica a una llave. Las siete lineas de la tabla y los dos casos de la llave
   ausente salieron de correr el codigo con Scala 2.13.11: Map(USA ->
   Washington, COLOMBIA -> Bogota), Bogota, Some(Bogota), None, Desconocida,
   Map(USA -> Washington, COLOMBIA -> Bogota, PERU -> Lima), 2, la excepcion
   java.util.NoSuchElementException: key not found: US y el HashMap(e -> 5, a ->
   1, b -> 2, c -> 3, d -> 4) del mapa de cinco entradas, que es el dato que
   sostiene la ultima seccion: con dos entradas el mismo tipo se imprime como
   Map y en el orden escrito, y al crecer cambian el nombre y el orden. */
(function () {

  var CODIGO = [
    "val capital = Map(\"USA\" -> \"Washington\", \"COLOMBIA\" -> \"Bogota\")",
    "",
    "println(capital)",
    "println(capital(\"COLOMBIA\"))",
    "println(capital.get(\"COLOMBIA\"))",
    "println(capital.get(\"US\"))",
    "println(capital.withDefaultValue(\"Desconocida\")(\"US\"))",
    "println(capital + (\"PERU\" -> \"Lima\"))",
    "println(capital.size)"
  ];

  var CAPITAL = "Map(USA -> Washington, COLOMBIA -> Bogota)";
  var CON_PERU = "Map(USA -> Washington, COLOMBIA -> Bogota, PERU -> Lima)";
  var CINCO = "HashMap(e -> 5, a -> 1, b -> 2, c -> 3, d -> 4)";
  var EXCEPCION = "java.util.NoSuchElementException: key not found: US";

  /* ── Seccion 2: predecir las siete lineas que imprimen ──────────── */

  var DEMOS = [
    { expr: "capital", sale: CAPITAL, modo: "coleccion", pista: "Map(...)" },
    { expr: "capital(\"COLOMBIA\")", sale: "Bogota", modo: "coleccion", pista: "un valor" },
    { expr: "capital.get(\"COLOMBIA\")", sale: "Some(Bogota)", modo: "coleccion", pista: "un Option" },
    { expr: "capital.get(\"US\")", sale: "None", modo: "coleccion", pista: "un Option" },
    { expr: "capital.withDefaultValue(\"Desconocida\")(\"US\")", sale: "Desconocida", modo: "coleccion", pista: "un valor" },
    { expr: "capital + (\"PERU\" -> \"Lima\")", sale: CON_PERU, modo: "coleccion", pista: "Map(...)" },
    { expr: "capital.size", sale: "2", modo: "numero", pista: "un número" }
  ];

  var PISTAS = [
    {
      "map(colombia->bogota,usa->washington)": "Lo corrido imprimió las dos " +
        "entradas en el orden en que se escribieron, con USA primero. Un mapa " +
        "no promete orden, y la última sección muestra uno donde el orden " +
        "escrito no es el que sale.",
      "map(usa,washington,colombia,bogota)": "Cada entrada se imprime con la " +
        "flecha entre la llave y su valor, no como cuatro cosas sueltas.",
      general: "Las dos entradas dentro de Map(...), cada una con la flecha " +
        "entre la llave y el valor."
    },
    {
      "washington": "Washington es el valor de la llave USA. La llave que se " +
        "consulta en esta línea es COLOMBIA.",
      "some(bogota)": "Some(Bogota) es lo que devuelve capital.get(\"COLOMBIA\"). " +
        "Aplicar el mapa a una llave entrega el valor sin envolverlo.",
      general: "El valor asociado a COLOMBIA, sin nada alrededor."
    },
    {
      "bogota": "Bogota es lo que da capital(\"COLOMBIA\"). get no entrega el " +
        "valor desnudo: lo entrega envuelto en el caso de Option que trae algo.",
      "option(bogota)": "Option es el tipo, y lo que se imprime es el caso " +
        "concreto. El caso que trae un valor se escribe Some.",
      general: "El valor envuelto en el caso de Option que trae algo."
    },
    {
      "null": "Un mapa no entrega null por una llave que no está: get devuelve " +
        "el caso de Option que no trae valor.",
      "error": "La excepción la lanza capital(\"US\"), que aplica el mapa a la " +
        "llave. get no la lanza, y por eso se usa cuando la llave puede faltar.",
      "excepcion": "La excepción la lanza capital(\"US\"), que aplica el mapa a " +
        "la llave. get no la lanza, y por eso se usa cuando la llave puede faltar.",
      general: "El caso de Option que no trae valor."
    },
    {
      "none": "withDefaultValue no devuelve un Option. Lo que hace es dar un " +
        "valor para las llaves que no están, y la línea aplica el mapa a US.",
      "some(desconocida)": "La línea aplica el mapa a la llave, no llama a get, " +
        "de modo que sale el valor y no un Option.",
      "null": "El mapa recibió un valor para las llaves ausentes, y eso es lo " +
        "que entrega al aplicarlo a US.",
      general: "El valor por omisión que recibió el mapa."
    },
    {
      "map(peru->lima)": "El + no reemplaza el mapa por la entrada nueva: " +
        "devuelve un mapa con lo que había y además esa entrada.",
      "map(peru->lima,usa->washington,colombia->bogota)": "Lo corrido imprimió " +
        "la entrada nueva después de las dos que ya estaban. Un mapa no promete " +
        "orden, y con estas tres entradas ese fue el que salió.",
      general: "Las tres entradas dentro de Map(...)."
    },
    {
      "3": "El + no modificó capital: devolvió otro mapa con la entrada " +
        "agregada y dejó el original con lo que tenía.",
      "4": "size cuenta entradas, y cada pareja de llave y valor es una " +
        "entrada, no dos.",
      general: "Cuántas entradas tiene capital."
    }
  ];

  /* Dos formas de comparar. Lo que imprime este archivo se lee con holgura:
     los espacios, las mayusculas y las comillas que el estudiante escriba de
     mas no cambian la respuesta, porque lo que se pregunta es la entrada, el
     valor o el caso de Option, no como se teclea. */
  function normalizar(entrada, modo) {
    var s = String(entrada === null || entrada === undefined ? "" : entrada);
    s = s.replace(/\s+/g, "").replace(/"/g, "");
    if (modo === "numero") { return s === "" ? null : s; }
    s = s.toLowerCase();
    return s === "" ? null : s;
  }

  function esperado(i) {
    return normalizar(DEMOS[i].sale, DEMOS[i].modo);
  }

  function revisar(i, entrada) {
    var dado = normalizar(entrada, DEMOS[i].modo);
    if (dado === null) { return { estado: "vacio", msg: "" }; }
    if (dado === esperado(i)) { return { estado: "bien", msg: "" }; }
    var tabla = PISTAS[i] || {};
    return { estado: "mal", msg: tabla[dado] || tabla.general || "" };
  }

  /* ── Seccion 3: la llave que no esta ────────────────────────────── */

  var AUSENTE = [
    {
      expr: "println(capital(\"US\"))",
      pregunta: "La llave US no está en el mapa. ¿Qué pasa al aplicarle el mapa?",
      cierre: "Corta la ejecución con " + EXCEPCION + ". Aplicar el mapa a una llave se escribe igual que aplicar una función, y como función está definida solo para las llaves que tiene.",
      opciones: [
        { txt: "lanza " + EXCEPCION, correcta: true, larga: true },
        { txt: "devuelve None", fallo: "None es lo que devuelve capital.get(\"US\"). Aplicar el mapa a una llave que no está no devuelve nada: lanza " + EXCEPCION + ".", larga: true },
        { txt: "devuelve una cadena vacía", fallo: "No hay valor para las llaves ausentes salvo que se pida con withDefaultValue. Sin eso, la línea lanza " + EXCEPCION + ".", larga: true }
      ]
    },
    {
      expr: "capital.get(\"COLOMBIA\") da Some(Bogota) y capital.get(\"US\") da None",
      pregunta: "¿Qué gana el código que consulta con get en lugar de aplicar el mapa?",
      cierre: "Que la llave ausente sea un valor y no una interrupción: None se puede guardar, comparar y pasar a otra función, mientras la excepción corta la ejecución.",
      opciones: [
        { txt: "que la llave ausente también sea un valor con el que se puede seguir", correcta: true, larga: true },
        { txt: "que la búsqueda de la llave sea más rápida", fallo: "Las dos buscan la llave igual. La diferencia está en qué entregan cuando no la encuentran: get devuelve None y aplicar el mapa lanza " + EXCEPCION + ".", larga: true },
        { txt: "que el valor salga sin envolver", fallo: "Es al revés: capital(\"COLOMBIA\") da Bogota y capital.get(\"COLOMBIA\") da Some(Bogota). Lo que se gana con get es que la ausencia tenga su propio valor, None.", larga: true }
      ]
    },
    {
      expr: "capital.withDefaultValue(\"Desconocida\")(\"US\") da Desconocida",
      pregunta: "¿Qué le hizo withDefaultValue al mapa?",
      cierre: "Entregó otro mapa, con las mismas entradas y un valor para cualquier llave que no esté. Las entradas de capital siguen siendo dos: capital.size da 2.",
      opciones: [
        { txt: "le dio un valor para las llaves que no están, sin agregar ninguna entrada", correcta: true, larga: true },
        { txt: "agregó la entrada US -> Desconocida", fallo: "No se agregó ninguna entrada, y capital.size sigue dando 2. El valor por omisión responde por cualquier llave ausente, no por una en particular.", larga: true },
        { txt: "cambió capital para que dejara de lanzar la excepción", fallo: "capital no cambió. withDefaultValue devuelve otro mapa con ese valor por omisión, y capital(\"US\") sigue lanzando " + EXCEPCION + ".", larga: true }
      ]
    }
  ];

  /* ── Seccion 4: cinco entradas ──────────────────────────────────── */

  var ORDEN = [
    {
      expr: "println(Map(\"a\" -> 1, \"b\" -> 2, \"c\" -> 3, \"d\" -> 4, \"e\" -> 5))",
      pregunta: "Cinco entradas, escritas en orden alfabético. ¿Qué imprime?",
      cierre: CINCO + ". Con dos entradas el mismo tipo se imprime como Map y en el orden escrito; al crecer la colección cambia la implementación que la sostiene, y con ella el nombre que sale y el lugar de cada entrada.",
      opciones: [
        { txt: CINCO, correcta: true, larga: true },
        { txt: "Map(a -> 1, b -> 2, c -> 3, d -> 4, e -> 5)", fallo: "Eso es lo que se escribió. Lo corrido imprimió " + CINCO + ": cambia el nombre y la entrada de la e sale primero.", larga: true },
        { txt: "Map(e -> 5, a -> 1, b -> 2, c -> 3, d -> 4)", fallo: "El orden de las entradas es ese, pero el nombre impreso no es Map: con cinco entradas sale HashMap.", larga: true }
      ]
    },
    {
      expr: CAPITAL + "   ·   " + CINCO,
      pregunta: "Los dos son mapas escritos igual, uno con dos entradas y otro con cinco. ¿Con qué se puede contar?",
      cierre: "Con la asociación. Cada llave lleva a su valor y eso no cambia; el orden en que salen las entradas y el nombre de la implementación son lo que se vio al imprimir, no algo sobre lo cual escribir código.",
      opciones: [
        { txt: "con que cada llave lleva a su valor, no con el orden ni con el nombre impreso", correcta: true, larga: true },
        { txt: "con que las entradas salen en el orden en que se escribieron, salvo que sean muchas", fallo: "Un mapa no promete orden en ningún tamaño. Que con dos entradas salieran en el orden escrito es lo que ocurrió al correrlo, y con cinco ya no ocurre.", larga: true },
        { txt: "con que un mapa pequeño es un Map y uno grande es un tipo distinto", fallo: "El tipo es el mismo y acepta las mismas operaciones. HashMap es la implementación que sostiene al mapa cuando crece, y lo que se imprime es su nombre.", larga: true }
      ]
    },
    {
      expr: "\"USA\" -> \"Washington\"",
      pregunta: "¿Qué es esa flecha?",
      cierre: "La forma de escribir la pareja de llave y valor que el mapa guarda. Map recibe tantas parejas como entradas tenga, y agregar una a un mapa que ya existe devuelve otro mapa: capital + (\"PERU\" -> \"Lima\") imprime " + CON_PERU + " y capital.size sigue dando 2.",
      opciones: [
        { txt: "la forma de escribir la pareja de llave y valor que el mapa guarda", correcta: true, larga: true },
        { txt: "una asignación, que mete Washington en la llave USA", fallo: "No hay asignación ni nada que se modifique. La flecha arma una pareja, el mapa se construye con las parejas que recibe, y agregar una entrada devuelve otro mapa.", larga: true },
        { txt: "el tipo del valor que acepta esa llave", fallo: "La flecha va entre dos valores concretos, la llave y el valor asociado. Lo que queda escrito es una pareja, no un tipo.", larga: true }
      ]
    }
  ];

  var API = {
    CODIGO: CODIGO, CAPITAL: CAPITAL, CON_PERU: CON_PERU, CINCO: CINCO,
    EXCEPCION: EXCEPCION, DEMOS: DEMOS, PISTAS: PISTAS,
    AUSENTE: AUSENTE, ORDEN: ORDEN,
    normalizar: normalizar, esperado: esperado, revisar: revisar
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ════════════════ la pagina ════════════════ */

  var resueltos = { ausente: 0, orden: 0 };
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
      v.textContent = "Faltan " + vacias + " de las siete.";
    } else if (malas === 0) {
      v.className = "veredicto bien";
      v.textContent = "Las siete. Falta la línea que no imprime un valor: " +
        "aplicar el mapa a una llave que no está.";
      prediccionesListas = true;
      marcar();
    } else {
      v.className = "veredicto mal";
      v.textContent = malas + " en rojo, con la nota al lado de cada una.";
    }
  }

  function marcar() {
    document.getElementById("marcador-ausente").textContent =
      "resueltas: " + resueltos.ausente + " de " + AUSENTE.length;
    document.getElementById("marcador-orden").textContent =
      "resueltas: " + resueltos.orden + " de " + ORDEN.length +
      "    ·    opciones falladas en toda la página: " + fallados;
    if (prediccionesListas && resueltos.ausente === AUSENTE.length
        && resueltos.orden === ORDEN.length) {
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
  construirOpciones("ausente", AUSENTE, "ausente");
  construirOpciones("orden", ORDEN, "orden");
  marcar();
})();
