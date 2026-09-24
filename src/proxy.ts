import createMiddleware from 'next-intl/middleware';

import { routing } from '@/i18n/routing';

/**
 * Proxy de petición (antes `middleware.ts`, renombrado en Next 16).
 *
 * Detecta el idioma preferido del visitante y lo redirige a `/es` o `/en`.
 */
export default createMiddleware(routing);

export const config = {
  /**
   * Quedan fuera del proxy:
   *  - `/api`          rutas de servidor (no se traducen)
   *  - `/_next`        artefactos del build
   *  - `/_vercel`      infraestructura de la plataforma
   *  - `/algo.ext`     cualquier fichero estático (imágenes, PDF, robots.txt…)
   */
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
