/* =====================================================================
   INVIGO · EDICIÓN PREMIUM · script.js
   Lógica de la invitación. Los datos están en config.js y las
   funciones compartidas en comun.js.
   ---------------------------------------------------------------------
    1. Invitado personalizado (?i=Nombre&p=3)
    2. Hero: foto y parallax
    3. Intro: sobre animado
    4. Reproductor de música
    5. Carrusel fotográfico + visor
    6. Mapa satelital
    7. Regalos exclusivos (código + copiar)
    8. Animaciones al hacer scroll
    9. RSVP automatizado + entrada de confirmación
   10. Arranque
   ===================================================================== */


/* ===== 1. INVITADO PERSONALIZADO =====
   El link de cada invitado puede traer su nombre y cantidad de pases. */
const params = new URLSearchParams(location.search);
const invitado = (params.get("i") || "").trim().slice(0, 60);
const maxPersonas = Math.min(10, Math.max(1,
  parseInt(params.get("p"), 10) || CONFIG.maxPersonasPorDefecto));

function personalizar() {
  if (!invitado) return;
  $("#introPara").textContent = `Para ${invitado}`;
  const saludo = $("#saludo");
  saludo.textContent = `Para ${invitado}`;
  saludo.hidden = false;
}


/* ===== 2. HERO: FOTO Y PARALLAX ===== */
function iniciarHero() {
  const fondo = $("#heroFondo");
  const banda = $("#bandaFondo");
  const barra = $("#progScroll");
  const linea = $("#linea");
  fondo.style.backgroundImage = `url("${CONFIG.fotoHero}")`;
  banda.style.backgroundImage = `url("${CONFIG.fotoBanda}")`;
  $("#frase").textContent = CONFIG.frase;

  // Una sola función de scroll (con requestAnimationFrame) mueve todo lo animado
  function alScrollear() {
    const y = scrollY;
    const alto = document.documentElement.scrollHeight - innerHeight;
    barra.style.transform = `scaleX(${alto > 0 ? Math.min(1, y / alto) : 0})`;

    if (!reducirMovimiento) {
      if (y < innerHeight * 1.3) fondo.style.translate = `0 ${y * 0.25}px`;

      // Parallax de la banda: la foto se mueve más lento que la página
      const r = banda.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        banda.style.translate = `0 ${(r.top + r.height / 2 - innerHeight / 2) * -0.18}px`;
      }
    }

    // Cronograma: la línea dorada se llena según cuánto se bajó
    if (linea) {
      const l = linea.getBoundingClientRect();
      const avance = (innerHeight * 0.6 - l.top) / l.height;
      linea.style.setProperty("--prog", Math.min(1, Math.max(0, avance)).toFixed(3));
    }
  }

  let esperando = false;
  addEventListener("scroll", () => {
    if (esperando) return;
    esperando = true;
    requestAnimationFrame(() => { alScrollear(); esperando = false; });
  }, { passive: true });
  alScrollear();
}

/* Cronograma: se arma desde CONFIG.cronograma */
function iniciarCronograma() {
  const linea = $("#linea");
  CONFIG.cronograma.forEach((c, n) => {
    const item = el("li", "linea__item reveal-item");
    item.append(el("p", "linea__hora", c.hora), el("h3", "linea__titulo", c.titulo), el("p", "linea__texto", c.texto));
    item.style.transitionDelay = `${(n % 2) * 0.1}s`;
    linea.append(item);
  });
}


/* ===== 3. INTRO: SOBRE ANIMADO =====
   1) tapa se abre  2) sube la carta  3) el telón se desvanece  4) entra el hero */
function abrirInvitacion() {
  const sobre = $("#sobre");
  if (sobre.classList.contains("abriendo")) return;
  sobre.classList.add("abriendo");

  // La música se inicia en el mismo clic (los navegadores lo exigen)
  iniciarMusica();

  setTimeout(() => {
    $("#intro").classList.add("abierta");
    document.body.classList.remove("bloqueado");
    document.body.classList.add("lista");
    scrollTo(0, 0);
    revisarReveal();
  }, reducirMovimiento ? 100 : 2400);
}

$("#btnAbrir").addEventListener("click", abrirInvitacion);


/* ===== 4. REPRODUCTOR DE MÚSICA ===== */
const audio = $("#musica");
const player = $("#player");
let musicaOk = true;

const minutos = (s) => `${Math.floor(s / 60)}:${dos(Math.floor(s % 60))}`;

function iniciarMusica() {
  const m = CONFIG.musica;
  $("#pTitulo").textContent = m.titulo;
  $("#pArtista").textContent = m.artista;
  player.hidden = false;

  audio.src = m.src;
  audio.volume = 0;
  audio.play().then(() => {
    // Subida suave de volumen (~2 s)
    const paso = setInterval(() => {
      audio.volume = Math.min(m.volumen, audio.volume + 0.05);
      if (audio.volume >= m.volumen) clearInterval(paso);
    }, 180);
  }).catch(() => {});
}

audio.addEventListener("play",  () => player.classList.add("sonando"));
audio.addEventListener("pause", () => player.classList.remove("sonando"));
audio.addEventListener("error", () => {
  musicaOk = false;
  player.hidden = true;
  aviso("Agregá tu canción en " + CONFIG.musica.src);
}, { once: true });

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  $("#pRelleno").style.width = pct + "%";
  $("#pBarra").setAttribute("aria-valuenow", Math.round(pct));
  $("#pTiempo").textContent = minutos(audio.currentTime);
});

$("#pPlay").addEventListener("click", () => {
  if (!musicaOk) return;
  if (audio.paused) { audio.volume = audio.muted ? audio.volume : CONFIG.musica.volumen; audio.play(); }
  else audio.pause();
});

$("#pMute").addEventListener("click", () => {
  audio.muted = !audio.muted;
  player.classList.toggle("mudo", audio.muted);
});

// Tocar la barra para adelantar o atrasar
function buscar(clientX) {
  if (!audio.duration) return;
  const r = $("#pBarra").getBoundingClientRect();
  audio.currentTime = Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * audio.duration;
}
$("#pBarra").addEventListener("pointerdown", (e) => buscar(e.clientX));
$("#pBarra").addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") audio.currentTime += 5;
  if (e.key === "ArrowLeft") audio.currentTime -= 5;
});

// Si cambian de pestaña, pausamos y reanudamos al volver
let pausadaPorPestana = false;
document.addEventListener("visibilitychange", () => {
  if (!musicaOk || player.hidden) return;
  if (document.hidden && !audio.paused) { audio.pause(); pausadaPorPestana = true; }
  else if (!document.hidden && pausadaPorPestana) { audio.play().catch(() => {}); pausadaPorPestana = false; }
});


/* ===== 5. CARRUSEL FOTOGRÁFICO + VISOR ===== */
function iniciarCarrusel() {
  const fotos = CONFIG.fotos;
  const pista = $("#pista"), dotsBox = $("#dots"), pie = $("#carPie"), prog = $("#carProg");
  const vista = $(".carrusel__vista"), carrusel = $("#carrusel");
  const DURACION = 5500;
  let i = 0, timer = null;

  // Crear diapositivas y puntitos
  fotos.forEach((f, n) => {
    const fig = document.createElement("figure");
    fig.className = "slide";
    const img = new Image();
    img.src = f.src; img.alt = f.alt || ""; img.draggable = false;
    img.loading = n === 0 ? "eager" : "lazy";
    fig.append(img);
    pista.append(fig);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Ir a la foto ${n + 1}`);
    dot.addEventListener("click", () => mostrar(n));
    dotsBox.append(dot);
  });

  const slides = $$(".slide", pista), dots = $$("button", dotsBox);

  function mostrar(n) {
    i = (n + fotos.length) % fotos.length;
    pista.style.transform = `translateX(${-i * 100}%)`;
    slides.forEach((s, k) => s.classList.toggle("activo", k === i));
    dots.forEach((d, k) => d.classList.toggle("activo", k === i));
    pie.textContent = fotos[i].pie || "";

    // Reiniciar barra de progreso y programar la próxima foto
    prog.classList.remove("corre"); prog.style.animationPlayState = "";
    void prog.offsetWidth;
    prog.classList.add("corre");
    clearTimeout(timer);
    if (!reducirMovimiento) timer = setTimeout(() => mostrar(i + 1), DURACION);
  }

  function pausar() { clearTimeout(timer); prog.style.animationPlayState = "paused"; }

  $("#prev").addEventListener("click", () => mostrar(i - 1));
  $("#next").addEventListener("click", () => mostrar(i + 1));
  carrusel.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") pausar(); });
  carrusel.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") mostrar(i); });

  // Deslizar con el dedo / tocar para ampliar
  let x0 = null;
  vista.addEventListener("pointerdown", (e) => { x0 = e.clientX; });
  vista.addEventListener("pointerup", (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) mostrar(i + (dx < 0 ? 1 : -1));
    else if (Math.abs(dx) < 8) abrirVisor();
  });

  // Solo avanza solo cuando el carrusel está en pantalla
  new IntersectionObserver(([en]) => (en.isIntersecting ? mostrar(i) : pausar()),
    { threshold: 0.35 }).observe(carrusel);

  mostrar(0);
  pausar();

  /* --- Visor a pantalla completa --- */
  const visor = $("#lightbox");
  function pintarVisor() {
    $("#lbImg").src = fotos[i].src;
    $("#lbImg").alt = fotos[i].alt || "";
    $("#lbPie").textContent = fotos[i].pie || "";
  }
  function abrirVisor() { pintarVisor(); visor.hidden = false; document.body.style.overflow = "hidden"; }
  function cerrarVisor() { visor.hidden = true; document.body.style.overflow = ""; }

  visor.addEventListener("click", (e) => { if (e.target === visor || e.target.id === "lbCerrar") cerrarVisor(); });
  document.addEventListener("keydown", (e) => {
    if (visor.hidden) return;
    if (e.key === "Escape") cerrarVisor();
    if (e.key === "ArrowRight") { mostrar(i + 1); pintarVisor(); }
    if (e.key === "ArrowLeft")  { mostrar(i - 1); pintarVisor(); }
  });
}


/* ===== 6. MAPA SATELITAL =====
   Mapa embebido de Google (no necesita API key). t=k es satélite, t=m es calles. */
let lugarActual = "ceremonia";
let satelite = true;

function mostrarLugar(clave = lugarActual) {
  lugarActual = clave;
  const l = CONFIG.lugares[clave];
  const consulta = l.coords || `${l.nombre}, ${l.direccion}`;
  const q = encodeURIComponent(consulta);

  $("#lugarHora").textContent   = l.hora;
  $("#lugarNombre").textContent = l.nombre;
  $("#lugarDir").textContent    = l.direccion;
  $("#lugarLink").href = `https://www.google.com/maps/search/?api=1&query=${q}`;
  $("#mapaFrame").src  = `https://maps.google.com/maps?q=${q}&t=${satelite ? "k" : "m"}&z=${l.coords ? 18 : 17}&output=embed`;

  $("#mapaEtiqueta").textContent = satelite ? "Vista satelital" : "Mapa de calles";
  $("#btnVista").textContent     = satelite ? "Ver mapa de calles" : "Ver vista satelital";

  $$(".tabs__btn").forEach((b) => {
    const activo = b.dataset.lugar === clave;
    b.classList.toggle("activo", activo);
    b.setAttribute("aria-selected", activo);
  });
}

$$(".tabs__btn").forEach((b) => b.addEventListener("click", () => mostrarLugar(b.dataset.lugar)));
$("#btnVista").addEventListener("click", () => { satelite = !satelite; mostrarLugar(); });


/* ===== 7. REGALOS EXCLUSIVOS ===== */
// Crea un elemento con clase y texto (usar textContent evita inyectar HTML)
function el(tag, clase = "", texto = "") {
  const e = document.createElement(tag);
  if (clase) e.className = clase;
  if (texto) e.textContent = texto;
  return e;
}

function construirRegalos() {
  const grid = $("#regalosGrid");
  grid.replaceChildren();
  const t = CONFIG.regalos.transferencia;

  // Tarjeta de transferencia
  const banco = el("article", "regalo regalo--ancho");
  banco.append(el("h3", "", "Transferencia bancaria"));
  const dl = el("dl");
  [["Titular", t.titular], ["Banco", t.banco], ["Alias", t.alias, true], ["CBU", t.cbu, true]]
    .forEach(([nombre, valor, copiable]) => {
      if (!valor) return;
      const fila = el("div");
      fila.append(el("dt", "", nombre));
      const dd = el("dd");
      dd.append(el("span", "", valor));
      if (copiable) dd.append(Object.assign(el("button", "copiar", "Copiar"), { type: "button" }));
      fila.append(dd);
      dl.append(fila);
    });
  banco.append(dl);
  grid.append(banco);

  // Otras opciones
  CONFIG.regalos.opciones.forEach((o) => {
    const c = el("article", "regalo");
    c.append(el("h3", "", o.titulo), el("p", "", o.texto));
    if (o.link) {
      const a = el("a", "boton boton--ghost", o.boton || "Ver");
      a.href = o.link; a.target = "_blank"; a.rel = "noopener";
      c.append(a);
    }
    grid.append(c);
  });

  // Aparición escalonada
  $$(".regalo", grid).forEach((c, n) => (c.style.animationDelay = `${n * 0.18}s`));
}

// Botones "Copiar" (delegación de eventos: un solo listener para todos)
$("#regalosGrid").addEventListener("click", async (e) => {
  const btn = e.target.closest(".copiar");
  if (!btn) return;
  const texto = btn.previousElementSibling.textContent.trim();
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    const tmp = Object.assign(document.createElement("textarea"), { value: texto });
    document.body.appendChild(tmp); tmp.select(); document.execCommand("copy"); tmp.remove();
  }
  aviso("Copiado ✓");
});

function iniciarRegalos() {
  const gate = $("#gate");
  const codigo = (CONFIG.regalos.codigo || "").trim().toUpperCase();

  function desbloquear() {
    gate.hidden = true;
    construirRegalos();
    $("#regalosContenido").hidden = false;
  }

  // Sin código configurado, o ya ingresado antes: se muestra directo
  if (!codigo || leer("invigo-regalos") === codigo) return desbloquear();

  gate.hidden = false;
  $("#gateAyuda").textContent = CONFIG.regalos.ayuda || "";

  gate.addEventListener("submit", (e) => {
    e.preventDefault();
    const ingresado = $("#gateCodigo").value.trim().toUpperCase();
    if (ingresado === codigo) {
      guardar("invigo-regalos", codigo);
      desbloquear();
    } else {
      $("#gateError").textContent = "Ese código no es correcto. Revisá tu invitación.";
      gate.classList.remove("sacudir"); void gate.offsetWidth; gate.classList.add("sacudir");
    }
  });
}


/* ===== 8. ANIMACIONES AL HACER SCROLL ===== */
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("visible"); observador.unobserve(en.target); }
  });
}, { threshold: 0.12 });

function revisarReveal() {
  $$(".reveal:not(.visible), .reveal-item:not(.visible)").forEach((e) => observador.observe(e));
}


/* ===== 9. RSVP AUTOMATIZADO ===== */
const form = $("#formRsvp");
const estado = $("#rsvpEstado");
const GUARDADO = "invigo-rsvp";

// Opciones de cantidad según los pases del invitado
function prepararFormulario() {
  const sel = $("#cantidad");
  for (let n = 1; n <= maxPersonas; n++) sel.append(new Option(n, n));
  sel.value = String(maxPersonas);
  if (invitado) form.nombre.value = invitado;
}

$$('input[name="asistencia"]').forEach((r) =>
  r.addEventListener("change", () => {
    $("#rsvpExtra").classList.toggle("oculto", !form.asistencia.value.startsWith("Sí"));
  })
);

function mostrarEstado(texto, error = false) {
  estado.textContent = texto;
  estado.classList.toggle("error", error);
}

// Entrada de confirmación que reemplaza al formulario
function mostrarTicket(d) {
  const viene = d.asistencia.startsWith("Sí");
  const t = $("#ticket");
  t.replaceChildren();

  t.append(
    el("p", "ticket__estado", viene ? "Asistencia confirmada" : "Respuesta recibida"),
    el("p", "ticket__sello", viene ? "¡Nos vemos!" : "Gracias"),
    el("p", "ticket__nombre", d.nombre)
  );

  if (viene) {
    const cant = Number(d.cantidad);
    t.append(
      el("p", "ticket__linea", `${cant} ${cant === 1 ? "persona" : "personas"} · ${formatoFechas().fechaLarga}`),
      el("p", "ticket__linea", `Ceremonia ${CONFIG.lugares.ceremonia.hora} · ${CONFIG.lugares.ceremonia.nombre}`)
    );
    const acc = el("div", "acciones");
    const g = el("a", "boton boton--ghost-claro", "Agendar");
    g.href = enlaceGoogleCalendar(); g.target = "_blank"; g.rel = "noopener";
    const ics = Object.assign(el("button", "boton boton--ghost-claro", ".ics"), { type: "button" });
    ics.addEventListener("click", descargarICS);
    acc.append(g, ics);
    t.append(acc);
  } else {
    t.append(el("p", "ticket__linea", "Lamentamos que no puedas acompañarnos. ¡Te vamos a extrañar!"));
  }

  const editar = Object.assign(el("button", "boton boton--ghost-claro", "Modificar respuesta"), { type: "button" });
  editar.addEventListener("click", () => {
    t.hidden = true; form.hidden = false;
    form.nombre.value = d.nombre; form.email.value = d.email || "";
    mostrarEstado("");
  });
  t.append(el("div", "acciones")).lastChild.append(editar);

  form.hidden = true;
  t.hidden = false;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = form.nombre.value.trim();
  const email = form.email.value.trim();
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

  form.nombre.closest(".campo").classList.toggle("error", !nombre);
  form.email.closest(".campo").classList.toggle("error", !emailValido);
  if (!nombre) return mostrarEstado("Por favor, escribí tu nombre.", true);
  if (!emailValido) return mostrarEstado("Escribí un email válido para enviarte la confirmación.", true);

  const viene = form.asistencia.value.startsWith("Sí");
  const datos = {
    nombre, email,
    asistencia: form.asistencia.value,
    cantidad: viene ? form.cantidad.value : "0",
    menu: viene ? form.menu.value : "-",
    mensaje: form.mensaje.value.trim(),
    invitado,                                   // link personalizado (si lo hay)
    evento: tituloEvento(),
    fechaEvento: formatoFechas().fechaLarga,
    lugar: `${CONFIG.lugares.ceremonia.nombre} · ${CONFIG.lugares.ceremonia.hora}`,
    enviado: new Date().toISOString()
  };

  const btn = $("#btnEnviar");
  btn.disabled = true;
  mostrarEstado("Enviando…");

  try {
    if (CONFIG.rsvpUrl) {
      // Apps Script: guarda en Sheets y envía los mails. "no-cors" evita errores de CORS.
      await fetch(CONFIG.rsvpUrl, { method: "POST", mode: "no-cors", body: new URLSearchParams(datos) });
    } else if (CONFIG.whatsapp) {
      const msg = `Hola! Soy ${nombre}. ${datos.asistencia}` +
        (viene ? ` (${datos.cantidad} persona/s, menú: ${datos.menu}).` : ".") +
        (datos.mensaje ? ` ${datos.mensaje}` : "");
      window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
    } else {
      await new Promise((ok) => setTimeout(ok, 800));      // modo demo
      console.info("RSVP (modo demo, no se envió):", datos);
    }

    guardar(GUARDADO, datos);
    mostrarEstado("");
    mostrarTicket(datos);
  } catch {
    mostrarEstado("No pudimos enviarlo. Probá de nuevo en un momento.", true);
  } finally {
    btn.disabled = false;
  }
});


/* ===== 10. ARRANQUE ===== */
rellenarTextos();
personalizar();
iniciarCronograma();
iniciarHero();
iniciarContador();
iniciarPetalos($("#petalos"));
iniciarCarrusel();
mostrarLugar("ceremonia");
iniciarRegalos();
prepararFormulario();
revisarReveal();

$("#btnCalendario").href = enlaceGoogleCalendar();
$("#btnIcs").addEventListener("click", descargarICS);

// Si este invitado ya respondió antes desde este dispositivo, mostramos su entrada
const previo = leer(GUARDADO);
if (previo && previo.nombre) mostrarTicket(previo);
