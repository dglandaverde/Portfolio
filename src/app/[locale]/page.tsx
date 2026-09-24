import { setRequestLocale } from 'next-intl/server';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { About } from '@/components/sections/about';
import { Contact } from '@/components/sections/contact';
import { Hero } from '@/components/sections/hero';
import { Projects } from '@/components/sections/projects';
import { Services } from '@/components/sections/services';
import { Skills } from '@/components/sections/skills';

/* ════════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
   ════════════════════════════════════════════════════════════════
   Ensambla el portafolio completo en el orden que aparece abajo.
   Reordenar las secciones se hace moviéndolas en este fichero; el menú
   superior se adapta solo, porque lee `navSections` de
   src/content/site.ts.

   El contenido de cada sección no está aquí: cada una reside en su
   propio fichero dentro de src/components/sections/.
   ════════════════════════════════════════════════════════════════ */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  // El idioma llega en la dirección (/es o /en).
  const { locale } = await params;

  /* Fija el idioma en la librería de traducción. Es lo que permite que
     la página se genere una sola vez al publicar, en lugar de calcularse
     en cada visita: así se sirve desde la CDN y carga al instante. */
  setRequestLocale(locale);

  return (
    <>
      {/* Barra superior: menú, idioma y tema. Fija en pantalla. */}
      <SiteHeader />

      {/* `id="main"` es el destino del enlace «saltar al contenido». */}
      <main id="main">
        <Hero /> {/* Portada: nombre, redes, CV y retrato */}
        <About /> {/* Presentación y forma de trabajar */}
        <Skills /> {/* Tecnologías, por ámbito */}
        <Services /> {/* Servicios ofrecidos */}
        <Projects /> {/* Trabajos realizados */}
        <Contact /> {/* Formulario de contacto */}
      </main>

      {/* Pie: nombre, redes y enlace para volver arriba */}
      <SiteFooter />
    </>
  );
}
