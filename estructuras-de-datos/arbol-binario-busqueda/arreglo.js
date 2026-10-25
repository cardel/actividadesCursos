/* Ejercicio interactivo: la busqueda binaria sobre un arreglo ordenado ya
   dibuja un arbol, y en ese arbol agregar no corre a nadie. */
var EJERCICIO = (function () {
  var A = typeof module !== "undefined" ? require("./arbol.js") : ArbolBB;
  var ARR = [4, 7, 11, 15, 18, 22, 26, 30, 35, 39, 42, 47, 51, 56, 60];

  /* Claves que mira la busqueda binaria, con medio = (ini + fin) / 2. */
  function binaria(arr, k) {
    var ini = 0;
    var fin = arr.length - 1;
    var mira = [];
    var hallado = false;
    while (ini <= fin && !hallado) {
      var medio = Math.floor((ini + fin) / 2);
      mira.push(arr[medio]);
      if (arr[medio] === k) {
        hallado = true;
      } else if (k < arr[medio]) {
        fin = medio - 1;
      } else {
        ini = medio + 1;
      }
    }
    return mira;
  }

  /* El arbol de la busqueda binaria: el del medio es la raiz y cada mitad, un subarbol. */
  function balanceado(arr, ini, fin) {
    var res = null;
    if (ini <= fin) {
      var medio = Math.floor((ini + fin) / 2);
      res = A.nodo(arr[medio], balanceado(arr, ini, medio - 1), balanceado(arr, medio + 1, fin));
    }
    return res;
  }

  function seCorren(arr, k) {
    return arr.filter(function (x) { return x > k; }).length;
  }

  function cajas(arr) {
    return "<div class=\"arreglo fila-arreglo\">" + arr.map(function (x, i) {
      return "<div class=\"caja fija\"><span class=\"indice\">" + i + "</span>" + x + "</div>";
    }).join("") + "</div>";
  }

  function spec() {
    var mira39 = binaria(ARR, 39);
    var arbol = balanceado(ARR, 0, ARR.length - 1);
    var c33 = A.camino(arbol, 33);
    var corren = seCorren(ARR, 33);
    var con33 = A.insertar(A.clonar(arbol), 33);
    var marcas = {};
    c33.claves.forEach(function (k) { marcas[k] = "visto"; });
    marcas[33] = "resal";
    var aristas = {};
    c33.claves.slice(1).forEach(function (k) { aristas[k] = "camino"; });
    aristas[33] = "nueva";
    return {
      contenedor: "tarjetas",
      cierre: "<p>Las comparaciones posibles de la búsqueda binaria forman este árbol: la raíz es la clave del medio y cada mitad cuelga a un lado. Con nodos y punteros, el 33 se cuelga donde su búsqueda se cae, debajo del " + c33.padre + ", y ninguna otra clave se mueve.</p>" +
        A.svg(con33, { marcas: marcas, aristas: aristas }) +
        "<p>Encontrar el lugar sigue costando lo que la búsqueda y enlazar cuesta Θ(1). En el arreglo, encontrar el lugar cuesta Θ(log n), pero correr lo que sigue cuesta hasta Θ(n). Ese árbol, con la regla de menores a la izquierda y mayores a la derecha, es el árbol binario de búsqueda.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "La búsqueda binaria de 39",
          html: "<p>La búsqueda binaria mira la casilla <code>medio = (ini + fin) / 2</code> y se queda con la mitad donde puede estar la clave. Arreglo ordenado de 15 claves:</p>" + cajas(ARR) +
            "<p>¿Qué claves mira, en orden, para encontrar el 39?</p>",
          campos: [{ rotulo: "mira:", esperado: mira39.join(" "), pista: "a b c", ancho: "9rem" }],
          bien: "Correcto: índice 7 (el " + mira39[0] + "), luego el centro de 8 a 14, el índice 11 (el " + mira39[1] + "), y luego el centro de 8 a 10, el índice 9.",
          distractores: [
            { valores: ["30 42 39"], msg: "Después del 30 queda la mitad derecha, índices 8 a 14. Su centro es el índice 11, que guarda el 47." },
            { valores: ["30 39"], msg: "Entre el 30 y el 39 hay otra comparación: el centro de los índices 8 a 14 es el 11, el 47." }
          ],
          otro: "Empiece con ini = 0 y fin = 14. Después de cada comparación, ini o fin pasa al otro lado del medio." },
        { tipo: "respuesta", titulo: "El árbol que dibuja la búsqueda",
          html: "<p>La primera comparación es siempre con la misma clave. La segunda es con una de dos, según el lado. Si cada clave del medio fuera un nodo con punteros a sus dos mitades, ¿cuál sería la raíz y cuáles sus dos hijos?</p>",
          campos: [
            { rotulo: "raíz:", esperado: String(arbol.dato), ancho: "3.5rem" },
            { rotulo: "hijo izquierdo:", esperado: String(arbol.izq.dato), ancho: "3.5rem" },
            { rotulo: "hijo derecho:", esperado: String(arbol.der.dato), ancho: "3.5rem" }
          ],
          bien: "Correcto: el 30 se compara primero; si la clave es menor, la siguiente comparación es con el centro de 0 a 6, el 15, y si es mayor, con el centro de 8 a 14, el 47.",
          distractores: [
            { valores: ["30", "4", "60"], msg: "El 4 y el 60 son los extremos del arreglo. Cada hijo es el centro de su mitad: índices 0 a 6 y 8 a 14." },
            { valores: ["30", "26", "35"], msg: "El 26 y el 35 son los vecinos del 30 en el arreglo. La segunda comparación salta al centro de la mitad, no a la casilla de al lado." }
          ],
          otro: "La raíz es la primera clave que mira cualquier búsqueda; cada hijo, la segunda según el lado." },
        { tipo: "respuesta", titulo: "Agregar el 33",
          html: "<p>Se quiere agregar el 33 sin perder el orden. En el arreglo hay que abrirle un hueco. En el árbol de la tarjeta anterior basta con seguir la búsqueda del 33 hasta que se caiga en un <code>NULL</code> y colgar ahí un nodo nuevo.</p><p>¿Cuántas claves del arreglo se corren una casilla? En el árbol, ¿de qué nodo cuelga el 33 y de qué lado?</p>",
          campos: [
            { rotulo: "se corren:", esperado: String(corren), ancho: "3rem" },
            { rotulo: "cuelga del:", esperado: String(c33.padre), ancho: "3.5rem" },
            { rotulo: "lado:", esperado: c33.lado, pista: "izq o der", ancho: "5.5rem" }
          ],
          bien: "Correcto: en el arreglo se corren " + corren + " claves, del 35 al 60. En el árbol la búsqueda pasa por " + c33.claves.join(", ") + " y el 33 entra como hijo izquierdo del 35, sin mover a nadie.",
          distractores: [
            { valores: ["8", null, null], msg: "El 33 va entre el 30 y el 35. Se corren las claves mayores que 33: 35, 39, 42, 47, 51, 56 y 60." },
            { valores: [null, "39", null], msg: "La búsqueda no se detiene en el 39: 33 < 39 baja a su hijo izquierdo, el 35, y 33 < 35 baja otra vez." },
            { valores: [null, "30", null], msg: "El 30 es la raíz y ya tiene sus dos hijos. 33 > 30 baja a la derecha y sigue bajando hasta un NULL." }
          ],
          otro: "En el lado escriba izq o der. Para el padre, siga la búsqueda del 33 desde la raíz: 30, después 47, ..." },
        { tipo: "opciones", titulo: "Lo que cuesta agregar", columna: true, correcta: "arbol",
          html: "<p>Con n claves, ¿qué describe mejor el costo de agregar una clave en cada estructura?</p>",
          opciones: [
            { op: "arbol", texto: "Arreglo: Θ(log n) para hallar el lugar y Θ(n) para correr. Árbol: lo que cueste bajar hasta el NULL y Θ(1) para enlazar.", msg: "Correcto. En el árbol el costo es el largo del camino, que aquí es a lo sumo 4. Cuánto mide ese camino en general depende de la forma del árbol." },
            { op: "igual", texto: "Los dos Θ(log n): buscan el lugar de la misma manera.", msg: "Buscan igual, pero el arreglo además corre las claves que siguen, hasta n de ellas. El árbol solo cambia un puntero." },
            { op: "uno", texto: "Arreglo Θ(1): basta con escribir el 33 en la casilla que le toca.", msg: "La casilla que le toca está ocupada por el 35. Para escribir ahí hay que correr siete claves una casilla a la derecha." }
          ] }
      ]
    };
  }

  return { arr: ARR, binaria: binaria, balanceado: balanceado, seCorren: seCorren, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
