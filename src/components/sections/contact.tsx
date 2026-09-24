import { useTranslations } from 'next-intl';

import { ContactForm } from '@/components/sections/contact-form';
import { Section, SectionHeading } from '@/components/ui/section';

/* ════════════════════════════════════════════════════════════════
   SECCIÓN «CONTACTO»
   ════════════════════════════════════════════════════════════════
   Coloca el título de la sección y, debajo, el formulario.

   El formulario vive aparte, en contact-form.tsx, porque necesita
   reaccionar a lo que se escribe y eso obliga a ejecutarlo en el
   navegador. Separarlos permite que esta parte se siga generando en el
   servidor, sin enviar JavaScript innecesario.
   ════════════════════════════════════════════════════════════════ */
export function Contact() {
  const t = useTranslations('contact');
  const trail = t('titleTrail');

  return (
    <Section id="contact">
      <SectionHeading
        id="contact-heading"
        accent={t('titleAccent')}
        {...(trail ? { trail } : {})}
        subtitle={t('subtitle')}
      />
      <ContactForm />
    </Section>
  );
}
