# Ejercicios · Infra · Sistemas distribuidos

Introducción a los sistemas distribuidos. Los apartados van en el orden de la
sesión y todos se resuelven en el navegador. Las cifras son las que se midieron
en clase: las latencias de la jerarquía de memoria, el resumen de una corrida de
`ping`, los nueves de disponibilidad y la traza de una partición de red. Antes de
ver un número hay que escribirlo, y cada respuesta equivocada dice por qué no.

## ¿Qué es un sistema distribuido?

### [Qué cuesta cruzar la red](que-es.html){ target=_blank rel=noopener }

Entre la RAM y el SSD hay un factor de mil, y entre el SSD y la red otro factor
de mil. Calcule cuántas veces más lento es un ping entre continentes que una
lectura de memoria, destape la tabla de las cuatro operaciones y decida por qué
una suma más lenta por elemento puede ser la única posible. Cierra con el clic
que se atiende desde tres regiones a la vez.

### [El orden de los eventos sin un reloj común](relojes.html){ target=_blank rel=noopener }

Tres procesos, tres mensajes y un contador en cada uno. Lleve el reloj lógico de
Lamport evento por evento, prediga en cuánto queda P1 cuando le llega el último
mensaje y decida qué se puede afirmar de dos eventos cuyos relojes dicen 1 y 3.
Cierra con la razón por la que NTP no alcanza para ordenar dos escrituras.

## Escalabilidad

### [Escalar a lo alto o a lo ancho](escalabilidad.html){ target=_blank rel=noopener }

Diez servidores de 128 GB suman más memoria que uno de 1 TB y cuestan menos, y
aun así hay razones para la máquina grande. Aplique la ley de Amdahl con
p = 0,95 a diez máquinas y al infinito, vea la eficiencia caer en la tabla y
decida entre sharding y replicación para treinta millones de perfiles. Termina
con el tamaño del grupo que sigue decidiendo con dos nodos caídos.

### [Repartir claves entre nodos](particionar.html){ target=_blank rel=noopener }

Mil perfiles en cuatro nodos y llega el quinto. Cuente cuántos cambian de sitio
si se reparten por el residuo y cuántos si se reparten en un anillo, vea la
carga de cada nodo antes y después, y decida cómo se empareja el anillo sin
mover casi todo. Termina con lo que pasa al repartir por país.

## Tolerancia a fallos y latencia

### [Disponibilidad, demora y throughput](fallos-latencia.html){ target=_blank rel=noopener }

Tres cifras que se confunden entre sí. Convierta el 99,9 % en horas caídas al
año, lea el resumen `min/avg/max/mdev` de veinte paquetes y diga cuál de los
cuatro campos es el piso que impone la distancia. Después, por qué un promedio
bonito con 5 % de pérdida es peor noticia, qué enlace sirve para una
videollamada y cuántos Mbit/s son los 34.661.538 B/s que informó `curl`.

### [Disponibilidad de una cadena de servicios](cadena.html){ target=_blank rel=noopener }

Tres piezas de tres nueves una detrás de otra no suman tres nueves. Calcule las
horas caídas al año de la cadena, lo que cambia con una segunda base de datos, y
decida qué se sabe de un nodo que no contesta en dos segundos y cómo se
reintenta un cobro sin cobrar dos veces.

## Teorema CAP

### [El teorema CAP, paso a paso](cap.html){ target=_blank rel=noopener }

Dos nodos con el mismo dato y una red que se parte en el momento equivocado.
Recorra la partición momento por momento y vea en qué fila las dos decisiones
dejan de coincidir; decida qué contesta un sistema CP y qué contesta uno AP, y
clasifique seis servicios reales, desde la matrícula universitaria hasta el
carrito de compras. Cierra con lo que ACID y BASE prometen de verdad.

### [Quórums de lectura y escritura](quorum.html){ target=_blank rel=noopener }

Cinco réplicas, una escritura que se confirma con tres y una lectura que
consulta otras tres. Siga los pasos y diga qué devuelve la lectura, calcule el R
más pequeño cuando W baja a 2 y decida qué lado de una partición sigue
escribiendo. Cierra con lo que gana y lo que pierde W = 1 y R = 1.
