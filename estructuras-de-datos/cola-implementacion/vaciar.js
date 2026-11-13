/* Ejercicio interactivo: el ultimo al vaciar la cola de nodos. */
var EJERCICIO = (function () {
  var LINEAS_ROTO = [
    "void encolar(Elemento e) {",
    "  Nodo *nuevo = new Nodo;",
    "  nuevo->dato = e;",
    "  nuevo->siguiente = NULL;",
    "  if (ultimo == NULL) {",
    "    cabeza = nuevo;",
    "  } else {",
    "    ultimo->siguiente = nuevo;",
    "  }",
    "  ultimo = nuevo;",
    "  n = n + 1;",
    "}",
    "",
    "// exige !vacia()",
    "void desencolar() {",
    "  assert(!vacia());",
    "  Nodo *muerto = cabeza;",
    "  cabeza = cabeza->siguiente;",
    "  delete muerto;",
    "  n = n - 1;",
    "}"
  ];
  var LINEAS_DESENCOLAR = [
    "// exige !vacia()",
    "void desencolar() {",
    "  assert(!vacia());",
    "  Nodo *muerto = cabeza;",
    "  cabeza = cabeza->siguiente;",
    "  if (cabeza == NULL) {",
    "    ultimo = NULL;",
    "  }",
    "  delete muerto;",
    "  n = n - 1;",
    "}"
  ];
  var LLAMADAS = [
    { op: "encolar", valor: 3 },
    { op: "desencolar" },
    { op: "encolar", valor: 7 }
  ];
  var LIMITE = 12;

  /* Corre la secuencia sobre nodos marcados como liberados cuando se devuelven.
     conGuarda: desencolar devuelve ultimo a NULL al quedar la cola vacia.
     decideConUltimo: encolar escoge la rama mirando ultimo en vez de cabeza. */
  function corrida(conGuarda, decideConUltimo, llamadas) {
    var cabeza = null;
    var ultimo = null;
    var n = 0;
    var sobreLiberado = false;
    var nuevo = null;
    var k = 0;
    while (k < llamadas.length) {
      var o = llamadas[k];
      if (o.op === "encolar") {
        nuevo = { dato: o.valor, siguiente: null, liberado: false };
        var primera = decideConUltimo ? ultimo === null : cabeza === null;
        if (primera) {
          cabeza = nuevo;
        } else {
          if (ultimo.liberado) { sobreLiberado = true; }
          ultimo.siguiente = nuevo;
        }
        ultimo = nuevo;
        n = n + 1;
      } else {
        var muerto = cabeza;
        cabeza = cabeza.siguiente;
        if (conGuarda && cabeza === null) {
          ultimo = null;
        }
        muerto.liberado = true;
        n = n - 1;
      }
      k = k + 1;
    }
    var cadena = [];
    var alcanzable = false;
    var actual = cabeza;
    var vueltas = 0;
    while (actual !== null && vueltas < LIMITE) {
      cadena.push(actual.dato);
      if (actual === nuevo) { alcanzable = true; }
      actual = actual.siguiente;
      vueltas = vueltas + 1;
    }
    return { sobreLiberado: sobreLiberado, alcanzable: alcanzable,
             cabezaEnNull: cabeza === null, cadena: cadena, n: n };
  }

  /* Punteros de la clase que escribe desencolar: cabeza siempre, y ultimo
     solo cuando la cola se queda vacia. */
  function escriturasDesencolar(elementos) {
    var escrituras = 1;
    if (elementos === 1) {
      escrituras = escrituras + 1;
    }
    return escrituras;
  }

  /* Vaciar una cola de m elementos, un desencolar por elemento. */
  function escriturasAlVaciar(m) {
    var total = 0;
    var quedan = m;
    while (quedan > 0) {
      total = total + escriturasDesencolar(quedan);
      quedan = quedan - 1;
    }
    return total;
  }

  return { lineasRoto: LINEAS_ROTO, lineasDesencolar: LINEAS_DESENCOLAR,
           llamadas: LLAMADAS, corrida: corrida,
           escriturasDesencolar: escriturasDesencolar,
           escriturasAlVaciar: escriturasAlVaciar };
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
    var logradas = { roto: false, uno: false, varios: false, total: false };
    function revisar() {
      if (logradas.roto && logradas.uno && logradas.varios &&
          logradas.total) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    var ROTO = EJERCICIO.corrida(false, true, EJERCICIO.llamadas);
    var SANO = EJERCICIO.corrida(true, true, EJERCICIO.llamadas);
    var CUATRO = 4;

    pintarCodigo("codigo-roto", EJERCICIO.lineasRoto.map(function (t, i) {
      var clase = "";
      if (i === 7) { clase = "bloque-2"; }
      if (i >= 14 && i <= 20) { clase = "bloque-1"; }
      return [t, clase];
    }));
    pintarCodigo("codigo-desencolar", EJERCICIO.lineasDesencolar.map(function (t, i) {
      return [t, i === 4 || i === 6 ? "bloque-3" : ""];
    }));

    var MENSAJES_ROTO = {
      escribe: null,
      nada: "cabeza sí quedó en NULL, pero esta versión no la consulta: la rama la decide ultimo, que vale la dirección del nodo liberado. Se va por el else y cabeza se queda como estaba.",
      dos: "El nodo del 3 ya se devolvió con delete: no hay dos elementos. Lo que queda es n diciendo 1 y una cadena a la que no se llega desde cabeza.",
      detiene: "Escribir sobre memoria devuelta no detiene el programa de forma confiable: el bloque suele seguir siendo del proceso, así que la escritura pasa y el daño aparece después, en otra parte y sin relación visible."
    };
    document.querySelectorAll("#opciones-roto button").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var ver = document.getElementById("veredicto-roto");
        var m = MENSAJES_ROTO[boton.dataset.op];
        if (m === null) {
          ver.className = "veredicto bien";
          ver.textContent = "Correcto. ultimo vale la dirección del nodo del 3, que ya se liberó, así que la condición ultimo == NULL es falsa y se ejecuta ultimo->siguiente = nuevo sobre memoria devuelta. cabeza se queda en NULL, el nodo del 7 no aparece en la cadena que sale de cabeza y n dice " + ROTO.n +
            ". Con la línea que devuelve ultimo a NULL, el mismo encolar deja la cola con " + SANO.cadena.join(", ") + ".";
          logradas.roto = true; revisar();
        } else {
          ver.className = "veredicto mal";
          ver.textContent = m;
        }
      });
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

    var UNO = EJERCICIO.escriturasDesencolar(1);
    var VARIOS = EJERCICIO.escriturasDesencolar(3);
    Motor.opcionesNumericas("opciones-uno", "veredicto-uno", function () {
      return unicas([
        { valor: UNO, clave: "correcta",
          razon: "Correcto: " + UNO + ". cabeza se escribe siempre; con un solo elemento la cabeza nueva es NULL y entra el if que devuelve ultimo a NULL." },
        { valor: UNO + 1, clave: "muerto",
          razon: "muerto es un puntero local, no uno de los dos de la clase: se muere al salir de la función. Los que sobreviven a la llamada son cabeza y ultimo." },
        { valor: VARIOS, clave: "solo-cabeza",
          razon: "Eso es lo que cuesta con varios elementos. Con uno solo la cabeza nueva queda en NULL y ultimo también se escribe." }
      ]);
    });
    Motor.opcionesNumericas("opciones-varios", "veredicto-varios", function () {
      return unicas([
        { valor: VARIOS, clave: "correcta",
          razon: "Correcto: " + VARIOS + ". Solo se escribe cabeza: la cabeza nueva no es NULL, el if no entra y ultimo no se toca." },
        { valor: UNO, clave: "siempre-dos",
          razon: "El if de la mitad solo entra cuando la cabeza nueva es NULL, que es el caso del único elemento. Con varios, ultimo se queda como estaba." },
        { valor: VARIOS + 2, clave: "muerto",
          razon: "Ese total suma cabeza, ultimo y el local muerto. muerto no es uno de los dos punteros de la clase, y con varios elementos ultimo no se toca." }
      ]);
    });
    Motor.opcionesNumericas("opciones-total", "veredicto-total", function () {
      var esperado = EJERCICIO.escriturasAlVaciar(CUATRO);
      return unicas([
        { valor: esperado, clave: "correcta",
          razon: "Correcto: " + esperado + ". Los tres primeros desencolar dejan cadena y escriben solo cabeza; el cuarto la deja vacía y escribe los dos. Son 3 · 1 + 2 = " + esperado + ", así que vaciar una cola de m elementos cuesta m + 1 escrituras: Θ(m), una por elemento." },
        { valor: CUATRO, clave: "una-por-llamada",
          razon: "Una de las cuatro llamadas cuesta una escritura más: la que deja la cola vacía." },
        { valor: 2 * CUATRO, clave: "dos-por-llamada",
          razon: "El if no entra en todas: tres de las cuatro llamadas dejan cadena y ahí ultimo no se toca." },
        { valor: 3 * (VARIOS + 1) + (UNO + 1), clave: "muerto",
          razon: "Ese total cuenta también el local muerto, que no es uno de los dos punteros de la clase." }
      ]);
    });
    alAcertar("opciones-uno", function () { logradas.uno = true; revisar(); });
    alAcertar("opciones-varios", function () { logradas.varios = true; revisar(); });
    alAcertar("opciones-total", function () { logradas.total = true; revisar(); });
  })();
}
