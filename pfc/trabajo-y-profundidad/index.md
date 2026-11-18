# Ejercicios · PFC · trabajo y profundidad

Dos ejercicios para recorrer en el navegador, en el orden en que se presentan
los temas. Hay números que hay que calcular antes de verlos, una traza que
avanza paso a paso con los contadores de cada línea a la vista, y opciones con
retroalimentación por cada distractor.

Lo que une a los dos es la separación entre dos medidas de un programa
paralelo. El trabajo `W` cuenta todas las operaciones que hay que hacer, como
si no hubiera paralelismo, y es el costo secuencial. La profundidad `D` mide la
cadena más larga de operaciones que tienen que ir una después de otra,
suponiendo núcleos de sobra, y es el tiempo mínimo al que se puede aspirar.
Reordenar un cálculo deja `W` igual y cambia `D`, y de esa diferencia sale
cuánto se puede ganar al repartirlo.

Las cifras se calculan en la página. Las trazas salen de correr las dos sumas
con sus ocho enteros, el cuadro en escala de reducir la lista `1..n` contando
las sumas y los niveles que hicieron falta, y los tiempos con `P` núcleos de
sumar, nivel por nivel, cuántas rondas de `P` sumas caben.

## Las dos medidas en un mismo cómputo

### [sumar8](sumar8.html){ target=_blank rel=noopener }

Los ocho enteros `1..8`, sumados en dos órdenes: la cadena
`((((((1+2)+3)+4)+5)+6)+7)+8` y el árbol que suma por parejas. El panel de
código muestra los dos y la traza enciende uno a la vez, con el resultado
parcial, el trabajo acumulado y el nivel en los chips. Las siete sumas son las
mismas en los dos órdenes y la profundidad pasa de 7 a 3. Incluye las reglas de
composición aplicadas a expresiones pequeñas, con un `parallel` anidado y el
paso que da `segmentRec` en cada nivel, y el tiempo con 1, 2, 4, 8 y 1000
núcleos, donde se ve que la cadena marca 7 unidades con cualquiera de ellos.

## El mismo trabajo en escala

### [escala](escala.html){ target=_blank rel=noopener }

Qué pasa con las dos medidas a medida que `n` crece, desde `n = 4` hasta
`n = 1024`. La página reduce la lista y cuenta: el trabajo crece con `n`, la
profundidad del árbol con `log2 n`, y el speedup tope `W/D` sube de 1,50 a
102,30. Después quita el supuesto de los núcleos ilimitados, porque el nivel 0
pide `n/2` sumas al mismo tiempo y con cuatro núcleos el speedup de `n = 1024`
queda en 3,98. Cierra con `segmentRec` y su umbral, donde la profundidad es la
altura del árbol de particiones más lo que la hoja suma en secuencia, y con la
decisión de qué umbral conviene.
