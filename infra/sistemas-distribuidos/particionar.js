if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Repartir claves entre nodos: los mil perfiles numerados de 0 a 999 en
   cuatro nodos, y lo que se mueve al agregar el quinto. Dos formas de
   asignar: el residuo de dividir por el numero de nodos y el anillo, donde
   cada clave va al primer nodo cuya posicion es mayor o igual que ella. */

var CLAVES = 1000;

var NODOS_ANTES = 4;
var NODOS_DESPUES = 5;

/* El anillo de 0 a 999: cada nodo cubre desde la posicion del anterior. */
var ANILLO_ANTES = [
  { nombre: "A", posicion: 249 },
  { nombre: "B", posicion: 499 },
  { nombre: "C", posicion: 749 },
  { nombre: "D", posicion: 999 }
];
var NUEVO = { nombre: "E", posicion: 874 };

/* ---------- las cuentas ---------- */

function claves() {
  var lista = [];
  for (var k = 0; k < CLAVES; k++) { lista.push(k); }
  return lista;
}

function nodoResiduo(clave, nodos) { return String.fromCharCode(65 + clave % nodos); }

function nodoAnillo(clave, anillo) {
  var orden = anillo.slice().sort(function (x, y) { return x.posicion - y.posicion; });
  for (var i = 0; i < orden.length; i++) {
    if (clave <= orden[i].posicion) { return orden[i].nombre; }
  }
  return orden[0].nombre;
}

function anilloDespues() { return ANILLO_ANTES.concat([NUEVO]); }

function movidasResiduo() {
  return claves().filter(function (k) {
    return nodoResiduo(k, NODOS_ANTES) !== nodoResiduo(k, NODOS_DESPUES);
  }).length;
}

function movidasAnillo() {
  var despues = anilloDespues();
  return claves().filter(function (k) {
    return nodoAnillo(k, ANILLO_ANTES) !== nodoAnillo(k, despues);
  }).length;
}

/* Cuantas claves quedan en cada nodo con una asignacion dada. */
function carga(asignar) {
  var cuenta = {};
  claves().forEach(function (k) {
    var n = asignar(k);
    cuenta[n] = (cuenta[n] || 0) + 1;
  });
  return cuenta;
}

/* Lo minimo que tiene que moverse: la parte que le toca al nodo nuevo. */
function minimoIdeal() { return CLAVES / NODOS_DESPUES; }

/* ---------- veredictos y textos ---------- */

function fmt(x, d) { return Motor.num(x, d); }

function explicarResiduo(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Se mueven " + fmt(real) + " de las " +
    fmt(CLAVES) + " claves, el " + fmt(real / CLAVES * 100) + " %. Una clave se queda solo si " +
    "su residuo entre 4 y entre 5 coincide, y eso pasa con 4 de cada 20 números: los que dejan " +
    "residuo 0, 1, 2 o 3 al dividir por 20. Agregar un nodo obliga a copiar por la red casi " +
    "todo lo que ya estaba repartido.";
}

function explicarAnillo(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Se mueven " + fmt(real) + ": las claves de 750 a " +
    NUEVO.posicion + ", que antes eran de D y ahora caen en E. Ningún otro nodo pierde ni gana " +
    "nada. Dejar los cinco parejos obligaría a mover " + fmt(minimoIdeal()) + ", la quinta " +
    "parte; el anillo mueve menos porque no empareja: E solo le quitó la mitad a D.";
}

var RAZONES_DESIGUAL = {
  correcta: "Es la salida que se usa. Cada máquina aparece en muchas posiciones del anillo, " +
    "y al llegar una nueva se lleva un poco de cada una en lugar de partir en dos el tramo de " +
    "una sola. Cassandra y DynamoDB trabajan así, con cientos de posiciones por máquina.",
  residuo: "El residuo reparte parejo, y ese no es el problema que hay que resolver: el costo " +
    "está en lo que se mueve al cambiar el número de nodos, que con el residuo es casi todo.",
  mitad: "Correría el problema de lugar. Mover las posiciones de A, B y C para emparejar los " +
    "tramos obliga a pasar claves entre ellos, y se vuelve a copiar por la red lo que el anillo " +
    "evitaba copiar.",
  nada: "Con E en 874, D y E quedan con 125 claves cada uno y A, B y C con 250. Esos tres " +
    "atienden el doble de solicitudes, y el grupo rinde lo que rinde su nodo más cargado."
};

var RAZONES_LLAVE = {
  correcta: "Es el problema. El reparto es tan parejo como lo sea la clave: si el 60 % de los " +
    "usuarios vive en Colombia, el nodo de Colombia recibe el 60 % de la carga aunque haya " +
    "cinco nodos. Por eso se reparte por un hash del identificador, que no tiene relación con " +
    "lo que hacen los usuarios.",
  rapido: "Calcular el país no cuesta nada; está en el perfil. El costo está en cuántos " +
    "usuarios caen en cada nodo.",
  consultas: "Es al revés: tener a los usuarios de un país juntos facilita esas consultas. " +
    "Lo que se paga es el desbalance.",
  replicas: "La replicación funciona igual con cualquier criterio de reparto. Lo que decide " +
    "el criterio es cuánta carga recibe cada nodo."
};

/* ---------- pintado y conexiones ---------- */

function filasCarga() {
  var r4 = carga(function (k) { return nodoResiduo(k, NODOS_ANTES); });
  var r5 = carga(function (k) { return nodoResiduo(k, NODOS_DESPUES); });
  var a4 = carga(function (k) { return nodoAnillo(k, ANILLO_ANTES); });
  var a5 = carga(function (k) { return nodoAnillo(k, anilloDespues()); });
  return ["A", "B", "C", "D", "E"].map(function (n) {
    return [n, r4[n] || 0, r5[n] || 0, a4[n] || 0, a5[n] || 0];
  });
}

function iniciar() {
  var vistoResiduo = false, vistoAnillo = false;

  function pintar() {
    document.getElementById("cuerpo-carga").innerHTML = filasCarga().map(function (f) {
      function celda(v, visto) {
        return visto ? "<td>" + fmt(v) + "</td>" : "<td class=\"pend\">?</td>";
      }
      return "<tr><td><b>" + f[0] + "</b></td><td>" + fmt(f[1]) + "</td>" +
        celda(f[2], vistoResiduo) + "<td>" + fmt(f[3]) + "</td>" + celda(f[4], vistoAnillo) +
        "</tr>";
    }).join("");
    Motor.pintarChips("chips-movidas", [
      { texto: "se mueven con el residuo",
        valor: vistoResiduo ? fmt(movidasResiduo()) : "?", cuenta: true },
      { texto: "se mueven con el anillo",
        valor: vistoAnillo ? fmt(movidasAnillo()) : "?", cuenta: true },
      { texto: "lo que le toca al nodo nuevo", valor: fmt(minimoIdeal()) }
    ]);
  }

  pintar();

  Motor.conectarPrediccion(
    { entrada: "pred-residuo", boton: "btn-residuo", veredicto: "ver-residuo" },
    movidasResiduo, explicarResiduo);
  document.getElementById("btn-residuo").addEventListener("click", function () {
    vistoResiduo = true;
    pintar();
  });

  Motor.conectarPrediccion(
    { entrada: "pred-anillo", boton: "btn-anillo", veredicto: "ver-anillo" },
    movidasAnillo, explicarAnillo);
  document.getElementById("btn-anillo").addEventListener("click", function () {
    vistoAnillo = true;
    pintar();
  });

  Motor.conectarOpciones("op-desigual", "ver-desigual", RAZONES_DESIGUAL);
  Motor.conectarOpciones("op-llave", "ver-llave", RAZONES_LLAVE);
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CLAVES: CLAVES, NODOS_ANTES: NODOS_ANTES, NODOS_DESPUES: NODOS_DESPUES,
    ANILLO_ANTES: ANILLO_ANTES, NUEVO: NUEVO,
    nodoResiduo: nodoResiduo, nodoAnillo: nodoAnillo, movidasResiduo: movidasResiduo,
    movidasAnillo: movidasAnillo, carga: carga, minimoIdeal: minimoIdeal, filasCarga: filasCarga,
    explicarResiduo: explicarResiduo, explicarAnillo: explicarAnillo,
    RAZONES_DESIGUAL: RAZONES_DESIGUAL, RAZONES_LLAVE: RAZONES_LLAVE
  };
}
