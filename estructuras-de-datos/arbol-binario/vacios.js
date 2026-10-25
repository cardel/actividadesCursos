/* Ejercicio interactivo: un árbol binario de nueve nodos armado con
   crearNodo, sus subárboles vacíos y lo que cambia al cruzar izq y der. */
var EJERCICIO = (function () {
  var A = (typeof Arbol !== "undefined") ? Arbol : require("../comun/arbol.js");
  var N = A.N;

  var CODIGO = [
    "Nodo *trece = crearNodo(13, NULL, NULL);",
    "Nodo *quince = crearNodo(15, trece, NULL);",
    "Nodo *doce = crearNodo(12, NULL, quince);",
    "Nodo *cuarentaCuatro = crearNodo(44, NULL, NULL);",
    "Nodo *cuarentaSiete = crearNodo(47, cuarentaCuatro, NULL);",
    "Nodo *cuarenta = crearNodo(40, NULL, cuarentaSiete);",
    "Nodo *veinticinco = crearNodo(25, NULL, NULL);",
    "Nodo *treintaUno = crearNodo(31, veinticinco, cuarenta);",
    "Nodo *raiz = crearNodo(20, doce, treintaUno);"
  ].join("\n");

  /* Las mismas llamadas, en el mismo orden. */
  function armar() {
    var trece = N(13, null, null);
    var quince = N(15, trece, null);
    var doce = N(12, null, quince);
    var cuarentaCuatro = N(44, null, null);
    var cuarentaSiete = N(47, cuarentaCuatro, null);
    var cuarenta = N(40, null, cuarentaSiete);
    var veinticinco = N(25, null, null);
    var treintaUno = N(31, veinticinco, cuarenta);
    return N(20, doce, treintaUno);
  }

  function contarVacios(r) {
    var res = 1;
    if (r !== null) { res = contarVacios(r.izq) + contarVacios(r.der); }
    return res;
  }

  function contar(r) {
    var res = { hojas: 0, unHijo: 0, dosHijos: 0 };
    A.nodos(r).forEach(function (x) {
      var hijos = (x.izq !== null ? 1 : 0) + (x.der !== null ? 1 : 0);
      if (hijos === 0) { res.hojas = res.hojas + 1; }
      if (hijos === 1) { res.unHijo = res.unHijo + 1; }
      if (hijos === 2) { res.dosHijos = res.dosHijos + 1; }
    });
    return res;
  }

  function spec() {
    var raiz = armar();
    var n = A.tamano(raiz);
    var vacios = contarVacios(raiz);
    var c = contar(raiz);
    var GRANDE = 1000;
    var codigo = "<pre class=\"fragmento\">" + A.escapar(CODIGO) + "</pre>";
    return {
      contenedor: "tarjetas",
      cierre: "Un árbol binario de n nodos tiene 2n punteros. Cada nodo menos la raíz recibe uno de su padre, así que n − 1 son aristas y los otros n + 1 valen NULL: siempre hay un vacío más que nodos. El árbol se arma de abajo hacia arriba porque crearNodo recibe los dos hijos ya hechos, y el lugar del argumento decide si el hijo queda a la izquierda o a la derecha.",
      cartas: [
        { tipo: "respuesta", titulo: "Nodos y vacíos",
          html: "<p>Estas nueve líneas arman el árbol del dibujo.</p>" + codigo + A.binario(raiz, { titulo: "árbol de nueve nodos con raíz 20" }) +
                "<p>¿Cuántos nodos tiene? ¿Cuántos punteros <code>izq</code> o <code>der</code> valen <code>NULL</code>, es decir, cuántos subárboles vacíos hay?</p>",
          campos: [
            { rotulo: "nodos:", esperado: String(n), ancho: "3.5rem" },
            { rotulo: "vacíos:", esperado: String(vacios), ancho: "3.5rem" }
          ],
          bien: "Correcto: " + n + " nodos y " + vacios + " vacíos. La tarjeta siguiente los dibuja.",
          distractores: [
            { valores: [null, String(n - 1)], msg: "Esos son los punteros que sí apuntan a un nodo: las aristas. Los vacíos son los demás." },
            { valores: [null, String(2 * n)], msg: "2n son todos los punteros del árbol, contando los que apuntan a un hijo." },
            { valores: [null, String(c.hojas * 2)], msg: "Contó los dos vacíos de cada hoja. Los nodos con un solo hijo también tienen un vacío." }
          ],
          otro: "Recorra los nodos y cuente, en cada uno, cuántos de sus dos punteros no llevan a ningún nodo." },
        { tipo: "pasos", titulo: "Los vacíos a la vista",
          pasos: [
            { texto: "los nueve nodos", html: A.binario(raiz, { titulo: "árbol sin vacíos" }) },
            { texto: "cada hijo que falta, como un cuadro gris: " + vacios + " vacíos", html: A.binario(raiz, { vacios: true, titulo: "árbol con sus vacíos" }) }
          ] },
        { tipo: "respuesta", titulo: "Cuántos hijos tiene cada nodo",
          html: "<p>¿Cuántas hojas tiene el árbol? ¿Cuántos nodos tienen exactamente un hijo? ¿Cuántos tienen dos?</p>",
          campos: [
            { rotulo: "hojas:", esperado: String(c.hojas), ancho: "3rem" },
            { rotulo: "un hijo:", esperado: String(c.unHijo), ancho: "3rem" },
            { rotulo: "dos hijos:", esperado: String(c.dosHijos), ancho: "3rem" }
          ],
          bien: "Correcto: hojas 13, 25 y 44; con un hijo 12, 15, 40 y 47; con dos, 20 y 31. Suman " + n + ", y las hojas son una más que los nodos con dos hijos.",
          distractores: [
            { valores: [null, "3", null], msg: "Revise el 15: tiene a 13 a la izquierda y nada a la derecha. También cuenta como nodo de un hijo." }
          ],
          otro: "Una hoja tiene sus dos punteros en NULL; un nodo de un hijo, exactamente uno." },
        { tipo: "respuesta", titulo: "Con mil nodos",
          html: "<p>Un árbol binario tiene " + GRANDE + " nodos, con la forma que sea. ¿Cuántos vacíos tiene? ¿Cuántas aristas?</p>",
          campos: [
            { rotulo: "vacíos:", esperado: String(GRANDE + 1), ancho: "4.5rem" },
            { rotulo: "aristas:", esperado: String(GRANDE - 1), ancho: "4.5rem" }
          ],
          bien: "Correcto. De los " + (2 * GRANDE) + " punteros, " + (GRANDE - 1) + " llevan a un hijo y " + (GRANDE + 1) + " valen NULL, sea el árbol una lista o esté lleno.",
          distractores: [
            { valores: ["1000", null], msg: "Siempre hay un vacío más que nodos: compruébelo con el de nueve nodos." },
            { valores: [null, "1000"], msg: "La raíz no recibe arista de nadie: son n − 1." }
          ],
          otro: "Con n nodos hay 2n punteros; cada nodo menos la raíz recibe exactamente uno." },
        { tipo: "opciones", titulo: "Los argumentos cruzados", columna: true, correcta: "otro",
          html: "<p>En la tercera línea alguien escribe <code>crearNodo(12, quince, NULL)</code> en lugar de <code>crearNodo(12, NULL, quince)</code>. ¿Qué pasa?</p>",
          opciones: [
            { op: "igual", texto: "Nada: 12 sigue siendo el padre de 15", msg: "Como árbol con raíz sería el mismo, pero un árbol binario distingue el hijo izquierdo del derecho. Este es otro árbol." },
            { op: "otro", texto: "Queda otro árbol binario: 15 pasa a ser hijo izquierdo de 12", msg: "Correcto. El segundo argumento es el subárbol izquierdo y el tercero el derecho; cambiarlos de lugar cambia el árbol." },
            { op: "compila", texto: "No compila", msg: "Los dos argumentos son Nodo *, uno con quince y otro con NULL: compila y arma un árbol distinto." }
          ] },
        { tipo: "opciones", titulo: "El orden de las líneas", columna: true, correcta: "cuarenta",
          html: "<p>¿Cuál de estas líneas tiene que ir antes de <code>Nodo *treintaUno = crearNodo(31, veinticinco, cuarenta);</code>?</p>",
          opciones: [
            { op: "raiz", texto: "La que crea la raíz 20", msg: "Al revés: la raíz necesita a treintaUno ya creado, porque lo recibe como hijo derecho." },
            { op: "cuarenta", texto: "La que crea el 40", msg: "Correcto. crearNodo recibe los hijos ya hechos: para crear el 31 hacen falta el 25 y el 40, y para el 40 hace falta el 47. El árbol se arma de las hojas hacia la raíz." },
            { op: "ninguna", texto: "Ninguna: el orden de las líneas no importa", msg: "Importa: la variable cuarenta tiene que existir y apuntar al nodo 40 antes de pasarla como argumento." }
          ] }
      ]
    };
  }

  return { codigo: CODIGO, armar: armar, contarVacios: contarVacios, contar: contar, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
