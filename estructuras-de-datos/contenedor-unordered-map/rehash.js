/* Ejercicio interactivo: cuándo cambia bucket_count() de un unordered_map y a qué valor. */
var EJERCICIO = (function () {
  /* Medido con g++ 15, insertando claves distintas de una en una:
     al llegar a n claves, bucket_count() pasa a m. Antes de la primera vale 1. */
  var CAMBIOS = [
    { n: 1, m: 13 }, { n: 14, m: 29 }, { n: 30, m: 59 }, { n: 60, m: 127 },
    { n: 128, m: 257 }, { n: 258, m: 541 }, { n: 542, m: 1109 }
  ];
  var CLAVES = [40, 53, 66, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110];

  var CODIGO = [
    "#include <cstdio>",
    "#include <unordered_map>",
    "using std::unordered_map;",
    "",
    "int main() {",
    "  int claves[14] = {40, 53, 66, 100, 101, 102, 103,",
    "                    104, 105, 106, 107, 108, 109, 110};",
    "  unordered_map<int, int> u;",
    "  int i = 0;",
    "  while (i < 14) {",
    "    u[claves[i]] = 1;",
    "    printf(\"n = %d, m = %d, bucket(40) = %d, bucket(53) = %d, bucket(66) = %d\\n\",",
    "           (int) u.size(), (int) u.bucket_count(), (int) u.bucket(40),",
    "           (int) u.bucket(53), (int) u.bucket(66));",
    "    i = i + 1;",
    "  }",
    "  return 0;",
    "}"
  ].join("\n");

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* bucket_count() con n claves distintas. */
  function cubetas(n) {
    var m = 1;
    CAMBIOS.forEach(function (c) { if (c.n <= n) { m = c.m; } });
    return m;
  }

  /* Cambios de bucket_count() al insertar de 1 a n claves distintas. */
  function cambiosHasta(n) {
    return CAMBIOS.filter(function (c) { return c.n <= n; });
  }

  /* Cada rehash vuelve a colgar las claves que ya estaban: n - 1. */
  function recolgadas(n) {
    var total = 0;
    cambiosHasta(n).forEach(function (c) { total = total + (c.n - 1); });
    return total;
  }

  /* Filas del programa: n, m y las cubetas de 40, 53 y 66 después de cada inserción. */
  function traza() {
    var filas = [];
    var i = 0;
    while (i < CLAVES.length) {
      var n = i + 1;
      var m = cubetas(n);
      filas.push({ n: n, m: m, b40: 40 % m, b53: 53 % m, b66: 66 % m });
      i = i + 1;
    }
    return filas;
  }

  function spec() {
    var t = traza();
    var antes = t[2];
    var primerCambio = CAMBIOS[1];
    var despues = t[primerCambio.n - 1];
    var mil = cambiosHasta(1000);
    var ultimo = CAMBIOS[CAMBIOS.length - 1];
    return {
      contenedor: "tarjetas",
      cierre: "El unordered_map de g++ mantiene α = n/m ≤ 1. Cuando una clave nueva dejaría α por encima de 1, la tabla pasa al primo siguiente de su lista, cerca del doble, vuelve a colgar las claves que tenía y después cuelga la nueva. Esa inserción cuesta Θ(n); las demás, O(1) en promedio. Repartido entre todas, el trabajo de los rehash suma cerca de una clave por inserción. Ni una clave repetida ni un erase cambian bucket_count().",
      cartas: [
        { tipo: "respuesta", titulo: "Las tres primeras claves",
          html: "<pre class=\"fragmento\">" + esc(CODIGO) + "</pre><p>Después de insertar 40, 53 y 66, ¿cuánto vale <code>m</code>, en qué cubeta está cada una y cuántas claves más pueden entrar sin que <code>m</code> cambie?</p>",
          campos: [
            { rotulo: "m:", esperado: String(antes.m), ancho: "3rem" },
            { rotulo: "cubetas de 40, 53, 66:", esperado: [antes.b40, antes.b53, antes.b66].join(" "), pista: "a b c", ancho: "6rem" },
            { rotulo: "caben:", esperado: String(antes.m - 3), ancho: "3rem" }
          ],
          bien: "Correcto: las tres dan residuo 1 entre 13 y comparten la cubeta 1. Con 13 claves α = 13/13 = 1, que todavía no pasa de 1: caben 10 más.",
          distractores: [
            { valores: [null, null, "9"], msg: "La tabla crece cuando α pasaría de 1, no cuando llega a 1. Con 13 claves en 13 cubetas no crece." },
            { valores: ["1", null, null], msg: "La tabla vacía tiene 1 cubeta, pero la primera inserción la deja en 13." },
            { valores: [null, "40 53 66", null], msg: "Esas son las claves. La cubeta es k mod 13." }
          ],
          otro: "Calcule k mod 13 para cada clave y cuente hasta n = 13." },
        { tipo: "respuesta", titulo: "El primer rehash",
          html: "<p>¿Con cuántas claves cambia <code>m</code> por primera vez después de las 13 cubetas, y a qué valor?</p>",
          campos: [
            { rotulo: "n:", esperado: String(primerCambio.n), ancho: "3rem" },
            { rotulo: "m nuevo:", esperado: String(primerCambio.m), ancho: "4rem" }
          ],
          bien: "Correcto. El 110 es la clave 14: dejaría α = 14/13 > 1, así que la tabla pasa a 29 cubetas, el primo de su lista que sigue a 13, y queda α = 14/29 ≈ 0,48.",
          distractores: [
            { valores: [null, "26"], msg: "26 es el doble exacto. g++ salta a un número primo: 29." },
            { valores: [null, "14"], msg: "La tabla no crece de a una cubeta: crece a cerca del doble, para que el rehash no se repita en la inserción siguiente." },
            { valores: ["13", null], msg: "Con 13 claves α = 1, que no pasa de 1. El cambio llega con la siguiente." }
          ],
          otro: "Busque la primera n con n/13 > 1. El nuevo m es un primo cercano al doble de 13." },
        { tipo: "respuesta", titulo: "Las cubetas después",
          html: "<p>Con las 29 cubetas nuevas, ¿en qué cubeta queda cada una de las tres primeras claves?</p>",
          campos: [{ rotulo: "40, 53, 66:", esperado: [despues.b40, despues.b53, despues.b66].join(" "), pista: "a b c", ancho: "7rem" }],
          bien: "Correcto: 40 mod 29 = 11, 53 mod 29 = 24 y 66 mod 29 = 8. La lista de tres de la cubeta 1 se deshizo: cada una quedó sola.",
          distractores: [
            { valores: ["1 1 1"], msg: "El rehash recalcula la cubeta de todas las claves con el m nuevo: ahora es k mod 29." },
            { valores: ["11 24 37"], msg: "37 no es una cubeta válida con m = 29. 66 − 58 = 8." }
          ],
          otro: "Calcule k mod 29 para 40, 53 y 66." },
        { tipo: "opciones", titulo: "Una clave repetida", columna: true, correcta: "igual",
          html: "<p>Una tabla tiene 13 claves y 13 cubetas. Se ejecuta <code>u[100] = 5;</code> y el 100 ya estaba. ¿Qué pasa con <code>bucket_count()</code>?</p>",
          opciones: [
            { op: "crece", texto: "Pasa a 29, porque es la inserción número 14", msg: "Lo que cuenta es n, el número de claves distintas. Cambiar el valor del 100 no agrega ninguna." },
            { op: "igual", texto: "Sigue en 13", msg: "Correcto: el 100 ya estaba, así que no entra un nodo nuevo; n sigue en 13 y α en 1. Es lo que imprime g++." },
            { op: "doble", texto: "Pasa a 26", msg: "Ni crece, ni crecería a 26: g++ usa primos." }
          ] },
        { tipo: "respuesta", titulo: "Mil claves",
          html: "<p>Se insertan mil claves distintas en un <code>unordered_map</code> vacío. Contando el paso de 1 a 13 cubetas, ¿cuántas veces cambia <code>bucket_count()</code> y con qué valor termina?</p>",
          campos: [
            { rotulo: "cambios:", esperado: String(mil.length), ancho: "3rem" },
            { rotulo: "m final:", esperado: String(mil[mil.length - 1].m), ancho: "5rem" }
          ],
          bien: "Correcto: 1 → 13 → 29 → 59 → 127 → 257 → 541 → 1109. El último cambio llega con la clave 542; de ahí a mil, α no pasa de 1.",
          distractores: [
            { valores: ["6", null], msg: "Le falta el primer cambio, de 1 a 13 cubetas, con la primera clave." },
            { valores: [null, "1000"], msg: "m es un primo de la lista de g++, no el número de claves." },
            { valores: [null, "1024"], msg: "g++ no usa potencias de 2: sus tamaños son primos." }
          ],
          otro: "Siga la secuencia 13, 29, 59, 127, ...: cada valor sirve hasta que n lo pasa." },
        { tipo: "respuesta", titulo: "Lo que pagan los rehash",
          html: "<p>Cada rehash vuelve a colgar todas las claves que ya estaban. En la inserción de la clave 542, ¿cuántas cuelga de nuevo? Y sumando todos los rehash de las mil inserciones, ¿cuántas veces se vuelve a colgar una clave?</p>",
          campos: [
            { rotulo: "clave 542:", esperado: String(ultimo.n - 1), ancho: "4rem" },
            { rotulo: "total:", esperado: String(recolgadas(1000)), ancho: "5rem" }
          ],
          bien: "Correcto: 0 + 13 + 29 + 59 + 127 + 257 + 541 = 1026. Las mil inserciones vuelven a colgar 1026 claves en total, algo más de una por inserción. Por eso insertar sigue costando O(1) en promedio, aunque la inserción 542 sola cueste Θ(n).",
          distractores: [
            { valores: ["542", null], msg: "El rehash se hace antes de colgar la clave nueva: mueve las 541 que había." },
            { valores: [null, "1000"], msg: "No todas las inserciones hacen rehash. Sume solo las claves que había en cada cambio." }
          ],
          otro: "En cada cambio, la tabla tenía n − 1 claves. Súmelas para los siete cambios." },
        { tipo: "opciones", titulo: "Borrar no achica", columna: true, correcta: "queda",
          html: "<p>Se insertan las claves 0 a 599 y después se borran con <code>erase</code> las claves 0 a 589. Quedan 10. ¿Cuánto vale <code>bucket_count()</code>?</p>",
          opciones: [
            { op: "trece", texto: "13, porque con 10 claves basta", msg: "Con 10 claves bastarían 13 cubetas, pero el unordered_map no se encoge solo al borrar." },
            { op: "medio", texto: "541, el primo anterior", msg: "La tabla solo crece. g++ deja las 1109 cubetas aunque casi todas queden vacías." },
            { op: "queda", texto: "1109, el mismo de antes de borrar", msg: "Correcto: erase desenlaza nodos pero no reduce las cubetas. α queda en 10/1109 ≈ 0,009." }
          ] }
      ]
    };
  }

  return { cambios: CAMBIOS, claves: CLAVES, cubetas: cubetas, cambiosHasta: cambiosHasta, recolgadas: recolgadas, traza: traza, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
