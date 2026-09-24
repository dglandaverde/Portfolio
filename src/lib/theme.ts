export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';
export const THEME_ATTRIBUTE = 'data-theme';

/** El portafolio nace oscuro; el claro es una elección explícita. */
export const DEFAULT_THEME: Theme = 'dark';

/**
 * Lee la preferencia guardada.
 * `localStorage` lanza en navegación privada o con el almacenamiento
 * bloqueado; ante el fallo se responde «sin preferencia».
 */
export function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function readAppliedTheme(): Theme {
  return document.documentElement.getAttribute(THEME_ATTRIBUTE) === 'light' ? 'light' : 'dark';
}

/**
 * Deja el DOM acorde a la preferencia guardada.
 *
 * Es idempotente y sólo escribe si el valor cambió, para no disparar
 * mutaciones inútiles en los observadores que vigilan el atributo.
 */
export function applyStoredTheme(): void {
  const target = readStoredTheme() ?? DEFAULT_THEME;
  if (document.documentElement.getAttribute(THEME_ATTRIBUTE) !== target) {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, target);
  }
}

export function persistTheme(theme: Theme): void {
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* preferencia no persistida: el tema ya se aplicó en esta sesión */
  }
}
