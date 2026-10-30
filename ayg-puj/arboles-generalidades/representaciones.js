/* Ejercicio interactivo: hijo izquierdo y hermano derecho, los dos
   punteros que guardan un arbol de aridad libre.

   El nucleo reproduce representaciones.py, lineas 21 a 60, con los tres
   arreglos recibidos en un objeto en vez de leidos del modulo:
   A.padre[x], A.hijoIzq[x] y A.hermanoDer[x]. Los numeros de linea de
   la traza son los de ese archivo. El dibujo y la adyacencia vienen de
   lib.js. */
var ARB = (typeof module !== "undefined") ? require("./lib.js") : ARB;
var GRAFOSVG = (typeof module !== "undefined") ? require("../comun/grafo-svg.js") : GRAFOSVG;

var EJERCICIO = (function () {

  /* ---------- representaciones.py, lineas 21 a 60 ---------- */

  function caminoALaRaiz(A, x) {
    var ans = [x];
    while (A.padre[x] !== -1) {
      x = A.padre[x];
      ans.push(x);
    }
    return ans;
  }

  function profundidad(A, x) {
    var ans = 0;
    while (A.padre[x] !== -1) {
      x = A.padre[x];
      ans = ans + 1;
    }
    return ans;
  }

  function hijos(A, x) {
    var ans = [], v = A.hijoIzq[x];
    while (v !== -1) {
      ans.push(v);
      v = A.hermanoDer[v];
    }
    return ans;
  }

  function esHoja(A, x) {
    return A.hijoIzq[x] === -1;
  }

  function altura(A, x) {
    var ans = 0, mayor;
    if (A.hijoIzq[x] !== -1) {
      mayor = -1;
      hijos(A, x).forEach(function (v) {
        var h = altura(A, v);
        if (h > mayor) { mayor = h; }
      });
      ans = 1 + mayor;
    }
    return ans;
  }

  function aridad(A) {
    var ans = 0, x = 0;
    while (x < A.padre.length) {
      if (hijos(A, x).length > ans) { ans = hijos(A, x).length; }
      x = x + 1;
    }
    return ans;
  }

  /* ---------- lo que se deriva de los tres arreglos ---------- */

  var CODIGO_HIJOS = [
    { num: 35, txt: "def hijos(x):" },
    { num: 36, txt: "  ans = []" },
    { num: 37, txt: "  v = hijoIzq[x]" },
    { num: 38, txt: "  while v != -1:" },
    { num: 39, txt: "    ans.append(v)" },
    { num: 40, txt: "    v = hermanoDer[v]" },
    { num: 41, txt: "  return ans" }
  ];

  function raizDe(A) { return A.padre.indexOf(-1); }

  /* El grado sin raiz cuenta todas las aristas del nodo, la del padre
     incluida; el grado con raiz cuenta solo los hijos. */
  function gradoConRaiz(A, x) { return hijos(A, x).length; }

  function gradoSinRaiz(A, x) {
    return hijos(A, x).length + (A.padre[x] === -1 ? 0 : 1);
  }

  /* La cadena de hermanos en que vive x, empezando por el primer hijo
     de su padre. */
  function hermanosDe(A, x) {
    return A.padre[x] === -1 ? [x] : hijos(A, A.padre[x]);
  }

  function descendientes(A, x) {
    var r = [];
    hijos(A, x).forEach(function (v) { r.push(v); r = r.concat(descendientes(A, v)); });
    return r;
  }

  /* ---------- los dos punteros leidos como un arbol binario ---------- */

  /* hijoIzq como hijo izquierdo y hermanoDer como hijo derecho: el
     arbol que de verdad quedo en memoria. */
  function binario(A, x) {
    var r = [];
    if (x !== -1) {
      r = [A.nombre[x], binario(A, A.hijoIzq[x]), binario(A, A.hermanoDer[x])];
    }
    return r;
  }

  /* Profundidad de cada nodo en ese arbol binario, con el puntero por
     el que se llego a cada uno. */
  function profsBinarias(A) {
    var prof = A.padre.map(function () { return -1; });
    var paso = A.padre.map(function () { return ""; });
    var de = A.padre.map(function () { return -1; });
    function bajar(x, d) {
      if (x !== -1) {
        prof[x] = d;
        if (A.hijoIzq[x] !== -1) { paso[A.hijoIzq[x]] = "hijoIzq"; de[A.hijoIzq[x]] = x; }
        if (A.hermanoDer[x] !== -1) { paso[A.hermanoDer[x]] = "hermanoDer"; de[A.hermanoDer[x]] = x; }
        bajar(A.hijoIzq[x], d + 1);
        bajar(A.hermanoDer[x], d + 1);
      }
    }
    bajar(raizDe(A), 0);
    return { prof: prof, paso: paso, de: de };
  }

  function alturaBinaria(A) {
    var p = profsBinarias(A).prof, ans = 0;
    p.forEach(function (d) { if (d > ans) { ans = d; } });
    return ans;
  }

  /* Los pasos de la raiz a x en el arbol binario, cada uno con el
     puntero que se siguio. */
  function rutaBinaria(A, x) {
    var B = profsBinarias(A), r = [], v = x;
    while (B.de[v] !== -1) {
      r.unshift({ de: B.de[v], a: v, paso: B.paso[v] });
      v = B.de[v];
    }
    return r;
  }

  /* ---------- la traza de hijos, un paso por linea ejecutada ---------- */

  function simHijos(A, x) {
    var pasos = [], ans = [], v, viejo, sigue = true;

    function nom(u) { return u === -1 ? "−1" : A.nombre[u]; }
    function lista() {
      return ans.length === 0 ? "[]" : ans.map(function (u) { return A.nombre[u]; }).join(" ");
    }
    function emitir(linea, datos) {
      var p = { linea: linea, xNom: A.nombre[x], vNom: nom(v), ansNom: lista(),
                x: x, v: v, recogidos: ans.slice(), leyendo: null, nota: "" };
      Object.keys(datos || {}).forEach(function (k) { p[k] = datos[k]; });
      pasos.push(p);
    }

    v = null;
    emitir(35, { vNom: "–", nota: "entra el llamado con x = " + A.nombre[x] });
    emitir(36, { vNom: "–", nota: "ans arranca vacío" });
    v = A.hijoIzq[x];
    emitir(37, { leyendo: ["hijoIzq", x],
                 nota: "hijoIzq[" + A.nombre[x] + "] vale " + nom(v) +
                   (v === -1 ? ", así que " + A.nombre[x] + " no tiene hijos"
                             : ", el primer hijo de " + A.nombre[x]) });
    while (sigue) {
      emitir(38, { nota: v === -1
        ? "v vale −1: la cadena de hermanos se acabó"
        : "v vale " + A.nombre[v] + ", que no es −1: hay otro hermano por recoger" });
      if (v === -1) {
        sigue = false;
      } else {
        ans.push(v);
        emitir(39, { nota: A.nombre[v] + " entra a ans" });
        viejo = v;
        v = A.hermanoDer[viejo];
        emitir(40, { leyendo: ["hermanoDer", viejo],
                     nota: "hermanoDer[" + A.nombre[viejo] + "] vale " + nom(v) +
                       (v === -1 ? ", así que " + A.nombre[viejo] + " es el último hermano"
                                 : ", el hermano que sigue") });
      }
    }
    emitir(41, { nota: "devuelve " + (ans.length === 0 ? "la lista vacía" : lista()) });
    return pasos;
  }

  /* ---------- los arboles ---------- */

  /* Tres arboles con la raiz en el indice 0 y los hermanos en orden
     creciente de indice, de modo que el dibujo los ponga en el mismo
     orden en que los encadena hermanoDer. */
  var ARBOLES = [
    { boton: "Aridad 4",
      nombre: "ABCDEFGHIJKL",
      padre:      [-1,  0,  0,  0,  0,  2,  2,  4,  4,  4,  6,  8],
      hijoIzq:    [ 1, -1,  5, -1,  7, -1, 10, -1, 11, -1, -1, -1],
      hermanoDer: [-1,  2,  3,  4, -1,  6, -1,  8,  9, -1, -1, -1],
      texto: "Doce nodos. La raíz reparte en cuatro ramas y dos nodos quedan a profundidad 3.",
      xInicial: 0, interno: 4, hoja: 10, foco: 11 },
    { boton: "Aridad 5",
      nombre: "ABCDEFGHIJKLM",
      padre:      [-1,  0,  0,  1,  1,  1,  1,  1,  2,  8,  8,  4,  4],
      hijoIzq:    [ 1,  3,  8, -1, 11, -1, -1, -1,  9, -1, -1, -1, -1],
      hermanoDer: [-1,  2, -1,  4,  5,  6,  7, -1, -1, 10, -1, 12, -1],
      texto: "Trece nodos y una sola rama ancha: un nodo interno se lleva cinco hijos y la raíz solo dos.",
      xInicial: 1, interno: 8, hoja: 12, foco: 7 },
    { boton: "Aridad 6",
      nombre: "ABCDEFGHIJKLM",
      padre:      [-1,  0,  0,  0,  0,  0,  0,  3,  3,  5,  6,  6,  6],
      hijoIzq:    [ 1, -1, -1,  7, -1,  9, 10, -1, -1, -1, -1, -1, -1],
      hermanoDer: [-1,  2,  3,  4,  5,  6, -1,  8, -1, -1, 11, 12, -1],
      texto: "Trece nodos en tres niveles. La raíz tiene seis hijos y ningún nodo pasa de profundidad 2.",
      xInicial: 0, interno: 6, hoja: 9, foco: 12 }
  ];

  /* Para convertir: estos llegan dibujados y sin arreglos. */
  var PARA_CONVERTIR = [
    { boton: "Diez nodos",
      nombre: "NOPQRSTUVW",
      padre:      [-1,  0,  0,  1,  1,  1,  2,  4,  4,  6],
      hijoIzq:    [ 1,  3,  6, -1,  7, -1,  9, -1, -1, -1],
      hermanoDer: [-1,  2, -1,  4,  5, -1, -1,  8, -1, -1],
      texto: "Diez nodos, cuatro niveles y ramas de anchos distintos." },
    { boton: "Once nodos",
      nombre: "NOPQRSTUVWX",
      padre:      [-1,  0,  0,  0,  0,  2,  2,  2,  4,  4,  4],
      hijoIzq:    [ 1, -1,  5, -1,  8, -1, -1, -1, -1, -1, -1],
      hermanoDer: [-1,  2,  3,  4, -1,  6,  7, -1,  9, 10, -1],
      texto: "Once nodos y tres niveles. Dos de los cuatro hijos de la raíz tienen tres hijos cada uno." }
  ];

  function preparar(A) {
    A.n = A.padre.length;
    A.raiz = raizDe(A);
    A.aristas = [];
    A.padre.forEach(function (p, v) { if (p !== -1) { A.aristas.push([p, v]); } });
    A.G = ARB.adyacencia(A.n, A.aristas);
    A.altura = altura(A, A.raiz);
    A.aridad = aridad(A);
    A.binario = binario(A, A.raiz);
    A.profBin = profsBinarias(A).prof;
    A.alturaBin = alturaBinaria(A);
    return A;
  }
  ARBOLES.forEach(preparar);
  PARA_CONVERTIR.forEach(preparar);

  function nombres(A, lista) {
    return lista.map(function (u) { return A.nombre[u]; }).join(" ");
  }

  /* ---------- lo que se le dice al estudiante ---------- */

  /* Lee una respuesta escrita con nombres de nodos: letras en
     cualquier orden de mayusculas, separadas por lo que sea. */
  function leerNodos(A, texto) {
    var r = [], malas = [];
    String(texto).toUpperCase().split(/[^A-Z]+/).forEach(function (p) {
      if (p.length > 0) {
        p.split("").forEach(function (c) {
          var i = A.nombre.indexOf(c);
          if (i < 0) { malas.push(c); } else { r.push(i); }
        });
      }
    });
    return { nodos: r, malas: malas };
  }

  function igual(a, b) {
    return a.length === b.length && a.every(function (x, i) { return x === b[i]; });
  }

  function fbHijos(A, x, dadas) {
    var buenos = hijos(A, x), hs = hermanosDe(A, x), desc = descendientes(A, x);
    var cadena = "hijoIzq[" + A.nombre[x] + "] da " +
      (buenos.length === 0 ? "−1" : A.nombre[buenos[0]]) +
      " y de ahí hermanoDer encadena hasta el −1";
    if (igual(dadas, buenos)) {
      if (buenos.length === 0) {
        return { ok: true, msg: A.nombre[x] + " no tiene hijos: hijoIzq[" + A.nombre[x] +
          "] vale −1, que es lo mismo que dice esHoja. El ciclo no da ninguna vuelta y ans sale vacío." };
      }
      return { ok: true, msg: "Los hijos de " + A.nombre[x] + " son " + nombres(A, buenos) +
        ", en ese orden: " + cadena + ". El padre no aparece en la cadena, aunque padre[" +
        A.nombre[x] + "] lo tenga a un paso." };
    }
    var base = "Los hijos de " + A.nombre[x] + " son " +
      (buenos.length === 0 ? "ninguno" : nombres(A, buenos)) + ". ";
    if (buenos.length > 1 && igual(dadas, [buenos[0]])) {
      return { ok: false, msg: base + "hijoIzq[" + A.nombre[x] + "] da solo el primero, " +
        A.nombre[buenos[0]] + ". Los otros " + (buenos.length - 1) +
        " salen de seguir hermanoDer desde él, que es lo que hace el ciclo." };
    }
    if (hs.length > 1 && igual(dadas, hs.filter(function (u) { return u !== x; }))) {
      return { ok: false, msg: base + "Eso es la cadena en que vive " + A.nombre[x] +
        ": hermanoDer arranca desde hijoIzq[" + A.nombre[x] + "], no desde " + A.nombre[x] +
        ". Leído desde " + A.nombre[x] + " lo que sale son sus hermanos." };
    }
    var sobran = dadas.filter(function (u) { return buenos.indexOf(u) < 0; });
    var nietos = sobran.filter(function (u) { return desc.indexOf(u) >= 0; });
    if (nietos.length > 0) {
      return { ok: false, msg: base + nombres(A, nietos) +
        (nietos.length === 1
          ? " cuelga de " + A.nombre[x] + " pero no de su cadena de hermanos: es un descendiente y no un hijo. "
          : " cuelgan de " + A.nombre[x] + " pero no de su cadena de hermanos: son descendientes y no hijos. ") +
        cadena + "." };
    }
    var k = ARB.divergeEn(dadas, buenos);
    if (k >= 0 && buenos[k] !== undefined) {
      return { ok: false, msg: base + "La posición " + (k + 1) + " es " + A.nombre[buenos[k]] +
        ": " + cadena + "." };
    }
    return { ok: false, msg: base + cadena + "." };
  }

  /* Cada celda de las dos tablas, con la regla que la fija. */
  function celdas(A) {
    var r = [], x = 0;
    while (x < A.n) {
      r.push({
        x: x,
        hijoIzq: A.hijoIzq[x],
        hermanoDer: A.hermanoDer[x],
        razonIzq: A.hijoIzq[x] === -1
          ? A.nombre[x] + " es hoja, así que hijoIzq[" + A.nombre[x] + "] es −1"
          : "el primero de los hijos de " + A.nombre[x] + ", que son " + nombres(A, hijos(A, x)),
        razonDer: A.hermanoDer[x] === -1
          ? (A.padre[x] === -1
              ? A.nombre[x] + " es la raíz y no tiene hermanos, así que hermanoDer[" + A.nombre[x] + "] es −1"
              : A.nombre[x] + " es el último de los hijos de " + A.nombre[A.padre[x]] +
                ", así que hermanoDer[" + A.nombre[x] + "] es −1")
          : "el hijo de " + A.nombre[A.padre[x]] + " que sigue a " + A.nombre[x] +
            " en la cadena " + nombres(A, hijos(A, A.padre[x])) 
      });
      x = x + 1;
    }
    return r;
  }

  function fbTablas(A, dadas) {
    var cs = celdas(A), fallas = [], listas = 0;
    cs.forEach(function (c) {
      var di = dadas.izq[c.x], dd = dadas.der[c.x];
      if (di === c.hijoIzq) { listas = listas + 1; }
      else { fallas.push({ tabla: "hijoIzq", x: c.x, razon: c.razonIzq, bueno: c.hijoIzq }); }
      if (dd === c.hermanoDer) { listas = listas + 1; }
      else { fallas.push({ tabla: "hermanoDer", x: c.x, razon: c.razonDer, bueno: c.hermanoDer }); }
    });
    var total = 2 * A.n;
    if (fallas.length === 0) {
      return { ok: true, listas: listas, total: total,
        msg: "Las dos tablas quedan completas. Son " + total + " casillas para " + A.n +
          " nodos, dos por nodo, y el espacio no depende de la aridad: los hijos de un nodo viven en una cadena de hermanoDer y cada nodo está en una sola de esas cadenas." };
    }
    var m = listas + " de " + total + " casillas bien. ";
    m = m + fallas.slice(0, 3).map(function (f) {
      return f.tabla + "[" + A.nombre[f.x] + "] es " +
        (f.bueno === -1 ? "−1" : A.nombre[f.bueno]) + ", " + f.razon;
    }).join(". ") + ".";
    if (fallas.length === 4) {
      m = m + " Queda una casilla más por corregir.";
    } else if (fallas.length > 4) {
      m = m + " Quedan " + (fallas.length - 3) + " casillas más por corregir.";
    }
    return { ok: false, listas: listas, total: total, msg: m };
  }

  function fbGrado(A, x, conRaiz, valor) {
    var hs = hijos(A, x), g = conRaiz ? gradoConRaiz(A, x) : gradoSinRaiz(A, x);
    var esRaiz = A.padre[x] === -1;
    if (valor === g) {
      if (conRaiz) {
        return { ok: true, msg: "Con raíz, el grado de " + A.nombre[x] + " es " + g +
          (hs.length === 0 ? ": no tiene hijos." : ": sus hijos son " + nombres(A, hs) + ".") };
      }
      return { ok: true, msg: "Sin raíz, " + A.nombre[x] + " toca " + g + " arista" +
        (g === 1 ? "" : "s") + ": " +
        (esRaiz ? "las " + g + " de sus hijos, y ninguna más porque no tiene padre."
                : (hs.length === 0 ? "ninguna hacia hijos" : hs.length + " hacia sus hijos") +
                  " y una hacia " + A.nombre[A.padre[x]] + ".") };
    }
    if (conRaiz && valor === gradoSinRaiz(A, x) && !esRaiz) {
      return { ok: false, msg: "Con raíz son " + g + ". El " + valor +
        " cuenta también la arista hacia " + A.nombre[A.padre[x]] +
        ", que es el grado en el árbol sin raíz: el padre no es un hijo." };
    }
    if (!conRaiz && valor === gradoConRaiz(A, x) && !esRaiz) {
      return { ok: false, msg: "Sin raíz son " + g + ". El " + valor +
        " cuenta solo los hijos y deja fuera la arista hacia " + A.nombre[A.padre[x]] +
        ", que en el grafo sin raíz cuenta igual que las demás." };
    }
    if (conRaiz) {
      return { ok: false, msg: "Son " + g + ": siga hijoIzq[" + A.nombre[x] +
        "] y después hermanoDer, que es lo que hace hijos." };
    }
    return { ok: false, msg: "Son " + g + ", los " + hs.length + " hijos" +
      (esRaiz ? " y nada más, porque es la raíz." : " más la arista del padre.") };
  }

  function fbAridad(A, valor) {
    var a = A.aridad, cual = [], x = 0;
    while (x < A.n) {
      if (hijos(A, x).length === a) { cual.push(x); }
      x = x + 1;
    }
    if (valor === a) {
      return { ok: true, msg: "La aridad es " + a + ", el mayor de los grados, y lo alcanza " +
        nombres(A, cual) + ". Con esa cota un arreglo de hijos por nodo gastaría " + (A.n * a) +
        " casillas; los dos punteros gastan " + (2 * A.n) + "." };
    }
    if (valor === A.altura) {
      return { ok: false, msg: "Es " + a + ". El " + valor +
        " es la altura, que mide hacia abajo; la aridad mide a lo ancho, en el nodo de más hijos." };
    }
    if (valor === A.n) {
      return { ok: false, msg: "Es " + a + ". El " + valor +
        " son los nodos del árbol, no los hijos del nodo que más tiene." };
    }
    return { ok: false, msg: "Es " + a + ", los hijos de " + nombres(A, cual) +
      ". La aridad es el mayor de los grados y no el de la raíz, que aquí tiene " +
      gradoConRaiz(A, A.raiz) + "." };
  }

  function fbProfGeneral(A, x, valor) {
    var d = profundidad(A, x), cam = caminoALaRaiz(A, x);
    if (valor === d) {
      return { ok: true, msg: "La profundidad de " + A.nombre[x] + " es " + d +
        ": padre lleva de " + A.nombre[x] + " a la raíz por " + nombres(A, cam) +
        ", y son " + d + " aristas." };
    }
    if (valor === cam.length) {
      return { ok: false, msg: "Es " + d + ". El " + valor + " son los nodos del camino " +
        nombres(A, cam) + "; la profundidad cuenta aristas, de modo que la raíz queda en 0." };
    }
    return { ok: false, msg: "Es " + d + ": el camino de " + A.nombre[x] + " a la raíz es " +
      nombres(A, cam) + " y tiene " + d + " aristas." };
  }

  function fbProfBinaria(A, x, valor) {
    var d = A.profBin[x], dg = profundidad(A, x), ruta = rutaBinaria(A, x);
    var izq = ruta.filter(function (p) { return p.paso === "hijoIzq"; }).length;
    var der = ruta.length - izq;
    var detalle = ruta.map(function (p) {
      return A.nombre[p.de] + " " + (p.paso === "hijoIzq" ? "a la izquierda" : "a la derecha") +
        " " + A.nombre[p.a];
    }).join(", ");
    if (valor === d) {
      return { ok: true, msg: "En el árbol binario " + A.nombre[x] + " queda a profundidad " + d +
        ": " + detalle + ", o sea " + izq + " paso" + (izq === 1 ? "" : "s") + " por hijoIzq y " +
        der + " por hermanoDer. En el árbol de aridad libre está a " + dg +
        ", porque allí los " + der + " pasos entre hermanos no bajan de nivel." };
    }
    if (valor === dg) {
      return { ok: false, msg: "Esa es su profundidad en el árbol de aridad libre. En el binario es " +
        d + ", porque cada salto de hermanoDer también baja un nivel: " + detalle + "." };
    }
    return { ok: false, msg: "Es " + d + ": " + detalle +
      ". Los dos punteros cuentan igual, y ahí está la diferencia con el " + dg +
      " del árbol de aridad libre." };
  }

  function fbAlturaBinaria(A, valor) {
    var hb = A.alturaBin, mas = [], x = 0;
    while (x < A.n) {
      if (A.profBin[x] === hb) { mas.push(x); }
      x = x + 1;
    }
    if (valor === hb) {
      return { ok: true, msg: "La altura del árbol binario es " + hb + ", con " + nombres(A, mas) +
        " en el fondo, contra " + A.altura + " del árbol de aridad libre. Un recorrido sobre la memoria baja " +
        hb + " niveles para ver lo que en el árbol de aridad libre está a " + A.altura + "." };
    }
    if (valor === A.altura) {
      return { ok: false, msg: "Esa es la altura del árbol de aridad libre. La del binario es " + hb +
        ": las cadenas de hermanos se vuelven ramas derechas y alargan el árbol hacia abajo." };
    }
    return { ok: false, msg: "Es " + hb + ", la profundidad de " + nombres(A, mas) +
      " en el árbol binario." };
  }

  return {
    caminoALaRaiz: caminoALaRaiz, profundidad: profundidad, hijos: hijos, esHoja: esHoja,
    altura: altura, aridad: aridad, raizDe: raizDe,
    gradoConRaiz: gradoConRaiz, gradoSinRaiz: gradoSinRaiz, hermanosDe: hermanosDe,
    descendientes: descendientes, binario: binario, profsBinarias: profsBinarias,
    alturaBinaria: alturaBinaria, rutaBinaria: rutaBinaria,
    simHijos: simHijos, CODIGO_HIJOS: CODIGO_HIJOS,
    ARBOLES: ARBOLES, PARA_CONVERTIR: PARA_CONVERTIR,
    nombres: nombres, leerNodos: leerNodos, celdas: celdas,
    fbHijos: fbHijos, fbTablas: fbTablas, fbGrado: fbGrado, fbAridad: fbAridad,
    fbProfGeneral: fbProfGeneral, fbProfBinaria: fbProfBinaria, fbAlturaBinaria: fbAlturaBinaria
  };
})();

if (typeof module !== "undefined") {
  module.exports = EJERCICIO;
} else {
  (function () {
    var E = EJERCICIO, p = { t: 0, x: E.ARBOLES[0].xInicial }, c = 0;
    function el(id) { return document.getElementById(id); }
    function arbol() { return E.ARBOLES[p.t]; }
    function convertir() { return E.PARA_CONVERTIR[c]; }

    /* ---------- el arbol y los tres arreglos ---------- */

    function dibujo(a) {
      var A = arbol(), L = ARB.layoutColgado(A.G, A.raiz, { ancho: 560, alto: 70 + 55 * A.altura });
      var recogidos = a ? a.recogidos : [];
      el("panel-arbol").innerHTML = GRAFOSVG.dibujar({
        n: A.n, pos: L.pos, aristas: L.aristas, dirigido: false,
        ancho: 560, alto: 70 + 55 * A.altura,
        nombre: function (u) { return A.nombre[u]; },
        nodo: function (u) {
          var s = {};
          if (recogidos.indexOf(u) >= 0) { s = { relleno: "#e7f2e8", borde: "#2e7d32" }; }
          if (a && a.v === u) { s.relleno = "#e8eef7"; s.borde = "#1f5fa8"; s.grueso = 3.2; }
          if (u === p.x) { s.relleno = "#fdf1dc"; s.borde = "#e8a13d"; s.grueso = 3.4; s.nota = "x"; }
          return s;
        }
      });
    }

    function arreglos(a) {
      var A = arbol(), leyendo = a ? a.leyendo : null;
      function fila(rot, datos, cual) {
        return "<div class='tira fila-arreglo'><span class='rot'>" + rot + "</span>" +
          datos.map(function (val, u) {
            var cls = "caja" + (val === -1 ? " negativo" : "");
            if (leyendo && leyendo[0] === cual && leyendo[1] === u) { cls = cls + " actual"; }
            return "<div class='" + cls + "'><span class='indice'>" + A.nombre[u] + "</span>" +
              (val === -1 ? "−1" : A.nombre[val]) + "</div>";
          }).join("") + "</div>";
      }
      el("panel-arreglos").innerHTML =
        fila("padre", A.padre, "padre") +
        fila("hijoIzq", A.hijoIzq, "hijoIzq") +
        fila("hermanoDer", A.hermanoDer, "hermanoDer");
    }

    /* ---------- los hijos de un nodo ---------- */

    function botonesNodo() {
      var A = arbol();
      el("presets-nodo").innerHTML = "";
      A.nombre.split("").forEach(function (nm, u) {
        var b = document.createElement("button");
        b.className = "vert" + (u === p.x ? " elegido" : "");
        b.textContent = nm;
        b.addEventListener("click", function () {
          p.x = u;
          botonesNodo();
          limpiarHijos();
          Motor.reiniciar(p);
        });
        el("presets-nodo").appendChild(b);
      });
    }

    function limpiarHijos() {
      var A = arbol();
      el("rot-hijos").innerHTML = "Los hijos de <i>" + A.nombre[p.x] +
        "</i>, en el orden en que los encadena <code>hermanoDer</code>";
      el("in-hijos").value = "";
      el("fb-hijos").className = "fb";
      el("fb-hijos").textContent = "";
    }

    function comprobarHijos() {
      var A = arbol(), leido = E.leerNodos(A, el("in-hijos").value);
      var r;
      if (leido.malas.length > 0) {
        r = { ok: false, msg: "Los nodos de este árbol van de " + A.nombre[0] + " a " +
          A.nombre[A.n - 1] + ", y " + leido.malas.join(", ") + " no está entre ellos." };
      } else if (leido.nodos.length === 0 && E.hijos(A, p.x).length > 0) {
        r = { ok: false, msg: "Falta la respuesta: escriba los nombres de los hijos separados por espacios." };
      } else {
        r = E.fbHijos(A, p.x, leido.nodos);
      }
      el("fb-hijos").className = r.ok ? "fb bien" : "fb mal";
      el("fb-hijos").textContent = r.msg;
    }

    /* ---------- convertir un arbol a los dos punteros ---------- */

    function dibujoConvertir() {
      var A = convertir();
      var L = ARB.layoutColgado(A.G, A.raiz, { ancho: 560, alto: 70 + 55 * A.altura });
      el("panel-convertir").innerHTML = GRAFOSVG.dibujar({
        n: A.n, pos: L.pos, aristas: L.aristas, dirigido: false,
        ancho: 560, alto: 70 + 55 * A.altura,
        nombre: function (u) { return A.nombre[u]; },
        nodo: function (u) { return u === A.raiz ? { relleno: "#fdf1dc", borde: "#e8a13d", grueso: 3.4 } : {}; }
      });
      el("pie-convertir").textContent = A.texto +
        " Los hermanos van de izquierda a derecha en el orden del dibujo.";
    }

    function tablaConvertir() {
      var A = convertir();
      el("tabla-convertir").innerHTML = "<div class='envoltura-tabla'><table class='corta rellenar'>" +
        "<tr><th>x</th><th>hijoIzq[x]</th><th>hermanoDer[x]</th></tr>" +
        A.nombre.split("").map(function (nm, u) {
          return "<tr><td>" + nm + "</td><td><input id='ci-" + u + "' placeholder='–'></td>" +
            "<td><input id='cd-" + u + "' placeholder='–'></td></tr>";
        }).join("") + "</table></div>";
      el("fb-convertir").className = "fb";
      el("fb-convertir").textContent = "";
    }

    /* Una casilla admite el nombre de un nodo o −1. */
    function leerCasilla(A, texto) {
      var t = String(texto).trim().toUpperCase().replace("−", "-");
      var r = -2;
      if (t === "-1" || t === "-") { r = -1; }
      else if (t.length === 1 && A.nombre.indexOf(t) >= 0) { r = A.nombre.indexOf(t); }
      return r;
    }

    function comprobarConvertir() {
      var A = convertir(), dadas = { izq: [], der: [] }, u = 0;
      while (u < A.n) {
        dadas.izq.push(leerCasilla(A, el("ci-" + u).value));
        dadas.der.push(leerCasilla(A, el("cd-" + u).value));
        u = u + 1;
      }
      var r = E.fbTablas(A, dadas), cs = E.celdas(A);
      cs.forEach(function (cc) {
        el("ci-" + cc.x).className = dadas.izq[cc.x] === cc.hijoIzq ? "acierto" : "falla";
        el("cd-" + cc.x).className = dadas.der[cc.x] === cc.hermanoDer ? "acierto" : "falla";
      });
      el("fb-convertir").className = r.ok ? "fb bien" : "fb mal";
      el("fb-convertir").textContent = r.msg;
    }

    /* ---------- el grado y la aridad ---------- */

    function tablaGrados() {
      var A = arbol(), filas = [
        { u: A.raiz, que: "la raíz" },
        { u: A.interno, que: "un nodo interno" },
        { u: A.hoja, que: "una hoja" }
      ];
      el("tabla-grados").innerHTML = "<div class='envoltura-tabla'><table class='corta rellenar'>" +
        "<tr><th>Nodo</th><th>Hijos (grado con raíz)</th><th>Aristas (grado sin raíz)</th></tr>" +
        filas.map(function (f) {
          return "<tr><td class='izq'>" + A.nombre[f.u] + ", " + f.que +
            "</td><td><input id='gc-" + f.u + "' placeholder='0'></td>" +
            "<td><input id='gs-" + f.u + "' placeholder='0'></td></tr>";
        }).join("") + "</table></div>";
      el("in-aridad").value = "";
      ["fb-grados", "fb-aridad"].forEach(function (k) {
        el(k).className = "fb";
        el(k).textContent = "";
      });
      return filas;
    }

    function comprobarGrados() {
      var A = arbol(), filas = [A.raiz, A.interno, A.hoja], msgs = [], ok = true;
      filas.forEach(function (u) {
        var vc = parseInt(el("gc-" + u).value, 10), vs = parseInt(el("gs-" + u).value, 10);
        var rc = E.fbGrado(A, u, true, isNaN(vc) ? -99 : vc);
        var rs = E.fbGrado(A, u, false, isNaN(vs) ? -99 : vs);
        el("gc-" + u).className = rc.ok ? "acierto" : "falla";
        el("gs-" + u).className = rs.ok ? "acierto" : "falla";
        ok = ok && rc.ok && rs.ok;
        msgs.push(rc.ok && rs.ok
          ? (A.padre[u] === -1
              ? A.nombre[u] + ": los dos números coinciden, y es el único nodo donde eso pasa."
              : rs.msg)
          : (rc.ok ? rs.msg : rc.msg));
      });
      el("fb-grados").className = ok ? "fb bien" : "fb mal";
      el("fb-grados").textContent = msgs.join(" ");
      var a = parseInt(el("in-aridad").value, 10);
      var ra = E.fbAridad(A, isNaN(a) ? -99 : a);
      el("fb-aridad").className = ra.ok ? "fb bien" : "fb mal";
      el("fb-aridad").textContent = isNaN(a) ? "Falta el número de la aridad." : ra.msg;
      if (isNaN(a)) { el("fb-aridad").className = "fb mal"; }
    }

    /* ---------- el arbol binario que quedo en memoria ---------- */

    function limpiarBinario() {
      var A = arbol();
      el("rot-prof-gen").innerHTML = "Profundidad de <i>" + A.nombre[A.foco] +
        "</i> en el árbol de aridad libre";
      el("rot-prof-bin").innerHTML = "Profundidad de <i>" + A.nombre[A.foco] +
        "</i> leyendo los dos punteros como un árbol binario";
      ["prof-gen", "prof-bin", "alt-bin"].forEach(function (k) {
        el("in-" + k).value = "";
        el("fb-" + k).className = "fb";
        el("fb-" + k).textContent = "";
      });
      el("panel-binario").innerHTML = "";
      el("pie-binario").textContent = "El dibujo aparece al comprobar.";
    }

    function dibujoBinario() {
      var A = arbol();
      var alto = 70 + 42 * A.alturaBin;
      var L = ARB.layoutBinario(A.binario, { ancho: 560, alto: alto });
      el("panel-binario").innerHTML = GRAFOSVG.dibujar({
        n: L.n, pos: L.pos, aristas: L.aristas, dirigido: false,
        ancho: 560, alto: alto, nombre: L.nombre,
        nodo: function (i) {
          var nm = String(L.lista[i].v);
          if (nm === A.nombre[A.foco]) {
            return { relleno: "#fdf1dc", borde: "#e8a13d", grueso: 3.4,
                     nota: "d = " + A.profBin[A.nombre.indexOf(nm)], notaColor: "#c77c0e" };
          }
          return { nota: "d = " + A.profBin[A.nombre.indexOf(nm)] };
        }
      });
      el("pie-binario").innerHTML = "Las ramas izquierdas son <code>hijoIzq</code> y las derechas " +
        "<code>hermanoDer</code>. Altura " + A.alturaBin + " contra " + A.altura +
        " del árbol de aridad libre; en cada nodo, su profundidad aquí.";
    }

    function comprobarBinario() {
      var A = arbol();
      var vg = parseInt(el("in-prof-gen").value, 10);
      var vb = parseInt(el("in-prof-bin").value, 10);
      var va = parseInt(el("in-alt-bin").value, 10);
      var rg = E.fbProfGeneral(A, A.foco, isNaN(vg) ? -99 : vg);
      var rb = E.fbProfBinaria(A, A.foco, isNaN(vb) ? -99 : vb);
      var ra = E.fbAlturaBinaria(A, isNaN(va) ? -99 : va);
      [["prof-gen", rg, vg], ["prof-bin", rb, vb], ["alt-bin", ra, va]].forEach(function (par) {
        el("fb-" + par[0]).className = par[1].ok ? "fb bien" : "fb mal";
        el("fb-" + par[0]).textContent = isNaN(par[2]) ? "Falta el número." : par[1].msg;
        if (isNaN(par[2])) { el("fb-" + par[0]).className = "fb mal"; }
      });
      dibujoBinario();
    }

    /* ---------- armado ---------- */

    function alPintar(e) {
      var a = e.actual;
      dibujo(a);
      arreglos(a);
      el("ver-cuerpo").textContent = a ? a.nota
        : "Sin arrancar. El llamado todavía no leyó ningún arreglo.";
    }

    function cambiarArbol() {
      var A = arbol();
      p.x = A.xInicial;
      el("ver-texto").textContent = A.texto + " Tiene " + A.n + " nodos y altura " + A.altura + ".";
      botonesNodo();
      limpiarHijos();
      tablaGrados();
      limpiarBinario();
      Motor.reiniciar(p);
    }

    Motor.iniciar({
      codigo: E.CODIGO_HIJOS,
      simular: function (q) { return E.simHijos(E.ARBOLES[q.t], q.x); },
      chips: [{ campo: "xNom", rotulo: "x" }, { campo: "vNom", rotulo: "v" },
              { campo: "ansNom", rotulo: "ans", clase: "cuenta" }],
      paramsIniciales: p, alPintar: alPintar
    });

    el("presets-arbol").innerHTML = "<span class='nota' style='margin-top:0'>Árbol:</span>" +
      E.ARBOLES.map(function (A, i) {
        return "<button data-v='" + i + "' class='" + (i === 0 ? "primario" : "") + "'>" + A.boton + "</button>";
      }).join("");
    Array.prototype.forEach.call(el("presets-arbol").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        p.t = parseInt(b.getAttribute("data-v"), 10);
        Array.prototype.forEach.call(el("presets-arbol").querySelectorAll("button"), function (x) {
          x.classList.remove("primario");
        });
        b.classList.add("primario");
        cambiarArbol();
      });
    });

    el("presets-convertir").innerHTML = "<span class='nota' style='margin-top:0'>Árbol:</span>" +
      E.PARA_CONVERTIR.map(function (A, i) {
        return "<button data-v='" + i + "' class='" + (i === 0 ? "primario" : "") + "'>" + A.boton + "</button>";
      }).join("");
    Array.prototype.forEach.call(el("presets-convertir").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        c = parseInt(b.getAttribute("data-v"), 10);
        Array.prototype.forEach.call(el("presets-convertir").querySelectorAll("button"), function (x) {
          x.classList.remove("primario");
        });
        b.classList.add("primario");
        dibujoConvertir();
        tablaConvertir();
      });
    });

    el("btn-hijos").addEventListener("click", comprobarHijos);
    el("btn-convertir").addEventListener("click", comprobarConvertir);
    el("btn-grados").addEventListener("click", comprobarGrados);
    el("btn-binario").addEventListener("click", comprobarBinario);

    cambiarArbol();
    dibujoConvertir();
    tablaConvertir();
  })();
}
