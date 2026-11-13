/* Ejercicio interactivo: el bosque, operacion por operacion.
   Corre los ocho make_set y las siete uniones de la sesion con el codigo de
   union_find.py, un paso por linea. La simulacion vive en lib.js. */
var UF = (typeof module !== "undefined") ? require("./lib.js") : UF;

var EJERCICIO = (function () {
  var SUB = UF.subidasDeLaRaiz(UF.ELEMS, UF.SEC);

  var PRED = {
    respuesta: SUB.subidas,
    evaluar: function (valor) {
      if (valor === SUB.subidas) {
        return { ok: true, msg: "Son " + SUB.subidas + ", y la raíz que queda al final es " + SUB.raiz +
          ": sube en union(1,4) y en union(1,5), los dos empates en que participa." };
      }
      if (valor === SUB.empates) {
        return { ok: false, msg: "Esos son los empates de toda la secuencia. En dos de ellos la raíz que sube es otra: 3 y 5." };
      }
      if (valor === Object.keys(SUB.todas).length) {
        return { ok: false, msg: "Esas son las raíces cuyo rango sube alguna vez: 1, 3 y 5. La pregunta es por una sola de ellas." };
      }
      if (valor === UF.SEC.length) {
        return { ok: false, msg: "El rango no sube en cada unión. Dos de cada tres uniones de esta secuencia lo dejan igual." };
      }
      return { ok: false, msg: "Son " + SUB.subidas + ". La raíz final es " + SUB.raiz +
        " y sube una vez por cada empate en que la comparación la toma como rx." };
    }
  };

  /* Lo que find_set(7) hace sobre el bosque que queda al final. */
  function finalFindSet() {
    var estados = UF.estadosCurso(UF.ELEMS, UF.SEC);
    var p = estados[estados.length - 1].p;
    var c = UF.comprimir(p, 7), movidos = [];
    UF.ELEMS.forEach(function (x) { if (c.p[x] !== p[x]) { movidos.push(x); } });
    return { antes: p, despues: c.p, camino: c.camino, movidos: movidos,
             raiz: UF.raiz(p, 7), saltos: UF.saltos(p, 7) };
  }

  return { PRED: PRED, SUB: SUB, finalFindSet: finalFindSet };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO;
    function el(id) { return document.getElementById(id); }

    function bosque(a) {
      var p = a === null ? {} : a.p, altura;
      if (Object.keys(p).length === 0) {
        el("panel-bosque").innerHTML = "";
        return;
      }
      altura = UF.layoutBosque(p).altura;
      el("panel-bosque").innerHTML = UF.dibujarBosque({
        p: p, alto: 40 + 70 * (1 + altura), maxAncho: 620,
        arista: function (hijo) {
          if (hijo === a.movido && a.linea === 15) { return { color: "azul", grueso: 3.5 }; }
          if (hijo === a.nuevo && (a.linea === 24 || a.linea === 26 || a.linea === 28)) {
            return { color: "verde", grueso: 3.5 };
          }
          return { color: "gris", grueso: 2 };
        },
        nodo: function (x) {
          var mirando = a.pila.indexOf(x) >= 0, raiz = p[x] === x;
          var relleno = "#ffffff", borde = "#6b7280", grueso = 2;
          if (raiz) { relleno = "#e7f2e8"; borde = "#2e7d32"; }
          if (mirando) { relleno = "#fdf1dc"; borde = "#e8a13d"; grueso = 3; }
          if (x === a.rx || x === a.ry) { borde = "#1f5fa8"; grueso = 3; }
          return { relleno: relleno, borde: borde, grueso: grueso,
                   nota: raiz && a.rango[x] !== undefined ? "rango " + a.rango[x] : "" };
        }
      });
    }

    function operaciones(a) {
      var actual = a === null ? null : a.op, porVenir = false, s = "";
      function marcar(rotulo, nombre) {
        var cl;
        if (actual === null) { cl = "par"; }
        else if (actual.indexOf(nombre) === 0) { cl = "par ahora"; porVenir = true; }
        else { cl = porVenir ? "par" : "par hecho"; }
        s = s + "<span class='" + cl + "'>" + rotulo + "</span> ";
      }
      marcar("make_set × 8", "make_set");
      UF.SEC.forEach(function (par) {
        var nombre = "union(" + par[0] + "," + par[1] + ")";
        marcar(nombre, nombre);
      });
      el("ver-ops").innerHTML = s;
    }

    function aviso(a) {
      var caja = el("aviso");
      if (a !== null && a.linea === 15 && a.movido !== null) {
        caja.className = "alerta";
        caja.innerHTML = "La línea 15 acaba de reenganchar a <b>" + a.movido +
          "</b>: su padre pasó a ser " + a.p[a.movido] + ", y ninguna unión lo tocó.";
      } else if (a !== null && a.op === "union(7,6)") {
        caja.className = "alerta";
        caja.innerHTML = "En esta unión <b>6</b> cambia de padre dentro de <code>find_set</code>, antes de que " +
          "se compare un solo rango.";
      } else {
        caja.className = "alerta oculto";
        caja.innerHTML = "";
      }
    }

    function alPintar(e) {
      var a = e.actual;
      bosque(a);
      operaciones(a);
      aviso(a);
      el("ver-op").textContent = a === null ? "–" : a.op;
      el("ver-pila").textContent = (a === null || a.pila.length === 0) ? "vacía" :
        a.pila.map(function (x) { return "find_set(" + x + ")"; }).join(" → ");
      el("tabla-arreglos").innerHTML = a === null ? "" :
        UF.tablaArreglos(a.p, a.rango, UF.ELEMS, a.movido === null ? [] : [a.movido]);
      el("ver-rango").textContent = a === null ? "–" : UF.textoRango(a.rango, UF.ELEMS);
      el("ver-final").innerHTML = e.terminado && a !== null
        ? "Quedó un árbol con raíz <b>" + UF.raiz(a.p, 1) + "</b> y rango " + a.rango[UF.raiz(a.p, 1)] +
          ". Los rangos de 3 y de 5 se quedaron en 1: siguen escritos y ya nadie los mira."
        : "";
    }

    Motor.iniciar({
      codigo: UF.CODIGO,
      simular: function () { return UF.simCurso(UF.ELEMS, UF.SEC); },
      chips: [{ campo: "fx", rotulo: "x" }, { campo: "rx", rotulo: "rx" },
              { campo: "ry", rotulo: "ry" }, { campo: "caso", rotulo: "caso", clase: "cuenta" }],
      paramsIniciales: null, alPintar: alPintar
    });
    Motor.prediccionNumerica(function (valor) { return E.PRED.evaluar(valor); });

    el("ver-secuencia").textContent = UF.SEC.map(function (s) {
      return "(" + s[0] + ", " + s[1] + ")";
    }).join(", ");

    el("btn-find7").addEventListener("click", function () {
      var f = E.finalFindSet();
      el("ver-find7").innerHTML =
        "<p class='pregunta' style='margin-top:0'>Sube por " + f.camino.join(" → ") +
        " y devuelve " + f.raiz + ". Al volver escribe <code>p[" + f.movidos.join("] = " + f.raiz + "</code>, <code>p[") +
        "] = " + f.raiz + "</code>; las demás casillas del camino ya apuntaban ahí.</p>" +
        UF.tablaArreglos(f.despues, null, UF.ELEMS, f.movidos) +
        "<p class='nota'>Los " + f.saltos + " saltos de 7 quedaron en 1, y nadie hizo ninguna unión.</p>";
    });
  })();
}
