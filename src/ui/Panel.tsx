import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useActiveIssue } from '../state/issueStatus';
import { useAppStore } from '../state/store';
import { timings } from '../theme';
import { ExploreOverview } from './ExploreOverview';
import { IssueView } from './IssueView';
import { NodeDetail } from './NodeDetail';

// Het paneel moet op zichzelf genoeg zijn om het probleem te begrijpen en op te lossen.
export function Panel() {
  const mode = useAppStore((s) => s.mode);
  const focusNodeId = useAppStore((s) => s.focusNodeId);
  const issue = useActiveIssue();
  const root = useRef<HTMLDivElement>(null);

  const view = issue ? `issue:${issue.id}` : focusNodeId ? `node:${focusNodeId}` : 'overview';

  // Nieuwe weergave: terug naar boven in de scrollende container (zijpaneel of bottom sheet).
  useEffect(() => {
    root.current?.closest('[data-scroll]')?.scrollTo({ top: 0 });
  }, [view]);

  return (
    <div ref={root} className="min-h-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          className="min-h-full"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: timings.uiTransition }}
        >
          {mode === 'issue' && issue ? (
            <IssueView issue={issue} />
          ) : focusNodeId ? (
            <NodeDetail nodeId={focusNodeId} />
          ) : (
            <ExploreOverview />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
