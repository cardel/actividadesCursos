/* Montículo de máximos para las actividades: la misma lógica de
   monticulo.h (índices desde 0, padre en (i - 1) / 2, hijos en 2i + 1 y
   2i + 2, al bajar gana el izquierdo si los dos hijos son iguales), con el
   registro de cada comparación y el dibujo del árbol y del arreglo.
   Un arreglo puede traer null en una casilla para dibujar un hueco. */
var Monti = (function () {
  var A = typeof module !== "undefined" ? require("../comun/arbol.js") : Arbol;

  function padre(i) { return Math.floor((i - 1) / 2); }

  function intercambiar(a, i, j) {
    var aux = a[i];
    a[i] = a[j];
    a[j] = aux;
  }

  /* subir(i) de monticulo.h. reg recibe una fila por comparación. */
  function subir(a, i, reg) {
    while (i > 0 && a[padre(i)] < a[i]) {
      var p = padre(i);
      reg.push({ i: i, p: p, clave: a[i], otra: a[p], cambia: true });
      intercambiar(a, i, p);
      reg[reg.length - 1].despues = a.slice();
      i = p;
    }
    if (i > 0) {
      reg.push({ i: i, p: padre(i), clave: a[i], otra: a[padre(i)], cambia: false, despues: a.slice() });
    } else {
      reg.push({ i: 0, p: -1, clave: a[0], cambia: false, raiz: true, despues: a.slice() });
    }
    return i;
  }

  /* bajar(i) de monticulo.h. */
  function bajar(a, i, reg) {
    var n = a.length;
    var sigue = true;
    while (sigue) {
      var izq = 2 * i + 1;
      var der = 2 * i + 2;
      var mayor = i;
      if (izq < n && a[izq] > a[mayor]) {
        mayor = izq;
      }
      if (der < n && a[der] > a[mayor]) {
        mayor = der;
      }
      var fila = { i: i, izq: izq, der: der, n: n, clave: a[i], mayor: mayor, cambia: mayor !== i };
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
    return i;
  }

  function cuenta(reg) {
    return reg.filter(function (f) { return f.cambia; }).length;
  }

  /* insertar(k): la clave entra en la primera casilla libre y sube. */
  function insertar(a, k) {
    var b = a.slice();
    b.push(k);
    var reg = [];
    var fin = subir(b, b.length - 1, reg);
    return { a: b, reg: reg, intercambios: cuenta(reg), entra: b.length - 1, queda: fin };
  }

  /* extraerMax(): la última clave pasa a la raíz y baja. */
  function extraer(a) {
    var b = a.slice();
    var res = b[0];
    b[0] = b[b.length - 1];
    b.pop();
    var reg = [];
    var raiz = b.length > 0 ? b[0] : null;
    var antes = b.slice();
    if (b.length > 0) {
      bajar(b, 0, reg);
    }
    return { max: res, a: b, antes: antes, raiz: raiz, reg: reg, intercambios: cuenta(reg) };
  }

  /* Variantes con error, las mismas de los fragmentos de errores.js. */
  function bajarSoloIzq(a, i) {
    var n = a.length;
    while (2 * i + 1 < n && a[2 * i + 1] > a[i]) {
      intercambiar(a, i, 2 * i + 1);
      i = 2 * i + 1;
    }
    return a;
  }

  function bajarPrimero(a, i) {
    var n = a.length;
    var sigue = true;
    while (sigue) {
      var izq = 2 * i + 1;
      var der = 2 * i + 2;
      if (izq < n && a[izq] > a[i]) {
        intercambiar(a, i, izq);
        i = izq;
      } else if (der < n && a[der] > a[i]) {
        intercambiar(a, i, der);
        i = der;
      } else {
        sigue = false;
      }
    }
    return a;
  }

  function subirMitad(a, i) {
    while (i > 0 && a[Math.floor(i / 2)] < a[i]) {
      intercambiar(a, i, Math.floor(i / 2));
      i = Math.floor(i / 2);
    }
    return a;
  }

  /* Primera casilla i >= 1 cuya clave es mayor que la de su padre, o -1. */
  function primeraRota(a) {
    var res = -1;
    var i = 1;
    while (i < a.length && res === -1) {
      if (a[padre(i)] < a[i]) { res = i; }
      i = i + 1;
    }
    return res;
  }

  /* Un arreglo por niveles, con null en los huecos, es completo si no hay
     ninguna casilla ocupada después del primer hueco. */
  function esCompleto(a) {
    var hueco = false;
    var res = true;
    a.forEach(function (x) {
      if (x === null) { hueco = true; } else if (hueco) { res = false; }
    });
    return res;
  }

  function altura(n) { return Math.floor(Math.log2(n) + 1e-9); }

  /* El árbol del arreglo para Arbol.binario; cada nodo lleva id c<i>. */
  function arbolDe(a, i) {
    i = i || 0;
    var res = null;
    if (i < a.length && a[i] !== null && a[i] !== undefined) {
      res = A.N(a[i], arbolDe(a, 2 * i + 1), arbolDe(a, 2 * i + 2), { id: "c" + i });
    }
    return res;
  }

  /* marcas: {i: "sube" | "compara" | "roto" | "hueco"} para el arreglo;
     en el árbol, sube se dibuja activo, compara en espera y roto marcado. */
  var ESTILO = { sube: "activo", compara: "espera", roto: "marcado", hecho: "hecho" };

  function dibujo(a, marcas, op) {
    marcas = marcas || {};
    op = op || {};
    var estilos = {};
    Object.keys(marcas).forEach(function (i) {
      if (ESTILO[marcas[i]]) { estilos["c" + i] = ESTILO[marcas[i]]; }
    });
    return A.binario(arbolDe(a), { estilos: estilos, vacios: op.vacios, titulo: op.titulo || "montículo" });
  }

  function cajas(a, marcas) {
    marcas = marcas || {};
    return "<div class=\"arreglo fila-arreglo\">" + a.map(function (x, i) {
      var clase = "caja fija" + (marcas[i] ? " " + marcas[i] : "") + (x === null ? " hueco" : "");
      return "<div class=\"" + clase + "\"><span class=\"indice\">" + i + "</span>" + (x === null ? "" : x) + "</div>";
    }).join("") + "</div>";
  }

  function vista(a, marcas, op) {
    return "<div class=\"vista-monticulo\">" + dibujo(a, marcas, op) + cajas(a, marcas) + "</div>";
  }

  function texto(a) { return a.join(" "); }

  function codigo(lineas) {
    var t = lineas.join("\n").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return "<pre class=\"fragmento\">" + t + "</pre>";
  }

  /* Pasos de una inserción: el arreglo antes, la clave en la casilla libre
     y un estado por comparación con su padre. */
  function pasosInsertar(a, k) {
    var r = insertar(a, k);
    var pasos = [{ html: vista(a, {}), texto: "el montículo antes, con " + a.length + " claves" }];
    var con = a.concat([k]);
    var m0 = {};
    m0[con.length - 1] = "sube";
    pasos.push({ html: vista(con, m0), texto: "el " + k + " entra en a[" + (con.length - 1) + "], la primera casilla libre" });
    var actual = con;
    r.reg.forEach(function (f) {
      var m = {};
      if (f.raiz) {
        m[0] = "sube";
        pasos.push({ html: vista(f.despues, m), texto: "el " + k + " llegó a a[0], la raíz: se detiene" });
      } else if (f.cambia) {
        m[f.i] = "sube";
        m[f.p] = "compara";
        pasos.push({ html: vista(actual, m), texto: "a[" + f.i + "] = " + f.clave + " y su padre a[" + f.p + "] = " + f.otra + ": " + f.clave + " > " + f.otra + ", se intercambian" });
        var m2 = {};
        m2[f.p] = "sube";
        pasos.push({ html: vista(f.despues, m2), texto: "el " + k + " queda en a[" + f.p + "]" });
        actual = f.despues;
      } else {
        m[f.i] = "sube";
        m[f.p] = "compara";
        pasos.push({ html: vista(f.despues, m), texto: "a[" + f.i + "] = " + f.clave + " y su padre a[" + f.p + "] = " + f.otra + ": " + f.clave + (f.clave === f.otra ? " = " : " < ") + f.otra + ", se detiene" });
      }
    });
    return pasos;
  }

  /* Pasos de una extracción: el máximo sale, la última clave pasa a la raíz
     y un estado por comparación con los hijos. */
  function pasosExtraer(a) {
    var r = extraer(a);
    var m0 = { 0: "compara" };
    m0[a.length - 1] = "sube";
    var pasos = [{ html: vista(a, m0), texto: "sale el " + a[0] + " de a[0]; la última clave, el " + a[a.length - 1] + ", ocupará su lugar" }];
    pasos.push({ html: vista(r.antes, { 0: "sube" }), texto: "el " + r.raiz + " queda en a[0] y el arreglo pasa a " + r.antes.length + " casillas" });
    var actual = r.antes;
    r.reg.forEach(function (f) {
      var m = {};
      m[f.i] = "sube";
      var hijos = [];
      if (f.izq < f.n) { m[f.izq] = "compara"; hijos.push(actual[f.izq]); }
      if (f.der < f.n) { m[f.der] = "compara"; hijos.push(actual[f.der]); }
      var t;
      if (hijos.length === 0) {
        t = "a[" + f.i + "] no tiene hijos: es una hoja y se detiene";
      } else if (f.cambia) {
        t = "a[" + f.i + "] = " + f.clave + ", hijos " + hijos.join(" y ") + ": el mayor es " + f.otra + " > " + f.clave + ", se intercambian";
      } else {
        t = "a[" + f.i + "] = " + f.clave + ", hijos " + hijos.join(" y ") + ": ninguno es mayor, se detiene";
      }
      pasos.push({ html: vista(actual, m), texto: t });
      if (f.cambia) {
        var m2 = {};
        m2[f.mayor] = "sube";
        pasos.push({ html: vista(f.despues, m2), texto: "el " + f.clave + " queda en a[" + f.mayor + "]" });
        actual = f.despues;
      }
    });
    return pasos;
  }

  return {
    padre: padre, subir: subir, bajar: bajar, insertar: insertar, extraer: extraer,
    bajarSoloIzq: bajarSoloIzq, bajarPrimero: bajarPrimero, subirMitad: subirMitad,
    primeraRota: primeraRota, esCompleto: esCompleto, altura: altura,
    arbolDe: arbolDe, dibujo: dibujo, cajas: cajas, vista: vista, texto: texto, codigo: codigo,
    pasosInsertar: pasosInsertar, pasosExtraer: pasosExtraer
  };
})();

if (typeof module !== "undefined") {
  module.exports = Monti;
}
