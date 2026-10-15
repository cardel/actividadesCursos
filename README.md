# Actividades interactivas

Las actividades que acompañan a los apuntes de los cursos: una página HTML por
actividad, con su JavaScript y su hoja de estilo, sin dependencias externas.

Viven aquí y no dentro de los apuntes porque el tema de una clase se repite cada
semestre y el número de clase no. La organización es por **curso y tema**:

```
ayg-puj/busqueda-binaria/buscar.html
estructuras-de-datos/lista-enlazada/insertar.html
comun/estilo.css        lo que comparten todos los cursos
flp/comun/mini-scheme.js   lo que comparte un curso
```

## Cómo se usan desde los apuntes

El repositorio de notas lo monta como submódulo en `docs/actividades/` y enlaza
cada actividad desde la página de ejercicios de la clase que toque ese semestre.
Una misma actividad la enlazan varios semestres.

## El enlace de vuelta

Cada actividad abre en una pestaña nueva y lleva arriba «Volver a los
ejercicios». Como no hay una página fija a la que volver, `comun/volver.js`
toma la del referente, que es la que enlazó la actividad. Si alguien entra
directo, quita el enlace.

Por eso las actividades se sirven desde el mismo origen que los apuntes: entre
dominios distintos el navegador recorta el referente y el enlace se pierde.

## Cómo se nombra una actividad

El título dice el **tema**, nunca el curso ni el número de clase. Una actividad
sobre relajación de aristas se llama así y sirve igual en Árboles y Grafos este
semestre y el que viene; si el título dijera «AyG C13», el primer cambio de
cronograma la dejaría mintiendo. El curso ya está en la ruta, que es donde
corresponde.

Lo mismo vale por dentro: el texto de la actividad no menciona la sesión, ni
«lo que vimos en clase», ni el número del ejercicio.

## Al agregar una actividad, actualice la tabla

El catálogo de abajo es lo que permite reutilizar: antes de escribir una
actividad nueva se mira si el tema ya tiene una. **Toda actividad que entre al
repositorio se agrega a la tabla en el mismo commit.** Una que no está en la
tabla no existe para quien busca.

## Catálogo

Son 311 actividades. El enlace lleva al archivo; para verlas funcionando hay que
abrirlas desde el sitio de notas, porque el enlace de vuelta usa el referente.

### Árboles y Grafos — `ayg-puj`

| Tema | Actividad | Qué pide |
|---|---|---|
| `bellman-ford-moore` | [`bellman`](ayg-puj/bellman-ford-moore/bellman.html) | Bellman-Ford |
|  | [`errores`](ayg-puj/bellman-ford-moore/errores.html) | Líneas cambiadas |
|  | [`estados`](ayg-puj/bellman-ford-moore/estados.html) | Grafo de estados |
|  | [`moore`](ayg-puj/bellman-ford-moore/moore.html) | Moore |
|  | [`negativo`](ayg-puj/bellman-ford-moore/negativo.html) | Ciclo negativo |
|  | [`red`](ayg-puj/bellman-ford-moore/red.html) | La red |
| `busqueda-binaria` | [`biseccion`](ayg-puj/busqueda-binaria/biseccion.html) | el intervalo que encierra la respuesta |
|  | [`buscar`](ayg-puj/busqueda-binaria/buscar.html) | la ventana que se encoge |
|  | [`resolver`](ayg-puj/busqueda-binaria/resolver.html) | resolver un problema con bisección, paso a paso |
| `caminos-minimos-generalidades` | [`amplitud`](ayg-puj/caminos-minimos-generalidades/amplitud.html) | Amplitud |
|  | [`distancias`](ayg-puj/caminos-minimos-generalidades/distancias.html) | Distancias |
|  | [`karistas`](ayg-puj/caminos-minimos-generalidades/karistas.html) | A lo sumo k aristas |
|  | [`problemas`](ayg-puj/caminos-minimos-generalidades/problemas.html) | Problemas |
|  | [`relajar`](ayg-puj/caminos-minimos-generalidades/relajar.html) | Relajación |
| `conectividad` | [`componentes`](ayg-puj/conectividad/componentes.html) | un recorrido por componente |
|  | [`conexo`](ayg-puj/conectividad/conexo.html) | conexo, débil o fuerte |
|  | [`cortes`](ayg-puj/conectividad/cortes.html) | puntos de articulación y puentes |
|  | [`errores`](ayg-puj/conectividad/errores.html) | tres fallas en Kosaraju |
|  | [`kosaraju`](ayg-puj/conectividad/kosaraju.html) | las dos pasadas |
|  | [`red`](ayg-puj/conectividad/red.html) | quince páginas y sus enlaces |
|  | [`tiempos`](ayg-puj/conectividad/tiempos.html) | los dos relojes y el orden por finalización |
|  | [`transpuesto`](ayg-puj/conectividad/transpuesto.html) | el grafo al revés y el grafo de componentes |
| `grafos-implicitos` | [`bosque`](ayg-puj/grafos-implicitos/bosque.html) | el peligro se calcula, no se lee |
|  | [`componentes`](ayg-puj/grafos-implicitos/componentes.html) | un recorrido por cada grupo |
|  | [`errores`](ayg-puj/grafos-implicitos/errores.html) | tres fallas sobre cuadrículas |
|  | [`estados`](ayg-puj/grafos-implicitos/estados.html) | cuando el vértice no es la celda |
|  | [`laberinto`](ayg-puj/grafos-implicitos/laberinto.html) | la cuadrícula como grafo |
|  | [`ruta`](ayg-puj/grafos-implicitos/ruta.html) | la ruta con menos saltos |
| `invariantes` | [`burbuja`](ayg-puj/invariantes/burbuja.html) | un lema adentro, un teorema afuera |
|  | [`comprimir`](ayg-puj/invariantes/comprimir.html) | la lista que crece y el invariante que la sostiene |
|  | [`mayores`](ayg-puj/invariantes/mayores.html) | dos variables que se sostienen entre sí |
|  | [`rotado`](ayg-puj/invariantes/rotado.html) | inventar el predicado |
| `orden-topologico-dfs-low` | [`cortesdfs`](ayg-puj/orden-topologico-dfs-low/cortesdfs.html) | puntos de articulación y puentes en una sola pasada |
|  | [`criterio`](ayg-puj/orden-topologico-dfs-low/criterio.html) | la comparación que decide |
|  | [`errores`](ayg-puj/orden-topologico-dfs-low/errores.html) | tres fallas en cortes y en Tarjan |
|  | [`low`](ayg-puj/orden-topologico-dfs-low/low.html) | el valor low de cada vértice |
|  | [`ordenes`](ayg-puj/orden-topologico-dfs-low/ordenes.html) | cuáles listas son órdenes topológicos |
|  | [`red`](ayg-puj/orden-topologico-dfs-low/red.html) | la fibra de un campus y sus puntos únicos de falla |
|  | [`tarjan`](ayg-puj/orden-topologico-dfs-low/tarjan.html) | una sola búsqueda, una pila |
|  | [`topodfs`](ayg-puj/orden-topologico-dfs-low/topodfs.html) | el orden topológico con la profundidad |
| `orden-topologico-kahn` | [`ciclo`](ayg-puj/orden-topologico-kahn/ciclo.html) | cuando la cola se vacía antes |
|  | [`errores`](ayg-puj/orden-topologico-kahn/errores.html) | tres fallas en Kahn |
|  | [`grados`](ayg-puj/orden-topologico-kahn/grados.html) | cuántas flechas llegan |
|  | [`grande`](ayg-puj/orden-topologico-kahn/grande.html) | catorce módulos |
|  | [`kahn`](ayg-puj/orden-topologico-kahn/kahn.html) | la cola de fuentes |
|  | [`marcas`](ayg-puj/orden-topologico-kahn/marcas.html) | los colores y los tiempos del DFS |
|  | [`ordenes`](ayg-puj/orden-topologico-kahn/ordenes.html) | cuáles listas sirven |
|  | [`tareas`](ayg-puj/orden-topologico-kahn/tareas.html) | de la entrada al grafo |
|  | [`variantes`](ayg-puj/orden-topologico-kahn/variantes.html) | cola, pila y la fuente menor |
| `puentes-y-articulaciones` | [`arbolpuentes`](ayg-puj/puentes-y-articulaciones/arbolpuentes.html) | el árbol de puentes paso a paso |
|  | [`atacar`](ayg-puj/puentes-y-articulaciones/atacar.html) | leer el enunciado y decidir por dónde se corta |
|  | [`capital`](ayg-puj/puentes-y-articulaciones/capital.html) | las candidatas a capital |
|  | [`errores`](ayg-puj/puentes-y-articulaciones/errores.html) | tres líneas cambiadas en los cortes |
|  | [`interplanetary`](ayg-puj/puentes-y-articulaciones/interplanetary.html) | el recorrido que sube de influencia |
|  | [`orientar`](ayg-puj/puentes-y-articulaciones/orientar.html) | las calles de una ciudad, UVa 610 |
|  | [`paloma`](ayg-puj/puentes-y-articulaciones/paloma.html) | el valor de cada estación, UVa 10765 |
|  | [`recuento`](ayg-puj/puentes-y-articulaciones/recuento.html) | low, puntos de articulación y puentes |
| `recursion` | [`factorial`](ayg-puj/recursion/factorial.html) | los invariantes son suyos |
|  | [`mezclar`](ayg-puj/recursion/mezclar.html) | dos tramos ordenados en uno |
|  | [`ordenar`](ayg-puj/recursion/ordenar.html) | bajar partiendo, subir mezclando |
|  | [`sumar`](ayg-puj/recursion/sumar.html) | descubra los invariantes |
| `representaciones-y-recorridos` | [`amplitud`](ayg-puj/representaciones-y-recorridos/amplitud.html) | el vértice más lejano |
|  | [`construir`](ayg-puj/representaciones-y-recorridos/construir.html) | las cuatro representaciones, a mano |
|  | [`consultas`](ayg-puj/representaciones-y-recorridos/consultas.html) | la misma pregunta, cuatro costos |
|  | [`costo`](ayg-puj/representaciones-y-recorridos/costo.html) | V + E contra V² |
|  | [`errores`](ayg-puj/representaciones-y-recorridos/errores.html) | encuentre la falla |
|  | [`marcar`](ayg-puj/representaciones-y-recorridos/marcar.html) | por qué el recorrido necesita la marca |
|  | [`profundidad`](ayg-puj/representaciones-y-recorridos/profundidad.html) | el nivel en el árbol de la búsqueda |

### Estructuras de Datos — `estructuras-de-datos`

| Tema | Actividad | Qué pide |
|---|---|---|
| `abstraccion-tad` | [`caja`](estructuras-de-datos/abstraccion-tad/caja.html) | abstracción de datos |
|  | [`contrato`](estructuras-de-datos/abstraccion-tad/contrato.html) | precondiciones y this |
| `ciclos-dependientes-sumatorias` | [`contar_incluida`](estructuras-de-datos/ciclos-dependientes-sumatorias/contar_incluida.html) | contador de pasos |
|  | [`potencias`](estructuras-de-datos/ciclos-dependientes-sumatorias/potencias.html) | contador de pasos |
|  | [`suma_parejas`](estructuras-de-datos/ciclos-dependientes-sumatorias/suma_parejas.html) | contador de pasos |
|  | [`triangulo`](estructuras-de-datos/ciclos-dependientes-sumatorias/triangulo.html) | contador de pasos |
| `cola-implementacion` | [`costoscola`](estructuras-de-datos/cola-implementacion/costoscola.html) | lo que cobra cada operación |
|  | [`dosextremos`](estructuras-de-datos/cola-implementacion/dosextremos.html) | la cola necesita los dos extremos |
|  | [`encolar`](estructuras-de-datos/cola-implementacion/encolar.html) | la cola sobre la lista enlazada |
|  | [`residuo`](estructuras-de-datos/cola-implementacion/residuo.html) | la cola que ya tienen |
|  | [`vaciar`](estructuras-de-datos/cola-implementacion/vaciar.html) | sin la lista de por medio |
| `contenedores-list-deque-stack-queue` | [`bloques`](estructuras-de-datos/contenedores-list-deque-stack-queue/bloques.html) | deque: bloques y mapa |
|  | [`debajo`](estructuras-de-datos/contenedores-list-deque-stack-queue/debajo.html) | stack y queue: lo que va debajo |
|  | [`empalmar`](estructuras-de-datos/contenedores-list-deque-stack-queue/empalmar.html) | list: splice y sort |
|  | [`escoger`](estructuras-de-datos/contenedores-list-deque-stack-queue/escoger.html) | Cuál escoger |
|  | [`invalidar`](estructuras-de-datos/contenedores-list-deque-stack-queue/invalidar.html) | deque: lo que sigue valiendo |
|  | [`iterador`](estructuras-de-datos/contenedores-list-deque-stack-queue/iterador.html) | list: un iterador que no se pierde |
|  | [`ladocorto`](estructuras-de-datos/contenedores-list-deque-stack-queue/ladocorto.html) | deque: el lado más corto |
|  | [`mitad`](estructuras-de-datos/contenedores-list-deque-stack-queue/mitad.html) | Medir: insertar en la mitad |
|  | [`traducir`](estructuras-de-datos/contenedores-list-deque-stack-queue/traducir.html) | Lo que ya está construido: del TAD a la biblioteca |
|  | [`vaciar`](estructuras-de-datos/contenedores-list-deque-stack-queue/vaciar.html) | Medir: vaciar por el frente |
| `ejercicios-complejidad` | [`combinado`](estructuras-de-datos/ejercicios-complejidad/combinado.html) | ¿cuál bloque manda? |
|  | [`mitades`](estructuras-de-datos/ejercicios-complejidad/mitades.html) | contador de pasos |
|  | [`paso_grande`](estructuras-de-datos/ejercicios-complejidad/paso_grande.html) | contador de pasos |
|  | [`todos_positivos`](estructuras-de-datos/ejercicios-complejidad/todos_positivos.html) | mejor y peor caso |
| `ejercicios-tad-lista-pila-cola` | [`cola`](estructuras-de-datos/ejercicios-tad-lista-pila-cola/cola.html) | ejercicios con los TAD |
|  | [`costos`](estructuras-de-datos/ejercicios-tad-lista-pila-cola/costos.html) | ejercicios con los TAD |
|  | [`dospilas`](estructuras-de-datos/ejercicios-tad-lista-pila-cola/dospilas.html) | ejercicios con los TAD |
|  | [`lista`](estructuras-de-datos/ejercicios-tad-lista-pila-cola/lista.html) | ejercicios con los TAD |
|  | [`pila`](estructuras-de-datos/ejercicios-tad-lista-pila-cola/pila.html) | ejercicios con los TAD |
| `implementaciones-y-quicksort` | [`caminar`](estructuras-de-datos/implementaciones-y-quicksort/caminar.html) | las tres implementaciones enlazadas |
|  | [`comparaciones`](estructuras-de-datos/implementaciones-y-quicksort/comparaciones.html) | lo que cuesta quicksort |
|  | [`concatenar`](estructuras-de-datos/implementaciones-y-quicksort/concatenar.html) | ejercicios sobre las implementaciones |
|  | [`libre`](estructuras-de-datos/implementaciones-y-quicksort/libre.html) | particionar su propio arreglo |
|  | [`particionar`](estructuras-de-datos/implementaciones-y-quicksort/particionar.html) | pagar al partir |
|  | [`peorcaso`](estructuras-de-datos/implementaciones-y-quicksort/peorcaso.html) | lo que cuesta quicksort |
|  | [`rotar`](estructuras-de-datos/implementaciones-y-quicksort/rotar.html) | ejercicios sobre las implementaciones |
|  | [`zonas`](estructuras-de-datos/implementaciones-y-quicksort/zonas.html) | las cuatro zonas de particionar |
| `lista-enlazada` | [`agregar`](estructuras-de-datos/lista-enlazada/agregar.html) | la lista enlazada |
|  | [`corrimientos`](estructuras-de-datos/lista-enlazada/corrimientos.html) | la lista enlazada |
|  | [`costos`](estructuras-de-datos/lista-enlazada/costos.html) | la lista enlazada |
|  | [`enlazada`](estructuras-de-datos/lista-enlazada/enlazada.html) | la lista enlazada |
|  | [`insertion`](estructuras-de-datos/lista-enlazada/insertion.html) | la lista enlazada |
|  | [`nodos`](estructuras-de-datos/lista-enlazada/nodos.html) | la lista enlazada |
| `lista-enlazada-variantes` | [`circular`](estructuras-de-datos/lista-enlazada-variantes/circular.html) | la cadena que se cierra |
|  | [`desenlazar`](estructuras-de-datos/lista-enlazada-variantes/desenlazar.html) | el nodo que mira atrás |
|  | [`ladocorto`](estructuras-de-datos/lista-enlazada-variantes/ladocorto.html) | la mitad del camino |
|  | [`mezclar`](estructuras-de-datos/lista-enlazada-variantes/mezclar.html) | ordenar partiendo y mezclando |
|  | [`variantes`](estructuras-de-datos/lista-enlazada-variantes/variantes.html) | lo que cobra cada implementación |
| `memoria-en-c` | [`dos_punteros`](estructuras-de-datos/memoria-en-c/dos_punteros.html) | valores contra direcciones |
|  | [`errores`](estructuras-de-datos/memoria-en-c/errores.html) | el fragmento que compila y falla |
|  | [`punteros`](estructuras-de-datos/memoria-en-c/punteros.html) | la primera traza |
| `notacion-o` | [`escalera`](estructuras-de-datos/notacion-o/escalera.html) | clases de crecimiento |
|  | [`testigos`](estructuras-de-datos/notacion-o/testigos.html) | la notación O |
| `paso-por-referencia` | [`objetos`](estructuras-de-datos/paso-por-referencia/objetos.html) | repaso de POO |
|  | [`trazas`](estructuras-de-datos/paso-por-referencia/trazas.html) | paso de parámetros |
| `pila-implementacion` | [`apilar`](estructuras-de-datos/pila-implementacion/apilar.html) | la pila sobre la lista enlazada |
|  | [`cima`](estructuras-de-datos/pila-implementacion/cima.html) | sin la lista de por medio |
|  | [`costos`](estructuras-de-datos/pila-implementacion/costos.html) | lo que cobra cada operación |
|  | [`cuantas`](estructuras-de-datos/pila-implementacion/cuantas.html) | cuántas secuencias imprime UVa 732 |
|  | [`extremo`](estructuras-de-datos/pila-implementacion/extremo.html) | una pila es una lista por un solo extremo |
|  | [`jugadas`](estructuras-de-datos/pila-implementacion/jugadas.html) | qué jugadas se pueden en UVa 732 |
|  | [`retroceso`](estructuras-de-datos/pila-implementacion/retroceso.html) | el recorrido de UVa 732 estado por estado |
|  | [`tope`](estructuras-de-datos/pila-implementacion/tope.html) | la pila que ya tienen |
| `punteros-arreglos` | [`aritmetica`](estructuras-de-datos/punteros-arreglos/aritmetica.html) | punteros y arreglos |
|  | [`rowmajor`](estructuras-de-datos/punteros-arreglos/rowmajor.html) | la tabla en una sola calle |
| `stl-contenedores` | [`algoritmos`](estructuras-de-datos/stl-contenedores/algoritmos.html) | la STL de C++ |
|  | [`cadena`](estructuras-de-datos/stl-contenedores/cadena.html) | la STL de C++ |
|  | [`contenedores`](estructuras-de-datos/stl-contenedores/contenedores.html) | la STL de C++ |
|  | [`costos`](estructuras-de-datos/stl-contenedores/costos.html) | la STL de C++ |
|  | [`vector`](estructuras-de-datos/stl-contenedores/vector.html) | la STL de C++ |
| `stl-iteradores-algoritmos` | [`borrar`](estructuras-de-datos/stl-iteradores-algoritmos/borrar.html) | iteradores y algoritmos de la STL |
|  | [`buscar`](estructuras-de-datos/stl-iteradores-algoritmos/buscar.html) | iteradores y algoritmos de la STL |
|  | [`costos`](estructuras-de-datos/stl-iteradores-algoritmos/costos.html) | iteradores y algoritmos de la STL |
|  | [`ejercicios`](estructuras-de-datos/stl-iteradores-algoritmos/ejercicios.html) | iteradores y algoritmos de la STL |
|  | [`iterador`](estructuras-de-datos/stl-iteradores-algoritmos/iterador.html) | iteradores y algoritmos de la STL |
| `tad-lista-pila-cola` | [`cola`](estructuras-de-datos/tad-lista-pila-cola/cola.html) | TAD Lista, Pila y Cola |
|  | [`disciplinas`](estructuras-de-datos/tad-lista-pila-cola/disciplinas.html) | TAD Lista, Pila y Cola |
|  | [`juntos`](estructuras-de-datos/tad-lista-pila-cola/juntos.html) | TAD Lista, Pila y Cola |
|  | [`lista`](estructuras-de-datos/tad-lista-pila-cola/lista.html) | TAD Lista, Pila y Cola |
|  | [`pila`](estructuras-de-datos/tad-lista-pila-cola/pila.html) | TAD Lista, Pila y Cola |

### Interpretación y Compilación de Lenguajes — `flp`

| Tema | Actividad | Qué pide |
|---|---|---|
| `datatypes-y-arboles-sintaxis-abstracta` | [`arboles`](flp/datatypes-y-arboles-sintaxis-abstracta/arboles.html) | ¿Cuál árbol es? |
|  | [`cases`](flp/datatypes-y-arboles-sintaxis-abstracta/cases.html) | Recorrer con cases |
|  | [`construir`](flp/datatypes-y-arboles-sintaxis-abstracta/construir.html) | Construir el árbol a mano |
|  | [`datatype`](flp/datatypes-y-arboles-sintaxis-abstracta/datatype.html) | ¿Compila este datatype? |
|  | [`declarar`](flp/datatypes-y-arboles-sintaxis-abstracta/declarar.html) | Escribir el datatype |
|  | [`desde-arbol`](flp/datatypes-y-arboles-sintaxis-abstracta/desde-arbol.html) | Del árbol a la gramática |
|  | [`evaluar`](flp/datatypes-y-arboles-sintaxis-abstracta/evaluar.html) | Evaluar y reescribir |
|  | [`gramatica`](flp/datatypes-y-arboles-sintaxis-abstracta/gramatica.html) | ¿Cuál datatype le corresponde? |
|  | [`lista`](flp/datatypes-y-arboles-sintaxis-abstracta/lista.html) | Leer el programa como lista |
|  | [`parsear`](flp/datatypes-y-arboles-sintaxis-abstracta/parsear.html) | Parser y unparser con sintaxis infija |
|  | [`parser`](flp/datatypes-y-arboles-sintaxis-abstracta/parser.html) | Parser y unparser de comandos |
| `induccion-y-recursion` | [`alcance`](flp/induccion-y-recursion/alcance.html) | Declaración, referencia y alcance |
|  | [`bnf`](flp/induccion-y-recursion/bnf.html) | Gramáticas BNF |
|  | [`condicionales`](flp/induccion-y-recursion/condicionales.html) | if y cond |
|  | [`induccion`](flp/induccion-y-recursion/induccion.html) | Especificación inductiva de datos |
|  | [`ligaduras`](flp/induccion-y-recursion/ligaduras.html) | let, let* y letrec |
|  | [`locales`](flp/induccion-y-recursion/locales.html) | Ligaduras locales al recorrer la gramática |
|  | [`prefija`](flp/induccion-y-recursion/prefija.html) | Notación prefija y definiciones |
|  | [`reconocedores`](flp/induccion-y-recursion/reconocedores.html) | De las reglas al reconocedor |
|  | [`recorridos`](flp/induccion-y-recursion/recorridos.html) | Recorrer siguiendo la gramática |
|  | [`recursion`](flp/induccion-y-recursion/recursion.html) | Recursión lineal y recursión de cola |
|  | [`repl`](flp/induccion-y-recursion/repl.html) | escribir y correr |
|  | [`simbolicas`](flp/induccion-y-recursion/simbolicas.html) | Listas simbólicas y procedimientos como valores |
| `procedimientos-recursivos-letrec` | [`cierre`](flp/procedimientos-recursivos-letrec/cierre.html) | Contar consultas y extender el lenguaje |
|  | [`dibujar`](flp/procedimientos-recursivos-letrec/dibujar.html) | Dibujar la cadena con un marco recursivo |
|  | [`diferida`](flp/procedimientos-recursivos-letrec/diferida.html) | Cuándo nace la clausura |
|  | [`encuentra`](flp/procedimientos-recursivos-letrec/encuentra.html) | El procedimiento que no se encuentra a sí mismo |
|  | [`gramatica`](flp/procedimientos-recursivos-letrec/gramatica.html) | La producción de letrec |
|  | [`listas`](flp/procedimientos-recursivos-letrec/listas.html) | El ambiente recursivo con listas etiquetadas |
|  | [`marco`](flp/procedimientos-recursivos-letrec/marco.html) | El ambiente extendido recursivo |
|  | [`mutua`](flp/procedimientos-recursivos-letrec/mutua.html) | Recursión mutua |
|  | [`trazas`](flp/procedimientos-recursivos-letrec/trazas.html) | La traza de una recursión |
| `procedimientos-y-alcance-estatico` | [`alcance`](flp/procedimientos-y-alcance-estatico/alcance.html) | Alcance estático y alcance dinámico |
|  | [`cadena`](flp/procedimientos-y-alcance-estatico/cadena.html) | La cadena de ambientes |
|  | [`clausuras`](flp/procedimientos-y-alcance-estatico/clausuras.html) | Procedimientos y clausuras |
|  | [`condicional`](flp/procedimientos-y-alcance-estatico/condicional.html) | El condicional y su regla |
|  | [`dibujar`](flp/procedimientos-y-alcance-estatico/dibujar.html) | Dibujar la cadena de ambientes |
|  | [`falta`](flp/procedimientos-y-alcance-estatico/falta.html) | Qué le falta al evaluador |
|  | [`ligaduras`](flp/procedimientos-y-alcance-estatico/ligaduras.html) | Varias ligaduras a la vez |
|  | [`procedimientos`](flp/procedimientos-y-alcance-estatico/procedimientos.html) | Procedimientos en acción |
| `proceso-del-interpretador` | [`ambientes`](flp/proceso-del-interpretador/ambientes.html) | La ligadura local |
|  | [`compilado`](flp/proceso-del-interpretador/compilado.html) | Interpretar o compilar |
|  | [`etapas`](flp/proceso-del-interpretador/etapas.html) | Del texto al resultado |
|  | [`simulador`](flp/proceso-del-interpretador/simulador.html) | El interpretador por dentro |
|  | [`sllgen`](flp/proceso-del-interpretador/sllgen.html) | Leer una especificación de SLLGEN |
|  | [`tokens`](flp/proceso-del-interpretador/tokens.html) | Lo que ve el scanner |
|  | [`traza`](flp/proceso-del-interpretador/traza.html) | El reparto del trabajo al evaluar |
|  | [`valores`](flp/proceso-del-interpretador/valores.html) | Los valores del lenguaje y el punto de entrada |
| `tad-y-ambientes` | [`ambiente`](flp/tad-y-ambientes/ambiente.html) | Predecir apply-env |
|  | [`arreglar`](flp/tad-y-ambientes/arreglar.html) | Arreglar el cliente |
|  | [`bignum`](flp/tad-y-ambientes/bignum.html) | Bignum en base 10 |
|  | [`cliente`](flp/tad-y-ambientes/cliente.html) | ¿Sobrevive el cliente? |
|  | [`cola`](flp/tad-y-ambientes/cola.html) | El cliente una sola vez |
|  | [`contrato`](flp/tad-y-ambientes/contrato.html) | ¿Cumple el contrato? |
|  | [`env-clientes`](flp/tad-y-ambientes/env-clientes.html) | Clientes del ambiente |
|  | [`valor`](flp/tad-y-ambientes/valor.html) | ¿Cuánto vale este dato? |

### Infraestructuras Paralelas y Distribuidas — `infra`

| Tema | Actividad | Qué pide |
|---|---|---|
| `estrategias-de-paralelizacion` | [`balanceo`](infra/estrategias-de-paralelizacion/balanceo.html) | 64 tareas que no cuestan lo mismo |
|  | [`elegir`](infra/estrategias-de-paralelizacion/elegir.html) | qué estrategia pide cada problema |
|  | [`granularidad`](infra/estrategias-de-paralelizacion/granularidad.html) | cuándo repartir cuesta más que calcular |
|  | [`mergesort`](infra/estrategias-de-paralelizacion/mergesort.html) | un hilo por división |
|  | [`pipeline`](infra/estrategias-de-paralelizacion/pipeline.html) | la etapa lenta manda |
|  | [`prefijos`](infra/estrategias-de-paralelizacion/prefijos.html) | los desplazamientos los escribe usted |
|  | [`pregunta`](infra/estrategias-de-paralelizacion/pregunta.html) | cuatro hilos que estorban o ayudan |
|  | [`rango`](infra/estrategias-de-paralelizacion/rango.html) | el rango y el grano |
|  | [`reparto`](infra/estrategias-de-paralelizacion/reparto.html) | quién se lleva el residuo |
|  | [`tareas`](infra/estrategias-de-paralelizacion/tareas.html) | un hilo por trabajo |
| `hilos-y-procesos-python` | [`barrido`](infra/hilos-y-procesos-python/barrido.html) | sumar cien millones de enteros |
|  | [`carrera`](infra/hilos-y-procesos-python/carrera.html) | Dos hilos abonando sobre el mismo saldo |
|  | [`cola`](infra/hilos-y-procesos-python/cola.html) | put y get sobre una Queue con capacidad |
|  | [`gil`](infra/hilos-y-procesos-python/gil.html) | ocho tareas repartidas entre hilos |
|  | [`memoria`](infra/hilos-y-procesos-python/memoria.html) | qué ve el padre y qué ve el hijo |
|  | [`procesos`](infra/hilos-y-procesos-python/procesos.html) | núcleos ocupados y tamaño mínimo |
|  | [`sincronizacion`](infra/hilos-y-procesos-python/sincronizacion.html) | cuál pide cada situación |
|  | [`traspaso`](infra/hilos-y-procesos-python/traspaso.html) | lo que cuesta empaquetar un dato |
|  | [`unir`](infra/hilos-y-procesos-python/unir.html) | dos hilos, dos versiones |
| `introduccion-programacion-paralela` | [`amdahl`](infra/introduccion-programacion-paralela/amdahl.html) | el techo de una paralelización |
|  | [`dependencias`](infra/introduccion-programacion-paralela/dependencias.html) | cuándo dejan de servir los procesadores |
|  | [`falso`](infra/introduccion-programacion-paralela/falso.html) | la línea que va y viene |
|  | [`localidad`](infra/introduccion-programacion-paralela/localidad.html) | la misma matriz, dos recorridos |
|  | [`walls`](infra/introduccion-programacion-paralela/walls.html) | por qué la frecuencia dejó de subir |
| `openmp-cpp` | [`comprobar`](infra/openmp-cpp/comprobar.html) | Cómo saber si de verdad corrieron doce hilos |
|  | [`depurar`](infra/openmp-cpp/depurar.html) | Depurar un programa de OpenMP |
|  | [`enfoques`](infra/openmp-cpp/enfoques.html) | Tres formas de paralelizar el mismo ciclo |
|  | [`escalado`](infra/openmp-cpp/escalado.html) | aceleración y eficiencia |
|  | [`hilos`](infra/openmp-cpp/hilos.html) | Quién decide cuántos hilos abre la región |
|  | [`proteger`](infra/openmp-cpp/proteger.html) | critical, atomic o reduction |
|  | [`recorrido`](infra/openmp-cpp/recorrido.html) | El orden del recorrido y la línea de caché |
|  | [`reduccion`](infra/openmp-cpp/reduccion.html) | Tres escrituras de la misma reducción en OpenMP |
|  | [`reparto`](infra/openmp-cpp/reparto.html) | schedule y regiones anidadas |
|  | [`variables`](infra/openmp-cpp/variables.html) | shared, private y firstprivate |
| `profiling-linux` | [`cache`](infra/profiling-linux/cache.html) | Contar los fallos de caché con Valgrind |
|  | [`contadores`](infra/profiling-linux/contadores.html) | Los contadores del procesador |
|  | [`dosprogramas`](infra/profiling-linux/dosprogramas.html) | Dos programas que hacen la misma cuenta |
|  | [`herramientas`](infra/profiling-linux/herramientas.html) | La misma diferencia, medida de cuatro formas |
|  | [`llamadas`](infra/profiling-linux/llamadas.html) | Contar llamadas al sistema |
|  | [`procesos`](infra/profiling-linux/procesos.html) | Un programa paralelo visto desde afuera |
| `profiling-python-avx` | [`carriles`](infra/profiling-python-avx/carriles.html) | cuatro double por instrucción |
|  | [`gpu`](infra/profiling-python-avx/gpu.html) | cuándo compensa la GPU |
|  | [`herramientas`](infra/profiling-python-avx/herramientas.html) | cuál contesta cada pregunta sobre ruta.py |
|  | [`llamadas`](infra/profiling-python-avx/llamadas.html) | lo que cuenta cProfile |
|  | [`muestreo`](infra/profiling-python-avx/muestreo.html) | qué ve un perfilador estadístico |
|  | [`relojes`](infra/profiling-python-avx/relojes.html) | un programa por tramos |
|  | [`repeticiones`](infra/profiling-python-avx/repeticiones.html) | la suma de las repeticiones y lo que el setup deja fuera |
|  | [`techo`](infra/profiling-python-avx/techo.html) | cuánto rinde acelerar una función |

### Programación Funcional y Concurrente — `pfc`

| Tema | Actividad | Qué pide |
|---|---|---|
| `arboles-algebraicos-y-patrones` | [`compartir`](pfc/arboles-algebraicos-y-patrones/compartir.html) | qué construye una inserción |
|  | [`despacho`](pfc/arboles-algebraicos-y-patrones/despacho.html) | qué pertenece corre en cada nodo |
|  | [`evaluar`](pfc/arboles-algebraicos-y-patrones/evaluar.html) | elija el paso que sigue en eval |
|  | [`exhaustividad`](pfc/arboles-algebraicos-y-patrones/exhaustividad.html) | qué cambia sealed cuando falta un caso |
|  | [`mezclar`](pfc/arboles-algebraicos-y-patrones/mezclar.html) | qué le exige un trait a la clase |
|  | [`mismoConjunto`](pfc/arboles-algebraicos-y-patrones/mismoConjunto.html) | el mismo árbol con class y con case class |
|  | [`mismoTexto`](pfc/arboles-algebraicos-y-patrones/mismoTexto.html) | dos árboles, un solo texto |
|  | [`orden`](pfc/arboles-algebraicos-y-patrones/orden.html) | el primer caso que casa gana |
|  | [`recorrido`](pfc/arboles-algebraicos-y-patrones/recorrido.html) | en qué orden cierra cada nodo |
|  | [`simplificar`](pfc/arboles-algebraicos-y-patrones/simplificar.html) | qué devuelve cada llamada |
| `clases-y-abstraccion-de-datos` | [`claseRacional`](pfc/clases-y-abstraccion-de-datos/claseRacional.html) | prediga lo que responde el REPL |
|  | [`dosEnteros`](pfc/clases-y-abstraccion-de-datos/dosEnteros.html) | ¿por qué abstraer datos? |
|  | [`externasVsMetodos`](pfc/clases-y-abstraccion-de-datos/externasVsMetodos.html) | de funciones externas a métodos |
|  | [`mcdEnMemoria`](pfc/clases-y-abstraccion-de-datos/mcdEnMemoria.html) | cuántas veces corre el mcd |
|  | [`operadores`](pfc/clases-y-abstraccion-de-datos/operadores.html) | prediga las siete respuestas |
|  | [`privados`](pfc/clases-y-abstraccion-de-datos/privados.html) | qué alcanza el cliente de Racional |
|  | [`punto2d`](pfc/clases-y-abstraccion-de-datos/punto2d.html) | la tabla de Punto antes de correrla |
|  | [`sustitucion`](pfc/clases-y-abstraccion-de-datos/sustitucion.html) | produzca cada reescritura antes de verla |
| `evaluacion-y-sustitucion` | [`evaluacion`](pfc/evaluacion-y-sustitucion/evaluacion.html) | por valor y por nombre |
|  | [`sustituir`](pfc/evaluacion-y-sustitucion/sustituir.html) | la expresión que se encoge |
| `funciones-de-alto-orden` | [`alReves`](pfc/funciones-de-alto-orden/alReves.html) | arme la llamada que delata el error |
|  | [`derivada`](pfc/funciones-de-alto-orden/derivada.html) | calcule con la fórmula |
|  | [`esqueleto`](pfc/funciones-de-alto-orden/esqueleto.html) | qué cambia entre tres sumas |
|  | [`literales`](pfc/funciones-de-alto-orden/literales.html) | qué hace cada literal dentro de suma |
|  | [`precedencia`](pfc/funciones-de-alto-orden/precedencia.html) | hasta dónde llega el cuerpo |
|  | [`reducirC`](pfc/funciones-de-alto-orden/reducirC.html) | lo que devuelve cada llamada |
|  | [`siguiente`](pfc/funciones-de-alto-orden/siguiente.html) | elija el paso que sigue |
|  | [`suma2`](pfc/funciones-de-alto-orden/suma2.html) | cuándo corre lo que devuelve |
|  | [`sumador`](pfc/funciones-de-alto-orden/sumador.html) | una función que fabrica funciones |
|  | [`tipos`](pfc/funciones-de-alto-orden/tipos.html) | qué tipo tiene cada expresión |
|  | [`traza`](pfc/funciones-de-alto-orden/traza.html) | la tabla de suma antes de correrla |
|  | [`trazaRota`](pfc/funciones-de-alto-orden/trazaRota.html) | encuentre el paso equivocado |
| `listas-y-ordenamiento` | [`construir`](pfc/listas-y-ordenamiento/construir.html) | Nil, :: y las tres operaciones básicas |
|  | [`empaquetar`](pfc/listas-y-ordenamiento/empaquetar.html) | la traza con span, paso a paso |
|  | [`insercion`](pfc/listas-y-ordenamiento/insercion.html) | en qué posición queda el elemento que se inserta |
|  | [`mapFilter`](pfc/listas-y-ordenamiento/mapFilter.html) | prediga las dos listas de salida |
|  | [`merge`](pfc/listas-y-ordenamiento/merge.html) | prediga cuál cabeza sale en cada paso |
|  | [`msort`](pfc/listas-y-ordenamiento/msort.html) | dividir, ordenar cada mitad y mezclar |
|  | [`patrones`](pfc/listas-y-ordenamiento/patrones.html) | qué caso del match corresponde con la lista |
|  | [`polimorfico`](pfc/listas-y-ordenamiento/polimorfico.html) | msort para cualquier tipo |
|  | [`reduceFold`](pfc/listas-y-ordenamiento/reduceFold.html) | elija el valor de cada expresión |
|  | [`reversa`](pfc/listas-y-ordenamiento/reversa.html) | la concatenación que queda pendiente en cada marco |
|  | [`reversaFold`](pfc/listas-y-ordenamiento/reversaFold.html) | el acumulador que crece por el frente |
|  | [`sumarVec`](pfc/listas-y-ordenamiento/sumarVec.html) | la traza de la suma de vectores |
| `recursion-de-cola-y-procesos` | [`acumulador`](pfc/recursion-de-cola-y-procesos/acumulador.html) | el resultado viaja en un parámetro |
|  | [`agotar`](pfc/recursion-de-cola-y-procesos/agotar.html) | qué se acaba primero |
|  | [`arbol`](pfc/recursion-de-cola-y-procesos/arbol.html) | partir el problema en dos |
|  | [`casobase`](pfc/recursion-de-cola-y-procesos/casobase.html) | cuál de estas cuatro |
|  | [`cola`](pfc/recursion-de-cola-y-procesos/cola.html) | cuál sigue siendo de cola |
|  | [`contar`](pfc/recursion-de-cola-y-procesos/contar.html) | la pila que crece y encoge |
|  | [`cuentas`](pfc/recursion-de-cola-y-procesos/cuentas.html) | tres procesos, una tabla |
|  | [`pendientes`](pfc/recursion-de-cola-y-procesos/pendientes.html) | lineal frente a cola |
|  | [`reducir`](pfc/recursion-de-cola-y-procesos/reducir.html) | la expresión que se reemplaza |

### Series temporales — `series-temporales`

| Tema | Actividad | Qué pide |
|---|---|---|
| `autocorrelacion` | [`ar1`](series-temporales/autocorrelacion/ar1.html) | El φ de un AR(1) |
|  | [`bandas`](series-temporales/autocorrelacion/bandas.html) | ¿Cuánto mide la banda? |
|  | [`correlogramas`](series-temporales/autocorrelacion/correlogramas.html) | ¿De cuál serie es este correlograma? |
|  | [`diferencias`](series-temporales/autocorrelacion/diferencias.html) | Diferenciar y mirar la ACF |
|  | [`rezago`](series-temporales/autocorrelacion/rezago.html) | El mes contra el de k meses atrás |
