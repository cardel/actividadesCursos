/* Ejercicio interactivo: insertar una secuencia en un rojinegro vacio,
   caso por caso, y compararlo con el ABB de la misma secuencia. Todo lo
   calcula la simulacion de la insercion de CLRS. */
var EJERCICIO = (function () {
  var A = typeof module !== "undefined" ? require("./arbol-rn.js") : ArbolRN;
  var CLAVES = [5, 19, 9, 28, 38, 48, 45, 59, 55];
  var PRIMERAS = 4;

  function profundidad(r, k) {
    var d = 0;
    while (r !== null && r.dato !== k) {
      r = k < r.dato ? r.izq : r.der;
      d = d + 1;
    }
    return d;
  }

  function nombreCasos(c) {
    return c.length === 0 ? "ninguno" : c.join(", ");
  }

  /* Clave cuyo caso 1 deja la regla 4 rota mas arriba: un 1 seguido de
     otro caso en la misma insercion. */
  function propagacion(trazas) {
    var res = [];
    trazas.forEach(function (t, i) {
      if (t.casos.length >= 2 && t.casos[0] === 1) { res.push(CLAVES[i]); }
    });
    return res;
  }

  function spec() {
    var cuatro = A.armar(CLAVES.slice(0, PRIMERAS));
    var todo = A.armar(CLAVES);
    var abb = A.armarABB(CLAVES);
    var rot = todo.trazas.reduce(function (s, t) { return s + t.rotaciones; }, 0);
    var prop = propagacion(todo.trazas);
    var ultima = CLAVES[CLAVES.length - 1];
    var filas = [];
    CLAVES.forEach(function (k, i) {
      var t = todo.trazas[i];
      var a = A.armar(CLAVES.slice(0, i + 1)).raiz;
      filas.push([String(k), nombreCasos(t.casos), String(t.rotaciones), String(A.altura(a))]);
    });
    var pasos = [];
    todo.trazas.forEach(function (t) {
      t.pasos.forEach(function (p) {
        pasos.push({ texto: p.texto, html: A.svg(p.arbol, { z: p.z, nil: true, columnas: CLAVES.length, escala: 0.75 }) });
      });
    });
    return {
      contenedor: "tarjetas",
      cierre: "<p>Cada clave entra roja donde la deja el ABB, y la reparación sube por ese mismo camino. El tío rojo se arregla recoloreando, y a veces el problema reaparece dos niveles arriba; el tío negro se arregla con una o dos rotaciones y ahí termina. Con nueve claves casi en orden, el ABB quedó con altura 6 y el rojinegro con 3: la diferencia crece con n, porque el ABB puede llegar a n − 1 y el rojinegro no pasa de 2 log₂(n + 1).</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Las cuatro primeras",
          html: "<p>Una bodega registra códigos que llegan casi en orden: " + CLAVES.join(" ") + ". Se insertan en un rojinegro vacío.</p>" + A.LEYENDA +
                "<p>Después de las cuatro primeras, " + CLAVES.slice(0, PRIMERAS).join(" ") + ", ¿cuál es el preorden con el color pegado a cada clave (como 5N)?</p>",
          campos: [{ rotulo: "preorden:", esperado: A.preordenColor(cuatro.raiz).join(" "), ancho: "12rem" }],
          bien: "Correcto. El 9 entra en ángulo bajo el 19 (caso 2 y luego caso 3) y queda en la raíz. El 28 encuentra al tío 5 rojo: caso 1, y la raíz 9, que quedó roja, se pinta de negro.",
          distractores: [
            { valores: ["5N 19R 9R 28R"], msg: "Ese es el ABB pintado tal cual llegó: el 9 bajo el 19 deja dos rojos seguidos y hay que reparar." },
            { valores: ["9N 5R 19R 28R"], msg: "Falta reparar el 28: entra rojo bajo el 19, rojo. El tío 5 también es rojo: caso 1." },
            { valores: ["9R 5N 19N 28R"], msg: "Después del caso 1 la raíz queda roja, y la regla 2 pide pintarla de negro." }
          ],
          otro: "Haga las cuatro inserciones en papel. Recuerde: la raíz siempre termina negra." },
        { tipo: "tabla", titulo: "Clave por clave", cabecera: ["clave", "casos que usa", "rotaciones", "altura después"],
          filas: filas, boton: "Mostrar la clave siguiente",
          nota: "Antes de mostrar cada fila, diga qué casos va a usar esa clave. Los números de los casos son los de CLRS: 1 tío rojo, 2 tío negro en ángulo, 3 tío negro en línea." },
        { tipo: "respuesta", titulo: "El árbol final",
          html: "<p>Con las nueve claves adentro: ¿cuál es el preorden con colores? ¿Cuántas rotaciones hubo en total? ¿Qué clave hace que el caso 1 deje la regla 4 rota más arriba y haya que seguir reparando?</p>",
          campos: [
            { rotulo: "preorden:", esperado: A.preordenColor(todo.raiz).join(" "), ancho: "17rem" },
            { rotulo: "rotaciones:", esperado: String(rot), ancho: "3rem" },
            { rotulo: "clave:", esperado: prop.join(" "), ancho: "3rem" }
          ],
          bien: "Correcto. Con el " + prop.join(" ") + ", el caso 1 sube z hasta un nodo cuyo padre también es rojo, y de ahí sigue un caso 3 dos niveles arriba. Las rotaciones suman " + rot + " en nueve inserciones, nunca más de dos por clave.",
          distractores: [
            { valores: [null, String(rot - 1), null], msg: "Revise los casos 2: cada uno trae su propia rotación, y después viene la del caso 3." },
            { valores: [null, null, String(ultima)], msg: "El " + ultima + " usa los casos 2 y 3, con el tío negro: ahí no se recolorea hacia arriba." }
          ],
          otro: "Siga las inserciones una por una. Si se pierde, la tabla de arriba da los casos de cada clave." },
        { tipo: "pasos", titulo: "Toda la traza",
          pasos: pasos },
        { tipo: "respuesta", titulo: "Contra el ABB",
          html: "<p>Las mismas nueve claves en un ABB sin colores dan este árbol:</p>" + A.svg(abb, { escala: 0.75 }) +
                "<p>¿Qué altura tiene el ABB y cuál el rojinegro? ¿Cuántas comparaciones hace buscar el " + ultima + " en cada uno?</p>",
          campos: [
            { rotulo: "altura ABB:", esperado: String(A.altura(abb)), ancho: "3rem" },
            { rotulo: "altura RN:", esperado: String(A.altura(todo.raiz)), ancho: "3rem" },
            { rotulo: "buscar en ABB:", esperado: String(profundidad(abb, ultima) + 1), ancho: "3rem" },
            { rotulo: "buscar en RN:", esperado: String(profundidad(todo.raiz, ultima) + 1), ancho: "3rem" }
          ],
          bien: "Correcto. Las claves casi en orden estiran el ABB hacia la derecha; el rojinegro las reparte. Buscar compara una vez por cada nodo del camino, la profundidad más uno.",
          distractores: [
            { valores: [null, null, String(profundidad(abb, ultima)), null], msg: "Esa es la profundidad del " + ultima + ". La búsqueda compara también con el propio " + ultima + ": una más." }
          ],
          otro: "La altura cuenta aristas. Las comparaciones cuentan los nodos desde la raíz hasta la clave, ella incluida." }
      ]
    };
  }

  return { CLAVES: CLAVES, propagacion: propagacion, profundidad: profundidad, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
