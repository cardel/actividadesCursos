/* criba: la criba de Eratostenes sobre un flujo que no termina.
   Todo lo que se afirma salio de correr el codigo con Scala 2.13.11:
   criba(enterosDesde(2)) con primos.take(10).toList igual a
   List(2, 3, 5, 7, 11, 13, 17, 19, 23, 29) y primos(20) igual a 73.
   La traza es la del mismo flujo, paso por paso, con la cabeza que devuelve
   cada llamada, el filtro que entra con ella y la cola que queda debajo de
   los filtros acumulados.
   Los distractores son las confusiones que ocurren de verdad: esperar que la
   recursion sin caso base se encadene sin parar, creer que el filtro recorre
   la cola al escribirse, suponer que el filtro de cada paso reemplaza al
   anterior y atribuirle al filtro de 5 numeros que los filtros de 2 y 3 ya
   habian descartado. */
(function () {

  var CODIGO = [
    "def enterosDesde(n: Int): LazyList[Int] = n #:: enterosDesde(n + 1)",
    "",
    "def criba(s: LazyList[Int]): LazyList[Int] =",
    "  s.head #:: criba(s.tail.filter(_ % s.head != 0))",
    "",
    "val primos = criba(enterosDesde(2))"
  ];

  var DIEZ = "List(2, 3, 5, 7, 11, 13, 17, 19, 23, 29)";
  var PARTIDA = { paso: "0", cabeza: "", filtro: "partida", cola: "2, 3, 4, 5, 6, 7, …" };

  /* --- Seccion 1: las dos piezas de cada llamada --------------------- */

  var PIEZAS = [
    {
      expr: "s.head #:: criba(s.tail.filter(_ % s.head != 0))",
      pregunta: "criba se llama a sí misma y no tiene caso base, y el val se escribió sin error. ¿Por qué las llamadas no se encadenan sin parar?",
      cierre: "Porque la llamada recursiva está a la derecha de #:: y queda sin evaluar. Cada paso entrega una cabeza y la promesa de una cola; la llamada siguiente solo ocurre si alguien pide esa cola.",
      opciones: [
        { txt: "porque s.head se calcula una sola vez y las llamadas siguientes reusan ese valor", fallo: "Cada llamada tiene su propia cabeza, y de ahí que el filtro cambie en cada paso. Lo que evita que las llamadas se encadenen sin parar es que #:: no evalúa su lado derecho.", larga: true }
      ,
        { txt: "porque la llamada recursiva está a la derecha de #:: y queda sin evaluar hasta que algo pida la cola", correcta: true, larga: true },
        { txt: "porque el filtro termina dejando el flujo vacío y ahí se detiene la recursión", fallo: "El flujo de partida no se agota: enterosDesde(2) produce el siguiente número cada vez que se le pide, y por delante siempre quedan números que pasan los filtros. Lo que corta la cadena de llamadas es el #::.", larga: true }]
    },
    {
      expr: "criba(s): ¿qué sale de una llamada?",
      pregunta: "¿Qué dos piezas devuelve cada llamada a criba?",
      cierre: "Una cabeza ya calculada, s.head, y una cola sin evaluar: la llamada a criba sobre s.tail con un filtro más encima. El filtro no recorre nada al escribirse.",
      opciones: [
        { txt: "el flujo filtrado completo, con la cabeza al frente", fallo: "Filtrar un flujo no lo recorre: el filtro queda encima de la cola y se aplica cuando alguien pide un elemento. De la llamada sale un valor concreto, s.head, y una cola que nadie ha calculado.", larga: true },
        { txt: "dos colas, la filtrada y la original", fallo: "La original no se devuelve aparte: la cola que sale es s.tail con el filtro encima. Lo que la acompaña es la cabeza, que sí es un valor concreto.", larga: true }
      ,
        { txt: "una cabeza calculada y una cola sin evaluar, que es la llamada siguiente sobre el flujo filtrado", correcta: true, larga: true }]
    }
  ];

  /* --- Seccion 2: la traza, un paso a la vez ------------------------- */

  var PASOS = [
    {
      paso: "1",
      cabeza: "2",
      filtro: "x % 2 != 0",
      cola: "3, 5, 7, 9, 11, …",
      expr: "criba(2, 3, 4, 5, 6, 7, …)",
      pregunta: "El primer paso recibe el flujo de partida. ¿Qué cabeza devuelve?",
      cierre: "2. Con esa cabeza entra el filtro x % 2 != 0 sobre la cola, así que de ahí en adelante no pasa ningún par: queda 3, 5, 7, 9, 11, …",
      opciones: [
        { txt: "2", correcta: true },
        { txt: "1", fallo: "El flujo de partida es enterosDesde(2) y su primer elemento es 2. El 1 no está en él." },
        { txt: "3", fallo: "El 3 es la cabeza del paso siguiente, cuando la cola ya pasó por el filtro de 2. La cabeza de este paso es el primer elemento del flujo que llega, 2." }
      ]
    },
    {
      paso: "2",
      cabeza: "3",
      filtro: "x % 3 != 0",
      cola: "5, 7, 11, 13, 17, …",
      expr: "criba(3, 5, 7, 9, 11, …)",
      pregunta: "¿Con qué cabeza sigue el segundo paso y qué filtro entra con ella?",
      cierre: "Cabeza 3 y filtro x % 3 != 0, que se suma al de 2 en vez de reemplazarlo. Con los dos encima salen el 9 y el 15, y la cola queda 5, 7, 11, 13, 17, …",
      opciones: [
        { txt: "cabeza 3, y el filtro sigue siendo x % 2 != 0", fallo: "El filtro de cada paso se arma con la cabeza de ese paso, de modo que entra x % 3 != 0. El de 2 tampoco se retira: los dos quedan encima de la cola.", larga: true }
      ,
        { txt: "cabeza 3, y entra x % 3 != 0 sobre lo que ya venía filtrado", correcta: true, larga: true },
        { txt: "cabeza 4, y entra x % 4 != 0", fallo: "El 4 no llega a este paso: el filtro x % 2 != 0 lo descartó. La cabeza es el primer elemento de la cola que llega, 3.", larga: true }]
    },
    {
      paso: "3",
      cabeza: "5",
      filtro: "x % 5 != 0",
      cola: "7, 11, 13, 17, 19, …",
      expr: "criba(5, 7, 11, 13, 17, …)",
      pregunta: "El tercer paso toma la cabeza 5. ¿Qué queda de la cola y por qué?",
      cierre: "7, 11, 13, 17, 19, … El filtro x % 5 != 0 se apila sobre los otros dos y no cambia nada entre los primeros elementos: de lo que quedaba, el primer múltiplo de 5 es el 25.",
      opciones: [
        { txt: "7, 11, 13, 17, 19, …, porque el filtro de 5 descarta el 10, el 15 y el 20", fallo: "Esos tres ya no estaban en la cola: el 10 y el 20 salieron con el filtro de 2 y el 15 con el de 3. El primero que el filtro de 5 llega a descartar es el 25.", larga: true },
        { txt: "11, 13, 17, 19, 23, …, porque el 7 también sale", fallo: "7 % 5 da 2, distinto de cero, así que el 7 pasa el filtro y es la cabeza del paso siguiente. El filtro solo descarta múltiplos de 5.", larga: true }
      ,
        { txt: "7, 11, 13, 17, 19, …, y el filtro de 5 no descarta ninguno de esos: el primer múltiplo de 5 que queda es el 25", correcta: true, larga: true }]
    },
    {
      paso: "4",
      cabeza: "7",
      filtro: "x % 7 != 0",
      cola: "11, 13, 17, 19, 23, …",
      expr: "criba(7, 11, 13, 17, 19, …)",
      pregunta: "¿Cuál es la cabeza del cuarto paso?",
      cierre: "7, y con ella entra el filtro x % 7 != 0. Cada número que llegue a la cola de aquí en adelante atraviesa los cuatro filtros: queda 11, 13, 17, 19, 23, …",
      opciones: [
        { txt: "7", correcta: true },
        { txt: "9", fallo: "El 9 salió con el filtro que entró con la cabeza 3: 9 % 3 da 0. La cola que llega a este paso empieza en 7." },
        { txt: "11", fallo: "El 11 es la cabeza del paso siguiente. El 7 pasó los filtros de 2, 3 y 5, y es el primer elemento de la cola que llega a este paso." }
      ]
    }
  ];

  /* --- Seccion 3: lo que devuelve el flujo --------------------------- */

  var RESULTADOS = [
    {
      expr: "primos.take(10).toList",
      pregunta: "¿Qué devuelve?",
      cierre: DIEZ + ". take pide diez elementos, y cada uno es la cabeza de un paso de la criba; del undécimo en adelante nada se calcula.",
      opciones: [
        { txt: "List(2, 3, 5, 7, 9, 11, 13, 17, 19, 23)", fallo: "El 9 no llega: el filtro que entró con la cabeza 3 lo descarta. Sin él, el décimo elemento es 29.", larga: true }
      ,
        { txt: DIEZ, correcta: true, larga: true },
        { txt: "List(1, 2, 3, 5, 7, 11, 13, 17, 19, 23)", fallo: "El flujo de partida es enterosDesde(2), así que el 1 nunca entra. El primer elemento es 2 y el décimo es 29.", larga: true }]
    },
    {
      expr: "primos(20)",
      pregunta: "Devuelve 73. ¿Cuánto se filtró para llegar ahí?",
      cierre: "Solo los números que hubo que mirar hasta encontrar el elemento del índice 20. Cada paso deja su filtro encima de una cola sin evaluar, y esos filtros corren únicamente sobre los números que el índice pedido obliga a producir.",
      opciones: [
        { txt: "el flujo infinito completo, una vez por cada filtro", fallo: "Un flujo sin final no se recorre completo. El índice 20 obliga a producir elementos hasta ese punto y el cálculo se detiene cuando lo encuentra: 73.", larga: true },
        { txt: "nada, porque el índice 20 se pasa del final del flujo", fallo: "El flujo no tiene final: enterosDesde(2) produce el siguiente número cada vez que se le pide. primos(20) devolvió 73.", larga: true }
      ,
        { txt: "solo los números que hubo que mirar hasta dar con el elemento del índice 20", correcta: true, larga: true }]
    }
  ];

  var API = {
    CODIGO: CODIGO, DIEZ: DIEZ, PARTIDA: PARTIDA,
    PIEZAS: PIEZAS, PASOS: PASOS, RESULTADOS: RESULTADOS
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================ la pagina ================ */

  var resueltos = { piezas: 0, traza: 0, resultados: 0 };
  var totales = { piezas: PIEZAS.length, traza: PASOS.length, resultados: RESULTADOS.length };
  var fallados = 0;
  var actual = 0;

  function marcar() {
    var listo = true;
    ["piezas", "traza", "resultados"].forEach(function (llave) {
      document.getElementById("marcador-" + llave).textContent =
        "resueltas: " + resueltos[llave] + " de " + totales[llave];
      if (resueltos[llave] < totales[llave]) { listo = false; }
    });
    document.getElementById("marcador-resultados").textContent =
      "resueltas: " + resueltos.resultados + " de " + totales.resultados +
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

  function opciones(f, item, giro, alAcertar) {
    rotar(item.opciones, giro).forEach(function (o) {
      var b = document.createElement("button");
      b.textContent = o.txt;
      if (o.larga) { b.className = "larga"; }
      b.addEventListener("click", function () {
        if (o.correcta) {
          b.className = b.className.replace(" errada", "") + " acertada";
          bloquear(f.ops);
          f.ver.className = "veredicto bien";
          f.ver.textContent = item.cierre;
          alAcertar();
        } else {
          errar(f, b, o.fallo);
        }
      });
      f.ops.appendChild(b);
    });
  }

  function construirOpciones(cajaId, items, llave) {
    var caja = document.getElementById(cajaId);
    items.forEach(function (item, indice) {
      var f = fila(item);
      opciones(f, item, indice + 1, function () {
        resueltos[llave] = resueltos[llave] + 1;
        marcar();
      });
      caja.appendChild(f.caja);
    });
  }

  /* la tabla de la traza: la fila de un paso aparece al predecirlo */

  var celdas = [];

  function celda(texto, pendiente) {
    var td = document.createElement("td");
    td.textContent = texto;
    if (pendiente) { td.className = "pend"; }
    return td;
  }

  function construirTabla() {
    var tabla = document.createElement("table");
    var cab = document.createElement("tr");
    ["Paso", "Cabeza", "Filtro", "Cola tras el paso"].forEach(function (t) {
      var th = document.createElement("th");
      th.textContent = t;
      cab.appendChild(th);
    });
    tabla.appendChild(cab);
    var inicio = document.createElement("tr");
    inicio.appendChild(celda(PARTIDA.paso, false));
    inicio.appendChild(celda("", false));
    inicio.appendChild(celda(PARTIDA.filtro, false));
    inicio.appendChild(celda(PARTIDA.cola, false));
    tabla.appendChild(inicio);
    PASOS.forEach(function (p) {
      var tr = document.createElement("tr");
      var cab2 = celda("?", true);
      var fil = celda("?", true);
      var col = celda("?", true);
      tr.appendChild(celda(p.paso, false));
      tr.appendChild(cab2);
      tr.appendChild(fil);
      tr.appendChild(col);
      celdas.push({ cabeza: cab2, filtro: fil, cola: col });
      tabla.appendChild(tr);
    });
    document.getElementById("traza").appendChild(tabla);
  }

  function revelar(indice) {
    var p = PASOS[indice];
    var c = celdas[indice];
    c.cabeza.textContent = p.cabeza;
    c.filtro.textContent = p.filtro;
    c.cola.textContent = p.cola;
    c.cabeza.className = "";
    c.filtro.className = "";
    c.cola.className = "";
  }

  function pintarPaso() {
    var caja = document.getElementById("paso");
    caja.textContent = "";
    if (actual >= PASOS.length) {
      var fin = document.createElement("p");
      fin.className = "nota";
      fin.textContent = "La traza llegó al cuarto paso y la forma se repite: " +
        "cada paso toma la cabeza de la cola que recibe, le agrega un filtro y " +
        "deja la cola siguiente sin evaluar.";
      caja.appendChild(fin);
      return;
    }
    var item = PASOS[actual];
    var f = fila(item);
    opciones(f, item, actual + 1, function () {
      revelar(actual);
      resueltos.traza = resueltos.traza + 1;
      actual = actual + 1;
      marcar();
      var avanzar = document.createElement("div");
      var b = document.createElement("button");
      avanzar.className = "botones";
      avanzar.style.marginTop = "0.5rem";
      b.className = "primario";
      b.textContent = actual < PASOS.length ? "Siguiente paso" : "Cerrar la traza";
      b.addEventListener("click", function () { pintarPaso(); });
      avanzar.appendChild(b);
      f.caja.appendChild(avanzar);
    });
    caja.appendChild(f.caja);
  }

  construirCodigo("codigo-criba", CODIGO);
  construirOpciones("piezas", PIEZAS, "piezas");
  construirOpciones("resultados", RESULTADOS, "resultados");
  construirTabla();
  pintarPaso();
  marcar();
})();
