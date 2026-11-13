/* Ejercicio interactivo: cuantas secuencias imprime UVa 732. */
var EJERCICIO = (function () {
  var PRIMERO = ["banana", "ananab"];
  var FAMILIA = [["nana", "nana"], ["nanana", "nanana"], ["nananana", "nananana"]];
  var ULTIMO = ["piano", "opina"];

  /* La busqueda del programa: se intenta meter antes que sacar, y sacar solo
     cuando el tope es la letra que la salida necesita. Devuelve las secuencias
     en el orden en que se imprimen, con los estados que se visitaron y los que
     no llevaron a nada. */
  function analizar(entrada, salida) {
    var largo = entrada.length;
    var pila = [];
    var jugadas = [];
    var secuencias = [];
    var cuenta = { estados: 0, callejones: 0 };

    function buscar(metidas, escritas) {
      cuenta.estados = cuenta.estados + 1;
      if (escritas === largo) {
        secuencias.push(jugadas.join(" "));
      } else {
        var abiertas = 0;
        if (metidas < largo) {
          abiertas = abiertas + 1;
          pila.push(entrada.charAt(metidas));
          jugadas.push("i");
          buscar(metidas + 1, escritas);
          jugadas.pop();
          pila.pop();
        }
        if (pila.length > 0 && pila[pila.length - 1] === salida.charAt(escritas)) {
          abiertas = abiertas + 1;
          var letra = pila[pila.length - 1];
          pila.pop();
          jugadas.push("o");
          buscar(metidas, escritas + 1);
          jugadas.pop();
          pila.push(letra);
        }
        if (abiertas === 0) {
          cuenta.callejones = cuenta.callejones + 1;
        }
      }
    }

    if (entrada.length === salida.length) {
      buscar(0, 0);
    }
    return { secuencias: secuencias, estados: cuenta.estados,
             callejones: cuenta.callejones };
  }

  function cuantas(entrada, salida) {
    return analizar(entrada, salida).secuencias.length;
  }

  /* Una fila por palabra de la familia: largo, secuencias, estados visitados y
     estados que no imprimieron nada. */
  function tabla() {
    return FAMILIA.map(function (par) {
      var r = analizar(par[0], par[1]);
      return { palabra: par[0], largo: par[0].length,
               secuencias: r.secuencias.length, estados: r.estados,
               callejones: r.callejones };
    });
  }

  return { primero: PRIMERO, familia: FAMILIA, ultimo: ULTIMO,
           analizar: analizar, cuantas: cuantas, tabla: tabla };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var logradas = { banana: false, seis: false, ocho: false, familia: false, piano: false };
    function revisar() {
      if (logradas.banana && logradas.familia && logradas.piano) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    var PRIMERO = EJERCICIO.analizar(EJERCICIO.primero[0], EJERCICIO.primero[1]);
    var ULTIMO = EJERCICIO.analizar(EJERCICIO.ultimo[0], EJERCICIO.ultimo[1]);
    var TABLA = EJERCICIO.tabla();

    function sinRepetir(lista) {
      var vistos = {};
      return lista.filter(function (o) {
        var nuevo = !vistos[o.valor];
        vistos[o.valor] = true;
        return nuevo;
      });
    }
    function alAcertar(idCaja, alLograr) {
      document.getElementById(idCaja).addEventListener("click", function (e) {
        var b = e.target;
        if (b && b.getAttribute && b.getAttribute("data-op") === "correcta") {
          alLograr();
        }
      });
    }

    alAcertar("opciones-banana", function () { logradas.banana = true; revisar(); });
    Motor.opcionesNumericas("opciones-banana", "veredicto-banana", function () {
      var n = PRIMERO.secuencias.length;
      return sinRepetir([
        { valor: n, clave: "correcta",
          razon: "Correcto: " + n +
            ". La b se mete de primera y se escribe de última, así que pasa toda la búsqueda en el fondo. Las bifurcaciones las abren las tres a: cuando la salida necesita una a, puede ser la que ya está en el tope o una que todavía no se ha metido. El recorrido visitó " +
            PRIMERO.estados + " estados y " + PRIMERO.callejones +
            " de ellos no imprimieron nada. Las secuencias son: " +
            PRIMERO.secuencias.join("; ") + "." },
        { valor: 1, clave: "una",
          razon: "Esa es la cuenta con las letras todas distintas, donde el tope coincide con la letra que toca en un solo momento. banana tiene tres a y dos n, y cada repetición abre otra forma de servir la misma letra de la salida." },
        { valor: 0, clave: "ninguna",
          razon: "Hay al menos una: ananab es banana al revés, y meter las seis letras y sacarlas en bloque la escribe entera." },
        { valor: 6, clave: "producto",
          razon: "Eso es 3 por 2, las veces que se repiten la a y la n multiplicadas. Las repeticiones no actúan por separado: cada elección deja un resto distinto para las letras que siguen, y varias elecciones terminan en la misma secuencia o en callejones." }
      ]);
    });

    function pintarTabla() {
      var caja = document.getElementById("tabla-familia");
      if (caja.dataset.lista === "si") {
        return;
      }
      caja.dataset.lista = "si";
      var t = document.createElement("table");
      var cab = document.createElement("tr");
      ["palabra", "letras", "secuencias", "estados visitados", "sin imprimir nada"]
        .forEach(function (r) {
          var th = document.createElement("th");
          th.textContent = r;
          cab.appendChild(th);
        });
      t.appendChild(cab);
      TABLA.forEach(function (f) {
        var tr = document.createElement("tr");
        [f.palabra, f.largo, f.secuencias, f.estados, f.callejones].forEach(function (v) {
          var td = document.createElement("td");
          td.textContent = String(v);
          tr.appendChild(td);
        });
        t.appendChild(tr);
      });
      caja.appendChild(t);
    }

    alAcertar("opciones-seis", function () {
      logradas.seis = true; pintarTabla();
      if (logradas.seis && logradas.ocho) { logradas.familia = true; revisar(); }
    });
    alAcertar("opciones-ocho", function () {
      logradas.ocho = true; pintarTabla();
      if (logradas.seis && logradas.ocho) { logradas.familia = true; revisar(); }
    });
    function razonFamilia(correcta) {
      return "Correcto: " + correcta + ". Cada par de letras que se agrega multiplica la cuenta por cuatro o más: " +
        TABLA[0].secuencias + ", " + TABLA[1].secuencias + ", " + TABLA[2].secuencias +
        ", y los estados visitados pasan de " + TABLA[0].estados + " a " + TABLA[2].estados + ".";
    }
    Motor.opcionesNumericas("opciones-seis", "veredicto-seis", function () {
      var n = TABLA[1].secuencias;
      var base = TABLA[0].secuencias;
      return sinRepetir([
        { valor: n, clave: "correcta", razon: razonFamilia(n) },
        { valor: base, clave: "igual",
          razon: "Esa es la cuenta de nana. Dos letras más abren ramas nuevas en cada punto donde la salida pide una letra repetida: la cuenta no se queda quieta." },
        { valor: base + base, clave: "suma",
          razon: "Sumar " + base + " + " + base + " trata el agregado como un bloque independiente. Las letras nuevas se mezclan con las anteriores en cada elección, y por eso la cuenta se multiplica, no se suma." },
        { valor: base * base, clave: "cuadrado",
          razon: "Elevar al cuadrado la cuenta de nana da " + (base * base) + ", pero la cuenta crece más: cada par de letras la multiplica por cuatro o más." }
      ]);
    });
    Motor.opcionesNumericas("opciones-ocho", "veredicto-ocho", function () {
      var n = TABLA[2].secuencias;
      var m = TABLA[1].secuencias;
      return sinRepetir([
        { valor: n, clave: "correcta", razon: razonFamilia(n) },
        { valor: m * 2, clave: "doble",
          razon: "Duplicar la cuenta de nanana da " + (m * 2) + ". Cada par de letras la multiplica por cuatro o más, no por dos." },
        { valor: m * 3, clave: "triple",
          razon: "Triplicar la cuenta de nanana da " + (m * 3) + ". Cada par de letras la multiplica por cuatro o más; la tabla trae el valor." },
        { valor: m * 4, clave: "cuatro",
          razon: "Multiplicar por cuatro da " + (m * 4) + ", y todavía queda corto: cada par de letras multiplica la cuenta por cuatro o más, y esta vez es más." }
      ]);
    });

    alAcertar("opciones-piano", function () { logradas.piano = true; revisar(); });
    Motor.opcionesNumericas("opciones-piano", "veredicto-piano", function () {
      var n = ULTIMO.secuencias.length;
      return sinRepetir([
        { valor: n, clave: "correcta",
          razon: "Correcto: ninguna, y el bloque sale vacío aunque opina sea anagrama de piano. La o es la última letra de la entrada y la primera de la salida, así que escribirla obliga a meter las cinco: la pila queda o n a i p con la o en el tope. Sacada la o, lo único que la pila puede entregar es n a i p, y la salida pide p i n a. El recorrido se detiene ahí, tras " +
            ULTIMO.estados + " estados." },
        { valor: 1, clave: "una",
          razon: "Esa es la cuenta cuando la salida es la entrada al revés, y opina no es piano al revés: eso sería onaip. Mire en qué orden puede entregar la pila las cuatro letras que quedan después de escribir la o." },
        { valor: 2, clave: "dos",
          razon: "Dos secuencias requerirían dos formas distintas de servir la o, y aquí la o aparece una sola vez y obliga a meter las cinco letras; después el orden de las otras cuatro ya está decidido." },
        { valor: 5, clave: "una-por-letra",
          razon: "Una secuencia por letra no existe: la cuenta sale del orden en que la pila puede entregar las letras, no del número de letras." }
      ]);
    });
  })();
}
