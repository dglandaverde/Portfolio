import { defineRouting } from 'next-intl/routing';

/**
 * Configuración de enrutado internacionalizado.
 *
 * `localePrefix: 'always'` fuerza que toda URL lleve idioma (`/es/...`,
 * `/en/...`). Es lo que permite emitir `hreflang` correctos y evita que
 * Google indexe el mismo contenido bajo dos rutas distintas.
 */
export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'always',
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];

/** Metadatos de presentación por idioma (selector de idioma y `hreflang`). */
export const localeMetadata = {
  es: { label: 'Español', short: 'ES', htmlLang: 'es-SV', ogLocale: 'es_ES' },
  en: { label: 'English', short: 'EN', htmlLang: 'en-US', ogLocale: 'en_US' },
} as const satisfies Record<
  Locale,
  { label: string; short: string; htmlLang: string; ogLocale: string }
>;
