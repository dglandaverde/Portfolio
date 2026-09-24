import 'server-only';

/**
 * Rate limiter de ventana deslizante en memoria.
 *
 * LIMITACIÓN CONOCIDA Y DELIBERADA: en un entorno serverless cada instancia
 * tiene su propio mapa, así que el límite real es «N por instancia», no «N
 * global». Para un formulario de contacto de un portafolio es suficiente:
 * corta el spam repetitivo sin añadir una dependencia externa ni latencia de
 * red. Si el tráfico crece, sustituir por un almacén compartido (Upstash
 * Redis, Vercel KV) manteniendo esta misma firma. Ver SECURITY.md.
 */

interface Bucket {
  /** Marcas de tiempo (ms) de las peticiones dentro de la ventana. */
  hits: number[];
  /** Momento en que el bucket puede descartarse. */
  expiresAt: number;
}

const buckets = new Map<string, Bucket>();

/** Evita que el mapa crezca sin límite si el proceso vive mucho tiempo. */
const MAX_TRACKED_KEYS = 10_000;

function evictExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.expiresAt <= now) buckets.delete(key);
  }

  // Si tras limpiar sigue por encima del techo, se descartan las más antiguas.
  if (buckets.size > MAX_TRACKED_KEYS) {
    const excess = buckets.size - MAX_TRACKED_KEYS;
    let removed = 0;
    for (const key of buckets.keys()) {
      buckets.delete(key);
      if (++removed >= excess) break;
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Segundos hasta que se libere un hueco. `0` si aún queda cupo. */
  retryAfter: number;
}

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number,
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  evictExpired(now);

  const bucket = buckets.get(identifier) ?? { hits: [], expiresAt: now + windowMs };
  const hits = bucket.hits.filter((timestamp) => now - timestamp < windowMs);

  if (hits.length >= maxRequests) {
    const oldest = hits[0] ?? now;
    buckets.set(identifier, { hits, expiresAt: oldest + windowMs });
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  hits.push(now);
  buckets.set(identifier, { hits, expiresAt: now + windowMs });

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - hits.length,
    retryAfter: 0,
  };
}

/**
 * Deriva el identificador del cliente a partir de las cabeceras del proxy.
 *
 * En Vercel `x-forwarded-for` lo fija la plataforma y no es falsificable por
 * el cliente. Fuera de ese contexto se degrada a un identificador común, con
 * lo que el límite pasa a ser global en lugar de por IP: es el fallo seguro.
 */
export function getClientIdentifier(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return headers.get('x-real-ip')?.trim() || 'unknown';
}
