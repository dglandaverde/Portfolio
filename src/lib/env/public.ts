import { z } from 'zod';

/**
 * Variables de entorno PÚBLICAS.
 *
 * Todo lo declarado aquí se incrusta literalmente en el bundle que descarga el
 * navegador. Por eso el esquema sólo admite claves con prefijo `NEXT_PUBLIC_`
 * y jamás debe contener un secreto.
 *
 * Next.js sustituye `process.env.NEXT_PUBLIC_X` en tiempo de compilación, pero
 * sólo si la propiedad se accede de forma estática. De ahí que el objeto se
 * construya escribiendo cada clave a mano en lugar de iterar `process.env`.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .url({ error: 'NEXT_PUBLIC_SITE_URL debe ser una URL absoluta (https://…)' })
    // Normaliza: sin barra final, para poder concatenar rutas sin duplicarla.
    .transform((value) => value.replace(/\/$/, '')),
});

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
});

if (!parsed.success) {
  throw new Error(
    `Variables de entorno públicas inválidas:\n${z.prettifyError(parsed.error)}\n` +
      'Comprobar .env.example y el fichero .env.local local.',
  );
}

export const publicEnv = Object.freeze(parsed.data);

export type PublicEnv = typeof publicEnv;
