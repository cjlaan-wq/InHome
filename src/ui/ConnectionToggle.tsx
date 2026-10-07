import type { ConnectionType } from '../content/types';
import { t } from '../i18n';
import { useAppStore } from '../state/store';

const options: { value: ConnectionType; label: string }[] = [
  { value: 'fiber', label: t('connection.fiber') },
  { value: 'dsl', label: t('connection.dsl') },
];

/** Glasvezel of DSL: compact, op één regel met het label. */
export function ConnectionToggle() {
  const connectionType = useAppStore((s) => s.connectionType);
  const setConnectionType = useAppStore((s) => s.setConnectionType);

  return (
    <fieldset className="flex items-center gap-3">
      <legend className="sr-only">{t('connection.label')}</legend>
      <span aria-hidden="true" className="shrink-0 text-sm text-ink-muted">
        {t('connection.label')}
      </span>
      <div className="grid flex-1 grid-cols-2 gap-1 rounded-xl bg-scene p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className="cursor-pointer rounded-lg px-2 py-1.5 text-center text-sm font-medium transition-colors has-checked:bg-surface has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-kpn-green-dark"
          >
            <input
              type="radio"
              name="connection-type"
              value={option.value}
              checked={connectionType === option.value}
              onChange={() => setConnectionType(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
