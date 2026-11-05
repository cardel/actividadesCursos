# Ejercicios · PFC · Colecciones: mapas y flujos

Seis ejercicios para recorrer en el navegador, en el orden en que se presentan
los temas. Ninguno muestra nada antes de que usted produzca algo: hay valores
que hay que predecir antes de verlos, trazas que avanzan un paso cada vez y
opciones entre las que hay que escoger, y cada opción equivocada dice en qué
consiste la confusión. Todo lo que se afirma salió de correr el código con
Scala 2.13.11, la versión del curso.

Dos ideas los atraviesan. Una, que un `Map` asocia claves con valores y a la
vez es una colección de parejas y una función, de modo que lo que ya sabe
hacer sobre listas también sirve aquí. Otra, que una colección no tiene por
qué estar calculada para poder usarse: si la cola se evalúa por demanda, una
secuencia infinita cabe en memoria y un algoritmo que nunca termina entrega
resultados.

## Consultas con for

### [consultasLibros](consultasLibros.html){ target=_blank rel=noopener }

Cuatro consultas sobre una base de libros con el mismo molde y distinto
filtro, hasta que una necesita dos generadores y empieza a producir
repetidos. Incluye la salida que se lee mal: la lista de autores repetidos
parece traer cuatro elementos y trae dos, porque cada cadena lleva una coma
adentro y la lista separa con coma.

La traducción de una expresión `for` a su cadena de `map`, `flatMap` y
`withFilter` tiene su propio ejercicio, en
[otro tema](../colecciones-secuencias-y-conjuntos/traducir.html){ target=_blank rel=noopener }.

## Mapas

### [mapas](mapas.html){ target=_blank rel=noopener }

El `Map` como asociación y como función: construirlo, aplicarlo a una clave,
lo que pasa cuando la clave no está, y las dos formas de evitar la excepción.
Termina con un mapa de cinco entradas que no se imprime como `Map` ni en el
orden en que se escribió.

### [parejas](parejas.html){ target=_blank rel=noopener }

Por qué sobre un `Map` funcionan `map`, `filter` y `for`: es un iterable de
parejas. Invertirlo con reconocimiento de patrones, agrupar y contar, y la
diferencia entre lo que devuelven `keys` y `values`, que no son del mismo
tipo aunque lo parezcan.

## Evaluación perezosa

### [perezoso](perezoso.html){ target=_blank rel=noopener }

Qué cuesta filtrar un rango entero para quedarse con un elemento, y qué
cambia cuando la cola se calcula por demanda. Incluye un flujo de dos
elementos escritos a mano que se imprime sin haber calculado ninguno.

### [infinitos](infinitos.html){ target=_blank rel=noopener }

Una secuencia sin final y qué parte de ella se materializa al pedir un
índice. Cierra con la sucesión de Fibonacci definida en términos de sí misma
y con el error que da esa definición cuando se escribe en el lugar
equivocado.

## La criba de Eratóstenes

### [criba](criba.html){ target=_blank rel=noopener }

El algoritmo sobre un flujo infinito, con la traza avanzando un paso cada
vez: cuál es la cabeza, qué filtro se aplica y qué queda en la cola. El
cierre es por qué un proceso que no termina alcanza a entregar los primeros
primos.
