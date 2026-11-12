# Ejercicios · AyG PUJ · Árboles de cubrimiento mínimo

Cinco ejercicios para el navegador, uno por tema de la sesión y en el mismo orden. Dos de
ellos corren el código Python de la sesión línea por línea.

Ninguno usa los grafos de las diapositivas ni los de sus ejercicios propuestos: otros
vértices, otros pesos y otras raíces.

## Conectar al menor costo

### [Armar un árbol a mano](tanteo.html){ target=_blank rel=noopener }

Dos grafos con pesos, uno de cinco barrios y otro de ocho. Los tendidos se escogen con un
clic y el que cierra un ciclo queda rechazado, diciendo qué barrios ya estaban juntos.

Al completar la selección aparece el peso que quedó frente al mínimo, y cuántos árboles de
cubrimiento tenía el grafo.

## La propiedad de corte

### [La arista ligera de un corte](corte.html){ target=_blank rel=noopener }

Cuatro rondas sobre un mismo grafo de ocho vértices, cambiando S en cada una. Se escoge la
arista ligera del corte y al contestar el dibujo pinta cuáles cruzan.

Las opciones separan tres confusiones: una arista barata que no cruza, una que cruza y no es
la más barata, y la más barata del grafo entero. La última ronda tiene un empate.

## El algoritmo de Kruskal

### [Kruskal línea por línea](kruskal.html){ target=_blank rel=noopener }

`kruskal` paso a paso sobre dos grafos, con la lista ordenada a la vista, el arreglo `p` de
los conjuntos disjuntos y los pedazos de cada momento.

Antes de arrancar se predice cuántas aristas se descartan y en qué puesto se completa el
árbol. Las que entran quedan verdes y las descartadas, grises punteadas.

## El algoritmo de Prim

### [Prim línea por línea](prim.html){ target=_blank rel=noopener }

`prim` paso a paso desde la raíz que se escoja, con la tabla de `clave` y `padre`, los
vértices del árbol marcados y el borde resaltado. Antes se predice el orden de entrada.

Una tarjeta aparte corre el mismo grafo con `prim_cola` y muestra las parejas que salen de la
cola y se descartan por viejas.

## Cuál de los dos

### [Decidir sin correr el algoritmo](cual.html){ target=_blank rel=noopener }

Diez preguntas sin traza: sumar una constante a los pesos, duplicarlos, pesos negativos,
pesos repetidos, un grafo que no es conexo, aristas que ya llegan ordenadas, denso contra
ralo, el árbol de cubrimiento máximo y el camino más corto entre dos vértices.

Cada opción responde con su propia explicación.

## Para resolver en papel

1. En el grafo de ocho vértices de la actividad de Kruskal, escriba la lista ordenada y marque
   las tres que se descartan. Para cada arista que entra, diga de qué corte es la ligera.

2. Corra Prim sobre el grafo en anillo desde la raíz 3 y escriba la tabla de `clave` y `padre`
   después de cada extracción. Compruebe que el peso es el mismo que desde la raíz 0.

3. UVa 11631, Dark roads: <https://vjudge.net/problem/UVA-11631>. La respuesta es la suma de
   todos los pesos menos el peso del árbol mínimo. En el grafo de ocho vértices de la actividad
   de Kruskal las trece calles suman 91 y el árbol pesa 31: diga cuánto se ahorra por noche y
   cuántas calles quedan apagadas. La página pide cuenta para ver el enunciado y para enviar.

4. Demuestre que una arista que pesa más que todas las demás de algún ciclo no está en ningún
   árbol de cubrimiento mínimo. Sirve el intercambio del teorema 23.1: tome un árbol que la
   contenga y construya uno más barato.
