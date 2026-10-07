import type { ConnectionType } from '../content/types';
import { t } from '../i18n';
import { useAppStore } from '../state/store';

const options: { value: ConnectionType; label: string }[] = [
  { value: 'fiber', label: t('connection.fiber') },
  { value: 'dsl', label: t('connection.dsl') },
];

export function ConnectionToggle() {
  const connectionType = useAppStore((s) => s.connectionType);
  const setConnectionType = useAppStore((s) => s.setConnectionType);

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink-muted">{t('connection.label')}</legend>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-scene p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className="cursor-pointer rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors has-checked:bg-surface has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-kpn-green-dark"
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
