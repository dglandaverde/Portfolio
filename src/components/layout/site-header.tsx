'use client';

import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { navSections } from '@/content/site';
import { useActiveSection } from '@/lib/hooks/use-active-section';
import { useScrolled } from '@/lib/hooks/use-scrolled';
import { cn } from '@/lib/utils';

/* ════════════════════════════════════════════════════════════════
   CABECERA DE LA WEB (la barra de arriba, siempre visible)
   ════════════════════════════════════════════════════════════════
   Contiene el logo, el menú de navegación, el selector de idioma y el
   botón de tema.

   Se comporta de dos formas según el ancho de pantalla:
     · ESCRITORIO (lg en adelante): el menú se muestra en horizontal.
     · MÓVIL Y TABLET: el menú se repliega tras el botón de hamburguesa y
       se despliega como panel lateral desde la derecha.

   Los nombres del menú proceden de src/messages/*.json, clave "nav". Las
   secciones enlazadas salen de `navSections` en src/content/site.ts:
   una entrada nueva allí aparece aquí automáticamente.
   ════════════════════════════════════════════════════════════════ */
export function SiteHeader() {
  const t = useTranslations('nav'); // Textos del menú

  // Estado del panel lateral en móvil: abierto o cerrado.
  const [menuOpen, setMenuOpen] = useState(false);

  // Sección visible actualmente, para resaltarla en el menú.
  const activeSection = useActiveSection('home');

  // Indica si la página está desplazada, para dar fondo a la cabecera.
  const scrolled = useScrolled();

  const panelRef = useRef<HTMLDivElement>(null); // El panel del móvil
  const toggleRef = useRef<HTMLButtonElement>(null); // El botón hamburguesa

  /** Cierra el menú lateral del móvil. */
  const close = useCallback(() => setMenuOpen(false), []);

  /* ─── Cerrar el menú con la tecla Escape ───────────────────────
     Devuelve además el foco al botón que lo abrió. Sin ello, la
     navegación por teclado queda descolgada al final del documento. */
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        toggleRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, close]);

  /* ─── Bloquear el desplazamiento del fondo ─────────────────────
     Con el menú abierto, la página de detrás no debe desplazarse: de lo
     contrario, al arrastrar el dedo se mueve el contenido bajo el panel. */
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  /* ─── Cerrar al tocar fuera del panel ──────────────────────────
     Comprueba que la pulsación no haya ocurrido dentro del panel ni en
     el botón de hamburguesa; en esos dos casos no debe cerrarse. */
  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      close();
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menuOpen, close]);

  /* ─── Llevar el foco al primer enlace al abrir ─────────────────
     Permite que la navegación por teclado entre directamente en el menú,
     sin recorrer toda la página con el tabulador. */
  useEffect(() => {
    if (!menuOpen) return;
    panelRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
  }, [menuOpen]);

  return (
    <>
      {/* ─── ENLACE «SALTAR AL CONTENIDO» ─────────────────────────
          Invisible hasta que se navega con el tabulador. Permite a quien
          usa teclado o lector de pantalla omitir el menú e ir directo al
          contenido, en lugar de recorrer los seis enlaces cada vez.
          Es un requisito de accesibilidad (WCAG 2.4.1). */}
      <a
        href="#main"
        className="bg-accent text-accent-contrast focus-visible:ring-ring sr-only rounded-full px-5 py-3 font-semibold focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100]"
      >
        {t('skipToContent')}
      </a>

      <header
        className={cn(
          // z-60 la mantiene por encima del panel móvil (z-50): así el botón
          // de cerrar sigue visible y pulsable con el menú abierto. Sin esto
          // sólo se podía cerrar con Escape o tocando fuera.
          'fixed inset-x-0 top-0 z-60 transition-all duration-300',
          scrolled
            ? 'border-border bg-background/80 border-b shadow-sm backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-3 sm:h-18">
          <a
            href="#home"
            className="font-display text-accent shrink-0 text-lg font-bold tracking-tight sm:text-xl"
          >
            {'<DL />'}
          </a>

          {/* ─── MENÚ DE ESCRITORIO ───────────────────────────────
              Oculto en móvil (`hidden`) y visible desde pantalla grande
              (`lg:block`). El enlace de la sección visible se resalta en
              azul automáticamente. */}
          <nav aria-label={t('ariaLabel')} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navSections.map((section) => {
                const isActive = activeSection === section;
                return (
                  <li key={section}>
                    <a
                      href={`#${section}`}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'relative rounded-full px-3.5 py-2 text-sm font-semibold transition-colors',
                        isActive
                          ? 'text-accent bg-accent-soft'
                          : 'text-muted hover:text-accent hover:bg-accent-soft',
                      )}
                    >
                      {t(section)}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <LocaleSwitcher />
            <ThemeToggle />

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? t('menuClose') : t('menuOpen')}
              className="hover:bg-accent-soft hover:text-accent text-foreground inline-flex size-10 items-center justify-center rounded-full transition-colors lg:hidden"
            >
              {menuOpen ? (
                <X className="size-6" aria-hidden="true" />
              ) : (
                <Menu className="size-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ─── FONDO OSCURO DEL MENÚ MÓVIL ──────────────────────────
          Capa translúcida que cubre la página con el menú abierto. Al
          pulsarla, el menú se cierra. */}
      <div
        aria-hidden="true"
        onClick={close}
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <div
        ref={panelRef}
        id="mobile-nav"
        /* ─── PANEL LATERAL DEL MENÚ MÓVIL ────────────────────────
           Permanece siempre en el documento, pero fuera de la pantalla
           (`translate-x-full`). Al abrirse se desliza hasta su posición.

           `inert` lo desactiva por completo mientras está cerrado: no es
           alcanzable con el tabulador ni lo anuncian los lectores de
           pantalla. Usar `hidden` rompería la animación de entrada. */
        inert={!menuOpen}
        className={cn(
          'bg-background-elevated border-border fixed top-0 right-0 z-50 h-dvh w-[min(20rem,85vw)] border-l shadow-2xl transition-transform duration-300 ease-[var(--ease-out-soft)] lg:hidden',
          menuOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <nav aria-label={t('ariaLabel')} className="flex h-full flex-col px-6 pt-24 pb-10">
          <ul className="flex flex-col gap-1">
            {navSections.map((section) => {
              const isActive = activeSection === section;
              return (
                <li key={section}>
                  <a
                    href={`#${section}`}
                    onClick={close}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'flex min-h-12 items-center rounded-xl px-4 text-base font-semibold transition-colors',
                      isActive
                        ? 'bg-accent-soft text-accent'
                        : 'text-foreground hover:bg-accent-soft hover:text-accent',
                    )}
                  >
                    {t(section)}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
