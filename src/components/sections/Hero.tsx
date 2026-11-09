import Image from "next/image";
import { copy, site } from "@/config/site";
import type { Photo as PhotoData } from "@/lib/photos";
import { HeroMedia } from "@/components/sections/HeroMedia";
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";

/**
 * Portada a pantalla completa: vídeo de fondo y titular, sin más acciones que las del navbar.
 * Escritorio: titular abajo a la izquierda; el logotipo vive en el navbar.
 * Móvil y tablet: logotipo, titular y texto centrados. La foto se ancla a la columna de texto:
 * crece con ella si la pantalla es muy baja.
 */
export function Hero({ photo }: { photo: PhotoData }) {
  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-forest">
      <Container className="relative lg:static">
        <div className="relative flex min-h-svh flex-col justify-center py-20 text-center text-ivory lg:static lg:justify-end lg:pb-16 lg:pt-32 lg:text-left">
          <div className="absolute -inset-x-5 inset-y-0 overflow-hidden bg-forest sm:-inset-x-8 lg:inset-0">
            <HeroMedia>
              <Photo photo={photo} sizes="(min-width: 1024px) 100vw, 180vw" preload placeholderTone="dark" className="h-full w-full" />
            </HeroMedia>
          </div>

          <div className="hero-logo mx-auto lg:hidden">
            <Image
              src={site.logo.src}
              alt={site.name}
              width={site.logo.width}
              height={site.logo.height}
              sizes="(min-width: 768px) 240px, 190px"
              className="h-auto w-full object-contain"
            />
          </div>
          <h1
            id="hero-title"
            aria-label={copy.hero.title}
            className="relative mx-auto mt-[clamp(1rem,3svh,1.75rem)] max-w-[19ch] font-serif text-[length:clamp(2.5rem,11.6vw,3.25rem)] font-normal leading-[0.95] tracking-[-0.02em] sm:text-7xl lg:mx-0 lg:mt-0 lg:text-[6vw] 2xl:text-[6.5rem]"
          >
            {copy.hero.titleLines.map((line, i) => (
              <span
                key={line}
                aria-hidden="true"
                className="hero-in block"
                style={{ "--hero-delay": `${150 + i * 120}ms` } as React.CSSProperties}
              >
                {line}
              </span>
            ))}
          </h1>
          <p
            className="hero-fade relative mx-auto mt-3 max-w-xl text-base leading-snug text-ivory sm:mt-8 sm:text-lg sm:leading-relaxed lg:mx-0"
            style={{ "--hero-delay": "480ms" } as React.CSSProperties}
          >
            <span className="sm:hidden">{copy.hero.subtitleShort}</span>
            <span className="hidden sm:inline">{copy.hero.subtitle}</span>
          </p>
        </div>
      </Container>
    </section>
  );
}
