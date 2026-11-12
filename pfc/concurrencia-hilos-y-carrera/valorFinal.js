/* valorFinal: cuantos valores distintos puede imprimir el programa de dos
   hilos que incrementan la misma variable. Es el ejercicio 1 de consolidacion
   del deck de principios de concurrencia.
   Nada esta escrito a mano: las intercalaciones se generan mezclando las dos
   secuencias de dos pasos, respetando el orden interno de cada hilo, y el
   valor final de cada una sale de ejecutar los pasos sobre un estado. Salen 6
   intercalaciones y 3 valores distintos: 1, 10 y 11. */
(function () {

  var CODIGO = [
    "var x = 0",
    "",
    "val A = thread {",
    "  val a = x        // A1",
    "  x = a + 1        // A2",
    "}",
    "val B = thread {",
    "  val b = x        // B1",
    "  x = b + 10       // B2",
    "}",
    "A.join(); B.join()",
    "println(x)"
  ];

  var HILO_A = [
    { id: "A1", rotulo: "A1: a = x", correr: function (e) { e.a = e.x; } },
    { id: "A2", rotulo: "A2: x = a + 1", correr: function (e) { e.x = e.a + 1; } }
  ];
  var HILO_B = [
    { id: "B1", rotulo: "B1: b = x", correr: function (e) { e.b = e.x; } },
    { id: "B2", rotulo: "B2: x = b + 10", correr: function (e) { e.x = e.b + 10; } }
  ];

  function mezclas(a, b) {
    if (a.length === 0) { return [b.slice()]; }
    if (b.length === 0) { return [a.slice()]; }
    var conA = mezclas(a.slice(1), b).map(function (r) { return [a[0]].concat(r); });
    var conB = mezclas(a, b.slice(1)).map(function (r) { return [b[0]].concat(r); });
    return conA.concat(conB);
  }

  function ejecutar(orden) {
    var e = { x: 0, a: null, b: null };
    orden.forEach(function (paso) { paso.correr(e); });
    return e.x;
  }

  var ORDENES = mezclas(HILO_A, HILO_B).map(function (orden) {
    return {
      secuencia: orden.map(function (p) { return p.id; }),
      detalle: orden.map(function (p) { return p.rotulo; }),
      final: ejecutar(orden)
    };
  });

  var VALORES = ORDENES.map(function (o) { return o.final; })
    .filter(function (v, i, todos) { return todos.indexOf(v) === i; })
    .sort(function (p, q) { return p - q; });

  /* --- Carta 3: lo que la enumeracion deja ver ----------------------- */

  var LECTURAS = [
    {
      expr: "println(x)",
      pregunta: "¿Puede imprimir 0?",
      cierre: "No. Los dos join garantizan que las dos escrituras ya ocurrieron, y la última de ellas deja a + 1 o b + 10, que son valores positivos.",
      opciones: [
        { txt: "sí, cuando los dos hilos leen 0 y ninguno alcanza a escribir antes del println", fallo: "Los dos join están antes del println, así que ninguna escritura queda pendiente cuando se imprime.", larga: true },
        { txt: "sí, cuando las dos escrituras se pisan exactamente en el mismo instante", fallo: "Pisarse deja el valor de la que escribió de última, y ninguna de las dos escribe 0: una escribe a + 1 y la otra b + 10.", larga: true },
        { txt: "no: la última escritura siempre deja un valor positivo", correcta: true, larga: true }
      ]
    },
    {
      expr: "x termina en 1",
      pregunta: "¿Con qué intercalaciones sale ese valor?",
      cierre: "Con las dos en que los dos hilos leen 0 y la escritura de A queda de última: A escribe 1 encima del 10 que había dejado B.",
      opciones: [
        { txt: "cuando A corre entero antes de que B empiece, y B queda escribiendo encima", fallo: "Si A corre entero primero, B lee 1 y escribe 11. El 1 aparece cuando B escribe y A lo reemplaza con un valor calculado a partir de una lectura vieja.", larga: true },
        { txt: "cuando los dos leen 0 y la escritura de A queda de última", correcta: true, larga: true },
        { txt: "cuando B no alcanza a escribir porque el println llega antes que su segundo paso", fallo: "El join de B espera a que B termine sus dos pasos. El 1 no sale de una escritura que falta, sino de una que se perdió por debajo de otra.", larga: true }
      ]
    },
    {
      expr: "A.join(); B.join()",
      pregunta: "¿Qué aportan los dos join a este programa?",
      cierre: "Garantizan que las dos escrituras ocurrieron cuando el println lee x, y que el hilo principal ve el valor actualizado. Cuál de las dos escribió de última sigue sin decidirse.",
      opciones: [
        { txt: "garantizan que las dos escrituras ya ocurrieron cuando el println lee x", correcta: true, larga: true },
        { txt: "fijan el orden en que los dos hilos escriben, porque A.join() está escrito antes que B.join()", fallo: "El orden de los join decide a quién se espera primero, no quién corre primero. Para cuando el principal llega a esa línea, los dos hilos pueden haber terminado ya.", larga: true },
        { txt: "garantizan que x quede en 11, que es lo que suman los dos incrementos juntos", fallo: "El 11 es uno de los tres resultados posibles, el que sale cuando un hilo corre entero antes de que el otro lea. Los join no escogen cuál ocurre.", larga: true }
      ]
    }
  ];

  function verificar() {
    return {
      intercalaciones: ORDENES.length,
      valores: VALORES,
      maximo: VALORES[VALORES.length - 1],
      minimo: VALORES[0]
    };
  }

  var API = {
    CODIGO: CODIGO, ORDENES: ORDENES, VALORES: VALORES,
    LECTURAS: LECTURAS, verificar: verificar
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================ la pagina ================ */

  var resueltos = { lecturas: 0 };
  var fallados = 0;
  var aciertos = { ordenes: false, valores: false };

  function marcar() {
    document.getElementById("marcador-lecturas").textContent =
      "resueltas: " + resueltos.lecturas + " de " + LECTURAS.length +
      "    ·    opciones falladas: " + fallados;
    if (aciertos.ordenes && aciertos.valores &&
        resueltos.lecturas === LECTURAS.length) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  function construirCodigo(id, lineas) {
    var panel = document.getElementById(id);
    lineas.forEach(function (texto, i) {
      var div = document.createElement("div");
      var num = document.createElement("span");
      var txt = document.createElement("span");
      div.className = "linea";
      num.className = "num";
      num.textContent = texto === "" ? "" : String(i + 1);
      txt.className = "txt";
      txt.textContent = texto;
      div.appendChild(num);
      div.appendChild(txt);
      panel.appendChild(div);
    });
  }

  function prediccion(idCampo, idBoton, idVeredicto, esperado, bien, alto, bajo, alAcertar) {
    document.getElementById(idBoton).addEventListener("click", function () {
      var v = document.getElementById(idVeredicto);
      var valor = parseInt(document.getElementById(idCampo).value, 10);
      if (isNaN(valor)) {
        v.className = "veredicto mal";
        v.textContent = "Escriba un número primero.";
        return;
      }
      if (valor === esperado) {
        v.className = "veredicto bien";
        v.textContent = bien;
        alAcertar();
      } else {
        v.className = "veredicto mal";
        v.textContent = valor > esperado ? alto : bajo;
      }
    });
  }

  function mostrarTabla() {
    var caja = document.getElementById("tabla-ordenes");
    if (caja.childNodes.length > 0) { return; }
    var tabla = document.createElement("table");
    var cab = document.createElement("tr");
    ["Intercalación", "Lo que ocurre", "x al final"].forEach(function (t) {
      var th = document.createElement("th");
      th.textContent = t;
      cab.appendChild(th);
    });
    tabla.appendChild(cab);
    ORDENES.forEach(function (o) {
      var tr = document.createElement("tr");
      [o.secuencia.join(" "), o.detalle.join("; "), String(o.final)].forEach(function (t, i) {
        var td = document.createElement("td");
        td.textContent = t;
        if (i === 1) { td.style.textAlign = "left"; }
        tr.appendChild(td);
      });
      tabla.appendChild(tr);
    });
    caja.appendChild(tabla);
  }

  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  function construirLecturas() {
    var caja = document.getElementById("lecturas");
    LECTURAS.forEach(function (item, indice) {
      var contenedor = document.createElement("div");
      var expr = document.createElement("div");
      var preg = document.createElement("div");
      var ops = document.createElement("div");
      var ver = document.createElement("div");
      contenedor.className = "item";
      expr.className = "expr";
      expr.textContent = item.expr;
      preg.className = "pregunta";
      preg.textContent = item.pregunta;
      ops.className = "opciones";
      ver.className = "veredicto";
      rotar(item.opciones, indice + 1).forEach(function (o) {
        var b = document.createElement("button");
        b.textContent = o.txt;
        if (o.larga) { b.className = "larga"; }
        b.addEventListener("click", function () {
          if (o.correcta) {
            b.className = b.className.replace(" errada", "") + " acertada";
            Array.prototype.forEach.call(ops.children, function (x) { x.disabled = true; });
            ver.className = "veredicto bien";
            ver.textContent = item.cierre;
            resueltos.lecturas = resueltos.lecturas + 1;
          } else {
            b.className = b.className + " errada";
            b.disabled = true;
            ver.className = "veredicto mal";
            ver.textContent = o.fallo;
            fallados = fallados + 1;
          }
          marcar();
        });
        ops.appendChild(b);
      });
      contenedor.appendChild(expr);
      contenedor.appendChild(preg);
      contenedor.appendChild(ops);
      contenedor.appendChild(ver);
      caja.appendChild(contenedor);
    });
  }

  construirCodigo("codigo-x", CODIGO);
  prediccion("pred-ordenes", "btn-ordenes", "ver-ordenes", ORDENES.length,
    "Seis. Cada hilo aporta dos pasos en orden fijo, y hay seis formas de " +
      "intercalar dos secuencias de dos pasos.",
    "Son menos. El orden interno de cada hilo no se puede alterar: A1 va siempre antes de A2, y B1 antes de B2.",
    "Son más. Cuente en cuántos sitios de la secuencia de A caben los dos pasos de B sin cambiar su orden.",
    function () { aciertos.ordenes = true; marcar(); });
  prediccion("pred-valores", "btn-valores", "ver-valores", VALORES.length,
    "Tres: " + VALORES.join(", ") + ". El " + VALORES[VALORES.length - 1] +
      " sale cuando un hilo corre entero antes de que el otro lea; los otros dos, cuando ambos leen 0 y una escritura pisa a la otra.",
    "Son menos: dos de las seis intercalaciones terminan en el mismo valor por partida doble.",
    "Son más. Ejecute a mano las intercalaciones en que los dos hilos leen antes de que alguno escriba.",
    function () { aciertos.valores = true; mostrarTabla(); marcar(); });
  construirLecturas();
  marcar();
})();
