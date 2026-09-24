'use client';

import { Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useLayoutEffect, useTransition } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { localeMetadata, routing, type Locale } from '@/i18n/routing';
import {
  consumePendingSection,
  getCurrentSectionId,
  jumpToSection,
  rememberSection,
} from '@/lib/scroll';
import { cn } from '@/lib/utils';

/* ════════════════════════════════════════════════════════════════
   SELECTOR DE IDIOMA (los botones ES / EN de la cabecera)
   ════════════════════════════════════════════════════════════════
   Alterna el sitio entre español e inglés.

   Al pulsar, la dirección pasa de /es a /en (o a la inversa) y todos los
   textos se recargan en el otro idioma, leídos de src/messages/es.json y
   en.json.

   Lleva 'use client' arriba porque necesita responder a pulsaciones: los
   componentes sin esa marca se generan en el servidor y no reaccionan.
   ════════════════════════════════════════════════════════════════ */

/**
 * Selecciona la forma adecuada de ejecutar código justo antes del pintado.
 *
 * `useLayoutEffect` se ejecuta antes de que el navegador dibuje, que es
 * lo necesario para recolocar la página sin que se perciba el salto. En
 * el servidor no hay pantalla que medir y React emite un aviso, así que
 * allí se recurre a `useEffect`, que resulta inofensivo.
 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations('localeSwitcher'); // Textos del propio selector
  const locale = useLocale() as Locale; // Idioma activo
  const router = useRouter(); // Para navegar entre idiomas
  const pathname = usePathname(); // Dirección actual, sin el prefijo /es o /en
  const [isPending, startTransition] = useTransition(); // Activo durante la carga

  /* ─── Restauración de la sección de lectura ─────────────────────
     Al cambiar de idioma, React vuelve a montar la página entera y este
     componente se destruye y se recrea. De ahí que la sección no se
     guarde aquí dentro —se perdería— sino en src/lib/scroll.ts.

     Este bloque corre cuando el componente se monta de nuevo, ya con el
     idioma cargado: recupera la sección anotada y desplaza hasta ella.
     Sin él, cambiar de idioma devolvía al principio de la página. */
  useIsomorphicLayoutEffect(() => {
    const anchor = consumePendingSection();
    if (anchor) jumpToSection(anchor);
  }, []);

  /* ─── MÉTODO PARA CAMBIAR DE IDIOMA ─────────────────────────────
     Se invoca al pulsar ES o EN y realiza tres pasos en este orden:
       1. anota la sección que se estaba leyendo,
       2. navega a la misma ruta en el otro idioma,
       3. `scroll: false` impide que Next salte al inicio de la página.
     La vuelta a la sección la realiza el bloque anterior. */
  function switchTo(next: Locale) {
    // Sin efecto si ya es el idioma activo o si hay un cambio en curso.
    if (next === locale || isPending) return;

    rememberSection(getCurrentSectionId());

    startTransition(() => {
      router.replace(pathname, { locale: next, scroll: false });
    });
  }

  return (
    <div
      /* `role="group"` junto con `aria-label` agrupan ambos botones para
         que un lector de pantalla los anuncie como «Cambiar idioma» en
         lugar de como dos botones sueltos llamados ES y EN. */
      role="group"
      aria-label={t('label')}
      className={cn(
        'border-border bg-surface inline-flex items-center gap-0.5 rounded-full border p-0.5',
        isPending && 'opacity-60', // Se atenúa mientras carga el otro idioma
        className,
      )}
    >
      {/* Iconito de idioma, sólo decorativo */}
      <Languages className="text-muted ml-2 size-4 shrink-0" aria-hidden="true" />

      {/* Un botón por idioma. La lista procede de src/i18n/routing.ts:
          un idioma añadido allí genera su botón aquí automáticamente. */}
      {routing.locales.map((option) => {
        const isActive = option === locale;
        return (
          <button
            key={option}
            type="button"
            /* `lang` declara el idioma de esta palabra concreta, para que
               un lector de pantalla la pronuncie correctamente. */
            lang={option}
            onClick={() => switchTo(option)}
            /* Señala el idioma activo, también para lectores de pantalla. */
            aria-current={isActive ? 'true' : undefined}
            /* El botón sólo muestra «ES»; esto lo anuncia como «Español». */
            aria-label={localeMetadata[option].label}
            className={cn(
              'min-h-8 rounded-full px-2.5 text-xs font-bold transition-colors',
              isActive
                ? 'bg-accent text-accent-contrast' // idioma activo: relleno azul
                : 'text-muted hover:text-accent hover:bg-accent-soft', // el otro
            )}
          >
            {localeMetadata[option].short}
          </button>
        );
      })}
    </div>
  );
}
