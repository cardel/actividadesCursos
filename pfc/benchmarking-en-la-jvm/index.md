# Ejercicios · PFC · medir y analizar en la JVM

Dos ejercicios para recorrer en el navegador, en el orden en que se presentan
los temas. Hay números que hay que calcular antes de verlos, tablas que se
recalculan al cambiar el tamaño de la entrada o la corrida que se mira, y
opciones con retroalimentación por cada distractor.

Lo que une a los dos es que el análisis y la medición responden preguntas
distintas y ninguna reemplaza a la otra. El análisis dice cómo escala el
programa cuando crecen la entrada o los recursos, y su respuesta es la misma
en cualquier máquina. La medición dice qué tiempo toma aquí, con esta JVM y
con esta entrada, y su respuesta es una variable aleatoria: hay que medir
muchas veces y tratar el ruido.

Las cifras salen de la sesión. El trabajo y la profundidad de la suma en árbol
se calculan recorriendo los niveles del árbol con el tamaño que esté escogido;
los diez tiempos del experimento mental y las dos corridas de diez
repeticiones de `measure` sobre un arreglo de cien millones de enteros son los
que reporta la sesión, y de esas listas salen las medias, las medianas, los
rangos y lo que queda tras descartar el peor diez por ciento.

## Por qué medir y por qué analizar

### [analizarOmedir](analizarOmedir.html){ target=_blank rel=noopener }

Los niveles de la suma en árbol, uno por fila, con las sumas que ocurren a la
vez en cada nivel: de ahí salen el trabajo y la profundidad, y la razón entre
las dos es el paralelismo que el conteo de operaciones totales no ve. Seis
preguntas de las que aparecen al cerrar un taller, para repartir entre la
herramienta que responde cada una. Cierra con los diez tiempos del mismo
programa en la misma máquina, donde la media, la mediana y el descarte del peor
valor no coinciden, y con un equipo que midió una sola vez cada versión y
obtuvo un speedup de 0,8.

## Benchmarking en la JVM

### [calentamiento](calentamiento.html){ target=_blank rel=noopener }

Las diez repeticiones de `measure` en barras, con las dos primeras en otro
color, y la misma vista para la corrida envuelta en
`withWarmer(new Warmer.Default)`. Las cuatro etapas de la JVM explican el
desfase, el descarte del peor diez por ciento se queda corto cuando los
atípicos son dos, y los tres warmers se reparten tres situaciones distintas,
incluida la que el calentamiento borra: el arranque en frío. Cierra con la
decisión de repartir o no un cálculo cuyo secuencial ya se midió en
microsegundos.
