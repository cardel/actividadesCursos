/* Ejercicio interactivo: el BFS de 321-new-villa.cpp (UVa 321, The New Villa),
   funcion solve, linea por linea y con la numeracion de linea del archivo.
   Un estado es (pos, light); light es una mascara con la luz i en el bit i-1. */
var LIB = (typeof module !== "undefined") ? require("./lib.js") : VILLA;

var EJERCICIO = (function () {
  var CPP = [
 "void solve(int r, int s, int d, int caso){",
 "  int i, obj = 1 << r - 1;",
 "  queue<state> q;",
 "  state est(1, 1), curr, res;",
 "  bool flag = false;",
 "  dist[est] = 0;",
 "  q.push(est);",
 "",
 "  while(!flag && !q.empty()){",
 "    curr = q.front();",
 "    q.pop();",
 "",
 "    if(curr.pos == r && obj == curr.light){",
 "      res = curr;",
 "      flag = true;",
 "    }",
 "    else{",
 "      // verificar posibilidades de desplazarse a otra habitación",
 "      for(i = 1; i <= r; i++){",
 "  // se verifica que haya un pasillo hacía la habitación i y que la luz en esa roomitación esté",
 "  // encendida",
 "  if(roomAdj[curr.pos][i] && (curr.light & (1 << i - 1)) != 0){",
 "    est = state(i, curr.light, curr.steps);",
 "    est.steps.push_back(step(\"move\", i));",
 "",
 "    if(dist.find(est) == dist.end()){",
 "      q.push(est);",
 "      dist[est] = dist[curr] + 1;",
 "    }",
 "  }",
 "      }",
 "",
 "      // verificar posibilidades de encender o apagar una luz en otra habitación",
 "      for(i = 1; i <= r; i++){",
 "  // se verifica que haya un switch que permita encencer la luz de la habitación i",
 "  // y que no sea la misma habitación en la que se está ubicado",
 "  if(lightAdj[curr.pos][i] && i != curr.pos){",
 "    est = state(curr.pos, (curr.light ^ (1 << i - 1)), curr.steps);",
 "    est.steps.push_back(step((est.light > curr.light) ? \"on\" : \"off\", i));",
 "",
 "    if(dist.find(est) == dist.end()){",
 "      q.push(est);",
 "      dist[est] = dist[curr] + 1;",
 "    }",
 "  }",
 "      }",
 "    }",
 "  }",
 "",
 "  printf(\"Villa #%d\\n\", caso);",
 "",
 "  if(flag){",
 "    printf(\"The problem can be solved in %d steps:\\n\", dist[res]);",
 "    for(vector<step>::iterator itAux = res.steps.begin(); itAux != res.steps.end(); itAux++){",
 "      if(itAux->desc == \"on\")",
 "  printf(\"- Switch on light in room %d.\\n\", itAux->room);",
 "      else if(itAux->desc == \"off\")",
 "  printf(\"- Switch off light in room %d.\\n\", itAux->room);",
 "      else",
 "  printf(\"- Move to room %d.\\n\", itAux->room);",
 "    }",
 "  }",
 "  else",
 "    printf(\"The problem cannot be solved.\\n\");",
 "  printf(\"\\n\");",
 "}"
];
  var DESDE = 63;
  var CONTABLES = [64, 65, 66, 67, 68, 69, 71, 72, 73, 75, 76, 77, 81, 84, 85, 86, 88, 89, 90, 96, 99, 100, 101, 103, 104, 105,
                   112, 114, 115, 116, 117, 118, 119, 120, 122, 126, 127];
  var BANDAS = [[64, 69, 1], [71, 110, 2], [112, 127, 3]];

  function armarCodigo() {
    var codigo = [], k = 0;
    while (k < CPP.length) {
      var n = DESDE + k, e = { txt: CPP[k], num: CONTABLES.indexOf(n) >= 0 ? n : null }, b = 0;
      while (b < BANDAS.length) { if (n >= BANDAS[b][0] && n <= BANDAS[b][1]) { e.bloque = BANDAS[b][2]; } b = b + 1; }
      codigo.push(e);
      k = k + 1;
    }
    return codigo;
  }
  var CODIGO = armarCodigo();

  var VILLAS = [
    { boton: "Dos puertas desde la 1",
      texto: "Tres habitaciones. Las puertas salen de la 1 hacia la 2 y hacia la 3. Se empieza en la 1 con solo su luz prendida y se quiere terminar en la 3 con solo su luz prendida.",
      r: 3, puertas: [[1, 2], [1, 3]], interruptores: [[1, 2], [2, 3], [3, 1]] },
    { boton: "En fila, sin solución",
      texto: "Tres habitaciones en fila: puertas 1-2 y 2-3. Los interruptores de la 1 cambian la 2 y la 3, y el de la 3 cambia la 1. Desde la 2 no se puede cambiar ninguna luz.",
      r: 3, puertas: [[1, 2], [2, 3]], interruptores: [[1, 2], [1, 3], [3, 1]] },
    { boton: "En fila, con solución",
      texto: "Tres habitaciones en fila: puertas 1-2 y 2-3. Desde la 1 se cambian la 2 y la 3; desde la 3 se cambian la 1 y la 2.",
      r: 3, puertas: [[1, 2], [2, 3]], interruptores: [[1, 2], [1, 3], [3, 1], [3, 2]] }
  ];
  VILLAS.forEach(function (v) { v.V = LIB.crear(v); });

  function clonar(x) { return Array.isArray(x) ? x.map(clonar) : x; }
  function etq(e, r) { return e ? LIB.etiqueta(e.pos, e.light, r) : null; }
  function txtPasos(steps) {
    return steps.map(function (s) { return s.desc + " " + s.room; }).join(", ");
  }

  function simular(villa) {
    var V = villa.V, r = V.r, pasos = [], log = [];
    var E = { obj: null, curr: null, i: null, est: null, q: [], estados: [], dist: [], flag: false, res: null,
              luzCurr: null, salida: "", it: null };
    var cola = [], dist = {}, ids = {}, tabla = [];

    function mascaraTxt(l) { return l === null ? null : l + " = " + LIB.bin(l, r); }
    function snap(linea, extra) {
      var q = { linea: linea }, k;
      E.q = cola.map(function (s) { return etq(s, r); });
      E.estados = tabla.map(function (s) { return { txt: etq(s, r), luz: s.light, d: dist[LIB.clave(s.pos, s.light)], pasos: txtPasos(s.steps) }; });
      for (k in E) { q[k] = clonar(E[k]); }
      if (extra) { for (k in extra) { q[k] = extra[k]; } }
      pasos.push(q);
    }
    function nuevoEstado(p, l, st) { return { pos: p, light: l, steps: st.slice() }; }

    var i, obj, est, curr = null, res = null, flag = false, salida = "";
    snap(63);
    obj = 1 << (r - 1); E.obj = mascaraTxt(obj); snap(64);
    snap(65);
    est = nuevoEstado(1, 1, []); E.est = etq(est, r); snap(66);
    snap(67);
    dist[LIB.clave(1, 1)] = 0; tabla.push(est); snap(68);
    cola.push(est); snap(69);

    while (true) {
      snap(71);
      if (flag || cola.length === 0) { break; }
      curr = cola.shift(); E.curr = etq(curr, r); E.luzCurr = mascaraTxt(curr.light); E.i = null;
      snap(72, { ev: { tipo: "pop", pos: curr.pos, luz: curr.light } });
      snap(73);
      snap(75);
      if (curr.pos === r && obj === curr.light) {
        res = curr; E.res = etq(res, r); snap(76);
        flag = true; E.flag = true; snap(77);
      } else {
        for (i = 1; i <= r; i++) {
          E.i = i; snap(81);
          snap(84);
          if (V.puerta[curr.pos][i] && (curr.light & (1 << (i - 1))) !== 0) {
            est = nuevoEstado(i, curr.light, curr.steps); E.est = etq(est, r); snap(85);
            est.steps.push({ desc: "move", room: i }); snap(86);
            snap(88);
            if (dist[LIB.clave(est.pos, est.light)] === undefined) {
              cola.push(est); snap(89);
              dist[LIB.clave(est.pos, est.light)] = dist[LIB.clave(curr.pos, curr.light)] + 1; tabla.push(est);
              snap(90, { ev: { tipo: "push", pos: est.pos, luz: est.light, d: dist[LIB.clave(est.pos, est.light)] } });
            }
          }
        }
        for (i = 1; i <= r; i++) {
          E.i = i; snap(96);
          snap(99);
          if (V.inter[curr.pos][i] && i !== curr.pos) {
            est = nuevoEstado(curr.pos, curr.light ^ (1 << (i - 1)), curr.steps); E.est = etq(est, r); snap(100);
            est.steps.push({ desc: est.light > curr.light ? "on" : "off", room: i }); snap(101);
            snap(103);
            if (dist[LIB.clave(est.pos, est.light)] === undefined) {
              cola.push(est); snap(104);
              dist[LIB.clave(est.pos, est.light)] = dist[LIB.clave(curr.pos, curr.light)] + 1; tabla.push(est);
              snap(105, { ev: { tipo: "push", pos: est.pos, luz: est.light, d: dist[LIB.clave(est.pos, est.light)] } });
            }
          }
        }
        E.i = null;
      }
    }

    salida = "Villa #1\n"; E.salida = salida; snap(112);
    snap(114);
    var pasosTxt = [];
    if (flag) {
      salida += "The problem can be solved in " + dist[LIB.clave(res.pos, res.light)] + " steps:\n"; E.salida = salida; snap(115);
      var k;
      for (k = 0; k < res.steps.length; k++) {
        var s = res.steps[k]; E.it = k;
        snap(116);
        snap(117);
        if (s.desc === "on") { salida += "- Switch on light in room " + s.room + ".\n"; E.salida = salida; snap(118); }
        else {
          snap(119);
          if (s.desc === "off") { salida += "- Switch off light in room " + s.room + ".\n"; E.salida = salida; snap(120); }
          else { salida += "- Move to room " + s.room + ".\n"; E.salida = salida; snap(122); }
        }
      }
      E.it = null;
    } else {
      salida += "The problem cannot be solved.\n"; E.salida = salida; snap(126);
    }
    salida += "\n"; E.salida = salida; snap(127);
    var ultimo = pasos[pasos.length - 1];
    ultimo.resultado = {
      hay: flag, texto: salida, descubiertos: tabla.length, popped: 0,
      pasos: flag ? res.steps.map(function (st) { return LIB.texto({ desc: st.desc, room: st.room }); }) : [],
      distMeta: flag ? dist[LIB.clave(res.pos, res.light)] : null
    };
    ultimo.eventos = pasos.filter(function (p) { return p.ev; }).map(function (p) { return p.ev; });
    return pasos;
  }

  function resumen(villa) { return simular(villa).pop().resultado; }

  function entradaDe(v) {
    var s = v.r + " " + v.puertas.length + " " + v.interruptores.length + "\n";
    v.puertas.forEach(function (d) { s += d[0] + " " + d[1] + "\n"; });
    v.interruptores.forEach(function (w) { s += w[0] + " " + w[1] + "\n"; });
    return s + "0 0 0\n";
  }

  function evaluar(valor, v) {
    var r = resumen(v), total = v.r * Math.pow(2, v.r), res;
    if (valor === r.descubiertos) {
      res = { ok: true, msg: "Correcto: " + r.descubiertos + " estados en dist al terminar. " +
        (r.hay ? "La búsqueda se detiene al sacar la meta de la cola (flag), así que no llega a explorar todo lo alcanzable: quedan estados descubiertos sin expandir."
               : "Como no hay solución, el ciclo se agota solo cuando la cola queda vacía, y dist guarda todos los estados alcanzables.") };
    } else if (valor > total) {
      res = { ok: false, msg: "Hay " + v.r + " habitaciones y cada luz está prendida o apagada: el total posible es " + v.r + " · 2^" + v.r + " = " + total + ", y no se puede pasar de ahí." };
    } else if (valor < 1) {
      res = { ok: false, msg: "Como mínimo está el estado inicial, que se guarda en dist antes del ciclo." };
    } else if (valor < r.descubiertos) {
      res = { ok: false, msg: "Se descubren más. Cada puerta con la luz del destino prendida y cada interruptor ajeno producen un estado que no estaba en dist." };
    } else {
      res = { ok: false, msg: "Se descubren menos. Algunas combinaciones exigen entrar a una habitación a oscuras o apagar la luz propia, y esas nunca entran a dist." };
    }
    return res;
  }

  return { codigo: CODIGO, villas: VILLAS, simular: simular, resumen: resumen, evaluar: evaluar, entradaDe: entradaDe };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var presetActual = 0;
    function v() { return EJERCICIO.villas[presetActual]; }
    function el(id) { return document.getElementById(id); }

    function alPintar(e) {
      var a = e.actual, p = v(), filas = "", r = p.V.r;
      var curr = null;
      if (a && a.curr) {
        var m = /^\((\d+), \{([\d,]*)\}\)$/.exec(a.curr), luz = 0;
        if (m) { (m[2] === "" ? [] : m[2].split(",")).forEach(function (x) { luz = luz | (1 << (parseInt(x, 10) - 1)); }); curr = { pos: parseInt(m[1], 10), luz: luz }; }
      }
      el("dibujo").innerHTML = LIB.dibujar(p.V, curr ? curr.luz : null, curr ? curr.pos : null);
      el("ver-cola").textContent = a && a.q.length > 0 ? a.q.join("  ") : "[ ]";
      if (a) {
        a.estados.forEach(function (st, id) {
          var viva = a.curr === st.txt && a.linea >= 72 && a.linea <= 110 ? " class='viva'" : "";
          filas += "<tr" + viva + "><td>" + st.txt + "</td><td>" + st.luz + " = " + LIB.bin(st.luz, r) + "</td><td>" + st.d + "</td><td style='text-align:left'>" + (st.pasos || "–") + "</td></tr>";
        });
      }
      if (filas === "") { filas = "<tr><td colspan='4' class='pend'>Todavía no hay ningún estado en dist.</td></tr>"; }
      el("cuerpo-tabla").innerHTML = filas;
      el("ver-salida").textContent = a && a.salida ? a.salida : "–";
      var sec = el("secuencia");
      if (a && a.resultado) {
        var res = a.resultado;
        sec.className = res.hay ? "veredicto bien" : "veredicto mal";
        sec.innerHTML = res.hay ? "Hay " + res.descubiertos + " estados en dist al terminar. Los pasos que guarda el estado meta, en orden:<br>" + res.pasos.join("<br>")
                                : "Hay " + res.descubiertos + " estados en dist y la meta no es uno de ellos: The problem cannot be solved.";
      } else { sec.className = "veredicto"; sec.textContent = ""; }
    }

    function preparar() {
      var p = v();
      el("ver-texto").textContent = p.texto;
      el("ver-inter").textContent = p.interruptores.map(function (s) { return "en la " + s[0] + " cambia la " + s[1]; }).join("; ") + ".";
      el("prediccion").value = "";
      Motor.limpiarVeredicto();
    }

    Motor.iniciar({
      codigo: EJERCICIO.codigo, simular: EJERCICIO.simular,
      chips: [{ campo: "curr", rotulo: "curr" }, { campo: "luzCurr", rotulo: "curr.light" }, { campo: "i", rotulo: "i" }, { campo: "est", rotulo: "est" }, { campo: "obj", rotulo: "obj" }],
      paramsIniciales: v(), alPintar: alPintar
    });
    preparar();
    Motor.prediccionNumerica(function (valor) { return EJERCICIO.evaluar(valor, v()); });

    Array.prototype.forEach.call(document.querySelectorAll("#presets-grafo button"), function (btn) {
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(document.querySelectorAll("#presets-grafo button"), function (b) { b.classList.remove("primario"); });
        btn.classList.add("primario");
        presetActual = parseInt(btn.getAttribute("data-preset"), 10);
        preparar();
        Motor.reiniciar(v());
      });
    });
  })();
}
