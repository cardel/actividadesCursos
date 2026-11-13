if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Dos replicas que divergen y vuelven a juntarse. Cada replica lleva un vector
   con una casilla por replica, solo incrementa la suya, el total es la suma de
   las casillas y la fusion toma el maximo casilla por casilla. La version
   ingenua guarda un solo entero por replica y fusiona quedandose con el mayor;
   corrida con la misma secuencia, pierde incrementos.                        */

var REPLICAS = ["A", "B"];

var ROTULOS = {
  A: "Incremento en A",
  B: "Incremento en B",
  partir: "Se parte la red",
  sanar: "Se sana la red",
  fusionar: "Fusión de las dos"
};

/* La secuencia con la que se compara el vector contra el entero suelto. */
var SECUENCIA_DEMO = ["partir", "A", "A", "B", "A", "B", "sanar", "fusionar"];

/* ---------- una casilla por replica ---------- */

function crear() {
  return { vectores: { A: [0, 0], B: [0, 0] }, partida: false, ops: [] };
}

function indiceDe(nombre) { return REPLICAS.indexOf(nombre); }

/* Una replica solo escribe su propia casilla, y solo la hace crecer. */
function incrementar(vector, i) {
  var copia = vector.slice();
  copia[i] += 1;
  return copia;
}

function total(vector) {
  return vector.reduce(function (s, v) { return s + v; }, 0);
}

/* El maximo casilla por casilla: ninguna casilla baja, y la que trae el valor
   mas alto es siempre la de su duena, que es la unica que la escribe.        */
function fusionar(x, y) {
  return x.map(function (v, i) { return Math.max(v, y[i]); });
}

function iguales(x, y) {
  return x.length === y.length && x.every(function (v, i) { return v === y[i]; });
}

function convergieron(estado) {
  return iguales(estado.vectores.A, estado.vectores.B);
}

/* Una operacion sobre el estado, sin tocar el que entra. Con la red sana todo
   incremento se propaga de inmediato; con la red partida se queda en casa.   */
function paso(estado, op) {
  var vectores = { A: estado.vectores.A.slice(), B: estado.vectores.B.slice() };
  var partida = estado.partida;
  if (op === "partir") {
    partida = true;
  } else if (op === "sanar") {
    partida = false;
  } else if (op === "fusionar") {
    if (!partida) {
      var m = fusionar(vectores.A, vectores.B);
      vectores.A = m.slice();
      vectores.B = m.slice();
    }
  } else if (indiceDe(op) >= 0) {
    vectores[op] = incrementar(vectores[op], indiceDe(op));
    if (!partida) {
      var f = fusionar(vectores.A, vectores.B);
      vectores.A = f.slice();
      vectores.B = f.slice();
    }
  }
  return { vectores: vectores, partida: partida, ops: estado.ops.concat([op]) };
}

function correr(secuencia) {
  return secuencia.reduce(function (e, op) { return paso(e, op); }, crear());
}

function incrementosDe(secuencia) {
  return secuencia.filter(function (op) { return indiceDe(op) >= 0; }).length;
}

/* ---------- un solo entero por replica ---------- */

function crearIngenuo() { return { A: 0, B: 0, partida: false }; }

function pasoIngenuo(estado, op) {
  var e = { A: estado.A, B: estado.B, partida: estado.partida };
  if (op === "partir") {
    e.partida = true;
  } else if (op === "sanar") {
    e.partida = false;
  } else if (op === "fusionar") {
    if (!e.partida) {
      var m = Math.max(e.A, e.B);
      e.A = m;
      e.B = m;
    }
  } else if (indiceDe(op) >= 0) {
    e[op] += 1;
    if (!e.partida) {
      var f = Math.max(e.A, e.B);
      e.A = f;
      e.B = f;
    }
  }
  return e;
}

function correrIngenuo(secuencia) {
  return secuencia.reduce(pasoIngenuo, crearIngenuo());
}

function totalIngenuo(estado) { return Math.max(estado.A, estado.B); }

/* Incrementos que la version de un solo entero deja por el camino. */
function perdidos(secuencia) {
  return incrementosDe(secuencia) - totalIngenuo(correrIngenuo(secuencia));
}

/* La corrida paso a paso de los dos modelos sobre la misma secuencia. */
function filasCorrida(secuencia) {
  var vec = crear();
  var ing = crearIngenuo();
  return secuencia.map(function (op) {
    vec = paso(vec, op);
    ing = pasoIngenuo(ing, op);
    return {
      op: op,
      rotulo: ROTULOS[op],
      a: vec.vectores.A.slice(),
      b: vec.vectores.B.slice(),
      totalA: total(vec.vectores.A),
      totalB: total(vec.vectores.B),
      ingA: ing.A,
      ingB: ing.B
    };
  });
}

/* ---------- veredictos ---------- */

var RAZONES_MAXIMO = {
  correcta: "Es la razón. Cada casilla solo crece y solo la escribe su dueña, " +
    "así que entre dos valores de la misma casilla el mayor es el más " +
    "completo y el menor es una copia atrasada de ese mismo trabajo. El " +
    "máximo nunca descarta trabajo ajeno porque nunca compara trabajo de dos " +
    "réplicas distintas: compara dos vistas de la misma.",
  acuerdo: "No hay acuerdo que negociar. Las réplicas no se consultan antes de " +
    "incrementar ni al fusionar; cada una aplica el máximo con lo que tenga a " +
    "mano y llega al mismo vector que la otra. Si hiciera falta ponerse de " +
    "acuerdo, una partición dejaría el contador quieto.",
  reciente: "El tiempo no entra en la cuenta. No hay reloj común que diga cuál " +
    "de los dos valores llegó después, y tampoco hace falta: el mayor de una " +
    "casilla incluye todos los incrementos del menor, sin importar en qué " +
    "orden ocurrieron.",
  orden: "El orden no interviene. El máximo da lo mismo tomando A contra B o B " +
    "contra A, y repetir la fusión no mueve el resultado. Eso es justo lo que " +
    "permite fusionar cuando se pueda y las veces que se pueda.",
  unica: "Las dos escriben al mismo tiempo, y ahí está el problema que se " +
    "resuelve. Lo que es de una sola dueña es la casilla, no el vector: A " +
    "escribe la primera y B la segunda, y cada una lee las dos."
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    REPLICAS: REPLICAS, ROTULOS: ROTULOS, SECUENCIA_DEMO: SECUENCIA_DEMO,
    crear: crear, indiceDe: indiceDe, incrementar: incrementar, total: total,
    fusionar: fusionar, iguales: iguales, convergieron: convergieron,
    paso: paso, correr: correr, incrementosDe: incrementosDe,
    crearIngenuo: crearIngenuo, pasoIngenuo: pasoIngenuo,
    correrIngenuo: correrIngenuo, totalIngenuo: totalIngenuo,
    perdidos: perdidos, filasCorrida: filasCorrida,
    RAZONES_MAXIMO: RAZONES_MAXIMO
  };
}

if (typeof document !== "undefined") (function () {
  var num = Motor.num;
  var estado = crear();
  var fusionado = false;

  /* ---- Carta 1: las dos replicas ---- */

  function vectorHtml(v, resaltar) {
    return v.map(function (x, i) {
      var clase = "caja" + (i === resaltar ? " actual" : "");
      return "<span class=\"" + clase + "\"><span class=\"indice\">" +
        REPLICAS[i] + "</span>" + num(x) + "</span>";
    }).join("");
  }

  function pintarEstado() {
    document.getElementById("cuerpo-replicas").innerHTML =
      REPLICAS.map(function (r) {
        return "<tr><td><b>Réplica " + r + "</b></td><td>" +
          "<span class=\"arreglo fila-arreglo\" style=\"display:inline-flex\">" +
          vectorHtml(estado.vectores[r], indiceDe(r)) + "</span></td><td>" +
          num(total(estado.vectores[r])) + "</td></tr>";
      }).join("");

    document.getElementById("red").innerHTML = "<span class=\"ficha\">A</span>" +
      "<span class=\"flecha\">" + (estado.partida ? "✕ red partida ✕" : "↔") +
      "</span><span class=\"ficha\">B</span>";

    var hechas = estado.ops.map(function (op) {
      return "<span class=\"ficha" + (op === "partir" ? " tachada" : "") + "\">" +
        ROTULOS[op] + "</span>";
    });
    document.getElementById("historial").innerHTML = hechas.length
      ? hechas.join("<span class=\"flecha\">→</span>")
      : "<span class=\"ficha tachada\">todavía sin operaciones</span>";

    Motor.pintarChips("marcador-replicas", [
      { texto: "incrementos aplicados",
        valor: num(incrementosDe(estado.ops)), cuenta: true },
      { texto: "red", valor: estado.partida ? "partida" : "sana" },
      { texto: "vectores", valor: convergieron(estado) ? "iguales" : "distintos" }
    ]);

    document.getElementById("btn-partir").disabled = estado.partida;
    document.getElementById("btn-sanar").disabled = !estado.partida;
  }

  function aplicar(op) {
    estado = paso(estado, op);
    if (op !== "fusionar") { fusionado = false; opTotal.refrescar(); }
    pintarEstado();
    pintarFusion();
  }

  ["A", "B", "partir", "sanar"].forEach(function (op) {
    document.getElementById("btn-" + op.toLowerCase())
      .addEventListener("click", function () { aplicar(op); });
  });

  document.getElementById("btn-reiniciar").addEventListener("click", function () {
    estado = crear();
    fusionado = false;
    opTotal.refrescar();
    pintarEstado();
    pintarFusion();
  });

  /* ---- Carta 2: predecir el total y destapar la fusion ---- */

  function totalFusionado() {
    return total(fusionar(estado.vectores.A, estado.vectores.B));
  }

  var opTotal = Motor.opcionesNumericas("op-total", "ver-total", function () {
    var A = estado.vectores.A, B = estado.vectores.B;
    var m = fusionar(A, B);
    var real = totalFusionado();
    var detalle = "La fusión deja [" + m.map(function (x) { return num(x); })
      .join("; ") + "], y " + m.map(function (x) { return num(x); }).join(" + ") +
      " = " + num(real) + ".";
    var lista = [
      { valor: real, clave: "correcta",
        razon: "Ese es el total: " + num(real) + ". " + detalle +
          " Cada casilla guarda los incrementos de su dueña, así que la suma " +
          "cuenta todo lo que se incrementó en las dos." },
      { valor: Math.max(total(A), total(B)), clave: "mayor-total",
        razon: "Eso es el mayor de los dos totales, y es la versión ingenua. " + detalle +
          " El total no se queda con una réplica: suma las casillas del vector fusionado." },
      { valor: total(A) + total(B), clave: "suma-totales",
        razon: "Eso suma los dos totales, y cuenta dos veces lo que las dos réplicas ya " +
          "comparten. " + detalle + " Se suma una casilla por réplica, después del máximo." },
      { valor: Math.max.apply(null, m), clave: "casilla",
        razon: "Eso es la casilla más grande del vector fusionado. " + detalle +
          " El total es la suma de todas, no la mayor." }
    ];
    var distintos = {};
    lista = lista.filter(function (o) {
      var ya = distintos[o.valor];
      distintos[o.valor] = true;
      return !ya;
    });
    /* con pocos incrementos casi todas las cuentas dan lo mismo: se completa
       con valores cercanos, sin repetir ninguno */
    var extra = 1;
    while (lista.length < 3) {
      if (!distintos[real + extra]) {
        distintos[real + extra] = true;
        lista.push({ valor: real + extra, clave: "de-mas-" + extra,
          razon: "Eso cuenta " + num(extra) + (extra === 1 ? " incremento" : " incrementos") +
            " que ninguna casilla guarda. " + detalle +
            " El total es la suma de las casillas del vector fusionado." });
      }
      extra += 1;
    }
    return lista;
  });

  function pintarFusion() {
    var caja = document.getElementById("detalle-fusion");
    if (!fusionado) {
      caja.innerHTML = "<span class=\"ficha tachada\">la fusión está tapada</span>";
      return;
    }
    var m = estado.vectores.A;
    caja.innerHTML = "<span class=\"arreglo fila-arreglo\" style=\"display:inline-flex\">" + vectorHtml(m, -1) +
      "</span> <b>total " + num(total(m)) + "</b>";
  }

  document.getElementById("btn-fusionar").addEventListener("click", function () {
    var caja = document.getElementById("ver-fusion");
    if (estado.partida) {
      caja.className = "veredicto mal";
      caja.textContent = "Con la red partida las réplicas no se hablan y no " +
        "hay fusión que aplicar. Sane la red y vuelva a intentarlo.";
      return;
    }
    aplicar("fusionar");
    fusionado = true;
    pintarFusion();
    caja.className = "veredicto bien";
    caja.textContent = "Las dos quedaron en el mismo vector, con total " +
      num(total(estado.vectores.A)) + ". Ninguna réplica preguntó nada a la " +
      "otra antes de incrementar, y aun así coinciden.";
  });

  /* ---- Carta 3: un solo entero por replica ---- */

  var filas = filasCorrida(SECUENCIA_DEMO);
  var destapado = false;

  function pintarCorrida() {
    document.getElementById("cuerpo-corrida").innerHTML =
      filas.map(function (f, i) {
        var ultima = i === filas.length - 1;
        var tapar = ultima && !destapado;
        var celda = function (texto) {
          return tapar ? "<td class=\"pend\">?</td>" : "<td>" + texto + "</td>";
        };
        var vec = function (v) {
          return "[" + v.map(function (x) { return num(x); }).join("; ") + "]";
        };
        return "<tr" + (ultima ? " style=\"background:var(--ambar-suave)\"" : "") +
          "><td style=\"text-align:left\">" + f.rotulo + "</td>" +
          celda("<code>" + vec(f.a) + "</code>") +
          celda("<code>" + vec(f.b) + "</code>") +
          celda(f.totalA === f.totalB
            ? num(f.totalA) : num(f.totalA) + " y " + num(f.totalB)) +
          celda(num(f.ingA) + " y " + num(f.ingB)) + "</tr>";
      }).join("");
  }

  Motor.opcionesNumericas("op-perdidos", "ver-perdidos", function () {
    var real = perdidos(SECUENCIA_DEMO);
    var ing = correrIngenuo(SECUENCIA_DEMO);
    var hechos = incrementosDe(SECUENCIA_DEMO);
    var base = "Se incrementó " + num(hechos) +
      " veces, " + num(filas[filas.length - 1].a[0]) + " en A y " +
      num(filas[filas.length - 1].b[1]) + " en B. Con un entero suelto, A " +
      "llegó a " + num(ing.A) + " y B a " + num(ing.B) + "; el mayor es " +
      num(totalIngenuo(ing)) + " y los otros " + num(real) + " incrementos " +
      "quedaron tapados por ese máximo.";
    var lista = [
      { valor: real, clave: "correcta", razon: "Son " + num(real) + ". " + base },
      { valor: 0, clave: "ninguno",
        razon: "Sí pierde. Las dos réplicas terminan con el mismo número, y por eso parece que " +
          "convergió, pero ese número cuenta " + num(totalIngenuo(ing)) + " de los " +
          num(hechos) + " incrementos." },
      { valor: totalIngenuo(ing), clave: "conservados",
        razon: "Esos son los incrementos que sobreviven, " + num(totalIngenuo(ing)) +
          ", no los que se pierden. La pregunta es por la diferencia con los " + num(hechos) +
          " que se hicieron." },
      { valor: hechos, clave: "todos",
        razon: "Perder los " + num(hechos) + " sería no conservar nada, y el entero suelto " +
          "conserva el del lado mayor. Pierde solo los del otro lado." }
    ];
    var vistos = {};
    return lista.filter(function (o) {
      var ya = vistos[o.valor];
      vistos[o.valor] = true;
      return !ya;
    });
  });

  document.getElementById("op-perdidos").addEventListener("click", function () {
    destapado = true;
    pintarCorrida();
    Motor.pintarChips("marcador-corrida", [
      { texto: "incrementos", valor: num(incrementosDe(SECUENCIA_DEMO)) },
      { texto: "total con una casilla por réplica",
        valor: num(total(correr(SECUENCIA_DEMO).vectores.A)), cuenta: true },
      { texto: "total con un entero suelto",
        valor: num(totalIngenuo(correrIngenuo(SECUENCIA_DEMO))) },
      { texto: "perdidos", valor: num(perdidos(SECUENCIA_DEMO)) }
    ]);
    document.getElementById("nota-corrida").hidden = false;
  });

  /* ---- Carta 4: por que converge sin coordinarse ---- */

  Motor.conectarOpciones("op-maximo", "ver-maximo", RAZONES_MAXIMO);

  pintarEstado();
  pintarFusion();
  pintarCorrida();
})();
