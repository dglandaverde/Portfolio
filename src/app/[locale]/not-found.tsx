import { useTranslations } from 'next-intl';

import { buttonStyles } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

export default function LocaleNotFound() {
  const t = useTranslations('notFound');

  return (
    <main className="container-page flex min-h-dvh flex-col items-center justify-center py-24 text-center">
      <p className="text-accent font-display text-[clamp(4rem,18vw,9rem)] leading-none font-extrabold">
        {t('code')}
      </p>
      <h1 className="mt-4 text-[length:var(--text-fluid-xl)]">{t('title')}</h1>
      <p className="text-muted mt-3 max-w-md">{t('description')}</p>
      <Link href="/" className={buttonStyles({ variant: 'solid', size: 'lg', className: 'mt-8' })}>
        {t('cta')}
      </Link>
    </main>
  );
}
