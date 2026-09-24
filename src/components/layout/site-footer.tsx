import { ArrowUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { socialIcons } from '@/components/icons';
import { siteConfig, socialLinks } from '@/content/site';

/* ════════════════════════════════════════════════════════════════
   PIE DE PÁGINA
   ════════════════════════════════════════════════════════════════
   Cierra el sitio. Contiene tres bloques que se apilan en móvil y se
   reparten en una fila en pantalla ancha:
     1. nombre y aviso de derechos (el año se calcula solo),
     2. iconos de los perfiles sociales,
     3. tecnologías empleadas y enlace para volver arriba.
   ════════════════════════════════════════════════════════════════ */
export function SiteFooter() {
  const t = useTranslations('footer');
  const tHero = useTranslations('hero');
  // Año actual, calculado al generar el sitio. Evita que el «© 2026» se
  // quede anticuado y tener que actualizarlo cada enero.
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-background-elevated border-t">
      <div className="container-page flex flex-col items-center gap-6 py-10 sm:flex-row sm:justify-between">
        {/* ─── BLOQUE 1 · Nombre y derechos ─────────────────────── */}
        <div className="text-center sm:text-left">
          <p className="font-display text-base font-bold">{siteConfig.name}</p>
          <p className="text-muted text-sm">
            © {year} · {t('rights')}
          </p>
        </div>

        {/* ─── BLOQUE 2 · Iconos de redes sociales ──────────────────
            Los mismos enlaces que en la portada: proceden de
            `socialLinks` en src/content/site.ts, de modo que se editan en
            un único lugar. */}
        <ul aria-label={tHero('socialLabel')} className="flex items-center gap-2">
          {socialLinks.map(({ platform, label, href }) => {
            const Icon = socialIcons[platform];
            return (
              <li key={platform}>
                <a
                  href={href}
                  target="_blank"
                  // `noopener` impide que la pestaña destino manipule esta vía
                  // `window.opener`; `noreferrer` no filtra la URL de origen.
                  rel="noopener noreferrer me"
                  aria-label={label}
                  className="text-muted hover:text-accent hover:bg-accent-soft inline-flex size-10 items-center justify-center rounded-full transition-colors"
                >
                  <Icon className="size-4.5" />
                </a>
              </li>
            );
          })}
        </ul>

        {/* ─── BLOQUE 3 · Tecnologías y volver arriba ───────────────
            El enlace «Volver arriba» apunta a #home, el id de la primera
            sección de la página. */}
        <div className="flex flex-col items-center gap-3 sm:items-end">
          <p className="text-muted text-xs">{t('builtWith')}</p>
          <a
            href="#home"
            className="text-muted hover:text-accent hover:bg-accent-soft inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors"
          >
            <ArrowUp className="size-3.5" aria-hidden="true" />
            {t('backToTop')}
          </a>
        </div>
      </div>
    </footer>
  );
}
