/* Cuentas: llamadas y hondura de las tres versiones del factorial, para un
   n dado. Las del árbol salen de la función cuentas de la sesión y
   coinciden con 10_arbol_medido.scala. */
(function () {
  function cuentasArbol(i, j) {
    if (i >= j || i === j - 1) { return { llamadas: 1, hondura: 1 }; }
    var m = i + Math.floor((j - i) / 2);
    var a = cuentasArbol(i, m), b = cuentasArbol(m, j);
    return { llamadas: 1 + a.llamadas + b.llamadas, hondura: 1 + Math.max(a.hondura, b.hondura) };
  }

  /* Hondura = marcos de pila en el punto más hondo, como los midió la sesión. */
  function esperadas(n) {
    var arb = cuentasArbol(1, n + 1);
    return {
      factorial: { llamadas: n + 1, hondura: n + 1 },
      fact: { llamadas: n + 1, hondura: 1 },
      factArbol: { llamadas: arb.llamadas, hondura: arb.hondura }
    };
  }

  var API = { esperadas: esperadas, cuentasArbol: cuentasArbol };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  var FILAS = ["factorial", "fact", "factArbol"];
  var COLS = ["llamadas", "hondura"];
  var nActual = 8;

  function techoLog(n) {
    var k = 0, p = 1;
    while (p < n) { p = p * 2; k = k + 1; }
    return k;
  }

  /* Cada celda: la correcta y los valores que da quien se equivoca de forma
     conocida. Un valor que coincide con otro de la lista se descarta. */
  function opcionesDe(f, c) {
    var n = nActual, esp = esperadas(n);
    var real = esp[f][c];
    var lista = [{ valor: real, clave: "correcta", razon: "" }];
    function mala(valor, razon) { lista.push({ valor: valor, clave: "m" + lista.length, razon: razon }); }
    if (f === "factorial" && c === "llamadas") {
      lista[0].razon = "Correcto: n + 1 = " + real + ". Una llamada por cada valor de n hasta 0, y el 0 también es una llamada.";
      mala(n, "Falta la llamada del caso base: factorial(0) también es una llamada.");
      mala(2 * n - 1, "Esa es la cuenta del árbol. Aquí cada llamada hace una sola llamada, no dos.");
      mala(2 * n, "Cada llamada llama una sola vez a la siguiente; no se duplican.");
    } else if (f === "factorial" && c === "hondura") {
      lista[0].razon = "Correcto: n + 1 = " + real + ". Ningún marco se cierra hasta que el de abajo devuelve, y el del caso base también está abierto.";
      mala(n, "Falta el marco del caso base, que está abierto mientras devuelve el 1.");
      mala(1, "Eso es lo que pasa en la versión de cola. Aquí la multiplicación espera, y cada espera deja un marco.");
      mala(techoLog(n) + 1, "Esa es la hondura del árbol. Aquí no se parte el trabajo: es una cadena de n + 1 llamadas.");
    } else if (f === "fact" && c === "llamadas") {
      lista[0].razon = "Correcto: n + 1 = " + real + ". Que el proceso sea iterativo no reduce las llamadas: sigue habiendo una por cada valor del contador.";
      mala(n, "Falta la llamada que encuentra el caso base y devuelve el producto.");
      mala(1, "Eso confunde las llamadas con los marcos abiertos. Los marcos son 1, pero las llamadas siguen siendo una por paso.");
      mala(2 * n - 1, "Esa es la cuenta del árbol. Esta función llama una sola vez por vuelta.");
    } else if (f === "fact" && c === "hondura") {
      lista[0].razon = "Correcto: 1. La llamada de cola reemplaza al marco anterior, así que nunca hay más de uno abierto.";
      mala(n + 1, "Esa es la hondura de la versión lineal. Aquí no queda nada esperando después de la llamada, y el marco se reutiliza.");
      mala(n, "Eso cuenta un marco por vuelta. Como no queda nada pendiente, cada llamada reemplaza a la anterior.");
      mala(0, "Siempre hay al menos un marco: el que está corriendo. Lo que no crece es la cantidad.");
    } else if (f === "factArbol" && c === "llamadas") {
      lista[0].razon = "Correcto: 2n − 1 = " + real + ". n hojas y n − 1 nodos que parten.";
      mala(n + 1, "Esa es la cuenta de la versión lineal. El árbol parte en dos en cada nivel y hace más llamadas.");
      mala(2 * n, "Se pasa por una: hay n − 1 nodos que parten, no n.");
      mala(n, "Eso son solo las hojas. Los nodos que parten también son llamadas.");
    } else {
      lista[0].razon = "Correcto: ⌈log₂ n⌉ + 1 = " + real + ". La pila sube por una rama y la rama izquierda se cierra antes de abrir la derecha: el máximo es el número de niveles.";
      mala(n + 1, "Esa es la hondura de la versión lineal. El árbol parte el rango por la mitad, así que sus niveles son muchos menos.");
      mala(techoLog(n), "Se queda corto por uno: la raíz también es un marco abierto.");
      mala(2 * n - 1, "Esa es la cantidad de llamadas, no la de marcos abiertos al tiempo.");
    }
    var vistos = {};
    return lista.filter(function (o) {
      var nuevo = !vistos[o.valor];
      vistos[o.valor] = true;
      return nuevo;
    });
  }

  var grupos = [];
  FILAS.forEach(function (f) { COLS.forEach(function (c) {
    grupos.push({ f: f, c: c, ctl: Motor.opcionesNumericas("opciones-" + f + "-" + c,
      "veredicto-" + f + "-" + c, function () { return opcionesDe(f, c); }) });
  }); });

  function revisar() {
    var bien = 0;
    grupos.forEach(function (g) {
      if (document.getElementById("veredicto-" + g.f + "-" + g.c).className.indexOf("bien") >= 0) { bien = bien + 1; }
    });
    var ver = document.getElementById("veredicto");
    if (bien === grupos.length) {
      ver.className = "veredicto bien";
      ver.textContent = "Las seis bien. Mire la columna de llamadas: el árbol hace más que las otras dos. Y mire la de hondura: es la única que no crece con n.";
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  function limpiar() {
    document.getElementById("veredicto").className = "veredicto";
    document.getElementById("veredicto").textContent = "";
    document.getElementById("n-actual").textContent = nActual;
    document.getElementById("carta-cierre").classList.add("bloqueado");
    grupos.forEach(function (g) { g.ctl.refrescar(); });
  }

  grupos.forEach(function (g) {
    document.getElementById("opciones-" + g.f + "-" + g.c).addEventListener("click", revisar);
  });

  document.querySelectorAll("[data-preset]").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll("[data-preset]").forEach(function (o) { o.className = ""; });
      b.className = "primario";
      nActual = parseInt(b.getAttribute("data-preset"), 10);
      limpiar();
    });
  });

  limpiar();
})();
