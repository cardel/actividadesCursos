/* Ejercicio interactivo: con una cola. */
var EJERCICIO = (function () {
  var CASOS = { cartas: { n: 7 }, papa: { n: 6, k: 4 } };

  /* Cartas al aire: se descarta el frente y la siguiente pasa al final. */
  function cartas(n) {
    var c = [];
    var i = 1;
    while (i <= n) { c.push(i); i = i + 1; }
    var descartadas = [];
    while (c.length > 1) {
      descartadas.push(c.shift());
      c.push(c.shift());
    }
    return { descartadas: descartadas, queda: c[0] };
  }

  /* La papa caliente: cada k-esima persona sale. */
  function papa(n, k) {
    var c = [];
    var i = 1;
    while (i <= n) { c.push(i); i = i + 1; }
    var salen = [];
    while (c.length > 1) {
      var j = 1;
      while (j < k) { c.push(c.shift()); j = j + 1; }
      salen.push(c.shift());
    }
    return { salen: salen, queda: c[0] };
  }

  return { casos: CASOS, cartas: cartas, papa: papa };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    function pintarCodigo(id, lineas) {
      var caja = document.getElementById(id);
      lineas.forEach(function (par, i) {
        var linea = document.createElement("div");
        linea.className = "linea" + (par[1] ? " " + par[1] : "");
        var num = document.createElement("span");
        num.className = "num";
        num.textContent = i + 1;
        var txt = document.createElement("span");
        txt.className = "txt";
        txt.textContent = par[0];
        linea.appendChild(num);
        linea.appendChild(txt);
        caja.appendChild(linea);
      });
    }

    pintarCodigo("codigo-cartas", [
      ["Cola c;   // 1, 2, ..., n en orden", ""],
      ["while (c.tamano() > 1) {", ""],
      ["  printf(\"descarta %d\\n\", c.frente());", "bloque-2"],
      ["  c.desencolar();", "bloque-2"],
      ["  Elemento x = c.frente();", "bloque-1"],
      ["  c.desencolar();", "bloque-1"],
      ["  c.encolar(x);", "bloque-1"],
      ["}", ""],
      ["printf(\"queda %d\\n\", c.frente());", ""]
    ]);

    pintarCodigo("codigo-bucle", [
      ["void imprimir(Cola &c) {", ""],
      ["  while (!c.vacia()) {", "bloque-2"],
      ["    Elemento x = c.frente();", ""],
      ["    printf(\" %d\", x);", ""],
      ["    c.desencolar();", "bloque-1"],
      ["    c.encolar(x);", "bloque-1"],
      ["  }", ""],
      ["  printf(\"\\n\");", ""],
      ["}", ""]
    ]);

    /* Una opcion cuyo valor ya salio antes se descarta: nunca dos botones iguales. */
    function unicas(lista) {
      var vistos = [];
      return lista.filter(function (o) {
        var nueva = vistos.indexOf(o.valor) < 0;
        if (nueva) { vistos.push(o.valor); }
        return nueva;
      });
    }
    /* Avisa cada vez que el estudiante acierta en el contenedor de opciones. */
    function alAcertar(idOpciones, f) {
      document.getElementById(idOpciones).addEventListener("click", function (e) {
        if (e.target && e.target.getAttribute("data-op") === "correcta") { f(); }
      });
    }
    var logradas = { cartas: false, papa: false, bucle: false };
    var texto = { cartas: false, papa: false };
    var numero = { cartas: false, papa: false };
    function revisar() {
      logradas.cartas = texto.cartas && numero.cartas;
      logradas.papa = texto.papa && numero.papa;
      if (logradas.cartas && logradas.papa && logradas.bucle) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }
    function leerLista(texto) {
      return texto.trim().split(/[\s,]+/).filter(function (x) { return x !== ""; }).map(Number);
    }
    function iguales(a, b) {
      return a.length === b.length && a.every(function (x, i) { return x === b[i]; });
    }

    /* --- Carta 1: cartas ------------------------------------------ */
    document.getElementById("btn-cartas").addEventListener("click", function () {
      var v = document.getElementById("veredicto-cartas");
      var r = EJERCICIO.cartas(EJERCICIO.casos.cartas.n);
      var dadas = leerLista(document.getElementById("pred-cartas-desc").value);
      if (iguales(dadas, r.descartadas)) {
        v.className = "veredicto bien";
        v.textContent = "Correcto: 1 3 5 7 4 2. En la segunda vuelta la cola ya no arranca en 1: arranca en 4, porque el 2 se fue al final.";
        texto.cartas = true;
        revisar();
      } else if (iguales(dadas, [1, 3, 5, 7]) || (dadas.length >= 4 && iguales(dadas.slice(0, 4), [1, 3, 5, 7]) && !iguales(dadas, r.descartadas))) {
        v.className = "veredicto mal";
        v.textContent = "Las cuatro primeras van bien. Después de descartar la 7, ¿qué carta está al frente? Recuerde que 2, 4 y 6 fueron pasando al final.";
      } else if (iguales(dadas, [1, 2, 3, 4, 5, 6])) {
        v.className = "veredicto mal";
        v.textContent = "Eso sería desencolar sin más. Cada vuelta descarta una y manda la siguiente al final: la 2 no se descarta, se guarda.";
      } else {
        v.className = "veredicto mal";
        v.textContent = "Trace la cola vuelta por vuelta: ⟨1..7⟩, descarta 1 y la 2 va al final: ⟨3 4 5 6 7 2⟩. Siga así hasta que quede una.";
      }
    });

    /* --- Carta 2: papa caliente ----------------------------------- */
    document.getElementById("btn-papa").addEventListener("click", function () {
      var v = document.getElementById("veredicto-papa");
      var c = EJERCICIO.casos.papa;
      var r = EJERCICIO.papa(c.n, c.k);
      var dadas = leerLista(document.getElementById("pred-papa-salen").value);
      if (iguales(dadas, r.salen)) {
        v.className = "veredicto bien";
        v.textContent = "Correcto: salen 4, 2, 1, 3, 6. Con k = 4 la papa pasa tres veces antes de cada salida; después de la primera, el conteo sigue desde el 5.";
        texto.papa = true;
        revisar();
      } else if (iguales(dadas, [4, 2, 6, 4]) || (dadas.length > 0 && dadas[0] === 4 && dadas[1] !== 2)) {
        v.className = "veredicto mal";
        v.textContent = "La primera salida es 4, bien. La segunda cuenta desde el 5: 5, 6, 1 pasan y sale el 2.";
      } else if (dadas.length > 0 && dadas[0] === 3) {
        v.className = "veredicto mal";
        v.textContent = "Con k = 4 pasan k − 1 = 3 personas y sale la cuarta, no la tercera.";
      } else {
        v.className = "veredicto mal";
        v.textContent = "Cola ⟨1 2 3 4 5 6⟩: pasan 1, 2, 3 al final y sale el 4. Siga desde ⟨5 6 1 2 3⟩.";
      }
    });

    /* --- Carta 3: el ciclo que no termina ------------------------- */
    var MENSAJES = {
      termina: "Cada vuelta desencola uno y encola uno: el tamaño nunca baja y vacia() nunca es verdadero.",
      siempre: null,
      assert: "Ninguna precondición se viola: frente y desencolar siempre encuentran la cola con elementos, justamente porque nunca se vacía."
    };
    document.querySelectorAll("#opciones-bucle button").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var v = document.getElementById("veredicto-bucle");
        var m = MENSAJES[boton.dataset.op];
        if (m === null) {
          v.className = "veredicto bien";
          v.textContent = "Correcto: imprime 7 2 9 7 2 9 7 2 9 ... sin parar. Lo que vuelve a entrar se vuelve a leer. Por eso el tamaño se lee una vez, antes del ciclo.";
          logradas.bucle = true;
          revisar();
        } else {
          v.className = "veredicto mal";
          v.textContent = m;
        }
      });
    });

    /* --- Opciones numericas --------------------------------------- */
    Motor.opcionesNumericas("opciones-cartas", "veredicto-cartas-queda", function () {
      var n = EJERCICIO.casos.cartas.n;
      var r = EJERCICIO.cartas(n);
      return unicas([
        { valor: r.queda, clave: "correcta",
          razon: "Correcto: queda la " + r.queda + ". Se descartan " + r.descartadas.join(", ") + " y la " + r.queda + " es la única que nunca se descarta." },
        { valor: n, clave: "ultima",
          razon: "La " + n + " empieza al fondo, pero se descarta en la primera vuelta. Ni el fondo ni el frente deciden quién queda: hay que trazar." },
        { valor: r.descartadas[r.descartadas.length - 1], clave: "ultima-descartada",
          razon: "Esa es la última que se descarta. Cuando quedan dos cartas se descarta la de arriba y la otra pasa al fondo: esa es la que queda." },
        { valor: r.descartadas[0], clave: "primera",
          razon: "La " + r.descartadas[0] + " es la primera que se descarta: está arriba al empezar." }
      ]);
    });
    alAcertar("opciones-cartas", function () { numero.cartas = true; revisar(); });
    Motor.opcionesNumericas("opciones-papa", "veredicto-papa-queda", function () {
      var c = EJERCICIO.casos.papa;
      var r = EJERCICIO.papa(c.n, c.k);
      return unicas([
        { valor: r.queda, clave: "correcta",
          razon: "Correcto: queda el " + r.queda + ". Salen " + r.salen.join(", ") + " y es el único que nunca sale." },
        { valor: r.salen[r.salen.length - 1], clave: "ultimo",
          razon: "Ese es el último que sale, y sale: el que queda es otro, el único que nunca cae en la cuarta posición." },
        { valor: r.salen[0], clave: "primero",
          razon: "Ese es el primero en salir. Con k = " + c.k + " pasan " + (c.k - 1) + " personas y sale la cuarta; el " + r.salen[0] + " no queda." },
        { valor: r.salen[r.salen.length - 2], clave: "penultimo",
          razon: "Ese es el penúltimo en salir. Siga la cola hasta que quede una sola persona." }
      ]);
    });
    alAcertar("opciones-papa", function () { numero.papa = true; revisar(); });
  })();
}
