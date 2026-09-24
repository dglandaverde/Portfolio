/** Alto de la cabecera fija. Debe coincidir con `scroll-padding-top` en globals.css. */
export const HEADER_OFFSET = 96;

/**
 * Devuelve el id de la sección que el visitante está leyendo ahora mismo,
 * o `null` si está en la parte superior de la página.
 *
 * Se usa al cambiar de idioma para volver a dejarlo donde estaba. No sirve
 * conservar el `scrollY` en píxeles: el mismo texto en español y en inglés
 * ocupa alturas distintas, así que el píxel 1423 no es la misma sección en
 * ambos idiomas. El ancla sí lo es.
 */
export function getCurrentSectionId(): string | null {
  if (typeof document === 'undefined') return null;

  // Cerca del inicio no hay nada que restaurar: dejarlo en el hero.
  if (window.scrollY < HEADER_OFFSET) return null;

  let current: string | null = null;

  for (const section of document.querySelectorAll<HTMLElement>('section[id]')) {
    // La última sección cuyo borde superior ya pasó la cabecera es la visible.
    // Los 4px de holgura absorben el redondeo subpíxel del navegador tras un
    // `scrollIntoView`, que deja el borde en 96px ± una fracción.
    if (section.getBoundingClientRect().top <= HEADER_OFFSET + 4) {
      current = section.id;
    }
  }

  return current;
}

/**
 * Lleva el viewport a una sección sin animación.
 *
 * Se fuerza `behavior: 'instant'` a propósito: `scroll-behavior: smooth` está
 * activo globalmente y aquí no queremos que el visitante vea la página
 * recorrerse entera después de cambiar de idioma.
 */
export function jumpToSection(id: string): void {
  const target = document.getElementById(id);
  if (!target) return;

  target.scrollIntoView({ behavior: 'instant', block: 'start' });

  // Refleja la sección en la URL sin añadir una entrada al historial, para
  // que compartir el enlace conserve el punto de lectura.
  if (window.location.hash !== `#${id}`) {
    window.history.replaceState(null, '', `#${id}`);
  }
}

/* ─── Ancla pendiente entre navegaciones ──────────────────────────
 *
 * Vive a nivel de módulo, no en un `useRef`.
 *
 * Al cambiar de idioma, React remonta el layout raíz y con él todos sus
 * componentes, así que cualquier ref se reinicia antes de poder leerlo. El
 * módulo, en cambio, no se vuelve a evaluar en una navegación de cliente:
 * es el único sitio donde el dato sobrevive al salto.
 * ───────────────────────────────────────────────────────────────── */

let pendingSection: string | null = null;

/** Anota dónde estaba leyendo el visitante, justo antes de navegar. */
export function rememberSection(id: string | null): void {
  pendingSection = id;
}

/** Devuelve el ancla anotada y la limpia, para que sólo se aplique una vez. */
export function consumePendingSection(): string | null {
  const value = pendingSection;
  pendingSection = null;
  return value;
}
