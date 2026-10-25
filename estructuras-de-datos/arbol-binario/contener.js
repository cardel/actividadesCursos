/* Ejercicio interactivo: un organigrama guardado en una lista pierde quién
   depende de quién; dos organigramas distintos dan la misma lista. */
var EJERCICIO = (function () {
  var A = (typeof Arbol !== "undefined") ? Arbol : require("../comun/arbol.js");
  var G = A.G;

  var PRIMERO = G("Gerencia", [
    G("Ventas", [G("Norte"), G("Sur")]),
    G("Producción", [G("Planta"), G("Calidad", [G("Laboratorio")])]),
    G("Finanzas")
  ]);

  var SEGUNDO = G("Gerencia", [
    G("Ventas", [G("Norte"), G("Sur"), G("Producción", [G("Planta")])]),
    G("Calidad", [G("Laboratorio"), G("Finanzas")])
  ]);

  /* Los nombres en el orden en que aparecen al leer el organigrama de arriba
     abajo: cada dependencia, seguida de todo lo que depende de ella. */
  function lista(n, sal) {
    sal = sal || [];
    sal.push(n.dato);
    n.hijos.forEach(function (h) { lista(h, sal); });
    return sal;
  }

  function buscar(n, nombre) {
    var res = null;
    if (n.dato === nombre) { res = n; }
    var i = 0;
    while (res === null && i < n.hijos.length) {
      res = buscar(n.hijos[i], nombre);
      i = i + 1;
    }
    return res;
  }

  function jefe(n, nombre) {
    var res = null;
    var i = 0;
    while (res === null && i < n.hijos.length) {
      if (n.hijos[i].dato === nombre) { res = n.dato; } else { res = jefe(n.hijos[i], nombre); }
      i = i + 1;
    }
    return res;
  }

  function spec() {
    var l = lista(PRIMERO);
    var n = l.length;
    var gradoProd = buscar(PRIMERO, "Producción").hijos.length;
    var texto = "<pre class=\"fragmento\">" + l.join("  ") + "</pre>";
    return {
      contenedor: "tarjetas",
      cierre: "Una lista guarda un orden y nada más. Cuando unos datos contienen a otros, lo que se necesita es que cada uno apunte a lo que contiene: desde Producción se llega a sus " + gradoProd + " dependencias sin mirar las otras " + (n - gradoProd - 1) + ". Esa estructura es un árbol, y las preguntas de quién contiene a quién se responden bajando por él.",
      cartas: [
        { tipo: "opciones", titulo: "Un organigrama en una lista", columna: true, correcta: "nodice",
          html: "<p>Una empresa guarda los nombres de sus dependencias en una lista enlazada, en el orden en que aparecen al leer el organigrama de arriba abajo, cada una seguida de lo que depende de ella:</p>" + texto + "<p>¿De quién depende Finanzas?</p>",
          opciones: [
            { op: "lab", texto: "De Laboratorio, que está justo antes", msg: "Estar antes en la lista no es depender. Laboratorio es lo último de la rama de Producción, y Finanzas puede colgar de cualquiera de las dependencias que siguen abiertas." },
            { op: "ger", texto: "De Gerencia", msg: "Puede ser, pero la lista no lo dice. La tarjeta siguiente muestra otro organigrama que da exactamente la misma lista, y ahí Finanzas depende de Calidad." },
            { op: "nodice", texto: "La lista no lo dice", msg: "Correcto. La lista guarda el orden de lectura y pierde quién contiene a quién: dos organigramas distintos producen la misma secuencia." }
          ] },
        { tipo: "pasos", titulo: "Dos organigramas, una misma lista",
          html: "<p>Los dos se leen de arriba abajo igual: " + l.join(", ") + ".</p>",
          pasos: [
            { texto: "en el primero, Finanzas depende de " + jefe(PRIMERO, "Finanzas") + " y Producción tiene " + gradoProd + " dependencias",
              html: A.general(PRIMERO, { estilos: { "Finanzas": "activo" }, titulo: "primer organigrama" }) },
            { texto: "en el segundo, Finanzas depende de " + jefe(SEGUNDO, "Finanzas") + " y Producción cuelga de Ventas",
              html: A.general(SEGUNDO, { estilos: { "Finanzas": "activo" }, titulo: "segundo organigrama" }) }
          ] },
        { tipo: "respuesta", titulo: "Preguntar qué contiene Producción",
          html: "<p>Para no perder la información, cada elemento de la lista guarda también el nombre de su jefe. En el primer organigrama, ¿cuántos elementos hay que mirar para saber qué depende de Producción? ¿Y cuántos, si Producción apunta directamente a sus dependencias, como en el dibujo?</p>",
          campos: [
            { rotulo: "en la lista:", esperado: String(n), ancho: "3.5rem" },
            { rotulo: "bajando desde Producción:", esperado: String(gradoProd), ancho: "3.5rem" }
          ],
          bien: "Correcto. En la lista cualquiera de los " + n + " puede tener a Producción como jefe, así que hay que mirarlos todos: Θ(n) por pregunta. Desde Producción se baja a Planta y a Calidad y nada más: lo que cuesta es su número de hijos.",
          distractores: [
            { valores: ["3", null], msg: "Las dependencias de Producción quedan seguidas en la lista, pero eso solo se sabe mirando el organigrama. Con la lista sola, cualquier elemento puede tener a Producción como jefe." },
            { valores: [null, "3"], msg: "Laboratorio depende de Calidad, no de Producción. Desde Producción se baja a sus hijos directos." }
          ],
          otro: "En la lista hay que mirar cada elemento y su jefe. En el árbol, solo los hijos de Producción." },
        { tipo: "opciones", titulo: "¿Cuál no es un árbol?", columna: true, correcta: "fila",
          html: "<p>¿En cuál de estos datos ningún elemento contiene a otros?</p>",
          opciones: [
            { op: "indice", texto: "El índice de un libro: capítulos, secciones y subsecciones", msg: "Un capítulo contiene secciones y una sección contiene subsecciones: es un árbol con el libro en la raíz." },
            { op: "torneo", texto: "Un torneo por eliminación directa: cada partido enfrenta a los ganadores de dos partidos anteriores", msg: "Cada partido contiene los dos que lo alimentan, y la final es la raíz. Es un árbol binario." },
            { op: "fila", texto: "La fila de turnos de un banco", msg: "Correcto. Cada turno tiene uno antes y uno después, y ninguno contiene a otro: una cola le basta." },
            { op: "dom", texto: "Una página web: el cuerpo contiene secciones, que contienen párrafos y enlaces", msg: "Cada etiqueta contiene a las que abre dentro de ella. El navegador la guarda como un árbol." }
          ] }
      ]
    };
  }

  return { primero: PRIMERO, segundo: SEGUNDO, lista: lista, jefe: jefe, buscar: buscar, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
