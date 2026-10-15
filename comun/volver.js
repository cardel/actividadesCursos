// volver.js -- el enlace "Volver a los ejercicios" de cada actividad.
//
// Antes cada actividad traia href="../Ejercicios/", que solo era correcto
// mientras vivia dentro de la carpeta de su clase. Aqui una actividad la
// reutilizan varios semestres y varios cursos, asi que no hay una pagina fija
// a la que volver.
//
// La pagina de la que vino el estudiante si la sabe el navegador: es el
// referente. Los apuntes abren las actividades con target=_blank, de modo que
// history.back() no sirve -- en una pestana recien abierta no hay a donde
// volver-- pero el referente llega igual, porque la navegacion es del mismo
// origen.
//
// Si no hay referente, el estudiante entro directo (un marcador, un enlace
// compartido) y el enlace sobra: se quita en vez de dejar uno muerto.
(function () {
  var origen = document.referrer;
  document.querySelectorAll("a.volver").forEach(function (a) {
    if (origen) {
      a.href = origen;
    } else {
      a.remove();
    }
  });
})();
