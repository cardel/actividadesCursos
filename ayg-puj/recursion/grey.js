/* Ejercicio interactivo: UVa 11173, Grey Codes, por mitades del rango. */
var EJERCICIO = (function () {
  var CODIGO = [
    "def grey(ini, fin, k):",
    "    if fin - ini == 1:",
    "        codigo = 0",
    "    else:",
    "        mitad = (ini + fin) // 2",
    "        if k < mitad:",
    "            codigo = grey(ini, mitad, k)",
    "        else:",
    "            reflejo = mitad + fin - 1 - k",
    "            codigo = (mitad - ini) + grey(mitad, fin, reflejo)",
    "    return codigo"
  ];

  /* Recorre la recursion y guarda un nivel por llamada que baja y un retorno
     por llamada que sube. */
  function simular(n, k) {
    var niveles = [];
    var retornos = [];
    function grey(ini, fin, pos) {
      var codigo;
      if (fin - ini === 1) {
        niveles.push({ ini: ini, fin: fin, k: pos, base: true });
        codigo = 0;
      } else {
        var mitad = Math.floor((ini + fin) / 2);
        var nivel = { ini: ini, fin: fin, k: pos, mitad: mitad, base: false };
        niveles.push(nivel);
        if (pos < mitad) {
          nivel.lado = "izq";
          nivel.bit = 0;
          nivel.nIni = ini;
          nivel.nFin = mitad;
          nivel.nK = pos;
          codigo = grey(ini, mitad, pos);
        } else {
          nivel.lado = "der";
          nivel.bit = 1;
          nivel.nIni = mitad;
          nivel.nFin = fin;
          nivel.nK = mitad + fin - 1 - pos;
          codigo = (mitad - ini) + grey(mitad, fin, nivel.nK);
        }
      }
      retornos.push({ ini: ini, fin: fin, k: pos, codigo: codigo });
      return codigo;
    }
    var codigo = grey(0, Math.pow(2, n), k);
    return { niveles: niveles, retornos: retornos, codigo: codigo,
             llamadas: niveles.length };
  }

  /* La lista entera, construida como la describe el enunciado: reflejar y
     anteponer 0 arriba y 1 abajo. */
  function lista(n) {
    var l = [0, 1];
    var b;
    for (b = 2; b <= n; b = b + 1) {
      var alto = Math.pow(2, b - 1);
      var nueva = l.slice();
      var i;
      for (i = l.length - 1; i >= 0; i = i - 1) {
        nueva.push(alto + l[i]);
      }
      l = nueva;
    }
    return l;
  }

  function formula(k) {
    return k ^ (k >> 1);
  }

  function binario(x, n) {
    var s = x.toString(2);
    while (s.length < n) { s = "0" + s; }
    return s;
  }

  return { codigo: CODIGO, simular: simular, lista: lista, formula: formula,
           binario: binario };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var estado = { n: 3, k: 5, res: null, nivel: 0, subidos: 0 };

    function pintarCodigo() {
      var caja = document.getElementById("codigo");
      caja.innerHTML = "";
      EJERCICIO.codigo.forEach(function (t, i) {
        var linea = document.createElement("div");
        linea.className = "linea";
        linea.id = "cod-" + (i + 1);
        var num = document.createElement("span");
        num.className = "num";
        num.textContent = i + 1;
        var txt = document.createElement("span");
        txt.className = "txt";
        txt.textContent = t;
        linea.appendChild(num);
        linea.appendChild(txt);
        caja.appendChild(linea);
      });
    }

    function marcarCodigo(activas) {
      EJERCICIO.codigo.forEach(function (t, i) {
        document.getElementById("cod-" + (i + 1)).classList.toggle("actual", activas.indexOf(i + 1) >= 0);
      });
    }

    function bajando() {
      return estado.nivel < estado.res.niveles.length && !estado.res.niveles[estado.nivel].base;
    }

    /* Una fila por nivel ya visto: el rango en azul, la mitad marcada y la
       posicion k en ambar. */
    function pintarEscalera() {
      var caja = document.getElementById("escalera");
      caja.innerHTML = "";
      var total = Math.pow(2, estado.n);
      var ancho = Math.max(10, Math.min(40, Math.floor(720 / total)));
      var hasta = Math.min(estado.nivel, estado.res.niveles.length - 1);
      var m;
      for (m = 0; m <= hasta; m = m + 1) {
        var nv = estado.res.niveles[m];
        var fila = document.createElement("div");
        fila.className = "fila-rango";
        var rot = document.createElement("span");
        rot.className = "rotulo-rango";
        rot.textContent = "[" + nv.ini + ", " + nv.fin + ")";
        fila.appendChild(rot);
        var c;
        for (c = 0; c < total; c = c + 1) {
          var d = document.createElement("div");
          d.className = "pos";
          d.style.width = ancho + "px";
          if (c >= nv.ini && c < nv.fin) { d.classList.add("dentro"); }
          if (c === nv.k) { d.classList.add("objetivo"); }
          if (!nv.base && c === nv.mitad) { d.classList.add("corte"); }
          if (ancho >= 22) { d.textContent = c; }
          d.title = "posición " + c;
          fila.appendChild(d);
        }
        caja.appendChild(fila);
      }
    }

    function pintarPila() {
      var caja = document.getElementById("pila");
      caja.innerHTML = "";
      var res = estado.res;
      var abiertos = Math.min(estado.nivel + 1, res.niveles.length) - estado.subidos;
      var m;
      for (m = abiertos - 1; m >= 0; m = m - 1) {
        var nv = res.niveles[m];
        var d = document.createElement("div");
        d.className = "marco" + (m === abiertos - 1 ? " tope" : "");
        d.innerHTML = "<b>grey(" + nv.ini + ", " + nv.fin + ", " + nv.k + ")</b>";
        caja.appendChild(d);
      }
      var vueltos = res.retornos.slice(0, estado.subidos);
      vueltos.forEach(function (r) {
        var d = document.createElement("div");
        d.className = "marco cerrado";
        d.innerHTML = "grey(" + r.ini + ", " + r.fin + ", " + r.k + ") devolvió <b>" + r.codigo + "</b>";
        caja.appendChild(d);
      });
      document.getElementById("profundidad").textContent = abiertos;
    }

    function pintarRecurrencia() {
      var caja = document.getElementById("recurrencia");
      var n = estado.n;
      var bajados = Math.min(estado.nivel, n);
      var filas = [];
      var i;
      for (i = 0; i <= bajados; i = i + 1) {
        var m = Math.pow(2, n - i);
        if (i === 0) {
          filas.push("T(" + m + ")");
        } else {
          filas.push("= T(" + m + ") + " + (i === 1 ? "c" : i + "c"));
        }
      }
      caja.innerHTML = filas.join("<br>");
      document.getElementById("niveles-hechos").textContent = bajados;
      document.getElementById("niveles-total").textContent = n;
      document.getElementById("m-total").textContent = Math.pow(2, n);
    }

    function pintarTraza() {
      var cuerpo = document.getElementById("traza");
      cuerpo.innerHTML = "";
      var m;
      for (m = 0; m < Math.min(estado.nivel, estado.res.niveles.length); m = m + 1) {
        var nv = estado.res.niveles[m];
        if (!nv.base) {
          var fila = document.createElement("tr");
          ["[" + nv.ini + ", " + nv.fin + ")", nv.k, nv.mitad,
           nv.lado === "izq" ? "izquierda" : "derecha", nv.bit,
           "[" + nv.nIni + ", " + nv.nFin + ")",
           nv.lado === "izq" ? nv.nK : nv.mitad + " + " + nv.fin + " - 1 - " + nv.k + " = " + nv.nK
          ].forEach(function (x) {
            var td = document.createElement("td");
            td.textContent = x;
            fila.appendChild(td);
          });
          cuerpo.appendChild(fila);
        }
      }
    }

    function pintarFinal() {
      var n = estado.n, k = estado.k;
      var l = EJERCICIO.lista(n);
      var caja = document.getElementById("lista");
      caja.innerHTML = "";
      l.forEach(function (x, i) {
        var d = document.createElement("div");
        d.className = "codigo-gray" + (i === k ? " objetivo" : "");
        d.innerHTML = "<span>" + i + "</span><b>" + EJERCICIO.binario(x, n) + "</b><span>" + x + "</span>";
        caja.appendChild(d);
      });
      var f = EJERCICIO.formula(k);
      document.getElementById("comparacion").innerHTML =
        "La recursión devolvió <b>" + estado.res.codigo + "</b> = " +
        EJERCICIO.binario(estado.res.codigo, n) + ". En la lista construida entera, la posición " +
        k + " guarda " + l[k] + ". Y la fórmula k xor (k &gt;&gt; 1) da " +
        EJERCICIO.binario(k, n) + " xor " + EJERCICIO.binario(k >> 1, n) + " = " +
        EJERCICIO.binario(f, n) + " = <b>" + f + "</b>.";
      document.getElementById("dato-llamadas").textContent = estado.res.llamadas;
      document.getElementById("dato-n").textContent = n;
    }

    function pintar() {
      var res = estado.res;
      var pregunta = document.getElementById("pregunta");
      var zona = document.getElementById("zona-bajar");
      var botonSubir = document.getElementById("btn-subir");
      pintarEscalera();
      pintarPila();
      pintarRecurrencia();
      pintarTraza();
      document.getElementById("carta-cierre").style.display = "none";
      botonSubir.style.display = "none";
      if (bajando()) {
        var nv = res.niveles[estado.nivel];
        marcarCodigo([5, 6]);
        zona.style.display = "flex";
        pregunta.innerHTML = "Llamada <code>grey(" + nv.ini + ", " + nv.fin + ", " + nv.k +
          ")</code>: el rango tiene " + (nv.fin - nv.ini) + " posiciones y mitad = " + nv.mitad +
          ". ¿En qué mitad cae la posición " + nv.k + ", qué bit aporta, cuál es el nuevo rango y qué posición se busca en él?";
      } else if (estado.subidos < res.retornos.length) {
        zona.style.display = "none";
        botonSubir.style.display = "inline-block";
        var r = res.retornos[estado.subidos];
        if (estado.subidos === 0) {
          marcarCodigo([2, 3, 11]);
          pregunta.innerHTML = "<code>grey(" + r.ini + ", " + r.fin + ", " + r.k +
            ")</code> recibe un rango de una sola posición: es el caso base, ya no quedan bits por decidir y devuelve 0. Ahora cada llamada suma su bit al volver.";
        } else {
          var nv2 = res.niveles[res.niveles.length - 1 - estado.subidos];
          marcarCodigo(nv2.bit === 1 ? [10, 11] : [7, 11]);
          pregunta.innerHTML = "<code>grey(" + r.ini + ", " + r.fin + ", " + r.k + ")</code> recibe " +
            res.retornos[estado.subidos - 1].codigo + " y le suma " +
            (nv2.bit === 1 ? "mitad - ini = " + (nv2.mitad - nv2.ini) + ", el bit 1 de este nivel"
                           : "nada, porque el bit de este nivel es 0") +
            ": devuelve <b>" + r.codigo + "</b>.";
        }
      } else {
        marcarCodigo([]);
        zona.style.display = "none";
        pregunta.innerHTML = "La primera llamada devolvió <b>" + res.codigo + "</b> = " +
          EJERCICIO.binario(res.codigo, estado.n) + ".";
        document.getElementById("carta-cierre").style.display = "block";
        pintarFinal();
      }
    }

    function veredicto(clase, texto) {
      var v = document.getElementById("veredicto");
      v.className = "veredicto " + clase;
      v.textContent = texto;
    }

    function limpiarEntradas() {
      ["bit", "nuevo-ini", "nuevo-fin", "nuevo-k"].forEach(function (id) {
        document.getElementById(id).value = "";
      });
      document.getElementById("lado-izq").checked = false;
      document.getElementById("lado-der").checked = false;
    }

    function explicar(nv) {
      return nv.lado === "izq"
        ? "La posición " + nv.k + " es menor que mitad = " + nv.mitad +
          ": cae en la mitad izquierda, el bit es 0 y se sigue en [" + nv.nIni + ", " + nv.nFin +
          ") con la misma posición " + nv.nK + "."
        : "La posición " + nv.k + " no es menor que mitad = " + nv.mitad +
          ": cae en la mitad derecha, el bit es 1 y se sigue en [" + nv.nIni + ", " + nv.nFin +
          "). Esa mitad guarda los códigos de la izquierda en orden inverso, así que la posición se refleja: " +
          nv.mitad + " + " + nv.fin + " - 1 - " + nv.k + " = " + nv.nK + ".";
    }

    function comprobar() {
      var nv = estado.res.niveles[estado.nivel];
      var izq = document.getElementById("lado-izq").checked;
      var der = document.getElementById("lado-der").checked;
      var bit = parseInt(document.getElementById("bit").value, 10);
      var a = parseInt(document.getElementById("nuevo-ini").value, 10);
      var b = parseInt(document.getElementById("nuevo-fin").value, 10);
      var p = parseInt(document.getElementById("nuevo-k").value, 10);
      if (bajando()) {
        if (!izq && !der) {
          veredicto("mal", "Marque primero la mitad.");
        } else if ((izq ? "izq" : "der") !== nv.lado) {
          veredicto("mal", "Compare la posición " + nv.k + " con mitad = " + nv.mitad +
            ": las posiciones menores que mitad están en la mitad izquierda.");
        } else if (bit !== nv.bit) {
          veredicto("mal", "La mitad está bien. En la mitad izquierda se antepuso un 0 y en la derecha un 1.");
        } else if (a !== nv.nIni || b !== nv.nFin) {
          veredicto("mal", "El nuevo rango es la mitad elegida, con el mismo formato [ini, fin): el fin no se incluye.");
        } else if (p !== nv.nK) {
          veredicto("mal", nv.lado === "izq"
            ? "En la mitad izquierda la lista sigue igual, así que la posición no cambia."
            : "En la mitad derecha la lista está al revés: la posición k queda a la misma distancia del fin que su reflejo del inicio de esa mitad. Pruebe con mitad + fin - 1 - k.");
        } else {
          veredicto("bien", "Correcto. " + explicar(nv));
          estado.nivel = estado.nivel + 1;
          limpiarEntradas();
          pintar();
        }
      }
    }

    function revelar() {
      var nv = estado.res.niveles[estado.nivel];
      if (bajando()) {
        veredicto("mal", explicar(nv));
        estado.nivel = estado.nivel + 1;
        limpiarEntradas();
        pintar();
      }
    }

    function subir() {
      if (estado.subidos < estado.res.retornos.length) {
        estado.subidos = estado.subidos + 1;
        document.getElementById("veredicto").className = "veredicto";
        pintar();
      }
    }

    function cargar() {
      var n = parseInt(document.getElementById("n").value, 10);
      var k = parseInt(document.getElementById("k").value, 10);
      var v = document.getElementById("error-entrada");
      if (isNaN(n) || n < 1 || n > 6) {
        v.className = "veredicto mal";
        v.textContent = "Use n entre 1 y 6: con más bits la lista ya no cabe en la pantalla.";
      } else if (isNaN(k) || k < 0 || k >= Math.pow(2, n)) {
        v.className = "veredicto mal";
        v.textContent = "La posición k va de 0 a " + (Math.pow(2, n) - 1) + ".";
      } else {
        v.className = "veredicto";
        estado.n = n;
        estado.k = k;
        estado.res = EJERCICIO.simular(n, k);
        estado.nivel = 0;
        estado.subidos = 0;
        document.getElementById("veredicto").className = "veredicto";
        limpiarEntradas();
        pintar();
      }
    }

    pintarCodigo();
    document.getElementById("btn-cargar").addEventListener("click", cargar);
    document.getElementById("btn-azar").addEventListener("click", function () {
      var n = 3 + Math.floor(Math.random() * 4);
      document.getElementById("n").value = n;
      document.getElementById("k").value = Math.floor(Math.random() * Math.pow(2, n));
      cargar();
    });
    document.getElementById("btn-comprobar").addEventListener("click", comprobar);
    document.getElementById("btn-revelar").addEventListener("click", revelar);
    document.getElementById("btn-subir").addEventListener("click", subir);
    document.getElementById("btn-reinicio").addEventListener("click", cargar);
    document.getElementById("n").value = 3;
    document.getElementById("k").value = 5;
    cargar();
  })();
}
