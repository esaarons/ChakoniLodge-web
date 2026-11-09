"use client";

import { useEffect, useRef, useState } from "react";
import { Parallax } from "@/components/ui/Parallax";

/**
 * Fondo de la portada: la fotografía (`children`) hace de póster y el vídeo aparece encima cuando
 * ya se está reproduciendo. Móvil usa un corte vertical propio, más ligero.
 * Con movimiento reducido o ahorro de datos no arranca solo ni descarga nada: queda el botón.
 * El botón refleja los eventos reales del elemento, no una suposición.
 */
export function HeroMedia({ children }: { children: React.ReactNode }) {
  const video = useRef<HTMLVideoElement>(null);
  // Intención de reproducir: distingue una pausa del visitante de la pausa por salir de pantalla.
  const wantsPlay = useRef(false);
  const [mode, setMode] = useState<"auto" | "manual" | null>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  // Solo el navegador conoce estas preferencias, y así el vídeo no compite con la foto al cargar.
  useEffect(() => {
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const manual = saveData || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    wantsPlay.current = !manual;
    setMode(manual ? "manual" : "auto");
  }, []);

  const play = () => {
    const el = video.current;
    // Si el navegador lo bloquea, el vídeo sigue parado y el botón ofrece reproducir.
    el?.play().catch(() => setPlaying(!el.paused));
  };

  // Fuera de pantalla no se reproduce; al volver sigue, salvo que el visitante lo pausara.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) el.pause();
      else if (wantsPlay.current) play();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [mode]);

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    wantsPlay.current = el.paused;
    if (el.paused) play();
    else el.pause();
  };

  return (
    <>
      <Parallax speed={0.1} mobileSpeed={0.05}>
        <div className="hero-zoom absolute inset-0">
          {children}
          {mode && (
            <video
              ref={video}
              aria-hidden="true"
              autoPlay={mode === "auto"}
              muted
              loop
              playsInline
              disablePictureInPicture
              disableRemotePlayback
              preload={mode === "auto" ? "auto" : "none"}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onPlaying={() => setStarted(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-soft ${started ? "opacity-100" : "opacity-0"}`}
            >
              <source src="/video/portada-movil.mp4" type="video/mp4" media="(max-width: 639px)" />
              <source src="/video/portada.mp4" type="video/mp4" onError={() => setFailed(true)} />
            </video>
          )}
        </div>
      </Parallax>
      <div aria-hidden="true" className="hero-scrim absolute inset-0" />
      {mode && !failed && (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pausar video" : "Reproducir video"}
          className="absolute left-2 top-2.5 z-10 flex h-11 w-11 items-center justify-center rounded-full text-ivory transition-[background-color,transform] duration-150 focus-visible:outline-ivory active:scale-90 sm:left-5 lg:bottom-6 lg:left-auto lg:right-12 lg:top-auto lg:bg-forest-deep/60 lg:hover:bg-forest-deep"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3 w-3 lg:h-3.5 lg:w-3.5" fill="currentColor">
            {playing ? <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" /> : <path d="M4 2.5v11l9-5.5z" />}
          </svg>
        </button>
      )}
    </>
  );
}
