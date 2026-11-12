# Ejercicios · Series Temporales · Redes recurrentes

La serie convertida en ventanas de doce meses, una RNN y una LSTM de PyTorch
que las leen en orden, y la prueba de barajar el orden de la entrada,
pronosticando 2025 mes a mes sobre la diferencia con hace 12 meses. Cada enlace
abre una actividad que se trabaja en el navegador, sin instalar nada.

Cada actividad empieza con la serie de análisis y unas claves que sirven para
el ejercicio de esa página. Después viene una pregunta para responder antes
de tocar nada, sigue con los controles y cierra con la explicación, que
aparece cuando las preguntas quedan resueltas. Cada respuesta muestra su
razón, se acierte o no. La ventana y el MAE se calculan en la página; los
pronósticos vienen de PyTorch, con el mismo código del notebook de la sesión,
y se calcularon fuera de la página para cada posición de los controles. Las
cifras del *backtest* que citan las preguntas salen de la tabla de la sesión.

## Ventanas

### [La ventana de un mes](ventana.html){ target=_blank rel=noopener }

Un control que recorre los meses de la serie, con los doce meses anteriores
resaltados en la gráfica y el tensor (12, 1) de la diferencia en una tabla,
junto a su objetivo. Se trata de ver cuántas ventanas da la serie, cuántos
valores comparten dos ventanas seguidas y en cuántas entra un mes atípico.

## Recurrentes

### [Ventana y memoria](memoria.html){ target=_blank rel=noopener }

Una RNN o una LSTM con ventanas de 3, 6, 12 o 24 meses y de 8 a 64 neuronas,
con el pronóstico de 2025 contra lo observado, su MAE y la validación mínima.
Se trata de ver con cuántos pasos la RNN queda detrás de la LSTM y qué pasa
con 8 neuronas.

### [Barajar](barajar.html){ target=_blank rel=noopener }

El MLP y la LSTM con la entrada en orden y barajada, cada uno promediando
cinco semillas. Se trata de ver cuál de los dos cambia al barajar y cuál de
los cambios se deshace moviendo los pesos.
