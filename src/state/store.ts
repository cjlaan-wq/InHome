import { create } from 'zustand';
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
    // Een ander verbindingstype kan andere problemen hebben; begin opnieuw met verkennen.
    set({ connectionType, mode: 'explore', selectedIssueId: null, activeStep: 0 }),
  setHasExtender: (hasExtender) =>
    // Zonder SuperWifi-punt valt de focus erop weg.
    set((s) => ({ hasExtender, focusNodeId: !hasExtender && s.focusNodeId === 'extender' ? null : s.focusNodeId })),
  focusNode: (focusNodeId) => set({ focusNodeId }),
  setHovered: (hovered) => set({ hovered }),
  selectIssue: (selectedIssueId) => set({ mode: 'issue', selectedIssueId, activeStep: 0 }),
  setStep: (activeStep) => set({ activeStep }),
  backToExplore: () => set({ mode: 'explore', selectedIssueId: null, activeStep: 0, focusNodeId: null }),
}));
