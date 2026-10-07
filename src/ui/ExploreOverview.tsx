import { getActiveNodes, getIssues, issueCategories } from '../content';
import { t } from '../i18n';
import { useAppStore } from '../state/store';
import { useHome } from '../state/useHome';
import { Button } from './Button';
import { ConnectionToggle } from './ConnectionToggle';
import { CategoryIcon, ChevronIcon, HomeIcon } from './Icons';
import { SignalBars } from './SignalBars';
import { useFocusOnMount } from './useFocusOnMount';

/**
 * Startweergave van het paneel, in volgorde van belang:
 * 1. Wat is er aan de hand? (problemen in groepen) · 2. Jouw huis · 3. Hoe werkt het?
 */
export function ExploreOverview() {
  const connectionType = useAppStore((s) => s.connectionType);
  const hasExtender = useAppStore((s) => s.hasExtender);
  const selectIssue = useAppStore((s) => s.selectIssue);
  const focusNode = useAppStore((s) => s.focusNode);
  const openHome = useAppStore((s) => s.openHome);
  const heading = useFocusOnMount<HTMLHeadingElement>();
  const home = useHome();
  const issues = getIssues(connectionType);
  const nodes = getActiveNodes(connectionType, hasExtender);

  return (
    <div className="flex flex-col gap-6 p-5">
      <header className="flex flex-col gap-3">
        <div>
          <h2 ref={heading} tabIndex={-1} className="text-xl font-bold outline-none">
            {t('app.title')}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">{t('app.intro')}</p>
        </div>
        <ConnectionToggle />
      </header>

      <section aria-labelledby="issues-heading" className="flex flex-col gap-4">
        <h3 id="issues-heading" className="text-lg font-semibold">
          {t('issues.heading')}
        </h3>
        {issueCategories.map((category) => {
          const inCategory = issues.filter((issue) => issue.category === category.id);
          if (inCategory.length === 0) return null;
          return (
            <div key={category.id}>
              <h4 className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-ink-muted">
                <CategoryIcon id={category.id} className="size-4 text-kpn-green-dark" />
                {category.label}
              </h4>
              <ul className="overflow-hidden rounded-xl border border-line">
                {inCategory.map((issue) => (
                  <li key={issue.id} className="border-b border-line last:border-b-0">
                    <button
                      type="button"
                      onClick={() => selectIssue(issue.id)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-scene focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-kpn-green-dark"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{issue.title}</span>
                        <span className="block text-xs text-ink-muted">{issue.symptom}</span>
                      </span>
                      <ChevronIcon className="size-4 shrink-0 text-ink-muted" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section aria-labelledby="home-card-heading" className="rounded-xl bg-scene p-4">
        <div className="flex items-start gap-3">
          <HomeIcon className="size-7 shrink-0 text-kpn-green-dark" />
          <div className="min-w-0 flex-1">
            <h3 id="home-card-heading" className="font-semibold">
              {t('home.cardTitle')}
            </h3>
            <p className="text-sm text-ink-muted">
              {t('home.cardSummary', { house: home.house.label, roomIn: home.roomIn(home.placement.modemRoomId) })}
            </p>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {(['good', 'fair', 'weak'] as const)
                .filter((q) => home.deviceSummary[q] > 0)
                .map((q) => (
                  <span key={q} className="flex items-center gap-1">
                    <SignalBars quality={q} />
                    {t('home.summaryCount', { count: home.deviceSummary[q], quality: t(`quality.${q}`) })}
                  </span>
                ))}
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm">{t('home.cardBody')}</p>
        <Button variant="primary" onClick={openHome} className="mt-3 w-full text-sm">
          {t('home.open')} →
        </Button>
      </section>

      <section aria-labelledby="nodes-heading" className="flex flex-col gap-2">
        <h3 id="nodes-heading" className="text-lg font-semibold">
          {t('nodes.heading')}
        </h3>
        <p className="text-sm text-ink-muted">{t('nodes.intro')}</p>
        <Button variant="secondary" onClick={() => focusNode(nodes[0].id)} className="self-start">
          {t('nodes.tour')} →
        </Button>
        <details className="group mt-1">
          <summary className="cursor-pointer list-none rounded-lg py-1 text-sm font-medium text-kpn-green-dark hover:underline focus-visible:outline-2 focus-visible:outline-kpn-green-dark">
            <span className="inline-block transition-transform group-open:rotate-90">›</span> {t('nodes.all', { count: nodes.length })}
          </summary>
          <ol className="mt-1 flex flex-col">
            {nodes.map((node, index) => (
              <li key={node.id}>
                <button
                  type="button"
                  onClick={() => focusNode(node.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-scene focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-6 shrink-0 items-center justify-center rounded-full bg-scene text-xs font-semibold text-ink-muted"
                  >
                    {index + 1}
                  </span>
                  <span className="flex-1">{node.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </details>
      </section>
    </div>
  );
}
