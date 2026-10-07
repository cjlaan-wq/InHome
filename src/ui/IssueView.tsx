import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fillTemplate, getActiveNodes, issueCategories, issueStepCount } from '../content';
import type { Fix, Issue } from '../content/types';
import { t } from '../i18n';
import { affectedParts } from '../state/issueStatus';
import { useAppStore } from '../state/store';
import { useHome } from '../state/useHome';
import { timings } from '../theme';
import { Button } from './Button';
import { CategoryIcon, ExternalIcon, WarningIcon } from './Icons';
import { useFocusOnMount } from './useFocusOnMount';
import { BandwidthTool } from './BandwidthTool';

/** Probleemmodus: uitleg in stappen, daarna de oplossingen en een 'Lukt het niet?'-route. */
export function IssueView({ issue }: { issue: Issue }) {
  const activeStep = useAppStore((s) => s.activeStep);
  const setStep = useAppStore((s) => s.setStep);
  const backToExplore = useAppStore((s) => s.backToExplore);
  const title = useFocusOnMount<HTMLHeadingElement>();
  const home = useHome();
  // Teksten met {placeholders} invullen met jouw huis (bijv. 'je telefoon op de zolder').
  const fill = (text: string) => fillTemplate(text, home.templateVars);
  // Pas na de eerste stapwissel gaat de focus naar de stap (bij openen staat hij op de titel).
  const openedAtStep = useRef(activeStep);
  const stepChanged = useRef(false);
  if (activeStep !== openedAtStep.current) stepChanged.current = true;

  const total = issueStepCount(issue);
  const isFixes = activeStep >= issue.steps.length;
  const step = issue.steps[activeStep];
  const isLast = activeStep === total - 1;

  return (
    <article className="flex min-h-full flex-col" aria-labelledby="issue-title">
      <div className="flex flex-1 flex-col gap-4 p-5 pt-3 md:gap-5 md:pt-5">
        <Button variant="back" onClick={backToExplore}>
          ← {t('issue.back')}
        </Button>

        <header>
          {/* Op mobiel compact, zodat de stap zelf boven de vouw staat. */}
          <p className="hidden items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-muted md:flex">
            <CategoryIcon id={issue.category} className="size-4 text-kpn-green-dark" />
            {issueCategories.find((c) => c.id === issue.category)?.label}
          </p>
          <h2 id="issue-title" ref={title} tabIndex={-1} className="text-lg font-bold outline-none md:mt-1 md:text-xl">
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
          >
            <StepHeading
              eyebrow={t('issue.step', { index: activeStep + 1, total })}
              title={isFixes ? t('issue.fixesTitle') : fill(step.title)}
              autoFocus={stepChanged.current}
            />
            {isFixes ? <Fixes issue={issue} fill={fill} /> : <p className="mt-2 leading-relaxed">{fill(step.body)}</p>}
          </motion.section>
        </AnimatePresence>

        <AffectedList issue={issue} />

        {issue.draft && <p className="mt-auto text-xs text-ink-muted">{t('issue.draft')}</p>}
      </div>

      {/* Navigatie onderaan, binnen bereik van de duim; blijft zichtbaar tijdens scrollen. */}
      <nav className="sticky bottom-0 grid grid-cols-2 gap-2 border-t border-line bg-surface p-4">
        <Button variant="quiet" onClick={() => setStep(activeStep - 1)} disabled={activeStep === 0} className="py-3 disabled:invisible">
          ← {t('issue.previous')}
        </Button>
        <Button variant="primary" onClick={() => (isLast ? backToExplore() : setStep(activeStep + 1))} className="py-3">
          {isLast ? t('issue.done') : activeStep === issue.steps.length - 1 ? t('issue.toFixes') : t('issue.next')} →
        </Button>
      </nav>
    </article>
  );
}

/** Kop van een stap. Krijgt de focus zodra hij verschijnt (na de overgang), zodat je bij de nieuwe stap begint. */
function StepHeading({ eyebrow, title, autoFocus }: { eyebrow: string; title: string; autoFocus: boolean }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!autoFocus) return;
    heading.current?.focus({ preventScroll: true });
    heading.current?.closest('[data-scroll]')?.scrollTo({ top: 0 });
  }, [autoFocus]);

  return (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{eyebrow}</p>
      <h3 ref={heading} tabIndex={-1} className="mt-1 text-lg font-semibold outline-none">
        {title}
      </h3>
    </>
  );
}

/** Betrokken onderdelen als tekst met icoon: niet alleen kleur in de scène. */
function AffectedList({ issue }: { issue: Issue }) {
  const connectionType = useAppStore((s) => s.connectionType);
  const hasExtender = useAppStore((s) => s.hasExtender);
  const home = useHome();
  const parts = affectedParts(issue, home.coverage);
  const nodes = getActiveNodes(connectionType, hasExtender).filter((node) => issue.affectedNodes.includes(node.id));

  const items = nodes.flatMap<{ key: string; label: string }>((node) =>
    node.parts && parts
      ? node.parts
          .filter((part) => parts.includes(part.id))
          .map((part) => ({
            key: part.id,
            label: t('issue.affectedPart', { device: part.label, room: home.roomLabel(home.placement.deviceRooms[part.id]) }),
          }))
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

function Fixes({ issue, fill }: { issue: Issue; fill: (text: string) => string }) {
  return (
    <div className="mt-2 flex flex-col gap-4">
      <p className="text-sm text-ink-muted">{t('issue.fixesIntro')}</p>
      {issue.tool === 'bandwidth' && <BandwidthTool />}
      <ol className="flex flex-col gap-3">
        {issue.fixes.map((fix, i) => (
          <FixCard key={fix.title} fix={fix} index={i} fill={fill} />
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

function FixCard({ fix, index, fill }: { fix: Fix; index: number; fill: (text: string) => string }) {
  const hasExtender = useAppStore((s) => s.hasExtender);
  const setHasExtender = useAppStore((s) => s.setHasExtender);
  const addExtender = useAppStore((s) => s.addExtender);
  const setDeviceWired = useAppStore((s) => s.setDeviceWired);
  const { coverage, house, placement, deviceLabel } = useHome();
  const wireDevice = typeof fix.demo === 'object' ? fix.demo.wire : undefined;
  const isWired = wireDevice ? placement.wiredDevices.includes(wireDevice) : false;

  return (
    <li className="rounded-xl border border-line p-4">
      <h4 className="flex items-center gap-2 font-semibold">
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-kpn-green-dark text-xs text-white"
        >
          {index + 1}
        </span>
        {fill(fix.title)}
      </h4>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed marker:text-ink-muted">
        {fix.steps.map((step) => (
          <li key={step}>{fill(step)}</li>
        ))}
      </ol>
      {fix.demo === 'extender' && (
        <Button
          variant="secondary"
          className="mt-3"
          // Zet het SuperWifi-punt meteen op de beste plek in jouw huis.
          onClick={() =>
            hasExtender ? setHasExtender(false) : addExtender(coverage.bestExtenderRoomId ?? house.defaults.extenderRoomId)
          }
          aria-pressed={hasExtender}
        >
          {hasExtender ? t('issue.demoHide') : t('issue.demoShow')}
        </Button>
      )}
      {wireDevice && (
        <Button
          variant="secondary"
          className="mt-3"
          // Sluit het apparaat (in de tekening) aan met een netwerkkabel, of haal de kabel weer weg.
          onClick={() => setDeviceWired(wireDevice, !isWired)}
          aria-pressed={isWired}
          aria-label={`${isWired ? t('issue.demoWireHide') : t('issue.demoWireShow')}: ${deviceLabel(wireDevice)}`}
        >
          {isWired ? t('issue.demoWireHide') : t('issue.demoWireShow')}
        </Button>
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
