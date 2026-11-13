/* Ejercicio interactivo: llegar a la posicion por el lado corto. */
var EJERCICIO = (function () {
  var N = 12;
  var P = 10;
  var LINEAS = [
    "Nodo *nodoEn(int p) {",
    "  Nodo *actual = cabeza;",
    "  if (p <= n / 2) {",
    "    int i = 0;",
    "    while (i < p) {",
    "      actual = actual->siguiente;",
    "      i = i + 1;",
    "    }",
    "  } else {",
    "    int i = n;",
    "    while (i > p) {",
    "      actual = actual->anterior;",
    "      i = i - 1;",
    "    }",
    "  }",
    "  return actual;",
    "}"
  ];

  /* Siempre con siguiente: p pasos. */
  function deFrente(p) {
    var pasos = 0;
    var i = 0;
    while (i < p) {
      i = i + 1;
      pasos = pasos + 1;
    }
    return pasos;
  }

  /* Escogiendo el lado: hacia adelante en la primera mitad, hacia atras en la otra. */
  function porElLadoCorto(n, p) {
    var pasos = 0;
    if (p <= Math.floor(n / 2)) {
      var i = 0;
      while (i < p) {
        i = i + 1;
        pasos = pasos + 1;
      }
    } else {
      var j = n;
      while (j > p) {
        j = j - 1;
        pasos = pasos + 1;
      }
    }
    return pasos;
  }

  function sentido(n, p) {
    return p <= Math.floor(n / 2) ? "hacia adelante" : "hacia atras";
  }

  function tabla(n) {
    var filas = [];
    var p = 0;
    while (p < n) {
      filas.push({
        p: p,
        frente: deFrente(p),
        corto: porElLadoCorto(n, p),
        sentido: sentido(n, p)
      });
      p = p + 1;
    }
    return filas;
  }

  function totales(n) {
    var frente = 0;
    var corto = 0;
    var p = 0;
    while (p < n) {
      frente = frente + deFrente(p);
      corto = corto + porElLadoCorto(n, p);
      p = p + 1;
    }
    return { frente: frente, corto: corto };
  }

  /* El peor caso de cada version. */
  function peorCaso(n) {
    return { frente: n - 1, corto: Math.ceil(n / 2) };
  }

  return { n: N, p: P, lineas: LINEAS, deFrente: deFrente,
           porElLadoCorto: porElLadoCorto, tabla: tabla, totales: totales,
           peorCaso: peorCaso };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    function pintarCodigo(id, lineas) {
      var caja = document.getElementById(id);
      lineas.forEach(function (texto, i) {
        var linea = document.createElement("div");
        linea.className = "linea" + (i >= 2 && i <= 7 ? " bloque-1" : (i >= 8 && i <= 13 ? " bloque-2" : ""));
        var num = document.createElement("span");
        num.className = "num";
        num.textContent = i + 1;
        var txt = document.createElement("span");
        txt.className = "txt";
        txt.textContent = texto;
        linea.appendChild(num);
        linea.appendChild(txt);
        caja.appendChild(linea);
      });
    }
    function unicas(lista) {
      var vistos = {};
      return lista.filter(function (o) {
        var ya = vistos[String(o.valor)] === true;
        vistos[String(o.valor)] = true;
        return !ya;
      });
    }
    function alAcertar(idCaja, idVer, f) {
      document.getElementById(idCaja).addEventListener("click", function () {
        if (document.getElementById(idVer).className.indexOf("bien") >= 0) { f(); }
      });
    }
    var logradas = { diez: false, totales: false, cota: false,
                     diezF: false, diezC: false, totF: false, totC: false };
    function revisar() {
      logradas.diez = logradas.diezF && logradas.diezC;
      logradas.totales = logradas.totF && logradas.totC;
      if (logradas.diez && logradas.totales && logradas.cota) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    var N = EJERCICIO.n;
    var FILAS = EJERCICIO.tabla(N);
    var TOTALES = EJERCICIO.totales(N);
    var PEOR = EJERCICIO.peorCaso(N);
    pintarCodigo("codigo-nodoen", EJERCICIO.lineas);

    var EF = EJERCICIO.deFrente(EJERCICIO.p);
    var EC = EJERCICIO.porElLadoCorto(N, EJERCICIO.p);
    Motor.opcionesNumericas("opciones-frente", "veredicto-frente", function () {
      return unicas([
        { valor: EF, clave: "correcta",
          razon: "Correcto: " + EF + ". De frente son p pasos, uno por cada siguiente desde la cabeza." },
        { valor: EF - 1, clave: "menos",
          razon: "Esa es la posición anterior a la que se pide: el ciclo da p vueltas, y con p = " + EJERCICIO.p + " son " + EF + "." },
        { valor: EF + 1, clave: "mas",
          razon: "Eso cuenta el nodo de partida como un paso. La cabeza es la posición 0 y no cuesta ninguno: la posición p queda a p pasos." },
        { valor: N, clave: "toda",
          razon: "Eso es dar toda la vuelta a la lista. La posición " + EJERCICIO.p + " se alcanza antes de cerrar el círculo." }
      ]);
    });
    alAcertar("opciones-frente", "veredicto-frente", function () {
      logradas.diezF = true; revisar();
    });
    Motor.opcionesNumericas("opciones-corto", "veredicto-corto", function () {
      return unicas([
        { valor: EC, clave: "correcta",
          razon: "Correcto: " + EC + ". Con p = " + EJERCICIO.p + " y n = " + N + " la condición p <= n / 2 es falsa, así que el contador arranca en " +
            N + " y baja hasta " + EJERCICIO.p + ": cabeza->anterior es la posición " + (N - 1) + " y un paso más es la " + EJERCICIO.p + "." },
        { valor: PEOR.corto, clave: "tope",
          razon: "Seis es el tope, el peor caso. Para una posición concreta los pasos hacia atrás son n - p, y aquí eso da menos." },
        { valor: EF, clave: "igual",
          razon: "El camino hacia atrás no da los mismos pasos: la posición " + (N - 1) + " está a un paso de la cabeza por detrás, y la " + EJERCICIO.p + " a dos." },
        { valor: EC - 1, clave: "corto",
          razon: "Un solo paso llega a la posición " + (N - 1) + ", no a la " + EJERCICIO.p + ". El ciclo arranca en i = n y baja hasta p: resta uno " + EC + " veces." }
      ]);
    });
    alAcertar("opciones-corto", "veredicto-corto", function () {
      logradas.diezC = true; revisar();
    });

    var vista = { i: 0 };
    function pintarTabla() {
      var cuerpo = document.getElementById("tabla-pasos");
      cuerpo.innerHTML = "";
      FILAS.forEach(function (f, k) {
        var fila = document.createElement("tr");
        var visible = k < vista.i;
        [String(f.p),
         visible ? String(f.frente) : "?",
         visible ? String(f.corto) : "?",
         visible ? (f.sentido === "hacia adelante" ? "hacia adelante" : "hacia atrás") : "?"
        ].forEach(function (texto, c) {
          var celda = document.createElement("td");
          if (!visible && c > 0) { celda.className = "pend"; }
          celda.textContent = texto;
          fila.appendChild(celda);
        });
        cuerpo.appendChild(fila);
      });
      var sumaF = 0;
      var sumaC = 0;
      var k = 0;
      while (k < vista.i) {
        sumaF = sumaF + FILAS[k].frente;
        sumaC = sumaC + FILAS[k].corto;
        k = k + 1;
      }
      document.getElementById("progreso-tabla").textContent =
        vista.i + " de " + FILAS.length + " posiciones: " + sumaF +
        " pasos de frente y " + sumaC + " por el lado corto hasta aquí";
      document.getElementById("btn-fila").disabled = vista.i === FILAS.length;
    }
    document.getElementById("btn-fila").addEventListener("click", function () {
      if (vista.i < FILAS.length) { vista.i = vista.i + 1; pintarTabla(); }
    });
    document.getElementById("btn-todo").addEventListener("click", function () {
      vista.i = FILAS.length; pintarTabla();
    });
    document.getElementById("btn-reinicio").addEventListener("click", function () {
      vista.i = 0; pintarTabla();
    });
    pintarTabla();

    Motor.opcionesNumericas("opciones-total-frente", "veredicto-total-frente", function () {
      return unicas([
        { valor: TOTALES.frente, clave: "correcta",
          razon: "Correcto: " + TOTALES.frente + ". De frente la suma es 0 + 1 + ... + " + (N - 1) + " = " + N + "·" + (N - 1) + "/2." },
        { valor: (N * (N + 1)) / 2, clave: "uno-a-n",
          razon: "Los sumandos van de 0 a " + (N - 1) + ", no de 1 a " + N + ": la posición 0 es la cabeza y no cuesta ningún paso." },
        { valor: N * (N - 1), clave: "doble",
          razon: "Eso es el doble: la suma 0 + 1 + ... + " + (N - 1) + " vale n(n-1)/2, no n(n-1)." },
        { valor: N * N, clave: "cuadrado",
          razon: "Eso sería si cada una de las " + N + " consultas costara " + N + " pasos. La posición p cuesta p, y las primeras cuestan casi nada." }
      ]);
    });
    alAcertar("opciones-total-frente", "veredicto-total-frente", function () {
      logradas.totF = true; revisar();
    });
    Motor.opcionesNumericas("opciones-total-corto", "veredicto-total-corto", function () {
      var tope = PEOR.corto;
      return unicas([
        { valor: TOTALES.corto, clave: "correcta",
          razon: "Correcto: " + TOTALES.corto + ". La columna sube hasta " + tope +
            " y vuelve a bajar: ningún recorrido pasa de ⌈n/2⌉ = " + PEOR.corto + " pasos." },
        { valor: tope * N, clave: "tope",
          razon: "Eso cobra el peor caso, " + tope + " pasos, a cada una de las " + N + " posiciones. Casi todas cuestan menos: sume la columna." },
        { valor: TOTALES.frente / 2, clave: "mitad",
          razon: "Ahorrar la mitad del camino no es ahorrar la mitad del total: la columna del lado corto sube 0, 1, ..., " + tope + " y baja " + (tope - 1) + ", ..., 1, y esa suma no es " + TOTALES.frente + "/2." },
        { valor: 2 * ((tope * (tope + 1)) / 2), clave: "simetrica",
          razon: "Eso repite el " + tope + ": la columna sube hasta " + tope + " y baja desde " + (tope - 1) + ", no desde " + tope + "." }
      ]);
    });
    alAcertar("opciones-total-corto", "veredicto-total-corto", function () {
      logradas.totC = true; revisar();
    });

    var MENSAJES_COTA = {
      n: null,
      media: "Θ(n/2) y Θ(n) son la misma clase: la constante 1/2 se absorbe en el testigo c de la definición. Lo que baja es el número de pasos, no la clase.",
      log: "Θ(log n) exige descartar la mitad de lo que queda en cada paso, y para eso hay que poder saltar: aquí cada paso avanza un nodo. Escoger el lado se decide una vez, al principio.",
      uno: "Θ(1) sería calcular la dirección del nodo sin caminar, como en el arreglo. La lista no la calcula: sigue enlaces, uno por paso."
    };
    document.querySelectorAll("#opciones-cota button").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var ver = document.getElementById("veredicto-cota");
        var m = MENSAJES_COTA[boton.dataset.op];
        if (m === null) {
          ver.className = "veredicto bien";
          ver.textContent = "Correcto: sigue siendo Θ(n). El peor caso baja de n - 1 pasos a ⌈n/2⌉, " +
            "que con n = " + N + " es " + PEOR.frente + " contra " + PEOR.corto +
            ", y el total de recorrer todas las posiciones baja de " + TOTALES.frente +
            " a " + TOTALES.corto + ". Es la mitad del trabajo dentro de la misma clase asintótica.";
          logradas.cota = true; revisar();
        } else {
          ver.className = "veredicto mal";
          ver.textContent = m;
        }
      });
    });
  })();
}
