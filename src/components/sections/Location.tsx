import { copy, site } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const { lat, lng } = site.location.coordinates;
const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
/**
 * Mapa interactivo de Google. Sin key, el embed por coordenadas: solo el marcador, sin la ficha de Google
 * con sus propios botones. Con NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY
 * (key distinta de la de Places, restringida a Maps Embed API y al dominio) usa la Maps Embed API
 * oficial, apuntando al place_id si GOOGLE_PLACE_ID existe (ese modo sí muestra la ficha).
 * El place_id no es un secreto: Google permite guardarlo y mostrarlo.
 */
function embedUrl() {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  if (!key) return `https://maps.google.com/maps?q=${lat},${lng}&z=16&hl=es&output=embed`;
  const placeId = process.env.GOOGLE_PLACE_ID;
  const q = placeId ? `place_id:${placeId}` : `${lat},${lng}`;
  return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${encodeURIComponent(q)}&zoom=16&language=es`;
}

/**
 * Cierre de la página: un degradado claro (`.location-bg`) continúa el fondo de la galería y baja hacia
 * el oliva, para que el footer verde se lea como un bloque aparte. El mapa y «Cómo llegar» forman una sola
 * tarjeta; el mapa se carga solo al acercarse a la sección, sin retrasar la portada.
 */
export function Location() {
  return (
    <section id="ubicacion" aria-labelledby="location-title" className="location-bg scroll-mt-16 lg:scroll-mt-0">
      <Container className="grid py-16 sm:py-20 lg:grid-cols-12 lg:items-center lg:gap-x-8 lg:py-28">
        <Reveal variant="trigger" className="lg:col-span-6">
          <h2 id="location-title" className="rv-up max-w-[12ch] font-serif text-[2.75rem] leading-[1] tracking-[-0.02em] text-forest sm:text-6xl lg:text-[5vw] 2xl:text-[5.5rem]">
            {copy.location.title}
          </h2>
          <p className="rv-up mt-6 max-w-md text-[1.05rem] leading-relaxed text-charcoal" style={delay(120)}>
            {copy.location.body}
          </p>
          <div className="rv-up mt-10 max-w-md" style={delay(220)}>
            <p className="text-sm font-semibold text-forest">{site.attention.title}</p>
            <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-charcoal">{site.attention.body}</p>
          </div>
        </Reveal>

        <Reveal variant="trigger" className="mt-10 min-w-0 lg:col-span-5 lg:col-start-8 lg:mt-0">
          <div className="rv-image w-full overflow-hidden rounded-[28px] bg-forest-deep text-ivory" style={delay(160)}>
            <div>
              <div className="relative aspect-[4/3]">
                <iframe
                  src={embedUrl()}
                  title={`Mapa interactivo: ubicación de ${site.name} en ${site.location.city}`}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 p-5 sm:px-6">
                <div>
                  <p className="font-serif text-2xl leading-tight">{site.name}</p>
                  <p className="mt-0.5 text-[0.9375rem] text-ivory/80">
                    {site.location.city}, {site.location.region}
                  </p>
                </div>
                <ButtonLink href={directionsUrl} target="_blank" rel="noopener noreferrer" variant="light">
                  {copy.location.cta}
                  <span className="sr-only"> (abre Google Maps en una pestaña nueva)</span>
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function delay(ms: number) {
  return { "--d": `${ms}ms` } as React.CSSProperties;
}
