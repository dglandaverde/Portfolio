'use client';

import { useCallback, useSyncExternalStore } from 'react';

import { persistTheme, readAppliedTheme, THEME_ATTRIBUTE, type Theme } from '@/lib/theme';

/**
 * Estado del tema, leído directamente del DOM.
 *
 * El atributo `data-theme` de <html> es la única fuente de verdad: lo fija
 * `ThemeScript` antes del primer pintado y lo mantiene `ThemeSync` en cada
 * renderizado. `useSyncExternalStore` es la API pensada exactamente para
 * esto —suscribirse a un estado externo a React— y evita el renderizado en
 * cascada de llamar a `setState` dentro de un efecto.
 */
function subscribe(onStoreChange: () => void): () => void {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [THEME_ATTRIBUTE],
  });
  return () => observer.disconnect();
}

/**
 * En servidor no se conoce el tema: depende de `localStorage`, que sólo
 * existe en el navegador. Se devuelve `null` para que la interfaz reserve el
 * hueco del icono en lugar de apostar por el equivocado.
 */
function getServerSnapshot(): Theme | null {
  return null;
}

export function useTheme(): { theme: Theme | null; toggle: () => void } {
  const theme = useSyncExternalStore(subscribe, readAppliedTheme, getServerSnapshot);

  const toggle = useCallback(() => {
    // Se muta el atributo; el MutationObserver de `subscribe` avisa a React.
    persistTheme(readAppliedTheme() === 'dark' ? 'light' : 'dark');
  }, []);

  return { theme, toggle };
}
