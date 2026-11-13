/* Ejercicio interactivo: con una pila. */
var EJERCICIO = (function () {
  /* Cadenas de la carta de parentesis y expresiones de la postfija. */
  var CADENAS = ["{[()]}(", "([{}])", "{(})"];
  var EXPRESIONES = { principal: "7 2 3 * - 4 +", trampa: "4 8 2 / -" };

  function cierra(a, c) {
    return (a === "(" && c === ")") || (a === "[" && c === "]") || (a === "{" && c === "}");
  }

  /* -1: balanceada; -2: termina con aperturas sin cerrar; i: falla al leer s[i]. */
  function fallaEn(s) {
    var pila = [];
    var i = 0;
    var r = -1;
    var ok = true;
    while (ok && i < s.length) {
      var ch = s[i];
      if (ch === "(" || ch === "[" || ch === "{") {
        pila.push(ch);
      } else if (pila.length === 0) {
        ok = false;
        r = i;
      } else if (cierra(pila[pila.length - 1], ch)) {
        pila.pop();
      } else {
        ok = false;
        r = i;
      }
      i = i + 1;
    }
    if (ok && pila.length > 0) { r = -2; }
    return r;
  }

  function aplicar(op, a, b) {
    var r = 0;
    if (op === "+") { r = a + b; }
    else if (op === "-") { r = a - b; }
    else if (op === "*") { r = a * b; }
    else { r = Math.trunc(a / b); }
    return r;
  }

  /* Evalua una postfija de digitos; devuelve el valor y la profundidad maxima. */
  function evaluar(s) {
    var pila = [];
    var prof = 0;
    var i = 0;
    while (i < s.length) {
      var ch = s[i];
      if (ch >= "0" && ch <= "9") {
        pila.push(ch.charCodeAt(0) - 48);
        if (pila.length > prof) { prof = pila.length; }
      } else if (ch !== " ") {
        var b = pila.pop();
        var a = pila.pop();
        pila.push(aplicar(ch, a, b));
      }
      i = i + 1;
    }
    return { valor: pila[pila.length - 1], profundidad: prof };
  }

  return { cadenas: CADENAS, expresiones: EXPRESIONES, fallaEn: fallaEn, evaluar: evaluar };
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

    pintarCodigo("codigo-balanceado", [
      ["bool balanceado(const char *s) {", ""],
      ["  Pila p;", ""],
      ["  bool ok = true;", ""],
      ["  int i = 0;", ""],
      ["  while (ok && s[i] != '\\0') {", ""],
      ["    if (s[i] == '(' || s[i] == '[' || s[i] == '{') {", "bloque-1"],
      ["      p.apilar(s[i]);", "bloque-1"],
      ["    } else if (p.vacia()) {", "bloque-2"],
      ["      ok = false;", "bloque-2"],
      ["    } else if (cierra(p.tope(), s[i])) {", "bloque-3"],
      ["      p.desapilar();", "bloque-3"],
      ["    } else {", "bloque-2"],
      ["      ok = false;", "bloque-2"],
      ["    }", ""],
      ["    i = i + 1;", ""],
      ["  }", ""],
      ["  return ok && p.vacia();", "bloque-2"],
      ["}", ""]
    ]);

    var logradas = { balanceado: false, postfija: false };
    function revisar() {
      if (logradas.balanceado && logradas.postfija) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    /* --- Carta 1: tres cadenas ------------------------------------ */
    var aciertos = [false, false, false];
    function leerRespuesta(texto) {
      var t = texto.trim().toLowerCase();
      var r = null;
      if (t === "si" || t === "sí") { r = -1; }
      else if (t === "fin") { r = -2; }
      else if (/^\d+$/.test(t)) { r = parseInt(t, 10); }
      return r;
    }
    function explicar(s, esperado, dado) {
      var m = "";
      if (esperado === -1) {
        m = "Cada cierre encontró su apertura en el tope y al final la pila quedó vacía: balanceada.";
      } else if (esperado === -2) {
        m = "El ciclo termina con ok en verdadero, pero queda una apertura en la pila. Lo rechaza el p.vacia() del return, no el ciclo.";
      } else {
        m = "Al leer s[" + esperado + "] = '" + s[esperado] + "' el tope es '" +
          ((function () { var p = []; for (var k = 0; k < esperado; k++) { var c = s[k]; if ("([{".indexOf(c) >= 0) p.push(c); else p.pop(); } return p[p.length - 1]; })()) +
          "', que no lo cierra: ok pasa a falso ahí.";
      }
      if (dado !== null && dado !== esperado) {
        if (dado === -1 && esperado === -2) { m = "Casi: ningún cierre falla, pero mire qué queda en la pila cuando la cadena se acaba. " + m; }
        else if (dado >= 0 && esperado >= 0 && dado !== esperado) { m = "Falla, sí, pero no en esa posición. Trace la pila carácter por carácter. " + m; }
        else if (dado === -1) { m = "No es balanceada. " + m; }
      }
      return m;
    }
    EJERCICIO.cadenas.forEach(function (s, idx) {
      var boton = document.getElementById("btn-cad-" + idx);
      boton.addEventListener("click", function () {
        var v = document.getElementById("veredicto-cad-" + idx);
        var dado = leerRespuesta(document.getElementById("pred-cad-" + idx).value);
        var esperado = EJERCICIO.fallaEn(s);
        if (dado === null) {
          v.className = "veredicto mal";
          v.textContent = "Escriba si, fin o el índice donde falla.";
        } else if (dado === esperado) {
          v.className = "veredicto bien";
          v.textContent = "Correcto. " + explicar(s, esperado, dado);
          aciertos[idx] = true;
          if (aciertos.every(function (x) { return x; })) {
            logradas.balanceado = true;
            document.getElementById("cierre-balanceado").style.display = "block";
            revisar();
          }
        } else {
          v.className = "veredicto mal";
          v.textContent = explicar(s, esperado, dado);
        }
      });
    });

    /* --- Carta 2: postfija ---------------------------------------- */
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
    var postHecho = { valor: false, prof: false };
    function revelarTrampa() {
      if (postHecho.valor && postHecho.prof) {
        document.getElementById("carta-trampa").style.display = "block";
      }
    }
    var simbolos = EJERCICIO.expresiones.principal.split(" ").length;
    Motor.opcionesNumericas("opciones-post-valor", "veredicto-post-valor", function () {
      var r = EJERCICIO.evaluar(EJERCICIO.expresiones.principal);
      return unicas([
        { valor: r.valor, clave: "correcta",
          razon: "Correcto: 2 3 * da 6, 7 6 - da 1 y 1 4 + da " + r.valor + "." },
        { valor: 19, clave: "izquierda",
          razon: "19 sale de leerla como (7 - 2) * 3 + 4. En postfija el operador actúa sobre los dos últimos apilados: cuando llega el *, arriba están 2 y 3." },
        { valor: 3, clave: "resta-invertida",
          razon: "Revise el orden del -: el segundo que sale de la pila es el primer operando. Es 7 - 6, no 6 - 7." },
        { valor: 1, clave: "sin-suma",
          razon: "Ese es el resultado de 7 6 -, pero la expresión sigue: falta apilar el 4 y aplicar el +." }
      ]);
    });
    alAcertar("opciones-post-valor", function () { postHecho.valor = true; revelarTrampa(); });
    Motor.opcionesNumericas("opciones-post-prof", "veredicto-post-prof", function () {
      var r = EJERCICIO.evaluar(EJERCICIO.expresiones.principal);
      return unicas([
        { valor: r.profundidad, clave: "correcta",
          razon: "Correcto: " + r.profundidad + ". La pila llegó a tener tres números (7, 2 y 3) justo antes del *." },
        { valor: r.profundidad - 1, clave: "sin-el-7",
          razon: "Falta uno: justo antes de leer el * la pila guarda el 7, el 2 y el 3. El 7 sigue ahí esperando a la resta." },
        { valor: r.profundidad + 1, clave: "todos-los-numeros",
          razon: "Esos son los cuatro números de la expresión. El 4 se apila cuando ya no queda el 2 ni el 3: la pila nunca tiene todos a la vez." },
        { valor: simbolos, clave: "simbolos",
          razon: "Ese es el número de símbolos de la expresión, no de la pila. Los operadores sacan elementos: el * deja uno donde había dos." }
      ]);
    });
    alAcertar("opciones-post-prof", function () { postHecho.prof = true; revelarTrampa(); });

    Motor.opcionesNumericas("opciones-trampa", "veredicto-trampa", function () {
      var r = EJERCICIO.evaluar(EJERCICIO.expresiones.trampa);
      return unicas([
        { valor: r.valor, clave: "correcta",
          razon: "Correcto: 8 2 / da 4 y 4 4 - da " + r.valor + ". El 4 que quedó abajo es el primer operando del -." },
        { valor: 4, clave: "sin-resta",
          razon: "Ese es el resultado de 8 2 /. Falta el -: al leerlo, el tope es ese 4 y debajo está el otro 4." },
        { valor: -4, clave: "antes",
          razon: "Cuidado con la resta: -4 sale de restar 4 - 8, antes de dividir. Al leer el -, el tope es el resultado de 8 / 2 y debajo está el 4. Es 4 - 4." },
        { valor: 1, clave: "otro-operador",
          razon: "Ese es 4 / 4: dividir en lugar de restar. El operador que llega es -, no /; vuelva a leer la expresión de izquierda a derecha." }
      ]);
    });
    alAcertar("opciones-trampa", function () { logradas.postfija = true; revisar(); });
  })();
}
