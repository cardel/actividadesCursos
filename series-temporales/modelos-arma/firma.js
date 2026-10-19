/* La firma de un AR, un MA y un ARMA. Un ARMA(2,1) simulado con semilla fija,
   su ACF y su PACF; los deslizadores cambian φ₁, φ₂ y θ y el ruido queda
   igual. Las preguntas usan los valores de la simulación de esta página. */
(function () {
  "use strict";

  function fmt(v, d) {
    var t = v.toFixed(d === undefined ? 2 : d);
    if (Number(t) === 0) { t = t.replace("-", ""); }
    return t.replace(".", ",").replace("-", "−");
  }

  var N = 110, SEMILLA = 23, NLAGS = 20, BANDA = Series.banda(N);

  function nombre(p1, p2, th) {
    var p = p2 !== 0 ? 2 : p1 !== 0 ? 1 : 0, q = th !== 0 ? 1 : 0;
    if (p === 0 && q === 0) { return "ruido blanco"; }
    if (q === 0) { return "AR(" + p + ")"; }
    if (p === 0) { return "MA(1)"; }
    return "ARMA(" + p + ",1)";
  }

  function analizar(p1, p2, th) {
    var phis = [p1, p2], thetas = [th];
    var y = Series.arma(phis, thetas, N, SEMILLA);
    var estable = Series.estacionarioAR2(p1, p2);
    var r = Series.acf(y, NLAGS), p = Series.pacf(y, NLAGS);
    function fuera(v) {
      var f = [];
      for (var k = 1; k <= NLAGS; k++) { if (Math.abs(v[k]) > BANDA) { f.push(k); } }
      return f;
    }
    return {
      p1: p1, p2: p2, th: th, nombre: nombre(p1, p2, th), y: y, estable: estable,
      acf: r, pacf: p, fueraAcf: fuera(r), fueraPacf: fuera(p),
      teorica: estable ? Series.acfTeorica(phis, thetas, NLAGS) : null
    };
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

  function primeros(v, h) {
    return v.slice(1, h + 1).map(function (x) { return fmt(x); }).join("; ");
  }

  var ma = analizar(0, 0, 0.8), ar2 = analizar(0.5, 0.3, 0), onda = analizar(1, -0.5, 0);
  var fuera2 = analizar(0.6, 0.5, 0), arma = analizar(0.7, 0, 0.7), ruido = analizar(0, 0, 0);
  var ma95 = Series.acfTeorica([], [0.95], 1)[1];

  var alternaPacf = ma.pacf[1] > 0 && ma.pacf[2] < 0 && ma.pacf[3] > 0;
  var ondaSigno = onda.teorica[1] > 0 && onda.teorica[4] < 0 && onda.teorica[8] > 0;

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover los coeficientes",
    definicion: null,
    explicacion: "La página arranca en un MA(1) con θ = 0,8: cada valor es el ruido de hoy más el 80 % del ruido de ayer. Prediga sus dos correlogramas.",
    items: [
      { valor: "¿Cómo se ve la ACF?",
        opciones: ["Baja despacio, rezago a rezago", "Una sola barra fuera, en k = 1", "Ninguna barra fuera"], correcta: 1,
        razon: "Sale de la banda en " + lista(ma.fueraAcf) + "; de k = 1 a 4 vale " + primeros(ma.acf, 4) + ". Dos valores separados por dos o más meses no comparten ningún ruido, y su correlación teórica es cero." },
      { valor: "¿Y la PACF?",
        opciones: ["Una sola barra fuera, en k = 1", "Baja alternando de signo", "Es igual a la ACF"], correcta: alternaPacf ? 1 : 0,
        razon: "De k = 1 a 4 vale " + primeros(ma.pacf, 4) + ", y sale de la banda en " + lista(ma.fueraPacf) + ". Escrito en función de sus valores pasados, un MA(1) necesita todos los rezagos, con pesos que se achican y cambian de signo." }
    ],
    cierre: "En un MA(1) se corta la ACF y la PACF baja de a poco: al revés que en el AR(1)."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con los deslizadores",
    definicion: null,
    explicacion: "Responda moviendo los coeficientes o con los botones.",
    items: [
      { valor: "Con φ₁ = φ₂ = 0, lleve θ hasta 0,95. ¿Cuánto llega a valer la ACF teórica en k = 1?",
        opciones: ["0,95", "Menos de 0,5", "1"], correcta: 1,
        razon: "Con θ = 0,95 vale " + fmt(ma95, 3) + ". En un MA(1) la ACF en k = 1 es θ/(1 + θ²), que nunca pasa de 0,5. Una primera barra de 0,8 no puede venir de un MA(1)." },
      { valor: "Con el AR(2) de φ₁ = 0,5 y φ₂ = 0,3, ¿dónde se corta la PACF?",
        opciones: ["Después de k = 1", "Después de k = 2", "No se corta"], correcta: 1,
        razon: "De k = 1 a 3 vale " + primeros(ar2.pacf, 3) + " y sale de la banda en " + lista(ar2.fueraPacf) + ". Un AR(2) mira dos meses atrás: el rezago 3 no agrega nada que los dos primeros no digan. La ACF, en cambio, sale de la banda en " + lista(ar2.fueraAcf) + "." },
      { valor: "Con φ₁ = 1 y φ₂ = −0,5, ¿qué forma tiene la ACF?",
        opciones: ["Baja sin cambiar de signo", "Se corta después de k = 2", "Una onda que se apaga"], correcta: ondaSigno ? 2 : 0,
        razon: "La teórica vale " + fmt(onda.teorica[1]) + " en k = 1, " + fmt(onda.teorica[4]) + " en k = 4 y " + fmt(onda.teorica[8]) + " en k = 8: sube y baja cada vez menos. Un φ₂ negativo frena la subida que empuja φ₁, y la serie oscila." },
      { valor: "Con φ₁ = 0,6 y φ₂ = 0,5, ¿qué hace la serie?",
        opciones: ["Oscila alrededor de cero", "Se dispara y no vuelve", "Lo mismo que con 0,5 y 0,3"], correcta: 1,
        razon: "φ₁ + φ₂ = 1,1, más que 1: un choque no se apaga, crece de un dato al siguiente, y el último de los 110 datos vale " + Math.round(fuera2.y[N - 1]).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " con un ruido de desviación estándar 1. Un AR(2) solo es estacionario dentro del triángulo φ₁ + φ₂ < 1, φ₂ − φ₁ < 1, |φ₂| < 1." },
      { valor: "Con el ARMA(1,1) de φ₁ = 0,7 y θ = 0,7, ¿cuál de los dos correlogramas se corta?",
        opciones: ["La ACF", "La PACF", "Ninguno: los dos bajan de a poco"], correcta: 2,
        razon: "La ACF sale de la banda en " + lista(arma.fueraAcf) + " y la PACF en " + lista(arma.fueraPacf) + ", alternando de signo: " + primeros(arma.pacf, 4) + ". La parte AR hace que la ACF decaiga, y la parte MA, que la PACF también decaiga." }
    ],
    cierre: "Se corta la ACF: MA. Se corta la PACF: AR. No se corta ninguna: ARMA."
  };

  /* --- Interfaz ----------------------------------------------------- */
  if (typeof document === "undefined") {
    module.exports = { analizar: analizar, ANTES: ANTES, DESPUES: DESPUES };
    return;
  }

  var d1 = document.getElementById("phi1"), d2 = document.getElementById("phi2"), dt = document.getElementById("theta");

  function dibujar() {
    var p1 = Number(d1.value), p2 = Number(d2.value), th = Number(dt.value);
    var a = analizar(p1, p2, th);
    document.getElementById("phi1-valor").textContent = fmt(p1);
    document.getElementById("phi2-valor").textContent = fmt(p2);
    document.getElementById("theta-valor").textContent = fmt(th);
    var teo = a.estable
      ? " ACF teórica en k = 1: <b>" + fmt(a.teorica[1]) + "</b>; en k = 2: <b>" + fmt(a.teorica[2]) + "</b>."
      : " <b>Fuera de la región estacionaria</b>: la serie se dispara y la ACF teórica no existe.";
    document.getElementById("lectura").innerHTML =
      "Modelo: <b>" + a.nombre + "</b>." + teo + " Fuera de la banda ±" + fmt(BANDA, 3) +
      ": ACF en " + lista(a.fueraAcf) + "; PACF en " + lista(a.fueraPacf) + ".";
    document.getElementById("figura-serie").innerHTML = Grafica.lineas({
      titulo: a.nombre + " con φ₁ = " + fmt(p1) + ", φ₂ = " + fmt(p2) + ", θ = " + fmt(th),
      cero: true, alto: 200, etiquetaX: "t", lineas: [{ valores: a.y }]
    });
    document.getElementById("figura-acf").innerHTML = Grafica.correlograma(a.acf, N,
      { titulo: "ACF", ancho: 380, alto: 220, marcasX: [0, 5, 10, 15, 20] });
    document.getElementById("figura-pacf").innerHTML = Grafica.correlograma(a.pacf, N,
      { titulo: "PACF", ancho: 380, alto: 220, desde: 1, marcasX: [1, 5, 10, 15, 20] });
  }

  [d1, d2, dt].forEach(function (d) { d.addEventListener("input", dibujar); });
  document.querySelectorAll("#presets button").forEach(function (b) {
    b.addEventListener("click", function () {
      var c = b.getAttribute("data-c").split(",");
      d1.value = c[0]; d2.value = c[1]; dt.value = c[2];
      dibujar();
    });
  });
  dibujar();

  document.getElementById("cierre-tabla").innerHTML =
    "<table><thead><tr><th>modelo</th><th>coeficientes</th><th>ACF fuera de la banda</th><th>PACF fuera de la banda</th></tr></thead><tbody>" +
    [ruido, ma, ar2, onda, arma].map(function (a) {
      return "<tr><td>" + a.nombre + "</td><td>φ₁ = " + fmt(a.p1) + ", φ₂ = " + fmt(a.p2) + ", θ = " + fmt(a.th) +
        "</td><td>" + lista(a.fueraAcf) + "</td><td>" + lista(a.fueraPacf) + "</td></tr>";
    }).join("") + "</tbody></table>";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
