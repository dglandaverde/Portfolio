import createNextIntlPlugin from 'next-intl/plugin';

import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * `next dev` y `next build` tienen necesidades distintas: el servidor de
 * desarrollo usa `eval()` y WebSockets que en producción no existen. Este
 * flag es lo que permite endurecer producción sin romper el desarrollo.
 */
const isDev = process.env.NODE_ENV === 'development';

/**
 * Content-Security-Policy.
 *
 * Decisión deliberada: el sitio se genera de forma estática y se sirve desde
 * la CDN, por lo que NO se usa CSP basada en nonce (que obligaría a renderizar
 * cada petición en el servidor). A cambio se cierra todo lo demás al máximo:
 * sin `object-src`, sin `base-uri` ajeno, sin framing y con `form-action`
 * restringido al propio origen. El único relajamiento permanente es
 * `'unsafe-inline'` en `script-src`, necesario para el arranque de Next.
 *
 * El sitio no carga NINGÚN script de terceros, por lo que la superficie real
 * de XSS es nula. Ver SECURITY.md para la ruta de migración a nonce.
 *
 * Lo que sólo se permite en desarrollo, y nunca llega a producción:
 *
 *  · `'unsafe-eval'` — React lo necesita en modo desarrollo para reconstruir
 *    las pilas de llamadas y otras ayudas de depuración. En producción React
 *    no usa `eval()` jamás, así que ahí queda prohibido.
 *
 *  · `ws:` y `wss:` en `connect-src` — el recargado en caliente (HMR) del
 *    servidor de desarrollo abre un WebSocket contra el propio host.
 *
 *  · `upgrade-insecure-requests` se OMITE en desarrollo: en local se sirve
 *    por http y esa directiva intentaría ascender las peticiones a https.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "manifest-src 'self'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },

  /*
   * HSTS sólo en producción, y esto NO es cosmético.
   *
   * `localhost` se sirve por http. Si el navegador recibiera aquí una
   * cabecera HSTS, recordaría durante dos años que localhost debe ir por
   * https y rompería el arranque de CUALQUIER otro proyecto local, no sólo
   * de éste. Revertirlo obliga a limpiar el estado HSTS del navegador a mano.
   */
  ...(isDev
    ? []
    : [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]),

  // Impide que el navegador adivine el MIME type (vector de XSS por upload).
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Redundante con frame-ancestors, pero cubre navegadores antiguos.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Revoca APIs del navegador que este sitio no necesita.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // No filtrar la versión del framework en las cabeceras de respuesta.
  poweredByHeader: false,

  // Sirve /ruta en lugar de /ruta/ de forma consistente (evita 308 y SEO duplicado).
  trailingSlash: false,

  experimental: {
    // Importa sólo los iconos usados en lugar del barrel completo.
    optimizePackageImports: ['lucide-react'],
  },

  images: {
    // AVIF primero, WebP como respaldo.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // El CV es inmutable entre despliegues: cachearlo agresivamente.
        source: '/documents/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, must-revalidate' }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
