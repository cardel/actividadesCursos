/* sumar8: el mismo computo en dos ordenes, con su trabajo y su profundidad.
   Los dos ordenes son los del deck de complejidad de la programacion
   concurrente: la cadena ((((((1+2)+3)+4)+5)+6)+7)+8 y el arbol que suma por
   parejas. Ninguna traza esta escrita a mano. La pagina corre las dos cuentas
   y de ahi salen los resultados parciales, el trabajo acumulado y la
   profundidad de cada paso; los tiempos con P nucleos se obtienen sumando,
   nivel por nivel, cuantas rondas de P sumas hacen falta.
   Los distractores son las confusiones que ocurren de verdad: contar una suma
   por numero, confundir la profundidad con el trabajo, sumar profundidades
   donde hay parallel y tomar el maximo donde no lo hay. */
(function () {

  var NUMEROS = [1, 2, 3, 4, 5, 6, 7, 8];
  var PRIMERA_ARBOL = 8;

  var CODIGO = [
    { txt: "// orden secuencial: cada suma necesita la anterior", num: null },
    { txt: "val s1 = 1 + 2", num: 1, bloque: 1 },
    { txt: "val s2 = s1 + 3", num: 2, bloque: 1 },
    { txt: "val s3 = s2 + 4", num: 3, bloque: 1 },
    { txt: "val s4 = s3 + 5", num: 4, bloque: 1 },
    { txt: "val s5 = s4 + 6", num: 5, bloque: 1 },
    { txt: "val s6 = s5 + 7", num: 6, bloque: 1 },
    { txt: "val s7 = s6 + 8", num: 7, bloque: 1 },
    { txt: "", num: null },
    { txt: "// orden en arbol: las cuatro de arriba no se necesitan entre si", num: null },
    { txt: "val a1 = 1 + 2", num: 8, bloque: 2 },
    { txt: "val a2 = 3 + 4", num: 9, bloque: 2 },
    { txt: "val a3 = 5 + 6", num: 10, bloque: 2 },
    { txt: "val a4 = 7 + 8", num: 11, bloque: 2 },
    { txt: "val b1 = a1 + a2", num: 12, bloque: 3 },
    { txt: "val b2 = a3 + a4", num: 13, bloque: 3 },
    { txt: "val c1 = b1 + b2", num: 14, bloque: 3 }
  ];

  function coma(x, cifras) {
    return x.toFixed(cifras).replace(".", ",");
  }

  /* --- Las dos trazas, corriendo la cuenta -------------------------- */

  function pasosSecuencial() {
    var pasos = [];
    var acc = NUMEROS[0];
    var i;
    for (i = 1; i < NUMEROS.length; i = i + 1) {
      var antes = acc;
      acc = acc + NUMEROS[i];
      pasos.push({
        linea: i, orden: "secuencial",
        op: antes + " + " + NUMEROS[i], res: acc,
        w: i, d: i, nivel: i, enParalelo: 1,
        depende: i === 1 ? "nada" : "la suma anterior"
      });
    }
    return pasos;
  }

  function pasosArbol() {
    var pasos = [];
    var actuales = NUMEROS.slice();
    var linea = PRIMERA_ARBOL;
    var nivel = 0;
    var w = 0;
    for (nivel = 0; actuales.length > 1; nivel = nivel + 1) {
      var siguientes = [];
      var enNivel = Math.floor(actuales.length / 2);
      var i;
      for (i = 0; i + 1 < actuales.length; i = i + 2) {
        var suma = actuales[i] + actuales[i + 1];
        w = w + 1;
        pasos.push({
          linea: linea, orden: "árbol",
          op: actuales[i] + " + " + actuales[i + 1], res: suma,
          w: w, d: nivel + 1, nivel: nivel, enParalelo: enNivel,
          depende: nivel === 0 ? "nada" : "el nivel anterior"
        });
        linea = linea + 1;
        siguientes.push(suma);
      }
      if (actuales.length % 2 === 1) {
        siguientes.push(actuales[actuales.length - 1]);
      }
      actuales = siguientes;
    }
    return pasos;
  }

  function simular(params) {
    return params.orden === "arbol" ? pasosArbol() : pasosSecuencial();
  }

  function medidas(orden) {
    var pasos = orden === "arbol" ? pasosArbol() : pasosSecuencial();
    var ultimo = pasos[pasos.length - 1];
    return { w: pasos.length, d: ultimo.d, res: ultimo.res, pasos: pasos.length };
  }

  var SECUENCIAL = medidas("secuencial");
  var ARBOL = medidas("arbol");

  /* Operaciones por nivel: en la cadena cada nivel trae una sola suma; en el
     arbol, las que la traza registra con ese nivel. */
  function opsPorNivel(orden) {
    var pasos = orden === "arbol" ? pasosArbol() : pasosSecuencial();
    var cuenta = [];
    pasos.forEach(function (p) {
      var i = orden === "arbol" ? p.nivel : p.nivel - 1;
      cuenta[i] = (cuenta[i] || 0) + 1;
    });
    return cuenta;
  }

  var OPS_SEC = opsPorNivel("secuencial");
  var OPS_ARBOL = opsPorNivel("arbol");

  /* Tiempo con P nucleos: un nivel no empieza hasta que el anterior termina,
     y dentro de un nivel caben P sumas por unidad de tiempo. */
  function tiempoCon(ops, p) {
    var t = 0;
    ops.forEach(function (enNivel) {
      t = t + Math.ceil(enNivel / p);
    });
    return t;
  }

  var NUCLEOS = [1, 2, 4, 8, 1000];

  function filaNucleos(p) {
    var tSec = tiempoCon(OPS_SEC, p);
    var tArbol = tiempoCon(OPS_ARBOL, p);
    return {
      p: p, tSec: tSec, tArbol: tArbol,
      speedup: tSec / tArbol,
      texto: coma(tSec / tArbol, 2)
    };
  }

  function primerPTope() {
    var i;
    for (i = 0; i < NUCLEOS.length; i = i + 1) {
      if (tiempoCon(OPS_ARBOL, NUCLEOS[i]) === ARBOL.d) { return NUCLEOS[i]; }
    }
    return 0;
  }

  /* --- Carta 1: el trabajo, antes de ver las trazas ------------------ */

  function opcionesTrabajo() {
    return [
      { valor: SECUENCIAL.w, clave: "correcta",
        razon: "Siete sumas, y son las mismas en los dos órdenes: cada suma " +
          "consume dos valores y deja uno, así que para pasar de ocho valores " +
          "a uno hacen falta siete. Ese número es el trabajo W." },
      { valor: NUMEROS.length, clave: "uno-por-numero",
        razon: "Esa es la cantidad de números. Las sumas son una menos, porque " +
          "la primera ya junta dos de ellos." },
      { valor: OPS_ARBOL[0], clave: "primer-nivel",
        razon: "Esas son las sumas por parejas de la primera pasada, que dejan " +
          "cuatro resultados. Esos cuatro todavía hay que juntarlos." },
      { valor: ARBOL.d, clave: "profundidad",
        razon: "Tres son los niveles del orden en árbol, que es su profundidad. " +
          "El trabajo de ese mismo árbol es 4 + 2 + 1 = 7." }
    ];
  }

  /* --- Carta 3: la profundidad de cada orden ------------------------- */

  function opcionesProfundidadSec() {
    return [
      { valor: SECUENCIAL.d, clave: "correcta",
        razon: "D = 7. Cada suma necesita el resultado de la anterior, así que " +
          "las siete forman una sola cadena y no hay dos que puedan ir al tiempo." },
      { valor: ARBOL.d, clave: "la-del-arbol",
        razon: "Esa es la profundidad del orden en árbol. En la cadena no hay " +
          "niveles: s2 espera a s1, s3 espera a s2, y así hasta el final." },
      { valor: 1, clave: "todo-a-la-vez",
        razon: "Con paralelismo ilimitado se hacen al tiempo las operaciones que " +
          "no se necesitan entre sí. Aquí cada una necesita la anterior, de modo " +
          "que los núcleos de sobra quedan esperando." },
      { valor: NUMEROS.length, clave: "uno-por-numero",
        razon: "Esa es la cantidad de números. La cadena tiene una suma menos, " +
          "y la profundidad cuenta sumas." }
    ];
  }

  function opcionesProfundidadArbol() {
    return [
      { valor: ARBOL.d, clave: "correcta",
        razon: "D = 3. Las cuatro sumas del nivel 0 pueden ir al tiempo, las dos " +
          "del nivel 1 esperan a esas, y la última espera a las dos. La cadena " +
          "más larga pasa por tres sumas." },
      { valor: SECUENCIAL.d, clave: "igual-al-trabajo",
        razon: "Siete es el trabajo, que no cambió al reordenar. Lo que cambió es " +
          "la profundidad: reagrupar quitó dependencias, no operaciones." },
      { valor: ARBOL.d + 1, clave: "niveles-de-valores",
        razon: "El árbol dibujado tiene cuatro filas de valores, y las sumas " +
          "están entre filas: de ocho valores a cuatro, a dos y a uno son tres " +
          "pasos." },
      { valor: 1, clave: "todo-a-la-vez",
        razon: "La última suma necesita los dos resultados del nivel 1, que a su " +
          "vez necesitan los cuatro del nivel 0. Con núcleos de sobra el árbol " +
          "baja hasta 3 y no más." }
    ];
  }

  /* --- Carta 4: las reglas de composicion ---------------------------- */

  var REGLAS = [
    {
      expr: "sumar(cuadrado(x), cuadrado(y))",
      datos: "W(cuadrado) = 2, W(sumar) = 1",
      pregunta: "¿Cuánto vale W de la expresión completa?",
      cierre: "W = 2 + 2 + 1 = 5. En una expresión secuencial se suma el trabajo de cada argumento y el de la función que los combina.",
      opciones: [
        { txt: "4", fallo: "Esos son los dos cuadrados. La suma que los junta es otra operación y el trabajo también la cuenta." },
        { txt: "5", correcta: true },
        { txt: "3", fallo: "Esa cuenta evalúa cuadrado una sola vez. En la expresión aparece dos veces, con argumentos distintos, y las dos se evalúan." },
        { txt: "2", fallo: "Tomar el máximo de las partes es la regla de la profundidad de parallel. El trabajo nunca es un máximo: son todas las operaciones que hay que hacer." }
      ]
    },
    {
      expr: "sumar(cuadrado(x), cuadrado(y))",
      datos: "D(cuadrado) = 2, D(sumar) = 1",
      pregunta: "¿Cuánto vale D de la misma expresión?",
      cierre: "D = 2 + 2 + 1 = 5. Sin parallel no hay nada que ocurra al tiempo, de modo que la profundidad se suma igual que el trabajo.",
      opciones: [
        { txt: "3", fallo: "Ese es max(2, 2) + 1. El máximo entra solo cuando hay parallel, y aquí los dos cuadrados se evalúan uno tras otro." },
        { txt: "4", fallo: "Falta la suma final, que también está en la cadena: hasta que los dos cuadrados no terminen no se puede sumar." },
        { txt: "2", fallo: "Esa es la profundidad de una rama. La expresión incluye la otra rama y la suma que las junta." },
        { txt: "5", correcta: true }
      ]
    },
    {
      expr: "parallel(izq, der)",
      datos: "W(izq) = 4, W(der) = 6, sin contar las constantes c1 y c2",
      pregunta: "¿Cuánto vale W?",
      cierre: "W = 4 + 6 = 10. Repartir no quita operaciones: las diez se hacen igual, solo que en dos sitios a la vez.",
      opciones: [
        { txt: "6", fallo: "Ese es el máximo, que es la regla de la profundidad. El trabajo de parallel es la suma de los dos lados." },
        { txt: "5", fallo: "Repartir entre dos no divide el trabajo por dos. Lo que puede bajar a la mitad es el tiempo, y eso lo mide la profundidad." },
        { txt: "4", fallo: "Ese es el trabajo del lado izquierdo. El derecho también se evalúa, y parallel devuelve los dos valores." },
        { txt: "10", correcta: true }
      ]
    },
    {
      expr: "parallel(izq, der)",
      datos: "D(izq) = 4, D(der) = 6",
      pregunta: "¿Cuánto vale D?",
      cierre: "D = max(4, 6) = 6. Los dos lados avanzan al tiempo, así que el que manda es el más lento.",
      opciones: [
        { txt: "10", fallo: "Esa es la regla del caso secuencial. Con parallel la profundidad pasa de suma a máximo, y de ahí sale la ganancia." },
        { txt: "4", fallo: "Ese es el lado rápido. La expresión no entrega su par de valores hasta que el lado lento también termina." },
        { txt: "6", correcta: true },
        { txt: "5", fallo: "El promedio de los dos no es el tiempo de ninguno. Lo que se espera es al más lento, que tarda 6." }
      ]
    },
    {
      expr: "parallel(parallel(a, b), c)",
      datos: "D(a) = 3, D(b) = 5, D(c) = 2",
      pregunta: "¿Cuánto vale D?",
      cierre: "D = max(max(3, 5), 2) = 5. La regla se aplica de adentro hacia afuera, y el parallel de dentro ya es un máximo.",
      opciones: [
        { txt: "8", fallo: "Esa cuenta es max(3 + 5, 2): suma a y b. El parallel de dentro también es un máximo, porque esos dos lados van al tiempo." },
        { txt: "10", fallo: "Esa es la suma de las tres profundidades. Con dos parallel anidados no queda ninguna suma de profundidades." },
        { txt: "5", correcta: true },
        { txt: "2", fallo: "Esa es la rama más corta. La expresión termina cuando terminan las tres, de modo que manda la más larga." }
      ]
    },
    {
      expr: "val (s1, s2) = parallel(mitadIzq, mitadDer)\ns1 + s2",
      datos: "D(mitadIzq) = D(mitadDer) = 4, D de la suma final = 1",
      pregunta: "¿Cuánto vale D de las dos líneas juntas?",
      cierre: "D = max(4, 4) + 1 = 5. Es el paso que da segmentRec en cada nivel: las dos mitades al tiempo y una suma más al volver.",
      opciones: [
        { txt: "9", fallo: "Esa es la cuenta del trabajo, 4 + 4 + 1. La profundidad toma el máximo de las dos mitades porque van al tiempo." },
        { txt: "5", correcta: true },
        { txt: "8", fallo: "Esa suma las dos mitades, como si corrieran una después de la otra. parallel las pone a la vez, y después queda la suma final." },
        { txt: "4", fallo: "Falta la suma final. s1 + s2 no puede empezar hasta que las dos mitades terminen, así que está en la cadena más larga." }
      ]
    }
  ];

  /* --- Carta 5: mas nucleos y lo que deciden ------------------------- */

  var DECISIONES = [
    {
      expr: "la cadena ((((((1+2)+3)+4)+5)+6)+7)+8 en una máquina de ocho núcleos",
      pregunta: "¿Qué hay que cambiar para bajar el tiempo?",
      cierre: "El orden de las operaciones. Con D = 7 ningún número de núcleos baja de siete unidades; agrupando por parejas la profundidad queda en 3, y con cuatro núcleos el tiempo también.",
      opciones: [
        { txt: "agrupar las sumas por parejas, para que dejen de necesitarse una a la otra", correcta: true, larga: true },
        { txt: "nada del código: hace falta una máquina con más núcleos para repartir las siete sumas", fallo: "La página calcula el tiempo con mil núcleos y sigue siendo 7. Una cadena de dependencias no se rompe agregando núcleos.", larga: true },
        { txt: "envolver cada suma en un parallel, de modo que las siete salgan al tiempo", fallo: "parallel no adelanta un cálculo que necesita el resultado anterior: el segundo lado espera igual, y encima se paga el costo de lanzarlo.", larga: true },
        { txt: "bajar el umbral, para que la recursión reparta en segmentos más pequeños", fallo: "Aquí no hay recursión que partir, son siete sumas encadenadas. El umbral decide cuándo dejar de partir, no cómo están ordenadas las dependencias.", larga: true }
      ]
    },
    {
      expr: "sumar ocho enteros en el orden en árbol, con speedup tope de " + coma(SECUENCIAL.w / ARBOL.d, 2),
      pregunta: "¿Conviene lanzar tareas para esta suma?",
      cierre: "No. Lo que está en juego son siete sumas de enteros, y lanzar y esperar una tarea cuesta bastante más que eso. El orden en árbol rinde cuando n crece o cuando cada operación es costosa.",
      opciones: [
        { txt: "no: lanzar y esperar tareas cuesta más que las siete sumas que se reparten", correcta: true, larga: true },
        { txt: "sí: el tope ya pasa del doble, y no depende del tamaño de la entrada", fallo: "El tope sí depende del tamaño: es W/D, y con n = 1024 llega a 102,3. Con ocho enteros lo que se gana cabe en el costo de crear una tarea.", larga: true },
        { txt: "no: el orden en árbol hace más trabajo, porque guarda resultados intermedios", fallo: "Los dos órdenes hacen siete sumas y los dos guardan resultados intermedios. Reordenar no agrega trabajo, redistribuye dependencias.", larga: true },
        { txt: "sí: el árbol baja W de 7 a 3, así que hay menos operaciones que hacer", fallo: "W es 7 en los dos órdenes, y la traza las cuenta una por una. Lo que baja a 3 es la profundidad, que es el tiempo con núcleos de sobra.", larga: true }
      ]
    }
  ];

  function verificar() {
    return {
      secuencial: "W = " + SECUENCIAL.w + ", D = " + SECUENCIAL.d +
        ", resultado = " + SECUENCIAL.res,
      arbol: "W = " + ARBOL.w + ", D = " + ARBOL.d +
        ", resultado = " + ARBOL.res,
      opsPorNivel: { secuencial: OPS_SEC, arbol: OPS_ARBOL },
      nucleos: NUCLEOS.map(function (p) {
        var f = filaNucleos(p);
        return "P = " + f.p + ": secuencial " + f.tSec + ", árbol " +
          f.tArbol + ", speedup " + f.texto;
      }),
      primerPTope: primerPTope(),
      items: REGLAS.length + DECISIONES.length
    };
  }

  var API = {
    NUMEROS: NUMEROS, CODIGO: CODIGO, NUCLEOS: NUCLEOS,
    SECUENCIAL: SECUENCIAL, ARBOL: ARBOL,
    OPS_SEC: OPS_SEC, OPS_ARBOL: OPS_ARBOL,
    REGLAS: REGLAS, DECISIONES: DECISIONES,
    pasosSecuencial: pasosSecuencial, pasosArbol: pasosArbol,
    simular: simular, tiempoCon: tiempoCon, filaNucleos: filaNucleos,
    opcionesTrabajo: opcionesTrabajo,
    opcionesProfundidadSec: opcionesProfundidadSec,
    opcionesProfundidadArbol: opcionesProfundidadArbol,
    verificar: verificar
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================ la pagina ================ */

  var resueltos = { reglas: 0, decisiones: 0 };
  var fallados = 0;
  var acertadas = {};
  var pSeleccionado = NUCLEOS[0];

  function cuentaAcertadas() {
    var n = 0;
    var k;
    for (k in acertadas) {
      if (acertadas[k]) { n = n + 1; }
    }
    return n;
  }

  function marcar() {
    document.getElementById("marcador-reglas").textContent =
      "resueltas: " + resueltos.reglas + " de " + REGLAS.length +
      "    ·    opciones falladas: " + fallados;
    document.getElementById("marcador-decisiones").textContent =
      "resueltas: " + resueltos.decisiones + " de " + DECISIONES.length;
    if (cuentaAcertadas() === 3 &&
        resueltos.reglas === REGLAS.length &&
        resueltos.decisiones === DECISIONES.length) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  function vigilar(idOpciones, idVeredicto, clave) {
    document.getElementById(idOpciones).addEventListener("click", function () {
      if (document.getElementById(idVeredicto).className.indexOf("bien") >= 0) {
        acertadas[clave] = true;
        marcar();
      }
    });
  }

  function construirPresets() {
    var caja = document.getElementById("presets");
    var ordenes = [
      { clave: "secuencial", rotulo: "orden secuencial" },
      { clave: "arbol", rotulo: "orden en árbol" }
    ];
    ordenes.forEach(function (o) {
      var b = document.createElement("button");
      b.textContent = o.rotulo;
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(caja.children, function (x) {
          x.className = x.className.replace(" primario", "");
        });
        b.className = b.className + " primario";
        Motor.reiniciar({ orden: o.clave });
      });
      caja.appendChild(b);
    });
    caja.children[0].className = caja.children[0].className + " primario";
  }

  function pintarCuentas(e) {
    var hechas = e.k;
    var actual = e.actual;
    document.getElementById("cuenta-w").textContent = hechas;
    document.getElementById("cuenta-d").textContent = actual ? actual.d : 0;
    var pie = document.getElementById("pie-traza");
    if (!actual) {
      pie.textContent = "Avance paso a paso y mire cómo crecen las dos cuentas: " +
        "W sube con cada suma, D solo cuando la suma tiene que esperar a otra.";
      return;
    }
    if (e.terminado) {
      var rotulo = actual.orden === "árbol" ? "en árbol" : "secuencial";
      pie.textContent = "Orden " + rotulo + ": " + hechas +
        " sumas, resultado " + actual.res + ", W = " + hechas + " y D = " +
        actual.d + ". La cadena más larga pasa por " + actual.d + " sumas.";
      return;
    }
    if (actual.orden === "árbol") {
      pie.textContent = "Nivel " + actual.nivel + ": " + actual.enParalelo +
        " sumas que no se necesitan entre sí, todas podrían hacerse al tiempo. " +
        "Depende de " + actual.depende + ", de modo que D va en " + actual.d + ".";
    } else {
      pie.textContent = "Paso " + actual.nivel + ": " + actual.op + " = " +
        actual.res + ". Depende de " + actual.depende + ", así que la cadena " +
        "crece y D va en " + actual.d + ".";
    }
  }

  function construirNucleos() {
    var caja = document.getElementById("nucleos");
    NUCLEOS.forEach(function (p) {
      var b = document.createElement("button");
      b.textContent = p + (p === 1 ? " núcleo" : " núcleos");
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(caja.children, function (x) {
          x.className = x.className.replace(" primario", "");
        });
        b.className = b.className + " primario";
        pSeleccionado = p;
        pintarNucleos();
      });
      caja.appendChild(b);
    });
    caja.children[0].className = caja.children[0].className + " primario";
  }

  function pintarNucleos() {
    var f = filaNucleos(pSeleccionado);
    var caja = document.getElementById("barras-tiempo");
    var mayor = Math.max(f.tSec, f.tArbol);
    caja.innerHTML = "";
    [{ rot: "orden secuencial", t: f.tSec, b: 1 },
     { rot: "orden en árbol", t: f.tArbol, b: 2 }].forEach(function (d) {
      var fila = document.createElement("div");
      var rot = document.createElement("span");
      var pista = document.createElement("div");
      var barra = document.createElement("div");
      var valor = document.createElement("span");
      fila.className = "barra-fila";
      rot.className = "rotulo";
      rot.textContent = d.rot;
      pista.className = "pista-barra";
      barra.className = "barra b" + d.b;
      barra.style.width = Math.round(100 * d.t / mayor) + "%";
      valor.className = "valor";
      valor.textContent = d.t + " u";
      pista.appendChild(barra);
      fila.appendChild(rot);
      fila.appendChild(pista);
      fila.appendChild(valor);
      caja.appendChild(fila);
    });
    document.getElementById("lectura-nucleos").innerHTML =
      "Con " + f.p + (f.p === 1 ? " núcleo" : " núcleos") +
      ": la cadena tarda <b>" + f.tSec + "</b> unidades y el árbol <b>" +
      f.tArbol + "</b>, de modo que el speedup del árbol frente a la cadena es <b>" +
      f.texto + "</b>.";
    var tope = primerPTope();
    document.getElementById("nota-nucleos").textContent =
      "La cadena marca " + SECUENCIAL.d + " unidades con cualquier número de " +
      "núcleos, porque su profundidad es " + SECUENCIAL.d + ". El árbol llega a " +
      "su profundidad, " + ARBOL.d + ", desde " + tope + " núcleos, y de ahí en " +
      "adelante los núcleos de más quedan sin nada que hacer.";
  }

  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  function construirItems(lista, idCaja, cuenta) {
    var caja = document.getElementById(idCaja);
    lista.forEach(function (item, indice) {
      var contenedor = document.createElement("div");
      var expr = document.createElement("div");
      var datos = document.createElement("div");
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
      contenedor.appendChild(expr);
      if (item.datos) {
        datos.className = "datos";
        datos.textContent = item.datos;
        contenedor.appendChild(datos);
      }
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
            resueltos[cuenta] = resueltos[cuenta] + 1;
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
      contenedor.appendChild(preg);
      contenedor.appendChild(ops);
      contenedor.appendChild(ver);
      caja.appendChild(contenedor);
    });
  }

  construirPresets();
  construirNucleos();
  pintarNucleos();
  construirItems(REGLAS, "reglas", "reglas");
  construirItems(DECISIONES, "decisiones", "decisiones");
  Motor.iniciar({
    codigo: CODIGO,
    simular: simular,
    chips: [
      { campo: "op", rotulo: "suma" },
      { campo: "res", rotulo: "resultado" },
      { campo: "w", rotulo: "W", clase: "cuenta" },
      { campo: "d", rotulo: "D", clase: "cuenta" },
      { campo: "nivel", rotulo: "nivel" }
    ],
    paramsIniciales: { orden: "secuencial" },
    alPintar: pintarCuentas
  });
  Motor.opcionesNumericas("opciones-w", "veredicto-w", opcionesTrabajo);
  Motor.opcionesNumericas("opciones-d-sec", "veredicto-d-sec", opcionesProfundidadSec);
  Motor.opcionesNumericas("opciones-d-arbol", "veredicto-d-arbol", opcionesProfundidadArbol);
  vigilar("opciones-w", "veredicto-w", "w");
  vigilar("opciones-d-sec", "veredicto-d-sec", "dsec");
  vigilar("opciones-d-arbol", "veredicto-d-arbol", "darbol");
  marcar();
})();
