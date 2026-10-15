# Ejercicios · PFC · Listas

Cuatro ejercicios para recorrer en el navegador, en el orden de la sesión:
cómo se arma y cómo se descompone una lista, qué patrón captura cuál, y qué
queda pendiente en cada marco cuando una función la recorre entera. Ninguno
muestra nada antes de que usted produzca algo: hay trazas que se llenan paso a
paso, valores que hay que predecir antes de verlos y patrones entre los que
hay que escoger. Lo que se compara en cada caso salió de correr el código de
la sesión.

La idea que los atraviesa es que una lista se define por sus dos
constructores, `Nil` y `::`, y que toda función que la recorra tiene un caso
por cada uno. Escribir ese recorrido a mano es el trabajo de aquí.

## Construir y descomponer listas

### [construir](construir.html){ target=_blank rel=noopener }

`1 :: 2 :: 3 :: Nil` se arma de derecha a izquierda, porque `::` asocia por la
derecha. El paso a paso lo muestra naciendo desde `Nil` y después descompone
una lista de frutas con `head`, `tail` e `isEmpty`. El contador de la última
línea deja ver cuántas veces se llega a `isEmpty` sobre la lista vacía.

## Reconocimiento de patrones con listas

### [patrones](patrones.html){ target=_blank rel=noopener }

Los cuatro patrones del `match` están en el orden en que los escribe la
sesión, y el ejercicio da una lista concreta y pregunta cuál la captura. El
punto está en que `x :: Nil` y `x :: y :: Nil` son casos de uno y de dos
elementos, mientras `x :: xs` toma cualquier lista no vacía: por eso el orden
en que se escriben decide cuál gana.

## Funciones recursivas sobre listas

### [reversa](reversa.html){ target=_blank rel=noopener }

`reversa` es recursión lineal: en cada marco queda pendiente un `++ List(x)`
que solo se resuelve al desarmar la pila. La traza cuenta las celdas que
recorre la concatenación, y ahí se ve de dónde sale el costo cuadrático con
una lista de cuatro elementos.

## Ordenamiento por inserción

### [insercion](insercion.html){ target=_blank rel=noopener }

Antes de cada paso usted dice en qué posición va a quedar el elemento que se
inserta, y después lo comprueba. `insertar` recorre la parte ya ordenada hasta
hallar su sitio, y `iSort` la llama una vez por elemento.
