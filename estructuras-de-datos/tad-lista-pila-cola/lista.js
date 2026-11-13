/* Ejercicio interactivo: TAD Lista. */
var EJERCICIO = (function () {
  var OPERACIONES = [["agregar", 4], ["agregar", 6], ["insertar", 0, 2], ["asignar", 2, 9], ["eliminar", 1], ["insertar", 2, 5]];
  /* Llamadas sobre <2 9 5>: cumple o viola la precondicion. */
  var LLAMADAS = [
    { texto: "l.obtener(3)", cumple: false },
    { texto: "l.insertar(3, 1)", cumple: true },
    { texto: "l.eliminar(3)", cumple: false },
    { texto: "l.asignar(0, 7)", cumple: true }
  ];
  var INTERCALAR = { a: [1, 2, 3], b: [8, 9] };

  function simular(ops) {
    var l = [];
    ops.forEach(function (op) {
      if (op[0] === "agregar") { l.push(op[1]); }
      else if (op[0] === "insertar") { l.splice(op[1], 0, op[2]); }
      else if (op[0] === "asignar") { l[op[1]] = op[2]; }
      else { l.splice(op[1], 1); }
    });
    return l;
  }
  /* a0 b0 a1 b1 ...; lo que sobra de la mas larga va al final. */
  function intercalar(a, b) {
    var r = [];
    var i = 0;
    while (i < a.length || i < b.length) {
      if (i < a.length) { r.push(a[i]); }
      if (i < b.length) { r.push(b[i]); }
      i = i + 1;
    }
    return r;
  }
  return { operaciones: OPERACIONES, llamadas: LLAMADAS, intercalar: intercalar, casoIntercalar: INTERCALAR, simular: simular };
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
    pintarCodigo("codigo-ops", [
      ["Lista l;", ""],
      ["l.agregar(4);", "bloque-1"],
      ["l.agregar(6);", "bloque-1"],
      ["l.insertar(0, 2);", "bloque-2"],
      ["l.asignar(2, 9);", "bloque-3"],
      ["l.eliminar(1);", "bloque-2"],
      ["l.insertar(2, 5);", "bloque-2"],
      ["imprimir(l);", ""]
    ]);
    pintarCodigo("codigo-intercalar", [
      ["Lista intercalar(Lista &a, Lista &b) {", ""],
      ["  Lista r;", ""],
      ["  int i = 0;", ""],
      ["  while (i < a.tamano() || i < b.tamano()) {", "bloque-2"],
      ["    if (i < a.tamano()) { r.agregar(a.obtener(i)); }", "bloque-1"],
      ["    if (i < b.tamano()) { r.agregar(b.obtener(i)); }", "bloque-1"],
      ["    i = i + 1;", ""],
      ["  }", ""],
      ["  return r;", ""],
      ["}", ""]
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

    var opsOk = { lista: false, tam: false };
    function revisarOps() {
      if (opsOk.lista && opsOk.tam) { logradas.ops = true; revisar(); }
    }
    var logradas = { ops: false, pre: false, inter: false };
    function revisar() {
      if (logradas.ops && logradas.pre && logradas.inter) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    function texto(l) { return "⟨" + l.join(" ") + "⟩"; }
    function quitar(nombre) {
      return EJERCICIO.operaciones.filter(function (op) { return op[0] !== nombre; });
    }
    Motor.opcionesNumericas("opciones-ops", "veredicto-ops", function () {
      var esperado = EJERCICIO.simular(EJERCICIO.operaciones);
      var sinUltimo = EJERCICIO.simular(EJERCICIO.operaciones.slice(0, -1));
      var sinEliminar = EJERCICIO.simular(quitar("eliminar"));
      var sinAsignar = EJERCICIO.simular(quitar("asignar"));
      return sinRepetidos([
        { valor: texto(esperado), clave: "correcta",
          razon: "Correcto: " + texto(esperado) + ". El insertar(2, 5) final cumple la precondición porque p = n = 2: es agregar al final." },
        { valor: texto(sinUltimo), clave: "sinultimo",
          razon: "Falta el último insertar: con p igual al tamaño, insertar no viola nada y pone el 5 al final." },
        { valor: texto(sinEliminar), clave: "sineliminar",
          razon: "Revise el eliminar(1): quita el elemento de la posición 1 (el 4) y corre el resto a la izquierda." },
        { valor: texto(sinAsignar), clave: "sinasignar",
          razon: "asignar(2, 9) sí cambia la lista: reemplaza el valor de la posición 2, que en ese momento es el 6, por el 9." }
      ]);
    });
    alAcertar("opciones-ops", function () { opsOk.lista = true; revisarOps(); });

    Motor.opcionesNumericas("opciones-ops-n", "veredicto-ops-n", function () {
      var n = EJERCICIO.simular(EJERCICIO.operaciones).length;
      var sinUltimo = EJERCICIO.simular(EJERCICIO.operaciones.slice(0, -1)).length;
      var sinEliminar = EJERCICIO.simular(EJERCICIO.operaciones.filter(function (op) {
        return op[0] !== "eliminar";
      })).length;
      var llamadas = EJERCICIO.operaciones.length;
      return sinRepetidos([
        { valor: n, clave: "correcta",
          razon: "Correcto: tamaño " + n + ". Se agrega dos veces, se inserta una, el eliminar quita una y el último insertar agrega otra; asignar no cambia el tamaño." },
        { valor: sinUltimo, clave: "sinultimo",
          razon: "Falta el último insertar: con p igual al tamaño no viola nada y agrega un elemento." },
        { valor: sinEliminar, clave: "sineliminar",
          razon: "Olvida que eliminar(1) quita un elemento y corre el resto a la izquierda: el tamaño baja en uno." },
        { valor: llamadas, clave: "llamadas",
          razon: "Esas son las " + llamadas + " líneas del programa, no los elementos. asignar no agrega nada y eliminar quita uno." }
      ]);
    });
    alAcertar("opciones-ops-n", function () { opsOk.tam = true; revisarOps(); });

    var aciertosPre = EJERCICIO.llamadas.map(function () { return false; });
    var PISTA_PRE = [
      "obtener exige 0 ≤ p < n, y con n = 3 la posición 3 no existe.",
      "insertar admite p = n: poner en la posición 3 es agregar al final.",
      "eliminar exige p < n: no hay posición 3 que eliminar.",
      "asignar exige 0 ≤ p < n y la posición 0 existe."
    ];
    document.querySelectorAll("[data-llamada]").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var i = parseInt(boton.dataset.llamada, 10);
        var v = document.getElementById("veredicto-pre-" + i);
        var dice = boton.dataset.res === "cumple";
        if (dice === EJERCICIO.llamadas[i].cumple) {
          v.className = "veredicto bien";
          v.textContent = "Así es. " + PISTA_PRE[i];
          aciertosPre[i] = true;
          boton.parentNode.querySelectorAll("button").forEach(function (b) { b.disabled = true; });
          if (aciertosPre.every(function (x) { return x; })) {
            logradas.pre = true;
            revisar();
          }
        } else {
          v.className = "veredicto mal";
          v.textContent = PISTA_PRE[i];
        }
      });
    });

    Motor.opcionesNumericas("opciones-inter", "veredicto-inter", function () {
      var c = EJERCICIO.casoIntercalar;
      var esperado = EJERCICIO.intercalar(c.a, c.b);
      var corto = esperado.slice(0, 2 * c.b.length);
      var seguidas = c.a.concat(c.b);
      var alReves = EJERCICIO.intercalar(c.b, c.a);
      return sinRepetidos([
        { valor: texto(esperado), clave: "correcta",
          razon: "Correcto: " + texto(esperado) + ". En i = 2 la lista b ya se agotó: el segundo if es la precondición de obtener, vigilada desde el área del programador." },
        { valor: texto(corto), clave: "corto",
          razon: "El ciclo sigue mientras alguna de las dos tenga elementos: en i = 2 todavía queda el 3 de a." },
        { valor: texto(seguidas), clave: "seguidas",
          razon: "Eso sería copiar a y después b. Aquí en cada vuelta se agrega uno de a y uno de b." },
        { valor: texto(alReves), clave: "alreves",
          razon: "En cada vuelta se agrega primero a_i y después b_i; empezar por b cambia el orden de cada pareja." }
      ]);
    });
    alAcertar("opciones-inter", function () { logradas.inter = true; revisar(); });
  })();
}
