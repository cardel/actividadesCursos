# Ejercicios · PFC · Ordenamiento y alto orden

Once ejercicios para recorrer en el navegador, en el orden de la sesión:
primero las tuplas, con lo que guardan y con lo que permiten escribir; después
el ordenamiento por mezclas, y al final las funciones que ya traen el recorrido
hecho. Ninguno muestra nada antes de que usted produzca algo: hay trazas que
se llenan paso a paso, valores que hay que predecir antes de verlos y
patrones entre los que hay que escoger. Lo que se compara en cada caso salió
de correr el código de la sesión.

Lo que cambia frente a los ejercicios de listas es quién escribe el recorrido.
Allá lo escribía usted con recursión; aquí lo traen `map`, `filter` y `fold`,
y queda por decidir cuál de los tres sirve para cada cosa.

## Tuplas

### [tuplas](tuplas.html){ target=_blank rel=noopener }

Trece preguntas sobre una pareja y un triple: qué devuelve cada expresión, de
qué tipo es y cuáles de cuatro declaraciones compilan. Las tres que no compilan
traen lo que contesta el compilador, copiado de la corrida. El tamaño forma
parte del tipo, y de ahí salen las dos cosas que más sorprenden: que `_3` no
exista en una pareja y que un patrón de dos nombres no sirva para un triple.

## Tuplas en reconocimiento de patrones

### [sumarVec](sumarVec.html){ target=_blank rel=noopener }

La suma de dos vectores se puede escribir sin tuplas, y queda larga. Con
`(u, v) match` los dos recorridos avanzan a la vez y cada caso dice qué hacer
con un par: dos listas vacías, dos con cabeza, o una de cada clase, que es el
error de tamaños distintos.

## Ordenamiento por mezclas

### [msort](msort.html){ target=_blank rel=noopener }

El árbol de llamadas se recorre por niveles: baja partiendo la lista por la
mitad y sube mezclando. La frontera entre las tres cosas que hace la función
queda marcada en el código, y es la misma frontera del ejercicio de la tarde.

### [merge](merge.html){ target=_blank rel=noopener }

`merge` aislada, suponiendo que las dos listas llegan ordenadas. En cada paso
usted elige qué cabeza sale, y el historial va armando la cadena de `::` que
devuelve la función. Si se equivoca, el mensaje dice qué comparación mandaba.

### [polimorfico](polimorfico.html){ target=_blank rel=noopener }

Qué hay que cambiar para que `msort` sirva con cualquier tipo, y qué se rompe
si falta la función de comparación o si la llamada recursiva no la vuelve a
pasar. Con `x > y` en lugar de `x < y`, la misma función ordena al revés.

## Map y filter

### [mapFilter](mapFilter.html){ target=_blank rel=noopener }

Con la misma lista de entrada se predice qué devuelve `map` y qué devuelve
`filter`. La diferencia que queda a la vista es la longitud: `map` transforma
cada elemento y conserva cuántos hay, `filter` conserva los elementos y cambia
cuántos quedan.

### [variaciones](variaciones.html){ target=_blank rel=noopener }

Las cinco funciones emparentadas con `filter`, sobre la misma lista y con el
mismo predicado. Además del resultado hay que decir a cuántos elementos se les
llegó a aplicar el predicado, y ahí se parten en dos familias: las que recorren
la lista entera y las que se detienen en el primero que no cumple. `dropWhile`
devuelve cuatro elementos habiendo mirado tres.

### [empaquetar](empaquetar.html){ target=_blank rel=noopener }

`empaquetar` agrupa los elementos iguales que están seguidos, y para eso parte
la lista con `span` en cada vuelta. La traza muestra el grupo que se está
cerrando y lo que queda por recorrer.

### [codificar](codificar.html){ target=_blank rel=noopener }

`empaquetar`, `map` y una tupla, en ese orden. Primero se predice cuántos pares
salen, que es el número de grupos y no el de elementos distintos: en
`List(1, 1, 2, 1, 1, 1)` el 1 abre dos grupos separados por el 2 y deja dos
pares. Las tres opciones equivocadas son lo que devuelven tres funciones
parecidas.

## Reduce y fold

### [reduceFold](reduceFold.html){ target=_blank rel=noopener }

Ocho preguntas sobre lo que más se enreda: con qué asociatividad acumula cada
uno. `reduceLeft` y `reduceRight` dan resultados distintos con la resta, y
`reduce` sobre la lista vacía falla, que es justo la razón de que `fold` pida
un valor inicial.

### [reversaFold](reversaFold.html){ target=_blank rel=noopener }

La misma inversión del principio, ahora con `foldLeft` y sin recursión
escrita a mano. El acumulador crece por el frente, y esa es toda la diferencia
que hace falta para que la lista salga al revés.
