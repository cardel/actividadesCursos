/* Ejercicio interactivo: la mayor diferencia A[i] - A[j] con i < j. */
var EJERCICIO = (function () {
  var EJEMPLOS = [
    { rotulo: "100 20", valores: [100, 20] },
    { rotulo: "4 3 2 1", valores: [4, 3, 2, 1] },
    { rotulo: "1 2 3 4", valores: [1, 2, 3, 4] },
    { rotulo: "ocho notas", valores: [7, 1, 9, 3, 8, 2, 10, 4] }
  ];

  var LINEAS_UNO = [
    ["mejor = A[0] - A[1];", ""],
    ["maximo = A[0];", ""],
    ["for (j = 1; j < n; j++) {", ""],
    ["  if (maximo - A[j] > mejor) {", "bloque-1"],
    ["    mejor = maximo - A[j];", "bloque-1"],
    ["  }", ""],
    ["  if (A[j] > maximo) {", "bloque-2"],
    ["    maximo = A[j];", "bloque-2"],
    ["  }", ""],
    ["}", ""]
  ];

  var LINEAS_DOS = [
    ["mejor = A[0] - A[1];", ""],
    ["for (i = 0; i < n - 1; i++) {", ""],
    ["  for (j = i + 1; j < n; j++) {", ""],
    ["    if (A[i] - A[j] > mejor) {", "bloque-1"],
    ["      mejor = A[i] - A[j];", "bloque-1"],
    ["    }", ""],
    ["  }", ""],
    ["}", ""]
  ];

  /* El recorrido de un solo ciclo. Cada paso guarda lo que el estudiante
     predice: el maximo de A[0..j-1], que es el que se usa en la resta, y la
     mejor diferencia despues de procesar j. */
  function unRecorrido(a) {
    var n = a.length;
    var mejor = a[0] - a[1];
    var maximo = a[0];
    var posMaximo = 0;
    var comparaciones = 0;
    var pasos = [];
    var j;
    for (j = 1; j < n; j = j + 1) {
      var usado = maximo;
      var posUsado = posMaximo;
      var candidato = maximo - a[j];
      var mejora = false;
      comparaciones = comparaciones + 1;
      if (candidato > mejor) {
        mejor = candidato;
        mejora = true;
      }
      comparaciones = comparaciones + 1;
      if (a[j] > maximo) {
        maximo = a[j];
        posMaximo = j;
      }
      pasos.push({ j: j, valor: a[j], maximo: usado, posMaximo: posUsado,
                   candidato: candidato, mejor: mejor, mejora: mejora,
                   comparaciones: comparaciones });
    }
    return { pasos: pasos, mejor: mejor, comparaciones: comparaciones };
  }

  /* Fuerza bruta: todas las parejas i < j. */
  function dosCiclos(a) {
    var n = a.length;
    var mejor = a[0] - a[1];
    var comparaciones = 0;
    var i, j;
    for (i = 0; i < n - 1; i = i + 1) {
      for (j = i + 1; j < n; j = j + 1) {
        comparaciones = comparaciones + 1;
        if (a[i] - a[j] > mejor) {
          mejor = a[i] - a[j];
        }
      }
    }
    return { mejor: mejor, comparaciones: comparaciones };
  }

  function comparacionesDos(n) {
    return n * (n - 1) / 2;
  }

  function comparacionesUno(n) {
    return 2 * (n - 1);
  }

  /* Lee enteros separados por espacios o comas. Devuelve {valores} o {error}. */
  function leer(texto) {
    var partes = texto.split(/[\s,;]+/).filter(function (p) { return p !== ""; });
    var valores = [];
    var error = null;
    partes.forEach(function (p) {
      if (error === null) {
        if (/^-?\d+$/.test(p)) {
          valores.push(parseInt(p, 10));
        } else {
          error = "No se entiende " + p + ": escriba enteros separados por espacios.";
        }
      }
    });
    if (error === null && valores.length < 2) {
      error = "Hacen falta al menos dos números.";
    }
    if (error === null && valores.length > 16) {
      error = "Con dieciséis números basta para seguirlo a mano.";
    }
    return error === null ? { valores: valores } : { error: error };
  }

  return { ejemplos: EJEMPLOS, lineasUno: LINEAS_UNO, lineasDos: LINEAS_DOS,
           unRecorrido: unRecorrido, dosCiclos: dosCiclos,
           comparacionesUno: comparacionesUno, comparacionesDos: comparacionesDos,
           leer: leer };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var estado = { a: [], res: null, k: 0, revelado: false, okMaximo: false, okMejor: false };

    /* Cada opcion: valor, clave y la razon que se muestra al pulsarla. Si dos
       dan el mismo numero se queda la primera, y nunca pasan de cuatro. */
    function sinRepetidos(lista) {
      var vistos = [];
      var salida = [];
      lista.forEach(function (o) {
        if (vistos.indexOf(o.valor) === -1 && salida.length < 4) {
          vistos.push(o.valor);
          salida.push(o);
        }
      });
      return salida;
    }

    function opcionesMaximo(paso) {
      var previos = estado.a.slice(0, paso.j);
      var menor = Math.min.apply(null, previos);
      return sinRepetidos([
        { valor: paso.maximo, clave: "correcta",
          razon: "Correcto: el mayor de A[0.." + (paso.j - 1) + "] es " + paso.maximo + "." },
        { valor: paso.valor, clave: "casilla-j",
          razon: "Ese es A[j]. La casilla j todavía no entra en el máximo: " +
            "restarse a sí misma no vale." },
        { valor: previos[paso.j - 1], clave: "anterior",
          razon: "Ese es A[j-1], el último que se miró. El máximo es el mayor " +
            "de todos los anteriores, no el más reciente." },
        { valor: paso.candidato, clave: "candidata",
          razon: "Esa es la candidata maximo - A[j]. Lo que se pregunta es el " +
            "maximo mismo, antes de restar." },
        { valor: menor, clave: "menor",
          razon: "Ese es el menor de A[0.." + (paso.j - 1) + "]. Se busca el mayor." }
      ]);
    }

    function opcionesMejor(paso) {
      var antes = estado.k > 0 ? estado.res.pasos[estado.k - 1].mejor
                               : estado.a[0] - estado.a[1];
      return sinRepetidos([
        { valor: paso.mejor, clave: "correcta",
          razon: "Correcto: " + (paso.mejora
            ? "la candidata " + paso.candidato + " mejora la respuesta."
            : "la candidata " + paso.candidato + " no mejora la respuesta.") },
        { valor: paso.candidato, clave: "candidata",
          razon: "Esa es la candidata " + paso.maximo + " - " + paso.valor +
            ". Hay que compararla con el mejor que traía, que es " + antes + "." },
        { valor: antes, clave: "sin-actualizar",
          razon: "Ese es el mejor que traía, " + antes + ". Si la candidata " +
            paso.candidato + " lo supera, mejor cambia en esta vuelta." },
        { valor: paso.valor - paso.maximo, clave: "al-reves",
          razon: "Esa resta está al revés: la diferencia es el máximo menos A[j], " +
            "no A[j] menos el máximo." },
        { valor: paso.maximo, clave: "maximo",
          razon: "Ese es el máximo, no la mejor diferencia. mejor guarda una resta." },
        { valor: paso.valor, clave: "casilla-j",
          razon: "Ese es A[j], un elemento del arreglo. mejor guarda una diferencia." }
      ]);
    }

    function pintarGrupo(idOpciones, idVeredicto, lista, alAcertar) {
      var caja = document.getElementById(idOpciones);
      var v = document.getElementById(idVeredicto);
      var buena = "";
      lista.forEach(function (o) {
        if (o.clave === "correcta") { buena = String(o.valor); }
      });
      var h = 0, i;
      var semilla = idOpciones + ":" + buena;
      for (i = 0; i < semilla.length; i = i + 1) {
        h = (h * 31 + semilla.charCodeAt(i)) % 100003;
      }
      var giro = h % lista.length;
      var ordenadas = lista.slice(giro).concat(lista.slice(0, giro));
      caja.innerHTML = "";
      v.className = "veredicto";
      v.textContent = "";
      ordenadas.forEach(function (o) {
        var b = document.createElement("button");
        b.setAttribute("data-op", o.clave);
        b.textContent = o.valor;
        b.addEventListener("click", function () {
          v.className = "veredicto " + (o.clave === "correcta" ? "bien" : "mal");
          v.textContent = o.razon;
          if (o.clave === "correcta") { alAcertar(); }
        });
        caja.appendChild(b);
      });
    }

    function pintarOpciones() {
      var paso = pasoActual();
      estado.okMaximo = false;
      estado.okMejor = false;
      if (paso !== null) {
        pintarGrupo("opciones-maximo", "veredicto-maximo", opcionesMaximo(paso),
          function () { estado.okMaximo = true; cerrarVuelta(); });
        pintarGrupo("opciones-mejor", "veredicto-mejor", opcionesMejor(paso),
          function () { estado.okMejor = true; cerrarVuelta(); });
      }
    }

    function cerrarVuelta() {
      var paso = pasoActual();
      var v = document.getElementById("veredicto");
      if (paso !== null && estado.okMaximo && estado.okMejor && !estado.revelado) {
        v.className = "veredicto bien";
        v.textContent = "Correcto. " + (paso.mejora
          ? "La candidata " + paso.candidato + " mejora la respuesta."
          : "La candidata " + paso.candidato + " no mejora la respuesta.");
        estado.revelado = true;
        pintar();
      }
    }

    function pintarCodigo(id, lineas) {
      var caja = document.getElementById(id);
      caja.innerHTML = "";
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

    function formato(x) {
      return x.toLocaleString("es-CO");
    }

    function pasoActual() {
      return estado.k < estado.res.pasos.length ? estado.res.pasos[estado.k] : null;
    }

    function pintarArreglo() {
      var caja = document.getElementById("arreglo");
      caja.innerHTML = "";
      var paso = pasoActual();
      var anterior = estado.k > 0 ? estado.res.pasos[estado.k - 1] : null;
      estado.a.forEach(function (v, i) {
        var c = document.createElement("div");
        c.className = "caja";
        c.style.cursor = "default";
        var ind = document.createElement("span");
        ind.className = "indice";
        ind.textContent = i;
        c.appendChild(ind);
        c.appendChild(document.createTextNode(v));
        if (paso !== null) {
          if (i < paso.j) { c.classList.add("visitada"); }
          if (i === paso.j) { c.classList.add("actual"); }
          if (estado.revelado && i === paso.posMaximo) { c.classList.add("maximo"); }
        } else {
          c.classList.add("visitada");
          if (anterior !== null && i === anterior.posMaximo) { c.classList.add("maximo"); }
        }
        caja.appendChild(c);
      });
    }

    function pintarTraza() {
      var cuerpo = document.getElementById("traza");
      cuerpo.innerHTML = "";
      var m;
      for (m = 0; m < estado.k + (estado.revelado ? 1 : 0); m = m + 1) {
        var p = estado.res.pasos[m];
        var fila = document.createElement("tr");
        [p.j, p.valor, p.maximo, p.maximo + " - " + p.valor + " = " + p.candidato,
         p.mejor + (p.mejora ? " (mejora)" : "")].forEach(function (x) {
          var td = document.createElement("td");
          td.textContent = x;
          fila.appendChild(td);
        });
        cuerpo.appendChild(fila);
      }
    }

    function pintarConteo() {
      var n = estado.a.length;
      var hechos = estado.k + (estado.revelado ? 1 : 0);
      var uno = 2 * hechos;
      var dos = EJERCICIO.comparacionesDos(n);
      var tope = Math.max(dos, EJERCICIO.comparacionesUno(n));
      document.getElementById("valor-uno").textContent = uno + " de " + EJERCICIO.comparacionesUno(n);
      document.getElementById("valor-dos").textContent = dos;
      document.getElementById("barra-uno").style.width = (100 * uno / tope) + "%";
      document.getElementById("barra-dos").style.width = (100 * dos / tope) + "%";
    }

    function pintar() {
      var paso = pasoActual();
      var pregunta = document.getElementById("pregunta");
      var botonSig = document.getElementById("btn-siguiente");
      var v = document.getElementById("veredicto");
      pintarArreglo();
      pintarTraza();
      pintarConteo();
      if (paso !== null) {
        pregunta.innerHTML = "j = <b>" + paso.j + "</b>, A[j] = <b>" + paso.valor +
          "</b>. ¿Cuál es el máximo de A[0.." + (paso.j - 1) + "] y cuánto vale " +
          "<code>mejor</code> al terminar esta vuelta?";
        document.getElementById("zona-prediccion").style.display = "block";
        botonSig.disabled = !estado.revelado;
      } else {
        pregunta.innerHTML = "Recorrido terminado: la respuesta es <b>" +
          estado.res.mejor + "</b>, con " + estado.res.comparaciones +
          " comparaciones. Los dos ciclos dan la misma respuesta con " +
          EJERCICIO.dosCiclos(estado.a).comparaciones + ".";
        document.getElementById("zona-prediccion").style.display = "none";
        botonSig.disabled = true;
        v.className = "veredicto";
        document.getElementById("carta-cierre").style.display = "block";
      }
    }

    function cargar(valores) {
      estado.a = valores.slice();
      estado.res = EJERCICIO.unRecorrido(estado.a);
      estado.k = 0;
      estado.revelado = false;
      document.getElementById("veredicto").className = "veredicto";
      pintar();
      pintarOpciones();
    }

    function revelar() {
      var paso = pasoActual();
      var v = document.getElementById("veredicto");
      if (paso === null) { return; }
      v.className = "veredicto mal";
      v.textContent = "Máximo de A[0.." + (paso.j - 1) + "] = " + paso.maximo +
        ", candidata " + paso.candidato + ", mejor = " + paso.mejor + ".";
      estado.revelado = true;
      pintar();
    }

    function siguiente() {
      if (estado.revelado && estado.k < estado.res.pasos.length) {
        estado.k = estado.k + 1;
        estado.revelado = false;
        document.getElementById("veredicto").className = "veredicto";
        pintar();
        pintarOpciones();
      }
    }

    pintarCodigo("codigo-uno", EJERCICIO.lineasUno);
    pintarCodigo("codigo-dos", EJERCICIO.lineasDos);

    var presets = document.getElementById("presets");
    EJERCICIO.ejemplos.forEach(function (e) {
      var b = document.createElement("button");
      b.textContent = e.rotulo;
      b.addEventListener("click", function () {
        document.getElementById("propio").value = e.valores.join(" ");
        document.getElementById("error-propio").className = "veredicto";
        cargar(e.valores);
      });
      presets.appendChild(b);
    });
    document.getElementById("btn-propio").addEventListener("click", function () {
      var r = EJERCICIO.leer(document.getElementById("propio").value);
      var v = document.getElementById("error-propio");
      if (r.error) {
        v.className = "veredicto mal";
        v.textContent = r.error;
      } else {
        v.className = "veredicto";
        cargar(r.valores);
      }
    });
    document.getElementById("btn-revelar").addEventListener("click", revelar);
    document.getElementById("btn-siguiente").addEventListener("click", siguiente);
    document.getElementById("btn-reinicio").addEventListener("click", function () {
      cargar(estado.a);
    });

    document.getElementById("dato-n").textContent = formato(100000);
    document.getElementById("dato-dos").textContent = formato(EJERCICIO.comparacionesDos(100000));
    document.getElementById("dato-uno").textContent = formato(EJERCICIO.comparacionesUno(100000));

    document.getElementById("propio").value = EJERCICIO.ejemplos[3].valores.join(" ");
    cargar(EJERCICIO.ejemplos[3].valores);
  })();
}
