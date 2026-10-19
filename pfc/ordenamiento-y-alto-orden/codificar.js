/* codificar: el ejercicio guiado de la codificacion por corridas, con las dos
   definiciones tal como estan escritas en el deck y las tres piezas que las
   componen: la recursion con span de empaquetar, el map y la tupla. Ni el
   resultado ni los distractores estan escritos a mano: los cuatro candidatos de
   cada entrada los calcula este archivo, tres de ellos con funciones parecidas
   que se equivocan de una forma reconocible. Los resultados coinciden con la
   corrida en Scala 2.13.11. */
(function () {

  var CODIGO = [
    "def empaquetar[T](xs: List[T]): List[List[T]] =",
    "  xs match {",
    "    case Nil => Nil",
    "    case x :: _ =>",
    "      val (grupo, resto) = xs.span(e => e == x)",
    "      grupo :: empaquetar(resto)",
    "  }",
    "",
    "def codificar[T](xs: List[T]): List[(T, Int)] =",
    "  empaquetar(xs).map(grupo => (grupo.head, grupo.length))"
  ];

  var ENTRADAS = [
    ["a", "a", "a", "b", "c", "c", "a"],
    ["x", "y", "y"],
    [1, 1, 2, 1, 1, 1]
  ];

  /* ── Las dos definiciones del deck, en el mismo orden de pasos ──── */

  function empaquetar(xs) {
    var x, i;
    if (xs.length === 0) { return []; }
    x = xs[0];
    i = 0;
    while (i < xs.length && xs[i] === x) { i = i + 1; }
    return [xs.slice(0, i)].concat(empaquetar(xs.slice(i)));
  }

  function codificar(xs) {
    return empaquetar(xs).map(function (grupo) {
      return [grupo[0], grupo.length];
    });
  }

  /* ── Las tres formas de equivocarse, cada una calculada ─────────── */

  /* Cuenta las apariciones del elemento en toda la lista, no las del grupo:
     junta corridas separadas que empaquetar deja aparte. */
  function fundidos(xs) {
    return xs.reduce(function (acum, x) {
      var visto = acum.filter(function (p) { return p[0] === x; });
      if (visto.length === 0) { return acum.concat([[x, 1]]); }
      return acum.map(function (p) { return p[0] === x ? [p[0], p[1] + 1] : p; });
    }, []);
  }

  /* La tupla al reves: la cantidad primero. */
  function volteados(xs) {
    return codificar(xs).map(function (p) { return [p[1], p[0]]; });
  }

  /* Un par por cada elemento de la entrada, sin agrupar nada. */
  function porElemento(xs) {
    return xs.map(function (x) { return [x, 1]; });
  }

  /* ── Como se muestran ───────────────────────────────────────────── */

  function textoLista(xs) {
    return "List(" + xs.join(", ") + ")";
  }

  function textoPares(ps) {
    return "List(" + ps.map(function (p) { return "(" + p[0] + "," + p[1] + ")"; }).join(", ") + ")";
  }

  function textoGrupos(gs) {
    return "List(" + gs.map(textoLista).join(", ") + ")";
  }

  var FALLOS = {
    agrupados: "Esos son los grupos que devuelve empaquetar, sin transformar. "
      + "Falta el map que convierte cada grupo en una tupla.",
    fundidos: "Ahi se juntaron grupos que no venian seguidos. empaquetar agrupa "
      + "solo lo consecutivo, y entre dos corridas del mismo elemento hay otro en medio.",
    volteados: "Las dos componentes estan al reves. El par es "
      + "(grupo.head, grupo.length): primero el elemento y despues la cantidad.",
    porElemento: "Ese es un par por cada elemento de la entrada, sin agrupar. "
      + "El map recibe la lista de grupos, no la lista original."
  };

  /* Cuatro candidatos por entrada: el correcto y los tres primeros que no
     coincidan con el. Con List("x","y","y") fundir no cambia nada, asi que
     ese distractor se cae solo y entra el siguiente. */
  function candidatos(xs) {
    var correcto = textoPares(codificar(xs));
    var pila = [
      { clave: "agrupados", txt: textoGrupos(empaquetar(xs)) },
      { clave: "fundidos", txt: textoPares(fundidos(xs)) },
      { clave: "volteados", txt: textoPares(volteados(xs)) },
      { clave: "porElemento", txt: textoPares(porElemento(xs)) }
    ];
    var distintos = pila.filter(function (c) { return c.txt !== correcto; });
    return [{ clave: "correcto", txt: correcto, correcta: true }]
      .concat(distintos.slice(0, 3).map(function (c) {
        return { clave: c.clave, txt: c.txt, fallo: FALLOS[c.clave] };
      }));
  }

  /* El correcto no queda siempre en el mismo puesto. */
  function ordenadas(xs, giro) {
    var ops = candidatos(xs);
    return ops.slice(giro % ops.length).concat(ops.slice(0, giro % ops.length));
  }

  var ITEMS = ENTRADAS.map(function (xs, i) {
    var grupos = empaquetar(xs);
    return {
      entrada: xs,
      llamada: "codificar(" + textoLista(xs) + ")",
      grupos: grupos,
      pares: codificar(xs),
      cuantos: grupos.length,
      opciones: ordenadas(xs, i + 1),
      pistaAlta: "Son menos. Cada grupo deja un par, y un elemento repetido "
        + "seguido no deja uno por vez.",
      pistaBaja: "Son mas. Un elemento que vuelve a aparecer despues de otro "
        + "abre un grupo nuevo, y ese grupo tambien deja su par.",
      cierre: "Tantos pares como grupos: " + grupos.length + "."
    };
  });

  var AFIRMACIONES = [
    {
      texto: "El resultado tiene tantos pares como grupos devuelve empaquetar.",
      cierta: true,
      razon: "map pone una salida por cada elemento de la lista que recibe, y la "
        + "que recibe es la de los grupos, asi que la longitud no cambia.",
      fallo: "Es cierta: map no agrega ni quita elementos, los reemplaza uno por uno."
    },
    {
      texto: "El resultado tiene tantos pares como elementos distintos hay en la lista.",
      cierta: false,
      razon: "Con List(1, 1, 2, 1, 1, 1) hay dos elementos distintos y salen tres "
        + "pares, porque el 1 viene en dos corridas separadas por el 2.",
      fallo: "Es falsa: un mismo elemento puede abrir varios grupos si vuelve a "
        + "aparecer despues de otro."
    },
    {
      texto: "Sumar las cantidades de todos los pares da la longitud de la lista original.",
      cierta: true,
      razon: "Cada elemento cae en exactamente un grupo, y la cantidad de un par es "
        + "el tamanio de su grupo.",
      fallo: "Es cierta: los grupos reparten la entrada sin perder ni repetir elementos."
    }
  ];

  var API = {
    CODIGO: CODIGO, ENTRADAS: ENTRADAS, ITEMS: ITEMS, AFIRMACIONES: AFIRMACIONES,
    empaquetar: empaquetar, codificar: codificar, fundidos: fundidos,
    volteados: volteados, porElemento: porElemento,
    textoLista: textoLista, textoPares: textoPares, textoGrupos: textoGrupos
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ════════════════ la pagina ════════════════ */

  var resueltas = 0;
  var resueltasAfirm = 0;
  var fallados = 0;

  function construirCodigo() {
    var panel = document.getElementById("panel-codigo");
    CODIGO.forEach(function (texto, i) {
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

  function marcar() {
    document.getElementById("marcador").textContent =
      "entradas resueltas: " + resueltas + " de " + ITEMS.length +
      "    ·    respuestas falladas: " + fallados;
    document.getElementById("marcador-afirm").textContent =
      "resueltas: " + resueltasAfirm + " de " + AFIRMACIONES.length;
    if (resueltas === ITEMS.length && resueltasAfirm === AFIRMACIONES.length) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  /* Cada grupo con el par que le sale, para que se vea de donde viene cada
     cantidad. */
  function pintarGrupos(item, caja) {
    item.grupos.forEach(function (g, i) {
      var d = document.createElement("span");
      var b = document.createElement("b");
      var fl = document.createElement("span");
      d.className = "grupo";
      d.appendChild(document.createTextNode(textoLista(g)));
      fl.className = "flecha-par";
      fl.textContent = " → ";
      d.appendChild(fl);
      b.textContent = "(" + item.pares[i][0] + "," + item.pares[i][1] + ")";
      d.appendChild(b);
      caja.appendChild(d);
    });
    caja.className = "grupos visible";
  }

  function construirLlamadas() {
    var caja = document.getElementById("llamadas");
    ITEMS.forEach(function (item) {
      var fila = document.createElement("div");
      var llamada = document.createElement("div");
      var cuantos = document.createElement("div");
      var rotulo = document.createElement("label");
      var campo = document.createElement("input");
      var boton = document.createElement("button");
      var verNum = document.createElement("div");
      var ops = document.createElement("div");
      var ver = document.createElement("div");
      var vista = document.createElement("div");

      fila.className = "item";
      llamada.className = "llamada";
      llamada.textContent = item.llamada;
      cuantos.className = "cuantos";
      rotulo.textContent = "¿cuántos pares salen?";
      campo.type = "number";
      campo.min = "0";
      boton.textContent = "Comprobar";
      verNum.className = "veredicto";
      ops.className = "opciones bloqueado";
      ver.className = "veredicto";
      vista.className = "grupos";

      boton.addEventListener("click", function () {
        var v = parseInt(campo.value, 10);
        if (isNaN(v)) {
          verNum.className = "veredicto mal";
          verNum.textContent = "Escriba un número primero.";
          return;
        }
        if (v === item.cuantos) {
          campo.className = "bien-celda";
          campo.disabled = true;
          boton.disabled = true;
          verNum.className = "veredicto bien";
          verNum.textContent = item.cierre;
          ops.className = "opciones";
          marcar();
          return;
        }
        fallados = fallados + 1;
        verNum.className = "veredicto mal";
        verNum.textContent = v > item.cuantos ? item.pistaAlta : item.pistaBaja;
        marcar();
      });

      item.opciones.forEach(function (o) {
        var b = document.createElement("button");
        b.textContent = o.txt;
        b.addEventListener("click", function () {
          if (o.correcta) {
            b.className = "acertada";
            Array.prototype.forEach.call(ops.children, function (x) { x.disabled = true; });
            ver.className = "veredicto bien";
            ver.textContent = "Un par por grupo, con el elemento primero y la cantidad después.";
            resueltas = resueltas + 1;
            pintarGrupos(item, vista);
          } else {
            b.className = "errada";
            b.disabled = true;
            ver.className = "veredicto mal";
            ver.textContent = o.fallo;
            fallados = fallados + 1;
          }
          marcar();
        });
        ops.appendChild(b);
      });

      cuantos.appendChild(rotulo);
      cuantos.appendChild(campo);
      cuantos.appendChild(boton);
      fila.appendChild(llamada);
      fila.appendChild(cuantos);
      fila.appendChild(verNum);
      fila.appendChild(ops);
      fila.appendChild(ver);
      fila.appendChild(vista);
      caja.appendChild(fila);
    });
  }

  function construirAfirmaciones() {
    var caja = document.getElementById("afirmaciones");
    AFIRMACIONES.forEach(function (item) {
      var fila = document.createElement("div");
      var texto = document.createElement("div");
      var ops = document.createElement("div");
      var ver = document.createElement("div");
      fila.className = "item";
      texto.textContent = item.texto;
      ops.className = "opciones";
      ops.style.flexDirection = "row";
      ver.className = "veredicto";
      [true, false].forEach(function (eleccion) {
        var b = document.createElement("button");
        b.textContent = eleccion ? "cierta" : "falsa";
        b.addEventListener("click", function () {
          if (eleccion === item.cierta) {
            b.className = "acertada";
            Array.prototype.forEach.call(ops.children, function (x) { x.disabled = true; });
            ver.className = "veredicto bien";
            ver.textContent = item.razon;
            resueltasAfirm = resueltasAfirm + 1;
          } else {
            b.className = "errada";
            b.disabled = true;
            ver.className = "veredicto mal";
            ver.textContent = item.fallo;
            fallados = fallados + 1;
          }
          marcar();
        });
        ops.appendChild(b);
      });
      fila.appendChild(texto);
      fila.appendChild(ops);
      fila.appendChild(ver);
      caja.appendChild(fila);
    });
  }

  construirCodigo();
  construirLlamadas();
  construirAfirmaciones();
  marcar();
})();
