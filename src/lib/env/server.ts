// `server-only` hace que el build FALLE si algún Client Component importa este
// módulo. Es la barrera que impide que un secreto acabe en el bundle público.
import 'server-only';

import { z } from 'zod';

/**
 * Variables de entorno de SERVIDOR.
 *
 * Nunca salen del servidor y nunca llevan prefijo `NEXT_PUBLIC_`.
 * El esquema se valida al importar el módulo: si falta una variable o su
 * formato es inválido, el proceso revienta en el build en lugar de fallar
 * silenciosamente en producción cuando alguien envíe el formulario.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  /** API key de Resend. El prefijo `re_` es el formato oficial del proveedor. */
  RESEND_API_KEY: z
    .string()
    .min(1, 'RESEND_API_KEY es obligatoria')
    .startsWith('re_', 'RESEND_API_KEY debe empezar por "re_"'),

  /** Remitente. Debe pertenecer a un dominio verificado en Resend. */
  CONTACT_FROM_EMAIL: z.email({ error: 'CONTACT_FROM_EMAIL debe ser un correo válido' }),

  /** Buzón destino de los mensajes del formulario. */
  CONTACT_TO_EMAIL: z.email({ error: 'CONTACT_TO_EMAIL debe ser un correo válido' }),

  /** Envíos permitidos por IP dentro de la ventana. */
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(5),

  /** Duración de la ventana del rate limit, en segundos. */
  RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive().default(600),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: Readonly<ServerEnv> | null = null;

/**
 * Devuelve la configuración de servidor validada.
 *
 * Es una función y no una constante de módulo a propósito: durante
 * `next build` se recorren rutas que no necesitan credenciales de correo, y
 * validar al importar rompería el build de quien todavía no tiene su
 * `.env.local`. La validación ocurre la primera vez que una ruta las pide.
 */
export function getServerEnv(): Readonly<ServerEnv> {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    // El mensaje enumera qué falta, nunca el valor: un log no debe filtrar secretos.
    throw new Error(
      `Variables de entorno de servidor inválidas:\n${z.prettifyError(parsed.error)}\n` +
        'Copiar .env.example a .env.local y completarlo, o definir las variables en el proveedor de hosting.',
    );
  }

  cached = Object.freeze(parsed.data);
  return cached;
}

/** Comprueba si el correo está configurado sin lanzar excepción. */
export function isEmailConfigured(): boolean {
  try {
    getServerEnv();
    return true;
  } catch {
    return false;
  }
}
