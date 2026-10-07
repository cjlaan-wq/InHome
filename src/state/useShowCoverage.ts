import { useActiveIssue } from './issueStatus';
import { useAppStore } from './store';

/** De wifi-dekking per kamer is zichtbaar bij 'Jouw huis', bij uitleg over wifi en bij 'zwak signaal'. */
export function useShowCoverage() {
  const mode = useAppStore((s) => s.mode);
  const focusNodeId = useAppStore((s) => s.focusNodeId);
  const issue = useActiveIssue();
  return mode === 'home' || (mode === 'explore' && focusNodeId === 'wifi') || issue?.visualEffect === 'weak-signal';
}
