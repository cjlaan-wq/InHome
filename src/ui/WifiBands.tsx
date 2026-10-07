import { useEffect } from 'react';
import { wifiBands, wifiBandsIntro } from '../content/wifiBands';
import { t } from '../i18n';
import { useAppStore } from '../state/store';

/** 2,4 GHz en 5 GHz: uitleg plus een knop om het verschil in bereik in de scène te zien. */
export function WifiBands() {
  const wifiBand = useAppStore((s) => s.wifiBand);
  const setWifiBand = useAppStore((s) => s.setWifiBand);
  // Weg van deze uitleg: de scène weer gewoon.
  useEffect(() => () => setWifiBand(null), [setWifiBand]);

  return (
    <section aria-labelledby="bands-heading" className="flex flex-col gap-2">
      <h3 id="bands-heading" className="text-sm font-semibold">
        {t('wifiBands.heading')}
      </h3>
      <p className="text-sm text-ink-muted">{wifiBandsIntro}</p>
      <div className="grid grid-cols-2 gap-2">
        {wifiBands.map((band) => {
          const active = wifiBand === band.id;
          return (
            <button
              key={band.id}
              type="button"
              aria-pressed={active}
              aria-label={t('wifiBands.show', { band: band.label })}
              onClick={() => setWifiBand(active ? null : band.id)}
              className={`rounded-xl border p-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-kpn-green-dark ${
                active ? 'border-kpn-green-dark bg-scene ring-1 ring-kpn-green-dark' : 'border-line hover:border-kpn-green'
              }`}
            >
              <span className="block font-semibold">{band.label}</span>
              <span className="block font-medium">{band.title}</span>
              <span className="mt-1 block text-ink-muted">{band.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
