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
