import type { Quality } from '../state/coverage';

const filled: Record<Quality, number> = { good: 3, fair: 2, weak: 1 };
const color: Record<Quality, string> = { good: 'bg-kpn-green-dark', fair: 'bg-coverage-fair', weak: 'bg-warning-dark' };

/** Drie signaalstreepjes: geeft de wifi-kwaliteit aan, naast het woord (niet alleen kleur). */
export function SignalBars({ quality }: { quality: Quality }) {
  return (
    <span className="inline-flex items-end gap-0.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-1 rounded-sm ${i < filled[quality] ? color[quality] : 'bg-line'}`}
          style={{ height: 5 + i * 3 }}
        />
      ))}
    </span>
  );
}
