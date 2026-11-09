"use client";

import { useEffect, useId, useRef } from "react";

type BottomSheetProps = {
  open: boolean;
  title: string;
  body?: string;
  onClose: () => void;
  children: React.ReactNode;
};

/**
 * Panel inferior sobre `<dialog>` nativo: el navegador se ocupa del foco, de la tecla Escape y de
 * devolver el foco al botón que lo abrió. La entrada y la salida están en globals.css (`.sheet`).
 */
export function BottomSheet({ open, title, body, onClose, children }: BottomSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="sheet bg-shell text-charcoal"
      onClose={onClose}
      // Un toque fuera del contenido llega al propio dialog (su fondo).
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="px-5 pb-7 pt-3">
        <span aria-hidden="true" className="mx-auto block h-1 w-10 rounded-full bg-forest/15" />
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="font-serif text-[1.75rem] leading-tight text-forest">
              {title}
            </h2>
            {body && <p className="mt-0.5 text-sm text-charcoal/75">{body}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-forest transition-[background-color,transform] duration-150 hover:bg-forest/5 active:scale-90"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </dialog>
  );
}
