# Ejercicios · AyG PUJ · Caminos en un DAG y Dijkstra

Cuatro ejercicios para el navegador, organizados por los temas de la sesión y en el
mismo orden. Los dos primeros corren el código Python del titular, línea por línea. Ninguno
usa los grafos de las diapositivas ni los de sus ejercicios propuestos. El de Super Mario,
sobre el mismo tema, está con los grafos de estado.

## Caminos más cortos en un DAG

### [Caminos más cortos en un DAG](dag.html){ target=_blank rel=noopener }

`topoSort` y `ssspDAG` línea por línea sobre tres DAG con pesos, uno de ellos con pesos negativos. Primero se arma el orden topológico con la cola de Kahn y después una sola pasada relaja las aristas de cada vértice en ese orden. Antes de ejecutar se predice la distancia a un vértice. Al final una tarjeta compara las aristas que examina y las que bajan una distancia con las de Bellman-Ford sobre el mismo grafo.

## El algoritmo de Dijkstra

### [Algoritmo de Dijkstra](dijkstra.html){ target=_blank rel=noopener }

`dijkstra` línea por línea sobre tres grafos con ciclos, con la cola de prioridad a la vista, `dist` y `pred` sobre cada vértice y los vértices ya procesados marcados. Antes de ejecutar se predice el orden en que se procesan los vértices. Se ven las parejas viejas que salen de la cola y se descartan, y al final cuántas parejas entraron y cuántas valieron.

## Los pesos negativos

### [Dijkstra con pesos negativos](negativos.html){ target=_blank rel=noopener }

Seis grafos con alguna arista negativa y sin ciclos negativos. En cada uno se decide si `dijkstraST` devuelve la distancia correcta y en qué vértice se rompe la propiedad de que lo que sale de la cola ya es final. La retroalimentación responde a cada opción. Después se corren `dijkstra` y Bellman-Ford lado a lado, con las veces que `dijkstra` procesa cada vértice.

## Qué algoritmo usar

### [Elegir el algoritmo de caminos más cortos](cual.html){ target=_blank rel=noopener }

Diez escenarios descritos en palabras. Se escoge entre BFS, caminos en un DAG, Dijkstra y Bellman-Ford-Moore, y la justificación que sostiene la elección. La retroalimentación dice por qué sirve o no sirve cada algoritmo y, si sirve, cuál es el más barato.

## Para resolver en papel

1. Con el orden topológico `[2, 3, 1, 5, 4, 0, 6]` del primer grafo de la actividad del DAG, escriba la tabla de `dist` y `pred` después de procesar cada vértice, y diga cuántas veces cambia `dist[0]`.

2. En el segundo grafo de la actividad de Dijkstra, escriba las parejas que entran a la cola en orden y marque cuáles resultan viejas. Compruebe que cada vértice alcanzable se procesa una sola vez.

3. Construya un grafo de tres vértices con una arista negativa en el que `dijkstraST` devuelva un valor mayor que la distancia mínima, y otro, también con una arista negativa, en el que devuelva el valor correcto. Diga qué cambia entre uno y otro.

4. Una agencia quiere el camino de menor costo entre dos ciudades. Los costos son enteros, pueden ser negativos y se garantiza que no hay ciclos de costo negativo, pero sí ciclos. Escoja el algoritmo, justifique y diga cuánto cuesta en función de $n$ y $m$.

## Problema de juez

UVa 10269, Adventure of Super Mario:
<https://onlinejudge.org/external/102/10269.pdf>, envío en
<https://onlinejudge.org/index.php?option=com_onlinejudge&Itemid=25&page=submit_problem&problemid=1210>.

El estado es el lugar, la carga que queda en la bota y los usos que faltan, y el parámetro de la búsqueda es el
tiempo. La propiedad que hace funcionar a Dijkstra es que las carreras con la bota no cuestan tiempo, así que
todos los pesos son no negativos. La trampa del enunciado es que dentro de un castillo solo se corre si la
carrera empieza ahí, con la carga completa.
