/* =====================================================================
   BOO-GIE · Funky Disco — Interacciones con el scroll
   ===================================================================== */
(function () {
  "use strict";

  // Marca que hay JavaScript: el CSS solo esconde los textos si existe esta clase
  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Textos que aparecen al bajar ---------- */
  var textos = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("is-visible");
          observer.unobserve(entrada.target); // aparece una sola vez
        }
      });
    }, { threshold: 0.2 });
    textos.forEach(function (t) { observer.observe(t); });
  } else {
    textos.forEach(function (t) { t.classList.add("is-visible"); });
  }

  /* ---------- 2. Línea de tiempo que crece con el scroll ---------- */
  var linea = document.querySelector("[data-tl-line]");
  var conectores = document.querySelectorAll("[data-tl-con]");

  function actualizarLinea() {
    if (!linea) return;
    var caja = linea.getBoundingClientRect();
    var puntoLectura = window.innerHeight * 0.65;          // la línea "llega" hasta aquí
    var p = (puntoLectura - caja.top) / caja.height;
    p = Math.max(0, Math.min(1, p));
    if (reduceMotion) p = 1;
    linea.style.setProperty("--p", p.toFixed(4));
    linea.classList.toggle("is-done", p >= 1);

    // La punta de la línea, en coordenadas de la pantalla
    var punta = caja.top + caja.height * p;
    conectores.forEach(function (con) {
      var c = con.getBoundingClientRect();
      // El conector se dibuja cuando la punta pasa por su altura
      var lado = con.classList.contains("tl-con--l") ? c.bottom : c.top;
      con.classList.toggle("is-on", punta >= Math.min(c.top, lado) + c.height * 0.3);
    });
  }

  /* ---------- 3. Barra de progreso de lectura ---------- */
  var barra = document.querySelector(".progress span");
  function actualizarBarra() {
    if (!barra) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    barra.style.setProperty("--progress", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
  }

  /* ---------- Escuchar el scroll (una vez por cuadro de animación) ---------- */
  var pendiente = false;
  function alHacerScroll() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(function () {
      actualizarLinea();
      actualizarBarra();
      pendiente = false;
    });
  }
  window.addEventListener("scroll", alHacerScroll, { passive: true });
  window.addEventListener("resize", alHacerScroll);
  alHacerScroll();
})();
