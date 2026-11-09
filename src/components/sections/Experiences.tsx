"use client";

import { useEffect, useRef, useState } from "react";
import { copy } from "@/config/site";
import type { Photo as PhotoData } from "@/lib/photos";
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";

/** Encuadre de cada foto: debe funcionar tanto en la tarjeta ancha como en la estrecha. */
const FOCUS = ["62% 70%", "42% 62%", "74% 70%"];

/** Pausa entre tarjetas del carrusel móvil. */
const MOBILE_INTERVAL_MS = 5000;

/** Sin JavaScript no hay carrusel: tarjetas una debajo de otra, con todo su texto visible. */
const STATIC_CSS =
  ".exp-row{flex-direction:column;height:auto!important;margin-right:0!important}.exp-card{flex:none!important;height:70svh}.exp-card .story-word{transform:none!important}.exp-card .story-body,.exp-card .photo-scrim{opacity:1!important}";

/**
 * Título y flechas a la izquierda; a la derecha, tres tarjetas que se reparten el ancho: la activa se
 * expande con su texto encima y las demás quedan estrechas. Se abre con el cursor encima, o al pulsarla
 * con el teclado o el dedo; no avanza sola. Por debajo de `lg` no hay ancho para ese reparto: es un carrusel
 * que se desliza con el dedo, con todas las tarjetas abiertas (ver `.exp-row` en globals.css). Ese carrusel
 * avanza solo mientras está en pantalla: se pausa con el dedo encima y se detiene al deslizarlo.
 * Las fotos deben coincidir en orden con `copy.experiences.items`.
 */
export function Experiences({ photos }: { photos: [PhotoData, PhotoData, PhotoData] }) {
  const items = copy.experiences.items;
  const total = items.length;
  const [active, setActive] = useState(0);
  const row = useRef<HTMLUListElement>(null);

  const show = (next: number) => setActive((next + total) % total);

  useEffect(() => {
    const list = row.current;
    if (!list || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mobile = window.matchMedia("(max-width: 1023.98px)");
    let inView = false;
    let touchLeft: number | null = null;

    const observer = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting), { threshold: 0.4 });
    observer.observe(list);

    const timer = setInterval(() => {
      if (!mobile.matches || !inView || touchLeft !== null) return;
      const cards = [...list.children] as HTMLElement[];
      const start = cards[0].offsetLeft;
      const current = cards.findIndex((card) => card.offsetLeft - start >= list.scrollLeft - 1);
      const atEnd = list.scrollLeft >= list.scrollWidth - list.clientWidth - 1;
      const next = atEnd ? 0 : current + 1;
      list.scrollTo({ left: cards[next].offsetLeft - start, behavior: "smooth" });
    }, MOBILE_INTERVAL_MS);

    const onTouchStart = () => (touchLeft = list.scrollLeft);
    const onTouchEnd = () => {
      if (touchLeft !== null && Math.abs(list.scrollLeft - touchLeft) > 8) clearInterval(timer);
      touchLeft = null;
    };
    list.addEventListener("touchstart", onTouchStart, { passive: true });
    list.addEventListener("touchend", onTouchEnd, { passive: true });
    list.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      clearInterval(timer);
      observer.disconnect();
      list.removeEventListener("touchstart", onTouchStart);
      list.removeEventListener("touchend", onTouchEnd);
      list.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  return (
    <section id="experiencias" aria-labelledby="experiences-title" className="scroll-mt-16 overflow-x-clip bg-ivory py-16 sm:py-20 lg:flex lg:min-h-svh lg:scroll-mt-0 lg:items-center lg:pb-12 lg:pt-24">
      <noscript>
        <style>{STATIC_CSS}</style>
      </noscript>

      <Container className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-8">
        <Reveal variant="trigger" className="lg:col-span-4">
          <h2 id="experiences-title" className="rv-up font-serif text-[2.75rem] leading-[1] tracking-[-0.02em] text-forest sm:text-6xl lg:text-[4.2vw] 2xl:text-[4.5rem]">
            {copy.experiences.title}
          </h2>
          <p className="rv-up mt-5 max-w-sm text-[1.05rem] leading-relaxed text-charcoal" style={{ "--d": "120ms" } as React.CSSProperties}>
            {copy.experiences.body}
          </p>
          <div className="rv-up mt-10 hidden items-center gap-3 lg:flex" style={{ "--d": "220ms" } as React.CSSProperties}>
            <ArrowButton label="Experiencia anterior" onClick={() => show(active - 1)}>
              ←
            </ArrowButton>
            <ArrowButton label="Experiencia siguiente" onClick={() => show(active + 1)} solid>
              →
            </ArrowButton>
          </div>
        </Reveal>

        <Reveal variant="trigger" className="min-w-0 lg:col-span-8">
          <ul
            ref={row}
            className="exp-row -mr-5 flex h-[62svh] min-h-[22rem] gap-3 pr-5 sm:-mr-8 sm:pr-8 lg:-mr-[max(3rem,calc((100vw-88rem)/2+3rem))] lg:h-[min(74svh,46rem)] lg:pr-0"
          >
            {items.map((item, i) => {
              const isActive = i === active;
              return (
                <li
                  key={item.title}
                  data-active={isActive}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                  style={{ "--i": i } as React.CSSProperties}
                  className={`exp-card rv-gallery relative min-w-0 basis-0 overflow-hidden rounded-[28px] bg-sand ${isActive ? "grow-[3]" : "grow"}`}
                >
                  <figure className="absolute inset-0 m-0">
                    <div className="gallery-zoom absolute inset-0">
                      <Photo photo={{ ...photos[i], position: FOCUS[i] }} sizes="(min-width: 1024px) 60vw, 150vw" className="h-full w-full" />
                    </div>
                    <div aria-hidden="true" className="photo-scrim absolute inset-0" />
                    <figcaption className="absolute bottom-0 left-0 w-full p-5 text-ivory sm:p-7 lg:w-[30vw] lg:max-w-[30rem] lg:p-9">
                      <h3 className="font-serif text-[1.75rem] font-normal leading-[1.05] tracking-[-0.01em] sm:text-4xl lg:text-[2.75vw] 2xl:text-[2.75rem]">
                        {item.title.split(" ").map((word, w) => (
                          <span key={w}>
                            <span className="story-mask">
                              <span className="story-word" style={{ "--i": w } as React.CSSProperties}>
                                {word}
                              </span>
                            </span>{" "}
                          </span>
                        ))}
                      </h3>
                      <p className="story-body mt-2 text-[0.9375rem] leading-snug sm:text-base lg:mt-3 lg:leading-relaxed">{item.body}</p>
                    </figcaption>
                  </figure>
                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => show(i)}
                      aria-label={`Ver: ${item.title}`}
                      className="absolute inset-0 hidden cursor-pointer rounded-[28px] focus-visible:-outline-offset-4 lg:block"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}

function ArrowButton({ label, onClick, solid, children }: { label: string; onClick: () => void; solid?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border text-lg transition-[background-color,color,border-color,transform] duration-300 active:scale-95 ${
        solid ? "border-forest bg-forest text-ivory hover:bg-forest-deep" : "border-forest/25 text-forest hover:border-forest hover:bg-forest hover:text-ivory"
      }`}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
