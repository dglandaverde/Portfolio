import { routing } from '@/i18n/routing';
import { publicEnv } from '@/lib/env/public';

import type { MetadataRoute } from 'next';

/**
 * Sitemap con referencias cruzadas entre idiomas.
 *
 * Cada entrada declara sus alternativas en `languages`, que es como Google
 * entiende que `/es` y `/en` son la misma página en dos idiomas y no
 * contenido duplicado.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL;
  const lastModified = new Date();

  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${siteUrl}/${locale}`]),
  );

  return routing.locales.map((locale) => ({
    url: `${siteUrl}/${locale}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: locale === routing.defaultLocale ? 1 : 0.8,
    alternates: { languages },
  }));
}
