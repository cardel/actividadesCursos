# Ejercicios · Infra · Docker Compose y Swarm

De un servicio suelto a varios que se levantan juntos, y de una máquina a un
clúster. Los apartados van en el orden de la sesión y todos se resuelven en el
navegador. Las cifras y las trazas son las de la sesión: el contador que sube
entre dos peticiones, la columna de puertos que distingue lo publicado de lo
que solo se alcanza por dentro, lo que queda en el disco después de bajar el
sistema, el reparto de tres réplicas entre tres nodos y los lotes de una
actualización progresiva. Antes de ver un número hay que escoger uno, y cada
respuesta equivocada dice por qué no.

## Volúmenes y redes

Los dos mecanismos sobre los que se apoya todo lo demás ya tienen su ejercicio
en la sesión anterior, y aquí se vuelven a usar tal cual.

### [Lo que sobrevive al contenedor](../docker-imagenes/volumenes.html){ target=_blank rel=noopener }

La capa escribible que nace y muere con el contenedor, el volumen que no, y la
base de datos que amanece vacía cuando nadie montó nada.

### [Quién alcanza a quién](../docker-imagenes/redes.html){ target=_blank rel=noopener }

Siete `ping` entre tres contenedores repartidos en dos redes, con los dos modos
distintos de fallar: el nombre que nadie traduce y el paquete que sale y no
llega.

## Fundamentos de Compose

### [De tres `docker run` a un archivo](de-run-a-compose.html){ target=_blank rel=noopener }

Qué clave del `compose.yml` reemplaza a cada bandera de la línea de órdenes, y
por qué en `docker compose ps` la base y la caché muestran su puerto sin
ninguna dirección delante mientras el servicio web sí publica. Cierra con las
dos peticiones y lo que prueba cada dato: el contador que pasa de 1 a 2, el
`db_ok` en verdadero y la dirección que aparece en la última línea del log.

### [Anatomía del `compose.yml`](anatomia.html){ target=_blank rel=noopener }

Las cuatro secciones de raíz y qué va en cada una, y el error que más se
comete: confundir la lista de referencias que va dentro de un servicio con la
definición que tiene que estar en la raíz. Termina contando cuántos
contenedores deja un archivo de tres servicios y de dónde sale el número con
que Compose los nombra.

### [`depends_on` y lo que de verdad espera](depends-on.html){ target=_blank rel=noopener }

Las tres condiciones y cuándo va cada una. El centro del ejercicio es por qué
`depends_on` a secas ordena la creación y nada más, de modo que la base arranca
primero y el servicio web ya está pidiendo cuando PostgreSQL todavía no acepta
conexiones. Con el `healthcheck` del ejemplo hay que calcular en cuánto tiempo
se da por caído.

## Operación con Compose

### [El ciclo del día a día](operacion.html){ target=_blank rel=noopener }

Las nueve órdenes que se usan todo el tiempo, clasificadas entre las que solo
miran y las que crean, paran o borran. Después, lo que de verdad hay que tener
claro antes de escribir `down`: cuántas filas quedan en la base al volver a
levantar el sistema, qué se lleva `down -v` y por qué el contador de la caché
no corre la misma suerte que la tabla.

### [Escalar sin balanceador](escalado.html){ target=_blank rel=noopener }

Cuántos contenedores deja `--scale web=3`, por qué la orden falla cuando el
servicio fija un puerto del anfitrión, y el límite que importa: Compose levanta
las réplicas y no reparte el tráfico entre ellas. Cierra con cuántos servicios
recrea un `up -d` después de editar una sola parte del archivo.

## Introducción a Docker Swarm

### [El clúster: manager y worker](swarm-cluster.html){ target=_blank rel=noopener }

Qué resuelve el clúster que Compose plano no, y el reparto de
responsabilidades entre quien decide y quien ejecuta, incluidas las que son de
los dos. Con la salida de `docker swarm init` en una sola máquina: por qué ese
nodo solitario ya aparece como líder y de dónde sacó la dirección que anuncia.

## Servicios distribuidos en Swarm

### [Tres réplicas y un solo puerto](servicios-replicas.html){ target=_blank rel=noopener }

Qué cuenta la columna `3/3` y qué se lee mientras una tarea arranca, cómo el
planificador repartió las tres tareas entre los tres nodos sin que nadie se lo
pidiera, y la diferencia que separa esto de `--scale`: el puerto es del
servicio y responde en todos los nodos, no de la réplica.

### [La actualización, lote por lote](rolling.html){ target=_blank rel=noopener }

Con seis réplicas y dos por lote, cuántos lotes salen y cuánto suma la espera.
Hay que seguir la traza momento a momento contando cuántas tareas conviven,
que es lo que cambia entre arrancar la nueva antes de parar la vieja y hacerlo
al revés, y decidir qué ocurre cuando el segundo lote no sirve.
