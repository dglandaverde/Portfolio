import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

/**
 * Resuelve idioma y mensajes para cada petición.
 *
 * Si el idioma solicitado no está soportado se cae al idioma por defecto en
 * lugar de lanzar un 404: una URL con idioma inválido debe seguir mostrando
 * el sitio.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'America/El_Salvador',
  };
});
