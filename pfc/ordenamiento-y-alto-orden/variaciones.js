/* variaciones: las cinco funciones emparentadas con filter del frame de
   variaciones, mas filter como referencia, sobre la lista y el predicado de ese
   mismo frame. Las seis llamadas se simulan aqui con el recorrido que hace
   Scala: las tres que recorren la lista completa preguntan por los seis
   elementos y las tres que se detienen en el primer fallo preguntan tres veces.
   Los resultados y el numero de evaluaciones salieron de correr las llamadas
   con Scala 2.13.11, estas ultimas con un predicado que anuncia cada elemento
   que recibe. */
(function () {

  var NUMS = [2, 4, 7, 3, 8, 1];

  var CODIGO = [
    "val nums = List(2, 4, 7, 3, 8, 1)",
    "val par = (x: Int) => x % 2 == 0"
  ];

  function esPar(x) { return x % 2 === 0; }

  function textoLista(xs) {
    return "List(" + xs.join(", ") + ")";
  }

  function textoTupla(xs, ys) {
    return "(" + textoLista(xs) + "," + textoLista(ys) + ")";
  }

  /* El primer elemento que no cumple: donde se detienen takeWhile, dropWhile
     y span, y donde las otras tres siguen de largo. */
  function corte(xs) {
    var i = 0;
    while (i < xs.length && esPar(xs[i])) { i = i + 1; }
    return i;
  }

  /* Una pasada devuelve que salio, a cuantos elementos se les aplico el
     predicado y como quedo marcado cada posicion de la entrada. */
  function pasada(nombre) {
    var c = corte(NUMS);
    var completa = nombre === "filter" || nombre === "filterNot" || nombre === "partition";
    var vistos = completa ? NUMS.length : Math.min(c + 1, NUMS.length);
    var pasan = NUMS.filter(esPar);
    var fallan = NUMS.filter(function (x) { return !esPar(x); });
    var marcas = NUMS.map(function (x, i) {
      if (i >= vistos) { return "sinmirar"; }
      return esPar(x) ? "pasa" : "falla";
    });
    var salida;
    if (nombre === "filter") { salida = textoLista(pasan); }
    if (nombre === "filterNot") { salida = textoLista(fallan); }
    if (nombre === "partition") { salida = textoTupla(pasan, fallan); }
    if (nombre === "takeWhile") { salida = textoLista(NUMS.slice(0, c)); }
    if (nombre === "dropWhile") { salida = textoLista(NUMS.slice(c)); }
    if (nombre === "span") { salida = textoTupla(NUMS.slice(0, c), NUMS.slice(c)); }
    return { salida: salida, evaluaciones: vistos, marcas: marcas };
  }

  var ITEMS = [
    {
      nombre: "filter",
      llamada: "nums.filter(par)",
      cierre: "Conserva los que cumplen y pregunta por todos.",
      opciones: [
        { txt: "List(2, 4, 8)", correcta: true },
        { txt: "List(7, 3, 1)", fallo: "Esos son los que no cumplen, que es lo que devuelve filterNot." },
        { txt: "List(2, 4)", fallo: "Eso saldria si el recorrido se detuviera en el 7. filter sigue preguntando hasta el final, y por eso el 8 entra." }
      ],
      pistaAlta: "Son menos: el predicado no se evalua dos veces sobre el mismo elemento.",
      pistaBaja: "Son mas: filter recorre la lista entera, incluso despues de un elemento que no cumple."
    },
    {
      nombre: "filterNot",
      llamada: "nums.filterNot(par)",
      cierre: "El mismo recorrido completo, con la decision al reves.",
      opciones: [
        { txt: "List(7, 3, 1)", correcta: true },
        { txt: "List(2, 4, 8)", fallo: "Esos son los que cumplen. filterNot conserva los otros." },
        { txt: "List(7, 3, 8, 1)", fallo: "Ahi esta el 8, que es par y por tanto cumple. Ese resultado es el de dropWhile, que lo deja pasar sin mirarlo." }
      ],
      pistaAlta: "Son menos: hay seis elementos y cada uno se pregunta una vez.",
      pistaBaja: "Son mas: negar el predicado no acorta el recorrido."
    },
    {
      nombre: "takeWhile",
      llamada: "nums.takeWhile(par)",
      cierre: "Toma el prefijo que cumple y se detiene en el primero que no.",
      opciones: [
        { txt: "List(2, 4)", correcta: true },
        { txt: "List(2, 4, 8)", fallo: "Eso es filter. takeWhile no vuelve a mirar despues del 7: el 8 queda afuera aunque sea par." },
        { txt: "List(2, 4, 7)", fallo: "El 7 es el que detiene el recorrido, y no entra en el resultado: se toma mientras cumplan." }
      ],
      pistaAlta: "Son menos: el predicado deja de preguntarse en cuanto uno falla.",
      pistaBaja: "Son mas: al 7 tambien se le pregunto, y por eso se supo que habia que parar."
    },
    {
      nombre: "dropWhile",
      llamada: "nums.dropWhile(par)",
      cierre: "Descarta el mismo prefijo y devuelve el resto completo.",
      opciones: [
        { txt: "List(7, 3, 8, 1)", correcta: true },
        { txt: "List(3, 8, 1)", fallo: "El 7 se queda: descarta mientras cumplan, y el 7 no cumple. Ahi termina el descarte." },
        { txt: "List(7, 3, 1)", fallo: "Eso es filterNot. dropWhile no filtra el resto, lo devuelve tal como esta, con el 8 adentro." }
      ],
      pistaAlta: "Son menos: solo se pregunta por el prefijo y por el elemento que lo corta.",
      pistaBaja: "Son mas: devolver cuatro elementos no quiere decir haberlos mirado."
    },
    {
      nombre: "span",
      llamada: "nums.span(par)",
      cierre: "Las dos partes de una sola pasada, en una tupla.",
      opciones: [
        { txt: "(List(2, 4),List(7, 3, 8, 1))", correcta: true },
        { txt: "(List(2, 4, 8),List(7, 3, 1))", fallo: "Esa es la tupla de partition, que reparte por el predicado. span reparte por el punto donde se detuvo." },
        { txt: "(List(2, 4),List(3, 8, 1))", fallo: "El 7 no se pierde: queda a la cabeza de la segunda parte, que es lo que hace util a span dentro de empaquetar." }
      ],
      pistaAlta: "Son menos: una sola pasada, no una por cada parte de la tupla.",
      pistaBaja: "Son mas: hace falta preguntar por el 7 para saber donde cortar."
    },
    {
      nombre: "partition",
      llamada: "nums.partition(par)",
      cierre: "Las dos mitades del predicado, tambien en una sola pasada.",
      opciones: [
        { txt: "(List(2, 4, 8),List(7, 3, 1))", correcta: true },
        { txt: "(List(2, 4),List(7, 3, 8, 1))", fallo: "Esa es la tupla de span, que corta en el primer fallo. partition clasifica los seis elementos." },
        { txt: "(List(2, 4),List(7, 3, 1))", fallo: "Falta el 8 en la primera parte: ningun elemento se pierde, los seis caen en una de las dos." }
      ],
      pistaAlta: "Son menos: cada elemento se pregunta una sola vez, aunque el resultado tenga dos listas.",
      pistaBaja: "Son mas: para clasificar los seis hay que preguntar por los seis."
    }
  ];

  var PARES = [
    {
      llamada: "nums.span(par)",
      cierre: "Una pasada en lugar de dos, y el mismo punto de corte para las dos partes.",
      opciones: [
        { txt: "(nums.takeWhile(par), nums.dropWhile(par))", correcta: true },
        { txt: "(nums.filter(par), nums.filterNot(par))", fallo: "Ese par da (List(2, 4, 8),List(7, 3, 1)), que es partition. span corta en el 7 y no vuelve a mirar." },
        { txt: "(nums.takeWhile(par), nums.filterNot(par))", fallo: "La segunda parte de span es todo lo que viene del 7 en adelante, con el 8 incluido; filterNot lo quitaria." }
      ]
    },
    {
      llamada: "nums.partition(par)",
      cierre: "Las dos listas que dan filter y filterNot, sin recorrer la entrada dos veces.",
      opciones: [
        { txt: "(nums.filter(par), nums.filterNot(par))", correcta: true },
        { txt: "(nums.takeWhile(par), nums.dropWhile(par))", fallo: "Ese par da (List(2, 4),List(7, 3, 8, 1)), que es span. partition no se detiene en el primer impar." },
        { txt: "(nums.filter(par), nums.dropWhile(par))", fallo: "La segunda parte de partition son los que no cumplen; dropWhile devuelve el resto sin filtrarlo." }
      ]
    }
  ];

  var API = {
    NUMS: NUMS, CODIGO: CODIGO, ITEMS: ITEMS, PARES: PARES,
    pasada: pasada, textoLista: textoLista, textoTupla: textoTupla
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ════════════════ la pagina ════════════════ */

  var resueltas = 0;
  var resueltosPares = 0;
  var fallados = 0;

  function construirCodigo() {
    var panel = document.getElementById("panel-codigo");
    CODIGO.forEach(function (texto, i) {
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

  function construirEntrada() {
    var caja = document.getElementById("fila-entrada");
    NUMS.forEach(function (x) {
      var d = document.createElement("div");
      d.className = "caja";
      d.textContent = String(x);
      caja.appendChild(d);
    });
  }

  function marcar() {
    document.getElementById("marcador").textContent =
      "llamadas resueltas: " + resueltas + " de " + ITEMS.length +
      "    ·    opciones falladas: " + fallados;
    document.getElementById("marcador-pares").textContent =
      "resueltas: " + resueltosPares + " de " + PARES.length;
    if (resueltas === ITEMS.length && resueltosPares === PARES.length) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  function pintarPasada(item, caja) {
    var p = pasada(item.nombre);
    var fila = document.createElement("div");
    var leyenda = document.createElement("div");
    var salida = document.createElement("div");
    fila.className = "arreglo";
    NUMS.forEach(function (x, i) {
      var d = document.createElement("div");
      var m = p.marcas[i];
      d.className = "caja" + (m === "pasa" ? " positivo" : m === "falla" ? " negativo" : " sinmirar");
      d.textContent = String(x);
      fila.appendChild(d);
    });
    leyenda.className = "leyenda";
    leyenda.textContent = "verde: se le pregunto y cumple    ·    rojo: se le pregunto y no cumple"
      + "    ·    punteado: el predicado nunca lo vio";
    salida.className = "salida";
    salida.textContent = item.llamada + "  =  " + p.salida;
    caja.appendChild(fila);
    caja.appendChild(leyenda);
    caja.appendChild(salida);
    caja.className = "pasada visible";
  }

  /* El mismo giro que usan las otras actividades: la opcion correcta no cae
     siempre en el primer boton. */
  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  function construirLlamadas() {
    var caja = document.getElementById("llamadas");
    ITEMS.forEach(function (item, indice) {
      var p = pasada(item.nombre);
      var fila = document.createElement("div");
      var llamada = document.createElement("div");
      var ops = document.createElement("div");
      var ver = document.createElement("div");
      var cuantas = document.createElement("div");
      var rotulo = document.createElement("label");
      var campo = document.createElement("input");
      var boton = document.createElement("button");
      var verNum = document.createElement("div");
      var vista = document.createElement("div");
      var estado = { lista: false, numero: false };

      fila.className = "item";
      llamada.className = "llamada";
      llamada.textContent = item.llamada;
      ops.className = "opciones";
      ver.className = "veredicto";
      cuantas.className = "cuantas bloqueado";
      rotulo.textContent = "¿a cuántos elementos se les aplicó el predicado?";
      campo.type = "number";
      campo.min = "0";
      campo.max = String(NUMS.length);
      boton.textContent = "Comprobar";
      verNum.className = "veredicto";
      vista.className = "pasada";

      function completar() {
        if (estado.lista && estado.numero) {
          resueltas = resueltas + 1;
          pintarPasada(item, vista);
        }
        marcar();
      }

      rotar(item.opciones, indice + 1).forEach(function (o) {
        var b = document.createElement("button");
        b.textContent = o.txt;
        b.addEventListener("click", function () {
          if (o.correcta) {
            b.className = "acertada";
            Array.prototype.forEach.call(ops.children, function (x) { x.disabled = true; });
            ver.className = "veredicto bien";
            ver.textContent = item.cierre;
            cuantas.className = "cuantas";
            estado.lista = true;
            completar();
          } else {
            b.className = "errada";
            b.disabled = true;
            ver.className = "veredicto mal";
            ver.textContent = o.fallo;
            fallados = fallados + 1;
            marcar();
          }
        });
        ops.appendChild(b);
      });

      boton.addEventListener("click", function () {
        var v = parseInt(campo.value, 10);
        if (isNaN(v)) {
          verNum.className = "veredicto mal";
          verNum.textContent = "Escriba un número primero.";
          return;
        }
        if (v === p.evaluaciones) {
          campo.className = "bien-celda";
          campo.disabled = true;
          boton.disabled = true;
          verNum.className = "veredicto bien";
          verNum.textContent = "Son " + p.evaluaciones + " de " + NUMS.length + ".";
          estado.numero = true;
          completar();
          return;
        }
        fallados = fallados + 1;
        verNum.className = "veredicto mal";
        verNum.textContent = v > p.evaluaciones ? item.pistaAlta : item.pistaBaja;
        marcar();
      });

      cuantas.appendChild(rotulo);
      cuantas.appendChild(campo);
      cuantas.appendChild(boton);
      fila.appendChild(llamada);
      fila.appendChild(ops);
      fila.appendChild(ver);
      fila.appendChild(cuantas);
      fila.appendChild(verNum);
      fila.appendChild(vista);
      caja.appendChild(fila);
    });
  }

  function construirPares() {
    var caja = document.getElementById("pares");
    PARES.forEach(function (item, indice) {
      var fila = document.createElement("div");
      var llamada = document.createElement("div");
      var ops = document.createElement("div");
      var ver = document.createElement("div");
      fila.className = "item";
      llamada.className = "llamada";
      llamada.textContent = item.llamada + "   equivale a";
      ops.className = "opciones";
      ver.className = "veredicto";
      rotar(item.opciones, indice + 1).forEach(function (o) {
        var b = document.createElement("button");
        b.textContent = o.txt;
        b.addEventListener("click", function () {
          if (o.correcta) {
            b.className = "acertada";
            Array.prototype.forEach.call(ops.children, function (x) { x.disabled = true; });
            ver.className = "veredicto bien";
            ver.textContent = item.cierre;
            resueltosPares = resueltosPares + 1;
          } else {
            b.className = "errada";
            b.disabled = true;
            ver.className = "veredicto mal";
            ver.textContent = o.fallo;
            fallados = fallados + 1;
          }
          marcar();
        });
        ops.appendChild(b);
      });
      fila.appendChild(llamada);
      fila.appendChild(ops);
      fila.appendChild(ver);
      caja.appendChild(fila);
    });
  }

  construirCodigo();
  construirEntrada();
  construirLlamadas();
  construirPares();
  marcar();
})();
