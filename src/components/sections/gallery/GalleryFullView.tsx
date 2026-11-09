"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Photo as PhotoData } from "@/lib/photos";
import { GALLERY_TAGS, TAG_LABEL, type GalleryTag } from "@/config/photos";
import { Photo } from "@/components/ui/Photo";
import { GalleryDialog } from "@/components/sections/gallery/GalleryDialog";
import { EASE, EXPAND, FADE, REFLOW } from "@/components/sections/gallery/motion";

type Filter = "Todas" | GalleryTag;

type GalleryFullViewProps = {
  photos: PhotoData[];
  instant: boolean;
  onOpen: (photos: PhotoData[], index: number) => void;
  onClose: () => void;
};

/** Galería completa con filtros: las fotos se reacomodan animadas a su nueva posición. */
export function GalleryFullView({ photos, instant, onOpen, onClose }: GalleryFullViewProps) {
  const [filter, setFilter] = useState<Filter>("Todas");
  const visible = useMemo(() => (filter === "Todas" ? photos : photos.filter((p) => p.tag === filter)), [photos, filter]);

  return (
    <GalleryDialog label="Galería completa" onClose={onClose}>
      <motion.div
        className="h-full overflow-y-auto overscroll-contain bg-paper text-charcoal"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: FADE, ease: EASE }}
      >
        <div className="mx-auto max-w-[88rem] px-5 pb-16 sm:px-8 lg:px-12">
          <div className="sticky top-0 z-10 -mx-5 bg-paper px-5 pb-4 pt-4 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 lg:pt-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-serif text-[2rem] leading-tight text-forest sm:text-4xl">Todas las fotos</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar galería"
                className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-forest transition-[background-color,transform] duration-150 hover:bg-forest/5 active:scale-90"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M5 5l14 14M19 5L5 19" />
                </svg>
              </button>
            </div>
            <div role="group" aria-label="Filtrar fotografías" className="-mx-1 mt-3 flex flex-wrap gap-1 px-1 py-1">
              {(["Todas", ...GALLERY_TAGS] as Filter[]).map((name) => {
                const active = name === filter;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFilter(name)}
                    aria-pressed={active}
                    className={`relative min-h-11 cursor-pointer rounded-full px-4 text-sm font-semibold transition-colors duration-300 ${active ? "text-ivory" : "text-forest hover:bg-forest/5"}`}
                  >
                    {active && <motion.span layoutId="gallery-filter" transition={{ duration: FADE, ease: EASE }} className="absolute inset-0 rounded-full bg-forest" />}
                    <span className="relative">{name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <ul className="gallery-grid mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((photo, i) => (
                <motion.li
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: REFLOW, ease: EASE }}
                  className="gallery-tile"
                >
                  <button
                    type="button"
                    data-gallery-tile={`full-${photo.id}`}
                    onClick={() => onOpen(visible, i)}
                    aria-label={`Ampliar fotografía: ${photo.caption}`}
                    className="relative block aspect-[3/2] w-full cursor-pointer overflow-hidden text-left focus-visible:-outline-offset-4"
                  >
                    <motion.div
                      layoutId={`full-${photo.id}`}
                      transition={{ layout: { duration: instant ? 0 : EXPAND, ease: EASE } }}
                      className="absolute inset-0 overflow-hidden"
                    >
                      <motion.div layout className="absolute inset-0">
                        <Photo photo={photo} sizes="(min-width: 1024px) 34vw, 50vw" className="h-full w-full" />
                      </motion.div>
                    </motion.div>
                    <span aria-hidden="true" className="gallery-label pointer-events-none absolute bottom-3 left-3 rounded-full bg-forest-deep/75 px-3 py-1 text-[0.8125rem] font-medium text-ivory">
                      {TAG_LABEL[photo.tag]}
                    </span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </motion.div>
    </GalleryDialog>
  );
}
