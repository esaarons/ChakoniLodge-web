"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import type { ReviewsPayload, ReviewView } from "@/lib/googleReviews";
import { Reveal } from "@/components/ui/Reveal";

type State = { status: "idle" } | ReviewsPayload;

/** Ficha pública del lodge en Google Maps (vista de reseñas), para el estado sin API o con error. */
const PROFILE_URL = site.location.mapsUrl;
/** A partir de esta longitud se ofrece "Leer completa" (el texto se recorta a cinco líneas). */
const LONG_REVIEW = 260;

/**
 * Reseñas reales de Google bajo el mapa.
 * - `enabled` lo decide el servidor (API key y Place ID configurados). Si es false, no se hace
 *   ninguna solicitud y se muestra el enlace a la ficha.
 * - Si está activo, se piden al servidor solo cuando la sección se acerca a la pantalla; la política
 *   de Google no permite guardarlas, así que no se precargan.
 * - Atribución según la política de Places API: logotipo de Google Maps en el contenedor, autor
 *   (foto, nombre y enlace) junto a cada reseña, enlace a la reseña en Google Maps, aviso de orden.
 */
export function GoogleReviews({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>(enabled ? { status: "idle" } : { status: "unconfigured" });

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let cancelled = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        fetch("/api/google-reviews")
          .then((r) => r.json() as Promise<ReviewsPayload>)
          .catch((): ReviewsPayload => ({ status: "error" }))
          .then((data) => !cancelled && setState(data));
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [enabled]);

  return (
    <div ref={ref} aria-labelledby="reviews-title" role="region">
      {state.status === "idle" && <Placeholder />}
      {(state.status === "unconfigured" || state.status === "error") && <Fallback />}
      {state.status === "ok" && (state.reviews.length ? <ReviewList data={state} /> : <Fallback />)}
    </div>
  );
}

function Heading({ children, tone = "text-forest" }: { children?: React.ReactNode; tone?: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <h3 id="reviews-title" className={`font-serif text-[1.75rem] leading-tight ${tone}`}>
        Opiniones de huéspedes
      </h3>
      {children}
    </div>
  );
}

function Placeholder() {
  return (
    <div aria-busy="true">
      <Heading tone="text-ivory" />
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-48 rounded-3xl bg-paper" />
        ))}
      </div>
    </div>
  );
}

function Fallback() {
  return (
    <Heading tone="text-ivory">
      <ExternalLink href={PROFILE_URL} tone="border-ivory/40 text-ivory hover:bg-ivory hover:text-forest">
        Ver opiniones en Google Maps
      </ExternalLink>
    </Heading>
  );
}

function ReviewList({ data }: { data: Extract<ReviewsPayload, { status: "ok" }> }) {
  return (
    <Reveal variant="trigger">
      {/* Contenedor visual de las reseñas: la atribución de Google Maps va dentro, arriba. */}
      <div className="rounded-[2rem] bg-paper p-4 sm:p-6">
        <Heading>
          <div className="rv-up flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-charcoal">
            {data.rating !== null && (
              <p className="flex items-center gap-3">
                <span className="font-serif text-3xl leading-none text-forest">
                  {data.rating.toLocaleString("es-PE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </span>
                <Stars value={data.rating} />
                {data.total !== null && (
                  <span>
                    {data.total.toLocaleString("es-PE")} {data.total === 1 ? "opinión" : "opiniones"}
                  </span>
                )}
              </p>
            )}
            <GoogleMapsLogo />
          </div>
        </Heading>

        {/* Aviso de orden y filtrado exigido por la política de Places API. */}
        <p className="rv-up mt-3 max-w-3xl text-sm text-olive-deep" style={{ "--d": "120ms" } as React.CSSProperties}>
          Hasta tres opiniones con texto, de las que Google selecciona por relevancia, ordenadas de la más reciente a la
          más antigua. No es la lista completa.
        </p>

        {/* Escritorio: franja de tres columnas. Móvil: fila con desplazamiento horizontal y snap. */}
        <ul className="rv-stagger relative -mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:thin] sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
          {data.reviews.map((review) => (
            <ReviewCard key={review.reviewUri} review={review} />
          ))}
        </ul>

        <div className="mt-5 flex flex-col gap-3 text-sm text-olive-deep sm:flex-row sm:items-center sm:justify-between">
          {data.attributions.length > 0 ? (
            <p>
              Datos de terceros:{" "}
              {data.attributions.map((a, i) => (
                <span key={a.provider}>
                  {i > 0 && " · "}
                  {a.uri ? (
                    <a href={a.uri} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                      {a.provider}
                    </a>
                  ) : (
                    a.provider
                  )}
                </span>
              ))}
            </p>
          ) : (
            <span />
          )}
          <ExternalLink href={data.mapsUri ?? PROFILE_URL}>Ver todas en Google Maps</ExternalLink>
        </div>
      </div>
    </Reveal>
  );
}

function ReviewCard({ review }: { review: ReviewView }) {
  const [expanded, setExpanded] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const body = showOriginal && review.originalText ? review.originalText : review.text;
  const long = body.length > LONG_REVIEW;

  return (
    // relative: los textos sr-only (position absolute) quedan dentro de la fila con scroll; sin esto
    // escapan de su recorte y ensanchan la página en móvil.
    <li className="relative flex w-[84%] shrink-0 snap-start flex-col rounded-3xl bg-ivory p-6 sm:w-[60%] md:w-auto">
      {/* Atribución del autor: foto, nombre y enlace a su perfil, junto a su reseña. */}
      <div className="flex items-center gap-3">
        {review.authorPhotoUri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.authorPhotoUri}
            alt=""
            width={36}
            height={36}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-9 w-9 shrink-0 rounded-full bg-sand object-cover"
          />
        ) : (
          <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand font-serif text-lg text-forest">
            {review.author.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 text-sm leading-tight">
          {review.authorUri ? (
            <a href={review.authorUri} target="_blank" rel="noopener noreferrer" className="block truncate font-semibold text-forest underline-offset-4 hover:underline">
              {review.author}
              <span className="sr-only"> (perfil en Google Maps, abre en una pestaña nueva)</span>
            </a>
          ) : (
            <span className="block truncate font-semibold text-forest">{review.author}</span>
          )}
          {review.relativeTime && <span className="text-olive-deep">{review.relativeTime}</span>}
        </div>
      </div>

      <div className="mt-4">
        <Stars value={review.rating} />
      </div>
      <p
        className={`mt-3 whitespace-pre-line text-[0.95rem] leading-relaxed text-charcoal ${expanded ? "" : "line-clamp-5"}`}
      >
        {body}
      </p>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {long && (
          <button type="button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} className="font-semibold text-forest underline underline-offset-4">
            {expanded ? "Mostrar menos" : "Leer completa"}
          </button>
        )}
        {review.originalText && (
          <span className="text-olive-deep">
            Traducida por Google ·{" "}
            <button type="button" onClick={() => setShowOriginal((v) => !v)} aria-pressed={showOriginal} className="underline underline-offset-4 hover:text-forest">
              {showOriginal ? "Ver traducción" : "Ver original"}
            </button>
          </span>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-5 text-sm text-olive-deep">
        <a href={review.reviewUri} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-forest">
          Ver en Google Maps<span className="sr-only"> (abre en una pestaña nueva)</span>
        </a>
        {review.flagUri && (
          <a href={review.flagUri} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-forest">
            Reportar<span className="sr-only"> esta reseña a Google (abre en una pestaña nueva)</span>
          </a>
        )}
      </div>
    </li>
  );
}

/**
 * Logotipo oficial de Google Maps (paquete de atribución de Google, sin modificar).
 * Versión sin contorno sobre fondo liso; 18 px de alto (rango permitido 16–19) y
 * espacio libre de 10 px a los lados y arriba, 5 px abajo.
 */
function GoogleMapsLogo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/google-maps-logo-gray.svg"
      alt="Google Maps"
      width={98}
      height={18}
      translate="no"
      className="mx-[10px] mb-[5px] mt-[10px] h-[18px] w-auto"
    />
  );
}

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${value.toLocaleString("es-PE")} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} aria-hidden="true" viewBox="0 0 20 20" className={`h-3.5 w-3.5 ${n <= rounded ? "text-forest" : "text-forest/20"}`} fill="currentColor">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L10 14.9l-5.25 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}

function ExternalLink({
  href,
  children,
  tone = "border-forest/25 text-forest hover:bg-forest hover:text-ivory",
}: {
  href: string;
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-full border px-5 text-sm font-semibold transition-colors sm:self-auto ${tone}`}
    >
      {children}
      <span aria-hidden="true">↗</span>
      <span className="sr-only"> (abre en una pestaña nueva)</span>
    </a>
  );
}
