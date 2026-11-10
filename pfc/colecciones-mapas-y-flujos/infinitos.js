/* infinitos: un flujo sin final y lo que se materializa al consultarlo.
   Todo lo que se afirma salio de correr el codigo con Scala 2.13.11:
   enterosDesde(0) imprime LazyList(<not computed>); enteros(5) devuelve 5;
   despues de esa consulta el mismo val imprime
   LazyList(0, 1, 2, 3, 4, 5, <not computed>); y fibs.take(10).toList
   devuelve List(0, 1, 1, 2, 3, 5, 8, 13, 21, 34).
   El error tambien esta medido: la definicion de fibs copiada dentro de un
   metodo no compila y el compilador responde "forward reference to value
   fibs defined on line N extends over definition of value fibs"; como
   miembro de un objeto o de una clase si compila.
   Los distractores son las confusiones que ocurren de verdad: esperar un
   desborde de pila de una definicion sin caso base, creer que la cabeza ya
   esta calculada, suponer que el flujo olvida lo que calculo y leer el
   mensaje del compilador como si prohibiera la definicion en si. */
(function () {

  var CODIGO_ENTEROS = [
    "def enterosDesde(n: Int): LazyList[Int] = n #:: enterosDesde(n + 1)",
    "",
    "val enteros = enterosDesde(0)"
  ];

  var CODIGO_FIBS = [
    "val fibs: LazyList[BigInt] =",
    "  BigInt(0) #:: BigInt(1) #:: fibs.zip(fibs.tail).map { case (a, b) => a + b }"
  ];

  var NO_CALCULADO = "LazyList(<not computed>)";
  var SEIS = "LazyList(0, 1, 2, 3, 4, 5, <not computed>)";
  var DIEZ_FIBS = "List(0, 1, 1, 2, 3, 5, 8, 13, 21, 34)";
  var MENSAJE = "forward reference to value fibs defined on line N extends over definition of value fibs";

  /* --- Seccion 1: un flujo que no termina ---------------------------- */

  var ENTEROS = [
    {
      expr: "enteros",
      pregunta: "La definición no tiene caso base y el val se escribió sin error. ¿Qué imprime enteros?",
      cierre: NO_CALCULADO + ". La llamada enterosDesde(n + 1) está a la derecha de #:: y espera ahí: nada se evalúa mientras nadie pida un elemento.",
      opciones: [
        { txt: NO_CALCULADO, correcta: true, larga: true },
        { txt: "un desborde de pila, porque enterosDesde se llama sin parar", fallo: "La llamada recursiva está a la derecha de #::, y ese lado no se evalúa hasta que algo pida la cola. El val queda escrito y la impresión es " + NO_CALCULADO + ".", larga: true },
        { txt: "LazyList(0, <not computed>)", fallo: "Es la suposición de que al menos la cabeza ya está. El #:: tampoco la calcula: la impresión es " + NO_CALCULADO + ".", larga: true }
      ]
    },
    {
      expr: "enteros(5)",
      pregunta: "¿Qué devuelve?",
      cierre: "5. El flujo empieza en 0, así que el índice 5 es el sexto elemento. Pedir un índice pide los elementos hasta ese índice, no el flujo entero.",
      opciones: [
        { txt: "nada, porque el flujo es infinito y la consulta no termina", fallo: "La consulta pide los elementos hasta el índice 5 y para ahí. Lo corrido devolvió 5." }
      ,
        { txt: "5", correcta: true },
        { txt: "6", fallo: "El primer elemento es 0 y ocupa el índice 0, de modo que el índice 5 vale 5. El 6 queda en el índice 6." }]
    },
    {
      expr: "enteros",
      pregunta: "Tras enteros(5), la impresión del mismo val ya no es la de antes. ¿Qué imprime ahora?",
      cierre: SEIS + ". Para llegar al índice 5 hubo que producir los anteriores, y un flujo conserva lo que calculó: los seis aparecen, y el aviso queda para lo que sigue.",
      opciones: [
        { txt: "LazyList(5, <not computed>)", fallo: "El índice 5 no se alcanza sin producir del 0 al 4, y esos elementos no se descartan. La impresión trae los seis: " + SEIS + ".", larga: true },
        { txt: NO_CALCULADO, fallo: "Esa era la impresión antes de la consulta. Un flujo guarda los elementos que ya calculó, de modo que ahora aparecen: " + SEIS + ".", larga: true }
      ,
        { txt: SEIS, correcta: true, larga: true }]
    }
  ];

  /* --- Seccion 2: fibs, definida en terminos de si misma ------------- */

  var FIBS = [
    {
      expr: "fibs.take(10).toList",
      pregunta: "¿Qué devuelve?",
      cierre: DIEZ_FIBS + ". Los dos primeros elementos están escritos, 0 y 1, y cada uno de los siguientes es la suma de los dos anteriores.",
      opciones: [
        { txt: DIEZ_FIBS, correcta: true, larga: true },
        { txt: "List(1, 1, 2, 3, 5, 8, 13, 21, 34, 55)", fallo: "Esa serie arranca en 1. La definición pone BigInt(0) y BigInt(1) al frente, así que el primer elemento es 0 y el décimo es 34.", larga: true },
        { txt: "List(0, 1, 2, 3, 5, 8, 13, 21, 34, 55)", fallo: "Falta el segundo 1. Tras 0 y 1 viene su suma, que vale 1 otra vez: " + DIEZ_FIBS + ".", larga: true }
      ]
    },
    {
      expr: "BigInt(0) #:: BigInt(1) #:: fibs.zip(fibs.tail).map { case (a, b) => a + b }",
      pregunta: "La cola se arma con fibs y fibs.tail, los dos del valor que todavía se está definiendo. ¿Por qué eso llega a producir elementos?",
      cierre: "Porque los dos primeros están dados con #:: y cada elemento nuevo solo necesita dos que ya se calcularon: el par que entrega zip son dos elementos anteriores, y su suma es el siguiente.",
      opciones: [
        { txt: "porque map no evalúa nada hasta tener el flujo completo", fallo: "No hay flujo completo que esperar: fibs no termina. Cada suma se calcula cuando se pide ese elemento, con los dos anteriores ya calculados.", larga: true }
      ,
        { txt: "porque los dos primeros están escritos con #:: y cada elemento nuevo solo necesita dos ya calculados", correcta: true, larga: true },
        { txt: "porque zip se detiene en el más corto de los dos flujos", fallo: "zip sí se detiene en el más corto, y eso explica que la cola no se pase del final de lo disponible. Lo que hace calculable cada elemento es que 0 y 1 están dados y cada suma usa dos anteriores.", larga: true }]
    },
    {
      expr: MENSAJE,
      pregunta: "Esa misma definición de fibs, copiada tal cual dentro de un método, no compila: el compilador responde eso. ¿Qué señala el mensaje?",
      cierre: "Que dentro de un bloque el nombre fibs aparece en su propia definición, y ahí esa referencia no se admite. El mensaje nombra dos veces el valor fibs y la línea en que está definido.",
      opciones: [
        { txt: "que un LazyList no puede definirse en términos de sí mismo", fallo: "La definición es válida tal como está escrita: como miembro de un objeto o de una clase compila, y fibs.take(10).toList devuelve " + DIEZ_FIBS + ". El mensaje habla de dónde está escrita.", larga: true },
        { txt: "que falta anotar el tipo del valor", fallo: "El tipo está anotado, LazyList[BigInt], y el mensaje no lo menciona: habla de una referencia hacia adelante y de la línea en que fibs queda definido.", larga: true }
      ,
        { txt: "que dentro de un bloque el nombre fibs se usa en su propia definición, y ahí no se admite", correcta: true, larga: true }]
    },
    {
      expr: "¿dónde compila la definición de fibs?",
      pregunta: "Con el mensaje a la vista, ¿qué cambio la hace compilar?",
      cierre: "Sacarla del bloque: como miembro de un objeto o de una clase compila, y ahí fibs.take(10).toList devuelve " + DIEZ_FIBS + ".",
      opciones: [
        { txt: "escribirla como miembro de un objeto o de una clase", correcta: true, larga: true },
        { txt: "moverla a la primera línea del método", fallo: "El sitio que ocupe dentro del bloque no cambia nada: en cualquier línea el nombre fibs sigue usándose dentro de su propia definición. Fuera del bloque, como miembro de un objeto o de una clase, compila.", larga: true },
        { txt: "envolver la cola en paréntesis", fallo: "Los paréntesis no cambian quién nombra a quién: la cola sigue nombrando fibs. Lo que cambia es el sitio de la definición, no su forma.", larga: true }
      ]
    }
  ];

  var API = {
    CODIGO_ENTEROS: CODIGO_ENTEROS, CODIGO_FIBS: CODIGO_FIBS,
    NO_CALCULADO: NO_CALCULADO, SEIS: SEIS, DIEZ_FIBS: DIEZ_FIBS,
    MENSAJE: MENSAJE,
    ENTEROS: ENTEROS, FIBS: FIBS
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================ la pagina ================ */

  var SECCIONES = [
    { llave: "enteros", caja: "enteros", marcador: "marcador-enteros", items: ENTEROS },
    { llave: "fibs", caja: "fibs", marcador: "marcador-fibs", items: FIBS }
  ];

  var resueltos = { enteros: 0, fibs: 0 };
  var fallados = 0;

  function marcar() {
    var listo = true;
    SECCIONES.forEach(function (s) {
      document.getElementById(s.marcador).textContent =
        "resueltas: " + resueltos[s.llave] + " de " + s.items.length;
      if (resueltos[s.llave] < s.items.length) { listo = false; }
    });
    document.getElementById("marcador-fibs").textContent =
      "resueltas: " + resueltos.fibs + " de " + FIBS.length +
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

  construirCodigo("codigo-enteros", CODIGO_ENTEROS);
  construirCodigo("codigo-fibs", CODIGO_FIBS);
  SECCIONES.forEach(function (s) {
    construirOpciones(s.caja, s.items, s.llave);
  });
  marcar();
})();
