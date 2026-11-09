"use client";

import { useRef } from "react";
import { Bird, Heart, Trees, type LucideIcon } from "lucide-react";
import { copy } from "@/config/site";
import type { Photo as PhotoData } from "@/lib/photos";
import { useAutoCarousel } from "@/lib/useAutoCarousel";
import { Container } from "@/components/ui/Container";
import { CrossingTitle } from "@/components/ui/CrossingTitle";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";

const ICONS: Record<(typeof copy.rooms.highlights)[number]["icon"], LucideIcon> = {
  garden: Trees,
  lagoon: Bird,
  host: Heart,
};

/**
 * Sección oscura de habitaciones: carrusel con avance automático, el titular montado sobre el borde
 * de la foto, y a la derecha el entorno del bungalow.
 * Las fotos se funden una sobre otra (`.rooms-slide` en globals.css). El avance se detiene al usarlo.
 * Por debajo de `lg` todo va apilado: la descripción sube bajo el titular, antes de la foto.
 */
export function Rooms({ photos }: { photos: PhotoData[] }) {
  const total = photos.length;
  const { index, show, playing, ref: carousel, hoverProps } = useAutoCarousel<HTMLDivElement>(total);
  const touchX = useRef<number | null>(null);
  const current = photos[index];

  return (
    <section id="habitaciones" aria-labelledby="rooms-title" className="scroll-mt-16 overflow-hidden bg-forest py-16 text-ivory sm:py-20 lg:flex lg:min-h-svh lg:scroll-mt-0 lg:items-center lg:pb-12 lg:pt-24">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-8 lg:gap-y-0">
        <Reveal variant="trigger" className="lg:col-span-6">
          <div
            ref={carousel}
            className="relative"
            role="region"
            aria-roledescription="carrusel"
            aria-label="Fotografías de las habitaciones"
            {...hoverProps}
          >
            <CrossingTitle
              id="rooms-title"
              lines={["Habitaciones", "para descansar"]}
              className="mb-5 font-serif text-[2.75rem] leading-[0.95] tracking-[-0.02em] sm:text-6xl lg:absolute lg:left-[86%] lg:top-[5%] lg:mb-0 lg:text-[5.5vw] 2xl:text-[6rem]"
              outside="text-ivory"
              inside="text-forest"
              photoRevealDelay={0}
              linesDelay={260}
            />
            <p className="rv-up mb-8 max-w-md text-[1.05rem] leading-relaxed text-ivory/90 lg:hidden" style={{ "--d": "120ms" } as React.CSSProperties}>
              {copy.rooms.body}
            </p>
            <div
              className="rv-image-lg relative -mx-5 aspect-square touch-pan-y overflow-hidden bg-forest-deep sm:mx-0 sm:aspect-[4/3] lg:aspect-auto lg:h-[calc(100svh-16rem)] lg:max-h-[42rem]"
              onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchX.current;
                if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
                touchX.current = null;
              }}
            >
              {/* Capa propia: `.rv-image-lg > *` define su transición y anularía el fundido de las fotos. */}
              <div className="absolute inset-0 isolate">
                {photos.map((photo, i) => (
                  <div key={photo.id} aria-hidden={i !== index} data-active={i === index} className="rooms-slide absolute inset-0">
                    <Photo photo={photo} sizes="(min-width: 1024px) 68vw, 150vw" className="h-full w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rv-up mt-4 flex items-center gap-3" style={{ "--d": "420ms" } as React.CSSProperties}>
            <ArrowButton label="Foto anterior" onClick={() => show(index - 1)}>
              ←
            </ArrowButton>
            <ArrowButton label="Foto siguiente" onClick={() => show(index + 1)}>
              →
            </ArrowButton>
            <p className="min-w-0 flex-1 text-sm text-ivory/80 max-lg:order-first">
              <span className="tabular-nums text-ivory max-lg:block">
                {index + 1} de {total}
              </span>
              <span className="max-lg:hidden"> · </span>
              {current.caption}
            </p>
          </div>
          <p aria-live={playing ? "off" : "polite"} className="sr-only">
            Foto {index + 1} de {total}: {current.alt}
          </p>
        </Reveal>

        <Reveal variant="trigger" className="flex min-w-0 flex-col gap-9 lg:col-span-5 lg:col-start-8 lg:gap-10 lg:pt-[17vw] 2xl:pt-72">
          <p className="rv-up hidden max-w-md text-[1.05rem] leading-relaxed text-ivory/90 lg:block" style={{ "--d": "120ms" } as React.CSSProperties}>
            {copy.rooms.body}
          </p>

          <div className="border-t border-ivory/15 pt-8 lg:border-0 lg:pt-0">
            <h3 className="rv-up font-serif text-2xl" style={{ "--d": "200ms" } as React.CSSProperties}>
              {copy.rooms.highlightsTitle}
            </h3>
            <ul className="rv-stagger mt-5 space-y-5 [--stagger:90ms] sm:grid sm:grid-cols-3 sm:gap-6 sm:space-y-0 lg:block lg:space-y-5" style={{ "--d": "260ms" } as React.CSSProperties}>
              {copy.rooms.highlights.map((item) => {
                const Icon = ICONS[item.icon];
                return (
                  <li key={item.title} className="flex gap-3.5">
                    <Icon aria-hidden="true" size={24} strokeWidth={1.4} className="mt-0.5 shrink-0 text-ivory" />
                    <div>
                      <p className="text-[0.975rem] font-semibold leading-snug">{item.title}</p>
                      <p className="mt-0.5 text-[0.9375rem] leading-snug text-ivory/75">{item.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function ArrowButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-ivory/10 text-lg transition-[background-color,color,transform] duration-300 hover:bg-ivory hover:text-forest active:scale-95"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
