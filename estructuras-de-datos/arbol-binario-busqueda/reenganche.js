/* Ejercicio interactivo: la recursion de insertar paso a paso, con la pila
   de marcos y lo que cada marco asigna al volver la llamada. */
var EJERCICIO = (function () {
  var A = typeof module !== "undefined" ? require("./arbol.js") : ArbolBB;
  var CLAVES = [62, 30, 80, 15, 48, 71, 40];

  var CODIGO = [
    { txt: "raiz = insertar(raiz, k);          // en main", num: 8 },
    { txt: "", num: null },
    { txt: "Nodo *insertar(Nodo *r, int k) {", num: null },
    { txt: "  if (r == NULL) {", num: 1 },
    { txt: "    r = crearNodo(k, NULL, NULL);", num: 2 },
    { txt: "  } else if (k < r->dato) {", num: 3 },
    { txt: "    r->izq = insertar(r->izq, k);", num: 4 },
    { txt: "  } else if (k > r->dato) {", num: 5 },
    { txt: "    r->der = insertar(r->der, k);", num: 6 },
    { txt: "  }", num: null },
    { txt: "  return r;", num: 7 },
    { txt: "}", num: null }
  ];

  function nombre(x) {
    return x === null ? "NULL" : "nodo " + x.dato;
  }

  /* Simula raiz = insertar(raiz, k) sobre el arbol de CLAVES. Cada paso trae
     la linea, la pila de marcos (el tope al final), el arbol tal como esta
     enlazado en ese momento y las asignaciones hechas hasta ahi. */
  function simular(params) {
    var k = params.k;
    var raiz = A.armar(CLAVES);
    var pasos = [];
    var pila = [];
    var asignaciones = [];
    var suelto = null;
    var camino = [];

    function foto(linea, r, texto) {
      pasos.push({
        linea: linea,
        r: r === undefined ? null : (r === null ? "NULL" : String(r.dato)),
        k: k,
        marcos: pila.length,
        cambian: asignaciones.filter(function (a) { return a.cambia; }).length,
        pila: pila.map(function (m) { return m.texto; }),
        arbol: A.clonar(raiz),
        suelto: suelto,
        camino: camino.slice(),
        actual: r ? r.dato : null,
        texto: texto
      });
    }

    function llamar(r) {
      var marco = { texto: "insertar(" + nombre(r) + ", " + k + ")" };
      pila.push(marco);
      foto(1, r, "entra a insertar con r = " + nombre(r));
      if (r === null) {
        r = A.nodo(k);
        suelto = k;
        marco.texto = "insertar(NULL, " + k + "): crea el " + k;
        foto(2, null, "caso base: se crea el nodo del " + k + "; todavía nadie lo apunta");
      } else {
        camino.push(r.dato);
        if (k < r.dato) {
          foto(3, r, k + " < " + r.dato + ": se baja a la izquierda");
          marco.texto = "insertar(" + nombre(r) + ", " + k + "): r->izq = ?";
          foto(4, r, "llama con r->izq = " + nombre(r.izq) + " y espera");
          var antesI = r.izq;
          var nuevoI = llamar(r.izq);
          r.izq = nuevoI;
          asignaciones.push({ donde: r.dato, lado: "izq", cambia: antesI !== nuevoI });
          marco.texto = "insertar(" + nombre(r) + ", " + k + "): r->izq = " + nombre(nuevoI);
          if (suelto === nuevoI.dato && antesI === null) { suelto = null; }
          foto(4, r, antesI !== nuevoI ? "r->izq del " + r.dato + " pasa de NULL a " + nombre(nuevoI) + ": este es el enganche" :
            "r->izq del " + r.dato + " recibe " + nombre(nuevoI) + ", el valor que ya tenía");
        } else {
          foto(3, r, k + " < " + r.dato + " es falso");
          if (k > r.dato) {
            foto(5, r, k + " > " + r.dato + ": se baja a la derecha");
            marco.texto = "insertar(" + nombre(r) + ", " + k + "): r->der = ?";
            foto(6, r, "llama con r->der = " + nombre(r.der) + " y espera");
            var antesD = r.der;
            var nuevoD = llamar(r.der);
            r.der = nuevoD;
            asignaciones.push({ donde: r.dato, lado: "der", cambia: antesD !== nuevoD });
            marco.texto = "insertar(" + nombre(r) + ", " + k + "): r->der = " + nombre(nuevoD);
            if (suelto === nuevoD.dato && antesD === null) { suelto = null; }
            foto(6, r, antesD !== nuevoD ? "r->der del " + r.dato + " pasa de NULL a " + nombre(nuevoD) + ": este es el enganche" :
              "r->der del " + r.dato + " recibe " + nombre(nuevoD) + ", el valor que ya tenía");
          } else {
            foto(5, r, k + " > " + r.dato + " es falso: el " + k + " ya está y no se baja");
          }
        }
      }
      foto(7, r, "devuelve " + nombre(r));
      pila.pop();
      return r;
    }

    pila.push({ texto: "main: raiz = ?" });
    foto(8, undefined, "main llama a insertar con la raíz, el " + raiz.dato);
    var antes = raiz;
    var nueva = llamar(raiz);
    raiz = nueva;
    asignaciones.push({ donde: "main", lado: "raiz", cambia: antes !== nueva });
    pila[0].texto = "main: raiz = " + nombre(nueva);
    foto(8, undefined, "main guarda en raiz el " + nombre(nueva) + ", el mismo que ya tenía");
    pasos.final = { arbol: raiz, asignaciones: asignaciones };
    return pasos;
  }

  /* Resumen de una insercion: asignaciones, las que cambian y el mayor numero de marcos. */
  function resumen(k) {
    var pasos = simular({ k: k });
    var asig = pasos.final.asignaciones;
    var cambia = asig.filter(function (a) { return a.cambia; });
    var hondo = 0;
    pasos.forEach(function (p) { if (p.marcos > hondo) { hondo = p.marcos; } });
    return {
      asignaciones: asig.length, cambian: cambia.length,
      donde: cambia.length > 0 ? cambia[0].donde : null, lado: cambia.length > 0 ? cambia[0].lado : null,
      marcos: hondo, preorden: A.preorden(pasos.final.arbol)
    };
  }

  function spec() {
    var r44 = resumen(44);
    var r90 = resumen(90);
    var r48 = resumen(48);
    return {
      contenedor: "tarjetas",
      cierre: "<p>Al bajar, cada marco deja pendiente una asignación: <code>r->izq = ?</code> o <code>r->der = ?</code>. El caso base crea el nodo y devuelve su dirección; el marco de su padre la guarda en el hijo por el que bajó, y esa es la única asignación que cambia algo. Las demás reescriben el valor que ya había. Con eso no hace falta preguntar por el padre, y el mismo código sirve para el árbol vacío, donde la asignación que cambia es la de <code>raiz</code> en main. Si a la llamada le falta su asignación, el nodo se crea y nadie lo apunta: no queda en el árbol y su memoria no se puede liberar.</p>",
      cartas: [
        { tipo: "respuesta", titulo: "Las asignaciones al subir",
          html: "<p>Con k = 44, cuente todas las asignaciones de puntero que se ejecutan al volver las llamadas, incluida la de <code>raiz</code> en main. ¿Cuántas cambian el valor del puntero?</p>",
          campos: [
            { rotulo: "asignaciones:", esperado: String(r44.asignaciones), ancho: "3rem" },
            { rotulo: "cambian:", esperado: String(r44.cambian), ancho: "3rem" }
          ],
          bien: "Correcto: se asigna en el 62, el 30, el 48, el 40 y en main. Solo cambia el r->der del 40, que era NULL y pasa a apuntar al 44.",
          distractores: [
            { valores: ["4", null], msg: "Falta la de main: raiz = insertar(raiz, k) también asigna, aunque aquí ponga el mismo nodo 62." },
            { valores: [null, "5"], msg: "Los punteros del 62, el 30 y el 48 ya apuntaban al nodo que les devuelven. Solo el del 40 era NULL." }
          ],
          otro: "Un marco por cada nodo del camino 62, 30, 48, 40, y cada uno asigna una vez al volver. Sume la de main." },
        { tipo: "respuesta", titulo: "La pila en el momento más hondo",
          html: "<p>Con k = 44, ¿cuántos marcos hay en la pila, contando el de main, en el momento en que se crea el nodo?</p>",
          campos: [{ rotulo: "marcos:", esperado: String(r44.marcos), ancho: "3rem" }],
          bien: "Correcto: main, los cuatro marcos de 62, 30, 48 y 40, y encima insertar(NULL, 44).",
          distractores: [
            { valores: ["5"], msg: "Cuente también el de main, que espera para asignar raiz." },
            { valores: ["4"], msg: "Además de los cuatro nodos del camino están el caso base, insertar(NULL, 44), y el de main." }
          ],
          otro: "Ejecute con el botón Al final y mire la pila en el paso donde se crea el nodo." },
        { tipo: "respuesta", titulo: "Otra clave: el 90",
          html: "<p>Cambie la clave a 90. ¿El puntero de qué nodo cambia, y cuál de sus dos punteros?</p>",
          campos: [
            { rotulo: "nodo:", esperado: String(r90.donde), ancho: "3.5rem" },
            { rotulo: "puntero:", esperado: r90.lado, pista: "izq o der", ancho: "5.5rem" }
          ],
          bien: "Correcto: 90 > 62 y 90 > 80, y el hijo derecho del 80 era NULL. Esta vez la pila llega a " + r90.marcos + " marcos contando main.",
          distractores: [
            { valores: ["71", null], msg: "90 > 80 baja a la derecha del 80; el 71 está a su izquierda." }
          ],
          otro: "Siga el camino del 90: el puntero que cambia es el NULL donde se cae la búsqueda." },
        { tipo: "respuesta", titulo: "Una clave que ya está",
          html: "<p>Con k = 48, ¿cuántas asignaciones cambian algo y cuántos nodos tiene el árbol al final?</p>",
          campos: [
            { rotulo: "cambian:", esperado: String(r48.cambian), ancho: "3rem" },
            { rotulo: "nodos:", esperado: String(r48.preorden.length), ancho: "3rem" }
          ],
          bien: "Correcto: en el nodo del 48 ninguna comparación se cumple, insertar devuelve r tal como llegó, y cada marco de arriba vuelve a guardar el valor que tenía.",
          distractores: [
            { valores: ["1", null], msg: "No se crea ningún nodo, así que ningún NULL se reemplaza: todas las asignaciones repiten el valor." },
            { valores: [null, "8"], msg: "insertar solo crea un nodo en el caso base, y con el 48 nunca llega a NULL." }
          ],
          otro: "Ejecute con k = 48 y mire la columna cambian." },
        { tipo: "opciones", titulo: "Sin la asignación", columna: true, correcta: "fuga",
          html: "<p>Alguien escribe la línea 6 como <code>insertar(r->der, k);</code>, sin <code>r->der =</code> delante, e inserta el 90. ¿Qué pasa?</p>",
          opciones: [
            { op: "fuga", texto: "El nodo del 90 se crea, pero el 80 sigue con der en NULL: el 90 no aparece en el árbol y su memoria se pierde.", msg: "Correcto. La llamada recibe una copia del puntero; asignarle el nodo nuevo a esa copia no toca el r->der del 80." },
            { op: "igual", texto: "Funciona igual: r es un puntero, así que la llamada modifica el árbol.", msg: "r es un puntero pasado por valor: la llamada cambia su copia local, que desaparece al volver. Lo que se modifica a través de r es el nodo apuntado, y aquí no hay nodo: r es NULL." },
            { op: "compila", texto: "No compila: insertar devuelve un Nodo * que nadie recibe.", msg: "C++ deja ignorar lo que devuelve una función. Compila, y el error aparece al ejecutar." }
          ] },
        { tipo: "opciones", titulo: "El árbol vacío", columna: true, correcta: "nulo",
          html: "<p>Con <code>Nodo *raiz = NULL;</code>, main llama <code>insertar(raiz, 62);</code> sin asignar. ¿Qué queda en <code>raiz</code>?</p>",
          opciones: [
            { op: "nulo", texto: "NULL: el nodo del 62 se creó, pero su dirección no se guardó en ninguna parte.", msg: "Correcto. Con el árbol vacío, la asignación que cambia es justamente la de main." },
            { op: "62", texto: "El nodo del 62: insertar lo creó.", msg: "Lo creó y devolvió su dirección; si main no la guarda en raiz, raiz sigue en NULL." }
          ] }
      ]
    };
  }

  return { claves: CLAVES, codigo: CODIGO, simular: simular, resumen: resumen, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var A = ArbolBB;
    function alPintar(e) {
      var p = e.actual;
      var cajaArbol = document.getElementById("panel-arbol");
      var cajaPila = document.getElementById("panel-pila");
      var nota = document.getElementById("texto-paso");
      if (p === null) {
        var r0 = A.armar(EJERCICIO.claves);
        cajaArbol.innerHTML = A.svg(r0, { columnas: 9 });
        cajaPila.innerHTML = "";
        nota.textContent = "Pulse el botón Un paso para empezar.";
      } else {
        var marcas = {};
        p.camino.forEach(function (c) { marcas[c] = "visto"; });
        if (p.actual !== null) { marcas[p.actual] = "resal"; }
        var aristas = {};
        p.camino.slice(1).forEach(function (c) { aristas[c] = "camino"; });
        var op = { marcas: marcas, aristas: aristas, columnas: 9 };
        if (p.suelto === null && A.camino(p.arbol, e.params.k).esta && EJERCICIO.claves.indexOf(e.params.k) < 0) {
          marcas[e.params.k] = "resal";
          aristas[e.params.k] = "nueva";
        }
        cajaArbol.innerHTML = A.svg(p.arbol, op);
        var html = "";
        var i = p.pila.length - 1;
        while (i >= 0) {
          var clase = "marco" + (i === p.pila.length - 1 ? " tope" : "") + (i === 0 ? " main" : "");
          html = html + "<div class=\"" + clase + "\">" + p.pila[i].replace("?", "<b>?</b>") + "</div>";
          i = i - 1;
        }
        if (p.suelto !== null) {
          html = html + "<div class=\"nota\">El nodo del " + p.suelto + " existe, pero ningún puntero del árbol lo apunta todavía.</div>";
        }
        cajaPila.innerHTML = html;
        nota.textContent = p.texto;
      }
    }

    Motor.iniciar({
      codigo: EJERCICIO.codigo,
      simular: EJERCICIO.simular,
      chips: [
        { campo: "k", rotulo: "k" },
        { campo: "r", rotulo: "r" },
        { campo: "marcos", rotulo: "marcos" },
        { campo: "cambian", rotulo: "cambian", clase: "cuenta" }
      ],
      paramsIniciales: { k: 44 },
      alPintar: alPintar
    });

    Array.prototype.forEach.call(document.querySelectorAll("#claves-k button"), function (b) {
      b.addEventListener("click", function () {
        document.getElementById("ver-k").textContent = b.getAttribute("data-k");
        Motor.reiniciar({ k: parseInt(b.getAttribute("data-k"), 10) });
      });
    });

    Tarjetas.montar(EJERCICIO.spec());
  })();
}
