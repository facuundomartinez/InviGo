/* =====================================================================
   INVIGO · EDICIÓN PREMIUM · std.js
   Lógica del Save the Date (la web de expectativa).
   Los datos salen de config.js y las funciones de comun.js.
   ===================================================================== */

rellenarTextos();
iniciarContador();
iniciarPetalos($("#petalos"));

document.title = `Save the Date · ${CONFIG.novia} & ${CONFIG.novio}`;

// Agendar en el calendario
$("#btnCalendario").href = enlaceGoogleCalendar();
$("#btnIcs").addEventListener("click", descargarICS);

// Compartir: usa el menú nativo del celular; si no existe, copia el link
$("#btnCompartir").addEventListener("click", async () => {
  const datos = {
    title: `Save the Date · ${CONFIG.novia} & ${CONFIG.novio}`,
    text: `¡Guardá la fecha! ${formatoFechas().fechaLarga}`,
    url: location.href
  };
  try {
    if (navigator.share) return await navigator.share(datos);
    await navigator.clipboard.writeText(location.href);
    aviso("Link copiado ✓");
  } catch { /* el usuario canceló el menú de compartir */ }
});

// Cuando la invitación formal esté lista, se muestra este botón (ver config.js)
if (CONFIG.invitacionLista) {
  const b = $("#btnInvitacion");
  b.href = CONFIG.invitacionUrl;
  b.hidden = false;
}
