/* ¿De qué modelo son estos correlogramas? Cuatro series simuladas con
   semillas fijas (AR(1), MA(1), AR(2) y ARMA(1,1)), en desorden, con su ACF
   y su PACF. El deslizador cambia cuántos datos se simulan. */
(function () {
  "use strict";

  function fmt(v, d) {
    var t = v.toFixed(d === undefined ? 2 : d);
    if (Number(t) === 0) { t = t.replace("-", ""); }
    return t.replace(".", ",").replace("-", "−");
  }

  var NLAGS = 15, N0 = 300;
  /* El orden en que se muestran: A, B, C, D. */
  var LETRAS = ["A", "B", "C", "D"];
  var MODELOS = [
    { nombre: "ARMA(1,1)", texto: "φ = 0,6 y θ = 0,6", phis: [0.6], thetas: [0.6], semilla: 103 },
    { nombre: "AR(1)", texto: "φ = 0,7", phis: [0.7], thetas: [], semilla: 100 },
    { nombre: "MA(1)", texto: "θ = −0,7", phis: [], thetas: [-0.7], semilla: 101 },
    { nombre: "AR(2)", texto: "φ₁ = 0,5 y φ₂ = 0,3", phis: [0.5, 0.3], thetas: [], semilla: 102 }
  ];

  function analizar(m, n) {
    var y = Series.arma(m.phis, m.thetas, n, m.semilla);
    var r = Series.acf(y, NLAGS), p = Series.pacf(y, NLAGS), b = Series.banda(n);
    function fuera(v) {
      var f = [];
      for (var k = 1; k <= NLAGS; k++) { if (Math.abs(v[k]) > b) { f.push(k); } }
      return f;
    }
    return { acf: r, pacf: p, fueraAcf: fuera(r), fueraPacf: fuera(p), banda: b };
  }

  function lista(f) {
    if (!f.length) { return "ninguno"; }
    var partes = [], i = 0;
    while (i < f.length) {
      var j = i;
      while (j + 1 < f.length && f[j + 1] === f[j] + 1) { j++; }
      partes.push(j - i >= 2 ? f[i] + " a " + f[j] : f.slice(i, j + 1).join(", "));
      i = j + 1;
    }
    return partes.join(", ");
  }

  function letra(nombre) {
    for (var i = 0; i < MODELOS.length; i++) { if (MODELOS[i].nombre === nombre) { return i; } }
    return -1;
  }

  var A0 = MODELOS.map(function (m) { return analizar(m, N0); });
  var A100 = MODELOS.map(function (m) { return analizar(m, 100); });
  function huella(nombre) {
    var a = A0[letra(nombre)];
    return "la ACF sale de la banda en " + lista(a.fueraAcf) + " y la PACF en " + lista(a.fueraPacf);
  }
  var iAR2 = letra("AR(2)"), iMA = letra("MA(1)");
  /* La primera barra de la ACF del MA(1), después de k = 1, que sale con 100 datos. */
  var extraMA = A100[iMA].fueraAcf.filter(function (k) { return k > 1; })[0];

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mirar",
    definicion: null,
    explicacion: "Un AR(1) y un ARMA(1,1) tienen las dos la ACF que decae.",
    items: [
      { valor: "¿Cuál de los dos correlogramas los separa?",
        opciones: ["La ACF", "La PACF", "Ninguno"], correcta: 1,
        razon: "La PACF: en el AR(1) se corta después de k = 1 y en el ARMA(1,1) decae. Con n = 300, el AR(1) de esta página deja fuera de la banda la PACF en " + lista(A0[letra("AR(1)")].fueraPacf) + " y el ARMA(1,1), en " + lista(A0[letra("ARMA(1,1)")].fueraPacf) + "." }
    ],
    cierre: "La ACF dice que hay memoria; la PACF dice si esa memoria cabe en unos pocos rezagos."
  };

  var EMPAREJAR = {
    id: "emparejar",
    titulo: "3. Empareje cada modelo con su letra",
    definicion: null,
    explicacion: "Busque primero cuál de los dos correlogramas se corta, con el deslizador en 300.",
    opciones: LETRAS,
    items: [
      { valor: "AR(1), φ = 0,7", correcta: letra("AR(1)"),
        razon: "Es " + LETRAS[letra("AR(1)")] + ": " + huella("AR(1)") + ". Una PACF con una sola barra y una ACF que baja de forma geométrica, desde " + fmt(A0[letra("AR(1)")].acf[1]) + "." },
      { valor: "MA(1), θ = −0,7", correcta: iMA,
        razon: "Es " + LETRAS[iMA] + ": " + huella("MA(1)") + ". La ACF se corta en k = 1 con " + fmt(A0[iMA].acf[1]) + ", cerca de la teórica θ/(1 + θ²) = −0,47, y la PACF decae con las primeras barras negativas: " + A0[iMA].pacf.slice(1, 5).map(function (x) { return fmt(x); }).join("; ") + "." },
      { valor: "AR(2), φ₁ = 0,5 y φ₂ = 0,3", correcta: iAR2,
        razon: "Es " + LETRAS[iAR2] + ": " + huella("AR(2)") + ". La PACF se corta después de k = 2, con " + fmt(A0[iAR2].pacf[2]) + " en el segundo rezago." },
      { valor: "ARMA(1,1), φ = 0,6 y θ = 0,6", correcta: letra("ARMA(1,1)"),
        razon: "Es " + LETRAS[letra("ARMA(1,1)")] + ": " + huella("ARMA(1,1)") + ". Ninguno de los dos se corta, y la PACF alterna de signo: " + A0[letra("ARMA(1,1)")].pacf.slice(1, 5).map(function (x) { return fmt(x); }).join("; ") + "." },
      { valor: "Baje n a 100. La ACF de " + LETRAS[iMA] + " saca una barra en k = " + extraMA + ". ¿Qué hace con ella?",
        opciones: ["Proponer un MA(" + extraMA + ")", "Cambiar de letra", "Nada: puede ser azar"], correcta: 2,
        razon: "Con 100 datos la banda se ensancha a ±" + fmt(A100[iMA].banda, 3) + " y la barra de k = " + extraMA + " vale " + fmt(A100[iMA].acf[extraMA]) + "; con 300 datos vale " + fmt(A0[iMA].acf[extraMA]) + " y queda adentro. En un ruido blanco sale, en promedio, una barra de cada veinte. Una barra suelta lejos de los primeros rezagos no alcanza para proponer un término." }
    ],
    cierre: "Corte en la PACF: AR. Corte en la ACF: MA. Sin corte: ARMA."
  };

  /* --- Interfaz ----------------------------------------------------- */
  if (typeof document === "undefined") {
    module.exports = { MODELOS: MODELOS, analizar: analizar, ANTES: ANTES, EMPAREJAR: EMPAREJAR };
    return;
  }

  var deslizador = document.getElementById("n");

  function dibujar() {
    var n = Number(deslizador.value);
    document.getElementById("n-valor").textContent = n;
    document.getElementById("lectura").innerHTML = "Con n = " + n + " la banda mide <b>±" + fmt(Series.banda(n), 3) + "</b>.";
    document.getElementById("candidatos").innerHTML = MODELOS.map(function (m, i) {
      var a = analizar(m, n);
      return "<figure>" +
        Grafica.correlograma(a.acf, n, { titulo: "ACF", ancho: 380, alto: 170, etiquetaX: "", marcasX: [0, 5, 10, 15] }) +
        Grafica.correlograma(a.pacf, n, { titulo: "PACF", ancho: 380, alto: 170, desde: 1, marcasX: [1, 5, 10, 15] }) +
        "<figcaption>" + LETRAS[i] + "</figcaption></figure>";
    }).join("");
  }
  deslizador.addEventListener("input", dibujar);
  dibujar();

  document.getElementById("cierre-tabla").innerHTML =
    "<table><thead><tr><th></th><th>modelo</th><th>ACF fuera (n = 300)</th><th>PACF fuera (n = 300)</th><th>se corta</th></tr></thead><tbody>" +
    MODELOS.map(function (m, i) {
      var corta = m.nombre === "MA(1)" ? "la ACF" : m.nombre === "ARMA(1,1)" ? "ninguno" : "la PACF";
      return "<tr><td>" + LETRAS[i] + "</td><td>" + m.nombre + ", " + m.texto + "</td><td>" + lista(A0[i].fueraAcf) +
        "</td><td>" + lista(A0[i].fueraPacf) + "</td><td>" + corta + "</td></tr>";
    }).join("") + "</tbody></table>";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [EMPAREJAR], destino: "emparejar", alTerminar: terminado });
})();
