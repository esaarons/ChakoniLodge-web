"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo, type TargetAndTransition } from "motion/react";
import type { Photo as PhotoData } from "@/lib/photos";
import { TAG_LABEL } from "@/config/photos";
import { Photo } from "@/components/ui/Photo";
import { GalleryDialog } from "@/components/sections/gallery/GalleryDialog";
import { EASE, EXPAND, FADE, SWAP, SWAP_SHIFT, SWIPE_DISTANCE } from "@/components/sections/gallery/motion";

type GalleryLightboxProps = {
  photos: PhotoData[];
  index: number;
  /** Prefijo del `layoutId` de las miniaturas de origen: mosaico o galería completa. */
  source: "grid" | "full";
  /** Tras la primera foto, el cambio no se anima desde la miniatura. */
  instant: boolean;
  onChange: (index: number) => void;
  onClose: () => void;
};

/** En un ref porque la foto saliente conserva sus props antiguas al animar. */
type Direction = { current: number };

const swap = {
  enter: (d: Direction) => ({ opacity: 0, x: d.current * SWAP_SHIFT }),
  center: { opacity: 1, x: 0, y: 0, scale: 1, clipPath: "inset(0% 0% 0% 0%)" },
  exit: (d: Direction) => ({ opacity: 0, x: -d.current * SWAP_SHIFT }),
};

/**
 * Vuelta a la miniatura: la miniatura está recortada y queda bajo el visor, así que es la foto del
 * visor la que viaja hasta ella. Escala hasta cubrirla y recorta lo que sobra, como `object-cover`.
 */
function flyTo(frame: Element | null, tile: Element | null): TargetAndTransition {
  const fade = { opacity: 0, scale: 0.97, transition: { duration: FADE, ease: EASE } };
  if (!frame || !tile) return fade;
  const from = frame.getBoundingClientRect();
  const to = tile.getBoundingClientRect();
  if (to.bottom < 0 || to.top > window.innerHeight) return fade;

  const scale = Math.max(to.width / from.width, to.height / from.height);
  const cropX = ((1 - to.width / (from.width * scale)) / 2) * 100;
  const cropY = ((1 - to.height / (from.height * scale)) / 2) * 100;
  return {
    x: to.x + to.width / 2 - (from.x + from.width / 2),
    y: to.y + to.height / 2 - (from.y + from.height / 2),
    scale,
    clipPath: `inset(${cropY}% ${cropX}% ${cropY}% ${cropX}%)`,
    transition: { duration: EXPAND, ease: EASE },
  };
}

/**
 * Visor: la foto crece desde su miniatura (`layoutId`) y al cerrar viaja a la miniatura de la foto
 * actual; si no tiene una a la vista, se desvanece. Las flechas, el teclado y el arrastre pasan de foto.
 */
export function GalleryLightbox({ photos, index, source, instant, onChange, onClose }: GalleryLightboxProps) {
  const direction = useRef(0);
  const [closing, setClosing] = useState<TargetAndTransition | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const total = photos.length;
  const photo = photos[index];
  const neighbours = [photos[(index + 1) % total], photos[(index - 1 + total) % total]];

  const go = (step: number) => {
    if (closing) return;
    direction.current = step;
    onChange((index + step + total) % total);
  };
  const close = () => {
    if (closing) return;
    const tile = reduced ? null : document.querySelector(`[data-gallery-tile="${source}-${photo.id}"]`);
    setClosing(flyTo(frame.current, tile));
  };
  const onDragEnd = (_: unknown, { offset, velocity }: PanInfo) => {
    if (Math.abs(offset.x) > SWIPE_DISTANCE || Math.abs(velocity.x) > 500) go(offset.x < 0 ? 1 : -1);
  };

  return (
    <GalleryDialog
      label="Visor de fotografías"
      onClose={close}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <motion.div
        aria-hidden="true"
        className={/* taste-skill-ignore: fondo del visor, pedido con desenfoque */ "absolute inset-0 bg-forest-deep/90 backdrop-blur-md"}
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: FADE }}
      />

      <div className="relative flex h-full flex-col text-ivory">
        <motion.div
          className="flex items-center justify-between px-5 py-3 sm:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: closing ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE }}
        >
          <p className="text-sm tabular-nums" aria-live="polite">
            {index + 1} / {total}
            <span className="ml-3 text-ivory/75">{TAG_LABEL[photo.tag]}</span>
          </p>
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar visor"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full transition-[background-color,transform] duration-150 hover:bg-ivory/10 active:scale-90"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </motion.div>

        <div
          className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <AnimatePresence custom={direction} initial={false} mode="popLayout">
            <motion.div
              key={photo.id}
              ref={frame}
              custom={direction}
              variants={swap}
              initial="enter"
              animate={closing ?? "center"}
              exit="exit"
              onAnimationComplete={() => closing && onClose()}
              transition={{ duration: SWAP, ease: EASE }}
              drag={total > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={onDragEnd}
              className="max-h-full cursor-grab active:cursor-grabbing"
              style={{ width: `min(100%, calc((100dvh - 9.5rem) * ${photo.width / photo.height}))` }}
            >
              <motion.div
                layoutId={`${source}-${photo.id}`}
                transition={{ layout: { duration: instant ? 0 : EXPAND, ease: EASE } }}
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
              >
                <motion.div layout className="absolute inset-0">
                  <Photo photo={photo} sizes="100vw" preload className="pointer-events-none h-full w-full !bg-transparent" />
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <NavButton direction="prev" onClick={() => go(-1)} />
          <NavButton direction="next" onClick={() => go(1)} />
        </div>

        <motion.div
          className="flex items-center justify-between gap-4 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:justify-center sm:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: closing ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE }}
        >
          <NavButton direction="prev" onClick={() => go(-1)} mobile />
          <p className="text-center font-serif text-xl">{photo.caption}</p>
          <NavButton direction="next" onClick={() => go(1)} mobile />
        </motion.div>
      </div>

      {/* Precarga de la foto siguiente y la anterior, con el mismo tamaño que se pedirá al pasar. */}
      <div aria-hidden="true" className="pointer-events-none absolute h-1 w-1 overflow-hidden opacity-0">
        {neighbours.map((next) => (
          <Photo key={next.id} photo={next} sizes="100vw" preload className="h-1 w-1" />
        ))}
      </div>
    </GalleryDialog>
  );
}

type NavButtonProps = { direction: "prev" | "next"; onClick: () => void; mobile?: boolean };

function NavButton({ direction, onClick, mobile }: NavButtonProps) {
  const prev = direction === "prev";
  const placement = mobile ? "flex shrink-0 sm:hidden" : `absolute top-1/2 hidden -translate-y-1/2 sm:flex ${prev ? "left-4" : "right-4"}`;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={prev ? "Fotografía anterior" : "Fotografía siguiente"}
      className={`h-12 w-12 items-center justify-center rounded-full border border-ivory/30 transition-colors hover:border-ivory hover:bg-ivory hover:text-forest ${placement}`}
    >
      <span aria-hidden="true">{prev ? "←" : "→"}</span>
    </button>
  );
}
