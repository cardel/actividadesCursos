# Ejercicios · FLP · Asignación y paso por referencia

Asignación y paso por referencia (EOPL §4.1 a §4.3). Cada enlace abre una
actividad que se trabaja directo en el navegador, sin instalar nada. Las
secciones siguen las de la sesión y en su mismo orden.

Los programas están escritos como los recibe el interpretador del curso:
`let x = 2 in begin set x = add1(x); *(x, 10) end`. Las primitivas van antes
del paréntesis y con comas, la aplicación lleva paréntesis y va sin comas,
`(f z 2)`, y `set` devuelve 1. Hay dos interpretadores con ambientes iniciales
distintos: `1 Asignacion` liga `x = 4`, `y = 2`, `z = 5` sobre `a = 4`,
`b = 5`, `c = 6`, y `2 PasoPorReferencia` liga `x = 1`, `y = 2`, `z = 3` sobre
los mismos `a`, `b` y `c`. Cada actividad dice con cuál corre. Los programas
no son los de clase: mismo lenguaje, ronda nueva. Lo que aquí se afirma sobre
valores, celdas, asignaciones y ambientes se midió corriéndolo contra los dos
interpretadores en Racket.

## Valor y efecto

### [Valor y efecto](efecto.html){ target=_blank rel=noopener }

Lo que cambia cuando una expresión, además de dar un valor, escribe una celda
(EOPL §4.1). El primer bloque separa ligadura de asignación:
`let w = 7 in +(let w = add1(w) in w, w)` vale 15, y con `set` la misma suma
vale 16. El segundo pregunta cuándo una subexpresión se puede cambiar por su
valor; el caso que más cuesta es un procedimiento que no asigna nada y
devuelve 1 y luego 5, porque lee una celda que otro escribe. Después se mide
el orden de evaluación (`*(w, begin set w = 5; w end)` vale 10; al revés daría
25) y se pesa el precio del aliasing.

## Sintaxis y valores denotados

### [Las producciones de set y begin](gramatica.html){ target=_blank rel=noopener }

Las producciones de `set` y `begin` (EOPL §4.2) en los dos sentidos. Seis
programas para decidir si la gramática los genera, con sorpresas en ambas
direcciones: `begin set x = set y = 7; +(x, y) end` se parsea y vale 8, porque
x recibe el 1 del set de adentro, y `set add1 = 3` no, porque `add1` es una
cadena de la gramática. Siguen el reparto de un programa en los campos de
`begin-exp`, con `lexp` como lista que puede llegar vacía, y lo que habría que
cambiar para admitir un intercambio simultáneo o un set sobre `(f 1)`. Cierra
la distinción entre valor expresado y denotado.

## Clausuras y estado compartido

### [Clausuras que comparten estado](compartir.html){ target=_blank rel=noopener }

Una clausura captura el ambiente donde se creó, y con referencias ese ambiente
guarda celdas y no valores. Cuatro programas se predicen con las dos reglas,
la del interpretador y la de una clausura que copiara los valores al crearse,
y se abren las dos trazas: `cobrar` da 60 con celdas compartidas y 30 con la
copia, y en dos de los cuatro las reglas coinciden por razones distintas. Las
dos últimas tarjetas son dos contadores que solo se diferencian en dónde está
el `let c = 0`: uno vale 5 y el otro 9.

## El TAD referencia

### [El TAD referencia](referencia.html){ target=_blank rel=noopener }

Cinco retos sobre la pareja (posición, vector) de EOPL §4.2: escribir `deref`
y `setref!` con `cases`, decidir cuándo dos referencias son la misma celda,
intercambiar contenidos usando solo las dos primitivas, incrementar las celdas
de una lista y copiar una celda frente a compartirla. Dos vectores armados con
`'(1 9 4)` son iguales para `equal?`, y escribir 0 en uno deja el otro en 9.
El caso que más cuesta es el aliasing: con la misma celda dos veces, el
intercambio con `let` la deja en 12 y el de sumas y restas la deja en 0.

## El ambiente con referencias

### [El ambiente con vectores](ambiente.html){ target=_blank rel=noopener }

El ambiente de `ambiente.rkt`, pieza por pieza: el constructor que pasa la
lista de valores a vector, `apply-env-ref` con su `buscar-variable`,
`apply-env` y una asignación, el ambiente recursivo y un cliente que recorre
la cadena. Con `m` dos veces en la cadena, asignarle 0 cambia la celda del
eslabón nuevo y deja el 64 de abajo, que ninguna consulta alcanza. Lo más
exigente es `ambiente-extendido-recursivo`: reserva el vector, arma el eslabón
y lo llena con clausuras que lo capturan, una sola por nombre. Como el
resultado es cíclico, las pruebas preguntan con `eq?`.

### [Dibujar la cadena con celdas que cambian](dibujar.html){ target=_blank rel=noopener }

Aquí la cadena se construye en lugar de leerse. Para cada programa se señala
el instante en que empieza a evaluarse una expresión, y se escriben los
eslabones con lo que guarda cada celda en ese instante; la página los dibuja
mientras se escriben y señala la primera diferencia. Una asignación no agrega
eslabones, cambia una casilla. Lo que más cuesta es que en
`let f = proc(k) … in (f 4)` el eslabón de `f` no está en la cadena de la
llamada, porque la clausura se creó afuera del `let`.

## Integración en el intérprete

### [Las cláusulas de set y begin en el evaluador](reglas.html){ target=_blank rel=noopener }

Las cláusulas de `set-exp`, `begin-exp` y `let-exp` del intérprete de
asignación (EOPL §4.2), leídas y puestas a prueba. `+(set x = 5, x)` vale 6 y
`let w = 3 in begin w; set w = 4 end` vale 1, porque set devuelve 1 y begin
descarta todo menos lo último. Dos copias modificadas del intérprete responden
qué pasa si set usa `apply-env`, y cada set se detiene mientras los programas
sin set corren igual, y qué pasa si el ambiente guarda listas: el intérprete
ni siquiera carga. El último bloque mide que cada aplicación estrena celdas:
dos contadores salidos de la misma fábrica no se pisan.

### [El orden de evaluación](orden.html){ target=_blank rel=noopener }

Con `set`, el orden en que el interpretador evalúa las partes de una expresión
cambia el resultado. Siete programas para predecir: la misma suma vale 20 o 11
según en qué operando vaya la asignación, las ligaduras de un `let` se evalúan
antes de crear el eslabón, y en una aplicación los operandos van antes que el
operador. Por eso `let f = 5 in (f begin set f = proc(v) add1(v); 9 end)` no
se detiene: cuando se verifica que el operador sea un procedimiento, ya lo es,
y el programa vale 10.

## Ejemplos trabajados

### [Trazas con asignación](trazas.html){ target=_blank rel=noopener }

Cinco programas trazados completos, con cada asignación marcada en la fila
donde ocurre y lo que guarda cada celda al terminar. Un acumulador que la
recursión actualiza desde afuera, un parámetro que se dobla en dos llamadas
mientras la variable de afuera sigue en 3, y un procedimiento recursivo al que
se le asigna otro: `g`, ligado antes del `set`, conserva la clausura vieja y
la suma da 31. El último programa no crea ningún ambiente y aun así cambia dos
celdas del ambiente inicial.

## Paso por valor y paso por referencia

### [Por valor y por referencia](politicas.html){ target=_blank rel=noopener }

El mismo programa con las dos políticas de EOPL §4.3, cada una con su
interpretador, y las dos trazas una debajo de la otra. Dos llamadas a `tomar`
multiplicadas dan 81 por valor y 72 por referencia, porque la primera deja su
resta en la celda de `n`. El intercambio de dos variables solo funciona por
referencia, y la referencia atraviesa una llamada intermedia que no asigna
nada. En una tarjeta las dos políticas coinciden: el operando vale lo mismo
que la variable, pero no es una variable.

## Blancos directos e indirectos

### [Blancos directos e indirectos](blancos.html){ target=_blank rel=noopener }

Qué blanco recibe cada parámetro en el intérprete de paso por referencia (EOPL
§4.3), según su operando. Engañan `+(a, 0)` y `begin a end`, que valen lo
mismo que `a` y aun así reciben un `direct-target`, y el nombre de un
procedimiento de `letrec`: pasarlo a un procedimiento que lo asigna reemplaza
el procedimiento, y `(h 1)` vale 99. Después vienen el invariante, `deref` y
`setref!` sobre una configuración dada, y dos copias de `eval-rand` que no
aplanan. En la primera la llamada se detiene; en la segunda el alias se rompe
sin aviso y `b` queda en 5 en vez de 0.

## eval-rand y el llamado por referencia

### [eval-rand y el llamado por referencia](eval-rand.html){ target=_blank rel=noopener }

Aquí se escribe código. Cuatro retos levantan el paso por referencia desde el
almacén: `deref` y `setref!` sobre blancos directos e indirectos, `eval-rand`
con su aplanado y la cláusula de la aplicación. Lo que más cuesta es un
invariante roto que sí se puede construir: el indirecto se arma cuando la
celda apuntada es directa, y una escritura cruda la vuelve alias después,
porque el tipo solo revisa al construir. `deref` responde `invariante-roto`;
`setref!` repara la celda, pero `abajo` se queda en 9. Al final, `(g u u)`
vale 26 y deja `u` en 13, donde el paso por valor daría 18 y 5.

## Ejemplos de paso por referencia

### [Alias con paso por referencia](alias.html){ target=_blank rel=noopener }

Seis programas sobre `2 PasoPorReferencia`, donde dos nombres pueden denotar
la misma celda. `(f k k)` vale 12 y no 8 porque `p` y `q` apuntan a la celda
de `k`; un cuerpo que asigna a una variable libre cambia también lo que lee su
parámetro. Con listas literales se ven dos resultados a la vez: `[(f k), k]`
da `(101 101)` cuando el alias pasa por dos llamadas. Una variable del
ambiente inicial empieza aquí en otro valor, y una lista no se deja pasar como
argumento.

### [Dibujar la cadena con paso por referencia](dibujar-referencia.html){ target=_blank rel=noopener }

La misma tarea con blancos: cada celda guarda un `direct-target` con su valor
o un `indirect-target` hacia la celda de otra variable. En tres de los cuatro
programas esa variable vive en un eslabón que no está en la cadena del cuerpo,
y aun así la llamada la lee y la escribe. En uno el alias pasa por dos
llamadas y hay que decir a qué celda apunta el último parámetro: a la de la
variable original, porque `eval-rand` aplana.

## Práctica y cierre

### [Escribir el evaluador y extender el lenguaje](cierre.html){ target=_blank rel=noopener }

La práctica final, también escribiendo código, sobre un intérprete con
asignación y paso por valor: las cláusulas de `begin` y `set`, y la extensión
con `incr v`, que suma 1 y devuelve el valor anterior, desde la producción de
SLLGEN hasta la cláusula del evaluador. La producción trae un efecto que el
evaluador no muestra: `incr` queda reservada, y `let incr = 1 in incr`, que
valía 1, deja de parsearse. El último reto separa dos cifras que se confunden.
Un `set` dentro de un procedimiento llamado tres veces se escribe una vez y se
ejecuta tres; uno en un procedimiento que nadie llama no se ejecuta nunca.
