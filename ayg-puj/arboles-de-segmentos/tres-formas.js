/* Ejercicio interactivo: tres formas de contestar la misma pregunta.
   El mismo reparto de consultas y cambios, resuelto recorriendo el arreglo,
   con un arreglo de prefijos y con el arbol de segmentos. Las cuentas del
   arbol salen de recorrer la recursion, no de una formula, de modo que N se
   puede subir hasta donde el dibujo ya no cabria. */
var SEG = (typeof module !== "undefined") ? require("./lib.js") : SEG;

var EJERCICIO = (function () {
  var PRESETS = [
    { rotulo: "casi todo consultas", N: 1024, consultas: 1000, cambios: 10 },
    { rotulo: "mitad y mitad", N: 1024, consultas: 500, cambios: 500 },
    { rotulo: "un arreglo chico", N: 16, consultas: 500, cambios: 500 },
    { rotulo: "cien mil posiciones", N: 100000, consultas: 1000, cambios: 1000 }
  ];

  var NOMBRES = { recorrido: "el recorrido", prefijos: "el arreglo de prefijos", arbol: "el árbol" };

  function limpio(e) {
    return { N: Math.max(2, Math.min(1000000, Math.round(e.N) || 2)),
             consultas: Math.max(0, Math.min(100000, Math.round(e.consultas) || 0)),
             cambios: Math.max(0, Math.min(100000, Math.round(e.cambios) || 0)) };
  }

  function cuentas(e) {
    var x = limpio(e);
    return SEG.costos(x.N, x.consultas, x.cambios);
  }

  function opcionesArbol(e) {
    var c = cuentas(e);
    return SEG.sinRepetidos([
      { valor: c.arbol.total, clave: "correcta",
        razon: "Correcto: " + c.arbol.arme + " de la construcción, " + c.consultas + " × " +
          c.arbol.consulta + " de las consultas y " + c.cambios + " × " + c.arbol.cambio +
          " de los cambios." },
      { valor: c.consultas * c.arbol.consulta + c.cambios * c.arbol.cambio, clave: "sin-arme",
        razon: "Ahí falta la construcción. <code>build</code> escribe " + c.arbol.arme +
          " casillas antes de la primera consulta, y esa cuenta se paga una vez." },
      { valor: c.arbol.arme, clave: "solo-arme",
        razon: "La construcción sola cuesta eso. Cada consulta visita " + c.arbol.consulta +
          " vértices y cada cambio reescribe " + c.arbol.cambio + "." },
      { valor: c.arbol.arme + (c.consultas + c.cambios) * c.arbol.consulta, clave: "todo-consulta",
        razon: "Ahí el cambio se cobró como una consulta. Un cambio baja por un solo camino, " +
          c.arbol.cambio + " vértices, y la consulta abre dos." },
      { valor: 4 * c.N + c.consultas * c.arbol.consulta + c.cambios * c.arbol.cambio, clave: "reserva",
        razon: "Ahí la construcción se contó como las " + 4 * c.N + " casillas reservadas. " +
          "<code>build_rec</code> escribe " + c.arbol.arme + ": una por vértice." }
    ]);
  }

  function opcionesPrefijos(e) {
    var c = cuentas(e);
    return SEG.sinRepetidos([
      { valor: c.prefijos.total, clave: "correcta",
        razon: "Correcto: " + c.prefijos.arme + " de armarlo, dos lecturas por consulta y " +
          c.prefijos.cambio + " por cambio, que es rehacer el prefijo desde la posición " +
          c.posicion + "." },
      { valor: c.prefijos.arme + c.consultas * 2, clave: "sin-cambios",
        razon: "Ahí los cambios salieron gratis. Un cambio en la posición " + c.posicion +
          " deja mal todas las sumas de ahí en adelante: " + c.prefijos.cambio + " casillas." },
      { valor: c.consultas * 2, clave: "solo-consultas",
        razon: "Las consultas cuestan eso, y es lo bueno de los prefijos. Falta armarlo y falta cada cambio." },
      { valor: c.prefijos.arme + c.consultas * 2 + c.cambios * c.N, clave: "rehace-todo",
        razon: "Ahí cada cambio rehizo el prefijo completo. Las posiciones antes de la " + c.posicion +
          " no cambian, así que son " + c.prefijos.cambio + " y no " + c.N + "." },
      { valor: c.prefijos.arme + c.consultas + c.cambios * c.prefijos.cambio, clave: "una-lectura",
        razon: "La consulta es una resta de dos casillas, <code>P[qr + 1] - P[ql]</code>, así que son dos lecturas." }
    ]);
  }

  function opcionesGanador(e) {
    var c = cuentas(e), g = SEG.gana(c);
    var lista = ["recorrido", "prefijos", "arbol"].map(function (k) {
      return { valor: NOMBRES[k], clave: k === g ? "correcta" : k,
               razon: (k === g ? "Correcto: " : "No con este reparto: ") + NOMBRES[k] + " mira " +
                 c[k].total + " casillas, contra " + c.recorrido.total + " del recorrido, " +
                 c.prefijos.total + " de los prefijos y " + c.arbol.total + " del árbol." +
                 (k === g && k === "recorrido" && c.consultas === 0
                   ? " Sin consultas no hay nada que indexar." : "") };
    });
    return lista;
  }

  /* Cinco rondas sobre lo que el arbol pide: una operacion asociativa, un
     neutro y las 4N casillas. */
  var RONDAS = [
    {
      titulo: "El mismo árbol para el mínimo",
      texto: "La consulta ahora pide el mínimo del rango en vez de la suma. Qué guarda cada vértice y " +
        "qué devuelve un vértice disjunto.",
      opciones: [
        { txt: "El mínimo de su segmento, y un vértice disjunto devuelve 0.",
          fb: "El 0 ganaría cualquier comparación con valores positivos, y el mínimo saldría 0 siempre. El neutro del mínimo no es el 0." },
        { txt: "La suma de su segmento, y el mínimo se busca comparando las sumas de los vértices visitados.",
          fb: "La suma de un segmento no dice cuál es su valor más chico: [1, 9] suma 10 igual que [5, 5]." },
        { txt: "El mínimo de su segmento, y un vértice disjunto no devuelve nada.",
          fb: "Tiene que devolver algo: la línea 30 suma lo que traen los dos hijos y necesita un valor de los dos lados." },
        { txt: "El mínimo de su segmento, y un vértice disjunto devuelve infinito.", ok: true,
          fb: "Eso es. Cambian dos cosas: la combinación de las líneas 12 y 47, que pasa a ser <code>min</code>, y el valor de la línea 23, que pasa a ser el neutro del mínimo." }
      ]
    },
    {
      titulo: "El promedio del rango",
      texto: "Sirve el mismo árbol para contestar el promedio de un rango.",
      opciones: [
        { txt: "Sí, guardando en cada vértice la suma y la cantidad, y dividiendo al final.", ok: true,
          fb: "Eso es. Las dos cosas que se guardan sí se combinan, y la división se hace una vez, cuando la consulta ya tiene el total." },
        { txt: "Sí, guardando el promedio de cada segmento y promediando los dos promedios de los hijos.",
          fb: "El promedio de dos promedios falla cuando los segmentos tienen tamaños distintos: [0,1] con promedio 6 y [2] con 9 dan 7 de media, y las tres posiciones promedian 7,67." },
        { txt: "No, porque el promedio de dos segmentos no se calcula con los promedios de cada uno.",
          fb: "Con los promedios solos no, y por eso se guarda también la cantidad. Con ese par el vértice sí se arma desde sus hijos." },
        { txt: "No, porque la división no tiene elemento neutro y el caso disjunto se queda sin valor.",
          fb: "La operación que combina los vértices es la suma, no la división: la división aparece una sola vez, al final." }
      ]
    },
    {
      titulo: "La mediana del rango",
      texto: "Qué impide contestar la mediana de un rango con un árbol donde cada vértice guarda un número.",
      opciones: [
        { txt: "Que la mediana de un rango depende del tamaño del rango, y la consulta no lo conoce.",
          fb: "El tamaño se sabe: es qr − ql + 1, y el árbol podría guardar la cantidad de cada segmento como en el promedio." },
        { txt: "Que la mediana de dos segmentos no sale de las dos medianas: hay que saber cómo se intercalan.", ok: true,
          fb: "Eso es. [1, 2, 9] y [3, 4, 100] tienen medianas 2 y 4, y la mediana de los seis es 3,5. Guardar el segmento ordenado en cada vértice sí responde, y la memoria pasa de 4N a N log N." },
        { txt: "Que la mediana no es asociativa ni tiene neutro, pero con los segmentos ordenados tampoco se puede.",
          fb: "Con los segmentos ordenados sí se puede, y es lo que hace un árbol de mezcla. Lo que cambia es qué guarda el vértice." },
        { txt: "Que el árbol solo admite operaciones que se puedan sumar o restar.",
          fb: "El mínimo, el máximo, el producto y el máximo común divisor no se suman ni se restan, y los tres funcionan." }
      ]
    },
    {
      titulo: "Una operación que no sirve",
      texto: "Alguien quiere un árbol donde la consulta devuelva <code>A[ql] − A[ql+1] + A[ql+2] − …</code>, " +
        "combinando los hijos con una resta. Qué falla.",
      opciones: [
        { txt: "Nada falla: la resta tiene neutro 0, así que el caso disjunto devuelve 0 y el árbol funciona igual.",
          fb: "El neutro no alcanza. Con (8 − 5) − 3 = 0 y 8 − (5 − 3) = 6, el resultado depende de cómo se agrupe, y el árbol agrupa por mitades." },
        { txt: "Que la resta no tiene elemento neutro, así que el caso disjunto no sabe qué devolver.",
          fb: "Neutro por la derecha sí tiene: restar 0 no cambia nada. Lo que no tiene es la otra propiedad." },
        { txt: "Que la resta no es asociativa, así que el resultado cambia según por dónde se parta el rango.", ok: true,
          fb: "Eso es. El árbol parte el rango donde le queda cómodo, y una operación asociativa es justo la que no se entera de esa partición." },
        { txt: "Que la resta puede dar negativos y los vértices guardan sumas de positivos.",
          fb: "Los valores negativos no son problema: la suma de enteros con signo funciona igual en el árbol." }
      ]
    },
    {
      titulo: "Qué compra la memoria de más",
      texto: "Para un arreglo de 100 000 posiciones, el árbol reserva 400 000 casillas y el prefijo " +
        "100 001. Qué se obtiene por esa diferencia.",
      opciones: [
        { txt: "Una consulta más rápida: el árbol la contesta en menos casillas que la resta de dos prefijos.",
          fb: "Al contrario: la resta son dos casillas y es lo más rápido que hay para consultar. Lo que el prefijo no sabe hacer es cambiar." },
        { txt: "Una construcción más rápida, porque el árbol se arma de abajo hacia arriba.",
          fb: "Armar el prefijo cuesta una pasada, 100 000 sumas, y el árbol escribe 199 999 casillas. Construir es más caro, no más barato." },
        { txt: "Que un cambio cueste 18 casillas en vez de las 66 667 que hay que rehacer del prefijo.", ok: true,
          fb: "Eso es, y es la única cosa que compra: con las dos operaciones mezcladas, el cambio es lo que decide." },
        { txt: "Nada aprovechable: las 4N casillas son el precio de la recursión y se podrían evitar.",
          fb: "La reserva es grande por los índices que la numeración se salta, pero el cambio en log N no sale de ahí: sale de que cada posición vive en un camino de ancestros." }
      ]
    }
  ];

  return { PRESETS: PRESETS, RONDAS: RONDAS, NOMBRES: NOMBRES, limpio: limpio,
           cuentas: cuentas, opcionesArbol: opcionesArbol, opcionesPrefijos: opcionesPrefijos,
           opcionesGanador: opcionesGanador };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO;
    var estado = { N: E.PRESETS[0].N, consultas: E.PRESETS[0].consultas, cambios: E.PRESETS[0].cambios };
    var cajas = [];
    function el(id) { return document.getElementById(id); }

    function leer() {
      estado = E.limpio({ N: parseInt(el("campo-n").value, 10),
                          consultas: parseInt(el("campo-consultas").value, 10),
                          cambios: parseInt(el("campo-cambios").value, 10) });
      escribir();
      pintar();
    }

    function escribir() {
      el("campo-n").value = estado.N;
      el("campo-consultas").value = estado.consultas;
      el("campo-cambios").value = estado.cambios;
    }

    function fila(nombre, c, k, g) {
      var cl = k === g ? " class='destaca'" : " class='pierde'";
      return "<tr><td>" + nombre + "</td><td>" + c[k].arme + "</td><td>" + c[k].consulta +
        "</td><td>" + c[k].cambio + "</td><td" + cl + ">" + c[k].total + "</td><td>" +
        c.memoria[k === "recorrido" ? "arreglo" : k] + "</td></tr>";
    }

    function pintar() {
      var c = E.cuentas(estado), g = SEG.gana(c);
      el("ver-faena").innerHTML = "N = <b>" + c.N + "</b>, cada consulta pide el rango [" +
        c.rango[0] + ", " + c.rango[1] + "], que son " + c.largo + " posiciones, y cada cambio escribe la " +
        "posición <b>" + c.posicion + "</b>.";
      el("tabla-costos").innerHTML = "<table class='cuentas'><tr><th>forma</th><th>armar</th>" +
        "<th>por consulta</th><th>por cambio</th><th>total</th><th>casillas de memoria</th></tr>" +
        fila("recorrer el arreglo", c, "recorrido", g) +
        fila("arreglo de prefijos", c, "prefijos", g) +
        fila("árbol de segmentos", c, "arbol", g) + "</table>";
      var cruceP = SEG.cruceContraPrefijos(c.N, c.consultas);
      var cruceR = SEG.cruceContraRecorrido(c.N, c.cambios);
      el("ver-cruces").innerHTML =
        "Con estas " + c.consultas + " consultas, el árbol le gana al prefijo " +
        (cruceP < 0 ? "<b>en ningún número de cambios</b>: para este N la construcción cuesta más de lo que ahorra"
                    : "desde <b>" + cruceP + "</b> cambios") + ". Con estos " + c.cambios +
        " cambios, le gana al recorrido " +
        (cruceR < 0 ? "<b>en ninguna cantidad de consultas</b>" : "desde <b>" + cruceR + "</b> consultas") + ".";
      cajas.forEach(function (x) { x.refrescar(); });
    }

    function presets() {
      var caja = el("presets");
      E.PRESETS.forEach(function (pr) {
        var b = document.createElement("button");
        b.textContent = pr.rotulo;
        b.addEventListener("click", function () {
          estado = { N: pr.N, consultas: pr.consultas, cambios: pr.cambios };
          escribir();
          pintar();
        });
        caja.appendChild(b);
      });
    }

    function rondas() {
      var caja = el("rondas");
      E.RONDAS.forEach(function (r, i) {
        var carta = document.createElement("div");
        carta.className = "carta";
        var h2 = document.createElement("h2");
        h2.textContent = (i + 1 + 4) + ". " + r.titulo;
        var pr = document.createElement("p");
        pr.className = "pregunta";
        pr.innerHTML = r.texto;
        var ops = document.createElement("div");
        var ver = document.createElement("div");
        ver.className = "veredicto";
        carta.appendChild(h2);
        carta.appendChild(pr);
        carta.appendChild(ops);
        carta.appendChild(ver);
        caja.appendChild(carta);
        SEG.montarOpciones(ops, r.opciones, ver);
      });
    }

    presets();
    rondas();
    escribir();
    el("btn-recalcular").addEventListener("click", leer);
    ["campo-n", "campo-consultas", "campo-cambios"].forEach(function (id) {
      el(id).addEventListener("change", leer);
    });

    cajas.push(Motor.opcionesNumericas("opciones-arbol", "veredicto-arbol", function () {
      return E.opcionesArbol(estado);
    }));
    cajas.push(Motor.opcionesNumericas("opciones-prefijos", "veredicto-prefijos", function () {
      return E.opcionesPrefijos(estado);
    }));
    cajas.push(Motor.opcionesNumericas("opciones-ganador", "veredicto-ganador", function () {
      return E.opcionesGanador(estado);
    }));
    pintar();
  })();
}
