/* Ejercicio interactivo: la cola sobre la lista con puntero al ultimo. */
var EJERCICIO = (function () {
  var LLAMADAS = [
    { op: "encolar", valor: 4 },
    { op: "encolar", valor: 9 },
    { op: "desencolar" },
    { op: "encolar", valor: 6 },
    { op: "desencolar" },
    { op: "desencolar" }
  ];
  var LINEAS_COLA = [
    "void encolar(Elemento e) {",
    "  l.agregar(e);",
    "}",
    "// exige !vacia()",
    "void desencolar() {",
    "  assert(!vacia());",
    "  l.eliminar(0);",
    "}",
    "// exige !vacia()",
    "Elemento frente() {",
    "  assert(!vacia());",
    "  return l.obtener(0);",
    "}"
  ];
  var LINEAS_LISTA = [
    "void agregar(Elemento e) {",
    "  Nodo *nuevo = new Nodo;",
    "  nuevo->dato = e;",
    "  nuevo->siguiente = NULL;",
    "  if (cabeza == NULL) {",
    "    cabeza = nuevo;",
    "  } else {",
    "    ultimo->siguiente = nuevo;",
    "  }",
    "  ultimo = nuevo;",
    "  n = n + 1;",
    "}",
    "",
    "void eliminar(int p) {   // la cola siempre llama con p = 0",
    "  muerto = cabeza;",
    "  cabeza = cabeza->siguiente;",
    "  if (cabeza == NULL) {",
    "    ultimo = NULL;",
    "  }",
    "  delete muerto;",
    "  n = n - 1;",
    "}"
  ];
  var LIMITE = 12;

  function datosDesde(inicio, limite) {
    var salida = [];
    var actual = inicio;
    var vueltas = 0;
    while (actual !== null && vueltas < limite) {
      salida.push(actual.dato);
      actual = actual.siguiente;
      vueltas = vueltas + 1;
    }
    return salida;
  }

  /* Corre las llamadas sobre cabeza, ultimo y n, como lo hace la lista. */
  function corrida(llamadas) {
    var cabeza = null;
    var ultimo = null;
    var n = 0;
    var nuevos = 0;
    var liberados = 0;
    var pasos = [];
    var frentes = [];
    var escrituras = [];
    function rotulo(nodo) {
      return nodo === null ? "NULL" : "nodo del " + nodo.dato;
    }
    var k = 0;
    while (k < llamadas.length) {
      var o = llamadas[k];
      var rama = "";
      var toco = false;
      if (o.op === "encolar") {
        var nuevo = { dato: o.valor, siguiente: null };
        nuevos = nuevos + 1;
        if (cabeza === null) {
          cabeza = nuevo;
          rama = "cabeza == NULL: el nodo nuevo es la cabeza";
        } else {
          ultimo.siguiente = nuevo;
          rama = "la cadena ya existe: ultimo->siguiente toma el nodo nuevo";
        }
        ultimo = nuevo;
        toco = true;
        n = n + 1;
      } else {
        cabeza = cabeza.siguiente;
        liberados = liberados + 1;
        if (cabeza === null) {
          ultimo = null;
          toco = true;
          rama = "la cola se vació: ultimo vuelve a NULL en el mismo paso";
        } else {
          rama = "queda cadena: ultimo no se toca";
        }
        n = n - 1;
      }
      if (toco) { escrituras.push(k + 1); }
      pasos.push({
        llamada: o.op === "encolar" ? "encolar(" + o.valor + ")" : "desencolar()",
        rama: rama,
        cabeza: rotulo(cabeza),
        ultimo: rotulo(ultimo),
        n: n,
        cadena: datosDesde(cabeza, LIMITE),
        escribeUltimo: toco
      });
      frentes.push(cabeza === null ? null : cabeza.dato);
      k = k + 1;
    }
    return { pasos: pasos, frentes: frentes, escrituras: escrituras,
             nuevos: nuevos, liberados: liberados, vacia: cabeza === null };
  }

  return { llamadas: LLAMADAS, lineasCola: LINEAS_COLA,
           lineasLista: LINEAS_LISTA, corrida: corrida };
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
      return texto.trim().split(/[\s,]+/)
                  .filter(function (x) { return x !== ""; }).map(Number);
    }
    function iguales(a, b) {
      return a.length === b.length && a.every(function (x, i) { return x === b[i]; });
    }
    var logradas = { frente: false, ultimo: false, nuevos: false, liberados: false };
    function revisar() {
      if (logradas.frente && logradas.ultimo && logradas.nuevos &&
          logradas.liberados) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    var R = EJERCICIO.corrida(EJERCICIO.llamadas);
    var CINCO = R.frentes.slice(0, 5);

    pintarCodigo("codigo-cola", EJERCICIO.lineasCola.map(function (t, i) {
      return [t, i < 3 ? "bloque-1" : (i < 8 ? "bloque-2" : "")];
    }));
    pintarCodigo("codigo-lista", EJERCICIO.lineasLista.map(function (t, i) {
      return [t, i < 12 ? "bloque-1" : (i > 12 ? "bloque-2" : "")];
    }));

    document.getElementById("btn-frente").addEventListener("click", function () {
      var ver = document.getElementById("veredicto-frente");
      var dada = leerLista(document.getElementById("pred-frente").value);
      if (iguales(dada, CINCO)) {
        ver.className = "veredicto bien";
        ver.textContent = "Correcto: " + CINCO.join(", ") +
          ". El frente solo cambia cuando sale alguien: encolar(9) y encolar(6) ponen al final y dejan la cabeza donde está, y cada desencolar la adelanta al siguiente.";
        logradas.frente = true; revisar();
      } else if (iguales(dada, [4, 9, 9, 6, 6])) {
        ver.className = "veredicto mal";
        ver.textContent = "Eso sería una pila: ahí sale el último que entró. En la cola el frente es la cabeza, y encolar no la toca mientras haya cadena.";
      } else if (dada.length !== 5) {
        ver.className = "veredicto mal";
        ver.textContent = "Cinco valores, uno después de cada una de las cinco primeras llamadas.";
      } else {
        ver.className = "veredicto mal";
        ver.textContent = "frente() devuelve el dato de la cabeza. Siga la cabeza llamada por llamada en el paso a paso de abajo.";
      }
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
        ? { cabeza: "NULL", ultimo: "NULL", n: 0, cadena: [],
            llamada: "antes de la primera llamada", rama: "la cola arranca vacía" }
        : R.pasos[i - 1];
      chip(chips, "cabeza", estado.cabeza, false);
      chip(chips, "ultimo", estado.ultimo, false);
      chip(chips, "n", estado.n, true);
      if (estado.cadena.length === 0) {
        var vacio = document.createElement("span");
        vacio.className = "flecha";
        vacio.textContent = "cadena vacía: cabeza → NULL";
        caja.appendChild(vacio);
      } else {
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
      }
      document.getElementById("progreso-traza").textContent =
        i === 0 ? "sin ejecutar ninguna llamada"
                : "llamada " + i + " de " + R.pasos.length + ": " +
                  estado.llamada + ": " + estado.rama;
      document.getElementById("btn-paso").disabled = i === R.pasos.length;
    }
    document.getElementById("btn-paso").addEventListener("click", function () {
      if (vista.i < R.pasos.length) { vista.i = vista.i + 1; pintarVista(); }
    });
    document.getElementById("btn-reinicio").addEventListener("click", function () {
      vista.i = 0; pintarVista();
    });
    pintarVista();

    document.getElementById("btn-ultimo").addEventListener("click", function () {
      var ver = document.getElementById("veredicto-ultimo");
      var dada = leerLista(document.getElementById("pred-ultimo").value);
      dada.sort(function (a, b) { return a - b; });
      if (iguales(dada, R.escrituras)) {
        ver.className = "veredicto bien";
        ver.textContent = "Correcto: " + R.escrituras.join(", ") +
          ". Los tres encolar terminan en ultimo = nuevo, y la sexta llamada deja la cola vacía y lo devuelve a NULL. En la tercera y la quinta queda un solo nodo y ese nodo ya era el último, así que nadie escribe ultimo.";
        logradas.ultimo = true; revisar();
      } else if (iguales(dada, [1, 2, 3, 4, 5, 6])) {
        ver.className = "veredicto mal";
        ver.textContent = "No en todas: eliminar(0) solo toca ultimo cuando la cabeza queda en NULL, y eso pasa una sola vez.";
      } else if (iguales(dada, [1, 2, 4])) {
        ver.className = "veredicto mal";
        ver.textContent = "Faltan los desencolar. Uno de los tres deja la cola vacía, y ahí el if (cabeza == NULL) devuelve ultimo a NULL.";
      } else if (iguales(dada, [3, 5, 6])) {
        ver.className = "veredicto mal";
        ver.textContent = "Al revés: en la tercera y la quinta llamada queda cadena y ultimo se deja en paz; en cambio los tres encolar lo mueven siempre.";
      } else {
        ver.className = "veredicto mal";
        ver.textContent = "Mire las dos últimas líneas de agregar y el if de eliminar: ahí están las dos formas de escribirle a ultimo.";
      }
    });

    // deja una sola opcion por valor: la correcta va primero y gana
    function unicas(lista) {
      var vistos = {};
      return lista.filter(function (o) {
        var nueva = !vistos[o.valor];
        vistos[o.valor] = true;
        return nueva;
      });
    }
    // avisa cuando el estudiante pulsa la opcion correcta
    function alAcertar(idOpciones, fn) {
      document.getElementById(idOpciones).addEventListener("click", function (e) {
        var b = e.target;
        if (b && b.getAttribute && b.getAttribute("data-op") === "correcta") { fn(); }
      });
    }

    var TOTAL = EJERCICIO.llamadas.length;
    Motor.opcionesNumericas("opciones-new", "veredicto-new", function () {
      return unicas([
        { valor: R.nuevos, clave: "correcta",
          razon: "Correcto: " + R.nuevos + ". Cada encolar pide un nodo con new Nodo, y hubo " + R.nuevos + " encolar. Los desencolar no piden nada." },
        { valor: TOTAL, clave: "todas",
          razon: "No es una reserva por llamada: solo encolar pide memoria. De las " + TOTAL + " llamadas, " + R.nuevos + " son encolar." },
        { valor: 1, clave: "vacia",
          razon: "agregar pide el nodo siempre; el if (cabeza == NULL) solo decide cómo se enlaza, no si se pide." },
        { valor: R.nuevos + 1, clave: "mas",
          razon: "Sobra uno: cuente solo las llamadas a encolar, que son las que ejecutan new Nodo." }
      ]);
    });
    Motor.opcionesNumericas("opciones-delete", "veredicto-delete", function () {
      return unicas([
        { valor: R.liberados, clave: "correcta",
          razon: "Correcto: " + R.liberados + ". Cada desencolar devuelve su nodo con delete. Con " + R.nuevos + " new y " + R.liberados + " delete, la cola termina vacía y sin nodos pendientes." },
        { valor: TOTAL, clave: "todas",
          razon: "No es una devolución por llamada: solo desencolar libera. De las " + TOTAL + " llamadas, " + R.liberados + " son desencolar." },
        { valor: 0, clave: "ninguno",
          razon: "Desencolar no solo mueve la cabeza: el nodo que sale se devuelve con delete. Sin esa línea cada desencolar dejaría un nodo perdido." },
        { valor: R.liberados - 1, clave: "menos",
          razon: "Falta uno: el desencolar que deja la cola vacía también devuelve su nodo." }
      ]);
    });
    alAcertar("opciones-new", function () { logradas.nuevos = true; revisar(); });
    alAcertar("opciones-delete", function () { logradas.liberados = true; revisar(); });
  })();
}
