/* Ejercicio interactivo: intérprete y compilador. El error en la rama que
   casi nunca corre, el costo de interpretar medido en este equipo y los
   híbridos. Todo sale de las corridas guardadas en programas.js. */
var EJERCICIO = (function () {
  var P = typeof module !== "undefined" ? require("./programas.js") : Programas;
  var T = typeof module !== "undefined" ? require("./texto.js") : Texto;

  function veces() { return Math.round(P.tiempos.py / P.tiempos.c); }

  function spec() {
    var err = P.ramaPy.con20;
    return {
      contenedor: "tarjetas",
      cierre: "<p>El intérprete traduce en cada ejecución y no deja nada en disco; el compilador traduce una vez y deja un ejecutable que corre sin el fuente ni el compilador. De ahí sale cuándo aparecen los errores: el compilador revisa todo el programa antes de correrlo, y el intérprete encuentra el error solo cuando llega a la línea. También sale el costo: cada vuelta de un ciclo interpretado revisa tipos y busca métodos que en C ya quedaron resueltos. Python y Java son híbridos: compilan a un código intermedio que después se interpreta.</p>",
      cartas: [
        { tipo: "opciones", titulo: "La rama que casi nunca corre", columna: true, correcta: "corre",
          html: T.codigo(P.ramaPy.codigo) + "<p>En la última línea dice <code>sald0</code>, con un cero, en vez de <code>saldo</code>. Se corre con <code>python3</code> y se escribe 150. ¿Qué pasa?</p>",
          opciones: [
            { op: "antes", texto: "Python se niega a correr el programa por el nombre mal escrito.", msg: "El intérprete no revisa el programa entero antes de empezar: traduce y ejecuta a medida que avanza, y con 150 nunca llega a la última línea." },
            { op: "corre", texto: "Imprime saldo al dia: 150 y termina sin error.", msg: "Correcto. Con 150 se toma la primera rama y la línea mala nunca se ejecuta. El error aparece el día en que alguien escribe un saldo negativo: con −20, Python responde " + err[err.length - 1] + "." },
            { op: "ambos", texto: "Imprime el saldo y después avisa del error.", msg: "Python no mira la rama que no toma. Con 150 no hay ningún aviso: el error queda escondido hasta que un saldo negativo lo despierte." }
          ] },
        { tipo: "opciones", titulo: "El mismo error en C", columna: true, correcta: "compilar",
          html: T.codigo(P.ramaC.codigo) + "<p>El mismo programa en C, con el mismo <code>sald0</code>. ¿Cuándo aparece el error?</p>",
          opciones: [
            { op: "negativo", texto: "Solo si al correrlo se escribe un saldo negativo.", msg: "En C no se llega a correr: el compilador revisa todas las ramas, se tomen o no." },
            { op: "compilar", texto: "Al compilar, antes de correr, aunque nunca se escriba un saldo negativo.", msg: "Correcto. gcc responde " + P.ramaC.error[1].replace(/^rama\.c:\d+:\d+: /, "") + ", y no produce ejecutable. El compilador traduce el programa entero de una vez, y el error de la rama rara se ve el primer día." },
            { op: "nunca", texto: "Nunca: C no revisa los nombres de las variables.", msg: "Los revisa: cada nombre tiene que estar declarado antes de usarse, y sald0 no lo está." }
          ] },
        { tipo: "respuesta", titulo: "Cuánto cuesta interpretar",
          html: "<p>Los dos programas cuentan los múltiplos de 7 entre 0 y 39 999 999, y los dos imprimen " + P.multiplosC.salida + ".</p>" + T.codigo(P.multiplosC.codigo) + T.codigo(P.multiplosPy.codigo) +
                T.tabla(["Versión", "Corridas", "La más rápida"], [
                  ["C, <code>gcc -O0</code>", P.tiempos.corridasC.map(function (x) { return T.num(x, 3) + " s"; }).join(", "), T.num(P.tiempos.c, 3) + " s"],
                  ["Python 3", P.tiempos.corridasPy.map(function (x) { return T.num(x, 3) + " s"; }).join(", "), T.num(P.tiempos.py, 3) + " s"]]) +
                "<p>Tomando la corrida más rápida de cada uno, ¿cuántas veces más tarda Python? Redondee al entero.</p>",
          campos: [{ rotulo: "veces:", esperado: String(veces()), ancho: "4rem" }],
          bien: "Correcto. " + T.num(P.tiempos.py, 3) + " / " + T.num(P.tiempos.c, 3) + " da " + T.num(P.tiempos.py / P.tiempos.c, 1) + ". En cada vuelta Python revisa el tipo de i, busca la operación %, construye objetos para los resultados y compara; el ejecutable de C hace unas pocas instrucciones del procesador. La cifra depende del equipo y del ciclo, y el orden de magnitud se mantiene.",
          distractores: [
            { valores: ["140"], msg: "Ese es otro ciclo en otro equipo. Divida los dos tiempos de esta tabla." },
            { valores: ["4"], msg: "Divida Python entre C, no reste: " + T.num(P.tiempos.py, 3) + " entre " + T.num(P.tiempos.c, 3) + "." }
          ],
          otro: "Divida el tiempo más rápido de Python entre el más rápido de C." },
        { tipo: "opciones", titulo: "Lo que hay que tener instalado", columna: true, correcta: "python",
          html: "<p>Se le pasan a un compañero, que tiene Linux en un equipo x86-64 como el de la tabla, dos archivos: el ejecutable <code>multiplos</code> y <code>multiplos.py</code>. ¿Qué necesita instalado para correr los dos?</p>",
          opciones: [
            { op: "gcc", texto: "gcc para el ejecutable y Python 3 para el .py.", msg: "El ejecutable ya está traducido: gcc solo hace falta para producirlo, no para correrlo." },
            { op: "python", texto: "Python 3 para el .py; el ejecutable corre sin nada más.", msg: "Correcto. El compilador dejó la traducción hecha y el fuente ya no hace falta. El .py, en cambio, se traduce cada vez que se corre, así que el intérprete tiene que estar en la máquina." },
            { op: "nada", texto: "Nada: los dos son programas y corren solos.", msg: "El .py es texto. Sin el intérprete, nadie lo traduce." },
            { op: "fuente", texto: "El archivo multiplos.c, además de los otros dos.", msg: "El ejecutable no necesita el fuente para correr. Lo necesitaría para volver a compilarlo, por ejemplo en un procesador distinto." }
          ] },
        { tipo: "opciones", titulo: "Ni tan puro lo uno ni lo otro", columna: true, correcta: "intermedio",
          html: "<p>Después de correr un programa de Python que importa un módulo propio aparece una carpeta <code>__pycache__</code> con un archivo <code>.pyc</code>. ¿Qué guarda?</p>",
          opciones: [
            { op: "ejecutable", texto: "El ejecutable del módulo, en código de máquina.", msg: "No es código de máquina: el procesador no puede correrlo directamente. Lo lee el intérprete." },
            { op: "intermedio", texto: "El módulo compilado a un código intermedio, que el intérprete lee en la siguiente ejecución sin volver a traducir el fuente.", msg: "Correcto. Python compila cada módulo a ese código intermedio y después lo interpreta. Java hace lo mismo con los .class de javac y la máquina virtual. Por eso los dos son híbridos." },
            { op: "copia", texto: "Una copia de seguridad del fuente.", msg: "El .pyc no es texto ni copia del fuente: es el resultado de traducirlo, guardado para no repetir el trabajo." },
            { op: "resultados", texto: "Los resultados de la última ejecución, para devolverlos más rápido.", msg: "No guarda resultados: el programa vuelve a calcular todo en cada ejecución. Lo que se ahorra es la traducción." }
          ] }
      ]
    };
  }

  return { veces: veces, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
