'use client';

import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useTheme } from '@/lib/hooks/use-theme';

/* ════════════════════════════════════════════════════════════════
   BOTÓN PARA CAMBIAR ENTRE TEMA OSCURO Y CLARO
   ════════════════════════════════════════════════════════════════
   Es el icono de sol/luna de la cabecera.

   Muestra un sol con el tema oscuro activo —pulsarlo lleva al claro— y
   una luna con el claro. Es decir, el icono representa el destino, no el
   estado actual.

   La lógica completa —leer el tema, guardarlo y aplicarlo— reside en
   src/lib/hooks/use-theme.ts. Aquí sólo está el botón.

   La elección se conserva entre visitas: el sitio se abre con el último
   tema seleccionado.
   ════════════════════════════════════════════════════════════════ */
export function ThemeToggle() {
  const t = useTranslations('theme');

  // `theme` contiene 'dark', 'light' o null mientras aún se desconoce.
  // `toggle` es la función que alterna entre ambos.
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      /* El botón sólo contiene un icono, sin texto. `aria-label` es lo
         que anuncia un lector de pantalla; `title`, el texto emergente al
         pasar el cursor. */
      aria-label={t('label')}
      title={t('label')}
      className="hover:bg-accent-soft hover:text-accent text-muted inline-flex size-10 items-center justify-center rounded-full transition-colors"
    >
      {/* Hasta que la página termina de cargar en el navegador se
          desconoce el tema elegido, ya que está guardado en el navegador
          y no en el servidor. Entretanto se reserva un hueco de las mismas
          dimensiones: así el botón no cambia de tamaño después ni asoma el
          icono equivocado durante un instante. */}
      {theme === null ? (
        <span className="size-5" aria-hidden="true" />
      ) : theme === 'dark' ? (
        <Sun className="size-5" aria-hidden="true" /> // Tema oscuro → sol
      ) : (
        <Moon className="size-5" aria-hidden="true" /> // Tema claro → luna
      )}
    </button>
  );
}
