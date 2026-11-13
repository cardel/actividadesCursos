/* Ejercicio interactivo: concatenar dos colas de nodos. */
var EJERCICIO = (function () {
  var C = [5, 2];
  var D = [9, 4, 7];

  function crear(datos) {
    var cola = { cabeza: null, ultimo: null, n: 0 };
    datos.forEach(function (d) { encolar(cola, d, null); });
    return cola;
  }

  function encolar(cola, e, cuenta) {
    var nuevo = { dato: e, siguiente: null };
    if (cuenta !== null) { cuenta.nuevos = cuenta.nuevos + 1; }
    if (cola.ultimo === null) {
      cola.cabeza = nuevo;
    } else {
      cola.ultimo.siguiente = nuevo;
    }
    cola.ultimo = nuevo;
    cola.n = cola.n + 1;
  }

  function desencolar(cola, cuenta) {
    cola.cabeza = cola.cabeza.siguiente;
    if (cola.cabeza === null) {
      cola.ultimo = null;
    }
    if (cuenta !== null) { cuenta.liberados = cuenta.liberados + 1; }
    cola.n = cola.n - 1;
  }

  function contenido(cola) {
    var salida = [];
    var actual = cola.cabeza;
    while (actual !== null && salida.length < 20) {
      salida.push(actual.dato);
      actual = actual.siguiente;
    }
    return salida;
  }

  /* La version que reengancha nodos; sinRama quita el caso de la cola vacia. */
  function concatenar(esta, otra, sinRama) {
    var fallo = null;
    if (otra.cabeza !== null) {
      if (esta.ultimo === null && !sinRama) {
        esta.cabeza = otra.cabeza;
      } else if (esta.ultimo === null) {
        fallo = "ultimo es NULL y se escribe ultimo->siguiente";
      } else {
        esta.ultimo.siguiente = otra.cabeza;
      }
      if (fallo === null) {
        esta.ultimo = otra.ultimo;
        esta.n = esta.n + otra.n;
        otra.cabeza = null;
        otra.ultimo = null;
        otra.n = 0;
      }
    }
    return fallo;
  }

  /* La version con el contrato: un encolar y un desencolar por elemento. */
  function concatenarContrato(esta, otra) {
    var cuenta = { nuevos: 0, liberados: 0 };
    while (otra.n !== 0) {
      encolar(esta, otra.cabeza.dato, cuenta);
      desencolar(otra, cuenta);
    }
    return cuenta;
  }

  function probar(c, d, version, sinRama) {
    var x = crear(c);
    var y = crear(d);
    var r = version === "contrato" ? concatenarContrato(x, y) : concatenar(x, y, sinRama);
    return { esta: contenido(x), n: x.n, otra: contenido(y), nOtra: y.n, resultado: r };
  }

  return { c: C, d: D, probar: probar };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var X = EJERCICIO;
    var R = X.probar(X.c, X.d, "punteros", false);
    var K = X.probar(X.c, X.d, "contrato", false);
    function decir(id, bien, texto) {
      var ver = document.getElementById(id);
      ver.className = "veredicto " + (bien ? "bien" : "mal");
      ver.textContent = texto;
    }
    var logradas = { resultado: false, resultadoC: false, resultadoD: false, costo: false, contrato: false,
                     contratoNuevos: false, contratoLiberados: false, vacia: false, vaciar: false };
    function revisar() {
      logradas.resultado = logradas.resultadoC && logradas.resultadoD;
      logradas.contrato = logradas.contratoNuevos && logradas.contratoLiberados;
      if (Object.keys(logradas).every(function (k) { return logradas[k]; })) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    /* Anota el acierto: el boton de la correcta lleva data-op="correcta". */
    function alAcertar(idOpciones, clave) {
      document.getElementById(idOpciones).addEventListener("click", function (e) {
        var t = e.target;
        if (t && t.getAttribute && t.getAttribute("data-op") === "correcta") {
          logradas[clave] = true; revisar();
        }
      });
    }
    /* Deja la correcta y los distractores con valores distintos, hasta cuatro. */
    function sinRepetir(lista) {
      var salida = [];
      lista.forEach(function (o) {
        var repetido = false;
        salida.forEach(function (x) { if (x.valor === o.valor) { repetido = true; } });
        if (!repetido && salida.length < 4) { salida.push(o); }
      });
      return salida;
    }

    Motor.opcionesNumericas("opciones-resultado", "veredicto-resultado", function () {
      var antes = X.c.slice();
      var d = X.d.slice();
      var alReves = antes.concat(d.slice().reverse());
      return sinRepetir([
        { valor: R.esta.join(" "), clave: "correcta",
          razon: "Correcto: c = " + R.esta.join(" ") + ". Los nodos de d se cuelgan detrás del 2, en su orden: ultimo de c pasa a apuntar a la cabeza de d, y ultimo de c pasa a ser el último de d." },
        { valor: d.concat(antes).join(" "), clave: "delante",
          razon: "Eso pone los nodos de d delante de c. La función no toca la cabeza de c: engancha d detrás del último, y lo que ya estaba en c sigue adelante." },
        { valor: antes.join(" "), clave: "sin-cambio",
          razon: "Esa es c antes de la llamada. ultimo->siguiente = otra.cabeza cuelga los nodos de d detrás del último de c." },
        { valor: alReves.join(" "), clave: "invertida",
          razon: "d entra en el orden de sus nodos, no al revés: la cadena de d se cuelga entera, sin recorrerla, así que conserva su orden." }
      ]);
    });
    alAcertar("opciones-resultado", "resultadoC");

    Motor.opcionesNumericas("opciones-d", "veredicto-d", function () {
      return sinRepetir([
        { valor: R.nOtra, clave: "correcta",
          razon: "Correcto: d.tamano() = " + R.nOtra + ". La función deja otra.cabeza, otra.ultimo y otra.n en cero: los nodos de d ahora son de c." },
        { valor: X.d.length, clave: "intacta",
          razon: "La función deja otra.cabeza, otra.ultimo y otra.n en cero: d ya no tiene nodos." },
        { valor: R.n, clave: "total",
          razon: "Ese es el tamaño de c después de concatenar, con los nodos de d incluidos. d se queda sin ellos." },
        { valor: X.c.length, clave: "original",
          razon: "Ese era el tamaño de c antes de la llamada. La pregunta es por d, que entregó sus nodos." }
      ]);
    });
    alAcertar("opciones-d", "resultadoD");

    var MSJ_COSTO = {
      uno: "Correcto: Θ(1). Se escriben cuatro punteros y dos enteros, sin importar cuántos nodos tenga cada cola. En espacio aparte también Θ(1): ningún nodo se reserva.",
      m: "Θ(m) sería si hubiera que recorrer d. Aquí no se visita ningún nodo de d fuera de los dos extremos, que d ya tiene en cabeza y ultimo.",
      nm: "Θ(n + m) sería si hubiera que recorrer las dos. El último de c está en ultimo, así que no hace falta caminar por c tampoco."
    };
    document.querySelectorAll("#opciones-costo button").forEach(function (b) {
      b.addEventListener("click", function () {
        var op = b.dataset.op;
        decir("veredicto-costo", op === "uno", MSJ_COSTO[op]);
        if (op === "uno") { logradas.costo = true; revisar(); }
      });
    });

    Motor.opcionesNumericas("opciones-nuevos", "veredicto-nuevos", function () {
      var nu = K.resultado.nuevos;
      return sinRepetir([
        { valor: nu, clave: "correcta",
          razon: "Correcto: " + nu + ". Cada elemento de d se copia a un nodo nuevo de c. El resultado es el mismo, " + K.esta.join(" ") + ", pero cuesta Θ(m) en tiempo, con m = d.tamano(), y m reservas de memoria." },
        { valor: 0, clave: "ninguno",
          razon: "Desde afuera de la clase no se ven los nodos de d: encolar reserva uno nuevo por elemento." },
        { valor: K.esta.length, clave: "total",
          razon: "Ese es el tamaño final de c. Los nodos que c ya tenía no se reservan de nuevo: solo se copian los de d." },
        { valor: 1, clave: "uno",
          razon: "El ciclo da una vuelta por elemento de d, con un encolar en cada una, y cada encolar reserva un nodo." }
      ]);
    });
    alAcertar("opciones-nuevos", "contratoNuevos");

    Motor.opcionesNumericas("opciones-liberados", "veredicto-liberados", function () {
      var li = K.resultado.liberados;
      return sinRepetir([
        { valor: li, clave: "correcta",
          razon: "Correcto: " + li + ". Cada vuelta libera con delete el nodo viejo de d, el que desencolar saca del frente." },
        { valor: 0, clave: "ninguno",
          razon: "desencolar libera el nodo del frente de d cada vez que se llama, y se llama una vez por vuelta." },
        { valor: X.c.length, clave: "de-c",
          razon: "Ese es el tamaño original de c, y sus nodos no se liberan: lo que sale es el frente de d." },
        { valor: 2 * li, clave: "doble",
          razon: "Eso suma las reservas con las liberaciones. Aquí se pregunta solo por los delete, uno por vuelta." }
      ]);
    });
    alAcertar("opciones-liberados", "contratoLiberados");

    var MSJ_VACIA = {
      falla: "Correcto. Con c vacía, ultimo vale NULL y ultimo->siguiente lee un puntero nulo: el programa se cae. La rama que falta es la que pone cabeza = otra.cabeza, igual que encolar sobre una cola vacía.",
      vacia: "La función sí hace algo: escribe ultimo->siguiente, y en una cola vacía ultimo es NULL.",
      bien: "Funcionaría si se saltara la escritura de ultimo->siguiente, pero el código la hace siempre que d tenga elementos."
    };
    document.querySelectorAll("#opciones-vacia button").forEach(function (b) {
      b.addEventListener("click", function () {
        var op = b.dataset.op;
        decir("veredicto-vacia", op === "falla", MSJ_VACIA[op]);
        if (op === "falla") { logradas.vacia = true; revisar(); }
      });
    });

    var MSJ_VACIAR = {
      doble: "Correcto. Sin esas tres líneas, d sigue apuntando a los nodos 9, 4 y 7, que ahora también son de c. Al salir del ámbito se destruyen las dos colas, y el destructor de cada una libera esos tres nodos: el segundo delete cae sobre memoria ya liberada.",
      tamano: "d.tamano() quedaría mal, es cierto, pero eso es lo de menos. El daño grave aparece al destruir las colas.",
      nada: "Las dos colas compartirían nodos. Cualquier operación sobre d cambia c, y al final los dos destructores liberan los mismos nodos."
    };
    document.querySelectorAll("#opciones-vaciar button").forEach(function (b) {
      b.addEventListener("click", function () {
        var op = b.dataset.op;
        decir("veredicto-vaciar", op === "doble", MSJ_VACIAR[op]);
        if (op === "doble") { logradas.vaciar = true; revisar(); }
      });
    });
  })();
}
