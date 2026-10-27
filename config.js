/* =====================================================================
   INVIGO · EDICIÓN PREMIUM · config.js
   ---------------------------------------------------------------------
   TODO lo que cambia entre un cliente y otro está acá.
   Los demás archivos (script.js, std.js, comun.js) no hace falta tocarlos.

   Links personalizados por invitado (RSVP automatizado):
     index.html?i=Familia%20Pérez&p=3
       i = nombre que aparece en el sobre y en el saludo
       p = cantidad máxima de personas que puede confirmar
   ===================================================================== */
const CONFIG = {

  /* ---------- Pareja y fecha ---------- */
  novia: "Sofía",
  novio: "Matías",

  // Fecha y hora de la CEREMONIA, con huso horario de Argentina (-03:00)
  fechaISO: "2027-03-20T17:00:00-03:00",
  duracionHoras: 11,                 // duración del evento en el calendario
  zonaHoraria: "America/Argentina/Buenos_Aires",
  ciudad: "Mendoza, Argentina",
  rsvpLimite: "20 de febrero",

  /* ---------- Save the Date (web de expectativa) ---------- */
  textoSaveTheDate:
    "Reservá esta fecha en tu agenda. Muy pronto vas a recibir la invitación formal con todos los detalles.",
  invitacionUrl: "index.html",       // a dónde lleva el botón "Ver invitación"
  invitacionLista: false,            // poné true cuando quieras mostrar ese botón

  /* ---------- Música ---------- */
  musica: {
    src: "assets/photograph.mp3",
  titulo: "Photograph",
  artista: "Ed Sheeran",
  volumen: 0.55
  },

  /* ---------- Fotos ---------- */
  // Foto de fondo del inicio. Reemplazá por tu .jpg (recomendado 1600 px de ancho)
  fotoHero: "assets/fotos/pareja3.jpg",

  // Carrusel: agregá o quitá fotos libremente
  fotos: [
    { src: "assets/fotos/pareja1.jpg", alt: "Sofía y Matías", pie: "El comienzo de todo" },
    { src: "assets/fotos/pareja2.jpg", alt: "Primer viaje juntos", pie: "Nuestro primer viaje" },
    { src: "assets/fotos/pareja3.jpg", alt: "Una tarde de otoño", pie: "Tardes de otoño" },
    { src: "assets/fotos/pareja4.jpg", alt: "La propuesta", pie: "El día que dijo que sí" },
    { src: "assets/fotos/pareja5.jpg", alt: "Con la familia", pie: "Con quienes más queremos" },
    { src: "assets/fotos/pareja6.jpg", alt: "Hoy", pie: "Y ahora, lo mejor está por venir" }
  ],

  /* ---------- Banda de foto con frase ---------- */
  fotoBanda: "assets/fotos/pareja3.jpg",
  frase: "Elegimos caminar juntos, y hoy queremos que seas parte de nuestro primer paso.",

  /* ---------- Cronograma del gran día ---------- */
  cronograma: [
    { hora: "16:30", titulo: "Recepción",        texto: "Llegada de los invitados y bienvenida." },
    { hora: "17:00", titulo: "Ceremonia",        texto: "El momento en que decimos que sí." },
    { hora: "18:15", titulo: "Brindis y fotos",  texto: "Un primer brindis y fotos con todos." },
    { hora: "20:00", titulo: "Cena",             texto: "Una cena para compartir en mesa larga." },
    { hora: "22:30", titulo: "Vals y apertura de pista", texto: "Nuestro primer baile como esposos." },
    { hora: "23:00", titulo: "¡A bailar!",       texto: "Música, barra libre y mucha alegría." },
    { hora: "03:30", titulo: "Cierre",           texto: "Hasta la próxima celebración." }
  ],

  /* ---------- Lugares ---------- */
  // coords (latitud,longitud) hace el mapa satelital más exacto. Opcional.
  lugares: {
    ceremonia: {
      hora: "17:00 hs",
      nombre: "Parroquia Nuestra Señora del Carmen",
      direccion: "Paso de los Andes 1998, Godoy Cruz, Mendoza",
      coords: ""
    },
    fiesta: {
      hora: "20:00 hs",
      nombre: "Quinta los Alamos",
      direccion: "Urquiza 197, Coquimbito, Mendoza",
      coords: ""
    }
  },

  /* ---------- Sección exclusiva de regalos ---------- */
  regalos: {
    // Código que figura en la invitación. Dejalo "" para que no pida código.
    codigo: "SOFIAYMATI",
    ayuda: "Demo: el código es SOFIAYMATI",   // texto de ayuda (borralo en la versión final)

    transferencia: {
      titular: "Sofía González",
      banco: "Banco Ejemplo",
      alias: "sofia.matias.boda",
      cbu: "0000000000000000000000"
    },

    // Otras opciones (aparecen como tarjetas). link vacío = sin botón.
    opciones: [
      {
        titulo: "Nuestra luna de miel",
        texto: "Ayudanos a vivir el viaje de nuestros sueños.",
        boton: "Aportar",
        link: ""
      },
      {
        titulo: "Lista de regalos",
        texto: "Algunas ideas para el hogar que estamos armando.",
        boton: "Ver lista",
        link: ""
      }
    ]
  },

  /* ---------- RSVP automatizado ----------
     rsvpUrl: URL de tu Google Apps Script (ver apps-script.gs).
       Guarda cada respuesta en Google Sheets y envía el mail de
       confirmación al invitado y el aviso a los novios.
     Si rsvpUrl está vacío y hay whatsapp, abre un mensaje armado.
     Si ambos están vacíos funciona en "modo demo" (no envía nada). */
  rsvpUrl: "",
  whatsapp: "",                      // formato internacional sin "+", ej: "5492610000000"
  maxPersonasPorDefecto: 10
};
