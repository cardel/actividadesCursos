/* Ejercicio interactivo: tres funciones hash para Persona, cuáles chocan y qué pasa si el hash no respeta la igualdad. */
var EJERCICIO = (function () {
  var GENTE = [
    { id: "A", nombre: "lina", edad: 20, salario: 1500 },
    { id: "B", nombre: "marco", edad: 30, salario: 1000 },
    { id: "C", nombre: "lina", edad: 25, salario: 1300 },
    { id: "D", nombre: "nora", edad: 26, salario: 1250 },
    { id: "E", nombre: "omar", edad: 40, salario: 900 }
  ];

  var HASHES = [
    "struct HashNombre {",
    "  unsigned long long operator()(const Persona &p) const {",
    "    unsigned long long h = 0;",
    "    int i = 0;",
    "    while (i < (int) p.nombre.size()) {",
    "      h = h * 31 + p.nombre[i];",
    "      i = i + 1;",
    "    }",
    "    return h;",
    "  }",
    "};",
    "",
    "struct HashProducto {",
    "  unsigned long long operator()(const Persona &p) const {",
    "    return (unsigned long long) p.edad * p.salario;",
    "  }",
    "};",
    "",
    "struct HashTres {",
    "  unsigned long long operator()(const Persona &p) const {",
    "    unsigned long long h = p.salario;",
    "    h = h * 37 + p.edad;",
    "    int i = 0;",
    "    while (i < (int) p.nombre.size()) {",
    "      h = h * 37 + p.nombre[i];",
    "      i = i + 1;",
    "    }",
    "    return h;",
    "  }",
    "};"
  ].join("\n");

  var MISMA = [
    "// la misma persona: mismo nombre y misma edad; el salario puede cambiar",
    "struct MismaPersona {",
    "  bool operator()(const Persona &a, const Persona &b) const {",
    "    return a.nombre == b.nombre && a.edad == b.edad;",
    "  }",
    "};",
    "",
    "unordered_map<Persona, int, HashTres, MismaPersona> planta;",
    "planta[rosa_2100] = 1;   // rosa, 33 años, salario 2100",
    "// rosa_2400: rosa, 33 años, salario 2400, despues del aumento",
    "printf(\"%d\\n\", (int) planta.count(rosa_2400));",
    "planta[rosa_2400] = 2;",
    "printf(\"%d\\n\", (int) planta.size());"
  ].join("\n");

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* unsigned long long: la cuenta va módulo 2^64. */
  var MOD = BigInt(2) ** BigInt(64);

  function horner(h, base, s) {
    var x = h;
    var i = 0;
    while (i < s.length) {
      x = (x * BigInt(base) + BigInt(s.charCodeAt(i))) % MOD;
      i = i + 1;
    }
    return x;
  }

  function hashNombre(p) { return horner(BigInt(0), 31, p.nombre); }
  function hashProducto(p) { return BigInt(p.edad) * BigInt(p.salario); }
  function hashTres(p) {
    var h = BigInt(p.salario);
    h = (h * BigInt(37) + BigInt(p.edad)) % MOD;
    return horner(h, 37, p.nombre);
  }
  function hashNombreEdad(p) { return horner(BigInt(p.edad), 37, p.nombre); }

  /* Parejas con el mismo valor hash, como "AC BD", o "ninguno". */
  function choques(f) {
    var res = [];
    var i = 0;
    while (i < GENTE.length) {
      var j = i + 1;
      while (j < GENTE.length) {
        if (f(GENTE[i]) === f(GENTE[j])) { res.push(GENTE[i].id + GENTE[j].id); }
        j = j + 1;
      }
      i = i + 1;
    }
    return res.length === 0 ? "ninguno" : res.join(" ");
  }

  /* El unordered_map de g++ guarda el hash de cada nodo y solo llama a la
     igualdad cuando los hash coinciden. */
  function contar(tabla, p, hash, igual) {
    var h = hash(p);
    return tabla.filter(function (e) { return e.h === h && igual(e.clave, p); }).length;
  }

  function asignar(tabla, p, v, hash, igual) {
    var h = hash(p);
    var hallada = tabla.filter(function (e) { return e.h === h && igual(e.clave, p); });
    if (hallada.length === 0) {
      tabla.push({ clave: p, h: h, valor: v });
    } else {
      hallada[0].valor = v;
    }
  }

  function misma(a, b) { return a.nombre === b.nombre && a.edad === b.edad; }

  function rosa(hash) {
    var r1 = { nombre: "rosa", edad: 33, salario: 2100 };
    var r2 = { nombre: "rosa", edad: 33, salario: 2400 };
    var t = [];
    asignar(t, r1, 1, hash, misma);
    var c = contar(t, r2, hash, misma);
    asignar(t, r2, 2, hash, misma);
    return { count: c, size: t.length };
  }

  function spec() {
    var lista = GENTE.map(function (p) {
      return p.id + ": " + p.nombre + " " + p.edad + " " + p.salario;
    }).join("\n");
    var mal = rosa(hashTres);
    var bien = rosa(hashNombreEdad);
    return {
      contenedor: "tarjetas",
      cierre: "Una función hash para una clave compuesta tiene que mezclar los campos que distinguen a una clave de otra, y solo esos: los que compara la igualdad. Si deja uno por fuera, como HashNombre con la edad y el salario, las respuestas salen bien pero las listas se alargan. Si mete uno que la igualdad no mira, dos claves iguales caen en cubetas distintas: count responde 0 y la misma clave entra dos veces. HashTres cuesta Θ(L) por el nombre, y buscar cuesta O(L) en promedio.",
      cartas: [
        { tipo: "respuesta", titulo: "Quién choca con quién",
          html: "<pre class=\"fragmento\">" + esc(HASHES) + "</pre><p>Cinco personas:</p><pre class=\"fragmento\">" + lista + "</pre><p>Con cada función, ¿qué parejas dan el mismo valor hash? Escriba cada pareja con sus dos letras en orden, como <code>AB</code>, o <code>ninguno</code>.</p>",
          campos: [
            { rotulo: "HashNombre:", esperado: choques(hashNombre), pista: "AB CD", ancho: "7rem" },
            { rotulo: "HashProducto:", esperado: choques(hashProducto), pista: "AB CD", ancho: "7rem" },
            { rotulo: "HashTres:", esperado: choques(hashTres), pista: "AB CD", ancho: "7rem" }
          ],
          bien: "Correcto. HashNombre solo ve el nombre: las dos lina chocan. HashProducto da 30 000 para A y B y 32 500 para C y D. HashTres da cinco valores distintos.",
          distractores: [
            { valores: [null, "ab", null], msg: "C y D también chocan: 25 · 1300 = 26 · 1250 = 32 500." },
            { valores: [null, "ab ac bc cd", null], msg: "A y B dan 30 000, pero C da 32 500: 25 · 1300." },
            { valores: ["ninguno", null, null], msg: "A y C se llaman lina: HashNombre no mira nada más, así que dan el mismo valor." },
            { valores: [null, null, "ac"], msg: "HashTres arranca con el salario y la edad, que son distintos para las dos lina." }
          ],
          otro: "Calcule edad · salario para las cinco y busque los nombres repetidos." },
        { tipo: "opciones", titulo: "La función para el unordered_map", columna: true, correcta: "tres",
          html: "<p>La igualdad de esta tabla compara los tres campos. ¿Qué función hash conviene?</p>",
          opciones: [
            { op: "nombre", texto: "<code>HashNombre</code>, porque los nombres casi no se repiten", msg: "Funciona, pero todas las personas con el mismo nombre caen en la misma cubeta. En una ciudad con miles de lina, esa lista se recorre entera." },
            { op: "tres", texto: "<code>HashTres</code>", msg: "Correcto: mezcla los tres campos que compara la igualdad, y cada uno mueve el resultado. Cuesta Θ(L)." },
            { op: "prod", texto: "<code>HashProducto</code>, porque es Θ(1)", msg: "Es rápida, pero edad · salario repite valores entre personas que no se parecen en nada, como A y B. Lo que ahorra en el cálculo lo pierde en listas largas." }
          ] },
        { tipo: "respuesta", titulo: "Dos claves iguales con hash distinto",
          html: "<pre class=\"fragmento\">" + esc(MISMA) + "</pre><p>¿Qué imprimen los dos <code>printf</code>?</p>",
          campos: [
            { rotulo: "count:", esperado: String(mal.count), ancho: "3rem" },
            { rotulo: "size:", esperado: String(mal.size), ancho: "3rem" }
          ],
          bien: "Correcto, y es lo que imprime g++. Para MismaPersona las dos rosa son la misma, pero HashTres mezcla el salario y les da valores distintos. count busca con el hash de rosa_2400, no encuentra nodo con ese hash y responde 0; la asignación inserta una segunda rosa.",
          distractores: [
            { valores: ["1", "1"], msg: "Eso pasaría si el hash solo usara el nombre y la edad. HashTres usa también el salario, que cambió." },
            { valores: ["0", "1"], msg: "Si count no la encuentra, la asignación tampoco: inserta un nodo nuevo." }
          ],
          otro: "Calcule si HashTres da lo mismo para las dos rosa. Si no, el unordered_map no las compara." },
        { tipo: "opciones", titulo: "El arreglo", columna: true, correcta: "quitar",
          html: "<p>¿Qué cambio deja <code>count = 1</code> y <code>size = 1</code>, sin cambiar lo que significa ser la misma persona?</p>",
          opciones: [
            { op: "igual", texto: "Que MismaPersona compare también el salario", msg: "Así el hash y la igualdad quedan de acuerdo, pero rosa con aumento pasa a ser otra persona: cambió lo que la tabla quiere decir." },
            { op: "m", texto: "Una tabla con más cubetas", msg: "Con más cubetas los dos valores hash siguen siendo distintos, y la tabla sigue sin comparar a las dos rosa." },
            { op: "quitar", texto: "Un hash que mezcle solo el nombre y la edad", msg: "Correcto: es lo que compara la igualdad. Con ese hash g++ imprime count = " + bien.count + " y size = " + bien.size + "." },
            { op: "map", texto: "Cambiar a un map con MismaPersona como comparador", msg: "El map necesita un orden estricto, un menor que, y MismaPersona responde si son iguales: no sirve como comparador." }
          ] },
        { tipo: "opciones", titulo: "Al revés", columna: true, correcta: "lento",
          html: "<p>La igualdad compara los tres campos y el hash es <code>HashNombre</code>, que solo mira el nombre. ¿Qué pasa?</p>",
          opciones: [
            { op: "malo", texto: "count puede responder 0 para una persona que está", msg: "Eso pasa cuando dos claves iguales dan hash distinto. Aquí dos claves iguales tienen el mismo nombre y el mismo hash." },
            { op: "lento", texto: "Las respuestas son correctas, pero las personas del mismo nombre comparten lista", msg: "Correcto: dos claves iguales tienen el mismo nombre y dan el mismo hash, así que nunca se separan. El costo es buscar en listas largas." },
            { op: "nada", texto: "Nada cambia: el hash solo elige la cubeta", msg: "Elige la cubeta, y por eso mismo importa: todas las lina van a la misma lista y buscar a una la recorre." }
          ] }
      ]
    };
  }

  return { gente: GENTE, hashNombre: hashNombre, hashProducto: hashProducto, hashTres: hashTres, hashNombreEdad: hashNombreEdad, choques: choques, rosa: rosa, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
