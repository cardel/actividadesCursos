# Ejercicios · Series Temporales · Validación temporal

Elegir los hiperparámetros de un modelo sin mirar los meses de prueba:
los pliegues de `TimeSeriesSplit` sobre la tabla de búsqueda y una rejilla
de profundidad y tasa de XGBoost con su MAE de validación y de *backtest*.
Cada enlace abre una actividad que se trabaja en el navegador, sin instalar
nada.

Cada actividad empieza con la serie de análisis y unas claves que sirven para
el ejercicio de esa página. Después viene una pregunta para responder antes
de tocar nada, sigue con los controles y cierra con la explicación, que
aparece cuando las preguntas quedan resueltas. Cada respuesta muestra su
razón, se acierte o no. Los pliegues y los meses de cada medida se calculan
en la página. Los dos MAE de cada pareja de la rejilla vienen de
scikit-learn y de xgboost, con el mismo código del notebook de la sesión, y
se calcularon fuera de la página.

## Pliegues

### [Los pliegues de TimeSeriesSplit](pliegues.html){ target=_blank rel=noopener }

`n_splits` de 2 a 8, `test_size` de 3 a 12 y `gap` de 0 a 6 sobre las 62
filas de la tabla de búsqueda, con una fila por pliegue: los meses con que
entrena, los que valida y los que quedan sin usar. Se trata de ver cuándo
el primer pliegue entrena con menos de 24 filas y qué meses quedan sin usar
con `gap=2`. Si la combinación no cabe en la tabla, la página lo dice.

## Rejilla

### [Validación frente a backtest](rejilla.html){ target=_blank rel=noopener }

`max_depth` de 1 a 8 y `learning_rate` de 0,02 a 0,5 en XGBoost con 100
árboles, con dos barras: el MAE de validación y el del *backtest*, y la línea
del estacional ingenuo. Se trata de ver si la pareja con menor validación es
la de menor *backtest* y por qué la barra de validación sale más larga.
