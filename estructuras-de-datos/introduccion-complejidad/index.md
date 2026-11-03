# Ejercicios · Estructuras de Datos · Introducción a la complejidad

Por qué el reloj no sirve para comparar algoritmos y cómo se cuentan las
instrucciones: el cortocircuito de `&&` y `||`, la evaluación que sale del
ciclo, el mejor y el peor caso y los ciclos anidados. Cada enlace abre una
actividad que se trabaja directo en el navegador.

## [cortocircuito](./cortocircuito.html){ target=_blank rel=noopener }

Cuántas veces se evalúa cada lado de `i < n && datos[i] != 0` con y sin un
cero, lo que lee `&` en la última vuelta, tres condiciones unidas con `||` y
el orden de los lados.

## [reloj](./reloj.html){ target=_blank rel=noopener }

Un programa medido con `time` con tres tamaños, tres corridas iguales que no
coinciden, lo que cambia con `-O2` y el conteo de instrucciones con m = 70.

## [cuadrados](./cuadrados.html){ target=_blank rel=noopener }

Un ciclo que arranca en 1 y compara con `<=`: cuántas veces se evalúa la
condición, la tabla de conteo línea por línea y T(m).

## [rango](./rango.html){ target=_blank rel=noopener }

El mayor menos el menor de un arreglo con dos `if` adentro del ciclo: cuatro
entradas del mismo tamaño, cuál es el mejor caso y T en el mejor y el peor.

## [corte](./corte.html){ target=_blank rel=noopener }

La búsqueda del último cero que se detiene al encontrarlo: la traza con dos
ceros, los dos extremos con n = 5, T en términos de n y cuál caso se reporta.

## [parejas](./parejas.html){ target=_blank rel=noopener }

Dos ciclos anidados con tamaños n y m: las evaluaciones del ciclo de adentro,
T(n, m) y lo que pasa si m no crece.
