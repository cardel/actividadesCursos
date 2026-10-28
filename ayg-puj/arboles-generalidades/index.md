# Ejercicios · AyG PUJ · Generalidades de los árboles

Cinco ejercicios para el navegador sobre el árbol visto de tres maneras: como grafo conexo y
acíclico, como nodos enlazados con una raíz escogida y como definición que se nombra a sí misma.
Van en el orden en que se construye el tema y de lo más barato de comprobar a lo más laborioso:
primero la cuenta de aristas que decide si un grafo es árbol, después lo que cambia al colgarlo de
un nodo u otro, después una función recursiva llamado por llamado, después los cuatro recorridos y
el camino de vuelta, y de último las ocho búsquedas en amplitud que dan el radio y el diámetro.
Los cinco cuentan. Dos de ellos corren el código Python del tema línea por línea. Ninguno usa
los árboles, los grafos ni los juegos de valores de las diapositivas.

## El árbol como grafo: reconocerlo y contar sus piezas

### [Reconocer un árbol y contar sus piezas](propiedades.html){ target=_blank rel=noopener }

Ocho grafos descritos por su cantidad de vértices, su cantidad de aristas y, en algunos, la
propiedad de ser conexo o acíclico. De cada uno se decide entre cinco veredictos, y cada opción
trae su propia retroalimentación con los números del caso. Dos de los ocho no describen ningún
grafo y uno no se puede decidir con lo que se da, que es lo que distingue una caracterización
suficiente de una que solo cuenta aristas. Después vienen tres grafos dibujados sobre los mismos
ocho vértices, uno árbol, uno con un ciclo y uno partido en dos, donde se cuentan las aristas, las
hojas y los ciclos independientes.

## Cualquier nodo puede ser la raíz

### [El mismo árbol colgado de raíces distintas](raices.html){ target=_blank rel=noopener }

Un árbol libre de ocho vértices y las ocho raíces que admite. Para cada una se predice la altura,
la profundidad de un vértice que cambia de una raíz a otra, y cuáles vértices pasan a ser hojas.
Al comprobar aparece el árbol colgado con la profundidad de cada nodo, y una tabla acumula lo que
cambió en las raíces que ya se probaron. Cuatro de los ocho vértices tienen grado 1, y cuando uno
de ellos es la raíz deja de ser hoja sin perder su única arista: ahí está la excepción que separa
la hoja del grafo de la hoja del árbol con raíz.

## La especificación recursiva

### [Una función recursiva, llamado por llamado](recursion.html){ target=_blank rel=noopener }

`contarNodos` y `altura` sobre tres árboles, con un paso por línea ejecutada y la pila de llamados
a la vista marco por marco. Antes de ejecutar se predice cuántas veces corre la línea del caso
base, que no son ni los $n$ nodos ni los $2n + 1$ llamados. El dibujo marca el subárbol que recibió
el llamado en curso y deja el valor devuelto sobre los nodos que ya resolvieron, de modo que se ve
cómo el resultado se arma de abajo hacia arriba. Uno de los tres árboles es una fila de cinco
nodos, y con él la pila llega tan abajo como el árbol.

## Los recorridos

### [Los cuatro recorridos y el árbol que los produjo](recorridos.html){ target=_blank rel=noopener }

Dos trabajos sobre tres árboles cada uno. En el primero se escriben el preorden, el posorden, el
inorden y el recorrido por niveles, y la retroalimentación dice en qué posición se desvió la
secuencia y qué regla la fija. En el segundo se hace el camino inverso: dados dos recorridos, se
escoge en cada paso la raíz del pedazo del inorden que está marcado, el árbol crece nodo por nodo
y al final aparecen los recorridos que faltaban. Los tres casos usan parejas distintas, preorden
con inorden, posorden con inorden y niveles con inorden, y en los tres la raíz del pedazo se lee
en un lugar diferente del otro recorrido.

## La excentricidad

### [Excentricidad, radio, diámetro y centro](excentricidad.html){ target=_blank rel=noopener }

Tres grafos de ocho vértices y una búsqueda en amplitud que se ejecuta línea por línea desde
cualquiera de ellos, con el arreglo de distancias y la cola a la vista. Con las ocho corridas se
llenan las ocho excentricidades y de ahí salen el radio, el diámetro y el centro, con la
comprobación de que $r \leq d \leq 2r$; en el árbol de los tres esa cota se cumple con igualdad.
El tercer grafo está partido en dos, y ahí la pregunta cambia: qué devuelve `excentricidad` cuando
hay vértices que la amplitud no alcanza, y por qué el $-1$ del arreglo nunca sale como respuesta.

## Para resolver en papel

1. Un grafo acíclico de $n$ vértices y $m$ aristas tiene $n - m$ componentes. Pruébelo por
   inducción sobre $m$ y diga en qué paso se usa que el grafo no tiene ciclos. Después escriba qué
   queda de la fórmula cuando el grafo sí los tiene.

2. En el árbol de ocho vértices de la segunda actividad, la altura toma solo tres valores entre
   las ocho raíces posibles: 2, 3 y 4. Pruebe que dos vértices vecinos nunca dejan alturas que
   difieran en más de uno, y use esa cota para decir cuántos valores distintos puede tomar la
   altura en un árbol de diámetro 6.

3. Escriba `contarVacios(A)`, que devuelve cuántos subárboles vacíos tiene un árbol, con un solo
   `return` y sin librerías. Compruebe con los tres árboles de la tercera actividad que el
   resultado es siempre uno más que la cantidad de nodos, y diga en qué se parece su demostración
   a la de las $n - 1$ aristas.

4. Dos árboles binarios distintos pueden tener el mismo preorden y el mismo posorden. Construya
   dos de tres nodos que lo muestren y diga en qué se diferencian sus inordenes. Después diga por
   qué el inorden con cualquiera de los otros tres recorridos sí determina el árbol, siempre que
   los valores no se repitan.

## Problemas de juez

UVa 615, Is It A Tree?: <https://onlinejudge.org/external/6/615.pdf>, envío en
<https://onlinejudge.org/index.php?option=com_onlinejudge&Itemid=25&page=submit_problem&problemid=556>.

Las aristas llegan dirigidas y los números de los nodos son arbitrarios, así que lo primero es
mapearlos a $0 \ldots n-1$ con un diccionario. Un árbol con raíz, en esa forma, es un grafo donde
exactamente un nodo no recibe ninguna arista, todos los demás reciben una sola y desde la raíz se
llega a todos. La trampa está en los extremos del enunciado: un caso vacío, el que trae solo
`0 0`, es un árbol, y dos árboles sueltos cumplen la cuenta de grados de entrada sin ser un árbol,
de modo que la conexidad hay que comprobarla aparte.

UVa 536, Tree Recovery: <https://onlinejudge.org/external/5/536.pdf>, envío en
<https://onlinejudge.org/index.php?option=com_onlinejudge&Itemid=25&page=submit_problem&problemid=477>.

Es la reconstrucción de la segunda parte del ejercicio de los recorridos, con letras en vez de
números y con el posorden como respuesta. La primera letra del preorden es la raíz, su posición en
el inorden parte el resto en dos, y la recursión recibe los cuatro índices que delimitan los dos
pedazos. Las
letras no se repiten, que es justo lo que hace única la reconstrucción, y la entrada termina en fin
de archivo y no con un centinela.

UVa 112, Tree Summing: <https://onlinejudge.org/external/1/112.pdf>, envío en
<https://onlinejudge.org/index.php?option=com_onlinejudge&Itemid=25&page=submit_problem&problemid=48>.

El árbol llega escrito con la misma gramática del tema, `() | (entero arbol arbol)`, así que la
función que lo lee se escribe igual que las de la tercera actividad: un caso base para `()` y un
caso que lee el entero y se llama dos veces. Dos trampas, y las dos cuestan el envío. Una, que la
expresión puede venir repartida en varias líneas, de modo que hay que leer por símbolos y no por
líneas. Otra, que una hoja es un nodo con sus dos subárboles vacíos: un nodo con un solo hijo no es
hoja, y el camino que termina ahí no cuenta aunque sume lo pedido.
