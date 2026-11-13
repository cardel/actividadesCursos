/* Ejercicio interactivo: ordenar por mezcla, nivel por nivel. */
var EJERCICIO = (function () {
  var DATOS = {
    4: [5, 2, 7, 1],
    8: [5, 2, 4, 7, 1, 3, 2, 6],
    16: [9, 3, 12, 1, 7, 15, 4, 8, 2, 14, 6, 10, 5, 13, 11, 16]
  };

  function lg(n) {
    var k = 0;
    var v = n;
    while (v > 1) {
      v = v / 2;
      k = k + 1;
    }
    return k;
  }

  /* niveles[k] = lista de grupos del nivel k de la bajada */
  function construirBajada(datos) {
    var niveles = [[datos]];
    var actual = [datos];
    while (actual[0].length > 1) {
      var siguiente = [];
      actual.forEach(function (g) {
        var mitad = Math.floor(g.length / 2);
        siguiente.push(g.slice(0, mitad));
        siguiente.push(g.slice(mitad));
      });
      niveles.push(siguiente);
      actual = siguiente;
    }
    return niveles;
  }

  function mezclar(izq, der) {
    var resultado = [];
    var i = 0;
    var j = 0;
    while (i < izq.length && j < der.length) {
      if (izq[i] <= der[j]) {
        resultado.push(izq[i]);
        i = i + 1;
      } else {
        resultado.push(der[j]);
        j = j + 1;
      }
    }
    while (i < izq.length) {
      resultado.push(izq[i]);
      i = i + 1;
    }
    while (j < der.length) {
      resultado.push(der[j]);
      j = j + 1;
    }
    return resultado;
  }

  function mezclarNivel(grupos) {
    var nuevos = [];
    var i = 0;
    while (i < grupos.length) {
      if (i + 1 < grupos.length) {
        nuevos.push(mezclar(grupos[i], grupos[i + 1]));
      } else {
        nuevos.push(grupos[i]);
      }
      i = i + 2;
    }
    return nuevos;
  }

  return { datos: DATOS, lg: lg, construirBajada: construirBajada,
           mezclar: mezclar, mezclarNivel: mezclarNivel };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var n = 8;
    var niveles = [];
    var nivelVisible = 0;
    var gruposSubida = null;
    var nivelMezcla = 0;
    var trabajoOK = false;
    var nivelesOK = false;

    function pintarNivel(panel, rotulo, grupos, ordenados) {
      var fila = document.createElement("div");
      fila.className = "nivel";
      var rot = document.createElement("span");
      rot.className = "rotulo-nivel";
      rot.textContent = rotulo;
      fila.appendChild(rot);
      grupos.forEach(function (g) {
        var caja = document.createElement("div");
        caja.className = "grupo";
        g.forEach(function (v) {
          var c = document.createElement("span");
          c.className = "caja mini" + (ordenados ? " orden" : "");
          c.textContent = v;
          caja.appendChild(c);
        });
        fila.appendChild(caja);
      });
      panel.appendChild(fila);
    }

    function reiniciar() {
      niveles = EJERCICIO.construirBajada(EJERCICIO.datos[n]);
      nivelVisible = 0;
      gruposSubida = null;
      nivelMezcla = 0;
      document.getElementById("panel-bajar").innerHTML = "";
      document.getElementById("panel-subir").innerHTML = "";
      document.getElementById("cuerpo-niveles").innerHTML = "";
      document.getElementById("nota-bajar").textContent = "";
      document.getElementById("nota-subir").textContent = "";
      document.getElementById("btn-partir").disabled = false;
      document.getElementById("btn-mezclar").disabled = true;
      pintarNivel(document.getElementById("panel-bajar"),
        "nivel 0 · 1 lista de " + n, niveles[0], false);
    }

    function partirNivel() {
      if (nivelVisible < niveles.length - 1) {
        nivelVisible = nivelVisible + 1;
        var grupos = niveles[nivelVisible];
        pintarNivel(document.getElementById("panel-bajar"),
          "nivel " + nivelVisible + " · " + grupos.length + " listas de " +
          grupos[0].length, grupos, false);
        if (nivelVisible === niveles.length - 1) {
          document.getElementById("btn-partir").disabled = true;
          document.getElementById("btn-mezclar").disabled = false;
          document.getElementById("nota-bajar").textContent =
            "Todas las listas tienen un elemento: el caso base. Una lista de " +
            "tamaño 1 ya está ordenada, sin hacer nada. Ahora toca subir.";
          gruposSubida = niveles[niveles.length - 1];
        }
      }
    }

    function mezclarUnNivel() {
      if (gruposSubida !== null && gruposSubida.length > 1) {
        var cuantasMezclas = Math.floor(gruposSubida.length / 2);
        gruposSubida = EJERCICIO.mezclarNivel(gruposSubida);
        nivelMezcla = nivelMezcla + 1;
        pintarNivel(document.getElementById("panel-subir"),
          "mezcla " + nivelMezcla + " · " + gruposSubida.length + " listas de " +
          gruposSubida[0].length, gruposSubida, true);
        var tr = document.createElement("tr");
        tr.innerHTML = "<td>" + nivelMezcla + "</td><td>" + cuantasMezclas +
          "</td><td>" + gruposSubida[0].length + "</td><td><b>" + n + "</b></td>";
        document.getElementById("cuerpo-niveles").appendChild(tr);
        if (gruposSubida.length === 1) {
          document.getElementById("btn-mezclar").disabled = true;
          document.getElementById("nota-subir").textContent =
            "Lista ordenada en " + nivelMezcla + " niveles de mezcla. Mire la " +
            "última columna de la tabla: todos los niveles movieron lo mismo.";
        }
      }
    }

    document.getElementById("btn-partir").addEventListener("click", partirNivel);
    document.getElementById("btn-mezclar").addEventListener("click", mezclarUnNivel);
    document.getElementById("btn-reiniciar").addEventListener("click", reiniciar);

    Array.prototype.forEach.call(document.querySelectorAll(".presets button"), function (btn) {
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(document.querySelectorAll(".presets button"), function (b) {
          b.classList.remove("primario");
        });
        btn.classList.add("primario");
        n = parseInt(btn.getAttribute("data-n"), 10);
        var v = document.getElementById("veredicto");
        v.className = "veredicto";
        v.textContent = "";
        reiniciar();
        opcionesNiveles.refrescar();
      });
    });

    var opcionesNiveles = Motor.opcionesNumericas("opciones-prediccion", "veredicto", function () {
      var esperado = EJERCICIO.lg(n) + 1;
      var lista = [{ valor: esperado, clave: "correcta", razon: "Correcto: con n = " + n + " hay " + esperado +
        " niveles (lg " + n + " + 1 = " + esperado + "). Compruébelo abajo, partiendo nivel por nivel." }];
      var cand = [
        { valor: esperado - 1, clave: "cortes", razon: "Contó los cortes (lg n = " + (esperado - 1) + "), pero el nivel de arriba, la lista completa, también es una fila." },
        { valor: n / 2, clave: "mitad", razon: "n/2 es cuántas listas de dos elementos aparecen en el penúltimo nivel, no cuántos niveles hay. Partir a la mitad baja mucho más rápido." },
        { valor: n, clave: "n", razon: "Eso sería una fila por elemento, como si cada corte separara uno solo. Cada corte parte todas las listas a la mitad." },
        { valor: esperado + 1, clave: "demas", razon: "Contó una fila de más: las listas de un elemento ya no se parten y cierran la última fila." }
      ];
      cand.forEach(function (o) {
        var repetido = false;
        lista.forEach(function (x) { if (x.valor === o.valor) { repetido = true; } });
        if (!repetido && lista.length < 4) { lista.push(o); }
      });
      return lista;
    });

    /* ---- tarjeta 4: patrón ---- */
    function revisarGeneral() {
      if (trabajoOK && nivelesOK) {
        document.getElementById("carta-general").classList.add("visible");
      }
    }

    Array.prototype.forEach.call(document.querySelectorAll("#opciones-trabajo button"), function (btn) {
      btn.addEventListener("click", function () {
        var v = document.getElementById("veredicto-trabajo");
        var op = btn.getAttribute("data-op");
        if (op === "n") {
          trabajoOK = true;
          v.className = "veredicto bien";
          v.textContent = "Correcto: las mezclas de un nivel se reparten los n " +
            "elementos, así que cada nivel mueve n en total, sin importar si son " +
            "muchas mezclas chicas o una sola grande.";
          revisarGeneral();
        } else if (op === "menos") {
          v.className = "veredicto mal";
          v.textContent = "Las listas crecen pero cada vez hay menos mezclas: los " +
            "dos efectos se cancelan. Mire la última columna de la tabla.";
        } else {
          v.className = "veredicto mal";
          v.textContent = "n² sería comparar todos contra todos. La tabla marca n " +
            "elementos movidos por nivel.";
        }
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll("#opciones-niveles button"), function (btn) {
      btn.addEventListener("click", function () {
        var v = document.getElementById("veredicto-niveles");
        var op = btn.getAttribute("data-op");
        if (op === "logn") {
          nivelesOK = true;
          v.className = "veredicto bien";
          v.textContent = "Correcto: partir a la mitad solo se puede lg n veces, y " +
            "subir mezclando deshace exactamente esos cortes. Con n = " + n +
            ": " + EJERCICIO.lg(n) + " niveles de mezcla.";
          revisarGeneral();
        } else if (op === "mitad") {
          v.className = "veredicto mal";
          v.textContent = "Con n = 8 serían 4 niveles de mezcla, y la tabla muestra 3. " +
            "Partir a la mitad baja mucho más rápido que de a uno.";
        } else {
          v.className = "veredicto mal";
          v.textContent = "n niveles sería quitar un elemento por nivel. Aquí cada " +
            "corte deja la mitad: la cuenta es logarítmica.";
        }
      });
    });

    reiniciar();
  })();
}
