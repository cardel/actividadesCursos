/* Piezas comunes de las actividades de planteamiento.
     PLANTEO.preguntas(id, lista, alTerminar)  una pregunta tras otra; cada opcion
       trae su explicacion {t, ok, por} y la lista completa queda a la vista
     PLANTEO.codigo(id, lineas)                panel de codigo; devuelve marcar(nums)
     PLANTEO.partes(idBoton, ids)              partes que esperan; devuelve abrir()
     PLANTEO.decir(id, ok, html)               escribe en una caja de veredicto
     PLANTEO.botones(id, lista, alElegir)      fila de botones con uno activo */
var PLANTEO = (function () {
  function el(id) { return document.getElementById(id); }

  function preguntas(id, lista, alTerminar) {
    var caja = el(id), terminadas = 0;
    function mostrar(n) {
      var q = lista[n], div = document.createElement("div"), h, i;
      div.className = "pregunta";
      div.setAttribute("data-pregunta", n);
      h = "<div class='cuenta-preg'>Pregunta " + (n + 1) + " de " + lista.length + "</div>" +
          "<p class='enun'>" + q.enun + "</p>" + (q.apoyo ? "<div class='apoyo'>" + q.apoyo + "</div>" : "") +
          "<div class='opciones columna'>";
      i = 0;
      while (i < q.opciones.length) {
        h = h + "<button type='button' data-op='" + i + "'>" + q.opciones[i].t + "</button>";
        i = i + 1;
      }
      div.innerHTML = h + "</div><div class='veredicto'></div>";
      caja.appendChild(div);
      Array.prototype.forEach.call(div.querySelectorAll("button[data-op]"), function (b) {
        b.addEventListener("click", function () {
          var op = q.opciones[parseInt(b.getAttribute("data-op"), 10)], v = div.querySelector(".veredicto");
          b.classList.add(op.ok ? "op-bien" : "op-mal");
          v.className = op.ok ? "veredicto bien" : "veredicto mal";
          v.innerHTML = op.por;
          if (op.ok && !div.classList.contains("hecha")) {
            div.classList.add("hecha");
            terminadas = terminadas + 1;
            if (terminadas < lista.length) { mostrar(terminadas); } else if (alTerminar) { alTerminar(); }
          }
        });
      });
      if (q.alMostrar) { q.alMostrar(div); }
    }
    mostrar(0);
  }

  function codigo(id, lineas) {
    var panel = el(id), filas = [];
    panel.innerHTML = "";
    lineas.forEach(function (l) {
      var div = document.createElement("div"), num = document.createElement("span"), txt = document.createElement("span");
      div.className = "linea" + (l.bloque ? " bloque-" + l.bloque : "");
      num.className = "num";
      txt.className = "txt";
      num.textContent = l.num === null ? "" : l.num;
      txt.textContent = l.txt;
      div.appendChild(num);
      div.appendChild(txt);
      panel.appendChild(div);
      filas.push({ div: div, num: l.num });
    });
    return function (nums) {
      filas.forEach(function (f) {
        if (f.num !== null && nums.indexOf(f.num) >= 0) { f.div.classList.add("actual"); } else { f.div.classList.remove("actual"); }
      });
    };
  }

  function partes(idBoton, ids) {
    function abrir() {
      ids.forEach(function (i) { el(i).classList.remove("espera"); });
      el(idBoton).classList.add("oculto");
    }
    el(idBoton).addEventListener("click", abrir);
    return abrir;
  }

  function decir(id, ok, html) {
    var v = el(id);
    v.className = html === "" ? "veredicto" : (ok ? "veredicto bien" : "veredicto mal");
    v.innerHTML = html;
  }

  function botones(id, lista, alElegir) {
    var caja = el(id);
    caja.innerHTML = lista.map(function (t, i) {
      return "<button type='button' data-i='" + i + "'" + (i === 0 ? " class='primario'" : "") + ">" + t + "</button>";
    }).join("");
    function activar(n) {
      Array.prototype.forEach.call(caja.querySelectorAll("button"), function (x, j) {
        if (j === n) { x.classList.add("primario"); } else { x.classList.remove("primario"); }
      });
      alElegir(n);
    }
    Array.prototype.forEach.call(caja.querySelectorAll("button"), function (b, i) {
      b.addEventListener("click", function () { activar(i); });
    });
    return activar;
  }

  return { preguntas: preguntas, codigo: codigo, partes: partes, decir: decir, botones: botones };
})();
