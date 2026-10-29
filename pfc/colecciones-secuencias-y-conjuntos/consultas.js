/* consultas: las tres operaciones de la seccion "Operaciones sobre secuencias",
   con los mismos vectores que declara 04_consultas_zip.scala. Cada valor
   correcto salio de correr ese codigo con Scala 2.13.11; ninguno esta escrito
   de memoria. Los distractores son las dos confusiones que de verdad ocurren:
   responder con los elementos que cumplen, que es lo que devuelve filter, en
   lugar del booleano que devuelven exists y forall, y suponer que zip exige
   dos secuencias del mismo largo. */
(function () {

  var CODIGO_NUMS = [
    "val nums = Vector(2, 4, 6, 8)"
  ];

  var CODIGO_ZIP = [
    "val nombres = Vector(\"Ana\", \"Luis\", \"Maria\")",
    "val edades  = Vector(20, 22, 21)",
    "",
    "val parejas = nombres zip edades"
  ];

  var CODIGO_AGREGADOS = [
    "val nums = Vector(3, 1, 4, 1, 5)"
  ];

  /* ── Seccion 2: exists y forall ─────────────────────────────────── */

  var BOOLEANOS = [
    {
      expr: "nums.exists(_ > 5)",
      pregunta: "¿Hay algún elemento mayor que 5?",
      cierre: "Con un elemento que cumpla, exists ya devuelve true: aquí cumplen 6 y 8.",
      opciones: [
        { txt: "true", correcta: true },
        { txt: "false", fallo: "false diría que ningún elemento pasa de 5, y en Vector(2, 4, 6, 8) están el 6 y el 8." },
        { txt: "Vector(6, 8)", fallo: "Esos son los elementos que cumplen, que es lo que entrega filter. exists responde si hay alguno, y su resultado es un Boolean." }
      ]
    },
    {
      expr: "nums.exists(_ > 10)",
      pregunta: "La misma pregunta con un umbral que ninguno alcanza.",
      cierre: "El mayor del vector es 8, así que no hay ninguno que cumpla y exists devuelve false.",
      opciones: [
        { txt: "false", correcta: true },
        { txt: "true", fallo: "true pediría encontrar un elemento mayor que 10, y el más grande del vector es el 8." },
        { txt: "Vector()", fallo: "Un vector vacío es lo que devolvería filter cuando nada cumple. exists devuelve el booleano que resume esa búsqueda." }
      ]
    },
    {
      expr: "nums.forall(_ % 2 == 0)",
      pregunta: "¿Son todos pares?",
      cierre: "Los cuatro elementos son pares, así que ninguno falla la condición y forall devuelve true.",
      opciones: [
        { txt: "true", correcta: true },
        { txt: "false", fallo: "false exigiría que algún elemento fallara la condición. El 2, el 4, el 6 y el 8 son todos pares." },
        { txt: "Vector(2, 4, 6, 8)", fallo: "Ese es el vector completo, que es lo que devolvería filter con una condición que todos cumplen. forall devuelve un Boolean." }
      ]
    },
    {
      expr: "nums.forall(_ > 3)",
      pregunta: "¿Son todos mayores que 3?",
      cierre: "Al 2 le basta con fallar la condición para que forall devuelva false, sin importar los otros tres.",
      opciones: [
        { txt: "false", correcta: true },
        { txt: "true", fallo: "true pediría que los cuatro pasaran de 3, y el 2 no lo hace." },
        { txt: "Vector(4, 6, 8)", fallo: "Esos son los tres que sí cumplen, que es lo que deja filter. forall no selecciona elementos: responde si todos cumplen." }
      ]
    }
  ];

  /* ── Seccion 3: la coleccion vacia ──────────────────────────────── */

  var VACIA = [
    {
      expr: "Vector[Int]().forall(_ > 3)",
      pregunta: "forall sobre una colección sin elementos.",
      cierre: "forall busca un elemento que falle la condición. En una colección vacía no hay ninguno, así que devuelve true.",
      opciones: [
        { txt: "true", correcta: true },
        { txt: "false", fallo: "false afirmaría que algún elemento falla la condición, y aquí no hay elementos de los cuales afirmar nada." },
        { txt: "no compila: el vector está vacío", fallo: "El tipo está escrito, Vector[Int], y forall es un método de la colección, no de sus elementos: la llamada compila y corre.", larga: true }
      ]
    },
    {
      expr: "Vector[Int]().exists(_ > 3)",
      pregunta: "exists sobre la misma colección sin elementos.",
      cierre: "exists necesita encontrar un elemento que cumpla, y en la colección vacía no hay ninguno: devuelve false.",
      opciones: [
        { txt: "false", correcta: true },
        { txt: "true", fallo: "true exigiría un elemento mayor que 3, y el vector no tiene elementos." },
        { txt: "true, lo mismo que forall sobre la vacía", fallo: "Las dos preguntas se separan justo en el caso vacío: forall da true porque ninguno falla, y exists da false porque ninguno cumple.", larga: true }
      ]
    }
  ];

  /* ── Seccion 4: zip y unzip ─────────────────────────────────────── */

  var PAREJAS = [
    {
      expr: "nombres zip edades",
      pregunta: "Dos vectores del mismo largo entran a zip.",
      cierre: "zip empareja por posición: el primero con el primero, el segundo con el segundo, y cada elemento del resultado es una tupla.",
      opciones: [
        { txt: "Vector((Ana,20), (Luis,22), (Maria,21))", correcta: true, larga: true },
        { txt: "Vector(Ana, 20, Luis, 22, Maria, 21)", fallo: "Así quedaría si zip intercalara los elementos en una sola secuencia plana. Lo que arma es una pareja por posición, de modo que el resultado tiene tres elementos y cada uno es una tupla.", larga: true },
        { txt: "(Vector(Ana, Luis, Maria),Vector(20, 22, 21))", fallo: "Esa es la pareja de dos vectores que devuelve unzip, el camino de vuelta. zip va de dos secuencias a una secuencia de parejas.", larga: true }
      ]
    },
    {
      expr: "Vector(\"Ana\", \"Luis\") zip Vector(20, 22, 99)",
      pregunta: "Ahora el segundo vector tiene un elemento más.",
      cierre: "zip se detiene donde se agota la más corta, así que el 99 no llega al resultado y quedan dos parejas.",
      opciones: [
        { txt: "Vector((Ana,20), (Luis,22))", correcta: true, larga: true },
        { txt: "tres parejas, completando el nombre que falta", fallo: "zip no completa nada. Al no haber un tercer nombre con el que emparejar el 99, el recorrido termina y el resultado trae dos parejas.", larga: true },
        { txt: "error en ejecución por los largos distintos", fallo: "La expresión corre sin error: zip admite secuencias de largos distintos justamente porque recorta a la más corta.", larga: true }
      ]
    },
    {
      expr: "parejas.unzip",
      pregunta: "El camino de vuelta sobre el vector de tres parejas.",
      cierre: "unzip devuelve una tupla de dos vectores, uno por componente, y con val (ns, es) = parejas.unzip cada uno queda con su nombre.",
      opciones: [
        { txt: "(Vector(Ana, Luis, Maria),Vector(20, 22, 21))", correcta: true, larga: true },
        { txt: "Vector(Vector(Ana, Luis, Maria), Vector(20, 22, 21))", fallo: "El resultado no es una secuencia de dos secuencias sino una tupla de dos, y por eso se reparte con un patrón de dos nombres y no con head y tail.", larga: true },
        { txt: "Vector(Ana, 20, Luis, 22, Maria, 21)", fallo: "Eso sería todo junto en una sola secuencia. unzip separa las dos columnas: los nombres por un lado y las edades por el otro.", larga: true }
      ]
    }
  ];

  /* ── Seccion 5: sum, product, max y min ─────────────────────────── */

  var AGREGADOS = [
    {
      expr: "nums.sum",
      pregunta: "El total de los cinco elementos.",
      cierre: "sum recorre el vector completo y acumula: 3, 1, 4, 1 y 5 dan 14.",
      opciones: [
        { txt: "14", correcta: true },
        { txt: "13", fallo: "13 sale de contar una sola vez el 1. El vector lo trae dos veces y los dos entran al total: una secuencia admite elementos repetidos." },
        { txt: "5", fallo: "5 es el mayor del vector, que es lo que devuelve max. sum no elige un elemento: suma todos." }
      ]
    },
    {
      expr: "nums.product",
      pregunta: "El producto de los mismos cinco elementos.",
      cierre: "product multiplica en vez de sumar: 3 por 1 por 4 por 1 por 5 da 60.",
      opciones: [
        { txt: "60", correcta: true },
        { txt: "14", fallo: "14 es la suma. product arranca en 1 y va multiplicando cada elemento." },
        { txt: "0", fallo: "0 saldría si alguno de los elementos fuera cero, porque arrastraría todo el producto. El menor de este vector es 1, y multiplicar por 1 no cambia el acumulado." }
      ]
    },
    {
      expr: "nums.max",
      pregunta: "El mayor de los cinco.",
      cierre: "max compara los cinco elementos y devuelve el 5, que está en la última posición.",
      opciones: [
        { txt: "5", correcta: true },
        { txt: "4", fallo: "4 es el mayor de los cuatro primeros. max recorre hasta el final, y el 5 aparece justo ahí." },
        { txt: "1", fallo: "1 es el menor, que es lo que devuelve min." }
      ]
    },
    {
      expr: "nums.min",
      pregunta: "El menor de los cinco.",
      cierre: "min devuelve 1, el valor más pequeño, sin importar que aparezca dos veces.",
      opciones: [
        { txt: "1", correcta: true },
        { txt: "3", fallo: "3 es el primer elemento del vector, no el más pequeño. min los compara todos." },
        { txt: "5", fallo: "5 es el mayor, que es lo que devuelve max." }
      ]
    }
  ];

  var API = {
    CODIGO_NUMS: CODIGO_NUMS, CODIGO_ZIP: CODIGO_ZIP,
    CODIGO_AGREGADOS: CODIGO_AGREGADOS,
    BOOLEANOS: BOOLEANOS, VACIA: VACIA,
    PAREJAS: PAREJAS, AGREGADOS: AGREGADOS
  };
  if (typeof module !== "undefined") { module.exports = API; }
  if (typeof document === "undefined") { return; }

  /* ════════════════ la pagina ════════════════ */

  var SECCIONES = [
    { llave: "bool", caja: "booleanos", marcador: "marcador-booleanos", items: BOOLEANOS },
    { llave: "vacia", caja: "vacia", marcador: "marcador-vacia", items: VACIA },
    { llave: "parejas", caja: "parejas", marcador: "marcador-parejas", items: PAREJAS },
    { llave: "agregados", caja: "agregados", marcador: "marcador-agregados", items: AGREGADOS }
  ];

  var resueltos = { bool: 0, vacia: 0, parejas: 0, agregados: 0 };
  var fallados = 0;

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

  function marcar() {
    var listo = true;
    SECCIONES.forEach(function (s) {
      var m = document.getElementById(s.marcador);
      m.textContent = "resueltas: " + resueltos[s.llave] + " de " + s.items.length;
      if (resueltos[s.llave] < s.items.length) { listo = false; }
    });
    document.getElementById("marcador-agregados").textContent =
      "resueltas: " + resueltos.agregados + " de " + AGREGADOS.length +
      "    ·    opciones falladas en toda la página: " + fallados;
    if (listo) {
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

  construirCodigo("codigo-nums", CODIGO_NUMS);
  construirCodigo("codigo-zip", CODIGO_ZIP);
  construirCodigo("codigo-agregados", CODIGO_AGREGADOS);
  SECCIONES.forEach(function (s) {
    construirOpciones(s.caja, s.items, s.llave);
  });
  marcar();
})();
