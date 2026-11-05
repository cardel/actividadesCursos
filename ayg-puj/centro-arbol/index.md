# Ejercicios · AyG PUJ · El centro de un árbol

Cinco ejercicios para el navegador sobre el centro, el radio y el diámetro de un árbol calculados
sin mirar una sola excentricidad. Van en el orden del tema: primero el descarte local que hace
innecesaria la cuenta global, después el teorema que permite repetirlo, después el algoritmo línea
por línea, después la traducción de vueltas a radio y a diámetro, y de último los cambios que lo
rompen. Los cinco cuentan. Ninguno usa los árboles ni los juegos de valores de las diapositivas.

## Una hoja nunca es el centro

### [Quién no puede ser el centro](hojas.html){ target=_blank rel=noopener }

Un árbol de nueve vértices donde primero se descartan candidatos sin calcular nada. Marcar un
vértice que no es hoja o dejar una hoja sin marcar trae su propia explicación con los grados del
caso. Después se da la excentricidad de un vecino y se pide la de la hoja, que es la cuenta
$\varepsilon(\ell) = 1 + \varepsilon(p)$ aplicada en concreto, y cada hoja del árbol sirve de
ronda nueva. Al final aparecen las nueve excentricidades para comparar el descarte con el cálculo.

## El teorema del centro

### [Qué le pasa a cada excentricidad al pelar una capa](teorema.html){ target=_blank rel=noopener }

Un árbol de diez vértices con sus excentricidades a la vista. Se quitan de un golpe las cuatro
hojas y se pide predecir, casilla por casilla, la excentricidad que tendrá cada uno de los seis
sobrevivientes. Las respuestas equivocadas distinguen tres confusiones: dejar el valor viejo,
bajarlo dos y bajarlo donde no corresponde. Al comprobar la fila completa queda a la vista que
todas bajaron exactamente uno, que el radio bajó con ellas y que el centro no se movió.

## El algoritmo de pelar hojas

### [Pelar capas de hojas, línea por línea](pelado.html){ target=_blank rel=noopener }

El código de la sesión corriendo paso a paso sobre dos árboles, uno de doce vértices y otro de
ocho. Cada vértice lleva encima su grado en lo que sigue vivo, el naranja marca la capa que se
está yendo y el gris lo que ya se fue. Antes de arrancar se predice cuántas vueltas dará el ciclo,
y la retroalimentación separa las vueltas del radio y de la cantidad de capas. El árbol de doce
termina con dos centros y el de ocho con uno, de modo que las dos formas de cerrar la cuenta
aparecen en el mismo ejercicio.

## De las vueltas al radio y al diámetro

### [De las vueltas al radio y al diámetro](vueltas.html){ target=_blank rel=noopener }

Cuatro árboles: un camino de seis, una estrella de siete, una oruga de diez y un binario completo
de siete. De cada uno se predicen cuatro cifras antes de pelar nada, y la tabla del final se va
llenando con los que ya quedaron bien, incluida la columna que dice si las vueltas coincidieron
con el radio. Dos de los cuatro terminan con dos centros y dos con uno, que es justo donde la
coincidencia se rompe.

## Errores comunes

### [Cuatro formas de romper el pelado](errores.html){ target=_blank rel=noopener }

Cuatro versiones cambiadas del algoritmo, una por pregunta: la condición de parada en $|V| > 1$,
los vértices nuevos agregados a la capa que se está recorriendo, el mismo código sobre un grafo
con un ciclo y las vueltas leídas como el radio. Cada pregunta trae el árbol más pequeño donde el
cambio se nota, y cada opción su propia explicación.
