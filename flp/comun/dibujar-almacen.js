/* Dibuja en SVG la cadena de ambientes y, debajo, el almacén, con una flecha
   de cada ligadura que guarda una referencia hacia su celda. Es el dibujo de
   las diapositivas de asignación:

     - la cadena va del eslabón más nuevo, a la izquierda, al más viejo, y
       termina en el ambiente vacío en gris; la flecha va del ambiente que
       extiende hacia el extendido;
     - el eslabón que se acaba de crear lleva borde discontinuo;
     - el almacén es una fila de celdas numeradas desde 0; las del ambiente
       inicial van en gris y las que el programa escribió, resaltadas.

   svg(cadena, almacen, opciones)
     cadena:  [{ nombre, ligaduras: [[id, valor]], destacado }], del más nuevo
              al más viejo. Un valor { ref: k } dibuja la flecha a la celda k.
     almacen: [valor, …] (puede faltar: entonces solo se dibuja la cadena).
     opciones: { escribir, iniciales, escritas: [k…], titulo } */
var DibujarAlmacen = (function () {
  "use strict";

  var ALTO_LINEA = 18, RELLENO = 10, SEPARACION = 46, ANCHO_CARACTER = 7.4;
  var MAX_LIGADURA = 34, MAX_CELDA = 22;

  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  /* Parte un texto en renglones de a lo sumo n caracteres, por los espacios. */
  function partir(t, n) {
    var palabras = String(t).split(" "), lineas = [], actual = "";
    palabras.forEach(function (p) {
      var cand = actual ? actual + " " + p : p;
      if (actual && cand.length > n) { lineas.push(actual); actual = p; } else { actual = cand; }
    });
    lineas.push(actual);
    return lineas;
  }

  function svg(cadena, almacen, opciones) {
    opciones = opciones || {};
    var escribir = opciones.escribir || function (v) { return String(v); };
    var iniciales = opciones.iniciales || 0;
    var escritas = opciones.escritas || [];
    var partes = [], flechas = [];

    /* --- la cadena --- */
    var x = 4, cajas = [];
    cadena.forEach(function (e) {
      var renglones = [{ texto: e.nombre, titulo: true }];
      (e.ligaduras || []).forEach(function (l) {
        var lineas = partir(l[0] + " = " + escribir(l[1]), MAX_LIGADURA);
        lineas.forEach(function (t, k) {
          renglones.push({ texto: (k ? "    " : "") + t, ref: k === 0 && l[1] && l[1].ref !== undefined ? l[1].ref : null });
        });
      });
      var ancho = Math.max(70, Math.max.apply(null, renglones.map(function (r) {
        return r.texto.length; })) * ANCHO_CARACTER + 2 * RELLENO);
      var alto = renglones.length * ALTO_LINEA + 2 * RELLENO;
      cajas.push({ e: e, x: x, ancho: ancho, alto: alto, renglones: renglones });
      x += ancho + SEPARACION;
    });
    var altoCadena = Math.max.apply(null, cajas.map(function (c) { return c.alto; }).concat([40]));
    cajas.forEach(function (c, i) {
      var y = 4, refs = [];
      var clase = "amb-caja" + (c.e.destacado ? " amb-nuevo" : "");
      partes.push('<rect class="' + clase + '" x="' + c.x + '" y="' + y + '" width="' + c.ancho +
                  '" height="' + c.alto + '" rx="8"/>');
      c.renglones.forEach(function (r, k) {
        var ty = y + RELLENO + ALTO_LINEA * k + 13;
        partes.push('<text class="' + (r.titulo ? "amb-nombre" : "amb-ligadura alm-izq") + '" x="' +
                    (r.titulo ? c.x + c.ancho / 2 : c.x + RELLENO) + '" y="' + ty + '">' +
                    esc(r.texto) + "</text>");
        if (r.ref !== null) { refs.push(r.ref); }
      });
      /* Las flechas salen del borde inferior de la caja, repartidas en el
         orden de las ligaduras, para no cruzar el texto. */
      refs.forEach(function (ref, j) {
        flechas.push({ desdeX: c.x + (j + 1) * c.ancho / (refs.length + 1),
                       desdeY: y + c.alto, celda: ref });
      });
      var siguienteX = i + 1 < cajas.length ? cajas[i + 1].x : x;
      partes.push('<line class="amb-flecha" x1="' + (c.x + c.ancho + 6) + '" y1="' + (y + 18) +
                  '" x2="' + (siguienteX - 6) + '" y2="' + (y + 18) + '" marker-end="url(#puntaAlm)"/>');
    });
    partes.push('<rect class="amb-caja amb-vacio" x="' + x + '" y="4" width="92" height="' +
                (ALTO_LINEA + 2 * RELLENO) + '" rx="8"/>');
    partes.push('<text class="amb-nombre" x="' + (x + 46) + '" y="' + (4 + RELLENO + 13) +
                '">empty-env</text>');
    var anchoTotal = x + 96;

    /* --- el almacén --- */
    var altoTotal = altoCadena + 12;
    if (almacen && almacen.length) {
      var yAlm = altoCadena + 80;
      var celdas = almacen.map(function (v) { return partir(escribir(v), MAX_CELDA); });
      var altoCelda = Math.max.apply(null, celdas.map(function (l) { return l.length; })) * ALTO_LINEA + 12;
      var cx = 4, posiciones = [];
      partes.push('<text class="alm-titulo" x="4" y="' + (yAlm - 24) + '">almacén</text>');
      celdas.forEach(function (lineas, k) {
        var ancho = Math.max(44, Math.max.apply(null, lineas.map(function (t) { return t.length; })) *
                    ANCHO_CARACTER + 14);
        var clase = "alm-celda" + (k < iniciales ? " alm-inicial" : "") +
                    (escritas.indexOf(k) !== -1 ? " alm-escrita" : "");
        partes.push('<rect class="' + clase + '" x="' + cx + '" y="' + yAlm + '" width="' + ancho +
                    '" height="' + altoCelda + '"/>');
        lineas.forEach(function (t, j) {
          partes.push('<text class="amb-ligadura' + (k < iniciales ? " alm-gris" : "") + '" x="' +
                      (cx + ancho / 2) + '" y="' + (yAlm + 6 + ALTO_LINEA * j + 13) + '">' + esc(t) + "</text>");
        });
        partes.push('<text class="alm-pos" x="' + (cx + ancho / 2) + '" y="' + (yAlm + altoCelda + 14) +
                    '">' + k + "</text>");
        posiciones.push({ x: cx + ancho / 2, y: yAlm });
        cx += ancho + 4;
      });
      anchoTotal = Math.max(anchoTotal, cx + 4);
      altoTotal = yAlm + altoCelda + 22;

      flechas.forEach(function (f) {
        var p = posiciones[f.celda];
        if (!p) { return; }
        var gris = f.celda < iniciales ? " alm-flecha-gris" : "";
        partes.push('<path class="alm-flecha' + gris + '" d="M ' + f.desdeX + " " + f.desdeY +
                    " C " + f.desdeX + " " + (f.desdeY + 45) + ", " + p.x + " " + (p.y - 45) +
                    ", " + p.x + " " + (p.y - 3) + '" marker-end="url(#puntaRef)"/>');
      });
    }

    return '<svg class="diagrama-ambientes" viewBox="0 0 ' + anchoTotal + " " + altoTotal +
      '" width="' + Math.min(anchoTotal, 980) + '" role="img" aria-label="' +
      esc(opciones.titulo || "cadena de ambientes y almacén") + '">' +
      '<defs><marker id="puntaAlm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" ' +
      'markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" class="amb-punta"/></marker>' +
      '<marker id="puntaRef" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" ' +
      'markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" class="alm-punta"/></marker></defs>' +
      partes.join("") + "</svg>";
  }

  /* Del ambiente del intérprete —{nombre, ligaduras, viejo}— a la lista que
     espera svg. El eslabón que se nombre en destacado se marca. */
  function desdeAmbiente(env, destacado) {
    var cadena = [];
    while (env) {
      cadena.push({ nombre: env.nombre, ligaduras: env.ligaduras,
                    destacado: env.nombre === destacado });
      env = env.viejo;
    }
    return cadena;
  }

  return { svg: svg, desdeAmbiente: desdeAmbiente, partir: partir };
})();

if (typeof module !== "undefined") { module.exports = DibujarAlmacen; }
