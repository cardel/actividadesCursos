# Ejercicios · Series Temporales · Redes convolucionales e híbridos

Un filtro de tres pesos que recorre la ventana de doce meses, la red
convolucional que aprende esos pesos y un híbrido que suma al SARIMA una red
entrenada sobre su residuo, pronosticando 2025 sobre la diferencia con hace 12
meses. Cada enlace abre una actividad que se trabaja en el navegador, sin
instalar nada.

Cada actividad empieza con la serie de análisis y unas claves que sirven para
el ejercicio de esa página. Después viene una pregunta para responder antes
de tocar nada, sigue con los controles y cierra con la explicación, que
aparece cuando las preguntas quedan resueltas. Cada respuesta muestra su
razón, se acierte o no. Las ventanas, los mapas, las sumas, la
autocorrelación y el MAE se calculan en la página; los pronósticos y los
residuos del SARIMA vienen de statsmodels y PyTorch, con el mismo código del
notebook de la sesión, y se calcularon fuera de la página. Las cifras del
*backtest* salen de la tabla de la sesión.

## Cómo funcionan

### [El filtro paso a paso](filtro.html){ target=_blank rel=noopener }

La cuenta de un filtro de tres pesos sobre la ventana de enero o de marzo de
2025: en cada posición multiplica, suma y deja una casilla del mapa. Con los
pesos de la media de tres meses, del cambio en dos meses y del último mes se
trata de ver cuántas casillas tiene el mapa, dónde aparece una caída cuando la
ventana se corre y qué cambia con el paso. Cierra con un filtro que aprende
solo los pesos de la media y con una tabla de ventajas y limitaciones.

### [El híbrido paso a paso](hibrido.html){ target=_blank rel=noopener }

El SARIMA de la sesión 5, sus residuos y el MLP que los pronostica, sumados
mes a mes en 2025 junto a lo observado. Se trata de ver por qué se quitan los
residuos de arranque, cuánto del error del SARIMA corrige la red y por qué
corrige tan poco.

## Una situación del curso

### [Sobre qué modelo vale un híbrido](situacion.html){ target=_blank rel=noopener }

El residuo del estacional ingenuo, del SARIMA y de la regresión lineal sobre la
diferencia, con su correlograma. Se trata de predecir cuál guarda patrón,
comprobarlo y decidir con esa cifra cuándo vale la pena poner una red encima
de un modelo base.

## Convolucionales

### [Núcleo y filtros](nucleo.html){ target=_blank rel=noopener }

Una `Conv1d` con núcleos de 3, 6 y 12 meses y de 1 a 16 filtros, con el
pronóstico de 2025, la validación mínima, los parámetros y el MAPE del
*backtest*. Se trata de contar parámetros y de ver por qué la casilla de menor
MAPE no se escoge mirando la prueba.
