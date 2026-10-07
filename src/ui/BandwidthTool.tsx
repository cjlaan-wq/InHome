import { useState } from 'react';
import { activities, exampleSpeed } from '../content/bandwidth';
import { t } from '../i18n';
import { useAppStore } from '../state/store';

const max = 5;

/** Rekenhulp: tel op wat er tegelijk gebeurt en vergelijk met een voorbeeldsnelheid. */
export function BandwidthTool() {
  const connectionType = useAppStore((s) => s.connectionType);
  const [counts, setCounts] = useState<Record<string, number>>({ stream4k: 1, videocall: 1, browse: 2 });
  const speed = exampleSpeed[connectionType];
  const used = activities.reduce((sum, a) => sum + a.mbps * (counts[a.id] ?? 0), 0);
  const share = used / speed;
  const verdict = share <= 0.6 ? 'fits' : share <= 1 ? 'tight' : 'full';
  const barColor = verdict === 'fits' ? 'bg-kpn-green-dark' : verdict === 'tight' ? 'bg-coverage-fair' : 'bg-warning-dark';
  const change = (id: string, delta: number) =>
    setCounts((c) => ({ ...c, [id]: Math.max(0, Math.min(max, (c[id] ?? 0) + delta)) }));

  return (
    <section className="rounded-xl border border-line p-4" aria-labelledby="bandwidth-heading">
      <h4 id="bandwidth-heading" className="font-semibold">
        {t('bandwidth.title')}
      </h4>
      <p className="mt-1 text-sm text-ink-muted">{t('bandwidth.intro')}</p>
      <ul className="mt-3 flex flex-col gap-1.5 text-sm">
        {activities.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-2">
            <span>
              {a.label} <span className="text-xs text-ink-muted">({a.mbps} Mbit/s)</span>
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <StepButton label={t('bandwidth.less', { label: a.label })} onClick={() => change(a.id, -1)} disabled={!counts[a.id]}>
                −
              </StepButton>
              <span className="w-5 text-center tabular-nums" aria-live="polite">
                {counts[a.id] ?? 0}
              </span>
              <StepButton label={t('bandwidth.more', { label: a.label })} onClick={() => change(a.id, 1)} disabled={(counts[a.id] ?? 0) >= max}>
                +
              </StepButton>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink-muted">
        {t('bandwidth.speed', { type: connectionType === 'fiber' ? 'glasvezel' : 'DSL', speed })}
      </p>
      <div
        className="mt-1 h-3 overflow-hidden rounded-full bg-scene"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={speed}
        aria-valuenow={Math.min(used, speed)}
        aria-label={t('bandwidth.used', { used, speed })}
      >
        <div className={`h-full ${barColor}`} style={{ width: `${Math.min(100, share * 100)}%` }} />
      </div>
      <p className="mt-1 text-sm" aria-live="polite">
        <span className="font-medium">{t('bandwidth.used', { used, speed })}</span> · {t(`bandwidth.${verdict}`)}
      </p>
      <p className="mt-2 text-xs text-ink-muted">{t('bandwidth.note')}</p>
    </section>
  );
}

function StepButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled: boolean; children: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-8 items-center justify-center rounded-lg border border-line text-base hover:bg-scene disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
    >
      {children}
    </button>
  );
}
