/* Ejercicio interactivo: con una lista. */
var EJERCICIO = (function () {
  var CASOS = {
    repetidos: [2, 2, 2, 5, 5, 9],
    union: { a: [1, 4, 6, 8], b: [2, 4, 5, 8, 9] }
  };

  /* quitarRepetidos tal como quedo en la sesion: p no avanza al eliminar. */
  function quitarRepetidos(l) {
    var v = l.slice();
    var p = 0;
    while (p < v.length - 1) {
      if (v[p] === v[p + 1]) { v.splice(p + 1, 1); } else { p = p + 1; }
    }
    return v;
  }

  /* La variante con p avanzando siempre, incluso al eliminar. */
  function quitarRepetidosAvanzando(l) {
    var v = l.slice();
    var p = 0;
    while (p < v.length - 1) {
      if (v[p] === v[p + 1]) { v.splice(p + 1, 1); }
      p = p + 1;
    }
    return v;
  }

  /* Union ordenada de dos listas ordenadas sin repetidos; cuenta las comparaciones del ciclo principal. */
  function union(a, b) {
    var r = [];
    var i = 0;
    var j = 0;
    var comparaciones = 0;
    while (i < a.length && j < b.length) {
      comparaciones = comparaciones + 1;
      if (a[i] === b[j]) { r.push(a[i]); i = i + 1; j = j + 1; }
      else if (a[i] < b[j]) { r.push(a[i]); i = i + 1; }
      else { r.push(b[j]); j = j + 1; }
    }
    while (i < a.length) { r.push(a[i]); i = i + 1; }
    while (j < b.length) { r.push(b[j]); j = j + 1; }
    return { lista: r, comparaciones: comparaciones };
  }

  return { casos: CASOS, quitarRepetidos: quitarRepetidos, quitarRepetidosAvanzando: quitarRepetidosAvanzando, union: union };
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

    pintarCodigo("codigo-repetidos", [
      ["void quitarRepetidos(Lista &l) {", ""],
      ["  int p = 0;", ""],
      ["  while (p < l.tamano() - 1) {", ""],
      ["    if (l.obtener(p) == l.obtener(p + 1)) {", "bloque-1"],
      ["      l.eliminar(p + 1);", "bloque-1"],
      ["    }", ""],
      ["    p = p + 1;          // avanza siempre", "bloque-2"],
      ["  }", ""],
      ["}", ""]
    ]);

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
    var logradas = { correcto: false, avanzando: false, union: false };
    var texto = { correcto: false, union: false };
    var numero = { correcto: false, union: false };
    function revisar() {
      logradas.correcto = texto.correcto && numero.correcto;
      logradas.union = texto.union && numero.union;
      if (logradas.correcto && logradas.avanzando && logradas.union) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }
    function leerLista(texto) {
      return texto.trim().split(/[\s,]+/).filter(function (x) { return x !== ""; }).map(Number);
    }
    function iguales(a, b) {
      return a.length === b.length && a.every(function (x, i) { return x === b[i]; });
    }

    /* --- Carta 1: la version que avanza siempre ------------------- */
    document.getElementById("btn-avanza").addEventListener("click", function () {
      var v = document.getElementById("veredicto-avanza");
      var dada = leerLista(document.getElementById("pred-avanza").value);
      var esperada = EJERCICIO.quitarRepetidosAvanzando(EJERCICIO.casos.repetidos);
      if (iguales(dada, esperada)) {
        v.className = "veredicto bien";
        v.textContent = "Correcto: ⟨2 2 5 9⟩. Tras eliminar el segundo 2, el tercero se corre a la posición 1 y p ya va en 1: se compara 2 con 5 y el segundo 2 sobrevive. Con el 5 pasa igual, pero solo había dos.";
        logradas.avanzando = true;
        revisar();
      } else if (iguales(dada, [2, 5, 9])) {
        v.className = "veredicto mal";
        v.textContent = "Esa es la salida de la versión correcta. Aquí p avanza aunque acabe de eliminar: el elemento que se corrió a p + 1 no se vuelve a comparar con e_p.";
      } else if (iguales(dada, [2, 2, 5, 5, 9])) {
        v.className = "veredicto mal";
        v.textContent = "Elimina más que eso: en p = 0 compara 2 con 2 y elimina; en p = 1 compara el segundo 2 con el tercero y también elimina. Siga la traza.";
      } else {
        v.className = "veredicto mal";
        v.textContent = "Trace con p = 0, 1, 2, ... recordando que eliminar(p + 1) corre lo que sigue a la posición p + 1.";
      }
    });

    /* --- Carta 2: la version correcta ----------------------------- */
    document.getElementById("btn-correcto").addEventListener("click", function () {
      var v = document.getElementById("veredicto-correcto");
      var dada = leerLista(document.getElementById("pred-correcto").value);
      var esperada = EJERCICIO.quitarRepetidos(EJERCICIO.casos.repetidos);
      if (iguales(dada, esperada)) {
        v.className = "veredicto bien";
        v.textContent = "Correcto: ⟨2 5 9⟩. p solo avanza cuando los vecinos difieren.";
        texto.correcto = true;
        revisar();
      } else {
        v.className = "veredicto mal";
        v.textContent = "Sin avanzar al eliminar, cada valor queda una sola vez: ⟨2 5 9⟩. Vuelva a trazar.";
      }
    });

    /* --- Carta 3: union ------------------------------------------- */
    document.getElementById("btn-union").addEventListener("click", function () {
      var v = document.getElementById("veredicto-union");
      var c = EJERCICIO.casos.union;
      var r = EJERCICIO.union(c.a, c.b);
      var dada = leerLista(document.getElementById("pred-union").value);
      if (iguales(dada, r.lista)) {
        v.className = "veredicto bien";
        v.textContent = "Correcto: ⟨1 2 4 5 6 8 9⟩. Cuando a se agota en el 8, el 9 se copia sin comparar.";
        texto.union = true;
        revisar();
      } else if (iguales(dada, [1, 2, 4, 4, 5, 6, 8, 8, 9])) {
        v.className = "veredicto mal";
        v.textContent = "Eso es mezclar. La unión copia un valor común una sola vez y avanza las dos posiciones.";
      } else if (iguales(dada, [4, 8])) {
        v.className = "veredicto mal";
        v.textContent = "Eso es la intersección. La unión se queda con todo, sin repetir lo común.";
      } else {
        v.className = "veredicto mal";
        v.textContent = "Dos posiciones: iguales, copiar una vez y avanzar ambas; distintos, copiar el menor y avanzar solo esa.";
      }
    });

    /* --- Opciones numericas --------------------------------------- */
    Motor.opcionesNumericas("opciones-elim", "veredicto-elim", function () {
      var l = EJERCICIO.casos.repetidos;
      var elim = l.length - EJERCICIO.quitarRepetidos(l).length;
      var primero = l.filter(function (x) { return x === l[0]; }).length - 1;
      var enGrupos = l.filter(function (x, i) { return (i > 0 && l[i - 1] === x) || (i < l.length - 1 && l[i + 1] === x); }).length;
      return unicas([
        { valor: elim, clave: "correcta",
          razon: "Correcto: " + elim + " eliminaciones, dos en p = 0 y una en p = 2. Cada valor sobrante cuesta una llamada." },
        { valor: primero, clave: "solo-primero",
          razon: "Esos son los 2 sobrantes. Cuente también el 5 sobrante: cada valor repetido de más cuesta una llamada a eliminar." },
        { valor: enGrupos, clave: "grupos",
          razon: "Eso cuenta todos los elementos que tienen un vecino igual, y de cada grupo el primero se queda: solo se elimina lo que sobra." },
        { valor: l.length, clave: "tamano",
          razon: "Ese es el tamaño de la lista. eliminar solo se llama cuando el vecino es igual, no una vez por elemento." }
      ]);
    });
    alAcertar("opciones-elim", function () { numero.correcto = true; revisar(); });
    Motor.opcionesNumericas("opciones-comp", "veredicto-comp", function () {
      var c = EJERCICIO.casos.union;
      var r = EJERCICIO.union(c.a, c.b);
      return unicas([
        { valor: r.comparaciones, clave: "correcta",
          razon: "Correcto: " + r.comparaciones + " comparaciones. Cuando a se agota en el 8, el 9 se copia sin comparar." },
        { valor: r.lista.length, clave: "copiados",
          razon: "Ese es el tamaño de la unión. Las comparaciones son las vueltas del ciclo principal, que termina cuando una lista se agota; el resto se copia sin comparar." },
        { valor: c.a.length + c.b.length, clave: "mezclar",
          razon: "Eso sería una comparación por elemento de las dos listas. Un valor común se compara una vez y avanza las dos posiciones." },
        { valor: Math.max(c.a.length, c.b.length), clave: "larga",
          razon: "Ese es el tamaño de la lista más larga. Cada vuelta avanza una posición, o las dos si los valores son iguales, y el ciclo termina cuando una se agota, no cuando se recorre la otra." }
      ]);
    });
    alAcertar("opciones-comp", function () { numero.union = true; revisar(); });
  })();
}
