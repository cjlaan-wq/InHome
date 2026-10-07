import { lazy, Suspense, useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { ChainDiagram } from '../fallback/ChainDiagram';
import { t } from '../i18n';
import { layout } from '../theme';
import { BottomSheet } from '../ui/BottomSheet';
import { Panel } from '../ui/Panel';
import { saveHome } from '../state/persistHome';
import { useAppStore } from '../state/store';
import { hasWebGL, useIsDesktop } from './hooks';

// Het 3D-canvas wordt lazy geladen; het tekstpaneel staat er direct.
const Scene = lazy(() => import('../scene/Scene'));

/** ?2d in de URL forceert de 2D-fallback (handig om te testen en te demonstreren). */
const force2d = new URLSearchParams(window.location.search).has('2d');

function Stage() {
  const [webgl] = useState(() => !force2d && hasWebGL());
  return (
    <>
      <h1 className="sr-only">{t('app.title')}</h1>
      {webgl ? <Scene3D /> : <ChainDiagram />}
    </>
  );
}

function Scene3D() {
  return (
    <>
      {/* Beschrijving voor schermlezers; alle informatie staat ook in het paneel. */}
      <p className="sr-only">{t('scene.ariaLabel')}</p>
      <Suspense
        fallback={<div className="flex h-full items-center justify-center text-sm text-ink-muted">{t('scene.loading')}</div>}
      >
        <Scene />
      </Suspense>
    </>
  );
}

/** Typt de gebruiker ergens? (Keuzerondjes en vinkjes tellen niet: daar werken sneltoetsen gewoon.) */
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['TEXTAREA', 'SELECT'].includes(target.tagName) ||
    (target instanceof HTMLInputElement && !['radio', 'checkbox', 'button'].includes(target.type)));

/** Sneltoetsen: Escape terug naar het overzicht; ← → door de stappen van een probleem. */
function useKeyboardShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.altKey || e.ctrlKey || e.metaKey) return;
      const state = useAppStore.getState();
      if (e.key === 'Escape') {
        if (state.mode === 'issue' || state.mode === 'home') state.backToExplore();
        else if (state.focusNodeId) state.focusNode(null);
      } else if (state.mode === 'issue' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        state.setStep(state.activeStep + (e.key === 'ArrowRight' ? 1 : -1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/** 'Jouw huis' bewaren (op dit apparaat en in de link) zodra er iets verandert. */
function useSaveHome() {
  useEffect(
    () =>
      useAppStore.subscribe((state, previous) => {
        if (
          state.houseId !== previous.houseId ||
          state.placement !== previous.placement ||
          state.hasExtender !== previous.hasExtender
        )
          saveHome({ houseId: state.houseId, placement: state.placement, hasExtender: state.hasExtender });
      }),
    [],
  );
}

export function App() {
  useKeyboardShortcuts();
  useSaveHome();
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
          aria-label={t('panel.label')}
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
