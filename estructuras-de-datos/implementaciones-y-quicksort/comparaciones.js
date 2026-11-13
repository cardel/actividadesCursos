/* Ejercicio interactivo: comparaciones y profundidad de quicksort. */
var EJERCICIO = (function () {
  var ENTRADAS = {
    ordenado: [2, 5, 8, 11, 14, 17],
    reves: [17, 14, 11, 8, 5, 2],
    balanceado: [14, 2, 20, 17, 8, 5, 11]
  };

  function intercambiar(a, p, q) {
    var temp = a[p];
    a[p] = a[q];
    a[q] = temp;
  }

  /* particionar de la sesion, contando una comparacion por vuelta. */
  function particionar(a, ini, fin, registro) {
    var x = a[fin];
    var i = ini - 1;
    var j = ini;
    while (j < fin) {
      registro.comparaciones = registro.comparaciones + 1;
      if (a[j] <= x) {
        i = i + 1;
        intercambiar(a, i, j);
      }
      j = j + 1;
    }
    intercambiar(a, i + 1, fin);
    return i + 1;
  }

  /* quicksort de la sesion; nivel cuenta las llamadas abiertas, la inicial es 1. */
  function quicksort(a, ini, fin, nivel, registro) {
    if (nivel > registro.profundidad) { registro.profundidad = nivel; }
    if (ini < fin) {
      var antes = registro.comparaciones;
      var rango = a.slice(ini, fin + 1);
      var q = particionar(a, ini, fin, registro);
      registro.llamadas.push({ nivel: nivel, ini: ini, fin: fin, antes: rango,
                               despues: a.slice(ini, fin + 1), q: q,
                               comparaciones: registro.comparaciones - antes });
      quicksort(a, ini, q - 1, nivel + 1, registro);
      quicksort(a, q + 1, fin, nivel + 1, registro);
    }
  }

  function ordenar(v) {
    var a = v.slice();
    var registro = { comparaciones: 0, profundidad: 0, llamadas: [] };
    quicksort(a, 0, a.length - 1, 1, registro);
    registro.final = a;
    return registro;
  }

  return { entradas: ENTRADAS, ordenar: ordenar };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO.entradas;
    var R = {
      ordenado: EJERCICIO.ordenar(E.ordenado),
      reves: EJERCICIO.ordenar(E.reves),
      balanceado: EJERCICIO.ordenar(E.balanceado)
    };
    function decir(id, bien, texto) {
      var ver = document.getElementById(id);
      ver.className = "veredicto " + (bien ? "bien" : "mal");
      ver.textContent = texto;
    }
    var logradas = { ordenado: false, reves: false, balanceado: false, profundidad: false,
                     profOrdenado: false, profBalanceado: false };
    function revisar() {
      logradas.profundidad = logradas.profOrdenado && logradas.profBalanceado;
      if (logradas.ordenado && logradas.reves && logradas.balanceado && logradas.profundidad) {
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

    Motor.opcionesNumericas("opciones-ordenado", "veredicto-ordenado", function () {
      var c = R.ordenado.comparaciones;
      return sinRepetir([
        { valor: c, clave: "correcta",
          razon: "Correcto: " + c + " = 5 + 4 + 3 + 2 + 1. El pivote es siempre el mayor de su rango, la izquierda pierde un solo elemento por llamada y cada partición compara todos los demás: 6 · 5 / 2." },
        { valor: 5, clave: "primera",
          razon: "Esas son las de la primera partición. Después queda a[0..4], todavía ordenado, y se vuelve a partir." },
        { valor: 36, clave: "cuadrado",
          razon: "Es cuadrático, pero no n²: las particiones van encogiendo, con 5, 4, 3, 2 y 1 comparaciones." },
        { valor: 30, clave: "ene-menos-uno",
          razon: "Es cuadrático, pero no n(n − 1): las particiones van encogiendo, con 5, 4, 3, 2 y 1 comparaciones." }
      ]);
    });
    alAcertar("opciones-ordenado", "ordenado");

    Motor.opcionesNumericas("opciones-reves", "veredicto-reves", function () {
      var c = R.reves.comparaciones;
      return sinRepetir([
        { valor: c, clave: "correcta",
          razon: "Correcto: " + c + ", las mismas del ordenado. El primer pivote es el 2, el mínimo: queda en la casilla 0 y la derecha se lleva cinco elementos. Esos cinco ya no vienen al revés, pero en cada llamada el último vuelve a ser el menor o el mayor de su rango, y cada partición quita uno solo." },
        { valor: 5, clave: "primera",
          razon: "Esa es solo la primera partición, que deja el 2 en la casilla 0. La derecha tiene cinco elementos y hay que seguirla." },
        { valor: 36, clave: "cuadrado",
          razon: "Es cuadrático, pero no n²: el primer pivote es el mínimo, queda en la casilla 0 y la partición siguiente ya tiene un elemento menos." },
        { valor: 30, clave: "ene-menos-uno",
          razon: "Eso sería n(n − 1), seis particiones de cinco comparaciones. Al revés no ayuda ni estorba más: cada partición ve un elemento menos, con 5, 4, 3, 2 y 1 comparaciones." }
      ]);
    });
    alAcertar("opciones-reves", "reves");

    Motor.opcionesNumericas("opciones-balanceado", "veredicto-balanceado", function () {
      var c = R.balanceado.comparaciones;
      return sinRepetir([
        { valor: c, clave: "correcta",
          razon: "Correcto: " + c + ". El 11 es la mediana y deja tres de cada lado: 6 comparaciones. Cada lado vuelve a tener la mediana al final, el 5 a la izquierda y el 17 a la derecha, con 2 comparaciones cada uno. Los rangos de un elemento no comparan." },
        { valor: 21, clave: "extremos",
          razon: "21 es lo que costaría con siete elementos si cada pivote fuera un extremo. Mire dónde queda el 11." },
        { valor: 6, clave: "primera",
          razon: "Esa es la primera partición. Quedan dos rangos de tres elementos, y cada uno se parte." },
        { valor: 12, clave: "tres-vueltas",
          razon: "Un rango de tres elementos da dos vueltas, no tres: compara todos menos el pivote." }
      ]);
    });
    alAcertar("opciones-balanceado", "balanceado");

    Motor.opcionesNumericas("opciones-prof-ordenado", "veredicto-prof-ordenado", function () {
      var e = R.ordenado.profundidad;
      return sinRepetir([
        { valor: e, clave: "correcta",
          razon: "Correcto: " + e + ". Con el ordenado cada llamada abre otra con un elemento menos, de a[0..5] hasta a[0..0]: seis registros en la pila a la vez, uno por elemento. Es el espacio aparte de quicksort, Θ(n) en el peor caso." },
        { valor: e - 1, clave: "sin-ultimo",
          razon: "Cuente también la llamada del último nivel, la de rango vacío o de un elemento: abre su registro aunque no entre al if." },
        { valor: 2 * R.ordenado.llamadas.length + 1, clave: "total",
          razon: "Eso cuenta llamadas en total, no las que están abiertas al mismo tiempo. Cuando una llamada termina, su registro sale de la pila." },
        { valor: e + 1, clave: "de-mas",
          razon: "Sobra una: la cadena más larga llega al nivel 6, con a[0..0]; la llamada de rango vacío a[2..1] está en ese mismo nivel, no un nivel más abajo." }
      ]);
    });
    alAcertar("opciones-prof-ordenado", "profOrdenado");

    Motor.opcionesNumericas("opciones-prof-balanceado", "veredicto-prof-balanceado", function () {
      var e = R.balanceado.profundidad;
      return sinRepetir([
        { valor: e, clave: "correcta",
          razon: "Correcto: " + e + ". Con el balanceado, 7 → 3 → 1: tres niveles, ⌈log₂(7 + 1)⌉. Es el espacio aparte de quicksort, Θ(log n) en el caso balanceado." },
        { valor: e - 1, clave: "sin-ultimo",
          razon: "Cuente también la llamada del último nivel, la de rango vacío o de un elemento: abre su registro aunque no entre al if." },
        { valor: 2 * R.balanceado.llamadas.length + 1, clave: "total",
          razon: "Eso cuenta llamadas en total, no las que están abiertas al mismo tiempo. Cuando una llamada termina, su registro sale de la pila." },
        { valor: E.balanceado.length, clave: "elementos",
          razon: "Ese es el número de elementos. Aquí cada llamada parte el rango por la mitad, así que la cadena de llamadas anidadas es mucho más corta que n." }
      ]);
    });
    alAcertar("opciones-prof-balanceado", "profBalanceado");

    var vista = { entrada: "balanceado", k: 0 };
    function pintarTabla() {
      var L = R[vista.entrada].llamadas;
      var cuerpo = document.getElementById("tabla-llamadas");
      cuerpo.innerHTML = "";
      var acumulado = 0;
      var n = 0;
      while (n < L.length) {
        var ll = L[n];
        acumulado = acumulado + ll.comparaciones;
        var tr = document.createElement("tr");
        var celdas = n < vista.k
          ? [n + 1, ll.nivel, "a[" + ll.ini + ".." + ll.fin + "]", ll.antes.join(" "), ll.despues.join(" "), ll.q, ll.comparaciones, acumulado]
          : [n + 1, "", "", "", "", "", "", ""];
        celdas.forEach(function (v) {
          var td = document.createElement("td");
          td.textContent = v;
          if (n >= vista.k) { td.className = "pend"; }
          tr.appendChild(td);
        });
        cuerpo.appendChild(tr);
        n = n + 1;
      }
      document.getElementById("progreso-llamadas").textContent =
        "entrada " + E[vista.entrada].join(" ") + ": " + vista.k + " de " + L.length + " llamadas que parten un rango";
      document.getElementById("btn-llamada").disabled = vista.k === L.length;
    }
    document.querySelectorAll("#opciones-entrada button").forEach(function (b) {
      b.addEventListener("click", function () {
        vista.entrada = b.dataset.op;
        vista.k = 0;
        pintarTabla();
      });
    });
    document.getElementById("btn-llamada").addEventListener("click", function () {
      if (vista.k < R[vista.entrada].llamadas.length) { vista.k = vista.k + 1; pintarTabla(); }
    });
    document.getElementById("btn-reinicio-llamadas").addEventListener("click", function () {
      vista.k = 0; pintarTabla();
    });
    pintarTabla();
  })();
}
