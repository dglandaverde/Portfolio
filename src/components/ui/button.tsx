import { cn } from '@/lib/utils';

export type ButtonVariant = 'solid' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] font-semibold ' +
  'tracking-wide transition-all duration-300 ease-[var(--ease-out-soft)] ' +
  'disabled:pointer-events-none disabled:opacity-55 ' +
  // 44px de alto mínimo: el objetivo táctil recomendado por WCAG 2.2.
  'min-h-11 cursor-pointer select-none';

const variants: Record<ButtonVariant, string> = {
  solid:
    'bg-accent text-accent-contrast hover:brightness-110 hover:shadow-[0_8px_30px_-8px_var(--color-accent)] active:scale-[0.98]',
  outline:
    'border-2 border-accent text-accent hover:bg-accent hover:text-accent-contrast hover:shadow-[0_8px_30px_-8px_var(--color-accent)] active:scale-[0.98]',
  ghost: 'text-foreground hover:bg-accent-soft hover:text-accent',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-3.5 text-base sm:text-lg',
};

/**
 * Devuelve las clases del botón.
 *
 * Es una función y no un componente para poder aplicar el mismo estilo a
 * `<button>`, `<a>` y al `<Link>` de next-intl sin duplicar elementos ni
 * recurrir a `asChild`.
 */
export function buttonStyles({
  variant = 'outline',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(base, variants[variant], sizes[size], className);
}
