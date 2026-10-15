# Ejercicios · Estructuras de Datos · Contenedores list deque stack queue

Contenedores `list`, `deque`, `stack` y `queue`. Cada enlace abre una
actividad que se trabaja directo en el navegador, en el mismo orden de los
temas de la sesión. Los programas y los valores no son los de la sesión:
mismo tema, ronda nueva.

## Lo que ya está construido

### [traducir](traducir.html){ target=_blank rel=noopener }

Un programa con la cola doble, la pila y la cola construidas a mano, pasado
línea por línea a `deque`, `stack` y `queue`, y lo que imprime.

## `list`: la lista doblemente enlazada

### [iterador](iterador.html){ target=_blank rel=noopener }

Seis operaciones sobre una `list`: qué queda, a quién señala el iterador que se
mueve y cuáles de los tres que se guardaron siguen valiendo.

### [empalmar](empalmar.html){ target=_blank rel=noopener }

Un nodo y una lista entera que cambian de lista con `splice`, un `sort` al
final y el iterador que sigue a su nodo, con el costo de cada línea.

## `deque`: la cola doble que se lee por índice

### [bloques](bloques.html){ target=_blank rel=noopener }

Un modelo del `deque` con bloques de tres casillas: en qué ranura y casilla cae
cada `push_front` y `push_back`, cuándo crece el mapa y cómo se lee `d[i]`.

### [ladocorto](ladocorto.html){ target=_blank rel=noopener }

Cuántos elementos corren `insert` y `erase` en distintas posiciones de un
`deque` y de un `vector`, contados en el programa compilado.

### [invalidar](invalidar.html){ target=_blank rel=noopener }

Punteros e iteradores guardados en un `vector`, un `deque` y una `list`, y
cuáles se pueden seguir usando después de cada operación.

## `stack` y `queue`: adaptadores

### [debajo](debajo.html){ target=_blank rel=noopener }

Tres adaptadores sobre contenedores distintos: qué imprime el programa, qué
combinaciones compilan y qué contenedor conviene poner debajo.

## Cuál escoger

### [escoger](escoger.html){ target=_blank rel=noopener }

Seis programas nuevos y el contenedor que hace baratas las operaciones que más
repiten, con la razón de cada opción que no sirve.

## Medir

### [vaciar](vaciar.html){ target=_blank rel=noopener }

Predecir cómo crece el tiempo de vaciar por el frente un `vector`, un `deque` y
una `list` antes de ver las cifras medidas.

### [mitad](mitad.html){ target=_blank rel=noopener }

Lo mismo para insertar en la mitad, donde el `deque` y el `vector` tienen el
mismo orden y no el mismo tiempo.
