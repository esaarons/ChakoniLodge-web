"use client";

import { useEffect, useRef, useState } from "react";

const INTERVAL_MS = 6000;

/**
 * Avance automático de un carrusel. Solo corre con el carrusel en pantalla y sin el cursor encima;
 * se detiene del todo al usarlo (`show`) y no arranca con movimiento reducido.
 */
export function useAutoCarousel<T extends Element>(total: number) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !inView || hovered) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % total), INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [index, playing, inView, hovered, total]);

  const show = (next: number) => {
    setPlaying(false);
    setIndex((next + total) % total);
  };

  const hoverProps = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  return { index, show, playing, ref, hoverProps };
}
