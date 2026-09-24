import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { GithubIcon } from '@/components/icons';
import { Reveal } from '@/components/ui/reveal';
import { Section, SectionHeading } from '@/components/ui/section';
import { projects } from '@/content/site';

/* ════════════════════════════════════════════════════════════════
   SECCIÓN «MIS PROYECTOS»
   ════════════════════════════════════════════════════════════════
   Tarjetas de los trabajos realizados. Cada una muestra imagen, título,
   descripción, tecnologías empleadas y enlaces al código y a la versión
   publicada.

   Los botones «Ver código» y «Ver en vivo» sólo aparecen cuando el
   proyecto declara esa dirección: al omitir `sourceUrl` o `liveUrl` en
   src/content/site.ts, ese botón no se dibuja.

   El procedimiento para añadir un proyecto está en el README, sección
   «Añadir un proyecto»; no requiere modificar este fichero.

   La rejilla usa 3 columnas en escritorio, 2 en tablet y 1 en móvil.
   ════════════════════════════════════════════════════════════════ */
export function Projects() {
  const t = useTranslations('projects');

  return (
    <Section id="projects">
      <SectionHeading
        id="projects-heading"
        lead={t('titleLead')}
        accent={t('titleAccent')}
        subtitle={t('subtitle')}
      />

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <Reveal
            as="li"
            key={project.id}
            index={index}
            className="card-glass group card-hover flex flex-col overflow-hidden"
          >
            <div className="bg-accent-soft relative aspect-video overflow-hidden">
              <Image
                src={project.image}
                alt={t(`items.${project.id}.imageAlt`)}
                width={project.imageWidth}
                height={project.imageHeight}
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="size-full object-contain p-6 transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-105"
              />
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-lg font-bold">{t(`items.${project.id}.title`)}</h3>
              <p className="text-muted mt-2 flex-1 text-sm leading-relaxed">
                {t(`items.${project.id}.description`)}
              </p>

              <ul className="mt-4 flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <li
                    key={tech}
                    className="bg-accent-soft text-accent rounded-full px-2.5 py-1 text-xs font-semibold"
                  >
                    {tech}
                  </li>
                ))}
              </ul>

              <div className="border-border mt-5 flex gap-5 border-t pt-1">
                {project.sourceUrl ? (
                  <a
                    href={project.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-accent inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold transition-colors"
                  >
                    <GithubIcon className="size-4" />
                    {t('viewSource')}
                    <span className="sr-only">{t('opensInNewTab')}</span>
                  </a>
                ) : null}

                {project.liveUrl ? (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-accent inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold transition-colors"
                  >
                    <ExternalLink className="size-4" aria-hidden="true" />
                    {t('viewLive')}
                    <span className="sr-only">{t('opensInNewTab')}</span>
                  </a>
                ) : null}
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
