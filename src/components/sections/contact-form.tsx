'use client';

import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useRef, useState, useTransition } from 'react';

import { buttonStyles } from '@/components/ui/button';
import {
  CONTACT_LIMITS,
  contactSchema,
  type ContactFieldError,
  type ContactResponse,
  type ContactResultCode,
} from '@/lib/contact-schema';
import { cn } from '@/lib/utils';

type FieldName = 'name' | 'email' | 'message';
type FieldErrors = Partial<Record<FieldName, ContactFieldError>>;

/** Estado inicial de los campos. Se reutiliza para vaciarlos tras enviar. */
const EMPTY_FORM = { name: '', email: '', message: '' } as const;

/* ════════════════════════════════════════════════════════════════
   FORMULARIO DE CONTACTO
   ════════════════════════════════════════════════════════════════
   Tres campos —nombre, correo y mensaje— y un botón de envío.

   Secuencia al pulsar «Enviar»:
     1. Los datos se revisan aquí mismo, en el navegador. Si algo está
        mal, se marca el campo y no se envía nada, evitando un viaje al
        servidor innecesario.
     2. Si todo es correcto, se envían a /api/contact.
     3. Ese endpoint vuelve a validarlo todo en el servidor —la revisión
        del navegador es eludible— y despacha el correo.
     4. El resultado aparece bajo el botón.

   La clave del servicio de correo nunca pasa por aquí: vive sólo en el
   servidor (src/lib/env/server.ts). Este formulario la desconoce; se
   limita a llamar a /api/contact.

   Las reglas de validación están en src/lib/contact-schema.ts y las
   comparten este formulario y el servidor, de modo que no pueden acabar
   divergiendo.
   ════════════════════════════════════════════════════════════════ */
export function ContactForm() {
  const t = useTranslations('contact'); // Textos del formulario
  const uid = useId(); // Identificador único que enlaza cada etiqueta con su campo

  const [values, setValues] = useState<Record<FieldName, string>>({ ...EMPTY_FORM }); // Contenido actual
  const [errors, setErrors] = useState<FieldErrors>({}); // Errores por campo
  const [status, setStatus] = useState<ContactResultCode | null>(null); // Resultado del envío
  const [isPending, startTransition] = useTransition(); // true mientras envía

  /* Campo trampa para robots (detallado más abajo). Se mantiene fuera
     del estado de React para que ningún renderizado lo altere. */
  const honeypotRef = useRef<HTMLInputElement>(null);

  /** Identificador de un campo, que enlaza su <label> con él. */
  const fieldId = (name: FieldName) => `${uid}-${name}`;

  /** Identificador del mensaje de error de un campo. */
  const errorId = (name: FieldName) => `${uid}-${name}-error`;

  /** Se ejecuta con cada pulsación en cualquiera de los campos. */
  function updateField(name: FieldName, value: string) {
    setValues((previous) => ({ ...previous, [name]: value }));
    // Al corregir un campo su error desaparece de inmediato: mantenerlo
    // visible mientras se escribe la corrección es frustrante.
    if (errors[name]) {
      setErrors((previous) => {
        const next = { ...previous };
        delete next[name];
        return next;
      });
    }
    if (status) setStatus(null);
  }

  /** Método de envío del formulario. Se dispara al pulsar el botón. */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Evita la recarga de página, que es el comportamiento por defecto
    // del navegador al enviar un formulario.
    event.preventDefault();
    if (isPending) return;

    const payload = { ...values, website: honeypotRef.current?.value ?? '' };

    /* Validación en cliente: el mismo esquema que aplicará el servidor.
       Ahorra un viaje de red, pero NO sustituye a la validación del servidor. */
    const parsed = contactSchema.safeParse(payload);

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === 'name' || field === 'email' || field === 'message') {
          nextErrors[field] ??= issue.message as ContactFieldError;
        }
      }
      setErrors(nextErrors);
      setStatus('invalid');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const result = (await response.json()) as ContactResponse;

        setStatus(result.code);
        setErrors(result.fieldErrors ?? {});

        if (result.code === 'success') {
          setValues({ ...EMPTY_FORM });
        }
      } catch {
        // Fallo de red: el servidor ni siquiera respondió.
        setStatus('error');
      }
    });
  }

  const remaining = CONTACT_LIMITS.messageMax - values.message.length;
  const isSuccess = status === 'success';
  const isFailure = status !== null && !isSuccess;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="card-glass card-hover mx-auto max-w-2xl p-6 sm:p-8"
    >
      {/* ─── CAMPO TRAMPA PARA ROBOTS («honeypot») ────────────────
          Campo invisible para las personas que los robots de spam
          rellenan automáticamente al encontrar un formulario.

          Si llega con contenido, el servidor descarta el mensaje pero
          responde «enviado con éxito». Es deliberado: ante un error, el
          robot sabría que fue detectado y reintentaría con otra táctica;
          con una respuesta de éxito se retira convencido.

          A diferencia de un CAPTCHA, filtra spam sin entorpecer a nadie. */}
      <div aria-hidden="true" className="absolute h-px w-px overflow-hidden opacity-0">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input
          ref={honeypotRef}
          id={`${uid}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className="flex flex-col gap-5">
        <Field
          id={fieldId('name')}
          label={t('form.nameLabel')}
          error={errors.name ? t(`validation.${errors.name}`) : undefined}
          errorId={errorId('name')}
          requiredLabel={t('form.required')}
        >
          <input
            id={fieldId('name')}
            name="name"
            type="text"
            required
            autoComplete="name"
            maxLength={CONTACT_LIMITS.nameMax}
            placeholder={t('form.namePlaceholder')}
            value={values.name}
            onChange={(event) => updateField('name', event.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? errorId('name') : undefined}
            className={inputStyles(Boolean(errors.name))}
          />
        </Field>

        <Field
          id={fieldId('email')}
          label={t('form.emailLabel')}
          error={errors.email ? t(`validation.${errors.email}`) : undefined}
          errorId={errorId('email')}
          requiredLabel={t('form.required')}
        >
          <input
            id={fieldId('email')}
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder={t('form.emailPlaceholder')}
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? errorId('email') : undefined}
            className={inputStyles(Boolean(errors.email))}
          />
        </Field>

        <Field
          id={fieldId('message')}
          label={t('form.messageLabel')}
          error={errors.message ? t(`validation.${errors.message}`) : undefined}
          errorId={errorId('message')}
          requiredLabel={t('form.required')}
          hint={t('form.charactersLeft', { count: remaining })}
        >
          <textarea
            id={fieldId('message')}
            name="message"
            required
            rows={6}
            maxLength={CONTACT_LIMITS.messageMax}
            placeholder={t('form.messagePlaceholder')}
            value={values.message}
            onChange={(event) => updateField('message', event.target.value)}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? errorId('message') : undefined}
            className={cn(inputStyles(Boolean(errors.message)), 'min-h-36 resize-y')}
          />
        </Field>
      </div>

      {/* ─── BOTÓN PARA ENVIAR EL MENSAJE ─────────────────────────
          Durante el envío se desactiva y muestra un indicador de carga,
          lo que impide una segunda pulsación y el consiguiente mensaje
          duplicado. */}
      <button
        type="submit"
        disabled={isPending}
        className={buttonStyles({ variant: 'solid', size: 'lg', className: 'mt-7 w-full' })}
      >
        {isPending ? (
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-5" aria-hidden="true" />
        )}
        {isPending ? t('form.submitting') : t('form.submit')}
      </button>

      {/* ─── MENSAJE DE RESULTADO ─────────────────────────────────
          Muestra «mensaje enviado» o el error correspondiente, en verde
          o en rojo.

          Sustituye al `alert()` de la versión anterior del portafolio.
          Un `alert()` bloquea la página entera hasta que se pulsa
          aceptar; este aviso se lee sin interrumpir nada.

          `role="status"` junto con `aria-live="polite"` consiguen que un
          lector de pantalla lo anuncie por sí solo, sin robar el foco.

          El recuadro permanece siempre en el documento aunque no haya
          mensaje, con altura cero: si se insertara de golpe, muchos
          lectores de pantalla no llegarían a anunciarlo. */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          'mt-4 flex items-start gap-2.5 rounded-xl px-4 text-sm font-medium transition-all',
          status ? 'py-3' : 'h-0 overflow-hidden py-0',
          isSuccess && 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
          isFailure && 'bg-red-500/12 text-red-600 dark:text-red-400',
        )}
      >
        {isSuccess ? (
          <CheckCircle2 className="mt-0.5 size-4.5 shrink-0" aria-hidden="true" />
        ) : null}
        {isFailure ? <AlertCircle className="mt-0.5 size-4.5 shrink-0" aria-hidden="true" /> : null}
        <span>{status ? t(`status.${status}`) : ''}</span>
      </div>
    </form>
  );
}

/* ─── Piezas internas ────────────────────────────────────────────── */

function inputStyles(hasError: boolean): string {
  return cn(
    'bg-background-elevated border-border text-foreground placeholder:text-muted/70 w-full rounded-xl border px-4 py-3 text-base transition-all',
    'focus:border-accent focus:ring-accent/30 focus:ring-3 focus:outline-none',
    hasError && 'border-red-500/70 focus:border-red-500 focus:ring-red-500/25',
  );
}

interface FieldProps {
  id: string;
  label: string;
  error?: string | undefined;
  errorId: string;
  requiredLabel: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ id, label, error, errorId, requiredLabel, hint, children }: FieldProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
          <span className="text-accent ml-1" aria-hidden="true">
            *
          </span>
          <span className="sr-only"> ({requiredLabel})</span>
        </label>
        {hint ? <span className="text-muted text-xs tabular-nums">{hint}</span> : null}
      </div>

      {children}

      {error ? (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
