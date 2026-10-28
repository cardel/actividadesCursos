# Ejercicios · AyG PUJ · Floyd-Warshall

Cuatro ejercicios para el navegador sobre caminos más cortos entre todas las parejas. Van en
el orden en que se construye el algoritmo y de lo más directo a lo más exigente: primero un
paso de la recurrencia, después el triple ciclo entero, después la segunda matriz que lo
acompaña y de último por qué los ciclos se anidan como se anidan. Los cuatro cuentan. Dos de
ellos corren el código Python del titular línea por línea. Ninguno usa los grafos ni las
matrices de las diapositivas, ni los de sus ejercicios propuestos.

## La recurrencia y los vértices intermedios

### [La recurrencia de Floyd-Warshall](intermedios.html){ target=_blank rel=noopener }

Tres grafos y un selector del paso. Con la matriz del paso anterior a la vista, se marcan en
una rejilla las parejas que bajan al permitir el vértice $k$ como intermedio y se escribe el
valor nuevo de una de ellas. Al comprobar, la retroalimentación da la cuenta
`d[i][k] + d[k][j]` de cada casilla que faltó y de cada una que sobró, y aparece la matriz
que queda. Los tres grafos tienen un paso en el que nada mejora.

## El triple ciclo sobre la matriz

### [El triple ciclo sobre la matriz](pasada.html){ target=_blank rel=noopener }

`floydWarshall`, la versión de una sola matriz, línea por línea sobre tres grafos, con la
matriz actualizándose, la fila y la columna de $k$ sombreadas y la pareja que se mira
resaltada. Antes de ejecutar se predice cuántas veces corre la línea que baja una distancia.
Al final una tabla compara las $n^3$ comparaciones con las pocas que resultan ciertas.

## Reconstruir el camino

### [Reconstruir el camino con nex](camino.html){ target=_blank rel=noopener }

Un grafo de seis vértices con sus matrices `d` y `nex`. Se escriben los caminos de seis
parejas y se siguen los saltos uno a uno, viendo qué entrada de `nex` se lee en cada uno. Una
de las parejas no tiene camino, y ahí la retroalimentación muestra a qué arista inexistente
llevarían los saltos si no se mirara la distancia primero. Otra se resuelve con la arista
directa aunque exista un camino más largo.

## El orden de los tres ciclos

### [El orden de los tres ciclos](orden.html){ target=_blank rel=noopener }

Seis variantes del mismo cuerpo con los ciclos anidados en otro orden, incluida la que guarda
la matriz del paso anterior aparte. Para cada una se decide si deja las distancias y se
escoge la razón entre cuatro, con retroalimentación por cada opción. Al comprobar, la
variante se corre de verdad sobre el grafo de prueba y aparece su matriz con las parejas que
no coinciden marcadas. Tres de las seis son correctas, y una de las que fallan deja un valor
finito equivocado en vez de un $\infty$, que es lo difícil de notar.

## Para resolver en papel

1. Cada uno de los dos grafos de cinco vértices del primer ejercicio tiene un paso en el que
   la matriz no se mueve. Diga cuál es en cada uno y justifíquelo mirando solo la fila y la
   columna de ese vértice, sin recalcular la matriz entera.

2. Tome el grafo de cuatro vértices con dos caminos del segundo ejercicio y renumere los
   vértices al revés, de modo que el 0 pase a ser el 3. Diga cuántas veces corre la línea
   que baja una distancia y si la matriz final es la misma.

3. En el grafo del tercer ejercicio, escoja una pareja cuyo camino tenga cuatro vértices y
   escriba las tres lecturas de `nex` que lo arman. Después diga qué devuelve la
   reconstrucción cuando $i = j$ y por qué.

4. En ese mismo grafo, cambie el peso de la arista $3 \to 1$ de $5$ a $-5$ y corra el
   algoritmo. Diga qué entradas de la diagonal quedan negativas, cuál es la única que no y
   por qué.

## Problemas de juez

UVa 11463, Commandos: <https://onlinejudge.org/external/114/11463.pdf>, envío en
<https://onlinejudge.org/index.php?option=com_onlinejudge&Itemid=25&page=submit_problem&problemid=2458>.

Con $n \leq 100$ la matriz completa sale gratis. Las vías no tienen peso, así que la matriz
arranca con unos, y la respuesta es el mayor de $d(s,x) + d(x,t)$ sobre todos los edificios
$x$. La trampa del enunciado es el caso de un solo edificio, donde la respuesta es $0$.

UVa 821, Page Hopping: <https://onlinejudge.org/external/8/821.pdf>, envío en
<https://onlinejudge.org/index.php?option=com_onlinejudge&Itemid=25&page=submit_problem&problemid=762>.

Se pide el promedio de las distancias entre todas las parejas de una red fuertemente conexa.
Los nodos vienen numerados sin orden y hay que mapearlos a $0 \ldots n-1$ antes de armar la
matriz. En el promedio no entran las parejas $(i,i)$.
