import type { ReactNode } from 'react';

/**
 * Layout raíz de paso.
 *
 * Las etiquetas <html> y <body> viven en `[locale]/layout.tsx`, porque el
 * atributo `lang` depende del idioma de la ruta y no puede fijarse aquí.
 * Next exige un layout en la raíz del segmento, así que este se limita a
 * dejar pasar a sus hijos.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
