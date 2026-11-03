/* Ejercicio interactivo: extraer el máximo. La última clave pasa a la raíz
   y baja por el mayor de sus hijos; todo lo calcula la simulación de
   monticulo.h, incluido el empate y la versión que mira un solo hijo. */
var EJERCICIO = (function () {
  var M = typeof module !== "undefined" ? require("./monti.js") : Monti;
  var H = [97, 68, 90, 51, 63, 84, 36, 19, 47, 55, 12];
  var EMPATE = [70, 52, 52, 30, 45, 41, 18];

  function spec() {
    var e1 = M.extraer(H);
    var e2 = M.extraer(e1.a);
    var emp = M.extraer(EMPATE);
    var primero = emp.reg[0];
    var lado = primero.mayor === 1 ? "izq" : "der";
    var solo = M.bajarSoloIzq(e1.antes.slice(), 0);
    var rota = M.primeraRota(solo);
    return {
      contenedor: "tarjetas",
      cierre: "<p>Extraer el máximo devuelve a[0], pasa la última clave a la raíz, porque la última casilla es la única que se puede quitar sin dejar un hueco, y la baja: en cada nivel se compara con sus dos hijos y se intercambia con el mayor, si es mayor que ella. Si se intercambia con el menor, ese queda como padre del mayor y el orden se rompe. Con dos hijos iguales, el código se queda con el izquierdo, porque el derecho solo gana si es estrictamente mayor. Son a lo sumo ⌊log₂ n⌋ intercambios: O(log n).</p>",
      cartas: [
        { tipo: "opciones", titulo: "Quién ocupa la raíz", columna: true, correcta: "ultima",
          html: "<p>Un montículo de máximos:</p>" + M.vista(H, {}) + "<p>Sale el " + H[0] + ". ¿Qué clave se pone en a[0] antes de bajar?</p>",
          opciones: [
            { op: "ultima", texto: "El " + H[H.length - 1] + ", la última clave, y el arreglo queda con " + (H.length - 1) + " casillas.", msg: "Correcto. Quitar la última casilla es lo único que deja el árbol completo. El " + H[H.length - 1] + " queda arriba y baja hasta su lugar." },
            { op: "hijo", texto: "El " + H[2] + ", el mayor de los hijos, y su lugar lo ocupa el mayor de sus hijos, y así.", msg: "Cada clave que sube deja un hueco más abajo, y el último hueco puede quedar en medio del último nivel: el árbol deja de ser completo." },
            { op: "correr", texto: "Se corre todo el arreglo una casilla a la izquierda.", msg: "Cuesta Θ(n) y cambia todos los parentescos: el " + H[1] + " quedaría en la raíz con el " + H[2] + " como hijo, y eso ya no es un montículo." }
          ] },
        { tipo: "pasos", titulo: "Sale el " + H[0],
          html: "<p>En naranja, la clave que baja; en naranja claro, los hijos con los que se compara.</p>",
          pasos: M.pasosExtraer(H) },
        { tipo: "respuesta", titulo: "Otra extracción",
          html: "<p>Sobre lo que quedó:</p>" + M.cajas(e1.a, {}) + "<p>se llama otra vez a <code>extraerMax()</code>. ¿Qué devuelve, cuántos intercambios hace y cómo queda el arreglo?</p>",
          campos: [
            { rotulo: "devuelve:", esperado: String(e2.max), ancho: "3rem" },
            { rotulo: "intercambios:", esperado: String(e2.intercambios), ancho: "3rem" },
            { rotulo: "arreglo:", esperado: M.texto(e2.a), ancho: "16rem" }
          ],
          bien: "Correcto. El 55 pasa a la raíz; sus hijos son 68 y 84, sube el 84. En a[2] sus hijos son 12 y 36, los dos menores que 55, y se detiene.",
          distractores: [
            { valores: [null, null, "84 68 55 51 63 12 36 19 47 55"], msg: "La última casilla desaparece: el 55 se mueve a la raíz, no se copia. El arreglo queda con nueve claves." },
            { valores: [null, "2", null], msg: "En a[2] los hijos son 12 y 36. Ninguno es mayor que 55: ahí termina." },
            { valores: [null, null, "68 55 84 51 63 12 36 19 47"], msg: "Se intercambia con el mayor de los dos hijos, el 84, no con el izquierdo. Con el 68 arriba, el 84 quedaría bajo él." }
          ],
          otro: "Ponga el 55 en a[0], quite la última casilla y baje comparando con los dos hijos." },
        { tipo: "opciones", titulo: "Dos hijos iguales", columna: true, correcta: lado,
          html: "<p>Se extrae el máximo de este montículo:</p>" + M.vista(EMPATE, {}) +
                "<p>El " + EMPATE[EMPATE.length - 1] + " queda en la raíz y sus dos hijos valen " + EMPATE[1] + ". Con el código de <code>bajar</code>, ¿con cuál se intercambia?</p>" +
                M.codigo([
                  "if (izq < n && a[izq] > a[mayor]) {",
                  "  mayor = izq;",
                  "}",
                  "if (der < n && a[der] > a[mayor]) {",
                  "  mayor = der;",
                  "}"
                ]),
          opciones: [
            { op: "izq", texto: "Con el izquierdo, a[1].", msg: "Correcto. mayor pasa a 1 con el izquierdo; el derecho tendría que ser estrictamente mayor que a[1] para ganarle. El arreglo queda " + M.texto(emp.a) + "." },
            { op: "der", texto: "Con el derecho, a[2], porque se revisa de último.", msg: "El segundo if solo cambia mayor si a[der] > a[mayor], y 52 > 52 es falso." },
            { op: "ninguno", texto: "Con ninguno: hay empate y se detiene.", msg: "El empate es entre los hijos. Los dos son mayores que el " + EMPATE[EMPATE.length - 1] + ", así que uno tiene que subir." }
          ] },
        { tipo: "respuesta", titulo: "Mirar un solo hijo",
          html: "<p>Alguien escribe un <code>bajar</code> que solo mira el hijo izquierdo: mientras exista y sea mayor que la clave, los intercambia y sigue desde ahí. Se usa en la primera extracción de esta actividad, con el " + e1.raiz + " ya en la raíz:</p>" + M.cajas(e1.antes, {}) +
                "<p>¿Cómo queda el arreglo? ¿Cuál es la primera casilla con una clave mayor que la de su padre?</p>",
          campos: [
            { rotulo: "arreglo:", esperado: M.texto(solo), ancho: "16rem" },
            { rotulo: "casilla:", esperado: String(rota), ancho: "3rem" }
          ],
          bien: "Correcto. En la raíz sube el 68 aunque el derecho es el 90; el 12 sigue bajando por la izquierda hasta a[7]. El 90 queda como hijo del 68.",
          distractores: [
            { valores: [M.texto(e1.a), null], msg: "Ese es el resultado de bajar bien. Esta versión nunca mira el hijo derecho: en la raíz sube el 68." },
            { valores: [null, "4"], msg: "La casilla 4 también falla, porque el 63 quedó bajo el 51, pero antes está la casilla 2: el 90 bajo el 68." }
          ],
          otro: "Siga solo por la izquierda: casillas 0, 1, 3, 7, mientras el hijo izquierdo sea mayor." }
      ]
    };
  }

  return { H: H, EMPATE: EMPATE, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
