/* Ejercicio interactivo: construir un montículo de abajo arriba. Todo lo
   calcula la simulación de construir y bajar en orden.js. */
var EJERCICIO = (function () {
  var M = typeof module !== "undefined" ? require("../monticulo/monti.js") : Monti;
  var O = typeof module !== "undefined" ? require("./orden.js") : Orden;
  var A = [14, 38, 22, 51, 9, 47, 63, 26];
  var C = [8, 29, 41, 17, 35, 60, 3, 12, 50, 21];
  var GRANDE = 1023;

  function ascendente(n) {
    var a = [];
    var k = 1;
    while (k <= n) { a.push(k); k = k + 1; }
    return a;
  }

  function spec() {
    var ca = O.construir(A);
    var cc = O.construir(C);
    var ins = O.porInserciones(A);
    var peorConstruir = O.construir(ascendente(GRANDE)).intercambios;
    var peorInsertar = O.porInserciones(ascendente(GRANDE)).intercambios;
    var inicio = Math.floor(A.length / 2) - 1;
    return {
      contenedor: "tarjetas",
      cierre: "<p>Construir un montículo no exige insertar las claves una por una: se baja cada casilla con hijos, de la última a la raíz. Las hojas, de ⌊n/2⌋ en adelante, ya son montículos de una clave, y cuando le toca a la casilla i sus dos subárboles ya son montículos, que es lo que <code>bajar</code> necesita. Casi todas las casillas están cerca de las hojas y bajan poco: la suma de las alturas da menos de n intercambios, Θ(n), contra Θ(n log n) de las inserciones en el peor caso. Los dos caminos dejan montículos válidos, y en general distintos.</p>",
      cartas: [
        { tipo: "opciones", titulo: "Por dónde empezar", columna: true, correcta: "mitad",
          html: "<p>Llega este arreglo de " + A.length + " claves, sin ningún orden:</p>" + M.vista(A, {}) +
                M.codigo(O.CODIGO_CONSTRUIR) +
                "<p>¿Con qué valor de i hace <code>construir</code> su primer llamado a <code>bajar</code>?</p>",
          opciones: [
            { op: "mitad", texto: "Con i = " + inicio + ", la última casilla que tiene hijos.", msg: "Correcto. n / 2 − 1 = " + inicio + ". El hijo izquierdo de a[" + inicio + "] es a[" + (2 * inicio + 1) + "], que existe; el de a[" + (inicio + 1) + "] sería a[" + (2 * inicio + 3) + "], que ya no. De ahí hacia atrás todas tienen hijos." },
            { op: "raiz", texto: "Con i = 0, la raíz, para poner arriba el máximo de una vez.", msg: "Si se baja la raíz primero, sus subárboles todavía no son montículos y el máximo puede quedar escondido abajo: aquí el " + Math.max.apply(null, A) + " está en una hoja y bajar el 14 nunca lo alcanza." }
          ,
            { op: "ultima", texto: "Con i = " + (A.length - 1) + ", la última casilla.", msg: "a[" + (A.length - 1) + "] es una hoja: no tiene hijos con quién compararse, y bajarla no hace nada. Lo mismo pasa con todas las casillas desde a[" + (inicio + 1) + "]." }] },
        { tipo: "pasos", titulo: "construir, llamado por llamado",
          html: "<p>En naranja, la clave que baja; en naranja claro, los hijos con los que se compara.</p>",
          pasos: O.pasosConstruir(A) },
        { tipo: "respuesta", titulo: "Otro arreglo",
          html: "<p>Se llama <code>construir</code> sobre este arreglo de " + C.length + " claves:</p>" + M.cajas(C, {}) +
                "<p>¿Cómo queda el arreglo y cuántos intercambios se hacen en total?</p>",
          campos: [
            { rotulo: "arreglo:", esperado: M.texto(cc.a), ancho: "18rem" },
            { rotulo: "intercambios:", esperado: String(cc.intercambios), ancho: "3rem" }
          ],
          bien: "Correcto. Se baja desde a[4] hasta a[0]: el 35 no se mueve, suben el 50, el 60 y otra vez el 50, y el 8 baja dos niveles hasta quedar bajo el 41.",
          distractores: [
            { valores: [null, "4"], msg: "Cuente también el segundo intercambio del 8: después de cambiarse con el 60 sigue bajando y se cambia con el 41." },
            { valores: ["60 50 41 29 35 8 3 12 17 21", "3"], msg: "El arreglo está bien. Faltan intercambios: el 50 sube en a[3], el 60 en a[2], el 50 otra vez en a[1] y el 8 baja dos veces." },
            { valores: [M.texto(O.porInserciones(C).a), null], msg: "Ese es el montículo que dejan diez inserciones seguidas. construir no inserta: baja cada casilla con hijos, desde a[4] hasta la raíz, y deja otro arreglo." }
          ],
          otro: "Empiece en i = 4, que es 10 / 2 − 1, y baje cada casilla con sus dos hijos hasta llegar a i = 0." },
        { tipo: "opciones", titulo: "Insertar una por una", columna: true, correcta: "ambos",
          html: "<p>Con las mismas " + A.length + " claves del principio se arman dos montículos: uno con <code>construir</code> y otro con " + A.length + " llamados a <code>insertar</code> en el orden en que llegan.</p>" +
                "<p>construir:</p>" + M.cajas(ca.a, {}) + "<p>inserciones:</p>" + M.cajas(ins.a, {}) +
                "<p>Los arreglos no coinciden. ¿Qué se concluye?</p>",
          opciones: [
            { op: "construir", texto: "Que las inserciones se equivocaron: el montículo correcto es el de construir.", msg: "Revise los padres del segundo arreglo: 63 sobre 38 y 51, 38 sobre 26 y 9, 51 sobre 22 y 47, 26 sobre 14. Todos cumplen." },
            { op: "ambos", texto: "Que los dos son montículos de máximos: un mismo conjunto de claves admite varios.", msg: "Correcto. La propiedad solo pide que cada padre sea mayor o igual que sus hijos, y eso no fija un único arreglo. Lo que sí coincide es la raíz, el " + ca.a[0] + ". El camino cambia el costo: " + ca.intercambios + " intercambios con construir y " + ins.intercambios + " con las inserciones." },
            { op: "insertar", texto: "Que construir se equivocó, porque no respeta el orden de llegada.", msg: "Un montículo no guarda el orden de llegada; solo garantiza que el máximo esté en a[0]. Los dos arreglos lo cumplen." }
          ] },
        { tipo: "respuesta", titulo: "El peor caso con " + GRANDE + " claves",
          html: "<p>Llegan las claves 1, 2, 3, …, " + GRANDE + " en orden creciente. Es el peor caso de los dos métodos: con <code>construir</code>, cada casilla con hijos es la menor de su subárbol y baja hasta una hoja; con inserciones, cada clave nueva es la mayor y sube hasta la raíz. El árbol completo de " + GRANDE + " claves tiene 10 niveles, del 0 al 9, y el nivel d tiene 2<sup>d</sup> casillas.</p>" +
                "<p>¿Cuántos intercambios hace cada método?</p>",
          campos: [
            { rotulo: "construir:", esperado: String(peorConstruir), ancho: "5rem" },
            { rotulo: "inserciones:", esperado: String(peorInsertar), ancho: "5rem" }
          ],
          bien: "Correcto. Con construir, una casilla del nivel d baja 9 − d niveles, y casi todas están abajo: 256 bajan uno, 128 bajan dos… y la raíz nueve, " + peorConstruir + " en total, menos que n. Con inserciones, la clave que entra en el nivel d sube d niveles, y la mitad de las claves entra en el último: " + peorInsertar + ", unas ocho veces más.",
          distractores: [
            { valores: [String(GRANDE * 9), null], msg: "Eso sería bajar todas las casillas nueve niveles. Solo la raíz baja nueve; las 512 hojas no bajan nada y las 256 del nivel 8 bajan uno." },
            { valores: [null, String(GRANDE * 9)], msg: "Solo las 512 claves del último nivel suben nueve. Las del nivel d suben d: la suma de d · 2^d para d de 0 a 9." }
          ],
          otro: "Sume por niveles. Con construir, el nivel d aporta 2^d · (9 − d); con inserciones, 2^d · d." }
      ]
    };
  }

  return { A: A, C: C, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
