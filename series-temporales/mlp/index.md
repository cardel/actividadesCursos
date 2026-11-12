# Ejercicios · Series Temporales · El perceptrón multicapa

Una red con una capa oculta, escrita en PyTorch, que pronostica la diferencia
con hace 12 meses a partir de la serie como tabla: cómo cambian sus curvas de
pérdida con el tamaño de la capa y la tasa de aprendizaje, y qué le pasa al
pronóstico de 2025 cuando entrena de más o cuando no se invierte el escalado.
Cada enlace abre una actividad que se trabaja en el navegador, sin instalar
nada.

Cada actividad empieza con la serie de análisis y unas claves que sirven para
el ejercicio de esa página. Después viene una pregunta para responder antes
de tocar nada, sigue con los controles y cierra con la explicación, que
aparece cuando las preguntas quedan resueltas, y un ejercicio abierto. Cada
respuesta muestra su razón, se acierte o no. El MAE se calcula en la página;
las curvas y los pronósticos vienen de PyTorch, con el mismo código del
notebook de la sesión, y se calcularon fuera de la página para cada posición
de los controles.

## Entrenamiento

### [Capa oculta y tasa de aprendizaje](capa.html){ target=_blank rel=noopener }

`ocultas` de 0 a 64 y `tasa` de 0,001 a 0,03, con las curvas de pérdida de
entrenamiento y de validación de 300 épocas sin parada temprana y la época
de menor validación marcada. Se trata de ver con qué tasa sube antes la
validación, qué tamaño la deja más baja y qué hace la red sin capa oculta.

## Pronóstico

### [Épocas y escala](epocas.html){ target=_blank rel=noopener }

De 5 a 500 épocas sin parada temprana, con el pronóstico de 2025 contra lo
observado y su MAE, y una casilla para invertir o no el escalado. Se trata de
ver si más épocas dan mejor pronóstico y qué mide un MAE calculado sobre la
salida de la red sin devolverla a pasajeros.
