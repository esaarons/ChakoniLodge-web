"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { copy, site } from "@/config/site";
import { buildBookingMessage, buildWhatsAppUrl, formatDate, parseISODate, toISODate } from "@/lib/whatsapp";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { RangeCalendar } from "@/components/ui/RangeCalendar";

const MIN_GUESTS = 1;
const MAX_GUESTS = site.bookingMaxGuests;
const STEP_MS = 320;

/** 0 llegada · 1 salida · 2 huéspedes · 3 consulta lista */
type Step = 0 | 1 | 2 | 3;
type DateField = "arrival" | "departure";

function addDays(iso: string, days: number) {
  const d = parseISODate(iso);
  if (!d) return "";
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

function nightsBetween(arrival: string, departure: string) {
  const a = parseISODate(arrival);
  const d = parseISODate(departure);
  return a && d ? Math.round((d.getTime() - a.getTime()) / 86_400_000) : 0;
}

function shortDate(iso: string) {
  const d = parseISODate(iso);
  return d ? new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short" }).format(d) : "";
}

/**
 * Tarjeta flotante de consulta por pasos (llegada → salida → huéspedes).
 * Cada paso entra desde la derecha al avanzar y desde la izquierda al volver; la altura
 * de la tarjeta se anima al cambiar de contenido. Genera el mensaje y abre WhatsApp.
 * Por debajo de 1024 px la tarjeta es un resumen (llegada, salida, huéspedes) y cada fecha se elige
 * en un panel inferior; ambas presentaciones comparten estado y validación.
 * Vive en un `<dialog>` global: lo abre cualquier enlace a `site.bookingAnchor`, desde toda la página.
 * El navegador gestiona el foco y la tecla Escape; la animación está en globals.css (`.booking-panel`).
 */
export function BookingBox() {
  const id = useId();
  const [today, setToday] = useState("");
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [departureReset, setDepartureReset] = useState(false);
  const [guests, setGuests] = useState(2);
  const [view, setView] = useState<{ step: Step; prev: Step | null; dir: 1 | -1 }>({ step: 0, prev: null, dir: 1 });
  const [opened, setOpened] = useState(false);
  const [sheet, setSheet] = useState<{ field: DateField; open: boolean; id: number } | null>(null);

  const panel = useRef<HTMLDialogElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const current = useRef<HTMLDivElement>(null);
  const departureTile = useRef<HTMLButtonElement>(null);
  const mobileSubmit = useRef<HTMLButtonElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const isDemo = !site.whatsapp.number;

  // La fecha de hoy se calcula en el navegador (zona horaria del visitante).
  useEffect(() => setToday(toISODate(new Date())), []);

  useEffect(() => {
    const open = () => {
      if (panel.current && !panel.current.open) panel.current.showModal();
    };
    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest?.(`a[href="${site.bookingAnchor}"]`)) return;
      e.preventDefault();
      open();
    };
    if (window.location.hash === site.bookingAnchor) open();
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // La altura sigue al paso visible para que la tarjeta crezca o encoja con suavidad.
  useLayoutEffect(() => {
    const el = current.current;
    if (!el) return;
    // Con el panel cerrado no hay medida: se conserva la última.
    const measure = () => el.offsetHeight && setHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [view.step]);

  // Al cambiar de paso, el foco pasa al control principal del nuevo paso.
  useEffect(() => {
    if (view.prev === null) return;
    // En móvil el paso activo puede estar oculto: al volver de la consulta, el foco va a su botón.
    const target = current.current?.offsetParent ? current.current.querySelector<HTMLElement>("[data-autofocus]") : mobileSubmit.current;
    target?.focus({ preventScroll: true });
    const t = window.setTimeout(() => setView((v) => ({ ...v, prev: null })), STEP_MS);
    return () => window.clearTimeout(t);
  }, [view.step, view.prev]);

  const goTo = (step: Step) => setView((v) => ({ step, prev: v.step, dir: step > v.step ? 1 : -1 }));

  // Validación
  const arrivalError = arrival && today && arrival < today ? "La llegada no puede ser anterior a hoy." : "";
  const arrivalValid = Boolean(arrival && today && !arrivalError);
  const departureError =
    departure && arrival && departure <= arrival ? "La salida debe ser posterior a la llegada." : "";
  const departureValid = Boolean(arrivalValid && departure && !departureError);
  const guestsValid = Number.isInteger(guests) && guests >= MIN_GUESTS && guests <= MAX_GUESTS;
  const allValid = arrivalValid && departureValid && guestsValid;
  const nights = departureValid ? nightsBetween(arrival, departure) : 0;

  const onArrivalChange = (value: string) => {
    setArrival(value);
    // Si la salida deja de ser válida, se borra y se pide de nuevo.
    if (departure && value && departure <= value) {
      setDeparture("");
      setDepartureReset(true);
    }
  };

  const message = allValid ? buildBookingMessage(site.name, { arrival, departure, guests }) : "";

  const sendQuery = () => {
    if (!allValid) return;
    if (!isDemo) window.open(buildWhatsAppUrl(site.whatsapp.number, message), "_blank", "noopener,noreferrer");
    setOpened(!isDemo);
    goTo(3);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const step = view.step;
    if (step === 0 && arrivalValid) return goTo(1);
    if (step === 1 && departureValid) return goTo(2);
    if (step === 2) sendQuery();
  };

  const onDeparturePick = (value: string) => {
    setDeparture(value);
    setDepartureReset(false);
  };

  // Sin llegada no hay salida posible: se pide primero la llegada.
  const openSheet = (field: DateField) =>
    setSheet((s) => ({ field: field === "departure" && !arrivalValid ? "arrival" : field, open: true, id: (s?.id ?? 0) + 1 }));
  const closeSheet = () => setSheet((s) => s && { ...s, open: false });

  const onSheetPick = (value: string) => {
    if (sheet?.field === "arrival") {
      onArrivalChange(value);
      closeSheet();
      // El dialog devuelve el foco a su botón; si falta la salida, se lleva a ella.
      if (!departure || departure <= value) requestAnimationFrame(() => departureTile.current?.focus({ preventScroll: true }));
    } else {
      onDeparturePick(value);
      closeSheet();
    }
  };

  const renderStep = (step: Step) => {
    const text = step < 3 ? copy.booking.steps[step as 0 | 1 | 2] : null;
    const fieldId = `${id}-field-${step}`;

    if (step === 0 || step === 1) {
      const isArrival = step === 0;
      const value = isArrival ? arrival : departure;
      const error = isArrival ? arrivalError : departureError;
      const hint =
        !isArrival && departureReset && !departure ? "Cambiaste la llegada: elige una nueva fecha de salida." : "";
      return (
        <>
          <StepHeading title={text!.title} body={text!.body} />
          <div className="mt-4">
            <RangeCalendar
              label={text!.label}
              from={arrival}
              to={departure}
              min={isArrival ? today : addDays(arrival, 1)}
              month={value || arrival}
              onPick={(iso) => {
                if (isArrival) onArrivalChange(iso);
                else onDeparturePick(iso);
              }}
            />
          </div>
          <p aria-live="polite" className={`mt-2 min-h-5 text-sm ${error ? "text-terracotta-deep" : "text-olive-deep"}`}>
            {error || hint || (value ? formatDate(value) : "")}
          </p>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <StepHeading title={text!.title} body={text!.body} />
          <div className="mt-6 flex items-center justify-between gap-3" role="group" aria-label={text!.label}>
            <RoundButton
              label="Quitar un huésped"
              disabled={guests <= MIN_GUESTS}
              onClick={() => setGuests((g) => Math.max(MIN_GUESTS, g - 1))}
            >
              −
            </RoundButton>
            <p id={`${fieldId}-value`} className="text-center font-serif text-[1.75rem] leading-none text-forest" aria-live="polite">
              {guests} {guests === 1 ? "huésped" : "huéspedes"}
            </p>
            <RoundButton
              label="Añadir un huésped"
              disabled={guests >= MAX_GUESTS}
              onClick={() => setGuests((g) => Math.min(MAX_GUESTS, g + 1))}
              autofocus
            >
              +
            </RoundButton>
          </div>
          <p className="mt-5 text-center text-sm text-olive-deep">
            {shortDate(arrival)} → {shortDate(departure)} · {nights} {nights === 1 ? "noche" : "noches"}
          </p>
        </>
      );
    }

    return (
      <>
        <StepHeading
          title={opened ? copy.booking.done.title : copy.booking.done.demoTitle}
          body={copy.booking.note}
        />
        <pre
          data-autofocus
          tabIndex={-1}
          className="mt-5 max-h-44 overflow-auto whitespace-pre-wrap rounded-2xl bg-white p-4 font-sans text-sm leading-relaxed text-charcoal/85 focus:outline-none"
        >
          {message}
        </pre>
        {!opened && (
          <p className="mt-3 text-sm leading-relaxed text-olive-deep">
            Modo demostración: se abrirá en WhatsApp al configurar el número del lodge.
          </p>
        )}
      </>
    );
  };

  const { step, prev, dir } = view;
  const canContinue = step === 0 ? arrivalValid : step === 1 ? departureValid : allValid;
  const primaryLabel = step === 2 ? copy.booking.submit : copy.booking.next;
  const sheetIsArrival = sheet?.field === "arrival";
  const sheetText = copy.booking.steps[sheetIsArrival ? 0 : 1];

  return (
    <dialog
      ref={panel}
      id="consulta"
      aria-label={copy.booking.eyebrow}
      className="sheet booking-panel bg-shell text-charcoal"
      // Un clic fuera del contenido llega al propio dialog (su fondo).
      onClick={(e) => e.target === e.currentTarget && panel.current?.close()}
    >
      <div className="p-5 sm:p-6 lg:p-7">
      <form noValidate onSubmit={onSubmit} aria-label="Consulta de disponibilidad">
        <div className="flex items-center justify-between gap-3">
          <p className="mr-auto whitespace-nowrap text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-olive-deep lg:tracking-[0.12em]">{copy.booking.eyebrow}</p>
          {nights > 0 && (
            <p className="text-sm text-olive-deep lg:hidden">
              {nights} {nights === 1 ? "noche" : "noches"}
            </p>
          )}
          <ol className="hidden gap-1.5 lg:flex" aria-label={`Paso ${Math.min(step, 2) + 1} de 3`}>
            {[0, 1, 2].map((i) => (
              <li
                key={i}
                aria-hidden="true"
                className={`h-[3px] w-5 rounded-full transition-colors duration-300 ${i <= step ? "bg-forest" : "bg-forest/15"}`}
              />
            ))}
          </ol>
          <button
            type="button"
            onClick={() => panel.current?.close()}
            aria-label="Cerrar"
            className="-my-2 -mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-forest transition-[background-color,transform] duration-150 hover:bg-forest/5 active:scale-90"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {step < 3 && (
          <div className="mt-3 lg:hidden">
            <div className="flex gap-2.5">
              <DateTile label={copy.booking.summary.arrival} value={arrival} onClick={() => openSheet("arrival")} />
              <DateTile
                ref={departureTile}
                label={copy.booking.summary.departure}
                value={departure}
                onClick={() => openSheet("departure")}
              />
            </div>
            {departureReset && !departure && (
              <p aria-live="polite" className="mt-2 text-sm text-olive-deep">
                Cambiaste la llegada: elige una nueva fecha de salida.
              </p>
            )}
            <div className="mt-3 flex items-center justify-between gap-3" role="group" aria-label={copy.booking.steps[2].label}>
              <p className="text-sm font-semibold text-forest">{copy.booking.steps[2].label}</p>
              <div className="flex items-center gap-1">
                <RoundButton label="Quitar un huésped" disabled={guests <= MIN_GUESTS} onClick={() => setGuests((g) => Math.max(MIN_GUESTS, g - 1))}>
                  −
                </RoundButton>
                <p className="w-9 text-center font-serif text-[1.6rem] leading-none text-forest lining-nums tabular-nums" aria-live="polite">
                  <span className="sr-only">Huéspedes: </span>
                  {guests}
                </p>
                <RoundButton label="Añadir un huésped" disabled={guests >= MAX_GUESTS} onClick={() => setGuests((g) => Math.min(MAX_GUESTS, g + 1))}>
                  +
                </RoundButton>
              </div>
            </div>
            <button
              ref={mobileSubmit}
              type="button"
              disabled={!allValid}
              onClick={sendQuery}
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-forest px-6 text-sm font-semibold text-ivory transition-[background-color,opacity,transform] duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
            >
              {copy.booking.submit}
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        )}

        <div
          ref={viewport}
          className={`step-height relative -mx-1 mt-4 overflow-hidden px-1 ${step < 3 ? "hidden lg:block" : ""}`}
          style={{ height: height ?? undefined }}
        >
          {prev !== null && (
            <div
              aria-hidden="true"
              inert
              className="step-exit absolute inset-x-1 top-0 hidden lg:block"
              style={{ "--dir": dir } as React.CSSProperties}
            >
              {renderStep(prev)}
            </div>
          )}
          <div
            key={step}
            ref={current}
            className={`pb-1 ${prev !== null ? "step-enter" : ""}`}
            style={{ "--dir": dir } as React.CSSProperties}
          >
            {renderStep(step)}
          </div>
        </div>

        <div className={`mt-6 items-center gap-3 ${step < 3 ? "hidden lg:flex" : "flex"}`}>
          {step > 0 && (
            <button
              type="button"
              onClick={() => goTo(step === 3 ? 2 : ((step - 1) as Step))}
              className="h-12 shrink-0 rounded-full px-4 text-sm font-semibold text-forest transition-colors hover:bg-forest/5"
            >
              <span aria-hidden="true">← </span>
              {step === 3 ? copy.booking.done.edit : copy.booking.back}
            </button>
          )}
          {step < 3 && (
            <button
              type="submit"
              disabled={!canContinue}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-forest px-6 text-sm font-semibold text-ivory transition-[background-color,opacity,transform] duration-300 hover:bg-forest-deep active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
            >
              {primaryLabel}
              <span aria-hidden="true">{step === 2 ? "↗" : "→"}</span>
            </button>
          )}
          {step === 3 && opened && (
            <a
              href={buildWhatsAppUrl(site.whatsapp.number, message)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 flex-1 items-center justify-center rounded-full bg-forest px-6 text-sm font-semibold text-ivory transition-colors hover:bg-forest-deep"
            >
              Abrir WhatsApp de nuevo
            </a>
          )}
        </div>
      </form>

      {sheet && (
        <BottomSheet open={sheet.open} title={sheetText.title} body={sheetText.body} onClose={closeSheet}>
          <RangeCalendar
            key={sheet.id}
            label={sheetText.label}
            from={arrival}
            to={departure}
            min={sheetIsArrival ? today : addDays(arrival, 1)}
            month={(sheetIsArrival ? arrival : departure) || arrival}
            onPick={onSheetPick}
          />
        </BottomSheet>
      )}
      </div>
    </dialog>
  );
}

function DateTile({
  ref,
  label,
  value,
  onClick,
}: {
  ref?: React.Ref<HTMLButtonElement>;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label={`${label}: ${value ? formatDate(value) : copy.booking.summary.empty}`}
      className="min-w-0 flex-1 rounded-2xl border border-forest/15 bg-white px-4 py-2.5 text-left transition-[border-color,transform] duration-150 hover:border-forest/40 active:scale-[0.98]"
    >
      <span className="block text-xs font-semibold text-olive-deep">{label}</span>
      <span className={`mt-0.5 block truncate font-serif text-[1.4rem] leading-tight lining-nums ${value ? "text-forest" : "text-olive-deep"}`}>
        {value ? shortDate(value) : copy.booking.summary.empty}
      </span>
    </button>
  );
}

function StepHeading({ title, body }: { title: string; body: string }) {
  return (
    <>
      <h2 className="font-serif text-[2rem] leading-[1.05] text-forest">{title}</h2>
      {body && <p className="mt-2 text-[0.95rem] leading-snug text-charcoal/75">{body}</p>}
    </>
  );
}

function RoundButton({
  label,
  children,
  autofocus,
  ...props
}: {
  label: string;
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
  autofocus?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      data-autofocus={autofocus || undefined}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-forest/20 bg-white text-xl text-forest transition-[background-color,opacity,transform] duration-200 hover:bg-forest hover:text-ivory active:scale-90 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-forest"
      {...props}
    >
      {children}
    </button>
  );
}
