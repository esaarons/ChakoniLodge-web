"use client";

import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale/es";
import { parseISODate, toISODate } from "@/lib/whatsapp";

type RangeCalendarProps = {
  label: string;
  /** Extremos del rango en ISO; vacíos si aún no se han elegido. */
  from: string;
  to: string;
  /** Primer día seleccionable. Vacío mientras no se conoce la fecha del visitante. */
  min: string;
  /** Mes que se abre primero. */
  month: string;
  onPick: (iso: string) => void;
};

const edge = "bg-forest/10 [&>button]:bg-forest [&>button]:text-ivory [&>button]:hover:bg-forest";

/**
 * Calendario de rango en la paleta del lodge. Quien lo usa decide qué extremo cambia cada clic
 * (`onPick`), así la tarjeta conserva sus pasos de llegada y salida.
 * Siempre seis semanas: la tarjeta no cambia de alto al pasar de mes.
 */
export function RangeCalendar({ label, from, to, min, month, onPick }: RangeCalendarProps) {
  const minDate = parseISODate(min);
  // "Hoy" solo se conoce en el navegador; se reserva el alto para que la tarjeta no salte.
  if (!minDate) return <div className="h-[19.5rem] lg:h-[18rem]" />;

  const monthDate = parseISODate(month) ?? minDate;

  return (
    <div data-autofocus tabIndex={-1} className="focus:outline-none">
      <DayPicker
        mode="range"
        locale={es}
        aria-label={label}
        selected={{ from: parseISODate(from) ?? undefined, to: parseISODate(to) ?? undefined }}
        onSelect={(_, day) => onPick(toISODate(day))}
        disabled={{ before: minDate }}
        defaultMonth={monthDate}
        startMonth={monthDate < minDate ? monthDate : minDate}
        showOutsideDays
        fixedWeeks
        classNames={{
          root: "w-full",
          months: "relative",
          month_caption: "flex h-10 items-center",
          caption_label: "font-serif text-xl text-forest first-letter:uppercase",
          nav: "absolute right-0 top-0 z-10 flex",
          button_previous: "flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-forest/5 disabled:opacity-25 disabled:hover:bg-transparent",
          button_next: "flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-forest/5 disabled:opacity-25 disabled:hover:bg-transparent",
          chevron: "h-5 w-5 fill-forest",
          month_grid: "w-full table-fixed border-collapse",
          weekday: "h-8 text-center text-xs font-medium text-olive-deep first-letter:uppercase",
          day: "p-0 text-center text-sm text-charcoal",
          day_button: "mx-auto flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-forest/10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-forest disabled:cursor-not-allowed disabled:hover:bg-transparent lg:h-9 lg:w-9",
          today: "font-semibold text-terracotta-deep",
          outside: "text-charcoal/40",
          disabled: "text-charcoal/25",
          range_start: `rounded-l-full ${edge}`,
          range_end: `rounded-r-full ${edge}`,
          range_middle: "bg-forest/10",
        }}
      />
    </div>
  );
}
