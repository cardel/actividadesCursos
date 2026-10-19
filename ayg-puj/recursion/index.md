# Ejercicios · AyG PUJ · Recursion

Cada enlace abre un ejercicio que se trabaja directo en el navegador. La
mecánica es la de siempre: prediga antes de ejecutar, recorra el algoritmo
paso a paso y busque el patrón en la traza. La diferencia está en el
destino: aquí el patrón no es una fórmula de conteo sino una pareja de
**invariantes** —I₀ para las cotas del índice, I₁ para el acumulador— y una
vez los encuentre el ejercicio lo lleva, paso por paso, a la demostración
completa: inicialización, estabilidad y terminación.

## Invariantes de ciclo

### [sumar](sumar.html){ target=_blank rel=noopener }

El primer ciclo de la clase: sumar un arreglo. Mire la traza por estados:
todo cambia de chequeo en chequeo, menos dos propiedades que se conservan
desde (0, 0) hasta el final.

Cuando las encuentre —I₀ e I₁—, el ejercicio abre la demostración del
Teorema 1 y usted la arma respondiendo una pregunta por movimiento, hasta
el Teorema 2.

### [factorial](factorial.html){ target=_blank rel=noopener }

El mismo recorrido, con menos ayuda y una condición distinta: aquí el while
usa `i <= N`, así que las cotas de I₀ cambian. Proponga los dos invariantes
entre candidatos con trampa instructiva y complete la demostración.

Al final hay un experimento: llamar `fact(-1)` y ver qué promete —y qué
no— la especificación cuando la entrada no cumple la precondición.

## Divide y vencerás

### [mezclar](mezclar.html){ target=_blank rel=noopener }

Dos tramos ordenados del mismo arreglo entran, y la mezcla escribe el tramo
completo, ordenado, sobre ese arreglo. Ejecute escritura por escritura y
proponga la pareja de invariantes del primer while: las cotas de i, j y k,
y lo que lista[ini..k) cumple en cada chequeo. Con ellos se arma la
demostración completa —Teorema 1 por inicialización y estabilidad, esta vez
por casos, y la terminación hasta el Teorema 2— del ciclo que hace
funcionar todo el ordenamiento por mezcla.

Pruebe los tres arreglos: uno deja «sobras» cuando la copia izquierda se
agota y otro tiene empates que el `<=` resuelve.

### [ordenar](ordenar.html){ target=_blank rel=noopener }

El ordenamiento por mezcla dibujado completo: baje partiendo la lista nivel
por nivel hasta el caso base y súbala mezclando con el ejercicio anterior.

La tabla acumula el trabajo de cada nivel y ahí aparece el patrón que
explica el n·lg n: todos los pisos del árbol mueven exactamente n
elementos, y pisos hay lg n.

## Árbol de llamadas

### [movil](./movil.html){ target=_blank rel=noopener }

UVa 839, Not so Mobile. Cargue la muestra del enunciado, un móvil al azar o
uno propio, y siga la función `movil()` lectura por lectura: el móvil se
dibuja a medida que se lee y la pila de llamadas muestra lo que espera cada
marco. En cada lectura decida si es caso base o recursivo, y en cada retorno
escriba el peso y si el submóvil está en equilibrio.

Fíjese en las líneas con borde punteado: aparecen cuando un submóvil ya
devolvió que no está en equilibrio, y se leen igual. Si la función dejara de
leer, la siguiente lectura tomaría una línea que no le corresponde.

### [grey](./grey.html){ target=_blank rel=noopener }

UVa 11173, Grey Codes. Elija $n$ y $k$ y baje por las mitades del rango
$[ini, fin)$: en cada nivel marque en qué mitad cae $k$, escriba el bit, el
rango nuevo y la posición, que se refleja cuando cae en la mitad derecha. La
pila crece al bajar y, al subir, cada marco muestra lo que devuelve.

La expansión de $T(m) = T(m/2) + c$ aparece nivel por nivel, y la lista
completa de $2^n$ códigos solo al final, para comprobar la respuesta.
