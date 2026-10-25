/* Los intérpretes con almacén, escritos en JavaScript para poder mostrar lo
   que hacen. Calcan a los tres de `Corte 2`, en la versión de la tercera
   edición de EOPL: su sintaxis, su semántica, sus verificaciones y el orden
   en que reservan las celdas, de modo que la celda 7 de aquí es la celda 7
   de (almacen->lista) en Racket.

   Con { modo: "implicitas" }, el modo por omisión, calca a `1 Asignacion`
   (EOPL §4.3):
      <expresion> ::= <numero> | <identificador> | true | false
                  ::= if <exp> then <exp> else <exp>
                  ::= let {<id> = <exp>}* in <exp>
                  ::= proc ( {<id>}*(,) ) <exp>
                  ::= ( <exp> {<exp>}* )
                  ::= letrec {<id> ( {<id>}*(,) ) = <exp>}* in <exp>
                  ::= set <id> = <exp>
                  ::= begin <exp> {; <exp>}* end
                  ::= <primitiva> ( {<exp>}*(,) )
   El ambiente liga cada nombre a una referencia del almacén. let y la
   aplicación reservan una celda por variable; buscar un nombre de letrec
   reserva una celda con la clausura recién hecha. El ambiente inicial,
   [x=4, y=2, z=5] sobre [a=4, b=5, c=6], ocupa las celdas 0 a 5.

   Con { modo: "referencia" } calca a `2 PasoPorReferencia` (EOPL §4.5.1): un
   operando que es una variable entrega su propia referencia al parámetro.

   Con { modo: "explicitas" } calca a `0 ReferenciasExplicitas` (EOPL §4.2):
   no hay set; hay newref(e), deref(e) y setref(e1, e2), el ambiente liga
   nombres a valores y una referencia es uno de esos valores.

   Con { copia: true }, en el modo de asignación, la clausura se lleva celdas
   nuevas con una copia de lo que veía al crearse. No es la regla de ningún
   intérprete: está para mostrar qué pasaría si el ambiente guardara valores
   en lugar de referencias. */
var InterpreteAsignacion = (function () {
  "use strict";

  var PRIMITIVAS = ["+", "-", "*", "/", "add1", "sub1", ">=", "<=", "==", ">", "<"];
  var COMUNES = ["if", "then", "else", "let", "letrec", "in", "proc", "true", "false",
                 "begin", "end"];
  var MAX_LLAMADAS = 20000;

  function modoDe(opciones) {
    opciones = opciones || {};
    if (opciones.modo) { return opciones.modo; }
    if (opciones.referencia) { return "referencia"; }
    return "implicitas";
  }
  function palabras(modo) {
    return modo === "explicitas" ? COMUNES.concat(["newref", "deref", "setref"])
                                 : COMUNES.concat(["set"]);
  }

  /* --- Scanner ------------------------------------------------------- */
  function tokenizar(texto, opciones) {
    var PALABRAS = palabras(modoDe(opciones));
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
      if ("(),=;".indexOf(c) !== -1) { tokens.push({ clase: "signo", lexema: c }); i++; continue; }
      throw new Error("El scanner no reconoce el carácter " + c + ".");
    }
    return tokens;
  }

  /* --- Parser --------------------------------------------------------- */
  function parsear(tokens, opciones) {
    var explicitas = modoDe(opciones) === "explicitas";
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
      if (!explicitas && t.lexema === "set") {
        pos++;
        var id = comerIdentificador();
        comer("=");
        return { v: "set-exp", campos: [id, expresion()] };
      }
      if (explicitas && (t.lexema === "newref" || t.lexema === "deref")) {
        pos++;
        comer("(");
        var e = expresion();
        comer(")");
        return { v: t.lexema + "-exp", campos: [e] };
      }
      if (explicitas && t.lexema === "setref") {
        pos++;
        comer("(");
        var e1 = expresion();
        comer(",");
        var e2 = expresion();
        comer(")");
        return { v: "setref-exp", campos: [e1, e2] };
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
      case "newref-exp": return "newref(" + texto(n.campos[0]) + ")";
      case "deref-exp": return "deref(" + texto(n.campos[0]) + ")";
      case "setref-exp": return "setref(" + texto(n.campos[0]) + ", " + texto(n.campos[1]) + ")";
    }
    return "?";
  }

  function lista(xs) { return "(" + xs.join(" ") + ")"; }

  function escribir(v) {
    if (v === true) { return "#t"; }
    if (v === false) { return "#f"; }
    if (v && v.clausura) {
      return "(closure (" + v.ids.join(" ") + ") " + texto(v.cuerpo) + " " + v.env.nombre + ")";
    }
    if (v && v.ref !== undefined) { return "(a-ref " + v.ref + ")"; }
    return String(v);
  }

  /* --- Evaluador ------------------------------------------------------ */
  function evaluar(arbol, opciones) {
    opciones = opciones || {};
    var modo = modoDe(opciones);
    var explicitas = modo === "explicitas";
    var porReferencia = modo === "referencia";
    var copia = !!opciones.copia && !explicitas;
    var traza = [], creados = 0, clausuras = [], masProfundo = null, ultimaLlamada = null;
    var escrituras = [], marcos = [];
    var almacen = [];
    var cuenta = { valueOf: 0, applyProc: 0, variables: 0, ambientes: 0, clausuras: 0,
                   asignaciones: 0, celdas: 0, compartidas: 0 };

    function hondura(env) { var n = 0; while (env) { n++; env = env.viejo; } return n; }

    /* --- El almacén --- */
    function newref(v, porque) {
      almacen.push(v);
      var r = { ref: almacen.length - 1 };
      if (porque !== "inicial") {
        cuenta.celdas++;
        traza.push({ reserva: true, celda: r.ref, ambiente: "",
                     expresion: "newref: se reserva la celda " + r.ref + " con " + escribir(v) +
                       (porque ? " (" + porque + ")" : "") });
      }
      return r;
    }
    function deref(r, quien) {
      if (!(r && r.ref !== undefined)) {
        throw new Error((quien || "deref") + ": Se esperaba una referencia y se obtuvo: " + escribir(r));
      }
      if (r.ref >= almacen.length) {
        throw new Error("deref: La referencia " + r.ref + " no apunta a ninguna celda del almacén");
      }
      return almacen[r.ref];
    }
    function setref(r, v, que) {
      var antes = almacen[r.ref];
      almacen[r.ref] = v;
      var fila = { escritura: true, celda: r.ref, ambiente: "",
                   expresion: que + ": la celda " + r.ref + " pasa de " + escribir(antes) +
                     " a " + escribir(v) };
      traza.push(fila);
      escrituras.push(fila);
    }

    /* --- El ambiente --- */
    function nuevoMarco(env, ids, vals) {
      creados++;
      cuenta.ambientes++;
      var nuevo = { nombre: "amb" + creados, viejo: env,
                    ligaduras: ids.map(function (id, k) { return [id, vals[k]]; }) };
      marcos.push(nuevo);
      if (!masProfundo || hondura(nuevo) >= hondura(masProfundo)) { masProfundo = nuevo; }
      return nuevo;
    }
    function marcoRecursivo(env, nombres, paramss, cuerpos) {
      creados++;
      cuenta.ambientes++;
      var nuevo = { nombre: "amb" + creados, viejo: env, recursivo: true,
                    nombres: nombres, paramss: paramss, cuerpos: cuerpos,
                    ligaduras: [["procnames", lista(nombres)],
                                ["idss", lista(paramss.map(lista))],
                                ["cuerpos", lista(cuerpos.map(function (c) {
                                  return "(" + texto(c) + ")"; }))]] };
      marcos.push(nuevo);
      if (!masProfundo || hondura(nuevo) >= hondura(masProfundo)) { masProfundo = nuevo; }
      return nuevo;
    }

    /* apply-env: con referencias implícitas devuelve la referencia; con
       explícitas, el valor. En un marco de letrec fabrica la clausura, y con
       referencias implícitas además le reserva una celda. */
    function applyEnv(env, id) {
      var e = env;
      while (e) {
        if (e.recursivo) {
          var k = e.nombres.indexOf(id);
          if (k !== -1) {
            cuenta.clausuras++;
            var cl = { clausura: true, ids: e.paramss[k], cuerpo: e.cuerpos[k], env: e };
            clausuras.push({ texto: escribir(cl), env: e, creada: "buscar " + id });
            return explicitas ? cl : newref(cl, "buscar " + id + " en el marco de letrec");
          }
        } else {
          for (var i = 0; i < e.ligaduras.length; i++) {
            if (e.ligaduras[i][0] === id) { return e.ligaduras[i][1]; }
          }
        }
        e = e.viejo;
      }
      throw new Error("apply-env: No se encuentra la variable " + id);
    }

    /* La foto de la cadena en un instante. Las ligaduras guardan referencias,
       que no cambian; lo que cambia está en el almacén, y por eso viaja una
       copia del almacén junto con la cadena. */
    function foto(env) {
      var cadena = [];
      while (env) {
        cadena.push({ nombre: env.nombre, recursivo: env.recursivo,
                      ligaduras: env.ligaduras.map(function (l) { return [l[0], l[1]]; }) });
        env = env.viejo;
      }
      return cadena;
    }

    /* Con { copia: true }: la clausura se lleva celdas propias con lo que
       había en las de su cadena al crearse. */
    function copiarCadena(env) {
      if (!env) { return null; }
      if (env.recursivo) {
        var r = Object.assign({}, env);
        r.nombre = env.nombre + "′";
        r.viejo = copiarCadena(env.viejo);
        return r;
      }
      return { nombre: env.nombre + "′",
               ligaduras: env.ligaduras.map(function (l) {
                 return [l[0], newref(almacen[l[1].ref], "copia de " + l[0] + " para la clausura")];
               }),
               viejo: copiarCadena(env.viejo) };
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

    /* evaluar-operando: una variable entrega la referencia que ya tiene; otra
       expresión, una celda nueva con su valor. */
    function evaluarOperando(exp, env) {
      if (exp.v === "var-exp") {
        cuenta.compartidas++;
        return applyEnv(env, exp.campos[0]);
      }
      return newref(valueOf(exp, env), "operando " + texto(exp));
    }

    function aplicar(proc, args, quien) {
      if (!(proc && proc.clausura)) {
        throw new Error("El operador no evaluó a un procedimiento: " + escribir(proc) + ".");
      }
      if (proc.ids.length !== args.length) {
        throw new Error("Número de argumentos incorrecto: se esperaban " + proc.ids.length +
                        " y se recibieron " + args.length + ".");
      }
      return proc;
    }

    function valueOf(exp, env) {
      cuenta.valueOf++;
      if (cuenta.valueOf > MAX_LLAMADAS) {
        throw new Error("El programa lleva demasiadas llamadas a value-of. " +
                        "Puede que la recursión no llegue al caso base.");
      }
      var instante = foto(env), almacenAntes = almacen.slice();
      var valor;
      switch (exp.v) {
        case "lit-exp": valor = exp.campos[0]; break;
        case "true-exp": valor = true; break;
        case "false-exp": valor = false; break;
        case "var-exp":
          cuenta.variables++;
          valor = explicitas ? applyEnv(env, exp.campos[0]) : deref(applyEnv(env, exp.campos[0]));
          break;
        case "prim-exp":
          valor = aplicarPrim(exp.campos[0],
                              exp.campos[1].map(function (r) { return valueOf(r, env); }));
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
          var vals = exp.campos[1].map(function (r) { return valueOf(r, env); });
          var ligados = explicitas ? vals : vals.map(function (v, k) {
            return newref(v, "let " + exp.campos[0][k]);
          });
          var nuevo = nuevoMarco(env, exp.campos[0], ligados);
          traza.push({ creacion: true, ambiente: nuevo.nombre, env: nuevo,
                       expresion: "se crea " + nuevo.nombre + " = [" +
                         exp.campos[0].map(function (id, k) {
                           return id + "=" + escribir(ligados[k]); }).join(", ") + "] sobre " + env.nombre });
          valor = valueOf(exp.campos[2], nuevo);
          break;
        case "letrec-exp":
          var marco = marcoRecursivo(env, exp.campos[0], exp.campos[1], exp.campos[2]);
          traza.push({ creacion: true, ambiente: marco.nombre, env: marco,
                       expresion: "se crea " + marco.nombre + ", el marco recursivo de " +
                         exp.campos[0].join(", ") + ", sobre " + env.nombre });
          valor = valueOf(exp.campos[3], marco);
          break;
        case "proc-exp":
          cuenta.clausuras++;
          valor = { clausura: true, ids: exp.campos[0], cuerpo: exp.campos[1],
                    env: copia ? copiarCadena(env) : env };
          clausuras.push({ texto: escribir(valor), env: valor.env, creada: texto(exp) });
          break;
        case "app-exp":
          /* El mismo orden que en Racket: primero los operandos, después el
             operador, y al final las celdas de los parámetros. */
          var args, proc;
          if (porReferencia) {
            args = exp.campos[1].map(function (r) { return evaluarOperando(r, env); });
            proc = aplicar(valueOf(exp.campos[0], env), args);
          } else {
            var valores = exp.campos[1].map(function (r) { return valueOf(r, env); });
            var operador = valueOf(exp.campos[0], env);
            args = explicitas ? valores : valores.map(function (v, k) {
              var nom = operador && operador.clausura && operador.ids[k];
              return newref(v, nom ? "parámetro " + nom : "argumento " + (k + 1));
            });
            proc = aplicar(operador, args);
          }
          cuenta.applyProc++;
          var dentro = nuevoMarco(proc.env, proc.ids, args);
          traza.push({ creacion: true, ambiente: dentro.nombre, env: dentro,
                       expresion: "se crea " + dentro.nombre + " = [" +
                         proc.ids.map(function (id, k) {
                           return id + "=" + escribir(args[k]); }).join(", ") + "] sobre " +
                         proc.env.nombre + ", el ambiente de la clausura" });
          ultimaLlamada = dentro;
          valor = valueOf(proc.cuerpo, dentro);
          break;
        case "begin-exp":
          var todas = [exp.campos[0]].concat(exp.campos[1]);
          for (var s = 0; s < todas.length; s++) { valor = valueOf(todas[s], env); }
          break;
        case "set-exp":
          var ref = applyEnv(env, exp.campos[0]);
          var nuevoValor = valueOf(exp.campos[1], env);
          cuenta.asignaciones++;
          setref(ref, nuevoValor, "set " + exp.campos[0]);
          valor = 1;
          break;
        case "newref-exp":
          valor = newref(valueOf(exp.campos[0], env), texto(exp));
          break;
        case "deref-exp":
          valor = deref(valueOf(exp.campos[0], env), "deref");
          break;
        case "setref-exp":
          var r1 = valueOf(exp.campos[0], env);
          if (!(r1 && r1.ref !== undefined)) {
            throw new Error("setref: Se esperaba una referencia y se obtuvo: " + escribir(r1));
          }
          var v2 = valueOf(exp.campos[1], env);
          cuenta.asignaciones++;
          setref(r1, v2, texto(exp));
          valor = 1;
          break;
      }
      traza.push({ expresion: texto(exp), ambiente: env.nombre, valor: escribir(valor),
                   env: env, consulta: exp.v === "var-exp", cadena: instante,
                   almacen: almacenAntes });
      return valor;
    }

    /* El ambiente inicial: en los modos con referencias implícitas sus seis
       variables ocupan las celdas 0 a 5. */
    var amb0;
    if (explicitas) {
      amb0 = { nombre: "amb0", ligaduras: [["x", 4], ["y", 2], ["z", 5]],
               viejo: { nombre: "base", ligaduras: [["a", 4], ["b", 5], ["c", 6]], viejo: null } };
    } else {
      var r0 = [4, 2, 5].map(function (v) { return newref(v, "inicial"); });
      var r00 = [4, 5, 6].map(function (v) { return newref(v, "inicial"); });
      amb0 = { nombre: "amb0", ligaduras: [["x", r0[0]], ["y", r0[1]], ["z", r0[2]]],
               viejo: { nombre: "base", ligaduras: [["a", r00[0]], ["b", r00[1]], ["c", r00[2]]],
                        viejo: null } };
    }
    var iniciales = almacen.length;

    function estado(valor) {
      return { valor: valor, texto: valor === undefined ? "" : escribir(valor),
               traza: traza, cuenta: cuenta, env0: amb0, marcos: marcos,
               clausuras: clausuras, masProfundo: masProfundo || amb0,
               ultimaLlamada: ultimaLlamada, escrituras: escrituras,
               almacen: almacen, iniciales: iniciales,
               mutable: true, modo: modo, referencia: porReferencia, copia: copia };
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
    try { salida.arbol = parsear(tokens, opciones); }
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
     "env0", "escrituras", "marcos", "almacen", "iniciales", "mutable", "modo", "referencia",
     "copia"].forEach(function (k) {
      if (!(salida.error && (k === "valor" || k === "texto"))) { salida[k] = r[k]; }
    });
    return salida;
  }

  /* La cadena de ambientes en el instante en que empieza a evaluarse la
     expresión que se nombre, del eslabón más nuevo al más viejo. */
  function cadenaEn(salida, expresion) {
    var fila = filaDe(salida, expresion);
    return fila ? fila.cadena : null;
  }
  /* El almacén en ese mismo instante. */
  function almacenEn(salida, expresion) {
    var fila = filaDe(salida, expresion);
    return fila ? fila.almacen : null;
  }
  function filaDe(salida, expresion) {
    if (!salida.traza) { return null; }
    return salida.traza.filter(function (f) {
      return !f.creacion && !f.escritura && !f.reserva && f.expresion === expresion;
    })[0] || null;
  }

  /* Cómo se compara lo que escribe el estudiante al dibujar con lo que
     guarda la ligadura. Una referencia se escribe (a-ref 7), ref 7 o celda 7;
     un número solo no vale, porque la ligadura no guarda el valor. */
  function mismoValor(escrito, real) {
    var e = String(escrito).toLowerCase().replace(/\s+/g, "");
    var r = escribir(real).toLowerCase().replace(/\s+/g, "");
    if (e === r) { return true; }
    if (real && real.clausura) { return /^(\(?closure|proc|procedimiento|clausura)/.test(e); }
    if (real && real.ref !== undefined) {
      var m = e.match(/^\(?(a-ref|ref|celda)(\d+)\)?$/);
      return !!m && Number(m[2]) === real.ref;
    }
    if (typeof real === "string") { return /cuerpo/.test(e) || e === r; }
    return false;
  }

  return { tokenizar: tokenizar, parsear: parsear, evaluar: evaluar, ejecutar: ejecutar,
           texto: texto, escribir: escribir, cadenaEn: cadenaEn, almacenEn: almacenEn,
           mismoValor: mismoValor };
})();

if (typeof module !== "undefined") { module.exports = InterpreteAsignacion; }
