import { t } from '../i18n';
import { useAppStore } from '../state/store';

export function ExtenderToggle() {
  const hasExtender = useAppStore((s) => s.hasExtender);
  const setHasExtender = useAppStore((s) => s.setHasExtender);

  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={hasExtender}
        onChange={(e) => setHasExtender(e.target.checked)}
        className="size-5 accent-kpn-green-dark"
      />
      {t('extender.toggle')}
    </label>
  );
}
