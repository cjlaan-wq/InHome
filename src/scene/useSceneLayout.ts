import { useMemo } from 'react';
import { useAppStore } from '../state/store';
import { useHome } from '../state/useHome';
import { computeSceneLayout } from './layout';

/** De scènelayout voor het huidige 'Jouw huis' en de zichtbare verdiepingen. */
export function useSceneLayout() {
  const home = useHome();
  const visibleFloor = useAppStore((s) => s.visibleFloor);
  return useMemo(
    () => computeSceneLayout(home.house, home.placement, home.hasExtender, home.coverage, visibleFloor),
    [home, visibleFloor],
  );
}
