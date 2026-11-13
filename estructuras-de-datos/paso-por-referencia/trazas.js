/* Ejercicio interactivo: paso de parametros. */
var EJERCICIO = (function () {
  /* Estado inicial de main y respuesta correcta por version. */
  var INICIAL = { x: 2, y: 10, z: 4 };
  var ESPERADO = {
    valor: { x: 3, y: 10, z: 7 },
    puntero: { x: 3, y: 3, z: 7 },
    referencia: { x: 3, y: 3, z: 7 }
  };

  /* La resta corre con a ya en 7: 10 - 7 en las tres versiones. */
  function retorno() {
    return INICIAL.y - (INICIAL.x + 5);
  }

  return { inicial: INICIAL, esperado: ESPERADO, retorno: retorno };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {

    /* --- Render de los bloques de codigo -------------------------- */
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

    pintarCodigo("codigo-main", [
      ["int x = 2;", ""],
      ["int y = 10;", ""],
      ["int z = 4;", ""],
      ["int *w = &x;", "bloque-2"],
      ["", ""],
      ["printf(\"x = %d y = %d z = %d\\n\", x, y, z);", ""],
      ["z = z + ajuste(x, ...);", "bloque-2"],
      ["*w = *w + 1;", "bloque-2"],
      ["printf(\"x = %d y = %d z = %d\\n\", x, y, z);", ""]
    ]);

    pintarCodigo("codigo-valor", [
      ["int ajuste(int a, int b) {", "bloque-1"],
      ["    a = a + 5;", ""],
      ["    b = b - a;", ""],
      ["    return b;", ""],
      ["}", ""]
    ]);

    pintarCodigo("codigo-puntero", [
      ["int ajuste(int a, int *b) {", "bloque-1"],
      ["    a = a + 5;", ""],
      ["    *b = *b - a;", "bloque-1"],
      ["    return *b;", "bloque-1"],
      ["}", ""]
    ]);

    pintarCodigo("codigo-referencia", [
      ["int ajuste(int a, int &b) {", "bloque-1"],
      ["    a = a + 5;", ""],
      ["    b = b - a;", ""],
      ["    return b;", ""],
      ["}", ""]
    ]);

    /* --- Comprobacion por version --------------------------------- */
    var logradas = { valor: false, puntero: false, referencia: false };
    var aciertos = {};

    function revisarDesbloqueo() {
      if (logradas.valor && logradas.puntero && logradas.referencia) {
        document.getElementById("carta-tabla").style.display = "block";
      }
    }

    /* Opciones de cada variable: la correcta sale de EJERCICIO.esperado y
       cada distractor es un error que el estudiante daria de verdad. */
    function armarX(version) {
      var e = EJERCICIO.esperado[version];
      return [
        { valor: e.x, clave: "correcta",
          razon: "Correcto: la función nunca recibe la dirección de x, " +
            "pero main escribe ahí con *w y x queda en " + e.x + "." },
        { valor: EJERCICIO.inicial.x, clave: "inicial",
          razon: "Es cierto que la función no alcanza a x, pero mire la " +
            "línea que sigue a la llamada: w guarda la dirección de x, y " +
            "main escribe ahí con *w." },
        { valor: EJERCICIO.inicial.x + 5, clave: "marco",
          razon: "a viaja por valor en las tres firmas de esta página: el " +
            "a + 5 se quedó en el marco de ajuste y murió con él." },
        { valor: e.x + 5, clave: "marco-w",
          razon: "El + 5 es de a, no de x: a es una copia en el marco de " +
            "ajuste y x solo cambia por el *w = *w + 1 de main." }
      ];
    }

    function armarY(version) {
      var e = EJERCICIO.esperado[version];
      var lista = [
        { valor: e.y, clave: "correcta",
          razon: version === "valor"
            ? "Correcto: con int b solo viaja el valor de y, y la celda " +
              "original no se entera."
            : "Correcto: b llegó hasta la celda de y y la resta " +
              "10 - 7 la dejó en " + e.y + "." },
        { valor: EJERCICIO.inicial.y - EJERCICIO.inicial.x, clave: "orden",
          razon: "Cuidado con el orden: cuando llega la resta, a ya subió a 7." }
      ];
      if (version === "valor") {
        lista.push({ valor: EJERCICIO.retorno(), clave: "copia",
          razon: "b = b - a restó en la copia: con int b solo viaja el " +
            "valor de y, y la celda original no se entera." });
      } else {
        lista.push({ valor: EJERCICIO.inicial.y, clave: "sin-cambio",
          razon: version === "puntero"
            ? "Ahora b guarda la dirección de y: *b = *b - a viaja hasta " +
              "la celda original y y sí cambia."
            : "int &b no copia: b es otro nombre de y durante la llamada, " +
              "y b = b - a escribe en la celda de y." });
      }
      return lista;
    }

    function armarZ(version) {
      var e = EJERCICIO.esperado[version];
      return [
        { valor: e.z, clave: "correcta",
          razon: "Correcto: ajuste retorna " + EJERCICIO.retorno() +
            " y z = z + ajuste(...) se lo suma al 4 que z ya tenía." },
        { valor: EJERCICIO.inicial.z, clave: "pierde",
          razon: "El retorno no se pierde: la línea dice z = z + " +
            "ajuste(...), así que lo retornado se le suma al 4 que z ya " +
            "tenía." },
        { valor: EJERCICIO.retorno(), clave: "reemplaza",
          razon: "Casi: z = z + ajuste(...) suma el retorno al 4 que z ya " +
            "tenía, no lo reemplaza." }
      ];
    }

    var armadores = { x: armarX, y: armarY, z: armarZ };

    var EXITO = {
      valor: "Correcto: nada de lo que hizo ajuste salió de su marco —a y b " +
        "eran copias— y su única salida fue el retorno 3, que se sumó a z. " +
        "El cambio de x no fue de la función: fue main, escribiendo con *w.",
      puntero: "Correcto: *b llevó la resta hasta la celda de y (10 → 3), a " +
        "siguió siendo copia, y el retorno subió z a 7. Una misma firma " +
        "mezcló los dos modos: b por referencia, a por valor.",
      referencia: "Correcto, y con trampa doble: el resultado es el de la " +
        "versión con punteros, pero la llamada se lee como la versión por " +
        "valor. En C++ quien avisa es la firma: int &b."
    };

    ["valor", "puntero", "referencia"].forEach(function (version) {
      ["x", "y", "z"].forEach(function (campo) {
        Motor.opcionesNumericas("opciones-" + version + "-" + campo,
          "veredicto-" + version + "-" + campo,
          function () { return armadores[campo](version); });

        // el listener de la caja corre despues del boton: ahi ya esta el veredicto
        document.getElementById("opciones-" + version + "-" + campo)
          .addEventListener("click", function () {
            var v = document.getElementById("veredicto-" + version + "-" + campo);
            if (v.className.indexOf("bien") >= 0) { aciertos[version + "-" + campo] = true; }
            if (aciertos[version + "-x"] && aciertos[version + "-y"] &&
                aciertos[version + "-z"]) {
              var g = document.getElementById("veredicto-" + version);
              g.className = "veredicto bien";
              g.textContent = EXITO[version];
              logradas[version] = true;
              revisarDesbloqueo();
            }
          });
      });
    });
  })();
}
