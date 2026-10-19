# Ejercicios · Series Temporales · Modelos ARMA

Modelos AR, MA y ARMA: su firma en la ACF y la PACF, la identificación por
correlogramas y el ajuste sobre la serie del curso diferenciada. Cada enlace
abre una actividad que se trabaja en el navegador, sin instalar nada.

Cada actividad empieza con la serie de análisis y unas claves que sirven para
el ejercicio de esa página. Después viene una pregunta para responder antes
de tocar nada, sigue con un control que se mueve y cierra con la
explicación, que aparece cuando las preguntas quedan resueltas. Cada
respuesta muestra su razón, se acierte o no. Las simulaciones, los
correlogramas, las diferencias y los residuos se calculan en la página. Los
coeficientes, los AIC y los valores p de Ljung-Box son la excepción: vienen
de statsmodels y se calcularon fuera de la página.

## La firma de cada modelo

### [La firma de un AR, un MA y un ARMA](firma.html){ target=_blank rel=noopener }

Una serie simulada con φ₁, φ₂ y θ en deslizadores y su ACF y su PACF hasta
k = 20. Con θ sola es un MA(1), cuya ACF se corta en k = 1; con φ₁ y φ₂ es un
AR(2), cuya PACF se corta en k = 2; con φ y θ juntos es un ARMA(1,1), y
ninguno de los dos se corta. También muestra hasta dónde llega la primera
barra de un MA(1), la onda de un AR(2) con φ₂ negativo y lo que pasa fuera
de la región estacionaria. El AR(1) solo tiene su propia actividad, [El φ de
un AR(1)](../autocorrelacion/ar1.html){ target=_blank rel=noopener }.

### [¿De qué modelo son estos correlogramas?](emparejar.html){ target=_blank rel=noopener }

Cuatro pares de ACF y PACF en desorden, de un AR(1), un MA(1), un AR(2) y un
ARMA(1,1), para emparejar buscando cuál de los dos correlogramas se corta.
Un deslizador cambia cuántos datos se simulan, de 100 a 1000, para ver cómo
la banda se ensancha con pocos datos y deja salir barras por azar.

## La serie del curso

### [Un ARMA para la serie diferenciada](arma-w.html){ target=_blank rel=noopener }

Seis ARMA de orden bajo ajustados sobre w = `diff(12).diff()`, con su AIC,
sus coeficientes, sus residuos y la ACF de estos. Los seis quedan a poco más
de dos puntos de AIC del modelo sin ningún término, y la barra de k = 12
sigue en los residuos de todos: un AR o un MA de orden bajo mira uno o dos
meses atrás, no doce.
