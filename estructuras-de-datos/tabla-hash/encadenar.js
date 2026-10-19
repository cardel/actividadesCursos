/* Ejercicio interactivo: insertar con encadenamiento, colgando al frente. */
var EJERCICIO = (function () {
  var M = 5;
  var CLAVES = [12, 7, 20, 3, 17, 5];

  function nueva(m) {
    var t = [];
    var i = 0;
    while (i < m) { t.push([]); i = i + 1; }
    return t;
  }

  /* Cada lista se guarda de la cabeza al final. */
  function insertar(t, k) {
    t[k % t.length].unshift(k);
  }

  function dibujar(t, resaltada) {
    return t.map(function (l, i) {
      var nodos = l.map(function (k, j) {
        return (i === resaltada && j === 0) ? "[" + k + "]" : String(k);
      });
      return i + ": " + (nodos.length === 0 ? "NULL" : nodos.join(" → ") + " → NULL");
    }).join("\n");
  }

  /* Estados después de cada inserción. */
  function pasos() {
    var t = nueva(M);
    var res = [{ texto: "la tabla vacía: las " + M + " cabezas en NULL", tabla: dibujar(t, -1) }];
    CLAVES.forEach(function (k) {
      insertar(t, k);
      res.push({ texto: "insertar " + k + ": h(" + k + ") = " + k + " mod " + M + " = " + (k % M) + "; el nodo nuevo, entre corchetes, queda de primero", tabla: dibujar(t, k % M) });
    });
    return { estados: res, final: t };
  }

  function spec() {
    var r = pasos();
    var t = r.final;
    var vacias = t.filter(function (l) { return l.length === 0; }).length;
    var alfa = CLAVES.length / M;
    return {
      contenedor: "tarjetas",
      cierre: "Insertar con encadenamiento es calcular h(k) y colgar el nodo al frente de la lista de esa casilla: dos punteros, Θ(1), sin importar el largo de la lista. Por eso la última clave insertada en cada casilla queda de primera. El factor de carga α = n/m es el largo promedio de las listas; aquí hay casillas vacías y una lista que mide más que α.",
      cartas: [
        { tipo: "pasos", titulo: "Seis inserciones con m = " + M,
          html: "<p>Claves " + CLAVES.join(", ") + ", en ese orden, con h(k) = k mod " + M + ".</p>",
          pasos: r.estados.map(function (e) { return { texto: e.texto, html: "<pre class=\"fragmento\">" + e.tabla + "</pre>" }; }) },
        { tipo: "respuesta", titulo: "La lista más larga",
          html: "<p>Sin mirar los pasos, escriba la lista de la casilla 2 al final, de la cabeza hacia el final.</p>",
          campos: [{ rotulo: "casilla 2:", esperado: t[2].join(" "), pista: "a b c", ancho: "8rem" }],
          bien: "Correcto: 12 entró primero y quedó al final; 17 entró de último y quedó en la cabeza.",
          distractores: [
            { valores: ["12 7 17"], msg: "Esa es la lista colgando al final. Cada nodo nuevo entra al frente: el último en llegar queda de primero." }
          ],
          otro: "Las claves de la casilla 2 son las que dejan residuo 2 al dividir entre 5." },
        { tipo: "respuesta", titulo: "Carga",
          html: "<p>Con la tabla final: ¿cuántas casillas quedaron vacías y cuánto vale el factor de carga α = n/m? Escriba α con punto decimal.</p>",
          campos: [
            { rotulo: "vacías:", esperado: String(vacias), ancho: "3.5rem" },
            { rotulo: "α =", esperado: String(alfa), ancho: "4rem" }
          ],
          bien: "Correcto: las casillas 1 y 4 quedaron vacías, y α = 6/5 = 1,2. La lista de la casilla 2 mide 3, más del doble del promedio.",
          distractores: [
            { valores: [null, "0.83"], msg: "α es n/m: claves entre casillas, 6/5, no al revés." }
          ],
          otro: "Cuente las casillas sin nodos. α es el número de claves dividido entre el de casillas." },
        { tipo: "opciones", titulo: "Una clave que ya estaba", columna: true, correcta: "buscar",
          html: "<p>Después de las seis, llega otra vez el 7. La tabla no admite claves repetidas. ¿Qué debe hacer <code>insertar</code>?</p>",
          opciones: [
            { op: "buscar", texto: "Buscar 7 en la lista de la casilla 2 y no insertarlo si está", msg: "Correcto. Insertar sin repetir cuesta lo que la búsqueda, Θ(1 + α) en promedio, y el colgado al frente sigue siendo Θ(1)." },
            { op: "frente", texto: "Colgarlo al frente: la búsqueda lo encontrará primero", msg: "Quedaría dos veces en la lista. Al eliminar 7 se borraría uno y el otro seguiría ahí." },
            { op: "tabla", texto: "Recorrer la tabla entera para ver si está", msg: "El 7 solo puede estar en la casilla h(7) = 2. Basta con esa lista." }
          ] }
      ]
    };
  }

  return { m: M, claves: CLAVES, pasos: pasos, dibujar: dibujar, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
