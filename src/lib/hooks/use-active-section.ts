'use client';

import { useEffect, useState } from 'react';

import { getCurrentSectionId } from '@/lib/scroll';

/**
 * Devuelve el id de la sección que se está leyendo.
 *
 * El cálculo lo hace `getCurrentSectionId()`, la misma función que usa el
 * cambio de idioma para saber dónde devolver al visitante. Que compartan
 * definición no es casualidad: cuando cada uno tenía su propio criterio, el
 * menú resaltaba una sección y el cambio de idioma te dejaba en otra.
 *
 * Sobre el listener de scroll: el portafolio original también lo usaba, pero
 * recalculaba `offsetTop` de cada sección en CADA evento, decenas de veces
 * por segundo. Aquí se limita a un cálculo por frame con
 * `requestAnimationFrame`, el listener es `passive` (el navegador no espera
 * a saber si se llamará a `preventDefault`) y el estado sólo se actualiza
 * cuando el id cambia de verdad, así que no hay renderizados de más.
 *
 * Se descartó IntersectionObserver: dispara DURANTE el desplazamiento, con
 * lo que la última lectura podía quedar congelada a mitad de camino y
 * resaltar la sección anterior a la de destino.
 */
export function useActiveSection(fallback: string): string {
  const [activeId, setActiveId] = useState(fallback);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const next = getCurrentSectionId() ?? fallback;
      setActiveId((previous) => (previous === next ? previous : next));
    };

    const schedule = () => {
      // Si ya hay una medición encolada para este frame, no se encola otra.
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [fallback]);

  return activeId;
}
