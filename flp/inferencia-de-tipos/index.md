# Ejercicios · FLP · Inferencia de tipos

Inferencia de tipos (EOPL §7.3 y §7.4). Cada enlace abre una actividad que se
trabaja directo en el navegador, sin instalar nada. Las secciones siguen las de
la sesión y en su mismo orden.

El lenguaje es INFERRED, el del intérprete `Corte 2 / 4 InferenciaTipos`. Es el
mismo lenguaje de la sesión anterior con una sola diferencia: donde había que
escribir el tipo de un parámetro o de una declaración, ahora se puede escribir
`?` y el intérprete lo deduce. Las primitivas van antes del paréntesis y con
comas, y la aplicación lleva paréntesis y va sin comas, `(f 3)`. Dos cosas que
cambian respecto del lenguaje anotado: aquí no existe `and`, y el ambiente
inicial sigue vacío, de modo que toda variable se liga con `let`, `letrec` o
`proc`. Los programas no son los de clase: mismo lenguaje, ronda nueva. Los
tipos, los veredictos, los valores y los mensajes de error que aquí se afirman
se midieron corriendo `type-of-program` y `eval-program` contra ese intérprete.

El número serial con que el intérprete imprime cada variable de tipo depende
del orden en que se pidieron y cambia entre corridas, así que las páginas
escriben `t1`, `t2` y `t3`, y lo que preguntan es qué posiciones comparten
variable.

El peso de la sesión está en el medio: generar el sistema de ecuaciones de un
programa y resolverlo. Las dos actividades centrales van paso a paso y son las
más largas.

## Del chequeo a la inferencia

### [Del chequeo a la inferencia](del-chequeo.html){ target=_blank rel=noopener }

Qué pone el intérprete en cada `?` y qué le pasa al mismo programa escrito de
las dos formas. El par mutuamente recursivo de `even` y `odd` aparece anotado y
con huecos, y se mide en los dos intérpretes: la versión con `?` no parsea en
el que exige anotaciones y la anotada tipa igual en el que deduce. Cierra con
lo que no cambió, que es casi todo: una anotación equivocada sigue rechazando
el programa y las ramas de un `if` siguen teniendo que coincidir.

## Variables de tipo

### [Variables de tipo](variables.html){ target=_blank rel=noopener }

El TAD con su contenedor que se llena a lo sumo una vez, y después lo que de
verdad cuesta: cuándo dos partes del programa llevan la misma variable. El caso
central es `proc (? f, ? x) (f x)`, donde el parámetro de `f` y el tipo de `x`
tienen que ser la misma y el resultado es otra; y `proc (? f) proc (? x) (f (f
x))`, donde aplicar dos veces iguala la entrada con la salida. El último bloque
es la asignación única: la identidad ligada con `let` no sirve para un uso con
entero y otro con booleano.

## Reglas de generación de ecuaciones

### [Reglas de generación de ecuaciones](ecuaciones.html){ target=_blank rel=noopener }

Escribir el sistema de un programa, parte por parte: qué ecuación aporta una
primitiva, cuáles dos aporta un condicional, cuál sale de una aplicación entre
variables de tipo, y el sistema completo de un programa de cinco ecuaciones.

## Unificación

### [Unificación](unificacion.html){ target=_blank rel=noopener }

Resolver el sistema: qué hace `check-equal-type` con cada par de tipos, cuándo
una variable se llena y cuándo el par no se puede igualar, y por qué el chequeo
de ocurrencia rechaza llenar una variable con un tipo que la contiene.

## Ejemplos de inferencia

### [Ejemplos de inferencia](inferir.html){ target=_blank rel=noopener }

Veinte programas y, para cada uno, qué tipo infiere el intérprete. Primero los
que quedan cerrados, donde las primitivas alcanzan a llenar todos los huecos;
después los que dejan variables libres, los dos `letrec` y los dos que no
tipan, uno por el chequeo de ocurrencia y otro porque el mismo parámetro
tendría que ser un procedimiento y un entero.
