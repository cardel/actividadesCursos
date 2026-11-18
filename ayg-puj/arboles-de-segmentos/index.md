# Ejercicios · AyG PUJ · Árboles de segmentos

Cinco ejercicios para el navegador, uno por tema de la sesión y en el mismo orden. Tres de ellos
corren el código Python de la sesión línea por línea, con el árbol dibujado al lado.

Ninguno usa el arreglo de las diapositivas ni sus consultas: otros valores, otros rangos y otra
posición que cambia.

## Qué es y cómo se construye

### [La construcción, vértice por vértice](construir.html){ target=_blank rel=noopener }

`build_rec` sobre tres arreglos, de 4, 6 y 8 posiciones. El árbol se llena de abajo hacia arriba y
al lado quedan las `4 * N` casillas reservadas, con las que nadie escribe en rojo.

Antes de arrancar se predice cuántas casillas reciben un valor y qué queda en el hijo derecho de la
raíz. El arreglo de 6 muestra por qué la reserva no puede ser `2 * N`: el índice mayor que se toca
es el 12 y el árbol solo tiene 11 vértices.

## La consulta y sus tres casos

### [La consulta y sus tres casos](consulta.html){ target=_blank rel=noopener }

Un árbol construido una vez y cinco rangos. Cada vértice se pinta con el caso que le tocó: azul el
que se abre, verde el que devuelve su valor, ámbar el que se descarta, y en gris punteado lo que
nadie llega a mirar.

Las cinco preguntas del final van de la consulta por el arreglo entero, que mira un solo vértice, al
rango que abre 11 de los 15. La tabla de aportes arma la suma con los vértices que respondieron sin
bajar.

## La actualización por posición

### [La actualización sube por los ancestros](actualizar.html){ target=_blank rel=noopener }

Cuatro cambios sobre el mismo arreglo, uno de ellos hacia abajo. La rama queda en morado con el
valor de antes y el de después en cada vértice, y la tabla muestra que la diferencia es la misma en
toda la rama.

Antes se predice en qué queda la raíz y cuántas casillas cambian. Las opciones separan los dos
errores de siempre: sumar el valor nuevo sin quitar el viejo y escribir solo la hoja.

## Qué gana y qué cuesta

### [Tres formas de contestar lo mismo](tres-formas.html){ target=_blank rel=noopener }

El mismo reparto de consultas y cambios, resuelto recorriendo el arreglo, con un arreglo de
prefijos y con el árbol. Se escogen el tamaño y el reparto, y la página cuenta casillas: con 1 024
posiciones y 1 000 consultas el árbol le gana al prefijo desde 51 cambios, y con 16 posiciones y esas
mismas consultas no le gana con ningún número de cambios.

Las cinco preguntas del final son las limitaciones: qué guarda un vértice si la consulta pide el
mínimo, el promedio y la mediana, por qué la resta no sirve y qué compra la memoria de más.

## El problema de la sesión

### [Potenciómetros, UVa 12086](potenciometros.html){ target=_blank rel=noopener }

Una fila de resistencias, la acción `S` que pone una y la acción `M` que mide un tramo. Corre una
sesión de seis acciones: cada medida se predice antes de verla y cada cambio muestra la rama que
reescribe.

Los números equivocados de cada medida son los tres que de verdad se dan: no restar uno, restarlo
solo a un extremo y medir sobre el árbol de antes del último cambio.

## Para resolver en papel

1. Dibuje el árbol de `[5, 2, 8, 1, 4, 6, 3, 7, 9, 2, 5]` con el índice de cada vértice y su
   segmento. Diga cuál es el índice mayor que se toca, cuáles quedan sin usar por debajo de él y si
   una reserva de `2 * N` casillas habría alcanzado.

2. Demuestre que `build_rec` escribe exactamente $2N - 1$ casillas, con la estructura de cuatro
   partes: teorema, estrategia, desarrollo y conclusión. La inducción va sobre el largo del segmento
   y el caso base es el segmento de una sola posición.

3. Sobre un arreglo de 16 posiciones, encuentre el rango que más vértices abre y cuente cuántos
   visita en total. Después argumente cuántos vértices pueden quedar en caso contenido en un mismo
   nivel, y por qué no pueden ser tres.

4. UVa 12086, Potentiometers: `https://vjudge.net/problem/UVA-12086`. Es el árbol de la sesión sin
   nada encima, con `update` para la acción `S` y `query` para la `M`. Dos trampas: las resistencias
   vienen numeradas desde 1, así que a los dos extremos hay que restarles uno, y la salida lleva una
   línea en blanco entre casos pero no antes del primero. La página pide cuenta para ver el
   enunciado y para enviar.
