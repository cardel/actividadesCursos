/* montecarlo: estimar pi con cuatro tareas y sin una linea de sincronizacion.
   El codigo, el reparto de iteraciones y la tabla de tiempos son los del deck
   de abstracciones para la concurrencia: 480 ms la version secuencial, 260 ms
   con dos tareas y 140 ms con cuatro, en una maquina de cuatro nucleos con
   diez millones de puntos. Los speedup de la tabla son los que el deck
   reporta y aqui se muestran tal como estan.
   El reparto de iteraciones no esta escrito a mano: sale de aplicar la misma
   division entera del codigo, de modo que la suma de los cuatro pedazos es
   siempre iter.
   Los distractores son las confusiones que ocurren de verdad: creer que
   Random es inmutable, esperar que parallel sincronice algo, y leer el
   resultado de dos parallel anidados como una tupla de cuatro. */
(function () {

  var CODIGO_SEC = [
    "def mcCount(iter: Int): Int = {",
    "  val rng = new Random",
    "",
    "  def aux(k: Int, hits: Int): Int =",
    "    if (k == 0) hits",
    "    else {",
    "      val x = rng.nextDouble()",
    "      val y = rng.nextDouble()",
    "      val h = if (x * x + y * y < 1.0) hits + 1 else hits",
    "      aux(k - 1, h)",
    "    }",
    "",
    "  aux(iter, 0)",
    "}",
    "",
    "def piSec(iter: Int): Double = 4.0 * mcCount(iter) / iter"
  ];

  var CODIGO_PAR = [
    "def piPar(iter: Int): Double = {",
    "  val q = iter / 4",
    "  val ((c1, c2), (c3, c4)) = parallel(",
    "    parallel(mcCount(q), mcCount(q)),",
    "    parallel(mcCount(q), mcCount(iter - 3 * q))",
    "  )",
    "  4.0 * (c1 + c2 + c3 + c4) / iter",
    "}"
  ];

  /* La misma division entera del codigo. */
  function reparto(iter) {
    var q = Math.floor(iter / 4);
    var pedazos = [q, q, q, iter - 3 * q];
    return {
      q: q,
      pedazos: pedazos,
      suma: pedazos.reduce(function (a, b) { return a + b; }, 0)
    };
  }

  var EJEMPLO = 10;
  var OBJETIVO = reparto(EJEMPLO).pedazos[3];

  var MEDIDAS = [
    { version: "piSec", ms: 480, speedup: "1,00" },
    { version: "piPar con 2 tareas", ms: 260, speedup: "1,85" },
    { version: "piPar con 4 tareas", ms: 140, speedup: "3,40" }
  ];

  /* --- Carta 1: por que no hay carrera ------------------------------- */

  var SIN_CARRERA = [
    {
      expr: "dos invocaciones de mcCount corriendo a la vez",
      pregunta: "¿Por qué no hay condición de carrera entre ellas?",
      cierre: "Porque cada invocación crea su propio Random y su propio acumulador. No hay un solo dato mutable que las dos toquen.",
      opciones: [
        { txt: "porque Random es inmutable y dos hilos pueden leerlo sin riesgo", fallo: "Un Random guarda su semilla y la cambia en cada nextDouble, así que es de lo más mutable que hay. Lo que salva al código es que cada invocación tiene el suyo.", larga: true },
        { txt: "porque parallel sincroniza el acceso a los objetos que las dos tareas comparten", fallo: "parallel no sincroniza nada: evalúa las dos expresiones y devuelve sus valores. Si las dos tareas compartieran estado mutable, la carrera estaría ahí.", larga: true },
        { txt: "porque cada invocación crea su propio Random y no comparten nada mutable", correcta: true, larga: true }
      ]
    },
    {
      expr: "val rng = new Random     dentro de mcCount",
      pregunta: "El objeto es mutable. ¿Qué lo deja fuera de problemas?",
      cierre: "Que nace y muere dentro de la invocación. Nadie más alcanza a verlo, así que el resultado de mcCount depende solo de iter y la función no expone ningún efecto.",
      opciones: [
        { txt: "que nace y muere dentro de la invocación, sin que nadie más lo alcance", correcta: true, larga: true },
        { txt: "que se declara con val, y un val no se puede modificar después de creado", fallo: "El val fija a qué objeto apunta el nombre, no el estado del objeto. Ese Random cambia por dentro en cada nextDouble.", larga: true },
        { txt: "que las funciones del curso no pueden tener estado mutable, así que el compilador lo encapsula", fallo: "El compilador no encapsula nada. Lo que hace aceptable este objeto es su alcance: vive dentro de la invocación y no sale de ahí.", larga: true }
      ]
    }
  ];

  /* --- Carta 2: el reparto de iteraciones ---------------------------- */

  var REPARTO = [
    {
      expr: "mcCount(iter - 3 * q)",
      pregunta: "¿Por qué la cuarta tarea no recibe q como las otras tres?",
      cierre: "Porque iter / 4 es división entera y puede perder hasta tres iteraciones. La cuarta tarea recibe el resto, de modo que los cuatro pedazos suman exactamente iter.",
      opciones: [
        { txt: "porque la división entera puede perder hasta tres iteraciones y la cuarta recoge el resto", correcta: true, larga: true },
        { txt: "porque la cuarta tarea tiene que hacer más trabajo, para compensar el tiempo que se gastó lanzando las otras tres", fallo: "Lanzar una tarea cuesta lo mismo para las cuatro y no se compensa con iteraciones. La cuarta recibe el resto por una razón aritmética: iter no siempre es múltiplo de 4.", larga: true },
        { txt: "porque así las cuatro terminan al mismo tiempo, cada una con su parte proporcional", fallo: "Al contrario: la cuarta puede quedar con hasta tres iteraciones más que las otras. Sobre diez millones de puntos esa diferencia no se siente, y lo que arregla es que no se pierda ninguna.", larga: true }
      ]
    },
    {
      expr: "parallel(parallel(a, b), parallel(c, d))",
      pregunta: "¿Qué forma tiene lo que retorna?",
      cierre: "Una pareja de parejas, y por eso el patrón que la recibe es ((c1, c2), (c3, c4)). parallel siempre entrega dos componentes.",
      opciones: [
        { txt: "una tupla de cuatro componentes, que es lo que el patrón de cuatro nombres recoge", fallo: "El patrón tiene paréntesis por dentro, y eso ya delata la forma. parallel entrega dos componentes, y aquí cada uno es a su vez una pareja.", larga: true },
        { txt: "una pareja de parejas", correcta: true, larga: true },
        { txt: "una lista de los cuatro conteos, en el orden en que las tareas terminaron", fallo: "El tipo de retorno de parallel es una pareja, no una lista, y el orden de los componentes es el de las expresiones y no el de llegada.", larga: true }
      ]
    }
  ];

  /* --- Carta 3: los tiempos ------------------------------------------ */

  var TIEMPOS = [
    {
      expr: "la suma paralela quedó en 2,80 con cuatro hilos; esta estimación, en 3,40",
      pregunta: "¿Por qué esta se acerca más al ideal de 4?",
      cierre: "Porque las sub-tareas son grandes y no comparten nada: casi todo el tiempo es cálculo repartible. En la suma del arreglo hay además cuatro hilos leyendo la misma memoria.",
      opciones: [
        { txt: "porque la suma del arreglo usaba var para recoger los resultados, y eso le costaba tiempo", fallo: "Escribir en un var no es lo que cuesta. Lo que separa a los dos casos es cuánto cálculo hay por tarea y cuánta memoria compartida se toca.", larga: true },
        { txt: "porque estimar pi es un algoritmo paralelo por naturaleza y sumar un arreglo no lo es", fallo: "Sumar un arreglo se reparte igual de bien: la operación es asociativa. La diferencia está en el costo de cada sub-tarea frente al de coordinarla y en el acceso a la memoria.", larga: true },
        { txt: "porque las sub-tareas son grandes y no comparten estado", correcta: true, larga: true }
      ]
    }
  ];

  function verificar() {
    var pruebas = [8, 9, 10, 11, 10000000].map(function (n) {
      var r = reparto(n);
      return n + " -> " + r.pedazos.join(" + ") + " = " + r.suma +
             (r.suma === n ? " ok" : " MAL");
    });
    return {
      reparto: pruebas,
      objetivo: OBJETIVO,
      medidas: MEDIDAS.map(function (m) { return m.version + ": " + m.ms + " ms, S = " + m.speedup; })
    };
  }

  var API = {
    CODIGO_SEC: CODIGO_SEC, CODIGO_PAR: CODIGO_PAR, MEDIDAS: MEDIDAS,
    SIN_CARRERA: SIN_CARRERA, REPARTO: REPARTO, TIEMPOS: TIEMPOS,
    reparto: reparto, EJEMPLO: EJEMPLO, OBJETIVO: OBJETIVO, verificar: verificar
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================ la pagina ================ */

  var SECCIONES = [
    { caja: "sincarrera", items: SIN_CARRERA },
    { caja: "reparto", items: REPARTO },
    { caja: "tiempos", items: TIEMPOS }
  ];
  var resueltos = { sincarrera: 0, reparto: 0, tiempos: 0 };
  var fallados = 0;
  var acerto = false;

  function marcar() {
    var listo = acerto;
    SECCIONES.forEach(function (s, i) {
      var texto = "resueltas: " + resueltos[s.caja] + " de " + s.items.length;
      if (i === SECCIONES.length - 1) {
        texto = texto + "    ·    opciones falladas: " + fallados;
      }
      document.getElementById("marcador-" + s.caja).textContent = texto;
      if (resueltos[s.caja] < s.items.length) { listo = false; }
    });
    if (listo) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  function construirCodigo(id, lineas) {
    var panel = document.getElementById(id);
    lineas.forEach(function (texto, i) {
      var div = document.createElement("div");
      var num = document.createElement("span");
      var txt = document.createElement("span");
      div.className = "linea";
      num.className = "num";
      num.textContent = texto === "" ? "" : String(i + 1);
      txt.className = "txt";
      txt.textContent = texto;
      div.appendChild(num);
      div.appendChild(txt);
      panel.appendChild(div);
    });
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
    var mayor = Math.max.apply(null, MEDIDAS.map(function (m) { return m.ms; }));
    MEDIDAS.forEach(function (m, i) {
      var tr = document.createElement("tr");
      var v = document.createElement("td");
      var t = document.createElement("td");
      var s = document.createElement("td");
      v.textContent = m.version;
      v.style.textAlign = "left";
      t.textContent = m.ms + " ms";
      s.textContent = m.speedup;
      tr.appendChild(v);
      tr.appendChild(t);
      tr.appendChild(s);
      tabla.appendChild(tr);
      var fila = document.createElement("div");
      var rot = document.createElement("span");
      var pista = document.createElement("div");
      var barra = document.createElement("div");
      var valor = document.createElement("span");
      fila.className = "barra-fila";
      rot.className = "rotulo";
      rot.textContent = m.version;
      pista.className = "pista-barra";
      barra.className = "barra b" + (i + 1);
      barra.style.width = Math.round(100 * m.ms / mayor) + "%";
      valor.className = "valor";
      valor.textContent = m.ms + " ms";
      pista.appendChild(barra);
      fila.appendChild(rot);
      fila.appendChild(pista);
      fila.appendChild(valor);
      document.getElementById("barras").appendChild(fila);
    });
    document.getElementById("tabla-medidas").appendChild(tabla);
  }

  function cablearPrediccion() {
    document.getElementById("btn-comprobar").addEventListener("click", function () {
      var v = document.getElementById("veredicto");
      var valor = parseInt(document.getElementById("prediccion").value, 10);
      var r = reparto(EJEMPLO);
      if (isNaN(valor)) {
        v.className = "veredicto mal";
        v.textContent = "Escriba un número primero.";
        return;
      }
      if (valor === OBJETIVO) {
        v.className = "veredicto bien";
        v.textContent = "q vale " + r.q + ", así que los cuatro pedazos son " +
          r.pedazos.join(" + ") + " = " + r.suma + ". La cuarta tarea recoge lo que la división entera dejó por fuera.";
        acerto = true;
        marcar();
      } else {
        v.className = "veredicto mal";
        v.textContent = valor === r.q
          ? "q es el tamaño de las tres primeras. La cuarta recibe iter - 3 * q, que con iter = " + EJEMPLO + " no es lo mismo."
          : "Calcule primero q = " + EJEMPLO + " / 4 con división entera, y después iter - 3 * q.";
      }
    });
  }

  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  function construirSeccion(s) {
    var caja = document.getElementById(s.caja);
    s.items.forEach(function (item, indice) {
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
            resueltos[s.caja] = resueltos[s.caja] + 1;
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

  construirCodigo("codigo-sec", CODIGO_SEC);
  construirCodigo("codigo-par", CODIGO_PAR);
  construirTabla();
  cablearPrediccion();
  SECCIONES.forEach(construirSeccion);
  marcar();
})();
