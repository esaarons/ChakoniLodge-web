"use client";

import { useEffect, useRef } from "react";

type ParallaxProps = {
  children: React.ReactNode;
  /** Fracción del desplazamiento que recorre la capa en escritorio (0.1 sutil, 0.25 marcado). */
  speed?: number;
  /** Velocidad por debajo de 1024 px. 0 (por defecto) lo desactiva en móvil y tablet. */
  mobileSpeed?: number;
  className?: string;
};

const DESKTOP = "(min-width: 1024px)";

/**
 * Capa con desplazamiento parallax dentro de un marco `relative overflow-hidden`.
 * La capa sobresale del marco lo justo para no dejar huecos. Solo usa `transform`, se actualiza
 * mientras el marco está a la vista y se desactiva con `prefers-reduced-motion`.
 */
export function Parallax({ children, speed = 0.15, mobileSpeed = 0, className = "" }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    const frame = layer?.parentElement;
    if (!layer || !frame) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const desktop = window.matchMedia(DESKTOP);
    let factor = desktop.matches ? speed : mobileSpeed;
    let raf = 0;
    let active = false;

    const update = () => {
      raf = 0;
      if (!factor) {
        layer.style.transform = "";
        return;
      }
      const rect = frame.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -factor;
      layer.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onBreakpoint = () => {
      factor = desktop.matches ? speed : mobileSpeed;
      onScroll();
    };

    const observer = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      if (active) {
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
      } else {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      }
    });
    observer.observe(frame);
    desktop.addEventListener("change", onBreakpoint);

    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", onBreakpoint);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed, mobileSpeed]);

  const bleed = (s: number) => `${-Math.round(s * 100)}%`;
  return (
    <div
      ref={ref}
      className={`absolute inset-x-0 top-[var(--bleed-m)] bottom-[var(--bleed-m)] will-change-transform lg:top-[var(--bleed-d)] lg:bottom-[var(--bleed-d)] ${className}`}
      style={{ "--bleed-m": bleed(mobileSpeed), "--bleed-d": bleed(speed) } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
