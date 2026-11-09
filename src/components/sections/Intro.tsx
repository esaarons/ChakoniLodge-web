import { copy } from "@/config/site";
import type { Photo as PhotoData } from "@/lib/photos";
import { Container } from "@/components/ui/Container";
import { CrossingTitle } from "@/components/ui/CrossingTitle";
import { Parallax } from "@/components/ui/Parallax";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";

type IntroProps = { photos: { left: PhotoData; center: PhotoData; right: PhotoData } };

/** Secuencia de entrada (ms): fotos izquierda → centro → derecha, titular, textos. */
const T = { left: 0, center: 140, right: 280, title: 420, text: 620 };

/**
 * Tríptico de una pantalla de alto en escritorio: la foto central a casi toda la altura con el
 * titular cruzándola, y a los lados una foto pequeña con un párrafo cada una.
 * En móvil: titular, foto central a sangre por la derecha y texto.
 */
export function Intro({ photos }: IntroProps) {
  const [first, second] = copy.intro.body;

  return (
    <section
      id="lodge"
      aria-labelledby="intro-title"
      className="scroll-mt-16 overflow-hidden bg-ivory py-16 sm:py-20 lg:flex lg:min-h-svh lg:scroll-mt-0 lg:items-center lg:pb-12 lg:pt-24"
    >
      <Reveal variant="trigger" className="w-full">
        <Container className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="hidden lg:col-span-3 lg:block lg:self-start">
            <SidePhoto photo={photos.left} speed={0.08} height="lg:h-[32svh]" delay={T.left} />
            <p className="rv-up mt-6 text-base leading-relaxed text-charcoal" style={delay(T.text)}>
              {first}
            </p>
          </div>

          <div className="lg:col-span-4 lg:col-start-5">
            <div className="relative">
              <CrossingTitle
                id="intro-title"
                lines={["Un lugar para", "bajar el ritmo"]}
                className="mb-8 font-serif text-[2.75rem] leading-[0.95] tracking-[-0.02em] sm:text-6xl lg:absolute lg:left-1/2 lg:top-[36%] lg:mb-0 lg:-translate-x-1/2 lg:text-center lg:text-[6.5vw] 2xl:text-[7rem]"
                outside="text-forest"
                inside="text-ivory"
                photoRevealDelay={T.center}
                linesDelay={T.title}
              />
              <div
                className="rv-image-lg relative -mr-5 aspect-[5/6] overflow-hidden bg-sand sm:-mr-8 sm:aspect-[4/3] lg:mr-0 lg:aspect-auto lg:h-[calc(100svh-12rem)] lg:max-h-[44rem]"
                style={delay(T.center)}
              >
                <Parallax speed={0.12}>
                  <Photo photo={photos.center} sizes="(min-width: 1024px) 92vw, 170vw" className="h-full w-full" />
                </Parallax>
                <div aria-hidden="true" className="absolute inset-0 hidden bg-forest-deep/35 lg:block" />
              </div>
            </div>

            {/* Texto bajo la foto solo en móvil y tablet; en escritorio va junto a las fotos laterales. */}
            <div className="rv-up mt-6 space-y-4 text-base leading-relaxed text-charcoal lg:hidden" style={delay(200)}>
              <p>{first}</p>
              <p>{second}</p>
            </div>
          </div>

          <div className="hidden lg:col-span-3 lg:col-start-10 lg:block lg:self-end">
            <SidePhoto photo={photos.right} speed={0.16} height="lg:h-[28svh]" delay={T.right} />
            <p className="rv-up mt-6 text-base leading-relaxed text-charcoal" style={delay(T.text + 100)}>
              {second}
            </p>
          </div>
        </Container>
      </Reveal>
    </section>
  );
}

function delay(ms: number) {
  return { "--d": `${ms}ms` } as React.CSSProperties;
}

function SidePhoto({ photo, speed, height, delay: ms }: { photo: PhotoData; speed: number; height: string; delay: number }) {
  return (
    <figure>
      <div className={`rv-image relative overflow-hidden bg-sand ${height}`} style={delay(ms)}>
        <Parallax speed={speed}>
          <Photo photo={photo} sizes="40vw" className="h-full w-full" />
        </Parallax>
      </div>
      <figcaption className="rv-up mt-3 text-sm text-olive-deep" style={delay(ms + 300)}>
        {photo.caption}
      </figcaption>
    </figure>
  );
}
