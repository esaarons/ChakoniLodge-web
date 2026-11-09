export type BookingRequest = {
  arrival: string; // YYYY-MM-DD
  departure: string; // YYYY-MM-DD
  guests: number;
};

/** Convierte "YYYY-MM-DD" en fecha local sin desfase de zona horaria. */
export function parseISODate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function toISODate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDate(value: string, locale = "es-PE"): string {
  const d = parseISODate(value);
  if (!d) return value;
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function buildBookingMessage(hotelName: string, req: BookingRequest): string {
  return [
    `Hola, quisiera consultar disponibilidad en ${hotelName}.`,
    "",
    `Llegada: ${formatDate(req.arrival)}`,
    `Salida: ${formatDate(req.departure)}`,
    `Huéspedes: ${req.guests}`,
    "",
    "¿Podrían brindarme información sobre habitaciones y tarifas?",
  ].join("\n");
}

export function buildWhatsAppUrl(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
