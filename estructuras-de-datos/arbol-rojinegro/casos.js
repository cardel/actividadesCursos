/* Ejercicio interactivo: al colgar una clave roja, decidir que caso de la
   insercion de CLRS toca. El caso lo da la simulacion. */
var EJERCICIO = (function () {
  var A = typeof module !== "undefined" ? require("./arbol-rn.js") : ArbolRN;

  var ESCENARIOS = [
    { base: [40, 25, 55, 15], k: 33 },
    { base: [40, 25, 55, 15], k: 9 },
    { base: [40, 25, 55, 15], k: 20 },
    { base: [40, 25, 55, 15, 33], k: 12 },
    { base: [40, 25, 55, 63], k: 58 }
  ];

  /* Los antepasados de k, de la raiz hacia abajo, sin contar k. */
  function antepasados(r, k) {
    var res = [];
    while (r !== null && r.dato !== k) {
      res.push(r);
      r = k < r.dato ? r.izq : r.der;
    }
    return res;
  }

  /* Lo que se ve al colgar k: padre, abuelo, tio, forma y el caso. */
  function analizar(esc) {
    var sim = A.primerCaso(esc.base, esc.k);
    var colgado = sim.traza.pasos[0].arbol;
    var ant = antepasados(colgado, esc.k);
    var p = ant[ant.length - 1];
    var g = ant.length >= 2 ? ant[ant.length - 2] : null;
    var tio = null;
    var angulo = false;
    if (g !== null) {
      var pIzq = g.izq === p;
      tio = pIzq ? g.der : g.izq;
      angulo = pIzq ? esc.k > p.dato : esc.k < p.dato;
    }
    var op = sim.caso === 0 ? "nada" : "c" + sim.caso;
    return {
      sim: sim, colgado: colgado, padre: p, abuelo: g, tio: tio, angulo: angulo, op: op,
      final: A.preordenColor(sim.raiz).join(" ")
    };
  }

  function nombre(n) { return n === null ? "un NIL" : "el " + n.dato; }

  function carta(esc) {
    var a = analizar(esc);
    var p = a.padre, g = a.abuelo, t = a.tio;
    var tioRojo = t !== null && t.color === "R";
    var m = {};
    m.nada = p.color === "N" ? "Correcto. El padre " + p.dato + " es negro: un rojo nuevo no cambia ninguna cuenta de negros y no queda rojo bajo rojo." :
      "El padre " + p.dato + " es rojo y el " + esc.k + " también: se rompe la regla 4.";
    m.c1 = p.color === "N" ? "Con el padre negro no hay nada que reparar; el tío ni se mira." :
      (tioRojo ? "Correcto. El tío " + t.dato + " es rojo: el " + p.dato + " y el " + t.dato + " pasan a negro, el " + g.dato + " a rojo, y z sube al " + g.dato + "." :
       "El tío es " + nombre(t) + ", negro. Pintar el " + p.dato + " de negro le sumaría un negro solo a los caminos de su lado.");
    m.c2 = p.color === "N" ? "Con el padre negro no hay nada que reparar." :
      (tioRojo ? "Antes de mirar la forma se mira el tío, y el " + t.dato + " es rojo: basta recolorear." :
       (a.angulo ? "Correcto. El tío es " + nombre(t) + ", negro, y el " + esc.k + ", el " + p.dato + " y el " + g.dato + " quiebran en ángulo: se rota en el " + p.dato + " para ponerlos en línea y se sigue con el caso 3." :
        "El " + esc.k + ", el " + p.dato + " y el " + g.dato + " están en línea: no hace falta la primera rotación."));
    m.c3 = p.color === "N" ? "Con el padre negro no hay nada que reparar." :
      (tioRojo ? "El tío " + t.dato + " es rojo: no se rota, se recolorea." :
       (a.angulo ? "Están en ángulo. Rotar ya en el " + g.dato + " dejaría al " + esc.k + " otra vez rojo bajo rojo; primero se rota en el " + p.dato + "." :
        "Correcto. Tío " + nombre(t).replace("un ", "") + " negro y los tres en línea: el " + p.dato + " pasa a negro, el " + g.dato + " a rojo y se rota en el " + g.dato + ". Termina."));
    return {
      tipo: "opciones", titulo: "Entra el " + esc.k, columna: true, correcta: a.op,
      html: "<p>El árbol, recién colgado el " + esc.k + " en rojo (con anillo):</p>" +
            A.svg(a.colgado, { z: esc.k, nil: true, escala: 0.85 }) + "<p>¿Qué toca hacer?</p>",
      opciones: [
        { op: "nada", texto: "Nada: no se rompe ninguna regla.", msg: m.nada },
        { op: "c1", texto: "Caso 1: recolorear padre, tío y abuelo, y subir.", msg: m.c1 },
        { op: "c2", texto: "Caso 2: rotar en el padre y seguir con el caso 3.", msg: m.c2 },
        { op: "c3", texto: "Caso 3: recolorear padre y abuelo, y rotar en el abuelo.", msg: m.c3 }
      ]
    };
  }

  function spec() {
    var cartas = [];
    ESCENARIOS.forEach(function (e) { cartas.push(carta(e)); });
    cartas[0].html = A.LEYENDA + "<p class=\"nota\">El nodo con anillo naranja es z, el que acaba de entrar. Si el padre de z es rojo, lo que decide es el tío: el otro hijo del abuelo.</p>" + cartas[0].html;
    var c = analizar(ESCENARIOS[2]);
    var e = analizar(ESCENARIOS[4]);
    cartas.push({ tipo: "respuesta", titulo: "Cómo quedan",
      html: "<p>Termine la reparación de la tarjeta del 20 y la del 58. Escriba el preorden con el color pegado a cada clave, como 40N.</p>",
      campos: [
        { rotulo: "con el 20:", esperado: c.final, ancho: "13rem" },
        { rotulo: "con el 58:", esperado: e.final, ancho: "13rem" }
      ],
      bien: "Correcto. En los dos casos hubo dos rotaciones y quien terminó arriba del trío fue la clave nueva: el 20 entre el 15 y el 25, el 58 entre el 55 y el 63.",
      distractores: [
        { valores: ["40N 15N 25R 20R 55N", null], msg: "Así queda si se salta la rotación en el 15 y se rota de una vez en el 25: el 20 termina rojo bajo el 25, rojo." },
        { valores: [null, "40N 25N 63N 55R 58R"], msg: "Así queda si se salta la rotación en el 63 y se rota de una vez en el 55: el 58 termina rojo bajo el 55, rojo." }
      ],
      otro: "Siga el caso 2 y luego el caso 3. El color va pegado: 20N, 25R." });
    cartas.push({ tipo: "pasos", titulo: "Las cinco reparaciones, paso a paso",
      pasos: (function () {
        var res = [];
        ESCENARIOS.forEach(function (esc) {
          var a = analizar(esc);
          a.sim.traza.pasos.forEach(function (p) {
            res.push({ texto: p.texto, html: A.svg(p.arbol, { z: p.z, nil: true, escala: 0.8 }) });
          });
        });
        return res;
      })() });
    return {
      contenedor: "tarjetas",
      cierre: "<p>El orden de las preguntas es siempre el mismo. ¿El padre de z es rojo? Si no, nada que hacer. ¿El tío es rojo? Entonces se recolorea y z sube dos niveles. Si el tío es negro, la forma decide: en ángulo se rota primero en el padre, y en línea se recolorea y se rota en el abuelo. Del lado derecho todo se refleja.</p>",
      cartas: cartas
    };
  }

  return { ESCENARIOS: ESCENARIOS, analizar: analizar, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
