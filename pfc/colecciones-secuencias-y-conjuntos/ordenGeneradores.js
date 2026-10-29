/* ordenGeneradores: el orden de iteracion cuando dos o tres generadores van
   anidados. Las expresiones salen de la seccion de expresiones for y se
   corrieron con Scala 2.13.11: los vectores de la version directa y de la
   invertida, la comparacion de esos dos vectores (false) y la de sus toSet
   (true), las seis parejas del generador dependiente contra las nueve del
   independiente, el otro triangulo con j <- i to 3, las ocho ternas de tres
   generadores y el mensaje con que el compilador rechaza el dependiente
   invertido. La traza reproduce la version directa repartida en lineas, con
   un paso por cada vez que se evalua una de ellas. Los distractores son las
   confusiones que ocurren de verdad: creer que invertir los generadores da el
   mismo vector, creer que el orden de las componentes lo fija el orden de los
   generadores y no el yield, y creer que un generador dependiente se puede
   invertir como uno independiente. */
(function () {

  var CODIGO = [
    { num: null, txt: "val pares =" },
    { num: null, txt: "  for {" },
    { num: 3, txt: "    x <- 1 to 3", bloque: 1 },
    { num: 4, txt: "    y <- 1 to 2", bloque: 2 },
    { num: 5, txt: "  } yield (x, y)", bloque: 3 }
  ];

  var PARAMS = { externo: [1, 2, 3], interno: [1, 2] };

  var DIRECTO = "Vector((1,1), (1,2), (2,1), (2,2), (3,1), (3,2))";
  var INVERTIDO = "Vector((1,1), (2,1), (3,1), (1,2), (2,2), (3,2))";
  var TRIANGULO = "Vector((1,1), (2,1), (2,2), (3,1), (3,2), (3,3))";
  var TRIANGULO_ALTO = "Vector((1,1), (1,2), (1,3), (2,2), (2,3), (3,3))";
  var TERNAS = "Vector((1,1,1), (1,1,2), (1,2,1), (1,2,2), (2,1,1), (2,1,2), (2,2,1), (2,2,2))";

  function textoPareja(x, y) { return "(" + x + "," + y + ")"; }

  function textoVector(elementos) {
    return "Vector(" + elementos.join(", ") + ")";
  }

  /* Un paso por cada linea que se evalua, en el orden en que corren. La linea
     3 le da un valor a x, la 4 uno a y y la 5 arma la pareja y la pone en el
     resultado. */
  function simular(p) {
    var pasos = [];
    var hechas = [];

    function anotar(linea, extra) {
      var paso = {
        linea: linea, fase: null, x: null, y: null,
        pareja: null, acumulado: null, cuantas: null
      };
      Object.keys(extra).forEach(function (k) { paso[k] = extra[k]; });
      pasos.push(paso);
    }

    p.externo.forEach(function (x) {
      anotar(3, {
        fase: "el generador de afuera le da un valor a x",
        x: x, acumulado: textoVector(hechas), cuantas: hechas.length
      });
      p.interno.forEach(function (y) {
        anotar(4, {
          fase: "el generador de adentro le da un valor a y",
          x: x, y: y, acumulado: textoVector(hechas), cuantas: hechas.length
        });
        hechas.push(textoPareja(x, y));
        anotar(5, {
          fase: "el yield arma la pareja y la pone en el resultado",
          x: x, y: y, pareja: textoPareja(x, y),
          acumulado: textoVector(hechas), cuantas: hechas.length
        });
      });
    });

    return pasos;
  }

  /* ── Seccion 1: en que orden salen las parejas ──────────────────── */

  var ORDEN = [
    {
      expr: "for { x <- 1 to 3; y <- 1 to 2 } yield (x, y)",
      pregunta: "¿Con qué dos parejas abre el resultado?",
      cierre: "El generador de la derecha es el que varía más rápido: con x en 1, y recorre 1 to 2 completo antes de que x pase a 2. El resultado es " + DIRECTO + ".",
      opciones: [
        { txt: "(1,1) y después (1,2)", correcta: true },
        { txt: "(1,1) y después (2,1)", fallo: "Ese orden sale cuando el que varía más rápido es x, y x está en el generador de afuera. El de adentro se agota entero por cada valor del de afuera, así que después de (1,1) viene (1,2)." },
        { txt: "(1,1) y después (2,2)", fallo: "Los dos generadores no avanzan a la vez, como haría zip emparejando dos colecciones. Cada valor de x se combina con todos los de y, y la segunda pareja todavía tiene x = 1." }
      ]
    },
    {
      expr: "for { x <- 1 to 3; y <- 1 to 2 } yield (x, y)",
      pregunta: "¿Y con cuál cierra?",
      cierre: "El último valor de x es 3 y el último de y es 2. El yield escribe (x, y) en ese orden, de modo que el resultado termina en (3,2).",
      opciones: [
        { txt: "(3,2)", correcta: true },
        { txt: "(2,3)", fallo: "Las componentes están al revés. La primera sale de x, que recorre 1 to 3, y la segunda de y, que recorre 1 to 2; con y nunca llega un 3 a la segunda posición." },
        { txt: "(3,3)", fallo: "y recorre 1 to 2 y no toma el valor 3. Las parejas con x = 3 son (3,1) y (3,2)." }
      ]
    }
  ];

  /* ── Seccion 2: invertir dos generadores independientes ─────────── */

  var INVERSION = [
    {
      expr: "for { y <- 1 to 2; x <- 1 to 3 } yield (x, y)",
      pregunta: "Los mismos dos generadores en el otro orden, y el yield sigue escribiendo (x, y).",
      cierre: "Ahora el que varía más rápido es x, porque quedó a la derecha: salen las tres parejas con y = 1 y después las tres con y = 2.",
      opciones: [
        { txt: INVERTIDO, correcta: true, larga: true },
        { txt: "el mismo vector de la versión anterior, porque los dos generadores producen las mismas parejas", fallo: "Las parejas son las mismas seis, y de ahí sale la trampa. Lo que cambia es el orden en que salen: las dos versiones se compararon con == y la comparación dio false.", larga: true },
        { txt: "las mismas parejas con las componentes al revés, porque ahora y es el primer generador", fallo: "El orden de las componentes lo fija el yield, que sigue escribiendo (x, y). Mover un generador cambia en qué orden se recorren los valores, no cómo se arma la pareja.", larga: true }
      ]
    },
    {
      expr: "pares == invertidas     y     pares.toSet == invertidas.toSet",
      pregunta: "Las dos comparaciones se corrieron sobre las dos versiones.",
      cierre: "Un Vector guarda el orden, y el orden es justo lo que cambió: ahí la comparación da false. Un conjunto no guarda orden, y ahí las dos versiones coinciden, porque invertir los generadores no agrega ni quita parejas.",
      opciones: [
        { txt: "la primera da false y la segunda true", correcta: true, larga: true },
        { txt: "las dos dan true", fallo: "La de los toSet dio true, pero la de los vectores dio false. Un Vector conserva el orden en que entraron las parejas, y las dos versiones las producen en orden distinto.", larga: true },
        { txt: "las dos dan false", fallo: "La de los vectores dio false. La de los conjuntos dio true: las seis parejas son las mismas y un conjunto no guarda el orden en que entraron.", larga: true }
      ]
    }
  ];

  /* ── Seccion 3: el generador que depende del anterior ───────────── */

  var DEPENDIENTE = [
    {
      expr: "for { i <- 1 to 3; j <- 1 to i } yield (i, j)",
      pregunta: "El extremo de arriba del segundo generador es i, el valor del primero.",
      cierre: "Con i = 1 el generador de adentro produce un solo valor, con i = 2 produce dos y con i = 3 produce tres: seis parejas, todas con j menor o igual que i.",
      opciones: [
        { txt: TRIANGULO, correcta: true, larga: true },
        { txt: "las nueve parejas que salen con j <- 1 to 3", fallo: "Ese es el for con los dos generadores independientes, y su largo es 9. Aquí el extremo de arriba es i, de modo que con i = 1 el generador de adentro produce una sola pareja.", larga: true },
        { txt: TRIANGULO_ALTO, fallo: "Ese es el resultado de j <- i to 3, el otro triángulo: ahí lo que depende de i es el extremo de abajo, y con i = 1 salen (1,1), (1,2) y (1,3).", larga: true }
      ]
    },
    {
      expr: "for { j <- 1 to i; i <- 1 to 3 } yield (i, j)",
      pregunta: "El dependiente con los dos generadores invertidos.",
      cierre: "No compila. El generador de arriba se evalúa primero y en 1 to i no hay todavía ningún i, así que el compilador se detiene en not found: value i. Un generador puede usar los nombres que traen los de arriba, nunca los de abajo.",
      opciones: [
        { txt: "no compila", correcta: true },
        { txt: "compila y devuelve las mismas seis parejas en otro orden", fallo: "Eso vale para dos generadores independientes, donde cada uno se entiende solo. Aquí el extremo del segundo es el i del primero: al invertirlos, el nombre i se usa antes de que exista y el compilador lo rechaza.", larga: true },
        { txt: "compila y devuelve nueve parejas", fallo: "Nueve son las parejas de dos generadores independientes de 1 to 3. Esta expresión no llega a correr: 1 to i queda escrito arriba de la línea donde i se define.", larga: true }
      ]
    }
  ];

  /* ── Seccion 4: tres generadores ────────────────────────────────── */

  var TRES = [
    {
      expr: "for { a <- 1 to 2; b <- 1 to 2; c <- 1 to 2 } yield (a, b, c)",
      pregunta: "Tres generadores anidados, cada uno de dos valores.",
      cierre: "El resultado es " + TERNAS + ": el de la derecha varía más rápido y el de la izquierda más despacio, igual que con dos.",
      opciones: [
        { txt: "c cambia en cada terna, y a solo cuando b y c se agotaron", correcta: true, larga: true },
        { txt: "a cambia en cada terna, porque es el primero que se escribe", fallo: "El primero que se escribe es el de afuera, y el de afuera es el que espera: por cada valor de a se recorren b y c completos. Las cuatro primeras ternas tienen a = 1.", larga: true },
        { txt: "los tres cambian a la vez, de modo que salen (1,1,1) y (2,2,2)", fallo: "Avanzar a la vez sería emparejar los tres generadores, como hace zip con dos colecciones. Los anidados combinan cada valor con todos los del siguiente, y por eso el resultado trae ocho ternas y no dos.", larga: true }
      ]
    },
    {
      expr: "la cantidad de ternas",
      pregunta: "¿Cuántas trae ese resultado?",
      cierre: "Ocho. Dos valores de a, por dos de b, por dos de c.",
      opciones: [
        { txt: "ocho", correcta: true },
        { txt: "seis", fallo: "Seis es lo que daría sumar los tres recorridos. Cada valor de a recorre b completo y cada valor de b recorre c completo, de modo que las cantidades se multiplican." },
        { txt: "tres", fallo: "Tres es la cantidad de generadores. Cada uno aporta dos valores, y las combinaciones son el producto de esas tres cantidades." }
      ]
    }
  ];

  var API = {
    CODIGO: CODIGO, PARAMS: PARAMS, simular: simular,
    DIRECTO: DIRECTO, INVERTIDO: INVERTIDO, TRIANGULO: TRIANGULO,
    TRIANGULO_ALTO: TRIANGULO_ALTO, TERNAS: TERNAS,
    ORDEN: ORDEN, INVERSION: INVERSION, DEPENDIENTE: DEPENDIENTE, TRES: TRES
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ════════════════ la pagina ════════════════ */

  var SECCIONES = [
    { llave: "orden", caja: "orden", marcador: "marcador-orden", items: ORDEN },
    { llave: "inversion", caja: "inversion", marcador: "marcador-inversion", items: INVERSION },
    { llave: "dependiente", caja: "dependiente", marcador: "marcador-dependiente", items: DEPENDIENTE },
    { llave: "tres", caja: "tres", marcador: "marcador-tres", items: TRES }
  ];

  var resueltos = { orden: 0, inversion: 0, dependiente: 0, tres: 0 };
  var fallados = 0;
  var trazaCompleta = false;

  function revisarCierre() {
    var listo = trazaCompleta;
    SECCIONES.forEach(function (s) {
      if (resueltos[s.llave] < s.items.length) { listo = false; }
    });
    if (listo) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  function marcar() {
    SECCIONES.forEach(function (s) {
      document.getElementById(s.marcador).textContent =
        "resueltas: " + resueltos[s.llave] + " de " + s.items.length;
    });
    document.getElementById("marcador-tres").textContent =
      "resueltas: " + resueltos.tres + " de " + TRES.length +
      "    ·    opciones falladas en toda la página: " + fallados;
    revisarCierre();
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

  /* La tabla de parejas: una fila cada vez que el yield arma una, en el orden
     en que salieron. */
  function pintarTabla(e) {
    var tabla = document.getElementById("tabla-parejas");
    var fila = 0;
    tabla.innerHTML = "";
    var cab = document.createElement("tr");
    ["puesto", "x", "y", "pareja"].forEach(function (t) {
      var th = document.createElement("th");
      th.textContent = t;
      cab.appendChild(th);
    });
    tabla.appendChild(cab);

    e.pasos.slice(0, e.k).forEach(function (p) {
      if (p.linea !== 5) { return; }
      fila = fila + 1;
      var tr = document.createElement("tr");
      [String(fila), String(p.x), String(p.y), p.pareja].forEach(function (c, i) {
        var td = document.createElement("td");
        td.textContent = c;
        if (i === 3) { td.className = "expr-celda"; }
        tr.appendChild(td);
      });
      tabla.appendChild(tr);
    });

    if (fila === 0) {
      var vacia = document.createElement("tr");
      var td = document.createElement("td");
      td.colSpan = 4;
      td.className = "pend";
      td.textContent = "la primera fila aparece cuando el yield arma la primera pareja";
      vacia.appendChild(td);
      tabla.appendChild(vacia);
    }
  }

  function alPintar(e) {
    var acumulado = "–";
    e.pasos.slice(0, e.k).forEach(function (p) {
      if (p.acumulado !== null) { acumulado = p.acumulado; }
    });
    document.getElementById("caja-pares").textContent = acumulado;
    pintarTabla(e);
    if (e.terminado && e.k > 0) {
      trazaCompleta = true;
      revisarCierre();
    }
  }

  construirOpciones("orden", ORDEN, "orden");
  construirOpciones("inversion", INVERSION, "inversion");
  construirOpciones("dependiente", DEPENDIENTE, "dependiente");
  construirOpciones("tres", TRES, "tres");
  marcar();

  Motor.iniciar({
    codigo: CODIGO,
    paramsIniciales: PARAMS,
    simular: simular,
    chips: [
      { campo: "x", rotulo: "x" },
      { campo: "y", rotulo: "y" },
      { campo: "pareja", rotulo: "pareja" },
      { campo: "cuantas", rotulo: "parejas", clase: "cuenta" }
    ],
    alPintar: alPintar
  });

  Motor.prediccionNumerica(function (valor) {
    if (valor === 6) {
      return { ok: true, msg: "Son seis. El generador de adentro produce un valor con i = 1, dos con i = 2 y tres con i = 3." };
    }
    if (valor === 9) {
      return { ok: false, msg: "9 es el largo cuando el segundo generador no depende del primero, con j <- 1 to 3. Aquí el extremo de arriba es i y con i = 1 solo sale una pareja." };
    }
    if (valor === 3) {
      return { ok: false, msg: "3 es cuántos valores toma i. Cada i aporta tantas parejas como valores produzca 1 to i, y esa cantidad crece con i." };
    }
    if (valor === 2) {
      return { ok: false, msg: "2 es cuántas parejas aporta i = 2. Las de i = 1 e i = 3 también entran al resultado." };
    }
    return { ok: false, msg: "No es ese número. Cuente aparte cuántas parejas aporta cada valor de i: con i = 1, con i = 2 y con i = 3." };
  });
})();
