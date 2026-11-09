"use client";

import { useEffect } from "react";

/**
 * Activa las animaciones de aparición (`html[data-motion]`) solo cuando React ha hidratado
 * y el visitante no ha pedido reducir el movimiento. Sin JavaScript, el contenido queda visible.
 */
export function MotionGate() {
  useEffect(() => {
    const root = document.documentElement;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (query.matches) delete root.dataset.motion;
      else root.dataset.motion = "on";
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return null;
}
