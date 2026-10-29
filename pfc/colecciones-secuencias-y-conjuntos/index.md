# Ejercicios · PFC · Colecciones: secuencias y conjuntos

Once ejercicios para recorrer en el navegador, en el orden en que se presentan
los temas. Ninguno muestra nada antes de que usted produzca algo: hay trazas
que avanzan paso a paso, valores que hay que predecir antes de verlos y
opciones entre las que hay que escoger, y cada opción equivocada dice en qué
consiste la confusión. Todo lo que se afirma salió de correr el código con
Scala 2.13.11, la versión del curso.

Dos ideas los atraviesan. Una, que la colección se escoge por cómo se va a
acceder a los datos, y que `map`, `filter`, `exists` y `forall` se escriben
igual sobre todas. Otra, que una expresión `for` con `yield` no es un ciclo:
es `flatMap`, `map` y `filter` escritos de otro modo, y el compilador hace esa
traducción.

## De listas a colecciones

### [jerarquia](jerarquia.html){ target=_blank rel=noopener }

Arranca con tres expresiones sobre `List` para reactivar `map`, `filter` y
`length`, y de ahí pasa a las preguntas que una lista no responde bien: llegar
al elemento mil, agregar al final, guardar datos sin orden. Para cada
necesidad hay que escoger la colección, y al final se separa lo que todas
comparten de lo que es propio de una.

## Secuencias: Vector, Range, Array y String

### [vector](vector.html){ target=_blank rel=noopener }

Los dos agregados son lo que se confunde: `+:` pone al inicio y `:+` al final,
y los dos puntos siempre apuntan hacia la colección. La segunda parte
comprueba que `head`, `tail`, `isEmpty`, `map` y `filter` se escriben igual que
en una lista, con una pregunta que pide las dos expresiones que devuelven
`Vector(3, 4)`.

### [rangos](rangos.html){ target=_blank rel=noopener }

`to` incluye el extremo y `until` no, `by` fija el paso y admite paso
negativo. Tres resultados que sorprenden al correrlos: un rango no se imprime
con sus elementos sino como `Range 1 to 5`, `(6 to 1 by -2)` sale como
`inexact Range 6 to 1 by -2`, y `(5 to 1).toList` da la lista vacía porque sin
`by` el paso sube. Cierra con `Array` y `String` reusando las mismas
operaciones, y con que filtrar un texto devuelve un texto.

## Operaciones sobre secuencias

### [consultas](consultas.html){ target=_blank rel=noopener }

Trece preguntas sobre las operaciones que no devuelven otra secuencia:
`exists` y `forall` dan booleanos, `zip` y `unzip` arman y desarman parejas, y
`sum`, `product`, `max` y `min` dejan un número. Dos casos cuestan: `zip`
recorta a la más corta de las dos, y sobre una colección vacía `forall` da
`true` mientras `exists` da `false`.

## flatMap

### [flatmap](flatmap.html){ target=_blank rel=noopener }

Primero el problema: con `map` el resultado queda anidado, tres vectores de
dos parejas cada uno. Antes de ver el de `flatMap` hay que predecir cuántas
parejas trae, y la traza paso a paso muestra cada `x` produciendo su trozo y
los trozos concatenándose hasta las seis. Termina con el producto escalar, que
compone `zip`, `map` y `sum` en una línea.

## Expresiones For

### [forExpr](forExpr.html){ target=_blank rel=noopener }

Cuatro expresiones `for` que hay que emparejar con la cadena de funciones de
alto orden que les corresponde. Hay cinco cadenas para las cuatro
expresiones, y una de ellas usa `map` donde hace falta `flatMap`: no le
corresponde a ninguna, y descubrir por qué es el ejercicio. Las dos
escrituras de las parejas primas devuelven el mismo vector.

### [traducir](traducir.html){ target=_blank rel=noopener }

Lo mismo por el otro lado: en lugar de reconocer la equivalencia, derivarla.
Se llega a la cadena por reescrituras, de un generador a dos con filtro, y en
cada paso hay que decir qué función entra. Dos resultados medidos sostienen el
ejercicio: con `filter` en lugar de `withFilter` el valor es el mismo, y lo
que cambia es que `withFilter` no construye la colección intermedia; y poner
`map` donde va `flatMap` deja cinco vectores anidados en lugar de las siete
parejas. Cierra con el `for` sin `yield`, que devuelve `()` de tipo `Unit` y
es el ciclo imperativo que aquí no se usa.

### [ordenGeneradores](ordenGeneradores.html){ target=_blank rel=noopener }

Con dos generadores, el de la derecha es el que varía más rápido, y la traza
lo muestra pareja por pareja. Invertirlos da los mismos seis pares en otra
secuencia, de modo que las dos versiones son iguales con `toSet` y distintas
con `==`, que es donde cuesta no responder que da lo mismo. Después el
generador que depende del anterior: recorre un triángulo y da seis pares donde
el independiente da nueve, e invertirlo no compila. El mensaje del compilador
está copiado de la corrida.

## Conjuntos

### [conjuntos](conjuntos.html){ target=_blank rel=noopener }

Sin orden y sin duplicados, con `union`, `intersect`, `diff`, `subsetOf` y el
atajo de aplicar el conjunto como si fuera una función. Que los duplicados se
colapsen tiene consecuencia medible: seis divisiones dejan cuatro elementos.
La pregunta más dura es la del texto impreso, porque el mismo conjunto sale
unas veces como `Set` y otras como `HashSet`, con los elementos en otro orden,
y de ahí se sigue que ni el nombre ni el orden son parte de lo que un conjunto
promete.

## Ternas pitagóricas

### [ternas](ternas.html){ target=_blank rel=noopener }

Tres generadores anidados con la condición de que los lados vayan en orden, el
filtro del teorema y un `toSet` al final. Primero se predice cuántas ternas
candidatas se van a probar con cinco, y la traza las muestra descartándose una
por una hasta que sobrevive `(3,4,5)`: es búsqueda exhaustiva y se ve.
Después queda la versión con `flatMap` y `filter`, que da el mismo conjunto,
y las seis ternas que aparecen hasta veinte. Con veinte la traza son más de
tres mil pasos, así que conviene el botón de ir al final.

## Test de primalidad

### [esPrimo](esPrimo.html){ target=_blank rel=noopener }

Las dos escrituras, negar que exista un divisor y pedir que ninguno divida,
coinciden en todos los valores probados, y esa equivalencia es la mitad del
ejercicio. La otra mitad es el rango sin elementos: para `n = 2` el rango
`2 until 2` está vacío, así que `forall` da `true` y `exists` da `false`, y de
ahí sale por qué la guarda `n >= 2` tiene que estar. La traza cuenta los
divisores que se prueban y deja ver dónde se detiene la búsqueda cuando
encuentra uno.
