/* Ejercicio interactivo: operaciones sobre una tabla de direccionamiento directo. */
var EJERCICIO = (function () {
  var M = 8;
  var OPERACIONES = [
    ["insertar", 6, "Rosa"], ["insertar", 1, "Juan"], ["insertar", 4, "Kim"],
    ["buscar", 4], ["buscar", 2], ["insertar", 1, "Leo"],
    ["eliminar", 6], ["buscar", 6], ["buscar", 1]
  ];

  /* Igual que TablaDirecta: insertar con una clave que ya estaba cambia el nombre. */
  function correr() {
    var T = [];
    var k = 0;
    while (k < M) { T.push(null); k = k + 1; }
    var pasos = [];
    OPERACIONES.forEach(function (o) {
      var salida = "";
      if (o[0] === "insertar") {
        T[o[1]] = o[2];
      } else if (o[0] === "eliminar") {
        T[o[1]] = null;
      } else {
        salida = "buscar(" + o[1] + "): " + (T[o[1]] === null ? "no esta" : T[o[1]]);
      }
      var op = o[0] + "(" + o[1] + (o.length > 2 ? ", " + o[2] : "") + ")";
      pasos.push({ op: op, casilla: o[1], leidas: 1, tabla: T.slice(), salida: salida });
    });
    return pasos;
  }

  function tablaHtml(T, resaltada) {
    var h = "<div class=\"arreglo fila-arreglo\">";
    T.forEach(function (v, k) {
      var estilo = v === null ? " style=\"background:#eceff3\"" : "";
      h = h + "<span class=\"caja fija" + (k === resaltada ? " actual" : "") + "\"" + estilo + "><span class=\"indice\">" + k + "</span>" + (v === null ? "" : v) + "</span>";
    });
    return h + "</div>";
  }

  function llenas(T) {
    return T.filter(function (v) { return v !== null; }).length;
  }

  function spec() {
    var P = correr();
    var fin = P[P.length - 1];
    var vacia = [];
    var k = 0;
    while (k < M) { vacia.push(null); k = k + 1; }
    var programa = "<pre class=\"fragmento\">TablaDirecta t(" + M + ");\n" +
      OPERACIONES.map(function (o) {
        return o[0] === "insertar" ? "t.insertar(" + o[1] + ", \"" + o[2] + "\");" :
               (o[0] === "eliminar" ? "t.eliminar(" + o[1] + ");" : "consultar(t, " + o[1] + ");");
      }).join("\n") + "</pre>";
    var pasos = [{ texto: "TablaDirecta t(" + M + "): ocho casillas en NULL", html: tablaHtml(vacia, -1) }];
    P.forEach(function (p) {
      pasos.push({ texto: p.op + ": casilla " + p.casilla + (p.salida !== "" ? "; imprime " + p.salida : ""), html: tablaHtml(p.tabla, p.casilla) });
    });
    return {
      contenedor: "tarjetas",
      cierre: "Cada operación calcula la casilla con la clave y toca esa casilla y ninguna otra: Θ(1), sin importar cuántos registros haya. Una casilla vacía responde que la clave no está. Insertar una clave que ya estaba no ocupa otra casilla; reemplaza lo que había. La tabla supone que toda clave está entre 0 y m − 1.",
      cartas: [
        { tipo: "respuesta", titulo: "Lo último que se imprime",
          html: programa + "<p><code>consultar</code> imprime el nombre guardado con la clave, o <code>no esta</code>. ¿Qué nombre imprime la última línea, <code>consultar(t, 1)</code>?</p>",
          campos: [{ rotulo: "buscar(1):", esperado: fin.salida.split(": ")[1], ancho: "7rem" }],
          bien: "Correcto: Leo. insertar(1, \"Leo\") escribió en la casilla 1, donde estaba Juan, y cambió el nombre.",
          distractores: [
            { valores: ["juan"], msg: "insertar con una clave que ya estaba no crea otro registro: escribe en la misma casilla, y Juan queda reemplazado por Leo." },
            { valores: ["rosa"], msg: "Rosa estaba en la casilla 6, y eliminar(6) la vació. La consulta lee la casilla 1." }
          ],
          otro: "Siga el paso a paso de abajo." },
        { tipo: "respuesta", titulo: "Casillas llenas",
          html: "<p>Al terminar, ¿cuántas de las " + M + " casillas tienen un registro?</p>",
          campos: [{ rotulo: "llenas:", esperado: String(llenas(fin.tabla)) }],
          bien: "Correcto: " + llenas(fin.tabla) + ", la 1 con Leo y la 4 con Kim.",
          distractores: [
            { valores: ["3"], msg: "La casilla 6 se vació con eliminar(6)." },
            { valores: ["4"], msg: "Leo no ocupó una casilla nueva: su clave es 1, la misma de Juan." }
          ],
          otro: "Cuente las inserciones con clave distinta y reste las eliminadas." },
        { tipo: "respuesta", titulo: "Una clave que no está",
          html: "<p>¿Cuántas casillas lee <code>buscar(2)</code> para responder que el 2 no está?</p>",
          campos: [{ rotulo: "casillas:", esperado: "1" }],
          bien: "Correcto: una. Si el 2 estuviera, estaría en la casilla 2; vacía, no hay otro sitio dónde buscarlo.",
          distractores: [
            { valores: [String(M)], msg: "Eso haría una lista sin orden: recorrerla toda para asegurar que no está. Aquí la clave dice la única casilla posible." },
            { valores: ["3"], msg: "No se recorren las casillas llenas: se lee la casilla de la clave." }
          ],
          otro: "¿En qué casilla estaría el 2 si estuviera?" },
        { tipo: "opciones", titulo: "Una clave fuera del universo", columna: true, correcta: "fuera",
          html: "<p>¿Qué pasa con <code>t.insertar(9, \"Ana\")</code> en esta tabla de " + M + " casillas?</p>",
          opciones: [
            { op: "fuera", texto: "El <code>assert</code> detiene el programa; sin él, se escribiría fuera del arreglo", msg: "Correcto. La tabla directa supone 0 ≤ clave < m. La casilla 9 no existe en un arreglo de 8." },
            { op: "mod", texto: "Va a la casilla 1, porque 9 mod 8 = 1", msg: "La tabla directa no transforma la clave: la usa tal cual. Convertir la clave en una casilla con una cuenta es otra estructura, y ahí aparece el problema de dos claves en la misma casilla." },
            { op: "crece", texto: "La tabla crece a 10 casillas, como un vector", msg: "TablaDirecta pide sus m casillas una vez, en el constructor, y no crece." }
          ] },
        { tipo: "pasos", titulo: "Paso a paso", pasos: pasos }
      ]
    };
  }

  return { m: M, operaciones: OPERACIONES, correr: correr, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
