/* consultas: cuatro consultas sobre la misma lista de libros, escritas con
   expresiones for. El molde no cambia, generador, filtro y yield, y de una
   consulta a la siguiente solo cambia la condicion, hasta que aparece una que
   pide dos generadores y produce repetidos. Todo valor que la pagina da por
   correcto salio de correr el codigo con Scala 2.13.11: los tres titulos que
   contienen Program, los dos de un solo autor, los dos de Odersky, la lista de
   dos elementos List(Odersky, Martin, Odersky, Martin), la de un elemento con
   distinct y el Set(Odersky, Martin) con los generadores sobre libros.toSet.
   El distractor que sostiene la seccion 4 es leer esa salida como si tuviera
   cuatro elementos, porque cada autor se escribe apellido, nombre y lleva una
   coma adentro, la misma con que la lista separa sus elementos. */
(function () {

  var CODIGO_BASE = [
    "case class Libro(titulo: String, autores: List[String])",
    "",
    "val libros: List[Libro] = List(",
    "  Libro(\"Structure and Interpretation of Computer Programs\",",
    "        List(\"Abelson, Harald\", \"Sussman, Gerald J.\")),",
    "  Libro(\"Programming in Scala\",",
    "        List(\"Odersky, Martin\", \"Spoon, Lex\", \"Venners, Bill\")),",
    "  Libro(\"Learning Concurrent Programming in Scala\",",
    "        List(\"Prokopec, Aleksandar\")),",
    "  Libro(\"Working Hard to Keep it Simple\",",
    "        List(\"Odersky, Martin\")))"
  ];

  var CODIGO_PROGRAM = [
    "val conProgram =",
    "  for (l <- libros if l.titulo.contains(\"Program\"))",
    "  yield l.titulo"
  ];

  var CODIGO_UNO = [
    "val deUnAutor =",
    "  for (l <- libros if l.autores.length == 1)",
    "  yield l.titulo"
  ];

  var CODIGO_ODERSKY = [
    "val deOdersky =",
    "  for {",
    "    l <- libros",
    "    a <- l.autores",
    "    if a.startsWith(\"Odersky,\")",
    "  } yield l.titulo"
  ];

  var CODIGO_REPETIDOS = [
    "val enDosLibros =",
    "  for {",
    "    l1 <- libros",
    "    l2 <- libros",
    "    if l1 != l2",
    "    a1 <- l1.autores",
    "    a2 <- l2.autores",
    "    if a1 == a2",
    "  } yield a1"
  ];

  var SICP = "Structure and Interpretation of Computer Programs";
  var PIS = "Programming in Scala";
  var LCPS = "Learning Concurrent Programming in Scala";
  var WHKS = "Working Hard to Keep it Simple";

  var SALE_PROGRAM = "List(" + SICP + ", " + PIS + ", " + LCPS + ")";
  var SALE_UNO = "List(" + LCPS + ", " + WHKS + ")";
  var SALE_ODERSKY = "List(" + PIS + ", " + WHKS + ")";
  var SALE_REPETIDOS = "List(Odersky, Martin, Odersky, Martin)";
  var SALE_DISTINCT = "List(Odersky, Martin)";
  var SALE_SET = "Set(Odersky, Martin)";

  /* ── Seccion 2: un generador, un filtro, un yield ───────────────── */

  var MOLDE = [
    {
      expr: "for (l <- libros if l.titulo.contains(\"Program\")) yield l.titulo",
      pregunta: "El generador recorre los cuatro libros y el filtro mira el título. ¿Qué devuelve?",
      cierre: "Tres de los cuatro títulos llevan Program adentro: " + SALE_PROGRAM + ". El generador dice qué se recorre, el if dice qué pasa y el yield dice qué se guarda de cada libro que pasó.",
      opciones: [
        { txt: SALE_PROGRAM, correcta: true, larga: true },
        { txt: "List(" + PIS + ")", fallo: "contains busca la palabra en cualquier posición del título, no solo al comienzo. " + SICP + " la lleva al final y " + LCPS + " en la mitad, así que los tres pasan el filtro.", larga: true },
        { txt: "los tres libros completos, cada uno con su lista de autores", fallo: "El yield dice qué entra al resultado, y aquí dice l.titulo: entran los títulos. Para quedarse con los libros completos el yield sería l.", larga: true }
      ]
    },
    {
      expr: "for (l <- libros if l.autores.length == 1) yield l.titulo",
      pregunta: "El mismo molde con otra condición. ¿Qué devuelve?",
      cierre: "Dos libros tienen un solo autor: " + SALE_UNO + ".",
      opciones: [
        { txt: "List(1, 1)", fallo: "El largo de la lista de autores se usa en la condición; lo que entra al resultado lo dice el yield, que es l.titulo.", larga: true }
      ,
        { txt: SALE_UNO, correcta: true, larga: true },
        { txt: SALE_ODERSKY, fallo: "La condición mira cuántos autores tiene el libro, no quién los escribió. " + PIS + " tiene tres autores y queda fuera, mientras " + LCPS + " tiene uno y entra.", larga: true }]
    },
    {
      expr: "de la primera consulta a la segunda",
      pregunta: "¿Qué hubo que cambiar para pasar de una a la otra?",
      cierre: "Solo la condición. El generador, el yield y la forma de la expresión son los mismos, y eso es lo que permite escribir una consulta nueva cambiando una línea.",
      opciones: [
        { txt: "la condición y el yield, porque una pregunta por el título y la otra por los autores", fallo: "Las dos devuelven títulos, de modo que el yield es el mismo l.titulo. La segunda consulta usa los autores para decidir, dentro de la condición.", larga: true },
        { txt: "el generador, porque la segunda consulta necesita recorrer los autores", fallo: "l.autores.length se calcula sobre el libro que ya trae el generador, sin recorrer la lista de autores uno por uno. Recorrerla hace falta cuando la condición se pregunta por un autor en particular.", larga: true }
      ,
        { txt: "solo la condición del if", correcta: true, larga: true }]
    }
  ];

  /* ── Seccion 3: el segundo generador ────────────────────────────── */

  var ODERSKY = [
    {
      expr: "for { l <- libros; a <- l.autores if a.startsWith(\"Odersky,\") } yield l.titulo",
      pregunta: "¿Qué devuelve?",
      cierre: SALE_ODERSKY + ". La coma pegada en startsWith(\"Odersky,\") cierra el apellido, así que compara el apellido completo y no un prefijo suyo.",
      opciones: [
        { txt: SALE_ODERSKY, correcta: true, larga: true },
        { txt: SALE_REPETIDOS, fallo: "Ese sería el resultado con yield a, que guarda el autor que cumplió la condición. El yield de esta consulta dice l.titulo.", larga: true },
        { txt: "List(" + PIS + ")", fallo: "La condición se evalúa sobre cada autor de cada libro, y el único autor de " + WHKS + " es Odersky, Martin, de modo que ese título también entra.", larga: true }
      ]
    },
    {
      expr: "l <- libros; a <- l.autores",
      pregunta: "¿Por qué esta consulta necesita dos generadores y las dos anteriores no?",
      cierre: "El primer generador da un libro y el segundo recorre los autores de ese libro, así que la condición se evalúa autor por autor. Las dos consultas anteriores deciden con algo que el libro entrega de una, el título y el largo de su lista de autores.",
      opciones: [
        { txt: "porque el resultado tiene que traer el libro y el autor", fallo: "El yield devuelve l.titulo, una sola cosa por resultado. El segundo generador sirve para llegar a cada autor, no para armar lo que se devuelve.", larga: true }
      ,
        { txt: "porque la condición se pregunta por un autor, y los autores de un libro son una lista", correcta: true, larga: true },
        { txt: "porque hay dos libros de Odersky y cada generador trae uno", fallo: "Cuántos resultados salgan no decide cuántos generadores se escriben. El segundo generador está porque los autores vienen en una lista y hay que entrar en ella para preguntar por uno.", larga: true }]
    }
  ];

  /* ── Seccion 4: la salida que se lee mal ────────────────────────── */

  var REPETIDOS = [
    {
      expr: SALE_REPETIDOS,
      pregunta: "Esto es lo que imprimió la consulta de los autores que aparecen en al menos dos libros. ¿Cuántos elementos tiene esa lista?",
      cierre: "Dos, y los dos son la cadena Odersky, Martin. Las comas de la salida son de dos clases: las que separan los elementos de la lista y la que cada autor lleva adentro, porque se escribe apellido, nombre. Cuatro trozos separados por coma, dos elementos.",
      opciones: [
        { txt: "4", fallo: "Cada autor está escrito como apellido, nombre, y esa coma es parte de la cadena. La lista separa sus elementos con el mismo signo, de modo que dos elementos dejan cuatro trozos a la vista." },
        { txt: "1", fallo: "La cadena Odersky, Martin está dos veces. Imprimir no junta los repetidos: el elemento aparece tantas veces como la consulta lo produjo." }
      ,
        { txt: "2", correcta: true }]
    },
    {
      expr: "l1 <- libros; l2 <- libros; if l1 != l2",
      pregunta: "Los dos generadores recorren la misma lista. ¿De dónde sale la segunda aparición del mismo autor?",
      cierre: "El par de libros se forma dos veces, una con cada uno en el papel de l1, y las dos veces la condición a1 == a2 se cumple y el yield entrega el autor. La condición l1 != l2 descarta comparar un libro consigo mismo, no el par al revés.",
      opciones: [
        { txt: "del mismo par de libros recorrido en el otro orden", correcta: true, larga: true },
        { txt: "de que el autor tiene dos libros, y cada libro aporta su nombre al resultado", fallo: "Los libros no aportan por separado: a1 == a2 compara los autores de dos libros, así que cada resultado sale de un par. Ese par se forma dos veces, intercambiando cuál es l1 y cuál es l2.", larga: true },
        { txt: "de que los dos libros tienen tres y un autor, y el recorrido pasa por todos", fallo: "Los demás autores no cumplen a1 == a2 con ningún otro libro, así que no entran. Lo que duplica el único que cumple es que su par de libros se recorre en los dos órdenes.", larga: true }
      ]
    },
    {
      expr: "la misma consulta con .distinct al final",
      pregunta: "¿Qué devuelve?",
      cierre: SALE_DISTINCT + ", con un solo elemento. distinct quita las copias de lo ya construido: la consulta sigue formando el par en los dos órdenes y produciendo las dos apariciones, y el descarte ocurre al final.",
      opciones: [
        { txt: SALE_SET, fallo: "distinct devuelve una lista sin elementos repetidos, no un conjunto: lo que imprime empieza con List. El conjunto llega al convertir la colección." }
      ,
        { txt: SALE_DISTINCT, correcta: true },
        { txt: SALE_REPETIDOS, fallo: "distinct deja una sola copia de cada elemento, y los dos elementos de esa lista son la misma cadena." }]
    }
  ];

  /* ── Seccion 5: los generadores sobre un conjunto ───────────────── */

  var SIN_REPETIR = [
    {
      expr: "la misma consulta con libros.toSet en los dos generadores",
      pregunta: "¿Qué devuelve?",
      cierre: SALE_SET + ". El primer generador fija el tipo del resultado, y un conjunto no admite repetidos: la copia de más no llega a entrar.",
      opciones: [
        { txt: SALE_DISTINCT, fallo: "El resultado se imprime como Set. El tipo de lo que devuelve una expresión for lo fija el primer generador, y ese recorre libros.toSet." },
        { txt: "Set(Odersky, Martin, Odersky, Martin)", fallo: "Un conjunto no guarda elementos repetidos. El recorrido produce las dos apariciones igual, y al entrar al resultado quedan en una." }
      ,
        { txt: SALE_SET, correcta: true }]
    },
    {
      expr: SALE_REPETIDOS + "   ·   " + SALE_DISTINCT + "   ·   " + SALE_SET,
      pregunta: "Las tres salidas de la misma consulta. ¿En qué se diferencian las tres maneras?",
      cierre: "La primera entrega lo que el recorrido produjo, dos elementos iguales. distinct los recorre después y deja uno. El conjunto no deja entrar la copia. El recorrido es el mismo en los tres casos y lo que cambia es dónde se descarta.",
      opciones: [
        { txt: "la primera no descarta nada, distinct descarta después y el conjunto no deja entrar la copia", correcta: true, larga: true },
        { txt: "las tres hacen lo mismo y solo cambia el nombre de la colección que se imprime", fallo: "La primera salida tiene dos elementos y las otras dos tienen uno, de modo que el resultado tampoco es el mismo. Y el camino difiere: distinct revisa lo ya construido mientras el conjunto rechaza la copia al guardarla.", larga: true },
        { txt: "el conjunto evita que el par de libros se forme dos veces", fallo: "Los dos generadores forman el par en los dos órdenes en los tres casos, y la condición se cumple dos veces. El conjunto actúa al guardar el resultado, no al recorrer.", larga: true }
      ]
    }
  ];

  var API = {
    CODIGO_BASE: CODIGO_BASE, CODIGO_PROGRAM: CODIGO_PROGRAM,
    CODIGO_UNO: CODIGO_UNO, CODIGO_ODERSKY: CODIGO_ODERSKY,
    CODIGO_REPETIDOS: CODIGO_REPETIDOS,
    SALE_PROGRAM: SALE_PROGRAM, SALE_UNO: SALE_UNO,
    SALE_ODERSKY: SALE_ODERSKY, SALE_REPETIDOS: SALE_REPETIDOS,
    SALE_DISTINCT: SALE_DISTINCT, SALE_SET: SALE_SET,
    MOLDE: MOLDE, ODERSKY: ODERSKY, REPETIDOS: REPETIDOS,
    SIN_REPETIR: SIN_REPETIR
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ════════════════ la pagina ════════════════ */

  var SECCIONES = [
    { llave: "molde", caja: "molde", marcador: "marcador-molde", items: MOLDE },
    { llave: "odersky", caja: "odersky", marcador: "marcador-odersky", items: ODERSKY },
    { llave: "repetidos", caja: "repetidos", marcador: "marcador-repetidos", items: REPETIDOS },
    { llave: "sinRepetir", caja: "sin-repetir", marcador: "marcador-sin-repetir", items: SIN_REPETIR }
  ];

  var resueltos = { molde: 0, odersky: 0, repetidos: 0, sinRepetir: 0 };
  var fallados = 0;

  function marcar() {
    var listo = true;
    SECCIONES.forEach(function (s) {
      document.getElementById(s.marcador).textContent =
        "resueltas: " + resueltos[s.llave] + " de " + s.items.length;
      if (resueltos[s.llave] < s.items.length) { listo = false; }
    });
    document.getElementById("marcador-sin-repetir").textContent =
      "resueltas: " + resueltos.sinRepetir + " de " + SIN_REPETIR.length +
      "    ·    opciones falladas en toda la página: " + fallados;
    if (listo) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  function construirCodigo(id, lineas) {
    var panel = document.getElementById(id);
    lineas.forEach(function (texto, i) {
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

  construirCodigo("codigo-base", CODIGO_BASE);
  construirCodigo("codigo-program", CODIGO_PROGRAM);
  construirCodigo("codigo-uno", CODIGO_UNO);
  construirCodigo("codigo-odersky", CODIGO_ODERSKY);
  construirCodigo("codigo-repetidos", CODIGO_REPETIDOS);
  SECCIONES.forEach(function (s) {
    construirOpciones(s.caja, s.items, s.llave);
  });
  marcar();
})();
