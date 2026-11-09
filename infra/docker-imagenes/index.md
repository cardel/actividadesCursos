# Ejercicios · Infra · Docker

Imágenes y contenedores. Los apartados van en el orden de la sesión y todos se
resuelven en el navegador. Las cifras son las que se midieron en clase: los
identificadores de namespace leídos a los dos lados, el disco que ocupa una
imagen levantada dos veces, los límites que impone un cgroup, los tiempos de
tres construcciones y los de tres paradas, y la tabla de qué contenedor alcanza
a cuál. Antes de ver un número hay que escribirlo, y cada respuesta equivocada
dice por qué no.

## Fundamentos

### [Imagen, contenedor y lo que el proceso cree](imagen-contenedor.html){ target=_blank rel=noopener }

Un contenedor es un proceso del anfitrión al que se le cambió lo que ve. Calcule
cuánto disco cuesta el tercer contenedor de una imagen de 74,5 MB, lea
`cpu.max` y `memory.max` para saber qué le tocó de verdad, y compare esas cifras
con las que informan `nproc` y `free` adentro. Cierra con el servicio que se
queda sin memoria sin que nadie haya cambiado nada.

### [Namespaces y cgroups: lo que ve y lo que le toca](namespaces.html){ target=_blank rel=noopener }

Los cinco identificadores de namespace, leídos en el contenedor y en el
anfitrión de la misma máquina: cuatro son distintos y uno se repite, y ese que
se repite es el que decide que el aislamiento no sea una frontera de seguridad.
Termina clasificando seis preguntas entre los dos mecanismos, que es lo que hace
falta para dimensionar un programa dentro de un contenedor.

## Construcción de imágenes

### [Las capas y dónde se rompe la caché](capas-cache.html){ target=_blank rel=noopener }

El mismo Dockerfile con las dependencias arriba y con el código arriba. Prediga
cuántos pasos salen de la caché en cada orden tras editar una línea, destape los
dos recorridos y calcule cuántas veces más cuesta la versión mal ordenada: son
7,274 segundos contra 2,374 por mover dos líneas de sitio.

### [El Dockerfile, instrucción por instrucción](dockerfile.html){ target=_blank rel=noopener }

Arme las ocho instrucciones del servicio de Flask en el orden que les
corresponde, con lo que cuesta cada elección fuera de turno. Después, qué son
las líneas de contenedor temporal que imprime el `build`, por qué `EXPOSE` no
abre nada, y qué ejecuta `docker run img --puerto 8080` según si el arranque se
fijó con `CMD` o con `ENTRYPOINT`.

### [Seis problemas en un Dockerfile](buenas-practicas.html){ target=_blank rel=noopener }

Un archivo que construye y arranca, con seis cosas que se pagan después: el tag
móvil, el contexto antes de las dependencias, el `apt-get update` cacheado, la
caché de `pip` dentro de la capa, la contraseña en la imagen y el `CMD` que se
queda sin recibir la señal. Marque las líneas, diga qué instrucción falta y
compare con el corregido.

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

### [El servicio en marcha: puertos, registros y quién llamó](puertos.html){ target=_blank rel=noopener }

Con `-p 8081:5000`, a qué puerto se le hace `curl` y qué devuelve el otro.
Después, los dos síntomas que se parecen y no son lo mismo: el servicio que
escucha en su propio loopback y el contenedor que se cayó. Cierra con los dos
números del registro, el nombre de máquina que el JSON devuelve y la puerta de
enlace por la que entró la petición.

### [Lo que sobrevive al contenedor](volumenes.html){ target=_blank rel=noopener }

La capa escribible nace con el contenedor y muere con él: siga los cuatro pasos
que lo demuestran con un archivo de texto y repítalos con una base de datos, que
devuelve `persiste` con el volumen montado y `relation "nota" does not exist`
sin él. Termina con el volumen que dos contenedores montan a la vez y con lo que
`docker volume prune` se lleva.

### [Quién alcanza a quién](redes.html){ target=_blank rel=noopener }

Tres contenedores, dos en una red creada a mano y uno en la de fábrica, y siete
órdenes de las que cuatro responden. Los dos modos de fallar dicen cosas
distintas: con el nombre el `ping` ni sale, y con la dirección sale y no llega.
Cierra con lo que gana una cadena de conexión que dice `db:5432` y con la red
que pide cada caso.

## Distribución

### [El nombre de una imagen y de dónde se baja](registros.html){ target=_blank rel=noopener }

`registro/usuario/imagen:tag`, y lo que no se escribe lo completa Docker.
Separe las partes de los cuatro nombres de la sesión, decida para qué hace falta
etiquetar una imagen antes de publicarla, y por qué dos despliegues seguidos de
`latest` pueden traer contenidos distintos.
