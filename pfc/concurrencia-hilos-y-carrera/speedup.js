/* speedup: la medida del beneficio y por que no sale lineal.
   Los tiempos son los que reporta el deck de principios de concurrencia al
   sumar diez millones de enteros en una maquina de cuatro nucleos: 42 ms la
   version secuencial, 24 ms con dos hilos y 15 ms con cuatro. Los speedup de
   la tabla se recalculan aqui a partir de esos tiempos, de modo que la pagina
   no repita un numero a mano.
   Los distractores son las confusiones que ocurren de verdad: leer S = 1 como
   senal de haber usado un nucleo, creer que el speedup no puede bajar de 1 y
   atribuir la perdida al reparto desigual de la entrada. */
(function () {

  var MEDIDAS = [
    { version: "secuencial (sumaSec)", hilos: 1, ms: 42 },
    { version: "paralela con 2 hilos", hilos: 2, ms: 24 },
    { version: "paralela con 4 hilos", hilos: 4, ms: 15 }
  ];

  var BASE = MEDIDAS[0].ms;

  function speedup(ms) {
    return BASE / ms;
  }

  var FILAS = MEDIDAS.map(function (m) {
    return {
      version: m.version,
      hilos: m.hilos,
      ms: m.ms,
      speedup: speedup(m.ms),
      texto: speedup(m.ms).toFixed(2)
    };
  });

  var OBJETIVO = speedup(MEDIDAS[2].ms);

  /* --- Carta 3: leer un speedup -------------------------------------- */

  var LECTURAS = [
    {
      expr: "S = 1",
      pregunta: "¿Qué dice ese valor de la versión paralela?",
      cierre: "Que tarda lo mismo que la secuencial. El programa puede estar usando los cuatro núcleos y no ganar nada con ellos.",
      opciones: [
        { txt: "que la versión paralela tarda lo mismo que la secuencial", correcta: true, larga: true },
        { txt: "que el programa corrió en un solo núcleo, porque con más de uno el valor habría subido", fallo: "Un programa puede repartirse entre cuatro núcleos y terminar en el mismo tiempo, si lo que se gana al repartir se va en coordinar. El valor 1 no dice cuántos núcleos se usaron.", larga: true },
        { txt: "que el speedup llegó a su tope, que es lo mejor que se puede esperar de ese programa", fallo: "El tope de la ganancia nunca es 1: con p núcleos, el ideal es p. El valor 1 es el piso de lo aceptable, no el techo.", larga: true }
      ]
    },
    {
      expr: "cuatro núcleos, S = 0,6",
      pregunta: "¿Qué pasó con esa medida?",
      cierre: "La versión paralela tardó más que la secuencial. Repartir el trabajo cuesta, y en ese caso lo que se pagó por repartir superó lo que se ganó.",
      opciones: [
        { txt: "se midió mal, porque el speedup no puede quedar por debajo de 1", fallo: "Sí puede, y tiene nombre: es un slowdown. Basta con que lanzar y esperar los hilos cueste más que el cálculo que se reparte.", larga: true },
        { txt: "la versión paralela tardó más que la secuencial", correcta: true, larga: true },
        { txt: "el programa usó uno de los cuatro núcleos y dejó los otros tres ociosos", fallo: "Con un núcleo y sin costos de coordinación el valor quedaría cerca de 1. Para bajar de ahí hay que estar pagando algo extra que la versión secuencial no paga.", larga: true }
      ]
    },
    {
      expr: "se esperaba S = 4 con cuatro núcleos y salió 2,80",
      pregunta: "¿De dónde sale la pérdida?",
      cierre: "De tres sitios: lanzar los hilos y esperarlos con join, la parte que sigue siendo secuencial al partir la entrada y sumar los resultados, y la contención de memoria entre los núcleos.",
      opciones: [
        { txt: "de que el sistema operativo no le entregó los cuatro núcleos al programa", fallo: "El reparto de núcleos puede influir, y aun con los cuatro disponibles la ganancia se queda corta: lanzar hilos cuesta, partir la entrada cuesta y los núcleos compiten por la memoria.", larga: true },
        { txt: "de que diez millones no se divide en cuatro partes exactamente iguales", fallo: "Esa diferencia es de a lo sumo unos pocos elementos sobre diez millones. Lo que se paga está en otra parte: el costo de lanzar y esperar, la parte no repartible y la memoria compartida.", larga: true },
        { txt: "de lanzar y esperar los hilos, de la parte no repartible y de la contención de memoria", correcta: true, larga: true }
      ]
    },
    {
      expr: "la misma suma paralela sobre un arreglo de 100 elementos",
      pregunta: "¿Qué se puede anticipar del speedup?",
      cierre: "Que puede quedar por debajo de 1, porque el cálculo que se reparte es tan corto que lanzar y esperar los hilos pesa más que sumar.",
      opciones: [
        { txt: "el mismo 2,80 de antes, porque el speedup depende del número de núcleos y no del tamaño de la entrada", fallo: "El speedup es un cociente de tiempos medidos, y los dos tiempos cambian con la entrada. El costo de lanzar hilos, en cambio, es casi el mismo con 100 elementos que con diez millones.", larga: true },
        { txt: "exactamente 1, porque sumar 100 elementos no alcanza a ocupar más de un núcleo", fallo: "Nada impide repartir 100 elementos entre cuatro hilos. El problema es que el reparto cuesta y el cálculo reparte poco, así que el resultado suele quedar por debajo de 1.", larga: true },
        { txt: "que sube por encima de 4, porque el arreglo entra completo en la caché de cada núcleo", fallo: "Que la entrada quepa en caché ayuda al cálculo, pero no paga el costo fijo de crear cuatro hilos y esperarlos, que con 100 elementos es la mayor parte del tiempo.", larga: true },
        { txt: "que puede quedar por debajo de 1", correcta: true }
      ]
    }
  ];

  function verificar() {
    return {
      filas: FILAS.map(function (f) { return f.version + ": " + f.ms + " ms, S = " + f.texto; }),
      objetivo: OBJETIVO
    };
  }

  var API = {
    MEDIDAS: MEDIDAS, FILAS: FILAS, OBJETIVO: OBJETIVO,
    speedup: speedup, LECTURAS: LECTURAS, verificar: verificar
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================ la pagina ================ */

  var resueltos = { lecturas: 0 };
  var fallados = 0;
  var acerto = false;

  function marcar() {
    document.getElementById("marcador-lecturas").textContent =
      "resueltas: " + resueltos.lecturas + " de " + LECTURAS.length +
      "    ·    opciones falladas: " + fallados;
    if (acerto && resueltos.lecturas === LECTURAS.length) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  function construirTabla() {
    var tabla = document.createElement("table");
    var cab = document.createElement("tr");
    ["Versión", "Tiempo", "Speedup"].forEach(function (t) {
      var th = document.createElement("th");
      th.textContent = t;
      cab.appendChild(th);
    });
    tabla.appendChild(cab);
    FILAS.forEach(function (f) {
      var tr = document.createElement("tr");
      var v = document.createElement("td");
      var t = document.createElement("td");
      var s = document.createElement("td");
      v.textContent = f.version;
      v.style.textAlign = "left";
      t.textContent = f.ms + " ms";
      s.textContent = f.hilos === 4 ? "?" : f.texto;
      if (f.hilos === 4) { s.className = "pend"; s.id = "celda-objetivo"; }
      tr.appendChild(v);
      tr.appendChild(t);
      tr.appendChild(s);
      tabla.appendChild(tr);
    });
    document.getElementById("tabla-medidas").appendChild(tabla);
  }

  function construirBarras() {
    var caja = document.getElementById("barras");
    var mayor = Math.max.apply(null, FILAS.map(function (f) { return f.ms; }));
    FILAS.forEach(function (f, i) {
      var fila = document.createElement("div");
      var rot = document.createElement("span");
      var pista = document.createElement("div");
      var barra = document.createElement("div");
      var valor = document.createElement("span");
      fila.className = "barra-fila";
      rot.className = "rotulo";
      rot.textContent = f.hilos === 1 ? "secuencial" : f.hilos + " hilos";
      pista.className = "pista-barra";
      barra.className = "barra b" + (i + 1);
      barra.style.width = Math.round(100 * f.ms / mayor) + "%";
      valor.className = "valor";
      valor.textContent = f.ms + " ms";
      pista.appendChild(barra);
      fila.appendChild(rot);
      fila.appendChild(pista);
      fila.appendChild(valor);
      caja.appendChild(fila);
    });
  }

  function cablearPrediccion() {
    document.getElementById("btn-comprobar").addEventListener("click", function () {
      var v = document.getElementById("veredicto");
      var texto = document.getElementById("prediccion").value.replace(",", ".");
      var valor = parseFloat(texto);
      if (isNaN(valor)) {
        v.className = "veredicto mal";
        v.textContent = "Escriba un número primero.";
        return;
      }
      if (Math.abs(valor - OBJETIVO) < 0.05) {
        v.className = "veredicto bien";
        v.textContent = "S = " + MEDIDAS[0].ms + " / " + MEDIDAS[2].ms + " = " +
          OBJETIVO.toFixed(2) + ". Con cuatro núcleos el ideal era 4, así que " +
          "poco más de la mitad de lo que se podía ganar se quedó en el camino.";
        document.getElementById("celda-objetivo").textContent = OBJETIVO.toFixed(2);
        document.getElementById("celda-objetivo").className = "";
        acerto = true;
        marcar();
      } else {
        v.className = "veredicto mal";
        v.textContent = Math.abs(valor - MEDIDAS[2].ms / MEDIDAS[0].ms) < 0.05
          ? "El cociente está al revés. El speedup compara el tiempo secuencial contra el paralelo, y es mayor que 1 cuando se gana."
          : "Revise la fórmula: es el tiempo de la versión secuencial dividido por el de la paralela, con los dos tiempos de la tabla.";
      }
    });
  }

  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  function construirLecturas() {
    var caja = document.getElementById("lecturas");
    LECTURAS.forEach(function (item, indice) {
      var contenedor = document.createElement("div");
      var expr = document.createElement("div");
      var preg = document.createElement("div");
      var ops = document.createElement("div");
      var ver = document.createElement("div");
      contenedor.className = "item";
      expr.className = "expr";
      expr.textContent = item.expr;
      preg.className = "pregunta";
      preg.textContent = item.pregunta;
      ops.className = "opciones";
      ver.className = "veredicto";
      rotar(item.opciones, indice + 1).forEach(function (o) {
        var b = document.createElement("button");
        b.textContent = o.txt;
        if (o.larga) { b.className = "larga"; }
        b.addEventListener("click", function () {
          if (o.correcta) {
            b.className = b.className.replace(" errada", "") + " acertada";
            Array.prototype.forEach.call(ops.children, function (x) { x.disabled = true; });
            ver.className = "veredicto bien";
            ver.textContent = item.cierre;
            resueltos.lecturas = resueltos.lecturas + 1;
          } else {
            b.className = b.className + " errada";
            b.disabled = true;
            ver.className = "veredicto mal";
            ver.textContent = o.fallo;
            fallados = fallados + 1;
          }
          marcar();
        });
        ops.appendChild(b);
      });
      contenedor.appendChild(expr);
      contenedor.appendChild(preg);
      contenedor.appendChild(ops);
      contenedor.appendChild(ver);
      caja.appendChild(contenedor);
    });
  }

  construirTabla();
  construirBarras();
  cablearPrediccion();
  construirLecturas();
  marcar();
})();
