/* Ejercicio interactivo: los tipos de arista del recorrido en profundidad,
   en un grafo dirigido y en uno no dirigido. Antes de que el codigo pinte
   una arista se predice su tipo; el reloj cuenta desde 1, como en CLRS. */
var EJERCICIO = (function () {
  var CODIGO_DIRIGIDO = [
    { txt: "def visit(u):",                              num: null },
    { txt: "    color[u] = GRIS",                        num: 1 },
    { txt: "    reloj[0] = reloj[0] + 1",                num: 2 },
    { txt: "    d[u] = reloj[0]",                        num: 3 },
    { txt: "    for v in grafo[u]:",                     num: 4,  bloque: 1 },
    { txt: "        if color[v] == BLANCO:",             num: 5,  bloque: 1 },
    { txt: "            tipo[(u, v)] = ARBOL",           num: 6,  bloque: 1 },
    { txt: "            visit(v)",                       num: 7,  bloque: 1 },
    { txt: "        elif color[v] == GRIS:",             num: 8,  bloque: 1 },
    { txt: "            tipo[(u, v)] = RETROCESO",       num: 9,  bloque: 1 },
    { txt: "        elif d[u] < d[v]:",                  num: 10, bloque: 1 },
    { txt: "            tipo[(u, v)] = AVANCE",          num: 11, bloque: 1 },
    { txt: "        else:",                              num: 12, bloque: 1 },
    { txt: "            tipo[(u, v)] = CRUZADA",         num: 13, bloque: 1 },
    { txt: "    color[u] = NEGRO",                       num: 14 },
    { txt: "    reloj[0] = reloj[0] + 1",                num: 15 },
    { txt: "    f[u] = reloj[0]",                        num: 16 },
    { txt: "",                                           num: null },
    { txt: "for u in grafo:",                            num: 17, bloque: 2 },
    { txt: "    if color[u] == BLANCO:",                 num: 18, bloque: 2 },
    { txt: "        visit(u)",                           num: 19, bloque: 2 }
  ];

  var CODIGO_NO_DIRIGIDO = [
    { txt: "def visit(u, padre):",                       num: null },
    { txt: "    color[u] = GRIS",                        num: 1 },
    { txt: "    reloj[0] = reloj[0] + 1",                num: 2 },
    { txt: "    d[u] = reloj[0]",                        num: 3 },
    { txt: "    for v in grafo[u]:",                     num: 4,  bloque: 1 },
    { txt: "        if v != padre:",                     num: 5,  bloque: 1 },
    { txt: "            if color[v] == BLANCO:",         num: 6,  bloque: 1 },
    { txt: "                tipo[(u, v)] = ARBOL",       num: 7,  bloque: 1 },
    { txt: "                visit(v, u)",                num: 8,  bloque: 1 },
    { txt: "            elif color[v] == GRIS:",         num: 9,  bloque: 1 },
    { txt: "                tipo[(u, v)] = RETROCESO",   num: 10, bloque: 1 },
    { txt: "    color[u] = NEGRO",                       num: 11 },
    { txt: "    reloj[0] = reloj[0] + 1",                num: 12 },
    { txt: "    f[u] = reloj[0]",                        num: 13 },
    { txt: "",                                           num: null },
    { txt: "for u in grafo:",                            num: 14, bloque: 2 },
    { txt: "    if color[u] == BLANCO:",                 num: 15, bloque: 2 },
    { txt: "        visit(u, -1)",                       num: 16, bloque: 2 }
  ];

  var BLANCO = 0, GRIS = 1, NEGRO = 2;
  var NOMBRE_COLOR = ["blanco", "gris", "negro"];

  /* tope: cuantas veces se pregunta cada tipo en el grafo. La primera arista
     del recorrido nunca se pregunta: siempre llega a un vertice blanco. */
  var PRESETS = [
    { nombre: "Dirigido, cinco vértices", dirigido: true, tope: 2,
      adj: [[1, 2], [2], [0], [1, 4], []],
      pos: [[80, 130], [230, 45], [230, 210], [390, 130], [520, 130]] },
    { nombre: "No dirigido, cinco vértices", dirigido: false, tope: 2,
      adj: [[1, 2], [0, 2, 3], [0, 1], [1, 4], [3]],
      pos: [[80, 130], [230, 45], [230, 210], [390, 130], [520, 130]] },
    { nombre: "Dirigido, ocho vértices", dirigido: true, tope: 3,
      adj: [[1, 2, 4], [2, 3], [0], [1], [3], [4, 6, 7], [5, 7], [4]],
      pos: [[60, 130], [170, 50], [170, 210], [300, 50], [300, 210], [420, 210], [520, 130], [420, 50]] }
  ];

  var ETIQUETAS = {
    dirigido: [["arbol", "Árbol"], ["retroceso", "Retroceso"], ["avance", "Avance"], ["cruzada", "Cruzada"]],
    noDirigido: [["arbol", "Árbol"], ["retroceso", "Retroceso"], ["padre", "Es el padre"], ["ya", "Ya clasificada"]]
  };

  function codigoDe(q) { return q.dirigido ? CODIGO_DIRIGIDO : CODIGO_NO_DIRIGIDO; }

  /* Las aristas del dibujo: en el dirigido, una por entrada de las listas; en
     el no dirigido, una por par, en el orden en que aparece por primera vez. */
  function aristasDibujo(q) {
    var lista = [], u = 0, i, v, j, ya;
    while (u < q.adj.length) {
      i = 0;
      while (i < q.adj[u].length) {
        v = q.adj[u][i];
        if (q.dirigido) {
          lista.push([u, v]);
        } else {
          ya = false;
          j = 0;
          while (j < lista.length) {
            if ((lista[j][0] === u && lista[j][1] === v) || (lista[j][0] === v && lista[j][1] === u)) { ya = true; }
            j = j + 1;
          }
          if (!ya) { lista.push([u, v]); }
        }
        i = i + 1;
      }
      u = u + 1;
    }
    return lista;
  }

  function flecha(q, u, v) { return u + (q.dirigido ? " → " : "–") + v; }

  /* El tipo de la arista (u, v) en el momento en que el codigo la mira. */
  function tipoAlMirar(q, color, d, u, v, padre) {
    var t;
    if (q.dirigido) {
      if (color[v] === BLANCO) { t = "arbol"; }
      else if (color[v] === GRIS) { t = "retroceso"; }
      else if (d[u] < d[v]) { t = "avance"; }
      else { t = "cruzada"; }
    } else {
      if (v === padre) { t = "padre"; }
      else if (color[v] === BLANCO) { t = "arbol"; }
      else if (color[v] === GRIS) { t = "retroceso"; }
      else { t = "ya"; }
    }
    return t;
  }

  function simularGrafo(q) {
    var n = q.adj.length, color = [], d = [], f = [], tipo = {}, reloj = 0;
    var pasos = [], llamadas = [], vistas = [], preguntadas = {}, primera = true, t = 0;
    while (t < n) { color.push(BLANCO); d.push(0); f.push(0); t = t + 1; }

    function foto(linea, u, v, padre, extra) {
      var tp = {}, c, s;
      for (c in tipo) { if (Object.prototype.hasOwnProperty.call(tipo, c)) { tp[c] = tipo[c]; } }
      s = { linea: linea, u: u, v: v === null ? "–" : v, mirando: v,
            padre: padre === null ? "–" : padre, reloj: reloj,
            color: color.slice(), d: d.slice(), f: f.slice(), tipo: tp,
            llamadas: llamadas.slice(), vistas: vistas.slice() };
      for (c in extra) { if (Object.prototype.hasOwnProperty.call(extra, c)) { s[c] = extra[c]; } }
      pasos.push(s);
    }

    /* El ciclo que cierra una arista de retroceso: desde v por la pila hasta u. */
    function ciclo(u, v) {
      var k = llamadas.indexOf(v), camino = llamadas.slice(k);
      camino.push(v);
      return camino.join(q.dirigido ? " → " : "–");
    }

    function mirar(u, v, padre) {
      var tp = tipoAlMirar(q, color, d, u, v, padre);
      var preg = false;
      if (!primera) {
        preguntadas[tp] = preguntadas[tp] || 0;
        if (preguntadas[tp] < q.tope) { preg = true; preguntadas[tp] = preguntadas[tp] + 1; }
      }
      primera = false;
      foto(4, u, v, padre, { pregunta: preg, correcta: tp, colorV: color[v], dU: d[u], dV: d[v],
        padreU: padre, previo: tipo[v + "," + u] || null,
        ciclo: tp === "retroceso" ? ciclo(u, v) : "" });
      return tp;
    }

    function registrar(u, v, tp) { vistas.push({ u: u, v: v, tipo: tp }); }

    function visitDirigido(u) {
      llamadas.push(u);
      color[u] = GRIS;
      foto(1, u, null, null, {});
      reloj = reloj + 1;
      foto(2, u, null, null, {});
      d[u] = reloj;
      foto(3, u, null, null, { aviso: "Se descubre " + u + ": d[" + u + "] = " + d[u] + " y queda gris." });
      var i = 0;
      while (i < q.adj[u].length) {
        var v = q.adj[u][i], tp = mirar(u, v, null), info = pasos[pasos.length - 1];
        foto(5, u, v, null, {});
        if (tp === "arbol") {
          tipo[u + "," + v] = "arbol";
          registrar(u, v, tp);
          foto(6, u, v, null, { aviso: explicar(info) });
          foto(7, u, v, null, {});
          visitDirigido(v);
        } else {
          foto(8, u, v, null, {});
          if (tp === "retroceso") {
            tipo[u + "," + v] = "retroceso";
            registrar(u, v, tp);
            foto(9, u, v, null, { aviso: explicar(info) });
          } else {
            foto(10, u, v, null, {});
            if (tp === "avance") {
              tipo[u + "," + v] = "avance";
              registrar(u, v, tp);
              foto(11, u, v, null, { aviso: explicar(info) });
            } else {
              foto(12, u, v, null, {});
              tipo[u + "," + v] = "cruzada";
              registrar(u, v, tp);
              foto(13, u, v, null, { aviso: explicar(info) });
            }
          }
        }
        i = i + 1;
      }
      color[u] = NEGRO;
      foto(14, u, null, null, {});
      reloj = reloj + 1;
      foto(15, u, null, null, {});
      f[u] = reloj;
      foto(16, u, null, null, { aviso: u + " termina: f[" + u + "] = " + f[u] + " y queda negro." });
      llamadas.pop();
    }

    function visitNoDirigido(u, padre) {
      llamadas.push(u);
      color[u] = GRIS;
      foto(1, u, null, padre, {});
      reloj = reloj + 1;
      foto(2, u, null, padre, {});
      d[u] = reloj;
      foto(3, u, null, padre, { aviso: "Se descubre " + u + ": d[" + u + "] = " + d[u] + " y queda gris." });
      var i = 0;
      while (i < q.adj[u].length) {
        var v = q.adj[u][i], tp = mirar(u, v, padre), info = pasos[pasos.length - 1];
        if (tp === "padre") {
          registrar(u, v, tp);
          foto(5, u, v, padre, { aviso: explicar(info), resalta: true });
        } else {
          foto(5, u, v, padre, { resalta: true });
          foto(6, u, v, padre, { resalta: true });
          if (tp === "arbol") {
            tipo[u + "," + v] = "arbol";
            registrar(u, v, tp);
            foto(7, u, v, padre, { aviso: explicar(info) });
            foto(8, u, v, padre, {});
            visitNoDirigido(v, u);
          } else if (tp === "retroceso") {
            foto(9, u, v, padre, {});
            tipo[u + "," + v] = "retroceso";
            registrar(u, v, tp);
            foto(10, u, v, padre, { aviso: explicar(info) });
          } else {
            registrar(u, v, tp);
            foto(9, u, v, padre, { aviso: explicar(info), resalta: true });
          }
        }
        i = i + 1;
      }
      color[u] = NEGRO;
      foto(11, u, null, padre, {});
      reloj = reloj + 1;
      foto(12, u, null, padre, {});
      f[u] = reloj;
      foto(13, u, null, padre, { aviso: u + " termina: f[" + u + "] = " + f[u] + " y queda negro." });
      llamadas.pop();
    }

    var r = 0, l0 = q.dirigido ? 17 : 14;
    while (r < n) {
      foto(l0, r, null, null, {});
      foto(l0 + 1, r, null, null, color[r] === BLANCO ? {} :
        { aviso: r + " ya está negro: el ciclo externo sigue sin llamar a visit." });
      if (color[r] === BLANCO) {
        foto(l0 + 2, r, null, null, { aviso: r + " sigue blanco: arranca un árbol nuevo del bosque." });
        if (q.dirigido) { visitDirigido(r); } else { visitNoDirigido(r, -1); }
      }
      r = r + 1;
    }
    return { pasos: pasos, d: d, f: f, tipo: tipo, vistas: vistas };
  }

  function simular(params) { return simularGrafo(PRESETS[params.p]).pasos; }

  /* El paso donde el codigo mira una arista lleva todo lo que hace falta para
     juzgar una prediccion: el tipo correcto, el color de v y los dos d. */
  function explicar(s) {
    var u = s.u, v = s.mirando, msg = "";
    if (s.correcta === "arbol") {
      msg = "Árbol: " + v + " está blanco, así que la arista " + u + (s.padreU === null ? " → " : "–") + v +
            " lo descubre y el recorrido baja a él.";
    } else if (s.correcta === "retroceso") {
      msg = "Retroceso: " + v + " está gris, sigue en la pila de llamadas" +
            (s.padreU === null ? "" : " y no es el padre de " + u) +
            ". Es ancestro de " + u + " y la arista cierra el ciclo " + s.ciclo + ".";
    } else if (s.correcta === "avance") {
      msg = "Avance: " + v + " está negro y d[" + u + "] = " + s.dU + " < d[" + v + "] = " + s.dV + ". Se descubrió después de " +
            u + " y ya terminó: es descendiente de " + u + " por otro camino del árbol.";
    } else if (s.correcta === "cruzada") {
      msg = "Cruzada: " + v + " está negro y d[" + v + "] = " + s.dV + " < d[" + u + "] = " + s.dU + ". Terminó antes de que " +
            u + " se descubriera, así que ninguno de los dos es ancestro del otro.";
    } else if (s.correcta === "padre") {
      msg = "Es el padre: " + u + " llegó desde " + v + " por la arista de árbol " + v + "–" + u +
            ", y la lista de " + u + " la trae otra vez desde el otro extremo. La guarda v != padre la salta.";
    } else {
      msg = "Ya clasificada: " + v + " está negro. Cuando " + v + " miró esta arista, " + u + " estaba gris y la arista " +
            v + "–" + u + " quedó como " + (s.previo === "arbol" ? "árbol" : "retroceso") +
            ". Ahora aparece desde el otro extremo y el código no hace nada. En un grafo dirigido sería de avance; aquí es la misma arista.";
    }
    return msg;
  }

  function textoPadre(s) {
    return s.padreU === -1 ? s.u + " es la raíz y no tiene padre" : "el padre de " + s.u + " es " + s.padreU;
  }

  /* Por que falla cada prediccion equivocada: el color de v, la comparacion
     de los d o el padre. */
  function juzgar(s, elegido) {
    var u = s.u, v = s.mirando, c = s.correcta, msg;
    if (elegido === c) { return { ok: true, msg: explicar(s) }; }
    if (c === "arbol") {
      if (elegido === "retroceso") {
        msg = "Mire el color de " + v + ": está blanco, nadie lo ha descubierto. Retroceso pide un vértice gris, abierto en la pila.";
      } else if (elegido === "padre") {
        msg = "Mire quién es el padre: " + textoPadre(s) + ". El " + v + " es otro vértice, y está blanco.";
      } else if (elegido === "ya") {
        msg = v + " está blanco: nadie ha mirado esta arista desde " + v + ", porque " + v + " no se ha descubierto.";
      } else if (elegido === "avance") {
        msg = "Mire el color de " + v + ": está blanco. Avance pide un descendiente de " + u + " que ya terminó, negro; un vértice blanco se descubre por esta misma arista.";
      } else {
        msg = "Mire el color de " + v + ": está blanco. Cruzada pide un vértice negro, que terminó en otra rama; un vértice blanco se descubre por esta misma arista.";
      }
    } else if (c === "retroceso") {
      if (elegido === "arbol") {
        msg = v + " ya no está blanco: se descubrió con d[" + v + "] = " + s.dV + " y sigue gris. Una arista de árbol solo llega a un vértice blanco.";
      } else if (elegido === "padre") {
        msg = "Mire quién es el padre: " + textoPadre(s) + ", no " + v + ". El " + v + " está gris porque es un ancestro más arriba en la pila.";
      } else if (elegido === "ya") {
        msg = v + " está gris, no negro: es la primera vez que se mira esta arista. " + v + " va a la mitad de su lista y todavía no llega a " + u + ".";
      } else if (elegido === "avance") {
        msg = v + " está gris, no negro: no ha terminado y sigue en la pila. Avance pide un descendiente que ya terminó; uno gris es ancestro de " + u + ".";
      } else {
        msg = v + " está gris, no negro: no ha terminado y sigue en la pila. Cruzada pide un vértice que terminó en otra rama; uno gris está en la misma rama, arriba de " + u + ".";
      }
    } else if (c === "avance") {
      if (elegido === "cruzada") {
        msg = "Compare los tiempos: d[" + u + "] = " + s.dU + " y d[" + v + "] = " + s.dV + ". Como d[" + u + "] < d[" + v + "], " + v +
              " se descubrió después de " + u + " y es descendiente suyo. Cruzada sería con d[" + v + "] < d[" + u + "].";
      } else if (elegido === "retroceso") {
        msg = v + " está negro, no gris: ya terminó y salió de la pila. Retroceso pide un vértice gris.";
      } else {
        msg = v + " no está blanco: ya se descubrió y terminó, con d[" + v + "] = " + s.dV + ". Una arista de árbol solo llega a un vértice blanco.";
      }
    } else if (c === "cruzada") {
      if (elegido === "avance") {
        msg = "Compare los tiempos: d[" + u + "] = " + s.dU + " y d[" + v + "] = " + s.dV + ". Como d[" + v + "] < d[" + u + "], " + v +
              " se descubrió antes que " + u + "; un descendiente de " + u + " se habría descubierto después. Avance pide d[" + u + "] < d[" + v + "].";
      } else if (elegido === "retroceso") {
        msg = v + " está negro, no gris: terminó antes de que " + u + " se descubriera. Retroceso pide un vértice gris.";
      } else {
        msg = v + " no está blanco: ya se descubrió y terminó, con d[" + v + "] = " + s.dV + ". Una arista de árbol solo llega a un vértice blanco.";
      }
    } else if (c === "padre") {
      if (elegido === "retroceso") {
        msg = v + " está gris, pero es el padre de " + u + ": la arista " + u + "–" + v + " es la misma de árbol por la que se llegó. Sin la guarda v != padre, cada arista de árbol parecería un ciclo de dos vértices.";
      } else if (elegido === "ya") {
        msg = "Esta arista sí quedó clasificada, como árbol, pero el código no mira eso: mira si " + v + " es el padre de " + u + ". Lo es, y " + v + " sigue gris; la salta la guarda v != padre.";
      } else {
        msg = v + " no está blanco: es el padre de " + u + ", que lo descubrió antes y sigue gris.";
      }
    } else {
      if (elegido === "retroceso") {
        msg = v + " está negro, no gris. Esta arista ya quedó como retroceso cuando se miró desde " + v + "; contarla otra vez daría dos veces el mismo ciclo.";
      } else if (elegido === "padre") {
        msg = "Mire quién es el padre: " + textoPadre(s) + ", no " + v + ". Y " + v + " está negro, ya terminó.";
      } else {
        msg = v + " no está blanco: ya se descubrió y terminó, con d[" + v + "] = " + s.dV + ".";
      }
    }
    return { ok: false, msg: msg };
  }

  /* Las preguntas de un grafo: los pasos donde se mira una arista y se pide el tipo. */
  function preguntas(p) {
    return simular({ p: p }).filter(function (s) { return s.pregunta === true; });
  }

  function cuentas(p) {
    var r = simularGrafo(PRESETS[p]), c = { arbol: 0, retroceso: 0, avance: 0, cruzada: 0, padre: 0, ya: 0 };
    r.vistas.forEach(function (x) { c[x.tipo] = c[x.tipo] + 1; });
    return c;
  }

  /* Opciones de la pregunta final: cuantas aristas de retroceso hubo. Cada
     distractor es la cuenta de quien junta el retroceso con otro tipo. */
  function opcionesRetroceso(p) {
    var q = PRESETS[p], c = cuentas(p), r = simularGrafo(q), lista, salida = [], vistos = {}, t = 0;
    var retros = r.vistas.filter(function (x) { return x.tipo === "retroceso"; })
      .map(function (x) { return flecha(q, x.u, x.v); });
    var buena = { valor: c.retroceso, clave: "correcta",
      razon: "Correcto: " + c.retroceso + (c.retroceso === 1 ? " arista, " : " aristas, ") + retros.join(", ") +
             (c.retroceso === 1 ? ". Llega a un vértice gris y cierra un ciclo, así que el grafo tiene ciclo."
                                : ". Cada una llega a un vértice gris y cierra un ciclo, así que el grafo tiene ciclos.") };
    if (q.dirigido) {
      lista = [buena,
        { valor: c.retroceso + c.avance, clave: "con-avance",
          razon: "Sumó las de avance. Una arista de avance llega a un vértice negro, que ya terminó, y no cierra ningún ciclo: va de un ancestro a un descendiente, en el mismo sentido del árbol." },
        { valor: c.retroceso + c.avance + c.cruzada, clave: "visitados",
          razon: "Contó toda arista hacia un vértice ya descubierto. Solo las que llegan a un vértice gris cierran un ciclo; las que llegan a uno negro son de avance o cruzadas." },
        { valor: c.retroceso + c.cruzada, clave: "con-cruzada",
          razon: "Sumó las cruzadas. Una cruzada llega a un vértice que terminó en otra rama, y desde ahí no hay camino de vuelta a u: no cierra ciclo." },
        { valor: c.arbol, clave: "arbol",
          razon: "Ese es el número de aristas de árbol, las que descubren un vértice blanco. Son las que arman el bosque, no las que cierran ciclos." }];
    } else {
      lista = [buena,
        { valor: c.retroceso + c.padre, clave: "con-padre",
          razon: "Contó las vueltas al padre. Desde cada hijo la lista trae otra vez la arista de árbol por la que se llegó; el padre está gris, pero la guarda v != padre la salta." },
        { valor: c.retroceso + c.ya, clave: "doble",
          razon: "Contó dos veces la misma arista: desde un extremo quedó como retroceso y desde el otro aparece con el vértice negro, ya clasificada." },
        { valor: c.retroceso + c.padre + c.ya, clave: "visitados",
          razon: "Contó toda arista hacia un vértice ya descubierto. Las vueltas al padre y las ya clasificadas son aristas que ya se contaron una vez." },
        { valor: c.arbol, clave: "arbol",
          razon: "Ese es el número de aristas de árbol, las que descubren un vértice blanco." }];
    }
    while (t < lista.length) {
      if (!vistos[lista[t].valor]) { vistos[lista[t].valor] = true; salida.push(lista[t]); }
      t = t + 1;
    }
    return salida;
  }

  return { CODIGO_DIRIGIDO: CODIGO_DIRIGIDO, CODIGO_NO_DIRIGIDO: CODIGO_NO_DIRIGIDO, PRESETS: PRESETS,
           ETIQUETAS: ETIQUETAS, BLANCO: BLANCO, GRIS: GRIS, NEGRO: NEGRO, NOMBRE_COLOR: NOMBRE_COLOR,
           codigoDe: codigoDe, aristasDibujo: aristasDibujo, flecha: flecha, simularGrafo: simularGrafo,
           simular: simular, explicar: explicar, juzgar: juzgar, preguntas: preguntas, cuentas: cuentas,
           opcionesRetroceso: opcionesRetroceso };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, params = { p: 0 }, respondidas = {}, kActual = 0, pasoActual = null;
    var aciertos = 0, intentos = 0, falladas = {};
    var NOMBRES = { arbol: "árbol", retroceso: "retroceso", avance: "avance", cruzada: "cruzada",
                    padre: "es el padre", ya: "ya clasificada" };
    function el(id) { return document.getElementById(id); }
    function grafo() { return E.PRESETS[params.p]; }

    /* El tipo de cada arista del dibujo segun lo clasificado en el paso s. */
    function tipoDibujo(q, s, a) {
      var t = s ? (s.tipo[a[0] + "," + a[1]] || (q.dirigido ? null : s.tipo[a[1] + "," + a[0]] || null)) : null;
      return t;
    }

    function svg(s) {
      var q = grafo(), lista = E.aristasDibujo(q);
      var aristas = lista.map(function (a) {
        var t = tipoDibujo(q, s, a);
        var r = t === "retroceso" ? "R" : (t === "avance" ? "A" : (t === "cruzada" ? "C" : ""));
        return [a[0], a[1], r];
      });
      return GRAFOSVG.dibujar({
        n: q.adj.length, pos: q.pos, aristas: aristas, dirigido: q.dirigido, maxAncho: 560,
        arista: function (i) {
          var a = lista[i], t = tipoDibujo(q, s, a), o = { color: "claro", grueso: 2 };
          var ve = s && s.mirando !== null && s.mirando !== undefined &&
            ((s.u === a[0] && s.mirando === a[1]) || (!q.dirigido && s.u === a[1] && s.mirando === a[0]));
          if (t === "arbol") { o = { color: "azul", grueso: 3.6 }; }
          if (t === "retroceso") { o = { color: "rojo", grueso: 2.2, trazo: "7 5" }; }
          if (t === "avance") { o = { color: "verde", grueso: 2.2 }; }
          if (t === "cruzada") { o = { color: "ambar", grueso: 2.2 }; }
          if (ve && (s.linea === 4 || t === null || s.resalta === true)) { o = { color: "morado", grueso: 4, trazo: o.trazo }; }
          return o;
        },
        nodo: function (i) {
          var c = s ? s.color[i] : E.BLANCO, o = {};
          if (c === E.GRIS) { o.relleno = "#aeb5bf"; o.borde = "#4b5563"; o.nota = s.d[i] + "/"; o.notaColor = "#4b5563"; }
          if (c === E.NEGRO) { o.relleno = "#24292f"; o.borde = "#24292f"; o.tinta = "#ffffff"; o.nota = s.d[i] + "/" + s.f[i]; o.notaColor = "#24292f"; }
          if (s && s.u === i && s.linea !== (grafo().dirigido ? 17 : 14) && s.linea !== (grafo().dirigido ? 18 : 15)) {
            o.grueso = 4.5;
            if (c !== E.NEGRO) { o.borde = "#7b3fa0"; }
          }
          return o;
        }
      });
    }

    function etiquetasActivas() { return grafo().dirigido ? "etiquetas-dirigido" : "etiquetas-no-dirigido"; }

    function esPregunta(s, k) { return s && s.linea === 4 && s.pregunta === true && !respondidas[k]; }

    function pintarTabla(s) {
      var q = grafo(), h = "", i = 0;
      while (i < q.adj.length) {
        var c = s ? s.color[i] : E.BLANCO;
        h = h + "<tr><td>" + i + "</td><td class='estado-" + E.NOMBRE_COLOR[c] + "'>" + E.NOMBRE_COLOR[c] + "</td><td>" +
          (s && s.d[i] > 0 ? s.d[i] : "") + "</td><td>" + (s && s.f[i] > 0 ? s.f[i] : "") + "</td></tr>";
        i = i + 1;
      }
      el("cuerpo-vertices").innerHTML = h;
      var vistas = s ? s.vistas : [];
      el("ver-vistas").innerHTML = vistas.length === 0 ? "ninguna todavía" : vistas.map(function (x) {
        return "<span class='tipo-" + x.tipo + "'>" + E.flecha(q, x.u, x.v) + " " + NOMBRES[x.tipo] + "</span>";
      }).join(", ");
    }

    function pintarPregunta() {
      var s = pasoActual, activa = esPregunta(s, kActual), q = grafo();
      el("etiquetas-dirigido").style.display = q.dirigido ? "" : "none";
      el("etiquetas-no-dirigido").style.display = q.dirigido ? "none" : "";
      Array.prototype.forEach.call(document.querySelectorAll("#" + etiquetasActivas() + " button"), function (b) {
        b.disabled = !activa;
      });
      if (activa) {
        el("texto-pregunta").innerHTML = "<code>visit(" + s.u + (q.dirigido ? "" : ", " + s.padre) + ")</code> mira la arista <b>" +
          E.flecha(q, s.u, s.mirando) + "</b>. Mire el color de " + s.mirando + " en la tabla. ¿De qué tipo es?";
      } else {
        el("texto-pregunta").textContent = "Avance con el botón Un paso. Cuando el código mire una arista, la pregunta aparece aquí.";
      }
      var total = E.preguntas(params.p).length;
      el("cuenta-pred").textContent = "Predicciones: " + intentos + " de " + total + " aristas, " + aciertos + " al primer intento.";
    }

    function alPintar(e) {
      kActual = e.k;
      pasoActual = e.actual;
      var a = e.actual;
      el("panel-grafo").innerHTML = svg(a);
      el("ver-pila").textContent = a && a.llamadas.length > 0 ?
        a.llamadas.map(function (x) { return "visit(" + x + ")"; }).join(" → ") : "vacía";
      el("ver-msg").textContent = a && a.aviso ? a.aviso : "";
      pintarTabla(a);
      if (esPregunta(a, e.k)) {
        el("veredicto-tipo").className = "veredicto";
        el("veredicto-tipo").textContent = "";
        if (el("btn-auto").textContent === "Pausa") { el("btn-auto").click(); }
      }
      pintarPregunta();
      el("caja-final").style.display = e.terminado ? "" : "none";
      el("espera-final").style.display = e.terminado ? "none" : "";
    }

    function responder(tipo) {
      var s = pasoActual, r, v = el("veredicto-tipo");
      if (!esPregunta(s, kActual)) { return; }
      r = E.juzgar(s, tipo);
      v.className = r.ok ? "veredicto bien" : "veredicto mal";
      v.textContent = r.msg;
      if (!falladas[kActual] && !r.ok) { falladas[kActual] = true; }
      if (r.ok) {
        respondidas[kActual] = true;
        intentos = intentos + 1;
        if (!falladas[kActual]) { aciertos = aciertos + 1; }
        el("btn-paso").click();
      }
      pintarPregunta();
    }

    /* Mientras haya una pregunta abierta, ni Un paso ni Auto avanzan. */
    document.addEventListener("click", function (ev) {
      var b = ev.target && ev.target.closest ? ev.target.closest("button") : null;
      if (!b) { return; }
      var bloquea = (b.id === "btn-paso") || (b.id === "btn-auto" && b.textContent === "Auto");
      if (bloquea && esPregunta(pasoActual, kActual)) {
        ev.stopPropagation();
        ev.preventDefault();
        el("veredicto-tipo").className = "veredicto mal";
        el("veredicto-tipo").textContent = "Escoja primero el tipo de la arista " + E.flecha(grafo(), pasoActual.u, pasoActual.mirando) + ".";
      }
      if (b.id === "btn-reiniciar") { limpiarPredicciones(); }
    }, true);

    function limpiarPredicciones() {
      respondidas = {};
      falladas = {};
      aciertos = 0;
      intentos = 0;
      el("veredicto-tipo").className = "veredicto";
      el("veredicto-tipo").textContent = "";
    }

    function arrancar() {
      var ids = ["btn-paso", "btn-auto", "btn-fin", "btn-reiniciar"], t = 0;
      while (t < ids.length) {
        var b = el(ids[t]);
        b.parentNode.replaceChild(b.cloneNode(true), b);
        t = t + 1;
      }
      var chips = grafo().dirigido
        ? [{ campo: "u", rotulo: "u" }, { campo: "v", rotulo: "v" }, { campo: "reloj", rotulo: "reloj", clase: "cuenta" }]
        : [{ campo: "u", rotulo: "u" }, { campo: "padre", rotulo: "padre" }, { campo: "v", rotulo: "v" },
           { campo: "reloj", rotulo: "reloj", clase: "cuenta" }];
      limpiarPredicciones();
      Motor.iniciar({ codigo: E.codigoDe(grafo()), simular: E.simular, chips: chips,
                      paramsIniciales: { p: params.p }, alPintar: alPintar });
    }

    function botonesEtiquetas(id, lista) {
      el(id).innerHTML = lista.map(function (x) {
        return "<button data-tipo='" + x[0] + "'>" + x[1] + "</button>";
      }).join("");
      Array.prototype.forEach.call(el(id).querySelectorAll("button"), function (b) {
        b.addEventListener("click", function () { responder(b.getAttribute("data-tipo")); });
      });
    }

    el("presets").innerHTML = E.PRESETS.map(function (x, i) {
      return "<button data-i='" + i + "'" + (i === 0 ? " class='primario'" : "") + ">" + x.nombre + "</button>";
    }).join("");
    Array.prototype.forEach.call(el("presets").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        params.p = parseInt(b.getAttribute("data-i"), 10);
        Array.prototype.forEach.call(el("presets").querySelectorAll("button"), function (x) { x.classList.remove("primario"); });
        b.classList.add("primario");
        arrancar();
      });
    });
    botonesEtiquetas("etiquetas-dirigido", E.ETIQUETAS.dirigido);
    botonesEtiquetas("etiquetas-no-dirigido", E.ETIQUETAS.noDirigido);

    arrancar();
    Motor.opcionesNumericas("opciones-retroceso", "veredicto-retroceso", function (ps) {
      return E.opcionesRetroceso(ps.p);
    });
  })();
}
