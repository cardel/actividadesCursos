/* vector: las trece lineas de 02_vector.scala. Primero se predice lo que
   imprime cada una y despues se decide entre opciones sobre los dos agregados
   y sobre las operaciones que ya venian de List. Los valores que la pagina da
   por correctos salieron de correr ese archivo con Scala 2.13.11, la version
   del proyecto del curso. */
(function () {

  var CODIGO = [
    { num: 1, txt: "val nums = Vector(10, 12, 6, 8)" },
    { num: 2, txt: "val personas = Vector(\"Juan\", \"Pedro\", \"Mariana\")" },
    { num: 3, txt: "println(nums)" },
    { num: 4, txt: "println(personas)" },
    { num: null, txt: "" },
    { num: 5, txt: "val v = Vector(2, 3, 4)" },
    { num: 6, txt: "println(1 +: v)" },
    { num: 7, txt: "println(v :+ 5)" },
    { num: null, txt: "" },
    { num: 8, txt: "println(v.head)" },
    { num: 9, txt: "println(v.tail)" },
    { num: 10, txt: "println(v.isEmpty)" },
    { num: 11, txt: "println(v.map(_ * 10))" },
    { num: 12, txt: "println(v.filter(_ > 2))" }
  ];

  /* ── Seccion 2: predecir lo que imprime cada linea ──────────────── */

  var DEMOS = [
    { expr: "nums", sale: "Vector(10, 12, 6, 8)", pista: "Vector(...)" },
    { expr: "personas", sale: "Vector(Juan, Pedro, Mariana)", pista: "Vector(...)" },
    { expr: "1 +: v", sale: "Vector(1, 2, 3, 4)", pista: "Vector(...)" },
    { expr: "v :+ 5", sale: "Vector(2, 3, 4, 5)", pista: "Vector(...)" },
    { expr: "v.head", sale: "2", pista: "un número" },
    { expr: "v.tail", sale: "Vector(3, 4)", pista: "Vector(...)" },
    { expr: "v.isEmpty", sale: "false", pista: "true o false" },
    { expr: "v.map(_ * 10)", sale: "Vector(20, 30, 40)", pista: "Vector(...)" },
    { expr: "v.filter(_ > 2)", sale: "Vector(3, 4)", pista: "Vector(...)" }
  ];

  var PISTAS = [
    {
      "vector(6,8,10,12)": "Un vector conserva el orden en que se escribieron " +
        "los elementos. Nada los acomoda de menor a mayor.",
      general: "Los cuatro números del literal, en su orden, dentro de Vector(...)."
    },
    {
      "vector(\"juan\",\"pedro\",\"mariana\")": "Al imprimirse, los textos salen " +
        "sin comillas: las comillas pertenecen a la expresión que escribe el " +
        "valor, no al valor.",
      general: "Los tres nombres, en el orden en que se escribieron."
    },
    {
      "vector(2,3,4,1)": "En +: los dos puntos quedan del lado de la " +
        "colección, que está a la derecha, así que el 1 entra por el frente.",
      "vector(1,2,3,4,5)": "Esta línea solo agrega el 1. El 5 entra en la " +
        "línea siguiente, y sobre otro vector.",
      general: "Cuatro elementos, con el 1 en uno de los dos extremos."
    },
    {
      "vector(5,2,3,4)": "En :+ los dos puntos quedan a la izquierda, pegados " +
        "a v, de modo que el 5 se agrega al final.",
      "vector(1,2,3,4,5)": "La línea anterior no modificó v: sigue siendo " +
        "Vector(2, 3, 4). Agregar devuelve otro vector y deja el original igual.",
      general: "Cuatro elementos, con el 5 en uno de los dos extremos."
    },
    {
      "vector(2)": "head devuelve el elemento, no un vector de un elemento.",
      "vector(3,4)": "Vector(3, 4) es v.tail. head entrega el primero.",
      general: "Un solo número, el primer elemento de v."
    },
    {
      "3": "tail devuelve todo lo que queda al quitar la cabeza, que aquí son " +
        "dos elementos. El que entrega un solo valor es head, y da 2.",
      "4": "4 es el último elemento de v. tail es el vector sin la cabeza.",
      "vector(2,3)": "tail quita el primero, no el último.",
      general: "Un vector con los elementos de v menos el primero."
    },
    {
      "true": "v es Vector(2, 3, 4), con tres elementos dentro.",
      "0": "isEmpty responde true o false, no un tamaño.",
      general: "La línea responde con un valor de verdad: true o false."
    },
    {
      "vector(2,3,4,20,30,40)": "La salida tiene un elemento por cada " +
        "elemento de la entrada, tres en total. Los resultados no se agregan a v.",
      "list(20,30,40)": "Los números son esos, el tipo no: map sobre un " +
        "Vector devuelve un Vector.",
      general: "Tres números, cada uno diez veces el que ocupa su lugar en v."
    },
    {
      "vector(2,3,4)": "La comparación es estricta: el 2 no cumple _ > 2.",
      "vector(false,true,true)": "Vector(false, true, true) es la condición " +
        "evaluada en cada elemento. filter no reemplaza los elementos por el resultado de la " +
        "comparación: la usa para elegir y devuelve los números.",
      "vector(20,30,40)": "Vector(20, 30, 40) es v.map(_ * 10). filter no " +
        "transforma los elementos, decide cuáles pasan.",
      general: "Los elementos de v que son mayores que 2."
    }
  ];

  /* Quita espacios y baja a minuscula, de modo que vector(3,4) cuente igual
     que Vector(3, 4). Las comillas no se quitan: distinguir
     Vector(Juan, ...) de Vector("Juan", ...) es parte de lo que se pregunta. */
  function normalizar(entrada) {
    var s = String(entrada === null || entrada === undefined ? "" : entrada)
      .replace(/\s+/g, "").toLowerCase();
    if (s === "") { return null; }
    if (s === "verdadero") { return "true"; }
    if (s === "falso") { return "false"; }
    return s;
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

  /* ── Seccion 3: los dos agregados ───────────────────────────────── */

  var AGREGADOS = [
    {
      expr: "1 +: v",
      pregunta: "v es Vector(2, 3, 4) y el 1 entra por un extremo.",
      cierre: "Los dos puntos de +: quedan del lado de v, que está a la derecha, y el 1 ocupa el primer puesto.",
      opciones: [
        { txt: "Vector(1, 2, 3, 4)", correcta: true },
        { txt: "Vector(2, 3, 4, 1)", fallo: "Así quedaría agregando al final, con v :+ 1. En +: la colección está a la derecha y el elemento entra por el frente." },
        { txt: "no compila: a un Vector se le agrega con ::", fallo: ":: es de List. Un Vector agrega con +: al inicio y con :+ al final, y las dos líneas del demo compilan.", larga: true }
      ]
    },
    {
      expr: "v, después de las dos líneas que agregan",
      pregunta: "Se imprimió 1 +: v y después v :+ 5. ¿Qué tiene v ahora?",
      cierre: "Ni +: ni :+ modifican v: cada uno construye un vector nuevo. Las líneas siguientes lo confirman, porque v.head da 2 y v.tail da Vector(3, 4).",
      opciones: [
        { txt: "Vector(2, 3, 4)", correcta: true },
        { txt: "Vector(2, 3, 4, 5)", fallo: "Vector(2, 3, 4, 5) es el valor que imprime v :+ 5, un vector distinto del que quedó en v." },
        { txt: "Vector(1, 2, 3, 4, 5)", fallo: "v tendría esos cinco elementos si las dos líneas lo hubieran ido modificando. Agregar devuelve otro vector y deja el original igual." }
      ]
    },
    {
      expr: "agregar al final",
      pregunta: "¿Cuál de las tres agrega el 5 al final de v?",
      cierre: "En :+ los dos puntos quedan a la izquierda, pegados a v, y el elemento entra por el otro extremo. Los dos puntos apuntan hacia la colección.",
      opciones: [
        { txt: "v :+ 5", correcta: true },
        { txt: "5 +: v", fallo: "5 +: v agrega al inicio: los dos puntos quedan del lado de v y el elemento ocupa el primer puesto, como en 1 +: v, que da Vector(1, 2, 3, 4)." },
        { txt: "5 :: v", fallo: ":: es el constructor de List, no de Vector. Para un Vector las dos operaciones son +: y :+." }
      ]
    }
  ];

  /* ── Seccion 4: lo que ya venia de List ─────────────────────────── */

  var CONOCIDAS = [
    {
      expr: "List contra Vector",
      pregunta: "¿Cuál de estas tres no se usa con un Vector?",
      cierre: "Las demás son las mismas: head da 2, tail da Vector(3, 4), isEmpty da false, map da Vector(20, 30, 40) y filter da Vector(3, 4).",
      opciones: [
        { txt: "::", correcta: true },
        { txt: "map", fallo: "map funciona igual: v.map(_ * 10) da Vector(20, 30, 40), con un elemento por cada uno de los tres." },
        { txt: "head", fallo: "head funciona igual: v.head da 2, y v.tail da Vector(3, 4)." }
      ]
    },
    {
      expr: "v.head y v.tail",
      pregunta: "Las dos miran la cabeza del vector. ¿En qué se diferencian?",
      cierre: "Una entrega el elemento y la otra el vector que queda, igual que sobre una lista.",
      opciones: [
        { txt: "head da 2 y tail da Vector(3, 4)", correcta: true, larga: true },
        { txt: "head da Vector(2) y tail da Vector(3, 4): las dos devuelven vectores", fallo: "head entrega el elemento suelto. La línea del demo imprime 2, no Vector(2).", larga: true },
        { txt: "head da 2 y tail da 3, el elemento que sigue", fallo: "tail devuelve todo lo que queda al quitar el primero, que aquí son dos elementos: Vector(3, 4).", larga: true }
      ]
    },
    {
      expr: "dos líneas con el mismo valor",
      pregunta: "Dos de las doce líneas imprimen exactamente lo mismo. ¿Cuáles?",
      cierre: "Las dos dan Vector(3, 4). El único elemento de v que no pasa el filtro es justamente el primero, así que quitar la cabeza y filtrar por mayores que 2 llegan al mismo sitio por caminos distintos.",
      opciones: [
        { txt: "v.tail y v.filter(_ > 2)", correcta: true, larga: true },
        { txt: "v.head y v.isEmpty", fallo: "head da 2 y isEmpty da false: un número y un valor de verdad.", larga: true },
        { txt: "1 +: v y v :+ 5", fallo: "Las dos dan un vector de cuatro elementos, Vector(1, 2, 3, 4) y Vector(2, 3, 4, 5), y no son el mismo: cada una agrega por un extremo distinto.", larga: true }
      ]
    }
  ];

  var API = {
    CODIGO: CODIGO, DEMOS: DEMOS, PISTAS: PISTAS,
    AGREGADOS: AGREGADOS, CONOCIDAS: CONOCIDAS,
    normalizar: normalizar, esperado: esperado, revisar: revisar
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ════════════════ la pagina ════════════════ */

  var resueltos = { agregados: 0, conocidas: 0 };
  var fallados = 0;
  var prediccionesListas = false;

  function construirCodigo() {
    var panel = document.getElementById("panel-codigo");
    CODIGO.forEach(function (l, i) {
      var div = document.createElement("div");
      var num = document.createElement("span");
      var txt = document.createElement("span");
      div.className = "linea";
      div.id = "linea-" + i;
      num.className = "num";
      num.textContent = l.num === null ? "" : String(l.num);
      txt.className = "txt";
      txt.textContent = l.txt;
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
      v.textContent = "Faltan " + vacias + " de las nueve.";
    } else if (malas === 0) {
      v.className = "veredicto bien";
      v.textContent = "Las nueve. En la columna de la derecha queda lo que " +
        "imprime cada línea.";
      prediccionesListas = true;
      marcar();
    } else {
      v.className = "veredicto mal";
      v.textContent = malas + " en rojo, con la nota al lado de cada una.";
    }
  }

  function marcar() {
    document.getElementById("marcador-agregados").textContent =
      "resueltas: " + resueltos.agregados + " de " + AGREGADOS.length;
    document.getElementById("marcador-conocidas").textContent =
      "resueltas: " + resueltos.conocidas + " de " + CONOCIDAS.length +
      "    ·    opciones falladas en toda la página: " + fallados;
    if (prediccionesListas && resueltos.agregados === AGREGADOS.length
        && resueltos.conocidas === CONOCIDAS.length) {
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
  construirOpciones("agregados", AGREGADOS, "agregados");
  construirOpciones("conocidas", CONOCIDAS, "conocidas");
  marcar();
})();
