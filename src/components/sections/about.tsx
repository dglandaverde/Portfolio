import { Gauge, ShieldCheck, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Reveal } from '@/components/ui/reveal';
import { Section, SectionHeading } from '@/components/ui/section';

const highlights = [
  { key: 'focus', Icon: Target },
  { key: 'quality', Icon: ShieldCheck },
  { key: 'performance', Icon: Gauge },
] as const;

/* ════════════════════════════════════════════════════════════════
   SECCIÓN «SOBRE MÍ»
   ════════════════════════════════════════════════════════════════
   Presentación en un párrafo, seguida de tres tarjetas con los
   principios de trabajo: enfoque en producto, calidad de código y
   rendimiento.

   No lleva fotografía, de ahí que el párrafo vaya centrado a una sola
   columna. Añadir una imagen implicaría volver a un diseño de dos.

   El texto se edita en src/messages/es.json y en.json, clave "about".
   Las tres tarjetas se definen en el array `highlights` de arriba, con
   sus textos en "about.highlights" de esos mismos ficheros.
   ════════════════════════════════════════════════════════════════ */
export function About() {
  const t = useTranslations('about');

  return (
    <Section id="about">
      <SectionHeading id="about-heading" lead={t('titleLead')} accent={t('titleAccent')} />

      {/* Una sola columna centrada: sin fotografía que acompañe al texto, una
          rejilla de dos columnas dejaría un hueco vacío a un lado. */}
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="text-muted text-[length:var(--text-fluid-lg)] leading-relaxed text-balance">
          {t('body')}
        </p>
      </Reveal>

      <ul className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-3">
        {highlights.map(({ key, Icon }, index) => (
          <Reveal as="li" key={key} index={index} className="card-glass card-hover group p-6">
            <span className="bg-accent-soft text-accent inline-flex size-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold">{t(`highlights.${key}Title`)}</h3>
            <p className="text-muted mt-2 text-sm leading-relaxed">{t(`highlights.${key}Body`)}</p>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
