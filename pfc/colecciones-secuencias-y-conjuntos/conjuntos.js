/* conjuntos: la seccion de Conjuntos del deck de colecciones, con las cuatro
   declaraciones de 07_set.scala. Cada valor y cada linea impresa salieron de
   correr ese archivo con Scala 2.13.11, la version del proyecto del curso;
   ninguno esta escrito de memoria. El ultimo grupo pregunta por el texto
   exacto que sale de println, que es donde el conjunto deja de comportarse
   como una secuencia: cambia el nombre con que se imprime y los elementos
   salen en otro orden. */
(function () {

  var CODIGO = [
    "val frutas = Set(\"lulo\", \"banano\", \"curuba\", \"chontaduro\")",
    "// imprime: Set(lulo, banano, curuba, chontaduro)",
    "",
    "val nums = (1 to 6).toSet",
    "",
    "val a = Set(1, 2, 3, 4)",
    "val b = Set(3, 4, 5, 6)"
  ];

  /* Las seis divisiones del frame de duplicados, en el orden del rango. */
  var DIVISIONES = [
    "1 / 2 = 0", "2 / 2 = 1", "3 / 2 = 1",
    "4 / 2 = 2", "5 / 2 = 2", "6 / 2 = 3"
  ];

  /* -- Seccion 2: las operaciones conocidas y las propias del conjunto -- */

  var VALORES = [
    {
      expr: "nums.exists(_ > 4)",
      pregunta: "La misma consulta que se hace sobre un Vector.",
      cierre: "nums sale de (1 to 6), así que trae el 5 y el 6.",
      opciones: [
        { txt: "true", correcta: true },
        { txt: "false", fallo: "false diría que ningún elemento pasa de 4, y nums llega hasta el 6." },
        { txt: "no compila: exists es de secuencias", fallo: "map, filter, exists y forall están también en Set. Lo que no trae un conjunto es el orden de los elementos.", larga: true }
      ]
    },
    {
      expr: "frutas.filter(_.startsWith(\"c\"))",
      pregunta: "Las frutas que empiezan por c.",
      cierre: "filter entrega un conjunto con todos los que cumplen.",
      opciones: [
        { txt: "Set(curuba, chontaduro)", correcta: true },
        { txt: "Set(curuba)", fallo: "filter deja todos los que cumplen, no el primero que encuentra. Las dos empiezan por c." },
        { txt: "Vector(curuba, chontaduro)", fallo: "Los dos elementos son esos, pero filtrar un conjunto devuelve un conjunto: la operación no cambia la clase de colección.", larga: true }
      ]
    },
    {
      expr: "a intersect b",
      pregunta: "Set(1, 2, 3, 4) contra Set(3, 4, 5, 6).",
      cierre: "intersect deja los que están en los dos a la vez.",
      opciones: [
        { txt: "Set(3, 4)", correcta: true },
        { txt: "Set(1, 2, 5, 6)", fallo: "Esos son los que están en uno solo de los dos conjuntos, que es lo contrario de lo que pide intersect." },
        { txt: "Set(1, 2, 3, 4, 5, 6)", fallo: "Esos son los seis de a union b. intersect no junta los dos conjuntos, los recorta al pedazo común." }
      ]
    },
    {
      expr: "a diff b",
      pregunta: "Los mismos dos conjuntos, en ese orden.",
      cierre: "diff quita del de la izquierda lo que aparece en el de la derecha.",
      opciones: [
        { txt: "Set(1, 2)", correcta: true },
        { txt: "Set(5, 6)", fallo: "Eso es b diff a. La operación no es simétrica: mira los elementos del conjunto de la izquierda." },
        { txt: "Set(1, 2, 5, 6)", fallo: "Eso reúne las dos diferencias. a diff b se queda solo con elementos de a." }
      ]
    },
    {
      expr: "a(3)",
      pregunta: "Un conjunto aplicado a un valor, como si fuera una función.",
      cierre: "a(3) es a.contains(3): pregunta si el 3 está en el conjunto.",
      opciones: [
        { txt: "true", correcta: true },
        { txt: "3", fallo: "Un conjunto no se indexa. El paréntesis no pide el elemento de la posición 3, pregunta si el 3 pertenece." },
        { txt: "4", fallo: "4 sería el elemento de la posición 3 contando desde cero, y en un conjunto no hay posiciones: no tiene primero ni último." }
      ]
    },
    {
      expr: "Set(1, 2).subsetOf(a)",
      pregunta: "Si todos los elementos del primero están en el segundo.",
      cierre: "a es Set(1, 2, 3, 4) y tiene los dos elementos.",
      opciones: [
        { txt: "true", correcta: true },
        { txt: "false", fallo: "false saldría si a le faltara el 1 o el 2, y a los tiene." },
        { txt: "Set(1, 2)", fallo: "subsetOf responde una pregunta y devuelve un booleano, no el conjunto de los elementos que coinciden." }
      ]
    },
    {
      expr: "Vector(1, 2, 2, 3).toSet.size",
      pregunta: "Un Vector con un elemento repetido, pasado a conjunto.",
      cierre: "Vector(1, 2, 2, 3).toSet es Set(1, 2, 3): el 2 entra una sola vez.",
      opciones: [
        { txt: "3", correcta: true },
        { txt: "4", fallo: "4 es la longitud del Vector. Al pasar a conjunto el 2 repetido se colapsa en uno." },
        { txt: "2", fallo: "size cuenta los elementos distintos, y son tres: el 1, el 2 y el 3." }
      ]
    }
  ];

  /* -- Seccion 3: cuantos elementos quedan despues de map -- */

  var COLAPSO = [
    {
      expr: "nums.map(_ / 2).size",
      pregunta: "División entera sobre los seis elementos de nums.",
      cierre: "Dos resultados aparecen dos veces, y en un conjunto entran una sola.",
      opciones: [
        { txt: "4", correcta: true },
        { txt: "6", fallo: "map aplica la función a los seis elementos, pero 2/2 y 3/2 dan los dos 1, y 4/2 y 5/2 dan los dos 2: quedan cuatro valores distintos." },
        { txt: "3", fallo: "3 saldría si también coincidieran el 0 o el 3, y cada uno sale de un solo elemento: 1/2 = 0 y 6/2 = 3." }
      ]
    },
    {
      expr: "nums.map(_ + 2).size",
      pregunta: "La misma operación con una función que no repite resultados.",
      cierre: "Sumar 2 manda cada elemento a un valor distinto, así que no se colapsa ninguno.",
      opciones: [
        { txt: "6", correcta: true },
        { txt: "4", fallo: "4 es lo que deja map(_ / 2). Con _ + 2 no hay dos elementos de nums que caigan en el mismo resultado." },
        { txt: "8", fallo: "map devuelve un resultado por elemento de entrada, y nums tiene seis: no agrega elementos nuevos." }
      ]
    }
  ];

  /* -- Seccion 4: el texto exacto que imprime println -- */

  var IMPRESO = [
    {
      expr: "println(nums)",
      pregunta: "El conjunto de (1 to 6), tal como sale por pantalla.",
      cierre: "Seis elementos, con el nombre HashSet y en un orden que no es el del rango.",
      opciones: [
        { txt: "HashSet(5, 1, 6, 2, 3, 4)", correcta: true, larga: true },
        { txt: "Set(1, 2, 3, 4, 5, 6)", fallo: "Los seis elementos son esos, pero ni el nombre ni el orden coinciden: un conjunto no guarda el orden en que entraron los elementos.", larga: true },
        { txt: "HashSet(1, 2, 3, 4, 5, 6)", fallo: "El nombre es el que sale. El orden no: los elementos aparecen en otro, y ese orden no forma parte de lo que un conjunto promete.", larga: true }
      ]
    },
    {
      expr: "println((1 to 4).toSet)",
      pregunta: "El mismo rango con dos elementos menos.",
      cierre: "Con cuatro elementos el conjunto sale con el nombre Set y en el orden del rango.",
      opciones: [
        { txt: "Set(1, 2, 3, 4)", correcta: true },
        { txt: "HashSet(1, 2, 3, 4)", fallo: "HashSet es el nombre que aparece con el conjunto de (1 to 5), que tiene un elemento más. Con cuatro sale Set." },
        { txt: "Range 1 to 4", fallo: "Eso es lo que imprime (1 to 4) sin el toSet: un rango no muestra sus elementos, muestra sus extremos." }
      ]
    },
    {
      expr: "println(nums.map(_ / 2))",
      pregunta: "El conjunto de cuatro elementos que deja la división entera.",
      cierre: "Cuatro elementos y, aun así, el nombre que sale es HashSet.",
      opciones: [
        { txt: "HashSet(0, 1, 2, 3)", correcta: true },
        { txt: "Set(0, 1, 2, 3)", fallo: "Los cuatro elementos son esos. El nombre impreso es HashSet, mientras (1 to 4).toSet, que también tiene cuatro, sale como Set: el nombre no se deduce del tamaño.", larga: true },
        { txt: "HashSet(0, 1, 1, 2, 2, 3)", fallo: "Esas son las seis divisiones. El conjunto se queda con los valores distintos, así que el 1 y el 2 aparecen una sola vez.", larga: true }
      ]
    },
    {
      expr: "println(a union b)",
      pregunta: "La unión de dos conjuntos de cuatro elementos.",
      cierre: "La unión deja seis elementos, y con seis el nombre que sale es HashSet.",
      opciones: [
        { txt: "HashSet(5, 1, 6, 2, 3, 4)", correcta: true, larga: true },
        { txt: "Set(1, 2, 3, 4, 5, 6)", fallo: "Los seis elementos son esos, en el orden en que uno los leería de los dos conjuntos. Salen con el nombre HashSet y en otro orden.", larga: true },
        { txt: "Set(1, 2, 3, 4, 3, 4, 5, 6)", fallo: "union no pega los dos conjuntos uno tras otro: el 3 y el 4, que están en ambos, entran una sola vez.", larga: true }
      ]
    },
    {
      expr: "println(a intersect b)",
      pregunta: "La intersección de esos mismos dos conjuntos.",
      cierre: "Dos elementos, y sale como Set, aunque la unión de los mismos dos salga como HashSet.",
      opciones: [
        { txt: "Set(3, 4)", correcta: true },
        { txt: "HashSet(3, 4)", fallo: "Los dos elementos son esos. Con dos elementos el nombre impreso es Set, y el de a union b es HashSet: el nombre cambia con el resultado, no con la operación.", larga: true },
        { txt: "Set(1, 2, 5, 6)", fallo: "Esos están en uno solo de los dos conjuntos. intersect deja los que están en los dos." }
      ]
    },
    {
      expr: "println(nums.filter(_ > 4))",
      pregunta: "Los elementos de nums mayores que 4.",
      cierre: "filter entrega los elementos que cumplen, y aquí quedan dos.",
      opciones: [
        { txt: "Set(5, 6)", correcta: true },
        { txt: "true", fallo: "true es lo que devuelve nums.exists(_ > 4). exists responde si hay alguno; filter entrega los que hay." },
        { txt: "HashSet(5, 6)", fallo: "Los dos elementos son esos, y con dos el nombre impreso es Set, aunque nums salga como HashSet." }
      ]
    }
  ];

  var API = {
    CODIGO: CODIGO, DIVISIONES: DIVISIONES,
    VALORES: VALORES, COLAPSO: COLAPSO, IMPRESO: IMPRESO
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ================= la pagina ================= */

  var resueltos = { valores: 0, colapso: 0, impreso: 0 };
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

  function construirDivisiones() {
    var caja = document.getElementById("divisiones");
    DIVISIONES.forEach(function (d) {
      var f = document.createElement("span");
      f.className = "ficha";
      f.textContent = d;
      caja.appendChild(f);
    });
  }

  function marcar() {
    document.getElementById("marcador-valores").textContent =
      "resueltas: " + resueltos.valores + " de " + VALORES.length;
    document.getElementById("marcador-colapso").textContent =
      "resueltas: " + resueltos.colapso + " de " + COLAPSO.length;
    document.getElementById("marcador-impreso").textContent =
      "resueltas: " + resueltos.impreso + " de " + IMPRESO.length +
      "    ·    opciones falladas en toda la página: " + fallados;
    if (resueltos.colapso === COLAPSO.length) {
      document.getElementById("caja-divisiones").style.display = "block";
    }
    if (resueltos.valores === VALORES.length && resueltos.colapso === COLAPSO.length
        && resueltos.impreso === IMPRESO.length) {
      document.getElementById("carta-cierre").classList.remove("bloqueado");
    }
  }

  function fila(item) {
    var caja = document.createElement("div");
    var expr = document.createElement("div");
    var preg = document.createElement("div");
    var ops = document.createElement("div");
    var ver = document.createElement("div");
    caja.className = "item";
    expr.className = "expr";
    expr.textContent = item.expr;
    preg.className = "pregunta";
    preg.textContent = item.pregunta;
    ops.className = "opciones";
    ver.className = "veredicto";
    caja.appendChild(expr);
    caja.appendChild(preg);
    caja.appendChild(ops);
    caja.appendChild(ver);
    return { caja: caja, ops: ops, ver: ver };
  }

  function bloquear(ops) {
    Array.prototype.forEach.call(ops.children, function (b) { b.disabled = true; });
  }

  function acertar(f, item, boton, llave) {
    boton.className = boton.className.replace(" errada", "") + " acertada";
    bloquear(f.ops);
    f.ver.className = "veredicto bien";
    f.ver.textContent = item.cierre;
    resueltos[llave] = resueltos[llave] + 1;
    marcar();
  }

  function errar(f, boton, texto) {
    boton.className = boton.className + " errada";
    boton.disabled = true;
    f.ver.className = "veredicto mal";
    f.ver.textContent = texto;
    fallados = fallados + 1;
    marcar();
  }

  /* La opcion correcta no cae siempre en el primer boton. */
  function rotar(lista, giro) {
    var corte = giro % lista.length;
    return lista.slice(corte).concat(lista.slice(0, corte));
  }

  function construirOpciones(cajaId, items, llave) {
    var caja = document.getElementById(cajaId);
    items.forEach(function (item, indice) {
      var f = fila(item);
      rotar(item.opciones, indice + 1).forEach(function (o) {
        var b = document.createElement("button");
        b.textContent = o.txt;
        if (o.larga) { b.className = "larga"; }
        b.addEventListener("click", function () {
          if (o.correcta) {
            acertar(f, item, b, llave);
          } else {
            errar(f, b, o.fallo);
          }
        });
        f.ops.appendChild(b);
      });
      caja.appendChild(f.caja);
    });
  }

  construirCodigo();
  construirDivisiones();
  construirOpciones("valores", VALORES, "valores");
  construirOpciones("colapso", COLAPSO, "colapso");
  construirOpciones("impreso", IMPRESO, "impreso");
  marcar();
})();
