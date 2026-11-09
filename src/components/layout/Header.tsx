"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  // Por debajo de 1024 px el logotipo principal está en la portada: el de la barra aparece cuando
  // aquel ha pasado por debajo, para que nunca se vean los dos.
  const [pastLogo, setPastLogo] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);
  const topRef = useRef<HTMLSpanElement>(null);
  const logoRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const topObserver = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    const logoObserver = new IntersectionObserver(([entry]) => setPastLogo(!entry.isIntersecting));
    if (topRef.current) topObserver.observe(topRef.current);
    if (logoRef.current) logoObserver.observe(logoRef.current);

    return () => {
      topObserver.disconnect();
      logoObserver.disconnect();
    };
  }, []);

  const openMenu = () => {
    menuRef.current?.showModal();
    document.documentElement.style.overflow = "hidden";
  };
  const closeMenu = () => menuRef.current?.close();
  const onMenuClose = () => {
    document.documentElement.style.overflow = "";
  };

  return (
    <>
      {/* Marcadores propios del navbar, sin depender de la portada: los primeros 40 px del documento
          y el tramo que ocupa el logotipo de la portada en móvil. */}
      <span ref={topRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-10 w-1" />
      <span ref={logoRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-[45svh] w-1" />

      <a
        href="#contenido"
        className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-ivory transition-transform focus:translate-y-0"
      >
        Saltar al contenido
      </a>

      {/* En móvil la barra deja pasar los toques: el botón del vídeo está bajo su esquina izquierda. */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 text-ivory lg:pointer-events-auto">
        {/* El fondo baja desde arriba como una capa propia: el logotipo y los enlaces no se mueven. */}
        <span
          data-nav-panel
          data-ui
          aria-hidden="true"
          className={`pointer-events-auto absolute inset-0 -z-10 bg-forest transition-transform duration-500 ease-soft motion-reduce:transition-none ${
            scrolled ? "translate-y-0 shadow-[0_10px_24px_-18px_rgb(18_30_22/0.6)]" : "-translate-y-full"
          }`}
        />
        <Container className="flex h-16 items-center justify-between gap-4 lg:grid lg:h-[5.5rem] lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
          <a
            href="#inicio"
            aria-label={`${site.name}, ir al inicio`}
            className={`pointer-events-auto shrink-0 justify-self-start transition-[opacity,visibility] duration-500 ease-soft ${pastLogo ? "" : "max-lg:invisible max-lg:opacity-0"}`}
          >
            <Image
              src={site.logo.src}
              alt=""
              width={site.logo.width}
              height={site.logo.height}
              sizes="(min-width: 1024px) 110px, 78px"
              loading="eager"
              className="h-12 w-auto object-contain lg:h-[68px]"
            />
          </a>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-6 text-sm xl:gap-9">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="py-2 underline decoration-transparent decoration-1 underline-offset-8 opacity-90 transition-[opacity,text-decoration-color] duration-500 hover:decoration-current hover:opacity-100"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="pointer-events-auto flex items-center gap-2 justify-self-end sm:gap-3">
            <ButtonLink
              href={site.bookingAnchor}
              variant={scrolled ? "light" : "outline-light"}
              className="!min-h-10 whitespace-nowrap !px-4 text-[0.8125rem] sm:!min-h-11 sm:!px-6 sm:text-sm"
            >
              <span className="sm:hidden">Consultar</span>
              <span className="hidden sm:inline">Consultar disponibilidad</span>
            </ButtonLink>

            <button
              type="button"
              onClick={openMenu}
              aria-haspopup="dialog"
              className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
            >
              <span className="sr-only">Abrir menú</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M3 8h18M9 16h12" />
              </svg>
            </button>
          </div>
        </Container>
      </header>

      <dialog
        ref={menuRef}
        onClose={onMenuClose}
        aria-label="Menú de navegación"
        className="menu-panel m-0 h-dvh max-h-none w-full max-w-none bg-forest p-0 text-ivory backdrop:bg-transparent"
      >
        <div className="flex h-full flex-col px-5 pb-10 pt-5 sm:px-8">
          <div className="flex h-11 items-center justify-between">
            <Image src={site.logo.src} alt={site.name} width={site.logo.width} height={site.logo.height} sizes="72px" className="h-11 w-auto object-contain" />
            <button
              type="button"
              onClick={closeMenu}
              className="-mr-2 flex h-11 w-11 items-center justify-center"
              autoFocus
            >
              <span className="sr-only">Cerrar menú</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
          </div>

          <nav aria-label="Móvil" className="mt-auto">
            <ul className="space-y-1">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={closeMenu}
                    className="flex items-baseline gap-4 py-2 font-serif text-[2.5rem] leading-tight"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <ButtonLink href={site.bookingAnchor} onClick={closeMenu} variant="light" className="mt-10 w-full">
            Consultar disponibilidad
          </ButtonLink>
          <p className="mt-6 text-center text-sm text-ivory/75">Pucallpa, Perú · Atención 24 horas</p>
        </div>
      </dialog>
    </>
  );
}
