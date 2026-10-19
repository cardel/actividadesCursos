# Ejercicios · AyG PUJ · Recurrencias

Un ejercicio para el navegador sobre el costo de una función recursiva. La
mecánica es la de siempre: escriba su respuesta antes de ver la del
ejercicio, compruébela y siga al paso siguiente. Cada nodo del árbol es una
llamada y lleva el trabajo que esa llamada hace fuera de sus llamadas
recursivas; sumando por niveles se obtiene $T(n)$ sin desarrollar la
recurrencia, y al final se comparan los dos caminos.

## [arbol](./arbol.html){ target=_blank rel=noopener }

Elija entre $T(n) = T(n-1) + c$, $T(n) = T(n/2) + c$ y
$T(n) = 2T(n/2) + cn$, con $T(1) = c$ y $n$ potencia de 2 hasta 64. Nivel
por nivel escriba cuántos nodos hay, cuánto trabaja cada uno y cuánto cuesta
el nivel entero, en unidades de $c$; el dibujo crece con cada nivel
aceptado.

Después vienen el número de niveles y el total. Cuente el nivel de las
hojas: con la mitad son $\log_2 n + 1$ niveles, no $\log_2 n$. Al acertar
aparece el desarrollo por sustitución, el total se compara con la
recurrencia evaluada y el ejercicio cierra con la clase $\Theta$.

## De los temas anteriores

Los ejercicios de recursión siguen en la
[página de recursión](../recursion/index.md): `movil` y `grey` para el árbol
de llamadas, y `mezclar` y `ordenar` para el ordenamiento por mezcla, cuyo
costo es la tercera recurrencia de esta página.
