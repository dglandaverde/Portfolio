import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Nunito, Ubuntu } from 'next/font/google';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { ThemeScript } from '@/components/layout/theme-script';
import { ThemeSync } from '@/components/layout/theme-sync';
import { buildPersonJsonLd, siteConfig } from '@/content/site';
import { localeMetadata, routing, type Locale } from '@/i18n/routing';
import { publicEnv } from '@/lib/env/public';

import type { Metadata, Viewport } from 'next';

import '../globals.css';

/**
 * Fuentes auto-alojadas.
 *
 * `next/font` descarga los ficheros en tiempo de build y los sirve desde el
 * propio dominio. Frente al `@import` de Google Fonts del portafolio
 * original esto elimina una conexión a un tercero, quita una petición
 * bloqueante del render y permite mantener `font-src 'self'` en la CSP.
 * `display: swap` muestra texto con la fuente de respaldo mientras carga.
 */
const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
});

// Ubuntu sólo se usa en titulares, y siempre en negrita: cargar 400 y 500
// era descargar dos ficheros que ninguna regla CSS llegaba a aplicar.
const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
  variable: '--font-ubuntu',
});

/* ════════════════════════════════════════════════════════════════
   ESTRUCTURA BASE DE LA PÁGINA
   ════════════════════════════════════════════════════════════════
   Construye el armazón que envuelve a todo lo demás: las etiquetas
   <html> y <body>, las tipografías y la información que buscadores y
   redes sociales leen del sitio (título, descripción, vista previa…).

   Se ejecuta antes que cualquier otra cosa, una vez por idioma.
   ════════════════════════════════════════════════════════════════ */

/**
 * Genera una versión del sitio por idioma en el momento de publicar.
 *
 * Gracias a esto /es y /en son ficheros ya resueltos, servidos desde la
 * CDN, en lugar de calcularse en cada visita.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Ajustes del navegador: encaje del sitio en la pantalla y color de la
 * barra superior en móvil según el tema activo.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Sin `maximumScale`: impedir el zoom es una barrera de accesibilidad.
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f8fb' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
};

/**
 * Información para buscadores y redes sociales.
 *
 * De aquí sale lo que se muestra al compartir el sitio en LinkedIn,
 * WhatsApp o X —título, descripción e imagen de vista previa— y también
 * lo que aparece en los resultados de búsqueda.
 *
 * Los textos proceden de src/messages/*.json, clave "metadata", de modo
 * que cada idioma tiene los suyos.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: requested } = await params;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t('title'),
      template: t('titleTemplate'),
    },
    description: t('description'),
    keywords: t('keywords')
      .split(',')
      .map((keyword) => keyword.trim()),
    authors: [{ name: siteConfig.name, url: siteUrl }],
    creator: siteConfig.name,
    applicationName: siteConfig.name,

    alternates: {
      canonical: `/${locale}`,
      // `hreflang` evita que los buscadores traten ES y EN como contenido
      // duplicado y sirve a cada usuario la versión de su idioma.
      languages: {
        ...Object.fromEntries(
          routing.locales.map((option) => [localeMetadata[option].htmlLang, `/${option}`]),
        ),
        'x-default': `/${routing.defaultLocale}`,
      },
    },

    openGraph: {
      type: 'website',
      locale: localeMetadata[locale].ogLocale,
      alternateLocale: routing.locales
        .filter((option) => option !== locale)
        .map((option) => localeMetadata[option].ogLocale),
      url: `${siteUrl}/${locale}`,
      siteName: siteConfig.name,
      title: t('title'),
      description: t('description'),
    },

    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      creator: '@dennis_land10',
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },

    icons: {
      // El SVG escala a cualquier densidad; el PNG de 32px es el respaldo
      // para navegadores que aún no aceptan favicons vectoriales.
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      ],
      // `apple-icon.tsx` genera el de iOS; Next lo enlaza automáticamente.
    },

    formatDetection: { telephone: false, address: false, email: false },
  };
}

/** Construye el armazón HTML de la página. */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: requested } = await params;

  if (!hasLocale(routing.locales, requested)) {
    notFound();
  }

  const locale: Locale = requested;

  // Habilita el renderizado estático: sin esto, next-intl marca la ruta
  // como dinámica y se pierde la generación en build.
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'metadata' });

  /* Datos estructurados: bloque invisible que declara a los buscadores
     que el sitio corresponde a una persona concreta, con su nombre, su
     puesto y sus perfiles. Es lo que permite que la reconozcan como tal
     y no como una página genérica. */
  const jsonLd = buildPersonJsonLd(publicEnv.NEXT_PUBLIC_SITE_URL, locale, t('description'));

  return (
    <html
      lang={localeMetadata[locale].htmlLang}
      // Aquí NO va el tema. El oscuro es el valor por defecto del CSS y el
      // claro lo marca `ThemeScript` en `data-theme`, fuera del alcance de
      // React: si viviera en `className`, React lo borraría al remontar este
      // layout al cambiar de idioma.
      className={`${nunito.variable} ${ubuntu.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Aplica el tema guardado antes del primer pintado, para evitar
            el destello al pasar de oscuro a claro. Ver theme-script.tsx. */}
        <ThemeScript />
        <script
          type="application/ld+json"
          // JSON-LD generado en el servidor a partir de datos propios;
          // no hay entrada de usuario en este objeto.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-dvh antialiased">
        {/* Repone `data-theme` tras cada renderizado: React vacía los
            atributos de <html> al remontar este layout al cambiar de idioma. */}
        <ThemeSync />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
