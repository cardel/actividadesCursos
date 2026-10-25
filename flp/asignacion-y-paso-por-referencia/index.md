# Ejercicios · FLP · Asignación y paso por referencia

Asignación y paso por referencia (EOPL §4.1 a §4.5). Cada enlace abre una
actividad que se trabaja directo en el navegador, sin instalar nada. Las
secciones siguen las de la sesión y en su mismo orden.

Los programas están escritos como los reciben los intérpretes del curso:
`let m = 0 in begin set m = add1(m); m end`. Las primitivas van antes del
paréntesis y con comas, la aplicación lleva paréntesis y va sin comas,
`(f z 2)`, y `set` y `setref` devuelven 1. Hay tres intérpretes, los de
`Corte 2` en la versión de la tercera edición del libro: `0
ReferenciasExplicitas`, `1 Asignacion` y `2 PasoPorReferencia`. Los tres
tienen el mismo ambiente inicial, `x = 4`, `y = 2`, `z = 5` sobre `a = 4`,
`b = 5`, `c = 6`; en los dos últimos esas seis variables ocupan las celdas 0
a 5 del almacén. Cada actividad dice con cuál corre. Los programas no son los
de clase: mismo lenguaje, ronda nueva. Lo que aquí se afirma sobre valores,
celdas y ambientes se midió corriéndolo contra los intérpretes en Racket,
celda por celda.

Casi todas las actividades dibujan: al comprobar, la página muestra la cadena
de ambientes con el almacén debajo y una flecha de cada referencia a su celda.

## Valor y efecto

### [Valor y efecto](efecto.html){ target=_blank rel=noopener }

Lo que cambia cuando una expresión, además de dar un valor, escribe una celda
(EOPL §4.1). El primer bloque separa ligadura de asignación:
`let w = 7 in +(let w = add1(w) in w, w)` vale 15, y con `set` la misma suma
vale 16. El segundo pregunta cuándo una subexpresión se puede cambiar por su
valor; el caso que más cuesta es un procedimiento que no asigna nada y aun así
devuelve 1 y luego 5, porque lee una celda que otro escribe. Después se mide
el orden de evaluación y se pesa el precio del aliasing.

### [El orden de evaluación](orden.html){ target=_blank rel=noopener }

Siete programas donde el resultado depende de un orden concreto: los
operandos de una primitiva de izquierda a derecha, las ligaduras de un `let`
antes de crear el eslabón, los operandos de una aplicación antes que el
operador. Uno se salva de detenerse solo por ese orden: `f` empieza ligado a 5
y el operando le asigna un procedimiento antes de que se verifique.

## El almacén

### [El almacén](almacen.html){ target=_blank rel=noopener }

Cuatro bloques sobre la lista de celdas de EOPL §4.2: qué le hace cada
operación al almacén, qué queda después de una secuencia de `newref` y
`setref!`, qué se puede afirmar de una referencia y por qué el almacén está
hecho con un `set!` sobre una variable global. Una celda puede guardar una
referencia a otra, y dos `(newref 5)` dan dos celdas distintas.

### [El almacén en código](almacen-codigo.html){ target=_blank rel=noopener }

Aquí se escribe código. Cinco retos que levantan `src/almacen.rkt`: la lista
igual salvo en una posición, `newref` sobre el almacén global, `deref` con su
verificación, el almacén numerado que se mira desde el REPL, e
`intercambiar!` sobre la interfaz. El más exigente pasa la misma referencia
dos veces.

## Referencias explícitas

### [Referencias explícitas](explicitas.html){ target=_blank rel=noopener }

Ocho programas del lenguaje de EOPL §4.2, donde el programa reserva, lee y
escribe celdas a mano. `let b = a` copia una referencia y no una celda; un
procedimiento que recibe una referencia por valor escribe en la celda del
llamador; tres `newref` que nadie liga dejan tres celdas que ya no se pueden
leer; y `setref` sobre un número se detiene.

### [Dibujar la cadena con referencias explícitas](dibujar-explicitas.html){ target=_blank rel=noopener }

Al revés que las anteriores: en vez de leer la cadena hay que construirla. En
este lenguaje el ambiente guarda valores, y algunos son referencias: una
referencia que lleva a otra, el eslabón de una llamada que comparte celda con
el de afuera, un `letrec` que escribe una celda que vive afuera.

## Referencias implícitas: set

### [Las producciones de set y begin](gramatica.html){ target=_blank rel=noopener }

Las producciones de `set` y `begin` (EOPL §4.3) en los dos sentidos: qué
programas genera la gramática, cómo se reparte un programa en los campos de
`begin-exp`, qué habría que cambiar para admitir un `set` sobre `(f 1)` y la
diferencia entre valor expresado y denotado. `begin set x = set y = 7; +(x, y)
end` se parsea y vale 8.

### [Clausuras que comparten estado](compartir.html){ target=_blank rel=noopener }

Una clausura captura el ambiente donde se creó, y ese ambiente guarda
referencias. Cuatro programas se predicen con la regla del intérprete y con
una que copiara los valores al crearse la clausura, y se abren las dos trazas
con su almacén: `cobrar` da 60 con celdas compartidas y 30 con la copia. Las
dos últimas tarjetas son dos contadores que solo se diferencian en dónde está
el `let c = 0`: uno vale 5 y el otro 9.

### [Las cláusulas de la asignación](reglas.html){ target=_blank rel=noopener }

Las cláusulas de `1 Asignacion`, línea por línea: qué devuelve `apply-env` y
por qué `set` la necesita así, cuántas celdas reserva cada programa y qué
pasaría si una cláusula se escribiera de otra forma. Sin el `(map newref …)`
del `let`, el datatype rechaza el eslabón.

### [Dibujar la cadena con celdas](dibujar.html){ target=_blank rel=noopener }

Cuatro programas para escribir la cadena de un momento, ahora con
referencias: cada ligadura se escribe `(a-ref 6)` y lo que hay en la celda se
ve en el almacén. En uno la celda de una llamada anterior sigue en el
almacén aunque su eslabón ya no esté en la cadena; en otro el marco del
`letrec` deja una clausura en cada celda impar.

### [Trazas completas con asignación](trazas.html){ target=_blank rel=noopener }

Cinco programas para trazar completos, con el valor y los conteos: un
acumulador que la recursión actualiza desde afuera, un parámetro que se
asigna sin que la variable de afuera se entere, tres llamadas que escriben la
misma celda, un procedimiento recursivo al que un `set` no alcanza a cambiar,
y un programa que no crea ningún ambiente y aun así cambia dos celdas.

### [letrec con referencias](letrec-celdas.html){ target=_blank rel=noopener }

Buscar un nombre de `letrec` reserva una celda con una clausura recién hecha.
Siete programas para contar celdas y clausuras: un `letrec` que nadie nombra
no reserva nada, una recursión de tres llamadas reserva seis celdas, y
`set g = 5` sobre el nombre del `letrec` escribe en una celda que nadie
vuelve a leer.

### [El ambiente que liga nombres a referencias](ambiente.html){ target=_blank rel=noopener }

Aquí se escribe código. Cinco retos sobre `src/ambiente.rkt`: reservar una
celda por valor, `apply-env` que devuelve la referencia, leer y asignar una
variable, el marco de `letrec` que reserva una celda en cada búsqueda y el
ambiente inicial que se construye de nuevo en cada programa. Las pruebas
distinguen capturar el marco de capturar lo que el marco extiende.

### [Cierre: un intérprete con almacén](cierre.html){ target=_blank rel=noopener }

También con código: un intérprete pequeño con almacén y las cláusulas de
`var-exp`, `let-exp`, `set-exp` y `begin-exp`, y una forma nueva, `incr x`,
con su variante y su cláusula. Dos `incr` en una suma dan 1 + 2.

## Paso por valor y paso por referencia

### [Las dos políticas](politicas.html){ target=_blank rel=noopener }

El mismo programa con paso por valor y con paso por referencia (EOPL §4.5),
con las dos trazas y los dos almacenes dibujados. `rotar` da 123 por valor y
231 por referencia; `+(m, 0)` vale lo mismo que `m` y aun así no comparte su
celda; y un procedimiento pasado por referencia termina convertido en un 0.

### [Alias](alias.html){ target=_blank rel=noopener }

Seis programas sobre `2 PasoPorReferencia` (EOPL §4.5.1): dos parámetros que
son alias de la misma variable, un alias que pasa por dos llamadas y deja
101101, una variable del ambiente inicial que dos llamadas llevan de 4 a 12, y
un nombre de `letrec` que no se deja cambiar.

### [Dibujar la cadena con paso por referencia](dibujar-referencia.html){ target=_blank rel=noopener }

Cuatro programas para escribir la cadena dentro de un procedimiento. Un
parámetro cuyo operando fue una variable guarda la misma referencia que ella,
aunque el eslabón de la variable no esté en la cadena: el almacén dibujado lo
muestra con dos flechas que llegan a la misma celda.

### [El paso por referencia en código](operando.html){ target=_blank rel=noopener }

Tres retos sobre un intérprete pequeño: `evaluar-operando`, la aplicación que
liga los parámetros a esas referencias y `alias?`, que dice si dos nombres
denotan la misma celda comparando posiciones y no contenidos.
