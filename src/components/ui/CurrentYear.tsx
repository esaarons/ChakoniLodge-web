"use client";

/** Año calculado en el navegador para que no quede fijado en el momento del build. */
export function CurrentYear() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
