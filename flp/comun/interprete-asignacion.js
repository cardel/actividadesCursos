/* El interpretador con asignación, escrito en JavaScript para poder mostrar
   lo que hace. Calca a `Corte 2/1 Asignacion`: su sintaxis, su semántica y
   sus verificaciones.

      <expresion> ::= <numero> | <identificador> | true | false
                  ::= if <exp> then <exp> else <exp>
                  ::= let {<id> = <exp>}* in <exp>
                  ::= proc ( {<id>}*(,) ) <exp>
                  ::= ( <exp> {<exp>}* )
                  ::= letrec {<id> ( {<id>}*(,) ) = <exp>}* in <exp>
                  ::= begin <exp> {; <exp>}* end
                  ::= set <id> = <exp>
                  ::= <primitiva> ( {<exp>}*(,) )
      <primitiva> ::= + | - | * | / | add1 | sub1 | > | >= | < | <= | ==

   El ambiente asocia cada nombre con una celda de un vector, y una
   referencia es la pareja (posición, vector). `set` escribe en la celda y
   devuelve 1. El ambiente inicial es [x=4, y=2, z=5] sobre [a=4, b=5, c=6].

   Con { referencia: true } calca a `Corte 2/2 PasoPorReferencia`: las
   celdas guardan blancos —(direct-target v) o (indirect-target r)—, un
   operando que es una variable se pasa como indirect-target a su celda, la
   gramática admite listas literales [e, …] y el ambiente inicial es
   [x=1, y=2, z=3] sobre [a=4, b=5, c=6].

   Con { copia: true } la clausura se queda con una copia de las celdas del
   ambiente en el momento de crearse. No es la regla de ninguno de los dos
   interpretadores: está para mostrar qué pasaría si el ambiente guardara
   valores en lugar de referencias. */
var InterpreteAsignacion = (function () {
  "use strict";

  var PRIMITIVAS = ["+", "-", "*", "/", "add1", "sub1", ">=", "<=", "==", ">", "<"];
  var PALABRAS = ["if", "then", "else", "let", "letrec", "in", "proc", "true", "false",
                  "begin", "end", "set"];
  var MAX_LLAMADAS = 20000;

  /* --- Scanner ------------------------------------------------------- */
  function tokenizar(texto, opciones) {
    var conListas = !!(opciones && opciones.referencia);
    var tokens = [], i = 0;
    function letra(c) { return /[a-zA-Z]/.test(c); }
    function digito(c) { return /[0-9]/.test(c); }

    while (i < texto.length) {
      var c = texto[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === "%") { while (i < texto.length && texto[i] !== "\n") { i++; } continue; }

      /* Un menos pegado a un dígito es parte del número. */
      if ((digito(c)) || (c === "-" && digito(texto[i + 1] || ""))) {
        var j = i + (c === "-" ? 1 : 0);
        while (j < texto.length && digito(texto[j])) { j++; }
        if (texto[j] === "." && digito(texto[j + 1] || "")) {
          j++;
          while (j < texto.length && digito(texto[j])) { j++; }
        }
        tokens.push({ clase: "numero", lexema: texto.slice(i, j), valor: parseFloat(texto.slice(i, j)) });
        i = j;
        continue;
      }
      if (letra(c)) {
        var k = i;
        while (k < texto.length && (letra(texto[k]) || digito(texto[k]) ||
                                    texto[k] === "?" || texto[k] === "$")) { k++; }
        var palabra = texto.slice(i, k);
        tokens.push({ clase: PALABRAS.indexOf(palabra) !== -1 ? "palabra"
                            : PRIMITIVAS.indexOf(palabra) !== -1 ? "primitiva" : "identificador",
                      lexema: palabra });
        i = k;
        continue;
      }
      var prim = PRIMITIVAS.filter(function (p) {
        return !letra(p[0]) && texto.slice(i, i + p.length) === p;
      })[0];
      if (prim) { tokens.push({ clase: "primitiva", lexema: prim }); i += prim.length; continue; }
      if ("(),=;".indexOf(c) !== -1 || (conListas && "[]".indexOf(c) !== -1)) {
        tokens.push({ clase: "signo", lexema: c }); i++; continue;
      }
      throw new Error("El scanner no reconoce el carácter " + c + ".");
    }
    return tokens;
  }

  /* --- Parser --------------------------------------------------------- */
  function parsear(tokens) {
    var pos = 0;
    function mirar() { return tokens[pos]; }
    function fallar(que) {
      var t = mirar();
      throw new Error("El parser esperaba " + que +
        (t ? " y encontró " + t.lexema : " y el programa se acabó") + ".");
    }
    function comer(lexema) {
      var t = mirar();
      if (!t || t.lexema !== lexema) { fallar(lexema); }
      pos++;
      return t;
    }
    function comerIdentificador() {
      var t = mirar();
      if (!t || t.clase !== "identificador") { fallar("un identificador"); }
      pos++;
      return t.lexema;
    }
    function separadas(cierre, leer) {
      var xs = [];
      if (mirar() && mirar().lexema !== cierre) {
        xs.push(leer());
        while (mirar() && mirar().lexema === ",") { pos++; xs.push(leer()); }
      }
      comer(cierre);
      return xs;
    }

    function expresion() {
      var t = mirar();
      if (!t) { fallar("una expresión"); }

      if (t.clase === "numero") { pos++; return { v: "lit-exp", campos: [t.valor] }; }
      if (t.clase === "identificador") { pos++; return { v: "var-exp", campos: [t.lexema] }; }
      if (t.lexema === "true") { pos++; return { v: "true-exp", campos: [] }; }
      if (t.lexema === "false") { pos++; return { v: "false-exp", campos: [] }; }

      if (t.lexema === "if") {
        pos++;
        var prueba = expresion();
        comer("then");
        var siSi = expresion();
        comer("else");
        return { v: "if-exp", campos: [prueba, siSi, expresion()] };
      }
      if (t.lexema === "letrec") {
        pos++;
        var nombres = [], paramss = [], cuerpos = [];
        while (mirar() && mirar().clase === "identificador") {
          nombres.push(mirar().lexema);
          pos++;
          comer("(");
          paramss.push(separadas(")", comerIdentificador));
          comer("=");
          cuerpos.push(expresion());
        }
        comer("in");
        return { v: "letrec-exp", campos: [nombres, paramss, cuerpos, expresion()] };
      }
      if (t.lexema === "let") {
        pos++;
        var ids = [], rands = [];
        while (mirar() && mirar().clase === "identificador") {
          ids.push(mirar().lexema);
          pos++;
          comer("=");
          rands.push(expresion());
        }
        comer("in");
        return { v: "let-exp", campos: [ids, rands, expresion()] };
      }
      if (t.lexema === "proc") {
        pos++;
        comer("(");
        var params = separadas(")", comerIdentificador);
        return { v: "proc-exp", campos: [params, expresion()] };
      }
      if (t.lexema === "begin") {
        pos++;
        var primera = expresion();
        var resto = [];
        while (mirar() && mirar().lexema === ";") { pos++; resto.push(expresion()); }
        comer("end");
        return { v: "begin-exp", campos: [primera, resto] };
      }
      if (t.lexema === "set") {
        pos++;
        var id = comerIdentificador();
        comer("=");
        return { v: "set-exp", campos: [id, expresion()] };
      }
      if (t.lexema === "[") {
        pos++;
        return { v: "list-exp", campos: [separadas("]", expresion)] };
      }
      if (t.clase === "primitiva") {
        pos++;
        comer("(");
        return { v: "prim-exp", campos: [t.lexema, separadas(")", expresion)] };
      }
      if (t.lexema === "(") {
        pos++;
        var rator = expresion();
        var rands2 = [];
        while (mirar() && mirar().lexema !== ")") { rands2.push(expresion()); }
        comer(")");
        return { v: "app-exp", campos: [rator, rands2] };
      }
      fallar("una expresión");
    }

    var arbol = expresion();
    if (pos < tokens.length) {
      throw new Error("El parser terminó la expresión y todavía quedaban tokens, desde " +
                      tokens[pos].lexema + ".");
    }
    return arbol;
  }

  /* --- Cómo se escribe cada cosa -------------------------------------- */
  function texto(n) {
    switch (n.v) {
      case "lit-exp": return String(n.campos[0]);
      case "var-exp": return n.campos[0];
      case "true-exp": return "true";
      case "false-exp": return "false";
      case "prim-exp": return n.campos[0] + "(" + n.campos[1].map(texto).join(", ") + ")";
      case "if-exp": return "if " + texto(n.campos[0]) + " then " + texto(n.campos[1]) +
        " else " + texto(n.campos[2]);
      case "let-exp": return "let " + n.campos[0].map(function (id, k) {
        return id + " = " + texto(n.campos[1][k]); }).join(" ") + " in " + texto(n.campos[2]);
      case "proc-exp": return "proc(" + n.campos[0].join(", ") + ") " + texto(n.campos[1]);
      case "letrec-exp": return "letrec " + n.campos[0].map(function (nom, k) {
        return nom + "(" + n.campos[1][k].join(", ") + ") = " + texto(n.campos[2][k]); }).join(" ") +
        " in " + texto(n.campos[3]);
      case "app-exp": return "(" + texto(n.campos[0]) +
        (n.campos[1].length ? " " + n.campos[1].map(texto).join(" ") : "") + ")";
      case "begin-exp": return "begin " + [n.campos[0]].concat(n.campos[1]).map(texto).join("; ") + " end";
      case "set-exp": return "set " + n.campos[0] + " = " + texto(n.campos[1]);
      case "list-exp": return "[" + n.campos[0].map(texto).join(", ") + "]";
    }
    return "?";
  }

  function escribir(v) {
    if (v === true) { return "#t"; }
    if (v === false) { return "#f"; }
    if (v && v.clausura) {
      return "(closure (" + v.ids.join(", ") + ") " + texto(v.cuerpo) + " " + v.env.nombre + ")";
    }
    if (v && v.directo !== undefined) { return "(direct-target " + escribir(v.directo) + ")"; }
    if (v && v.indirecto) {
      return "(indirect-target " + v.indirecto.env.ligaduras[v.indirecto.pos][0] +
        " de " + v.indirecto.env.nombre + ")";
    }
    if (Array.isArray(v)) { return "(" + v.map(escribir).join(" ") + ")"; }
    return String(v);
  }

  function esExpval(v) {
    return typeof v === "number" || typeof v === "boolean" || !!(v && v.clausura);
  }

  /* --- Evaluador ------------------------------------------------------ */
  function evaluar(arbol, opciones) {
    opciones = opciones || {};
    var porReferencia = !!opciones.referencia;
    var copia = !!opciones.copia;
    var traza = [], creados = 0, clausuras = [], masProfundo = null, ultimaLlamada = null;
    var escrituras = [], marcos = [];
    var cuenta = { valueOf: 0, applyProc: 0, variables: 0, ambientes: 0, clausuras: 0,
                   asignaciones: 0, celdas: 0, indirectos: 0 };

    function hondura(env) { var n = 0; while (env) { n++; env = env.viejo; } return n; }

    /* El blanco de una celda, en el interpretador por referencia. */
    function directo(v) {
      if (!esExpval(v)) {
        throw new Error("direct-target: el valor " + escribir(v) +
                        " no es un valor expresado (número, booleano o procedimiento).");
      }
      return { directo: v };
    }

    /* apply-env-ref: la referencia es la pareja (marco, posición). */
    function referenciaDe(env, id) {
      var e = env;
      while (e) {
        for (var i = 0; i < e.ligaduras.length; i++) {
          if (e.ligaduras[i][0] === id) { return { env: e, pos: i }; }
        }
        e = e.viejo;
      }
      throw new Error("apply-env-ref: No se encuentra la variable: " + id);
    }
    function celda(ref) { return ref.env.ligaduras[ref.pos][1]; }
    function nombreCelda(ref) { return ref.env.ligaduras[ref.pos][0] + " de " + ref.env.nombre; }

    function deref(ref) {
      var c = celda(ref);
      if (!porReferencia) { return c; }
      if (c.directo !== undefined) { return c.directo; }
      var c2 = celda(c.indirecto);
      if (c2.directo !== undefined) { return c2.directo; }
      throw new Error("deref: Invariante roto: indirect-target apunta a otro indirect-target.");
    }

    function setref(ref, val, que) {
      var destino = ref;
      if (porReferencia) {
        var c = celda(ref);
        if (c.indirecto) { destino = c.indirecto; }
        val = directo(val);
      }
      var antes = celda(destino);
      destino.env.ligaduras[destino.pos][1] = val;
      var fila = { escritura: true, ambiente: destino.env.nombre, env: destino.env,
                   expresion: que + ": la celda de " + nombreCelda(destino) + " pasa de " +
                     escribir(antes) + " a " + escribir(val) +
                     (destino !== ref ? " (" + nombreCelda(ref) +
                       " guarda un indirect-target y la escritura sigue hasta allá)" : "") };
      traza.push(fila);
      escrituras.push(fila);
    }

    function nuevoMarco(env, ids, vals, recursivo) {
      creados++;
      cuenta.ambientes++;
      cuenta.celdas += ids.length;
      var nuevo = { nombre: "amb" + creados, viejo: env, recursivo: !!recursivo,
                    ligaduras: ids.map(function (id, k) { return [id, vals[k]]; }) };
      marcos.push(nuevo);
      if (!masProfundo || hondura(nuevo) >= hondura(masProfundo)) { masProfundo = nuevo; }
      return nuevo;
    }

    /* La foto de la cadena en un instante: lo que guarda cada celda en ese
       momento, aunque después una asignación la cambie. */
    function foto(env) {
      var cadena = [];
      while (env) {
        cadena.push({ nombre: env.nombre, recursivo: env.recursivo,
                      ligaduras: env.ligaduras.map(function (l) { return [l[0], l[1]]; }) });
        env = env.viejo;
      }
      return cadena;
    }

    /* Con { copia: true }: la clausura se lleva una copia de cada marco de
       la cadena, de modo que no ve lo que se asigne después. */
    function copiarCadena(env) {
      if (!env) { return null; }
      var copiaMarco = { nombre: env.nombre + "′", recursivo: env.recursivo,
                         ligaduras: env.ligaduras.map(function (l) { return [l[0], l[1]]; }),
                         viejo: copiarCadena(env.viejo) };
      return copiaMarco;
    }

    function aplicarPrim(prim, args) {
      function pide(n) {
        if (args.length < n) {
          throw new Error("La primitiva " + prim + " lee " + n + " operando(s) y le llegaron " +
                          args.length + ".");
        }
      }
      switch (prim) {
        case "+": return args.reduce(function (a, b) { return a + b; }, 0);
        case "*": return args.reduce(function (a, b) { return a * b; }, 1);
        case "-": pide(1); return args[0] - args.slice(1).reduce(function (a, b) { return a + b; }, 0);
        case "/": pide(1); return args[0] / args.slice(1).reduce(function (a, b) { return a * b; }, 1);
        case "add1": pide(1); return args[0] + 1;
        case "sub1": pide(1); return args[0] - 1;
        case ">": pide(2); return args[0] > args[1];
        case ">=": pide(2); return args[0] >= args[1];
        case "<": pide(2); return args[0] < args[1];
        case "<=": pide(2); return args[0] <= args[1];
        case "==": pide(2); return args[0] === args[1];
      }
    }

    /* eval-rand: un operando que es una variable viaja como indirect-target
       a su celda, aplanado si esa celda ya era indirecta; cualquier otro, como
       direct-target de su valor. */
    function evalRand(exp, env) {
      if (exp.v === "var-exp") {
        var ref = referenciaDe(env, exp.campos[0]);
        var c = celda(ref);
        cuenta.indirectos++;
        return { indirecto: c.indirecto ? c.indirecto : ref };
      }
      return directo(valueOf(exp, env));
    }

    function valueOf(exp, env) {
      cuenta.valueOf++;
      if (cuenta.valueOf > MAX_LLAMADAS) {
        throw new Error("El programa lleva demasiadas llamadas a value-of. " +
                        "Puede que la recursión no llegue al caso base.");
      }
      var instante = foto(env);
      var valor;
      switch (exp.v) {
        case "lit-exp": valor = exp.campos[0]; break;
        case "true-exp": valor = true; break;
        case "false-exp": valor = false; break;
        case "var-exp":
          cuenta.variables++;
          valor = deref(referenciaDe(env, exp.campos[0]));
          break;
        case "prim-exp":
          valor = aplicarPrim(exp.campos[0],
                              exp.campos[1].map(function (r) { return valueOf(r, env); }));
          break;
        case "list-exp":
          valor = exp.campos[0].map(function (r) { return valueOf(r, env); });
          break;
        case "if-exp":
          var prueba = valueOf(exp.campos[0], env);
          if (typeof prueba !== "boolean") {
            throw new Error("La condición de un if debe evaluarse a un booleano, se obtuvo: " +
                            escribir(prueba) + ".");
          }
          valor = valueOf(exp.campos[prueba ? 1 : 2], env);
          break;
        case "let-exp":
          var vals = exp.campos[1].map(function (r) {
            var v = valueOf(r, env);
            return porReferencia ? directo(v) : v;
          });
          var nuevo = nuevoMarco(env, exp.campos[0], vals);
          traza.push({ creacion: true, ambiente: nuevo.nombre, env: nuevo,
                       expresion: "se crea " + nuevo.nombre + " = [" +
                         exp.campos[0].map(function (id, k) {
                           return id + "=" + escribir(vals[k]); }).join(", ") + "]" + env.nombre });
          valor = valueOf(exp.campos[2], nuevo);
          break;
        case "letrec-exp":
          /* Se reserva el vector, se arma el marco sobre él y se llenan sus
             celdas con clausuras que capturan ese mismo marco. */
          var marco = nuevoMarco(env, exp.campos[0], exp.campos[0].map(function () { return 0; }), true);
          exp.campos[0].forEach(function (nom, k) {
            var cl = { clausura: true, ids: exp.campos[1][k], cuerpo: exp.campos[2][k], env: marco };
            cuenta.clausuras++;
            marco.ligaduras[k][1] = porReferencia ? directo(cl) : cl;
            clausuras.push({ texto: escribir(cl), env: marco, creada: nom });
          });
          traza.push({ creacion: true, ambiente: marco.nombre, env: marco,
                       expresion: "se crea " + marco.nombre + " = [" +
                         marco.ligaduras.map(function (l) {
                           return l[0] + "=" + escribir(l[1]); }).join(", ") + "]" + env.nombre });
          valor = valueOf(exp.campos[3], marco);
          break;
        case "proc-exp":
          cuenta.clausuras++;
          valor = { clausura: true, ids: exp.campos[0], cuerpo: exp.campos[1],
                    env: copia ? copiarCadena(env) : env };
          clausuras.push({ texto: escribir(valor), env: valor.env, creada: texto(exp) });
          break;
        case "app-exp":
          /* Primero los operandos y después el operador, como el let de
             Racket que los liga en ese orden. */
          var args = exp.campos[1].map(function (r) {
            return porReferencia ? evalRand(r, env) : valueOf(r, env);
          });
          var proc = valueOf(exp.campos[0], env);
          if (!(proc && proc.clausura)) {
            throw new Error("El operador no evaluó a un procedimiento: " + escribir(proc) + ".");
          }
          if (proc.ids.length !== args.length) {
            throw new Error("Número de argumentos incorrecto: se esperaban " + proc.ids.length +
                            " y se recibieron " + args.length + ".");
          }
          cuenta.applyProc++;
          var dentro = nuevoMarco(proc.env, proc.ids, args);
          traza.push({ creacion: true, ambiente: dentro.nombre, env: dentro,
                       expresion: "se crea " + dentro.nombre + " = [" +
                         proc.ids.map(function (id, k) {
                           return id + "=" + escribir(args[k]); }).join(", ") + "]" + proc.env.nombre +
                         " para el cuerpo de la clausura" });
          ultimaLlamada = dentro;
          valor = valueOf(proc.cuerpo, dentro);
          break;
        case "begin-exp":
          var todas = [exp.campos[0]].concat(exp.campos[1]);
          for (var s = 0; s < todas.length; s++) { valor = valueOf(todas[s], env); }
          break;
        case "set-exp":
          var ref = referenciaDe(env, exp.campos[0]);
          var nuevoValor = valueOf(exp.campos[1], env);
          cuenta.asignaciones++;
          setref(ref, nuevoValor, "set " + exp.campos[0]);
          valor = 1;
          break;
      }
      traza.push({ expresion: texto(exp), ambiente: env.nombre, valor: escribir(valor),
                   env: env, consulta: exp.v === "var-exp", cadena: instante });
      return valor;
    }

    var amb0 = porReferencia
      ? { nombre: "amb0", ligaduras: [["x", directo(1)], ["y", directo(2)], ["z", directo(3)]],
          viejo: { nombre: "base", ligaduras: [["a", directo(4)], ["b", directo(5)], ["c", directo(6)]],
                   viejo: null } }
      : { nombre: "amb0", ligaduras: [["x", 4], ["y", 2], ["z", 5]],
          viejo: { nombre: "base", ligaduras: [["a", 4], ["b", 5], ["c", 6]], viejo: null } };

    function estado(valor) {
      return { valor: valor, texto: valor === undefined ? "" : escribir(valor),
               traza: traza, cuenta: cuenta, env0: amb0, marcos: marcos,
               clausuras: clausuras, masProfundo: masProfundo || amb0,
               ultimaLlamada: ultimaLlamada, escrituras: escrituras,
               mutable: true, referencia: porReferencia, copia: copia };
    }

    try {
      return estado(valueOf(arbol, amb0));
    } catch (e) {
      e.estado = estado(undefined);
      throw e;
    }
  }

  function ejecutar(programa, opciones) {
    var salida = { programa: programa };
    var tokens;
    try { tokens = tokenizar(programa, opciones); salida.tokens = tokens; }
    catch (e) { salida.error = e.message; salida.etapa = "scanner"; return salida; }
    try { salida.arbol = parsear(tokens); }
    catch (e) { salida.error = e.message; salida.etapa = "parser"; return salida; }
    var r;
    try {
      r = evaluar(salida.arbol, opciones);
    } catch (e) {
      if (!e.estado) { throw e; }
      salida.error = e.message; salida.etapa = "evaluador";
      r = e.estado;
    }
    ["valor", "texto", "traza", "cuenta", "clausuras", "masProfundo", "ultimaLlamada",
     "env0", "escrituras", "marcos", "mutable", "referencia", "copia"].forEach(function (k) {
      if (!(salida.error && (k === "valor" || k === "texto"))) { salida[k] = r[k]; }
    });
    return salida;
  }

  /* La cadena de ambientes en el instante en que empieza a evaluarse la
     expresión que se nombre, del eslabón más nuevo al más viejo, con lo que
     guardaba cada celda en ese instante. */
  function cadenaEn(salida, expresion) {
    if (!salida.traza) { return null; }
    var fila = salida.traza.filter(function (f) {
      return !f.creacion && !f.escritura && f.expresion === expresion;
    })[0];
    return fila ? fila.cadena : null;
  }

  /* Cómo se compara lo que escribe el estudiante al dibujar con lo que
     guarda la celda. Un direct-target puede escribirse con su valor solo, y
     un indirect-target con el nombre de la variable a cuya celda apunta. */
  function mismoValor(escrito, real) {
    var e = String(escrito).toLowerCase().replace(/\s+/g, "");
    var r = escribir(real).toLowerCase().replace(/\s+/g, "");
    if (e === r) { return true; }
    if (real && real.clausura) { return /^(closure|proc|procedimiento|clausura)/.test(e); }
    if (real && real.directo !== undefined) {
      var dentro = e.replace(/^\(?(direct-target|directo|direct)/, "").replace(/\)$/, "");
      return mismoValor(dentro, real.directo);
    }
    if (real && real.indirecto) {
      var nombre = real.indirecto.env.ligaduras[real.indirecto.pos][0].toLowerCase();
      var limpio = e.replace(/^\(?(indirect-target|indirecto|indirect|ind|ref|→|->)/, "")
                    .replace(/\)$/, "").replace(/^(r_|→|->)/, "")
                    .replace(/(de|en|@)(amb\d*|ρ\d*|base)$/, "");
      return /^(\(?(indirect|ind|ref|→|->))/.test(e) && limpio === nombre;
    }
    return false;
  }

  return { tokenizar: tokenizar, parsear: parsear, evaluar: evaluar, ejecutar: ejecutar,
           texto: texto, escribir: escribir, cadenaEn: cadenaEn, mismoValor: mismoValor };
})();

if (typeof module !== "undefined") { module.exports = InterpreteAsignacion; }
