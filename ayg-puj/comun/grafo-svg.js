/* Dibujo de grafos con pesos en SVG, para los ejercicios de caminos mas cortos.
     o.n          numero de vertices
     o.pos        posiciones [x, y] dentro de un lienzo de 560 x 250
     o.aristas    lista de [u, v, peso]
     o.dirigido   false para aristas sin punta (por omision, dirigido)
     o.arista(i)  {color, grueso, trazo, curva} de la arista i
     o.nodo(u)    {relleno, borde, grueso, tinta, nota, notaColor, cuadrado}
   Las aristas antiparalelas se dibujan como dos curvas. */
var GRAFOSVG = (function () {
  var COL = { gris: "#6b7280", azul: "#1f5fa8", verde: "#2e7d32", rojo: "#b3261e", morado: "#7b3fa0", ambar: "#c77c0e", claro: "#b9c0cb" };
  var R = 17;

  function signo(w) { return String(w).replace("-", "−"); }

  function dibujar(o) {
    var ancho = o.ancho || 560, alto = o.alto || 250, dir = o.dirigido !== false, A = o.aristas, svg, rotulos = "", i, c;
    function hay(u, v) {
      var j = 0, h = false;
      while (j < A.length) { if (A[j][0] === u && A[j][1] === v) { h = true; } j = j + 1; }
      return h;
    }
    function etiqueta(x, y, w, color) {
      return "<text x='" + x + "' y='" + (y + 4) + "' text-anchor='middle' font-size='12' font-weight='700' fill='" + COL[color] +
             "' stroke='#ffffff' stroke-width='4' paint-order='stroke' stroke-linejoin='round'>" + signo(w) + "</text>";
    }
    svg = "<svg viewBox='0 0 " + ancho + " " + alto + "' width='100%' style='max-width:" + (o.maxAncho || 640) + "px' role='img' aria-label='Grafo con pesos'><defs>";
    for (c in COL) {
      svg += "<marker id='fl-" + c + "' viewBox='0 0 10 10' refX='9' refY='5' markerWidth='7' markerHeight='7' orient='auto'>" +
             "<path d='M0,0 L10,5 L0,10 z' fill='" + COL[c] + "'/></marker>";
    }
    svg += "</defs>";
    i = 0;
    while (i < A.length) {
      var u = A[i][0], v = A[i][1], w = A[i][2], e = o.arista ? o.arista(i) : { color: "gris", grueso: 2 };
      var x1 = o.pos[u][0], y1 = o.pos[u][1], x2 = o.pos[v][0], y2 = o.pos[v][1];
      var dx = x2 - x1, dy = y2 - y1, d = Math.sqrt(dx * dx + dy * dy);
      var dash = e.trazo ? " stroke-dasharray='" + e.trazo + "'" : "";
      var pie = "' fill='none' stroke='" + COL[e.color] + "' stroke-width='" + e.grueso + "'" + dash + (dir ? " marker-end='url(#fl-" + e.color + ")'/>" : "/>");
      var punta = dir ? R + 3 : R;
      if (dir && hay(v, u)) {
        var cx = (x1 + x2) / 2 - dy / d * 28, cy = (y1 + y2) / 2 + dx / d * 28;
        var l1 = Math.sqrt((cx - x1) * (cx - x1) + (cy - y1) * (cy - y1)), l2 = Math.sqrt((cx - x2) * (cx - x2) + (cy - y2) * (cy - y2));
        var p1x = x1 + (cx - x1) / l1 * (R + 1), p1y = y1 + (cy - y1) / l1 * (R + 1);
        var p2x = x2 + (cx - x2) / l2 * punta, p2y = y2 + (cy - y2) / l2 * punta;
        svg += "<path d='M" + p1x + "," + p1y + " Q" + cx + "," + cy + " " + p2x + "," + p2y + pie;
        rotulos += etiqueta(0.25 * p1x + 0.5 * cx + 0.25 * p2x, 0.25 * p1y + 0.5 * cy + 0.25 * p2y, w, e.color);
      } else if (e.curva) {
        var qx = (x1 + x2) / 2 - dy / d * e.curva, qy = (y1 + y2) / 2 + dx / d * e.curva;
        var m1 = Math.sqrt((qx - x1) * (qx - x1) + (qy - y1) * (qy - y1)), m2 = Math.sqrt((qx - x2) * (qx - x2) + (qy - y2) * (qy - y2));
        var r1x = x1 + (qx - x1) / m1 * (R + 1), r1y = y1 + (qy - y1) / m1 * (R + 1);
        var r2x = x2 + (qx - x2) / m2 * punta, r2y = y2 + (qy - y2) / m2 * punta;
        svg += "<path d='M" + r1x + "," + r1y + " Q" + qx + "," + qy + " " + r2x + "," + r2y + pie;
        rotulos += etiqueta(0.25 * r1x + 0.5 * qx + 0.25 * r2x, 0.25 * r1y + 0.5 * qy + 0.25 * r2y, w, e.color);
      } else {
        svg += "<path d='M" + (x1 + dx / d * (R + 1)) + "," + (y1 + dy / d * (R + 1)) + " L" + (x2 - dx / d * punta) + "," + (y2 - dy / d * punta) + pie;
        rotulos += etiqueta((x1 + x2) / 2, (y1 + y2) / 2, w, e.color);
      }
      i = i + 1;
    }
    svg += rotulos;
    i = 0;
    while (i < o.n) {
      var s = o.nodo ? o.nodo(i) : {}, X = o.pos[i][0], Y = o.pos[i][1];
      var relleno = s.relleno || "#ffffff", borde = s.borde || "#6b7280", grueso = s.grueso || 2.2;
      if (s.cuadrado) {
        svg += "<rect x='" + (X - R) + "' y='" + (Y - R) + "' width='" + (2 * R) + "' height='" + (2 * R) + "' rx='4' fill='" + relleno + "' stroke='" + borde + "' stroke-width='" + grueso + "'/>";
      } else {
        svg += "<circle cx='" + X + "' cy='" + Y + "' r='" + R + "' fill='" + relleno + "' stroke='" + borde + "' stroke-width='" + grueso + "'/>";
      }
      svg += "<text x='" + X + "' y='" + (Y + 5) + "' text-anchor='middle' font-size='14' font-weight='700' fill='" + (s.tinta || "#24292f") + "'>" + (o.nombre ? o.nombre(i) : i) + "</text>";
      if (s.nota) {
        svg += "<text x='" + X + "' y='" + (Y - R - 5) + "' text-anchor='middle' font-size='12' font-weight='700' fill='" + (s.notaColor || "#1f5fa8") +
               "' stroke='#ffffff' stroke-width='3' paint-order='stroke'>" + s.nota + "</text>";
      }
      i = i + 1;
    }
    return svg + "</svg>";
  }
  return { dibujar: dibujar, COL: COL, signo: signo };
})();

if (typeof module !== "undefined") { module.exports = GRAFOSVG; }
