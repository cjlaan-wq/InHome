import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'quiet' | 'back';

const styles: Record<Variant, string> = {
  primary:
    'rounded-xl bg-kpn-green-dark px-4 py-2.5 font-medium text-white hover:bg-ink disabled:bg-dimmed focus-visible:outline-offset-2',
  secondary:
    'rounded-xl border border-kpn-green-dark px-3 py-2 text-sm font-medium text-kpn-green-dark hover:bg-scene disabled:border-line disabled:text-ink-muted',
  quiet: 'rounded-xl border border-line px-3 py-2 font-medium text-ink hover:border-kpn-green disabled:opacity-50',
  back: 'self-start rounded-lg py-1 text-sm font-medium text-kpn-green-dark hover:underline',
};

/** Eén knopstijl voor de hele app: primair, secundair, rustig of 'terug'. */
export function Button({ variant = 'secondary', className = '', type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={`focus-visible:outline-2 focus-visible:outline-kpn-green-dark ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
