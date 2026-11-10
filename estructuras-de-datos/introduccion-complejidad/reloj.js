/* Ejercicio interactivo: el reloj no mide el algoritmo. Los tiempos se
   midieron con el time de bash sobre multiplos.c en un servidor Linux de
   cuatro núcleos; el conteo T(m) sale de la simulación y coincide con el
   programa instrumentado. */
var EJERCICIO = (function () {
  var MULTIPLOS = [
    "long multiplos(long m) {",
    "    long i = 0;",
    "    long cuenta = 0;",
    "    while (i < m) {",
    "        if (i % 7 == 0) {",
    "            cuenta = cuenta + 1;",
    "        }",
    "        i = i + 1;",
    "    }",
    "    return cuenta;",
    "}"
  ];

  var POR_TAMANO = [
    { m: "10⁷", s: "0,032" },
    { m: "10⁸", s: "0,255" },
    { m: "10⁹", s: "2,358" }
  ];
  var CORRIDAS = ["2,486", "2,401", "2,512"];
  var CON_O2 = "0,646";

  /* T(m) = 2 + (m + 1) + m + k + m + 1, con k los múltiplos de 7 en [0, m). */
  function T(m) {
    var i = 0, t = 2, k = 0;
    while (i < m) {
      t = t + 2;
      if (i % 7 === 0) { t = t + 1; k = k + 1; }
      t = t + 1;
      i = i + 1;
    }
    return { T: t + 2, k: k };
  }

  function escapar(x) { return x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function codigo(lineas) { return "<pre class=\"fragmento\">" + escapar(lineas.join("\n")) + "</pre>"; }

  function tabla(cab, filas) {
    return "<div class=\"envoltura-tabla\"><table><thead><tr>" + cab.map(function (c) { return "<th>" + c + "</th>"; }).join("") +
      "</tr></thead><tbody>" + filas.map(function (f) { return "<tr>" + f.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; }).join("") +
      "</tbody></table></div>";
  }

  function spec() {
    var t70 = T(70);
    return {
      contenedor: "tarjetas",
      cierre: "<p>El tiempo crece con m, y en eso el reloj acierta. Pero cambia entre corridas iguales, cambia con la bandera de compilación y cambia con la máquina, y ninguna de esas cosas es el algoritmo. El conteo de instrucciones solo depende del código y de la entrada: T(m) = 3m + k + 4 da lo mismo en cualquier computador, en cualquier corrida y con cualquier bandera.</p>",
      cartas: [
        { tipo: "opciones", titulo: "Lo que el reloj sí dice", columna: true, correcta: "diez",
          html: codigo(MULTIPLOS) + "<p>El programa cuenta los múltiplos de 7 menores que m. Se midió con <code>time</code>:</p>" +
                tabla(["m", "Tiempo"], [[POR_TAMANO[0].m, POR_TAMANO[0].s + " s"], [POR_TAMANO[1].m, POR_TAMANO[1].s + " s"], [POR_TAMANO[2].m, "?"]]) +
                "<p>¿Cuánto debería tardar con m = 10⁹?</p>",
          opciones: [
            { op: "cien", texto: "Unos 25 s, cien veces más.", msg: "Cien veces más sería un costo que crece con el cuadrado de m. Aquí hay un solo ciclo de m vueltas." },
            { op: "igual", texto: "Lo mismo, 0,255 s: el programa es el mismo.", msg: "El código es el mismo, la entrada no: con 10⁹ el ciclo da mil millones de vueltas." }
          ,
            { op: "medio", texto: "Unos 0,5 s, el doble que con 10⁸.", msg: "De 10⁷ a 10⁸ el tiempo se multiplicó por cerca de ocho, no por dos. El ciclo hace diez veces más vueltas cada vez." },
            { op: "diez", texto: "Unos 2,5 s, diez veces lo de 10⁸.", msg: "Correcto. Se midieron " + POR_TAMANO[2].s + " s. Multiplicar m por diez multiplica las vueltas por diez, y el tiempo lo sigue de cerca." }] },
        { tipo: "opciones", titulo: "Tres corridas iguales", columna: true, correcta: "sistema",
          html: "<p>El mismo programa, en la misma máquina, con m = 10⁹, tres veces seguidas:</p>" +
                tabla(["Corrida", "Tiempo"], CORRIDAS.map(function (c, i) { return [String(i + 1), c + " s"]; })) +
                "<p>¿De dónde sale la diferencia?</p>",
          opciones: [
            { op: "sistema", texto: "De la máquina: otros procesos compitiendo por el procesador y el estado de la caché.", msg: "Correcto. El sistema operativo reparte el procesador entre muchos programas, y la caché no está igual en cada corrida. Nada de eso depende del algoritmo." },
            { op: "time", texto: "De un error de time, que mide mal.", msg: "time mide bien lo que pasó: cuánto tardó esa corrida. Lo que pasa es que cada corrida tarda distinto por razones que no son del programa." }
          ,
            { op: "trabajo", texto: "El programa hizo un trabajo distinto en cada corrida.", msg: "Las tres corridas ejecutan exactamente las mismas instrucciones: el código y la entrada no cambiaron, y la respuesta fue la misma, 142857143." }] },
        { tipo: "opciones", titulo: "Compilar con -O2", columna: true, correcta: "traduccion",
          html: "<p>Se compila el mismo archivo con <code>gcc -O2</code> y se corre con m = 10⁹: tarda " + CON_O2 + " s, cerca de la cuarta parte. ¿Qué cambió?</p>",
          opciones: [
            { op: "algoritmo", texto: "El algoritmo: -O2 lo reemplaza por uno mejor.", msg: "El archivo fuente no cambió ni una letra, y el ciclo sigue dando m vueltas. -O2 cambia cómo se traduce ese ciclo a instrucciones de máquina." },
            { op: "traduccion", texto: "La traducción a lenguaje de máquina; el código y su conteo son los mismos.", msg: "Correcto. El compilador optimiza la traducción, y el ejecutable corre más rápido en esta máquina. El T(m) del código, que es lo que se analiza, no cambia." },
            { op: "t", texto: "El conteo: T(m) baja a la cuarta parte.", msg: "T(m) se cuenta sobre el código fuente, que es el mismo. Si el número dependiera de la bandera de compilación, no serviría para comparar algoritmos." }
          ] },
        { tipo: "respuesta", titulo: "El número que no cambia",
          html: "<p>Cada instrucción simple cuenta 1: las dos inicializaciones, cada evaluación de <code>i &lt; m</code>, cada <code>if</code>, cada <code>cuenta = cuenta + 1</code>, cada incremento y el <code>return</code>. Con m = 70, ¿cuántas veces entra al <code>if</code> y cuántas instrucciones se ejecutan en total?</p>",
          campos: [
            { rotulo: "entra al if:", esperado: String(t70.k), ancho: "3rem" },
            { rotulo: "instrucciones:", esperado: String(t70.T), ancho: "4rem" }
          ],
          bien: "Correcto. i toma los valores de 0 a 69, y los múltiplos de 7 son 0, 7, …, 63: diez. T = 2 + 71 + 70 + 10 + 70 + 1 = 224, que es 3m + k + 4. Este número sale igual en cualquier máquina.",
          distractores: [
            { valores: ["10", "223"], msg: "Falta la evaluación de i < m que da falso, con i = 70: la condición se evalúa 71 veces." },
            { valores: ["9", null], msg: "El 0 también es múltiplo de 7: 0 % 7 es 0, y la primera vuelta entra al if." },
            { valores: ["10", "214"], msg: "Faltan las diez ejecuciones de cuenta = cuenta + 1: cada vez que se entra al if también cuenta esa instrucción." },
            { valores: ["10", "154"], msg: "Falta contar el if en cada vuelta: la pregunta i % 7 == 0 se hace 70 veces, entre o no entre." }
          ],
          otro: "Cuente por línea: cuántas veces se evalúa la condición del while, cuántas el if, cuántas se entra y cuántas se incrementa i." },
        { tipo: "opciones", titulo: "Dos computadores", columna: true, correcta: "nada",
          html: "<p>Ana corre su programa en un portátil y tarda 1,8 s. Beto corre otro programa, para el mismo problema y la misma entrada, en un servidor, y tarda 0,9 s. ¿Qué algoritmo es mejor?</p>",
          opciones: [
            { op: "beto", texto: "El de Beto, que tardó la mitad.", msg: "El servidor puede ser varias veces más rápido que el portátil. Con máquinas distintas, el tiempo mezcla el algoritmo con el computador." },
            { op: "ana", texto: "El de Ana, porque en un servidor cualquier programa vuela.", msg: "Tampoco se puede afirmar: no se sabe cuánto más rápido es el servidor ni qué estaba corriendo en cada máquina." },
            { op: "nada", texto: "No se puede decir con esos datos: hay que contar las instrucciones de cada uno.", msg: "Correcto. Comparar exige la misma máquina y varias corridas, o mejor, el conteo de instrucciones en función del tamaño de la entrada, que no depende de ninguna máquina." }
          ] }
      ]
    };
  }

  return { POR_TAMANO: POR_TAMANO, CORRIDAS: CORRIDAS, T: T, spec: spec };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  Tarjetas.montar(EJERCICIO.spec());
}
