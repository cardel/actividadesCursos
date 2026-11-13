/* Ejercicio interactivo: los primeros algoritmos. */
var EJERCICIO = (function () {
  var PERSONAS = [["Rosa", 21], ["Iván", 19], ["Elena", 21], ["Omar", 19], ["Beto", 23]];
  /* Valores verificados con g++: binary_search sobre {6, 3, 9, 2, 7} sin ordenar. */
  var SIN_ORDEN = { vector: [6, 3, 9, 2, 7], busca3: 0, busca9: 1 };
  var ORDENADO = [4, 8, 15, 16, 23, 42];

  /* Por edad de menor a mayor; en empate, por nombre de la Z a la A. */
  function antes(a, b) {
    var r = false;
    if (a[1] !== b[1]) { r = a[1] < b[1]; } else { r = a[0] > b[0]; }
    return r;
  }
  function ordenar(personas) {
    var v = personas.slice();
    v.sort(function (a, b) { return antes(a, b) ? -1 : (antes(b, a) ? 1 : 0); });
    return v.map(function (p) { return p[0]; });
  }
  /* find: posicion del primero igual, o -1 (end). */
  function find(v, x) {
    var i = 0;
    var r = -1;
    while (r === -1 && i < v.length) {
      if (v[i] === x) { r = i; }
      i = i + 1;
    }
    return r;
  }

  return { personas: PERSONAS, sinOrden: SIN_ORDEN, ordenado: ORDENADO, antes: antes, ordenar: ordenar, find: find };
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
    pintarCodigo("codigo-antes", [
      ["// personas: {Rosa 21} {Iván 19} {Elena 21} {Omar 19} {Beto 23}", ""],
      ["bool antes(Persona a, Persona b) {", ""],
      ["  bool r = false;", ""],
      ["  if (a.edad != b.edad) {", ""],
      ["    r = a.edad < b.edad;", "bloque-1"],
      ["  } else {", ""],
      ["    r = a.nombre > b.nombre;", "bloque-2"],
      ["  }", ""],
      ["  return r;", ""],
      ["}", ""],
      ["sort(g.begin(), g.end(), antes);", "bloque-3"]
    ]);
    pintarCodigo("codigo-bs", [
      ["vector<int> v = {6, 3, 9, 2, 7};   // sin ordenar", ""],
      ["printf(\"%d\\n\", (int) binary_search(v.begin(), v.end(), 3));", "bloque-2"],
      ["printf(\"%d\\n\", (int) binary_search(v.begin(), v.end(), 9));", "bloque-2"]
    ]);
    pintarCodigo("codigo-find", [
      ["vector<int> v = {4, 8, 15, 16, 23, 42};", ""],
      ["vector<int>::iterator it = find(v.begin(), v.end(), 16);", "bloque-1"],
      ["printf(\"%d\\n\", (int) (it - v.begin()));", "bloque-1"],
      ["it = find(v.begin(), v.end(), 5);", "bloque-2"],
      ["printf(\"%s\\n\", it == v.end() ? \"end\" : \"esta\");", "bloque-2"]
    ]);

    var logradas = { orden: false, bs: false, findPos: false, findEnd: false };
    function revisar() {
      if (logradas.orden && logradas.bs && logradas.findPos && logradas.findEnd) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }
    function sinRepetir(lista) {
      var vistos = {};
      return lista.filter(function (o) {
        var nuevo = !vistos[String(o.valor)];
        vistos[String(o.valor)] = true;
        return nuevo;
      });
    }
    function alAcertar(id, f) {
      document.getElementById(id).addEventListener("click", function (e) {
        if (e.target && e.target.getAttribute && e.target.getAttribute("data-op") === "correcta") { f(); }
      });
    }
    Motor.opcionesNumericas("opciones-orden", "veredicto-orden", function () {
      var esperado = EJERCICIO.ordenar(EJERCICIO.personas);
      return sinRepetir([
        { valor: esperado.join(" "), clave: "correcta",
          razon: "Correcto: Omar Iván Rosa Elena Beto. Los de 19 van primero, y entre ellos Omar antes que Iván porque el empate se resuelve con > en el nombre: de la Z a la A." },
        { valor: "Iván Omar Elena Rosa Beto", clave: "empate",
          razon: "Las edades van bien, pero el empate usa a.nombre > b.nombre: va antes el nombre mayor, o sea el que está más cerca de la Z." },
        { valor: "Beto Rosa Elena Omar Iván", clave: "edad",
          razon: "a.edad < b.edad pone antes al de menor edad. Beto, con 23, va de último." },
        { valor: "Beto Elena Iván Omar Rosa", clave: "nombre",
          razon: "Esa es la lista por nombre, de la A a la Z. antes mira primero la edad y solo usa el nombre cuando las edades empatan." }
      ]);
    });
    alAcertar("opciones-orden", function () { logradas.orden = true; revisar(); });

    Motor.opcionesNumericas("opciones-bs", "veredicto-bs", function () {
      var c = EJERCICIO.sinOrden;
      return sinRepetir([
        { valor: c.busca3 + " y " + c.busca9, clave: "correcta",
          razon: "Correcto: 0 y 1. Los dos números están en el vector; binary_search pierde el 3 y encuentra el 9 por casualidad. Sin la precondición de orden, la respuesta no significa nada, y no avisa." },
        { valor: "1 y 1", clave: "ambos",
          razon: "Los dos están, sí, pero binary_search no recorre: parte por la mitad suponiendo orden. Con {6, 3, 9, 2, 7} la mitad es 9; buscando 3 va hacia la izquierda, donde está el 6, y concluye que no está." },
        { valor: "0 y 0", clave: "ninguno",
          razon: "Uno de los dos sí lo encuentra: el 9 está justo en la mitad, y la primera comparación acierta. Que acierte a veces es lo que lo hace peligroso." },
        { valor: (1 - c.busca3) + " y " + (1 - c.busca9), clave: "alreves",
          razon: "Está al revés: el 9 está justo en la mitad y se encuentra a la primera, mientras que el 3 queda del lado del 6 y se pierde." }
      ]);
    });
    alAcertar("opciones-bs", function () { logradas.bs = true; revisar(); });

    Motor.opcionesNumericas("opciones-find5", "veredicto-find", function () {
      var pos = EJERCICIO.find(EJERCICIO.ordenado, 5);
      return [
        { valor: pos === -1 ? "end" : "esta", clave: "correcta",
          razon: "Correcto: end. Cuando no está, find devuelve v.end(), que no es un elemento sino la marca de después del último." },
        { valor: pos === -1 ? "esta" : "end", clave: "esta",
          razon: "El 5 no está en {4, 8, 15, 16, 23, 42}. find devuelve v.end() y el programa imprime end." }
      ];
    });
    alAcertar("opciones-find5", function () { logradas.findEnd = true; revisar(); });

    Motor.opcionesNumericas("opciones-find16", "veredicto-find16", function () {
      var pos = EJERCICIO.find(EJERCICIO.ordenado, 16);
      return sinRepetir([
        { valor: pos, clave: "correcta",
          razon: "Correcto: " + pos + ". it - v.begin() convierte la posición en índice: 4 está en la 0, 8 en la 1, 15 en la 2, 16 en la 3." },
        { valor: pos + 1, clave: "desdeuno",
          razon: "Las posiciones empiezan en 0: 4 está en la 0, 8 en la 1, 15 en la 2, 16 en la 3." },
        { valor: 16, clave: "valor",
          razon: "Ese es el valor que se busca, no su posición. it - v.begin() cuenta casillas desde el principio." },
        { valor: EJERCICIO.ordenado.length, clave: "tamano",
          razon: "Ese es el tamaño del vector, la posición de v.end(). El 16 sí está, y find se detiene en el primer igual." }
      ]);
    });
    alAcertar("opciones-find16", function () { logradas.findPos = true; revisar(); });
  })();
}
