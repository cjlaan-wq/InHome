import { getActiveNodes, getIssues } from '../content';
import { t } from '../i18n';
import { useAppStore } from '../state/store';
import { ConnectionToggle } from './ConnectionToggle';
import { ExtenderToggle } from './ExtenderToggle';
import { useFocusOnMount } from './useFocusOnMount';
import { useHome } from '../state/useHome';

/** Startweergave van het paneel: verbinding kiezen, probleem kiezen of een onderdeel bekijken. */
export function ExploreOverview() {
  const connectionType = useAppStore((s) => s.connectionType);
  const hasExtender = useAppStore((s) => s.hasExtender);
  const selectIssue = useAppStore((s) => s.selectIssue);
  const focusNode = useAppStore((s) => s.focusNode);
  const issues = getIssues(connectionType);
  const nodes = getActiveNodes(connectionType, hasExtender);
  const heading = useFocusOnMount<HTMLHeadingElement>();
  const openHome = useAppStore((s) => s.openHome);
  const home = useHome();

  return (
    <div className="flex flex-col gap-6 p-5">
      <header>
        <h2 ref={heading} tabIndex={-1} className="text-xl font-bold outline-none">
          {t('app.title')}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{t('app.intro')}</p>
      </header>

      <div className="flex flex-col gap-3">
        <ConnectionToggle />
        <ExtenderToggle />
      </div>

      <section aria-labelledby="issues-heading">
        <h3 id="issues-heading" className="mb-2 font-semibold">
          {t('issues.heading')}
        </h3>
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

      <section aria-labelledby="home-card-heading" className="rounded-xl bg-scene p-4">
        <h3 id="home-card-heading" className="font-semibold">
          {t('home.cardTitle')}
        </h3>
        <p className="mt-1 text-sm text-ink-muted">
          {t('home.cardSummary', { house: home.house.label, roomIn: home.roomIn(home.placement.modemRoomId) })}
        </p>
        <p className="mt-1 text-sm">{t('home.cardBody')}</p>
        <button
          type="button"
          onClick={openHome}
          className="mt-3 rounded-lg bg-kpn-green-dark px-4 py-2 text-sm font-medium text-white hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kpn-green-dark"
        >
          {t('home.open')} →
        </button>
      </section>

      <section aria-labelledby="nodes-heading">
        <h3 id="nodes-heading" className="mb-2 font-semibold">
          {t('nodes.heading')}
        </h3>
        <ol className="flex flex-col gap-1">
          {nodes.map((node, index) => (
            <li key={node.id}>
              <button
                type="button"
                onClick={() => focusNode(node.id)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-scene focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
              >
                <span
                  aria-hidden="true"
                  className="flex size-6 shrink-0 items-center justify-center rounded-full bg-scene text-xs font-semibold text-ink-muted"
                >
                  {index + 1}
                </span>
                <span className="flex-1">{node.title}</span>
                <span aria-hidden="true" className="text-ink-muted">
                  ›
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
