/* Pinta las actividades del interpretador con procedimientos: tarjetas donde
   primero se predice qué hará el interpretador y después se abre su proceso
   —la traza con el ambiente de cada paso, la cadena de ambientes dibujada y
   las clausuras con el ambiente que capturaron—, y la comparación del mismo
   programa bajo alcance estático y bajo alcance dinámico.

   Las respuestas no están escritas: se calculan ejecutando el interpretador
   de interprete-clausuras.js sobre el programa que ve el estudiante. */
var MotorClausuras = (function () {
  "use strict";

  /* El interpretador que la página inyecta al montar: el de clausuras en
     las sesiones de procedimientos, el de recursión en las de letrec. */
  var INT = typeof InterpreteClausuras !== "undefined" ? InterpreteClausuras : null;

  var CAMPOS = {
    valor:     { etiqueta: "El valor del programa", leer: function (r) { return r.texto; } },
    valueOf:   { etiqueta: "Llamadas a value-of", leer: function (r) { return r.cuenta.valueOf; } },
    applyProc: { etiqueta: "Procedimientos aplicados", leer: function (r) { return r.cuenta.applyProc; } },
    variables: { etiqueta: "Variables que se evalúan", leer: function (r) { return r.cuenta.variables; } },
    ambientes: { etiqueta: "Ambientes que se crean", leer: function (r) { return r.cuenta.ambientes; } },
    clausuras: { etiqueta: "Clausuras que se crean", leer: function (r) { return r.cuenta.clausuras; } },
    asignaciones: { etiqueta: "Asignaciones que se ejecutan", leer: function (r) { return r.cuenta.asignaciones; } },
    celdas:    { etiqueta: "Celdas que reserva el programa", leer: function (r) { return r.cuenta.celdas; } },
    compartidas: { etiqueta: "Operandos que entregan su propia celda", leer: function (r) { return r.cuenta.compartidas; } }
  };

  function elemento(html) {
    var d = document.createElement("div");
    d.innerHTML = html;
    return d.firstElementChild;
  }
  function escapar(t) { return String(t).replace(/</g, "&lt;"); }

  function cadena(env, destacado, titulo) {
    if (typeof DibujarAmbientes === "undefined") { return ""; }
    var eslabones = DibujarAmbientes.desdeAmbiente(env, destacado, INT.escribir);
    return '<div class="envoltura-ambientes">' +
      DibujarAmbientes.svg(eslabones, { titulo: titulo }) + "</div>";
  }

  function panelTraza(r) {
    var paso = 0;
    var filas = r.traza.map(function (f) {
      if (f.creacion || f.escritura || f.reserva) {
        return '<tr class="' + (f.escritura ? "fila-escritura" : f.reserva ? "fila-reserva" : "fila-creacion") +
          '"><td></td><td colspan="3">' + escapar(f.expresion) + "</td></tr>";
      }
      paso++;
      return "<tr><td>" + paso + "</td><td><code>" + escapar(f.expresion) + "</code></td><td>" +
        f.ambiente + (f.consulta ? ' <span class="marca-ambiente">busca aquí</span>' : "") +
        "</td><td><code>" + escapar(f.valor) + "</code></td></tr>";
    }).join("");
    return "<h3>La traza" + (r.error ? " hasta donde alcanzó a llegar" : "") +
      ", una fila por llamada a <code>value-of</code></h3>" +
      '<div class="envoltura-tabla"><table class="tabla-traza"><thead><tr><th>#</th>' +
      "<th>Expresión</th><th>Ambiente</th><th>Valor</th></tr></thead><tbody>" + filas +
      "</tbody></table></div>" +
      '<p class="conteos"><strong>' +
      (r.error ? "Se detuvo sin dar valor" : "Valor: " + escapar(r.texto)) + "</strong> · " +
      r.cuenta.valueOf + " llamadas a <code>value-of</code> · " +
      r.cuenta.applyProc + " procedimientos aplicados · " +
      r.cuenta.variables + " variables evaluadas · " +
      r.cuenta.ambientes + " ambientes creados" +
      (r.mutable ? " · " + r.cuenta.asignaciones + " asignaciones · " +
                   r.cuenta.celdas + " celdas reservadas por el programa" : "") + "</p>";
  }

  /* Con almacén, la cadena se dibuja con el almacén debajo y una flecha de
     cada referencia a su celda. */
  function cadenaConAlmacen(env, destacado, r) {
    if (typeof DibujarAlmacen === "undefined" || !r.almacen) { return cadena(env, destacado, ""); }
    var escritas = (r.escrituras || []).map(function (f) { return f.celda; });
    return '<div class="envoltura-ambientes">' +
      DibujarAlmacen.svg(DibujarAlmacen.desdeAmbiente(env, destacado), r.almacen,
                         { escribir: INT.escribir, iniciales: r.iniciales, escritas: escritas }) +
      "</div>";
  }

  function panelAmbientes(r) {
    var partes;
    if (r.ultimaLlamada) {
      partes = ["<h3>La cadena donde se evaluó el cuerpo del último procedimiento aplicado" +
                (r.almacen ? ", y el almacén al terminar" : "") + "</h3>",
                r.almacen ? cadenaConAlmacen(r.ultimaLlamada, r.ultimaLlamada.nombre, r)
                          : cadena(r.ultimaLlamada, r.ultimaLlamada.nombre, "cadena de ambientes")];
    } else {
      partes = ["<h3>La cadena de ambientes, en su punto más hondo" +
                (r.almacen ? ", y el almacén al terminar" : "") + "</h3>",
                r.almacen ? cadenaConAlmacen(r.masProfundo, r.masProfundo.nombre, r)
                          : cadena(r.masProfundo, r.masProfundo.nombre, "cadena de ambientes")];
    }
    if (r.clausuras && r.clausuras.length) {
      partes.push("<h3>Las clausuras y el ambiente que cada una capturó</h3>");
      r.clausuras.forEach(function (c) {
        partes.push('<p class="clausura"><code>' + escapar(c.texto) + "</code></p>" +
                    cadena(c.env, c.env.nombre, "ambiente de la clausura"));
      });
    }
    return partes.join("");
  }

  /* Un programa puede detenerse en vez de dar un valor. Cuando eso pasa, la
     respuesta correcta es decirlo, y se acepta escrita de cualquier manera. */
  var DICE_ERROR = /error|detiene|detener|falla|fallo|no existe|no hay|no da|indefinid|nada|ningun|libre|sin ligar/;

  function diceError(dado) {
    return DICE_ERROR.test(dado.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  }

  /* El valor de un programa puede ser una clausura. Nadie va a teclear su
     texto completo, así que se acepta nombrarla. */
  var DICE_CLAUSURA = /clausura|closure|procedimiento|funcion/;

  function diceClausura(dado) {
    return DICE_CLAUSURA.test(dado.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  }

  function esTextoDeClausura(t) { return /^\(closure /.test(String(t)); }

  var AVISO_ERROR =
    '<p class="aviso-campos">Si cree que el programa se detiene en vez de dar ' +
    'un valor, escriba <code>error</code>. Si cree que el valor es una ' +
    'clausura, escriba <code>clausura</code>.</p>';

  function proceso(r) {
    if (r.error) {
      var donde = { scanner: "al leer el programa", parser: "en el parser",
                    evaluador: "al evaluar" };
      var aviso = '<div class="veredicto mal">Se detuvo ' + (donde[r.etapa] || "") + ": " +
        escapar(r.error) + "</div>";
      /* Si se detuvo evaluando, lo que alcanzó a hacer explica por qué: la
         traza llega hasta la expresión que falló. */
      if (r.traza && r.traza.length && r.cuenta) {
        return aviso + panelTraza(r) + panelAmbientes(r);
      }
      return aviso;
    }
    return panelTraza(r) + panelAmbientes(r);
  }

  function pintarPrediccion(p) {
    var r = INT.ejecutar(p.programa, p.opciones);
    var carta = elemento(
      '<div class="carta">' +
        "<h2>" + p.titulo + "</h2>" +
        (p.enunciado ? "<p>" + p.enunciado + "</p>" : "") +
        '<pre class="codigo programa-simulador">' + escapar(p.programa) + "</pre>" +
        '<div class="campos-prediccion"></div>' + AVISO_ERROR +
        '<div class="botones">' +
          '<button class="primario" data-accion="comprobar">Comprobar</button>' +
          '<button data-accion="proceso" disabled>Ver el proceso</button>' +
        "</div>" +
        '<div class="veredicto" style="display:none"></div>' +
        '<div class="proceso" style="display:none"></div>' +
      "</div>");

    var zona = carta.querySelector(".campos-prediccion");
    p.campos.forEach(function (c) {
      zona.appendChild(elemento('<label class="campo"><span>' + CAMPOS[c].etiqueta + "</span>" +
        '<input type="text" size="8" data-clave="' + c + '"></label>'));
    });

    var veredicto = carta.querySelector(".veredicto");
    var zonaProceso = carta.querySelector(".proceso");
    var btnProceso = carta.querySelector('[data-accion="proceso"]');

    carta.querySelector('[data-accion="comprobar"]').addEventListener("click", function () {
      var lineas = [], todo = true;
      p.campos.forEach(function (c) {
        var entrada = carta.querySelector('input[data-clave="' + c + '"]');
        var esperado = r.error ? null : CAMPOS[c].leer(r);
        var dado = entrada.value.trim();
        var bien = dado !== "" && (r.error
          ? diceError(dado)
          : String(esperado) === dado || String(esperado) === dado.replace(/\s+/g, "") ||
            (esTextoDeClausura(esperado) && diceClausura(dado)));
        if (!bien) { todo = false; }
        entrada.className = bien ? "bien" : "mal";
        lineas.push((bien ? "✓ " : "✗ ") + CAMPOS[c].etiqueta + ": " +
          (r.error ? "el programa se detiene antes de dar un valor"
                   : escapar(esperado) +
                     (esTextoDeClausura(esperado) ? " — una clausura" : "")));
      });
      veredicto.innerHTML = lineas.join("<br>") + (todo ? "" : "<br>" + (p.pista || ""));
      veredicto.className = "veredicto " + (todo ? "bien" : "mal");
      veredicto.style.display = "block";
      btnProceso.disabled = false;
    });

    btnProceso.addEventListener("click", function () {
      zonaProceso.innerHTML = proceso(r);
      zonaProceso.style.display = "block";
      btnProceso.disabled = true;
    });
    return carta;
  }

  /* --- Los dos alcances, lado a lado -------------------------------- */
  var ALCANCES = [{ rotulo: "Con alcance estático", titulo: "Con alcance estático, el del lenguaje" },
                  { rotulo: "Con alcance dinámico", titulo: "Con alcance dinámico, para comparar",
                    opciones: { dinamico: true } }];

  /* Dos reglas sobre el mismo programa. Sin p.modos son los dos alcances; con
     p.modos, las dos que la tarjeta nombre, cada una con sus opciones para el
     interpretador. */
  function pintarAlcance(p) {
    var modos = p.modos || ALCANCES;
    var estatico = INT.ejecutar(p.programa, modos[0].opciones);
    var dinamico = INT.ejecutar(p.programa, modos[1].opciones);
    var carta = elemento(
      '<div class="carta">' +
        "<h2>" + p.titulo + "</h2>" +
        (p.enunciado ? "<p>" + p.enunciado + "</p>" : "") +
        '<pre class="codigo programa-simulador">' + escapar(p.programa) + "</pre>" +
        '<div class="campos-prediccion">' +
          '<label class="campo"><span>' + modos[0].rotulo + '</span>' +
          '<input type="text" size="8" data-clave="est"></label>' +
          '<label class="campo"><span>' + modos[1].rotulo + '</span>' +
          '<input type="text" size="8" data-clave="din"></label>' +
        "</div>" + AVISO_ERROR +
        '<div class="botones">' +
          '<button class="primario" data-accion="comprobar">Comprobar</button>' +
          '<button data-accion="proceso" disabled>Ver las dos trazas</button>' +
        "</div>" +
        '<div class="veredicto" style="display:none"></div>' +
        '<div class="proceso" style="display:none"></div>' +
      "</div>");

    var veredicto = carta.querySelector(".veredicto");
    var zonaProceso = carta.querySelector(".proceso");
    var btnProceso = carta.querySelector('[data-accion="proceso"]');
    function resultado(r) { return r.error ? "se detiene: " + r.error : r.texto; }

    carta.querySelector('[data-accion="comprobar"]').addEventListener("click", function () {
      var lineas = [], todo = true;
      [["est", estatico, modos[0].rotulo], ["din", dinamico, modos[1].rotulo]]
        .forEach(function (par) {
          var entrada = carta.querySelector('input[data-clave="' + par[0] + '"]');
          var esperado = par[1].error ? null : par[1].texto;
          var dado = entrada.value.trim();
          var bien = dado !== "" && (par[1].error
            ? diceError(dado)
            : dado === String(esperado) || (esTextoDeClausura(esperado) && diceClausura(dado)));
          if (!bien) { todo = false; }
          entrada.className = bien ? "bien" : "mal";
          lineas.push((bien ? "✓ " : "✗ ") + par[2] + ": " + escapar(resultado(par[1])));
        });
      veredicto.innerHTML = lineas.join("<br>") +
        (estatico.texto === dinamico.texto && !estatico.error
          ? "<br>Las dos reglas coinciden en este programa: " + p.razonIguales
          : "<br>" + (p.pista || ""));
      veredicto.className = "veredicto " + (todo ? "bien" : "mal");
      veredicto.style.display = "block";
      btnProceso.disabled = false;
    });

    btnProceso.addEventListener("click", function () {
      zonaProceso.innerHTML =
        "<h3>" + (modos[0].titulo || modos[0].rotulo) + "</h3>" + proceso(estatico) +
        "<h3>" + (modos[1].titulo || modos[1].rotulo) + "</h3>" + proceso(dinamico);
      zonaProceso.style.display = "block";
      btnProceso.disabled = true;
    });
    return carta;
  }

  function montarLibre(id, ejemplos, base) {
    var caja = document.getElementById(id);
    if (!caja) { return; }
    var entrada = caja.querySelector("textarea");
    var salida = caja.querySelector(".proceso");
    var marca = caja.querySelector('input[type="checkbox"]');

    /* La casilla dice qué opción del interpretador prende: dinamico si no
       nombra otra. */
    var opcion = (marca && marca.getAttribute("data-opcion")) || "dinamico";
    function correr() {
      var op = {};
      Object.keys(base || {}).forEach(function (k) { op[k] = base[k]; });
      if (marca) { op[opcion] = marca.checked; }
      var r = INT.ejecutar(entrada.value.trim(), op);
      salida.innerHTML = proceso(r);
      salida.style.display = "block";
    }
    caja.querySelector('[data-accion="correr"]').addEventListener("click", correr);
    entrada.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { correr(); }
    });
    var atajos = caja.querySelector(".ejemplos");
    (ejemplos || []).forEach(function (ej) {
      var b = elemento("<button>" + escapar(ej.length > 46 ? ej.slice(0, 44) + "…" : ej) + "</button>");
      b.title = ej;
      b.addEventListener("click", function () { entrada.value = ej; correr(); });
      atajos.appendChild(b);
    });
  }

  function montar(opciones) {
    if (opciones.interprete) { INT = opciones.interprete; }
    var destino = document.getElementById(opciones.destino);
    if (destino) {
      (opciones.predicciones || []).forEach(function (p) {
        destino.appendChild(p.alcances || p.modos ? pintarAlcance(p) : pintarPrediccion(p));
      });
    }
    if (opciones.libre) { montarLibre(opciones.libre, opciones.ejemplos, opciones.opcionesLibre); }
  }

  return { montar: montar, proceso: proceso };
})();
