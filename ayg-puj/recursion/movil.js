/* Ejercicio interactivo: UVa 839, Not so Mobile, llamada por llamada. */
var EJERCICIO = (function () {
  var MUESTRA = "1\n\n0 2 0 4\n0 3 0 1\n1 1 1 1\n2 4 4 2\n1 6 3 2";

  var CODIGO = [
    "def movil():",
    "    wl, dl, wr, dr = leer_linea()",
    "    eq_izq = True",
    "    eq_der = True",
    "    if wl == 0:",
    "        wl, eq_izq = movil()",
    "    if wr == 0:",
    "        wr, eq_der = movil()",
    "    equilibrio = eq_izq and eq_der and wl * dl == wr * dr",
    "    return wl + wr, equilibrio"
  ];

  var MAX_LINEAS = 15;

  /* Lee el texto de entrada. Acepta el formato del juez (numero de casos y
     lineas en blanco) o solo las lineas de cuatro enteros. Devuelve
     {lineas} o {error}. */
  function leer(texto) {
    var filas = texto.split("\n");
    var lineas = [];
    var error = null;
    filas.forEach(function (f, i) {
      var partes = f.trim().split(/\s+/).filter(function (p) { return p !== ""; });
      if (error === null && partes.length > 0) {
        var todosEnteros = partes.every(function (p) { return /^\d+$/.test(p); });
        if (!todosEnteros) {
          error = "La fila " + (i + 1) + " tiene algo que no es un entero no negativo.";
        } else if (partes.length === 4) {
          lineas.push(partes.map(function (p) { return parseInt(p, 10); }));
        } else if (partes.length !== 1 || lineas.length > 0) {
          error = "La fila " + (i + 1) + " no tiene cuatro enteros: Wl Dl Wr Dr.";
        }
      }
    });
    if (error === null && lineas.length === 0) {
      error = "No hay líneas con cuatro enteros.";
    }
    if (error === null && lineas.length > MAX_LINEAS) {
      error = "Con " + MAX_LINEAS + " líneas basta para seguirlo a mano.";
    }
    return error === null ? { lineas: lineas } : { error: error };
  }

  /* Ejecuta movil() sobre las lineas y guarda cada evento: una lectura al
     entrar a cada llamada y un retorno al salir. La pila de cada evento dice
     que espera cada marco. */
  function simular(lineas) {
    var cursor = 0;
    var pasos = [];
    var nodos = [];
    var marcos = [];
    var yaNo = false;
    var faltan = false;

    function fotoPila() {
      return marcos.map(function (m) { return { nodo: m.nodo, fase: m.fase }; });
    }

    function movil(padre, lado, prof) {
      var resultado = null;
      if (cursor >= lineas.length) {
        faltan = true;
        resultado = { peso: 0, equilibrio: false };
      } else {
        var id = cursor;
        var v = lineas[cursor];
        cursor = cursor + 1;
        var wl = v[0], dl = v[1], wr = v[2], dr = v[3];
        var caso = wl === 0 && wr === 0 ? "ambos" : (wl === 0 ? "izq" : (wr === 0 ? "der" : "base"));
        nodos.push({ id: id, valores: v, padre: padre, lado: lado, prof: prof,
                     izq: null, der: null });
        if (padre !== null) { nodos[padre][lado] = id; }
        var marco = { nodo: id, fase: "lee" };
        marcos.push(marco);
        pasos.push({ tipo: "leer", nodo: id, valores: v, prof: prof, caso: caso,
                     yaSeSabe: yaNo, pila: fotoPila() });
        var eqIzq = true;
        var eqDer = true;
        if (wl === 0) {
          marco.fase = "izq";
          var r1 = movil(id, "izq", prof + 1);
          wl = r1.peso;
          eqIzq = r1.equilibrio;
        }
        if (wr === 0) {
          marco.fase = "der";
          var r2 = movil(id, "der", prof + 1);
          wr = r2.peso;
          eqDer = r2.equilibrio;
        }
        var local = wl * dl === wr * dr;
        var equilibrio = eqIzq && eqDer && local;
        marco.fase = "devuelve";
        pasos.push({ tipo: "volver", nodo: id, peso: wl + wr, equilibrio: equilibrio,
                     wl: wl, dl: dl, wr: wr, dr: dr, local: local,
                     eqIzq: eqIzq, eqDer: eqDer, prof: prof, pila: fotoPila() });
        marcos.pop();
        if (!equilibrio) { yaNo = true; }
        resultado = { peso: wl + wr, equilibrio: equilibrio };
      }
      return resultado;
    }

    var raiz = movil(null, null, 0);
    var error = null;
    if (faltan) {
      error = "Faltan líneas: un extremo con peso 0 pide un submóvil que la entrada no trae.";
    } else if (cursor < lineas.length) {
      error = "Sobran " + (lineas.length - cursor) + " líneas: el móvil termina en la línea " + cursor + ".";
    }
    return { pasos: pasos, nodos: nodos, peso: raiz.peso, equilibrio: raiz.equilibrio,
             llamadas: nodos.length, error: error };
  }

  function mcd(a, b) {
    var x = a, y = b, t;
    while (y !== 0) {
      t = x % y;
      x = y;
      y = t;
    }
    return x;
  }

  /* Genera un movil al azar de profundidad hasta profMax (la raiz es la
     profundidad 1). azar es una funcion que devuelve un numero en [0, 1).
     Con probabilidad 0.85 cada barra se equilibra; asi salen moviles que
     dicen YES y otros que fallan en un solo nivel. */
  function generar(azar, profMax) {
    function entero(a, b) { return a + Math.floor(azar() * (b - a + 1)); }
    function construir(prof, forzar) {
      var lineas = [];
      var hijos = [null, null];
      var pesos = [0, 0];
      [0, 1].forEach(function (s) {
        var quiere = prof < profMax && (azar() < 0.45 || (forzar && s === 0));
        if (quiere) {
          hijos[s] = construir(prof + 1, false);
          pesos[s] = hijos[s].peso;
        } else {
          pesos[s] = entero(1, 8);
        }
      });
      var dl, dr;
      if (azar() < 0.85) {
        var g = mcd(pesos[0], pesos[1]);
        dl = pesos[1] / g;
        dr = pesos[0] / g;
        if (dl > 30 || dr > 30) {
          dl = entero(1, 9);
          dr = entero(1, 9);
        }
      } else {
        dl = entero(1, 9);
        dr = entero(1, 9);
      }
      lineas.push([hijos[0] ? 0 : pesos[0], dl, hijos[1] ? 0 : pesos[1], dr]);
      if (hijos[0]) { lineas = lineas.concat(hijos[0].lineas); }
      if (hijos[1]) { lineas = lineas.concat(hijos[1].lineas); }
      return { lineas: lineas, peso: pesos[0] + pesos[1] };
    }
    var res = construir(1, true);
    var intentos = 0;
    while ((res.lineas.length < 4 || res.lineas.length > MAX_LINEAS) && intentos < 50) {
      res = construir(1, true);
      intentos = intentos + 1;
    }
    return res.lineas;
  }

  function aTexto(lineas) {
    return "1\n\n" + lineas.map(function (v) { return v.join(" "); }).join("\n");
  }

  /* Coloca cada nodo y cada objeto en el dibujo: los objetos ocupan una
     casilla cada uno, de izquierda a derecha, y cada barra queda en el medio
     de sus dos extremos. */
  function disposicion(nodos) {
    var casilla = 0;
    var pos = {};
    function colocar(id) {
      var n = nodos[id];
      var xs = [];
      ["izq", "der"].forEach(function (lado, s) {
        var peso = n.valores[s * 2];
        if (peso !== 0) {
          pos["o" + id + lado] = { x: casilla, prof: n.prof + 1 };
          xs.push(casilla);
          casilla = casilla + 1;
        } else if (n[lado] !== null) {
          xs.push(colocar(n[lado]));
        } else {
          pos["p" + id + lado] = { x: casilla, prof: n.prof + 1 };
          xs.push(casilla);
          casilla = casilla + 1;
        }
      });
      pos["n" + id] = { x: (xs[0] + xs[1]) / 2, prof: n.prof };
      return pos["n" + id].x;
    }
    if (nodos[0] !== undefined) { colocar(0); }
    return { pos: pos, ancho: casilla };
  }

  return { muestra: MUESTRA, codigo: CODIGO, leer: leer, simular: simular,
           generar: generar, aTexto: aTexto, disposicion: disposicion };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var SVGNS = "http://www.w3.org/2000/svg";
    var estado = { lineas: [], res: null, k: 0 };
    var CASOS = {
      base: "caso base: los dos pesos están en la línea",
      izq: "recursivo: se lee el submóvil izquierdo",
      der: "recursivo: se lee el submóvil derecho",
      ambos: "recursivo: se leen los dos submóviles, primero el izquierdo"
    };

    function pintarCodigo() {
      var caja = document.getElementById("codigo");
      caja.innerHTML = "";
      EJERCICIO.codigo.forEach(function (t, i) {
        var linea = document.createElement("div");
        linea.className = "linea";
        linea.id = "cod-" + (i + 1);
        var num = document.createElement("span");
        num.className = "num";
        num.textContent = i + 1;
        var txt = document.createElement("span");
        txt.className = "txt";
        txt.textContent = t;
        linea.appendChild(num);
        linea.appendChild(txt);
        caja.appendChild(linea);
      });
    }

    function marcarCodigo(paso) {
      var activas = [];
      if (paso !== null && paso.tipo === "leer") { activas = [2]; }
      if (paso !== null && paso.tipo === "volver") { activas = [9, 10]; }
      EJERCICIO.codigo.forEach(function (t, i) {
        var l = document.getElementById("cod-" + (i + 1));
        l.classList.toggle("actual", activas.indexOf(i + 1) >= 0);
      });
    }

    function svg(tag, attrs, texto) {
      var e = document.createElementNS(SVGNS, tag);
      Object.keys(attrs).forEach(function (a) { e.setAttribute(a, attrs[a]); });
      if (texto !== undefined) { e.textContent = texto; }
      return e;
    }

    /* Dibuja lo que la funcion ya leyo hasta el paso k (sin incluirlo si es
       una lectura todavia sin responder). */
    function pintarArbol() {
      var dibujo = document.getElementById("arbol");
      dibujo.innerHTML = "";
      var res = estado.res;
      var leidos = {};
      var vueltos = {};
      var tarde = {};
      var m;
      for (m = 0; m < estado.k; m = m + 1) {
        var p = res.pasos[m];
        if (p.tipo === "leer") {
          leidos[p.nodo] = true;
          if (p.yaSeSabe) { tarde[p.nodo] = true; }
        } else {
          vueltos[p.nodo] = p;
        }
      }
      var actual = estado.k < res.pasos.length ? res.pasos[estado.k] : null;
      if (actual !== null && actual.tipo === "leer") {
        leidos[actual.nodo] = true;
        if (actual.yaSeSabe) { tarde[actual.nodo] = true; }
      }
      var nodosVis = res.nodos.filter(function (n) { return leidos[n.id]; });
      var lay = EJERCICIO.disposicion(nodosVis.map(function (n) {
        return { id: n.id, valores: n.valores, prof: n.prof,
                 izq: n.izq !== null && leidos[n.izq] ? n.izq : null,
                 der: n.der !== null && leidos[n.der] ? n.der : null };
      }).reduce(function (acc, n) { acc[n.id] = n; return acc; }, {}));
      /* Cada barra ocupa 34 a cada lado de su centro y su etiqueta de
         distancia va por fuera, hasta unos 70: dos barras vecinas quedan a
         dos casillas, de ahi la casilla de 80. */
      var paso = 80, alto = 92, margen = 60;
      var ancho = Math.max(lay.ancho, 2) * paso + 2 * margen;
      var profMax = 0;
      Object.keys(lay.pos).forEach(function (c) { profMax = Math.max(profMax, lay.pos[c].prof); });
      var altura = profMax * alto + 2 * margen;
      dibujo.setAttribute("viewBox", "0 0 " + ancho + " " + altura);
      dibujo.setAttribute("width", ancho);
      dibujo.setAttribute("height", altura);
      function X(c) { return margen + c.x * paso + paso / 2; }
      function Y(c) { return margen + c.prof * alto; }
      nodosVis.forEach(function (n) {
        var pn = lay.pos["n" + n.id];
        ["izq", "der"].forEach(function (lado, s) {
          var hijo = n.valores[s * 2] !== 0 ? lay.pos["o" + n.id + lado]
            : (n[lado] !== null && leidos[n[lado]] ? lay.pos["n" + n[lado]] : lay.pos["p" + n.id + lado]);
          var x1 = X(pn), y1 = Y(pn), x2 = X(hijo), y2 = Y(hijo);
          dibujo.appendChild(svg("line", { x1: x1, y1: y1, x2: x2, y2: y1, "class": "barra-svg" }));
          dibujo.appendChild(svg("line", { x1: x2, y1: y1, x2: x2, y2: y2 - 16, "class": "cuerda" }));
          dibujo.appendChild(svg("text", { x: s === 0 ? x1 - 38 : x1 + 38, y: y1 - 5,
            "class": "dist", "text-anchor": s === 0 ? "end" : "start" },
            "D=" + n.valores[s * 2 + 1]));
          if (n.valores[s * 2] !== 0) {
            dibujo.appendChild(svg("circle", { cx: x2, cy: y2, r: 15, "class": "objeto" }));
            dibujo.appendChild(svg("text", { x: x2, y: y2 + 4, "class": "peso" }, n.valores[s * 2]));
          } else if (!(n[lado] !== null && leidos[n[lado]])) {
            dibujo.appendChild(svg("rect", { x: x2 - 15, y: y2 - 15, width: 30, height: 30, rx: 6, "class": "pendiente" }));
            dibujo.appendChild(svg("text", { x: x2, y: y2 + 4, "class": "peso" }, "?"));
          }
        });
      });
      nodosVis.forEach(function (n) {
        var pn = lay.pos["n" + n.id];
        var clase = "nodo";
        if (vueltos[n.id]) { clase = clase + (vueltos[n.id].equilibrio ? " si" : " no"); }
        if (actual !== null && actual.nodo === n.id) { clase = clase + " actual"; }
        if (tarde[n.id]) { clase = clase + " tarde"; }
        var g = svg("g", { "class": clase });
        g.appendChild(svg("rect", { x: X(pn) - 34, y: Y(pn) - 14, width: 68, height: 28, rx: 6 }));
        g.appendChild(svg("text", { x: X(pn), y: Y(pn) + 4, "class": "rotulo-nodo" },
          n.valores.join(" ")));
        g.appendChild(svg("text", { x: X(pn), y: Y(pn) + 25, "class": "num-linea" }, "línea " + (n.id + 1)));
        if (vueltos[n.id]) {
          g.appendChild(svg("text", { x: X(pn), y: Y(pn) + 42, "class": "devuelto" },
            "peso " + vueltos[n.id].peso + (vueltos[n.id].equilibrio ? ", sí" : ", no")));
        }
        dibujo.appendChild(g);
      });
      if (actual !== null && lay.pos["n" + actual.nodo]) {
        var marco = dibujo.parentNode;
        marco.scrollLeft = X(lay.pos["n" + actual.nodo]) - marco.clientWidth / 2;
      } else if (lay.pos.n0) {
        dibujo.parentNode.scrollLeft = X(lay.pos.n0) - dibujo.parentNode.clientWidth / 2;
      }
    }

    function textoFase(f) {
      var t = { lee: "lee su línea", izq: "espera el submóvil izquierdo",
                der: "espera el submóvil derecho", devuelve: "devuelve" };
      return t[f];
    }

    function pintarPila() {
      var caja = document.getElementById("pila");
      caja.innerHTML = "";
      var paso = estado.k < estado.res.pasos.length ? estado.res.pasos[estado.k] : null;
      var pila = paso !== null ? paso.pila : [];
      if (pila.length === 0) {
        var vacia = document.createElement("div");
        vacia.className = "nota";
        vacia.textContent = "Pila vacía: la primera llamada ya devolvió.";
        caja.appendChild(vacia);
      }
      pila.slice().reverse().forEach(function (m, i) {
        var n = estado.res.nodos[m.nodo];
        var d = document.createElement("div");
        d.className = "marco" + (i === 0 ? " tope" : "");
        d.innerHTML = "<b>movil()</b> línea " + (m.nodo + 1) + ": <code>" +
          n.valores.join(" ") + "</code><br><span>" + textoFase(m.fase) + "</span>";
        caja.appendChild(d);
      });
      document.getElementById("profundidad").textContent = pila.length;
    }

    function pintarTraza() {
      var cuerpo = document.getElementById("traza");
      cuerpo.innerHTML = "";
      var m;
      for (m = 0; m < estado.k; m = m + 1) {
        var p = estado.res.pasos[m];
        if (p.tipo === "volver") {
          var fila = document.createElement("tr");
          [p.nodo + 1, estado.res.nodos[p.nodo].valores.join(" "),
           p.wl + " · " + p.dl + " = " + (p.wl * p.dl),
           p.wr + " · " + p.dr + " = " + (p.wr * p.dr),
           p.peso, p.equilibrio ? "sí" : "no"].forEach(function (x) {
            var td = document.createElement("td");
            td.textContent = x;
            fila.appendChild(td);
          });
          cuerpo.appendChild(fila);
        }
      }
    }

    function pintar() {
      var res = estado.res;
      var paso = estado.k < res.pasos.length ? res.pasos[estado.k] : null;
      var pregunta = document.getElementById("pregunta");
      var zonaLeer = document.getElementById("zona-leer");
      var zonaVolver = document.getElementById("zona-volver");
      var aviso = document.getElementById("aviso-tarde");
      marcarCodigo(paso);
      pintarArbol();
      pintarPila();
      pintarTraza();
      document.getElementById("progreso").textContent =
        "Paso " + Math.min(estado.k + 1, res.pasos.length) + " de " + res.pasos.length;
      aviso.style.display = "none";
      if (paso === null) {
        zonaLeer.style.display = "none";
        zonaVolver.style.display = "none";
        pregunta.innerHTML = "La primera llamada devolvió peso <b>" + res.peso +
          "</b> y el juez espera <b>" + (res.equilibrio ? "YES" : "NO") + "</b>.";
        document.getElementById("carta-cierre").style.display = "block";
        document.getElementById("dato-llamadas").textContent = res.llamadas;
        document.getElementById("dato-lineas").textContent = estado.lineas.length;
        document.getElementById("dato-pasos").textContent = res.pasos.length;
      } else if (paso.tipo === "leer") {
        zonaLeer.style.display = "flex";
        zonaVolver.style.display = "none";
        pregunta.innerHTML = "Llamada en la profundidad " + (paso.prof + 1) +
          ": la línea " + (paso.nodo + 1) + " es <code>" + paso.valores.join(" ") +
          "</code> (Wl Dl Wr Dr). ¿Qué hace la función con ella?";
        if (paso.yaSeSabe) {
          aviso.style.display = "block";
        }
      } else {
        zonaLeer.style.display = "none";
        zonaVolver.style.display = "flex";
        var n = res.nodos[paso.nodo];
        pregunta.innerHTML = "Vuelve la llamada de la línea " + (paso.nodo + 1) +
          " (<code>" + n.valores.join(" ") + "</code>)" +
          (n.valores[0] === 0 || n.valores[2] === 0
            ? ", ya con los pesos de sus submóviles" : "") +
          ". ¿Qué peso devuelve y está en equilibrio?";
      }
    }

    function veredicto(clase, texto) {
      var v = document.getElementById("veredicto");
      v.className = "veredicto " + clase;
      v.textContent = texto;
    }

    function explicar(paso) {
      var t = "";
      if (paso.tipo === "leer") {
        t = "Es " + CASOS[paso.caso] + ".";
      } else {
        t = "Devuelve " + paso.wl + " + " + paso.wr + " = " + paso.peso + ". " +
          "Wl·Dl = " + (paso.wl * paso.dl) + " y Wr·Dr = " + (paso.wr * paso.dr) +
          (paso.local ? ": la barra se equilibra" : ": la barra no se equilibra") +
          (paso.eqIzq && paso.eqDer ? "" : ", y además un submóvil devolvió no") +
          ", así que el submóvil " + (paso.equilibrio ? "sí" : "no") + " está en equilibrio.";
      }
      return t;
    }

    function avanzar() {
      estado.k = estado.k + 1;
      document.getElementById("peso").value = "";
      document.getElementById("eq-si").checked = false;
      document.getElementById("eq-no").checked = false;
      pintar();
    }

    function responderCaso(caso) {
      var paso = estado.res.pasos[estado.k];
      if (paso !== undefined && paso.tipo === "leer") {
        if (caso === paso.caso) {
          veredicto("bien", "Correcto. " + explicar(paso));
          avanzar();
        } else if (paso.caso === "base") {
          veredicto("mal", "Mire los pesos Wl y Wr, el primero y el tercero: ninguno es 0, así que en los dos extremos cuelga un objeto.");
        } else {
          veredicto("mal", "Un peso 0 en Wl (el primero) o en Wr (el tercero) dice que de ese extremo cuelga un submóvil, y la función lo lee con otra llamada.");
        }
      }
    }

    function comprobarVuelta() {
      var paso = estado.res.pasos[estado.k];
      var w = parseInt(document.getElementById("peso").value, 10);
      var si = document.getElementById("eq-si").checked;
      var no = document.getElementById("eq-no").checked;
      if (paso !== undefined && paso.tipo === "volver") {
        if (isNaN(w) || (!si && !no)) {
          veredicto("mal", "Escriba el peso y marque si está en equilibrio.");
        } else if (w !== paso.peso) {
          veredicto("mal", "El peso no es " + w + ". Es la suma de lo que cuelga de los dos extremos; si un extremo era un submóvil, cuenta el peso que devolvió su llamada, no el 0 de la línea.");
        } else if (si !== paso.equilibrio) {
          veredicto("mal", "El peso está bien. Para el equilibrio compare Wl·Dl con Wr·Dr usando esos pesos, y recuerde que también deben estar en equilibrio los submóviles que cuelgan.");
        } else {
          veredicto("bien", "Correcto. " + explicar(paso));
          avanzar();
        }
      }
    }

    function revelar() {
      var paso = estado.res.pasos[estado.k];
      if (paso !== undefined) {
        veredicto("mal", explicar(paso));
        avanzar();
      }
    }

    function completar() {
      estado.k = estado.res.pasos.length;
      document.getElementById("veredicto").className = "veredicto";
      pintar();
    }

    function cargar(texto) {
      var r = EJERCICIO.leer(texto);
      var v = document.getElementById("error-entrada");
      var s = r.error ? null : EJERCICIO.simular(r.lineas);
      if (r.error || s.error) {
        v.className = "veredicto mal";
        v.textContent = r.error ? r.error : s.error;
      } else {
        v.className = "veredicto";
        estado.lineas = r.lineas;
        estado.res = s;
        estado.k = 0;
        document.getElementById("veredicto").className = "veredicto";
        document.getElementById("carta-cierre").style.display = "none";
        pintar();
      }
    }

    pintarCodigo();
    Object.keys(CASOS).forEach(function (c) {
      var b = document.createElement("button");
      b.textContent = CASOS[c];
      b.addEventListener("click", function () { responderCaso(c); });
      document.getElementById("opciones-caso").appendChild(b);
    });
    document.getElementById("btn-muestra").addEventListener("click", function () {
      document.getElementById("entrada").value = EJERCICIO.muestra;
      cargar(EJERCICIO.muestra);
    });
    document.getElementById("btn-azar").addEventListener("click", function () {
      var t = EJERCICIO.aTexto(EJERCICIO.generar(Math.random, 4));
      document.getElementById("entrada").value = t;
      cargar(t);
    });
    document.getElementById("btn-usar").addEventListener("click", function () {
      cargar(document.getElementById("entrada").value);
    });
    document.getElementById("btn-comprobar").addEventListener("click", comprobarVuelta);
    document.getElementById("btn-revelar").addEventListener("click", revelar);
    document.getElementById("btn-revelar-caso").addEventListener("click", revelar);
    document.getElementById("btn-completar").addEventListener("click", completar);
    document.getElementById("btn-reinicio").addEventListener("click", function () {
      cargar(document.getElementById("entrada").value);
    });

    document.getElementById("entrada").value = EJERCICIO.muestra;
    cargar(EJERCICIO.muestra);
  })();
}
