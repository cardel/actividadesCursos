/* Ejercicio interactivo: insertar en un montículo de máximos. La clave
   entra en la primera casilla libre y sube; todo lo calcula la simulación
   de monticulo.h. */
var EJERCICIO = (function () {
  var M = typeof module !== "undefined" ? require("./monti.js") : Monti;
  var H = [93, 77, 85, 60, 71, 49, 80, 22, 58, 64, 30];
  var LLEGAN = [88, 96, 80];

  function trazas() {
    var res = [];
    var a = H;
    LLEGAN.forEach(function (k) {
      var r = M.insertar(a, k);
      res.push(r);
      a = r.a;
    });
    return res;
  }

  function spec() {
    var t = trazas();
    var filas = t[0].reg.map(function (f) {
      var comp = f.raiz ? "es la raíz" : f.clave + (f.cambia ? " > " : (f.clave === f.otra ? " = " : " < ")) + f.otra;
      var acc = f.cambia ? "intercambiar, i = " + f.p : "detenerse";
      return [String(f.i), f.raiz ? "no tiene" : String(f.p), comp, acc];
    });
    return {
      contenedor: "tarjetas",
      cierre: "<p>Insertar pone la clave en la casilla n, la única que mantiene el árbol completo, y la sube mientras sea mayor que su padre. Cada intercambio la lleva un nivel arriba, así que hace a lo sumo tantos como la altura del árbol con la clave nueva: O(log n). Una clave igual a su padre no sube, porque la comparación es estricta.</p>",
      cartas: [
        { tipo: "opciones", titulo: "Dónde entra", columna: true, correcta: "libre",
          html: "<p>Un montículo de máximos con " + H.length + " claves:</p>" + M.vista(H, {}) + "<p>Llega el " + LLEGAN[0] + ". ¿En qué casilla se pone antes de compararlo con nada?</p>",
          opciones: [
            { op: "libre", texto: "En a[" + H.length + "], la primera casilla libre.", msg: "Correcto. Es el siguiente lugar del último nivel, de izquierda a derecha: el árbol sigue completo. Desde ahí sube." },
            { op: "raiz", texto: "En a[0], porque es mayor que casi todas.", msg: "Para ponerlo en a[0] habría que correr todo el arreglo, Θ(n), y los parentescos cambiarían. La clave entra abajo y sube." },
            { op: "cinco", texto: "En a[5], encima del 49, que es menor.", msg: "a[5] ya está ocupada. La clave nueva se pone en una casilla libre; si queda encima de una menor, es porque subió." }
          ] },
        { tipo: "pasos", titulo: "Llega el " + LLEGAN[0],
          html: "<p>En naranja, la clave que sube; en naranja claro, el padre con el que se compara.</p>",
          pasos: M.pasosInsertar(H, LLEGAN[0]) },
        { tipo: "tabla", titulo: "La traza en una tabla", cabecera: ["i", "padre(i)", "comparación", "acción"],
          filas: filas, boton: "Mostrar la comparación siguiente",
          nota: "padre(i) = (i − 1) / 2 con división entera." },
        { tipo: "respuesta", titulo: "Llega el " + LLEGAN[1],
          html: "<p>Sobre el montículo que dejó el " + LLEGAN[0] + ":</p>" + M.cajas(t[0].a, {}) + "<p>llega el " + LLEGAN[1] + ". ¿Cuántos intercambios hace y cómo queda el arreglo?</p>",
          campos: [
            { rotulo: "intercambios:", esperado: String(t[1].intercambios), ancho: "3rem" },
            { rotulo: "arreglo:", esperado: M.texto(t[1].a), ancho: "18rem" }
          ],
          bien: "Correcto. El 96 entra en a[12], cuyo padre es a[5] = 88; sube a a[5], después a a[2] y por último a la raíz, porque es mayor que el 93. Tres intercambios: uno por nivel.",
          distractores: [
            { valores: ["2", null], msg: "Al llegar a a[2] todavía falta compararlo con el 93 de la raíz, y 96 > 93." },
            { valores: [null, "96 77 88 60 71 85 80 22 58 64 30 49 93"], msg: "Cada intercambio mueve al padre una casilla abajo, a la que dejó la clave que sube: el 93 baja a a[2], el 88 a a[5] y el 85 a a[12]." }
          ],
          otro: "La casilla 12 tiene padre 5; la 5, padre 2; la 2, padre 0. Compare en cada nivel." },
        { tipo: "respuesta", titulo: "Llega el " + LLEGAN[2],
          html: "<p>Después del " + LLEGAN[1] + " llega el " + LLEGAN[2] + ". ¿En qué casilla queda al terminar? ¿Cuántos intercambios hace?</p>",
          campos: [
            { rotulo: "casilla:", esperado: String(t[2].queda), ancho: "3rem" },
            { rotulo: "intercambios:", esperado: String(t[2].intercambios), ancho: "3rem" }
          ],
          bien: "Correcto. Entra en a[13], cuyo padre es a[6] = 80. La condición del while pide a[padre] < a[i], y 80 < 80 es falso: no sube.",
          distractores: [
            { valores: ["6", "1"], msg: "Con claves iguales no hay intercambio: el while sube solo si el padre es estrictamente menor." },
            { valores: [null, "1"], msg: "El 80 nuevo se compara con un 80. La condición es estricta, así que se queda donde entró." }
          ],
          otro: "Calcule el padre de la casilla 13 y compare con la condición del while de subir." }
      ]
    };
  }

  return { H: H, LLEGAN: LLEGAN, trazas: trazas, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
