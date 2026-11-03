/* Ejercicio interactivo: la altura del árbol completo y lo que cuesta
   cada operación del montículo. Las cotas se calculan con
   altura(n) = piso de log2 n y se comprueban contra la simulación. */
var EJERCICIO = (function () {
  var M = typeof module !== "undefined" ? require("./monti.js") : Monti;
  var TAMANOS = [12, 200, 70000];
  var LLENO = 255;
  var GRANDE = 50000;
  var BAJAN = [64, 57, 51, 43, 38, 30, 22, 17, 9];

  /* Intercambios al insertar las claves una tras otra, desde vacío. */
  function intercambiosAlInsertar(claves) {
    var a = [];
    var t = 0;
    claves.forEach(function (k) {
      var r = M.insertar(a, k);
      t = t + r.intercambios;
      a = r.a;
    });
    return { total: t, a: a };
  }

  function spec() {
    var alt = TAMANOS.map(M.altura);
    var techo = TAMANOS.map(function (n) { return Math.ceil(Math.log2(n)); });
    var insLleno = M.altura(LLENO + 1);
    var extLleno = M.altura(LLENO - 1);
    var hIns = M.altura(GRANDE + 1);
    var hExt = M.altura(GRANDE - 1);
    var bajan = intercambiosAlInsertar(BAJAN);
    return {
      contenedor: "tarjetas",
      cierre: "<p>Un árbol completo con n nodos tiene altura ⌊log₂ n⌋. Insertar sube a lo sumo la altura del árbol con la clave nueva y extraer baja a lo sumo la del árbol sin la que salió: O(log n) las dos. Consultar el máximo es Θ(1) y buscar una clave cualquiera es Θ(n), porque entre hermanos no hay orden. Como la forma es siempre completa, el árbol cabe en un arreglo sin punteros y el padre y los hijos se calculan.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Alturas",
          html: "<p>¿Qué altura tiene un árbol completo con cada uno de estos números de nodos? La altura cuenta aristas desde la raíz hasta la hoja más honda.</p>",
          campos: TAMANOS.map(function (n, i) {
            return { rotulo: "n = " + n + ":", esperado: String(alt[i]), ancho: "3rem" };
          }),
          bien: "Correcto. 8 ≤ 12 < 16 da 3; 128 ≤ 200 < 256 da 7; 65 536 ≤ 70 000 < 131 072 da 16.",
          distractores: [
            { valores: techo.map(String), msg: "Ese es el techo de log₂ n. La altura es el piso: el último nivel puede tener un solo nodo y aun así cuenta, pero no llega a otro nivel." },
            { valores: [String(alt[0] + 1), null, null], msg: "Con 12 nodos hay cuatro niveles, del 0 al 3: la altura cuenta aristas, no niveles." }
          ],
          otro: "Busque la potencia de 2 más grande que no pasa de n: su exponente es la altura." },
        { tipo: "respuesta", titulo: "Un árbol lleno",
          html: "<p>Un montículo tiene " + LLENO + " claves: todos sus niveles están llenos. ¿Cuántos intercambios hace, como máximo, insertar una clave más? ¿Y extraer el máximo de esas " + LLENO + "?</p>",
          campos: [
            { rotulo: "insertar:", esperado: String(insLleno), ancho: "3rem" },
            { rotulo: "extraer:", esperado: String(extLleno), ancho: "3rem" }
          ],
          bien: "Correcto. Con 255 claves la altura es 7. La clave nueva abre el nivel 8 y puede subir 8 veces. Al extraer quedan 254 claves, de altura 7, y la que baja hace a lo sumo 7 intercambios.",
          distractores: [
            { valores: ["7", null], msg: "La clave 256 no cabe en los niveles llenos: entra en un nivel nuevo, y desde ahí hay 8 aristas hasta la raíz." },
            { valores: [null, "8"], msg: "Al extraer, el árbol pierde una casilla: quedan 254 claves, y la clave que baja no pasa del nivel 7." }
          ],
          otro: "Calcule la altura del árbol con la clave nueva y la del árbol sin la que salió." },
        { tipo: "tabla", titulo: "Un montículo de " + GRANDE + " claves", cabecera: ["operación", "a lo sumo", "por qué"],
          filas: [
            ["maximo()", "0 comparaciones", "el mayor está en a[0]"],
            ["insertar(k)", hIns + " intercambios", "el árbol con " + (GRANDE + 1) + " claves tiene altura " + hIns],
            ["extraerMax()", hExt + " intercambios y " + (2 * hExt) + " comparaciones", "el árbol con " + (GRANDE - 1) + " claves tiene altura " + hExt + "; en cada nivel la clave se compara con dos hijos, y si llega al fondo es una hoja y ya no compara"],
            ["buscar una clave cualquiera", GRANDE + " casillas", "entre hermanos no hay orden y no se puede descartar un subárbol"]
          ],
          boton: "Mostrar la fila siguiente",
          nota: "Antes de mostrar cada fila, calcule el número." },
        { tipo: "respuesta", titulo: "De mayor a menor",
          html: "<p>Se insertan, una tras otra y en un montículo vacío, las claves " + BAJAN.join(", ") + ". ¿Cuántos intercambios se hacen en total? ¿Cómo queda el arreglo?</p>",
          campos: [
            { rotulo: "intercambios:", esperado: String(bajan.total), ancho: "3rem" },
            { rotulo: "arreglo:", esperado: M.texto(bajan.a), ancho: "14rem" }
          ],
          bien: "Correcto. Cada clave nueva es menor que todas las que ya están, en particular que su padre: no sube nunca. Un arreglo ordenado de mayor a menor ya es un montículo.",
          distractores: [
            { valores: ["8", null], msg: "Cada clave se compara una vez con su padre, pero ninguna comparación termina en intercambio." }
          ],
          otro: "Compare cada clave nueva con su padre: ¿es mayor?" },
        { tipo: "opciones", titulo: "Por qué un arreglo", columna: true, correcta: "forma",
          html: "<p>El montículo se guarda en un <code>vector&lt;int&gt;</code> y no con nodos y punteros, como el árbol binario de búsqueda. ¿Qué lo permite?</p>",
          opciones: [
            { op: "forma", texto: "La forma siempre completa: el padre y los hijos de cada casilla se calculan, y solo se guardan las claves.", msg: "Correcto. Sin punteros, el espacio es Θ(n) con una casilla por clave, y moverse por el árbol cuesta una cuenta." },
            { op: "orden", texto: "Que las claves quedan ordenadas en el arreglo.", msg: "No quedan ordenadas: entre hermanos y entre ramas no hay orden. Lo que se mantiene es la forma." },
            { op: "busca", texto: "Que así buscar una clave cuesta O(log n).", msg: "Buscar una clave cualquiera sigue costando Θ(n): no hay forma de saber en qué rama está." }
          ] }
      ]
    };
  }

  return { TAMANOS: TAMANOS, LLENO: LLENO, GRANDE: GRANDE, BAJAN: BAJAN, intercambiosAlInsertar: intercambiosAlInsertar, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
