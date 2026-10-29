/* flatmap: los cuatro frames de la seccion de flatMap. El codigo sale de
   05_flatmap.scala y la traza reproduce la expresion
   (1 to 3).flatMap(x => (1 to 2).map(y => (x, y))) repartida en varias lineas,
   con un paso por cada vez que se evalua una de ellas. Los valores correctos
   salieron de correr ese archivo con Scala 2.13.11: el anidado de tres
   vectores, el plano de seis parejas, el 32.0 del producto escalar y las siete
   parejas primas. La traza corre con un solo juego de parametros, el medido.
   Los distractores son las confusiones que ocurren de verdad: contar las
   parejas donde length cuenta los trozos, y confundir el resultado del map
   interno con el resultado que entrega flatMap. */
(function () {

  var CODIGO = [
    { num: null, txt: "val plano =" },
    { num: 2, txt: "  (1 to 3).flatMap(x =>", bloque: 1 },
    { num: 3, txt: "    (1 to 2).map(y =>", bloque: 2 },
    { num: 4, txt: "      (x, y)", bloque: 2 },
    { num: 5, txt: "    )", bloque: 2 },
    { num: 6, txt: "  )", bloque: 3 }
  ];

  var PARAMS = {
    externo: [1, 2, 3], interno: [1, 2],
    rotuloExterno: "(1 to 3)", rotuloInterno: "(1 to 2)"
  };

  var ANIDADO = "Vector(Vector((1,1), (1,2)), Vector((2,1), (2,2)), Vector((3,1), (3,2)))";
  var PLANO = "Vector((1,1), (1,2), (2,1), (2,2), (3,1), (3,2))";

  function textoPareja(x, y) { return "(" + x + "," + y + ")"; }

  function textoVector(elementos) {
    return "Vector(" + elementos.join(", ") + ")";
  }

  function concatenar(trozos) {
    var juntos = [];
    trozos.forEach(function (t) { juntos = juntos.concat(t); });
    return juntos;
  }

  /* Un paso por cada linea que se evalua, en el orden en que corren. La linea 2
     se evalua una vez por cada x, la 4 una vez por cada pareja y la 6 una sola
     vez, cuando flatMap concatena los trozos. */
  function simular(p) {
    var pasos = [];
    var trozos = [];

    function anotar(linea, extra) {
      var paso = {
        linea: linea, fase: null, x: null, y: null, pareja: null,
        trozo: null, anidado: null, plano: null,
        interno: null, trozoListo: null, cierra: null
      };
      Object.keys(extra).forEach(function (k) { paso[k] = extra[k]; });
      pasos.push(paso);
    }

    function anidadoHasta() {
      return textoVector(trozos.map(function (t) { return textoVector(t); }));
    }

    p.externo.forEach(function (x) {
      var trozo = [];
      var interno = p.rotuloInterno + ".map(y => (" + x + ", y))";

      anotar(2, {
        fase: "x toma su valor", x: x, trozo: textoVector(trozo),
        anidado: anidadoHasta(), interno: interno
      });
      anotar(3, {
        fase: "arranca el map interno", x: x, trozo: textoVector(trozo),
        anidado: anidadoHasta(), interno: interno
      });

      p.interno.forEach(function (y) {
        trozo.push(textoPareja(x, y));
        anotar(4, {
          fase: "se arma una pareja", x: x, y: y, pareja: textoPareja(x, y),
          trozo: textoVector(trozo), anidado: anidadoHasta(), interno: interno
        });
      });

      trozos.push(trozo.slice());
      anotar(5, {
        fase: "el map interno entrega su trozo", x: x,
        trozo: textoVector(trozo), anidado: anidadoHasta(),
        interno: interno, trozoListo: textoVector(trozo)
      });
    });

    anotar(6, {
      fase: "flatMap concatena los trozos",
      anidado: anidadoHasta(),
      plano: textoVector(concatenar(trozos)),
      cierra: true
    });

    return pasos;
  }

  /* ── Las preguntas del problema: con map queda anidado ──────────── */

  var ANIDA = [
    {
      expr: "(1 to 3).map(x => (1 to 2).map(y => (x, y)))",
      pregunta: "La función que se aplica a cada x produce otra secuencia.",
      cierre: "Cada x deja su propio Vector de dos parejas, y los tres quedan dentro de otro Vector: una secuencia de secuencias.",
      opciones: [
        { txt: ANIDADO, correcta: true, larga: true },
        { txt: PLANO, fallo: "Ese es el resultado de flatMap, que ya viene plano. map no aplana nada: deja cada resultado tal como lo devolvió la función, y aquí cada uno es un Vector.", larga: true },
        { txt: "una pareja por posición, emparejando las dos secuencias", fallo: "Eso es lo que hace zip, que avanza las dos a la vez y se detiene en la más corta. Aquí el map interno recorre (1 to 2) completo para cada x, así que de cada x salen dos parejas.", larga: true }
      ]
    },
    {
      expr: "(1 to 3).map(x => (1 to 2).map(y => (x, y))).length",
      pregunta: "El largo del resultado anidado.",
      cierre: "length cuenta los elementos del Vector de afuera, y cada elemento es un Vector completo: hay uno por cada x.",
      opciones: [
        { txt: "3", correcta: true },
        { txt: "6", fallo: "6 es la cantidad de parejas, pero están repartidas en tres vectores. Para llegar a 6 hay que aplanar primero." },
        { txt: "2", fallo: "2 es el largo de cada vector interno, el que produce (1 to 2). El de afuera tiene un elemento por cada valor de (1 to 3)." }
      ]
    }
  ];

  /* ── Las preguntas del cierre: componer zip, map y sum ──────────── */

  var COMPONER = [
    {
      expr: "prodEscalar(Vector(1.0, 2.0, 3.0), Vector(4.0, 5.0, 6.0))",
      pregunta: "El cuerpo es (xs zip ys).map { case (x, y) => x * y }.sum",
      cierre: "zip arma las parejas por posición, map multiplica las dos componentes de cada una y sum reduce el vector de productos a un número.",
      opciones: [
        { txt: "32.0", correcta: true },
        { txt: "32", fallo: "Los elementos de los dos vectores son Double, así que el producto y la suma también lo son: lo que se imprime es 32.0." },
        { txt: "un vector con los tres productos, uno por posición", fallo: "Ese es el resultado intermedio que deja el map. prodEscalar le aplica sum encima, y sum devuelve un solo número.", larga: true }
      ]
    },
    {
      expr: "(2 until 7).flatMap(i =>\n  (1 until i).map(j => (i, j))\n).filter(par => esPrimo(par._1 + par._2))",
      pregunta: "El flatMap arma las parejas y el filter se queda con las que suman un primo.",
      cierre: "El filter corre sobre el vector plano de parejas, cuando cada pareja ya tiene sus dos componentes, y conserva las siete en que esPrimo(i + j) da true.",
      opciones: [
        { txt: "Vector((2,1), (3,2), (4,1), (4,3), (5,2), (6,1), (6,5))", correcta: true, larga: true },
        { txt: "todas las parejas (i, j) con 1 <= j < i < 7", fallo: "Esas son las que produce el flatMap, antes de filtrar. El filter se aplica encima y descarta las parejas cuya suma no es prima.", larga: true },
        { txt: "Vector(2, 3, 5, 7, 11)", fallo: "Esos son los primos que deja (0 to 12).filter(esPrimo). Aquí lo primo es la suma de cada pareja, y lo que se devuelve son las parejas.", larga: true }
      ]
    },
    {
      expr: "las parejas del resultado que empiezan por 4",
      pregunta: "Con i = 4, el map interno recorre (1 until 4).",
      cierre: "El map interno arma (4,1), (4,2) y (4,3), y en el resultado quedan (4,1) y (4,3): la pareja (4,2) no pasó el filter.",
      opciones: [
        { txt: "(4,1) y (4,3)", correcta: true },
        { txt: "(4,1), (4,2) y (4,3)", fallo: "Esas son las tres que arma el map interno con i = 4, porque j recorre 1 until 4. En el resultado solo están (4,1) y (4,3)." },
        { txt: "(4,5) y (4,6)", fallo: "j recorre 1 until i, así que el segundo componente siempre es menor que el primero: con i = 4 los candidatos son 1, 2 y 3." }
      ]
    }
  ];

  var API = {
    CODIGO: CODIGO, PARAMS: PARAMS, ANIDADO: ANIDADO, PLANO: PLANO,
    simular: simular, ANIDA: ANIDA, COMPONER: COMPONER,
    textoVector: textoVector
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ════════════════ la pagina ════════════════ */

  var SECCIONES = [
    { llave: "anida", caja: "anida", marcador: "marcador-anida", items: ANIDA },
    { llave: "componer", caja: "componer", marcador: "marcador-componer", items: COMPONER }
  ];

  var resueltos = { anida: 0, componer: 0 };
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
    document.getElementById("marcador-componer").textContent =
      "resueltas: " + resueltos.componer + " de " + COMPONER.length +
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

  /* La tabla de trozos: una fila por cada x que ya entrego el suyo, y la
     ultima cuando flatMap concatena. */
  function pintarTabla(e) {
    var tabla = document.getElementById("tabla-trozos");
    var fila = 0;
    tabla.innerHTML = "";
    var cab = document.createElement("tr");
    ["paso", "x", "map interno (y varía)", "trozo"].forEach(function (t) {
      var th = document.createElement("th");
      th.textContent = t;
      cab.appendChild(th);
    });
    tabla.appendChild(cab);

    e.pasos.slice(0, e.k).forEach(function (p) {
      if (p.linea !== 5 && p.linea !== 6) { return; }
      fila = fila + 1;
      var tr = document.createElement("tr");
      var celdas = p.linea === 5
        ? [String(fila), String(p.x), p.interno, p.trozoListo]
        : [String(fila), "los tres", "aplanar y concatenar", p.plano];
      celdas.forEach(function (c, i) {
        var td = document.createElement("td");
        td.textContent = c;
        if (i >= 2) { td.className = "expr-celda"; }
        tr.appendChild(td);
      });
      tabla.appendChild(tr);
    });

    if (fila === 0) {
      var vacia = document.createElement("tr");
      var td = document.createElement("td");
      td.colSpan = 4;
      td.className = "pend";
      td.textContent = "la primera fila aparece cuando el map interno termina con x = 1";
      vacia.appendChild(td);
      tabla.appendChild(vacia);
    }
  }

  function alPintar(e) {
    var anidado = "–";
    var plano = "–";
    e.pasos.slice(0, e.k).forEach(function (p) {
      if (p.anidado !== null) { anidado = p.anidado; }
      if (p.plano !== null) { plano = p.plano; }
    });
    document.getElementById("caja-anidado").textContent = anidado;
    document.getElementById("caja-plano").textContent = plano;
    pintarTabla(e);
    if (e.terminado && e.k > 0) {
      trazaCompleta = true;
      revisarCierre();
    }
  }

  construirOpciones("anida", ANIDA, "anida");
  construirOpciones("componer", COMPONER, "componer");
  marcar();

  Motor.iniciar({
    codigo: CODIGO,
    paramsIniciales: PARAMS,
    simular: simular,
    chips: [
      { campo: "fase", rotulo: "fase" },
      { campo: "x", rotulo: "x" },
      { campo: "y", rotulo: "y" },
      { campo: "pareja", rotulo: "pareja", clase: "cuenta" }
    ],
    alPintar: alPintar
  });

  Motor.prediccionNumerica(function (valor) {
    if (valor === 6) {
      return { ok: true, msg: "Son seis. Cada x aporta dos parejas y flatMap concatena los tres trozos en una sola secuencia." };
    }
    if (valor === 3) {
      return { ok: false, msg: "3 es la cantidad de trozos, uno por cada x, y es el largo del resultado anidado que deja map. flatMap los concatena, así que su largo cuenta parejas." };
    }
    if (valor === 2) {
      return { ok: false, msg: "2 es el largo de cada trozo, el que produce (1 to 2). Hay un trozo por cada valor de (1 to 3)." };
    }
    if (valor === 5) {
      return { ok: false, msg: "5 sería la suma de los dos largos. Cada x de (1 to 3) recorre (1 to 2) completo, de modo que los largos se multiplican." };
    }
    return { ok: false, msg: "No es ese número. Cuente cuántas parejas aporta un solo x y cuántos valores recorre el generador de afuera." };
  });
})();
