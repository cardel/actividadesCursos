/* Ejercicio interactivo: TAD Cola. */
var EJERCICIO = (function () {
  var OPERACIONES = [["encolar", 3], ["encolar", 6], ["desencolar"], ["encolar", 1], ["frente"], ["encolar", 8], ["desencolar"], ["frente"]];
  var ROTAR = { cola: [4, 7, 1, 9], k: 3 };

  function simular(ops) {
    var c = [];
    var frentes = [];
    ops.forEach(function (op) {
      if (op[0] === "encolar") { c.push(op[1]); }
      else if (op[0] === "desencolar") { c.shift(); }
      else { frentes.push(c[0]); }
    });
    return { frentes: frentes, tamano: c.length, cola: c.slice() };
  }
  /* Pasa los primeros k del frente al final. */
  function rotar(cola, k) {
    var c = cola.slice();
    var i = 0;
    while (i < k) { c.push(c.shift()); i = i + 1; }
    return c;
  }
  return { operaciones: OPERACIONES, casoRotar: ROTAR, simular: simular, rotar: rotar };
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
      ["Cola c;", ""],
      ["c.encolar(3);", "bloque-1"],
      ["c.encolar(6);", "bloque-1"],
      ["c.desencolar();", "bloque-2"],
      ["c.encolar(1);", "bloque-1"],
      ["printf(\"%d\\n\", c.frente());", "bloque-3"],
      ["c.encolar(8);", "bloque-1"],
      ["c.desencolar();", "bloque-2"],
      ["printf(\"%d %d\\n\", c.frente(), c.tamano());", "bloque-3"]
    ]);
    pintarCodigo("codigo-rotar", [
      ["void rotar(Cola &c, int k) {", ""],
      ["  int i = 0;", ""],
      ["  while (i < k) {", ""],
      ["    Elemento x = c.frente();", "bloque-2"],
      ["    c.desencolar();", "bloque-2"],
      ["    c.encolar(x);", "bloque-1"],
      ["    i = i + 1;", ""],
      ["  }", ""],
      ["}", ""]
    ]);
    pintarCodigo("codigo-vacia", [
      ["Cola c;", ""],
      ["c.encolar(2);", "bloque-1"],
      ["c.desencolar();", "bloque-2"],
      ["printf(\"vacia: %d\\n\", c.vacia());", ""],
      ["printf(\"%d\\n\", c.frente());", "bloque-3"]
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

    var logradas = { ops: false, rotar: false, vacia: false };
    function revisar() {
      if (logradas.ops && logradas.rotar && logradas.vacia) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    var opsOk = { f1: false, f2: false, n: false };
    function revisarOps() {
      if (opsOk.f1 && opsOk.f2 && opsOk.n) { logradas.ops = true; revisar(); }
    }
    function sinOps(nombre) {
      return EJERCICIO.operaciones.filter(function (op) { return op[0] !== nombre; });
    }
    /* Si el programa se leyera como pila: frente seria el ultimo en entrar. */
    function comoPila(ops) {
      var s = [];
      var vistos = [];
      ops.forEach(function (op) {
        if (op[0] === "encolar") { s.push(op[1]); }
        else if (op[0] === "desencolar") { s.pop(); }
        else { vistos.push(s[s.length - 1]); }
      });
      return vistos;
    }
    function opcionesOps(id, idver, armar) {
      Motor.opcionesNumericas(id, idver, armar);
      alAcertar(id, function () { opsOk[id.replace("opciones-", "")] = true; revisarOps(); });
    }
    opcionesOps("opciones-f1", "veredicto-f1", function () {
      var r = EJERCICIO.simular(EJERCICIO.operaciones);
      var pila = comoPila(EJERCICIO.operaciones);
      var ignora = EJERCICIO.simular(sinOps("desencolar")).frentes;
      return sinRepetidos([
        { valor: r.frentes[0], clave: "correcta",
          razon: "Correcto: " + r.frentes[0] + ". El " + ignora[0] + " ya salió con el primer desencolar; después de él, el frente es el que lleva más tiempo esperando." },
        { valor: pila[0], clave: "pila",
          razon: "Eso sería una pila. En la cola lo que acaba de entrar queda al final, y frente lee el que lleva más tiempo esperando." },
        { valor: ignora[0], clave: "ignora",
          razon: "El " + ignora[0] + " ya salió con el primer desencolar. Después de él, el frente es el " + r.frentes[0] + "." }
      ]);
    });
    opcionesOps("opciones-f2", "veredicto-f2", function () {
      var r = EJERCICIO.simular(EJERCICIO.operaciones);
      var ultimo = EJERCICIO.operaciones[5][1];
      var ignora = EJERCICIO.simular(sinOps("desencolar")).frentes;
      var sinSegundo = EJERCICIO.simular(EJERCICIO.operaciones.slice(0, 6).concat(EJERCICIO.operaciones.slice(7))).frentes;
      return sinRepetidos([
        { valor: r.frentes[1], clave: "correcta",
          razon: "Correcto: " + r.frentes[1] + ". Con los dos desencolar aplicados, la cola es ⟨" + r.cola.join(" ") + "⟩ y el frente es el que lleva más tiempo esperando; el " + ultimo + " espera al final." },
        { valor: ultimo, clave: "pila",
          razon: "Eso sería una pila: el " + ultimo + " es lo último que entró, pero en la cola queda al final y frente no lo lee." },
        { valor: sinSegundo[1], clave: "sinsegundo",
          razon: "Olvida el segundo desencolar: el " + sinSegundo[1] + " sale antes de la lectura, y el frente pasa al siguiente." },
        { valor: ignora[1], clave: "ignora",
          razon: "El " + ignora[1] + " salió con el primer desencolar: solo seguiría de frente si ningún desencolar quitara nada." }
      ]);
    });
    opcionesOps("opciones-n", "veredicto-n", function () {
      var r = EJERCICIO.simular(EJERCICIO.operaciones);
      var sinSegundo = EJERCICIO.simular(EJERCICIO.operaciones.slice(0, 6).concat(EJERCICIO.operaciones.slice(7))).tamano;
      var ignora = EJERCICIO.simular(sinOps("desencolar")).tamano;
      return sinRepetidos([
        { valor: r.tamano, clave: "correcta",
          razon: "Correcto: tamaño " + r.tamano + ". Entran cuatro y salen dos." },
        { valor: sinSegundo, clave: "sinsegundo",
          razon: "Olvida el segundo desencolar: entraron " + ignora + " y salió solo uno." },
        { valor: ignora, clave: "ignora",
          razon: "Cuenta todos los encolar y ningún desencolar. Cada desencolar quita un elemento." }
      ]);
    });

    function texto(l) { return "⟨" + l.join(" ") + "⟩"; }
    Motor.opcionesNumericas("opciones-rotar", "veredicto-rotar", function () {
      var c = EJERCICIO.casoRotar;
      var esperado = EJERCICIO.rotar(c.cola, c.k);
      var corta = EJERCICIO.rotar(c.cola, c.k - 1);
      var larga = EJERCICIO.rotar(c.cola, c.k + 1);
      var invertida = c.cola.slice().reverse();
      return sinRepetidos([
        { valor: texto(esperado), clave: "correcta",
          razon: "Correcto: " + texto(esperado) + ". Tres vueltas mandan 4, 7 y 1 al final, en ese orden, y el 9 queda de frente. Con k = 4 la cola volvería a ser la misma." },
        { valor: texto(corta), clave: "corta",
          razon: "Cuente las vueltas: cada una pasa un solo elemento del frente al final. Con k = 3 pasan tres, no dos." },
        { valor: texto(larga), clave: "larga",
          razon: "Cuente las vueltas: cada una pasa un solo elemento del frente al final. Cuatro vueltas dejarían la cola como empezó; con k = 3 pasan tres." },
        { valor: texto(invertida), clave: "invertida",
          razon: "Los que pasan al final conservan su orden entre sí: la cola no invierte nada." }
      ]);
    });
    alAcertar("opciones-rotar", function () { logradas.rotar = true; revisar(); });

    var MENSAJES = {
      cero: "frente no inventa valores. La implementación vigila n > 0 con assert y detiene el programa.",
      assert: null,
      basura: "Sin assert podría pasar. Con el assert de cola.h, el programa se detiene antes de leer nada."
    };
    document.querySelectorAll("#opciones-vacia button").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var v = document.getElementById("veredicto-vacia");
        var m = MENSAJES[boton.dataset.op];
        if (m === null) {
          v.className = "veredicto bien";
          v.textContent = "Correcto. Salida real: vacia: 1 y luego cola.h:35: Elemento Cola::frente(): Assertion `n > 0' failed. La precondición de frente es la misma de tope y desencolar, y la vigila la implementación.";
          logradas.vacia = true;
          revisar();
        } else {
          v.className = "veredicto mal";
          v.textContent = m;
        }
      });
    });
  })();
}
