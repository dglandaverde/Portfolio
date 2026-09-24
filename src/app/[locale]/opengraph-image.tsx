import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';

import { hasLocale } from 'next-intl';

import { siteConfig } from '@/content/site';
import { routing } from '@/i18n/routing';

/**
 * Imagen Open Graph generada en tiempo de build, una por idioma.
 *
 * Se dibuja con `ImageResponse` en lugar de mantener un PNG a mano: el texto
 * sale de los mismos ficheros de traducción, así que nunca se desincroniza
 * del contenido del sitio.
 */
export const alt = `${siteConfig.name} — ${siteConfig.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: requested } = await params;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        background: '#121212',
        backgroundImage:
          'radial-gradient(circle at 80% 15%, rgba(89,178,244,0.22), transparent 55%)',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', fontSize: 30, color: '#59b2f4', fontWeight: 700 }}>
        {'<DL />'}
      </div>

      <div
        style={{
          display: 'flex',
          marginTop: 24,
          fontSize: 76,
          fontWeight: 800,
          color: '#f5f5f5',
          letterSpacing: '-0.02em',
        }}
      >
        {siteConfig.name}
      </div>

      <div style={{ display: 'flex', marginTop: 12, fontSize: 40, color: '#59b2f4' }}>
        {siteConfig.role}
      </div>

      <div
        style={{
          display: 'flex',
          marginTop: 28,
          fontSize: 26,
          color: '#a1a1aa',
          lineHeight: 1.45,
          maxWidth: 900,
        }}
      >
        {t('description')}
      </div>

      <div
        style={{
          display: 'flex',
          marginTop: 'auto',
          height: 8,
          width: 180,
          borderRadius: 999,
          background: '#59b2f4',
        }}
      />
    </div>,
    size,
  );
}
