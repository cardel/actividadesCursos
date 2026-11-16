/* La atención paso a paso: consulta, clave, valor, puntajes, softmax y salida
   de un cabezal sobre agosto a noviembre de 2024, con los controles de la
   consulta, y la prueba de barajar los meses. Todo se calcula aquí con Atencion. */
(function () {
  "use strict";

  var A = Atencion, c3 = function (x) { return A.coma(x, 3); }, c2 = function (x) { return A.coma(x, 2); };
  var NOMBRES = ["agosto", "septiembre", "octubre", "noviembre"];
  var base = A.cabezal(1, 4, true), cero = A.cabezal(1, 0, true), ocho = A.cabezal(1, 8, true);
  var sinPos = A.cabezal(1, 4, false), sinPosBar = A.cabezal(1, 4, false, [2, 0, 1, 3]);
  var conBar = A.cabezal(1, 4, true, [2, 0, 1, 3]);

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover los controles",
    definicion: "puntaje(i, j) = q<sub>i</sub> · k<sub>j</sub> / √2 &nbsp;&nbsp; peso(i, j) = e<sup>puntaje(i, j)</sup> / Σ<sub>j</sub> e<sup>puntaje(i, j)</sup>",
    explicacion: "La cuenta de un cabezal sobre cuatro meses. Noviembre es el mes que pronostica: su fila de pesos es la que entra al pronóstico de diciembre.",
    items: [
      { valor: "Noviembre compara su consulta con la clave de cada uno de los cuatro meses. ¿Cuántos puntajes calcula?",
        opciones: ["16", "1", "4"], correcta: 2,
        razon: "4, uno por mes, incluido él mismo. 16 son los de los cuatro meses a la vez, la matriz completa del mapa; 1 sería un solo número para toda la ventana." },
      { valor: "Un mes tiene un puntaje mucho más alto que los otros tres. ¿Qué peso le da softmax?",
        opciones: ["Casi todo el peso", "El que toque al repartir 1 en proporción al puntaje", "Exactamente 1, y 0 a los demás"], correcta: 0,
        razon: "Casi todo: la exponencial agranda las diferencias, pero ningún peso llega a 0 ni a 1. Repartir en proporción al puntaje sería dividir por la suma de puntajes sin exponencial, y fallaría con puntajes negativos." }
    ],
    cierre: "Cada mes reparte un peso de 1 entre los meses de la ventana, según sus puntajes."
  };

  var DESPUES = {
    id: "despues",
    titulo: "5. Con los controles en la mano",
    definicion: null,
    explicacion: "Use las partes 2 y 4 con noviembre como el mes que consulta y la cuenta a la vista.",
    items: [
      { valor: "Ponga la posición en 0 y el valor en 1. ¿Qué mes recibe más peso de noviembre?",
        opciones: NOMBRES.slice(), correcta: 2,
        razon: "Octubre, con " + c3(cero.pesos[3][2]) + ". Sin posición, el puntaje es 0,335 por la diferencia de cada mes, dividido por √2, y octubre tiene la más alta, " + c3(A.Z[2]) +
          ". Los cuatro pesos quedan cerca de ¼: entre " + c3(Math.min.apply(null, cero.pesos[3])) + " y " + c3(Math.max.apply(null, cero.pesos[3])) + "." },
      { valor: "Suba la posición a 8. ¿A qué juego de pesos a mano se parece la fila de noviembre?",
        opciones: ["A los doce meses por igual", "A solo el último mes", "Al mismo mes del año anterior"], correcta: 1,
        razon: "A solo el último mes: noviembre se pone a sí mismo " + c3(ocho.pesos[3][3]) + ". Con la posición multiplicada por 8, el último lugar de la ventana gana el puntaje más alto." },
      { valor: "Con la posición en ceros, ¿qué pasa con la salida de noviembre al barajar los otros tres meses?",
        opciones: ["Queda igual", "Sube, porque octubre queda primero", "Baja, porque octubre queda primero"], correcta: 0,
        razon: "Queda en " + c3(sinPos.salida[3]) + " en los dos órdenes. Los puntajes dependen solo de las diferencias: barajar cambia de lugar los pesos y la suma da lo mismo. Con posición pasa de " +
          c3(base.salida[3]) + " a " + c3(conBar.salida[3]) + "." },
      { valor: "Frente a los pesos a mano de la sesión, ¿qué tiene de nuevo la atención?",
        opciones: ["Mira más meses de la ventana que una media ponderada", "Los pesos cambian con los números de cada ventana", "No tiene parámetros que se entrenen con los datos"], correcta: 1,
        razon: "Los pesos salen de la consulta y las claves, que dependen de las diferencias de esa ventana. Una media ponderada también mira toda la ventana; y W<sub>q</sub>, W<sub>k</sub> y W<sub>v</sub> son parámetros que la red entrena." }
    ],
    cierre: "Los pesos dependen de la ventana y de las matrices; el orden lo pone la posición."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES };
    return;
  }

  var P = Pronostico, estado = { valor: 1, posicion: 4, i: 3, orden: "orden", conpos: "si", ver: false };
  var cValor = document.getElementById("valor"), cPos = document.getElementById("posicion");

  function cuenta() { return A.cabezal(estado.valor, estado.posicion, true); }

  /* Las opciones de un número: la correcta y las equivocadas de verdad, sin repetir valores. */
  function sinRepetir(lista) {
    var vistos = {};
    return lista.filter(function (o) {
      if (vistos[o.valor]) { return false; }
      vistos[o.valor] = true;
      return true;
    });
  }

  function dibujar() {
    var r = cuenta(), i = estado.i, fila = r.puntajes[i];
    document.getElementById("valor-n").textContent = A.coma(estado.valor, 1);
    document.getElementById("posicion-n").textContent = A.coma(estado.posicion, 1);
    var e = fila.map(function (s) { return Math.exp(s); }), suma = e.reduce(function (a, b) { return a + b; }, 0);
    var cabeza = ["Mes", "x = (z; p)", "clave k", "valor v"];
    if (estado.ver) { cabeza = cabeza.concat(["puntaje", "e<sup>puntaje</sup>", "peso", "peso × v"]); }
    document.getElementById("tabla").innerHTML = P.tabla(cabeza, [0, 1, 2, 3].map(function (j) {
      var celdas = [NOMBRES[j], "(" + c3(r.z[j]) + "; " + c2(r.p[j]) + ")", "(" + c3(r.K[j][0]) + "; " + c2(r.K[j][1]) + ")", c3(r.z[j])];
      return estado.ver ? celdas.concat([c3(fila[j]), c3(e[j]), c3(r.pesos[i][j]), c3(r.pesos[i][j] * r.z[j])]) : celdas;
    }));
    var consulta = "Consulta de " + NOMBRES[i] + ": q = (" + A.coma(estado.valor, 1) + " × " + c3(r.z[i]) + "; " +
      A.coma(estado.posicion, 1) + " × " + c2(r.p[i]) + ") = (" + c3(r.Q[i][0]) + "; " + c2(r.Q[i][1]) + ").";
    document.getElementById("lectura").innerHTML = consulta + (estado.ver ? " Suma de las exponenciales: " + c3(suma) +
      ". Salida: <b>" + c3(r.salida[i]) + "</b>, una media ponderada de las cuatro diferencias." : "");
    document.getElementById("mapa").innerHTML = estado.ver ? A.mapa(r.pesos, A.NOMBRES, i) : "";
    preguntas.forEach(function (p) { p.refrescar(); });
  }

  var preguntas = [];
  function preguntar() {
    if (typeof Motor.opcionesNumericas !== "function") { return; }
    preguntas.push(Motor.opcionesNumericas("op-puntaje", "ver-puntaje", function () {
      var r = cuenta(), i = estado.i, q = r.Q[i], k = r.K[0], qk = q[0] * k[0] + q[1] * k[1];
      document.getElementById("pregunta-puntaje").innerHTML = "<b>a.</b> ¿Cuánto vale el puntaje de " + NOMBRES[i] + " con agosto?";
      return sinRepetir([
        { valor: c3(qk / Math.SQRT2), clave: "correcta", razon: "(" + c3(q[0]) + " × " + c3(k[0]) + " + " + c2(q[1]) + " × " + c2(k[1]) + ") / √2 = " + c3(qk / Math.SQRT2) + "." },
        { valor: c3(qk), clave: "sin-raiz", razon: "Es q · k sin dividir por √2. La división evita que los puntajes crezcan con el número de columnas." },
        { valor: c3((q[0] * q[0] + q[1] * q[1]) / Math.SQRT2), clave: "consigo", razon: "Es la consulta por sí misma. El puntaje con agosto usa la clave de agosto, (" + c3(k[0]) + "; " + c2(k[1]) + ")." },
        { valor: c3(qk / 2), clave: "entre-dos", razon: "Es q · k dividido por 2. Se divide por la raíz de 2, la dimensión de las claves, no por 2." }
      ]);
    }));
    preguntas.push(Motor.opcionesNumericas("op-peso", "ver-peso", function () {
      var r = cuenta(), i = estado.i, fila = r.puntajes[i];
      var sumaP = fila.reduce(function (a, b) { return a + b; }, 0);
      document.getElementById("pregunta-peso").innerHTML = "<b>b.</b> ¿Qué peso pone " + NOMBRES[i] + " en sí mismo?";
      return sinRepetir([
        { valor: c3(r.pesos[i][i]), clave: "correcta", razon: "e<sup>" + c3(fila[i]) + "</sup> dividido por la suma de las cuatro exponenciales da " + c3(r.pesos[i][i]) + "." },
        { valor: c3(fila[i] / sumaP), clave: "sin-exp", razon: "Es el puntaje dividido por la suma de los puntajes, sin la exponencial. Softmax divide exponenciales." },
        { valor: c3(0.25), clave: "cuarto", razon: "Es repartir por igual entre cuatro meses. Los pesos salen de los puntajes, y aquí no son iguales." },
        { valor: c3(Math.exp(fila[i])), clave: "sin-suma", razon: "Es e<sup>puntaje</sup> sin dividir por la suma: no es un peso, porque los cuatro no sumarían 1." }
      ]);
    }));
    preguntas.push(Motor.opcionesNumericas("op-salida", "ver-salida", function () {
      var r = cuenta(), i = estado.i;
      var media = r.z.reduce(function (a, b) { return a + b; }, 0) / 4;
      var mezcla = r.pesos[i].reduce(function (a, w, j) { return a + w * r.puntajes[i][j]; }, 0);
      document.getElementById("pregunta-salida").innerHTML = "<b>c.</b> ¿Cuánto vale la salida de " + NOMBRES[i] + "?";
      return sinRepetir([
        { valor: c3(r.salida[i]), clave: "correcta", razon: "La suma de peso por valor de los cuatro meses: " + c3(r.salida[i]) + "." },
        { valor: c3(media), clave: "media", razon: "Es la media simple de las cuatro diferencias: pesos de ¼, como si no hubiera atención." },
        { valor: c3(r.z[i]), clave: "propio", razon: "Es la diferencia del propio mes. Sería la salida solo si se pusiera todo el peso a sí mismo." },
        { valor: c3(mezcla), clave: "puntajes", razon: "Es la suma de peso por puntaje. Lo que se pondera son los valores, no los puntajes." }
      ]);
    }));
  }

  function barajar() {
    var orden = estado.orden === "orden" ? null : [2, 0, 1, 3], con = estado.conpos === "si";
    var r = A.cabezal(1, 4, con, orden), rotulos = (orden || [0, 1, 2, 3]).map(function (k) { return A.NOMBRES[k]; });
    document.getElementById("lectura-barajar").innerHTML = "Con valor 1 y posición 4. Pesos de noviembre sobre " + rotulos.join(", ") + ": " +
      r.pesos[3].map(c3).join("; ") + ". Salida de noviembre: <b>" + c3(r.salida[3]) + "</b>.";
    document.getElementById("mapa-barajar").innerHTML = A.mapa(r.pesos, rotulos, 3);
  }

  cValor.addEventListener("input", function () { estado.valor = Number(cValor.value); dibujar(); });
  cPos.addEventListener("input", function () { estado.posicion = Number(cPos.value); dibujar(); });
  P.selector("consulta", function (v) { estado.i = Number(v); dibujar(); });
  P.selector("orden", function (v) { estado.orden = v; barajar(); });
  P.selector("ver", function (v) { estado.ver = v === "si"; dibujar(); });
  P.selector("conpos", function (v) { estado.conpos = v; barajar(); });
  preguntar();
  dibujar();
  barajar();

  document.getElementById("cierre-tabla").innerHTML = P.tabla(["", "Qué", "Lo que lo muestra"], [
    ["Ventaja", "Los pesos salen de la ventana", "Con valor 1, noviembre pone " + c3(cero.pesos[3][3]) + " en sí mismo si la posición vale 0, " + c3(base.pesos[3][3]) +
      " si vale 4 y " + c3(ocho.pesos[3][3]) + " si vale 8. Una media ponderada tiene un solo juego de pesos."],
    ["Ventaja", "Cada mes mira a todos en un paso", "Noviembre llega a agosto con el mismo cálculo que a octubre: el mapa tiene 16 pesos y ninguno pasa por los meses de en medio."],
    ["Limitación", "No ve el orden por sí sola", "Con la posición en ceros, barajar deja la salida en " + c3(sinPos.salida[3]) + " y " + c3(sinPosBar.salida[3]) + "."],
    ["Limitación", "Las matrices hay que aprenderlas", "Aquí W<sub>q</sub>, W<sub>k</sub> y W<sub>v</sub> se pusieron a mano; en la red se entrenan con los datos, y con 16 números por mes son 4 matrices de 16 × 16."]
  ]);
  document.getElementById("cierre-texto").textContent =
    "La atención es una media ponderada con pesos que se calculan. Que esos pesos sirvan depende de que las matrices se aprendan bien, y eso pide datos.";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
