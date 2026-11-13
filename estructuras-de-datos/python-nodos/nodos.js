/* Ejercicio interactivo: la lista enlazada y la pila sobre nodos, en Python.
   Las clases son las de la sesión (lista_nodos.py y pila_nodos.py); la
   simulación hace lo mismo que sus métodos, y cada programa se corrió con
   python3 y la salida coincide con la que se calcula aquí. */
var EJERCICIO = (function () {
  var P = typeof module !== "undefined" ? require("../python-contenedores/py.js") : Py;

  /* Una cadena de nodos en SVG: nombre -> [dato | siguiente] -> ... -> None.
     marcas {i: "nueva" | "sale" | "mira"}; suelto: nodo fuera de la cadena. */
  function dibujoCadena(nombre, vals, marcas, suelto) {
    marcas = marcas || {};
    var W = 40, H = 32, PASO = 104, x0 = 90, y0 = 22;
    var partes = P.rotulo(10, y0 + H / 2 + 4, nombre, "#1f5fa8", "start");
    var x = x0;
    partes = partes + P.flecha(10 + nombre.length * 8, y0 + H / 2, x0 - 4, y0 + H / 2);
    vals.forEach(function (v, i) {
      partes = partes + P.caja(x, y0, W, H, String(v), marcas[i]);
      partes = partes + P.caja(x + W, y0, 22, H, "", marcas[i]);
      partes = partes + "<circle cx=\"" + (x + W + 11) + "\" cy=\"" + (y0 + H / 2) + "\" r=\"3\" fill=\"#24292f\"/>";
      partes = partes + P.flecha(x + W + 11, y0 + H / 2, x + PASO - 4, y0 + H / 2);
      x = x + PASO;
    });
    partes = partes + P.rotulo(x + 4, y0 + H / 2 + 4, "None", "#6b7280", "start");
    var alto = y0 + H + 14;
    if (suelto) {
      partes = partes + P.caja(suelto.x, y0 + 56, W, H, String(suelto.dato), "sale");
      partes = partes + P.caja(suelto.x + W, y0 + 56, 22, H, "", "sale");
      partes = partes + P.rotulo(suelto.x + W + 30, y0 + 76, suelto.texto, "#b3261e", "start");
      alto = y0 + 56 + H + 12;
    }
    var ancho = Math.max(x + 60, 260);
    if (suelto) { ancho = Math.max(ancho, suelto.x + 380); }
    return P.svg(ancho, alto, partes, nombre);
  }

  /* Lista: insertar(p, e) y eliminar(p), contando los pasos de nodo_en. */
  var OPS = [["insertar", 0, 4], ["insertar", 0, 9], ["insertar", 2, 6], ["insertar", 1, 3], ["eliminar", 2]];

  function pasosLista() {
    var l = [];
    var pasos = [{ html: dibujoCadena("cabeza", []), texto: "l = Lista(): cabeza = None, n = 0" }];
    OPS.forEach(function (o) {
      var marcas = {};
      if (o[0] === "insertar") {
        var p = o[1];
        l.splice(p, 0, o[2]);
        marcas[p] = "nueva";
        if (p > 0) { marcas[p - 1] = "mira"; }
        var t = "insertar(" + p + ", " + o[2] + "): " + (p === 0
          ? "el nuevo nodo apunta a la cabeza vieja y pasa a ser la cabeza"
          : "nodo_en(" + (p - 1) + ") camina " + (p - 1) + " paso" + (p - 1 === 1 ? "" : "s") + " hasta el anterior, el " + l[p - 1] + "; el nuevo apunta a lo que seguía y el anterior apunta al nuevo");
        pasos.push({ html: dibujoCadena("cabeza", l, marcas), texto: t + "; n = " + l.length });
      } else {
        var q = o[1];
        var antes = l.slice();
        var m0 = {};
        m0[q] = "sale";
        m0[q - 1] = "mira";
        pasos.push({ html: dibujoCadena("cabeza", antes, m0), texto: "eliminar(" + q + "): el anterior, el " + antes[q - 1] + ", pasa a apuntar al que sigue del " + antes[q] });
        l.splice(q, 1);
        pasos.push({ html: dibujoCadena("cabeza", l, {}, { x: 90 + 104 * q, dato: antes[q], texto: "sin referencias: Python lo libera" }), texto: "el " + antes[q] + " queda fuera de la cadena; n = " + l.length });
      }
    });
    return pasos;
  }

  var CODIGO_PILA = [
    "from pila_nodos import Pila",
    "",
    "p = Pila()",
    "for x in [5, 2, 7]:",
    "    p.apilar(x)",
    "p.desapilar()",
    "p.apilar(p.tope() * 10)",
    "print(p.tope(), p.tamano())"
  ];

  function pila() {
    var cima = [];
    [5, 2, 7].forEach(function (x) { cima.push(x); });
    cima.pop();
    cima.push(cima[cima.length - 1] * 10);
    return cima[cima.length - 1] + " " + cima.length;
  }

  /* Pasos de nodo_en(p) para cada obtener(p), p = 0 .. n - 1. */
  function pasosObtener(n) {
    var total = 0;
    var p = 0;
    while (p < n) {
      total = total + p;
      p = p + 1;
    }
    return total;
  }

  function spec() {
    var pl = pila();
    var t8 = pasosObtener(8);
    return {
      contenedor: "tarjetas",
      cierre: "<p>En Python cada variable ya es una referencia: el campo <code>siguiente</code> guarda la del otro nodo y <code>None</code> hace de <code>NULL</code>. Insertar o eliminar en la posición p camina p − 1 nodos hasta el anterior y reenlaza en Θ(1); en la cabeza, como en la pila, no camina nada. El nodo que ya nadie referencia lo libera el intérprete, así que no hay <code>delete</code>, pero el orden de las asignaciones importa igual que en C++.</p>",
      cartas: [
        { tipo: "pasos", titulo: "Una lista enlazada, operación por operación",
          html: P.codigo(["l = Lista()", "l.insertar(0, 4)", "l.insertar(0, 9)", "l.insertar(2, 6)", "l.insertar(1, 3)", "l.eliminar(2)"]) +
            "<p>En naranja el nodo nuevo, en azul el anterior que se reenlaza y en rojo el que sale.</p>",
          pasos: pasosLista() },
        { tipo: "respuesta", titulo: "Lo que imprime la pila",
          html: P.codigo(CODIGO_PILA),
          campos: [{ rotulo: "imprime:", esperado: pl, ancho: "5rem" }],
          bien: "Correcto. Después de apilar 5, 2 y 7 la cima es el 7; desapilar la pasa al 2; se apila 2 · 10 = 20. Quedan 20, 2 y 5: tres nodos.",
          distractores: [
            { valores: ["70 3"], msg: "desapilar quitó el 7 antes: tope() es el 2 cuando se calcula el nuevo valor." },
            { valores: ["20 4"], msg: "Entraron cuatro y salió uno: quedan tres." },
            { valores: ["50 3"], msg: "La cima es el último que entró, no el primero." }
          ],
          otro: "Dibuje la cadena desde la cima después de cada línea." },
        { tipo: "opciones", titulo: "Reenlazar en otro orden", columna: true, correcta: "ciclo",
          html: "<p>Alguien escribe así la rama <code>else</code> de <code>insertar</code>:</p>" +
            P.codigo(["anterior = self.nodo_en(p - 1)", "nuevo = Nodo(e, None)", "anterior.siguiente = nuevo", "nuevo.siguiente = anterior.siguiente"]) +
            "<p>¿Qué pasa con la lista?</p>",
          opciones: [
            { op: "ciclo", texto: "El nuevo nodo apunta a sí mismo y los que seguían se pierden", msg: "Correcto. Cuando corre la cuarta línea, anterior.siguiente ya es el nuevo. Recorrer la lista no termina nunca, y sin ninguna referencia a ellos, los nodos de después los libera el intérprete. Primero se enlaza el nuevo con lo que sigue y después el anterior con el nuevo." },
            { op: "pierde", texto: "Se pierde el nodo nuevo", msg: "El nuevo sí queda enlazado desde el anterior. Lo que se pierde es lo que venía después." }
          ,
            { op: "bien", texto: "Queda bien: hace lo mismo en cuatro líneas", msg: "La tercera línea ya cambió anterior.siguiente. La cuarta lee ese valor nuevo, no el viejo." }] },
        { tipo: "opciones", titulo: "Pasos de nodo_en", columna: true, correcta: "bien",
          html: P.codigo(["# l es una Lista con 8 elementos", "suma = 0", "p = 0", "while p < l.tamano():", "    suma = suma + l.obtener(p)", "    p = p + 1"]) +
            "<p>Cada <code>obtener(p)</code> llama a <code>nodo_en(p)</code>, que ejecuta <code>actual = actual.siguiente</code> p veces. ¿Cuántas veces se ejecuta esa línea en todo el ciclo con 8 elementos, y cuántas con 100?</p>",
          opciones: [
            { op: "bien", texto: t8 + " con 8 y " + pasosObtener(100) + " con 100", msg: "Correcto. 0 + 1 + ⋯ + 7 = 28, y en general n(n − 1)/2: recorrer así cuesta Θ(n²). Con un ciclo que avance actual = actual.siguiente una vez por elemento cuesta Θ(n)." },
            { op: "hasta-n", texto: "36 con 8 y 5050 con 100", msg: "La suma no llega hasta n: obtener(0) no camina, porque la cabeza ya es el nodo 0, y el último obtener es el de p = n − 1. Va de 0 a 7 y de 0 a 99." },
            { op: "lineal", texto: "8 con 8 y 100 con 100", msg: "Eso sería un paso por elemento. Cada obtener vuelve a empezar desde la cabeza y camina p pasos." },
            { op: "mitad", texto: t8 + " con 8 y 5050 con 100", msg: "Con 8 está bien. Con 100 el último obtener es el de p = 99, que camina 99 pasos: la suma llega hasta 99, no hasta 100." }
          ] },
        { tipo: "opciones", titulo: "Sin delete", columna: true, correcta: "nadie",
          html: P.codigo(["def desapilar(self):", "    assert not self.vacia()", "    self.cima = self.cima.siguiente", "    self.n = self.n - 1"]) +
            "<p>En C++ <code>desapilar</code> guarda el nodo en <code>muerto</code> y lo borra con <code>delete</code>. ¿Qué pasa en Python con el nodo que era la cima?</p>",
          opciones: [
            { op: "fuga", texto: "Queda ocupando memoria hasta que termina el programa", msg: "Eso pasaría en C++ sin delete. En Python el intérprete lleva la cuenta de las referencias a cada objeto." },
            { op: "nadie", texto: "Nadie lo referencia, y el intérprete libera su memoria", msg: "Correcto. Después de self.cima = self.cima.siguiente ninguna variable apunta al nodo viejo, y Python lo libera solo." },
            { op: "error", texto: "Hay que borrarlo con del self.cima antes de mover la cima", msg: "del self.cima borraría el atributo de la pila, no el nodo, y la línea siguiente ya no tendría de dónde leer siguiente." }
          ] }
      ]
    };
  }

  return { spec: spec, pila: pila, pasosObtener: pasosObtener, pasosLista: pasosLista, CODIGO_PILA: CODIGO_PILA };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
