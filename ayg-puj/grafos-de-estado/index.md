# Ejercicios · AyG PUJ · Grafos de estado

Seis ejercicios para el navegador, organizados por tema y de lo más directo a lo más
exigente. Los cuatro primeros se construyen sobre *The New Villa* (UVa 321), con el código
C++ con máscaras de bits del titular; el quinto es Super Mario con Dijkstra encima de los
estados, y el último plantea desde cero un escenario distinto, sobre una ciudad.
Los seis cuentan. Ninguno de los ejercicios usa las villas de las diapositivas ni las de sus
ejercicios propuestos.

## Máscaras de bits

### [Máscaras de bits para las luces](mascaras.html){ target=_blank rel=noopener }

Diez escenarios con cuatro luces. En cada uno hay una operación, `1 << i - 1`, `&` o `^`, y se calcula el resultado en decimal y en binario antes de comprobar. La retroalimentación reconoce los errores más comunes: desplazar `i` y no `i - 1`, confundir `&` con `^` y esperar un 1 donde el `&` devuelve el valor del bit.

## Las transiciones

### [Transiciones entre estados](transiciones.html){ target=_blank rel=noopener }

Cinco estados sobre cinco villas pequeñas. Para cada movimiento y cada cambio de luz posible se marca si la transición es válida y, si lo es, se escribe el estado que resulta con la máscara en decimal. Si la transición no es válida, la retroalimentación dice cuál condición falla: no hay puerta, la habitación de llegada está a oscuras, no hay interruptor o se tocaría la luz de la habitación donde se está.

## El grafo por capas

### [El grafo de estados por capas](capas.html){ target=_blank rel=noopener }

Tres villas, una con cuatro habitaciones. Se marcan en una rejilla los estados de la capa 1, luego los de la 2, y así hasta que una capa sale vacía. Al comprobar se ven los estados que faltan, con el estado de donde salen, y los que sobran, con la razón: ya estaban en una capa anterior, se alcanzan más tarde o no se alcanzan nunca. Al final se sabe cuántos estados se descubren y si la meta aparece.

## La búsqueda en amplitud

### [Grafo de estados](estados.html){ target=_blank rel=noopener }

La función `solve` de `321-new-villa.cpp` línea por línea sobre tres villas pequeñas. Antes de ejecutar se predice cuántos estados quedan en `dist` al terminar. Se ven la cola, el estado que sale de ella, el vector de pasos que acompaña a cada estado y lo que imprime el programa. Una de las villas no tiene solución, y en las que sí tienen la búsqueda se detiene al sacar la meta, sin explorar todo.

## Un grafo de estado con Dijkstra

### [Super Mario como grafo de estado](mario.html){ target=_blank rel=noopener }

Un mapa de dos aldeas y dos castillos con una bota que se calza una vez. Un estado es el lugar, la carga que queda en la bota y los usos que faltan. Seis transiciones para predecir, con el estado siguiente y su costo, y una que no se puede por dos razones a la vez. Después se predice lo que imprime `10269-super-mario.py` y se sigue su Dijkstra línea por línea, con la cola de tuplas `(c, u, l, k)`, las tuplas viejas y el diccionario de tiempos conocidos.

## Plantear un escenario desde cero

### [Plantear un escenario como grafo de estado](escenario.html){ target=_blank rel=noopener }

Una ciudad con cinco cruces, vías de doble sentido y un carro eléctrico con batería de
capacidad limitada que puede recargar en algunos cruces. Ocho preguntas de opción múltiple,
con retroalimentación por cada opción: por qué el grafo de cruces no basta, qué lleva el
estado y en qué rango se mueve cada elemento, cuántos estados caben, qué condición pide cada
transición y a qué estado lleva, cuáles son el inicial y los finales, y con qué algoritmo se
resuelve. Al final se predice el menor tiempo y aparece la ruta estado por estado, con
cuántos de los estados que caben llegó a sacar de la cola la búsqueda.

## Para resolver en papel

1. Con cuatro luces, calcule en binario `1010 ^ 0100`, `1010 & 0100` y `1 << 3 - 1`. Diga qué luz de cada resultado queda prendida y qué hace cada operación en `solve`.

2. En una villa de $r$ habitaciones, ¿cuántos de los $r \cdot 2^r$ estados cumplen $h \in L$? Compare con los que alcanza la búsqueda en la villa de la actividad por capas y diga cuáles de los que cumplen $h \in L$ no se alcanzan.

3. Elija una de las villas de la actividad por capas y dibuje el grafo completo con la acción en cada arista. Marque las aristas que llegan a un estado ya descubierto y diga cuántas hay.

4. Suponga que se quita la línea `dist[est] = dist[curr] + 1` y diga qué ocurre con la búsqueda. Explique por qué `dist.find(est) == dist.end()` detecta un estado que todavía no se ha visitado.

5. En la ciudad del último ejercicio, suba la capacidad de la batería de 8 a 12 sin tocar
   nada más. Diga cuántos estados caben ahora, cuánto tarda el carro, por qué la carga
   desaparece de la respuesta y por qué el cruce 2 deja de ser un callejón sin salida.

## Problema de juez

UVa 321, The New Villa:
<https://onlinejudge.org/external/3/321.pdf>, envío en
<https://onlinejudge.org/index.php?option=com_onlinejudge&Itemid=25&page=submit_problem&problemid=257>.

Los estados son $(h, L)$ y la máscara de luces es el vector de bits que se actualiza con `^`. El
parámetro de la búsqueda es el número de pasos, la propiedad que la hace correcta es que todas las
aristas pesan 1, y la trampa del enunciado es que nunca se apaga la luz de la habitación donde se está.
