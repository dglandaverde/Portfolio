import { DEFAULT_THEME, THEME_ATTRIBUTE, THEME_STORAGE_KEY } from '@/lib/theme';

/* ════════════════════════════════════════════════════════════════
   SCRIPT QUE APLICA EL TEMA ANTES DE PINTAR LA PÁGINA
   ════════════════════════════════════════════════════════════════

   Función
   Lee el tema elegido en la visita anterior —guardado en el navegador— y
   lo aplica a la etiqueta <html> antes de que se pinte nada.

   Motivo
   Sin él, el navegador pintaría primero el tema oscuro por defecto y, una
   vez cargado React, saltaría al claro: el clásico destello al entrar en
   una web. Medido: con este script, cero fotogramas de destello.

   Por qué es un <script> y no next/script
   Se probó `next/script` con `strategy="beforeInteractive"` y no sirve
   para este caso: Next lo encola en su propio cargador y se ejecuta
   después del primer pintado, produciendo un fotograma de destello. Un
   <script> suelto lo ejecuta el navegador al instante, durante el
   análisis del HTML.

   Aviso en la consola de desarrollo
   Al cambiar de idioma aparece en consola:
     «Encountered a script tag while rendering React component…»

   Es esperado y no indica un fallo. React advierte de que, en ese
   cambio, no vuelve a ejecutar el script. Es cierto, y está cubierto por
   <ThemeSync />, que repone el tema en cada renderizado.

   El aviso se limita al entorno de desarrollo. Verificado: en producción
   la consola queda a cero, incluso tras varios cambios de idioma.
   ════════════════════════════════════════════════════════════════ */

/**
 * Código que se ejecuta en el navegador, definido como texto plano.
 *
 * Su lógica es:
 *   1. busca el tema guardado en el navegador,
 *   2. si encuentra 'light' o 'dark', lo aplica,
 *   3. si no hay nada guardado, aplica el oscuro, que es el tema por defecto.
 *
 * El `try/catch` existe porque leer el almacenamiento del navegador lanza
 * una excepción en ventanas de incógnito o con las cookies bloqueadas. En
 * ese caso se mantiene el tema oscuro.
 */
const script = `(function(){var d=document.documentElement;var t;try{t=localStorage.getItem('${THEME_STORAGE_KEY}')}catch(e){}d.setAttribute('${THEME_ATTRIBUTE}',t==='light'||t==='dark'?t:'${DEFAULT_THEME}')})();`;

/** Inserta el script anterior en el <head> del documento. */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
