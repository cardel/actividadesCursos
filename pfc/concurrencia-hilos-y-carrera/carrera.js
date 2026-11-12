/* carrera: el generador de identificadores con estado mutable compartido.
   El codigo, la traza de los dos hilos y la version con cerrojo son los del
   deck de principios de concurrencia, donde aparecen como anti-patron. La
   corrida empirica es la de codigo/02_race_condition.scala: cuatro hilos,
   cien mil llamadas cada uno, y el programa imprime lo esperado contra lo
   observado.
   Los distractores son las confusiones que ocurren de verdad: creer que la
   asignacion sola basta para que la operacion sea atomica, esperar que dos
   escrituras simultaneas se sumen, y dar por bueno synchronized como el
   camino del curso. */
(function () {

  var CODIGO = [
    "var uidCount = 0L",
    "",
    "def getUniqueId(): Long = {",
    "  val freshUid = uidCount + 1",
    "  uidCount = freshUid",
    "  freshUid",
    "}"
  ];

  var CODIGO_SYNC = [
    "var uidCount = 0L",
    "val cerrojo = new AnyRef",
    "",
    "def getUniqueId(): Long = cerrojo.synchronized {",
    "  val freshUid = uidCount + 1",
    "  uidCount = freshUid",
    "  freshUid",
    "}"
  ];

  /* --- Carta 1: la pregunta de entrada ------------------------------- */

  var ENTRADA = [
    {
      expr: "dos hilos invocan getUniqueId() al tiempo, con uidCount = 0",
      pregunta: "¿Obtienen siempre dos valores distintos?",
      cierre: "No. Si los dos leen uidCount antes de que alguno escriba, los dos calculan 1 y los dos retornan 1.",
      opciones: [
        { txt: "no: si los dos leen antes de que alguno escriba, los dos retornan 1", correcta: true, larga: true },
        { txt: "sí, porque cada llamada le suma uno al contador y el contador es compartido", fallo: "Que el contador sea compartido es justamente el problema. La llamada no suma sobre el valor compartido: lee, calcula aparte y escribe, y entre la lectura y la escritura cabe otro hilo.", larga: true },
        { txt: "sí, porque la asignación uidCount = freshUid es una sola instrucción y nadie la puede interrumpir", fallo: "El hueco no está dentro de la asignación: está entre la lectura de uidCount y esa asignación. Ahí es donde el otro hilo lee el valor viejo.", larga: true }
      ]
    }
  ];

  /* --- Carta 2: la traza de los dos hilos ---------------------------- */
  /* Estado inicial uidCount = 0; los hilos A y B invocan a la vez. */

  var PASOS = [
    {
      hilo: "A",
      accion: "lee uidCount",
      contador: "0",
      retorna: "",
      pregunta: "A es el primero en entrar y lee el contador. ¿Qué valor obtiene?",
      cierre: "0, que es el valor inicial. Hasta aquí nada raro.",
      opciones: [
        { txt: "1", fallo: "El 1 es lo que A va a calcular en la línea siguiente. Lo que lee del contador todavía es el valor inicial." },
        { txt: "0", correcta: true },
        { txt: "ninguno todavía, porque la lectura y la suma pasan al mismo tiempo", fallo: "Son dos pasos distintos: primero se lee uidCount y después se suma uno. Que se escriban en una sola línea no los vuelve uno solo.", larga: true }
      ]
    },
    {
      hilo: "B",
      accion: "lee uidCount",
      contador: "0",
      retorna: "",
      pregunta: "B entra antes de que A haya escrito. ¿Qué valor lee B?",
      cierre: "0. A calculó su valor en una variable local y todavía no tocó el contador, así que B lee lo mismo que leyó A.",
      opciones: [
        { txt: "0, porque A calculó su valor aparte y aún no escribió", correcta: true, larga: true },
        { txt: "1, porque A ya pasó por la línea que suma uno", fallo: "Esa suma dejó el 1 en freshUid, que es local a la llamada de A. El contador compartido sigue en 0 hasta la asignación.", larga: true },
        { txt: "el valor queda indefinido mientras A esté dentro de la función", fallo: "La lectura siempre entrega un valor concreto: el que haya en el contador en ese momento, que aquí es 0. Lo que no está definido es el orden de los turnos.", larga: true }
      ]
    },
    {
      hilo: "B",
      accion: "escribe uidCount = 1 y retorna",
      contador: "1",
      retorna: "1",
      pregunta: "B escribe su valor y retorna. ¿Qué retorna?",
      cierre: "1. Hasta aquí el contador y el valor retornado coinciden, y el requisito de unicidad todavía no se ha roto.",
      opciones: [
        { txt: "2, porque es el segundo hilo que pasa", fallo: "El valor que retorna sale de freshUid, y freshUid se calculó con el 0 que B leyó. El orden de llegada no entra en la cuenta." },
        { txt: "0, el valor que leyó", fallo: "Lo que retorna es freshUid, que es la lectura más uno. B leyó 0, así que retorna 1." },
        { txt: "1", correcta: true }
      ]
    },
    {
      hilo: "A",
      accion: "escribe uidCount = 1 y retorna",
      contador: "1",
      retorna: "1",
      pregunta: "A retoma donde quedó y escribe. ¿Con qué quedan el contador y el valor que A retorna?",
      cierre: "Contador en 1 y A retorna 1, el mismo valor que ya había retornado B. Dos llamadas, un identificador: el requisito está roto.",
      opciones: [
        { txt: "contador en 2, porque la escritura de A se suma a la de B", fallo: "Una escritura reemplaza, no suma. A escribe el freshUid que calculó con su lectura vieja, que es 1.", larga: true },
        { txt: "contador en 1 y A retorna 1, el mismo valor que retornó B", correcta: true, larga: true },
        { txt: "contador en 1 y A retorna 2, porque al escribir vuelve a leer el contador", fallo: "A no vuelve a leer nada: ya tiene su freshUid calculado desde antes y lo único que le queda es escribirlo y retornarlo.", larga: true }
      ]
    }
  ];

  /* --- Carta 3: la corrida de cuatro hilos --------------------------- */

  var CORRIDA = [
    {
      expr: "4 hilos × 100000 llamadas; el programa imprime esperado 400000 y lo observado",
      pregunta: "¿Puede lo observado pasar de 400000?",
      cierre: "No. Cada llamada escribe una lectura más uno, así que ninguna aporta más de uno al contador; lo que la carrera produce son incrementos perdidos, nunca de sobra.",
      opciones: [
        { txt: "sí, cuando dos hilos escriben a la vez el valor entra dos veces", fallo: "Dos escrituras del mismo valor dejan el contador en ese valor: la segunda reemplaza a la primera. De ahí que se pierdan incrementos y no que se dupliquen.", larga: true },
        { txt: "sí, porque sin sincronización el contador queda indefinido y puede terminar en cualquier número", fallo: "Indefinido no es cualquiera. Cada escritura pone un valor que algún hilo calculó como lectura más uno, y eso acota el resultado por arriba.", larga: true },
        { txt: "no: ninguna llamada aporta más de uno al contador", correcta: true, larga: true }
      ]
    }
  ];

  /* --- Carta 4: atomicidad, cerrojo y la salida funcional ------------ */

  var ATOMICIDAD = [
    {
      expr: "un bloque atómico",
      pregunta: "¿Qué quiere decir que un bloque de instrucciones sea atómico?",
      cierre: "Que frente a los otros hilos se ejecuta como una sola instrucción indivisible: o se completa entero, o no se observa nada de él.",
      opciones: [
        { txt: "que frente a los otros hilos se ejecuta como una sola instrucción indivisible", correcta: true, larga: true },
        { txt: "que el bloque corre más rápido porque el compilador lo junta en una instrucción de máquina", fallo: "La atomicidad no es una cuestión de velocidad ni de cuántas instrucciones de máquina salgan. Es qué puede observar otro hilo mientras el bloque corre.", larga: true },
        { txt: "que el bloque no se puede interrumpir, ni siquiera por el planificador del sistema operativo", fallo: "El planificador puede quitarle el turno al hilo en mitad del bloque. Lo que el cerrojo impide es que otro hilo entre al mismo bloque mientras tanto.", larga: true }
      ]
    },
    {
      expr: "cerrojo.synchronized { ... }",
      pregunta: "¿Qué intercalaciones deja de haber al envolver el cuerpo en el cerrojo?",
      cierre: "Las que meten la lectura o la escritura de un hilo entre la lectura y la escritura del otro. A lo sumo un hilo está dentro del bloque a la vez.",
      opciones: [
        { txt: "todas: con el cerrojo puesto los dos hilos corren en orden de llegada y el programa deja de ser no determinista", fallo: "Cuál de los dos entra primero sigue sin estar decidido, y el programa sigue admitiendo varias ejecuciones. Lo que se recupera es que cada llamada vea el contador completo, no a medias.", larga: true },
        { txt: "las que meten la lectura o la escritura de un hilo entre la lectura y la escritura del otro", correcta: true, larga: true },
        { txt: "ninguna, porque synchronized solo protege la escritura y la lectura queda igual de expuesta", fallo: "El bloque cubre las tres líneas del cuerpo, lectura incluida. Mientras un hilo está dentro, ningún otro que use el mismo cerrojo entra.", larga: true }
      ]
    },
    {
      expr: "¿y en estilo funcional?",
      pregunta: "El curso no escribe código así. ¿Por qué el problema no aparece?",
      cierre: "Sin estado mutable compartido no hay carrera posible: cada hilo opera sobre datos inmutables propios y no hay nada que un hilo pueda ver a medio actualizar.",
      opciones: [
        { txt: "porque el cerrojo ya resuelve el problema y el curso lo usa en todas las funciones compartidas", fallo: "El cerrojo aparece en la sesión como lo que se quiere evitar. Con estado mutable y cerrojos hay que razonar sobre todas las intercalaciones; sin estado mutable no hay nada que razonar.", larga: true },
        { txt: "porque declarar el var dentro de la función le da a cada hilo su propia copia", fallo: "Un contador local se reinicia en cada llamada y la función retornaría siempre 1. El problema no se resuelve escondiendo el estado: se resuelve no necesitándolo.", larga: true },
        { txt: "porque sin estado mutable compartido no hay carrera posible", correcta: true, larga: true }
      ]
    }
  ];

  function verificar() {
    return {
      pasos: PASOS.length,
      items: ENTRADA.length + PASOS.length + CORRIDA.length + ATOMICIDAD.length,
      trazaCoherente: PASOS[PASOS.length - 1].contador === "1" &&
        PASOS[PASOS.length - 1].retorna === PASOS[2].retorna
    };
  }

  var API = {
    CODIGO: CODIGO, CODIGO_SYNC: CODIGO_SYNC, ENTRADA: ENTRADA, PASOS: PASOS,
    CORRIDA: CORRIDA, ATOMICIDAD: ATOMICIDAD, verificar: verificar
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================ la pagina ================ */

  var SECCIONES = [
    { caja: "entrada", items: ENTRADA },
    { caja: "corrida", items: CORRIDA },
    { caja: "atomicidad", items: ATOMICIDAD }
  ];
  var resueltos = { entrada: 0, traza: 0, corrida: 0, atomicidad: 0 };
  var fallados = 0;
  var celdas = [];

  function marcar() {
    var listo = resueltos.traza === PASOS.length;
    SECCIONES.forEach(function (s) {
      document.getElementById("marcador-" + s.caja).textContent =
        "resueltas: " + resueltos[s.caja] + " de " + s.items.length;
      if (resueltos[s.caja] < s.items.length) { listo = false; }
    });
    document.getElementById("marcador-traza").textContent =
      "predichos: " + resueltos.traza + " de " + PASOS.length;
    document.getElementById("marcador-atomicidad").textContent =
      "resueltas: " + resueltos.atomicidad + " de " + ATOMICIDAD.length +
      "    ·    opciones falladas: " + fallados;
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

  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  function bloque(item, giro, alAcertar) {
    var contenedor = document.createElement("div");
    var expr = document.createElement("div");
    var preg = document.createElement("div");
    var ops = document.createElement("div");
    var ver = document.createElement("div");
    contenedor.className = "item";
    expr.className = "expr";
    expr.textContent = item.expr || (item.hilo + ": " + item.accion);
    preg.className = "pregunta";
    preg.textContent = item.pregunta;
    ops.className = "opciones";
    ver.className = "veredicto";
    rotar(item.opciones, giro).forEach(function (o) {
      var b = document.createElement("button");
      b.textContent = o.txt;
      if (o.larga) { b.className = "larga"; }
      b.addEventListener("click", function () {
        if (o.correcta) {
          b.className = b.className.replace(" errada", "") + " acertada";
          Array.prototype.forEach.call(ops.children, function (x) { x.disabled = true; });
          ver.className = "veredicto bien";
          ver.textContent = item.cierre;
          alAcertar();
        } else {
          b.className = b.className + " errada";
          b.disabled = true;
          ver.className = "veredicto mal";
          ver.textContent = o.fallo;
          fallados = fallados + 1;
          marcar();
        }
      });
      ops.appendChild(b);
    });
    contenedor.appendChild(expr);
    contenedor.appendChild(preg);
    contenedor.appendChild(ops);
    contenedor.appendChild(ver);
    return contenedor;
  }

  function construirSeccion(s) {
    var caja = document.getElementById(s.caja);
    s.items.forEach(function (item, indice) {
      caja.appendChild(bloque(item, indice + 1, function () {
        resueltos[s.caja] = resueltos[s.caja] + 1;
        marcar();
      }));
    });
  }

  /* --- la tabla de la traza: cada fila aparece al predecirla --- */

  function celda(texto, pendiente) {
    var td = document.createElement("td");
    td.textContent = texto;
    if (pendiente) { td.className = "pend"; }
    return td;
  }

  function construirTabla() {
    var tabla = document.createElement("table");
    var cab = document.createElement("tr");
    ["Paso", "Hilo", "Acción", "uidCount", "Retorna"].forEach(function (t) {
      var th = document.createElement("th");
      th.textContent = t;
      cab.appendChild(th);
    });
    tabla.appendChild(cab);
    var inicio = document.createElement("tr");
    inicio.appendChild(celda("0", false));
    inicio.appendChild(celda("", false));
    inicio.appendChild(celda("estado inicial", false));
    inicio.appendChild(celda("0", false));
    inicio.appendChild(celda("", false));
    tabla.appendChild(inicio);
    PASOS.forEach(function (p, i) {
      var tr = document.createElement("tr");
      var hilo = celda("?", true);
      var accion = celda("?", true);
      var cont = celda("?", true);
      var ret = celda("?", true);
      tr.appendChild(celda(String(i + 1), false));
      tr.appendChild(hilo);
      tr.appendChild(accion);
      tr.appendChild(cont);
      tr.appendChild(ret);
      celdas.push({ hilo: hilo, accion: accion, contador: cont, retorna: ret });
      tabla.appendChild(tr);
    });
    document.getElementById("traza").appendChild(tabla);
  }

  function revelar(i) {
    var p = PASOS[i];
    var c = celdas[i];
    c.hilo.textContent = p.hilo;
    c.accion.textContent = p.accion;
    c.contador.textContent = p.contador;
    c.retorna.textContent = p.retorna === "" ? "sigue" : p.retorna;
    c.hilo.className = "";
    c.accion.className = "";
    c.contador.className = "";
    c.retorna.className = "";
  }

  function construirTraza() {
    var caja = document.getElementById("pasos");
    PASOS.forEach(function (p, i) {
      caja.appendChild(bloque(p, i + 1, function () {
        revelar(i);
        resueltos.traza = resueltos.traza + 1;
        marcar();
      }));
    });
  }

  construirCodigo("codigo-uid", CODIGO);
  construirCodigo("codigo-sync", CODIGO_SYNC);
  construirTabla();
  construirTraza();
  SECCIONES.forEach(construirSeccion);
  marcar();
})();
