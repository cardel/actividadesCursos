/* Ejercicio interactivo: equivalencias con tabla de verdad.
   Las formulas de los pares se escriben como texto y pasan por el mismo
   lector que usa el modo libre, asi que la tabla que se muestra es la que
   calcula la pagina y no una copiada a mano. */
var EJERCICIO = (function () {

  var PREC = { sii: 1, imp: 2, o: 3, y: 4, no: 5, var: 6 };
  var SIMBOLO = { sii: "↔", imp: "→", o: "∨", y: "∧" };

  /* Lector. Acepta ¬ ~ !, ∧ &, ∨ |, → ->, ↔ <-> y las variables p, q, r.
     Precedencia de mayor a menor: ¬, ∧, ∨, →, ↔; la → agrupa a la derecha. */
  function tokens(texto) {
    var out = [];
    var i = 0;
    var error = null;
    while (i < texto.length && error === null) {
      var c = texto.charAt(i);
      var dos = texto.substr(i, 2);
      var tres = texto.substr(i, 3);
      if (/\s/.test(c)) {
        i = i + 1;
      } else if (c === "p" || c === "q" || c === "r") {
        out.push({ t: "var", n: c, pos: i });
        i = i + 1;
      } else if (c === "¬" || c === "~" || c === "!") {
        out.push({ t: "no", pos: i });
        i = i + 1;
      } else if (c === "∧" || c === "&") {
        out.push({ t: "y", pos: i });
        i = i + 1;
      } else if (c === "∨" || c === "|") {
        out.push({ t: "o", pos: i });
        i = i + 1;
      } else if (tres === "<->") {
        out.push({ t: "sii", pos: i });
        i = i + 3;
      } else if (c === "↔") {
        out.push({ t: "sii", pos: i });
        i = i + 1;
      } else if (dos === "->") {
        out.push({ t: "imp", pos: i });
        i = i + 2;
      } else if (c === "→") {
        out.push({ t: "imp", pos: i });
        i = i + 1;
      } else if (c === "(" || c === ")") {
        out.push({ t: c, pos: i });
        i = i + 1;
      } else {
        error = "No se reconoce el símbolo " + c + " en la posición " + (i + 1) +
          ". Use p, q, r, paréntesis y ¬ ∧ ∨ → ↔ (o ~ & | -> <->).";
      }
    }
    return error === null ? { lista: out } : { error: error };
  }

  function leer(texto) {
    var tk = tokens(texto);
    var res;
    if (tk.error) {
      res = { error: tk.error };
    } else if (tk.lista.length === 0) {
      res = { error: "La fórmula está vacía." };
    } else {
      var lista = tk.lista;
      var k = 0;
      var error = null;

      var mirar = function () { return k < lista.length ? lista[k] : null; };
      var fallar = function (msg) { if (error === null) { error = msg; } };
      var donde = function () {
        var t = mirar();
        return t === null ? "al final" : "en la posición " + (t.pos + 1);
      };

      var sii, imp, dis, con, neg, atomo;
      sii = function () {
        var a = imp();
        while (error === null && mirar() !== null && mirar().t === "sii") {
          k = k + 1;
          a = { t: "sii", a: a, b: imp() };
        }
        return a;
      };
      imp = function () {
        var a = dis();
        var r = a;
        if (error === null && mirar() !== null && mirar().t === "imp") {
          k = k + 1;
          r = { t: "imp", a: a, b: imp() };
        }
        return r;
      };
      dis = function () {
        var a = con();
        while (error === null && mirar() !== null && mirar().t === "o") {
          k = k + 1;
          a = { t: "o", a: a, b: con() };
        }
        return a;
      };
      con = function () {
        var a = neg();
        while (error === null && mirar() !== null && mirar().t === "y") {
          k = k + 1;
          a = { t: "y", a: a, b: neg() };
        }
        return a;
      };
      neg = function () {
        var r;
        if (mirar() !== null && mirar().t === "no") {
          k = k + 1;
          r = { t: "no", a: neg() };
        } else {
          r = atomo();
        }
        return r;
      };
      atomo = function () {
        var t = mirar();
        var r = { t: "var", n: "p" };
        if (t === null) {
          fallar("Falta una variable o un paréntesis al final.");
        } else if (t.t === "var") {
          k = k + 1;
          r = { t: "var", n: t.n };
        } else if (t.t === "(") {
          k = k + 1;
          r = sii();
          if (mirar() !== null && mirar().t === ")") {
            k = k + 1;
          } else {
            fallar("Falta cerrar un paréntesis " + donde() + ".");
          }
        } else {
          fallar("Se esperaba una variable o un paréntesis " + donde() + ".");
        }
        return r;
      };

      var arbol = sii();
      if (error === null && k < lista.length) {
        fallar("Sobra algo " + donde() + ".");
      }
      res = error === null ? { arbol: arbol } : { error: error };
    }
    return res;
  }

  function evaluar(f, val) {
    var r;
    if (f.t === "var") { r = val[f.n]; }
    else if (f.t === "no") { r = !evaluar(f.a, val); }
    else if (f.t === "y") { r = evaluar(f.a, val) && evaluar(f.b, val); }
    else if (f.t === "o") { r = evaluar(f.a, val) || evaluar(f.b, val); }
    else if (f.t === "imp") { r = !evaluar(f.a, val) || evaluar(f.b, val); }
    else { r = evaluar(f.a, val) === evaluar(f.b, val); }
    return r;
  }

  /* Escribe la formula con los simbolos de las diapositivas. Un binario
     dentro de otro binario lleva parentesis salvo en p ∧ q ∧ r y p ∨ q ∨ r,
     donde la lectura es la misma sin ellos. */
  function mostrar(f) {
    var r;
    if (f.t === "var") {
      r = f.n;
    } else if (f.t === "no") {
      r = "¬" + (f.a.t === "var" || f.a.t === "no" ? mostrar(f.a) : "(" + mostrar(f.a) + ")");
    } else {
      var hijo = function (h) {
        var s = mostrar(h);
        var binario = h.t !== "var" && h.t !== "no";
        var libre = h.t === f.t && (f.t === "y" || f.t === "o");
        return binario && !libre ? "(" + s + ")" : s;
      };
      r = hijo(f.a) + " " + SIMBOLO[f.t] + " " + hijo(f.b);
    }
    return r;
  }

  function variables(arboles) {
    var vistas = {};
    var recorrer = function (f) {
      if (f.t === "var") { vistas[f.n] = true; }
      if (f.a) { recorrer(f.a); }
      if (f.b) { recorrer(f.b); }
    };
    arboles.forEach(recorrer);
    return ["p", "q", "r"].filter(function (v) { return vistas[v]; });
  }

  /* Subformulas compuestas de cada arbol, de las internas a las externas,
     sin repetir y sin incluir las formulas completas. */
  function subformulas(arboles) {
    var vistas = {};
    var completas = {};
    var out = [];
    arboles.forEach(function (f) { completas[mostrar(f)] = true; });
    var recorrer = function (f) {
      if (f.a) { recorrer(f.a); }
      if (f.b) { recorrer(f.b); }
      var s = mostrar(f);
      if (f.t !== "var" && !vistas[s] && !completas[s]) {
        vistas[s] = true;
        out.push(f);
      }
    };
    arboles.forEach(recorrer);
    return out;
  }

  /* Filas en el orden de las diapositivas: la primera con todo en V. */
  function filas(vars) {
    var out = [];
    var m = vars.length;
    var i;
    for (i = 0; i < Math.pow(2, m); i = i + 1) {
      var val = {};
      vars.forEach(function (v, j) { val[v] = ((i >> (m - 1 - j)) & 1) === 0; });
      out.push(val);
    }
    return out;
  }

  function tabla(arboles) {
    var vars = variables(arboles);
    return filas(vars).map(function (val) {
      return { val: val, res: arboles.map(function (f) { return evaluar(f, val); }) };
    });
  }

  function equivalentes(a, b) {
    return tabla([a, b]).every(function (fila) { return fila.res[0] === fila.res[1]; });
  }

  var PARES = [
    { a: "p → q", b: "q → p", equiv: false,
      nota: "Una implicación y su recíproca difieren en dos filas. De que p → q sea verdadera no se sigue nada sobre q → p." },
    { a: "p → q", b: "¬q → ¬p", equiv: true,
      nota: "La implicación y su contrarrecíproca son falsas en la misma fila, p = V y q = F. Por eso demostrar ¬q → ¬p demuestra p → q." },
    { a: "p → q", b: "¬p ∨ q", equiv: true,
      nota: "Las dos son falsas solo cuando p es V y q es F. Esta forma es la que sirve para negar: ¬(¬p ∨ q) da p ∧ ¬q." },
    { a: "¬(p ∧ q)", b: "¬p ∧ ¬q", equiv: false,
      nota: "Al negar una conjunción el ∧ pasa a ∨: ¬(p ∧ q) ≡ ¬p ∨ ¬q. Que no se cumplan las dos a la vez no obliga a que fallen ambas." },
    { a: "¬(p ∨ q)", b: "¬p ∧ ¬q", equiv: true,
      nota: "Ley de De Morgan para la disyunción: que ninguna de las dos se cumpla es lo mismo que fallen ambas." },
    { a: "¬(p → q)", b: "¬p → ¬q", equiv: false,
      nota: "La negación de una implicación no es su inversa. La implicación falla en una sola fila, así que su negación es verdadera solo ahí, y ¬p → ¬q es verdadera en tres." },
    { a: "¬(p → q)", b: "p ∧ ¬q", equiv: true,
      nota: "Es la equivalencia que se usa al negar un ∀ con rango: ¬(0 ≤ i < n → P(i)) pasa a 0 ≤ i < n ∧ ¬P(i)." },
    { a: "q → p", b: "¬p → ¬q", equiv: true,
      nota: "La recíproca y la inversa son contrarrecíprocas entre sí, así que valen lo mismo; ninguna de las dos vale lo que p → q." },
    { a: "p ∧ (q ∨ r)", b: "(p ∧ q) ∨ (p ∧ r)", equiv: true,
      nota: "Distributiva del ∧ sobre el ∨: p se reparte en cada término de la disyunción." },
    { a: "p ∨ (q ∧ r)", b: "(p ∨ q) ∧ r", equiv: false,
      nota: "Mover el paréntesis cambia el resultado. Con p = V y r = F la primera es V y la segunda F. La distributiva da (p ∨ q) ∧ (p ∨ r)." },
    { a: "p ↔ q", b: "(p → q) ∧ (q → p)", equiv: true,
      nota: "Un si y solo si son dos implicaciones, y por eso se demuestra en dos direcciones." },
    { a: "(p ∧ q) → r", b: "p → (q → r)", equiv: true,
      nota: "Pedir dos hipótesis juntas es lo mismo que pedirlas una tras otra. Las dos son falsas solo con p = V, q = V y r = F." },
    { a: "(p ∨ q) → r", b: "(p → r) ∨ (q → r)", equiv: false,
      nota: "La segunda equivale a (p ∧ q) → r. Con p = V, q = F y r = F la primera es F y la segunda es V, porque q → r se cumple sola." }
  ];

  return { leer: leer, evaluar: evaluar, mostrar: mostrar, variables: variables,
           subformulas: subformulas, filas: filas, tabla: tabla,
           equivalentes: equivalentes, pares: PARES };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO;
    function el(id) { return document.getElementById(id); }
    function vf(b) { return b ? "V" : "F"; }

    function celdaTexto(fila, texto, clase) {
      var td = document.createElement("td");
      td.textContent = texto;
      if (clase) { td.className = clase; }
      fila.appendChild(td);
      return td;
    }

    function encabezado(thead, vars, subs, nombres) {
      thead.innerHTML = "";
      var tr = document.createElement("tr");
      vars.forEach(function (v) { var th = document.createElement("th"); th.textContent = v; tr.appendChild(th); });
      subs.forEach(function (s) {
        var th = document.createElement("th");
        th.textContent = E.mostrar(s);
        th.className = "sub";
        tr.appendChild(th);
      });
      nombres.forEach(function (n) { var th = document.createElement("th"); th.textContent = n; tr.appendChild(th); });
      thead.appendChild(tr);
      return tr;
    }

    /* ---------- Pares guiados ---------- */
    var est = null;

    function nuevoPar(k) {
      var par = E.pares[k];
      var a = E.leer(par.a).arbol;
      var b = E.leer(par.b).arbol;
      est = {
        k: k, a: a, b: b, par: par,
        vars: E.variables([a, b]),
        t: E.tabla([a, b]),
        decision: null,
        resp: [],
        completa: false,
        marcada: false
      };
      est.resp = est.t.map(function () { return [null, null]; });
      el("par-progreso").textContent = "Par " + (k + 1) + " de " + E.pares.length;
      el("f1").textContent = E.mostrar(a);
      el("f2").textContent = E.mostrar(b);
      el("btn-si").disabled = false;
      el("btn-no").disabled = false;
      limpiar("v-decision");
      limpiar("v-tabla");
      limpiar("v-fila");
      el("zona-tabla").style.display = "none";
      el("btn-par-siguiente").disabled = true;
      el("btn-par-siguiente").textContent = k === E.pares.length - 1 ? "Ver el resultado" : "Siguiente par";
      pintarTabla();
    }

    function limpiar(id) { var v = el(id); v.className = "veredicto"; v.textContent = ""; }
    function decir(id, ok, texto) { var v = el(id); v.className = ok ? "veredicto bien" : "veredicto mal"; v.textContent = texto; }

    function pintarTabla() {
      var subs = el("ver-subs").checked ? E.subformulas([est.a, est.b]) : [];
      encabezado(el("t-cabeza"), est.vars, subs, ["F₁", "F₂"]);
      if (est.completa && est.par.equiv === false) {
        var th = document.createElement("th");
        th.textContent = "";
        el("t-cabeza").firstChild.appendChild(th);
      }
      var cuerpo = el("t-cuerpo");
      cuerpo.innerHTML = "";
      est.t.forEach(function (fila, i) {
        var tr = document.createElement("tr");
        tr.id = "fila-" + i;
        est.vars.forEach(function (v) { celdaTexto(tr, vf(fila.val[v])); });
        subs.forEach(function (s) { celdaTexto(tr, vf(E.evaluar(s, fila.val)), "sub"); });
        [0, 1].forEach(function (j) {
          var td = document.createElement("td");
          var r = est.resp[i][j];
          if (est.completa) {
            td.textContent = vf(fila.res[j]);
            td.className = "fija";
          } else {
            var b = document.createElement("button");
            b.className = "celda-vf" + (r === null ? "" : r.estado ? " " + r.estado : "");
            b.textContent = r === null ? "?" : vf(r.v);
            b.addEventListener("click", function () {
              var actual = est.resp[i][j];
              var siguiente = actual === null ? true : (actual.v ? false : null);
              est.resp[i][j] = siguiente === null ? null : { v: siguiente, estado: "" };
              pintarTabla();
            });
            td.appendChild(b);
          }
          tr.appendChild(td);
        });
        if (est.completa && est.par.equiv === false) {
          var tdm = document.createElement("td");
          var bm = document.createElement("button");
          bm.textContent = "Esta fila";
          bm.disabled = est.marcada;
          bm.addEventListener("click", function () { marcarFila(i); });
          tdm.appendChild(bm);
          tr.appendChild(tdm);
        }
        if (est.completa && fila.res[0] !== fila.res[1] && est.marcada) { tr.className = "difiere"; }
        cuerpo.appendChild(tr);
      });
    }

    function decidir(dice) {
      var ok = dice === est.par.equiv;
      est.decision = ok;
      if (ok) { puntos.decisiones = puntos.decisiones + 1; }
      el("btn-si").disabled = true;
      el("btn-no").disabled = true;
      el("v-decision").className = "veredicto neutro";
      el("v-decision").textContent = "Anotado: " + (dice ? "equivalentes" : "no equivalentes") +
        ". Ahora la tabla lo decide: complétela fila por fila.";
      el("zona-tabla").style.display = "block";
      pintarTabla();
    }

    function comprobarTabla() {
      var faltan = 0;
      var malas = 0;
      est.t.forEach(function (fila, i) {
        [0, 1].forEach(function (j) {
          var r = est.resp[i][j];
          if (r === null) { faltan = faltan + 1; }
          else if (r.v === fila.res[j]) { r.estado = "bien"; }
          else { r.estado = "mal"; malas = malas + 1; }
        });
      });
      if (malas === 0 && faltan === 0) {
        terminarTabla();
      } else {
        decir("v-tabla", false, (malas > 0 ? malas + (malas === 1 ? " casilla equivocada" : " casillas equivocadas") + " (en rojo). " : "") +
          (faltan > 0 ? "Faltan " + faltan + " por llenar." : ""));
        pintarTabla();
      }
    }

    function revelarFila() {
      var i = 0;
      var hecho = false;
      while (i < est.t.length && !hecho) {
        var lista = est.resp[i][0] !== null && est.resp[i][0].v === est.t[i].res[0] &&
                    est.resp[i][1] !== null && est.resp[i][1].v === est.t[i].res[1];
        if (!lista) {
          est.resp[i] = [{ v: est.t[i].res[0], estado: "dada" }, { v: est.t[i].res[1], estado: "dada" }];
          hecho = true;
        }
        i = i + 1;
      }
      var todas = est.t.every(function (fila, k) {
        return est.resp[k][0] !== null && est.resp[k][0].v === fila.res[0] &&
               est.resp[k][1] !== null && est.resp[k][1].v === fila.res[1];
      });
      if (todas) { terminarTabla(); } else { pintarTabla(); }
    }

    function revelarTodo() {
      est.t.forEach(function (fila, i) {
        est.resp[i] = [{ v: fila.res[0], estado: "dada" }, { v: fila.res[1], estado: "dada" }];
      });
      terminarTabla();
    }

    function terminarTabla() {
      est.completa = true;
      var dif = est.t.filter(function (f) { return f.res[0] !== f.res[1]; }).length;
      if (est.par.equiv) {
        decir("v-tabla", true, "F₁ y F₂ coinciden en las " + est.t.length + " filas: son equivalentes. " +
          (est.decision ? "Era lo que usted anotó." : "Usted había anotado lo contrario.") + " " + est.par.nota);
        cerrarPar();
      } else {
        decir("v-tabla", true, "La tabla está completa. F₁ y F₂ difieren en " + dif +
          (dif === 1 ? " fila." : " filas.") + " Marque una de ellas con el botón de la derecha.");
      }
      pintarTabla();
    }

    function marcarFila(i) {
      var fila = est.t[i];
      var desc = est.vars.map(function (v) { return v + " = " + vf(fila.val[v]); }).join(", ");
      if (fila.res[0] !== fila.res[1]) {
        est.marcada = true;
        if (!fallosFila[est.k]) { puntos.filas = puntos.filas + 1; }
        decir("v-fila", true, "Con " + desc + ", F₁ es " + vf(fila.res[0]) + " y F₂ es " + vf(fila.res[1]) +
          ": esa fila basta para mostrar que no son equivalentes. " +
          (est.decision ? "Era lo que usted anotó." : "Usted había anotado lo contrario.") + " " + est.par.nota);
        cerrarPar();
      } else {
        fallosFila[est.k] = true;
        decir("v-fila", false, "Con " + desc + " las dos valen " + vf(fila.res[0]) +
          ". Una fila donde coinciden no dice nada; busque una donde den valores distintos.");
      }
      pintarTabla();
    }

    function cerrarPar() {
      el("btn-par-siguiente").disabled = false;
      el("puntos").textContent = puntos.decisiones;
    }

    var puntos = { decisiones: 0, filas: 0 };
    var fallosFila = {};

    function siguientePar() {
      if (est.k < E.pares.length - 1) {
        nuevoPar(est.k + 1);
      } else {
        var noEq = E.pares.filter(function (p) { return !p.equiv; }).length;
        el("carta-par").style.display = "none";
        el("carta-fin").style.display = "block";
        el("resumen").textContent = "Decisiones acertadas antes de la tabla: " + puntos.decisiones + " de " +
          E.pares.length + ". Filas marcadas al primer intento en los pares no equivalentes: " +
          puntos.filas + " de " + noEq + ".";
      }
    }

    function reiniciarPares() {
      puntos = { decisiones: 0, filas: 0 };
      fallosFila = {};
      el("puntos").textContent = 0;
      el("carta-par").style.display = "block";
      el("carta-fin").style.display = "none";
      nuevoPar(0);
    }

    /* ---------- Modo libre ---------- */
    function generar() {
      var t1 = el("libre-1").value;
      var t2 = el("libre-2").value;
      var salida = el("libre-salida");
      var v = el("v-libre");
      salida.style.display = "none";
      var l1 = E.leer(t1);
      var l2 = t2.trim() === "" ? null : E.leer(t2);
      if (l1.error) {
        decir("v-libre", false, "F₁: " + l1.error);
      } else if (l2 !== null && l2.error) {
        decir("v-libre", false, "F₂: " + l2.error);
      } else {
        var arboles = l2 === null ? [l1.arbol] : [l1.arbol, l2.arbol];
        var vars = E.variables(arboles);
        var subs = el("libre-subs").checked ? E.subformulas(arboles) : [];
        var nombres = arboles.map(function (f, i) { return (i === 0 ? "F₁ = " : "F₂ = ") + E.mostrar(f); });
        encabezado(el("l-cabeza"), vars, subs, nombres);
        var cuerpo = el("l-cuerpo");
        cuerpo.innerHTML = "";
        var t = E.tabla(arboles);
        t.forEach(function (fila) {
          var tr = document.createElement("tr");
          vars.forEach(function (x) { celdaTexto(tr, vf(fila.val[x])); });
          subs.forEach(function (s) { celdaTexto(tr, vf(E.evaluar(s, fila.val)), "sub"); });
          fila.res.forEach(function (r) { celdaTexto(tr, vf(r), "fija"); });
          if (arboles.length === 2 && fila.res[0] !== fila.res[1]) { tr.className = "difiere"; }
          cuerpo.appendChild(tr);
        });
        salida.style.display = "block";
        var texto;
        if (arboles.length === 1) {
          var nv = t.filter(function (f) { return f.res[0]; }).length;
          texto = nv === t.length ? "F₁ es verdadera en todas las filas: es una tautología."
            : nv === 0 ? "F₁ es falsa en todas las filas: es una contradicción."
            : "F₁ es verdadera en " + nv + " de " + t.length + " filas: depende de los valores de las variables.";
          decir("v-libre", true, texto);
        } else {
          var dif = t.filter(function (f) { return f.res[0] !== f.res[1]; }).length;
          texto = dif === 0 ? "Coinciden en las " + t.length + " filas: F₁ ≡ F₂."
            : "No son equivalentes: difieren en " + dif + (dif === 1 ? " fila" : " filas") + ", marcadas en rojo.";
          decir("v-libre", dif === 0, texto);
        }
        v.style.display = "block";
      }
    }

    el("btn-si").addEventListener("click", function () { decidir(true); });
    el("btn-no").addEventListener("click", function () { decidir(false); });
    el("btn-comprobar").addEventListener("click", comprobarTabla);
    el("btn-fila").addEventListener("click", revelarFila);
    el("btn-todo").addEventListener("click", revelarTodo);
    el("ver-subs").addEventListener("change", pintarTabla);
    el("btn-par-siguiente").addEventListener("click", siguientePar);
    el("btn-reinicio").addEventListener("click", reiniciarPares);
    el("btn-generar").addEventListener("click", generar);
    el("libre-subs").addEventListener("change", function () {
      if (el("libre-salida").style.display === "block") { generar(); }
    });
    ["libre-1", "libre-2"].forEach(function (id) {
      el(id).addEventListener("keydown", function (ev) { if (ev.key === "Enter") { generar(); } });
    });
    nuevoPar(0);
  })();
}
