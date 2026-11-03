/* Ejercicio interactivo: heapsort. El máximo se cambia con la última
   casilla del montículo y la nueva raíz baja en un montículo más corto.
   Todo sale de la simulación de orden.js. */
var EJERCICIO = (function () {
  var M = typeof module !== "undefined" ? require("../monticulo/monti.js") : Monti;
  var O = typeof module !== "undefined" ? require("./orden.js") : Orden;
  var B = [33, 71, 18, 54, 62, 27];
  var D = [40, 85, 12, 66, 73, 29, 51];
  /* Un montículo cuya última casilla no es la menor. */
  var CONTRA = [9, 4, 8, 1, 3, 7];

  /* Una clave con etiqueta: compara por la clave y se imprime con la letra. */
  function clave(k, t) {
    return { k: k, t: t, valueOf: function () { return this.k; } };
  }

  function textoEtiquetado(a) {
    return a.map(function (x) { return x.k + x.t; }).join(" ");
  }

  function spec() {
    var hd = O.heapsort(D);
    var dos = hd.rondas[1].despues;
    var iguales = [clave(6, "a"), clave(9, ""), clave(6, "b"), clave(1, "")];
    var orden = O.heapsort(iguales);
    return {
      contenedor: "tarjetas",
      cierre: "<p>Heapsort ordena en dos fases sobre el mismo arreglo. <code>construir</code> deja el máximo en a[0] en Θ(n). Después, en cada ronda, el máximo se cambia con la última casilla del montículo, que es justo donde le toca quedar, y la clave que llegó a la raíz baja en un montículo una casilla más corto. Son n − 1 rondas de a lo sumo ⌊log₂ n⌋ intercambios: O(n log n) en cualquier caso y sin arreglo auxiliar. El precio es la estabilidad: los intercambios a distancia pueden invertir el orden de dos claves iguales.</p>",
      cartas: [
        { tipo: "pasos", titulo: "Ordenar seis claves",
          html: "<p>El código, con el <code>bajar</code> que recibe el tamaño del montículo:</p>" + M.codigo(O.CODIGO_HEAPSORT) +
                "<p>Se ordena <code>" + B.join(" ") + "</code>. El árbol dibuja solo lo que sigue en el montículo; en verde, las casillas que ya quedaron en su lugar.</p>",
          pasos: O.pasosHeapsort(B) },
        { tipo: "opciones", titulo: "Por qué a[fin]", columna: true, correcta: "lugar",
          html: "<p>En cada ronda, el máximo de a[0] se cambia con a[fin]. ¿Por qué esa casilla y no otra?</p>",
          opciones: [
            { op: "lugar", texto: "Porque el máximo de las fin + 1 claves que quedan es la mayor de ellas, y en el arreglo ordenado le toca la posición fin.", msg: "Correcto. Las casillas de fin + 1 en adelante ya tienen las claves más grandes, en orden. La mayor de las que faltan va justo antes. Y quitar la última casilla es lo único que deja el montículo completo." },
            { op: "hoja", texto: "Porque a[fin] es una hoja, y una hoja nunca hay que bajarla.", msg: "Es cierto que a[fin] es una hoja, y no es la razón. Lo que importa es que su casilla es la que le toca al máximo en el arreglo ordenado." },
            { op: "menor", texto: "Porque en a[fin] está siempre la clave más pequeña del montículo.", msg: "No siempre. La menor está en alguna hoja, pero no necesariamente en la última: en el montículo " + M.texto(CONTRA) + " la última casilla tiene el " + CONTRA[CONTRA.length - 1] + " y la menor, el 1, está en a[3]. Y aunque lo estuviera, lo que decide es dónde le toca quedar al máximo." }
          ] },
        { tipo: "respuesta", titulo: "Dos rondas a mano",
          html: "<p>Se llama <code>heapsort</code> sobre:</p>" + M.cajas(D, {}) +
                "<p>Primero <code>construir</code>, y después dos rondas del ciclo. ¿Cómo queda el montículo inicial y cómo queda el arreglo después de las dos rondas?</p>",
          campos: [
            { rotulo: "tras construir:", esperado: M.texto(hd.inicial), ancho: "14rem" },
            { rotulo: "tras dos rondas:", esperado: M.texto(dos), ancho: "14rem" }
          ],
          bien: "Correcto. construir sube el 51 y luego baja el 40 dos niveles. En la primera ronda el 85 va a a[6] y el 12 baja hasta a[3]; en la segunda el 73 va a a[5] y el 29 baja bajo el 40.",
          distractores: [
            { valores: [null, "66 40 51 12 29"], msg: "Escriba el arreglo completo, con las dos casillas que ya quedaron ordenadas al final." },
            { valores: [null, "73 66 51 12 40 29 85"], msg: "Esa es la situación después de una ronda. Falta la segunda: el 73 se cambia con a[5] y el 29 baja." },
            { valores: ["85 73 51 66 40 29 12", "12 29 40 51 66 73 85"], msg: "El montículo inicial está bien, pero la segunda casilla pide el arreglo después de dos rondas, no al final del ordenamiento." }
          ],
          otro: "construir empieza en i = 2. En cada ronda: cambie a[0] con a[fin] y baje la nueva raíz sin tocar las casillas de fin en adelante." },
        { tipo: "opciones", titulo: "Claves iguales", columna: true, correcta: "invierte",
          html: "<p>Se ordenan cuatro claves en las que el 6 aparece dos veces; la letra solo sirve para distinguirlas:</p>" +
                "<pre class=\"fragmento\">" + textoEtiquetado(iguales) + "</pre>" +
                "<p>El 6a llega antes que el 6b. ¿En qué orden quedan después de <code>heapsort</code>?</p>",
          opciones: [
            { op: "conserva", texto: "6a antes que 6b: heapsort respeta el orden de llegada.", msg: "Resultado de heapsort: " + textoEtiquetado(orden.a) + ". El cambio de a[0] con a[fin] lleva una clave de un extremo al otro del arreglo y la deja detrás de otra igual que estaba más atrás." },
            { op: "invierte", texto: "6b antes que 6a: el orden de los iguales se invierte.", msg: "Correcto. Queda " + textoEtiquetado(orden.a) + ". Un ordenamiento que no garantiza conservar el orden de los iguales se llama inestable, y heapsort lo es: el cambio de a[0] con a[fin] salta por encima de todo lo que hay en medio." },
            { op: "igual", texto: "Da lo mismo: dos claves iguales no se distinguen.", msg: "Con enteros solos no se distinguen. Cuando se ordenan registros por un campo, por ejemplo estudiantes por nota, sí se nota cuál quedó primero." }
          ] },
        { tipo: "opciones", titulo: "Heapsort frente a los otros", columna: true, correcta: "ambos",
          html: "<p>Merge sort ordena en Θ(n log n) y quicksort en Θ(n log n) en promedio. ¿Qué tiene heapsort que no tienen los dos juntos?</p>",
          opciones: [
            { op: "rapido", texto: "Hace menos comparaciones que los dos en cualquier arreglo.", msg: "No. En la práctica quicksort suele ser más rápido, y merge sort hace menos comparaciones en el peor caso. Heapsort gana en otra cosa." },
            { op: "ambos", texto: "Garantiza O(n log n) también en el peor caso, como merge sort, y ordena dentro del mismo arreglo, como quicksort.", msg: "Correcto. Merge sort necesita un arreglo auxiliar de n casillas para mezclar; quicksort trabaja en el mismo arreglo pero cae a Θ(n²) con pivotes malos. Heapsort tiene las dos garantías a la vez." },
            { op: "estable", texto: "Es estable, a diferencia de quicksort.", msg: "Heapsort no es estable: la tarjeta anterior lo muestra con el 6a y el 6b." }
          ] }
      ]
    };
  }

  return { B: B, D: D, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
