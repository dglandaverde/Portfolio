// `zod/mini` en lugar de `zod`: este módulo lo importa el formulario, que es
// un Client Component, así que todo lo que arrastre viaja al navegador. La
// build completa de Zod añadía ~100 KB al bundle; `zod/mini` expone las
// mismas validaciones con una API funcional y ocupa una fracción.
// Los módulos que sólo corren en servidor (src/lib/env/*) sí usan Zod completo.
import * as z from 'zod/mini';

/**
 * Esquema compartido entre navegador y servidor.
 *
 * La validación del cliente es comodidad; la del servidor es la que cuenta.
 * Compartir el esquema garantiza que ambas apliquen exactamente las mismas
 * reglas y que no puedan divergir con el tiempo.
 *
 * Los mensajes de error son CLAVES de traducción, no texto: quien las muestra
 * decide el idioma. Así el servidor no necesita conocer el idioma del usuario.
 */
export const contactSchema = z.object({
  name: z.string().check(z.trim(), z.minLength(2, 'nameMin'), z.maxLength(80, 'nameMax')),

  email: z.email({ error: 'emailInvalid' }).check(z.maxLength(254, 'emailInvalid')),

  message: z
    .string()
    .check(z.trim(), z.minLength(10, 'messageMin'), z.maxLength(2000, 'messageMax')),

  /**
   * Honeypot. Campo invisible para personas y tentador para bots.
   *
   * El esquema lo acepta con cualquier valor A PROPÓSITO: si aquí se
   * rechazara, la petición del bot moriría como error de validación y él
   * sabría que fue detectado. La comprobación se hace después del parseo,
   * en la ruta, que responde 200 fingiendo que el envío funcionó.
   */
  website: z._default(z.optional(z.string().check(z.maxLength(200))), ''),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;

/** Claves de error de validación que el cliente sabe traducir. */
export type ContactFieldError =
  'nameMin' | 'nameMax' | 'emailInvalid' | 'messageMin' | 'messageMax';

/** Códigos de resultado que devuelve `POST /api/contact`. */
export type ContactResultCode = 'success' | 'invalid' | 'rateLimited' | 'unavailable' | 'error';

export interface ContactResponse {
  code: ContactResultCode;
  /** Presente sólo cuando `code === 'invalid'`. Mapea campo → clave de error. */
  fieldErrors?: Partial<Record<'name' | 'email' | 'message', ContactFieldError>>;
  /** Segundos que faltan para poder reintentar. Sólo con `code === 'rateLimited'`. */
  retryAfter?: number;
}

export const CONTACT_LIMITS = {
  nameMax: 80,
  messageMax: 2000,
} as const;
