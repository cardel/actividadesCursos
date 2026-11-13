/* Ejercicio interactivo: lo que costó cada solución. */
var EJERCICIO = (function () {
  /* La papa caliente: pases del frente al final que hace ultimo(n, k). */
  function pasesPapa(n, k) { return (n - 1) * (k - 1); }
  /* quitarRepetidos en sitio: casillas corridas por eliminar con la lista sobre arreglo. */
  function corridasRepetidos(lista) {
    var v = lista.slice();
    var p = 0;
    var corridas = 0;
    while (p < v.length - 1) {
      if (v[p] === v[p + 1]) { corridas = corridas + (v.length - (p + 2)); v.splice(p + 1, 1); } else { p = p + 1; }
    }
    return corridas;
  }
  /* ColaDP: trasvases que provoca una secuencia de operaciones. */
  function trasvases(ops) {
    var entrada = [];
    var salida = [];
    var t = 0;
    ops.forEach(function (op) {
      if (op === "encolar") { entrada.push(1); }
      else {
        if (salida.length === 0) { while (entrada.length > 0) { salida.push(entrada.pop()); } t = t + 1; }
        if (op === "desencolar") { salida.pop(); }
      }
    });
    return t;
  }
  /* Cuantas eliminaciones hace quitarRepetidos: cada valor repetido de mas. */
  function eliminacionesRepetidos(lista) {
    var e = 0;
    var p = 0;
    while (p < lista.length - 1) {
      if (lista[p] === lista[p + 1]) { e = e + 1; }
      p = p + 1;
    }
    return e;
  }
  var CASOS = { papa: { n: 7, k: 5 }, repetidos: [4, 4, 4, 4, 9], dp: ["encolar", "encolar", "encolar", "frente", "desencolar", "desencolar", "encolar", "encolar", "desencolar", "frente"] };
  return { casos: CASOS, pasesPapa: pasesPapa, corridasRepetidos: corridasRepetidos, eliminacionesRepetidos: eliminacionesRepetidos, trasvases: trasvases };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
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
    var logradas = { papa: false, repetidos: false, dp: false, balanceado: false };
    function revisar() {
      if (logradas.papa && logradas.repetidos && logradas.dp && logradas.balanceado) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }
    Motor.opcionesNumericas("opciones-papa", "veredicto-papa", function () {
      var c = EJERCICIO.casos.papa;
      return unicas([
        { valor: EJERCICIO.pasesPapa(c.n, c.k), clave: "correcta",
          razon: "Correcto: " + (c.n - 1) + " rondas por " + (c.k - 1) + " pases = " + EJERCICIO.pasesPapa(c.n, c.k) + ", más " + (c.n - 1) + " salidas. Es Θ(nk): con k grande frente a n la papa da vueltas completas, y k módulo el tamaño actual las ahorra." },
        { valor: (c.n - 1) * c.k, clave: "k",
          razon: "Cada ronda pasa k − 1 = " + (c.k - 1) + " veces, no " + c.k + ": la persona número " + c.k + " no pasa, sale." },
        { valor: c.n * (c.k - 1), clave: "n",
          razon: "Las rondas son n − 1 = " + (c.n - 1) + ", porque el juego termina cuando queda una persona." },
        { valor: c.n * c.k, clave: "nk",
          razon: "Eso es n por k sin restar nada: hay n − 1 rondas y en cada una la papa pasa k − 1 veces." }
      ]);
    });
    alAcertar("opciones-papa", function () { logradas.papa = true; revisar(); });
    Motor.opcionesNumericas("opciones-repetidos", "veredicto-repetidos", function () {
      var l = EJERCICIO.casos.repetidos;
      var n = l.length;
      var corridas = EJERCICIO.corridasRepetidos(l);
      var elim = EJERCICIO.eliminacionesRepetidos(l);
      return unicas([
        { valor: corridas, clave: "correcta",
          razon: "Correcto: 3 + 2 + 1 = " + corridas + ". Cada eliminar(p + 1) corre lo que sigue, y con todos iguales se elimina n − 1 veces: Θ(n²) en el peor caso. Construir una lista nueva con agregar sería Θ(n) de tiempo y Θ(n) de espacio." },
        { valor: elim, clave: "eliminaciones",
          razon: "Tres son las eliminaciones. Cada una corre las casillas que quedan a la derecha de la eliminada: 3, luego 2, luego 1." },
        { valor: corridas + elim, clave: "mas-una",
          razon: "Esa cuenta incluye la casilla eliminada en cada paso. eliminar(p + 1) solo corre las que quedan a su derecha: 3, luego 2, luego 1." },
        { valor: (n * (n - 1)) / 2, clave: "peor",
          razon: "Eso supone una eliminación más, que corre 4 casillas. Al eliminar la posición 1 de ⟨4 4 4 4 9⟩ se corren 3; en la siguiente, 2; en la última, 1." }
      ]);
    });
    alAcertar("opciones-repetidos", function () { logradas.repetidos = true; revisar(); });
    Motor.opcionesNumericas("opciones-dp", "veredicto-dp", function () {
      var ops = EJERCICIO.casos.dp;
      var llamadas = ops.filter(function (o) { return o !== "encolar"; }).length;
      var t = EJERCICIO.trasvases(ops);
      return unicas([
        { valor: t, clave: "correcta",
          razon: "Correcto: " + t + ". El primer frente trasvasa tres; los dos primeros desencolar encuentran salida con algo. El tercer desencolar saca el último y vacía salida, y el último frente vuelve a trasvasar. Cada elemento se trasvasa una sola vez: O(1) amortizado." },
        { valor: 1, clave: "uno",
          razon: "Hay un segundo trasvase: después del tercer desencolar, salida queda vacía y el último frente tiene que traer los dos que esperaban en entrada." },
        { valor: ops.filter(function (o) { return o === "desencolar"; }).length, clave: "desencolares",
          razon: "Esa es una por cada desencolar. No se trasvasa en cada desencolar: solo cuando salida está vacía, y el segundo y el tercero encuentran elementos." },
        { valor: llamadas, clave: "todas",
          razon: "Esas son las llamadas a frente y desencolar juntas. Cada una trasvasa solo si salida está vacía, y casi siempre tiene algo." }
      ]);
    });
    alAcertar("opciones-dp", function () { logradas.dp = true; revisar(); });
    var MENSAJES = {
      constante: "La pila guarda las aperturas pendientes; con una cadena de n aperturas guarda las n.",
      lineal: null,
      cuadratico: "Cada carácter dispara a lo sumo una operación de O(1): el tiempo es lineal, y el espacio también en el peor caso."
    };
    document.querySelectorAll("#opciones-bal button").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var v = document.getElementById("veredicto-bal");
        var m = MENSAJES[boton.dataset.op];
        if (m === null) { v.className = "veredicto bien"; v.textContent = "Correcto: Θ(n) en tiempo y O(n) de espacio, que se alcanza con una cadena de puras aperturas."; logradas.balanceado = true; revisar(); }
        else { v.className = "veredicto mal"; v.textContent = m; }
      });
    });
  })();
}
