import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SectionProps {
  id: string;
  children: ReactNode;
  className?: string;
  /** Se enlaza con `aria-labelledby` para dar nombre accesible a la sección. */
  labelledBy?: string;
}

/**
 * Envoltura estándar de sección.
 *
 * NO lleva `scroll-mt`: la compensación de la cabecera fija la aporta
 * `scroll-padding-top` en <html>, que es el mecanismo canónico y cubre todos
 * los destinos de scroll, incluido el foco por teclado. Tener las dos cosas
 * duplicaba el hueco (192px en vez de 96) y hundía los títulos al navegar.
 */
export function Section({ id, children, className, labelledBy }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy ?? `${id}-heading`}
      className={cn('py-20 sm:py-24 lg:py-28', className)}
    >
      <div className="container-page">{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  id: string;
  lead?: string;
  accent: string;
  trail?: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeading({
  id,
  lead,
  accent,
  trail,
  subtitle,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('mx-auto mb-14 max-w-2xl text-center', className)}>
      <h2 id={id} className="text-[length:var(--text-fluid-2xl)]">
        {lead ? <span>{lead} </span> : null}
        <span className="text-accent">{accent}</span>
        {trail ? <span> {trail}</span> : null}
      </h2>
      {subtitle ? (
        <p className="text-muted mt-4 text-[length:var(--text-fluid-base)]">{subtitle}</p>
      ) : null}
      <div aria-hidden="true" className="bg-accent mx-auto mt-6 h-1 w-16 rounded-full" />
    </div>
  );
}
