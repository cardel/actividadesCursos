/* Ejercicio interactivo: la pila sobre la lista enlazada. */
var EJERCICIO = (function () {
  var OPERACIONES = [
    { nombre: "apilar(4)", clase: "apilar", valor: 4 },
    { nombre: "apilar(9)", clase: "apilar", valor: 9 },
    { nombre: "apilar(2)", clase: "apilar", valor: 2 },
    { nombre: "desapilar()", clase: "desapilar" },
    { nombre: "apilar(6)", clase: "apilar", valor: 6 }
  ];
  var LINEAS = [
    ["class Pila {", ""],
    ["private:", ""],
    ["  Lista l;", ""],
    ["public:", ""],
    ["  void apilar(Elemento e) {", "bloque-1"],
    ["    l.insertar(0, e);", "bloque-1"],
    ["  }", ""],
    ["  // exige !vacia()", ""],
    ["  void desapilar() {", "bloque-2"],
    ["    assert(!vacia());", "bloque-2"],
    ["    l.eliminar(0);", "bloque-2"],
    ["  }", ""],
    ["  // exige !vacia()", ""],
    ["  Elemento tope() {", "bloque-3"],
    ["    assert(!vacia());", "bloque-3"],
    ["    return l.obtener(0);", "bloque-3"],
    ["  }", ""],
    ["};", ""],
    ["", ""],
    ["// lo que hace la lista en la posicion 0", ""],
    ["// insertar(0, e)", ""],
    ["nuevo->siguiente = cabeza;", "bloque-1"],
    ["cabeza = nuevo;", "bloque-1"],
    ["// eliminar(0)", ""],
    ["muerto = cabeza;", "bloque-2"],
    ["cabeza = cabeza->siguiente;", "bloque-2"],
    ["delete muerto;", "bloque-2"]
  ];

  /* La lista enlazada por la posicion 0: insertar pone el nodo nuevo de
     primero y eliminar saca el primero. Se cuentan los nodos visitados y las
     escrituras de puntero. */
  function nuevaLista() {
    return { cabeza: null, n: 0, visitados: 0, escrituras: 0 };
  }

  function insertarAlFrente(l, e) {
    var nuevo = { dato: e, siguiente: l.cabeza };
    l.escrituras = l.escrituras + 1;
    l.cabeza = nuevo;
    l.escrituras = l.escrituras + 1;
    l.n = l.n + 1;
  }

  function eliminarDelFrente(l) {
    l.cabeza = l.cabeza.siguiente;
    l.escrituras = l.escrituras + 1;
    l.n = l.n - 1;
  }

  function datosDesde(cabeza) {
    var salida = [];
    var actual = cabeza;
    while (actual !== null) {
      salida.push(actual.dato);
      actual = actual.siguiente;
    }
    return salida;
  }

  /* Una foto del estado tras cada operacion de la secuencia. */
  function traza(ops) {
    var l = nuevaLista();
    var pasos = [];
    var k = 0;
    while (k < ops.length) {
      var o = ops[k];
      if (o.clase === "apilar") {
        insertarAlFrente(l, o.valor);
      } else {
        eliminarDelFrente(l);
      }
      pasos.push({
        nombre: o.nombre,
        cadena: datosDesde(l.cabeza),
        tope: l.cabeza === null ? null : l.cabeza.dato,
        tamano: l.n,
        visitados: l.visitados,
        escrituras: l.escrituras
      });
      k = k + 1;
    }
    return pasos;
  }

  function cadenaFinal() {
    var pasos = traza(OPERACIONES);
    return pasos[pasos.length - 1].cadena;
  }

  function topeFinal() {
    var pasos = traza(OPERACIONES);
    return pasos[pasos.length - 1].tope;
  }

  function tamanoFinal() {
    var pasos = traza(OPERACIONES);
    return pasos[pasos.length - 1].tamano;
  }

  return { operaciones: OPERACIONES, lineas: LINEAS, traza: traza,
           cadenaFinal: cadenaFinal, topeFinal: topeFinal,
           tamanoFinal: tamanoFinal };
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
    function leerLista(texto) {
      return texto.trim().split(/[\s,]+/).filter(function (x) { return x !== ""; }).map(Number);
    }
    function iguales(a, b) {
      return a.length === b.length && a.every(function (x, i) { return x === b[i]; });
    }
    var logradas = { cadena: false, tope: false, tamano: false, camina: false };
    function revisar() {
      if (logradas.cadena && logradas.tope && logradas.tamano && logradas.camina) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    var PASOS = EJERCICIO.traza(EJERCICIO.operaciones);
    var FINAL = EJERCICIO.cadenaFinal();
    pintarCodigo("codigo-pila", EJERCICIO.lineas);

    document.getElementById("btn-cadena").addEventListener("click", function () {
      var ver = document.getElementById("veredicto-cadena");
      var cadena = leerLista(document.getElementById("pred-cadena").value);
      if (iguales(cadena, FINAL)) {
        ver.className = "veredicto bien";
        ver.textContent = "Correcto: la cadena es " + FINAL.join(" ") + ". Los tres primeros dejan 2 9 4; el desapilar saca el 2, que es el que estaba en la cabeza, y queda 9 4; el 6 entra de primero.";
        logradas.cadena = true; revisar();
      } else if (iguales(cadena, [4, 9, 6])) {
        ver.className = "veredicto mal";
        ver.textContent = "Ese es el orden de llegada. insertar(0, e) pone el nodo nuevo de primero, así que la cadena queda al revés de como entraron los elementos.";
      } else if (iguales(cadena, [6, 2, 9, 4]) || iguales(cadena, [6, 9, 4, 2])) {
        ver.className = "veredicto mal";
        ver.textContent = "El desapilar quitó un nodo: eliminar(0) libera el de la cabeza, que era el del 2. Quedan tres elementos, no cuatro.";
      } else if (iguales(cadena, [6, 4, 9]) || iguales(cadena, [6, 9, 2])) {
        ver.className = "veredicto mal";
        ver.textContent = "El que sale es el de la cabeza, no el del fondo. Después de apilar 4, 9 y 2 la cabeza es el nodo del 2.";
      } else {
        ver.className = "veredicto mal";
        ver.textContent = "Siga la cabeza: cada apilar la cambia por el nodo nuevo y el desapilar la pasa al siguiente. El paso a paso de abajo muestra cada operación.";
      }
    });

    function tomar(lista, valorCorrecto) {
      var vistos = {};
      return lista.filter(function (o) {
        var nuevo = !vistos[o.valor] && (o.clave === "correcta" || o.valor !== valorCorrecto);
        vistos[o.valor] = true;
        return nuevo;
      });
    }
    function alAcertar(idCaja, clave) {
      document.getElementById(idCaja).addEventListener("click", function (e) {
        var b = e.target;
        if (b && b.getAttribute && b.getAttribute("data-op") === "correcta") {
          logradas[clave] = true; revisar();
        }
      });
    }
    alAcertar("opciones-tope", "tope");
    alAcertar("opciones-tamano", "tamano");
    Motor.opcionesNumericas("opciones-tope", "veredicto-tope", function () {
      var t = EJERCICIO.topeFinal();
      var r = tomar([
        { valor: t, clave: "correcta",
          razon: "Correcto: tope() lee la posición 0, y la cabeza quedó en el nodo del " + t + ", el último que entró." },
        { valor: 2, clave: "desapilado",
          razon: "El 2 era la cabeza antes del desapilar; ese nodo ya se liberó. Después entró el 6 de primero." },
        { valor: 4, clave: "llegada",
          razon: "El 4 fue el primero en llegar y está al final de la cadena. tope() mira la cabeza, no el fondo." },
        { valor: 9, clave: "segundo",
          razon: "El 9 es el segundo de la cadena. La cabeza es el nodo que entró último." }
      ], t);
      return r;
    });
    Motor.opcionesNumericas("opciones-tamano", "veredicto-tamano", function () {
      var n = EJERCICIO.tamanoFinal();
      return tomar([
        { valor: n, clave: "correcta",
          razon: "Correcto: entraron cuatro elementos, salió uno y quedan " + n + "." },
        { valor: PASOS.length, clave: "operaciones",
          razon: "Eso cuenta las operaciones, no los elementos: el desapilar resta uno en vez de sumar." },
        { valor: PASOS.length - 1, clave: "sin-desapilar",
          razon: "Se olvidó del desapilar: cuatro apilar dejarían " + (PASOS.length - 1) + ", pero uno salió." },
        { valor: n - 1, clave: "doble",
          razon: "Restó el desapilar dos veces o no contó el apilar(6): después de sacar el 2 todavía entró el 6." }
      ], n);
    });
    var vista = { i: 0 };
    function chip(padre, rotulo, valor, cuenta) {
      var d = document.createElement("div");
      d.className = "chip" + (cuenta ? " cuenta" : "");
      var b = document.createElement("b");
      b.textContent = rotulo + ": ";
      d.appendChild(b);
      d.appendChild(document.createTextNode(String(valor)));
      padre.appendChild(d);
    }
    function pintarVista() {
      var chips = document.getElementById("chips-traza");
      var caja = document.getElementById("cadena-traza");
      chips.innerHTML = "";
      caja.innerHTML = "";
      var i = vista.i;
      var estado = i === 0
        ? { nombre: "la pila vacía", cadena: [], tope: null, tamano: 0, escrituras: 0 }
        : PASOS[i - 1];
      chip(chips, "cabeza", estado.tope === null ? "NULL" : "nodo del " + estado.tope, false);
      chip(chips, "tope()", estado.tope === null ? "la precondición no se cumple" : estado.tope, true);
      chip(chips, "tamano()", estado.tamano, true);
      chip(chips, "escrituras de puntero", estado.escrituras, true);
      if (estado.cadena.length === 0) {
        var vacio = document.createElement("span");
        vacio.className = "flecha";
        vacio.textContent = "cabeza → NULL";
        caja.appendChild(vacio);
      }
      estado.cadena.forEach(function (d, k) {
        var f = document.createElement("span");
        f.className = "ficha";
        f.textContent = d;
        caja.appendChild(f);
        var fl = document.createElement("span");
        fl.className = "flecha";
        fl.textContent = k === estado.cadena.length - 1 ? "→ NULL" : "→";
        caja.appendChild(fl);
      });
      document.getElementById("progreso-traza").textContent =
        i === 0
          ? "sin ejecutar ninguna operación"
          : "operación " + i + " de " + PASOS.length + ": " + estado.nombre;
      document.getElementById("btn-paso").disabled = i === PASOS.length;
    }
    document.getElementById("btn-paso").addEventListener("click", function () {
      if (vista.i < PASOS.length) { vista.i = vista.i + 1; pintarVista(); }
    });
    document.getElementById("btn-reinicio").addEventListener("click", function () {
      vista.i = 0; pintarVista();
    });
    pintarVista();

    var MENSAJES = {
      cabeza: null,
      puntero: "La pila no tiene más campos que la lista: su parte privada es una sola línea, Lista l. El puntero que sirve es la cabeza, que la lista ya tenía.",
      corta: "El tamaño no entra en la cuenta. insertar(0, e) escribe dos punteros con tres elementos y con un millón: por eso es Θ(1) y no Θ(n).",
      contador: "n cuenta cuántos elementos hay y sirve para las precondiciones y para tamano(), pero no dice dónde está ningún nodo. Ubicar el nodo de la posición p exige seguir la cadena, y eso es lo que hace nodoEn."
    };
    document.querySelectorAll("#opciones-camina button").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var ver = document.getElementById("veredicto-camina");
        var m = MENSAJES[boton.dataset.op];
        if (m === null) {
          ver.className = "veredicto bien";
          ver.textContent = "Correcto. insertar(0, e) y eliminar(0) toman la rama de la posición 0, que no llama a nodoEn, y obtener(0) llama a nodoEn(0), cuyo ciclo while (i < 0) no da ni un paso. Las cinco operaciones suman " + PASOS[PASOS.length - 1].escrituras + " escrituras de puntero y ningún nodo visitado de más.";
          logradas.camina = true; revisar();
        } else {
          ver.className = "veredicto mal";
          ver.textContent = m;
        }
      });
    });
  })();
}
