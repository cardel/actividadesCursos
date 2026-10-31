# Ejercicios · Series Temporales · La serie como tabla

La serie convertida en tabla de rezagos, mes del año y media móvil, y tres
modelos de scikit-learn que la usan para pronosticar 2025 mes a mes: KNN, SVR
y un árbol de regresión o un Random Forest. Cada enlace abre una actividad
que se trabaja en el navegador, sin instalar nada.

Cada actividad empieza con la serie de análisis y unas claves que sirven para
el ejercicio de esa página. Después viene una pregunta para responder antes
de tocar nada, sigue con un control que se mueve y cierra con la
explicación, que aparece cuando las preguntas quedan resueltas. Cada
respuesta muestra su razón, se acierte o no. Los pronósticos son la
excepción a la regla de calcular todo en la página: vienen de scikit-learn,
con el mismo código del notebook de la sesión, y se calcularon fuera de la
página para cada posición de los controles.

## Vecinos

### [Los vecinos de KNN](knn.html){ target=_blank rel=noopener }

k de 1 a 15 y el objetivo, el nivel o la diferencia con hace 12 meses. La
página muestra el pronóstico de 2025, su MAE y los meses que KNN escogió como
vecinos de enero, con los de 2020 y 2021 en rojo. Se trata de ver desde qué
k dejan de mandar los vecinos de la pandemia y por qué, sobre el nivel, el
pronóstico nunca pasa el mes más alto del entrenamiento.

## Márgenes

### [C, epsilon y el escalador de SVR](svr.html){ target=_blank rel=noopener }

Diecisiete valores de C entre 0,01 y 100, trece de epsilon entre 0,01 y 0,6
y el escalador puesto o quitado, con el pronóstico de 2025 y su MAE. Se
mueve un control a la vez para ver qué C deja el menor error, qué pasa
cuando el tubo es más ancho que los cambios de la serie y por qué sin
escalador el kernel ve casi solo el número del mes.

## Árboles

### [Un árbol o un bosque](arbol.html){ target=_blank rel=noopener }

Un árbol de regresión de profundidad 1 a 10 o sin límite, o un Random Forest
de cien árboles, todos sobre la diferencia con hace 12 meses. Se trata de
ver cuánto salta el MAE con una sola pregunta más y por qué el bosque, que
promedia árboles entrenados con muestras distintas, cambia menos.
