/**
 * Ritmo de las animaciones de `motion` en la galería. Para hacerlo todo más rápido o más lento, basta
 * con cambiar estos valores (en segundos). La entrada al hacer scroll y el hover son CSS: sus valores
 * están en `--gallery-*`, en globals.css.
 */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Expansión de la miniatura al visor y vuelta. */
export const EXPAND = 0.6;
/** Cambio entre fotos dentro del visor. */
export const SWAP = 0.45;
/** Desplazamiento lateral del cambio de foto, en píxeles. */
export const SWAP_SHIFT = 48;
/** Aparición del fondo y de los controles. */
export const FADE = 0.3;
/** Reacomodo de las fotos al cambiar de filtro. */
export const REFLOW = 0.5;
/** Distancia de arrastre, en píxeles, para pasar de foto en móvil. */
export const SWIPE_DISTANCE = 80;
