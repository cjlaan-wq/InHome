import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getActiveNodes, issueStepCount } from '../content';
import type { Fix, Issue } from '../content/types';
import { t } from '../i18n';
import { useAppStore } from '../state/store';
import { timings } from '../theme';
import { ExternalIcon, WarningIcon } from './Icons';

/** Probleemmodus: uitleg in stappen, daarna de oplossingen en een 'Lukt het niet?'-route. */
export function IssueView({ issue }: { issue: Issue }) {
  const activeStep = useAppStore((s) => s.activeStep);
  const setStep = useAppStore((s) => s.setStep);
  const backToExplore = useAppStore((s) => s.backToExplore);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const total = issueStepCount(issue);
  const isFixes = activeStep >= issue.steps.length;
  const step = issue.steps[activeStep];
  const isLast = activeStep === total - 1;

  // Bij een nieuwe stap: focus naar de kop (niet bij openen, dan blijft de focus bij de probleemkop).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    heading.current?.focus({ preventScroll: true });
    heading.current?.closest('[data-scroll]')?.scrollTo({ top: 0 });
  }, [activeStep]);

  return (
    <article className="flex min-h-full flex-col" aria-labelledby="issue-title">
      <div className="flex flex-1 flex-col gap-4 p-5 pt-3 md:gap-5 md:pt-5">
        <button
          type="button"
          onClick={backToExplore}
          className="self-start rounded-lg py-1 text-sm font-medium text-kpn-green-dark hover:underline focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
        >
          ← {t('issue.back')}
        </button>

        <header>
          {/* Op mobiel compact, zodat de stap zelf boven de vouw staat. */}
          <p className="hidden text-xs font-medium uppercase tracking-wide text-ink-muted md:block">
            {t('issues.heading')}
          </p>
          <h2 id="issue-title" className="text-lg font-bold md:mt-1 md:text-xl">
            {issue.title}
          </h2>
          <p className="mt-1 hidden text-sm text-ink-muted md:block">{issue.symptom}</p>
        </header>

        <StepProgress total={total} active={activeStep} onSelect={setStep} />

        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={activeStep}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: timings.uiTransition }}
            aria-live="polite"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              {t('issue.step', { index: activeStep + 1, total })}
            </p>
            <h3 ref={heading} tabIndex={-1} className="mt-1 text-lg font-semibold outline-none">
              {isFixes ? t('issue.fixesTitle') : step.title}
            </h3>
            {isFixes ? <Fixes issue={issue} /> : <p className="mt-2 leading-relaxed">{step.body}</p>}
          </motion.section>
        </AnimatePresence>

        <AffectedList issue={issue} />

        {issue.draft && <p className="mt-auto text-xs text-ink-muted">{t('issue.draft')}</p>}
      </div>

      {/* Navigatie onderaan, binnen bereik van de duim; blijft zichtbaar tijdens scrollen. */}
      <nav className="sticky bottom-0 grid grid-cols-2 gap-2 border-t border-line bg-surface p-4">
        <button
          type="button"
          onClick={() => setStep(activeStep - 1)}
          disabled={activeStep === 0}
          className="rounded-xl border border-line px-4 py-3 font-medium hover:border-kpn-green disabled:invisible focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
        >
          ← {t('issue.previous')}
        </button>
        <button
          type="button"
          onClick={() => (isLast ? backToExplore() : setStep(activeStep + 1))}
          className="rounded-xl bg-kpn-green-dark px-4 py-3 font-medium text-white hover:bg-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kpn-green-dark"
        >
          {isLast ? t('issue.done') : activeStep === issue.steps.length - 1 ? t('issue.toFixes') : t('issue.next')} →
        </button>
      </nav>
    </article>
  );
}

/** Betrokken onderdelen als tekst met icoon: niet alleen kleur in de scène. */
function AffectedList({ issue }: { issue: Issue }) {
  const connectionType = useAppStore((s) => s.connectionType);
  const hasExtender = useAppStore((s) => s.hasExtender);
  const nodes = getActiveNodes(connectionType, hasExtender).filter((node) => issue.affectedNodes.includes(node.id));

  const items = nodes.flatMap<{ key: string; label: string }>((node) =>
    node.parts && issue.affectedParts?.length
      ? node.parts
          .filter((part) => issue.affectedParts!.includes(part.id))
          .map((part) => ({ key: part.id, label: t('issue.affectedPart', { device: part.label, room: part.room }) }))
      : [{ key: node.id, label: node.label }],
  );

  return (
    <section aria-labelledby="affected-heading">
      <h3 id="affected-heading" className="mb-2 text-sm font-semibold">
        {t('issue.affected')}
      </h3>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-sm ring-1 ring-warning"
          >
            <WarningIcon className="size-4 text-warning-dark" />
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

function StepProgress({ total, active, onSelect }: { total: number; active: number; onSelect: (i: number) => void }) {
  return (
    <ol className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <li key={i} className="flex-1">
          <button
            type="button"
            onClick={() => onSelect(i)}
            aria-label={t('issue.goToStep', { index: i + 1 })}
            aria-current={i === active ? 'step' : undefined}
            className="block w-full py-2 focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
          >
            <span className={`block h-1.5 rounded-full ${i <= active ? 'bg-kpn-green-dark' : 'bg-line'}`} />
          </button>
        </li>
      ))}
    </ol>
  );
}

function Fixes({ issue }: { issue: Issue }) {
  return (
    <div className="mt-2 flex flex-col gap-4">
      <p className="text-sm text-ink-muted">{t('issue.fixesIntro')}</p>
      <ol className="flex flex-col gap-3">
        {issue.fixes.map((fix, i) => (
          <FixCard key={fix.title} fix={fix} index={i} />
        ))}
      </ol>
      <section className="rounded-xl bg-scene p-4" aria-labelledby="escalation-heading">
        <h4 id="escalation-heading" className="font-semibold">
          {t('issue.escalationTitle')}
        </h4>
        <p className="mt-1 text-sm text-ink-muted">{t('issue.escalationBody')}</p>
        <ExternalLink href={issue.escalation.href} label={issue.escalation.label} />
      </section>
    </div>
  );
}

function FixCard({ fix, index }: { fix: Fix; index: number }) {
  const hasExtender = useAppStore((s) => s.hasExtender);
  const setHasExtender = useAppStore((s) => s.setHasExtender);

  return (
    <li className="rounded-xl border border-line p-4">
      <h4 className="flex items-center gap-2 font-semibold">
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-kpn-green-dark text-xs text-white"
        >
          {index + 1}
        </span>
        {fix.title}
      </h4>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed marker:text-ink-muted">
        {fix.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      {fix.demo === 'extender' && (
        <button
          type="button"
          onClick={() => setHasExtender(!hasExtender)}
          aria-pressed={hasExtender}
          className="mt-3 rounded-lg border border-kpn-green-dark px-3 py-2 text-sm font-medium text-kpn-green-dark hover:bg-scene focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
        >
          {hasExtender ? t('issue.demoHide') : t('issue.demoShow')}
        </button>
      )}
      {fix.cta && <ExternalLink href={fix.cta.href} label={fix.cta.label} />}
    </li>
  );
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-kpn-green-dark underline underline-offset-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
    >
      {label}
      <ExternalIcon />
      <span className="sr-only">{t('issue.newTab')}</span>
    </a>
  );
}
