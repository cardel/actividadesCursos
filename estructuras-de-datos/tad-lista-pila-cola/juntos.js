/* Ejercicio interactivo: los tres contratos, juntos. */
var EJERCICIO = (function () {
  /* meter, quitar y ver: el mismo programa bajo dos disciplinas. */
  var PROGRAMA = [["meter", 5], ["meter", 8], ["quitar"], ["meter", 3], ["ver"]];

  function correr(ops, disciplina) {
    var s = [];
    var visto = null;
    ops.forEach(function (op) {
      if (op[0] === "meter") { s.push(op[1]); }
      else if (op[0] === "quitar") { if (disciplina === "pila") { s.pop(); } else { s.shift(); } }
      else { visto = disciplina === "pila" ? s[s.length - 1] : s[0]; }
    });
    return { ve: visto, tamano: s.length };
  }
  /* Que necesita cada funcion: la disciplina minima con la que se escribe. */
  var FUNCIONES = [
    { texto: "Atender turnos en el orden de llegada", tad: "cola" },
    { texto: "Leer el tercer elemento sin quitar nada", tad: "lista" },
    { texto: "Deshacer la última operación", tad: "pila" },
    { texto: "Insertar un valor en la mitad", tad: "lista" }
  ];
  /* Costos con la lista sobre arreglo: insertar en p corre n - p casillas. */
  function corridasInsertar(n, p) { return n - p; }
  /* revertir con insertar(0, ...): la k-esima insercion corre k - 1. */
  function corridasRevertir(n) { var s = 0; var k = 0; while (k < n) { s = s + k; k = k + 1; } return s; }
  return { programa: PROGRAMA, correr: correr, funciones: FUNCIONES, corridasInsertar: corridasInsertar, corridasRevertir: corridasRevertir };
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
    pintarCodigo("codigo-programa", [
      ["meter(5);", "bloque-1"],
      ["meter(8);", "bloque-1"],
      ["quitar();", "bloque-2"],
      ["meter(3);", "bloque-1"],
      ["printf(\"%d\\n\", ver());", "bloque-3"]
    ]);
    function sinRepetidos(lista) {
      var vistos = [];
      return lista.filter(function (o) {
        var nuevo = vistos.indexOf(o.valor) < 0;
        if (nuevo) { vistos.push(o.valor); }
        return nuevo;
      });
    }
    /* Avisa cuando el estudiante acierta la opcion correcta de un bloque. */
    function alAcertar(idOpciones, hacer) {
      document.getElementById(idOpciones).addEventListener("click", function (e) {
        if (e.target && e.target.getAttribute("data-op") === "correcta") { hacer(); }
      });
    }

    var logradas = { programa: false, funciones: false };
    function revisar() {
      if (logradas.programa && logradas.funciones) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }
    var progOk = { pila: false, cola: false };
    function revisarPrograma() {
      if (progOk.pila && progOk.cola) { logradas.programa = true; revisar(); }
    }
    function opcionesPrograma(disciplina, otra) {
      var id = "opciones-" + disciplina;
      Motor.opcionesNumericas(id, "veredicto-" + disciplina, function () {
        var propio = EJERCICIO.correr(EJERCICIO.programa, disciplina).ve;
        var ajeno = EJERCICIO.correr(EJERCICIO.programa, otra).ve;
        var fondo = EJERCICIO.programa[0][1];
        var accion = disciplina === "pila"
          ? "quitar sacó al 8 y ver lee lo último que quedó"
          : "quitar sacó al 5 y ver lee lo que lleva más tiempo";
        return sinRepetidos([
          { valor: propio, clave: "correcta",
            razon: "Correcto: como " + disciplina + " ve " + propio + ". " + accion + "." },
          { valor: ajeno, clave: "cruzado",
            razon: "Ese es el resultado de la otra disciplina. En la pila quitar saca lo último que entró y ver lee lo último que quedó; en la cola quitar saca lo primero y ver lee lo que lleva más tiempo." },
          { valor: fondo, clave: "sinquitar",
            razon: "Ese es lo primero que entró. " + (disciplina === "pila" ? "En la pila ver lee el tope, no el fondo." : "En la cola quitar ya lo sacó: el frente es el siguiente.") }
        ]);
      });
      alAcertar(id, function () { progOk[disciplina] = true; revisarPrograma(); });
    }
    opcionesPrograma("pila", "cola");
    opcionesPrograma("cola", "pila");
    /* --- Carta 3: cuanto cuesta ----------------------------------- */
    var costosOk = { insertar: false, revertir: false, mc: false };
    function revisarCostos() {
      if (costosOk.insertar && costosOk.revertir && costosOk.mc) {
        document.getElementById("cierre-costos").style.display = "block";
      }
    }
    Motor.opcionesNumericas("opciones-c-insertar", "veredicto-c-insertar", function () {
      var n = 8;
      var p = 2;
      var buena = EJERCICIO.corridasInsertar(n, p);
      return sinRepetidos([
        { valor: buena, clave: "correcta",
          razon: "Correcto: " + buena + ". Se corren las casillas de la posición " + p + " a la " + (n - 1) + " para abrir campo; las anteriores no se tocan. Por eso insertar en medio es O(n) y agregar al final O(1)." },
        { valor: n, clave: "todo",
          razon: "No se corre todo el arreglo: lo que está antes de la posición " + p + " se queda quieto." },
        { valor: p, clave: "antes",
          razon: "Se corre lo que está desde la posición " + p + " hasta el final, no lo de antes." },
        { valor: buena + 1, clave: "nueva",
          razon: "La casilla nueva no se corre: se abre en la posición " + p + " y recibe el valor. Se corren solo las " + buena + " que ya estaban." }
      ]);
    });
    alAcertar("opciones-c-insertar", function () { costosOk.insertar = true; revisarCostos(); });
    Motor.opcionesNumericas("opciones-c-revertir", "veredicto-c-revertir", function () {
      var n = 6;
      var buena = EJERCICIO.corridasRevertir(n);
      return sinRepetidos([
        { valor: buena, clave: "correcta",
          razon: "Correcto: 0 + 1 + 2 + 3 + 4 + 5 = " + buena + ". Cada insertar al frente corre todo lo ya escrito: n(n − 1)/2 corridas, Θ(n²). Con agregar desde el final no se corre nada: Θ(n)." },
        { valor: n, clave: "inserciones",
          razon: "Seis son las inserciones. La pregunta es cuántas casillas se corren en total: la primera corre 0, la segunda 1, la tercera 2..." },
        { valor: buena + n, clave: "desde1",
          razon: "Casi: la primera inserción corre 0 casillas, no 1, porque la lista está vacía." },
        { valor: n * (n - 1), clave: "sinmitad",
          razon: "Falta dividir entre 2: la suma 0 + 1 + ... + (n − 1) es n(n − 1)/2, no n(n − 1)." }
      ]);
    });
    alAcertar("opciones-c-revertir", function () { costosOk.revertir = true; revisarCostos(); });
    var MENSAJES_MC = {
      lineal: "La pila auxiliar recibe los n elementos antes de devolverlos: el espacio aparte de la pila es Θ(n), no constante.",
      constante: null,
      cuadratico: "No hay nada cuadrático: son 2n operaciones de O(1) y una auxiliar que llega a n."
    };
    document.querySelectorAll("#opciones-c-mc button").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var v = document.getElementById("veredicto-c-mc");
        var m = MENSAJES_MC[boton.dataset.op];
        if (m === null) {
          v.className = "veredicto bien"; v.textContent = "Correcto: Θ(n) en tiempo y Θ(n) de espacio. Mirar sin destruir se paga con la pila auxiliar; en la cola, dar la vuelta cuesta Θ(n) de tiempo y Θ(1) de espacio.";
          costosOk.mc = true; revisarCostos();
        } else { v.className = "veredicto mal"; v.textContent = m; }
      });
    });

    var aciertos = EJERCICIO.funciones.map(function () { return false; });
    var PISTA = {
      cola: "Solo hace falta sacar en orden de llegada: la cola alcanza.",
      pila: "Solo hace falta lo último: la pila alcanza.",
      lista: "Hace falta una posición, y ni la pila ni la cola la tienen: toca lista."
    };
    document.querySelectorAll("[data-fn]").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var i = parseInt(boton.dataset.fn, 10);
        var v = document.getElementById("veredicto-fn-" + i);
        var esperado = EJERCICIO.funciones[i].tad;
        if (boton.dataset.tad === esperado) {
          v.className = "veredicto bien";
          v.textContent = "Así es. " + PISTA[esperado];
          aciertos[i] = true;
          boton.parentNode.querySelectorAll("button").forEach(function (b) { b.disabled = true; });
          if (aciertos.every(function (x) { return x; })) { logradas.funciones = true; revisar(); }
        } else {
          v.className = "veredicto mal";
          v.textContent = "Con lista se puede todo, pero la pregunta es cuál es el contrato más pequeño que alcanza. " + PISTA[esperado === "lista" ? "lista" : boton.dataset.tad];
        }
      });
    });
  })();
}
