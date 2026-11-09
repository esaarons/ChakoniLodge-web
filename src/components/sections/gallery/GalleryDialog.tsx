"use client";

import { useEffect, useRef } from "react";

type GalleryDialogProps = {
  label: string;
  onClose: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  children: React.ReactNode;
};

/**
 * `<dialog>` modal de la galería: el navegador atrapa el foco y deja inerte la página. Se monta y se
 * desmonta con `AnimatePresence`, así que Escape pide el cierre en vez de cerrar de golpe, y el foco
 * vuelve al elemento que lo abrió al terminar la animación de salida. El scroll se bloquea en CSS.
 */
export function GalleryDialog({ label, onClose, onKeyDown, children }: GalleryDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    trigger.current ??= document.activeElement as HTMLElement | null;
    dialog?.showModal();
    // React no escribe `autofocus` en el HTML: sin esto, el foco iría a la zona con scroll.
    dialog?.querySelector("button")?.focus();
    return () => {
      dialog?.close();
      trigger.current?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={ref}
      data-gallery
      aria-label={label}
      aria-modal="true"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        // El navegador puede ignorar `onCancel` y cerrar sin animación: Escape se resuelve aquí.
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
        onKeyDown?.(e);
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0"
    >
      {children}
    </dialog>
  );
}
