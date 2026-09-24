import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Posición dentro de un grupo: escalona la entrada de elementos hermanos. */
  index?: number;
  as?: 'div' | 'li' | 'section' | 'article';
}

/**
 * Revela el contenido al entrar en el viewport.
 *
 * Es un Server Component sin una línea de JavaScript: la animación la
 * conduce el propio scroll mediante `animation-timeline: view()` (ver la
 * clase `.reveal` en globals.css).
 *
 * La versión anterior usaba IntersectionObserver y arrancaba en `opacity: 0`,
 * lo que significaba que TODO el contenido bajo el hero quedaba invisible
 * hasta que React hidrataba — y en blanco para siempre si el JavaScript
 * fallaba o el navegador lo tenía desactivado. Aquí el contenido nace
 * visible y la animación es un extra que se añade sólo si el navegador la
 * soporta y el usuario no ha pedido menos movimiento.
 */
export function Reveal({ children, className, index = 0, as: Tag = 'div' }: RevealProps) {
  return (
    <Tag
      style={index ? ({ '--reveal-index': index } as CSSProperties) : undefined}
      className={cn('reveal', className)}
    >
      {children}
    </Tag>
  );
}
