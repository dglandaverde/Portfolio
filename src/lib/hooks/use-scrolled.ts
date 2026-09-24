'use client';

import { useEffect, useState } from 'react';

/**
 * Indica si la página está desplazada más allá de `threshold` píxeles.
 *
 * El listener es `passive` para que el navegador no espere a saber si se va a
 * llamar a `preventDefault()`, y el estado sólo se actualiza cuando el valor
 * booleano cambia de verdad, no en cada píxel de scroll.
 */
export function useScrolled(threshold = 12): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => {
      setScrolled((previous) => {
        const next = window.scrollY > threshold;
        return previous === next ? previous : next;
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [threshold]);

  return scrolled;
}
