# Ejercicios · FLP · Chequeo de tipos

Chequeo estático de tipos (EOPL §7.1). Cada enlace abre una actividad que se
trabaja directo en el navegador, sin instalar nada. Las secciones siguen las
de la sesión y en su mismo orden.

El lenguaje es CHECKED, el del intérprete `Corte 2 / 3 ChequeoTipos`. El
programador anota los tipos: `proc (int x) add1(x)` y
`letrec int fact(int n) = … in …`. Las primitivas van antes del paréntesis y
con comas, y la aplicación lleva paréntesis y va sin comas, `(f 3)`. Dos
cambios respecto del primer corte que conviene tener presentes: aquí existe
`zero?` y no existe `==`, y el ambiente inicial está vacío, de modo que toda
variable se liga con `let`, `letrec` o `proc`. Los programas no son los de
clase: mismo lenguaje, ronda nueva. Los tipos, los veredictos y los valores
que aquí se afirman se midieron corriendo `type-of-program` y `eval-program`
contra ese intérprete.

Las dos primeras actividades se responden escogiendo, y las dos últimas
piden escribir código que corre en la página.

## El lenguaje de tipos

### [El lenguaje de tipos](tipos.html){ target=_blank rel=noopener }

Qué tipo tiene cada expresión y cómo se escribe el tipo de un procedimiento.
Quince decisiones, desde `add1(3)` hasta
`proc (int x) proc (bool b) if b then x else 0`, que no tiene el tipo que
parece. Incluye los dos casos que se prestan: el procedimiento sin
parámetros, que sigue siendo un procedimiento, y el `letrec` cuyo cuerpo
entrega el procedimiento en vez de aplicarlo.

## Reglas de tipamiento

### [Las reglas de tipamiento](reglas.html){ target=_blank rel=noopener }

Qué exige cada regla, cuál falla en siete programas que el chequeador
rechaza, y qué habría hecho la máquina con ellos si los dejaran correr. El
tercer bloque es el que deja la idea de la sesión: `if zero?(0) then 1 else
true` entrega 1 y el chequeador lo rechaza igual.

## TAD tipo y ambiente de tipos

### [El TAD tipo y el ambiente de tipos](tad-tipo.html){ target=_blank rel=noopener }

Tres retos de código: escribir un tipo de vuelta en la notación del lenguaje,
intercalar los asteriscos entre los parámetros y buscar un nombre en el
ambiente de tipos. El último es `apply-env` con tipos adentro, y se nota.

## Implementación del chequeador

### [Dos reglas escritas como código](chequeador.html){ target=_blank rel=noopener }

La regla del condicional y la de la aplicación, con los tipos ya calculados,
de modo que lo que se escribe es la regla. La de la aplicación comprueba tres
cosas distintas y una de ellas, el número de argumentos, el evaluador no la
hace.
