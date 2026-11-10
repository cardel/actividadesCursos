/* perezoso: un LazyList se construye por demanda, elemento por elemento.
   Todo lo que se afirma salio de correr el codigo con Scala 2.13.11: el 1013
   que devuelve el indice 1 del rango filtrado; el LazyList(<not computed>)
   que imprime 1 #:: 2 #:: LazyList.empty y el List(1, 2) que deja .toList
   sobre ese mismo flujo; y los primos(0) = 1009, primos(1) = 1013 y
   primos(4) = 1031 del flujo streamRange(1000, 10000).filter(esPrimo).
   Los distractores son las confusiones que ocurren de verdad: creer que el
   filtro de un rango se detiene en el elemento pedido, suponer que la cabeza
   de un flujo ya esta calculada cuando la cola no lo esta, y pensar que un
   indice llega directo a su elemento sin calcular los anteriores. */
(function () {

  var CODIGO_RANGO = [
    "def esPrimo(n: Int) = n >= 2 && (2 until n).forall(n % _ != 0)",
    "",
    "val segundo = ((1000 to 10000).filter(esPrimo))(1)"
  ];

  var CODIGO_FLUJO = [
    "def streamRange(min: Int, max: Int): LazyList[Int] =",
    "  if (min >= max) LazyList.empty else min #:: streamRange(min + 1, max)",
    "",
    "val primos = streamRange(1000, 10000).filter(esPrimo)"
  ];

  var NO_CALCULADO = "LazyList(<not computed>)";

  /* --- Seccion 1: el costo de filtrar un rango ---------------------- */

  var RANGO = [
    {
      expr: "((1000 to 10000).filter(esPrimo))(1)",
      pregunta: "Del rango completo se quiere un solo valor, el del índice 1. ¿Cuánto trabaja el filtro para entregarlo?",
      cierre: "Prueba esPrimo en todos los números del rango. filter devuelve una secuencia ya construida, y para saber quiénes la forman hay que probarlos todos; el índice se aplica después, sobre lo que quedó.",
      opciones: [
        { txt: "no prueba nada hasta que se escribe el índice, porque filter solo anota la condición", fallo: "Anotar la condición sin construir nada es lo que hace withFilter. filter sí construye: devuelve la secuencia de los que pasaron, y para saber cuáles pasaron los prueba uno por uno.", larga: true }
      ,
        { txt: "prueba esPrimo en todos los números del rango y arma la secuencia completa de primos", correcta: true, larga: true },
        { txt: "avanza hasta el segundo primo y deja el resto del rango sin probar", fallo: "Eso es lo que hace un flujo por demanda. filter sobre un rango entrega una secuencia terminada: cuando se escribe el índice, todo el rango ya pasó por esPrimo.", larga: true }]
    },
    {
      expr: "((1000 to 10000).filter(esPrimo))(1)",
      pregunta: "¿Qué valor devuelve?",
      cierre: "1013. El primer primo del rango es 1009 y queda en el índice 0, de modo que el índice 1 es el siguiente.",
      opciones: [
        { txt: "1009", fallo: "1009 es el primer primo del rango y ocupa el índice 0. El índice 1 pide el segundo, 1013." },
        { txt: "1031", fallo: "1031 está en la misma secuencia, más adelante: es el del índice 4. Con el índice 1 se pide el segundo primo del rango, 1013." }
      ,
        { txt: "1013", correcta: true }]
    }
  ];

  /* --- Seccion 2: lo que se imprime antes de pedir nada -------------- */

  var CABEZA = [
    {
      expr: "1 #:: 2 #:: LazyList.empty",
      pregunta: "La expresión se escribió en el intérprete y respondió con una línea. ¿Cuál?",
      cierre: NO_CALCULADO + ". El operador #:: construye el flujo sin evaluar ninguno de sus dos lados, así que no hay un solo elemento calculado y la impresión lo dice.",
      opciones: [
        { txt: NO_CALCULADO, correcta: true, larga: true },
        { txt: "LazyList(1, 2)", fallo: "Esos son los elementos que se obtienen al forzar el flujo. Mientras nadie pida uno, ninguno se calcula, y la impresión es " + NO_CALCULADO + ".", larga: true },
        { txt: "LazyList(1, <not computed>)", fallo: "Es la suposición frecuente: que la cabeza ya está y lo pendiente es la cola. El #:: deja los dos lados sin evaluar, de modo que ni la cabeza aparece: " + NO_CALCULADO + ".", larga: true }
      ]
    },
    {
      expr: "(1 #:: 2 #:: LazyList.empty).toList",
      pregunta: "¿Qué devuelve?",
      cierre: "List(1, 2). toList recorre el flujo de punta a punta, y recorrerlo es pedir cada elemento: los dos se calculan y quedan en una List.",
      opciones: [
        { txt: "LazyList(1, 2)", fallo: "toList cambia de colección: lo que devuelve es una List con sus dos elementos ya calculados. El flujo de partida sigue siendo un LazyList." }
      ,
        { txt: "List(1, 2)", correcta: true },
        { txt: "List(<not computed>)", fallo: "El aviso es lo que imprime un flujo sin elementos calculados; no es un valor que se pueda guardar. toList pide los elementos y devuelve List(1, 2)." }]
    }
  ];

  /* --- Seccion 3: el mismo filtro sobre un flujo --------------------- */

  var INDICES = [
    {
      expr: "primos(0)",
      pregunta: "Devuelve 1009. ¿Hasta dónde avanzó el filtro para dar ese valor?",
      cierre: "Pidió elementos a streamRange desde 1000, uno por uno, y se detuvo en el primero que pasó esPrimo. Del 1010 en adelante nada se calculó.",
      opciones: [
        { txt: "pidió los diez mil elementos que streamRange puede producir y tomó el primero de los primos", fallo: "streamRange produce un elemento cada vez que alguien pide el siguiente: la llamada recursiva queda a la derecha de #:: y espera. El filtro paró en 1009.", larga: true },
        { txt: "ninguno, porque el flujo entrega 1000 como primer elemento", fallo: "1000 es el primer elemento que produce streamRange, pero no pasa esPrimo y el filtro lo descarta. El primer elemento de primos es 1009.", larga: true }
      ,
        { txt: "pidió elementos desde 1000 hasta dar con el primero que pasa esPrimo, y ahí paró", correcta: true, larga: true }]
    },
    {
      expr: "primos(4)",
      pregunta: "Devuelve 1031. ¿Qué se calculó para responder?",
      cierre: "Los elementos del flujo desde 1000 hasta 1031 y nada más. El filtro sigue pidiendo mientras le falten primos, y con cinco encontrados devuelve el último y se detiene.",
      opciones: [
        { txt: "los elementos del flujo desde 1000 hasta 1031, con los cinco primos que hay entre ellos", correcta: true, larga: true },
        { txt: "la secuencia completa de primos del rango, de la que se tomó el quinto", fallo: "Esa secuencia completa es lo que arma filter sobre un rango. Sobre un flujo el filtro pide elementos solo mientras le falten primos: con cinco encontrados entrega 1031 y lo que sigue queda sin calcular.", larga: true },
        { txt: "solo el 1031, porque el índice va directo al elemento que pide", fallo: "El índice no es una posición en memoria: el flujo no sabe quién es el quinto primo antes de haber encontrado los cuatro anteriores, empezando por 1009 y 1013.", larga: true }
      ]
    },
    {
      expr: "((1000 to 10000).filter(esPrimo))(1)   y   streamRange(1000, 10000).filter(esPrimo)(1)",
      pregunta: "Las dos devuelven 1013. ¿En qué se diferencian?",
      cierre: "En cuántos elementos se calculan. El rango prueba esPrimo en todos sus números antes de aplicar el índice; el flujo para en 1013, que es el segundo primo que encuentra.",
      opciones: [
        { txt: "en el orden, porque el flujo entrega los primos a medida que los encuentra", fallo: "El orden es el mismo en los dos, el de los números del rango. Lo que cambia es cuándo se calcula cada elemento y cuántos se calculan.", larga: true }
      ,
        { txt: "en cuántos elementos se calculan: el rango los prueba todos, el flujo para en el segundo primo", correcta: true, larga: true },
        { txt: "en el resultado, porque el flujo no llega al 10000", fallo: "streamRange para cuando min >= max, así que produce hasta 9999, mientras 1000 to 10000 incluye el 10000. Esa diferencia no toca al índice 1: las dos devuelven 1013.", larga: true }]
    }
  ];

  var API = {
    CODIGO_RANGO: CODIGO_RANGO, CODIGO_FLUJO: CODIGO_FLUJO,
    NO_CALCULADO: NO_CALCULADO,
    RANGO: RANGO, CABEZA: CABEZA, INDICES: INDICES
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================ la pagina ================ */

  var SECCIONES = [
    { llave: "rango", caja: "rango", marcador: "marcador-rango", items: RANGO },
    { llave: "cabeza", caja: "cabeza", marcador: "marcador-cabeza", items: CABEZA },
    { llave: "indices", caja: "indices", marcador: "marcador-indices", items: INDICES }
  ];

  var resueltos = { rango: 0, cabeza: 0, indices: 0 };
  var fallados = 0;

  function marcar() {
    var listo = true;
    SECCIONES.forEach(function (s) {
      document.getElementById(s.marcador).textContent =
        "resueltas: " + resueltos[s.llave] + " de " + s.items.length;
      if (resueltos[s.llave] < s.items.length) { listo = false; }
    });
    document.getElementById("marcador-indices").textContent =
      "resueltas: " + resueltos.indices + " de " + INDICES.length +
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

  construirCodigo("codigo-rango", CODIGO_RANGO);
  construirCodigo("codigo-flujo", CODIGO_FLUJO);
  SECCIONES.forEach(function (s) {
    construirOpciones(s.caja, s.items, s.llave);
  });
  marcar();
})();
