# Ejercicios · Series Temporales · SARIMA

ARIMA y SARIMA sobre la serie del curso: deshacer las diferencias del
pronóstico, el término estacional, la elección del orden por AIC y la
revisión de los residuos con Ljung-Box. Cada enlace abre una actividad que
se trabaja en el navegador, sin instalar nada.

Cada actividad empieza con la serie de análisis y unas claves que sirven para
el ejercicio de esa página. Después viene una pregunta para responder antes
de tocar nada, sigue con un control que se mueve y cierra con la
explicación, que aparece cuando las preguntas quedan resueltas. Cada
respuesta muestra su razón, se acierte o no. Las diferencias, la integración,
los correlogramas y las métricas se calculan en la página. Los AIC, los
coeficientes, los residuos y los pronósticos de los SARIMA son la excepción:
vienen de statsmodels, con la serie en millones de pasajeros, y se
calcularon fuera de la página.

## Del pronóstico a pasajeros

### [Del pronóstico de w a pasajeros](integrar.html){ target=_blank rel=noopener }

La serie se corta en febrero de 2025 y se pronostican los doce meses
siguientes. Un deslizador avanza el horizonte y una tabla muestra, mes a mes,
cómo cada pronóstico de w se suma al mes anterior y al cambio de hace un año,
y desde el segundo mes con valores que ya son pronóstico. Se comparan dos
pronósticos de w, el de un SARIMA y ŵ = 0, con los datos reales y con el
estacional ingenuo.

## Elegir el orden

### [La rejilla SARIMA y sus residuos](rejilla.html){ target=_blank rel=noopener }

Treinta y seis SARIMA(p,1,q)(P,1,Q)₁₂ ordenados por AIC, a partir de la
firma estacional de w en sus correlogramas. Cinco de ellos traen sus
residuos, con su ACF y Ljung-Box con 12 y 24 rezagos: sin término
estacional, con un AR estacional y con un MA estacional. Se trata de ver qué
término absorbe la barra de k = 12, qué dice un Θ cercano a −1 y dónde quedan
los residuos más grandes.
