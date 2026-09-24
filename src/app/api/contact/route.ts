import { NextResponse } from 'next/server';
import { Resend } from 'resend';

import { contactSchema, type ContactFieldError, type ContactResponse } from '@/lib/contact-schema';
import { getServerEnv } from '@/lib/env/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { siteConfig } from '@/content/site';

/** Resend usa `fetch`, pero el runtime Node mantiene vivo el mapa del rate limit. */
export const runtime = 'nodejs';

/** Techo de tamaño del cuerpo: descarta payloads absurdos antes de parsear. */
const MAX_BODY_BYTES = 16 * 1024;

/** Escapa entidades HTML para que el mensaje no pueda inyectar marcado en el correo. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function json(body: ContactResponse, init?: ResponseInit): NextResponse<ContactResponse> {
  return NextResponse.json(body, init);
}

export async function POST(request: Request): Promise<NextResponse<ContactResponse>> {
  /* 1 ─ Configuración. Si falta una variable, se devuelve `unavailable` sin
         revelar cuál: el detalle va al log del servidor, no al cliente. */
  let env: ReturnType<typeof getServerEnv>;
  try {
    env = getServerEnv();
  } catch (error) {
    console.error('[contact] configuración de entorno inválida:', error);
    return json({ code: 'unavailable' }, { status: 503 });
  }

  /* 2 ─ Rate limit por IP, antes de cualquier trabajo costoso. */
  const identifier = getClientIdentifier(request.headers);
  const limit = checkRateLimit(
    identifier,
    env.RATE_LIMIT_MAX_REQUESTS,
    env.RATE_LIMIT_WINDOW_SECONDS,
  );

  if (!limit.success) {
    return json(
      { code: 'rateLimited', retryAfter: limit.retryAfter },
      {
        status: 429,
        headers: {
          'Retry-After': String(limit.retryAfter),
          'X-RateLimit-Limit': String(limit.limit),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  /* 3 ─ Tamaño y parseo del cuerpo. */
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ code: 'invalid' }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ code: 'invalid' }, { status: 400 });
  }

  /* 4 ─ Validación con el mismo esquema que usa el navegador. */
  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    const fieldErrors: ContactResponse['fieldErrors'] = {};

    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === 'name' || field === 'email' || field === 'message') {
        fieldErrors[field] ??= issue.message as ContactFieldError;
      }
    }

    return json({ code: 'invalid', fieldErrors }, { status: 422 });
  }

  const { name, email, message, website } = parsed.data;

  /* 5 ─ Honeypot. Se responde 200 a propósito: un bot que recibe un error
         sabe que fue detectado y reintenta; con un 200 cree haber tenido éxito. */
  if (website) {
    console.warn('[contact] honeypot activado desde', identifier);
    return json({ code: 'success' }, { status: 200 });
  }

  /* 6 ─ Envío. La API key sólo existe aquí, en el servidor. */
  try {
    const resend = new Resend(env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: `${siteConfig.name} Portfolio <${env.CONTACT_FROM_EMAIL}>`,
      to: env.CONTACT_TO_EMAIL,
      // Permite responder directamente a quien escribió desde la bandeja.
      replyTo: email,
      subject: `Nuevo mensaje del portafolio — ${name}`,
      text: [`Nombre:  ${name}`, `Correo:  ${email}`, '', 'Mensaje:', message].join('\n'),
      html: `
        <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#18181b">
          <h2 style="margin:0 0 4px;font-size:18px">Nuevo mensaje del portafolio</h2>
          <p style="margin:0 0 20px;color:#71717a;font-size:13px">Recibido el ${new Date().toISOString()}</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr>
              <td style="padding:8px 0;color:#71717a;width:90px;vertical-align:top">Nombre</td>
              <td style="padding:8px 0"><strong>${escapeHtml(name)}</strong></td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#71717a;vertical-align:top">Correo</td>
              <td style="padding:8px 0"><a href="mailto:${escapeHtml(email)}" style="color:#2563eb">${escapeHtml(email)}</a></td>
            </tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:#f4f4f5;border-radius:8px;border-left:3px solid #2563eb">
            <p style="margin:0;white-space:pre-wrap;font-size:14px;line-height:1.6">${escapeHtml(message)}</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[contact] Resend devolvió un error:', error);
      return json({ code: 'error' }, { status: 502 });
    }

    return json(
      { code: 'success' },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': String(limit.limit),
          'X-RateLimit-Remaining': String(limit.remaining),
        },
      },
    );
  } catch (error) {
    console.error('[contact] fallo inesperado al enviar:', error);
    return json({ code: 'error' }, { status: 500 });
  }
}

/** Cualquier método distinto de POST se rechaza explícitamente. */
export function GET(): NextResponse {
  return NextResponse.json(
    { error: 'Method Not Allowed' },
    { status: 405, headers: { Allow: 'POST' } },
  );
}
