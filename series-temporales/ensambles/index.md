# Ejercicios · Series Temporales · Ensambles de árboles

Un árbol de regresión con sus dos frenos, un Random Forest que promedia
árboles y XGBoost, que los suma uno tras otro, pronosticando 2025 mes a mes
sobre la diferencia con hace 12 meses. Cada enlace abre una actividad que se
trabaja en el navegador, sin instalar nada.

Cada actividad empieza con la serie de análisis y unas claves que sirven para
el ejercicio de esa página. Después viene una pregunta para responder antes
de tocar nada, sigue con los controles y cierra con la explicación, que
aparece cuando las preguntas quedan resueltas. Cada respuesta muestra su
razón, se acierte o no. El MAE y el máximo del entrenamiento se calculan en
la página; los pronósticos vienen de scikit-learn y de xgboost, con el mismo
código del notebook de la sesión, y se calcularon fuera de la página para
cada posición de los controles. El MAE del *backtest* que citan las
preguntas sale de la tabla de la sesión.

## Bosques

### [Un árbol o un bosque](arbol.html){ target=_blank rel=noopener }

`max_depth` de 1 a 10 o sin límite, `min_samples_leaf` de 1, 2, 5 o 10, y un
Random Forest con esos frenos y de 10 a 300 árboles. La página muestra el
pronóstico de 2025 contra lo observado, su MAE y la línea del mes más alto
del entrenamiento. Se trata de ver desde qué profundidad el árbol deja de
repetir la pandemia en 2025 y cuánto baja el MAE del bosque de 10 a 300
árboles.

## Potenciación

### [Tasa, árboles y profundidad de XGBoost](xgboost.html){ target=_blank rel=noopener }

`learning_rate` de 0,01 a 0,5, `n_estimators` de 25 a 300 y `max_depth` de 1
a 8, uno a la vez desde los valores por defecto, con el pronóstico de 2025 y
su MAE. Se trata de ver cuántos árboles necesita una tasa de 0,01 para
alcanzar la serie, y por qué XGBoost por defecto tiene un MAE bajo en 2025 y
aun así queda detrás del estacional ingenuo en el *backtest*.
