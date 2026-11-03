/* Ejercicio interactivo: decidir si un arbol coloreado es rojinegro y, si
   no lo es, que regla rompe. La respuesta la da la revision del arbol. */
var EJERCICIO = (function () {
  var A = typeof module !== "undefined" ? require("./arbol-rn.js") : ArbolRN;

  var ARBOLES = {
    t1: "62N 31R 17N 48N 39R 80N 71R 93R",
    t2: "44R 22N 66N 55R 77R",
    t3: "62N 31N 17R 48R 39R 80N 71R 93R",
    t4: "30N 20N 45R 50N",
    t5: "36N 18R 9N 27N 54R 45N 72N 81R"
  };

  /* La opcion correcta segun la revision: "cumple" o "r2", "r4", "r5".
     Los arboles se escogieron para romper a lo sumo una regla. */
  function veredicto(clave) {
    var rotas = A.revisar(A.dePreorden(ARBOLES[clave])).rotas;
    return rotas.length === 0 ? "cumple" : "r" + rotas[0];
  }

  /* Las cuatro maneras de repintar el arbol t4 que se ofrecen. */
  var REPINTADOS = {
    a: "30N 20N 45R 50R",
    b: "30N 20N 45N 50R",
    c: "30N 20R 45R 50N",
    d: "30R 20N 45N 50N"
  };
  function repintadoValido() {
    var bueno = null;
    Object.keys(REPINTADOS).forEach(function (k) {
      if (A.revisar(A.dePreorden(REPINTADOS[k])).rotas.length === 0) { bueno = k; }
    });
    return bueno;
  }

  function conReglas(c) {
    c.html = REGLAS + A.LEYENDA + c.html;
    return c;
  }

  function dibujo(clave) {
    return A.svg(A.dePreorden(ARBOLES[clave]), { nil: true, escala: 0.9 });
  }

  function carta(clave, titulo, msgs) {
    return {
      tipo: "opciones", titulo: titulo, columna: true, correcta: veredicto(clave),
      html: "<p>¿Es rojinegro? Si no, ¿qué regla rompe?</p>" + dibujo(clave) +
            "<p class=\"nota\">Preorden: " + ARBOLES[clave] + "</p>",
      opciones: [
        { op: "cumple", texto: "Cumple las cinco reglas.", msg: msgs.cumple },
        { op: "r2", texto: "Rompe la regla 2, la de la raíz negra.", msg: msgs.r2 },
        { op: "r4", texto: "Rompe la regla 4, la de los hijos de un rojo.", msg: msgs.r4 },
        { op: "r5", texto: "Rompe la regla 5, la de los negros de cada camino.", msg: msgs.r5 }
      ]
    };
  }

  var REGLAS = "<p>Las reglas, a la mano:</p><ol><li>Todo nodo es rojo o negro.</li><li>La raíz es negra.</li><li>Toda hoja NIL es negra.</li><li>Si un nodo es rojo, sus dos hijos son negros.</li><li>Desde cada nodo, todos los caminos hasta las hojas NIL de abajo pasan por la misma cantidad de nodos negros.</li></ol>";

  function spec() {
    var bueno = repintadoValido();
    return {
      contenedor: "tarjetas",
      cierre: "<p>Para decidir se revisan tres cosas: la raíz negra, ningún rojo con un hijo rojo y la misma cantidad de negros en todos los caminos que bajan de cada nodo, contando las hojas NIL. Las NIL deciden casos que a simple vista parecen bien: un rojo con un solo hijo negro deja un camino corto por el lado del NIL. Un árbol con dos niveles rojos seguidos de negros puede cumplir; lo que no puede pasar es un rojo debajo de otro rojo.</p>",
      cartas: [
        conReglas(carta("t1", "Árbol 1", {
          cumple: "Correcto. Sin contar el 62, todo camino hasta un NIL pasa por 2 negros: por ejemplo 31, 17, NIL tiene 17 y NIL; 80, 71, NIL tiene 80 y NIL. El 39 y el 71 son rojos con hijos NIL.",
          r2: "La raíz, el 62, es negra.",
          r4: "Los rojos son el 31, el 39, el 71 y el 93, y ninguno tiene un hijo rojo: el 31 cuelga del 62 y sus hijos 17 y 48 son negros.",
          r5: "Cuente los negros de cada camino, incluido el NIL: 62 → 31 → 48 → 39 → NIL pasa por el 48 y el NIL; 62 → 80 → 93 → NIL, por el 80 y el NIL. Todos dan lo mismo." })),
        carta("t2", "Árbol 2", {
          cumple: "Mire la raíz.",
          r2: "Correcto. El 44 es rojo. El resto está bien: los negros cuadran y ningún rojo tiene hijo rojo.",
          r4: "El 44 es rojo, pero sus hijos 22 y 66 son negros, y el 55 y el 77 cuelgan del 66, negro.",
          r5: "Desde el 44, cada camino pasa por 2 negros: el 22 y el NIL, o el 66 y el NIL." }),
        carta("t3", "Árbol 3", {
          cumple: "Busque un rojo y mire sus hijos.",
          r2: "La raíz, el 62, es negra.",
          r4: "Correcto. El 48 es rojo y su hijo 39 también. Los negros sí cuadran: sin contar el 62, todos los caminos pasan por 2, el NIL incluido.",
          r5: "Cuente: 62 → 31 → 17 → NIL pasa por el 31 y el NIL; 62 → 31 → 48 → 39 → NIL, también por el 31 y el NIL. La falla es otra." }),
        carta("t4", "Árbol 4", {
          cumple: "Mire el 45: es rojo y tiene un solo hijo. Del otro lado cuelga un NIL.",
          r2: "La raíz, el 30, es negra.",
          r4: "El 45 es rojo y su único hijo, el 50, es negro; su otro hijo es un NIL, también negro. La regla 4 se cumple.",
          r5: "Correcto. Desde el 45, el camino a su NIL izquierdo pasa por 1 negro y el que baja por el 50, por 2. Desde la raíz pasa lo mismo: 30 → 20 → NIL cuenta 2 y 30 → 45 → 50 → NIL cuenta 2, pero 30 → 45 → NIL cuenta 1." }),
        carta("t5", "Árbol 5", {
          cumple: "Correcto. Rojos en el segundo nivel y en las hojas, nunca uno debajo de otro, y sin contar el 36, todo camino pasa por 2 negros, el NIL incluido.",
          r2: "La raíz, el 36, es negra.",
          r4: "El 18 y el 54 son rojos, pero sus hijos 9, 27, 45 y 72 son negros. El 81 es rojo y cuelga del 72, negro.",
          r5: "Cuente: 36 → 18 → 9 → NIL pasa por el 9 y el NIL; 36 → 54 → 72 → 81 → NIL, por el 72 y el NIL. Cuadran." }),
        { tipo: "opciones", titulo: "Repintar el árbol 4", columna: true, correcta: bueno,
          html: "<p>Sin mover ningún nodo del árbol 4, ¿qué coloración lo vuelve rojinegro?</p>",
          opciones: [
            { op: "a", texto: "30N 20N 45R 50R", msg: "El 50 rojo arregla la cuenta de negros, pero queda rojo bajo el 45, rojo: se rompe la regla 4." },
            { op: "b", texto: "30N 20N 45N 50R", msg: "Correcto. Ahora el 45 es negro y los caminos 45 → NIL y 45 → 50 → NIL pasan por un negro cada uno, sin contar el 45. Desde la raíz todos cuentan 2." },
            { op: "c", texto: "30N 20R 45R 50N", msg: "El 20 rojo le quita un negro al camino de la izquierda, pero el 45 sigue con caminos de 1 y de 2 negros." },
            { op: "d", texto: "30R 20N 45N 50N", msg: "La raíz roja rompe la regla 2, y además el camino 45 → 50 → NIL pasa por un negro más que 45 → NIL." }
          ] }
      ]
    };
  }

  return { ARBOLES: ARBOLES, REPINTADOS: REPINTADOS, veredicto: veredicto, repintadoValido: repintadoValido, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
