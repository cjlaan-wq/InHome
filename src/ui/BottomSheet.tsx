import { useEffect, useState, type ReactNode } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { t } from '../i18n';
import { useAppStore } from '../state/store';
import { layout, timings } from '../theme';
import { usePrefersReducedMotion } from '../app/hooks';

// Mobiel: uitschuifbare bottom sheet. Ingeklapt vult hij de ruimte onder het canvas,
// uitgeklapt bedekt hij het grootste deel van het scherm.
const collapsedHeight = `${(1 - layout.mobileCanvasHeight) * 100}dvh`;
const expandedHeight = '88dvh';
/** Minimale sleepafstand (px) of veegsnelheid (px/s) om te wisselen. */
const swipe = { offset: 40, velocity: 400 };

export function BottomSheet({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const dragControls = useDragControls();
  const mode = useAppStore((s) => s.mode);
  const selectedIssueId = useAppStore((s) => s.selectedIssueId);

  // Nieuw probleem gekozen of terug naar verkennen: inklappen, zodat je de scène ziet reageren.
  useEffect(() => setExpanded(false), [mode, selectedIssueId]);

  return (
    <motion.aside
      aria-label={t('panel.label')}
      className="fixed inset-x-0 bottom-0 z-10 flex flex-col rounded-t-2xl bg-surface shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
      initial={false}
      animate={{ height: expanded ? expandedHeight : collapsedHeight }}
      transition={{ duration: reducedMotion ? 0 : timings.uiTransition, ease: 'easeOut' }}
      // Alleen slepen vanaf de greep, zodat scrollen in de inhoud gewoon werkt.
      drag={reducedMotion ? false : 'y'}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.15}
      onDragEnd={(_, info) => {
        if (info.offset.y < -swipe.offset || info.velocity.y < -swipe.velocity) setExpanded(true);
        else if (info.offset.y > swipe.offset || info.velocity.y > swipe.velocity) setExpanded(false);
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        onPointerDown={(e) => dragControls.start(e)}
        aria-expanded={expanded}
        aria-label={expanded ? t('sheet.collapse') : t('sheet.expand')}
        className="flex w-full shrink-0 touch-none justify-center py-3 focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
      >
        <span className="h-1.5 w-10 rounded-full bg-line" />
      </button>
      <div data-scroll className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
        {children}
      </div>
    </motion.aside>
  );
}
