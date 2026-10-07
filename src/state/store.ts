import { create } from 'zustand';
import { getIssue, issueStepCount, issueStepFocus } from '../content';
import type { ConnectionType, DeviceId, NodeId } from '../content/types';

export type Mode = 'explore' | 'issue';

export type Hovered = { nodeId: NodeId; partId?: DeviceId };

type AppState = {
  mode: Mode;
  connectionType: ConnectionType;
  /** Heeft de klant een SuperWifi-punt? */
  hasExtender: boolean;
  /** Onderdeel waar de camera op gericht is (null = overzicht). */
  focusNodeId: NodeId | null;
  selectedIssueId: string | null;
  activeStep: number;
  /** Onderdeel waar de muis/vinger nu boven is (voor de tooltip). */
  hovered: Hovered | null;

  setConnectionType: (type: ConnectionType) => void;
  setHasExtender: (value: boolean) => void;
  focusNode: (id: NodeId | null) => void;
  setHovered: (hovered: Hovered | null) => void;
  selectIssue: (id: string) => void;
  setStep: (index: number) => void;
  backToExplore: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  mode: 'explore',
  connectionType: 'fiber',
  hasExtender: false,
  focusNodeId: null,
  selectedIssueId: null,
  activeStep: 0,
  hovered: null,

  setConnectionType: (connectionType) =>
    set((s) => {
      // Geldt het gekozen probleem niet voor dit verbindingstype? Dan terug naar verkennen.
      const issue = getIssue(s.selectedIssueId);
      if (s.mode === 'issue' && issue?.connectionTypes.includes(connectionType)) return { connectionType };
      return { connectionType, mode: 'explore', selectedIssueId: null, activeStep: 0 };
    }),
  setHasExtender: (hasExtender) =>
    // Zonder SuperWifi-punt valt de focus erop weg.
    set((s) => ({ hasExtender, focusNodeId: !hasExtender && s.focusNodeId === 'extender' ? null : s.focusNodeId })),
  focusNode: (focusNodeId) => set({ focusNodeId }),
  setHovered: (hovered) => set({ hovered }),
  selectIssue: (selectedIssueId) => {
    const issue = getIssue(selectedIssueId);
    if (!issue) return;
    set({ mode: 'issue', selectedIssueId, activeStep: 0, focusNodeId: issueStepFocus(issue, 0), hovered: null });
  },
  setStep: (step) =>
    set((s) => {
      const issue = getIssue(s.selectedIssueId);
      if (!issue) return {};
      const activeStep = Math.max(0, Math.min(issueStepCount(issue) - 1, step));
      return { activeStep, focusNodeId: issueStepFocus(issue, activeStep) };
    }),
  backToExplore: () => set({ mode: 'explore', selectedIssueId: null, activeStep: 0, focusNodeId: null }),
}));
