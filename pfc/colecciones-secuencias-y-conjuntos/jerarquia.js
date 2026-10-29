/* jerarquia: la primera seccion del deck de colecciones. Arranca con las tres
   lineas de 01_repaso_basico.scala, que reactivan map, filter y length sobre
   List, y sigue con la eleccion de coleccion y con la misma operacion aplicada
   sobre otras colecciones. Los valores correctos salieron de correr el codigo
   con Scala 2.13.11, la version del proyecto del curso. Los distractores son
   las confusiones que de verdad ocurren: cambiar map por filter, pedirle a un
   conjunto una posicion y suponer que una operacion devuelve siempre una
   lista. */
(function () {

  var CODIGO = [
    "println(List(1, 2, 3).map(x => x * 2))",
    "println(List(1, 2, 3).filter(x => x > 1))",
    "println(List(\"hola\", \"mundo\").map(s => s.length))"
  ];

  /* ── Seccion 2: las tres lineas de repaso ───────────────────────── */

  var REPASO = [
    {
      expr: "List(1, 2, 3).map(x => x * 2)",
      pregunta: "map aplica la función a cada elemento.",
      cierre: "Tres elementos entran y tres salen, cada uno por el doble de sí mismo.",
      opciones: [
        { txt: "List(2, 4, 6)", correcta: true },
        { txt: "List(2, 3)", fallo: "List(2, 3) es lo que devuelve filter(x => x > 1) sobre la misma lista: quedarse con los que cumplen una condición. map no descarta a nadie." },
        { txt: "List(1, 2, 3, 2, 4, 6)", fallo: "La salida tiene un elemento por cada elemento de la entrada, tres en total. Los resultados no se agregan al final de la lista original." }
      ]
    },
    {
      expr: "List(1, 2, 3).filter(x => x > 1)",
      pregunta: "filter usa la condición para decidir quién pasa.",
      cierre: "El 1 no cumple x > 1, y los otros dos salen tal como entraron.",
      opciones: [
        { txt: "List(2, 3)", correcta: true },
        { txt: "List(1, 2, 3)", fallo: "La comparación es estricta: x > 1 deja fuera al 1, que no es mayor que sí mismo." },
        { txt: "List(false, true, true)", fallo: "List(false, true, true) es la condición evaluada en cada elemento. filter no cambia los elementos por el resultado de la comparación: la usa para elegir y devuelve los números." }
      ]
    },
    {
      expr: "List(\"hola\", \"mundo\").map(s => s.length)",
      pregunta: "La función que recibe map mide cada palabra.",
      cierre: "Dos palabras, dos números: la de cuatro letras y la de cinco.",
      opciones: [
        { txt: "List(4, 5)", correcta: true },
        { txt: "List(2)", fallo: "2 es cuántas palabras tiene la lista. map no cuenta elementos: aplica la función a cada uno, y aquí la función mide el largo de una palabra." },
        { txt: "List(9)", fallo: "9 es la suma de los dos largos. map deja un resultado por elemento, así que la salida tiene dos números y no uno." }
      ]
    }
  ];

  /* ── Seccion 3: cual coleccion resuelve cada necesidad ──────────── */

  var ELECCION = [
    {
      expr: "cada valor una sola vez",
      pregunta: "Se reciben valores con repeticiones y hay que quedarse con los distintos.",
      cierre: "Vector(1, 2, 2, 3).toSet da Set(1, 2, 3), y size da 3.",
      opciones: [
        { txt: "Set", correcta: true },
        { txt: "List", fallo: "Una lista conserva las repeticiones tal como se escriban. Quitarlas es pasar a un conjunto: Vector(1, 2, 2, 3).toSet da Set(1, 2, 3), con size 3." },
        { txt: "Range", fallo: "Un rango no repite valores, pero tampoco guarda los que uno quiera: describe enteros desde un inicio hasta un fin con un paso fijo." }
      ]
    },
    {
      expr: "llegar por posición",
      pregunta: "Hay que alcanzar un elemento del medio sin recorrer los anteriores.",
      cierre: "Un Vector es la secuencia con acceso balanceado, y las operaciones de List siguen estando: head, tail, isEmpty, map y filter.",
      opciones: [
        { txt: "Vector", correcta: true },
        { txt: "List", fallo: "Una lista se recorre desde el frente con head y tail, así que para llegar al último hay que pasar por todos los anteriores." },
        { txt: "Set", fallo: "A un conjunto no se le pide una posición. Set(1, 2, 3, 4)(3) no devuelve el elemento del puesto 3: devuelve true, la respuesta a si el 3 está dentro." }
      ]
    },
    {
      expr: "enteros con paso uniforme",
      pregunta: "Se necesitan los enteros de 1 a 10 de tres en tres.",
      cierre: "(1 to 10 by 3).toList da List(1, 4, 7, 10), y length da 4.",
      opciones: [
        { txt: "Range", correcta: true },
        { txt: "List", fallo: "List(1, 4, 7, 10) se puede escribir a mano, y con mil números deja de ser una opción. Un rango se guarda con tres valores, el inicio, el fin y el paso, y de ahí sale la secuencia." },
        { txt: "Set", fallo: "Un conjunto se puede obtener de un rango, como en (1 to 4).toSet, que da Set(1, 2, 3, 4). Lo que produce la secuencia con paso uniforme es el rango." }
      ]
    },
    {
      expr: "los caracteres de un texto",
      pregunta: "Hay que quedarse con las mayúsculas de \"Hola mundo\".",
      cierre: "\"Hola mundo\".filter(_.isUpper) da H, y length da 10: el texto responde directo a las operaciones de secuencia.",
      opciones: [
        { txt: "String", correcta: true },
        { txt: "List[Char]", fallo: "No hace falta convertir el texto. \"Hola mundo\".length da 10 y \"Hola mundo\".map(_.toUpper) da HOLA MUNDO, sin pasar por ninguna otra colección." },
        { txt: "Array[Char]", fallo: "Un arreglo de caracteres habría que construirlo aparte. El texto ya es una secuencia de caracteres y acepta map y filter." }
      ]
    }
  ];

  /* ── Seccion 4: la misma operacion sobre otras colecciones ──────── */

  var MISMAS = [
    {
      expr: "Vector(2, 3, 4).map(_ * 10)",
      pregunta: "El mismo map, ahora sobre un vector.",
      cierre: "map devuelve una colección del mismo tipo que recibió.",
      opciones: [
        { txt: "Vector(20, 30, 40)", correcta: true },
        { txt: "List(20, 30, 40)", fallo: "Los números son esos, el tipo no. map sobre un Vector devuelve un Vector; sobre una List devuelve una List." },
        { txt: "Vector(2, 3, 4, 20, 30, 40)", fallo: "La salida tiene tres elementos, uno por cada entrada. Los resultados no se agregan al vector original." }
      ]
    },
    {
      expr: "Array(1, 2, 3).map(x => 2 * x).toList",
      pregunta: "Un arreglo acepta las mismas operaciones, y la expresión cierra con toList.",
      cierre: "map entrega otro arreglo y el toList del final lo convierte en lista.",
      opciones: [
        { txt: "List(2, 4, 6)", correcta: true },
        { txt: "List(2, 3)", fallo: "List(2, 3) es lo que da Array(1, 2, 3).filter(_ > 1).toList: filtrar elige quién pasa. Aquí la función 2 * x se aplica a los tres." },
        { txt: "List(1, 4, 9)", fallo: "Multiplicar cada elemento por sí mismo daría ese resultado. La función escrita es 2 * x, con el 2 fijo." }
      ]
    },
    {
      expr: "\"Hola mundo\".map(_.toUpper)",
      pregunta: "Un texto también acepta map, con una función de carácter.",
      cierre: "Los diez caracteres pasan por toUpper y el resultado vuelve a ser un texto.",
      opciones: [
        { txt: "HOLA MUNDO", correcta: true },
        { txt: "H", fallo: "H es lo que devuelve \"Hola mundo\".filter(_.isUpper): filtrar deja las mayúsculas que ya estaban. map transforma los diez caracteres." },
        { txt: "10", fallo: "10 es \"Hola mundo\".length, cuántos caracteres tiene. map no cuenta: devuelve el texto con cada carácter cambiado." }
      ]
    },
    {
      expr: "Vector(1, 2, 2, 3).toSet.size",
      pregunta: "El vector trae un valor repetido y el conjunto se queda con los distintos.",
      cierre: "Vector(1, 2, 2, 3).toSet da Set(1, 2, 3), de tamaño 3.",
      opciones: [
        { txt: "3", correcta: true },
        { txt: "4", fallo: "4 es cuántos elementos tiene el vector. Al pasar a conjunto el 2 queda una sola vez, así que size baja a 3." },
        { txt: "2", fallo: "2 es el valor que se repite, no cuántos valores distintos quedan." }
      ]
    }
  ];

  var API = { CODIGO: CODIGO, REPASO: REPASO, ELECCION: ELECCION, MISMAS: MISMAS };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ════════════════ la pagina ════════════════ */

  var resueltos = { repaso: 0, eleccion: 0, mismas: 0 };
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
    document.getElementById("marcador-repaso").textContent =
      "resueltas: " + resueltos.repaso + " de " + REPASO.length;
    document.getElementById("marcador-eleccion").textContent =
      "resueltas: " + resueltos.eleccion + " de " + ELECCION.length;
    document.getElementById("marcador-mismas").textContent =
      "resueltas: " + resueltos.mismas + " de " + MISMAS.length +
      "    ·    opciones falladas en toda la página: " + fallados;
    if (resueltos.repaso === REPASO.length && resueltos.eleccion === ELECCION.length
        && resueltos.mismas === MISMAS.length) {
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
  construirOpciones("repaso", REPASO, "repaso");
  construirOpciones("eleccion", ELECCION, "eleccion");
  construirOpciones("mismas", MISMAS, "mismas");
  marcar();
})();
