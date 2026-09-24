import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

/**
 * Envoltorios de navegación conscientes del idioma.
 *
 * Usar SIEMPRE estos en lugar de `next/link` y `next/navigation`: preservan el
 * prefijo de idioma activo sin tener que construirlo a mano en cada enlace.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
