/* Derivada: derivada(cube, dx)(2) para tres dx, calculada con la expansión
   12 + 6·dx + dx² antes de ver lo que imprime el programa, y la segunda
   derivada como pregunta de opciones. Los flotantes salen de
   14_error_derivada.scala y de correr derivada(derivada(cube, dx), dx)(2). */
(function () {
  var FILAS = [
    { dx: "1.0", exacto: 19, impreso: "19.0" },
    { dx: "0.1", exacto: 12.61, impreso: "12.61000000000001" },
    { dx: "0.0001", exacto: 12.0006, impreso: "12.000600010022566" }
  ];
  function formula(dx) { return 12 + 6 * dx + dx * dx; }

  var SEGUNDA = {
    texto: "derivada(derivada(cube, 0.01), 0.01)(2)",
    opciones: [
      { txt: "cerca de 24", ok: false, msg: "No. 24 sería 6 · 4, como si se evaluara en x = 4. La derivada de la derivada de x³ es 6x; en 2 vale 12, y el programa imprime 12.06." },
      { txt: "no compila: derivada recibe una función, no otra derivada", ok: false, msg: "Sí compila. derivada(cube, 0.01) es de tipo Double => Double, exactamente lo que el parámetro f espera. Se puede anidar cuantas veces se quiera, e imprime 12.06." }
    ,
      { txt: "cerca de 12", ok: true, msg: "Correcto: 12.059999999998183. Derivar dos veces x³ da 6x, que en 2 vale 12; el 0.06 de más es el error de aproximar dos veces con dx = 0.01. La segunda derivada se construye igual que la primera: derivada recibe una función y devuelve otra, y la de adentro ya era una función." },
      { txt: "cerca de 6", ok: false, msg: "No. 6 es la segunda derivada de x³ en x = 1, o el coeficiente de x. En x = 2 es 6 · 2 = 12; el programa imprime 12.06." }]
  };

  var API = { FILAS: FILAS, formula: formula, SEGUNDA: SEGUNDA };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  var hechas = {};
  function avanzar(id) {
    hechas[id] = true;
    if (hechas.tabla && hechas.segunda) { document.getElementById("carta-cierre").classList.remove("bloqueado"); }
  }

  var acertadas = {};
  function redondear(x) { return Number(x.toPrecision(12)); }
  function opcionesFila(f) {
    var dx = parseFloat(f.dx);
    var cand = [
      { valor: 12, clave: "exacto",
        razon: "Ese es el valor exacto de la derivada, 3x² en x = 2. Pero derivada devuelve un cociente con dx finito, y el resultado es 12 + 6·dx + dx²: dx sí influye." },
      { valor: redondear(dx * formula(dx)), clave: "sindividir",
        razon: "Ese es el numerador, f(x + dx) − f(x), sin dividir por dx. La función devuelve el cociente completo." },
      { valor: redondear(formula(dx * 10)), clave: "dxmayor",
        razon: "Ese es el resultado con un dx diez veces mayor (" + redondear(dx * 10) + "). Aquí dx vale " + f.dx + "." },
      { valor: redondear(formula(dx / 10)), clave: "dxmenor",
        razon: "Ese es el resultado con un dx diez veces menor (" + redondear(dx / 10) + "). Aquí dx vale " + f.dx + "." }
    ];
    var lista = [{ valor: f.exacto, clave: "correcta",
      razon: "Correcto: 12 + 6·" + f.dx + " + " + f.dx + "² = " + f.exacto + "." }];
    cand.forEach(function (c) {
      var repetida = false;
      lista.forEach(function (o) { if (o.valor === c.valor) { repetida = true; } });
      if (!repetida && lista.length < 4) { lista.push(c); }
    });
    return lista;
  }
  API.opcionesFila = opcionesFila;

  FILAS.forEach(function (f, i) {
    Motor.opcionesNumericas("opciones-v-" + i, "veredicto-v-" + i, function () { return opcionesFila(f); });
    document.getElementById("opciones-v-" + i).addEventListener("click", function (e) {
      var t = e.target;
      if (t && t.getAttribute && t.getAttribute("data-op") === "correcta") {
        acertadas[i] = true;
        document.getElementById("imp-" + i).textContent = f.impreso;
        if (acertadas[0] && acertadas[1] && acertadas[2]) { avanzar("tabla"); }
      }
    });
  });

  document.getElementById("btn-comprobar-tabla").addEventListener("click", function () {
    var faltan = 3 - (acertadas[0] ? 1 : 0) - (acertadas[1] ? 1 : 0) - (acertadas[2] ? 1 : 0);
    var ver = document.getElementById("veredicto-tabla");
    if (faltan === 0) {
      ver.className = "veredicto bien";
      ver.textContent = "Correcto: 19, 12.61 y 12.0006. El error es 6·dx + dx², y por eso cae con dx. Ahora compare con lo que imprime el programa.";
    } else {
      ver.className = "veredicto mal";
      ver.textContent = "Faltan " + faltan + " filas por acertar. Con la fórmula: 12 + 6·dx + dx². Para dx = 1 es 12 + 6 + 1; para 0.1 es 12 + 0.6 + 0.01.";
    }
  });

  var ops = document.getElementById("opciones-segunda");
  SEGUNDA.opciones.forEach(function (o) {
    var b = document.createElement("button");
    b.textContent = o.txt;
    b.addEventListener("click", function () {
      ops.querySelectorAll("button").forEach(function (x) { x.className = ""; });
      b.className = o.ok ? "primario" : "";
      var v = document.getElementById("veredicto-segunda");
      v.className = "veredicto " + (o.ok ? "bien" : "mal");
      v.textContent = o.msg;
      if (o.ok) { avanzar("segunda"); }
    });
    ops.appendChild(b);
  });
})();
