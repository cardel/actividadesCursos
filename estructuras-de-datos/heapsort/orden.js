/* Construir un montículo de abajo arriba y ordenar con él. Es el código de
   heapsort en C++ con índices desde 0: bajar(a, n, i) trabaja sobre el
   prefijo a[0..n-1], construir baja desde n / 2 - 1 hasta 0, y heapsort
   cambia la raíz con la última casilla del montículo y baja la nueva raíz
   en un montículo una casilla más corto. Al bajar gana el izquierdo si los
   dos hijos son iguales, igual que en monticulo.h. */
var Orden = (function () {
  var M = typeof module !== "undefined" ? require("../monticulo/monti.js") : Monti;

  var CODIGO_BAJAR = [
    "// Baja la clave de i dentro de a[0..n-1].",
    "void bajar(vector<int> &a, int n, int i) {",
    "  bool sigue = true;",
    "  while (sigue) {",
    "    int izq = 2 * i + 1;",
    "    int der = 2 * i + 2;",
    "    int mayor = i;",
    "    if (izq < n && a[izq] > a[mayor]) {",
    "      mayor = izq;",
    "    }",
    "    if (der < n && a[der] > a[mayor]) {",
    "      mayor = der;",
    "    }",
    "    if (mayor != i) {",
    "      intercambiar(a, i, mayor);",
    "      i = mayor;",
    "    } else {",
    "      sigue = false;",
    "    }",
    "  }",
    "}"
  ];

  var CODIGO_CONSTRUIR = [
    "// Convierte un arreglo cualquiera en montículo de máximos.",
    "void construir(vector<int> &a) {",
    "  int n = (int) a.size();",
    "  int i = n / 2 - 1;",
    "  while (i >= 0) {",
    "    bajar(a, n, i);",
    "    i = i - 1;",
    "  }",
    "}"
  ];

  var CODIGO_HEAPSORT = [
    "// Ordena de menor a mayor sin arreglo auxiliar.",
    "void heapsort(vector<int> &a) {",
    "  construir(a);",
    "  int fin = (int) a.size() - 1;",
    "  while (fin > 0) {",
    "    intercambiar(a, 0, fin);",
    "    bajar(a, fin, 0);",
    "    fin = fin - 1;",
    "  }",
    "}"
  ];

  function intercambiar(a, i, j) {
    var aux = a[i];
    a[i] = a[j];
    a[j] = aux;
  }

  /* bajar(a, n, i). reg recibe una fila por comparación con los hijos;
     cmp cuenta las comparaciones entre claves, como las cuenta el código. */
  function bajar(a, n, i, reg, cmp) {
    var sigue = true;
    while (sigue) {
      var izq = 2 * i + 1;
      var der = 2 * i + 2;
      var mayor = i;
      if (izq < n) {
        cmp.v = cmp.v + 1;
        if (a[izq] > a[mayor]) { mayor = izq; }
      }
      if (der < n) {
        cmp.v = cmp.v + 1;
        if (a[der] > a[mayor]) { mayor = der; }
      }
      var fila = { i: i, izq: izq, der: der, n: n, clave: a[i], mayor: mayor,
        cambia: mayor !== i, hijos: [] };
      if (izq < n) { fila.hijos.push(a[izq]); }
      if (der < n) { fila.hijos.push(a[der]); }
      fila.antes = a.slice();
      if (mayor !== i) {
        fila.otra = a[mayor];
        intercambiar(a, i, mayor);
        i = mayor;
      } else {
        sigue = false;
      }
      fila.despues = a.slice();
      reg.push(fila);
    }
  }

  /* construir(a): devuelve el montículo, una entrada por cada llamada a
     bajar y los totales. */
  function construir(a0) {
    var a = a0.slice();
    var n = a.length;
    var llamadas = [];
    var cmp = { v: 0 };
    var i = Math.floor(n / 2) - 1;
    while (i >= 0) {
      var reg = [];
      var antes = a.slice();
      bajar(a, n, i, reg, cmp);
      llamadas.push({ i: i, antes: antes, despues: a.slice(), reg: reg,
        intercambios: reg.filter(function (f) { return f.cambia; }).length });
      i = i - 1;
    }
    var inter = llamadas.reduce(function (s, l) { return s + l.intercambios; }, 0);
    return { a: a, llamadas: llamadas, intercambios: inter, comparaciones: cmp.v };
  }

  /* Lo que cuesta llegar al mismo montículo con n inserciones seguidas. */
  function porInserciones(a0) {
    var a = [];
    var inter = 0;
    a0.forEach(function (k) {
      var r = M.insertar(a, k);
      inter = inter + r.intercambios;
      a = r.a;
    });
    return { a: a, intercambios: inter };
  }

  /* heapsort(a): el montículo inicial y una ronda por cada valor de fin. */
  function heapsort(a0) {
    var c = construir(a0);
    var a = c.a.slice();
    var rondas = [];
    var cmp = { v: c.comparaciones };
    var fin = a.length - 1;
    while (fin > 0) {
      var antes = a.slice();
      intercambiar(a, 0, fin);
      var trasCambio = a.slice();
      var reg = [];
      bajar(a, fin, 0, reg, cmp);
      rondas.push({ fin: fin, antes: antes, trasCambio: trasCambio, despues: a.slice(),
        sale: antes[0], reg: reg,
        intercambios: reg.filter(function (f) { return f.cambia; }).length });
      fin = fin - 1;
    }
    return { inicial: c.a, a: a, rondas: rondas, construir: c, comparaciones: cmp.v };
  }

  /* El arreglo de una ronda: el montículo arriba, la parte ya ordenada en
     verde. El árbol solo dibuja las casillas que siguen en el montículo. */
  function vistaParcial(a, n, marcas) {
    var m = {};
    Object.keys(marcas || {}).forEach(function (k) { m[k] = marcas[k]; });
    var k = n;
    while (k < a.length) {
      if (m[k] === undefined) { m[k] = "positivo"; }
      k = k + 1;
    }
    var arbol = M.dibujo(a.slice(0, n), marcas || {});
    return "<div class=\"vista-monticulo\">" + arbol + M.cajas(a, m) + "</div>";
  }

  function textoBajar(f, actual) {
    var t;
    if (f.hijos.length === 0) {
      t = "a[" + f.i + "] = " + f.clave + " no tiene hijos dentro del montículo: se detiene";
    } else if (f.cambia) {
      t = "a[" + f.i + "] = " + f.clave + ", hijos " + f.hijos.join(" y ") + ": el mayor es " +
        f.otra + " > " + f.clave + ", se intercambian";
    } else {
      t = "a[" + f.i + "] = " + f.clave + ", hijos " + f.hijos.join(" y ") +
        ": ninguno es mayor, se detiene";
    }
    return t;
  }

  function marcasFila(f) {
    var m = {};
    m[f.i] = "sube";
    if (f.izq < f.n) { m[f.izq] = "compara"; }
    if (f.der < f.n) { m[f.der] = "compara"; }
    return m;
  }

  /* Pasos de construir: un estado por comparación de cada bajar. */
  function pasosConstruir(a0) {
    var c = construir(a0);
    var n = a0.length;
    var pasos = [{ html: M.vista(a0, {}), texto: "el arreglo tal como llega; las casillas " +
      Math.floor(n / 2) + " a " + (n - 1) + " son hojas y ya son montículos de una clave" }];
    c.llamadas.forEach(function (l) {
      l.reg.forEach(function (f) {
        pasos.push({ html: M.vista(f.antes, marcasFila(f)),
          texto: "bajar(a, " + n + ", " + l.i + "): " + textoBajar(f) });
      });
    });
    pasos.push({ html: M.vista(c.a, {}), texto: "i llega a -1: el arreglo ya es un montículo de máximos" });
    return pasos;
  }

  /* Pasos de heapsort: el cambio de cada ronda y las comparaciones de bajar. */
  function pasosHeapsort(a0) {
    var h = heapsort(a0);
    var pasos = [{ html: vistaParcial(h.inicial, h.inicial.length, {}),
      texto: "construir ya dejó el montículo; fin = " + (h.inicial.length - 1) }];
    h.rondas.forEach(function (r) {
      var m = { 0: "sube" };
      m[r.fin] = "compara";
      pasos.push({ html: vistaParcial(r.antes, r.fin + 1, m),
        texto: "fin = " + r.fin + ": el máximo, " + r.sale + ", se cambia con a[" + r.fin + "] = " + r.antes[r.fin] });
      pasos.push({ html: vistaParcial(r.trasCambio, r.fin, { 0: "sube" }),
        texto: "el " + r.sale + " queda en su lugar definitivo; el montículo pasa a " + r.fin + " casillas" });
      r.reg.forEach(function (f) {
        if (f.hijos.length > 0) {
          pasos.push({ html: vistaParcial(f.antes, r.fin, marcasFila(f)), texto: "bajar(a, " + r.fin + ", " + f.i + "): " + textoBajar(f) });
        }
      });
    });
    pasos.push({ html: vistaParcial(h.a, 1, {}), texto: "fin llega a 0: el arreglo quedó ordenado" });
    return pasos;
  }

  return {
    CODIGO_BAJAR: CODIGO_BAJAR, CODIGO_CONSTRUIR: CODIGO_CONSTRUIR, CODIGO_HEAPSORT: CODIGO_HEAPSORT,
    bajar: bajar, construir: construir, porInserciones: porInserciones, heapsort: heapsort,
    vistaParcial: vistaParcial, pasosConstruir: pasosConstruir, pasosHeapsort: pasosHeapsort
  };
})();

if (typeof module !== "undefined") {
  module.exports = Orden;
}
