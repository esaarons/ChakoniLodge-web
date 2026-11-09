import Image from "next/image";
import type { Photo as PhotoData } from "@/lib/photos";

type PhotoProps = {
  photo: PhotoData;
  sizes: string;
  /** Clases del contenedor: debe definir tamaño o proporción (aspect-*). */
  className?: string;
  preload?: boolean;
  zoomOnHover?: boolean;
  imgClassName?: string;
  /** Tono del marcador cuando falta la foto: "dark" para fotos con texto encima (hero). */
  placeholderTone?: "light" | "dark";
};

/**
 * Fotografía con `next/image` en modo `fill`.
 * Si el archivo aún no existe, muestra un marcador neutro (nunca una imagen genérica).
 */
export function Photo({
  photo,
  sizes,
  className = "",
  preload,
  zoomOnHover,
  imgClassName = "",
  placeholderTone = "light",
}: PhotoProps) {
  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      {photo.src ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          loading={preload ? "eager" : "lazy"}
          fetchPriority={preload ? "high" : undefined}
          className={`object-cover ${zoomOnHover ? "transition-transform duration-[1.4s] ease-soft group-hover:scale-[1.04]" : ""} ${imgClassName}`}
          style={photo.position ? { objectPosition: photo.position } : undefined}
        />
      ) : (
        <PhotoPlaceholder photo={photo} tone={placeholderTone} />
      )}
    </div>
  );
}

function PhotoPlaceholder({ photo, tone }: { photo: PhotoData; tone: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <div
      role="img"
      aria-label={photo.alt}
      className={
        dark
          ? "absolute inset-0 flex flex-col items-end justify-start gap-2 bg-forest p-8 pt-32 text-right"
          : "absolute inset-0 flex flex-col items-center justify-center gap-3 bg-sand p-6 text-center"
      }
    >
      {!dark && (
        <svg aria-hidden="true" viewBox="0 0 48 32" className="w-12 text-olive-deep/60" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M2 30 L18 12 L28 22 L34 16 L46 30 Z" />
          <circle cx="36" cy="7" r="3" />
        </svg>
      )}
      <span className={`font-serif text-lg italic ${dark ? "text-ivory/60" : "text-forest/80"}`}>{photo.caption}</span>
      <span
        className={`text-[0.8125rem] font-semibold ${dark ? "text-ivory/50" : "text-olive-deep"}`}
      >
        Fotografía pendiente · {photo.file}
      </span>
    </div>
  );
}
