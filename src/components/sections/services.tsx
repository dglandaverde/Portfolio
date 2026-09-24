import { Code2, Database } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Reveal } from '@/components/ui/reveal';
import { Section, SectionHeading } from '@/components/ui/section';
import { services, type ServiceId } from '@/content/site';

const serviceIcons = {
  web: Code2,
  database: Database,
} as const satisfies Record<ServiceId, typeof Code2>;

/* ════════════════════════════════════════════════════════════════
   SECCIÓN «MIS SERVICIOS»
   ════════════════════════════════════════════════════════════════
   Servicios ofrecidos a un posible cliente o empleador.

   La lista procede de `services` (src/content/site.ts) y sus textos de
   "services.items" en src/messages/es.json y en.json. El icono de cada
   uno se asigna en `serviceIcons`, arriba en este mismo fichero.

   La rejilla se ajusta sola al número de servicios definidos.
   ════════════════════════════════════════════════════════════════ */
export function Services() {
  const t = useTranslations('services');

  return (
    <Section id="services">
      <SectionHeading
        id="services-heading"
        lead={t('titleLead')}
        accent={t('titleAccent')}
        subtitle={t('subtitle')}
      />

      <ul className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
        {services.map(({ id }, index) => {
          const Icon = serviceIcons[id];
          return (
            <Reveal
              as="li"
              key={id}
              index={index}
              className="card-glass group card-hover flex flex-col p-6"
            >
              <span className="bg-accent-soft text-accent inline-flex size-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{t(`items.${id}.title`)}</h3>
              <p className="text-muted mt-2 text-sm leading-relaxed">
                {t(`items.${id}.description`)}
              </p>
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}
