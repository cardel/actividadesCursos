/* Ejercicio interactivo: que pasa sin las heuristicas.
   La misma secuencia corre dos veces con find_set sin la linea que acorta:
   a la izquierda sin union por rango, a la derecha con ella. Al final se
   aplica el find_set del curso y se vuelven a contar los saltos. */
var UF = (typeof module !== "undefined") ? require("./lib.js") : UF;

var EJERCICIO = (function () {
  var COMPRIMIR = 6;
  var SIN = UF.correrVariante(UF.ELEMS, UF.SEC, false);
  var CON = UF.correrVariante(UF.ELEMS, UF.SEC, true);

  function tras(r) {
    var fin = r.estados[r.estados.length - 1].p;
    var c = UF.comprimir(fin, COMPRIMIR);
    return { p: c.p, camino: c.camino, perfil: UF.perfil(c.p, UF.ELEMS) };
  }

  var SIN_TRAS = tras(SIN), CON_TRAS = tras(CON);

  var CIFRAS = {
    comprimido: COMPRIMIR,
    sin: { altura: SIN.perfil.altura, suma: SIN.perfil.suma, hondo: SIN.perfil.hondo },
    con: { altura: CON.perfil.altura, suma: CON.perfil.suma, hondo: CON.perfil.hondo },
    sinTras: { altura: SIN_TRAS.perfil.altura, suma: SIN_TRAS.perfil.suma, hondo: SIN_TRAS.perfil.hondo },
    conTras: { altura: CON_TRAS.perfil.altura, suma: CON_TRAS.perfil.suma, hondo: CON_TRAS.perfil.hondo }
  };

  var PRED = {
    respuesta: SIN.perfil.altura,
    opciones: function () {
      var camino = UF.camino(SIN.estados[SIN.estados.length - 1].p, SIN.perfil.hondo);
      var lista = [
        { valor: SIN.perfil.altura, clave: "correcta",
          razon: "Correcto: son " + SIN.perfil.altura + ", el camino de " + SIN.perfil.hondo +
            " es " + camino.join(" → ") + "." },
        { valor: CON.perfil.altura, clave: "con-rango",
          razon: "Eso cuesta con la unión por rango encendida. Sin ella el camino más largo es el doble." },
        { valor: UF.SEC.length, clave: "uniones",
          razon: "Siete uniones no dejan siete niveles: una unión agrega un nivel solo si el árbol que cuelga ya tenía altura." },
        { valor: UF.ELEMS.length, clave: "elementos",
          razon: "Ocho es la cantidad de elementos. Lo que se cuenta son los saltos de uno de ellos hasta su raíz." }
      ];
      var vistos = [];
      return lista.filter(function (o) {
        var nuevo = vistos.indexOf(o.valor) < 0;
        vistos.push(o.valor);
        return nuevo;
      });
    }
  };

  return { SIN: SIN, CON: CON, SIN_TRAS: SIN_TRAS, CON_TRAS: CON_TRAS,
           CIFRAS: CIFRAS, PRED: PRED, COMPRIMIR: COMPRIMIR };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, k = 0, comprimido = false;
    var TOPE = E.SIN.estados.length - 1;
    function el(id) { return document.getElementById(id); }

    function dibujo(caja, p, rango, resaltar) {
      el(caja).innerHTML = UF.dibujarBosque({
        p: p, alto: 40 + 62 * (1 + UF.layoutBosque(p).altura), ancho: 460, maxAncho: 460,
        arista: function (hijo) {
          var dentro = resaltar.indexOf(hijo) >= 0;
          return { color: dentro ? "rojo" : "gris", grueso: dentro ? 3.5 : 2 };
        },
        nodo: function (x) {
          var raiz = p[x] === x, hondo = resaltar.length > 0 && x === resaltar[0];
          return { relleno: hondo ? "#fbe9e7" : (raiz ? "#e7f2e8" : "#ffffff"),
                   borde: hondo ? "#b3261e" : (raiz ? "#2e7d32" : "#6b7280"),
                   grueso: hondo ? 3 : 2,
                   nota: raiz && rango !== null && rango[x] > 0 ? "rango " + rango[x] : "" };
        }
      });
    }

    function fila(nombre, p) {
      var f = UF.perfil(p, UF.ELEMS);
      return "<tr><td>" + nombre + "</td><td>" + f.altura + "</td><td>" + f.hondo +
        "</td><td>" + f.saltos[f.hondo] + "</td><td>" + f.suma + "</td></tr>";
    }

    function pintar() {
      var a = E.SIN.estados[k], b = E.CON.estados[k];
      var hondoA = UF.perfil(a.p, UF.ELEMS), hondoB = UF.perfil(b.p, UF.ELEMS);
      dibujo("bosque-sin", a.p, null, UF.camino(a.p, hondoA.hondo));
      dibujo("bosque-con", b.p, b.rango, UF.camino(b.p, hondoB.hondo));
      el("ver-op").textContent = a.op;
      el("ver-paso").textContent = k;
      el("ver-total").textContent = TOPE;
      el("tabla-saltos").innerHTML = "<table><tr><th>bosque</th><th>altura</th>" +
        "<th>el que más salta</th><th>saltos</th><th>suma de los ocho</th></tr>" +
        fila("sin rango", a.p) + fila("con rango", b.p) + "</table>";
      el("btn-paso").disabled = k >= TOPE;
      el("btn-fin").disabled = k >= TOPE;
    }

    el("btn-paso").addEventListener("click", function () { if (k < TOPE) { k = k + 1; } pintar(); });
    el("btn-fin").addEventListener("click", function () { k = TOPE; pintar(); });
    el("btn-reiniciar").addEventListener("click", function () { k = 0; pintar(); });

    el("btn-comprimir").addEventListener("click", function () {
      var c = E.CIFRAS, x = E.COMPRIMIR;
      comprimido = !comprimido;
      if (!comprimido) {
        el("ver-comprimir").innerHTML = "";
        el("btn-comprimir").textContent = "Correr find_set(" + x + ") en los dos";
        return;
      }
      el("btn-comprimir").textContent = "Volver a los dos bosques de antes";
      el("ver-comprimir").innerHTML =
        "<div class='bosques'><div><h3>sin rango</h3><div class='dibujo' id='tras-sin'></div></div>" +
        "<div><h3>con rango</h3><div class='dibujo' id='tras-con'></div></div></div>" +
        "<table><tr><th>bosque</th><th>saltos de " + x + " antes</th><th>después</th>" +
        "<th>suma antes</th><th>después</th></tr>" +
        "<tr><td>sin rango</td><td>" + UF.saltos(E.SIN.estados[TOPE].p, x) + "</td><td>" +
        UF.saltos(E.SIN_TRAS.p, x) + "</td><td>" + c.sin.suma + "</td><td>" + c.sinTras.suma + "</td></tr>" +
        "<tr><td>con rango</td><td>" + UF.saltos(E.CON.estados[TOPE].p, x) + "</td><td>" +
        UF.saltos(E.CON_TRAS.p, x) + "</td><td>" + c.con.suma + "</td><td>" + c.conTras.suma + "</td></tr>" +
        "</table><p class='nota'>La llamada subió por " + E.SIN_TRAS.camino.join(" → ") +
        " en el bosque de la izquierda y por " + E.CON_TRAS.camino.join(" → ") +
        " en el de la derecha. La altura del primero quedó en " + c.sinTras.altura +
        " y la del segundo en " + c.conTras.altura + ".</p>";
      dibujo("tras-sin", E.SIN_TRAS.p, null, [x]);
      dibujo("tras-con", E.CON_TRAS.p, null, [x]);
    });

    Motor.opcionesNumericas("opciones-prediccion", "veredicto", function () {
      return E.PRED.opciones();
    });

    el("btn-comprimir").textContent = "Correr find_set(" + E.COMPRIMIR + ") en los dos";
    pintar();
  })();
}
