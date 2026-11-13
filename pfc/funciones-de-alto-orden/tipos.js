/* Tipos: qué tipo tiene cada expresión con grupos de paréntesis, y la
   trampa de restaC(5). Los cinco tipos se verificaron con el compilador
   ascribiéndolos; los dos valores (2 y −2) salen de 16_error_currificacion. */
(function () {
  var PREGUNTAS = [
    { expr: "suma4(x => x)", correcta: "(Int => Int) => (Int, Int) => Int",
      opciones: [ "Int => Int", "Int","(Int => Int) => (Int, Int) => Int", "(Int, Int) => Int"],
      msg: {
        "(Int => Int) => (Int, Int) => Int": "Correcto. Se llenó el primer grupo; quedan dos por llenar: prox, y después (a, b). Una función que espera prox y devuelve la que espera el rango.",
        "(Int, Int) => Int": "No. Ese es el tipo después de dar también prox. Con un solo grupo llenado falta el de prox antes del rango.",
        "Int => Int": "No. Falta más de un argumento: prox (una función) y luego a y b. El tipo tiene que reflejar los dos grupos que quedan.",
        "Int": "No. suma4 con un solo grupo no calcula nada todavía: devuelve una función. Solo da un Int cuando se llenan los tres grupos." } },
    { expr: "suma4(x => x)(x => x + 1)", correcta: "(Int, Int) => Int",
      opciones: [ "Int => Int => Int", "Int", "(Int => Int) => Int","(Int, Int) => Int"],
      msg: {
        "(Int, Int) => Int": "Correcto. Dos grupos llenos; queda el del rango, que recibe a y b juntos y devuelve el Int.",
        "Int => Int => Int": "No. El último grupo es (a: Int, b: Int), dos parámetros en un solo grupo: se reciben juntos, no uno por uno.",
        "Int": "No. Falta el rango. suma4(x => x)(x => x + 1)(1, 10) sí es un Int: 55.",
        "(Int => Int) => Int": "No. Ya se dieron las dos funciones; lo que falta son los dos enteros del rango." } },
    { expr: "sumaC(2)", correcta: "Int => Int",
      opciones: ["Int => Int", "Int", "(Int, Int) => Int", "Int => Int => Int"],
      msg: {
        "Int => Int": "Correcto. sumaC(2) es la función que suma 2: espera b y devuelve 2 + b.",
        "Int": "No. sumaC(2) no ha sumado nada: falta b. sumaC(2)(3) sí es 5.",
        "(Int, Int) => Int": "No. Solo falta un argumento, b, y va en su propio grupo.",
        "Int => Int => Int": "No. Ese es el tipo de sumaC entera, sin llenar ningún grupo. Con el 2 puesto queda un solo grupo." } },
    { expr: "derivada(cube, 0.1)", correcta: "Double => Double",
      opciones: [ "(Double, Double) => Double","Double => Double", "Double", "(Double => Double) => Double"],
      msg: {
        "Double => Double": "Correcto. derivada devuelve una función de una variable, del mismo tipo que cube. Por eso se le puede volver a pasar a derivada.",
        "Double": "No. Falta el x donde evaluar: derivada(cube, 0.1)(2) sí es un Double.",
        "(Double => Double) => Double": "No. La función devuelta recibe un número, no una función. derivada ya recibió su función.",
        "(Double, Double) => Double": "No. derivada tiene dos parámetros, pero lo que devuelve es un literal de un solo parámetro: x." } },
    { expr: "sumador (la función misma, sin aplicar)", correcta: "Int => Int => Int",
      opciones: [ "(Int, Int) => Int", "Int","Int => Int => Int", "Int => Int"],
      msg: {
        "Int => Int => Int": "Correcto. Recibe n y devuelve una función Int => Int. La flecha asocia a la derecha: Int => (Int => Int).",
        "Int => Int": "No. Ese es el tipo de sumador(5), después de darle n. sumador solo todavía espera n.",
        "(Int, Int) => Int": "No. sumador(5, 3) no compila: n y x no se reciben juntos. Se recibe n, se devuelve una función, y esa recibe x.",
        "Int": "No. sumador es una función, y su resultado también lo es." } }
  ];

  var TRAMPA = [
    { id: "menosCinco", expr: "menosCinco(3)", def: "val menosCinco = restaC(5)", valor: 2,
      bien: "Correcto: restaC(5) fija a = 5, el minuendo. menosCinco(3) es 5 − 3 = 2. El nombre engaña: no resta cinco, resta desde cinco.",
      malas: [[-2, "Eso es 3 − 5: leyó el nombre y restó cinco a 3. restaC(5) fija a = 5, el minuendo, así que queda 5 − 3."],
              [8, "Eso es 5 + 3: sumó. restaC resta, y el 5 es el minuendo."],
              [5, "Eso es solo el 5 fijado. La función todavía resta su b = 3."]] },
    { id: "restarCinco", expr: "restarCinco(3)", def: "val restarCinco = (b: Int) => restaC(b)(5)", valor: -2,
      bien: "Correcto: aquí el 5 va en el segundo grupo, así que restarCinco(3) = 3 − 5 = −2. Para fijar el sustraendo hubo que escribir el literal.",
      malas: [[2, "Eso es 5 − 3, como en menosCinco. Aquí el literal pone b en el primer grupo y el 5 en el segundo: 3 − 5."],
              [8, "Eso es 3 + 5: sumó. restaC resta, y el 5 es el sustraendo."],
              [5, "Eso es solo el 5 fijado. La función todavía recibe el 3 como minuendo."]] }
  ];

  var API = { PREGUNTAS: PREGUNTAS, TRAMPA: TRAMPA };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  var hechas = {};
  function avanzar(id) {
    hechas[id] = true;
    if (Object.keys(hechas).length === PREGUNTAS.length + TRAMPA.length) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  var caja = document.getElementById("preguntas");
  PREGUNTAS.forEach(function (q, n) {
    var bloque = document.createElement("div");
    bloque.className = "pregunta-tipo";
    var enc = document.createElement("div");
    enc.className = "enc";
    enc.innerHTML = (n + 1) + ". El tipo de <code>" + q.expr + "</code>";
    bloque.appendChild(enc);
    var ops = document.createElement("div");
    ops.className = "opciones";
    var ver = document.createElement("div");
    ver.className = "veredicto";
    q.opciones.forEach(function (o) {
      var b = document.createElement("button");
      b.textContent = o;
      b.addEventListener("click", function () {
        var ok = o === q.correcta;
        ops.querySelectorAll("button").forEach(function (x) { x.className = ""; });
        b.className = ok ? "primario" : "";
        ver.className = "veredicto " + (ok ? "bien" : "mal");
        ver.textContent = q.msg[o];
        if (ok) { avanzar("t" + n); }
      });
      ops.appendChild(b);
    });
    bloque.appendChild(ops);
    bloque.appendChild(ver);
    caja.appendChild(bloque);
  });

  function sinRepetidos(lista) {
    var vistos = {}, salida = [];
    lista.forEach(function (o) {
      if (!vistos[o.valor]) { vistos[o.valor] = true; salida.push(o); }
    });
    return salida;
  }

  TRAMPA.forEach(function (t) {
    Motor.opcionesNumericas("opciones-" + t.id, "ver-" + t.id, function () {
      var lista = [{ valor: t.valor, clave: "correcta", razon: t.bien }];
      t.malas.forEach(function (m, n) { lista.push({ valor: m[0], clave: "mala" + n, razon: m[1] }); });
      return sinRepetidos(lista);
    });
    document.getElementById("opciones-" + t.id).addEventListener("click", function (ev) {
      var clave = ev.target.getAttribute ? ev.target.getAttribute("data-op") : null;
      if (clave === "correcta") { avanzar(t.id); }
    });
  });
})();
