import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { t } from '../i18n';
import { layout, timings } from '../theme';
import { usePrefersReducedMotion } from '../app/hooks';

// Mobiel: uitschuifbare bottom sheet. Ingeklapt vult hij de ruimte onder het canvas,
// uitgeklapt bedekt hij het grootste deel van het scherm. De greep zit onderaan bereik van de duim.
const collapsedHeight = `${(1 - layout.mobileCanvasHeight) * 100}dvh`;
const expandedHeight = '88dvh';

export function BottomSheet({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.section
      className="fixed inset-x-0 bottom-0 z-10 flex flex-col rounded-t-2xl bg-surface shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
      initial={false}
      animate={{ height: expanded ? expandedHeight : collapsedHeight }}
      transition={{ duration: reducedMotion ? 0 : timings.uiTransition, ease: 'easeOut' }}
      drag={reducedMotion ? false : 'y'}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.15}
      onDragEnd={(_, info) => {
        if (info.offset.y < -40) setExpanded(true);
        if (info.offset.y > 40) setExpanded(false);
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={expanded ? t('sheet.collapse') : t('sheet.expand')}
        className="flex w-full shrink-0 justify-center py-3 focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
      >
        <span className="h-1.5 w-10 rounded-full bg-line" />
      </button>
      <div data-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
        {children}
      </div>
    </motion.section>
  );
}
