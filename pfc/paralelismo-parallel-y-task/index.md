# Ejercicios · PFC · parallel, task y el umbral

Cuatro ejercicios para recorrer en el navegador, en el orden en que se
presentan los temas. Hay números que hay que predecir antes de verlos, un
recorrido que avanza paso a paso con los contadores de cada línea a la vista, y
opciones con retroalimentación por cada distractor.

Lo que une a los cuatro es que el paralelismo deja de escribirse con `start`,
`join` y `var`. `parallel` recibe dos expresiones sin evaluar y devuelve la
pareja de sus valores; `task` convierte un cálculo en un valor de primera clase
que se guarda y se espera cuando convenga. Con eso, el código paralelo se
parece al secuencial y el no determinismo de la sesión anterior desaparece,
porque no queda estado mutable que dos hilos puedan tocar.

El código es el de la sesión. Los recorridos del árbol de llamadas se generan
corriendo la misma recursión con los parámetros de cada preset, así que las
hojas y las llamadas a `parallel` que se cuentan son las que produce el
código; los tiempos de la estimación de pi son los que reporta la sesión en
una máquina de cuatro núcleos.

## La abstracción parallel

### [porNombre](porNombre.html){ target=_blank rel=noopener }

El contrato de `parallel` y el detalle de la firma que decide si hay
paralelismo: los dos caracteres que preceden al tipo de cada parámetro. Incluye
el caso de dos tareas desiguales, donde el tiempo no se parte por la mitad
sino que lo pone la más lenta, y la cuenta de cuántas veces se evalúa una
expresión que llegó por nombre y se menciona dos veces.

## Divide y vencerás con umbral

### [umbral](umbral.html){ target=_blank rel=noopener }

El árbol de llamadas de `segmentRec`, recorrido paso a paso, con un contador
por línea que cuenta las sumas secuenciales y las llamadas a `parallel`. La
condición del umbral es estricta, así que un segmento que mide exactamente el
umbral todavía se parte, y con `UMBRAL = 1` la recursión no llega a un
segmento más pequeño y no termina.

## La abstracción task

### [task](task.html){ target=_blank rel=noopener }

Lanzar un cálculo es barato y esperarlo es lo que cuesta, de modo que el sitio
del `join` decide la ganancia. Dos cuentas de tiempo sobre la norma con cuatro
tareas, una con los `join` al final y otra con cada `join` pegado a su `task`,
y tres formas de escribir `parallel` con `task` de las que solo dos
paralelizan.

## Estimar pi con Monte Carlo

### [montecarlo](montecarlo.html){ target=_blank rel=noopener }

Cuatro tareas, ningún `synchronized` y ningún `var`. La página pide el tamaño
del cuarto pedazo con `iter = 10`, que no es el de los otros tres, y revisa por
qué dos invocaciones paralelas no se estorban aunque cada una use un objeto
mutable por dentro. Cierra con el speedup, más cerca del ideal que el de la
suma del arreglo, y con la razón de esa diferencia.
