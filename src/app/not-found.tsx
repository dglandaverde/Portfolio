import Link from 'next/link';

import { routing } from '@/i18n/routing';

/**
 * 404 de la raíz, fuera de cualquier idioma.
 *
 * El middleware redirige toda ruta navegable a un prefijo de idioma, así que
 * aquí sólo llegan casos residuales. Se mantiene en texto neutro porque en
 * este punto todavía no se ha resuelto ningún idioma.
 */
export default function RootNotFound() {
  return (
    <html lang={routing.defaultLocale}>
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          background: '#121212',
          color: '#f5f5f5',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <p style={{ fontSize: '4rem', fontWeight: 800, color: '#59b2f4', margin: 0 }}>404</p>
        <p style={{ margin: 0, opacity: 0.8 }}>Page not found · Página no encontrada</p>
        <Link
          href={`/${routing.defaultLocale}`}
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem 1.75rem',
            borderRadius: 999,
            border: '2px solid #59b2f4',
            color: '#59b2f4',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Home · Inicio
        </Link>
      </body>
    </html>
  );
}
