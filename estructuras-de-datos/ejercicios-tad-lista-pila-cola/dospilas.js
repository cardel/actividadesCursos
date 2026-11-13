/* Ejercicio interactivo: una cola hecha con dos pilas. */
var EJERCICIO = (function () {
  /* La secuencia de operaciones de la carta. */
  var OPERACIONES = [
    ["encolar", 3], ["encolar", 8], ["encolar", 1], ["frente"], ["desencolar"],
    ["encolar", 5], ["encolar", 9], ["frente"], ["desencolar"], ["desencolar"], ["frente"]
  ];

  /* Simula ColaDP: devuelve lo que responde cada frente y cuantos trasvases hubo. */
  function simular(ops) {
    var entrada = [];
    var salida = [];
    var respuestas = [];
    var trasvases = 0;
    var estados = [];
    function trasvasar() {
      while (entrada.length > 0) { salida.push(entrada.pop()); }
      trasvases = trasvases + 1;
    }
    ops.forEach(function (op) {
      if (op[0] === "encolar") { entrada.push(op[1]); }
      else if (op[0] === "frente") {
        if (salida.length === 0) { trasvasar(); }
        respuestas.push(salida[salida.length - 1]);
      } else {
        if (salida.length === 0) { trasvasar(); }
        salida.pop();
      }
      estados.push({ op: op.join(" "), entrada: entrada.slice(), salida: salida.slice() });
    });
    return { respuestas: respuestas, trasvases: trasvases, estados: estados };
  }

  /* Lo que responderia quien confunde la cola con una pila, y los conteos ingenuos de trasvases. */
  function contarDistractores(ops) {
    var encolados = ops.filter(function (op) { return op[0] === "encolar"; }).map(function (op) { return op[1]; });
    var frentes = ops.filter(function (op) { return op[0] === "frente"; }).length;
    var desencolares = ops.filter(function (op) { return op[0] === "desencolar"; }).length;
    return { ultimoEncolado: encolados[2], segundoEncolado: encolados[1], frentes: frentes, consultas: frentes + desencolares };
  }

  return { operaciones: OPERACIONES, simular: simular, distractores: contarDistractores(OPERACIONES) };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    function pintarCodigo(id, lineas) {
      var caja = document.getElementById(id);
      lineas.forEach(function (par, i) {
        var linea = document.createElement("div");
        linea.className = "linea" + (par[1] ? " " + par[1] : "");
        var num = document.createElement("span");
        num.className = "num";
        num.textContent = i + 1;
        var txt = document.createElement("span");
        txt.className = "txt";
        txt.textContent = par[0];
        linea.appendChild(num);
        linea.appendChild(txt);
        caja.appendChild(linea);
      });
    }

    pintarCodigo("codigo-ops", EJERCICIO.operaciones.map(function (op, i) {
      var texto = op[0] === "encolar" ? "c.encolar(" + op[1] + ");" : "c." + op[0] + "();";
      if (op[0] === "frente") { texto = "printf(\"%d\\n\", c.frente());"; }
      return [texto, op[0] === "frente" ? "bloque-2" : (op[0] === "encolar" ? "bloque-1" : "")];
    }));

    var r = EJERCICIO.simular(EJERCICIO.operaciones);

    /* Una opcion cuyo valor ya salio antes se descarta: nunca dos botones iguales. */
    function unicas(lista) {
      var vistos = [];
      return lista.filter(function (o) {
        var nueva = vistos.indexOf(o.valor) < 0;
        if (nueva) { vistos.push(o.valor); }
        return nueva;
      });
    }
    /* Avisa cada vez que el estudiante acierta en el contenedor de opciones. */
    function alAcertar(idOpciones, f) {
      document.getElementById(idOpciones).addEventListener("click", function (e) {
        if (e.target && e.target.getAttribute("data-op") === "correcta") { f(); }
      });
    }

    var D = EJERCICIO.distractores;
    var hechos = [false, false, false, false];
    function revelarTabla() {
      document.getElementById("tabla-dp").style.display = "block";
      var cuerpo = document.getElementById("cuerpo-dp");
      cuerpo.innerHTML = "";
      r.estados.forEach(function (e) {
        var fila = document.createElement("tr");
        [e.op, "⟨" + e.entrada.join(" ") + "⟩", "⟨" + e.salida.join(" ") + "⟩"].forEach(function (c) {
          var td = document.createElement("td");
          td.textContent = c;
          fila.appendChild(td);
        });
        cuerpo.appendChild(fila);
      });
    }
    function conectar(k, lista) {
      var sufijo = k === 3 ? "tras" : String(k);
      Motor.opcionesNumericas("opciones-dp-" + sufijo, "veredicto-dp-" + sufijo, function () { return unicas(lista()); });
      alAcertar("opciones-dp-" + sufijo, function () {
        hechos[k] = true;
        if (hechos.every(function (x) { return x; })) { revelarTabla(); }
      });
    }
    conectar(0, function () {
      return [
        { valor: r.respuestas[0], clave: "correcta",
          razon: "Correcto: 3. El primer frente trasvasa 3, 8 y 1 a salida, y el 3, que entró primero, queda en el tope." },
        { valor: D.ultimoEncolado, clave: "pila",
          razon: "Es una cola: el primero en entrar sale primero. Al trasvasar, el 3 que entró primero queda en el tope de salida." },
        { valor: D.segundoEncolado, clave: "segundo",
          razon: "El 8 es el segundo en entrar. El frente es el primero, y tras el trasvase está en el tope de salida." }
      ];
    });
    conectar(1, function () {
      return [
        { valor: r.respuestas[1], clave: "correcta",
          razon: "Correcto: 8. Después del primer desencolar, salida aún guarda al 8 y al 1; el 5 y el 9 esperan en entrada y no hay trasvase." },
        { valor: 5, clave: "nuevo5",
          razon: "El 5 es el primero de los que entraron después, pero sigue en entrada. Después del primer desencolar, salida aún guarda al 8 y al 1, y el frente es el 8." },
        { valor: 9, clave: "nuevo9",
          razon: "El 9 es lo último que entró, y eso sería el tope de una pila. Salida aún guarda al 8 y al 1; el 9 se queda en entrada." },
        { valor: 3, clave: "viejo",
          razon: "El 3 ya salió con el primer desencolar. El frente es ahora el siguiente en entrar, el 8." }
      ];
    });
    conectar(2, function () {
      return [
        { valor: r.respuestas[2], clave: "correcta",
          razon: "Correcto: 5. Los dos desencolar vaciaron salida; el frente trasvasa 5 y 9 y el 5, que entró antes, queda en el tope." },
        { valor: 9, clave: "pila",
          razon: "El 9 es lo último que entró. En el trasvase se invierte el orden, y el 5 queda en el tope de salida." },
        { valor: 1, clave: "salido",
          razon: "El 1 ya salió con el último desencolar: salida quedó vacía y por eso el frente tiene que trasvasar." }
      ];
    });
    conectar(3, function () {
      return [
        { valor: r.trasvases, clave: "correcta",
          razon: "Correcto: 2. El primer frente trasvasa 3, 8 y 1; el último frente, con salida vacía, trasvasa el 5 y el 9. El segundo frente no trasvasa porque salida aún tiene al 8 y al 1; cada elemento se trasvasa una sola vez." },
        { valor: 1, clave: "uno",
          razon: "Hay un segundo trasvase: después del tercer desencolar, salida queda vacía y el último frente tiene que traer los dos que esperaban en entrada." },
        { valor: D.frentes, clave: "frentes",
          razon: "Eso es una por cada frente. No se trasvasa en cada frente: solo cuando salida está vacía, y en el segundo todavía hay elementos." },
        { valor: D.consultas, clave: "todas",
          razon: "Esas son todas las llamadas a frente y desencolar juntas. Ninguna trasvasa si salida tiene algo, y casi siempre lo tiene." }
      ];
    });
  })();
}
