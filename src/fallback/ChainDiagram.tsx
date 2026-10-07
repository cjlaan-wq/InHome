import { t } from '../i18n';

// 2D-fallback als WebGL niet beschikbaar is. Wordt in mijlpaal 5 een volledig SVG-diagram van de keten.
export function ChainDiagram() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <svg viewBox="0 0 200 40" className="w-full max-w-md" aria-hidden="true">
        <line x1="10" y1="20" x2="190" y2="20" stroke="currentColor" strokeWidth="2" className="text-kpn-green" />
      </svg>
      <p className="text-sm text-ink-muted">{t('fallback.notice')}</p>
    </div>
  );
}
