# Ejercicios · Infra · Docker

Imágenes y contenedores. Los apartados van en el orden de la sesión y todos se
resuelven en el navegador. Las cifras son las que se midieron en clase: el disco
que ocupa una imagen levantada dos veces, los límites que impone un cgroup, los
tiempos de tres construcciones y los de tres paradas. Antes de ver un número hay
que escribirlo, y cada respuesta equivocada dice por qué no.

## Fundamentos

### [Imagen, contenedor y lo que el proceso cree](imagen-contenedor.html){ target=_blank rel=noopener }

Un contenedor es un proceso del anfitrión al que se le cambió lo que ve. Calcule
cuánto disco cuesta el tercer contenedor de una imagen de 74,5 MB, lea
`cpu.max` y `memory.max` para saber qué le tocó de verdad, y compare esas cifras
con las que informan `nproc` y `free` adentro. Cierra con el servicio que se
queda sin memoria sin que nadie haya cambiado nada.

## Construcción de imágenes

### [Las capas y dónde se rompe la caché](capas-cache.html){ target=_blank rel=noopener }

El mismo Dockerfile con las dependencias arriba y con el código arriba. Prediga
cuántos pasos salen de la caché en cada orden tras editar una línea, destape los
dos recorridos y calcule cuántas veces más cuesta la versión mal ordenada: son
7,274 segundos contra 2,374 por mover dos líneas de sitio.

### [Dónde está el peso de una imagen](tamanos.html){ target=_blank rel=noopener }

197 MB para un programa de doce kilobytes. Reparta ese peso entre la base y las
capas propias, vea cuáles ocupan 0 B y aun así existen, y compare el mismo
programa en Go empacado de cuatro formas: de 2,06 MB a 1,27 GB, con la misma
salida en las cuatro. Termina con la diferencia entre `python:3.12` y su
variante `slim`.

## Ejecución y operación

### [El ciclo de vida y la parada ordenada](ciclo-vida.html){ target=_blank rel=noopener }

Cuatro órdenes, cuatro estados, y solo la última libera lo que el contenedor
escribió. Recorra la secuencia y después prediga cuánto tarda `docker stop`
sobre un proceso que atiende la señal y sobre uno que la ignora. El código 137
que aparece dos veces se explica con una suma, y un servicio que siempre tarda
exactamente diez segundos en parar tiene un problema que nadie ve.
