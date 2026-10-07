import { getIssues, getNodes } from '../content';
import { t } from '../i18n';
import { useAppStore } from '../state/store';
import { ConnectionToggle } from './ConnectionToggle';

// Het paneel moet op zichzelf genoeg zijn om het probleem te begrijpen en op te lossen.
export function Panel() {
  const connectionType = useAppStore((s) => s.connectionType);
  const selectIssue = useAppStore((s) => s.selectIssue);
  const focusNode = useAppStore((s) => s.focusNode);
  const issues = getIssues(connectionType);
  const nodes = getNodes(connectionType);

  return (
    <div className="flex flex-col gap-6 p-5">
      <header>
        <h1 className="text-xl font-bold">{t('app.title')}</h1>
        <p className="mt-1 text-sm text-ink-muted">{t('app.intro')}</p>
      </header>

      <ConnectionToggle />

      <section aria-labelledby="issues-heading">
        <h2 id="issues-heading" className="mb-2 font-semibold">
          {t('issues.heading')}
        </h2>
        {issues.length === 0 ? (
          <p className="text-sm text-ink-muted">{t('issues.empty')}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {issues.map((issue) => (
              <li key={issue.id}>
                <button
                  type="button"
                  onClick={() => selectIssue(issue.id)}
                  className="w-full rounded-xl border border-line px-4 py-3 text-left hover:border-kpn-green focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
                >
                  <span className="block font-medium">{issue.title}</span>
                  <span className="block text-sm text-ink-muted">{issue.symptom}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="nodes-heading">
        <h2 id="nodes-heading" className="mb-2 font-semibold">
          {t('nodes.heading')}
        </h2>
        {nodes.length === 0 ? (
          <p className="text-sm text-ink-muted">{t('nodes.empty')}</p>
        ) : (
          <ol className="flex flex-col gap-1">
            {nodes.map((node) => (
              <li key={node.id}>
                <button
                  type="button"
                  onClick={() => focusNode(node.id)}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-scene focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
                >
                  {node.title}
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
