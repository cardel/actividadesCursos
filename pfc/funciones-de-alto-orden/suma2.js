/* Suma2: suma2(f, prox) devuelve sumaF sin correrla. Se predice el valor de
   g(1, 3) + g(4, 5) y cuántas veces corre el if de sumaF, y los contadores
   lo confirman. Los números (15, 7 y 0) salen de 04_funciones_devuelven_
   funciones.scala corrido con scala-cli. */
(function () {
  var CODIGO = [
    { txt: "def suma2(f: Int => Int, prox: Int => Int): (Int, Int) => Int = {", num: null },
    { txt: "  def sumaF(a: Int, b: Int): Int =", num: null },
    { txt: "    if (a > b) 0", num: 1 },
    { txt: "    else f(a) + sumaF(prox(a), b)", num: 2 },
    { txt: "  sumaF", num: 3 },
    { txt: "}", num: null },
    { txt: "", num: null },
    { txt: "val g = suma2(x => x, x => x + 1)", num: 4 },
    { txt: "g(1, 3) + g(4, 5)", num: 5 }
  ];

  function llamada(a, b, pasos, rotulo) {
    var acumulado = 0, x = a;
    while (x <= b) {
      pasos.push({ linea: 1, a: x, b: b, llamada: rotulo, acumulado: null });
      pasos.push({ linea: 2, a: x, b: b, llamada: rotulo, acumulado: null });
      x = x + 1;
    }
    pasos.push({ linea: 1, a: x, b: b, llamada: rotulo, acumulado: 0 });
    while (x > a) { x = x - 1; acumulado = acumulado + x; pasos.push({ linea: null, a: x, b: b, llamada: rotulo + " sube", acumulado: acumulado }); }
    return acumulado;
  }

  function simular() {
    var pasos = [];
    pasos.push({ linea: 4, a: "–", b: "–", llamada: "val g", acumulado: null });
    pasos.push({ linea: 3, a: "–", b: "–", llamada: "val g", acumulado: null });
    pasos.push({ linea: 5, a: "–", b: "–", llamada: "g(1, 3) + g(4, 5)", acumulado: null });
    var v1 = llamada(1, 3, pasos, "g(1, 3)");
    var v2 = llamada(4, 5, pasos, "g(4, 5)");
    pasos.push({ linea: 5, a: "–", b: "–", llamada: "g(1, 3) + g(4, 5)", acumulado: v1 + v2 });
    return pasos;
  }

  function cuenta(pasos, linea) { return pasos.filter(function (p) { return p.linea === linea; }).length; }

  var API = { CODIGO: CODIGO, simular: simular, cuenta: cuenta };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  var PASOS = simular();
  var RESPUESTAS = { valor: 15, ifs: cuenta(PASOS, 1), ifsVal: 0 };
  var acertadas = {};

  function sinRepetidos(lista) {
    var vistos = {}, salida = [];
    lista.forEach(function (o) {
      if (!vistos[o.valor]) { vistos[o.valor] = true; salida.push(o); }
    });
    return salida;
  }

  function opcionesDe(id, buena, malas) {
    Motor.opcionesNumericas("opciones-" + id, "ver-" + id, function () {
      var lista = [{ valor: buena.valor, clave: "correcta", razon: buena.razon }];
      malas.forEach(function (m, n) { lista.push({ valor: m[0], clave: "mala" + n, razon: m[1] }); });
      return sinRepetidos(lista);
    });
    document.getElementById("opciones-" + id).addEventListener("click", function (ev) {
      var clave = ev.target.getAttribute ? ev.target.getAttribute("data-op") : null;
      if (clave === "correcta") { acertadas[id] = true; }
      if (Object.keys(acertadas).length === 3) { document.getElementById("carta-cierre").classList.remove("bloqueado"); }
    });
  }

  opcionesDe("valor",
    { valor: RESPUESTAS.valor, razon: "Correcto: (1 + 2 + 3) + (4 + 5) = 6 + 9 = 15." },
    [[6, "Eso es solo g(1, 3). Falta sumarle g(4, 5) = 9."],
     [9, "Eso es solo g(4, 5). Falta sumarle g(1, 3) = 6."],
     [7, "Dejó fuera el extremo b de cada rango. El if es a > b, así que b sí se suma: g(1, 3) = 1 + 2 + 3."]]);
  opcionesDe("ifs",
    { valor: RESPUESTAS.ifs, razon: "Correcto: 7. Cada llamada a sumaF evalúa el if una vez, incluida la que cierra: 4 en g(1, 3) y 3 en g(4, 5)." },
    [[5, "Eso son los términos sumados, 3 + 2. Cada rango hace además una llamada que llega con a > b, y también evalúa el if."],
     [4, "Eso es solo g(1, 3): tres términos y la llamada que cierra. Falta g(4, 5), que aporta 3."],
     [2, "Eso es una evaluación por cada llamada a g. Cada g recorre su rango y evalúa el if en cada llamada a sumaF."]]);
  opcionesDe("ifsVal",
    { valor: RESPUESTAS.ifsVal, razon: "Correcto: 0. suma2 define sumaF y la devuelve; no la llama. Hasta que no llega un rango, no hay nada que sumar." },
    [[1, "En val g = suma2(…) el if no corre ni una vez: suma2 solo fabrica sumaF y la devuelve. Correrá cuando g reciba a y b."],
     [RESPUESTAS.ifs, "Esas son todas, pero ocurren después, al evaluar g(1, 3) + g(4, 5). La línea val g no llama a sumaF."],
     [2, "Pasar f y prox como argumentos no las evalúa ni evalúa el if: suma2 solo las guarda dentro de sumaF."]]);

  Motor.iniciar({
    codigo: CODIGO,
    paramsIniciales: 0,
    chips: [
      { campo: "llamada", rotulo: "en" },
      { campo: "a", rotulo: "a" },
      { campo: "b", rotulo: "b" },
      { campo: "acumulado", rotulo: "acumulado", clase: "alerta" }
    ],
    simular: function () { return PASOS; },
    alPintar: function (e) {
      var pie = document.getElementById("pie");
      if (!e.actual) { pie.textContent = ""; }
      else if (e.actual.linea === 4 || e.actual.linea === 3) { pie.textContent = "suma2 corre, define sumaF y la devuelve. El if de sumaF va en × 0."; }
      else if (e.terminado) { pie.textContent = "Fin: 6 + 9 = 15. El if corrió " + e.conteos[1] + " veces, todas después del val."; }
      else { pie.textContent = "El if lleva × " + (e.conteos[1] || 0) + "."; }
    }
  });
})();
