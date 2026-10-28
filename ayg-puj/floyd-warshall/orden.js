/* Ejercicio interactivo: el orden de los tres ciclos de Floyd-Warshall.
   Cada variante se corre de verdad sobre el mismo grafo y se compara con la
   matriz de distancias. El nucleo vive en lib.js. */
var FW = (typeof module !== "undefined") ? require("./lib.js") : FW;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {
  var fmt = FW.fmt;

  /* Un ciclo de cinco vertices numerados al reves del recorrido, mas una
     arista directa cara de 4 a 0 que deja ver un valor equivocado finito. */
  var GRAFO = {
    n: 5,
    aristas: [[4, 3, 6], [3, 1, 2], [1, 0, 4], [0, 2, 1], [2, 4, 9], [4, 0, 20]],
    pos: [[70, 60], [250, 60], [70, 195], [430, 60], [430, 195]]
  };
  GRAFO.w = FW.pesos(GRAFO.n, GRAFO.aristas);
  GRAFO.correcta = FW.fw(GRAFO.w).d;

  var SANGRIA = ["", "    ", "        ", "            ", "                ", "                    "];
  var NOMBRE = { k: "k", i: "i", j: "j" };

  /* El triple ciclo escrito en el orden que se pide. */
  function codigo(orden, copia) {
    var l = ["def floydWarshall(w):", "    # arranque: d = w con la diagonal en 0"], t = 0, s = 1;
    if (copia) {
      l.push("    for k in range(0, n):");
      l.push("        previa = [f[:] for f in d]");
      l.push("        previa_nex = [f[:] for f in nex]");
      l.push("        for i in range(0, n):");
      l.push("            for j in range(0, n):");
      l.push("                if previa[i][k] + previa[k][j] < d[i][j]:");
      l.push("                    d[i][j] = previa[i][k] + previa[k][j]");
      l.push("                    nex[i][j] = previa_nex[i][k]");
      return l.join("\n");
    }
    while (t < 3) {
      l.push(SANGRIA[s] + "for " + NOMBRE[orden.charAt(t)] + " in range(0, n):");
      s = s + 1;
      t = t + 1;
    }
    l.push(SANGRIA[s] + "if d[i][k] + d[k][j] < d[i][j]:");
    l.push(SANGRIA[s + 1] + "d[i][j] = d[i][k] + d[k][j]");
    l.push(SANGRIA[s + 1] + "nex[i][j] = nex[i][k]");
    return l.join("\n");
  }

  /* mk(posicion de la correcta, [correcta, falsa1, falsa2, falsa3], [fb1, fb2, fb3]) */
  function mk(pos, textos, fbs) {
    var op = [], t = 0, f = 0;
    while (t < 4) {
      if (t === pos) { op.push({ txt: textos[0], ok: true, fb: "" }); }
      else { op.push({ txt: textos[1 + f], ok: false, fb: fbs[f] }); f = f + 1; }
      t = t + 1;
    }
    return op;
  }

  var VARIANTES = [
    { rotulo: "k, i, j", orden: "kij", copia: false,
      razones: mk(1,
        ["El ciclo de k va por fuera, así que cuando empieza la pasada de k la matriz del paso anterior está completa y las dos entradas que se leen ya tienen su valor final para ese paso.",
         "El recorrido es por filas, y escribir d[i][j] después de haber recorrido la fila i entera garantiza que nada se lea a medias.",
         "El cuerpo escribe en d[i][j] y esa casilla no se lee en ningún momento, así que el orden da igual.",
         "Funciona porque este grafo no tiene pesos negativos; con una arista negativa habría que guardar las matrices aparte."],
        ["El orden entre i y j no decide nada: las dos entradas que se consultan son d[i][k] y d[k][j], y ninguna está en la fila i salvo la columna k, que la pasada no mueve.",
         "Sí se lee: la comparación de la línea 56 mira d[i][j] antes de escribirla. Lo que salva al algoritmo es que la fila k y la columna k no cambian durante la pasada.",
         "Los pesos negativos no estorban mientras no haya ciclos negativos, y el orden de los ciclos es un asunto distinto. Este grafo, además, no tiene aristas negativas."]) },
    { rotulo: "i, j, k", orden: "ijk", copia: false,
      razones: mk(2,
        ["La pareja (i, j) se cierra en su turno, y los caminos que pasan por una fila que todavía no se ha recorrido nunca llegan a tiempo: esa pareja ya no se vuelve a mirar.",
         "El cuerpo lee d[i][k] y d[k][j], que en este orden valen ∞ siempre, así que ninguna pareja mejora.",
         "Da el mismo resultado: los tres ciclos recorren las mismas n³ ternas, solo que en otro orden.",
         "Falla porque el grafo tiene un ciclo; sobre un grafo sin ciclos este orden sería correcto."],
        ["No siempre valen ∞: varias parejas quedan bien y una queda con un valor finito equivocado, lo que hace más difícil darse cuenta.",
         "Las ternas son las mismas, pero el cuerpo lee lo que él mismo escribió antes, así que el orden decide el resultado. Repetir el triple ciclo hasta que una vuelta no cambie nada sí da la matriz correcta, y aquí hacen falta tres vueltas.",
         "Los ciclos del grafo no tienen que ver. Lo que hace fallar a este orden es que k deje de ser el ciclo de más afuera."]) },
    { rotulo: "i, k, j", orden: "ikj", copia: false,
      razones: mk(0,
        ["La fila i se termina antes de que se conozcan los caminos que empiezan en las filas que faltan, y como la fila i no se vuelve a recorrer, lo que le faltó se queda sin corregir.",
         "Es correcto: basta con que k vaya antes que j para que d[k][j] esté listo cuando se lee.",
         "Es correcto, porque el ciclo de i por fuera equivale a correr un algoritmo de una fuente desde cada vértice.",
         "Falla porque el grafo tiene una arista de peso 20, y Floyd-Warshall no admite pesos tan grandes."],
        ["Que d[k][j] esté listo para la fila i no basta: también hace falta que lo esté para las filas que ya pasaron, y esas no se vuelven a mirar. Aquí la pareja (2, 0) queda en 29 en vez de 21.",
         "No equivale: un algoritmo de una fuente relaja aristas hasta que nada baja, y aquí la fila i se recorre una sola vez con la información que haya en ese momento.",
         "El peso 20 no tiene nada de especial. De hecho es el que deja ver la falla: la pareja (2, 0) se queda con el camino que lo usa, 29, en vez de los 21 del camino largo."]) },
    { rotulo: "k, j, i", orden: "kji", copia: false,
      razones: mk(3,
        ["Lo único que decide es que k sea el ciclo de más afuera. Cambiar el orden de i y j recorre la matriz por columnas en vez de por filas y lee exactamente los mismos valores.",
         "Falla, porque la matriz hay que recorrerla por filas: d[i][k] queda en la fila i y hay que haber llegado a ella.",
         "Falla, porque al recorrer por columnas se escribe en d[i][j] antes de leer d[k][j].",
         "Es correcto en un grafo pequeño, pero con muchos vértices este orden empieza a dejar parejas sin calcular."],
        ["Recorrer por filas o por columnas no cambia qué se lee: la comparación mira d[i][k] y d[k][j] en la matriz entera, no en la fila en curso.",
         "d[k][j] está en la fila k, y esa fila no se mueve durante la pasada de k. Se lea cuando se lea, trae el mismo valor.",
         "El tamaño del grafo no entra en el argumento. Lo que sostiene a esta variante es que la fila k y la columna k no cambian durante la pasada de k, y eso vale para cualquier n."]) },
    { rotulo: "j, k, i", orden: "jki", copia: false,
      razones: mk(1,
        ["Con j por fuera, la columna j se cierra antes de que se conozcan los caminos que terminan en las columnas que faltan, y esa columna no se vuelve a recorrer.",
         "Es correcto: k queda en el medio y eso basta para que las dos entradas que se leen estén al día.",
         "Falla porque i es el ciclo de más adentro y d[i][k] se lee antes de calcularse.",
         "Es correcto en este grafo y falla en otros, así que el orden de los ciclos depende del grafo."],
        ["Que k esté en el medio no ayuda: lo que hace falta es que la pasada entera de k termine antes de empezar la siguiente, y aquí la columna j ya se cerró.",
         "d[i][k] se lee cuando toca, el problema no es ese. Lo que falla es que la columna j no se vuelve a mirar: tres parejas se quedan en ∞.",
         "Aquí falla, así que la primera mitad es falsa. Y el orden no depende del grafo: con k por fuera el algoritmo es correcto en todos."]) },
    { rotulo: "k, i, j, leyendo una copia", orden: "kij", copia: true,
      razones: mk(2,
        ["Es la versión que guarda D^(k) aparte, y da el mismo resultado porque la fila k y la columna k no cambian durante la pasada: leerlas de la copia o de la matriz a medio actualizar es lo mismo.",
         "Da un resultado distinto, porque leer de la copia impide que las mejoras de una misma pasada se encadenen.",
         "Da un resultado distinto, porque la copia se hace antes de poner la diagonal en 0.",
         "Es correcta pero más lenta, porque copiar la matriz en cada pasada sube el tiempo a Θ(n⁴)."],
        ["Las mejoras que se encadenan dentro de una misma pasada serían las que leen una casilla ya modificada, y eso solo puede pasar en la fila k o en la columna k, que no se mueven. El resultado es el mismo.",
         "La diagonal se pone en 0 en el arranque, antes de la primera pasada, así que la copia ya la trae.",
         "Copiar cuesta Θ(n²) por pasada y n pasadas dan Θ(n³), lo mismo que el triple ciclo. Lo que sube es el espacio si se guardan todas las matrices."]) }
  ];
  VARIANTES.forEach(function (v) {
    var r = FW.discrepancias(GRAFO.w, v.orden, v.copia);
    v.d = r.d;
    v.fallas = r.fallas;
    v.correcto = r.fallas.length === 0;
    v.codigo = codigo(v.orden, v.copia);
  });

  function evaluarVeredicto(v, dijoCorrecto) {
    if (dijoCorrecto === v.correcto) {
      return { ok: true, msg: v.correcto
        ? "Sí: la matriz coincide con la de las distancias en las " + (GRAFO.n * GRAFO.n) + " parejas."
        : "No: " + v.fallas.length + " parejas quedan mal. " + v.fallas.map(function (f) {
            return "d[" + f.i + "][" + f.j + "] dio " + fmt(f.dio) + " y debía dar " + fmt(f.debia);
          }).join("; ") + "." };
    }
    return { ok: false, msg: v.correcto
      ? "La matriz sí coincide con la de las distancias en las " + (GRAFO.n * GRAFO.n) + " parejas."
      : "La matriz no coincide: " + v.fallas.length + " parejas quedan mal, entre ellas d[" +
        v.fallas[0].i + "][" + v.fallas[0].j + "], que dio " + fmt(v.fallas[0].dio) + " en vez de " + fmt(v.fallas[0].debia) + "." };
  }

  return { GRAFO: GRAFO, VARIANTES: VARIANTES, evaluarVeredicto: evaluarVeredicto, codigo: codigo };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, G = E.GRAFO, resueltas = 0;
    function el(id) { return document.getElementById(id); }

    el("panel-grafo").innerHTML = GRAFOSVG.dibujar({
      n: G.n, pos: G.pos, aristas: G.aristas,
      arista: function (t) { return G.aristas[t][2] === 20 ? { color: "ambar", grueso: 2.6, curva: 45 } : { color: "gris", grueso: 2 }; }
    });
    el("ver-aristas").textContent = "Aristas: " + FW.textoAristas(G.aristas) + ".";
    el("panel-correcta").innerHTML = FW.tabla(G.correcta, { esquina: "δ" });
    el("total").textContent = E.VARIANTES.length;

    function carta(v, idx) {
      var c = document.createElement("div"), st = { ver: null, razon: null, listo: false };
      c.className = "carta";
      c.innerHTML = "<h2>Variante " + (idx + 1) + ": <code>" + v.rotulo + "</code></h2>" +
        "<div class='variante'>" + v.codigo + "</div>" +
        "<div class='pregunta'>¿Esta variante da la matriz de distancias?</div><div class='opciones vers'></div>" +
        "<div class='pregunta'>¿Por qué?</div><div class='razones'></div>" +
        "<div class='botones' style='margin-top:0.6rem'><button class='primario comprobar'>Comprobar</button></div>" +
        "<div class='fb'></div><div class='salida'></div>";
      var cajaV = c.querySelector(".vers"), cajaR = c.querySelector(".razones"),
          fb = c.querySelector(".fb"), sal = c.querySelector(".salida");

      function pintar() {
        cajaV.innerHTML = ""; cajaR.innerHTML = "";
        [["Sí", true], ["No", false]].forEach(function (o) {
          var b = document.createElement("button");
          b.textContent = o[0];
          b.className = st.ver === o[1] ? "primario" : "";
          b.addEventListener("click", function () { st.ver = o[1]; pintar(); });
          cajaV.appendChild(b);
        });
        v.razones.forEach(function (o, t) {
          var b = document.createElement("button");
          b.className = "opcion" + (st.razon === t ? " elegida" : "");
          b.textContent = o.txt;
          b.addEventListener("click", function () { st.razon = t; pintar(); });
          cajaR.appendChild(b);
        });
      }

      c.querySelector(".comprobar").addEventListener("click", function () {
        if (st.ver === null || st.razon === null) {
          fb.className = "fb mal";
          fb.textContent = "Escoja una respuesta y una razón.";
          return;
        }
        var r = E.evaluarVeredicto(v, st.ver), o = v.razones[st.razon];
        if (r.ok && o.ok) {
          fb.className = "fb bien";
          fb.textContent = r.msg + " Y la razón es la que lo explica.";
          if (!st.listo) { st.listo = true; resueltas = resueltas + 1; el("resueltas").textContent = resueltas; }
        } else {
          fb.className = "fb mal";
          fb.textContent = (r.ok ? "El veredicto es correcto. " : r.msg + " ") + (o.ok ? "La razón es la correcta." : "Razón: " + o.fb);
        }
        sal.innerHTML = "<div class='leyenda' style='margin-top:0.6rem'>Lo que deja esta variante. En rojo, " +
          (v.fallas.length === 0 ? "nada: coincide con δ." : "las parejas que no coinciden con δ.") + "</div>" +
          FW.tabla(v.d, {
            esquina: "d",
            clase: function (i, j) { return v.d[i][j] !== G.correcta[i][j] ? "mala" : ""; }
          });
      });
      pintar();
      return c;
    }

    var caja = el("variantes");
    E.VARIANTES.forEach(function (v, t) { caja.appendChild(carta(v, t)); });
  })();
}
