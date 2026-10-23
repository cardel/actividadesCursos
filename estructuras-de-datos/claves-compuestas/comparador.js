/* Ejercicio interactivo: el orden en que un map recorre personas, con un comparador bueno y con dos defectuosos. */
var EJERCICIO = (function () {
  /* Llegan en este orden; el valor guardado es el turno de llegada. */
  var GENTE = [
    { nombre: "lina", edad: 28, salario: 1800 },
    { nombre: "marco", edad: 22, salario: 2500 },
    { nombre: "nora", edad: 28, salario: 2400 },
    { nombre: "omar", edad: 22, salario: 2500 },
    { nombre: "pilar", edad: 28, salario: 1800 },
    { nombre: "saul", edad: 35, salario: 1000 }
  ];

  var STRUCT = [
    "struct Persona {",
    "  string nombre;",
    "  int edad;",
    "  int salario;",
    "};"
  ].join("\n");

  var POR_EDAD = [
    "// edad de menor a mayor; si empatan, salario de mayor a menor;",
    "// si tambien empatan, el nombre",
    "struct PorEdad {",
    "  bool operator()(const Persona &a, const Persona &b) const {",
    "    bool menor;",
    "    if (a.edad != b.edad) {",
    "      menor = a.edad < b.edad;",
    "    } else if (a.salario != b.salario) {",
    "      menor = a.salario > b.salario;",
    "    } else {",
    "      menor = a.nombre < b.nombre;",
    "    }",
    "    return menor;",
    "  }",
    "};"
  ].join("\n");

  var SIN_NOMBRE = [
    "struct SinNombre {",
    "  bool operator()(const Persona &a, const Persona &b) const {",
    "    bool menor;",
    "    if (a.edad != b.edad) {",
    "      menor = a.edad < b.edad;",
    "    } else {",
    "      menor = a.salario > b.salario;",
    "    }",
    "    return menor;",
    "  }",
    "};"
  ].join("\n");

  var USO = [
    "map<Persona, int, PorEdad> turno;",
    "// por cada persona p que llega, en el turno i:",
    "turno[p] = i;"
  ].join("\n");

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function porEdad(a, b) {
    var menor;
    if (a.edad !== b.edad) {
      menor = a.edad < b.edad;
    } else if (a.salario !== b.salario) {
      menor = a.salario > b.salario;
    } else {
      menor = a.nombre < b.nombre;
    }
    return menor;
  }

  function sinNombre(a, b) {
    var menor;
    if (a.edad !== b.edad) {
      menor = a.edad < b.edad;
    } else {
      menor = a.salario > b.salario;
    }
    return menor;
  }

  /* El nombre comparado con <=: una persona queda menor que sí misma. */
  function conIgual(a, b) {
    var menor;
    if (a.edad !== b.edad) {
      menor = a.edad < b.edad;
    } else if (a.salario !== b.salario) {
      menor = a.salario > b.salario;
    } else {
      menor = a.nombre <= b.nombre;
    }
    return menor;
  }

  /* Un map con m[p] = valor: dos claves son la misma si ninguna es menor que
     la otra. La clave que queda es la primera que entró; el valor, el último. */
  function insertar(m, p, valor, comp) {
    var i = 0;
    var pos = -1;
    while (pos === -1 && i < m.length) {
      if (!comp(m[i].clave, p) && !comp(p, m[i].clave)) { pos = i; }
      i = i + 1;
    }
    if (pos === -1) {
      var j = 0;
      while (j < m.length && comp(m[j].clave, p)) { j = j + 1; }
      m.splice(j, 0, { clave: p, valor: valor });
    } else {
      m[pos].valor = valor;
    }
  }

  function construir(comp) {
    var m = [];
    GENTE.forEach(function (p, i) { insertar(m, p, i, comp); });
    return m;
  }

  function nombres(m) {
    return m.map(function (e) { return e.clave.nombre; });
  }

  /* Lo que hizo g++ con el comparador <= al repetir a nora: entra otra vez
     y count no la encuentra. */
  function repetirConIgual() {
    var m = construir(conIgual);
    var nora = GENTE[2];
    var j = 0;
    while (j < m.length && conIgual(m[j].clave, nora)) { j = j + 1; }
    m.splice(j, 0, { clave: nora, valor: GENTE.length });
    var cuenta = m.filter(function (e) { return !conIgual(e.clave, nora) && !conIgual(nora, e.clave); }).length;
    return { size: m.length, count: cuenta };
  }

  function spec() {
    var bueno = construir(porEdad);
    var malo = construir(sinNombre);
    var lista = GENTE.map(function (p, i) {
      return i + ": " + p.nombre + " " + p.edad + " " + p.salario;
    }).join("\n");
    var valMarco = malo.filter(function (e) { return e.clave.nombre === "marco"; })[0].valor;
    var valLina = malo.filter(function (e) { return e.clave.nombre === "lina"; })[0].valor;
    var rep = repetirConIgual();
    return {
      contenedor: "tarjetas",
      cierre: "El map ordena con el comparador y nada más: decide que dos claves son la misma cuando ninguna es menor que la otra. Si el comparador no mira un campo, dos personas que solo difieren en ese campo se funden en una; la primera conserva su lugar y se queda con el último valor asignado. Si compara con &lt;=, una persona queda menor que sí misma: el map la vuelve a insertar y count no la encuentra. Cada comparación cuesta Θ(1) cuando deciden la edad o el salario y O(L) cuando hay que llegar al nombre.",
      cartas: [
        { tipo: "respuesta", titulo: "El recorrido con PorEdad",
          html: "<pre class=\"fragmento\">" + esc(STRUCT) + "\n\n" + esc(POR_EDAD) + "\n\n" + esc(USO) + "</pre><p>Llegan, con su turno:</p><pre class=\"fragmento\">" + lista + "</pre><p>¿En qué orden recorre el <code>map</code> los nombres?</p>",
          campos: [{ rotulo: "nombres:", esperado: nombres(bueno).join(" "), pista: "a b c d e f", ancho: "20rem" }],
          bien: "Correcto. Primero los de 22 años, que empatan también en salario y se ordenan por nombre; después los de 28, con el salario mayor primero y lina antes que pilar; al final saul.",
          distractores: [
            { valores: ["marco omar lina pilar nora saul"], msg: "Dentro de los 28 años el salario va de mayor a menor: fíjese en el > de la segunda comparación." },
            { valores: ["lina marco nora omar pilar saul"], msg: "Ese es el orden alfabético. El nombre solo decide cuando la edad y el salario empatan." },
            { valores: ["omar marco nora lina pilar saul"], msg: "Entre marco y omar decide el nombre, de menor a mayor: marco va primero." },
            { valores: ["marco omar nora pilar lina saul"], msg: "lina y pilar empatan en edad y salario; el nombre va de menor a mayor: lina primero." }
          ],
          otro: "Agrupe por edad de menor a mayor; dentro de cada edad, salario de mayor a menor; y si aún empatan, nombre." },
        { tipo: "opciones", titulo: "Lo que separa a lina de pilar", columna: true, correcta: "nombre",
          html: "<p>Cuando el <code>map</code> compara a lina con pilar, ¿qué línea del comparador decide?</p>",
          opciones: [
            { op: "edad", texto: "<code>menor = a.edad &lt; b.edad;</code>", msg: "Esa línea solo corre si las edades son distintas, y las dos tienen 28." },
            { op: "salario", texto: "<code>menor = a.salario &gt; b.salario;</code>", msg: "Esa línea solo corre si los salarios son distintos, y las dos ganan 1800." },
            { op: "nombre", texto: "<code>menor = a.nombre &lt; b.nombre;</code>", msg: "Correcto: las dos tienen 28 años y 1800 de salario, así que solo queda el nombre." }
          ] },
        { tipo: "respuesta", titulo: "Un comparador que no mira el nombre",
          html: "<pre class=\"fragmento\">" + esc(SIN_NOMBRE) + "</pre><p>Las mismas seis personas entran a un <code>map&lt;Persona, int, SinNombre&gt;</code> con <code>turno[p] = i</code>. ¿Cuánto vale <code>size()</code> y qué nombres salen en el recorrido?</p>",
          campos: [
            { rotulo: "size():", esperado: String(malo.length), ancho: "3rem" },
            { rotulo: "nombres:", esperado: nombres(malo).join(" "), pista: "a b c d", ancho: "14rem" }
          ],
          bien: "Correcto. Para SinNombre, marco y omar son la misma clave (22 años, 2500), y lina y pilar también (28 años, 1800). Quedan cuatro: omar y pilar cayeron sobre quien llegó antes.",
          distractores: [
            { valores: ["6", null], msg: "Con SinNombre dos personas de igual edad y salario no son menores la una que la otra: el map las toma como la misma clave." },
            { valores: ["4", "omar nora pilar saul"], msg: "La clave que queda es la que entró primero; la que llega después solo cambia el valor." },
            { valores: ["3", null], msg: "nora tiene 28 años como lina, pero otro salario: SinNombre sí las distingue." }
          ],
          otro: "Busque las parejas que empatan en edad y en salario: el map conserva una sola de cada pareja." },
        { tipo: "respuesta", titulo: "Los valores que quedaron",
          html: "<p>En el <code>map</code> con <code>SinNombre</code>, ¿qué valor tiene la clave de marco y cuál la de lina?</p>",
          campos: [
            { rotulo: "marco:", esperado: String(valMarco), ancho: "3rem" },
            { rotulo: "lina:", esperado: String(valLina), ancho: "3rem" }
          ],
          bien: "Correcto. <code>turno[omar] = 3</code> encontró la clave de marco y le cambió el valor; <code>turno[pilar] = 4</code> hizo lo mismo con la de lina. Las claves siguen diciendo marco y lina.",
          distractores: [
            { valores: ["1", "0"], msg: "Esos son los turnos de marco y lina. omar y pilar llegaron después y sobrescribieron el valor." }
          ],
          otro: "La clave se queda con el valor de la última asignación que la encontró." },
        { tipo: "respuesta", titulo: "Un &lt;= en lugar de &lt;",
          html: "<p>Otro comparador es igual a <code>PorEdad</code>, salvo la última línea: <code>menor = a.nombre &lt;= b.nombre;</code>. Con las seis personas da el mismo recorrido y <code>size()</code> vale 6. Después llega otra vez <code>nora 28 2400</code>, con <code>turno[p] = 6</code>. En g++, ¿cuánto vale <code>size()</code> y qué responde <code>turno.count(p)</code> para esa nora?</p>",
          campos: [
            { rotulo: "size():", esperado: String(rep.size), ancho: "3rem" },
            { rotulo: "count:", esperado: String(rep.count), ancho: "3rem" }
          ],
          bien: "Correcto. Con &lt;=, comparar a nora con nora da verdadero: el map cree que es menor que sí misma, nunca la encuentra y la inserta otra vez. Quedan dos noras, y count, que busca una clave que no sea menor ni mayor, responde 0.",
          distractores: [
            { valores: ["6", "1"], msg: "Eso haría PorEdad. Con &lt;=, nora queda menor que nora y el map no la reconoce." },
            { valores: ["7", "2"], msg: "Están las dos noras en el recorrido, pero count no encuentra ninguna: para el comparador cada nora es menor que la otra." }
          ],
          otro: "Evalúe el comparador con a y b iguales a nora. ¿Da falso, como debería?" },
        { tipo: "opciones", titulo: "Lo que cuesta comparar", columna: true, correcta: "nombres",
          html: "<p>Una empresa guarda n empleados en un <code>map&lt;Persona, int, PorEdad&gt;</code>, y todos tienen 30 años y ganan 2000. Los nombres miden hasta L caracteres. ¿Qué cuesta buscar a uno?</p>",
          opciones: [
            { op: "log", texto: "O(log n), como con claves enteras", msg: "Eso valdría si la edad o el salario decidieran. Aquí cada comparación termina comparando cadenas." },
            { op: "nombres", texto: "O(L log n)", msg: "Correcto: la edad y el salario siempre empatan, así que cada una de las O(log n) comparaciones llega al nombre y cuesta O(L)." },
            { op: "n", texto: "Θ(n), porque todos empatan", msg: "No empatan: el nombre los distingue y el map sigue balanceado. Solo cada comparación se vuelve más cara." }
          ] }
      ]
    };
  }

  return { gente: GENTE, porEdad: porEdad, sinNombre: sinNombre, conIgual: conIgual, construir: construir, nombres: nombres, repetirConIgual: repetirConIgual, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
