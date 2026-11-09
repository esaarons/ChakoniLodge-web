/**
 * Ranuras fotográficas del sitio.
 * Copiar las fotografías originales en `public/images/lodge/` con estos nombres
 * (se aceptan .jpg, .jpeg, .webp, .png o .avif). Si falta un archivo, la ranura
 * muestra un marcador neutro en lugar de una imagen genérica.
 *
 * `position` ajusta el encuadre (object-position) para evitar recortes agresivos.
 */

/** Filtros de la galería completa. */
export const GALLERY_TAGS = ["Bungalows", "Habitaciones", "Jardines", "Piscina"] as const;
export type GalleryTag = (typeof GALLERY_TAGS)[number];

/** Etiqueta de cada foto en singular, para el mosaico y el visor. */
export const TAG_LABEL: Record<GalleryTag, string> = {
  Bungalows: "Bungalow",
  Habitaciones: "Habitación",
  Jardines: "Jardines",
  Piscina: "Piscina",
};

export type PhotoSlot = {
  id: string;
  file: string;
  alt: string;
  caption: string;
  category: "Exterior" | "Habitaciones" | "Terrazas" | "Jardines" | "Piscina" | "Atardecer";
  /** Filtro de la galería. Asignado según lo que se ve en cada foto: revisar con el establecimiento. */
  tag: GalleryTag;
  /** Tamaño del archivo original, para ajustar la foto al visor sin recortarla. */
  width: number;
  height: number;
  position?: string;
};

export const photoSlots = [
  {
    id: "exterior",
    file: "01-exterior-bungalows",
    tag: "Bungalows",
    width: 2731,
    height: 1820,
    alt: "Bungalows de paredes blancas y techos metálicos rojizos con vigas de madera, frente a un amplio jardín de césped y vegetación tropical",
    caption: "Bungalows entre jardines",
    category: "Exterior",
    position: "62% 55%",
  },
  {
    id: "terrace",
    file: "02-bungalow-terraza",
    tag: "Bungalows",
    width: 4096,
    height: 2730,
    alt: "Terraza de madera de un bungalow con mecedora, mesa y sillas plegables bajo el alero, rodeada de plantas",
    caption: "Terraza del bungalow",
    category: "Terrazas",
    position: "55% 60%",
  },
  {
    id: "room-main",
    file: "03-habitacion-principal",
    tag: "Habitaciones",
    width: 4096,
    height: 2730,
    alt: "Habitación amplia y luminosa con cama doble, cama individual, escritorio y piso de madera bajo un techo alto con vigas",
    caption: "Habitación",
    category: "Habitaciones",
  },
  {
    id: "room-bed",
    file: "04-habitacion-cama",
    tag: "Habitaciones",
    width: 4096,
    height: 2730,
    alt: "Cama amplia con ropa de cama verde, camino de cama con diseño shipibo y cuadro bordado en la pared",
    caption: "Detalles con diseño amazónico",
    category: "Habitaciones",
  },
  {
    id: "room-light",
    file: "05-habitacion-luz",
    tag: "Habitaciones",
    width: 4096,
    height: 2730,
    alt: "Rincón de la habitación con sillón de madera junto a la ventana con cortinas de lino y escritorio con planta",
    caption: "Luz natural",
    category: "Habitaciones",
    position: "42% 55%",
  },
  {
    id: "garden",
    file: "06-jardines",
    tag: "Jardines",
    width: 4096,
    height: 2730,
    alt: "Bungalow blanco con terraza de madera enmarcado por árboles y vegetación tropical",
    caption: "Jardines",
    category: "Jardines",
    position: "50% 60%",
  },
  {
    id: "pool",
    file: "07-piscina",
    tag: "Piscina",
    width: 4096,
    height: 2730,
    alt: "Piscina exterior rodeada de deck de madera, tumbonas y sombrillas, con árboles tropicales al fondo",
    caption: "Piscina",
    category: "Piscina",
  },
  {
    id: "pool-lounge",
    file: "08-terraza-piscina",
    tag: "Piscina",
    width: 4096,
    height: 2730,
    alt: "Zona de descanso junto a la piscina con sillones bajo una sombrilla y muro con relieves geométricos",
    caption: "Rincón junto a la piscina",
    category: "Terrazas",
    position: "50% 65%",
  },
  {
    id: "pool-garden",
    file: "09-piscina-jardin",
    tag: "Piscina",
    width: 4096,
    height: 2730,
    alt: "Piscina entre jardines y palmeras, con sombrillas, mesas y una construcción de madera al fondo",
    caption: "Piscina y jardín",
    category: "Piscina",
  },
  {
    id: "dusk",
    file: "10-terraza-atardecer",
    tag: "Bungalows",
    width: 590,
    height: 393,
    alt: "Terraza de un bungalow al caer la tarde, con faroles encendidos y mecedora de madera",
    caption: "Al caer la tarde",
    category: "Atardecer",
  },
  {
    id: "room-wide",
    file: "11-habitacion-amplia",
    tag: "Habitaciones",
    width: 4096,
    height: 2730,
    alt: "Vista amplia de la habitación con cama, armario de madera, escritorio y baño",
    caption: "Espacios amplios",
    category: "Habitaciones",
  },
  {
    id: "room-detail",
    file: "12-habitacion-detalle",
    tag: "Habitaciones",
    width: 4096,
    height: 2730,
    alt: "Cama con cabecero tapizado, cojín bordado y mesa de noche junto a un armario de madera",
    caption: "Descanso",
    category: "Habitaciones",
  },
] as const satisfies readonly PhotoSlot[];

export type PhotoId = (typeof photoSlots)[number]["id"];

/** Orden de la galería, pensado para el mosaico de 12 piezas de `Gallery.tsx`. */
export const galleryOrder: PhotoId[] = [
  "pool",
  "room-main",
  "room-light",
  "garden",
  "room-bed",
  "pool-garden",
  "terrace",
  "exterior",
  "pool-lounge",
  "dusk",
  "room-wide",
  "room-detail",
];
