/* Ejercicio interactivo: elegir el algoritmo de caminos mas cortos segun el escenario.
   Cada escenario declara sus propiedades; el algoritmo correcto sale de ellas. */
var EJERCICIO = (function () {
  var NOMBRES = { bfs: "BFS", dag: "Caminos en un DAG", dijkstra: "Dijkstra", bfm: "Bellman-Ford-Moore" };
  var ORDEN = ["bfs", "dag", "dijkstra", "bfm"];
  var COSTO = { bfs: "O(n + m)", dag: "O(n + m)", dijkstra: "O((n + m) log n)", bfm: "O(n · m)" };

  /* unit: todas las aristas pesan lo mismo. dag: sin ciclos. neg: hay pesos negativos. */
  function sirve(alg, p) {
    return alg === "bfs" ? p.unit : (alg === "dag" ? p.dag : (alg === "dijkstra" ? !p.neg : true));
  }
  function mejor(p) {
    var i = 0, r = null;
    while (i < ORDEN.length) { if (r === null && sirve(ORDEN[i], p)) { r = ORDEN[i]; } i = i + 1; }
    return r;
  }

  var PORQUE_NO = {
    bfs: "BFS cuenta aristas, y aquí las aristas no cuestan lo mismo: el camino con menos aristas no tiene por qué ser el más barato.",
    dag: "El algoritmo de DAG necesita un orden topológico, y este grafo tiene ciclos. topoSort dejaría vértices por fuera y la pasada no los vería.",
    dijkstra: "Con pesos negativos un vértice que ya salió de la cola puede mejorar después. Dijkstra deja de dar la respuesta segura, o la da repitiendo trabajo."
  };

  /* Retroalimentacion de la eleccion de algoritmo. */
  function evaluarAlgoritmo(alg, p) {
    var m = mejor(p);
    if (alg === m) { return { ok: true, msg: NOMBRES[m] + " es el más barato que sirve aquí, " + COSTO[m] + "." }; }
    if (!sirve(alg, p)) { return { ok: false, msg: PORQUE_NO[alg] }; }
    return { ok: false, msg: NOMBRES[alg] + " sirve aquí, pero hay uno más barato: " + NOMBRES[m] + ", " + COSTO[m] + ", frente a " + COSTO[alg] + "." };
  }

  /* mk(posicion de la correcta, [correcta, falsa1, falsa2, falsa3], [fb1, fb2, fb3]) */
  function mk(pos, textos, fbs) {
    var op = [], k = 0, f = 0;
    while (k < 4) {
      if (k === pos) { op.push({ t: textos[0], ok: true, fb: "" }); }
      else { op.push({ t: textos[1 + f], ok: false, fb: fbs[f] }); f = f + 1; }
      k = k + 1;
    }
    return op;
  }

  var ESCENARIOS = [
    { texto: "Una aplicación del metro cuenta cuántas paradas hay entre dos estaciones. La red tiene líneas circulares, así que hay ciclos, y se quiere el recorrido con menos paradas.",
      p: { unit: true, dag: false, neg: false }, algo: "bfs",
      just: mk(0, ["Cada parada es una arista y todas pesan lo mismo, así que el camino con menos aristas es el más corto.",
                   "Hay ciclos, así que solo Bellman-Ford-Moore es seguro.",
                   "Los tiempos entre estaciones son positivos y distintos, así que hace falta una cola de prioridad.",
                   "La red es un grafo dirigido acíclico y se puede ordenar topológicamente."],
        ["Bellman-Ford-Moore sirve, pero los ciclos no estorban a BFS: la cola solo visita cada vértice una vez.",
         "Aquí no hay tiempos: se cuentan paradas, y cada una pesa 1. Con pesos iguales la cola de prioridad sobra.",
         "Las líneas circulares son ciclos, así que no hay orden topológico."]) },
    { texto: "Una aerolínea busca el itinerario más barato entre dos ciudades. Cada tramo tiene un precio positivo distinto y hay tramos de ida y de vuelta entre varias ciudades.",
      p: { unit: false, dag: false, neg: false }, algo: "dijkstra",
      just: mk(2, ["Los precios son positivos y distintos, y hay ciclos: el vértice de menor distancia que sale de la cola ya no puede mejorar.",
                   "Los tramos de ida y de vuelta son ciclos, así que hace falta un orden topológico.",
                   "Como los precios son distintos, hay que relajar todas las aristas n − 1 veces.",
                   "El itinerario con menos tramos es el más barato."],
        ["Los tramos de ida y vuelta forman ciclos: no hay orden topológico.",
         "Relajar n − 1 veces es correcto, pero innecesario: ningún precio es negativo y Dijkstra lo resuelve con menos trabajo.",
         "Un tramo caro puede costar más que dos baratos. Contar tramos solo vale cuando todos pesan lo mismo."]) },
    { texto: "Un taller arma un producto por etapas. Cada etapa depende solo de etapas anteriores, y pasar de una a otra cuesta dinero o, en las que traen descuento, ahorra: hay costos negativos. Se quiere el costo mínimo desde la primera etapa hasta cada una de las demás.",
      p: { unit: false, dag: true, neg: true }, algo: "dag",
      just: mk(1, ["Hay costos negativos, así que Dijkstra es el que sirve.",
                   "Las dependencias nunca vuelven hacia atrás, así que hay un orden topológico y una pasada basta, aunque haya costos negativos.",
                   "Los costos negativos exigen Bellman-Ford-Moore, que es el único que los admite.",
                   "Todos los pasos cuestan lo mismo, así que BFS."],
        ["Dijkstra supone pesos no negativos: con descuentos, un vértice que ya salió de la cola puede mejorar.",
         "Bellman-Ford-Moore sirve, pero un grafo sin ciclos permite una sola pasada en orden topológico, O(n + m) y no O(n · m).",
         "Los pasos cuestan distinto y algunos son negativos. BFS solo cuenta aristas."]) },
    { texto: "Una casa de cambio publica cuánto cuesta convertir cada moneda en otra, expresado de modo que algunas conversiones tienen peso negativo. Interesa saber si existe una cadena de conversiones que deje ganancia y, si no, el costo mínimo entre dos monedas.",
      p: { unit: false, dag: false, neg: true }, algo: "bfm",
      just: mk(3, ["Los pesos son positivos y hay ciclos, así que Dijkstra.",
                   "Si no hay ganancia se puede usar la pasada en orden topológico.",
                   "Cada conversión es una arista, y basta con contarlas.",
                   "Hay pesos negativos y ciclos, y puede existir un ciclo negativo; Bellman-Ford-Moore lo detecta."],
        ["Hay conversiones con peso negativo, y Dijkstra no los admite.",
         "Las monedas se convierten unas en otras en los dos sentidos, así que hay ciclos y no hay orden topológico.",
         "Las conversiones pesan distinto. Contarlas solo vale cuando todas pesan igual."]) },
    { texto: "Un robot recorre una cuadrícula con muros. Cada paso a una celda vecina libre tarda lo mismo. Se quiere el menor número de pasos entre la entrada y la salida.",
      p: { unit: true, dag: false, neg: false }, algo: "bfs",
      just: mk(1, ["La cuadrícula tiene ciclos, así que se necesita Bellman-Ford-Moore.",
                   "Todos los pasos pesan 1: la primera vez que la cola llega a la salida, ya tiene la distancia mínima.",
                   "Para caminos mínimos se usa siempre Dijkstra.",
                   "Los muros son aristas de peso negativo que hay que evitar."],
        ["Los ciclos no estorban a BFS, que marca cada celda como vista.",
         "Dijkstra daría la misma respuesta, pero con una cola de prioridad que aquí sobra: con pesos iguales BFS cuesta menos.",
         "Un muro no es una arista, es la ausencia de ella. No hay pesos negativos en el problema."]) },
    { texto: "Una empresa de reparto recorre rutas con peajes y bonificaciones: algunas vías le devuelven dinero al pasar. Hay vías de doble sentido, y la contabilidad garantiza que ninguna vuelta cerrada deja ganancia. Se quiere el costo mínimo de la bodega a cada cliente.",
      p: { unit: false, dag: false, neg: true }, algo: "bfm",
      just: mk(0, ["Hay ciclos y pesos negativos, y ningún ciclo es negativo: Bellman-Ford-Moore da las distancias correctas.",
                   "Como ningún ciclo es negativo, Dijkstra funciona.",
                   "Si una vuelta cerrada no deja ganancia, el grafo es acíclico.",
                   "Son rutas, así que BFS."],
        ["Que no haya ciclos negativos no basta para Dijkstra: una sola arista negativa ya puede romper la propiedad de que lo que sale de la cola es final.",
         "Una vuelta cerrada es un ciclo. Que no deje ganancia significa que su peso total no es negativo, no que no exista.",
         "Las vías tienen peajes y bonificaciones distintos. BFS solo cuenta aristas."]) },
    { texto: "Un proyecto tiene tareas con precedencias: una tarea empieza cuando terminan sus predecesoras y no hay dependencias circulares. Se busca la ruta crítica, el camino de mayor duración desde la tarea inicial hasta cada otra.",
      p: { unit: false, dag: true, neg: true }, algo: "dag",
      just: mk(3, ["El camino más largo no se puede calcular con algoritmos de caminos más cortos.",
                   "Al cambiar el signo de las duraciones quedan pesos negativos, así que se necesita Dijkstra.",
                   "Con pesos negativos solo sirve Bellman-Ford-Moore.",
                   "No hay ciclos, hay orden topológico, y cambiar el signo de las duraciones convierte el camino más largo en uno más corto que la pasada admite."],
        ["Sí se puede: el camino más largo con duraciones d es el más corto con pesos −d, y en un DAG los pesos negativos no estorban.",
         "Dijkstra no admite pesos negativos, y al cambiar el signo todos lo son.",
         "Bellman-Ford-Moore sirve, pero sin ciclos la pasada en orden topológico lo hace en O(n + m)."]) },
    { texto: "Un servicio de mensajería en bicicleta calcula el tiempo mínimo desde su sede hasta cada barrio. Los tiempos son minutos positivos y distintos, y las calles son de doble sentido.",
      p: { unit: false, dag: false, neg: false }, algo: "dijkstra",
      just: mk(2, ["Las calles de doble sentido producen ciclos negativos que hay que detectar.",
                   "Basta BFS: cada calle se recorre una sola vez.",
                   "Los tiempos son positivos y distintos, con ciclos: la pareja de menor distancia en la cola es final.",
                   "Dijkstra no admite ciclos, así que hay que usar Bellman-Ford-Moore."],
        ["Un par de aristas de ida y vuelta con tiempos positivos forma un ciclo de peso positivo, no negativo.",
         "Los tiempos son distintos, y BFS solo cuenta aristas.",
         "Dijkstra admite ciclos. Lo que no admite son pesos negativos, y aquí no hay ninguno."]) },
    { texto: "Un videojuego mueve a un personaje por un mapa cuadriculado. Cada celda tiene un costo de terreno entre 1 y 9 (pantano, bosque, camino) que se paga al entrar en ella. Se busca la ruta de menor costo entre dos celdas.",
      p: { unit: false, dag: false, neg: false }, algo: "dijkstra",
      just: mk(0, ["Los costos son positivos y distintos: Dijkstra sobre el grafo de celdas, que se genera sobre la marcha.",
                   "El mapa es una cuadrícula, así que BFS.",
                   "Los terrenos distintos producen pesos negativos.",
                   "Como no se vuelve a una celda, el grafo no tiene ciclos."],
        ["BFS cuenta celdas, no costo. La ruta con menos celdas puede atravesar el pantano.",
         "Los costos van de 1 a 9, todos positivos.",
         "Desde cada celda se puede ir a las cuatro vecinas, de modo que ir y volver forma un ciclo."]) },
    { texto: "Una red social quiere medir los grados de separación entre dos personas: la menor cantidad de amistades que las conecta. Las amistades son recíprocas.",
      p: { unit: true, dag: false, neg: false }, algo: "bfs",
      just: mk(1, ["Las amistades recíprocas forman ciclos de peso cero, así que hay que usar Bellman-Ford-Moore.",
                   "Cada amistad es una arista sin peso, y el menor número de aristas es la distancia buscada.",
                   "Dijkstra siempre da la respuesta, así que es la opción segura.",
                   "Las amistades se hicieron en orden de tiempo, de modo que hay un orden topológico."],
        ["Las aristas no tienen peso cero: pesan 1 cada una. Y BFS no se ve afectado por los ciclos.",
         "Daría la respuesta, pero con más costo del necesario: sin pesos no hace falta una cola de prioridad.",
         "Una amistad recíproca va en los dos sentidos, y eso ya forma un ciclo de longitud 2."]) }
  ];

  return { NOMBRES: NOMBRES, ORDEN: ORDEN, ESCENARIOS: ESCENARIOS, mejor: mejor, sirve: sirve, evaluarAlgoritmo: evaluarAlgoritmo };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, estado = [], resueltos = 0;
    function el(id) { return document.getElementById(id); }

    function carta(i) {
      var s = E.ESCENARIOS[i], c = document.createElement("div"), st = { alg: null, just: null, listo: false };
      estado.push(st);
      c.className = "carta";
      c.innerHTML = "<h2>Escenario " + (i + 1) + "</h2><p style='margin-top:0'>" + s.texto + "</p>" +
        "<div class='pregunta'>¿Qué algoritmo?</div><div class='opciones algs'></div>" +
        "<div class='pregunta'>¿Por qué?</div><div class='justs'></div>" +
        "<div class='botones' style='margin-top:0.6rem'><button class='primario comprobar'>Comprobar</button></div><div class='fb'></div>";
      var cajaA = c.querySelector(".algs"), cajaJ = c.querySelector(".justs"), fb = c.querySelector(".fb");
      function pintar() {
        cajaA.innerHTML = ""; cajaJ.innerHTML = "";
        E.ORDEN.forEach(function (a) {
          var b = document.createElement("button");
          b.textContent = E.NOMBRES[a];
          b.className = st.alg === a ? "primario" : "";
          b.addEventListener("click", function () { st.alg = a; pintar(); });
          cajaA.appendChild(b);
        });
        s.just.forEach(function (o, k) {
          var b = document.createElement("button");
          b.className = "opcion" + (st.just === k ? " elegida" : "");
          b.textContent = o.t;
          b.addEventListener("click", function () { st.just = k; pintar(); });
          cajaJ.appendChild(b);
        });
      }
      c.querySelector(".comprobar").addEventListener("click", function () {
        var r, msg;
        if (st.alg === null || st.just === null) { fb.className = "fb mal"; fb.textContent = "Escoja un algoritmo y una justificación."; return; }
        r = E.evaluarAlgoritmo(st.alg, s.p);
        var j = s.just[st.just];
        if (r.ok && j.ok) {
          msg = r.msg + " Y la justificación es la que sostiene la elección.";
          fb.className = "fb bien";
          if (!st.listo) { st.listo = true; resueltos = resueltos + 1; el("resueltos").textContent = resueltos; }
        } else {
          fb.className = "fb mal";
          msg = (r.ok ? "El algoritmo es el correcto. " : "Algoritmo: " + r.msg + " ") + (j.ok ? "La justificación es correcta." : "Justificación: " + j.fb);
        }
        fb.textContent = msg;
      });
      pintar();
      return c;
    }

    var caja = el("escenarios");
    el("total").textContent = E.ESCENARIOS.length;
    E.ESCENARIOS.forEach(function (s, i) { caja.appendChild(carta(i)); });
  })();
}
