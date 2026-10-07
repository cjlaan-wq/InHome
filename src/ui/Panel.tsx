import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../state/store';
import { timings } from '../theme';
import { ExploreOverview } from './ExploreOverview';
import { NodeDetail } from './NodeDetail';

// Het paneel moet op zichzelf genoeg zijn om het probleem te begrijpen en op te lossen.
export function Panel() {
  const focusNodeId = useAppStore((s) => s.focusNodeId);
  const root = useRef<HTMLDivElement>(null);

  // Nieuwe weergave: terug naar boven in de scrollende container (zijpaneel of bottom sheet).
  useEffect(() => {
    root.current?.closest('[data-scroll]')?.scrollTo({ top: 0 });
  }, [focusNodeId]);

  return (
    <div ref={root}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={focusNodeId ?? 'overview'}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: timings.uiTransition }}
        >
          {focusNodeId ? <NodeDetail nodeId={focusNodeId} /> : <ExploreOverview />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
