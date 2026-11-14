/* La pandemia dentro de la ventana: cada ventana de la serie pasa por la RNN y
   la LSTM de una neurona de Celdas, con y sin los pasos distorsionados por la
   pandemia, y la huella es lo que cambia h_12. Cierra con tres decisiones del
   curso. Todo se calcula aquí. */
(function () {
  "use strict";

  var C = Celdas, P = Pronostico, V = DATOS.ventana, B = DATOS.backtest;
  var m = SERIE.meses, v = SERIE.valores, n = v.length;
  var U = 0.8, BF = 3, NARANJA = "#d9822b", AZUL = "#1f6feb";
  function c3(x) { return P.coma(x, 3); }

  function pandemia(i) { return i >= 0 && m[i] >= "2020-03" && m[i] <= "2021-11"; }
  /* La diferencia con hace 12 meses en la escala de la red, y si la pandemia la toca. */
  var escala = v.map(function (x, i) { return i < 12 ? null : ((x - v[i - 12]) / 1e6 - V.media) / V.desviacion; });
  var distorsion = v.map(function (x, i) { return i >= 12 && (pandemia(i) || pandemia(i - 12)); });
  var ultimaDistorsion = distorsion.lastIndexOf(true), primeraDistorsion = distorsion.indexOf(true);

  /* La ventana del mes t, la misma con los pasos distorsionados en 0, y la huella de cada red. */
  function caso(t) {
    var w = escala.slice(t - 12, t);
    var limpia = w.map(function (x, k) { return distorsion[t - 12 + k] ? 0 : x; });
    var pasos = w.map(function (x, k) { return distorsion[t - 12 + k] ? k + 1 : 0; }).filter(Boolean);
    var r = C.rnn(w, U)[11], r0 = C.rnn(limpia, U)[11], l = C.lstm(w, BF)[11], l0 = C.lstm(limpia, BF)[11];
    return { w: w, pasos: pasos, rnn: r.h, rnn0: r0.h, lstm: l.h, lstm0: l0.h, c: l.c, c0: l0.c,
      huellaRnn: r.h - r0.h, huellaLstm: l.h - l0.h };
  }

  var desde = m.indexOf("2020-01"), hasta = m.indexOf("2024-06");
  var casos = [];
  for (var t = desde; t <= hasta; t++) { casos.push(caso(t)); }
  function de(mes) { return casos[m.indexOf(mes) - desde]; }
  var tocados = casos.filter(function (c) { return c.pasos.length > 0; }).length;
  var primerTocado = m[primeraDistorsion + 1], ultimoTocado = m[ultimaDistorsion + 12];

  var oct23 = de("2023-10"), may21 = de("2021-05"), jun21 = de("2021-06"), sep21 = de("2021-09");
  var veces = Math.abs(oct23.huellaLstm / oct23.huellaRnn);

  /* Para el río: el factor por paso de cada red en la ventana de enero de 2025, en media geométrica. */
  var pr = C.rnn(C.X, U), pl = C.lstm(C.X, BF);
  function media(fs) { return Math.exp(fs.reduce(function (s, f) { return s + Math.log(f); }, 0) / fs.length); }
  var factorRnn = media(pr.slice(1).map(function (p) { return U * (1 - p.h * p.h); }));
  var factorLstm = media(pl.slice(1).map(function (p) { return p.f; }));
  var rioRnn = Math.pow(factorRnn, 71), rioLstm = Math.pow(factorLstm, 71);

  var ANTES = {
    id: "antes",
    titulo: "1. Antes de mover el control",
    definicion: null,
    explicacion: "Prediga con lo que ya sabe de la diferencia con hace 12 meses y de las dos celdas.",
    items: [
      { valor: "La caída va de marzo de 2020 a noviembre de 2021. ¿Hasta qué mes hay diferencias con hace 12 meses tocadas por la pandemia?",
        opciones: ["noviembre de 2021", P.nombre(m[ultimaDistorsion]), "marzo de 2021"],
        correcta: 1,
        razon: "Hasta " + P.nombre(m[ultimaDistorsion]) + ". La diferencia de un mes de 2022 resta el mismo mes de 2021, que todavía está en la pandemia: después de la caída viene un rebote que también es efecto de ella." },
      { valor: "Cuando la pandemia ya solo ocupa los pasos 1 y 2 de la ventana, ¿cuál de las dos redes la conserva más en h<sub>12</sub>?",
        opciones: ["La RNN con u = 0,8", "Ninguna: son pasos viejos", "La LSTM con b<sub>f</sub> = 3"],
        correcta: 2,
        razon: "La LSTM. En <em>La celda LSTM paso a paso</em>, con b<sub>f</sub> = 3, al paso 12 llega el " + C.pct(C.quedaLstm(pl)[0]) +
          " de la memoria del paso 1, y en la RNN el " + C.pct(C.quedaRnn(pr, U)[0]) + ". Lo que se recuerda bien también se recuerda cuando es un choque." }
    ],
    cierre: "La pandemia entra dos veces a la diferencia, y la LSTM la arrastra más pasos que la RNN."
  };

  var DESPUES = {
    id: "despues",
    titulo: "3. Con el control en la mano",
    definicion: null,
    explicacion: "Recorra los meses y lea la franja, la tabla y la gráfica de la huella.",
    items: [
      { valor: "¿Cuántos meses de pronóstico tienen al menos un paso distorsionado en su ventana?",
        opciones: [String(tocados), "21", "12"],
        correcta: 0,
        razon: tocados + ", de " + P.nombre(primerTocado) + " a " + P.nombre(ultimoTocado) + ". Las diferencias tocadas van de " + P.nombre(m[primeraDistorsion]) + " a " +
          P.nombre(m[ultimaDistorsion]) + ", y cada una aparece en las doce ventanas siguientes." },
      { valor: "Pronóstico de octubre de 2023, con la pandemia solo en los pasos " + oct23.pasos.join(" y ") + ". ¿Cuál es la huella en h<sub>12</sub>?",
        opciones: ["RNN " + c3(oct23.huellaLstm) + ", LSTM " + c3(oct23.huellaRnn), "RNN " + c3(oct23.huellaRnn) + ", LSTM " + c3(oct23.huellaLstm), "Las dos en 0,000"],
        correcta: 1,
        razon: "RNN " + c3(oct23.huellaRnn) + " y LSTM " + c3(oct23.huellaLstm) + ": la de la LSTM es unas " + Math.round(veces) + " veces mayor. Su memoria c todavía va de " +
          c3(oct23.c0) + " sin la pandemia a " + c3(oct23.c) + " con ella, casi dos años después del último mes de la pandemia." },
      { valor: "De mayo a junio de 2021 la huella de la RNN cambia de signo, y la de la LSTM no se vuelve positiva hasta " + (sep21.huellaLstm > 0 ? "septiembre" : "después") + ". ¿Por qué?",
        opciones: ["La RNN sigue los últimos meses, ya en rebote", "La LSTM tiene cuatro veces los pesos", "La tanh de la RNN invierte el signo"],
        correcta: 0,
        razon: "La huella de la RNN pasa de " + c3(may21.huellaRnn) + " a " + c3(jun21.huellaRnn) + " y la de la LSTM, de " + c3(may21.huellaLstm) + " a " + c3(jun21.huellaLstm) +
          ". En abril y mayo de 2021 la diferencia ya es positiva, porque se compara con 2020. La RNN pesa sobre todo esos últimos pasos; la LSTM todavía carga la caída en c." }
    ],
    cierre: "La RNN olvida pronto el choque y la LSTM lo carga casi dos años: ninguna de las dos sabe que fue un choque."
  };

  var SITUACIONES = {
    id: "situaciones",
    titulo: "4. Tres decisiones",
    definicion: null,
    explicacion: "Cada caso sale del curso. Decida y lea la razón.",
    items: [
      { valor: "Una estación mide cada hora el nivel de un río. La crecida de hoy depende de la lluvia de hace 72 horas en la cuenca alta. Con una ventana de 72 pasos, ¿qué red tiene con qué llevar esa lluvia hasta el final?",
        opciones: ["Una LSTM de 72 pasos", "Una RNN de 72 pasos", "Cualquiera: las dos llegan"],
        correcta: 0,
        razon: "Con los factores por paso de esta página, " + P.coma(factorRnn, 2) + " en la RNN y " + P.coma(factorLstm, 3) + " en la LSTM, lo que llega del paso 1 al 72 es " +
          C.pct(rioRnn) + " en la RNN y " + C.pct(rioLstm) + " en la LSTM. También puede servir poner la lluvia de hace 72 horas como columna en un MLP, sin pedirle memoria a nadie." },
      { valor: "El sensor del río falla y marca 0 durante seis horas. ¿Qué se hace en el ETL antes de armar las ventanas?",
        opciones: ["Dejar los ceros: la red los olvida", "Borrar esas horas y unir los tramos", "Rellenar y marcar cuáles se rellenaron"],
        correcta: 2,
        razon: "Esta página muestra que la LSTM arrastra un choque durante muchos pasos: unos ceros falsos serían una crecida al revés que se queda en c. Borrar las horas rompe la distancia entre pasos, porque la red asume que todos están a una hora. " +
          "El curso rellena los cuatro meses sin dato de 2019 por interpolación lineal; con una columna que marque los rellenos, la red además puede aprender a desconfiar de ellos." },
      { valor: "La serie de pasajeros tiene 110 meses y su pronóstico depende sobre todo del último año. ¿Qué se prueba primero?",
        opciones: ["La LSTM más grande que quepa", "Solo la LSTM, sin línea base", "Una línea base y la RNN pequeña"],
        correcta: 2,
        razon: "En el backtest de la sesión, el estacional ingenuo da un MAPE de " + P.coma(B["estacional ingenuo"].MAPE) + ", la RNN de 32 neuronas, " + P.coma(B["RNN 32, diferencia"].MAPE) +
          ", y la LSTM de 32, " + P.coma(B["LSTM 32, diferencia"].MAPE) + " con una semilla. La LSTM tiene " + P.miles(C.pesos("LSTM", 32)) + " pesos para " + (n - 24 - 24) + " ventanas de entrenamiento: la serie completa da " + (n - 24) + " y las 24 últimas validan. Sin la línea base no se sabe si la red gana algo." }
    ],
    cierre: "La memoria larga es útil cuando lo que importa está lejos, y estorba cuando lo lejano es un choque o un dato falso."
  };

  if (typeof document === "undefined") {
    module.exports = { ANTES: ANTES, DESPUES: DESPUES, SITUACIONES: SITUACIONES };
    return;
  }

  var control = document.getElementById("mes");
  control.max = String(casos.length - 1);
  control.value = String(m.indexOf("2023-10") - desde);

  function dibujar() {
    var k = Number(control.value), t = desde + k, c = casos[k];
    document.getElementById("mes-valor").textContent = m[t];
    var cuales = c.pasos.length ? (c.pasos.length > 1 ? "los pasos " : "el paso ") + c.pasos[0] + (c.pasos.length > 2 ? " a " + c.pasos[c.pasos.length - 1] : c.pasos.length === 2 ? " y " + c.pasos[1] : "") + (c.pasos.length > 1 ? " vienen" : " viene") + " de la pandemia" :
      "ningún paso viene de la pandemia";
    document.getElementById("lectura").innerHTML = "Pronóstico de " + P.nombre(m[t]) + ". La ventana va de " + P.nombre(m[t - 12]) + " a " + P.nombre(m[t - 1]) +
      ", y " + cuales + ". Huella en h<sub>12</sub>: <b>RNN " + c3(c.huellaRnn) + "</b>, <b>LSTM " + c3(c.huellaLstm) + "</b>.";
    document.getElementById("franja").innerHTML = Grafica.franjas({
      filas: [{ rotulo: "ventana", colores: c.w.map(function (x, j) { return distorsion[t - 12 + j] ? Grafica.ROJO : "#d0d7de"; }) }],
      marcasX: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], rotuloX: function (j) { return "p" + (j + 1); },
      titulo: "Los doce pasos: en rojo, los tocados por la pandemia",
      titulos: function (i, j) { return m[t - 12 + j] + ": " + P.coma(c.w[j], 2); }
    });
    document.getElementById("tabla").innerHTML = P.tabla(["Red", "h<sub>12</sub> con la ventana real", "h<sub>12</sub> con esos pasos en 0", "huella"], [
      ["RNN, u = 0,8", c3(c.rnn), c3(c.rnn0), "<b>" + c3(c.huellaRnn) + "</b>"],
      ["LSTM, b<sub>f</sub> = 3", c3(c.lstm), c3(c.lstm0), "<b>" + c3(c.huellaLstm) + "</b>"],
      ["memoria c<sub>12</sub> de la LSTM", c3(c.c), c3(c.c0), c3(c.c - c.c0)]
    ]);
    document.getElementById("figura").innerHTML = Grafica.lineasMarcadas({
      lineas: [{ valores: casos.map(function (x) { return x.huellaRnn; }), color: NARANJA },
        { valores: casos.map(function (x) { return x.huellaLstm; }), color: AZUL }],
      verticales: [{ en: k }],
      ancho: 640, alto: 240, titulo: "Huella de la pandemia en h12: RNN (naranja) y LSTM (azul)", etiquetaY: "huella",
      marcasX: [0, 12, 24, 36, 48], rotuloX: function (j) { return m[desde + j].slice(0, 4); }
    });
  }
  control.addEventListener("input", dibujar);
  dibujar();

  document.getElementById("cierre-texto").innerHTML =
    "La diferencia con hace 12 meses mete la pandemia dos veces en los datos, primero como caída y luego como rebote, y la ventana la lleva a " + tocados + " meses de pronóstico. " +
    "La RNN deja de cargarla apenas sale de los últimos pasos; la LSTM la carga hasta que la ventana se limpia. Ninguna sabe que fue un choque: la red repite lo que la ventana le da. " +
    "Por eso un choque o un dato falso se trata antes, en los datos, con una marca, un relleno o una variable que lo explique, y no se le deja a la memoria de la red.";

  var pendientes = 3;
  function terminado() {
    pendientes--;
    if (pendientes === 0) { document.getElementById("carta-cierre").style.display = "block"; }
  }
  MotorDecisiones.montar({ bloques: [ANTES], destino: "antes", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [DESPUES], destino: "despues", alTerminar: terminado });
  MotorDecisiones.montar({ bloques: [SITUACIONES], destino: "situaciones", alTerminar: terminado });
})();
