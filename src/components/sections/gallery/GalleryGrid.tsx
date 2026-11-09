"use client";

import { motion } from "motion/react";
import type { Photo as PhotoData } from "@/lib/photos";
import { TAG_LABEL } from "@/config/photos";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { EASE, EXPAND } from "@/components/sections/gallery/motion";

/** Fotografías visibles en el mosaico; el resto se ve en la galería completa. */
const VISIBLE = 5;
/** Móvil: la grande y dos filas con anchos cruzados (3 + 2, 2 + 3). */
const MOBILE_TILES = ["col-span-5 aspect-[4/3]", "col-span-3 h-[46vw]", "col-span-2 h-[46vw]", "col-span-2 h-[46vw]", "col-span-3 h-[46vw]"];

type GalleryGridProps = {
  photos: PhotoData[];
  /** Mientras se navega en el visor, las miniaturas no animan su posición. */
  instant: boolean;
  onOpen: (index: number) => void;
  onOpenAll: () => void;
};

/**
 * Mosaico: una foto grande y cuatro pequeñas; la última abre la galería completa.
 * La entrada (`.rv-gallery`) y el hover son CSS: sin JavaScript las fotos se ven igual.
 */
export function GalleryGrid({ photos, instant, onOpen, onOpenAll }: GalleryGridProps) {
  const last = VISIBLE - 1;
  const hidden = photos.length - VISIBLE;

  return (
    <Reveal variant="trigger" threshold={0.2} className="lg:mt-10 lg:min-h-0 lg:flex-1">
      <ul className="gallery-grid mt-10 grid grid-cols-5 gap-3 md:h-[min(72vh,640px)] md:grid-cols-4 md:grid-rows-2 md:gap-4 lg:mt-0 lg:h-full">
        {photos.slice(0, VISIBLE).map((photo, i) => {
          const big = i === 0;
          const more = i === last && hidden > 0;
          return (
            <li
              key={photo.id}
              className={`gallery-tile rv-gallery ${MOBILE_TILES[i]} md:h-auto md:aspect-auto ${big ? "md:col-span-2 md:row-span-2" : "md:col-span-1"}`}
              style={{ "--i": i } as React.CSSProperties}
            >
              <button
                type="button"
                data-gallery-tile={more ? undefined : `grid-${photo.id}`}
                onClick={() => (more ? onOpenAll() : onOpen(i))}
                aria-label={more ? `Ver las ${photos.length} fotografías` : `Ampliar fotografía: ${photo.caption}`}
                className="relative block h-full w-full cursor-pointer overflow-hidden text-left transition-transform duration-150 focus-visible:-outline-offset-4 active:scale-[0.985]"
              >
                <motion.div
                  layoutId={more ? undefined : `grid-${photo.id}`}
                  transition={{ layout: { duration: instant ? 0 : EXPAND, ease: EASE } }}
                  className="absolute inset-0 overflow-hidden"
                >
                  <motion.div layout={more ? false : true} className="gallery-zoom absolute inset-0">
                    <Photo
                      photo={photo}
                      sizes={big ? "(min-width: 768px) 65vw, 100vw" : "(min-width: 768px) 32vw, 70vw"}
                      className="h-full w-full"
                    />
                  </motion.div>
                </motion.div>
                {more ? (
                  <span aria-hidden="true" className="gallery-more pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-ivory">
                    <span className="gallery-more-count font-serif text-5xl leading-none">+{hidden}</span>
                    <span className="mt-2 text-sm font-semibold">Ver todas</span>
                  </span>
                ) : (
                  <span aria-hidden="true" className="gallery-label pointer-events-none absolute bottom-3 left-3 rounded-full bg-forest-deep/75 px-3 py-1 text-[0.8125rem] font-medium text-ivory">
                    {TAG_LABEL[photo.tag]}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </Reveal>
  );
}
