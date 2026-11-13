/* Ejercicio interactivo: el extremo que se nombra tope. */
var EJERCICIO = (function () {
  var N = 50;
  var TAMANOS = [10, 20, 50];
  var LINEAS = [
    ["// lista sobre arreglo: insertar corre hacia atras lo que ya hay", ""],
    ["int i = l.n;", "bloque-1"],
    ["while (i > p) {", "bloque-1"],
    ["  l.datos[i] = l.datos[i - 1];", "bloque-1"],
    ["  i = i - 1;", "bloque-1"],
    ["  tocados = tocados + 1;", "bloque-1"],
    ["}", ""],
    ["l.datos[p] = e;", ""],
    ["", ""],
    ["// lista enlazada: insertar camina hasta el nodo anterior", ""],
    ["Nodo *anterior = l.cabeza;", "bloque-2"],
    ["int i = 0;", "bloque-2"],
    ["while (i < p - 1) {", "bloque-2"],
    ["  anterior = anterior->siguiente;", "bloque-2"],
    ["  i = i + 1;", "bloque-2"],
    ["  tocados = tocados + 1;", "bloque-2"],
    ["}", ""],
    ["nuevo->siguiente = anterior->siguiente;", ""],
    ["anterior->siguiente = nuevo;", ""]
  ];

  /* La lista sobre arreglo: insertar corre hacia atras desde el final y
     eliminar corre hacia adelante desde p. Se cuenta cada elemento movido. */
  function listaArreglo() {
    return { datos: [], n: 0, tocados: 0 };
  }

  function insertarArreglo(l, p, e) {
    var i = l.n;
    while (i > p) {
      l.datos[i] = l.datos[i - 1];
      i = i - 1;
      l.tocados = l.tocados + 1;
    }
    l.datos[p] = e;
    l.n = l.n + 1;
  }

  function eliminarArreglo(l, p) {
    var i = p;
    while (i < l.n - 1) {
      l.datos[i] = l.datos[i + 1];
      i = i + 1;
      l.tocados = l.tocados + 1;
    }
    l.n = l.n - 1;
  }

  /* La lista enlazada: la posicion 0 no camina, cualquier otra visita p - 1
     nodos para llegar al anterior. */
  function listaEnlazada() {
    return { cabeza: null, n: 0, tocados: 0 };
  }

  function insertarEnlazada(l, p, e) {
    var nuevo = { dato: e, siguiente: null };
    if (p === 0) {
      nuevo.siguiente = l.cabeza;
      l.cabeza = nuevo;
    } else {
      var anterior = l.cabeza;
      var i = 0;
      while (i < p - 1) {
        anterior = anterior.siguiente;
        i = i + 1;
        l.tocados = l.tocados + 1;
      }
      nuevo.siguiente = anterior.siguiente;
      anterior.siguiente = nuevo;
    }
    l.n = l.n + 1;
  }

  function eliminarEnlazada(l, p) {
    if (p === 0) {
      l.cabeza = l.cabeza.siguiente;
    } else {
      var anterior = l.cabeza;
      var i = 0;
      while (i < p - 1) {
        anterior = anterior.siguiente;
        i = i + 1;
        l.tocados = l.tocados + 1;
      }
      anterior.siguiente = anterior.siguiente.siguiente;
    }
    l.n = l.n - 1;
  }

  /* Las cuatro combinaciones: apilar n veces y desapilar n veces. */
  function arregloAlFrente(n) {
    var l = listaArreglo();
    var k = 0;
    while (k < n) { insertarArreglo(l, 0, k); k = k + 1; }
    k = 0;
    while (k < n) { eliminarArreglo(l, 0); k = k + 1; }
    return l.tocados;
  }

  function arregloAlFinal(n) {
    var l = listaArreglo();
    var k = 0;
    while (k < n) { insertarArreglo(l, l.n, k); k = k + 1; }
    k = 0;
    while (k < n) { eliminarArreglo(l, l.n - 1); k = k + 1; }
    return l.tocados;
  }

  function enlazadaAlFrente(n) {
    var l = listaEnlazada();
    var k = 0;
    while (k < n) { insertarEnlazada(l, 0, k); k = k + 1; }
    k = 0;
    while (k < n) { eliminarEnlazada(l, 0); k = k + 1; }
    return l.tocados;
  }

  function enlazadaAlFinal(n) {
    var l = listaEnlazada();
    var k = 0;
    while (k < n) { insertarEnlazada(l, l.n, k); k = k + 1; }
    k = 0;
    while (k < n) { eliminarEnlazada(l, l.n - 1); k = k + 1; }
    return l.tocados;
  }

  function fila(n) {
    return { n: n, af: arregloAlFrente(n), aa: arregloAlFinal(n),
             ef: enlazadaAlFrente(n), ea: enlazadaAlFinal(n) };
  }

  return { n: N, tamanos: TAMANOS, lineas: LINEAS, fila: fila,
           arregloAlFrente: arregloAlFrente, arregloAlFinal: arregloAlFinal,
           enlazadaAlFrente: enlazadaAlFrente, enlazadaAlFinal: enlazadaAlFinal };
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
    var logradas = { cuatro: false, espejo: false };
    function revisar() {
      if (logradas.cuatro && logradas.espejo) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    var ESPERADO = EJERCICIO.fila(EJERCICIO.n);
    pintarCodigo("codigo-contadores", EJERCICIO.lineas);

    var acertadas = { af: false, aa: false, ef: false, ea: false };
    function sinRepetir(lista) {
      var vistos = {};
      return lista.filter(function (o) {
        var nuevo = !vistos[o.valor];
        vistos[o.valor] = true;
        return nuevo;
      });
    }
    function alAcertar(clave) {
      document.getElementById("opciones-" + clave).addEventListener("click", function (ev) {
        var b = ev.target;
        if (b && b.getAttribute && b.getAttribute("data-op") === "correcta") {
          acertadas[clave] = true;
          if (acertadas.af && acertadas.aa && acertadas.ef && acertadas.ea) {
            logradas.cuatro = true; revisar();
          }
        }
      });
    }
    var N = EJERCICIO.n;
    var SUMA_ARREGLO = (N - 1) * N / 2;
    var SUMA_ENLAZADA = (N - 2) * (N - 1) / 2;
    var RAZON_CERO = "Ahí no se mueve nada: la inserción y la eliminación trabajan sobre el extremo que está a la mano, sea el final del arreglo o la cabeza de la lista, y no corren ni recorren nada.";
    function opcionesCero(clave) {
      return function () {
        return sinRepetir([
          { valor: 0, clave: "correcta", razon: "Correcto: 0. " + RAZON_CERO },
          { valor: N, clave: "una-por-op",
            razon: "No es un movimiento por operación: en este extremo la inserción y la eliminación no corren ni recorren nada." },
          { valor: 2 * N, clave: "dos-por-op",
            razon: "Eso sería un movimiento por cada apilar y por cada desapilar, y aquí no hay ninguno: el extremo está a la mano." },
          { valor: ESPERADO[clave === "aa" ? "af" : "ea"], clave: "el-otro",
            razon: "Esa es la cuenta del otro extremo. En este no hay que correr ni caminar." }
        ]);
      };
    }
    function opcionesCaro(clave, suma, espera) {
      return function () {
        var e = ESPERADO[clave];
        return sinRepetir([
          { valor: e, clave: "correcta", razon: "Correcto: " + e + ". " + espera },
          { valor: suma, clave: "mitad",
            razon: "Esa es la cuenta de las " + N + " inserciones. Faltan las " + N + " eliminaciones, que mueven otro tanto." },
          { valor: N * N, clave: "cuadrado",
            razon: "La primera inserción sobre la lista vacía no corre nada y la última corre " + (N - 1) + ", no " + N + ": los sumandos van de 0 a n − 1, así que la suma es menor que n²." },
          { valor: 0, clave: "cero",
            razon: "Ese es el extremo barato. En este hay que correr los elementos o caminar hasta el final en cada operación." }
        ]);
      };
    }
    alAcertar("af"); alAcertar("aa"); alAcertar("ef"); alAcertar("ea");
    Motor.opcionesNumericas("opciones-af", "veredicto-af", opcionesCaro("af", SUMA_ARREGLO,
      "En el arreglo por el frente, la inserción número k corre los k elementos que ya estaban y cada eliminación corre los que quedan: 2·(" + (N - 1) + "·" + N + "/2) = " + ESPERADO.af + "."));
    Motor.opcionesNumericas("opciones-aa", "veredicto-aa", opcionesCero("aa"));
    Motor.opcionesNumericas("opciones-ef", "veredicto-ef", opcionesCero("ef"));
    Motor.opcionesNumericas("opciones-ea", "veredicto-ea", opcionesCaro("ea", SUMA_ENLAZADA,
      "En la enlazada por el final hay que caminar hasta el penúltimo nodo, y el primer elemento entra sin caminar: 2·(" + (N - 2) + "·" + (N - 1) + "/2) = " + ESPERADO.ea + "."));

    var vista = { i: 0 };
    function pintarTabla() {
      var cuerpo = document.getElementById("tabla-n");
      cuerpo.innerHTML = "";
      EJERCICIO.tamanos.forEach(function (n, k) {
        var r = document.createElement("tr");
        var visible = k < vista.i;
        var datos = visible ? EJERCICIO.fila(n) : null;
        var celdas = visible
          ? [n, datos.af, datos.aa, datos.ef, datos.ea]
          : [n, "?", "?", "?", "?"];
        celdas.forEach(function (v, j) {
          var c = document.createElement("td");
          if (!visible && j > 0) { c.className = "pend"; }
          c.textContent = String(v);
          r.appendChild(c);
        });
        cuerpo.appendChild(r);
      });
      document.getElementById("progreso-tabla").textContent =
        vista.i === 0
          ? "ninguna fila a la vista"
          : vista.i + " de " + EJERCICIO.tamanos.length + " filas";
      document.getElementById("btn-fila").disabled = vista.i === EJERCICIO.tamanos.length;
    }
    document.getElementById("btn-fila").addEventListener("click", function () {
      if (vista.i < EJERCICIO.tamanos.length) { vista.i = vista.i + 1; pintarTabla(); }
    });
    document.getElementById("btn-todo").addEventListener("click", function () {
      vista.i = EJERCICIO.tamanos.length; pintarTabla();
    });
    document.getElementById("btn-reinicio").addEventListener("click", function () {
      vista.i = 0; pintarTabla();
    });
    pintarTabla();

    var MENSAJES = {
      acceso: null,
      memoria: "La memoria contigua explica por qué el arreglo calcula la dirección de cualquier casilla de una vez, y eso es lo que lo hace rápido por el final. Por el frente pierde: cada inserción tiene que correr todo para abrir el hueco, y ahí la enlazada gana por goleada.",
      tad: "El contrato de la pila no dice nada de costos. Las cuatro combinaciones cumplen el mismo contrato y dan las mismas salidas; lo que cambia es la estructura de abajo y el extremo escogido.",
      punteros: "Las dos escrituras de puntero son Θ(1) y no se acumulan con el tamaño: por eso la columna de la enlazada por el frente es cero. Lo que se acumula es caminar o correr, que depende de cuántos elementos haya."
    };
    document.querySelectorAll("#opciones-espejo button").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var ver = document.getElementById("veredicto-espejo");
        var m = MENSAJES[boton.dataset.op];
        if (m === null) {
          ver.className = "veredicto bien";
          ver.textContent = "Correcto. El arreglo llega a cualquier casilla calculando su dirección, así que poner al final solo escribe datos[n]; abrir un hueco al frente obliga a correr los n elementos. La enlazada tiene la cabeza en una variable, así que insertar al frente son dos punteros; llegar al final obliga a seguir la cadena nodo por nodo. Cada estructura regala el extremo que tiene a la mano.";
          logradas.espejo = true; revisar();
        } else {
          ver.className = "veredicto mal";
          ver.textContent = m;
        }
      });
    });
  })();
}
