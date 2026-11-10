/* Ejercicio interactivo: dict y set, las tablas hash de Python. Las casillas
   del set salen de set_add_entry de CPython 3.14 (py.js); cada programa se
   corrió con python3 y la salida coincide con la que se calcula aquí. */
var EJERCICIO = (function () {
  var P = typeof module !== "undefined" ? require("./py.js") : Py;

  var CODIGO_STOCK = [
    "stock = {\"lapiz\": 12, \"regla\": 5}",
    "stock[\"borrador\"] = 7",
    "stock[\"lapiz\"] = stock[\"lapiz\"] - 2",
    "del stock[\"regla\"]",
    "stock[\"regla\"] = 3",
    "print(list(stock))",
    "print(stock[\"lapiz\"], len(stock))"
  ];

  /* Un dict guarda sus claves en orden de llegada; borrar y volver a
     insertar manda la clave al final. */
  function stock() {
    var claves = ["lapiz", "regla"];
    var valores = { lapiz: 12, regla: 5 };
    claves.push("borrador"); valores.borrador = 7;
    valores.lapiz = valores.lapiz - 2;
    claves.splice(claves.indexOf("regla"), 1); delete valores.regla;
    claves.push("regla"); valores.regla = 3;
    return [P.lista(claves), valores.lapiz + " " + claves.length];
  }

  var SET_PASOS = [19, 3, 27, 11];
  var SET_PREDICE = [14, 5, 30, 9];

  function codigoSet(claves) {
    return ["s = set()", "for k in [" + claves.join(", ") + "]:", "    s.add(k)", "print(s)"];
  }

  function textoSet(claves) { return "{" + claves.join(", ") + "}"; }

  function pasosSet() {
    var reg = P.casillasSet(SET_PASOS);
    var vacia = [null, null, null, null, null, null, null, null];
    var pasos = [{ html: P.dibujoSet(vacia), texto: "s = set(): 8 casillas vacías" }];
    var antes = vacia;
    reg.forEach(function (r) {
      var marcas = {};
      var t = "add(" + r.clave + "): " + r.clave + " % 8 = " + (r.clave & 7);
      if (r.probadas.length === 1) {
        marcas[r.casilla] = "nueva";
        t = t + ", la casilla " + r.casilla + " está libre";
        pasos.push({ html: P.dibujoSet(r.tabla, marcas), texto: t });
      } else {
        var m0 = {};
        r.probadas.slice(0, r.probadas.length - 1).forEach(function (c) { m0[c] = "sale"; });
        pasos.push({ html: P.dibujoSet(antes, m0), texto: t + ", ocupada; prueba " +
          r.probadas.slice(1).map(function (c) { return "la " + c; }).join(" y luego ") });
        marcas[r.casilla] = "nueva";
        pasos.push({ html: P.dibujoSet(r.tabla, marcas), texto: "el " + r.clave + " queda en la casilla " + r.casilla });
      }
      antes = r.tabla;
    });
    var orden = P.ordenSet(SET_PASOS);
    pasos.push({ html: P.dibujoSet(antes), texto: "print(s) recorre las casillas de la 0 a la 7: " + textoSet(orden) });
    return pasos;
  }

  function spec() {
    var st = stock();
    var orden = P.ordenSet(SET_PREDICE);
    var ordenado = SET_PREDICE.slice().sort(function (a, b) { return a - b; });
    return {
      contenedor: "tarjetas",
      cierre: "<p><code>dict</code> y <code>set</code> son tablas hash: la clave da la casilla, y si está ocupada se prueba otra de la misma tabla. Por eso buscar, insertar y borrar cuestan O(1) en promedio, la clave tiene que ser inmutable y el <code>set</code> no entrega sus claves en orden. El <code>dict</code> recorre en orden de llegada; para el orden de clave está <code>sorted</code>, en Θ(n log n).</p>",
      cartas: [
        { tipo: "respuesta", titulo: "El orden del dict",
          html: P.codigo(CODIGO_STOCK) + "<p>Escriba las dos líneas que imprime.</p>",
          campos: [
            { rotulo: "línea 1:", esperado: st[0], ancho: "17rem" },
            { rotulo: "línea 2:", esperado: st[1], ancho: "4rem" }
          ],
          bien: "Correcto. El dict recorre en orden de llegada. Cambiar el valor de \"lapiz\" no lo mueve, pero borrar \"regla\" y volver a insertarla la manda al final.",
          distractores: [
            { valores: ["['lapiz', 'regla', 'borrador']", null], msg: "\"regla\" se borró y se volvió a insertar: es la última en llegar." },
            { valores: ["['borrador', 'lapiz', 'regla']", null], msg: "Ese es el orden alfabético, el que daría un map de C++. El dict no ordena por clave." },
            { valores: [null, "10 4"], msg: "del quitó \"regla\" y la última línea la volvió a poner: son tres claves." },
            { valores: [null, "12 3"], msg: "La tercera línea le restó 2 a \"lapiz\"." }
          ],
          otro: "Lleve la lista de claves en orden de llegada: una clave nueva va al final, una que ya está se queda donde está." },
        { tipo: "pasos", titulo: "Las casillas de un set",
          html: P.codigo(codigoSet(SET_PASOS)) + "<p>Con enteros pequeños, <code>hash(k)</code> es <code>k</code>, y en una tabla de 8 casillas la primera que se prueba es <code>k % 8</code>. Si está ocupada, CPython calcula otra; para enteros menores que 32 la cuenta es <code>(5 · i + 1) % 8</code>, donde i es la última casilla probada.</p>",
          pasos: pasosSet() },
        { tipo: "respuesta", titulo: "¿Qué imprime?",
          html: P.codigo(codigoSet(SET_PREDICE)) + "<p>Con la misma regla de la tarjeta anterior, escriba lo que imprime.</p>",
          campos: [{ rotulo: "imprime:", esperado: textoSet(orden), ancho: "12rem" }],
          bien: "Correcto. 9 va a la casilla 1, 5 a la 5 y 14 a la 6. El 30 también cae en la 6, ocupada, y pasa a la (5 · 6 + 1) % 8 = 7. Se recorre de la 0 a la 7.",
          distractores: [
            { valores: [textoSet(ordenado)], msg: "Ese es el orden de un set de C++, que es un árbol. El de Python sale en el orden de las casillas." },
            { valores: [textoSet(SET_PREDICE)], msg: "Ese es el orden de llegada. El set no lo guarda: recorre las casillas de la tabla." },
            { valores: ["{9, 5, 30, 14}"], msg: "El 14 llegó antes que el 30, así que la casilla 6 ya era suya cuando llegó el 30." }
          ],
          otro: "Calcule k % 8 para cada clave en orden de llegada; si la casilla está ocupada, aplique (5 · i + 1) % 8." },
        { tipo: "opciones", titulo: "Contar letras", columna: true, correcta: "keyerror",
          html: P.codigo(["cuenta = {}", "for letra in \"banana\":", "    cuenta[letra] = cuenta[letra] + 1", "print(cuenta)"]) + "<p>¿Qué pasa?</p>",
          opciones: [
            { op: "bien", texto: "Imprime <code>{'b': 1, 'a': 3, 'n': 2}</code>", msg: "Así funcionaría el corchete de map en C++, que crea la clave con 0. En Python, leer una clave que no está es un error." },
            { op: "keyerror", texto: "Se detiene con <code>KeyError: 'b'</code>", msg: "Correcto. cuenta[letra] a la derecha lee la clave antes de que exista. Se arregla preguntando primero con if letra in cuenta, o con cuenta.get(letra, 0) + 1." },
            { op: "cero", texto: "Imprime <code>{'b': 0, 'a': 0, 'n': 0}</code>", msg: "No llega a crear ninguna clave: la primera lectura de cuenta['b'] ya falla." }
          ] },
        { tipo: "opciones", titulo: "Una clave que cambia", columna: true, correcta: "tupla",
          html: "<p>Se quiere guardar cuántas veces aparece cada par de coordenadas (x, y). ¿Cuál de estas claves acepta un <code>dict</code>?</p>",
          opciones: [
            { op: "ninguna", texto: "Ninguna de las dos", msg: "La tupla sí: es inmutable y tiene hash." }
          ,
            { op: "lista", texto: "<code>conteo[[x, y]]</code>", msg: "Una list puede cambiar después de entrar, y entonces su hash ya no apuntaría a su casilla. Python la rechaza con un TypeError: cannot use 'list' as a dict key (unhashable type: 'list')." },
            { op: "tupla", texto: "<code>conteo[(x, y)]</code>", msg: "Correcto. Una tupla no cambia, así que su hash es fijo y puede ser clave." }] },
        { tipo: "opciones", titulo: "Quitar repetidos", columna: true, correcta: "lineal",
          html: P.codigo(["vistos = set()", "unicos = []", "for x in datos:", "    if x not in vistos:", "        vistos.add(x)", "        unicos.append(x)"]) + "<p>Con n datos, ¿cuánto cuesta en promedio?</p>",
          opciones: [
            { op: "lineal", texto: "Θ(n)", msg: "Correcto. n vueltas con una consulta y a lo sumo un add y un append, cada uno O(1) en promedio. Además unicos conserva el orden de llegada." },
            { op: "nlogn", texto: "Θ(n log n)", msg: "Ese es el costo de ordenar. Aquí no se ordena nada." }
          ,
            { op: "cuadratico", texto: "Θ(n²)", msg: "Eso costaría con vistos como list, donde x not in recorre todo. En un set la pregunta cuesta O(1) en promedio." }] }
      ]
    };
  }

  return { spec: spec, stock: stock, CODIGO_STOCK: CODIGO_STOCK, codigoSet: codigoSet, textoSet: textoSet,
    SET_PASOS: SET_PASOS, SET_PREDICE: SET_PREDICE };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
