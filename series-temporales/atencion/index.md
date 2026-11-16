# Ejercicios · Series Temporales · Autoatención y Transformers

La autoatención como una media ponderada de la ventana cuyos pesos se
calculan, la tabla de senos y cosenos que le da el orden, el tamaño de un
Transformer de una capa frente a los 110 meses de la serie y una decisión de
pronóstico para diciembre de 2025. Cada enlace abre una actividad que se
trabaja en el navegador, sin instalar nada.

Cada actividad empieza con la serie de análisis y unas claves que sirven para
el ejercicio de esa página. Después viene una pregunta para responder antes
de tocar nada, sigue con los controles y cierra con la explicación, que
aparece cuando las preguntas quedan resueltas. Cada respuesta muestra su
razón, se acierte o no. La cuenta de la atención, la tabla de posición, los
parámetros, las medias ponderadas y los errores se calculan en la página; los
pesos que aprendió la red y los pronósticos del Transformer y de la regresión
lineal vienen de PyTorch y scikit-learn, con el mismo código del notebook de
la sesión, y se calcularon fuera de la página. Las cifras del *backtest* salen
de la tabla de la sesión.

## Cómo funciona

### [La atención paso a paso](calculo.html){ target=_blank rel=noopener }

Agosto a noviembre de 2024, cada mes con su diferencia y su posición. Usted
mueve cuánto cuentan la diferencia y la posición en la consulta y elige el
mes que consulta; la página muestra la clave, el valor, los puntajes, las
exponenciales, los pesos y la salida, con el mapa de calor de los cuatro
meses. Se trata de calcular un puntaje, un peso y una salida antes de mirar
la tabla, y de ver qué pasa al barajar los meses.

### [La posición y los pesos que aprende la red](posicion.html){ target=_blank rel=noopener }

La tabla de senos y cosenos que se suma a cada mes, paso por paso, y los
pesos de atención del Transformer entrenado hasta noviembre de 2024, con y
sin posición, en la ventana de cada mes de 2024. Se trata de ver qué columnas
llevan la posición, cuánto se alejan los pesos aprendidos de 1/12 y qué pasa
con el pronóstico al barajar la ventana.

## Limitaciones

### [Parámetros contra 110 meses](tamano.html){ target=_blank rel=noopener }

Los parámetros del Transformer pieza por pieza según `d_model`, `nhead` y
`dim_feedforward`, al lado de los otros modelos de la tabla y del MAPE del
*backtest*. Se trata de contar parámetros, de dividirlos por las ventanas de
entrenamiento y de ver qué variante queda mejor.

## Una situación del curso

### [Diciembre de 2025: qué modelo usar](situacion.html){ target=_blank rel=noopener }

En noviembre de 2025 hay que pronosticar diciembre. Se predice cuál de seis
modelos queda más cerca, se comprueba con lo observado y se elige el modelo
del año siguiente con el *backtest*.
