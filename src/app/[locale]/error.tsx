'use client';

import { RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { buttonStyles } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

/**
 * Límite de error del segmento de idioma.
 *
 * Muestra un mensaje traducido en lugar de la pantalla de error genérica de
 * Next y nunca imprime el stack: en producción el detalle va al servidor,
 * no a la pantalla del visitante.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  useEffect(() => {
    console.error('[app] error no controlado:', error);
  }, [error]);

  return (
    <main className="container-page flex min-h-dvh flex-col items-center justify-center py-24 text-center">
      <h1 className="text-[length:var(--text-fluid-xl)]">{t('title')}</h1>
      <p className="text-muted mt-3 max-w-md">{t('description')}</p>

      {/* El `digest` permite correlacionar el error con el log del servidor
          sin exponer nada del stack al visitante. */}
      {error.digest ? (
        <p className="text-muted/70 mt-2 font-mono text-xs">ref: {error.digest}</p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className={buttonStyles({ variant: 'solid' })}>
          <RotateCcw className="size-4" aria-hidden="true" />
          {t('retry')}
        </button>
        <Link href="/" className={buttonStyles({ variant: 'outline' })}>
          {t('home')}
        </Link>
      </div>
    </main>
  );
}
