# Chaikoni Lodge — prototipo One Page

Prototipo conceptual de sitio web para Chaikoni Lodge (Pucallpa, Perú).
Next.js (App Router) · TypeScript · Tailwind CSS v4.

> Prototipo sin autorización comercial del establecimiento: el sitio no se indexa
> (`noindex`) y el contenido evita precios, servicios, contactos o datos no verificados.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # opcional
npm run dev                  # http://localhost:3000
npm run build && npm start   # producción
```

## Fotografías

Copiar las fotografías originales en `public/images/lodge/` con estos nombres
(extensión `.jpg`, `.jpeg`, `.webp`, `.png` o `.avif`):

| Archivo | Uso | Original |
| --- | --- | --- |
| `01-exterior-bungalows` | Hero, galería, imagen Open Graph | `src/img/4.jpg` |
| `02-bungalow-terraza` | Introducción, galería | `src/img/1.8.jpg` |
| `03-habitacion-principal` | Habitaciones 02, galería | `src/img/1.6.jpg` |
| `04-habitacion-cama` | Habitaciones 01 (principal), galería | `src/img/1.3.jpg` |
| `05-habitacion-luz` | Habitaciones 03, galería | `src/img/1.7.jpg` |
| `06-jardines` | Experiencia 01, galería | `src/img/1.1.jpg` |
| `07-piscina` | Experiencia 02, galería | `src/img/2.2.jpg` |
| `08-terraza-piscina` | Experiencia 03, galería | `src/img/2.3.jpg` |
| `09-piscina-jardin` | Galería | `src/img/2.jpg` |
| `10-terraza-atardecer` | Galería (590 px: reemplazar por una versión en alta resolución) | `src/img/3.jpg` |
| `11-habitacion-amplia` | Galería | `src/img/1.5.jpg` |
| `12-habitacion-detalle` | Galería | `src/img/1.2.jpg` |

Mientras falte un archivo se muestra un marcador neutro. Tras añadir fotos, volver a
ejecutar `npm run build` (en `npm run dev` basta con recargar). Textos alternativos,
pies de foto y encuadre (`position`) se ajustan en `src/config/photos.ts`.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_HOTEL_WHATSAPP` | Número oficial en formato internacional sin `+` (ej. `51XXXXXXXXX`). Vacío = modo demostración: el formulario muestra la vista previa del mensaje sin abrir WhatsApp. |
| `NEXT_PUBLIC_SITE_URL` | URL pública, usada en Open Graph y sitemap. |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `true` solo cuando el cliente autorice la publicación. |
| `GOOGLE_MAPS_API_KEY` | Solo servidor. Key de Google Maps Platform restringida a **Places API (New)**. Sin ella, la sección de ubicación muestra un enlace a Google Maps en lugar de reseñas. |
| `GOOGLE_PLACE_ID` | Solo servidor. Place ID **verificado** del lodge (`ChIJ…`). Obligatorio junto con la key: si falta cualquiera de los dos, no se contacta a Google y se muestra el enlace a la ficha. |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` | Opcional y pública. Key **distinta** de la anterior, restringida a Maps Embed API y al dominio. El mapa solo se carga cuando el visitante pulsa «Cargar mapa interactivo». |

## Estructura

```
src/
  config/site.ts      Marca, textos, navegación, ubicación, WhatsApp (específico del cliente)
  config/photos.ts    Ranuras fotográficas y orden de la galería
  app/globals.css     Tokens de color y tipografía (@theme)
  app/fonts.ts        Fuentes (Cormorant Garamond + Manrope vía next/font)
  lib/                Detección de fotos en disco, construcción del mensaje de WhatsApp
  components/ui/      Piezas reutilizables: Button, Photo, Reveal (sistema de aparición), Parallax, Lightbox…
  components/layout/  Header, Footer
  components/sections/ Hero (+ BookingBox flotante), Intro, Rooms, Experiences, Gallery, Location (+ GoogleReviews)
```

Para un nuevo hotel: reemplazar `config/`, los tokens de `globals.css`, `fonts.ts` y las
fotografías. Los componentes no contienen textos ni colores propios del cliente.

## Pendiente antes de producción

- Fotografías originales y autorización de uso.
- Número oficial de WhatsApp.
- Métodos de pago reales (`site.payments` en `src/config/site.ts`; la lista actual es provisional).
- Dirección exacta (`site.location.exactAddress`) verificada.
- Páginas legales: política de privacidad, términos, libro de reclamaciones.
- Revisar los textos con el establecimiento.
- Reseñas de Google: configurar `GOOGLE_MAPS_API_KEY` y `GOOGLE_PLACE_ID` (con cuotas y alertas de presupuesto en Google Cloud). El logotipo oficial de Google Maps ya está en `public/brand/`; revisar los
  [requisitos de atribución](https://developers.google.com/maps/documentation/places/web-service/policies) y revisar el coste
  de la SKU de Place Details con reseñas. Las reseñas no se guardan ni se cachean (política de Google): se piden a
  `/api/google-reviews` solo cuando el visitante se acerca a la sección de ubicación.
