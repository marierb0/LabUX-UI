/* =====================================================================
   BOO-GIE · Funky Disco — Interacciones con el scroll
   Este archivo solo agrega movimiento al bajar la página.
   Si no carga, la página se ve completa igual (todo el contenido está en el HTML).
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

  // En celular la línea debe terminar justo en la última década (90's y 2000's)
  var esCelular = window.matchMedia("(max-width: 767px)");
  function ajustarFinLinea() {
    if (!linea) return;
    if (!esCelular.matches) { linea.style.removeProperty("--fin"); return; }
    var contenedor = linea.parentElement.getBoundingClientRect();
    var bolitas = document.querySelectorAll(".timeline .tl-year");
    var ultima = bolitas[bolitas.length - 1].getBoundingClientRect();
    var fin = contenedor.bottom - (ultima.top + ultima.height / 2);
    linea.style.setProperty("--fin", Math.max(0, fin) + "px");
  }
  ajustarFinLinea();
  window.addEventListener("resize", ajustarFinLinea);
  window.addEventListener("load", ajustarFinLinea);

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
    // Cada conector se dibuja cuando la punta llega a la bolita de su década
    conectores.forEach(function (con) {
      var item = con.closest("li");
      var bolita = item.querySelector(".tl-year").getBoundingClientRect();
      var encendido = punta >= bolita.top + bolita.height * 0.4;
      con.classList.toggle("is-on", encendido);
      item.classList.toggle("is-on", encendido);   // en celular el conector es una línea CSS
    });
  }

  /* ---------- 3. Barra de progreso de lectura ---------- */
  var barra = document.querySelector(".progress span");
  function actualizarBarra() {
    if (!barra) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    barra.style.setProperty("--progress", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
  }

  /* ---------- 4. Discos que giran con el scroll ----------
     Bajar la página = gira hacia adelante. Subir = retrocede. */
  var discos = document.querySelectorAll("[data-disco]");
  function girarDiscos() {
    if (reduceMotion) return;
    var giro = (window.scrollY * 0.35).toFixed(1);   // grados por píxel de scroll
    discos.forEach(function (d) { d.style.setProperty("--giro", giro); });
  }

  /* ---------- Escuchar el scroll (una vez por cuadro de animación) ---------- */
  var pendiente = false;
  function alHacerScroll() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(function () {
      actualizarLinea();
      actualizarBarra();
      girarDiscos();
      pendiente = false;
    });
  }
  window.addEventListener("scroll", alHacerScroll, { passive: true });
  window.addEventListener("resize", alHacerScroll);
  alHacerScroll();

  /* ---------- 5. Fragmentos de audio de las canciones ----------
     Usa las vistas previas oficiales de 30 segundos de Apple Music
     (iTunes Search API). Se necesita internet. */
  var player = document.querySelector(".player");
  if (player) {
    var canciones = player.querySelectorAll(".song");
    var radios = player.querySelectorAll("input[name='cancion']");
    var boton = player.querySelector("[data-audio-toggle]");
    var etiqueta = player.querySelector("[data-audio-label]");
    var estado = player.querySelector("[data-audio-status]");
    var audio = new Audio();
    audio.preload = "none";
    audio.volume = 0.8;
    var previews = [];          // { url, link } de cada canción
    var actual = -1;            // canción que está sonando
    var esperando = -1;         // canción que se pidió antes de que cargara su audio

    // Busca una canción en Apple Music (JSONP: funciona sin servidor propio)
    function buscar(i) {
      var li = canciones[i];
      var nombre = "boogieCancion" + i;
      window[nombre] = function (datos) {
        var artista = li.dataset.artista.toLowerCase();
        var elegido = (datos.results || []).filter(function (r) {
          return r.previewUrl && r.artistName.toLowerCase().indexOf(artista.split(" ")[0]) !== -1;
        })[0] || (datos.results || []).filter(function (r) { return r.previewUrl; })[0];
        if (elegido) previews[i] = { url: elegido.previewUrl, link: elegido.trackViewUrl };
        if (esperando === i) { esperando = -1; reproducir(i); }
        delete window[nombre];
      };
      var script = document.createElement("script");
      script.src = "https://itunes.apple.com/search?entity=song&limit=5&country=US&term=" +
        encodeURIComponent(li.dataset.cancion + " " + li.dataset.artista) + "&callback=" + nombre;
      script.onerror = function () { if (esperando === i) mostrar("No se pudo cargar el audio. Revisa tu conexión a internet."); };
      document.body.appendChild(script);
    }
    canciones.forEach(function (_, i) { buscar(i); });

    function mostrar(html) { estado.innerHTML = html; }

    function actualizarUI() {
      var sonando = actual !== -1 && !audio.paused;
      boton.hidden = actual === -1;
      boton.setAttribute("aria-pressed", String(!sonando));
      etiqueta.textContent = sonando ? "Pausar" : "Reanudar";
      canciones.forEach(function (li, i) { li.classList.toggle("is-sonando", sonando && i === actual); });
      player.classList.toggle("is-sonando", sonando);
    }

    function reproducir(i) {
      var li = canciones[i];
      var p = previews[i];
      if (!p) { esperando = i; mostrar("Cargando fragmento…"); return; }
      actual = i;
      audio.src = p.url;
      audio.currentTime = 0;
      var promesa = audio.play();
      if (promesa && promesa.catch) promesa.catch(function () {
        mostrar("Toca la portada para escuchar el fragmento.");
        actualizarUI();
      });
      mostrar("♪ Sonando: <strong>" + li.dataset.cancion + "</strong> — " + li.dataset.artista +
        ' · <a href="' + p.link + '" target="_blank" rel="noopener">Escuchar completa en Apple Music</a>');
      actualizarUI();
    }

    function pausarOReanudar() {
      if (actual === -1) return;
      if (audio.paused) audio.play(); else audio.pause();
    }

    // Al presionar play (cambia la canción activa) suena el fragmento de la nueva
    radios.forEach(function (radio, i) {
      radio.addEventListener("change", function () { if (radio.checked) reproducir(i); });
    });

    // Tocar la portada de la canción activa: escuchar / pausar
    canciones.forEach(function (li, i) {
      li.querySelector("img").addEventListener("click", function () {
        if (!radios[i].checked) return;
        if (actual === i) pausarOReanudar(); else reproducir(i);
      });
    });

    boton.addEventListener("click", pausarOReanudar);
    audio.addEventListener("play", actualizarUI);
    audio.addEventListener("pause", actualizarUI);
    audio.addEventListener("ended", function () {
      mostrar("Fin del fragmento. Presiona <strong>play</strong> para la siguiente canción.");
      actualizarUI();
    });
  }
})();
