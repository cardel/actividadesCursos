/* intercalaciones: cuantas salidas admite un programa con un hilo y un join.
   El programa es el del deck de principios de concurrencia, con su salida de
   ejemplo. Las intercalaciones no estan escritas a mano: se generan mezclando
   la secuencia del hilo principal con la del hilo nuevo, respetando el orden
   interno de cada uno y descartando las que violan la barrera del join. Con
   el join quedan 3 salidas distintas; sin el join, 4. */
(function () {

  var CODIGO = [
    "val t = thread { log(\"Hilo nuevo corriendo\") }",
    "log(\"...\")",
    "log(\"...\")",
    "t.join()",
    "log(\"Hilo nuevo terminado\")"
  ];

  var CORRIENDO = "Thread-0: Hilo nuevo corriendo";
  var PUNTOS = "main: ...";
  var TERMINADO = "main: Hilo nuevo terminado";

  var PRINCIPAL = [
    { id: "m1", txt: PUNTOS },
    { id: "m2", txt: PUNTOS },
    { id: "join", txt: null },
    { id: "m3", txt: TERMINADO }
  ];
  var NUEVO = [{ id: "h", txt: CORRIENDO }];

  /* Mezcla dos secuencias conservando el orden interno de cada una. */
  function mezclas(a, b) {
    if (a.length === 0) { return [b.slice()]; }
    if (b.length === 0) { return [a.slice()]; }
    var conA = mezclas(a.slice(1), b).map(function (r) { return [a[0]].concat(r); });
    var conB = mezclas(a, b.slice(1)).map(function (r) { return [b[0]].concat(r); });
    return conA.concat(conB);
  }

  /* Con join, el cuerpo del hilo nuevo tiene que quedar antes de la barrera. */
  function respetaBarrera(orden) {
    var iH = -1;
    var iJoin = -1;
    orden.forEach(function (e, i) {
      if (e.id === "h") { iH = i; }
      if (e.id === "join") { iJoin = i; }
    });
    return iH < iJoin;
  }

  function salidas(conJoin) {
    var todas = mezclas(PRINCIPAL, NUEVO);
    var validas = conJoin ? todas.filter(respetaBarrera) : todas;
    var vistas = [];
    var fuera = [];
    validas.forEach(function (orden) {
      var lineas = orden.filter(function (e) { return e.txt !== null; })
                        .map(function (e) { return e.txt; });
      var clave = lineas.join(" | ");
      if (vistas.indexOf(clave) < 0) {
        vistas.push(clave);
        fuera.push(lineas);
      }
    });
    return fuera;
  }

  var CON_JOIN = salidas(true);
  var SIN_JOIN = salidas(false);

  /* --- Carta 2: salidas posibles e imposibles ------------------------ */
  /* Tres de cada lado, para que la respuesta no caiga siempre del mismo. */

  var CANDIDATOS = [
    {
      lineas: [PUNTOS, CORRIENDO, PUNTOS, TERMINADO],
      posible: true,
      razon: "Es la salida que trae el deck. El hilo nuevo alcanzó a imprimir entre los dos mensajes del principal."
    },
    {
      lineas: [PUNTOS, PUNTOS, TERMINADO, CORRIENDO],
      posible: false,
      razon: "El join está antes del último mensaje del principal, así que el hilo nuevo no puede imprimir después de terminado."
    },
    {
      lineas: [CORRIENDO, PUNTOS, PUNTOS, TERMINADO],
      posible: true,
      razon: "El hilo nuevo puede ganar la carrera y escribir antes de que el principal llegue a su primera línea."
    },
    {
      lineas: [CORRIENDO, TERMINADO, PUNTOS, PUNTOS],
      posible: false,
      razon: "Dentro del principal el orden es fijo: los dos puntos suspensivos van antes del join, y terminado va después."
    },
    {
      lineas: [PUNTOS, PUNTOS, CORRIENDO, TERMINADO],
      posible: true,
      razon: "El principal llega al join y se queda esperando; el hilo nuevo imprime ahí y recién entonces sale terminado."
    },
    {
      lineas: [PUNTOS, CORRIENDO, TERMINADO, PUNTOS],
      posible: false,
      razon: "Terminado es la última línea del principal. Ningún mensaje suyo puede salir después."
    }
  ];

  /* --- Carta 3: lo que el no determinismo obliga --------------------- */

  var RAZONES = [
    {
      expr: "veinte corridas, la misma salida las veinte veces",
      pregunta: "¿Qué se puede concluir de ahí?",
      cierre: "Nada sobre las demás intercalaciones. Un programa concurrente se razona sobre todas las ejecuciones posibles, y la que rompe puede ser la menos frecuente.",
      opciones: [
        { txt: "que el planificador de esta máquina resuelve siempre igual, así que la salida no va a cambiar", fallo: "El planificador no promete repetir: la misma máquina, con otra carga, reparte los turnos de otro modo. Veinte corridas no cubren las tres salidas posibles.", larga: true },
        { txt: "nada sobre las otras intercalaciones, que siguen siendo posibles", correcta: true, larga: true },
        { txt: "que el programa es correcto, porque veinte corridas sin un fallo son muestra suficiente", fallo: "Probar y ver que funcionó no prueba nada aquí. La intercalación que rompe puede ser la que casi nunca sale, y basta con que salga una vez.", larga: true }
      ]
    },
    {
      expr: "t.join()",
      pregunta: "¿Qué ordena el join en esta salida?",
      cierre: "Que la línea del hilo nuevo salga antes que terminado. Lo que el hilo nuevo haga frente a los dos puntos suspensivos queda sin decidir.",
      opciones: [
        { txt: "que la línea del hilo nuevo salga antes que los dos puntos suspensivos del principal", fallo: "El join está escrito después de esas dos líneas, así que no las ordena. De hecho el hilo nuevo puede imprimir antes, en medio o después de ellas.", larga: true },
        { txt: "que el hilo nuevo imprima primero que todo, porque se lanzó en la primera línea", fallo: "Lanzar un hilo no es hacerlo correr primero. start devuelve el control de inmediato y el principal puede adelantarse.", larga: true },
        { txt: "que la línea del hilo nuevo salga antes que terminado", correcta: true, larga: true }
      ]
    },
    {
      expr: "el mismo programa sin la línea t.join()",
      pregunta: "¿Cuántas salidas distintas quedan?",
      cierre: "Cuatro. La línea del hilo nuevo puede caer en cualquiera de los cuatro huecos de la secuencia del principal, incluido el de después de terminado.",
      opciones: [
        { txt: "cuatro", correcta: true },
        { txt: "tres, las mismas de antes", fallo: "Sin la barrera se suma una salida: la que imprime la línea del hilo nuevo después de terminado. Antes eran tres porque el join la prohibía." },
        { txt: "una, porque sin join el programa termina y el hilo nuevo no alcanza a imprimir", fallo: "La JVM no se cierra mientras quede un hilo corriendo, así que la línea sale igual. Lo que se pierde es el control de cuándo.", larga: true }
      ]
    },
    {
      expr: "¿cuándo es correcto un programa concurrente?",
      pregunta: "Escoja el criterio.",
      cierre: "Cuando todas sus intercalaciones posibles producen un resultado aceptable. Una sola traza buena no dice nada de las demás.",
      opciones: [
        { txt: "cuando la intercalación más probable produce el resultado esperado", fallo: "La probabilidad no entra en el criterio. Una intercalación rara que entrega un resultado inaceptable deja incorrecto al programa.", larga: true },
        { txt: "cuando existe al menos una intercalación que produce el resultado esperado", fallo: "Eso lo cumple casi cualquier programa roto: la carrera del generador de identificadores también tiene intercalaciones en que todo sale bien.", larga: true },
        { txt: "cuando el programa no comparte memoria entre hilos", fallo: "No compartir estado mutable evita las carreras, y es el camino de este curso, pero el criterio de corrección es otro: hay que mirar todas las ejecuciones posibles.", larga: true },
        { txt: "cuando todas sus intercalaciones posibles producen un resultado aceptable", correcta: true, larga: true }
      ]
    }
  ];

  function verificar() {
    return {
      conJoin: CON_JOIN.length,
      sinJoin: SIN_JOIN.length,
      posibles: CANDIDATOS.filter(function (c) { return c.posible; }).length,
      imposibles: CANDIDATOS.filter(function (c) { return !c.posible; }).length,
      candidatosCoherentes: CANDIDATOS.every(function (c) {
        var clave = c.lineas.join(" | ");
        var esta = CON_JOIN.some(function (s) { return s.join(" | ") === clave; });
        return esta === c.posible;
      })
    };
  }

  var API = {
    CODIGO: CODIGO, CANDIDATOS: CANDIDATOS, RAZONES: RAZONES,
    CON_JOIN: CON_JOIN, SIN_JOIN: SIN_JOIN, salidas: salidas, verificar: verificar
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================ la pagina ================ */

  var resueltos = { candidatos: 0, razones: 0 };
  var fallados = 0;

  function marcar() {
    document.getElementById("marcador-candidatos").textContent =
      "decididas: " + resueltos.candidatos + " de " + CANDIDATOS.length;
    document.getElementById("marcador-razones").textContent =
      "resueltas: " + resueltos.razones + " de " + RAZONES.length +
      "    ·    opciones falladas: " + fallados;
    if (resueltos.candidatos === CANDIDATOS.length &&
        resueltos.razones === RAZONES.length) {
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

  /* --- la prediccion del numero de salidas --- */

  function opcionesPrediccion() {
    var correcta = CON_JOIN.length;
    var lista = [
      { valor: correcta, clave: "correcta",
        razon: "Tres. El hilo nuevo puede imprimir antes de la primera línea del principal, " +
          "entre las dos, o mientras el principal espera en el join; después de terminado no, porque el join lo impide." },
      { valor: SIN_JOIN.length, clave: "sin-join",
        razon: "Esas son las salidas que quedan sin el join. Con él, la línea del hilo nuevo no puede salir después de terminado, y esa salida se descarta." },
      { valor: PRINCIPAL.length + NUEVO.length, clave: "sin-fusionar",
        razon: "Eso cuenta las intercalaciones sin el join y sin fundir las que imprimen lo mismo. Con el join el hilo nuevo no cabe después de la barrera, y las dos líneas de puntos son idénticas." },
      { valor: 1, clave: "una",
        razon: "Esa es la salida del deck, y es solo una de las posibles. El hilo nuevo puede imprimir en más de un hueco antes del join." }
    ];
    var vistos = [];
    return lista.filter(function (o) {
      var nuevo = vistos.indexOf(o.valor) < 0;
      if (nuevo) { vistos.push(o.valor); }
      return nuevo;
    });
  }

  function cablearPrediccion() {
    var opciones = opcionesPrediccion();
    var caja = document.getElementById("opciones-salidas");
    var v = document.getElementById("veredicto");
    var giro = (opciones.length + CON_JOIN.length) % opciones.length;
    opciones.slice(giro).concat(opciones.slice(0, giro)).forEach(function (o) {
      var b = document.createElement("button");
      b.setAttribute("data-op", o.clave);
      b.textContent = o.valor;
      b.addEventListener("click", function () {
        v.className = "veredicto " + (o.clave === "correcta" ? "bien" : "mal");
        v.textContent = o.razon;
        if (o.clave === "correcta") { mostrarSalidas(); }
      });
      caja.appendChild(b);
    });
  }

  function mostrarSalidas() {
    var caja = document.getElementById("salidas");
    if (caja.childNodes.length > 0) { return; }
    CON_JOIN.forEach(function (lineas, i) {
      var titulo = document.createElement("p");
      titulo.className = "nota";
      titulo.style.margin = "0.5rem 0 0.2rem";
      titulo.textContent = "Salida " + (i + 1);
      var bloque = document.createElement("div");
      bloque.className = "codigo";
      lineas.forEach(function (l) {
        var div = document.createElement("div");
        var num = document.createElement("span");
        var txt = document.createElement("span");
        div.className = "linea";
        num.className = "num";
        num.textContent = "";
        txt.className = "txt";
        txt.textContent = l;
        div.appendChild(num);
        div.appendChild(txt);
        bloque.appendChild(div);
      });
      caja.appendChild(titulo);
      caja.appendChild(bloque);
    });
  }

  /* --- los candidatos: posible o imposible --- */

  function construirCandidatos() {
    var caja = document.getElementById("candidatos");
    CANDIDATOS.forEach(function (c) {
      var item = document.createElement("div");
      item.className = "item";
      var bloque = document.createElement("div");
      bloque.className = "codigo";
      c.lineas.forEach(function (l) {
        var div = document.createElement("div");
        var num = document.createElement("span");
        var txt = document.createElement("span");
        div.className = "linea";
        num.className = "num";
        num.textContent = "";
        txt.className = "txt";
        txt.textContent = l;
        div.appendChild(num);
        div.appendChild(txt);
        bloque.appendChild(div);
      });
      var ops = document.createElement("div");
      ops.className = "opciones";
      var ver = document.createElement("div");
      ver.className = "veredicto";
      [["Posible", true], ["Imposible", false]].forEach(function (par) {
        var b = document.createElement("button");
        b.textContent = par[0];
        b.addEventListener("click", function () {
          if (par[1] === c.posible) {
            b.className = b.className.replace(" errada", "") + " acertada";
            Array.prototype.forEach.call(ops.children, function (x) { x.disabled = true; });
            ver.className = "veredicto bien";
            ver.textContent = c.razon;
            resueltos.candidatos = resueltos.candidatos + 1;
          } else {
            b.className = b.className + " errada";
            b.disabled = true;
            ver.className = "veredicto mal";
            ver.textContent = c.posible
              ? "Esta salida sí ocurre. Mezcle las dos secuencias respetando el orden interno de cada hilo y verá dónde cabe la línea del hilo nuevo."
              : "Esta salida no puede ocurrir. Compare el orden de las líneas del hilo principal con el sitio donde está escrito el join.";
            fallados = fallados + 1;
          }
          marcar();
        });
        ops.appendChild(b);
      });
      item.appendChild(bloque);
      item.appendChild(ops);
      item.appendChild(ver);
      caja.appendChild(item);
    });
  }

  /* --- las preguntas de opciones --- */

  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  function construirRazones() {
    var caja = document.getElementById("razones");
    RAZONES.forEach(function (item, indice) {
      var contenedor = document.createElement("div");
      var expr = document.createElement("div");
      var preg = document.createElement("div");
      var ops = document.createElement("div");
      var ver = document.createElement("div");
      contenedor.className = "item";
      expr.className = "expr";
      expr.textContent = item.expr;
      preg.className = "pregunta";
      preg.textContent = item.pregunta;
      ops.className = "opciones";
      ver.className = "veredicto";
      rotar(item.opciones, indice + 1).forEach(function (o) {
        var b = document.createElement("button");
        b.textContent = o.txt;
        if (o.larga) { b.className = "larga"; }
        b.addEventListener("click", function () {
          if (o.correcta) {
            b.className = b.className.replace(" errada", "") + " acertada";
            Array.prototype.forEach.call(ops.children, function (x) { x.disabled = true; });
            ver.className = "veredicto bien";
            ver.textContent = item.cierre;
            resueltos.razones = resueltos.razones + 1;
          } else {
            b.className = b.className + " errada";
            b.disabled = true;
            ver.className = "veredicto mal";
            ver.textContent = o.fallo;
            fallados = fallados + 1;
          }
          marcar();
        });
        ops.appendChild(b);
      });
      contenedor.appendChild(expr);
      contenedor.appendChild(preg);
      contenedor.appendChild(ops);
      contenedor.appendChild(ver);
      caja.appendChild(contenedor);
    });
  }

  construirCodigo("codigo-programa", CODIGO);
  cablearPrediccion();
  construirCandidatos();
  construirRazones();
  marcar();
})();
