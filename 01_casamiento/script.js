/* ==================================================================
   BOX DE PRESENTACIÓN Y AUTOPLAY DE MÚSICA
   ================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const presentationBox = document.getElementById('presentation-box');
  const btnOpen = document.getElementById('btn-open-invite');
  const audio = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-toggle'); // El botoncito flotante de música

  if (presentationBox && btnOpen) {
    btnOpen.addEventListener('click', () => {
      // 1. Ocultamos la caja
      presentationBox.classList.add('is-hidden');
      
      // 2. Liberamos el scroll de la página
      document.body.classList.remove('no-scroll');
      
      // 3. Le damos play a la música automáticamente
      if (audio) {
        audio.play().then(() => {
          if(musicBtn) {
            musicBtn.setAttribute('aria-pressed', 'true');
            musicBtn.setAttribute('aria-label', 'Pausar música');
          }
        }).catch((err) => {
          console.warn("No se pudo reproducir la música automáticamente:", err);
        });
      }
    });
  }
});
/* ==========================================================
   INVITACIÓN DE CASAMIENTO · JavaScript
   1. AOS (animaciones on-scroll, opcional y a prueba de fallos)
   2. Pétalos cayendo (canvas)
   3. Música de fondo
   4. Formulario RSVP (listo para Google Apps Script)
   ========================================================== */

/* ----------------------------------------------------------
   CONFIGURACIÓN: pegá acá la URL de tu Web App de Apps Script
   (Implementar > Nueva implementación > Aplicación web)
   Si queda vacía, el formulario funciona en "modo demo".
   ---------------------------------------------------------- */
var APPS_SCRIPT_URL = "";

/* ==========================================================
   1. AOS
   El HTML usa data-reveal / data-delay. Solo si AOS cargó
   correctamente se convierten en atributos data-aos. Si AOS
   no está disponible, el contenido queda visible sin animar.
   ========================================================== */
(function initAnimations() {
  function run() {
    if (typeof window.AOS === "undefined") {
      console.warn("AOS no cargó: se muestra el contenido sin animaciones.");
      return;
    }
    try {
      var items = document.querySelectorAll("[data-reveal]");
      for (var i = 0; i < items.length; i++) {
        var el = items[i];
        el.setAttribute("data-aos", el.getAttribute("data-reveal"));
        var delay = el.getAttribute("data-delay");
        if (delay) el.setAttribute("data-aos-delay", delay);
      }
      window.AOS.init({
        duration: 1100,          // animaciones lentas y suaves
        easing: "ease-out-cubic",
        once: true,              // se animan una sola vez
        offset: 60,
      });
    } catch (err) {
      // Si algo falla, nos aseguramos de que todo quede visible
      console.warn("AOS falló:", err);
      var hidden = document.querySelectorAll("[data-aos]");
      for (var j = 0; j < hidden.length; j++) {
        hidden[j].removeAttribute("data-aos");
        hidden[j].style.opacity = "1";
        hidden[j].style.transform = "none";
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();

/* ==========================================================
   2. PÉTALOS (HTML5 Canvas)
   Partículas livianas con balanceo suave y rotación lenta.
   ========================================================== */
(function petals() {
  var canvas = document.getElementById("petals-canvas");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  // Respeta a quienes tienen "reducir movimiento" activado
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    canvas.style.display = "none";
    return;
  }

  // Paleta pastel/tierra, con transparencia para que sea sutil
  var COLORS = [
    "rgba(217, 184, 166, 0.55)", // rosa empolvado
    "rgba(232, 210, 200, 0.55)", // rosa claro
    "rgba(176, 137, 104, 0.35)", // tierra
    "rgba(190, 200, 170, 0.45)"  // verde salvia (hojas)
  ];

  var w = 0, h = 0, dpr = 1, list = [], rafId = null;

  // Menos partículas en pantallas chicas para cuidar la batería
  function countFor() { return window.innerWidth < 600 ? 18 : 32; }

  function createPetal(randomY) {
    var size = 6 + Math.random() * 9;
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -20,
      size: size,
      speedY: 0.25 + Math.random() * 0.45,   // caída muy lenta
      drift: 0.3 + Math.random() * 0.6,      // amplitud del vaivén
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.004 + Math.random() * 0.006,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.012,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      isLeaf: Math.random() < 0.25
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var target = countFor();
    while (list.length < target) list.push(createPetal(true));
    list.length = target;
  }

  // Dibuja un pétalo (gota) o una hoja (óvalo afilado)
  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    if (p.isLeaf) {
      ctx.ellipse(0, 0, p.size * 0.35, p.size * 0.9, 0, 0, Math.PI * 2);
    } else {
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size, -p.size * 0.6, p.size * 0.8, p.size * 0.8, 0, p.size);
      ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.8, -p.size, -p.size * 0.6, 0, -p.size);
    }
    ctx.fill();
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      p.phase += p.phaseSpeed;
      p.x += Math.sin(p.phase) * p.drift;
      p.y += p.speedY;
      p.rot += p.rotSpeed;
      drawPetal(p);
      // Reinicia arriba al salir de pantalla
      if (p.y > h + 20 || p.x < -30 || p.x > w + 30) list[i] = createPetal(false);
    }
    rafId = requestAnimationFrame(tick);
  }

  // Pausa la animación cuando la pestaña no está visible
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { cancelAnimationFrame(rafId); rafId = null; }
    else if (!rafId) { rafId = requestAnimationFrame(tick); }
  });

  window.addEventListener("resize", resize);
  resize();
  rafId = requestAnimationFrame(tick);
})();

/* ==========================================================
   3. MÚSICA DE FONDO
   Los navegadores bloquean el autoplay: solo suena tras un toque.
   ========================================================== */
(function music() {
  var btn = document.getElementById("music-toggle");
  var audio = document.getElementById("bg-music");
  if (!btn || !audio) return;

  audio.volume = 0.5;

  btn.addEventListener("click", function () {
    if (audio.paused) {
      var promise = audio.play();
      if (promise && promise.then) {
        promise.then(function () {
          btn.setAttribute("aria-pressed", "true");
          btn.setAttribute("aria-label", "Pausar música");
        }).catch(function (err) {
          // Archivo faltante o reproducción bloqueada
          console.warn("No se pudo reproducir la música:", err);
        });
      }
    } else {
      audio.pause();
      btn.setAttribute("aria-pressed", "false");
      btn.setAttribute("aria-label", "Reproducir música");
    }
  });
})();

/* ==========================================================
   4. FORMULARIO RSVP
   IDs: #rsvp-form, #nombre-apellido, #asistencia,
        #restricciones, #btn-confirmar, #form-status
   ========================================================== */
(function rsvp() {
  var form = document.getElementById("rsvp-form");
  var nombre = document.getElementById("nombre-apellido");
  var asistencia = document.getElementById("asistencia");
  var restricciones = document.getElementById("restricciones");
  var btn = document.getElementById("btn-confirmar");
  var status = document.getElementById("form-status");
  if (!form) return;

  function setStatus(msg, type) {
    status.textContent = msg;
    status.className = "form-status" + (type ? " " + type : "");
  }

  // Marca/desmarca un campo como inválido
  function setInvalid(input, invalid) {
    var field = input.closest(".field");
    if (field) field.classList.toggle("invalid", invalid);
  }

  // Limpia el error apenas el usuario corrige
  [nombre, asistencia].forEach(function (el) {
    el.addEventListener("input", function () { setInvalid(el, false); });
  });

  function validate() {
    var ok = true;
    var nombreOk = nombre.value.trim().split(/\s+/).length >= 2; // nombre + apellido
    setInvalid(nombre, !nombreOk);
    if (!nombreOk) ok = false;

    var asisOk = asistencia.value !== "";
    setInvalid(asistencia, !asisOk);
    if (!asisOk) ok = false;
    return ok;
  }

  function setLoading(loading) {
    btn.disabled = loading;
    btn.classList.toggle("is-loading", loading);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus("", "");

    if (!validate()) {
      setStatus("Por favor completá tu nombre y apellido y tu asistencia.", "error");
      return;
    }

    // Datos que recibirá Apps Script (las claves llegan en e.parameter)
    var data = new URLSearchParams();
    data.append("nombre_apellido", nombre.value.trim());
    data.append("asistencia", asistencia.value);
    data.append("restricciones", restricciones.value.trim());
    data.append("fecha_envio", new Date().toLocaleString("es-AR"));

    setLoading(true);

    var request;
    if (APPS_SCRIPT_URL) {
      // "no-cors": Apps Script no devuelve cabeceras CORS; la respuesta es
      // opaca pero el POST llega igual. Si falla la red, cae en catch.
      request = fetch(APPS_SCRIPT_URL, { method: "POST", mode: "no-cors", body: data });
    } else {
      // Modo demo: simula la espera de red
      request = new Promise(function (resolve) { setTimeout(resolve, 1200); });
      console.info("RSVP (modo demo):", data.toString());
    }

    request.then(function () {
      var va = asistencia.value === "Voy";
      setStatus(
        va ? "¡Gracias! Tu asistencia fue confirmada. Te esperamos." : "Gracias por avisarnos. Te vamos a extrañar.",
        "success"
      );
      form.reset();
    }).catch(function (err) {
      console.error(err);
      setStatus("No pudimos enviar tu respuesta. Probá de nuevo en unos minutos.", "error");
    }).then(function () {
      setLoading(false);
    });
  });
})();

/* ==========================================================
   REFERENCIA: código para Google Apps Script (Code.gs)
   ----------------------------------------------------------
   1) Creá una planilla de Google Sheets con la hoja "RSVP" y los
      encabezados: Fecha | Nombre y apellido | Asistencia | Restricciones
   2) Extensiones > Apps Script, pegá esto:

   function doPost(e) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RSVP");
     const p = e.parameter;
     sheet.appendRow([
       p.fecha_envio,
       p.nombre_apellido,
       p.asistencia,
       p.restricciones
     ]);
     return ContentService.createTextOutput("ok");
   }

   3) Implementar > Nueva implementación > Aplicación web
      - Ejecutar como: Yo
      - Quién tiene acceso: Cualquier usuario
   4) Copiá la URL y pegala en APPS_SCRIPT_URL, arriba.
   ========================================================== */
