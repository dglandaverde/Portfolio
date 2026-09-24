'use client';

import { useEffect, useLayoutEffect } from 'react';

import { applyStoredTheme } from '@/lib/theme';

/* ════════════════════════════════════════════════════════════════
   GUARDIÁN DEL TEMA
   ════════════════════════════════════════════════════════════════
   No dibuja nada en pantalla: devuelve `null`. Su única función es
   impedir que se pierda el tema elegido.

   Problema que resuelve
   Al cambiar de idioma, React vuelve a montar la página completa y en el
   proceso vacía todos los atributos de la etiqueta <html>. Repone los que
   él mismo controla (`lang`, `class`), pero no `data-theme`, porque ese
   lo fija el script del <head> y React desconoce su existencia.

   Sin este componente, pasar de idioma estando en modo claro devolvía la
   web al modo oscuro.

   Solución
   Después de cada renderizado comprueba el tema guardado y lo vuelve a
   aplicar si es necesario.

   `useLayoutEffect` se ejecuta una vez React ha modificado el documento
   pero antes de que el navegador lo dibuje, de modo que la corrección
   ocurre dentro del mismo fotograma y no se percibe parpadeo alguno
   (verificado sobre 22 fotogramas de la transición, ninguno con el tema
   equivocado).

   Carece de lista de dependencias de forma deliberada: debe ejecutarse
   siempre, ya que cualquier renderizado puede haber vaciado el atributo.
   El coste se reduce a comparar dos cadenas.
   ════════════════════════════════════════════════════════════════ */

// En el servidor no hay pantalla que medir, de modo que allí se recurre a
// `useEffect` para evitar un aviso de React. En el navegador, que es donde
// importa, se usa `useLayoutEffect`.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function ThemeSync() {
  useIsomorphicLayoutEffect(() => {
    applyStoredTheme();
  });

  return null; // No renderiza nada: sólo vigila el atributo.
}
