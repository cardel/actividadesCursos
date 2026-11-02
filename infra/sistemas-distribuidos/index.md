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

## Escalabilidad

### [Escalar a lo alto o a lo ancho](escalabilidad.html){ target=_blank rel=noopener }

Diez servidores de 128 GB suman más memoria que uno de 1 TB y cuestan menos, y
aun así hay razones para la máquina grande. Aplique la ley de Amdahl con
p = 0,95 a diez máquinas y al infinito, vea la eficiencia caer en la tabla y
decida entre sharding y replicación para treinta millones de perfiles. Termina
con el tamaño del grupo que sigue decidiendo con dos nodos caídos.

## Tolerancia a fallos y latencia

### [Disponibilidad, demora y throughput](fallos-latencia.html){ target=_blank rel=noopener }

Tres cifras que se confunden entre sí. Convierta el 99,9 % en horas caídas al
año, lea el resumen `min/avg/max/mdev` de veinte paquetes y diga cuál de los
cuatro campos es el piso que impone la distancia. Después, por qué un promedio
bonito con 5 % de pérdida es peor noticia, qué enlace sirve para una
videollamada y cuántos Mbit/s son los 34.661.538 B/s que informó `curl`.

## Teorema CAP

### [El teorema CAP, paso a paso](cap.html){ target=_blank rel=noopener }

Dos nodos con el mismo dato y una red que se parte en el momento equivocado.
Recorra la partición momento por momento y vea en qué fila las dos decisiones
dejan de coincidir; decida qué contesta un sistema CP y qué contesta uno AP, y
clasifique seis servicios reales, desde la matrícula universitaria hasta el
carrito de compras. Cierra con lo que ACID y BASE prometen de verdad.
