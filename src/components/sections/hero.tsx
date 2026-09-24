import { Download, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { socialIcons } from '@/components/icons';
import { buttonStyles } from '@/components/ui/button';
import { siteConfig, socialLinks } from '@/content/site';

/* ════════════════════════════════════════════════════════════════
   SECCIÓN DE INICIO (el «hero»)
   ════════════════════════════════════════════════════════════════
   Primera pantalla del sitio: saludo, puesto, enlaces sociales, los dos
   botones de acción y el retrato.

   Ocupa la altura completa de la ventana (`min-h-dvh`) de forma
   deliberada: es la carta de presentación y nada compite con ella.

   Los textos no están escritos aquí. Proceden de src/messages/es.json y
   en.json, bajo la clave "hero"; `useTranslations('hero')` los trae en el
   idioma activo.
   ════════════════════════════════════════════════════════════════ */
export function Hero() {
  // Textos de la sección "hero" en el idioma activo.
  const t = useTranslations('hero');

  return (
    <section
      id="home"
      aria-labelledby="home-heading"
      className="relative flex min-h-dvh items-center overflow-hidden pt-24 pb-16 sm:pt-28"
    >
      {/* Resplandor azul difuminado del fondo, arriba a la derecha.
          Es pura decoración: `aria-hidden` lo oculta a los lectores de
          pantalla para que no anuncien un elemento sin significado. */}
      <div
        aria-hidden="true"
        className="bg-accent/12 pointer-events-none absolute top-[-10%] right-[-15%] size-[38rem] rounded-full blur-[120px]"
      />

      <div className="container-page relative grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        {/* ───────────────────────────────────────────────────────────
            COLUMNA IZQUIERDA — texto y botones
            Centrada en móvil; a partir de pantalla grande (lg) se alinea
            a la izquierda y el retrato pasa a su derecha.
            ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* Saludo pequeño de arriba: «Hola,» */}
          <p className="text-muted text-[length:var(--text-fluid-lg)] font-semibold">
            {t('greeting')}
          </p>

          {/* Título principal: «Bienvenido».
              Único <h1> de la página. Debe haber exactamente uno: es la
              referencia que usan los buscadores y los lectores de pantalla
              para identificar el tema del documento. */}
          <h1 id="home-heading" className="mt-1 text-[length:var(--text-fluid-3xl)] font-extrabold">
            {t('title')}
          </h1>

          {/* Puesto: «Soy Software Engineer», con el cargo en azul. */}
          <p className="mt-3 text-[length:var(--text-fluid-xl)] font-semibold">
            {t('roleIntro')} <span className="text-accent">{t('role')}</span>
          </p>

          {/* Frase de presentación, debajo del puesto. */}
          <p className="text-muted mt-5 max-w-xl text-[length:var(--text-fluid-base)]">
            {t('tagline')}
          </p>

          {/* ─── ENLACES A REDES SOCIALES ─────────────────────────────
              Se generan a partir de `socialLinks`, en src/content/site.ts.
              Añadir o quitar una red se hace editando ese array; este
              componente no necesita cambios. */}
          <ul aria-label={t('socialLabel')} className="mt-8 flex flex-wrap justify-center gap-3">
            {socialLinks.map(({ platform, label, href }) => {
              const Icon = socialIcons[platform];
              return (
                <li key={platform}>
                  <a
                    href={href}
                    target="_blank"
                    /* `noopener` impide que la página de destino manipule
                       esta ventana; `noreferrer` evita enviarle la
                       dirección de origen; `me` declara que ese perfil
                       pertenece al autor del sitio (microformato). */
                    rel="noopener noreferrer me"
                    /* El enlace sólo contiene un icono, sin texto. Sin
                       `aria-label`, un lector de pantalla anunciaría
                       «enlace» y nada más. */
                    aria-label={label}
                    className="border-accent text-accent hover:bg-accent hover:text-accent-contrast inline-flex size-12 items-center justify-center rounded-full border-2 transition-all duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-[0_8px_24px_-6px_var(--color-accent)]"
                  >
                    <Icon className="size-5" />
                  </a>
                </li>
              );
            })}
          </ul>

          {/* ─── BOTONES DE ACCIÓN ────────────────────────────────────
              Apilados a lo ancho en móvil; en fila desde tablet. */}
          <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {/* BOTÓN PARA DESCARGAR EL CV
                El atributo `download` hace que el navegador guarde el
                fichero en lugar de abrirlo. La ruta del PDF está en
                `siteConfig.cvPath` (src/content/site.ts) y el fichero vive
                en public/documents/. Sustituir ese fichero actualiza el CV
                sin tocar código. */}
            <a
              href={siteConfig.cvPath}
              download
              className={buttonStyles({ variant: 'solid', size: 'lg' })}
            >
              <Download className="size-5" aria-hidden="true" />
              {t('downloadCv')}
            </a>

            {/* BOTÓN «HABLEMOS»
                No abre nada externo: desplaza hasta el formulario de
                contacto del final de la página. `#contact` es el id de esa
                sección. */}
            <a href="#contact" className={buttonStyles({ variant: 'outline', size: 'lg' })}>
              <Mail className="size-5" aria-hidden="true" />
              {t('contactCta')}
            </a>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────
            COLUMNA DERECHA — retrato
            ─────────────────────────────────────────────────────────── */}
        <div className="relative mx-auto w-full max-w-[18rem] sm:max-w-[22rem] lg:max-w-[26rem]">
          {/* Halo azul tras el retrato. Decorativo. */}
          <div
            aria-hidden="true"
            className="from-accent/30 absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr to-transparent blur-2xl"
          />

          {/* RETRATO
              Se cambia sustituyendo public/images/portrait.jpg por otra
              imagen CUADRADA (misma anchura y altura, ~1000 px). Una
              imagen rectangular se recortaría por el centro.

              `width` y `height` coinciden con las medidas reales del
              fichero: el navegador reserva ese hueco antes de descargarla
              y la página no da un salto al cargar.

              `priority` la marca como la imagen más importante, para que
              el navegador la descargue primero en lugar de dejarla para el
              final. */}
          <Image
            src="/images/portrait.jpg"
            alt={t('portraitAlt')}
            width={1000}
            height={1000}
            priority
            fetchPriority="high"
            /* Indica al navegador qué tamaño ocupará la imagen en cada
               pantalla, para que descargue la versión adecuada y no una
               innecesariamente grande en un móvil. */
            sizes="(max-width: 640px) 18rem, (max-width: 1024px) 22rem, 26rem"
            className="ring-accent/25 relative aspect-square w-full rounded-[2.5rem] object-cover ring-4 motion-safe:animate-[float_6s_var(--ease-out-soft)_infinite]"
          />
        </div>
      </div>
    </section>
  );
}
