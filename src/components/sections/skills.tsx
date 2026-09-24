import { useTranslations } from 'next-intl';

import { skillIcons } from '@/components/icons';
import { Reveal } from '@/components/ui/reveal';
import { Section, SectionHeading } from '@/components/ui/section';
import { skillGroups } from '@/content/site';

/* ════════════════════════════════════════════════════════════════
   SECCIÓN «MIS HABILIDADES»
   ════════════════════════════════════════════════════════════════
   Tecnologías dominadas, repartidas en tres bloques: Frontend, Backend
   y Datos y ERP.

   El agrupamiento es intencionado: en una lista plana, HTML quedaría al
   mismo nivel que JD Edwards y quien lee no distinguiría dónde encaja
   cada cosa. Así el alcance del perfil se aprecia de un vistazo.

   Añadir una habilidad requiere tres piezas:
     1. su id en `skillGroups` (src/content/site.ts), en el grupo que corresponda,
     2. su icono en src/components/icons/index.tsx,
     3. su nombre en "skills.items" de src/messages/es.json y en.json.
   Si falta alguna, la compilación se detiene indicando cuál.
   ════════════════════════════════════════════════════════════════ */
export function Skills() {
  const t = useTranslations('skills');

  return (
    <Section id="skills">
      <SectionHeading
        id="skills-heading"
        lead={t('titleLead')}
        accent={t('titleAccent')}
        subtitle={t('subtitle')}
      />

      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        {skillGroups.map((group, groupIndex) => (
          <Reveal key={group.id} index={groupIndex}>
            <div className="mb-5 flex items-center gap-4">
              <h3 className="text-accent text-sm font-bold tracking-[0.18em] uppercase">
                {t(`groups.${group.id}`)}
              </h3>
              {/* Línea de separación decorativa, oculta al lector de pantalla. */}
              <span aria-hidden="true" className="bg-border h-px flex-1" />
            </div>

            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {group.skills.map(({ id, color }) => {
                const Icon = skillIcons[id];
                return (
                  <li
                    key={id}
                    className="card-glass group card-hover flex items-center gap-3.5 p-4"
                  >
                    <Icon
                      // El color de marca sólo aparece al pasar el cursor; en
                      // reposo los iconos se integran en la paleta del sitio.
                      style={{ '--brand': color } as React.CSSProperties}
                      className="text-muted size-7 shrink-0 transition-colors duration-300 group-hover:text-[var(--brand)]"
                    />
                    <span className="text-sm font-bold sm:text-base">{t(`items.${id}`)}</span>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
