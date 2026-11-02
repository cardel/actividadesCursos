if (typeof Motor === "undefined") { var Motor = require("./motor.js"); }

/* Escalar a lo alto o a lo ancho: la cuenta de memoria de la maquina grande
   contra el grupo de maquinas comunes, la ley de Amdahl aplicada a maquinas
   y el tamano de un grupo que decide por consenso. */

var VERTICAL = { memoriaTb: 1 };
var HORIZONTAL = { maquinas: 10, memoriaGb: 128 };

var GB_POR_TB = 1024;

/* El servicio del segundo apartado. */
var P = 0.95;
var MAQUINAS = [1, 2, 4, 10, 100];

/* Los dos tamanos de grupo que se muestran en la tabla del consenso. */
var GRUPOS = [3, 5, 7, 9];

/* ---------- las cuentas ---------- */

function memoriaDelGrupo() { return HORIZONTAL.maquinas * HORIZONTAL.memoriaGb; }

/* Ley de Amdahl. Con n infinito el segundo termino desaparece. */
function amdahl(p, n) { return 1 / ((1 - p) + p / n); }

function techoAmdahl(p) { return 1 / (1 - p); }

function eficiencia(p, n) { return amdahl(p, n) / n; }

/* Con 2f+1 nodos se toleran f caidos. */
function nodosParaTolerar(f) { return 2 * f + 1; }

function mayoria(nodos) { return Math.floor(nodos / 2) + 1; }

function toleraCaidas(nodos) { return nodos - mayoria(nodos); }

/* ---------- veredictos y textos ---------- */

function fmt(x, d) { return Motor.num(x, d); }

function explicarRam(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Son " + fmt(real) + " GB, es decir " +
    fmt(real / GB_POR_TB, 2) + " TB: más memoria que la máquina de " + VERTICAL.memoriaTb +
    " TB y por menos dinero. Lo que no viene incluido es el software que reparta el trabajo " +
    "entre las diez, y ese es el precio real de la escala horizontal.";
}

function explicarAmdahl(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Da " + fmt(real, 2) + " veces: con p = " +
    fmt(P, 2) + " y n = 10, el denominador es " + fmt(1 - P, 2) + " + " + fmt(P / 10, 3) +
    " = " + fmt((1 - P) + P / 10, 3) + ". Diez máquinas rinden como " + fmt(real, 1) +
    ", y la eficiencia cae a " + fmt(eficiencia(P, 10) * 100, 0) + " %.";
}

function explicarTecho(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "El techo es " + fmt(real) + " veces, que es " +
    "1 / (1 − p) con p = " + fmt(P, 2) + ". El 5 % que no se reparte manda: por muchas " +
    "máquinas que se agreguen, ese pedazo sigue costando lo mismo. Pasar de 10 a 100 máquinas " +
    "lleva de " + fmt(amdahl(P, 10), 1) + " a " + fmt(amdahl(P, 100), 1) + " veces.";
}

function explicarConsenso(bien, real) {
  return (bien ? "Correcto. " : "No. ") + "Hacen falta " + real + " nodos: con f = 2, " +
    "2f + 1 = " + real + ". La mayoría de cinco es tres, y tres siguen en pie cuando dos " +
    "caen. Con cuatro nodos la mayoría es tres y dos caídas dejan solo dos vivos, así que el " +
    "grupo deja de poder decidir.";
}

var RAZONES_VERTICAL = {
  correcta: "Es la razón. En una sola máquina el programa ve una memoria y un reloj: no hay " +
    "que partir los datos, ni replicarlos, ni acordar quién manda. Por eso las bases " +
    "relacionales y los mainframes bancarios escalan a lo alto primero, y por eso Stack " +
    "Overflow sostiene millones de usuarios al día con menos de veinte servidores.",
  rapido: "No siempre. Responde más rápido mientras la carga le quepa, y ahí está el problema: " +
    "cuando no cabe, no hay máquina siguiente que comprar. El techo físico es lo que obliga a " +
    "cambiar de estrategia.",
  seguro: "Es al contrario, y tiene nombre: punto único de fallo. Un servidor único concentra " +
    "todo el servicio en una pieza, y cuando cae no queda nada respondiendo. La escala " +
    "horizontal reparte ese riesgo, pero solo si ningún nodo es imprescindible.",
  moda: "PostgreSQL y Oracle sí tienen replicación y particionamiento; lo que pasa es que " +
    "escalan vertical antes que horizontal, porque su modelo de transacciones supone una sola " +
    "fuente de verdad. Es una preferencia de diseño, no una incapacidad."
};

var RAZONES_MECANISMO = {
  correcta: "Es el mecanismo. Los perfiles no caben en un nodo, así que hay que partirlos: " +
    "cada nodo es dueño de un rango de identificadores y la consulta por identificador va a " +
    "un solo nodo, con una ida por red. Reparte volumen y carga a la vez.",
  replica: "La replicación no resuelve el volumen: si el mismo perfil está en todos los nodos, " +
    "cada nodo necesita espacio para los treinta millones, que es justo lo que no hay. Sirve " +
    "para tolerar fallos y para leer cerca del usuario, encima de un esquema particionado.",
  lider: "La elección de líder decide quién ordena las escrituras cuando hay varias réplicas " +
    "del mismo dato. No cambia cuántos datos caben: el líder tendría el mismo problema de " +
    "espacio.",
  consenso: "El consenso sirve para acordar un valor entre nodos, y cobra al menos dos rondas " +
    "de red por decisión. Usarlo en cada lectura de perfil haría lento lo que ahora cuesta una " +
    "sola ida, y seguiría sin resolver dónde guardar los treinta millones."
};

/* ---------- pintado y conexiones ---------- */

function filasAmdahl() {
  return MAQUINAS.map(function (n) {
    return [fmt(n), fmt(amdahl(P, n), 2) + "×", fmt(eficiencia(P, n) * 100, 0) + " %"];
  });
}

function filasConsenso() {
  return GRUPOS.map(function (n) {
    return [fmt(n), fmt(mayoria(n)), fmt(toleraCaidas(n))];
  });
}

function iniciar() {
  var destapado = false;

  function pintarAmdahl() {
    document.getElementById("cuerpo-amdahl").innerHTML = filasAmdahl().map(function (f) {
      var resto = destapado
        ? "<td>" + f[1] + "</td><td>" + f[2] + "</td>"
        : "<td class=\"pend\">?</td><td class=\"pend\">?</td>";
      return "<tr><td>" + f[0] + "</td>" + resto + "</tr>";
    }).join("");
  }

  function destapar() {
    destapado = true;
    pintarAmdahl();
    document.getElementById("nota-amdahl").hidden = false;
  }

  function pintarConsenso() {
    document.getElementById("cuerpo-consenso").innerHTML = filasConsenso().map(function (f) {
      return "<tr><td>" + f[0] + "</td><td>" + f[1] + "</td><td>" + f[2] + "</td></tr>";
    }).join("");
  }

  function pintarFichas() {
    document.getElementById("fichas-sharding").innerHTML =
      "<span class=\"rotulo\">Sharding</span>" +
      ["N1: claves A–H", "N2: claves I–P", "N3: claves Q–Z"].map(function (t) {
        return "<span class=\"ficha\">" + t + "</span>";
      }).join("<span class=\"flecha\">·</span>");
    document.getElementById("fichas-replicacion").innerHTML =
      "<span class=\"rotulo\">Replicación</span>" +
      ["N1: dato x", "N2: dato x", "N3: dato x"].map(function (t) {
        return "<span class=\"ficha\">" + t + "</span>";
      }).join("<span class=\"flecha\">·</span>");
  }

  pintarAmdahl();
  pintarConsenso();
  pintarFichas();

  Motor.conectarPrediccion(
    { entrada: "pred-ram", boton: "btn-ram", veredicto: "ver-ram" },
    memoriaDelGrupo, explicarRam);

  Motor.conectarPrediccion(
    { entrada: "pred-amdahl", boton: "btn-amdahl", veredicto: "ver-amdahl" },
    function () { return amdahl(P, 10); }, explicarAmdahl);
  document.getElementById("btn-amdahl").addEventListener("click", destapar);

  Motor.conectarPrediccion(
    { entrada: "pred-techo", boton: "btn-techo", veredicto: "ver-techo" },
    function () { return techoAmdahl(P); }, explicarTecho);
  document.getElementById("btn-techo").addEventListener("click", destapar);

  Motor.conectarPrediccion(
    { entrada: "pred-consenso", boton: "btn-consenso", veredicto: "ver-consenso" },
    function () { return nodosParaTolerar(2); }, explicarConsenso);

  Motor.conectarOpciones("op-vertical", "ver-vertical", RAZONES_VERTICAL);
  Motor.conectarOpciones("op-mecanismo", "ver-mecanismo", RAZONES_MECANISMO);
}

if (typeof document !== "undefined") { iniciar(); }

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    VERTICAL: VERTICAL, HORIZONTAL: HORIZONTAL, P: P, MAQUINAS: MAQUINAS, GRUPOS: GRUPOS,
    memoriaDelGrupo: memoriaDelGrupo, amdahl: amdahl, techoAmdahl: techoAmdahl,
    eficiencia: eficiencia, nodosParaTolerar: nodosParaTolerar, mayoria: mayoria,
    toleraCaidas: toleraCaidas, filasAmdahl: filasAmdahl, filasConsenso: filasConsenso,
    explicarRam: explicarRam, explicarAmdahl: explicarAmdahl, explicarTecho: explicarTecho,
    explicarConsenso: explicarConsenso,
    RAZONES_VERTICAL: RAZONES_VERTICAL, RAZONES_MECANISMO: RAZONES_MECANISMO
  };
}
