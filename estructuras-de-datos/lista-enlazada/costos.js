/* Ejercicio interactivo: lo que cobra cada operacion. */
var EJERCICIO = (function () {
  var N = 20;

  /* Insertar n veces en la posicion 0 del arreglo: cada insercion corre todo
     lo que ya hay. */
  function movidasArreglo(n) {
    var movidas = 0;
    var usados = 0;
    var k = 0;
    while (k < n) {
      var i = usados;
      while (i > 0) {
        i = i - 1;
        movidas = movidas + 1;
      }
      usados = usados + 1;
      k = k + 1;
    }
    return movidas;
  }

  /* Insertar n veces al frente de la enlazada: dos punteros por insercion. */
  function escriturasEnlazada(n) {
    var escrituras = 0;
    var k = 0;
    while (k < n) {
      escrituras = escrituras + 2;
      k = k + 1;
    }
    return escrituras;
  }

  /* La implementacion que conviene a cada perfil de uso. */
  var PERFILES = {
    consultas: "estatica",
    frente: "enlazada",
    techo: "enlazada"
  };

  return { n: N, movidasArreglo: movidasArreglo,
           escriturasEnlazada: escriturasEnlazada, perfiles: PERFILES };
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
    var logradas = { consultas: false, frente: false, techo: false, cuentas: false };
    function revisar() {
      if (logradas.consultas && logradas.frente && logradas.techo && logradas.cuentas) {
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    function conectar(grupo, clave, mensajes) {
      document.querySelectorAll("#" + grupo + " button").forEach(function (boton) {
        boton.addEventListener("click", function () {
          var ver = document.getElementById("veredicto-" + clave);
          var op = boton.dataset.op;
          if (op === EJERCICIO.perfiles[clave]) {
            ver.className = "veredicto bien";
            ver.textContent = mensajes.bien;
            logradas[clave] = true; revisar();
          } else {
            ver.className = "veredicto mal";
            ver.textContent = mensajes[op];
          }
        });
      });
    }

    conectar("opciones-consultas", "consultas", {
      bien: "Correcto: la estática. obtener(p) calcula la dirección de la casilla y la lee: Θ(1), sin importar dónde esté p ni cuántos elementos haya. El millón de consultas cuesta un millón de sumas.",
      enlazada: "En la enlazada obtener(p) camina p nodos desde la cabeza. Con posiciones al azar, cada consulta recorre media lista en promedio, y eso por un millón de consultas.",
      igual: "Las dos guardan los mismos datos, pero el acceso por posición no cuesta lo mismo: en una se calcula la dirección y en la otra se sigue la cadena."
    });

    conectar("opciones-frente", "frente", {
      bien: "Correcto: la enlazada. insertar(0, e) escribe nuevo->siguiente y cabeza: dos punteros, Θ(1) cada vez, y el recorrido final pasa una vez por cada nodo, Θ(n). El programa no consulta por posición, que es lo único caro en esta implementación.",
      estatica: "Cada insertar(0, e) del arreglo corre todo lo que ya hay: las n inserciones suman n(n-1)/2 movidas. Es justo la operación que el arreglo cobra más cara.",
      igual: "El recorrido final cuesta lo mismo en las dos, pero las inserciones no: Θ(1) contra Θ(n) cada una."
    });

    conectar("opciones-techo", "techo", {
      bien: "Correcto: la enlazada. Cada elemento pide su nodo cuando llega, así que el tamaño lo limita la memoria disponible y no una constante escrita en el código.",
      estatica: "CAPACIDAD se fija al compilar y el assert detiene el programa en el elemento que no cabe. Cambiarla exige recompilar y adivinar otra vez cuántos datos van a llegar.",
      igual: "Una tiene techo y la otra no: ahí no hay empate. La enlazada paga un puntero por elemento, y ese es el precio de no reservar casillas de antemano."
    });

    pintarCodigo("codigo-frente", [
      ["// arreglo: cada insercion corre todo lo que ya hay", ""],
      ["int i = usados;", "bloque-1"],
      ["while (i > 0) {", "bloque-1"],
      ["  datos[i] = datos[i - 1];", "bloque-1"],
      ["  i = i - 1;", "bloque-1"],
      ["  movidas = movidas + 1;", "bloque-1"],
      ["}", ""],
      ["", ""],
      ["// enlazada: dos escrituras, sin importar el tamano", ""],
      ["nuevo->siguiente = cabeza;", "bloque-2"],
      ["cabeza = nuevo;", "bloque-2"],
      ["escrituras = escrituras + 2;", "bloque-2"]
    ]);

    function alAcertar(idCaja, fn) {
      document.getElementById(idCaja).addEventListener("click", function (ev) {
        var b = ev.target;
        if (b && b.getAttribute && b.getAttribute("data-op") === "correcta") { fn(); }
      });
    }
    function unicas(lista) {
      var vistos = {};
      return lista.filter(function (o) {
        var dup = vistos[o.valor] === true;
        vistos[o.valor] = true;
        return !dup;
      });
    }

    var cuentasParcial = { arreglo: false, enlazada: false };
    function cerrarCuentas() {
      if (cuentasParcial.arreglo && cuentasParcial.enlazada) {
        logradas.cuentas = true; revisar();
        var nota = document.getElementById("nota-cuentas");
        nota.style.display = "block";
        nota.textContent = "Con n = 200 el arreglo haría " + EJERCICIO.movidasArreglo(200) + " movidas y la enlazada " + EJERCICIO.escriturasEnlazada(200) + " escrituras: multiplicar n por 10 multiplica por 100 el trabajo de una y por 10 el de la otra.";
      }
    }

    Motor.opcionesNumericas("opciones-arreglo", "veredicto-arreglo", function () {
      var n = EJERCICIO.n;
      var esperado = EJERCICIO.movidasArreglo(n);
      return unicas([
        { valor: esperado, clave: "correcta",
          razon: "Correcto: " + esperado + ". La inserción número k corre los k elementos que ya estaban, así que el total es 0 + 1 + ... + " + (n - 1) + " = " + n + "·" + (n - 1) + "/2 = " + esperado + "." },
        { valor: n * n, clave: "cuadrado",
          razon: "La primera inserción no mueve nada y la última mueve " + (n - 1) + ": los sumandos van de 0 a " + (n - 1) + ", no " + n + " veces lo mismo." },
        { valor: n * (n + 1) / 2, clave: "desdeuno",
          razon: "La suma va de 0 a n - 1, no de 1 a n: la inserción sobre la lista vacía no corre ningún elemento." },
        { valor: n * (n - 1), clave: "doble",
          razon: "Eso es el doble de la suma. 0 + 1 + ... + " + (n - 1) + " vale n(n-1)/2: cada inserción corre k elementos, no n - 1." }
      ]);
    });
    alAcertar("opciones-arreglo", function () { cuentasParcial.arreglo = true; cerrarCuentas(); });

    Motor.opcionesNumericas("opciones-enlazada", "veredicto-enlazada", function () {
      var n = EJERCICIO.n;
      var esperado = EJERCICIO.escriturasEnlazada(n);
      return unicas([
        { valor: esperado, clave: "correcta",
          razon: "Correcto: " + esperado + ". La enlazada escribe dos punteros cada vez, el del nodo nuevo y la cabeza: 2·" + n + " = " + esperado + ", sin depender de cuántos elementos haya." },
        { valor: n, clave: "uno",
          razon: "Cada inserción escribe dos punteros, no uno: nuevo->siguiente y cabeza." },
        { valor: n + 2, clave: "suma",
          razon: "Las dos escrituras se pagan en cada inserción: se multiplican por n, no se suman una sola vez." },
        { valor: EJERCICIO.movidasArreglo(n), clave: "delarreglo",
          razon: "Esa es la cuenta del arreglo. La enlazada no corre ningún elemento: no depende de cuántos haya." }
      ]);
    });
    alAcertar("opciones-enlazada", function () { cuentasParcial.enlazada = true; cerrarCuentas(); });
  })();
}
