type CrossingTitleProps = {
  id: string;
  lines: readonly string[];
  /** Tamaño y posición desde `lg` (p. ej. `lg:absolute lg:left-1/2 lg:top-1/3 …`). Debajo de `lg` es un titular normal. */
  className: string;
  /** Color del texto fuera de la foto y en móvil. */
  outside: string;
  /** Color del texto sobre la foto. */
  inside: string;
  /**
   * Retardo (ms) de la máscara de la foto que cruza, si se revela con `.rv-image-lg`: la capa de
   * color se abre al mismo ritmo para que el titular siga legible durante la transición.
   */
  photoRevealDelay?: number;
  /** Retardo (ms) de la entrada por líneas (`.rv-line`) desde `lg`; en móvil el titular entra primero. */
  linesDelay?: number;
};

/**
 * Titular que cruza una fotografía y cambia de color al hacerlo.
 * Se coloca dentro del marco de la foto (`relative`, sin `overflow-hidden`), antes de ella.
 * En móvil es un titular normal encima de la foto. Desde `lg` el `h2` pasa a `display: contents`
 * para que sus dos capas se posicionen respecto al marco: el texto en color `outside` y una copia
 * decorativa recortada a los bordes del marco que pinta las letras en color `inside`.
 * Dentro de un `<Reveal variant="trigger">`, ambas capas entran línea a línea a la vez.
 */
export function CrossingTitle({ id, lines, className, outside, inside, photoRevealDelay, linesDelay }: CrossingTitleProps) {
  const text = lines.map((line, i) => (
    <span key={line} className="rv-line block" style={{ "--i": i } as React.CSSProperties}>
      {line}
    </span>
  ));
  const lineStyle = { "--dl": `${linesDelay ?? 0}ms` } as React.CSSProperties;
  const lineDelay = "[--d:0ms] lg:[--d:var(--dl)]";

  return (
    <h2 id={id} className="lg:contents">
      <span className={`block lg:z-10 lg:whitespace-nowrap ${lineDelay} ${className} ${outside}`} style={lineStyle}>
        {text}
      </span>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-20 hidden overflow-hidden lg:block ${
          photoRevealDelay !== undefined ? "rv-clip-lg" : ""
        }`}
        style={photoRevealDelay !== undefined ? ({ "--d": `${photoRevealDelay}ms` } as React.CSSProperties) : undefined}
      >
        <span className={`block whitespace-nowrap ${lineDelay} ${className} ${inside}`} style={lineStyle}>
          {text}
        </span>
      </span>
    </h2>
  );
}
