/* =====================================================================
   INVIGO · EDICIÓN PREMIUM · comun.js
   Funciones compartidas por la invitación y el Save the Date.
   ---------------------------------------------------------------------
   1. Utilidades
   2. Textos desde CONFIG (data-fill)
   3. Calendario (Google Calendar y archivo .ics)
   4. Cuenta regresiva con efecto "tic"
   5. Pétalos que caen (canvas)
   ===================================================================== */

/* ===== 1. UTILIDADES ===== */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const dos = (n) => String(n).padStart(2, "0");
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const reducirMovimiento = matchMedia("(prefers-reduced-motion: reduce)").matches;

const fecha = new Date(CONFIG.fechaISO);

// Aviso flotante (toast)
let toastTimer;
function aviso(texto) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = texto;
  t.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("visible"), 2800);
}

// Leer/guardar en localStorage sin romper si el navegador lo bloquea
const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const leer = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };


/* ===== 2. TEXTOS DESDE CONFIG =====
   Todo elemento con data-fill="clave" recibe el valor de esa clave. */
function formatoFechas() {
  const opt = { timeZone: CONFIG.zonaHoraria };
  const partes = new Intl.DateTimeFormat("es-AR", {
    ...opt, day: "2-digit", month: "2-digit", year: "numeric"
  }).formatToParts(fecha);
  const get = (t) => partes.find((p) => p.type === t).value;

  const larga = new Intl.DateTimeFormat("es-AR", {
    ...opt, weekday: "long", day: "numeric", month: "long", year: "numeric"
  }).format(fecha).replace(",", "");

  const mes = new Intl.DateTimeFormat("es-AR", { ...opt, month: "long" }).format(fecha);

  return {
    fechaCorta: `${get("day")} · ${get("month")} · ${get("year")}`,
    fechaLarga: cap(larga),
    dia: String(Number(get("day"))),
    mes: mes.toUpperCase(),
    anio: get("year")
  };
}

function rellenarTextos() {
  const r = CONFIG.regalos.transferencia;
  const datos = {
    novia: CONFIG.novia,
    novio: CONFIG.novio,
    monograma: `${CONFIG.novia[0]} & ${CONFIG.novio[0]}`,
    ciudad: CONFIG.ciudad,
    rsvpLimite: CONFIG.rsvpLimite,
    textoSaveTheDate: CONFIG.textoSaveTheDate,
    ...formatoFechas()
  };
  $$("[data-fill]").forEach((el) => {
    const v = datos[el.dataset.fill];
    if (v) el.textContent = v;
  });
}


/* ===== 3. CALENDARIO ===== */
const aUTC = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
const finEvento = () => new Date(fecha.getTime() + CONFIG.duracionHoras * 3600 * 1000);
const tituloEvento = () => `Casamiento de ${CONFIG.novia} y ${CONFIG.novio}`;
const detalleEvento = () =>
  `Ceremonia ${CONFIG.lugares.ceremonia.hora} · Fiesta ${CONFIG.lugares.fiesta.hora}`;

function enlaceGoogleCalendar() {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: tituloEvento(),
    dates: `${aUTC(fecha)}/${aUTC(finEvento())}`,
    details: detalleEvento(),
    location: CONFIG.lugares.ceremonia.direccion
  });
  return "https://calendar.google.com/calendar/render?" + p;
}

// Archivo .ics: sirve para Apple Calendar, Outlook y casi cualquier agenda
function descargarICS() {
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//InviGo//Premium//ES",
    "BEGIN:VEVENT",
    `UID:${aUTC(fecha)}@invigo`,
    `DTSTAMP:${aUTC(new Date())}`,
    `DTSTART:${aUTC(fecha)}`,
    `DTEND:${aUTC(finEvento())}`,
    `SUMMARY:${tituloEvento()}`,
    `DESCRIPTION:${detalleEvento()}`,
    `LOCATION:${CONFIG.lugares.ceremonia.direccion}`,
    "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");

  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "casamiento.ics" });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}


/* ===== 4. CUENTA REGRESIVA =====
   Cada vez que un número cambia, se le agrega la clase "tic" para animarlo. */
function ponerNumero(el, valor) {
  if (!el || el.textContent === valor) return;
  el.textContent = valor;
  el.classList.remove("tic");
  void el.offsetWidth;            // fuerza al navegador a reiniciar la animación
  el.classList.add("tic");
}

function iniciarContador() {
  const caja = $("#contador"), mensaje = $("#cMensaje");

  function tick() {
    const falta = fecha - new Date();
    if (falta <= 0) {
      if (caja) caja.hidden = true;
      if (mensaje) mensaje.hidden = false;
      return false;
    }
    const seg = Math.floor(falta / 1000);
    ponerNumero($("#cDias"),  dos(Math.floor(seg / 86400)));
    ponerNumero($("#cHoras"), dos(Math.floor((seg % 86400) / 3600)));
    ponerNumero($("#cMin"),   dos(Math.floor((seg % 3600) / 60)));
    ponerNumero($("#cSeg"),   dos(seg % 60));
    return true;
  }

  if (!tick()) return;
  const reloj = setInterval(() => { if (!tick()) clearInterval(reloj); }, 1000);
}


/* ===== 5. PÉTALOS QUE CAEN ===== */
function iniciarPetalos(canvas) {
  if (!canvas || reducirMovimiento) return;
  const ctx = canvas.getContext("2d");
  // Colores más saturados que antes para que los pétalos se noten sobre fondos claros y oscuros
  const colores = [
    "rgba(226,150,160,.9)", "rgba(240,190,196,.92)",
    "rgba(255,244,238,.95)", "rgba(215,175,105,.85)"
  ];
  let w, h, dpr;

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const nuevo = (alAzar) => ({
    x: Math.random() * w,
    y: alAzar ? Math.random() * h : -20,
    r: 2 + Math.random() * 6,
    vy: 0.45 + Math.random() * 0.9,
    vx: -0.2 + Math.random() * 0.4,
    ang: Math.random() * 6.28,
    va: (Math.random() - 0.5) * 0.03,
    osc: Math.random() * 6.28,
    color: colores[(Math.random() * colores.length) | 0]
  });

  medir();
  const petalos = Array.from({ length: innerWidth < 600 ? 18 : 34 }, () => nuevo(true));
  addEventListener("resize", medir);

  (function animar() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < petalos.length; i++) {
      const p = petalos[i];
      p.osc += 0.02;
      p.x += p.vx + Math.sin(p.osc) * 0.55;
      p.y += p.vy;
      p.ang += p.va;
      if (p.y > h + 20) petalos[i] = nuevo(false);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.ang);
      ctx.fillStyle = p.color;
      // Forma de pétalo (gota): punta fina arriba, panza redondeada abajo
      ctx.beginPath();
      ctx.moveTo(0, -p.r);
      ctx.bezierCurveTo(p.r * 0.9, -p.r * 0.4, p.r * 0.7, p.r * 0.9, 0, p.r);
      ctx.bezierCurveTo(-p.r * 0.7, p.r * 0.9, -p.r * 0.9, -p.r * 0.4, 0, -p.r);
      ctx.fill();
      ctx.restore();
    }
    requestAnimationFrame(animar);
  })();
}
