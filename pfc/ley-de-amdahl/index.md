# Ejercicios · PFC · tiempo de ejecución y ley de Amdahl

Dos ejercicios para recorrer en el navegador, en el orden en que se presentan
los temas. El primero estima cuánto tarda un programa con P núcleos a partir
del trabajo y de la profundidad; el segundo pone el techo que la parte
secuencial le impone a esa estimación, y la decisión que ese techo obliga a
tomar.

Las cifras no están escritas a mano. El trabajo y la profundidad de la suma en
árbol salen de contar las operaciones del recorrido que el propio código
genera, y la tabla de Amdahl sale de evaluar la fórmula para cada fracción
secuencial y cada cantidad de núcleos. Los tiempos del programa de la sesión,
42 ms en la versión secuencial y 15 ms con cuatro hilos, son los que se
midieron en una máquina de cuatro núcleos.

## La estimación con P núcleos

### [tiempoP](tiempoP.html){ target=_blank rel=noopener }

La suma en árbol de un arreglo, recorrida paso a paso, con un contador por
línea del que salen W(e), las operaciones que combinan resultados, y D(e), los
niveles del árbol de llamadas. Con esas dos cifras y el número de núcleos del
preset, la página compara las dos cotas, pregunta cuál manda y pide la
estimación D(e) + W(e)/P. Termina en el arreglo de diez millones de elementos
con cuatro núcleos, donde el término del trabajo supera al del camino crítico
por un factor de cinco cifras, y en lo que esa estimación deja fuera cuando se
compara con los tiempos medidos.

## La ley de Amdahl

### [amdahl](amdahl.html){ target=_blank rel=noopener }

La cuenta del speedup, línea por línea, con la fracción secuencial que se
queda intacta y la paralela que se divide entre los núcleos. La tabla se
calcula desde la fórmula y deja tapada la celda del preset para que el
estudiante la escoja entre opciones; las barras muestran cómo la curva se
aplana contra 1/f, y con f = 0,40 ningún número de núcleos pasa de 2,50.
Cierra con la decisión sobre el programa de la sesión: de los 42 ms y los 15
ms medidos se despeja su fracción secuencial, y con ella se comparan comprar
una máquina de dieciséis núcleos y reescribir esa parte a la mitad.
