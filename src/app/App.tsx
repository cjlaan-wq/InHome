import { lazy, Suspense, useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { ChainDiagram } from '../fallback/ChainDiagram';
import { t } from '../i18n';
import { layout } from '../theme';
import { BottomSheet } from '../ui/BottomSheet';
import { Panel } from '../ui/Panel';
import { useAppStore } from '../state/store';
import { hasWebGL, useIsDesktop } from './hooks';

// Het 3D-canvas wordt lazy geladen; het tekstpaneel staat er direct.
const Scene = lazy(() => import('../scene/Scene'));

function Stage() {
  const [webgl] = useState(hasWebGL);
  if (!webgl) return <ChainDiagram />;
  return (
    <Suspense
      fallback={<div className="flex h-full items-center justify-center text-sm text-ink-muted">{t('scene.loading')}</div>}
    >
      <Scene />
    </Suspense>
  );
}

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/** Sneltoetsen: Escape terug naar het overzicht; ← → door de stappen van een probleem. */
function useKeyboardShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.altKey || e.ctrlKey || e.metaKey) return;
      const state = useAppStore.getState();
      if (e.key === 'Escape') {
        if (state.mode === 'issue') state.backToExplore();
        else if (state.focusNodeId) state.focusNode(null);
      } else if (state.mode === 'issue' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        state.setStep(state.activeStep + (e.key === 'ArrowRight' ? 1 : -1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

export function App() {
  useKeyboardShortcuts();
  return (
    // Framer-motion respecteert prefers-reduced-motion voor alle UI-overgangen.
    <MotionConfig reducedMotion="user">
      <Layout />
    </MotionConfig>
  );
}

function Layout() {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <div className="flex h-full">
        <main className="relative isolate min-w-0 flex-1">
          <Stage />
        </main>
        <aside
          data-scroll
          className="h-full shrink-0 overflow-y-auto border-l border-line bg-surface"
          style={{ width: layout.panelWidth }}
        >
          <Panel />
        </aside>
      </div>
    );
  }

  return (
    <div className="h-full">
      <main className="relative isolate" style={{ height: `${layout.mobileCanvasHeight * 100}dvh` }}>
        <Stage />
      </main>
      <BottomSheet>
        <Panel />
      </BottomSheet>
    </div>
  );
}
