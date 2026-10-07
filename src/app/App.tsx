import { lazy, Suspense, useState } from 'react';
import { ChainDiagram } from '../fallback/ChainDiagram';
import { t } from '../i18n';
import { layout } from '../theme';
import { BottomSheet } from '../ui/BottomSheet';
import { Panel } from '../ui/Panel';
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

export function App() {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <div className="flex h-full">
        <main className="min-w-0 flex-1">
          <Stage />
        </main>
        <aside
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
      <main style={{ height: `${layout.mobileCanvasHeight * 100}dvh` }}>
        <Stage />
      </main>
      <BottomSheet>
        <Panel />
      </BottomSheet>
    </div>
  );
}
