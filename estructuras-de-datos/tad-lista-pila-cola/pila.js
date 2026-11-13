/* Ejercicio interactivo: TAD Pila. */
var EJERCICIO = (function () {
  var OPERACIONES = [["apilar", 5], ["apilar", 2], ["tope"], ["desapilar"], ["apilar", 7], ["apilar", 4], ["desapilar"], ["tope"]];
  var CONTAR = { pila: [4, 9, 4, 4, 1], x: 4 };

  function simular(ops) {
    var p = [];
    var topes = [];
    ops.forEach(function (op) {
      if (op[0] === "apilar") { p.push(op[1]); }
      else if (op[0] === "desapilar") { p.pop(); }
      else { topes.push(p[p.length - 1]); }
    });
    return { topes: topes, tamano: p.length, pila: p.slice() };
  }
  /* Cuenta x dejando la pila como estaba; si restaurar es falso, olvida el segundo ciclo. */
  function contar(pila, x, restaurar) {
    var p = pila.slice();
    var aux = [];
    var c = 0;
    while (p.length > 0) {
      if (p[p.length - 1] === x) { c = c + 1; }
      aux.push(p.pop());
    }
    if (restaurar) { while (aux.length > 0) { p.push(aux.pop()); } }
    return { cuenta: c, pila: p };
  }
  return { operaciones: OPERACIONES, casoContar: CONTAR, simular: simular, contar: contar };
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
      ["Pila p;", ""],
      ["p.apilar(5);", "bloque-1"],
      ["p.apilar(2);", "bloque-1"],
      ["printf(\"%d\\n\", p.tope());", "bloque-3"],
      ["p.desapilar();", "bloque-2"],
      ["p.apilar(7);", "bloque-1"],
      ["p.apilar(4);", "bloque-1"],
      ["p.desapilar();", "bloque-2"],
      ["printf(\"%d %d\\n\", p.tope(), p.tamano());", "bloque-3"]
    ]);
    pintarCodigo("codigo-contar", [
      ["int contar(Pila &p, Elemento x) {", ""],
      ["  Pila aux;", ""],
      ["  int c = 0;", ""],
      ["  while (!p.vacia()) {", "bloque-2"],
      ["    if (p.tope() == x) { c = c + 1; }", ""],
      ["    aux.apilar(p.tope());", "bloque-2"],
      ["    p.desapilar();", "bloque-2"],
      ["  }", ""],
      ["  while (!aux.vacia()) {", "bloque-1"],
      ["    p.apilar(aux.tope());", "bloque-1"],
      ["    aux.desapilar();", "bloque-1"],
      ["  }", ""],
      ["  return c;", ""],
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

    var logradas = { ops: false, contar: false, olvido: false };
    function revisar() {
      if (logradas.ops && logradas.contar && logradas.olvido) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    var opsOk = { t1: false, t2: false, n: false };
    function revisarOps() {
      if (opsOk.t1 && opsOk.t2 && opsOk.n) { logradas.ops = true; revisar(); }
    }
    var contarOk = { cuenta: false, tope: false };
    function revisarContar() {
      if (contarOk.cuenta && contarOk.tope) {
        logradas.contar = true;
        document.getElementById("carta-olvido").style.display = "block";
        revisar();
      }
    }
    function sinOps(nombre) {
      return EJERCICIO.operaciones.filter(function (op) { return op[0] !== nombre; });
    }
    function opcionesOps(id, idver, armar) {
      Motor.opcionesNumericas(id, idver, armar);
      alAcertar(id, function () { opsOk[id.replace("opciones-", "")] = true; revisarOps(); });
    }
    opcionesOps("opciones-t1", "veredicto-t1", function () {
      var r = EJERCICIO.simular(EJERCICIO.operaciones);
      var abajo = EJERCICIO.operaciones[0][1];
      var luego = EJERCICIO.operaciones[4][1];
      return sinRepetidos([
        { valor: r.topes[0], clave: "correcta",
          razon: "Correcto: " + r.topes[0] + ". Es lo último que se apiló antes de esa línea, y tope lee sin quitar." },
        { valor: abajo, clave: "abajo",
          razon: "El " + abajo + " está abajo de todo. Eso sería el frente de una cola; el tope es lo último apilado." },
        { valor: luego, clave: "luego",
          razon: "El " + luego + " se apila más adelante en el programa: en esa línea todavía no existe." }
      ]);
    });
    opcionesOps("opciones-t2", "veredicto-t2", function () {
      var r = EJERCICIO.simular(EJERCICIO.operaciones);
      var abajo = EJERCICIO.operaciones[0][1];
      var ultimo = EJERCICIO.operaciones[5][1];
      return sinRepetidos([
        { valor: r.topes[1], clave: "correcta",
          razon: "Correcto: " + r.topes[1] + ". El " + ultimo + " entró y salió; el " + abajo + " sigue abajo y nadie lo ha leído." },
        { valor: ultimo, clave: "ultimo",
          razon: "El " + ultimo + " fue lo último apilado, sí, pero el desapilar que sigue lo quita. Lea el tope después de ese desapilar." },
        { valor: abajo, clave: "abajo",
          razon: "El " + abajo + " está abajo de todo. Solo se lee el tope, que es lo último que quedó." },
        { valor: r.topes[0], clave: "primero",
          razon: "El " + r.topes[0] + " ya salió con el primer desapilar; no vuelve a ser el tope." }
      ]);
    });
    opcionesOps("opciones-n", "veredicto-n", function () {
      var r = EJERCICIO.simular(EJERCICIO.operaciones);
      var sinSegundo = EJERCICIO.simular(EJERCICIO.operaciones.slice(0, 6).concat(EJERCICIO.operaciones.slice(7))).tamano;
      var ignora = EJERCICIO.simular(sinOps("desapilar")).tamano;
      return sinRepetidos([
        { valor: r.tamano, clave: "correcta",
          razon: "Correcto: tamaño " + r.tamano + ". Se apilan cuatro y se desapilan dos." },
        { valor: sinSegundo, clave: "sinsegundo",
          razon: "Olvida el segundo desapilar: se apilaron " + ignora + " y salió solo uno." },
        { valor: ignora, clave: "ignora",
          razon: "Cuenta todos los apilar y ningún desapilar. Cada desapilar quita un elemento." }
      ]);
    });

    Motor.opcionesNumericas("opciones-cuenta", "veredicto-cuenta", function () {
      var c = EJERCICIO.casoContar;
      var r = EJERCICIO.contar(c.pila, c.x, true);
      return sinRepetidos([
        { valor: r.cuenta, clave: "correcta",
          razon: "Correcto: hay " + r.cuenta + " veces el " + c.x + ". El primer ciclo mira cada elemento una vez, del tope hacia abajo, y cuenta los iguales a x." },
        { valor: c.pila.length, clave: "todos",
          razon: "Esos son todos los elementos de la pila. El ciclo solo suma cuando el tope es igual a x." },
        { valor: c.x, clave: "valor",
          razon: "Ese es el valor x que se busca, no cuántas veces aparece." },
        { valor: r.cuenta - 1, clave: "corto",
          razon: "Se queda corto: el ciclo recorre toda la pila hasta el fondo, y el " + c.pila[0] + " del fondo también es igual a x y cuenta." }
      ]);
    });
    alAcertar("opciones-cuenta", function () { contarOk.cuenta = true; revisarContar(); });
    Motor.opcionesNumericas("opciones-tope", "veredicto-tope", function () {
      var c = EJERCICIO.casoContar;
      var r = EJERCICIO.contar(c.pila, c.x, true);
      var tope = r.pila[r.pila.length - 1];
      return sinRepetidos([
        { valor: tope, clave: "correcta",
          razon: "Correcto: el tope sigue siendo " + tope + ". El primer ciclo vacía p hacia aux invirtiendo el orden; el segundo lo invierte de nuevo y p queda igual." },
        { valor: c.pila[0], clave: "invertida",
          razon: "Ese sería el tope si p quedara invertida. El segundo ciclo devuelve los elementos de aux en el orden original." },
        { valor: r.cuenta, clave: "cuenta",
          razon: "Esa es la cuenta que devuelve la función, no el tope de p." }
      ]);
    });
    alAcertar("opciones-tope", function () { contarOk.tope = true; revisarContar(); });

    var MENSAJES = {
      igual: "Sin el segundo ciclo nadie devuelve los elementos: se quedan en aux, que muere al terminar la función.",
      vacia: null,
      invertida: "Para que quedara invertida habría que devolver aux a p con un ciclo distinto. Sin ningún ciclo, p queda como la dejó el primero."
    };
    document.querySelectorAll("#opciones-olvido button").forEach(function (boton) {
      boton.addEventListener("click", function () {
        var v = document.getElementById("veredicto-olvido");
        var m = MENSAJES[boton.dataset.op];
        if (m === null) {
          v.className = "veredicto bien";
          v.textContent = "Correcto: p queda vacía. La cuenta sale bien (3) y el programa no viola ninguna precondición; el daño aparece después, cuando quien llamó vuelve a usar p.";
          logradas.olvido = true;
          revisar();
        } else {
          v.className = "veredicto mal";
          v.textContent = m;
        }
      });
    });
  })();
}
