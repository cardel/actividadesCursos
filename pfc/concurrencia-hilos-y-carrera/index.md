# Ejercicios · PFC · Concurrencia: hilos, carrera y speedup

Cinco ejercicios para recorrer en el navegador, en el orden en que se
presentan los temas. Ninguno muestra nada antes de que usted produzca algo:
hay números que hay que predecir antes de verlos, trazas cuyas filas aparecen
al acertarlas y opciones entre las que hay que escoger, y cada opción
equivocada dice en qué consiste la confusión.

Dos ideas los atraviesan. Una, que con dos hilos lo que se ejecuta es una
mezcla de las dos secuencias y el planificador decide cuál, de modo que el
programa tiene tantas trazas como mezclas posibles. Otra, que el estado
mutable compartido es lo que convierte esa variedad en un error: si dos hilos
leen el mismo dato antes de que alguno escriba, los dos trabajan con un valor
viejo.

El código es el de la sesión. Las intercalaciones y los valores finales que
aparecen en las páginas se generan corriendo la mezcla de las dos secuencias,
no están escritos a mano, y los tiempos son los que reporta la sesión al
sumar diez millones de enteros en una máquina de cuatro núcleos.

## Paralelismo, concurrencia e hilos

### [hilos](hilos.html){ target=_blank rel=noopener }

Los dos conceptos que se confunden y el reparto de la memoria. Un servidor de
un solo núcleo que atiende cuatro conexiones por turnos sirve para separarlos,
y el mapa de pilas y heap para decidir qué alcanza a tocar un hilo. Termina con
los dos mensajes con que se maneja un hilo, `start` y `join`, y con la
garantía de visibilidad que trae el segundo.

## Intercalación y no determinismo

### [intercalaciones](intercalaciones.html){ target=_blank rel=noopener }

Un programa con un hilo y un `join` admite tres salidas distintas, y sin el
`join` admite cuatro. La página pide el número antes de mostrarlas, propone
seis candidatas para decidir si cada una puede ocurrir, y cierra con lo que el
`join` ordena y lo que deja sin decidir. Veinte corridas con la misma salida no
prueban nada, y ahí está el punto.

## Condiciones de carrera

### [carrera](carrera.html){ target=_blank rel=noopener }

El generador de identificadores con un contador compartido, que la sesión
muestra para no escribirlo. La traza de los dos hilos avanza fila por fila
hasta el paso en que los dos retornan el mismo valor, y de ahí salen la
atomicidad, lo que el cerrojo quita y lo que no, y la razón por la que el
estilo funcional no necesita cerrojo.

### [valorFinal](valorFinal.html){ target=_blank rel=noopener }

Dos hilos que suman 1 y 10 sobre la misma variable. Seis intercalaciones, tres
valores posibles, y cada valor final delata qué lectura llegó primero y qué
escritura quedó encima. Las dos cuentas se piden por separado porque no dan el
mismo número.

## Midiendo el beneficio

### [speedup](speedup.html){ target=_blank rel=noopener }

El cociente entre el tiempo secuencial y el paralelo, calculado sobre los
tiempos de la sesión. Incluye las lecturas que se prestan a confusión: qué
significa un speedup de 1, qué pasó cuando baja de 1, y de dónde sale la
pérdida que separa el 2,80 medido del 4 que se esperaba con cuatro núcleos.
