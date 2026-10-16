/* Ejercicio interactivo: el mejor tramo de un arreglo, en un solo recorrido. */
var EJERCICIO = (function () {
  var EJEMPLOS = [
    { rotulo: "ruta 1", valores: [-1, 6] },
    { rotulo: "ruta 2", valores: [4, -5, 4, -3, 4, 4, -4, 4, -5] },
    { rotulo: "ruta 3", valores: [-2, -3, -4] },
    { rotulo: "empates", valores: [2, -2, 2, -1, 1, -3, 2] }
  ];

  var LINEAS = [
    ["suma = A[0]; ini = 0;", ""],
    ["mejor = A[0]; mi = 0; mf = 0;", ""],
    ["for (i = 1; i < n; i++) {", ""],
    ["  if (suma < 0) {", "bloque-1"],
    ["    suma = A[i]; ini = i;", "bloque-1"],
    ["  } else {", "bloque-1"],
    ["    suma = suma + A[i];", "bloque-1"],
    ["  }", ""],
    ["  if (suma > mejor ||", "bloque-2"],
    ["      (suma == mejor && i - ini > mf - mi)) {", "bloque-2"],
    ["    mejor = suma; mi = ini; mf = i;", "bloque-2"],
    ["  }", ""],
    ["}", ""]
  ];

  /* Decisiones posibles sobre el mejor en cada paso. */
  var MAYOR = "mayor";
  var EMPATE = "empate";
  var QUEDA = "queda";

  /* El recorrido. El paso 0 abre el primer tramo; desde el paso 1 cada uno
     guarda las dos decisiones: si el tramo sigue o se reinicia, y si el mejor
     cambia por suma mayor, por empate con tramo mas largo, o se queda. */
  function recorrer(a) {
    var n = a.length;
    var suma = a[0];
    var ini = 0;
    var mejor = a[0];
    var mi = 0;
    var mf = 0;
    var pasos = [{ i: 0, sumaAntes: null, sigue: null, cambio: MAYOR,
                   suma: suma, ini: ini, mejor: mejor, mi: mi, mf: mf }];
    var i;
    for (i = 1; i < n; i = i + 1) {
      var antes = suma;
      var sigue = suma >= 0;
      if (suma < 0) {
        suma = a[i];
        ini = i;
      } else {
        suma = suma + a[i];
      }
      var cambio = QUEDA;
      if (suma > mejor) {
        cambio = MAYOR;
      } else if (suma === mejor && i - ini > mf - mi) {
        cambio = EMPATE;
      }
      if (cambio !== QUEDA) {
        mejor = suma;
        mi = ini;
        mf = i;
      }
      pasos.push({ i: i, sumaAntes: antes, sigue: sigue, cambio: cambio,
                   suma: suma, ini: ini, mejor: mejor, mi: mi, mf: mf });
    }
    return { pasos: pasos, mejor: mejor, mi: mi, mf: mf };
  }

  /* Fuerza bruta: todos los tramos; mayor suma, luego mas largo, luego el
     que empieza antes. */
  function fuerzaBruta(a) {
    var n = a.length;
    var r = { mejor: a[0], mi: 0, mf: 0 };
    var p, q;
    for (p = 0; p < n; p = p + 1) {
      var s = 0;
      for (q = p; q < n; q = q + 1) {
        s = s + a[q];
        var largo = q - p;
        var largoMejor = r.mf - r.mi;
        var gana = s > r.mejor ||
          (s === r.mejor && largo > largoMejor) ||
          (s === r.mejor && largo === largoMejor && p < r.mi);
        if (gana) {
          r = { mejor: s, mi: p, mf: q };
        }
      }
    }
    return r;
  }

  /* La linea que imprime UVa 507: la calle i une las paradas i e i + 1,
     contando desde 1, asi que el tramo ini..fin va de la parada ini + 1 a la
     fin + 2. */
  function salida507(a, ruta) {
    var r = recorrer(a);
    var texto = "";
    if (r.mejor > 0) {
      texto = "The nicest part of route " + ruta + " is between stops " +
        (r.mi + 1) + " and " + (r.mf + 2);
    } else {
      texto = "Route " + ruta + " has no nice parts";
    }
    return texto;
  }

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
    if (error === null && valores.length < 1) {
      error = "Hace falta al menos un número.";
    }
    if (error === null && valores.length > 16) {
      error = "Con dieciséis números basta para seguirlo a mano.";
    }
    return error === null ? { valores: valores } : { error: error };
  }

  return { ejemplos: EJEMPLOS, lineas: LINEAS, MAYOR: MAYOR, EMPATE: EMPATE,
           QUEDA: QUEDA, recorrer: recorrer, fuerzaBruta: fuerzaBruta,
           salida507: salida507, leer: leer };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    /* fase 0: decidir si el tramo sigue; fase 1: decidir el mejor;
       fase 2: paso resuelto, listo para avanzar. */
    var estado = { a: [], res: null, k: 1, fase: 0 };

    function pintarCodigo(id, lineas) {
      var caja = document.getElementById(id);
      caja.innerHTML = "";
      lineas.forEach(function (par, i) {
        var linea = document.createElement("div");
        linea.className = "linea" + (par[1] ? " " + par[1] : "");
        linea.id = id + "-l" + i;
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

    function resaltar(desde, hasta) {
      EJERCICIO.lineas.forEach(function (par, i) {
        var l = document.getElementById("codigo-tramo-l" + i);
        l.classList.remove("actual");
        if (i >= desde && i <= hasta) { l.classList.add("actual"); }
      });
    }

    /* El estado que se ve: el del paso k ya resuelto si la fase es 2, o el
       del paso anterior mientras se decide. */
    function visible() {
      var terminado = estado.k >= estado.res.pasos.length;
      var idx = terminado || estado.fase === 2 ? Math.min(estado.k, estado.res.pasos.length - 1)
        : estado.k - 1;
      return estado.res.pasos[idx];
    }

    function chip(padre, rotulo, valor, cuenta) {
      var d = document.createElement("span");
      d.className = "chip" + (cuenta ? " cuenta" : "");
      d.appendChild(document.createTextNode(rotulo + " = "));
      var b = document.createElement("b");
      b.textContent = valor;
      d.appendChild(b);
      padre.appendChild(d);
    }

    function pintar() {
      var terminado = estado.k >= estado.res.pasos.length;
      var e = visible();
      var paso = terminado ? null : estado.res.pasos[estado.k];
      var hasta = e.i;
      if (!terminado && estado.fase === 1) { hasta = estado.k; }

      var caja = document.getElementById("arreglo");
      caja.innerHTML = "";
      estado.a.forEach(function (v, i) {
        var c = document.createElement("div");
        c.className = "caja";
        c.style.cursor = "default";
        var ind = document.createElement("span");
        ind.className = "indice";
        ind.textContent = i;
        c.appendChild(ind);
        c.appendChild(document.createTextNode(v));
        var iniVisto = e.ini;
        if (!terminado && estado.fase === 1) { iniVisto = paso.ini; }
        if (i >= iniVisto && i <= hasta) { c.classList.add("tramo"); }
        if (i >= e.mi && i <= e.mf) { c.classList.add("mejor"); }
        if (!terminado && i === estado.k) { c.classList.add("actual"); }
        caja.appendChild(c);
      });

      var chips = document.getElementById("chips");
      chips.innerHTML = "";
      if (!terminado && estado.fase === 1) {
        chip(chips, "suma", paso.suma);
        chip(chips, "ini", paso.ini);
      } else {
        chip(chips, "suma", e.suma);
        chip(chips, "ini", e.ini);
      }
      chip(chips, "mejor", e.mejor, true);
      chip(chips, "mi", e.mi, true);
      chip(chips, "mf", e.mf, true);

      var pregunta = document.getElementById("pregunta");
      var zonaTramo = document.getElementById("zona-tramo");
      var zonaMejor = document.getElementById("zona-mejor");
      zonaTramo.style.display = "none";
      zonaMejor.style.display = "none";
      document.getElementById("btn-siguiente").disabled = true;
      if (terminado) {
        resaltar(-1, -1);
        pregunta.innerHTML = "Recorrido terminado: el mejor tramo es A[" + e.mi +
          ".." + e.mf + "], con suma <b>" + e.mejor + "</b>.";
        document.getElementById("linea-507").textContent =
          EJERCICIO.salida507(estado.a, 1);
        document.getElementById("carta-cierre").style.display = "block";
      } else if (estado.fase === 0) {
        resaltar(3, 7);
        pregunta.innerHTML = "i = <b>" + estado.k + "</b>, A[i] = <b>" + estado.a[estado.k] +
          "</b>. La suma del tramo que viene es " + e.suma + ". ¿El tramo sigue o se reinicia en i?";
        zonaTramo.style.display = "flex";
      } else if (estado.fase === 1) {
        resaltar(8, 11);
        pregunta.innerHTML = "El tramo actual es A[" + paso.ini + ".." + estado.k +
          "], de " + (estado.k - paso.ini + 1) + " casillas, con suma " + paso.suma +
          ". El mejor es A[" + e.mi + ".." + e.mf + "], de " + (e.mf - e.mi + 1) +
          " casillas, con suma " + e.mejor + ". ¿Qué pasa con el mejor?";
        zonaMejor.style.display = "flex";
      } else {
        resaltar(-1, -1);
        pregunta.innerHTML = "Paso i = " + estado.k + " resuelto.";
        document.getElementById("btn-siguiente").disabled = false;
      }
      pintarTraza();
    }

    var NOMBRES = { mayor: "cambia por suma mayor", empate: "cambia por empate y tramo más largo",
                    queda: "se queda" };

    function pintarTraza() {
      var cuerpo = document.getElementById("traza");
      cuerpo.innerHTML = "";
      var tope = estado.fase === 2 || estado.k >= estado.res.pasos.length
        ? estado.k : estado.k - 1;
      var m;
      for (m = 0; m <= Math.min(tope, estado.res.pasos.length - 1); m = m + 1) {
        var p = estado.res.pasos[m];
        var fila = document.createElement("tr");
        [p.i, estado.a[p.i], p.sigue === null ? "abre" : (p.sigue ? "sigue" : "se reinicia"),
         p.suma, p.ini, p.mejor, p.mi + ".." + p.mf,
         m === 0 ? "" : NOMBRES[p.cambio]].forEach(function (x) {
          var td = document.createElement("td");
          td.textContent = x;
          fila.appendChild(td);
        });
        cuerpo.appendChild(fila);
      }
    }

    function veredicto(ok, texto) {
      var v = document.getElementById("veredicto");
      v.className = ok ? "veredicto bien" : "veredicto mal";
      v.textContent = texto;
    }

    function decidirTramo(sigue) {
      var paso = estado.res.pasos[estado.k];
      if (sigue === paso.sigue) {
        veredicto(true, paso.sigue
          ? "Sí: la suma que trae es " + paso.sumaAntes + ", que no resta, así que el tramo sigue y suma " + paso.suma + "."
          : "Sí: la suma que trae es " + paso.sumaAntes + ". Cualquier tramo que la arrastre suma menos que empezar en i.");
        estado.fase = 1;
        pintar();
      } else {
        veredicto(false, paso.sigue
          ? "No. La suma que trae es " + paso.sumaAntes + "; si no es negativa, cargarla no empeora nada y alarga el tramo."
          : "No. La suma que trae es " + paso.sumaAntes + ": arrastrarla deja el tramo por debajo de A[i] solo.");
      }
    }

    function decidirMejor(cambio) {
      var paso = estado.res.pasos[estado.k];
      var e = visible();
      if (cambio === paso.cambio) {
        veredicto(true, cambio === EJERCICIO.QUEDA
          ? "Sí: el mejor sigue siendo A[" + paso.mi + ".." + paso.mf + "]."
          : "Sí: el mejor pasa a A[" + paso.mi + ".." + paso.mf + "] con suma " + paso.mejor + ".");
        estado.fase = 2;
        pintar();
      } else if (paso.cambio === EJERCICIO.EMPATE) {
        veredicto(false, "No. Las sumas empatan en " + paso.suma +
          " y el tramo actual es más largo: el desempate lo da la longitud.");
      } else if (paso.cambio === EJERCICIO.MAYOR) {
        veredicto(false, "No. La suma " + paso.suma + " supera a " + e.mejor + ".");
      } else if (paso.suma === e.mejor) {
        veredicto(false, "No. Las sumas empatan, pero el tramo actual no es más largo; " +
          "con el mismo largo gana el que empezó antes, y ese es el que ya estaba.");
      } else {
        veredicto(false, "No. La suma " + paso.suma + " no alcanza a " + e.mejor + ".");
      }
    }

    function cargar(valores) {
      estado.a = valores.slice();
      estado.res = EJERCICIO.recorrer(estado.a);
      estado.k = 1;
      estado.fase = 0;
      document.getElementById("veredicto").className = "veredicto";
      document.getElementById("carta-cierre").style.display = "none";
      pintar();
    }

    pintarCodigo("codigo-tramo", EJERCICIO.lineas);
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
    document.getElementById("btn-sigue").addEventListener("click", function () { decidirTramo(true); });
    document.getElementById("btn-reinicia").addEventListener("click", function () { decidirTramo(false); });
    document.getElementById("btn-mayor").addEventListener("click", function () { decidirMejor(EJERCICIO.MAYOR); });
    document.getElementById("btn-empate").addEventListener("click", function () { decidirMejor(EJERCICIO.EMPATE); });
    document.getElementById("btn-queda").addEventListener("click", function () { decidirMejor(EJERCICIO.QUEDA); });
    document.getElementById("btn-siguiente").addEventListener("click", function () {
      if (estado.fase === 2) {
        estado.k = estado.k + 1;
        estado.fase = 0;
        document.getElementById("veredicto").className = "veredicto";
        pintar();
      }
    });
    document.getElementById("btn-reinicio").addEventListener("click", function () { cargar(estado.a); });

    document.getElementById("propio").value = EJERCICIO.ejemplos[1].valores.join(" ");
    cargar(EJERCICIO.ejemplos[1].valores);
  })();
}
