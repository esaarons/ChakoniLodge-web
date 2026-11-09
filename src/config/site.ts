/**
 * Configuración específica del cliente.
 * Para un nuevo proyecto hotelero se reemplaza este archivo, `photos.ts`
 * y los tokens de color/tipografía en `app/globals.css` y `app/fonts.ts`.
 *
 * Regla del prototipo: solo información verificable (fotografías o confirmada por el cliente).
 * Nada de precios, distancias, contactos ni testimonios inventados.
 */

export const site = {
  name: "Chaikoni Lodge",
  wordmark: "CHAIKONI LODGE",
  /** Logotipo claro, sin márgenes transparentes: portada, navbar y footer van sobre fondos oscuros. */
  logo: {
    src: "/images/branding/chaikoni-logo-light-trim.png",
    width: 1041,
    height: 645,
  },
  locale: "es_PE",
  lang: "es",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
  description:
    "Chaikoni Lodge, un refugio natural en Pucallpa, Perú. Bungalows rodeados de jardines y vegetación tropical para descansar y desconectar.",

  nav: [
    { label: "El Lodge", href: "#lodge" },
    { label: "Habitaciones", href: "#habitaciones" },
    { label: "Experiencias", href: "#experiencias" },
    { label: "Galería", href: "#galeria" },
    { label: "Ubicación", href: "#ubicacion" },
  ],

  bookingAnchor: "#consulta",
  /** Límite del selector de huéspedes en la consulta. No es la capacidad real del alojamiento. */
  bookingMaxGuests: 20,

  location: {
    city: "Pucallpa",
    region: "Ucayali",
    country: "Perú",
    // Pendiente: dirección postal (calle y número) verificada con el establecimiento.
    exactAddress: null as string | null,
    mapQuery: "Pucallpa, Perú",
    /** Ubicación de la ficha de Google Maps facilitada por el cliente. */
    coordinates: { lat: -8.3353508, lng: -74.5988555 },
    /** Ficha pública de Google Maps (vista de reseñas), sin parámetros de seguimiento. */
    mapsUrl:
      "https://www.google.com/maps/place/Chaikoni+Lodge/@-8.3353508,-74.5988555,17z/data=!4m11!3m10!1s0x91a399d4f47a3167:0x11ef2442ed440cad!5m2!4m1!1i2!8m2!3d-8.3353508!4d-74.5988555!9m1!1b1!16s%2Fg%2F11vbts8ycc",
  },

  whatsapp: {
    // Formato internacional sin "+" (ej. 51XXXXXXXXX). Vacío = modo demostración.
    number: (process.env.NEXT_PUBLIC_HOTEL_WHATSAPP || "").replace(/\D/g, ""),
  },

  /** Atención al huésped. Confirmado por el cliente: atención 24 horas. */
  attention: {
    title: "Atención 24 horas",
    body: "Recepción y atención a cualquier hora, todos los días del año.",
  },

  /**
   * Reseñas de Google: requieren GOOGLE_MAPS_API_KEY y GOOGLE_PLACE_ID (variables solo de servidor).
   * Sin ambas no se hace ninguna solicitud a Google y se enlaza a `location.mapsUrl`.
   */


  legal: [
    { label: "Política de privacidad" },
    { label: "Términos y condiciones" },
    { label: "Libro de reclamaciones" },
  ],
} as const;

export const copy = {
  hero: {
    title: "Tu refugio natural en Pucallpa",
    /** Mismo titular partido en líneas para su entrada escalonada. */
    titleLines: ["Tu refugio natural", "en Pucallpa"],
    /** Versión breve para teléfonos. */
    subtitleShort: "Bungalows entre jardines y vegetación tropical.",
    subtitle:
      "Bungalows entre jardines y vegetación tropical para descansar, desconectar y disfrutar de la tranquilidad de la Amazonía.",
  },
  booking: {
    eyebrow: "Planifica tu estancia",
    steps: [
      { title: "¿Cuándo llegas?", body: "", label: "Fecha de llegada" },
      { title: "¿Cuándo te vas?", body: "", label: "Fecha de salida" },
      { title: "¿Cuántos huéspedes?", body: "Te responderemos por WhatsApp con habitaciones y tarifas.", label: "Huéspedes" },
    ],
    /** Resumen de la tarjeta en móvil. */
    summary: { arrival: "Llegada", departure: "Salida", empty: "Elegir" },
    next: "Continuar",
    back: "Volver",
    submit: "Enviar consulta",
    done: { title: "Tu consulta está lista", demoTitle: "Vista previa de tu consulta", edit: "Modificar" },
    note: "Es una consulta, no una reserva: la disponibilidad se confirma con el lodge.",
  },
  intro: {
    title: "Un lugar para bajar el ritmo",
    body: [
      "Cada bungalow es independiente.",
      "Aquí el día lo marcan la luz, el verde y el sonido del entorno.",
    ],
  },
  rooms: {
    title: "Habitaciones para descansar",
    body: "Bungalows privados en un eco lodge: interiores luminosos con techos altos, vigas de madera a la vista y textiles de diseño amazónico.",
    /** Datos de la ficha de Airbnb del lodge, aportados por el cliente. Confirmar antes de publicar. */
    highlightsTitle: "Al salir de tu bungalow",
    highlights: [
      {
        icon: "garden",
        title: "Un jardín con frutales",
        body: "Mango, papaya y carambola entre plantas amazónicas.",
      },
      {
        icon: "lagoon",
        title: "La laguna, a 8 minutos a pie",
        body: "San José de Yarinacocha, conocida por sus aves y delfines.",
      },
      {
        icon: "host",
        title: "Un trato cercano",
        body: "Los huéspedes destacan la calidez y la atención del anfitrión.",
      },
    ],
  },
  experiences: {
    title: "La naturaleza es parte de tu estadía",
    body: "Tres formas de pasar el día sin salir del lodge.",
    items: [
      {
        title: "Descansar entre jardines",
        body: "Césped y palmeras alrededor de cada bungalow. Un paisaje verde que acompaña todo el día.",
      },
      {
        title: "Disfrutar de la piscina",
        body: "Un lugar al aire libre para refrescarse bajo el sol amazónico, con tumbonas y sombrillas entre palmeras.",
      },
      {
        title: "Relajarse en las terrazas",
        body: "Rincones con sillones y sombra para leer, conversar o simplemente mirar el jardín.",
      },
    ],
  },
  gallery: {
    title: "Un recorrido por el lodge",
    body: "El lodge, tal como es.",
  },
  location: {
    title: "Te esperamos en Pucallpa",
    body: "Pucallpa, capital de la región Ucayali, es una de las puertas de entrada a la Amazonía peruana: ciudad de río, clima cálido y vegetación exuberante.",
    cta: "Cómo llegar",
  },
  footer: {
    tagline: "Un refugio natural en la Amazonía peruana.",
    prototypeNote:
      "Prototipo conceptual de diseño. Contenido sujeto a verificación por el establecimiento.",
  },
} as const;
