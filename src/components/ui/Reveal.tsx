"use client";

import { useEffect, useRef, useState, type ElementType } from "react";

type RevealProps = {
  children: React.ReactNode;
  as?: ElementType;
  /** Retardo base en ms (variable --d, la heredan los efectos internos). */
  delay?: number;
  /**
   * `self`: el bloque entero sube y aparece.
   * `trigger`: el bloque no se mueve; solo dispara los efectos `.rv-*` de su interior.
   * No anidar disparadores: un `.rv-*` responde al primer ancestro visible.
   */
  variant?: "self" | "trigger";
  /** Parte del bloque que debe verse para dispararse. */
  threshold?: number;
  className?: string;
};

/**
 * Dispara una sola vez la aparición de su contenido cuando empieza a entrar en pantalla.
 * Los estilos están en globals.css y solo ocultan contenido con `html[data-motion]` (MotionGate).
 */
export function Reveal({ children, as: Tag = "div", delay = 0, variant = "self", threshold = 0.05, className = "" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Índice de cada hijo de .rv-stagger para la entrada en secuencia.
    el.querySelectorAll<HTMLElement>(".rv-stagger").forEach((group) => {
      Array.from(group.children).forEach((child, i) => (child as HTMLElement).style.setProperty("--i", String(i)));
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      data-visible={visible}
      className={`${variant === "self" ? "reveal" : ""} ${className}`}
      style={delay ? ({ "--d": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
