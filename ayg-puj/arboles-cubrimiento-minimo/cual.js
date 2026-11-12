/* Ejercicio interactivo: decidir sin correr el algoritmo.
   Diez preguntas sobre el arbol de cubrimiento minimo y sobre cual de los dos
   algoritmos conviene. Cada opcion lleva su propia explicacion. */
var EJERCICIO = (function () {
  var PREGUNTAS = [
    {
      titulo: "Sumarle lo mismo a cada peso",
      texto: "A cada arista de un grafo conexo de seis vértices se le suma 10 al peso. ¿Qué pasa con el árbol de cubrimiento mínimo?",
      opciones: [
        { txt: "Puede cambiar, porque las diferencias entre los pesos se agrandan.",
          fb: "Sumar la misma cantidad a todos no cambia ninguna diferencia: si antes una pesaba 3 menos que otra, sigue pesando 3 menos." },
        { txt: "Es el mismo árbol y pesa 10 por cada una de sus aristas más que antes.", ok: true,
          fb: "Eso es. Todo árbol de cubrimiento tiene las mismas |V| − 1 aristas, así que todos suben lo mismo y el orden entre ellos no se mueve." },
        { txt: "Cambia, porque la lista ordenada de aristas queda en otro orden.",
          fb: "Sumar una constante conserva el orden de los pesos, así que la lista ordenada queda idéntica y Kruskal escoge lo mismo." },
        { txt: "Es el mismo árbol y pesa lo mismo que antes.",
          fb: "El árbol es el mismo, pero el peso sube: son cinco aristas y el total crece en 50." }
      ]
    },
    {
      titulo: "Duplicar cada peso",
      texto: "Ahora cada peso se multiplica por 2. ¿Qué pasa con el árbol de cubrimiento mínimo?",
      opciones: [
        { txt: "Puede quedar otro árbol, porque las diferencias entre pesos se duplican.",
          fb: "Multiplicar por un número positivo conserva el orden: si una arista era más barata que otra, lo sigue siendo." },
        { txt: "Es el mismo árbol y pesa lo mismo.",
          fb: "El árbol es el mismo, pero su peso también se duplica: cada una de sus aristas vale el doble." },
        { txt: "No se puede saber sin mirar el grafo.",
          fb: "Sí se puede: al multiplicar por un número positivo, cualquier comparación entre dos árboles da el mismo resultado que antes." },
        { txt: "Es el mismo árbol y pesa el doble.", ok: true,
          fb: "Eso es. El orden de los pesos no cambia y la suma de cada árbol se duplica, así que el mínimo sigue siendo el mismo." }
      ]
    },
    {
      titulo: "Pesos negativos",
      texto: "Un grafo conexo tiene algunas aristas de peso negativo. ¿Sirven Kruskal y Prim?",
      opciones: [
        { txt: "Los dos sirven sin cambiarles nada.", ok: true,
          fb: "Eso es. Ninguno de los dos suma pesos a lo largo de un camino: comparan aristas entre sí, y comparar funciona igual con negativos." },
        { txt: "Hay que sumarle una constante a todos para volverlos positivos.",
          fb: "Sumar una constante no cambia la respuesta, de modo que tampoco hace falta hacerlo." },
        { txt: "Prim falla, por lo mismo que falla Dijkstra con pesos negativos.",
          fb: "Dijkstra falla porque acumula el costo del camino. Prim compara el peso de una sola arista contra la clave, y eso no se rompe." },
        { txt: "El árbol mínimo deja de existir: convendría recorrer un ciclo negativo.",
          fb: "Un árbol no tiene ciclos, así que no hay nada que recorrer dos veces. Los árboles de cubrimiento siguen siendo finitos y alguno pesa menos que todos." }
      ]
    },
    {
      titulo: "Pesos repetidos",
      texto: "En un grafo conexo hay tres aristas de peso 5. ¿Qué se puede decir del árbol de cubrimiento mínimo?",
      opciones: [
        { txt: "Sigue siendo único, porque el algoritmo es determinista.",
          fb: "El algoritmo da un árbol, no el único: cambiando el orden en que mira las aristas de igual peso puede salir otro, con el mismo total." },
        { txt: "El peso total depende del orden en que se miren las aristas de peso 5.",
          fb: "El peso total es el mismo en todos los árboles mínimos. Lo que cambia con el orden es cuáles aristas quedan." },
        { txt: "Puede haber varios árboles mínimos, todos del mismo peso total.", ok: true,
          fb: "Eso es. Con empates suele haber más de un árbol mínimo, y por eso un juez pide el peso y no la lista de aristas." },
        { txt: "Hay que romper los empates por el número del vértice para que el resultado sea correcto.",
          fb: "Cualquier desempate da un árbol mínimo. El orden entre pesos iguales no afecta la respuesta, solo escoge una de ellas." }
      ]
    },
    {
      titulo: "Un grafo que no es conexo",
      texto: "El grafo tiene 10 vértices en dos pedazos sin ninguna arista entre ellos. ¿Qué devuelven los dos algoritmos?",
      opciones: [
        { txt: "Kruskal se queda en un ciclo infinito buscando la novena arista.",
          fb: "El ciclo también termina cuando se acaban las aristas, así que para. Lo que no alcanza es las nueve aristas." },
        { txt: "Menos de nueve aristas, y eso es lo que hay que reportar.", ok: true,
          fb: "Eso es. Kruskal recorre todas las aristas y queda con un bosque; Prim llena el pedazo de la raíz y extraer_minimo devuelve None." },
        { txt: "Un bosque cuyo peso es el árbol de cubrimiento mínimo del grafo.",
          fb: "El peso del bosque es el mínimo de cada pedazo por separado. Árbol de cubrimiento del grafo no hay, porque no hay forma de conectarlo." },
        { txt: "Prim lo resuelve si se corre desde una raíz de cada pedazo.",
          fb: "Eso da un bosque de dos árboles, que es lo máximo que se puede. Sigue sin haber un árbol que toque los diez vértices." }
      ]
    },
    {
      titulo: "Las aristas ya llegan ordenadas",
      texto: "La entrada trae las aristas de menor a mayor peso. ¿Qué cambia?",
      opciones: [
        { txt: "Nada: el ordenamiento es parte del algoritmo y hay que hacerlo igual.",
          fb: "La línea 33 se puede saltar cuando la lista ya viene ordenada, y era la que dominaba el costo." },
        { txt: "Prim pasa a ser la mejor opción, porque no depende del orden.",
          fb: "Prim tampoco empeora, pero Kruskal es el que se abarata: justo lo que le costaba era ordenar." },
        { txt: "Nada en el costo, porque ordenar una lista ya ordenada también cuesta |E| log |E|.",
          fb: "No hay que ordenarla: la línea se quita. Y ordenar una lista ya ordenada le cuesta |E| a los algoritmos que detectan el caso." },
        { txt: "Kruskal se queda en casi lineal, porque solo le quedan las consultas al conjunto disjunto.", ok: true,
          fb: "Eso es. Sin el ordenamiento quedan |E| consultas, que con unión por rango y compresión de caminos son casi constantes." }
      ]
    },
    {
      titulo: "Un grafo denso",
      texto: "Hay 2 000 vértices y casi dos millones de aristas, que llegan como matriz de adyacencia. ¿Cuál conviene?",
      opciones: [
        { txt: "Prim con búsqueda lineal, que cuesta |V| al cuadrado sin estructura de por medio.", ok: true,
          fb: "Eso es. Con |E| cerca de |V| al cuadrado, los cuatro millones de pasadas salen más baratos que ordenar dos millones de aristas." },
        { txt: "Kruskal, porque ordenar dos millones de aristas es rápido.",
          fb: "Ordenarlas cuesta |E| log |E|, que aquí es unos cuarenta millones de comparaciones, bastante más que |V| al cuadrado." },
        { txt: "Prim con cola de prioridad, que siempre es la versión más rápida.",
          fb: "Con el grafo denso la cola mueve casi |E| parejas y paga un logaritmo por cada una. La búsqueda lineal no paga ninguno." },
        { txt: "Da igual: los dos terminan en |E| log |E|.",
          fb: "Prim con búsqueda lineal no tiene logaritmo, y en un grafo denso esa diferencia es la que decide." }
      ]
    },
    {
      titulo: "Un grafo ralo",
      texto: "Hay 200 000 cruces y 200 000 calles, que llegan como lista de aristas. ¿Cuál conviene?",
      opciones: [
        { txt: "Prim, que siempre es más rápido que Kruskal.",
          fb: "Prim necesita las listas de adyacencia, y armarlas es trabajo extra. Con |E| del orden de |V| Kruskal no se queda atrás." },
        { txt: "Prim con búsqueda lineal, que no necesita ordenar.",
          fb: "Esa versión cuesta |V| al cuadrado, que aquí son cuarenta mil millones de pasadas. Con el grafo ralo es la peor opción." },
        { txt: "Kruskal, que trabaja con la lista de aristas tal como viene.", ok: true,
          fb: "Eso es. Ordena 200 000 aristas y recorre la lista sin armar el grafo, que es exactamente el formato de la entrada." },
        { txt: "Cualquiera de los dos: con |E| parecido a |V| los costos coinciden.",
          fb: "Los costos quedan cerca, pero Kruskal se ahorra armar las listas de adyacencia, y ese paso también se paga." }
      ]
    },
    {
      titulo: "El árbol de cubrimiento máximo",
      texto: "Ahora se quiere el árbol de cubrimiento de mayor peso. ¿Cómo se consigue?",
      opciones: [
        { txt: "No hay algoritmo voraz para eso: hay que probar todos los árboles.",
          fb: "El teorema del corte tiene su versión con la arista más pesada del corte, y el mismo esquema voraz sirve." },
        { txt: "Tomando las aristas que no están en el árbol mínimo.",
          fb: "Esas |E| − |V| + 1 aristas no forman un árbol: suelen tener ciclos y dejar vértices por fuera." },
        { txt: "Sumándole a cada peso una constante grande y corriendo Kruskal.",
          fb: "Sumar una constante no invierte el orden de los pesos, así que sale el mismo árbol mínimo de antes." },
        { txt: "Recorriendo las aristas de mayor a menor, con el mismo Kruskal.", ok: true,
          fb: "Eso es. Basta cambiar el orden del recorrido, o negar los pesos y correr Kruskal tal como está." }
      ]
    },
    {
      titulo: "El camino más corto y el árbol mínimo",
      texto: "¿El camino más corto entre dos vértices está siempre dentro del árbol de cubrimiento mínimo?",
      opciones: [
        { txt: "Sí: el árbol mínimo escoge las aristas más baratas, así que sus caminos son los más baratos.",
          fb: "El árbol minimiza la suma de sus aristas, no la distancia entre dos vértices. Son dos cosas distintas que se optimizan por separado." },
        { txt: "No, y el contraejemplo más pequeño es un triángulo de pesos 2, 2 y 3.", ok: true,
          fb: "Eso es. El árbol toma las dos de 2 y pesa 4; entre los extremos de la de 3, el camino del árbol cuesta 4 y la arista directa, 3." },
        { txt: "Sí, siempre que todos los pesos sean distintos.",
          fb: "Los pesos 2, 2 y 3 se pueden volver 2, 2.5 y 3 y el árbol sigue siendo las dos primeras: el camino del árbol cuesta 4.5 contra 3." },
        { txt: "No, y el contraejemplo más pequeño necesita cuatro vértices.",
          fb: "Con tres alcanza: hace falta un ciclo para que haya dos caminos, y el ciclo más corto es el triángulo." }
      ]
    }
  ];

  function correcta(i) {
    var r = -1;
    PREGUNTAS[i].opciones.forEach(function (o, j) { if (o.ok) { r = j; } });
    return r;
  }

  return { PREGUNTAS: PREGUNTAS, correcta: correcta };
})();

if (typeof module !== "undefined") { module.exports = EJERCICIO; }

if (typeof document !== "undefined") {
  (function () {
    var E = EJERCICIO, cont = document.getElementById("preguntas"), h = "", resueltas = {};
    document.getElementById("total").textContent = E.PREGUNTAS.length;
    E.PREGUNTAS.forEach(function (q, i) {
      h = h + "<div class='carta'><h2>" + (i + 1) + ". " + q.titulo + "</h2>" +
        "<p class='pregunta'>" + q.texto + "</p><div class='opciones' data-q='" + i + "'>";
      q.opciones.forEach(function (o, j) {
        h = h + "<button class='opcion' data-q='" + i + "' data-o='" + j + "'>" + o.txt + "</button>";
      });
      h = h + "</div><div class='fb' id='fb-" + i + "'></div></div>";
    });
    cont.innerHTML = h;
    Array.prototype.forEach.call(cont.querySelectorAll(".opcion"), function (b) {
      b.addEventListener("click", function () {
        var i = parseInt(b.getAttribute("data-q"), 10), j = parseInt(b.getAttribute("data-o"), 10);
        var o = E.PREGUNTAS[i].opciones[j], d = document.getElementById("fb-" + i);
        d.textContent = o.fb;
        d.className = "fb " + (o.ok ? "bien" : "mal");
        Array.prototype.forEach.call(cont.querySelectorAll(".opcion[data-q='" + i + "']"), function (x) {
          x.classList.remove("elegida");
        });
        b.classList.add("elegida");
        if (o.ok) { resueltas[i] = true; }
        document.getElementById("resueltas").textContent = Object.keys(resueltas).length;
      });
    });
  })();
}
