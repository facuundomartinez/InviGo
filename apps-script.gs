/**
 * INVIGO · EDICIÓN PREMIUM · RSVP AUTOMATIZADO
 * ---------------------------------------------------------------
 * Qué hace cada vez que un invitado confirma:
 *   1. Guarda la respuesta en una hoja de Google Sheets
 *   2. Le envía un mail de confirmación al invitado
 *   3. Le avisa por mail a los novios
 *
 * CÓMO INSTALARLO (una sola vez, ~5 minutos)
 *   1. Creá una hoja de cálculo nueva en Google Sheets.
 *   2. Menú Extensiones > Apps Script. Borrá lo que haya y pegá este archivo.
 *   3. Completá EMAIL_NOVIOS abajo.
 *   4. Botón "Implementar" > "Nueva implementación" > tipo "Aplicación web".
 *        - Ejecutar como: Yo
 *        - Quién tiene acceso: Cualquier persona
 *   5. Autorizá los permisos (Sheets y envío de mails) cuando Google lo pida.
 *   6. Copiá la URL que termina en /exec y pegala en config.js > rsvpUrl.
 *
 * Si después cambiás este código, tenés que crear una "Nueva versión" en
 * Implementar > Administrar implementaciones para que se apliquen los cambios.
 */

const EMAIL_NOVIOS = "novios@ejemplo.com";   // <-- cambiá este mail
const NOMBRE_HOJA = "RSVP";
const REMITENTE = "InviGo";                   // nombre que ve el invitado en el mail

// Evita que el contenido enviado por un invitado rompa el HTML del mail
function esc(t) {
  return String(t || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function doPost(e) {
  // El "lock" evita que dos respuestas simultáneas pisen la misma fila
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const p = e.parameter;
    const viene = String(p.asistencia || "").indexOf("Sí") === 0;

    // 1) Guardar en la hoja
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hoja = ss.getSheetByName(NOMBRE_HOJA) || ss.insertSheet(NOMBRE_HOJA);
    if (hoja.getLastRow() === 0) {
      hoja.appendRow(["Fecha", "Nombre", "Email", "Asistencia", "Personas", "Menú", "Mensaje", "Invitado (link)"]);
      hoja.setFrozenRows(1);
    }
    hoja.appendRow([new Date(), p.nombre, p.email, p.asistencia, p.cantidad, p.menu, p.mensaje, p.invitado || ""]);

    // 2) Mail de confirmación al invitado
    if (p.email) {
      const asunto = viene ? "¡Tu asistencia está confirmada!" : "Recibimos tu respuesta";
      const detalle = viene
        ? "<p>Confirmaste <b>" + esc(p.cantidad) + "</b> persona/s.</p>" +
          "<p>" + esc(p.fechaEvento) + "<br>" + esc(p.lugar) + "</p>"
        : "<p>Lamentamos que no puedas acompañarnos. ¡Te vamos a extrañar!</p>";

      MailApp.sendEmail({
        to: p.email,
        name: REMITENTE,
        subject: asunto + " · " + (p.evento || ""),
        htmlBody:
          '<div style="font-family:Georgia,serif;max-width:480px;margin:auto;padding:28px;border:1px solid #b8975a;text-align:center;color:#241a1c">' +
          '<h2 style="font-weight:400;margin:0 0 12px">Hola ' + esc(p.nombre) + "</h2>" +
          detalle +
          '<p style="color:#75685f;font-size:13px;margin-top:20px">' + esc(p.evento) + "</p></div>"
      });
    }

    // 3) Aviso a los novios
    MailApp.sendEmail({
      to: EMAIL_NOVIOS,
      name: REMITENTE,
      subject: (viene ? "✔ Confirmó: " : "✖ No asiste: ") + p.nombre,
      htmlBody:
        "<p><b>" + esc(p.nombre) + "</b> (" + esc(p.email) + ")</p>" +
        "<p>" + esc(p.asistencia) + " · Personas: " + esc(p.cantidad) + " · Menú: " + esc(p.menu) + "</p>" +
        (p.mensaje ? "<p><i>“" + esc(p.mensaje) + "”</i></p>" : "")
    });

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Sirve para probar rápido que la URL está bien publicada (abrila en el navegador)
function doGet() {
  return ContentService.createTextOutput("InviGo RSVP funcionando ✔");
}
