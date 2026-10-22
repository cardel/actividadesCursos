/* Piezas comunes de los ejercicios de grafos de estado: la villa, sus
   transiciones en el orden del C++ (primero las puertas, luego los
   interruptores, habitaciones de menor a mayor), la busqueda por capas y el
   dibujo de las habitaciones. Una luz i es el bit i-1 de la mascara. */
var VILLA = (function () {
  function crear(v) {
    var P = [], I = [], i = 0, j;
    while (i <= v.r) {
      P.push([]); I.push([]); j = 0;
      while (j <= v.r) { P[i].push(false); I[i].push(false); j = j + 1; }
      i = i + 1;
    }
    v.puertas.forEach(function (d) { P[d[0]][d[1]] = true; P[d[1]][d[0]] = true; });
    v.interruptores.forEach(function (s) { I[s[0]][s[1]] = true; });
    return { r: v.r, puerta: P, inter: I, puertas: v.puertas, interruptores: v.interruptores, pos: v.pos };
  }

  function bit(i) { return 1 << (i - 1); }
  function prendida(L, i) { return (L & bit(i)) !== 0; }
  function conjunto(L, r) {
    var a = [], i = 1;
    while (i <= r) { if (prendida(L, i)) { a.push(i); } i = i + 1; }
    return a;
  }
  function etiqueta(h, L, r) { return "(" + h + ", {" + conjunto(L, r).join(",") + "})"; }
  function bin(L, r) {
    var s = "", i = r;
    while (i >= 1) { s = s + (prendida(L, i) ? "1" : "0"); i = i - 1; }
    return s;
  }
  function clave(h, L) { return h * 4096 + L; }

  /* Las transiciones de un estado, en el orden del codigo. */
  function sucesores(V, h, L) {
    var res = [], i = 1;
    while (i <= V.r) {
      if (V.puerta[h][i] && prendida(L, i)) { res.push({ pos: i, luz: L, desc: "move", room: i }); }
      i = i + 1;
    }
    i = 1;
    while (i <= V.r) {
      if (V.inter[h][i] && i !== h) {
        var n = L ^ bit(i);
        res.push({ pos: h, luz: n, desc: n > L ? "on" : "off", room: i });
      }
      i = i + 1;
    }
    return res;
  }

  function texto(a) {
    return a.desc === "move" ? "Move to room " + a.room + "." : "Switch " + a.desc + " light in room " + a.room + ".";
  }
  function textoEs(a) {
    return a.desc === "move" ? "pasa a la " + a.room : (a.desc === "on" ? "prende la " + a.room : "apaga la " + a.room);
  }

  /* Busqueda en amplitud sobre todo el grafo, sin detenerse en la meta.
     Devuelve los estados en el orden en que se descubren. */
  function capas(V) {
    var estados = [{ pos: 1, luz: 1, d: 0, padre: -1, accion: null }];
    var visto = {}, k = 0, meta = -1;
    visto[clave(1, 1)] = 0;
    while (k < estados.length) {
      var e = estados[k];
      sucesores(V, e.pos, e.luz).forEach(function (a) {
        if (visto[clave(a.pos, a.luz)] === undefined) {
          visto[clave(a.pos, a.luz)] = estados.length;
          estados.push({ pos: a.pos, luz: a.luz, d: e.d + 1, padre: k, accion: a });
        }
      });
      k = k + 1;
    }
    if (visto[clave(V.r, bit(V.r))] !== undefined) { meta = visto[clave(V.r, bit(V.r))]; }
    var porCapa = [];
    estados.forEach(function (e, id) {
      while (porCapa.length <= e.d) { porCapa.push([]); }
      porCapa[e.d].push(id);
    });
    return { estados: estados, porCapa: porCapa, meta: meta, visto: visto };
  }

  /* Habitaciones sobre una circunferencia (r = 1 al centro). */
  function posiciones(r) {
    var p = [], i = 0;
    while (i < r) {
      var a = -Math.PI / 2 + (2 * Math.PI * i) / r;
      p.push(r === 1 ? [100, 70] : [100 + 62 * Math.cos(a), 70 + 46 * Math.sin(a)]);
      i = i + 1;
    }
    return p;
  }

  /* SVG de la villa. luz: mascara de luces prendidas (o null), actual: la
     habitacion donde esta la persona (o null). */
  function dibujar(V, luz, actual) {
    var p = V.pos || posiciones(V.r), s = '<svg viewBox="0 0 200 140" width="240" role="img" aria-label="Habitaciones y puertas">';
    V.puertas.forEach(function (d) {
      s += '<line x1="' + p[d[0] - 1][0] + '" y1="' + p[d[0] - 1][1] + '" x2="' + p[d[1] - 1][0] + '" y2="' + p[d[1] - 1][1] +
           '" stroke="#6b7280" stroke-width="2.4"/>';
    });
    var i = 1;
    while (i <= V.r) {
      var on = luz !== null && luz !== undefined && prendida(luz, i), aqui = actual === i;
      s += '<circle cx="' + p[i - 1][0] + '" cy="' + p[i - 1][1] + '" r="14" fill="' + (on ? "#ffe9a8" : "#ffffff") +
           '" stroke="' + (aqui ? "#1f5fa8" : (on ? "#e8a13d" : "#6b7280")) + '" stroke-width="' + (aqui ? 4.2 : 2) + '"/>' +
           '<text x="' + p[i - 1][0] + '" y="' + (p[i - 1][1] + 4.5) + '" text-anchor="middle" font-size="13" font-weight="700" fill="#24292f">' + i + '</text>';
      i = i + 1;
    }
    return s + "</svg>";
  }

  function describir(v) {
    var puertas = v.puertas.map(function (d) { return d[0] + "–" + d[1]; }).join(", ");
    var inter = v.interruptores.map(function (s) { return "en la " + s[0] + " la luz de la " + s[1]; }).join("; ");
    return { puertas: puertas, inter: inter };
  }

  return { crear: crear, bit: bit, prendida: prendida, conjunto: conjunto, etiqueta: etiqueta, bin: bin, clave: clave,
           sucesores: sucesores, texto: texto, textoEs: textoEs, capas: capas, dibujar: dibujar, describir: describir };
})();

if (typeof module !== "undefined") { module.exports = VILLA; }
