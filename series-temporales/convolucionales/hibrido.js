/* El híbrido paso a paso: el SARIMA, sus residuos, el residuo que pronostica el
   MLP y la suma, mes a mes en 2025. Los pronósticos vienen de datos.js; la suma,
   los errores y el MAE se calculan aquí. */
(function () {
  "use strict";

  var P = Pronostico, C = Convolucion, H = DATOS.hibrido, B = DATOS.backtest;
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
    "septiembre", "octubre", "noviembre", "diciembre"];
  var k25 = SERIE.meses.indexOf("2025-01");
  var real = SERIE.valores.slice(k25, k25 + 12).map(function (x) { return x / 1e6; });
  var base = H.base, red = H.red;
  var suma = base.map(function (b, i) { return b + red[i]; });
  var errorBase = real.map(function (r, i) { return r - base[i]; });
  function c3(x) { return C.coma(x, 3); }
  function mae(p) { var s = 0; for (var i = 0; i < 12; i++) { s += Math.abs(p[i] - real[i]); } return s / 12 * 1e6; }

  var peor = 0;
  errorBase.forEach(function (e, i) { if (Math.abs(e) > Math.abs(errorBase[peor])) { peor = i; } });
  var corrige = Math.abs(red[peor]) / Math.abs(errorBase[peor]) * 100;
  var maeBase = mae(base), maeSuma = mae(suma);
  var acf = Series.acf(H.residuo, 12);
  var banda = Series.banda(H.residuo.length);
  var fuera = acf.slice(1).filter(function (r) { return Math.abs(r) > banda; }).length;
  var maxArranque = Math.max.apply(null, H.arranque.map(Math.abs));
  var mediaRes = H.residuo.reduce(function (s, r) { return s + r; }, 0) / H.residuo.length;
  var desv = Math.sqrt(H.residuo.reduce(function (s, r) { return s + (r - mediaRes) * (r - mediaRes); }, 0) / (H.residuo.length - 1));
  var maxRed = Math.max.apply(null, red.map(Math.abs));

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover los controles",
    definicion: "híbrido(t) = SARIMA(t) + residuo pronosticado(t)",
    explicacion: "Los dos pronósticos se hacen por separado y se suman mes a mes.",
    items: [
      { valor: "Para febrero de 2025 el SARIMA pronostica " + c3(base[1]) + " millones y el MLP, un residuo de " + c3(red[1]) +
          ". ¿Cuánto pronostica el híbrido?",
        opciones: [c3(base[1] - red[1]), c3(base[1]), c3(base[1] + red[1])], correcta: 2,
        razon: c3(base[1]) + " + (" + c3(red[1]) + ") = " + c3(base[1] + red[1]) + ". Restar el residuo da " + c3(base[1] - red[1]) +
          ": invierte la corrección. " + c3(base[1]) + " es el SARIMA solo, sin la red." },
      { valor: "¿Por qué se dejan fuera los 13 primeros residuos del SARIMA?",
        opciones: ["Porque el modelo aún no tiene el año anterior con qué comparar",
          "Porque son los meses de la pandemia, que no se repiten",
          "Porque son los meses de 2019 que se rellenaron por interpolación"],
        correcta: 0,
        razon: "El SARIMA(0,1,0)(0,1,1)12 diferencia una vez y una vez con rezago 12: sus primeros 13 meses no tienen con qué restarse. " +
          "El mayor de esos residuos vale " + c3(maxArranque) + " millones, frente a una desviación de " + c3(desv) +
          " en los demás. La pandemia está en 2020, dentro de los residuos que sí se usan." }
    ],
    cierre: "El híbrido suma dos pronósticos; los residuos de arranque no son errores del modelo."
  };

  var DESPUES = {
    id: "despues",
    titulo: "4. Con los controles en la mano",
    definicion: null,
    explicacion: "Use las partes 2 y 3 para responder.",
    items: [
      { valor: "¿En qué mes de 2025 se equivocó más el SARIMA?",
        opciones: [MESES[(peor + 1) % 12], MESES[peor], MESES[(peor + 11) % 12]], correcta: 1,
        razon: "En " + MESES[peor] + ": pronosticó " + c3(base[peor]) + " y se observaron " + c3(real[peor]) + " millones, un error de " +
          c3(errorBase[peor]) + "." },
      { valor: "Ese mes, ¿qué parte del error del SARIMA corrige la red?",
        opciones: [P.coma(100 - corrige, 0) + " %", P.coma(corrige, 0) + " %", "100 %"], correcta: 1,
        razon: "La red pronostica un residuo de " + c3(red[peor]) + " contra un error de " + c3(errorBase[peor]) + ": el " + P.coma(corrige, 0) +
          " %. " + P.coma(100 - corrige, 0) + " % es lo que queda sin corregir. En todo 2025 el residuo de la red no pasa de " + c3(maxRed) + " millones." },
      { valor: "En los doce meses de 2025, ¿cómo cambia el MAE al sumar la red?",
        opciones: ["Sube de " + P.miles(maeBase) + " a " + P.miles(maeSuma), "Baja de " + P.miles(maeBase) + " a " + P.miles(maeSuma),
          "Queda en " + P.miles(maeBase)],
        correcta: maeSuma < maeBase ? 1 : 0,
        razon: "SARIMA solo: " + P.miles(maeBase) + " pasajeros; híbrido: " + P.miles(maeSuma) + ". La diferencia es pequeña frente al error de " +
          MESES[peor] + ", que la red casi no toca." },
      { valor: "¿Cuántos de los primeros 12 rezagos de la autocorrelación del residuo salen de la banda ±1,96/√n?",
        opciones: [String(fuera + 2), String(fuera + 4), String(fuera)], correcta: 2,
        razon: fuera + " de 12. Con " + H.residuo.length + " residuos la banda es ±" + c3(banda) + ", y la autocorrelación del rezago 1 es " +
          C.coma(acf[1], 2) + ". Si el residuo de un mes casi no dice nada del siguiente, la red tiene poco que aprender." },
      { valor: "En el backtest de 13 orígenes, el SARIMA da un MAPE de " + P.coma(B["SARIMA(0,1,0)(0,1,1)12"].MAPE) +
          " y el híbrido con cinco semillas, " + P.coma(B["Híbrido SARIMA + MLP (16,), promedio de 5 semillas"].MAPE) + ". ¿Qué dice eso de 2025?",
        opciones: ["Que la red necesita más épocas para notar la mejora de 2025",
          "Que el backtest se equivocó y hay que creerle a 2025",
          "Que la mejora de 2025 es de un origen y no se sostiene en los trece"],
        correcta: 2,
        razon: "Un año desde un origen es una muestra; el backtest promedia trece. Con cinco semillas el híbrido queda por encima del SARIMA solo: la red sumó ruido más que corrección." }
    ],
    cierre: "La red corrige poco porque al SARIMA le queda poco patrón en el residuo."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES, peor: peor, fuera: fuera };
    return;
  }

  /* Residuos: el arranque en rojo y los que usa la red en azul. */
  var todos = H.arranque.concat(H.residuo);
  document.getElementById("residuos").innerHTML = Grafica.lineas({
    lineas: [{ valores: H.arranque, color: "#c0392b" }, { valores: H.residuo, color: Grafica.AZUL, desde: H.arranque.length }],
    ancho: 640, alto: 220, titulo: "Residuo del SARIMA, millones", etiquetaY: "millones", cero: true,
    marcasX: [0, 13, 37, 61, todos.length - 1], rotuloX: function (i) { return i < 13 ? "2017-01" : H.meses[i - 13]; }
  });
  document.getElementById("lectura-residuos").innerHTML = "Arranque: el mayor vale <b>" + c3(maxArranque) + "</b>. Los " + H.residuo.length +
    " que usa la red: desviación " + c3(desv) + ", autocorrelación " + C.coma(acf[1], 2) + " en el rezago 1 y " + C.coma(acf[12], 2) + " en el 12.";

  function flujo(i) {
    function caja(x, y, w, t, color) {
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="44" rx="5" fill="' + color + '" stroke="#9aa5b1"/>' +
        '<text x="' + (x + w / 2) + '" y="' + (y + 27) + '" text-anchor="middle" font-size="13">' + t + "</text>";
    }
    function flecha(x1, y1, x2, y2) {
      return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#24292f" stroke-width="1.6" marker-end="url(#f)"/>';
    }
    var s = '<defs><marker id="f" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#24292f"/></marker></defs>';
    s += caja(10, 20, 120, "SARIMA", "#eceff3") + caja(10, 100, 120, "MLP sobre residuo", "#e3edf8");
    s += caja(190, 20, 130, "base " + c3(base[i]), "#fff") + caja(190, 100, 130, "residuo " + c3(red[i]), "#fff");
    s += '<circle cx="380" cy="82" r="16" fill="#fff" stroke="#24292f"/><text x="380" y="88" text-anchor="middle" font-size="18">+</text>';
    s += caja(430, 60, 120, "híbrido " + c3(suma[i]), "#d5f0d5") + caja(430, 125, 120, "observado " + c3(real[i]), "#fde3c4");
    s += flecha(130, 42, 188, 42) + flecha(130, 122, 188, 122) + flecha(320, 42, 366, 74) + flecha(320, 122, 366, 92) + flecha(396, 82, 428, 82);
    return '<svg class="grafica" viewBox="0 0 560 180" width="100%" role="img" xmlns="http://www.w3.org/2000/svg">' + s + "</svg>";
  }

  var control = document.getElementById("mes");
  function dibujar() {
    var i = Number(control.value) - 1;
    document.getElementById("mes-valor").textContent = MESES[i];
    document.getElementById("lectura").innerHTML = MESES[i] + " de 2025: " + c3(base[i]) + " + (" + c3(red[i]) + ") = <b>" + c3(suma[i]) +
      "</b>; se observaron " + c3(real[i]) + ". Error del SARIMA " + c3(errorBase[i]) + ", del híbrido " + c3(real[i] - suma[i]) + ".";
    document.getElementById("flujo").innerHTML = flujo(i);
    document.getElementById("figura").innerHTML = Grafica.lineas({
      lineas: [{ valores: real, color: Grafica.AZUL }, { valores: base, color: "#8a94a0" }, { valores: suma, color: "#d9822b" }],
      ancho: 640, alto: 230, titulo: "2025: observado (azul), SARIMA (gris) e híbrido (naranja)", etiquetaY: "millones",
      marcasX: [0, 2, 5, 8, 11], rotuloX: function (k) { return MESES[k].slice(0, 3); }
    });
    document.getElementById("tabla").innerHTML = P.tabla(["Mes", "SARIMA", "Residuo de la red", "Híbrido", "Observado"], base.map(function (b, k) {
      var visto = k <= i, fila = [MESES[k], c3(b), visto ? c3(red[k]) : "", visto ? c3(suma[k]) : "", visto ? c3(real[k]) : ""];
      return k === i ? fila.map(function (t) { return "<b>" + t + "</b>"; }) : fila;
    }));
  }
  control.addEventListener("input", dibujar);
  dibujar();

  document.getElementById("cierre-tabla").innerHTML = P.tabla(["", "Qué", "Lo que lo muestra"], [
    ["Ventaja", "La estacionalidad la pone un modelo que ya la explica", "El SARIMA tiene un solo coeficiente estacional; la red solo pronostica lo que queda."],
    ["Ventaja", "La red corrige en millones pequeños", "En 2025 el residuo de la red no pasa de " + c3(maxRed) + " millones: no puede alejar mucho el pronóstico del SARIMA."],
    ["Limitación", "Si el residuo no tiene patrón, no hay qué aprender", fuera + " de 12 rezagos fuera de la banda; autocorrelación " + C.coma(acf[1], 2) + " en el rezago 1."],
    ["Limitación", "Dos modelos que ajustar en cada origen", "MAPE del backtest: SARIMA " + P.coma(B["SARIMA(0,1,0)(0,1,1)12"].MAPE) + ", híbrido con cinco semillas " +
      P.coma(B["Híbrido SARIMA + MLP (16,), promedio de 5 semillas"].MAPE) + "."]
  ]);
  document.getElementById("cierre-texto").textContent =
    "El híbrido no sale gratis: suma el costo del SARIMA y el de la red, y solo paga si el residuo del primero guarda algo que el segundo pueda aprender. " +
    "La actividad Sobre qué modelo vale un híbrido compara ese residuo con el de otros dos modelos de la tabla.";

  var pendientes = 2;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
})();
