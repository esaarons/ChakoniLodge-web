"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig } from "motion/react";
import { copy } from "@/config/site";
import type { Photo as PhotoData } from "@/lib/photos";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { GalleryFullView } from "@/components/sections/gallery/GalleryFullView";
import { GalleryGrid } from "@/components/sections/gallery/GalleryGrid";
import { GalleryLightbox } from "@/components/sections/gallery/GalleryLightbox";

type Viewer = { photos: PhotoData[]; index: number; source: "grid" | "full" };

/**
 * Galería: mosaico, visor y galería completa. Con `reducedMotion="user"`, `motion` deja solo los
 * fundidos si el visitante pide menos movimiento.
 */
export function GallerySection({ photos }: { photos: PhotoData[] }) {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [fullView, setFullView] = useState(false);
  const [instant, setInstant] = useState(false);

  const open = (list: PhotoData[], index: number, source: Viewer["source"]) => {
    setInstant(false);
    setViewer({ photos: list, index, source });
  };

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id="gallery">
        <section id="galeria" aria-labelledby="gallery-title" className="scroll-mt-16 bg-paper py-16 sm:py-20 lg:flex lg:h-svh lg:min-h-[40rem] lg:scroll-mt-0 lg:flex-col lg:pb-12 lg:pt-24">
          <Container className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
            <Reveal>
              <h2 id="gallery-title" className="font-serif text-[2.75rem] leading-[1] tracking-[-0.02em] text-forest sm:text-6xl">
                {copy.gallery.title}
              </h2>
              <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-charcoal">{copy.gallery.body}</p>
            </Reveal>

            <GalleryGrid photos={photos} instant={instant} onOpen={(i) => open(photos, i, "grid")} onOpenAll={() => setFullView(true)} />
          </Container>
        </section>

        <AnimatePresence>
          {fullView && <GalleryFullView key="full" photos={photos} instant={instant} onOpen={(list, i) => open(list, i, "full")} onClose={() => setFullView(false)} />}
        </AnimatePresence>
        <AnimatePresence>
          {viewer && (
            <GalleryLightbox
              key="viewer"
              photos={viewer.photos}
              index={viewer.index}
              source={viewer.source}
              instant={instant}
              onChange={(index) => {
                setInstant(true);
                setViewer((v) => v && { ...v, index });
              }}
              onClose={() => {
                setInstant(true);
                setViewer(null);
              }}
            />
          )}
        </AnimatePresence>
      </LayoutGroup>
    </MotionConfig>
  );
}
