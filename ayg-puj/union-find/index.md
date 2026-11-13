# Ejercicios · AyG PUJ · Conjuntos disjuntos

Tres ejercicios para el navegador, uno por tema de la sesión y en el mismo orden. El segundo
corre el código Python de la sesión línea por línea.

Ninguno usa los elementos ni las uniones de las diapositivas: otra cantidad de elementos y otra
secuencia.

## La unión por rango

### [De quién cuelga](colgar.html){ target=_blank rel=noopener }

Seis rondas con dos árboles a la vista y una llamada a `union`. Se decide qué raíz queda colgando
de cuál y en qué queda el rango; al acertar aparece el árbol que deja la llamada.

Las rondas empiezan con rangos distintos y terminan en los empates. Las opciones separan cuatro
confusiones: el tamaño en lugar del rango, el alto colgado del bajo, el rango que sube siempre y
el elemento que se nombra en lugar de su raíz.

## El bosque y la compresión de caminos

### [El bosque, operación por operación](bosque.html){ target=_blank rel=noopener }

Ocho `make_set` y siete uniones, paso a paso, con `union` y `find_set` a la vista, el bosque
dibujado y los arreglos `p` y `rango` debajo. Antes de arrancar se predice cuántas veces sube el
rango de la raíz que queda al final.

En la última unión, `find_set` reengancha un elemento antes de que se compare un solo rango. La
tarjeta de cierre corre `find_set(7)` sobre el árbol que quedó.

## Qué aportan las dos heurísticas

### [Qué pasa sin las heurísticas](sin-heuristicas.html){ target=_blank rel=noopener }

La misma secuencia, dos veces y lado a lado: colgando siempre la segunda raíz de la primera, y
comparando los rangos. En cada paso se cuenta cuántos saltos cuesta llegar a la raíz desde el
elemento más hondo.

Al final, una sola llamada que acorta el camino, con los saltos de antes y de después.

## Para resolver en papel

1. Corra las mismas siete uniones en orden inverso, con `union(7, 6)` primero y `union(3, 7)` al
   final. Compare el bosque que queda con el de la actividad: diga qué rangos cambian, cuáles no y
   si la altura es la misma.

2. Demuestre que un árbol cuya raíz tiene rango $r$ tiene al menos $2^r$ elementos. El rango sube
   en un solo caso del código, y ahí los dos árboles que se juntan tienen el mismo rango.

3. Cuente las llamadas a `find_set` que hace la secuencia de la actividad, contando las recursivas,
   y compárelas con las que haría si cada `union` recibiera dos raíces en vez de dos elementos
   cualesquiera. Los contadores de línea de la segunda actividad sirven para comprobar la cuenta.
