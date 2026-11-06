/* Ejercicio interactivo: UVa 11686, ciclos en un grafo dirigido con tres
   estados. El codigo que se simula es la funcion dfs de la sesion; main la
   llama desde todo nodo sin visitar, en orden. */
var EJERCICIO = (function () {
  var CODIGO = [
    { txt: "def dfs(adj, color, orden, u):",                 num: null },
    { txt: "    hayCiclo = False",                           num: 1 },
    { txt: "    color[u] = EN_CAMINO",                       num: 2 },
    { txt: "    for v in adj[u]:",                           num: 3,  bloque: 1 },
    { txt: "        if color[v] == EN_CAMINO:",              num: 4,  bloque: 1 },
    { txt: "            hayCiclo = True",                    num: 5,  bloque: 1 },
    { txt: "        elif color[v] == SIN_VISITAR:",          num: 6,  bloque: 1 },
    { txt: "            if dfs(adj, color, orden, v):",      num: 7,  bloque: 1 },
    { txt: "                hayCiclo = True",                num: 8,  bloque: 1 },
    { txt: "    color[u] = TERMINADO",                       num: 9 },
    { txt: "    orden.append(u)",                            num: 10 },
    { txt: "    return hayCiclo",                            num: 11 }
  ];

  var SIN_VISITAR = 0, EN_CAMINO = 1, TERMINADO = 2;

  var PRESETS = [
    { nombre: "el diamante", nodos: [0, 1, 2, 3],
      aristas: [[0, 1], [0, 2], [1, 3], [2, 3]],
      pos: [[80, 125], [280, 40], [280, 210], [480, 125]] },
    { nombre: "el diamante con ciclo", nodos: [0, 1, 2, 3],
      aristas: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 1]],
      pos: [[80, 125], [280, 40], [280, 210], [480, 125]] },
    { nombre: "la muestra", nodos: [1, 2, 3],
      aristas: [[1, 2], [2, 3]],
      pos: [[80, 125], [280, 125], [480, 125]] },
    { nombre: "tres raíces", nodos: [1, 2, 3],
      aristas: [[3, 2], [2, 1]],
      pos: [[80, 125], [280, 125], [480, 125]] },
    { nombre: "ciclo lejos del primero", nodos: [1, 2, 3, 4, 5, 6],
      aristas: [[1, 2], [4, 5], [5, 6], [6, 4]],
      pos: [[80, 60], [80, 190], [190, 40], [270, 125], [470, 40], [470, 210]] }
  ];

  function adyacencia(nodos, aristas) {
    var adj = {}, i = 0;
    while (i < nodos.length) { adj[nodos[i]] = []; i = i + 1; }
    i = 0;
    while (i < aristas.length) { adj[aristas[i][0]].push(aristas[i][1]); i = i + 1; }
    return adj;
  }

  function simularGrafo(nodos, aristas) {
    var adj = adyacencia(nodos, aristas), color = {}, orden = [], pasos = [], pila = [];
    var algunCiclo = false, r = 0, t = 0;
    while (t < nodos.length) { color[nodos[t]] = SIN_VISITAR; t = t + 1; }

    function copiaColor() {
      var c = {}, z = 0;
      while (z < nodos.length) { c[nodos[z]] = color[nodos[z]]; z = z + 1; }
      return c;
    }

    function foto(linea, u, v, hay, extra) {
      var s = { linea: linea, u: u, v: v === null ? "–" : v, mirando: v,
                hayCiclo: hay === null ? "–" : (hay ? "True" : "False"),
                color: copiaColor(), camino: pila.slice(), orden: orden.slice(),
                algunCiclo: algunCiclo };
      var c;
      for (c in extra) { if (Object.prototype.hasOwnProperty.call(extra, c)) { s[c] = extra[c]; } }
      pasos.push(s);
    }

    function dfs(u) {
      var hay = false;
      pila.push(u);
      foto(1, u, null, hay, {});
      color[u] = EN_CAMINO;
      foto(2, u, null, hay, {});
      var i = 0;
      while (i < adj[u].length) {
        var v = adj[u][i];
        foto(3, u, v, hay, {});
        foto(4, u, v, hay, { decision: true, colorV: color[v] });
        if (color[v] === EN_CAMINO) {
          hay = true;
          algunCiclo = true;
          foto(5, u, v, hay, { aviso: "El nodo " + v + " está en el camino actual: esta arista cierra un ciclo." });
        } else {
          foto(6, u, v, hay, color[v] === TERMINADO ?
            { aviso: "El nodo " + v + " ya terminó: esta arista no cierra nada." } : {});
          if (color[v] === SIN_VISITAR) {
            foto(7, u, v, hay, { aviso: "El nodo " + v + " sigue sin visitar: se baja a él." });
            if (dfs(v)) {
              hay = true;
              foto(8, u, v, hay, {});
            }
          }
        }
        i = i + 1;
      }
      color[u] = TERMINADO;
      foto(9, u, null, hay, {});
      orden.push(u);
      foto(10, u, null, hay, {});
      foto(11, u, null, hay, {});
      pila.pop();
      return hay;
    }

    while (r < nodos.length) {
      if (color[nodos[r]] === SIN_VISITAR) { dfs(nodos[r]); }
      r = r + 1;
    }
    return { pasos: pasos, ciclo: algunCiclo, orden: orden };
  }

  function simular(params) {
    var q = PRESETS[params.p];
    return simularGrafo(q.nodos, q.aristas).pasos;
  }

  function resolver(nodos, aristas) {
    var r = simularGrafo(nodos, aristas);
    return r.ciclo ? "IMPOSSIBLE" : r.orden.slice().reverse().join("\n");
  }

  /* Las preguntas de la tarjeta: una por cada arista que el recorrido revisa. */
  function decisiones(p) {
    return simular({ p: p }).filter(function (s) { return s.decision === true; });
  }

  function juzgar(d, diceCiclo) {
    var msg;
    if (d.colorV === EN_CAMINO) {
      msg = "El nodo " + d.v + " está en el camino actual: desde él se bajó hasta " + d.u + ", y esta arista vuelve.";
      return { ok: diceCiclo, msg: diceCiclo ? msg + " Ciclo." : msg + " Sí cierra un ciclo." };
    }
    if (d.colorV === TERMINADO) {
      msg = "El nodo " + d.v + " ya terminó: revisó todo lo que sale de él, y si pudiera volver a " + d.u +
            ", esa arista ya se habría detectado.";
      return { ok: !diceCiclo, msg: diceCiclo ? msg + " Ya visitado no significa ciclo." : msg + " No cierra nada." };
    }
    msg = "El nodo " + d.v + " sigue sin visitar, así que no puede estar en el camino actual: se baja a él.";
    return { ok: !diceCiclo, msg: diceCiclo ? msg + " Todavía no hay ciclo." : msg };
  }

  /* Con dos estados: cualquier nodo ya visitado cuenta como ciclo. */
  function conDosEstados(nodos, aristas) {
    var adj = adyacencia(nodos, aristas), visto = {}, hay = false, primera = null, r = 0;
    function dfs(u) {
      visto[u] = true;
      var i = 0;
      while (i < adj[u].length) {
        var v = adj[u][i];
        if (visto[v] === true) {
          hay = true;
          if (primera === null) { primera = [u, v]; }
        } else {
          dfs(v);
        }
        i = i + 1;
      }
    }
    while (r < nodos.length) {
      if (visto[nodos[r]] !== true) { dfs(nodos[r]); }
      r = r + 1;
    }
    return { ciclo: hay, primera: primera };
  }

  return { codigo: CODIGO, PRESETS: PRESETS, SIN_VISITAR: SIN_VISITAR, EN_CAMINO: EN_CAMINO, TERMINADO: TERMINADO,
           simular: simular, simularGrafo: simularGrafo, resolver: resolver, decisiones: decisiones, juzgar: juzgar,
           conDosEstados: conDosEstados };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, params = { p: 0 }, lista = [], turno = 0, errores = 0;
    function el(id) { return document.getElementById(id); }
    function grafo() { return E.PRESETS[params.p]; }

    function svg(s) {
      var q = grafo();
      var aristas = q.aristas.map(function (r) { return [q.nodos.indexOf(r[0]), q.nodos.indexOf(r[1]), ""]; });
      return GRAFOSVG.dibujar({
        n: q.nodos.length, pos: q.pos, aristas: aristas, dirigido: true, maxAncho: 520,
        nombre: function (i) { return q.nodos[i]; },
        arista: function (i) {
          var r = q.aristas[i], ve = s && s.u === r[0] && s.mirando === r[1];
          return ve ? { color: "ambar", grueso: 3.5 } : { color: "claro", grueso: 2 };
        },
        nodo: function (i) {
          var c = s ? s.color[q.nodos[i]] : E.SIN_VISITAR, o = {};
          if (c === E.EN_CAMINO) { o.relleno = "#fdf1dc"; o.borde = "#c77c0e"; o.nota = "en camino"; o.notaColor = "#a86a12"; }
          if (c === E.TERMINADO) { o.relleno = "#6b7280"; o.borde = "#24292f"; o.tinta = "#ffffff"; o.nota = "terminado"; o.notaColor = "#6b7280"; }
          if (s && s.u === q.nodos[i]) { o.grueso = 4.5; }
          return o;
        }
      });
    }

    function textoFinal() {
      var q = grafo(), r = E.simularGrafo(q.nodos, q.aristas);
      if (r.ciclo) { return "Hay ciclo, así que se imprime IMPOSSIBLE."; }
      return "Orden de terminación: " + r.orden.join(", ") + ". Al revés se imprime " + r.orden.slice().reverse().join(", ") + ".";
    }

    function pintarDecision() {
      var d = lista[turno];
      el("cuenta-arista").textContent = "Arista " + Math.min(turno + 1, lista.length) + " de " + lista.length +
        (errores > 0 ? ", " + errores + (errores === 1 ? " error" : " errores") : "");
      if (turno < lista.length) {
        el("grafo-decision").innerHTML = svg(d);
        el("pregunta-arista").innerHTML = "El camino actual es <b>" + d.camino.join(" → ") + "</b>. <code>dfs(" + d.u +
          ")</code> mira la arista <b>" + d.u + " → " + d.v + "</b>. ¿Cierra un ciclo?";
        el("btn-si").disabled = false;
        el("btn-no").disabled = false;
      } else {
        var ps = E.simular(params);
        el("grafo-decision").innerHTML = svg(ps[ps.length - 1]);
        el("pregunta-arista").textContent = textoFinal();
        el("btn-si").disabled = true;
        el("btn-no").disabled = true;
      }
    }

    function responder(diceCiclo) {
      var r = E.juzgar(lista[turno], diceCiclo), v = el("veredicto-arista");
      v.className = r.ok ? "veredicto bien" : "veredicto mal";
      v.textContent = r.msg;
      if (r.ok) { turno = turno + 1; } else { errores = errores + 1; }
      pintarDecision();
    }

    function reiniciarDecisiones() {
      lista = E.decisiones(params.p);
      turno = 0;
      errores = 0;
      el("veredicto-arista").className = "veredicto";
      el("veredicto-arista").textContent = "";
      pintarDecision();
    }

    function alPintar(e) {
      var a = e.actual;
      el("grafo-pasos").innerHTML = svg(a);
      el("ver-camino").textContent = a && a.camino.length > 0 ? a.camino.join(" → ") : "vacío";
      el("ver-orden").textContent = a && a.orden.length > 0 ? a.orden.join(", ") : "vacío";
      el("ver-aviso").textContent = a && a.aviso ? a.aviso : "";
      el("ver-final").textContent = e.terminado ? textoFinal() : "";
    }

    function pintarDosEstados() {
      var h = "<tr><th>grafo</th><th>con tres estados</th><th>con dos estados</th><th>la primera arista que confunde</th></tr>";
      E.PRESETS.forEach(function (q) {
        var tres = E.simularGrafo(q.nodos, q.aristas).ciclo, dos = E.conDosEstados(q.nodos, q.aristas);
        var mal = tres !== dos.ciclo;
        h = h + "<tr" + (mal ? " class='fila-mal'" : "") + "><td>" + q.nombre + "</td><td>" + (tres ? "IMPOSSIBLE" : "un orden") +
          "</td><td>" + (dos.ciclo ? "IMPOSSIBLE" : "un orden") + "</td><td>" +
          (mal ? dos.primera[0] + " → " + dos.primera[1] : "") + "</td></tr>";
      });
      el("tabla-dos").innerHTML = h;
    }

    Motor.iniciar({
      codigo: E.codigo,
      simular: E.simular,
      chips: [{ campo: "u", rotulo: "u" }, { campo: "v", rotulo: "v" },
              { campo: "hayCiclo", rotulo: "hayCiclo", clase: "cuenta" }],
      paramsIniciales: params,
      alPintar: alPintar
    });

    el("presets").innerHTML = E.PRESETS.map(function (x, i) {
      return "<button data-i='" + i + "'" + (i === 0 ? " class='primario'" : "") + ">" + x.nombre + "</button>";
    }).join("");
    Array.prototype.forEach.call(el("presets").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        params.p = parseInt(b.getAttribute("data-i"), 10);
        Array.prototype.forEach.call(el("presets").querySelectorAll("button"), function (x) { x.classList.remove("primario"); });
        b.classList.add("primario");
        Motor.reiniciar(params);
        reiniciarDecisiones();
      });
    });
    el("btn-si").addEventListener("click", function () { responder(true); });
    el("btn-no").addEventListener("click", function () { responder(false); });
    el("btn-otra-vez").addEventListener("click", reiniciarDecisiones);

    reiniciarDecisiones();
    pintarDosEstados();
  })();
}
