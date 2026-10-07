import { create } from 'zustand';
import type { ConnectionType, NodeId } from '../content/types';

export type Mode = 'explore' | 'issue';

type AppState = {
  mode: Mode;
  connectionType: ConnectionType;
  /** Onderdeel waar de camera op gericht is (null = overzicht). */
  focusNodeId: NodeId | null;
  selectedIssueId: string | null;
  activeStep: number;

  setConnectionType: (type: ConnectionType) => void;
  focusNode: (id: NodeId | null) => void;
  selectIssue: (id: string) => void;
  setStep: (index: number) => void;
  backToExplore: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  mode: 'explore',
  connectionType: 'fiber',
  focusNodeId: null,
  selectedIssueId: null,
  activeStep: 0,

  setConnectionType: (connectionType) =>
    // Een ander verbindingstype kan andere problemen hebben; begin opnieuw met verkennen.
    set({ connectionType, mode: 'explore', selectedIssueId: null, activeStep: 0 }),
  focusNode: (focusNodeId) => set({ focusNodeId }),
  selectIssue: (selectedIssueId) => set({ mode: 'issue', selectedIssueId, activeStep: 0 }),
  setStep: (activeStep) => set({ activeStep }),
  backToExplore: () => set({ mode: 'explore', selectedIssueId: null, activeStep: 0, focusNodeId: null }),
}));
